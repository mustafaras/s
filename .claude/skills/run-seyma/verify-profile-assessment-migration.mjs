#!/usr/bin/env node
// verify-profile-assessment-migration.mjs — headless migration/ensure tests for
// data.profileAssessment (Şeyma tek oturumlu 174 maddelik profil değerlendirmesi, Faz 03).
//
// WHY THIS EXISTS / DATA SAFETY: same rationale as driver.mjs — never open a real
// browser here. This script boots the real app.js inside node:vm with SEEDED,
// SYNTHETIC localStorage states only (no real user data ever touches this), fetch
// never resolves and sync.js is not loaded, so nothing can reach the network.
// `migrate(d)` (which now calls `ensureProfileAssessment(d)`) runs automatically at
// boot; we read the result back by calling App.saveToday() (persists `data` to the
// stubbed localStorage) and inspecting what was written — the same black-box,
// render/persistence-level approach driver.mjs uses, since app.js only exposes
// `window.App` (no internal function is reachable directly from outside its IIFE).
//
// Usage:
//   node .claude/skills/run-seyma/verify-profile-assessment-migration.mjs
//
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const REPO = process.env.SEYMA_REPO ||
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

function assert(name, cond) {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
  if (!cond) process.exitCode = 1;
}

function today() {
  const d = new Date();
  const p = (n) => (n < 10 ? '0' : '') + n;
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

// ── gerçek 174 itemId sırasını al (senkron test verisi kurmak için) ──
const paSrc = fs.readFileSync(path.join(REPO, 'profileAssessmentV1.js'), 'utf8');
const paSandbox = { window: {}, console };
vm.createContext(paSandbox);
vm.runInContext(paSrc, paSandbox, { filename: 'profileAssessmentV1.js' });
const ITEM_IDS = paSandbox.window.ProfileAssessmentV1.sessions[0].items.map((it) => it.id);

function responsesFor(ids) {
  const r = {};
  ids.forEach((id, i) => {
    r[id] = { value: 4, scoredValue: 4, shownAt: '2026-07-01T10:00:00.000Z', answeredAt: '2026-07-01T10:00:05.000Z', responseMs: 5000, revisionCount: 0, itemVersion: '1.0.0', sequence: i + 1 };
  });
  return r;
}

// ── Fake DOM (driver.mjs ile aynı, minimal, veri güvenliği için özdeş kurallar) ──
function makeEl(id) {
  const el = {
    id: id || '', _html: '',
    style: { cssText: '', setProperty() {}, width: '', display: '' },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {}, children: [], scrollTop: 0, offsetWidth: 0, value: '', files: [],
    get innerHTML() { return this._html; },
    set innerHTML(v) { this._html = String(v); if (this.id === 'app') appHTML = this._html; },
    get textContent() { return this._text || ''; }, set textContent(v) { this._text = String(v); },
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
let appHTML = '';
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
class DOMParserStub {
  parseFromString() { return { body: makeEl('body'), querySelector() { return null; }, querySelectorAll() { return []; } }; }
}
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
function buildSandbox(seedDataObj) {
  const seed = {};
  if (seedDataObj) seed['seyma-reset-v1'] = JSON.stringify(seedDataObj);
  const localStorage = makeLocalStorage(seed);
  const sandbox = {
    console, localStorage, document: doc,
    navigator: { vibrate() {}, userAgent: 'node-harness', clipboard: { writeText() { return Promise.resolve(); } }, geolocation: null },
    location: { protocol: 'http:', hostname: 'localhost', search: '', href: 'http://localhost/', reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    DOMParser: DOMParserStub,
    fetch() { return new Promise(() => {}); }, // asla çözülmez → sıfır ağ
    setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
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
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  return sandbox;
}
const FILES = ['profileAssessmentV1.js', 'app.js']; // sync.js bilerek yüklenmiyor — App.saveToday() güvenli
function loadInto(sandbox, files) {
  const ctx = vm.createContext(sandbox);
  for (const f of files) {
    const src = fs.readFileSync(path.join(REPO, f), 'utf8');
    vm.runInContext(src, ctx, { filename: f });
  }
  return ctx;
}

// Bir seed data objesini boot eder, onboarding'i App.start() ile geçer, App.saveToday()
// ile localStorage'a yazdırır ve geri kalan (migrate edilmiş) data objesini döndürür.
function bootAndPersist(seedDataObj) {
  appHTML = '';
  const sb = buildSandbox(seedDataObj);
  loadInto(sb, FILES);
  if (typeof sb.App.start === 'function') sb.App.start(); // onboarding gate'i geç (data zaten var)
  if (typeof sb.App.saveToday === 'function') sb.App.saveToday(); // save() → localStorage'a yaz
  const raw = sb.localStorage.getItem('seyma-reset-v1');
  return raw ? JSON.parse(raw) : null;
}

function baseSeed(extra) {
  const t = today();
  return Object.assign({
    version: 2, startDate: t, lastOpenedDate: t, days: {}, notifications: [],
    luna: { qa: [] }, aeon: { qa: [] },
    settings: { nickname: 'Sevgili Günışığı', ghToken: '', ghRepo: 'mustafaras/seyma-data' },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 },
  }, extra || {});
}

// ── 1) Profil alanı olmayan eski kullanıcı ──
console.log('== 1) profileAssessment alanı hiç olmayan eski kullanıcı ==');
{
  const out = bootAndPersist(baseSeed({}));
  const pa = out.profileAssessment;
  assert('data.profileAssessment oluşturuldu', !!pa && typeof pa === 'object');
  assert('schemaVersion === 2', pa.schemaVersion === 2);
  assert('deliveryMode === "single_session"', pa.deliveryMode === 'single_session');
  assert('status === "not_started"', pa.status === 'not_started');
  assert('currentItemIndex === 0', pa.currentItemIndex === 0);
  assert('responses === {} (boş)', pa.responses && Object.keys(pa.responses).length === 0);
  assert('consent tüm alanlarla dolu', pa.consent && pa.consent.profileProcessingAccepted === false && pa.consent.panelSummarySharingAccepted === false);
}

// ── 2) Kısmi eski (üç günlük beta) kullanıcı ──
console.log('\n== 2) kısmi eski üç-günlük-beta kullanıcı (45/174 cevaplı) ==');
{
  const answered = ITEM_IDS.slice(0, 45);
  const legacyPA = {
    schemaVersion: 1, // eski
    instrumentVersion: '1.0.0',
    status: 'session_in_progress', // eski v1 durum değeri
    startedAt: '2026-07-01T09:00:00.000Z',
    completedAt: null,
    schedule: { day1: 'S01,S02', day2: 'S03' }, // artık kullanılmıyor — SİLİNMEMELİ
    currentDay: 2,
    nextSessionId: 'S04',
    sessions: { S01: { completedAt: '2026-07-01T09:20:00.000Z' }, S02: { completedAt: '2026-07-01T09:40:00.000Z' } }, // eski, SİLİNMEMELİ
    responses: responsesFor(answered),
  };
  const out = bootAndPersist(baseSeed({ profileAssessment: legacyPA }));
  const pa = out.profileAssessment;
  assert('schemaVersion 2ye yükseltildi', pa.schemaVersion === 2);
  assert('deliveryMode single_session oldu', pa.deliveryMode === 'single_session');
  assert('45 cevap korunmuş (itemId üzerinden)', Object.keys(pa.responses).length === 45);
  assert('ilk cevap içeriği korunmuş (değer ezilmemiş)', pa.responses[ITEM_IDS[0]].value === 4);
  assert('currentItemIndex === 45 (ilk cevaplanmamış madde)', pa.currentItemIndex === 45);
  assert('status "completed" DEĞİL (45/174)', pa.status !== 'completed');
  assert('eski schedule alanı SİLİNMEMİŞ (bilinmeyen alan kuralı)', pa.schedule && pa.schedule.day1 === 'S01,S02');
  assert('eski currentDay alanı SİLİNMEMİŞ', pa.currentDay === 2);
  assert('eski nextSessionId alanı SİLİNMEMİŞ', pa.nextSessionId === 'S04');
  assert('eski sessions alanı SİLİNMEMİŞ', pa.sessions && pa.sessions.S01 && pa.sessions.S01.completedAt === '2026-07-01T09:20:00.000Z');
}

// ── 3) Tamamlanmış eski beta kullanıcı (174/174) ──
console.log('\n== 3) tamamlanmış eski beta kullanıcı (174/174) ==');
{
  const legacyPA = {
    schemaVersion: 1,
    status: 'completed',
    startedAt: '2026-06-01T09:00:00.000Z',
    completedAt: '2026-06-01T09:45:00.000Z',
    responses: responsesFor(ITEM_IDS), // tüm 174
  };
  const out = bootAndPersist(baseSeed({ profileAssessment: legacyPA }));
  const pa = out.profileAssessment;
  assert('status "completed" olarak korunuyor', pa.status === 'completed');
  assert('completedAt korunuyor (yeniden hesaplanmadı)', pa.completedAt === '2026-06-01T09:45:00.000Z');
  assert('currentItemIndex === 174', pa.currentItemIndex === 174);
  assert('tüm 174 cevap korunmuş', Object.keys(pa.responses).length === 174);
}

// ── 4) Bilinmeyen ek alanları olan kullanıcı ──
console.log('\n== 4) profileAssessment içinde bilinmeyen ek alan ==');
{
  const withUnknown = { schemaVersion: 2, status: 'not_started', responses: {}, futureFeatureFlag: true, someNestedThing: { a: 1 } };
  const out = bootAndPersist(baseSeed({ profileAssessment: withUnknown }));
  const pa = out.profileAssessment;
  assert('bilinmeyen üst-seviye alan (futureFeatureFlag) korunmuş', pa.futureFeatureFlag === true);
  assert('bilinmeyen nested alan (someNestedThing) korunmuş', pa.someNestedThing && pa.someNestedThing.a === 1);
}

// ── 5) data.psych değişmezliği ──
console.log('\n== 5) data.psych değişmezliği ==');
{
  const psych = { version: 2, completedAt: '2026-06-15T08:00:00.000Z', answers: { a1: [1, 2, 3] }, scores: { depression: { sum: 4, band: 'minimal', alert: false } }, qa: [{ q: 'x', a: 1 }], history: [] };
  const before = JSON.stringify(psych);
  const out = bootAndPersist(baseSeed({ psych: JSON.parse(before) }));
  assert('data.psych hiç değişmedi (bit-bit aynı)', JSON.stringify(out.psych) === before);
}

// ── 6) ensureProfileAssessment ikinci çalıştırmada veri değiştirmiyor (idempotans) ──
console.log('\n== 6) ikinci migrate/ensure çalıştırması veri değiştirmiyor ==');
{
  const answered = ITEM_IDS.slice(0, 60);
  const legacyPA = { schemaVersion: 1, status: 'active', schedule: { x: 1 }, responses: responsesFor(answered) };
  const firstPass = bootAndPersist(baseSeed({ profileAssessment: legacyPA }));
  const firstPA = JSON.stringify(firstPass.profileAssessment);
  // İkinci boot: ilk geçişin ÇIKTISINI seed olarak kullan — migrate()/ensureProfileAssessment()
  // tekrar çalışır (gerçek dünyada: uygulama kapanıp yeniden açıldığında olan budur).
  const secondPass = bootAndPersist(baseSeed({ profileAssessment: JSON.parse(firstPA) }));
  const secondPA = JSON.stringify(secondPass.profileAssessment);
  assert('ikinci geçişten sonra profileAssessment DEĞİŞMEDİ (idempotant)', firstPA === secondPA);
}

console.log('\nDone.');
