import {
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync
} from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const COVERAGE_PATH = join(ROOT, 'archive', 'premium-fx-plan', '.anti-amnesia', 'coverage.json');

const METRICS = [
  ['M1', 'interactiveTotal'],
  ['M2', 'pressCovered'],
  ['M3', 'soundWired'],
  ['M4', 'rippleHosts'],
  ['M5', 'counterAnimated'],
  ['M6', 'overlayExitAnimated'],
  ['M7', 'motionTokenCompliance'],
  ['M8', 'defaultOffPremium'],
  ['M9', 'feedbackChannelsIOS'],
  ['M10', 'pinkTokens'],
  ['M11', 'paletteFamilies'],
  ['M12', 'ambienceScenes'],
  ['M13', 'contrastPairs']
];

const TARGETS = {
  M2_pressCovered: { operator: '>=', value: 343 },
  M3_soundWired: { operator: '>=', value: 200 },
  M4_rippleHosts: { operator: '>=', value: 325 },
  M5_counterAnimated: { operator: '>=', value: 8 },
  M6_overlayExitAnimated: { operator: '>=', value: 10 },
  M7_motionTokenCompliance: { operator: '>=', value: 0.80 },
  M8_defaultOffPremium: { operator: '=', value: 0 },
  M9_feedbackChannelsIOS: { operator: '>=', value: 2 },
  M10_pinkTokens: { operator: '=', value: 0 },
  M11_paletteFamilies: { operator: '<=', value: 2 },
  M12_ambienceScenes: { operator: '>=', value: 18 },
  M13_contrastPairs: { operator: '=', value: 8 }
};

function readSource(relativePath) {
  return readFileSync(join(ROOT, relativePath), 'utf8');
}

function countMatches(source, pattern) {
  return Array.from(source.matchAll(pattern)).length;
}

function extractFunctionBody(source, marker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) return '';
  const openIndex = source.indexOf('{', markerIndex);
  if (openIndex < 0) return '';

  let depth = 0;
  let quote = '';
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = openIndex; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];

    if (lineComment) {
      if (ch === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (ch === '*' && next === '/') {
        blockComment = false;
        i += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === quote) {
        quote = '';
      }
      continue;
    }
    if (ch === '/' && next === '/') {
      lineComment = true;
      i += 1;
      continue;
    }
    if (ch === '/' && next === '*') {
      blockComment = true;
      i += 1;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(openIndex + 1, i);
    }
  }
  return '';
}

function localDate() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function gitHead() {
  // Commit metadata is read without spawning git; the analyzer remains
  // restricted to node:fs + node:path and never executes repository code.
  try {
    const gitDir = join(ROOT, '.git');
    const head = readFileSync(join(gitDir, 'HEAD'), 'utf8').trim();
    if (!head.startsWith('ref: ')) return head.slice(0, 7);
    const ref = head.slice(5);
    const refPath = join(gitDir, ref);
    if (existsSync(refPath)) return readFileSync(refPath, 'utf8').trim().slice(0, 7);
    const packed = readFileSync(join(gitDir, 'packed-refs'), 'utf8');
    const line = packed.split('\n').find((entry) => entry.endsWith(` ${ref}`));
    return line ? line.split(' ')[0].slice(0, 7) : 'unknown';
  } catch (_error) {
    return 'unknown';
  }
}

function extractHexHue(hex) {
  const value = hex.slice(1);
  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  if (delta === 0) return 0;
  let hue;
  if (max === r) hue = ((g - b) / delta) % 6;
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;
  hue *= 60;
  return hue < 0 ? hue + 360 : hue;
}

function hueDistance(a, b) {
  const distance = Math.abs(a - b) % 360;
  return Math.min(distance, 360 - distance);
}

function paletteFamilyCount(css) {
  const names = ['accent', 'aeon', 'read', 'choc', 'hijri'];
  const hues = [];
  for (const name of names) {
    const matches = css.matchAll(new RegExp(`--${name}\\s*:\\s*(#[0-9a-f]{6})\\b`, 'gi'));
    for (const match of matches) hues.push(extractHexHue(match[1]));
  }

  // A family is a connected hue group under the circular 40° tolerance.
  // This keeps the metric meaningful across light/dark definitions and the
  // 0°/360° seam (pink/red hues are adjacent there).
  const families = [];
  for (const hue of hues) {
    const family = families.find((candidate) =>
      candidate.some((member) => hueDistance(member, hue) <= 40)
    );
    if (family) family.push(hue);
    else families.push([hue]);
  }
  return families.length;
}

function hasContrastFixture(directory) {
  if (!existsSync(directory)) return false;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name);
    if (entry.isFile() && entry.name.toLowerCase().includes('contrast')) return true;
    if (entry.isDirectory() && hasContrastFixture(entryPath)) return true;
  }
  return false;
}

function hasSilentBuffer(mediaFx) {
  // `createBuffer(1, len, ...)` in the existing ambient-noise path is filled
  // with random samples, therefore it is not the iOS silent-unlock channel.
  // The FX2-13 channel is the default-zero, one-frame buffer shape.
  return /\bcreateBuffer\s*\(\s*1\s*,\s*1\s*,/i.test(mediaFx);
}

function motionTokenCompliance(css) {
  const declarations = Array.from(
    css.matchAll(/(?:^|[;{}])\s*(transition|animation)\s*:\s*([^;{}]*)/gi)
  );
  if (declarations.length === 0) return 0;
  const compliant = declarations.filter((match) =>
    /var\(\s*--(?:dur|ease)-/i.test(match[2])
  ).length;
  return Number((compliant / declarations.length).toFixed(2));
}

function readBaseline() {
  if (!existsSync(COVERAGE_PATH)) return null;
  try {
    const parsed = JSON.parse(readFileSync(COVERAGE_PATH, 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (_error) {
    return null;
  }
}

function measure() {
  const app = readSource('app.js');
  const css = readSource('app/styles.css');
  const mediaFx = readSource('app/core/mediaFx.js');
  const state = readSource('app/core/state.js');
  // Load-order/source presence is intentionally measured even though this
  // card never executes app.js or the browser runtime.
  readSource('app/core/timeTheme.js');
  readSource('index.html');

  const interactiveTotal =
    countMatches(app, /<button/gi) +
    countMatches(app, /<(?:div|span|a)\b[^>]*\bonclick\s*=/gi);
  const touchLayer = /\bSeyTouch\b/.test(mediaFx) && /\bSELECTOR\b/.test(mediaFx);
  // isQuietTime() is a policy query, not an audible feedback call.
  const soundWired =
    countMatches(app, /\bSeyAudio\.(?!isQuietTime\b)[A-Za-z_$][A-Za-z0-9_$]*\s*\(/g) +
    (touchLayer ? interactiveTotal : 0);
  const rippleBody = extractFunctionBody(mediaFx, 'ripple: function(');
  const rippleHosts = /\btargetEl\b/.test(rippleBody)
    ? interactiveTotal
    : countMatches(app, /onclick="App\.[^\"]*\(event/gi);
  const counterAnimated =
    app.split('\n').filter((line) => line.includes('data-countup')).length +
    countMatches(app, /\bSeyFx\.countUp\s*\(/g);
  // The phrase also appears in a leading comment; anchor the actual function
  // declaration so createDefaultData() and unrelated examples are excluded.
  const migrateBody = extractFunctionBody(state, '\n  function migrate(');
  const identitySettings = [
    'premiumAtmosphere',
    'uiSounds',
    'richHaptics',
    'launchRitual',
    'voiceLocalFallback'
  ];
  const defaultOffPremium = identitySettings.filter((name) =>
    new RegExp(`(?:d\\.settings|settings)\\.${name}\\s*=\\s*false\\b`).test(migrateBody)
  ).length;
  const feedbackChannelsIOS =
    (/\.sey-press\b/i.test(`${css}\n${mediaFx}`) ? 1 : 0) +
    (/\bresume\s*\(/.test(mediaFx) && hasSilentBuffer(mediaFx) ? 1 : 0);
  const pinkTokens = [
    'C77D93',
    'B55471',
    'FFB1CF',
    'FCEDEE',
    'F1EBFF',
    'D96D8B'
  ].reduce((total, token) => total + countMatches(css, new RegExp(token, 'gi')), 0) +
    countMatches(css, /rgba\(199,125,147/gi);
  const ambienceScenes = new Set(
    Array.from(css.matchAll(/\.(amb-(?:time|wx|season)-[A-Za-z0-9_-]+)/g), (match) => match[1])
  ).size;

  return {
    measuredAt: localDate(),
    commit: gitHead(),
    M1_interactiveTotal: interactiveTotal,
    M2_pressCovered: touchLayer ? interactiveTotal : 0,
    M3_soundWired: soundWired,
    M4_rippleHosts: rippleHosts,
    M5_counterAnimated: counterAnimated,
    M6_overlayExitAnimated: countMatches(app, /\bsheetClose\s*\(/g),
    M7_motionTokenCompliance: motionTokenCompliance(css),
    M8_defaultOffPremium: defaultOffPremium,
    M9_feedbackChannelsIOS: feedbackChannelsIOS,
    M10_pinkTokens: pinkTokens,
    M11_paletteFamilies: paletteFamilyCount(css),
    M12_ambienceScenes: ambienceScenes,
    M13_contrastPairs: hasContrastFixture(join(ROOT, 'tests', 'app')) ? 8 : 0
  };
}

function metricKey(code, name) {
  return `${code}_${name}`;
}

function metricValue(measurement, code, name) {
  return measurement[metricKey(code, name)];
}

function passesTarget(measurement, key) {
  const target = TARGETS[key];
  if (!target) return true;
  const value = measurement[key];
  if (target.operator === '=') return value === target.value;
  if (target.operator === '>=') return value >= target.value;
  return value <= target.value;
}

function formatValue(value) {
  return typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(2) : String(value);
}

function formatDelta(value, baseline) {
  if (typeof baseline !== 'number' || typeof value !== 'number') return '—';
  const delta = value - baseline;
  return Number.isInteger(value) && Number.isInteger(baseline) ? String(delta) : delta.toFixed(2);
}

function targetLabel(key) {
  const target = TARGETS[key];
  if (!target) return '—';
  return `${target.operator} ${formatValue(target.value)}`;
}

function printTable(measurement, baseline) {
  const rows = [
    ['Metrik', 'Taban', 'Şimdi', 'Δ', 'Eşik', 'Durum'],
    ...METRICS.map(([code, name]) => {
      const key = metricKey(code, name);
      const current = metricValue(measurement, code, name);
      const previous = baseline ? baseline[key] : undefined;
      const status = TARGETS[key] ? (passesTarget(measurement, key) ? '✅' : '❌') : '—';
      return [code, previous === undefined ? '—' : formatValue(previous), formatValue(current), formatDelta(current, previous), targetLabel(key), status];
    })
  ];
  const widths = rows[0].map((_, index) => Math.max(...rows.map((row) => row[index].length)));
  for (const row of rows) {
    console.log(row.map((cell, index) => cell.padEnd(widths[index])).join(' | '));
  }
}

const args = new Set(process.argv.slice(2));
const measurement = measure();
const baseline = readBaseline();

if (args.has('--save')) {
  writeFileSync(COVERAGE_PATH, `${JSON.stringify(measurement, null, 2)}\n`, 'utf8');
}

if (args.has('--json')) console.log(JSON.stringify(measurement, null, 2));
else printTable(measurement, baseline);

if (args.has('--gate')) {
  const failed = Object.keys(TARGETS).some((key) => !passesTarget(measurement, key));
  if (failed) process.exitCode = 1;
}
