# Module Manifests

Machine-readable **instructional-design specs** for the five Apex program modules.
One JSON file per module, derived from `src/data/curriculum.ts` (the curriculum
single-source-of-truth) and expanded with learning-engineering fields so a
tutoring engine can drive sequencing, delivery, and assessment.

## Files

```
manifests/
  index.json            # Ordered list of modules + prerequisites (start here)
  module.schema.json    # JSON Schema (draft-07) every manifest validates against
  modules/
    01-apex-positioning.json
    02-coral-scaffolding.json
    03-navigating-the-currents.json
    04-schooling-strategy.json
    05-the-migration.json
```

## Manifest fields

| Field | Meaning |
|-------|---------|
| `moduleId` | Stable kebab-case id; matches the phase `slug` in `curriculum.ts`. |
| `order` | Sequence position (1–5). |
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

- Learning objective: `<moduleId>-LO<n>`  e.g. `apex-positioning-LO1`
- Lesson: `<moduleId>-L<n>`
- Assessment: `<moduleId>-A<n>`

Objectives reference the assessments that measure them, and assessments
reference the objectives they cover — a two-way link an engine can use to verify
**constructive alignment** (every objective is taught and assessed).

## Validating

```sh
pip install jsonschema
python - <<'PY'
import json, glob
from jsonschema import validate
schema = json.load(open("manifests/module.schema.json"))
for f in glob.glob("manifests/modules/*.json"):
    validate(json.load(open(f)), schema)
    print("OK", f)
PY
```
