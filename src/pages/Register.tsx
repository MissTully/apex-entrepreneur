import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle, BookOpen, BarChart2, Award, Mail, Lock } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

export default function Register() {
  const { user, loading, hasProfile, hasSurvey } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  // Redirect already-authenticated users
  useEffect(() => {
    if (!loading && user) {
      if (!hasProfile || !hasSurvey) {
        navigate("/onboarding", { replace: true });
      } else {
        navigate("/members", { replace: true });
      }
    }
  }, [loading, user, hasProfile, hasSurvey, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    if (password.length < 8) {
      setError("Please choose a password of at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    setSubmitting(true);
    setError("");
    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: `${window.location.origin}/welcome` },
    });
    setSubmitting(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    // If email confirmation is required, there's no session yet — tell them to
    // check their inbox. If confirmation is off, we already have a session and
    // the redirect effect above takes them into onboarding.
    if (!data.session) {
      setSent(true);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a1628]">
        <div className="text-cyan-400 text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628] px-4 py-12">
      <div className="mx-auto w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-400/20 mb-4">
            <Mail className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Join <span className="text-cyan-400">Apex Entrepreneur</span>
          </h1>
          <p className="text-white/70 text-lg">Hillsborough County Entrepreneurship Center</p>
          <p className="text-white/50 text-sm mt-2">
            Create your account to access the program. You&apos;ll complete a short survey before entering.
          </p>
        </div>

        {/* Registration form */}
        <div className="bg-white/5 rounded-2xl p-8 mb-6 border border-white/10">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Confirm your email</h2>
              <p className="text-white/70">
                We sent a confirmation link to <strong className="text-white">{email}</strong>.
                Click it to verify your email, then you can log in and continue to the program.
              </p>
              <p className="text-white/40 text-xs mt-4">Didn&apos;t get it? Check your spam folder or try again.</p>
              <button
                onClick={() => setSent(false)}
                className="mt-4 text-cyan-400 text-sm underline underline-offset-2 hover:text-cyan-300"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white mb-1 flex items-center gap-2">
                <Mail className="w-5 h-5 text-cyan-400" /> Create Your Account
              </h2>
              <p className="text-white/60 text-sm mb-6">
                Register with your email and a password. We&apos;ll send a confirmation link to verify your email.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-white/80 text-sm font-medium mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400/60"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-white/80 text-sm font-medium mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400/60"
                  />
                </div>
                <div>
                  <label htmlFor="confirm" className="block text-white/80 text-sm font-medium mb-2">
                    Confirm password
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    required
                    minLength={8}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400/60"
                  />
                </div>
                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={submitting || !email.trim() || !password || !confirm}
                  className="w-full inline-flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
                >
                  {submitting ? "Creating account…" : "Create Account"}
                  {!submitting && <ArrowRight className="w-5 h-5" />}
                </button>
              </form>
              <p className="text-white/50 text-sm mt-5 text-center flex items-center justify-center gap-1">
                <Lock className="w-4 h-4 text-cyan-400" />
                Already registered?{" "}
                <Link to="/login" className="text-cyan-400 underline underline-offset-2 hover:text-cyan-300">
                  Log in
                </Link>
              </p>
            </>
          )}
        </div>

        {/* Program Overview */}
        <div className="bg-white/5 rounded-2xl p-8 mb-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" /> About the Program
          </h2>
          <p className="text-white/75 leading-relaxed mb-4">
            Apex Entrepreneur is a five-phase, practice-on-demand experiential learning program
            designed to transform adult learners into high-performance founders and leaders.
            Grounded in power skills — emotionally intelligent leadership, strategic communication,
            and empathy — you will work through real-world simulations, AI-powered coaching, and
            peer collaboration.
          </p>
          <p className="text-white/75 leading-relaxed">
            The program is hosted at the Hillsborough County Entrepreneurship Center and combines
            live experiential sessions with an online app, supplemental videos, and conversational
            AI simulations so you can learn at your own pace.
          </p>
        </div>

        {/* Survey Overview */}
        <div className="bg-white/5 rounded-2xl p-8 mb-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-cyan-400" /> What to Expect After Registration
          </h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="mt-1 w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
              <div>
                <p className="text-white font-medium">Pre-Program Survey</p>
                <p className="text-white/60 text-sm">
                  Required before accessing the program. Captures your background,
                  prior business knowledge, entrepreneurial confidence, and goals. Takes about
                  5–8 minutes.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mt-1 w-2 h-2 rounded-full bg-white/30 shrink-0" />
              <div>
                <p className="text-white font-medium">Post-Program Survey</p>
                <p className="text-white/60 text-sm">
                  Completed at the end of the program. Measures your growth in knowledge, skills,
                  and entrepreneurial confidence — and unlocks your Certificate of Completion.
                  Takes about 8–10 minutes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Preview */}
        <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-400" /> Certificate of Completion
          </h2>
          <p className="text-white/75 leading-relaxed mb-3">
            After completing the post-program survey, you will receive a verified digital
            Certificate of Completion from the Hillsborough County Entrepreneurship Center.
            Your certificate includes:
          </p>
          <ul className="space-y-2 text-white/65 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
              Your full name and program cohort
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
              Verification of all five program phases completed
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
              A unique certificate ID for sharing on LinkedIn or with employers
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
              Official seal from the Hillsborough County Entrepreneurship Center
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}
