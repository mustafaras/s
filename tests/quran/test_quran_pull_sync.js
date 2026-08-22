// test_quran_pull_sync.js — QY-11 kabul kapısı: Kur’an Yolculuğu teslim/yanıt
// çekicisinin (sync.js `pullQuranUpdates`) mock-fetch testleri.
// GERÇEK AĞ ÇAĞRISI YOK — `fetch` tamamen sahte, hiçbir dosyaya/repoya yazılmaz.
//
// Kapsam (QY-11 doğrulama listesinden birebir):
//   · cache-busting  — her GET'te `&t=` parametresi var.
//   · bozuk/eksik    — 404/boş/bozuk JSON asla throw etmez, boş sözleşme döner.
//   · 200→304        — ETag cache gövdesi korunur; cache'siz 304 başarı sayılmaz.
//   · salt-okunur    — hiçbir PUT/POST çağrısı yapılmaz (yalnız GET).
//   · izolasyon      — localhost'ta bile OKUMA engellenmez (Guard 1 yalnız
//                      YAZMAya özgüdür; okumak veri kaybı riski taşımaz).
//   · yapılandırılmamış — token/repo yoksa sessizce boş sözleşme, hata yok.
//
// Çalıştırma: node tests/quran/test_quran_pull_sync.js

'use strict';
var fs = require('fs');
var path = require('path');
var repoRoot = require('../repo-root');

if (typeof TextEncoder === 'undefined') { global.TextEncoder = require('util').TextEncoder; }
if (typeof TextDecoder === 'undefined') { global.TextDecoder = require('util').TextDecoder; }

var passed = 0, failed = 0;
function ok(name, cond, detail) {
  if (cond) { passed++; console.log('  ✓ ' + name); }
  else { failed++; console.log('  ✗ ' + name + (detail !== undefined ? ' — ' + JSON.stringify(detail) : '')); }
}
function section(t) { console.log('\n' + t); }

var TOKEN = 'ghp_test_token_do_not_use';

function b64(str) { var bytes = new TextEncoder().encode(str); var bin = ''; for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]); return Buffer.from(bin, 'binary').toString('base64'); }
function mockRes(init) {
  return Object.assign({ ok: true, status: 200, json: function () { return Promise.resolve(init.jsonBody); }, text: function () { return Promise.resolve(init.textBody || ''); } }, init);
}
function ghContentBody(obj) { return { status: 200, jsonBody: { sha: 'sha-x', content: b64(JSON.stringify(obj)) } }; }

function setup(opts) {
  opts = opts || {};
  var ls = {};
  ls['seyma-reset-v1'] = JSON.stringify({
    settings: { ghToken: opts.noToken ? '' : TOKEN, ghRepo: opts.noRepo ? '' : 'owner/repo', ghBranch: 'main' },
  });
  global.localStorage = {
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(ls, k) ? ls[k] : null; },
    setItem: function (k, v) { ls[k] = String(v); }, removeItem: function (k) { delete ls[k]; }, clear: function () { ls = {}; },
  };
  global.location = { protocol: opts.protocol || 'https:', hostname: opts.hostname || 'mustafaras.github.io', search: '' };
  global.window = { addEventListener: function () {}, SeySync: null };
  global.document = { getElementById: function () { return null; } };

  var calls = [];
  var byPath = opts.byPath || {}; // { delivery: resOrNull, responses: resOrNull }
  global.fetch = function (url, reqOpts) {
    calls.push({ url: url, opts: reqOpts || {} });
    var res;
    if (/quran-delivery\.json/.test(url)) res = byPath.delivery;
    else if (/quran-responses\.json/.test(url)) res = byPath.responses;
    if (res === undefined) res = { status: 404 };
    if (res && res.reject) return Promise.reject(res.reject);
    return Promise.resolve(mockRes(res));
  };

  eval(fs.readFileSync(path.join(repoRoot, 'app/content/quranTransportV1.js'), 'utf8'));
  eval(fs.readFileSync(path.join(repoRoot, 'sync.js'), 'utf8'));
  return { sync: global.window.SeySync, calls: calls };
}

function run(name, opts) {
  return new Promise(function (resolve) {
    var env = setup(opts);
    env.sync.pullQuranUpdates(function (err, result) { resolve({ err: err, result: result, calls: env.calls }); });
  });
}

(async function () {
  section('1. Yapılandırılmamış / erişilemeyen durumlar');
  {
    var r = await run('no-token', { noToken: true });
    ok('Token yoksa boş sözleşme döner, hata yok', r.err === null && r.result.delivery && r.result.responses && r.calls.length === 0);
  }
  {
    var r = await run('no-repo', { noRepo: true });
    ok('Repo yoksa boş sözleşme döner, hiç fetch çağrılmaz', r.err === null && r.calls.length === 0);
  }

  section('2. Normal okuma');
  {
    var deliveryDoc = { schemaVersion: 1, updatedAt: '2026-07-31T10:00:00.000Z', requests: { qr_abc12345: { status: 'sent', sentAt: '2026-07-31T10:00:00.000Z', providerMessageId: 'm1', error: null } } };
    var responsesDoc = { schemaVersion: 1, updatedAt: '2026-07-31T11:00:00.000Z', responses: { qr_abc12345: { responseId: 'qrr_xyz12345', requestId: 'qr_abc12345', surahId: 'alak', videoId: 'dQw4w9WgXcQ', source: 'gmail_reply', receivedAt: '2026-07-31T11:00:00.000Z', validatedAt: '2026-07-31T11:00:00.000Z', senderFingerprint: null, status: 'ready' } } };
    var r = await run('happy', { byPath: { delivery: ghContentBody(deliveryDoc), responses: ghContentBody(responsesDoc) } });
    ok('Delivery doğru ayrıştırılıyor', r.result.delivery.requests.qr_abc12345.status === 'sent');
    ok('Responses doğru ayrıştırılıyor', r.result.responses.responses.qr_abc12345.videoId === 'dQw4w9WgXcQ');
    ok('Her iki dosya da GET ile okunuyor (2 çağrı)', r.calls.length === 2);
    ok('Hiç PUT/POST çağrısı yok (salt-okunur)', r.calls.every(function (c) { return !c.opts.method || c.opts.method === 'GET'; }));
    ok('Cache-busting parametresi (&t=) her istekte var', r.calls.every(function (c) { return /[?&]t=\d+/.test(c.url); }));
  }

  section('3. Bozuk/eksik dosya — çökme yok');
  {
    var r = await run('missing-both', {}); // her ikisi de 404
    ok('İki dosya da yoksa boş sözleşme + hata yok', r.err === null && Object.keys(r.result.delivery.requests).length === 0 && Object.keys(r.result.responses.responses).length === 0);
  }
  {
    var r = await run('broken-json', { byPath: {
      delivery: { status: 200, jsonBody: { sha: 's', content: b64('{ bozuk json') } },
      responses: ghContentBody({ schemaVersion: 1, responses: {} })
    } });
    ok('Bozuk JSON throw etmiyor, boş delivery + hata listesi dönüyor', r.err === null && Object.keys(r.result.delivery.requests).length === 0 && r.result.deliveryErrors.indexOf('invalid_json') >= 0);
  }
  {
    var r = await run('network-reject', { byPath: { delivery: { reject: new Error('offline') } } });
    ok('Ağ hatası (reddedilen fetch) çökmeden cb(err,...) döner', typeof r.err !== 'undefined' && r.err !== null);
  }

  section('4. Guard 1 (dev-origin) okumayı ENGELLEMEZ');
  {
    var deliveryDoc = { schemaVersion: 1, updatedAt: null, requests: {} };
    var r = await run('localhost-read', { hostname: 'localhost', byPath: { delivery: ghContentBody(deliveryDoc), responses: ghContentBody({ schemaVersion: 1, responses: {} }) } });
    ok('localhost kökeninde bile okuma çalışır (Guard 1 yalnız yazmaya özgü)', r.calls.length === 2 && r.err === null);
  }

  section('5. ETag / stale cache fail-closed davranışı');
  {
    var byPath = {
      delivery: Object.assign(ghContentBody({ schemaVersion: 1, requests: {} }), { headers: { get: function () { return '"delivery-v1"'; } } }),
      responses: Object.assign(ghContentBody({ schemaVersion: 1, responses: {} }), { headers: { get: function () { return '"response-v1"'; } } })
    };
    var env = setup({ byPath: byPath });
    function pullEnv() { return new Promise(function (resolve) { env.sync.pullQuranUpdates(function (err, result) { resolve({ err: err, result: result }); }); }); }
    var first = await pullEnv();
    byPath.delivery = { status: 304, ok: false, headers: { get: function () { return '"delivery-v1"'; } } };
    byPath.responses = { status: 304, ok: false, headers: { get: function () { return '"response-v1"'; } } };
    var second = await pullEnv();
    ok('200 sonrası 304 cached body ile güncel sözleşmeyi koruyor', first.err === null && second.err === null && second.result.delivery && second.result.responses);
    ok('304 isteklerinde If-None-Match gönderiliyor', env.calls.slice(2).every(function (x) { return x.opts.headers && x.opts.headers['If-None-Match']; }));
  }
  {
    var miss = await run('304-cache-miss', { byPath: { delivery: { status: 304, ok: false }, responses: { status: 304, ok: false } } });
    ok('cache gövdesiz 304 sessiz başarı sayılmıyor', !!miss.err);
  }
  {
    var server = await run('500', { byPath: { delivery: { status: 500, ok: false }, responses: ghContentBody({ schemaVersion: 1, responses: {} }) } });
    ok('HTTP 500 boş cevap gibi gizlenmiyor', !!server.err);
  }
  {
    var byPath = { delivery: ghContentBody({ schemaVersion: 1, requests: { qr_old: { status: 'sent' } } }), responses: ghContentBody({ schemaVersion: 1, responses: {} }) };
    var env = setup({ byPath: byPath });
    await new Promise(function (resolve) { env.sync.pullQuranUpdates(function () { resolve(); }); });
    byPath.delivery = { status: 404, ok: false, headers: { get: function () { return null; } } };
    await new Promise(function (resolve) { env.sync.pullQuranUpdates(function () { resolve(); }); });
    byPath.delivery = { status: 304, ok: false, headers: { get: function () { return '"old-after-404"'; } } };
    var stale = await new Promise(function (resolve) { env.sync.pullQuranUpdates(function (err, result) { resolve({ err: err, result: result }); }); });
    ok('404 sonrası eski cache gövdesi 304 ile yeniden başarı sayılmıyor', !!stale.err);
  }

  console.log('\n' + (failed ? '⚠️ ' + failed + ' başarısız, ' : '✅ ') + passed + '/' + (passed + failed) + ' assertion pass');
  process.exit(failed ? 1 : 0);
})();
