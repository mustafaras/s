'use strict';

// FX2-16 — Overlay giriş/çıkış hareketi fixture'ı.
// Gerçek SeyFx yardımcı fonksiyonu ağsız node:vm içinde çalıştırılır; timer,
// animationend ve reduced-motion yolları uygulama verisine dokunmadan ölçülür.

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const repoRoot = require('../repo-root');
const appSource = fs.readFileSync(path.join(repoRoot, 'app.js'), 'utf8');
// MON-26/MON-27/MON-28/MON-36/MON-42: domain görünüm gövdeleri ilgili registry'lere taşındı;
// sheetClose/onclick/App yüzey sayımları birleşik kaynakta yapılır.
const motivationSource = fs.readFileSync(path.join(repoRoot, 'app/core/motivation.js'), 'utf8');
const crisisSource = fs.readFileSync(path.join(repoRoot, 'app/core/crisis.js'), 'utf8');
const journalSource = fs.readFileSync(path.join(repoRoot, 'app/core/journal.js'), 'utf8');
const healthSource = fs.readFileSync(path.join(repoRoot, 'app/core/health.js'), 'utf8');
const librarySource = fs.readFileSync(path.join(repoRoot, 'app/core/library.js'), 'utf8');
const reportSource = fs.readFileSync(path.join(repoRoot, 'app/core/report.js'), 'utf8');
const mapSource = fs.readFileSync(path.join(repoRoot, 'app/core/map.js'), 'utf8');
const profileSource = fs.readFileSync(path.join(repoRoot, 'app/core/profile.js'), 'utf8');
const settingsSource = fs.readFileSync(path.join(repoRoot, 'app/core/settings.js'), 'utf8');
const quranLearnSource = fs.readFileSync(path.join(repoRoot, 'app/core/quranLearn.js'), 'utf8');
const quranLearnHubSource = quranLearnSource.slice(quranLearnSource.indexOf('function kaoHubCardHTML'), quranLearnSource.indexOf('function kaoOverlayHTML'));
const messagingSource = fs.readFileSync(path.join(repoRoot, 'app/core/messaging.js'), 'utf8');
const renderSource = fs.readFileSync(path.join(repoRoot, 'app/core/render.js'), 'utf8');
// MON2-02: app.js'ten reminders.js/reminderSurface.js'e taşınan gövdeler de
// combinedSource'a girer — onclick/handler pin'leri gövdeyi izler (K8 ilkesi).
const remindersSource = fs.readFileSync(path.join(repoRoot, 'app/core/reminders.js'), 'utf8');
const reminderSurfaceSource = fs.readFileSync(path.join(repoRoot, 'app/core/reminderSurface.js'), 'utf8');
// MON2-06 (K8 ilkesi: pin gövdeyi izler): zikir/kuran kapatma sarmalayıcıları
// app/core/zikir.js ve app/core/quran.js yüzey bölümlerine taşındı. Bu iki
// dosya yalnız closeX sarmalayıcı aramasında kullanılır — combinedSource'a
// EKLENMEZ, çünkü onclick=391 pini bu dosyalar hariç ölçülmüştür (zikir/kuran
// görünüm gövdeleri kendi onclick metinlerini zaten taşır).
const zikirSource = fs.readFileSync(path.join(repoRoot, 'app/core/zikir.js'), 'utf8');
const quranSource = fs.readFileSync(path.join(repoRoot, 'app/core/quran.js'), 'utf8');
// MON2-07 (K8 ilkesi: pin gövdeyi izler): aeon/location/header/habit/hero
// gövdeleri app/core/appSurface.js alan yüzey bölümüne taşındı; onclick/App
// yüzey sayımı birleşik kaynakta yapılır (appSurface.js'te onclick taşımaz).
const appSurfaceFieldSource = fs.readFileSync(path.join(repoRoot, 'app/core/appSurface.js'), 'utf8');
const combinedSource = appSource + motivationSource + crisisSource + journalSource + healthSource + librarySource + reportSource + mapSource + profileSource + settingsSource + quranLearnHubSource + messagingSource + renderSource + remindersSource + reminderSurfaceSource + appSurfaceFieldSource;
const cssSource = fs.readFileSync(path.join(repoRoot, 'app/styles.css'), 'utf8');
const mediaSource = fs.readFileSync(path.join(repoRoot, 'app/core/mediaFx.js'), 'utf8');

let passed = 0;
let failed = 0;
function group(name, condition, detail) {
  if (condition) { passed += 1; console.log(`PASS ${name}`); }
  else { failed += 1; console.log(`FAIL ${name}${detail ? ` — ${detail}` : ''}`); }
}

function element() {
  const values = new Set();
  const listeners = Object.create(null);
  return {
    classList: { add(name) { values.add(name); }, contains(name) { return values.has(name); } },
    addEventListener(type, handler) { (listeners[type] || (listeners[type] = [])).push(handler); },
    removeEventListener(type, handler) { listeners[type] = (listeners[type] || []).filter((item) => item !== handler); },
    emit(type, target) { (listeners[type] || []).slice().forEach((handler) => handler({ type, target: target || this })); },
    listenerCount(type) { return (listeners[type] || []).length; }
  };
}

function runtime(options) {
  const opts = options || {};
  const card = element();
  const back = element();
  const timers = [];
  const document = {
    hidden: false,
    getElementById(id) { return id === 'card' ? card : id === 'back' ? back : null; },
    addEventListener() {}, querySelectorAll() { return []; }, querySelector() { return null; },
    createElement() { return element(); }
  };
  const win = {
    SeymaState: { data: { settings: { premiumAtmosphere: opts.premium !== false } } },
    matchMedia() { return { matches: !!opts.reduced }; },
    addEventListener() {}, requestAnimationFrame() {}, setTimeout(fn, ms) { timers.push({ fn, ms }); return timers.length; }, clearTimeout() {}
  };
  const sandbox = {
    window: win, document, navigator: { vibrate() { return true; } },
    setTimeout: win.setTimeout, clearTimeout: win.clearTimeout, requestAnimationFrame: win.requestAnimationFrame,
    Date, Math, Number, String, Object, Array, JSON,
    getComputedStyle() { return { position: 'relative' }; }
  };
  vm.runInNewContext(mediaSource, sandbox, { filename: 'mediaFx.js (FX2-16)', timeout: 5000 });
  return { card, back, timers, fx: win.SeyFx };
}

const wrappers = [
  ['closeReading', 'sey-ov-card', 'sey-ov-back'], ['closeWatching', 'sey-ov-card', 'sey-ov-back'],
  ['closeListening', 'sey-ov-card', 'sey-ov-back'], ['closeZikr', 'zikr-screen', 'zikr-overlay'],
  ['closeQibla', 'qibla-dialog', 'qibla-overlay'], ['closeFaithCorner', 'sey-ov-card', 'sey-ov-back'],
  ['closeQuranJourney', 'quran-screen', 'quran-overlay'], ['closeSaygiPerson', 'sey-ov-card', 'sey-ov-back'],
  ['closeSoulArchive', 'sey-ov-card', 'sey-ov-back'], ['closeSoulActivity', 'sey-ov-card', 'sey-ov-back'],
  ['closeLearning', 'sey-ov-card', 'sey-ov-back'], ['closeReminderCenter', 'sey-reminder-screen', 'sey-reminder-overlay']
];

group('FX2-16.1 12 hedef closeX sarmalayıcısı doğru yüzey kimliğine bağlı', wrappers.every(([name, card, back]) => {
  // K8 (MON2-03): reminder closeX gövdeleri reminderSurface.js'e taşındı —
  // sarmalayıcı gövdeyi appSource'ta, yoksa reminderSurfaceSource'ta ara.
  // K8 (MON2-03): modüle taşınan sarmalayıcı `function App_x(){...}` biçimindedir
  // (App_ öneki + registry üyesi) — sheetClose guard'lı window.SeyFx.sheetClose olur.
  let start = appSource.indexOf(`App.${name}=function`);
  let source = appSource;
  let end = start < 0 ? -1 : source.indexOf('\nApp.', start + 1);
  let body = source.slice(start, end < 0 ? source.length : end);
  if (start < 0 || !/var body=function\(\)/.test(body)) {
    // K8 (MON2-03/MON2-06): modüle taşınan sarmalayıcı `function App_x(){...}`
    // biçimindedir (App_ öneki + registry üyesi). Önce reminderSurface, sonra
    // MON2-06'nın alan registry'leri (zikir/quran/profile) denenir.
    const movedSources = [reminderSurfaceSource, zikirSource, quranSource, profileSource];
    for (const candidate of movedSources) {
      const at = candidate.indexOf(`function App_${name}(){`);
      if (at < 0) continue;
      const stop = candidate.indexOf('\nfunction ', at + 1);
      const slice = candidate.slice(at, stop < 0 ? candidate.length : stop);
      if (/var body=function\(\)/.test(slice) && slice.includes(`sheetClose('${card}','${back}',body)`)) {
        return true;
      }
    }
    return false;
  }
  return start >= 0 && /var body=function\(\)/.test(body) && body.includes(`sheetClose('${card}','${back}',body)`);
}));

group('FX2-16.2 M6 çağrı sayısı en az 10, App/onClick yüzeyi değişmez',
  (combinedSource.match(/\bsheetClose\s*\(/g) || []).length >= 10 &&
  // IIP-10 / DEC-07: öncü araması TEK dispatcher handler ekledi (App.saygiLens).
  // 718 → 719 artışı tam olarak bu addır; onclick=391 değişmedi.
  // IIP-11: App.saygiReader tek dispatcher handler'ı eklendi; 719 → 720.
  // KAO-16 okuyucu yüzeyi üç handler ekledi; güncel pin 734 / 392. KAO-17 E7 ayarları sekiz handler ekledi: 742. KAO-26 stüdyosu iki handler: 744. KAO-27 gölgeleme beş handler: 749.
  new Set((combinedSource.match(/App\.[A-Za-z0-9_]+\s*=[^=]/g) || []).map((item) => item.match(/App\.[A-Za-z0-9_]+/)[0])).size === 749 &&
  (combinedSource.match(/onclick=/g) || []).length === 392
);

group('FX2-16.3 sheet-in/out/backdrop CSS tokenleri ve reduce-motion koruması var',
  /#sey-ov-card,#zikr-screen,#quran-screen,#qibla-dialog,#sey-reminder-screen[\s\S]{0,160}animation:sey-sheet-in/.test(cssSource) &&
  /\.sey-sheet-out\{[\s\S]{0,120}var\(--dur-3\)[\s\S]{0,100}var\(--ease-in\)/.test(cssSource) &&
  /\.sey-sheet-in,\.sey-sheet-out,\.sey-backdrop-out,[\s\S]{0,220}animation:none!important/.test(cssSource)
);

{
  const r = runtime(); let done = 0;
  r.fx.sheetClose('card', 'back', () => { done += 1; });
  const armed = r.card.classList.contains('sey-sheet-out') && r.back.classList.contains('sey-backdrop-out') && r.timers.length === 1 && r.timers[0].ms === 260;
  r.card.emit('animationend', element());
  const childIgnored = done === 0 && r.card.listenerCount('animationend') === 1;
  r.card.emit('animationend'); r.timers[0].fn();
  group('FX2-16.4 animationend karttan gelince tamamlar; child olayı ve timeout çift çalıştırmaz', armed && childIgnored && done === 1 && r.card.listenerCount('animationend') === 0);
}

{
  const r = runtime(); let done = 0;
  r.fx.sheetClose('card', 'back', () => { done += 1; });
  r.timers[0].fn(); r.timers[0].fn(); r.card.emit('animationend');
  group('FX2-16.5 260ms timeout ağı animationend yokluğunda akışı bir kez sürdürür', done === 1);
}

{
  const off = runtime({ premium: false }); const reduced = runtime({ reduced: true });
  let offDone = 0; let reducedDone = 0;
  off.fx.sheetClose('card', 'back', () => { offDone += 1; });
  reduced.fx.sheetClose('card', 'back', () => { reducedDone += 1; });
  group('FX2-16.6 premium kapalı veya reduced-motion iken anlık eski davranış',
    offDone === 1 && reducedDone === 1 && off.timers.length === 0 && reduced.timers.length === 0 &&
    !off.card.classList.contains('sey-sheet-out') && !reduced.card.classList.contains('sey-sheet-out'));
}

{
  const r = runtime(); let first = 0; let second = 0;
  r.fx.sheetClose('card', 'back', () => { first += 1; });
  r.fx.sheetClose('card', 'back', () => { second += 1; });
  r.card.emit('animationend');
  group('FX2-16.7 çift kapatma isteği eski gövdeyi ikinci kez yürütmez', first === 1 && second === 0 && r.timers.length === 1);
}

console.log(`Passed: ${passed} / ${passed + failed}`);
process.exit(failed ? 1 : 0);
