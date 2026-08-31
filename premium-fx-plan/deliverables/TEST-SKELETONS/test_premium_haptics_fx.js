// tests/app/test_premium_haptics_fx.js — Şablon (global-mock, vm2 YOK)
// Şeyma uygulamasına zengin haptik pattern'leri eklendikten sonra çalıştırılacak.
// Not: vm2 npm'den kaldırıldı; gerçek testler global-mock deseni kullanır.
// Çalıştırma: node tests/app/test_premium_haptics_fx.js

'use strict';
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var repoRoot = require('../repo-root');

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
global.document = { getElementById: function(){ return null; } };
global.location = { protocol:'https:', hostname:'example.com', search:'' };
global.fetch = function(url, opts){ return Promise.reject(new Error('TEST: fetch çağrılmamalı')); };
if (typeof TextEncoder === 'undefined') { global.TextEncoder = require('util').TextEncoder; }
if (typeof TextDecoder === 'undefined') { global.TextDecoder = require('util').TextDecoder; }

// ── navigator.vibrate stub: çağrıları kaydet ────────────────────────────────
var _vibrateCalls = [];
Object.defineProperty(global, 'navigator', {
  value: { vibrate: function(p){ _vibrateCalls.push(p); return true; } },
  configurable: true, writable: true
});

var passed = 0, failed = 0;
function ok(name, cond, detail){
  if (cond) { passed++; console.log('  ✓ '+name); }
  else { failed++; console.log('  ✗ '+name + (detail ? ' — '+detail : '')); }
}

function run(){
  console.log('\n=== test_premium_haptics_fx (şablon) ===\n');
  // TODO: SeyHaptics.tap/success/error/refresh/streak/water desenlerini test et
  // TODO: settings.richHaptics false iken vibrate çağrılmamalı
  // TODO: navigator.vibrate yokken graceful no-op
  ok('şablon placeholder', true);
  console.log('\n=== Özet: '+passed+' geçti, '+failed+' kaldı ===');
  if (failed > 0) process.exit(1);
}
run();
