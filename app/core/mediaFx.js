(function(){
  'use strict';
  var CTX = null;
  var ACTIVE_VOICES = [];
  function bootCtx(){
    if (CTX) return CTX;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    CTX = new AC();
    try{ installMasterBus(CTX); }catch(e){}
    return CTX;
  }
  // FX2-11: Tek seferlik ortak ses yolu. Özellik desteği dar mock/browserlarda
  // yoksa üreticiler destination'a güvenli biçimde düşer; dış SeyAudio API'si
  // ve gating davranışı değişmez.
  function installMasterBus(ctx){
    if (!ctx || ctx._seyAudioGraph) return ctx && ctx._seyAudioGraph;
    var graphFactories = ['createGain','createDynamics'+'Compressor','createWave'+'Shaper','createCon'+'volver','createBuffer'];
    if (!graphFactories.every(function(name){ return typeof ctx[name] === 'function'; })) return null;
    var bus = ctx.createGain();
    var compressor = ctx.createDynamicsCompressor();
    var limiter = ctx.createWaveShaper();
    var reverbSend = ctx.createGain();
    var convolver = ctx.createConvolver();
    var curve = new Float32Array(1024);
    var normalizer = Math.tanh(1.6);
    for (var i=0;i<curve.length;i++){
      var x = (i / (curve.length - 1)) * 2 - 1;
      curve[i] = Math.tanh(1.6 * x) / normalizer;
    }
    limiter.curve = curve;
    limiter.oversample = '2x';
    bus.gain.value = 0.8;
    compressor.threshold.value = -18;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.12;
    reverbSend.gain.value = 1;
    var len = Math.max(1, Math.floor((ctx.sampleRate || 44100) * 0.9));
    var impulse = ctx.createBuffer(2, len, ctx.sampleRate || 44100);
    for (var channel=0;channel<2;channel++){
      var samples = impulse.getChannelData(channel);
      for (var sample=0;sample<len;sample++) samples[sample] = (Math.random()*2-1) * Math.pow(1 - sample/len, 2.4);
    }
    convolver.buffer = impulse;
    bus.connect(compressor); compressor.connect(limiter); limiter.connect(ctx.destination);
    reverbSend.connect(convolver); convolver.connect(bus);
    ctx._seyAudioGraph = { bus:bus, compressor:compressor, limiter:limiter, reverbSend:reverbSend, convolver:convolver };
    return ctx._seyAudioGraph;
  }
  // TAM-DENETIM B-13: sessiz saatlerde (23:00–07:00) UI sesleri TAM SESTE
  // çalıyordu. Sözleşme quiet-time'ı bilinçli olarak yalnız `voice` ve
  // `ambient` ile sınırlıyordu (bkz. isQuietTime yorumu), ama gece 03:00'te
  // uygulamaya dokunan kullanıcı tam ses tık alıyordu — ölçüldü: tap RMS
  // 0,02872 (gündüzle aynı). Tamamen susturmak yerine ZAYIFLATMA: kullanıcı
  // uiSounds'ı bilinçli açtıysa geri bildirim kaybolmamalı, sadece incelmeli.
  // Tek nokta: master bus kazancı. Ses üretim yolları hiç değişmez.
  var BUS_GAIN_NORMAL = 0.8, BUS_GAIN_QUIET = 0.28;
  function syncBusGain(ctx){
    try{
      var g = ctx && ctx._seyAudioGraph && ctx._seyAudioGraph.bus;
      if (!g || !g.gain) return;
      var want = isQuietTime() ? BUS_GAIN_QUIET : BUS_GAIN_NORMAL;
      if (g.gain.value !== want) g.gain.value = want;
    }catch(e){}
  }
  function outputFor(ctx){
    syncBusGain(ctx);
    return (ctx && ctx._seyAudioGraph && ctx._seyAudioGraph.bus) || (ctx && ctx.destination);
  }
  function removeActive(entry){
    var index = ACTIVE_VOICES.indexOf(entry);
    if (index >= 0) ACTIVE_VOICES.splice(index,1);
  }
  function stopActive(entry, ctx){
    if (!entry || entry.stopped) return;
    entry.stopped = true;
    var now = ctx.currentTime || 0;
    try{
      var g = entry.gain && entry.gain.gain;
      if (g){
        if (g.cancelScheduledValues) g.cancelScheduledValues(now);
        if (g.setValueAtTime) g.setValueAtTime(Math.max(0.0001, g.value || 0.0001), now);
        if (g.exponentialRampToValueAtTime) g.exponentialRampToValueAtTime(0.0001, now + 0.02);
      }
    }catch(e){}
    try{ if (entry.node && entry.node.stop) entry.node.stop(now + 0.02); }catch(e){}
    removeActive(entry);
  }
  function reserveVoice(ctx){ while (ACTIVE_VOICES.length >= 6) stopActive(ACTIVE_VOICES[0], ctx); }
  function trackVoice(ctx, node, gain, until){
    var entry = { node:node, gain:gain, stopped:false };
    ACTIVE_VOICES.push(entry);
    try{ node.onended = function(){ removeActive(entry); }; }catch(e){}
    try{ setTimeout(function(){ removeActive(entry); }, Math.max(20, Math.ceil((until - (ctx.currentTime || 0)) * 1000) + 40)); }catch(e){}
    return entry;
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
  // Doğal ses seçimi: aynı dilde birden çok ses varsa en iyi kaliteyi seç.
  // Öncelik: (1) Enhanced/Premium etiketli varyant, (2) tam dil eşleşmesi,
  // (3) aynı dil ailesi. FX-LIBRARY §1.6'ya göre doğal prosodi hedefler.
  function pickVoice(voices, lang){
    if (!voices || !voices.length) return null;
    var langPrefix = String(lang || 'tr').slice(0, 2).toLowerCase();
    var exact = voices.filter(function(v){ return v.lang && v.lang.toLowerCase() === String(lang).toLowerCase(); });
    var pool = exact.length ? exact : voices.filter(function(v){ return v.lang && v.lang.toLowerCase().slice(0, 2) === langPrefix; });
    if (!pool.length) return null;
    // Kalite varyantı: adında Enhanced/Premium/Neural/Siri geçen sesler daha doğaldır.
    var premium = pool.filter(function(v){ return /enhanced|premium|neural|natural/i.test(v.name); });
    if (premium.length) return premium[0];
    // Yerel (offline) sesler network seslerinden genelde daha tutarlıdır.
    var local = pool.filter(function(v){ return v.localService; });
    if (local.length) return local[0];
    return pool[0];
  }
  // ── Bulut TTS (premium sinirsel sesler) ──
  // Yerel sistem sesleri (Yelda vb.) robotik kaldığı için, kullanıcı OpenAI
  // anahtarı girdiyse OpenAI TTS API'si (gpt-4o-mini-tts/tts-1) üzerinden
  // sinirsel sesle okunur; anahtar yoksa veya ağ hatasında yerel TTS'e düşer.
  // Ses üretimi kullanıcı etkileşimiyle tetiklenen akışlarda çağrılır (SAFEGUARDS).
  var CLOUD_TTS = {
    enabled: function(){
      var s = settings();
      return !!(s && s.voiceCloudTts && s.openaiKey && String(s.openaiKey).trim());
    },
    key: function(){
      var s = settings();
      return s && s.openaiKey ? String(s.openaiKey).trim() : '';
    },
    // voiceName: 'nova'|'shimmer'|'coral'|'sage'|'juniper'|… (settings.voiceCloudVoice)
    speak: function(text, opts, onDone){
      var self = this;
      var s = settings();
      var model = (s && s.voiceCloudModel) || 'gpt-4o-mini-tts';
      var voiceName = (opts && opts.cloudVoice) || (s && s.voiceCloudVoice) || 'shimmer';
      var speed = clamp((opts && opts.rate) || (s && s.voiceRate) || 0.95, 0.75, 1.5);
      var key = this.key();
      try{
        if (window.SeyAudio._cloudAbort) { try{ window.SeyAudio._cloudAbort.abort(); }catch(e){} }
        var ac = new (window.AudioContext || window.webkitAudioContext)();
        window.SeyAudio._cloudAbort = ac._ctrl = null;
        var ctrl = new AbortController();
        window.SeyAudio._cloudAbort = ctrl;
        fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          signal: ctrl.signal,
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
          body: JSON.stringify({ model: model, voice: voiceName, input: String(text).slice(0, 400), speed: speed, response_format: 'mp3' })
        }).then(function(r){
          if (!r.ok) throw new Error('tts_http_' + r.status);
          return r.blob();
        }).then(function(blob){
          var url = URL.createObjectURL(blob);
          var el = new Audio(url);
          el.volume = (opts && opts.volume != null) ? opts.volume : 0.85;
          el.onended = function(){ try{ URL.revokeObjectURL(url); }catch(e){} if (onDone) onDone(true); };
          el.onerror = function(){ try{ URL.revokeObjectURL(url); }catch(e){} if (onDone) onDone(false); };
          window.SeyAudio._cloudAudio = el;
          var p = el.play();
          if (p && p.catch) p.catch(function(){ if (onDone) onDone(false); });
        }).catch(function(){
          if (onDone) onDone(false); // çağıran yerel TTS'e düşer
        });
        return true;
      }catch(e){ if (onDone) onDone(false); return false; }
    },
    stop: function(){
      try{ if (window.SeyAudio._cloudAbort) window.SeyAudio._cloudAbort.abort(); }catch(e){}
      try{ if (window.SeyAudio._cloudAudio) window.SeyAudio._cloudAudio.pause(); }catch(e){}
      window.SeyAudio._cloudAudio = null;
    },
    isPlaying: function(){
      try{ return !!(window.SeyAudio._cloudAudio && !window.SeyAudio._cloudAudio.paused); }catch(e){ return false; }
    }
  };

  // FX2-11: Dış SeyAudio.voice ile karışmayan ortak osilatör üreticisi.
  // Her partial bağımsız olarak polifoni sınırına dahildir; altı kökten fazlası
  // eski sesi 20 ms içinde kapatarak yeni kullanıcı etkileşimine yer açar.
  function playVoice(options){
    options = options || {};
    var ctx = bootCtx(); if (!ctx || !ctx.createOscillator || !ctx.createGain) return false;
    try{
      // FX2-13: iOS kilidi yalnız gerçek pointer jestinde SeyTouch açar.
      // Ses gövdesi bağlamı asla kendi başına resume etmez.
      if (ctx.state !== 'running') return false;
      var start = (ctx.currentTime || 0) + Math.max(0, Number(options.delay) || 0);
      var duration = Math.max(0.01, Number(options.dur) || 0.18);
      var attack = Math.max(0.001, Math.min(duration * 0.5, Number(options.attack) || 0.01));
      var gainValue = Math.max(0.0001, Number(options.gain) || 0.12) * (0.92 + Math.random()*0.16);
      var partials = Array.isArray(options.partials) && options.partials.length ? options.partials : [[1,1]];
      partials.forEach(function(partial){
        reserveVoice(ctx);
        var ratio = Number(partial && partial[0]) || 1;
        var level = Number(partial && partial[1]); if (!isFinite(level)) level = 1;
        var osc = ctx.createOscillator();
        var envelope = ctx.createGain();
        var filter = null;
        osc.type = options.type || 'sine';
        if (osc.frequency && osc.frequency.setValueAtTime) osc.frequency.setValueAtTime((Number(options.freq) || 440) * ratio, start);
        if (options.detune && osc.detune) osc.detune.value = (Math.random()*2-1) * 12;
        if (options.filter && ctx.createBiquadFilter){
          filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          if (filter.frequency && filter.frequency.setValueAtTime) filter.frequency.setValueAtTime(Number(options.filter), start);
          else if (filter.frequency) filter.frequency.value = Number(options.filter);
          if (options.filterEnd && filter.frequency && filter.frequency.linearRampToValueAtTime) filter.frequency.linearRampToValueAtTime(Number(options.filterEnd), start + duration);
        }
        var amp = gainValue * Math.max(0, level);
        envelope.gain.setValueAtTime(0, start);
        envelope.gain.linearRampToValueAtTime(amp, start + attack);
        envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        if (filter){ osc.connect(filter); filter.connect(envelope); }
        else osc.connect(envelope);
        envelope.connect(outputFor(ctx));
        // Wet yol yalnız tam Web Audio grafiğinde kurulur; eski küçük mock'lar
        // bir ekstra GainNode görmeden temel API sözleşmesini korur.
        if (options.reverb > 0 && ctx._seyAudioGraph && ctx._seyAudioGraph.reverbSend){
          var wet = ctx.createGain();
          wet.gain.setValueAtTime(Math.max(0, Math.min(1, Number(options.reverb) || 0)), start);
          envelope.connect(wet); wet.connect(ctx._seyAudioGraph.reverbSend);
        }
        var until = start + duration;
        trackVoice(ctx, osc, envelope, until);
        osc.start(start); osc.stop(until);
      });
      return true;
    }catch(e){ return false; }
  }
  // Kısa band-pass gürültü transient'i tonu tek başına "bip" olmaktan çıkarır.
  function playNoise(options){
    options = options || {};
    var ctx = bootCtx();
    if (!ctx || !ctx.createBuffer || !ctx.createBufferSource || !ctx.createBiquadFilter || !ctx.createGain) return false;
    try{
      if (ctx.state !== 'running') return false;
      var start = (ctx.currentTime || 0) + Math.max(0, Number(options.delay) || 0);
      var duration = Math.max(0.006, Math.min(0.12, Number(options.dur) || 0.025));
      var length = Math.max(1, Math.floor((ctx.sampleRate || 44100) * duration));
      var buffer = ctx.createBuffer(1, length, ctx.sampleRate || 44100);
      var data = buffer.getChannelData(0);
      for (var i=0;i<length;i++) data[i] = Math.random()*2-1;
      reserveVoice(ctx);
      var source = ctx.createBufferSource();
      var filter = ctx.createBiquadFilter();
      var envelope = ctx.createGain();
      source.buffer = buffer;
      filter.type = 'bandpass';
      if (filter.frequency && filter.frequency.setValueAtTime) filter.frequency.setValueAtTime(Number(options.freq) || 2400, start);
      else if (filter.frequency) filter.frequency.value = Number(options.freq) || 2400;
      if (filter.Q) filter.Q.value = Number(options.q) || 1.2;
      var gainValue = Math.max(0.0001, Number(options.gain) || 0.016);
      envelope.gain.setValueAtTime(0, start);
      envelope.gain.linearRampToValueAtTime(gainValue, start + Math.min(0.004, duration * 0.3));
      envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      source.connect(filter); filter.connect(envelope); envelope.connect(outputFor(ctx));
      trackVoice(ctx, source, envelope, start + duration);
      source.start(start); source.stop(start + duration);
      return true;
    }catch(e){ return false; }
  }
  function playTone(freq, duration, type, gainValue, allowReducedMotion, options){
    if (!allowed(allowReducedMotion)) return;
    options = options || {};
    playVoice({ freq:freq, type:type || 'sine', dur:duration, attack:options.attack || 0.01, gain:gainValue || 0.12, filter:options.filter || 2800, filterEnd:options.filterEnd, detune:options.detune !== false, reverb:options.reverb == null ? 0.08 : options.reverb });
    playNoise({ dur:options.transientDur || 0.022, freq:options.transientFreq || 2600, q:options.transientQ || 1.4, gain:options.transientGain || 0.012 });
  }
  function playArpeggio(freqs, duration, type, options){
    if (!allowed()) return;
    options = options || {};
    var step = options.interval == null ? duration / freqs.length : options.interval;
    freqs.forEach(function(freq, index){
      playVoice({ freq:freq, type:type || 'sine', dur:options.noteDur || step * 0.9, delay:index * step, attack:options.attack || 0.01, gain:options.gain || 0.1, filter:options.filter || 3400, filterEnd:options.filterEnd, detune:options.detune !== false, reverb:options.reverb == null ? 0.14 : options.reverb });
    });
    playNoise({ dur:options.transientDur || 0.02, freq:options.transientFreq || 3000, q:options.transientQ || 1.6, gain:options.transientGain || 0.01 });
  }
  // FX2-12: altı inharmonik partial'lı metalik çan; dış bell() imzası korunur.
  function playBell(freq, duration){
    if (!allowed()) return;
    playVoice({ freq:freq, type:'sine', dur:duration, attack:0.02, gain:0.1, filter:4800, detune:true, reverb:0.45, partials:[[1,1],[2.76,.6],[5.40,.4],[8.93,.25],[13.34,.15],[18.40,.1]] });
    playNoise({ dur:0.018, freq:3600, q:2.1, gain:0.008 });
  }

  window.SeyAudio = {
    // ctx lazy init: her erişimde bootCtx() çağrılır; AudioContext yoksa null döner.
    get ctx(){ return bootCtx(); },
    // FX2-13: yalnız gerçek pointerdown jestinde true olur; iOS ses kilidi durumu.
    _unlocked: false,
    isAudible: function(){
      try{ var c = bootCtx(); return !!(c && c.state === 'running' && allowed()); }
      catch(e){ return false; }
    },
    // TAM-DENETIM B-12: ölçülen tepe RMS 0,00085 idi — `tap`ın (0,02584) ~1/30'u
    // ve taban gürültünün yalnız 11 katı; hoparlörle günlük kullanımda kayboluyordu.
    // Kazanç 0,012 → 0,055, süre 22 → 30 ms. Tık hâlâ `tap`tan belirgin biçimde
    // daha sönük kalır (amaç bu: zikir sayacı için arka planda bir nabız), ama
    // artık gerçekten duyulur.
    tick: function(){ if (allowed(true)) playNoise({ dur:0.030, freq:4000, q:2.4, gain:0.055 }); },
    tap: function(){ playTone(660, 0.045, 'sine', 0.065, true, { transientDur:0.008, transientFreq:4000, transientQ:2.4, transientGain:0.01, filter:3600, filterEnd:3000, reverb:0.03 }); },
    toggleOn: function(){ playArpeggio([587, 784], 0.09, 'sine', { interval:0.035, noteDur:0.055, gain:0.07, filter:3200, reverb:0.07, transientDur:0.008 }); },
    toggleOff: function(){ playArpeggio([784, 587], 0.09, 'sine', { interval:0.035, noteDur:0.055, gain:0.06, filter:2800, reverb:0.05, transientDur:0.008 }); },
    nav: function(){ if (allowed()) { playVoice({ freq:494, type:'sine', dur:0.11, attack:0.008, gain:0.06, filter:1100, filterEnd:3000, detune:true, reverb:0.06 }); playNoise({ dur:0.01, freq:2800, q:1.4, gain:0.007 }); } },
    sheetOpen: function(){ if (allowed()) { playVoice({ freq:392, type:'sine', dur:0.18, attack:0.012, gain:0.045, filter:2800, filterEnd:900, detune:true, reverb:0.12 }); playNoise({ dur:0.025, freq:1800, q:0.9, gain:0.008 }); } },
    sheetClose: function(){ if (allowed()) { playVoice({ freq:587, type:'sine', dur:0.14, attack:0.008, gain:0.04, filter:800, filterEnd:3000, detune:true, reverb:0.08 }); playNoise({ dur:0.014, freq:2600, q:1.5, gain:0.006 }); } },
    success: function(){ playArpeggio([523, 659, 784], 0.42, 'sine', { interval:0.06, noteDur:0.30, gain:0.085, filter:3800, reverb:0.18, transientDur:0.012 }); },
    bell: function(){ playBell(880, 0.9); },
    warning: function(){ playTone(392, 0.26, 'triangle', 0.07, false, { filter:2400, filterEnd:1400, reverb:0.05, transientDur:0.012, transientFreq:1900, transientGain:0.008 }); },
    error: function(){ playArpeggio([330, 294], 0.3, 'triangle', { interval:0.07, noteDur:0.20, gain:0.035, filter:1800, reverb:0.04, transientDur:0.012, transientFreq:1500, transientGain:0.006 }); },
    // FX-P-51: metin tabanlı sesli rehberlik. Web Speech API (speechSynthesis)
    // üzerinden çalışır; yoksa veya gating kapalıysa sessizce false döner.
    isVoiceEnabled: function(){
      return !!(settings() && settings().voiceGuidance && typeof window.speechSynthesis !== 'undefined' && window.speechSynthesis);
    },
    // FX-P-52: sessiz zaman penceresi (23:00–07:00) yardımcısı.
    isQuietTime: isQuietTime,
    // FX-P-55: kısa, sıcak ve saygılı sesli ipucu yardımcıları. Tümü
    // SeyAudio.voice'e delege eder — quiet-time ve voiceGuidance gating'i
    // orada uygulanır; çağıran tarafın ekstra kontrolü gerekmez.
    guides: {
      zikirStart: function(){ return window.SeyAudio.voice('Başla, kalbin yumuşasın.', { lang: 'tr-TR', rate: 1 }); },
      zikirHalf: function(){ return window.SeyAudio.voice('Yarısı bitti, nefes al.', { lang: 'tr-TR', rate: 1 }); },
      zikirComplete: function(){ return window.SeyAudio.voice('Tamamladın. Allah kabul etsin.', { lang: 'tr-TR', rate: 1 }); },
      suraOpen: function(name){ return window.SeyAudio.voice(String(name || 'Sure') + ' açıldı. Huşuyla oku.', { lang: 'tr-TR', rate: 1 }); },
      suraBookmark: function(){ return window.SeyAudio.voice('Yer işareti koydun.', { lang: 'tr-TR', rate: 1 }); }
    },
    // FX-P-56: mevcut zaman dilimine göre kısa, samimi selamlama. SeyTimeTheme
    // yoksa veya premiumAtmosphere/voiceGuidance/quiet-time kapalıysa sessizce
    // false döner (tüm gating SeyAudio.voice içinde).
    greeting: function(){
      if (!window.SeyTimeTheme || typeof window.SeyTimeTheme.classForHour !== 'function') return false;
      var cls = window.SeyTimeTheme.classForHour();
      var map = {
        'theme-time-dawn': 'Günaydın, Sevgili Günışığı. Yeni bir gün, yeni bir başlangıç.',
        'theme-time-day': 'Merhaba, Günışığı. Günün ortasında ne hissediyorsun?',
        'theme-time-dusk': 'İyi akşamlar, Günışığı. Günü yavaşça kapatma vakti.',
        'theme-time-night': 'İyi geceler, Sevgili Günışığı. Huzurla dinlen.'
      };
      var text = map[cls] || map['theme-time-day'];
      return window.SeyAudio.voice(text, { lang: 'tr-TR', rate: 1 });
    },
    voice: function(text, opts){
      opts = opts || {};
      if (!isPremiumFxEnabled() || !window.SeyAudio.isVoiceEnabled()) return false;
      // FX-P-52: quiet-time (23:00–07:00) penceresinde sesli rehberlik sessiz.
      if (isQuietTime()) return false;
      // ── Bulut TTS: anahtar varsa HER ZAMAN sinirsel ses kullanılır.
      // FX2-26: voiceLocalFallback varsayılan AÇIK — bulut başarısızsa yerel
      // (robotik) sese düşülür, sessizlikten iyidir. Kullanıcı kapatırsa
      // (voiceLocalFallback=false) sessizce atlanır, robotik ses duyulmaz.
      if (CLOUD_TTS.enabled() && !opts.localOnly){
        var allowFallback = !!(settings() && settings().voiceLocalFallback);
        try{ if (window.speechSynthesis) window.speechSynthesis.cancel(); }catch(e){}
        CLOUD_TTS.speak(text, opts, function(ok){
          if (!ok && allowFallback && !opts.noFallback){
            try{ window.SeyAudio.speakLocal(text, opts); }catch(e){}
          }
        });
        return true;
      }
      // Bulut ayarı yoksa: yalnız voiceLocalFallback=true ise yerel, aksi halde sessiz.
      if (settings() && settings().voiceLocalFallback) return window.SeyAudio.speakLocal(text, opts);
      return false;
    },
    // Yerel (tarayıcı) TTS — bulut kullanılamadığında yedek. FX-P-51 davranışı.
    speakLocal: function(text, opts){
      opts = opts || {};
      if (typeof window.speechSynthesis === 'undefined' || !window.speechSynthesis) return false;
      if (window.speechSynthesis.speaking){
        if (!opts.force) return false;
        try { window.speechSynthesis.cancel(); }catch(e){}
      }
      var u = new SpeechSynthesisUtterance(text);
      var voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
      // FX-P-57: lang/rate verilmezse kullanıcı ayarlarından okunur
      // (settings.voiceLang / settings.voiceRate), ayar yoksa güvenli default.
      var s = settings();
      var lang = opts.lang || (s && s.voiceLang) || 'tr-TR';
      // FX-LIBRARY §1.6 doğal prosodi: tempo biraz yavaş (0.92), ton hafif
      // yumuşak (1.05), ses düzeyi biraz kısık (0.7). opts ile aşılabilir.
      var rate = (opts.rate != null) ? opts.rate : ((s && s.voiceRate != null) ? Number(s.voiceRate) : 0.92);
      if (lang) u.lang = lang;
      if (rate) u.rate = clamp(Number(rate) || 0.92, 0.75, 1.5);
      u.pitch = clamp(opts.pitch != null ? opts.pitch : (s && s.voicePitch != null ? Number(s.voicePitch) : 1.05), 0.5, 2);
      u.volume = clamp(opts.volume != null ? opts.volume : 0.7, 0, 1);
      // Ses seçimi önceliği: (1) opts.voiceNames, (2) settings.voiceVoiceName,
      // (3) pickVoice ile otomatik en-doğal seçim. Ses listesi Chrome'da
      // asenkron dolar; ilk çağrıda boşsa varsayılana bırakılır (kabul edilebilir).
      var chosen = null;
      if (Array.isArray(opts.voiceNames) && voices.length){
        chosen = voices.find(function(v){ return opts.voiceNames.indexOf(v.name) >= 0 || opts.voiceNames.indexOf(v.lang) >= 0; }) || null;
      }
      if (!chosen && s && s.voiceVoiceName && voices.length){
        chosen = voices.find(function(v){ return v.name === s.voiceVoiceName; }) || null;
      }
      if (!chosen) chosen = pickVoice(voices, lang);
      if (chosen) u.voice = chosen;
      try {
        window.speechSynthesis.speak(u);
        return true;
      }catch(e){
        return false;
      }
    },
    // Bulut TTS alt yardımcıları (demo/ayarlar yüzeyi için).
    cloudTtsEnabled: function(){ return CLOUD_TTS.enabled(); },
    cloudTtsSpeak: function(text, opts, onDone){ return CLOUD_TTS.speak(text, opts, onDone); },
    cloudTtsStop: function(){ CLOUD_TTS.stop(); },
    cloudTtsPlaying: function(){ return CLOUD_TTS.isPlaying(); },
    ambient: (function(){
      // FX-P-53: düşük bantlı ambiyans ses motoru — harici dosya gerekmez;
      // Web Audio API destekliyorsa noise/osilatör üretimi, yoksa <audio>
      // element fallback'i (URL verilirse). Tümü quiet-time + master gating
      // (premiumAtmosphere + ambientSounds) altında çalışır.
      var A={ _ctx:null, _nodes:[], _playing:false, _type:null, _el:null, _url:null,
        isSupported: function(){ return !!(window.AudioContext || window.webkitAudioContext); },
        isEnabled: function(){ var s=settings(); return !!(s && s.ambientSounds === true && A.isSupported()); },
        // Aktif sesli rehberlik varken ambiyans susturulur (FX-P-53 adım 5).
        voiceBusy: function(){ try{ return !!(window.speechSynthesis && window.speechSynthesis.speaking); }catch(e){ return false; } },
        start: function(type, url){
          if (!isPremiumFxEnabled() || !A.isEnabled()) return false;
          if (isQuietTime()) return false;
          if (A.voiceBusy()) return false;
          if (A._playing && A._type === type) return true;
          A.stop();
          A._type = type; A._playing = true;
          if (typeof url === 'string' && url){
            // HTML5 <audio> fallback: harici URL verildiyse loop ile çal.
            try{
              var el = document.createElement('audio');
              el.loop = true; el.volume = 0.28; el.preload = 'auto';
              el.src = url;
              A._el = el; A._url = url;
              var p = el.play(); if (p && p.catch) p.catch(function(){});
            }catch(e){}
            return true;
          }
          // Osilatör tabanlı minimal üretim (yalnız Web Audio destekliyorsa).
          try{
            var ctx = bootCtx(); if (!ctx) { A._playing=false; A._type=null; return false; }
            if (ctx.state !== 'running'){ A._playing=false; A._type=null; return false; }
            var out = ctx.createGain();
            out.gain.setValueAtTime(0, ctx.currentTime);
            out.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 1.2); // yavaş fade-in
            out.connect(ctx.destination);
            var src=null, filter=null;
            if (type === 'rain' && ctx.createBufferSource){
              // Yağmur: white noise + lowpass ~900Hz + hafif LFO modülasyonu.
              var len = 2 * ctx.sampleRate, buf = ctx.createBuffer(1, len, ctx.sampleRate), ch = buf.getChannelData(0);
              for (var i=0;i<len;i++) ch[i] = (Math.random()*2-1) * 0.6;
              src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
              filter = ctx.createBiquadFilter(); filter.type='lowpass'; filter.frequency.value = 900;
              src.connect(filter); filter.connect(out);
              try{ src.start(); }catch(e){}
            } else if (type === 'wave' && ctx.createOscillator){
              // Dalga: yavaş iki LFO ile modüle edilen alçak sinüs (0.13/0.07 Hz).
              src = ctx.createOscillator(); src.type='sine'; src.frequency.value = 180;
              var g2 = ctx.createGain(); g2.gain.value = 0.5;
              var lfo1 = ctx.createOscillator(); lfo1.frequency.value = 0.13;
              var lg1 = ctx.createGain(); lg1.gain.value = 0.4;
              var lfo2 = ctx.createOscillator(); lfo2.frequency.value = 0.07;
              var lg2 = ctx.createGain(); lg2.gain.value = 0.35;
              lfo1.connect(lg1); lg1.connect(g2.gain);
              lfo2.connect(lg2); lg2.connect(g2.gain);
              src.connect(g2); g2.connect(out);
              try{ src.start(); lfo1.start(); lfo2.start(); }catch(e){}
            } else if ((type === 'ney' || type === 'nakar' || type === 'birds' || type === 'breeze' || type === 'crickets') && ctx.createOscillator){
              // Ney/nakar hissi: yumuşak üçgen dalga + çok yavaş vibrato; diğer
              // tipler için aynı düşük-bantlı yumuşak temel.
              src = ctx.createOscillator(); src.type = 'triangle';
              src.frequency.value = (type === 'birds') ? 660 : (type === 'crickets' ? 4200 : 320);
              var vg = ctx.createGain(); vg.gain.value = 0.35;
              var vlfo = ctx.createOscillator(); vlfo.frequency.value = 0.4;
              var vlg = ctx.createGain(); vlg.gain.value = 6;
              vlfo.connect(vlg); vlg.connect(src.frequency);
              filter = ctx.createBiquadFilter(); filter.type='lowpass'; filter.frequency.value = 1200;
              src.connect(vg); vg.connect(filter); filter.connect(out);
              try{ src.start(); vlfo.start(); }catch(e){}
            } else {
              src = null;
            }
            A._nodes = [out, src, filter].filter(Boolean);
            if (!src){ A._playing = true; } // sadece fade-in gain'i bırak (sessiz)
          }catch(e){ A._playing=false; A._type=null; return false; }
          return true;
        },
        stop: function(){
          try{
            A._nodes.forEach(function(n){
              try{ if (typeof n.stop === 'function') n.stop(); }catch(e){}
              try{ if (typeof n.disconnect === 'function') n.disconnect(); }catch(e){}
            });
          }catch(e){}
          A._nodes = [];
          try{ if (A._el){ A._el.pause(); A._el.src=''; A._el=null; } }catch(e){}
          A._url = null;
          A._playing = false; A._type = null;
          return true;
        },
        isPlaying: function(){ return A._playing; },
        currentType: function(){ return A._type; }
      };
      return A;
    })()
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
  var counterValues = Object.create(null);
  function sweepCounters(){
    if (!document.querySelectorAll) return;
    var nodes = document.querySelectorAll('[data-countup]');
    Array.prototype.forEach.call(nodes, function(el){
      var to = Number(el.getAttribute('data-countup'));
      if (isNaN(to)) return;
      var key = el.getAttribute('data-countup-key') || el.id || '';
      var prevRaw = key ? counterValues[key] : (el.dataset && el.dataset.prev);
      if (prevRaw == null){
        if (key) counterValues[key] = String(to);
        else if (el.dataset) el.dataset.prev = String(to);
        return;
      }
      var from = Number(prevRaw);
      if (from === to) return;
      if (key) counterValues[key] = String(to);
      else if (el.dataset) el.dataset.prev = String(to);
      window.SeyFx.countUp({ el: el, from: from, to: to, duration: 500 });
    });
  }

  window.SeyFx = {
    isPremiumFxEnabled: isPremiumFxEnabled,
    prefersReducedMotion: prefersReducedMotion,
    shouldAnimate: shouldAnimate,
    ambientAllowed: ambientAllowed,
    isSoundAllowed: isSoundAllowed,
    sweepCounters: sweepCounters,
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
    ripple: function(event, color, targetEl){
      // FX-P-32: dokunma koordinatlarına göre CSS ripple dalgası üretir.
      // Master switch (premiumAtmosphere) + reduced-motion kapalıyken sessiz.
      if (!isPremiumFxEnabled()) return;
      // Delege pointer katmanı targetEl'i üçüncü argümanla verir; eski inline
      // çağrılar ise targetEl olmadan event.currentTarget üzerinden aynı davranışı sürdürür.
      var el = targetEl || (event && event.currentTarget);
      if (!el || !el.getBoundingClientRect) return;
      var rect = el.getBoundingClientRect();
      // Ölçülebilir kutusu olmayan ikon-only elemanlara dalga ekleme.
      if (rect.width < 8 || rect.height < 8) return;
      // Delege katmanı markup'ı değiştirmez; ripple host'u runtime'da hazırlanır.
      if (el.classList && !el.classList.contains('sey-ripple')) el.classList.add('sey-ripple');
      // Satır içi butonlar position:static olabilir; dalga kutudan taşmasın.
      if (el.style && typeof getComputedStyle === 'function' && getComputedStyle(el).position === 'static') el.style.position = 'relative';
      if (!color && el.dataset && el.dataset.fx === 'destructive'){
        color = 'color-mix(in srgb, var(--drop) 55%, transparent)';
      }
      var x = ((event && typeof event.clientX === 'number') ? event.clientX : rect.left + rect.width/2) - rect.left;
      var y = ((event && typeof event.clientY === 'number') ? event.clientY : rect.top + rect.height/2) - rect.top;
      var d = Math.max(rect.width, rect.height) * 2;
      var wave = document.createElement('span');
      wave.className = 'sey-ripple-wave';
      wave.style.left = (x - d/2) + 'px';
      wave.style.top = (y - d/2) + 'px';
      wave.style.width = wave.style.height = d + 'px';
      if (color) wave.style.background = color;
      el.appendChild(wave);
      var gone = false;
      function drop(){ if (gone) return; gone = true; try{ wave.remove(); }catch(e){} }
      if (wave.addEventListener) wave.addEventListener('animationend', drop, { once: true });
      setTimeout(drop, 600);
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
    },
    sheetClose: function(cardId, backdropId, done){
      // FX2-16: render() overlay'i anında kaldırmadan önce kart/backdrop
      // çıkışını oynatır. Gating kapalıysa erişilebilir eski yol anlıktır.
      if (typeof done !== 'function') return;
      if (!isPremiumFxEnabled()) { done(); return; }
      var card = document.getElementById(cardId);
      var back = backdropId ? document.getElementById(backdropId) : null;
      if (!card) { done(); return; }
      // Aynı kapatma eylemi iki kez gelirse ikinci gövde/sav eylemi çalışmaz.
      if (card._seySheetClosing) return;
      card._seySheetClosing = true;
      var fired = false;
      function go(){
        if (fired) return;
        fired = true;
        try{ card.removeEventListener('animationend', onEnd); }catch(e){}
        done();
      }
      function onEnd(event){ if (event && event.target && event.target !== card) return; go(); }
      card.classList.add('sey-sheet-out');
      if (back) back.classList.add('sey-backdrop-out');
      card.addEventListener('animationend', onEnd);
      setTimeout(go, 260); // AĞ: animationend gelmezse overlay kilitlenmez.
    },
    bindAuroraParallax: function(){
      // FX2-25: #sey-aurora'ya çok ince kaydırma parallax'ı. Gating kapalıysa
      // dinleyici hiç bağlanmaz. render() her seferinde yeni [data-scroll]
      // üretir; dataset.auroraBound yeni düğümde yok, bu yüzden yeniden
      // bağlanır ve eskisi çöpe gider — sızıntı yok.
      // NOT: `transform` yerine `translate` özelliği kullanılır — seyAurora
      // animasyonu `transform`'u sonsuz döngüyle ezer (CSS animasyonları inline
      // stili bastırır); `translate` ayrı bir özellik olduğu için animasyonla
      // BİLEŞİR (translate → transform sırasıyla uygulanır), parallax gerçekten
      // çalışır.
      if (!isPremiumFxEnabled()) return false;
      var sc = document.querySelector('[data-scroll]');
      var au = document.getElementById('sey-aurora');
      if (!sc || !au) return false;
      if (sc.dataset.auroraBound === '1') return true;    // idempotent
      sc.dataset.auroraBound = '1';
      var ticking = false;
      sc.addEventListener('scroll', function(){
        if (ticking) return; ticking = true;
        requestAnimationFrame(function(){
          var y = Math.max(-24, Math.min(24, sc.scrollTop * -0.04));
          au.style.translate = '0 ' + y + 'px';
          ticking = false;
        });
      }, { passive: true });
      return true;
    }
  };

  // ── FX2-06: Delege dokunma katmanı ──────────────────────────────────────
  // #root'a takılır (ASLA #app'e — o her render'da innerHTML ile yıkılır).
  // Tek dinleyici, 361 butonun tamamını ve gelecekte üretilecek tüm DOM'u
  // kapsar. Tarayıcı varsayılanı iptal edilmez: kaydırma asla bozulmaz.
  var TOUCH_SELECTOR = 'button,[role="button"],[data-fx],a[href],[onclick]';
  var _tActive = null, _tLastAt = 0, _tX = 0, _tY = 0;

  // FX2-09: niyet → geri bildirim. Eksik sesler güvenli karşılığa düşer
  // (FX2-12 öncesi de çalışır).
  var FX_INTENT = {
    nav:         { sound:'nav',        haptic:'tap',     ripple:true  },
    open:        { sound:'sheetOpen',  haptic:'tap',     ripple:true  },
    close:       { sound:'sheetClose', haptic:'tap',     ripple:false },
    toggle:      { sound:'toggleOn',   haptic:'tap',     ripple:true  },
    confirm:     { sound:'success',    haptic:'success', ripple:true  },
    destructive: { sound:'error',      haptic:'error',   ripple:true  },
    none:        null
  };
  var FX_FALLBACK = { nav:'tap', sheetOpen:'tap', sheetClose:'tap',
                      toggleOn:'success', toggleOff:'tap' };

  function intentFor(el){
    var k = el && el.dataset ? el.dataset.fx : '';
    if (k === 'none') return null;
    var i = FX_INTENT[k];
    if (!i) return { sound:'tap', haptic:'tap', ripple:true };
    if (k === 'toggle'){
      var on = el.getAttribute('aria-pressed') === 'true'
            || (el.className||'').indexOf('is-on') >= 0
            || (el.className||'').indexOf('is-active') >= 0;
      return { sound: on ? 'toggleOff' : 'toggleOn', haptic:'tap', ripple:true };
    }
    return i;
  }
  function playIntentSound(name){
    var A = window.SeyAudio; if (!A) return;
    var fn = A[name] || A[FX_FALLBACK[name]] || A.tap;
    if (typeof fn === 'function') fn.call(A);
  }

  function touchDown(e){
    try{
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      var el = e.target && e.target.closest ? e.target.closest(TOUCH_SELECTOR) : null;
      if (!el) return;
      if (el.disabled || el.getAttribute('aria-disabled') === 'true') return;
      if (el.matches && el.matches('input,textarea,select')) return;
      var it = intentFor(el);
      if (!it) return;
      var now = Date.now();
      if (now - _tLastAt < 40) return;        // gürültü kapısı
      _tLastAt = now; _tActive = el;
      _tX = e.clientX || 0; _tY = e.clientY || 0;
      el.classList.add('sey-press');
      try{ playIntentSound(it.sound); }catch(err){}
      try{ var H = window.SeyHaptics; if (H && H[it.haptic]) H[it.haptic](); }catch(err){}
      try{ if (it.ripple && window.SeyFx && window.SeyFx.ripple) window.SeyFx.ripple(e, null, el); }catch(err){}
    }catch(err){}
  }
  function touchUp(){
    if (_tActive){ try{ _tActive.classList.remove('sey-press'); }catch(e){} _tActive = null; }
  }
  function touchMove(e){
    if (!_tActive) return;
    var dx = (e.clientX || 0) - _tX, dy = (e.clientY || 0) - _tY;
    if (dx*dx + dy*dy > 100) touchUp();      // >10px sapma = kaydırma, basmayı iptal et
  }

  // FX2-13: ayrı, tek seferlik iOS AudioContext kilit açma yolu. Bu dinleyici
  // touchDown'dan önce kaydedilir; böylece ilk dokunuşun sesi de jest bağlamında
  // üretilebilir. Scroll'u veya varsayılan davranışı engellemez.
  function unlockAudio(){
    try{
      var c = bootCtx(); if (!c) return;
      if (c.state === 'suspended') c.resume();
      var b = c.createBuffer(1, 1, c.sampleRate);
      var s = c.createBufferSource(); s.buffer = b;
      s.connect(c.destination); s.start(0);
      window.SeyAudio._unlocked = true;
    }catch(e){}
  }

  // Sekme gizlenince ortak ses bağlamını ve ambiyansı kapat; görünür dönüşte
  // yalnız önceden kullanıcı jestiyle açılmış bağlam geri sürdürülür.
  if (typeof document !== 'undefined' && document.addEventListener){
    document.addEventListener('visibilitychange', function(){
      try{
        var c = CTX; if (!c) return;
        if (document.hidden){
          if (window.SeyAudio.ambient && window.SeyAudio.ambient.isPlaying()) window.SeyAudio.ambient.stop();
          c.suspend();
        } else if (window.SeyAudio._unlocked){
          c.resume();
        }
      }catch(e){}
    });
  }

  window.SeyTouch = {
    SELECTOR: TOUCH_SELECTOR,
    _installed: false,
    install: function(rootEl){
      if (window.SeyTouch._installed) return true;      // idempotent
      var root = rootEl || document.getElementById('root');
      if (!root) return false;
      root.addEventListener('pointerdown', unlockAudio, { once: true, passive: true, capture: true });
      root.addEventListener('pointerdown', touchDown, { passive: true, capture: true });
      window.addEventListener('pointerup', touchUp, { passive: true });
      window.addEventListener('pointercancel', touchUp, { passive: true });
      window.addEventListener('pointermove', touchMove, { passive: true });
      window.SeyTouch._installed = true;
      return true;
    }
  };
})();
