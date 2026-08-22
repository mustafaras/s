// test_quran_a11y_contrast.js — QY-17 kabul kapısı: Kur’an Yolculuğu (hub kart,
// kütüphane, sûre ayrıntısı) renk çiftlerinin WCAG AA kontrastı.
//
// styles.css'ten GERÇEK hex/renk-karışım değerlerini regex ile çıkarır, sRGB
// göreli parlaklık + WCAG kontrast formülünü uygular ve her gerçek metin/arka
// plan çiftini (--quran-gold, --quran-mid, qj-muted, qj-faint, --quran-ok/warn,
// --quran-gold-ink, CTA beyaz metin) hem açık hem koyu temada denetler.
//
// Bu dosya bir HESAP testidir — DOM/vm gerektirmez, tarayıcı/ağ YOK.
// Çalıştırma: node tests/quran/test_quran_a11y_contrast.js

'use strict';
var fs = require('fs');
var path = require('path');
var repoRoot = require('../repo-root');

var pass = 0, fail = 0;
function ok(cond, label, detail) {
  if (cond) { pass++; return true; }
  fail++;
  console.error('  ✗ ' + label + (detail !== undefined ? ' — ' + JSON.stringify(detail) : ''));
  return false;
}
function section(t) { console.log('\n' + t); }

// ── renk matematiği ──────────────────────────────────────────────────────
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(function (c) { return c + c; }).join('');
  var n = parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex(rgb) {
  return '#' + rgb.map(function (x) { return Math.round(x).toString(16).padStart(2, '0'); }).join('');
}
function relLum(rgb) {
  function f(c) { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  var R = f(rgb[0]), G = f(rgb[1]), B = f(rgb[2]);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}
function contrast(hex1, hex2) {
  var L1 = relLum(hexToRgb(hex1)), L2 = relLum(hexToRgb(hex2));
  var lighter = Math.max(L1, L2), darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}
function composite(colorHex, alpha, backdropHex) {
  var c1 = hexToRgb(colorHex), c2 = hexToRgb(backdropHex);
  return rgbToHex([
    c1[0] * alpha + c2[0] * (1 - alpha),
    c1[1] * alpha + c2[1] * (1 - alpha),
    c1[2] * alpha + c2[2] * (1 - alpha)
  ]);
}

// ── styles.css'ten gerçek değerleri çıkar ────────────────────────────────
var CSS = fs.readFileSync(path.join(repoRoot, 'styles.css'), 'utf8');

section('1. styles.css içinden gerçek renk değerleri okunuyor');
function pickVar(block, name) {
  var m = block.match(new RegExp('--' + name + ':\\s*(#[0-9a-fA-F]{3,8})'));
  return m ? m[1] : null;
}
// açık/koyu tema blokları: ilk `--qibla:` satırından ÖNCEki (açık) ve
// #root[data-theme="dark"] içindeki (koyu) --quran* tanımları.
var lightBlockEnd = CSS.indexOf('#root[data-theme="dark"]');
var lightBlock = CSS.slice(0, lightBlockEnd);
var darkBlock = CSS.slice(lightBlockEnd);

var L = {
  quran: pickVar(lightBlock, 'quran(?!2|-)'), quran2: pickVar(lightBlock, 'quran2'),
  surface: pickVar(lightBlock, 'quran-surface'), ink: pickVar(lightBlock, 'quran-ink'),
  gold: pickVar(lightBlock, 'quran-gold(?!-)'), mid: pickVar(lightBlock, 'quran-mid'),
  ok: pickVar(lightBlock, 'quran-ok'), warn: pickVar(lightBlock, 'quran-warn'),
  goldInk: pickVar(lightBlock, 'quran-gold-ink')
};
var D = {
  quran: pickVar(darkBlock, 'quran(?!2|-)'), quran2: pickVar(darkBlock, 'quran2'),
  surface: pickVar(darkBlock, 'quran-surface'), ink: pickVar(darkBlock, 'quran-ink'),
  gold: pickVar(darkBlock, 'quran-gold(?!-)'), mid: pickVar(darkBlock, 'quran-mid'),
  ok: pickVar(darkBlock, 'quran-ok'), warn: pickVar(darkBlock, 'quran-warn'),
  goldInk: pickVar(darkBlock, 'quran-gold-ink')
};
['quran', 'quran2', 'surface', 'ink', 'gold', 'mid', 'ok', 'warn', 'goldInk'].forEach(function (k) {
  ok(!!L[k], 'açık tema --quran-' + k + ' bulundu', L[k]);
  ok(!!D[k], 'koyu tema --quran-' + k + ' bulundu', D[k]);
});

// qj-muted/qj-faint karışım yüzdeleri (.quran-v2-overlay içindeki inline
// custom property'ler — TEK formül, her iki temada da --quran-ink'e uygulanır)
var overlayBlock = CSS.slice(CSS.indexOf('.quran-v2-overlay{'), CSS.indexOf('.quran-v2-overlay{') + 900);
var mutedPctM = overlayBlock.match(/--qj-muted:color-mix\(in srgb,var\(--quran-ink\) (\d+)%,transparent\)/);
var faintPctM = overlayBlock.match(/--qj-faint:color-mix\(in srgb,var\(--quran-ink\) (\d+)%,transparent\)/);
ok(!!mutedPctM, '--qj-muted karışım yüzdesi bulundu', overlayBlock.slice(0, 200));
ok(!!faintPctM, '--qj-faint karışım yüzdesi bulundu');
var MUTED_PCT = mutedPctM ? Number(mutedPctM[1]) / 100 : 0.62;
var FAINT_PCT = faintPctM ? Number(faintPctM[1]) / 100 : 0.45;

// ── her iki tema için tüm gerçek kullanım çiftlerini denetle ─────────────
function auditTheme(name, T) {
  section(name + ' tema — gerçek metin/arka plan çiftleri (WCAG AA)');
  var qjPanel = composite(T.quran, 0.06, T.surface);
  var qjPanel2 = composite(T.quran, 0.11, T.surface);
  var qjMutedSurf = composite(T.ink, MUTED_PCT, T.surface);
  var qjMutedPanel = composite(T.ink, MUTED_PCT, qjPanel);
  var qjFaintSurf = composite(T.ink, FAINT_PCT, T.surface);
  var qjFaintPanel = composite(T.ink, FAINT_PCT, qjPanel);

  // [etiket, ön plan, arka plan, eşik, gerçek kullanım yeri]
  var pairs = [
    ['ink gövde metni / surface', T.ink, T.surface, 4.5, '.quran-v2-screen, .quran-v2-row .titleline strong, vb.'],
    ['gold kicker (9.5px/950, KÜÇÜK — büyük metin muafiyeti YOK) / surface', T.gold, T.surface, 4.5, '.quran-v2-section-head span, .quran-v2-detail-head .stop'],
    ['gold kicker / qj-panel', T.gold, qjPanel, 4.5, '.quran-v2-history h3, .quran-v2-facts .disp'],
    ['gold kicker / qj-panel2', T.gold, qjPanel2, 4.5, '.quran-v2-detail-head .tr (h2 arka planı qj-panel2)'],
    ['gold Arapça satır adı (14px/700) / qj-panel', T.gold, qjPanel, 4.5, '.quran-v2-row .titleline .arabic'],
    ['beyaz CTA metni / quran buton fonu', '#ffffff', T.quran, 4.5, '.quran-v2-cta'],
    ['quran-mid metin (sıra no / bekleniyor durumu / rozet sayaç) / qj-panel', T.mid, qjPanel, 4.5, '.quran-v2-row .ord b, .is-wait .state em'],
    ['quran-mid metin / qj-panel2', T.mid, qjPanel2, 4.5, '.quran-v2-chips button b (qj-panel2 fonunda)'],
    ['is-wait kenar çizgisi (metin DEĞİL, 3:1) / qj-panel', T.quran, qjPanel, 3.0, '.quran-v2-row.is-wait border-left'],
    ['qj-muted (durum açıklaması/meta, gerçek içerik) / surface', qjMutedSurf, T.surface, 4.5, '.quran-v2-status em, .quran-v2-header .copy small'],
    ['qj-muted / qj-panel', qjMutedPanel, qjPanel, 4.5, '.quran-v2-row .meta'],
    ['qj-faint (ipucu/dipnot, gerçek içerik) / surface', qjFaintSurf, T.surface, 4.5, '.quran-v2-hint, .quran-v2-disclaimer'],
    ['qj-faint / qj-panel', qjFaintPanel, qjPanel, 4.5, '.quran-v2-row .ord i ("durak")'],
    ['quran-ok metin / qj-panel', T.ok, qjPanel, 4.5, '.quran-v2-row.is-done .state em'],
    ['quran-ok metin / qj-panel2', T.ok, qjPanel2, 4.5, '.quran-v2-row.is-done .state em (qj-panel2 varyantı)'],
    ['quran-ok kenar çizgisi (3:1) / qj-panel', T.ok, qjPanel, 3.0, '.quran-v2-row.is-done border-left'],
    ['quran-warn metin / qj-panel', T.warn, qjPanel, 4.5, '.quran-v2-row.is-warn .state em'],
    ['quran-warn metin / qj-panel2', T.warn, qjPanel2, 4.5, '.quran-v2-row.is-warn .state em (qj-panel2 varyantı)'],
    ['quran-warn kenar çizgisi (3:1) / qj-panel', T.warn, qjPanel, 3.0, '.quran-v2-row.is-warn border-left'],
    ['ink Arapça ayrıntı başlığı (34px, büyük metin 3:1) / surface', T.ink, T.surface, 3.0, '.quran-v2-detail-head .arabic'],
    ['quran-gold-ink (sabit koyu) / quran2 (altın rozet fonu)', T.goldInk, T.quran2, 4.5, '.quran-v2-chips button.on b']
  ];
  pairs.forEach(function (p) {
    var r = contrast(p[1], p[2]);
    ok(r >= p[3], p[0] + ': ' + r.toFixed(2) + ':1 (gerekli ' + p[3] + ':1) — ' + p[4], { fg: p[1], bg: p[2] });
  });
}

auditTheme('2. AÇIK', L);
auditTheme('3. KOYU', D);

// ── regresyon çapası: eski (QY-17 öncesi) başarısız değerler bir daha girmesin ──
section('4. Regresyon çapası — eski başarısız değerlere dönülmediği kanıtı');
(function () {
  ok(L.gold !== '#B08D1F', 'açık --quran-gold eski (2.88:1 başarısız) değere dönmemiş', L.gold);
  ok(D.quran !== '#4A7AB8', 'koyu --quran eski (beyaz CTA metniyle 4.41:1 başarısız) değere dönmemiş', D.quran);
  ok(MUTED_PCT >= 0.68, 'qj-muted karışımı eski %62 (açık temada 4.13:1 başarısız) seviyesinin altına inmemiş', MUTED_PCT);
  ok(FAINT_PCT >= 0.67, 'qj-faint karışımı eski %45 (2.61:1 başarısız) seviyesinin altına inmemiş', FAINT_PCT);
})();

console.log('\n' + (fail === 0 ? '✅' : '❌') + ' Kur’an Yolculuğu WCAG AA kontrast: ' + pass + '/' + (pass + fail) + ' geçti');
process.exit(fail === 0 ? 0 : 1);
