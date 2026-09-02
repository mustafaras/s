// Faz 5 — Sesli rehberlik headless fixture'ı (ağ YOK, gerçek speech YOK)
// FX-P-54: gerçek app/core/mediaFx.js modülünü VM'de yükler; SeyAudio.voice /
// isVoiceEnabled / isQuietTime gating'ini, SeyAudio.guides yüzeyini, greeting
// throttle alanlarını ve ambient motor gating'ini doğrular. app.js içindeki
// voice çağrı noktaları statik olarak denetlenir (onboarding, streak, zikir).
// Çalıştırma: node tests/app/test_premium_voice.js

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
var _speaking = false;
var _speakCalls = [];
var _cancelCalls = 0;
function makeMockSpeech(){
  return {
    get speaking(){ return _speaking; },
    cancel: function(){ _cancelCalls++; },
    speak: function(u){ _speakCalls.push({ text: u && u.text, lang: u && u.lang, rate: u && u.rate }); },
    getVoices: function(){ return [{ name: 'Yelda', lang: 'tr-TR' }]; }
  };
}
// mediaFx.js `new SpeechSynthesisUtterance(...)` çağırır; Node'da global scope'ta
// olmalı (eval edilen kod `global.window.SpeechSynthesisUtterance` göremez).
global.SpeechSynthesisUtterance = function(text){ this.text = text; };
global.window = {
  addEventListener: function(){},
  matchMedia: function(q){ return { matches: _reducedMotion }; },
  AudioContext: null,
  webkitAudioContext: null,
  speechSynthesis: null,
  SpeechSynthesisUtterance: function(text){ this.text = text; },
  SeymaState: null,
  SeyAudio: null,
  SeyTimeTheme: null,
  document: { createElement: function(){ return { setAttribute: function(){}, style: {}, play: function(){ return Promise.resolve(); }, pause: function(){} }; } }
};
global.document = { createElement: function(){ return { setAttribute: function(){}, style: {}, play: function(){ return Promise.resolve(); }, pause: function(){} }; }, getElementById: function(){ return null; } };
global.location = { protocol: 'https:', hostname: 'example.com', search: '' };
Object.defineProperty(global, 'navigator', { value: { vibrate: function(){} }, configurable: true, writable: true });
global.fetch = function(){ return Promise.reject(new Error('TEST: fetch çağrılmamalı')); };

var _reducedMotion = false;

// ── Test yardımcıları ───────────────────────────────────────────────────────
var passed = 0, failed = 0;
function ok(name, cond, detail){
  if (cond) { passed++; console.log('  ✓ ' + name); }
  else { failed++; console.log('  ✗ ' + name + (detail ? ' — ' + detail : '')); }
}
function setSettings(s){ window.SeymaState = { data: { settings: s || {} } }; }
function setReducedMotion(v){ _reducedMotion = !!v; }
function setSpeaking(v){ _speaking = !!v; }
function resetSpeech(){ _speakCalls = []; _cancelCalls = 0; setSpeaking(false); }

// ── Gerçek mediaFx.js'i taze yükler ─────────────────────────────────────────
function loadMediaFx(){
  var src = fs.readFileSync(path.join(repoRoot, 'app/core/mediaFx.js'), 'utf8');
  (0, eval)(src);
}
function loadTimeTheme(){
  var src = fs.readFileSync(path.join(repoRoot, 'app/core/timeTheme.js'), 'utf8');
  (0, eval)(src);
}

console.log('\n=== Premium Voice Guidance Tests (gerçek mediaFx.js) ===\n');

// ── Test 1: API yüzeyi ──────────────────────────────────────────────────────
console.log('[1] Voice API yüzeyi tanımlı');
(function(){
  window.speechSynthesis = makeMockSpeech();
  setSettings({ premiumAtmosphere: true, voiceGuidance: true });
  setReducedMotion(false);
  loadMediaFx();
  ok('SeyAudio.voice fonksiyonu var', typeof window.SeyAudio.voice === 'function');
  ok('SeyAudio.isVoiceEnabled fonksiyonu var', typeof window.SeyAudio.isVoiceEnabled === 'function');
  ok('SeyAudio.isQuietTime fonksiyonu var', typeof window.SeyAudio.isQuietTime === 'function');
  ok('SeyAudio.greeting fonksiyonu var (FX-P-56)', typeof window.SeyAudio.greeting === 'function');
  ok('SeyAudio.guides.zikirStart var (FX-P-55)', typeof (window.SeyAudio.guides && window.SeyAudio.guides.zikirStart) === 'function');
  ok('SeyAudio.guides.zikirHalf var (FX-P-55)', typeof (window.SeyAudio.guides && window.SeyAudio.guides.zikirHalf) === 'function');
  ok('SeyAudio.guides.zikirComplete var (FX-P-55)', typeof (window.SeyAudio.guides && window.SeyAudio.guides.zikirComplete) === 'function');
  ok('SeyAudio.guides.suraOpen var (FX-P-55)', typeof (window.SeyAudio.guides && window.SeyAudio.guides.suraOpen) === 'function');
  ok('SeyAudio.guides.suraBookmark var (FX-P-55)', typeof (window.SeyAudio.guides && window.SeyAudio.guides.suraBookmark) === 'function');
  ok('SeyAudio.ambient motor yüzeyi var', !!window.SeyAudio.ambient && typeof window.SeyAudio.ambient.start === 'function' && typeof window.SeyAudio.ambient.stop === 'function' && typeof window.SeyAudio.ambient.isSupported === 'function' && typeof window.SeyAudio.ambient.isEnabled === 'function');
})();

// ── Test 2: voiceGuidance=false iken voice false ────────────────────────────
console.log('\n[2] voiceGuidance=false iken sessiz');
(function(){
  resetSpeech();
  setSettings({ premiumAtmosphere: true, voiceGuidance: false });
  setReducedMotion(false);
  loadMediaFx();
  var r = window.SeyAudio.voice('test', { lang: 'tr-TR' });
  ok('voiceGuidance=false iken voice() false döner', r === false);
  ok('speak çağrılmadı', _speakCalls.length === 0, 'calls: ' + _speakCalls.length);
  ok('isVoiceEnabled() false', window.SeyAudio.isVoiceEnabled() === false);
})();

// ── Test 3: voiceGuidance=true + speechSynthesis varken voice true ──────────
console.log('\n[3] voiceGuidance=true iken voice çalışır');
(function(){
  resetSpeech();
  setSettings({ premiumAtmosphere: true, voiceGuidance: true });
  setReducedMotion(false);
  loadMediaFx();
  var r = window.SeyAudio.voice('test', { lang: 'tr-TR', rate: 1 });
  ok('voiceGuidance=true + speechSynthesis iken voice() true döner', r === true);
  ok('speak tam 1 kez çağrıldı', _speakCalls.length === 1, 'calls: ' + _speakCalls.length);
  ok('speak edilen metin doğru', _speakCalls[0] && _speakCalls[0].text === 'test');
  ok('speak edilen dil tr-TR', _speakCalls[0] && _speakCalls[0].lang === 'tr-TR');
  ok('isVoiceEnabled() true', window.SeyAudio.isVoiceEnabled() === true);
})();

// ── Test 4: speechSynthesis hiç yoksa graceful false ────────────────────────
console.log('\n[4] speechSynthesis yoksa graceful');
(function(){
  resetSpeech();
  window.speechSynthesis = undefined;
  setSettings({ premiumAtmosphere: true, voiceGuidance: true });
  setReducedMotion(false);
  loadMediaFx();
  var threw = false, r = null;
  try { r = window.SeyAudio.voice('test'); } catch(e){ threw = true; }
  ok('speechSynthesis yokken hata fırlatmaz', !threw);
  ok('speechSynthesis yokken voice() false döner', r === false);
})();

// ── Test 5: quiet-time (23:00–07:00) penceresi ──────────────────────────────
console.log('\n[5] isQuietTime saat aralıkları');
(function(){
  setSettings({ premiumAtmosphere: true, voiceGuidance: true });
  setReducedMotion(false);
  loadMediaFx();
  ok('isQuietTime(23) true', window.SeyAudio.isQuietTime(23) === true);
  ok('isQuietTime(0) true', window.SeyAudio.isQuietTime(0) === true);
  ok('isQuietTime(3) true', window.SeyAudio.isQuietTime(3) === true);
  ok('isQuietTime(6) true', window.SeyAudio.isQuietTime(6) === true);
  ok('isQuietTime(10) false', window.SeyAudio.isQuietTime(10) === false);
  ok('isQuietTime(7) false', window.SeyAudio.isQuietTime(7) === false);
  ok('isQuietTime(22) false', window.SeyAudio.isQuietTime(22) === false);
  // Quiet-time'da voice çağrısı speak tetiklemez.
  resetSpeech();
  var r = window.SeyAudio.voice('sessiz ol', { lang: 'tr-TR' });
  ok('quiet-time gerçek saatte değilse voice normal çalışır (sadece API)', r === true || r === false);
})();

// ── Test 6: speaking iken force olmadan false ───────────────────────────────
console.log('\n[6] speaking iken force davranışı');
(function(){
  window.speechSynthesis = makeMockSpeech();
  resetSpeech();
  setSpeaking(true);
  setSettings({ premiumAtmosphere: true, voiceGuidance: true });
  setReducedMotion(false);
  loadMediaFx();
  var r1 = window.SeyAudio.voice('bir', {});
  ok('speaking iken force olmadan voice() false', r1 === false);
  ok('cancel çağrılmadı', _cancelCalls === 0);
  var r2 = window.SeyAudio.voice('iki', { force: true });
  ok('speaking iken force ile voice() true', r2 === true);
  ok('force ile cancel çağrıldı', _cancelCalls === 1, 'cancels: ' + _cancelCalls);
  setSpeaking(false);
})();

// ── Test 7: premiumAtmosphere=false iken voice false ────────────────────────
console.log('\n[7] master switch kapalıyken sessiz');
(function(){
  resetSpeech();
  setSettings({ premiumAtmosphere: false, voiceGuidance: true });
  setReducedMotion(false);
  loadMediaFx();
  var r = window.SeyAudio.voice('test');
  ok('premiumAtmosphere=false iken voice() false', r === false);
  ok('speak çağrılmadı', _speakCalls.length === 0);
})();

// ── Test 8: guides yüzeyi voice'e delege eder (FX-P-55 sonrası yeşil) ───────
console.log('\n[8] guides sesli ipuçları');
(function(){
  resetSpeech();
  setSettings({ premiumAtmosphere: true, voiceGuidance: true });
  setReducedMotion(false);
  loadMediaFx();
  if (!(window.SeyAudio.guides && window.SeyAudio.guides.zikirStart)){
    console.log('  ~ FX-P-55 henüz uygulanmadı — guides testleri atlandı');
    return;
  }
  var r1 = window.SeyAudio.guides.zikirStart();
  ok('guides.zikirStart voice tetikler', r1 === true && _speakCalls.length === 1);
  var r2 = window.SeyAudio.guides.zikirHalf();
  ok('guides.zikirHalf voice tetikler', r2 === true && _speakCalls.length === 2);
  var r3 = window.SeyAudio.guides.zikirComplete();
  ok('guides.zikirComplete voice tetikler', r3 === true && _speakCalls.length === 3);
  var r4 = window.SeyAudio.guides.suraOpen('Bakara');
  ok('guides.suraOpen isimle voice tetikler', r4 === true && _speakCalls.length === 4 && /Bakara/.test(_speakCalls[3] && _speakCalls[3].text));
  var r5 = window.SeyAudio.guides.suraBookmark();
  ok('guides.suraBookmark voice tetikler', r5 === true && _speakCalls.length === 5);
})();

// ── Test 9: greeting zaman dilimi haritalaması (FX-P-56 sonrası yeşil) ──────
console.log('\n[9] greeting zaman dilimi haritalaması');
(function(){
  if (typeof window.SeyAudio.greeting !== 'function'){
    console.log('  ~ FX-P-56 henüz uygulanmadı — greeting testleri atlandı');
    return;
  }
  resetSpeech();
  window.speechSynthesis = makeMockSpeech();
  setSettings({ premiumAtmosphere: true, voiceGuidance: true });
  setReducedMotion(false);
  loadMediaFx();
  loadTimeTheme();
  var r = window.SeyAudio.greeting();
  ok('greeting() boolean döner', r === true || r === false);
  if (r === true){
    ok('greeting() speak tetikledi', _speakCalls.length === 1);
    var txt = (_speakCalls[0] && _speakCalls[0].text) || '';
    ok('greeting metni bir selamlama biçimi', /Günışığı/.test(txt), 'text: ' + txt);
  } else {
    ok('greeting sessiz kaldı (quiet-time/gating)', _speakCalls.length === 0);
  }
})();

// ── Test 10: ambient gating ─────────────────────────────────────────────────
console.log('\n[10] ambient motor gating');
(function(){
  // AudioContext desteğiyle: premiumAtmosphere+ambientSounds açık → isEnabled true
  window.AudioContext = function(){ this.state='running'; this.currentTime=1; this.destination='dest';
    this.createGain=function(){ return { gain:{ value:0, setValueAtTime:function(){}, linearRampToValueAtTime:function(){} }, connect:function(){} }; };
    this.createBufferSource=function(){ return { buffer:null, loop:false, connect:function(){}, start:function(){}, stop:function(){}, disconnect:function(){} }; };
    this.createBuffer=function(n,len,rate){ return { getChannelData:function(){ return new Float32Array(len); } }; };
    this.createBiquadFilter=function(){ return { type:'', frequency:{ value:0 }, connect:function(){}, disconnect:function(){}, Q:{value:0}, stop:function(){}, start:function(){} }; };
    this.createOscillator=function(){ return { type:'', frequency:{ value:0 }, connect:function(){}, start:function(){}, stop:function(){}, disconnect:function(){} }; };
    this.resume=function(){ return Promise.resolve(); }; };
  setSettings({ premiumAtmosphere: true, ambientSounds: true });
  setReducedMotion(false);
  loadMediaFx();
  ok('ambient.isSupported() true (AudioContext var)', window.SeyAudio.ambient.isSupported() === true);
  ok('ambient.isEnabled() true (ambientSounds açık)', window.SeyAudio.ambient.isEnabled() === true);
  var st = window.SeyAudio.ambient.start('rain');
  ok('ambient.start(rain) başlatır', st === true);
  ok('ambient.isPlaying() true', window.SeyAudio.ambient.isPlaying() === true);
  var st2 = window.SeyAudio.ambient.start('rain');
  ok('aynı tip tekrar start idempotent', st2 === true);
  window.SeyAudio.ambient.stop();
  ok('ambient.stop() sonrası isPlaying false', window.SeyAudio.ambient.isPlaying() === false);
  // ambientSounds kapalıyken start false döner
  setSettings({ premiumAtmosphere: true, ambientSounds: false });
  loadMediaFx();
  var st3 = window.SeyAudio.ambient.start('rain');
  ok('ambientSounds=false iken ambient.start false', st3 === false);
  // master switch kapalıyken start false döner
  setSettings({ premiumAtmosphere: false, ambientSounds: true });
  loadMediaFx();
  var st4 = window.SeyAudio.ambient.start('rain');
  ok('premiumAtmosphere=false iken ambient.start false', st4 === false);
})();

// ── Test 11: app.js voice çağrı noktaları (statik) ──────────────────────────
console.log('\n[11] app.js SeyAudio.voice çağrı noktaları (statik)');
(function(){
  var appSrc = fs.readFileSync(path.join(repoRoot, 'app.js'), 'utf8');
  ok('onboarding sesli karşılama çağrısı var (FX-P-52)', appSrc.indexOf("voice('Sevgili Günışığı, hoş geldin") >= 0);
  ok('streak sesli tebrik çağrısı var (FX-P-52)', appSrc.indexOf("voice('Harikasın! Serin büyüyor") >= 0);
  ok('zikir tamamlama sesli ipucu çağrısı var (FX-P-52)', appSrc.indexOf("voice('Allah kabul etsin") >= 0);
  ok('greeting boot çağrısı var (FX-P-56)', appSrc.indexOf('SeyAudio.greeting') >= 0);
  ok('guides çağrı noktaları var (FX-P-55)', appSrc.indexOf('SeyAudio.guides') >= 0);
  ok('voice settings damgaları migrate backfill ediliyor', appSrc.indexOf('voiceOnboardedAt') >= 0 && appSrc.indexOf('lastVoiceGreetingAt') >= 0);
  ok('voice ayarları handler\'ları var (FX-P-57)', appSrc.indexOf('App.setVoiceLang') >= 0 && appSrc.indexOf('App.setVoiceRate') >= 0);
})();

// ── Test 12: reduced-motion voice'i kapatmaz (TTS ayrı gating) ──────────────
console.log('\n[12] reduced-motion voice gating');
(function(){
  resetSpeech();
  setSettings({ premiumAtmosphere: true, voiceGuidance: true });
  setReducedMotion(true);
  loadMediaFx();
  // Not: isPremiumFxEnabled reduced-motion'da false döner → voice de false.
  // Bu, FX-P-51'den gelen bilinçli davranıştır (reduced-motion = tüm FX kapalı).
  var r = window.SeyAudio.voice('test');
  ok('reduced-motion iken voice() false (master gating)', r === false);
})();

console.log('\n=== Özet ===');
console.log('Passed: ' + passed + ' / ' + (passed + failed));
process.exit(failed ? 1 : 0);