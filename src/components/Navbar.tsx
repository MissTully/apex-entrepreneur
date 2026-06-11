import { Link, useLocation } from "react-router-dom";
import { Waves } from "lucide-react";

export default function Navbar() {
  const { pathname } = useLocation();
  const links = [
    { to: "/", label: "Home" },
    { to: "/program", label: "The Program" },
  ];

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
          <Link to="/program" className="btn-primary px-4 py-2 text-sm">
            Enter the Reef
          </Link>
        </div>
      </nav>
    </header>
  );
}
