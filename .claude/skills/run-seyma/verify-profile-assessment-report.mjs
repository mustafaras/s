#!/usr/bin/env node
// verify-profile-assessment-report.mjs — headless tests for the deterministic report
// generator (Faz 09): buildProfileReport(scores, quality). Pure, template-based, no LLM —
// exposed on App.* purely for direct testability (no DOM/UI/fetch/localStorage involved).
//
// DATA SAFETY: fully synthetic response/score sets built from the real (frozen) item bank;
// no real user data, no network.
//
// Usage:
//   node .claude/skills/run-seyma/verify-profile-assessment-report.mjs
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
const ITEMS = PA.sessions[0].items;
const SC = PA.scoring.constructs;

function ans(value) { return { value }; }
function uniformResponses(value) {
  const r = {};
  ITEMS.forEach((it) => {
    if (it.qualityControl) { r[it.id] = ans(it.expectedResponse != null ? it.expectedResponse : 6); return; }
    r[it.id] = ans(value);
  });
  return r;
}
function quality(score, warnings) { return { score, category: App.profileAssessmentQualityCategory(score), warnings: warnings || [] }; }
const byId = {}; ITEMS.forEach((it) => { byId[it.id] = it; });
// Bir facet'teki TÜM maddeleri istenen SCORED değere getirir (ters puanlananlarda ham
// değeri buna göre tersine çevirir) — facet karışık reverse/normal madde içerse bile
// facet ortalamasının gerçekten istenen bandda çıkmasını garanti eder.
function setFacetScored(responses, ids, scoredTarget) {
  ids.forEach((id) => {
    const it = byId[id];
    const raw = it.reverse ? (8 - scoredTarget) : scoredTarget;
    responses[id] = ans(raw);
  });
}

// ── 1) yüksek/orta/düşük skor metinleri ──
console.log('== 1) yüksek/orta/düşük skor metinleri (Big Five bölümü) ==');
{
  const high = App.scoreProfileAssessment(uniformResponses(6));
  const mid = App.scoreProfileAssessment(uniformResponses(4));
  const low = App.scoreProfileAssessment(uniformResponses(2));
  const rHigh = App.buildProfileReport(high, quality(90));
  const rMid = App.buildProfileReport(mid, quality(90));
  const rLow = App.buildProfileReport(low, quality(90));
  assert('yüksek profil metni "belirgin biçimde yüksek" içeriyor', rHigh.sections.bigFive.body.includes('belirgin biçimde yüksek'));
  assert('orta profil metni "dengeli/orta" içeriyor', rMid.sections.bigFive.body.includes('dengeli/orta'));
  assert('düşük profil metni "ortalamanın altında" içeriyor', rLow.sections.bigFive.body.includes('ortalamanın altında'));
  assert('üç farklı profil üç farklı Big Five metni üretiyor', rHigh.sections.bigFive.body !== rMid.sections.bigFive.body && rMid.sections.bigFive.body !== rLow.sections.bigFive.body);
  assert('her cümle sayısal kanıt taşıyor (ör. "/7")', /\/7\)/.test(rHigh.sections.bigFive.body));
}

// ── 2) çelişkili profil ──
console.log('\n== 2) çelişkili profil — hata değil, bağlama duyarlı not ==');
{
  const responses = uniformResponses(4);
  // yüksek sosyallik (extraversion.sociability) + yüksek yakınlık kaçınması (attachment.avoidance)
  // — sociability karışık reverse/normal madde içeriyor, bu yüzden setFacetScored kullanılıyor.
  setFacetScored(responses, SC.extraversion.sociability, 7);
  setFacetScored(responses, SC.attachment.avoidance, 7);
  const scores = App.scoreProfileAssessment(responses);
  const notes = App.profileAssessmentContradictionNotes(scores);
  assert('çelişki notu üretildi', notes.length >= 1);
  assert('not "çelişki değildir" diyor (hata sayılmıyor)', notes.some((n) => n.includes('çelişki değildir')));
  const report = App.buildProfileReport(scores, quality(90));
  assert('karakter özetinde bu not geçiyor', report.sections.characterSummary.body.includes('çelişki değildir'));
}

// ── 3) düşük kalite uyarısı ("ön değerlendirme") ──
console.log('\n== 3) düşük kalite → "ön değerlendirme" uyarısı ==');
{
  const scores = App.scoreProfileAssessment(uniformResponses(4));
  const rLowQ = App.buildProfileReport(scores, quality(35, ['Test uyarısı.']));
  const rHighQ = App.buildProfileReport(scores, quality(90));
  assert('düşük kalitede preliminary=true', rLowQ.preliminary === true);
  assert('düşük kalitede "ön değerlendirme" metni var', /ön değerlendirme/i.test(rLowQ.sections.measurementConfidence.body));
  assert('yüksek kalitede preliminary=false', rHighQ.preliminary === false);
  assert('yüksek kalitede "ön değerlendirme" metni YOK', !/ön değerlendirme/i.test(rHighQ.sections.measurementConfidence.body));
  assert('kalite uyarıları rapora yansıyor', rLowQ.sections.measurementConfidence.body.includes('Test uyarısı.'));
}

// ── 4) wellbeing bağlamının karaktere karışmaması ──
console.log('\n== 4) wellbeing_context ayrı tutuluyor, kalıcı özellik metnini değiştirmiyor ==');
{
  const base = uniformResponses(4);
  // "wellbeing YOK" temeli: wellbeing_context maddelerini tamamen ÇIKAR (uniformResponses
  // hepsini cevaplı sayar) — böylece %80 eşiği altında kalıp wellbeingContext.sufficient=false olur.
  const noWb = Object.assign({}, base);
  Object.keys(SC.wellbeing_context).forEach((f) => { SC.wellbeing_context[f].forEach((id) => { delete noWb[id]; }); });
  const scoresNoWb = App.scoreProfileAssessment(noWb);
  const withWb = Object.assign({}, base);
  Object.keys(SC.wellbeing_context).forEach((f) => { SC.wellbeing_context[f].forEach((id) => { withWb[id] = ans(7); }); });
  const scoresWithWb = App.scoreProfileAssessment(withWb);
  assert('(önkoşul) wellbeing çıkarılınca sufficient=false', scoresNoWb.wellbeingContext.sufficient === false);
  assert('(önkoşul) wellbeing eklenince sufficient=true', scoresWithWb.wellbeingContext.sufficient === true);
  const r1 = App.buildProfileReport(scoresNoWb, quality(90));
  const r2 = App.buildProfileReport(scoresWithWb, quality(90));
  // emotionRegulation bölümünün KALICI ÖZELLİK kısmı (Güncel bağlam öncesi) değişmemeli
  const stableBefore = r1.sections.emotionRegulation.body.split('Güncel bağlam:')[0].trim();
  const stableAfter = r2.sections.emotionRegulation.body.split('Güncel bağlam:')[0].trim();
  assert('duygu düzenleme/öz-şefkat/meta-biliş kalıcı metni wellbeing\'den ETKİLENMEDİ', stableBefore === stableAfter);
  assert('yüksek wellbeing girdisinde ayrı "Güncel bağlam:" notu eklendi', r2.sections.emotionRegulation.body.includes('Güncel bağlam:'));
  assert('"Güncel bağlam" notu KALICI olmadığını açıkça belirtiyor', r2.sections.emotionRegulation.body.includes('KALICI bir kişilik özelliği değil'));
  assert('wellbeing eklenmemiş raporda "Güncel bağlam" notu yok', !r1.sections.emotionRegulation.body.includes('Güncel bağlam:'));
}

// ── 5) tanı dilinin oluşmaması ──
console.log('\n== 5) tanı/yargı dili hiçbir bölümde yok ==');
{
  const scores = App.scoreProfileAssessment(uniformResponses(6)); // en yüksek uçta bile
  const report = App.buildProfileReport(scores, quality(20, ['uyarı']));
  const fullText = Object.keys(report.sections).map((k) => report.sections[k].body).join(' \n ');
  const forbidden = ['kesinlikle böylesiniz', 'sağlıksız kişilik', 'kişilik bozukluğu', 'bu mesleği yapmalısınız', 'bozukluk', 'hastalık', 'teşhis'];
  forbidden.forEach((phrase) => {
    assert(`yasak ifade YOK: "${phrase}"`, !fullText.toLowerCase().includes(phrase));
  });
  // "tanı" (teşhis anlamında) kelimesi YALNIZCA "tanı değildir" reddiyesinde geçebilir.
  // \b sınırı kullanılıyor ki "tanıdık" (aşina/familiar — alakasız bir kelime) yanlışlıkla
  // eşleşmesin.
  const taniMatches = fullText.match(/\btanı\b/gi) || [];
  assert('(önkoşul) metinde en az bir "tanı" geçiyor', taniMatches.length >= 1);
  let allNegated = true;
  let searchFrom = 0;
  const lower = fullText.toLowerCase();
  taniMatches.forEach(() => {
    const idx = lower.indexOf('tanı', searchFrom);
    if (idx < 0) return;
    const window = lower.slice(idx, idx + 20);
    if (!window.includes('değildir')) allNegated = false;
    searchFrom = idx + 4;
  });
  assert('"tanı" kelimesi yalnızca "... tanı değildir" bağlamında geçiyor (ör. "tanıdık" gibi alakasız kelimelerle karışmıyor)', allNegated);
  assert('"bu değerlendirme tanı değildir" ifadesi rapor genelinde var', fullText.includes('tanı değildir'));
}

// ── 6) determinizm ──
console.log('\n== 6) aynı skor+kalite → aynı rapor ==');
{
  const scores = App.scoreProfileAssessment(uniformResponses(5));
  const q = quality(80);
  const r1 = App.buildProfileReport(scores, q);
  const r2 = App.buildProfileReport(scores, q);
  const strip = (r) => Object.assign({}, r, { generatedAt: null });
  assert('generatedAt hariç rapor birebir aynı', JSON.stringify(strip(r1)) === JSON.stringify(strip(r2)));
  assert('15 bölümün hepsi mevcut', Object.keys(r1.sections).length === 15);
}

console.log('\nDone.');
