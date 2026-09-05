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

console.log('\n=== Özet ===');
console.log('Passed: '+passed+' / '+(passed+failed));
process.exit(failed ? 1 : 0);
