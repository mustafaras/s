#!/usr/bin/env node
// profile-visual-snapshots.mjs — renders the 8 module-boundary "soft break" screens and the
// 174/174 completion screen through the same headless VM harness as the sibling verify-*.mjs
// scripts, but wraps the extracted #app HTML in the REAL page shell (#root[data-theme] +
// the real styles.css) so a headless-Chrome screenshot pass is pixel-accurate — not just a
// content check. No real browser tab/window is ever opened, no fetch resolves, no
// localStorage/network write happens; this only rasterizes static local HTML+CSS files.
//
// Usage:
//   node .claude/skills/run-seyma/profile-visual-snapshots.mjs
//
// Output: files/shot/break-<moduleId>-<theme>-<date>.png (10) + files/shot/completion-<theme>-<date>.png (2)
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const REPO = process.env.SEYMA_REPO ||
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

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

// ── Fake DOM (identical stub pattern to verify-profile-assessment-breaks.mjs) ──
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
    fetch() { return new Promise(() => {}); }, // never resolves
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
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(REPO, f), 'utf8'), ctx, { filename: f });
  return ctx;
}
function baseSeed(extra) {
  const t = today();
  return Object.assign({ version: 2, startDate: t, lastOpenedDate: t, days: {}, notifications: [], luna: { qa: [] }, aeon: { qa: [] }, settings: { nickname: 'Sevgili Günışığı', ghToken: '', ghRepo: 'mustafaras/seyma-data' }, cycle: { periods: [], avgCycle: 28, avgPeriod: 5 } }, extra || {});
}
function consentedPA(responses, extra) {
  return Object.assign({ schemaVersion: 2, deliveryMode: 'single_session', status: 'active', currentItemIndex: 0, startedAt: '2026-07-01T09:00:00.000Z', completedAt: null, consent: { version: '1.0.0', informationShownAt: '2026-07-01T09:00:00.000Z', acceptedAt: '2026-07-01T09:00:05.000Z', profileProcessingAccepted: true, sensitiveDataAccepted: true, panelSummarySharingAccepted: false }, responses: responses || {}, moduleProgress: {}, scores: {}, quality: {}, report: {}, panelSummary: {} }, extra || {});
}
function responsesFor(items) {
  const r = {};
  items.forEach((it, i) => { r[it.id] = { value: 4, scoredValue: 4, shownAt: '2026-07-01T09:00:00.000Z', answeredAt: '2026-07-01T09:00:05.000Z', responseMs: 5000, revisionCount: 0, itemVersion: '1.0.0', sessionId: 'SINGLE', sequence: i + 1 }; });
  return r;
}
const FILES = ['profileAssessmentV1.js', 'app.js'];

function pageShell(theme, bodyHTML) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Şeyma snapshot (${theme})</title><link rel="stylesheet" href="../../styles.css"></head><body style="margin:0;">
<div id="root" data-theme="${theme}" style="min-height:100vh;height:100vh;width:100%;display:flex;justify-content:center;background:var(--page);overflow:hidden;">
  <div id="app" style="width:100%;max-width:460px;min-height:100vh;height:100vh;display:flex;flex-direction:column;position:relative;overflow:hidden;">${bodyHTML}</div>
</div>
</body></html>`;
}

const SHOT_DIR = path.join(REPO, 'files', 'shot');
fs.mkdirSync(SHOT_DIR, { recursive: true });
const stamp = today();
const written = [];

function writeShot(name, theme, html) {
  const htmlPath = path.join(SHOT_DIR, `${name}-${theme}-${stamp}.html`);
  fs.writeFileSync(htmlPath, pageShell(theme, html));
  written.push({ name, theme, htmlPath, pngPath: htmlPath.replace(/\.html$/, '.png') });
}

// ── 1) 8 break-point screens ── (skip with ONLY=completion for a fast completion-only run)
if (process.env.ONLY !== 'completion') {
  for (const n of BREAK_POINTS) {
    const justFinished = MODULE_BOUNDARIES.find((m) => m.endOrder === n);
    const sb = buildSandbox(baseSeed({ profileAssessment: consentedPA(responsesFor(ITEMS.slice(0, n))) }));
    appHTML = '';
    loadInto(sb, FILES);
    sb.App.start();
    writeShot(`break-${justFinished.moduleId}`, 'light', appHTML);
    writeShot(`break-${justFinished.moduleId}`, 'dark', appHTML);
  }
}

// ── 2) completion screen (light + dark) ──
{
  const first173 = ITEMS.slice(0, 173);
  const last = ITEMS[173];
  const sb = buildSandbox(baseSeed({ profileAssessment: consentedPA(responsesFor(first173)) }));
  loadInto(sb, FILES);
  appHTML = '';
  sb.App.start();
  sb.App.profileAnswer(last.id, 4);
  await sleep(260);
  writeShot('completion', 'light', appHTML);
  writeShot('completion', 'dark', appHTML);
}

// ── 3) rasterize every .html via headless Chrome, driven over the DevTools Protocol ──
// The `--screenshot` CLI flag was tried first but ignores `--window-size` for layout in this
// Chrome build (window.innerWidth measured 500 regardless of the flag — a known long-standing
// quirk of that flag) and only crops the output canvas after the fact, silently cutting off
// content. Driving Emulation.setDeviceMetricsOverride over CDP sets the real layout viewport.
const PORT = 9333 + Math.floor(Math.random() * 500);
const VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 3, mobile: true };

function sleepMs(ms) { return new Promise((r) => setTimeout(r, ms)); }
async function waitForDevtools(port) {
  for (let i = 0; i < 100; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) return;
    } catch { /* not up yet */ }
    await sleepMs(100);
  }
  throw new Error('Chrome DevTools endpoint did not come up in time');
}
function cdpClient(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let nextId = 0;
  const pending = new Map();
  const eventListeners = new Map();
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id != null && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message)); else resolve(msg.result);
    } else if (msg.method && eventListeners.has(msg.method)) {
      eventListeners.get(msg.method).forEach((cb) => cb(msg.params));
    }
  });
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++nextId;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }
  function once(method) {
    return new Promise((resolve) => {
      const cbs = eventListeners.get(method) || [];
      cbs.push((params) => resolve(params));
      eventListeners.set(method, cbs);
    });
  }
  function waitOpen() {
    return new Promise((resolve, reject) => {
      ws.addEventListener('open', () => resolve(), { once: true });
      ws.addEventListener('error', (e) => reject(e), { once: true });
    });
  }
  return { send, once, waitOpen, close: () => ws.close() };
}
async function shootOne(port, shot) {
  const tab = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  const client = cdpClient(tab.webSocketDebuggerUrl);
  await client.waitOpen();
  await client.send('Page.enable');
  await client.send('Emulation.setDeviceMetricsOverride', VIEWPORT);
  const loadFired = client.once('Page.loadEventFired');
  await client.send('Page.navigate', { url: `file://${shot.htmlPath}` });
  await loadFired;
  await sleepMs(300); // let webfonts/gradients settle before capture
  const { data } = await client.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  fs.writeFileSync(shot.pngPath, Buffer.from(data, 'base64'));
  client.close();
  await fetch(`http://127.0.0.1:${port}/json/close/${tab.id}`);
}

const chromeProc = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`, '--no-first-run', '--no-default-browser-check',
], { stdio: 'ignore' });
let ok = 0, fail = 0;
try {
  await waitForDevtools(PORT);
  for (const shot of written) {
    try {
      await shootOne(PORT, shot);
      ok++;
      console.log(`✅ ${path.basename(shot.pngPath)}`);
    } catch (e) {
      fail++;
      console.log(`❌ ${path.basename(shot.pngPath)} — ${e.message}`);
    }
  }
} finally {
  chromeProc.kill();
}
console.log(`\n${ok} screenshot(s) written, ${fail} failed. Dir: ${SHOT_DIR}`);
process.exit(fail > 0 ? 1 : 0);
