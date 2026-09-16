// MON2 · app.js kabuk envanteri.
// Ağsız, salt-okur ölçüm aracı: app.js'in sütun-0 blok yapısını sayar ve
// MON2 kartlarının önce/sonra kanıtını üretir. Hiçbir dosyaya yazmaz; --gate
// yalnız archive/monolit-bolumlenme-plan-2/MON2-STATE.json bütçesine karşı exit 1 verir.
//
//   node tools/shell-inventory.mjs            insan-okur tablo
//   node tools/shell-inventory.mjs --json     makine-okur ölçüm
//   node tools/shell-inventory.mjs --gate     bütçe + Legacy sayacı kapısı
//   node tools/shell-inventory.mjs --domain quran   alan ayrıntısı
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const APP_PATH = join(ROOT, 'app.js');
const STATE_PATH = join(ROOT, 'archive', 'monolit-bolumlenme-plan-2', 'MON2-STATE.json');
const SHIM_MAX_CODE_LINES = 2;
const BIG_MIN_CODE_LINES = 11;

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--') && a !== '--domain'));
const domainIdx = args.indexOf('--domain');
const domain = domainIdx >= 0 ? String(args[domainIdx + 1] || '') : '';

const isBlank = (l) => /^\s*$/.test(l);
const isComment = (l) => /^\s*\/\//.test(l);

function readBlocks(src) {
  const lines = src.split('\n');
  const starts = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^\S/.test(lines[i]) && !isComment(lines[i])) starts.push(i);
  }
  const blocks = [];
  for (let k = 0; k < starts.length; k++) {
    const s = starts[k];
    const e = k + 1 < starts.length ? starts[k + 1] : lines.length;
    const raw = lines.slice(s, e);
    const code = raw.filter((l) => !isBlank(l) && !isComment(l)).length;
    const head = lines[s];
    let kind = 'stmt';
    let name = null;
    let m;
    if ((m = head.match(/^function\s+([A-Za-z0-9_$]+)/))) { kind = 'fn'; name = m[1]; }
    else if ((m = head.match(/^App\.([A-Za-z0-9_$]+)\s*=\s*function/))) { kind = 'app'; name = 'App.' + m[1]; }
    else if ((m = head.match(/^var\s+([A-Za-z0-9_$]+)/))) { kind = 'var'; name = m[1]; }
    blocks.push({ line: s + 1, code, kind, name, text: raw.join('\n') });
  }
  return { lines, blocks };
}

function measure(src) {
  const { lines, blocks } = readBlocks(src);
  const fns = blocks.filter((b) => b.kind === 'fn' || b.kind === 'app');
  const sum = (a) => a.reduce((x, b) => x + b.code, 0);
  const shim = fns.filter((b) => b.code <= SHIM_MAX_CODE_LINES);
  const small = fns.filter((b) => b.code > SHIM_MAX_CODE_LINES && b.code < BIG_MIN_CODE_LINES);
  const big = fns.filter((b) => b.code >= BIG_MIN_CODE_LINES);
  const legacy = fns.filter((b) => /Legacy$/.test(b.name));
  const html = fns.filter((b) => /HTML$/.test(b.name.replace(/^App\./, '')) && b.code > SHIM_MAX_CODE_LINES);
  const domainOf = (needle) => {
    const re = new RegExp(needle, 'i');
    const dFns = fns.filter((b) => re.test(b.name) && !/Legacy$/.test(b.name));
    const dVars = blocks.filter((b) => b.kind === 'var' && re.test(b.name));
    const names = new Set(dFns.map((b) => b.name.replace(/^App\./, '')));
    const outside = blocks.filter((b) => !(b.kind !== 'var' && b.name && re.test(b.name)));
    const internalOnly = dFns.filter((f) => {
      if (f.kind === 'app') return false;
      const r = new RegExp('(^|[^A-Za-z0-9_$.])' + f.name.replace(/\$/g, '\\$') + '\\b');
      return !outside.some((b) => r.test(b.text));
    });
    return {
      functions: dFns.length,
      functionCodeLines: sum(dFns),
      appHandlers: dFns.filter((b) => b.kind === 'app').length,
      constants: dVars.length,
      constantCodeLines: sum(dVars),
      internalOnlyFunctions: internalOnly.length,
      internalOnlyCodeLines: sum(internalOnly),
      names: [...names].sort()
    };
  };
  return {
    totalLines: lines.length,
    codeLines: lines.filter((l) => !isBlank(l) && !isComment(l)).length,
    commentLines: lines.filter(isComment).length,
    functions: fns.length,
    functionCodeLines: sum(fns),
    shimFunctions: shim.length,
    shimCodeLines: sum(shim),
    smallFunctions: small.length,
    smallCodeLines: sum(small),
    bigFunctions: big.length,
    bigCodeLines: sum(big),
    appHandlers: fns.filter((b) => b.kind === 'app').length,
    appHandlerCodeLines: sum(fns.filter((b) => b.kind === 'app')),
    legacyFunctions: legacy.length,
    legacyCodeLines: sum(legacy),
    htmlBuilders: html.length,
    htmlBuilderCodeLines: sum(html),
    varBlocks: blocks.filter((b) => b.kind === 'var').length,
    varCodeLines: sum(blocks.filter((b) => b.kind === 'var')),
    reminder: domainOf('reminder'),
    domain: domain ? domainOf(domain) : null
  };
}

if (!existsSync(APP_PATH)) {
  console.error('shell-inventory: app.js bulunamadı: ' + APP_PATH);
  process.exit(2);
}
const measurement = measure(readFileSync(APP_PATH, 'utf8'));

if (flags.has('--json')) {
  console.log(JSON.stringify(measurement, null, 2));
} else {
  const r = measurement.reminder;
  const row = (k, v) => console.log(k.padEnd(34) + String(v).padStart(12));
  console.log('== app.js kabuk envanteri ==');
  row('toplam satır', measurement.totalLines);
  row('kod satırı (yorum/boş hariç)', measurement.codeLines);
  row('yorum satırı', measurement.commentLines);
  row('fonksiyon (sütun-0)', measurement.functions);
  row('  shim (≤2 kod satırı)', measurement.shimFunctions + ' / ' + measurement.shimCodeLines);
  row('  küçük (3–10)', measurement.smallFunctions + ' / ' + measurement.smallCodeLines);
  row('  büyük (≥11)', measurement.bigFunctions + ' / ' + measurement.bigCodeLines);
  row('App.* handler gövdesi', measurement.appHandlers + ' / ' + measurement.appHandlerCodeLines);
  row('*Legacy fonksiyon', measurement.legacyFunctions + ' / ' + measurement.legacyCodeLines);
  row('*HTML builder (>2 satır)', measurement.htmlBuilders + ' / ' + measurement.htmlBuilderCodeLines);
  row('var blokları', measurement.varBlocks + ' / ' + measurement.varCodeLines);
  console.log('-- reminder ayak izi --');
  row('fonksiyon / kod satırı', r.functions + ' / ' + r.functionCodeLines);
  row('  App.* handler', r.appHandlers);
  row('  yalnız-iç (shim gerekmez)', r.internalOnlyFunctions + ' / ' + r.internalOnlyCodeLines);
  row('sabit blok / satır', r.constants + ' / ' + r.constantCodeLines);
  if (measurement.domain) {
    const d = measurement.domain;
    console.log('-- ' + domain + ' ayak izi --');
    row('fonksiyon / kod satırı', d.functions + ' / ' + d.functionCodeLines);
    row('  App.* handler', d.appHandlers);
    row('  yalnız-iç', d.internalOnlyFunctions + ' / ' + d.internalOnlyCodeLines);
    row('sabit blok / satır', d.constants + ' / ' + d.constantCodeLines);
    console.log(d.names.join(', '));
  }
}

if (flags.has('--gate')) {
  if (!existsSync(STATE_PATH)) {
    console.error('shell-inventory --gate: MON2-STATE.json yok: ' + STATE_PATH);
    process.exit(2);
  }
  const state = JSON.parse(readFileSync(STATE_PATH, 'utf8'));
  const budget = state.shellBudget || {};
  const checks = [
    ['maxTotalLines', measurement.totalLines, 'app.js toplam satır'],
    ['maxLegacyFunctions', measurement.legacyFunctions, '*Legacy fonksiyon'],
    ['maxReminderFunctionCodeLines', measurement.reminder.functionCodeLines, 'reminder gövde satırı'],
    ['maxHtmlBuilderCodeLines', measurement.htmlBuilderCodeLines, '*HTML builder satırı']
  ];
  const failures = checks
    .filter(([key, value]) => typeof budget[key] === 'number' && value > budget[key])
    .map(([key, value, label]) => label + ' ' + value + ' > bütçe ' + budget[key]);
  if (failures.length) {
    console.error('shell-inventory --gate FAIL\n  ' + failures.join('\n  '));
    process.exit(1);
  }
  console.log('shell-inventory --gate PASS ' + JSON.stringify(budget));
}
