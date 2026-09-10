// MON-34 · SeymaReport read-only analytics, KPI/heatmap and shim sınırı.
// Gerçek DOM, storage, network ve uygulama verisi kullanılmaz; tüm state sentetiktir.

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const reportSource = fs.readFileSync(path.join(repoRoot, 'app/core/report.js'), 'utf8');
const appSource = fs.readFileSync(path.join(repoRoot, 'app.js'), 'utf8');
const indexSource = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');

function ok(name, condition) {
  assert.equal(condition, true, name);
  console.log('PASS  ' + name);
}

function addDays(date, amount) {
  const d = new Date(date + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + amount);
  return d.toISOString().slice(0, 10);
}

function diffDays(a, b) {
  return Math.round((new Date(b + 'T12:00:00Z') - new Date(a + 'T12:00:00Z')) / 86400000);
}

function countRec(rec) {
  return rec && rec.habits ? Object.keys(rec.habits).filter((key) => rec.habits[key]).length : 0;
}

function allDays() {
  return Object.keys(data.days).sort().map((date) => ({ date, rec: data.days[date] }));
}

function bestStreak(days) {
  let best = 0;
  let run = 0;
  let previous = null;
  days.forEach((item) => {
    if (item.rec) {
      run = previous && diffDays(previous, item.date) === 1 ? run + 1 : 1;
      best = Math.max(best, run);
      previous = item.date;
    } else {
      run = 0;
      previous = null;
    }
  });
  return best;
}

const data = {
  startDate: '2025-01-01',
  days: {
    '2026-09-08': { habits: { walked20: true }, mood: 'normal', sleep: { hours: 6.5, med: { type: 'none' } }, water: 6, energy: 3, stress: 3, nutrition: { protein: 80 }, movement: { total: 1200, walk: 1000, veh: 200 }, reading: { entries: [{ id: 'r1' }] } },
    '2026-09-09': { habits: { walked20: true }, mood: 'iyi', sleep: { hours: 7.5, med: { type: 'none' } }, water: 8, energy: 4, stress: 2, nutrition: { protein: 100 }, movement: { total: 2400, walk: 2200, veh: 200 } },
    '2026-09-10': { habits: { walked20: true }, mood: 'cok-iyi', sleep: { hours: 8, med: { type: 'none' } }, water: 9, energy: 5, stress: 1, nutrition: { protein: 120 }, movement: { total: 3000, walk: 2800, veh: 200 } },
  },
  settings: {},
};
const ui = { heatYear: 2026 };
const habits = [{ key: 'walked20', title: '20 dk yürü', icon: '🚶' }];
const moods = [
  { id: 'cok-iyi', short: 'çok iyi', icon: 'sun' },
  { id: 'iyi', short: 'iyi', icon: 'smile' },
  { id: 'normal', short: 'normal', icon: 'minus' },
  { id: 'zorlandim', short: 'zorlandım', icon: 'cloud' },
  { id: 'cok-zorlandim', short: 'çok zorlandım', icon: 'cloud-rain' },
];

function find(items, key, value) { return (items || []).find((item) => item && item[key] === value) || null; }
function icon(name, size) { return '<i data-icon="' + name + '" data-size="' + (size || 20) + '"></i>'; }
function esc(value) { return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
function habitCountOn() { return habits.length; }
function htToday() { return habits.length; }
function daysTracked() { return Object.keys(data.days).length; }
function currentStreak() { return bestStreak(allDays()); }
function dayNutrition(rec) { return { protein: Number(rec && rec.nutrition && rec.nutrition.protein || 0) }; }
function proteinGoal() { return 100; }
function waterGoalCups() { return 8; }
function moodScore(mood) { return ({ 'cok-iyi': 5, iyi: 4, normal: 3, zorlandim: 2, 'cok-zorlandim': 1 })[mood] || null; }
function effSteps(rec) { return { steps: Number(rec && rec.steps || 0) }; }
function dayMovement(rec) { return Object.assign({ total: 0, walk: 0, veh: 0 }, rec && rec.movement); }
function fmtDist(value) { return Math.round(Number(value) || 0) + ' m'; }
function sciNote(text) { return '<aside class="science-note">' + text + '</aside>'; }
function medFreeStreak() { return 3; }

console.log('== MON-34 SeymaReport registry sınırı ==\n');

const coldSandbox = { window: {} };
vm.runInNewContext(reportSource, coldSandbox, { filename: 'app/core/report.js#cold' });
const cold = coldSandbox.window.SeymaReport;
ok('yüklemede SeymaReport registry expose edilir', !!cold && typeof cold.registerReport === 'function');
ok('yükleme storage/DOM/timer/ağ çağrısı açmaz', Object.keys(coldSandbox.window).length === 1);
ok('registry data yazımı ve dış yan etki taşımaz', !/\bdata\s*=|localStorage|fetch\s*\(|document\.|setTimeout|setInterval/.test(reportSource));
ok('registry report dependency ve 16 üyeyi açıkça taşır', cold.REPORT_DEPENDENCIES.includes('data') && cold.REPORT_DEPENDENCIES.includes('ui') && cold.REPORT_MEMBERS.length === 16);

const deps = {
  data: () => data, ui: () => ui, dark: () => false, todayStr: () => '2026-09-10', addDays, diffDays,
  shortDate: (date) => String(date).slice(5), pad: (n) => String(n).padStart(2, '0'), countRec, allDays,
  bestStreak, currentStreak, daysTracked, habitCountOn, htToday, find, icon, esc,
  habits: () => habits, moods: () => moods, dayNutrition, proteinGoal, waterGoalCups, moodScore,
  effSteps, dayMovement, fmtDist, sciNote, medFreeStreak,
};
ok('eksik dependency bag reddedilir', cold.registerReport({ data: deps.data }) === false);
ok('tam dependency bag bir kez kaydedilir', cold.registerReport(deps) === true);
ok('registry ikinci kayıtla yeniden bağlanmaz', cold.registerReport(deps) === false);
ok('16 report üyesinin tamamı registryden erişilir', cold.REPORT_MEMBERS.every((name) => typeof cold[name] === 'function'));

const before = JSON.stringify(data);
const first = cold.raporHTML();
const second = cold.raporHTML();
ok('rapor HTML deterministik ve temel KPI/heatmap yüzeyini korur', first === second && first.includes('Son 30 gün') && first.includes('Mod ısı haritası') && first.includes('App.heatYear') && first.includes('App.printReport'));
ok('rapor registry salt-okur state sınırını korur', JSON.stringify(data) === before);
ok('app.js tüm report üyelerini imza-koruyan shim olarak çağırır', cold.REPORT_MEMBERS.every((name) => appSource.includes('function ' + name + '(') && appSource.includes('SEYMA_REPORT.' + name + '.apply(null,arguments)')));
ok('app boot registry kaydı ve cache-bust/load-order vardır', appSource.includes('registerReport') && indexSource.includes('app/core/report.js?v=20260910a') && indexSource.indexOf('app/core/library.js') < indexSource.indexOf('app/core/report.js') && indexSource.indexOf('app/core/report.js') < indexSource.indexOf('app/core/mediaFx.js'));

console.log('\nDone.');
