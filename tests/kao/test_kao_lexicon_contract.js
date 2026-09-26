'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const modulePath = path.join(repoRoot, 'app/content/quranLexiconV1.js');
assert.ok(fs.existsSync(modulePath), 'quranLexiconV1.js bulunmalı');
assert.ok(fs.statSync(modulePath).size <= 340 * 1024, 'görünür örnek-cümle okunuşlarıyla modül 340 KB bütçesini aşmamalı');

const source = fs.readFileSync(modulePath, 'utf8');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: 'app/content/quranLexiconV1.js' });

const lexicon = sandbox.window.QuranLexiconV1;
assert.ok(lexicon && typeof lexicon === 'object', 'window.QuranLexiconV1 kurulmalı');
assert.equal(lexicon.version, 'quran-lexicon-tr-v1');
assert.ok(typeof lexicon.METHODOLOGY_TR === 'string' && lexicon.METHODOLOGY_TR.length > 40);
assert.ok(lexicon.ATTRIBUTION && Array.isArray(lexicon.ATTRIBUTION.sources));
assert.ok(Array.isArray(lexicon.lemmas) && lexicon.lemmas.length >= 500);
assert.ok(lexicon.roots && typeof lexicon.roots === 'object');
assert.equal(typeof lexicon.byId, 'function');

const ids = new Set();
const arabic = /^[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\s]+$/u;
const haraka = /[\u064b-\u065f\u0670]/u;
for (const lemma of lexicon.lemmas) {
  assert.ok(typeof lemma.id === 'string' && lemma.id.length > 3);
  assert.ok(!ids.has(lemma.id), `yinelenen id: ${lemma.id}`);
  ids.add(lemma.id);
  assert.ok(arabic.test(lemma.ar) && haraka.test(lemma.ar), `${lemma.id}: harekeli Arapça gerekli`);
  assert.equal(lemma.verified, true, `${lemma.id}: verified:true gerekli`);
  assert.ok(typeof lemma.translit === 'string' && lemma.translit.length > 0);
  assert.ok(Array.isArray(lemma.meanings) && lemma.meanings.length >= 1);
  assert.ok(Number.isInteger(lemma.freq) && lemma.freq > 0);
  assert.ok(Array.isArray(lemma.examples));
  const exception = lemma.examplesException;
  assert.ok(lemma.examples.length >= 3 || (exception && exception.final === true),
    `${lemma.id}: en az 3 örnek veya nihai D-13 istisnası gerekli`);
  for (const example of lemma.examples) {
    assert.ok(arabic.test(example.ar), `${lemma.id}: örnek Arapça blokta olmalı`);
    assert.ok(typeof example.tr === 'string' && example.tr.length > 0);
    assert.match(example.ref, /^\d{1,3}:\d{1,3}$/);
  }
  assert.equal(lexicon.byId(lemma.id), lemma, `${lemma.id}: byId aynı kaydı döndürmeli`);
}

for (const [root, rootIds] of Object.entries(lexicon.roots)) {
  assert.ok(arabic.test(root), `kök Arapça blokta olmalı: ${root}`);
  assert.ok(Array.isArray(rootIds) && rootIds.length > 0);
  for (const id of rootIds) assert.equal(lexicon.byId(id).root, root);
}

const shortSurahPath = path.join(repoRoot, 'app/content/quranShortSurahsV1.js');
assert.ok(fs.existsSync(shortSurahPath), 'quranShortSurahsV1.js bulunmalı');
vm.runInContext(fs.readFileSync(shortSurahPath, 'utf8'), sandbox, { filename: 'app/content/quranShortSurahsV1.js' });
const shortSurahs = sandbox.window.QuranShortSurahsV1;
assert.ok(shortSurahs && typeof shortSurahs.lemmaById === 'function');
for (const word of shortSurahs.words) {
  assert.ok(typeof word.lemmaId === 'string' && word.lemmaId.length > 3, `${word.id}: lemmaId gerekli`);
  const linked = lexicon.byId(word.lemmaId) || shortSurahs.lemmaById(word.lemmaId);
  assert.ok(linked, `${word.id}: ${word.lemmaId} sözlükte çözümlenmeli`);
  assert.equal(linked.verified, true, `${word.id}: ${word.lemmaId} doğrulanmış olmalı`);
  assert.ok(typeof word.tr === 'string' && word.tr.length > 0, `${word.id}: Türkçe kelime karşılığı gerekli`);
}

// KAO-FIX-04 (K-1, Y-3): kısa sûre Türkçesi yalnız yerel doğrulanmış katmandan gelir.
const ENGLISH_MARKERS = new Set(['the', 'their', 'his', 'those', 'which', 'they', 'them', 'of', 'and', 'will', 'shall', 'your', 'our', 'who', 'what', 'that']);
const englishWords = (text) => String(text || '').toLowerCase().split(/[^\p{L}]+/u).filter((word) => ENGLISH_MARKERS.has(word));
const shortTexts = [
  ...shortSurahs.words.map((word) => [word.id, word.tr]),
  ...shortSurahs.prayerTexts.flatMap((item) => item.words.map((word, index) => [`${item.id}#${index}`, word.tr])),
  ...shortSurahs.supplements.map((item) => [item.id, item.tr])
];
assert.deepEqual(shortTexts.filter(([, tr]) => englishWords(tr).length), [], '(a) kısa sûre katmanında İngilizce işaret kelimesi olmamalı');
assert.ok(!/quran\.com/i.test(JSON.stringify(shortSurahs.supplements.map((item) => item.source))), '(b) hiçbir source Quran.com içermemeli');
// corpus.quran.com (QAC) meşru kaynaktır; yasak olan quran.com çeviri referansıdır.
for (const item of shortSurahs.ATTRIBUTION.sources) {
  assert.ok(!/quran\.com/i.test(item.name), `(b) atıf adı Quran.com içermemeli: ${item.name}`);
  assert.notEqual(new URL(item.url).hostname.replace(/^www\./, ''), 'quran.com', `(b) atıf adresi quran.com olmamalı: ${item.url}`);
}
assert.match(shortSurahs.ATTRIBUTION.verification, /surahs\.verified\.json/, '(c) doğrulama alanı surahs.verified.json\'a atıf yapmalı');
assert.match(shortSurahs.ATTRIBUTION.verification, /D-12/, '(c) doğrulama alanı D-12\'ye atıf yapmalı');

// Sızıntı bekçisi: modüldeki her Türkçe karşılık doğrulanmış satırın aynısıdır.
const surahVerified = JSON.parse(fs.readFileSync(path.join(repoRoot, 'kuran-ogreniyorum/content/surahs.verified.json'), 'utf8'));
assert.equal(surahVerified.counts.filled, surahVerified.counts.total, 'surahs.verified.json eksiksiz olmalı');
for (const word of shortSurahs.words) {
  assert.equal(word.tr, surahVerified.rows[word.id]?.tr, `${word.id}: tr doğrulanmış satırdan gelmeli`);
}
const fatihaRows = Object.keys(surahVerified.rows).filter((id) => id.startsWith('f-1-'));
const fatihaWords = shortSurahs.prayerTexts.find((item) => item.id === 'fatiha').words;
assert.equal(fatihaWords.length, fatihaRows.length, 'Fâtiha kelime sayısı doğrulanmış satırlarla eşleşmeli');
fatihaWords.forEach((word, index) => assert.equal(word.tr, surahVerified.rows[fatihaRows[index]].tr, `${fatihaRows[index]}: tr doğrulanmış satırdan gelmeli`));
for (const item of shortSurahs.supplements) {
  assert.equal(item.tr, surahVerified.rows[item.id]?.tr, `${item.id}: tamamlayıcı tr doğrulanmış satırdan gelmeli`);
}

// İkinci yol (girdi varsa): kısa sûre kelimelerinin hiçbiri quran.com referansıyla normalize-eşit değil.
const referencePath = path.join(repoRoot, 'kuran-ogreniyorum/content/lexicon.reference.json');
if (fs.existsSync(referencePath)) {
  const normalizeTr = (value) => String(value || '').toLocaleLowerCase('tr').replace(/[\p{P}\p{S}]+/gu, ' ').replace(/\s+/g, ' ').trim();
  const referenceByRef = new Map(JSON.parse(fs.readFileSync(referencePath, 'utf8')).words.map((item) => [`${item.ref}:${item.position}`, item.tr]));
  const copied = shortSurahs.words.filter((word) => normalizeTr(word.tr) === normalizeTr(referenceByRef.get(`${word.surahId}:${word.ayah}:${word.i}`)));
  assert.equal(copied.length, 0, `referansla birebir aynı kelime olmamalı (${copied.slice(0, 3).map((word) => word.id).join(', ')})`);
}

assert.ok(!/\b(?:fetch|XMLHttpRequest|localStorage|sessionStorage|indexedDB)\b/.test(source),
  'donmuş içerik modülü ağ/depo API kullanmamalı');
console.log(`KAO lexicon contract: PASS (${lexicon.lemmas.length} lemma, ${fs.statSync(modulePath).size} bayt)`);
