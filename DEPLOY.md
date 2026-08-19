# Deploying Apex

Apex is a Vite + React app **plus** four serverless functions in `api/` that call
Claude. That serverless half is why it deploys to **Vercel** rather than static
hosting — GitHub Pages can't run `api/*.ts`.

## Before the first deploy: the database

The app needs Supabase. Once per project:

1. Create a Supabase project (or open the existing "Apex Program" one).
2. Open **SQL Editor → New query**, paste `docs/supabase-schema.sql`, and run it.
   It's idempotent, so running it against an existing project is safe — it fills
   in whatever's missing (the `phase_progress` table, the signup trigger, the
   row-level-security policies) without disturbing existing rows.
3. From **Project Settings → API**, copy the project URL and the `anon` public key.

## Deploy

1. **vercel.com → Add New → Project** and import `MissTully/apex-entrepreneur`.
2. Leave the root directory as the repository root. The framework preset
   auto-detects **Vite**; leave the build settings alone — `vercel.json` sets the
   build command to `npm run build`, which validates the manifests and
   type-checks both the app and `api/` before building.
3. Add the **environment variables** below.
4. **Deploy.** You get a live `*.vercel.app` URL in about a minute, and every
   later push to the branch redeploys automatically.

## Environment variables

Set these under **Settings → Environment Variables** for Production (and Preview,
if you want previews to work against the same data).

| Name | Required | What it does |
|---|---|---|
| `VITE_SUPABASE_URL` | **Yes** | Supabase project URL. Without it the app shows a configuration screen instead of booting. |
| `VITE_SUPABASE_ANON_KEY` | **Yes** | Supabase public anon key. Row-level security scopes it; safe in the browser bundle. |
| `ANTHROPIC_API_KEY` | Strongly recommended | Powers the mentor, the simulated counterparts, the debrief coach, and scoring. Get it from platform.claude.com; starts with `sk-ant-`. |
| `ANTHROPIC_MODEL` | No | Overrides the model (default `claude-opus-5`, see `api/_model.ts`). |

**The `VITE_` variables are read at build time**, so adding them to an existing
project does nothing until you redeploy.

**Without `ANTHROPIC_API_KEY`** the site still works end to end — every endpoint
degrades to scripted responses so nothing dead-ends. This is deliberate, and it's
also a trap: a cohort running without a key sees a simulation that repeats the
same three lines and never scores anything. It looks like a dull product rather
than a missing setting. Verify a real simulation before every cohort.

## Deploy from the command line instead

```sh
npm i -g vercel
vercel                              # first run links the project
vercel env add ANTHROPIC_API_KEY    # repeat for the Supabase variables
vercel --prod                       # production deploy; prints the live URL
```

## Verifying a deploy

1. Open the site. If you get "This deploy is missing a setting", the Supabase
   variables aren't set — fix and **redeploy**.
2. Register with a real address and confirm the magic link arrives.
3. Open any phase and run its simulation. If the score card says live scoring
   needs the server API key, `ANTHROPIC_API_KEY` is missing or invalid.
4. Check that completing a simulation marks the phase complete on `/program`. If
   it doesn't, `docs/supabase-schema.sql` hasn't been applied — the app tolerates
   this silently by design, so it won't error, it just won't remember.

The full pre-cohort checklist is in `docs/program-detail-and-agenda.md` §5.

## Notes

- **Never commit the API key.** It lives in Vercel's environment settings (or a
  local `.env`, which is git-ignored). The browser never sees it — calls route
  through `/api/*`.
- Custom domains go under the Vercel project's **Domains** tab.
- The ElevenLabs voice agent IDs in `src/data/scenarioBriefs.ts` are public agent
  identifiers, not secrets, and are safe in the bundle. The agents themselves must
  have public embedding enabled — see `docs/elevenlabs-*.md`.
