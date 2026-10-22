'use strict';
// K3P-11 · Tezhip sayfası (TASARIM §2) — bileşen + model; sentetik VM, ağ/tarayıcı/depo yok.
//
// 1) views.tezhipPage üç durumu doğru sınıflar, metni kaçırır, erişilebilir ad taşır, `interactive:false` iken
//    kelime DÜĞME değildir; rumî kenarlık `aria-hidden` gerçek bir SVG'dir.
// 2) kaoTezhipModel yalnız türetir (veri değişmez); durum kuralı: bilinen = kaoKnownLemmaSet, öğreniliyor = kartı
//    var, yeni = kartı yok; ve yaldız oranı AYNI kelime kümesi üzerinden kaoCoverage ile tutarlıdır.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');
const { bootKao, freshUser } = require('./helpers/kao-harness');

let passed = 0;
const check = (name, run) => { run(); passed += 1; console.log(`PASS  ${name}`); };

const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icon = (name, size, cls) => '<svg class="' + (cls || '') + '" width="' + (size || 20) + '" aria-hidden="true"><path d="M1 11h22"/></svg>';

// ---- 1 · Bileşen (Views tek başına yüklenir) ------------------------------------------------------
const box = { window: {} };
vm.createContext(box);
vm.runInContext(fs.readFileSync(path.join(repoRoot, 'app/core/quranLearnViews.js'), 'utf8'), box, { filename: 'views' });
const views = box.window.SeymaQuranLearnViews;
assert.equal(views.register({ esc, icon }), true, 'görünüm bağımlılıkları kuruldu');

const html = views.tezhipPage({
  title: 'Fâtiha',
  footer: '7 âyet · %64 anlam · 3 kelime kaldı',
  interactive: false,
  lines: [[
    { ar: 'بِسْمِ', state: 'known', index: 1 },
    { ar: 'ٱلرَّحْمَـٰنِ', state: 'learning', index: 2 },
    { ar: '<script>x</script>', state: 'new', index: 3 }
  ]]
});
check('üç durum doğru sınıflarla çizilir', () => {
  assert.match(html, /kao-tezhip-word is-known/);
  assert.match(html, /kao-tezhip-word is-learning/);
  assert.match(html, /kao-tezhip-word is-new/);
});
check('metin kaçırılır (escape)', () => {
  assert.match(html, /&lt;script&gt;x&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>/);
});
check('erişilebilir ad var (aria-label)', () => {
  assert.match(html, /aria-label="بِسْمِ, biliniyor"/);
  assert.match(html, /aria-label="ٱلرَّحْمَـٰنِ, öğreniliyor"/);
  assert.match(html, /aria-label="&lt;script&gt;x&lt;\/script&gt;, henüz bilinmiyor"/);
});
check('interactive:false → kelimeler düğme değil', () => {
  assert.doesNotMatch(html, /<button/);
  assert.match(html, /<span class="kao-tezhip-word/);
});
check('Arapça gövde RTL ve --kao-ar-body sınıfını taşır', () => {
  assert.match(html, /<div class="kao-tezhip-body" lang="ar" dir="rtl">/);
});
check('rumî kenarlık aria-hidden SVG', () => {
  assert.match(html, /<svg class="kao-tezhip-orn"[\s\S]*?aria-hidden="true"/);
});
check('başlık ve alt bilgi kaçırılmış metin', () => {
  assert.match(html, /<figcaption class="kao-tezhip-title">Fâtiha<\/figcaption>/);
  assert.match(html, /<p class="kao-tezhip-footer">7 âyet · %64 anlam · 3 kelime kaldı<\/p>/);
});
const interactive = views.tezhipPage({ title: 'X', interactive: true, lines: [[{ ar: 'قُلْ', state: 'new' }]] });
check('interactive:true → kelimeler düğme ve ≥44 px sınıfı', () => {
  assert.match(interactive, /<button type="button" class="kao-tezhip-word is-new"/);
  const css = fs.readFileSync(path.join(repoRoot, 'app/kao.css'), 'utf8');
  assert.match(css, /\.kao-tezhip button\.kao-tezhip-word\{[^}]*min-height:44px/);
  // Yaldız yalnız renkle değil: düğme varyantı da 2 px altın alt çizgiyi korur (border:0 onu ezmemeli).
  assert.match(css, /\.kao-tezhip button\.kao-tezhip-word\.is-known\{[^}]*border-bottom:2px solid var\(--kao-ok\)/);
});

// ---- 2 · Model (gerçek motor) --------------------------------------------------------------------
const t = bootKao();
freshUser(t);
const shorts = t.win.QuranShortSurahsV1;
const fatiha = shorts.prayerTexts.find((item) => item.id === 'fatiha');
const lemmaIds = Array.from(new Set(fatiha.words.map((word) => word.lemmaId)));
for (const id of lemmaIds.slice(0, 3)) for (const dir of ['ar>tr', 'tr>ar']) t.data.quranLearn.cards[`w:${id}:${dir}`] = { state: 'review', s: 25, reps: 6, due: '2099-01-01T00:00:00.000Z' };
t.data.quranLearn.cards[`w:${lemmaIds[3]}:ar>tr`] = { state: 'learning', s: 0, reps: 1 }; // yalnız tek yön → öğreniliyor
const before = JSON.stringify(t.data);
const model = t.api.kaoTezhipModel(t.data, 'fatiha');

check('Fâtiha modeli namaz metninden çözülür', () => {
  assert.equal(model.title, 'Fâtiha');
  assert.equal(model.surahId, null);
  assert.equal(model.words.length, fatiha.words.length);
});
check('durum kuralı: bilinen / öğreniliyor / yeni', () => {
  const byLemma = {};
  model.words.forEach((word) => { if (byLemma[word.lemmaId] === undefined) byLemma[word.lemmaId] = word.state; });
  assert.equal(byLemma[lemmaIds[0]], 'known');
  assert.equal(byLemma[lemmaIds[3]], 'learning');
  assert.equal(byLemma[lemmaIds[lemmaIds.length - 1]], 'new');
});
check('bilinen kümesi kaoKnownLemmaSet ile aynı', () => {
  const known = t.api.kaoKnownLemmaSet(t.data);
  model.words.forEach((word) => assert.equal(word.state === 'known', known[word.lemmaId] === 1));
});
check('kalan kelime = bilinmeyenler', () => {
  assert.equal(model.remaining, model.words.filter((word) => word.state !== 'known').length);
});
check('model YALNIZ türetir (veri değişmez)', () => {
  assert.equal(JSON.stringify(t.data), before);
});
check('lines biçimi [[{ar,state,index}]]', () => {
  assert.ok(Array.isArray(model.lines) && model.lines.every(Array.isArray));
  const flat = model.lines.reduce((all, line) => all.concat(line), []);
  assert.equal(flat.length, model.words.length);
  assert.ok(flat.every((word) => typeof word.ar === 'string' && ['known', 'learning', 'new'].indexOf(word.state) >= 0 && 'index' in word));
});
check('yaldız oranı kaoCoverage ile tutarlı (aynı kelime kümesi)', () => {
  const direct = t.api.kaoCoverage(t.data, model.words);
  assert.deepEqual(JSON.parse(JSON.stringify(model.coverage)), JSON.parse(JSON.stringify(direct)));
  assert.equal(model.coverage.total, fatiha.words.length);
  assert.equal(model.words.filter((word) => word.state === 'known').length, model.coverage.known);
});
check('kısa sûre modu (İhlâs) ve bilinmeyen kimlik', () => {
  const surah = t.api.kaoTezhipModel(t.data, 112);
  assert.equal(surah.title, 'İhlâs');
  assert.equal(surah.surahId, 112);
  assert.equal(surah.words.length, shorts.words.filter((word) => word.surahId === 112).length);
  assert.equal(t.api.kaoTezhipModel(t.data, 999), null);
});

// ══ K3PD-18 · Tezhip modeli GERÇEKTEN saf ═══════════════════════════════════════════════════════
// Ölçüm: model çağrısı girdiyi YAZMAMALI (normalize/persistans yok), deep-frozen girdide
// patlamamalı, save çağırmamalı ve çıktı girdinin nesnelerine referans sızdırmamalı.
// Bu testler mevcut "JSON.stringify aynı" kontrolünü tamamlar: o kontrol ZATEN normalize
// edilmiş veriyle başlıyordu, bu yüzden normalize eden modeli yakalayamıyordu.

const deepFreeze = (o) => { if (o && typeof o === 'object' && !Object.isFrozen(o)) { Object.values(o).forEach(deepFreeze); Object.freeze(o); } return o; };

check('K3PD-18 boş/eksik quranLearn: model normalize ETMEZ, girdiyi yazmaz', () => {
  for (const data of [{ quranLearn: {} }, {}, { quranLearn: { cards: undefined } }, { quranLearn: { cards: null } }, { quranLearn: 'nope' }]) {
    const before = JSON.stringify(data);
    const model = t.api.kaoTezhipModel(data, 'fatiha');
    assert.ok(model, 'geçerli sûre için model üretilir');
    assert.equal(JSON.stringify(data), before, 'girdi DEĞİŞMEZ (normalize/persistans yok)');
    assert.equal(data.quranLearn && data.quranLearn.schemaVersion, undefined, 'schemaVersion yazılmaz');
    if (data.quranLearn && typeof data.quranLearn === 'object') assert.equal(data.quranLearn.settings, undefined, 'settings yaratılmaz');
  }
});

check('K3PD-18 deep-frozen girdi: model patlamaz ve yazmaz', () => {
  const frozen = deepFreeze(JSON.parse(JSON.stringify(t.data)));
  const before = JSON.stringify(t.data);
  let model;
  assert.doesNotThrow(() => { model = t.api.kaoTezhipModel(frozen, 'fatiha'); }, 'deep-frozen state model çağrısını kırmaz');
  assert.ok(model && Array.isArray(model.words) && model.words.length, 'model yine üretilir');
  assert.equal(JSON.stringify(t.data), before, 'kaynak veri değişmez');
});

check('K3PD-18 save çağrısı 0 (model yan etkisiz)', () => {
  const saves = t.calls.save;
  t.api.kaoTezhipModel(t.data, 'fatiha');
  t.api.kaoTezhipModel(t.data, 112);
  assert.equal(t.calls.save, saves, 'model hiç save çağırmaz');
});

check('K3PD-18 çıktı girdiye referans sızdırmaz (çıktıyı değiştirmek girdiyi değiştirmez)', () => {
  const before = JSON.stringify(t.data);
  const a = t.api.kaoTezhipModel(t.data, 'fatiha');
  assert.equal(JSON.stringify(t.data), before, 'çağrı sonrası veri aynı');
  a.words[0].state = 'known';
  a.words[0].ar = 'MUTATED';
  a.lines.length = 0;
  if (a.coverage) { a.coverage.known = -1; a.coverage.ratio = 99; }
  assert.equal(JSON.stringify(t.data), before, 'çıktı mutasyonu girdiye geçmez');
  const b = t.api.kaoTezhipModel(t.data, 'fatiha');
  assert.notEqual(b.words[0].ar, 'MUTATED', 'yeni çağrı temiz çıktı verir');
});

check('K3PD-18 geçersiz sûre null; geçerli model aynı kelime kümesi/kapsam', () => {
  assert.equal(t.api.kaoTezhipModel(t.data, 999), null);
  assert.equal(t.api.kaoTezhipModel({}, 999), null);
  const model = t.api.kaoTezhipModel(t.data, 'fatiha');
  const direct = t.api.kaoCoverage(t.data, model.words);
  assert.deepEqual(JSON.parse(JSON.stringify(model.coverage)), JSON.parse(JSON.stringify(direct)));
  const known = t.api.kaoKnownLemmaSet(t.data);
  model.words.forEach((word) => assert.equal(word.state === 'known', known[word.lemmaId] === 1));
});

console.log(`test_k3p_tezhip: ${passed} kontrol PASS (bileşen + model saflığı/K3PD-18)`);
