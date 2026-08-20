import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Waves, LogOut, Menu, X, Check, Circle, Compass, Award, BarChart2, User } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useProgress } from "../hooks/useProgress";
import { supabase } from "../lib/supabase";
import { PHASES, isOrientation } from "../data/curriculum";
import NavDropdown from "./NavDropdown";

/**
 * The program shell's top bar.
 *
 * Two shapes. Signed out it's a short marketing nav. Signed in it's the
 * learner's actual navigation: Course Home, a Phases menu listing all six with
 * their completion state, and a My Progress menu. Every destination in the app
 * is now reachable in at most two clicks from any page — /profile and
 * /certificate used to be reachable only by typing the URL.
 */
export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, hasProfile, hasSurvey } = useAuth();
  const { progress } = useProgress();
  const [menuOpen, setMenuOpen] = useState(false);

  const onboarded = hasProfile && hasSurvey;
  const inCourse = pathname.startsWith("/program/");
  const inProgressArea = ["/profile", "/certificate", "/post-survey"].includes(pathname);

  async function signOut() {
    setMenuOpen(false);
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  }

  const tab = (to: string) =>
    `text-sm font-medium transition hover:text-glow ${pathname === to ? "text-glow" : "text-foam/80"}`;

  const item =
    "flex items-start gap-2.5 rounded-lg px-3 py-2 text-sm text-foam/80 transition hover:bg-white/10 hover:text-foam";

  const phaseItems = PHASES.map((p) => {
    const done = progress[p.slug]?.status === "completed";
    return (
      <Link key={p.slug} to={`/program/${p.slug}`} role="menuitem" className={item}>
        {done ? (
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-kelp" />
        ) : (
          <Circle className="mt-0.5 h-4 w-4 shrink-0 text-foam/25" />
        )}
        <span>
          <span className="block font-medium text-foam">{p.codename}</span>
          <span className="block text-xs text-foam/50">
            {isOrientation(p) ? "Orientation" : `Phase ${p.month}`}
            {done && " · complete"}
          </span>
        </span>
      </Link>
    );
  });

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-abyss/80 backdrop-blur-md">
      <nav className="container-apex flex h-16 items-center justify-between gap-4">
        <Link
          to={user && onboarded ? "/members" : "/"}
          className="flex shrink-0 items-center gap-2 font-display text-lg font-bold"
        >
          <Waves className="h-6 w-6 text-glow" />
          <span>
            Apex<span className="text-glow">.</span>
          </span>
        </Link>

        {/* ── Desktop ── */}
        <div className="hidden items-center gap-6 md:flex">
          {user && onboarded ? (
            <>
              <Link to="/members" className={tab("/members")}>
                Course Home
              </Link>

              <NavDropdown label="Phases" active={inCourse || pathname === "/program"} align="right">
                {phaseItems}
                <div className="my-1 border-t border-white/10" />
                <Link to="/program" role="menuitem" className={item}>
                  <Compass className="mt-0.5 h-4 w-4 shrink-0 text-glow" />
                  <span className="font-medium text-foam">All phases at a glance</span>
                </Link>
              </NavDropdown>

              <NavDropdown label="My Progress" active={inProgressArea} align="right">
                <Link to="/profile" role="menuitem" className={item}>
                  <User className="mt-0.5 h-4 w-4 shrink-0 text-glow" />
                  <span>
                    <span className="block font-medium text-foam">Profile &amp; progress</span>
                    <span className="block text-xs text-foam/50">Phases completed, surveys, badges</span>
                  </span>
                </Link>
                <Link to="/post-survey" role="menuitem" className={item}>
                  <BarChart2 className="mt-0.5 h-4 w-4 shrink-0 text-glow" />
                  <span>
                    <span className="block font-medium text-foam">Post-program survey</span>
                    <span className="block text-xs text-foam/50">Unlocks your certificate</span>
                  </span>
                </Link>
                <Link to="/certificate" role="menuitem" className={item}>
                  <Award className="mt-0.5 h-4 w-4 shrink-0 text-glow" />
                  <span className="font-medium text-foam">Certificate</span>
                </Link>
                <div className="my-1 border-t border-white/10" />
                <button onClick={signOut} role="menuitem" className={`${item} w-full text-left`}>
                  <LogOut className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                  <span className="font-medium text-foam">Sign out</span>
                </button>
              </NavDropdown>
            </>
          ) : (
            <>
              <Link to="/" className={tab("/")}>
                Home
              </Link>
              <Link to="/program" className={tab("/program")}>
                The Program
              </Link>
              <Link to={user ? "/onboarding" : "/register"} className="btn-primary px-4 py-2 text-sm">
                {user ? "Finish onboarding" : "Register"}
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile trigger ── */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="rounded-lg p-2 text-foam/70 transition hover:bg-white/10 hover:text-foam md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* ── Mobile sheet: the same destinations, laid out flat ── */}
      {menuOpen && (
        <div className="max-h-[80vh] overflow-y-auto border-t border-white/10 bg-abyss/95 md:hidden">
          <div className="container-apex flex flex-col gap-1 py-4" onClick={() => setMenuOpen(false)}>
            {user && onboarded ? (
              <>
                <Link to="/members" className={`${item} font-semibold`}>
                  <Compass className="mt-0.5 h-4 w-4 shrink-0 text-glow" />
                  <span className="font-medium text-foam">Course Home</span>
                </Link>

                <p className="px-3 pt-3 text-xs font-semibold uppercase tracking-widest text-foam/40">
                  Phases
                </p>
                {phaseItems}

                <p className="px-3 pt-3 text-xs font-semibold uppercase tracking-widest text-foam/40">
                  My Progress
                </p>
                <Link to="/profile" className={item}>
                  <User className="mt-0.5 h-4 w-4 shrink-0 text-glow" />
                  <span className="font-medium text-foam">Profile &amp; progress</span>
                </Link>
                <Link to="/post-survey" className={item}>
                  <BarChart2 className="mt-0.5 h-4 w-4 shrink-0 text-glow" />
                  <span className="font-medium text-foam">Post-program survey</span>
                </Link>
                <Link to="/certificate" className={item}>
                  <Award className="mt-0.5 h-4 w-4 shrink-0 text-glow" />
                  <span className="font-medium text-foam">Certificate</span>
                </Link>

                <button onClick={signOut} className={`${item} mt-2 w-full text-left`}>
                  <LogOut className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                  <span className="font-medium text-foam">Sign out</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/" className={item}>
                  <span className="font-medium text-foam">Home</span>
                </Link>
                <Link to="/program" className={item}>
                  <span className="font-medium text-foam">The Program</span>
                </Link>
                <Link
                  to={user ? "/onboarding" : "/register"}
                  className="btn-primary mt-2 justify-center py-2.5 text-sm"
                >
                  {user ? "Finish onboarding" : "Register"}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
