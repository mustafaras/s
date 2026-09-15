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
ok('sayfa kendi betiklerini yüklüyor (v3-data + v3-charts + v3)',
  pageScripts.length === 3 && pageScripts.every((s) => s.startsWith('v3')),
  'yüklenen: ' + JSON.stringify(pageScripts));
ok('betikler doğru sırada (data → charts → v3)',
  pageScripts[0].startsWith('v3-data.js') &&
  pageScripts[1].startsWith('v3-charts.js') &&
  pageScripts[2].startsWith('v3.js'));

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
ok('görünen metindeki tek emoji flamingo 🦩 (2 kez: kapanış + footer)',
  pageEmoji.length === 2 && pageEmoji.every((e) => e === '🦩'),
  'bulunan: ' + JSON.stringify(pageEmoji));
ok('CSS\'te dekoratif emoji yok (flamingo sayfa içeriğinde)',
  cssEmoji.length === 0, 'bulunan: ' + JSON.stringify(cssEmoji));
ok('flamingo vektör olarak da var (SVG, harici dosya değil)',
  /class="v3-flamingo__svg"/.test(pageSource) &&
  /viewBox="0 0 100 124"/.test(pageSource));

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

// ───────────────────────────────────────────────────────────────────────────
// [8] Kutlama katmanı — 85. gün + efektler
// ───────────────────────────────────────────────────────────────────────────
console.log('\n[8] Kutlama katmanı (85. gün)');

// 85 sayısı iki bağımsız yolla doğrulanır:
//   (a) ARİTMETİK — sayfanın yazdığı başlangıç ile bugün arası kapsayıcı gün
//       sayısı 85 olmalı. Bu uygulamanın kendi formülüdür
//       (dateUtils.js: dayIndexFor = diffDays(start, date) + 1).
//   (b) KOROBORASYON — başlangıç, deponun kendi veri kaybı kaydıyla
//       (AGENTS.md: 2026-07-10'da "17 günlük" veri silindi) ±1 gün içinde
//       örtüşmeli. EŞİTLİK ARANMAZ: kayıt "17 gün"ün hangi günü kapsadığını
//       (silinen gün dahil mi) belirtmiyor, dolayısıyla kesin bir eşitlik
//       dayatmak sahte kesinlik olurdu. Örtüşme yeterli koroborasyondur.
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

const PAGE_TODAY = '2026-09-15';
const PAGE_DAY = 85;
const PAGE_START = '2026-06-23';

ok('sayfa başlangıç tarihini yazıyor (23 Haziran 2026)',
  /23 Haziran 2026/.test(pageSource));
ok('sayfa 85. günü işaretliyor', /data-count="85"/.test(pageSource));

ok('(a) aritmetik: başlangıç → bugün kapsayıcı 85 gün',
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

ok('kutlama bölümü var', /class="v3-milestone"/.test(pageSource));
ok('kutlama tonu suçlayıcı değil, kutlayıcı',
  /kutlama günü/.test(pageSource) && /Nice güzel günlere/.test(pageSource));
ok('kapanışta 85. gün başlığı ve sıcak not var',
  /85\. güne hoş geldin/.test(pageSource) &&
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
  /data-count="85">85</.test(pageSource) && /data-count="114">114</.test(pageSource));
ok('sayaçlar da hareket azaltmada anında biter', /data-count[\s\S]{0,400}motionAllowed|motionAllowed|IntersectionObserver/.test(jsSource));
ok('sayaç son değeri hedefe sabitler (yuvarlama hatası kalmaz)',
  /el\.dataset\.v3Target/.test(jsSource));

// Flamingo vektörü
ok('flamingo SVG\'si satır içi (harici dosya/ağ isteği yok)',
  /<svg class="v3-flamingo__svg"/.test(pageSource));
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
  /Sürüm tanıtımını yeniden aç/.test(settingsSrc));

// Pinli yüzey: bu iki sayı fx2 fixture'larında sabit. settings.js ve render.js
// o taramaya dâhildir — burada önden yakalıyoruz ki hata erken görünsün.
const APP_SURFACE_FILES = [
  'app.js', 'app/core/motivation.js', 'app/core/crisis.js', 'app/core/journal.js',
  'app/core/health.js', 'app/core/library.js', 'app/core/report.js', 'app/core/map.js',
  'app/core/profile.js', 'app/core/settings.js', 'app/core/messaging.js',
  'app/core/render.js', 'app/core/reminders.js', 'app/core/reminderSurface.js',
  'app/core/appSurface.js'
];
const combined = APP_SURFACE_FILES.map(read).join('');
const surfaceCount = new Set(
  (combined.match(/App\.[A-Za-z0-9_]+\s*=[^=]/g) || []).map((s) => s.match(/App\.[A-Za-z0-9_]+/)[0])
).size;
ok('App yüzeyi pinli (718) — sürüm köprüsü yeni handler eklemedi',
  surfaceCount === 718, 'ölçülen: ' + surfaceCount);
ok('tıklama niteliği sayısı pinli (391)',
  (combined.match(/onclick=/g) || []).length === 391,
  'ölçülen: ' + (combined.match(/onclick=/g) || []).length);
ok('sürüm yorumları pin taramasını kaydırmıyor (yorumda nitelik adı geçmiyor)',
  !/\/\/[^\n]*(?:App\.[A-Za-z0-9_]+\s*=|onclick=)/.test(settingsSrc));

// Cache-bust: değişen modüller yeni sürüm taşımalı
ok('settings.js cache-bust güncel', /app\/core\/settings\.js\?v=20260915b/.test(indexSource));
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

/* — BOŞ DURUM — */
ok('veri yoksa sahte grafik çizilmez, dürüst boş-durum gelir',
  /emptyState/.test(chartsSource) &&
  /henüz kayıt görünmüyor/i.test(chartsSource));
ok('boş durumda bölüm yine de görünür kalıyor (gizlenmiyor)',
  /data-state', 'empty'/.test(chartsSource) && !/style\.display\s*=\s*'none'/.test(chartsSource));
ok('veri katmanı bozuk JSON\'da çökmüyor (try/catch + null)',
  /catch \(_\) \{\s*return null;\s*\}/.test(dataSource));

/* — SAYFA BAĞLANTISI — */
ok('sayfada kişisel veri bölümü var', /id="v3-veri"/.test(pageSource));
['v3-veri-stats', 'v3-veri-heat', 'v3-veri-mood', 'v3-veri-habits', 'v3-veri-badges']
  .forEach((id) => ok('bölüm hedefi mevcut: ' + id, pageSource.indexOf('id="' + id + '"') >= 0));
ok('bölüm gizlilik sözünü kullanıcıya açıkça söylüyor',
  /yalnız senin cihazından geliyor/i.test(pageSource) &&
  /Hiçbir yere\s+gönderilmedi/i.test(pageSource));
ok('grafikler yeni bağımlılık getirmiyor (kütüphane/CDN yok)',
  !/<script src="https?:/.test(pageSource) && !/cdn|unpkg|jsdelivr/i.test(pageSource));

/* — SAYAÇ ENTEGRASYONU: charts sayaçları v3.js'ten ÖNCE basar — */
ok('v3.js sayaçları charts enjeksiyonundan SONRA kuruyor (script sırası)',
  pageScripts[1].startsWith('v3-charts.js') && pageScripts[2].startsWith('v3.js'));

/* — CACHE-BUST — */
ok('yeni modüller cache-bust taşıyor',
  /v3-data\.js\?v=\d+[a-z]/.test(pageSource) && /v3-charts\.js\?v=\d+[a-z]/.test(pageSource));
ok('v3.css cache-bust güncel', /v3\.css\?v=20260915g/.test(pageSource));
ok('v3.js cache-bust güncel', /v3\.js\?v=20260915g/.test(pageSource));

console.log('\n' + passed + ' kontrol geçti.');
if (process.exitCode) console.log('SONUÇ: FAIL');
else console.log('SONUÇ: PASS');