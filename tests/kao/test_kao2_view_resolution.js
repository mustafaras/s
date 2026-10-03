'use strict';

// K2F-02 · Görünüm çözümü: yığın boşken `ui.kaoView` bilinen bir görünümse ana ekrana düşmemeli;
// gerçek yönlendirme (kaoNav/kaoSetView) her görünümü doğru başlıkla açmalı (R-09, K6-02).
// Sentetik VM; ağ, tarayıcı, gerçek kullanıcı verisi yok.
const assert = require('node:assert/strict');
const { bootKao, freshUser, openView, walkLesson, navTitle, text } = require('./helpers/kao-harness');

let passed = 0;
const check = (name, run) => { run(); passed += 1; console.log(`PASS  ${name}`); };

const t = bootKao();
freshUser(t);
const TITLES = t.api.KAO_VIEW_TITLES;
const HOME_TITLE = TITLES.home;
// Parametresiz görünümler: başlık doğrudan KAO_VIEW_TITLES'tan gelir.
const PARAM_FREE = Object.keys(TITLES).filter((v) => !['home', 'unit', 'word', 'reader', 'concept'].includes(v));
const routeOf = (v) => ({ unit: 'units', concept: 'grammar' }[v] || v);
// K2F-27: eski modal başlığı (X) kalktı; görev/özet oturumunun tek kapatma kontrolü NavBar "Kapat"tır, başlığı KAO_VIEW_TITLES.session.
const titleOk = (view, title) => title === TITLES[view];

check('KAO_VIEW_TITLES parametresiz görünüm kümesi sabit ve s0/roots/sources dahil', () => {
  assert.deepEqual(PARAM_FREE.slice().sort(),
    ['ayah', 'gate', 'grammar', 'phonics', 'prayer', 'roots', 's0', 'session', 'settings', 'sources', 'stats', 'units'],
    'yeni bir görünüm eklenirse bu test ve Flow beyaz listesi birlikte güncellenmeli');
});

check(`yığınsız ui.kaoView=v → NavBar başlığı KAO_VIEW_TITLES[v] (${PARAM_FREE.length} görünüm)`, () => {
  const wrong = [];
  for (const view of PARAM_FREE) {
    t.ui.kaoOpen = true; t.ui.kaoStack = []; t.ui.kaoView = view;
    const title = navTitle(t.api.kaoOverlayHTML(t.NOW));
    if (!titleOk(view, title)) wrong.push(`${view}: "${title}" ≠ "${TITLES[view]}"`);
  }
  assert.deepEqual(wrong, [], 'yığınsız görünüm ana ekrana düştü');
});

check('yığınsız türetilen yığın [home, görünüm] biçimindedir', () => {
  for (const view of PARAM_FREE) {
    t.ui.kaoOpen = true; t.ui.kaoStack = []; t.ui.kaoView = view;
    t.api.kaoOverlayHTML(t.NOW);
    assert.deepEqual(Array.from(t.ui.kaoStack, (e) => e.view), ['home', routeOf(view)], view);
    assert.equal(t.ui.kaoView, routeOf(view), view);
  }
});

check('bilinmeyen ui.kaoView ana ekrana düşer (geri uyum)', () => {
  t.ui.kaoOpen = true; t.ui.kaoStack = []; t.ui.kaoView = 'yok-boyle-bir-gorunum';
  assert.equal(navTitle(t.api.kaoOverlayHTML(t.NOW)), HOME_TITLE);
  assert.equal(t.ui.kaoView, 'home');
});

check('gerçek kaoNav her parametresiz görünümü doğru başlık ve [home, görünüm] yığınıyla açar', () => {
  const wrong = [];
  for (const view of PARAM_FREE) {
    const r = openView(t, view, null);
    const okStack = r.stack.length === 2 && r.stack[0] === 'home' && r.stack[1] === routeOf(view);
    if (!r.ok || !okStack || !titleOk(view, r.title)) wrong.push(`${view}: ok=${r.ok} yığın=${r.stack} başlık="${r.title}"`);
  }
  assert.deepEqual(wrong, [], 'kaoNav görünümü açamadı');
});

check('gerçek kaoSetView her parametresiz görünümü doğru başlıkla açar', () => {
  const wrong = [];
  for (const view of PARAM_FREE) {
    const r = openView(t, view, null, { mode: 'set' });
    if (!r.ok || !titleOk(view, r.title)) wrong.push(`${view}: ok=${r.ok} başlık="${r.title}"`);
  }
  assert.deepEqual(wrong, [], 'kaoSetView görünümü açamadı');
});

check('parametreli görünümler (kelime, sûre, ünite, kavram) gerçek yönlendirmeyle açılır', () => {
  const lemma = t.win.QuranLexiconV1.lemmas.find((l) => l.verified === true && l.translit);
  const unit = t.win.QuranCurriculumV2.units[0];
  const concept = t.win.QuranGrammarV1.concepts ? t.win.QuranGrammarV1.concepts[0] : null;
  const cases = [['word', lemma.id, 'word'], ['reader', 114, 'reader'], ['unit', unit.id, 'units']];
  if (concept) cases.push(['concept', concept.id, 'grammar']);
  for (const [view, param, route] of cases) {
    const r = openView(t, view, param);
    assert.equal(r.ok, true, `${view} açılmalı`);
    assert.deepEqual(r.stack, ['home', route], `${view} yığını`);
    assert.ok(r.title && r.title !== HOME_TITLE, `${view} başlığı ana ekran olmamalı: "${r.title}"`);
  }
});

check('geçersiz parametre görünümü açmaz ve ana ekranda bırakır', () => {
  assert.equal(openView(t, 'word', 'yok-kelime').ok, false);
  assert.equal(openView(t, 'unit', 'yok-unite').ok, false);
  assert.equal(openView(t, 'yok-gorunum', null).ok, false);
});

// ---- Düzeneğin öz-testi -------------------------------------------------
check('düzenek: openView/geri dönüş ana ekranı ve başlığı doğru raporlar', () => {
  const r = openView(t, 'settings', null);
  assert.equal(r.ok, true);
  assert.equal(r.view, 'settings');
  assert.equal(r.title, TITLES.settings);
  assert.match(text(r.html), /Ayarlar/);
  const home = openView(t, 'home', null);
  assert.deepEqual(home.stack, ['home']);
  assert.equal(home.title, HOME_TITLE);
});

check('düzenek: walkLesson ilk dersi gerçek handler\'larla bitirir; yanlış cevapla da takılmaz', () => {
  for (const answer of ['correct', 'wrong']) {
    const u = bootKao();
    freshUser(u);
    const lesson = u.win.QuranCurriculumV2.units[0].lessons[0];
    const seen = [];
    const done = walkLesson(u, lesson.id, { answer, visit: (task) => seen.push(task.id) });
    assert.equal(done, true, `${answer}: ders özet ekranına ulaşmalı`);
    assert.ok(seen.length > 0, `${answer}: en az bir görev gösterilmeli`);
  }
});

check('düzenek: bootKao seeded kartlı öğrenci kurar ve saat sabittir', () => {
  const u = bootKao({ seeded: true });
  assert.ok(Object.keys(u.data.quranLearn.cards).length >= 40);
  assert.equal(u.NOW, '2026-09-30T12:00:00.000Z');
});

console.log(`test_kao2_view_resolution: ${passed} kontrol PASS`);
