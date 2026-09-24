'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

function load(relative, sandbox) {
  const file = path.join(repoRoot, relative);
  assert.ok(fs.existsSync(file), `${relative} bulunmalı`);
  vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: relative });
  return fs.statSync(file).size;
}

const sandbox = { window: {} };
vm.createContext(sandbox);
load('app/content/quranLexiconV1.js', sandbox);
const grammarBytes = load('app/content/quranGrammarV1.js', sandbox);
const surahBytes = load('app/content/quranShortSurahsV1.js', sandbox);
const phonicsBytes = load('app/content/quranPhonicsV1.js', sandbox);
assert.ok(grammarBytes <= 60 * 1024, 'gramer modülü 60 KB bütçesini aşmamalı');
assert.ok(surahBytes <= 90 * 1024, 'kısa sûre modülü 90 KB bütçesini aşmamalı');
assert.ok(phonicsBytes <= 40 * 1024, 'fonetik modülü 40 KB bütçesini aşmamalı');

const grammar = sandbox.window.QuranGrammarV1;
assert.ok(grammar && Object.isFrozen(grammar));
assert.equal(grammar.concepts.length, 25);
assert.ok(grammar.byId('g0_5'), 'G0.5 kavramı bulunmalı');
assert.equal(grammar.unit11.roots.length, 73);
assert.equal(grammar.unit11.roots.reduce((sum, root) => sum + root.derivatives.length, 0), 242);

const phonics = sandbox.window.QuranPhonicsV1;
assert.ok(phonics && Object.isFrozen(phonics));
assert.equal(phonics.letters.length, 28);
assert.equal(new Set(phonics.letters.map((item) => item.id)).size, 28);
assert.equal(phonics.pairs.length, 12);
assert.equal(phonics.rules.length, 7);
assert.equal(Object.keys(phonics.translit.bwToOkunus).length, 28);
assert.equal(Object.keys(phonics.translit.bwToDia).length, 28);
const paired = new Set(phonics.pairs.flatMap((pair) => [pair.a, pair.b]));
for (const letter of phonics.letters.filter((item) => item.bucket === 'B' || item.bucket === 'C')) {
  assert.ok(paired.has(letter.id), `${letter.id}: B/C harfinin minimal çifti olmalı`);
  assert.ok(letter.svg, `${letter.id}: B/C harfinin SVG kimliği olmalı`);
}

const surahs = sandbox.window.QuranShortSurahsV1;
assert.ok(surahs && Object.isFrozen(surahs));
assert.equal(surahs.surahs.length, 20);
assert.deepEqual(Array.from(surahs.surahs, (item) => item.id), Array.from({ length: 20 }, (_, i) => 114 - i));
assert.equal(surahs.words.length, 618);
const allowedWaqf = new Set(['ۚ', 'ۖ', 'ۗ', 'ۘ', 'ۙ', 'ۛ']);
assert.ok(surahs.waqfMarks.length > 0, 'kısa sûrelerdeki vakıf işaretleri korunmalı');
assert.equal(surahs.waqfMarks.length, 6, 'pinned Tanzil kısa sûre vakıf toplamı korunmalı');
assert.equal(surahs.waqfMarks.filter((item) => item.mark === 'ۚ').length, 4);
assert.equal(surahs.waqfMarks.filter((item) => item.mark === 'ۖ').length, 2);
const wordIds = new Set(surahs.words.map((word) => word.id));
for (const mark of surahs.waqfMarks) {
  assert.ok(allowedWaqf.has(mark.mark), `bilinmeyen vakıf işareti: ${mark.mark}`);
  assert.match(mark.afterWordId, /^s-\d+-\d+-\d+$/);
  assert.ok(wordIds.has(mark.afterWordId), `${mark.afterWordId}: vakıf konumu gerçek kelimeye bağlanmalı`);
}
assert.deepEqual(Array.from(surahs.prayerTexts, (item) => item.id),
  ['tekbir', 'subhaneke', 'fatiha', 'zamm_sure', 'ruku', 'secde', 'tahiyyat', 'selam']);
for (const item of surahs.prayerTexts) {
  assert.equal(item.verified, true, `${item.id}: D-12 doğrulaması gerekli`);
  assert.ok(item.words.length > 0, `${item.id}: kelime içermeli`);
  for (const word of item.words) {
    const lemma = surahs.lemmaById(word.lemmaId);
    assert.ok(lemma, `${item.id}: ${word.lemmaId} çözümlenmeli`);
    assert.equal(lemma.verified, true, `${item.id}: ${word.lemmaId} doğrulanmış olmalı`);
  }
}

for (const source of [
  fs.readFileSync(path.join(repoRoot, 'app/content/quranGrammarV1.js'), 'utf8'),
  fs.readFileSync(path.join(repoRoot, 'app/content/quranShortSurahsV1.js'), 'utf8'),
  fs.readFileSync(path.join(repoRoot, 'app/content/quranPhonicsV1.js'), 'utf8')
]) assert.ok(!/\b(?:fetch|XMLHttpRequest|localStorage|sessionStorage|indexedDB)\b/.test(source));

console.log(`KAO content contract: PASS (grammar=${grammarBytes}, surahs=${surahBytes}, phonics=${phonicsBytes})`);
