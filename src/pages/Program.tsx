import { PHASES } from "../data/curriculum";
import PhaseCard from "../components/PhaseCard";

export default function Program() {
  return (
    <div className="container-apex py-16">
      <span className="pill">The Program</span>
      <h1 className="mt-4 font-display text-4xl font-bold">A five-month migration</h1>
      <p className="mt-3 max-w-2xl text-foam/75">
        This journey transforms the adult learner into a Performance Engineer. By merging power
        skills with high-performance digital standards, graduates are prepared to manage system
        resources — and the complex human relationships of the modern decentralized economy.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {PHASES.map((p) => (
          <PhaseCard key={p.slug} phase={p} />
        ))}
      </div>
    </div>
  );
}
