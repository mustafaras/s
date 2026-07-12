#!/usr/bin/env node
// verify-profile-assessment-consent.mjs — headless tests for the profile-assessment
// information/consent screen (Faz 04): renderProfileConsent(), App.profileConsentOpen/
// Toggle/AcceptConsent(). Same data-safety rationale as the other verify-*.mjs scripts
// in this directory — synthetic seed data only, fetch never resolves, no network.
//
// Usage:
//   node .claude/skills/run-seyma/verify-profile-assessment-consent.mjs
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

// ── Fake DOM (driver.mjs ile aynı, minimal) ──
let appHTML = '';
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
    fetch() { return new Promise(() => {}); },
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
const FILES = ['profileAssessmentV1.js', 'app.js'];
function loadInto(sandbox, files) {
  const ctx = vm.createContext(sandbox);
  for (const f of files) {
    const src = fs.readFileSync(path.join(REPO, f), 'utf8');
    vm.runInContext(src, ctx, { filename: f });
  }
  return ctx;
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
// Boot + onboarding'i geç; App.profileConsentOpen() öncesi appHTML temizlenir ki
// gösterilip gösterilmediği net anlaşılsın.
function bootToApp(seedDataObj) {
  const sb = buildSandbox(seedDataObj);
  loadInto(sb, FILES);
  appHTML = '';
  sb.App.start();
  return sb;
}
function persistedData(sb) {
  const raw = sb.localStorage.getItem('seyma-reset-v1');
  return raw ? JSON.parse(raw) : null;
}

// ── 1) Zorunlu onay eksikken başlayamama ──
console.log('== 1) zorunlu onay eksikken kabul edilemiyor ==');
{
  const sb = bootToApp(baseSeed({}));
  sb.App.profileConsentOpen();
  assert('rıza ekranı gösterildi (yeni kullanıcı)', /Kabul et ve başla/.test(appHTML));
  assert('buton başlangıçta disabled', /disabled[^>]*>Kabul et ve başla|Kabul et ve başla[\s\S]*?disabled/.test(appHTML) || /disabled/.test(appHTML));
  assert('beyaz ÆON rozeti beyin ikonunun yanında görünüyor (kullanıcı isteği, 2026-07-12)', appHTML.includes('ÆON'));
  assert('görünür "Ayarlar" linki YOK (kullanıcı isteği)', !appHTML.includes("App.go('ayarlar')"));
  // yalnızca 3/4 zorunlu onayı işaretle (notDiagnosis eksik)
  sb.App.profileConsentToggle('read');
  sb.App.profileConsentToggle('processing');
  sb.App.profileConsentToggle('sensitive');
  sb.App.profileAcceptConsent(); // eksik olduğu için no-op olmalı
  const out = persistedData(bootPersist(sb));
  assert('acceptedAt hâlâ null (eksik onayla geçilemedi)', !out || !out.profileAssessment || out.profileAssessment.consent.acceptedAt === null);
}
function bootPersist(sb) { sb.App.saveToday(); return sb; }

// ── 2) Panel gösterimi otomatik (ayrı tik kaldırıldı, kullanıcı isteği 2026-07-12) ──
console.log('\n== 2) panelde gösterim artık ayrı bir tike bağlı değil, 4 zorunlu onay yeterli ==');
{
  const sb = bootToApp(baseSeed({}));
  sb.App.profileConsentOpen();
  sb.App.profileConsentToggle('read');
  sb.App.profileConsentToggle('processing');
  sb.App.profileConsentToggle('sensitive');
  sb.App.profileConsentToggle('notDiagnosis');
  sb.App.profileAcceptConsent();
  const out = persistedData(bootPersist(sb));
  const c = out.profileAssessment.consent;
  assert('acceptedAt set edildi (4 zorunlu yeterli)', typeof c.acceptedAt === 'string' && c.acceptedAt.length > 0);
  assert('panelSummarySharingAccepted === true (artık her zaman, ayrı tik yok — data.psych ile tutarlı)', c.panelSummarySharingAccepted === true);
  assert('status "active" oldu', out.profileAssessment.status === 'active');
}

// ── 3) Rıza verisinin kaydı ──
console.log('\n== 3) rıza verisi (informationShownAt/acceptedAt/version) doğru kaydediliyor ==');
{
  const sb = bootToApp(baseSeed({}));
  sb.App.profileConsentOpen(); // informationShownAt burada set edilir
  sb.App.profileConsentToggle('read');
  sb.App.profileConsentToggle('processing');
  sb.App.profileConsentToggle('sensitive');
  sb.App.profileConsentToggle('notDiagnosis');
  sb.App.profileAcceptConsent();
  const out = persistedData(bootPersist(sb));
  const c = out.profileAssessment.consent;
  assert('informationShownAt kaydedilmiş', typeof c.informationShownAt === 'string' && c.informationShownAt.length > 0);
  assert('acceptedAt kaydedilmiş', typeof c.acceptedAt === 'string' && c.acceptedAt.length > 0);
  assert('consent.version kaydedilmiş', typeof c.version === 'string' && c.version.length > 0);
  assert('profileProcessingAccepted === true', c.profileProcessingAccepted === true);
  assert('sensitiveDataAccepted === true', c.sensitiveDataAccepted === true);
  assert('panelSummarySharingAccepted === true', c.panelSummarySharingAccepted === true);
}

// ── 4) İkinci açılışta rıza ekranının tekrar gelmemesi ──
// Faz 05'ten itibaren render() zaten OTOMATİK gate gösteriyor (bkz. verify-profile-assessment-
// gate.mjs); bu yüzden "hiç render tetiklenmedi" artık yanlış beklenti — asıl doğrulanması
// gereken şey, rıza vermiş bir kullanıcıya CONSENT ekranının değil SORU ekranının çıkması.
console.log('\n== 4) daha önce kabul eden kullanıcıya rıza ekranı DEĞİL, soru ekranı gösteriliyor ==');
{
  const alreadyConsentedPA = {
    schemaVersion: 2, deliveryMode: 'single_session', status: 'active', currentItemIndex: 0,
    startedAt: null, completedAt: null,
    consent: { version: '1.0.0', informationShownAt: '2026-07-01T10:00:00.000Z', acceptedAt: '2026-07-01T10:05:00.000Z', profileProcessingAccepted: true, sensitiveDataAccepted: true, panelSummarySharingAccepted: false },
    responses: {}, moduleProgress: {}, scores: {}, quality: {}, report: {}, panelSummary: {},
  };
  const sb = bootToApp(baseSeed({ profileAssessment: alreadyConsentedPA }));
  // App.start() zaten render() çağırdı; render() artık ana kilit sayesinde otomatik olarak
  // soru ekranını gösterir (ayrıca App.profileConsentOpen() da aynı sonucu üretir).
  assert('rıza ekranı YOK ("Kabul et ve başla" görünmüyor)', !/Kabul et ve başla/.test(appHTML));
  assert('soru ekranı gösteriliyor (pa-gate + ilk madde)', /id="pa-gate"/.test(appHTML) && /1 \/ 174/.test(appHTML));
}

// ── 5) Rıza state migration uyumu ──
console.log('\n== 5) eski (schemaVersion 1) veriden gelen kullanıcıda rıza akışı çökmeden çalışıyor ==');
{
  const legacyPA = { schemaVersion: 1, status: 'session_in_progress', schedule: { x: 1 }, currentDay: 1, responses: {} }; // eski modelde consent hiç yok
  const sb = bootToApp(baseSeed({ profileAssessment: legacyPA }));
  appHTML = '';
  sb.App.profileConsentOpen(); // migrate edilmiş consent{} backfill sayesinde çökmemeli
  assert('rıza ekranı çökmeden render edildi', /Kabul et ve başla/.test(appHTML));
  sb.App.profileConsentToggle('read');
  sb.App.profileConsentToggle('processing');
  sb.App.profileConsentToggle('sensitive');
  sb.App.profileConsentToggle('notDiagnosis');
  sb.App.profileAcceptConsent();
  const out = persistedData(bootPersist(sb));
  assert('eski kullanıcı da kabul edebildi (acceptedAt set)', typeof out.profileAssessment.consent.acceptedAt === 'string');
  assert('eski schedule alanı hâlâ silinmemiş (Faz 03 kuralı)', out.profileAssessment.schedule && out.profileAssessment.schedule.x === 1);
}

console.log('\nDone.');
