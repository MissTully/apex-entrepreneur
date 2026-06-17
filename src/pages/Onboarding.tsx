import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const SURVEY_QUESTIONS = [
  { id: 'stage', label: 'What stage is your venture?', options: ['Idea', 'MVP', 'Early Revenue', 'Scaling', 'Not started yet'] },
  { id: 'goal', label: 'What is your primary goal for joining Apex?', options: ['Build leadership skills', 'Find co-founders', 'Get funding', 'Validate my idea', 'Network with peers'] },
  { id: 'challenge', label: 'What is your biggest challenge right now?', options: ['Communication', 'Team building', 'Product development', 'Sales & marketing', 'Self-belief / resilience'] },
  { id: 'commitment', label: 'How many hours per week can you commit?', options: ['1-2 hours', '3-5 hours', '5-10 hours', '10+ hours'] },
  ];

export default function Onboarding() {
    const { user, hasProfile, hasSurvey } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState<'profile' | 'survey'>(hasProfile ? 'survey' : 'profile');
    const [fullName, setFullName] = useState('');
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

  async function saveProfile(e: React.FormEvent) {
        e.preventDefault();
        if (!user || !fullName.trim()) return;
        setSaving(true); setError('');
        const { error } = await supabase
          .from('profiles')
          .update({ full_name: fullName.trim() })
          .eq('id', user.id);
        setSaving(false);
        if (error) { setError(error.message); return; }
        setStep('survey');
  }

  async function saveSurvey(e: React.FormEvent) {
        e.preventDefault();
        if (!user || Object.keys(answers).length < SURVEY_QUESTIONS.length) return;
        setSaving(true); setError('');
        const { error } = await supabase.from('survey_responses').insert({
                user_id: user.id,
                survey_type: 'onboarding',
                answers,
        });
        setSaving(false);
        if (error) { setError(error.message); return; }
        navigate('/members');
  }

  return (
        <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4">
              <div className="w-full max-w-lg">
                      <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-white mb-2">Welcome to the Reef</h1>h1>
                                <p className="text-cyan-400">{step === 'profile' ? 'Step 1 of 2 — Set up your profile' : 'Step 2 of 2 — Quick survey'}</p>p>
                                <div className="flex gap-2 justify-center mt-4">
                                            <div className={`h-1 w-24 rounded-full ${step === 'profile' ? 'bg-cyan-400' : 'bg-cyan-400'}`} />
                                            <div className={`h-1 w-24 rounded-full ${step === 'survey' ? 'bg-cyan-400' : 'bg-white/20'}`} />
                                </div>div>
                      </div>div>
              
                {step === 'profile' && (
                    <form onSubmit={saveProfile} className="bg-white/5 rounded-2xl p-8 space-y-6">
                                <div>
                                              <label className="block text-white font-medium mb-2">Your full name</label>label>
                                              <input
                                                                type="text"
                                                                value={fullName}
                                                                onChange={e => setFullName(e.target.value)}
                                                                placeholder="e.g. Alex Rivera"
                                                                required
                                                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
                                                              />
                                </div>div>
                      {error && <p className="text-red-400 text-sm">{error}</p>p>}
                                <button
                                                type="submit"
                                                disabled={saving || !fullName.trim()}
                                                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
                                              >
                                  {saving ? 'Saving...' : 'Continue to Survey'}
                                </button>button>
                    </form>form>
                      )}
              
                {step === 'survey' && (
                    <form onSubmit={saveSurvey} className="bg-white/5 rounded-2xl p-8 space-y-6">
                      {SURVEY_QUESTIONS.map(q => (
                                    <div key={q.id}>
                                                    <p className="text-white font-medium mb-3">{q.label}</p>p>
                                                    <div className="grid grid-cols-1 gap-2">
                                                      {q.options.map(opt => (
                                                          <button
                                                                                  key={opt}
                                                                                  type="button"
                                                                                  onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                                                                  className={`text-left px-4 py-2 rounded-lg border transition-colors text-sm ${
                                                                                                            answers[q.id] === opt
                                                                                                              ? 'border-cyan-400 bg-cyan-400/20 text-cyan-300'
                                                                                                              : 'border-white/20 text-white/70 hover:border-white/40'
                                                                                    }`}
                                                                                >
                                                            {opt}
                                                          </button>button>
                                                        ))}
                                                    </div>div>
                                    </div>div>
                                  ))}
                      {error && <p className="text-red-400 text-sm">{error}</p>p>}
                                <button
                                                type="submit"
                                                disabled={saving || Object.keys(answers).length < SURVEY_QUESTIONS.length}
                                                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
                                              >
                                  {saving ? 'Saving...' : 'Enter the Reef'}
                                </button>button>
                    </form>form>
                      )}
              </div>div>
        </div>div>
      );
}</div>
