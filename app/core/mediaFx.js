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
  function allowed(){
    var s = settings();
    return !!s.premiumAtmosphere && !!s.uiSounds && !reducedMotion();
  }
  function reducedMotion(){ return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }

  function playTone(freq, duration, type, gainValue){
    if (!allowed()) return;
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

  window.SeyAudio = {
    ctx: CTX,
    tap: function(){ playTone(880, 0.12, 'sine', 0.08); },
    success: function(){ playArpeggio([523, 659, 784], 0.35, 'sine'); },
    warning: function(){ playTone(220, 0.25, 'sawtooth', 0.1); },
    bell: function(){ playTone(880, 0.6, 'sine', 0.1); },
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
    tap: function(){ haptic([12]); },
    success: function(){ haptic([20, 60, 20]); },
    error: function(){ haptic([30, 30, 30]); },
    refresh: function(){ haptic([10, 40, 10]); },
    streak: function(){ haptic([15, 30, 15, 30, 15]); },
    water: function(){ haptic([8, 16, 24, 16, 8]); }
  };

  function haptic(pattern){
    var s = settings();
    var motionOk = !reducedMotion();
    var hapticsOn = !!s.richHaptics;
    if (!navigator.vibrate || !s.premiumAtmosphere || !hapticsOn || !motionOk) return;
    try{ navigator.vibrate(pattern); }catch(e){}
  }

  window.SeyFx = {
    isPremiumFxEnabled: function(){ return !!settings().premiumAtmosphere && !reducedMotion(); },
    prefersReducedMotion: reducedMotion,
    shouldAnimate: function(){ return window.SeyFx.isPremiumFxEnabled(); },
    ambientAllowed: function(){ return !!settings().premiumAtmosphere && !!settings().ambientSounds; },
    countUp: function(options){
      // Faz 3'te doldurulacak.
    },
    ripple: function(event, color){
      // Faz 3'te doldurulacak.
    },
    shimmer: function(element){
      // Faz 3'te doldurulacak.
    }
  };
})();
