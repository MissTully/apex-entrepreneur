# Apex · Facilitator Guide

How to run this program in a room. The agenda in
`docs/program-detail-and-agenda.md` tells you *what* happens and when; this tells
you how to hold it.

---

## 1. The one thing to understand before you start

Apex is built on a premise that will feel wrong the first time you teach it:

> Don't just teach skills — expose confidently held misconceptions.

Most programs assume the learner lacks knowledge and supply it. This one assumes
the learner is already acting on beliefs they've never tested, and that the
beliefs are what's actually in the way. A founder who "isn't a numbers person"
doesn't need a finance module; they need one experiment that produces evidence
against the belief.

That changes your job. You are not the source of the content — the app carries the
content. You are the person who makes the room safe enough for someone to find out
they were wrong about themselves, and useful enough that they do something with it.

**Practically, this means:**

- When a learner gets something wrong in a simulation, that's the material. Don't
  rescue them from it.
- When you're tempted to explain, ask instead. The Kolb debrief the app runs is the
  model: concrete experience → what happened → what it means → what you'll do.
- Never re-teach a micro-lesson in the room. If most of the cohort didn't watch it,
  that's an accountability conversation, not a lecture.

---

## 2. Your week-to-week job

**Between sessions (~1–2 h)**

- Skim the cohort's submitted artifacts. You're looking for shared patterns, not
  individual grades — one pattern named in the room beats twenty private comments.
- Check who has and hasn't run the phase's simulation. Chase the gaps *before* the
  session, not during it.
- Pick the two examples you'll surface, and ask those learners' permission first.

**In session (~2.5 h)**

- Run the four-part shape. Protect the timings; the Pressure test is the part that
  gets eaten, and it's the part that works.
- Talk less than a third of the time. If you're talking more, you've slipped into
  delivering content the app already delivered.

**After session (~30 min)**

- Note who didn't speak. Plan how they will next time.
- Log anything the app got wrong (a simulation that went sideways, a score that
  didn't match what you saw). See §7.

---

## 3. Running a paired debrief

Every voice simulation ends with the learners debriefing each other, in pairs,
out loud. This is the highest-value 20 minutes in the program and the easiest to
run badly.

**Set it up like this:**

1. **Pair deliberately.** Not friends, not the same industry. Rotate every phase so
   nobody debriefs with the same partner twice.
2. **One talks, one asks.** The person who ran the sim describes what happened; the
   partner works the prompts on screen. They do not offer advice.
3. **Switch seats.** The partner runs their own simulation, then they debrief that
   one the same way. Two reps, two debriefs, both sides of the table.
4. **Come back with one thing.** Each pair reports a single sentence to the room:
   the moment that turned.

**What goes wrong, and the fix:**

| Failure | What it sounds like | Fix |
|---|---|---|
| Advice-giving | "What you should have done is…" | Restate the rule: the partner asks, they don't coach. |
| Summarising | A blow-by-blow retelling | Interrupt with "skip to the moment the tone changed." |
| Mutual reassurance | "That was great." "Yours too." | Ask each pair for the *miss*, by name, before they sit down. |
| One dominant partner | One voice for 18 minutes | Call the switch at the halfway mark yourself. |

---

## 4. Facilitating the simulations

Each phase's counterpart is driven by a hidden state the learner cannot see —
secret goals, a real walk-away, a concession logic that rewards specific moves.
That is what makes them behave like people instead of scripts.

**You should know the hidden states. Learners must not.**

They live in `manifests/scenarios/*.json` under `character.hiddenState`, and they
never reach the browser. Read them before you facilitate that phase, so you can
tell the difference between a learner who read the room and one who got lucky.

**The six counterparts**

| Phase | Counterpart | Mode | What the learner is really being tested on |
|---|---|---|---|
| Entering the Reef | Maren Cole | Voice, unscored | Whether they'll answer honestly rather than perform |
| Apex Positioning | Dale Mercer | Voice | Whether they find the interest under the $8,400 position |
| Coral Scaffolding | Maren Cole | Voice, advisory | Whether they ask questions worth an expert's time |
| Navigating the Currents | Marcus Vane | Voice | Whether they make him justify his anchor before countering |
| Schooling Strategy | Priya Raman | Voice | Whether they address the silence, not the schedule |
| The Migration | Theo Hanson | Voice | Whether they reframe from base salary to total value |

**Common learner reactions, and what to say:**

- *"It's just an AI, it doesn't count."* — Ask them what they said, verbatim, at
  the hardest moment. They'll usually discover they softened it. That's the point.
- *"I don't know what it wants."* — Correct. Neither does a real buyer.
- *"Can I see how I was scored?"* — Yes, after the debrief. Never before: knowing
  the rubric going in produces performance instead of behaviour.
- *"It went badly, can I do it again?"* — Always yes. Only their best score counts,
  and a second run after a debrief is where most of the learning lands.

---

## 5. Assessment

**Formative (most of them)** — practice. Give feedback, don't grade. Turn them
around fast; a comment two weeks later is noise.

**Summative (one per phase)** — the graded artifact. Threshold is 0.70 for every
phase except orientation (0.60). Each phase's required assessment is listed in its
manifest under `completionCriteria.requiredAssessments`.

| Phase | Summative | Passing |
|---|---|---:|
| Entering the Reef | A1 · reflective coaching conversation | 0.60 |
| Apex Positioning | A3 · positions-vs-interests analysis | 0.70 |
| Coral Scaffolding | A2 · iterative business plan | 0.70 |
| Navigating the Currents | A2 · integrative negotiation performance | 0.70 |
| Schooling Strategy | A3 · coordination plan + rationale | 0.70 |
| The Migration | **A3 · capstone final pitch** | 0.70 |

A learner completes a phase by mastering at least three objectives and passing its
required assessment.

**The app's simulation scores are not the assessment.** They're formative signal —
useful in a debrief, never the grade. The summative judgement is yours.

**Giving feedback that lands.** Name the specific moment, describe what it produced,
and offer the alternative move. "Your market analysis is weak" is not usable.
"Your market size comes from one blog post — a reader who doubts it has nowhere to
go. Cite the two sources you used for the pricing section instead" is.

---

## 6. When things go wrong

**A learner is failing the technology.** Microphone permissions are the top cause
by a wide margin. Chrome, allow the mic, reload. Every simulation is a voice call,
so a learner who genuinely cannot use a microphone should pair up and run it with
a partner rather than sit it out.

**A learner won't engage with a simulation.** Usually embarrassment, not
resistance. Let them run it at home before the paired debrief, and pair them with
someone who'll go first.

**A simulation goes off the rails.** The counterpart breaks character or gets
stuck. End the call, run it back — the hidden state resets. If it recurs for the
same scenario, log it (§7).

**A learner discloses something serious** in a coaching conversation with Maren or
in a debrief. These conversations reach real material — that is what makes them
work. Step out of facilitator mode, be a person, and know your center's referral
route before day one. Don't try to coach it.

**Someone falls two phases behind.** The prerequisite chain means it compounds. Get
them through the simulation and the summative for one phase before they attempt the
next; skip the formative work rather than letting them skip a phase.

**A learner disputes a score.** Show them the transcript against the rubric — the
dimensions and criteria are in the scenario file. If the score is genuinely wrong,
say so plainly and use your own judgement. The number is not the point.

---

## 7. Reporting problems

The content and the code are in one repository, so a fix is a change either way.

- **Content wrong** (a bad prompt, a counterpart who behaves implausibly, a rubric
  that misjudges): note the phase, the scenario, and what happened. The scenario
  files are plain JSON — a learning designer can edit them without touching code.
- **App broken** (a page won't load, scoring fails, the certificate is wrong): note
  the page, the browser, and what you expected. Open an issue on the repository.
- **Nothing scores and the debrief gives the same three replies every time**: the
  `ANTHROPIC_API_KEY` is missing or invalid on the deploy. The app is designed to
  degrade to scripted responses rather than fail — which means this looks like a
  boring simulation, not an outage. Check it before every cohort.

---

## 8. Preparing for your first cohort

- [ ] Run all six simulations yourself, as a learner. Deliberately do badly in at
      least two — you need to have seen the low tiers.
- [ ] Read every `character.hiddenState` in `manifests/scenarios/`.
- [ ] Read the six phase pages in the app end to end.
- [ ] Walk the pre- and post-program surveys so you can answer questions about them.
- [ ] Work the checklist in `docs/program-detail-and-agenda.md` §5.

Reading to prepare you for the *stance* rather than the content is in
`docs/further-reading.md` — the facilitator section at the end is the short list.
