'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const sandbox = { window: {}, Date, Math, Number, String, Object, Array, JSON };
vm.createContext(sandbox);
for (const relative of [
  'app/content/quranLexiconV1.js',
  'app/content/quranGrammarV1.js',
  'app/content/quranShortSurahsV1.js',
  'app/content/quranStrikingVersesV1.js',
  'app/content/quranPhonicsV1.js',
  'app/core/quranLearn.js'
]) vm.runInContext(fs.readFileSync(path.join(repoRoot, relative), 'utf8'), sandbox, { filename: relative });

const api = sandbox.window.SeymaQuranLearn;
const grammar = sandbox.window.QuranGrammarV1;
const shorts = sandbox.window.QuranShortSurahsV1;
const lexicon = sandbox.window.QuranLexiconV1;
const quranLearn = api.emptyQuranLearn();
const ui = { kaoQueue: [], kaoTaskIndex: 0, kaoOrderDraft: [], kaoFeedback: '' };
api.registerQuranLearn({
  data() { return { quranLearn }; }, ui() { return ui; }, save() {}, render() {},
  todayStr() { return '2026-09-25'; }, esc(value) { return String(value); },
  icon() { return ''; }, getDay() { return {}; }
});

const hasArabic = (value) => /[\u0600-\u06ff]/.test(String(value || ''));
const hasPronunciation = (value) => typeof value === 'string' && /[A-Za-z\u00c0-\u024f]/.test(value.trim());

for (const word of shorts.words) {
  assert.ok(hasPronunciation(word.pronunciation), `${word.id}: kısa sûre kelimesinin Latin okunuşu zorunlu`);
}
for (const lemma of lexicon.lemmas) {
  assert.ok(hasPronunciation(lemma.translit), `${lemma.id}: kelime okunuşu zorunlu`);
  for (const example of lemma.examples) assert.ok(hasPronunciation(example.pronunciation), `${lemma.id}/${example.ref}: örnek cümle okunuşu zorunlu`);
}
for (const concept of grammar.concepts) {
  for (const table of concept.tables || []) {
    for (const row of table.rows || []) {
      for (const cell of row.cells || []) {
        if (Array.isArray(cell) && hasArabic(cell[1])) {
          assert.ok(hasPronunciation(cell[2]), `${concept.id}/${row.label}: Arapça gramer hücresinin Latin okunuşu zorunlu`);
        }
      }
    }
  }
}
const conjugationCells = grammar.byId('g13').tables[0].rows.flatMap((row) => row.cells).filter(Array.isArray);
const pronunciationOf = (arabic) => (conjugationCells.find((cell) => cell[1] === arabic) || [])[2];
assert.equal(pronunciationOf('فَعَلَ'), 'faʿala');
assert.equal(pronunciationOf('فَعَلْتَ'), 'faʿalta');
assert.equal(pronunciationOf('كَسَبَا'), 'kasabâ');
assert.equal(pronunciationOf('خَتَمَ'), 'hatama');

const wordTask = api.kaoBuildTask({ id: 'word', cardId: `w:${sandbox.window.QuranLexiconV1.lemmas[0].id}:tr>ar`, type: 'arabic' }, { quranLearn }, { seed: 'pronunciation' });
for (const choice of wordTask.choices) {
  if (hasArabic(choice.label)) assert.ok(hasPronunciation(choice.pronunciation), `kelime seçeneği: ${choice.label}`);
}

for (const candidate of api.kaoGrammarCandidates()) {
  const task = api.kaoBuildGrammarTask({ id: candidate.id, cardId: candidate.id, type: 'grammar' }, { quranLearn }, { seed: candidate.id });
  if (hasArabic(task.stimulus)) assert.ok(hasPronunciation(task.stimulusPronunciation), `${task.grammarType}: uyaran okunuşu`);
  for (const item of task.context || []) {
    if (hasArabic(item.label)) assert.ok(hasPronunciation(item.pronunciation), `${task.grammarType}: bağlam okunuşu`);
  }
  for (const choice of task.choices || []) {
    if (hasArabic(choice.label)) assert.ok(hasPronunciation(choice.pronunciation), `${task.grammarType}: seçenek okunuşu`);
  }
  const html = api.kaoTaskHTML(task);
  const arabicCount = (html.match(/class="kao-arabic-text"/g) || []).length;
  const pronunciationCount = (html.match(/class="kao-pronunciation-line"/g) || []).length;
  assert.equal(pronunciationCount, arabicCount, `${task.grammarType}: her Arapça satırın yanında görünür Latin okunuş olmalı`);
}

for (const candidate of api.kaoFragmentCandidates()) {
  const task = api.kaoBuildFragmentTask({ id: candidate.id, cardId: candidate.id, type: 'fragment', fragmentKind: candidate.fragmentKind }, { seed: candidate.id });
  assert.ok(hasPronunciation(task.pronunciation), `${task.kind}: parça okunuşu`);
  for (const choice of task.choices) {
    if (hasArabic(choice.label)) assert.ok(hasPronunciation(choice.pronunciation), `${task.kind}: kelime çipi okunuşu`);
  }
  const html = api.kaoTaskHTML(task);
  const arabicCount = (html.match(/class="kao-arabic-text"/g) || []).length;
  const pronunciationCount = (html.match(/class="kao-pronunciation-line"/g) || []).length;
  assert.equal(pronunciationCount, arabicCount, `${task.kind}: her Arapça satırın yanında görünür Latin okunuş olmalı`);
}

assert.match(api.kaoTaskHTML(wordTask), /class="kao-pronunciation-line"/);
assert.doesNotMatch(api.kaoTaskHTML(wordTask), /okunuş (?:yok|bekliyor|henüz)/i);
const missingPronunciationTask = JSON.parse(JSON.stringify(wordTask));
const arabicChoice = missingPronunciationTask.choices.find((choice) => hasArabic(choice.label));
arabicChoice.pronunciation = '';
const failClosedHtml = api.kaoTaskHTML(missingPronunciationTask);
assert.match(failClosedHtml, /class="kao-content-error" role="alert"/);
assert.doesNotMatch(failClosedHtml, new RegExp(`class="kao-arabic-text"[^>]*>${arabicChoice.label}`), 'okunuşu eksik Arapça sessizce gösterilmemeli');

console.log('KAO pronunciation contract: PASS (content + task objects + visible paired rendering)');
