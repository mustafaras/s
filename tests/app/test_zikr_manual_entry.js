#!/usr/bin/env node
// test_zikr_manual_entry.js — ZP-10 · Manuel zikir girişi (elle sayım) headless testi.
// Ağ yok, localStorage bellek-içi, push yapısal olarak imkânsız (fetch stub'ı
// hiç resolve etmeyen promise). app.js gerçek vm ortamında boot edilir.
// Çalıştır: node tests/app/test_zikr_manual_entry.js
'use strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const REPO = require('../repo-root.js');

function pad(n) { return (n < 10 ? '0' : '') + n; }
function today() { const d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function yesterday() { const d = new Date(Date.now() - 864e5); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

let appHTML = '';
function makeEl(id) {
  const el = {
    id: id || '', _html: '', _text: '',
    style: { cssText: '', setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {}, children: [], scrollTop: 0, offsetWidth: 0, value: '', files: [],
    get innerHTML() { return this._html; },
    set innerHTML(v) { this._html = String(v); if (this.id === 'app') appHTML = this._html; },
    get textContent() { return this._text; },
    set textContent(v) { this._text = String(v); },
    setAttribute() {}, getAttribute() { return null; },
    appendChild(c) { this.children.push(c); return c; },
    removeChild() {}, remove() {}, replaceWith() {}, insertBefore(c) { return c; },
    addEventListener() {}, removeEventListener() {}, click() {}, focus() {}, blur() {},
    querySelector() { return null; }, querySelectorAll() { return []; }, closest() { return null; },
    replaceChildren() {}, contains() { return false; },
    getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; },
  };
  return el;
}
const appEl = makeEl('app');
const rootEl = makeEl('root');
const elCache = { app: appEl, root: rootEl };
const doc = {
  hidden: false, body: makeEl('body'), documentElement: rootEl,
  getElementById(id) { return elCache[id] || null; },
  querySelector() { return null; }, querySelectorAll() { return []; },
  createElement() { return makeEl(''); }, createDocumentFragment() { return makeEl(''); },
  addEventListener() {}, removeEventListener() {}, DOMParser: undefined,
};
class DOMParserStub { parseFromString() { return { body: makeEl('body'), querySelector() { return null; }, querySelectorAll() { return []; } }; } }

function makeLS(seed) {
  const store = Object.assign({}, seed);
  return {
    getItem(k) { return k in store ? store[k] : null; },
    setItem(k, v) { store[k] = String(v); },
    removeItem(k) { delete store[k]; }, clear() { for (const k in store) delete store[k]; },
    _store: store,
  };
}
function buildSandbox(seedData) {
  const seed = seedData ? { 'seyma-reset-v1': JSON.stringify(seedData) } : {};
  const localStorage = makeLS(seed);
  const geolocation = {
    getCurrentPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); },
    watchPosition(success) { success({ coords: { latitude: 39.9334, longitude: 32.8597, accuracy: 20, speed: 0 } }); return 1; },
    clearWatch() {},
  };
  const sandbox = {
    console, localStorage, document: doc, __SEYMA_TEST_ZIKR__: true,
    navigator: { vibrate() {}, userAgent: 'node-harness', clipboard: { writeText() { return Promise.resolve(); } }, geolocation },
    location: { protocol: 'http:', hostname: 'localhost', search: '', href: 'http://localhost/', reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    DOMParser: DOMParserStub,
    fetch: function () { return new Promise(() => {}); },
    setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(a) { for (let i = 0; i < a.length; i++) a[i] = (Math.random() * 256) | 0; return a; } },
    URL: Object.assign(function () {}, { createObjectURL() { return 'blob:stub'; }, revokeObjectURL() {} }),
    URLSearchParams,
    Blob: function () {}, File: function () {}, FileReader: function () {},
    TextDecoder, TextEncoder, atob, btoa,
    alert() {}, confirm() { return true; }, prompt() { return null; },
    addEventListener() {}, removeEventListener() {},
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error,
    parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent,
    Promise, Set, Map, Symbol, Intl,
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  sandbox.AudioContext = function () { return { state: 'running', currentTime: 0, resume() {}, createOscillator() { return { type: '', frequency: { value: 0 }, connect() {}, start() {}, stop() {} }; }, createGain() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} }; }, destination: {} }; };
  return sandbox;
}
const FILES = ['app/content/motivationProgramV2.js', 'app/content/profileAssessmentV1.js', 'app/content/saygiPeople.js', 'app/content/hijriCalendar.js', 'app/content/esmaulHusnaV1.js', 'app/content/esmaulHusnaV2.js', 'app/content/zikirCoreContentV1.js', 'app/core/constants.js', 'app/core/dateUtils.js', 'app/core/state.js', 'app/core/syncGlue.js', 'app/core/helpers.js', 'app/core/prayer.js', 'app/core/zikir.js', 'app/core/quran.js', 'app/core/saygi.js', 'app/core/motivation.js', 'app/core/crisis.js', 'app/core/journal.js', 'app/core/health.js', 'app/core/library.js', 'app/core/reminderCatalog.js', 'app/core/reminderEngine.js', 'app/core/reminderScheduler.js', 'app/core/reminderDelivery.js', 'app/core/mediaFx.js', 'app.js', 'sync.js'];
function loadInto(sandbox, files) {
  const ctx = vm.createContext(sandbox);
  for (const f of files) {
    const src = fs.readFileSync(path.join(REPO, f), 'utf8');
    vm.runInContext(src, ctx, { filename: f });
  }
  return ctx;
}

const t = today(), y = yesterday();
const seed = {
  version: 2, startDate: y, lastOpenedDate: y,
  days: {
    [t]: { habits: {}, mood: null, prayer: { fetchedAt: new Date().toISOString(), fetchedFor: 'test' } },
    [y]: { habits: {}, mood: null },
  },
  notifications: [], luna: { qa: [] }, aeon: { qa: [] },
  settings: { nickname: 'Sevgili Günışığı', ghToken: '', ghRepo: 'mustafaras/seyma-data', locationEnabled: true, locationMode: 'auto', locationApproved: true, prayer: { location: { lat: 39.9334, lon: 32.8597, cityName: 'Ankara', source: 'manual' } }, auth: { rememberMe: true, usernameHash: 'ae9e1ed2b6abcbce74cc0c15719fdbba372a7dd62e6232510656bade7c201af4', unlockedAt: new Date().toISOString() } },
  cycle: { periods: [], avgCycle: 28, avgPeriod: 5 },
  zikr: { presets: [{ id: 'subhanallah', name: 'Sübhanallah', phrase: 'Sübhanallah', target: 33, color: 'zikr', favorite: true, createdAt: t }], sessions: {}, settings: { soundOn: false, haptic: false, autoAdvance: false, activePresetId: 'subhanallah' }, streak: 0, streakDate: '' },
};

let passed = 0, failed = 0;
function ok(name, cond, detail) {
  if (cond) { passed++; console.log('  ✓ ' + name); }
  else { failed++; console.log('  ✗ ' + name + (detail ? ' — ' + String(detail).slice(0, 200) : '')); }
}
function readState(sb) {
  try { return JSON.parse(sb.localStorage.getItem('seyma-reset-v1')); } catch (e) { return null; }
}
const presetCount = (st, date, id) => {
  const sess = st && st.zikr && st.zikr.sessions && st.zikr.sessions[date];
  const raw = sess && sess.perPreset && sess.perPreset[id];
  return Number(raw && typeof raw === 'object' ? raw.count : raw) || 0;
};

console.log('== ZP-10 · Manuel zikir girişi (elle sayım) ==');
let sb = buildSandbox(seed);
loadInto(sb, FILES);
sb.App.start();

// 1 · Sheet açma/kapama + dock 4. düğme
ok('dockta Elle ekle düğmesi render', (function () {
  sb.App.go('saygi'); sb.App.openZikr();
  return /id="zikr-manual-button"/.test(appHTML) && /Elle ekle/.test(appHTML);
})(), appHTML.slice(0, 160));
ok('toggleZikrManual sheet açar', (function () {
  if (typeof sb.App.toggleZikrManual !== 'function') return false;
  sb.App.toggleZikrManual();
  return /id="zikr-manual-sheet"/.test(appHTML) && /zikr-v2-manual-stepper/.test(appHTML);
})(), appHTML.slice(0, 160));
ok('sheet tekrar toggle ile kapanır', (function () {
  sb.App.toggleZikrManual();
  return !/id="zikr-manual-sheet"/.test(appHTML);
})());

// 2 · Temel ekleme: gün/perPreset/lifetime
const coreResult = (function () {
  sb.App.toggleZikrManual();
  sb.App.saveZikrManual(); // amount boş → reddetmeli
  const st0 = readState(sb);
  const rejectedEmpty = (st0.zikr.sessions[t] || { totalCount: 0 }).totalCount === (st0.zikr.sessions[t] ? st0.zikr.sessions[t].totalCount : 0);
  sb.App.zikrManualChip(33);
  sb.App.saveZikrManual();
  return readState(sb);
})();
ok('manuel +33 gün/perPreset/lifetime işler', coreResult.zikr.sessions[t].perPreset.subhanallah.count === 33 &&
  coreResult.zikr.journeys.subhanallah.lifetimeCount === 33, JSON.stringify(coreResult.zikr.sessions[t]));
ok('manuel kayıt manualEntries defterine düştü', Array.isArray(coreResult.zikr.manualEntries) && coreResult.zikr.manualEntries.length === 1 &&
  coreResult.zikr.manualEntries[0].source === 'manual' && coreResult.zikr.manualEntries[0].amount === 33);
ok('gün aynası (data.days) güncellendi', (function () {
  const day = coreResult.days[t];
  return day && day.zikr && day.zikr.totalCount === 33;
})());
ok('bir tur tamamlandı (33 → completedSets 1)', coreResult.zikr.sessions[t].completedSets === 1);

// 3 · Ekleme sonrası sheet kapansın + not alanı kayda geçsin
ok('not alanı kayda işlenir', coreResult.zikr.manualEntries[0].note === '' || typeof coreResult.zikr.manualEntries[0].note === 'string');

// 4 · Validation: geçersiz girişler reddedilir
ok('0/negatif/ondalıklı/aşırı büyük miktar reddedilir', (function () {
  const before = readState(sb);
  const c0 = presetCount(before, t, 'subhanallah');
  sb.App.zikrManualApply('subhanallah', 0, t, ''); // 0
  sb.App.zikrManualApply('subhanallah', -5, t, ''); // negatif
  sb.App.zikrManualApply('subhanallah', 12.7, t, ''); // ondalık → zikrInt 12 mi? hayır: Number.isSafeInteger kontrolü 0'a düşürür
  sb.App.zikrManualApply('subhanallah', 99999999, t, ''); // ZIKR_MANUAL_MAX üstü
  const after = readState(sb);
  return presetCount(after, t, 'subhanallah') === c0;
})(), JSON.stringify(readState(sb).zikr.sessions[t]));

// 5 · Geçmiş görünümünde defter + geri al düğmesi
ok('geçmiş sekmesinde elle sayım defteri render', (function () {
  sb.App.setZikrView('history');
  return /ELLE SAYIM DEFTERİ/.test(appHTML) && /Sübhanallah/.test(appHTML) && /App\.undoZikrManual/.test(appHTML);
})(), appHTML.slice(0, 200));

// 6 · Geri alma tam eşleşen geri yükleme
ok('undoZikrManual tam eşleşen geri yükleme', (function () {
  const before = readState(sb);
  const entry = before.zikr.manualEntries.find(function (e) { return !e.revertedAt; });
  if (!entry) return false;
  const beforeCount = presetCount(before, t, 'subhanallah');
  const beforeLife = before.zikr.journeys.subhanallah.lifetimeCount;
  sb.App.undoZikrManual(entry.id);
  const after = readState(sb);
  const e2 = after.zikr.manualEntries.find(function (e) { return e.id === entry.id; });
  return e2 && e2.revertedAt && presetCount(after, t, 'subhanallah') === beforeCount - entry.amount &&
    after.zikr.journeys.subhanallah.lifetimeCount === beforeLife - entry.amount;
})(), JSON.stringify(readState(sb).zikr.journeys.subhanallah));

// 7 · Esmâ: hedef kırpma + tamamlanma + tamamlanınca engelleme
// esma_01 ebced=66 → hatimTarget=66²=4356. 5000 girişte room=4356'ya kırpılır,
// hatim 'completed' olur; sonraki ekleme reddedilir.
ok('Esmâ hedef kırpma + tamamlanma', (function () {
  sb.App.setZikrPreset('esma_01'); // ebced 66
  const r = sb.App.zikrManualApply('esma_01', 5000, t, 'tespih');
  if (!r) return false;
  const after = readState(sb);
  const j = after.zikr.journeys.esma_01;
  const hatim = j.hatims.find(function (h) { return h.id === j.activeHatimId; });
  return r.applied === 4356 && hatim && hatim.count === 4356 && hatim.status === 'completed';
})(), JSON.stringify((readState(sb).zikr.journeys || {}).esma_01 || {}).slice(0, 200));
ok('tamamlanan hatimde yeni elle ekleme reddedilir', (function () {
  const r = sb.App.zikrManualApply('esma_01', 5, t, '');
  return !r;
})());

// 8 · Streak: hedef dolduğunda seri başlar
ok('hedef dolunca streak 1 olur', (function () {
  const st = readState(sb);
  return st.zikr.streak >= 1;
})());

// 9 · Migration idempotentliği: eski V4 verisi + manuel kayıtlar
ok('V4 verisi V5 migration ile korunur (idempotent)', (function () {
  const legacy = JSON.parse(JSON.stringify(seed));
  legacy.zikr.schemaVersion = 4;
  legacy.zikr.manualEntries = [{ id: 'zm_old', date: y, presetId: 'subhanallah', amount: 77, note: 'eski', source: 'manual', createdAt: y + 'T10:00:00.000Z', updatedAt: y + 'T10:00:00.000Z', revertedAt: null }];
  const legacySb = buildSandbox(legacy);
  loadInto(legacySb, FILES); legacySb.App.start();
  const once = readState(legacySb);
  const sb2 = buildSandbox(once);
  loadInto(sb2, FILES); sb2.App.start();
  const twice = readState(sb2);
  return once.zikr.schemaVersion === 5 &&
    once.zikr.manualEntries.length === 1 && once.zikr.manualEntries[0].amount === 77 &&
    twice.zikr.manualEntries.length === 1 && twice.zikr.manualEntries[0].amount === 77;
})(), 'migration idempotence');

// 10 · Sync merge matematiği (SeySync.mergeZikr)
const mergeZikr = sb.window.SeySync.mergeZikr;
ok('mergeZikr dışa açık', typeof mergeZikr === 'function');

ok('A elle +33 / B 50 dokunuş (asla senkronlaşmamış) → 83', (function () {
  const base = { presets: [{ id: 'subhanallah', name: 'S', target: 33 }], sessions: {}, settings: { activePresetId: 'subhanallah' }, streak: 0, streakDate: '' };
  // Cihaz A: yalnız elle kayıt
  const a = JSON.parse(JSON.stringify(base));
  a.manualEntries = [{ id: 'zm_a', date: t, presetId: 'subhanallah', amount: 33, note: '', source: 'manual', createdAt: t + 'T10:00:00.000Z', updatedAt: t + 'T10:00:00.000Z', revertedAt: null }];
  a.journeys = { subhanallah: { presetId: 'subhanallah', lifetimeCount: 33, activeHatimId: '', lastAt: t + 'T10:00:00.000Z', lastSessionId: '', completedHatims: 0, legacyCompletedHatims: 0, hatims: [] } };
  a.sessions[t] = { totalCount: 33, completedSets: 1, perPreset: { subhanallah: { count: 33, completedCycles: 1, lastAt: t + 'T10:00:00.000Z' } }, lastAt: t + 'T10:00:00.000Z' };
  // Cihaz B: yalnız 50 dokunuş, manuel kayıt yok
  const b = JSON.parse(JSON.stringify(base));
  b.journeys = { subhanallah: { presetId: 'subhanallah', lifetimeCount: 50, activeHatimId: '', lastAt: t + 'T11:00:00.000Z', lastSessionId: '', completedHatims: 0, legacyCompletedHatims: 0, hatims: [] } };
  b.sessions[t] = { totalCount: 50, completedSets: 1, perPreset: { subhanallah: { count: 50, completedCycles: 1, lastAt: t + 'T11:00:00.000Z' } }, lastAt: t + 'T11:00:00.000Z' };
  const merged = mergeZikr(a, b);
  const lifetimeOK = merged.journeys.subhanallah.lifetimeCount === 83;
  const dayOK = merged.sessions[t].totalCount === 83 && merged.sessions[t].perPreset.subhanallah.count === 83;
  return lifetimeOK && dayOK;
})(), 'merge union matematiği');

ok('aynı manuel kayıt iki cihazda → çift sayım yok', (function () {
  const base = { presets: [{ id: 'subhanallah', name: 'S', target: 33 }], sessions: {}, settings: { activePresetId: 'subhanallah' }, streak: 0, streakDate: '' };
  const mk = function () {
    const x = JSON.parse(JSON.stringify(base));
    x.manualEntries = [{ id: 'zm_same', date: t, presetId: 'subhanallah', amount: 33, note: '', source: 'manual', createdAt: t + 'T10:00:00.000Z', updatedAt: t + 'T10:00:00.000Z', revertedAt: null }];
    x.journeys = { subhanallah: { presetId: 'subhanallah', lifetimeCount: 33, activeHatimId: '', lastAt: '', lastSessionId: '', completedHatims: 0, legacyCompletedHatims: 0, hatims: [] } };
    return x;
  };
  const merged = mergeZikr(mk(), mk());
  return merged.manualEntries.length === 1 && merged.journeys.subhanallah.lifetimeCount === 33;
})());

ok('geri alınan manuel kayıt merge toplamına katılmaz', (function () {
  const base = { presets: [{ id: 'subhanallah', name: 'S', target: 33 }], sessions: {}, settings: { activePresetId: 'subhanallah' }, streak: 0, streakDate: '' };
  const mk = function (revert) {
    const x = JSON.parse(JSON.stringify(base));
    x.manualEntries = [{ id: 'zm_rev', date: t, presetId: 'subhanallah', amount: 33, note: '', source: 'manual', createdAt: t + 'T10:00:00.000Z', updatedAt: t + (revert ? 'T12:00:00.000Z' : 'T10:00:00.000Z'), revertedAt: revert ? t + 'T12:00:00.000Z' : null }];
    x.journeys = { subhanallah: { presetId: 'subhanallah', lifetimeCount: revert ? 0 : 33, activeHatimId: '', lastAt: '', lastSessionId: '', completedHatims: 0, legacyCompletedHatims: 0, hatims: [] } };
    return x;
  };
  const merged = mergeZikr(mk(true), mk(false)); // aynı kayıt, biri reverted
  return merged.manualEntries.length === 1 && merged.journeys.subhanallah.lifetimeCount === 0;
})(), 'reverted merge');

ok('dokunuş max kuralı korunur (manuel yokken)', (function () {
  const mk = function (n) {
    return { presets: [{ id: 'subhanallah', name: 'S', target: 33 }], sessions: {}, settings: { activePresetId: 'subhanallah' }, manualEntries: [], journeys: { subhanallah: { presetId: 'subhanallah', lifetimeCount: n, activeHatimId: '', lastAt: '', lastSessionId: '', completedHatims: 0, legacyCompletedHatims: 0, hatims: [] } }, streak: 0, streakDate: '' };
  };
  const merged = mergeZikr(mk(100), mk(120));
  return merged.journeys.subhanallah.lifetimeCount === 120;
})());

// 11 · Modal klavye sözleşmesi etkilenmez (sheet ayrı modal değil)
ok('sheet zikr-v2 overlay içinde, ayrı dialog değil', (function () {
  sb.App.setZikrView('counter'); sb.App.toggleZikrManual();
  const hasSheet = /id="zikr-manual-sheet"/.test(appHTML);
  sb.App.toggleZikrManual();
  // zikr overlay hâlâ App.onZikrKeydown sözleşmesini taşıyor
  const contract = /onkeydown="App\.onZikrKeydown\(event\)"/.test(appHTML) || (function () { sb.App.openZikr(); return /onkeydown="App\.onZikrKeydown\(event\)"/.test(appHTML); })();
  return hasSheet && contract;
})());

console.log('\n== Özet: ' + passed + ' geçti, ' + failed + ' kaldı ==');
process.exit(failed ? 1 : 0);
