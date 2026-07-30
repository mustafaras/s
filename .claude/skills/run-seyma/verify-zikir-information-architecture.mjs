#!/usr/bin/env node
// verify-zikir-information-architecture.mjs — ZP-07 kabul kapısı: 5 sekmeli
// iç navigasyon (Sayaç/Esmâ/Hatimlerim/Geçmiş/Ayarlar), sayaç ekranının en
// fazla 3 ilerleme seviyesi + 2 eylem düğmesiyle sınırlı kalması, detay
// metninin ayrı bir panoya taşınması, sekme değişiminde oturumun kaybolmaması
// ve kapanışta odağın tetikleyen elemana dönmesini headless doğrular.
//
// DATA SAFETY: app.js + yardımcı modüller `node:vm` sandbox'ında, gerçek
// DOM/ağ olmadan boot edilir (zikr-harness.mjs ile aynı desen; yalnız bu
// dosyaya özgü olarak focus() çağrılarını izleyen minimal bir uzantı
// eklendi). Gerçek tarayıcı açılmaz, sunucu başlatılmaz, seyma-data'ya
// yazılmaz.
//
// Usage:
//   node .claude/skills/run-seyma/verify-zikir-information-architecture.mjs
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

let appHTML = '';
let focusLog = [];
function makeEl(id) {
  const el = {
    id: id || '', _html: '', _text: '', style: { cssText: '', setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {}, children: [], scrollTop: 0, offsetWidth: 0, value: '', files: [],
    get innerHTML() { return this._html; }, set innerHTML(v) { this._html = String(v); if (this.id === 'app') appHTML = this._html; },
    get textContent() { return this._text; }, set textContent(v) { this._text = String(v); },
    setAttribute() {}, getAttribute() { return null; },
    appendChild(c) { this.children.push(c); return c; },
    removeChild() {}, remove() {}, replaceWith() {}, insertBefore(c) { return c; },
    addEventListener() {}, removeEventListener() {}, click() {},
    focus() { focusLog.push(this.id); }, blur() {},
    querySelector() { return null; }, querySelectorAll() { return []; }, closest() { return null; },
    replaceChildren() {}, contains() { return false; },
    getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; },
  };
  return el;
}
const appEl = makeEl('app'), rootEl = makeEl('root');
// zikr-preview-card ayrıca sabit bir eleman olarak önceden var (id ile bulunabilsin diye)
const previewCardEl = makeEl('zikr-preview-card');
const elCache = { app: appEl, root: rootEl, 'zikr-preview-card': previewCardEl };
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
    // profileAssessmentInactive: 174 maddelik profil değerlendirme kapısını atlar.
    // auth: needsAuth() kilit ekranını atlar (zikr-harness.mjs ile aynı desen).
    settings: {
      nickname: 'Test', ghToken: '', ghRepo: 'mustafaras/seyma-data', profileAssessmentInactive: true,
      auth: { rememberMe: true, usernameHash: 'ae9e1ed2b6abcbce74cc0c15719fdbba372a7dd62e6232510656bade7c201af4', unlockedAt: new Date().toISOString() }
    },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 },
    saygi: { collection: {}, streak: 0, lastReadDate: '' },
    zikr,
  };
}
function fettahSeed(count) {
  const hid = 'hatim_ia_test';
  return baseSeed({
    schemaVersion: 3, migrationVersion: 'zikr_v2', editorialVersion: 0,
    presets: [{ id: 'esma_19', name: 'el-Fettâh', arabic: 'فتاح', ebced: 489, target: 489, builtIn: true, kind: 'esma', countDirection: 'down', archived: false, createdAt: t }],
    journeys: { esma_19: { presetId: 'esma_19', lifetimeCount: count, activeHatimId: hid, lastAt: t + 'T10:00:00.000Z', lastSessionId: '', completedHatims: 0, legacyCompletedHatims: 0, hatims: [{ id: hid, mode: 'ebced_square', baseTarget: 489, target: 239121, count, startedAt: t + 'T00:00:00.000Z', completedAt: null, status: count >= 239121 ? 'completed' : 'active' }] } },
    sessions: {}, activeSession: null,
    settings: { activePresetId: 'esma_19', soundOn: false, haptic: false, autoAdvance: false, defaultMode: 'hatim', confirmReset: true },
    streak: 0, streakDate: '',
  });
}

console.log('== ZP-07 Zikirmatik bilgi mimarisi / tek görevli ekran akışı doğrulaması ==');

// ── 1) 5 sekme, doğru sırada, kısa Türkçe etiketlerle ──
{
  const sb = buildSandbox(fettahSeed(100)); loadInto(sb, FILES); sb.App.start();
  appHTML = ''; sb.App.openZikr();
  ok('5 sekme doğru sırada: Sayaç → Esmâ → Hatimlerim → Geçmiş → Ayarlar',
    /Sayaç[\s\S]*Esmâ[\s\S]*Hatimlerim[\s\S]*Geçmiş[\s\S]*Ayarlar/.test(appHTML));
  ok('Eski "Özet" etiketi artık yok (Geçmiş/Ayarlar olarak ayrıştı)', !/>Özet</.test(appHTML));
}

// ── 2) Sayaç ekranı: en fazla 3 ilerleme kutusu, 2 eylem düğmesi ──
{
  const sb = buildSandbox(fettahSeed(100)); loadInto(sb, FILES); sb.App.start();
  appHTML = ''; sb.App.openZikr();
  const cycleGridBoxes = (appHTML.match(/zikr-v2-cycle-grid">([\s\S]*?)<\/div>\s*<div class="zikr-v2-dock/) || [])[1] || '';
  const boxCount = (cycleGridBoxes.match(/<span>/g) || []).length;
  ok('Sayaç ekranında tam olarak 3 ilerleme kutusu var (Bugün/Bu tur/Tam hatim veya Ömürlük)', boxCount === 3, boxCount);
  ok('"BUGÜN" kutusu var', /<span>BUGÜN<\/span>/.test(appHTML));
  ok('"BU TUR" kutusu var', /<span>BU TUR<\/span>/.test(appHTML));
  ok('"TAM HATİM" kutusu var (esma preset)', /<span>TAM HATİM<\/span>/.test(appHTML));
  ok('Eski ayrı "SEANS" sayacı KALDIRILDI (gereksiz istatistik kalabalığı değil)', !/SEANS/.test(appHTML));
  const dockButtons = (appHTML.match(/zikr-v2-dock[\s\S]*?<\/div>/) || [''])[0];
  const dockButtonCount = (dockButtons.match(/<button/g) || []).length;
  ok('Alt eylem bölgesinde (dock) tam olarak 2 düğme var (Geri al, Duraklat)', dockButtonCount === 2, dockButtonCount);
  ok('Ses/Titreşim/Odak artık dock\'ta DEĞİL (Ayarlar\'a taşındı)', !/dock[\s\S]{0,400}Ses<\/span>/.test(appHTML));
}

// ── 3) Detay panosu: kapalı başlar, App.toggleZikrDetail ile açılır/kapanır ──
{
  const sb = buildSandbox(fettahSeed(100)); loadInto(sb, FILES); sb.App.start();
  appHTML = ''; sb.App.openZikr();
  ok('Detay panosu başlangıçta kapalı (uzun açıklama metni ana sayaçta GÖRÜNMÜYOR)', !/id="zikr-detail-sheet"/.test(appHTML));
  ok('"Anlamı ve önemi" açma düğmesi var', /zikr-v2-detail-toggle/.test(appHTML) && /Anlamı ve önemi/.test(appHTML));
  sb.App.toggleZikrDetail();
  ok('toggleZikrDetail sonrası detay panosu açılıyor', /id="zikr-detail-sheet"/.test(appHTML));
  sb.App.toggleZikrDetail();
  ok('toggleZikrDetail tekrar: detay panosu kapanıyor', !/id="zikr-detail-sheet"/.test(appHTML));
}

// ── 4) Geçmiş sekmesi: KPI+grafik+liste var, ayar toggle'ı YOK ──
{
  const sb = buildSandbox(fettahSeed(100)); loadInto(sb, FILES); sb.App.start();
  sb.App.openZikr(); appHTML = ''; sb.App.setZikrView('history');
  ok('Geçmiş sekmesi render oldu (GEÇMİŞ başlığı + KPI + haftalık bar)', /GEÇMİŞ/.test(appHTML) && /zikr-v2-kpis/.test(appHTML) && /zikr-v2-week/.test(appHTML));
  ok('Geçmiş sekmesinde ayar toggle\'ı YOK (tek görevli ekran)', !/toggleZikrSetting/.test(appHTML));
}

// ── 5) Ayarlar sekmesi: tüm 7 toggle var, KPI/grafik YOK ──
{
  const sb = buildSandbox(fettahSeed(100)); loadInto(sb, FILES); sb.App.start();
  sb.App.openZikr(); appHTML = ''; sb.App.setZikrView('settings');
  const SETTINGS_KEYS = ['soundOn', 'haptic', 'focusMode', 'breathGuide', 'reducedMotion', 'keepAwake', 'autoAdvance'];
  ok('Ayarlar sekiminde 7 ayarın TAMAMI var', SETTINGS_KEYS.every(k => appHTML.indexOf("toggleZikrSetting('" + k + "')") >= 0));
  ok('Ayarlar sekmesinde KPI/haftalık grafik YOK (tek görevli ekran)', !/zikr-v2-kpis/.test(appHTML) && !/zikr-v2-week/.test(appHTML));
}

// ── 6) Sekme değişiminde sayaç oturumu kaybolmaz (rule 4) ──
{
  const sb = buildSandbox(fettahSeed(50)); loadInto(sb, FILES); sb.App.start(); sb.App.openZikr();
  sb.App.zikrTap(); sb.App.zikrTap(); sb.App.zikrTap(); // 50 -> 53
  const before = JSON.parse(sb.localStorage.getItem('seyma-reset-v1')).zikr.journeys.esma_19;
  sb.App.setZikrView('history'); sb.App.setZikrView('settings'); sb.App.setZikrView('hatims'); sb.App.setZikrView('counter');
  const after = JSON.parse(sb.localStorage.getItem('seyma-reset-v1')).zikr.journeys.esma_19;
  ok('4 sekme arası geçiş sonrası lifetimeCount/hatim count değişmedi (53)', after.lifetimeCount === 53 && after.hatims[0].count === 53 && before.lifetimeCount === 53);
  ok('Sekme değişiminden sonra sayaç ekranına dönünce devam edilebiliyor (tap çalışıyor)', (function () { sb.App.zikrTap(); return JSON.parse(sb.localStorage.getItem('seyma-reset-v1')).zikr.journeys.esma_19.lifetimeCount === 54; })());
}

// ── 7) Kapanışta odak tetikleyen elemana döner (rule 5) ──
{
  const sb = buildSandbox(fettahSeed(10)); loadInto(sb, FILES); sb.App.start();
  focusLog = [];
  sb.App.openZikr();
  sb.App.closeZikr();
  ok('closeZikr sonrası odak #zikr-preview-card\'a döndü', focusLog.includes('zikr-preview-card'));
}

// ── 8) Tamamlanmış hatimde tek CTA (yarışan iki ana eylem yok) ──
{
  const sb = buildSandbox(fettahSeed(239121)); loadInto(sb, FILES); sb.App.start();
  appHTML = ''; sb.App.openZikr();
  const tapButtons = (appHTML.match(/class="zikr-v2-tap/g) || []).length;
  const newHatimButtons = (appHTML.match(/startNewZikrHatim\(\)/g) || []).length;
  ok('Hatim tamamlandığında ana sayaç düğmesi (tap) GÖSTERİLMİYOR', tapButtons === 0);
  ok('Hatim tamamlandığında tek bir "Yeni hatim başlat" CTA\'sı var (yarışan ikinci CTA yok)', newHatimButtons === 1);
}

// ── 9) Kritik eylemler (geri al, duraklat) menüye gizlenmemiş — doğrudan görünür düğme ──
{
  const sb = buildSandbox(fettahSeed(10)); loadInto(sb, FILES); sb.App.start();
  appHTML = ''; sb.App.openZikr();
  ok('Geri al düğmesi doğrudan görünür (menü içine gizlenmemiş)', /onclick="App\.zikrUndo\(\)"/.test(appHTML));
  ok('Duraklat düğmesi doğrudan görünür (menü içine gizlenmemiş)', /onclick="App\.toggleZikrPause\(\)"/.test(appHTML));
}

console.log(failed === 0 ? `\n✅ Tüm kontroller PASS (${passed}/${passed})` : `\n❌ ${failed} kontrol FAIL (${passed} geçti)`);
process.exitCode = failed === 0 ? 0 : 1;
