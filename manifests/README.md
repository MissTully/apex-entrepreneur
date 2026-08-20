# Module & Scenario Manifests

Machine-readable **instructional-design specs** for the six Apex program modules
(an orientation plus five phases), and the six experiential scenarios that go with
them. Derived from `src/data/curriculum.ts` (the curriculum single-source-of-truth)
and expanded with learning-engineering fields so a tutoring engine can drive
sequencing, delivery, and assessment.

## Files

```
manifests/
  index.json              # Ordered list of modules + prerequisites (start here)
  module.schema.json      # JSON Schema (draft-07) every module validates against
  scenario.schema.json    # JSON Schema every scenario validates against
  modules/
    00-entering-the-reef.json
    01-apex-positioning.json
    02-coral-scaffolding.json
    03-navigating-the-currents.json
    04-schooling-strategy.json
    05-the-migration.json
  scenarios/
    entering-the-reef-S1.json        # Maren Cole — coaching conversation
    apex-positioning-S1.json         # Dale Mercer — The Dock Deal
    coral-scaffolding-S1.json        # Maren Cole — advisory conversation
    navigating-the-currents-S1.json  # Marcus Vane — The Reef-Supply Contract
    schooling-strategy-S1.json       # Priya Raman — Breaking Formation
    the-migration-S1.json            # Theo Hanson — Open Water
```

## Module fields

| Field | Meaning |
|-------|---------|
| `moduleId` | Stable kebab-case id; matches the phase `slug` in `curriculum.ts`. |
| `order` | Sequence position (1–6; the orientation module is 1). |
| `codename` / `title` / `tagline` / `summary` | Themed name, academic title, hook, framing paragraph. |
| `estimatedDuration` | `{ weeks, instructionalHours }`. |
| `prerequisites` | `moduleId`s that must be completed first. |
| `competencies` | Program-level competencies the module advances. |
| `learningObjectives` | Measurable objectives. Each has a `bloomLevel` (Bloom's taxonomy), an `actionVerb`, the `sourceObjective` it came from, and `assessmentIds` that measure it. |
| `lessons` | Ordered teaching units; each links to the `objectiveIds` it serves and lists `activities`. |
| `assessments` | `formative` (practice) or `summative` (graded) checks, each with `successCriteria` and the `objectiveIds` it measures. |
| `completionCriteria` | What "done" means: objectives to master, required assessments, passing threshold, capstone. |
| `resources` | Pointers back into the codebase. |

## ID conventions (so cross-references resolve)

- Learning objective: `<moduleId>-LO<n>` — e.g. `apex-positioning-LO1`
- Lesson: `<moduleId>-L<n>`
- Assessment: `<moduleId>-A<n>`

Objectives reference the assessments that measure them, and assessments reference
the objectives they cover — a two-way link an engine can use to verify
**constructive alignment** (every objective is taught and assessed).

## Scenario files

Each scenario drives one live simulation. The blocks that matter:

| Block | Purpose | Reaches the browser? |
|-------|---------|----------------------|
| `learnerBrief` | The setup: role, goal, and what the learner knows going in. | **Yes** |
| `character.persona` / `voice` | Who the counterpart appears to be. | **Yes** |
| `character.hiddenState` | Secret goals, reservation value, opening anchor, concession logic, tells. This is what makes the counterpart behave like a person instead of a script. | **Never** — server only |
| `character.behaviorRules` | Hard constraints: stay in character, never reveal the hidden state, never coach. | No |
| `successSignals` | Objective-aligned behaviors the debrief looks for in the transcript. | No |
| `scoring` | The rubric `/api/score` judges against and the coach presents at its final stage. Required — without it scoring returns 400 for that phase. | Dimension *names* only |
| `debrief` | The Kolb configuration: four stages, each with an intent and adaptable seed prompts. | No |

Public fields are mirrored into `src/data/scenarioBriefs.ts`, and the validator
checks that the two agree. Never copy `hiddenState` there — the whole "make the
learner earn every read" design collapses if a learner can open devtools and read
the counterpart's cards.

### Scenario ID conventions

- Scenario: `<moduleId>-S<n>` — e.g. `navigating-the-currents-S1`
- Success signal: `<scenarioId>-sig<n>`
- Scoring dimension: `D1`, `D2`, … — these become the JSON keys the scorer returns

### Adding a scenario

1. Author the JSON in `manifests/scenarios/`, including a `scoring` block.
2. Register it in `api/_scenarios.ts` so the endpoints can resolve it by id.
3. Add its **public** fields to `src/data/scenarioBriefs.ts` under the phase slug.
4. Run `npm run validate`.

## Validating

```sh
npm run validate
```

This runs `scripts/validate-manifests.mjs`, which is also part of `npm run build`.
It checks three things:

1. **Schema** — shape, required fields, and enums for every module and scenario.
2. **Alignment** — every objective a scenario targets or scores exists in its
   module manifest; every scenario is registered in `api/_scenarios.ts` and has a
   public brief whose dimension names match the server's.
3. **Runtime invariants** — the assumptions `api/score.ts` and the score card make:
   `maxTotal` equals twice the dimension count, the unlock threshold sits inside
   the scale, and the tier ranges cover every possible total without gaps.

It has no dependencies, so it runs without `npm install`.

The third class of check exists for a reason. One scenario shipped with no
`scoring` block at all: the schema didn't describe the field, nothing caught it,
and `/api/score` would have returned 400 for that phase while the browser
cheerfully advertised four scoring dimensions to the learner.
