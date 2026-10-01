'use strict';

// K2F-09 · Gramer 1/3 (K4-02 kök neden) — bölüm A: dondurma hattı doğrulanmış âyet örneklerini ve açıklamaları
// çalışma zamanı modülüne taşır. Arapça ve okunuş YALNIZ doğrulanmış kaynaktan/araç projeksiyonundan gelir;
// bu test onları elle yazmaz, kaynakla karşılaştırır. Sentetik VM; ağ, tarayıcı, gerçek kullanıcı verisi yok.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const zlib = require('node:zlib');
const repoRoot = require('../repo-root');

let passed = 0;
const check = (name, run) => { run(); passed += 1; console.log(`PASS  ${name}`); };

const source = JSON.parse(fs.readFileSync(path.join(repoRoot, 'docs/kuran-ogreniyorum/content/grammar.verified.json'), 'utf8'));
const box = { window: {} };
vm.createContext(box);
const modulePath = path.join(repoRoot, 'app/content/quranGrammarV1.js');
vm.runInContext(fs.readFileSync(modulePath, 'utf8'), box, { filename: 'quranGrammarV1.js' });
const grammar = box.window.QuranGrammarV1;
const srcConcept = (id) => source.concepts.find((c) => c.id === id);
const ARABIC = /[؀-ۿ]/;

check('her kavram `examples[]` ve (kaynakta varsa) `explanation[]` taşır; kavram sayısı kaynakla aynı', () => {
  assert.equal(grammar.concepts.length, source.concepts.length);
  for (const concept of grammar.concepts) {
    const src = srcConcept(concept.id);
    assert.ok(Array.isArray(concept.examples) && concept.examples.length > 0, `${concept.id}: examples yok`);
    assert.equal(concept.examples.length, src.examples.length, `${concept.id}: örnek sayısı`);
    if (Array.isArray(src.explanation) && src.explanation.length) {
      assert.deepEqual(Array.from(concept.explanation), src.explanation, `${concept.id}: explanation kaynakla aynı`);
    }
  }
});

check('exampleId\'li 43 şablonun 43\'ü modül içinde çözülür (sarkık kimlik yok)', () => {
  const templates = grammar.concepts.flatMap((c) => c.templates).filter((t) => t.exampleId);
  assert.equal(templates.length, 43, 'exampleId\'li şablon sayısı');
  assert.equal(typeof grammar.exampleById, 'function');
  const unresolved = templates.filter((t) => !grammar.exampleById(t.exampleId)).map((t) => t.exampleId);
  assert.equal(unresolved.length, 0, `çözülemeyen exampleId: ${unresolved.join(', ')}`);
});

check('her örnekte ref, tr, ar ve words[{w, ar, pronunciation}] var; okunuşlar boş değil ve Latin harfli', () => {
  let examples = 0, words = 0;
  for (const concept of grammar.concepts) for (const example of concept.examples) {
    examples += 1;
    assert.match(example.ref, /^\d+:\d+$/, `${example.id}: ref`);
    assert.ok(example.tr && typeof example.tr === 'string', `${example.id}: tr`);
    assert.ok(example.ar && ARABIC.test(example.ar), `${example.id}: ar`);
    assert.ok(Array.isArray(example.words) && example.words.length > 0, `${example.id}: words`);
    for (const word of example.words) {
      words += 1;
      assert.equal(typeof word.w, 'number', `${example.id}: w`);
      assert.ok(word.ar && ARABIC.test(word.ar), `${example.id}:${word.w} ar`);
      assert.ok(word.pronunciation && typeof word.pronunciation === 'string' && !ARABIC.test(word.pronunciation), `${example.id}:${word.w} okunuş boş/Arapça: "${word.pronunciation}"`);
    }
  }
  assert.equal(examples, 93);
  assert.equal(words, 329);
});

check('örnekler doğrulanmış kaynakla BİREBİR: id, ref, tr, ar ve kelime Arapçası/sırası aynı (elle metin yok)', () => {
  for (const concept of grammar.concepts) {
    const src = srcConcept(concept.id);
    src.examples.forEach((expected, index) => {
      const actual = concept.examples[index];
      assert.equal(actual.id, expected.id);
      assert.equal(actual.ref, expected.ref);
      assert.equal(actual.tr, expected.tr);
      assert.equal(actual.ar, expected.resolved.ar, `${expected.id}: ar`);
      assert.deepEqual(Array.from(actual.words, (w) => [w.w, w.ar]), expected.resolved.words.map((w) => [w.w, w.ar]), `${expected.id}: kelimeler`);
      assert.equal(actual.ar, actual.words.map((w) => w.ar).join(' '), `${expected.id}: ar = kelimelerin birleşimi`);
    });
  }
});

check('exampleById doğru örneği döndürür; bilinmeyen kimlik null', () => {
  const sample = grammar.concepts[0].examples[0];
  assert.equal(grammar.exampleById(sample.id).ref, sample.ref);
  assert.equal(grammar.exampleById('yok-boyle-bir-ornek'), null);
  assert.equal(grammar.exampleById(''), null);
  assert.equal(grammar.byId(grammar.concepts[0].id).examples[0].id, sample.id);
});

check('modül derin dondurulmuş (örnekler, kelimeler, açıklamalar değiştirilemez)', () => {
  const example = grammar.concepts[0].examples[0];
  assert.ok(Object.isFrozen(grammar) && Object.isFrozen(example) && Object.isFrozen(example.words) && Object.isFrozen(example.words[0]));
  assert.ok(Object.isFrozen(grammar.concepts[0].explanation));
});

check('mevcut içerik değişmedi: kavram başlıkları, tablolar, şablonlar ve unit11 kaynakla uyumlu', () => {
  for (const concept of grammar.concepts) {
    const src = srcConcept(concept.id);
    assert.equal(concept.title, src.title);
    assert.equal(concept.templates.length, src.templates.length, `${concept.id}: şablon sayısı`);
    assert.equal(concept.tables.length, src.tables.length, `${concept.id}: tablo sayısı`);
  }
  assert.ok(grammar.unit11 && Array.isArray(grammar.unit11.roots));
});

check('bütçeler: modül ham ≤128 KiB (araç tavanı) ve gzip toplamı bağlayıcı K-1 bütçeleri içinde (eski 4 modül ≤176 KiB, K2F-09)', () => {
  const raw = fs.statSync(modulePath).size;
  assert.ok(raw <= 128 * 1024, `ham ${raw} bayt > 128 KiB`);
  const gz = (file) => zlib.gzipSync(fs.readFileSync(path.join(repoRoot, file))).length;
  const legacy = ['app/content/quranLexiconV1.js', 'app/content/quranGrammarV1.js', 'app/content/quranShortSurahsV1.js', 'app/content/quranPhonicsV1.js'].reduce((n, f) => n + gz(f), 0);
  assert.ok(legacy <= 176 * 1024, `eski 4 modül gzip ${legacy} > 176 KiB (K2F-09 alt tavanı)`);
});

console.log(`test_kao2_grammar_tasks (bölüm A): ${passed} kontrol PASS`);
