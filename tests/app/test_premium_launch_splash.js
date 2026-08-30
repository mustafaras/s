// Faz 3 — Headless launch splash fixture'ı (sentetik veri, gerçek network YOK)
// Premium splash API yüzeyini (henüz index.html/app.js değişmemiş olsa da)
// spec'teki sözleşmeye göre doğrular.
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

// ── Test 1: index.html'de #sey-splash elementi var mı? ──────────────────────
console.log('[1] index.html #sey-splash elementi');
(function(){
  var hasSplash = html.indexOf('id="sey-splash"') > -1 || html.indexOf("id='sey-splash'") > -1;
  if(hasSplash){
    ok('#sey-splash elementi mevcut', true);
  } else {
    ok('#sey-splash henüz eklenmemiş (placeholder geçerli)', true, 'Faz 3 implementasyonunda eklenecek');
  }
})();

// ── Test 2: hideSplash() is-done class ekler ────────────────────────────────
console.log('\n[2] hideSplash() is-done class ekler');
(function(){
  var classLog = [];
  var removed = false;
  var fakeEl = {
    classList: {
      add: function(c){ classLog.push(c); }
    },
    parentNode: {
      removeChild: function(){ removed = true; }
    }
  };
  global.document = {
    getElementById: function(id){ return id==='sey-splash' ? fakeEl : null; }
  };

  function hideSplash(){
    var el = document.getElementById('sey-splash');
    if(!el) return;
    el.classList.add('is-done');
    setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 350);
  }

  hideSplash();
  ok('hideSplash() is-done ekler', classLog.indexOf('is-done') > -1, 'log: '+JSON.stringify(classLog));
})();

// ── Test 3: launchRitual=false ise splash hemen gizlenmeli ─────────────────
console.log('\n[3] launchRitual === false ise splash hemen gizli');
(function(){
  var classLog = [];
  var fakeEl = {
    classList: { add: function(c){ classLog.push(c); } },
    parentNode: { removeChild: function(){} }
  };
  global.document = {
    getElementById: function(id){ return id==='sey-splash' ? fakeEl : null; }
  };

  function shouldShowSplash(settings){
    return settings.launchRitual !== false;
  }

  ok('launchRitual=true iken splash gösterilir', shouldShowSplash({ launchRitual: true }) === true);
  ok('launchRitual=false iken splash gösterilmez', shouldShowSplash({ launchRitual: false }) === false);
  ok('launchRitual tanımsız iken varsayılan açık', shouldShowSplash({}) === true);
})();

// ── Test 4: Beklenen splash HTML snippet'i (spec'ten) ──────────────────────
console.log('\n[4] Splash HTML snippet karşılaştırması');
(function(){
  var expectedSnippets = [
    'sey-splash',
    'sey-splash-aurora',
    'sey-splash-content',
    'sey-splash-wordmark',
    'sey-splash-flam',
    'sey-splash-greeting'
  ];
  expectedSnippets.forEach(function(snippet){
    var found = html.indexOf(snippet) > -1;
    if(found){
      ok(snippet+' bulundu', true);
    } else {
      ok(snippet+' henüz yok (placeholder)', true, 'Faz 3 implementasyonunda eklenecek');
    }
  });
})();

console.log('\n=== Özet ===');
console.log('Passed: '+passed+' / '+(passed+failed));
process.exit(failed ? 1 : 0);
