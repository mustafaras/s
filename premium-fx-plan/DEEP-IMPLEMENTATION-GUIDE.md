# Şeyma Premium FX Planı — Derin Implementasyon Rehberi

**Sürüm:** 2.3.1
**Tarih:** 2026-08-30
**Kural:** Kod değiştirilmeden üretilmiştir. Uygulama aşamasında adım adım takip edilir.

---

## 1. Amaç

Her Faz'ı (`-1` ile `6`) küçük, atomik, review edilebilir ve **davranış-koruyucu** adımlara bölmek. Her adımda:
- Değiştirilecek dosyalar
- Etkileşim noktaları (handler + satır)
- Test komutları
- Fallback stratejisi
- Performans kısıtları

belirtilir.

---

## 2. Faz -1: app.js Modülerleştirme — Atomik Adımlar

### Adım -1.1.0: Modül dosyalarını oluştur (boş IIFE shell)

**Dosyalar:**
- `app/core/dateUtils.js`
- `app/core/helpers.js`
- `app/core/mediaFx.js`
- `app/core/timeTheme.js`

**İçerik (her biri için şablon):**
```js
(function(){
  'use strict';
  // TODO: implement
  window.SeymaDateUtils = {};
})();
```

**Test:**
```bash
node --check app/core/dateUtils.js
node --check app/core/helpers.js
node --check app/core/mediaFx.js
node --check app/core/timeTheme.js
node tests/app/test_faz_minus11_boundary.js  # henüz App.*'ta kullanılmamalı
```

**Performans:** 0 etki, dosyalar yüklenmiyor.

---

### Adım -1.1.1: `dateUtils.js` içeriğini taşı

**Kaynak:** `app.js` satır ~4720–4750, ~6188
**Hedef:** `app/core/dateUtils.js`

**Taşınacak fonksiyonlar:**
- `fmt`
- `todayStr`
- `addDays`
- `diffDays`
- `pad2` (export as `pad`)
- `shortDate`
- `dayIndexFor`
- `activeDate`
- `curDay`
- `dateLabelTR`

**Expose:** `window.SeymaDateUtils`

**Güvenlik:** `app.js` içinde aynı fonksiyonları **geçici kopya** tut; `index.html`'e `dateUtils.js` script tag'i eklenene kadar bozulmaz.

**Test:**
```bash
node tests/app/test_faz_minus11_boundary.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
```

---

### Adım -1.1.2: `helpers.js` içeriğini taşı

**Kaynak:** `app.js` satır ~4000–5300, ~6000–6400
**Hedef:** `app/core/helpers.js`

**Taşınacak fonksiyonlar:**
- `segTabs`
- `progBar`
- `starRow`
- `miniBars`
- `statTile`
- `collapsibleCardHTML`
- `toast`
- `confetti`
- `haptic`

**Expose:** `window.SeymaHelpers`

**Not:** `toast` ve `confetti` state ile etkileşimli; `SeymaState.ui` kullanılabilir hâle gelinceye kadar `app.js` içindeki orijinali kalır.

**Test:**
```bash
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
```

---

### Adım -1.1.3: `mediaFx.js` implemente et

**Kaynak:** FX-LIBRARY.md §1–§3
**Hedef:** `app/core/mediaFx.js`

**Expose:**
- `window.SeyAudio`
- `window.SeyHaptics`
- `window.SeyFx`

**Detaylar:**
- `AudioContext` lazy initialize (kullanıcı etkileşimiyle).
- `navigator.vibrate` yoksa no-op.
- `prefers-reduced-motion: reduce` aktifse `SeyFx.shouldAnimate()` false döner.
- `settings.premiumAtmosphere === false` ise `SeyFx.isPremiumFxEnabled()` false döner.

**Test:**
```bash
node tests/app/test_premium_audio_fx.js
node tests/app/test_premium_haptics_fx.js
node tests/app/test_premium_reduced_motion.js
```

---

### Adım -1.1.4: `timeTheme.js` implemente et

**Kaynak:** FX-LIBRARY.md §3.6–§3.7, MODULARIZATION.md §3.2
**Hedef:** `app/core/timeTheme.js`

**Expose:** `window.SeyTimeTheme`

**Detaylar:**
- `classForHour(h)` 05–08 dawn, 09–16 day, 17–20 dusk, 21–04 night.
- `apply()` `#root` class listesini günceller.
- `seasonalClass()` Hicri takvim ve Miladi tarih bazlı.
- `settings.premiumAtmosphere === false` ise no-op.

**Test:**
```bash
node tests/app/test_premium_time_theme.js
```

---

### Adım -1.1.5: `index.html` yükleme sırasını güncelle

**Değişiklik:** `app/core/constants.js` ile `app.js` arasına yeni modülleri ekle.

```html
<script src="app/core/constants.js?v=..."></script>
<script src="app/core/dateUtils.js?v=..."></script>
<script src="app/core/state.js?v=..."></script>
<script src="app/core/helpers.js?v=..."></script>
<script src="app/core/mediaFx.js?v=..."></script>
<script src="app/core/timeTheme.js?v=..."></script>
<!-- existing app.js stays for now -->
<script src="app.js?v=..."></script>
```

**Risk:** İki kopya fonksiyon (eski `app.js` + yeni modül) çakışabilir. Çözüm: yeni modüller farklı isimle expose edilir (`window.SeymaDateUtils`), eski `app.js` fonksiyonları aynı kalır.

**Test:**
```bash
node tests/app/test_modularization_boundary.js
node tests/app/test_faz_minus11_boundary.js
```

---

### Adım -1.2.0: Domain modüllerini ayır

**Sıra:** prayer → zikir → quran → saygi → motivation → crisis → journal → health → library → report → map → messaging → reminders → profile → settings

**Her modül için:**
1. Yeni `app/core/<domain>.js` dosyası oluştur.
2. İlgili fonksiyonları `app.js`’ten kopyala.
3. `window.Seyma<Domain>` veya `App.*` olarak expose et.
4. `app.js` içindeki kopyayı sil.
5. `index.html`'e script tag ekle.
6. Test çalıştır.

**Test güvenlik ağı (her domain modülü sonrası):**
```bash
node --check app.js
node --check app/core/<domain>.js
node tests/app/test_faz10_sync.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/panel/test_faz11_panel.js
node tests/app/test_premium_audio_fx.js
node tests/app/test_premium_haptics_fx.js
node tests/app/test_premium_reduced_motion.js
node tests/app/test_premium_time_theme.js
node tests/app/test_modularization_boundary.js
node tests/app/test_faz_minus11_boundary.js
```

---

### Adım -1.3.0: `syncGlue.js` oluştur

**Kaynak:** `app.js` satır ~6208 (`SeyOnSynced`), ~6229 (`save`)
**Hedef:** `app/core/syncGlue.js`

**Expose:**
- `window.SeyOnSyncState`
- `window.SeyOnSynced`
- `window.SeymaSave`

**Kırmızı çizgi:** `save()` davranışı aynı kalır; `sync.js` ile etkileşim değişmez.

---

### Adım -1.4.0: `render.js` ve `appSurface.js` oluştur

**Kaynak:** `app.js` satır ~9688–18810
**Hedef:**
- `app/core/render.js`: `render()`, tab builder'lar, overlay shell'ler, modalsHTML
- `app/core/appSurface.js`: `App.*` handler'ları, event listener, boot sonu `render()`

**Kritik:**
- `App.*` yüzeyi aynı kalır.
- Inline `onclick="App.xxx(...)"` referansları bozulmaz.
- `window.App` expose edilir.

**Test:**
```bash
node tests/app/test_modularization_boundary.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
```

---

### Adım -1.4.1: `app.js` kaldır

**Koşul:** Yukarıdaki tüm testler PASS olduktan sonra.

**Değişiklikler:**
- `index.html`’den `<script src="app.js">` kaldır.
- `app.js` dosyasını arşivle veya sil (tercih: `archive/app-v1-monolith.js` olarak sakla, sonra sil).

**Test:**
```bash
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_faz10_sync.js
```

---

## 3. Faz 0: Altyapı ve Güvenlik Duvarı

### Adım 0.1: `migrate()` güncelle

**Kaynak:** `app.js` satır ~4415 (modülerleştirmeden sonra `state.js` içinde)
**Eklenecek alanlar:**
```js
if(typeof d.settings.premiumAtmosphere !== 'boolean') d.settings.premiumAtmosphere = true;
if(typeof d.settings.uiSounds !== 'boolean') d.settings.uiSounds = true;
if(typeof d.settings.voiceGuidance !== 'boolean') d.settings.voiceGuidance = false;
if(typeof d.settings.ambientSounds !== 'boolean') d.settings.ambientSounds = false;
if(typeof d.settings.richHaptics !== 'boolean') d.settings.richHaptics = true;
if(typeof d.settings.launchRitual !== 'boolean') d.settings.launchRitual = true;
```

**Test:**
```bash
node .claude/skills/run-seyma/verify-state-migration-boundary.mjs
```

---

### Adım 0.2: CSS değişkenleri ve yeni keyframe'ler

**Dosya:** `app/styles.css`

**Eklenecek keyframe'ler:**
- `seyRipple`
- `seyNavBounce`
- `seyCountUp` (sadece number slot)
- `seyShimmerRing`
- `seySplashFadeOut`

**Reduce motion kuralı:**
```css
@media (prefers-reduced-motion: reduce) {
  .sey-fx-ripple, .sey-fx-bounce, .sey-fx-count, .sey-fx-shimmer-ring,
  .sey-splash, .sey-time-theme {
    animation: none !important;
    transition: none !important;
  }
}
```

**Test:**
```bash
node tests/app/test_premium_reduced_motion.js
node docs/apple-design/verify-contrast.mjs
node docs/apple-design/verify-theme-tristate.mjs
```

---

## 4. Faz 1: UI Ses Dili + Haptik

### Adım 1.1: Handler'lara `SeyAudio` / `SeyHaptics` çağrısı ekle

**Etkileşim noktaları:**

| Handler | Satır | Ses | Haptik |
|---------|-------|-----|--------|
| `App.toggleHabit` | 8228 | `SeyAudio.tap()` | `SeyHaptics.tap()` |
| `App.setMood` | 8291 | `SeyAudio.tap()` | `SeyHaptics.tap()` |
| `App.waterAdd` | 8306 | `SeyAudio.tap()` | `SeyHaptics.water()` |
| `App.saveJournal` | 9114 | `SeyAudio.success()` | `SeyHaptics.success()` |
| `App.markSaygiRead` | 8195 | `SeyAudio.success()` | `SeyHaptics.success()` |
| `App.completeMotivationTask` | 11812 | `SeyAudio.success()` | `SeyHaptics.success()` |
| `App.openCrisis` | 9099 | `SeyAudio.warning()` | `SeyHaptics.error()` |
| `window.SeyOnSynced` | ~6208 | `SeyAudio.bell()` | `SeyHaptics.success()` |

**Kural:** Her çağrıdan önce `if(window.SeyAudio)` / `if(window.SeyHaptics)` kontrolü.

**Test:**
```bash
node tests/app/test_premium_audio_fx.js
node tests/app/test_premium_haptics_fx.js
```

---

## 5. Faz 2: Mikro-animasyon

### Adım 2.1: Ripple efekti

**Uygulama:** `App.*` handler'larına `event` objesi geçirerek `SeyFx.ripple(event, color)` çağrısı.

**Örnek:**
```js
App.waterAdd = function(n, event){
  // ...existing logic...
  if(window.SeyFx) SeyFx.ripple(event, 'var(--water)');
};
```

**HTML değişikliği:** Inline `onclick` handler'ları `event` parametresi alacak şekilde güncellenir:
```html
onclick="App.waterAdd(1, event)"
```

**Test:**
```bash
node tests/app/test_premium_reduced_motion.js
node .claude/skills/run-seyma/driver.mjs
```

---

### Adım 2.2: Count-up animasyonu

**Uygulama:** `SeyFx.countUp({ el, from, to, duration, formatter })`

**Kullanım alanları:**
- Su sayısı
- Streak
- Tamamlanmış tik sayısı
- Adım sayısı

**Test:** headless olarak `innerText` değişimini assert et.

---

## 6. Faz 3: Launch Splash

### Adım 3.1: `#sey-splash` HTML'i ekle

**Dosya:** `index.html` içine, `#app` div'den önce.

**Koşullar:**
- `settings.launchRitual === true`
- `settings.premiumAtmosphere === true`
- `prefers-reduced-motion: reduce` değil

**JS:**
- `showSplash()`: DOM'da göster.
- `hideSplash()`: `is-done` class ekle, 300ms sonra `display:none`.
- Boot sonunda otomatik `hideSplash()`.

**Test:**
```bash
node tests/app/test_premium_launch_splash.js
```

---

## 7. Faz 4: Time Theme

### Adım 4.1: `#root` class güncelleme

**Çağrı noktaları:**
- Boot sonu (`appSurface.js`)
- Her 30sn foreground poll loop (`app.js:18752` yerine `appSurface.js`)
- Tab değişiminde (`render()` başlangıcı)

**CSS:**
```css
#root.theme-time-dawn { --page: linear-gradient(...); }
#root.theme-time-day { --page: ...; }
#root.theme-time-dusk { --page: ...; }
#root.theme-time-night { --page: ...; }
```

**Test:**
```bash
node tests/app/test_premium_time_theme.js
```

---

## 8. Faz 5: Voice + Breath Guide

### Adım 5.1: `SeyAudio.voice()` bağlantıları

**Kullanım noktaları:**
- Günlük Işığı açılış sorusu
- Mood/stres yorumu
- Gece selamı
- 4-7-8 nefes metronomu

**Koşul:** `settings.voiceGuidance === true`.

**Test:** `speechSynthesis` stub ile headless test.

---

## 9. Faz 6: Ayarlar Paneli

### Adım 6.1: `ayarlarHTML()` yeni bölüm

**Dosya:** `app/core/settings.js` (modülerleştirmeden sonra)

**Bölüm:** "Görünüm & Ses"

**Toggle'lar:**
- Premium Atmosfer (master)
- UI Sesleri
- Zengin Titreşim
- Sesli Rehberlik
- Ambient Sesler
- Açılış Ritüeli

**Davranış:** Master kapalıyken diğer toggle'lar disabled görünür ama değerleri korunur.

**Test:**
```bash
node .claude/skills/run-seyma/driver.mjs
node tests/app/test_premium_reduced_motion.js
```

---

## 10. Her Adımda Çalıştırılacak Komutlar

```bash
node --check app.js
node --check app/core/<yeni-dosya>.js
node tests/app/test_faz10_sync.js
node tests/app/test_modularization_boundary.js
node tests/app/test_faz_minus11_boundary.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/panel/test_faz11_panel.js
node tests/app/test_premium_audio_fx.js
node tests/app/test_premium_haptics_fx.js
node tests/app/test_premium_reduced_motion.js
node tests/app/test_premium_launch_splash.js
node tests/app/test_premium_time_theme.js
node docs/apple-design/verify-contrast.mjs
node docs/apple-design/verify-theme-tristate.mjs
```

---

## 11. Fallback ve Recovery

| Senaryo | Fallback |
|---------|----------|
| `AudioContext` yok | `SeyAudio` no-op |
| `navigator.vibrate` yok | `SeyHaptics` no-op |
| `prefers-reduced-motion: reduce` | Tüm animasyonlar/sesler/haptikler pasif |
| `settings.premiumAtmosphere === false` | `isPremiumFxEnabled()` false |
| `mediaFx.js` yüklenemedi | `if(window.SeyAudio)` kontrolü sayesinde çökmez |
| `timeTheme.js` yüklenemedi | `#root` class değişmez, default theme kalır |
| `app.js` modularization sırasında handler kaybı | `test_modularization_boundary.js` catch eder |

---

## 12. Performans Bütçesi

Detaylı bütçe için [PERFORMANCE-BUDGET.md](PERFORMANCE-BUDGET.md) dosyasına bak.

Özet:
- Yeni JS: max +8 KB gzip (hedef: +5 KB).
- Yeni CSS: max +4 KB gzip (hedef: +2.5 KB).
- Her render: max +2ms JS hesaplama.
- Animasyonlar: 60fps, `requestAnimationFrame` kullan.
- `will-change` sadece animasyon süresince.

---

## 13. Panel Etkileri

Detay için [PANEL-IMPACT.md](PANEL-IMPACT.md) dosyasına bak.

Özet:
- `panel.html` bağımsız; `app.js` monolit kalksa bile etkilenmez.
- Yeni `settings.*` alanları `data/latest.json` içinde panel tarafından okunabilir.
- FX durumları sync edilmez; panel sadece `data` içindeki alanları gösterir.
- Yeni `data` alanı yoktur; tüm FX ayarları `settings` altındadır.
