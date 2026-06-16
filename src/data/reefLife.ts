/**
 * reefLife.ts — the program's wider cast of sea life.
 *
 * The site's spine is the apex-predator (shark) metaphor. This file introduces
 * the *rest of the reef* — the octopus, the lobster, the devil ray, the school,
 * and the home waters — so the visual language isn't shark-only, and so each
 * creature can carry a small entrepreneurial lesson that ties back to the
 * curriculum's "power skills" theme.
 *
 * WHY THIS IS A SEPARATE FILE
 * ---------------------------
 * Just like `phaseArt.ts` keeps a phase's *art* separate from `curriculum.ts`
 * (its *content*), this file keeps the reef "cast" in one place. Three different
 * parts of the UI read from it:
 * 1. <ReefGallery/> — the "Inhabitants of the Reef" section on the landing page
 * 2. <CreatureFrame/> — a secondary creature image on each phase page
 * 3. <ReefAccent/> — small decorative creature images tucked into sections
 *
 * Change a creature here once and all three update. That single-source-of-truth
 * pattern is the thing to keep as you extend the site.
 *
 * IMAGES
 * ------
 * Each `image` lives in `public/images/` (see that folder's README). If an image
 * is ever missing, the components degrade gracefully to a soft gradient tile, so
 * a missing file never breaks the page.
 *
 * ACCENT colours are Tailwind token names already defined in tailwind.config.ts
 * (glow / kelp / lagoon / urchin / ember). They MUST be referenced as whole,
 * literal class strings somewhere in source or Tailwind's JIT compiler won't
 * generate them — that mapping is done in the components, not here.
 */

export type CreatureKind =
    | "octopus"
  | "lobster"
  | "ray"
  | "shark"
  | "school"
  | "waters";

export interface ReefCreature {
    /** Stable id (used as React key and for lookups). */
  id: string;
    /** Display name shown on the card / panel. */
  name: string;
    /** What kind of sea life this is (drives nothing visual; useful for filtering). */
  kind: CreatureKind;
    /** Painting in public/images/ (clean filename, copied from your library). */
  image: string;
    /** object-position focal point for the crop, e.g. "center 40%". */
  focal: string;
    /** Tailwind accent token shared with the phase palette. */
  accent: "glow" | "kelp" | "lagoon" | "urchin" | "ember";
    /** A 2–4 word "power skill" this creature embodies. */
  trait: string;
    /** One evocative sentence connecting the creature to the entrepreneur. */
  blurb: string;
    /**
     * Optional phase slug this creature is paired with. When set, the matching
     * phase page shows this creature as its secondary image. Slugs must match
     * those in curriculum.ts / phaseArt.ts.
     */
  phaseSlug?: string;
}

/**
 * THE CAST.
 * Order here is the order shown in the landing-page gallery.
 * Five of the six are paired to a phase (see `phaseSlug`); the order roughly
 * follows the program's arc from positioning to launch.
 */
export const REEF_LIFE: ReefCreature[] = [
  {
        id: "great-white",
        name: "The Great White",
        kind: "shark",
        image: "/images/reef-apex.png",
        focal: "center 38%",
        accent: "glow",
        trait: "Apex positioning",
        blurb:
                "Stillness, then certainty. The founder who knows exactly where they sit in the water moves only when the moment is right.",
        phaseSlug: "apex-positioning",
  },
  {
        id: "octopus",
        name: "The Octopus",
        kind: "octopus",
        image: "/images/reef-octopus.png",
        focal: "center 45%",
        accent: "kelp",
        trait: "Adaptive intelligence",
        blurb:
                "Eight arms, one mind. The octopus builds, probes, and reshapes its structure to fit the reef — the essence of scaffolding a venture.",
        phaseSlug: "coral-scaffolding",
  },
  {
        id: "devil-ray",
        name: "The Devil Ray",
        kind: "ray",
        image: "/images/mtully_httpss.mj.runRo-xNxGOtDE_school_of_rays_a_devil_ray_a__45557667-8103-4f7e-bb7f-720d6f25704a_0.png",
        focal: "center 42%",
        accent: "lagoon",
        trait: "Riding the current",
        blurb:
                "It doesn't fight the open water; it reads it and glides. Negotiation and exchange reward those who move with the current, not against it.",
        phaseSlug: "navigating-the-currents",
  },
  {
        id: "the-school",
        name: "The School",
        kind: "school",
        image: "/images/mtully_fish_swimming_in_same_direction_tight_formation_school_7f34b34d-ecdd-458c-b02d-ad15daf546a5_2.png",
        focal: "center 40%",
        accent: "urchin",
        trait: "Move as one",
        blurb:
                "No single fish leads, yet the school turns as a body. Great teams coordinate without a constant hand on the wheel.",
        phaseSlug: "schooling-strategy",
  },
  {
        id: "home-waters",
        name: "The Home Waters",
        kind: "waters",
        image: "/images/reef-home.png",
        focal: "center 55%",
        accent: "ember",
        trait: "The crossing",
        blurb:
                "Every migration aims somewhere. Tampa's skyline on the water is the destination — the launch the whole journey was built toward.",
        phaseSlug: "the-migration",
  },
  {
        id: "lobster",
        name: "The Lobster",
        kind: "lobster",
        image: "/images/reef-lobster.png",
        focal: "center 55%",
        accent: "kelp",
        trait: "Grow by molting",
        blurb:
                "To grow, the lobster must shed the shell that kept it safe. Discomfort isn't the obstacle to growth — it's the mechanism of it.",
        // Paired with the Introduction module: the lobster's molt is that phase's
        // whole thesis — shed the beliefs that kept you safe to make room to grow.
        phaseSlug: "entering-the-reef",
  },
  ];

/** Fast lookup by id. */
export const REEF_BY_ID: Record<string, ReefCreature> = Object.fromEntries(
    REEF_LIFE.map((c) => [c.id, c]),
  );

/**
 * Phase-slug → creature map, built from the `phaseSlug` field above.
 * Phase.tsx uses this to show a secondary creature image for the current phase.
 */
export const PHASE_CREATURE: Record<string, ReefCreature> = Object.fromEntries(
    REEF_LIFE.filter((c) => c.phaseSlug).map((c) => [c.phaseSlug as string, c]),
  );

/** Safe lookup; returns undefined if a phase has no paired creature. */
export function getPhaseCreature(slug: string): ReefCreature | undefined {
    return PHASE_CREATURE[slug];
}
