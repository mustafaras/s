'use strict';
// Faz -1.1 sınır testi: helpers modülü window.SeymaHelpers üzerinde expose edilmiş
// ve temel yardımcı fonksiyonlar çalışıyor. Hiçbir App.* handler bu modülü çağırmıyor.
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

console.log('\n=== Özet ===');
console.log('Passed: '+passed+' / '+(passed+failed));
if (failed > 0) { process.exit(1); }
