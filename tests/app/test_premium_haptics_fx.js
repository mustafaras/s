// Faz 1 — Headless haptik efekti fixture'ı (sentetik veri, gerçek network YOK)
// Premium haptik API yüzeyini (henüz app/core/mediaFx.js eklenmemiş olsa da)
// spec'teki sözleşmeye göre doğrular.
// Çalıştırma: node tests/app/test_premium_haptics_fx.js

'use strict';
var fs = require('fs');
var path = require('path');
var repoRoot = require('../repo-root');

// ── Mock ortam: window, localStorage, document, fetch ───────────────────────
var _ls = {};
global.localStorage = {
  getItem: function(k){ return Object.prototype.hasOwnProperty.call(_ls,k) ? _ls[k] : null; },
  setItem: function(k,v){ _ls[k]=String(v); },
  removeItem: function(k){ delete _ls[k]; },
  clear: function(){ _ls={}; }
};
global.window = {
  addEventListener: function(){},
  matchMedia: function(q){ return { matches: false }; },
  SeymaConstants: null
};
global.document = { getElementById: function(){ return null; } };
global.location = { protocol:'https:', hostname:'example.com', search:'' };
global.fetch = function(url, opts){ return Promise.reject(new Error('TEST: fetch çağrılmamalı')); };
if (typeof TextEncoder === 'undefined') { global.TextEncoder = require('util').TextEncoder; }
if (typeof TextDecoder === 'undefined') { global.TextDecoder = require('util').TextDecoder; }

// ── navigator.vibrate stub: çağrıları kaydet ─────────────────────────────────
var _vibrateCalls = [];
var _vibrateExists = true;
Object.defineProperty(global, 'navigator', {
  value: {
    vibrate: function(pattern){
      if(!_vibrateExists) return false;
      _vibrateCalls.push(pattern);
      return true;
    }
  },
  configurable: true, writable: true
});

// ── Constants'ı kur (IIFE global window.SeymaConstants yazar) ───────────────
try {
  var constantsSrc = fs.readFileSync(path.join(repoRoot,'app/core/constants.js'),'utf8');
  eval(constantsSrc);
} catch(e){ console.error('constants yüklenemedi', e); process.exit(1); }

// ── Test yardımcıları ───────────────────────────────────────────────────────
var passed = 0, failed = 0;
function ok(name, cond, detail){
  if (cond) { passed++; console.log('  ✓ '+name); }
  else { failed++; console.log('  ✗ '+name + (detail ? ' — '+detail : '')); }
}
function clearVibrate(){ _vibrateCalls.length = 0; }
function dataSettings(s){ window.SeymaConstants = { data: { settings: s || {} } }; }

// ── Test edilecek API: spec'teki mediaFx.js haptik sözleşmesi ───────────────
// Mevcut haptic(p) (app.js:6375) ile uyumlu ama yeni pattern haritası ekler.
function vibrate(pattern){
  var s = (window.SeymaConstants && window.SeymaConstants.data && window.SeymaConstants.data.settings) || {};
  if(s.richHaptics === false || s.haptics === false) return;
  if(!navigator.vibrate) return;
  try { navigator.vibrate(pattern); } catch(e){}
}
function buildHaptics(){
  window.SeyHaptics = {
    tap: function(){ vibrate([15]); },
    success: function(){ vibrate([20, 30, 50]); },
    error: function(){ vibrate([40, 20, 40]); },
    refresh: function(){ vibrate([10, 20, 10, 20, 10]); },
    streak: function(){ vibrate([30, 50, 80]); },
    water: function(){ vibrate([10, 15, 10]); }
  };
}

console.log('\n=== Premium Haptics FX Tests ===\n');

// ── Test 1: Pattern mapping doğru ───────────────────────────────────────────
console.log('[1] Pattern mapping doğru');
(function(){
  dataSettings({ richHaptics: true, haptics: true });
  buildHaptics();
  var cases = [
    ['tap', [15]],
    ['success', [20,30,50]],
    ['error', [40,20,40]],
    ['refresh', [10,20,10,20,10]],
    ['streak', [30,50,80]],
    ['water', [10,15,10]]
  ];
  cases.forEach(function(c){
    clearVibrate();
    window.SeyHaptics[c[0]]();
    ok(c[0]+' pattern doğru', JSON.stringify(_vibrateCalls[0]) === JSON.stringify(c[1]),
      JSON.stringify(_vibrateCalls[0]));
  });
})();

// ── Test 2: richHaptics=false iken vibrate çağrılmaz ────────────────────────
console.log('\n[2] settings.richHaptics === false iken sessiz');
(function(){
  dataSettings({ richHaptics: false, haptics: true });
  clearVibrate();
  window.SeyHaptics.tap();
  window.SeyHaptics.success();
  ok('richHaptics=false iken vibrate çağrılmadı', _vibrateCalls.length===0, 'calls: '+_vibrateCalls.length);
})();

// ── Test 3: haptics=false iken vibrate çağrılmaz ─────────────────────────────
console.log('\n[3] settings.haptics === false iken sessiz');
(function(){
  dataSettings({ richHaptics: true, haptics: false });
  clearVibrate();
  window.SeyHaptics.error();
  window.SeyHaptics.streak();
  ok('haptics=false iken vibrate çağrılmadı', _vibrateCalls.length===0, 'calls: '+_vibrateCalls.length);
})();

// ── Test 4: navigator.vibrate yoksa no-op ─────────────────────────────────
console.log('\n[4] navigator.vibrate yoksa graceful no-op');
(function(){
  dataSettings({ richHaptics: true, haptics: true });
  _vibrateExists = false;
  clearVibrate();
  var threw = false;
  try {
    window.SeyHaptics.tap();
    window.SeyHaptics.success();
  } catch(e){ threw = true; }
  ok('navigator.vibrate yokken hata fırlatmaz', !threw);
  ok('navigator.vibrate yokken çağrı yapılmaz', _vibrateCalls.length===0, 'calls: '+_vibrateCalls.length);
  _vibrateExists = true;
})();

// ── Test 5: Mevcut haptic(p) ile uyum (haptics=false kontrolü) ──────────────
console.log('\n[5] Mevcut haptic(p) settings kontrolü');
(function(){
  // app.js:6375 haptic(p) sözleşmesi: navigator.vibrate && !(data.settings.haptics===false)
  function haptic(p, settings){ try{ if(navigator.vibrate && !(settings && settings.haptics===false)) navigator.vibrate(p); }catch(e){} }
  _vibrateExists = true;
  clearVibrate();
  haptic(15, {});
  ok('haptic(p) varsayılan açıkken vibrate çağrılır', _vibrateCalls.length===1 && _vibrateCalls[0]===15);
  clearVibrate();
  haptic(15, { haptics: false });
  ok('haptic(p) haptics=false iken vibrate çağırmaz', _vibrateCalls.length===0);
})();

console.log('\n=== Özet ===');
console.log('Passed: '+passed+' / '+(passed+failed));
process.exit(failed ? 1 : 0);
