# Splitting `apex/` into its own repository

The Apex app currently lives in the `apex/` subfolder of `sim-consulting-revamp`
(because this Claude session is scoped to that repo and can't create a new one).
When you're ready, here's how to give it a clean, standalone home —
**with its full commit history preserved.**

## Option A — Preserve history (recommended)

`git subtree split` rewrites just the `apex/` folder into a new branch whose
root *is* the app, keeping every commit that touched it.

```sh
# 1. Create an empty repo on github.com named: apex-entrepreneurship-program
#    (no README/license — keep it empty so the push is clean)

# 2. From the sim-consulting-revamp repo root, carve out apex/ with history:
git subtree split --prefix=apex -b apex-split

# 3. Push that branch as 'main' of the new repo:
git push https://github.com/MissTully/apex-entrepreneurship-program.git apex-split:main

# 4. Clone the new repo fresh and work there from now on:
git clone https://github.com/MissTully/apex-entrepreneurship-program.git
cd apex-entrepreneurship-program
npm install
npm run dev
```

That's it — the new repo's root contains `package.json`, `src/`, `api/`, etc.,
and `git log` shows the history of every Apex commit.

## Option B — Fresh start (no history)

If you don't care about history, just copy the folder out:

```sh
cp -r apex ../apex-entrepreneurship-program
cd ../apex-entrepreneurship-program
rm -rf node_modules dist
git init -b main
git add .
git commit -m "Initial commit: Apex / Reef-Native course platform"
git remote add origin https://github.com/MissTully/apex-entrepreneurship-program.git
git push -u origin main
```

## After the split

- Remove `apex/` from `sim-consulting-revamp` so the two projects don't drift:
  `git rm -r apex && git commit -m "Move Apex to its own repo" && git push`
- Point Vercel (see `DEPLOY.md`) at the **new** repo's root instead of the
  `apex/` subdirectory — simpler config, since the app is now at the root.
