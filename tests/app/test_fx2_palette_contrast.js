'use strict';

// FX2-05 — Kontrast ve tema fixture'ı (ağ/VM/DOM yok)
// Yalnızca app/styles.css tokenlarını okuyarak FX2-03/04 renk sözleşmesini
// kilitler. Çalıştırma: node tests/app/test_fx2_palette_contrast.js

const fs = require('node:fs');
const path = require('node:path');
const repoRoot = require('../repo-root');

const css = fs.readFileSync(path.join(repoRoot, 'app/styles.css'), 'utf8');
let passed = 0;
let failed = 0;

function group(name, condition, detail) {
  if (condition) {
    passed += 1;
    console.log(`PASS ${name}`);
  } else {
    failed += 1;
    console.log(`FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

function extractBlock(source, marker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) return '';
  const openIndex = source.indexOf('{', markerIndex);
  if (openIndex < 0) return '';

  let depth = 0;
  for (let index = openIndex; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(openIndex + 1, index);
    }
  }
  return '';
}

function readVars(block) {
  const vars = Object.create(null);
  const pattern = /--([a-z0-9-]+)\s*:\s*([^;{}]+);/gi;
  let match;
  while ((match = pattern.exec(block))) vars[match[1]] = match[2].trim();
  return vars;
}

const light = readVars(extractBlock(css, '#root{'));
const dark = readVars(extractBlock(css, '#root[data-theme="dark"]{'));

function hex(value) {
  const match = String(value || '').match(/^#([0-9a-f]{6})$/i);
  return match ? `#${match[1].toUpperCase()}` : null;
}

function resolveHex(vars, name, seen) {
  const visited = seen || new Set();
  if (visited.has(name)) return null;
  visited.add(name);
  const value = vars[name];
  const direct = hex(value);
  if (direct) return direct;
  const reference = String(value || '').match(/^var\(--([a-z0-9-]+)\)$/i);
  return reference ? resolveHex(vars, reference[1], visited) : null;
}

function rgb(hexValue) {
  const value = hexValue.slice(1);
  return [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16));
}

function srgb(value) {
  value /= 255;
  return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
}

function lum(hexValue) {
  const [red, green, blue] = rgb(hexValue);
  return 0.2126 * srgb(red) + 0.7152 * srgb(green) + 0.0722 * srgb(blue);
}

function ratio(first, second) {
  const a = lum(first);
  const b = lum(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function hueAndSaturation(hexValue) {
  const [red, green, blue] = rgb(hexValue).map((value) => value / 255);
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const lightness = (max + min) / 2;
  if (delta === 0) return { hue: 0, saturation: 0 };

  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue;
  if (max === red) hue = ((green - blue) / delta) % 6;
  else if (max === green) hue = (blue - red) / delta + 2;
  else hue = (red - green) / delta + 4;
  hue *= 60;
  if (hue < 0) hue += 360;
  return { hue, saturation };
}

function circularHueDistance(first, second) {
  const distance = Math.abs(first - second) % 360;
  return Math.min(distance, 360 - distance);
}

function goldLadder(vars) {
  return [1, 2, 3, 4, 5].map((index) => resolveHex(vars, `gold-${index}`));
}

// 1. Pembe yok.
group(
  'FX2-05.1 pembe token sızıntısı yok',
  !/C77D93|B55471|FFB1CF|FCEDEE|F1EBFF|D96D8B/i.test(css)
);

// 2. Kandil rengi anlamlı istisna olarak korunur.
group(
  'FX2-05.2 kandil renkleri korundu',
  /--kandil:\s*#9C4A5A\b/i.test(css) && /--kandil2:\s*#D68A94\b/i.test(css)
);

// 3. Hub ve marka renkleri değişmez.
group(
  'FX2-05.3 hub ve marka renkleri korundu',
  light.read === '#6E55BF' &&
    light.watch === '#B5732E' &&
    light.listen === '#0E8F9C' &&
    light.sun === '#F5A623' &&
    light.warn === '#E5484D'
);

// 4. İki temada da beş geçerli altın basamağı bulunur.
const lightGold = goldLadder(light);
const darkGold = goldLadder(dark);
group(
  'FX2-05.4 iki temada altın merdiveni geçerli',
  lightGold.every(Boolean) && darkGold.every(Boolean)
);

// 5. Her merdivende luminance açık → koyu azalır.
function monotonicDescending(values) {
  const luminances = values.map(lum);
  return luminances.every((value, index) => index === 0 || luminances[index - 1] > value);
}
group(
  'FX2-05.5 altın merdiveni luminance monoton',
  monotonicDescending(lightGold) && monotonicDescending(darkGold)
);

// 6. Beş basamak tek hue ailesinde kalır.
function hueSpread(values) {
  const hues = values.map(hueAndSaturation).map((value) => value.hue);
  return Math.max(...hues) - Math.min(...hues) <= 12;
}
group(
  'FX2-05.6 altın merdiveni hue farkı <= 12 derece',
  hueSpread(lightGold) && hueSpread(darkGold)
);

// 7. Açık tema: dört kontrast çifti.
const lightAccentInk = resolveHex(light, 'accent-ink');
const lightText = resolveHex(light, 'text');
const lightContrast = [
  [lightAccentInk, '#FDFBF7'],
  [lightAccentInk, '#F7F1E8'],
  [lightText, '#FDFBF7'],
  [lightText, '#F2EFF4']
];
group(
  'FX2-05.7 açık tema dört kontrast çifti >= 4.5',
  lightContrast.every(([foreground, background]) => foreground && ratio(foreground, background) >= 4.5)
);

// 8. Koyu tema: dört kontrast çifti.
const darkAccent = resolveHex(dark, 'accent');
const darkText = resolveHex(dark, 'text');
const darkGold3 = resolveHex(dark, 'gold-3');
const darkGold4 = resolveHex(dark, 'gold-4');
const darkContrast = [
  [darkAccent, '#000000'],
  [darkText, '#000000'],
  [darkGold3, '#000000'],
  [darkGold4, '#111114']
];
group(
  'FX2-05.8 koyu tema dört kontrast çifti >= 4.5',
  darkContrast.every(([foreground, background]) => foreground && ratio(foreground, background) >= 4.5)
);

// 9. Accent dolgu/kenarlık eşiği.
const lightAccent = resolveHex(light, 'accent');
group(
  'FX2-05.9 açık accent dolgu eşiği >= 3',
  !!lightAccent && ratio(lightAccent, '#FFFFFF') >= 3
);

// 10. Altı ana renk tokenı iki temada da tanımlı.
const requiredTokens = ['accent', 'accent-ink', 'accent-soft', 'accent-bg', 'learn', 'learn-bg'];
group(
  'FX2-05.10 ana token bütünlüğü',
  requiredTokens.every((name) => light[name] && dark[name])
);

// 11. Altın ailesine taşınan üç yüzeyde ham hex sızıntısı kalmaz.
group(
  'FX2-05.11 ÆON ve zikir ham hex sızıntısı yok',
  [light, dark].every((vars) => ['aeon', 'aeon2', 'zikr-counter-gold'].every((name) => /^var\(--gold-/.test(vars[name] || '')))
);

// 12. Açık tema page gradienti üç nötr duraktan oluşur.
const pageStops = (light.page || '').match(/#[0-9a-f]{6}/gi) || [];
const pageNoPinkStop = pageStops.length === 3 && pageStops.every((stop) => {
  const { hue, saturation } = hueAndSaturation(stop);
  const pink = (hue >= 300 || hue <= 20) && saturation > 0.15;
  return !pink;
});
group('FX2-05.12 page gradienti üç pembe olmayan durak', pageNoPinkStop);

console.log(`Passed: ${passed} / ${passed + failed}`);
if (failed > 0) process.exit(1);
