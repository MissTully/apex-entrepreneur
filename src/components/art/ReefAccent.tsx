import { REEF_BY_ID } from "../../data/reefLife";
import CreatureImage from "./CreatureImage";

/**
 * ReefAccent — a small, soft, decorative creature image.
 *
 * Tuck one into the corner of a section as a circular "porthole" of sea life.
 * Purely decorative (aria-hidden) and low-opacity so foreground text always
 * wins. It supplements the coded SVG motifs rather than replacing them.
 *
 * Usage: place inside a `relative` container.
 *   <div className="relative ...">
 *     <ReefAccent id="octopus" side="right" />
 *     ...content...
 *   </div>
 */
export default function ReefAccent({
  id,
  side = "right",
  className = "",
}: {
  /** A creature id from reefLife.ts (e.g. "octopus", "lobster"). */
  id: string;
  /** Which side to float on. */
  side?: "left" | "right";
  className?: string;
}) {
  const creature = REEF_BY_ID[id];
  if (!creature) return null;

  const sidePos = side === "right" ? "right-0 sm:-right-6" : "left-0 sm:-left-6";

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute top-1/2 hidden -translate-y-1/2 lg:block ${sidePos} ${className}`}
    >
      <div className="h-40 w-40 overflow-hidden rounded-full border border-white/10 opacity-25 shadow-2xl shadow-abyss/60 [mask-image:radial-gradient(circle,black_55%,transparent_78%)]">
        <CreatureImage src={creature.image} alt="" focal={creature.focal} className="animate-float-slow" />
      </div>
    </div>
  );
}
