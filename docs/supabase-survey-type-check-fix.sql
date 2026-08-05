-- Fix for the survey_responses check constraint (applied to the live
-- "Apex Program" Supabase project on 2026-08-05 as migration
-- widen_survey_responses_survey_type_check; kept here for reference and
-- for recreating the database elsewhere).
--
-- The table was created with a constraint that only allowed survey_type
-- 'pre' and 'post', but the app went through 'onboarding' and then
-- 'pre_program'/'post_program', so onboarding submissions failed with:
--   new row for relation "survey_responses" violates check constraint
--   "survey_responses_survey_type_check"
--
-- This widens the constraint to every spelling the app has ever used.

ALTER TABLE public.survey_responses
  DROP CONSTRAINT survey_responses_survey_type_check;

ALTER TABLE public.survey_responses
  ADD CONSTRAINT survey_responses_survey_type_check
  CHECK (survey_type = ANY (ARRAY['pre'::text, 'post'::text, 'onboarding'::text, 'pre_program'::text, 'post_program'::text]));
