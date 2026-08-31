const vm = require('vm');
const fs = require('fs');
const path = require('path');

function load(src){
  var code = fs.readFileSync(path.join(__dirname, '..', '..', src), 'utf8');
  return code;
}

function makeWindow(){
  var timers = [];
  return {
    navigator: { vibrate: function(p){ return true; } },
    matchMedia: function(q){ return { matches: false, addEventListener: function(){}, removeEventListener: function(){} }; },
    localStorage: { getItem: function(){ return null; }, setItem: function(){}, removeItem: function(){} },
    addEventListener: function(){},
    removeEventListener: function(){},
    setTimeout: function(fn,t){ timers.push(fn); return timers.length; },
    clearTimeout: function(){},
    setInterval: function(){ return 0; },
    clearInterval: function(){},
    document: { getElementById: function(){ return null; }, createElement: function(){ return { style:{}, setAttribute:function(){}, appendChild:function(){}, remove:function(){}, parentNode:null }; }, body: { appendChild:function(){} }, querySelector: function(){ return null; } },
    AudioContext: function(){ this.state='running'; this.resume=function(){ return Promise.resolve(); }; this.createOscillator=function(){ return { type:'', frequency:{setValueAtTime:function(){}}, connect:function(){}, start:function(){}, stop:function(){} }; }; this.createGain=function(){ return { gain:{setValueAtTime:function(){}, linearRampToValueAtTime:function(){}, exponentialRampToValueAtTime:function(){}}, connect:function(){} }; }; this.currentTime=0; },
    webkitAudioContext: function(){ return new window.AudioContext(); },
    speechSynthesis: { speak: function(){} },
    SpeechSynthesisUtterance: function(t){ this.text=t; this.lang=''; this.rate=1; this.pitch=1; }
  };
}

function boot(){
  var w = makeWindow();
  var ctx = vm.createContext(w);
  // Sabitler
  w.SEYMA_CONSTANTS = {};
  // constants.js IIFE'sini global window'a bağlamak için "window" adıyla çalıştır.
  vm.runInContext('var window = this; ' + load('app/core/constants.js'), ctx, { filename: 'constants.js' });
  // constants.js kendi window.SeymaConstants'ını oluşturur; eğer yoksa yedek.
  if (!w.SeymaConstants) w.SeymaConstants = { START_DATE: '2026-01-01' };
  // Uygulama durum mock'u
  w.data = { startDate: '2026-01-01', settings: { premiumAtmosphere:true, uiSounds:true, voiceGuidance:false, ambientSounds:false, richHaptics:true, launchRitual:true, haptics:true }, days: {} };
  w.ui = {};
  w.SeymaState = { data: w.data, ui: w.ui, getDay: function(d,i){ return w.data.days[d] || null; } };
  // Modüller
  vm.runInContext(load('app/core/dateUtils.js'), ctx, { filename: 'dateUtils.js' });
  vm.runInContext(load('app/core/helpers.js'), ctx, { filename: 'helpers.js' });
  vm.runInContext(load('app/core/mediaFx.js'), ctx, { filename: 'mediaFx.js' });
  vm.runInContext(load('app/core/timeTheme.js'), ctx, { filename: 'timeTheme.js' });
  return w;
}

function assert(cond, msg){ if(!cond){ console.error('FAIL: '+msg); process.exit(1); } }

var w = boot();

// dateUtils
assert(typeof w.SeymaDateUtils === 'object', 'SeymaDateUtils expose edilmemiş');
assert(w.SeymaDateUtils.todayStr() === new Date().toISOString().slice(0,10), 'todayStr yanlış');
assert(w.SeymaDateUtils.addDays('2026-08-31', 1) === '2026-09-01', 'addDays yanlış');
assert(w.SeymaDateUtils.diffDays('2026-08-31','2026-09-01') === 1, 'diffDays yanlış');
assert(w.SeymaDateUtils.pad(3) === '03', 'pad yanlış');
assert(w.SeymaDateUtils.shortDate('2026-08-31') === '31.08', 'shortDate yanlış');

// helpers
assert(typeof w.SeymaHelpers === 'object', 'SeymaHelpers expose edilmemiş');
assert(typeof w.SeymaHelpers.segTabs === 'function', 'segTabs fonksiyon değil');
assert(typeof w.SeymaHelpers.toast === 'function', 'toast fonksiyon değil');
assert(typeof w.SeymaHelpers.haptic === 'function', 'haptic fonksiyon değil');
var segHtml = w.SeymaHelpers.segTabs([['a','A'],['b','B']], 'a', 'App.foo', 'read');
assert(segHtml.indexOf('role="tablist"') >= 0, 'segTabs aria role eksik');
assert(segHtml.indexOf('onclick="App.foo') >= 0, 'segTabs handler eksik');
w.SeymaHelpers.haptic(10); // exception atmadan geçmeli

// mediaFx
assert(typeof w.SeyAudio === 'object', 'SeyAudio expose edilmemiş');
assert(typeof w.SeyHaptics === 'object', 'SeyHaptics expose edilmemiş');
assert(typeof w.SeyFx === 'object', 'SeyFx expose edilmemiş');
assert(typeof w.SeyAudio.tap === 'function', 'SeyAudio.tap yok');
assert(typeof w.SeyAudio.success === 'function', 'SeyAudio.success yok');
assert(typeof w.SeyAudio.voice === 'function', 'SeyAudio.voice yok');
assert(typeof w.SeyHaptics.tap === 'function', 'SeyHaptics.tap yok');
assert(w.SeyFx.isPremiumFxEnabled() === true, 'isPremiumFxEnabled true olmalı');

// timeTheme
assert(typeof w.SeyTimeTheme === 'object', 'SeyTimeTheme expose edilmemiş');
assert(w.SeyTimeTheme.classForHour(6) === 'theme-time-dawn', 'classForHour dawn yanlış');
assert(w.SeyTimeTheme.classForHour(12) === 'theme-time-day', 'classForHour day yanlış');
assert(w.SeyTimeTheme.classForHour(18) === 'theme-time-dusk', 'classForHour dusk yanlış');
assert(w.SeyTimeTheme.classForHour(23) === 'theme-time-night', 'classForHour night yanlış');

console.log('PASS: dateUtils/helpers/mediaFx/timeTheme boundary tests (12 assertions)');
