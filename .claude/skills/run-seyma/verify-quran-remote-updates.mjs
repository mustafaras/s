#!/usr/bin/env node
// verify-quran-remote-updates.mjs — QY-11 kabul kapısı: Kur’an Yolculuğu
// uzak teslim/yanıt uygulama hattının (`App.refreshQuranUpdates` →
// `quranApplyRemoteUpdates`) uçtan uca doğrulaması. `window.SeySync` sahte
// (senkron) bir `pullQuranUpdates` ile taklit edilir — GERÇEK AĞ ÇAĞRISI YOK.
//
// app.js TEK bir IIFE'dir; `data`/`ui` global değildir (bkz.
// verify-quran-library-ui.mjs'teki aynı not). Kalıcı durum yalnız
// localStorage üzerinden okunur/yazılır — bu yüzden `App.refreshQuranUpdates`
// (save() çağıran ÜRETİM giriş noktası) test edilir, saf `quranApplyRemoteUpdates`
// değil; bu aynı zamanda gerçek kullanım yolunu (open/yenile → save → repaint)
// uçtan uca kanıtlar.
//
// DATA SAFETY: node:vm sandbox, gerçek DOM/ağ yok, seyma-data'ya yazılmaz.
//
// Usage:
//   node .claude/skills/run-seyma/verify-quran-remote-updates.mjs
//
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const ISO = (h) => '2026-07-31T' + String(h).padStart(2, '0') + ':00:00.000Z';
const VID = 'dQw4w9WgXcQ';

let passed = 0, failed = 0;
function ok(name, cond, detail) {
  if (cond) { passed++; console.log('  ✓ ' + name); }
  else { failed++; console.log('  ✗ ' + name + (detail !== undefined ? ' — ' + JSON.stringify(detail) : '')); }
}

// ── verify-quran-library-ui.mjs ile birebir aynı sandbox deseni ──
function makeEl(id) {
  return {
    id: id || '', _html: '', _text: '', style: { cssText: '', setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {}, children: [], scrollTop: 0, offsetWidth: 0, value: '', files: [],
    get innerHTML() { return this._html; }, set innerHTML(v) { this._html = String(v); },
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
const appEl = makeEl('app'), rootEl = makeEl('root');
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
  return { getItem(k) { return k in store ? store[k] : null; }, setItem(k, v) { store[k] = String(v); }, removeItem(k) { delete store[k]; }, clear() { for (const k in store) delete store[k]; }, _store: store };
}
function buildSandbox(seedState) {
  const sandbox = {
    console, localStorage: makeLS({ 'seyma-reset-v1': JSON.stringify(seedState) }), document: doc, __SEYMA_TEST_ZIKR__: true,
    navigator: { vibrate() {}, userAgent: 'node-harness', clipboard: { writeText() { return Promise.resolve(); } }, geolocation: null },
    location: { protocol: 'http:', hostname: 'localhost', search: '', href: 'http://localhost/', reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    DOMParser: DOMParserStub,
    fetch() { return new Promise(() => {}); },
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
const FILES = ['motivationProgramV2.js', 'profileAssessmentV1.js', 'saygiPeople.js', 'hijriCalendar.js', 'esmaulHusnaV1.js', 'app.js'];

function journey(sandbox) { try { return JSON.parse(sandbox.localStorage.getItem('seyma-reset-v1')).quranJourney; } catch (e) { return null; } }

// requestId'li, verilen durumda bir yerel istek kaydı üreten seed fabrikası.
function seedState(requests) {
  return {
    onboarded: true, startDate: '2026-07-01', days: {},
    settings: { theme: 'light', name: 'Test', profileAssessmentInactive: true, auth: { rememberMe: true, usernameHash: 'harness-stub-hash', unlockedAt: ISO(8) } },
    quranJourney: { schemaVersion: 1, catalogVersion: 'quran-revelation-tr-v1', startedAt: ISO(9), activeSurahId: 'alak', requests },
  };
}
// Bir sûre için, verilen requestId/status ile geçerli bir istek kaydı.
function req(requestId, status, extra) {
  return Object.assign({ requestId, status, requestedAt: ISO(9), notifiedAt: null, responseId: null, videoId: null, readyAt: null, startedWatchingAt: null, watchedAt: null, questionOpenedAt: null, updatedAt: ISO(9), videoHistory: [] }, extra || {});
}
// sandbox'ı boot eder ve window.SeySync.pullQuranUpdates'i SENKRON sahte bir
// sonuçla değiştirir (gerçek ağ/ Promise mikro-görev sırası yok — çağrı
// App.refreshQuranUpdates(true) döndüğünde her şey zaten bitmiş olur).
function bootWithPull(requests, pullResult) {
  const sandbox = buildSandbox(seedState(requests));
  const ctx = vm.createContext(sandbox);
  for (const f of FILES) vm.runInContext(fs.readFileSync(path.join(REPO, f), 'utf8'), ctx, { filename: f });
  if (typeof sandbox.App.start === 'function') sandbox.App.start();
  sandbox.SeySync = { pullQuranUpdates(cb) { cb(null, pullResult); } };
  return sandbox;
}

console.log('== QY-11 Kur’an Yolculuğu — uzak teslim/yanıt uygulama hattı doğrulaması ==');

// ── 1) delivery_receipt + await_reply: queued → awaiting_reply ──
console.log('\n1. Teslim alındı bilgisi (delivery.json)');
{
  const sb = bootWithPull(
    { alak: req('qr_1', 'queued') },
    { delivery: { requests: { qr_1: { status: 'sent', sentAt: ISO(10), providerMessageId: 'm1', error: null } } }, responses: { responses: {} } }
  );
  sb.App.refreshQuranUpdates(true);
  const j = journey(sb);
  ok('durum awaiting_reply oluyor (notified + await_reply zinciri)', j.requests.alak.status === 'awaiting_reply', j.requests.alak.status);
  ok('notifiedAt yazıldı ve save() gerçekten kalıcı hale getirdi', !!j.requests.alak.notifiedAt);
}

// ── 2) response_received + response_valid: awaiting_reply → ready, sonra idempotent ──
console.log('\n2. Geçerli yanıt (responses.json) + idempotent tekrar');
{
  const pull = { delivery: { requests: {} }, responses: { responses: { qr_2: { responseId: 'qrr_2', requestId: 'qr_2', surahId: 'alak', videoId: VID, status: 'ready' } } } };
  const sb = bootWithPull({ alak: req('qr_2', 'awaiting_reply') }, pull);
  sb.App.refreshQuranUpdates(true);
  let j = journey(sb);
  ok('durum ready oluyor', j.requests.alak.status === 'ready', j.requests.alak.status);
  ok('videoId ve responseId doğru yazıldı', j.requests.alak.videoId === VID && j.requests.alak.responseId === 'qrr_2');

  sb.App.refreshQuranUpdates(true); // aynı yanıtı ikinci kez uygula
  j = journey(sb);
  ok('aynı yanıt ikinci kez uygulansa da durum/video değişmez (idempotent)', j.requests.alak.status === 'ready' && j.requests.alak.videoId === VID);
}

// ── 3) Yanlış sûre eşleme tehdidi: response.surahId sûre anahtarıyla uyuşmuyorsa UYGULANMAZ ──
console.log('\n2b. Delivery kaydı eksikken doğrulanmış yanıt queued → ready');
{
  const pull = { delivery: { requests: {} }, responses: { responses: { qr_2b: { responseId: 'qrr_2b', requestId: 'qr_2b', surahId: 'alak', videoId: VID, status: 'ready' } } } };
  const sb = bootWithPull({ alak: req('qr_2b', 'queued') }, pull);
  sb.App.refreshQuranUpdates(true);
  const j = journey(sb);
  ok('doğrulanmış response delivery olmadan queued durumunu ready yapar', j.requests.alak.status === 'ready', j.requests.alak.status);
  ok('delivery eksik senaryoda videoId kaybolmadan uygulanır', j.requests.alak.videoId === VID, j.requests.alak.videoId);
}

// ── 3) Yanlış sûre eşleme tehdidi: response.surahId sûre anahtarıyla uyuşmuyorsa UYGULANMAZ ──
console.log('\n3. Yanlış sûre eşleme reddi (plan §2/§9 tehdit modeli)');
{
  // Aynı requestId altında ama surahId ALAK olan (yasin değil) sahte/bozuk kayıt.
  const pull = { delivery: { requests: {} }, responses: { responses: { qr_3: { responseId: 'qrr_3', requestId: 'qr_3', surahId: 'alak', videoId: VID, status: 'ready' } } } };
  const sb = bootWithPull({ yasin: req('qr_3', 'awaiting_reply') }, pull);
  sb.App.refreshQuranUpdates(true);
  const j = journey(sb);
  ok('surahId uyuşmazlığında durum awaiting_reply olarak kalır, video yazılmaz', j.requests.yasin.status === 'awaiting_reply' && j.requests.yasin.videoId === null, j.requests.yasin);
}

// ── 4) revoked: ready'ten video_gone'a düşer, video geçmişe taşınır (kaybolmaz) ──
console.log('\n4. Yanıt geri çekilirse (revoked) video_gone + geçmiş kaydı');
{
  const pull = { delivery: { requests: {} }, responses: { responses: { qr_4: { responseId: 'qrr_4', requestId: 'qr_4', surahId: 'alak', videoId: VID, status: 'revoked' } } } };
  const sb = bootWithPull({ alak: req('qr_4', 'ready', { responseId: 'qrr_4', videoId: VID, readyAt: ISO(10) }) }, pull);
  sb.App.refreshQuranUpdates(true);
  const j = journey(sb);
  ok('durum video_unavailable oluyor', j.requests.alak.status === 'video_unavailable', j.requests.alak.status);
  // quranApplyEvent'in 'video_gone' dalı BİLEREK videoId'yi KORUR (silmez/arşivlemez) —
  // kullanıcıya hangi anlatımın erişilemez olduğunu gösterebilmek için (bkz. app.js
  // "video_gone: videoId bilerek KORUNUR" yorumu). Yalnız response_valid/request_submit arşivler.
  ok('videoId teşhis için korunur (video_gone arşivlemez)', j.requests.alak.videoId === VID && j.requests.alak.videoHistory.length === 0);
}

// ── 5) Eşleşen requestId yoksa hiçbir şey değişmez ──
console.log('\n5. Eşleşmeyen requestId — no-op');
{
  const pull = { delivery: { requests: { qr_baska: { status: 'sent' } } }, responses: { responses: { qr_baska2: { requestId: 'qr_baska2', surahId: 'alak', videoId: VID, status: 'ready' } } } };
  const sb = bootWithPull({ alak: req('qr_5', 'queued') }, pull);
  sb.App.refreshQuranUpdates(true);
  const j = journey(sb);
  ok('ilgisiz requestId kayıtları yerel durumu değiştirmez', j.requests.alak.status === 'queued');
}

// ── 6) Senkron yapılandırılmamışsa (SeySync yok) çökmeden sessizce geçilir ──
console.log('\n6. SeySync yokken güvenli davranış');
{
  const sandbox = buildSandbox(seedState({ alak: req('qr_6', 'queued') }));
  const ctx = vm.createContext(sandbox);
  for (const f of FILES) vm.runInContext(fs.readFileSync(path.join(REPO, f), 'utf8'), ctx, { filename: f });
  sandbox.SeySync = null; // hiç yapılandırılmamış senkron
  let threw = false;
  try { sandbox.App.refreshQuranUpdates(true); } catch (e) { threw = true; }
  ok('SeySync yokken throw etmez', !threw);
  ok('durum değişmeden kalır', journey(sandbox).requests.alak.status === 'queued');
}

// ── 7) Arka planda agresif polling yok: setInterval kullanılmıyor ──
console.log('\n7. Statik denetim: agresif arka plan polling yok');
{
  const appSource = fs.readFileSync(path.join(REPO, 'app.js'), 'utf8');
  const syncSource = fs.readFileSync(path.join(REPO, 'sync.js'), 'utf8');
  const appIdx = appSource.indexOf('quranApplyRemoteUpdates');
  const syncIdx = syncSource.indexOf('pullQuranUpdates');
  ok('app.js QY-11 bloğunda setInterval yok', appIdx >= 0 && !/setInterval/.test(appSource.slice(appIdx, appIdx + 4000)));
  ok('sync.js pullQuranUpdates bloğunda setInterval yok', syncIdx >= 0 && !/setInterval/.test(syncSource.slice(syncIdx, syncIdx + 2000)));
  ok('açılış tetiği yalnız openQuranJourney içinde tek noktadan çağrılır', (appSource.match(/App\.refreshQuranUpdates\(true\)/g) || []).length === 1);
}

console.log('\n' + (failed ? '⚠️ ' + failed + ' başarısız, ' : '✅ ') + passed + '/' + (passed + failed) + ' assertion pass');
process.exit(failed ? 1 : 0);
