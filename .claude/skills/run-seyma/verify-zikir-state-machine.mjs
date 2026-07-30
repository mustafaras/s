#!/usr/bin/env node
// verify-zikir-state-machine.mjs — ZP-05 kabul kapısı: tap/undo/pause/resume/
// preset-değişimi/gün-değişimi/kapanış akışlarının TEK açık durum makinesi
// (zikrSessionState: idle/active/paused/hatim-complete/error-recoverable +
// active→active üzerindeki 'cycle-complete' OLAYI) altında güvenilir çalıştığını
// headless doğrular.
//
// DATA SAFETY: app.js + yardımcı modüller `node:vm` sandbox'ında, gerçek DOM/ağ
// olmadan boot edilir (zikr-harness.mjs ile birebir aynı desen). Gerçek
// tarayıcı açılmaz, sunucu başlatılmaz, seyma-data'ya yazılmaz.
//
// Usage:
//   node .claude/skills/run-seyma/verify-zikir-state-machine.mjs
//
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
function today() { const d = new Date(); const p = n => (n < 10 ? '0' : '') + n; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }
const t = today();

let passed = 0, failed = 0;
function ok(name, cond, detail) {
  if (cond) { passed++; console.log('  ✓ ' + name); }
  else { failed++; console.log('  ✗ ' + name + (detail !== undefined ? ' — ' + JSON.stringify(detail) : '')); }
}

// ── zikr-harness.mjs ile birebir aynı sandbox deseni ──
function makeEl(id) {
  const el = {
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
  return el;
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
function buildSandbox(seedData) {
  const seed = seedData ? { 'seyma-reset-v1': JSON.stringify(seedData) } : {};
  const localStorage = makeLS(seed);
  const sandbox = {
    console, localStorage, document: doc, __SEYMA_TEST_ZIKR__: true,
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
function loadInto(sandbox, files) {
  const ctx = vm.createContext(sandbox);
  for (const f of files) { const src = fs.readFileSync(path.join(REPO, f), 'utf8'); vm.runInContext(src, ctx, { filename: f }); }
  return ctx;
}
const FILES = ['motivationProgramV2.js', 'profileAssessmentV1.js', 'saygiPeople.js', 'hijriCalendar.js', 'esmaulHusnaV1.js', 'app.js'];
function baseSeed(zikr) {
  return {
    version: 2, startDate: t, lastOpenedDate: t,
    days: { [t]: { habits: {}, mood: null } },
    notifications: [], luna: { qa: [] }, aeon: { qa: [] },
    settings: { nickname: 'Test', ghToken: '', ghRepo: 'mustafaras/seyma-data' },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 },
    saygi: { collection: {}, streak: 0, lastReadDate: '' },
    zikr,
  };
}
function fettahSeed(count, extra) {
  const hid = 'hatim_sm_test';
  return baseSeed(Object.assign({
    schemaVersion: 3, migrationVersion: 'zikr_v2', editorialVersion: 0,
    presets: [{ id: 'esma_19', name: 'el-Fettâh', arabic: 'فتاح', ebced: 489, target: 489, builtIn: true, kind: 'esma', countDirection: 'down', archived: false, createdAt: t }],
    journeys: { esma_19: { presetId: 'esma_19', lifetimeCount: count, activeHatimId: hid, lastAt: t + 'T10:00:00.000Z', lastSessionId: '', completedHatims: 0, legacyCompletedHatims: 0, hatims: [{ id: hid, mode: 'ebced_square', baseTarget: 489, target: 239121, count, startedAt: t + 'T00:00:00.000Z', completedAt: null, status: count >= 239121 ? 'completed' : 'active' }] } },
    sessions: {}, activeSession: null,
    settings: { activePresetId: 'esma_19', soundOn: false, haptic: false, autoAdvance: false, defaultMode: 'hatim', confirmReset: true },
    streak: 0, streakDate: '',
  }, extra || {}));
}
function coreSeed(count) {
  return baseSeed({
    schemaVersion: 3, migrationVersion: 'zikr_v2', editorialVersion: 0,
    presets: [
      { id: 'subhanallah', name: 'Sübhanallah', phrase: 'Sübhanallah', target: 33, color: 'zikr', builtIn: true, kind: 'core', archived: false, createdAt: t },
      { id: 'elhamdulillah', name: 'Elhamdülillah', phrase: 'Elhamdülillah', target: 33, color: 'zikr', builtIn: true, kind: 'core', archived: false, createdAt: t },
    ],
    journeys: { subhanallah: { presetId: 'subhanallah', lifetimeCount: count, activeHatimId: '', lastAt: t + 'T10:00:00.000Z', lastSessionId: '', completedHatims: 0, legacyCompletedHatims: 0, hatims: [] } },
    sessions: {}, activeSession: null,
    settings: { activePresetId: 'subhanallah', soundOn: false, haptic: false, autoAdvance: false, defaultMode: 'hatim', confirmReset: true },
    streak: 0, streakDate: '',
  });
}
function fettahPresetObj(sb) { return sb.App.zikrMath ? { kind: 'esma', ebced: 489 } : null; }

console.log('== ZP-05 Zikirmatik oturum durum makinesi doğrulaması ==');

// ── 1) idle → active (ilk zikrTap) ──
{
  const sb = buildSandbox(fettahSeed(100)); loadInto(sb, FILES); sb.App.start();
  const p = { kind: 'esma', ebced: 489 };
  ok('Yeni açılan preset: idle', sb.App.zikrSessionState() === 'idle');
  sb.App.openZikr(); sb.App.zikrTap();
  ok('İlk tap sonrası: active', sb.App.zikrSessionState() === 'active');
  const d1 = JSON.parse(sb.localStorage.getItem('seyma-reset-v1'));
  ok('Atomik güncelleme: journey/hatim/gün/session TEK tap\'te birlikte ilerledi',
    d1.zikr.journeys.esma_19.lifetimeCount === 101 && d1.zikr.journeys.esma_19.hatims[0].count === 101 &&
    d1.zikr.sessions[t].totalCount === 1 && d1.zikr.activeSession && d1.zikr.activeSession.count === 1 && d1.zikr.activeSession.hatimId === 'hatim_sm_test');
}

// ── 2) active → paused → active ──
{
  const sb = buildSandbox(fettahSeed(100)); loadInto(sb, FILES); sb.App.start();
  const p = { kind: 'esma', ebced: 489 };
  sb.App.openZikr(); sb.App.zikrTap();
  ok('Tap sonrası active', sb.App.zikrSessionState() === 'active');
  const activeBefore=JSON.parse(sb.localStorage.getItem('seyma-reset-v1')).zikr.activeSession;
  sb.App.toggleZikrPause();
  ok('toggleZikrPause: active → paused', sb.App.zikrSessionState() === 'paused');
  const pausedBefore=sb.localStorage.getItem('seyma-reset-v1');
  sb.App.zikrTap();
  const pausedAfter=sb.localStorage.getItem('seyma-reset-v1');
  ok('Duraklatılmış sayaç yüzeyine dokunmak sayımı veya oturumu değiştirmiyor', pausedBefore === pausedAfter);
  sb.App.toggleZikrPause();
  ok('toggleZikrPause tekrar: paused → active', sb.App.zikrSessionState() === 'active');
  const resumed=JSON.parse(sb.localStorage.getItem('seyma-reset-v1')).zikr.activeSession;
  ok('Sürdür aynı oturum kimliği ve sayımla devam ediyor', resumed.id === activeBefore.id && resumed.count === activeBefore.count && !resumed.pausedAt);
  sb.App.zikrTap();
  const afterResume=JSON.parse(sb.localStorage.getItem('seyma-reset-v1')).zikr.activeSession;
  ok('Sürdür sonrası ilk dokunuş aynı oturumda sayımı artırıyor', afterResume.id === activeBefore.id && afterResume.count === activeBefore.count + 1);
}

// ── 3) hızlı 100 tap = tam 100 (state='active' boyunca) ──
{
  const sb = buildSandbox(fettahSeed(0)); loadInto(sb, FILES); sb.App.start(); sb.App.openZikr();
  for (let i = 0; i < 100; i++) sb.App.zikrTap();
  const d = JSON.parse(sb.localStorage.getItem('seyma-reset-v1'));
  ok('100 hızlı tap tam 100 artış üretti', d.zikr.journeys.esma_19.lifetimeCount === 100);
  ok('100 tap sonunda hâlâ active (hatim tamamlanmadı)', sb.App.zikrSessionState() === 'active');
}

// ── 4) 489 sınırı: tap ile cycle-complete OLAYI, undo ile iki yönde doğru ──
{
  const sb = buildSandbox(fettahSeed(488)); loadInto(sb, FILES); sb.App.start(); sb.App.openZikr();
  sb.App.zikrTap();
  let d = JSON.parse(sb.localStorage.getItem('seyma-reset-v1'));
  ok('488→489: completedCycles=1 (cycle-complete olayı gerçekleşti)', d.zikr.journeys.esma_19.hatims[0].count === 489 && d.zikr.sessions[t].perPreset.esma_19.completedCycles === 1);
  ok('489\'da durum hâlâ active (hatim tamamlanmadı, otomatik yeni hatim yok)', sb.App.zikrSessionState() === 'active');
  sb.App.zikrUndo();
  d = JSON.parse(sb.localStorage.getItem('seyma-reset-v1'));
  ok('489→undo→488: tur geri alındı', d.zikr.journeys.esma_19.hatims[0].count === 488 && d.zikr.sessions[t].perPreset.esma_19.completedCycles === 0);
}

// ── 5) hatim-complete: dokunma kabul edilmez, otomatik yeni hatim açılmaz, save delta üretmez ──
{
  const sb = buildSandbox(fettahSeed(239120)); loadInto(sb, FILES); sb.App.start(); sb.App.openZikr();
  sb.App.zikrTap();
  const p = { kind: 'esma', ebced: 489 };
  ok('239121\'de durum hatim-complete', sb.App.zikrSessionState() === 'hatim-complete');
  const before = sb.localStorage.getItem('seyma-reset-v1');
  sb.App.zikrTap(); sb.App.zikrTap(); sb.App.zikrTap(); // hatim-complete iken tekrar tekrar dokun
  const after = sb.localStorage.getItem('seyma-reset-v1');
  ok('hatim-complete iken tekrar tap: hiçbir mutasyon/save delta üretmiyor', before === after);
  ok('hatim-complete iken otomatik yeni hatim açılmadı (tek hatim var)', JSON.parse(after).zikr.journeys.esma_19.hatims.length === 1);

  // hatim-complete → undo → active
  sb.App.zikrUndo();
  const d = JSON.parse(sb.localStorage.getItem('seyma-reset-v1'));
  ok('hatim-complete → zikrUndo → active, tamamlanma geri alındı', sb.App.zikrSessionState() === 'active' && d.zikr.journeys.esma_19.hatims[0].status === 'active' && d.zikr.journeys.esma_19.hatims[0].count === 239120);
}

// ── 6) hatim-complete → startNewZikrHatim → idle (yeni hatim, eskisi arşivlenmez çünkü zaten completed) ──
{
  const sb = buildSandbox(fettahSeed(239121)); loadInto(sb, FILES); sb.App.start(); sb.App.openZikr();
  const p = { kind: 'esma', ebced: 489 };
  ok('Başlangıçta hatim-complete', sb.App.zikrSessionState() === 'hatim-complete');
  sb.App.startNewZikrHatim();
  const d = JSON.parse(sb.localStorage.getItem('seyma-reset-v1'));
  ok('Yeni hatim count=0 ile başladı', d.zikr.journeys.esma_19.hatims.length === 2 && d.zikr.journeys.esma_19.hatims[1].count === 0 && d.zikr.journeys.esma_19.hatims[1].status === 'active');
  ok('Yeni hatim ömürlük toplamı SİLMEDİ (lifetimeCount hâlâ 239121)', d.zikr.journeys.esma_19.lifetimeCount === 239121);
  ok('Eski (zaten completed) hatim durumu değişmedi, archived olarak ezilmedi', d.zikr.journeys.esma_19.hatims[0].status === 'completed');
  ok('Yeni hatim için durum idle (eski oturum farklı hatime aitti)', sb.App.zikrSessionState() === 'idle');
  sb.App.zikrTap();
  ok('Yeni hatimde ilk tap sonrası active', sb.App.zikrSessionState() === 'active');
}

// ── 7) preset A → B → A: her yolculuk kendi yerinde kalır, geçiş idle üretir ──
{
  const sb = buildSandbox(coreSeed(10)); loadInto(sb, FILES); sb.App.start(); sb.App.openZikr();
  sb.App.zikrTap(); sb.App.zikrTap(); // subhanallah: 10 -> 12
  let d = JSON.parse(sb.localStorage.getItem('seyma-reset-v1'));
  ok('A (subhanallah) 2 tap sonrası 12', d.zikr.journeys.subhanallah.lifetimeCount === 12);
  sb.App.setZikrPreset('elhamdulillah');
  ok('Preset B\'ye geçince B için durum idle', sb.App.zikrSessionState() === 'idle');
  sb.App.zikrTap(); sb.App.zikrTap(); sb.App.zikrTap();
  d = JSON.parse(sb.localStorage.getItem('seyma-reset-v1'));
  ok('B (elhamdulillah) 3 tap sonrası 3, A\'ya dokunmadı', d.zikr.journeys.elhamdulillah.lifetimeCount === 3 && d.zikr.journeys.subhanallah.lifetimeCount === 12);
  sb.App.setZikrPreset('subhanallah');
  d = JSON.parse(sb.localStorage.getItem('seyma-reset-v1'));
  ok('A\'ya dönünce A\'nın ilerlemesi (12) hâlâ aynı yerde', d.zikr.journeys.subhanallah.lifetimeCount === 12);
  sb.App.zikrTap();
  d = JSON.parse(sb.localStorage.getItem('seyma-reset-v1'));
  ok('A\'da kaldığı yerden devam: 12 → 13', d.zikr.journeys.subhanallah.lifetimeCount === 13 && d.zikr.journeys.elhamdulillah.lifetimeCount === 3);
}

// ── 8) undo: bugün sayım yoksa hiçbir şey yapmaz, 0 altına inmez ──
{
  const sb = buildSandbox(coreSeed(0)); loadInto(sb, FILES); sb.App.start(); sb.App.openZikr();
  const before = sb.localStorage.getItem('seyma-reset-v1');
  sb.App.zikrUndo();
  const after = sb.localStorage.getItem('seyma-reset-v1');
  ok('Bugün sayım yokken undo hiçbir mutasyon üretmiyor', before === after);
  const d = JSON.parse(after);
  ok('Undo sonrası günlük/lifetime sayı negatife düşmedi', d.zikr.journeys.subhanallah.lifetimeCount >= 0 && (d.zikr.sessions[t] ? d.zikr.sessions[t].totalCount >= 0 : true));
}

// ── 9) gün değişimi: günlük sayı ayrılır, lifetime/hatim korunur ──
{
  const y = (() => { const dd = new Date(Date.now() - 864e5); const p = n => (n < 10 ? '0' : '') + n; return dd.getFullYear() + '-' + p(dd.getMonth() + 1) + '-' + p(dd.getDate()); })();
  const seedObj = fettahSeed(300, { sessions: { [y]: { totalCount: 300, completedSets: 0, perPreset: { esma_19: { count: 300, completedCycles: 0, lastAt: y + 'T20:00:00.000Z' } }, lastAt: y + 'T20:00:00.000Z' } } });
  const sb = buildSandbox(seedObj); loadInto(sb, FILES); sb.App.start(); sb.App.openZikr();
  sb.App.zikrTap();
  const d = JSON.parse(sb.localStorage.getItem('seyma-reset-v1'));
  ok('Yeni günün sayacı sıfırdan başlayıp 1\'e çıktı (dünkü 300\'den ayrı)', d.zikr.sessions[t].totalCount === 1);
  ok('Hatim/lifetime gün sınırını aştı, kaldığı yerden sürdü (301)', d.zikr.journeys.esma_19.lifetimeCount === 301 && d.zikr.journeys.esma_19.hatims[0].count === 301);
  ok('Dünkü günlük kayıt (300) değişmeden duruyor', d.zikr.sessions[y].totalCount === 300);
}

// ── 10) yapısal kontrol: tap yalnız tek onclick ile bağlı, ayrı pointerdown/touchstart yok (çift-tetik yapısal olarak imkânsız) ──
{
  const appSrc = fs.readFileSync(path.join(REPO, 'app.js'), 'utf8');
  const tapButtonMatch = appSrc.match(/<button class="zikr-v2-tap[\s\S]{0,400}?<\/button>|zikr-v2-tap[^"]*"\s+onclick="App\.zikrTap\(\)"/);
  ok('Ana sayaç düğmesi tek onclick="App.zikrTap()" ile bağlı', /onclick="App\.zikrTap\(\)"/.test(appSrc));
  ok('app.js içinde zikir alanında ayrı pointerdown/touchstart bağlayıcısı yok', !/onpointerdown|ontouchstart/.test(appSrc));
}

// ── 11) error-recoverable: geçersiz preset girişinde asla çökmez ──
// Not: zikrNormalizeRoot her boot'ta ZIKR_SEED+zikrEsmaSeed()'i presets[]'e
// enjekte ettiğinden (presets:[] fixture'ı bile normalize'den sonra 104
// preset'e dolar), zikrActivePreset() gerçek bir önyükleme yolunda ASLA null
// dönmez — 'error-recoverable' dalı, doğrudan sahte/boş bir preset argümanı
// verildiğinde asla throw etmediğini kanıtlayan salt savunmacı bir testtir.
{
  const sb = buildSandbox(fettahSeed(10)); loadInto(sb, FILES); sb.App.start();
  ok("zikrSessionState(null) çökmüyor ve geçerli bir durum döner (aktif presete düşer)", typeof sb.App.zikrSessionState(null) === 'string');
  ok("zikrSessionState({}) (id/kind'sız sahte preset) çökmüyor, geçerli bir durum döner", typeof sb.App.zikrSessionState({}) === 'string');
  ok('Boş preset objesiyle zikrMath çökmüyor', Number.isFinite(sb.App.zikrMath({}, 5).progress));
}

console.log(failed === 0 ? `\n✅ Tüm kontroller PASS (${passed}/${passed})` : `\n❌ ${failed} kontrol FAIL (${passed} geçti)`);
process.exitCode = failed === 0 ? 0 : 1;
