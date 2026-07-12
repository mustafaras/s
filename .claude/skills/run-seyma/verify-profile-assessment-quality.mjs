#!/usr/bin/env node
// verify-profile-assessment-quality.mjs — headless tests for the response-quality/confidence
// engine (Faz 08): scoreProfileAssessmentQuality(), profileAssessmentQualityCategory(),
// PROFILE_QUALITY_WEIGHTS. Pure functions exposed on App.* purely for direct testability
// (no DOM/UI/fetch/localStorage involved).
//
// DATA SAFETY: fully synthetic response sets built from the real (frozen) item bank; no
// real user data, no network.
//
// Usage:
//   node .claude/skills/run-seyma/verify-profile-assessment-quality.mjs
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

// ── minimal DOM-free sandbox (yalnızca window.App'i almak için) ──
function makeEl(id) {
  const el = {
    id: id || '', _html: '',
    style: { cssText: '', setProperty() {}, width: '', display: '' },
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
const appEl = makeEl('app');
const rootEl = makeEl('root');
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
loadInto(sb, ['profileAssessmentV1.js', 'app.js']);
const App = sb.App;
const PA = sb.window.ProfileAssessmentV1;
const ITEMS = PA.sessions[0].items; // order 1..174

// ── "temiz" bir temel yanıt seti üretir: her facet kendi içinde tutarlı (aynı ham değer,
// intra-facet SD=0) ama facet'ler arasında değer döngüsel olarak DEĞİŞİR — bu yüzden
// straightlining (12+ ardışık aynı değer) doğal olarak oluşmaz. Dikkat kontrolleri doğru,
// dürüst çaba maddesi yüksek, tüm yanıtlar 700ms üstü, hiç revizyon yok.
function cleanBaselineResponses(overrides) {
  const facetVal = {};
  const cyc = [3, 4, 5, 6];
  let ci = 0;
  const responses = {};
  ITEMS.forEach((it) => {
    if (it.qualityControl) {
      responses[it.id] = { value: it.expectedResponse != null ? it.expectedResponse : 6, responseMs: 2000, revisionCount: 0 };
      return;
    }
    const k = it.construct + '.' + it.facet;
    if (!(k in facetVal)) { facetVal[k] = cyc[ci % cyc.length]; ci++; }
    responses[it.id] = { value: facetVal[k], responseMs: 2000, revisionCount: 0 };
  });
  return Object.assign(responses, overrides || {});
}
const ATTENTION_ITEMS = ITEMS.filter((it) => it.qualityControl && it.expectedResponse != null);
const HONEST_ITEM = ITEMS.filter((it) => it.qualityControl && it.expectedResponse == null)[0];

// ── 1) tutarlı normal profil ──
console.log('== 1) tutarlı/normal profil — yüksek güven ==');
{
  const r = cleanBaselineResponses();
  const q = App.scoreProfileAssessmentQuality(r);
  assert('completionRate === 1', q.completionRate === 1);
  assert('attentionChecks === 2 (ikisi de doğru)', q.attentionChecks === 2);
  assert('fastResponseRate === 0', q.fastResponseRate === 0);
  assert('longestSameAnswerRun < 12', q.longestSameAnswerRun < 12);
  assert('consistency yüksek (>0.9)', q.consistency > 0.9);
  assert('score yüksek (>=85)', q.score >= 85);
  assert('category === "high"', q.category === 'high');
  assert('warnings boş (temiz profilde uyarı yok)', q.warnings.length === 0);
}

// ── 2) hızlı profil ──
console.log('\n== 2) hızlı profil (tüm yanıtlar 700ms altı) — tek başına iptal değil ama düşürür ==');
{
  const base = cleanBaselineResponses();
  Object.keys(base).forEach((id) => { base[id] = Object.assign({}, base[id], { responseMs: 300 }); });
  const q = App.scoreProfileAssessmentQuality(base);
  assert('fastResponseRate === 1', q.fastResponseRate === 1);
  assert('score düşük ama SIFIR değil (tek başına iptal yok)', q.score < 85 && q.score > 0);
  assert('category "high" DEĞİL', q.category !== 'high');
}

// ── 3) dikkat kontrollerini kaçıran profil ──
console.log('\n== 3) dikkat kontrollerini kaçıran profil ==');
{
  // yalnızca 1 dikkat kontrolü kaçırılmış — tek hata otomatik iptal etmemeli
  const oneOff = cleanBaselineResponses({ [ATTENTION_ITEMS[0].id]: { value: 1, responseMs: 2000, revisionCount: 0 } });
  const q1 = App.scoreProfileAssessmentQuality(oneOff);
  assert('attentionChecks === 1', q1.attentionChecks === 1);
  assert('tek dikkat hatası kategoriyi "low"a düşürmüyor', q1.category !== 'low');
  assert('uyarı var ama "iptal" kelimesi geçmiyor (suçlayıcı/iptal dili yok)', q1.warnings.some((w) => w.includes('dikkat kontrolü kaçır')) && !q1.warnings.some((w) => /iptal/.test(w)));

  // HER İKİ dikkat kontrolü kaçırılmış + yüksek hız BİRLİKTE — kural gereği ek düşüş
  const bothOffFast = cleanBaselineResponses({
    [ATTENTION_ITEMS[0].id]: { value: 1, responseMs: 300, revisionCount: 0 },
    [ATTENTION_ITEMS[1].id]: { value: 1, responseMs: 300, revisionCount: 0 },
  });
  Object.keys(bothOffFast).forEach((id) => { bothOffFast[id] = Object.assign({}, bothOffFast[id], { responseMs: 300 }); });
  const q2 = App.scoreProfileAssessmentQuality(bothOffFast);
  assert('attentionChecks === 0', q2.attentionChecks === 0);
  assert('iki hata + yüksek hız birlikte → ek düşüş uyarısı var', q2.warnings.some((w) => w.includes('İki dikkat kontrolü de kaçmış')));
  assert('bu profilin skoru, yalnızca hızlı olan (test 2) profilden daha düşük', q2.score < App.scoreProfileAssessmentQuality((() => { const b = cleanBaselineResponses(); Object.keys(b).forEach((id) => { b[id] = Object.assign({}, b[id], { responseMs: 300 }); }); return b; })()).score);
}

// ── 4) uzun aynı cevap serisi (straightlining) ──
console.log('\n== 4) uzun aynı cevap serisi (12+) — tek başına geçersiz değil ==');
{
  const base = cleanBaselineResponses();
  // ilk 15 maddeyi (kalite kontrolü olmayanları) aynı değere zorla — global sırada ardışık
  let forced = 0;
  const overrides = {};
  for (const it of ITEMS) {
    if (forced >= 15) break;
    if (it.qualityControl) continue;
    overrides[it.id] = { value: 4, responseMs: 2000, revisionCount: 0 };
    forced++;
  }
  const r = Object.assign({}, base, overrides);
  const q = App.scoreProfileAssessmentQuality(r);
  assert('longestSameAnswerRun >= 12', q.longestSameAnswerRun >= 12);
  assert('straightlining uyarısı var', q.warnings.some((w) => w.includes('aynı seçenek işaretlenmiş')));
  assert('tek başına "low" kategorisine düşürmüyor (diğer her şey temiz)', q.category !== 'low');
}

// ── 5) yüksek revizyon ──
console.log('\n== 5) yüksek revizyon oranı ==');
{
  const base = cleanBaselineResponses();
  let i = 0;
  Object.keys(base).forEach((id) => { if (i % 3 !== 0) base[id] = Object.assign({}, base[id], { revisionCount: 1 }); i++; }); // ~%67 > %50
  const q = App.scoreProfileAssessmentQuality(base);
  assert('revisionRate > 0.5', q.revisionRate > 0.5);
  assert('yüksek revizyon uyarısı var', q.warnings.some((w) => w.includes('yeniden cevaplanmış')));
  assert('tek başına iptal etmiyor (score > 0)', q.score > 0);
}

// ── 6) eksik veri ──
console.log('\n== 6) eksik veri (yalnızca 87/174 cevaplı) ==');
{
  const all = cleanBaselineResponses();
  const half = {};
  ITEMS.slice(0, 87).forEach((it) => { half[it.id] = all[it.id]; });
  const q = App.scoreProfileAssessmentQuality(half);
  assert('completionRate === 0.5', q.completionRate === 0.5);
  assert('eksik veri uyarısı var', q.warnings.some((w) => w.includes('tam tamamlanmadan')));
  assert('score 100 değil (tamamlanmamışlık yansıyor)', q.score < 100);
}

// ── 7) sınır skorları 49/50/69/70/84/85 ──
console.log('\n== 7) kategori sınır skorları (profileAssessmentQualityCategory) ==');
{
  assert('49 → low', App.profileAssessmentQualityCategory(49) === 'low');
  assert('50 → limited', App.profileAssessmentQualityCategory(50) === 'limited');
  assert('69 → limited', App.profileAssessmentQualityCategory(69) === 'limited');
  assert('70 → adequate', App.profileAssessmentQualityCategory(70) === 'adequate');
  assert('84 → adequate', App.profileAssessmentQualityCategory(84) === 'adequate');
  assert('85 → high', App.profileAssessmentQualityCategory(85) === 'high');
}

// ── ek: ağırlıklar tek yerde sabit, toplamı 100, spec ile birebir ──
console.log('\n== 8) PROFILE_QUALITY_WEIGHTS doğrulaması ==');
{
  const W = App.PROFILE_QUALITY_WEIGHTS;
  assert('completion=30, attention=20, timing=20, consistency=20, varianceRevision=10', W.completion === 30 && W.attention === 20 && W.timing === 20 && W.consistency === 20 && W.varianceRevision === 10);
  assert('ağırlıklar toplamı 100', W.completion + W.attention + W.timing + W.consistency + W.varianceRevision === 100);
}

// ── ek: aynı girdi → aynı çıktı (deterministik) ──
console.log('\n== 9) determinizm ==');
{
  const r = cleanBaselineResponses();
  const q1 = App.scoreProfileAssessmentQuality(r);
  const q2 = App.scoreProfileAssessmentQuality(r);
  assert('aynı yanıt seti iki kez çağrılınca birebir aynı sonucu veriyor', JSON.stringify(q1) === JSON.stringify(q2));
}

console.log('\nDone.');
