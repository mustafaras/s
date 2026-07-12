#!/usr/bin/env node
// verify-profile-assessment-scoring.mjs — headless tests for the scoring engine (Faz 07):
// scoreProfileItem/Facet/Construct/Riasec/Values/Attachment/ProfileAssessment. These are
// pure functions exposed on App.* purely for direct testability (see app.js comment at
// their App.* assignment) — no DOM/UI involved, no fetch, no localStorage writes needed.
//
// DATA SAFETY: fully synthetic response sets constructed from the real (frozen) item bank's
// scoring.constructs map; no real user data anywhere; no network.
//
// Usage:
//   node .claude/skills/run-seyma/verify-profile-assessment-scoring.mjs
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

// ── minimal, DOM-free sandbox: sadece window.App'i almak için app.js'i boot ediyoruz ──
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
const byId = {}; ITEMS.forEach((it) => { byId[it.id] = it; });
const SC = PA.scoring.constructs;

function ans(value) { return { value }; } // scoreProfileItem/Facet yalnızca .value okur

// ── 1) ters puanlama ──
console.log('== 1) ters puanlama (scoreProfileItem) ==');
{
  const normalItem = byId['PA1_S01_CONSCIENTIOUSNESS_ORGANIZATION_01']; // reverse:false
  const reverseItem = byId['PA1_S01_CONSCIENTIOUSNESS_PERSISTENCE_05']; // reverse:true
  assert('normal madde scored=raw (5)', App.scoreProfileItem(normalItem, 5) === 5);
  assert('ters madde scored=8-raw (raw=3 → 5)', App.scoreProfileItem(reverseItem, 3) === 5);
  assert('ters madde uç değer (raw=1 → 7)', App.scoreProfileItem(reverseItem, 1) === 7);
  assert('geçersiz rawValue → null', App.scoreProfileItem(normalItem, null) === null);
}

// ── 2) kalite maddesi dışlama ──
console.log('\n== 2) kalite kontrol maddeleri scoring.constructs\'ta hiç referans edilmiyor ==');
{
  const qualityIds = ITEMS.filter((it) => it.qualityControl).map((it) => it.id);
  assert('en az 1 kalite kontrol maddesi var (test önkoşulu)', qualityIds.length > 0);
  let referenced = false;
  Object.keys(SC).forEach((c) => { Object.keys(SC[c]).forEach((f) => { if (SC[c][f].some((id) => qualityIds.includes(id))) referenced = true; }); });
  assert('hiçbir kalite maddesi hiçbir facet/construct listesinde YOK', !referenced);
  // scoreProfileConstruct'a kalite maddesi id'si karışsa bile (savunma) sonucu etkilemez —
  // çünkü facet haritaları zaten onları içermiyor; burada yalnızca dışlamanın veri düzeyinde
  // garanti olduğunu doğruluyoruz.
}

// ── 3) %80 facet eşiği ──
console.log('\n== 3) minimum %80 facet tamamlama eşiği ==');
{
  const orgIds = SC.conscientiousness.organization; // 2 madde: ORGANIZATION_01, ORGANIZATION_04
  assert('organization facet\'i 2 maddeden oluşuyor (test önkoşulu)', orgIds.length === 2);
  const fullResp = {}; orgIds.forEach((id) => { fullResp[id] = ans(5); });
  const full = App.scoreProfileFacet(orgIds, fullResp);
  assert('2/2 (%100) → sufficient=true, mean=5', full.sufficient === true && full.mean === 5);
  const partialResp = { [orgIds[0]]: ans(5) }; // 1/2 = %50 < %80
  const partial = App.scoreProfileFacet(orgIds, partialResp);
  assert('1/2 (%50 < %80) → sufficient=false, mean=null', partial.sufficient === false && partial.mean === null);

  // Gerçek bankada hiçbir facet 5+ madde içermiyor (en büyükleri RIASEC/attachment'ta 4);
  // tam %80 sınırını (4/5) mekanik olarak test etmek için 5 gerçek itemId'yi rastgele bir
  // araya getiriyoruz — scoreProfileFacet hangi "facet"e ait olduklarını bilmez, saf bir
  // itemId listesi + responses alır, bu yüzden bu tamamen geçerli bir sınır testidir.
  const ids5 = ITEMS.slice(0, 5).map((it) => it.id);
  const resp4of5 = {}; ids5.slice(0, 4).forEach((id) => { resp4of5[id] = ans(4); });
  const r4 = App.scoreProfileFacet(ids5, resp4of5);
  assert('5 maddeden 4\'ü (%80 tam sınır) → sufficient=true', r4.sufficient === true && r4.completion === 0.8);
  const resp3of5 = {}; ids5.slice(0, 3).forEach((id) => { resp3of5[id] = ans(4); });
  const r3 = App.scoreProfileFacet(ids5, resp3of5);
  assert('5 maddeden 3\'ü (%60 < %80) → sufficient=false', r3.sufficient === false && r3.completion === 0.6);
}

// ── 4) RIASEC ilk üç ──
console.log('\n== 4) RIASEC — 6 alan ayrı, ilk üç ve fark hesaplanıyor ==');
{
  const riasecFacets = SC.riasec; // realistic, investigative, artistic, social, enterprising, conventional
  const responses = {};
  const meansByCode = { realistic: 7, investigative: 6, artistic: 5, social: 4, enterprising: 3, conventional: 2 };
  Object.keys(riasecFacets).forEach((code) => {
    riasecFacets[code].forEach((id) => { responses[id] = ans(meansByCode[code]); });
  });
  const r = App.scoreRiasec(responses);
  assert('en yüksek üç: realistic, investigative, artistic', JSON.stringify(r.topThree) === JSON.stringify(['realistic', 'investigative', 'artistic']));
  assert('birinci-ikinci farkı 1 (7-6)', r.topSecondDiff === 1);
  assert('farklılaşma (en yüksek-en düşük) 5 (7-2)', r.differentiation === 5);
}

// ── 5) eşit skor durumu ──
console.log('\n== 5) RIASEC eşit skor durumu — deterministik, tanım sırası korunuyor ==');
{
  const riasecFacets = SC.riasec;
  const responses = {};
  Object.keys(riasecFacets).forEach((code) => { riasecFacets[code].forEach((id) => { responses[id] = ans(4); }); }); // hepsi eşit
  const r1 = App.scoreRiasec(responses);
  const r2 = App.scoreRiasec(responses); // aynı girdiyle ikinci çağrı
  assert('tüm alanlar eşitken topThree deterministik (R,I,A — tanım sırası)', JSON.stringify(r1.topThree) === JSON.stringify(['realistic', 'investigative', 'artistic']));
  assert('aynı girdiyle iki çağrı BİREBİR aynı sonucu veriyor', JSON.stringify(r1) === JSON.stringify(r2));
  assert('eşit skorda birinci-ikinci fark 0', r1.topSecondDiff === 0);
  assert('eşit skorda farklılaşma 0', r1.differentiation === 0);
}

// ── 6) değer merkezleme ──
console.log('\n== 6) değerler — kişi-merkezli skor (centered = valueMean - allValuesMean) ==');
{
  const valueFacets = SC.values; // self_direction, stimulation, achievement, power_influence, security, tradition_conformity, benevolence, universalism
  const codes = Object.keys(valueFacets);
  const responses = {};
  const means = {}; // her facet'e sabit bir ortalama ata
  codes.forEach((code, i) => { means[code] = 3 + i; valueFacets[code].forEach((id) => { responses[id] = ans(means[code]); }); });
  const v = App.scoreValues(responses);
  const expectedAll = codes.reduce((a, c) => a + means[c], 0) / codes.length;
  assert('allValuesMean doğru hesaplandı', Math.abs(v.allValuesMean - expectedAll) < 1e-9);
  codes.forEach((code) => {
    const expectedCentered = Math.round((means[code] - expectedAll) * 1000) / 1000;
    assert(`"${code}" centered = ham - genel ort. (${expectedCentered})`, v.centered[code] === expectedCentered);
  });
  assert('en yüksek ham ortalamalı facet en yüksek pozitif centered\'a sahip', v.centered[codes[codes.length - 1]] > v.centered[codes[0]]);
}

// ── 7) bağlanma iki eksen ──
console.log('\n== 7) bağlanma — kaygı ve kaçınma AYRI iki sürekli skor, kategori YOK ==');
{
  const att = SC.attachment; // avoidance, anxiety
  const responses = {};
  att.anxiety.forEach((id) => { responses[id] = ans(6); });
  att.avoidance.forEach((id) => { responses[id] = ans(2); });
  const a = App.scoreAttachment(responses);
  assert('anxiety.mean=6, avoidance.mean=2 — birbirinden bağımsız', a.anxiety.mean === 6 && a.avoidance.mean === 2);
  assert('kategori alanı (ör. "style"/"category") YOK — yalnızca iki eksen', !('style' in a) && !('category' in a) && Object.keys(a).sort().join(',') === 'anxiety,avoidance');
}

// ── 8) wellbeing ayrımı ──
console.log('\n== 8) wellbeing_context kalıcı construct skorlarından AYRI tutuluyor ==');
{
  const responses = {};
  ITEMS.forEach((it) => { if (SC[it.construct] && !['riasec', 'values', 'attachment', 'wellbeing_context'].includes(it.construct)) responses[it.id] = ans(4); });
  Object.keys(SC.wellbeing_context).forEach((f) => { SC.wellbeing_context[f].forEach((id) => { responses[id] = ans(7); }); });
  const full = App.scoreProfileAssessment(responses);
  assert('"wellbeing_context" ana constructs haritasında YOK', !('wellbeing_context' in full.constructs));
  assert('wellbeingContext ayrı bir üst-seviye alan olarak dönüyor', full.wellbeingContext && typeof full.wellbeingContext.mean === 'number');
  assert('wellbeingContext skoru diğer construct ortalamalarını ETKİLEMEDİ (7 verilmesine rağmen diğerleri 4 civarı)', Math.abs(full.constructs.conscientiousness.mean - 4) < 0.01);
}

console.log('\nDone.');
