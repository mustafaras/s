'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const repoRoot = require('../repo-root');

const source = fs.readFileSync(path.join(repoRoot, 'app/core/quranLearn.js'), 'utf8');
for (const forbidden of [
  /SeymaSaygi/, /app\/core\/saygi/, /archive\/ilham-ibadet-premium-plan/,
  /data\.saygi/, /data\.zikr/, /data\.prayer/, /data\.quranJourney/
]) assert.ok(!forbidden.test(source), `bağımsızlık ihlali: ${forbidden}`);
assert.ok(!/\b(?:localStorage|sessionStorage|indexedDB|XMLHttpRequest|fetch)\b/.test(source), 'registry ağ/depo API içermemeli');
assert.ok(!/\b(?:document|addEventListener|setTimeout|setInterval|requestAnimationFrame)\b/.test(source), 'registry yük/DOM/timer yolu içermemeli');

console.log('KAO independence: PASS (IIP/state/network/DOM coupling yok)');
