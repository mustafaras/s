'use strict';
// Faz -1.1 sınır testi: yeni modüller (dateUtils, helpers, mediaFx, timeTheme)
// sadece window.* üzerinde expose edilmiş durumda olmalıydı. MON-07 ile
// dateUtils'nin on gövdesi ve helpers'ın altı saf görünüm üreticisi app.js'te
// imza-koruyan shim üzerinden registry sahibi olur.
// Çalıştırma: node tests/app/test_faz_minus11_boundary.js

var fs = require('fs');
var path = require('path');
var repoRoot = require('../repo-root');

var passed = 0, failed = 0;
function ok(name, cond, detail){
  if (cond) { passed++; console.log('  ✓ '+name); }
  else { failed++; console.log('  ✗ '+name + (detail ? ' — '+detail : '')); }
}

console.log('\n=== Faz -1.1 — Yeni Modül Expose Sınır Testleri ===\n');

var expectedModules = [
  'app/core/dateUtils.js',
  'app/core/helpers.js',
  'app/core/mediaFx.js',
  'app/core/timeTheme.js'
];

(function(){
  expectedModules.forEach(function(m){
    var p = path.join(repoRoot,m);
    ok(m+' mevcut (Faz -1.1 sonrası)', fs.existsSync(p));
  });
})();

(function(){
  var html = fs.readFileSync(path.join(repoRoot,'index.html'),'utf8');
  expectedModules.forEach(function(m){
    var ref = 'src="'+m;
    ok(m+' index.html\'de yükleniyor (cache-busting dahil)', html.indexOf(ref) >= 0);
  });
})();

(function(){
  var appSrc = fs.readFileSync(path.join(repoRoot,'app.js'),'utf8');
  // FX-P-12..15: SeyAudio artık app.js içinde çağrılıyor (zikr tap, success,
  // warning, bell). "henüz çağrılmıyor" testi kalktı; yerine çağrı noktalarının
  // varlığı ve güvenli wrapper deseni doğrulanır.
  ok('SeyAudio.tap çağrı noktası var (FX-P-12)', appSrc.indexOf('SeyAudio.tap') >= 0);
  ok('SeyAudio.success çağrı noktası var (FX-P-13)', appSrc.indexOf('SeyAudio.success') >= 0);
  ok('SeyAudio.warning çağrı noktası var (FX-P-14)', appSrc.indexOf('SeyAudio.warning') >= 0);
  ok('SeyAudio.bell çağrı noktası var (FX-P-15)', appSrc.indexOf('SeyAudio.bell') >= 0);
  // FX-P-22..23: SeyHaptics artık app.js içinde çağrılıyor (tap/streak/water).
  // "henüz çağrılmıyor" testi kalktı; yerine çağrı noktalarının varlığı doğrulanır.
  ok('SeyHaptics.tap çağrı noktası var (FX-P-22)', appSrc.indexOf('SeyHaptics.tap') >= 0);
  ok('SeyHaptics.streak çağrı noktası var (FX-P-23)', appSrc.indexOf('SeyHaptics.streak') >= 0);
  ok('SeyHaptics.water çağrı noktası var (FX-P-23)', appSrc.indexOf('SeyHaptics.water') >= 0);
  // Diğer yeni modüller henüz App.* içinde çağrılmıyor (davranış değişmez).
  // FX-P-42: SeyTimeTheme artık app.js render() sonunda güvenli guard ile
  // çağrılıyor (onaylı entegrasyon); eski "henüz çağrılmıyor" kontratı bayat.
  ok('SeyTimeTheme guard\'lı çağrı noktası var (FX-P-42)', appSrc.indexOf('window.SeyTimeTheme && typeof window.SeyTimeTheme.apply') >= 0);
  var dateUtilsShims = [
    'function pad(n){ return window.SeymaDateUtils.pad.apply(null,arguments); }',
    'function fmt(d){ return window.SeymaDateUtils.fmt.apply(null,arguments); }',
    'function todayStr(){ return window.SeymaDateUtils.todayStr.apply(null,arguments); }',
    'function addDays(s,n){ return window.SeymaDateUtils.addDays.apply(null,arguments); }',
    'function diffDays(a,b){ return window.SeymaDateUtils.diffDays.apply(null,arguments); }',
    'function shortDate(s){ return window.SeymaDateUtils.shortDate.apply(null,arguments); }',
    'function dayIndexFor(date){ return window.SeymaDateUtils.dayIndexFor.apply(null,arguments); }',
    'function activeDate(){ return window.SeymaDateUtils.activeDate.apply(null,arguments); }',
    'function curDay(){ return window.SeymaDateUtils.curDay.apply(null,arguments); }',
    'function dateLabelTR(s){ return window.SeymaDateUtils.dateLabelTR.apply(null,arguments); }'
  ];
  ok('SeymaDateUtils on tarih fonksiyonu shim üzerinden çağrılıyor (MON-07/08)', dateUtilsShims.every(function(shim){ return appSrc.indexOf(shim) >= 0; }));
  var helperShims = [
    'function segTabs(defs,active,fn,accent){ return window.SeymaHelpers.segTabs.apply(null,arguments); }',
    'function progBar(pct,col){ return window.SeymaHelpers.progBar.apply(null,arguments); }',
    'function starRow(rating,fn,id,size){ return window.SeymaHelpers.starRow.apply(null,arguments); }',
    'function miniBars(rows,valKey,unit,col){ return window.SeymaHelpers.miniBars.apply(null,arguments); }',
    'function statTile(label,val,sub){ return window.SeymaHelpers.statTile.apply(null,arguments); }',
    'function collapsibleCardHTML(o){ return window.SeymaHelpers.collapsibleCardHTML.apply(null,arguments); }'
  ];
  ok('SeymaHelpers altı görünüm üreticisi shim üzerinden çağrılıyor (MON-09)', helperShims.every(function(shim){ return appSrc.indexOf(shim) >= 0; }));
})();

console.log('\n=== Özet ===');
console.log('Passed: '+passed+' / '+(passed+failed));
if (failed > 0) { process.exit(1); }
