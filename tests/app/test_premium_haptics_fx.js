// Faz 2 — Headless haptik efekti fixture'ı (sentetik veri, gerçek network YOK)
// FX-P-24: gerçek app/core/mediaFx.js modülünü yükler ve SeyHaptics yüzeyini
// (tap/success/error/refresh/streak/water) + gating'i (premiumAtmosphere,
// richHaptics, haptics, reduced-motion) + app.js çağrı noktalarını doğrular.
// navigator.vibrate stub ile her desenin doğru pattern ürettiğini ölçer.
// Çalıştırma: node tests/app/test_premium_haptics_fx.js

'use strict';
var fs = require('fs');
var path = require('path');
var repoRoot = require('../repo-root');

// ── Mock ortam: window, localStorage, fetch, document ───────────────────────
var _ls = {};
global.localStorage = {
  getItem: function(k){ return Object.prototype.hasOwnProperty.call(_ls,k) ? _ls[k] : null; },
  setItem: function(k,v){ _ls[k]=String(v); },
  removeItem: function(k){ delete _ls[k]; },
  clear: function(){ _ls={}; }
};
global.window = {
  addEventListener: function(){},
  matchMedia: function(q){ return { matches: _reducedMotion }; },
  SeymaConstants: null,
  SeymaState: null,
  SeyHaptics: null
};
global.document = { getElementById: function(){ return null; } };
global.location = { protocol:'https:', hostname:'example.com', search:'' };
global.fetch = function(url, opts){
  return Promise.reject(new Error('TEST: fetch çağrılmamalı'));
};
if (typeof TextEncoder === 'undefined') { global.TextEncoder = require('util').TextEncoder; }
if (typeof TextDecoder === 'undefined') { global.TextDecoder = require('util').TextDecoder; }

// ── reduce-motion bayrağı (matchMedia stub'ı okur) ──────────────────────────
var _reducedMotion = false;

// ── navigator.vibrate stub: çağrıları kaydet ────────────────────────────────
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

// ── Test yardımcıları ───────────────────────────────────────────────────────
var passed = 0, failed = 0;
function ok(name, cond, detail){
  if (cond) { passed++; console.log('  ✓ '+name); }
  else { failed++; console.log('  ✗ '+name + (detail ? ' — '+detail : '')); }
}
function clearVibrate(){ _vibrateCalls.length = 0; }
function setSettings(s){ window.SeymaState = { data: { settings: s || {} } }; }
function setReducedMotion(v){ _reducedMotion = !!v; }

// ── Gerçek mediaFx.js modülünü taze yükler (closure'ı sıfırlar) ─────────────
function loadMediaFx(){
  var src = fs.readFileSync(path.join(repoRoot,'app/core/mediaFx.js'),'utf8');
  // IIFE'yi global window bağlamında çalıştır; window.SeyAudio/SeyHaptics/SeyFx yazar.
  (0, eval)(src);
}

console.log('\n=== Premium Haptics FX Tests (gerçek mediaFx.js) ===\n');

// ── Test 1: API yüzeyi tanımlı ve çağrılabilir ──────────────────────────────
console.log('[1] SeyHaptics API yüzeyi tanımlı');
(function(){
  setSettings({ premiumAtmosphere: true, richHaptics: true, haptics: true });
  setReducedMotion(false);
  loadMediaFx();
  ok('SeyHaptics var', !!window.SeyHaptics);
  ok('SeyHaptics.tap fonksiyonu var', typeof window.SeyHaptics.tap === 'function');
  ok('SeyHaptics.success fonksiyonu var', typeof window.SeyHaptics.success === 'function');
  ok('SeyHaptics.error fonksiyonu var', typeof window.SeyHaptics.error === 'function');
  ok('SeyHaptics.refresh fonksiyonu var', typeof window.SeyHaptics.refresh === 'function');
  ok('SeyHaptics.streak fonksiyonu var', typeof window.SeyHaptics.streak === 'function');
  ok('SeyHaptics.water fonksiyonu var', typeof window.SeyHaptics.water === 'function');
})();

// ── Test 2: Pattern mapping doğru ───────────────────────────────────────────
console.log('\n[2] Pattern mapping doğru');
(function(){
  setSettings({ premiumAtmosphere: true, richHaptics: true, haptics: true });
  setReducedMotion(false);
  loadMediaFx();
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

// ── Test 3: premiumAtmosphere=false iken vibrate çağrılmaz ──────────────────
console.log('\n[3] settings.premiumAtmosphere === false iken sessiz');
(function(){
  setSettings({ premiumAtmosphere: false, richHaptics: true, haptics: true });
  setReducedMotion(false);
  loadMediaFx();
  clearVibrate();
  window.SeyHaptics.tap();
  window.SeyHaptics.success();
  window.SeyHaptics.streak();
  ok('premiumAtmosphere=false iken vibrate çağrılmadı', _vibrateCalls.length===0, 'calls: '+_vibrateCalls.length);
})();

// ── Test 4: richHaptics=false iken vibrate çağrılmaz ────────────────────────
console.log('\n[4] settings.richHaptics === false iken sessiz');
(function(){
  setSettings({ premiumAtmosphere: true, richHaptics: false, haptics: true });
  setReducedMotion(false);
  loadMediaFx();
  clearVibrate();
  window.SeyHaptics.tap();
  window.SeyHaptics.success();
  ok('richHaptics=false iken vibrate çağrılmadı', _vibrateCalls.length===0, 'calls: '+_vibrateCalls.length);
})();

// ── Test 5: haptics=false iken vibrate çağrılmaz ────────────────────────────
console.log('\n[5] settings.haptics === false iken sessiz');
(function(){
  setSettings({ premiumAtmosphere: true, richHaptics: true, haptics: false });
  setReducedMotion(false);
  loadMediaFx();
  clearVibrate();
  window.SeyHaptics.error();
  window.SeyHaptics.streak();
  ok('haptics=false iken vibrate çağrılmadı', _vibrateCalls.length===0, 'calls: '+_vibrateCalls.length);
})();

// ── Test 6: prefers-reduced-motion: reduce iken vibrate çağrılmaz ──────────
console.log('\n[6] prefers-reduced-motion: reduce iken sessiz');
(function(){
  setSettings({ premiumAtmosphere: true, richHaptics: true, haptics: true });
  setReducedMotion(true);
  loadMediaFx();
  clearVibrate();
  window.SeyHaptics.tap();
  window.SeyHaptics.success();
  window.SeyHaptics.water();
  ok('reduce-motion iken vibrate çağrılmadı', _vibrateCalls.length===0, 'calls: '+_vibrateCalls.length);
})();

// ── Test 7: navigator.vibrate yoksa no-op ─────────────────────────────────
console.log('\n[7] navigator.vibrate yoksa graceful no-op');
(function(){
  setSettings({ premiumAtmosphere: true, richHaptics: true, haptics: true });
  setReducedMotion(false);
  loadMediaFx();
  _vibrateExists = false;
  clearVibrate();
  var threw = false;
  try {
    window.SeyHaptics.tap();
    window.SeyHaptics.success();
    window.SeyHaptics.streak();
  } catch(e){ threw = true; }
  ok('navigator.vibrate yokken hata fırlatmaz', !threw);
  ok('navigator.vibrate yokken çağrı yapılmaz', _vibrateCalls.length===0, 'calls: '+_vibrateCalls.length);
  _vibrateExists = true;
})();

// ── Test 8: app.js içindeki SeyHaptics çağrı noktaları (light parse) ───────
console.log('\n[8] app.js SeyHaptics çağrı noktaları');
(function(){
  var appSrc = fs.readFileSync(path.join(repoRoot,'app.js'),'utf8');
  // MON2-06 (K8 ilkesi: pin gövdeyi izler): zikir tamamlama/streak haptic
  // çağrıları app/core/zikir.js yüzey bölümüne taşındı; çağrı sayımı birleşik
  // kaynakta yapılır.
  var zikirSrc = fs.readFileSync(path.join(repoRoot,'app/core/zikir.js'),'utf8');
  appSrc = appSrc + zikirSrc;
  // Gerçek çağrı = parantezli invocation: `SeyHaptics.tap()` (guard'ı saymaz).
  var tapCalls = (appSrc.match(/SeyHaptics\.tap\(\)/g) || []).length;
  var streakCalls = (appSrc.match(/SeyHaptics\.streak\(\)/g) || []).length;
  var waterCalls = (appSrc.match(/SeyHaptics\.water\(\)/g) || []).length;
  ok('SeyHaptics.tap() çağrı noktaları var (>=10)', tapCalls >= 10, 'tap: '+tapCalls);
  ok('SeyHaptics.streak() çağrı noktaları var (>=3)', streakCalls >= 3, 'streak: '+streakCalls);
  ok('SeyHaptics.water() çağrı noktası var (>=1)', waterCalls >= 1, 'water: '+waterCalls);
  // Her çağrı güvenli guard ile sarılmış olmalı: guard bloğu sayısı çağrı sayısına eşit.
  // Not: app.js'te bazı guard'lar boşluksuz (`typeof window.SeyHaptics.streak==='function'`),
  // bazıları boşluklu (`typeof window.SeyHaptics.tap === 'function'`) — regex boşluk toleranslı.
  var tapGuard = (appSrc.match(/typeof window\.SeyHaptics\.tap\s*===\s*'function'/g) || []).length;
  var streakGuard = (appSrc.match(/typeof window\.SeyHaptics\.streak\s*===\s*'function'/g) || []).length;
  var waterGuard = (appSrc.match(/typeof window\.SeyHaptics\.water\s*===\s*'function'/g) || []).length;
  ok('SeyHaptics.tap() çağrıları güvenli guard ile sarılmış', tapGuard >= tapCalls, 'guard: '+tapGuard+' / çağrı: '+tapCalls);
  ok('SeyHaptics.streak() çağrıları güvenli guard ile sarılmış', streakGuard >= streakCalls, 'guard: '+streakGuard+' / çağrı: '+streakCalls);
  ok('SeyHaptics.water() çağrıları güvenli guard ile sarılmış', waterGuard >= waterCalls, 'guard: '+waterGuard+' / çağrı: '+waterCalls);
})();

console.log('\n=== Özet ===');
console.log('Passed: '+passed+' / '+(passed+failed));
process.exit(failed ? 1 : 0);
