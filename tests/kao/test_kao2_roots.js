'use strict';

// KAO2-20 · Kök aileleri (S-11). Sentetik VM; ağ, tarayıcı, gerçek kullanıcı verisi yok.
// Mevcut veriden üretim: QuranGrammarV1.unit11.roots (73) + QuranLexiconV1.roots (301).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const decode = (h) => h.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const CONTENT = ['quranLexiconV1', 'quranGrammarV1', 'quranShortSurahsV1', 'quranPhonicsV1',
  'quranCurriculumV2', 'quranRevelationOrderV1', 'quranStrikingVersesV1'];

function boot(seed) {
  const box = { window: {}, Date };
  vm.createContext(box);
  for (const n of CONTENT) vm.runInContext(fs.readFileSync(path.join(repoRoot, `app/content/${n}.js`), 'utf8'), box, { filename: n });
  for (const f of ['app/core/quranLearnFlow.js', 'app/core/quranLearnViews.js', 'app/core/quranLearn.js']) {
    vm.runInContext(fs.readFileSync(path.join(repoRoot, f), 'utf8'), box, { filename: f });
  }
  const data = { settings: {}, days: {}, quranLearn: null };
  const ui = { kaoOpen: true, kaoView: 'home', kaoStack: [] };
  const api = box.window.SeymaQuranLearn;
  api.registerQuranLearn({ data: () => data, ui: () => ui, save() {}, render() {}, todayStr: () => '2026-09-30', esc, icon: () => '', getDay: () => ({}) });
  api.registerQuranLearnSurface({
    toast() {}, isQuietTime: false, mount() {}, lockBody() {}, unlockBody() {}, focusDialog() {}, restoreFocus() {},
    activeElementId: () => '', sheetClose(e, bk, done) { done && done(); }, taskElement: () => null
  });
  const q = api.ensureQuranLearn(data);
  q.onboarding.doneAt = '2026-09-20T00:00:00.000Z';
  if (seed) seed(q, api, box.window);
  return { api, box, data, ui, q, grammar: box.window.QuranGrammarV1, lex: box.window.QuranLexiconV1, curriculum: box.window.QuranCurriculumV2 };
}

let passed = 0;
const check = (name, run) => { run(); passed += 1; console.log(`PASS  ${name}`); };

// ---- (a) Liste: 73 unit11 kökü + "Tüm kökler" ikinci bölümü ------------------
check('(a) liste 73 unit11 kökünü Türkçe türev sayısıyla sunar', () => {
  const t = boot();
  const model = t.api.kaoRootsModel();
  assert.equal(model.families.length, 73, 'unit11 kök sayısı 73');
  const first = model.families[0];
  assert.ok(first.root && first.pronunciation && first.meaning, 'kök + okunuş + anlam');
  assert.ok(Number.isInteger(first.derivativeCount) && first.derivativeCount > 0, 'türev sayısı sayısal');
  assert.equal(first.derivativeCount, t.grammar.unit11.roots[0].derivatives.length, 'türev sayısı veriden');
});

check('(a) "Tüm kökler" ikinci ve isteğe bağlı katman (301)', () => {
  const t = boot();
  const model = t.api.kaoRootsModel();
  assert.equal(model.allCount, 301, 'sözlükte 301 kök');
  assert.equal(model.allVisible, false, 'keşif katmanı varsayılan kapalı (önce öğrenme sırası)');
  t.api.kaoRoots('all');
  assert.equal(t.api.kaoRootsModel().allVisible, true, 'isteğe bağlı katman açılır');
  assert.equal(t.api.kaoRootsModel().all.length, 301, 'tüm kökler listelenir');
});

// ---- (b) Kök sayfası -------------------------------------------------------
check('(b) kök sayfası: harfler (okunuşla), anlam, Türkçe türevler kalıp etiketiyle', () => {
  const t = boot();
  const root = t.grammar.unit11.roots[0];
  assert.equal(t.api.kaoRootOpen(root.root), true, 'kök sayfası açılır');
  const html = decode(t.api.kaoRootsHTML());
  assert.match(html, /class="kao-root-detail"/, 'kök detayı var');
  assert.match(html, new RegExp(root.root), 'kök harfleri gösterilir');
  assert.match(html, new RegExp(root.pronunciation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), 'okunuş gösterilir');
  assert.match(html, new RegExp(root.meaning), 'anlam gösterilir');
  for (const derivative of root.derivatives.slice(0, 2)) {
    assert.match(html, new RegExp(derivative.tr), `türev ${derivative.tr}`);
    assert.match(html, new RegExp(derivative.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `kalıp etiketi ${derivative.pattern}`);
  }
});

check('(b) kök sayfası bu kökten öğrenilen/öğrenilecek lemmaları durum özetiyle verir', () => {
  const t = boot();
  const root = t.grammar.unit11.roots[0];
  const model = t.api.kaoRootModel(root.root);
  assert.ok(Array.isArray(model.lemmas) && model.lemmas.length > 0, 'kökten lemmalar var');
  for (const lemma of model.lemmas) {
    assert.ok(lemma.lemmaId && lemma.ar && lemma.tr, 'lemma kimlik + Arapça + anlam');
    assert.ok(['known', 'learning', 'new'].includes(lemma.status), `durum rozeti (${lemma.status})`);
  }
  assert.ok(model.knownCount <= model.lemmas.length, 'öğrenilen sayısı toplamı aşmaz');
  // Kelime detayına bağlantı.
  t.api.kaoRootOpen(root.root);
  const html = decode(t.api.kaoRootsHTML());
  // Lemma satırları kök sayfasında; kelime detayı bağlantısı ayrı kontrolde sınanır.
  assert.match(html, /kao-root-lemma/, 'kök sayfasında kelime satırları var');
});

check('(b) kök sayfası tek odaklı ve açık geri yolu içerir', () => {
  const t = boot();
  t.api.kaoRootOpen(t.grammar.unit11.roots[0].root);
  const html = decode(t.api.kaoRootsHTML());
  assert.match(html, /kao-back/, 'geri düğmesi var');
  assert.match(html, /App\.kaoRoots\(&#39;list&#39;\)|App\.kaoRoots\('list'\)/, 'geri listeye döner');
  assert.doesNotMatch(html, /kao-root-family-list/, 'detay sayfasında liste tekrarlanmaz (tek odak)');
});

// ---- (c) Keşfet satırı ve kelime detayından köke bağlantı --------------------
check('(c) Keşfet bölümünde kök aileleri satırı görünür', () => {
  const t = boot();
  // Kök aileleri keşif katmanıdır: kullanıcı bir kart edinmeden gizli kalır.
  const unit = t.curriculum.units[0];
  t.q.cards[`w:${unit.lessons[0].lemmaIds[0]}:ar>tr`] = { state: 'review', reps: 4 };
  t.api.kaoNav('home');
  const home = decode(t.api.kaoHomeHTML());
  assert.match(home, /Kök aileleri/, 'Keşfet satırı var');
  assert.match(home, /App\.kaoOpenRoots\(\)/, 'satır kök ekranını açar');
  assert.match(home, /73 aile/, 'satır aile sayısını gösterir');
});

check('(c) kelime detayından kök sayfasına bağlantı verilir', () => {
  const t = boot();
  const root = t.grammar.unit11.roots[0];
  const lemmaId = t.api.kaoRootModel(root.root).lemmas[0].lemmaId;
  t.api.kaoOpenWord(lemmaId);
  // Kök ağacı 2. katmanda; kelime detayı oradan kök sayfasına bağlanır.
  const html = decode(t.api.kaoWordHTML());
  assert.match(html, /App\.kaoRoots\((['’]|&#39;)open(['’]|&#39;)/, 'kelime detayında kök bağlantısı var');
  assert.match(html, /Kök ailesini aç/, 'bağlantı okunur etiket taşır');
});

// ---- (a2) Taranabilirlik ve P10 tasarım kabulü -------------------------------
check('tüm kökler katmanı aranabilir (anlam ve türev sayısı)', () => {
  const t = boot();
  t.api.kaoRoots('all');
  const model = t.api.kaoRootsModel();
  const sample = model.all.find((item) => item.derivativeCount > 0);
  assert.ok(sample, 'türevi olan kök var');
  t.api.kaoRoots('query', sample.meaning);
  const filtered = t.api.kaoRootsModel();
  assert.ok(filtered.all.length > 0 && filtered.all.length < 301, 'arama süzer');
  assert.ok(filtered.all.every((item) => item.meaning.includes(sample.meaning) || item.root === sample.root), 'sonuçlar sorguya uyar');
});

check('kök detayı öğrenilmiş lemma sayısını kullanıcıya bildirir (durum rozeti)', () => {
  const t = boot();
  const root = t.grammar.unit11.roots[0];
  const model = t.api.kaoRootModel(root.root);
  assert.ok(model.knownCount >= 0 && typeof model.knownCount === 'number', 'öğrenilen sayısı');
  assert.ok(typeof model.masteredText === 'string' && model.masteredText.length > 0, 'insan okunur özet');
});

console.log(`KAO2 roots: PASS (${passed} kontrol)`);
