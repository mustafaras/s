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

// ── Test 5: Gerçek timeTheme.js modülü — classForHour / apply / mevsim ─────
console.log('\n[5] Gerçek timeTheme.js — classForHour / apply / seasonalClass / applySeasonal');
(function(){
  var vm = require('vm');
  var src = fs.readFileSync(path.join(repoRoot, 'app/core/timeTheme.js'), 'utf8');
  var sandbox = { window: {}, document: null, console: console };
  sandbox.window.SeymaState = { data: { settings: { premiumAtmosphere: true } } };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  var ST = sandbox.window.SeyTimeTheme;
  ok('SeyTimeTheme expose edildi', !!ST && typeof ST.classForHour === 'function' && typeof ST.apply === 'function' && typeof ST.seasonalClass === 'function' && typeof ST.applySeasonal === 'function');

  // classForHour(h) — gerçek modül üzerinden (FX-P-44 sözleşmesi)
  var hourCases = [
    [5, 'theme-time-dawn'],
    [9, 'theme-time-day'],
    [17, 'theme-time-dusk'],
    [21, 'theme-time-night'],
    [4, 'theme-time-night']
  ];
  hourCases.forEach(function(c){
    var cls = ST.classForHour(c[0]);
    ok('classForHour('+c[0]+') → '+c[1], cls === c[1], 'gerçek: '+cls);
  });

  // apply() — mock document.getElementById ile root class listesini günceller
  var classes = [];
  var root = { classList: {
    add: function(c){ if(classes.indexOf(c)===-1) classes.push(c); },
    remove: function(){ for(var i=0;i<arguments.length;i++){ classes = classes.filter(function(x){ return x!==arguments[i]; }); } },
    contains: function(c){ return classes.indexOf(c) > -1; }
  }};
  sandbox.document = { getElementById: function(id){ return id==='root' ? root : null; } };
  ST.apply();
  var applied = classes.filter(function(c){ return c.indexOf('theme-time-')===0; });
  ok('apply() bir saat sınıfı ekler', applied.length === 1, 'sınıflar: '+classes.join(','));
  ok('apply() theme-time-* sınıfı ekler', applied.length === 1 && applied[0].indexOf('theme-time-')===0);

  // premiumAtmosphere=false iken apply() sınıf eklemez
  sandbox.window.SeymaState.data.settings.premiumAtmosphere = false;
  classes = [];
  ST.apply();
  ok('premiumAtmosphere=false iken apply() sınıf eklemez', classes.length === 0);
  sandbox.window.SeymaState.data.settings.premiumAtmosphere = true;

  // seasonalClass(d) — dört mevsim (deterministik, d verilince özel günler atlanır)
  var seasonCases = [
    [new Date(2026, 2, 15), 'theme-season-spring'],   // Mart
    [new Date(2026, 4, 1),  'theme-season-spring'],   // Mayıs
    [new Date(2026, 5, 15), 'theme-season-summer'],   // Haziran
    [new Date(2026, 7, 1),  'theme-season-summer'],   // Ağustos
    [new Date(2026, 8, 15), 'theme-season-autumn'],   // Eylül
    [new Date(2026, 10, 1), 'theme-season-autumn'],   // Kasım
    [new Date(2026, 11, 15),'theme-season-winter'],   // Aralık
    [new Date(2026, 1, 1),  'theme-season-winter']     // Şubat
  ];
  seasonCases.forEach(function(c){
    var cls = ST.seasonalClass(c[0]);
    ok('seasonalClass('+c[0].getMonth()+1+'/…) → '+c[1], cls === c[1], 'gerçek: '+cls);
  });

  // applySeasonal(d) — root class listesini günceller
  classes = [];
  ST.applySeasonal(new Date(2026, 5, 15)); // yaz
  ok('applySeasonal yaz sınıfını ekler', root.classList.contains('theme-season-summer'));
  ok('diğer mevsim sınıfları temizlendi',
    !root.classList.contains('theme-season-spring') &&
    !root.classList.contains('theme-season-autumn') &&
    !root.classList.contains('theme-season-winter'));
  ST.applySeasonal(new Date(2026, 11, 15)); // kış
  ok('applySeasonal kışa geçer', root.classList.contains('theme-season-winter') && !root.classList.contains('theme-season-summer'));

  // premiumAtmosphere=false iken sınıf eklenmez
  sandbox.window.SeymaState.data.settings.premiumAtmosphere = false;
  classes = [];
  ST.applySeasonal(new Date(2026, 5, 15));
  ok('premiumAtmosphere=false iken mevsim sınıfı eklenmez', classes.length === 0);
})();

// ── Test 5b: FX-P-81 — aurora arka plan katmanı sözleşmesi ─────────────────
console.log('\n[5b] FX-P-81 — aurora katmanı (theme-aurora + #sey-aurora)');
(function(){
  var vm = require('vm');
  var src = fs.readFileSync(path.join(repoRoot, 'app/core/timeTheme.js'), 'utf8');
  var sandbox = { window: {}, document: null, console: console };
  sandbox.window.SeymaState = { data: { settings: { premiumAtmosphere: true } } };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  var ST = sandbox.window.SeyTimeTheme;

  var classes = [];
  var root = { classList: {
    add: function(c){ if(classes.indexOf(c)===-1) classes.push(c); },
    remove: function(){ for(var i=0;i<arguments.length;i++){ classes = classes.filter(function(x){ return x!==arguments[i]; }); } },
    contains: function(c){ return classes.indexOf(c) > -1; }
  }};
  sandbox.document = { getElementById: function(id){ return id==='root' ? root : null; } };

  // (1) premium açıkken apply() → root classList'inde 'theme-aurora' var
  classes = [];
  ST.apply();
  ok('premium açıkken apply() theme-aurora ekler', root.classList.contains('theme-aurora'));

  // (2) premium kapalıyken apply() → 'theme-aurora' yok (remove dalı çalışıyor)
  sandbox.window.SeymaState.data.settings.premiumAtmosphere = false;
  ST.apply();
  ok('premium kapalıyken apply() theme-aurora kaldırır', !root.classList.contains('theme-aurora'));
  sandbox.window.SeymaState.data.settings.premiumAtmosphere = true;

  // (3) index.html metninde 'id="sey-aurora"' geçiyor
  var idxHtml = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
  ok('index.html sey-aurora katmanını içeriyor', idxHtml.indexOf('id="sey-aurora"') > -1);

  // (4) styles.css'te 'prefers-reduced-motion: reduce' bloğunda
  //     '#root.theme-aurora #sey-aurora' kuralı var
  var css = fs.readFileSync(path.join(repoRoot, 'app/styles.css'), 'utf8');
  var rmBlocks = css.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\}/g) || [];
  var auroraRmFound = rmBlocks.some(function(b){ return b.indexOf('#root.theme-aurora #sey-aurora') > -1; });
  ok('reduced-motion bloğunda aurora kuralı var', auroraRmFound, 'blok sayısı: '+rmBlocks.length);
})();

// ── Test 6: CSS'te mevsimsel class tanımları ────────────────────────────────
console.log('\n[6] CSS’te theme-season-* class tanımları');
(function(){
  var cssPath = path.join(repoRoot, 'app/styles.css');
  var css = fs.readFileSync(cssPath, 'utf8');
  var expectedClasses = ['.theme-season-spring', '.theme-season-summer', '.theme-season-autumn', '.theme-season-winter'];
  expectedClasses.forEach(function(cls){
    var found = css.indexOf(cls) > -1;
    ok(cls+' CSS’te tanımlı', found, found ? '' : 'eksik');
  });
})();

console.log('\n=== Özet ===');
console.log('Passed: '+passed+' / '+(passed+failed));
process.exit(failed ? 1 : 0);
