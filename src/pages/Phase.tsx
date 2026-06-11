import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Target } from "lucide-react";
import { getPhase, PHASES } from "../data/curriculum";

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

  const index = PHASES.findIndex((p) => p.slug === phase.slug);
  const prev = PHASES[index - 1];
  const next = PHASES[index + 1];

  return (
    <div className="container-apex py-16">
      <Link to="/program" className="inline-flex items-center gap-1 text-sm text-foam/60 hover:text-glow">
        <ArrowLeft className="h-4 w-4" /> All phases
      </Link>

      <div className="mt-6 animate-fade-up">
        <span className="pill">Phase {phase.month}</span>
        <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">{phase.codename}</h1>
        <p className="mt-2 text-lg text-glow/90">{phase.title}</p>
        <p className="mt-6 max-w-3xl text-lg italic text-foam/80">&ldquo;{phase.tagline}&rdquo;</p>
        <p className="mt-4 max-w-3xl text-foam/75">{phase.overview}</p>
      </div>

      <h2 className="mt-12 font-display text-2xl font-bold">Learning objectives</h2>
      <div className="mt-6 space-y-4">
        {phase.objectives.map((o) => (
          <div key={o.title} className="card-reef flex gap-4">
            <Target className="mt-1 h-6 w-6 shrink-0 text-glow" />
            <div>
              <h3 className="font-display text-lg font-semibold">{o.title}</h3>
              <p className="mt-1 text-sm text-foam/70">{o.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Phase navigation */}
      <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-6">
        {prev ? (
          <Link to={`/program/${prev.slug}`} className="btn-ghost">
            <ArrowLeft className="h-4 w-4" /> {prev.codename}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/program/${next.slug}`} className="btn-primary">
            {next.codename} <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
