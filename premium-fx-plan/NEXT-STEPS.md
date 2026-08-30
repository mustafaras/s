# Şeyma Premium FX Planı — Devam Eden İşler

**Tarih:** 2026-08-30
**Durum:** Opus 5 devir iptal edildi; aynı oturumda devam ediliyor.
**Kural:** Hâlâ plan/spec/test only — uygulama koduna dokunulmuyor.

## Tamamlananlar

- [x] `app.js` tüm user-facing bölümleri okundu (health, report, settings, zikirmatik, Kur'an Yolculuğu, Saygı, overlay hub'lar, modals, ÆON/Luna mesajlaşma).
- [x] `CODE-MAP.md` v2.1 güncellendi; gerçek fonksiyon/satır referansları eklendi.
- [x] `deliverables/SPEC-FAZ-0..6.md` v2.1 güncellendi; gerçek `app.js` satır numaraları ve handler referansları eklendi.
- [x] `MIGRATE-SPEC.md` ve `REDUCED-MOTION-SPEC.md` v2.1 güncellendi.
- [x] `tests/app/` altına 5 çalışan headless test fixture'ı eklendi:
  - `test_premium_audio_fx.js`
  - `test_premium_haptics_fx.js`
  - `test_premium_reduced_motion.js`
  - `test_premium_launch_splash.js`
  - `test_premium_time_theme.js`
- [x] Anti-amnesia ledger ve CURRENT-STATE v2.1 güncellendi.
- [x] Mevcut headless testler (`test_faz10_sync.js`, `driver.mjs`, `zikr-harness.mjs`) geçmeye devam ediyor.

## Sırada Yapılacaklar

1. [ ] `tests/app/test_modularization_boundary.js` fixture'ını ekle (Faz -1 modül sınırı için).
2. [ ] `SAFEGUARDS.md` ve `REVIEW-CHECKLIST.md`'yi plan v2.1 ile uyumlu hale getir.
3. [ ] Kullanıcı onayı alındıktan sonra Faz -1 (`app.js` modülerleştirme) implementasyonuna başla.

## Kısıtlamalar

- Uygulama koduna dokunma.
- `data`, `migrate()`, `sync.js`, `save()`, `localStorage` key'leri değişmez.
- Erişilebilirlik ve reduced-motion kurallarına uy.
- Headless `run-seyma` harness'leri kullan.
