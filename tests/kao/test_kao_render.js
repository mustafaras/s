'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');

const relative = 'app/core/quranLearn.js';
const source = fs.readFileSync(path.join(repoRoot, relative), 'utf8');
const appSource = fs.readFileSync(path.join(repoRoot, 'app.js'), 'utf8');
const settingsSource = fs.readFileSync(path.join(repoRoot, 'app/core/settings.js'), 'utf8');
const cssSource = fs.readFileSync(path.join(repoRoot, 'app/kao.css'), 'utf8');
const indexSource = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');

const sandbox = { window: {}, Date, Math, Number, String, Object, Array, JSON };
vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: relative });
const api = sandbox.window.SeymaQuranLearn;

const quranLearn = {
  settings: { dailyNew: 10 }, cards: {}, units: {}, surahs: {}, daily: {},
  milestones: { fatiha: null, namaz: null, half: null, twoThirds: null, eighty: null, shortSurahs: null },
  ayahs: { understood: [] }
};
const ui = { kaoOpen: false, kaoView: 'home', kaoReturnFocusId: '' };
let rendered = 0;
assert.equal(api.registerQuranLearn({
  data() { return { quranLearn, settings: { targetBed: '23:00' } }; },
  ui() { return ui; }, save() {}, render() { rendered += 1; },
  todayStr() { return '2026-09-24'; }, esc(value) { return String(value); },
  icon(name) { return `<i>${name}</i>`; }, getDay() { return {}; }
}), true);

let locked = 0;
let unlocked = 0;
let focused = '';
let restored = '';
let mounted = '';
let closeBody = null;
assert.equal(api.registerQuranLearnSurface({
  lockBody() { locked += 1; }, unlockBody() { unlocked += 1; },
  focusDialog(id) { focused = id; }, activeElementId() { return 'kao-settings-entry'; },
  restoreFocus(id) { restored = id; },
  sheetClose(card, back, body) { assert.equal(card, 'sey-ov-card'); assert.equal(back, 'sey-ov-back'); closeBody = body; },
  mount(html) { mounted = html; }
}), true);
assert.equal(api.registerCaffeineTargetBed(() => '23:00'), true);

api.kaoOpen();
assert.equal(ui.kaoOpen, true);
assert.equal(ui.kaoView, 'home');
assert.equal(ui.kaoReturnFocusId, 'kao-settings-entry');
assert.equal(locked, 1);
assert.equal(focused, 'sey-ov-card');
assert.equal(rendered, 1);

const html = api.kaoOverlayHTML(new Date('2026-09-24T22:15:00'));
assert.match(html, /id="sey-ov-back"/);
assert.match(html, /id="sey-ov-card"[^>]*role="dialog"[^>]*aria-modal="true"[^>]*tabindex="-1"/);
assert.match(html, /onkeydown="App\.onModalKeydown\(event,App\.kaoClose\)"/);
assert.match(html, /onclick="App\.kaoClose\(\)"/);
assert.match(html, /Kapsam/i);
assert.match(html, /anlaş/iu);
assert.match(html, /10 yeni/);
assert.match(html, /Gece tekrarı/);
assert.match(html, /App\.kaoSetView\('session'\)/);
assert.doesNotMatch(html, /lang="ar"|dir="rtl"/);

api.kaoMount(new Date('2026-09-24T22:15:00'));
assert.equal(mounted, html);
api.kaoSetView('home');
assert.equal(ui.kaoView, 'home');
assert.equal(rendered, 2);
api.kaoClose();
assert.equal(typeof closeBody, 'function');
closeBody();
assert.equal(ui.kaoOpen, false);
assert.equal(unlocked, 1);
assert.equal(restored, 'kao-settings-entry');

assert.match(appSource, /App\.kaoOpen=function\(view\)\{ return window\.SeymaQuranLearn\.kaoOpen\.apply\(null,arguments\); \};/);
assert.match(appSource, /App\.kaoClose=function\(\)\{ return window\.SeymaQuranLearn\.kaoClose\.apply\(null,arguments\); \};/);
assert.match(appSource, /App\.kaoSetView=function\(v\)\{ return window\.SeymaQuranLearn\.kaoSetView\.apply\(null,arguments\); \};/);
assert.match(settingsSource, /id="kao-settings-entry"[^>]*onclick="App\.kaoOpen\(\)"/);
assert.match(indexSource, /app\/kao\.css\?v=\d{8}[a-z]/);
assert.doesNotMatch(cssSource, /:root\s*\{/);
assert.doesNotMatch(cssSource, /#[0-9a-f]{3,8}\b/i);
const cssVars = [...cssSource.matchAll(/var\((--[a-z0-9-]+)/gi)].map((match) => match[1]);
assert.ok(cssVars.length > 0 && cssVars.every((name) => /^--(?:quran|faith|f-|dur-)/.test(name)), 'KAO CSS yalnız izinli token ailelerini tüketmeli');

const selectorStart = appSource.indexOf('var MODAL_FOCUS_SELECTOR=');
const handlerEnd = appSource.indexOf('\nApp.onReminderKeydown=', selectorStart);
assert.ok(selectorStart >= 0 && handlerEnd > selectorStart, 'ortak modal klavye gövdesi bulunmalı');
const first = { disabled: false, hidden: false, getAttribute() { return null; }, focus() { doc.activeElement = first; } };
const last = { disabled: false, hidden: false, getAttribute() { return null; }, focus() { doc.activeElement = last; } };
const dialog = { querySelectorAll() { return [first, last]; } };
const doc = { activeElement: last };
const keySandbox = { App: {}, document: doc };
vm.createContext(keySandbox);
vm.runInContext(appSource.slice(selectorStart, handlerEnd), keySandbox);
let prevented = 0;
let stopped = 0;
let escaped = 0;
keySandbox.App.onModalKeydown({ key: 'Tab', currentTarget: dialog, shiftKey: false, preventDefault() { prevented += 1; }, stopPropagation() { stopped += 1; } }, () => {});
assert.equal(doc.activeElement, first, 'Tab son öğeden ilk öğeye dönmeli');
doc.activeElement = first;
keySandbox.App.onModalKeydown({ key: 'Tab', currentTarget: dialog, shiftKey: true, preventDefault() { prevented += 1; }, stopPropagation() { stopped += 1; } }, () => {});
assert.equal(doc.activeElement, last, 'Shift+Tab ilk öğeden son öğeye dönmeli');
keySandbox.App.onModalKeydown({ key: 'Escape', currentTarget: dialog, preventDefault() { prevented += 1; }, stopPropagation() { stopped += 1; } }, () => { escaped += 1; });
assert.equal(escaped, 1, 'Escape kapatma callbackini çalıştırmalı');
assert.ok(prevented >= 3 && stopped >= 3);

console.log('KAO render: PASS (dialog/aria, E1, Tab/Shift+Tab/Escape, focus return, CSS/settings wiring)');
