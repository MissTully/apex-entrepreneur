# Apex · Program Detail & Session Agenda

The delivery plan behind the manifests: how ~72 instructional hours spread across
~21 weeks, what happens in each of the 10 facilitated sessions, and what learners
do between them.

> **Source of truth.** Objectives, lessons and assessments live in
> `manifests/modules/*.json`; phase copy lives in `src/data/curriculum.ts`. This
> document schedules them — it does not redefine them. If the two ever disagree,
> the manifests win and this file is stale.

> **Cohort-specific values** (dates, room, times, roster size) are deliberately
> left as `[…]`. Fill them in per cohort rather than editing the shape.

---

## 1. The shape of the program

| | |
|---|---|
| Duration | ~21 weeks |
| Instructional load | ~72 hours |
| Facilitated sessions | 10 (~2.5 h each, ~25 h) |
| Async / applied work | ~47 h |
| Cohort size | 12–20 (the paired debriefs need even numbers; an odd learner joins a trio) |
| Delivery | In person at the Hillsborough County Entrepreneurship Center, with the Reef-Native app used live in the room and at home |

**Rhythm.** Sessions run every other week. Between them, learners work the phase
in the app: watch the micro-lessons, run the live simulation, and produce that
phase's assessment artifacts. Each session opens by debriefing what the room
actually did, not by re-teaching what the app already covered.

**Hours by phase**

| Phase | Weeks | Hours | Facilitated sessions |
|---|---:|---:|---|
| 0 · Entering the Reef | 1 | 4 | S1 |
| 1 · Apex Positioning | 4 | 12 | S2, S3 |
| 2 · Coral Scaffolding | 4 | 14 | S4, S5 |
| 3 · Navigating the Currents | 4 | 14 | S6, S7 |
| 4 · Schooling Strategy | 4 | 13 | S8, S9 |
| 5 · The Migration | 4 | 15 | S10 (capstone showcase) |
| **Total** | **21** | **72** | **10** |

The Migration carries the most hours but only one session because its weight sits
in the capstone: the learner builds and iterates the final pitch on their own
time, against AI feedback, and the session is the showcase.

---

## 2. Calendar

| Week | Session | Phase | Focus |
|---:|---|---|---|
| 1 | **S1** | Entering the Reef | Orientation, pre-program survey, first AI conversation |
| 2 | — | Apex Positioning | Async: micro-lessons, focus diagnostic (A1) |
| 3 | **S2** | Apex Positioning | Promotion vs. prevention; game type |
| 4 | — | Apex Positioning | Async: The Dock Deal simulation |
| 5 | **S3** | Apex Positioning | Positions vs. interests; A3 workshop |
| 6 | **S4** | Coral Scaffolding | BizChat methodology; voice-to-draft |
| 7 | — | Coral Scaffolding | Async: plan draft, iteration trail (A1) |
| 8 | **S5** | Coral Scaffolding | Plan critique; help-seeking questions (A3) |
| 9 | — | Coral Scaffolding | Async: business-plan artifact (A2, summative) |
| 10 | **S6** | Navigating the Currents | Rapport, BATNA, reservation points |
| 11 | — | Navigating the Currents | Async: The Reef-Supply Contract simulation |
| 12 | **S7** | Navigating the Currents | MESOs and counter-anchoring; live role-play (A2) |
| 13 | — | Navigating the Currents | Async: reflection (A3) |
| 14 | **S8** | Schooling Strategy | Psychological safety; productive disagreement |
| 15 | — | Schooling Strategy | Async: Breaking Formation simulation; annotated transcript (A1) |
| 16 | **S9** | Schooling Strategy | Conversational repair; coordination plan (A3) |
| 17 | — | Schooling Strategy | Async: coordination plan submission |
| 18 | — | The Migration | Async: compensation lesson; counter-offer (A1) |
| 19 | — | The Migration | Async: Open Water simulation; Reef-Native audit (A2) |
| 20 | — | The Migration | Async: pitch drafting and AI iteration |
| 21 | **S10** | The Migration | **Capstone showcase**, post-program survey, certificates |

---

## 3. Session-by-session

Every session follows the same four-part shape. It is deliberately repetitive —
the predictability is what lets learners spend their attention on the content.

```
0:00  Surface        (15 min)  What happened out there? Wins, snags, one question each.
0:15  Dive           (60 min)  The session's core teaching and practice.
1:15  Break          (10 min)
1:25  Pressure test  (55 min)  Live practice: paired role-play, critique, or workshop.
2:20  Set the course (10 min)  What's due, what to run in the app, who to pair with.
```

### S1 · Entering the Reef — Orientation (Week 1)

**Objectives:** all six orientation LOs, introduced. **Assessments opened:** A1, A2.

- **Surface** — Introductions. Each learner names the venture or idea they're
  bringing, in one sentence.
- **Dive** — The program's premise: we are not here to hand you skills you'll
  never use, we're here to surface the beliefs you're already acting on. Walk the
  self-limiting belief audit (L1). Every learner writes one belief and reclassifies
  it as an untested prediction.
- **Pressure test** — Learners set up accounts, complete the **pre-program survey**,
  and run their first live conversation with **Maren Cole** in the app. This is the
  moment to catch device, microphone and login problems with a facilitator in the
  room — do not let anyone leave without a working microphone.
- **Set the course** — Design one low-stakes experiment (LO2) and run it before S2.
  Log the expectation *before* the attempt; that's what makes the log worth writing.

> **Facilitator note.** The orientation simulation is not scored and has no role to
> play. If a learner asks "what's the right answer", that is the misconception the
> module exists to expose. Say so.

### S2 · Apex Positioning I (Week 3)

**Objectives:** LO1, LO2. **Assessments:** A1 due, A2 opened.

- **Surface** — Experiment logs. Ask specifically for the ones that *failed*, then
  run the three-way diagnostic on two of them out loud: ability, persistence, or
  approach?
- **Dive** — Promotion vs. prevention focus (L1). Learners take the diagnostic and
  name their default and its complementary safeguard.
- **Pressure test** — Game Theory at Work (L2). Four short scenarios; the room
  classifies each as zero-sum or collaborative and defends the call. Disagreement
  is the point — surface it rather than resolving it quickly.
- **Set the course** — Run **The Dock Deal** with Dale Mercer in the app. Complete
  A2 (scenario classification).

### S3 · Apex Positioning II (Week 5)

**Objectives:** LO3. **Assessments:** A3 (summative) workshopped.

- **Surface** — Dock Deal debriefs in pairs, using the app's prompts. Then one
  question to the room: *where did Dale's $8,400 actually come from?*
- **Dive** — Winning vs. not losing (L3). Separate stated positions from underlying
  interests using the room's own transcripts.
- **Pressure test** — A3 workshop: learners analyse the provided transcript,
  exchange drafts, and mark each other against the success criteria before
  submitting.
- **Set the course** — Submit A3. Read the Coral Scaffolding pre-work.

### S4 · Coral Scaffolding I (Week 6)

**Objectives:** LO1. **Assessments:** A1 opened.

- **Dive** — The BizChat methodology (L1): voice-captured draft → polished pitch.
  Demonstrate the low-floor/high-ceiling move live, badly, then well.
- **Pressure test** — Every learner voice-captures a two-minute description of
  their venture and turns it into a first written draft in the room.
- **Set the course** — Two more iterations, keeping the revision trail (A1).

### S5 · Coral Scaffolding II (Week 8)

**Objectives:** LO2, LO3. **Assessments:** A1 due, A3 due, A2 opened.

- **Surface** — Revision trails on the table. What changed between iterations one
  and three, and *why*?
- **Dive** — Assembling the iterative plan (L2): executive summary,
  evidence-based market analysis, future-of-the-company.
- **Pressure test** — Help-seeking (L3). Learners draft five expert-directed
  questions, then trade them: a good question is one the receiver can answer
  without a follow-up. Rewrite the ones that fail that test.
- **Set the course** — Business-plan artifact (A2, **summative**) due Week 9. Run
  the **Coral Scaffolding** advisory conversation in the app first — it is designed
  to be used *while* drafting, not after.

### S6 · Navigating the Currents I (Week 10)

**Objectives:** LO1. **Assessments:** A1 opened.

- **Surface** — Plan artifacts returned with written feedback. Name two patterns
  the room shares.
- **Dive** — Rapport and BATNA (L1). Determine your walk-away before you value the
  deal, not after.
- **Pressure test** — BATNA mapping for a provided scenario, in pairs, then swapped
  and challenged.
- **Set the course** — Run **The Reef-Supply Contract** with Marcus Vane. Submit A1.

### S7 · Navigating the Currents II (Week 12)

**Objectives:** LO2, LO3. **Assessments:** A2 (summative) performed live.

- **Surface** — Marcus debriefs in pairs. Then ask the room: *who made him justify
  the $48,000 before countering?* Count hands honestly.
- **Dive** — Active listening, paraphrase, and MESOs (L2); counter-anchoring (L3).
- **Pressure test** — **A2 live**: recorded or transcribed role-play negotiation,
  learner vs. learner, facilitator observing. Both sides run it, then switch.
- **Set the course** — Written reflection (A3) naming the anchor they faced and the
  neutralizing response they used.

### S8 · Schooling Strategy I (Week 14)

**Objectives:** LO1. **Assessments:** A1 opened.

- **Dive** — High-performance soft skills (L1): psychological safety, purposeful
  inquiry, productive disagreement. Model a disagreement that stays safe, and one
  that doesn't.
- **Pressure test** — Team scenario in fours. One observer per group annotates the
  moves as they happen; the annotation *is* A1.
- **Set the course** — Run **Breaking Formation** with Priya Raman. Submit the
  annotated transcript.

### S9 · Schooling Strategy II (Week 16)

**Objectives:** LO2, LO3. **Assessments:** A2 due, A3 (summative) opened.

- **Surface** — Priya debriefs in pairs. The recurring miss to listen for: leaders
  who solved the schedule instead of the silence.
- **Dive** — Conversational repair (L2). Rewrite a broken-down exchange using two
  repair techniques (A2, in the room).
- **Pressure test** — Cross-functional coordination under a launch clock (L3).
  Groups build a plan; each group presents the *rationale*, not the Gantt.
- **Set the course** — Coordination plan + leadership rationale (A3) due Week 17.

### S10 · The Migration — Capstone showcase (Week 21)

**Objectives:** LO3 assessed. **Assessments:** A3 (capstone) performed.

- **Surface** — Where every venture stands now versus Week 1. Short.
- **Dive** — No new teaching. Sequence and stage the room.
- **Pressure test** — **Capstone pitches.** Each learner delivers their final pitch
  with the iteration log of AI feedback applied. Two peers and one facilitator give
  structured feedback against the A3 criteria.
- **Close** — **Post-program survey** completed in the room (it unlocks the
  certificate), then certificates issued and read aloud.

> **Facilitator note.** Do the survey before the certificates, not after. Completion
> rates collapse once people have what they came for.

---

## 4. What the app carries, and what the room carries

| Carried by the app | Carried by the room |
|---|---|
| Micro-lesson videos, per phase | The reason this phase matters to *this* cohort |
| The live AI simulations and their debriefs | Paired debriefs, out loud, with a human |
| Automated scoring where a rubric exists | All summative assessment judgement |
| Progress and the phase gate | Accountability for the async work |
| The certificate | The showcase that makes it mean something |

The app is deliberately not the course. It is the practice surface between
sessions — the thing that lets a learner fail a negotiation four times on a
Tuesday night with nothing at stake.

---

## 5. Preparing to run a cohort

Two weeks out:

- [ ] Apply `docs/supabase-schema.sql` to the Supabase project (once per project).
- [ ] Confirm `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `ANTHROPIC_API_KEY`
      are set on the production deploy, and that the app boots without the
      configuration screen.
- [ ] Run one full simulation end to end as a learner. Confirm the debrief responds
      and the score card appears — if scoring shows "live scoring needs the server
      API key", the key is missing or wrong.
- [ ] Check every ElevenLabs voice agent still connects (see `docs/elevenlabs-*.md`).
- [ ] Set cohort dates in this file and in the invitation email.

Day one:

- [ ] Microphones tested for every learner, in the room, before they leave.
- [ ] Everyone registered, onboarded, and through the pre-program survey.
- [ ] Pairings assigned for the first paired debrief.
