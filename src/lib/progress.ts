import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { PHASES } from '../data/curriculum';

/**
 * Learner progress through the phases.
 *
 * The simulation already computes an unlock gate (`phaseUnlocked` from
 * /api/score); this is where that result stops being ephemeral. One row per
 * learner per phase, written when a phase's simulation completes, read by the
 * Program grid, the Phase page, the Profile, and the certificate.
 *
 * DEGRADES GRACEFULLY. If `phase_progress` hasn't been created yet (see
 * docs/supabase-schema.sql), every read returns an empty map and every write is
 * a no-op that resolves cleanly. A cohort running on a database that predates
 * this table sees the app exactly as it behaved before — never an error screen.
 */

export type PhaseStatus = 'in_progress' | 'completed';

export interface PhaseProgress {
    phaseSlug: string;
    status: PhaseStatus;
    scoreTotal: number | null;
    scoreMax: number | null;
    unlocked: boolean;
    attempts: number;
    completedAt: string | null;
}

/** Progress keyed by phase slug. Absent key = not started. */
export type ProgressMap = Record<string, PhaseProgress>;

// Postgres "undefined_table"; PostgREST's own "table not found in schema cache".
const MISSING_TABLE = new Set(['42P01', 'PGRST205', 'PGRST106']);

function isMissingTable(error: PostgrestError): boolean {
    return MISSING_TABLE.has(error.code) || /phase_progress/i.test(error.message ?? '');
}

interface ProgressRow {
    phase_slug: string;
    status: PhaseStatus;
    score_total: number | null;
    score_max: number | null;
    unlocked: boolean;
    attempts: number;
    completed_at: string | null;
}

function toProgress(row: ProgressRow): PhaseProgress {
    return {
        phaseSlug: row.phase_slug,
        status: row.status,
        scoreTotal: row.score_total,
        scoreMax: row.score_max,
        unlocked: row.unlocked,
        attempts: row.attempts,
        completedAt: row.completed_at,
    };
}

/** Every phase this learner has touched. Empty map if the table isn't there. */
export async function fetchProgress(userId: string): Promise<ProgressMap> {
    const { data, error } = await supabase
        .from('phase_progress')
        .select('phase_slug, status, score_total, score_max, unlocked, attempts, completed_at')
        .eq('user_id', userId);

    if (error || !data) {
        if (error && !isMissingTable(error)) {
            console.warn('[apex] could not read phase progress:', error.message);
        }
        return {};
    }

    const map: ProgressMap = {};
    for (const row of data as ProgressRow[]) map[row.phase_slug] = toProgress(row);
    return map;
}

/**
 * Record the outcome of a phase's simulation.
 *
 * Called once when a learner reaches the end of a phase — the score screen for a
 * text scenario, or Finish for a voice one. A replay bumps `attempts` and keeps
 * the BEST score, so running it back can only ever help the learner.
 */
export async function recordPhaseCompletion(
    userId: string,
    phaseSlug: string,
    result: { scoreTotal?: number | null; scoreMax?: number | null; unlocked?: boolean } = {},
): Promise<void> {
    const existing = await supabase
        .from('phase_progress')
        .select('score_total, score_max, unlocked, attempts')
        .eq('user_id', userId)
        .eq('phase_slug', phaseSlug)
        .maybeSingle();

    if (existing.error && isMissingTable(existing.error)) return;

    const prev = existing.data as Pick<ProgressRow, 'score_total' | 'score_max' | 'unlocked' | 'attempts'> | null;
    const incoming = result.scoreTotal ?? null;
    const best = prev?.score_total != null && incoming != null ? Math.max(prev.score_total, incoming) : incoming ?? prev?.score_total ?? null;

    const { error } = await supabase.from('phase_progress').upsert(
        {
            user_id: userId,
            phase_slug: phaseSlug,
            status: 'completed' as PhaseStatus,
            score_total: best,
            score_max: result.scoreMax ?? prev?.score_max ?? null,
            // Once cleared, a gate stays cleared — a weaker replay never re-locks it.
            unlocked: !!result.unlocked || !!prev?.unlocked,
            attempts: (prev?.attempts ?? 0) + 1,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,phase_slug' },
    );

    if (error && !isMissingTable(error)) {
        console.warn('[apex] could not save phase progress:', error.message);
    }
}

/** How many of the program's phases this learner has completed. */
export function completedCount(progress: ProgressMap): number {
    return PHASES.filter((p) => progress[p.slug]?.status === 'completed').length;
}

/** True once every phase in the program is complete. */
export function hasCompletedAllPhases(progress: ProgressMap): boolean {
    return PHASES.every((p) => progress[p.slug]?.status === 'completed');
}
