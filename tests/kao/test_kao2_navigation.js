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
  'app/content/quranPhonicsV1.js'
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

const data = { quranLearn: api.emptyQuranLearn(), settings: { targetBed: '23:00' }, quranJourney: { requests: {} } };
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
  ['map', undefined, 'Mushaf haritası'],
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

console.log('KAO2 navigation: PASS (yığın geri dönüşü, görünüm başlıkları, kök kapat, Escape sözleşmesi)');
