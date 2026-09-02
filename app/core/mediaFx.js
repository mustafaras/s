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
  // FX-P-51: sesli rehberlik için değer sınırlama helper'ı.
  function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }
  // FX-P-52: sessiz zaman penceresi (23:00–07:00). `h` verilmezse gerçek saat
  // okunur; voice ve ambient bu pencerede sessiz kalır (haptics/görsel FX
  // etkilenmez — bkz. FX-P-58 quiet-time matrisi).
  function isQuietTime(h){
    var hour = (h == null) ? (new Date().getHours()) : Number(h);
    if (isNaN(hour)) return false;
    hour = ((Math.floor(hour) % 24) + 24) % 24;
    return hour >= 23 || hour < 7;
  }

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
    // FX-P-51: metin tabanlı sesli rehberlik. Web Speech API (speechSynthesis)
    // üzerinden çalışır; yoksa veya gating kapalıysa sessizce false döner.
    isVoiceEnabled: function(){
      return !!(settings() && settings().voiceGuidance && typeof window.speechSynthesis !== 'undefined' && window.speechSynthesis);
    },
    // FX-P-52: sessiz zaman penceresi (23:00–07:00) yardımcısı.
    isQuietTime: isQuietTime,
    voice: function(text, opts){
      opts = opts || {};
      if (!isPremiumFxEnabled() || !window.SeyAudio.isVoiceEnabled()) return false;
      // FX-P-52: quiet-time (23:00–07:00) penceresinde sesli rehberlik sessiz.
      if (isQuietTime()) return false;
      if (typeof window.speechSynthesis === 'undefined' || !window.speechSynthesis) return false;
      if (window.speechSynthesis.speaking){
        if (!opts.force) return false;
        try { window.speechSynthesis.cancel(); }catch(e){}
      }
      var u = new SpeechSynthesisUtterance(text);
      var voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
      if (opts.lang) u.lang = opts.lang;
      if (opts.rate) u.rate = clamp(opts.rate, 0.5, 2);
      if (opts.pitch) u.pitch = clamp(opts.pitch, 0.5, 2);
      if (Array.isArray(opts.voiceNames) && voices.length){
        var preferred = voices.find(function(v){ return opts.voiceNames.indexOf(v.name) >= 0 || opts.voiceNames.indexOf(v.lang) >= 0; });
        if (preferred) u.voice = preferred;
      }
      try {
        window.speechSynthesis.speak(u);
        return true;
      }catch(e){
        return false;
      }
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
      // FX-P-34: sayaç değerlerini yumuşak artışla günceller.
      // reduced-motion'da doğrudan hedef değeri yazar (animasyonu atlar).
      // Not: isPremiumFxEnabled yerine settings().premiumAtmosphere'u kontrol
      // ederiz — reduced-motion'da animasyonu atlayıp hedef değeri yazmak
      // gerekir (gating'i tamamen atlamaz, sadece animasyonu atlar).
      if (typeof options !== 'object' || !options.el) return;
      var s = settings();
      if (s.premiumAtmosphere === false) return;
      var from = Number(options.from) || 0;
      var to = Number(options.to) || 0;
      var duration = Math.max(0, Math.min(Number(options.duration) || 800, 2000));
      var formatter = typeof options.formatter === 'function' ? options.formatter : function(v){ return Math.round(v); };
      // Reduced-motion: animasyonu atla, hedef değeri doğrudan yaz.
      if (prefersReducedMotion()){
        try{ options.el.textContent = formatter(to); }catch(e){}
        return;
      }
      var start = performance && performance.now ? performance.now() : Date.now();
      var raf = window.requestAnimationFrame || window.setTimeout;
      function tick(now){
        var t = (now - start) / duration;
        if (t < 0) t = 0;
        if (t > 1) t = 1;
        var v = from + (to - from) * t;
        try { options.el.textContent = formatter(v); } catch(e){}
        if (t < 1) raf(tick);
      }
      raf(tick);
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
      // FX-P-33: kutlama/yükleme durumunda geçici shimmer sınıfı ekler.
      if (!isPremiumFxEnabled() || !element) return;
      element.classList.add('sey-shimmer');
      setTimeout(function(){ element.classList.remove('sey-shimmer'); }, 1400);
    },
    enter: function(selector, staggerMs){
      // FX-P-37: sayfa/kart giriş animasyonu — fade/slide, staggered.
      if (!shouldAnimate() || !document.querySelectorAll) return;
      var nodes = typeof selector === 'string' ? document.querySelectorAll(selector) : [selector];
      staggerMs = Math.max(0, Math.min(Number(staggerMs) || 60, 200));
      Array.prototype.forEach.call(nodes, function(el, i){
        if (!el || !el.classList) return;
        el.classList.remove('sey-enter');
        el.style.animationDelay = (i * staggerMs) + 'ms';
        void el.offsetWidth;
        el.classList.add('sey-enter');
      });
    },
    transition: function(el, property, durationMs){
      // FX-P-37: tek property için CSS transition helper.
      if (!shouldAnimate()) return;
      if (!el || !el.style) return el;
      durationMs = Math.max(0, Math.min(Number(durationMs) || 200, 1000));
      el.style.transition = property + ' ' + durationMs + 'ms ease';
      return el;
    }
  };
})();
