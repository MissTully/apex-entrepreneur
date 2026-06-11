# Apex · The Experiential Entrepreneurship Program

A browser-based, **Reef-Native** course platform that trains the *power skills* of the
modern founder — emotionally intelligent leadership, strategic communication, and empathy —
through five immersive phases mapped to the life-cycle of an apex predator.

> Built to thrive in isolated, low-bandwidth environments — just as a reef thrives
> away from deep-ocean currents.

## The Predator's Lexicon

| Phase | Codename | Focus |
|------:|----------|-------|
| 1 | **Apex Positioning** | Mindset · Strategy, motivation & risk (Promotion vs. Prevention, Game Theory) |
| 2 | **Coral Scaffolding** | Business architecture · The evolving document, BizChat methodology |
| 3 | **Navigating the Currents** | Integrative negotiation · BATNA, MESOs, counter-anchoring |
| 4 | **Schooling Strategy** | Leadership dynamics · Psychological safety, conversational repair |
| 5 | **The Migration** | Launch & future-proofing · Pitching, compensation, operational excellence |

## Tech stack

- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS** (custom deep-sea "Reef-Native" design system)
- **React Router** for the course shell
- **lucide-react** icons

## Getting started

```sh
npm install
npm run dev      # start the dev server at http://localhost:5173
npm run build    # type-check + production build
npm run preview  # preview the production build
```

## Project structure

```
src/
  data/curriculum.ts     # The 5-phase curriculum (single source of truth)
  components/
    Layout.tsx           # Page shell (navbar, footer, mentor)
    Navbar.tsx
    Footer.tsx
    PhaseCard.tsx        # Phase summary card
    MentorPanel.tsx      # Floating "Apex Mentor" chat (scripted; LLM-ready)
  pages/
    Landing.tsx          # Hero + philosophy + phase grid
    Program.tsx          # Program overview
    Phase.tsx            # Individual phase + learning objectives
    NotFound.tsx
```

## The Apex Mentor (live AI)

The floating mentor chats with a real model. The browser POSTs the conversation
to `api/mentor.ts` (a serverless function), which calls **Claude (`claude-opus-4-8`)**
server-side so the API key never reaches the client. Set `ANTHROPIC_API_KEY` in
your Vercel project (see `.env.example`) to enable it; without a key it falls
back to scripted Breaching / Diving prompts so the experience never dead-ends.

## Roadmap

- [x] Wire the **Apex Mentor** to a real model (server-side, with graceful fallback).
- [ ] Stream mentor replies token-by-token for a snappier feel.
- [ ] Add **Simulated Prospects** driven by hidden game-theory variables
      (BATNA, Promotion vs. Prevention).
- [ ] Persist learner progress with **IndexedDB** for offline resilience.
- [ ] Per-phase interactive workshops (negotiation scripts, pitch feedback).

---

*Reef-Native · Tampa Bay · 2026*
