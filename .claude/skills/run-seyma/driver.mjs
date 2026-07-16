#!/usr/bin/env node
// driver.mjs — headless render harness for the Şeyma app (app.js).
//
// WHY THIS EXISTS: opening index.html in a real browser is DANGEROUS here —
// a stale localStorage state with a valid ghToken auto-pushes and clobbers the
// real data repo (see CLAUDE.md "DATA SAFETY"). This driver runs app.js inside
// Node's `vm` with a minimal browser stub, so you can confirm the render path
// works (no ReferenceError/TypeError, expected HTML) WITHOUT a browser and
// WITHOUT any network. fetch never resolves; nothing is ever pushed.
//
// Usage:
//   node driver.mjs            # boot onboarding (no saved data) + seeded state,
//                              # drive tab switch / card toggle / theme toggle,
//                              # print assertions and HTML sizes.
//   node driver.mjs --dump bugun   # dump captured #app HTML for a tab to stdout
//
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

// This file lives at <repo>/.claude/skills/run-seyma/driver.mjs → repo is 3 up.
const REPO = process.env.SEYMA_REPO ||
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

const argv = process.argv.slice(2);
const dumpTab = argv.includes('--dump') ? argv[argv.indexOf('--dump') + 1] : null;

function today() {
  const d = new Date();
  const p = (n) => (n < 10 ? '0' : '') + n;
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

// Gerçek 174 itemId sırasını al (seedState()'in "tamamlanmış" tohum verisini gerçek
// itemId'lerle tutarlı kurabilmesi için — bkz. profileAssessmentComputeCurrentIndex).
const _paSrc = fs.readFileSync(path.join(REPO, 'profileAssessmentV1.js'), 'utf8');
const _paSandbox = { window: {}, console };
vm.createContext(_paSandbox);
vm.runInContext(_paSrc, _paSandbox, { filename: 'profileAssessmentV1.js' });
const PROFILE_ITEM_IDS = _paSandbox.window.ProfileAssessmentV1.sessions[0].items.map((it) => it.id);

// ── Fake DOM ────────────────────────────────────────────────────────────────
let appHTML = ''; // last innerHTML written to #app
function makeEl(id) {
  const el = {
    id: id || '',
    _html: '',
    style: { cssText: '', setProperty() {}, width: '', display: '' },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {},
    children: [],
    scrollTop: 0,
    offsetWidth: 0,
    value: '',
    files: [],
    get innerHTML() { return this._html; },
    set innerHTML(v) {
      this._html = String(v);
      if (this.id === 'app') appHTML = this._html;
    },
    get textContent() { return this._text || ''; },
    set textContent(v) { this._text = String(v); },
    setAttribute() {}, getAttribute() { return null; },
    appendChild(c) { this.children.push(c); return c; },
    removeChild() {}, remove() {}, replaceWith() {}, insertBefore(c) { return c; },
    addEventListener() {}, removeEventListener() {}, click() {},
    focus() {}, blur() {}, querySelector() { return null; },
    querySelectorAll() { return []; }, closest() { return null; },
    replaceChildren() {}, contains() { return false; },
    getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; },
  };
  return el;
}
const appEl = makeEl('app');
const rootEl = makeEl('root');
// #app and #root are the two mount points app.js hard-requires. Every other id
// is a transient node the app only *updates* if present (guarded by `if(el)`),
// so returning null for those exercises the same path the real DOM does on a
// fresh render. Returning a stub instead would mask bugs, so keep it null.
const elCache = { app: appEl, root: rootEl };

const doc = {
  hidden: false,
  body: makeEl('body'),
  documentElement: rootEl,
  getElementById(id) { return elCache[id] || null; },
  querySelector() { return null; },
  querySelectorAll() { return []; },
  createElement() { return makeEl(''); },
  createDocumentFragment() { return makeEl(''); },
  addEventListener() {}, removeEventListener() {},
  DOMParser: undefined,
};

// Minimal DOMParser so saygi HTML parsing doesn't throw (returns empty-ish doc).
class DOMParserStub {
  parseFromString() {
    return { body: makeEl('body'), querySelector() { return null; }, querySelectorAll() { return []; } };
  }
}

// ── Fake browser globals ─────────────────────────────────────────────────────
function makeLocalStorage(seed) {
  const store = Object.assign({}, seed);
  return {
    getItem(k) { return k in store ? store[k] : null; },
    setItem(k, v) { store[k] = String(v); },
    removeItem(k) { delete store[k]; },
    clear() { for (const k in store) delete store[k]; },
    _store: store,
  };
}

function buildSandbox(seedData) {
  const seed = {};
  if (seedData) seed['seyma-reset-v1'] = JSON.stringify(seedData);
  const localStorage = makeLocalStorage(seed);
  const sandbox = {
    console,
    localStorage,
    document: doc,
    navigator: {
      vibrate() {}, userAgent: 'node-harness',
      clipboard: { writeText() { return Promise.resolve(); } },
      geolocation: null,
    },
    location: { protocol: 'http:', hostname: 'localhost', search: '', href: 'http://localhost/', reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    DOMParser: DOMParserStub,
    // fetch NEVER resolves → pollRemote / sync no-op, zero network.
    fetch() { return new Promise(() => {}); },
    // timers are no-ops → suppress pollRemote / replayAnswerPopup loops
    setTimeout() { return 0; }, clearTimeout() {},
    setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(a) { for (let i = 0; i < a.length; i++) a[i] = (Math.random() * 256) | 0; return a; },
              randomUUID() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => { const r = (Math.random() * 16) | 0; return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16); }); } },
    URL: Object.assign(function () {}, { createObjectURL() { return 'blob:stub'; }, revokeObjectURL() {} }),
    Blob: function () {}, File: function () {}, FileReader: function () {},
    TextDecoder, TextEncoder, atob, btoa,
    alert() {}, confirm() { return true; }, prompt() { return null; },
    addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error,
    parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent,
    Promise, Set, Map, Symbol, Intl,
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;
  return sandbox;
}

function loadInto(sandbox, files) {
  const ctx = vm.createContext(sandbox);
  for (const f of files) {
    const src = fs.readFileSync(path.join(REPO, f), 'utf8');
    vm.runInContext(src, ctx, { filename: f });
  }
  return ctx;
}

// ── Run ──────────────────────────────────────────────────────────────────────
function seedState() {
  const t = today();
  return {
    version: 2, startDate: t, lastOpenedDate: t, days: {
      [t]: { habits: {}, mood: 'ok', meals: {}, mealItems: {}, intention: 'test', savedAt: new Date().toISOString() },
    },
    notifications: [], luna: { qa: [] }, aeon: { qa: [] },
    settings: {
      nickname: 'Sevgili Günışığı', ghToken: '', ghRepo: 'mustafaras/seyma-data',
      // app.js auth gate açılması için rememberMe + geçerli usernameHash + unlockedAt gerekli.
      auth: {
        rememberMe: true,
        usernameHash: 'ae9e1ed2b6abcbce74cc0c15719fdbba372a7dd62e6232510656bade7c201af4',
        unlockedAt: new Date().toISOString(),
      },
    },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 },
    // Faz 05: render() artık `profileAssessment.status!=='completed'` iken ana sekmeleri
    // (bugun/rapor/vb.) kilitler. Bu driver bugun/rapor/tema gibi GENEL render akışını test
    // ettiği için, "mevcut kullanıcı" tohumu zaten TAMAMLAMIŞ sayılır — gate'in kendi
    // davranışı (kilit/rıza/soru ekranı) ayrı `verify-profile-assessment-gate.mjs`'de test edilir.
    profileAssessment: {
      schemaVersion: 2, deliveryMode: 'single_session', status: 'completed',
      startedAt: t + 'T09:00:00.000Z', completedAt: t + 'T09:30:00.000Z', currentItemIndex: 174,
      consent: { version: '1.0.0', informationShownAt: t + 'T09:00:00.000Z', acceptedAt: t + 'T09:00:05.000Z', profileProcessingAccepted: true, sensitiveDataAccepted: true, panelSummarySharingAccepted: false },
      // status:'completed' ile tutarlı olsun diye tüm 174 gerçek itemId cevaplanmış sayılır
      // (aksi halde ensureProfileAssessment tutarsızlığı fark edip status'u 'active'e çeker).
      responses: Object.fromEntries(PROFILE_ITEM_IDS.map((id, i) => [id, { value: 4, scoredValue: 4, shownAt: t + 'T09:00:00.000Z', answeredAt: t + 'T09:00:05.000Z', responseMs: 5000, revisionCount: 0, itemVersion: '1.0.0', sessionId: 'SINGLE', sequence: i + 1 }])),
      moduleProgress: {}, scores: {}, quality: {}, report: {}, panelSummary: {},
    },
  };
}

function assert(name, cond) {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
  if (!cond) process.exitCode = 1;
}

const FILES = ['motivationProgramV2.js', 'profileAssessmentV1.js', 'app.js'];

console.log('== boot: onboarding (no saved data) ==');
appHTML = '';
let sb1 = buildSandbox(null);
let ctx1 = loadInto(sb1, FILES);
assert('onboarding render produced HTML', appHTML.length > 200);
assert('window.App exposed', typeof sb1.App === 'object' && !!sb1.App);

console.log('\n== boot: seeded state ==');
appHTML = '';
let sb2 = buildSandbox(seedState());
let ctx2 = loadInto(sb2, FILES);
assert('seeded render produced HTML', appHTML.length > 1000);

// Boot always shows the onboarding gate first, even with saved data (app.js
// render(): `if(!data || ui.forceStart) return onboardingHTML()`, and `ui.forceStart`
// defaults to true). A real user dismisses it once per fresh profile by tapping
// "Tamam ..., başlayalım" → App.start(). With `data` already set, App.start() just
// flips ui.forceStart=false and renders the real "bugun" tab — do the same here,
// otherwise every assertion below silently re-tests the onboarding screen instead
// of the app (that's what made "has bottom nav" FAIL despite seeded data).
if (sb2.App && typeof sb2.App.start === 'function') {
  appHTML = '';
  sb2.App.start();
}
assert('has bottom nav (bugun tab)', /App\.go\(/.test(appHTML) || /bugun/i.test(appHTML));

console.log('\n== drive: interactions ==');
// switch to rapor tab
if (sb2.App && typeof sb2.App.go === 'function') {
  appHTML = '';
  sb2.App.go('rapor');
  assert('App.go("rapor") re-rendered', appHTML.length > 500);
}
// toggle a card open then force re-render via theme toggle
if (sb2.App && typeof sb2.App.go === 'function') {
  sb2.App.go('bugun');
  if (typeof sb2.App.toggleCard === 'function') sb2.App.toggleCard('habits');
  appHTML = '';
  if (typeof sb2.App.setTheme === 'function') sb2.App.setTheme(true);
  assert('theme toggle re-rendered (dark)', appHTML.length > 500);
}

if (dumpTab && sb2.App && typeof sb2.App.go === 'function') {
  appHTML = '';
  sb2.App.go(dumpTab);
  fs.writeFileSync('/tmp/seyma-dump.html', appHTML);
  console.log(`\n[dump] tab "${dumpTab}" → /tmp/seyma-dump.html (${appHTML.length} bytes)`);
}

console.log('\nDone.');
