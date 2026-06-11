import type { Motif } from "../../data/phaseArt";
import PhaseMotif from "./PhaseMotif";

/**
 * ReefScene — a fully coded, animated underwater atmosphere.
 *
 * Pure CSS + inline SVG (no image files, no external requests) so it honors the
 * program's own Reef-Native creed: zero install, offline-first, tiny payload.
 * It renders BEHIND content as an absolutely-positioned layer.
 *
 * Layers, back to front:
 *   1. Depth gradient (abyss -> lagoon)
 *   2. God-ray shafts (swaying)
 *   3. Caustic dapples (drifting)
 *   4. Rising plankton/bubble particles
 *   5. A parallax reef silhouette + the phase motif
 *
 * It is also the graceful fallback shown when the hero painting isn't present.
 */
export default function ReefScene({ motif = "apex" }: { motif?: Motif }) {
  // Deterministic particle field (no layout shift, no randomness on the client).
  const particles = [
    { left: "8%", delay: "0s", size: 3, dur: "11s" },
    { left: "18%", delay: "2.5s", size: 2, dur: "9s" },
    { left: "31%", delay: "1.2s", size: 4, dur: "13s" },
    { left: "44%", delay: "3.4s", size: 2, dur: "10s" },
    { left: "57%", delay: "0.8s", size: 3, dur: "12s" },
    { left: "69%", delay: "2.1s", size: 2, dur: "9.5s" },
    { left: "80%", delay: "4s", size: 4, dur: "14s" },
    { left: "91%", delay: "1.7s", size: 2, dur: "10.5s" },
  ];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* 1 · Depth gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-lagoon/40 via-deep to-abyss" />

      {/* 2 · God-ray shafts */}
      <div className="absolute -top-1/4 left-[10%] h-[150%] w-24 god-ray animate-sway" style={{ animationDelay: "0s" }} />
      <div className="absolute -top-1/4 left-[34%] h-[150%] w-16 god-ray animate-sway" style={{ animationDelay: "2s" }} />
      <div className="absolute -top-1/4 left-[58%] h-[150%] w-28 god-ray animate-sway" style={{ animationDelay: "4s" }} />
      <div className="absolute -top-1/4 left-[82%] h-[150%] w-14 god-ray animate-sway" style={{ animationDelay: "1s" }} />

      {/* 3 · Caustic dapples */}
      <div className="absolute inset-0 caustic-layer animate-caustic" />

      {/* 4 · Rising particles */}
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute bottom-0 rounded-full bg-shallow/70 animate-rise"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.dur,
          }}
        />
      ))}

      {/* 5 · Reef silhouette + phase motif, parallax-floating along the floor */}
      <div className="absolute inset-x-0 bottom-0">
        <PhaseMotif motif={motif} />
      </div>

      {/* Subtle top-down vignette to seat content */}
      <div className="absolute inset-0 scene-vignette" />
    </div>
  );
}
