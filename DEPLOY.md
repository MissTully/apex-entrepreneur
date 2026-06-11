# Deploying Apex (getting a live link)

Apex is a Vite + React app **plus** one serverless function (`api/mentor.ts`)
that calls Claude. That serverless piece is why we deploy to **Vercel** rather
than plain static hosting (GitHub Pages can't run `api/mentor.ts`).

> The site works without the AI key — the mentor falls back to scripted prompts.
> Add the key to switch on the live "Apex Mentor."

## Easiest: import the repo in the Vercel dashboard (one-time, ~2 min)

1. Go to **vercel.com → Add New → Project** and import
   `MissTully/sim-consulting-revamp`.
2. **Root Directory:** click *Edit* and set it to **`apex`**
   *(skip this once you've run `SPLIT.md` — the app will be at the repo root).*
3. Framework preset auto-detects **Vite**. Leave build settings as-is.
4. **Environment Variables:** add
   - Name: `ANTHROPIC_API_KEY`
   - Value: your key from `platform.claude.com` (starts with `sk-ant-`)
5. Click **Deploy**. You get a live `*.vercel.app` URL in ~1 minute, and
   **every future push to the branch auto-deploys** — no CLI needed.

## Alternative: deploy from the command line

```sh
npm i -g vercel
cd apex
vercel            # first run links the project (interactive login)
vercel env add ANTHROPIC_API_KEY    # paste your key
vercel --prod     # production deploy → prints the live URL
```

## Notes

- **Never commit the API key.** It lives only in Vercel's env settings (or a
  local `.env`, which is git-ignored). The browser never sees it — calls go
  through `/api/mentor`.
- To use a custom domain, add it under the Vercel project's **Domains** tab.
