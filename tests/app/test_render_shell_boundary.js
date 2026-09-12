// MON-48 — header/nav/overlay shell registry boundary.
// Synthetic, network-free fixture: no app boot, browser, localStorage or data.

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

function read(rel) {
  return fs.readFileSync(path.join(repoRoot, rel), 'utf8');
}

const renderSource = read('app/core/render.js');
const appSource = read('app.js');
const cssSource = read('app/styles.css');
const indexSource = read('index.html');

let passed = 0;
function ok(name, condition) {
  assert.equal(condition, true, name);
  passed += 1;
  console.log('PASS  ' + name);
}

console.log('== MON-48 render header/nav/overlay shell boundary ==\n');

const coldSandbox = { window: {} };
vm.runInNewContext(renderSource, coldSandbox, { filename: 'app/core/render.js#cold' });
const cold = coldSandbox.window.SeymaRender;
ok('cold load exposes header/nav/overlay registry members',
  cold && typeof cold.appHeaderHTML === 'function' && typeof cold.navHTML === 'function' &&
  typeof cold.overlayShell === 'function' && typeof cold.soulOverlayShell === 'function');
ok('cold load opens no DOM/storage/network side effect', Object.keys(coldSandbox.window).length === 1);

const depBlock = renderSource.match(/var RENDER_DEPENDENCIES=\[([\s\S]*?)\]/);
assert.ok(depBlock, 'render dependency manifest exists');
const dependencyNames = [...depBlock[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
const deps = {};
dependencyNames.forEach((name) => { deps[name] = () => ''; });

const data = { days: { '2026-09-12': {} }, settings: { premiumAtmosphere: true } };
const ui = { tab: 'mesaj' };
let overlayArgs = null;
let soulOverlayArgs = null;
Object.assign(deps, {
  data: () => data,
  ui: () => ui,
  dark: () => false,
  todayStr: () => '2026-09-12',
  dayIndexFor: () => 0,
  getDay: () => ({}),
  ensurePrayerDay: () => ({ performed: 6 }),
  prayerDaySummary: () => ({ performed: 6 }),
  zikrDayCompleted: () => true,
  icon: (name, size) => '<i data-icon="' + name + ':' + (size || 20) + '"></i>',
  esc: (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char])),
  appHeaderMeta: () => ({
    accent: '#3A4048', accent2: '#A4824C', ink: '#2D2A27',
    kicker: 'Sohbet merkezi', title: 'ÆON', sub: 'sentetik', icon: 'hexagon', action: null,
  }),
  headerSkyClassNow: () => 'sey-hdr-sky sky-time-day sky-wx-clear',
  saveButtonHTML: () => '<button id="sey-header-save" aria-label="Panel ile şimdi eşitle">eşitle</button>',
  headerActionHTML: () => '',
  headerSceneHTML: () => '<div class="sey-hdr-scene" aria-hidden="false"></div>',
  unreadNotifCount: () => 12,
  featuresLive: () => true,
  saygiCurrentPerson: () => ({ id: 'person-1' }),
  saygiHasRead: () => false,
  overlayShellEntryHTML: (...args) => {
    overlayArgs = args;
    return '<div id="sey-ov-back"><div id="sey-ov-card" role="dialog" aria-modal="true" tabindex="-1">overlay</div></div>';
  },
  soulOverlayShellEntryHTML: (...args) => {
    soulOverlayArgs = args;
    return '<div id="sey-ov-back"><div id="sey-ov-card" role="dialog" aria-modal="true" tabindex="-1">soul</div></div>';
  },
});

ok('complete dependency bag registers once', cold.registerRender(deps) === true);
ok('second registry registration is rejected', cold.registerRender(deps) === false);

const header = cold.appHeaderHTML();
ok('header preserves brand navigation semantics',
  /<header id="sey-appheader"/.test(header) &&
  /onclick="App\.go\('bugun'\)" aria-label="Bugüne git"/.test(header));
ok('header preserves save state surface',
  /id="sey-header-save"/.test(header) && /aria-label="Panel ile şimdi eşitle"/.test(header));
ok('header preserves live sky scene host',
  /sey-hdr-sky sky-time-day sky-wx-clear/.test(header) && /sey-hdr-scene/.test(header));

const nav = cold.navHTML();
const navItems = nav.match(/class="sey-bottomnav-item/g) || [];
ok('nav keeps its named landmark and seven items',
  /<nav class="sey-bottomnav" aria-label="Ana gezinme"/.test(nav) && navItems.length === 7);
ok('nav preserves all labels and active page state',
  ['Bugün', 'Sağlık', 'Aeon', 'İlham·İbadet', 'Takvim', 'Rapor', 'Ayarlar'].every((label) => nav.includes('aria-label="' + label + '"')) &&
  /aria-label="Aeon" aria-current="page"/.test(nav));
ok('nav preserves unread and Saygı badges',
  /sey-bottomnav-badge">9\+<\/span>/.test(nav) && /sey-bottomnav-badge saygi">1<\/span>/.test(nav));

const overlay = cold.overlayShell('App.closeReading()', 'head', 'body', null, true, 'Okuma günlüğü');
const soulOverlay = cold.soulOverlayShell('App.closeSoulActivity()', 'head', 'body', null, false, 'Pratik');
ok('render overlay shell delegates exact arguments',
  JSON.stringify(overlayArgs) === JSON.stringify(['App.closeReading()', 'head', 'body', null, true, 'Okuma günlüğü']));
ok('render soul overlay shell delegates exact arguments',
  JSON.stringify(soulOverlayArgs) === JSON.stringify(['App.closeSoulActivity()', 'head', 'body', null, false, 'Pratik']));
ok('overlay shell output remains dialog/focusable',
  /role="dialog"/.test(overlay) && /aria-modal="true"/.test(overlay) && /tabindex="-1"/.test(overlay) &&
  /role="dialog"/.test(soulOverlay) && /aria-modal="true"/.test(soulOverlay));

ok('app.js keeps signature-preserving render shims',
  /function appHeaderHTML\(\)\{ return SEYMA_RENDER\.appHeaderHTML\.apply\(null,arguments\); \}/.test(appSource) &&
  /function navHTML\(\)\{ return SEYMA_RENDER\.navHTML\.apply\(null,arguments\); \}/.test(appSource) &&
  /function overlayShell\(\)\{ return SEYMA_RENDER\.overlayShell\.apply\(null,arguments\); \}/.test(appSource) &&
  /function soulOverlayShell\(\)\{ return SEYMA_RENDER\.soulOverlayShell\.apply\(null,arguments\); \}/.test(appSource));
ok('header/nav bodies are no longer duplicated in app.js',
  !appSource.includes('function appHeaderHTML(){\n  var m=appHeaderMeta();') &&
  !appSource.includes('function navHTML(){\n  // Alt bar'));
ok('MON-48 registry exposes every requested member',
  /appHeaderHTML:appHeaderHTML/.test(renderSource) && /navHTML:navHTML/.test(renderSource) &&
  /overlayShell:overlayShellEntryHTML/.test(renderSource));

const navRule = cssSource.match(/\.sey-bottomnav-item\{[^}]+\}/);
ok('nav touch target remains at least 44px', navRule && /min-height:53px/.test(navRule[0]));
ok('nav keyboard focus and reduced-motion rules remain present',
  /\.sey-bottomnav-item:focus-visible\{/.test(cssSource) &&
  /@media \(prefers-reduced-motion: reduce\)\{[^}]*\.sey-bottomnav-item/.test(cssSource));
ok('render cache-bust remains explicit', /app\/core\/render\.js\?v=\d+[a-z]/.test(indexSource));

console.log('\nMON-48 render shell boundary: ' + passed + '/' + passed + ' passed');
