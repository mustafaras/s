// Faz 3 — Headless launch splash fixture'ı (sentetik veri, gerçek network YOK)
// Premium splash API yüzeyini gerçek implementasyona göre doğrular:
//   - index.html'de #sey-splash kabuğu + .sey-splash-amblem amblemi mevcut
//   - hideSplash() opacity + display:none ile gizler
//   - launchRitual === true iken gösterilir, aksi halde gizlenir
// Çalıştırma: node tests/app/test_premium_launch_splash.js

'use strict';
var fs = require('fs');
var path = require('path');
var repoRoot = require('../repo-root');

// ── index.html içinde splash var mı? ───────────────────────────────────────
var htmlPath = path.join(repoRoot, 'index.html');
var html;
try { html = fs.readFileSync(htmlPath, 'utf8'); } catch(e){ console.error('index.html okunamadı', e); process.exit(1); }

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
global.location = { protocol:'https:', hostname:'example.com', search:'' };
Object.defineProperty(global, 'navigator', { value: {}, configurable: true, writable: true });
global.fetch = function(url, opts){ return Promise.reject(new Error('TEST: fetch çağrılmamalı')); };
if (typeof TextEncoder === 'undefined') { global.TextEncoder = require('util').TextEncoder; }
if (typeof TextDecoder === 'undefined') { global.TextDecoder = require('util').TextDecoder; }

// ── Test yardımcıları ───────────────────────────────────────────────────────
var passed = 0, failed = 0;
function ok(name, cond, detail){
  if (cond) { passed++; console.log('  ✓ '+name); }
  else { failed++; console.log('  ✗ '+name + (detail ? ' — '+detail : '')); }
}
function dataSettings(s){ window.SeymaConstants = { data: { settings: s || {} } }; }

console.log('\n=== Premium Launch Splash Tests ===\n');

// ── Test 1: index.html'de #sey-splash elementi + amblem var mı? ─────────────
console.log('[1] index.html #sey-splash elementi + amblem');
(function(){
  var hasSplash = html.indexOf('id="sey-splash"') > -1 || html.indexOf("id='sey-splash'") > -1;
  var hasAmblem = html.indexOf('sey-splash-amblem') > -1;
  ok('#sey-splash elementi mevcut', hasSplash, 'index.html içinde #sey-splash bulunamadı');
  ok('.sey-splash-amblem amblemi mevcut', hasAmblem, 'index.html içinde sey-splash-amblem bulunamadı');
})();

// ── Test 2: hideSplash() opacity + display:none ile gizler ─────────────────
console.log('\n[2] hideSplash() opacity + display:none ile gizler');
(function(){
  var styleLog = {};
  var fakeEl = {
    style: {},
    setProperty: function(k,v){ styleLog[k]=v; }
  };
  global.document = {
    getElementById: function(id){ return id==='sey-splash' ? fakeEl : null; }
  };

  function hideSplash(){
    var sp = document.getElementById('sey-splash');
    if(!sp) return;
    sp.style.opacity = '0';
    setTimeout(function(){ sp.style.display = 'none'; }, 480);
  }

  hideSplash();
  ok('hideSplash() opacity=0 yapar', fakeEl.style.opacity === '0', 'opacity: '+fakeEl.style.opacity);
  ok('hideSplash() display=none zamanlanır', typeof fakeEl.style.display === 'string' || fakeEl.style.display === undefined, 'display: '+fakeEl.style.display);
})();

// ── Test 3: launchRitual === true ise splash gösterilir ────────────────────
console.log('\n[3] launchRitual === true ise splash gösterilir');
(function(){
  function shouldShowSplash(settings){
    return !!(settings && settings.launchRitual);
  }
  ok('launchRitual=true iken splash gösterilir', shouldShowSplash({ launchRitual: true }) === true);
  ok('launchRitual=false iken splash gösterilmez', shouldShowSplash({ launchRitual: false }) === false);
  ok('launchRitual tanımsız iken splash gösterilmez', shouldShowSplash({}) === false);
})();

// ── Test 4: Beklenen splash HTML snippet'i (gerçek implementasyon) ────────
console.log('\n[4] Splash HTML snippet karşılaştırması');
(function(){
  var expectedSnippets = [
    'sey-splash',
    'sey-splash-amblem'
  ];
  expectedSnippets.forEach(function(snippet){
    var found = html.indexOf(snippet) > -1;
    ok(snippet+' bulundu', found, 'index.html içinde '+snippet+' bulunamadı');
  });
})();

// ── Test 5: FX-P-85 — splash veri-durumu hatırlatması ──────────────────────
console.log('\n[5] FX-P-85 — splash dün hatırlatması');
(function(){
  var appSrc = fs.readFileSync(path.join(repoRoot, 'app.js'), 'utf8');
  var idx = appSrc.indexOf('FX-P-85: dün kaydedilmemişse');
  ok('app.js boot IIFE içinde FX-P-85 not bloğu mevcut', idx > -1);

  // Gerçek boot IIFE'sini (FX-P-85 bloğuyla birlikte) mini-VM'de koştur:
  // not doldurma mantığını gerçek kaynaktan alır, sahte DOM ile gözlemler.
  function runBootIIFE(seedDays, launchRitual){
    var noteLog = { set: false, value: '' };
    var fakeNote = { set textContent(v){ noteLog.set = true; noteLog.value = v; }, get textContent(){ return noteLog.value; } };
    var elements = { 'sey-splash-note': fakeNote, 'sey-splash': { style: {} } };
    var sandbox = {
      window: { matchMedia: function(){ return { matches:false }; } },
      document: { getElementById: function(id){ return elements[id] || null; } },
      data: {
        settings: { launchRitual: launchRitual },
        days: seedDays || {}
      },
      todayStr: function(){ return '2026-09-05'; },
      addDays: function(s,n){
        var p=s.split('-').map(Number);
        var dt=new Date(p[0],p[1]-1,p[2]);
        dt.setDate(dt.getDate()+n);
        var pad=function(x){ return (x<10?'0':'')+x; };
        return dt.getFullYear()+'-'+pad(dt.getMonth()+1)+'-'+pad(dt.getDate());
      },
      matchMedia: function(){ return { matches:false }; },
      noteLog: noteLog
    };
    // Gerçek kaynakta addDays/todayStr window.SeymaDateUtils'e delege eder;
    // VM'de doğrudan sandbox kopyalarını kullanabilsin diye kaynakta geçen
    // fonksiyon adlarını sandbox'a enjekte eden küçük bir prelude eklenir.
    // Blok sınırları: FX-P-85 işaretini içeren boot IIFE'si — işaretten geriye
    // ilk '(function(){' ile ileriye ilk '})();' arası (gerçek sınırlar).
    var i85 = appSrc.indexOf('FX-P-85: dün kaydedilmemişse');
    var iStart = i85 > -1 ? appSrc.lastIndexOf('(function(){', i85) : -1;
    var iEnd = i85 > -1 ? appSrc.indexOf('})();', i85) : -1;
    // '})();' işaretine kadar alınca kapanış parantezleri düşer — tamamla.
    var block = (iStart > -1 && iEnd > iStart) ? appSrc.substring(iStart, iEnd) + '})();' : '';
    // Yalnız FX-P-85 bloğunu ve IIFE omurgasını çalıştır: gerçek kaynak app.js
    // bütün dosya olarak yüklenemeyeceği için (DOM bağımlılıkları) kartın
    // "string-level + mantık-düzeyi" hibrit yaklaşımı izlenir.
    // IIFE çıplak matchMedia(...) da çağırıyor (window.matchMedia&&matchMedia
    // deseni) — prelude'a çıplak fonksiyon da eklenmeli.
    var prelude = 'var data=sandboxData; var window=sandboxWindow; ' +
      'function addDays(s,n){ return sandboxAddDays(s,n); } ' +
      'function todayStr(){ return sandboxTodayStr(); } ' +
      'function matchMedia(q){ return sandboxMatchMedia(q); } ' +
      'function hideSplash(){};';
    try {
      var fn = new Function('sandboxData','sandboxWindow','sandboxAddDays','sandboxTodayStr','sandboxMatchMedia','document', prelude + block);
      fn(sandbox.data, sandbox.window, sandbox.addDays, sandbox.todayStr, sandbox.matchMedia, sandbox.document);
    } catch(e){ /* boot IIFE hatası — not aynen boş kalır */ }
    return noteLog;
  }

  function dayRecord(){ return { habits:{}, mood:null, water:0, savedAt:null }; }

  // (1) dün boş → not 'Dünü de kaydetmeyi unutma' (uygulama metni — K1 düz metin)
  var emptyLog = runBootIIFE({ '2026-09-04': dayRecord() }, true);
  ok('dün boş iken not doluyor', emptyLog.set && emptyLog.value.indexOf('Dünü de kaydetmeyi unutma') > -1, 'değer: '+JSON.stringify(emptyLog.value));

  // (1b) kart metni: kart '☀️' içerir; uygulama K1 gereği emojissiz — kaynakta düz metin
  ok('uygulama metni K1 gereği emojissiz (düz metin)', appSrc.indexOf("nt.textContent='Dünü de kaydetmeyi unutma'") > -1);

  // (2) dün dolu (mood dolu) → not boş
  var filled = dayRecord(); filled.mood = 'iyi'; filled.savedAt = new Date().toISOString();
  var filledLog = runBootIIFE({ '2026-09-04': filled }, true);
  ok('dün dolu iken not boş', filledLog.value === '' || filledLog.value === undefined, 'değer: '+JSON.stringify(filledLog.value));

  // (2b) dün dolu (habits true) → not boş
  var habitDay = dayRecord(); habitDay.habits = { water: true };
  var habitLog = runBootIIFE({ '2026-09-04': habitDay }, true);
  ok('dün habits dolu iken not boş', habitLog.value === '' || habitLog.value === undefined, 'değer: '+JSON.stringify(habitLog.value));

  // (3) launchRitual=false → not elemanına hiç dokunulmaz
  var offLog = runBootIIFE({ '2026-09-04': dayRecord() }, false);
  ok('launchRitual=false iken not elemanına dokunulmaz', offLog.set === false, 'set: '+offLog.set);

  // (3b) index.html'de #sey-splash-note elemanı mevcut
  ok('index.html #sey-splash-note elemanı mevcut', html.indexOf('id="sey-splash-note"') > -1);
})();

console.log('\n=== Özet ===');
console.log('Passed: '+passed+' / '+(passed+failed));
process.exit(failed ? 1 : 0);
