/**
 * reefAccentClasses.ts — literal Tailwind class strings, keyed by accent token.
 *
 * IMPORTANT (Tailwind JIT): Tailwind only generates a class if it can find that
 * class as a *complete literal string* in the source. Never build a class by
 * string concatenation like `text-${accent}` — it won't be generated and the
 * colour will silently go missing. So every accent's classes are spelled out in
 * full here, and the reef components import this map.
 *
 * The accent tokens (glow / kelp / lagoon / urchin / ember) are defined in
 * tailwind.config.ts and shared with the phase palette in phaseArt.ts.
 */
export interface AccentClasses {
  /** Coloured text. */
  text: string;
  /** Subtle coloured border. */
  border: string;
  /** Faint coloured background wash. */
  bg: string;
  /** Coloured ring (used on hover/focus frames). */
  ring: string;
}

export const REEF_ACCENT: Record<string, AccentClasses> = {
  glow: { text: "text-glow", border: "border-glow/40", bg: "bg-glow/10", ring: "ring-glow/40" },
  kelp: { text: "text-kelp", border: "border-kelp/40", bg: "bg-kelp/10", ring: "ring-kelp/40" },
  lagoon: { text: "text-shallow", border: "border-lagoon/50", bg: "bg-lagoon/15", ring: "ring-lagoon/40" },
  urchin: { text: "text-urchin", border: "border-urchin/40", bg: "bg-urchin/10", ring: "ring-urchin/40" },
  ember: { text: "text-ember", border: "border-ember/40", bg: "bg-ember/10", ring: "ring-ember/40" },
};

/** Safe lookup with a sensible default so an unknown accent never crashes. */
export function getAccentClasses(accent: string): AccentClasses {
  return REEF_ACCENT[accent] ?? REEF_ACCENT.glow;
}
