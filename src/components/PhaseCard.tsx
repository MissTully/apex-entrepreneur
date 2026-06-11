import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Phase } from "../data/curriculum";

export default function PhaseCard({ phase }: { phase: Phase }) {
  return (
    <Link to={`/program/${phase.slug}`} className="card-reef group flex flex-col">
      <div className="mb-3 flex items-center justify-between">
        <span className="pill">Phase {phase.month}</span>
        <span className="font-display text-3xl font-bold text-white/10 transition group-hover:text-glow/30">
          0{phase.month}
        </span>
      </div>
      <h3 className="font-display text-xl font-semibold text-foam">{phase.codename}</h3>
      <p className="mt-1 text-sm text-glow/90">{phase.title}</p>
      <p className="mt-3 flex-1 text-sm text-foam/70">{phase.tagline}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-glow">
        Explore phase
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
