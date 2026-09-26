// ÆON mail tetiği (data/aeon-outbox.json) dayanıklılık fixture'ı.
//
// KAPSANAN GERÇEK ARIZA (2026-09-24):
//   Şeyma ÆON'a iki soru gönderdi (06:47:41 ve 06:47:46) ve ikisi de veriye
//   yazıldı — ama `data/aeon-outbox.json` (mail tetik dosyası) o gün HİÇ
//   değişmedi, dolayısıyla veri reposundaki `aeon-mail.yml` çalışmadı ve
//   mustafarasit@gmail.com'a mail GİTMEDİ. Kullanıcı bunu ancak mailleri
//   gelmeyince fark etti.
//   KÖK SEBEP: pushPing, 2,5 MB'lık latest.json zinciriyle aynı varsayımlarla
//   çalışıyordu ve `.catch(function(){})` ile hatayı SESSİZCE yutuyordu.
//   O gün senkron `timeout`/`typeerror` ile hata veriyordu (GitHub Contents
//   API 1 MB üstünde gövdeyi boş döndürür), bu yüzden küçük tetik dosyasının
//   yazımı da atlanıyordu — üstelik kullanıcıya hiçbir uyarı çıkmıyordu ve
//   soru "Gönderildi" diye görünmeye devam ediyordu.
//
// Bu fixture şu SÖZLEŞMELERİ kilitler:
//   1) başarılı yazımda tetik dosyası GERÇEKTEN PUT edilir;
//   2) yazım hatası SESSİZCE YUTULMAZ — çağırana false döner ve
//      window.SeyOnMailOutboxResult(false,...) ile görünür bildirim üretilir;
//   3) yazım ana zincirden bağımsızdır (taze sha okur);
//   4) 409/422 çakışmasında yeniden dener;
//   5) yerel kökende (localhost) tek istek bile atılmaz (Guard 1);
//   6) tetik dosyası okunamıyorsa (1 MB gövde sınırı) sha'sız PUT ile
//      veri kaybı riskine girilmez.
//
// Çalıştırma: node tests/app/test_aeon_mail_outbox.js

'use strict';
var fs = require('fs');
var path = require('path');
var repoRoot = require('../repo-root');

var passed = 0, failed = 0;
function ok(name, condition, detail){
  if(condition){ passed++; console.log('  \u2713 ' + name); }
  else { failed++; console.log('  \u2717 ' + name + (detail ? ' \u2014 ' + detail : '')); }
}
function wait(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }

console.log('\n=== ÆON mail tetiği — outbox dayanıklılık fixture ===\n');

var syncSrc = fs.readFileSync(path.join(repoRoot, 'sync.js'), 'utf8');

// sync.js IIFE'sini izole bir bağlamda yükler. Fetch mock'u URL'e göre yanıt
// üretir; gerçek ağ YOK, gerçek token YOK, gerçek kullanıcı verisi YOK.
function makeEnv(opts){
  opts = opts || {};
  var calls = [];
  var writes = [];
  var notifications = [];
  var store = {};
  store['seyma-reset-v1'] = JSON.stringify({ app: 'seyma', settings: { ghToken: 'ghp_test_not_real_token_value_1234567890', ghRepo: 'mustafaras/seyma-data', ghBranch: 'main' } });

  var window = {
    addEventListener: function(){},
    SeySync: null,
    SeyOnMailOutboxResult: function(ok, kind, err){ notifications.push({ ok: ok, kind: kind, err: err || null }); }
  };
  var localStorage = {
    getItem: function(k){ return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
    setItem: function(k, v){ store[k] = String(v); },
    removeItem: function(k){ delete store[k]; }
  };
  var location = { protocol: 'https:', hostname: 'mustafaras.github.io', search: '' };
  if (opts.devOrigin) { location.hostname = 'localhost'; }

  function jsonResponse(status, body){
    return Promise.resolve({
      status: status, ok: status >= 200 && status < 300,
      headers: { get: function(){ return null; } },
      json: function(){ return Promise.resolve(body); },
      text: function(){ return Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body)); }
    });
  }

  var fetch = function(url, req){
    calls.push({ url: url, method: (req && req.method) || 'GET' });
    var isOutbox = url.indexOf('aeon-outbox.json') >= 0;
    if (!isOutbox) return jsonResponse(404, {});
    var isWrite = !!(req && req.method === 'PUT');
    if (!isWrite) {
      // Okuma: sha + gövde (başarılı senaryo) veya opts.unreadableBody ile boş.
      if (opts.unreadableBody) return jsonResponse(200, { sha: 'sha123', content: '' });
      if (opts.readStatus && opts.readStatus !== 200) return jsonResponse(opts.readStatus, 'denied');
      // Çakışma YAŞANDIYSA sha değişmiştir: gerçekte yarışı kazanan yazar dosyayı
      // güncellemiş olur, dolayısıyla bir sonraki okuma YENİ sha verir ve retry
      // başarıya ulaşır. Mock bu davranışı birebir yansıtır.
      var curSha = env.conflictsServed > 0 ? 'sha456' : 'sha123';
      return jsonResponse(200, { sha: curSha, content: Buffer.from('{"type":"aeon-question"}', 'utf8').toString('base64') });
    }
    writes.push(JSON.parse(req.body));
    if (opts.writeStatus && opts.writeStatus !== 200) {
      var conflicts = opts.conflictTimes || 0;
      if (opts.writeStatus === 409 || opts.writeStatus === 422) {
        // İlk `conflicts` yazım çakışır; sonrasında yarışı kazanan yazar
        // dosyayı güncellemiş olur ve yeniden deneme BAŞARIR (gerçek davranış).
        if (env.conflictsServed < conflicts) {
          env.conflictsServed++;
          return jsonResponse(opts.writeStatus, 'conflict');
        }
        return jsonResponse(200, { content: { sha: 'sha_new' } });
      }
      return jsonResponse(opts.writeStatus, 'error');
    }
    return jsonResponse(200, { content: { sha: 'sha_new' } });
  };

  var ctx = {
    window: window, localStorage: localStorage, location: location, fetch: fetch,
    console: { log: function(){}, warn: function(){}, error: function(){} },
    setTimeout: setTimeout, clearTimeout: clearTimeout, Date: Date, Math: Math,
    Promise: Promise, JSON: JSON, Object: Object, Array: Array, String: String,
    Number: Number, isNaN: isNaN, parseInt: parseInt, encodeURIComponent: encodeURIComponent,
    atob: function(s){ return Buffer.from(s, 'base64').toString('binary'); },
    btoa: function(s){ return Buffer.from(s, 'binary').toString('base64'); },
    TextEncoder: TextEncoder, TextDecoder: TextDecoder,
    AbortController: (typeof AbortController !== 'undefined' ? AbortController : undefined)
  };
  ctx.globalThis = ctx;
  var env = { ctx: ctx, calls: calls, writes: writes, notifications: notifications, conflictsServed: 0 };

  // IIFE'yi bu bağlamda çalıştır. `(0,eval)` global eval'dir; bu yüzden
  // vm.runInNewContext ile izole edilir.
  var vm = require('vm');
  vm.runInNewContext(syncSrc, ctx, { filename: 'sync.js' });
  return env;
}

// ── [1] Başarılı yazım: tetik dosyası GERÇEKTEN PUT edilir ────────────────
var step1 = Promise.resolve().then(function(){
  console.log('[1] Başarılı yazım');
  var env = makeEnv({});
  var S = env.ctx.window.SeySync;
  ok('pushPing dışa açık', !!(S && typeof S.pushPing === 'function'));
  return S.pushPing({ id: 'q_1', question: 'deneme sorusu', ts: '2026-09-24T06:47:41.142Z' }).then(function(result){
    ok('başarılı yazım true döner', result === true, 'donen=' + result);
    var puts = env.calls.filter(function(c){ return c.method === 'PUT' && c.url.indexOf('aeon-outbox.json') >= 0; });
    ok('tek PUT yapılır', puts.length === 1, 'put=' + puts.length);
    var reads = env.calls.filter(function(c){ return c.method !== 'PUT' && c.url.indexOf('aeon-outbox.json') >= 0; });
    ok('yazımdan önce taze sha okunur', reads.length === 1, 'read=' + reads.length);
    var sent = env.writes[0] && JSON.parse(Buffer.from(env.writes[0].content, 'base64').toString('utf8'));
    ok('PUT gövdesi aeon-question tipini taşır', !!(sent && sent.type === 'aeon-question'), 'gonderilen=' + (sent && sent.type));
    ok('PUT bayat sha ile yapılmaz (sha taşınır)', !!env.writes[0].sha, 'sha=' + env.writes[0].sha);
    ok('başarıda hata bildirimi üretilmez', env.notifications.length === 0, 'bildirim=' + env.notifications.length);
  });
});

// ── [2] Yazım hatası: SESSİZCE YUTULMAZ ──────────────────────────────────
// Bu, 2026-09-24 arızasının tam kalbiydi: eski kod `.catch(function(){})` ile
// hatayı yutuyordu, kullanıcıya hiçbir uyarı çıkmıyordu.
var step2 = step1.then(function(){
  console.log('[2] Yazım hatası görünür olur (sessiz yutma yok)');
  var env = makeEnv({ writeStatus: 500 });
  return env.ctx.window.SeySync.pushPing({ id: 'q_2', question: 'hata senaryosu', ts: '2026-09-24T06:47:46.293Z' }).then(function(result){
    ok('hatalı yazım false döner', result === false, 'donen=' + result);
    ok('çağırana hata bildirimi yapılır', env.notifications.length === 1, 'bildirim=' + env.notifications.length);
    var n = env.notifications[0] || {};
    ok('bildirim ok=false taşır', n.ok === false);
    ok('bildirim kind=aeon taşır', n.kind === 'aeon', 'kind=' + n.kind);
    ok('bildirim hata nesnesi taşır', !!n.err);
  });
});

// ── [3] 409/422 çakışmasında yeniden dener ───────────────────────────────
var step3 = step2.then(function(){
  console.log('[3] Çakışmada yeniden deneme');
  var env = makeEnv({ writeStatus: 409, conflictTimes: 1 });
  return env.ctx.window.SeySync.pushPing({ id: 'q_3', question: 'cakisma', ts: '2026-09-24T06:48:00.000Z' }).then(function(result){
    ok('çakışma sonrası yazım başarılı sayılır', result === true, 'donen=' + result);
    var puts = env.calls.filter(function(c){ return c.method === 'PUT'; });
    ok('çakışmadan sonra yeniden denenir', puts.length === 2, 'put=' + puts.length);
    var reads = env.calls.filter(function(c){ return c.method !== 'PUT' && c.url.indexOf('aeon-outbox.json') >= 0; });
    ok('her denemede sha tazelenir', reads.length === 2, 'read=' + reads.length);
  });
});

// ── [4] Yerel köken: tek istek bile atılmaz (Guard 1) ────────────────────
var step4 = step3.then(function(){
  console.log('[4] Yerel köken koruması (Guard 1)');
  var env = makeEnv({ devOrigin: true });
  return env.ctx.window.SeySync.pushPing({ id: 'q_4', question: 'yerel', ts: '2026-09-24T06:49:00.000Z' }).then(function(result){
    ok('yerelden yazım yapılmaz', result === false, 'donen=' + result);
    ok('yerelden hiçbir istek atılmaz', env.calls.length === 0, 'istek=' + env.calls.length);
  });
});

// ── [5] Okunamayan gövde: sha'sız PUT ile veri kaybına girilmez ──────────
// GitHub Contents API 1 MB üstünde 200 döner ama gövdeyi boş verir. Bu durumda
// sha doğrulanamaz; sha'sız PUT mevcut içeriği ezme riskidir. Yazım başarısız
// sayılır ve yeniden denenmeye bırakılır.
var step5 = step4.then(function(){
  console.log('[5] Okunamayan gövde güvenli tarafa düşer');
  var env = makeEnv({ unreadableBody: true });
  return env.ctx.window.SeySync.pushPing({ id: 'q_5', question: 'govde yok', ts: '2026-09-24T06:50:00.000Z' }).then(function(result){
    ok('gövde okunamazsa yazım başarısız sayılır', result === false, 'donen=' + result);
    var puts = env.calls.filter(function(c){ return c.method === 'PUT'; });
    ok('sha doğrulanmadan PUT atılmaz', puts.length === 0, 'put=' + puts.length);
    ok('kullanıcı görünür hata alır', env.notifications.length === 1, 'bildirim=' + env.notifications.length);
  });
});

// ── [6] Senkron yapılandırma yoksa sessizce başarısız sayılır ────────────
var step6 = step5.then(function(){
  console.log('[6] Yapılandırma yokluğu');
  var env = makeEnv({});
  // ghToken'sız durum: ayarları boşalt.
  env.ctx.localStorage.setItem('seyma-reset-v1', JSON.stringify({ app: 'seyma', settings: {} }));
  return env.ctx.window.SeySync.pushPing({ id: 'q_6', question: 'cfg yok', ts: '2026-09-24T06:51:00.000Z' }).then(function(result){
    ok('yapılandırma yokken false döner', result === false, 'donen=' + result);
    ok('yapılandırma yokken istek atılmaz', env.calls.length === 0, 'istek=' + env.calls.length);
  });
});

// ── [7] app.js köprüsü: başarısızlıkta kayıt işaretlenir ─────────────────
var step7 = step6.then(function(){
  console.log('[7] app.js köprüsü ve balon işareti');
  var appSrc = fs.readFileSync(path.join(repoRoot, 'app.js'), 'utf8');
  var msgSrc = fs.readFileSync(path.join(repoRoot, 'app/core/messaging.js'), 'utf8');
  var surfaceSrc = fs.readFileSync(path.join(repoRoot, 'app/core/appSurface.js'), 'utf8');
  ok('app.js görünür geri bildirim köprüsünü tanımlar', /window\.SeyOnMailOutboxResult\s*=/.test(appSrc));
  ok('köprü gövdesi appSurface kaydında yaşar', /function onMailOutboxResult/.test(surfaceSrc));
  ok('soru gönderimi tetiği bekler (aeonTriggerMailPing)', /function aeonTriggerMailPing/.test(surfaceSrc) && /aeonTriggerMailPing\(qid,question,ts\)/.test(appSrc));
  ok('medya gönderimi de aynı tetiği kullanır', /aeonTriggerMailPing\(qid,captionFallback,ts\)/.test(appSrc));
  ok('başarısızlıkta mailPinged=false işaretlenir', /mailPinged=okay/.test(surfaceSrc) && /mailPinged=false/.test(surfaceSrc));
  ok('balon "Yeniden dene" düğmesi taşır', /App\.aeonRetryMail/.test(msgSrc) && /Mail ulaşmadı/.test(msgSrc));
  ok('yeniden deneme handler\'ı kayıtlıdır', /App\.aeonRetryMail\s*=\s*function/.test(appSrc));
  ok('boot/foreground emniyeti vardır', /function aeonRetryPendingMail/.test(surfaceSrc) && /aeonRetryPendingMail\(\);/.test(appSrc));
  ok('mail hatası balona taşınır (mailFailed)', /mailFailed:x\.mailPinged===false/.test(msgSrc));
  ok('yeni soru kaydı mailPinged ile başlar', /answer:null,answeredAt:null,mailPinged:false/.test(appSrc));
  // Kabuk bütçesi: bu düzeltme app.js kabuğunu büyütmemeli (MON2-08 kuralı).
  var appLines = appSrc.split('\n').length;
  ok('app.js kabuk bütçesi içinde (≤7800)', appLines <= 7800, 'satir=' + appLines);
});

step7.then(function(){
  console.log('\n' + passed + ' geçti, ' + failed + ' başarısız.');
  console.log('SONUÇ: ' + (failed === 0 ? 'PASS' : 'FAIL') + '\n');
  process.exit(failed === 0 ? 0 : 1);
}, function(e){
  console.error('Fixture beklenmedik şekilde düştü:', e);
  process.exit(1);
});
