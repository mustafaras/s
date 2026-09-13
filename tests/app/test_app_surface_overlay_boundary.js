// MON-52 overlay/settings/message App-handler routing boundary.
// Synthetic only: no app boot, browser, localStorage, sync or network.
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
const expected = {
  SeymaLibrary:['openReading','closeReading','setReadingView','openWatching','closeWatching','setWatchView','openListening','closeListening','setListeningView','openLearning','closeLearning','openSoulActivity','closeSoulActivity','openSoulPracticePicker','closeSoulPracticePicker','pickSoulPractice','openSoulArchive','closeSoulArchive','setSoulArchiveFilter'],
  SeymaSettings:['setTheme','toggleTheme','toggleHaptic','setVoiceGuidance','setVoiceLang','setVoiceRate','setVoiceCloudVoice','setVoicePitch','setVoiceVoiceName','toggleSetting'],
  SeymaMessaging:['toggleMsg','toggleAeonBubble','openMesaj','showAeonHistory','toggleAeonSearch','clearAeonSearch','filterAeonSearch','aeonOpenAttachSheet','aeonCloseAttachSheet']
};
const names = Object.values(expected).flat();
let passed = 0;
function ok(label, value) { assert.equal(value, true, label); passed += 1; console.log('PASS  ' + label); }

console.log('== MON-52 overlay App surface boundary ==\n');
const window = {
  SeymaLibrary:Object.freeze({}),
  SeymaSettings:Object.freeze({}),
  SeymaMessaging:Object.freeze({})
};
vm.runInNewContext(source, { window }, { filename: 'app/core/appSurface.js#cold' });
const surface = window.SeymaAppSurface;
ok('cold load exposes the overlay dispatcher without registry mutation',
  surface && typeof surface.registerOverlayHandlers === 'function' && typeof surface.overlayHandler === 'function' &&
  Object.keys(window.SeymaLibrary).length === 0 && Object.keys(window.SeymaSettings).length === 0 && Object.keys(window.SeymaMessaging).length === 0);
ok('the binding map has exactly the approved 38 handlers', names.length === 38 && Object.keys(surface.OVERLAY_HANDLER_REGISTRIES).length === 38);
ok('each handler maps to its single approved owner registry',
  Object.entries(expected).every(([registry, handlers]) => handlers.every((name) => surface.OVERLAY_HANDLER_REGISTRIES[name] === registry)));
ok('incomplete registrations fail closed', surface.registerOverlayHandlers({}) === false);

const calls = [];
const handlers = {};
for (const name of names) handlers[name] = function () { calls.push([name, ...arguments]); return 'return:' + name; };
ok('complete registration succeeds without mutating frozen owner registries', surface.registerOverlayHandlers(handlers) === true &&
  Object.keys(window.SeymaLibrary).length === 0 && Object.keys(window.SeymaSettings).length === 0 && Object.keys(window.SeymaMessaging).length === 0);
ok('duplicate registration fails closed', surface.registerOverlayHandlers(handlers) === false);
for (const name of names) {
  const result = surface.overlayHandler(name, ['x', 2]);
  ok(name + ' preserves delegation arguments and return path', result === 'return:' + name && calls.some((call) => call[0] === name && call[1] === 'x' && call[2] === 2));
}
ok('unknown dispatches fail closed', (() => { try { surface.overlayHandler('notAllowed', []); return false; } catch (_) { return true; } })());
const binding = app.slice(app.indexOf('var MON52_OVERLAY_HANDLERS'), app.indexOf('// ── Magnezyum Danışmanı handlerları'));
ok('app.js registers the complete approved surface after handlers are defined',
  app.includes('registerOverlayHandlers(MON52_OVERLAY_HANDLERS)') && app.indexOf('var MON52_OVERLAY_HANDLERS') > app.indexOf('App.openMesaj=function'));
ok('every handler keeps its exact App name through the shared signature-neutral shim',
  /Object\.keys\(MON52_OVERLAY_HANDLERS\)\.forEach\(function\(name\)\{ App\[name\]=function\(\)\{ return SEYMA_APP_SURFACE\.overlayHandler\(name,arguments\); \}; \}\);/.test(binding));
ok('profile consent, permission, transport, send/upload and destructive actions are absent from MON-52 binding',
  !/profileConsent|requestReminderPermission|quranJourneySubmit|send|upload|record|deleteNotif|removeSoulArchiveSession/.test(binding));
ok('production loads appSurface before app.js with fresh cache versions',
  index.indexOf('app/core/appSurface.js?') < index.indexOf('app.js?') && /appSurface\.js\?v=20260913a/.test(index) && /app\.js\?v=20260913a/.test(index));

console.log('\nMON-52 overlay App surface boundary: ' + passed + '/' + passed + ' passed');
