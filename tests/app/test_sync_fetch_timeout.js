'use strict';
// sync.js ZAMAN AŞIMI + KİLİT ÇÖZÜLMESİ sözleşmesi (2026-09-22).
//
// GERÇEK OLAY: kullanıcı yeni bir PAT girdi, "Kaydediliyor…" spinner'ı saatlerce
// dönmeye başladı ve sync-receipt'e HİÇBİR iz yazılmadı. Kök neden iki katmanlı:
//
//   1. `sync.js`'te fetch için HİÇ timeout/abort yoktu (panelde `panelFetchP`
//      vardı, uygulamada yoktu). Takılan bir istek — örn. 3,2 MB'lık
//      data/latest.json PUT'u — ne çözer ne reddeder.
//   2. `doPush` içindeki `inFlight` kilidi yalnız zincir çözülünce açılır
//      (`chain.then(done,done)`). Zincir hiç çözülmediği için kilit KALICI
//      açılmaz; sonraki tüm push'lar aynı promise'e bağlanıp aynı spinner'ı verir.
//
// Bu fixture asla çözülmeyen bir fetch mock'uyla o durumu yeniden üretir ve
// zamanlayıcıyı elle ateşleyerek doğrular: (a) push REDDEDİLİR (asılı kalmaz),
// (b) durum metni nedeni söyler, (c) inFlight kilidi açılır → sonraki push
// yeniden fetch çağırır. Ağ/DOM/localStorage gerçek değildir; hiçbir yere
// yazılmaz. Çalıştırma: node tests/app/test_sync_fetch_timeout.js

var fs = require('fs');
var path = require('path');
var repoRoot = require('../repo-root');

if (typeof TextEncoder === 'undefined') global.TextEncoder = require('util').TextEncoder;
if (typeof TextDecoder === 'undefined') global.TextDecoder = require('util').TextDecoder;

var TOKEN = 'github_pat_' + 't'.repeat(24);

var passed = 0, failed = 0;
function ok(name, cond, detail) {
  if (cond) { passed++; console.log('  ✓ ' + name); }
  else { failed++; console.log('  ✗ ' + name + (detail !== undefined ? ' — ' + JSON.stringify(detail) : '')); }
}
function section(t) { console.log('\n' + t); }

// ── Zamanlayıcı: sync.js'in kurduğu timeout'u ELLE ateşleyebilmek için yakala ──
var _timers = [];
var _fetchCalls = [];
var _mode = 'hang'; // 'hang' | 'reject'
var _neverResolve;
function _resetTimers() { _timers = []; }

function boot() {
  var ls = {};
  ls['seyma-reset-v1'] = JSON.stringify({
    startDate: '2026-09-22',
    savedAt: new Date().toISOString(),
    days: {},
    settings: { ghToken: TOKEN, ghRepo: 'owner/repo', ghBranch: 'main' },
  });
  global.localStorage = {
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(ls, k) ? ls[k] : null; },
    setItem: function (k, v) { ls[k] = String(v); },
    removeItem: function (k) { delete ls[k]; },
    clear: function () { ls = {}; },
  };
  global.location = { protocol: 'https:', hostname: 'mustafaras.github.io', search: '' };
  global.window = { addEventListener: function () {}, SeySync: null };
  global.document = { getElementById: function () { return null; } };
  global.AbortController = function () { this.signal = {}; this.abort = function () {}; };

  _timers = [];
  _fetchCalls = [];
  _mode = 'hang';
  _neverResolve = new Promise(function () {});
  global.fetch = function (url, opts) {
    _fetchCalls.push({ url: url, opts: opts || {} });
    if (_mode === 'hang') return _neverResolve;          // takılan istek
    return Promise.reject(new Error('mock reject'));      // sonraki istekler hızlı düşsün
  };
  global.setTimeout = function (fn, ms) { _timers.push({ fn: fn, ms: ms, fired: false }); return _timers.length; };
  global.clearTimeout = function () { /* no-op: shim `settled` ile korunuyor */ };

  // sync.js IIFE — window.SeySync'ı kurar.
  var src = fs.readFileSync(path.join(repoRoot, 'sync.js'), 'utf8');
  new Function(src)();
  return global.window.SeySync;
}

function fireTimeouts() {
  var n = 0;
  _timers.forEach(function (t) { if (!t.fired) { t.fired = true; t.fn(); n++; } });
  return n;
}

console.log('\n=== sync.js Zaman Aşımı + Kilit Çözülmesi Sözleşmesi ===\n');

// ── 1) Takılan istek ASILI KALMAZ: timeout ile SONUÇLANIR ───────────────────
// SÖZLEŞME: doPush başarısızlıkta REDDETMEZ; son catch içinde `null` ile
// ÇÖZÜLÜR (hata makbuza + durum metnine yazılır). Asıl kusur "hiç
// sonuçlanmama"ydı; fixture onu ölçer.
section('1. Asla çözülmeyen fetch → push SONUÇLANIR (asılı kalmaz)');

var syncApi = boot();
var settled = 'pending', resolvedValue = 'unset';
var p = syncApi.pushNow();
p.then(function (v) { settled = 'resolved'; resolvedValue = v; }, function () { settled = 'rejected'; });

ok('pushNow bir promise döndürdü', !!(p && typeof p.then === 'function'));
ok('fetch gerçekten çağrıldı (istek başladı)', _fetchCalls.length >= 1, _fetchCalls.length);
ok('timeout zamanlayıcısı kuruldu (fetch shim aktif)',
  _timers.some(function (t) { return t.ms >= 1000; }), _timers.map(function (t) { return t.ms; }));
ok('zamanlayıcı ateşlenmeden push SONUÇLANMADI (takılı durumda)', settled === 'pending', settled);

var fired = fireTimeouts();
ok('zaman aşımları ateşlendi', fired >= 1, fired);

// Zincir birden çok aşamada fetch açar (GET sha → PUT → hata makbuzu PUT'u);
// her aşama kendi timeout'unu kurar → "boşalt": tur at, bekleyeni ateşle.
function waitTurns(n) {
  var q = Promise.resolve();
  for (var i = 0; i < n; i++) q = q.then(function () { return Promise.resolve(); });
  return q;
}
function drain(rounds) {
  var i = 0, firedTotal = 0;
  function step() {
    if (i++ >= rounds) return Promise.resolve(firedTotal);
    firedTotal += fireTimeouts();
    return waitTurns(6).then(step);
  }
  return step();
}

drain(12).then(function (totalFired) {

  section('2. Sonuçlandıktan sonra durum metni NEDENİ söyler');
  ok('push sonuçlandı (asılı kalmadı)', settled !== 'pending', settled);
  ok('başarısızlık `null` ile çözülür (sözleşme: reddetmez)',
    settled === 'resolved' && resolvedValue === null, { settled: settled, v: resolvedValue });
  ok('birden çok aşamanın timeout\'u ateşlendi', totalFired >= 1, totalFired);
  var txt = String(syncApi.statusText());
  ok('durum metni artık "Kaydediliyor…" DEĞİL', txt.indexOf('Kaydediliyor') < 0, txt);
  ok('durum metni bir neden adlandırıyor',
    /Zaman aşımı|Yetki|Repo|hatası|hata/i.test(txt), txt);

  // ── 3) inFlight kilidi AÇILDI → sonraki push yeniden denemeli ─────────────
  section('3. inFlight kilidi açılır → sonraki push yeniden fetch çağırır');
  _mode = 'reject'; // sonraki istekler hızlı düşsün (asılı kalmasın)
  var before = _fetchCalls.length;
  _resetTimers();
  syncApi.pushNow();
  ok('ikinci push YENİ bir fetch çağrısı yaptı (kilit açık)',
    _fetchCalls.length > before, { before: before, after: _fetchCalls.length });
  return drain(8);
}).then(function () {

  // ── 4) Kaynak sözleşmesi: shim gerçekten var ve doğru kurulmuş ────────────
  section('4. Kaynak sözleşmesi (sessizce geri gitmesin)');
  var src = fs.readFileSync(path.join(repoRoot, 'sync.js'), 'utf8');
  ok('GH_FETCH_TIMEOUT_MS sabiti tanımlı', /var GH_FETCH_TIMEOUT_MS\s*=\s*\d+/.test(src));
  ok('IIFE içinde fetch gölgeleniyor (function fetch(...))', /function fetch\(url,\s*opts,\s*timeoutMs\)/.test(src));
  ok('AbortController ile iptal ediliyor', /new AbortController\(\)/.test(src));
  ok('timeout hatası `code=timeout` taşıyor + SYNC_ERROR_CODES\'a kayıtlı',
    /e\.code='timeout'/.test(src) && /timeout:1/.test(src));
  ok('timeout için görünür durum metni var', /timeout:'Zaman aşımı/.test(src));
  ok('sync-throw KORUNUYOR (executor dışında impl çağrılır)',
    /var pending=impl\(url,opts\);\s*\n\s*if\(!pending\|\|typeof pending\.then!=='function'\) return Promise\.resolve\(pending\)/.test(src));
  ok('kendini çağırma koruması var (impl!==fetch)',
    /g\.fetch!==fetch/.test(src) && /w\.fetch!==fetch/.test(src));
  ok('gerçek fetch her ÇAĞRIDA çözülür (yükleme anında yakalanmaz)',
    src.indexOf('var _realFetch=null') < 0);

  // ── 5) app.js: resolved-null artık ele alınıyor ───────────────────────────
  section('5. app.js saveNow: çözülen-null durumu hata gösterir');
  var appSrc = fs.readFileSync(path.join(repoRoot, 'app.js'), 'utf8');
  ok('saveNow resolved değeri kontrol ediyor',
    /typeof pending\.then==='function'/.test(appSrc) && /if\(rc\) return;/.test(appSrc));
  ok('syncFailureText zaman aşımını kapsıyor', /code==='offline'\|\|code==='network'\|\|code==='timeout'/.test(appSrc));

  section('');
  console.log((failed === 0 ? '✓' : '✗') + ' ' + passed + ' geçti, ' + failed + ' başarısız\n');
  process.exit(failed === 0 ? 0 : 1);
}).catch(function (e) {
  console.log('  ✗ test exception: ' + (e && e.stack || e));
  process.exit(1);
});
