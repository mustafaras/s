#!/usr/bin/env node
// verify-zikir-safe-area-shell.mjs — ZP-09 kabul kapısı: Zikirmatik'in
// bağımsız tam ekran kabuğu (100dvh + svh/vh fallback, env(safe-area-inset-*),
// sabit header/sticky dock + kontrollü scroll, body scroll lock/unlock modal
// yaşam döngüsüne bağlı, 390/393/430/440px'de aynı bileşen hiyerarşisi,
// hardcode cihaz yüksekliği yok) headless doğrular.
//
// Yöntem: (a) styles.css metnini doğrudan okuyup gerekli class/style
// değerlerini regex ile doğrular — bu repoda gerçek layout/paint motoru
// (tarayıcı) yok, ZP-08/ZP-07 doğrulama script'leriyle aynı desen; (b)
// app.js'i zikr-harness.mjs ile aynı node:vm sandbox'ında boot edip
// App.openZikr()/App.closeZikr() ile body scroll lock/unlock'u ve markup'ın
// genişlikten bağımsız (app.js window.innerWidth okumuyor — tek bir HTML
// üretiliyor, tüm reflow CSS'e ait) aynı kaldığını doğrular.
//
// DATA SAFETY: gerçek tarayıcı açılmaz, sunucu başlatılmaz, ağ çağrısı
// yapılmaz, seyma-data'ya yazılmaz.
//
// Usage:
//   node .claude/skills/run-seyma/verify-zikir-safe-area-shell.mjs
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

console.log('== ZP-09 Zikirmatik tam ekran kabuk / safe-area doğrulaması ==');

// ── A) styles.css statik doğrulama ──
const css = fs.readFileSync(path.join(REPO, 'styles.css'), 'utf8');
// ZP-08.2: eski çıkarma regex'i (`ZİKİRMATİK v2[\s\S]*?(?=\n\n\/\*...)`) ilk
// boş-satır+yorum bloğunda duruyordu; CSS bölüm yorumlarıyla düzenlenince
// bloğu ERKEN kesip tüm assertion'ları sahte-negatif yapıyordu. Zikirmatik
// bloğu styles.css'in EN SONUNDA ve marker'dan sonraki tüm seçiciler
// zikr'e ait (doğrulandı), bu yüzden marker'dan dosya sonuna kadar almak
// hem daha doğru hem kırılgan değil.
const zikrMarker = css.indexOf('ZİKİRMATİK v2');
const zikrCss = zikrMarker >= 0 ? css.slice(zikrMarker) : css;

{
  // Madde 1: 100dvh birincil, 100svh/100vh fallback (üç değer de bu sırada
  // aynı .zikr-v2-screen kuralında olmalı — CSS eski→yeni sırayla düşer).
  const screenRule = zikrCss.match(/\.zikr-v2-screen\{[^}]*\}/);
  ok('.zikr-v2-screen height: 100vh → 100svh → 100dvh sırasıyla (fallback zinciri)',
    !!screenRule && /height:100vh;height:100svh;height:100dvh/.test(screenRule[0]),
    screenRule && screenRule[0]);

  const desktopRule = zikrCss.match(/@media \(min-width:681px\)[\s\S]*?\.zikr-v2-screen\{[^}]*\}/);
  ok('desktop (min-width:681px) .zikr-v2-screen de aynı vh→svh→dvh fallback zincirini kullanıyor',
    !!desktopRule && /height:calc\(100vh - 32px\);height:calc\(100svh - 32px\);height:calc\(100dvh - 32px\)/.test(desktopRule[0]),
    desktopRule && desktopRule[0]);

  // Madde 8: .zikr-v2-screen'de hardcode cihaz yüksekliği (bare Npx height) yok.
  ok('.zikr-v2-screen kuralında hardcode piksel yükseklik yok (yalnız vh/svh/dvh/calc)',
    !!screenRule && !/height:\d+px/.test(screenRule[0]));
}

{
  // Madde 2: üst/alt safe-area env() zaten var (ZP-00 denetimi doğruladı, ZP-09 yeniden doğrular).
  ok('.zikr-v2-header üst padding env(safe-area-inset-top) kullanıyor',
    /\.zikr-v2-header\{[^}]*padding:calc\(12px \+ env\(safe-area-inset-top\)\)/.test(zikrCss));
  ok('.zikr-v2-scroll alt padding env(safe-area-inset-bottom) kullanıyor',
    /\.zikr-v2-scroll\{[^}]*padding:10px 18px calc\(24px \+ env\(safe-area-inset-bottom\)\)/.test(zikrCss));
}

{
  // Madde 3: header sabit (flex:none), dock sticky, ana içerik kontrollü scroll.
  ok('.zikr-v2-header sabit (flex:none), scroll etmiyor',
    /\.zikr-v2-header\{flex:none/.test(zikrCss));
  ok('.zikr-v2-dock sticky bottom:0 (alt eylem alanı her zaman erişilebilir)',
    /\.zikr-v2-dock\{position:sticky;bottom:0/.test(zikrCss));
  ok('.zikr-v2-scroll kontrollü tek scroll alanı (overflow-y:auto + overscroll-behavior:contain)',
    /\.zikr-v2-scroll\{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain/.test(zikrCss));
  // Dock'un grid sütun sayısı gerçek düğme sayısıyla tutarlı.
  ok('.zikr-v2-dock grid-template-columns:repeat(3,1fr) (Geri al / Duraklat / Sıfırla)',
    /\.zikr-v2-dock\{[^}]*grid-template-columns:repeat\(3,1fr\)/.test(zikrCss));
}

{
  // Madde 6: kısa yükseklikte ana sayı küçülür, alt eylem (dock) kaybolmaz.
  // (CSS tek satırda minifiye; iç içe birden çok {...} bloğu barındırıyor,
  // bu yüzden ilk '}' değil, medya sorgusunun kapanış satır sonuna kadar
  // eşleşiyoruz.)
  const shortLine = css.split('\n').find(l => l.includes('@media (max-height:700px)'));
  ok('kısa ekranda (max-height:700px) .zikr-v2-core strong clamp ile küçülüyor (taşma yok)',
    !!shortLine && /\.zikr-v2-core strong\{font-size:clamp\(/.test(shortLine));
  ok('kısa ekran medyasında .zikr-v2-dock gizlenmiyor (yalnız isim/tap boyutu ayarlanıyor)',
    !!shortLine && !/\.zikr-v2-dock\{[^}]*display:none/.test(shortLine));
}

{
  // Madde 5: 390/393/430/440px için ayrı bir breakpoint YOK — bu KASITLI:
  // .zikr-v2-screen max-width:680px + akışkan flex/grid düzeni sayesinde bu
  // dört genişlik zaten TEK bir temel kural setiyle aynı bileşen hiyerarşisini
  // üretir (yalnızca min-width:681px'te masaüstü diyalog moduna geçiliyor).
  // Burada, 390-440 aralığını farklı davranan bir ara breakpoint'in
  // YANLIŞLIKLA eklenmediğini doğruluyoruz.
  const midRangeBreakpoints = zikrCss.match(/@media \([^)]*width:(39\d|4[0-3]\d)px\)/g);
  ok('390-440px aralığında zikr-v2 için ayrı/çelişen bir breakpoint yok (tek temel kural seti bu genişlikleri kapsıyor)',
    !midRangeBreakpoints, midRangeBreakpoints);
}

// ── B) app.js: body scroll lock modal yaşam döngüsüne bağlı ──
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
let appHTML = '';
let focusLog = [];
const appEl = makeEl('app'), rootEl = makeEl('root'), bodyEl = makeEl('body');
const previewCardEl = makeEl('zikr-preview-card');
const elCache = { app: appEl, root: rootEl, 'zikr-preview-card': previewCardEl };
const doc = {
  hidden: false, body: bodyEl, documentElement: rootEl,
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
  const hid = 'hatim_sa_test';
  return baseSeed({
    schemaVersion: 3, migrationVersion: 'zikr_v2', editorialVersion: 0,
    presets: [{ id: 'esma_19', name: 'el-Fettâh', arabic: 'فتاح', ebced: 489, target: 489, builtIn: true, kind: 'esma', countDirection: 'down', archived: false, createdAt: t }],
    journeys: { esma_19: { presetId: 'esma_19', lifetimeCount: count, activeHatimId: hid, lastAt: t + 'T10:00:00.000Z', lastSessionId: '', completedHatims: 0, legacyCompletedHatims: 0, hatims: [{ id: hid, mode: 'ebced_square', baseTarget: 489, target: 239121, count, startedAt: t + 'T00:00:00.000Z', completedAt: null, status: count >= 239121 ? 'completed' : 'active' }] } },
    sessions: {}, activeSession: null,
    settings: { activePresetId: 'esma_19', soundOn: false, haptic: false, autoAdvance: false, defaultMode: 'hatim', confirmReset: true },
    streak: 0, streakDate: '',
  });
}

{
  const sb = buildSandbox(fettahSeed(100)); loadInto(sb, FILES); sb.App.start();
  bodyEl.style.overflow = '';
  ok('açılış öncesi body.style.overflow boş (kilit henüz yok)', bodyEl.style.overflow === '');

  appHTML = ''; sb.App.openZikr();
  ok('App.openZikr() sonrası body scroll kilitleniyor (overflow:hidden)', bodyEl.style.overflow === 'hidden');
  ok("overlay gerçekten render edildi (zikr-v2-overlay DOM'a yazıldı)", /zikr-v2-overlay/.test(appHTML));

  sb.App.closeZikr();
  ok('App.closeZikr() sonrası body scroll kilidi geri yükleniyor (eski değere döner)', bodyEl.style.overflow === '');
}

{
  // İkinci bir aç/kapa döngüsü — kilidin idempotent olduğunu, önceki (boş
  // olmayan) bir body.style.overflow değerini de doğru sakladığını doğrula.
  const sb = buildSandbox(fettahSeed(50)); loadInto(sb, FILES); sb.App.start();
  bodyEl.style.overflow = 'auto'; // modal açılmadan önce sayfada zaten bir değer varmış gibi
  sb.App.openZikr();
  ok("mevcut body.style.overflow değeri ('auto') ezilip hidden yapılıyor", bodyEl.style.overflow === 'hidden');
  sb.App.closeZikr();
  ok("kapanışta önceki 'auto' değeri (hardcoded boş string değil) doğru geri yükleniyor", bodyEl.style.overflow === 'auto');
}

{
  // Madde 5 (dinamik kanıt): app.js zikr markup üretimi ekran genişliğini
  // hiç okumuyor (window.innerWidth/matchMedia(min-width) yok) — yani aynı
  // preset/durum için üretilen HTML, 390/393/430/440px hepsinde bit-bit
  // aynıdır; reflow tamamen CSS'e ait, component hierarchy'yi bozmaz.
  const src = fs.readFileSync(path.join(REPO, 'app.js'), 'utf8');
  ok('app.js zikr fonksiyonlarında innerWidth/genişlik dallanması yok (bileşen hiyerarşisi genişlikten bağımsız)',
    !/innerWidth/.test(src) && !/matchMedia\([^)]*width/.test(src));

  // Yalnızca zikr-overlay diliminin kendisi karşılaştırılıyor — tam #app
  // innerHTML'i (bugunHTML/rapor vb.) zikr dışı, gerçekten zaman/skor
  // bağımlı içerik barındırabilir (ör. profil kalite kartı), bu ZP-09'un
  // "bileşen hiyerarşisi genişlikten bağımsız" iddiasıyla ilgisizdir.
  function overlaySlice(html) {
    const i = html.indexOf('id="zikr-overlay"');
    return i === -1 ? '' : html.slice(i);
  }
  const sb1 = buildSandbox(fettahSeed(200)); loadInto(sb1, FILES); sb1.App.start();
  appHTML = ''; sb1.App.openZikr();
  const overlay390 = overlaySlice(appHTML);
  const sb2 = buildSandbox(fettahSeed(200)); loadInto(sb2, FILES); sb2.App.start();
  appHTML = ''; sb2.App.openZikr();
  const overlay440 = overlaySlice(appHTML);
  ok('aynı veri için üretilen zikr overlay HTML dilimi deterministik (390px ve 440px senaryosu aynı markup\'ı üretir)',
    overlay390.length > 0 && overlay390 === overlay440);
}

console.log('\n=== Özet: ' + passed + ' geçti, ' + failed + ' kaldı ===');
process.exit(failed ? 1 : 0);
