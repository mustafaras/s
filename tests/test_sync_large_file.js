// QY-22 — Büyük dosya / çakışma / tek-uçuş senkron testleri.
// Gerçek network YOK: fetch tamamen sahte, seyma-data'ya tek bayt gitmez.
// Çalıştırma: node tests/test_sync_large_file.js
//
// NEDEN VAR (gerçek üretim vakası, 2026-08-18):
// data/latest.json 1.51 MB'a ulaşınca GitHub Contents API gövdeyi döndürmeyi
// bıraktı — 200 döndü ama encoding:"none", content:"". Bu sessizce şunları
// bozdu:
//   • çoklu cihaz merge'i (uzak veri hiç okunmadı),
//   • ANTI-CLOBBER Guard 2 (remoteDays hep 0 okundu → koruma devre dışı;
//     CLAUDE.md'nin 2026-07-10 veri kaybından sonra eklediği korumanın kendisi),
//   • paneldeki görünüm (degrade fallback, "Projection yok").
// Ayrıca 1.5 sn debounce push'ları üst üste bindiriyordu; kaybeden push 409
// alıyor ve putLatestGuarded'da retry OLMADIĞI için kalıcı 'conflict' receipt
// yazılıyordu — panelin sürekli kırmızı kalmasının sebebi buydu.
'use strict';
var fs = require('fs');
var path = require('path');
var repoRoot = require('./repo-root');

var pass = 0, fail = 0;
function ok(name, cond, detail){
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (detail !== undefined ? ' — ' + JSON.stringify(detail) : '')); }
}
if (typeof TextEncoder === 'undefined') { global.TextEncoder = require('util').TextEncoder; }
if (typeof TextDecoder === 'undefined') { global.TextDecoder = require('util').TextDecoder; }

var syncSrc = fs.readFileSync(path.join(repoRoot, 'sync.js'), 'utf8');
var CFG = { token: 'test-token', owner: 'ornek', repo: 'veri', branch: 'main' };
var LATEST = 'contents/data/latest.json';
var BLOBS = '/git/blobs/';

function loadSync(routes){
  var _ls = {}, calls = [];
  global.localStorage = {
    getItem: function(k){ return Object.prototype.hasOwnProperty.call(_ls, k) ? _ls[k] : null; },
    setItem: function(k, v){ _ls[k] = String(v); }, removeItem: function(k){ delete _ls[k]; }, clear: function(){ _ls = {}; }
  };
  global.window = { addEventListener: function(){}, SeySync: null };
  global.document = { getElementById: function(){ return null; } };
  global.location = { protocol: 'https:', hostname: 'seyma.example', search: '' };
  global.fetch = function(url, opts){
    var method = (opts && opts.method) || 'GET';
    calls.push({ url: String(url), method: method });
    var res = routes(String(url), method, opts, calls);
    if (!res) return Promise.reject(new Error('TEST: beklenmeyen istek ' + method + ' ' + url));
    return Promise.resolve(res);
  };
  eval(syncSrc);
  return { S: global.window.SeySync, calls: calls };
}
function res(status, obj, textOverride){
  return {
    ok: status >= 200 && status < 300, status: status,
    json: function(){ return Promise.resolve(obj); },
    text: function(){ return Promise.resolve(textOverride !== undefined ? textOverride : JSON.stringify(obj)); },
    headers: { get: function(){ return null; } }
  };
}
function b64(str){
  var bytes = new global.TextEncoder().encode(str), bin = '';
  for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return Buffer.from(bin, 'binary').toString('base64');
}
function stateWithDays(n){
  var days = {};
  for (var i = 0; i < n; i++) {
    var d = new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10);
    days[d] = { mood: 'iyi', idx: i };
  }
  return { onboarded: true, lastOpenedDate: '2026-08-18', days: days, settings: {} };
}
// Contents API'nin 1 MB üstü için verdiği GERÇEK cevap biçimi.
var OVERSIZE = { sha: 'remotesha', size: 1593633, encoding: 'none', content: '' };
var PUT_OK = { content: { sha: 'newsha' }, commit: { sha: 'commitsha' } };

console.log('== QY-22 senkron: büyük dosya, çakışma, tek uçuş ==');

var queue = [];
function step(name, fn){ queue.push({ name: name, fn: fn }); }

// ── 1) 1 MB üstü latest.json gövdesi Blobs API'den okunur ───────────────────
step('1. Contents API gövdeyi vermediğinde Blobs API devreye girer', function(){
  var remote = JSON.stringify(stateWithDays(30)), blobHits = 0, putBody = null;
  var env = loadSync(function(url, method, opts){
    if (url.indexOf(BLOBS) >= 0) { blobHits++; return res(200, null, remote); }
    if (url.indexOf(LATEST) >= 0 && method === 'GET') return res(200, OVERSIZE);
    if (url.indexOf(LATEST) >= 0 && method === 'PUT') { putBody = JSON.parse(opts.body); return res(200, PUT_OK); }
    return res(200, PUT_OK);
  });
  var local = stateWithDays(30);
  return env.S.putLatestGuarded(CFG, JSON.stringify(local), local).then(function(){
    ok('gövde boş gelince Blobs API çağrıldı', blobHits === 1, blobHits);
    ok('PUT doğru sha ile yapıldı (yarış korumalı)', putBody && putBody.sha === 'remotesha', putBody && putBody.sha);
  });
});

// ── 2) Uzak veri GERÇEKTEN birleşiyor (merge artık ölü değil) ───────────────
step('2. Uzaktaki fazla günler yerelde kaybolmuyor', function(){
  var remote = JSON.stringify(stateWithDays(30)), putBody = null;
  var env = loadSync(function(url, method, opts){
    if (url.indexOf(BLOBS) >= 0) return res(200, null, remote);
    if (url.indexOf(LATEST) >= 0 && method === 'GET') return res(200, OVERSIZE);
    if (url.indexOf(LATEST) >= 0 && method === 'PUT') { putBody = JSON.parse(opts.body); return res(200, PUT_OK); }
    return res(200, PUT_OK);
  });
  var local = stateWithDays(30);          // 30 gün; uzakta da 30 gün var
  local.days['2026-08-18'] = { mood: 'yeni' };   // yerelde 1 fazla
  return env.S.putLatestGuarded(CFG, JSON.stringify(local), local).then(function(){
    var sent = JSON.parse(Buffer.from(putBody.content, 'base64').toString('utf8'));
    ok('gönderilen gövde uzak günleri koruyor', Object.keys(sent.days).length === 31, Object.keys(sent.days).length);
    ok('yerelde eklenen yeni gün de gidiyor', !!sent.days['2026-08-18']);
  });
});

// ── 3) ANTI-CLOBBER yeniden ayakta (asıl veri güvenliği kazancı) ────────────
step('3. Anti-clobber körleşmesi bitti: bayat cihaz uzak veriyi ezemez', function(){
  var remote = JSON.stringify(stateWithDays(30)), putCount = 0;
  var env = loadSync(function(url, method){
    if (url.indexOf(BLOBS) >= 0) return res(200, null, remote);
    if (url.indexOf(LATEST) >= 0 && method === 'GET') return res(200, OVERSIZE);
    if (url.indexOf(LATEST) >= 0 && method === 'PUT') { putCount++; return res(200, PUT_OK); }
    return res(200, PUT_OK);
  });
  // Bayat cihaz: yalnız 3 gün. mergeData uzaktaki 30 günü geri getirebilmeli;
  // getiremezse push İPTAL edilmeli. Her iki durumda da UZAK VERİ KAYBOLMAZ.
  var stale = stateWithDays(3);
  return env.S.putLatestGuarded(CFG, JSON.stringify(stale), stale).then(function(){
    ok('push yapıldıysa uzak günler korunmuş olmalı', Object.keys(stale.days).length >= 30, Object.keys(stale.days).length);
  }, function(err){
    ok('birleştirilemediğinde push anti-clobber ile iptal edildi', err && err.code === 'anti_clobber', err && err.code);
  });
});

// ── 4) Gövde OKUNAMAZSA sessizce üzerine yazma YOK ─────────────────────────
step('4. Uzak gövde okunamıyorsa push durur (kör üzerine yazma yok)', function(){
  var putCount = 0;
  var env = loadSync(function(url, method){
    if (url.indexOf(BLOBS) >= 0) return res(500, null, 'bozuk');       // blob da okunamadı
    if (url.indexOf(LATEST) >= 0 && method === 'GET') return res(200, OVERSIZE);
    if (url.indexOf(LATEST) >= 0 && method === 'PUT') { putCount++; return res(200, PUT_OK); }
    return res(200, PUT_OK);
  });
  var local = stateWithDays(3);
  return env.S.putLatestGuarded(CFG, JSON.stringify(local), local).then(function(){
    ok('okunamayan uzak kayıtta push YAPILMAMALIYDI', false, { putCount: putCount });
  }, function(err){
    ok('push durduruldu', err && err.code === 'remote_unreadable', err && err.code);
    ok('hiç PUT gönderilmedi', putCount === 0, putCount);
  });
});

// ── 5) 409 çakışması yeniden deneniyor (kalıcı kırmızı receipt biterdi) ────
step('5. 409 çakışması yeniden denenir ve toparlanır', function(){
  var remote = JSON.stringify(stateWithDays(30)), puts = 0;
  var env = loadSync(function(url, method){
    if (url.indexOf(BLOBS) >= 0) return res(200, null, remote);
    if (url.indexOf(LATEST) >= 0 && method === 'GET') return res(200, OVERSIZE);
    if (url.indexOf(LATEST) >= 0 && method === 'PUT') {
      puts++;
      if (puts === 1) return res(409, null, '{"message":"does not match"}');  // yarışı kaybetti
      return res(200, PUT_OK);
    }
    return res(200, PUT_OK);
  });
  var local = stateWithDays(30);
  return env.S.putLatestGuarded(CFG, JSON.stringify(local), local).then(function(){
    ok('ilk 409 sonrası yeniden denendi ve başarıya ulaştı', puts === 2, puts);
  }, function(err){
    ok('409 sonrası başarıya ulaşmalıydı', false, err && err.message);
  });
});

// ── 6) Retry sonsuz değil: kalıcı 409 dürüstçe hata döner ──────────────────
step('6. Kalıcı 409 sonsuz döngüye girmez', function(){
  var remote = JSON.stringify(stateWithDays(30)), puts = 0;
  var env = loadSync(function(url, method){
    if (url.indexOf(BLOBS) >= 0) return res(200, null, remote);
    if (url.indexOf(LATEST) >= 0 && method === 'GET') return res(200, OVERSIZE);
    if (url.indexOf(LATEST) >= 0 && method === 'PUT') { puts++; return res(409, null, '{"message":"conflict"}'); }
    return res(200, PUT_OK);
  });
  var local = stateWithDays(30);
  return env.S.putLatestGuarded(CFG, JSON.stringify(local), local).then(function(){
    ok('kalıcı 409 başarı sayılmamalıydı', false);
  }, function(err){
    ok('sınırlı denemeden sonra conflict bildirildi', err && err.code === 'conflict', err && err.code);
    ok('deneme sayısı sınırlı (4)', puts === 4, puts);
  });
});

// ── 7) Küçük dosyalarda davranış değişmedi (geri uyum) ─────────────────────
step('7. 1 MB altı dosyada Blobs API\'ye hiç gidilmez', function(){
  var remote = JSON.stringify(stateWithDays(5)), blobHits = 0;
  var env = loadSync(function(url, method, opts){
    if (url.indexOf(BLOBS) >= 0) { blobHits++; return res(200, null, remote); }
    if (url.indexOf(LATEST) >= 0 && method === 'GET') return res(200, { sha: 'small', content: b64(remote) });
    if (url.indexOf(LATEST) >= 0 && method === 'PUT') return res(200, PUT_OK);
    return res(200, PUT_OK);
  });
  var local = stateWithDays(5);
  return env.S.putLatestGuarded(CFG, JSON.stringify(local), local).then(function(){
    ok('gövde zaten geldiğinde ek istek yok', blobHits === 0, blobHits);
  });
});

// ── 8) Statik denetim: yedek dosyası artık sınırsız büyümüyor ──────────────
step('8. Yedekler günde tek dosya (2135 dosya / 2.1 GB büyümesi durdu)', function(){
  ok('yedek adı gün bazlı', /data\/backups\/'\+nowIso\.slice\(0,10\)\+'\.json/.test(syncSrc));
  ok('zaman damgalı sınırsız yedek kaldırıldı', syncSrc.indexOf("nowIso.replace(/[:.]/g,'-')") < 0);
  ok('tek-uçuş koruması var', /var inFlight=null, rerunPending=false;/.test(syncSrc));
  ok('putLatestGuarded retry parametresi aldı', /function putLatestGuarded\(c, latestStr, localData, attempt\)/.test(syncSrc));
  return Promise.resolve();
});

(function runAll(i){
  if (i >= queue.length) {
    console.log('');
    if (fail === 0) console.log('✅ Tüm kontroller PASS (' + pass + '/' + pass + ')');
    else console.log('❌ ' + fail + ' kontrol FAIL (' + pass + ' geçti)');
    process.exit(fail === 0 ? 0 : 1);
    return;
  }
  console.log('\n' + queue[i].name);
  Promise.resolve().then(queue[i].fn).then(function(){ runAll(i + 1); }, function(e){
    fail++; console.log('  ✗ senaryo çöktü — ' + (e && e.message));
    runAll(i + 1);
  });
})(0);
