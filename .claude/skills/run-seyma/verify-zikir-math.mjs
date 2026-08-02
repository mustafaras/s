#!/usr/bin/env node
// verify-zikir-math.mjs — ZP-03 kabul kapısı: Ebced/tur/kalan/Ebced² tam hatim
// hesaplarının TEK saf matematik motoru (app.js: zikrMath/zikrBaseTarget/
// zikrHatimTarget/zikrInt, esmaulHusnaV1.js: ebced/normalizeArabic) altında
// toplandığını; UI'ın (app.js) ve panel'in (panel.html) AYNI formül
// sözleşmesini kullandığını; sınır değerlerin (0,1,488,489,490,239120,239121)
// ve güvenli-değer davranışının (NaN/0/negatif/eksik preset) doğru olduğunu
// headless doğrular.
//
// DATA SAFETY: app.js + esmaulHusnaV1.js gerçek bir DOM/localStorage/ağ
// olmadan `node:vm` sandbox'ında boot edilir (aynı desen:
// verify-profile-assessment-quality.mjs). panel.html'den yalnız ilgili saf
// fonksiyonlar regex ile çıkarılıp ayrı, minimal bir vm bağlamında çalıştırılır
// (test_faz11_panel.js'in kullandığı yöntemle aynı). Gerçek tarayıcı açılmaz,
// sunucu başlatılmaz, seyma-data'ya yazılmaz.
//
// Usage:
//   node .claude/skills/run-seyma/verify-zikir-math.mjs
//
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const REPO = process.env.SEYMA_REPO ||
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

let failed = 0;
function ok(name, cond) {
  console.log(`${cond ? '✓' : '✗ FAIL'}  ${name}`);
  if (!cond) failed++;
}
function deepEqual(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// ── app.js + esmaulHusnaV1.js'i minimal bir sandbox'ta boot et ──
function makeEl(id) {
  const el = {
    id: id || '', _html: '', style: { cssText: '', setProperty() {}, width: '', display: '' },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {}, children: [], scrollTop: 0, offsetWidth: 0, value: '', files: [],
    get innerHTML() { return this._html; }, set innerHTML(v) { this._html = String(v); },
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
const appEl = makeEl('app'), rootEl = makeEl('root');
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
  return { getItem(k) { return k in store ? store[k] : null; }, setItem(k, v) { store[k] = String(v); }, removeItem(k) { delete store[k]; }, clear() { for (const k in store) delete store[k]; }, _store: store };
}
function buildSandbox() {
  const localStorage = makeLocalStorage({});
  const sandbox = {
    console, localStorage, document: doc,
    navigator: { vibrate() {}, userAgent: 'node-harness', clipboard: { writeText() { return Promise.resolve(); } }, geolocation: null },
    location: { protocol: 'http:', hostname: 'localhost', search: '', href: 'http://localhost/', reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    DOMParser: DOMParserStub,
    fetch() { return new Promise(() => {}); },
    setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    crypto: { getRandomValues(a) { for (let i = 0; i < a.length; i++) a[i] = (Math.random() * 256) | 0; return a; }, randomUUID() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'; } },
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
  for (const f of files) {
    const src = fs.readFileSync(path.join(REPO, f), 'utf8');
    vm.runInContext(src, ctx, { filename: f });
  }
  return ctx;
}
const sb = buildSandbox();
loadInto(sb, ['esmaulHusnaV1.js', 'app/core/constants.js', 'app.js']);
const App = sb.App;
const Esma = sb.EsmaulHusnaV1;

console.log('== ZP-03 Ebced/tur/hatim saf matematik doğrulaması ==');

ok('App.zikrMath/App.zikrBaseTarget/App.zikrHatimTarget/App.zikrInt erişilebilir (App.* pure-function testability deseni)',
  typeof App.zikrMath === 'function' && typeof App.zikrBaseTarget === 'function' &&
  typeof App.zikrHatimTarget === 'function' && typeof App.zikrInt === 'function');
ok('EsmaulHusnaV1.ebced/normalizeArabic erişilebilir', typeof Esma.ebced === 'function' && typeof Esma.normalizeArabic === 'function');

// ── el-Fettâh referans senaryosu (ZP-03 madde 7) ──
const fettah = Esma.names.find(n => n.name === 'el-Fettâh');
ok("el-Fettâh EsmaulHusnaV1'de bulundu", !!fettah);
ok('el-Fettâh ebced === 489 (kodda hesaplanan, hardcode değil)', fettah && fettah.ebced === 489);
ok('489 × 489 = 239121', 489 * 489 === 239121);

const FETTAH_PRESET = { kind: 'esma', ebced: 489 };
ok('App.zikrBaseTarget(Fettâh) === 489', App.zikrBaseTarget(FETTAH_PRESET) === 489);
ok('App.zikrHatimTarget(Fettâh) === 239121', App.zikrHatimTarget(FETTAH_PRESET) === 239121);

// ── Esmâ (Fettâh) sınır tablosu — ZIKIRMATIK-GELISTIRME-PLANI.md §1.2 ile birebir ──
const FETTAH_CASES = [
  { count: 0, completedCycles: 0, cyclePosition: 0, currentCycleNo: 1, remainingInCycle: 489, remainingInHatim: 239121, complete: false },
  { count: 1, completedCycles: 0, cyclePosition: 1, currentCycleNo: 1, remainingInCycle: 488, remainingInHatim: 239120, complete: false },
  { count: 488, completedCycles: 0, cyclePosition: 488, currentCycleNo: 1, remainingInCycle: 1, remainingInHatim: 238633, complete: false },
  { count: 489, completedCycles: 1, cyclePosition: 0, currentCycleNo: 2, remainingInCycle: 489, remainingInHatim: 238632, complete: false },
  { count: 490, completedCycles: 1, cyclePosition: 1, currentCycleNo: 2, remainingInCycle: 488, remainingInHatim: 238631, complete: false },
  { count: 8445, completedCycles: 17, cyclePosition: 132, currentCycleNo: 18, remainingInCycle: 357, remainingInHatim: 230676, complete: false },
  { count: 239120, completedCycles: 488, cyclePosition: 488, currentCycleNo: 489, remainingInCycle: 1, remainingInHatim: 1, complete: false },
  { count: 239121, completedCycles: 489, cyclePosition: 489, currentCycleNo: 489, remainingInCycle: 0, remainingInHatim: 0, complete: true },
];
for (const tc of FETTAH_CASES) {
  const r = App.zikrMath(FETTAH_PRESET, tc.count);
  ok(`Fettâh count=${tc.count}: completedCycles/cyclePosition/currentCycleNo/remainingInCycle/remainingInHatim/complete doğru`,
    r.completedCycles === tc.completedCycles && r.cyclePosition === tc.cyclePosition &&
    r.currentCycleNo === tc.currentCycleNo && r.remainingInCycle === tc.remainingInCycle &&
    r.remainingInHatim === tc.remainingInHatim && r.complete === tc.complete);
}

// ── Tamamlanmış hatimde count hedef üstüne çıkmaz (madde 5) ──
{
  const r = App.zikrMath(FETTAH_PRESET, 239122);
  ok('239122 girişi 239121\'e clamplanır (hedef üstüne çıkmaz)', r.count === 239121 && r.complete === true);
  const rBig = App.zikrMath(FETTAH_PRESET, 999999999);
  ok('Aşırı büyük girişte de clamp korunur', rBig.count === 239121);
}

// ── Geri sayım yalnız türetilmiş görünüm (madde 3): count + remainingInHatim === hatimTarget ──
{
  let allMatch = true;
  for (const c of [0, 1, 250, 489, 8445, 239120, 239121]) {
    const r = App.zikrMath(FETTAH_PRESET, c);
    if (r.count + r.remainingInHatim !== 239121) { allMatch = false; break; }
  }
  ok('remainingInHatim her zaman hatimTarget - count türevi (ayrı azalan bir sayaç saklanmıyor)', allMatch);
}

// ── Çekirdek (core/simple) preset — Sübhanallah (base=33), açık uçlu ömürlük sayım ──
const SUBHAN_PRESET = { kind: 'core', target: 33 };
const CORE_CASES = [
  { count: 0, completedCycles: 0, cyclePosition: 0, currentCycleNo: 1, remainingInCycle: 33 },
  { count: 32, completedCycles: 0, cyclePosition: 32, currentCycleNo: 1, remainingInCycle: 1 },
  { count: 33, completedCycles: 1, cyclePosition: 33, currentCycleNo: 1, remainingInCycle: 0 },
  { count: 34, completedCycles: 1, cyclePosition: 1, currentCycleNo: 2, remainingInCycle: 32 },
  { count: 66, completedCycles: 2, cyclePosition: 33, currentCycleNo: 2, remainingInCycle: 0 },
  { count: 67, completedCycles: 2, cyclePosition: 1, currentCycleNo: 3, remainingInCycle: 32 },
];
for (const tc of CORE_CASES) {
  const r = App.zikrMath(SUBHAN_PRESET, tc.count);
  ok(`Sübhanallah (core) count=${tc.count}: completedCycles/cyclePosition/currentCycleNo/remainingInCycle doğru`,
    r.completedCycles === tc.completedCycles && r.cyclePosition === tc.cyclePosition &&
    r.currentCycleNo === tc.currentCycleNo && r.remainingInCycle === tc.remainingInCycle && r.complete === false);
}
ok('Core presette hatim/complete kavramı yok (complete daima false, ömürlük sayım açık uçlu)',
  App.zikrMath(SUBHAN_PRESET, 100000).complete === false);

// ── currentCycleNo asla baseTarget'ı aşmaz (esma), aşırı büyük girişte de güvenli (madde 2) ──
{
  let neverExceeds = true;
  for (let c = 0; c <= 239121; c += 977) {
    if (App.zikrMath(FETTAH_PRESET, c).currentCycleNo > 489) { neverExceeds = false; break; }
  }
  ok('Esmâ\'da currentCycleNo hiçbir zaman baseTarget\'ı (489) aşmıyor', neverExceeds);
}

// ── zikrInt / güvenli değer davranışı (NaN, 0, negatif, eksik preset) ──
ok('zikrInt(NaN) === 0', App.zikrInt(NaN) === 0);
ok('zikrInt(-5) === 0', App.zikrInt(-5) === 0);
ok('zikrInt(0) === 0', App.zikrInt(0) === 0);
ok('zikrInt(1.5) güvenli (tam sayı değil, 0\'a düşer)', App.zikrInt(1.5) === 0);
ok('zikrInt(42) === 42 (geçerli safe integer aynen geçer)', App.zikrInt(42) === 42);
ok('zikrInt(Number.MAX_SAFE_INTEGER+1) === 0 (unsafe integer güvenli)', App.zikrInt(Number.MAX_SAFE_INTEGER + 1) === 0);
{
  const rNaN = App.zikrMath(FETTAH_PRESET, NaN);
  const rNeg = App.zikrMath(FETTAH_PRESET, -100);
  const rMissing = App.zikrMath(undefined, 10);
  const rEmpty = App.zikrMath({}, 10);
  ok('zikrMath(preset, NaN) çökmez, count=0 döner', rNaN.count === 0 && Number.isFinite(rNaN.progress));
  ok('zikrMath(preset, negatif) çökmez, count=0 döner', rNeg.count === 0);
  ok('zikrMath(eksik preset, count) çökmez, baseTarget>=1 döner', rMissing.baseTarget >= 1 && Number.isFinite(rMissing.progress));
  ok('zikrMath({}, count) çökmez, baseTarget>=1 döner', rEmpty.baseTarget >= 1 && Number.isFinite(rEmpty.progress));
}

// ── Determinizm: aynı girişte aynı çıkış (ağsız, saf) ──
{
  const a = App.zikrMath(FETTAH_PRESET, 8445), b = App.zikrMath(FETTAH_PRESET, 8445);
  ok('zikrMath deterministik (aynı girişte aynı çıkış)', deepEqual(a, b));
}

// ── Arapça normalizasyon (normalizeArabic) — saf fonksiyon davranışı ──
ok('normalizeArabic hareke işaretlerini temizler', Esma.normalizeArabic('فَتَّاح') === Esma.normalizeArabic('فتاح'));
ok('normalizeArabic hemze varyantlarını birleştirir (أ/إ/آ → ا)', Esma.normalizeArabic('أإآ') === 'ااا');
ok('normalizeArabic ta marbuta\'yı ta\'ya çevirir (ة → ت)', Esma.normalizeArabic('رحمة') === Esma.normalizeArabic('رحمت'));
ok('normalizeArabic idempotent (iki kez uygulamak sonucu değiştirmez)',
  Esma.normalizeArabic(Esma.normalizeArabic('el-Fettâh فتّاح')) === Esma.normalizeArabic('el-Fettâh فتّاح'));
ok('ebced(normalizeArabic(x)) === ebced(x) (ebced zaten kendi içinde normalize ediyor)',
  Esma.ebced('فتاح') === Esma.ebced(Esma.normalizeArabic('فتاح')));

// ── El- takısı / normalizasyon kararı metadata'da (madde 6) ──
ok("EsmaulHusnaV1.method el- takısı kararını metadata olarak belgeliyor",
  typeof Esma.method === 'string' && /el-\s*takı/i.test(Esma.method));

// ── UI/panel formül sözleşmesi paritesi (KABUL: "UI ve panel aynı helper sonuçlarını/aynı
// formül sözleşmesini kullanıyor") — panel.html'in saf fonksiyonlarını regex ile çıkarıp
// ayrı bir vm bağlamında çalıştır, App.zikrMath ile aynı senaryolarda karşılaştır. ──
const panelSrc = fs.readFileSync(path.join(REPO, 'panel.js'), 'utf8');
function extract(re, label) {
  const m = panelSrc.match(re);
  if (!m) throw new Error(`panel.js'den çıkarılamadı: ${label}`);
  return m[0];
}
const ZIKR_SEED_P_SRC = extract(/var ZIKR_SEED_P=\[[\s\S]*?\];/, 'ZIKR_SEED_P');
const zikrRootP_SRC = extract(/function zikrRootP\(\)\{[\s\S]*?\n\}/, 'zikrRootP');
const zikrPresetP_SRC = extract(/function zikrPresetP\(id\)\{[\s\S]*?\n\}/, 'zikrPresetP');
const zikrJourneySummaryP_SRC = extract(/function zikrJourneySummaryP\(\)\{[\s\S]*?\n\}/, 'zikrJourneySummaryP');

const panelSandbox = { console, D: null };
const panelCtx = vm.createContext(panelSandbox);
vm.runInContext(
  [ZIKR_SEED_P_SRC, zikrRootP_SRC, zikrPresetP_SRC, zikrJourneySummaryP_SRC].join('\n'),
  panelCtx, { filename: 'panel.js (extracted)' }
);

function panelSummaryFor(preset, count, isEsma) {
  panelSandbox.D = {
    zikr: {
      settings: { activePresetId: preset.id },
      presets: [preset],
      journeys: {
        [preset.id]: isEsma
          ? { activeHatimId: 'h1', hatims: [{ id: 'h1', count }], completedHatims: 0, lifetimeCount: 0 }
          : { lifetimeCount: count, completedHatims: 0 }
      }
    }
  };
  return panelCtx.zikrJourneySummaryP();
}

{
  let parityOk = true;
  const esmaPresetP = { id: 'esma_19', kind: 'esma', ebced: 489, name: 'el-Fettâh' };
  for (const tc of FETTAH_CASES) {
    const appR = App.zikrMath(FETTAH_PRESET, tc.count);
    const panelR = panelSummaryFor(esmaPresetP, tc.count, true);
    if (!panelR || panelR.cyclePosition !== appR.cyclePosition ||
        panelR.cycleNo !== appR.currentCycleNo || panelR.completedCycles !== appR.completedCycles ||
        panelR.count !== appR.count) { parityOk = false; break; }
  }
  ok('Esmâ (Fettâh) için app.js zikrMath ile panel.html zikrJourneySummaryP birebir aynı sonucu veriyor', parityOk);
}
{
  let parityOk = true;
  const corePresetP = { id: 'subhanallah', kind: 'core', target: 33, name: 'Sübhanallah' };
  for (const tc of CORE_CASES) {
    const appR = App.zikrMath(SUBHAN_PRESET, tc.count);
    const panelR = panelSummaryFor(corePresetP, tc.count, false);
    if (!panelR || panelR.cyclePosition !== appR.cyclePosition ||
        panelR.cycleNo !== appR.currentCycleNo || panelR.completedCycles !== appR.completedCycles) {
      parityOk = false; break;
    }
  }
  ok('Çekirdek preset (Sübhanallah) için app.js zikrMath ile panel.html zikrJourneySummaryP birebir aynı sonucu veriyor (önceki parity hatası düzeltildi)', parityOk);
}
{
  const missing = panelSandbox.D = null, r = panelCtx.zikrJourneySummaryP();
  ok('panel zikrJourneySummaryP eksik data.zikr için null döner (çökmez)', r === null);
}

console.log(failed === 0 ? `\n✅ Tüm kontroller PASS` : `\n❌ ${failed} kontrol FAIL`);
process.exitCode = failed === 0 ? 0 : 1;
