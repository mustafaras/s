'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const sandbox = { window: {}, Date, Math, Number, String, Object, Array, JSON };
vm.createContext(sandbox);
const load = (relative) => vm.runInContext(fs.readFileSync(path.join(repoRoot, relative), 'utf8'), sandbox, { filename: relative });
for (const relative of [
  'app/content/quranLexiconV1.js',
  'app/content/quranGrammarV1.js',
  'app/content/quranShortSurahsV1.js',
  'app/content/quranRevelationOrderV1.js',
  'app/content/quranStrikingVersesV1.js',
  'app/content/quranPhonicsV1.js',
  'app/content/quranCurriculumV2.js'
]) load(relative);
for (const relative of ['app/core/quranLearnFlow.js', 'app/core/quranLearnViews.js']) {
  if (fs.existsSync(path.join(repoRoot, relative))) load(relative);
}
load('app/core/quranLearn.js');

const api = sandbox.window.SeymaQuranLearn;
assert.equal(typeof api.kaoNav, 'function', 'yığın gezinmesi için kaoNav olmalı');
assert.equal(typeof api.kaoBack, 'function', 'önceki ekrana dönmek için kaoBack olmalı');
assert.equal(sandbox.window.SeymaQuranLearnFlow.version, 1);
assert.equal(sandbox.window.SeymaQuranLearnViews.version, 1);

// KAO2-11: ilk açılışı bitirmiş kullanıcı; kartsız ve doneAt boş kullanıcı ana ekran yerine ilk açılışı görür.
const data = { quranLearn: Object.assign(api.emptyQuranLearn(), { onboarding: { doneAt: '2026-09-20T10:00:00.000Z' } }), settings: { targetBed: '23:00' }, quranJourney: { requests: {} } };
const ui = { kaoOpen: false, kaoView: 'home', kaoReturnFocusId: '', kaoQueue: [], kaoTaskIndex: 0, kaoTaskStartedAt: 0, kaoUndo: null, kaoFeedback: '', kaoAudioFailed: false };
let renderCount = 0;
assert.equal(api.registerQuranLearn({
  data: () => data,
  ui: () => ui,
  save() {},
  render() { renderCount += 1; },
  todayStr: () => '2026-09-28',
  esc: (value) => String(value),
  icon: () => '',
  getDay: () => ({})
}), true);
assert.equal(api.registerQuranLearnSurface({
  lockBody() {}, unlockBody() {}, focusDialog() {}, activeElementId: () => 'kao-hub-entry',
  restoreFocus() {}, sheetClose(_card, _back, close) { close(); }, mount() {}
}), true);

assert.equal(api.kaoOpen(), true);
assert.equal(api.kaoNav('units'), true);
const lemma = sandbox.window.QuranLexiconV1.lemmas.find((item) => item.verified);
assert.equal(api.kaoNav('word', lemma.id), true);
assert.deepEqual(Array.from(ui.kaoStack, (entry) => entry.view), ['home', 'units', 'word']);
assert.equal(api.kaoBack(), true);
assert.equal(ui.kaoView, 'units');
assert.equal(api.kaoBack(), true);
assert.equal(ui.kaoView, 'home');

assert.equal(api.kaoNav('reader', 114), true);
assert.equal(api.kaoBack(), true, 'ana ekrandan açılan okuyucu ana ekrana dönmeli');
assert.equal(ui.kaoView, 'home');

const surah = api.kaoSurahs().find((item) => item.id === 114);
const screens = [
  ['home', undefined, 'Kur\'an Arapçası'],
  ['units', undefined, 'Yol'],
  ['word', lemma.id, lemma.translit],
  ['reader', surah.id, surah.name],
  ['settings', undefined, 'Ayarlar'],
  ['phonics', undefined, 'Telaffuz'],
  ['ayah', undefined, 'Günün âyeti'],
  ['prayer', undefined, 'Namazda ne diyorum'],
  ['stats', undefined, 'İlerleme'],
  ['gate', undefined, 'Harf kontrolü']
];
for (const [view, param, title] of screens) {
  ui.kaoStack = [{ view: 'home', param: null, title: 'Kur\'an Arapçası' }];
  ui.kaoView = 'home';
  const html = view === 'home' ? api.kaoOverlayHTML(new Date('2026-09-28T09:00:00')) : (() => {
    assert.equal(api.kaoNav(view, param), true, `${view} ekranına gidilmeli`);
    return api.kaoOverlayHTML(new Date('2026-09-28T09:00:00'));
  })();
  const nav = html.match(/<nav class="kao-navbar"[\s\S]*?<\/nav>/);
  assert.ok(nav, `${view}: NavBar görünür olmalı`);
  assert.ok(nav[0].includes(`class="kao-navbar-title" title="${title}">${title}</`), `${view}: NavBar başlığı görünümle eşleşmeli`);
  assert.match(html, /<div class="kao-largetitle">[\s\S]*?<h2\b/, `${view}: LargeTitle görünür olmalı`);
  assert.doesNotMatch(html, /class="kao-view-head|class="kao-back/, `${view}: eski başlık/geri denetimleri taşınmış olmalı`);
}

ui.kaoStack = [{ view: 'home', param: null, title: 'Kur\'an Arapçası' }];
ui.kaoView = 'home';
let html = api.kaoOverlayHTML(new Date('2026-09-28T09:00:00'));
assert.match(html, /class="kao-navbar-action"[^>]*>Kapat</);
assert.equal(api.kaoNav('units'), true);
html = api.kaoOverlayHTML(new Date('2026-09-28T09:00:00'));
assert.match(html, /class="kao-navbar-action"[^>]*>‹ Kur'an Arapçası</);
assert.equal(api.kaoNav('word', lemma.id), true);
html = api.kaoOverlayHTML(new Date('2026-09-28T09:00:00'));
assert.match(html, /class="kao-navbar-action"[^>]*>‹ Yol</);
assert.match(html, /id="sey-ov-card"[^>]*role="dialog"[^>]*aria-modal="true"[^>]*tabindex="-1"/);
assert.match(html, /onkeydown="App\.onModalKeydown\(event,App\.kaoClose\)"/);
assert.ok(renderCount >= 5);

// K2F-27 (K2-01): eski modal başlığı yok; NavBar tek üst çubuk, tek kapatma kontrolü, diyalog adı LargeTitle'dan gelir.
{
  const kao = require('./helpers/kao-harness');
  const t = kao.bootKao({ seeded: true });
  const lemmaId = t.win.QuranLexiconV1.lemmas[0].id;
  const views = [['home'], ['units'], ['word', lemmaId], ['reader', 112], ['settings'], ['gate'], ['phonics'], ['ayah'], ['prayer'], ['stats'], ['grammar'], ['roots'], ['s0'], ['sources'], ['map']];
  const closeControls = (html) => (html.match(/class="kao-navbar-action"[^>]*>Kapat</g) || []).length + (html.match(/class="kao-focus-exit"/g) || []).length + (html.match(/class="kao-close"/g) || []).length;
  const checkChrome = (name, html) => {
    assert.doesNotMatch(html, /kao-header|kao-close/, `${name}: eski modal başlığı/X kalmamalı`);
    assert.equal((html.match(/<nav class="kao-navbar/g) || []).length, 1, `${name}: tek üst çubuk`);
    const label = /id="sey-ov-card"[^>]*aria-labelledby="([^"]+)"/.exec(html);
    assert.ok(label, `${name}: diyalog aria-labelledby taşır`);
    assert.equal((html.match(new RegExp(`id="${label[1]}"`, 'g')) || []).length, 1, `${name}: etiket hedefi tek ve var`);
    assert.match(html, new RegExp(`<div class="kao-largetitle">[\\s\\S]*?<h2\\b[^>]*id="${label[1]}"`), `${name}: diyalog adı LargeTitle başlığıdır`);
    assert.doesNotMatch(html, /Günlük öğrenme|Kelimelerini tanı, âyetleri anla/, `${name}: sabit modal başlığı metni yok`);
  };
  for (const [view, param] of views) {
    const opened = kao.openView(t, view, param);
    assert.equal(opened.ok, true, `${view} açılmalı`);
    checkChrome(view, opened.html);
    const isRoot = view === 'home';
    assert.equal(closeControls(opened.html), isRoot ? 1 : 0, `${view}: kapatma yalnız kökte (NavBar Kapat); diğerlerinde NavBar geri`);
  }
  // K2F-28 (K4-03): odak modu — oturumda NavBar/LargeTitle yok; yalnız ✕ ("Dersten çık", ≥44 px) + tek ince ilerleme çubuğu.
  const focusChecks = (name, html, label = 'Dersten çık') => {
    assert.doesNotMatch(html, /kao-header|kao-close|<nav class="kao-navbar|kao-largetitle/, `${name}: NavBar/LargeTitle/eski başlık yok`);
    assert.equal((html.match(new RegExp(`class="kao-focus-exit"[^>]*aria-label="${label}"`, 'g')) || []).length, 1, `${name}: tek ✕ (${label})`);
    assert.equal(closeControls(html), 1, `${name}: tek kapatma kontrolü`);
    assert.equal((html.match(/role="progressbar"/g) || []).length, 1, `${name}: tek ince ilerleme çubuğu`);
    assert.match(html, /id="sey-ov-card"[^>]*aria-label(?:ledby)?="[^"]+"/, `${name}: diyalog adı var`);
  };
  kao.openView(t, 'units');
  t.api.kaoLesson('start', 'u01.01');
  let stages = 0;
  for (let step = 0; step < 8 && t.ui.kaoView === 'session'; step += 1) {
    focusChecks(`ders/${step}`, t.api.kaoOverlayHTML(t.NOW));
    stages += 1;
    t.api.kaoLesson('next');
  }
  assert.ok(stages >= 2, 'ders birden çok aşamada odak çubuğuyla çizilmeli');
  // Ders ✕'i Bugün'e (home) döner.
  {
    const t2 = kao.bootKao({ seeded: true });
    t2.api.kaoLesson('start', 'u01.01');
    assert.match(t2.api.kaoOverlayHTML(t2.NOW), /class="kao-focus-exit" onclick="App\.kaoLesson\(&quot;exit&quot;\)"/);
    assert.equal(t2.api.kaoLesson('exit'), true);
    assert.equal(t2.ui.kaoView, 'home', 'ders ✕ sonrası Bugün');
  }
  // Ders ✕'inden sonra açılan tekrar oturumu eski ders durumunu taşımaz: etiket "Oturumdan çık", ✕ ders kaydına dokunmaz.
  {
    const t4 = kao.bootKao({ seeded: true });
    t4.api.kaoLesson('start', 'u01.01');
    t4.api.kaoLesson('next');
    t4.api.kaoLesson('exit');
    assert.ok(t4.ui.kaoLesson, 'ders ✕ sonrası bellekteki ders durumu devam için korunur');
    t4.api.kaoStart(5);
    assert.equal(t4.ui.kaoLesson, null, 'tekrar oturumu başlayınca eski ders durumu temizlenir');
    const html = t4.api.kaoOverlayHTML(t4.NOW);
    focusChecks('ders→tekrar', html, 'Oturumdan çık');
    const before = JSON.stringify((t4.data.quranLearn && t4.data.quranLearn.lessons) || {});
    t4.api.kaoLesson('exit');
    assert.equal(JSON.stringify((t4.data.quranLearn && t4.data.quranLearn.lessons) || {}), before, 'tekrar ✕ ders kaydını değiştirmez');
    assert.equal(t4.ui.kaoView, 'home');
  }
  // Tekrar oturumu (ders dışı): aynı odak çubuğu; ✕ kaoLesson('exit') ile Bugün'e döner.
  {
    const t3 = kao.bootKao({ seeded: true });
    t3.api.kaoStart(5);
    assert.equal(t3.ui.kaoView, 'session');
    const html = t3.api.kaoOverlayHTML(t3.NOW);
    focusChecks('tekrar', html, 'Oturumdan çık');
    assert.match(html, /class="kao-focus-exit" onclick="App\.kaoLesson\(&quot;exit&quot;\)"/);
    assert.equal(t3.api.kaoLesson('exit'), true);
    assert.equal(t3.ui.kaoView, 'home', 'tekrar ✕ sonrası Bugün');
  }
}

console.log('KAO2 navigation: PASS (yığın geri dönüşü, görünüm başlıkları, kök kapat, Escape sözleşmesi)');
