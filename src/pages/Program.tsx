import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PHASES, CORE_PHASES } from "../data/curriculum";
import PhaseCard from "../components/PhaseCard";
import { useAuth } from "../hooks/useAuth";
import { useProgress } from "../hooks/useProgress";

/**
 * All phases at a glance.
 *
 * Public: a prospective learner can browse the whole arc before registering.
 * For someone signed in it's the "index" view reached from the Phases menu —
 * their own progress and the guided entry point live on Course Home, so this
 * page stays a catalogue and points back there rather than duplicating it.
 */
export default function Program() {
  const { user, hasProfile, hasSurvey } = useAuth();
  const { progress } = useProgress();
  const onboarded = !!user && hasProfile && hasSurvey;

  return (
    <div className="container-apex py-16">
      {onboarded && (
        <Link
          to="/members"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-foam/60 transition hover:text-glow"
        >
          <ArrowLeft className="h-4 w-4" /> Course Home
        </Link>
      )}

      <span className="pill">The Program</span>
      <h1 className="mt-4 font-display text-4xl font-bold">A five-month migration</h1>
      <p className="mt-3 max-w-2xl text-foam/75">
        An orientation plus {CORE_PHASES.length} phases mapped to the life-cycle of an apex predator.
        Each pairs objectives, micro-lessons and a hands-on workshop with one live conversation you
        have to actually hold — then a debrief that turns it into skill you keep.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {PHASES.map((p) => (
          <PhaseCard key={p.slug} phase={p} completed={progress[p.slug]?.status === "completed"} />
        ))}
      </div>

      {!user && (
        <div className="mt-14 rounded-2xl border border-glow/25 bg-glow/5 p-8 text-center">
          <h2 className="font-display text-xl font-bold">Joining the cohort?</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-foam/70">
            Registration takes a minute — we send a magic link, no password. You&apos;ll complete a
            short pre-program survey, then the course opens.
          </p>
          <Link to="/register" className="btn-primary mt-6">
            Register for the cohort
          </Link>
        </div>
      )}
    </div>
  );
}
