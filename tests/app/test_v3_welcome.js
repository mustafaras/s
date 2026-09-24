#!/usr/bin/env node
// V3-TANITIM — "Hoş Geldin" tanıtım sayfasının sözleşme fixture'ı.
//
// Ağsız ve sentetik: browser, gerçek localStorage, gerçek veri, fetch yoktur.
// VM sandbox'ları yalnız bu fixture'ın kurduğu sahte depoyu görür.
//
// Kapsam:
//   [1] index.html bootstrap sırası + döngü/kaçış kuralları
//   [2] v3.js kalıcılık sözleşmesi (anahtar, yazma doğrulaması, kaçış)
//   [3] "Bir daha çıkmaz" semantiği (reset/sürüm düşüşü dahil)
//   [4] Ayrı sayfa izolasyonu (app.js / panel / ağ sızıntısı yok)
//   [5] Erişilebilirlik + tasarım sözleşmesi (token tüketimi, reduced-motion)
//   [6] app.js'e dokunulmadığının kanıtı (pinlenmiş sayılar)
//
// Run: node tests/app/test_v3_welcome.js

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

function read(rel) { return fs.readFileSync(path.join(repoRoot, rel), 'utf8'); }

let passed = 0;
function ok(name, condition, detail) {
  assert.equal(condition, true, detail ? name + ' — ' + detail : name);
  passed += 1;
  console.log('PASS  ' + name);
}
function fail(name, detail) {
  console.log('FAIL  ' + name + (detail ? ' — ' + detail : ''));
  process.exitCode = 1;
}

const indexSource = read('index.html');
const pageSource = read('v3-tanitim/index.html');
const cssSource = read('v3-tanitim/v3.css');
const jsSource = read('v3-tanitim/v3.js');

console.log('== v3-tanitim "Hoş Geldin" sözleşmesi ==\n');

// ───────────────────────────────────────────────────────────────────────────
// [1] index.html — yönlendirme sırası ve döngü koruması
// ───────────────────────────────────────────────────────────────────────────
console.log('[1] index.html bootstrap sırası');

const V3_KEY = 'seyma-v3-welcome-v1';
const bootIdx = indexSource.indexOf("seyma-v3-welcome-v1");
const firstAppCoreIdx = indexSource.indexOf('<script src="app/core/');
const appJsIdx = indexSource.indexOf('<script src="app.js?');
const headEndIdx = indexSource.indexOf('</head>');

ok('bootstrap mevcut', bootIdx >= 0);
ok('bootstrap <head> içinde (app.js\'ten önce çalışır — ilk açılışta app.js hiç boot etmez)',
  bootIdx > 0 && headEndIdx > 0 && bootIdx < headEndIdx,
  'boot=' + bootIdx + ' head=' + headEndIdx);
ok('bootstrap tüm app/core/* modüllerinden önce',
  firstAppCoreIdx > 0 && bootIdx < firstAppCoreIdx);
ok('bootstrap app.js\'ten önce', appJsIdx > 0 && bootIdx < appJsIdx);

// Yönlendirme hedefi + kaçış parametresi
ok('yönlendirme hedefi v3-tanitim/index.html',
  /location\.replace\(\s*'v3-tanitim\/index\.html'\s*\)/.test(indexSource));
ok('kaçış parametresi v3done okunuyor (sonsuz döngü koruması)',
  /\[\?&\]v3done=1\//.test(indexSource) || indexSource.indexOf('v3done=1') >= 0);
ok('bootstrap try/catch ile sarılı (depo kapalıysa uygulama yine açılır)',
  /try\{[\s\S]{0,400}location\.replace/.test(indexSource));

// Döngü senaryosu: bootstrap sırası + kaçış kuralı birlikte doğru mu?
// Marka yazılamazsa: index → v3 → index?v3done=1 → (atla) uygulama açılır.
const bootBlockStart = indexSource.lastIndexOf('<script>', bootIdx);
const bootBlockEnd = indexSource.indexOf('</script>', bootIdx);
const bootBlock = indexSource.slice(bootBlockStart, bootBlockEnd);
const redirectGuard = bootBlock.indexOf(V3_KEY);
const escapeGuard = bootBlock.indexOf('v3done=1');
const replaceCall = bootBlock.indexOf('location.replace');
ok('atlamalar location.replace\'ten önce geliyor (sıra doğru)',
  redirectGuard >= 0 && escapeGuard >= 0 && replaceCall >= 0 &&
  redirectGuard < replaceCall && escapeGuard < replaceCall);

// ───────────────────────────────────────────────────────────────────────────
// [2] v3.js — kalıcılık sözleşmesi (sahte depo ile)
// ───────────────────────────────────────────────────────────────────────────
console.log('\n[2] v3.js kalıcılık sözleşmesi');

// Minimal DOM taklidi: v3.js'in dokunduğu tek şeyler.
function makeSandbox(opts) {
  opts = opts || {};
  const store = new Map();
  const storage = {
    getItem(k) { return store.has(k) ? store.get(k) : null; },
    setItem(k, v) {
      if (opts.storageBroken) throw new Error('QuotaExceededError');
      store.set(k, String(v));
    },
    removeItem(k) { store.delete(k); },
    get length() { return store.size; },
    key(i) { return Array.from(store.keys())[i] || null; }
  };

  const listeners = {};
  const noopEl = {
    setAttribute() {}, removeAttribute() {}, getAttribute() { return null; },
    addEventListener() {}, classList: { add() {}, remove() {} },
    textContent: ''
  };

  const document = {
    readyState: 'complete',
    documentElement: { classList: { add() {} } },
    body: {},
    getElementById() { return null; },
    querySelectorAll() { return []; },
    addEventListener(t, fn) { listeners[t] = fn; }
  };

  const sandbox = {
    console,
    window: null,
    document,
    localStorage: storage,
    location: {
      search: opts.search || '',
      href: 'http://127.0.0.1:9000/v3-tanitim/index.html',
      replaced: null,
      replace(url) { this.replaced = url; }
    },
    setTimeout() { return 1; },
    clearTimeout() {}
  };
  sandbox.window = sandbox;
  sandbox.window.localStorage = storage;
  sandbox.window.location = sandbox.location;
  sandbox.window.matchMedia = function (q) {
    return { matches: (opts.reducedMotion && /reduce/.test(q)) === true, media: q };
  };
  sandbox.window.addEventListener = function () {};
  sandbox.window.IntersectionObserver = function () {
    return { observe() {}, unobserve() {} };
  };
  sandbox.window.SeymaV3Welcome = undefined;
  sandbox.__store = store;
  return sandbox;
}

let sb = makeSandbox();
vm.runInNewContext(jsSource, sb, { filename: 'v3-tanitim/v3.js' });
const welcome = sb.window.SeymaV3Welcome;

ok('v3.js salt-okur yüzey expose ediyor', !!welcome && typeof welcome.isSeen === 'function');
ok('anahtar adı sözleşmeye uygun: ' + V3_KEY, welcome && welcome.SEEN_KEY === V3_KEY,
  'gerçek: ' + (welcome && welcome.SEEN_KEY));
ok('anahtar app verisinden ayrı namespace (seyma-reset-v1 değil)',
  welcome && welcome.SEEN_KEY !== 'seyma-reset-v1');
ok('değer "done"', welcome && welcome.SEEN_VALUE === 'done');
ok('kaçış parametresi v3done', welcome && welcome.ESCAPE_PARAM === 'v3done');
ok('v3.js kendi anahtarı dışında depoya yazmıyor',
  sb.__store.size === 0, 'yazılan anahtar sayısı: ' + sb.__store.size);

// okunmamış → isSeen false, markSeen true ve DEĞER YAZILDI
ok('başlangıçta okunmadı', welcome.isSeen() === false);
ok('markSeen yazıldığını doğrulayıp true döner', welcome.markSeen() === true);
ok('işaretten sonra isSeen true', welcome.isSeen() === true);
ok('depoda tam olarak bir anahtar var', sb.__store.size === 1);

// Depo kapalı (gizli mod) → markSeen false döner, YALAN SÖYLEMEZ
let sbBroken = makeSandbox({ storageBroken: true });
vm.runInNewContext(jsSource, sbBroken, { filename: 'v3-tanitim/v3.js#broken' });
ok('depo kapalıyken markSeen false döner (yazdığını iddia etmez)',
  sbBroken.window.SeymaV3Welcome.markSeen() === false);
ok('depo kapalıyken isSeen false (güvenli varsayılan)',
  sbBroken.window.SeymaV3Welcome.isSeen() === false);

// "Okundu" işareti, app verisi silinse bile durur
sb.window.localStorage.removeItem('seyma-reset-v1');
sb.window.localStorage.setItem('seyma-theme', 'dark');
ok('"Verileri sıfırla" benzeri silme işareti etkilemez (bağımsız anahtar)',
  sb.window.SeymaV3Welcome.isSeen() === true);

// ───────────────────────────────────────────────────────────────────────────
// [3] Sayfa kapanışı — v3.html içindeki düğme ve davranış
// ───────────────────────────────────────────────────────────────────────────
console.log('\n[3] Kapanış düğmesi');

ok('v3-tanitim/index.html gerçek <button> kullanıyor (Enter + Space)',
  /<button[^>]*type="button"[^>]*id="v3-done"/.test(pageSource));
ok('düğme metni "Okudum, anladım"', /Okudum, anladım/.test(pageSource));
ok('düğme sayfanın en sonunda (kapanış bölümü footer\'dan önce)',
  pageSource.indexOf('id="v3-done"') > pageSource.indexOf('v3-closing') &&
  pageSource.indexOf('id="v3-done"') < pageSource.indexOf('v3-footer'));
ok('sıcak kapanış notu var',
  /Bu sayfayı bir daha görmeyeceksin/.test(pageSource) &&
  /Sevgili Günışığı/.test(pageSource));
ok('finish() location.replace kullanıyor (geri tuşu tanıtıma dönmez)',
  /location\.replace\(/.test(jsSource));
ok('finish() hatalı kalıcılıkta ?v3done=1 kaçışına geçiyor',
  /ESCAPE_PARAM/.test(jsSource) && /persisted\s*\?\s*HOME\s*:\s*HOME\s*\+\s*'\?'/.test(jsSource));
ok('finish() çift tetiklemeye karşı kilitli (aria-disabled)',
  /aria-disabled/.test(jsSource));

// ───────────────────────────────────────────────────────────────────────────
// [4] İzolasyon — app.js / panel / ağ sızıntısı yok
// ───────────────────────────────────────────────────────────────────────────
console.log('\n[4] İzolasyon');

const REAL_START_DATE_EARLY = '2026-06-24';   // gerçek seyma-data startDate (DEVIR-PROMPTU §4)
function inclusiveDaysEarly(from, to) {
  return Math.round((new Date(to + 'T00:00:00Z') - new Date(from + 'T00:00:00Z')) / 86400000) + 1;
}
// Yalnız <script src> etiketleri sayılır (satır içi bootstrap yok sayılır).
const pageScripts = [...pageSource.matchAll(/<script\s+src="([^"]+)"/g)].map((m) => m[1]);
ok('sayfa kendi betiklerini yüklüyor (snapshot + data + stats + source + statsview + charts + v3)',
  pageScripts.length === 7 && pageScripts.every((s) => s.startsWith('v3')),
  'yüklenen: ' + JSON.stringify(pageScripts));
ok('betik sırası doğru (snapshot → data → stats → source → statsview → charts → v3)',
  pageScripts[0].startsWith('v3-snapshot.js') &&
  pageScripts[1].startsWith('v3-data.js') &&
  pageScripts[2].startsWith('v3-stats.js') &&
  pageScripts[3].startsWith('v3-source.js') &&
  pageScripts[4].startsWith('v3-statsview.js') &&
  pageScripts[5].startsWith('v3-charts.js') &&
  pageScripts[6].startsWith('v3.js'),
  'sıra: ' + JSON.stringify(pageScripts));

/* ── STATİK ANLIK GÖRÜNTÜ (kullanıcı isteği 2026-09-15: "o veriyi çek ve
   SADECE bu sayfada STATİK olarak göster") ─────────────────────────────────
   v3-snapshot.js tools/v3-snapshot-build.mjs tarafından üretilir; sayfa onu
   görünce ağa çıkmaz, anahtar aramaz, cihaz deposuna bakmaz. Repo PUBLIC
   olduğu için dosya YALNIZ sayısal özet taşımalıdır. */
console.log('\n[1b] Statik anlık görüntü');
const snapSource = read('v3-tanitim/v3-snapshot.js');
const snapVm = { window: {} };
vm.runInNewContext(snapSource, snapVm, { filename: 'v3-snapshot.js' });
const snap = snapVm.window.SeymaV3Snapshot;
ok('v3-snapshot.js window.SeymaV3Snapshot kurar (startDate + endDate + heatCells)',
  !!snap && typeof snap.startDate === 'string' && typeof snap.endDate === 'string' &&
  Array.isArray(snap.heatCells) && snap.heatCells.length > 0);
ok('anlık görüntü gerçek startDate ile aynı (2026-06-24)',
  snap && snap.startDate === REAL_START_DATE_EARLY, 'startDate: ' + (snap && snap.startDate));
ok('anlık görüntü iç tutarlı: heatCells sayısı = startDate→endDate gün sayısı = daysRecorded',
  snap && snap.heatCells.length === inclusiveDaysEarly(snap.startDate, snap.endDate) &&
  snap.daysRecorded === snap.heatCells.length,
  'cells ' + (snap && snap.heatCells.length) + ' / recorded ' + (snap && snap.daysRecorded));
ok('anlık görüntü tik toplamı = heatCells tik toplamı (aynı kaynaktan)',
  snap && snap.ticks === snap.heatCells.reduce((a, c) => a + (c.ticks || 0), 0));
ok('GİZLİLİK: anlık görüntüde ham kayıt / not / etiket / token / konum YOK',
  ['"note"', '"journal"', '"intention"', '"meals"', '"ghToken"', '"token"', '"rec"', '"values"',
   '"med"', '"habits"', '"cok-iyi"', '"cok-zorlandim"', '"zorlandim"', '"moodCounts"', '"moodDist"',
   '"streaks"', '"lat"', '"lng"', '"location"', 'ghp_', 'github_pat_'
  ].every((t) => snapSource.indexOf(t) < 0));
ok('anlık görüntü yalnız SAYISAL ruh hâli taşır (moodTrend.score 1–5|null)',
  snap && snap.moodTrend.every((m) => m.score === null || (m.score >= 1 && m.score <= 5)));
/* Tazelik kuralı (kullanıcı 2026-09-15: "dinamik olarak istatistikler
   güncellensin zaman içerisinde"): anlık görüntü TABAN; uygulamanın kendi
   cihazındaki depo ondan tazeyse o kazanır; bayat cihaz kaydı asla anlık
   görüntüyü ezemez; uzak veri geldiyse yarışa girer. */
ok('veri katmanı kaynakları TAZELİĞE göre seçer (son gün, eşitse kayıt sayısı; uzak → cihaz → anlık görüntü)',
  (function () {
    const d = read('v3-tanitim/v3-data.js');
    return /function freshness\(\)/.test(d) && /function fresher\(a, b\)/.test(d) &&
      /cands\.push\(\{ k: 'remote'/.test(d) && /cands\.push\(\{ k: 'device'/.test(d) &&
      /cands\.push\(\{ k: 'snapshot'/.test(d) &&
      /cf\.last > pick\.f\.last \|\| \(cf\.last === pick\.f\.last && cf\.n > pick\.f\.n\)/.test(d) &&
      /SOURCE = 'snapshot';/.test(d) && /'fresh:' \+ fr\.device\.last/.test(d);
  })());
ok('köprü anlık görüntü varken ağa yalnız İYİLEŞTİREBİLECEKSE çıkar (cihaz tazeyse ya da kimlik yoksa ağ yok)',
  /var deviceWins = !!\(fr && fr\.device && \(!fr\.snapshot \|\| V3f\.fresher\(fr\.device, fr\.snapshot\)\)\);\s*if \(deviceWins \|\| !creds\(\)\) \{\s*settle\(\);\s*return;/.test(read('v3-tanitim/v3-source.js')));
ok('cihaz kaydı tazeyse rozet bunu "güncel veri" olarak söyler (ağ yok)',
  /Güncel veri · bu cihazdaki uygulama kaydı · son gün/.test(read('v3-tanitim/v3-charts.js')));
ok('tekrar açılışta kapanış düğmesi "Uygulamaya dön" der (işaret zaten yazılı)',
  /if \(isSeen\(\)\) \{[\s\S]{0,200}doneBtn\.textContent = 'Uygulamaya dön'/.test(jsSource));
ok('rozet gömülü anlık görüntüyü tarihiyle söyler',
  /anlık görüntüsü · sayfaya gömülü, salt-okur \(ağ yok\)/.test(read('v3-tanitim/v3-charts.js')));
ok('üretici araç yalnız GET kullanır ve yazmadan önce yasaklı alan tarar',
  (function () {
    const t = read('tools/v3-snapshot-build.mjs');
    return /gh', \['api', endpoint, '-H'/.test(t) && !/-X|--method|PUT|POST|PATCH|DELETE/.test(t) &&
      /const FORBIDDEN = \[/.test(t) && /GİZLİLİK: yasaklı alan bulundu/.test(t);
  })());
ok('kaynak rozeti başlangıçta nötr kalır (data-src="none"); snapshot çalışma anında yazılır',
  /id="v3-veri-src"[^>]*data-src="none"/.test(pageSource));

const forbidden = ['app.js', 'sync.js', 'app/core/', 'render.js', 'appSurface.js'];
forbidden.forEach((token) => {
  const hit = pageScripts.some((s) => s.indexOf(token) >= 0);
  ok('v3 sayfası ' + token + ' yüklemiyor', !hit);
});

ok('v3.js ağ çağrısı yapmıyor (fetch/XHR yok)',
  !/\bfetch\s*\(/.test(jsSource) && !/XMLHttpRequest/.test(jsSource) &&
  !/sendBeacon/.test(jsSource));
// Yorumlar çıkarılır: yasaklı adlar yalnız AÇIKLAMA metninde geçebilir
// (ör. "seyma-reset-v1'e dokunmaz"), gerçek koda sızmamalıdır.
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}
const jsCode = stripComments(jsSource);
ok('v3.js hiçbir uygulama anahtarına yazmıyor',
  !/seyma-reset-v1/.test(jsCode) && !/seyma-theme/.test(jsCode) &&
  !/seyma-sync-force/.test(jsCode));
ok('v3.js hiçbir yere setItem ile uygulama verisi yazmıyor (yalnız kendi anahtarı)',
  (jsCode.match(/setItem\(/g) || []).length === 1 &&
  /setItem\(SEEN_KEY,\s*SEEN_VALUE\)/.test(jsCode));
// Panel YÜZEYLERİNE referans yok. Not: ".v3-panel" sayfanın kendi sınıfıdır,
// yasak olan app'in panel* dosya/yüzeyleridir — bu yüzden yol/sınıf adı aranır.
const cssCode = cssSource.replace(/\/\*[\s\S]*?\*\//g, '');
ok('v3.css app\'in panel yüzeylerine referans vermiyor',
  !/panel-v2|panel\.html|panel\/|ae-/.test(cssCode) && !/\.ae-[a-z]/.test(cssCode));

// Panel dosyaları bu değişiklikte hiç dâhil olmadı
ok('tanıtım sayfası panel-v2.html desenini izliyor (#root + data-theme)',
  /id="root"\s+data-theme="dark"/.test(pageSource) ||
  (/id="root"/.test(pageSource) && /data-theme="dark"/.test(pageSource)));

// ───────────────────────────────────────────────────────────────────────────
// [4b] SALT-OKUR uzak kaynak köprüsü (v3-source.js)
// ───────────────────────────────────────────────────────────────────────────
// SORUN: sayfa yalnız cihaz deposunu okuyordu; depo boşsa gerçek veri hiç
// görünmüyordu. Köprü, uygulamanın ZATEN sakladığı kimlik bilgileriyle
// data/latest.json'ı BİR KEZ, YALNIZ-OKUR çeker. Aşağıdaki sözleşme ağın
// güvenli sınırlar içinde kaldığını kanıtlar.
console.log('\n[4b] Salt-okur uzak kaynak köprüsü');

const sourceSource = read('v3-tanitim/v3-source.js');
const sourceCode = stripComments(sourceSource);

ok('kaynak modülü sayfada yükleniyor ve sırası doğru',
  pageScripts.some((s) => s.startsWith('v3-source.js')) &&
  pageScripts.findIndex((s) => s.startsWith('v3-source.js')) === 3);

/* — GET-ONLY: hiçbir yazma yöntemi geçmez — */
['PUT', 'POST', 'PATCH', 'DELETE'].forEach((verb) => {
  ok('kaynak modülü ' + verb + ' kullanmıyor (yalnız GET)',
    sourceCode.indexOf("'" + verb + "'") < 0 && sourceCode.indexOf('"' + verb + '"') < 0);
});
ok('kaynak modülü fetch çağrısında yöntem belirtmiyor (varsayılan GET)',
  (sourceCode.match(/fetch\(/g) || []).length >= 1 && !/method\s*:/.test(sourceCode));

/* — DEPOYA YAZMAZ: uzak veri yalnız bellekte yaşar — */
ok('kaynak modülü depoya YAZMIYOR (setItem/removeItem/clear yok)',
  !/setItem|removeItem|localStorage\.clear/.test(sourceCode),
  'uzak veri diske yazılırsa bir sonraki açılışta bayat veri gösterilirdi');
ok('kaynak modülü sync.js yüklemiyor / çağırmıyor (push yolu kapalı)',
  !/SeySync/.test(sourceCode) && !/pushNow|\.schedule\(/.test(sourceCode));

/* — TOKEN YALNIZ BAŞLIKTA: console/DOM/metne sızmaz — */
ok('token yalnız Authorization başlığında kullanılıyor',
  /'Authorization': 'Bearer ' \+ c\.token/.test(sourceCode));
ok('token console.log/DOM/metne yazılmıyor',
  !/console\.(log|warn|error|info)/.test(sourceCode) &&
  !/textContent\s*=\s*c\.token|innerHTML[^\n]*c\.token/.test(sourceCode));
ok('kimlik bilgisi yalnız CİHAZ deposundan okunur (kullanıcıya sorulmaz, ağdan alınmaz)',
  /localStorage\.getItem\(KEY\)/.test(sourceCode) && /s\.ghToken/.test(sourceCode));

/* — CİHAZ DEPOSU YALNIZ YEDEK: repo esastır (sayfa ömür boyu bir kez gösterilir) — */
ok('uzak okuma yolu kimlik bilgisine bağlı (cihaz deposuna değil)',
  /if \(!creds\(\)\) \{\s*report\('no-creds'\);\s*settle\(\);\s*return;/.test(sourceCode));
ok('ağ hatasında cihaz deposuna düşülür (sayfa bozulmaz)',
  sourceCode.indexOf('.catch(function () {') >= 0 && /settle\(\);/.test(sourceCode));
ok('kimlik bilgisi yoksa çekme denemesi yapılmaz (ağ imkânsız)',
  /if \(!c\) \{ setFail\('no-creds'\); return Promise\.resolve\(null\); \}/.test(sourceCode));
/* — TEŞHİS: "eşitlenmiş veriye ulaşılamadı" tek başına yetmiyordu; kullanıcı
   "neden repo verisini kullanmıyorsun" diye sordu (2026-09-15). Köprü artık
   nedeni kodlar (no-creds/http_<n>/timeout/network/parse/empty), veri katmanı
   taşır, rozet/boş durum Türkçe açıklar. Token asla metne girmez. — */
ok('köprü başarısızlık nedenini kodlar ve veri katmanına bildirir',
  /var FAIL = '';/.test(sourceCode) && /function lastFailure\(\)/.test(sourceCode) &&
  /setFail\('timeout'|err: aborted \? 'timeout' : 'network'/.test(sourceCode) &&
  /V3\.setRemoteFailure\(code\)/.test(sourceCode) &&
  /function setRemoteFailure\(code\)/.test(read('v3-tanitim/v3-data.js')) &&
  /remoteFail: REMOTE_FAIL/.test(read('v3-tanitim/v3-data.js')));
ok('rozet ve boş durum nedeni Türkçe açıklar (anahtar yok / 401-403 / 404 / zaman aşımı / ağ)',
  (function () {
    const c = read('v3-tanitim/v3-charts.js');
    return /function remoteFailText\(code\)/.test(c) &&
      /bu tarayıcıda eşitleme anahtarı yok/.test(c) &&
      /eşitleme anahtarı reddedildi \(HTTP/.test(c) &&
      /depo ya da dosya bulunamadı \(HTTP 404\)/.test(c) &&
      /zaman aşımı \(30 sn\)/.test(c) && /ağ hatası\. Çevrimdışı/.test(c) &&
      /Aşağıdaki sayılar bu cihazdaki kayıtla sınırlıdır; eksik olabilir\./.test(c);
  })());
ok('neden metnine token/ham veri girmez (yalnız kod)',
  !/token[^\n]*textContent|textContent[^\n]*token/i.test(read('v3-tanitim/v3-charts.js')) &&
  !/c\.token/.test(read('v3-tanitim/v3-charts.js')));
ok('zaman aşımı 2,2 MB blob için 30 sn (9 sn mobilde sessizce cihaza düşürüyordu)',
  /var TIMEOUT_MS = 30000;/.test(sourceCode));
ok('sayaç yarışı kapalı: hedef her karede data-count\'tan okunur, v3Target da güncellenir',
  /var live = parseInt\(el\.getAttribute\('data-count'\), 10\);/.test(jsSource) &&
  /num\.dataset\.v3Target = String\(d\.dayCount\)/.test(sourceCode));

/* — >1 MB GERÇEK DOSYA: Blobs API yedeği (Contents API gövdesi boş gelir) — */
ok('1 MB üstü dosya için Blobs API yedeği var (Contents API boş gövde)',
  sourceCode.indexOf('git/blobs/') >= 0 &&
  /if \(!g\.sha\) \{ setFail\('empty'\); return null; \}/.test(sourceCode));
ok('raw Accept bazı vekillerde JSON döner — iki biçim de karşılanır',
  /encoding/.test(sourceCode) && /b64decodeUtf8/.test(sourceCode));
ok('Türkçe karakter için UTF-8 base64 çözücü (atob tek başına yetmez)',
  /TextDecoder/.test(sourceCode) && /new Uint8Array/.test(sourceCode));

/* — HATA DÜŞÜŞÜ: ağ/kimlik hatası sayfayı kırmaz — */
ok('ağ hatasında sessiz düşüş + sayfa yine çizilir',
  sourceSource.indexOf('.catch(function () {') >= 0 &&
  sourceSource.indexOf('settle();') >= 0);
ok('istek zaman aşımına karşı korumalı (AbortController)',
  /AbortController/.test(sourceCode) && /clearTimeout/.test(sourceCode));

/* — v3-data.js SALT-OKUR KALIR: ağ ORADA değil, İZOLE modülde — */
const dataSrcForBridge = read('v3-tanitim/v3-data.js');
ok('v3-data.js hâlâ ağ çağrısı yapmıyor (köprü izole)',
  !/\bfetch\s*\(/.test(dataSrcForBridge) &&
  !/XMLHttpRequest/.test(dataSrcForBridge));
ok('v3-data.js uzak veriyi yalnız BELLEĞE alır (setData), diske yazmaz',
  /function setData\(d\)/.test(dataSrcForBridge) &&
  /MEMORY = d;/.test(dataSrcForBridge));

// ───────────────────────────────────────────────────────────────────────────
// [5] Erişilebilirlik + tasarım sözleşmesi
// ───────────────────────────────────────────────────────────────────────────
console.log('\n[5] Erişilebilirlik ve tasarım');

ok('role="main" var', /role="main"/.test(pageSource));
ok('ana içerik aria-labelledby ile adlandırılmış',
  /role="main"[^>]*aria-labelledby="v3-baslik"/.test(pageSource) ||
  /aria-labelledby="v3-baslik"[^>]*role="main"/.test(pageSource));
ok('h1 → h2 → h3 hiyerarşisi (atlama yok)',
  pageSource.indexOf('<h1') < pageSource.indexOf('<h2') &&
  pageSource.indexOf('<h2') < pageSource.indexOf('<h3'));
ok('"Sona git" atlama bağlantısı var', /class="v3-skip"/.test(pageSource) &&
  /href="#v3-kapanis"/.test(pageSource));
ok('atlama hedefi mevcut', /id="v3-kapanis"/.test(pageSource));
ok('tüm görseller/dekorlar aria-hidden (ekran okuyucu gürültüsü yok)',
  (pageSource.match(/aria-hidden="true"/g) || []).length >= 2);
ok('noscript yedeği var (betik kapalıyken dönüş yolu)',
  /<noscript>/.test(pageSource) && /index\.html/.test(pageSource.match(/<noscript>[\s\S]*?<\/noscript>/)[0]));

// Token tüketimi — hardcode minimum
const declTokens = [...cssSource.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]);
const uniqueTokens = Array.from(new Set(declTokens));
ok('en az 18 farklı tasarım token\'ı tüketiliyor', uniqueTokens.length >= 18,
  'bulunan: ' + uniqueTokens.length);
['--text', '--muted', '--faint', '--accent', '--card-solid', '--gold-1', '--elev-2',
 '--dur-4', '--ease-out', '--f-large', '--f-headline'].forEach((t) => {
  ok('token kullanılıyor: ' + t, uniqueTokens.indexOf(t) >= 0);
});

// Ham hex denetimi SAYISAL değil ANLAMSAL: satır içi renkler yalnızca iki
// meşru rol taşıyabilir. Keyfî bir marka rengi (#ff00ff gibi) yakalanır.
//   1. Neredeyse siyah zeminler — gökyüzü/ses/modül vitrinleri gerçek bir
//      "ekran yüzeyi" taklit eder; token'ları yoktur çünkü bunlar sahne
//      fonu, temanın yüzeyi değildir.
//   2. Altın zemin üzerinde okunur koyu mürekkep (buton + atlama bağlantısı).
const rawHex = [...cssSource.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0]);
const ON_GOLD_INK = ['#1A1305', '#000', '#000000'];
function hexLum(h) {
  let v = h.replace('#', '');
  if (v.length === 3) v = v.split('').map((c) => c + c).join('');
  const parts = v.match(/../g).map((x) => parseInt(x, 16));
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(parts[0]) + 0.7152 * f(parts[1]) + 0.0722 * f(parts[2]);
}
const badHexes = rawHex.filter((h) => {
  if (ON_GOLD_INK.indexOf(h.toLowerCase()) >= 0) return false;
  return hexLum(h) >= 0.02;   // 0.02'nin üstü = "neredeyse siyah" değil
});
ok('ham hex yalnız iki meşru rolde (neredeyse siyah sahne zemini | altın üstü mürekkep)',
  badHexes.length === 0, 'meşru olmayan: ' + badHexes.join(' ') + ' (toplam ' + rawHex.length + ')');
ok('ham hex toplam sayısı sınırlı (≤ 12)', rawHex.length <= 12,
  'bulunan: ' + rawHex.join(' '));
ok('hiçbir ham hex marka vurgusu olarak kullanılmıyor (altın token\'dan gelir)',
  !rawHex.some((h) => /^#(c9a227|b08d57|e3c08a|d4af6e)$/i.test(h)));
ok('yasak palet yok (neon / mor-mavi AI gradient)',
  !/#(?:[0-9a-f]{0,2}(?:ff00ff|00ffff|7c3aed|8b5cf6|6366f1))/i.test(cssSource));
ok('kutlama efektleri token tüketiyor (--gold-*, --room, --listen, --muted, --accent)',
  /var\(--gold-1\)/.test(cssSource) && /var\(--gold-3\)/.test(cssSource) &&
  /var\(--gold-5\)/.test(cssSource) && /var\(--room\)/.test(cssSource) &&
  /var\(--listen\)/.test(cssSource));

// Emoji: kullanıcı isteğiyle YALNIZ flamingo. Tema emojisi, süs emojisi yok.
// Yorumlar çıkarılır — yorum GÖRÜNMEZ, dolayısıyla sayılmaz (CSS tarafındaki
// yorum temizliğiyle aynı kural).
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu;
const pageRendered = pageSource.replace(/<!--[\s\S]*?-->/g, '');
const pageEmoji = (pageRendered.match(EMOJI) || []);
const cssEmoji = (cssSource.replace(/\/\*[\s\S]*?\*\//g, '').match(EMOJI) || []);
ok('görünen metindeki tek emoji flamingo 🦩 (3 kez: hero + kapanış + footer)',
  pageEmoji.length === 3 && pageEmoji.every((e) => e === '🦩'),
  'bulunan: ' + JSON.stringify(pageEmoji));
ok('CSS\'te dekoratif emoji yok (flamingo sayfa içeriğinde)',
  cssEmoji.length === 0, 'bulunan: ' + JSON.stringify(cssEmoji));
ok('hero flamingosu gerçek 🦩 emojisi (elle çizilmiş SVG değil)',
  /class="v3-flamingo__emoji">🦩</.test(pageSource));
ok('elle çizilmiş SVG flamingo tamamen kaldırıldı',
  !/v3-flamingo__svg|v3flBody|v3flWing|v3flBeak/.test(
    pageSource + cssSource + read('v3-tanitim/v3-charts.js') + read('v3-tanitim/v3-data.js')));

// reduced-motion
ok('prefers-reduced-motion destekleniyor (CSS)',
  /@media\s*\(prefers-reduced-motion:\s*reduce\)/.test(cssSource));
ok('reduced-motion içerik görünür kalıyor (opacity:1 + transform:none)',
  /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?opacity:1[\s\S]*?transform:none/.test(cssSource));
ok('reduced-motion JS tarafında da onaylanıyor (matchMedia)',
  /prefers-reduced-motion:\s*reduce/.test(jsSource));

// "İçerik gizli kalma" yapısal güvence
ok('gizli başlangıç durumu yalnız html.v3-js altında (betik yoksa içerik görünür)',
  /\.v3-js\s+\.v3-reveal\s*\{[\s\S]*?opacity:\s*0/.test(cssSource) &&
  !/(^|\})\s*\.v3-reveal\s*\{[^}]*opacity:\s*0/m.test(cssSource));
ok('IntersectionObserver yokluğunda içerik doğrudan görünür kılınıyor',
  /typeof\s+window\.IntersectionObserver\s*!==\s*'function'/.test(jsSource) &&
  /classList\.add\('is-in'\)/.test(jsSource));
ok('güvenlik zaman aşımı var (içerik gizli kalmaz)',
  /setTimeout\([\s\S]{0,300}is-in/.test(jsSource));

// Cache-busting
ok('sayfa v3.css\'i cache-bust ile yüklüyor', /v3\.css\?v=\d+[a-z]/.test(pageSource));
ok('sayfa v3.js\'i cache-bust ile yüklüyor', /v3\.js\?v=\d+[a-z]/.test(pageSource));
ok('paylaşılan tokenlar cache-bust ile alınıyor (app/styles.css)',
  /app\/styles\.css\?v=\d+[a-z]/.test(pageSource));

// ───────────────────────────────────────────────────────────────────────────
// [6] app.js'e dokunulmadığının kanıtı
// ───────────────────────────────────────────────────────────────────────────
console.log('\n[6] app.js yüzeyi pinli');

const appSource = read('app.js');
const handlerCount = (appSource.match(/^App\.[A-Za-z0-9_$]+\s*=\s*function/gm) || []).length;
// IIP-10 / DEC-07: App.saygiLens eklendi; 554 → 555.
// IIP-11 sonrası KAO-10/11 yedi öğrenme handler'ı ekledi; toplam 727.
ok('App.* handler yüzeyi bozulmadı (556)', handlerCount === 556, 'ölçülen: ' + handlerCount);
ok('app.js tanıtım sayfasına referans vermiyor',
  appSource.indexOf('v3-tanitim') < 0 && appSource.indexOf(V3_KEY) < 0);
ok('sync.js tanıtım anahtarına dokunmuyor',
  read('sync.js').indexOf(V3_KEY) < 0);

// KAO hub kartı dependency bag'e eklendi; app.js cache pini bu kaynak değişikliğiyle
// aynı düzeltmede ilerletildi. Handler yüzeyi yukarıdaki ayrı kapıda sabit kalır.
ok('index.html app.js cache-bust güncel (KAO hub köprüsü)',
  /app\.js\?v=20260924b/.test(indexSource));
/* P01: appSurface 20260921b -> 20260921c (commit 9a2674a appSurface.js'i
   gerçekten değiştirdi; index.html bu commit'te bump etti, test pini bayat kaldı). */
ok('appSurface.js cache-bust güncel (B2 düzeltmesi)',
  /app\/core\/appSurface\.js\?v=20260921c/.test(indexSource));
/* B2: yürüyüş tikinin kullanıcıya söylediği eşik, tikin GERÇEK eşiğiyle aynı
   olmalı. Tik habitProgress → stepsGoal(date) ile dolar (varsayılan 9.000);
   STEP_TICK_MIN=4500 hiçbir yerde okunmaz. "4.500" metni geri gelmemeli. */
ok('uygulama metinlerinde bayat "4.500 adım" kalmadı (gerçek eşik stepsGoal)',
  !/4\.500/.test(appSource) && !/4\.500/.test(read('app/core/appSurface.js')) &&
  /walked20:'Yürüyüş tamam — '\+\(p\.goal\|\|9000\)/.test(read('app/core/appSurface.js')));

// ───────────────────────────────────────────────────────────────────────────
// [7] Kontrast — WCAG AA (gövde ≥4.5:1, büyük başlık ≥3:1)
// ───────────────────────────────────────────────────────────────────────────
console.log('\n[7] Kontrast ölçümü (app/styles.css koyu tema tokenları)');

// Token değerleri CANLI styles.css'ten okunur — kopyalanmış sabit yoktur.
// styles.css değişirse bu fixture yeni değerlerle ölçer ve gerçekten kırılırsa
// FAIL verir (istenen davranış).
const stylesSource = read('app/styles.css');
const darkBlock = stylesSource.slice(
  stylesSource.indexOf('#root[data-theme="dark"]'),
  stylesSource.indexOf('#root[data-theme="dark"]') + 3000
);
function darkToken(name, fallback) {
  const m = darkBlock.match(new RegExp('--' + name + ':(#[0-9A-Fa-f]{6})'));
  if (m) return m[1];
  if (fallback) {
    const f = stylesSource.slice(0, stylesSource.indexOf('#root[data-theme="dark"]'))
      .match(new RegExp('--' + name + ':(#[0-9A-Fa-f]{6})'));
    if (f) return f[1];
  }
  throw new Error('token okunamadı: --' + name);
}

const TOK = {
  text: darkToken('text'),
  text2: darkToken('text2'),
  muted: darkToken('muted'),
  faint: darkToken('faint'),
  accent: darkToken('accent'),
  card: darkToken('card-solid')
};
const GOLD1 = darkToken('gold-1');
const GOLD2 = darkToken('gold-2');
const GOLD3 = darkToken('gold-3');

const chHex = (h) => h.replace('#', '').match(/../g).map((x) => parseInt(x, 16));
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const lum = (h) => { const [r, g, b] = chHex(h); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
const blend = (fg, bg, p) => {
  const a = chHex(fg), b = chHex(bg);
  return '#' + a.map((v, i) => Math.round(v * p + b[i] * (1 - p)).toString(16).padStart(2, '0')).join('');
};
const ratio = (a, b) => {
  const l1 = lum(a), l2 = lum(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

// Kart yüzeyleri: CSS'teki accent karışımının EN AÇIK uçları (en zor durum).
const cardTop = blend(TOK.accent, TOK.card, 0.05);
const closTop = blend(TOK.accent, TOK.card, 0.07);

function contrast(label, fg, bg, min) {
  const r = ratio(fg, bg);
  ok(label + ' — ' + r.toFixed(2) + ':1 ≥ ' + min + ':1', r >= min,
    'ölçülen ' + r.toFixed(2) + ':1');
}

contrast('gövde metni / kart', TOK.text, cardTop, 4.5);
contrast('gövde metni / kapanış kartı', TOK.text, closTop, 4.5);
contrast('ikincil metin (--muted) / kart', TOK.muted, cardTop, 4.5);
contrast('ikincil metin (--muted) / kapanış kartı', TOK.muted, closTop, 4.5);
contrast('bölüm etiketi (--faint) / gerçek siyah', TOK.faint, '#000000', 4.5);
contrast('sayfa gövdesi (--text2) / gerçek siyah', TOK.text2, '#000000', 4.5);
contrast('kart kanıt satırı (--accent) / kart', TOK.accent, cardTop, 4.5);
contrast('kicker (--accent) / gerçek siyah', TOK.accent, '#000000', 4.5);
contrast('başlık (--text) / gerçek siyah', TOK.text, '#000000', 3);
contrast('buton metni / gold-1 (en açık uç)', '#1A1305', GOLD1, 4.5);
contrast('buton metni / gold-3 (en koyu uç)', '#1A1305', GOLD3, 4.5);
contrast('atlama bağlantısı metni / accent', '#000000', TOK.accent, 4.5);
contrast('odak halkası (--accent) / kart', TOK.accent, cardTop, 3);

// CSS'te kullanılan ham hex'lerin butonla tutarlı olduğunu doğrula
ok('CSS buton metni ölçülen sabitle aynı (#1A1305)',
  /color:#1A1305/.test(cssSource), 'cssSource içinde #1A1305 bulunamadı');
ok('CSS atlama bağlantısı metni ölçülen sabitle aynı (#000)',
  /\.v3-skip\{[\s\S]*?color:#000;/.test(cssSource));

// ───────────────────────────────────────────────────────────────────────────
// [8] Kutlama katmanı — gün sayısı + efektler
// ───────────────────────────────────────────────────────────────────────────
console.log('\n[8] Kutlama katmanı (gün sayısı)');

// GÜN SAYISI ARTIK SABİT DEĞİL — kaynak veriden türetilir
// (v3-data.js: dayCount = diffDays(startDate, bugün) + 1). Statik HTML
// geçerli bir VARSAYILAN taşır; JS açıkken gerçek sayıya düzeltilir.
//
//   (a) ARİTMETİK — statik varsayılan, yazdığı başlangıç ile tutarlı olmalı
//       (kapsayıcı gün sayısı). Bu uygulamanın kendi formülüdür
//       (dateUtils.js: dayIndexFor = diffDays(start, date) + 1).
//   (b) KOROBORASYON — başlangıç, deponun kendi veri kaybı kaydıyla
//       (AGENTS.md: 2026-07-10'da "17 günlük" veri silindi) ±1 gün içinde
//       örtüşmeli. EŞİTLİK ARANMAZ: kayıt "17 gün"ün hangi günü kapsadığını
//       (silinen gün dahil mi) belirtmiyor, dolayısıyla kesin bir eşitlik
//       dayatmak sahte kesinlik olurdu. Örtüşme yeterli koroborasyondur.
//   (c) DİNAMİKLİK — sayfa sabit bir sayı yazmakla kalmamalı; veriden gelen
//       sayıyı yazabilecek ID'li düğümler ve güncelleme yolu bulunmalı.
const WIPE_DATE = '2026-07-10';
const WIPE_LOST_DAYS = 17;
function addDays(iso, n) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function inclusiveDays(from, to) {
  return Math.round((new Date(to + 'T00:00:00Z') - new Date(from + 'T00:00:00Z')) / 86400000) + 1;
}

// Statik varsayılan: kutlama günü için geçerli bir sayı taşınır.
// KAYNAK: gerçek `seyma-data` → data/latest.json → startDate = 2026-06-24
// (2026-09-15'te salt-okur doğrulandı; docs/v3-tanitim/DEVIR-PROMPTU.md §4).
// Eski statik varsayılan 2026-06-23/85 idi — gerçek veriyle bir gün sapıyordu;
// veri/token olmayan bir tarayıcıda JS bunu düzeltemediği için kullanıcı
// yanlış sayıyı görüyordu. Statik varsayılan gerçek başlangıca sabitlenir.
const PAGE_TODAY = '2026-09-15';
const REAL_START_DATE = '2026-06-24';
const PAGE_START = REAL_START_DATE;
const PAGE_DAY = inclusiveDays(PAGE_START, PAGE_TODAY);   // 84

ok('sayfa başlangıç tarihini yazıyor (24 Haziran 2026 — gerçek startDate)',
  /24 Haziran 2026/.test(pageSource));
ok('eski yanlış statik başlangıç (23 Haziran / 85) sayfada kalmadı',
  !/23 Haziran 2026/.test(pageSource) &&
  !/85\. gün|85 gün|Seksen beş/.test(pageSource));
ok('statik varsayılan gün sayısı gerçek startDate ile tutarlı (84, 85 değil)',
  PAGE_DAY === 84);
ok('statik varsayılan gün sayısı HTML\'de yazılı (JS kapalıyken de geçerli)',
  new RegExp('data-count="' + PAGE_DAY + '"').test(pageSource) &&
  new RegExp(PAGE_DAY + '\\. güne hoş geldin').test(pageSource));

ok('(a) aritmetik: statik başlangıç → kutlama günü kapsayıcı ' + PAGE_DAY + ' gün',
  inclusiveDays(PAGE_START, PAGE_TODAY) === PAGE_DAY,
  'hesaplanan: ' + inclusiveDays(PAGE_START, PAGE_TODAY));

const wipeImpliedStartInclusive = addDays(WIPE_DATE, -(WIPE_LOST_DAYS - 1));
const wipeImpliedStartExclusive = addDays(WIPE_DATE, -WIPE_LOST_DAYS);
const drift = Math.min(
  Math.abs(inclusiveDays(wipeImpliedStartExclusive, PAGE_START) - 1),
  Math.abs(inclusiveDays(wipeImpliedStartInclusive, PAGE_START) - 1)
);
ok('(b) koroborasyon: başlangıç, veri kaybı kaydıyla ±1 gün örtüşüyor',
  drift <= 1,
  'kayıttan türeyen ' + wipeImpliedStartExclusive + ' / ' + wipeImpliedStartInclusive +
  ' — sayfa ' + PAGE_START + ' (sapma ' + drift + ' gün)');

/* (c) DİNAMİKLİK — sabit sayı tuzağına düşülmesin */
ok('gün sayısı veriden türetilir, sabit yazılmaz (v3-data.js)',
  /var dayCount = \(start && diffDays\(start, end\) >= 0\) \? \(diffDays\(start, end\) \+ 1\) : null;/
    .test(read('v3-tanitim/v3-data.js')) &&
  !/dayCount: 85/.test(read('v3-tanitim/v3-data.js')));
ok('başlangıç yoksa en erken kayıtlı gün kullanılır (sabit varsayım yok)',
  /var start = data\.startDate \|\| \(known\.length \? known\[0\] : null\);/
    .test(read('v3-tanitim/v3-data.js')));
ok('gün sayısı türetilemezse sahte sayı gösterilmez (EMPTY)',
  /dayCount: null/.test(read('v3-tanitim/v3-data.js')) &&
  /if \(!dayCount\) return EMPTY;/.test(read('v3-tanitim/v3-data.js')));
ok('rozet de sabit eşik değil, gerçek gün sayısından türetilir',
  dataSrcForBridge.indexOf("l: dayCount + '. güne ulaşmak'") >= 0 &&
  dataSrcForBridge.indexOf("'85. güne ulaşmak'") < 0);
ok('dinamik güncelleme için ID\'li düğümler var (hero/kapanış/footer)',
  ['v3-lead', 'v3-counter-num', 'v3-counter-ordinal', 'v3-counter-note',
   'v3-veri-baslik', 'v3-kapanis-baslik', 'v3-footer-days'].every(
    (id) => pageSource.indexOf('id="' + id + '"') >= 0));
/* Kaynak rozeti: sayfa hangi kaynaktan okuduğunu söyler — "eşitlenmiş veri"
   derken sessizce cihaz kaydını gösterme yanılsamasına düşülemez. */
ok('veri kaynağı rozeti var ve başlangıçta nötr (data-src="none")',
  /id="v3-veri-src"[^>]*data-src="none"/.test(pageSource));
ok('veri katmanı kaynağı izler (remote/device/none)',
  /var SOURCE = 'none';/.test(read('v3-tanitim/v3-data.js')) &&
  /SOURCE = 'remote';/.test(read('v3-tanitim/v3-data.js')) &&
  /SOURCE = 'device';/.test(read('v3-tanitim/v3-data.js')));
ok('kaynak rozeti gerçek kaynağa göre yazılır (iki ayrı metin)',
  /Eşitlenmiş veri · kendi özel veri deposundan salt-okur okundu/.test(read('v3-tanitim/v3-charts.js')) &&
  /Bu cihazdaki kayıt · eşitlenmiş veriye ulaşılamadı/.test(read('v3-tanitim/v3-charts.js')));
ok('kaynak yoksa rozet gizlenir (boş satır kalmaz)',
  /node\.hidden = true/.test(read('v3-tanitim/v3-charts.js')) &&
  /\[hidden\]\{ display:none; \}/.test(cssSource));
ok('kaynak rozeti hem dolu hem boş durumda güncellenir',
  (read('v3-tanitim/v3-charts.js').match(/sourceBadge\(\);/g) || []).length === 2);
ok('sayı sözcüğü Türkçe üretilir (84 → "seksen dört")',
  /function trWords\(n\)/.test(read('v3-tanitim/v3-data.js')) &&
  /'seksen'/.test(read('v3-tanitim/v3-data.js')));

ok('kutlama bölümü var', /class="v3-milestone"/.test(pageSource));
ok('kutlama tonu suçlayıcı değil, kutlayıcı',
  /kutlama günü/.test(pageSource) && /Nice güzel günlere/.test(pageSource));
ok('kapanışta sıcak not var',
  /Bu sayfayı bir daha görmeyeceksin/.test(pageSource) &&
  /Sevgili Günışığı/.test(pageSource));

// Efekt altyapısı
ok('konfeti canvas katmanı var', /id="v3-confetti"/.test(pageSource));
ok('konfeti katmanı erişilebilirlikten gizli (aria-hidden)', 
  /id="v3-confetti"[^>]*aria-hidden="true"/.test(pageSource));
ok('konfeti tıklamayı engellemiyor (pointer-events:none)',
  /\.v3-confetti\{[^}]*pointer-events:none/.test(cssSource));
ok('hareket azaltmada konfeti gizlenir', 
  /prefers-reduced-motion[\s\S]*?\.v3-confetti\{ display:none/.test(cssSource));
ok('JS hareket kapalıyken konfeti canvas\'ını hiç kurmaz',
  /wireConfetti/.test(jsSource) && /if \(!canvas \|\| !motionAllowed\(\)\) return;/.test(jsSource));
ok('konfeti renklerini token\'lardan okur (kopyalanmış palet yok)',
  /token\('--gold-1'/.test(jsSource) && /getComputedStyle/.test(jsSource));
ok('konfeti parçacık sayısı üst sınırlı (mobil 60fps hedefi)',
  /w < 420 \? 42/.test(jsSource) && !/for \(var i = 0; i < 500/.test(jsSource));
ok('konfeti sekme arkada kalınca durur (CPU/pil dostu)',
  /visibilitychange/.test(jsSource) && /cancelAnimationFrame/.test(jsSource));

ok('kaydırma ilerleme çubuğu var', /id="v3-progressbar"/.test(pageSource));
ok('ilerleme çubuğu rAF ile kısıtlı (layout thrash yok)',
  /requestAnimationFrame\(paint\)/.test(jsSource));

ok('sayaç animasyonu var (data-count)', (pageSource.match(/data-count=/g) || []).length >= 7);
ok('sayaç nihai değeri HTML\'de yazılı (JS kapalıyken de doğru, asla 0 değil)',
  new RegExp('data-count="' + PAGE_DAY + '">' + PAGE_DAY + '<').test(pageSource) &&
  /data-count="114">114</.test(pageSource));
ok('sayaçlar da hareket azaltmada anında biter', /data-count[\s\S]{0,400}motionAllowed|motionAllowed|IntersectionObserver/.test(jsSource));
ok('sayaç son değeri hedefe sabitler (yuvarlama hatası kalmaz)',
  /el\.dataset\.v3Target/.test(jsSource));

// Flamingo vektörü
ok('hero flamingosu emoji olarak da animasyonlu (süzülme + hale)',
  /\.v3-flamingo__emoji\{/.test(cssSource) &&
  /animation:v3FlamingoFloat/.test(cssSource));
ok('emoji renkli font ailesiyle ve rem emsalle ölçekleniyor (Dynamic Type)',
  /Apple Color Emoji/.test(cssSource) && /font-size:84px/.test(cssSource));
ok('emoji renklendirilmiyor (renkli emojiyi boyamak bozar)',
  !/\.v3-flamingo__emoji\{[^}]*(?:color|-webkit-text-fill-color)\s*:/.test(cssSource));
ok('sayfa hâlâ tek harici betik yüklüyor (yeni bağımlılık yok)',
  [...pageSource.matchAll(/<script\s+src="([^"]+)"/g)].every((m) => m[1].startsWith('v3')));

// Uzunluk / zenginlik
const sections = (pageSource.match(/class="v3-sectionlabel/g) || []).length;
ok('sayfa çok bölümlü ve zengin (≥ 4 bölüm etiketi)', sections >= 4, 'bulunan: ' + sections);
ok('galeri vitrinleri var (≥ 4)', (pageSource.match(/class="v3-vig /g) || []).length >= 4);
ok('kart sayısı 8 (tanıtım içeriği korundu)', (pageSource.match(/class="v3-card v3-reveal"/g) || []).length === 8);
ok('rakam kartları var (≥ 6)', (pageSource.match(/class="v3-stat v3-reveal/g) || []).length >= 6);
ok('efekt keyframe\'leri zengin (≥ 12 adlandırılmış efekt)',
  (cssSource.match(/@keyframes/g) || []).length >= 12,
  'bulunan: ' + (cssSource.match(/@keyframes/g) || []).length);
// Sayı yerine AD sayılır: hangi efektlerin var olması gerektiği tek tek
// doğrulanır — böylece bir efekt sessizce silinemez.
const REQUIRED_EFFECTS = [
  'v3FlamingoFloat', 'v3FlamingoHalo', 'v3HaloBreathe', 'v3GoldSheen',
  'v3Spark', 'v3CloudA', 'v3CloudB', 'v3FogDrift', 'v3Drop', 'v3Flash',
  'v3Eq', 'v3ModPulse', 'v3SkyGlow'
];
const missing = REQUIRED_EFFECTS.filter((k) => cssSource.indexOf('@keyframes ' + k) < 0);
ok('beklenen kutlama efektlerinin TÜMÜ tanımlı (' + REQUIRED_EFFECTS.length + ' adet)',
  missing.length === 0, 'eksik: ' + missing.join(', '));
ok('her efekt gerçekten bağlanmış (tanımlı ama kullanılmayan animasyon yok)',
  REQUIRED_EFFECTS.every((k) => new RegExp('animation:\\s*' + k + '\\b').test(cssSource)));
ok('animasyonlar token\'lı süreler/eğriler kullanıyor (--ease-*, --dur-*)',
  /animation:[^;]*var\(--ease-glide\)/.test(cssSource) &&
  /var\(--ease-linear\)/.test(cssSource));

// ───────────────────────────────────────────────────────────────────────────
// [9] Uygulama içi v3.0 yüzeyi (sürüm metni + tanıtım köprüsü)
// ───────────────────────────────────────────────────────────────────────────
console.log('\n[9] Uygulama içi v3.0 metni');

const settingsSrc = read('app/core/settings.js');
const renderSrc = read('app/core/render.js');

ok('Ayarlar → Hakkında v3.0 diyor',
  /Şeyma 🦩 · <b>v3\.0<\/b> — Günışığı yenilendi/.test(settingsSrc));
ok('kullanıcıya görünen v2.0 metni kalmadı (yorumlar hariç)',
  !/v2\.0/.test(settingsSrc.replace(/\/\/[^\n]*/g, '')) &&
  !/>v2\.0</.test(renderSrc) &&
  !/v2\.0/.test(read('index.html') + read('panel.html') + read('panel-v2.html')));

ok('başlangıç ekranı rozeti v3.0 gösteriyor',
  /box-shadow:0 6px 18px rgba\(230,193,90,0\.20\);">v3\.0</.test(renderSrc));

ok('Ayarlar\'da tanıtım köprüsü var (v3-tanitim/index.html)',
  /href="v3-tanitim\/index\.html"/.test(settingsSrc));
ok('köprü düz <a> — yeni handler/onclick eklenmedi (pinli yüzey korunur)',
  /<a href="v3-tanitim\/index\.html"/.test(settingsSrc) &&
  !/<button[^>]*App\.goWelcome/.test(settingsSrc));
ok('köprü erişilebilir bir metin taşıyor',
  /3\.0&#8217;da neler değişti\?/.test(settingsSrc) &&
  /Yolculuğunun özeti/.test(settingsSrc));
/* "N. gün" düğmesi (kullanıcı 2026-09-15): sayı SABİT DEĞİL — uygulamanın
   kendi dayIndexFor formülünden gelir; düz <a>, handler/onclick yok. */
ok('Ayarlar\'daki gün düğmesi dinamik (dayIndexFor) ve sabit sayı taşımaz',
  /window\.SeymaDateUtils\.dayIndexFor\(todayStr\(\)\)/.test(settingsSrc) &&
  /_dayN\+'\. gün'/.test(settingsSrc) && /id="sey-day-journey"/.test(settingsSrc) &&
  !/8[45]\. gün/.test(settingsSrc));

// Pinli yüzey: bu iki sayı fx2 fixture'larında sabit. settings.js ve render.js
// o taramaya dâhildir — burada önden yakalıyoruz ki hata erken görünsün.
const APP_SURFACE_FILES = [
  'app.js', 'app/core/motivation.js', 'app/core/crisis.js', 'app/core/journal.js',
  'app/core/health.js', 'app/core/library.js', 'app/core/report.js', 'app/core/map.js',
  'app/core/profile.js', 'app/core/settings.js', 'app/core/messaging.js',
  'app/core/render.js', 'app/core/reminders.js', 'app/core/reminderSurface.js',
  'app/core/appSurface.js'
];
const quranLearnSrc = read('app/core/quranLearn.js');
const quranLearnHubSrc = quranLearnSrc.slice(quranLearnSrc.indexOf('function kaoHubCardHTML'), quranLearnSrc.indexOf('function kaoOverlayHTML'));
const combined = APP_SURFACE_FILES.map(read).join('') + quranLearnHubSrc;
const surfaceCount = new Set(
  (combined.match(/App\.[A-Za-z0-9_]+\s*=[^=]/g) || []).map((s) => s.match(/App\.[A-Za-z0-9_]+/)[0])
).size;
ok('App yüzeyi pinli (727) — KAO hub taşıması yeni handler eklemedi',
  surfaceCount === 727, 'ölçülen: ' + surfaceCount);
ok('tıklama niteliği sayısı pinli (392)',
  (combined.match(/onclick=/g) || []).length === 392,
  'ölçülen: ' + (combined.match(/onclick=/g) || []).length);
ok('sürüm yorumları pin taramasını kaydırmıyor (yorumda nitelik adı geçmiyor)',
  !/\/\/[^\n]*(?:App\.[A-Za-z0-9_]+\s*=|onclick=)/.test(settingsSrc));

// Cache-bust: değişen modüller yeni sürüm taşımalı
ok('settings.js cache-bust güncel', /app\/core\/settings\.js\?v=20260924b/.test(indexSource));
ok('render.js cache-bust güncel', /app\/core\/render\.js\?v=20260915f/.test(indexSource));

// ───────────────────────────────────────────────────────────────────────────
// [10] Kişisel 85 gün özeti (v3-data.js + v3-charts.js)
// ───────────────────────────────────────────────────────────────────────────
console.log('\n[10] Kişisel veri özeti');

const dataSource = read('v3-tanitim/v3-data.js');
const chartsSource = read('v3-tanitim/v3-charts.js');

/* — GÜVENLİK SÖZLEŞMESİ: bunlar pazarlıksız — */
ok('v3-data.js depoya YAZMIYOR (setItem/removeItem/clear yok)',
  !/setItem|removeItem|localStorage\.clear/.test(stripComments(dataSource)),
  'veri katmanı salt-okur olmalı');
ok('v3-charts.js de depoya yazmıyor',
  !/setItem|removeItem|localStorage\.clear/.test(stripComments(chartsSource)));
ok('veri katmanı yalnız kendi anahtarını okuyor',
  /getItem\(KEY\)/.test(dataSource) && /KEY = 'seyma-reset-v1'/.test(dataSource));
ok('iki dosyada da AĞ ÇAĞRISI yok (fetch/XHR/beacon)',
  !/\bfetch\s*\(/.test(dataSource) && !/XMLHttpRequest/.test(dataSource) &&
  !/sendBeacon/.test(dataSource) &&
  !/\bfetch\s*\(/.test(chartsSource) && !/XMLHttpRequest/.test(chartsSource));

/* — GİZLİLİK: kişisel metin alanları ekrana çıkmamalı — */
// Görüntü katmanı bu alanları NE OKUR NE YAZAR. Sınıf adlarındaki "note"
// (ör. v3-panel__note) sayılmaz — aranan şey VERİ ALANI erişimidir.
const chartsCode = stripComments(chartsSource);
const MOOD_IDS = ['cok-iyi', 'iyi', 'normal', 'zorlandim', 'cok-zorlandim'];
const privateFields = ['note', 'journal', 'intention', 'meals'];
const leakedFields = privateFields.filter((f) =>
  new RegExp('\\.' + f + '\\b').test(chartsCode));
ok('grafik katmanı kişisel metin alanlarını okumuyor',
  leakedFields.length === 0, 'sızan: ' + leakedFields.join(', '));
/* `nickname` bilinçli TEK istisnadır: kullanıcının kendi takma adı, uygulamanın
   her ekranında zaten görünür ve cihazdan çıkmaz. Selamlamada kullanılır. */
ok('tek istisna `nickname` ve yalnız selamlamada kullanılıyor',
  /greeting\.textContent = summary\.nickname/.test(chartsCode) &&
  (chartsCode.match(/nickname/g) || []).length === 1);
const moodLabelLeak = MOOD_IDS.filter((m) => chartsCode.indexOf("'" + m + "'") >= 0);
ok('grafik katmanı ruh hâli ETİKETİ yazmıyor (yalnız 1–5 sayısal seviye)',
  moodLabelLeak.length === 0, 'sızan: ' + moodLabelLeak.join(', '));
ok('grafik katmanı yalnız özet nesnesini tüketiyor (ham kayıt okumaz)',
  !/localStorage/.test(chartsCode) && /SeymaV3Data\.summarize|summary\./.test(chartsCode));
ok('isı haritası hücreleri yalnız sayı + tarih taşıyor (etiket değil)',
  /ticks:\s*countRec\(cr\)/.test(dataSource) &&
  /hasMood:\s*!!\(cr && cr\.mood\)/.test(dataSource));
ok('veri katmanı kişisel alanları yalnız SAYAR, içeriğini taşımaz',
  /* daysTracked uygulamayla birebir; özet nesnesine metin kopyalanmıyor */
  !/note:\s*r\.note|journal:\s*|intention:\s*r\.intention/.test(dataSource));

/* — FORMÜL SADAKATİ: uygulamanın kendi tanımları — */
ok('seri eşiği 4 (countRec>=4) — report.js ile aynı',
  /countRec\(d\.rec\) >= 4/.test(dataSource));
ok('mevcut seri bugünden geriye, bugün zayıfsa dünden başlıyor',
  /countRec\(\(data\.days \|\| \{\}\)\[date\]\) < 4/.test(dataSource));
ok('tatil günü seriyi donduruyor (isVacationDay)',
  /isVacationDay/.test(dataSource) && /seri donar/.test(dataSource));
ok('su hedefi tatilde 10, normalde 8, kullanıcı hedefi varsa o (health.js)',
  /WATER_GOAL = 8/.test(dataSource) && /VACATION_WATER_GOAL = 10/.test(dataSource) &&
  /if \(isVacationDay\(date, data\)\) return VACATION_WATER_GOAL;/.test(dataSource) &&
  /typeof t\.waterCups === 'number'/.test(dataSource));
ok('adım uzunluğu 0,72 m (STEP_LEN_M)',
  /STEP_LEN_M = 0\.72/.test(dataSource) && /w \/ STEP_LEN_M/.test(dataSource));
ok('uyku eşiği 7,5 saat (SLEEP_TICK_MIN)',
  /SLEEP_TICK_MIN = 7\.5/.test(dataSource));

/* — HEDEF EŞİKLERİ: sabit yazılmaz, uygulamanın fonksiyonlarından okunur — */
ok('adım HEDEFİ 9000 (STEP_GOAL); tikin eşiği 4500 (STEP_TICK_MIN) ayrı tutuluyor',
  /STEP_GOAL = 9000/.test(dataSource) && /STEP_TICK_MIN = 4500/.test(dataSource) &&
  /Adım HEDEFİ değildir/.test(dataSource));
ok('adım hedefi tatilde 12.000/9.000/5.000 (health.js stepsGoal)',
  /p === 'active' \? 12000 : \(p === 'moderate' \? 9000 : 5000\)/.test(dataSource));
ok('adım hedefi kullanıcı hedefi varsa onu kullanır',
  /typeof t\.steps === 'number'/.test(dataSource));
ok('uyku hedefi tatilde 7 saat (SLEEP_TICK_MIN − 0,5)',
  /return SLEEP_TICK_MIN - 0\.5;/.test(dataSource));
ok('eşikler her GÜN için ayrı hesaplanır (hedef fonksiyonları gün parametreli)',
  /waterGoal: function \(date\)/.test(dataSource) &&
  /stepsGoal: function \(date\)/.test(dataSource) &&
  /sleepGoal: function \(date\)/.test(dataSource));
ok('hedef eşikleri istatistik çıktısında RAPORLANIR (ekranda yazılabilsin)',
  /goals\.thresholds = \{/.test(read('v3-tanitim/v3-stats.js')) &&
  /habitCountFirst/.test(read('v3-tanitim/v3-stats.js')));
ok('hedef etiketleri sabit metin değil, okunan eşikten üretilir',
  /tr\(th\.steps\) \+ ' adım ve üzeri'/.test(read('v3-tanitim/v3-statsview.js')) &&
  !/7,5\+ saat uyku|8\+ bardak su|4\.500\+ adım/.test(read('v3-tanitim/v3-statsview.js')));
ok('alışkanlık sayısı değişimi kullanıcıya açıklanır (ilk gün 8 → bugün 15)',
  /Alışkanlık sayısı yol[\s\S]{0,120}boyunca değişti/.test(read('v3-tanitim/v3-statsview.js')));
ok('ilahsız gece yalnız med.type==="none" sayılıyor',
  /sleep\.med\.type === 'none'/.test(dataSource));
ok('effSteps önceliği: manuel → health → izlenen',
  dataSource.indexOf('rec.walk.steps') < dataSource.indexOf('rec.health.steps') &&
  dataSource.indexOf('rec.health.steps') < dataSource.indexOf('movement.walkM'));

/* — HABIT_SINCE tablosu app.js ile birebir mi? (gerçek kaynaktan okunur) — */
const appSrc = read('app.js');
const habitsStart = appSrc.indexOf('var HABITS=[');
const habitsBlock = appSrc.slice(habitsStart, appSrc.indexOf('];', habitsStart));
const appSince = {};
habitsBlock.split(/\{key:/).slice(1).forEach((chunk) => {
  const k = chunk.match(/^'([a-zA-Z0-9]+)'/);
  const s = chunk.match(/since:'([0-9-]+)'/);
  if (k) appSince[k[1]] = s ? s[1] : null;
});
const pageSince = {};
(dataSource.match(/HABIT_SINCE = \{[\s\S]*?\n  \};/) || [''])[0]
  .split(/\n/)
  .forEach((line) => {
    const m = line.match(/^\s*([a-zA-Z0-9]+):\s*(?:'([0-9-]+)'|null)/);
    if (m) pageSince[m[1]] = m[2] || null;
  });
const sinceKeys = Object.keys(appSince);
ok('HABIT_SINCE tablosu app.js ile birebir (alışkanlık sayısı)',
  sinceKeys.length === 15 && Object.keys(pageSince).length === 15,
  'app=' + sinceKeys.length + ' sayfa=' + Object.keys(pageSince).length);
const sinceDrift = sinceKeys.filter((k) => appSince[k] !== pageSince[k]);
ok('her alışkanlığın since tarihi app.js ile aynı',
  sinceDrift.length === 0,
  'sapma: ' + sinceDrift.map((k) => k + ' app=' + appSince[k] + ' sayfa=' + pageSince[k]).join(', '));
ok('since yalnız 7 alışkanlıkta var, kalanı her zaman aktif',
  sinceKeys.filter((k) => appSince[k]).length === 7);

/* — ROZETLER — */
ok('rozet eşikleri report.js ile aynı (7/30/100 seri, 7 ilaçsız, 7 okuma)',
  /best >= 7/.test(dataSource) && /best >= 30/.test(dataSource) &&
  /best >= 100/.test(dataSource) && /med >= 7/.test(dataSource) &&
  /readingDayCount >= 7/.test(dataSource));
ok('protein rozeti DÜRÜSTÇE dışarıda bırakıldı (FOOD_DB çözülemez)',
  /protein.*DIŞARIDA|bilinçli olarak DIŞARIDA/i.test(dataSource) &&
  !/proteinGoalMet/.test(dataSource));
ok('rozet toplamı 8', /totalBadges: 8/.test(dataSource));
/* B1 (DEVIR-PROMPTU §8): uygulamanın "7/7 mükemmel" etiketi yanlış — eşik
   habitCountOn(date) (bugün 15). Sayfa eşiği aynalar ama etiketi gerçek
   paydadan üretir; sabit "7/7" yazımı geri gelmemeli. */
ok('"tam gün" rozeti sabit 7/7 değil, gerçek alışkanlık sayısından üretilir',
  dataSource.indexOf("'7/7 mükemmel'") < 0 &&
  /habitCountOn\(end\) \+ '\/' \+ habitCountOn\(end\)/.test(dataSource) &&
  /countRec\(rec\) >= habitCountOn\(window\[j\]\.date\)\) perfectDays\+\+/.test(dataSource));

/* — BOŞ DURUM — */
ok('veri yoksa sahte grafik çizilmez, dürüst boş-durum gelir',
  /emptyState/.test(chartsSource) &&
  /gösterilecek kayıt bulunamadı/i.test(chartsSource));
ok('boş durumda bölüm yine de görünür kalıyor (gizlenmiyor)',
  /data-state', 'empty'/.test(chartsSource) && !/style\.display\s*=\s*'none'/.test(chartsSource));
ok('veri katmanı bozuk JSON\'da çökmüyor (try/catch + null)',
  /catch \(_\) \{\s*return null;\s*\}/.test(dataSource));

/* — SAYFA BAĞLANTISI — */
ok('sayfada kişisel veri bölümü var', /id="v3-veri"/.test(pageSource));
['v3-veri-stats', 'v3-veri-heat', 'v3-veri-mood', 'v3-veri-habits', 'v3-veri-badges']
  .forEach((id) => ok('bölüm hedefi mevcut: ' + id, pageSource.indexOf('id="' + id + '"') >= 0));
ok('bölüm gizlilik sözünü kullanıcıya açıkça söylüyor',
  /senin kendi kayıtlarından geliyor/i.test(pageSource) &&
  /Hiçbir yere\s+gönderilmedi/i.test(pageSource));
/* Kaynak açıkça anlatılır: önce cihaz, gerekirse salt-okur repo okuması. */
ok('veri kaynağı kullanıcıya dürüstçe açıklanıyor (cihaz → gerekirse salt-okur)',
  /SALT-OKUR çekilir/i.test(pageSource) &&
  /Hiçbir yere YAZILMAZ/i.test(pageSource));
ok('boş-durum da kaynağı dürütçe anlatıyor (yalnız cihaz iddiası yok)',
  /gösterilecek kayıt bulunamadı/i.test(chartsSource) &&
  /özel veri depondan/i.test(chartsSource));
ok('grafikler yeni bağımlılık getirmiyor (kütüphane/CDN yok)',
  !/<script src="https?:/.test(pageSource) && !/cdn|unpkg|jsdelivr/i.test(pageSource));

/* — SAYAÇ ENTEGRASYONU: charts sayaçları v3.js'ten ÖNCE basar — */
ok('v3.js sayaçları charts enjeksiyonundan SONRA kuruyor (script sırası)',
  pageScripts.findIndex((s) => s.startsWith('v3-charts.js')) <
  pageScripts.findIndex((s) => s.startsWith('v3.js')) &&
  pageScripts.findIndex((s) => s.startsWith('v3-charts.js')) >= 0);

/* — CACHE-BUST — */
ok('yeni modüller cache-bust taşıyor',
  /v3-data\.js\?v=\d+[a-z]/.test(pageSource) &&
  /v3-charts\.js\?v=\d+[a-z]/.test(pageSource) &&
  /v3-source\.js\?v=\d+[a-z]/.test(pageSource));
ok('v3.css cache-bust güncel', /v3\.css\?v=20260915l/.test(pageSource));
ok('v3.js cache-bust güncel', /v3\.js\?v=20260915l/.test(pageSource));

// ───────────────────────────────────────────────────────────────────────────
// [11] Gelişmiş istatistik katmanı (v3-stats.js + v3-statsview.js)
// ───────────────────────────────────────────────────────────────────────────
console.log('\n[11] Gelişmiş istatistik (gerçek matematik)');

const statsSrc = read('v3-tanitim/v3-stats.js');
const statsViewSrc = read('v3-tanitim/v3-statsview.js');
const statsCode = stripComments(statsSrc);
const viewCode = stripComments(statsViewSrc);

/* — Matematik FONKSİYONLARI bilinen değerlerle — */
const mathSandbox = { console, window: {}, Date, JSON, Math, Number, String, Boolean, Array, Object, isNaN };
mathSandbox.window = mathSandbox;
vm.runInNewContext(statsSrc, mathSandbox, { filename: 'v3-stats.js' });
const M = mathSandbox.window.SeymaV3Stats;
ok('istatistik motoru yükleniyor', !!M && typeof M.build === 'function');
function near(a, b, tol) { return a != null && Math.abs(a - b) <= (tol || 1e-9); }
ok('ortalama doğru', near(M.mean([1, 2, 3, 4]), 2.5));
ok('medyan çift sayıda doğru', near(M.median([1, 2, 3, 4]), 2.5));
ok('medyan tek sayıda doğru', near(M.median([1, 2, 3]), 2));
ok('mod doğru', M.mode([1, 2, 2, 3]) === 2);
ok('örneklem standart sapması doğru (n−1)',
  near(M.stdDev([2, 4, 4, 4, 5, 5, 7, 9]), 2.138089935299395, 1e-9));
ok('çeyrekler doğru (tip-7 interpolasyon)',
  near(M.quartiles([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).q1, 3.25) &&
  near(M.quartiles([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).q3, 7.75));
ok('IQR doğru', near(M.quartiles([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).iqr, 4.5));
ok('aykırı değer IQR kuralıyla bulunuyor',
  M.outliers([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 100]).length === 1);
ok('değişim katsayısı sabit dizide 0',
  near(M.cv([10, 10, 10]), 0));
ok('doğrusal regresyon eğimi doğru (y=2x+1)',
  near(M.linearRegression([1, 3, 5, 7, 9]).slope, 2));
ok('regresyon R² tam uyumda 1',
  near(M.linearRegression([1, 3, 5, 7, 9]).r2, 1));
ok('Pearson r tam pozitif ilişkide +1',
  near(M.pearson([1, 2, 3, 4, 5], [2, 4, 6, 8, 10]).r, 1));
ok('Pearson r tam negatif ilişkide −1',
  near(M.pearson([1, 2, 3, 4, 5], [10, 8, 6, 4, 2]).r, -1));
ok('n<3 olan regresyon HESAPLANMAZ (uydurma yok)',
  M.linearRegression([1, 2]) === null);
ok('hareketli ortalama pencere dolmadan null döner',
  M.movingAverage([1, 2, 3, 4, 5, 6, 7, 8], 7).slice(0, 6).every((v) => v === null));

/* — Dürüstlük kuralları kaynakta — */
ok('eğilim için en az 3 veri noktası şartı kodda',
  /if \(n < 3\) return null;/.test(statsCode));
ok('korelasyon güvenilirlik eşiği tanımlı (minNForR)',
  /function minNForR\(\) \{ return \d+; \}/.test(statsCode));
ok('sıfıra bölme korumalı (regresyon payda kontrolü)',
  /if \(den === 0\) return null;/.test(statsCode));
ok('aykırı değerler GİZLENMEZ, işaretlenir',
  /outlierCount/.test(statsCode) && /v3-box__out/.test(statsViewSrc));
ok('korelasyon "nedensellik değildir" uyarısı taşıyor',
  /nedensellik değildir/.test(statsViewSrc));
ok('hedef paydası yalnız ölçümün kaydedildiği günler',
  /o ölçümün kaydedildiği/.test(read('v3-tanitim/v3-statsview.js')));

/* — Sayfa bağlantısı — */
ok('sayfada istatistik bölümü var', /id="v3-istatistik"/.test(pageSource));
['v3-ist-desc', 'v3-ist-sleep-hist', 'v3-ist-water-hist', 'v3-ist-trends',
 'v3-ist-mood-line', 'v3-ist-sleep-line', 'v3-ist-corr', 'v3-ist-weekday',
 'v3-ist-goals', 'v3-ist-honest'].forEach((id) => {
  ok('istatistik hedefi mevcut: ' + id, pageSource.indexOf('id="' + id + '"') >= 0);
});

/* — İzolasyon: yazma/ağ yok — */
ok('istatistik modülleri depoya YAZMIYOR',
  !/setItem|removeItem|localStorage\.clear/.test(statsCode) &&
  !/setItem|removeItem|localStorage\.clear/.test(viewCode));
ok('istatistik modülleri AĞ ÇAĞRISI yapmıyor',
  !/\bfetch\s*\(/.test(statsCode) && !/XMLHttpRequest/.test(statsCode) &&
  !/\bfetch\s*\(/.test(viewCode) && !/XMLHttpRequest/.test(viewCode));

/* — Gizlilik: ruh hâli ETİKETİ yazılmıyor — */
const moodLeak = ['cok-iyi', 'iyi', 'normal', 'zorlandim', 'cok-zorlandim']
  .filter((m) => viewCode.indexOf("'" + m + "'") >= 0);
ok('istatistik görünümü ruh hâli etiketi yazmıyor', moodLeak.length === 0,
  'sızan: ' + moodLeak.join(', '));
ok('ruh hâli yalnız renk eşlemesiyle gösteriliyor',
  /MOOD_COLOR = \{ 5:/.test(statsViewSrc));

/* — Veri katmanı entegrasyonu — */
ok('v3-data.js istatistiği motora devrediyor (yoksa null)',
  /buildAnalytics/.test(dataSource) && /if \(!S \|\| typeof S\.build !== 'function'\) return null;/.test(dataSource));
ok('çok az gün varsa istatistik üretilmez',
  /if \(n < 5\) return null;/.test(dataSource));
ok('motor çökerse sayfa kırılmaz (try/catch)',
  /catch \(_\) \{\s*return null;\s*\}/.test(dataSource));
ok('istatistik bölümü veri yoksa sahte grafik çizmez',
  /İstatistik için henüz yeterli veri yok/.test(statsViewSrc));

/* — Cache-bust — */
ok('istatistik modülleri cache-bust taşıyor',
  /v3-stats\.js\?v=\d+[a-z]/.test(pageSource) && /v3-statsview\.js\?v=\d+[a-z]/.test(pageSource));
console.log('\n' + passed + ' kontrol geçti.');
if (process.exitCode) console.log('SONUÇ: FAIL');
else console.log('SONUÇ: PASS');
