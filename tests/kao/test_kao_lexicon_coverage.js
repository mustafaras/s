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

// KAO-28 · ortak kaoCoverage: E1 ve E9 aynı token paydasını ve aynı bilinen-kelime kuralını kullanır.
{
  const box = { window: {} };
  vm.createContext(box);
  for (const relative of ['app/content/quranLexiconV1.js', 'app/content/quranShortSurahsV1.js', 'app/core/quranLearn.js']) vm.runInContext(fs.readFileSync(path.join(repoRoot, relative), 'utf8'), box, { filename: relative });
  const api = box.window.SeymaQuranLearn;
  const top = lemmas.slice(0, 10);
  // KAO-FIX-07 (02 §3): bilinen = iki yönde review ∧ s≥21; yetim ya da okuyucu-bilinmeyen yön lemmayı düşürür.
  const durable = { state: 'review', s: 21, reps: 6 };
  const bothWays = (lemma) => [[`w:${lemma.id}:ar>tr`, durable], [`w:${lemma.id}:tr>ar`, durable]];
  const cards = Object.fromEntries(top.flatMap(bothWays));
  Object.assign(cards, Object.fromEntries(bothWays(lemmas[10])), Object.fromEntries(bothWays(lemmas[11])));
  cards[`w:${lemmas[10].id}:ar>tr`] = Object.assign({}, durable, { orphan: true });
  cards[`w:${lemmas[11].id}:tr>ar`] = Object.assign({}, durable, { readerUnknown: true });
  const data = { quranLearn: { cards } };
  const whole = api.kaoCoverage(data);
  assert.equal(whole.total, TOKEN_DENOMINATOR, 'E1 paydası QAC token sayısı');
  assert.equal(whole.known, top.reduce((sum, lemma) => sum + lemma.freq, 0), 'yetim ve okuyucu-bilinmeyen sayılmaz');
  assert.equal(whole.ratio, whole.known / TOKEN_DENOMINATOR);
  const everything = api.kaoCoverage({ quranLearn: { cards: Object.fromEntries(lemmas.flatMap(bothWays)) } });
  assert.equal(everything.known, selectedFrequency, 'tüm sözlük = %77,42 (üst sınır)');
  const words = [{ lemmaId: top[0].id }, { lemmaId: top[1].id }, { lemmaId: 'l_yok_000000' }, { lemmaId: lemmas[10].id }];
  assert.deepEqual(JSON.parse(JSON.stringify(api.kaoCoverage(data, words))), { known: 2, total: 4, ratio: 0.5 }, 'âyet kapsamı token düzeyinde');
  assert.deepEqual(JSON.parse(JSON.stringify(api.kaoCoverage(data, []))), { known: 0, total: 0, ratio: 0 });
  const source = fs.readFileSync(path.join(repoRoot, 'app/core/quranLearn.js'), 'utf8');
  assert.match(source, /percent=Math\.min\(100,Math\.floor\(kaoCoverage\(d\)\.ratio\*100\)\)/, 'E1 yüzdesi ortak kaoCoverage');
  assert.doesNotMatch(source, /stats\.known\/524/, 'eski lemma/524 yüzdesi kalmadı');
  assert.equal((source.match(/card\.readerUnknown!==true/g) || []).length, 1, 'bilinen-kelime kuralı tek yerde (kaoKnownLemmaSet)');
}

console.log(`KAO lexicon coverage: PASS (${selectedFrequency}/${TOKEN_DENOMINATOR} = ${(selectedFrequency / TOKEN_DENOMINATOR * 100).toFixed(2)}%)`);
