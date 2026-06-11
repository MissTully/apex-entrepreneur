import { useRef, useState, useEffect } from "react";
import { Fish, X, Send, Loader2 } from "lucide-react";

interface Message {
  role: "mentor" | "founder";
  text: string;
}

const GREETING: Message = {
  role: "mentor",
  text: "I'm the Apex Mentor — the oldest shark in the Gulf. Tell me what you're working on, and I'll give you a Breaching prompt to expose hidden risk, or a Diving prompt to go deep on the data.",
};

const SCRIPTED_FALLBACK = [
  "Breaching prompt: what is the one assumption in this plan that, if wrong, sinks everything? Name it before the market does.",
  "Diving prompt: show me the evidence. What single data point are you anchoring this decision on, and how confident are you in it?",
];

/**
 * The "Apex Mentor" panel.
 *
 * Posts the conversation to /api/mentor, which calls Claude server-side (the API
 * key never reaches the browser). If the endpoint is unavailable — e.g. running
 * the bare Vite dev server with no backend — it falls back to scripted prompts so
 * the experience never dead-ends.
 */
export default function MentorPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = draft.trim();
    if (!text || loading) return;

    const nextHistory: Message[] = [...messages, { role: "founder", text }];
    setMessages(nextHistory);
    setDraft("");
    setLoading(true);

    // Send only the real exchange (skip the canned greeting) to the mentor.
    const payload = nextHistory.filter((m) => m !== GREETING);

    try {
      const res = await fetch("/api/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { reply?: string };
      const reply = data.reply?.trim() || SCRIPTED_FALLBACK[payload.length % SCRIPTED_FALLBACK.length];
      setMessages((m) => [...m, { role: "mentor", text: reply }]);
    } catch {
      const reply = SCRIPTED_FALLBACK[payload.length % SCRIPTED_FALLBACK.length];
      setMessages((m) => [...m, { role: "mentor", text: reply }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-tide to-glow text-abyss shadow-lg shadow-glow/30 transition hover:scale-105 animate-drift"
        aria-label="Open the Apex Mentor"
      >
        {open ? <X className="h-6 w-6" /> : <Fish className="h-6 w-6" />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[28rem] w-[22rem] flex-col overflow-hidden rounded-2xl border border-glow/30 bg-deep/95 shadow-2xl backdrop-blur-md animate-fade-up">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
            <Fish className="h-5 w-5 text-glow" />
            <div>
              <p className="font-display text-sm font-semibold leading-none">Apex Mentor</p>
              <p className="text-xs text-foam/50">Oldest shark in the Gulf</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm ${
                  m.role === "mentor" ? "bg-surface/70 text-foam" : "ml-auto bg-glow/20 text-foam"
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-foam/50">
                <Loader2 className="h-4 w-4 animate-spin" /> The mentor is circling…
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-white/10 p-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              disabled={loading}
              placeholder="Ask the Apex Mentor…"
              className="flex-1 rounded-lg border border-white/10 bg-abyss/60 px-3 py-2 text-sm text-foam placeholder:text-foam/40 focus:border-glow/50 focus:outline-none disabled:opacity-50"
            />
            <button onClick={send} disabled={loading} className="btn-primary px-3 py-2 disabled:opacity-50" aria-label="Send">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
