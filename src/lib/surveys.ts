import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from './supabase';

// The survey_responses check constraint originally only allowed the values
// 'pre' and 'post', while the code went through 'onboarding' and then
// 'pre_program'/'post_program' — so inserts failed with
// survey_responses_survey_type_check violations. The constraint has since
// been widened to accept every spelling below. Each list holds a survey's
// accepted spellings, canonical value first: inserts try them in order
// (falling back only on check violations, for databases with the old
// constraint) and reads match any of them.
export const PRE_SURVEY_TYPES = ['pre_program', 'onboarding', 'pre'];
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
