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
  'app/core/quranLearnViews.js',
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
// K3P-04B (K-A2): Türk alfabesi geleneği — fetha ince harfte e, kalın harfte (ع, خ) a: feʿale, hateme.
assert.equal(pronunciationOf('فَعَلَ'), 'feʿale');
assert.equal(pronunciationOf('فَعَلْتَ'), 'feʿalte');
assert.equal(pronunciationOf('كَسَبَا'), 'kesebâ');
assert.equal(pronunciationOf('خَتَمَ'), 'hateme');

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

// K3P-04 (B-03, K-A): okunuş bağlamdaki telaffuzu yansıtır. Kurallar: vasl elifi, şemsî idgâm, cümle içi vasl,
// âyet sonu vakf. K3P-04B (K-A2, kullanıcı kararı 2026-10-11): Türk alfabesi — غ → ğ, kalın harfte a/ı/u, incede e/i/ü.
const lemmaByAr = (ar) => lexicon.lemmas.find((lemma) => lemma.ar === ar);
assert.equal(lemmaByAr('ٱسْم').translit, 'ism', 'vasl elifi: ٱسْم → ism');
assert.equal(lemmaByAr('ٱبْن').translit, 'ibn', 'vasl elifi: ٱبْن → ibn');
assert.equal(lemmaByAr('ٱسْتَغْفَرَ').translit, 'istağfera', 'vasl elifi + Türk imlâsı: ٱسْتَغْفَرَ → istağfera (K-A)');
assert.equal(api.kaoDiaReading('ٱسْم'), 'ism', 'DİA katmanı da vasl elifini i okur (çalışma zamanı)');
const fatiha = shorts.prayerTexts.find((item) => item.id === 'fatiha').words;
const besmele = Array.from(fatiha.slice(0, 4), (word) => word.pronunciation); // vm dizisi → ana bağlam
assert.deepEqual(besmele, ['bismi', 'llâhi', 'r-rahmâni', 'r-rahîm'], 'Fâtiha 1:1 kelime sınırları korunur');
assert.equal(besmele.join('-'), 'bismi-llâhi-r-rahmâni-r-rahîm');
const besmeleExample = lexicon.lemmas.flatMap((lemma) => lemma.examples).find((example) => example.ref === '1:1' && example.ar.startsWith('بِسْمِ'));
assert.equal(besmeleExample.pronunciation, 'bismi llâhi r-rahmâni r-rahîm', 'sözlük örneği: 1:1 bağlamda okunur');
assert.equal(fatiha[4].pronunciation, 'el-hamdü', 'âyet başı (vakftan sonra) harf-i tarif ünlüsüyle başlar');
assert.equal(fatiha[8].pronunciation, 'er-rahmâni', 'K-A: harf-i tarif + güneş harfi er- (1:3)');
assert.deepEqual(Array.from(fatiha.slice(17, 20), (word) => word.pronunciation), ['ihdinâ', 's-sırâta', 'l-müstakîm'], 'kalın harfte ı, kalın harf öncesi a, incede ü (1:6)');
assert.deepEqual(Array.from(fatiha.slice(24, 26), (word) => word.pronunciation), ['ğayri', 'l-mağdûbi'], 'غ → ğ (1:7)');
assert.deepEqual(Array.from(shorts.words.filter((word) => word.surahId === 112 && word.ayah === 1), (word) => word.pronunciation), ['kul', 'hüve', 'llâhü', 'ehad'], 'âyet sonu vakf: ehadün → ehad');
// okunus-denetim.cjs mantığı: vasl elifi 'a' ile okunan lemma 0, idgâmsız güneş harfi 0 (her okunuş yüzeyinde).
const SUN_UNASSIMILATED = /\b[ae]l-(t|s̱|d|ẕ|r|z|s|ş|ṣ|ḍ|ṭ|ẓ|l|n)/;
const waslAsA = lexicon.lemmas.filter((lemma) => /^ٱ/.test(lemma.ar) && !/^ٱل/.test(lemma.ar) && /^[ae]/.test(lemma.translit));
assert.deepEqual(Array.from(waslAsA, (lemma) => `${lemma.ar}=${lemma.translit}`), [], 'vasl elifi a ile okunmaz');
const readings = [
  ...lexicon.lemmas.flatMap((lemma) => lemma.examples.map((example) => example.pronunciation)),
  ...shorts.words.map((word) => word.pronunciation),
  ...shorts.prayerTexts.filter((item) => item.id === 'fatiha').flatMap((item) => item.words.map((word) => word.pronunciation)),
  ...grammar.concepts.flatMap((concept) => (concept.examples || []).flatMap((example) => example.words.map((word) => word.pronunciation)))
];
assert.deepEqual(readings.filter((value) => SUN_UNASSIMILATED.test(value)).slice(0, 5), [], 'güneş harfinde idgâm yazılır');

// K3P-04: araç kuralları ↔ doğrulanmış girdi ↔ çalışma zamanı. auto:true okunuş önerileri aracın güncel çıktısıdır
// (kural değişip `--retranslit` unutulursa burada düşer); çalışma zamanı DİA okuyucusu araçla aynı sonucu verir.
import(require('node:url').pathToFileURL(path.join(repoRoot, 'tools/kao-lexicon-build.mjs')).href).then((tool) => {
  const verified = JSON.parse(fs.readFileSync(path.join(repoRoot, 'kaynak/kuran/icerik/lexicon.verified.json'), 'utf8'));
  const stale = verified.lemmas.filter((record) => record.translit.auto === true
    && (record.translit.tr !== tool.translitTr(tool.headwordBw(record.lemmaBw)) || record.translit.dia !== tool.translitDia(tool.headwordBw(record.lemmaBw))));
  assert.deepEqual(stale.map((record) => record.lemmaId), [], 'doğrulanmış girdideki okunuş önerisi araçla aynı (node tools/kao-lexicon-build.mjs --retranslit)');
  const runtimeDrift = verified.lemmas.filter((record) => api.kaoDiaReading(record.ar) !== tool.translitDia(tool.headwordBw(record.lemmaBw)));
  assert.deepEqual(runtimeDrift.map((record) => record.lemmaId), [], 'çalışma zamanı DİA okuyucusu araçla aynı');
  console.log('KAO pronunciation contract: PASS (content + task objects + visible paired rendering + K3P-04 okunuş kuralları, araç↔girdi↔çalışma zamanı 524/524)');
}).catch((error) => { console.error(error); process.exit(1); });
