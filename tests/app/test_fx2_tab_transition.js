'use strict';

// FX2-15 — Sekme geçiş motoru fixture'ı.
// Gerçek App.go gövdesi ağsız, izole node:vm içinde çalışır; render() veya
// uygulama verisi yüklenmez. Sahte zamanlayıcı, transitionend yokluğunu ve
// hızlı ardışık isteklerde yalnız son hedefin commit edilmesini doğrular.

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');
const appSource = fs.readFileSync(path.join(repoRoot, 'app.js'), 'utf8');
// MON-26/MON-27/MON-28: motivation, crisis ve journal gövdeleri registry'lerinde; yüzey
// sayımları birleşik kaynakta yapılır (App handler adları app.js'te kalır).
const motivationSource = fs.readFileSync(path.join(repoRoot, 'app/core/motivation.js'), 'utf8');
const crisisSource = fs.readFileSync(path.join(repoRoot, 'app/core/crisis.js'), 'utf8');
const journalSource = fs.readFileSync(path.join(repoRoot, 'app/core/journal.js'), 'utf8');
const healthSource = fs.readFileSync(path.join(repoRoot, 'app/core/health.js'), 'utf8');
const combinedSource = appSource + motivationSource + crisisSource + journalSource + healthSource;
const cssSource = fs.readFileSync(path.join(repoRoot, 'app/styles.css'), 'utf8');
const goMatch = appSource.match(/App\.go=function\(id,event\)\{[\s\S]*?\n\};\n\n\/\/ ── REM-05/);

let passed = 0;
let failed = 0;
function group(name, condition, detail) {
  if (condition) { passed += 1; console.log(`PASS ${name}`); }
  else { failed += 1; console.log(`FAIL ${name}${detail ? ` — ${detail}` : ''}`); }
}

function classList() {
  const values = new Set();
  return {
    add(name) { values.add(name); }, remove(name) { values.delete(name); },
    contains(name) { return values.has(name); }
  };
}

function element() {
  const listeners = Object.create(null);
  return {
    classList: classList(),
    addEventListener(type, handler) { (listeners[type] || (listeners[type] = [])).push(handler); },
    removeEventListener(type, handler) { listeners[type] = (listeners[type] || []).filter((item) => item !== handler); },
    emit(type) { (listeners[type] || []).slice().forEach((handler) => handler({ type, target: this })); }
  };
}

function runtime(options) {
  const opts = options || {};
  const timers = new Map();
  let timerId = 0;
  const raf = [];
  let current = element();
  let renders = 0;
  let nudges = 0;
  let quranAdvances = 0;
  let enters = 0;
  const ui = { tab: 'bugun', aeonScrollBottom: false };
  const doc = {
    getElementById(id) { return id === 'app' ? current : null; },
    querySelector() { return { scrollTop: 71 }; }
  };
  const sandbox = {
    App: {}, ui, document: doc,
    window: { SeyFx: {
      isPremiumFxEnabled() { return opts.premium !== false; },
      enter() { enters += 1; }
    } },
    render() { renders += 1; current = element(); },
    tryLocNudge() { nudges += 1; },
    quranAdvanceVerseIndex() { quranAdvances += 1; },
    clearTimeout(id) { const item = timers.get(id); if (item) item.live = false; },
    setTimeout(fn, ms) { const id = ++timerId; timers.set(id, { fn, ms, live: true }); return id; },
    requestAnimationFrame(fn) { raf.push(fn); return raf.length; }
  };
  vm.runInNewContext(goMatch && goMatch[0].replace(/\n\n\/\/ ── REM-05[\s\S]*/, ''), sandbox, { filename: 'App.go (FX2-15)' });
  return {
    App: sandbox.App, ui, timers, get current() { return current; },
    get renders() { return renders; }, get nudges() { return nudges; },
    get quranAdvances() { return quranAdvances; }, get enters() { return enters; },
    fire(id) { const item = timers.get(id); if (item && item.live) item.fn(); },
    timerIds() { return [...timers.keys()]; },
    flushRaf() { while (raf.length) raf.shift()(); }
  };
}

group('FX2-15.1 App.go gövdesi bulunuyor', !!goMatch);
group('FX2-15.2 çıkış/giriş CSS token ve reduced-motion sözleşmesi var',
  /#app\.sey-leaving[\s\S]{0,220}var\(--dur-2\)[\s\S]{0,160}var\(--ease-in\)/.test(cssSource) &&
  /#app\.sey-entering\{opacity:0;transform:translateY\(-6px\);\}/.test(cssSource) &&
  /#app,#app\.sey-leaving,#app\.sey-entering[\s\S]{0,220}transition:none!important[\s\S]{0,120}opacity:1!important/.test(cssSource)
);

{
  const r = runtime();
  const outgoing = r.current;
  r.App.go('rapor');
  const timer = r.timerIds()[0];
  const exitsBeforeRender = r.renders === 0 && outgoing.classList.contains('sey-leaving') && r.timers.get(timer).ms === 200;
  outgoing.emit('transitionend');
  const entered = r.current.classList.contains('sey-entering');
  r.flushRaf();
  group('FX2-15.3 çıkış → transitionend → swap → giriş sırası',
    exitsBeforeRender && r.renders === 1 && r.ui.tab === 'rapor' && r.enters === 1 && entered && !r.current.classList.contains('sey-entering'));
}

{
  const r = runtime();
  r.App.go('saglik');
  const timer = r.timerIds()[0];
  r.fire(timer);
  group('FX2-15.4 200ms timeout ağı transitionend olmadan commit eder',
    r.renders === 1 && r.ui.tab === 'saglik' && r.App._goTimer === null && r.nudges === 1);
}

{
  const r = runtime();
  const outgoing = r.current;
  r.App.go('saglik');
  const firstTimer = r.timerIds()[0];
  r.App.go('saygi');
  const secondTimer = r.timerIds()[1];
  const firstCancelled = !r.timers.get(firstTimer).live;
  outgoing.emit('transitionend');
  const onlyLatestCommitted = r.renders === 1 && r.ui.tab === 'saygi';
  r.fire(firstTimer);
  r.fire(secondTimer);
  group('FX2-15.5 hızlı sekme değişimi eski timer ve transitionend işleyicisini iptal eder',
    firstCancelled && onlyLatestCommitted && r.renders === 1 && r.ui.tab === 'saygi' && r.quranAdvances === 1 && r.App._goTimer === null);
}

{
  const r = runtime({ premium: false });
  r.App.go('mesaj');
  group('FX2-15.6 premium kapalıyken eski senkron davranış korunur',
    r.renders === 1 && r.ui.tab === 'mesaj' && r.ui.aeonScrollBottom === true && r.timerIds().length === 0 && r.enters === 1);
}

const handlers = new Set((appSource.match(/App\.[A-Za-z0-9_]+\s*=[^=]/g) || []).map((value) => value.match(/App\.[A-Za-z0-9_]+/)[0]));
group('FX2-15.7 App yüzeyi 718, onclick 391 ve render/paint gövdeleri değişmedi',
  handlers.size === 718 && (combinedSource.match(/onclick=/g) || []).length === 391 &&
  !/function render\(\)[\s\S]{0,180}sey-leaving/.test(appSource) &&
  !/function paint\(\)[\s\S]{0,180}sey-leaving/.test(appSource));

console.log(`Passed: ${passed} / ${passed + failed}`);
process.exit(failed ? 1 : 0);
