'use strict';
// Faz -1.1 sınır testi: yeni modüller (dateUtils, helpers, mediaFx, timeTheme)
// sadece window.* üzerinde expose edilmiş durumda olmalı; hiçbir App.* handler
// bunları kullanmamalı çünkü PR -1.1 davranış değiştirmez.
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
    ok(m+' henüz mevcut değil (PR -1.1 öncesi)', !fs.existsSync(p));
  });
})();

(function(){
  var html = fs.readFileSync(path.join(repoRoot,'index.html'),'utf8');
  expectedModules.forEach(function(m){
    var ref = 'src="'+m+'"';
    ok(m+' henüz index.html\'de yüklenmiyor', html.indexOf(ref) < 0);
  });
})();

(function(){
  var appSrc = fs.readFileSync(path.join(repoRoot,'app.js'),'utf8');
  ok('SeyAudio henüz App.* içinde çağrılmıyor', appSrc.indexOf('SeyAudio') < 0);
  ok('SeyHaptics henüz App.* içinde çağrılmıyor', appSrc.indexOf('SeyHaptics') < 0);
  ok('SeyTimeTheme henüz App.* içinde çağrılmıyor', appSrc.indexOf('SeyTimeTheme') < 0);
  ok('SeymaDateUtils henüz App.* içinde çağrılmıyor', appSrc.indexOf('SeymaDateUtils') < 0);
  ok('SeymaHelpers henüz App.* içinde çağrılmıyor', appSrc.indexOf('SeymaHelpers') < 0);
})();

console.log('\n=== Özet ===');
console.log('Passed: '+passed+' / '+(passed+failed));
if (failed > 0) { process.exit(1); }
