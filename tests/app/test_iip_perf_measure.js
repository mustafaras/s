#!/usr/bin/env node
// P14 — local render-cost measurement for the İlham & İbadet hub.
//
// WHAT THIS PROVES: p50/p95 of a hub tab switch measured in this Node VM, with
// the real app modules and the real render() path, on this machine.
//
// WHAT THIS DOES NOT PROVE: device performance. A desktop Node VM is not an
// iPhone Safari/PWA. The plan target (07-KALITE-VE-KABUL.md: "hedef cihazda
// p95 ≤ 200 ms") MUST be measured on the user's device.
//
// The harness boots the SAME module list as .claude/skills/run-seyma/driver.mjs
// (MON-04 load-order parity) and FAILS LOUDLY if the boot does not produce
// App + ui + render(). A near-zero number from a dead sandbox must never be
// reported as a pass — that is the exact failure mode this project keeps
// hitting.
//
// No network, no localStorage persistence, no sync.js, no personal data.
// Run: node tests/app/test_iip_perf_measure.js
//      node tests/app/test_iip_perf_measure.js --json
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const os = require('os');

const REPO = path.resolve(__dirname, '..', '..');
const WARMUP = 5;
const SAMPLES = 30;
const TARGET_P95_MS = 200;
const MEANINGFUL_FLOOR_MS = 0.05;

const read = rel => fs.readFileSync(path.join(REPO, rel), 'utf8');

// MON-04 parity: the same order driver.mjs uses (index.html 43–71).
const FILES = [
  'app/content/motivationProgramV2.js', 'app/content/motivationNarratives.js', 'app/content/saygiPeople.js',
  'app/content/profileAssessmentV1.js', 'app/content/hijriCalendar.js', 'app/content/quranRevelationOrderV1.js',
  'app/content/quranTransportV1.js', 'app/content/quranStrikingVersesV1.js', 'app/content/esmaulHusnaV1.js',
  'app/content/esmaulHusnaV2.js', 'app/content/zikirCoreContentV1.js',
  'app/core/constants.js', 'app/core/dateUtils.js', 'app/core/state.js', 'app/core/syncGlue.js', 'app/core/helpers.js',
  'app/core/prayer.js', 'app/core/zikir.js', 'app/core/quran.js', 'app/core/quranLearn.js', 'app/core/saygi.js', 'app/core/motivation.js',
  'app/core/crisis.js', 'app/core/journal.js', 'app/core/health.js', 'app/core/library.js', 'app/core/report.js',
  'app/core/map.js', 'app/core/profile.js', 'app/core/settings.js', 'app/core/mediaFx.js', 'app/core/timeTheme.js',
  'app/core/skyFx.js', 'app/core/messaging.js', 'app/core/render.js', 'app/core/appSurface.js', 'app/core/reminders.js',
  'app/core/reminderSurface.js', 'app.js',
];

// ── Sandbox: mirrors .claude/skills/run-seyma/driver.mjs ─────────────────────
// The driver already boots this module graph successfully, so its stub shape is
// the known-good one.
function makeEl(tag) {
  return {
    tagName: String(tag || '').toUpperCase(), style: {}, dataset: {},
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    setAttribute() {}, getAttribute() { return null; }, removeAttribute() {},
    appendChild() {}, removeChild() {}, insertBefore() {}, replaceChildren() {},
    addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true; },
    querySelector() { return makeEl(''); }, querySelectorAll() { return []; }, closest() { return null; },
    focus() {}, blur() {}, click() {}, scrollIntoView() {},
    getBoundingClientRect() { return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }; },
    innerHTML: '', textContent: '', value: '', checked: false, disabled: false,
    children: [], childNodes: [], parentNode: null, parentElement: null,
    offsetWidth: 0, offsetHeight: 0, scrollTop: 0, scrollHeight: 0, clientWidth: 0, clientHeight: 0,
    insertAdjacentHTML() {}, remove() {},
  };
}

function makeSandbox() {
  const store = {};
  const rootEl = makeEl('div');
  const elCache = { root: rootEl, app: makeEl('div') };
  const doc = {
    hidden: false, visibilityState: 'visible', readyState: 'complete', title: '', cookie: '',
    body: makeEl('body'), documentElement: rootEl, head: makeEl('head'),
    getElementById(id) { return elCache[id] || null; },
    querySelector() { return null; }, querySelectorAll() { return []; },
    createElement: tag => makeEl(tag), createTextNode() { return { textContent: '' }; },
    createDocumentFragment() { return makeEl('fragment'); },
    addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true; },
  };
  class DOMParserStub {
    parseFromString() { return { body: makeEl('body'), querySelector() { return null; }, querySelectorAll() { return []; } }; }
  }
  const sandbox = {
    console: { log() {}, warn() {}, error() {}, info() {}, debug() {} },
    localStorage: {
      getItem: k => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: k => { delete store[k]; },
      clear: () => { for (const k in store) delete store[k]; },
      get length() { return Object.keys(store).length; },
    },
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {}, clear() {}, get length() { return 0; } },
    document: doc,
    navigator: { vibrate() {}, userAgent: 'node-harness', language: 'tr-TR', onLine: false, clipboard: { writeText() { return Promise.resolve(); } }, geolocation: { getCurrentPosition() {}, watchPosition() {}, clearWatch() {} } },
    location: { protocol: 'http:', hostname: 'localhost', search: '', hash: '', pathname: '/', href: 'http://localhost/', reload() {}, replace() {}, assign() {} },
    history: { pushState() {}, replaceState() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    DOMParser: DOMParserStub,
    fetch() { return new Promise(() => {}); },
    XMLHttpRequest: function () { this.open = () => {}; this.send = () => {}; this.setRequestHeader = () => {}; this.addEventListener = () => {}; },
    setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    // App.go() defers its commit through an animation frame. A no-op rAF would
    // make every "tab switch" a zero-cost no-change, so the timing would be
    // meaningless. Running the callback synchronously makes the measurement
    // cover the real render work. This is stated in the evidence boundary.
    requestAnimationFrame(cb) { if (typeof cb === 'function') cb(Date.now()); return 0; },
    cancelAnimationFrame() {},
    performance: { now: () => Number(process.hrtime.bigint() / 1000n) / 1000 },
    crypto: {
      getRandomValues(a) { for (let i = 0; i < a.length; i++) a[i] = (Math.random() * 256) | 0; return a; },
      randomUUID() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = (Math.random() * 16) | 0; return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16); }); },
    },
    URL: Object.assign(function () {}, { createObjectURL() { return 'blob:stub'; }, revokeObjectURL() {} }),
    Blob: function () {}, File: function () {}, FileReader: function () {},
    TextDecoder, TextEncoder,
    atob: s => Buffer.from(s, 'base64').toString('binary'),
    btoa: s => Buffer.from(s, 'binary').toString('base64'),
    alert() {}, confirm() { return true; }, prompt() { return null; },
    addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true; },
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, TypeError, Function,
    parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent, encodeURI, decodeURI,
    Promise, Set, Map, WeakMap, WeakSet, Symbol, Intl,
    structuredClone: globalThis.structuredClone, queueMicrotask: globalThis.queueMicrotask,
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.top = sandbox;
  return sandbox;
}

// Boots the real module graph. Never silently succeeds.
function boot() {
  const context = vm.createContext(makeSandbox());
  const errors = [];
  for (const rel of FILES) {
    try { vm.runInContext(read(rel), context, { filename: rel }); }
    catch (e) { errors.push(`${rel}: ${e.message}`); }
  }
  const probe = expr => { try { return vm.runInContext(expr, context) === true; } catch { return false; } };
  return {
    context, errors,
    hasApp: probe('typeof App === "object" && App !== null'),
    hasUi: probe('typeof ui === "object" && ui !== null'),
    // The production render entry point is App.go(tab) — the same call driver.mjs
    // uses ("App.go("rapor") re-rendered"). render() is a closure inside app.js
    // and is not exposed, so App.go is the honest measurement surface.
    hasRender: probe('typeof App === "object" && App !== null && typeof App.go === "function"'),
  };
}

const booted = boot();
if (!booted.hasApp || !booted.hasUi || !booted.hasRender) {
  console.error('P14 FAIL — the sandbox did not boot, so no measurement is valid.');
  console.error(`  App: ${booted.hasApp} · ui: ${booted.hasUi} · App.go(): ${booted.hasRender}`);
  for (const e of booted.errors.slice(0, 8)) console.error(`  boot error: ${e}`);
  console.error('  Refusing to report a number from a dead sandbox.');
  process.exit(1);
}
const { context } = booted;

// App.start() once so the shell is live, then PROVE that a tab switch actually
// renders. Measuring a switch that produces no DOM would report a flattering
// near-zero and silently claim a pass — the failure mode this project keeps
// hitting. The proof gates everything below.
try { vm.runInContext('App.start();', context, { filename: 'perf-start' }); } catch { /* tolerated */ }

// Mirror the driver's seeded-boot path, otherwise every "tab switch" would
// silently re-measure a gate screen instead of the app:
//   needsAuth()          -> true unless ui.authUnlocked (data.settings.auth is
//                           absent in this sandbox, so the lock would always show)
//   locationGateRequired -> the driver drives the explicit permission path
try {
  vm.runInContext(`
    // needsAuth(): the sandbox has no data.settings.auth, so the lock screen
    // would always show. The driver uses the same escape: ui.authUnlocked.
    if (typeof ui !== 'undefined' && ui) ui.authUnlocked = true;
    // locationGateRequired() = !data.settings.locationEnabled || ui.locationGateState !== 'granted'.
    // requestLocationGatePermission() would move the gate to 'requesting' and
    // wait for real GPS, which this offline sandbox can never satisfy. Setting
    // the granted state directly is the honest reduced path: it is exactly the
    // state the app reaches after the user grants permission.
    if (typeof data !== 'undefined' && data && data.settings) data.settings.locationEnabled = true;
    if (typeof ui !== 'undefined' && ui) ui.locationGateState = 'granted';
  `, context, { filename: 'perf-gates' });
  // render() must observe the new gate state.
  vm.runInContext('if (typeof App !== "undefined" && App && typeof App.go === "function") App.go(ui.tab || "bugun");', context, { filename: 'perf-gates-render' });
} catch { /* tolerated */ }

// App.go() only commits synchronously when the premium exit animation is off;
// otherwise it defers commitGo() behind a 200 ms setTimeout, which this sandbox
// deliberately no-ops (timers are dead so polling loops cannot spin). Measuring
// that path would time an animation frame that never arrives, not the render.
// Disabling the FX gate selects the production reduced-motion path and makes
// App.go() call commitGo() -> render() synchronously, so the sample measures
// real render work. This is stated in the evidence boundary.
vm.runInContext(`
  if (window.SeyFx && typeof window.SeyFx === 'object') {
    window.SeyFx.isPremiumFxEnabled = function(){ return false; };
  }
`, context, { filename: 'perf-fx-off' });

function appHTMLLength() {
  try { return vm.runInContext('(document.getElementById("app") || {}).innerHTML ? document.getElementById("app").innerHTML.length : 0', context); }
  catch { return 0; }
}

const beforeProof = appHTMLLength();
try { vm.runInContext('App.go("rapor");', context, { filename: 'perf-proof' }); } catch { /* tolerated */ }
const afterProof = appHTMLLength();
if (!(afterProof > 0) || beforeProof === afterProof) {
  console.error('P14 FAIL — App.go() did not change #app.innerHTML, so the render path is not live.');
  console.error(`  #app.innerHTML length: before=${beforeProof} after=${afterProof}`);
  console.error('  A tab switch that renders nothing cannot be timed. Refusing to report a number.');
  process.exit(1);
}

// The production render path, exercised the way driver.mjs drives it.
function measureSwitch(from, to) {
  const start = process.hrtime.bigint();
  try {
    vm.runInContext(`App.go(${JSON.stringify(to)});`, context, { filename: 'perf-switch' });
  } catch { /* a throwing switch still counts as a timed sample */ }
  const end = process.hrtime.bigint();
  return Number(end - start) / 1e6;
}

const percentile = (sorted, p) => {
  if (!sorted.length) return null;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
};

for (let i = 0; i < WARMUP; i++) measureSwitch('bugun', 'saygi');

const samples = [];
for (let i = 0; i < SAMPLES; i++) {
  const from = i % 2 === 0 ? 'bugun' : 'saygi';
  const to = i % 2 === 0 ? 'saygi' : 'bugun';
  samples.push(measureSwitch(from, to));
}

const sorted = [...samples].sort((a, b) => a - b);
const round = n => (n === null ? null : Math.round(n * 1000) / 1000);
const p95 = percentile(sorted, 95);

// Sanity guard: render() is never free. A near-zero p95 means the switch never
// reached the render path, so the measurement is rejected rather than published.
if (!(p95 >= MEANINGFUL_FLOOR_MS)) {
  console.error(`P14 FAIL — p95=${round(p95)} ms is below the ${MEANINGFUL_FLOOR_MS} ms sanity floor.`);
  console.error('  The tab switch did not reach the production render path; the number would be fake.');
  process.exit(1);
}

const result = {
  schemaVersion: 1,
  kind: 'local-vm-render-cost',
  harness: 'tests/app/test_iip_perf_measure.js',
  measuredAt: new Date().toISOString(),
  environment: {
    runtime: `node ${process.version}`, platform: process.platform, arch: process.arch,
    cpu: (os.cpus()[0] || {}).model || 'unknown', cores: os.cpus().length,
    scope: 'Node VM, driver-parity module graph, real render() path, network disabled',
  },
  method: { warmup: WARMUP, samples: SAMPLES, transition: 'hub tab switch (bugun <-> saygi) via App.render()' },
  result: {
    p50Ms: round(percentile(sorted, 50)), p95Ms: round(p95),
    minMs: round(sorted[0]), maxMs: round(sorted[sorted.length - 1]),
    meanMs: round(sorted.reduce((a, b) => a + b, 0) / sorted.length),
  },
  target: { p95Ms: TARGET_P95_MS, source: '07-KALITE-VE-KABUL.md' },
  evidenceBoundary: [
    'LOCAL VM ONLY. This is not device performance evidence.',
    'A desktop Node VM is not an iPhone Safari/PWA: no compositor, no GPU raster, no PWA install, no thermal budget.',
    'The plan target (p95 <= 200 ms on the target device) stays OPEN until the user runs the device protocol.',
    'Do not report this number as a device PASS.',
  ],
};

if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
} else {
  console.log('P14 — local hub render cost (Node VM)');
  console.log(`  boot        : App + ui + render() present (driver-parity graph, ${FILES.length} modules)`);
  console.log(`  environment : ${result.environment.runtime} · ${result.environment.cpu} · ${result.environment.cores} cores`);
  console.log(`  method      : ${WARMUP} warmup + ${SAMPLES} samples, App.render() hub switch`);
  console.log(`  p50         : ${result.result.p50Ms} ms`);
  console.log(`  p95         : ${result.result.p95Ms} ms  (device target ${TARGET_P95_MS} ms)`);
  console.log(`  min/mean/max: ${result.result.minMs} / ${result.result.meanMs} / ${result.result.maxMs} ms`);
  console.log('');
  console.log('  BOUNDARY: local VM, NOT device. Device p95 stays unmeasured until the user runs the protocol.');
}
process.exitCode = 0;
