#!/usr/bin/env node
// verify-quran-migration-v1.mjs — QY-02 kabul kapısı: data.quranJourney V1
// şemasının BOŞ / ESKİ / KISMİ / BOZUK kayıt fixture'larında kayıpsız ve
// idempotent backfill edildiğini headless doğrular.
//
// DATA SAFETY: app.js + yardımcı modüller `node:vm` sandbox'ında, gerçek
// DOM/ağ olmadan boot edilir (verify-zikir-migration-v3.mjs ile birebir aynı
// buildSandbox/loadInto deseni — localStorage yalnız bellek içi bir stub).
// Gerçek tarayıcı açılmaz, sunucu başlatılmaz, seyma-data'ya yazılmaz.
//
// Usage:
//   node .claude/skills/run-seyma/verify-quran-migration-v1.mjs
//
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

function today() { const d = new Date(); const p = n => (n < 10 ? '0' : '') + n; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }
function yesterday() { const d = new Date(Date.now() - 864e5); const p = n => (n < 10 ? '0' : '') + n; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }
const t = today(), y = yesterday();
const TS = '2026-07-29T10:00:00.000Z';

let passed = 0, failed = 0;
function ok(name, cond, detail) {
  if (cond) { passed++; console.log('  ✓ ' + name); }
  else { failed++; console.log('  ✗ ' + name + (detail !== undefined ? ' — ' + JSON.stringify(detail) : '')); }
}

// ── verify-zikir-migration-v3.mjs ile birebir aynı sandbox deseni ──
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
// Katalog modülü BİLEREK bu listede yok: migration'ın katalogsuz da tam
// çalışması gerekir (modül index.html'e QY-05'te bağlanacak).
const FILES = ['motivationProgramV2.js', 'profileAssessmentV1.js', 'saygiPeople.js', 'hijriCalendar.js', 'esmaulHusnaV1.js', 'app.js'];
const FILES_WITH_CATALOG = ['quranRevelationOrderV1.js', ...FILES];

function baseSeed(extra) {
  return Object.assign({
    version: 2, startDate: y, lastOpenedDate: y,
    days: { [t]: { habits: {}, mood: null }, [y]: { habits: {}, mood: 3, note: 'eski not korunmalı' } },
    notifications: [], luna: { qa: [] }, aeon: { qa: [] },
    settings: { nickname: 'Test', ghToken: '', ghRepo: 'mustafaras/seyma-data' },
    cycle: { periods: [], avgCycle: 28, avgPeriod: 5 },
    saygi: { collection: {}, streak: 0, lastReadDate: '' },
  }, extra || {});
}
function boot(seedObj, files) {
  const sb = buildSandbox(seedObj);
  loadInto(sb, files || FILES);
  sb.App.start();
  return { sb, data: JSON.parse(sb.localStorage.getItem('seyma-reset-v1')) };
}

console.log('== QY-02 data.quranJourney V1 şema / kayıpsız migration doğrulaması ==');

// ── 1) BOŞ fixture: hiç quranJourney yok ──
console.log('\n1. Boş fixture (alan hiç yok)');
{
  const { data } = boot(baseSeed());
  const q = data.quranJourney;
  ok('quranJourney otomatik oluşuyor', !!q && typeof q === 'object');
  ok('schemaVersion = 1', q.schemaVersion === 1, q && q.schemaVersion);
  ok('catalogVersion = quran-revelation-tr-v1', q.catalogVersion === 'quran-revelation-tr-v1', q && q.catalogVersion);
  ok('startedAt = null (yolculuk henüz başlamadı)', q.startedAt === null, q && q.startedAt);
  ok('activeSurahId = alak (nüzul 1. durak)', q.activeSurahId === 'alak', q && q.activeSurahId);
  ok('requests boş nesne', q.requests && typeof q.requests === 'object' && Object.keys(q.requests).length === 0);
  ok('katalog modülü YÜKLÜ DEĞİLKEN de migration tam çalıştı', q.schemaVersion === 1 && q.activeSurahId === 'alak');
}

// ── 2) ESKİ fixture: quranJourney'den önceki gerçek kullanıcı verisi ──
console.log('\n2. Eski fixture (kayıpsızlık)');
{
  const seed = baseSeed({ zikr: { schemaVersion: 4, presets: [], journeys: {}, sessions: {}, reflections: [] } });
  const { data } = boot(seed);
  ok('eski gün kaydı korundu (mood)', data.days[y] && data.days[y].mood === 3, data.days[y]);
  ok('eski gün notu korundu', data.days[y] && data.days[y].note === 'eski not korunmalı');
  ok('eski settings.nickname korundu', data.settings.nickname === 'Test');
  ok('eski zikr kökü korundu', data.zikr && data.zikr.schemaVersion === 4);
  ok('quranJourney additive biçimde eklendi', !!data.quranJourney && Object.keys(data.quranJourney.requests).length === 0);
}

// ── 3) KISMİ fixture: alanların bir kısmı var, bir kısmı eksik ──
console.log('\n3. Kısmi fixture (eksik alan tamamlama)');
{
  const seed = baseSeed({
    quranJourney: {
      startedAt: TS,
      requests: {
        alak: { requestId: 'qr_ORNEK1', status: 'awaiting_reply', requestedAt: TS },
        kalem: { requestId: 'qr_ORNEK2', status: 'ready', videoId: 'aaaaaaaaaaa', readyAt: TS, ozelAlan: 'yeni-cihazdan-geldi', notes: [{ id: 'qn_eski', kind: 'listen', videoId: 'aaaaaaaaaaa', timestampSec: '12', tag: 'sabır', text: 'Eski kayıttan gelen not', createdAt: TS } , { id: '', text: 'ayıklanmalı' }] },
      },
    },
  });
  const { data } = boot(seed);
  const q = data.quranJourney;
  ok('eksik schemaVersion tamamlandı', q.schemaVersion === 1);
  ok('eksik catalogVersion tamamlandı', q.catalogVersion === 'quran-revelation-tr-v1');
  ok('eksik activeSurahId varsayılana çekildi', q.activeSurahId === 'alak');
  ok('mevcut startedAt korundu (ezilmedi)', q.startedAt === TS, q.startedAt);
  ok('mevcut requestId korundu', q.requests.alak.requestId === 'qr_ORNEK1');
  ok('mevcut status korundu', q.requests.alak.status === 'awaiting_reply');
  ok('eksik zaman damgaları null ile tamamlandı',
     q.requests.alak.notifiedAt === null && q.requests.alak.watchedAt === null && q.requests.alak.questionOpenedAt === null);
  ok('eksik responseId/videoId null', q.requests.alak.responseId === null && q.requests.alak.videoId === null);
  ok('geçerli videoId korundu', q.requests.kalem.videoId === 'aaaaaaaaaaa');
  ok('eski kayıttaki video notu normalize edilip korunur', q.requests.kalem.notes.length === 1 && q.requests.kalem.notes[0].videoId === 'aaaaaaaaaaa' && q.requests.kalem.notes[0].timestampSec === 12 && q.requests.kalem.notes[0].kind === 'listen');
  ok('bozuk/kimliksiz not migration sırasında ayıklanır', q.requests.kalem.notes.every((n) => n.id && n.text));
  ok('BİLİNMEYEN alan korundu (ileri uyumluluk / cihaz merge)', q.requests.kalem.ozelAlan === 'yeni-cihazdan-geldi');
  ok('iki ayrı sûre isteği de duruyor', Object.keys(q.requests).sort().join(',') === 'alak,kalem');
}

// ── 4) BOZUK fixture: tip hataları, çöp anahtarlar, geçersiz değerler ──
console.log('\n4. Bozuk fixture (çökme yok, temizlik var)');
{
  const badRequests = {
    alak: { status: 'uydurma-durum', requestId: 7, videoId: 'cok-uzun-gecersiz-video-id', requestedAt: TS },
    'gecersiz anahtar!': { status: 'ready' },
    bosluk: null,
    dizi: [1, 2, 3],
    nasr: { status: 'watched', watchedAt: TS, videoId: 'bbbbbbbbbbb' },
  };
  // __proto__'yu JSON.parse ile GERÇEK bir own-property olarak ekle;
  // nesne literali kullanılsaydı prototip ataması olurdu, saldırı yüzeyi değil.
  const seed = baseSeed({
    quranJourney: JSON.parse(JSON.stringify({
      schemaVersion: 'bozuk', catalogVersion: 42, startedAt: 999,
      activeSurahId: 'BÖYLE-BIR-SURE-YOK!!',
      requests: badRequests,
    }).replace('"nasr":', '"__proto__":{"status":"ready"},"nasr":')),
  });
  let threw = false, data = null;
  try { data = boot(seed).data; } catch (e) { threw = true; console.log('    hata: ' + e.message); }
  ok('bozuk fixture app boot’unu çökertmiyor', !threw);
  const q = data && data.quranJourney;
  ok('bozuk schemaVersion 1’e düzeltildi', q && q.schemaVersion === 1, q && q.schemaVersion);
  ok('sayı catalogVersion varsayılana çekildi', q && q.catalogVersion === 'quran-revelation-tr-v1', q && q.catalogVersion);
  ok('sayı startedAt null oldu', q && q.startedAt === null, q && q.startedAt);
  ok('geçersiz activeSurahId varsayılana çekildi', q && q.activeSurahId === 'alak', q && q.activeSurahId);
  ok('slug olmayan anahtar ayıklandı', q && !('gecersiz anahtar!' in q.requests));
  ok('__proto__ anahtarı kayıt olarak sızmadı', q && !Object.prototype.hasOwnProperty.call(q.requests, '__proto__'));
  ok('null kayıt ayıklandı', q && !('bosluk' in q.requests));
  ok('dizi kayıt ayıklandı', q && !('dizi' in q.requests));
  ok('geçerli kayıtlar korundu', q && 'alak' in q.requests && 'nasr' in q.requests);
  ok('geçersiz videoId null’landı', q && q.requests.alak.videoId === null, q && q.requests.alak.videoId);
  ok('sayı requestId null’landı', q && q.requests.alak.requestId === null);
  ok('uydurma status zaman damgasından türetildi (requestedAt → request_error)',
     q && q.requests.alak.status === 'request_error', q && q.requests.alak.status);
  ok('watchedAt taşıyan kayıt watched kaldı (ilerleme geriye gitmedi)',
     q && q.requests.nasr.status === 'watched', q && q.requests.nasr.status);
}

// ── 5) İlerleme geriye gitmiyor: status silinse bile damga kurtarıyor ──
console.log('\n5. İlerleme monotonluğu (status kaybı onarımı)');
{
  const seed = baseSeed({
    quranJourney: {
      requests: {
        alak: { watchedAt: TS, readyAt: TS, videoId: 'ccccccccccc' },   // status YOK
        kalem: { questionOpenedAt: TS, watchedAt: TS },                  // status YOK
        fatiha: { startedWatchingAt: TS, videoId: 'eeeeeeeeeee' },       // status YOK, video VAR
        nas: { notifiedAt: TS },                                         // status YOK
        tin: { videoId: 'ddddddddddd' },                                 // status YOK
        asr: { requestId: 'qr_abcd1234', requestedAt: TS },              // status YOK, yalnız istek
        kadir: { startedWatchingAt: TS },                                // izleniyor ama VİDEO YOK
        kevser: { readyAt: TS },                                         // hazır denmiş ama VİDEO YOK
      },
    },
  });
  const { sb, data } = boot(seed);
  const r = data.quranJourney.requests;
  ok('watchedAt → watched', r.alak.status === 'watched', r.alak.status);
  ok('questionOpenedAt → question_opened', r.kalem.status === 'question_opened', r.kalem.status);
  ok('startedWatchingAt → watching', r.fatiha.status === 'watching', r.fatiha.status);
  ok('notifiedAt → notified', r.nas.status === 'notified', r.nas.status);
  ok('yalnız geçerli videoId → ready', r.tin.status === 'ready', r.tin.status);
  // Onarım, kanıtı olmayan bir ilerlemeyi uydurmamalı: yalnız requestedAt varsa
  // "outbox'a yazıldı" (queued) kanıtı yoktur ve queued retryable olmadığı için
  // kullanıcı o sûrede kalıcı olarak kilitlenirdi.
  ok('yalnız requestedAt → request_error (uydurulmuş queued değil)',
     r.asr.status === 'request_error', r.asr.status);
  // Videoya bağlı durumlar video kanıtı olmadan türetilmemeli.
  ok('videosuz startedWatchingAt → video_unavailable (çıkışsız watching değil)',
     r.kadir.status === 'video_unavailable', r.kadir.status);
  ok('videosuz readyAt → video_unavailable (izlenecek şey olmayan ready değil)',
     r.kevser.status === 'video_unavailable', r.kevser.status);

  // ASIL GÜVENCE: onarılan hiçbir kayıt kullanıcıyı çıkışsız bırakmamalı.
  const stuck = Object.keys(r).filter(id =>
    !sb.App.quranCanRequest(r[id]) && !r[id].videoId && !r[id].watchedAt && !r[id].notifiedAt);
  ok('onarım sonrası hiçbir kayıt "ne video var ne yeniden istenebilir" durumunda değil',
     stuck.length === 0, stuck);
  ok('request_error onarımından yeniden istek gönderilebiliyor',
     sb.App.quranReduce(r.asr, { type: 'request_submit', requestId: 'qr_yeni1234', at: TS }).ok === true);
}

// ── 6) İDEMPOTENS: ikinci migrate derin eşdeğer sonuç vermeli ──
console.log('\n6. İdempotens');
{
  const seed = baseSeed({
    quranJourney: {
      schemaVersion: 'bozuk', startedAt: TS, activeSurahId: 'gecersiz!!',
      requests: {
        alak: { requestId: 'qr_ORNEK1', status: 'uydurma', requestedAt: TS, videoId: 'kotu' },
        nasr: { status: 'watched', watchedAt: TS, videoId: 'bbbbbbbbbbb', ekstra: 1 },
        'cop anahtar!': { status: 'ready' },
      },
    },
  });
  const first = boot(seed).data;
  const second = boot(JSON.parse(JSON.stringify(first))).data;
  ok('ikinci migrate quranJourney’i değiştirmiyor (derin eşdeğer)',
     JSON.stringify(first.quranJourney) === JSON.stringify(second.quranJourney),
     { first: first.quranJourney, second: second.quranJourney });
  const third = boot(JSON.parse(JSON.stringify(second))).data;
  ok('üçüncü migrate de aynı sonucu veriyor',
     JSON.stringify(second.quranJourney) === JSON.stringify(third.quranJourney));
  ok('idempotens turlarında kullanıcı kaydı kaybolmuyor',
     Object.keys(third.quranJourney.requests).sort().join(',') === 'alak,nasr');
  ok('idempotens turlarında bilinmeyen alan hâlâ duruyor', third.quranJourney.requests.nasr.ekstra === 1);
}

// ── 7) Katalog YÜKLÜYKEN: imleç gerçek sûreye çözülmeli, veri korunmalı ──
console.log('\n7. Katalog yüklüyken davranış');
{
  const seed = baseSeed({
    quranJourney: {
      activeSurahId: 'boyle-bir-sure-yok',
      requests: { bilinmeyen: { status: 'watched', watchedAt: TS } },
    },
  });
  const { sb, data } = boot(seed, FILES_WITH_CATALOG);
  ok('katalog modülü sandbox’ta yüklendi', !!sb.QuranRevelationOrderV1 && sb.QuranRevelationOrderV1.totalCount === 114);
  ok('katalogda olmayan activeSurahId ilk sûreye çekildi',
     data.quranJourney.activeSurahId === 'alak', data.quranJourney.activeSurahId);
  ok('katalogda olmayan sûre İSTEĞİ silinmedi (kullanıcı verisi korunur)',
     !!data.quranJourney.requests.bilinmeyen && data.quranJourney.requests.bilinmeyen.status === 'watched');
}

// ── 8) Gizlilik: şema hiçbir secret alanı taşımıyor ──
console.log('\n8. Gizlilik');
{
  const { data } = boot(baseSeed({ quranJourney: { requests: { alak: { requestId: 'qr_ORNEK1', status: 'queued', requestedAt: TS } } } }));
  const blob = JSON.stringify(data.quranJourney);
  ok('quranJourney içinde token/secret alanı yok', !/ghToken|openaiKey|replyToken|password|apiKey/i.test(blob));
  ok('quranJourney içinde e-posta adresi yok', !/@/.test(blob));
  ok('quranJourney içinde telefon numarası yok', !/\d{10,}/.test(blob));
}

console.log(failed === 0 ? `\n✅ Tüm kontroller PASS (${passed}/${passed})` : `\n❌ ${failed} kontrol FAIL (${passed} geçti)`);
process.exitCode = failed === 0 ? 0 : 1;
