import { Link } from "react-router-dom";
import { ArrowRight, Anchor, Brain, Network } from "lucide-react";
import { PHASES, CORE_COMPETENCIES } from "../data/curriculum";
import PhaseCard from "../components/PhaseCard";

const compIcons = [Brain, Network, Anchor];

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="container-apex pt-20 pb-16">
        <div className="max-w-3xl animate-fade-up">
          <span className="pill">Reef-Native · Experiential · 2026</span>
          <h1 className="mt-6 font-display text-5xl font-bold leading-tight sm:text-6xl">
            Become the <span className="text-glow">apex predator</span> of the modern economy.
          </h1>
          <p className="mt-6 text-lg text-foam/75">
            In an AI-driven landscape, technical skill is a commodity. Real entrepreneurial success
            is now dictated by <strong className="text-foam">power skills</strong> — emotionally
            intelligent leadership, strategic communication, and empathy. Apex is a five-phase,
            practice-on-demand program that trains them like survival depends on it. Because in
            these waters, it does.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/program" className="btn-primary">
              Enter the Reef
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a href="#competencies" className="btn-ghost">
              The Power-Skills Philosophy
            </a>
          </div>
        </div>
      </section>

      {/* Core competencies */}
      <section id="competencies" className="container-apex py-16">
        <h2 className="font-display text-3xl font-bold">Core competencies for the modern founder</h2>
        <p className="mt-2 max-w-2xl text-foam/70">
          The uniquely human abilities that drive value when routine execution is handled by
          machines.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {CORE_COMPETENCIES.map((c, i) => {
            const Icon = compIcons[i];
            return (
              <div key={c.title} className="card-reef">
                <Icon className="h-8 w-8 text-glow" />
                <h3 className="mt-4 font-display text-lg font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm text-foam/70">{c.detail}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* The Predator's Lexicon */}
      <section className="container-apex py-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold">The Predator&apos;s Lexicon</h2>
            <p className="mt-2 max-w-2xl text-foam/70">
              Five phases mapped to the life-cycle of an apex predator — from positioning to the
              open-ocean migration.
            </p>
          </div>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PHASES.map((p) => (
            <PhaseCard key={p.slug} phase={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
