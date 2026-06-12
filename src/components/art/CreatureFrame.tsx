import type { ReefCreature } from "../../data/reefLife";
import { getAccentClasses } from "./reefAccentClasses";
import CreatureImage from "./CreatureImage";

/**
 * CreatureFrame — a phase page's secondary sea-life image.
 *
 * The phase hero is a full-bleed shark painting; this is the smaller, framed
 * "companion" creature shown lower on the page (octopus, ray, lobster, …). It
 * gives each phase a second, non-shark visual and a one-line lesson.
 *
 * Pass the creature from PHASE_CREATURE[slug]. Renders nothing if undefined,
 * so a phase without a paired creature simply omits the panel.
 */
export default function CreatureFrame({ creature }: { creature?: ReefCreature }) {
  if (!creature) return null;
  const accent = getAccentClasses(creature.accent);

  return (
    <figure
      className={`overflow-hidden rounded-3xl border bg-deep/60 ring-1 ${accent.border} ${accent.ring}`}
    >
      <div className="relative h-72 overflow-hidden sm:h-80">
        <CreatureImage src={creature.image} alt={`${creature.name} — ${creature.trait}`} focal={creature.focal} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-deep/90 via-transparent to-transparent" />
        <figcaption className="absolute bottom-4 left-5 right-5">
          <span className={`pill ${accent.border} ${accent.bg} ${accent.text}`}>{creature.trait}</span>
          <h3 className="mt-2 font-display text-2xl font-bold text-shadow-deep">{creature.name}</h3>
        </figcaption>
      </div>
      <p className="px-6 py-5 text-sm leading-relaxed text-foam/75">{creature.blurb}</p>
    </figure>
  );
}
