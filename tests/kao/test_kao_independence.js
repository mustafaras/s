'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const source = fs.readFileSync(path.join(repoRoot, 'app/core/quranLearn.js'), 'utf8');
for (const forbidden of [
  /SeymaSaygi/, /app\/core\/saygi/, /archive\/ilham-ibadet-premium-plan/,
  /data\.saygi/, /data\.zikr/, /data\.prayer/, /data\.quranJourney/
]) assert.ok(!forbidden.test(source), `bağımsızlık ihlali: ${forbidden}`);
assert.ok(!/\b(?:localStorage|sessionStorage|indexedDB|XMLHttpRequest|fetch)\b/.test(source), 'registry ağ/depo API içermemeli');
let loadEffects = 0;
const sandbox = {
  window: {},
  document: new Proxy({}, { get() { loadEffects += 1; throw new Error('load-time DOM access'); } }),
  setTimeout() { loadEffects += 1; throw new Error('load-time timer'); },
  setInterval() { loadEffects += 1; throw new Error('load-time timer'); },
  requestAnimationFrame() { loadEffects += 1; throw new Error('load-time animation'); }
};
vm.runInContext(source, vm.createContext(sandbox), { filename: 'app/core/quranLearn.js' });
assert.equal(loadEffects, 0, 'registry yüklenirken DOM/timer etkisi açmamalı');
assert.equal(typeof sandbox.window.SeymaQuranLearn.kaoHubCardHTML, 'function');

console.log('KAO independence: PASS (IIP/state/network coupling ve load-time DOM/timer etkisi yok)');
