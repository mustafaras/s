#!/usr/bin/env node
// verify-profile-assessment-gate.mjs — headless tests for the single-question UI,
// answer flow, and main-app-lock gate (Faz 05): renderProfileItem(), App.profileAnswer/
// Previous/ItemKeydown(), and render()'s automatic `pa.status!=='completed'` lock.
//
// DATA SAFETY: same rationale as the other verify-*.mjs scripts — synthetic seed data
// only, `fetch` never resolves (the load-bearing guarantee — nothing can ever reach the
// network no matter what fires), so REAL timers are used here (unlike driver.mjs's
// no-op stub) purely so the 150–220ms post-answer transition in App.profileAnswer can
// be exercised faithfully. Real setTimeout firing pollRemote-style code just calls the
// still-fake `fetch`, which still never resolves — zero risk.
//
// Usage:
//   node .claude/skills/run-seyma/verify-profile-assessment-gate.mjs
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
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
function today() {
  const d = new Date();
  const p = (n) => (n < 10 ? '0' : '') + n;
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

// ── gerçek soru bankasını al (itemId/order/reverse/module bilgisi için) ──
const paSrc = fs.readFileSync(path.join(REPO, 'profileAssessmentV1.js'), 'utf8');
const paSandbox = { window: {}, console };
vm.createContext(paSandbox);
vm.runInContext(paSrc, paSandbox, { filename: 'profileAssessmentV1.js' });
const ITEMS = paSandbox.window.ProfileAssessmentV1.sessions[0].items; // order 1..174
const MODULE_BOUNDARIES = paSandbox.window.ProfileAssessmentV1.sessions[0].moduleBoundaries;

function responsesFor(items) {
  const r = {};
  items.forEach((it, i) => { r[it.id] = { value: 4, scoredValue: it.reverse ? 4 : 4, shownAt: '2026-07-01T09:00:00.000Z', answeredAt: '2026-07-01T09:00:05.000Z', responseMs: 5000, revisionCount: 0, itemVersion: '1.0.0', sessionId: 'SINGLE', sequence: i + 1 }; });
  return r;
}

// ── Fake DOM (driver.mjs ile aynı) — YALNIZCA setTimeout/clearInterval GERÇEK ──
let appHTML = '';
function makeEl(id) {
  const el = {
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
    focus() {}, blur() {}, querySelector() { return null; },
    querySelectorAll() { return []; }, closest() { return null; },
    replaceChildren() {}, contains() { return false; },
    getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; },
  };
  return el;
}
const appEl = makeEl('app');
const rootEl = makeEl('root');
const elCache = { app: appEl, root: rootEl, 'pa-gate': makeEl('pa-gate') };
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
  return {
    getItem(k) { return k in store ? store[k] : null; },
    setItem(k, v) { store[k] = String(v); },
    removeItem(k) { delete store[k]; },
    clear() { for (const k in store) delete store[k]; },
    _store: store,
  };
}
function buildSandbox(seedDataObj) {
  const seed = {};
  if (seedDataObj) seed['seyma-reset-v1'] = JSON.stringify(seedDataObj);
  const localStorage = makeLocalStorage(seed);
  const sandbox = {
    console, localStorage, document: doc,
    navigator: { vibrate() {}, userAgent: 'node-harness', clipboard: { writeText() { return Promise.resolve(); } }, geolocation: null },
    location: { protocol: 'http:', hostname: 'localhost', search: '', href: 'http://localhost/', reload() {} },
    matchMedia() { return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }; },
    DOMParser: DOMParserStub,
    fetch() { return new Promise(() => {}); }, // asla çözülmez — gerçek güvenlik garantisi budur
    setTimeout, clearTimeout, setInterval, clearInterval, // GERÇEK (bkz. dosya başı açıklama)
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
const FILES = ['profileAssessmentV1.js', 'app.js'];
function loadInto(sandbox, files) {
  const ctx = vm.createContext(sandbox);
  for (const f of files) {
    const src = fs.readFileSync(path.join(REPO, f), 'utf8');
    vm.runInContext(src, ctx, { filename: f });
  }
  return ctx;
}
function baseSeed(extra) {
  const t = today();
  return Object.assign({
    version: 2, startDate: t, lastOpenedDate: t, days: {}, notifications: [],
    luna: { qa: [] }, aeon: { qa: [] },
    settings: { nickname: 'Sevgili Günışığı', ghToken: '', ghRepo: 'mustafaras/seyma-data' },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 },
  }, extra || {});
}
function consentedPA(responses) {
  return {
    schemaVersion: 2, deliveryMode: 'single_session', status: 'active', currentItemIndex: 0,
    startedAt: '2026-07-01T09:00:00.000Z', completedAt: null,
    consent: { version: '1.0.0', informationShownAt: '2026-07-01T09:00:00.000Z', acceptedAt: '2026-07-01T09:00:05.000Z', profileProcessingAccepted: true, sensitiveDataAccepted: true, panelSummarySharingAccepted: false },
    responses: responses || {}, moduleProgress: {}, scores: {}, quality: {}, report: {}, panelSummary: {},
  };
}
function bootConsented(responses) {
  const sb = buildSandbox(baseSeed({ profileAssessment: consentedPA(responses) }));
  loadInto(sb, FILES);
  appHTML = '';
  sb.App.start();
  return sb;
}
function persistedPA(sb) {
  // NOT: App.saveToday() burada BİLEREK çağrılmıyor — o, sync yapılandırılmamışsa
  // App.go('ayarlar') tetikleyip appHTML'i ezer (yan etki). App.profileAnswer() zaten
  // kendi save()'ini çağırıyor; doğrudan localStorage'ı okumak yeterli ve yan etkisiz.
  const raw = sb.localStorage.getItem('seyma-reset-v1');
  return raw ? JSON.parse(raw).profileAssessment : null;
}

// ── 1) İlk soru render ──
console.log('== 1) ilk soru (rıza verilmiş, 0 cevap) doğru render ediliyor ==');
{
  const sb = bootConsented({});
  assert('pa-gate render edildi', /id="pa-gate"/.test(appHTML));
  assert('"1 / 174" gösteriliyor', /1 \/ 174/.test(appHTML));
  assert('ilk madde metni görünüyor', appHTML.includes(ITEMS[0].text));
  assert('modül başlığı (S01) görünüyor', appHTML.includes(MODULE_BOUNDARIES[0].title));
  assert('7 seçenek radiogroup içinde', (appHTML.match(/role="radio"/g) || []).length === 7);
}

// ── 2) 1–7 yanıt (normal + ters puanlanan madde) ──
console.log('\n== 2) 1–7 yanıt kaydı ve ters puanlama (reverseFormula: 8 - value) ==');
{
  const sb = bootConsented({});
  const item1 = ITEMS[0]; // reverse:false
  sb.App.profileAnswer(item1.id, 5);
  await sleep(260);
  let pa = persistedPA(sb);
  assert('madde 1 (reverse:false) value=5, scoredValue=5', pa.responses[item1.id].value === 5 && pa.responses[item1.id].scoredValue === 5);
  assert('answeredAt/shownAt/itemVersion/sessionId dolu', typeof pa.responses[item1.id].answeredAt === 'string' && pa.responses[item1.id].itemVersion && pa.responses[item1.id].sessionId === 'SINGLE');
  assert('currentItemIndex 1 ilerledi', pa.currentItemIndex === 1);

  const item5 = ITEMS[4]; // PA1_S01_CONSCIENTIOUSNESS_PERSISTENCE_05, reverse:true
  assert('madde 5 gerçekten reverse:true (test önkoşulu)', item5.reverse === true);
  sb.App.profileAnswer(item5.id, 3); // review olmadan direkt cevapla (henüz sırası gelmedi ama fonksiyon itemId ile çalışır)
  await sleep(260);
  pa = persistedPA(sb);
  assert('madde 5 (reverse:true) value=3, scoredValue=7+1-3=5', pa.responses[item5.id].value === 3 && pa.responses[item5.id].scoredValue === 5);
}

// ── 3) çift tıklama (aynı maddeye art arda tıklama kilitleniyor) ──
console.log('\n== 3) çift tıklama kilidi ==');
{
  const sb = bootConsented({});
  const item1 = ITEMS[0];
  sb.App.profileAnswer(item1.id, 2);
  sb.App.profileAnswer(item1.id, 6); // hemen ardından — kilitli olmalı, YOK SAYILMALI
  await sleep(10); // gerçek setTimeout'un (180ms) çok öncesi — hâlâ kilitli pencere
  // henüz save() edilmedi ama yazılan son responses objesini kontrol etmek için saveToday tetikle
  let pa = persistedPA(sb);
  assert('ikinci (çakışan) tıklama YOK SAYILDI — hâlâ ilk değer (2)', pa.responses[item1.id].value === 2);
  assert('revisionCount hâlâ 0 (ikinci tıklama işlenmedi)', pa.responses[item1.id].revisionCount === 0);
  await sleep(260); // kilidin açılmasını bekle
}

// ── 3b) klavye erişilebilirliği: 1–7 ve Sol Ok ──
console.log('\n== 3b) klavye: rakam tuşları cevaplıyor, Sol Ok yalnızca önceki maddeye ==');
{
  const sb = bootConsented({});
  const item1 = ITEMS[0], item2 = ITEMS[1];
  sb.App.profileItemKeydown({ key: '6', preventDefault() {} });
  await sleep(260);
  let pa = persistedPA(sb);
  assert('"6" tuşu madde 1i value=6 ile cevapladı', pa.responses[item1.id] && pa.responses[item1.id].value === 6);
  assert('madde 2ye ilerledi', appHTML.includes(item2.text));
  sb.App.profileItemKeydown({ key: 'ArrowLeft', preventDefault() {} });
  assert('Sol Ok yalnızca bir önceki maddeye döndürdü (madde 1)', appHTML.includes(item1.text));
  sb.App.profileItemKeydown({ key: '9', preventDefault() {} }); // geçersiz değer (>7) — yok sayılmalı
  await sleep(10);
  pa = persistedPA(sb);
  assert('geçersiz tuş ("9") yok sayıldı, değer hâlâ 6', pa.responses[item1.id].value === 6);
}

// ── 4) geri dönüş (yalnızca son maddeye) ──
console.log('\n== 4) geri dönüş — yalnızca bir önceki maddeye ==');
{
  const sb = bootConsented({});
  const item1 = ITEMS[0], item2 = ITEMS[1];
  sb.App.profileAnswer(item1.id, 4);
  await sleep(260); // madde 2'ye ilerledi
  assert('madde 2 gösteriliyor', appHTML.includes(item2.text));
  sb.App.profilePrevious();
  assert('geri dönüşte madde 1 tekrar gösteriliyor', appHTML.includes(item1.text));
  assert('madde 1in önceki cevabı (4) seçili işaretli', /aria-checked="true"/.test(appHTML));
}

// ── 5) revizyon sayacı ──
console.log('\n== 5) gözden geçirirken yeniden cevaplama revisionCount artırıyor ==');
{
  const sb = bootConsented({});
  const item1 = ITEMS[0], item2 = ITEMS[1];
  sb.App.profileAnswer(item1.id, 4);
  await sleep(260);
  sb.App.profilePrevious(); // madde 1'i gözden geçir
  sb.App.profileAnswer(item1.id, 7); // farklı bir değerle yeniden cevapla
  await sleep(260);
  const pa = persistedPA(sb);
  assert('değer güncellendi (7)', pa.responses[item1.id].value === 7);
  assert('revisionCount 1e çıktı', pa.responses[item1.id].revisionCount === 1);
  assert('sequence korunmuş (ilk cevaplama sırası değişmedi)', pa.responses[item1.id].sequence === 1);
  assert('gözden geçirme sonrası madde 2ye normal akışla dönüldü', appHTML.includes(item2.text));
}

// ── 6) kapatma / resume ──
// "Uygulama kapandı" senaryosu, baştan (localStorage'dan) sıfır bir sandbox'ta boot etmekle
// simüle edilir — gerçek dünyada sayfa yeniden yüklenince olan tam olarak budur.
console.log('\n== 6) uygulama kapanıp yeniden açıldığında kaldığı maddeden devam ediyor ==');
{
  const answered3 = ITEMS.slice(0, 3); // madde 1-3 cevaplı → currentItemIndex=3 (madde 4)
  const sb = buildSandbox(baseSeed({ profileAssessment: consentedPA(responsesFor(answered3)) }));
  appHTML = '';
  loadInto(sb, FILES);
  sb.App.start(); // onboarding gate'i geç — gerçek gate/soru ekranı burada görünür
  assert('4. madde (index 3) gösteriliyor, baştan başlamıyor', /4 \/ 174/.test(appHTML) && appHTML.includes(ITEMS[3].text));
}

// ── 7) modül başlığı değişimi ──
console.log('\n== 7) modül sınırında (S01→S02) başlık değişiyor ==');
{
  const first19 = ITEMS.slice(0, 19); // 1..19 cevaplı → currentItemIndex=19 (madde 20, hâlâ S01)
  const sbA = buildSandbox(baseSeed({ profileAssessment: consentedPA(responsesFor(first19)) }));
  appHTML = '';
  loadInto(sbA, FILES);
  sbA.App.start();
  assert('madde 20 S01 modülünde gösteriliyor', appHTML.includes(MODULE_BOUNDARIES[0].title));

  // 1..20 cevaplı → currentItemIndex=20, bu tam olarak bir mola noktası (Faz 06) — önce mola
  // ekranı çıkar (bkz. == 9 ==), "Devam et" ile geçilince madde 21 (S02'nin ilki) görünür.
  const first20 = ITEMS.slice(0, 20);
  const sbB = buildSandbox(baseSeed({ profileAssessment: consentedPA(responsesFor(first20)) }));
  appHTML = '';
  loadInto(sbB, FILES);
  sbB.App.start();
  sbB.App.profileBreakContinue(); // molayı geç
  assert('madde 21 S02 modülünde gösteriliyor (başlık değişti)', appHTML.includes(MODULE_BOUNDARIES[1].title) && !appHTML.includes(MODULE_BOUNDARIES[0].title));
}

// ── 8) 174. sorudan sonra tamamlanma + teşekkür ekranı ──
console.log('\n== 8) 174. maddeden sonra tamamlanma + teşekkür ekranı ==');
{
  const first173 = ITEMS.slice(0, 173);
  const last = ITEMS[173];
  const sb = buildSandbox(baseSeed({ profileAssessment: consentedPA(responsesFor(first173)) }));
  loadInto(sb, FILES);
  appHTML = '';
  sb.App.start();
  assert('174. (son) madde gösteriliyor', /174 \/ 174/.test(appHTML) && appHTML.includes(last.text));
  sb.App.profileAnswer(last.id, 4);
  await sleep(260);
  const pa = persistedPA(sb);
  assert('status "completed" oldu', pa.status === 'completed');
  assert('completedAt yazıldı (geçici tamamlanma çağrısı)', typeof pa.completedAt === 'string' && pa.completedAt.length > 0);
  assert('tüm 174 madde cevaplı', Object.keys(pa.responses).length === 174);
  // Faz 07'den itibaren tamamlanınca puanlama otomatik çalışır.
  assert('scores artık dolu (Faz 07 puanlama motoru)', pa.scores && Object.keys(pa.scores.constructs || {}).length > 0);
  // Faz 09'dan itibaren tamamlanınca rapor da otomatik üretilir.
  assert('report artık dolu (Faz 09 rapor üretimi)', pa.report && pa.report.sections && Object.keys(pa.report.sections).length === 15);
  // Yeni tamamlanma ekranı — gate henüz duruyor, ama artık "pa-gate" içinde teşekkür kartı.
  assert('tamamlanma ekranı (profile-completion) gösteriliyor', /Teşekkürler Günışığım/.test(appHTML));
  assert('teşekkür mesajı var', /Teşekkürler Günışığım/.test(appHTML));
  assert('tamamlanma ekranında "Ana uygulamaya dön" butonu var', /Ana uygulamaya dön/.test(appHTML));
  assert('gate henüz kalkmadı (tamamlanma ekranı gösteriliyor)', /id="pa-gate"/.test(appHTML));

  // Kullanıcı "Ana uygulamaya dön" butonuna tıklayınca gate kalkmalı.
  sb.App.dismissProfileCompletion();
  assert('gate kalktı — artık pa-gate DEĞİL, ana uygulama gösteriliyor', !/id="pa-gate"/.test(appHTML));

}

console.log('\nDone.');
// app.js her sandbox'ta setInterval(pollRemote,30000) gibi GERÇEK zamanlayıcılar kurar
// (bu dosyada setTimeout/setInterval bilerek gerçek — bkz. dosya başı); onlar süresiz
// event-loop'u açık tutmasın diye testler bitince süreci açıkça kapatıyoruz.
process.exit(process.exitCode || 0);
