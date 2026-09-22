// MON-53 timer/listener/foreground bridge boundary.
// Synthetic only: loading the registry must not touch DOM, timers, storage,
// network or another registry. app.js remains the registration owner.
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
const lifecycleStart = source.indexOf('// MON-53: global timer/listener/foreground bridges');
const lifecycleEnd = source.indexOf('// MON-54: boot/start/late-boot bridges', lifecycleStart);
const lifecycleSource = source.slice(lifecycleStart, lifecycleEnd > lifecycleStart ? lifecycleEnd : source.length);
const expected = [
  'onUserActivity','sessionHeartbeat','finalizeSession','resetSession',
  'onSessionVisibilityChange','maybeRetrySync','maybePullQuranForeground',
  'pollRemote','maybeVoiceGreeting','onAppForeground',
  'reconcileReminderStorageEvent','onDocumentVisibilityChange',
  'onWindowFocus','onWindowPageshow','onWindowOnline','onWindowOffline',
  'ambienceRefresh','reminderLifecycleTimer'
];

let passed = 0;
function ok(label, value) {
  assert.equal(value, true, label);
  passed += 1;
  console.log('PASS  ' + label);
}

console.log('== MON-53 timer/listener/foreground boundary ==\n');

let forbiddenCalls = 0;
const coldWindow = {
  setTimeout() { forbiddenCalls += 1; throw new Error('timer during cold load'); },
  setInterval() { forbiddenCalls += 1; throw new Error('timer during cold load'); },
  fetch() { forbiddenCalls += 1; throw new Error('network during cold load'); },
  localStorage: { getItem() { forbiddenCalls += 1; throw new Error('storage during cold load'); } },
};
const coldContext = { window: coldWindow };
vm.runInNewContext(source, coldContext, { filename: 'app/core/appSurface.js#cold' });
const surface = coldWindow.SeymaAppSurface;
ok('cold load exposes lifecycle registry without eager side effects',
  surface && forbiddenCalls === 0 && expected.every((name) => typeof surface[name] === 'function'));
ok('lifecycle module owns callback bodies but no browser registrations',
  !/(addEventListener|removeEventListener|setInterval|setTimeout|fetch\(|localStorage)/.test(lifecycleSource));
ok('dependency contract is explicit and non-empty',
  Array.isArray(surface.LIFECYCLE_DEPENDENCIES) && surface.LIFECYCLE_DEPENDENCIES.length >= 30);
ok('incomplete lifecycle registration fails closed', surface.registerLifecycleCallbacks({}) === false);

const calls = [];
const deps = {};
surface.LIFECYCLE_DEPENDENCIES.forEach((name) => {
  deps[name] = function () { calls.push([name, ...arguments]); };
});
deps.data = () => null;
deps.ui = () => ({ });
deps.document = () => ({ hidden: false });
deps.sync = () => null;
deps.audio = () => null;
deps.nowMs = () => 1000;
deps.todayStr = () => '2026-09-13';
deps.moveState = () => ({ watchId: null });
deps.getSessionState = () => ({ lastActivity: 0, idleMs: 0, closed: true });
deps.getEditHiddenAt = () => 0;
deps.app = () => ({ });
ok('complete lifecycle registration succeeds once', surface.registerLifecycleCallbacks(deps) === true);
ok('duplicate lifecycle registration fails closed', surface.registerLifecycleCallbacks(deps) === false);
surface.pollRemote(true);
ok('poll callback delegates in existing fetch → retry order',
  calls.map((call) => call[0]).join(',') === 'fetchObserverInbox,fetchHealthSync');
ok('runtime callback execution is the only path that reaches injected dependencies', calls.length > 0 && forbiddenCalls === 0);
ok('unknown callback names are not exposed', typeof surface.notAllowed === 'undefined');

ok('app.js registers lifecycle dependencies before global listener/timer bridge use',
  app.indexOf('registerLifecycleCallbacks(MON53_LIFECYCLE_DEPS)') > -1 &&
  app.indexOf('registerLifecycleCallbacks(MON53_LIFECYCLE_DEPS)') < app.indexOf('setInterval(sessionHeartbeat,60000)'));
ok('session activity listeners and heartbeat remain app.js-owned',
  /document\.addEventListener\('click',onUserActivity,true\)/.test(app) &&
  /document\.addEventListener\('input',onUserActivity,true\)/.test(app) &&
  /document\.addEventListener\('keydown',onUserActivity,true\)/.test(app) &&
  /document\.addEventListener\('scroll',onUserActivity,true\)/.test(app) &&
  /setInterval\(sessionHeartbeat,60000\)/.test(app));
ok('polling timer count, order and intervals remain unchanged',
  /setTimeout\(pollRemote,1500\)/.test(app) &&
  /setInterval\(pollRemote,30000\)/.test(app) &&
  /setInterval\(ambienceRefresh,30000\)/.test(app) &&
  /setInterval\(reminderLifecycleTick,REMINDER_LIFECYCLE_INTERVAL_MS\)/.test(app));
ok('foreground listener types and ordering remain app.js-owned',
  /window\.addEventListener\('storage',reconcileReminderStorageEvent\)/.test(app) &&
  /document\.addEventListener\('visibilitychange',function\(\)\{ return SEYMA_APP_SURFACE\.onDocumentVisibilityChange/.test(app) &&
  /window\.addEventListener\('focus',function\(\)\{ return SEYMA_APP_SURFACE\.onWindowFocus/.test(app) &&
  /window\.addEventListener\('pageshow',function\(\)\{ return SEYMA_APP_SURFACE\.onWindowPageshow/.test(app) &&
  /window\.addEventListener\('online',function\(\)\{ return SEYMA_APP_SURFACE\.onWindowOnline/.test(app) &&
  /window\.addEventListener\('offline',function\(\)\{ return SEYMA_APP_SURFACE\.onWindowOffline/.test(app));
ok('session teardown listeners stay in their original order',
  app.indexOf("window.addEventListener('beforeunload',finalizeSession)") < app.indexOf("window.addEventListener('pagehide',finalizeSession)") &&
  app.indexOf("window.addEventListener('pagehide',finalizeSession)") < app.indexOf("window.addEventListener('visibilitychange',onSessionVisibilityChange)"));
ok('sync retry and Quran foreground state no longer duplicate in app.js',
  !/var lastSyncRetryWatchdogAt=|var SYNC_RETRY_WATCHDOG_MS=|var quranLastForegroundPullAt=/.test(app));
/* P01: appSurface 20260921b -> 20260921c (commit 9a2674a appSurface.js'i
   gerçekten değiştirdi; index.html bu commit'te bump etti, test pini bayat kaldı). */
ok('production cache busts the changed registry and app shell together',
  /app\/core\/appSurface\.js\?v=20260921c/.test(index) && /app\.js\?v=20260922a/.test(index) &&
  index.indexOf('app/core/appSurface.js?') < index.indexOf('app.js?'));

console.log('\nMON-53 lifecycle boundary: ' + passed + '/' + passed + ' passed');
