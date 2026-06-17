import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
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
    created_at: string;
}

function Badge({ label, color = 'cyan' }: { label: string; color?: string }) {
    return (
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-${color}-400/15 text-${color}-300 border border-${color}-400/30`}>
            {label}
          </span>
        );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
    return (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-400/15 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                        <p className="text-white/50 text-xs">{label}</p>
                        <p className="text-white font-medium text-sm mt-0.5">{value}</p>
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
                            supabase.from('survey_responses').select('survey_type, answers, created_at').eq('user_id', user!.id).order('created_at', { ascending: false }),
                          ]);
                  if (p) setProfile({ ...p, email: user!.email ?? '' });
                  if (s) setSurveys(s);
                  setLoading(false);
          }
          load();
    }, [user]);

    const preSurvey = surveys.find(s => s.survey_type === 'pre');
    const postSurvey = surveys.find(s => s.survey_type === 'post');
    const joinedDate = profile?.created_at
          ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
          : '—';

    if (loading) {
          return (
                  <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
                          <div className="text-cyan-400 animate-pulse">Loading your profile…</div>
                  </div>
                );
    }

    return (
          <div className="min-h-screen bg-[#0a1628] px-4 py-12">
                <div className="max-w-2xl mx-auto space-y-6">

                  {/* ── Hero card ── */}
                        <div className="bg-white/5 rounded-2xl p-8 border border-white/10 text-center">
                                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cyan-400/15 border border-cyan-400/30 mb-4">
                                              <User className="w-9 h-9 text-cyan-400" />
                                  </div>
                                  <h1 className="text-3xl font-bold text-white">{profile?.full_name || 'Apex Member'}</h1>
                                  <p className="text-white/50 text-sm mt-1 flex items-center justify-center gap-1.5">
                                              <Mail className="w-3.5 h-3.5" /> {profile?.email}
                                  </p>
                                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                                              <Badge label="Apex Entrepreneur" />
                                    {preSurvey && <Badge label="Pre-Survey Complete" color="green" />}
                                    {postSurvey && <Badge label="Post-Survey Complete" color="purple" />}
                                    {postSurvey && <Badge label="Certificate Earned" color="yellow" />}
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
                                  <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                                              <BarChart2 className="w-5 h-5 text-cyan-400" /> Survey Progress
                                  </h2>
                                  <div className="space-y-3">
                                              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                                            <div className="flex items-center gap-3">
                                                                            <CheckCircle className={`w-5 h-5 ${preSurvey ? 'text-green-400' : 'text-white/20'}`} />
                                                                            <div>
                                                                                              <p className="text-white text-sm font-medium">Pre-Program Survey</p>
                                                                                              <p className="text-white/40 text-xs">Demographics, knowledge, confidence &amp; intentions</p>
                                                                            </div>
                                                            </div>
                                                {preSurvey ? (
                            <span className="text-green-400 text-xs font-medium">Done</span>
                          ) : (
                            <Link to="/onboarding" className="text-cyan-400 text-xs font-medium flex items-center gap-1">
                                              Start <ChevronRight className="w-3 h-3" />
                            </Link>
                                                            )}
                                              </div>
                                              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                                            <div className="flex items-center gap-3">
                                                                            <CheckCircle className={`w-5 h-5 ${postSurvey ? 'text-green-400' : 'text-white/20'}`} />
                                                                            <div>
                                                                                              <p className="text-white text-sm font-medium">Post-Program Survey</p>
                                                                                              <p className="text-white/40 text-xs">Reaction, learning gains, behavior &amp; outcomes</p>
                                                                            </div>
                                                            </div>
                                                {postSurvey ? (
                            <span className="text-green-400 text-xs font-medium">Done</span>
                          ) : (
                            <span className="text-white/30 text-xs">Unlocks at program end</span>
                                                            )}
                                              </div>
                                  </div>
                        </div>

                  {/* ── Certificate ── */}
                        <div className={`rounded-2xl p-6 border ${postSurvey ? 'bg-yellow-400/10 border-yellow-400/30' : 'bg-white/5 border-white/10'}`}>
                                  <h2 className="text-white font-semibold text-lg mb-2 flex items-center gap-2">
                                              <Award className={`w-5 h-5 ${postSurvey ? 'text-yellow-400' : 'text-white/30'}`} />
                                              Certificate of Completion
                                  </h2>
                          {postSurvey ? (
                        <div>
                                      <p className="text-white/70 text-sm mb-4">
                                                      Congratulations! Your certificate is ready. Download it or share it directly on LinkedIn.
                                      </p>
                                      <Link
                                                        to="/certificate"
                                                        className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-[#0a1628] font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
                                                      >
                                                      <Award className="w-4 h-4" /> View Certificate
                                      </Link>
                        </div>
                      ) : (
                        <p className="text-white/40 text-sm">
                                      Complete the post-program survey to unlock your Certificate of Completion from the
                                      Hillsborough County Entrepreneurship Center.
                        </p>
                                  )}
                        </div>

                  {/* ── Navigation ── */}
                        <div className="flex gap-3">
                                  <Link
                                                to="/members"
                                                className="flex-1 text-center border border-white/20 text-white/60 py-3 rounded-xl text-sm hover:border-white/40 transition-colors"
                                              >
                                              ← Program Dashboard
                                  </Link>
                          {!postSurvey && (
                        <Link
                                        to="/post-survey"
                                        className="flex-1 text-center bg-cyan-500 hover:bg-cyan-400 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
                                      >
                                      Take Post-Survey →
                        </Link>
                                  )}
                        </div>

                </div>
          </div>
        );
}
