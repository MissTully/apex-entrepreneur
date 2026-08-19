import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Waves, User, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

/**
 * The program shell's top bar.
 *
 * Two states. Signed out, it's a marketing nav pointing at the program and the
 * registration form. Signed in, it's the learner's actual navigation — the
 * dashboard, their profile, and a way out. Before this, /profile and
 * /certificate were reachable only by typing the URL, and there was no sign-out
 * at all, which matters on the shared machines a cohort often runs on.
 */
export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, hasProfile, hasSurvey } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const onboarded = hasProfile && hasSurvey;
  const ctaHref = !user ? "/register" : !onboarded ? "/onboarding" : "/members";
  const ctaLabel = !user ? "Register" : !onboarded ? "Finish onboarding" : "My dashboard";

  const links = user
    ? [
        { to: "/members", label: "Dashboard" },
        { to: "/program", label: "The Program" },
        { to: "/profile", label: "Profile" },
      ]
    : [
        { to: "/", label: "Home" },
        { to: "/program", label: "The Program" },
      ];

  async function signOut() {
    setMenuOpen(false);
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  }

  const linkClass = (to: string) =>
    `text-sm font-medium transition hover:text-glow ${
      pathname === to ? "text-glow" : "text-foam/80"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-abyss/80 backdrop-blur-md">
      <nav className="container-apex flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <Waves className="h-6 w-6 text-glow" />
          <span>
            Apex<span className="text-glow">.</span>
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 sm:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className={linkClass(l.to)}>
              {l.label}
            </Link>
          ))}
          <Link to={ctaHref} className="btn-primary px-4 py-2 text-sm">
            {ctaLabel}
          </Link>
          {user && (
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-foam/60 transition hover:text-ember"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          )}
        </div>

        {/* Mobile */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="rounded-lg p-2 text-foam/70 transition hover:bg-white/10 hover:text-foam sm:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-white/10 bg-abyss/95 sm:hidden">
          <div className="container-apex flex flex-col gap-1 py-4">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className={`rounded-lg px-2 py-2.5 ${linkClass(l.to)}`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to={ctaHref}
              onClick={() => setMenuOpen(false)}
              className="btn-primary mt-2 justify-center py-2.5 text-sm"
            >
              <User className="h-4 w-4" /> {ctaLabel}
            </Link>
            {user && (
              <button
                onClick={signOut}
                className="mt-1 inline-flex items-center gap-1.5 rounded-lg px-2 py-2.5 text-left text-sm font-medium text-foam/60 transition hover:text-ember"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
