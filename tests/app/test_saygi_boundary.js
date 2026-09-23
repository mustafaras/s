#!/usr/bin/env node
// MON-23 — Saygı domain registry, lazy content ve modal/focus sınırı.
// Bu fixture yalnızca node:vm kullanır; browser, ağ, gerçek localStorage ve
// kullanıcı verisi yoktur. SaygiPeople/HijriCalendar yükleme anında değil,
// çağrı anında çözülür; app.js yalnızca imza koruyan shimleri taşır.

'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const saygiSource = fs.readFileSync(path.join(repoRoot, 'app/core/saygi.js'), 'utf8');
const appSource = fs.readFileSync(path.join(repoRoot, 'app.js'), 'utf8');
const indexSource = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
// MON-22 parent source and MON-23 registry output were compared with the
// same synthetic icon/escape bag: 1219 bytes, this SHA-256.
const EXPECTED_PARENT_PREVIEW_HASH = 'c69bee63eadfd109b8daa51b438e580ea6e88e7339356b21bfd534e0a853cf86';
let passed = 0;
let failed = 0;

function ok(name, condition, detail) {
  if (condition) { passed++; console.log('PASS  ' + name); }
  else { failed++; console.log('FAIL  ' + name + (detail ? ' — ' + detail : '')); }
}

function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const counters = { storage: 0, fetch: 0, timers: 0 };
const state = {
  days: { '2026-09-04': { reading: { entries: [] } } },
  zikr: { sessions: {} },
  settings: { prayer: { hijriOffset: 1 } }
};
const ui = {
  faithTab: 'oz', saygiPersonOpen: true, saygiBrowseId: 'ada',
  saygiArticle: null, saygiLoading: false, saygiError: null,
  saygiReadReady: false, saygiRequestId: 0, qiblaHeading: null,
  qiblaListening: false, qiblaSensorSource: '', qiblaAccuracy: null,
  qiblaSensorError: ''
};

const sandbox = {
  console,
  URL,
  URLSearchParams,
  Date,
  Math,
  JSON,
  Object,
  Array,
  String,
  Number,
  Boolean,
  RegExp,
  Error,
  Promise,
  Set,
  Map,
  Intl,
  encodeURIComponent,
  decodeURIComponent,
  isNaN,
  isFinite,
  localStorage: {
    getItem() { counters.storage++; return null; },
    setItem() { counters.storage++; },
  },
  fetch() { counters.fetch++; return Promise.reject(new Error('network forbidden')); },
  setTimeout() { counters.timers++; return 0; },
  clearTimeout() {},
  document: {},
  SaygiPeople: undefined,
  HijriCalendarV1: undefined,
  SeymaPrayer: {
    PRAYER_ORDER: ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'],
    PRAYER_NAMES: { fajr: 'İmsak', sunrise: 'Güneş', dhuhr: 'Öğle', asr: 'İkindi', maghrib: 'Akşam', isha: 'Yatsı' },
    prayerSettings() { return { hijriOffset: 1 }; },
    prayerLocation() { return { lat: 39.9334, lon: 32.8597, cityName: 'Ankara', source: 'fixture' }; },
    ensurePrayerDay(day) { return day && day.prayer || {}; },
    prayerDaySummary() { return { performed: 2, congregation: 1, madeUp: 0 }; },
    prayerHistoryPresentation() { return { records: [], trackedPerformed: 0, sourceRecordCount: 0, historicalSunrise: null, denominatorReliable: false, rate: null, uncertainty: 'Belirsiz tarihsel kayıt.' }; },
    prayerStreak() { return 3; },
    prayerTimesFromDay() { return { fajr: { time: '05:12' }, dhuhr: { time: '13:02' } }; },
    currentPrayerIndex() { return 0; },
    nextPrayerInfo() { return { key: 'dhuhr', name: 'Öğle', label: '2 saat' }; },
    emptyPrayerEntry() { return {}; }
  }
};
sandbox.window = sandbox;
sandbox.self = sandbox;
sandbox.globalThis = sandbox;
const context = vm.createContext(sandbox);
vm.runInContext(saygiSource, context, { filename: 'app/core/saygi.js' });
const registry = sandbox.SeymaSaygi;

ok('module load sırasında registry expose edilir', registry && typeof registry.registerSaygi === 'function');
ok('module load sırasında storage/ağ/timer açılmaz', counters.storage === 0 && counters.fetch === 0 && counters.timers === 0);
ok('eksik dependency bag fail-closed olur', registry.registerSaygi({}) === false);

const deps = {
  data: () => state,
  ui: () => ui,
  getDay: (data, date) => data.days[date] || (data.days[date] = { reading: { entries: [] } }),
  todayStr: () => '2026-09-04',
  addDays: (date, amount) => amount < 0 ? '2026-09-03' : '2026-09-05',
  diffDays: (from, to) => Math.round((new Date(to) - new Date(from)) / 86400000),
  dayIndexFor: () => 1,
  dateLabelTR: (date) => date,
  icon: (name) => '<svg data-icon="' + esc(name) + '"></svg>',
  esc,
  featuresLive: () => false,
  render: () => {},
  quranJourneyHubCardHTML: () => '<div data-quran-fixture></div>',
  zikrVisible: () => true,
  zikrPreviewCardHTML: () => '<div data-zikr-fixture></div>'
};
ok('geçerli dependency bag kaydolur', registry.registerSaygi(deps) === true);
ok('registry tek seferlik kayıt sınırını korur', registry.registerSaygi(deps) === false);

sandbox.SaygiPeople = [{ id: 'ada', name: 'Ada Lovelace', kind: 'Bilim', era: '19. yy', field: 'Matematik' }];
ok('SaygiPeople ilk çağrıda lazy okunur', registry.saygiCurrentPerson().id === 'ada');
sandbox.SaygiPeople = [{ id: 'grace', name: 'Grace Hopper', kind: 'Bilim', era: '20. yy', field: 'Bilgisayar bilimi' }];
ok('SaygiPeople değişimi sonraki çağrıda görünür', registry.saygiCurrentPerson().id === 'grace' && registry.saygiPeople()[0].id === 'grace');

ok('HijriCalendar yokken güvenli fallback korunur', typeof registry.hijriTodayStr() === 'string');
sandbox.HijriCalendarV1 = {
  todayStr(date, offset) { return 'Hicri ' + date + ' +' + offset; },
  holyDay(date) { return date === '2026-09-04' ? 'Kandil fixture' : ''; }
};
ok('HijriCalendar registry sonrası çağrı anında çözülür', registry.hijriTodayStr() === 'Hicri 2026-09-04 +1');
ok('kandil shimi lazy content ile çalışır', registry.kandilBadgeFor('2026-09-04') === 'Kandil fixture');
ok('tarihsel KPI güvenilmez payda/yüzde üretmez', (function () { const k = registry.faithWeekKPIs('2026-09-04'); return k.maxPrays === null && k.rate === null && k.denominatorReliable === false; })());
ok('ritim modeli üç faaliyeti ayırır ve güvenilmez yüzdeyi kapatır', (function () { const k = registry.faithRhythmWeek('2026-09-04'); return k.totals && typeof k.totals.vakit === 'number' && typeof k.totals.zikr === 'number' && typeof k.totals.okuma === 'number' && k.rate === null && k.denominatorReliable === false; })());

const person = sandbox.SaygiPeople[0];
const previewDump = registry.saygiPreviewCardHTML(person, false, null);
const previewHash = crypto.createHash('sha256').update(previewDump).digest('hex');
console.log('INFO  Saygı preview dump sha256=' + previewHash + ' bytes=' + Buffer.byteLength(previewDump, 'utf8'));
ok('Saygı preview dumpı deterministic ve temel kimlikleri taşır',
  previewDump.includes('id="saygi-preview-card"') && previewDump.includes('Grace Hopper') && previewHash === EXPECTED_PARENT_PREVIEW_HASH,
  previewHash);
ok('Saygı root okunmuş kayıt için tek state yüzeyini kullanır', (function () {
  registry.saygiMarkRead(person);
  return state.saygi && state.saygi.collection.grace && registry.saygiReadCount() === 1;
})());
ok('kıble saf metrikleri registryde', (function () {
  const metrics = registry.qiblaMetrics(sandbox.SeymaPrayer.prayerLocation(), null);
  return metrics && metrics.isFallback === false && metrics.bearing > 0 && metrics.distanceKm > 0 && registry.qiblaScreenAngle() === 0;
})());

function focusContract(html) {
  return html.includes('role="dialog"') && html.includes('aria-modal="true"') &&
    html.includes('tabindex="-1"') && html.includes('onkeydown="App.onModalKeydown(event,');
}
const faithHtml = registry.faithCornerOverlayHTML();
const qiblaHtml = registry.qiblaOverlayHTML();
const personHtml = registry.saygiPersonModalHTML();
ok('İman modalı keyboard contract ile render olur', focusContract(faithHtml));
ok('Kıble modalı keyboard contract ile render olur', focusContract(qiblaHtml));
ok('Öncü modalı keyboard contract ile render olur', focusContract(personHtml));
ok('Saygı floating Okudum eylemi korunur', registry.saygiFloatingReadHTML().includes('>Okudum</strong>'));
ok('arka plan modal kabukları focusable button değildir', ![faithHtml, qiblaHtml, personHtml].some((html) => html.includes('role="button" tabindex="0"')));
ok('Saygı/İman/Kıble HTML kaynakları registry shiminden gelir',
  /function saygiHTML\(\)\{ return SEYMA_RENDER\.saygiHTML/.test(appSource) &&
  /function faithCornerOverlayHTML\(\)\{ return window\.SeymaSaygi\.faithCornerOverlayHTML/.test(appSource) &&
  /function qiblaOverlayHTML\(\)\{ return window\.SeymaSaygi\.qiblaOverlayHTML/.test(appSource) &&
  /function saygiPersonModalHTML\(\)\{ return window\.SeymaSaygi\.saygiPersonModalHTML/.test(appSource));
ok('index saygi registryyi quran sonrasında cache-bust ile yükler',
  indexSource.indexOf('src="app/core/quran.js?v=') < indexSource.indexOf('src="app/core/saygi.js?v=') &&
  indexSource.indexOf('src="app/core/saygi.js?v=') < indexSource.indexOf('src="app.js?v='));

console.log(`\nMON-23 Saygı sınırı: ${passed} PASS, ${failed} FAIL`);
if (failed) process.exitCode = 1;
