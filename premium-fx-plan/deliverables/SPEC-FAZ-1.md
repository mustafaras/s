# Faz 1: UI Ses Dili + Haptik Alfabesi — Detay Spec

**Hedef:** En hızlı hissedilir premiumlik kazandırmak.

---

## 1.1 `app/core/audioFx.js` Modülü

**Yeni dosya:** `/Users/m_ras/Desktop/seyma/app/core/audioFx.js`

**Yapısı:**

```js
(function(){
  'use strict';
  var ctx = null;
  var masterEnabled = true;

  function ensureContext(){
    if(ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return null;
    ctx = new AC();
    return ctx;
  }

  function isAllowed(){
    if(!masterEnabled) return false;
    if(!window.SeymaConstants || !window.SeymaConstants.data) return true; // default açık
    var s = window.SeymaConstants.data.settings || {};
    return s.uiSounds !== false;
  }

  function resumeIfNeeded(){
    if(!ctx) return;
    if(ctx.state === 'suspended') ctx.resume();
  }

  function playTone(opts){
    if(!isAllowed()) return;
    var c = ensureContext();
    if(!c) return;
    resumeIfNeeded();
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = opts.type || 'sine';
    o.frequency.setValueAtTime(opts.freq, c.currentTime);
    g.gain.setValueAtTime(opts.gain || 0.05, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + (opts.duration || 0.04));
    o.connect(g);
    g.connect(c.destination);
    o.start();
    o.stop(c.currentTime + (opts.duration || 0.04));
  }

  function tap(){ playTone({type:'sine', freq:880, gain:0.05, duration:0.04}); }
  function success(){ /* 3 nota */
    if(!isAllowed()) return;
    var c = ensureContext(); if(!c) return; resumeIfNeeded();
    var notes = [523, 659, 784];
    var t = c.currentTime;
    notes.forEach(function(f, i){
      var o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.06, t + i*0.08);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i*0.08 + 0.08);
      o.connect(g); g.connect(c.destination);
      o.start(t + i*0.08); o.stop(t + i*0.08 + 0.08);
    });
  }
  function warning(){ playTone({type:'triangle', freq:150, gain:0.04, duration:0.12}); }
  function bell(){ playTone({type:'sine', freq:1047, gain:0.05, duration:0.5}); }

  window.SeyAudio = {
    tap: tap,
    success: success,
    warning: warning,
    bell: bell,
    setMaster: function(v){ masterEnabled = !!v; },
    isAllowed: isAllowed
  };
})();
```

**İndex.html’e ekleme:**
- `app/core/constants.js` yüklendikten sonra, `app.js` öncesinde:
  ```html
  <script src="app/core/audioFx.js?v=202608301"></script>
  ```

**Cache-bump:** `index.html` içinde `?v=` sürümü güncellenecek.

---

## 1.2 `app.js` Haptik Haritası

**Mevcut fonksiyon:** `haptic()`

**Güncellenmiş versiyon (spec):**

```js
function haptic(type){
  if(!window.SeymaConstants || !window.SeymaConstants.data) return;
  var s = window.SeymaConstants.data.settings || {};
  if(s.richHaptics === false || s.haptics === false) return;
  if(!navigator.vibrate) return;
  var patterns = {
    tap: [15],
    success: [20, 30, 50],
    error: [40, 20, 40],
    refresh: [10, 20, 10, 20, 10],
    streak: [30, 50, 80],
    water: [10, 15, 10]
  };
  var p = patterns[type] || patterns.tap;
  try { navigator.vibrate(p); } catch(e){}
}
```

**Not:** iOS’ta `navigator.vibrate` desteği yok; bu durumda görsel feedback fallback olarak kullanılır.

---

## 1.3 İlk Bağlantı Noktaları

| Fonksiyon | Konum | Ses | Haptik |
|-----------|-------|-----|--------|
| `toggleHabit(key)` | app.js | `SeyAudio.success()` (sadece tamamlandığında) | `haptic('success')` |
| `waterAdd(delta)` | app.js | `SeyAudio.tap()` (delta > 0) | `haptic('water')` |
| `saveToday()` | app.js | `SeyAudio.tap()` | `haptic('tap')` |
| `SeyOnSynced()` | app.js | `SeyAudio.bell()` | `haptic('success')` |
| Uyarı banner gösterimi | app.js | `SeyAudio.warning()` | `haptic('error')` |
| `setMood(id)` | app.js | `SeyAudio.tap()` | `haptic('tap')` |
| `setEnergy(v)` / `setStress(v)` | app.js | `SeyAudio.tap()` | `haptic('tap')` |

**Kural:** `SeyAudio` tanımlı değilse (modül yüklenmemişse) hiçbir şey çalışmamalı; `if(window.SeyAudio)` kontrolü ekle.

---

## 1.4 Uyarı / Hata Sesleri

- Tüm `toast()` çağrılarında türüne göre ses eklenebilir.
- Öneri: `toast()` fonksiyonuna `type` parametresi ekle (`'ok'`, `'warn'`, `'error'`).
- `'warn'` ve `'error'` türlerinde `SeyAudio.warning()` çalışsın.
- `'ok'` türünde `SeyAudio.success()` çalışsın.

---

## 1.5 Test Planı

### `tests/app/test_premium_audio_fx.js`

**Seneryolar:**
1. `window.SeyAudio` tanımlı.
2. `settings.uiSounds = true` iken `tap()` çağrıldığında AudioContext event oluşturur.
3. `settings.uiSounds = false` iken ses üretilmez.
4. `window.AudioContext` yoksa graceful no-op.

### `tests/app/test_premium_haptics_fx.js`

**Seneryolar:**
1. `navigator.vibrate` stub’lanır.
2. `haptic('success')` doğru pattern ile çağrılır.
3. `settings.richHaptics = false` iken çağrılmaz.
4. `navigator.vibrate` yoksa hata fırlatmaz.

---

## 1.6 Reduce Motion Uyumu

- Sesler `prefers-reduced-motion` ile doğrudan ilişkili değil; ama `settings.uiSounds` kullanıcı kontrolüne tabi.
- Haptik `settings.richHaptics` ile kontrol edilir; reduce motion aktifse `richHaptics` otomatik false olabilir (tercih meselesi, spec’ta netleştirilecek).

---

## 1.7 Çıktı Listesi

- [ ] `app/core/audioFx.js` modülü (Faz 1 implementasyonunda)
- [ ] `app.js` haptik haritası güncellemesi spec’i
- [ ] İlk bağlantı noktaları listesi
- [ ] `tests/app/test_premium_audio_fx.js` skeleton
- [ ] `tests/app/test_premium_haptics_fx.js` skeleton
