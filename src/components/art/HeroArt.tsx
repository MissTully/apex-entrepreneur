import { ReactNode, useState } from "react";
import { HERO_IMAGE } from "../../data/phaseArt";
import type { Motif } from "../../data/phaseArt";
import ReefScene from "./ReefScene";

/**
 * HeroArt — the cinematic backdrop for a hero section.
 *
 * Primary: a painting from `public/images/`, shown full-bleed with gentle motion
 * layers (caustics, rising particles) and a vignette so text stays legible. If the
 * image can't load, it degrades to the fully-coded <ReefScene/> — so the page is
 * always beautiful.
 *
 * Callers pass `src`: the Phase page passes that phase's painting from
 * `phaseArt.ts`, the landing page passes HERO_IMAGE. The default below is the
 * same hero, so a caller that omits `src` still gets a real file rather than the
 * placeholder path this used to point at.
 */
export default function HeroArt({
  motif = "apex",
  src = HERO_IMAGE,
  focal = "center 38%",
  children,
}: {
  motif?: Motif;
  src?: string;
  /** object-position for the painting's focal point. */
  focal?: string;
  children?: ReactNode;
}) {
  const [imgOk, setImgOk] = useState(true);

  return (
    <div className="relative isolate overflow-hidden">
      {/* Painting layer (or coded fallback) */}
      <div className="absolute inset-0 -z-10">
        {imgOk ? (
          <>
            <img
              src={src}
              alt="An apex predator gliding over a sunlit coral reef — the Apex program's guiding image."
              onError={() => setImgOk(false)}
              className="h-full w-full object-cover"
              style={{ objectPosition: focal }}
              loading="eager"
            />
            {/* Motion + legibility over the painting */}
            <div className="pointer-events-none absolute inset-0 caustic-layer animate-caustic opacity-70" />
            <div className="pointer-events-none absolute inset-0 scene-vignette" />
            {/* a few rising bubbles to make the still image feel alive */}
            {[
              { left: "14%", d: "0s", s: 3, t: "12s" },
              { left: "29%", d: "3s", s: 2, t: "10s" },
              { left: "63%", d: "1.5s", s: 3, t: "13s" },
              { left: "84%", d: "4s", s: 2, t: "11s" },
            ].map((p, i) => (
              <span
                key={i}
                aria-hidden
                className="pointer-events-none absolute bottom-0 rounded-full bg-shallow/60 animate-rise"
                style={{ left: p.left, width: p.s, height: p.s, animationDelay: p.d, animationDuration: p.t }}
              />
            ))}
          </>
        ) : (
          <ReefScene motif={motif} />
        )}
      </div>

      {children}
    </div>
  );
}
