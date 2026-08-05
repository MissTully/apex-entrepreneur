import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { saveSurveyResponse, PRE_SURVEY_TYPES } from '../lib/surveys';
import { useAuth } from '../hooks/useAuth';
import { ChevronRight, ChevronLeft } from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

const BASE_BTN = 'text-left px-4 py-2 rounded-lg border text-sm transition-colors';
const SELECTED = BASE_BTN + ' border-cyan-400 bg-cyan-400/20 text-cyan-300';
const UNSELECTED = BASE_BTN + ' border-white/20 text-white/70 hover:border-white/40';

function LikertRow({ label, value, onChange }: {
    label: string; name?: string; value: number; onChange: (n: number) => void;
}) {
    return (
          <div className="mb-4">
                <p className="text-white/80 text-sm mb-2">{label}</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                      <button
                                    key={n}
                                    type="button"
                                    onClick={() => onChange(n)}
                                    className={`w-10 h-10 rounded-lg border text-sm font-medium transition-colors ${
                                                    value === n
                                                      ? 'border-cyan-400 bg-cyan-400/25 text-cyan-300'
                                                      : 'border-white/20 text-white/50 hover:border-white/40'
                                    }`}
                                  >
                        {n}
                      </button>
                    ))}
                        <span className="text-white/30 text-xs self-end ml-1">
                                  1=Strongly Disagree · 5=Strongly Agree
                        </span>
                </div>
          </div>
        );
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Step = 'profile' | 'demographics' | 'knowledge' | 'ese' | 'intentions' | 'expectations';

const STEPS: Step[] = ['profile', 'demographics', 'knowledge', 'ese', 'intentions', 'expectations'];
const STEP_LABELS: Record<Step, string> = {
    profile:      'Profile',
    demographics: 'Background',
    knowledge:    'Knowledge',
    ese:          'Confidence',
    intentions:   'Intentions',
    expectations: 'Goals',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Onboarding() {
    const { user, loading, hasProfile, hasSurvey, refresh } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>(hasProfile ? 'demographics' : 'profile');

    // Already fully onboarded — go straight to the course instead of
    // re-presenting the survey.
    useEffect(() => {
          if (!loading && hasProfile && hasSurvey) navigate('/members', { replace: true });
    }, [loading, hasProfile, hasSurvey, navigate]);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Profile
    const [fullName, setFullName] = useState('');

    // Section 1 – Demographics
    const [ageGroup, setAgeGroup] = useState('');
    const [gender, setGender] = useState('');
    const [education, setEducation] = useState('');
    const [employment, setEmployment] = useState('');
    const [priorExp, setPriorExp] = useState('');
    const [priorExpDesc, setPriorExpDesc] = useState('');
    const [hearAbout, setHearAbout] = useState('');
    const [goals, setGoals] = useState<string[]>([]);

    // Section 2 – Knowledge (1-5)
    const [kBizPlan, setKBizPlan] = useState(0);
    const [kFinance, setKFinance] = useState(0);
    const [kMarketing, setKMarketing] = useState(0);
    const [kLegal, setKLegal] = useState(0);
    const [skillOpp, setSkillOpp] = useState(0);
    const [skillPitch, setSkillPitch] = useState(0);

    // Section 3 – ESE (1-5)
    const [eseOpp, setEseOpp] = useState(0);
    const [eseBizPlan, setEseBizPlan] = useState(0);
    const [eseFinRisk, setEseFinRisk] = useState(0);
    const [eseMarketing, setEseMarketing] = useState(0);
    const [eseTeam, setEseTeam] = useState(0);
    const [eseMarshall, setEseMarshall] = useState(0);

    // Section 4 – Intentions (1-5)
    const [intNearFuture, setIntNearFuture] = useState(0);
    const [intPursue, setIntPursue] = useState(0);
    const [intDesire, setIntDesire] = useState(0);
    const [intEffort, setIntEffort] = useState(0);

    // Section 5 – Expectations
    const [expectations, setExpectations] = useState('');

    const stepIndex = STEPS.indexOf(step);
    const progress = ((stepIndex + 1) / STEPS.length) * 100;

    function toggleGoal(g: string) {
          setGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
    }

    async function saveProfile(e: React.FormEvent) {
          e.preventDefault();
          if (!user || !fullName.trim()) return;
          setSaving(true); setErrorMsg('');
          const { error } = await supabase.from('profiles').update({ full_name: fullName.trim() }).eq('id', user.id);
          setSaving(false);
          if (error) { setErrorMsg(error.message); return; }
          setStep('demographics');
    }

    async function submitSurvey(e: React.FormEvent) {
          e.preventDefault();
          if (!user) return;
          setSaving(true); setErrorMsg('');
          const answers = {
                  // Demographics
                  ageGroup, gender, education, employment, priorExp, priorExpDesc, hearAbout, goals,
                  // Knowledge
                  kBizPlan, kFinance, kMarketing, kLegal, skillOpp, skillPitch,
                  // ESE
                  eseOpp, eseBizPlan, eseFinRisk, eseMarketing, eseTeam, eseMarshall,
                  // Intentions
                  intNearFuture, intPursue, intDesire, intEffort,
                  // Expectations
                  expectations,
          };
          const { error } = await saveSurveyResponse(user.id, PRE_SURVEY_TYPES, answers);
          if (error) { setSaving(false); setErrorMsg(error.message); return; }
          // Update the shared auth state before navigating so ProtectedRoute
          // and the Navbar see the completed survey and let the course open.
          await refresh();
          setSaving(false);
          navigate('/members');
    }

    function next() {
          const idx = STEPS.indexOf(step);
          if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
    }
    function back() {
          const idx = STEPS.indexOf(step);
          if (idx > 0) setStep(STEPS[idx - 1]);
    }

    // ── Render ───────────────────────────────────────────────────────────────────

    return (
          <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-xl">

                  {/* Header */}
                        <div className="text-center mb-8">
                                  <h1 className="text-3xl font-bold text-white mb-1">Welcome to the Reef</h1>
                                  <p className="text-cyan-400 text-sm">{STEP_LABELS[step]}</p>

                          {/* Progress bar */}
                                  <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                              <div
                                                              className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                                                              style={{ width: `${progress}%` }}
                                                            />
                                  </div>
                                  <div className="flex justify-between mt-1">
                                    {STEPS.map((s, i) => (
                          <span
                                            key={s}
                                            className={`text-[10px] ${i <= stepIndex ? 'text-cyan-400' : 'text-white/30'}`}
                                          >
                            {STEP_LABELS[s]}
                          </span>
                        ))}
                                  </div>
                        </div>

                  {/* ── Step: Profile ── */}
                  {step === 'profile' && (
                      <form onSubmit={saveProfile} className="bg-white/5 rounded-2xl p-8 space-y-6">
                                  <div>
                                                <label className="block text-white font-medium mb-2">Your full name</label>
                                                <input
                                                                  type="text"
                                                                  value={fullName}
                                                                  onChange={e => setFullName(e.target.value)}
                                                                  placeholder="e.g. Alex Rivera"
                                                                  required
                                                                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
                                                                />
                                  </div>
                        {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}
                                  <button
                                                  type="submit"
                                                  disabled={saving || !fullName.trim()}
                                                  className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                                                >
                                    {saving ? 'Saving…' : 'Continue'} <ChevronRight className="w-4 h-4" />
                                  </button>
                      </form>
                        )}

                  {/* ── Step: Demographics ── */}
                  {step === 'demographics' && (
                      <div className="bg-white/5 rounded-2xl p-8 space-y-5">
                                  <h2 className="text-white font-semibold text-lg mb-1">Section 1 — Background</h2>

                                  <div>
                                                <label className="block text-white/70 text-sm mb-2">Age group</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                  {['Under 18', '18–24', '25–34', '35–44', '45–54', '55+'].map(o => (
                                          <button key={o} type="button" onClick={() => setAgeGroup(o)} className={ageGroup === o ? SELECTED : UNSELECTED}>{o}</button>
                                        ))}
                                                </div>
                                  </div>

                                  <div>
                                                <label className="block text-white/70 text-sm mb-2">Gender <span className="text-white/30">(short answer)</span></label>
                                                <input
                                                                  value={gender}
                                                                  onChange={e => setGender(e.target.value)}
                                                                  placeholder="e.g. Woman, Man, Non-binary…"
                                                                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 text-sm"
                                                                />
                                  </div>

                                  <div>
                                                <label className="block text-white/70 text-sm mb-2">Highest education level</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                  {['High School / GED', 'Some College', 'Associate', "Bachelor's", "Master's", 'PhD / Professional'].map(o => (
                                          <button key={o} type="button" onClick={() => setEducation(o)} className={education === o ? SELECTED : UNSELECTED}>{o}</button>
                                        ))}
                                                </div>
                                  </div>

                                  <div>
                                                <label className="block text-white/70 text-sm mb-2">Current employment / business status</label>
                                                <input
                                                                  value={employment}
                                                                  onChange={e => setEmployment(e.target.value)}
                                                                  placeholder="e.g. Employed full-time, Self-employed, Student…"
                                                                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 text-sm"
                                                                />
                                  </div>

                                  <div>
                                                <label className="block text-white/70 text-sm mb-2">Have you started or run a business before?</label>
                                                <div className="flex gap-2">
                                                  {['Yes', 'No'].map(o => (
                                          <button key={o} type="button" onClick={() => setPriorExp(o)} className={priorExp === o ? SELECTED : UNSELECTED}>{o}</button>
                                        ))}
                                                </div>
                                  </div>

                        {priorExp === 'Yes' && (
                                      <div>
                                                      <label className="block text-white/70 text-sm mb-2">Briefly describe your prior business experience</label>
                                                      <textarea
                                                                          value={priorExpDesc}
                                                                          onChange={e => setPriorExpDesc(e.target.value)}
                                                                          rows={3}
                                                                          placeholder="Tell us about it…"
                                                                          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 text-sm resize-none"
                                                                        />
                                      </div>
                                  )}

                                  <div>
                                                <label className="block text-white/70 text-sm mb-2">How did you hear about the program?</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                  {['Social Media', 'Friend / Colleague', 'Email / Newsletter', 'Event / Flyer', 'Search Engine', 'Other'].map(o => (
                                          <button key={o} type="button" onClick={() => setHearAbout(o)} className={hearAbout === o ? SELECTED : UNSELECTED}>{o}</button>
                                        ))}
                                                </div>
                                  </div>

                                  <div>
                                                <label className="block text-white/70 text-sm mb-2">Primary goals for participating <span className="text-white/30">(select all that apply)</span></label>
                                                <div className="grid grid-cols-2 gap-2">
                                                  {['Start a business', 'Improve skills', 'Networking', 'Get funding', 'Validate an idea', 'Career change', 'Other'].map(o => (
                                          <button key={o} type="button" onClick={() => toggleGoal(o)} className={goals.includes(o) ? SELECTED : UNSELECTED}>{o}</button>
                                        ))}
                                                </div>
                                  </div>

                                  <div className="flex gap-3 pt-2">
                                                <button type="button" onClick={back} className="flex-1 border border-white/20 text-white/60 py-3 rounded-lg transition-colors hover:border-white/40 flex items-center justify-center gap-1">
                                                                <ChevronLeft className="w-4 h-4" /> Back
                                                </button>
                                                <button type="button" onClick={next} disabled={!ageGroup || !education} className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-1">
                                                                Continue <ChevronRight className="w-4 h-4" />
                                                </button>
                                  </div>
                      </div>
                        )}

                  {/* ── Step: Knowledge ── */}
                  {step === 'knowledge' && (
                      <div className="bg-white/5 rounded-2xl p-8 space-y-4">
                                  <h2 className="text-white font-semibold text-lg mb-1">Section 2 — Prior Knowledge &amp; Skills</h2>
                                  <p className="text-white/50 text-xs mb-4">Rate 1 (Strongly Disagree) → 5 (Strongly Agree)</p>

                                  <LikertRow label="I have strong knowledge of business planning." name="kBizPlan" value={kBizPlan} onChange={setKBizPlan} />
                                  <LikertRow label="I have strong knowledge of financial management." name="kFinance" value={kFinance} onChange={setKFinance} />
                                  <LikertRow label="I have strong knowledge of marketing." name="kMarketing" value={kMarketing} onChange={setKMarketing} />
                                  <LikertRow label="I have strong knowledge of the legal aspects of running a business." name="kLegal" value={kLegal} onChange={setKLegal} />

                                  <p className="text-white/50 text-xs pt-2">Rate your current skill level (1–5)</p>
                                  <LikertRow label="Identifying new business opportunities." name="skillOpp" value={skillOpp} onChange={setSkillOpp} />
                                  <LikertRow label="Pitching and presenting ideas." name="skillPitch" value={skillPitch} onChange={setSkillPitch} />

                                  <div className="flex gap-3 pt-2">
                                                <button type="button" onClick={back} className="flex-1 border border-white/20 text-white/60 py-3 rounded-lg transition-colors hover:border-white/40 flex items-center justify-center gap-1">
                                                                <ChevronLeft className="w-4 h-4" /> Back
                                                </button>
                                                <button type="button" onClick={next} disabled={!kBizPlan || !kFinance || !kMarketing || !kLegal || !skillOpp || !skillPitch} className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-1">
                                                                Continue <ChevronRight className="w-4 h-4" />
                                                </button>
                                  </div>
                      </div>
                        )}

                  {/* ── Step: ESE ── */}
                  {step === 'ese' && (
                      <div className="bg-white/5 rounded-2xl p-8 space-y-4">
                                  <h2 className="text-white font-semibold text-lg mb-1">Section 3 — Entrepreneurial Confidence</h2>
                                  <p className="text-white/50 text-xs mb-4">Rate your confidence 1 (Strongly Disagree) → 5 (Strongly Agree)</p>

                                  <LikertRow label="I am confident in my ability to identify new business opportunities." name="eseOpp" value={eseOpp} onChange={setEseOpp} />
                                  <LikertRow label="I can effectively develop a business plan." name="eseBizPlan" value={eseBizPlan} onChange={setEseBizPlan} />
                                  <LikertRow label="I feel prepared to handle financial risks and management." name="eseFinRisk" value={eseFinRisk} onChange={setEseFinRisk} />
                                  <LikertRow label="I can successfully market and sell a product or service." name="eseMarketing" value={eseMarketing} onChange={setEseMarketing} />
                                  <LikertRow label="I can build and lead a team or network effectively." name="eseTeam" value={eseTeam} onChange={setEseTeam} />
                                  <LikertRow label="I am capable of turning ideas into actionable steps and marshalling resources." name="eseMarshall" value={eseMarshall} onChange={setEseMarshall} />

                                  <div className="flex gap-3 pt-2">
                                                <button type="button" onClick={back} className="flex-1 border border-white/20 text-white/60 py-3 rounded-lg hover:border-white/40 flex items-center justify-center gap-1">
                                                                <ChevronLeft className="w-4 h-4" /> Back
                                                </button>
                                                <button type="button" onClick={next} disabled={!eseOpp || !eseBizPlan || !eseFinRisk || !eseMarketing || !eseTeam || !eseMarshall} className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-1">
                                                                Continue <ChevronRight className="w-4 h-4" />
                                                </button>
                                  </div>
                      </div>
                        )}

                  {/* ── Step: Intentions ── */}
                  {step === 'intentions' && (
                      <div className="bg-white/5 rounded-2xl p-8 space-y-4">
                                  <h2 className="text-white font-semibold text-lg mb-1">Section 4 — Entrepreneurial Intentions</h2>
                                  <p className="text-white/50 text-xs mb-4">Rate 1 (Strongly Disagree) → 5 (Strongly Agree)</p>

                                  <LikertRow label="I am interested in starting my own business in the near future." name="intNearFuture" value={intNearFuture} onChange={setIntNearFuture} />
                                  <LikertRow label="I intend to pursue entrepreneurial opportunities after this program." name="intPursue" value={intPursue} onChange={setIntPursue} />
                                  <LikertRow label="I have a strong desire to be an entrepreneur." name="intDesire" value={intDesire} onChange={setIntDesire} />
                                  <LikertRow label="I will make every effort to start and run my own business." name="intEffort" value={intEffort} onChange={setIntEffort} />

                                  <div className="flex gap-3 pt-2">
                                                <button type="button" onClick={back} className="flex-1 border border-white/20 text-white/60 py-3 rounded-lg hover:border-white/40 flex items-center justify-center gap-1">
                                                                <ChevronLeft className="w-4 h-4" /> Back
                                                </button>
                                                <button type="button" onClick={next} disabled={!intNearFuture || !intPursue || !intDesire || !intEffort} className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-1">
                                                                Continue <ChevronRight className="w-4 h-4" />
                                                </button>
                                  </div>
                      </div>
                        )}

                  {/* ── Step: Expectations ── */}
                  {step === 'expectations' && (
                      <form onSubmit={submitSurvey} className="bg-white/5 rounded-2xl p-8 space-y-5">
                                  <h2 className="text-white font-semibold text-lg mb-1">Section 5 — Goals &amp; Expectations</h2>
                                  <div>
                                                <label className="block text-white/70 text-sm mb-2">
                                                                What are your biggest challenges or expectations entering this program?
                                                </label>
                                                <textarea
                                                                  value={expectations}
                                                                  onChange={e => setExpectations(e.target.value)}
                                                                  rows={6}
                                                                  placeholder="Share your thoughts, goals, concerns, or anything you'd like us to know…"
                                                                  required
                                                                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 text-sm resize-none"
                                                                />
                                  </div>
                        {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}
                                  <div className="flex gap-3">
                                                <button type="button" onClick={back} className="flex-1 border border-white/20 text-white/60 py-3 rounded-lg hover:border-white/40 flex items-center justify-center gap-1">
                                                                <ChevronLeft className="w-4 h-4" /> Back
                                                </button>
                                                <button
                                                                  type="submit"
                                                                  disabled={saving || !expectations.trim()}
                                                                  className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                                                                >
                                                  {saving ? 'Saving…' : 'Enter the Reef ✦'}
                                                </button>
                                  </div>
                      </form>
                        )}

                </div>
          </div>
        );
}
