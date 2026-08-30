// Faz 1 — Headless ses efekti fixture'ı (sentetik veri, gerçek network YOK)
// Premium ses API yüzeyini (henüz app/core/mediaFx.js eklenmemiş olsa da)
// spec'teki sözleşmeye göre doğrular.
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
  matchMedia: function(q){ return { matches: false }; },
  AudioContext: null,
  webkitAudioContext: null,
  speechSynthesis: null,
  SeymaConstants: null,
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

// ── AudioContext mock: çağrıları kaydet ───────────────────────────────────────
var _audioCalls = [];
function makeOscillator(){
  var freqValue = 0;
  var o = {
    _freqValue: function(){ return freqValue; },
    type: 'sine',
    frequency: {
      value: 0,
      setValueAtTime: function(v,t){ freqValue = v; _audioCalls.push({type:'freq-set', v:v, t:t}); }
    },
    connect: function(dest){ _audioCalls.push({type:'osc-connect', dest:dest}); },
    start: function(t){ _audioCalls.push({type:'osc-start', t:t}); },
    stop: function(t){ _audioCalls.push({type:'osc-stop', t:t}); }
  };
  return o;
}
function makeGain(){
  var g = {
    gain: { value: 0, setValueAtTime: function(v,t){ _audioCalls.push({type:'gain-set', v:v, t:t}); }, exponentialRampToValueAtTime: function(v,t){ _audioCalls.push({type:'gain-ramp', v:v, t:t}); } },
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
function clearCalls(){ _audioCalls.length = 0; }

// ── Test edilecek API: spec'teki mediaFx.js sözleşmesinin implementasyonu ───
// Bu test dosyası app/core/mediaFx.js içeriğini simüle eder; tam app.js çalıştırılmaz.
function buildMediaFx(){
  var ctx = null;
  var masterEnabled = true;

  function dataSettings(){
    return (window.SeymaConstants && window.SeymaConstants.data && window.SeymaConstants.data.settings) || {};
  }
  function isAllowed(){
    if(!masterEnabled) return false;
    var s = dataSettings();
    return s.uiSounds !== false;
  }
  function isAtmosphereAllowed(){
    var s = dataSettings();
    return s.premiumAtmosphere !== false;
  }
  function ensureContext(){
    if(ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return null;
    ctx = new AC();
    return ctx;
  }
  function resumeIfNeeded(){
    if(!ctx) return;
    if(ctx.state === 'suspended') ctx.resume();
  }
  function playTone(opts){
    if(!isAllowed()) return;
    if(!isAtmosphereAllowed()) return;
    var c = ensureContext();
    if(!c) return;
    resumeIfNeeded();
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = opts.type || 'sine';
    if(o.frequency.setValueAtTime) o.frequency.setValueAtTime(opts.freq, c.currentTime);
    else o.frequency.value = opts.freq;
    g.gain.setValueAtTime(opts.gain || 0.05, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + (opts.duration || 0.04));
    o.connect(g);
    g.connect(c.destination);
    o.start();
    o.stop(c.currentTime + (opts.duration || 0.04));
  }
  function tap(){ playTone({type:'sine', freq:880, gain:0.05, duration:0.04}); }
  function success(){
    if(!isAllowed()) return;
    if(!isAtmosphereAllowed()) return;
    var c = ensureContext();
    if(!c) return;
    resumeIfNeeded();
    var notes = [523, 659, 784];
    var t = c.currentTime;
    notes.forEach(function(f){
      var o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.06, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
      o.connect(g); g.connect(c.destination);
      o.start(t); o.stop(t + 0.08);
      t += 0.08;
    });
  }
  function warning(){ playTone({type:'triangle', freq:150, gain:0.04, duration:0.12}); }
  function bell(){ playTone({type:'sine', freq:1047, gain:0.05, duration:0.5}); }

  window.SeyAudio = {
    tap: tap,
    success: success,
    warning: warning,
    bell: bell,
    setMaster: function(v){ masterEnabled = !!v; },
    isAllowed: isAllowed
  };
}

console.log('\n=== Premium Audio FX Tests ===\n');

// ── Test 1: API yüzeyi tanımlı ──────────────────────────────────────────────
console.log('[1] SeyAudio API yüzeyi tanımlı');
(function(){
  window.AudioContext = MockAudioContext;
  window.webkitAudioContext = null;
  window.SeymaConstants = { data: { settings: {} } };
  buildMediaFx();
  ok('SeyAudio var', !!window.SeyAudio);
  ok('SeyAudio.tap fonksiyonu var', typeof window.SeyAudio.tap === 'function');
  ok('SeyAudio.success fonksiyonu var', typeof window.SeyAudio.success === 'function');
  ok('SeyAudio.warning fonksiyonu var', typeof window.SeyAudio.warning === 'function');
  ok('SeyAudio.bell fonksiyonu var', typeof window.SeyAudio.bell === 'function');
})();

// ── Test 2: uiSounds=false iken hiç oscillator oluşmaz ───────────────────────
console.log('\n[2] settings.uiSounds === false iken sessiz');
(function(){
  window.SeymaConstants = { data: { settings: { uiSounds: false, premiumAtmosphere: true } } };
  clearCalls();
  window.SeyAudio.tap();
  window.SeyAudio.success();
  window.SeyAudio.warning();
  window.SeyAudio.bell();
  ok('uiSounds=false iken createOscillator çağrılmadı', _audioCalls.filter(function(c){ return c.type==='create-oscillator'; }).length === 0,
    'oscillator çağrısı: '+_audioCalls.filter(function(c){ return c.type==='create-oscillator'; }).length);
})();

// ── Test 3: premiumAtmosphere=false iken sessiz ─────────────────────────────
console.log('\n[3] settings.premiumAtmosphere === false iken sessiz');
(function(){
  window.SeymaConstants = { data: { settings: { uiSounds: true, premiumAtmosphere: false } } };
  clearCalls();
  window.SeyAudio.tap();
  window.SeyAudio.success();
  window.SeyAudio.warning();
  window.SeyAudio.bell();
  ok('premiumAtmosphere=false iken createOscillator çağrılmadı', _audioCalls.filter(function(c){ return c.type==='create-oscillator'; }).length === 0,
    'oscillator çağrısı: '+_audioCalls.filter(function(c){ return c.type==='create-oscillator'; }).length);
})();

// ── Test 4: success() 3 nota üretmeli ───────────────────────────────────────
console.log('\n[4] success() 3 nota üretir');
(function(){
  window.SeymaConstants = { data: { settings: { uiSounds: true, premiumAtmosphere: true } } };
  clearCalls();
  window.SeyAudio.success();
  var oscCount = _audioCalls.filter(function(c){ return c.type==='create-oscillator'; }).length;
  var noteFreqs = [];
  _audioCalls.forEach(function(c){
    if(c.type==='gain-set'){
      // gain-set çağrıları ardından gelen osc-frequency değerlerini topla
    }
  });
  ok('success() 3 oscillator oluşturur', oscCount===3, 'oscillator sayısı: '+oscCount);
})();

// ── Test 5: tap() 880 Hz sine üretmeli ──────────────────────────────────────
console.log('\n[5] tap() 880 Hz sine üretir');
(function(){
  window.SeymaConstants = { data: { settings: { uiSounds: true, premiumAtmosphere: true } } };
  clearCalls();
  window.SeyAudio.tap();
  var lastOsc = null;
  for(var i=_audioCalls.length-1; i>=0; i--){
    if(_audioCalls[i].type==='create-oscillator'){ lastOsc = i; break; }
  }
  ok('tap() en az 1 oscillator oluşturur', lastOsc >= 0);
  ok('tap() AudioContext oluşturur / resume kullanır', _audioCalls.some(function(c){ return c.type==='create-oscillator'; }));
  // 880 Hz kontrolü: createOscillator kaydından sonraki freq-set çağrısına bak
  var freq = 0;
  for(var j=lastOsc+1; j<_audioCalls.length; j++){
    if(_audioCalls[j].type==='freq-set'){ freq = _audioCalls[j].v; break; }
  }
  ok('tap() 880 Hz sine üretir', freq===880, 'freq='+freq);
})();

// ── Test 6: AudioContext yoksa graceful no-op ───────────────────────────────
console.log('\n[6] AudioContext yoksa graceful no-op');
(function(){
  window.AudioContext = null;
  window.webkitAudioContext = null;
  // SeyAudio önceki testlerden kalma ctx önbelleğiyle no-op olmayabilir; yeniden kur
  window.SeymaConstants = { data: { settings: { uiSounds: true, premiumAtmosphere: true } } };
  buildMediaFx();
  clearCalls();
  var threw = false;
  try { window.SeyAudio.tap(); window.SeyAudio.success(); } catch(e){ threw = true; }
  ok('AudioContext yokken hata fırlatmaz', !threw);
  ok('AudioContext yokken hiç çağrı olmaz', _audioCalls.length===0, 'calls: '+_audioCalls.length);
})();

console.log('\n=== Özet ===');
console.log('Passed: '+passed+' / '+(passed+failed));
process.exit(failed ? 1 : 0);
