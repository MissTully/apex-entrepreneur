# Apex Experiential Learning Layer — Design Specification

**Version 1.0 · June 2026**
**Author note:** This spec defines a new layer for the Apex program: *learning by doing*. Learners practice a power skill in a realistic, simulated conversation with an AI-driven human character, then reflect with an AI debrief coach that walks them through the Kolb experiential learning cycle. It is written for a learning engineer who is a novice software developer, so it includes both the instructional-design rationale and concrete build instructions.

This pass ships the design **plus one fully built example** — Module 03, *Navigating the Currents* (integrative negotiation). The same pattern extends to all five modules.

---

## 1. Why this layer exists

Apex already has a strong **expository and assessment** spine: each module manifest defines measurable learning objectives, lessons that teach them, and assessments that measure them, with two-way links that enforce *constructive alignment* (every objective is both taught and assessed). What it does not yet have is a **practice** layer where learners *apply* a skill under realistic, uncertain conditions and get to fail safely.

Power skills — negotiation, leadership, conversational repair — are *procedural* and *conditional*. You cannot learn them only by reading; you learn them by doing the thing, noticing what happened, and adjusting. That is exactly the gap experiential learning fills.

Two design commitments follow from this:

1. **The practice must be a real interaction, not a quiz.** The learner negotiates against a character who has private goals and pushes back — so the learner must read cues and adapt, not select the "right" multiple-choice answer.
2. **The doing must be paired with structured reflection.** Experience alone does not reliably produce learning; experience *processed through reflection* does. That is the job of the debrief agent.

---

## 2. The two agents

The layer is built from two distinct AI agents with deliberately opposite jobs. Keeping them separate is the most important design decision in this spec.

### 2.1 The Simulated Counterpart (the "doing")

A Claude-driven character the learner talks to in real time — a buyer, an employee, an investor, a frustrated customer. The character is defined by a **persona** (public flavor the learner sees) and a **hiddenState** (private goals, walk-away points, concession logic — *never* shown to the learner). The hidden state is what makes the character behave like a person instead of a script: it has something to protect and something to gain, so it rewards skilled moves and punishes clumsy ones.

- **It never coaches.** It does not evaluate the learner, hint, or break character. Its only job is to be a believable, consistently-motivated counterpart.
- **It reacts to moves, not to a tree.** There is no branching decision graph. The character applies its concession logic to whatever the learner actually says, which is why two learners get two different conversations.

> **Why LLM role-play over a branching script?** Branching scripts are predictable and easy to grade but feel artificial and cap the learner at the author's imagination. Role-play characters produce authentic, surprising practice — the cost is that behavior must be *constrained* (via `behaviorRules` and `hiddenState`) rather than *enumerated*. The schema in §4 is how we impose that control.

### 2.2 The Debrief Coach (the "learning")

A second Claude agent that runs **after** the simulation ends. It receives the full transcript, the scenario's success signals, and — critically — the character's hidden state (which the learner could not see). Its whole job is to teach: it is Socratic, warm, evidence-based, and it walks the learner through a reflective cycle one stage at a time.

This is *not* the existing Apex Mentor. The Mentor coaches in the abstract ("what's your BATNA?"). The Debrief Coach coaches a *specific lived experience the learner just had*, quoting their own words back to them and comparing their reads to ground truth.

---

## 3. The reflection model — Kolb's Experiential Learning Cycle

The debrief is structured on **Kolb's experiential learning cycle** (Kolb, 1984), the canonical "learning from doing" loop. The learner moves through four stages in order:

| Stage | Plain-language meaning | What the coach does |
|------|------------------------|---------------------|
| **1. Concrete Experience** | *"What happened?"* | Has the learner recount the actual events factually, before interpreting them. Anchors reflection in the real transcript, not in a flattering memory. |
| **2. Reflective Observation** | *"What did I notice — and what did I miss?"* | Reveals the character's hidden state so the learner can compare their reads to reality. Where calibration happens. |
| **3. Abstract Conceptualization** | *"What's the general principle?"* | Moves from this one deal to the transferable rule (counter-anchoring, MESOs, reciprocity), so the learner can recognize it elsewhere. |
| **4. Active Experimentation** | *"What will I do differently next time?"* | Converts insight into a concrete intention to test in the next attempt — which becomes the next cycle's Concrete Experience. |

The cycle is *closed*: stage 4 sets up the next stage 1. A learner can re-run the same scenario (or a harder variant) and deliberately try the change they committed to.

**Why Kolb here:** it maps cleanly onto a simulate-then-debrief structure, it is well-evidenced and widely taught, and its middle two stages (Reflective Observation + Abstract Conceptualization) are exactly where the hidden-state reveal and the principle-naming do the most work. For emotion-heavy leadership modules (Module 04), the *Gibbs reflective cycle* — which adds an explicit "feelings" stage — is a reasonable swap; the schema's `debrief.model` field is an enum so you can add it later without restructuring.

> **References.** Kolb, D. A. (1984). *Experiential Learning: Experience as the Source of Learning and Development.* Prentice Hall. · Gibbs, G. (1988). *Learning by Doing: A Guide to Teaching and Learning Methods.* Oxford Polytechnic. · For the debrief-after-simulation evidence base, see Fanning & Gaba (2007), "The Role of Debriefing in Simulation-Based Learning," *Simulation in Healthcare* 2(2).

---

## 4. The data model

Experiential scenarios are **declarative JSON**, just like your module manifests. The author writes a scenario file; the two API endpoints assemble the agent prompts from it. This means a learning designer can author and tune scenarios **without touching code** — the single most important property for a content team.

### 4.1 Files added

```
manifests/
  scenario.schema.json                         # draft-07 schema for one scenario
  scenarios/
    navigating-the-currents-S1.json            # the first worked example (Module 03)
api/
  _scenarios.ts                                # server-side registry; holds hiddenState
  simulation.ts                                # the Simulated Counterpart endpoint
  debrief.ts                                   # the Debrief Coach endpoint
  score.ts                                     # structured rubric scoring
scripts/
  validate-manifests.mjs                       # schema + alignment + invariant checks
docs/
  experiential-learning-design.md              # this document
```

All six modules now have an authored scenario, each running as a live ElevenLabs
voice call. The text path in `api/simulation.ts` remains the fallback when an
agent is unreachable. See `manifests/README.md` for the full list.

### 4.2 Anatomy of a scenario file

| Block | Purpose | Visible to learner? |
|-------|---------|--------------------|
| `targetObjectiveIds` / `linkedAssessmentIds` | Ties the practice back to the module's objectives and assessments — preserves constructive alignment. | n/a |
| `learnerBrief` | The setup: the learner's role, goal, givens (including *their own* BATNA), and the skills to attempt. | **Yes** |
| `character.persona` / `voice` | Who the counterpart appears to be. | **Yes** |
| `character.hiddenState` | The counterpart's secret goals, reservation value, opening anchor, concession logic, and "tells." Drives realistic behavior. | **No — server-only** |
| `character.behaviorRules` | Hard constraints: stay in character, never reveal hidden state, never coach, respond to moves not scripts. | No |
| `successSignals` | Observable, objective-aligned behaviors the debrief scores the transcript against. The bridge from *doing* to *assessment*. | No (surfaced via coach) |
| `scoring` | The rubric: N dimensions scored 0-2 with observable criteria per level, plus tier bands and the coaching move for each. `/api/score` judges the transcript against it and the debrief coach presents it at the final Kolb stage. **Required** — a scenario without one returns 400 from `/api/score`. | Dimension *names* only |
| `debrief` | The Kolb configuration: the four stages, each with an `intent` and adaptable seed `prompts`, plus `exitCriteria`. | No (drives the coach) |

### 4.3 ID conventions (so cross-references resolve)

- Scenario: `<moduleId>-S<n>` — e.g. `navigating-the-currents-S1`
- Success signal: `<scenarioId>-sig<n>`
- `targetObjectiveIds` and `linkedAssessmentIds` must reference real ids in the matching module manifest. This keeps the same two-way alignment your manifests already enforce: *practice is tied to the objectives the module teaches and assesses.*

---

## 5. The built example — Module 03, "The Reef-Supply Contract"

A 12-month supply-contract negotiation. The learner is a reef-safe materials supplier; the counterpart, **Marcus Vane**, is a procurement lead who opens with an aggressive low anchor.

**Hidden variables that make it real (the learner sees none of these):**

- Marcus is authorized to ~$75k but *targets* $55k and opens at **$48k** — deliberately just above the learner's cost floor to seem reasonable.
- His alternative supplier failed a compliance audit, so his real BATNA is weak — but he will never admit it.
- His concession logic moves him **up ~$4–7k per *skilled* learner move**: making him justify his anchor, paraphrasing his true interest, or offering a genuine MESO. It **punishes** unreciprocated concessions by pocketing them.

**Alignment to the module's three objectives:**

| Objective | What the learner must do in the sim | Success signal |
|-----------|-------------------------------------|----------------|
| **LO1** Build rapport & lead from BATNA | Open relationally, negotiate from confidence not desperation | `sig1` |
| **LO2** Active listening & MESOs | Paraphrase Marcus's real interest; present multiple equivalent offers | `sig2`, `sig3` |
| **LO3** Counter-anchoring | Make Marcus justify his $48k *before* countering | `sig4` |

The debrief then walks Kolb: recount the turning points (Concrete Experience) → reveal Marcus's hidden state and compare the learner's reads (Reflective Observation) → name *why* counter-anchoring beats firing back a number (Abstract Conceptualization) → commit to exact words to use next time (Active Experimentation).

This scenario can serve as evidence for assessment **A2** (the role-play negotiation) and **A3** (the written reflection), which is recorded in `linkedAssessmentIds`.

---

## 6. How the runtime fits together

```
                 learnerBrief (public)
  Learner  ─────────────────────────────►  [ /api/simulation ]  ──► Claude
     ▲                                          ▲  injects character.hiddenState
     │   in-character replies                   │  + behaviorRules (server-side only)
     └──────────────────────────────────────────┘
                                                   transcript captured in browser
     (learner ends the session)                            │
                                                            ▼
  Learner  ◄───────────────────────────────  [ /api/debrief ]  ──► Claude
       Socratic, stage-by-stage              injects transcript + successSignals
       Kolb reflection                       + hiddenState (ground truth) + Kolb stages
```

Both endpoints copy the proven shape of your existing `api/mentor.ts`: the API key stays server-side, and each degrades to a scripted fallback when no key is present, so previews never dead-end.

---

## 7. Build & wiring instructions (step by step)

You already have `@anthropic-ai/sdk` and the `/api/mentor.ts` serverless pattern, so the new endpoints need no new dependencies.

**Step 1 — Validate the scenario file.** From the repo root:

```sh
pip install jsonschema --break-system-packages
python - <<'PY'
import json
from jsonschema import validate
schema = json.load(open("manifests/scenario.schema.json"))
validate(json.load(open("manifests/scenarios/navigating-the-currents-S1.json")), schema)
print("scenario OK")
PY
```

**Step 2 — Confirm the endpoints type-check.** They are already written to match `api/mentor.ts`. `npm run build` (which runs `tsc`) will catch any type drift.

**Step 3 — Load the scenario in the browser, but strip the secret.** When the React app fetches a scenario to start a sim, it should load the JSON and **delete `character.hiddenState`** before holding it in client state, then send the *full* file (or just the `scenarioId`) to the server. The cleanest pattern: the server loads the scenario from disk by `scenarioId` so `hiddenState` never reaches the client at all. (The current `simulation.ts` accepts the scenario in the POST body to keep the example self-contained; see the SECURITY NOTE at the top of that file before production.)

**Step 4 — Build the two-phase UI.** Reuse `MentorPanel.tsx` as a starting point — it already does the POST-and-render loop. You need two panels:

- A **Simulation panel** that POSTs `{ scenario, messages }` to `/api/simulation`, where `messages` is the running `[{role:"learner"|"character", text}]` array. The counterpart speaks first.
- A **Debrief panel** that, when the learner ends the sim, POSTs `{ scenario, transcript, messages }` to `/api/debrief`, where `transcript` is the finished simulation and `messages` is the debrief chat. The coach speaks first (its `openingMove`).

**Step 5 — Surface it in the Phase page.** Add an "Enter the Simulation" activity to the relevant lesson (Module 03 already lists a `roleplay` and a `simulation` activity in `manifests/modules/03-navigating-the-currents.json`). Wire those activity cards to launch the Simulation panel for `navigating-the-currents-S1`.

---

## 8. Extending to all five modules

The pattern is identical; only the modality and hidden variables change. Suggested first scenario per module:

| Module | Modality | The simulated human + core hidden variable |
|--------|----------|--------------------------------------------|
| 01 · Apex Positioning | `negotiation` / decision | A partner pushing a "sure thing" — hidden variable: it's a loss-avoidance trap, to practice winning vs. not-losing. |
| 02 · Coral Scaffolding | `stakeholder-update` | A skeptical advisor reviewing the evolving plan — hidden variable: which assumption they'll attack, to practice help-seeking. |
| **03 · Navigating the Currents** | **`negotiation`** | **Marcus Vane — BUILT (this example).** |
| 04 · Schooling Strategy | `leadership-conversation` | An underperforming team member with a hidden non-work cause — to practice psychological safety and conversational repair. (Consider Gibbs over Kolb for the debrief here.) |
| 05 · The Migration | `sales-pitch` | An investor with an unstated objection — to practice pitching and reading the room. |

For each: copy `navigating-the-currents-S1.json`, rewrite `learnerBrief`, `character`, `successSignals`, and `debrief.stages` to the new objectives, and validate against the schema. No code changes required.

---

## 9. Open design questions to resolve before scaling

1. **Scoring vs. coaching.** Should the debrief produce a *score* against `successSignals` (feeding the gradebook / completion criteria), or stay purely formative? The data supports both; decide per assessment.
2. **Turn limits.** Real negotiations end. Add a soft turn cap (e.g. 12 learner turns) so the sim concludes and the debrief can run.
3. **Difficulty scaling.** `character.difficulty` (`coachable` / `standard` / `adversarial`) is in the schema but not yet wired — decide whether to expose it to learners or ramp it automatically across attempts.
4. **Reflection model per module.** Confirm Kolb everywhere vs. Gibbs for the leadership module.

---

*Reef-Native · Apex · 2026*
