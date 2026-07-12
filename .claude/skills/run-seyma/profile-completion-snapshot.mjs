#!/usr/bin/env node
// profile-completion-snapshot.mjs — 174/174 sonrası teşekkür ekranının
// headless HTML çıktısını üretir ve dosyaya yazar. Hiçbir gerçek tarayıcı
// açılmaz; fetch hiçbir zaman çözülmez.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const REPO = process.env.SEYMA_REPO ||
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

const _paSrc = fs.readFileSync(path.join(REPO, 'profileAssessmentV1.js'), 'utf8');
const _paSandbox = { window: {}, console };
vm.createContext(_paSandbox);
vm.runInContext(_paSrc, _paSandbox, { filename: 'profileAssessmentV1.js' });
const ITEMS = _paSandbox.window.ProfileAssessmentV1.sessions[0].items;

function today() {
  const d = new Date();
  const p = (n) => (n < 10 ? '0' : '') + n;
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

let appHTML = '';
function makeEl(id) {
  return {
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
    focus() {}, blur() {}, querySelector() { return null; }, querySelectorAll() { return []; },
    closest() { return null; }, replaceChildren() {}, contains() { return false; },
    getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; },
  };
}
const elCache = { app: makeEl('app'), root: makeEl('root'), 'pa-gate': makeEl('pa-gate') };
const doc = {
  hidden: false, body: makeEl('body'), documentElement: elCache.root,
  getElementById(id) { return elCache[id] || null; },
  querySelector() { return null; }, querySelectorAll() { return []; },
  createElement() { return makeEl(''); }, createDocumentFragment() { return makeEl(''); },
  addEventListener() {}, removeEventListener() {}, DOMParser: undefined,
};
class DOMParserStub { parseFromString() { return { body: makeEl('body'), querySelector() { return null; }, querySelectorAll() { return []; } }; } }
function makeLocalStorage(seed) {
  const store = Object.assign({}, seed);
  return { getItem(k) { return k in store ? store[k] : null; }, setItem(k, v) { store[k] = String(v); }, removeItem(k) { delete store[k]; }, clear() { for (const k in store) delete store[k]; }, _store: store };
}
function buildSandbox(seedData) {
  const seed = {};
  if (seedData) seed['seyma-reset-v1'] = JSON.stringify(seedData);
  const localStorage = makeLocalStorage(seed);
  const sandbox = {
    console, localStorage, document: doc,
    navigator: { vibrate() {}, userAgent: 'node-harness', clipboard: { writeText() { return Promise.resolve(); } }, geolocation: null },
    location: { protocol: 'http:', hostname: 'localhost', search: '', href: 'http://localhost/', reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    DOMParser: DOMParserStub,
    fetch() { return new Promise(() => {}); }, // asla çözülmez
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
function loadInto(sandbox, files) {
  const ctx = vm.createContext(sandbox);
  for (const f of files) { vm.runInContext(fs.readFileSync(path.join(REPO, f), 'utf8'), ctx, { filename: f }); }
  return ctx;
}
function baseSeed(extra) {
  const t = today();
  return Object.assign({ version: 2, startDate: t, lastOpenedDate: t, days: {}, notifications: [], luna: { qa: [] }, aeon: { qa: [] }, settings: { nickname: 'Sevgili Günışığı', ghToken: '', ghRepo: 'mustafaras/seyma-data' }, cycle: { periods: [], avgCycle: 28, avgPeriod: 5 } }, extra || {});
}
function consentedPA(responses) {
  return { schemaVersion: 2, deliveryMode: 'single_session', status: 'active', currentItemIndex: 0, startedAt: '2026-07-01T09:00:00.000Z', completedAt: null, consent: { version: '1.0.0', informationShownAt: '2026-07-01T09:00:00.000Z', acceptedAt: '2026-07-01T09:00:05.000Z', profileProcessingAccepted: true, sensitiveDataAccepted: true, panelSummarySharingAccepted: false }, responses: responses || {}, moduleProgress: {}, scores: {}, quality: {}, report: {}, panelSummary: {} };
}
function responsesFor(items) {
  const r = {};
  items.forEach((it, i) => { r[it.id] = { value: 4, scoredValue: 4, shownAt: '2026-07-01T09:00:00.000Z', answeredAt: '2026-07-01T09:00:05.000Z', responseMs: 5000, revisionCount: 0, itemVersion: '1.0.0', sessionId: 'SINGLE', sequence: i + 1 }; });
  return r;
}

const FILES = ['profileAssessmentV1.js', 'app.js'];
const sb = buildSandbox(baseSeed({ profileAssessment: consentedPA(responsesFor(ITEMS.slice(0, 173))) }));
loadInto(sb, FILES);
appHTML = '';
sb.App.start();

// 174. maddeyi cevaplayıp tamamlanma ekranını getir
const last = ITEMS[173];
sb.App.profileAnswer(last.id, 4);
await new Promise(r => setTimeout(r, 260));

// 174/174 tamamlanma ekranı zaten setTimeout sonrası render() ile gelmiş olmalı.
// setTheme(true) çağrıldığında App.setTheme render() tetikler, dark tema bayrağı
// #root'a yazılır; ancak headless stub'da CSS değişkenleri tanımsız olduğu için
// re-render sırasında değişkenleri olmayan stiller boş görünür. Bu yüzden snapshot
// çıktısını aldıktan sonra body background'u koyu yapmak yeterli.

const out = path.join(REPO, 'files', 'shot', `profile-completion-dark-${today()}.html`);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Şeyma — Profil Tamamlandı (headless dark)</title><style>
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#1a1221;}
#wrap{width:100%;max-width:460px;margin:0 auto;min-height:100vh;}
</style></head><body><div id="wrap">${appHTML}</div></body></html>`);

console.log(`Tamamlanma ekranı HTML çıktısı: ${out} (${appHTML.length} bytes)`);
console.log('İçerik özeti:');
console.log(appHTML.includes('Teşekkürler Günışığım') ? '✅ Teşekkür başlığı var' : '❌ Teşekkür başlığı yok');
console.log(appHTML.includes('Ana uygulamaya dön') ? '✅ Dönüş butonu var' : '❌ Dönüş butonu yok');
console.log(/id="pa-gate"/.test(appHTML) ? '✅ Gate içinde render edildi' : '❌ Gate dışında');

process.exit(0);
