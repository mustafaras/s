// Faz 1 — Headless ses efekti fixture'ı (sentetik veri, gerçek network YOK)
// FX-P-16: gerçek app/core/mediaFx.js modülünü yükler ve SeyAudio yüzeyini
// (tap/success/warning/bell/voice/ambient) + app.js çağrı noktalarını doğrular.
// AudioContext stub ile gerçek osilatör/zarfların oluşturulduğunu ölçer.
// Çalıştırma: node tests/app/test_premium_audio_fx.js

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
  AudioContext: null,
  webkitAudioContext: null,
  speechSynthesis: null,
  SeymaConstants: null,
  SeymaState: null,
  SeyAudio: null
};
global.document = { getElementById: function(){ return null; } };
global.location = { protocol:'https:', hostname:'example.com', search:'' };
Object.defineProperty(global, 'navigator', { value: { vibrate: function(){} }, configurable: true, writable: true });
global.fetch = function(url, opts){
  return Promise.reject(new Error('TEST: fetch çağrılmamalı'));
};
if (typeof TextEncoder === 'undefined') { global.TextEncoder = require('util').TextEncoder; }
if (typeof TextDecoder === 'undefined') { global.TextDecoder = require('util').TextDecoder; }

// ── reduce-motion bayrağı (matchMedia stub'ı okur) ──────────────────────────
var _reducedMotion = false;

// ── AudioContext mock: çağrıları kaydet ───────────────────────────────────────
var _audioCalls = [];
function makeOscillator(){
  var o = {
    type: 'sine',
    frequency: {
      value: 0,
      setValueAtTime: function(v,t){ _audioCalls.push({type:'freq-set', v:v, t:t}); }
    },
    connect: function(dest){ _audioCalls.push({type:'osc-connect', dest:dest}); },
    start: function(t){ _audioCalls.push({type:'osc-start', t:t}); },
    stop: function(t){ _audioCalls.push({type:'osc-stop', t:t}); }
  };
  return o;
}
function makeGain(){
  var g = {
    gain: {
      value: 0,
      setValueAtTime: function(v,t){ _audioCalls.push({type:'gain-set', v:v, t:t}); },
      linearRampToValueAtTime: function(v,t){ _audioCalls.push({type:'gain-linear', v:v, t:t}); },
      exponentialRampToValueAtTime: function(v,t){ _audioCalls.push({type:'gain-ramp', v:v, t:t}); }
    },
    connect: function(dest){ _audioCalls.push({type:'gain-connect', dest:dest}); }
  };
  return g;
}
function MockAudioContext(){
  this.state = 'running';
  this.currentTime = 1.0;
  this.destination = 'destination';
  this.createOscillator = function(){ _audioCalls.push({type:'create-oscillator'}); return makeOscillator(); };
  this.createGain = function(){ _audioCalls.push({type:'create-gain'}); return makeGain(); };
  this.resume = function(){ _audioCalls.push({type:'resume'}); return Promise.resolve(); };
}

// ── Test yardımcıları ───────────────────────────────────────────────────────
var passed = 0, failed = 0;
function ok(name, cond, detail){
  if (cond) { passed++; console.log('  ✓ '+name); }
  else { failed++; console.log('  ✗ '+name + (detail ? ' — '+detail : '')); }
}
function clearCalls(){ _audioCalls.length = 0; }
function oscCount(){ return _audioCalls.filter(function(c){ return c.type==='create-oscillator'; }).length; }
function gainCount(){ return _audioCalls.filter(function(c){ return c.type==='create-gain'; }).length; }
function setSettings(s){ window.SeymaState = { data: { settings: s || {} } }; }
function setReducedMotion(v){ _reducedMotion = !!v; }

// ── Gerçek mediaFx.js modülünü taze yükler (CTX closure'ı sıfırlar) ─────────
function loadMediaFx(){
  var src = fs.readFileSync(path.join(repoRoot,'app/core/mediaFx.js'),'utf8');
  // IIFE'yi global window bağlamında çalıştır; window.SeyAudio/SeyHaptics/SeyFx yazar.
  (0, eval)(src);
}

console.log('\n=== Premium Audio FX Tests (gerçek mediaFx.js) ===\n');

// ── Test 1: API yüzeyi tanımlı ve çağrılabilir ──────────────────────────────
console.log('[1] SeyAudio API yüzeyi tanımlı');
(function(){
  window.AudioContext = MockAudioContext;
  window.webkitAudioContext = null;
  setSettings({ premiumAtmosphere: true, uiSounds: true });
  setReducedMotion(false);
  loadMediaFx();
  ok('SeyAudio var', !!window.SeyAudio);
  ok('SeyAudio.tap fonksiyonu var', typeof window.SeyAudio.tap === 'function');
  ok('SeyAudio.success fonksiyonu var', typeof window.SeyAudio.success === 'function');
  ok('SeyAudio.warning fonksiyonu var', typeof window.SeyAudio.warning === 'function');
  ok('SeyAudio.bell fonksiyonu var', typeof window.SeyAudio.bell === 'function');
  ok('SeyAudio.voice fonksiyonu var', typeof window.SeyAudio.voice === 'function');
  // FX-P-53: ambient artık motor nesnesidir (start/stop/isSupported/isEnabled).
  ok('SeyAudio.ambient motor yüzeyi var', !!window.SeyAudio.ambient && typeof window.SeyAudio.ambient.start === 'function' && typeof window.SeyAudio.ambient.stop === 'function');
  ok('SeyAudio.ctx getter var', typeof Object.getOwnPropertyDescriptor(window.SeyAudio, 'ctx') === 'object');
})();

// ── Test 2: premiumAtmosphere=false iken sessiz ─────────────────────────────
console.log('\n[2] settings.premiumAtmosphere === false iken sessiz');
(function(){
  setSettings({ premiumAtmosphere: false, uiSounds: true });
  setReducedMotion(false);
  loadMediaFx();
  clearCalls();
  window.SeyAudio.tap();
  window.SeyAudio.success();
  window.SeyAudio.warning();
  window.SeyAudio.bell();
  ok('premiumAtmosphere=false iken createOscillator çağrılmadı', oscCount()===0,
    'oscillator çağrısı: '+oscCount());
  ok('premiumAtmosphere=false iken createGain çağrılmadı', gainCount()===0,
    'gain çağrısı: '+gainCount());
  ok('SeyFx.isPremiumFxEnabled() false', window.SeyFx.isPremiumFxEnabled() === false);
})();

// ── Test 3: uiSounds=false iken sessiz ──────────────────────────────────────
console.log('\n[3] settings.uiSounds === false iken sessiz');
(function(){
  setSettings({ premiumAtmosphere: true, uiSounds: false });
  setReducedMotion(false);
  loadMediaFx();
  clearCalls();
  window.SeyAudio.tap();
  window.SeyAudio.success();
  window.SeyAudio.warning();
  window.SeyAudio.bell();
  ok('uiSounds=false iken createOscillator çağrılmadı', oscCount()===0,
    'oscillator çağrısı: '+oscCount());
})();

// ── Test 4: prefers-reduced-motion: reduce iken success/warning/bell sessiz ──
console.log('\n[4] prefers-reduced-motion: reduce iken success/warning/bell sessiz');
(function(){
  setSettings({ premiumAtmosphere: true, uiSounds: true });
  setReducedMotion(true);
  loadMediaFx();
  clearCalls();
  window.SeyAudio.success();
  window.SeyAudio.warning();
  window.SeyAudio.bell();
  ok('reduce-motion iken success/warning/bell createOscillator çağırmadı', oscCount()===0,
    'oscillator çağrısı: '+oscCount());
  ok('SeyFx.isPremiumFxEnabled() false (reduce-motion)', window.SeyFx.isPremiumFxEnabled() === false);
})();

// ── Test 5: reduce-motion iken tap() erişilebilirlik istisnası çalar ────────
console.log('\n[5] reduce-motion iken tap() (bilinçli etkileşim) çalar');
(function(){
  setSettings({ premiumAtmosphere: true, uiSounds: true });
  setReducedMotion(true);
  loadMediaFx();
  clearCalls();
  window.SeyAudio.tap();
  ok('reduce-motion iken tap() 1 oscillator üretir', oscCount()===1,
    'oscillator çağrısı: '+oscCount());
})();

// ── Test 6: success() 2 nota (arpejio) üretir ───────────────────────────────
console.log('\n[6] success() 2 oscillator (arpejio) üretir');
(function(){
  setSettings({ premiumAtmosphere: true, uiSounds: true });
  setReducedMotion(false);
  loadMediaFx();
  clearCalls();
  window.SeyAudio.success();
  ok('success() 2 oscillator oluşturur', oscCount()===2, 'oscillator sayısı: '+oscCount());
  ok('success() 2 gain oluşturur', gainCount()===2, 'gain sayısı: '+gainCount());
})();

// ── Test 7: tap() 523 Hz triangle üretir ────────────────────────────────────
console.log('\n[7] tap() 523 Hz triangle üretir');
(function(){
  setSettings({ premiumAtmosphere: true, uiSounds: true });
  setReducedMotion(false);
  loadMediaFx();
  clearCalls();
  window.SeyAudio.tap();
  ok('tap() 1 oscillator oluşturur', oscCount()===1, 'oscillator sayısı: '+oscCount());
  // createOscillator kaydından sonraki ilk freq-set değeri 523 olmalı
  var freq = 0;
  for(var i=0;i<_audioCalls.length;i++){
    if(_audioCalls[i].type==='create-oscillator'){ i++; while(i<_audioCalls.length && _audioCalls[i].type!=='freq-set') i++; if(i<_audioCalls.length) freq=_audioCalls[i].v; break; }
  }
  ok('tap() 523 Hz üretir', freq===523, 'freq='+freq);
})();

// ── Test 8: bell() 2 oscillator (ana + LFO vibrato) üretir ──────────────────
console.log('\n[8] bell() 2 oscillator (ana + LFO) üretir');
(function(){
  setSettings({ premiumAtmosphere: true, uiSounds: true });
  setReducedMotion(false);
  loadMediaFx();
  clearCalls();
  window.SeyAudio.bell();
  ok('bell() 2 oscillator oluşturur', oscCount()===2, 'oscillator sayısı: '+oscCount());
})();

// ── Test 9: AudioContext yoksa graceful no-op ─────────────────────────────
console.log('\n[9] AudioContext yoksa graceful no-op');
(function(){
  window.AudioContext = null;
  window.webkitAudioContext = null;
  setSettings({ premiumAtmosphere: true, uiSounds: true });
  setReducedMotion(false);
  loadMediaFx();
  clearCalls();
  var threw = false;
  try { window.SeyAudio.tap(); window.SeyAudio.success(); window.SeyAudio.bell(); } catch(e){ threw = true; }
  ok('AudioContext yokken hata fırlatmaz', !threw);
  ok('AudioContext yokken hiç çağrı olmaz', _audioCalls.length===0, 'calls: '+_audioCalls.length);
})();

// ── Test 10: app.js SeyAudio çağrı noktaları var ────────────────────────────
console.log('\n[10] app.js SeyAudio çağrı noktaları');
(function(){
  var appSrc = fs.readFileSync(path.join(repoRoot,'app.js'),'utf8');
  var zikirSrc = fs.readFileSync(path.join(repoRoot,'app/core/zikir.js'),'utf8');
  var fxSrc = appSrc+'\n'+zikirSrc;
  var tap = fxSrc.indexOf('SeyAudio.tap') >= 0;
  var success = appSrc.indexOf('SeyAudio.success') >= 0;
  var warning = appSrc.indexOf('SeyAudio.warning') >= 0;
  var bell = appSrc.indexOf('SeyAudio.bell') >= 0;
  ok('Zikirmatik/app SeyAudio.tap çağrı noktası var', tap);
  ok('app.js SeyAudio.success çağrı noktası var', success);
  ok('app.js SeyAudio.warning çağrı noktası var', warning);
  ok('app.js SeyAudio.bell çağrı noktası var', bell);
})();

console.log('\n=== Özet ===');
console.log('Passed: '+passed+' / '+(passed+failed));
process.exit(failed ? 1 : 0);
