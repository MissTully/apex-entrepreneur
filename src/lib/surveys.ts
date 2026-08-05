import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from './supabase';

// The live survey_responses table has a CHECK constraint on survey_type that
// was created for the original value 'onboarding'; the code later renamed the
// pre-program survey to 'pre_program' without a matching DB migration, so
// inserts started failing with survey_responses_survey_type_check violations.
// Each list holds every accepted spelling for a survey, ordered by which the
// deployed database is most likely to accept: inserts try them in order and
// reads match any of them.
export const PRE_SURVEY_TYPES = ['onboarding', 'pre_program'];
export const POST_SURVEY_TYPES = ['post_program', 'post'];

const CHECK_VIOLATION = '23514';

function isCheckViolation(error: PostgrestError): boolean {
    return error.code === CHECK_VIOLATION || /check constraint/i.test(error.message);
}

export async function saveSurveyResponse(
    userId: string,
    surveyTypes: string[],
    answers: Record<string, unknown>,
): Promise<{ error: PostgrestError | null }> {
    let lastError: PostgrestError | null = null;
    for (const surveyType of surveyTypes) {
        const { error } = await supabase.from('survey_responses').insert({
            user_id: userId,
            survey_type: surveyType,
            answers,
        });
        if (!error) return { error: null };
        lastError = error;
        // Only a survey_type the constraint rejects is worth retrying with
        // another spelling; any other failure would repeat identically.
        if (!isCheckViolation(error)) break;
    }
    return { error: lastError };
}
