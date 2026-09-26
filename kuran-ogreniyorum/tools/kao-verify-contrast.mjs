#!/usr/bin/env node
/**
 * KAO-18 · Kur'an Arapçası yüzeyinin WCAG kontrast denetimi (R-A9).
 *
 * Salt okuma: app/styles.css tokenları (açık `#root` + koyu `#root[data-theme="dark"]`)
 * ve app/kao.css bildirimleri parse edilir; hiçbir dosya yazılmaz, ağ yok, tarayıcı açılmaz
 * (CLAUDE.md veri güvenliği kuralı 1). Kalıp: docs/apple-design/verify-contrast.mjs.
 *
 *   node kuran-ogreniyorum/tools/kao-verify-contrast.mjs [--json]
 *
 * Renkler CSS'ten okunur, sabitlenmez: var(), #hex, rgba(), transparent,
 * color-mix(in srgb, …) ve linear-gradient (her durak ayrı ölçülür, en kötüsü raporlanır).
 * Yarı saydam renkler zemine bindirilir; zemin de kendi üst zeminine bindirilir.
 *
 * Çıkış 0 = metin çiftleri ≥ 4.5:1, arayüz çiftleri (odak halkası, ilerleme, seçili durum) ≥ 3:1.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const STYLES = fs.readFileSync(path.join(REPO, 'app/styles.css'), 'utf8');
const KAO = fs.readFileSync(path.join(REPO, 'app/kao.css'), 'utf8');
const TEXT = 4.5;
const UI = 3;

// --- renk matematiği --------------------------------------------------------
const channel = (v) => { const s = v / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const luminance = ([r, g, b]) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const ratio = (a, b) => { const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };
const over = ([r, g, b, a], [br, bg, bb]) => [r * a + br * (1 - a), g * a + bg * (1 - a), b * a + bb * (1 - a)];
function mix(c1, p, c2) {
  const a = c1[3] * p + c2[3] * (1 - p);
  if (a === 0) return [0, 0, 0, 0];
  return [0, 1, 2].map((i) => (c1[i] * c1[3] * p + c2[i] * c2[3] * (1 - p)) / a).concat(a);
}

// --- CSS okuma ----------------------------------------------------------------
function blockBody(css, selector) {
  const start = css.indexOf(selector + '{');
  if (start < 0) throw new Error(`Blok bulunamadı: ${selector}`);
  let depth = 0;
  for (let i = start + selector.length; i < css.length; i += 1) {
    if (css[i] === '{') depth += 1;
    else if (css[i] === '}' && --depth === 0) return css.slice(start + selector.length + 1, i);
  }
  throw new Error(`Kapanmayan blok: ${selector}`);
}
const tokensOf = (body) => Object.fromEntries([...body.matchAll(/--([a-z0-9-]+)\s*:\s*([^;}]+)/gi)].map((m) => [m[1], m[2].trim()]));
const LIGHT = tokensOf(blockBody(STYLES, '  #root'));
const DARK = { ...LIGHT, ...tokensOf(blockBody(STYLES, '  #root[data-theme="dark"]')) };

/** Yorumsuz, medya sorgusu dışı kurallar (reduced-motion/genişlik blokları renk değiştirmez). */
const RULES = [...KAO.replace(/\/\*[\s\S]*?\*\//g, '').replace(/@media[^{]*\{((?:[^{}]*\{[^{}]*\})*)[^{}]*\}/g, '')
  .matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ selectors: m[1].split(',').map((s) => s.trim()), body: m[2] }));
function decl(selector, prop) {
  let value = null;
  for (const rule of RULES) {
    if (!rule.selectors.includes(selector)) continue;
    for (const m of rule.body.matchAll(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`, 'g'))) value = m[1].trim();
  }
  if (value === null && prop === 'outline-color') {
    const shorthand = decl(selector, 'outline').match(/(var\([^)]*\)|#[0-9a-f]{3,8}|color-mix\(.+\))\s*$/i);
    if (shorthand) return shorthand[1];
  }
  if (value === null) throw new Error(`Bildirim bulunamadı: ${selector} { ${prop} }`);
  return value;
}

/** Üst düzey virgülle böler (parantez içini korur). */
function splitTop(value) {
  const out = []; let depth = 0, cur = '';
  for (const ch of value) {
    if (ch === '(') depth += 1;
    if (ch === ')') depth -= 1;
    if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; } else cur += ch;
  }
  return out.concat(cur.trim()).filter(Boolean);
}
/** Bir renk ifadesini RGBA'ya çözer. */
function color(expr, map) {
  const v = expr.trim();
  if (v === 'transparent') return [0, 0, 0, 0];
  if (v.startsWith('#')) {
    const c = v.slice(1), full = c.length === 3 ? [...c].map((x) => x + x).join('') : c;
    return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)).concat(1);
  }
  let m = v.match(/^rgba?\(([^)]+)\)$/);
  if (m) { const n = m[1].split(',').map(Number); return [n[0], n[1], n[2], n.length > 3 ? n[3] : 1]; }
  m = v.match(/^var\(\s*--([a-z0-9-]+)\s*(?:,(.+))?\)$/i);
  if (m) {
    if (map[m[1]] !== undefined) return color(map[m[1]], map);
    if (m[2]) return color(m[2], map);
    throw new Error(`Tanımsız token: --${m[1]}`);
  }
  m = v.match(/^color-mix\(\s*in srgb\s*,(.+)\)$/);
  if (m) {
    const [a, b] = splitTop(m[1]);
    const pa = a.match(/^(.+?)\s+([\d.]+)%$/), pb = b.match(/^(.+?)\s+([\d.]+)%$/);
    const wa = pa ? Number(pa[2]) / 100 : (pb ? 1 - Number(pb[2]) / 100 : 0.5);
    return mix(color(pa ? pa[1] : a, map), wa, color(pb ? pb[1] : b, map));
  }
  throw new Error(`Çözülemeyen renk: ${v}`);
}
/** Bir arka plan bildiriminin renk duraklarını döner (düz renk → tek durak). */
function stops(value, map) {
  const g = value.match(/^(?:linear|radial)-gradient\((.+)\)$/);
  if (!g) return [color(value, map)];
  return splitTop(g[1]).filter((part) => !/^(?:\d+deg|to |circle|ellipse)/.test(part)).map((part) => color(part.replace(/\s+[\d.]+%$/, ''), map));
}

// --- zeminler ve çiftler --------------------------------------------------------
const THEMES = [['AÇIK', LIGHT], ['KOYU', DARK]];
/** Zemin zinciri: [seçici, özellik] listesi, dıştan içe; en dışı her zaman --quran-surface üstünde. */
function backgrounds(chain, map) {
  let layers = [over(color('var(--quran-surface)', map), [0, 0, 0])];
  for (const [selector, prop] of chain) {
    const next = [];
    for (const base of layers) for (const stop of stops(decl(selector, prop), map)) next.push(over(stop, base));
    layers = next;
  }
  return layers;
}
const DIALOG = ['.kao-dialog', 'background'];
const HOME = [DIALOG, ['.kao-home section', 'background']];
const PAIRS = [
  // [etiket, tür, önplan seçici, önplan özelliği, zemin zinciri]
  ['Diyalog gövde metni', 'text', '.kao-dialog', 'color', [DIALOG]],
  ['Üst başlık (eyebrow)', 'text', '.kao-eyebrow', 'color', HOME],
  ['Canlı bildirim', 'text', '.kao-live', 'color', [DIALOG]],
  ['Soru metni', 'text', '.kao-question', 'color', [DIALOG]],
  ['Latin okunuş satırı', 'text', '.kao-pronunciation-line', 'color', [DIALOG]],
  ['Seçenek düğmesi', 'text', '.kao-choices button', 'color', [DIALOG, ['.kao-choices button', 'background']]],
  ['Birincil düğme', 'text', '.kao-primary', 'color', [DIALOG, ['.kao-primary', 'background']]],
  ['İkincil düğme', 'text', '.kao-secondary', 'color', [DIALOG, ['.kao-secondary', 'background']]],
  ['Geri al düğmesi', 'text', '.kao-undo', 'color', [DIALOG, ['.kao-undo', 'background']]],
  ['Süre çipi', 'text', '.kao-time-chip', 'color', [...HOME, ['.kao-time-chip', 'background']]],
  ['Kognat rozeti', 'text', '.kao-cognate', 'color', [DIALOG, ['.kao-cognate', 'background']]],
  ['Kognat anlam kayması', 'text', '.kao-cognate.is-shift', 'color', [DIALOG, ['.kao-cognate.is-shift', 'background']]],
  ['İçerik hatası', 'text', '.kao-content-error', 'color', [DIALOG, ['.kao-content-error', 'background']]],
  ['Okunuş etiketi (E5)', 'text', '.kao-pronunciation small', 'color', [DIALOG, ['.kao-pronunciation', 'background']]],
  ['Harf çipi Latin harfi', 'text', '.kao-ph-letter small', 'color', [DIALOG, ['.kao-ph-letters button', 'background']]],
  ['Ayar ipucu', 'text', '.kao-setting-hint', 'color', [DIALOG, ['.kao-settings section', 'background']]],
  ['Seçili segment', 'text', '.kao-seg button[aria-pressed="true"]', 'color', [DIALOG, ['.kao-seg', 'background'], ['.kao-seg button[aria-pressed="true"]', 'background']]],
  ['Namaz: kapalı anlam (•••)', 'text', '.kao-prayer-word.is-closed .kao-prayer-tr', 'color', [DIALOG, ['.kao-prayer-line', 'background'], ['.kao-prayer-word', 'background']]],
  ['Namaz: bilinen kelime anlamı', 'text', '.kao-prayer-tr', 'color', [DIALOG, ['.kao-prayer-line', 'background'], ['.kao-prayer-word.is-known', 'background']]],
  ['Âyet kelime anlamı', 'text', '.kao-ayah-tr', 'color', [DIALOG, ['.kao-ayah-words', 'background'], ['.kao-ayah-words button', 'background']]],
  ['Isı haritası %1-24', 'text', '.kao-map-cell', 'color', [DIALOG, ['.kao-map-cell[data-l="1"]', 'background']]],
  ['Isı haritası %25-49', 'text', '.kao-map-cell', 'color', [DIALOG, ['.kao-map-cell[data-l="2"]', 'background']]],
  ['Isı haritası %50-74', 'text', '.kao-map-cell', 'color', [DIALOG, ['.kao-map-cell[data-l="3"]', 'background']]],
  ['Isı haritası %75-99', 'text', '.kao-map-cell[data-l="4"] b', 'color', [DIALOG, ['.kao-map-cell[data-l="4"]', 'background']]],
  ['Isı haritası kesinleşti', 'text', '.kao-map-cell[data-l="5"]', 'color', [DIALOG, ['.kao-map-cell[data-l="5"]', 'background']]],
  ['Isı haritası sûre no', 'text', '.kao-map-cell small', 'color', [DIALOG, ['.kao-map-cell[data-l="3"]', 'background']]],
  // R-A9: 3 hareke tonu × 2 tema (Seviye 0 kartı ve ayar önizlemesi zemini).
  ['Hareke · fetha', 'text', '.kao-h-fatha', 'color', [DIALOG, ['.kao-gate-task', 'background']]],
  ['Hareke · kesra', 'text', '.kao-h-kesra', 'color', [DIALOG, ['.kao-gate-task', 'background']]],
  ['Hareke · damma', 'text', '.kao-h-damma', 'color', [DIALOG, ['.kao-gate-task', 'background']]],
  ['Hareke · fetha (ayarlar)', 'text', '.kao-h-fatha', 'color', [DIALOG, ['.kao-settings section', 'background']]],
  ['Hareke · kesra (ayarlar)', 'text', '.kao-h-kesra', 'color', [DIALOG, ['.kao-settings section', 'background']]],
  ['Hareke · damma (ayarlar)', 'text', '.kao-h-damma', 'color', [DIALOG, ['.kao-settings section', 'background']]],
  // Arayüz bileşenleri (WCAG 1.4.11).
  ['Odak halkası', 'ui', '.kao-dialog button:focus-visible', 'outline-color', [DIALOG]],
  ['İlerleme dolgusu / izi', 'ui', '.kao-progress span', 'background', [HOME[0], HOME[1], ['.kao-progress', 'background']]],
  ['Seçili segment / grup zemini', 'ui', '.kao-seg button[aria-pressed="true"]', 'background', [DIALOG, ['.kao-seg', 'background']]]
];

const results = [];
for (const [theme, map] of THEMES) {
  for (const [label, kind, fgSelector, fgProp, chain] of PAIRS) {
    const bgs = backgrounds(chain, map);
    const fgValue = decl(fgSelector, fgProp);
    let worst = Infinity;
    for (const bg of bgs) for (const fg of stops(fgValue, map)) worst = Math.min(worst, ratio(over(fg, bg), bg));
    const threshold = kind === 'ui' ? UI : TEXT;
    results.push({ theme, label, kind, selector: fgSelector, ratio: Number(worst.toFixed(2)), threshold, pass: worst >= threshold });
  }
}
// --- otomatik tarama: kao.css'teki her `color` bildirimi -----------------------
/** Yalnız aria-hidden süsler; anlam taşımaz, metin kontrastı kapsamı dışı. */
const DECORATIVE = new Set(['.kao-hub-ornament', '.kao-hero-rosette', '.kao-ayah-count>span', '.kao-fade', '.kao-map-cell[data-l="5"] small', '.kao-map-legend i[data-l="5"]']);
const HUB = [['.kao-hub-card', 'background']];
/** Yalnız ikon taşıyan kaplar: metin değil grafik (WCAG 1.4.11) → 3:1. */
const ICON_MARKS = new Set(['.kao-hub-seal', '.kao-header-mark', '.kao-summary-mark', '.kao-done-mark', '.kao-mahrec']);
/** Kendi zemini olan seçiciler kendi zemininde, diğerleri bağlamının en kötü zemininde ölçülür. */
function autoChain(selector) {
  const own = RULES.some((rule) => rule.selectors.includes(selector) && /(?:^|;)\s*background(?:-color)?\s*:/.test(rule.body));
  const context = /^\.kao-hub-/.test(selector) ? HUB : HOME;
  return own ? [...context, [selector, /(?:^|;)\s*background-color\s*:/.test(RULES.find((rule) => rule.selectors.includes(selector) && /background/.test(rule.body)).body) ? 'background-color' : 'background']] : context;
}
const colorSelectors = [...new Set(RULES.filter((rule) => /(?:^|;)\s*color\s*:/.test(rule.body)).flatMap((rule) => rule.selectors))].filter((selector) => !DECORATIVE.has(selector) && decl(selector, 'color') !== 'inherit' && !/^#root/.test(selector));
for (const [theme, map] of THEMES) {
  for (const selector of colorSelectors) {
    const chain = autoChain(selector);
    let worst = Infinity;
    for (const bg of [...backgrounds(chain, map), ...(chain === HOME ? backgrounds([DIALOG], map) : [])]) for (const fg of stops(decl(selector, 'color'), map)) worst = Math.min(worst, ratio(over(fg, bg), bg));
    const kind = ICON_MARKS.has(selector) ? 'ui' : 'text', threshold = kind === 'ui' ? UI : TEXT;
    results.push({ theme, label: 'otomatik · ' + selector, kind, selector, ratio: Number(worst.toFixed(2)), threshold, pass: worst >= threshold });
  }
}
const failed = results.filter((item) => !item.pass);
if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ pairs: results.length, failed: failed.length, results }, null, 2));
} else {
  for (const [theme] of THEMES) {
    console.log(`\n${theme} TEMA`);
    for (const item of results.filter((row) => row.theme === theme)) console.log(`  ${item.pass ? '✓' : '✗'} ${item.label.padEnd(30)} ${item.ratio.toFixed(2).padStart(6)}:1  (≥${item.threshold})`);
  }
  console.log(`\n${results.length} çift denetlendi (${PAIRS.length} elle seçilmiş + ${colorSelectors.length} otomatik renk bildirimi, × 2 tema), ${failed.length} tanesi eşiğin altında.`);
}
process.exitCode = failed.length ? 1 : 0;
