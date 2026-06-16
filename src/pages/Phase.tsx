import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Target,
  Waves,
  Compass,
  PlayCircle,
  CheckCircle2,
  MessageSquareQuote,
  ListChecks,
  Quote,
} from "lucide-react";
import { getPhase, isOrientation, CORE_PHASES, PHASES } from "../data/curriculum";
import type { DeepDive } from "../data/curriculum";
import { getPhaseArt } from "../data/phaseArt";
import { getPhaseCreature } from "../data/reefLife";
import { getScenarioBrief } from "../data/scenarioBriefs";
import HeroArt from "../components/art/HeroArt";
import CreatureFrame from "../components/art/CreatureFrame";
import SimulationExperience from "../components/SimulationExperience";

/**
 * Tailwind's JIT only generates classes it finds as literal strings in source.
 * So every accent class lives here as a complete literal — never built by
 * concatenation at runtime.
 */
const ACCENT: Record<
  string,
  { text: string; border: string; bg: string; ring: string; hoverBorder: string }
> = {
  glow: { text: "text-glow", border: "border-glow/40", bg: "bg-glow/10", ring: "ring-glow/50", hoverBorder: "hover:border-glow/40" },
  kelp: { text: "text-kelp", border: "border-kelp/40", bg: "bg-kelp/10", ring: "ring-kelp/50", hoverBorder: "hover:border-kelp/40" },
  lagoon: { text: "text-shallow", border: "border-lagoon/50", bg: "bg-lagoon/15", ring: "ring-lagoon/50", hoverBorder: "hover:border-lagoon/50" },
  urchin: { text: "text-urchin", border: "border-urchin/40", bg: "bg-urchin/10", ring: "ring-urchin/50", hoverBorder: "hover:border-urchin/40" },
  ember: { text: "text-ember", border: "border-ember/40", bg: "bg-ember/10", ring: "ring-ember/50", hoverBorder: "hover:border-ember/40" },
};

export default function Phase() {
  const { slug } = useParams();
  const phase = slug ? getPhase(slug) : undefined;

  if (!phase) {
    return (
      <div className="container-apex py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Phase not found</h1>
        <Link to="/program" className="btn-ghost mt-6">
          Back to the program
        </Link>
      </div>
    );
  }

  const art = getPhaseArt(phase.slug);
  const accent = ACCENT[art.accent] ?? ACCENT.glow;
  // The phase's secondary sea-life companion (octopus, ray, …); may be undefined.
  const creature = getPhaseCreature(phase.slug);
  const index = PHASES.findIndex((p) => p.slug === phase.slug);
  const prev = PHASES[index - 1];
  const next = PHASES[index + 1];

  // Does this phase have a built experiential simulation? If so, the practice
  // CTA launches it; if not, it stays an informational placeholder.
  const scenarioBrief = getScenarioBrief(phase.slug);
  const [simOpen, setSimOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div>
      {/* ===== Cinematic hero ===== */}
      <HeroArt motif={art.motif} src={art.image} focal={art.focal}>
        <div className="container-apex flex min-h-[68vh] flex-col justify-end pb-14 pt-28">
          <Link
            to="/program"
            className="mb-auto inline-flex w-fit items-center gap-1 text-sm text-foam/70 transition hover:text-glow"
          >
            <ArrowLeft className="h-4 w-4" /> All phases
          </Link>

          <div className="max-w-3xl animate-fade-up">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`pill ${accent.border} ${accent.bg} ${accent.text}`}>
                <Waves className="h-3.5 w-3.5" />{" "}
                {isOrientation(phase) ? "Phase 00 · Orientation" : `Phase ${phase.month} of ${CORE_PHASES.length}`}
              </span>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-foam/60">
                {art.mood} · {art.depthLabel}
              </span>
            </div>

            <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] text-shadow-deep sm:text-6xl">
              {phase.codename}
            </h1>
            <p className={`mt-3 font-display text-lg font-medium ${accent.text}`}>{phase.title}</p>
            <p className="mt-5 max-w-2xl text-lg italic text-foam/90 text-shadow-deep">
              &ldquo;{phase.tagline}&rdquo;
            </p>
          </div>
        </div>
      </HeroArt>

      {/* ===== Depth progress rail ===== */}
      <div className="border-y border-white/10 bg-deep/40 backdrop-blur-sm">
        <div className="container-apex flex items-center gap-3 py-4">
          {PHASES.map((p) => {
            const a = getPhaseArt(p.slug);
            const isActive = p.slug === phase.slug;
            const dot = ACCENT[a.accent] ?? ACCENT.glow;
            return (
              <Link
                key={p.slug}
                to={`/program/${p.slug}`}
                title={`${isOrientation(p) ? "Orientation" : `Phase ${p.month}`} · ${p.codename}`}
                className="group flex flex-1 items-center"
              >
                <span
                  className={`h-2 w-full rounded-full transition ${
                    isActive ? `${dot.bg} ${dot.text}` : "bg-white/10 group-hover:bg-white/25"
                  }`}
                  style={isActive ? { boxShadow: "0 0 16px currentColor" } : undefined}
                />
              </Link>
            );
          })}
        </div>
      </div>

      {/* ===== Body ===== */}
      <div className="container-apex py-16">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <h2 className="font-display text-2xl font-bold">The waters ahead</h2>
            <p className="mt-4 text-lg leading-relaxed text-foam/80">{phase.overview}</p>

            <h2 className="mt-14 font-display text-2xl font-bold">Learning objectives</h2>
            <div className="mt-6 space-y-4">
              {phase.objectives.map((o, i) => (
                <div
                  key={o.title}
                  className={`rounded-2xl border border-white/10 bg-deep/70 p-6 backdrop-blur-sm transition ${accent.hoverBorder} hover:bg-surface/50`}
                >
                  <div className="flex gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${accent.border} ${accent.bg} font-display text-lg font-bold ${accent.text}`}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Target className={`h-4 w-4 ${accent.text}`} />
                        <h3 className="font-display text-lg font-semibold">{o.title}</h3>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-foam/70">{o.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {phase.deepDives && phase.deepDives.length > 0 && (
              <>
                <h2 className="mt-14 font-display text-2xl font-bold">The workshop</h2>
                <p className="mt-2 text-sm text-foam/60">
                  Hands-on frameworks, checklists, and scripts to practice in this phase.
                </p>
                <div className="mt-6 space-y-6">
                  {phase.deepDives.map((block, i) => (
                    <DeepDiveBlock key={i} block={block} accent={accent} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sidebar: practice CTA + at-a-glance */}
          <aside className="space-y-6">
            <div className={`glass-reef ring-1 ${accent.ring}`}>
              <div className="flex items-center gap-2">
                <PlayCircle className={`h-5 w-5 ${accent.text}`} />
                <h3 className="font-display text-lg font-semibold">Practice by doing</h3>
              </div>
              {scenarioBrief ? (
                <>
                  <p className="mt-3 text-sm leading-relaxed text-foam/75">
                    Step into <span className="font-semibold text-foam">&ldquo;{scenarioBrief.title}&rdquo;</span> — a live,
                    simulated {scenarioBrief.modality} with {scenarioBrief.character.name}. Hold a real conversation, then
                    debrief with a coach that walks you through what happened and what to try next.
                  </p>
                  <button onClick={() => setSimOpen(true)} className="btn-primary mt-5 w-full">
                    Enter the simulation <ArrowRight className="h-4 w-4" />
                  </button>
                  <p className="mt-2 text-center text-xs text-foam/40">
                    Experiential learning · ~{scenarioBrief.estimatedMinutes} min · debrief included
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-3 text-sm leading-relaxed text-foam/75">
                    A live, simulated scenario for this phase is in development. Hold a real conversation with an AI
                    counterpart, then debrief with a coach that walks you through what happened and what to try next.
                  </p>
                  <button disabled className="btn-primary mt-5 w-full cursor-not-allowed opacity-40">
                    Simulation coming soon
                  </button>
                  <p className="mt-2 text-center text-xs text-foam/40">Experiential learning · debrief included</p>
                </>
              )}
            </div>

            <div className="card-reef">
              <div className="flex items-center gap-2 text-foam/80">
                <Compass className="h-4 w-4 text-glow" />
                <h3 className="font-display text-sm font-semibold uppercase tracking-widest">At a glance</h3>
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-foam/50">Phase</dt>
                  <dd className="font-semibold">
                    {isOrientation(phase) ? "Orientation" : `${phase.month} / ${CORE_PHASES.length}`}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-foam/50">Objectives</dt>
                  <dd className="font-semibold">{phase.objectives.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-foam/50">Depth</dt>
                  <dd className={`font-semibold ${accent.text}`}>{art.mood}</dd>
                </div>
              </dl>
            </div>

            {/* Secondary sea-life companion for this phase (octopus, ray, …). */}
            <CreatureFrame creature={creature} />
          </aside>
        </div>

        {/* ===== Currents navigation ===== */}
        <div className="mt-16 flex items-center justify-between gap-4 border-t border-white/10 pt-8">
          {prev ? (
            <Link to={`/program/${prev.slug}`} className="group flex flex-col items-start">
              <span className="text-xs uppercase tracking-widest text-foam/40">Upstream</span>
              <span className="btn-ghost mt-2">
                <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" /> {prev.codename}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link to={`/program/${next.slug}`} className="group flex flex-col items-end text-right">
              <span className="text-xs uppercase tracking-widest text-foam/40">Downstream</span>
              <span className="btn-primary mt-2">
                {next.codename} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ) : (
            <span />
          )}
        </div>
      </div>

      {/* ===== Experiential simulation overlay ===== */}
      {scenarioBrief && simOpen && (
        <SimulationExperience
          brief={scenarioBrief}
          onClose={() => setSimOpen(false)}
          nextCodename={next?.codename}
          onContinue={
            next
              ? () => {
                  setSimOpen(false);
                  navigate(`/program/${next.slug}`);
                  window.scrollTo({ top: 0 });
                }
              : undefined
          }
        />
      )}
    </div>
  );
}

type Accent = (typeof ACCENT)[keyof typeof ACCENT];

/**
 * Renders one workshop "deep dive" block. The discriminated union on
 * DeepDive.kind keeps this exhaustive and type-safe — add a kind in
 * curriculum.ts and TypeScript will point you here.
 */
function DeepDiveBlock({ block, accent }: { block: DeepDive; accent: Accent }) {
  if (block.kind === "checklist") {
    return (
      <div className="rounded-2xl border border-white/10 bg-deep/70 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <ListChecks className={`h-5 w-5 ${accent.text}`} />
          <h3 className="font-display text-lg font-semibold">{block.heading}</h3>
        </div>
        {block.intro && <p className="mt-2 text-sm text-foam/60">{block.intro}</p>}
        <ul className="mt-4 space-y-3">
          {block.items.map((it) => (
            <li key={it.lead} className="flex gap-3">
              <CheckCircle2 className={`mt-0.5 h-5 w-5 shrink-0 ${accent.text}`} />
              <p className="text-sm leading-relaxed text-foam/80">
                <span className="font-semibold text-foam">{it.lead}.</span> {it.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (block.kind === "script") {
    return (
      <div className="rounded-2xl border border-white/10 bg-deep/70 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <MessageSquareQuote className={`h-5 w-5 ${accent.text}`} />
          <h3 className="font-display text-lg font-semibold">{block.heading}</h3>
        </div>
        {block.intro && <p className="mt-2 text-sm text-foam/60">{block.intro}</p>}
        <ol className="mt-4 space-y-4">
          {block.steps.map((s, i) => (
            <li key={s.label} className="relative pl-12">
              <span
                className={`absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-lg border ${accent.border} ${accent.bg} font-display text-sm font-bold ${accent.text}`}
              >
                {i + 1}
              </span>
              <span className={`text-xs font-semibold uppercase tracking-widest ${accent.text}`}>
                {s.label}
              </span>
              <p className="mt-1 border-l-2 border-white/10 pl-3 text-sm italic leading-relaxed text-foam/85">
                &ldquo;{s.quote}&rdquo;
              </p>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  if (block.kind === "table") {
    return (
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-deep/70 backdrop-blur-sm">
        <div className="p-6 pb-3">
          <h3 className="font-display text-lg font-semibold">{block.heading}</h3>
          {block.intro && <p className="mt-2 text-sm text-foam/60">{block.intro}</p>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className={`border-y border-white/10 ${accent.bg}`}>
                {block.columns.map((c) => (
                  <th
                    key={c}
                    className={`px-6 py-3 font-display text-xs font-semibold uppercase tracking-wider ${accent.text}`}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className="border-b border-white/5 align-top last:border-0">
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`px-6 py-4 leading-relaxed ${
                        ci === 0 ? "font-semibold text-foam" : "text-foam/75"
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // block.kind === "callout"
  return (
    <div className={`glass-reef border ${accent.border}`}>
      <h3 className="font-display text-lg font-semibold">{block.heading}</h3>
      <p className="mt-2 text-sm leading-relaxed text-foam/80">{block.body}</p>
      {block.quote && (
        <blockquote className={`mt-4 flex gap-3 rounded-xl ${accent.bg} p-4`}>
          <Quote className={`h-5 w-5 shrink-0 ${accent.text}`} />
          <p className="text-sm font-medium italic text-foam">&ldquo;{block.quote}&rdquo;</p>
        </blockquote>
      )}
    </div>
  );
}
