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
  fmt: fmt,               // app.js'te dağınık; FX-P-01'de yeni dosyaya kopyalandı
  todayStr: todayStr,
  addDays: addDays,
  diffDays: diffDays,
  pad: pad,               // not: app.js'te `pad2` değil `pad` adı kullanılır
  shortDate: shortDate,
  dayIndexFor: dayIndexFor,
  activeDate: activeDate,
  curDay: curDay,
  dateLabelTR: dateLabelTR
};
```

**Bağımlılık:** `app/core/constants.js` (`SeymaConstants`), `state.js` (yumuşak bağ).

**Test stratejisi:**
- `tests/app/test_date_utils_boundary.js` **(FX-P-01'de oluşturuldu, FX-P-03'te genişletilecek)**.

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
- `tests/app/test_helpers_boundary.js` **(FX-P-01'de oluşturuldu, FX-P-03'te genişletilecek)**.

---

### 2.3 `app/core/mediaFx.js`

```js
window.SeyAudio = {
  ctx: null,
  tap: function(){},
  success: function(){},
  warning: function(){},
  bell: function(){},
  voice: function(text){},    // preferred name
  ambient: function(type){},   // Faz 4 ambient sound katmanı
  // speak intentionally removed; use voice() to avoid dual naming
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
  isPremiumFxEnabled: function(){},   // premiumAtmosphere + !prefers-reduced-motion
  prefersReducedMotion: function(){}, // window.matchMedia('(prefers-reduced-motion: reduce)').matches
  countUp: function(options){},     // { from, to, duration, el, formatter }
  ripple: function(event, color){},  // touch coordinate ripple
  shimmer: function(element){},       // CSS shimmer trigger helper
  shouldAnimate: function(){},        // alias wrapper for isPremiumFxEnabled
  ambientAllowed: function(){}        // true if ambientSounds && premiumAtmosphere
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
// data, ui, dark, migrate, getDay, createDefaultData closure-scoped'tır ve
// window'da DEĞİLDİR (app.js IIFE). Faz 0'da app.js'e CANLI GETTER eklenir:
//   Object.defineProperty(window, 'data', { get: () => data, configurable: true });
//   Object.defineProperty(window, 'ui',   { get: () => ui,   configurable: true });
//   Object.defineProperty(window, 'dark', { get: () => dark, configurable: true });
//   Object.defineProperty(window, 'migrate', { get: () => migrate, configurable: true });
//   Object.defineProperty(window, 'getDay',  { get: () => getDay,  configurable: true });
//   Object.defineProperty(window, 'createDefaultData', { get: () => createDefaultData, configurable: true });
// data mutable bir bağlamadır (6+ kez yeniden atanır); canlı getter her okumada
// taze değer döndürür, tek seferlik referans bayat kalır (VM'de kanıtlandı).
window.SeymaState = {
  get data(){ return window.data; },              // Faz 0 getter'ından okur
  get ui(){ return window.ui; },
  get dark(){ return window.dark; },
  get migrate(){ return window.migrate; },        // existing line ~4415
  get getDay(){ return window.getDay; },          // existing line ~4922
  get createDefaultData(){ return window.createDefaultData; } // existing line ~6684
};

// `save()` stays in syncGlue.js and is exposed as window.SeymaSave.
// `migrate()` stays in state.js and is exposed as window.SeymaState.migrate.
// We do NOT expose a separate window.SeymaMigrate; use window.SeymaState.migrate.
// NOT: `emptyDay` fonksiyonu app.js'te YOKTUR; expose edilmez.
```

**Bağımlılık:** `constants.js`, `dateUtils.js`.

**Test stratejisi:**
- `test_modularization_boundary.js` zaten `migrate(d)` ve `save()`’in `app.js` içinde kaldığını doğruluyor.
- `test_state_boundary.js` **(Faz -1 uygulama aşamasında oluşturulacak)**.

---

### 2.6 `app/core/syncGlue.js`

```js
// SeyOnSyncState/SeyOnSynced zaten app.js tarafından window'a atanır (6198/6208);
// syncGlue.js bunları yeniden tanımlamaz (getter-only accessor yapılırsa app.js'in
// strict-mode ataması THROW eder). save() closure-scoped'tır (6229); Faz 0'da
// app.js'e canlı getter eklenir ve SeymaSave bu getter'ı okur.
Object.defineProperty(window, 'SeymaSave', {
  get: function(){ return window.save; },   // existing ~6229
  configurable: true
});
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
- `tests/app/test_date_utils_boundary.js` (yeni — Faz -1 uygulama aşamasında)
- `tests/app/test_helpers_boundary.js` (yeni — Faz -1 uygulama aşamasında)
- `tests/app/test_modularization_boundary.js` güncellenir

**Davranış değişikliği:** Yok. `app.js` hâlâ yüklü ve çalışıyor; yeni modüller sadece `window.*` altında expose ediliyor, hiçbir handler onları kullanmıyor.

**Review kriterleri:**
- `node --check` her yeni dosya için PASS.
- `node tests/app/test_modularization_boundary.js` PASS.
- `node .claude/skills/run-seyma/driver.mjs` PASS.
- `node .claude/skills/run-seyma/zikr-harness.mjs` PASS.
- `node tests/app/test_faz10_sync.js` PASS.
- Tüm değişiklikler yerel commit olarak kalır; bu PR aşamasında push yapılmaz ([LOCAL-ONLY-IMPLEMENTATION.md](LOCAL-ONLY-IMPLEMENTATION.md)).

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

---

## UYGULAMA SONRASI DOĞRULAMA (FX-P-73 — 2026-09-02)

Aşağıdaki API imzaları uygulandığı haliyle teyit edilmiştir; testler bu imzaları kilitlemektedir.

| API | İmza | Dönüş | Gating |
|-----|------|-------|--------|
| `SeyAudio.voice(text, opts?)` | opts: `{lang?, rate?, pitch?, volume?, force?, voiceNames?, localOnly?, noFallback?, cloudVoice?}` | `boolean` (tetiklendi=true) | premium && voiceGuidance && !quiet-time; bulut (voiceCloudTts+openaiKey) öncelikli, `voiceLocalFallback=false` iken yerel düşüş YOK |
| `SeyAudio.speakLocal(text, opts?)` | Web Speech fallback (yalnız voiceLocalFallback=true iken voice() içinden) | `boolean` | speechSynthesis varlığı |
| `SeyAudio.isVoiceEnabled()` / `isQuietTime(h?)` | h==null → gerçek saat | `boolean` | voiceGuidance && speechSynthesis / 23:00–07:00 |
| `SeyAudio.greeting()` | param yok | `boolean` | voice gating + SeyTimeTheme |
| `SeyAudio.guides.{zikirStart,zikirHalf,zikirComplete,suraOpen(name),suraBookmark}` | — | `boolean` (delege: voice) | voice gating |
| `SeyAudio.cloudTtsEnabled/cloudTtsSpeak(text,opts,onDone)/cloudTtsStop/cloudTtsPlaying` | opts: `{cloudVoice?, rate?, volume?}` | `boolean` / void | voiceCloudTts && openaiKey |
| `SeyAudio.ambient.{start(type,url?),stop,isSupported,isEnabled,isPlaying,currentType,voiceBusy}` | type: rain/wave/ney/nakar/birds/breeze/crickets; url opsiyonel `<audio>` fallback | `boolean`/`string` | premium && ambientSounds && !quiet-time && !voice.speaking |
| `SeyHaptics.{tap,success,error,refresh,streak,water}` | — | void (vibrate yoksa no-op) | richHaptics && premium && !reduced-motion (+legacy `haptics===false` kapısı) |
| `SeyFx.{isPremiumFxEnabled,prefersReducedMotion,shouldAnimate,ambientAllowed,isSoundAllowed}` | — | `boolean` | premium master + reduced-motion |
| `SeyFx.{countUp,ripple,shimmer,enter,transition}` | bkz. FX-LIBRARY §3.8 | void/DOM | premium && !reduced-motion |
| `SeyTimeTheme.{classForHour(h?),apply,seasonalClass(d?),applySeasonal(d?)}` | h/d verilmezse gerçek zaman | `string`/`void` | premiumAtmosphere (apply/applySeasonal) |
| `App.toggleSetting(key)` | key beyaz liste: premiumAtmosphere/uiSounds/richHaptics/launchRitual/voiceGuidance/ambientSounds/voiceCloudTts | void (save+render) | — (I2 ekleme) |
| `App.setVoiceGuidance(on)` / `setVoiceLang(lang)` / `setVoiceRate(rate)` | lang: tr-TR/en-US/ar-SA; rate clamp 0.75–1.5 | void | — (I2 ekleme) |

**Settings alanları (tümü `data.settings.*`, migrate backfill'li, additive):** premiumAtmosphere, uiSounds, voiceGuidance, ambientSounds, richHaptics, launchRitual, voiceCloudTts (default true), voiceLocalFallback (default **false** — yerel sene düşme yok), voiceCloudVoice (default 'shimmer'), voiceLang (default 'tr-TR'), voiceRate, voicePitch, voiceVoiceName, voiceOnboardedAt, lastVoiceGreetingAt, voiceGreetingDate/Count, voiceStreakDate, voiceZikrDate.

**Panel görünürlüğü:** `panelCoverageManifest.js` settings.tracked içinde yukarıdaki toggle boolean'ları preference_toggle olarak izinli; `openaiKey`/`ghToken` redacted kalmaya devam eder.
