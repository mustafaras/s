(function(){
  'use strict';
  var CTX = null;
  function bootCtx(){
    if (CTX) return CTX;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    CTX = new AC();
    return CTX;
  }
  function settings(){ return (window.SeymaState && window.SeymaState.data && window.SeymaState.data.settings) || {}; }
  // FX-P-12: `allowReducedMotion` opsiyonel parametresi — kullanıcının bilinçli
  // tetiklediği kısa etkileşim sesleri (örn. zikir tıklama `tap()`) reduce-motion
  // altında da çalabilir; diğer sesler (success/warning/bell) sessiz kalır.
  function allowed(allowReducedMotion){
    var s = settings();
    if (!s.premiumAtmosphere || !s.uiSounds) return false;
    if (reducedMotion() && !allowReducedMotion) return false;
    return true;
  }
  function reducedMotion(){ return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }

  function playTone(freq, duration, type, gainValue, allowReducedMotion){
    if (!allowed(allowReducedMotion)) return;
    var ctx = bootCtx(); if (!ctx) return;
    try{
      if (ctx.state === 'suspended') ctx.resume();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(gainValue || 0.12, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    }catch(e){}
  }
  function playArpeggio(freqs, duration, type){
    if (!allowed()) return;
    var ctx = bootCtx(); if (!ctx) return;
    try{
      if (ctx.state === 'suspended') ctx.resume();
      var step = duration / freqs.length;
      freqs.forEach(function(f, i){
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime + i*step);
        gain.gain.setValueAtTime(0, ctx.currentTime + i*step);
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + i*step + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i*step + step*0.9);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i*step);
        osc.stop(ctx.currentTime + i*step + step);
      });
    }catch(e){}
  }
  // FX-P-11: yumuşak zil/kutu sesi — 880Hz sine + hafif vibrato (600ms).
  function playBell(freq, duration){
    if (!allowed()) return;
    var ctx = bootCtx(); if (!ctx) return;
    try{
      if (ctx.state === 'suspended') ctx.resume();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      var lfo = ctx.createOscillator();
      var lfoGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      // Hafif vibrato: LFO ~6Hz, ±6Hz frekans modülasyonu.
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(6, ctx.currentTime);
      lfoGain.gain.setValueAtTime(6, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      lfo.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
      lfo.stop(ctx.currentTime + duration);
    }catch(e){}
  }

  window.SeyAudio = {
    // ctx lazy init: her erişimde bootCtx() çağrılır; AudioContext yoksa null döner.
    get ctx(){ return bootCtx(); },
    tap: function(){ playTone(523, 0.18, 'triangle', 0.09, true); },
    success: function(){ playArpeggio([523, 784], 0.2, 'sine'); },
    warning: function(){ playTone(200, 0.25, 'sawtooth', 0.1); },
    bell: function(){ playBell(880, 0.6); },
    voice: function(text){
      if (!window.speechSynthesis || !text) return;
      try{
        var s = settings();
        if (!s.voiceGuidance || !s.premiumAtmosphere) return;
        var u = new SpeechSynthesisUtterance(text);
        u.lang = 'tr-TR';
        u.rate = 1.0;
        u.pitch = 1.0;
        window.speechSynthesis.speak(u);
      }catch(e){}
    },
    ambient: function(type){
      // Faz 4'te doldurulacak.
    }
  };

  window.SeyHaptics = {
    tap: function(){ haptic([15]); },
    success: function(){ haptic([20, 30, 50]); },
    error: function(){ haptic([40, 20, 40]); },
    refresh: function(){ haptic([10, 20, 10, 20, 10]); },
    streak: function(){ haptic([30, 50, 80]); },
    water: function(){ haptic([10, 15, 10]); }
  };

  // FX-P-21: `haptic()` — SeyHaptics desenlerini navigator.vibrate üzerinden
  // çalar. Gating: premiumAtmosphere + richHaptics (zenginleştirilmiş pattern)
  // + eski `haptics` alanı (legacy uyum) + prefers-reduced-motion. iOS Safari
  // navigator.vibrate desteklemediği için sessizce no-op (görsel fallback
  // zorunlu — bkz. FX-LIBRARY.md §2).
  function haptic(pattern){
    var s = settings();
    var motionOk = !reducedMotion();
    var hapticsOn = !!s.richHaptics;
    // Eski `settings.haptics` alanı varsa onu da kontrol et (legacy uyum).
    if (s.haptics === false) return;
    if (!navigator.vibrate || !s.premiumAtmosphere || !hapticsOn || !motionOk) return;
    try{ navigator.vibrate(pattern); }catch(e){}
  }

  // FX-P-31: SeyFx — tüm görsel micro-FX için master gating tek noktada.
  // `settings()` helper'ı (window.SeymaState.data.settings) gerçek kaynaktır;
  // prompt'taki `currentSettings()` (SeymaConstants.data) gerçek kodda yoktur.
  function prefersReducedMotion(){ return reducedMotion(); }
  function isPremiumFxEnabled(){
    var s = settings();
    if (s.premiumAtmosphere === false) return false;
    if (prefersReducedMotion()) return false;
    return true;
  }
  function shouldAnimate(){ return isPremiumFxEnabled(); }
  function ambientAllowed(){
    var s = settings();
    return isPremiumFxEnabled() && s.ambientSounds === true;
  }
  function isSoundAllowed(){
    var s = settings();
    return isPremiumFxEnabled() && s.uiSounds !== false;
  }

  window.SeyFx = {
    isPremiumFxEnabled: isPremiumFxEnabled,
    prefersReducedMotion: prefersReducedMotion,
    shouldAnimate: shouldAnimate,
    ambientAllowed: ambientAllowed,
    isSoundAllowed: isSoundAllowed,
    countUp: function(options){
      // FX-P-34'te doldurulacak.
    },
    ripple: function(event, color){
      // FX-P-32: dokunma koordinatlarına göre CSS ripple dalgası üretir.
      // Master switch (premiumAtmosphere) + reduced-motion kapalıyken sessiz.
      if (!isPremiumFxEnabled()) return;
      var el = event && event.currentTarget;
      if (!el) return;
      var rect = el.getBoundingClientRect();
      var x = (event.clientX || rect.left + rect.width/2) - rect.left;
      var y = (event.clientY || rect.top + rect.height/2) - rect.top;
      var d = Math.max(rect.width, rect.height) * 2;
      var wave = document.createElement('span');
      wave.className = 'sey-ripple-wave';
      wave.style.left = (x - d/2) + 'px';
      wave.style.top = (y - d/2) + 'px';
      wave.style.width = wave.style.height = d + 'px';
      if (color) wave.style.background = color;
      el.appendChild(wave);
      setTimeout(function(){ wave.remove(); }, 600);
    },
    shimmer: function(element){
      // FX-P-33'te doldurulacak.
    }
  };
})();
