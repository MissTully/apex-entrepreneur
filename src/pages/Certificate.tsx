import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { POST_SURVEY_TYPES } from '../lib/surveys';
import { useAuth } from '../hooks/useAuth';
import { Award, CheckCircle, Share2, Download, ArrowLeft } from 'lucide-react';

interface CertData { name: string; email: string; completedAt: string; certId: string; }

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function Certificate() {
    const { user } = useAuth();
    const [cert, setCert] = useState<CertData | null>(null);
    const [loading, setLoading] = useState(true);
    const [locked, setLocked] = useState(false);

  useEffect(() => {
        if (!user) return;
        async function load() {
                const [{ data: profile }, { data: survey }] = await Promise.all([
                          supabase.from('profiles').select('full_name, created_at').eq('id', user!.id).single(),
                          supabase.from('survey_responses').select('created_at').eq('user_id', user!.id).in('survey_type', POST_SURVEY_TYPES).limit(1).single(),
                        ]);
                if (!survey) { setLocked(true); setLoading(false); return; }
                const shortId = user!.id.replace(/-/g, '').slice(0, 12).toUpperCase();
                setCert({ name: profile?.full_name ?? 'Graduate', email: user!.email ?? '', completedAt: survey.created_at, certId: `APEX-${shortId}` });
                setLoading(false);
        }
        load();
  }, [user]);

  if (loading) return <div className="min-h-screen bg-[#0a1628] flex items-center justify-center"><div className="text-cyan-400 animate-pulse">Loading certificate...</div></div>;

    if (locked) return (
          <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                        <Award className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-white mb-3">Certificate Locked</h1>
                        <p className="text-white/60 mb-6">Complete the post-program survey to unlock your Certificate of Completion from the Hillsborough County Entrepreneurship Center.</p>
                        <Link to="/post-survey" className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold px-6 py-3 rounded-xl">Take Post-Program Survey</Link>
                </div>
          </div>
        );

    return (
          <div className="min-h-screen bg-[#0a1628] px-4 py-12">
                <div className="max-w-2xl mx-auto">
                        <Link to="/profile" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-8 transition-colors">
                                  <ArrowLeft className="w-4 h-4" /> Back to Profile
                        </Link>
                        <div className="relative bg-gradient-to-br from-[#0d1e3a] via-[#0a1628] to-[#071020] rounded-3xl border-2 border-yellow-400/40 p-10 text-center overflow-hidden">
                                  <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-yellow-400/40 rounded-tl-xl" />
                                  <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-yellow-400/40 rounded-tr-xl" />
                                  <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-yellow-400/40 rounded-bl-xl" />
                                  <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-yellow-400/40 rounded-br-xl" />
                                  <p className="text-yellow-400/70 text-xs font-semibold tracking-widest uppercase mb-6">Hillsborough County Entrepreneurship Center</p>
                                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-400/15 border-2 border-yellow-400/50 mb-6">
                                              <Award className="w-10 h-10 text-yellow-400" />
                                  </div>
                                  <p className="text-white/60 text-sm mb-2 tracking-wide uppercase">Certificate of Completion</p>
                                  <p className="text-white/50 text-sm mb-6">This is to certify that</p>
                                  <h1 className="text-4xl font-bold text-white mb-2">{cert!.name}</h1>
                                  <p className="text-white/40 text-sm mb-8">{cert!.email}</p>
                                  <p className="text-white/70 text-base leading-relaxed max-w-md mx-auto mb-8">
                                              has successfully completed all five phases of the <span className="text-cyan-300 font-semibold">Apex Entrepreneur Program</span> including live experiential sessions, AI-powered simulations, and pre- and post-program assessments, demonstrating mastery of entrepreneurial leadership, communication, and venture development.
                                  </p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left max-w-sm mx-auto mb-8">
                                    {['Phase 1 - Orientation & Positioning','Phase 2 - Communication & Pitch','Phase 3 - Team Building & Leadership','Phase 4 - Financial Strategy','Phase 5 - Launch & Scale'].map(p => (
                          <div key={p} className="flex items-center gap-2 text-white/60 text-xs">
                                          <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />{p}
                          </div>
                        ))}
                                  </div>
                                  <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                              <div><p className="text-white/30 text-xs">Date of Completion</p><p className="text-white/70 text-sm font-medium">{formatDate(cert!.completedAt)}</p></div>
                                              <div><p className="text-white/30 text-xs">Certificate ID</p><p className="text-cyan-400 text-sm font-mono font-medium">{cert!.certId}</p></div>
                                              <div><p className="text-white/30 text-xs">Issued by</p><p className="text-white/70 text-sm font-medium">HCEC - Apex Program</p></div>
                                  </div>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-3 justify-center">
                                  <button onClick={() => window.print()} className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-[#0a1628] font-semibold px-6 py-3 rounded-xl">
                                              <Download className="w-4 h-4" /> Download / Print
                                  </button>
                                  <a href={`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=Apex+Entrepreneur+Program&organizationName=Hillsborough+County+Entrepreneurship+Center&certId=${cert!.certId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-[#0077b5] text-[#0077b5] font-semibold px-6 py-3 rounded-xl">
                                              <Share2 className="w-4 h-4" /> Add to LinkedIn
                                  </a>
                        </div>
                        <p className="text-center text-white/30 text-xs mt-4">
                                  Certificate ID <span className="text-cyan-400 font-mono">{cert!.certId}</span> can be verified by the Hillsborough County Entrepreneurship Center.
                        </p>
                </div>
          </div>
        );
}
