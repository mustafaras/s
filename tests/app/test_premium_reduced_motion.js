// Faz 2 / 4 / 6 — Headless reduced-motion fixture'ı
// app/styles.css içindeki @media (prefers-reduced-motion: reduce) bloklarını
// tarar; yeni premium animasyon class'larının pasif edildiğini doğrular.
// Henüz bu class'lar yoksa mevcut reduce-motion bloğunun varlığını ve mantığını doğrular.
// Çalıştırma: node tests/app/test_premium_reduced_motion.js

'use strict';
var fs = require('fs');
var path = require('path');
var repoRoot = require('../repo-root');

// ── CSS'i oku ─────────────────────────────────────────────────────────────
var cssPath = path.join(repoRoot, 'app/styles.css');
var css;
try { css = fs.readFileSync(cssPath, 'utf8'); } catch(e){ console.error('styles.css okunamadı', e); process.exit(1); }

// ── Test yardımcıları ───────────────────────────────────────────────────────
var passed = 0, failed = 0;
function ok(name, cond, detail){
  if (cond) { passed++; console.log('  ✓ '+name); }
  else { failed++; console.log('  ✗ '+name + (detail ? ' — '+detail : '')); }
}

// Tüm @media (prefers-reduced-motion: reduce) bloklarını çıkar (basit parser)
var reduceBlocks = [];
var re = /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\}/gi;
var m;
while((m = re.exec(css)) !== null){ reduceBlocks.push(m[1]); }

// Birleşik reduce-motion metni
var reduceText = reduceBlocks.join('\n');

console.log('\n=== Premium Reduced Motion Tests ===\n');

// ── Test 1: En az bir reduce-motion bloğu var ──────────────────────────────
console.log('[1] @media (prefers-reduced-motion: reduce) bloğu var');
(function(){
  ok('en az 1 reduce-motion bloğu bulundu', reduceBlocks.length > 0, 'bulunan: '+reduceBlocks.length);
})();

// ── Test 2: Yeni premium class'lar pasif edilmiş veya bloğa eklenebilir durumda
console.log('\n[2] Premium animasyon class’ları reduce-motion kapsamında');
(function(){
  var premiumClasses = [
    '.sey-fx-shimmer',
    '.sey-fx-ripple',
    '.sey-fx-float',
    '.sey-splash',
    '.sey-time-theme',
    '.sey-fx-count',
    '.sey-fx-bounce',
    '.sey-ripple'
  ];
  // Henüz class'lar CSS'te tanımlı olmayabilir; test kuralı:
  // ya class'lar tanımlı ve reduce bloğunda animation/transition none var,
  // ya da reduce bloğu zaten animation:none ve transition:none !important içeriyor.
  var hasBroadRule = /animation\s*:\s*none\s*!important/.test(reduceText) ||
                     /transition\s*:\s*none\s*!important/.test(reduceText);
  premiumClasses.forEach(function(cls){
    var classDefined = css.indexOf(cls) > -1;
    var classCovered = reduceText.indexOf(cls) > -1;
    if(classDefined){
      ok(cls+' reduce-motion altında pasif', classCovered || hasBroadRule,
        'tanımlı ama kapsanmamış');
    } else {
      ok(cls+' henüz tanımlı değil (placeholder)', true, 'ileride eklenecek');
    }
  });
})();

// ── Test 3: Mevcut reduce-motion kuralları animation/transition none içeriyor
console.log('\n[3] Mevcut reduce-motion kuralları animation/transition none içeriyor');
(function(){
  ok('reduce-motion metni animation:none içeriyor', /animation\s*:\s*none/.test(reduceText));
  ok('reduce-motion metni transition:none içeriyor', /transition\s*:\s*none/.test(reduceText));
  ok('!important kullanımı var', /!important/.test(reduceText));
})();

// ── Test 4: Mevcut animasyonlu class'lar (örn. .sey-room-card, .zikr-v2-overlay) pasif
console.log('\n[4] Mevcut animasyonlu class’lar reduce-motion altında pasif');
(function(){
  var existingAnimated = ['.sey-room-card', '.zikr-v2-overlay', '.sey-bottomnav-item', '.pa-gate', '.sey-auth-shake'];
  existingAnimated.forEach(function(cls){
    if(css.indexOf(cls) > -1){
      ok(cls+' tanımlı', true);
      var covered = reduceText.indexOf(cls) > -1;
      var broadRule = /animation\s*:\s*none\s*!important/.test(reduceText);
      ok(cls+' reduce-motion kapsamında (veya genel kural var)', covered || broadRule);
    } else {
      ok(cls+' mevcut değil (skip)', true);
    }
  });
})();

console.log('\n=== Özet ===');
console.log('Passed: '+passed+' / '+(passed+failed));
process.exit(failed ? 1 : 0);
