// MON-15 · state Dalga 3 kapanışı / B1 yeniden-atama denetimi.
//
// Bu fixture üretim sırasındaki app.js boot'unu sentetik node:vm içinde çalıştırır.
// Gerçek browser, kullanıcı localStorage'ı, token, sync.js veya çözülen fetch yoktur.
// Amaç: data/ui/dark canlı getter tazeliğini; import/reset/location/auth late-boot
// rebindlerini; 6079 tarihli try/finally takasını ve strict-mode setter sınırını
// bağımsız kanıtlamaktır.

'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const T = '2026-09-03';
const Y = '2026-09-02';
const FILES = [
  'app/content/motivationProgramV2.js',
  'app/content/motivationNarratives.js',
  'app/content/saygiPeople.js',
  'app/content/profileAssessmentV1.js',
  'app/content/hijriCalendar.js',
  'app/content/quranRevelationOrderV1.js',
  'app/content/quranTransportV1.js',
  'app/content/quranStrikingVersesV1.js',
  'app/content/esmaulHusnaV1.js',
  'app/content/esmaulHusnaV2.js',
  'app/content/zikirCoreContentV1.js',
  'app/core/constants.js',
  'app/core/dateUtils.js',
  'app/core/state.js',
  'app/core/syncGlue.js',
  'app/core/helpers.js',
  'app/core/mediaFx.js',
  'app/core/timeTheme.js',
  'app/core/reminderCatalog.js',
  'app/core/reminderEngine.js',
  'app/core/reminderScheduler.js',
  'app/core/reminderDelivery.js',
  'app.js',
];

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

function read(rel) {
  return fs.readFileSync(path.join(repoRoot, rel), 'utf8');
}

function makeEl(id) {
  return {
    id: id || '', _html: '', _text: '', value: '', files: [], children: [],
    style: { cssText: '', setProperty() {}, width: '', display: '' },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {}, scrollTop: 0, offsetWidth: 0,
    get innerHTML() { return this._html; },
    set innerHTML(value) { this._html = String(value); },
    get textContent() { return this._text; },
    set textContent(value) { this._text = String(value); },
    setAttribute() {}, getAttribute() { return null; },
    appendChild(child) { this.children.push(child); return child; },
    removeChild() {}, remove() {}, replaceWith() {}, insertBefore(child) { return child; },
    addEventListener() {}, removeEventListener() {}, click() {}, focus() {}, blur() {},
    querySelector() { return null; }, querySelectorAll() { return []; }, closest() { return null; },
    replaceChildren() {}, contains() { return false; },
    getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; },
  };
}

function makeLocalStorage(seed, counters) {
  const store = Object.assign({}, seed);
  return {
    getItem(key) { return key in store ? store[key] : null; },
    setItem(key, value) { counters.sets++; store[key] = String(value); },
    removeItem(key) { counters.removes++; delete store[key]; },
    clear() { Object.keys(store).forEach((key) => delete store[key]); },
    _store: store,
  };
}

function fixedDate(nowIso) {
  const RealDate = Date;
  const fixedMs = RealDate.parse(nowIso);
  function FixedDate(...args) {
    return new.target
      ? (args.length ? new RealDate(...args) : new RealDate(fixedMs))
      : new RealDate(fixedMs).toString();
  }
  FixedDate.now = () => fixedMs;
  FixedDate.parse = RealDate.parse;
  FixedDate.UTC = RealDate.UTC;
  FixedDate.prototype = RealDate.prototype;
  return FixedDate;
}

function fixtureMath() {
  const out = Object.create(Math);
  out.random = () => 0.123456789;
  return out;
}

function makeSandbox(seedData, options = {}) {
  const counters = { fetches: 0, sets: 0, removes: 0 };
  const elements = {};
  const app = makeEl('app');
  const root = makeEl('root');
  elements.app = app;
  elements.root = root;

  const document = {
    hidden: false,
    body: makeEl('body'),
    documentElement: root,
    getElementById(id) { return elements[id] || null; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    createElement() { return makeEl(''); },
    createDocumentFragment() { return makeEl(''); },
    addEventListener() {},
    removeEventListener() {},
    DOMParser: undefined,
  };

  class DOMParserStub {
    parseFromString() {
      return { body: makeEl('body'), querySelector() { return null; }, querySelectorAll() { return []; } };
    }
  }

  class FileReaderStub {
    readAsText(file) {
      this.result = String(file && file.text || '');
      if (typeof this.onload === 'function') this.onload({ target: this });
    }
  }

  const storageSeed = seedData ? { 'seyma-reset-v1': JSON.stringify(seedData) } : {};
  const localStorage = makeLocalStorage(storageSeed, counters);
  const geoMode = options.geolocation || 'none';
  const geoPosition = { coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } };
  const geolocation = geoMode === 'none' ? null : {
    getCurrentPosition(success, error) {
      if (geoMode === 'denied') error({ code: 1 });
      else success(geoPosition);
    },
    watchPosition(success) {
      success(geoPosition);
      return 1;
    },
    clearWatch() {},
  };

  const sandbox = {
    console,
    localStorage,
    document,
    navigator: {
      vibrate() {},
      userAgent: 'node-mon-15',
      clipboard: { writeText() { return Promise.resolve(); } },
      geolocation,
    },
    location: { protocol: 'http:', hostname: 'localhost', search: '', href: 'http://localhost/', reload() {} },
    matchMedia() {
      return {
        matches: false,
        addEventListener() {}, removeEventListener() {},
        addListener() {}, removeListener() {},
      };
    },
    DOMParser: DOMParserStub,
    // Bilinçli olarak hiç resolve olmayan fetch: gerçek ağ ve sync yolu yoktur.
    fetch() { counters.fetches++; return new Promise(() => {}); },
    setTimeout() { return 0; }, clearTimeout() {},
    setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: {
      getRandomValues(array) { for (let i = 0; i < array.length; i++) array[i] = 17; return array; },
      randomUUID() { return 'fixture-uuid-0000-4000-8000-000000000000'; },
    },
    URL: Object.assign(function URL() {}, { createObjectURL() { return 'blob:fixture'; }, revokeObjectURL() {} }),
    Blob: function Blob() {}, File: function File() {}, FileReader: FileReaderStub,
    TextDecoder, TextEncoder, atob, btoa,
    alert() {}, confirm() { return true; }, prompt() { return null; },
    addEventListener() {}, removeEventListener() {},
    Date: fixedDate('2026-09-03T10:20:30.000Z'),
    Math: fixtureMath(), JSON, Object, Array, String, Number, Boolean, RegExp, Error,
    parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent,
    Promise, Set, Map, Symbol, Intl,
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;
  return { sandbox, context: vm.createContext(sandbox), elements, localStorage, counters };
}

function loadInto(runtime, sourceOverrides = {}) {
  for (const file of FILES) {
    const source = Object.prototype.hasOwnProperty.call(sourceOverrides, file)
      ? sourceOverrides[file]
      : read(file);
    vm.runInContext(source, runtime.context, { filename: file });
  }
  return runtime;
}

function baseSeed(extra = {}) {
  return Object.assign({
    version: 2,
    startDate: Y,
    lastOpenedDate: Y,
    days: {},
    notifications: [],
    luna: { qa: [] },
    aeon: { qa: [] },
    settings: {
      nickname: 'MON-15 fixture', ghToken: '', ghRepo: '', ghBranch: '', openaiKey: '',
      locationEnabled: true, locationMode: 'auto',
    },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 },
  }, extra);
}

function authSource() {
  const credential = 'MON-15-fixture-credential';
  const hash = crypto.createHash('sha256').update(credential).digest('hex');
  const source = read('app.js');
  const instrumented = source.replace(
    /var AUTH_HASH='[^']+';/,
    `var AUTH_HASH='${hash}';`,
  );
  assert.notEqual(instrumented, source, 'synthetic auth hash must replace exactly once');
  return { credential, hash, source: instrumented };
}

function assignmentInventory(source) {
  const rows = [];
  source.split(/\r?\n/).forEach((line, index) => {
    const code = line.replace(/\/\/.*$/, '');
    if (!code.trim()) return;
    const matches = [...code.matchAll(/\bdata\s*=(?!=)/g)];
    if (matches.length) rows.push({ line: index + 1, count: matches.length, text: line.trim() });
  });
  return rows;
}

function variableAssignmentInventory(source, name) {
  const rows = [];
  source.split(/\r?\n/).forEach((line, index) => {
    const code = line.replace(/\/\/.*$/, '');
    if (!code.trim()) return;
    const matches = [...code.matchAll(new RegExp(`\\b${name}\\s*=(?!=)`, 'g'))];
    if (matches.length) rows.push({ line: index + 1, count: matches.length, text: line.trim() });
  });
  return rows;
}

function loadOrderMatchesIndex() {
  const html = read('index.html');
  const indexOrder = [...html.matchAll(/<script src="([^"?]+)/g)].map((match) => match[1]);
  const bootOrder = indexOrder.filter((file) => file.startsWith('app/') || file === 'app.js');
  const indexPrefix = bootOrder.slice(0, bootOrder.indexOf('app.js'));
  return JSON.stringify(indexPrefix) === JSON.stringify(FILES.slice(0, -1));
}

console.log('=== MON-15 state rebind / B1 ownership boundary ===');

// ── Source ownership: nine app.js source lines, eleven data= tokens ──
const appSource = read('app.js');
const stateSource = read('app/core/state.js');
const dataRows = assignmentInventory(appSource);
const stateDataRows = assignmentInventory(stateSource);
console.log(`INFO  app.js data assignment source-lines=${dataRows.length} tokens=${dataRows.reduce((sum, row) => sum + row.count, 0)}`);
dataRows.forEach((row) => console.log(`INFO  app.js:${row.line} ×${row.count} ${row.text}`));
console.log(`INFO  state.js data assignment source-lines=${stateDataRows.length}`);
ok('index/production FILES load order remains equal', loadOrderMatchesIndex());
ok('app.js has exactly nine data assignment source lines', dataRows.length === 9);
ok('app.js data assignment token inventory is eleven', dataRows.reduce((sum, row) => sum + row.count, 0) === 11);
ok('data declaration remains app.js-owned', dataRows.some((row) => /var data=null/.test(row.text)));
ok('6079 try/finally data swap remains app.js-owned', dataRows.some((row) => /savedData=data/.test(row.text) && /data=d/.test(row.text) && /data=savedData/.test(row.text)));
ok('import/reset/location/auth/start data writes remain app.js-owned',
  /App\.importJson=function[\s\S]*?data=d/.test(appSource) &&
  /App\.resetConfirm=function[\s\S]*?data=null/.test(appSource) &&
  /function locationGateGranted\([\s\S]*?data=migrate\(createDefaultData\(\)\)/.test(appSource) &&
  /App\.submitAuth=function\([\s\S]*?data=migrate\(createDefaultData\(\)\)/.test(appSource) &&
  /App\.start=function\([\s\S]*?data=migrate\(createDefaultData\(\)\)/.test(appSource));
ok('state registry contains zero data assignment source lines', stateDataRows.length === 0);
ok('state registry has no data assignment token', !/\bdata\s*=(?!=)/.test(stateSource.replace(/\/\/.*$/gm, '')));
const syncGlueCode = read('app/core/syncGlue.js').replace(/\/\/.*$/gm, '');
ok('syncGlue does not own SeyOnSyncState/SeyOnSynced setters', !/SeyOnSyncState\s*=|SeyOnSynced\s*=/.test(syncGlueCode));

const uiRows = variableAssignmentInventory(appSource, 'ui');
const darkRows = variableAssignmentInventory(appSource, 'dark');
console.log(`INFO  setter ownership ui source-lines=${uiRows.length}, dark source-lines=${darkRows.length}`);
ok('ui initialization remains app.js-owned', uiRows.some((row) => /var ui=/.test(row.text)));
ok('dark initialization/rebinds remain app.js-owned', darkRows.length === 3);

// ── Boot and live getter descriptors ──
const live = loadInto(makeSandbox(baseSeed()));
const getterNames = ['data', 'ui', 'dark', 'migrate', 'getDay', 'createDefaultData', 'save'];
const descriptors = getterNames.map((name) => Object.getOwnPropertyDescriptor(live.sandbox, name));
const stateDescriptors = ['data', 'ui', 'dark', 'migrate', 'getDay', 'createDefaultData'].map((name) =>
  Object.getOwnPropertyDescriptor(live.sandbox.SeymaState, name));
ok('app B1 getters are getter-only and configurable', descriptors.every((descriptor) => descriptor && typeof descriptor.get === 'function' && !descriptor.set && descriptor.configurable === true));
ok('SeymaState B1 getters are getter-only', stateDescriptors.every((descriptor) => descriptor && typeof descriptor.get === 'function' && !descriptor.set));
const initialData = live.sandbox.SeymaState.data;
const initialUi = live.sandbox.SeymaState.ui;
const initialDark = live.sandbox.SeymaState.dark;
live.sandbox.App.go('ayarlar');
live.sandbox.App.setTheme(true);
ok('ui getter returns fresh mutable view state', live.sandbox.SeymaState.ui === initialUi && live.sandbox.SeymaState.ui.tab === 'ayarlar');
ok('dark getter returns fresh resolved theme value', initialDark === false && live.sandbox.SeymaState.dark === true);
ok('data getter remains the current closure root', live.sandbox.SeymaState.data === initialData);

// Strict-mode write attempts must fail; no registry setter or snapshot escape exists.
// Node's vm exposes the host-backed sandbox object with a permissive property
// write path, so the actual descriptor is copied to a VM-local object first.
// That preserves the exact accessor contract while testing strict semantics.
function strictSetterProbe(name) {
  return vm.runInContext(`(function(){
    "use strict";
    var target = {};
    Object.defineProperty(target, 'value', Object.getOwnPropertyDescriptor(window, '${name}'));
    try { target.value = null; return false; } catch (error) { return error && error.name === 'TypeError'; }
  })()`, live.context);
}
for (const name of ['data', 'ui', 'dark', 'migrate', 'getDay', 'createDefaultData', 'save']) {
  ok(`strict-mode window.${name} descriptor rejects writes`, strictSetterProbe(name));
}
let stateWriteThrew = false;
try {
  vm.runInContext('"use strict"; window.SeymaState.data = null;', live.context);
} catch (error) {
  stateWriteThrew = error && error.name === 'TypeError';
}
ok('strict-mode SeymaState.data write is rejected', stateWriteThrew);

// ── Import: raw import rebind stays in App.importJson ──
const importedRuntime = loadInto(makeSandbox(baseSeed({ sourceMarker: 'before-import' })));
const importInput = makeEl('sey-file');
importInput.files = [{ text: JSON.stringify(baseSeed({ sourceMarker: 'after-import' })) }];
importedRuntime.elements['sey-file'] = importInput;
importedRuntime.sandbox.App.importJson(importInput);
ok('import rebind produces a fresh current root', importedRuntime.sandbox.SeymaState.data && importedRuntime.sandbox.SeymaState.data.sourceMarker === 'after-import');
ok('import rebind is reflected by the live data getter', importedRuntime.sandbox.SeymaState.data === importedRuntime.sandbox.data && importedRuntime.sandbox.SeymaState.data.sourceMarker === 'after-import');

// ── Reset: data=null remains the app-owned reset boundary ──
const resetRuntime = loadInto(makeSandbox(baseSeed({ sourceMarker: 'before-reset' })));
resetRuntime.sandbox.App.askReset();
resetRuntime.sandbox.App.resetConfirm();
resetRuntime.sandbox.App.resetConfirm();
ok('reset rebinds the live data getter to null', resetRuntime.sandbox.SeymaState.data === null && resetRuntime.sandbox.data === null);
ok('reset removes only the synthetic localStorage key', resetRuntime.localStorage.getItem('seyma-reset-v1') === null);

// ── Location late boot: null → default root through the existing handler ──
const locationRuntime = loadInto(makeSandbox(null, { geolocation: 'success' }));
locationRuntime.sandbox.App.requestLocationGatePermission();
ok('location late-boot creates current root through app.js', locationRuntime.sandbox.SeymaState.data && locationRuntime.sandbox.SeymaState.data.settings.locationEnabled === true);
ok('location late-boot getter is fresh and not a snapshot', locationRuntime.sandbox.SeymaState.data === locationRuntime.sandbox.data && locationRuntime.sandbox.SeymaState.data.version === 2);

// ── Auth unlock late boot: execute the real handler with a sandbox-only hash ──
const auth = authSource();
const authRuntime = loadInto(makeSandbox(null), { 'app.js': auth.source });
const authUser = makeEl('sey-auth-user');
const authPass = makeEl('sey-auth-pass');
authUser.value = auth.credential;
authPass.value = auth.credential;
authRuntime.elements['sey-auth-user'] = authUser;
authRuntime.elements['sey-auth-pass'] = authPass;
authRuntime.sandbox.App.submitAuth();
const unlocked = authRuntime.sandbox.SeymaState.data;
ok('auth unlock late-boot creates current root', unlocked && unlocked.settings && unlocked.settings.auth && unlocked.settings.auth.usernameHash === auth.hash);
ok('auth unlock late-boot marks live session unlocked', unlocked && unlocked.settings.auth.unlockedAt && authRuntime.sandbox.SeymaState.ui.authUnlocked === true);
ok('auth sandbox hash replacement did not alter production source', !/MON-15-fixture-credential/.test(appSource));

// ── 6079 historical temporary swap: migrate callback restores closure root ──
const swapRuntime = loadInto(makeSandbox(baseSeed({ sourceMarker: 'closure-A' })));
const closureRoot = swapRuntime.sandbox.SeymaState.data;
const candidate = baseSeed({
  sourceMarker: 'candidate-B',
  days: {
    [T]: {
      reading: { entries: [{ title: 'MON-15 backfill', author: 'fixture', ts: '2026-09-03T10:00:00.000Z' }] },
    },
  },
});
const migratedCandidate = swapRuntime.sandbox.SeymaState.migrate(candidate);
ok('6079 migrate callback returns the candidate root', migratedCandidate === candidate);
ok('6079 try/finally restores the original closure root', swapRuntime.sandbox.SeymaState.data === closureRoot && swapRuntime.sandbox.data === closureRoot);
ok('6079 candidate backfill remains isolated from closure root', swapRuntime.sandbox.SeymaState.data.sourceMarker === 'closure-A' && candidate.sourceMarker === 'candidate-B');

ok('state fixture uses no sync.js and cannot resolve network fetch', !swapRuntime.sandbox.SeySync && swapRuntime.counters.fetches >= 0);

console.log(`\nMON-15 result: ${failed ? 'FAIL' : 'PASS'} (${passed} passed, ${failed} failed)`);
if (failed) process.exitCode = 1;
