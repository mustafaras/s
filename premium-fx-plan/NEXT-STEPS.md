# Şeyma Premium FX Planı — Devam Eden İşler

**Tarih:** 2026-08-30
**Durum:** Opus 5 devir iptal edildi; aynı oturumda devam ediliyor.
**Kural:** Hâlâ plan/spec/test only — uygulama koduna dokunulmuyor.

## Tamamlananlar

- [x] `app.js` tüm user-facing bölümleri okundu (health, report, settings, zikirmatik, Kur'an Yolculuğu, Saygı, overlay hub'lar, modals, ÆON/Luna mesajlaşma).
- [x] `CODE-MAP.md` v2.1 güncellendi; gerçek fonksiyon/satır referansları eklendi.
- [x] `MODULARIZATION.md` v2.1 tamamlandı; 24 modül için gerçek `app.js` satır aralıkları, bağımlılık grafiği, geçiş sırası, risk tablosu ve Faz -1 çıktı listesi eklendi.
- [x] `deliverables/SPEC-FAZ-0..6.md` v2.1 güncellendi; gerçek `app.js` satır numaraları ve handler referansları eklendi.
- [x] `MIGRATE-SPEC.md` ve `REDUCED-MOTION-SPEC.md` v2.1 güncellendi.
- [x] `SAFEGUARDS.md` ve `REVIEW-CHECKLIST.md` v2.1 güncellendi.
- [x] `tests/app/` altına 6 çalışan headless test fixture'ı eklendi:
  - `test_premium_audio_fx.js`
  - `test_premium_haptics_fx.js`
  - `test_premium_reduced_motion.js`
  - `test_premium_launch_splash.js`
  - `test_premium_time_theme.js`
  - `test_modularization_boundary.js` ← Faz -1 sınır fixture'ı
- [x] Anti-amnesia ledger ve CURRENT-STATE v2.2 güncellendi.
- [x] Mevcut headless testler (`test_faz10_sync.js`, `driver.mjs`, `zikr-harness.mjs`) ve tüm 6 yeni premium fixture geçmeye devam ediyor.

## Sırada Yapılacaklar

1. [x] Kod değiştirilmeden modül API yüzeyi ve geçiş PR rehberi tamamlandı (`API-TRANSITION-GUIDE.md`).
2. [x] PR -1.1 öncesi sınır testi eklendi (`test_faz_minus11_boundary.js`).
3. [ ] Kullanıcı onayı alındıktan sonra Faz -1 (`app.js` modülerleştirme) implementasyonuna başla.
4. [ ] İlk PR: `dateUtils.js` + `helpers.js` + `mediaFx.js` + `timeTheme.js` + `index.html` yükleme sırası.

## Kısıtlamalar

- Uygulama koduna dokunma (onay alınana kadar).
- `data`, `migrate()`, `sync.js`, `save()`, `localStorage` key'leri değişmez.
- Erişilebilirlik ve reduced-motion kurallarına uy.
- Headless `run-seyma` harness'leri kullan.
