#!/usr/bin/env node
// verify-state-adapter-contract.mjs — L2/B3 scratch-only adapter contract.
//
// No production file is loaded. The test imports the scratch adapter, exercises
// synthetic helpers, and statically verifies that the adapter has no runtime
// persistence/network surface. A green result is an architecture contract, not
// migration integration evidence.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STATE_ADAPTER_CONTRACT_VERSION,
  createStateDependencyBag,
  invokeStateHelperScratch,
  createStateHelperAdapterScratch,
} from './state-adapter-scratch.mjs';

const REPO = process.env.SEYMA_REPO ||
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const adapterPath = path.join(REPO, '.claude/skills/run-seyma/state-adapter-scratch.mjs');
const adapterSource = fs.readFileSync(adapterPath, 'utf8');
let passed = 0;
let failed = 0;

function ok(name, condition, detail) {
  if (condition) { passed++; console.log(`PASS  ${name}`); }
  else { failed++; console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`); }
}

console.log('== B3 scratch dependency-bag adapter contract ==');
ok('contract version is 1', STATE_ADAPTER_CONTRACT_VERSION === 1);
ok('adapter has no localStorage invocation', !/\blocalStorage\s*\./.test(adapterSource));
ok('adapter has no fetch invocation', !/\bfetch\s*\(/.test(adapterSource));
ok('adapter has no sync invocation', !/\bSeySync\s*\./.test(adapterSource));
ok('adapter does not import production app.js', !/from ['"].*app\.js/.test(adapterSource));
ok('adapter does not import production sync.js', !/from ['"].*sync\.js/.test(adapterSource));

const log = [];
const catalogs = { profile: { version: 'fixture-v1', ids: ['S01'] } };
const featureMigrations = { quran: { version: 1 } };
const deps = createStateDependencyBag({
  now: () => '2026-08-02T00:00:00.000Z',
  uid: (prefix) => `${prefix}_fixed`,
  catalogs,
  featureMigrations,
  logger: (event) => log.push(event),
});

ok('dependency bag is frozen', Object.isFrozen(deps));
ok('nested catalogs are cloned/frozen', Object.isFrozen(deps.catalogs) && deps.catalogs !== catalogs && deps.catalogs.profile !== catalogs.profile);
ok('dependency overrides are deterministic', deps.now() === '2026-08-02T00:00:00.000Z' && deps.uid('b') === 'b_fixed');
ok('logger is explicitly injectable', typeof deps.logger === 'function');

const seed = {
  version: 2,
  psych: { marker: 'preserve-psych' },
  quranJourney: { requests: { alak: { marker: 'preserve-quran' } } },
  futureField: { nested: true },
};
const helper = (draft, bag) => {
  draft.adapterMarker = bag.uid('adapter');
  draft.observedAt = bag.now();
  draft.catalogVersion = bag.catalogs.profile.version;
  draft.migrationVersion = bag.featureMigrations.quran.version;
  bag.logger({ type: 'scratch-helper', id: draft.adapterMarker });
  return draft;
};
const result = invokeStateHelperScratch(helper, seed, {
  now: () => '2026-08-02T00:00:00.000Z',
  uid: (prefix) => `${prefix}_one`,
  catalogs,
  featureMigrations,
  logger: (event) => log.push(event),
});

ok('helper output receives dependency bag values', result.result.adapterMarker === 'adapter_one' && result.result.observedAt === '2026-08-02T00:00:00.000Z');
ok('catalog/migration values are explicit', result.result.catalogVersion === 'fixture-v1' && result.result.migrationVersion === 1);
ok('unknown top-level state survives', result.result.futureField.nested === true);
ok('psych survives unchanged', result.result.psych.marker === 'preserve-psych');
ok('quran state survives unchanged', result.result.quranJourney.requests.alak.marker === 'preserve-quran');
ok('caller input is not mutated', JSON.stringify(seed) === JSON.stringify(result.original) && !Object.prototype.hasOwnProperty.call(seed, 'adapterMarker'));
ok('logger receipt is emitted through the bag', log.some((event) => event && event.type === 'scratch-helper'));

const adapted = createStateHelperAdapterScratch(helper, {
  now: () => '2026-08-02T00:00:01.000Z',
  uid: (prefix) => `${prefix}_two`,
  catalogs,
  featureMigrations,
});
const adaptedInput = { marker: 'adapter-wrapper' };
const adaptedOutput = adapted(adaptedInput);
ok('future adapter wrapper is callable', adaptedOutput.adapterMarker === 'adapter_two');
ok('future adapter wrapper keeps input isolated', !Object.prototype.hasOwnProperty.call(adaptedInput, 'adapterMarker'));
ok('future adapter wrapper does not create a global App surface', !Object.prototype.hasOwnProperty.call(globalThis, 'App'));

console.log(`\nB3 result: ${failed ? 'FAIL' : 'PASS'} (${passed} passed, ${failed} failed)`);
if (failed) process.exitCode = 1;
