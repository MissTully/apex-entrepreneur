# Reef-Native artwork

Every image the site reads lives here. **Filenames are load-bearing** — the code
references them exactly, so replacing a painting means overwriting the file, not
adding a new one alongside it.

If a file is ever missing, nothing breaks: the hero degrades to the fully-coded
animated `<ReefScene/>`, and creature cards degrade to a soft gradient tile.

## Full-bleed phase backdrops

Shown behind the hero text on each phase page. Referenced from
`src/data/phaseArt.ts`, which also sets each one's `focal` crop point.

| Filename | What's in it | Where it appears |
|---|---|---|
| `hero.png` | Two sharks and a ray in bright, sun-rayed teal water | Landing-page hero |
| `reef-lobster.png` | Lobster on the reef floor | Phase 0 — Entering the Reef |
| `phase-apex-positioning.png` | A single great white over a sunlit coral reef | Phase 1 — Apex Positioning |
| `phase-coral-scaffolding.png` | Orange octopus and blue lobster on a structured reef | Phase 2 — Coral Scaffolding |
| `phase-navigating-the-currents.png` | Three sharks in flowing blue-and-gold water | Phase 3 — Navigating the Currents |
| `phase-schooling-strategy.png` | A tight cluster of stylised blue shark heads | Phase 4 — Schooling Strategy |
| `phase-the-migration.png` | The Tampa skyline at sunset, reflected in the water | Phase 5 — The Migration |

Aim for at least **1600 px on the long edge** — these are shown full-bleed behind
text. If a subject crops awkwardly, adjust that phase's `focal` value in
`phaseArt.ts` rather than re-cropping the file.

## The reef cast

The creature cards in the landing page's "Inhabitants of the reef" gallery, and
the companion image on each phase page. The single source of truth for names,
lessons, focal points, and phase pairings is **`src/data/reefLife.ts`** — edit
there, not here.

| Filename | What's in it | Power skill |
|---|---|---|
| `reef-apex.png` | Great white over a sunlit reef | Apex positioning |
| `reef-octopus.png` | Vibrant orange octopus on a colourful reef | Adaptive intelligence |
| `reef-lobster.png` | Lobster on the reef floor | Grow by molting |
| `reef-home.png` | Tampa skyline at sunset, reflected in the water | The crossing |
| `mtully_httpss.mj.run…devil_ray…_0.png` | Devil rays gliding through blue-gold water | Riding the current |
| `mtully_fish_swimming…school…_2.png` | A school in tight formation | Move as one |

> **Known inconsistency.** The last two still use their original generated
> filenames, while `reef-ray.png` and `reef-school.png` — clean-named files with
> the same subjects — sit here unused. Either repoint `reefLife.ts` at the clean
> names or delete the unused pair; don't leave both.

## Character portraits

Avatars for the simulation counterparts, referenced from
`src/data/scenarioBriefs.ts` as `character.avatar`. Square, face near the top —
they're cropped to a circle with `object-position: top`.

| Filename | Character | Scenario |
|---|---|---|
| `maren.webp` | Maren Cole | Entering the Reef, Coral Scaffolding |
| `dale.png` | Dale Mercer | The Dock Deal |
| `marcus.webp` | Marcus Vane | The Reef-Supply Contract |
| `priya.png` | Priya Raman | Breaking Formation |
| _(none yet)_ | Theo Hanson | Open Water — falls back to a generic icon |

## Adding or replacing an image

- **Replacing** — overwrite the file, keep the name. Nothing else to change.
- **Adding a phase backdrop** — drop the file here, then add the phase to
  `PHASE_ART` in `src/data/phaseArt.ts`.
- **Adding a portrait** — drop the file here, then set `character.avatar` on that
  scenario in `src/data/scenarioBriefs.ts`.

Prefer `.png` or `.webp`. The code references extensions literally, so a `.jpg`
swapped in under a `.png` name will 404 into the fallback.
