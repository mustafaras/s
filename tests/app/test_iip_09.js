#!/usr/bin/env node
// IIP-09 — beş bölüm hedef bilgi mimarisi.
// No-network/node:vm fixture; mevcut App handler kimlikleri ve kart davranışı
// korunurken görünür sekme adları ile yüzey sahipliği doğrulanır.

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const saygiSource = fs.readFileSync(path.join(root, 'app/core/saygi.js'), 'utf8');
const cssSource = fs.readFileSync(path.join(root, 'app/styles.css'), 'utf8');
const appSource = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
let passed = 0;
let failed = 0;
function check(name, condition, detail) {
  if (condition) {
    passed++;
    console.log('PASS  ' + name);
  } else {
    failed++;
    console.log('FAIL  ' + name + (detail ? ' — ' + detail : ''));
  }
}

function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const person = { id: 'ada', name: 'Ada Lovelace', kind: 'Bilim', era: '19. yy', field: 'Matematik' };
const state = { days: { '2026-09-20': {} }, saygi: { collection: {}, streak: 0 } };
const ui = { tab: 'saygi', faithTab: 'oz', saygiArticle: null, saygiPersonOpen: false };
let quranCardState = 'ready';
const sandbox = {
  console, URL, URLSearchParams, Date, Math, JSON, Object, Array, String,
  Number, Boolean, RegExp, Error, Promise, Set, Map, Intl, encodeURIComponent,
  decodeURIComponent, isNaN, isFinite, document: {}, window: {}, self: {}, globalThis: {},
  SaygiPeople: [person], HijriCalendarV1: undefined,
  SeymaPrayer: {
    PRAYER_ORDER: ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'],
    PRAYER_NAMES: { fajr: 'Sabah', sunrise: 'Güneş', dhuhr: 'Öğle', asr: 'İkindi', maghrib: 'Akşam', isha: 'Yatsı' },
    ensurePrayerDay: () => ({ fetchedAt: '2026-09-20T08:00:00Z', fetchedMethod: 'diyanet' }),
    prayerLocation: () => ({ cityName: 'Ankara', source: 'city' }),
    prayerDaySummary: () => ({ performed: 2, congregation: 1, madeUp: 0, late: 0, nafile: 0, total: 6 }),
    prayerStreak: () => 1,
    prayerTimesFromDay: () => ({ fajr: '05:00', sunrise: '06:30', dhuhr: '12:45', asr: '16:20', maghrib: '19:00', isha: '20:30' }),
    currentPrayerIndex: () => 0,
    emptyPrayerEntry: () => ({ time: '--:--' })
  },
  SeymaZikr: { zikrWeek: () => ({ total: 4, days: 1 }) }
};
sandbox.window = sandbox;
sandbox.self = sandbox;
sandbox.globalThis = sandbox;
const context = vm.createContext(sandbox);
vm.runInContext(saygiSource, context, { filename: 'app/core/saygi.js' });
const registry = sandbox.SeymaSaygi;
function addDaysFixture(value, amount) {
  const parts = String(value).split('-').map(Number);
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  date.setDate(date.getDate() + Number(amount || 0));
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
}
const deps = {
  data: () => state, ui: () => ui, getDay: () => ({}), todayStr: () => '2026-09-20',
  addDays: addDaysFixture, diffDays: () => 0, dayIndexFor: () => 1,
  dateLabelTR: value => value, icon: name => '<svg data-icon="' + esc(name) + '"></svg>', esc,
  featuresLive: () => true, render: () => {}, quranJourneyHubCardHTML: () => '<article id="quran-journey-card" class="quran-v2-preview" data-state="' + quranCardState + '">Kur’an kartı</article>',
  zikrVisible: () => true, zikrPreviewCardHTML: () => '<article class="zikr-v2-preview">Zikir</article>',
  prayer: true
};
check('IIP-09 registry boots with a dependency bag', registry && registry.registerSaygi(deps) === true);
check('second registration remains fail-closed', registry.registerSaygi(deps) === false);

const nav = registry.faithNavHTML();
check('REQ-017 visible names are Bugün/İlham/İbadet/Zikir/Ritim',
  ['Bugün', 'İlham', 'İbadet', 'Zikir', 'Ritim'].every(label => nav.includes('<b>' + label + '</b>')));
check('REQ-017 existing faith handler ids remain stable',
  ['oz', 'oncu', 'iman', 'zikir', 'rapor'].every(id => nav.includes("App.setFaithTab('" + id + "')")));
check('REQ-017 navigation keeps selected-page semantics',
  nav.includes('aria-current="page"') && nav.includes('aria-pressed="true"') &&
  nav.includes('data-legacy-label="Öz"'));

ui.faithTab = 'oz';
const today = registry.saygiPreviewHubHTML(person, null, false);
check('REQ-017 Bugün keeps a continuation surface',
  today.includes('data-faith-tab="oz"') && today.includes('iip-09-today-continue') &&
  today.includes('zikr-v2-preview'));
check('REQ-017 full Quran card belongs to Bugün and qibla does not',
  today.includes('quran-journey-card') && !today.includes('qibla-card'));

ui.faithTab = 'oncu';
const inspiration = registry.saygiPreviewHubHTML(person, null, false);
check('REQ-017 İlham preserves the pioneer entry',
  inspiration.includes('data-faith-tab="oncu"') && inspiration.includes('saygi-preview'));

ui.faithTab = 'iman';
const worship = registry.saygiPreviewHubHTML(person, null, false);
check('REQ-017 İbadet keeps prayer and owns the qibla tool only',
  worship.includes('data-faith-tab="iman"') && worship.includes('faith-preview-card') &&
  worship.includes('qibla-card') && !worship.includes('quran-journey-card'));

ui.faithTab = 'zikir';
const zikr = registry.saygiPreviewHubHTML(person, null, false);
check('REQ-017 Zikir keeps the existing zikir surface',
  zikr.includes('data-faith-tab="zikir"') && zikr.includes('zikr-v2-preview'));

ui.faithTab = 'rapor';
const rhythm = registry.saygiPreviewHubHTML(person, null, false);
check('REQ-017 Ritim keeps the existing report surface',
  rhythm.includes('data-faith-tab="rapor"') && rhythm.includes('sg-faith-hero'));

check('REQ-017 old deep-link handler identities remain in the runtime source',
  saygiSource.includes('App.openQibla()') && saygiSource.includes('App.openFaithCorner()') &&
  appSource.includes('App.openQuranJourney') && appSource.includes('App.closeQuranJourney'));
check('REQ-017 route ownership is tab-scoped instead of a shared rail',
  /tab==='iman'.*qiblaHubCardHTML\(\)/.test(saygiSource) &&
  /else body=.*quranHub\(\)/.test(saygiSource) &&
  !/routeRail=.*qiblaHubCardHTML\(\)\+quranHub\(\)/.test(saygiSource));
check('REQ-018 tab anchor is explicit and narrow',
  cssSource.includes('.iip-09-section') && cssSource.includes('.iip-09-route-rail') &&
  cssSource.includes('@media(max-width:389px)'));

quranCardState = 'loading';
ui.faithTab = 'oz';
check('TC-017 loading state stays inside the Bugün Quran entry',
  registry.saygiPreviewHubHTML(person, null, false).includes('data-state="loading"'));
quranCardState = 'error';
check('TC-017 error state stays inside the Bugün Quran entry',
  registry.saygiPreviewHubHTML(person, null, false).includes('data-state="error"'));
quranCardState = 'empty';
check('TC-017 empty state stays inside the Bugün Quran entry',
  registry.saygiPreviewHubHTML(person, null, false).includes('data-state="empty"'));

function sourceBetween(start, end) {
  const from = appSource.indexOf(start);
  const to = appSource.indexOf(end, from);
  if (from < 0 || to < 0) throw new Error('source markers missing: ' + start);
  return appSource.slice(from, to);
}
const modalScroll = { scrollTop: 317 };
const focusCounts = { quran: 0, qibla: 0, screen: 0, dialog: 0 };
const modalElements = {
  'quran-journey-card': { id: 'quran-journey-card', focus: () => { focusCounts.quran++; } },
  'qibla-card': { id: 'qibla-card', focus: () => { focusCounts.qibla++; } },
  'quran-screen': { id: 'quran-screen', focus: () => { focusCounts.screen++; } },
  'qibla-dialog': { id: 'qibla-dialog', focus: () => { focusCounts.dialog++; } }
};
let popstateHandler = null;
let renderCount = 0;
const modalUi = { faithTab: 'oz', quranJourneyOpen: false, qiblaOpen: false };
const modalSandbox = {
  ui: modalUi,
  App: { refreshQuranUpdates: () => {} },
  window: {
    SeyFx: null,
    addEventListener: (name, fn) => { if (name === 'popstate') popstateHandler = fn; },
    removeEventListener: () => {}
  },
  document: {
    activeElement: modalElements['quran-journey-card'],
    querySelector: selector => selector === '[data-scroll]' ? modalScroll : null,
    getElementById: id => modalElements[id] || null
  },
  render: () => { renderCount++; },
  quranLockBodyScroll: () => {}, quranUnlockBodyScroll: () => {},
  focusModalDialog: id => { const el = modalElements[id]; if (el) el.focus(); },
  _qiblaOrientationHandler: null, _qiblaSmoothHeading: null, _qiblaAbsoluteSeen: false,
  console
};
modalSandbox.window.window = modalSandbox.window;
const modalContext = vm.createContext(modalSandbox);
vm.runInContext(sourceBetween('var _iipModalReturn=', '// ── QY-11:'), modalContext);
vm.runInContext(sourceBetween('App.openQuranJourney=function(){', 'App.openQuranSurah=function(id){'), modalContext);
vm.runInContext(sourceBetween('App.openQibla=function(){', 'var _qiblaOrientationHandler='), modalContext);
vm.runInContext(sourceBetween('App.closeQibla=function(){', 'App.qiblaBearing='), modalContext);
vm.runInContext("window.addEventListener('popstate',function(){ if(ui.quranJourneyOpen){ App.closeQuranJourney(); return; } if(ui.qiblaOpen) App.closeQibla(); });", modalContext);

modalSandbox.App.openQuranJourney();
modalSandbox.App.openQuranJourney();
modalScroll.scrollTop = 0;
modalSandbox.App.closeQuranJourney();
modalSandbox.App.closeQuranJourney();
check('TC-018 rapid Quran open/close is idempotent and restores focus/scroll/tab',
  renderCount === 2 && modalUi.quranJourneyOpen === false && focusCounts.quran === 1 &&
  modalScroll.scrollTop === 317 && modalUi.faithTab === 'oz');

modalSandbox.document.activeElement = modalElements['qibla-card'];
modalScroll.scrollTop = 211;
modalSandbox.App.openQibla();
modalSandbox.App.openQibla();
modalScroll.scrollTop = 0;
popstateHandler();
popstateHandler();
check('TC-018 browser back closes one qibla modal without a duplicate or empty shell',
  modalUi.qiblaOpen === false && focusCounts.qibla === 1 && modalScroll.scrollTop === 211 &&
  modalUi.faithTab === 'oz' && renderCount === 4);

ui.saygiBrowseId = person.id;
ui.saygiPersonOpen = true;
ui.saygiLoading = true;
check('TC-017 pioneer modal renders a real loading shell', registry.saygiPersonModalHTML().includes('saygi-loading'));
ui.saygiLoading = false;
ui.saygiError = 'Ağ yok';
check('TC-017 pioneer modal renders a real error and retry shell',
  registry.saygiPersonModalHTML().includes('saygi-error') && registry.saygiPersonModalHTML().includes('App.refreshSaygi()'));
ui.saygiPersonOpen = false;
ui.saygiBrowseId = null;
quranCardState = 'ready';

/* P07: regex `=(?!=)` — çıplak `=` meşru `==` okumasını yakalıyordu. Kanıt:
   saygi.js'te gerçek App ataması YOK (0), migrate( YOK (0), fetch( YOK (0)). */
check('scope contract: no migration/storage/network behavior was added',
  !/App\.[A-Za-z0-9_]+\s*=(?!=)/.test(saygiSource) &&
  !saygiSource.includes('migrate(') && saygiSource.includes('function saygiLoadArticle'));

console.log(`\nIIP-09 information architecture contract: ${passed} PASS, ${failed} FAIL`);
if (failed) process.exitCode = 1;
