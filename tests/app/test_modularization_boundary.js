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

// [4] Yeni modül dosyaları beklenen yollarıyla var veya yok (henüz kod değişmedi)
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
  ok('planlanan 24 yeni modül için ' + existing + ' tanesi mevcut', true,
    'mevcut: '+existing+' / '+expectedNewModules.length);
  ok('modüllerin çoğu henüz oluşturulmadı (plan aşaması)', existing < expectedNewModules.length,
    'mevcut: '+existing);
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

// [8] migrate() ve save() hâlâ app.js içinde
(function(){
  var src = fs.readFileSync(path.join(repoRoot,'app.js'),'utf8');
  ok('migrate(d) hâlâ app.js içinde', /function migrate\(d\)\{/.test(src));
  ok('save() hâlâ app.js içinde', /function save\(touchSource,eventSpec\)\{/.test(src));
})();

console.log('\n=== Özet ===');
console.log('Passed: '+passed+' / '+(passed+failed));
if (failed > 0) { process.exit(1); }
