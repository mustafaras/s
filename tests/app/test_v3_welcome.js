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

// Yalnız <script src> etiketleri sayılır (satır içi bootstrap yok sayılır).
const pageScripts = [...pageSource.matchAll(/<script\s+src="([^"]+)"/g)].map((m) => m[1]);
ok('sayfa tam olarak bir harici betik yüklüyor', pageScripts.length === 1,
  'yüklenen: ' + JSON.stringify(pageScripts));
ok('o betik de kendi dosyası (v3.js)', pageScripts[0] && pageScripts[0].startsWith('v3.js'));

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
ok('v3.css panel yüzeylerine referans vermiyor',
  !/panel/i.test(cssSource.replace(/\/\*[\s\S]*?\*\//g, '')));

// Panel dosyaları bu değişiklikte hiç dâhil olmadı
ok('tanıtım sayfası panel-v2.html desenini izliyor (#root + data-theme)',
  /id="root"\s+data-theme="dark"/.test(pageSource) ||
  (/id="root"/.test(pageSource) && /data-theme="dark"/.test(pageSource)));

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

const rawHex = [...cssSource.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0]);
ok('ham hex sayısı ≤ 4 (koyu-metin/zemîn sabitleri)', rawHex.length <= 4,
  'bulunan: ' + rawHex.join(' '));
ok('yasak palet yok (neon / mor-mavi AI gradient)',
  !/#(?:[0-9a-f]{0,2}(?:ff00ff|00ffff|7c3aed|8b5cf6|6366f1))/i.test(cssSource));
ok('emoji yok (prestij tonu)',
  !/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u.test(pageSource) &&
  !/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u.test(cssSource));

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
ok('App.* handler yüzeyi bozulmadı (554)', handlerCount === 554, 'ölçülen: ' + handlerCount);
ok('app.js tanıtım sayfasına referans vermiyor',
  appSource.indexOf('v3-tanitim') < 0 && appSource.indexOf(V3_KEY) < 0);
ok('sync.js tanıtım anahtarına dokunmuyor',
  read('sync.js').indexOf(V3_KEY) < 0);

// styles.css'e dokunulmadı (paylaşılan yüzey)
ok('index.html mevcut asset sürümleri korunmuş (app.js v=20260915c)',
  /app\.js\?v=20260915c/.test(indexSource));

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

console.log('\n' + passed + ' kontrol geçti.');
if (process.exitCode) console.log('SONUÇ: FAIL');
else console.log('SONUÇ: PASS');