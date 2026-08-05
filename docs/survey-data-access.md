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
dashboard), add a Supabase **Database Webhook**:

1. Dashboard → **Database → Webhooks** → create webhook on
   `survey_responses`, event `INSERT`.
2. Point it at a small Vercel function (e.g. `api/survey-notify.ts`) that
   emails you via a provider like Resend, or point it at a Zapier/Make
   "webhook → Gmail" zap with no code at all.

Keep the notification to "New post-program survey received from {email}" and
pull the full answers from the export views — don't forward raw answer
payloads through third-party automation tools.

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
