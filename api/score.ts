import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { resolveScenario } from "./_scenarios";

/**
 * The "Score Extraction" endpoint.
 *
 * After the debrief, the browser POSTs:
 *   { scenarioId: "<id>", transcript: [{ role, text }, ...] }
 * and we ask Claude to read the simulation transcript against the scenario's
 * scoring rubric (each dimension 0-2), the success signals, and the
 * counterpart's hidden state (ground truth), and return ONLY a JSON score
 * object. This drives the visual score card and the Phase-2 unlock gate.
 *
 * It is deliberately separate from /api/debrief: the debrief is a conversation;
 * this is a single constrained, machine-readable judgement. Mirrors mentor.ts
 * for key handling and graceful fallback.
 *
 * SECURITY: the browser sends only a scenarioId; the rubric, hiddenState, and
 * success signals are loaded server-side and never reach the client.
 */

interface ChatMessage {
  role: "learner" | "character" | "coach";
  text: string;
}

interface ScoringDimension {
  id: string;
  objectiveId: string;
  name: string;
  levels: Record<string, string>;
}

interface Scoring {
  scale?: string;
  maxTotal?: number;
  unlockThreshold?: number;
  dimensions: ScoringDimension[];
  tiers: { range: string; label: string; coachMove: string }[];
}

interface Scenario {
  scenarioId: string;
  title: string;
  character: { name: string; hiddenState: Record<string, unknown> };
  successSignals: { objectiveId: string; label: string; evidence: string }[];
  scoring?: Scoring;
}

function formatTranscript(t: ChatMessage[]): string {
  if (!t.length) return "(no transcript captured)";
  return t
    .filter((m) => m.text?.trim())
    .map((m) => `${m.role === "learner" ? "LEARNER (Jordan)" : "COUNTERPART"}: ${m.text.trim()}`)
    .join("\n");
}

/** The tier whose range contains `total`. Ranges are "0-3", "4-5", "8", etc. */
function tierFor(total: number, tiers: Scoring["tiers"]) {
  for (const t of tiers) {
    const [lo, hi] = t.range.includes("-") ? t.range.split("-").map(Number) : [Number(t.range), Number(t.range)];
    if (total >= lo && total <= hi) return t;
  }
  return tiers[tiers.length - 1];
}

function buildScoringPrompt(s: Scenario, scoring: Scoring, transcript: ChatMessage[]): string {
  const dims = scoring.dimensions
    .map(
      (d) =>
        `"${d.id}" — ${d.name} [${d.objectiveId}]\n` +
        Object.entries(d.levels)
          .map(([score, criteria]) => `    ${score} = ${criteria}`)
          .join("\n")
    )
    .join("\n");

  const signals = s.successSignals
    .map((sig) => `- [${sig.objectiveId}] ${sig.label}: ${sig.evidence}`)
    .join("\n");

  return `You are scoring a completed negotiation training simulation ("${s.title}"). Read the transcript against the rubric and return ONE JSON object and nothing else.

SCORE EACH DIMENSION 0, 1, or 2 using these criteria exactly:
${dims}

SUCCESS SIGNALS (objective-aligned behaviors to look for as evidence):
${signals}

GROUND TRUTH — the counterpart's hidden state (the learner could NOT see this; use it to judge how well they read the room):
${JSON.stringify(s.character.hiddenState, null, 2)}

TRANSCRIPT:
${formatTranscript(transcript)}

Be fair and evidence-based; when a dimension's behavior never appears in the transcript, score it 0. Output ONLY valid JSON in exactly this shape (dimension keys are the ids above), no prose, no markdown fence:
{
${scoring.dimensions.map((d) => `  "${d.id}": <0-2>`).join(",\n")},
  "takeaway": "<one specific sentence the learner can carry into their next negotiation>"
}`;
}

function fallbackPayload(scoring: Scoring) {
  // No key / no model: we cannot judge the transcript. Return an un-scored
  // shape so the UI can show the coached debrief and let the learner replay or
  // continue without a fabricated number.
  return {
    mode: "fallback" as const,
    scored: false,
    scale: scoring.scale ?? "0-8",
    maxTotal: scoring.maxTotal ?? 8,
    unlockThreshold: scoring.unlockThreshold ?? 6,
    dimensions: scoring.dimensions.map((d) => ({ id: d.id, name: d.name, objectiveId: d.objectiveId, score: null })),
    total: null,
    tier: null,
    takeaway: null,
    phaseUnlocked: null,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = (typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body) ?? {};
  const scenario = resolveScenario(body) as Scenario | undefined;
  const transcript: ChatMessage[] = Array.isArray(body.transcript) ? body.transcript : [];

  const scoring = scenario?.scoring;
  if (!scoring?.dimensions?.length || !Array.isArray(scoring.tiers)) {
    res.status(400).json({ error: "A scenario with a scoring rubric is required." });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(200).json(fallbackPayload(scoring));
    return;
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 600,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      system: buildScoringPrompt(scenario as Scenario, scoring, transcript),
      messages: [{ role: "user", content: "Score the transcript now. Output only the JSON object." }],
    });

    const raw = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    // Pull the first {...} block out, in case the model wrapped it.
    const match = raw.match(/\{[\s\S]*\}/);
    const parsed = match ? JSON.parse(match[0]) : {};

    const dimensions = scoring.dimensions.map((d) => {
      const v = Number(parsed[d.id]);
      const score = Number.isFinite(v) ? Math.max(0, Math.min(2, Math.round(v))) : 0;
      return { id: d.id, name: d.name, objectiveId: d.objectiveId, score };
    });
    const total = dimensions.reduce((sum, d) => sum + d.score, 0);
    const threshold = scoring.unlockThreshold ?? 6;
    const tier = tierFor(total, scoring.tiers);

    res.status(200).json({
      mode: "live",
      scored: true,
      scale: scoring.scale ?? "0-8",
      maxTotal: scoring.maxTotal ?? scoring.dimensions.length * 2,
      unlockThreshold: threshold,
      dimensions,
      total,
      tier: tier ? { range: tier.range, label: tier.label } : null,
      takeaway: typeof parsed.takeaway === "string" ? parsed.takeaway : null,
      phaseUnlocked: total >= threshold,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(502).json({ error: `Scoring is unavailable: ${message}`, mode: "error" });
  }
}
