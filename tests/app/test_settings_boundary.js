// MON-37 — settings domain registry boundary.
// Eski app.js ayarlar gövdesi ile yeni SeymaSettings read/render registry'sini
// sentetik state/view/theme vektörlerinde birebir karşılaştırır. Browser, gerçek
// localStorage, token, ağ ve data repo yazımı yoktur.

'use strict';

const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

function read(rel) {
  return fs.readFileSync(path.join(repoRoot, rel), 'utf8');
}

function gitParentApp() {
  // This boundary belongs to MON-37, so HEAD^ is not a stable baseline once
  // later MON cards land. Resolve the commit that first added the settings
  // registry and compare against its actual parent instead.
  const settingsCommit = childProcess.execFileSync('git', [
    'log', '--format=%H', '--all', '--diff-filter=A', '--', 'app/core/settings.js'
  ], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024,
  }).trim().split(/\r?\n/)[0];
  assert.ok(settingsCommit, 'settings registry introduction commit exists');
  return childProcess.execFileSync('git', ['show', settingsCommit+'^:app.js'], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 5 * 1024 * 1024,
  });
}

function extract(source, startText, endText) {
  const start = source.indexOf(startText);
  const end = source.indexOf(endText, start + startText.length);
  assert.ok(start >= 0 && end > start, 'baseline settings source anchors exist');
  return source.slice(start, end).trim();
}

const appSource = read('app.js');
const settingsSource = read('app/core/settings.js');
const baselineSource = gitParentApp();
const baselineAyarlar = extract(baselineSource, 'function ayarlarHTML(){', 'function settingsBtn(');
const baselineSettingsBtn = extract(baselineSource, 'function settingsBtn(', '// ================= SAĞLIK');

let passed = 0;
let failed = 0;
function ok(name, condition, detail) {
  if (condition) {
    passed += 1;
    console.log('PASS  ' + name);
  } else {
    failed += 1;
    console.log('FAIL  ' + name + (detail ? ' — ' + detail : ''));
  }
}

function fixture(overrides) {
  const base = {
    startDate: '2026-09-11',
    lastSyncDate: '2026-09-10',
    days: {
      '2026-09-11': { habits: { sweetManaged: true, water: true }, mood: 4, note: 'sentetik' },
      '2026-09-10': { habits: {}, mood: null, note: '' },
    },
    settings: {
      haptics: true,
      premiumAtmosphere: true,
      uiSounds: true,
      richHaptics: false,
      launchRitual: true,
      voiceGuidance: true,
      ambientSounds: false,
      voiceLang: 'tr-TR',
      voiceRate: 1.25,
      voiceCloudVoice: 'shimmer',
      voiceCloudTts: false,
      voicePitch: 1.1,
      vitaminDForm: 'D₃K₂ damla',
      vitaminDDose: '1 damla',
      ghToken: '',
      ghRepo: '',
      openaiKey: '',
      hideLocationCard: false,
      hideRepoBanner: false,
      hideVacationCard: false,
    },
  };
  const out = JSON.parse(JSON.stringify(base));
  const extra = overrides || {};
  if (extra.settings) Object.assign(out.settings, extra.settings);
  if (extra.days) out.days = extra.days;
  if (extra.startDate) out.startDate = extra.startDate;
  if (extra.lastSyncDate) out.lastSyncDate = extra.lastSyncDate;
  return out;
}

function contextFor(data, ui, themePref) {
  const context = {
    console,
    Date,
    JSON,
    Math,
    Number,
    String,
    Boolean,
    Array,
    Object,
    isNaN,
    window: {
      MotivationProgramV2: {
        version: 'motivation-v2-test',
        progressSummary() { return { currentProgramDay: 4, totalDays: 120, percent: 3 }; },
      },
      MotivationNarratives: { version: 'narratives-test' },
      SeySync: { statusText() { return 'sentetik bekliyor'; } },
    },
  };
  const ctx = vm.createContext(context);
  const bootstrap = [
    'var data='+JSON.stringify(data)+';',
    'var ui='+JSON.stringify(ui)+';',
    'var themePref='+JSON.stringify(themePref)+';',
    'function icon(name,size){return "<i data-icon=\\""+name+":"+(size||20)+"\\"></i>";}',
    'function esc(value){return String(value==null?"":value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\\"/g,"&quot;");}',
    'function reminderCopy(key,fallback){return fallback;}',
    'function daysTracked(){return Object.keys(data.days||{}).filter(function(k){var r=data.days[k]||{};return !!(r.mood||r.note);}).length;}',
    'function countRec(rec){return rec&&rec.habits?Object.keys(rec.habits).filter(function(k){return rec.habits[k];}).length:0;}',
    'function featuresLive(){return true;}',
    'function todayStr(){return "2026-09-11";}',
    'function syncConfigured(){var s=data.settings||{};return !!(s.ghToken&&s.ghRepo);}',
  ].join('\n');
  vm.runInContext(bootstrap, ctx, { filename: 'settings-boundary-bootstrap.js' });
  return ctx;
}

function oldRender(data, ui, themePref) {
  const ctx = contextFor(data, ui, themePref);
  vm.runInContext(baselineAyarlar+'\n'+baselineSettingsBtn+'\nvar rendered=ayarlarHTML();', ctx, { filename: 'settings-baseline.js' });
  return { html: ctx.rendered, data: ctx.data, ui: ctx.ui };
}

function newRender(data, ui, themePref) {
  const ctx = contextFor(data, ui, themePref);
  vm.runInContext(settingsSource, ctx, { filename: 'app/core/settings.js' });
  vm.runInContext([
    'window.SeymaSettings.registerSettings({',
    'state:function(){return data;},',
    'view:function(){return ui;},',
    'theme:function(){return themePref;},',
    'icon:icon,esc:esc,reminderCopy:reminderCopy,daysTracked:daysTracked,',
    'countRec:countRec,featuresLive:featuresLive,todayStr:todayStr,syncConfigured:syncConfigured',
    '});',
    'var rendered=window.SeymaSettings.ayarlarHTML();',
  ].join('\n'), ctx, { filename: 'settings-registry-call.js' });
  return { html: ctx.rendered, data: ctx.data, ui: ctx.ui };
}

console.log('\n=== MON-37 settings boundary ===\n');

ok('SeymaSettings registry expose edildi', /window\.SeymaSettings=/.test(settingsSource));
const settingsBag = appSource.match(/window\.SeymaSettings\.registerSettings\(\{([\s\S]*?)\}\)/);
ok('registry dependency bag doğrudan data alanı taşımıyor',
  !!settingsBag && !/\bdata\s*:/.test(settingsBag[1]));
ok('settings modülü doğrudan localStorage/document/fetch kullanmıyor',
  !/localStorage|\bdocument\b|\bfetch\b/.test(settingsSource));
ok('settings modülü doğrudan state mutation taşımıyor',
  !/data\.[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*\s*=(?!=)|\.setItem\(|\.push\(/.test(settingsSource));
ok('app.js ayarlarHTML imza-koruyan render shim olarak kaldı',
  /function ayarlarHTML\(\)\{ return SEYMA_RENDER\.ayarlarHTML\.apply\(null,arguments\); \}/.test(appSource));
ok('app-owned settings mutation handlerları korunuyor',
  /App\.setTheme=function/.test(appSource) &&
  /App\.toggleHaptic=function/.test(appSource) &&
  /App\.toggleSetting=function/.test(appSource) &&
  /App\.adjustHijriOffset=function/.test(appSource));
ok('eski ayarlar gövdesi app.js içinde kalmadı',
  !/function ayarlarHTML\(\)\{\s*var h=/.test(appSource));

const cases = [
  { name: 'system + premium açık + gizli kartlar yok', data: fixture(), ui: { keyEdit: false, openaiKeyState: '' }, theme: 'system' },
  { name: 'dark + premium kapalı + gizli kartlar açık', data: fixture({ settings: {
    premiumAtmosphere: false, voiceCloudTts: true, hideLocationCard: true,
    hideRepoBanner: true, hideVacationCard: true, ghToken: 'fixture-token',
    ghRepo: 'fixture/repo', openaiKey: 'fixture-openai-key',
  }}), ui: { keyEdit: true, openaiKeyState: 'invalid' }, theme: 'dark' },
  { name: 'light + voice kapalı + bağlı repo', data: fixture({ settings: {
    voiceGuidance: false, ghToken: 'fixture-token', ghRepo: 'fixture/repo',
  }}), ui: { keyEdit: false, openaiKeyState: 'valid' }, theme: 'light' },
];

for (const vector of cases) {
  const before = JSON.stringify(vector.data);
  const oldResult = oldRender(vector.data, vector.ui, vector.theme);
  const newData = JSON.parse(JSON.stringify(vector.data));
  const newUi = JSON.parse(JSON.stringify(vector.ui));
  const newResult = newRender(newData, newUi, vector.theme);
  ok(vector.name+' HTML byte parity', newResult.html === oldResult.html,
    'old='+Buffer.byteLength(oldResult.html||'')+' new='+Buffer.byteLength(newResult.html||''));
  ok(vector.name+' render state read-only', JSON.stringify(newResult.data) === JSON.stringify(newData) &&
    JSON.stringify(newData) === before && JSON.stringify(newResult.ui) === JSON.stringify(newUi));
}

console.log('\n=== Özet ===');
console.log('Passed: '+passed+' / '+(passed+failed));
process.exit(failed ? 1 : 0);
