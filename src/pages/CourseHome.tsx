import { Link } from "react-router-dom";
import {
  ArrowRight,
  Anchor,
  Brain,
  Network,
  Waves,
  Mic,
  FlaskConical,
  Compass,
  Sparkles,
  Target,
} from "lucide-react";
import { PHASES, CORE_COMPETENCIES, CORE_PHASES, isOrientation } from "../data/curriculum";
import { getScenarioBrief } from "../data/scenarioBriefs";
import PhaseCard from "../components/PhaseCard";
import HeroArt from "../components/art/HeroArt";
import { HERO_IMAGE, HERO_FOCAL } from "../data/phaseArt";
import { useAuth } from "../hooks/useAuth";
import { useProgress } from "../hooks/useProgress";
import { completedCount, hasStarted, nextPhaseSlug } from "../lib/progress";

/**
 * Course Home — where a learner lands after onboarding, and the page the top
 * nav's logo returns them to.
 *
 * It answers, in order: what is this, why does it work this way, what will I be
 * able to do, and where do I start. The single primary action is "Enter the
 * Reef" (or "Continue" once they're underway), so nobody has to guess which of
 * six phases comes first.
 *
 * Distinct from the public landing page at "/", which sells the program to
 * people who haven't registered. This one assumes you're in.
 */

/** The premises the curriculum is actually built on, in the learner's words. */
const BIG_IDEAS = [
  {
    icon: FlaskConical,
    title: "Your beliefs get tested before your skills do",
    body: "Most people don't stall because they lack a framework. They stall because they're acting on something they've never checked — \"I'm not a numbers person,\" \"nobody would pay for this.\" We start by turning one of those into an experiment that produces actual evidence.",
  },
  {
    icon: Mic,
    title: "You'll do it badly first, on purpose",
    body: "Every phase ends in a live conversation with someone who has their own agenda and won't hand you the answer. You'll misread them. That's the material — the debrief afterward is where it turns into skill you keep.",
  },
  {
    icon: Sparkles,
    title: "The human part is the durable part",
    body: "Execution keeps getting cheaper. What doesn't commoditise is reading a room, holding a team together under pressure, and making someone believe in something that doesn't exist yet. That's what this trains.",
  },
  {
    icon: Anchor,
    title: "Build the real thing as you go",
    body: "You're not doing case studies about someone else's company. Every artifact — the plan, the pitch, the negotiation — is for the business you actually want to build. You leave with the work, not just the certificate.",
  },
];

const COMPETENCY_ICONS = [Brain, Network, Anchor];

/** One plain-language outcome per phase, distilled from its objectives. */
const OUTCOMES: Record<string, string> = {
  "entering-the-reef":
    "Catch a self-limiting belief in the act, and design a small experiment that tells you whether it's true.",
  "apex-positioning":
    "Know whether you're playing to win or playing not to lose — and tell a zero-sum room from a collaborative one.",
  "coral-scaffolding":
    "Turn a spoken idea into an evidence-backed plan that survives contact with someone who doubts it.",
  "navigating-the-currents":
    "Make the other side justify their number before you counter, and trade value instead of conceding it.",
  "schooling-strategy":
    "Notice the silence in a team before it becomes a failure, and repair a conversation that's broken down.",
  "the-migration":
    "Construct a total-value offer you can defend with data, and deliver a pitch that makes people move.",
};

export default function CourseHome() {
  const { user } = useAuth();
  const { progress } = useProgress();

  const done = completedCount(progress);
  const started = hasStarted(progress);
  const pct = Math.round((done / PHASES.length) * 100);
  const nextSlug = nextPhaseSlug(progress);
  const nextPhase = PHASES.find((p) => p.slug === nextSlug);
  const allDone = done === PHASES.length;

  const firstName = (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0];

  const ctaLabel = allDone
    ? "Revisit the reef"
    : started
      ? `Continue · ${nextPhase?.codename}`
      : "Enter the Reef";

  return (
    <div>
      {/* ===== Welcome + the one action that matters ===== */}
      <HeroArt motif="apex" src={HERO_IMAGE} focal={HERO_FOCAL}>
        <div className="container-apex flex min-h-[62vh] flex-col justify-end pb-14 pt-24">
          <div className="max-w-3xl animate-fade-up">
            <span className="pill">
              <Waves className="h-3.5 w-3.5" /> Your course
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.06] text-shadow-deep sm:text-5xl">
              {firstName ? `Welcome, ${firstName}.` : "Welcome aboard."}{" "}
              <span className="text-glow">You&apos;re in.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-foam/90 text-shadow-deep">
              Apex is six phases of deliberate practice for the skills that decide whether a venture
              survives contact with real people — reading a room, holding a hard conversation, and
              making someone believe in something that doesn&apos;t exist yet.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to={`/program/${nextSlug}`} className="btn-primary px-6 py-3 text-base">
                {ctaLabel} <ArrowRight className="h-5 w-5" />
              </Link>
              <a href="#how-it-works" className="btn-ghost">
                How it works
              </a>
            </div>

            {started && !allDone && (
              <p className="mt-4 text-sm text-foam/70 text-shadow-deep">
                {done} of {PHASES.length} phases complete — picking up where you left off.
              </p>
            )}
          </div>
        </div>
      </HeroArt>

      {/* ===== Progress rail ===== */}
      <div className="border-y border-white/10 bg-deep/50 backdrop-blur-sm">
        <div className="container-apex flex flex-wrap items-center gap-x-8 gap-y-3 py-5">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-glow">{done}</span>
            <span className="text-sm text-foam/60">of {PHASES.length} phases complete</span>
          </div>
          <div className="h-2 min-w-[12rem] flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-tide to-glow transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          {allDone ? (
            <Link to="/post-survey" className="text-sm font-semibold text-kelp hover:underline">
              Take the post-program survey →
            </Link>
          ) : (
            <Link to={`/program/${nextSlug}`} className="text-sm font-semibold text-glow hover:underline">
              {started ? "Resume" : "Start"}: {nextPhase?.codename} →
            </Link>
          )}
        </div>
      </div>

      <div className="container-apex py-16">
        {/* ===== Big ideas ===== */}
        <section id="how-it-works" className="scroll-mt-20">
          <span className="pill pill-kelp">The big ideas</span>
          <h2 className="mt-4 font-display text-3xl font-bold">Why this program works the way it does</h2>
          <p className="mt-2 max-w-2xl text-foam/70">
            Four premises sit under every phase. They explain why you&apos;ll spend more time in
            conversation than in slides.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {BIG_IDEAS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="card-reef">
                <Icon className="h-7 w-7 text-glow" />
                <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foam/75">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== Competencies ===== */}
        <section className="mt-20">
          <span className="pill">What you&apos;re building</span>
          <h2 className="mt-4 font-display text-3xl font-bold">Three competencies, threaded throughout</h2>
          <p className="mt-2 max-w-2xl text-foam/70">
            Every phase advances at least one of these. They&apos;re the through-line from the first
            conversation to the capstone pitch.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {CORE_COMPETENCIES.map((c, i) => {
              const Icon = COMPETENCY_ICONS[i] ?? Anchor;
              return (
                <div key={c.title} className="card-reef">
                  <Icon className="h-8 w-8 text-glow" />
                  <h3 className="mt-4 font-display text-lg font-semibold">{c.title}</h3>
                  <p className="mt-2 text-sm text-foam/70">{c.detail}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ===== Outcomes, phase by phase ===== */}
        <section className="mt-20">
          <span className="pill">Learning outcomes</span>
          <h2 className="mt-4 font-display text-3xl font-bold">What you&apos;ll be able to do</h2>
          <p className="mt-2 max-w-2xl text-foam/70">
            One capability per phase, in plain terms. Open any phase for its full objectives and the
            assessment that measures them.
          </p>
          <ol className="mt-8 space-y-3">
            {PHASES.map((p) => {
              const complete = progress[p.slug]?.status === "completed";
              const brief = getScenarioBrief(p.slug);
              return (
                <li key={p.slug}>
                  <Link
                    to={`/program/${p.slug}`}
                    className="group flex gap-4 rounded-2xl border border-white/10 bg-deep/60 p-5 transition hover:border-glow/40 hover:bg-surface/50"
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border font-display text-sm font-bold ${
                        complete
                          ? "border-kelp/40 bg-kelp/10 text-kelp"
                          : "border-glow/30 bg-glow/10 text-glow"
                      }`}
                    >
                      {isOrientation(p) ? "00" : `0${p.month}`}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <h3 className="font-display font-semibold text-foam">{p.codename}</h3>
                        {complete && (
                          <span className="text-xs font-semibold uppercase tracking-wider text-kelp">
                            Complete
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 flex gap-2 text-sm leading-relaxed text-foam/75">
                        <Target className="mt-0.5 h-4 w-4 shrink-0 text-glow/70" />
                        {OUTCOMES[p.slug] ?? p.tagline}
                      </p>
                      {brief && (
                        <p className="mt-1.5 text-xs text-foam/45">
                          Practice: {brief.title} · live {brief.modality} with {brief.character.name}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>

        {/* ===== The arc ===== */}
        <section className="mt-20">
          <span className="pill">The Predator&apos;s Lexicon</span>
          <h2 className="mt-4 font-display text-3xl font-bold">Your six phases</h2>
          <p className="mt-2 max-w-2xl text-foam/70">
            An orientation plus {CORE_PHASES.length} phases, mapped to the life-cycle of an apex
            predator. Work them in order — each one is built on the last.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PHASES.map((p) => (
              <PhaseCard key={p.slug} phase={p} completed={progress[p.slug]?.status === "completed"} />
            ))}
          </div>
        </section>

        {/* ===== Closing push ===== */}
        <section className="mt-20 rounded-3xl border border-glow/25 bg-gradient-to-br from-surface/60 to-deep/60 p-10 text-center">
          <Compass className="mx-auto h-8 w-8 text-glow" />
          <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
            The reef doesn&apos;t care what you believe. It only cares what you do.
          </h2>
          <p className="mx-auto mt-3 max-w-xl leading-relaxed text-foam/75">
            You don&apos;t need to feel ready. Nobody who built something worth building did.
            You need one honest attempt and the evidence it produces — and that starts in the next
            twenty minutes.
          </p>
          <Link to={`/program/${nextSlug}`} className="btn-primary mt-7 px-6 py-3 text-base">
            {ctaLabel} <ArrowRight className="h-5 w-5" />
          </Link>
        </section>
      </div>
    </div>
  );
}
