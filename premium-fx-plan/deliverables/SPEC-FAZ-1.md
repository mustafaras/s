# Faz 1: UI Ses Dili + Haptik Alfabesi — Detay Spec

**Sürüm:** 2.1  
**Güncellendi:** 2026-08-30  
**Hedef:** En hızlı hissedilir premiumlik kazandırmak.

---

## 1.1 `app/core/mediaFx.js` Modülü

**Yeni dosya:** `/Users/m_ras/Desktop/seyma/app/core/mediaFx.js`

> **Not:** Planın güncel hali (PLAN.md §7, MODULARIZATION.md §3.1, FX-LIBRARY.md) tek birleşik medya modülü `app/core/mediaFx.js` olarak belirler. SPEC-FAZ-1'in önceki sürümlerinde ayrı `audioFx.js` / `hapticsFx.js` dosyalarından bahsediliyordu; uygulama aşamasında tek modül `mediaFx.js` tercih edilecek.

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
    if(s.premiumAtmosphere === false) return false;
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
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

    // Uygulamada: window.SeyAudio ve window.SeyHaptics aynı dosyada tanımlanır.
  window.SeyAudio = {
    tap: tap,
    success: success,
    warning: warning,
    bell: bell,
    voice: speak,                // tek sesli rehberlik girişi; speak adı kullanılmaz
    ambient: ambient,            // Faz 4: günün saatine göre ambient sesler
    setMaster: function(v){ masterEnabled = !!v; },
    isAllowed: isAllowed
  };

  window.SeyHaptics = {
    tap: function(){ vibrate([15]); },
    success: function(){ vibrate([20, 30, 50]); },
    error: function(){ vibrate([40, 20, 40]); },
    refresh: function(){ vibrate([10, 20, 10, 20, 10]); },
    streak: function(){ vibrate([30, 50, 80]); },
    water: function(){ vibrate([10, 15, 10]); }
  };
})();
```

**İndex.html’e ekleme:**
- `app/core/constants.js` yüklendikten sonra, `app.js` öncesinde:
  ```html
  <script src="app/core/mediaFx.js?v=202608301"></script>
  ```

**Cache-bump:** `index.html` içinde `?v=` sürümü güncellenecek.

---

## 1.2 `app.js` Haptik Haritası

**Mevcut fonksiyon:** `haptic()` — `app.js:6375`

**Yeni modül karşılığı:** `window.SeyHaptics.*` — `app/core/mediaFx.js` içinde tanımlanır.

**Güncellenmiş versiyon (spec):**

```js
function vibrate(pattern){
  if(!window.SeymaConstants || !window.SeymaConstants.data) return;
  var s = window.SeymaConstants.data.settings || {};
  // Mevcut haptic() ayarı da korunur; SeyHaptics richHaptics + premiumAtmosphere ile gating yapar.
  if(s.richHaptics === false || s.haptics === false || s.premiumAtmosphere === false) return;
  if(!navigator.vibrate) return;
  try { navigator.vibrate(pattern); } catch(e){}
}
```

**Not:** iOS’ta `navigator.vibrate` desteği yok; bu durumda görsel feedback fallback olarak kullanılır.  
Mevcut `haptic(p)` (`app.js:6375`) korunur; FX modülü buna ek katman olarak çalışır.

---

## 1.3 İlk Bağlantı Noktaları

| Fonksiyon | Konum | Ses | Haptik |
|-----------|-------|-----|--------|
| `App.toggleHabit(key)` | `app.js:8228` | `SeyAudio.success()` (sadece tamamlandığında) | `SeyHaptics.success()` |
| `App.waterAdd(delta)` | `app.js:8306` | `SeyAudio.tap()` (delta > 0) | `SeyHaptics.water()` |
| `App.saveToday()` | `app.js:9551` | `SeyAudio.tap()` | `SeyHaptics.tap()` |
| `window.SeyOnSynced()` | `app.js:6208` | `SeyAudio.bell()` | `SeyHaptics.success()` |
| Uyarı banner gösterimi (`toast()`) | `app.js:6395` | `SeyAudio.warning()` | `SeyHaptics.error()` |
| `App.setMood(id)` | `app.js:8291` | `SeyAudio.tap()` | `SeyHaptics.tap()` |
| `App.setEnergy(v)` | `app.js:8309` | `SeyAudio.tap()` | `SeyHaptics.tap()` |
| `App.setStress(v)` | `app.js:8310` | `SeyAudio.tap()` | `SeyHaptics.tap()` |
| `App.markSaygiRead()` | `app.js:8195` | `SeyAudio.success()` | `SeyHaptics.success()` |
| `App.openCrisis(kind)` | `app.js:9099` | `SeyAudio.warning()` | `SeyHaptics.error()` |
| `App.saveJournal()` | `app.js:9114` | `SeyAudio.success()` | `SeyHaptics.success()` |
| `App.completeMotivationTask(status)` | `app.js:11812` | `SeyAudio.success()` | `SeyHaptics.success()` |

**Kural:** `SeyAudio`/`SeyHaptics` tanımlı değilse (modül yüklenmemişse) hiçbir şey çalışmamalı; `if(window.SeyAudio)` / `if(window.SeyHaptics)` kontrolü ekle. `SeyAudio`/`SeyHaptics` fonksiyonlarının kendi içinde `isAllowed()` / `premiumAtmosphere` kontrolü de vardır; böylece reduced-motion kapalıyken veya master anahtar kapalıyken çift güvenlik sağlanır.

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
2. `SeyHaptics.success()` doğru pattern ile çağrılır.
3. `settings.richHaptics = false` iken çağrılmaz.
4. `navigator.vibrate` yoksa hata fırlatmaz.

---

## 1.6 Reduce Motion Uyumu

- Tüm FX ses/haptik/animasyon çağrıları `SeyFx.isPremiumFxEnabled()` veya `SeyAudio.isAllowed()` gating’inden geçer.
- `prefers-reduced-motion: reduce` aktifse `isPremiumFxEnabled()` false döner; böylece ses, haptik ve animasyonlar pasif olur.
- `settings.premiumAtmosphere === false` olduğunda da aynı pasif davranış uygulanır.
- Tek istisna: `voiceGuidance` kendi ayarı (`settings.voiceGuidance === true`) ile çalışır; reduced-motion onu doğrudan engellemez (erişilebilirlik gereği).

---

## 1.7 Çıktı Listesi

- [ ] `app/core/mediaFx.js` modülü (Faz 1 implementasyonunda)
- [ ] `app.js` bağlantı noktalarına `SeyAudio` / `SeyHaptics` çağrıları
- [ ] İlk bağlantı noktaları listesi
- [x] `tests/app/test_premium_audio_fx.js` oluşturuldu (13/13 PASS)
- [x] `tests/app/test_premium_haptics_fx.js` oluşturuldu (12/12 PASS)
