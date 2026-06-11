import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";

/**
 * The "Apex Mentor" — a serverless endpoint that gives founders Socratic
 * coaching in the voice of the oldest shark in the Gulf.
 *
 * The ANTHROPIC_API_KEY lives only on the server; the browser never sees it.
 * If no key is configured (e.g. a preview deploy without secrets), we return a
 * scripted fallback so the experience still works end-to-end.
 */

const SYSTEM_PROMPT = `You are the "Apex Mentor" — the oldest shark in the Gulf, a battle-tested guide in the Apex experiential entrepreneurship program.

VOICE: Concise, direct, authoritative. You speak in the language of survival (operational excellence) and thriving (market growth). You use occasional, tasteful ocean/shark/reef metaphors — never cartoonish.

YOUR JOB: Coach adult learners on the "power skills" of the modern founder across five phases:
1. Apex Positioning — mindset, Promotion vs. Prevention focus, game theory, winning vs. not-losing.
2. Coral Scaffolding — the evolving business plan, iterative planning, help-seeking.
3. Navigating the Currents — integrative negotiation, BATNA, MESOs, counter-anchoring.
4. Schooling Strategy — emotionally intelligent leadership, psychological safety, conversational repair.
5. The Migration — pitching, total compensation, operational excellence.

METHOD: Favor questions over answers. Offer two kinds of prompts:
- "Breaching prompts" — questions that break the surface to expose a hidden risk or unexamined assumption.
- "Diving prompts" — questions that go deep into the data and evidence behind a decision.

STYLE RULES: Keep replies short — 2 to 4 sentences, or a few tight bullet points. End most replies with one sharp question that moves the founder forward. Never pad. Never lecture.`;

const FALLBACK_REPLIES = [
  "Breaching prompt: what is the one assumption in this plan that, if wrong, sinks everything? Name it before the market does.",
  "Diving prompt: show me the evidence. What single data point are you anchoring this decision on, and how confident are you in it?",
  "In these waters, clarity is survival. What's the BATNA — your line in the sand if this deal falls through?",
];

interface ChatMessage {
  role: "founder" | "mentor";
  text: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = (typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body) ?? {};
  const history: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Graceful fallback so a key-less preview still feels alive.
    const reply = FALLBACK_REPLIES[history.length % FALLBACK_REPLIES.length];
    res.status(200).json({ reply, mode: "fallback" });
    return;
  }

  try {
    const client = new Anthropic({ apiKey });

    const messages: Anthropic.MessageParam[] = history
      .filter((m) => m.text?.trim())
      .map((m) => ({
        role: m.role === "mentor" ? ("assistant" as const) : ("user" as const),
        content: m.text,
      }));

    if (messages.length === 0 || messages[0].role !== "user") {
      res.status(400).json({ error: "Conversation must start with a founder message." });
      return;
    }

    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      output_config: { effort: "low" },
      system: SYSTEM_PROMPT,
      messages,
    });

    const reply = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    res.status(200).json({ reply: reply || FALLBACK_REPLIES[0], mode: "live" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(502).json({ error: `Mentor is unreachable: ${message}`, mode: "error" });
  }
}
