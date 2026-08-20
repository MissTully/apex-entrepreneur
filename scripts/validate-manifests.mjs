#!/usr/bin/env node
/**
 * Validates every module and scenario manifest, then checks the cross-references
 * the schemas can't see on their own.
 *
 * Run with `npm run validate`. It is part of `npm run build`, so a manifest that
 * would break the simulation, the debrief, or the score card fails the build
 * instead of failing silently in front of a learner.
 *
 * Three classes of check:
 *   1. JSON Schema  — shape, required fields, enums.
 *   2. Alignment    — every objective a scenario scores exists in its module;
 *                     every scenario in the browser's brief list exists on the
 *                     server and agrees with it.
 *   3. Runtime      — the invariants api/score.ts and ScoreView assume
 *                     (dimension count vs. maxTotal, tier ranges covering the
 *                     whole scale, a threshold inside the scale).
 *
 * Zero dependencies: the subset of draft-07 the manifests use is small enough to
 * check directly, and a validator you can run without `npm install` is one that
 * actually gets run.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));

const problems = [];
const fail = (where, msg) => problems.push(`${where}: ${msg}`);

/* ------------------------------------------------------------------ */
/* 1. A small draft-07 subset validator                                */
/* ------------------------------------------------------------------ */

function validate(node, schema, path, where) {
  if (!schema || typeof schema !== "object") return;

  if (schema.type) {
    const actual = Array.isArray(node) ? "array" : node === null ? "null" : typeof node;
    const want = schema.type === "integer" ? "number" : schema.type;
    if (actual !== want) return fail(where, `${path} should be ${schema.type}, got ${actual}`);
    if (schema.type === "integer" && !Number.isInteger(node)) {
      return fail(where, `${path} should be an integer, got ${node}`);
    }
  }

  if (schema.enum && !schema.enum.includes(node)) {
    fail(where, `${path} = ${JSON.stringify(node)} is not one of ${schema.enum.join(", ")}`);
  }
  if (schema.pattern && typeof node === "string" && !new RegExp(schema.pattern).test(node)) {
    fail(where, `${path} = ${JSON.stringify(node)} does not match /${schema.pattern}/`);
  }
  if (typeof node === "number") {
    if (schema.minimum !== undefined && node < schema.minimum) {
      fail(where, `${path} = ${node} is below the minimum ${schema.minimum}`);
    }
    if (schema.maximum !== undefined && node > schema.maximum) {
      fail(where, `${path} = ${node} is above the maximum ${schema.maximum}`);
    }
  }

  if (Array.isArray(node)) {
    if (schema.minItems !== undefined && node.length < schema.minItems) {
      fail(where, `${path} needs at least ${schema.minItems} item(s), has ${node.length}`);
    }
    if (schema.items) node.forEach((v, i) => validate(v, schema.items, `${path}[${i}]`, where));
    return;
  }

  if (node && typeof node === "object") {
    for (const key of schema.required ?? []) {
      if (!(key in node)) fail(where, `${path}.${key} is required but missing`);
    }
    if (schema.additionalProperties === false) {
      const known = Object.keys(schema.properties ?? {});
      for (const key of Object.keys(node)) {
        if (!known.includes(key)) fail(where, `${path}.${key} is not a known property`);
      }
    }
    for (const [key, sub] of Object.entries(schema.properties ?? {})) {
      if (key in node) validate(node[key], sub, `${path}.${key}`, where);
    }
  }
}

/* ------------------------------------------------------------------ */
/* 2. Load everything                                                  */
/* ------------------------------------------------------------------ */

const moduleSchema = read("manifests/module.schema.json");
const scenarioSchema = read("manifests/scenario.schema.json");
const index = read("manifests/index.json");

const modules = {};
for (const file of readdirSync(join(ROOT, "manifests/modules")).sort()) {
  if (!file.endsWith(".json")) continue;
  const m = read(`manifests/modules/${file}`);
  modules[m.moduleId] = m;
  validate(m, moduleSchema, "", `modules/${file}`);
}

const scenarios = {};
for (const file of readdirSync(join(ROOT, "manifests/scenarios")).sort()) {
  if (!file.endsWith(".json")) continue;
  const s = read(`manifests/scenarios/${file}`);
  scenarios[s.scenarioId] = s;
  validate(s, scenarioSchema, "", `scenarios/${file}`);
}

/* ------------------------------------------------------------------ */
/* 3. index.json agrees with the files on disk                         */
/* ------------------------------------------------------------------ */

for (const entry of index.modules) {
  const where = `index.json[${entry.moduleId}]`;
  if (!modules[entry.moduleId]) fail(where, "listed in the index but has no manifest file");
  try {
    read(`manifests/${entry.file}`);
  } catch {
    fail(where, `file "${entry.file}" cannot be read`);
  }
  for (const pre of entry.prerequisites ?? []) {
    if (!modules[pre]) fail(where, `prerequisite "${pre}" is not a known module`);
  }
}
for (const id of Object.keys(modules)) {
  if (!index.modules.some((m) => m.moduleId === id)) {
    fail("index.json", `module "${id}" exists on disk but is missing from the index`);
  }
}

/* ------------------------------------------------------------------ */
/* 4. Scenario <-> module alignment, and the runtime invariants        */
/* ------------------------------------------------------------------ */

for (const [id, s] of Object.entries(scenarios)) {
  const where = `scenarios/${id}`;
  const mod = modules[s.moduleId];
  if (!mod) {
    fail(where, `moduleId "${s.moduleId}" is not a known module`);
    continue;
  }

  const objectiveIds = new Set(mod.learningObjectives.map((o) => o.id));
  const assessmentIds = new Set((mod.assessments ?? []).map((a) => a.id));

  for (const oid of s.targetObjectiveIds) {
    if (!objectiveIds.has(oid)) fail(where, `targetObjectiveIds contains unknown objective "${oid}"`);
  }
  for (const aid of s.linkedAssessmentIds ?? []) {
    if (!assessmentIds.has(aid)) fail(where, `linkedAssessmentIds contains unknown assessment "${aid}"`);
  }
  for (const sig of s.successSignals) {
    if (!objectiveIds.has(sig.objectiveId)) {
      fail(where, `successSignal "${sig.id}" cites unknown objective "${sig.objectiveId}"`);
    }
  }

  // The rubric is what /api/score and the score card run on. Its absence is the
  // exact failure this validator exists to catch.
  if (!s.scoring) {
    fail(where, "has no scoring rubric — /api/score will return 400 for this scenario");
    continue;
  }

  const { dimensions, tiers, maxTotal, unlockThreshold, scale } = s.scoring;
  const expectedMax = dimensions.length * 2;

  if (maxTotal !== undefined && maxTotal !== expectedMax) {
    fail(where, `scoring.maxTotal is ${maxTotal} but ${dimensions.length} dimensions x 2 = ${expectedMax}`);
  }
  if (scale !== undefined && scale !== `0-${expectedMax}`) {
    fail(where, `scoring.scale is "${scale}" but the dimensions imply "0-${expectedMax}"`);
  }
  if (unlockThreshold !== undefined && (unlockThreshold < 0 || unlockThreshold > expectedMax)) {
    fail(where, `scoring.unlockThreshold ${unlockThreshold} sits outside 0-${expectedMax}`);
  }

  const ids = dimensions.map((d) => d.id);
  if (new Set(ids).size !== ids.length) fail(where, `duplicate scoring dimension ids: ${ids.join(", ")}`);
  for (const d of dimensions) {
    if (!objectiveIds.has(d.objectiveId)) {
      fail(where, `scoring dimension ${d.id} cites unknown objective "${d.objectiveId}"`);
    }
    if (!s.targetObjectiveIds.includes(d.objectiveId)) {
      fail(where, `scoring dimension ${d.id} scores "${d.objectiveId}", which is not in targetObjectiveIds`);
    }
  }

  // tierFor() in api/score.ts walks these ranges; a gap returns the wrong tier.
  const covered = new Set();
  for (const t of tiers) {
    const [lo, hi] = t.range.includes("-") ? t.range.split("-").map(Number) : [Number(t.range), Number(t.range)];
    if (hi < lo) fail(where, `tier range "${t.range}" is inverted`);
    for (let n = lo; n <= hi; n++) covered.add(n);
  }
  for (let n = 0; n <= expectedMax; n++) {
    if (!covered.has(n)) fail(where, `no scoring tier covers a total of ${n}`);
  }
}

/* ------------------------------------------------------------------ */
/* 5. The browser's public briefs agree with the server's scenarios    */
/* ------------------------------------------------------------------ */

const briefsSrc = readFileSync(join(ROOT, "src/data/scenarioBriefs.ts"), "utf8");

for (const [id, s] of Object.entries(scenarios)) {
  const where = `scenarioBriefs.ts[${id}]`;
  if (!briefsSrc.includes(`scenarioId: "${id}"`)) {
    fail(where, `scenario "${id}" has no public brief — the Phase page cannot launch it`);
    continue;
  }
  for (const d of s.scoring?.dimensions ?? []) {
    const line = `{ id: "${d.id}", name: "${d.name}", objectiveId: "${d.objectiveId}" }`;
    if (!briefsSrc.includes(line)) {
      fail(where, `dimension ${d.id} should read exactly: ${line}`);
    }
  }
}

const registrySrc = readFileSync(join(ROOT, "api/_scenarios.ts"), "utf8");
for (const id of Object.keys(scenarios)) {
  if (!registrySrc.includes(`"${id}":`)) {
    fail("api/_scenarios.ts", `scenario "${id}" is not registered — the endpoints can't resolve it`);
  }
}

/* ------------------------------------------------------------------ */

const counts = `${Object.keys(modules).length} modules, ${Object.keys(scenarios).length} scenarios`;
if (problems.length) {
  console.error(`\n✗ Manifest validation failed (${counts}) — ${problems.length} problem(s):\n`);
  for (const p of problems) console.error(`  • ${p}`);
  console.error("");
  process.exit(1);
}
console.log(`✓ Manifests valid — ${counts}, all cross-references resolve.`);
