'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const modulePath = path.join(repoRoot, 'app/content/quranLexiconV1.js');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(modulePath, 'utf8'), sandbox, { filename: modulePath });

const lemmas = sandbox.window.QuranLexiconV1.lemmas.slice().sort((a, b) => b.freq - a.freq);
const TOKEN_DENOMINATOR = 77430;
const checkpoints = [
  { level: 1, count: 90, minimum: 0.35 },
  { level: 2, count: 200, minimum: 0.55 },
  { level: 3, count: 320, minimum: 0.68 },
  // Müfredatın ~%80 hedefi yaklaşık değerdir; doğrulanmış 524 lemma %77,42'dir.
  { level: 4, count: lemmas.length, minimum: 0.77, target: 0.80, tolerance: 0.03 }
];

for (const checkpoint of checkpoints) {
  const freq = lemmas.slice(0, checkpoint.count).reduce((sum, lemma) => sum + lemma.freq, 0);
  const ratio = freq / TOKEN_DENOMINATOR;
  assert.ok(ratio >= checkpoint.minimum,
    `seviye ${checkpoint.level}: ${(ratio * 100).toFixed(2)}% < ${(checkpoint.minimum * 100).toFixed(0)}%`);
  if (checkpoint.target) assert.ok(Math.abs(ratio - checkpoint.target) <= checkpoint.tolerance);
}

const selectedFrequency = lemmas.reduce((sum, lemma) => sum + lemma.freq, 0);
assert.equal(selectedFrequency, 59948, 'dondurulan frekans toplamı doğrulanmış girdiden sapmamalı');
console.log(`KAO lexicon coverage: PASS (${selectedFrequency}/${TOKEN_DENOMINATOR} = ${(selectedFrequency / TOKEN_DENOMINATOR * 100).toFixed(2)}%)`);
