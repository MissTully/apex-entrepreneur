-- Apex · Supabase schema
-- =============================================================================
-- The backend the app expects, transcribed from the live "Apex Program" project
-- (ref wgvqverquxnbqdxlszcu) so the repo finally carries an accurate record.
--
-- Applied migrations, in order:
--   20260616232715  apex_registration_surveys
--   20260616234417  harden_handle_new_user
--   20260617171817  admin_access
--   20260805233137  widen_survey_responses_survey_type_check
--   20260819234...  apex_phase_progress          <- added with this change
--
-- Idempotent and NON-DESTRUCTIVE: every table is `if not exists`, every policy
-- is dropped by its real name before being recreated, and handle_new_user()
-- below is the CURRENT hardened definition. Do not "simplify" that function —
-- an earlier draft of this file inserted only (id), which would have silently
-- stopped populating full_name and email on signup.
--
-- Run it in the Supabase SQL editor (Dashboard -> SQL Editor -> New query), or:
--   psql "$SUPABASE_DB_URL" -f docs/supabase-schema.sql
--
-- Four tables, all owner-scoped by row-level security, with an admin read layer:
--   profiles          one row per auth user, created automatically on signup
--   survey_responses  pre- and post-program instruments
--   phase_progress    which phases a learner completed, and their sim scores
--   admins            who private.is_admin() lets read everything
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Admin access
-- -----------------------------------------------------------------------------
-- The `private` schema keeps is_admin() out of the API surface. It is SECURITY
-- DEFINER and STABLE so RLS policies can call it without recursing into the
-- policies on public.admins.

create schema if not exists private;

create table if not exists public.admins (
  user_id   uuid primary key references auth.users (id) on delete cascade,
  added_at  timestamptz not null default now()
);

alter table public.admins enable row level security;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce((auth.jwt() ->> 'email') = 'melissajotully@gmail.com', false)
    or exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

drop policy if exists "Admins read admin list" on public.admins;
create policy "Admins read admin list"
  on public.admins for select
  using (private.is_admin());


-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
-- One row per auth.users row, created by the trigger below so the app never has
-- to guess whether one exists. Onboarding upserts full_name on top.

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  email       text,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles viewable by owner" on public.profiles;
create policy "Profiles viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Admins read all profiles" on public.profiles;
create policy "Admins read all profiles"
  on public.profiles for select
  using (private.is_admin());

-- Seed the profile row at signup, carrying across whatever the auth record knows.
-- This is the hardened version (migration harden_handle_new_user) — it pulls
-- full_name from the signup metadata and email from the auth user. Keep it.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill anyone who signed up before the trigger existed.
insert into public.profiles (id, email)
select u.id, u.email from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;


-- -----------------------------------------------------------------------------
-- survey_responses
-- -----------------------------------------------------------------------------
-- The pre- and post-program instruments. `answers` is JSONB because the
-- instrument evolves faster than a column list should.
--
-- The survey_type constraint accepts every spelling the app has ever written
-- (see src/lib/surveys.ts and docs/supabase-survey-type-check-fix.sql for the
-- history); the app writes the canonical 'pre_program' / 'post_program'.

create table if not exists public.survey_responses (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  survey_type   text not null,
  answers       jsonb not null default '{}'::jsonb,
  submitted_at  timestamptz not null default now()
);

alter table public.survey_responses
  drop constraint if exists survey_responses_survey_type_check;
alter table public.survey_responses
  add constraint survey_responses_survey_type_check
  check (survey_type = any (array['pre','post','onboarding','pre_program','post_program']));

create index if not exists survey_responses_user_type_idx
  on public.survey_responses (user_id, survey_type);

alter table public.survey_responses enable row level security;

drop policy if exists "Responses viewable by owner" on public.survey_responses;
create policy "Responses viewable by owner"
  on public.survey_responses for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own responses" on public.survey_responses;
create policy "Users insert own responses"
  on public.survey_responses for insert
  with check (auth.uid() = user_id);

drop policy if exists "Admins read all responses" on public.survey_responses;
create policy "Admins read all responses"
  on public.survey_responses for select
  using (private.is_admin());


-- -----------------------------------------------------------------------------
-- phase_progress
-- -----------------------------------------------------------------------------
-- One row per learner per phase. Written when a learner finishes a phase's
-- simulation; read by the Program grid, the Phase page, the Profile, and the
-- certificate. Without it the app computes an unlock gate it immediately
-- forgets, and the certificate attests to phases nothing has verified.
--
-- `phase_slug` matches the slugs in src/data/curriculum.ts and the moduleIds in
-- manifests/index.json. Scores are nullable: a voice scenario is formative and
-- debriefed in pairs, so it completes a phase without producing a number.

create table if not exists public.phase_progress (
  user_id       uuid not null references auth.users (id) on delete cascade,
  phase_slug    text not null,
  status        text not null default 'in_progress',
  score_total   integer,
  score_max     integer,
  unlocked      boolean not null default false,
  attempts      integer not null default 1,
  completed_at  timestamptz,
  updated_at    timestamptz not null default now(),
  primary key (user_id, phase_slug),
  constraint phase_progress_status_check
    check (status = any (array['in_progress','completed'])),
  constraint phase_progress_score_check
    check (score_total is null or (score_total >= 0 and score_total <= coalesce(score_max, score_total)))
);

create index if not exists phase_progress_user_idx on public.phase_progress (user_id);

alter table public.phase_progress enable row level security;

drop policy if exists "Progress viewable by owner" on public.phase_progress;
create policy "Progress viewable by owner"
  on public.phase_progress for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own progress" on public.phase_progress;
create policy "Users insert own progress"
  on public.phase_progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own progress" on public.phase_progress;
create policy "Users update own progress"
  on public.phase_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Admins read all progress" on public.phase_progress;
create policy "Admins read all progress"
  on public.phase_progress for select
  using (private.is_admin());
