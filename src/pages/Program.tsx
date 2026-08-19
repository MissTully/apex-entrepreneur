import { Link } from "react-router-dom";
import { Waves } from "lucide-react";
import { PHASES } from "../data/curriculum";
import PhaseCard from "../components/PhaseCard";
import { useAuth } from "../hooks/useAuth";
import { useProgress } from "../hooks/useProgress";
import { completedCount } from "../lib/progress";

export default function Program() {
  const { user } = useAuth();
  const { progress } = useProgress();

  const done = completedCount(progress);
  const pct = Math.round((done / PHASES.length) * 100);

  return (
    <div>
      <div className="container-apex pt-16">
        <span className="pill">The Program</span>
        <h1 className="mt-4 font-display text-4xl font-bold">
          A five-month migration
        </h1>
        <p className="mt-3 max-w-2xl text-foam/75">
          This journey transforms the adult learner into a Performance Engineer.
          By merging power skills with high-performance digital standards,
          graduates are prepared to manage system resources — and the complex
          human relationships of the modern decentralized economy.
        </p>

        {/* The learner's own progress. Signed-out visitors just see the program. */}
        {user && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-deep/70 p-6 backdrop-blur-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div className="flex items-center gap-2">
                <Waves className="h-4 w-4 text-glow" />
                <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-foam/80">
                  Your migration
                </h2>
              </div>
              <p className="text-sm text-foam/60">
                <span className="font-display text-lg font-bold text-glow">
                  {done}
                </span>{" "}
                of {PHASES.length} phases complete
              </p>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-tide to-glow transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-foam/50">
              {done === 0
                ? "Start with Entering the Reef — the orientation that sets up everything after it."
                : done === PHASES.length
                  ? "Every phase behind you. Take the post-program survey to unlock your certificate."
                  : "A phase completes when you finish its live simulation. Run any of them back whenever you like."}
            </p>
          </div>
        )}

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PHASES.map((p) => (
            <PhaseCard
              key={p.slug}
              phase={p}
              completed={progress[p.slug]?.status === "completed"}
            />
          ))}
        </div>

        <p className="mt-16 border-t border-white/10 pt-8 text-sm text-foam/50">
          Curious about the three competencies threaded through every phase, or the totem each
          creature carries?{" "}
          <Link to="/#competencies" className="font-semibold text-glow hover:underline">
            Read the philosophy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
