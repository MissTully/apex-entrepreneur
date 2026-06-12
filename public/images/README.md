# Reef-Native artwork — drop your images here

The site is wired to read **six images** from this folder. Save each of your
paintings here using the **exact filename** in the left column. The moment a file
is present, that part of the site uses it; if a file is missing, the page falls
back to the fully-coded animated reef scene, so nothing ever breaks.

> Use `.jpg` files with these exact names. If your originals are `.png`, see
> "If your files are PNG" at the bottom.

| Save your image as…                     | Use this painting (by what's in it)                                            | Where it appears                                  |
| ---------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------- |
| `hero.jpg`                               | Two sharks + a ray gliding through bright, sun-rayed teal water (impasto oil)   | Landing-page hero (the big opening image)         |
| `phase-apex-positioning.jpg`             | A single great white gliding over a sunlit coral reef (with a lobster below)    | Phase 1 — Apex Positioning                        |
| `phase-coral-scaffolding.jpg`            | Vibrant orange octopus + blue lobster on a colorful, structured reef            | Phase 2 — Coral Scaffolding                       |
| `phase-navigating-the-currents.jpg`      | Three sharks in flowing blue-and-gold marbled water                             | Phase 3 — Navigating the Currents                 |
| `phase-schooling-strategy.jpg`           | A tight cluster / "school" of stylized blue shark heads                         | Phase 4 — Schooling Strategy                      |
| `phase-the-migration.jpg`                | The Tampa skyline at sunset, reflected in the water (oil painting)              | Phase 5 — The Migration                           |

## Optional alternates

These extras from your set aren't required, but you can swap any of them in by
saving them under one of the names above (the content is what matters, not which
specific painting you choose):

- Realistic octopus + lobster + shark on a blue reef
- Big octopus close-up with a great white (purple/blue)
- Top-down orange octopus in clear blue water
- Octopus close-up + shark + blue lobster
- The stylized shark "concept sheet" on a grey background

## If your files are PNG

Either (a) export/save them as `.jpg`, **or** (b) keep them as `.png` and just
tell me — I'll switch the six references in `src/data/phaseArt.ts` from `.jpg`
to `.png` in one pass. The filenames (minus extension) must stay exactly as above.

## Tips for the best look

- These are shown **full-bleed** behind text, so larger is better: aim for at
  least **1600 px on the long edge**. Bigger files are fine.
- The hero and each phase header crop to a focal point set in
  `src/data/phaseArt.ts` (the `focal` value, e.g. `"center 40%"`). If a subject
  ends up cropped awkwardly, tell me and I'll nudge the focal point.

---

# Reef "cast" — the wider sea-life images

Beyond the six full-bleed backgrounds above, the site now shows a **cast of
reef creatures** (octopus, lobster, devil ray, the school, the home waters, and
the apex shark). These appear in three places: the "Inhabitants of the reef"
gallery on the landing page, a companion image on each phase page, and small
decorative "portholes" tucked into landing-page sections.

All six are read from these filenames (already copied here from your library):

| Filename                  | What's in it                                              | Power skill it carries   |
| ------------------------- | -------------------------------------------------------- | ------------------------ |
| `reef-apex.png`           | Great white over a sunlit reef                           | Apex positioning         |
| `reef-octopus.png`        | Vibrant orange octopus on a colourful reef               | Adaptive intelligence    |
| `reef-ray.png`            | Devil rays gliding through blue-gold water               | Riding the current       |
| `reef-school.png`         | A tight cluster of stylised shark heads (the "school")   | Move as one              |
| `reef-home.png`           | Tampa skyline at sunset, reflected in the water          | The crossing             |
| `reef-lobster.png`        | Lobster on the reef floor                                | Grow by molting          |

**The single source of truth for this cast is `src/data/reefLife.ts`** — names,
the one-line lessons, focal crop points, and which phase each creature is paired
to all live there. To swap a painting, just replace the file above (keep the
name). To re-pair a creature to a different phase, edit its `phaseSlug` in
`reefLife.ts`. If a file is missing, the card falls back to a soft gradient, so
nothing ever breaks.
