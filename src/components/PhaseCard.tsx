import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Phase } from "../data/curriculum";
import { getPhaseArt } from "../data/phaseArt";

/** Tailwind needs literal class strings, so map each accent to a full gradient. */
const ACCENT_WASH: Record<string, string> = {
  glow: "from-tide/40 to-glow/20",
  kelp: "from-kelp/40 to-ember/20",
  lagoon: "from-lagoon/50 to-shallow/20",
  urchin: "from-urchin/40 to-lagoon/20",
  ember: "from-ember/40 to-kelp/20",
};

export default function PhaseCard({ phase }: { phase: Phase }) {
  const art = getPhaseArt(phase.slug);
  const wash = ACCENT_WASH[art.accent] ?? ACCENT_WASH.glow;
  const [imgOk, setImgOk] = useState(true);

  return (
    <Link to={`/program/${phase.slug}`} className="card-reef group flex flex-col overflow-hidden !p-0">
      {/* Thumbnail (or coded gradient fallback) */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {imgOk ? (
          <img
            src={art.image}
            alt=""
            aria-hidden
            onError={() => setImgOk(false)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            style={{ objectPosition: art.focal }}
            loading="lazy"
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${wash}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/30 to-transparent" />
        <span className="pill absolute left-4 top-4">{phase.month === 0 ? "Orientation" : `Phase ${phase.month}`}</span>
        <span className="absolute bottom-3 right-4 font-display text-4xl font-bold text-white/15 transition group-hover:text-glow/40">
          0{phase.month}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-semibold text-foam">{phase.codename}</h3>
        <p className="mt-1 text-sm text-glow/90">{phase.title}</p>
        <p className="mt-3 flex-1 text-sm text-foam/70">{phase.tagline}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-glow">
          Explore phase
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
