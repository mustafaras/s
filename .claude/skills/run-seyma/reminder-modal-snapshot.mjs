#!/usr/bin/env node
// reminder-modal-snapshot.mjs — "Hatırlatmalar ve bildirimler" (ritim merkezi)
// modalını aynı headless VM harness'ından geçirip GERÇEK sayfa kabuğu
// (#root[data-theme] + gerçek styles.css) içine sararak rasterize eder.
// Kardeş profile-visual-snapshots.mjs ile birebir aynı desen: gerçek bir
// tarayıcı sekmesi/penceresi AÇILMAZ, fetch hiç resolve etmez, localStorage
// yalnız bellekte, ağa hiçbir yazma gitmez — sadece yerel statik HTML+CSS
// rasterize edilir.
//
// Neden birden çok genişlik: modal CSS'inde 390 / 460 / 681 kırılma noktaları
// var ve kaskad sırası bunların bir kısmını etkisiz bırakabiliyor. Görsel
// kanıt olmadan düzeltme yapılmaz.
//
// Kullanım: node .claude/skills/run-seyma/reminder-modal-snapshot.mjs
// Çıktı:    files/shot/reminder-<genişlik>-<tema>-<tarih>.png
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const REPO = process.env.SEYMA_REPO ||
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleepMs = (ms) => new Promise((r) => setTimeout(r, ms));
function today() {
  const d = new Date(); const p = (n) => (n < 10 ? '0' : '') + n;
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
class DOMParserStub { parseFromString() { return { body: makeEl('body'), querySelector() { return null; }, querySelectorAll() { return []; } }; } }

function buildSandbox(seedData) {
  const elCache = { app: makeEl('app'), root: makeEl('root') };
  const doc = {
    hidden: false, body: makeEl('body'), documentElement: elCache.root,
    getElementById(id) { return elCache[id] || (elCache[id] = makeEl(id)); },
    querySelector() { return null; }, querySelectorAll() { return []; },
    createElement() { return makeEl(''); }, createDocumentFragment() { return makeEl(''); },
    addEventListener() {}, removeEventListener() {}, DOMParser: undefined,
    activeElement: null, visibilityState: 'visible',
  };
  const store = { 'seyma-reset-v1': JSON.stringify(seedData) };
  const sandbox = {
    console: { log() {}, warn() {}, error() {} },
    localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; }, clear() { for (const k in store) delete store[k]; } },
    document: doc,
    // Konum kapısı: geolocation yoksa app 'unsupported' kilit ekranı çiziyor ve
    // modal hiç render edilmiyor. Sabit, sahte bir konum yeterli — ağ yok.
    navigator: {
      vibrate() {}, userAgent: 'node-harness', clipboard: { writeText: () => Promise.resolve() },
      geolocation: {
        getCurrentPosition(ok) { if (ok) ok({ coords: { latitude: 38.4237, longitude: 27.1428, accuracy: 12 }, timestamp: Date.now() }); },
        watchPosition(ok) { if (ok) ok({ coords: { latitude: 38.4237, longitude: 27.1428, accuracy: 12 }, timestamp: Date.now() }); return 1; },
        clearWatch() {},
      },
      permissions: { query: () => Promise.resolve({ state: 'granted', addEventListener() {}, removeEventListener() {} }) },
    },
    location: { protocol: 'http:', hostname: 'localhost', search: '', href: 'http://localhost/', reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    DOMParser: DOMParserStub,
    fetch() { return new Promise(() => {}); },
    setTimeout, clearTimeout, setInterval, clearInterval,
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(a) { for (let i = 0; i < a.length; i++) a[i] = (i * 7) % 256; return a; }, randomUUID: () => 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee' },
    URL: Object.assign(function () {}, { createObjectURL: () => 'blob:stub', revokeObjectURL() {} }),
    Blob: function () {}, File: function () {}, FileReader: function () {},
    // canNotify() true dönüp Notification.permission okunuyor; stub olmadan
    // render zinciri patlıyor. Hiçbir bildirim üretilmez, yalnız okunur alan.
    Notification: Object.assign(function Notification() {}, { permission: 'granted', requestPermission: () => Promise.resolve('granted') }),
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

// Gerçek 174 profil itemId'si — driver.mjs ile aynı tohum sözleşmesi.
const paSandbox = { window: {}, console };
vm.createContext(paSandbox);
vm.runInContext(fs.readFileSync(path.join(REPO, 'profileAssessmentV1.js'), 'utf8'), paSandbox, { filename: 'profileAssessmentV1.js' });
const PROFILE_ITEM_IDS = paSandbox.window.ProfileAssessmentV1.sessions[0].items.map((i) => i.id);

// driver.mjs'teki seedState() ile aynı: auth kapısı açık, profil tamamlanmış,
// bir günlük kayıt var. Aksi hâlde app onboarding/kilit ekranında kalır ve
// modalsHTML() hiç çalışmaz.
function seed() {
  const t = today();
  return {
    version: 2, startDate: t, lastOpenedDate: t,
    days: { [t]: { habits: {}, mood: 'ok', meals: {}, mealItems: {}, intention: 'test', savedAt: t + 'T09:00:00.000Z' } },
    notifications: [], luna: { qa: [] }, aeon: { qa: [] },
    settings: {
      nickname: 'Sevgili Günışığı', ghToken: '', ghRepo: 'mustafaras/seyma-data',
      locationEnabled: true, locationMode: 'auto',
      auth: { rememberMe: true, usernameHash: 'ae9e1ed2b6abcbce74cc0c15719fdbba372a7dd62e6232510656bade7c201af4', unlockedAt: t + 'T09:00:00.000Z' },
    },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 },
    profileAssessment: {
      schemaVersion: 2, deliveryMode: 'single_session', status: 'completed',
      startedAt: t + 'T09:00:00.000Z', completedAt: t + 'T09:30:00.000Z', currentItemIndex: 174,
      consent: { version: '1.0.0', informationShownAt: t + 'T09:00:00.000Z', acceptedAt: t + 'T09:00:05.000Z', profileProcessingAccepted: true, sensitiveDataAccepted: true, panelSummarySharingAccepted: false },
      responses: Object.fromEntries(PROFILE_ITEM_IDS.map((id, i) => [id, { value: 4, scoredValue: 4, shownAt: t + 'T09:00:00.000Z', answeredAt: t + 'T09:00:05.000Z', responseMs: 5000, revisionCount: 0, itemVersion: '1.0.0', sessionId: 'SINGLE', sequence: i + 1 }])),
      moduleProgress: {}, scores: {}, quality: {}, report: {}, panelSummary: {},
    },
  };
}

// REM-54: index.html'in gerçek boot sırası — reminder modülleri dahil.
const FILES = ['motivationProgramV2.js', 'profileAssessmentV1.js', 'app/core/constants.js',
  'app/core/reminderCatalog.js', 'app/core/reminderEngine.js', 'app/core/reminderScheduler.js',
  'app/core/reminderDelivery.js', 'app.js'];
function renderModal() {
  appHTML = '';
  const sb = buildSandbox(seed());
  const ctx = vm.createContext(sb);
  for (const f of FILES) vm.runInContext(fs.readFileSync(path.join(REPO, f), 'utf8'), ctx, { filename: f });
  if (!sb.App || typeof sb.App.openReminderCenter !== 'function') throw new Error('App.openReminderCenter yok');
  // Modal, ayarlar sekmesinden açılır (tests/reminders/test_reminder_app_render.js
  // ile aynı sıra): önce sekmeye geç, sonra merkezi aç.
  sb.App.go('ayarlar');
  sb.App.openReminderCenter();
  if (process.env.DBG) {
    console.log('  #app uzunluk:', appHTML.length);
    console.log('  sey-reminder geçiyor mu:', appHTML.indexOf('sey-reminder') >= 0);
    console.log('  ilk 200:', appHTML.slice(0, 200).replace(/\s+/g, ' '));
    const ids = [...appHTML.matchAll(/id="([^"]+)"/g)].map((m) => m[1]).slice(0, 15);
    console.log('  id\'ler:', ids.join(', '));
  }
  if (appHTML.indexOf('sey-reminder-overlay') < 0) throw new Error('modal HTML üretilmedi');
  return appHTML;
}

// Gerçek index.html kabuğu; #app genişliği viewport'a göre (uygulama ≤460px
// tasarımı, ama overlay position:fixed olduğu için viewport'u kaplar).
function pageShell(theme, bodyHTML) {
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Şeyma reminder snapshot (${theme})</title><link rel="stylesheet" href="../../styles.css"></head><body style="margin:0;">
<div id="root" data-theme="${theme}" style="min-height:100vh;height:100vh;width:100%;display:flex;justify-content:center;background:var(--page);overflow:hidden;">
  <div id="app" style="width:100%;max-width:460px;min-height:100vh;height:100vh;display:flex;flex-direction:column;position:relative;">${bodyHTML}</div>
</div>
</body></html>`;
}

const SHOT_DIR = path.join(REPO, 'files', 'shot');
fs.mkdirSync(SHOT_DIR, { recursive: true });
const stamp = today();
const VIEWPORTS = [
  { name: '360', width: 360, height: 800, mobile: true },   // dar telefon (<390 kırılımı)
  { name: '430', width: 430, height: 932, mobile: true },   // tipik telefon (390-460 arası)
  { name: '768', width: 768, height: 1000, mobile: false }, // ≥681 kırılımı — kaskad hatası burada görünür
];
const html = renderModal();
const written = [];
for (const vp of VIEWPORTS) {
  for (const theme of ['light', 'dark']) {
    const p = path.join(SHOT_DIR, `reminder-${vp.name}-${theme}-${stamp}.html`);
    fs.writeFileSync(p, pageShell(theme, html));
    written.push({ vp, theme, htmlPath: p, pngPath: p.replace(/\.html$/, '.png') });
  }
}
console.log(`modal HTML: ${html.length} karakter · ${written.length} kare hazırlandı`);

// ── rasterize (CDP; --screenshot bayrağı layout viewport'u yok sayıyor) ──
const PORT = 9333 + Math.floor(Math.random() * 500);
async function waitForDevtools(port) {
  for (let i = 0; i < 100; i++) {
    try { const r = await fetch(`http://127.0.0.1:${port}/json/version`); if (r.ok) return; } catch {}
    await sleepMs(100);
  }
  throw new Error('Chrome DevTools ucu zamanında açılmadı');
}
function cdpClient(wsUrl) {
  const ws = new WebSocket(wsUrl); let nextId = 0;
  const pending = new Map(), listeners = new Map();
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id != null && pending.has(m.id)) { const { resolve, reject } = pending.get(m.id); pending.delete(m.id); m.error ? reject(new Error(m.error.message)) : resolve(m.result); }
    else if (m.method && listeners.has(m.method)) listeners.get(m.method).forEach((cb) => cb(m.params));
  });
  return {
    send: (method, params = {}) => new Promise((resolve, reject) => { const id = ++nextId; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); }),
    once: (method) => new Promise((resolve) => { const c = listeners.get(method) || []; c.push(resolve); listeners.set(method, c); }),
    waitOpen: () => new Promise((res, rej) => { ws.addEventListener('open', () => res(), { once: true }); ws.addEventListener('error', rej, { once: true }); }),
    close: () => ws.close(),
  };
}
async function shootOne(port, shot) {
  const tab = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  const c = cdpClient(tab.webSocketDebuggerUrl);
  await c.waitOpen();
  await c.send('Page.enable');
  await c.send('Emulation.setDeviceMetricsOverride', { width: shot.vp.width, height: shot.vp.height, deviceScaleFactor: 2, mobile: shot.vp.mobile });
  const loaded = c.once('Page.loadEventFired');
  await c.send('Page.navigate', { url: `file://${shot.htmlPath}` });
  await loaded;
  await sleepMs(300);
  const { data } = await c.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  fs.writeFileSync(shot.pngPath, Buffer.from(data, 'base64'));
  c.close();
  await fetch(`http://127.0.0.1:${port}/json/close/${tab.id}`);
}
const proc = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${PORT}`, '--no-first-run', '--no-default-browser-check'], { stdio: 'ignore' });
let ok = 0, bad = 0;
try {
  await waitForDevtools(PORT);
  for (const s of written) {
    try { await shootOne(PORT, s); ok++; console.log('✅ ' + path.basename(s.pngPath)); }
    catch (e) { bad++; console.log('❌ ' + path.basename(s.pngPath) + ' — ' + e.message); }
  }
} finally { proc.kill(); }
console.log(`\n${ok} kare yazıldı, ${bad} başarısız. Dizin: ${SHOT_DIR}`);
process.exit(bad > 0 ? 1 : 0);
