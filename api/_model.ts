/**
 * The Claude model every Apex endpoint talks to.
 *
 * The `_` prefix tells Vercel this is a helper module, NOT a routable endpoint.
 *
 * One constant so the mentor, the counterpart, the debrief coach, and the
 * scorer can never drift apart — a scenario scored by one model and debriefed
 * by another produces feedback that doesn't match the score.
 *
 * Override per-deploy with the ANTHROPIC_MODEL environment variable (useful for
 * A/B-ing a new model on a preview branch without a code change).
 */
export const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5";
