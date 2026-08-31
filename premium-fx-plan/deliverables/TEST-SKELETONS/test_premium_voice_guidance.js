// tests/app/test_premium_voice_guidance.js — Şablon (global-mock, vm2 YOK)
// Web Speech API rehberliği doğrulama fixture'ı.
// Not: vm2 npm'den kaldırıldı; gerçek testler global-mock deseni kullanır.
// Çalıştırma: node tests/app/test_premium_voice_guidance.js

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
var _utterances = [];
global.window = {
  addEventListener: function(){},
  matchMedia: function(q){ return { matches: false }; },
  speechSynthesis: {
    speak: function(u){ _utterances.push(u); },
    cancel: function(){},
    getVoices: function(){ return [{ lang: 'tr-TR', name: 'Turkish' }]; }
  },
  SeymaConstants: null
};
global.document = { getElementById: function(){ return null; } };
global.location = { protocol:'https:', hostname:'example.com', search:'' };
global.fetch = function(url, opts){ return Promise.reject(new Error('TEST: fetch çağrılmamalı')); };
if (typeof TextEncoder === 'undefined') { global.TextEncoder = require('util').TextEncoder; }
if (typeof TextDecoder === 'undefined') { global.TextDecoder = require('util').TextDecoder; }

var passed = 0, failed = 0;
function ok(name, cond, detail){
  if (cond) { passed++; console.log('  ✓ '+name); }
  else { failed++; console.log('  ✗ '+name + (detail ? ' — '+detail : '')); }
}

function run(){
  console.log('\n=== test_premium_voice_guidance (şablon) ===\n');
  // TODO: SeyAudio.voice() fonksiyonunu test et
  // TODO: settings.voiceGuidance true iken utterance oluşur
  // TODO: settings.voiceGuidance false iken oluşmaz
  // TODO: speechSynthesis yoksa graceful no-op
  ok('şablon placeholder', true);
  console.log('\n=== Özet: '+passed+' geçti, '+failed+' kaldı ===');
  if (failed > 0) process.exit(1);
}
run();
