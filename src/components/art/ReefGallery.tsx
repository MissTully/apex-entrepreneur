import { Link } from "react-router-dom";
import { REEF_LIFE } from "../../data/reefLife";
import { getAccentClasses } from "./reefAccentClasses";
import CreatureImage from "./CreatureImage";

/**
 * ReefGallery — "Inhabitants of the Reef".
 *
 * A responsive grid that introduces the program's wider cast of sea life beyond
 * the apex shark. Each card pairs a painting from your library with the "power
 * skill" that creature embodies. Cards paired to a phase (REEF_LIFE[].phaseSlug)
 * link straight to that phase page; the unpaired lobster is a non-linking
 * "cross-cutting" card.
 *
 * Reads everything from src/data/reefLife.ts — edit the cast there, not here.
 */
export default function ReefGallery() {
  return (
    <section id="reef-life" className="container-apex py-16">
      <div className="max-w-2xl">
        <span className="pill pill-kelp">The wider reef</span>
        <h2 className="mt-4 font-display text-3xl font-bold">Inhabitants of the reef</h2>
        <p className="mt-2 text-foam/70">
          The shark sets the program&apos;s spine, but a reef is a whole community. Each creature
          here carries one power skill — and points to the phase where you&apos;ll practice it.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {REEF_LIFE.map((c) => {
          const accent = getAccentClasses(c.accent);

          // The visual card is identical whether or not it links; we just wrap
          // it in a <Link> when the creature is paired to a phase.
          const inner = (
            <div
              className={`group h-full overflow-hidden rounded-3xl border border-white/10 bg-deep/60 backdrop-blur-sm transition hover:-translate-y-1 ${accent.border}`}
            >
              <div className="relative h-56 overflow-hidden">
                <CreatureImage
                  src={c.image}
                  alt={`${c.name} — ${c.trait}`}
                  focal={c.focal}
                  className="transition duration-700 group-hover:scale-105"
                />
                {/* gradient so the title stays legible over the painting */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-deep via-deep/20 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <span className={`pill ${accent.border} ${accent.bg} ${accent.text}`}>
                    {c.trait}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-display text-xl font-semibold">{c.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foam/70">{c.blurb}</p>
                {c.phaseSlug && (
                  <span
                    className={`mt-4 inline-flex items-center gap-1 text-sm font-semibold ${accent.text}`}
                  >
                    Practice this →
                  </span>
                )}
              </div>
            </div>
          );

          return c.phaseSlug ? (
            <Link key={c.id} to={`/program/${c.phaseSlug}`} className="block">
              {inner}
            </Link>
          ) : (
            <div key={c.id}>{inner}</div>
          );
        })}
      </div>
    </section>
  );
}
