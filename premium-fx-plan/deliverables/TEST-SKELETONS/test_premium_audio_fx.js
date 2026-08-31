// tests/app/test_premium_audio_fx.js — Şablon (global-mock, vm2 YOK)
// Şeyma uygulamasına premium ses efektleri eklendikten sonra çalıştırılacak.
// Not: vm2 npm'den kaldırıldı; gerçek testler global-mock deseni kullanır.
// Çalıştırma: node tests/app/test_premium_audio_fx.js

'use strict';
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var repoRoot = require('../repo-root');

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
  AudioContext: null,
  webkitAudioContext: null,
  speechSynthesis: null,
  SeymaConstants: null,
  SeyAudio: null
};
global.document = { getElementById: function(){ return null; } };
global.location = { protocol:'https:', hostname:'example.com', search:'' };
Object.defineProperty(global, 'navigator', { value: { vibrate: function(){} }, configurable: true, writable: true });
global.fetch = function(url, opts){ return Promise.reject(new Error('TEST: fetch çağrılmamalı')); };
if (typeof TextEncoder === 'undefined') { global.TextEncoder = require('util').TextEncoder; }
if (typeof TextDecoder === 'undefined') { global.TextDecoder = require('util').TextDecoder; }

var passed = 0, failed = 0;
function ok(name, cond, detail){
  if (cond) { passed++; console.log('  ✓ '+name); }
  else { failed++; console.log('  ✗ '+name + (detail ? ' — '+detail : '')); }
}

function run(){
  console.log('\n=== test_premium_audio_fx (şablon) ===\n');
  // TODO: app/core/mediaFx.js içeriğini yükle (SeyAudio)
  // TODO: settings.uiSounds true/false senaryolarını test et
  // TODO: reduced-motion aktifken ses üretilmemeli
  ok('şablon placeholder', true);
  console.log('\n=== Özet: '+passed+' geçti, '+failed+' kaldı ===');
  if (failed > 0) process.exit(1);
}
run();
