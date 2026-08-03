// test_quran_outbox_sync.js — QY-08 kabul kapısı: Kur’an Yolculuğu istek
// outbox yazıcısının (sync.js `pushQuranRequest`) mock-fetch testleri.
// GERÇEK AĞ ÇAĞRISI YOK — `fetch` tamamen sahte, hiçbir dosyaya/repoya yazılmaz.
//
// Kapsam (KRİTİK gereksinimler QY-08'den birebir):
//   · yol            — yalnız data/quran-request-outbox.json'a yazılır,
//                       data/latest.json'a HİÇ dokunulmaz.
//   · payload         — outbox içeriği QuranTransportV1 sözleşmesine uyar;
//                       GitHub token hiçbir JSON gövdesine girmez (yalnız
//                       Authorization header'ında).
//   · retry           — 409/422 çakışmasında sha yeniden okunup sınırlı
//                       sayıda yeniden denenir; sınır aşılırsa hata döner.
//   · duplicate       — aynı requestId ikinci kez gönderilse tek anahtar
//                       kalır; farklı sûreler birbirini EZMEZ.
//   · offline         — fetch reddi güvenli hataya düşer, çökme/asılı kalma yok.
//   · izolasyon       — Guard 1 (dev-origin) aynen uygulanır; Guard 2
//                       (anti-clobber) burada kapsam dışıdır, zayıflatılmaz.
//
// Çalıştırma: node tests/test_quran_outbox_sync.js

'use strict';
var fs = require('fs');
var path = require('path');
var repoRoot = require('./repo-root');

if (typeof TextEncoder === 'undefined') { global.TextEncoder = require('util').TextEncoder; }
if (typeof TextDecoder === 'undefined') { global.TextDecoder = require('util').TextDecoder; }

var passed = 0, failed = 0;
function ok(name, cond, detail) {
  if (cond) { passed++; console.log('  ✓ ' + name); }
  else { failed++; console.log('  ✗ ' + name + (detail !== undefined ? ' — ' + JSON.stringify(detail) : '')); }
}
function section(t) { console.log('\n' + t); }

// ── Mock ortam: her testte sıfırdan kurulur (fetch çağrı geçmişi bulaşmasın) ──
var TOKEN = 'ghp_test_token_do_not_use';
var _fetchCalls, _fetchQueue;

function b64(str) { var bytes = new TextEncoder().encode(str); var bin = ''; for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]); return Buffer.from(bin, 'binary').toString('base64'); }
function mockRes(init) {
  return Object.assign({
    ok: true, status: 200,
    json: function () { return Promise.resolve(init.jsonBody); },
    text: function () { return Promise.resolve(init.textBody || ''); },
  }, init);
}
function ghContentBody(obj) { return { status: 200, jsonBody: { sha: 'sha-' + Object.keys((obj && obj.requests) || {}).length, content: b64(JSON.stringify(obj)) } }; }

function setup(seedOutbox, opts) {
  opts = opts || {};
  var ls = {};
  ls['seyma-reset-v1'] = JSON.stringify({
    settings: {
      ghToken: opts.noToken ? '' : TOKEN,
      ghRepo: opts.noRepo ? '' : 'owner/repo',
      ghBranch: 'main',
    },
  });
  global.localStorage = {
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(ls, k) ? ls[k] : null; },
    setItem: function (k, v) { ls[k] = String(v); },
    removeItem: function (k) { delete ls[k]; },
    clear: function () { ls = {}; },
  };
  global.location = { protocol: opts.protocol || 'https:', hostname: opts.hostname || 'mustafaras.github.io', search: '' };
  global.window = { addEventListener: function () {}, SeySync: null };
  global.document = { getElementById: function () { return null; } };

  _fetchCalls = [];
  _fetchQueue = (opts.queue || []).slice();
  if (seedOutbox) _fetchQueue.unshift(ghContentBody(seedOutbox));
  global.fetch = function (url, reqOpts) {
    var call = { url: url, opts: reqOpts || {} };
    _fetchCalls.push(call);
    var next = _fetchQueue.shift();
    if (typeof next === 'function') return next(call);
    if (next && next.reject) return Promise.reject(next.reject);
    return Promise.resolve(mockRes(next || { status: 404 }));
  };

  // quranTransportV1 önce yüklenmeli (window.QuranTransportV1 kurulur), sonra sync.js.
  var transportSrc = fs.readFileSync(path.join(repoRoot, 'quranTransportV1.js'), 'utf8');
  eval(transportSrc);
  var syncSrc = fs.readFileSync(path.join(repoRoot, 'sync.js'), 'utf8');
  eval(syncSrc);
  return global.window.SeySync;
}

function decodePutBody(call) {
  var body = JSON.parse(call.opts.body);
  var bin = Buffer.from(body.content, 'base64').toString('binary');
  var bytes = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { outer: body, inner: JSON.parse(new TextDecoder().decode(bytes)) };
}
function isPut(call) { return call.opts && call.opts.method === 'PUT'; }
function isGet(call) { return !call.opts || !call.opts.method; }

var T = null; // QuranTransportV1 — ilk setup() çağrısı sonrası atanır
function payloadFor(id, surahId, order, name) {
  return { schemaVersion: 1, requestId: id, surahId: surahId, revelationOrder: order, mushafOrder: 10, surahName: name, requestedAt: '2026-07-31T09:00:00.000Z' };
}
function emptyOutbox() { return { schemaVersion: 1, updatedAt: null, requests: {} }; }

console.log('\n=== QY-08 — Kur’an Yolculuğu outbox yazıcısı (mock fetch) ===\n');

// ── 1) Yol: yalnız outbox dosyası, latest.json'a hiç dokunulmaz ────────────
section('1. Yol izolasyonu');
var p1 = (function () {
  var S = setup(null);
  T = global.window.QuranTransportV1;
  return S.pushQuranRequest(payloadFor('qr_' + 'a'.repeat(24), 'alak', 1, 'Alak'), function (err) {
    ok('callback hatasız çağrıldı', !err, err && err.message);
    ok('tam olarak 2 fetch çağrısı (GET+PUT)', _fetchCalls.length === 2, _fetchCalls.length);
    var getCall = _fetchCalls[0], putCall = _fetchCalls[1];
    ok('ilk çağrı GET (method yok)', isGet(getCall));
    ok('ikinci çağrı PUT', isPut(putCall));
    ok('GET yolu data/quran-request-outbox.json', getCall.url.indexOf('/contents/data/quran-request-outbox.json') >= 0, getCall.url);
    ok('PUT yolu data/quran-request-outbox.json', putCall.url.indexOf('/contents/data/quran-request-outbox.json') >= 0, putCall.url);
    ok('hiçbir çağrı data/latest.json’a gitmedi', _fetchCalls.every(function (c) { return c.url.indexOf('latest.json') < 0; }));
    ok('hiçbir çağrı data/gunluk’a gitmedi', _fetchCalls.every(function (c) { return c.url.indexOf('gunluk') < 0; }));
  });
})();

p1.then(function () {
// ── 2) Payload sözleşmesi + secret sızıntı denetimi ─────────────────────────
section('2. Payload sözleşmesi ve secret izolasyonu');
return (function () {
  var S = setup(null);
  return S.pushQuranRequest(payloadFor('qr_' + 'b'.repeat(24), 'fatiha', 5, 'Fâtiha'), function (err) {
    ok('başarıyla tamamlandı', !err, err && err.message);
    var putCall = _fetchCalls[1];
    var decoded = decodePutBody(putCall);
    var entry = decoded.inner.requests['qr_' + 'b'.repeat(24)];
    ok('schemaVersion 1', decoded.inner.schemaVersion === 1);
    ok('requestId anahtar ile eşleşiyor', !!entry && entry.requestId === 'qr_' + 'b'.repeat(24));
    ok('surahId doğru', !!entry && entry.surahId === 'fatiha');
    ok('revelationOrder doğru', !!entry && entry.revelationOrder === 5);
    ok('mushafOrder korunuyor (QY-09 e-posta gövdesi için gerekli)', !!entry && entry.mushafOrder === 10, entry && entry.mushafOrder);
    ok('surahName doğru', !!entry && entry.surahName === 'Fâtiha');
    ok('requestedAt doğru', !!entry && entry.requestedAt === '2026-07-31T09:00:00.000Z');
    ok('replyToken üretildi ve QY-04 sözleşmesine uyuyor', !!entry && T.isValidReplyToken(entry.replyToken), entry && entry.replyToken);
    ok('yazılan defter QuranTransportV1.parseOutbox’tan hatasız geçiyor',
      T.parseOutbox(JSON.stringify(decoded.inner)).ok);

    var outerStr = JSON.stringify(decoded.outer);
    ok('GitHub token PUT gövdesinde YOK', outerStr.indexOf(TOKEN) < 0);
    ok('replyToken alan adı iç içerikte var (beklenen — outbox’un amacı)', JSON.stringify(decoded.inner).indexOf('replyToken') >= 0);
    ok('Authorization header’ında token VAR (yalnızca burada taşınmalı)',
      putCall.opts.headers && putCall.opts.headers.Authorization === 'Bearer ' + TOKEN);
    ok('mesaj metninde token/secret yok', String(decoded.outer.message).indexOf(TOKEN) < 0);
  });
})();
}).then(function () {
// ── 3) Retry: 409 çakışması sha’yı yeniden okuyup dener ────────────────────
section('3. 409 çakışmasında güvenli retry');
var p3a = (function () {
  var seed = emptyOutbox();
  var queue = [
    { ok: false, status: 409, textBody: 'conflict' }, // PUT #1 → 409 (GET zaten seed olarak queue başında)
    ghContentBody(seed),                              // GET #2 (sha yeniden okunur)
    { ok: true, status: 200 },                        // PUT #2 → başarı
  ];
  var S = setup(seed, { queue: queue });
  return S.pushQuranRequest(payloadFor('qr_' + 'c'.repeat(24), 'kalem', 2, 'Kalem'), function (err) {
    ok('409 sonrası retry ile başarılı', !err, err && err.message);
    ok('tam olarak 4 fetch çağrısı (GET,PUT,GET,PUT)', _fetchCalls.length === 4, _fetchCalls.length);
    ok('sıra GET→PUT→GET→PUT', isGet(_fetchCalls[0]) && isPut(_fetchCalls[1]) && isGet(_fetchCalls[2]) && isPut(_fetchCalls[3]));
  });
})();
return p3a.then(function () {
  // Sınır aşımı: her PUT 409 dönerse (attempt 0,1,2,3 = 4 GET+PUT çifti) sonunda hataya düşer.
  var seed = emptyOutbox();
  var queue = [];
  for (var i = 0; i < 3; i++) { queue.push({ ok: false, status: 409, textBody: 'still conflicting' }); queue.push(ghContentBody(seed)); }
  queue.push({ ok: false, status: 409, textBody: 'final conflict' });
  var S = setup(seed, { queue: queue });
  return S.pushQuranRequest(payloadFor('qr_' + 'd'.repeat(24), 'muzzemmil', 3, 'Müzzemmil'), function (err) {
    ok('sürekli 409’da sonunda hataya düşüyor (sonsuz retry yok)', !!err);
    ok('retry sayısı sınırlı (8 çağrı: 4×GET+PUT)', _fetchCalls.length === 8, _fetchCalls.length);
  }).catch(function () {}); // beklenen ret: cb zaten hatayı raporladı, zincir kırılmasın
});
}).then(function () {
// ── 4) Tekilleştirme ve farklı sûrelerin birbirini ezmemesi ────────────────
section('4. Tekilleştirme (duplicate) ve çoklu-sûre merge');
var reqIdAla = 'qr_' + 'e'.repeat(24);
var p4a = (function () {
  var S = setup(emptyOutbox());
  return S.pushQuranRequest(payloadFor(reqIdAla, 'ala', 8, 'A’lâ'), function (err) {
    ok('ilk gönderim başarılı', !err, err && err.message);
  });
})();

return p4a.then(function () {
  var firstDecoded = decodePutBody(_fetchCalls[1]);
  // İkinci çağrı: aynı requestId ile, GET bu kez ilk yazılan defteri döndürür.
  var S = setup(firstDecoded.inner);
  return S.pushQuranRequest(payloadFor(reqIdAla, 'ala', 8, 'A’lâ'), function (err) {
    ok('aynı requestId ikinci kez gönderilebiliyor (üst katmanda idempotent)', !err, err && err.message);
    var decoded = decodePutBody(_fetchCalls[1]);
    ok('tek anahtar kalıyor (ikinci kayıt AÇILMADI)', Object.keys(decoded.inner.requests).length === 1, Object.keys(decoded.inner.requests));
    return decoded;
  });
}).then(function () {
  var lastDecoded = decodePutBody(_fetchCalls[1]);
  // Farklı bir sûre için istek: mevcut 'ala' kaydı outbox’ta dururken eklenir.
  var S = setup(lastDecoded.inner);
  return S.pushQuranRequest(payloadFor('qr_' + 'f'.repeat(24), 'duha', 11, 'Duhâ'), function (err) {
    ok('farklı sûre için istek başarılı', !err, err && err.message);
    var decoded = decodePutBody(_fetchCalls[1]);
    var keys = Object.keys(decoded.inner.requests);
    ok('iki farklı sûre BİRBİRİNİ EZMEDİ (2 anahtar)', keys.length === 2, keys);
    ok('önceki sûre (ala) hâlâ duruyor', keys.indexOf(reqIdAla) >= 0);
    ok('yeni sûre (duha) eklendi', keys.indexOf('qr_' + 'f'.repeat(24)) >= 0);
  });
});
}).then(function () {
// ── 5) Offline / ağ hatası ──────────────────────────────────────────────────
section('5. Offline ve ağ hatası güvenliği');
var p5a = (function () {
  var S = setup(null, { queue: [{ reject: new Error('network down') }] });
  return S.pushQuranRequest(payloadFor('qr_' + 'g'.repeat(24), 'insirah', 12, 'İnşirâh'), function (err) {
    ok('GET reddinde cb(err) çağrılıyor (çökme yok)', !!err, err && err.message);
  }).catch(function () {});
})();

return p5a.then(function () {
  var seed = emptyOutbox();
  var S = setup(seed, { queue: [{ reject: new Error('network down mid-put') }] });
  return S.pushQuranRequest(payloadFor('qr_' + 'h'.repeat(24), 'asr', 13, 'Asr'), function (err) {
    ok('PUT reddinde cb(err) çağrılıyor (çökme yok)', !!err, err && err.message);
  }).catch(function () {});
}).then(function () {
  // Fırlatan bir fetch bile senkron olarak çağrıyı çökertmemeli.
  var S = setup(null);
  global.fetch = function () { throw new Error('fetch itself throws'); };
  var threw = false, cbCalled = false;
  try {
    S.pushQuranRequest(payloadFor('qr_' + 'i'.repeat(24), 'adiyat', 14, 'Âdiyât'), function (err) {
      cbCalled = true;
      ok('senkron fırlatan fetch bile cb(err) üretiyor', !!err, err && err.message);
    });
  } catch (e) { threw = true; }
  ok('senkron fetch fırlatması pushQuranRequest’i çökertmiyor', !threw);
  ok('callback gerçekten çağrıldı', cbCalled);
});
}).then(function () {
// ── 6) Guard 1 (dev-origin) ve doğrulama kapıları ───────────────────────────
section('6. Guard 1 (dev-origin) ve girdi doğrulama');
var p6a = (function () {
  var S = setup(null, { hostname: 'localhost' });
  return S.pushQuranRequest(payloadFor('qr_' + 'j'.repeat(24), 'kadir', 25, 'Kadir'), function (err) {
    ok('localhost’tan istek engelleniyor', !!err, err && err.message);
    ok('localhost’ta HİÇ fetch çağrılmadı', _fetchCalls.length === 0, _fetchCalls.length);
  }).catch(function () {});
})();

return p6a.then(function () {
  var S = setup(null, { protocol: 'file:', hostname: '' });
  return S.pushQuranRequest(payloadFor('qr_' + 'k'.repeat(24), 'sems', 26, 'Şems'), function (err) {
    ok('file: protokolünde istek engelleniyor', !!err, err && err.message);
    ok('file:’ta HİÇ fetch çağrılmadı', _fetchCalls.length === 0, _fetchCalls.length);
  }).catch(function () {});
}).then(function () {
  // Bilinçli kaçış kapısı (mevcut Guard 1 deseniyle AYNI): seyma-sync-force.
  var S = setup(null, { hostname: 'localhost' });
  global.localStorage.setItem('seyma-sync-force', '1');
  return S.pushQuranRequest(payloadFor('qr_' + 'l'.repeat(24), 'buruc', 27, 'Bürûc'), function (err) {
    ok('seyma-sync-force=1 ile localhost’tan da geçebiliyor (kaçış kapısı korunmuş)', !err, err && err.message);
    ok('force ile gerçekten fetch çağrıldı', _fetchCalls.length === 2, _fetchCalls.length);
  });
}).then(function () {
  var S = setup(null);
  return S.pushQuranRequest({ schemaVersion: 1, requestId: 'kotu-id', surahId: 'alak', revelationOrder: 1, surahName: 'Alak', requestedAt: '2026-07-31T09:00:00.000Z' }, function (err) {
    ok('geçersiz requestId reddediliyor', !!err, err && err.message);
    ok('geçersiz requestId’de HİÇ fetch çağrılmadı', _fetchCalls.length === 0, _fetchCalls.length);
  }).catch(function () {});
}).then(function () {
  var S = setup(null);
  return S.pushQuranRequest({ schemaVersion: 1, requestId: 'qr_' + 'm'.repeat(24), surahId: 'KOTU SURAH', revelationOrder: 1, surahName: 'x', requestedAt: '2026-07-31T09:00:00.000Z' }, function (err) {
    ok('geçersiz surahId reddediliyor', !!err, err && err.message);
    ok('geçersiz surahId’de HİÇ fetch çağrılmadı', _fetchCalls.length === 0, _fetchCalls.length);
  }).catch(function () {});
}).then(function () {
  var S = setup(null, { noToken: true });
  return S.pushQuranRequest(payloadFor('qr_' + 'n'.repeat(24), 'tin', 28, 'Tîn'), function (err) {
    ok('ghToken yokken reddediliyor', !!err, err && err.message);
    ok('ghToken yokken HİÇ fetch çağrılmadı', _fetchCalls.length === 0, _fetchCalls.length);
  }).catch(function () {});
});
}).then(function () {
// ── 7) İzolasyon regresyonu: genel push yolu değişmedi ─────────────────────
section('7. Genel senkron yolu (latest.json) regresyonu');
var S = setup(null);
ok('mergeData hâlâ dışa açık ve fonksiyon', typeof S.mergeData === 'function');
ok('mergeZikr hâlâ dışa açık ve fonksiyon', typeof S.mergeZikr === 'function');
ok('pushQuranRequest yeni API olarak eklendi', typeof S.pushQuranRequest === 'function');
ok('schedule/pushNow API’leri korunuyor', typeof S.schedule === 'function' && typeof S.pushNow === 'function');

console.log('\n=== Özet: ' + passed + ' geçti, ' + failed + ' kaldı ===');
process.exit(failed === 0 ? 0 : 1);
}).catch(function (e) {
  console.error('BEKLENMEYEN HATA:', e && e.stack || e);
  console.log('\n=== Özet: ' + passed + ' geçti, ' + (failed + 1) + ' kaldı (harness çöktü) ===');
  process.exit(1);
});
