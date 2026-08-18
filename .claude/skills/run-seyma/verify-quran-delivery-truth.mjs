#!/usr/bin/env node
// verify-quran-delivery-truth.mjs — QY-21 kabul kapısı:
// "UZAK KANIT, YEREL TAHMİNİ EZER."
//
// Yeniden ürettiği gerçek üretim vakası (2026-08-17/18, mesed):
//   • Uygulama arka arkaya üç istek gönderdi; ÜÇÜ DE outbox'a yazıldı ve
//     Raşit'e maili gitti — ama üçü de uygulamada "İletilemedi" göründü,
//     çünkü hüküm uygulamanın kendi ağ sonucundan veriliyordu.
//   • Her başarısızlık yeniden denemeyi açtığı için her denemede YENİ bir
//     requestId üretildi; yerel id ile outbox'taki id ayrıştı.
//   • Sonunda doğrulanmış bir cevap (YouTube anlatımı) geldi, ama sûre
//     request_error durumunda kilitli olduğu için reducer teslim/yanıt
//     olaylarının HİÇBİRİNİ uygulayamadı — anlatım sessizce düştü.
//
// Bu harness o zinciri uçtan uca kapatır. Kullanılan tüm kimlikler ve video
// kimlikleri SENTETİKTİR; gerçek kişisel veri yoktur.
//
// DATA SAFETY: node:vm sandbox; fetch/timer ölü, gerçek DOM/ağ yok,
// seyma-data'ya tek bir bayt yazılmaz.
//
// Usage:
//   node .claude/skills/run-seyma/verify-quran-delivery-truth.mjs
//
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const ISO = (h, m) => '2026-08-17T' + String(h).padStart(2, '0') + ':' + String(m || 0).padStart(2, '0') + ':00.000Z';
const VID = 'dQw4w9WgXcQ';        // sentetik video kimliği
const VID2 = 'aBcDeFgHiJk';       // ikinci sentetik video kimliği
const SURAH = 'mesed';
const LOCAL_ID = 'qr_YerelKimlikSentetik01';   // uygulamanın elindeki id
const OUTBOX_ID = 'qr_OutboxKimlikSentetik02'; // outbox'a gerçekten yazılan id

let passed = 0, failed = 0;
function ok(name, cond, detail) {
  if (cond) { passed++; console.log('  ✓ ' + name); }
  else { failed++; console.log('  ✗ ' + name + (detail !== undefined ? ' — ' + JSON.stringify(detail) : '')); }
}

// ── Sandbox deseni verify-quran-remote-updates.mjs ile birebir aynı ──
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
    fetch() { return new Promise(() => {}); },   // ÖLÜ: hiçbir ağ çağrısı mümkün değil
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
const FILES = ['motivationProgramV2.js', 'motivationNarratives.js', 'profileAssessmentV1.js', 'saygiPeople.js',
  'hijriCalendar.js', 'quranRevelationOrderV1.js', 'quranTransportV1.js', 'quranStrikingVersesV1.js',
  'esmaulHusnaV1.js', 'esmaulHusnaV2.js', 'zikirCoreContentV1.js', 'app/core/constants.js', 'app.js'];

function journey(sandbox) { try { return JSON.parse(sandbox.localStorage.getItem('seyma-reset-v1')).quranJourney; } catch (e) { return null; } }

function seedState(requests) {
  return {
    onboarded: true, startDate: '2026-08-01', days: {},
    settings: { theme: 'light', name: 'Test', profileAssessmentInactive: true, auth: { rememberMe: true, usernameHash: 'harness-stub-hash', unlockedAt: ISO(8) } },
    quranJourney: { schemaVersion: 1, catalogVersion: 'quran-revelation-tr-v1', startedAt: ISO(9), activeSurahId: SURAH, requests },
  };
}
function req(requestId, status, extra) {
  return Object.assign({ requestId, status, requestedAt: ISO(16, 18), notifiedAt: null, responseId: null, videoId: null, readyAt: null, startedWatchingAt: null, watchedAt: null, questionOpenedAt: null, updatedAt: ISO(16, 18), videoHistory: [] }, extra || {});
}
function response(requestId, extra) {
  return Object.assign({
    responseId: 'qrr_Sentetik' + requestId.slice(-4), requestId, surahId: SURAH, videoId: VID,
    source: 'gmail_reply', receivedAt: ISO(18, 0), validatedAt: ISO(18, 0), senderFingerprint: null, status: 'ready',
  }, extra || {});
}
function boot(requests, seySync) {
  const sandbox = buildSandbox(seedState(requests));
  const ctx = vm.createContext(sandbox);
  for (const f of FILES) vm.runInContext(fs.readFileSync(path.join(REPO, f), 'utf8'), ctx, { filename: f });
  if (typeof sandbox.App.start === 'function') sandbox.App.start();
  sandbox.SeySync = seySync || null;
  return sandbox;
}
const pullOf = (delivery, responses) => ({ delivery: { requests: delivery || {} }, responses: { responses: responses || {} } });
// pushQuranRequest'in ürettiği promise'in yerine geçen, hiç ateşlemeyen ince
// bir taklit: karar YALNIZ callback üzerinden verilsin, çift settle olmasın.
const inertThenable = () => ({ then() { return this; }, catch() { return this; } });

console.log('== QY-21 Kur’an Yolculuğu — teslim gerçeği (kanıt > tahmin) ==');

// ── 1) ÜRETİM VAKASI: request_error'da kilitli sûreye gelen doğrulanmış cevap ──
console.log('\n1. Üretim vakası — "İletilemedi"de kilitli sûre gelen anlatımı alabilmeli');
{
  const sb = boot(
    { [SURAH]: req(LOCAL_ID, 'request_error') },
    { pullQuranUpdates(cb) { cb(null, pullOf({}, { [LOCAL_ID]: response(LOCAL_ID) })); } }
  );
  sb.App.refreshQuranUpdates(true);
  const r = journey(sb).requests[SURAH];
  ok('durum request_error → ready oldu (anlatım artık düşmüyor)', r.status === 'ready', r.status);
  ok('videoId yerel duruma yazıldı', r.videoId === VID, r.videoId);
  ok('teslim kaydı çıkarım olarak işaretlendi (uydurma sentAt yok)', r.deliveryProvenance === 'response_inferred' && !r.deliverySentAt, { p: r.deliveryProvenance, s: r.deliverySentAt });
}

// ── 2) Yalnız delivery receipt: mail gitmiş ama cevap henüz yok ──
console.log('\n2. Yalnız teslim kaydı — yanlış "İletilemedi" damgası kanıtla düzeltilir');
{
  const sb = boot(
    { [SURAH]: req(LOCAL_ID, 'request_error') },
    { pullQuranUpdates(cb) { cb(null, pullOf({ [LOCAL_ID]: { status: 'sent', sentAt: ISO(16, 20), providerMessageId: 'm1', error: null } }, {})); } }
  );
  sb.App.refreshQuranUpdates(true);
  const r = journey(sb).requests[SURAH];
  ok('durum awaiting_reply oldu (mail gerçekten gitmişti)', r.status === 'awaiting_reply', r.status);
  ok('gerçek sentAt korunuyor', r.deliverySentAt === ISO(16, 20), r.deliverySentAt);
}

// ── 3) requestId KAYMASI: cevap outbox'taki id ile yazılmış ──
console.log('\n3. requestId kayması — yerel id ≠ outbox id olsa da cevap kaybolmaz');
{
  const sb = boot(
    { [SURAH]: req(LOCAL_ID, 'request_error') },
    { pullQuranUpdates(cb) { cb(null, pullOf({}, { [OUTBOX_ID]: response(OUTBOX_ID) })); } }
  );
  sb.App.refreshQuranUpdates(true);
  const r = journey(sb).requests[SURAH];
  ok('farklı requestId altındaki AYNI SÛRE cevabı uygulanıyor', r.status === 'ready' && r.videoId === VID, { s: r.status, v: r.videoId });
}

// ── 4) Kayma onarımının SINIRLARI — gevşetme değil, dar bir yol ──
console.log('\n4. Kayma onarımının sınırları');
{
  // 4a) İstekten ÖNCE doğrulanmış eski bir cevap geri canlanamaz.
  const stale = boot(
    { [SURAH]: req(LOCAL_ID, 'request_error') },
    { pullQuranUpdates(cb) { cb(null, pullOf({}, { [OUTBOX_ID]: response(OUTBOX_ID, { videoId: VID2, receivedAt: ISO(9, 0), validatedAt: ISO(9, 0) }) })); } }
  );
  stale.App.refreshQuranUpdates(true);
  const sr = journey(stale).requests[SURAH];
  ok('istekten ÖNCEKİ eski cevap geri canlanmıyor', sr.status === 'request_error' && sr.videoId === null, { s: sr.status, v: sr.videoId });

  // 4b) Zaman damgası olmayan kayıt asla kabul edilmez.
  const noStamp = boot(
    { [SURAH]: req(LOCAL_ID, 'request_error') },
    { pullQuranUpdates(cb) { cb(null, pullOf({}, { [OUTBOX_ID]: response(OUTBOX_ID, { receivedAt: null, validatedAt: null }) })); } }
  );
  noStamp.App.refreshQuranUpdates(true);
  ok('zaman damgasız cevap reddediliyor', journey(noStamp).requests[SURAH].status === 'request_error');

  // 4c) BAŞKA sûrenin cevabı bu sûreye asla yazılamaz.
  const wrong = boot(
    { [SURAH]: req(LOCAL_ID, 'request_error') },
    { pullQuranUpdates(cb) { cb(null, pullOf({}, { [OUTBOX_ID]: response(OUTBOX_ID, { surahId: 'alak' }) })); } }
  );
  wrong.App.refreshQuranUpdates(true);
  const wr = journey(wrong).requests[SURAH];
  ok('yanlış sûre eşlemesi hâlâ imkânsız', wr.status === 'request_error' && wr.videoId === null, { s: wr.status, v: wr.videoId });

  // 4d) İzlenmiş bir sûre kayma onarımıyla geriye çekilemez.
  const done = boot(
    { [SURAH]: req(LOCAL_ID, 'watched', { videoId: VID, responseId: 'qrr_onceki', readyAt: ISO(17, 0), watchedAt: ISO(17, 30) }) },
    { pullQuranUpdates(cb) { cb(null, pullOf({}, { [OUTBOX_ID]: response(OUTBOX_ID, { videoId: VID2 }) })); } }
  );
  done.App.refreshQuranUpdates(true);
  const dr = journey(done).requests[SURAH];
  ok('izlendi bilgisi korunuyor, yeni anlatım yalnız tazeliyor', dr.status === 'watched' && dr.videoId === VID2, { s: dr.status, v: dr.videoId });
}

// ── 5) İdempotens: aynı kurtarma iki kez uygulanınca hiçbir şey bozulmaz ──
console.log('\n5. Kurtarma idempotenttir');
{
  const sb = boot(
    { [SURAH]: req(LOCAL_ID, 'request_error') },
    { pullQuranUpdates(cb) { cb(null, pullOf({}, { [LOCAL_ID]: response(LOCAL_ID) })); } }
  );
  sb.App.refreshQuranUpdates(true);
  const first = JSON.stringify(journey(sb).requests[SURAH]);
  sb.App.refreshQuranUpdates(true);
  sb.App.refreshQuranUpdates(true);
  ok('üç kez uygulansa da kayıt birebir aynı kalıyor', JSON.stringify(journey(sb).requests[SURAH]) === first);
}

// ── 6) GÖNDERİM HÜKMÜ: "iletilemedi" artık kanıtsız verilmiyor ──
console.log('\n6. Gönderim hükmü outbox’a bakılmadan verilmiyor');
{
  // 6a) Yazma hata bildirdi AMA istek outbox'ta var → doğru cevap "kaydedildi".
  let confirmed = 0;
  const okSb = boot({}, {
    pullQuranUpdates(cb) { cb(null, pullOf({}, {})); },
    pushQuranRequest(payload, cb) { cb(new Error('quran_outbox: timeout')); return inertThenable(); },
    confirmQuranRequest(rid, cb) { confirmed++; cb(null, { found: true }); },
  });
  okSb.App.quranJourneySubmit(SURAH);
  const okr = journey(okSb).requests[SURAH];
  ok('outbox doğrulaması tam bir kez çağrıldı', confirmed === 1, confirmed);
  ok('yazma hatası bildirse de durum queued (yanlış "İletilemedi" yok)', okr.status === 'queued', okr.status);

  // 6b) Gerçekten yazılmamışsa hüküm hâlâ hata — sistem yapmadığını yaptım demez.
  const failSb = boot({}, {
    pullQuranUpdates(cb) { cb(null, pullOf({}, {})); },
    pushQuranRequest(payload, cb) { cb(new Error('quran_outbox: timeout')); return inertThenable(); },
    confirmQuranRequest(rid, cb) { cb(null, { found: false }); },
  });
  failSb.App.quranJourneySubmit(SURAH);
  ok('outbox’ta gerçekten yoksa request_error kaydediliyor', journey(failSb).requests[SURAH].status === 'request_error', journey(failSb).requests[SURAH].status);

  // 6c) Doğrulama YAPILAMIYORSA güvenli tarafta kalınır (uydurma başarı yok).
  const unknownSb = boot({}, {
    pullQuranUpdates(cb) { cb(null, pullOf({}, {})); },
    pushQuranRequest(payload, cb) { cb(new Error('quran_outbox: timeout')); return inertThenable(); },
    confirmQuranRequest(rid, cb) { cb(new Error('quran_transport_http_500'), { found: null }); },
  });
  unknownSb.App.quranJourneySubmit(SURAH);
  ok('doğrulama hatasında başarı UYDURULMUYOR', journey(unknownSb).requests[SURAH].status === 'request_error');

  // 6d) Başarılı yazmada fazladan doğrulama GET'i yapılmaz (boşuna istek yok).
  let extra = 0;
  const cleanSb = boot({}, {
    pullQuranUpdates(cb) { cb(null, pullOf({}, {})); },
    pushQuranRequest(payload, cb) { cb(null); return inertThenable(); },
    confirmQuranRequest(rid, cb) { extra++; cb(null, { found: true }); },
  });
  cleanSb.App.quranJourneySubmit(SURAH);
  ok('başarılı yazmada doğrulama çağrılmıyor', extra === 0, extra);
  ok('başarılı yazmada durum queued', journey(cleanSb).requests[SURAH].status === 'queued');

  // 6e) confirmQuranRequest sağlanmamışsa eski davranış korunur (geri uyum).
  const legacySb = boot({}, {
    pullQuranUpdates(cb) { cb(null, pullOf({}, {})); },
    pushQuranRequest(payload, cb) { cb(new Error('quran_outbox: timeout')); return inertThenable(); },
  });
  legacySb.App.quranJourneySubmit(SURAH);
  ok('doğrulayıcı yokken eski davranış (request_error) korunuyor', journey(legacySb).requests[SURAH].status === 'request_error');
}

// ── 7) Statik denetim: sözleşmenin kaynakta gerçekten yazılı olduğu ──
console.log('\n7. Statik denetim');
{
  const appSrc = fs.readFileSync(path.join(REPO, 'app.js'), 'utf8');
  const syncSrc = fs.readFileSync(path.join(REPO, 'sync.js'), 'utf8');
  ok('delivery_receipt kurtarma durumlarını kabul ediyor', /delivery_receipt:\{from:\['queued','request_error','notification_error'\]/.test(appSrc));
  ok('outbox_written request_error’dan kurtarabiliyor', /outbox_written:\{from:\['submitting','request_error'\]/.test(appSrc));
  ok('confirmQuranRequest sync.js’te tanımlı ve dışa açık', /function confirmQuranRequest\(/.test(syncSrc) && /confirmQuranRequest:confirmQuranRequest/.test(syncSrc));
  ok('confirmQuranRequest yalnız GET yapıyor (PUT/POST yok)', !/function confirmQuranRequest[\s\S]{0,1200}?method:'(PUT|POST)'/.test(syncSrc));
  ok('outbox_failed hâlâ yalnız submitting’den geliyor', /outbox_failed:\{from:\['submitting'\]/.test(appSrc));
}

console.log('');
if (failed === 0) console.log(`✅ Tüm kontroller PASS (${passed}/${passed})`);
else console.log(`❌ ${failed} kontrol FAIL (${passed} geçti)`);
process.exit(failed === 0 ? 0 : 1);
