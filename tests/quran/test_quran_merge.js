// test_quran_merge.js — QY-16 kabul kapısı: Kur’an Yolculuğu çoklu cihaz
// birleştirmesi (sync.js `mergeQuranJourney`/`mergeQuranRequest`, ve bunların
// gerçekte kullanıldığı üst seviye `mergeData`). GERÇEK AĞ ÇAĞRISI YOK — fetch
// hiç çağrılmamalı; tüm testler saf fonksiyonları doğrudan çağırır.
//
// Plan §13 "Birleştirme kuralları" + QY-16'nın 7 senaryosu (SENARYOLAR/KABUL):
//   1. A cihazı istek gönderir, B bayat kalır.
//   2. Cevap geldiğinde B eski state push eder.
//   3. A watched, B ready.
//   4. İki farklı sûre iki cihazda istenir.
//   5. Aynı request iki response alır.
//   6. Video değiştirilir.
//   7. Offline istek sonra gönderilir.
// KABUL: Hiçbir senaryoda watched/ready geriye gitmez, request/video kaybolmaz.
//
// Çalıştırma: node tests/quran/test_quran_merge.js

'use strict';
var fs = require('fs');
var path = require('path');
var repoRoot = require('../repo-root');

// ── Mock ortam: sync.js window/localStorage/fetch bekler (test_faz10_sync.js
// ile AYNI desen). fetch hiç çağrılmamalı — bu dosya yalnız saf fonksiyonları
// doğrudan çağırır, hiçbir push/pull tetiklemez.
var _ls = {};
global.localStorage = {
  getItem: function (k) { return Object.prototype.hasOwnProperty.call(_ls, k) ? _ls[k] : null; },
  setItem: function (k, v) { _ls[k] = String(v); },
  removeItem: function (k) { delete _ls[k]; },
  clear: function () { _ls = {}; }
};
global.window = { addEventListener: function () {}, SeySync: null };
global.document = { getElementById: function () { return null; } };
global.location = { protocol: 'https:', hostname: 'example.com', search: '' };
var _fetchCalls = [];
global.fetch = function (url, opts) {
  _fetchCalls.push({ url: url, opts: opts });
  return Promise.reject(new Error('TEST: fetch çağrılmamalı — bu dosya yalnız saf merge fonksiyonlarını test eder'));
};
if (typeof TextEncoder === 'undefined') { global.TextEncoder = require('util').TextEncoder; }
if (typeof TextDecoder === 'undefined') { global.TextDecoder = require('util').TextDecoder; }

  eval(fs.readFileSync(path.join(repoRoot, 'sync.js'), 'utf8'));
var S = global.window.SeySync;

var pass = 0, fail = 0;
function ok(cond, label, detail) {
  if (cond) { pass++; return true; }
  fail++;
  console.error('  ✗ ' + label + (detail !== undefined ? ' — ' + JSON.stringify(detail) : ''));
  return false;
}
function section(t) { console.log('\n' + t); }

if (typeof S.mergeQuranJourney !== 'function' || typeof S.mergeData !== 'function') {
  console.error('HATA: window.SeySync.mergeQuranJourney/mergeData bulunamadı! sync.js yüklenemedi.');
  process.exit(1);
}

// ── sabitler / yardımcılar ──────────────────────────────────────────────────
var T0 = '2026-07-30T08:00:00.000Z';
var T1 = '2026-07-30T09:00:00.000Z';
var T1_5 = '2026-07-30T09:30:00.000Z';
var T2 = '2026-07-30T10:00:00.000Z';
var T3 = '2026-07-30T11:00:00.000Z';

function req(overrides) {
  var base = {
    requestId: null, status: 'idle', requestedAt: null, notifiedAt: null,
    responseId: null, videoId: null, readyAt: null, startedWatchingAt: null,
    watchedAt: null, questionOpenedAt: null, updatedAt: null, videoHistory: []
    ,notes:[],lastNoteAt:null
  };
  if (overrides) for (var k in overrides) base[k] = overrides[k];
  return base;
}
function journey(requests, overrides) {
  var base = { schemaVersion: 1, catalogVersion: 'quran-revelation-tr-v1', startedAt: null, activeSurahId: 'alak', requests: requests || {} };
  if (overrides) for (var k in overrides) base[k] = overrides[k];
  return base;
}
function clone(v) { return JSON.parse(JSON.stringify(v)); }

console.log('\n=== QY-16 — Kur’an Yolculuğu çoklu cihaz birleştirme testleri ===\n');

// ── 1. A cihazı istek gönderir, B bayat kalır ───────────────────────────────
section('1. A cihazı istek gönderir, B bayat kalır');
(function () {
  var bLocal = journey({});
  var aRemote = journey({ alak: req({ requestId: 'qr_a1', status: 'queued', requestedAt: T1, updatedAt: T1 }) });
  var merged = S.mergeQuranJourney(bLocal, aRemote);
  ok(!!merged.requests.alak, 'B, A’nın isteğini kaybetmeden devralır');
  ok(merged.requests.alak && merged.requests.alak.status === 'queued', 'durum doğru taşınır (queued)');
  ok(merged.requests.alak && merged.requests.alak.requestId === 'qr_a1', 'requestId korunur');
})();

// ── 2. Cevap geldiğinde B eski state push eder ──────────────────────────────
section('2. Cevap geldiğinde B eski state push eder');
(function () {
  var bLocal = journey({ alak: req({ requestId: 'qr_2', status: 'notified', requestedAt: T1, notifiedAt: T1, updatedAt: T1 }) });
  var aRemote = journey({ alak: req({ requestId: 'qr_2', status: 'ready', requestedAt: T1, notifiedAt: T1, readyAt: T2, responseId: 'qrr_2', videoId: 'videoREADY1', updatedAt: T2 }) });
  var merged = S.mergeQuranJourney(bLocal, aRemote);
  var r = merged.requests.alak;
  ok(r.status === 'ready', 'B’nin bayat "notified"i A’nın "ready"sini geriletmiyor');
  ok(r.videoId === 'videoREADY1', 'gelen video kimliği korunur');
  ok(r.notifiedAt === T1, 'daha önceki notifiedAt damgası kaybolmaz');
})();

// ── 3. A watched, B ready (iki yönde de) ────────────────────────────────────
section('3. A watched, B ready — durum hiçbir yönde geriye gitmez');
(function () {
  var readyReq = req({ requestId: 'qr_3', status: 'ready', responseId: 'qrr_3', videoId: 'videoREADY3', readyAt: T1, updatedAt: T1 });
  var watchedReq = req({ requestId: 'qr_3', status: 'watched', responseId: 'qrr_3', videoId: 'videoREADY3', readyAt: T1, startedWatchingAt: T2, watchedAt: T3, updatedAt: T3 });

  var m1 = S.mergeQuranJourney(journey({ alak: clone(readyReq) }), journey({ alak: clone(watchedReq) }));
  ok(m1.requests.alak.status === 'watched', 'yön 1 (local=ready, remote=watched) → watched kazanır');
  ok(m1.requests.alak.watchedAt === T3, 'yön 1: watchedAt korunur');

  var m2 = S.mergeQuranJourney(journey({ alak: clone(watchedReq) }), journey({ alak: clone(readyReq) }));
  ok(m2.requests.alak.status === 'watched', 'yön 2 (local=watched, remote=ready) → watched hâlâ kazanır (sıradan bağımsız)');
  ok(m2.requests.alak.watchedAt === T3, 'yön 2: watchedAt bayat cihaz tarafından silinmez');
})();

// ── 4. İki farklı sûre iki cihazda istenir ──────────────────────────────────
section('4. İki farklı sûre iki cihazda istenir — union, hiçbiri kaybolmaz');
(function () {
  var bLocal = journey({ fatiha: req({ requestId: 'qr_f', status: 'queued', requestedAt: T1, updatedAt: T1 }) });
  var aRemote = journey({ alak: req({ requestId: 'qr_a4', status: 'queued', requestedAt: T1, updatedAt: T1 }) });
  var merged = S.mergeQuranJourney(bLocal, aRemote);
  ok(!!merged.requests.fatiha, 'yerel sûre (fatiha) korunur');
  ok(!!merged.requests.alak, 'uzak sûre (alak) da eklenir');
  ok(Object.keys(merged.requests).length === 2, 'toplam iki ayrı istek — hiçbiri diğerini ezmez');
})();

// ── 5. Aynı request iki response alır (eşit rütbe → updatedAt LWW) ─────────
section('5. Aynı request iki response alır — eşit rütbede en yeni video kazanır');
(function () {
  var older = req({ requestId: 'qr_5', status: 'ready', responseId: 'qrr_5old', videoId: 'videoOLDONE1', readyAt: T1, updatedAt: T1 });
  var newer = req({ requestId: 'qr_5', status: 'ready', responseId: 'qrr_5new', videoId: 'videoNEWONE1', readyAt: T2, updatedAt: T2 });

  var m1 = S.mergeQuranJourney(journey({ alak: clone(older) }), journey({ alak: clone(newer) }));
  ok(m1.requests.alak.videoId === 'videoNEWONE1', 'remote daha yeniyse (updatedAt) remote’un videosu kazanır');

  var m2 = S.mergeQuranJourney(journey({ alak: clone(newer) }), journey({ alak: clone(older) }));
  ok(m2.requests.alak.videoId === 'videoNEWONE1', 'local daha yeniyse local’in videosu kazanır (bayat remote geriletmiyor)');
})();

// ── 6. Video değiştirilir — videoHistory kaybolmadan birleşir ──────────────
section('6. Video değiştirilir — her iki cihazın geçmişi de korunur');
(function () {
  var localReq = req({
    requestId: 'qr_6', status: 'ready', responseId: 'qrr_6', videoId: 'videoCURRENT', readyAt: T2, updatedAt: T2,
    videoHistory: [{ videoId: 'videoLOCALHIS', responseId: 'qrr_6a', readyAt: T0, replacedAt: T1, reason: 'yeniden istendi' }]
  });
  var remoteReq = req({
    requestId: 'qr_6', status: 'ready', responseId: 'qrr_6', videoId: 'videoCURRENT', readyAt: T2, updatedAt: T2,
    videoHistory: [{ videoId: 'videoREMOTEHIS', responseId: 'qrr_6b', readyAt: T0, replacedAt: T1_5, reason: 'yeni anlatım geldi' }]
  });
  var merged = S.mergeQuranJourney(journey({ alak: localReq }), journey({ alak: remoteReq }));
  var hist = merged.requests.alak.videoHistory;
  ok(hist.length === 2, 'iki cihazın da arşivlediği eski videolar birlikte kalır (2 kayıt)', hist);
  ok(hist.some(function (h) { return h.videoId === 'videoLOCALHIS'; }), 'yerel cihazın arşivi kaybolmaz');
  ok(hist.some(function (h) { return h.videoId === 'videoREMOTEHIS'; }), 'uzak cihazın arşivi kaybolmaz');
  ok(merged.requests.alak.videoId === 'videoCURRENT', 'güncel video değişmeden kalır');
})();

// ── 7b. Notlar — iki cihazdan union + aynı id için yeni sürüm ──────────────
section('7b. Video notları iki cihazda birleşir, eski cihaz ezemez');
(function () {
  var oldNote = { id:'qn_same', kind:'watch', timestampSec:12, text:'eski metin', createdAt:T1, updatedAt:T1 };
  var newNote = { id:'qn_same', kind:'listen', timestampSec:18, text:'güncellenmiş metin', createdAt:T1, updatedAt:T2 };
  var remoteOnly = { id:'qn_remote', kind:'reflection', timestampSec:null, text:'uzak cihaz notu', createdAt:T2, updatedAt:T2 };
  var localReq = req({ requestId:'qr_notes', status:'watching', videoId:'videoNOTES01', updatedAt:T2, notes:[oldNote] });
  var remoteReq = req({ requestId:'qr_notes', status:'watching', videoId:'videoNOTES01', updatedAt:T2, notes:[newNote,remoteOnly], lastNoteAt:T2 });
  var merged = S.mergeQuranJourney(journey({ alak:localReq }), journey({ alak:remoteReq })).requests.alak;
  ok(merged.notes.length === 2, 'aynı id tekilleşir, farklı not korunur', merged.notes);
  ok(merged.notes.some(function(n){ return n.id==='qn_same'&&n.text==='güncellenmiş metin'&&n.kind==='listen'; }), 'aynı notun daha yeni sürümü kazanır');
  ok(merged.notes.some(function(n){ return n.id==='qn_remote'; }), 'diğer cihazın yeni notu union ile gelir');
  ok(merged.lastNoteAt === T2, 'lastNoteAt en yeni damgayı taşır', merged.lastNoteAt);
})();

// ── 7. Offline istek sonra gönderilir ───────────────────────────────────────
section('7. Offline istek sonra gönderilir — uzakta hiç yokken bile kaybolmaz');
(function () {
  var bLocalOffline = journey({ alak: req({ requestId: 'qr_offline', status: 'queued', requestedAt: T1, updatedAt: T1 }) });
  var remoteEmpty = journey({});
  var merged = S.mergeQuranJourney(bLocalOffline, remoteEmpty);
  ok(!!merged.requests.alak, 'çevrimdışı iken oluşturulan istek, uzakta karşılığı olmasa bile korunur');
  ok(merged.requests.alak.status === 'queued', 'durumu bozulmadan kalır');
})();

// ── 8. Üst seviye mergeData ile gerçek kablo bağlantısı (regresyon kanıtı) ──
// KEŞİF: bu faza kadar mergeData quranJourney'e HİÇ dokunmuyordu — iki tarafta
// da alan zaten var olduğu için "remote'de olup local'de olmayanı ekle" yedeği
// de devreye girmiyordu. Bu test doğrudan izole mergeQuranJourney'i değil,
// gerçekte kullanılan mergeData/putLatestGuarded yolunu kanıtlar.
section('8. mergeData (gerçekte push öncesi çağrılan üst seviye fonksiyon)');
(function () {
  var localData = { settings: {}, days: {}, quranJourney: journey({ alak: req({ requestId: 'qr_8', status: 'notified', requestedAt: T1, notifiedAt: T1, updatedAt: T1 }) }) };
  var remoteData = { settings: {}, days: {}, quranJourney: journey({ alak: req({ requestId: 'qr_8', status: 'ready', requestedAt: T1, notifiedAt: T1, readyAt: T2, videoId: 'videoREADY8', updatedAt: T2 }) }) };
  var merged = S.mergeData(localData, remoteData);
  ok(!!merged.quranJourney, 'mergeData sonucu quranJourney alanını içeriyor');
  ok(merged.quranJourney.requests.alak.status === 'ready', 'mergeData ÜZERİNDEN de durum geriye gitmiyor — gerçek yol kanıtlandı');

  // eski (QY-02 öncesi) yerel kayıt: quranJourney hiç yok — remote'dekini olduğu gibi devralmalı
  var oldLocal = { settings: {}, days: {} };
  var merged2 = S.mergeData(oldLocal, remoteData);
  ok(!!merged2.quranJourney && merged2.quranJourney.requests.alak.status === 'ready', 'quranJourney hiç olmayan eski kayıt, remote’unkini kayıpsız devralır');
})();

// ── 9. Sağlamlık — boş/eksik girdi çökme üretmez ────────────────────────────
section('9. Sağlamlık — null/undefined quranJourney çökme üretmez');
(function () {
  var threw = false;
  var out;
  try { out = S.mergeQuranJourney(null, null); } catch (e) { threw = true; }
  ok(!threw, 'iki taraf da boşsa çökmez');
  ok(out && typeof out === 'object', 'boş girdi güvenli bir nesne döner');

  var onlyRemote = S.mergeQuranJourney(null, journey({ alak: req({ status: 'queued' }) }));
  ok(!!onlyRemote.requests.alak, 'yerel yoksa uzak aynen devralınır');

  var onlyLocal = S.mergeQuranJourney(journey({ alak: req({ status: 'queued' }) }), null);
  ok(!!onlyLocal.requests.alak, 'uzak yoksa yerel korunur');
})();

// ── 10. İdempotens ve sıradan bağımsızlık ───────────────────────────────────
section('10. İdempotens — aynı durumu kendisiyle birleştirmek veri üretmez/kaybetmez');
(function () {
  var j = journey({
    alak: req({
      requestId: 'qr_10', status: 'watched', responseId: 'qrr_10', videoId: 'videoIDEMPOT1',
      readyAt: T1, startedWatchingAt: T2, watchedAt: T3, updatedAt: T3,
      videoHistory: [{ videoId: 'videoOLDIDEM1', responseId: 'qrr_10a', readyAt: T0, replacedAt: T1, reason: 'yeniden istendi' }]
    })
  });
  var merged = S.mergeQuranJourney(clone(j), clone(j));
  ok(merged.requests.alak.status === 'watched', 'kendisiyle birleşince durum değişmez');
  ok(merged.requests.alak.videoHistory.length === 1, 'kendisiyle birleşince video geçmişi çoğalmaz (dedupe çalışıyor)', merged.requests.alak.videoHistory);
})();

// ── 11. Rütbe tablosu app.js ile sürüklenmemiş (drift denetimi) ────────────
// sync.js kasıtlı olarak app.js'e bağımlı değil (ayrı modül), bu yüzden
// QURAN_RANK app.js'te, QURAN_RANK_S sync.js'te AYRI AYRI tanımlı. Bu test
// ikisinin metinden çıkarılan halinin birebir aynı kaldığını kanıtlar — biri
// güncellenip diğeri unutulursa (örn. yeni bir durum eklenirse) burada patlar.
section('11. QURAN_RANK (app.js) ile QURAN_RANK_S (sync.js) sürüklenmemiş');
(function () {
  var appSrc = fs.readFileSync(path.join(repoRoot, 'app.js'), 'utf8');
  var syncSrc = fs.readFileSync(path.join(repoRoot, 'sync.js'), 'utf8');
  var appMatch = appSrc.match(/var QURAN_RANK=(\{[^}]*\});/);
  var syncMatch = syncSrc.match(/var QURAN_RANK_S=(\{[^}]*\});/);
  ok(!!appMatch, 'app.js içinde QURAN_RANK bulunuyor');
  ok(!!syncMatch, 'sync.js içinde QURAN_RANK_S bulunuyor');
  if (appMatch && syncMatch) {
    /* eslint-disable no-eval */
    var appRank = eval('(' + appMatch[1] + ')');
    var syncRank = eval('(' + syncMatch[1] + ')');
    ok(JSON.stringify(appRank) === JSON.stringify(syncRank), 'iki tablo birebir aynı — biri güncellenip diğeri unutulmamış', { app: appRank, sync: syncRank });
  }
})();

section('12. Ağ izolasyonu');
ok(_fetchCalls.length === 0, 'hiçbir fetch çağrısı yapılmadı (tamamen saf fonksiyon testi)');

console.log('\n' + (fail === 0 ? '✅' : '❌') + ' Kur’an Yolculuğu çoklu cihaz birleştirme: ' + pass + '/' + (pass + fail) + ' geçti');
process.exit(fail === 0 ? 0 : 1);
