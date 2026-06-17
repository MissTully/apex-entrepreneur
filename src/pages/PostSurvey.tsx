import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { ChevronRight, ChevronLeft } from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────────────────

const BASE_BTN = 'text-left px-4 py-2 rounded-lg border text-sm transition-colors';
const SELECTED = BASE_BTN + ' border-cyan-400 bg-cyan-400/20 text-cyan-300';
const UNSELECTED = BASE_BTN + ' border-white/20 text-white/70 hover:border-white/40';

function LikertRow({ label, value, onChange }: {
    label: string; value: number; onChange: (n: number) => void;
}) {
    return (
          <div className="mb-4">
                <p className="text-white/80 text-sm mb-2">{label}</p>
                <div className="flex flex-wrap gap-2 items-center">
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
                        <span className="text-white/30 text-xs">1=Strongly Disagree · 5=Strongly Agree</span>
                </div>
          </div>
        );
}

// ── Types ──────────────────────────────────────────────────────────────────────

type Step = 'reaction' | 'learning' | 'behavior' | 'results' | 'final';

const STEPS: Step[] = ['reaction', 'learning', 'behavior', 'results', 'final'];
const STEP_LABELS: Record<Step, string> = {
    reaction: 'Reaction',
    learning: 'Learning',
    behavior: 'Behavior',
    results:  'Outcomes',
    final:    'Overall',
};

// ── Component ──────────────────────────────────────────────────────────────────

export default function PostSurvey() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>('reaction');
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Section 1 – Reaction (Level 1)
    const [rxSessions, setRxSessions] = useState(0);
    const [rxApp, setRxApp] = useState(0);
    const [rxContent, setRxContent] = useState(0);
    const [rxMentor, setRxMentor] = useState(0);
    const [rxOverall, setRxOverall] = useState(0);
    const [nps, setNps] = useState<number | null>(null);
    const [rxValuable, setRxValuable] = useState('');
    const [rxImprove, setRxImprove] = useState('');

    // Section 2 – Learning (Level 2)
    const [lrnBizPlan, setLrnBizPlan] = useState(0);
    const [lrnFinance, setLrnFinance] = useState(0);
    const [lrnMarketing, setLrnMarketing] = useState(0);
    const [lrnLegal, setLrnLegal] = useState(0);
    const [lrnConfidence, setLrnConfidence] = useState(0);
    const [lrnSimulation, setLrnSimulation] = useState(0);
    const [lrnEseOpp, setLrnEseOpp] = useState(0);
    const [lrnEseBizPlan, setLrnEseBizPlan] = useState(0);
    const [lrnEseFinRisk, setLrnEseFinRisk] = useState(0);
    const [lrnEseMarketing, setLrnEseMarketing] = useState(0);
    const [lrnEseTeam, setLrnEseTeam] = useState(0);

    // Section 3 – Behavior (Level 3)
    const [bhvApplied, setBhvApplied] = useState(0);
    const [bhvSteps, setBhvSteps] = useState(0);
    const [bhvChallenges, setBhvChallenges] = useState('');

    // Section 4 – Results (Level 4)
    const [resProgress, setResProgress] = useState(0);
    const [resValue, setResValue] = useState(0);
    const [resMilestones, setResMilestones] = useState<string[]>([]);
    const [resOutcomes, setResOutcomes] = useState('');

    // Section 5 – Final
    const [suggestions, setSuggestions] = useState('');
    const [barriers, setBarriers] = useState('');

    const stepIndex = STEPS.indexOf(step);
    const progress = ((stepIndex + 1) / STEPS.length) * 100;

    function toggleMilestone(m: string) {
          setResMilestones(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
    }

    function next() {
          const idx = STEPS.indexOf(step);
          if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
    }
    function back() {
          const idx = STEPS.indexOf(step);
          if (idx > 0) setStep(STEPS[idx - 1]);
    }

    async function submit(e: React.FormEvent) {
          e.preventDefault();
          if (!user) return;
          setSaving(true); setErrorMsg('');
          const answers = {
                  // Reaction
                  rxSessions, rxApp, rxContent, rxMentor, rxOverall, nps, rxValuable, rxImprove,
                  // Learning
                  lrnBizPlan, lrnFinance, lrnMarketing, lrnLegal, lrnConfidence, lrnSimulation,
                  lrnEseOpp, lrnEseBizPlan, lrnEseFinRisk, lrnEseMarketing, lrnEseTeam,
                  // Behavior
                  bhvApplied, bhvSteps, bhvChallenges,
                  // Results
                  resProgress, resValue, resMilestones, resOutcomes,
                  // Final
                  suggestions, barriers,
          };
          const { error } = await supabase.from('survey_responses').insert({
                  user_id: user.id,
                  survey_type: 'post',
                  answers,
          });
          setSaving(false);
          if (error) { setErrorMsg(error.message); return; }
          navigate('/certificate');
    }

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
          <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-xl">

                  {/* Header */}
                        <div className="text-center mb-8">
                                  <h1 className="text-3xl font-bold text-white mb-1">Post-Program Survey</h1>
                                  <p className="text-cyan-400 text-sm">{STEP_LABELS[step]}</p>
                                  <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                              <div className="h-full bg-cyan-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                                  </div>
                                  <div className="flex justify-between mt-1">
                                    {STEPS.map((s, i) => (
                          <span key={s} className={`text-[10px] ${i <= stepIndex ? 'text-cyan-400' : 'text-white/30'}`}>
                            {STEP_LABELS[s]}
                          </span>
                        ))}
                                  </div>
                        </div>

                  {/* ── Section 1: Reaction ── */}
                  {step === 'reaction' && (
                      <div className="bg-white/5 rounded-2xl p-8 space-y-4">
                                  <h2 className="text-white font-semibold text-lg mb-1">Section 1 — Program Reaction</h2>
                                  <p className="text-white/50 text-xs mb-4">Rate 1 (Strongly Disagree) → 5 (Strongly Agree)</p>

                                  <LikertRow label="The live experiential sessions were engaging and relevant to my goals." value={rxSessions} onChange={setRxSessions} />
                                  <LikertRow label="The online app, videos, and AI simulations were helpful and easy to use." value={rxApp} onChange={setRxApp} />
                                  <LikertRow label="The program content met my expectations." value={rxContent} onChange={setRxContent} />
                                  <LikertRow label="The facilitators/mentors were knowledgeable and supportive." value={rxMentor} onChange={setRxMentor} />
                                  <LikertRow label="Overall, I was satisfied with the program." value={rxOverall} onChange={setRxOverall} />

                                  <div>
                                                <p className="text-white/80 text-sm mb-2">How likely are you to recommend this program? (0–10)</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                  {Array.from({ length: 11 }, (_, i) => i).map(n => (
                                          <button
                                                                key={n}
                                                                type="button"
                                                                onClick={() => setNps(n)}
                                                                className={`w-9 h-9 rounded-lg border text-xs font-medium transition-colors ${
                                                                                        nps === n ? 'border-cyan-400 bg-cyan-400/25 text-cyan-300' : 'border-white/20 text-white/50 hover:border-white/40'
                                                                }`}
                                                              >
                                            {n}
                                          </button>
                                        ))}
                                                </div>
                                  </div>

                                  <div>
                                                <label className="block text-white/70 text-sm mb-2">What was most valuable about the program?</label>
                                                <textarea value={rxValuable} onChange={e => setRxValuable(e.target.value)} rows={3} placeholder="Share what stood out…" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 text-sm resize-none" />
                                  </div>
                                  <div>
                                                <label className="block text-white/70 text-sm mb-2">What could be improved?</label>
                                                <textarea value={rxImprove} onChange={e => setRxImprove(e.target.value)} rows={3} placeholder="Suggestions for improvement…" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 text-sm resize-none" />
                                  </div>

                                  <button type="button" onClick={next} disabled={!rxSessions || !rxApp || !rxContent || !rxMentor || !rxOverall || nps === null} className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-1">
                                                Continue <ChevronRight className="w-4 h-4" />
                                  </button>
                      </div>
                        )}

                  {/* ── Section 2: Learning ── */}
                  {step === 'learning' && (
                      <div className="bg-white/5 rounded-2xl p-8 space-y-4">
                                  <h2 className="text-white font-semibold text-lg mb-1">Section 2 — Knowledge &amp; Skill Gains</h2>
                                  <p className="text-white/50 text-xs mb-2">Compare your skill level now (1=no change, 5=major improvement)</p>

                                  <LikertRow label="I gained practical skills in business planning." value={lrnBizPlan} onChange={setLrnBizPlan} />
                                  <LikertRow label="I gained practical skills in financial management." value={lrnFinance} onChange={setLrnFinance} />
                                  <LikertRow label="I gained practical skills in marketing and selling." value={lrnMarketing} onChange={setLrnMarketing} />
                                  <LikertRow label="I gained practical skills in the legal aspects of business." value={lrnLegal} onChange={setLrnLegal} />
                                  <LikertRow label="My overall confidence in starting or growing a business has increased." value={lrnConfidence} onChange={setLrnConfidence} />
                                  <LikertRow label="The AI simulations helped me practice real-world scenarios effectively." value={lrnSimulation} onChange={setLrnSimulation} />

                                  <p className="text-white/50 text-xs pt-2">Rate your confidence now (post-program)</p>
                                  <LikertRow label="I am confident in my ability to identify new business opportunities." value={lrnEseOpp} onChange={setLrnEseOpp} />
                                  <LikertRow label="I can effectively develop a business plan." value={lrnEseBizPlan} onChange={setLrnEseBizPlan} />
                                  <LikertRow label="I feel prepared to handle financial risks and management." value={lrnEseFinRisk} onChange={setLrnEseFinRisk} />
                                  <LikertRow label="I can successfully market and sell a product or service." value={lrnEseMarketing} onChange={setLrnEseMarketing} />
                                  <LikertRow label="I can build and lead a team or network effectively." value={lrnEseTeam} onChange={setLrnEseTeam} />

                                  <div className="flex gap-3 pt-2">
                                                <button type="button" onClick={back} className="flex-1 border border-white/20 text-white/60 py-3 rounded-lg hover:border-white/40 flex items-center justify-center gap-1"><ChevronLeft className="w-4 h-4" /> Back</button>
                                                <button type="button" onClick={next} disabled={!lrnBizPlan || !lrnFinance || !lrnMarketing || !lrnLegal || !lrnConfidence || !lrnSimulation || !lrnEseOpp || !lrnEseBizPlan || !lrnEseFinRisk || !lrnEseMarketing || !lrnEseTeam} className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-1">Continue <ChevronRight className="w-4 h-4" /></button>
                                  </div>
                      </div>
                        )}

                  {/* ── Section 3: Behavior ── */}
                  {step === 'behavior' && (
                      <div className="bg-white/5 rounded-2xl p-8 space-y-4">
                                  <h2 className="text-white font-semibold text-lg mb-1">Section 3 — Behavior &amp; Application</h2>
                                  <p className="text-white/50 text-xs mb-4">Rate 1 (Strongly Disagree) → 5 (Strongly Agree)</p>

                                  <LikertRow label="I have applied concepts from the program (e.g. business planning, networking) since completing it." value={bhvApplied} onChange={setBhvApplied} />
                                  <LikertRow label="I am taking concrete steps toward launching or improving a venture (e.g. customer validation, prototyping)." value={bhvSteps} onChange={setBhvSteps} />

                                  <div>
                                                <label className="block text-white/70 text-sm mb-2">Describe a specific challenge the program helped you overcome:</label>
                                                <textarea value={bhvChallenges} onChange={e => setBhvChallenges(e.target.value)} rows={4} placeholder="Optional — share your story…" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 text-sm resize-none" />
                                  </div>

                                  <div className="flex gap-3 pt-2">
                                                <button type="button" onClick={back} className="flex-1 border border-white/20 text-white/60 py-3 rounded-lg hover:border-white/40 flex items-center justify-center gap-1"><ChevronLeft className="w-4 h-4" /> Back</button>
                                                <button type="button" onClick={next} disabled={!bhvApplied || !bhvSteps} className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-1">Continue <ChevronRight className="w-4 h-4" /></button>
                                  </div>
                      </div>
                        )}

                  {/* ── Section 4: Results ── */}
                  {step === 'results' && (
                      <div className="bg-white/5 rounded-2xl p-8 space-y-4">
                                  <h2 className="text-white font-semibold text-lg mb-1">Section 4 — Results &amp; Outcomes</h2>
                                  <p className="text-white/50 text-xs mb-4">Rate 1 (Strongly Disagree) → 5 (Strongly Agree)</p>

                                  <LikertRow label="I have made progress toward my entrepreneurial goals because of this program." value={resProgress} onChange={setResProgress} />
                                  <LikertRow label="The program delivered value for my time and effort." value={resValue} onChange={setResValue} />

                                  <div>
                                                <p className="text-white/80 text-sm mb-2">Since completing the program, I have: <span className="text-white/30">(select all that apply)</span></p>
                                                <div className="grid grid-cols-2 gap-2">
                                                  {['Launched a business', 'Secured funding', 'Found a co-founder', 'Got first customer', 'Joined an accelerator', 'Applied for grants', 'Built a team', 'None yet'].map(m => (
                                          <button key={m} type="button" onClick={() => toggleMilestone(m)} className={resMilestones.includes(m) ? SELECTED : UNSELECTED}>{m}</button>
                                        ))}
                                                </div>
                                  </div>

                                  <div>
                                                <label className="block text-white/70 text-sm mb-2">Describe any business or personal outcomes so far:</label>
                                                <textarea value={resOutcomes} onChange={e => setResOutcomes(e.target.value)} rows={4} placeholder="Tell us about your progress…" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 text-sm resize-none" />
                                  </div>

                                  <div className="flex gap-3 pt-2">
                                                <button type="button" onClick={back} className="flex-1 border border-white/20 text-white/60 py-3 rounded-lg hover:border-white/40 flex items-center justify-center gap-1"><ChevronLeft className="w-4 h-4" /> Back</button>
                                                <button type="button" onClick={next} disabled={!resProgress || !resValue} className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-1">Continue <ChevronRight className="w-4 h-4" /></button>
                                  </div>
                      </div>
                        )}

                  {/* ── Section 5: Final ── */}
                  {step === 'final' && (
                      <form onSubmit={submit} className="bg-white/5 rounded-2xl p-8 space-y-5">
                                  <h2 className="text-white font-semibold text-lg mb-1">Section 5 — Final Feedback</h2>
                                  <div>
                                                <label className="block text-white/70 text-sm mb-2">What barriers did you encounter during the program?</label>
                                                <textarea value={barriers} onChange={e => setBarriers(e.target.value)} rows={3} placeholder="Time, access, support…" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 text-sm resize-none" />
                                  </div>
                                  <div>
                                                <label className="block text-white/70 text-sm mb-2">Any final suggestions for the program?</label>
                                                <textarea value={suggestions} onChange={e => setSuggestions(e.target.value)} rows={3} placeholder="Ideas for improvement…" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 text-sm resize-none" />
                                  </div>
                        {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}
                                  <p className="text-white/50 text-xs text-center">After submitting, your Certificate of Completion will be generated automatically.</p>
                                  <div className="flex gap-3">
                                                <button type="button" onClick={back} className="flex-1 border border-white/20 text-white/60 py-3 rounded-lg hover:border-white/40 flex items-center justify-center gap-1"><ChevronLeft className="w-4 h-4" /> Back</button>
                                                <button type="submit" disabled={saving} className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2">
                                                  {saving ? 'Submitting…' : 'Submit & Get Certificate ✦'}
                                                </button>
                                  </div>
                      </form>
                        )}

                </div>
          </div>
        );
}
