# Şeyma Premium FX Planı — İnceleme Kontrol Listesi

**Sürüm:** v2.1 — 2026-08-30

Bu liste, planın uygulanmaya başlamadan önce ve her faz sonrası gözden geçirilmesi gereken maddeleri içerir.

## Genel

- [ ] Plan, Şeyma'nın mevcut mimarisine (tek `data` objesi, `migrate()`, `render()` innerHTML, inline `onclick`) uygun.
- [ ] Şeyma'nın mevcut `App.*` handler yüzeyi ve inline `onclick="App.xxx(...)"` deseni korunuyor; yeni etkileşimler bu yüzeye ekleniyor.
- [ ] Tüm efektler `prefers-reduced-motion: reduce` ile pasif hale getirilebiliyor.
- [ ] Kullanıcı `settings.premiumAtmosphere` ile tüm efektleri kapatabiliyor.
- [ ] Yeni veri alanları sadece `settings` altında.
- [ ] `migrate()` spec'i yazıldı ve idempotent.
- [ ] `sync.js` `sanitize()` ile uyumlu (hiçbir efekt state'i repoya gitmiyor).
- [ ] `index.html` cache-bump planı var.

## Kod Kalitesi

- [ ] Fonksiyonlar 50 satırı aşmıyor (uzun fonksiyonlar parçalanmış).
- [ ] Dosyalar 800 satırı aşmıyor (yeni modüller ayrı dosyalarda).
- [ ] Değişken/fonksiyon isimleri `camelCase`, sabitler `UPPER_SNAKE_CASE`.
- [ ] Yeni kodda `var` yerine `let`/`const` tercih ediliyor; mevcut `app.js` CommonJS/IIFE tarzında `var` kullanıyor, refactor aşamasında düzgünce ele alınıyor.
- [ ] Hata handling var; ses/haptik fonksiyonları try/catch ile sarmalı.

## Güvenlik

- [ ] Web Audio / Speech API sadece kullanıcı etkileşimiyle tetikleniyor.
- [ ] Otomatik oynatma yok.
- [ ] Harici ses dosyası kullanılmıyor (veya base64/data-uri).
- [ ] Hiçbir efekt `localStorage` dışında veri yazmıyor.

## Test

- [ ] `node --check app.js` geçiyor.
- [ ] `node --check app/core/mediaFx.js` geçiyor.
- [ ] `run-seyma` headless testleri geçiyor (`driver.mjs` ve `zikr-harness.mjs`).
- [ ] `node tests/panel/test_faz11_panel.js` geçiyor.
- [ ] `node tests/app/test_premium_audio_fx.js` geçiyor.
- [ ] `node tests/app/test_premium_haptics_fx.js` geçiyor.
- [ ] `node tests/app/test_premium_reduced_motion.js` geçiyor.
- [ ] `node tests/app/test_premium_launch_splash.js` geçiyor.
- [ ] `node tests/app/test_premium_time_theme.js` geçiyor.
- [ ] `node tests/app/test_modularization_boundary.js` geçiyor.
- [ ] `node tests/app/test_faz_minus11_boundary.js` geçiyor.
- [ ] `node docs/apple-design/verify-contrast.mjs` geçiyor.
- [ ] `node docs/apple-design/verify-theme-tristate.mjs` geçiyor.
- [ ] Yeni premium fixture'ları çalışıyor.

## Dalga 1 Audio (FX-P-16)

- [x] `SeyAudio.tap()` entegre edildi (app.js çağrı noktaları: `zikrTickSound` → `SeyAudio.tap()`).
- [x] `SeyAudio.success()` entegre edildi (app.js çağrı noktaları: `App.toggleHabit` tek kart, `maybeStreak` kilometre taşı, `App.toggleHabit`/`App.toggleMgHabit` tüm hedefler).
- [x] `SeyAudio.warning()` entegre edildi (app.js çağrı noktaları: `streamAsk` limit, `App.addCaffeineDrink` kafein limiti, `App.saveQuote` geçersiz giriş, `App.completeMotivationTask` reflection boş).
- [x] `SeyAudio.bell()` entegre edildi (app.js çağrı noktaları: `App.zikrTap` tur/hatim, `App.completeMotivationTask` başarılı yol, `App.reminderInboxPrimary` hatırlatma kapanışı).
- [x] Audio test fixture PASS (`tests/app/test_premium_audio_fx.js` — gerçek `mediaFx.js` yüklenir, 26/26).

## Dalga 2 Haptics (FX-P-24)

- [x] `SeyHaptics.tap()` uygulandı ve temel etkileşimlere entegre edildi (app.js çağrı noktaları: `setMood`, `setEnergy`, `setStress`, `toggleHabit`, `saveToday`, overlay aç/kapa, yıldız puanlama, `setRoomTab`, `toggleTheme`).
- [x] `SeyHaptics.success/error/refresh/streak/water` uygulandı (desenler FX-LIBRARY.md §2'ye hizalı).
- [x] `SeyHaptics.streak()` entegre edildi (app.js çağrı noktaları: `maybeStreak` kilometre taşı, zikir tur/hatim tamamlama, motivasyon görevi tamamlama).
- [x] `SeyHaptics.water()` entegre edildi (app.js çağrı noktası: `App.waterAdd` pozitif delta — `tap()` yerine `water()`, aynı event'te tek haptik).
- [x] `richHaptics + haptics + premiumAtmosphere + reduced-motion` gating çalışıyor.
- [x] Haptics test fixture PASS (`tests/app/test_premium_haptics_fx.js` — gerçek `mediaFx.js` yüklenir, desenler + gating + app.js çağrı noktaları doğrulanır).

## Dokümantasyon

- [ ] `docs/GELISTIRME-PLANI.md` güncelleme planı var; şu an için güncelleme yalnızca plan/spec/test aşamasında, canlı `app.js` dokümanı bu aşamada değiştirilmiyor.
- [ ] `AGENTS.md` / `CLAUDE.md` güncellenmesi gerekiyorsa planlandı.
- [ ] Anti-amnesi `CURRENT-STATE.md` ve `LEDGER.md` güncellendi.
