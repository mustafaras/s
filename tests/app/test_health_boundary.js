// MON-30 · SeymaHealth hesaplama + sağlık görünüm registry'si ve app.js shim sınırı.
// Sentetik VM kullanır; DOM, storage, timer, network ve gerçek kullanıcı verisi yoktur.

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const healthSource = fs.readFileSync(path.join(repoRoot, 'app/core/health.js'), 'utf8');
const appSource = fs.readFileSync(path.join(repoRoot, 'app.js'), 'utf8');
let passed = 0;
let failed = 0;

function ok(name, condition, detail) {
  if (condition) {
    passed++;
    console.log(`PASS  ${name}`);
  } else {
    failed++;
    console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

const dateUtils = {
  pad(n) { return String(n).padStart(2, '0'); },
  todayStr() { return '2026-09-09'; },
  activeDate() { return '2026-09-09'; },
  addDays(s, n) {
    const p = s.split('-').map(Number);
    const d = new Date(p[0], p[1] - 1, p[2]);
    d.setDate(d.getDate() + n);
    return `${d.getFullYear()}-${this.pad(d.getMonth() + 1)}-${this.pad(d.getDate())}`;
  },
  diffDays(a, b) {
    const pa = a.split('-').map(Number), pb = b.split('-').map(Number);
    return Math.round((new Date(pb[0], pb[1] - 1, pb[2]) - new Date(pa[0], pa[1] - 1, pa[2])) / 86400000);
  },
};

const state = {
  startDate: '2026-09-01',
  body: { heightCm: 170, weights: [{ kg: 65 }] },
  settings: {
    birthDate: '1990-01-01',
    caffeineMode: 'sensitive',
    targetBed: '23:30',
    targets: { activityLevel: 'moderate', waterCups: 9, sleepHours: 8, steps: 7500 },
    vacation: { enabled: false, startAt: '', endAt: '', preset: 'moderate' },
    magnesium: { preferredForm: 'unknown' },
  },
  days: {
    '2026-09-09': {
      sleep: { hours: 6, quality: 3, med: { type: 'none' } },
      symptoms: ['kramp'],
      energy: 2,
      stress: 4,
      magnesium: { taken: true, mg: 320 },
    },
    '2026-09-08': {
      sleep: { med: { type: 'none' } },
      magnesium: { taken: true, mg: 300 },
    },
    '2026-09-07': { magnesium: { taken: false, mg: 0 } },
  },
};

function isVacationDay(date) {
  const v = state.settings.vacation;
  return !!(v.enabled && date >= v.startAt && date <= v.endAt);
}
function readingStats(rec) {
  const entries = rec && rec.reading && Array.isArray(rec.reading.entries) ? rec.reading.entries : [];
  let pages = 0;
  entries.forEach((entry) => {
    const value = Number(entry && entry.pages);
    if (!Number.isNaN(value) && value > 0) pages += value;
  });
  return { count: entries.length, pages, minutes: 0, entries };
}

const contextMath = Object.create(Math);
contextMath.random = () => 0;
const sandbox = { window: {}, Date, JSON, Math: contextMath, Number, String, Object, Array, RegExp, Error, isNaN, isFinite };
vm.createContext(sandbox);
vm.runInContext(healthSource, sandbox, { filename: 'app/core/health.js' });
const health = sandbox.window.SeymaHealth;

ok('registry load-safe expose', !!health && typeof health.registerHealth === 'function');
ok('registry declares dateUtils resolver', health && health.HEALTH_DEPENDENCIES.includes('dateUtils') && healthSource.includes('dateCall('));
ok('module has no browser/storage/network side effects', !/(document|localStorage|fetch|setTimeout|setInterval|requestAnimationFrame)/.test(healthSource));

const deps = {
  data: () => state,
  dateUtils: () => dateUtils,
  isVacationDay,
  vacationSettings: () => state.settings.vacation,
  cycleStats: () => ({ phase: 'luteal' }),
  readingStats,
  num(value) { return value === null || value === undefined || value === '' ? null : Number(value); },
  windDownSteps: () => [{}, {}, {}, {}],
};
ok('dependency bag registers once', health && health.registerHealth(deps) === true);
ok('duplicate registration is rejected', health && health.registerHealth(deps) === false);
const healthViewMembers = [
  'ringSeg', 'macroBarHTML', 'nutriInsightHTML', 'beslenmeCardHTML',
  'targetsCardHTML', 'waterCard', 'magnesiumFeedbackHTML',
  'magnesiumBannerHTML', 'magnesiumCardHTML', 'magnesiumHeadline',
  'activityRings', 'sparkCard', 'medFreeBadge', 'gaugeBadge',
  'caffeineCurveSVG', 'caffeineBlock', 'sleepPrepCard', 'lastWeight',
  'weightRefMs', 'weightWeekReady', 'nextWeightInDays', 'bodyCard',
  'labCard', 'discomfortCard', 'moodScore', 'moodColorScore', 'mentalStats',
  'mentalBalanceCard', 'healthSleepCard', 'healthWalkCard', 'healthAppleCard',
  'saglikHTML', 'fmtTR', 'cycleWheel', 'cycleHTML',
];
ok('health görünüm registry üyeleri ve erişim listesi korunur',
  health && JSON.stringify(health.HEALTH_VIEW_MEMBERS) === JSON.stringify(healthViewMembers) &&
  healthViewMembers.every((name) => typeof health[name] === 'function'));

const caffeine = { caffeine: { drinks: [
  { type: 'filter', qty: 1, time: '09:00' },
  { type: 'black-tea', qty: 2, time: '18:00' },
  { type: 'unknown', qty: 4, time: '22:00' },
  { type: 'green-tea', qty: 0, time: '07:00' },
] } };
ok('caffeine total preserves type/qty semantics', health.caffeineTotalMg(caffeine) === 200);
ok('caffeine last-time keeps valid HH:MM entries', health.caffeineLastTime(caffeine) === '22:00');
ok('caffeine max single preserves serving floor', health.caffeineMaxSingle(caffeine) === 95);
ok('caffeine residue preserves half-life calculation', health.caffeineResidueAt(caffeine, '23:30') === 53);
ok('caffeine cutoff/timing preserves boundary', health.caffeineCutoffTime('23:30') === '17:30' && health.caffeineTimingOk(caffeine, '23:30') === false);
ok('caffeine sensitive limit is 300 mg', health.caffeineLimit('2026-09-09') === 300);

const egg = health.mealItemNutr({ name: 'yumurta', unit: 'adet', qty: 2 });
const unknown = health.mealItemNutr({ name: 'bilinmeyen yiyecek', unit: 'gr', qty: 100 });
const nutrition = health.dayNutrition({ mealItems: {
  breakfast: [{ name: 'yumurta', unit: 'adet', qty: 2 }, { name: 'bilinmeyen yiyecek', unit: 'gr', qty: 100 }],
  lunch: [{ name: 'yoğurt', unit: 'kase', qty: 1 }],
} });
ok('nutrition known item vector is equivalent', egg.grams === 100 && egg.protein === 13 && egg.carbs === 1.1 && egg.fat === 11 && egg.calories === 155.4 && egg.known === true);
ok('nutrition fallback vector is equivalent', unknown.known === false && unknown.protein === 7 && unknown.carbs === 18 && unknown.fat === 5 && unknown.calories === 145);
ok('nutrition daily rounding/item count is equivalent', JSON.stringify(nutrition) === JSON.stringify({ protein: 30, carbs: 29, fat: 23, calories: 440, items: 3 }));
ok('meal unit labels remain unchanged', health.unitLabel('kasik') === 'kaşık' && health.unitLabel('missing') === 'missing');

const age = health.calcAge('1990-01-01');
const targets = health.calcTargets();
const bmr = 10 * 65 + 6.25 * 170 - 5 * age - 161;
const tdee = Math.round(bmr * 1.55);
ok('age and BMI boundaries are equivalent', age >= 30 && health.bmiFor(65, 170) === 65 / 1.7 ** 2 && health.bmiCat(22).label === 'Normal');
ok('BMR/TDEE target vector is equivalent', targets && targets.bmr === Math.round(bmr) && targets.tdee === tdee && targets.calories === tdee && targets.protein === 117 && targets.carbs === Math.round(tdee * 0.47 / 4) && targets.fat === Math.round(tdee * 0.27 / 9) && targets.fiber === Math.max(25, Math.round(tdee * 0.014)) && targets.waterCups === 9 && targets.steps === 9000 && targets.magnesiumMg === (age >= 31 ? 320 : 310));

state.settings.vacation = { enabled: true, startAt: '2026-09-01', endAt: '2026-09-30', preset: 'moderate' };
ok('vacation water/steps/sleep thresholds are equivalent', health.waterGoalCups('2026-09-09') === 10 && health.stepsGoal('2026-09-09') === 9000 && health.sleepGoalHours('2026-09-09') === 7);
ok('vacation caffeine limit keeps 1.25 multiplier', health.caffeineLimit('2026-09-09') === 375);
state.settings.vacation.enabled = false;

const emptyHealth = health.emptyHealth();
const emptyMagnesium = health.emptyMagnesium();
ok('empty health records preserve schema', JSON.stringify(emptyHealth) === JSON.stringify({ steps: 0, walkM: 0, updatedAt: null }));
ok('empty magnesium records preserve schema', JSON.stringify(emptyMagnesium) === JSON.stringify({ taken: false, form: '', mg: null, time: '', reason: [], effectNote: '', skipped: false, feedback: null }));
ok('step source precedence is equivalent', health.effSteps({ walk: { steps: 1200 }, health: { steps: 9000 }, movement: { walkM: 7200 } }).source === 'manual' && health.effSteps({ health: { steps: 9000 }, movement: { walkM: 7200 } }).source === 'health' && health.effSteps({ movement: { walkM: 7200 } }).steps === 10000);
ok('movement summary is equivalent', JSON.stringify(health.dayMovement({ movement: { totalM: 8000, walkM: 7200, vehicleM: 800, maxSpeed: 4 } })) === JSON.stringify({ total: 8000, walk: 7200, veh: 800, max: 4 }));

const readiness = health.sleepReadiness({
  sleep: { hours: 7.75, quality: 'good', windDown: { steps: [{ done: true }, { done: true }, { done: true }, { done: true }] }, med: { type: 'none' } },
  reading: { entries: [{ pages: 10 }] },
});
ok('sleep readiness score vector is equivalent', readiness.score === 100 && readiness.tier === 'Mükemmel' && readiness.factors.winddown === 14 && readiness.factors.reading === 16);

const before = deepClone(state);
const nudge = health.calculateMgNudge('2026-09-09');
const stats = health.magnesiumStats();
ok('magnesium nudge vector preserves signals and form', nudge.score === 75 && nudge.phase === 'luteal' && nudge.form === 'glycinate' && nudge.reasons.join(',') === 'luteal,kramp,sleepLow,lowEnergy,highStress');
ok('magnesium stats vector is equivalent', JSON.stringify(stats) === JSON.stringify({ totalDays: 2, totalMg: 620, avgDose: 310, streak: 2 }));
ok('health calculators do not mutate app state', JSON.stringify(state) === JSON.stringify(before));

ok('app.js exposes health registry shims', [
  'function dayNutrition(){ return SEYMA_HEALTH.dayNutrition.apply(null,arguments); }',
  'function sleepReadiness(){ return SEYMA_HEALTH.sleepReadiness.apply(null,arguments); }',
  'function calculateMgNudge(){ return SEYMA_HEALTH.calculateMgNudge.apply(null,arguments); }',
  'function bmiFor(){ return SEYMA_HEALTH.bmiFor.apply(null,arguments); }',
].every((line) => appSource.includes(line)));
ok('app.js exposes health view shims', [
  'function waterCard(){ return SEYMA_HEALTH.waterCard.apply(null,arguments); }',
  'function caffeineBlock(){ return SEYMA_HEALTH.caffeineBlock.apply(null,arguments); }',
  'function bodyCard(){ return SEYMA_HEALTH.bodyCard.apply(null,arguments); }',
  'function saglikHTML(){ return SEYMA_HEALTH.saglikHTML.apply(null,arguments); }',
  'function cycleHTML(){ return SEYMA_HEALTH.cycleHTML.apply(null,arguments); }',
].every((line) => appSource.includes(line)));

console.log(`\n${passed}/${passed + failed} geçti.`);
process.exitCode = failed ? 1 : 0;
