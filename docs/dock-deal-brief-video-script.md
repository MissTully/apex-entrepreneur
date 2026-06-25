# The Dock Deal — Brief setup video script

A short cold-open that plays at the **top of the role-play brief** (the "Brief"
step of the simulation, before the written *givens*). The goal: the learner
*hears* who they're about to negotiate with — the counterpart, the product, the
price, and the backstory — so they walk in oriented instead of cold.

- **Runtime target:** ~45 seconds (40–55s is fine).
- **Tone:** calm, cinematic, "here's the situation" — not a hype reel. Tampa Bay
  marina at golden hour; the same deep-sea palette as the app.
- **Voice:** warm, grounded narrator (second person — talk to the learner).
- **Hosting:** YouTube (unlisted is fine). The video id lives in
  `src/data/scenarioBriefs.ts` → `"apex-positioning"` → `prebriefVideo.youtubeId`.
  To swap the video, replace that id — nothing else needs to change.

---

## Narration (voiceover)

> In 48 hours, your quarter closes.
>
> You're Jordan — founder of **DockOS**, the fleet-management and booking
> platform you built for operations exactly like this one.
>
> Across the dock is **Dale Mercer**. He owns **Mercer Marina** on Tampa Bay —
> twelve vessels, a slip operation, and a partner he answers to. Dale runs the
> place himself and watches every dollar.
>
> Your license is **twelve thousand dollars** a year. That's not an opening
> bluff — that's the value. DockOS gets a marina live in **three days**, while
> most marine software drags switchovers out for weeks.
>
> But Dale's been burned before — software that demoed beautifully and turned
> into a peak-season nightmare. So he's come back low: **eighty-four hundred** —
> and he says he's looking at other platforms.
>
> A bad-value deal is worse than no deal. You can flex on support, on timing, on
> how he grows into it — you do **not** have to gut the price to win.
>
> Find what Dale's really protecting… before the quarter closes.

---

## On-screen beats (optional storyboard)

| Time   | Visual                                                  | Lower-third / text     |
| ------ | ------------------------------------------------------- | ---------------------- |
| 0–5s   | Tampa Bay marina, slow push-in. Clock motif.            | "48 hours to close"    |
| 5–14s  | DockOS UI glimpses; "you are Jordan."                   | DockOS · your platform |
| 14–26s | Dale on the dock, arms crossed, friendly but cautious.  | Dale Mercer · Owner    |
| 26–36s | "$12,000" and "3-day onboarding" as clean supers.       | $12,000/yr · 3-day go-live |
| 36–48s | Dale's counter slides in: "$8,400 — and he's shopping." | The counter: $8,400    |
| 48–end | Cut to black; the line lands.                           | "What's he protecting?" |

---

## Notes for the editor

- **Don't reveal Dale's true ceiling or motive.** The brief is deliberately
  blind to what's being measured. Keep the hidden state hidden — the video sets
  the table, it doesn't solve the negotiation. (The secret state lives
  server-side in `manifests/scenarios/apex-positioning-S1.json`.)
- Keep every fact consistent with the written *givens* in
  `src/data/scenarioBriefs.ts`: $12,000 license, 3-day onboarding, 48-hour
  quarter close, Dale's $8,400 counter, flex on support/timing/expansion.
- End on the question, not an answer — it should hand the learner straight into
  the conversation.
