/**
 * Server-side scenario registry.
 *
 * The `_` prefix tells Vercel this is a helper module, NOT a routable endpoint.
 *
 * WHY THIS EXISTS — security. A scenario's `character.hiddenState` (the
 * counterpart's secret goals, true ceiling, concession logic) must NEVER reach
 * the browser, or a curious learner can read Dale's cards in devtools and the
 * whole "earn every read" design collapses. So the authoritative scenario files
 * live here, on the server, and the browser only ever sends a `scenarioId`.
 * The simulation/debrief endpoints look the full scenario up by id and inject
 * the secrets straight into the model's system prompt — server -> model only.
 *
 * The JSON files in manifests/scenarios/ remain the single source of truth (and
 * are schema-validated). We import them so there is no second copy to drift.
 *
 * Backward compatibility: the endpoints still accept an inline `scenario` in the
 * POST body (the original self-contained behavior). `resolveScenario` prefers a
 * server-side lookup by id and falls back to the inline body.
 */

import enteringTheReefS1 from "../manifests/scenarios/entering-the-reef-S1.json";
import apexPositioningS1 from "../manifests/scenarios/apex-positioning-S1.json";
import navigatingTheCurrentsS1 from "../manifests/scenarios/navigating-the-currents-S1.json";

// Scenarios are validated against manifests/scenario.schema.json, so we treat
// them as loosely-typed records here and let each endpoint narrow what it needs.
export type AnyScenario = Record<string, unknown>;

const REGISTRY: Record<string, AnyScenario> = {
  "entering-the-reef-S1": enteringTheReefS1 as AnyScenario,
  "apex-positioning-S1": apexPositioningS1 as AnyScenario,
  "navigating-the-currents-S1": navigatingTheCurrentsS1 as AnyScenario,
};

/** Look up a full scenario (including hiddenState) by its stable id. */
export function getScenarioById(id: string): AnyScenario | undefined {
  return REGISTRY[id];
}

/**
 * Resolve the scenario for a request. Prefers the secure server-side lookup by
 * `body.scenarioId`; falls back to an inline `body.scenario` for compatibility.
 */
export function resolveScenario(body: {
  scenarioId?: string;
  scenario?: AnyScenario;
}): AnyScenario | undefined {
  if (body?.scenarioId && REGISTRY[body.scenarioId]) return REGISTRY[body.scenarioId];
  if (body?.scenario) return body.scenario;
  return undefined;
}

/**
 * Strip every secret from a scenario, leaving only what is safe to show the
 * learner (the brief, the public persona, scoring dimension labels). Use this if
 * you ever serve a scenario to the browser. NOT used by the chat endpoints —
 * they keep the full object server-side — but provided so the client never has
 * to receive `hiddenState`, `successSignals.evidence`, or the debrief internals.
 */
export function toPublicScenario(s: AnyScenario): AnyScenario {
  const character = (s.character ?? {}) as Record<string, unknown>;
  const scoring = (s.scoring ?? null) as Record<string, unknown> | null;

  const publicScoring =
    scoring && Array.isArray(scoring.dimensions)
      ? {
          scale: scoring.scale,
          dimensions: (scoring.dimensions as Record<string, unknown>[]).map((d) => ({
            id: d.id,
            objectiveId: d.objectiveId,
            name: d.name,
          })),
        }
      : null;

  return {
    scenarioId: s.scenarioId,
    moduleId: s.moduleId,
    title: s.title,
    tagline: s.tagline,
    modality: s.modality,
    estimatedMinutes: s.estimatedMinutes,
    targetObjectiveIds: s.targetObjectiveIds,
    learnerBrief: s.learnerBrief,
    character: {
      name: character.name,
      persona: character.persona,
      voice: character.voice,
      difficulty: character.difficulty,
    },
    scoring: publicScoring,
  };
}
