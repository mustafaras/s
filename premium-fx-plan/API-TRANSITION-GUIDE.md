# Şeyma Premium FX Planı — Modül API Yüzeyi ve Geçiş PR Rehberi

**Sürüm:** 2.3
**Tarih:** 2026-08-30
**Kural:** Kod değiştirilmeden üretilmiştir. Sadece uygulama aşamasında referans olarak kullanılır.

---

## 1. Amaç

Faz -1 modülerleştirmesi sırasında `app.js`’ten çıkarılacak her yeni modülün **kesin API yüzeyini**, **bağımlılıklarını** ve **headless test stratejisini** tanımlar. Böylece her PR küçük, bağımsız ve review edilebilir olur.

---

## 2. Yeni Modüllerin API Yüzeyleri

### 2.1 `app/core/dateUtils.js`

```js
window.SeymaDateUtils = {
  fmt: fmt,               // existing line ~4727
  todayStr: todayStr,     // existing line ~4728
  addDays: addDays,       // existing line ~4736
  diffDays: diffDays,     // existing line ~4740
  pad: pad2,              // existing line ~4720
  shortDate: shortDate,
  dayIndexFor: dayIndexFor, // existing line ~6188
  activeDate: activeDate,
  curDay: curDay,
  dateLabelTR: dateLabelTR
};
```

**Bağımlılık:** `app/core/constants.js` (`SEYMA_CONSTANTS`, `KEY`, `TKEY`).

**Test stratejisi:**
- `tests/app/test_date_utils_boundary.js`: her fonksiyon `window.SeymaDateUtils` üzerinden çağrılabilir, `todayStr()` ISO formatında döner, `addDays` bozulmaz.

---

### 2.2 `app/core/helpers.js`

```js
window.SeymaHelpers = {
  segTabs: segTabs,
  progBar: progBar,
  starRow: starRow,
  miniBars: miniBars,
  statTile: statTile,
  collapsibleCardHTML: collapsibleCardHTML,
  toast: toast,
  confetti: confetti,
  haptic: haptic          // existing line ~6375
};
```

**Bağımlılık:** `constants.js`, `state.js` (`data`, `ui`), `dateUtils.js`.

**Test stratejisi:**
- `tests/app/test_helpers_boundary.js`: `toast()` HTML üretir, `haptic()` `navigator.vibrate`’i çağırır (stub), `progBar` geçerli HTML döner.

---

### 2.3 `app/core/mediaFx.js`

```js
window.SeyAudio = {
  ctx: null,
  tap: function(){},
  success: function(){},
  warning: function(){},
  bell: function(){},
  voice: function(text){},
  ambient: function(type){},
  speak: function(text){}   // alias for voice
};

window.SeyHaptics = {
  tap: function(){},
  success: function(){},
  error: function(){},
  refresh: function(){},
  streak: function(){},
  water: function(){}
};

window.SeyFx = {
  isPremiumFxEnabled: function(){},
  prefersReducedMotion: function(){},
  countUp: function(options){},   // { from, to, duration, el, formatter }
  ripple: function(event, color){},
  shimmer: function(element){},
  shouldAnimate: function(){}
};
```

**Bağımlılık:** `constants.js`, `state.js` (`settings.*`).

**Test stratejisi:**
- Mevcut `test_premium_audio_fx.js` ve `test_premium_haptics_fx.js` zaten bu yüzeyi doğruluyor.
- Gelecekte `test_premium_fx_utils.js`: `isPremiumFxEnabled` master/premium/reduced-motion kombinasyonlarını test eder.

---

### 2.4 `app/core/timeTheme.js`

```js
window.SeyTimeTheme = {
  apply: function(){},          // #root class güncelle
  classForHour: function(h){}, // 'theme-time-dawn'|'day'|'dusk'|'night'
  seasonalClass: function(){},  // 'theme-season-ramazan'|'spring'|'autumn'|'newyear'
  applySeasonal: function(){}
};
```

**Bağımlılık:** `constants.js`, `state.js` (`settings.premiumAtmosphere`, `settings.prayer.hijriOffset`).

**Test stratejisi:**
- Mevcut `test_premium_time_theme.js` zaten `classForHour` mantığını doğruluyor.

---

### 2.5 `app/core/state.js`

```js
window.SeymaState = {
  data: data,
  ui: ui,
  dark: dark,
  getDay: getDay,           // existing line ~4922
  emptyDay: emptyDay,       // existing line ~4922
  createDefaultData: createDefaultData, // existing line ~6686
  migrate: migrate          // existing line ~4415
};

// Dışa açılmayacak (internal only):
// - save() stays in syncGlue.js
```

**Bağımlılık:** `constants.js`, `dateUtils.js`.

**Test stratejisi:**
- `test_modularization_boundary.js` zaten `migrate(d)` ve `save()`’in `app.js` içinde kaldığını doğruluyor.
- Gelecekte `test_state_boundary.js`: `window.SeymaState.data` okunabilir, `migrate()` idempotent.

---

### 2.6 `app/core/syncGlue.js`

```js
window.SeyOnSyncState = SeyOnSyncState; // existing ~6208
window.SeyOnSynced = SeyOnSynced;       // existing ~6208
window.SeymaSave = save;                // existing ~6229
```

**Bağımlılık:** `state.js`.

**Test stratejisi:**
- Mevcut `test_faz10_sync.js` sync davranışını korur.

---

## 3. Geçiş PR Dizilimi

### PR -1.1: Temel altyapı modülleri (safe win)

**Dosyalar:**
- `app/core/dateUtils.js` (yeni)
- `app/core/helpers.js` (yeni)
- `app/core/mediaFx.js` (yeni)
- `app/core/timeTheme.js` (yeni)
- `index.html` (yeni script tag'ler, henüz `app.js`’i kaldırmadan)
- `tests/app/test_date_utils_boundary.js` (yeni)
- `tests/app/test_helpers_boundary.js` (yeni)
- `tests/app/test_modularization_boundary.js` güncellenir

**Davranış değişikliği:** Yok. `app.js` hâlâ yüklü ve çalışıyor; yeni modüller sadece `window.*` altında expose ediliyor, hiçbir handler onları kullanmıyor.

**Review kriterleri:**
- `node --check` her yeni dosya için PASS.
- `node tests/app/test_modularization_boundary.js` PASS.
- `node .claude/skills/run-seyma/driver.mjs` PASS.
- `node .claude/skills/run-seyma/zikr-harness.mjs` PASS.
- `node tests/app/test_faz10_sync.js` PASS.

---

### PR -1.2: State + zikir/quran/saygi domain modülleri

**Dosyalar:**
- `app/core/state.js`
- `app/core/prayer.js`
- `app/core/zikir.js`
- `app/core/quran.js`
- `app/core/saygi.js`

**Risk:** Yüksek. Çünkü `data`, `ui`, `dark` ve `App.*` handler’ları buraya taşınıyor.

**Önlem:**
- `App.*` tanımlamaları geçici olarak `app.js` içinde de bırakılabilir (duplicate); yeni modüldeki `App.*` overload eder. Böylece herhangi bir inline referans bozulmaz.
- Her modül ayrımından sonra `driver.mjs` ve `zikr-harness.mjs` çalıştırılır.

---

### PR -1.3: Sağlık, rapor, kütüphane, harita, ayarlar

**Dosyalar:**
- `app/core/health.js`
- `app/core/report.js`
- `app/core/library.js`
- `app/core/map.js`
- `app/core/profile.js`
- `app/core/settings.js`
- `app/core/reminders.js`

**Review kriterleri:**
- `render()` hâlâ `app.js` içinde; sadece helper fonksiyonlar taşınır.
- `save()` ve `migrate()` dokunulmaz.

---

### PR -1.4: Render + App Surface (en büyük PR)

**Dosyalar:**
- `app/core/render.js`
- `app/core/appSurface.js`
- `app/core/messaging.js`
- `app/core/syncGlue.js`
- `index.html`: `app.js` script tag'i kaldırılır, yeni modüller sıralı yüklenir.

**Review kriterleri:**
- `App.*` yüzeyi aynı kalır.
- Inline `onclick="App.xxx(...)"` referansları bozulmaz.
- `window.App` expose edilir.
- Tüm testler PASS.

---

## 4. `index.html` Son Hali (Faz -1.4 sonrası)

```html
<script src="app/core/constants.js?v=..."></script>
<script src="app/core/dateUtils.js?v=..."></script>
<script src="app/core/state.js?v=..."></script>
<script src="app/core/helpers.js?v=..."></script>
<script src="app/core/mediaFx.js?v=..."></script>
<script src="app/core/timeTheme.js?v=..."></script>
<script src="app/core/prayer.js?v=..."></script>
<script src="app/core/zikir.js?v=..."></script>
<script src="app/core/quran.js?v=..."></script>
<script src="app/core/saygi.js?v=..."></script>
<script src="app/core/motivation.js?v=..."></script>
<script src="app/core/crisis.js?v=..."></script>
<script src="app/core/journal.js?v=..."></script>
<script src="app/core/health.js?v=..."></script>
<script src="app/core/library.js?v=..."></script>
<script src="app/core/report.js?v=..."></script>
<script src="app/core/map.js?v=..."></script>
<script src="app/core/profile.js?v=..."></script>
<script src="app/core/reminders.js?v=..."></script>
<script src="app/core/settings.js?v=..."></script>
<script src="app/core/syncGlue.js?v=..."></script>
<script src="app/core/messaging.js?v=..."></script>
<script src="app/core/render.js?v=..."></script>
<script src="app/core/appSurface.js?v=..."></script>
```

> `app.js` artık yüklenmez; `sync.js` ve mevcut `app/core/reminder*.js`, `app/content/*.js` yükleme sıraları korunur.

---

## 5. Test Piramidi

```
                    ┌─────────────────┐
                    │  E2E / Visual QA │  (kullanıcı onaylı, port 9000)
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  run-seyma VM   │  driver.mjs / zikr-harness.mjs
                    │  integration    │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
  ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐
  │ domain tests │    │  FX tests   │    │ boundary    │
  │ (panel, sync)│    │ (audio/...) │    │ tests       │
  └─────────────┘    └─────────────┘    └─────────────┘
```

---

## 6. Kırmızı Çizgiler

- `app.js` kaldırılmadan önce tüm `App.*` handler'ları `appSurface.js` içinde yeniden tanımlanmalı.
- `save()` ve `migrate()` aynı davranışı koruyarak taşınmalı.
- `localStorage` key `seyma-reset-v1` değişmemeli.
- `sync.js`’e dokunulmamalı.
- Yeni modüller `window.*` expose desenini kullanmalı (`window.SeymaDateUtils`, `window.SeyAudio`, vb.).

---

## 7. Sonraki Adımlar

Bu rehber onaylandıktan sonra PR -1.1 ile başlanabilir. PR -1.1’de uygulama kodu değişir ama davranış değişmez; sadece yeni modüller eklenir ve test edilir.
