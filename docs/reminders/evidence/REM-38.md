# REM-38 — Multi-tab concurrency, idempotence ve anti-clobber

Tarih: 2026-08-16  
Faz/gate: R9 / G9-I  
Kaynak commit: `511348d81fa46abf5d1e879cb56cffafe5da116d`

## Kapsam

- `app.js`, full local save / sync receipt write öncesinde `data.reminders` local owner’ını mevcut `localStorage` snapshot’ıyla scope-aware birleştiriyor. Preference seçimleri `lastEditedAt`, explicit local scope değişiklikleri `_localMeta` ile korunuyor; eski tabın full-replace yazısı daha yeni seçimi geri alamıyor.
- `storage` event’i reminder root’u körlemesine değiştirmiyor; gelen state’i aynı bounded merge sözleşmesiyle alıyor. Boş veya reminders içermeyen event fail-closed kalıyor.
- Delivery journal `seyma-reminder-delivery-v1` canonical preference root’undan ayrı tutuluyor. Aynı occurrence iki tab, foreground recovery ve online retry akışında tek terminal kayıt üretiyor.
- `sync.js`, reminder-free remote projection’ın local receipt yazısıyla canonical local reminder root’unu silmesini engelliyor. `sanitize()` reminder root’unu remote payload’dan çıkarmaya devam ediyor; `putLatestGuarded` yalnız sentetik GET→merge→PUT fixture’ı için dışa açıldı.

## Kanıt ve doğrulama

Source/test evidence:

- `node tests/reminders/test_reminder_concurrency.js` — PASS; 5 case / 38 assertion. Aynı occurrence iki tabda tek native delivery ve tek journal satırı; gecikmiş storage event ile iki ayrı preference değişikliği korunuyor; offline delivery journal canonical preference’tan ayrılıyor; sync receipt/retry local reminder owner’ını koruyor; sentetik GET→merge→PUT uzak günü koruyor.
- `node tests/test_faz10_sync.js` — PASS; 64/64.
- `node tests/test_panel_p0_sync.js` — PASS; 31/31.
- `node docs/reminders/verify-reminder-context.mjs` — PASS; 73 prompt / 67 local link, `approval=not_approved`.
- `node .claude/skills/run-seyma/driver.mjs` — PASS; onboarding, seeded render, tab, dark theme ve header-save headless VM akışı.
- `node tests/reminders/test_reminder_medication.js` — PASS; 65 assertion; explicit medication add/edit/delete merge sınırı stabil doğrulandı.
- `node tests/reminders/test_reminder_migration.js` — PASS; 50 assertion. Full reminder fixture loop, root fixture loop ve Panel-v2 fixture loop — PASS; syntax ve `git diff --check` — PASS.

Deployment/device evidence:

- Browser, local server, gerçek network, gerçek localStorage, canlı reminder verisi ve `mustafaras/seyma-data` yazımı kullanılmadı.
- Sync fixture’ındaki GET/PUT yalnız in-memory `fetch` mock’udur; local schedule/retry fixture’ında fetch çağrısı `0`’dır. Gerçek remote write yapılmadı.
- Push, merge, tag, Pages/deploy ve external write yapılmadı. Kaynak commit yalnız local Git history’dedir.
- `releaseApproval.status` `not_approved` kaldı; S5 kullanıcı cihazı kabulü pending.

## Handoff

REM-38 kapanmıştır. G9-I kanıtı tamamlandı; `REM-39` retention, export, clear ve reset lifecycle için sıradaki güvenli prompt olarak hazırdır. Yeni prompt başlamadan önce canonical context/state/ledger tekrar okunmalıdır.
