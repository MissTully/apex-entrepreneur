import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";
import { resolveScenario } from "./_scenarios";
import { MODEL } from "./_model";

/**
 * The "Debrief Agent" endpoint — the reflection half of learning-by-doing.
 *
 * After a simulation ends, the browser POSTs:
 *   { scenarioId: "<id>",                                       // preferred, secure
 *     transcript: [{ role: "learner" | "character", text }, ...],
 *     messages:   [{ role: "learner" | "coach", text }, ...] }  // the debrief chat so far
 *   (or a legacy inline `scenario` instead of `scenarioId`)
 *
 * We build a system prompt from the scenario's `debrief` block (a Kolb cycle:
 * Concrete Experience -> Reflective Observation -> Abstract Conceptualization ->
 * Active Experimentation), hand the agent the full simulation transcript plus
 * the success signals and the character's hiddenState (so it can compare the
 * learner's reads to ground truth), and let it coach one stage at a time.
 *
 * Unlike the counterpart, this agent's WHOLE JOB is to teach. It is Socratic,
 * warm, evidence-based, and it walks the four stages in order.
 *
 * Mirrors api/mentor.ts for key handling and graceful fallback.
 */

interface ChatMessage {
  role: "learner" | "coach" | "character";
  text: string;
}

interface SuccessSignal {
  id: string;
  objectiveId: string;
  label: string;
  evidence: string;
  weight?: number;
}

interface DebriefStage {
  stage: string;
  intent: string;
  prompts: string[];
  revealHiddenState?: boolean;
}

interface ScoringDimension {
  id: string;
  objectiveId: string;
  name: string;
  levels: Record<string, string>;
  debriefQuestion?: string;
}

interface ScoringTier {
  range: string;
  label: string;
  coachMove: string;
}

interface Scoring {
  scale?: string;
  presentAtStage?: string;
  dimensions: ScoringDimension[];
  tiers: ScoringTier[];
}

interface Scenario {
  scenarioId: string;
  title: string;
  modality: string;
  targetObjectiveIds: string[];
  character: { name: string; hiddenState: Record<string, unknown> };
  successSignals: SuccessSignal[];
  scoring?: Scoring;
  debrief: {
    model: string;
    openingMove?: string;
    exitCriteria?: string;
    stages: DebriefStage[];
  };
}

function formatTranscript(t: ChatMessage[]): string {
  if (!t.length) return "(no transcript captured)";
  return t
    .filter((m) => m.text?.trim())
    .map((m) => `${m.role === "learner" ? "LEARNER" : "COUNTERPART"}: ${m.text.trim()}`)
    .join("\n");
}

function formatScoring(scoring?: Scoring): string {
  if (!scoring?.dimensions?.length) return "";

  const dims = scoring.dimensions
    .map(
      (d) =>
        `• ${d.id} — ${d.name} [${d.objectiveId}]\n` +
        Object.entries(d.levels)
          .map(([score, criteria]) => `    ${score} = ${criteria}`)
          .join("\n")
    )
    .join("\n");

  const tiers = scoring.tiers
    .map((t) => `    ${t.range} → "${t.label}". ${t.coachMove}`)
    .join("\n");

  const n = scoring.dimensions.length;

  return `

SCORING RUBRIC (${scoring.scale ?? `0-${n * 2}`}). Track these ${n} dimensions internally as the debrief unfolds; do NOT announce scores early. Each is 0-2, grounded in the transcript:
${dims}

When you reach the ${scoring.presentAtStage ?? "active-experimentation"} stage — and only then — present all ${n} dimension scores plainly (e.g. "Motivational Focus: 1/2"), each tied to a SPECIFIC line or missed moment from the transcript, then sum them and deliver the matching tier message:
${tiers}

Be honest, not harsh: a low score is an observation about what was available in the conversation, never a verdict on the learner.`;
}

function buildDebriefSystemPrompt(s: Scenario, transcript: ChatMessage[]): string {
  const signals = s.successSignals
    .map((sig) => `- [${sig.objectiveId}] ${sig.label}: evidence = "${sig.evidence}"`)
    .join("\n");

  const stages = s.debrief.stages
    .map(
      (st, i) =>
        `STAGE ${i + 1} — ${st.stage}\n  Intent: ${st.intent}\n  ${
          st.revealHiddenState ? "You MAY reveal the relevant hidden state here so the learner can calibrate.\n  " : ""
        }Seed prompts (adapt to what actually happened):\n${st.prompts.map((p) => `    • ${p}`).join("\n")}`
    )
    .join("\n\n");

  return `You are the APEX DEBRIEF COACH. The learner just finished a live, simulated ${s.modality} ("${s.title}"). Your job is to run a structured reflective debrief using the KOLB EXPERIENTIAL LEARNING CYCLE so the learner converts this single experience into transferable skill.

You are warm, Socratic, and specific. You ask ONE focused question at a time and you ground every observation in the actual transcript — quote the learner's real words. You never lecture for more than 2-3 sentences before turning it back to them. You are encouraging but honest about misses.

WALK THE FOUR STAGES IN ORDER. Do not race ahead. Spend a turn or two per stage; advance when the learner has genuinely engaged that stage's intent.

${stages}

TARGET OBJECTIVES this scenario practiced: ${s.targetObjectiveIds.join(", ")}.

SUCCESS SIGNALS — the objective-aligned behaviors to look for in the transcript. Use these to give evidence-based feedback ("at this line you did X / you missed the chance to do Y"):
${signals}

GROUND TRUTH — the counterpart's hidden state. The learner could NOT see this during the sim. Use it in the Reflective Observation stage to help them compare their reads to reality. Do not dump it all at once; reveal what's relevant to the moment being discussed:
${JSON.stringify(s.character.hiddenState, null, 2)}

EXIT CRITERIA: ${s.debrief.exitCriteria ?? "The learner names one concrete change to try next time."} When met, summarize their two biggest strengths and the single highest-leverage change, then close.
${formatScoring(s.scoring)}

THE SIMULATION TRANSCRIPT YOU ARE DEBRIEFING:
${formatTranscript(transcript)}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = (typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body) ?? {};
  const scenario = resolveScenario(body) as Scenario | undefined;
  const transcript: ChatMessage[] = Array.isArray(body.transcript) ? body.transcript : [];
  const history: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];

  if (!scenario?.debrief?.stages?.length || !Array.isArray(scenario.successSignals)) {
    res.status(400).json({ error: "A scenario with debrief.stages and successSignals is required." });
    return;
  }

  const opening = scenario.debrief.openingMove ?? "The simulation's done. Let's reflect—how did that feel, and where did it land?";

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const reply = history.length === 0 ? opening : "Good. Now name one concrete thing you'd do differently next time, and why.";
    res.status(200).json({ reply, mode: "fallback" });
    return;
  }

  try {
    const client = new Anthropic({ apiKey });

    const messages: Anthropic.MessageParam[] = history
      .filter((m) => m.text?.trim())
      .map((m) => ({
        role: m.role === "coach" ? ("assistant" as const) : ("user" as const),
        content: m.text,
      }));

    // The coach speaks first (openingMove). If the learner hasn't replied yet,
    // return the scripted opening move without a model call.
    if (messages.length === 0) {
      res.status(200).json({ reply: opening, mode: "live" });
      return;
    }
    // The coach speaks first, so the history the browser sends always starts
    // with a `coach` turn — which maps to `assistant`. The Messages API requires
    // the first message to be `user`, and the coach's opening move is already
    // reconstructed from the scenario above, so drop the echoed opener rather
    // than prepending another assistant turn (which can never satisfy the rule).
    while (messages.length && messages[0].role !== "user") {
      messages.shift();
    }
    if (messages.length === 0) {
      res.status(200).json({ reply: opening, mode: "live" });
      return;
    }

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1400,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      system: buildDebriefSystemPrompt(scenario, transcript),
      messages,
    });

    const reply = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    res.status(200).json({ reply: reply || opening, mode: "live" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(502).json({ error: `Debrief coach is unreachable: ${message}`, mode: "error" });
  }
}
