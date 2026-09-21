'use strict';
// IIP-14 — Kayıpsız tarihsel kayıt sunumu · headless/no-network VM fixture.
// Yalnız sentetik state kullanır; browser, gerçek localStorage, ağ ve sync yoktur.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ROOT = path.join(__dirname, '..', '..');
const prayerSource = fs.readFileSync(path.join(ROOT, 'app/core/prayer.js'), 'utf8');
const saygiSource = fs.readFileSync(path.join(ROOT, 'app/core/saygi.js'), 'utf8');
const appSource = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
let passed = 0, failed = 0;
function ok(name, condition, detail) { if (condition) { passed++; console.log('PASS  ' + name); } else { failed++; console.log('FAIL  ' + name + (detail ? ' -> ' + detail : '')); } }
function addDays(date, amount) { const d = new Date(date + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + amount); return d.toISOString().slice(0, 10); }
const esc = (v) => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const counters = { save: 0, fetch: 0, storageSet: 0 };
const historical = {
  fajr: { performed: true, inCongregation: true, savedAt: '2026-09-20T05:00:00Z' },
  sunrise: { performed: true, note: 'eski Güneş alanı', savedAt: '2026-09-20T06:20:00Z' },
  dhuhr: { performed: false },
  asr: { performed: true, savedAt: '2026-09-20T16:30:00Z' },
  maghrib: { performed: false },
  isha: { performed: false }
};
const data = {
  startDate: '2026-09-15',
  days: { '2026-09-20': { prayer: historical } },
  zikr: { sessions: {} },
  settings: { prayer: { method: 'diyanet', location: { lat: 39.9334, lon: 32.8597, cityName: 'Ankara' } } }
};
const ui = { faithTab: 'rapor', faithHeatYear: 2026 };
const sandbox = {
  console, Date, Math, JSON, Object, Array, Number, String, Boolean, RegExp, Error, Promise, Set, Map, Intl,
  encodeURIComponent, decodeURIComponent, isNaN, isFinite,
  localStorage: { getItem: () => null, setItem: () => { counters.storageSet++; } },
  fetch: () => { counters.fetch++; return Promise.reject(new Error('network forbidden')); },
  setTimeout: () => 0, clearTimeout: () => {}, document: {}
};
sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(prayerSource, sandbox, { filename: 'app/core/prayer.js' });
sandbox.SeymaPrayer.registerPrayer({
  data: () => data, getDay: (d, date) => d.days[date] || (d.days[date] = {}), dayIndexFor: () => 1,
  todayStr: () => '2026-09-21', addDays, pad: (n) => String(n).padStart(2, '0'), esc,
  save: () => { counters.save++; }, storage: () => sandbox.localStorage, fetch: () => sandbox.fetch
});
vm.runInContext(saygiSource, sandbox, { filename: 'app/core/saygi.js' });
sandbox.SeymaSaygi.registerSaygi({
  data: () => data, ui: () => ui, getDay: (d, date) => d.days[date] || {}, todayStr: () => '2026-09-21', addDays,
  diffDays: (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000), dayIndexFor: () => 1,
  dateLabelTR: (d) => d, icon: (n) => '<svg data-icon="' + esc(n) + '"></svg>', esc,
  featuresLive: () => true, render: () => {}, quranJourneyHubCardHTML: () => '', zikrVisible: () => true, zikrPreviewCardHTML: () => '',
  'zikr:zikrWeek': () => ({ total: 0, days: 0 }), 'zikr:zikrStreak': () => 0
});
const P = sandbox.SeymaPrayer, S = sandbox.SeymaSaygi;

console.log('[1] REQ-027 — altı eski anahtar salt-okur, Güneş ayrı');
const before = JSON.stringify(historical);
const view = P.prayerHistoryPresentation(historical);
ok('altı kaynak anahtarın sırası korunur', view.records.map((r) => r.key).join(',') === 'fajr,sunrise,dhuhr,asr,maghrib,isha');
ok('beş vakit yalnız kendi anahtarlarından ayrıştırılır', view.trackedPerformed === 2);
ok('Güneş ayrı tarihsel kayıt olarak sunulur', view.historicalSunrise && view.historicalSunrise.key === 'sunrise' && view.historicalSunrise.kind === 'historical_sunrise');
ok('Güneş başka ibadet sınıfına çevrilmez', view.records.filter((r) => r.kind === 'tracked_prayer' && r.performed).map((r) => r.key).join(',') === 'fajr,asr');
ok('adaptör girdiyi byte-eşdeğer bırakır', JSON.stringify(historical) === before);
ok('adaptör save/storage/fetch açmaz', counters.save === 0 && counters.storageSet === 0 && counters.fetch === 0);

console.log('[2] REQ-027 — güvenilmez toplam/yüzde yerine kaynak kayıt');
const week = S.faithWeekKPIs('2026-09-21');
ok('hafta paydası ve oranı bilinçli olarak yoktur', week.maxPrays === null && week.rate === null && week.denominatorReliable === false, JSON.stringify(week));
ok('kaynak kayıt sayısı ve ayrı Güneş sayısı korunur', week.sourceRecords === 3 && week.historicalSunriseRecords === 1, JSON.stringify(week));
ok('belirsizlik açıklaması boş/migration/bilinçli sıfırı açıklar', /boş gün/.test(week.uncertainty) && /yüzde/.test(week.uncertainty));
const heat = S.faithDayHeat('2026-09-20');
ok('gün ısısı kaynağı sayar, Güneş ayrımını taşır', heat.sourceRecords === 3 && heat.performed === 2 && heat.historicalSunrise === true && heat.denominatorReliable === false, JSON.stringify(heat));
const html = S.faithRaporCardHTML();
ok('rapor kaynak kayıt ve Güneş tarihsel açıklamasını gösterir', /3 kaynak kayıt/.test(html) && /1 Güneş kaydı ayrı tarihsel kayıt/.test(html), html.slice(0, 300));
ok('rapor güvenilmez yüzde/payda kopyasını kaldırır', !/kayıtlı vakit payı/.test(html) && !/>%\d+/.test(html) && !/\d+\/\d+<\/div><div[^>]*>vakit/.test(html));

console.log('[3] REQ-028 — kayıt eylemleri ve şema sınırı');
ok('sunum adaptörü migration veya şema yazımı yapmaz', !/migration|migrate\s*\(/i.test(P.prayerHistoryPresentation.toString()));
ok('mevcut kayıt handlerı skaler alanı değiştirir; kayıt dizisi çoğaltmaz', /App\.togglePrayer=function\(type,field\)/.test(appSource) && !/App\.togglePrayer=function[\s\S]{0,700}\.push\(/.test(appSource));
ok('geçmiş ısı eylemi mevcut tarih açma yolunu korur', /App\.openFaithHeatDay=function\(date\)\{ App\.heatOpen\(date\); \}/.test(appSource));
ok('IIP-14 yeni kayıt handlerı veya migration eklemez', !/IIP-14[\s\S]{0,400}App\./.test(appSource) && !/IIP-14[\s\S]{0,400}migrat/i.test(appSource));
ok('tüm inceleme sonunda kaynak veri hâlâ byte-eşdeğer', JSON.stringify(historical) === before);

assert.equal(counters.save, 0, 'salt-okur fixture save çağırmamalı');
console.log(`\nIIP-14: ${passed} PASS, ${failed} FAIL`);
if (failed) process.exitCode = 1;
