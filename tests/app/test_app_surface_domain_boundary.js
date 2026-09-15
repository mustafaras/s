// MON-51 domain App-handler routing boundary.
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
  SeymaPrayer:['setPrayerCity','setPrayerMethod','togglePrayer','setPrayerNote','changeNafile'],
  SeymaZikr:['setZikrPreset','zikrManualApply','toggleZikrPause','startNewZikrHatim'],
  SeymaQuran:['quranNoteField','quranAddNote','openQuranJourney','closeQuranJourney','openQuranSurah','backToQuranLibrary','setQuranQuery','clearQuranQuery','setQuranFilter','resetQuranLens','toggleQuranFilters','onQuranKeydown'],
  SeymaSaygi:['openSaygiPreview','openSaygiCollectionPerson','browseSaygiPerson','closeSaygiPerson','markSaygiRead'],
  SeymaMotivation:['openRoom','closeRoom','updateRoom','setRoomTab','toggleRoomTool','toggleMotivationCard'],
  SeymaCrisis:['openCrisis','closeCrisis','toggleCrisisDropdown','toggleCrisisOpt','toggleCrisisTrigger','onCrisisNote','completeCrisis','resetCrisis'],
  SeymaJournal:['openJournalModal','closeJournalModal','setJournalMode','onJournalText','useJournalPrompt','saveJournal']
};
const names = Object.values(expected).flat();
let passed = 0;
function ok(label, value) { assert.equal(value, true, label); passed += 1; console.log('PASS  ' + label); }

console.log('== MON-51 domain App surface boundary ==\n');
const window = {};
for (const registry of Object.keys(expected)) window[registry] = {};
vm.runInNewContext(source, { window }, { filename: 'app/core/appSurface.js#cold' });
const surface = window.SeymaAppSurface;
ok('cold load exposes the domain dispatcher without registration side effects',
  surface && typeof surface.registerDomainHandlers === 'function' && typeof surface.domainHandler === 'function' &&
  names.every((name) => typeof window[surface.DOMAIN_HANDLER_REGISTRIES[name]][name] === 'undefined'));
ok('the binding map has exactly the approved 46 handlers', names.length === 46 && Object.keys(surface.DOMAIN_HANDLER_REGISTRIES).length === 46);
ok('each handler maps to its single approved domain registry',
  Object.entries(expected).every(([registry, handlers]) => handlers.every((name) => surface.DOMAIN_HANDLER_REGISTRIES[name] === registry)));
ok('incomplete registrations fail closed', surface.registerDomainHandlers({}) === false);

const calls = [];
const handlers = {};
for (const name of names) handlers[name] = function () { calls.push([name, ...arguments]); return 'return:' + name; };
// This one is already a public Zikr domain API in production; registration
// must retain it rather than replace its canonical implementation.
window.SeymaZikr.zikrManualApply = handlers.zikrManualApply;
ok('complete registration succeeds once', surface.registerDomainHandlers(handlers) === true);
ok('duplicate registration fails closed', surface.registerDomainHandlers(handlers) === false);
ok('existing Zikr domain API stays the canonical handler target', typeof window.SeymaZikr.zikrManualApply === 'function');
for (const name of names) {
  const result = surface.domainHandler(name, ['x', 2]);
  ok(name + ' preserves delegation arguments and return path', result === 'return:' + name && calls.some((call) => call[0] === name && call[1] === 'x' && call[2] === 2));
}
ok('unknown dispatches fail closed', (() => { try { surface.domainHandler('notAllowed', []); return false; } catch (_) { return true; } })());
ok('app.js registers the complete approved surface before exposing App',
  app.includes('registerDomainHandlers(MON51_DOMAIN_HANDLERS)') && app.indexOf('registerDomainHandlers(MON51_DOMAIN_HANDLERS)') < app.indexOf('window.App=App'));
ok('every handler keeps its exact App name through the shared signature-neutral shim',
  /Object\.keys\(MON51_DOMAIN_HANDLERS\)\.forEach\(function\(name\)\{ App\[name\]=function\(\)\{ return SEYMA_APP_SURFACE\.domainHandler\(name,arguments\); \}; \}\);/.test(app));
ok('forbidden GPS, transport, fetch and notification paths are absent from MON-51 binding',
  !/fetchPrayerLocationGPS|refreshPrayerTimes|quranJourneySubmit|quranJourneyWatch|quranJourneyQuestion|refreshQuranUpdates|refreshSaygi|requestReminderPermission/.test(app.slice(app.indexOf('var MON51_DOMAIN_HANDLERS'), app.indexOf('window.App=App'))));
ok('production loads appSurface before app.js with fresh cache versions',
  index.indexOf('app/core/appSurface.js?') < index.indexOf('app.js?') && /appSurface\.js\?v=20260915b/.test(index) && /app\.js\?v=20260915c/.test(index));

console.log('\nMON-51 domain App surface boundary: ' + passed + '/' + passed + ' passed');
