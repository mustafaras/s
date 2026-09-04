// Faz -1 — Modülerleştirme sınır testi
// app.js bölünmeden önce yeni app/core/*.js modüllerinin varlığını,
// index.html yükleme sırasını ve App.* yüzeyinin bozulmamasını doğrular.
// Gerçek network çağrısı yok; sadece dosya sistemi ve light parsing.
// Çalıştırma: node tests/app/test_modularization_boundary.js

'use strict';
var fs = require('fs');
var path = require('path');
var repoRoot = require('../repo-root');

var passed = 0, failed = 0;
function ok(name, cond, detail){
  if (cond) { passed++; console.log('  ✓ '+name); }
  else { failed++; console.log('  ✗ '+name + (detail ? ' — '+detail : '')); }
}

console.log('\n=== Faz -1 — Modülerleştirme Sınır Testleri ===\n');

// [0] FX-P-04: yeni Faz -1.1 modülleri expose edilmiş ve app.js hâlâ yüklü
(function(){
  var expectedLoaded = [
    'app/core/dateUtils.js',
    'app/core/state.js',
    'app/core/helpers.js',
    'app/core/prayer.js',
    'app/core/mediaFx.js',
    'app/core/timeTheme.js'
  ];
  var html = fs.readFileSync(path.join(repoRoot,'index.html'),'utf8');
  expectedLoaded.forEach(function(m){
    var idx = html.indexOf('src="'+m);
    ok(m + ' index.html\'de yüklü (cache-busting dahil)', idx >= 0);
    var appIdx = html.indexOf('src="app.js');
    ok(m + ' app.js\'den önce yükleniyor', idx < appIdx);
  });
})();

// [1] app.js hâlâ var ve büyük monolit
(function(){
  var appPath = path.join(repoRoot,'app.js');
  ok('app.js mevcut', fs.existsSync(appPath));
  var lines = fs.readFileSync(appPath,'utf8').split(/\r?\n/);
  ok('app.js 18.000+ satır (monolit hâlâ var)', lines.length > 18000,
    'satır: '+lines.length);
})();

// [2] app/core/constants.js zaten var
(function(){
  var p = path.join(repoRoot,'app/core/constants.js');
  ok('app/core/constants.js mevcut', fs.existsSync(p));
})();

// [3] index.html yükleme sırası: constants.js önce, app.js en sonra
(function(){
  var html = fs.readFileSync(path.join(repoRoot,'index.html'),'utf8');
  var constIdx = html.indexOf('src="app/core/constants.js');
  var appIdx = html.indexOf('src="app.js');
  ok('index.html app/core/constants.js yüklü', constIdx >= 0);
  ok('index.html app.js yüklü', appIdx >= 0);
  ok('constants.js app.js\'den önce yükleniyor', constIdx < appIdx,
    'constIdx='+constIdx+' appIdx='+appIdx);
})();

// [4] Yeni modül dosyaları: MON-19 ilk domain taşımasıyla sayaç artık gerçek
// taşınan modülleri raporlar; ileri kartlar bu upper-bound iddiasını kullanmaz.
var expectedNewModules = [
  'app/core/dateUtils.js',
  'app/core/state.js',
  'app/core/helpers.js',
  'app/core/mediaFx.js',
  'app/core/timeTheme.js',
  'app/core/prayer.js',
  'app/core/zikir.js',
  'app/core/quran.js',
  'app/core/saygi.js',
  'app/core/motivation.js',
  'app/core/crisis.js',
  'app/core/journal.js',
  'app/core/health.js',
  'app/core/library.js',
  'app/core/report.js',
  'app/core/map.js',
  'app/core/profile.js',
  'app/core/reminders.js',
  'app/core/settings.js',
  'app/core/syncGlue.js',
  'app/core/messaging.js',
  'app/core/render.js',
  'app/core/appSurface.js'
];

(function(){
  var existing = 0;
  expectedNewModules.forEach(function(m){
    var p = path.join(repoRoot,m);
    var exists = fs.existsSync(p);
    if (exists) existing++;
  });
  ok('planlanan ' + expectedNewModules.length + ' modülden ' + existing + ' tanesi taşındı', existing > 0,
    'mevcut: '+existing+' / '+expectedNewModules.length);
  ok('MON-19 prayer modülü taşınmış ve registry hedefinde',
    fs.existsSync(path.join(repoRoot,'app/core/prayer.js')) &&
    fs.readFileSync(path.join(repoRoot,'app/core/prayer.js'),'utf8').indexOf('window.SeymaPrayer') >= 0);
})();

// [5] app.js App.* yüzeyi korunuyor (inline onclick handler referansları)
(function(){
  var appSrc = fs.readFileSync(path.join(repoRoot,'app.js'),'utf8');
  var surfacePatterns = [
    'App.toggleHabit',
    'App.waterAdd',
    'App.setMood',
    'App.saveJournal',
    'App.saveToday',
    'App.openReading',
    'App.closeReading',
    'App.openWatching',
    'App.closeWatching',
    'App.openListening',
    'App.closeListening',
    'App.openZikr',
    'App.closeZikr',
    'App.zikrTap',
    'App.openZikrPresetAdd',
    'App.openZikrHatim',
    'App.requestRemoveZikrHatim',
    'App.onModalKeydown',
    'App.openQuranJourney',
    'App.closeQuranJourney',
    'App.openSaygi',
    'App.markSaygiRead',
    'App.openCrisis',
    'App.sendAeonShare',
    'App.askAeon',
    'App.askLuna',
    'App.toggleTheme',
    'App.setTheme'
  ];
  var missing = [];
  surfacePatterns.forEach(function(sym){
    if (appSrc.indexOf(sym) < 0) missing.push(sym);
  });
  ok('App.* inline referans yüzeyi korunuyor', missing.length === 0,
    'eksik: '+missing.join(', '));
})();

// [6] Mevcut IIFE + global modül deseni korunuyor
(function(){
  var appSrc = fs.readFileSync(path.join(repoRoot,'app.js'),'utf8');
  var hasIife = /\(function\(\)\{/.test(appSrc);
  var hasWindowApp = /window\.App\s*=\s*App/.test(appSrc);
  ok('app.js IIFE deseni korunuyor', hasIife);
  ok('app.js sonunda window.App expose ediliyor', hasWindowApp);
})();

// [7] Modülerleştirme planı belgesi mevcut ve güncel
(function(){
  var p = path.join(repoRoot,'premium-fx-plan/MODULARIZATION.md');
  ok('MODULARIZATION.md mevcut', fs.existsSync(p));
  var txt = fs.readFileSync(p,'utf8');
  ok('MODULARIZATION.md v2.1', txt.indexOf('**Sürüm:** 2.1') >= 0);
  ok('MODULARIZATION.md 24 modül listesi', txt.indexOf('| 24 |') >= 0);
})();

// [8] MON-12/13/17: state + save gövdeleri registryde; app.js shimleri
(function(){
  var src = fs.readFileSync(path.join(repoRoot,'app.js'),'utf8');
  var stateSrc = fs.readFileSync(path.join(repoRoot,'app/core/state.js'),'utf8');
  var syncGlueSrc = fs.readFileSync(path.join(repoRoot,'app/core/syncGlue.js'),'utf8');
  ok('migrate(d) app.js imza-koruyan shim olarak kaldı', /function migrate\(d\)\{\s*return window\.SeymaState\.migrate\(d\);\s*\}/.test(src));
  ok('migrate gövdesi state registryde', /function migrate\(d\)\{/.test(stateSrc) && /registerMigrate/.test(src));
  ok('app.js migrate gövdesini yeniden taşımıyor', !/function migrate\(d\)\{[\s\S]*migrateReminderState\(d\)/.test(src));
  ok('getDay(d,date,idx) app.js imza-koruyan shim olarak kaldı', /function getDay\(d,date,idx\)\{\s*return window\.SeymaState\.getDay\.apply\(null,arguments\);\s*\}/.test(src));
  ok('getDay gövdesi state registryde', /function getDay\(d,date,idx\)\{/.test(stateSrc) && /registerGetDay/.test(src));
  ok('app.js getDay gövdesini yeniden taşımıyor', !/function getDay\(d,date,idx\)\{[\s\S]*emptyHabits\(\)/.test(src));
  ok('save(touchSource,eventSpec) app.js imza-koruyan shim olarak kaldı', /function save\(touchSource,eventSpec\)\{\s*return window\.SeymaSave\.save\.apply\(null,arguments\);\s*\}/.test(src));
  ok('save gövdesi syncGlue registryde', /function save\(touchSource,eventSpec\)\{/.test(syncGlueSrc) && /registerSave/.test(syncGlueSrc));
  ok('app.js save shim local persistence gövdesini taşımıyor', !/function save\(touchSource,eventSpec\)\{[^}]*localStorage\.setItem/.test(src));
})();

// [9] FX-P-04: app.js hâlâ window.App ve SeyOnSyncState/SeyOnSynced'i expose ediyor
// (B1: data/ui/dark/migrate/save henüz window'da DEĞİL — canlı getter'lar Faz 0'da)
(function(){
  var src = fs.readFileSync(path.join(repoRoot,'app.js'),'utf8');
  ok('app.js window.App expose ediyor', /window\.App\s*=\s*App/.test(src));
  ok('app.js window.SeyOnSyncState expose ediyor', /window\.SeyOnSyncState\s*=/.test(src));
  ok('app.js window.SeyOnSynced expose ediyor', /window\.SeyOnSynced\s*=/.test(src));
  // B1: Faz -1.1'de window.data/ui/dark/migrate/save YOKTUR (canlı getter Faz 0'da)
  ok('app.js window.data atamıyor (B1: Faz 0\'da canlı getter)', !/window\.data\s*=/.test(src));
  ok('app.js window.ui atamıyor (B1: Faz 0\'da canlı getter)', !/window\.ui\s*=/.test(src));
  ok('app.js window.save atamıyor (B1: Faz 0\'da canlı getter)', !/window\.save\s*=/.test(src));
})();

// [10] FX-P-04: yeni modüller window.* yüzeylerini expose ediyor (VM boot)
// app.js YÜKLENMEZ; yalnızca Faz -1.1 modülleri boot edilir. SeymaState/SeymaSave
// registryleri tanımlı olmalı; save gövdesi app.js kaydını beklemeli (B1).
(function(){
  var vm = require('vm');
  var timers = [];
  var win = {
    console: console,
    navigator: { vibrate: function(p){ return true; } },
    matchMedia: function(q){ return { matches: false, addEventListener: function(){}, removeEventListener: function(){} }; },
    localStorage: { getItem: function(){ return null; }, setItem: function(){}, removeItem: function(){} },
    addEventListener: function(){},
    removeEventListener: function(){},
    setTimeout: function(fn,t){ timers.push(fn); return timers.length; },
    clearTimeout: function(){},
    setInterval: function(){ return 0; },
    clearInterval: function(){},
    document: { getElementById: function(){ return null; }, createElement: function(){ return { style:{}, setAttribute:function(){}, appendChild:function(){}, remove:function(){}, parentNode:null }; }, body: { appendChild:function(){} }, querySelector: function(){ return null; }, querySelectorAll: function(){ return []; } },
    AudioContext: function(){ this.state='running'; this.resume=function(){ return Promise.resolve(); }; this.createOscillator=function(){ return { type:'', frequency:{setValueAtTime:function(){}}, connect:function(){}, start:function(){}, stop:function(){} }; }; this.createGain=function(){ return { gain:{setValueAtTime:function(){}, linearRampToValueAtTime:function(){}, exponentialRampToValueAtTime:function(){}}, connect:function(){} }; }; this.currentTime=0; },
    webkitAudioContext: function(){ return new win.AudioContext(); },
    speechSynthesis: { speak: function(){} },
    SpeechSynthesisUtterance: function(t){ this.text=t; this.lang=''; this.rate=1; this.pitch=1; }
  };
  win.window = win;
  var ctx = vm.createContext(win);
  var load = function(rel){ return fs.readFileSync(path.join(repoRoot, rel), 'utf8'); };
  vm.runInContext('var window = this; ' + load('app/core/constants.js'), ctx, { filename:'constants.js' });
  vm.runInContext(load('app/core/dateUtils.js'), ctx, { filename:'dateUtils.js' });
  vm.runInContext(load('app/core/state.js'), ctx, { filename:'state.js' });
  vm.runInContext(load('app/core/syncGlue.js'), ctx, { filename:'syncGlue.js' });
  vm.runInContext(load('app/core/helpers.js'), ctx, { filename:'helpers.js' });
  vm.runInContext(load('app/core/mediaFx.js'), ctx, { filename:'mediaFx.js' });
  vm.runInContext(load('app/core/timeTheme.js'), ctx, { filename:'timeTheme.js' });

  ok('window.SeymaDateUtils expose edilmiş', typeof win.SeymaDateUtils === 'object');
  ok('window.SeymaHelpers expose edilmiş', typeof win.SeymaHelpers === 'object');
  ok('window.SeymaState expose edilmiş', typeof win.SeymaState === 'object');
  ok('window.SeymaSave registry tanımlı', typeof win.SeymaSave === 'object');
  ok('window.SeymaSave registerSave hazır', typeof win.SeymaSave.registerSave === 'function');
  ok('window.SeyAudio expose edilmiş', typeof win.SeyAudio === 'object');
  ok('window.SeyHaptics expose edilmiş', typeof win.SeyHaptics === 'object');
  ok('window.SeyFx expose edilmiş', typeof win.SeyFx === 'object');
  ok('window.SeyTimeTheme expose edilmiş', typeof win.SeyTimeTheme === 'object');
  // B1: Faz -1.1'de data/ui henüz window'da değil → getter undefined
  ok('window.SeymaState.data henüz undefined (B1)', win.SeymaState.data === undefined);
  ok('window.SeymaSave.save henüz kayıtlı değil (B1)', win.SeymaSave.save === undefined);
})();

console.log('\n=== Özet ===');
console.log('Passed: '+passed+' / '+(passed+failed));
if (failed > 0) { process.exit(1); }
