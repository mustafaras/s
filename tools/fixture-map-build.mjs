#!/usr/bin/env node
// P13 — fixture → production-file map builder.
// Read-only scan of the committed fixture families. Extracts the production
// paths each fixture loads via three patterns:
//   1. plain repo-relative literals          'app/core/x.js'
//   2. path.join(__dirname, '..','app',...)  → segment form
//   3. require("./helpers/...")              → local test helper, whose own
//      production reads are attributed transitively
// No network, no product execution, no writes unless --write is given.
//
// Usage:
//   node tools/fixture-map-build.mjs            # dry-run, prints stats
//   node tools/fixture-map-build.mjs --write    # writes tests/FIXTURE-MAP.json
//   node tools/fixture-map-build.mjs --json     # JSON only
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = new Set(process.argv.slice(2));

const FAMILIES = [
  ['app', 'tests/app'],
  ['panel', 'tests/panel'],
  ['panel-v2', 'tests/panel-v2'],
  ['quran', 'tests/quran'],
  ['reminders', 'tests/reminders'],
];

const PRODUCTION_ROOTS = ['app.js', 'sync.js', 'sw.js', 'index.html', 'panel.html', 'panel-v2.html', 'manifest.json'];
const PRODUCTION_DIRS = ['app/', 'panel/', 'v3-tanitim/', 'assets/'];

const isProductionPath = value => {
  if (!value || typeof value !== 'string') return false;
  if (value.startsWith('tests/') || value.startsWith('ilham-ibadet-premium-plan/')) return false;
  if (!/\.(js|css|html|json|png|svg)$/.test(value)) return false;
  return PRODUCTION_ROOTS.includes(value) || PRODUCTION_DIRS.some(prefix => value.startsWith(prefix));
};

function literalPaths(source) {
  const found = [];
  for (const match of source.matchAll(/'([^'\n]+)'|"([^"\n]+)"/g)) {
    const value = match[1] ?? match[2];
    if (value && isProductionPath(value)) found.push(value);
  }
  return found;
}

// path.join(__dirname, '..', '..', 'app', 'core', 'x.js') → app/core/x.js
function joinPaths(source) {
  const found = [];
  for (const match of source.matchAll(/path\.join\(([^)]+)\)/g)) {
    const raw = match[1];
    if (!/__dirname|__filename|process\.cwd/.test(raw)) continue;
    const segments = [...raw.matchAll(/'([^'\n]+)'|"([^"\n]+)"/g)].map(m => m[1] ?? m[2]);
    const candidate = segments.filter(s => s && s !== '..' && s !== '.').join('/');
    if (isProductionPath(candidate)) found.push(candidate);
  }
  return found;
}

function localRequires(source, fixtureAbs) {
  const found = [];
  for (const match of source.matchAll(/require\(\s*['"](\.[^'"]+)['"]\s*\)/g)) {
    const resolved = path.resolve(path.dirname(fixtureAbs), match[1]);
    for (const candidate of [resolved, `${resolved}.js`, path.join(resolved, 'index.js')]) {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) { found.push(candidate); break; }
    }
  }
  return found;
}

const productionOf = source => [...new Set([...literalPaths(source), ...joinPaths(source)])].sort();

function resolveProduction(fixtureAbs, cache = new Map(), visiting = new Set()) {
  if (cache.has(fixtureAbs)) return cache.get(fixtureAbs);
  if (visiting.has(fixtureAbs)) return [];
  visiting.add(fixtureAbs);
  const source = fs.readFileSync(fixtureAbs, 'utf8');
  const direct = productionOf(source);
  const viaHelpers = localRequires(source, fixtureAbs)
    .flatMap(helper => resolveProduction(helper, cache, visiting));
  visiting.delete(fixtureAbs);
  const merged = [...new Set([...direct, ...viaHelpers])].sort();
  cache.set(fixtureAbs, merged);
  return merged;
}

function collectFixtures() {
  const map = {};
  const familyTotals = {};
  for (const [family, dir] of FAMILIES) {
    const abs = path.join(repo, dir);
    if (!fs.existsSync(abs)) continue;
    const files = fs.readdirSync(abs).filter(f => /^test_.*\.(js|mjs)$/.test(f)).sort();
    familyTotals[family] = files.length;
    for (const file of files) {
      map[`${dir}/${file}`] = { family, production: resolveProduction(path.join(abs, file)) };
    }
  }
  return { map, familyTotals };
}

const { map, familyTotals } = collectFixtures();

const byProduction = {};
for (const [fixture, entry] of Object.entries(map)) {
  for (const target of entry.production) (byProduction[target] ||= []).push(fixture);
}

const artifact = {
  schemaVersion: 1,
  generatedBy: 'tools/fixture-map-build.mjs',
  note: 'Fixture -> production-file map derived from committed sources (literal + path.join + local-helper transitive). Read-only scan; regenerate after adding fixtures or helpers. Consumed by ilham-ibadet-premium-plan/tools/plan-check.mjs sibling-regression gate.',
  families: familyTotals,
  byFixture: map,
  byProduction,
};

if (args.has('--json')) {
  process.stdout.write(JSON.stringify(artifact, null, 2) + '\n');
} else {
  const withoutTargets = Object.entries(map).filter(([, e]) => !e.production.length);
  process.stdout.write(`fixture-map: ${Object.keys(map).length} fixtures across ${Object.keys(familyTotals).length} families\n`);
  process.stdout.write(`families: ${Object.entries(familyTotals).map(([k, v]) => `${k}=${v}`).join(', ')}\n`);
  process.stdout.write(`distinct production targets: ${Object.keys(byProduction).length}\n`);
  process.stdout.write(`fixtures with no detected production target: ${withoutTargets.length}\n`);
  for (const [fixture] of withoutTargets) process.stdout.write(`  (none) ${fixture}\n`);
  process.stdout.write('\nTop production targets:\n');
  for (const [target, fixtures] of Object.entries(byProduction).sort((a, b) => b[1].length - a[1].length).slice(0, 15)) {
    process.stdout.write(`  ${String(fixtures.length).padStart(3)}  ${target}\n`);
  }
}

if (args.has('--write')) {
  const dest = path.join(repo, 'tests/FIXTURE-MAP.json');
  fs.writeFileSync(dest, JSON.stringify(artifact, null, 2) + '\n');
  process.stdout.write(`\nwrote ${path.relative(repo, dest)}\n`);
}
