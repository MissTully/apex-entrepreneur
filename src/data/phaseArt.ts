/**
 * Per-phase visual identity.
 *
 * Kept separate from curriculum.ts (the content source of truth) so art and copy
 * evolve independently. Each phase carries:
 *   - one dominant hue (Tailwind token) borrowed from the reef palette,
 *   - a coded `motif` (the fallback SVG silhouette), and
 *   - a real painting (`image`) shown full-bleed, with a `focal` crop point.
 *
 * Drop the matching files into `public/images/` (see that folder's README).
 * If an image is missing, HeroArt degrades gracefully to the coded ReefScene.
 *
 * Accent values are Tailwind token names already defined in tailwind.config.ts.
 */

export type Motif = "apex" | "scaffold" | "current" | "school" | "migration" | "lobster";

/** The landing-page hero painting. */
export const HERO_IMAGE = "/images/hero.png";
/** Focal point (object-position) for the hero crop. */
export const HERO_FOCAL = "center 42%";

export interface PhaseArt {
  /** Tailwind color token for this phase's accent (text-/border-/bg-<accent>). */
  accent: "glow" | "kelp" | "lagoon" | "urchin" | "ember";
  /** Which coded hero motif to render as the fallback. */
  motif: Motif;
  /** Full-bleed painting for this phase (lives in public/images/). */
  image: string;
  /** object-position for the painting's focal point. */
  focal: string;
  /** Short, evocative label for the phase's "depth" in the program. */
  depthLabel: string;
  /** A one-word feeling for the phase, shown as an eyebrow over the hero. */
  mood: string;
}

export const PHASE_ART: Record<string, PhaseArt> = {
  "entering-the-reef": {
    accent: "kelp",
    motif: "lobster",
    image: "/images/reef-lobster.png",
    focal: "center 55%",
    depthLabel: "The shallows · first contact",
    mood: "Awaken",
  },
  "apex-positioning": {
    accent: "glow",
    motif: "apex",
    image: "/images/phase-apex-positioning.png",
    focal: "center 38%",
    depthLabel: "Surface · clarity",
    mood: "Focus",
  },
  "coral-scaffolding": {
    accent: "kelp",
    motif: "scaffold",
    image: "/images/phase-coral-scaffolding.png",
    focal: "center 50%",
    depthLabel: "Reef shelf · structure",
    mood: "Build",
  },
  "navigating-the-currents": {
    accent: "lagoon",
    motif: "current",
    image: "/images/phase-navigating-the-currents.png",
    focal: "center 45%",
    depthLabel: "Open water · exchange",
    mood: "Flow",
  },
  "schooling-strategy": {
    accent: "urchin",
    motif: "school",
    image: "/images/phase-schooling-strategy.png",
    focal: "center 40%",
    depthLabel: "The shoal · coordination",
    mood: "Lead",
  },
  "the-migration": {
    accent: "ember",
    motif: "migration",
    image: "/images/phase-the-migration.png",
    focal: "center 55%",
    depthLabel: "The crossing · launch",
    mood: "Depart",
  },
};

/** Safe lookup with a sensible default so a new phase never crashes the page. */
export function getPhaseArt(slug: string): PhaseArt {
  return (
    PHASE_ART[slug] ?? {
      accent: "glow",
      motif: "apex",
      image: HERO_IMAGE,
      focal: "center 40%",
      depthLabel: "Open water",
      mood: "Dive",
    }
  );
}
