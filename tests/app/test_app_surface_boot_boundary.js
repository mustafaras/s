// MON-54 boot/start/App-expose/late-boot boundary.
// Synthetic only: the registry cold-load must be side-effect free; app.js
// remains the owner of App exposure, data rebinds and the final call site.
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const read = (rel) => fs.readFileSync(path.join(repoRoot, rel), 'utf8');
const source = read('app/core/appSurface.js');
const app = read('app.js');
const index = read('index.html');
const expectedDependencies = [
  'data','ui','ensureStartData','ensureAuthData','motivation','featuresLive',
  'commit','reminderSchedulerDispatch','audio','save','render','document',
  'touch','setTimeout','matchMedia','addDays','todayStr','replayAnswerPopup',
  'maybeVoiceGreeting','sha256','authHash','toast',
];

let passed = 0;
function ok(label, value) {
  assert.equal(value, true, label);
  passed += 1;
  console.log('PASS  ' + label);
}

console.log('== MON-54 boot/start/App expose/late-boot boundary ==\n');

let forbiddenCalls = 0;
const coldWindow = {
  setTimeout() { forbiddenCalls += 1; throw new Error('timer during cold load'); },
  addEventListener() { forbiddenCalls += 1; throw new Error('listener during cold load'); },
  fetch() { forbiddenCalls += 1; throw new Error('network during cold load'); },
  localStorage: { getItem() { forbiddenCalls += 1; throw new Error('storage during cold load'); } },
};
const coldContext = { window: coldWindow };
vm.runInNewContext(source, coldContext, { filename: 'app/core/appSurface.js#cold' });
const surface = coldWindow.SeymaAppSurface;
ok('cold load exposes boot registry without eager side effects',
  surface && forbiddenCalls === 0 &&
  ['start','submitAuth','toggleRememberAuth','dismissAuthError','initialRender']
    .every((name) => typeof surface[name] === 'function'));
ok('boot dependency manifest is explicit and stable',
  JSON.stringify(surface.BOOT_DEPENDENCIES) === JSON.stringify(expectedDependencies));
ok('incomplete boot registration fails closed', surface.registerBootCallbacks({}) === false);
ok('boot registry source has no browser registration or network ownership',
  !/addEventListener|localStorage|fetch\(/.test(source.slice(source.indexOf('// MON-54: boot/start'))));

const calls = [];
const timers = [];
let currentData = null;
const ui = { forceStart: true, tab: 'onboarding', authRemember: false, authError: false, authUnlocked: false };
const fields = {
  'sey-auth-user': { value: '' },
  'sey-auth-pass': { value: '' },
};
const splash = { style: {}, note: { textContent: '' } };
const doc = {
  getElementById(id) {
    if (id === 'sey-auth-user') return fields[id];
    if (id === 'sey-auth-pass') return fields[id];
    if (id === 'sey-splash') return splash;
    if (id === 'sey-splash-note') return splash.note;
    if (id === 'root') return { id: 'root' };
    return null;
  },
};
const deps = {};
expectedDependencies.forEach((name) => { deps[name] = () => undefined; });
Object.assign(deps, {
  data: () => currentData,
  ui: () => ui,
  ensureStartData: () => {
    calls.push(['ensureStartData']);
    currentData = { settings: { launchRitual: false }, days: {} };
    return currentData;
  },
  ensureAuthData: () => {
    calls.push(['ensureAuthData']);
    currentData = { settings: { auth: {} }, days: {} };
    return currentData;
  },
  motivation: () => ({ ensureMotivationRoot: (data) => calls.push(['motivation', data]) }),
  featuresLive: () => true,
  commit: (...args) => calls.push(['commit', ...args]),
  reminderSchedulerDispatch: (...args) => calls.push(['reminder', ...args]),
  audio: () => ({ voice: (...args) => calls.push(['voice', ...args]) }),
  save: (...args) => calls.push(['save', ...args]),
  render: (...args) => calls.push(['render', ...args]),
  document: () => doc,
  touch: () => ({ install: (root) => calls.push(['touch', root && root.id]) }),
  setTimeout: (fn, ms) => { timers.push({ fn, ms }); calls.push(['setTimeout', ms]); return 'timer-' + timers.length; },
  matchMedia: () => () => ({ matches: false }),
  addDays: (date, delta) => { calls.push(['addDays', date, delta]); return '2026-09-12'; },
  todayStr: () => '2026-09-13',
  replayAnswerPopup: () => calls.push(['replayAnswerPopup']),
  maybeVoiceGreeting: () => calls.push(['maybeVoiceGreeting']),
  sha256: (value) => value,
  authHash: () => 'secret',
  toast: (...args) => calls.push(['toast', ...args]),
});
ok('complete boot registration succeeds once', surface.registerBootCallbacks(deps) === true);
ok('duplicate boot registration fails closed', surface.registerBootCallbacks(deps) === false);

currentData = { settings: { launchRitual: false }, days: {} };
ui.forceStart = true;
ui.tab = 'onboarding';
calls.length = 0;
surface.start();
ok('seeded start preserves render then reminder boot order',
  calls.map((entry) => entry[0]).join(',') === 'render,reminder');

currentData = null;
ui.forceStart = true;
ui.tab = 'onboarding';
calls.length = 0;
surface.start();
ok('onboarding start preserves ensure → motivation → commit → reminder order',
  calls.map((entry) => entry[0]).slice(0, 4).join(',') === 'ensureStartData,motivation,commit,reminder');
ok('onboarding start preserves one-time voice and save path',
  calls.some((entry) => entry[0] === 'voice') && calls.some((entry) => entry[0] === 'save' && entry[1] === false));

fields['sey-auth-user'].value = '';
fields['sey-auth-pass'].value = '';
calls.length = 0;
surface.submitAuth();
ok('empty auth keeps the original error/render path',
  ui.authError === true && calls.map((entry) => entry[0]).join(',') === 'render');

fields['sey-auth-user'].value = 'secret';
fields['sey-auth-pass'].value = 'secret';
currentData = null;
ui.authRemember = true;
calls.length = 0;
surface.submitAuth();
ok('auth late-boot preserves app-owned data rebind callback and state',
  currentData && currentData.settings.auth.usernameHash === 'secret' &&
  currentData.settings.auth.rememberMe === true && ui.authUnlocked === true &&
  calls.map((entry) => entry[0]).join(',') === 'ensureAuthData,save,render,toast');

// A fast second tap can arrive after the successful render removed the auth
// inputs from the DOM. The stale click must be harmless instead of reading
// `.value` from null and surfacing an intermittent login error.
delete fields['sey-auth-user'];
delete fields['sey-auth-pass'];
calls.length = 0;
assert.doesNotThrow(() => surface.submitAuth(), 'stale auth submit after rerender is ignored');
ok('stale auth submit after successful rerender is a no-op', calls.length === 0);
fields['sey-auth-user'] = { value: 'secret' };
fields['sey-auth-pass'] = { value: 'secret' };

ui.authRemember = false;
surface.toggleRememberAuth();
ok('post-expose remember handler remains delegated', ui.authRemember === true);
surface.dismissAuthError();
ok('post-expose auth error handler remains delegated', ui.authError === false && ui.authErrorMsg === '');

currentData = { settings: { launchRitual: true }, days: {} };
timers.length = 0;
calls.length = 0;
surface.initialRender();
ok('initial render keeps render/touch/reminder/save/timer order',
  calls.map((entry) => entry[0]).slice(0, 5).join(',') === 'render,touch,reminder,save,setTimeout' &&
  calls.filter((entry) => entry[0] === 'setTimeout').map((entry) => entry[1]).join(',') === '2200,900,900');
ok('initial render late splash guard keeps prior-day lookup and deferred callbacks',
  calls.some((entry) => entry[0] === 'addDays' && entry[2] === -1) &&
  timers.some((timer) => timer.ms === 2200) && timers.some((timer) => timer.ms === 900));
timers.find((timer) => timer.ms === 2200).fn();
timers.find((timer) => timer.ms === 900 && timer.fn !== timers.find((item) => item.ms === 900).fn).fn();
ok('initial render deferred callbacks resolve only when invoked', calls.some((entry) => entry[0] === 'maybeVoiceGreeting'));

const bootRegistration = app.indexOf('registerBootCallbacks(MON54_BOOT_DEPS)');
const appExpose = app.indexOf('window.App=App');
const initialRender = app.indexOf('SEYMA_APP_SURFACE.initialRender();');
ok('app.js registers boot dependencies before App.start and exposes App in place',
  bootRegistration >= 0 && bootRegistration < app.indexOf('App.start=function') && appExpose >= 0);
ok('App.start and post-expose auth handlers keep signature-preserving shims',
  /App\.start=function\(\)\{ return SEYMA_APP_SURFACE\.start\.apply\(null,arguments\); \}/.test(app) &&
  /App\.submitAuth=function\(\)\{ return SEYMA_APP_SURFACE\.submitAuth\.apply\(null,arguments\); \}/.test(app) &&
  /App\.toggleRememberAuth=function\(\)\{ return SEYMA_APP_SURFACE\.toggleRememberAuth\.apply\(null,arguments\); \}/.test(app) &&
  /App\.dismissAuthError=function\(\)\{ return SEYMA_APP_SURFACE\.dismissAuthError\.apply\(null,arguments\); \}/.test(app));
ok('window.App expose and post-expose handlers precede the final initial render',
  appExpose < app.indexOf('App.submitAuth=function') &&
  app.indexOf('App.dismissAuthError=function') < initialRender &&
  initialRender < app.indexOf("navigator.serviceWorker.addEventListener('message'"));
ok('data rebinds stay out of the registry and production cache-bust is paired',
  !/\bdata\s*=\s*(?:migrate|createDefaultData|null|d\b)/.test(source) &&
  /* P01: appSurface 20260921b -> 20260921c. Meşru: commit 9a2674a
     ("feat(ui): redesign header celestial timeline") app/core/appSurface.js'i
     44 satır değiştirdi; index.html sürümü bu commit'te 'c'ye çıktı. Pin 'b'de
     kalmıştı (bayat). app.js 20260921e → 20260922a (senkron durum metni
     teşhisi + dürüst hata banner'ı). */
  /app\/core\/appSurface\.js\?v=20260926e/.test(index) &&
  /app\.js\?v=20260926e/.test(index) &&
  index.indexOf('app/core/appSurface.js?') < index.indexOf('app.js?'));
ok('existing harness FILES keep appSurface immediately before app.js',
  /'app\/core\/appSurface\.js',\s*'app\.js'/.test(read('.claude/skills/run-seyma/driver.mjs')) &&
  /'app\/core\/appSurface\.js',\s*'app\.js'/.test(read('.claude/skills/run-seyma/zikr-harness.mjs')));

console.log('\nMON-54 boot boundary: ' + passed + '/' + passed + ' passed');
