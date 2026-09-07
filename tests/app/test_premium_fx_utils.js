// Faz 3 — Headless Visual FX utility fixture'ı (sentetik veri, gerçek network YOK)
// FX-P-36: gerçek app/core/mediaFx.js modülünü VM'de yükler ve SeyFx yüzeyini
// (isPremiumFxEnabled/prefersReducedMotion/shouldAnimate/ambientAllowed/
// isSoundAllowed/countUp/ripple/shimmer) + gating kombinasyonlarını doğrular.
// Çalıştırma: node tests/app/test_premium_fx_utils.js

'use strict';
var fs = require('fs');
var path = require('path');
var vm = require('vm');
var repoRoot = require('../repo-root');

console.log('\n=== Premium Visual FX Utils Tests (gerçek mediaFx.js) ===\n');

var passed = 0, failed = 0;
function ok(name, cond, detail){
  if (cond) { passed++; console.log('  ✓ '+name); }
  else { failed++; console.log('  ✗ '+name + (detail ? ' — '+detail : '')); }
}

// ── Gerçek mediaFx.js'yi VM'de yükler; dönüşte window.SeyFx döner ──────────
function loadMediaFx(opts){
  opts = opts || {};
  var src = fs.readFileSync(path.join(repoRoot,'app/core/mediaFx.js'),'utf8');
  var document = {
    createElement: function(tag){ return { className:'', style:{}, classList:{ add:function(){}, remove:function(){} }, remove:function(){}, appendChild:function(){} }; },
    querySelector: function(){ return null; },
    querySelectorAll: function(selector){ return selector === '[data-countup]' ? (opts.counterNodes || []) : []; },
    getElementById: function(){ return null; }
  };
  var win = {
    matchMedia: function(q){ return { matches: !!opts.reducedMotion }; },
    SeymaState: { data: { settings: opts.settings || {} } },
    SeymaConstants: null,
    SeyAudio: null, SeyHaptics: null, SeyFx: null,
    requestAnimationFrame: function(fn){ return setTimeout(function(){ fn(Date.now()); }, 0); },
    setTimeout: setTimeout,
    clearTimeout: clearTimeout
  };
  win.__testDocument = document;
  var ctx = vm.createContext({ window: win, navigator: { vibrate: function(){ return true; } }, document: document, performance: globalThis.performance, setTimeout: setTimeout, clearTimeout: clearTimeout, Math: Math, Date: Date, Number: Number, String: String, JSON: JSON, Object: Object, Array: Array, Promise: Promise });
  vm.runInContext(src, ctx, { timeout: 5000 });
  return ctx.window;
}

// ── Test 1: API yüzeyi tanımlı ve çağrılabilir ──────────────────────────────
console.log('[1] SeyFx API yüzeyi tanımlı');
(function(){
  var win = loadMediaFx({ settings: {} });
  var SeyFx = win.SeyFx;
  ok('SeyFx var', !!SeyFx);
  ['isPremiumFxEnabled','prefersReducedMotion','shouldAnimate','ambientAllowed','isSoundAllowed'].forEach(function(f){
    ok('SeyFx.'+f+' fonksiyonu var', typeof SeyFx[f] === 'function');
  });
  ['countUp','sweepCounters','ripple','shimmer'].forEach(function(f){
    ok('SeyFx.'+f+' fonksiyonu var', typeof SeyFx[f] === 'function');
  });
})();

// ── Test 2: isPremiumFxEnabled kombinasyonları ──────────────────────────────
console.log('\n[2] isPremiumFxEnabled gating kombinasyonları');
(function(){
  var win = loadMediaFx({ settings: { premiumAtmosphere: true }, reducedMotion: false });
  ok('premiumAtmosphere=true + reduced-motion=false → true', win.SeyFx.isPremiumFxEnabled() === true);

  win = loadMediaFx({ settings: { premiumAtmosphere: false }, reducedMotion: false });
  ok('premiumAtmosphere=false → false', win.SeyFx.isPremiumFxEnabled() === false);

  win = loadMediaFx({ settings: { premiumAtmosphere: true }, reducedMotion: true });
  ok('premiumAtmosphere=true + reduced-motion=true → false', win.SeyFx.isPremiumFxEnabled() === false);
})();

// ── Test 3: shouldAnimate / prefersReducedMotion ────────────────────────────
console.log('\n[3] shouldAnimate / prefersReducedMotion');
(function(){
  var win = loadMediaFx({ settings: { premiumAtmosphere: true }, reducedMotion: false });
  ok('shouldAnimate true (premium açık)', win.SeyFx.shouldAnimate() === true);
  ok('prefersReducedMotion false', win.SeyFx.prefersReducedMotion() === false);

  win = loadMediaFx({ settings: { premiumAtmosphere: true }, reducedMotion: true });
  ok('prefersReducedMotion true (reduce)', win.SeyFx.prefersReducedMotion() === true);
  ok('shouldAnimate false (reduce)', win.SeyFx.shouldAnimate() === false);
})();

// ── Test 4: ambientAllowed / isSoundAllowed ─────────────────────────────────
console.log('\n[4] ambientAllowed / isSoundAllowed');
(function(){
  var win = loadMediaFx({ settings: { premiumAtmosphere: true, ambientSounds: true, uiSounds: false }, reducedMotion: false });
  ok('ambientAllowed true (ambient açık)', win.SeyFx.ambientAllowed() === true);
  ok('isSoundAllowed false (uiSounds kapalı)', win.SeyFx.isSoundAllowed() === false);

  win = loadMediaFx({ settings: { premiumAtmosphere: true, ambientSounds: false, uiSounds: true }, reducedMotion: false });
  ok('ambientAllowed false (ambient kapalı)', win.SeyFx.ambientAllowed() === false);
  ok('isSoundAllowed true (uiSounds açık)', win.SeyFx.isSoundAllowed() === true);

  win = loadMediaFx({ settings: { premiumAtmosphere: false, ambientSounds: true, uiSounds: true }, reducedMotion: false });
  ok('ambientAllowed false (premium kapalı)', win.SeyFx.ambientAllowed() === false);
  ok('isSoundAllowed false (premium kapalı)', win.SeyFx.isSoundAllowed() === false);
})();

// ── Test 5: ripple gating kapalıyken sessiz ─────────────────────────────────
console.log('\n[5] ripple gating kapalıyken hiçbir şey yapmaz');
(function(){
  var created = 0;
  var win = loadMediaFx({ settings: { premiumAtmosphere: false }, reducedMotion: false });
  // document.createElement'ı saymak için win.SeyFx.ripple öncesi DOM'u izole edelim:
  // SeyFx.ripple gating kapalıyken currentTarget'ı hiç kullanmamalı.
  var fakeEvent = { currentTarget: { getBoundingClientRect: function(){ return {left:0,top:0,width:100,height:100}; }, appendChild: function(){ created++; } } };
  win.SeyFx.ripple(fakeEvent, 'red');
  ok("premium kapalıyken ripple DOM'a dalga eklemez", created === 0, 'created: '+created);
})();

// ── Test 5b: delege katman açık hedefi ripple host'u yapar ─────────────────
console.log('\n[5b] ripple delege hedefini önceler');
(function(){
  var rootAdded = 0, targetAdded = 0;
  var win = loadMediaFx({ settings: { premiumAtmosphere: true }, reducedMotion: false });
  win.__testDocument.createElement = function(){ return { className:'', style:{}, remove:function(){} }; };
  var root = {
    getBoundingClientRect: function(){ return { left:0, top:0, width:200, height:400 }; },
    appendChild: function(){ rootAdded++; }
  };
  var target = {
    getBoundingClientRect: function(){ return { left:10, top:20, width:80, height:40 }; },
    appendChild: function(){ targetAdded++; }
  };
  win.SeyFx.ripple({ currentTarget:root, clientX:30, clientY:40 }, null, target);
  ok('açık hedef root yerine ripple host olur', targetAdded === 1 && rootAdded === 0, 'root='+rootAdded+', target='+targetAdded);
})();

// ── Test 6: countUp reduced-motion'da doğrudan hedef yazar ──────────────────
console.log('\n[6] countUp reduced-motion\'da doğrudan hedef yazar');
(function(){
  var textVal = '';
  var win = loadMediaFx({ settings: { premiumAtmosphere: true }, reducedMotion: true });
  var fakeEl = { set textContent(v){ textVal = v; }, get textContent(){ return textVal; } };
  win.SeyFx.countUp({ el: fakeEl, from: 0, to: 1500, duration: 500 });
  ok('reduced-motion\'da doğrudan 1500 yazar', String(textVal) === '1500', 'text: '+textVal);
})();

// ── Test 6b: sweepCounters ilk boyamayı atlar, değişimi yakalar ─────────────
console.log('\n[6b] sweepCounters ilk boyama ve değişim sözleşmesi');
(function(){
  function counter(key, value, initialText){
    var text = initialText == null ? String(value) : String(initialText);
    return {
      dataset: {},
      getAttribute: function(name){
        if(name === 'data-countup') return String(value);
        if(name === 'data-countup-key') return key;
        return null;
      },
      set textContent(next){ text = String(next); },
      get textContent(){ return text; }
    };
  }
  var opts = { settings: { premiumAtmosphere: true }, reducedMotion: true, counterNodes: [] };
  var first = counter('water', 2);
  opts.counterNodes = [first];
  var win = loadMediaFx(opts);
  win.SeyFx.sweepCounters();
  ok('ilk boyamada hedef metin değişmez', first.textContent === '2', 'text: '+first.textContent);

  var changed = counter('water', 5, 999);
  opts.counterNodes = [changed];
  win.SeyFx.sweepCounters();
  ok('yeni DOM düğümünde önceki değer anahtarla korunur', changed.textContent === '5', 'text: '+changed.textContent);
  ok('reduced-motion değişimi doğrudan hedefe geçirir', changed.textContent === '5');

  var liveOpts = { settings: { premiumAtmosphere: true }, reducedMotion: false, counterNodes: [] };
  liveOpts.counterNodes = [counter('streak', 3)];
  var liveWin = loadMediaFx(liveOpts);
  liveWin.SeyFx.sweepCounters();
  var call = null, callCount = 0;
  liveWin.SeyFx.countUp = function(options){ call = options; callCount++; };
  liveOpts.counterNodes = [counter('streak', 4)];
  liveWin.SeyFx.sweepCounters();
  ok('değer değişince countUp önceki ve hedef değerle çağrılır', callCount === 1 && call.from === 3 && call.to === 4 && call.duration === 500);
  liveWin.SeyFx.sweepCounters();
  ok('aynı değer yeniden animasyon başlatmaz', callCount === 1);
})();

// ── Test 7: shimmer gating açıkken class ekler, kapalıyken eklemez ──────────
console.log('\n[7] shimmer gating');
(function(){
  var added = [], removed = [];
  function fakeEl(){ return { classList: { add: function(c){ added.push(c); }, remove: function(c){ removed.push(c); } } }; }
  var win = loadMediaFx({ settings: { premiumAtmosphere: true }, reducedMotion: false });
  win.SeyFx.shimmer(fakeEl());
  ok("premium açıkken sey-shimmer class'ı eklenir", added.indexOf('sey-shimmer') >= 0);

  added = []; removed = [];
  win = loadMediaFx({ settings: { premiumAtmosphere: false }, reducedMotion: false });
  win.SeyFx.shimmer(fakeEl());
  ok('premium kapalıyken sey-shimmer eklenmez', added.length === 0);
})();

// ── Test 8: FX-P-86 — ring/bar shimmer bağlama noktaları ───────────────────
console.log('\n[8] FX-P-86 — habits ring + motivation bar shimmer');
(function(){
  var appSrc = fs.readFileSync(path.join(repoRoot, 'app.js'), 'utf8');
  // (1) sey-habits-ring-wrap id'si + guard'lı SeyFx.shimmer çağrısı birlikte geçiyor
  var ringBound = /sey-habits-ring-wrap[\s\S]{0,400}?getElementById\('sey-habits-ring-wrap'\)[\s\S]{0,120}?SeyFx\.shimmer/.test(appSrc) ||
                  (appSrc.indexOf('id="sey-habits-ring-wrap"') > -1 && appSrc.indexOf("getElementById('sey-habits-ring-wrap')") > -1 && appSrc.indexOf("getElementById('sey-habits-ring-wrap')") < appSrc.indexOf('window.SeyFx.shimmer(rw)'));
  ok('ring id + guard\'lı SeyFx.shimmer çağrısı birlikte', ringBound);
  // (2) sey-motivation-bar id'si + guard'lı SeyFx.shimmer çağrısı birlikte geçiyor
  var barBound = appSrc.indexOf('id="sey-motivation-bar"') > -1 &&
                 appSrc.indexOf("getElementById('sey-motivation-bar')") > -1 &&
                 /SeyOnSynced|completeMotivationTask[\s\S]{0,600}?getElementById\('sey-motivation-bar'\)/.test(appSrc) === false || /getElementById\('sey-motivation-bar'\)[\s\S]{0,120}?SeyFx\.shimmer/.test(appSrc);
  ok('motivation bar id + guard\'lı SeyFx.shimmer çağrısı birlikte', barBound);
})();

console.log('\n=== Özet ===');
console.log('Passed: '+passed+' / '+(passed+failed));
process.exit(failed ? 1 : 0);
