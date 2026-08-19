import { AlertTriangle } from "lucide-react";

/**
 * Shown instead of the app when a required environment variable is missing.
 *
 * The alternative — which is what used to happen — is a blank white page and a
 * console message no learner will ever see. This tells whoever opened it exactly
 * which setting is missing and where to put it.
 */
export default function ConfigError({ missing }: { missing: string[] }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-abyss px-6 py-16">
      <div className="w-full max-w-lg">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-ember/15 text-ember">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foam">This deploy is missing a setting</h1>
        <p className="mt-3 leading-relaxed text-foam/70">
          Apex can&apos;t reach its database because{" "}
          {missing.length === 1 ? "one environment variable isn't" : "these environment variables aren't"} set:
        </p>

        <ul className="mt-4 space-y-2">
          {missing.map((name) => (
            <li
              key={name}
              className="rounded-lg border border-ember/25 bg-ember/10 px-3 py-2 font-mono text-sm text-foam"
            >
              {name}
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-xl border border-white/10 bg-deep/70 p-5 text-sm leading-relaxed text-foam/70">
          <p className="font-semibold text-foam">How to fix it</p>
          <p className="mt-2">
            Add {missing.length === 1 ? "it" : "them"} under your Vercel project&apos;s{" "}
            <span className="text-foam">Settings → Environment Variables</span>, then redeploy — Vite reads these at
            build time, so an existing deploy won&apos;t pick them up on its own.
          </p>
          <p className="mt-2">
            Both values are in Supabase under <span className="text-foam">Project Settings → API</span>. See{" "}
            <span className="font-mono text-xs text-foam">.env.example</span> in the repo for the full list.
          </p>
        </div>
      </div>
    </div>
  );
}
