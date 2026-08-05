-- Optional one-time fix for the survey_responses check constraint.
--
-- The table was created when the onboarding survey saved survey_type
-- 'onboarding'; the app later renamed it to 'pre_program' in code, so the
-- old constraint rejected onboarding submissions with:
--   new row for relation "survey_responses" violates check constraint
--   "survey_responses_survey_type_check"
--
-- The app now works against the old constraint (it falls back to the
-- original value), but running this in the Supabase SQL editor brings the
-- database in line with every survey_type the app may write.

ALTER TABLE public.survey_responses
  DROP CONSTRAINT IF EXISTS survey_responses_survey_type_check;

ALTER TABLE public.survey_responses
  ADD CONSTRAINT survey_responses_survey_type_check
  CHECK (survey_type IN ('onboarding', 'pre_program', 'post_program', 'post'));
