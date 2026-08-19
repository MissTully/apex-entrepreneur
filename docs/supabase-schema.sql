-- Apex · Supabase schema
-- =============================================================================
-- The complete backend the app expects. Until now the repo carried only a
-- one-off constraint fix, so the database could not be recreated from source —
-- this file is the source of truth. It is idempotent: safe to run against the
-- live project or a fresh one.
--
-- Run it in the Supabase SQL editor (Dashboard → SQL Editor → New query), or:
--   psql "$SUPABASE_DB_URL" -f docs/supabase-schema.sql
--
-- Three tables, all owner-scoped by row-level security:
--   profiles        one row per auth user, created automatically on signup
--   survey_responses  pre- and post-program instruments
--   phase_progress  which phases a learner has completed, and their sim scores
-- =============================================================================


-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
-- One row per auth.users row. The trigger below is what makes Onboarding's
-- upsert cheap and what stops a learner landing in the app with no profile row.

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles are readable by their owner" on public.profiles;
create policy "profiles are readable by their owner"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles are insertable by their owner" on public.profiles;
create policy "profiles are insertable by their owner"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles are updatable by their owner" on public.profiles;
create policy "profiles are updatable by their owner"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Create the profile row the moment a learner signs up, so the app never has to
-- guess whether one exists.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill anyone who signed up before the trigger existed.
insert into public.profiles (id)
select u.id from auth.users u
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

drop policy if exists "survey responses are readable by their owner" on public.survey_responses;
create policy "survey responses are readable by their owner"
  on public.survey_responses for select
  using (auth.uid() = user_id);

drop policy if exists "survey responses are insertable by their owner" on public.survey_responses;
create policy "survey responses are insertable by their owner"
  on public.survey_responses for insert
  with check (auth.uid() = user_id);


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

drop policy if exists "phase progress is readable by its owner" on public.phase_progress;
create policy "phase progress is readable by its owner"
  on public.phase_progress for select
  using (auth.uid() = user_id);

drop policy if exists "phase progress is insertable by its owner" on public.phase_progress;
create policy "phase progress is insertable by its owner"
  on public.phase_progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "phase progress is updatable by its owner" on public.phase_progress;
create policy "phase progress is updatable by its owner"
  on public.phase_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
