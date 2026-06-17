import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, BookOpen, BarChart2, Award, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function MagicLinkLanding() {
    const { user, loading, hasProfile, hasSurvey } = useAuth();
    const navigate = useNavigate();

  useEffect(() => {
        if (!loading && user) {
                // Small delay so user can read the welcome screen
          const timer = setTimeout(() => {
                    if (!hasProfile || !hasSurvey) {
                                navigate('/onboarding');
                    } else {
                                navigate('/members');
                    }
          }, 6000);
                return () => clearTimeout(timer);
        }
  }, [loading, user, hasProfile, hasSurvey, navigate]);

  return (
        <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4 py-12">
              <div className="w-full max-w-2xl">
              
                {/* Header */}
                      <div className="text-center mb-10">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-400/20 mb-4">
                                            <CheckCircle className="w-8 h-8 text-cyan-400" />
                                </div>div>
                                <h1 className="text-4xl font-bold text-white mb-3">
                                            Welcome to <span className="text-cyan-400">Apex Entrepreneur</span>span>
                                </h1>h1>
                                <p className="text-white/70 text-lg">
                                            Hillsborough County Entrepreneurship Center
                                </p>p>
                                <p className="text-white/50 text-sm mt-2">
                                            You&apos;ve been verified. You&apos;ll be redirected automatically in a few seconds.
                                </p>p>
                      </div>div>
              
                {/* Program Overview */}
                      <div className="bg-white/5 rounded-2xl p-8 mb-6 border border-white/10">
                                <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                                            <BookOpen className="w-5 h-5 text-cyan-400" /> About the Program
                                </h2>h2>
                                <p className="text-white/75 leading-relaxed mb-4">
                                            Apex Entrepreneur is a five-phase, practice-on-demand experiential learning program
                                            designed to transform adult learners into high-performance founders and leaders.
                                            Grounded in power skills — emotionally intelligent leadership, strategic communication,
                                            and empathy — you will work through real-world simulations, AI-powered coaching, and
                                            peer collaboration.
                                </p>p>
                                <p className="text-white/75 leading-relaxed">
                                            The program is hosted at the Hillsborough County Entrepreneurship Center and combines
                                            live experiential sessions with an online app, supplemental videos, and conversational
                                            AI simulations so you can learn at your own pace.
                                </p>p>
                      </div>div>
              
                {/* Survey Overview */}
                      <div className="bg-white/5 rounded-2xl p-8 mb-6 border border-white/10">
                                <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                                            <BarChart2 className="w-5 h-5 text-cyan-400" /> Your Surveys
                                </h2>h2>
                                <div className="space-y-4">
                                            <div className="flex gap-3">
                                                          <div className="mt-1 w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                                                          <div>
                                                                          <p className="text-white font-medium">Pre-Program Survey</p>p>
                                                                          <p className="text-white/60 text-sm">
                                                                                            Completed during onboarding (right after this page). Captures your background,
                                                                                            prior business knowledge, entrepreneurial confidence, and goals. Takes about
                                                                                            5–8 minutes.
                                                                          </p>p>
                                                          </div>div>
                                            </div>div>
                                            <div className="flex gap-3">
                                                          <div className="mt-1 w-2 h-2 rounded-full bg-white/30 shrink-0" />
                                                          <div>
                                                                          <p className="text-white font-medium">Post-Program Survey</p>p>
                                                                          <p className="text-white/60 text-sm">
                                                                                            Completed at the end of the program. Measures your growth in knowledge, skills,
                                                                                            and entrepreneurial confidence — and unlocks your Certificate of Completion.
                                                                                            Takes about 8–10 minutes.
                                                                          </p>p>
                                                          </div>div>
                                            </div>div>
                                </div>div>
                      </div>div>
              
                {/* Certificate Preview */}
                      <div className="bg-white/5 rounded-2xl p-8 mb-8 border border-white/10">
                                <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                                            <Award className="w-5 h-5 text-cyan-400" /> Certificate of Completion
                                </h2>h2>
                                <p className="text-white/75 leading-relaxed mb-3">
                                            After completing the post-program survey, you will receive a verified digital
                                            Certificate of Completion from the Hillsborough County Entrepreneurship Center.
                                            Your certificate includes:
                                </p>p>
                                <ul className="space-y-2 text-white/65 text-sm">
                                            <li className="flex items-start gap-2">
                                                          <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                                                          Your full name and program cohort
                                            </li>li>
                                            <li className="flex items-start gap-2">
                                                          <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                                                          Verification of all five program phases completed
                                            </li>li>
                                            <li className="flex items-start gap-2">
                                                          <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                                                          A unique certificate ID for sharing on LinkedIn or with employers
                                            </li>li>
                                            <li className="flex items-start gap-2">
                                                          <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                                                          Official seal from the Hillsborough County Entrepreneurship Center
                                            </li>li>
                                </ul>ul>
                      </div>div>
              
                {/* CTA */}
                      <div className="text-center">
                                <button
                                              onClick={() => navigate('/onboarding')}
                                              className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
                                            >
                                            Start Onboarding Now <ArrowRight className="w-5 h-5" />
                                </button>button>
                                <p className="text-white/40 text-xs mt-3">
                                            You will be redirected automatically in a few seconds
                                </p>p>
                      </div>div>
              
              </div>div>
        </div>div>
      );
}</div>
