import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ClipboardList, Compass, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

/**
 * Where the magic link in the invitation email lands.
 *
 * Its whole job is to confirm the address was verified and hand the learner to
 * the next required step — onboarding (profile + pre-program survey) before the
 * course opens. It used to sit on a forced six-second timer with no way to skip;
 * now the primary button is live immediately and the redirect is a safety net
 * for anyone who wanders off, not a gate.
 */
export default function MagicLinkLanding() {
    const { user, loading, hasProfile, hasSurvey } = useAuth();
    const navigate = useNavigate();

    const onboarded = hasProfile && hasSurvey;
    const next = onboarded ? '/members' : '/onboarding';

    useEffect(() => {
        if (loading || !user) return;
        // Long enough to read the screen, short enough not to feel stuck.
        const timer = setTimeout(() => navigate(next, { replace: true }), 12000);
        return () => clearTimeout(timer);
    }, [loading, user, next, navigate]);

    return (
        <div className="min-h-[70vh] px-4 py-16">
            <div className="mx-auto w-full max-w-xl text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-glow/15 text-glow">
                    <CheckCircle className="h-8 w-8" />
                </div>

                <h1 className="mt-6 font-display text-3xl font-bold text-foam sm:text-4xl">
                    You&apos;re verified.
                </h1>
                <p className="mt-3 text-foam/70">
                    Welcome to <span className="font-semibold text-foam">Apex</span> — the experiential
                    entrepreneurship program at the Hillsborough County Entrepreneurship Center.
                </p>

                {onboarded ? (
                    <p className="mt-6 text-foam/70">
                        You&apos;ve already completed onboarding, so the course is open.
                    </p>
                ) : (
                    <div className="mt-8 rounded-2xl border border-white/10 bg-deep/70 p-6 text-left">
                        <p className="text-xs font-semibold uppercase tracking-widest text-foam/50">
                            Two steps before the course opens
                        </p>
                        <ol className="mt-4 space-y-4">
                            <li className="flex gap-3">
                                <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-glow" />
                                <div>
                                    <p className="font-medium text-foam">Tell us who you are</p>
                                    <p className="mt-0.5 text-sm text-foam/60">
                                        Your name, and a short pre-program survey covering your background,
                                        confidence, and goals. About 5&ndash;8 minutes.
                                    </p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <Compass className="mt-0.5 h-5 w-5 shrink-0 text-glow" />
                                <div>
                                    <p className="font-medium text-foam">Meet the program</p>
                                    <p className="mt-0.5 text-sm text-foam/60">
                                        A short tour of the six phases and how they work &mdash; then you enter
                                        the reef.
                                    </p>
                                </div>
                            </li>
                        </ol>
                        <p className="mt-5 border-t border-white/10 pt-4 text-sm text-foam/55">
                            The survey runs again at the end of the program. The pair is how we measure what
                            the cohort actually gained &mdash; and completing both unlocks your certificate.
                        </p>
                    </div>
                )}

                <button
                    onClick={() => navigate(next, { replace: true })}
                    className="btn-primary mt-8 px-6 py-3 text-base"
                >
                    {onboarded ? 'Go to your course' : 'Start onboarding'} <ArrowRight className="h-5 w-5" />
                </button>
                <p className="mt-3 text-xs text-foam/40">Taking you there automatically in a few seconds.</p>
            </div>
        </div>
    );
}
