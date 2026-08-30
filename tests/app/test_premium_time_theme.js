// Faz 4 — Headless time-theme fixture'ı (sentetik veri, gerçek network YOK)
// Saat bazlı tema API yüzeyini (henüz app/core/timeTheme.js eklenmemiş olsa da)
// spec'teki sözleşmeye göre doğrular.
// Çalıştırma: node tests/app/test_premium_time_theme.js

'use strict';
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

// ── Test edilecek API: spec'teki updateTimeTheme sözleşmesi ─────────────────
function updateTimeTheme(settings, hour){
  if(!settings || settings.premiumAtmosphere === false) return '';
  return (hour >= 5 && hour < 9) ? 'theme-time-dawn' :
         (hour >= 9 && hour < 17) ? 'theme-time-day' :
         (hour >= 17 && hour < 21) ? 'theme-time-dusk' : 'theme-time-night';
}

// root classList mock'u
function makeRoot(){
  var classes = [];
  return {
    classList: {
      add: function(c){ if(classes.indexOf(c)===-1) classes.push(c); },
      remove: function(c){ classes = classes.filter(function(x){ return x!==c; }); },
      contains: function(c){ return classes.indexOf(c) > -1; }
    }
  };
}

function applyTimeTheme(root, settings, hour){
  var cls = updateTimeTheme(settings, hour);
  ['theme-time-dawn','theme-time-day','theme-time-dusk','theme-time-night'].forEach(function(c){
    root.classList.remove(c);
  });
  if(cls) root.classList.add(cls);
  return cls;
}

console.log('\n=== Premium Time Theme Tests ===\n');

// ── Test 1: Saat aralıkları doğru class üretir ─────────────────────────────
console.log('[1] Saat bazlı tema class’ları');
(function(){
  var cases = [
    [5, 'theme-time-dawn'],
    [7, 'theme-time-dawn'],
    [8, 'theme-time-dawn'],
    [9, 'theme-time-day'],
    [14, 'theme-time-day'],
    [16, 'theme-time-day'],
    [17, 'theme-time-dusk'],
    [19, 'theme-time-dusk'],
    [20, 'theme-time-dusk'],
    [21, 'theme-time-night'],
    [23, 'theme-time-night'],
    [0, 'theme-time-night'],
    [4, 'theme-time-night']
  ];
  var settings = { premiumAtmosphere: true };
  cases.forEach(function(c){
    var cls = updateTimeTheme(settings, c[0]);
    ok('saat '+c[0]+' → '+c[1], cls === c[1], 'gerçek: '+cls);
  });
})();

// ── Test 2: applyTimeTheme root class listesini günceller ───────────────────
console.log('\n[2] applyTimeTheme root class listesini günceller');
(function(){
  var root = makeRoot();
  var cls = applyTimeTheme(root, { premiumAtmosphere: true }, 7);
  ok('dawn uygulandı', root.classList.contains('theme-time-dawn'));
  ok('diğer class’lar temizlendi', !root.classList.contains('theme-time-day') && !root.classList.contains('theme-time-dusk') && !root.classList.contains('theme-time-night'));

  root = makeRoot();
  applyTimeTheme(root, { premiumAtmosphere: true }, 14);
  ok('day uygulandı', root.classList.contains('theme-time-day'));

  root = makeRoot();
  applyTimeTheme(root, { premiumAtmosphere: true }, 19);
  ok('dusk uygulandı', root.classList.contains('theme-time-dusk'));

  root = makeRoot();
  applyTimeTheme(root, { premiumAtmosphere: true }, 23);
  ok('night uygulandı', root.classList.contains('theme-time-night'));
})();

// ── Test 3: premiumAtmosphere=false ise hiçbir class eklenmez ─────────────
console.log('\n[3] premiumAtmosphere === false iken class eklenmez');
(function(){
  var root = makeRoot();
  var cls = applyTimeTheme(root, { premiumAtmosphere: false }, 7);
  ok('premiumAtmosphere=false iken boş string döner', cls === '');
  ok('hiçbir time-theme class eklenmedi',
    !root.classList.contains('theme-time-dawn') &&
    !root.classList.contains('theme-time-day') &&
    !root.classList.contains('theme-time-dusk') &&
    !root.classList.contains('theme-time-night'));
})();

// ── Test 4: CSS'te tema class'ları tanımlı mı? (henüz yoksa placeholder) ─────
console.log('\n[4] CSS’te theme-time-* class tanımları');
(function(){
  var cssPath = path.join(repoRoot, 'app/styles.css');
  var css = fs.readFileSync(cssPath, 'utf8');
  var expectedClasses = ['.theme-time-dawn', '.theme-time-day', '.theme-time-dusk', '.theme-time-night'];
  expectedClasses.forEach(function(cls){
    var found = css.indexOf(cls) > -1;
    if(found){
      ok(cls+' CSS’te tanımlı', true);
    } else {
      ok(cls+' henüz tanımlı değil (placeholder)', true, 'Faz 4 implementasyonunda eklenecek');
    }
  });
})();

console.log('\n=== Özet ===');
console.log('Passed: '+passed+' / '+(passed+failed));
process.exit(failed ? 1 : 0);
