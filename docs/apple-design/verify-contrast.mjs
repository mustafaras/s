#!/usr/bin/env node
/**
 * Şeyma metin renk tokenlarının WCAG kontrast denetimi.
 *
 * Salt okuma: app/styles.css parse edilir, hiçbir dosya yazılmaz, ağ erişimi yok.
 * Uygulamayı tarayıcıda açmaz — CLAUDE.md veri güvenliği kuralı 1.
 *
 *   node docs/apple-design/verify-contrast.mjs
 *
 * Çıkış 0 = denetlenen her metin tokenı kendi zemininde >= 4.5:1 (WCAG AA,
 * 17pt altı metin için HIG'in de istediği eşik).
 * Çıkış 1 = en az bir token eşiğin altında.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CSS = path.join(REPO, 'app/styles.css');
const THRESHOLD = 4.5;

/** 17pt altı metin için minimum oran. HIG — Accessibility. */
const TEXT_TOKENS = [
  'text', 'text2', 'muted', 'faint',
  'accent-ink', 'warn-ink', 'ok-ink', 'watch-ink', 'listen-ink', 'drop-ink',
];

// --- renk yardımcıları ---------------------------------------------------

const hexToRgb = (h) => {
  const c = h.replace('#', '');
  const full = c.length === 3 ? c.split('').map((x) => x + x).join('') : c;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
};

const channel = (v) => {
  const s = v / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

const luminance = ([r, g, b]) =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** fg'yi alpha ile bg üzerine bindirir. */
const composite = (fg, alpha, bg) => fg.map((c, i) => c * alpha + bg[i] * (1 - alpha));

// --- CSS okuma -----------------------------------------------------------

/** Dengeli süslü parantez sayarak bir seçicinin gövdesini çıkarır. */
function blockBody(css, selector) {
  const start = css.indexOf(selector + '{');
  if (start < 0) throw new Error(`Blok bulunamadı: ${selector}`);
  let depth = 0;
  for (let i = start + selector.length; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}' && --depth === 0) {
      return css.slice(start + selector.length + 1, i);
    }
  }
  throw new Error(`Kapanmayan blok: ${selector}`);
}

/** --token:deger çiftlerini toplar; sonraki tanım öncekini ezer (CSS kaskadı). */
function tokens(body) {
  const out = {};
  for (const m of body.matchAll(/--([a-z0-9-]+)\s*:\s*([^;}]+)/gi)) {
    out[m[1]] = m[2].trim();
  }
  return out;
}

/** var(--x) zincirini çözer, hex döner; çözülemezse null. */
function resolve(name, map, seen = new Set()) {
  if (seen.has(name)) return null;
  seen.add(name);
  const v = map[name];
  if (!v) return null;
  if (v.startsWith('#')) return hexToRgb(v);
  const ref = v.match(/^var\(\s*--([a-z0-9-]+)\s*\)$/i);
  return ref ? resolve(ref[1], map, seen) : null;
}

// --- denetim -------------------------------------------------------------

const css = fs.readFileSync(CSS, 'utf8');
const light = tokens(blockBody(css, '#root'));
const dark = { ...light, ...tokens(blockBody(css, '#root[data-theme="dark"]')) };

/**
 * Zeminler.
 *
 * AD-38/40/41 (dalga 8) içerik kartlarını `.glass`'tan opak `.surface`'e taşıdı.
 * İçerik metni artık yarı saydam `--card` üzerinde DEĞİL, opak `--card-solid`
 * üzerinde duruyor — bu yüzden kart zemini CSS'ten okunur, sabitlenmez.
 * Token kaybolursa denetim sessizce eski (artık var olmayan) zemini ölçmesin
 * diye eski bileşik değere düşerken uyarı basılır.
 */
function solidOrComposite(map, label, fallbackFg, fallbackA, fallbackBg) {
  const solid = map['card-solid'];
  if (solid && /^#[0-9a-f]{6}$/i.test(solid.trim())) return hexToRgb(solid.trim());
  console.warn(`  ! uyarı: ${label} için --card-solid bulunamadı; eski yarı saydam zemine düşülüyor.`);
  return composite(hexToRgb(fallbackFg), fallbackA, hexToRgb(fallbackBg));
}

const surfaces = [
  {
    label: 'AÇIK · kart (opak)',
    map: light,
    bg: solidOrComposite(light, 'açık tema', '#FFFFFF', 0.72, '#F1EBFF'),
  },
  {
    label: 'KOYU · kart (opak)',
    map: dark,
    bg: solidOrComposite(dark, 'koyu tema', '#111114', 0.96, '#000000'),
  },
];

/**
 * Koyu cam yüzeyi CSS'ten okunur, sabitlenmez — AD-26 malzemeyi değiştirdiğinde
 * denetim sessizce eski zemini ölçmeye devam etmesin diye.
 *
 * AD-41 sonrası `.glass` içerik katmanında KULLANILMIYOR (68 → 0); kural yalnızca
 * fonksiyonel katman sözleşmesi olarak duruyor. Ölçüm yine de korunuyor: kural
 * CSS'te olduğu sürece biri onu yeniden kullanabilir, o gün kontrastı bilinmeli.
 */
const darkGlass = css
  .match(/#root\[data-theme="dark"\]\s*\.glass\{[^}]*background:\s*rgba\(([^)]+)\)/)
  ?.[1]
  .split(',')
  .map((n) => Number(n.trim()));

if (darkGlass?.length === 4 && darkGlass.every(Number.isFinite)) {
  const [r, g, b, a] = darkGlass;
  surfaces.push({
    label: 'KOYU · cam (kullanılmıyor, sözleşme)',
    map: dark,
    bg: composite([r, g, b], a, hexToRgb('#000000')),
  });
}

let failed = 0;
let checked = 0;

for (const { label, map, bg } of surfaces) {
  console.log(`\n${label}`);
  for (const name of TEXT_TOKENS) {
    const rgb = resolve(name, map);
    if (!rgb) {
      console.log(`  ${name.padEnd(12)} —      tanımsız (atlandı)`);
      continue;
    }
    checked++;
    const ratio = contrast(rgb, bg);
    const ok = ratio >= THRESHOLD;
    if (!ok) failed++;
    const grade = ratio >= 7 ? 'AAA' : ok ? 'AA' : 'FAIL';
    console.log(`  ${name.padEnd(12)} ${ratio.toFixed(2).padStart(6)}:1  ${grade}`);
  }
}

console.log(
  `\n${checked} token denetlendi, ${failed} tanesi ${THRESHOLD}:1 eşiğinin altında.`,
);
process.exit(failed === 0 ? 0 : 1);
