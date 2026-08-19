import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  X,
  Send,
  Loader2,
  Anchor,
  ListChecks,
  PlayCircle,
  MessageSquareQuote,
  RotateCcw,
  ArrowRight,
  Compass,
  Flag,
  Sparkles,
  BarChart3,
  Mic,
  Film,
  Users,
} from "lucide-react";
import type { ScenarioBrief } from "../data/scenarioBriefs";
import { useAuth } from "../hooks/useAuth";
import { recordPhaseCompletion } from "../lib/progress";

// The ElevenLabs SDK is heavy (WebRTC). Load it only when a learner actually
// enters a voice conversation, so it never weighs down the main bundle.
const VoiceCall = lazy(() => import("./VoiceCall"));

/**
 * The full-screen Apex experiential simulation.
 *
 * Two AI agents, one screen, four phases (mapping the spec's 8-screen flow):
 *   1. BRIEF       — the learner reads the situation and their role/goal. By
 *                    design it gives NO hint of what's being measured, so the
 *                    learner behaves authentically. (Static; no model call.)
 *   2. SIMULATION  — a live, in-character negotiation with the counterpart via
 *                    /api/simulation. The counterpart speaks first.
 *   3. DEBRIEF     — a Socratic, Kolb-cycle reflection via /api/debrief. The
 *                    coach receives the transcript + (server-side) the
 *                    counterpart's hidden state and walks the four stages.
 *   4. SCORE       — a structured judgement via /api/score: a visual score card
 *                    across the four dimensions, a tiered takeaway, and the
 *                    Phase-2 unlock gate (total >= unlockThreshold) or a replay
 *                    gate below it.
 *
 * SECURITY: the browser only ever sends a `scenarioId`. The hidden state, the
 * success-signal evidence, and the scoring rubric all live server-side and
 * never reach this component.
 *
 * GRACEFUL FALLBACK: like MentorPanel, if /api is unavailable (the bare Vite dev
 * server, or a key-less preview) every call degrades to a scripted line, and
 * scoring returns an un-scored shape so nothing dead-ends.
 */

type Phase = "brief" | "sim" | "debrief" | "score";
type SimMsg = { role: "learner" | "character"; text: string };
type CoachMsg = { role: "learner" | "coach"; text: string };

interface ScoreDimension {
  id: string;
  name: string;
  objectiveId: string;
  score: number | null;
}
interface ScorePayload {
  scored: boolean;
  scale: string;
  maxTotal: number;
  unlockThreshold: number;
  dimensions: ScoreDimension[];
  total: number | null;
  tier: { range: string; label: string } | null;
  takeaway: string | null;
  phaseUnlocked: boolean | null;
}

const SOFT_TURN_CAP = 10;

/** Scripted lines used only when /api can't be reached. Keeps the demo alive. */
const SIM_FALLBACK_OPENER =
  "Jordan, appreciate you getting back to me. I've gone through the numbers with my partner and $8,400 is where we land — between the onboarding time and the fact that we're still testing whether this is the right fit. There are a couple other platforms we're looking at, so I need to know if this is something we can close this week.";
const SIM_FALLBACK_REPLIES = [
  "I hear you. But from where I sit it's software — help me understand what's in the $12,000 we're not seeing.",
  "Maybe. My partner's the one I have to sell on this, so give me something I can take back to him.",
  "Alright. Tell me why I shouldn't just go with the cheaper option and see how it goes.",
];
const DEBRIEF_FALLBACK_OPENER =
  "Call's done — nice work staying in the boat with him. I'm your debrief coach, not your judge; my job is to show you what was available in that conversation. Before we get analytical: how did that feel, and where did the deal actually land?";
const DEBRIEF_FALLBACK_REPLIES = [
  "Good. Point to the exact moment the tone shifted — what had you just said?",
  "Here's the thing most founders miss: Dale's $8,400 was a test, not his floor. What do you think he was really protecting?",
  "Name one concrete line you'll use next time a buyer counters low — and tell me why it beats firing back a number.",
];

export default function SimulationExperience({
  brief,
  phaseSlug,
  onClose,
  onContinue,
  onCompleted,
  nextCodename,
}: {
  brief: ScenarioBrief;
  /** The phase this simulation belongs to — the key progress is stored under. */
  phaseSlug: string;
  onClose: () => void;
  onContinue?: () => void;
  /** Fired once the phase is recorded as complete, so the page can refresh. */
  onCompleted?: () => void;
  nextCodename?: string;
}) {
  const [phase, setPhase] = useState<Phase>("brief");
  const [simMessages, setSimMessages] = useState<SimMsg[]>([]);
  const [coachMessages, setCoachMessages] = useState<CoachMsg[]>([]);
  const [score, setScore] = useState<ScorePayload | null>(null);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const openedSim = useRef(false);
  const openedDebrief = useRef(false);

  const { user } = useAuth();
  // One write per completed run. Cleared by runItBack so a genuine second
  // attempt is recorded (and can raise the learner's best score).
  const recorded = useRef(false);

  /**
   * Mark this phase complete. Called from the score screen (text scenarios) and
   * from Finish (voice scenarios, which are formative and produce no score).
   */
  const recordCompletion = useCallback(
    async (result: { scoreTotal?: number | null; scoreMax?: number | null; unlocked?: boolean } = {}) => {
      if (!user || recorded.current) return;
      recorded.current = true;
      await recordPhaseCompletion(user.id, phaseSlug, result);
      onCompleted?.();
    },
    [user, phaseSlug, onCompleted]
  );

  const learnerTurns = simMessages.filter((m) => m.role === "learner").length;
  const atSoftCap = learnerTurns >= SOFT_TURN_CAP;

  // When a scenario declares an ElevenLabs agent, the conversation runs as a
  // VOICE call handled by that agent (which coaches and closes on its own), so
  // the text composer and the text-transcript debrief/score steps don't apply.
  const voiceAgentId = brief.voiceAgentId;
  const isVoice = !!voiceAgentId;
  const close = onContinue ?? onClose;
  // Voice scenarios are formative: they produce no transcript to score, so
  // finishing the call is what completes the phase.
  const finish = () => {
    void recordCompletion();
    close();
  };
  // A voice scenario only gets the end-of-call paired-debrief screen when it
  // declares one (the negotiations, the Phase-2 plan session). A solo reflective
  // voice talk like Maren's Phase-0 beliefs conversation has none, so it just
  // finishes — "switch seats, partner's turn" doesn't apply there.
  const hasPairedDebrief = isVoice && !!brief.ui?.pairedDebrief;

  // Per-scenario presentation copy, with neutral fallbacks so a brief that omits
  // `ui` still renders sensibly.
  const counterpartName = brief.character.name;
  const replayLabel = brief.ui?.replayLabel ?? brief.title;

  // During the live chat phases, follow new messages to the bottom. The brief
  // and score are read top-to-bottom, so open them at the TOP instead of letting
  // this effect jump them down on mount.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Only the live TEXT chat follows new messages to the bottom. Voice screens
    // and the brief/score/paired-debrief are read top-to-bottom, so open at top.
    if (!isVoice && (phase === "sim" || phase === "debrief")) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    } else {
      el.scrollTo({ top: 0 });
    }
  }, [simMessages, coachMessages, loading, phase, isVoice]);

  // Lock body scroll + close on Escape while the overlay is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  /** POST to /api/simulation; resolve a counterpart reply (or a scripted one). */
  const fetchCounterpart = useCallback(
    async (history: SimMsg[]): Promise<string> => {
      try {
        const res = await fetch("/api/simulation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenarioId: brief.scenarioId, messages: history }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { reply?: string; mode?: string };
        if (data.mode === "fallback") setUsingFallback(true);
        if (!data.reply?.trim()) throw new Error("empty reply");
        return data.reply.trim();
      } catch {
        setUsingFallback(true);
        const learnerCount = history.filter((m) => m.role === "learner").length;
        const opener = brief.ui?.fallback?.simOpener ?? SIM_FALLBACK_OPENER;
        const replies = brief.ui?.fallback?.simReplies ?? SIM_FALLBACK_REPLIES;
        return learnerCount === 0 ? opener : replies[(learnerCount - 1) % replies.length];
      }
    },
    [brief]
  );

  /** POST to /api/debrief; resolve a coach reply (or a scripted one). */
  const fetchCoach = useCallback(
    async (history: CoachMsg[], transcript: SimMsg[]): Promise<string> => {
      try {
        const res = await fetch("/api/debrief", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenarioId: brief.scenarioId, transcript, messages: history }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { reply?: string; mode?: string };
        if (data.mode === "fallback") setUsingFallback(true);
        if (!data.reply?.trim()) throw new Error("empty reply");
        return data.reply.trim();
      } catch {
        setUsingFallback(true);
        const learnerCount = history.filter((m) => m.role === "learner").length;
        const opener = brief.ui?.fallback?.debriefOpener ?? DEBRIEF_FALLBACK_OPENER;
        const replies = brief.ui?.fallback?.debriefReplies ?? DEBRIEF_FALLBACK_REPLIES;
        return learnerCount === 0 ? opener : replies[(learnerCount - 1) % replies.length];
      }
    },
    [brief]
  );

  // Kick off the counterpart's opening line when the sim begins.
  useEffect(() => {
    if (phase !== "sim" || openedSim.current) return;
    openedSim.current = true;
    setLoading(true);
    fetchCounterpart([]).then((reply) => {
      setSimMessages([{ role: "character", text: reply }]);
      setLoading(false);
    });
  }, [phase, fetchCounterpart]);

  // Kick off the coach's opening move when the debrief begins.
  useEffect(() => {
    if (phase !== "debrief" || openedDebrief.current) return;
    openedDebrief.current = true;
    setLoading(true);
    fetchCoach([], simMessages).then((reply) => {
      setCoachMessages([{ role: "coach", text: reply }]);
      setLoading(false);
    });
  }, [phase, fetchCoach, simMessages]);

  async function send() {
    const text = draft.trim();
    if (!text || loading || phase === "brief" || phase === "score") return;
    setDraft("");

    if (phase === "sim") {
      const next: SimMsg[] = [...simMessages, { role: "learner", text }];
      setSimMessages(next);
      setLoading(true);
      const reply = await fetchCounterpart(next);
      setSimMessages([...next, { role: "character", text: reply }]);
      setLoading(false);
    } else {
      const next: CoachMsg[] = [...coachMessages, { role: "learner", text }];
      setCoachMessages(next);
      setLoading(true);
      const reply = await fetchCoach(next, simMessages);
      setCoachMessages([...next, { role: "coach", text: reply }]);
      setLoading(false);
    }
  }

  function endAndDebrief() {
    if (learnerTurns === 0) return;
    setPhase("debrief");
  }

  /** Move to the score screen and fetch the structured judgement. */
  async function goToScore() {
    setPhase("score");
    if (score) return; // already scored this run
    setScoreLoading(true);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId: brief.scenarioId, transcript: simMessages }),
      });
      const data = (await res.json()) as ScorePayload & { mode?: string };
      if (data.mode === "fallback") setUsingFallback(true);
      setScore(data);
      // Reaching the score screen means the learner ran the phase end to end.
      // An un-scored run (no API key) still counts as completed — it just
      // carries no number.
      await recordCompletion({
        scoreTotal: data.total,
        scoreMax: data.maxTotal,
        unlocked: !!data.phaseUnlocked,
      });
    } catch {
      setUsingFallback(true);
      setScore(null);
      await recordCompletion();
    } finally {
      setScoreLoading(false);
    }
  }

  function runItBack() {
    openedSim.current = false;
    openedDebrief.current = false;
    recorded.current = false;
    setSimMessages([]);
    setCoachMessages([]);
    setScore(null);
    setDraft("");
    setLoading(false);
    setPhase("brief");
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-abyss/95 backdrop-blur-md animate-fade-up">
      {/* ===== Header ===== */}
      <header className="flex items-center gap-4 border-b border-white/10 bg-deep/80 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2 text-glow">
          <Anchor className="h-5 w-5" />
          <span className="font-display text-sm font-bold sm:text-base">{brief.title}</span>
        </div>

        <PhaseTrail
          phase={phase}
          stepLabel={brief.ui?.simStepLabel ?? "Conversation"}
          isVoice={isVoice}
          showDebrief={hasPairedDebrief}
        />

        <div className="ml-auto flex items-center gap-2">
          {phase === "sim" && isVoice && hasPairedDebrief && (
            <button onClick={() => setPhase("debrief")} className="btn-primary px-3 py-2 text-sm">
              <Flag className="h-4 w-4" /> End &amp; debrief
            </button>
          )}
          {phase === "sim" && isVoice && !hasPairedDebrief && (
            <button onClick={finish} className="btn-primary px-3 py-2 text-sm">
              <Flag className="h-4 w-4" /> Finish{nextCodename ? ` · ${nextCodename}` : ""}
            </button>
          )}
          {phase === "sim" && !isVoice && (
            <button onClick={endAndDebrief} disabled={learnerTurns === 0} className="btn-primary px-3 py-2 text-sm disabled:opacity-40">
              <Flag className="h-4 w-4" /> End &amp; debrief
            </button>
          )}
          {(phase === "debrief" || phase === "score") && (
            <button onClick={runItBack} className="btn-ghost px-3 py-2 text-sm">
              <RotateCcw className="h-4 w-4" /> Run it back
            </button>
          )}
          <button onClick={onClose} aria-label="Close simulation" className="rounded-lg p-2 text-foam/60 transition hover:bg-white/10 hover:text-foam">
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* ===== Body ===== */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="container-apex max-w-3xl py-8">
          {/* Coaching/voice openers (Maren) get the warm setup screen; a voice
              role-play (Dale's negotiation) keeps the full role-play brief so the
              learner still knows their role, goal, and the givens. */}
          {phase === "brief" && isVoice && brief.orientation && (
            <VoiceSetupView brief={brief} onBegin={() => setPhase("sim")} />
          )}
          {phase === "brief" && (!isVoice || !brief.orientation) && (
            <BriefView brief={brief} isVoice={isVoice} onBegin={() => setPhase("sim")} />
          )}

          {phase === "sim" && isVoice && voiceAgentId && <VoiceView brief={brief} agentId={voiceAgentId} />}

          {phase === "debrief" && isVoice && (
            <PairedDebriefView brief={brief} nextCodename={nextCodename} onContinue={finish} onReplay={runItBack} />
          )}

          {(phase === "sim" || phase === "debrief") && !isVoice && (
            <ChatView phase={phase} brief={brief} simMessages={simMessages} coachMessages={coachMessages} loading={loading} />
          )}

          {phase === "score" && (
            <ScoreView
              score={score}
              loading={scoreLoading}
              nextCodename={nextCodename}
              onContinue={close}
              onReplay={runItBack}
              gate={brief.ui?.gate}
              replayLabel={replayLabel}
              dimensionNames={brief.scoringDimensions}
            />
          )}
        </div>
      </div>

      {/* ===== Composer (text sim + debrief only; voice has no text input) ===== */}
      {(phase === "sim" || phase === "debrief") && !isVoice && (
        <footer className="border-t border-white/10 bg-deep/80 px-4 py-3 sm:px-6">
          <div className="container-apex max-w-3xl px-0">
            {phase === "sim" && atSoftCap && (
              <p className="mb-2 text-center text-xs text-kelp">
                {brief.ui?.softCapNote ??
                  `You've covered real ground — a good moment to land it, or to end and debrief.`}
              </p>
            )}
            {phase === "debrief" && (
              <div className="mb-2 flex justify-center">
                <button onClick={goToScore} className="btn-ghost px-3 py-1.5 text-xs">
                  <BarChart3 className="h-3.5 w-3.5" /> See your score
                </button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                disabled={loading}
                rows={1}
                placeholder={phase === "sim" ? `Respond to ${counterpartName}…  (Enter to send, Shift+Enter for a new line)` : "Answer the coach…"}
                className="max-h-40 min-h-[2.75rem] flex-1 resize-none rounded-xl border border-white/10 bg-abyss/60 px-3 py-2.5 text-sm leading-relaxed text-foam placeholder:text-foam/40 focus:border-glow/50 focus:outline-none disabled:opacity-50"
              />
              <button onClick={send} disabled={loading || !draft.trim()} className="btn-primary h-[2.75rem] px-4 disabled:opacity-40" aria-label="Send">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            {usingFallback && (
              <p className="mt-2 text-center text-[11px] text-foam/35">
                Offline practice mode — scripted responses. Connect the API key for the live AI counterpart, coach, and scoring.
              </p>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Sub-views                                                        */
/* ---------------------------------------------------------------- */

function PhaseTrail({
  phase,
  stepLabel,
  isVoice,
  showDebrief,
}: {
  phase: Phase;
  stepLabel: string;
  isVoice: boolean;
  showDebrief: boolean;
}) {
  // Voice scenarios are a self-contained call (the agent coaches and closes), so
  // the text-transcript score step doesn't apply. Show the paired-debrief step
  // only when the scenario actually has one; a solo voice talk ends after Setup +
  // the call.
  const steps: { key: Phase; label: string }[] = isVoice
    ? [
        { key: "brief", label: "Setup" },
        { key: "sim", label: stepLabel },
        ...(showDebrief ? [{ key: "debrief" as Phase, label: "Debrief" }] : []),
      ]
    : [
        { key: "brief", label: "Brief" },
        { key: "sim", label: stepLabel },
        { key: "debrief", label: "Debrief" },
        { key: "score", label: "Score" },
      ];
  const order: Phase[] = ["brief", "sim", "debrief", "score"];
  const current = order.indexOf(phase);
  return (
    <div className="hidden items-center gap-2 sm:flex">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={s.key} className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                active ? "bg-glow/15 text-glow" : done ? "text-foam/60" : "text-foam/30"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-glow" : done ? "bg-foam/50" : "bg-foam/20"}`} />
              {s.label}
            </span>
            {i < steps.length - 1 && <span className="h-px w-4 bg-white/10" />}
          </div>
        );
      })}
    </div>
  );
}

function BriefView({ brief, isVoice = false, onBegin }: { brief: ScenarioBrief; isVoice?: boolean; onBegin: () => void }) {
  const lb = brief.learnerBrief;
  return (
    <div className="animate-fade-up space-y-8">
      <div>
        <span className="pill border-glow/40 bg-glow/10 text-glow">
          <Compass className="h-3.5 w-3.5" /> {brief.modality} · ~{brief.estimatedMinutes} min
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">{brief.title}</h1>
        <p className="mt-2 text-lg italic text-foam/80">&ldquo;{brief.tagline}&rdquo;</p>
      </div>

      {brief.prebriefVideo && <PrebriefVideo video={brief.prebriefVideo} />}

      <section className="card-reef">
        <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-glow">The situation</h2>
        <p className="mt-3 leading-relaxed text-foam/85">{lb.situation}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-abyss/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-foam/50">You are</p>
            <p className="mt-1 text-sm text-foam/90">{lb.yourRole}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-abyss/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-foam/50">Your goal</p>
            <p className="mt-1 text-sm text-foam/90">{lb.yourGoal}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-deep/70 p-6">
        <div className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-glow" />
          <h2 className="font-display text-lg font-semibold">What you know going in</h2>
        </div>
        <ul className="mt-4 space-y-2.5">
          {lb.givens.map((g, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-foam/80">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-glow/70" />
              {g}
            </li>
          ))}
        </ul>
      </section>

      <section className="glass-reef border border-white/10">
        <div className="flex items-center gap-3">
          {brief.character.avatar ? (
            <img
              src={brief.character.avatar}
              alt={brief.character.name}
              className="h-12 w-12 shrink-0 rounded-full object-cover object-top ring-1 ring-white/15"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-urchin/20 text-urchin">
              <MessageSquareQuote className="h-5 w-5" />
            </div>
          )}
          <div>
            <p className="font-display font-semibold">You'll be talking to {brief.character.name}</p>
            {brief.character.title && <p className="text-xs text-foam/50">{brief.character.title}</p>}
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-foam/75">{brief.character.persona}</p>
      </section>

      <div className="rounded-xl border border-glow/20 bg-glow/5 p-4 text-center">
        <p className="text-sm italic text-foam/80">Respond naturally. There are no right words — only choices.</p>
      </div>

      <div className="flex justify-center pt-1">
        <button onClick={onBegin} className="btn-primary px-6 py-3 text-base">
          {isVoice ? (
            <>
              <Mic className="h-5 w-5" /> Start the call <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            <>
              <PlayCircle className="h-5 w-5" /> Begin the {brief.ui?.simNoun ?? "conversation"} <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
      <p className="-mt-4 text-center text-xs text-foam/40">
        {isVoice
          ? `${brief.character.name} opens when the call connects. Allow microphone access when prompted — headphones recommended. Afterward, you'll debrief in pairs with a partner.`
          : `${brief.character.name} opens. End and debrief whenever you're ready. A debrief and score follow automatically.`}
      </p>
    </div>
  );
}

/**
 * The prebrief video shown on the Brief screen before a learner enters the
 * simulation. A lazy-loaded youtube-nocookie embed (privacy-friendly; nothing
 * loads or tracks until the learner presses play), with an optional heading and
 * caption underneath.
 */
function PrebriefVideo({ video }: { video: NonNullable<ScenarioBrief["prebriefVideo"]> }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-glow/20 bg-deep/70">
      <div className="aspect-video w-full bg-black/40">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?rel=0`}
          title={video.title ?? "Prebrief"}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      <div className="flex items-start gap-2.5 p-4">
        <Film className="mt-0.5 h-4 w-4 shrink-0 text-glow" />
        <div>
          <p className="font-display text-sm font-semibold">{video.title ?? "Watch the prebrief"}</p>
          {video.caption && <p className="mt-0.5 text-xs leading-relaxed text-foam/60">{video.caption}</p>}
        </div>
      </div>
    </section>
  );
}

/**
 * The voice scenario's SETUP screen — replaces the role-play "brief" for a
 * coaching/reflective conversation. There's no role to play and nothing scored;
 * this stages the learner as themselves (who they're talking to + how to show
 * up) and leads straight into the live call.
 */
function VoiceSetupView({ brief, onBegin }: { brief: ScenarioBrief; onBegin: () => void }) {
  const pointers = brief.learnerBrief.givens;
  return (
    <div className="animate-fade-up space-y-8">
      <div>
        <span className="pill border-glow/40 bg-glow/10 text-glow">
          <Mic className="h-3.5 w-3.5" /> {brief.modality} · ~{brief.estimatedMinutes} min
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">{brief.title}</h1>
        <p className="mt-2 text-lg italic text-foam/80">&ldquo;{brief.tagline}&rdquo;</p>
      </div>

      <section className="glass-reef border border-white/10">
        <div className="flex items-center gap-3">
          {brief.character.avatar ? (
            <img
              src={brief.character.avatar}
              alt={brief.character.name}
              className="h-12 w-12 shrink-0 rounded-full object-cover object-top ring-1 ring-white/15"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-urchin/20 text-urchin">
              <MessageSquareQuote className="h-5 w-5" />
            </div>
          )}
          <div>
            <p className="font-display font-semibold">You'll be talking to {brief.character.name}</p>
            {brief.character.title && <p className="text-xs text-foam/50">{brief.character.title}</p>}
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-foam/75">{brief.character.persona}</p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-deep/70 p-6">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-glow" />
          <h2 className="font-display text-lg font-semibold">It's just you and {brief.character.name}</h2>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-foam/70">
          No character to play, no script, and nothing scored. {brief.character.name} opens the conversation and follows
          where your honest answers lead. Here's how to show up:
        </p>
        <ul className="mt-4 space-y-2.5">
          {pointers.map((p, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-foam/80">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-glow/70" />
              {p}
            </li>
          ))}
        </ul>
      </section>

      <div className="flex justify-center pt-1">
        <button onClick={onBegin} className="btn-primary px-6 py-3 text-base">
          <Mic className="h-5 w-5" /> Start the call <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <p className="-mt-4 text-center text-xs text-foam/40">
        {brief.character.name} opens when the call connects. Allow microphone access when prompted — headphones recommended.
      </p>
    </div>
  );
}

/**
 * The voice "Conversation" step. Uses the ElevenLabs React SDK to run the call
 * inside our own UI (Start / live status / mute / End) instead of the stock
 * floating widget, so the interface matches the reef design. The agent (e.g.
 * Maren Cole) handles turn-taking and runs the full coach-and-close arc.
 */
function VoiceView({ brief, agentId }: { brief: ScenarioBrief; agentId: string }) {
  return (
    <div className="animate-fade-up space-y-6">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-foam/40">
        <Mic className="h-3.5 w-3.5" /> Live voice conversation
      </div>

      <section className="glass-reef border border-white/10 text-center">
        {brief.character.avatar ? (
          <img
            src={brief.character.avatar}
            alt={brief.character.name}
            className="mx-auto h-16 w-16 rounded-full object-cover object-top ring-1 ring-white/15"
          />
        ) : (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-urchin/20 text-urchin">
            <MessageSquareQuote className="h-6 w-6" />
          </div>
        )}
        <p className="mt-3 font-display text-lg font-semibold">{brief.character.name}</p>
        {brief.character.title && <p className="text-xs text-foam/50">{brief.character.title}</p>}

        <Suspense
          fallback={
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-foam/50">
              <Loader2 className="h-4 w-4 animate-spin" /> Preparing the call…
            </div>
          }
        >
          <VoiceCall agentId={agentId} characterName={brief.character.name} avatarSrc={brief.character.avatar} />
        </Suspense>
      </section>

      <p className="text-center text-xs text-foam/40">
        Your microphone audio is sent to ElevenLabs to power the live conversation. When you're done, end the call and
        hit <span className="font-semibold text-foam">Finish</span>.
      </p>
    </div>
  );
}

function ChatView({
  phase,
  brief,
  simMessages,
  coachMessages,
  loading,
}: {
  phase: Phase;
  brief: ScenarioBrief;
  simMessages: SimMsg[];
  coachMessages: CoachMsg[];
  loading: boolean;
}) {
  const isSim = phase === "sim";
  const counterpartName = brief.character.name;
  const speakerLabel = isSim ? counterpartName : "Debrief Coach";
  const thinking = isSim ? `${counterpartName} is thinking…` : "Coach is reflecting…";
  const simNoun = brief.ui?.simNoun ?? "conversation";
  const learnerLabel = brief.learnerBrief.roleShort ? `You (${brief.learnerBrief.roleShort})` : "You";

  return (
    <div className="space-y-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-foam/40">
        {isSim ? <Anchor className="h-3.5 w-3.5" /> : <Compass className="h-3.5 w-3.5" />}
        {isSim ? `Live ${simNoun}` : "Reflective debrief"}
      </div>

      {isSim
        ? simMessages.map((m, i) => (
            <Bubble key={i} side={m.role === "learner" ? "right" : "left"} name={m.role === "learner" ? learnerLabel : speakerLabel} tone={m.role === "learner" ? "learner" : "counterpart"} text={m.text} />
          ))
        : coachMessages.map((m, i) => (
            <Bubble key={i} side={m.role === "learner" ? "right" : "left"} name={m.role === "learner" ? learnerLabel : speakerLabel} tone={m.role === "learner" ? "learner" : "coach"} text={m.text} />
          ))}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-foam/50">
          <Loader2 className="h-4 w-4 animate-spin" /> {thinking}
        </div>
      )}
    </div>
  );
}

function Bubble({
  side,
  name,
  tone,
  text,
}: {
  side: "left" | "right";
  name: string;
  tone: "learner" | "counterpart" | "coach";
  text: string;
}) {
  const toneClass =
    tone === "learner"
      ? "bg-glow/15 border-glow/20"
      : tone === "coach"
        ? "bg-urchin/10 border-urchin/20"
        : "bg-surface/60 border-white/10";
  return (
    <div className={`flex flex-col ${side === "right" ? "items-end" : "items-start"}`}>
      <span className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wider text-foam/40">{name}</span>
      <div className={`max-w-[88%] whitespace-pre-wrap rounded-2xl border px-4 py-2.5 text-sm leading-relaxed text-foam ${toneClass}`}>
        {text}
      </div>
    </div>
  );
}

function ScoreDots({ score }: { score: number | null }) {
  const filled = score ?? 0;
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1].map((i) => (
        <span key={i} className={`h-2.5 w-2.5 rounded-full ${score !== null && i < filled ? "bg-glow" : "border border-foam/30"}`} />
      ))}
    </span>
  );
}

/**
 * End-of-call screen for a VOICE role-play (e.g. the Dock Deal). Voice has no
 * auto-scored debrief, so this stages the formative loop out loud: the pair
 * debriefs the call just finished, then switches seats so the partner runs
 * their own call, then debriefs that one too. Reflection prompts come from the
 * scenario (ui.pairedDebrief) with sensible defaults.
 */
/**
 * One numbered step of the paired-debrief instructions. Declared at module scope
 * rather than inside PairedDebriefView — a component created during render is a
 * new component type on every render, so React unmounts and remounts it.
 */
function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-deep/70 p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-glow/40 bg-glow/10 font-display text-sm font-bold text-glow">
          {n}
        </span>
        <h2 className="font-display text-lg font-semibold">{title}</h2>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function PairedDebriefView({
  brief,
  nextCodename,
  onContinue,
  onReplay,
}: {
  brief: ScenarioBrief;
  nextCodename?: string;
  onContinue: () => void;
  onReplay: () => void;
}) {
  const counterpart = brief.character.name;
  const pd = brief.ui?.pairedDebrief;
  const intro =
    pd?.intro ??
    `That's your call with ${counterpart}. The real learning happens out loud — so before you move on, pair up and debrief it together. Then switch seats and run it again.`;
  const prompts = pd?.prompts ?? [
    "How did it feel — and where did the deal actually land?",
    "What was the other side really protecting underneath their number? Did you surface it?",
    "Point to the moment the tone shifted. What had you just said right before it?",
    "What's the one thing you'll do differently next time?",
  ];

  return (
    <div className="animate-fade-up space-y-8">
      <div className="text-center">
        <span className="pill border-glow/40 bg-glow/10 text-glow">
          <Users className="h-3.5 w-3.5" /> Debrief in pairs
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold">Now debrief — together</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-foam/70">{intro}</p>
      </div>

      <Step n={1} title="Debrief your call">
        <p className="text-sm text-foam/60">With your partner, talk through what just happened:</p>
        <ul className="mt-4 space-y-2.5">
          {prompts.map((p, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-foam/80">
              <MessageSquareQuote className="mt-0.5 h-4 w-4 shrink-0 text-glow" />
              {p}
            </li>
          ))}
        </ul>
      </Step>

      <Step n={2} title="Switch seats">
        <p className="text-sm leading-relaxed text-foam/70">
          Now it's your partner's turn. They run their own call with {counterpart} from the top — use{" "}
          <span className="font-semibold text-foam">Run it back</span> to hand them the controls.
        </p>
      </Step>

      <Step n={3} title="Debrief theirs">
        <p className="text-sm leading-relaxed text-foam/70">
          When they finish, debrief their call the same way — same questions, fresh conversation. Two reps, two
          debriefs, both of you on each side of the table.
        </p>
      </Step>

      <div className="flex flex-wrap justify-center gap-3 pt-1">
        <button onClick={onReplay} className="btn-primary px-5 py-2.5">
          <RotateCcw className="h-4 w-4" /> Run it back · partner's turn
        </button>
        <button onClick={onContinue} className="btn-ghost px-5 py-2.5">
          Continue{nextCodename ? ` to ${nextCodename}` : ""} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ScoreView({
  score,
  loading,
  nextCodename,
  onContinue,
  onReplay,
  gate,
  replayLabel,
  dimensionNames,
}: {
  score: ScorePayload | null;
  loading: boolean;
  nextCodename?: string;
  onContinue: () => void;
  onReplay: () => void;
  gate?: NonNullable<ScenarioBrief["ui"]>["gate"];
  replayLabel: string;
  /** Public dimension names, used when live scoring is unavailable. */
  dimensionNames: ScenarioBrief["scoringDimensions"];
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-foam/60">
        <Loader2 className="h-6 w-6 animate-spin text-glow" />
        Reading the conversation across the four dimensions…
      </div>
    );
  }

  const scored = !!score?.scored && score.total !== null;
  const unlocked = scored && !!score?.phaseUnlocked;
  // The rubric is per-scenario, so the copy has to follow the payload rather
  // than assume four dimensions and a threshold of 6.
  const dims = score?.dimensions?.length ? score.dimensions.length : dimensionNames.length;
  const threshold = score?.unlockThreshold ?? 6;

  return (
    <div className="animate-fade-up space-y-8">
      <div className="text-center">
        <span className="pill border-glow/40 bg-glow/10 text-glow">
          <BarChart3 className="h-3.5 w-3.5" /> Your debrief score
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold">How I read the conversation</h1>
        <p className="mt-2 text-sm text-foam/60">
          {dims} dimensions, each scored 0–2, grounded in what actually happened.
        </p>
      </div>

      {/* Score card */}
      <section className="rounded-2xl border border-white/10 bg-deep/70 p-6">
        {scored ? (
          <>
            <ul className="space-y-3">
              {score!.dimensions.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-4 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <span className="text-sm text-foam/85">{d.name}</span>
                  <span className="flex items-center gap-3">
                    <ScoreDots score={d.score} />
                    <span className="w-8 text-right font-display text-sm font-semibold text-foam">{d.score}/2</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
              <span className="font-display text-sm font-semibold uppercase tracking-widest text-foam/60">Total</span>
              <span className="font-display text-2xl font-bold text-glow">
                {score!.total}
                <span className="text-base text-foam/50">/{score!.maxTotal}</span>
              </span>
            </div>
            {score!.tier && (
              <p className="mt-3 text-center font-display text-lg font-semibold text-foam">&ldquo;{score!.tier.label}&rdquo;</p>
            )}
          </>
        ) : (
          <>
            <ul className="space-y-3">
              {dimensionNames.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between gap-4 border-b border-white/5 pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-sm text-foam/85">{d.name}</span>
                  <span className="flex items-center gap-3">
                    <ScoreDots score={null} />
                    <span className="w-8 text-right font-display text-sm text-foam/40">—</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-white/10 pt-4 text-center text-sm text-foam/70">
              These are the dimensions your debrief reads you on. Live scoring runs on the AI coach,
              which needs the server API key — your debrief still ran, so replay or move on whenever
              you're ready.
            </p>
          </>
        )}
      </section>

      {/* Takeaway */}
      {scored && score!.takeaway && (
        <section className="glass-reef border border-kelp/30">
          <div className="flex items-center gap-2 text-kelp">
            <Sparkles className="h-4 w-4" />
            <h2 className="font-display text-sm font-semibold uppercase tracking-widest">Carry this forward</h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-foam/85">{score!.takeaway}</p>
        </section>
      )}

      {/* Gate */}
      <section className="rounded-2xl border border-white/10 bg-abyss/40 p-6 text-center">
        {!scored ? (
          <>
            <p className="text-sm text-foam/75">Run it again to go deeper — or continue when you're ready.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button onClick={onReplay} className="btn-ghost px-5 py-2.5">
                <RotateCcw className="h-4 w-4" /> Replay {replayLabel}
              </button>
              <button onClick={onContinue} className="btn-primary px-5 py-2.5">
                Continue{nextCodename ? ` to ${nextCodename}` : ""} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : unlocked ? (
          <>
            <p className="font-display text-lg font-semibold text-foam">{gate?.unlockedTitle ?? "You read the water."}</p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-foam/75">
              {gate?.unlockedBody ??
                "You saw past the surface to what was actually driving the room. That's what this phase was about."}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button onClick={onReplay} className="btn-ghost px-5 py-2.5">
                <RotateCcw className="h-4 w-4" /> Replay
              </button>
              <button onClick={onContinue} className="btn-primary px-5 py-2.5">
                Continue{nextCodename ? ` to ${nextCodename}` : ""} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="font-display text-lg font-semibold text-foam">{gate?.lockedTitle ?? "Not yet."}</p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-foam/75">
              {gate?.lockedBody ??
                "The opening was there. Go back in — this phase is built on what you learn here, and this time you know the water."}
            </p>
            {gate?.lockedHint && (
              <p className="mt-4 text-sm text-foam/85">
                One thing to try: <span className="font-semibold text-glow">{gate.lockedHint}</span>
              </p>
            )}
            <div className="mt-5 flex justify-center">
              <button onClick={onReplay} className="btn-primary px-5 py-2.5">
                <RotateCcw className="h-4 w-4" /> Replay {replayLabel}
              </button>
            </div>
            <p className="mt-3 text-xs text-foam/40">
              Reach {threshold} of {score!.maxTotal} to unlock the next phase.
            </p>
          </>
        )}
      </section>
    </div>
  );
}
