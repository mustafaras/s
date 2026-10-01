'use strict';

// K2F-19 · Ders tutarlılık kapısı (K5-03 1/3). Ders başlığı/hedefi bir dil kategorisi anıyorsa dersin
// lemmalarının en az %60'ı o kategoriyi taşımalıdır; dersin conceptId'si denetlenebilir bir kategori
// taşıyorsa kavramın kategorisi de aynı eşikle sağlanmalıdır. Bugün tutmayan dersler KNOWN_MISMATCH'te
// TAM listelenir (yalnız küçülür; K2F-20 yeniden dağıtımı boşaltır). Sentetik node:vm; ağ/depo yok.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const THRESHOLD = 0.6;
const box = { window: {} };
vm.createContext(box);
for (const name of ['quranLexiconV1', 'quranGrammarV1', 'quranCurriculumV2']) {
  vm.runInContext(fs.readFileSync(path.join(repoRoot, `app/content/${name}.js`), 'utf8'), box, { filename: name });
}
const lexicon = box.window.QuranLexiconV1;
const curriculum = box.window.QuranCurriculumV2;
const grammar = box.window.QuranGrammarV1;

const meaning = (lemma) => (lemma.meanings || []).join(' ').toLocaleLowerCase('tr');
const posIn = (...tags) => (lemma) => tags.includes(lemma.pos);
const patternIs = (re) => (lemma) => re.test(String(lemma.pattern || ''));

// Kategori sözlüğü: anahtar sözcük (başlık/hedef) → lemma yüklemi. Gerekçe her satırda.
const CATEGORIES = [
  // Sözlükte pos=P edatları taşır.
  { id: 'edat', re: /edat|yön belirten|'-de, -den, -e'/, test: posIn('P') },
  // Sözlükte zamir yalnız PRON etiketiyle ayrılır.
  { id: 'zamir', re: /zamir/, test: posIn('PRON') },
  { id: 'işaret', re: /işaret kelimeleri/, test: posIn('DEM') },
  { id: 'soru', re: /soru kelimeleri/, test: posIn('INTG') },
  { id: 'olumsuzluk', re: /olumsuzluk/, test: posIn('NEG') },
  { id: 'şart', re: /şart|eğer/, test: posIn('COND') },
  { id: 'zaman', re: /zaman bildiren|zaman kalıpları/, test: posIn('T') },
  // 'allazî/mâ' REL: "-an, -en" ilgi bağları.
  { id: 'ilgi bağı', re: /'-an, -en' bağları/, test: posIn('REL') },
  { id: 'şüphesiz', re: /şüphesiz|pekiştirme/, test: posIn('CERT', 'ACC') },
  { id: 'ancak', re: /ancak|sınırlama/, test: posIn('RET', 'EXP') },
  // Sözlükte ayrı seslenme etiketi yok; anlamı "ey" ile başlayan lemmalar sayılır.
  { id: 'seslenme', re: /seslenme(?!k)/, test: (l) => /(^|\s)ey(\s|$)/.test(meaning(l)) },
  // Sözlükte emir kipi etiketi yok: lemmalar fiilin 3. tekil geçmiş biçimidir, hiçbiri emir sayılamaz.
  { id: 'emir', re: /emir kipi|emir ve dua/, test: () => false },
  { id: 'yapan/yapılan', re: /yapan ve yapılan/, test: patternIs(/ism-i (fâil|mef)/) },
  { id: 'fiilin adı', re: /fiilin adı/, test: patternIs(/masdar/) },
  { id: 'karşılaştırma', re: /karşılaştırma kalıbı/, test: patternIs(/tafdîl/) },
  // Fiil dersleri: sözlükteki fiil lemması kalıp başlığına uyar (geçmiş/şimdiki ayrımı veri modelinde yok).
  { id: 'fiil', re: /\bfiil(ler|leri|i)?\b/, test: posIn('V') },
  { id: 'esenlik', re: /esenlik/, test: (l) => /esen|selam|selâm|barış/.test(meaning(l)) },
  { id: 'hidayet', re: /hidayet|doğru yolu bulmak/, test: (l) => /hidayet|doğru yol|yol göster|doğruya/.test(meaning(l)) }
];

// Denetlenebilir kavram kategorileri (öteki kavramlar anlam/sözdizimi; lemma yüklemiyle ölçülemez).
const CONCEPT_CATEGORY = {
  g3: ['edat', posIn('P')], g4: ['zamir', posIn('PRON')], g6: ['olumsuzluk', posIn('NEG')], g7: ['ilgi bağı', posIn('REL')],
  g9: ['işaret', posIn('DEM')], g13: ['fiil', posIn('V')], g14: ['fiil', posIn('V')], g15: ['fiil', posIn('V')],
  g16: ['fiil', posIn('V')], g17: ['emir', () => false], g19: ['yapan/yapılan', patternIs(/ism-i (fâil|mef)/)],
  g20: ['fiilin adı', patternIs(/masdar/)], g22: ['şart', posIn('COND')], g23: ['zaman', posIn('T')]
};

function share(lemmaIds, test) {
  const lemmas = lemmaIds.map((id) => lexicon.byId(id));
  assert.ok(lemmas.every(Boolean), 'çözülemeyen lemma kimliği');
  return lemmas.filter(test).length / lemmas.length;
}

function incoherence(lesson) {
  const text = `${lesson.title} ${lesson.goal}`.toLocaleLowerCase('tr');
  const reasons = [];
  for (const category of CATEGORIES) {
    if (!category.re.test(text)) continue;
    const ratio = share(lesson.lemmaIds, category.test);
    if (ratio < THRESHOLD) reasons.push(`başlık/hedef "${category.id}" anıyor, lemmaların %${Math.round(ratio * 100)}'i uyuyor`);
  }
  const concept = CONCEPT_CATEGORY[lesson.conceptId];
  if (concept) {
    const ratio = share(lesson.lemmaIds, concept[1]);
    if (ratio < THRESHOLD) reasons.push(`kavram ${lesson.conceptId} "${concept[0]}" bekliyor, lemmaların %${Math.round(ratio * 100)}'i uyuyor`);
  }
  return reasons;
}

// Bugün tutmayan derslerin TAM listesi (K5-03). Yalnız küçülür; K2F-20 boşaltır.
const KNOWN_MISMATCH = [
  'u02.01', 'u02.02', 'u03.02', 'u04.01', 'u04.02', 'u09.01', 'u09.02',
  'u09.11', 'u10.01', 'u10.03', 'u11.04', 'u11.05', 'u12.02', 'u12.03'
];

let passed = 0;
const check = (name, run) => { run(); passed += 1; console.log(`PASS  ${name}`); };

const lessons = Array.from(curriculum.units).flatMap((unit) => Array.from(unit.lessons));
const found = lessons.map((lesson) => ({ id: lesson.id, reasons: incoherence(lesson) })).filter((x) => x.reasons.length);

check(`müfredat ${lessons.length} dersi taranır; her lemma sözlükte çözülür`, () => {
  assert.equal(lessons.length, 109);
  assert.ok(lessons.every((l) => l.lemmaIds.length > 0 && l.lemmaIds.every((id) => lexicon.byId(id))));
});

check('kategori sözlüğü ve kavram kategorileri gerçek kimliklere bağlı', () => {
  const conceptIds = new Set(grammar.concepts.map((c) => c.id));
  for (const id of Object.keys(CONCEPT_CATEGORY)) assert.ok(conceptIds.has(id), `kavram ${id} gramer modülünde yok`);
  for (const category of CATEGORIES) assert.ok(lessons.some((l) => category.re.test(`${l.title} ${l.goal}`.toLocaleLowerCase('tr'))), `kategori "${category.id}" hiçbir derste anılmıyor`);
});

check('tutarsız ders listesi KNOWN_MISMATCH ile TAM eşit (liste yalnız küçülür)', () => {
  const ids = Array.from(found, (x) => x.id);
  if (process.env.KAO_COHERENCE_DUMP) found.forEach((x) => console.log(x.id, x.reasons.join(' | ')));
  assert.deepEqual(ids, KNOWN_MISMATCH, `bulunan: ${JSON.stringify(ids)}`);
});

check('kapı boş değil: sentetik tutarsız ders yakalanır, uyumlu ders geçer; bilinen liste K5-03\'ün 10 dersini kapsar', () => {
  const pick = (pos) => lexicon.lemmas.filter((l) => l.pos === pos).slice(0, 5).map((l) => l.id);
  assert.ok(incoherence({ title: 'Zamirler', goal: 'x', lemmaIds: pick('N') }).length > 0, 'zamir başlığı + isim lemmaları yakalanmalı');
  assert.equal(incoherence({ title: 'İşaret kelimeleri', goal: 'x', lemmaIds: pick('DEM') }).length, 0, 'işaret başlığı + DEM lemmaları geçmeli');
  const audited = ['u02.01', 'u02.02', 'u04.01', 'u04.02', 'u09.01', 'u09.02', 'u10.01', 'u11.04', 'u11.05', 'u12.02'];
  for (const id of audited) assert.ok(KNOWN_MISMATCH.includes(id), `${id} bilinen listede olmalı (K5-03)`);
});

console.log(`KAO2 ders tutarlılığı: PASS (${passed} kontrol · bilinen tutarsız ${KNOWN_MISMATCH.length}/${lessons.length})`);
