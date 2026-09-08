'use strict';

// FX2-23 — Canlı Zemin fixture'ı (Dalga 5 kapanışı)
// Ağsız; node:vm ile GERÇEK timeTheme.js'i sahte window/document ile yükler,
// ayrıca app/styles.css'i metin olarak okur. 14 test grubu.
// Çalıştırma: node tests/app/test_fx2_ambience.js

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const timeThemeSrc = fs.readFileSync(path.join(repoRoot, 'app/core/timeTheme.js'), 'utf8');
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

// ── Sahte root: apply()'nin ihtiyaç duyduğu className/classList/style ──
// className, classList değişiklikleriyle senkron tutulur (gerçek DOM gibi).
function makeRoot(initial) {
  const classes = initial ? String(initial).split(/\s+/).filter(Boolean) : [];
  const styleProps = Object.create(null);
  const root = {
    className: classes.join(' '),
    style: {
      setProperty(k, v) { styleProps[k] = String(v); },
      getPropertyValue(k) { return styleProps[k] || null; }
    },
    classList: {
      add(c) { if (classes.indexOf(c) === -1) classes.push(c); root.className = classes.join(' '); },
      remove() {
        for (let i = 0; i < arguments.length; i += 1) {
          const idx = classes.indexOf(arguments[i]);
          if (idx > -1) classes.splice(idx, 1);
        }
        root.className = classes.join(' ');
      },
      contains(c) { return classes.indexOf(c) > -1; }
    },
    _classes: classes,
    _style: styleProps
  };
  return root;
}

// ── VM: gerçek timeTheme.js'i sahte window/document ile yükle ──
let fakeRoot = makeRoot('');
const fakeDocument = {
  hidden: false,
  getElementById(id) { return id === 'root' ? fakeRoot : null; },
  addEventListener() {}
};
const sandbox = {
  window: {},
  document: fakeDocument,
  console
};
sandbox.window.SeymaState = { data: { settings: { premiumAtmosphere: true } } };
vm.createContext(sandbox);
vm.runInContext(timeThemeSrc, sandbox);
const SeyAmbience = sandbox.window.SeyAmbience;
const SeyTimeTheme = sandbox.window.SeyTimeTheme;

// ── CSS blok yardımcıları ──
function blocksForSelector(source, needle) {
  const blocks = [];
  let idx = 0;
  while (idx < source.length) {
    const pos = source.indexOf(needle, idx);
    if (pos < 0) break;
    const open = source.indexOf('{', pos);
    if (open < 0) break;
    let depth = 0;
    let end = -1;
    for (let i = open; i < source.length; i += 1) {
      if (source[i] === '{') depth += 1;
      else if (source[i] === '}') {
        depth -= 1;
        if (depth === 0) { end = i; break; }
      }
    }
    if (end < 0) break;
    const selStart = source.lastIndexOf('}', pos) + 1;
    blocks.push({
      selector: source.slice(selStart, open).trim(),
      body: source.slice(open + 1, end)
    });
    idx = end + 1;
  }
  return blocks;
}

function propsOf(body) {
  const props = [];
  body.split(';').forEach((decl) => {
    const colon = decl.indexOf(':');
    if (colon > 0) {
      const p = decl.slice(0, colon).trim();
      if (p) props.push(p);
    }
  });
  return props;
}

function parseOpacity(value) {
  const calcMatch = value.match(/calc\(\.(\d+)/);
  if (calcMatch) return Number(`0.${calcMatch[1]}`);
  const plain = value.match(/(\d+(?:\.\d+)?)/);
  return plain ? Number(plain[1]) : 0;
}

function opacityOf(body) {
  const decl = body.split(';').find((d) => d.trim().indexOf('opacity:') === 0);
  if (!decl) return null;
  return parseOpacity(decl.slice(decl.indexOf(':') + 1).trim());
}

// ── Kontrast fonksiyonları (FX2-05'ten kopya) ──
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

// ═══════════════════════════════════════════════════════════════════════════
// 1. WMO eşlemesi tam
// ═══════════════════════════════════════════════════════════════════════════
const WX_EXPECT = [
  ['amb-wx-clear',   [0, 1]],
  ['amb-wx-cloud',   [2, 3]],
  ['amb-wx-fog',     [45, 48]],
  ['amb-wx-drizzle', [51, 53, 55, 56, 57]],
  ['amb-wx-rain',    [61, 63, 65, 66, 67, 80, 81, 82]],
  ['amb-wx-snow',    [71, 73, 75, 77, 85, 86]],
  ['amb-wx-storm',   [95, 96, 99]]
];
let wmoOk = true;
WX_EXPECT.forEach((entry) => {
  entry[1].forEach((code) => {
    if (SeyAmbience.weatherClass(code) !== entry[0]) wmoOk = false;
  });
});
group(
  'FX2-23.1 WMO eşlemesi tam (8 sahne + bilinmeyen/null → none)',
  wmoOk &&
    SeyAmbience.weatherClass(999) === 'amb-wx-none' &&
    SeyAmbience.weatherClass(null) === 'amb-wx-none' &&
    SeyAmbience.weatherClass(undefined) === 'amb-wx-none' &&
    SeyAmbience.weatherClass('abc') === 'amb-wx-none',
  'bir WMO kodu yanlış sahneye gidiyor'
);

// ═══════════════════════════════════════════════════════════════════════════
// 2. Şiddet sınırları
// ═══════════════════════════════════════════════════════════════════════════
let boundsOk = true;
for (let p = 0; p <= 10; p += 0.5) {
  for (let w = 0; w <= 50; w += 2.5) {
    const v = SeyAmbience.intensity({ precip: p, wind: w });
    if (!(v >= 0.15 && v <= 1)) boundsOk = false;
  }
}
group(
  'FX2-23.2 şiddet sınırları (0.15 ≤ x ≤ 1; uçlar doğru)',
  boundsOk &&
    SeyAmbience.intensity({ precip: 0, wind: 0 }) === 0.15 &&
    SeyAmbience.intensity({ precip: 99, wind: 99 }) === 1 &&
    SeyAmbience.intensity(null) === 0.35 &&
    SeyAmbience.intensity({ precip: 4, wind: 20 }) === 0.5,
  'intensity() sınır dışı değer üretiyor'
);

// ═══════════════════════════════════════════════════════════════════════════
// 3. Seed determinizmi
// ═══════════════════════════════════════════════════════════════════════════
const seedA = SeyAmbience.seed(new Date(2026, 5, 15, 3, 0));
const seedB = SeyAmbience.seed(new Date(2026, 5, 15, 23, 0));
const seedC = SeyAmbience.seed(new Date(2026, 5, 16, 3, 0));
let seedRangeOk = true;
for (let i = 0; i < 100; i += 1) {
  const s = SeyAmbience.seed(new Date(2026, 0, 1 + i));
  if (!(s >= 0 && s < 1)) seedRangeOk = false;
}
group(
  'FX2-23.3 seed determinizmi (aynı gün aynı, farklı gün farklı, 0≤s<1)',
  seedA === seedB && seedA !== seedC && seedRangeOk,
  'seed deterministik değil veya aralık dışı'
);

// ═══════════════════════════════════════════════════════════════════════════
// 4. Güneş saati — 4 dilimin hepsi üretilebiliyor
// ═══════════════════════════════════════════════════════════════════════════
// sunrise 06:00, sunset 18:00 → dawn [05:15,07:15) day [07:15,16:30)
// dusk [16:30,18:45) night geri kalan
const solarSpot = { sunrise: '2026-06-15T06:00:00', sunset: '2026-06-15T18:00:00' };
group(
  'FX2-23.4 güneş saati 4 dilimin hepsi üretilebiliyor',
  SeyAmbience.timeClass(new Date(2026, 5, 15, 6, 0), solarSpot) === 'amb-time-dawn' &&
    SeyAmbience.timeClass(new Date(2026, 5, 15, 12, 0), solarSpot) === 'amb-time-day' &&
    SeyAmbience.timeClass(new Date(2026, 5, 15, 17, 0), solarSpot) === 'amb-time-dusk' &&
    SeyAmbience.timeClass(new Date(2026, 5, 15, 22, 0), solarSpot) === 'amb-time-night',
  'bir dilim yanlış eşleniyor'
);

// ═══════════════════════════════════════════════════════════════════════════
// 5. Fallback — spot=null yine geçerli amb-time-* döner
// ═══════════════════════════════════════════════════════════════════════════
const fb = SeyAmbience.timeClass(new Date(2026, 5, 15, 12, 0), null);
group(
  'FX2-23.5 fallback geçerli amb-time-* dönüyor (undefined değil)',
  typeof fb === 'string' && fb.indexOf('amb-time-') === 0,
  `fallback çıktısı: ${fb}`
);

// ═══════════════════════════════════════════════════════════════════════════
// 6. Fallback eşleşmesi — classForHour'ın amb- karşılığı
// ═══════════════════════════════════════════════════════════════════════════
let fbMatchOk = true;
[5, 9, 17, 21].forEach((h) => {
  const expected = SeyTimeTheme.classForHour(h).replace('theme-time-', 'amb-time-');
  if (SeyAmbience.timeClass(new Date(2026, 5, 15, h, 0), null) !== expected) fbMatchOk = false;
});
group(
  'FX2-23.6 fallback SeyTimeTheme.classForHour ile eşleşiyor',
  fbMatchOk,
  'fallback classForHour karşılığını üretmiyor'
);

// ═══════════════════════════════════════════════════════════════════════════
// 7. apply() gating — premium kapalı → tüm amb-* silinir, false
// ═══════════════════════════════════════════════════════════════════════════
sandbox.window.SeymaState.data.settings.premiumAtmosphere = false;
fakeRoot = makeRoot('amb-time-day amb-wx-rain amb-season-summer theme-aurora');
const gated = SeyAmbience.apply(new Date(2026, 5, 15, 12, 0));
const gatedClean =
  !fakeRoot.classList.contains('amb-time-day') &&
  !fakeRoot.classList.contains('amb-wx-rain') &&
  !fakeRoot.classList.contains('amb-season-summer') &&
  fakeRoot.classList.contains('theme-aurora');
const gatedNoAdd = fakeRoot._classes.every((c) => c.indexOf('amb-') !== 0);
group(
  'FX2-23.7 apply() gating (premium kapalı → tüm amb-* silinir, false)',
  gated === false && gatedClean && gatedNoAdd,
  'premium kapalıyken amb-* sınıfları temizlenmedi veya false dönmedi'
);

// ═══════════════════════════════════════════════════════════════════════════
// 8. apply() yazımı — premium açık → 3 katman + 3 değişken
// ═══════════════════════════════════════════════════════════════════════════
sandbox.window.SeymaState.data.settings.premiumAtmosphere = true;
sandbox.window.SeymaState.data.weather = {
  spots: [{
    code: 61,
    isDay: true,
    precip: 4,
    wind: 20,
    sunrise: '2026-06-15T06:00:00',
    sunset: '2026-06-15T18:00:00'
  }]
};
fakeRoot = makeRoot('');
const applied = SeyAmbience.apply(new Date(2026, 5, 15, 12, 0));
const expectedSeed = (() => {
  const d = new Date(2026, 5, 15);
  const k = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  const x = Math.sin(k) * 10000;
  return (x - Math.floor(x)).toFixed(3);
})();
group(
  'FX2-23.8 apply() yazımı (3 katman + 3 değişken)',
  applied === true &&
    fakeRoot.classList.contains('amb-time-day') &&
    fakeRoot.classList.contains('amb-wx-rain') &&
    fakeRoot.classList.contains('amb-season-summer') &&
    fakeRoot._style['--wx-intensity'] === '0.50' &&
    fakeRoot._style['--amb-seed'] === expectedSeed &&
    fakeRoot._style['--wx-dim'] === '1',
  'apply() katmanları/değişkenleri yazmadı'
);

// ═══════════════════════════════════════════════════════════════════════════
// 9. Katman ayrımı (KRİTİK) — üçü aynı özelliği yazmıyor
// ═══════════════════════════════════════════════════════════════════════════
// amb-time-*: --page / --amb-angle (+ geçiş için transition)
// amb-wx-*:   yalnız #sey-aurora::after hedefler; opacity/background/animation
// amb-season-*: --season-accent / box-shadow
const timeBlocks = blocksForSelector(css, 'amb-time-');
const wxBlocks = blocksForSelector(css, 'amb-wx-');
const seasonBlocks = blocksForSelector(css, 'amb-season-');

const timeProps = new Set();
timeBlocks.forEach((b) => propsOf(b.body).forEach((p) => timeProps.add(p)));
const wxProps = new Set();
wxBlocks.forEach((b) => propsOf(b.body).forEach((p) => wxProps.add(p)));
const seasonProps = new Set();
seasonBlocks.forEach((b) => propsOf(b.body).forEach((p) => seasonProps.add(p)));

const TIME_ALLOWED = new Set(['--page', '--amb-angle', 'transition']);
const WX_ALLOWED = new Set(['opacity', 'background', 'background-size', 'animation']);
const SEASON_ALLOWED = new Set(['--season-accent', 'box-shadow']);

const timeOk = [...timeProps].every((p) => TIME_ALLOWED.has(p));
const wxOk = [...wxProps].every((p) => WX_ALLOWED.has(p));
const seasonOk = [...seasonProps].every((p) => SEASON_ALLOWED.has(p));
const wxTargetsAurora = wxBlocks.every((b) => b.selector.indexOf('#sey-aurora::after') > -1);
const timeNoAurora = timeBlocks.every((b) => b.selector.indexOf('#sey-aurora::after') === -1);
const seasonNoAurora = seasonBlocks.every((b) => b.selector.indexOf('#sey-aurora::after') === -1);
const disjoint =
  [...timeProps].every((p) => !wxProps.has(p) && !seasonProps.has(p)) &&
  [...wxProps].every((p) => !seasonProps.has(p));

group(
  'FX2-23.9 katman ayrımı (üçü aynı özelliği yazmıyor)',
  timeOk && wxOk && seasonOk && wxTargetsAurora && timeNoAurora && seasonNoAurora && disjoint,
  `time:[${[...timeProps]}] wx:[${[...wxProps]}] season:[${[...seasonProps]}]`
);

// ═══════════════════════════════════════════════════════════════════════════
// 10. Opaklık tavanı — hiçbir amb-wx-* kuralında opacity > 0.09
// ═══════════════════════════════════════════════════════════════════════════
let opacityOk = true;
let maxOpacity = 0;
wxBlocks.forEach((b) => {
  const o = opacityOf(b.body);
  if (o === null) opacityOk = false;
  else {
    maxOpacity = Math.max(maxOpacity, o);
    if (o > 0.09) opacityOk = false;
  }
});
group(
  'FX2-23.10 opaklık tavanı (hiçbir amb-wx-* > 0.09)',
  opacityOk && maxOpacity <= 0.09,
  `maks opaklık: ${maxOpacity}`
);

// ═══════════════════════════════════════════════════════════════════════════
// 11. DOM parçacığı yok — yağmur/kar gradient; createElement = 0
// ═══════════════════════════════════════════════════════════════════════════
const rainBlock = wxBlocks.find((b) => b.selector.indexOf('amb-wx-rain') > -1);
const snowBlock = wxBlocks.find((b) => b.selector.indexOf('amb-wx-snow') > -1);
const noCreateElement = timeThemeSrc.indexOf('createElement') === -1;
const rainGradient = rainBlock &&
  (rainBlock.body.indexOf('repeating-linear-gradient') > -1 || rainBlock.body.indexOf('radial-gradient') > -1);
const snowGradient = snowBlock &&
  (snowBlock.body.indexOf('repeating-linear-gradient') > -1 || snowBlock.body.indexOf('radial-gradient') > -1);
group(
  'FX2-23.11 DOM parçacığı yok (gradient + createElement=0)',
  noCreateElement && !!rainGradient && !!snowGradient,
  'yağmur/kar gradient değil veya createElement var'
);

// ═══════════════════════════════════════════════════════════════════════════
// 12. Reduced-motion — renk kalır, hareket durur
// ═══════════════════════════════════════════════════════════════════════════
group(
  'FX2-23.12 reduced-motion #sey-aurora::after animation:none!important',
  css.indexOf('#sey-aurora::after{ animation:none!important; }') > -1,
  'reduced-motion bloğu eksik'
);

// ═══════════════════════════════════════════════════════════════════════════
// 13. Batarya — setInterval=0, visibilitychange, amb-paused
// ═══════════════════════════════════════════════════════════════════════════
const setIntervalCount = (timeThemeSrc.match(/setInterval/g) || []).length;
group(
  'FX2-23.13 batarya (setInterval=0, visibilitychange, amb-paused)',
  setIntervalCount === 0 &&
    timeThemeSrc.indexOf('visibilitychange') > -1 &&
    css.indexOf('#root.amb-paused') > -1 &&
    css.indexOf('animation-play-state:paused') > -1,
  `setInterval: ${setIntervalCount}`
);

// ═══════════════════════════════════════════════════════════════════════════
// 14. Kontrast (M13) — 4 zaman × 2 tema = 8 çift ≥ 4.5:1
// ═══════════════════════════════════════════════════════════════════════════
// Zamanın --page ilk durağı (hava katmanı ≤ %9 opaklıkla bindiği için en kötü
// durum ilk duraktır). Duraklar CSS'ten okunur, sabitlenmez.
function firstStopOfPage(body) {
  const m = body.match(/--page\s*:\s*(?:linear-gradient\([^,]*,\s*)?(#?[0-9a-fA-F]{3,8})/);
  return m ? m[1] : null;
}

const timeStops = { light: {}, dark: {} };
timeBlocks.forEach((b) => {
  const stop = firstStopOfPage(b.body);
  if (!stop) return;
  const timeMatch = b.selector.match(/amb-time-(dawn|day|dusk|night)/);
  if (!timeMatch) return;
  const time = timeMatch[1];
  if (b.selector.indexOf('[data-theme="dark"]') > -1) timeStops.dark[time] = stop;
  else timeStops.light[time] = stop;
});

const lightText = resolveHex(light, 'text');
const darkText = resolveHex(dark, 'text');
let contrastOk = true;
let worst = 99;
Object.keys(timeStops.light).forEach((t) => {
  const r = ratio(lightText, timeStops.light[t]);
  worst = Math.min(worst, r);
  if (r < 4.5) contrastOk = false;
});
Object.keys(timeStops.dark).forEach((t) => {
  const r = ratio(darkText, timeStops.dark[t]);
  worst = Math.min(worst, r);
  if (r < 4.5) contrastOk = false;
});
group(
  'FX2-23.14 kontrast M13 (4 zaman × 2 tema = 8 çift ≥ 4.5:1)',
  contrastOk &&
    Object.keys(timeStops.light).length === 4 &&
    Object.keys(timeStops.dark).length === 4,
  `en düşük oran: ${worst.toFixed(2)}`
);

console.log(`Passed: ${passed} / ${passed + failed}`);
if (failed > 0) process.exit(1);
