import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PRE_SURVEY_TYPES, POST_SURVEY_TYPES } from '../lib/surveys';
import { useAuth } from '../hooks/useAuth';
import {
    User, Mail, Award, BookOpen, BarChart2, CheckCircle,
    Calendar, Target, ChevronRight
} from 'lucide-react';

interface ProfileData {
    full_name: string;
    email: string;
    created_at: string;
}

interface SurveyData {
    survey_type: string;
    answers: Record<string, unknown>;
    submitted_at: string;
}

/**
 * Tailwind's JIT only emits classes it can find as literal strings in source, so
 * every badge colour is a complete literal here. Building them by interpolation
 * (`bg-${color}-400/15`) compiles fine and renders unstyled — the same rule the
 * accent maps in Phase.tsx and PhaseCard.tsx follow.
 */
const BADGE: Record<string, string> = {
    reef: 'bg-glow/15 text-glow border-glow/30',
    kelp: 'bg-kelp/15 text-kelp border-kelp/30',
    urchin: 'bg-urchin/15 text-urchin border-urchin/40',
    gold: 'bg-kelp/15 text-kelp border-kelp/30',
};

function Badge({ label, color = 'reef' }: { label: string; color?: keyof typeof BADGE | string }) {
    return (
          <span className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${BADGE[color] ?? BADGE.reef}`}>
            {label}
          </span>
        );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
    return (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-glow/15 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-glow" />
                </div>
                <div>
                        <p className="text-foam/50 text-xs">{label}</p>
                        <p className="text-foam font-medium text-sm mt-0.5">{value}</p>
                </div>
          </div>
        );
}

export default function Profile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [surveys, setSurveys] = useState<SurveyData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
          if (!user) return;
          async function load() {
                  const [{ data: p }, { data: s }] = await Promise.all([
                            supabase.from('profiles').select('full_name, created_at').eq('id', user!.id).single(),
                            supabase.from('survey_responses').select('survey_type, answers, submitted_at').eq('user_id', user!.id).order('submitted_at', { ascending: false }),
                          ]);
                  if (p) setProfile({ ...p, email: user!.email ?? '' });
                  if (s) setSurveys(s);
                  setLoading(false);
          }
          load();
    }, [user]);

    const preSurvey = surveys.find(s => PRE_SURVEY_TYPES.includes(s.survey_type));
    const postSurvey = surveys.find(s => POST_SURVEY_TYPES.includes(s.survey_type));
    const joinedDate = profile?.created_at
          ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
          : '—';

    if (loading) {
          return (
                  <div className="min-h-[70vh] flex items-center justify-center">
                          <div className="text-glow animate-pulse">Loading your profile…</div>
                  </div>
                );
    }

    return (
          <div className="min-h-[70vh] px-4 py-12">
                <div className="max-w-2xl mx-auto space-y-6">

                  {/* ── Hero card ── */}
                        <div className="bg-white/5 rounded-2xl p-8 border border-white/10 text-center">
                                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-glow/15 border border-glow/30 mb-4">
                                              <User className="w-9 h-9 text-glow" />
                                  </div>
                                  <h1 className="text-3xl font-bold text-foam">{profile?.full_name || 'Apex Member'}</h1>
                                  <p className="text-foam/50 text-sm mt-1 flex items-center justify-center gap-1.5">
                                              <Mail className="w-3.5 h-3.5" /> {profile?.email}
                                  </p>
                                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                                              <Badge label="Apex Entrepreneur" />
                                    {preSurvey && <Badge label="Pre-Survey Complete" color="kelp" />}
                                    {postSurvey && <Badge label="Post-Survey Complete" color="urchin" />}
                                    {postSurvey && <Badge label="Certificate Earned" color="gold" />}
                                  </div>
                        </div>

                  {/* ── Stats ── */}
                        <div className="grid grid-cols-2 gap-4">
                                  <StatCard icon={Calendar} label="Member Since" value={joinedDate} />
                                  <StatCard icon={Target} label="Program Status" value={postSurvey ? 'Completed ✦' : 'In Progress'} />
                                  <StatCard icon={BarChart2} label="Surveys Completed" value={`${surveys.length} / 2`} />
                                  <StatCard icon={BookOpen} label="Program" value="Apex Entrepreneur" />
                        </div>

                  {/* ── Survey Status ── */}
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                  <h2 className="text-foam font-semibold text-lg mb-4 flex items-center gap-2">
                                              <BarChart2 className="w-5 h-5 text-glow" /> Survey Progress
                                  </h2>
                                  <div className="space-y-3">
                                              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                                            <div className="flex items-center gap-3">
                                                                            <CheckCircle className={`w-5 h-5 ${preSurvey ? 'text-kelp' : 'text-foam/20'}`} />
                                                                            <div>
                                                                                              <p className="text-foam text-sm font-medium">Pre-Program Survey</p>
                                                                                              <p className="text-foam/40 text-xs">Demographics, knowledge, confidence &amp; intentions</p>
                                                                            </div>
                                                            </div>
                                                {preSurvey ? (
                            <span className="text-kelp text-xs font-medium">Done</span>
                          ) : (
                            <Link to="/onboarding" className="text-glow text-xs font-medium flex items-center gap-1">
                                              Start <ChevronRight className="w-3 h-3" />
                            </Link>
                                                            )}
                                              </div>
                                              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                                            <div className="flex items-center gap-3">
                                                                            <CheckCircle className={`w-5 h-5 ${postSurvey ? 'text-kelp' : 'text-foam/20'}`} />
                                                                            <div>
                                                                                              <p className="text-foam text-sm font-medium">Post-Program Survey</p>
                                                                                              <p className="text-foam/40 text-xs">Reaction, learning gains, behavior &amp; outcomes</p>
                                                                            </div>
                                                            </div>
                                                {postSurvey ? (
                            <span className="text-kelp text-xs font-medium">Done</span>
                          ) : (
                            <span className="text-foam/30 text-xs">Unlocks at program end</span>
                                                            )}
                                              </div>
                                  </div>
                        </div>

                  {/* ── Certificate ── */}
                        <div className={`rounded-2xl p-6 border ${postSurvey ? 'bg-kelp/10 border-kelp/30' : 'bg-white/5 border-white/10'}`}>
                                  <h2 className="text-foam font-semibold text-lg mb-2 flex items-center gap-2">
                                              <Award className={`w-5 h-5 ${postSurvey ? 'text-kelp' : 'text-foam/30'}`} />
                                              Certificate of Completion
                                  </h2>
                          {postSurvey ? (
                        <div>
                                      <p className="text-foam/70 text-sm mb-4">
                                                      Congratulations! Your certificate is ready. Download it or share it directly on LinkedIn.
                                      </p>
                                      <Link
                                                        to="/certificate"
                                                        className="inline-flex items-center gap-2 bg-kelp hover:bg-kelp text-abyss font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
                                                      >
                                                      <Award className="w-4 h-4" /> View Certificate
                                      </Link>
                        </div>
                      ) : (
                        <p className="text-foam/40 text-sm">
                                      Complete the post-program survey to unlock your Certificate of Completion from the
                                      Hillsborough County Entrepreneurship Center.
                        </p>
                                  )}
                        </div>

                  {/* ── Navigation ── */}
                        <div className="flex gap-3">
                                  <Link
                                                to="/members"
                                                className="flex-1 text-center border border-white/20 text-foam/60 py-3 rounded-xl text-sm hover:border-white/40 transition-colors"
                                              >
                                              ← Program Dashboard
                                  </Link>
                          {!postSurvey && (
                        <Link
                                        to="/post-survey"
                                        className="flex-1 text-center bg-tide hover:brightness-125 text-foam font-semibold py-3 rounded-xl text-sm transition-colors"
                                      >
                                      Take Post-Survey →
                        </Link>
                                  )}
                        </div>

                </div>
          </div>
        );
}
