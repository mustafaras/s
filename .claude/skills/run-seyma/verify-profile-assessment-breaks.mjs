#!/usr/bin/env node
// verify-profile-assessment-breaks.mjs — headless tests for module-boundary soft breaks
// and the hardened app lock (Faz 06): profileAssessmentPendingBreak(), renderProfileBreak(),
// App.profileBreakContinue(), renderProfileAssessmentGate(), and the SOS escape hatch.
//
// DATA SAFETY: same rationale as the sibling verify-*.mjs scripts — synthetic seed data
// only, `fetch` never resolves. Real setTimeout/clearInterval are used (like
// verify-profile-assessment-gate.mjs) so the post-answer transition fires faithfully;
// the process force-exits at the end regardless of any lingering app.js timers.
//
// Usage:
//   node .claude/skills/run-seyma/verify-profile-assessment-breaks.mjs
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
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
function today() {
  const d = new Date();
  const p = (n) => (n < 10 ? '0' : '') + n;
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

const paSrc = fs.readFileSync(path.join(REPO, 'profileAssessmentV1.js'), 'utf8');
const paSandbox = { window: {}, console };
vm.createContext(paSandbox);
vm.runInContext(paSrc, paSandbox, { filename: 'profileAssessmentV1.js' });
const ITEMS = paSandbox.window.ProfileAssessmentV1.sessions[0].items;
const MODULE_BOUNDARIES = paSandbox.window.ProfileAssessmentV1.sessions[0].moduleBoundaries;
const BREAK_POINTS = paSandbox.window.ProfileAssessmentV1.pausePolicy.softBreakAfterOrders;

function responsesFor(items) {
  const r = {};
  items.forEach((it, i) => { r[it.id] = { value: 4, scoredValue: 4, shownAt: '2026-07-01T09:00:00.000Z', answeredAt: '2026-07-01T09:00:05.000Z', responseMs: 5000, revisionCount: 0, itemVersion: '1.0.0', sessionId: 'SINGLE', sequence: i + 1 }; });
  return r;
}

// ── Fake DOM (gerçek setTimeout/clearInterval ile — bkz. dosya başı) ──
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
const elCache = { app: appEl, root: rootEl, 'pa-gate': makeEl('pa-gate') };
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
    setTimeout, clearTimeout, setInterval, clearInterval,
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
function consentedPA(responses, extra) {
  return Object.assign({
    schemaVersion: 2, deliveryMode: 'single_session', status: 'active', currentItemIndex: 0,
    startedAt: '2026-07-01T09:00:00.000Z', completedAt: null,
    consent: { version: '1.0.0', informationShownAt: '2026-07-01T09:00:00.000Z', acceptedAt: '2026-07-01T09:00:05.000Z', profileProcessingAccepted: true, sensitiveDataAccepted: true, panelSummarySharingAccepted: false },
    responses: responses || {}, moduleProgress: {}, scores: {}, quality: {}, report: {}, panelSummary: {},
  }, extra || {});
}
function bootAt(nAnswered, extraPA) {
  const answered = ITEMS.slice(0, nAnswered);
  const sb = buildSandbox(baseSeed({ profileAssessment: consentedPA(responsesFor(answered), extraPA) }));
  appHTML = '';
  loadInto(sb, FILES);
  sb.App.start();
  return sb;
}
function persistedPA(sb) {
  const raw = sb.localStorage.getItem('seyma-reset-v1');
  return raw ? JSON.parse(raw).profileAssessment : null;
}

// ── 1) Her mola noktasında tek mola ──
console.log('== 1) her 8 mola noktasında (20/40/.../158) mola ekranı çıkıyor, ilk 19 maddede çıkmıyor ==');
{
  BREAK_POINTS.forEach((n) => {
    const sb = bootAt(n);
    const justFinished = MODULE_BOUNDARIES.find((m) => m.endOrder === n);
    assert(`madde ${n} sonrası mola ekranı (${justFinished.moduleId}) gösteriliyor`, /Kısa bir mola/.test(appHTML) && appHTML.includes(justFinished.title));
  });
  // sınır olmayan bir noktada (ör. 19) mola çıkmamalı
  const sbNo = bootAt(19);
  assert('19 (sınır değil) mola göstermiyor, soru ekranı gösteriyor', !/Kısa bir mola/.test(appHTML) && /20 \/ 174/.test(appHTML));
}

// ── 2) Resume sonrası aynı molanın tekrar açılmaması ──
console.log('\n== 2) molayı geçtikten sonra kapat/aç — aynı mola tekrar çıkmıyor ==');
{
  const sb = bootAt(20);
  assert('mola gösteriliyor (ilk kez)', /Kısa bir mola/.test(appHTML));
  sb.App.profileBreakContinue(); // molayı geç
  assert('molayı geçince madde 21 gösteriliyor', /21 \/ 174/.test(appHTML));
  const persisted = persistedPA(sb);
  assert('moduleProgress.S01.breakAcknowledged kalıcı olarak true', persisted.moduleProgress.S01 && persisted.moduleProgress.S01.breakAcknowledged === true);
  // "uygulama kapandı" — aynı (persist edilmiş) veriyle taze bir sandbox'ta yeniden boot
  const sb2 = buildSandbox(JSON.parse(sb.localStorage.getItem('seyma-reset-v1')));
  appHTML = '';
  loadInto(sb2, FILES);
  sb2.App.start();
  assert('yeniden açılışta mola TEKRAR çıkmıyor, doğrudan madde 21', !/Kısa bir mola/.test(appHTML) && /21 \/ 174/.test(appHTML));
}

// ── 3) Tamamlanmadan ana app'e erişememe (mola ekranındayken de) ──
console.log('\n== 3) mola ekranındayken bile ana sekmelere erişilemiyor ==');
{
  const sb = bootAt(20); // mola ekranında
  sb.App.go('bugun'); // ana sekmeye geçmeyi dene
  assert('ana sekmeye geçiş engellendi — hâlâ mola/gate gösteriliyor', /id="pa-gate"/.test(appHTML) && /Kısa bir mola/.test(appHTML));
}

// ── 4) Ayarlar/veri-silme kısayolları bilerek kaldırıldı (kullanıcı isteği, 2026-07-12) ──
// Hem "Verilerimi sil" hem "Ayarlar" linkleri artık rıza/soru/mola ekranlarında YOK — kilit
// artık tamamen "sızdırmaz" (kazara silme/kaçış riski yok). `App.go('ayarlar')` fonksiyonunun
// kendisi ve render()'daki `ui.tab!=='ayarlar'` gate-bypass mantığı hâlâ kodda duruyor
// (zararsız, UI'dan tetiklenemeyen bir iç mekanizma) — programatik olarak hâlâ çalıştığını
// doğruluyoruz ama artık kullanıcıya görünür bir buton değil.
console.log('\n== 4) mola ekranında Ayarlar/veri-silme kısayolu YOK (bilerek kaldırıldı) ==');
{
  const sb = bootAt(20);
  assert('mola ekranında "Verilerimi sil" kısayolu YOK', !/Verilerimi sil/.test(appHTML));
  assert('mola ekranında görünür "Ayarlar" linki YOK', !appHTML.includes("App.go('ayarlar')"));
  sb.App.go('ayarlar'); // programatik/dev erişim hâlâ mümkün mü — zararsız iç mekanizma
  assert('(iç mekanizma) App.go("ayarlar") hâlâ çalışıyor, Gizlilik kartı görünüyor', /Gizlilik/.test(appHTML));
  sb.App.go('bugun');
  assert('başka sekmeye dönünce kilit/mola geri geliyor', /id="pa-gate"/.test(appHTML));
}

// ── 5) 174/174 sonrası finalizasyon çağrısı ──
console.log('\n== 5) 174/174 sonrası finalizasyon (completedAt) çağrısı ==');
{
  const first173 = ITEMS.slice(0, 173);
  const last = ITEMS[173];
  const sb = buildSandbox(baseSeed({ profileAssessment: consentedPA(responsesFor(first173)) }));
  loadInto(sb, FILES);
  appHTML = '';
  sb.App.start();
  sb.App.profileAnswer(last.id, 4);
  await sleep(260);
  const pa = persistedPA(sb);
  assert('174/174 sonrası status completed', pa.status === 'completed');
  assert('completedAt yazıldı', typeof pa.completedAt === 'string' && pa.completedAt.length > 0);
}

// ── 6) Tamamlanmış kullanıcıda gate/mola açılmaması ──
console.log('\n== 6) tamamlanmış kullanıcıda ne gate ne mola açılıyor (mola sınırında bile) ==');
{
  const all174 = ITEMS.slice(0, 174);
  const completedPA = consentedPA(responsesFor(all174), { status: 'completed', completedAt: '2026-07-01T10:00:00.000Z', currentItemIndex: 174 });
  const sb = buildSandbox(baseSeed({ profileAssessment: completedPA }));
  appHTML = '';
  loadInto(sb, FILES);
  sb.App.start();
  assert('gate YOK', !/id="pa-gate"/.test(appHTML));
  assert('mola YOK', !/Kısa bir mola/.test(appHTML));
  assert('normal ana uygulama (bugun) gösteriliyor', /App\.go\(/.test(appHTML) || /bugun/i.test(appHTML));
}

// ── 7) Acil yardım (SOS) — mola/soru ekranından erişilebilir, data.psych'e dokunmaz ──
console.log('\n== 7) acil yardım (SOS) erişilebilir, data.psych değişmiyor ==');
{
  const psych = { version: 2, completedAt: '2026-06-15T08:00:00.000Z', answers: {}, scores: { depression: { sum: 2, band: 'minimal', alert: false } }, qa: [], history: [] };
  const psychBefore = JSON.stringify(psych);
  const sb = buildSandbox(baseSeed({ profileAssessment: consentedPA(responsesFor(ITEMS.slice(0, 20))), psych: JSON.parse(psychBefore) }));
  appHTML = '';
  loadInto(sb, FILES);
  sb.App.start(); // mola ekranında
  sb.App.profileAssessmentSOS();
  assert('SOS ekranı gösteriliyor ("Yalnız değilsin")', /Yalnız değilsin/.test(appHTML));
  assert('112 bilgisi var', /112/.test(appHTML));
  sb.App.profileAssessmentReachCreator();
  assert('mesaj gönderildi durumuna geçti', /Mesajın gönderildi/.test(appHTML));
  sb.App.profileAssessmentSOSClose();
  assert('kapatınca mola ekranına dönüldü', /Kısa bir mola/.test(appHTML));
  const raw = JSON.parse(sb.localStorage.getItem('seyma-reset-v1'));
  assert('data.psych HİÇ değişmedi', JSON.stringify(raw.psych) === psychBefore);
}

console.log('\nDone.');
process.exit(process.exitCode || 0);
