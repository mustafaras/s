'use strict';
// Faz -1.1 sınır testi: helpers modülü window.SeymaHelpers üzerinde expose edilmiş
// ve 12 üyelik yüzeyi çalışıyor. MON-10 sonrası app.js, üç etkileşim
// yardımcısına imza-koruyan shim üzerinden delege eder.
// Çalıştırma: node tests/app/test_helpers_boundary.js

var fs = require('fs');
var path = require('path');
var vm = require('vm');
var repoRoot = require('../repo-root');

function load(rel){ return fs.readFileSync(path.join(repoRoot, rel), 'utf8'); }

var passed = 0, failed = 0;
function ok(name, cond, detail){
  if (cond) { passed++; console.log('  ✓ '+name); }
  else { failed++; console.log('  ✗ '+name + (detail ? ' — '+detail : '')); }
}

console.log('\n=== Faz -1.1 — Helpers Modülü Sınır Testleri ===\n');

var win = {
  console: console,
  navigator: { vibrate: function(p){ return true; } },
  SeymaConstants: { ICONS: { star: '<path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/>' } },
  matchMedia: function(){ return { matches:false }; },
  addEventListener: function(){},
  document: { querySelector:function(){ return null; }, querySelectorAll:function(){ return []; }, body: { appendChild:function(){} }, createElement:function(){ return { classList:{ add:function(){} }, style:{}, setAttribute:function(){}, appendChild:function(){}, addEventListener:function(){}, remove:function(){}, parentNode:null }; } }
};
win.window = win;
var ctx = vm.createContext(win);
var w = ctx.window;

vm.runInContext('var window = this; ' + load('app/core/constants.js'), ctx, { filename:'constants.js' });
vm.runInContext(load('app/core/dateUtils.js'), ctx, { filename:'dateUtils.js' });
vm.runInContext(load('app/core/state.js'), ctx, { filename:'state.js' });
vm.runInContext(load('app/core/syncGlue.js'), ctx, { filename:'syncGlue.js' });
vm.runInContext(load('app/core/helpers.js'), ctx, { filename:'helpers.js' });

(function(){
  ok('SeymaHelpers expose edilmiş', typeof w.SeymaHelpers === 'object');
  ok('esc fonksiyonu var', typeof w.SeymaHelpers.esc === 'function');
  ok('icon fonksiyonu var', typeof w.SeymaHelpers.icon === 'function');
  ok('segTabs fonksiyonu var', typeof w.SeymaHelpers.segTabs === 'function');
  ok('progBar fonksiyonu var', typeof w.SeymaHelpers.progBar === 'function');
  ok('starRow fonksiyonu var', typeof w.SeymaHelpers.starRow === 'function');
  ok('miniBars fonksiyonu var', typeof w.SeymaHelpers.miniBars === 'function');
  ok('statTile fonksiyonu var', typeof w.SeymaHelpers.statTile === 'function');
  ok('collapsibleCardHTML fonksiyonu var', typeof w.SeymaHelpers.collapsibleCardHTML === 'function');
  ok('toast fonksiyonu var', typeof w.SeymaHelpers.toast === 'function');
  ok('confetti fonksiyonu var', typeof w.SeymaHelpers.confetti === 'function');
  ok('haptic fonksiyonu var', typeof w.SeymaHelpers.haptic === 'function');
})();

(function(){
  ok('esc HTML escape yapıyor', w.SeymaHelpers.esc('<script>') === '&lt;script&gt;');
  ok('icon bilinmeyen ad boş döndürüyor', w.SeymaHelpers.icon('missing') === '');
  ok('progBar yüzde render ediyor', w.SeymaHelpers.progBar(50, 'red').indexOf('50%') >= 0);
  ok('statTile değer gösteriyor', w.SeymaHelpers.statTile('Test', 42).indexOf('42') >= 0);
  ok('miniBars dizi uzunluğu kadar çubuk üretiyor', (w.SeymaHelpers.miniBars([1,2,3],{}).match(/style=/g) || []).length >= 3);
})();

// ── seq 24: haptic closure sorunu — SeymaState.data yokken kapatma kontrolü devre dışı kalır ama kırılmaz ──
// Faz 0'da (FX-P-05) app.js canlı getter'ı window.data'yı expose eder; SeymaState.data
// getter'ı bunu window['data'] üzerinden çözer. Bu test, Faz 0 davranışını simüle
// etmek için window.data'yı doğrudan kurar (SeymaState getter nesnesini değiştirmez).
(function(){
  // window.data yok → SeymaState.data undefined → haptic exception atmamalı
  w.data = undefined;
  w.SeymaHelpers.haptic(10);
  ok('haptic SeymaState.data yokken exception atmıyor', true);

  // data.settings.haptics === false → vibrate çağrılmamalı
  var vibrateCalls = 0;
  w.navigator.vibrate = function(){ vibrateCalls++; return true; };
  w.data = { settings: { haptics: false } };
  w.SeymaHelpers.haptic(10);
  ok('haptic haptics=false iken vibrate çağırmıyor', vibrateCalls === 0);

  // data.settings.haptics !== false → vibrate çağrılmalı
  w.data = { settings: { haptics: true } };
  w.SeymaHelpers.haptic(10);
  ok('haptic haptics=true iken vibrate çağırıyor', vibrateCalls === 1);

  // Sonraki bölümler için window.data'yı temizle (Faz -1.1 durumuna dön)
  w.data = undefined;
})();

// ── state.js / syncGlue.js yüzeyleri (Faz -1.1) ──
(function(){
  ok('SeymaState expose edilmiş', typeof w.SeymaState === 'object');
  ok('SeymaState.data getter tanımlı', 'data' in w.SeymaState);
  ok('SeymaState.ui getter tanımlı', 'ui' in w.SeymaState);
  ok('SeymaState.dark getter tanımlı', 'dark' in w.SeymaState);
  ok('SeymaState.migrate getter tanımlı', 'migrate' in w.SeymaState);
  ok('SeymaState.getDay getter tanımlı', 'getDay' in w.SeymaState);
  ok('SeymaState.createDefaultData getter tanımlı', 'createDefaultData' in w.SeymaState);
  ok('SeymaState.data henüz undefined (Faz -1.1)', w.SeymaState.data === undefined);
  ok('SeymaSave registry tanımlı', typeof w.SeymaSave === 'object');
  ok('SeymaSave registerSave hazır', typeof w.SeymaSave.registerSave === 'function');
  ok('SeymaSave.save henüz kayıtlı değil (B1)', w.SeymaSave.save === undefined);
})();

console.log('\n=== Özet ===');
console.log('Passed: '+passed+' / '+(passed+failed));
if (failed > 0) { process.exit(1); }
