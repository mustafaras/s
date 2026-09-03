'use strict';
// Faz -1.1 sınır testi: dateUtils modülü window.SeymaDateUtils üzerinde expose
// edilmiş ve temel tarih yardımcıları çalışıyor. Ayrıca seq 24'te bulunan 3
// kırık fonksiyonun (dayIndexFor / activeDate / curDay) B1 canlı-getter
// yüzeyine (window.SeymaState) hizalandığını ve state.js / syncGlue.js
// yüzeylerinin tanımlı olduğunu doğrular. helpers/mediaFx/timeTheme yüzeyleri
// de burada korunur (FX-P-01'den beri).
// Çalıştırma: node tests/app/test_date_utils_boundary.js

var fs = require('fs');
var path = require('path');
var vm = require('vm');
var repoRoot = require('../repo-root');

function load(rel){ return fs.readFileSync(path.join(repoRoot, rel), 'utf8'); }

var passed = 0, failed = 0;
function ok(name, cond, detail){
  if (cond) { passed++; console.log('  ✓ '+name); }
  else { failed++; console.log('  ✗ '+name + (detail ? ' — '+detail : '')); }
}

console.log('\n=== Faz -1.1 — DateUtils / Helpers / MediaFx / TimeTheme / State Sınır Testleri ===\n');

function makeWindow(){
  var timers = [];
  return {
    console: console,
    navigator: { vibrate: function(p){ return true; } },
    matchMedia: function(q){ return { matches: false, addEventListener: function(){}, removeEventListener: function(){} }; },
    localStorage: { getItem: function(){ return null; }, setItem: function(){}, removeItem: function(){} },
    addEventListener: function(){},
    removeEventListener: function(){},
    setTimeout: function(fn,t){ timers.push(fn); return timers.length; },
    clearTimeout: function(){},
    setInterval: function(){ return 0; },
    clearInterval: function(){},
    document: { getElementById: function(){ return null; }, createElement: function(){ return { style:{}, setAttribute:function(){}, appendChild:function(){}, remove:function(){}, parentNode:null }; }, body: { appendChild:function(){} }, querySelector: function(){ return null; }, querySelectorAll: function(){ return []; } },
    AudioContext: function(){ this.state='running'; this.resume=function(){ return Promise.resolve(); }; this.createOscillator=function(){ return { type:'', frequency:{setValueAtTime:function(){}}, connect:function(){}, start:function(){}, stop:function(){} }; }; this.createGain=function(){ return { gain:{setValueAtTime:function(){}, linearRampToValueAtTime:function(){}, exponentialRampToValueAtTime:function(){}}, connect:function(){} }; }; this.currentTime=0; },
    webkitAudioContext: function(){ return new window.AudioContext(); },
    speechSynthesis: { speak: function(){} },
    SpeechSynthesisUtterance: function(t){ this.text=t; this.lang=''; this.rate=1; this.pitch=1; }
  };
}

function boot(){
  var w = makeWindow();
  w.window = w;
  var ctx = vm.createContext(w);
  // constants.js IIFE'sini global window'a bağlamak için "window" adıyla çalıştır.
  vm.runInContext('var window = this; ' + load('app/core/constants.js'), ctx, { filename: 'constants.js' });
  // Modüller (app.js YOK — Faz -1.1'de henüz window'a expose edilmedi)
  vm.runInContext(load('app/core/dateUtils.js'), ctx, { filename: 'dateUtils.js' });
  vm.runInContext(load('app/core/state.js'), ctx, { filename: 'state.js' });
  vm.runInContext(load('app/core/syncGlue.js'), ctx, { filename: 'syncGlue.js' });
  vm.runInContext(load('app/core/helpers.js'), ctx, { filename: 'helpers.js' });
  vm.runInContext(load('app/core/mediaFx.js'), ctx, { filename: 'mediaFx.js' });
  vm.runInContext(load('app/core/timeTheme.js'), ctx, { filename: 'timeTheme.js' });
  return w;
}

var w = boot();

// ── dateUtils yüzeyi ──
(function(){
  ok('SeymaDateUtils expose edilmiş', typeof w.SeymaDateUtils === 'object');
  ok('pad fonksiyonu var', typeof w.SeymaDateUtils.pad === 'function');
  ok('fmt fonksiyonu var', typeof w.SeymaDateUtils.fmt === 'function');
  ok('todayStr fonksiyonu var', typeof w.SeymaDateUtils.todayStr === 'function');
  ok('addDays fonksiyonu var', typeof w.SeymaDateUtils.addDays === 'function');
  ok('diffDays fonksiyonu var', typeof w.SeymaDateUtils.diffDays === 'function');
  ok('shortDate fonksiyonu var', typeof w.SeymaDateUtils.shortDate === 'function');
  ok('dateLabelTR fonksiyonu var', typeof w.SeymaDateUtils.dateLabelTR === 'function');
  ok('dayIndexFor fonksiyonu var', typeof w.SeymaDateUtils.dayIndexFor === 'function');
  ok('activeDate fonksiyonu var', typeof w.SeymaDateUtils.activeDate === 'function');
  ok('curDay fonksiyonu var', typeof w.SeymaDateUtils.curDay === 'function');
})();

// ── Saf tarih yardımcıları ──
(function(){
  ok('todayStr string döndürüyor', typeof w.SeymaDateUtils.todayStr() === 'string');
  ok('addDays ay sınırı aşıyor', w.SeymaDateUtils.addDays('2026-08-31', 1) === '2026-09-01');
  ok('addDays yıl sınırı aşıyor', w.SeymaDateUtils.addDays('2026-12-31', 1) === '2027-01-01');
  ok('diffDays pozitif işaret', w.SeymaDateUtils.diffDays('2026-08-31','2026-09-01') === 1);
  ok('diffDays negatif işaret', w.SeymaDateUtils.diffDays('2026-09-01','2026-08-31') === -1);
  ok('diffDays sıfır', w.SeymaDateUtils.diffDays('2026-08-31','2026-08-31') === 0);
  ok('pad tek haneli', w.SeymaDateUtils.pad(3) === '03');
  ok('pad çift haneli', w.SeymaDateUtils.pad(12) === '12');
  ok('shortDate formatı', w.SeymaDateUtils.shortDate('2026-08-31') === '31.08');
  ok('dateLabelTR app.js metniyle aynı', w.SeymaDateUtils.dateLabelTR('2026-08-31') === '31 Ağustos Pazartesi');
})();

// ── state.js / syncGlue.js yüzeyleri (Faz -1.1: window.data/ui henüz yok) ──
(function(){
  ok('SeymaState expose edilmiş', typeof w.SeymaState === 'object');
  ok('SeymaState.data getter tanımlı', 'data' in w.SeymaState);
  ok('SeymaState.ui getter tanımlı', 'ui' in w.SeymaState);
  ok('SeymaState.dark getter tanımlı', 'dark' in w.SeymaState);
  ok('SeymaState.migrate getter tanımlı', 'migrate' in w.SeymaState);
  ok('SeymaState.getDay getter tanımlı', 'getDay' in w.SeymaState);
  ok('SeymaState.createDefaultData getter tanımlı', 'createDefaultData' in w.SeymaState);
  // Faz -1.1'de window.data/ui henüz yok → getter undefined döner (B1)
  ok('SeymaState.data henüz undefined (Faz -1.1)', w.SeymaState.data === undefined);
  // SeymaSave getter tanımlı (syncGlue)
  ok('SeymaSave getter tanımlı', 'SeymaSave' in w);
  ok('SeymaSave henüz undefined (save window\'da değil)', w.SeymaSave === undefined);
})();

// ── seq 24: 3 kırık fonksiyon B1 yüzeyine hizalandı ──
// Faz 0'da (FX-P-05) app.js canlı getter'ları window.data/ui/getDay'ı expose
// eder; SeymaState getter'ları bunları window[name] üzerinden çözer. Bu test,
// Faz 0 davranışını simüle etmek için window.data/ui/getDay'ı doğrudan kurar.
(function(){
  // dayIndexFor: SeymaState.data.startDate üzerinden çözümlenir
  w.data = { startDate: '2026-01-01', settings: { premiumAtmosphere:true, uiSounds:true, voiceGuidance:false, ambientSounds:false, richHaptics:true, launchRitual:true, haptics:true }, days: {} };
  w.ui = {};
  w.getDay = function(d,date,idx){ return d && d.days ? (d.days[date] || null) : null; };
  ok('dayIndexFor startDate üzerinden hesaplıyor', w.SeymaDateUtils.dayIndexFor('2026-01-01') === 1);
  w.data = { startDate: '2026-08-14', settings: w.data.settings, days: {} };
  ok('dayIndexFor gün farkı +1 ve rebind sonrası taze', w.SeymaDateUtils.dayIndexFor('2026-08-15') === 2);

  // activeDate: ui.editDate yoksa bugün
  w.ui = {};
  ok('activeDate editDate yokken bugün', w.SeymaDateUtils.activeDate() === w.SeymaDateUtils.todayStr());
  // activeDate: ui.editDate varsa onu döndürür
  w.ui.editDate = '2026-08-15';
  ok('activeDate editDate varken onu döndürüyor', w.SeymaDateUtils.activeDate() === '2026-08-15');

  // curDay: getDay(data, d, idx) çağrısı
  w.data.days = { '2026-08-15': { dayIndex: 227, mood: 4 } };
  var day = w.SeymaDateUtils.curDay();
  ok('curDay getDay üzerinden day döndürüyor', day && day.mood === 4);
  ok('curDay dayIndex doğru', day && day.dayIndex === 227);

  // curDay: getDay yoksa güvenle null (kırılmaz)
  w.getDay = null;
  ok('curDay getDay yokken null (kırılmaz)', w.SeymaDateUtils.curDay() === null);

  // Sonraki bölümler için Faz 0 yüzeyini premium ayarlarla geri yükle
  w.getDay = function(d,date,idx){ return d && d.days ? (d.days[date] || null) : null; };
})();

// ── helpers yüzeyi ──
(function(){
  ok('SeymaHelpers expose edilmiş', typeof w.SeymaHelpers === 'object');
  ok('segTabs fonksiyon', typeof w.SeymaHelpers.segTabs === 'function');
  ok('toast fonksiyon', typeof w.SeymaHelpers.toast === 'function');
  ok('haptic fonksiyon', typeof w.SeymaHelpers.haptic === 'function');
  var segHtml = w.SeymaHelpers.segTabs([['a','A'],['b','B']], 'a', 'App.foo', 'read');
  ok('segTabs app.js ile aynı role metnini koruyor', segHtml.indexOf('role="tablist"') < 0);
  ok('segTabs handler metnini koruyor', segHtml.indexOf('onclick="App.foo') >= 0);
  w.SeymaHelpers.haptic(10); // exception atmadan geçmeli
  ok('haptic exception atmıyor', true);
})();

// ── mediaFx yüzeyi ──
(function(){
  ok('SeyAudio expose edilmiş', typeof w.SeyAudio === 'object');
  ok('SeyHaptics expose edilmiş', typeof w.SeyHaptics === 'object');
  ok('SeyFx expose edilmiş', typeof w.SeyFx === 'object');
  ok('SeyAudio.tap yok', typeof w.SeyAudio.tap === 'function');
  ok('SeyAudio.success yok', typeof w.SeyAudio.success === 'function');
  ok('SeyAudio.voice yok', typeof w.SeyAudio.voice === 'function');
  ok('SeyHaptics.tap yok', typeof w.SeyHaptics.tap === 'function');
  ok('isPremiumFxEnabled true olmalı', w.SeyFx.isPremiumFxEnabled() === true);
})();

// ── timeTheme yüzeyi ──
(function(){
  ok('SeyTimeTheme expose edilmiş', typeof w.SeyTimeTheme === 'object');
  ok('classForHour dawn yanlış', w.SeyTimeTheme.classForHour(6) === 'theme-time-dawn');
  ok('classForHour day yanlış', w.SeyTimeTheme.classForHour(12) === 'theme-time-day');
  ok('classForHour dusk yanlış', w.SeyTimeTheme.classForHour(18) === 'theme-time-dusk');
  ok('classForHour night yanlış', w.SeyTimeTheme.classForHour(23) === 'theme-time-night');
})();

console.log('\n=== Özet ===');
console.log('Passed: '+passed+' / '+(passed+failed));
if (failed > 0) { process.exit(1); }
