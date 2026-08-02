#!/usr/bin/env node
// verify-quran-state-machine.mjs — QY-03 kabul kapısı: Kur’an Yolculuğu saf
// durum makinesinin HER geçerli geçişini, HER reddedilen sıçramasını,
// idempotensini, monotonluğunu ve saflığını (girdi mutasyonu yok) doğrular.
//
// DATA SAFETY: app.js `node:vm` sandbox'ında, gerçek DOM/ağ olmadan boot
// edilir. Gerçek tarayıcı açılmaz, sunucu başlatılmaz, seyma-data'ya yazılmaz.
// Bu harness hiçbir dosyaya yazmaz; yalnız saf fonksiyonları çağırır.
//
// Usage:
//   node .claude/skills/run-seyma/verify-quran-state-machine.mjs
//
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const AT = '2026-07-30T12:00:00.000Z';
const AT2 = '2026-07-30T13:00:00.000Z';
const VID = 'aaaaaaaaaaa';
const VID2 = 'bbbbbbbbbbb';

let passed = 0, failed = 0;
function ok(name, cond, detail) {
  if (cond) { passed++; console.log('  ✓ ' + name); }
  else { failed++; console.log('  ✗ ' + name + (detail !== undefined ? ' — ' + JSON.stringify(detail) : '')); }
}

// ── sandbox (verify-quran-migration-v1.mjs ile aynı desen) ──
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
function makeLS() {
  const store = {};
  return { getItem(k) { return k in store ? store[k] : null; }, setItem(k, v) { store[k] = String(v); }, removeItem(k) { delete store[k]; }, clear() {}, _store: store };
}
function buildSandbox() {
  const sandbox = {
    console, localStorage: makeLS(), document: doc, __SEYMA_TEST_ZIKR__: true,
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
const FILES = ['motivationProgramV2.js', 'profileAssessmentV1.js', 'saygiPeople.js', 'hijriCalendar.js', 'esmaulHusnaV1.js', 'app/core/constants.js', 'app.js'];
const sb = buildSandbox();
{
  const ctx = vm.createContext(sb);
  for (const f of FILES) vm.runInContext(fs.readFileSync(path.join(REPO, f), 'utf8'), ctx, { filename: f });
}
const { quranReduce, quranCanRequest, quranStatusRank, quranNewRequest } = sb.App;

// ── yardımcılar ──
function ev(type, extra) { return Object.assign({ type, at: AT }, extra || {}); }
// Bir isteği hedef duruma taşıyan en kısa geçerli olay zinciri.
const PATH = [
  ['request_submit', { requestId: 'qr_A' }, 'submitting'],
  ['outbox_written', {}, 'queued'],
  ['delivery_receipt', {}, 'notified'],
  ['await_reply', {}, 'awaiting_reply'],
  ['response_received', {}, 'validating_reply'],
  ['response_valid', { responseId: 'qrr_A', videoId: VID }, 'ready'],
  ['watch_start', {}, 'watching'],
  ['watch_complete', {}, 'watched'],
  ['question_open', {}, 'question_opened'],
];
const ERROR_STATES = ['request_error', 'notification_error', 'invalid_reply', 'video_unavailable'];
function happyTo(status) {
  let r = quranNewRequest();
  if (status === 'idle') return r;
  for (const [type, extra, to] of PATH) {
    r = quranReduce(r, ev(type, extra)).request;
    if (to === status) return r;
  }
  throw new Error('ulaşılamayan durum: ' + status);
}
// Hata dallarına ulaşan kısa yollar.
function build(status) {
  if (status === 'request_error') return quranReduce(happyTo('submitting'), ev('outbox_failed')).request;
  if (status === 'notification_error') return quranReduce(happyTo('queued'), ev('delivery_failed')).request;
  if (status === 'invalid_reply') return quranReduce(happyTo('validating_reply'), ev('response_invalid')).request;
  if (status === 'video_unavailable') return quranReduce(happyTo('ready'), ev('video_gone')).request;
  return happyTo(status);
}

console.log('== QY-03 Kur’an Yolculuğu saf durum makinesi doğrulaması ==');

// ── 0) Kurulum sağlaması: yardımcılar gerçekten istenen durumu üretiyor mu? ──
console.log('\n0. Fixture sağlaması');
{
  const all = ['idle', 'submitting', 'queued', 'notified', 'awaiting_reply', 'validating_reply',
    'ready', 'watching', 'watched', 'question_opened'].concat(ERROR_STATES);
  let allOk = true, bad = [];
  for (const st of all) { const r = build(st); if (!r || r.status !== st) { allOk = false; bad.push(st + '→' + (r && r.status)); } }
  ok('14 durumun tamamı fixture olarak üretilebiliyor', allOk, bad);
}

// ── 1) Mutlu yol: her geçerli geçiş ──
console.log('\n1. Mutlu yol — her geçerli geçiş');
{
  let r = quranNewRequest();
  ok('başlangıç idle', r.status === 'idle');
  for (const [type, extra, to] of PATH) {
    const res = quranReduce(r, ev(type, extra));
    ok(`${type} → ${to}`, res.ok && res.changed && res.request.status === to, { reason: res.reason, got: res.request.status });
    r = res.request;
  }
  ok('requestId kaydedildi', r.requestId === 'qr_A');
  ok('responseId kaydedildi', r.responseId === 'qrr_A');
  ok('videoId kaydedildi', r.videoId === VID);
  ok('tüm zaman damgaları doldu',
     !!(r.requestedAt && r.notifiedAt && r.readyAt && r.startedWatchingAt && r.watchedAt && r.questionOpenedAt && r.updatedAt));
}

// ── 2) Hata dalları ve retry ──
console.log('\n2. Hata dalları ve yeniden deneme');
{
  ok('submitting → request_error', build('request_error').status === 'request_error');
  ok('queued → notification_error', build('notification_error').status === 'notification_error');
  ok('validating_reply → invalid_reply', build('invalid_reply').status === 'invalid_reply');
  const vu = build('video_unavailable');
  ok('ready → video_unavailable', vu.status === 'video_unavailable');
  ok('video_gone videoId’yi koruyor (hangi anlatım erişilemiyor bilinsin)', vu.videoId === VID);
  const e5 = quranReduce(happyTo('watching'), ev('video_gone'));
  ok('watching → video_unavailable', e5.ok && e5.request.status === 'video_unavailable');

  for (const st of ERROR_STATES) {
    const res = quranReduce(build(st), ev('request_submit', { requestId: 'qr_RETRY', at: AT2 }));
    ok(`${st} → yeniden istek gönderilebiliyor`, res.ok && res.request.status === 'submitting', { reason: res.reason });
  }
  const retried = quranReduce(build('video_unavailable'), ev('request_submit', { requestId: 'qr_RETRY', at: AT2 })).request;
  ok('yeniden istekte eski video geçmişe taşındı', retried.videoHistory.length === 1 && retried.videoHistory[0].videoId === VID);
  ok('yeniden istekte güncel video temizlendi', retried.videoId === null && retried.responseId === null && retried.readyAt === null);
  ok('yeniden istekte requestId güncellendi', retried.requestId === 'qr_RETRY');
}

// ── 3) Çift gönderim engeli ──
console.log('\n3. Bekleyen istekte çift gönderim engeli');
{
  const pending = ['submitting', 'queued', 'notified', 'awaiting_reply', 'validating_reply', 'ready', 'watching', 'watched', 'question_opened'];
  for (const st of pending) {
    const before = build(st);
    const res = quranReduce(before, ev('request_submit', { requestId: 'qr_YENI', at: AT2 }));
    ok(`${st} durumunda ikinci istek reddedildi`, !res.ok && res.reason === 'request_pending', { reason: res.reason });
    ok(`${st} reddedilince kayıt birebir aynı`, JSON.stringify(res.request) === JSON.stringify(before));
  }
  for (const st of ['idle'].concat(ERROR_STATES)) ok(`quranCanRequest(${st}) = true`, quranCanRequest(build(st)) === true);
  for (const st of pending) ok(`quranCanRequest(${st}) = false`, quranCanRequest(build(st)) === false);
  ok('quranCanRequest(kayıt yok) = true', quranCanRequest(null) === true);
}

// ── 4) Geçersiz sıçramalar: tablo dışındaki HER geçiş reddedilmeli ──
console.log('\n4. Geçersiz sıçramaların reddi');
{
  const cases = [
    ['outbox_written', 'idle'], ['outbox_written', 'request_error'],
    ['outbox_failed', 'idle'], ['outbox_failed', 'queued'],
    ['delivery_receipt', 'idle'], ['delivery_receipt', 'submitting'],
    ['delivery_failed', 'idle'], ['delivery_failed', 'submitting'], ['delivery_failed', 'notified'],
    ['await_reply', 'idle'], ['await_reply', 'submitting'], ['await_reply', 'queued'],
    ['response_received', 'idle'], ['response_received', 'queued'], ['response_received', 'notified'],
    ['response_invalid', 'idle'], ['response_invalid', 'ready'], ['response_invalid', 'awaiting_reply'],
    ['watch_start', 'idle'], ['watch_start', 'awaiting_reply'], ['watch_start', 'video_unavailable'],
    ['watch_complete', 'idle'], ['watch_complete', 'queued'], ['watch_complete', 'video_unavailable'],
    ['video_gone', 'idle'], ['video_gone', 'awaiting_reply'],
    ['question_open', 'idle'], ['question_open', 'ready'], ['question_open', 'watching'],
    ['response_valid', 'idle'], ['response_valid', 'queued'], ['response_valid', 'awaiting_reply'],
  ];
  for (const [type, from] of cases) {
    const before = build(from);
    const res = quranReduce(before, ev(type, { videoId: VID2, responseId: 'qrr_Z', at: AT2 }));
    ok(`${from} –${type}→ reddedildi`, !res.ok && res.reason === 'invalid_transition', { reason: res.reason, got: res.request.status });
    ok(`${from} –${type}→ kayıt değişmedi`, JSON.stringify(res.request) === JSON.stringify(before));
  }
}

// ── 5) İdempotens: aynı olay iki kez ──
console.log('\n5. İdempotens');
{
  const dup = [
    ['submitting', 'request_submit', { requestId: 'qr_A' }, 'duplicate_request'],
    ['queued', 'outbox_written', {}, 'already_queued'],
    ['notified', 'delivery_receipt', {}, 'already_notified'],
    ['awaiting_reply', 'await_reply', {}, 'already_awaiting'],
    ['validating_reply', 'response_received', {}, 'already_validating'],
    ['watching', 'watch_start', {}, 'already_watching'],
    ['watched', 'watch_complete', {}, 'already_watched'],
    ['question_opened', 'question_open', {}, 'already_opened'],
  ];
  for (const [st, type, extra, reason] of dup) {
    const before = build(st);
    const res = quranReduce(before, ev(type, Object.assign({ at: AT2 }, extra)));
    ok(`${st} durumunda tekrar ${type} → değişiklik yok`, res.ok && res.changed === false && res.reason === reason, { reason: res.reason });
    ok(`${st} tekrarında kayıt birebir aynı`, JSON.stringify(res.request) === JSON.stringify(before));
  }
  const readyState = build('ready');
  const again = quranReduce(readyState, ev('response_valid', { responseId: 'qrr_A', videoId: VID, at: AT2 }));
  ok('aynı responseId ikinci kez → değişiklik yok', again.ok && !again.changed && again.reason === 'duplicate_response');
  ok('aynı responseId tekrarında videoHistory büyümedi', again.request.videoHistory.length === readyState.videoHistory.length);
}

// ── 6) Monotonluk: ready/watched geriye gitmez ──
console.log('\n6. Monotonluk (ilerleme geriye gitmez)');
{
  const w = build('watched');
  const gone = quranReduce(w, ev('video_gone', { at: AT2 }));
  ok('watched iken video_gone durumu düşürmüyor', gone.ok && !gone.changed && gone.reason === 'watched_is_final');
  ok('watched iken video_gone watchedAt’i silmiyor', gone.request.watchedAt === w.watchedAt);

  const q = build('question_opened');
  const gone2 = quranReduce(q, ev('video_gone', { at: AT2 }));
  ok('question_opened iken video_gone durumu düşürmüyor', gone2.ok && !gone2.changed && gone2.request.status === 'question_opened');

  // Yeni geçerli anlatım: video tazelenir ama durum ready'e DÜŞMEZ.
  const sup = quranReduce(w, ev('response_valid', { responseId: 'qrr_YENI', videoId: VID2, at: AT2 }));
  ok('watched iken yeni anlatım → supersede', sup.ok && sup.changed && sup.reason === 'video_superseded');
  ok('supersede durumu watched bırakıyor', sup.request.status === 'watched', sup.request.status);
  ok('supersede yeni videoId’yi yazıyor', sup.request.videoId === VID2);
  ok('supersede eski videoyu geçmişe taşıyor', sup.request.videoHistory.length === 1 && sup.request.videoHistory[0].videoId === VID);
  ok('supersede watchedAt’i koruyor', sup.request.watchedAt === w.watchedAt);

  const rank = quranStatusRank;
  ok('rütbe sırası doğru', rank('idle') < rank('queued') && rank('queued') < rank('ready') && rank('ready') < rank('watched') && rank('watched') < rank('question_opened'));
  ok('hata durumu kardeşiyle aynı rütbede', rank('video_unavailable') === rank('ready') && rank('notification_error') === rank('queued'));
  ok('bilinmeyen durum rütbesi -1', rank('yok-boyle-durum') === -1);
}

// ── 7) videoId doğrulaması ──
console.log('\n7. videoId doğrulaması (doğrulanmamış kimlik yayına giremez)');
{
  const v = build('validating_reply');
  for (const bad of ['', 'kisa', 'cok-uzun-video-kimligi', 'aaaaaaaaaa/', null, undefined, 12345, 'aaaaaaaaaa ']) {
    const res = quranReduce(v, ev('response_valid', { responseId: 'qrr_B', videoId: bad, at: AT2 }));
    ok(`geçersiz videoId reddedildi (${JSON.stringify(bad)})`, !res.ok && res.reason === 'invalid_video_id', res.reason);
  }
  const good = quranReduce(v, ev('response_valid', { responseId: 'qrr_B', videoId: VID2, at: AT2 }));
  ok('geçerli videoId kabul edildi', good.ok && good.request.status === 'ready' && good.request.videoId === VID2);
  const supBad = quranReduce(build('watched'), ev('response_valid', { responseId: 'qrr_B', videoId: 'kotu', at: AT2 }));
  ok('supersede yolunda da geçersiz videoId reddediliyor', !supBad.ok && supBad.reason === 'invalid_video_id');
}

// ── 8) Saflık: girdi mutasyona uğramıyor ──
console.log('\n8. Saflık');
{
  const before = build('ready');
  const snapshot = JSON.stringify(before);
  const res = quranReduce(before, ev('watch_start', { at: AT2 }));
  ok('girdi nesnesi değişmedi', JSON.stringify(before) === snapshot);
  ok('dönen nesne yeni bir referans', res.request !== before);
  ok('videoHistory dizisi paylaşılmıyor', res.request.videoHistory !== before.videoHistory);

  const a = quranReduce(build('validating_reply'), ev('response_valid', { responseId: 'qrr_C', videoId: VID2, at: AT2 }));
  const b = quranReduce(build('validating_reply'), ev('response_valid', { responseId: 'qrr_C', videoId: VID2, at: AT2 }));
  ok('aynı girdi + aynı olay → birebir aynı çıktı (deterministik)', JSON.stringify(a.request) === JSON.stringify(b.request));
  ok('bilinmeyen alan geçişte korunuyor',
     quranReduce(Object.assign(build('ready'), { ozelAlan: 'x' }), ev('watch_start', { at: AT2 })).request.ozelAlan === 'x');
}

// ── 9) Bozuk/eksik olaylar ──
console.log('\n9. Bozuk olay girdileri');
{
  const r = build('ready');
  ok('bilinmeyen olay reddedildi', quranReduce(r, ev('uydurma_olay')).reason === 'unknown_event');
  ok('olay nesnesi değilse reddedildi', quranReduce(r, null).reason === 'invalid_event');
  ok('olay dizi ise reddedildi', quranReduce(r, []).reason === 'invalid_event');
  ok('zaman damgası yoksa reddedildi', quranReduce(r, { type: 'watch_start' }).reason === 'missing_timestamp');
  ok('boş zaman damgası reddedildi', quranReduce(r, { type: 'watch_start', at: '' }).reason === 'missing_timestamp');
  ok('reddedilen olayda kayıt değişmedi', quranReduce(r, { type: 'watch_start' }).request === r);
  const broken = quranReduce({ status: 'uydurma-durum' }, ev('request_submit', { requestId: 'qr_X' }));
  ok('bozuk status idle sayılıp istek kabul edildi', broken.ok && broken.request.status === 'submitting', broken.reason);
  const noReq = quranReduce(undefined, ev('request_submit', { requestId: 'qr_X' }));
  ok('kayıt hiç yokken istek oluşturulabiliyor', noReq.ok && noReq.request.status === 'submitting' && noReq.request.requestId === 'qr_X');
}

// ── 10) videoHistory sınırı ──
console.log('\n10. videoHistory sınırı');
{
  let r = build('ready');
  for (let i = 0; i < 30; i++) {
    r = quranReduce(r, ev('video_gone', { at: AT2 })).request;
    r = quranReduce(r, ev('response_valid', { responseId: 'qrr_' + i, videoId: VID2, at: AT2 })).request;
  }
  ok('videoHistory 20 kayıtla sınırlı (sync şişmesin)', r.videoHistory.length <= 20, r.videoHistory.length);
  ok('sınırda en yeni kayıtlar tutuluyor', r.videoHistory[r.videoHistory.length - 1].videoId === VID2);
}

console.log(failed === 0 ? `\n✅ Tüm kontroller PASS (${passed}/${passed})` : `\n❌ ${failed} kontrol FAIL (${passed} geçti)`);
process.exitCode = failed === 0 ? 0 : 1;
