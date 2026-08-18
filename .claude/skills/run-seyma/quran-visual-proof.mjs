#!/usr/bin/env node
// quran-visual-proof.mjs — QY-21 görsel kanıt üreteci.
//
// AYNI senaryoyu İKİ app.js sürümüyle çalıştırır ve ürettikleri GERÇEK
// markup'ı gerçek `styles.css` ile statik HTML'e gömüp headless Chrome ile
// rasterize eder:
//   • ÖNCE  — düzeltmeden bir önceki commit'in app.js'i (SEYMA_OLD_APP)
//   • SONRA — çalışma ağacındaki app.js
//
// Senaryo, üretimde yaşananın birebir kopyasıdır: sûre `request_error`
// ("İletilemedi") durumunda kilitli, uzakta ise o isteğe ait DOĞRULANMIŞ bir
// cevap (YouTube anlatımı) duruyor.
//
// DATA SAFETY — profile-visual-snapshots.mjs ile AYNI güvence:
// gerçek uygulama hiçbir tarayıcı sekmesinde açılmaz. Chrome yalnızca
// script içermeyen, `file://` üzerinden yüklenen STATİK bir HTML+CSS
// dosyasını rasterize eder. `sync.js` hiç yüklenmez → gerçek `SeySync`
// yoktur → hiçbir push mümkün değildir. VM tarafında `fetch` ölüdür.
//
// Usage:
//   SEYMA_OLD_APP=/tmp/app-old.js node .claude/skills/run-seyma/quran-visual-proof.mjs
//
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const OUT = process.env.SEYMA_SHOT_DIR || path.join(REPO, 'files', 'shot');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OLD_APP = process.env.SEYMA_OLD_APP || '';

const SURAH = 'mesed';
const LOCAL_ID = 'qr_YerelKimlikSentetik01';
const VIDEO = 'jOkcqXWvoNc';
const REQUESTED_AT = '2026-08-17T16:18:17.000Z';
const VALIDATED_AT = '2026-08-18T06:20:22.586Z';

// ── Fake DOM: verify-quran-library-ui.mjs'in bölge-farkında kayıt deseni ──
let appHTML = '';
const registry = {};
let seq = 0;
function makeEl(id) {
  return {
    id: id || '', _html: '', _text: '', _seq: 0,
    style: { cssText: '', setProperty() {}, width: '', display: '' },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {}, children: [], scrollTop: 0, offsetWidth: 0, value: '', files: [],
    get innerHTML() { return this._html; },
    set innerHTML(v) { this._html = String(v); this._seq = ++seq; if (this.id === 'app') appHTML = this._html; },
    get textContent() { return this._text; }, set textContent(v) { this._text = String(v); },
    setAttribute() {}, getAttribute() { return null; },
    appendChild(c) { this.children.push(c); return c; },
    removeChild() {}, remove() {}, replaceWith() {}, insertBefore(c) { return c; },
    addEventListener() {}, removeEventListener() {}, click() {}, focus() {}, blur() {},
    querySelector() { return null; }, querySelectorAll() { return []; }, closest() { return null; },
    replaceChildren() {}, contains() { return false; },
    getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; },
  };
}
function reg(id) { return registry[id] || (registry[id] = makeEl(id)); }
const doc = {
  hidden: false, get body() { return reg('body'); }, get documentElement() { return reg('root'); }, activeElement: null,
  getElementById(id) {
    if (registry[id]) return registry[id];
    let painted = appHTML;
    for (const k in registry) painted += registry[k]._html;
    return painted.indexOf('id="' + id + '"') >= 0 ? reg(id) : null;
  },
  querySelector() { return null; }, querySelectorAll() { return []; },
  createElement() { return makeEl(''); }, createDocumentFragment() { return makeEl(''); },
  addEventListener() {}, removeEventListener() {}, DOMParser: undefined,
};
class DOMParserStub { parseFromString() { return { body: makeEl('body'), querySelector() { return null; }, querySelectorAll() { return []; } }; } }
function makeLS(seed) {
  const store = Object.assign({}, seed);
  return { getItem(k) { return k in store ? store[k] : null; }, setItem(k, v) { store[k] = String(v); }, removeItem(k) { delete store[k]; }, clear() { for (const k in store) delete store[k]; } };
}
function buildSandbox(seedState) {
  const sandbox = {
    console: { log() {}, warn() {}, error() {}, info() {} },
    localStorage: makeLS({ 'seyma-reset-v1': JSON.stringify(seedState) }), document: doc, __SEYMA_TEST_ZIKR__: true,
    navigator: { vibrate() {}, userAgent: 'node-harness', clipboard: { writeText() { return Promise.resolve(); } }, geolocation: { getCurrentPosition(ok){ ok({ coords: { latitude: 38.42, longitude: 27.14, accuracy: 12 }, timestamp: Date.parse(REQUESTED_AT) }); }, watchPosition(){ return 1; }, clearWatch(){} } },
    location: { protocol: 'http:', hostname: 'localhost', search: '', href: 'http://localhost/', reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    DOMParser: DOMParserStub,
    fetch() { return new Promise(() => {}); },      // ÖLÜ
    setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(a) { for (let i = 0; i < a.length; i++) a[i] = (Math.random() * 256) | 0; return a; } },
    URL: Object.assign(function () {}, { createObjectURL() { return 'blob:stub'; }, revokeObjectURL() {} }), URLSearchParams,
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
const MODULES = ['motivationProgramV2.js', 'motivationNarratives.js', 'profileAssessmentV1.js', 'saygiPeople.js',
  'hijriCalendar.js', 'quranRevelationOrderV1.js', 'quranTransportV1.js', 'quranStrikingVersesV1.js',
  'esmaulHusnaV1.js', 'esmaulHusnaV2.js', 'zikirCoreContentV1.js', 'app/core/constants.js'];

function seedState() {
  return {
    onboarded: true, startDate: '2026-08-01', days: {},
    settings: { theme: 'light', name: 'Şeyma', locationEnabled: true, profileAssessmentInactive: true, auth: { rememberMe: true, usernameHash: 'stub', unlockedAt: REQUESTED_AT } },
    quranJourney: {
      schemaVersion: 1, catalogVersion: 'quran-revelation-tr-v1', startedAt: '2026-08-01T09:00:00.000Z',
      activeSurahId: SURAH,
      requests: {
        [SURAH]: {
          requestId: LOCAL_ID, status: 'request_error', requestedAt: REQUESTED_AT,
          notifiedAt: null, responseId: null, videoId: null, readyAt: null,
          startedWatchingAt: null, watchedAt: null, questionOpenedAt: null,
          updatedAt: '2026-08-17T16:18:37.527Z', videoHistory: [], notes: [],
        },
      },
    },
  };
}
// Uzakta duran DOĞRULANMIŞ cevap — üretimdeki quran-responses.json ile aynı biçim.
const PULL = {
  delivery: { requests: {} },
  responses: { responses: { [LOCAL_ID]: {
    responseId: 'qrr_msy9x0oq1iku637m', requestId: LOCAL_ID, surahId: SURAH, videoId: VIDEO,
    source: 'panel_manual', receivedAt: VALIDATED_AT, validatedAt: VALIDATED_AT,
    senderFingerprint: null, status: 'ready',
  } } },
};

const freshest = (...ids) => {
  const els = ids.map((i) => registry[i]).filter((e) => e && e._html);
  if (!els.length) return '';
  return els.sort((a, b) => b._seq - a._seq)[0]._html;
};

function run(appPath) {
  appHTML = ''; for (const k in registry) delete registry[k]; seq = 0;
  // #root / #app / body her zaman vardır (gerçek index.html kabuğu gibi);
  // aksi halde render() ilk temada null'a setAttribute çağırır.
  reg('root'); reg('app'); reg('body');
  const sandbox = buildSandbox(seedState());
  const ctx = vm.createContext(sandbox);
  for (const f of MODULES) vm.runInContext(fs.readFileSync(path.join(REPO, f), 'utf8'), ctx, { filename: f });
  vm.runInContext(fs.readFileSync(appPath, 'utf8'), ctx, { filename: 'app.js' });
  const App = sandbox.App;
  if (typeof App.start === 'function') App.start();
  // Konum kapısı (locationGateRequired) aksi halde tüm ekranı kaplar ve
  // Kur'an arayüzü hiç boyanmaz. Gerçek cihazda izin verilmiş durumun eşdeğeri.
  App.requestLocationGatePermission && App.requestLocationGatePermission();
  // Uzak cevabı çeken tek üretim yolu.
  sandbox.SeySync = { pullQuranUpdates(cb) { cb(null, PULL); } };
  App.openQuranJourney();
  App.refreshQuranUpdates(true);
  App.openQuranJourney();                       // kütüphaneyi tazele
  // Kütüphane 114 satır; ekran görüntüsü okunabilir olsun diye uygulamanın
  // KENDİ arama filtresi kullanılır (sahte kırpma değil, gerçek UI yolu).
  App.setQuranQuery({ value: 'mesed' });
  const library = freshest('quran-library-results', 'quran-scroll') || appHTML;
  App.openQuranSurah(SURAH);
  const detail = freshest('quran-detail-region', 'quran-scroll');
  const state = JSON.parse(sandbox.localStorage.getItem('seyma-reset-v1')).quranJourney.requests[SURAH];
  return { library, detail, state };
}

const CSS = fs.readFileSync(path.join(REPO, 'styles.css'), 'utf8');
function page(title, caption, tone, bodyHTML) {
  const badge = tone === 'bad' ? '#c2410c' : '#15803d';
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title>
<style>${CSS}</style>
<style>
  html,body{margin:0!important;padding:0!important;background:#0b0b0d!important;}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;}
  .cap{max-width:460px;margin:0 auto;padding:14px 16px 10px;color:#fff;}
  .cap b{display:inline-block;background:${badge};color:#fff;font-size:12px;font-weight:800;
    letter-spacing:.4px;padding:4px 10px;border-radius:999px;text-transform:uppercase;}
  .cap p{margin:8px 0 0;font-size:13px;line-height:1.5;color:#d4d4d8;}
</style></head><body>
<div class="cap"><b>${title}</b><p>${caption}</p></div>
<div id="root" data-theme="light" style="width:100%;max-width:460px;margin:0 auto;display:flex;justify-content:center;background:var(--page);">
  <div id="app" style="width:100%;max-width:460px;display:flex;flex-direction:column;position:relative;">${bodyHTML}</div>
</div></body></html>`;
}

fs.mkdirSync(OUT, { recursive: true });
const shots = [];
function emit(name, title, caption, tone, html) {
  const p = path.join(OUT, name + '.html');
  fs.writeFileSync(p, page(title, caption, tone, html));
  shots.push({ htmlPath: p, pngPath: p.replace(/\.html$/, '.png') });
}

console.log('== QY-21 görsel kanıt ==');
const after = run(path.join(REPO, 'app.js'));
console.log('SONRA  durum:', after.state.status, '| videoId:', after.state.videoId);
emit('qy21-sonra-liste', 'SONRA — düzeltme uygulanmış',
  'Aynı veri, aynı uzak cevap. Mesed satırı artık <b>Anlatım hazır</b>; anlatım uygulamaya düştü.', 'good', after.library);
emit('qy21-sonra-detay', 'SONRA — sûre ayrıntısı',
  `Gönderilen <code>${VIDEO}</code> anlatımı ayrıntı ekranında izlenebilir durumda.`, 'good', after.detail || after.library);

if (OLD_APP && fs.existsSync(OLD_APP)) {
  const before = run(OLD_APP);
  console.log('ÖNCE   durum:', before.state.status, '| videoId:', before.state.videoId);
  emit('qy21-once-liste', 'ÖNCE — düzeltmeden önce',
    'Uzakta doğrulanmış cevap DURUYOR, ama sûre <b>İletilemedi</b> durumunda kilitli olduğu için anlatım sessizce düşüyor.', 'bad', before.library);
  emit('qy21-once-detay', 'ÖNCE — sûre ayrıntısı',
    'Ayrıntı ekranında anlatım yok; tek eylem yeniden istemek. Gönderilen video hiç görünmüyor.', 'bad', before.detail || before.library);
  fs.writeFileSync(path.join(OUT, 'qy21-durum.json'), JSON.stringify({ once: before.state, sonra: after.state }, null, 2));
}

// ── Rasterize: script içermeyen statik HTML'i headless Chrome ile ──
const PORT = 9333 + Math.floor(Math.random() * 500);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`,
  '--no-first-run', '--no-default-browser-check', '--disable-gpu',
  '--user-data-dir=' + fs.mkdtempSync('/tmp/seyma-shot-'), 'about:blank'], { stdio: 'ignore' });
let ver = null;
for (let i = 0; i < 120 && !ver; i++) {
  try { ver = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); } catch (e) { await sleep(120); }
}
if (!ver) { chrome.kill(); throw new Error('Chrome DevTools açılmadı'); }
const ws = new WebSocket(ver.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let msgId = 0;
function call(method, params, sessionId) {
  return new Promise((resolve) => {
    const mid = ++msgId;
    const onMsg = (ev) => { const m = JSON.parse(ev.data); if (m.id === mid) { ws.removeEventListener('message', onMsg); resolve(m.result); } };
    ws.addEventListener('message', onMsg);
    ws.send(JSON.stringify(sessionId ? { id: mid, sessionId, method, params: params || {} } : { id: mid, method, params: params || {} }));
  });
}
const { targetId } = await call('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await call('Target.attachToTarget', { targetId, flatten: true });
const S = (m, p) => call(m, p, sessionId);
await S('Page.enable');
for (const s of shots) {
  await S('Emulation.setDeviceMetricsOverride', { width: 430, height: 900, deviceScaleFactor: 2, mobile: true });
  await S('Page.navigate', { url: 'file://' + s.htmlPath });
  await sleep(800);
  const { cssContentSize } = await S('Page.getLayoutMetrics');
  const h = Math.max(600, Math.min(Math.ceil(cssContentSize.height), 4000));
  await S('Emulation.setDeviceMetricsOverride', { width: 430, height: h, deviceScaleFactor: 2, mobile: true });
  await sleep(300);
  const { data } = await S('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(s.pngPath, Buffer.from(data, 'base64'));
  console.log('  ✓ ' + path.basename(s.pngPath));
}
ws.close();
chrome.kill();
console.log('\nÇıktı: ' + OUT);
