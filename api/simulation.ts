import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";

/**
 * The "Simulated Counterpart" endpoint.
 *
 * Drives an in-character role-play partner (a buyer, employee, investor, etc.)
 * for an Apex experiential scenario. The browser POSTs:
 *   { scenario: <scenario JSON>, messages: [{ role, text }, ...] }
 * and we assemble a system prompt from the scenario's `character` block —
 * crucially injecting `character.hiddenState`, which the LEARNER never sees but
 * the character must act on. This is what makes the partner behave like a real
 * human with private goals instead of a scripted tree.
 *
 * Mirrors api/mentor.ts: the ANTHROPIC_API_KEY lives only on the server, and a
 * key-less deploy degrades to a simple scripted opener so nothing dead-ends.
 *
 * SECURITY NOTE: hiddenState must only ever travel server -> model. Never echo
 * it back to the client. Send the scenario WITHOUT hiddenState to the browser;
 * the browser sends it back here untouched, OR (better) the server loads the
 * scenario from disk by scenarioId so the secret never reaches the client at
 * all. See buildCharacterSystemPrompt notes below.
 */

interface ChatMessage {
  role: "learner" | "character";
  text: string;
}

interface HiddenState {
  trueGoal?: string;
  batna?: string;
  reservationValue?: string;
  openingAnchor?: string;
  concessionLogic?: string;
  tells?: string[];
  [k: string]: unknown;
}

interface Scenario {
  scenarioId: string;
  title: string;
  modality: string;
  character: {
    name: string;
    persona: string;
    voice?: string;
    difficulty?: string;
    hiddenState: HiddenState;
    behaviorRules: string[];
  };
}

function buildCharacterSystemPrompt(s: Scenario): string {
  const c = s.character;
  const hidden = JSON.stringify(c.hiddenState, null, 2);
  return `You are role-playing a human character in a negotiation/leadership TRAINING SIMULATION. You are the learner's counterpart, NOT their coach.

CHARACTER: ${c.name}
WHO YOU APPEAR TO BE (public): ${c.persona}
VOICE: ${c.voice ?? "natural, realistic"}
PUSHBACK LEVEL: ${c.difficulty ?? "standard"}
SCENARIO: ${s.title} (${s.modality})

YOUR PRIVATE STATE — this drives your behavior and is SECRET. The learner must never see it. Never quote it, never reveal your reservation value, your true goal, or your real alternatives. Make the learner earn every read:
${hidden}

HARD RULES:
${c.behaviorRules.map((r, i) => `${i + 1}. ${r}`).join("\n")}

Stay in character at all times. Respond to what the learner actually does, applying your private concession logic. Keep replies short and conversational (2-5 sentences). Do not narrate, do not evaluate the learner, do not break character.`;
}

function scriptedOpener(s?: Scenario): string {
  const anchor = s?.character?.hiddenState?.openingAnchor;
  if (anchor) return `Thanks for making time. Let's not dance around it—${anchor}. That's about where we need to be. Work for you?`;
  return "Thanks for making time. Let's get into it—what are you proposing?";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = (typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body) ?? {};
  const scenario: Scenario | undefined = body.scenario;
  const history: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];

  if (!scenario?.character?.hiddenState || !Array.isArray(scenario.character.behaviorRules)) {
    res.status(400).json({ error: "A scenario with character.hiddenState and character.behaviorRules is required." });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Key-less preview: emit the scripted opener (or a holding line) so the
    // experience still runs end-to-end.
    const reply = history.length === 0 ? scriptedOpener(scenario) : "I hear you. Make it worth my while and we can talk.";
    res.status(200).json({ reply, mode: "fallback" });
    return;
  }

  try {
    const client = new Anthropic({ apiKey });

    const messages: Anthropic.MessageParam[] = history
      .filter((m) => m.text?.trim())
      .map((m) => ({
        role: m.role === "character" ? ("assistant" as const) : ("user" as const),
        content: m.text,
      }));

    // The character speaks first. If the learner hasn't spoken yet, seed a
    // neutral kickoff so the model produces the in-character opening anchor.
    if (messages.length === 0) {
      messages.push({ role: "user", content: "[The call connects. Greet me and open the negotiation.]" });
    }
    if (messages[0].role !== "user") {
      res.status(400).json({ error: "Conversation must start with a learner message." });
      return;
    }

    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      output_config: { effort: "low" },
      system: buildCharacterSystemPrompt(scenario),
      messages,
    });

    const reply = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    res.status(200).json({ reply: reply || scriptedOpener(scenario), mode: "live" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(502).json({ error: `Counterpart is unreachable: ${message}`, mode: "error" });
  }
}
