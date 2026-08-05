# Receiving the survey data

Both surveys (pre-program in `src/pages/Onboarding.tsx`, post-program in
`src/pages/PostSurvey.tsx`) write to one Supabase table, `survey_responses`:

| column        | value                                          |
|---------------|------------------------------------------------|
| `user_id`     | the participant (links to `auth.users` / `profiles`) |
| `survey_type` | `pre_program` or `post_program`                |
| `answers`     | every question, as one JSON object             |
| `created_at`  | submission time                                |

The data never leaves Supabase — there is no email, webhook, or export built
into the app. Here is how to get it, from simplest to most involved.

## Step 0 (do this first): run `supabase/schema.sql`

Open your Supabase project → **SQL Editor**, paste the contents of
[`supabase/schema.sql`](../supabase/schema.sql), and run it. It is safe to
re-run. It gives you:

1. **Row-Level Security policies** — without RLS, the public anon key baked
   into the site can read *every* participant's answers. This is the one
   security-critical item; do not skip it.
2. **A duplicate-submission guard** — one response per user per survey.
3. **Three export views** that flatten the JSON into spreadsheet columns and
   attach each participant's name and email:
   - `pre_program_export`
   - `post_program_export`
   - `pre_post_paired_export` (one row per participant, pre + post ESE items
     side-by-side, for measuring program impact)

   These views are admin-only — app users cannot query them.

## Option A — Supabase dashboard export (recommended, zero code)

1. Supabase Dashboard → **SQL Editor**
2. Run `select * from post_program_export;` (or `pre_program_export`, or
   `pre_post_paired_export`)
3. Click **Download CSV** → open in Excel / Google Sheets.

For a cohort-sized program this is all you need. Bookmark the three queries
as saved snippets in the SQL editor.

## Option B — email alert on each submission

If you want to *know* when someone submits (rather than checking the
dashboard), the app ships a ready-made endpoint: **`api/survey-notify.ts`**.
A Supabase Database Webhook calls it on every new response, and it emails you
a short heads-up ("New Post-Program Survey response from {name}"). The email
deliberately contains **no survey answers** — the data stays in Supabase and
you read it via the export views.

Setup (~10 minutes, one time):

1. **Create a Resend account** at [resend.com](https://resend.com) — sign up
   with the email address you want the alerts sent to. On the free tier with
   no custom domain, Resend only delivers to your own account email, which is
   exactly what we need. Create an API key (starts with `re_`).

2. **Add environment variables** in Vercel → your project → *Settings →
   Environment Variables*, then redeploy:

   | Name | Value |
   |------|-------|
   | `RESEND_API_KEY` | your `re_...` key |
   | `SURVEY_NOTIFY_TO` | the email address to alert |
   | `SURVEY_WEBHOOK_SECRET` | any long random string (e.g. from a password generator) |
   | `SUPABASE_URL` | *(optional)* your project URL — lets the email include the participant's name |
   | `SUPABASE_SERVICE_ROLE_KEY` | *(optional)* Supabase → Settings → API → `service_role` — pairs with the above |

3. **Create the webhook** in Supabase Dashboard → *Database → Webhooks* →
   **Create a new hook**:
   - Table: `survey_responses`, Events: **Insert** only
   - Type: HTTP Request, Method: POST
   - URL: `https://<your-app>.vercel.app/api/survey-notify`
   - HTTP Headers: add `x-survey-secret` = the same value as
     `SURVEY_WEBHOOK_SECRET`

4. **Test it**: submit a survey with a test account (or use the webhook's
   "Send test event" if available) and check your inbox. Failures show up in
   Supabase → Database → Webhooks → logs.

The `service_role` key bypasses all row security — it belongs **only** in
Vercel env settings, never in the browser code or git.

## Option C — admin page in the app

A `/admin` route with response tables and a CSV download button. This
requires real work to do safely: an `is_admin` flag on `profiles`, a
server-side Vercel API route using the **service-role key** (never shipped to
the browser), and admin-only route guarding. Worth it only if someone other
than you needs regular access, or you want charts. Recommend deferring until
Options A/B feel limiting.

## Option D — auto-sync to Google Sheets

Zapier/Make can append a row to a Google Sheet on every `survey_responses`
insert (triggered by the same webhook as Option B). Convenient, but the data
then lives in two places and includes personal information — only do this if
the sheet's sharing settings are locked down.

## Recommendation

- **Now:** run `schema.sql` (RLS is not optional), then use **Option A**.
- **If you want a heads-up per submission:** add **Option B** with a
  minimal "you got a response" email.
- **Later, if reporting becomes routine:** build **Option C**.
