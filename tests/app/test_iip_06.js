#!/usr/bin/env node
// IIP-06 — İbadet ve kıble görsel birlik.
// No-network/node:vm fixture: six vakit rows, source/location status, empty/error
// cache states, sensor-rejected/live qibla states and return controls.

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const saygiSource = fs.readFileSync(path.join(repoRoot, 'app/core/saygi.js'), 'utf8');
const cssSource = fs.readFileSync(path.join(repoRoot, 'app/styles.css'), 'utf8');
let passed = 0;
let failed = 0;

function check(name, condition, detail) {
  if (condition) {
    passed += 1;
    console.log('PASS  ' + name);
  } else {
    failed += 1;
    console.log('FAIL  ' + name + (detail ? ' — ' + detail : ''));
  }
}

function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const date = '2026-09-20';
const order = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
const names = { fajr: 'İmsak', sunrise: 'Güneş', dhuhr: 'Öğle', asr: 'İkindi', maghrib: 'Akşam', isha: 'Yatsı' };
const state = {
  startDate: '2026-06-24',
  settings: { prayer: { method: 'diyanet', hijriOffset: 1 } },
  days: {
    [date]: {
      prayer: {
        fajr: { time: '05:12', performed: true, inCongregation: false, late: false, madeUp: false, nafile: 0, note: '' },
        sunrise: { time: '06:42', performed: false, inCongregation: false, late: false, madeUp: false, nafile: 0, note: '' },
        dhuhr: { time: '13:02', performed: true, inCongregation: true, late: false, madeUp: false, nafile: 2, note: 'öğle notu' },
        asr: { time: '16:42', performed: false, inCongregation: false, late: true, madeUp: false, nafile: 0, note: '' },
        maghrib: { time: '19:54', performed: false, inCongregation: false, late: false, madeUp: true, nafile: 0, note: '' },
        isha: { time: '21:20', performed: false, inCongregation: false, late: false, madeUp: false, nafile: 0, note: '' },
        fetchedAt: '2026-09-20T10:30:00Z', fetchedFor: '39.9334,32.8597,Ankara', fetchedMethod: 'diyanet', fetchError: ''
      }
    }
  },
  saygi: { collection: {}, streak: 0, lastReadDate: '' }
};
const ui = {
  faithTab: 'iman',
  qiblaHeading: null,
  qiblaListening: false,
  qiblaSensorSource: '',
  qiblaAccuracy: null,
  qiblaSensorError: ''
};
const location = { lat: 39.9334, lon: 32.8597, cityName: 'Ankara', source: 'gps', accuracy: 18 };
const sandbox = {
  console,
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
  isNaN,
  isFinite,
  encodeURIComponent,
  decodeURIComponent,
  localStorage: { getItem() { return null; }, setItem() {} },
  fetch() { throw new Error('network forbidden'); },
  setTimeout() { throw new Error('timer forbidden'); },
  clearTimeout() {},
  document: {},
  screen: { orientation: { angle: 0 } },
  orientation: 0,
  SaygiPeople: [{ id: 'ada', name: 'Ada Lovelace', kind: 'Bilim', era: '19. yy', field: 'Matematik' }],
  HijriCalendarV1: {
    todayStr() { return 'Hicri 1448'; },
    holyDay() { return ''; }
  },
  SeymaPrayer: {
    PRAYER_ORDER: order,
    PRAYER_NAMES: names,
    prayerSettings() { return state.settings.prayer; },
    prayerMethod() { return state.settings.prayer.method; },
    prayerLocation() { return location; },
    ensurePrayerDay(day) { return day.prayer; },
    prayerDaySummary() { return { total: 6, performed: 2, congregation: 1, madeUp: 1, late: 1, nafile: 2 }; },
    prayerStreak() { return 3; },
    prayerTimesFromDay(p) { return Object.fromEntries(order.map(key => [key, p[key] && p[key].time || ''])); },
    currentPrayerIndex() { return 1; },
    nextPrayerInfo() { return { key: 'dhuhr', name: 'Öğle', label: '2 saat' }; },
    emptyPrayerEntry() { return { time: '', performed: false, inCongregation: false, late: false, madeUp: false, nafile: 0, note: '' }; },
    prayerCityOptionsHTML(selected) { return '<option selected>' + esc(selected || 'Ankara') + '</option>'; }
  }
};
sandbox.window = sandbox;
sandbox.self = sandbox;
sandbox.globalThis = sandbox;
const context = vm.createContext(sandbox);
vm.runInContext(saygiSource, context, { filename: 'app/core/saygi.js' });
const registry = sandbox.SeymaSaygi;
const deps = {
  data: () => state,
  ui: () => ui,
  getDay: (data, key) => data.days[key],
  todayStr: () => date,
  addDays: (value, amount) => amount < 0 ? '2026-09-19' : '2026-09-21',
  diffDays: () => 0,
  dayIndexFor: () => 1,
  dateLabelTR: value => value,
  icon: name => '<svg data-icon="' + esc(name) + '"></svg>',
  esc,
  featuresLive: () => true,
  render: () => {},
  quranJourneyHubCardHTML: () => '',
  zikrVisible: () => false,
  zikrPreviewCardHTML: () => ''
};

check('IIP-06 registry boot is available', registry && registry.registerSaygi(deps) === true);
check('rendered fixture opens no network, storage or timer', registry && registry.registerSaygi(deps) === false);

const faithHtml = registry.faithCornerOverlayHTML();
check('REQ-011 positive: all six existing vakit rows remain reachable', (faithHtml.match(/class="sg-faith-row(?: |\")/g) || []).length === 6, 'rowCount=' + ((faithHtml.match(/class="sg-faith-row(?: |\")/g) || []).length));
check('REQ-011 positive: time, record and detail have separate surfaces', faithHtml.includes('sg-faith-row-time') && faithHtml.includes('sg-faith-row-detail') && faithHtml.includes('sg-faith-row-controls'));
check('REQ-011 positive: method, precision and data status are explicit', faithHtml.includes('sg-faith-source') && faithHtml.includes('Yöntem') && faithHtml.includes('Konum hassasiyeti') && faithHtml.includes('Veri durumu'));
check('REQ-011 positive: source and GPS precision preserve current values', faithHtml.includes('Diyanet yöntemi') && faithHtml.includes('GPS konumu') && faithHtml.includes('±18 m hassasiyet'));
check('REQ-011 positive: existing record handlers remain on every row', order.every(key => faithHtml.includes("App.togglePrayer('" + key + "'")) && order.every(key => faithHtml.includes("App.setPrayerNote('" + key + "'")));
check('REQ-011 positive: record controls expose pressed state', faithHtml.includes('aria-pressed="true"') && faithHtml.includes('aria-pressed="false"') && faithHtml.includes('Kayıt'));
check('REQ-011 positive: modal return/close keyboard contract remains', faithHtml.includes('role="dialog"') && faithHtml.includes('aria-modal="true"') && faithHtml.includes('App.closeFaithCorner'));

const emptyDay = state.days[date].prayer;
for (const key of order) emptyDay[key].time = '';
emptyDay.fetchedAt = '';
emptyDay.fetchedMethod = '';
emptyDay.fetchError = '';
const emptyFaithHtml = registry.faithCornerOverlayHTML();
check('REQ-011 negative: empty times stay readable and never become fake values', emptyFaithHtml.includes('sg-faith-row is-empty') && emptyFaithHtml.includes('Saat bekleniyor') && emptyFaithHtml.includes('>—</strong>'));
check('REQ-011 negative: empty fetch state is distinguished from record state', emptyFaithHtml.includes('Saatler bekleniyor') && emptyFaithHtml.includes('Kayıt yok'));

emptyDay.fetchError = 'Zaman servisi kapalı';
const errorFaithHtml = registry.faithCornerOverlayHTML();
check('REQ-011 error: fetch error gets its own status tone and escaped detail', errorFaithHtml.includes('is-error') && errorFaithHtml.includes('Zaman servisi kapalı'));

ui.qiblaHeading = null;
ui.qiblaListening = false;
ui.qiblaSensorSource = '';
ui.qiblaAccuracy = null;
ui.qiblaSensorError = '';
const idleQiblaHtml = registry.qiblaOverlayHTML();
check('REQ-012 positive: calculated target, device heading and precision are separate', idleQiblaHtml.includes('HESAPLANAN YÖN') && idleQiblaHtml.includes('CİHAZ YÖNÜ') && idleQiblaHtml.includes('KONUM HASSASİYETİ'));
check('REQ-012 negative: no sensor does not present a live needle as active', idleQiblaHtml.includes('qibla-v2-needle is-idle') && idleQiblaHtml.includes('qibla-live-heading">—') && idleQiblaHtml.includes('Canlı yön bekleniyor'));
check('REQ-012 negative: no-sensor copy keeps calculation visible', idleQiblaHtml.includes('gerçek kuzeyden saat yönünde') && idleQiblaHtml.includes('Kıble doğrultusu; canlı hizalama durumu aşağıdaki kartta'), 'bearingCopy=' + idleQiblaHtml.includes('gerçek kuzeyden saat yönünde') + ' needleCopy=' + idleQiblaHtml.includes('Kıble doğrultusu; canlı hizalama durumu aşağıdaki kartta'));

ui.qiblaSensorError = 'Pusula izni verilmedi.';
const rejectedQiblaHtml = registry.qiblaOverlayHTML();
check('REQ-012 error: sensor rejection is a visible alert without changing the target calculation', rejectedQiblaHtml.includes('id="qibla-live-error"') && rejectedQiblaHtml.includes('role="alert"') && rejectedQiblaHtml.includes('Pusula izni verilmedi.') && rejectedQiblaHtml.includes('HESAPLANAN YÖN'));

ui.qiblaHeading = 123.4;
ui.qiblaListening = true;
ui.qiblaSensorSource = 'absolute';
ui.qiblaAccuracy = 5;
ui.qiblaSensorError = '';
const liveQiblaHtml = registry.qiblaOverlayHTML();
check('REQ-012 positive: live device state preserves current sensor readings', !liveQiblaHtml.includes('qibla-v2-needle is-idle') && liveQiblaHtml.includes('123,4°') && liveQiblaHtml.includes('Mutlak cihaz yönü · ±5°'));
check('REQ-012 return: qibla card and dialog keep the existing open/close route', registry.qiblaHubCardHTML().includes('App.openQibla()') && liveQiblaHtml.includes('App.closeQibla()'));

check('style contract: shared meta grid and six-row wrap safety are explicit', cssSource.includes('.sg-tool-meta-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))') && cssSource.includes('.sg-faith-row-head{display:grid;grid-template-columns:minmax(0,1fr) auto') && cssSource.includes('overflow-wrap:anywhere'));
check('style contract: narrow viewport and reduced motion states are explicit', cssSource.includes('@media(max-width:370px)') && cssSource.includes('@media(prefers-reduced-motion:reduce)') && cssSource.includes('.qibla-v2-needle.is-idle'));
check('scope contract: no migration, App assignment or live data behavior was added', !saygiSource.includes('migrate(') && !/App\.[A-Za-z0-9_]+\s*=/.test(saygiSource) && !saygiSource.includes('localStorage.setItem'));

const artifactPath = process.argv[2] === '--write-artifact' ? process.argv[3] : '';
if (artifactPath) {
  const light = registry.faithCornerOverlayHTML() + registry.qiblaOverlayHTML();
  ui.qiblaHeading = 132.1;
  ui.qiblaListening = true;
  ui.qiblaSensorSource = 'magnetic';
  ui.qiblaAccuracy = 8;
  const dark = registry.faithCornerOverlayHTML() + registry.qiblaOverlayHTML();
  fs.mkdirSync(path.dirname(path.resolve(artifactPath)), { recursive: true });
  fs.writeFileSync(path.resolve(artifactPath), '<!doctype html><meta charset="utf-8"><title>IIP-06 synthetic render</title><link rel="stylesheet" href="../../../app/styles.css"><main data-iip-card="IIP-06"><section data-theme="light"><h1>IIP-06 · light synthetic render</h1>' + light + '</section><section data-theme="dark" style="background:#050506"><div id="root" data-theme="dark">' + dark + '</div></section></main>\n');
  console.log('ARTIFACT ' + path.resolve(artifactPath));
}

console.log(`\nIIP-06 visual unity contract: ${passed} PASS, ${failed} FAIL`);
if (failed) process.exitCode = 1;
