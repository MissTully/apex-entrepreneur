-- ═══════════════════════════════════════════════════════════════════
-- Apex · Supabase schema, security policies & survey export views
--
-- Run this in the Supabase Dashboard → SQL Editor. It is idempotent:
-- safe to re-run at any time. If your tables already exist, the
-- CREATE TABLE statements are skipped and only the policies, the
-- duplicate-submission guard, and the export views are (re)applied.
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Tables ────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text,
  created_at timestamptz not null default now()
);

create table if not exists public.survey_responses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  survey_type text not null check (survey_type in ('pre_program', 'post_program')),
  answers     jsonb not null,
  created_at  timestamptz not null default now()
);

-- One response per user per survey. Without this, re-visiting
-- /post-survey inserts a second row and skews every average.
create unique index if not exists survey_responses_user_type_uniq
  on public.survey_responses (user_id, survey_type);

-- ── 2. Row-Level Security ────────────────────────────────────────────
-- The browser talks to Supabase with the public anon key, so RLS is the
-- ONLY thing preventing one participant from reading another's answers.

alter table public.profiles         enable row level security;
alter table public.survey_responses enable row level security;

drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "surveys: insert own" on public.survey_responses;
create policy "surveys: insert own" on public.survey_responses
  for insert with check (auth.uid() = user_id);

drop policy if exists "surveys: read own" on public.survey_responses;
create policy "surveys: read own" on public.survey_responses
  for select using (auth.uid() = user_id);

-- Intentionally no UPDATE or DELETE policies on survey_responses:
-- submitted responses are immutable from the client. Corrections go
-- through the dashboard (service role bypasses RLS).

-- ── 3. Auto-create a profile row on signup ───────────────────────────
-- Onboarding UPDATEs profiles rather than inserting, so a row must
-- exist the moment a user signs up. Skip this section if you already
-- have an equivalent trigger.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── 4. Export views ──────────────────────────────────────────────────
-- The app stores each response as one JSON blob, which is painless to
-- write but painful to analyze. These views flatten every question into
-- its own column and join the participant's name + email, so a single
-- query gives you a spreadsheet-ready table.
--
-- They are for YOU, not for app users: access is revoked from the anon
-- and authenticated roles below, so only the dashboard / service role
-- can read them.

create or replace view public.pre_program_export as
select
  sr.created_at                              as submitted_at,
  p.full_name,
  u.email,
  -- Demographics
  sr.answers->>'ageGroup'                    as age_group,
  sr.answers->>'gender'                      as gender,
  sr.answers->>'education'                   as education,
  sr.answers->>'employment'                  as employment,
  sr.answers->>'priorExp'                    as prior_experience,
  sr.answers->>'priorExpDesc'                as prior_experience_desc,
  sr.answers->>'hearAbout'                   as heard_about_via,
  (select string_agg(g, '; ')
     from jsonb_array_elements_text(sr.answers->'goals') g) as goals,
  -- Knowledge (1–5)
  (sr.answers->>'kBizPlan')::int             as k_business_planning,
  (sr.answers->>'kFinance')::int             as k_financial_mgmt,
  (sr.answers->>'kMarketing')::int           as k_marketing,
  (sr.answers->>'kLegal')::int               as k_legal,
  (sr.answers->>'skillOpp')::int             as skill_opportunity_id,
  (sr.answers->>'skillPitch')::int           as skill_pitching,
  -- Entrepreneurial self-efficacy (1–5)
  (sr.answers->>'eseOpp')::int               as ese_opportunity_id,
  (sr.answers->>'eseBizPlan')::int           as ese_business_plan,
  (sr.answers->>'eseFinRisk')::int           as ese_financial_risk,
  (sr.answers->>'eseMarketing')::int         as ese_marketing,
  (sr.answers->>'eseTeam')::int              as ese_team_building,
  (sr.answers->>'eseMarshall')::int          as ese_marshalling,
  -- Intentions (1–5)
  (sr.answers->>'intNearFuture')::int        as int_near_future,
  (sr.answers->>'intPursue')::int            as int_pursue,
  (sr.answers->>'intDesire')::int            as int_desire,
  (sr.answers->>'intEffort')::int            as int_effort,
  -- Open text
  sr.answers->>'expectations'                as expectations,
  sr.user_id
from public.survey_responses sr
join auth.users u   on u.id = sr.user_id
left join public.profiles p on p.id = sr.user_id
where sr.survey_type = 'pre_program'
order by sr.created_at desc;

create or replace view public.post_program_export as
select
  sr.created_at                              as submitted_at,
  p.full_name,
  u.email,
  -- Reaction (Kirkpatrick L1)
  (sr.answers->>'rxSessions')::int           as rx_live_sessions,
  (sr.answers->>'rxApp')::int                as rx_app_and_sims,
  (sr.answers->>'rxContent')::int            as rx_content,
  (sr.answers->>'rxMentor')::int             as rx_mentors,
  (sr.answers->>'rxOverall')::int            as rx_overall,
  (sr.answers->>'nps')::int                  as nps,
  sr.answers->>'rxValuable'                  as most_valuable,
  sr.answers->>'rxImprove'                   as could_improve,
  -- Learning (L2)
  (sr.answers->>'lrnBizPlan')::int           as lrn_business_planning,
  (sr.answers->>'lrnFinance')::int           as lrn_financial_mgmt,
  (sr.answers->>'lrnMarketing')::int         as lrn_marketing,
  (sr.answers->>'lrnLegal')::int             as lrn_legal,
  (sr.answers->>'lrnConfidence')::int        as lrn_confidence,
  (sr.answers->>'lrnSimulation')::int        as lrn_ai_simulations,
  (sr.answers->>'lrnEseOpp')::int            as ese_opportunity_id,
  (sr.answers->>'lrnEseBizPlan')::int        as ese_business_plan,
  (sr.answers->>'lrnEseFinRisk')::int        as ese_financial_risk,
  (sr.answers->>'lrnEseMarketing')::int      as ese_marketing,
  (sr.answers->>'lrnEseTeam')::int           as ese_team_building,
  -- Behavior (L3)
  (sr.answers->>'bhvApplied')::int           as bhv_applied_concepts,
  (sr.answers->>'bhvSteps')::int             as bhv_concrete_steps,
  sr.answers->>'bhvChallenges'               as challenge_overcome,
  -- Results (L4)
  (sr.answers->>'resProgress')::int          as res_goal_progress,
  (sr.answers->>'resValue')::int             as res_value_for_effort,
  (select string_agg(m, '; ')
     from jsonb_array_elements_text(sr.answers->'resMilestones') m) as milestones,
  sr.answers->>'resOutcomes'                 as outcomes,
  -- Final
  sr.answers->>'barriers'                    as barriers,
  sr.answers->>'suggestions'                 as suggestions,
  sr.user_id
from public.survey_responses sr
join auth.users u   on u.id = sr.user_id
left join public.profiles p on p.id = sr.user_id
where sr.survey_type = 'post_program'
order by sr.created_at desc;

-- Admin-only: app users must never see other participants' data.
revoke all on public.pre_program_export  from anon, authenticated;
revoke all on public.post_program_export from anon, authenticated;

-- Pre/post paired view — one row per participant with both submissions,
-- for measuring change across the program (ESE items align 1:1).
create or replace view public.pre_post_paired_export as
select
  u.email,
  p.full_name,
  pre.created_at  as pre_submitted_at,
  post.created_at as post_submitted_at,
  (pre.answers->>'eseOpp')::int            as pre_ese_opportunity_id,
  (post.answers->>'lrnEseOpp')::int        as post_ese_opportunity_id,
  (pre.answers->>'eseBizPlan')::int        as pre_ese_business_plan,
  (post.answers->>'lrnEseBizPlan')::int    as post_ese_business_plan,
  (pre.answers->>'eseFinRisk')::int        as pre_ese_financial_risk,
  (post.answers->>'lrnEseFinRisk')::int    as post_ese_financial_risk,
  (pre.answers->>'eseMarketing')::int      as pre_ese_marketing,
  (post.answers->>'lrnEseMarketing')::int  as post_ese_marketing,
  (pre.answers->>'eseTeam')::int           as pre_ese_team_building,
  (post.answers->>'lrnEseTeam')::int       as post_ese_team_building,
  (post.answers->>'nps')::int              as nps
from auth.users u
left join public.profiles p on p.id = u.id
left join public.survey_responses pre
  on pre.user_id = u.id and pre.survey_type = 'pre_program'
left join public.survey_responses post
  on post.user_id = u.id and post.survey_type = 'post_program'
where pre.id is not null or post.id is not null
order by coalesce(post.created_at, pre.created_at) desc;

revoke all on public.pre_post_paired_export from anon, authenticated;
