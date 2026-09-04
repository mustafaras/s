// Faz 6 — Ayarlar persistence & gating fixture'ı (ağ YOK)
// FX-P-62: gerçek app/core/mediaFx.js + timeTheme.js modüllerini VM'de yükler;
// premiumAtmosphere master switch'inin tüm FX gating'lerini nasıl kilitlediğini
// doğrular. app.js'teki App.toggleSetting yüzeyi statik denetlenir.
// Çalıştırma: node tests/app/test_premium_settings.js

'use strict';
var fs = require('fs');
var path = require('path');
var repoRoot = require('../repo-root');

// ── Mock ortam ──────────────────────────────────────────────────────────────
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
  SeymaState: null,
  SeyAudio: null,
  SeyFx: null,
  SeyHaptics: null,
  SeyTimeTheme: null
};
global.document = { getElementById: function(){ return null; }, createElement: function(){ return { style:{}, setAttribute:function(){} }; } };
global.location = { protocol:'https:', hostname:'example.com', search:'' };
Object.defineProperty(global, 'navigator', { value: { vibrate: function(){} }, configurable: true, writable: true });
global.fetch = function(){ return Promise.reject(new Error('TEST: fetch çağrılmamalı')); };
global.SpeechSynthesisUtterance = function(text){ this.text = text; };

var _reducedMotion = false;

// ── Yardımcılar ─────────────────────────────────────────────────────────────
var passed = 0, failed = 0;
function ok(name, cond, detail){
  if (cond) { passed++; console.log('  ✓ ' + name); }
  else { failed++; console.log('  ✗ ' + name + (detail ? ' — ' + detail : '')); }
}
function setSettings(s){ window.SeymaState = { data: { settings: s || {} } }; }
function setReducedMotion(v){ _reducedMotion = !!v; }
function loadMediaFx(){
  var src = fs.readFileSync(path.join(repoRoot, 'app/core/mediaFx.js'), 'utf8');
  (0, eval)(src);
}
function loadTimeTheme(){
  var src = fs.readFileSync(path.join(repoRoot, 'app/core/timeTheme.js'), 'utf8');
  (0, eval)(src);
}

console.log('\n=== Premium Ayarlar Gating Testleri (FX-P-62) ===\n');

// ── Test 1: SeyFx gating matrisi ────────────────────────────────────────────
console.log('[1] premiumAtmosphere master switch — SeyFx gating');
(function(){
  setSettings({ premiumAtmosphere: true });
  setReducedMotion(false);
  loadMediaFx();
  ok('premium=true iken isPremiumFxEnabled true', window.SeyFx.isPremiumFxEnabled() === true);
  ok('premium=true iken shouldAnimate true', window.SeyFx.shouldAnimate() === true);

  setSettings({ premiumAtmosphere: false });
  loadMediaFx();
  ok('premium=false iken isPremiumFxEnabled false', window.SeyFx.isPremiumFxEnabled() === false);
  ok('premium=false iken shouldAnimate false', window.SeyFx.shouldAnimate() === false);
  ok('premium=false iken ambientAllowed false', window.SeyFx.ambientAllowed() === false);
  ok('premium=false iken isSoundAllowed false', window.SeyFx.isSoundAllowed() === false);

  setSettings({ premiumAtmosphere: true });
  setReducedMotion(true);
  loadMediaFx();
  ok('reduced-motion iken isPremiumFxEnabled false', window.SeyFx.isPremiumFxEnabled() === false);
})();

// ── Test 2: SeyAudio ses gating ─────────────────────────────────────────────
console.log('\n[2] uiSounds — ses gating');
(function(){
  setSettings({ premiumAtmosphere: true, uiSounds: true });
  setReducedMotion(false);
  loadMediaFx();
  ok('uiSounds=true iken isSoundAllowed true', window.SeyFx.isSoundAllowed() === true);
  setSettings({ premiumAtmosphere: true, uiSounds: false });
  loadMediaFx();
  ok('uiSounds=false iken isSoundAllowed false', window.SeyFx.isSoundAllowed() === false);
})();

// ── Test 3: Sesli rehberlik gating (bulut-önce kontrat) ─────────────────────
console.log('\n[3] voiceGuidance — sesli rehberlik gating');
(function(){
  setSettings({ premiumAtmosphere: true, voiceGuidance: true });
  setReducedMotion(false);
  loadMediaFx();
  ok('voiceGuidance=true iken isVoiceEnabled false (speechSynthesis mock yok)', window.SeyAudio.isVoiceEnabled() === false);
  // speechSynthesis varsa true olmalı
  window.speechSynthesis = { speaking: false, cancel: function(){}, speak: function(){}, getVoices: function(){ return []; } };
  loadMediaFx();
  ok('speechSynthesis varken isVoiceEnabled true', window.SeyAudio.isVoiceEnabled() === true);
  // Bulut-önce: anahtar/voiceCloudTts yoksa voice() false — yerel sese düşmez
  var r = window.SeyAudio.voice('x');
  ok('bulut ayarı yokken voice() false (yerel sese düşmez)', r === false);
  // voiceLocalFallback=true ile düşer
  setSettings({ premiumAtmosphere: true, voiceGuidance: true, voiceLocalFallback: true });
  loadMediaFx();
  var rl = window.SeyAudio.voice('x');
  ok('voiceLocalFallback=true iken voice() yerel sese düşer', rl === true);
})();

// ── Test 4: Ambiyans gating ─────────────────────────────────────────────────
console.log('\n[4] ambientSounds — ambiyans gating');
(function(){
  window.AudioContext = function(){ this.state='running'; this.currentTime=1; this.destination='d';
    this.createGain=function(){ return { gain:{value:0,setValueAtTime:function(){},linearRampToValueAtTime:function(){}}, connect:function(){} }; };
    this.createBufferSource=function(){ return { buffer:null, loop:false, connect:function(){}, start:function(){}, stop:function(){}, disconnect:function(){} }; };
    this.createBuffer=function(n,l,r){ return { getChannelData:function(){ return new Float32Array(l); } }; };
    this.createBiquadFilter=function(){ return { type:'', frequency:{value:0}, connect:function(){}, disconnect:function(){} }; };
    this.createOscillator=function(){ return { type:'', frequency:{value:0}, connect:function(){}, start:function(){}, stop:function(){}, disconnect:function(){} }; };
    this.resume=function(){ return Promise.resolve(); }; };
  setSettings({ premiumAtmosphere: true, ambientSounds: true });
  setReducedMotion(false);
  loadMediaFx();
  ok('ambientSounds=true iken isEnabled true', window.SeyAudio.ambient.isEnabled() === true);
  setSettings({ premiumAtmosphere: true, ambientSounds: false });
  loadMediaFx();
  ok('ambientSounds=false iken isEnabled false', window.SeyAudio.ambient.isEnabled() === false);
  setSettings({ premiumAtmosphere: false, ambientSounds: true });
  loadMediaFx();
  var st = window.SeyAudio.ambient.start('rain');
  ok('premium=false iken ambient.start false (master kilidi)', st === false);
})();

// ── Test 5: SeyTimeTheme gating ─────────────────────────────────────────────
console.log('\n[5] timeTheme — zaman teması gating');
(function(){
  loadTimeTheme();
  ok('SeyTimeTheme.classForHour(5) dawn', window.SeyTimeTheme.classForHour(5) === 'theme-time-dawn');
  ok('SeyTimeTheme.classForHour(12) day', window.SeyTimeTheme.classForHour(12) === 'theme-time-day');
  ok('SeyTimeTheme.classForHour(18) dusk', window.SeyTimeTheme.classForHour(18) === 'theme-time-dusk');
  ok('SeyTimeTheme.classForHour(23) night', window.SeyTimeTheme.classForHour(23) === 'theme-time-night');
})();

// ── Test 6: Haptics gating ──────────────────────────────────────────────────
console.log('\n[6] richHaptics — haptics gating');
(function(){
  setSettings({ premiumAtmosphere: true, richHaptics: true });
  setReducedMotion(false);
  loadMediaFx();
  ok('SeyHaptics yüzeyi var', !!window.SeyHaptics && typeof window.SeyHaptics.tap === 'function');
  // navigator.vibrate mock'u ile çalma kanıtlanamaz ama no-op throw etmez:
  var threw = false;
  try { window.SeyHaptics.tap(); window.SeyHaptics.streak(); } catch(e){ threw = true; }
  ok('haptics çağrısı hata fırlatmaz', !threw);
})();

// ── Test 7: app.js App.toggleSetting yüzeyi (statik) ────────────────────────
console.log('\n[7] app.js ayarlar yüzeyi (statik)');
(function(){
  var appSrc = fs.readFileSync(path.join(repoRoot, 'app.js'), 'utf8');
  ok('App.toggleSetting handler tanımlı (FX-P-61)', appSrc.indexOf('App.toggleSetting=function') >= 0);
  ok('toggleSetting beyaz listesi premium alanları içeriyor', appSrc.indexOf("allowed={premiumAtmosphere:1,uiSounds:1,richHaptics:1,launchRitual:1,voiceGuidance:1,ambientSounds:1") >= 0);
  ok('ayarlar ekranında Premium Atmosfer kartı var', appSrc.indexOf('✨ Premium Atmosfer') >= 0);
  // HTML string içindeki onclick escape'li: App.toggleSetting(\'key\',deger)
  // Segmentli Açık/Kapalı çifti AÇIK DEĞER geçmek zorundadır: her iki düğme de
  // değersiz toggle çağırdığında "Kapalı"ya basmak anahtarı açıyordu.
  ok('master switch "Açık" segmenti açık değer geçiyor',
     appSrc.indexOf("App.toggleSetting(\\'premiumAtmosphere\\',true)") >= 0);
  ok('master switch "Kapalı" segmenti açık değer geçiyor',
     appSrc.indexOf("App.toggleSetting(\\'premiumAtmosphere\\',false)") >= 0);
  ok('master switch değersiz toggle\'a geri dönmedi',
     appSrc.indexOf("App.toggleSetting(\\'premiumAtmosphere\\')") < 0);
  // Alt FX satırları dinamik olarak row[0] ile üretiliyor (fxRows dizisi);
  // statik kontrol: fxRows tanımı tüm 5 anahtarı içeriyor + dinamik onclick şablonu mevcut.
  var fxRowsOk = ['uiSounds','richHaptics','launchRitual','voiceGuidance','ambientSounds'].every(function(k){
    return appSrc.indexOf("'"+k+"','") >= 0 || appSrc.indexOf("['"+k) >= 0;
  });
  var dynTpl = appSrc.indexOf("App.toggleSetting(\\''+row[0]+'\\')") >= 0;
  ok('alt FX satırları bağlı (fxRows dizisi + dinamik onclick şablonu)', fxRowsOk && dynTpl);
  ok('bulut ses anahtarı beyaz listede (voiceCloudTts)', appSrc.indexOf('voiceCloudTts:1') >= 0);
})();

// ── Test 8: Persistence simülasyonu ─────────────────────────────────────────
console.log('\n[8] persistence — settings localStorage kalıcılığı');
(function(){
  _ls = {};
  var KEY = 'seyma-reset-v1';
  var d = { version: 2, settings: { premiumAtmosphere: true, uiSounds: true, voiceGuidance: true } };
  localStorage.setItem(KEY, JSON.stringify(d));
  // "toggle" simülasyonu
  var loaded = JSON.parse(localStorage.getItem(KEY));
  loaded.settings.premiumAtmosphere = false;
  localStorage.setItem(KEY, JSON.stringify(loaded));
  var reloaded = JSON.parse(localStorage.getItem(KEY));
  ok('premiumAtmosphere=false kalıcı yazıldı', reloaded.settings.premiumAtmosphere === false);
  ok('diğer alanlar korunmuş', reloaded.settings.uiSounds === true && reloaded.settings.voiceGuidance === true);
  // FX motoru kalıcı değeri okuyor mu?
  setSettings(reloaded.settings);
  loadMediaFx();
  ok('motor kalıcı değeri okuyup FX kapalı', window.SeyFx.isPremiumFxEnabled() === false);
})();

console.log('\n=== Özet ===');
console.log('Passed: ' + passed + ' / ' + (passed + failed));
process.exit(failed ? 1 : 0);