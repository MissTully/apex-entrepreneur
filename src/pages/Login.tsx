import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle, Lock, Mail, Waves } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { user, loading, hasProfile, hasSurvey } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [magicSent, setMagicSent] = useState(false);

  // Once authenticated, route to onboarding or the program.
  useEffect(() => {
    if (!loading && user) {
      if (!hasProfile || !hasSurvey) {
        navigate("/onboarding", { replace: true });
      } else {
        navigate("/members", { replace: true });
      }
    }
  }, [loading, user, hasProfile, hasSurvey, navigate]);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setSubmitting(true);
    setError("");
    setNotice("");
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSubmitting(false);
    if (authError) {
      // Friendlier message for the most common cases.
      if (/email not confirmed/i.test(authError.message)) {
        setError("Please confirm your email first — check your inbox for the confirmation link.");
      } else if (/invalid login credentials/i.test(authError.message)) {
        setError("That email or password isn't right. If you registered with a magic link, use the link option below to sign in or set a password.");
      } else {
        setError(authError.message);
      }
    }
    // On success the auth listener fires and the effect above redirects.
  }

  async function handleMagicLink() {
    if (!email.trim()) {
      setError("Enter your email above first, then choose the magic-link option.");
      return;
    }
    setSubmitting(true);
    setError("");
    setNotice("");
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/welcome` },
    });
    setSubmitting(false);
    if (authError) {
      setError(authError.message);
    } else {
      setMagicSent(true);
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setError("Enter your email above first, then choose 'Forgot password'.");
      return;
    }
    setSubmitting(true);
    setError("");
    setNotice("");
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);
    if (authError) {
      setError(authError.message);
    } else {
      setNotice(`If an account exists for ${email.trim()}, we've sent a link to reset your password.`);
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
      <div className="mx-auto w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-400/20 mb-4">
            <Waves className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-white/60 text-sm">Log in to continue the program.</p>
        </div>

        <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
          {magicSent ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Check your email</h2>
              <p className="text-white/70">
                We sent a sign-in link to <strong className="text-white">{email}</strong>.
                Click it to log in.
              </p>
              <button
                onClick={() => setMagicSent(false)}
                className="mt-4 text-cyan-400 text-sm underline underline-offset-2 hover:text-cyan-300"
              >
                Back to login
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handlePasswordLogin} className="space-y-4">
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
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="block text-white/80 text-sm font-medium">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={submitting}
                      className="text-cyan-400 text-xs underline underline-offset-2 hover:text-cyan-300 disabled:opacity-50"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400/60"
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                {notice && <p className="text-cyan-300 text-sm">{notice}</p>}
                <button
                  type="submit"
                  disabled={submitting || !email.trim() || !password}
                  className="w-full inline-flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl transition-colors"
                >
                  {submitting ? "Logging in…" : "Log In"}
                  {!submitting && <ArrowRight className="w-5 h-5" />}
                </button>
              </form>

              {/* Magic-link fallback */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleMagicLink}
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 disabled:opacity-50 text-white/90 font-medium px-8 py-3 rounded-xl transition-colors"
                >
                  <Mail className="w-4 h-4 text-cyan-400" /> Email me a magic link instead
                </button>
                <p className="text-white/40 text-xs mt-2 text-center">
                  No password needed — we&apos;ll send a one-click sign-in link.
                </p>
              </div>
            </>
          )}
        </div>

        <p className="text-white/50 text-sm mt-6 text-center flex items-center justify-center gap-1">
          <Lock className="w-4 h-4 text-cyan-400" />
          New here?{" "}
          <Link to="/" className="text-cyan-400 underline underline-offset-2 hover:text-cyan-300">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
