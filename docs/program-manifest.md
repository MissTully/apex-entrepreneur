# Apex · Program & Module Manifest (Consolidated)

**Program:** Apex · The Experiential Entrepreneurship Program
**Manifest version:** 1.0.0 · **Compiled:** June 2026
**Audience for this document:** facilitators, instructional designers, and program administrators.

This is the human-readable companion to the machine manifests in `manifests/`. The
JSON files (`manifests/index.json`, `manifests/modules/*.json`,
`manifests/scenarios/*.json`) remain the single source of truth; this document
summarizes them in one place and adds the framing a facilitator needs. If the two
ever disagree, the JSON wins — update it first, then regenerate this summary.

---

## 1. Program at a glance

Apex trains the **power skills** of the modern founder — emotionally intelligent
leadership, strategic communication, and digital scaffolding — through one
**Orientation** and **five immersive phases** mapped to the life-cycle of an apex
predator (the "Predator's Lexicon"). The program is **Reef-Native**: browser-based,
low-bandwidth-tolerant, offline-resilient, and designed to run on modest hardware.

Every phase pairs an **expository spine** (objectives → lessons → assessments, with
two-way constructive-alignment links) with an **experiential layer** (a live AI
role-play plus a Kolb-cycle debrief). See `docs/experiential-learning-design.md`
for the experiential layer's design rationale.

| # | Order | Slug | Codename | Frame | Weeks · Hrs |
|--:|------:|------|----------|-------|:-----------:|
| 0 | 1 | `entering-the-reef` | **Entering the Reef** (Orientation) | Mindset & misconception — *shed the shell* | 1 · 4 |
| 1 | 2 | `apex-positioning` | **Apex Positioning** | Strategy, motivation & risk | 4 · 12 |
| 2 | 3 | `coral-scaffolding` | **Coral Scaffolding** | Business architecture & iterative planning | 4 · 14 |
| 3 | 4 | `navigating-the-currents` | **Navigating the Currents** | Integrative negotiation & relationship capital | 4 · 14 |
| 4 | 5 | `schooling-strategy` | **Schooling Strategy** | Leadership dynamics under uncertainty | 4 · 13 |
| 5 | 6 | `the-migration` | **The Migration** | Launch & future-proofing | 4 · 15 |

**Total instructional load:** ~72 hours over ~21 weeks of cohort time, delivered in
**10 facilitated sessions** (see `docs/program-detail-and-agenda.md`) with async work
between.

### Totem system

Each phase carries a sea-creature totem that encodes its core lesson:

| Totem | Phase | Lesson it embodies |
|-------|-------|--------------------|
| 🦞 The Lobster — *grow by molting* | Entering the Reef | Discomfort is the mechanism of growth, not the obstacle. |
| 🦈 The Great White — *apex positioning* | Apex Positioning | Stillness, then certainty; move only when the moment is right. |
| 🐙 The Octopus — *adaptive intelligence* | Coral Scaffolding | Build, probe, and reshape structure to fit the reef. |
| 🟦 The Devil Ray — *riding the current* | Navigating the Currents | Read the water and glide; move *with* the current. |
| 🐟 The School — *move as one* | Schooling Strategy | Coordinate without a constant hand on the wheel. |
| 🌅 The Home Waters — *the crossing* | The Migration | Every migration aims somewhere; launch is the destination. |

---

## 2. Competency framework

Three program-level competencies thread through the modules (defined in
`src/data/curriculum.ts → CORE_COMPETENCIES`):

1. **Emotionally Intelligent Leadership** — other-awareness and empathy to hold
   psychological safety and morale through disruption.
2. **Strategic Communication** — the Negotiation–Strategy–Cooperation framework
   for building relationship capital and navigating conflict.
3. **Digital Scaffolding** — leveraging AI and Reef-Native tools to remove IT
   friction and automate back-office work.

**Competency coverage by module:**

| Competency | Reef | Apex | Coral | Currents | School | Migration |
|------------|:----:|:----:|:-----:|:--------:|:------:|:---------:|
| Emotionally Intelligent Leadership | ● | | | ● | ● | ● |
| Strategic Communication | | ● | ● | ● | ● | ● |
| Digital Scaffolding | | | ● | | | ● |

---

## 3. Module specifications

Notation: **LO** = learning objective (with Bloom level); **A** = assessment
(`f` formative / `s` summative). Objective IDs map 1:1 to the JSON manifests and to
the scenario `targetObjectiveIds`.

### Module 0 · Entering the Reef *(Orientation)*
- **Slug:** `entering-the-reef` · **Prerequisites:** none · **Competency:** Emotionally Intelligent Leadership
- **Premise:** Don't just teach skills — expose confidently held misconceptions. Start with the learner, not the content.
- **Objectives**
  - **LO1** *(Analyze)* Identify a self-limiting belief and reclassify it as an untested prediction, not a fact.
  - **LO2** *(Create)* Design a small, low-stakes experiment that produces real evidence — attempting it with AI even without confidence.
  - **LO3** *(Evaluate)* Diagnose a failed attempt as an ability / persistence / approach gap.
  - **LO4** *(Evaluate)* Develop a personal rubric for judging one's own work.
  - **LO5** *(Analyze)* Distinguish chosen goals from inherited ones; articulate an authentic motivation.
  - **LO6** *(Evaluate)* Examine one's "why" against a human-values standard.
- **Assessments:** A1 *(f)* — reflective coaching conversation; A2 *(f)* — written experiment log.
- **Completion:** master ≥3 objectives; A1 required; threshold 0.60.
- **Simulation:** *The First Attempt* with coach **Maren Cole** (`entering-the-reef-S1`) — targets LO1, LO2, LO3, LO5.

### Module 1 · Apex Positioning
- **Slug:** `apex-positioning` · **Prerequisites:** Entering the Reef · **Competency:** Strategic Communication
- **Objectives**
  - **LO1** *(Analyze)* Diagnose your default motivational focus (promotion vs. prevention) and select the complementary safeguard.
  - **LO2** *(Analyze)* Distinguish zero-sum from collaborative interactions and choose a fitting strategy.
  - **LO3** *(Evaluate)* Separate stated positions from underlying interests; judge winning vs. not-losing.
- **Assessments:** A1 *(f)* focus diagnostic; A2 *(f)* scenario classification; A3 *(s)* positions-vs-interests analysis.
- **Completion:** ≥3 objectives; A3 required; threshold 0.70.
- **Simulation:** *The Dock Deal* with **Dale Mercer** (`apex-positioning-S1`) — targets LO1, LO2, LO3.

### Module 2 · Coral Scaffolding
- **Slug:** `coral-scaffolding` · **Prerequisites:** Reef, Apex · **Competencies:** Digital Scaffolding, Strategic Communication
- **Objectives**
  - **LO1** *(Apply)* Apply the BizChat methodology: voice-captured draft → polished pitch via low-floor/high-ceiling tools.
  - **LO2** *(Create)* Construct an iterative business plan (executive summary, evidence-based market analysis, future-of-the-company).
  - **LO3** *(Create)* Formulate sharp expert-directed help-seeking questions.
- **Assessments:** A1 *(f)*, A2 *(s)* business-plan artifact, A3 *(f)*.
- **Completion:** ≥3 objectives; A2 required; threshold 0.70.
- **Simulation:** *(planned)* — uses the "coming soon" placeholder until authored.

### Module 3 · Navigating the Currents
- **Slug:** `navigating-the-currents` · **Prerequisites:** Reef, Apex, Coral · **Competencies:** Strategic Communication, Emotionally Intelligent Leadership
- **Objectives**
  - **LO1** *(Analyze)* Build rapport first; determine your BATNA.
  - **LO2** *(Apply)* Use active-listening paraphrase and present MESOs to surface true preferences.
  - **LO3** *(Apply)* Apply a counter-anchoring move that makes the counterpart justify their figure.
- **Assessments:** A1 *(f)*, A2 *(s)* integrative-negotiation performance, A3 *(f)*.
- **Completion:** ≥3 objectives; A2 required; threshold 0.70.
- **Simulation:** authored (`navigating-the-currents-S1`) — see `manifests/scenarios/`.

### Module 4 · Schooling Strategy
- **Slug:** `schooling-strategy` · **Prerequisites:** Reef, Apex, Coral, Currents · **Competencies:** Emotionally Intelligent Leadership, Strategic Communication
- **Objectives**
  - **LO1** *(Apply)* Apply psychological safety, purposeful inquiry, and productive disagreement in a team scenario.
  - **LO2** *(Apply)* Apply conversational-repair techniques after a breakdown.
  - **LO3** *(Create)* Design a cross-functional coordination plan under pressure.
- **Assessments:** A1 *(f)*, A2 *(f)*, A3 *(s)* coordination plan + leadership rationale.
- **Completion:** ≥3 objectives; A3 required; threshold 0.70.

### Module 5 · The Migration
- **Slug:** `the-migration` · **Prerequisites:** all prior · **Competencies:** Strategic Communication, Digital Scaffolding, Emotionally Intelligent Leadership
- **Objectives**
  - **LO1** *(Evaluate)* Evaluate total compensation beyond base pay; construct a justified counter from 2026 salary data.
  - **LO2** *(Apply)* Apply the Reef-Native operational philosophy (browser-native, performance-budgeted, offline-first).
  - **LO3** *(Create)* Create and deliver a final pitch, refined against AI feedback.
- **Assessments:** A1 *(f)*, A2 *(f)*, A3 *(s)* **capstone** final pitch.
- **Completion:** ≥3 objectives; A3 required; threshold 0.70; **capstone = A3**.

---

## 4. Constructive-alignment summary

Every objective is both **taught** (in at least one lesson) and **assessed** (in at
least one assessment); simulations practice a subset and feed evidence into the
formative assessments. This is the program's core integrity guarantee.

| Module | Objectives | Assessments | Capstone-bearing |
|--------|:----------:|:-----------:|:----------------:|
| Entering the Reef | 6 | 2 | — |
| Apex Positioning | 3 | 3 | — |
| Coral Scaffolding | 3 | 3 | — |
| Navigating the Currents | 3 | 3 | — |
| Schooling Strategy | 3 | 3 | — |
| The Migration | 3 | 3 | ✓ (A3) |

---

## 5. Artifact map (where things live)

| Concern | Source of truth |
|---------|-----------------|
| Phase copy (objectives, workshops) | `src/data/curriculum.ts` |
| Phase visual identity | `src/data/phaseArt.ts` |
| Totems / reef cast | `src/data/reefLife.ts` |
| Public simulation briefs | `src/data/scenarioBriefs.ts` |
| Full simulations (hidden state, scoring, debrief) | `manifests/scenarios/*.json` |
| Module manifests (LOs, lessons, assessments) | `manifests/modules/*.json` |
| Program index & prerequisites | `manifests/index.json` |
| Experiential-layer design | `docs/experiential-learning-design.md` |
| Session agenda | `docs/program-detail-and-agenda.md` |
| Reading lists | `docs/further-reading.md` |
| Facilitation | `docs/facilitator-guide.md` |

---
*Reef-Native · Tampa Bay · 2026*
