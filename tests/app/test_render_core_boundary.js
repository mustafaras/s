// MON-49 — modal/render core registry boundary.
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
const indexSource = read('index.html');

let passed = 0;
function ok(name, condition) {
  assert.equal(condition, true, name);
  passed += 1;
  console.log('PASS  ' + name);
}

function between(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  assert(start >= 0 && end > start, startMarker + ' kaynak bölümü bulunamadı');
  return source.slice(start, end);
}

console.log('== MON-49 modal/render core registry boundary ==\n');

const coldSandbox = { window: {} };
vm.runInNewContext(renderSource, coldSandbox, { filename: 'app/core/render.js#cold' });
const cold = coldSandbox.window.SeymaRender;
ok('cold load exposes modal and render registry members',
  cold && typeof cold.modalsHTML === 'function' && typeof cold.render === 'function');
ok('cold load opens no DOM/storage/network side effect', Object.keys(coldSandbox.window).length === 1);

const depBlock = renderSource.match(/var RENDER_DEPENDENCIES=\[([\s\S]*?)\]/);
assert.ok(depBlock, 'render dependency manifest exists');
const dependencyNames = [...depBlock[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
const deps = {};
dependencyNames.forEach((name) => { deps[name] = () => ''; });

const data = { days: {}, settings: { profileAssessmentInactive: true, voiceLang: 'tr-TR' } };
const ui = { tab: 'saglik', forceStart: false };
const state = {
  lastRenderTab: null,
  lastOverlay: null,
  lastOverlayView: null,
  lastHeaderShown: false,
  lastRoomOpen: false,
  lastCrisisKind: null,
};
const calls = [];
let appHTML = '';
const root = {
  setAttribute(name, value) { this[name] = value; },
  classList: { add(name) { calls.push('root.classList.add:' + name); } },
};
const app = {};
Object.defineProperty(app, 'innerHTML', {
  get() { return appHTML; },
  set(value) { calls.push('app.innerHTML'); appHTML = value; },
});
const documentStub = {
  getElementById(id) { return id === 'root' ? root : id === 'app' ? app : null; },
  querySelector() { return null; },
};

Object.assign(deps, {
  data: () => data,
  ui: () => ui,
  dark: () => false,
  editing: () => false,
  needsAuth: () => false,
  locationGateRequired: () => false,
  ensureProfileAssessment: () => ({ status: 'completed' }),
  renderState: () => state,
  paintAmbientShell: () => calls.push('paintAmbientShell'),
  appHeaderMeta: () => ({
    accent: '#3A4048', accent2: '#A4824C', ink: '#2D2A27',
    kicker: 'sentetik', title: 'Şeyma', sub: 'MON-49', icon: 'hexagon', action: null,
  }),
  headerSkyClassNow: () => 'sey-hdr-sky sky-time-day',
  saveButtonHTML: () => '<button id="sey-header-save">eşitle</button>',
  headerActionHTML: () => '',
  headerSceneHTML: () => '<div class="sey-hdr-scene"></div>',
  icon: () => '',
  esc: (value) => String(value == null ? '' : value),
  healthTabHTML: () => '<main data-render-tab="saglik">Sağlık</main>',
  unreadNotifCount: () => 0,
  featuresLive: () => false,
  navHTML: undefined,
  reminderCenterOverlayHTML: () => '<div id="sey-reminder-overlay" role="dialog" aria-modal="true" tabindex="-1">hatırlatma</div>',
});

delete deps.navHTML;
const registered = cold.registerRender(deps);
ok('complete dependency bag registers once', registered === true);
ok('second registry registration is rejected', cold.registerRender(deps) === false);
coldSandbox.document = documentStub;

const modal = cold.modalsHTML();
ok('modal registry keeps the inactive path empty', modal === '');
ui.reminderCenterOpen = true;
const reminderModal = cold.modalsHTML();
ok('modal registry delegates the overlay entry and preserves dialog semantics',
  /id="sey-reminder-overlay"/.test(reminderModal) && /role="dialog"/.test(reminderModal) && /aria-modal="true"/.test(reminderModal));

ui.reminderCenterOpen = false;
cold.render();
ok('render paints ambient shell before the first app DOM write',
  calls.indexOf('paintAmbientShell') >= 0 && calls.indexOf('paintAmbientShell') < calls.indexOf('app.innerHTML'));
ok('render updates the root theme through the registry path', root['data-theme'] === 'light');
ok('render preserves the health tab output and app innerHTML update',
  appHTML.includes('data-render-tab="saglik"') && appHTML.includes('class="sey-bottomnav"'));
ok('render state records the completed render without recursion',
  state.lastRenderTab === 'saglik' && state.lastHeaderShown === true && calls.filter((item) => item === 'app.innerHTML').length === 1);

const renderBody = between(renderSource, 'function render(){', '\n  function appHeaderHTML(){');
const appRenderArea = between(appSource, 'function render(){', '\n\n// MON-44: onboarding');
const modalBody = between(renderSource, 'function modalsHTML(){', '\n\nfunction render(){');
const appModalArea = between(appSource, 'function modalsHTML(){', '\n\n// boot');
const themeBody = between(appSource, 'function paintAmbientShell(){', 'function render(){');

ok('app.js keeps signature-preserving modals/render shims',
  /function render\(\)\{ var result=SEYMA_RENDER\.render\.apply\(null,arguments\); if\(ui\.kaoOpen\) window\.SeymaQuranLearn\.kaoMount\(\); return result; \}/.test(appRenderArea) &&
  /function modalsHTML\(\)\{ return SEYMA_RENDER\.modalsHTML\.apply\(null,arguments\); \}/.test(appModalArea));
ok('render and modal bodies have one canonical owner',
  (appSource.match(/function render\(\)/g) || []).length === 1 &&
  (renderSource.match(/function render\(\)/g) || []).length === 1 &&
  (appSource.match(/function modalsHTML\(\)/g) || []).length === 1 &&
  (renderSource.match(/function modalsHTML\(\)/g) || []).length === 1 &&
  renderBody.includes('app.innerHTML=html;') && !appRenderArea.includes('app.innerHTML=html;') &&
  modalBody.includes('reminderCenterOverlayHTML()') && !appModalArea.includes('reminderCenterOverlayHTML()'));
ok('render call graph keeps ambient, nav, modal and DOM order',
  renderBody.indexOf('paintAmbientShell();') < renderBody.indexOf('if(needsAuth())') &&
  renderBody.indexOf('html+=navHTML();') < renderBody.indexOf('html+=modalsHTML();') &&
  renderBody.indexOf('html+=modalsHTML();') < renderBody.indexOf('app.innerHTML=html;'));
ok('render state accessors keep every ephemeral writer app-owned',
  ['lastRenderTab', 'lastOverlay', 'lastOverlayView', 'lastHeaderShown', 'lastRoomOpen', 'lastCrisisKind']
    .every((name) => appSource.includes(name + ':{get:function(){ return ' + name + '; }')));
ok('SeyTimeTheme guard and guarded call order remain unchanged',
  /window\.SeyTimeTheme && typeof window\.SeyTimeTheme\.apply==='function'[\s\S]*?window\.SeyTimeTheme\.apply\(\)/.test(themeBody) &&
  /window\.SeyAmbience && typeof window\.SeyAmbience\.apply==='function'[\s\S]*?window\.SeyAmbience\.apply\(\)/.test(themeBody) &&
  /applySeasonal==='function'[\s\S]*?window\.SeyTimeTheme\.applySeasonal\(\)/.test(themeBody) &&
  themeBody.indexOf('window.SeyTimeTheme.apply();') < themeBody.indexOf('window.SeyAmbience.apply();') &&
  themeBody.indexOf('window.SeyAmbience.apply();') < themeBody.indexOf('window.SeyTimeTheme.applySeasonal();'));
ok('render cache-bust remains explicit after the registry move', /app\/core\/render\.js\?v=\d+[a-z]/.test(indexSource));

console.log('\nMON-49 modal/render core boundary: ' + passed + '/' + passed + ' passed');
