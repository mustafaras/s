// MON-50 — daily App handler registry boundary.
// Synthetic, network-free fixture: no app boot, browser, localStorage or sync.
// The five handlers in scope keep their App names/signatures in app.js while
// their bodies execute through the load-safe SeymaAppSurface registry.

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

function read(rel) {
  return fs.readFileSync(path.join(repoRoot, rel), 'utf8');
}

const surfaceSource = read('app/core/appSurface.js');
const appSource = read('app.js');
const indexSource = read('index.html');
const expectedDependencies = [
  'data', 'ui', 'app', 'activeDate', 'todayStr', 'dayIndexFor', 'getDay',
  'derivedHabits', 'countRec', 'habits', 'find', 'haptic', 'commit', 'editing',
  'htToday', 'confetti', 'habitProgress', 'waterGoalCups', 'sleepGoalHours',
  'stepsGoal', 'effSteps', 'isVacationDay', 'derivedProgText', 'toast',
  'maybeStreak', 'updateCardByKey', 'render', 'emptyMagnesium', 'pulseTimer',
  'setPulseTimer', 'clearTimeout', 'setTimeout', 'document', 'save',
];
const handlerNames = [
  'toggleHabit', 'toggleMgHabit', 'explainDerivedHabit', 'setMood', 'saveToday',
];

let passed = 0;
function ok(name, condition) {
  assert.equal(condition, true, name);
  passed += 1;
  console.log('PASS  ' + name);
}

console.log('== MON-50 daily App surface boundary ==\n');

const coldSandbox = { window: {} };
vm.runInNewContext(surfaceSource, coldSandbox, { filename: 'app/core/appSurface.js#cold' });
const cold = coldSandbox.window.SeymaAppSurface;
ok('cold load exposes the daily registry without side effects',
  cold && typeof cold.registerAppSurface === 'function' &&
  handlerNames.every((name) => typeof cold[name] === 'function') &&
  Object.keys(coldSandbox.window).length === 1);
ok('dependency manifest is explicit and stable',
  JSON.stringify(cold.APP_SURFACE_DEPENDENCIES) === JSON.stringify(expectedDependencies));
ok('incomplete dependency bags fail closed', cold.registerAppSurface({}) === false);

const calls = [];
const timers = [];
const data = {
  settings: {},
  days: {},
};
const ui = { pulse: null };
const day = {
  habits: { selfKind: false, magnesium: false },
  mood: null,
};
data.days['2026-09-12'] = day;
const app = {
  explainDerivedHabit(key, record) { calls.push(['explainDerivedHabit', key, record]); },
  toggleMgHabit() { calls.push(['app.toggleMgHabit']); },
  takeMagnesium(...args) {
    calls.push(['takeMagnesium', ...args]);
    day.magnesium = { taken: true };
    day.habits.magnesium = true;
  },
  skipMagnesium(...args) {
    calls.push(['skipMagnesium', ...args]);
    day.magnesium = { taken: false };
    day.habits.magnesium = false;
  },
  openCrisis(key) { calls.push(['openCrisis', key]); },
  saveNow(...args) { calls.push(['saveNow', ...args]); },
};
const deps = {};
expectedDependencies.forEach((name) => { deps[name] = () => undefined; });
Object.assign(deps, {
  data: () => data,
  ui: () => ui,
  app: () => app,
  activeDate: () => '2026-09-12',
  todayStr: () => '2026-09-12',
  dayIndexFor: (date) => { calls.push(['dayIndexFor', date]); return 0; },
  getDay: (...args) => { calls.push(['getDay', ...args]); return day; },
  derivedHabits: () => ({ water: true, sweetManaged: true }),
  countRec: (record) => Object.keys(record.habits).reduce((sum, key) => sum + (record.habits[key] ? 1 : 0), 0),
  habits: () => [{ key: 'selfKind', msg: 'Kendine iyi davrandın.' }],
  find: (items, field, value) => items.find((item) => item[field] === value),
  haptic: (...args) => calls.push(['haptic', ...args]),
  commit: (...args) => calls.push(['commit', ...args]),
  editing: () => false,
  htToday: () => 10,
  confetti: () => calls.push(['confetti']),
  habitProgress: () => ({ met: false, cur: 0, goal: 4 }),
  waterGoalCups: () => 4,
  sleepGoalHours: () => 7.5,
  stepsGoal: () => 4500,
  effSteps: () => ({ steps: 0 }),
  isVacationDay: () => false,
  derivedProgText: () => '',
  toast: (...args) => calls.push(['toast', ...args]),
  maybeStreak: () => calls.push(['maybeStreak']),
  updateCardByKey: (...args) => calls.push(['updateCardByKey', ...args]),
  render: (...args) => calls.push(['render', ...args]),
  emptyMagnesium: () => ({ taken: false }),
  pulseTimer: () => null,
  setPulseTimer: (value) => { calls.push(['setPulseTimer', value]); },
  clearTimeout: (value) => calls.push(['clearTimeout', value]),
  setTimeout: (fn, ms) => { timers.push(fn); calls.push(['setTimeout', ms]); return 'timer-1'; },
  document: () => ({ getElementById: () => null }),
  save: (...args) => calls.push(['save', ...args]),
});

ok('complete dependency bag registers once', cold.registerAppSurface(deps) === true);
ok('duplicate registry registration is rejected', cold.registerAppSurface(deps) === false);

cold.setMood('iyi');
ok('setMood keeps mutation, metadata save and two card updates',
  day.mood === 'iyi' && calls.some((entry) => entry[0] === 'save' && entry[1] === false && entry[2].meta.section === 'mood') &&
  calls.filter((entry) => entry[0] === 'updateCardByKey').map((entry) => entry[1]).join(',') === 'mood,mental');

cold.toggleHabit('selfKind');
ok('toggleHabit keeps habit mutation, commit and haptic path',
  day.habits.selfKind === true && calls.some((entry) => entry[0] === 'commit' && entry[1] === 'Kendine iyi davrandın.') &&
  calls.some((entry) => entry[0] === 'haptic' && entry[1] === 14) && calls.some((entry) => entry[0] === 'setTimeout' && entry[1] === 240));
timers.shift()();
ok('toggleHabit keeps delayed pulse reset and render', ui.pulse === null && calls.some((entry) => entry[0] === 'render'));

cold.toggleHabit('water');
ok('derived habit callers remain App-owned', calls.some((entry) => entry[0] === 'explainDerivedHabit' && entry[1] === 'water' && entry[2] === day));

cold.toggleHabit('magnesium');
ok('toggleHabit keeps the magnesium App-owned mutation route',
  calls.some((entry) => entry[0] === 'app.toggleMgHabit'));

cold.toggleMgHabit();
ok('toggleMgHabit keeps the take/skip handler route',
  calls.some((entry) => entry[0] === 'takeMagnesium'));

cold.explainDerivedHabit('sweetManaged', day);
ok('crisis derived habit keeps the modal handler route', calls.some((entry) => entry[0] === 'openCrisis' && entry[1] === 'sweet'));

cold.saveToday();
ok('saveToday preserves today lookup then App.saveNow order',
  calls.findIndex((entry) => entry[0] === 'getDay') < calls.findIndex((entry) => entry[0] === 'saveNow'));

const assignmentPattern = /App\.([A-Za-z0-9_$]+)\s*=\s*(?:function|async\s+function)/g;
const currentAssignments = [...appSource.matchAll(assignmentPattern)].map((match) => match[1]);
ok('App function assignment count remains 556', currentAssignments.length === 556);
const handlerSurface = new Set((appSource.match(/App\.[A-Za-z0-9_]+\s*=[^=]/g) || [])
  .map((value) => value.match(/App\.[A-Za-z0-9_]+/)[0]));
ok('unique App handler surface remains 718', handlerSurface.size === 718);
ok('the five daily handlers keep exact signature-preserving shims',
  handlerNames.every((name) => new RegExp('App\\.' + name + '=function').test(appSource) &&
    new RegExp('SEYMA_APP_SURFACE\\.' + name + '\\.apply\\(null,arguments\\)').test(appSource)));
ok('daily bodies have one canonical owner',
  handlerNames.every((name) => new RegExp('function ' + name + '\\s*\\(').test(surfaceSource)) &&
  !/App\.toggleHabit=function\(key\)\{[\s\S]*?DERIVED_HABITS\[key\]/.test(appSource) &&
  !/App\.setMood=function\(id\)\{[\s\S]*?day\.mood=/.test(appSource));
ok('production load order and cache bust place the registry before app.js',
  indexSource.indexOf('app/core/render.js?') < indexSource.indexOf('app/core/appSurface.js?') &&
  indexSource.indexOf('app/core/appSurface.js?') < indexSource.indexOf('app.js?') &&
  /app\/core\/appSurface\.js\?v=\d+[a-z]/.test(indexSource) &&
  /app\.js\?v=\d+[a-z]/.test(indexSource));
ok('registry file is wired into the production harnesses',
  /'app\/core\/appSurface\.js',\s*'app\.js'/.test(read('.claude/skills/run-seyma/driver.mjs')) &&
  /'app\/core\/appSurface\.js',\s*'app\.js'/.test(read('.claude/skills/run-seyma/zikr-harness.mjs')));

console.log('\nMON-50 daily App surface boundary: ' + passed + '/' + passed + ' passed');
