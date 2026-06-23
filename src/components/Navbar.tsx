import { Link, useLocation, useNavigate } from "react-router-dom";
import { Waves } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, hasProfile, hasSurvey } = useAuth();

  const ctaHref = !user ? "/" : (!hasProfile || !hasSurvey ? "/onboarding" : "/members");

  // Public links; "Log In" only shows when the visitor isn't signed in.
  const links = [
    { to: "/", label: "Register" },
    { to: "/program", label: "The Program" },
    ...(!user ? [{ to: "/login", label: "Log In" }] : [{ to: "/profile", label: "Profile" }]),
  ];

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-abyss/80 backdrop-blur-md">
      <nav className="container-apex flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <Waves className="h-6 w-6 text-glow" />
          <span>
            Apex<span className="text-glow">.</span>
          </span>
        </Link>
        <div className="flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-medium transition hover:text-glow ${
                pathname === l.to ? "text-glow" : "text-foam/80"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-foam/80 transition hover:text-glow"
            >
              Log Out
            </button>
          ) : null}
          <Link to={ctaHref} className="btn-primary px-4 py-2 text-sm">
            Enter the Reef
          </Link>
        </div>
      </nav>
    </header>
  );
}
