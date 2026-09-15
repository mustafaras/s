// MON-35 · SeymaMap load-safe map/location/weather sınırı.
// Gerçek GPS, hava API'si, DOM ve kalıcı veri yok; tüm yollar sentetiktir.

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const mapSource = fs.readFileSync(path.join(repoRoot, 'app/core/map.js'), 'utf8');
const appSource = fs.readFileSync(path.join(repoRoot, 'app.js'), 'utf8');
const indexSource = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');

function ok(name, condition) {
  assert.equal(condition, true, name);
  console.log('PASS  ' + name);
}

const coldSandbox = { window: {} };
vm.runInNewContext(mapSource, coldSandbox, { filename: 'app/core/map.js#cold' });
const cold = coldSandbox.window.SeymaMap;
ok('yüklemede SeymaMap registry expose edilir', !!cold && typeof cold.registerMap === 'function');
ok('map yüklemesi storage/DOM/timer/ağ/permission çağrısı açmaz',
  Object.keys(coldSandbox.window).length === 1 &&
  !/localStorage|document\.|fetch\s*\(|navigator\.geolocation|watchPosition|setTimeout|setInterval/.test(mapSource) &&
  !/^\s*(?:var\s+)?data\s*=/m.test(mapSource));
ok('map registry planlanan read-only üyeleri açıkça taşır',
  cold.MAP_DEPENDENCIES.includes('data') && cold.MAP_DEPENDENCIES.includes('moods') && cold.MAP_MEMBERS.length === 16);

const data = {
  startDate: '2026-09-01',
  settings: { locationEnabled: false, locationMode: 'auto' },
  location: null,
  weather: {
    mode: 'fixed', fetchedAt: new Date(Date.now() - 1000).toISOString(),
    spots: [
      { key: 'ev', label: 'Ev', place: 'Kazan', iconName: 'house', temp: 21, feels: 20, hum: 45, wind: 8, code: 0, isDay: true, uv: 3, hi: 23, lo: 12, sunrise: '2026-09-10T06:10:00+03:00', sunset: '2026-09-10T18:40:00+03:00' },
      { key: 'is', label: 'İş', place: 'Altındağ', iconName: 'building-2', temp: 20, feels: 19, hum: 50, wind: 10, code: 2, isDay: true, uv: 2, hi: 22, lo: 11, sunrise: '2026-09-10T06:10:00+03:00', sunset: '2026-09-10T18:40:00+03:00' },
    ],
  },
  days: { '2026-09-10': { mood: 'iyi', habits: { walked20: true }, movement: { totalM: 1200, walkM: 900, vehicleM: 300 } } },
};
const ui = { calMonth: '2026-09', weatherOpen: false, cards: { location: true } };
const moods = [{ id: 'iyi', icon: 'flower-2' }, { id: 'normal', icon: 'leaf' }];
function addDays(date, amount) { const d = new Date(date + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + amount); return d.toISOString().slice(0, 10); }
function countRec(rec) { return rec && rec.habits ? Object.keys(rec.habits).filter((key) => rec.habits[key]).length : 0; }
function bestStreak(days) { return days.filter((item) => item.rec).length; }
function moodDist(days) { const out = {}; days.forEach((item) => { if (item.rec && item.rec.mood) out[item.rec.mood] = (out[item.rec.mood] || 0) + 1; }); return out; }
function icon(name, size) { return '<i data-icon="' + name + '" data-size="' + (size || 20) + '"></i>'; }
function esc(value) { return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
function fmtDist(value) { return Math.round(Number(value) || 0) + ' m'; }
function fmtDur(value) { return Math.round(Number(value) || 0) + ' dk'; }
function sciNote(text) { return '<aside class="science-note">' + text + '</aside>'; }
function moodEmoji() { return ''; }
function haversineM() { return 0; }

const deps = {
  data: () => data, ui: () => ui, dark: () => false, todayStr: () => '2026-09-10',
  pad: (value) => String(value).padStart(2, '0'), countRec, habitCountOn: () => 1,
  diffDays: (a, b) => Math.round((new Date(b + 'T12:00:00Z') - new Date(a + 'T12:00:00Z')) / 86400000),
  moodEmoji, icon, esc, sciNote, bestStreak, moodDist, featuresLive: () => false,
  hidePill: () => '', cardOpen: () => true, fmtDist, fmtDur, autoModeLabel: () => 'algılanıyor…',
  healthSetupCardHTML: () => '', collapsibleCardHTML: (opts) => '<section data-key="' + opts.key + '">' + opts.title + opts.body + '</section>',
  haversineM, moods: () => moods,
};

ok('eksik map dependency bag reddedilir', cold.registerMap({ data: deps.data }) === false);
ok('tam map dependency bag bir kez kaydedilir', cold.registerMap(deps) === true);
ok('map registry ikinci kayıtla yeniden bağlanmaz', cold.registerMap(deps) === false);
ok('16 map üyesinin tamamı registryden erişilir', cold.MAP_MEMBERS.every((name) => typeof cold[name] === 'function'));

const before = JSON.stringify(data);
ok('fixed modda konum erişimi read-only ve iki spot döndürür', cold.wxMode() === 'fixed' && cold.weatherSpots().length === 2);
ok('taze hava kaydı stale değildir', cold.wxStale() === false);
const locationHtml = cold.locationCardHTML();
const weatherHtml = cold.weatherHeaderHTML('Günaydın');
const mapHtml = cold.haritaHTML();
ok('konum/hava/harita HTML üreticileri çalışır', locationHtml.includes('Konum & Hareket') && weatherHtml.includes('Günaydın') && mapHtml.includes('Eylül 2026'));
ok('map registry HTML ve projection çağrılarında state mutasyonu yoktur', JSON.stringify(data) === before && JSON.stringify(ui) === JSON.stringify({ calMonth: '2026-09', weatherOpen: false, cards: { location: true } }));

data.settings.locationEnabled = true;
data.location = { lat: 39.9334, lng: 32.8597 };
data.weather.mode = 'live';
data.weather.spots.unshift({ key: 'live', label: 'Konumun', place: '', iconName: 'map-pin' });
ok('live konum yolu yalnız çağrı anında seçilir', cold.wxMode() === 'live' && cold.weatherSpots()[0].key === 'live' && cold.weatherSpots().length === 3);

ok('permission/error ve network sahipliği app.jste korunur',
  /function locationGateErrorText\(/.test(appSource) &&
  appSource.includes("code===1") && appSource.includes("code===2") && appSource.includes("code===3") &&
  appSource.includes('permission-denied') && appSource.includes('position-unavailable') && appSource.includes('timeout') &&
  /function fetchWeather\(/.test(appSource) && /function reverseGeocodeLive\(/.test(appSource) &&
  appSource.includes('navigator.geolocation.watchPosition') &&
  !/app\.innerHTML=html;[\s\S]{0,180}maybeFetchWeather\(\)/.test(appSource) &&
  !/if\(data && data\.settings && data\.settings\.locationEnabled\) startLocationWatch\(false\)/.test(appSource) &&
  !/try\{ locationGateSilentVerify\(\); \}catch\(e\)\{\}/.test(appSource) &&
  /App\.toggleWeather=function\(\)[\s\S]{0,360}startLocationWatch\(false\)/.test(appSource) &&
  !/function renderHarita\(/.test(appSource) && !/var WX_SPOTS_FIXED=/.test(appSource));
ok('app shim ve production cache-bust/load-order map registryye bağlıdır',
  appSource.includes('registerMap') && appSource.includes('SEYMA_MAP.haritaHTML') &&
  indexSource.includes('app/core/map.js?v=20260915a') &&
  indexSource.indexOf('app/core/report.js') < indexSource.indexOf('app/core/map.js') &&
  indexSource.indexOf('app/core/map.js') < indexSource.indexOf('app/core/mediaFx.js'));

console.log('\nDone.');
