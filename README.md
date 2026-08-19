# Apex · The Experiential Entrepreneurship Program

A browser-based, **Reef-Native** course platform that trains the *power skills* of
the modern founder — emotionally intelligent leadership, strategic communication,
and digital scaffolding — through one orientation and five immersive phases mapped
to the life-cycle of an apex predator.

> Built to thrive in isolated, low-bandwidth environments — just as a reef thrives
> away from deep-ocean currents.

Run at the Hillsborough County Entrepreneurship Center: ~72 instructional hours
across ~21 weeks, delivered in 10 facilitated sessions with the app carrying the
practice between them.

## The Predator's Lexicon

| Phase | Codename | Focus | Live simulation |
|------:|----------|-------|-----------------|
| 0 | **Entering the Reef** | Mindset & misconception — shed the shell | Maren Cole · coaching |
| 1 | **Apex Positioning** | Promotion vs. prevention, game theory | Dale Mercer · The Dock Deal |
| 2 | **Coral Scaffolding** | The evolving business plan, BizChat | Maren Cole · advisory |
| 3 | **Navigating the Currents** | BATNA, MESOs, counter-anchoring | Marcus Vane · The Reef-Supply Contract |
| 4 | **Schooling Strategy** | Psychological safety, conversational repair | Priya Raman · Breaking Formation |
| 5 | **The Migration** | Pitching, total compensation, operations | Theo Hanson · Open Water |

Each phase pairs an expository spine (objectives → lessons → assessments, with
two-way constructive-alignment links) with an experiential layer: a live AI
role-play against a counterpart with a hidden agenda, then a Kolb-cycle debrief.

## Tech stack

- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS** (custom deep-sea "Reef-Native" design system)
- **Supabase** for auth, profiles, surveys, and progress
- **Claude** (`claude-opus-5`) behind four serverless functions in `api/`
- **ElevenLabs** Conversational AI for the voice simulations
- **React Router**, **lucide-react**

## Getting started

```sh
npm install
cp .env.example .env        # fill in the Supabase values — required to boot
npm run dev                 # http://localhost:5173

npm run validate            # check the manifests and their cross-references
npm run typecheck           # app + serverless functions
npm run lint
npm run build               # validate, typecheck, then build
```

First-time setup also needs the database: run `docs/supabase-schema.sql` against
your Supabase project once. See [DEPLOY.md](DEPLOY.md).

## Project structure

```
src/
  data/
    curriculum.ts        # The 6-phase curriculum (single source of truth)
    scenarioBriefs.ts    # PUBLIC scenario copy — never the hidden state
    phaseArt.ts          # Per-phase visual identity
    reefLife.ts          # The totems / reef cast
  lib/
    supabase.ts          # Client + config-error detection
    surveys.ts           # Pre/post survey persistence
    progress.ts          # Phase completion and the unlock gate
  components/
    SimulationExperience.tsx  # The full-screen brief → sim → debrief → score flow
    VoiceCall.tsx             # ElevenLabs call, lazy-loaded (heavy WebRTC)
    MentorPanel.tsx           # The floating "Apex Mentor"
  pages/
    Landing.tsx          # Public front door at /
    Register.tsx         # Magic-link registration at /register
    Onboarding.tsx       # Profile + pre-program survey
    Program.tsx          # The phase grid and the learner's progress
    Phase.tsx            # One phase: objectives, videos, workshop, simulation
    PostSurvey.tsx       # Kirkpatrick-model post-program instrument
    Certificate.tsx      # Certificate of Completion
api/
  _model.ts              # The shared Claude model constant
  _scenarios.ts          # Server-side scenario registry (holds hiddenState)
  mentor.ts              # The Apex Mentor
  simulation.ts          # The simulated counterpart
  debrief.ts             # The Kolb debrief coach
  score.ts               # Structured rubric scoring
manifests/               # Machine-readable module + scenario specs
scripts/
  validate-manifests.mjs # Schema, alignment, and runtime-invariant checks
docs/                    # Design, agenda, facilitation, reading, schema
```

## The AI layer

Four serverless endpoints, all calling Claude server-side so the API key never
reaches the browser:

- **`/api/mentor`** — the floating Socratic mentor, available on every page.
- **`/api/simulation`** — the in-character counterpart. The browser sends only a
  `scenarioId`; the server injects that character's `hiddenState` (secret goals,
  reservation value, concession logic) into the system prompt. The learner never
  receives it, which is what makes the counterpart worth negotiating against.
- **`/api/debrief`** — walks the four Kolb stages against the real transcript,
  with the hidden state as ground truth.
- **`/api/score`** — one constrained judgement against the scenario's rubric,
  producing the score card and the phase gate.

**Without `ANTHROPIC_API_KEY` every endpoint degrades to scripted responses** so
the app never dead-ends. That's deliberate — and worth verifying before a cohort,
because a keyless deploy looks like a dull product rather than a missing setting.

## Documentation

| Document | What it covers |
|---|---|
| [DEPLOY.md](DEPLOY.md) | Vercel + Supabase setup, environment variables, verification |
| [docs/program-detail-and-agenda.md](docs/program-detail-and-agenda.md) | The 21-week calendar and all 10 session plans |
| [docs/facilitator-guide.md](docs/facilitator-guide.md) | How to run the room, the paired debriefs, and assessment |
| [docs/further-reading.md](docs/further-reading.md) | Reading lists per phase, plus the program's design sources |
| [docs/experiential-learning-design.md](docs/experiential-learning-design.md) | Why the experiential layer is built this way |
| [docs/supabase-schema.sql](docs/supabase-schema.sql) | The complete database schema (idempotent) |
| [manifests/README.md](manifests/README.md) | The module and scenario specs, and how to validate them |
| `docs/elevenlabs-*.md` | Build sheets for each voice agent |

## Roadmap

- [x] Wire the **Apex Mentor** to a real model (server-side, with graceful fallback).
- [x] **Simulated counterparts** driven by hidden game-theory variables (BATNA,
      promotion vs. prevention, concession logic).
- [x] Kolb-cycle **debrief agent** and rubric-based **scoring**.
- [x] **Persist learner progress**, and gate phases on the simulation score.
- [ ] Give **Theo Hanson** an ElevenLabs voice agent — the build sheet is written
      (`docs/elevenlabs-theo-hanson.md`); it needs the agent created and its id
      added to `scenarioBriefs.ts`. Until then The Migration runs as text.
- [ ] Stream mentor replies token-by-token.
- [ ] Offline resilience: cache phase content in IndexedDB.
- [ ] Facilitator view: cohort-wide progress and artifact submissions.

---

*Reef-Native · Tampa Bay · 2026*
