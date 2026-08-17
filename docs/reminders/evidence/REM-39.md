# REM-39 — Retention, export, clear ve reset yaşam döngüsü

Tarih: 2026-08-17  
Faz/gate: R9 / G9-J  
Kaynak commit: `dba9379f274032cb209c44854056813d5fd48a47`

## Kapsam

- `REMINDER_RETENTION_POLICY` ile sahiplik ve süreler ayrıldı: preference kullanıcı temizleyene kadar local; occurrence türetilmiş ve 1 günlük catch-up sınırıyla ephemeral; delivery journal 30 gün / 200 kayıt; notification action history 14 gün / 100 kayıt; digest son 7 local gün için presence-only ve kalıcı kayıtsız.
- Delivery journal v2 `clearBoundaryAt`, monotonik `generation` ve bounded `tombstones` taşır. Kullanıcı onaylı clear eski kayıtları kaldırır; tombstone veya occurrence’ın boundary öncesi schedule zamanı eski occurrence’ın yeniden oynatılmasını fail-closed engeller. Boundary sonrasındaki yeni occurrence normal şekilde kabul edilir.
- Reminder Center’a local-only “Saklama ve çıkış” yüzeyi eklendi. Clear history confirmation + undo; “Tümünü kapat” confirmation + preference/history korumalı undo; export yalnız aggregate summary; full reset confirmation ile yalnız reminder root, local journal/action history ve reminder permission kaydını siler, günlük kayıtlarına dokunmaz ve geri alınamaz.
- Export summary’de raw note, therapy body, medication name/dose, native body, token, sync secret, occurrence schedule ve delivery body bulunmaz. `sync.js` mevcut local-only sanitize sınırı korunur; reminder root remote projection’a girmez.
- Malformed veya eksik reminder root/storage alanları mevcut additive migration ve normalize helper’larıyla privacy-safe default’a döner. Disable-all undo, concurrent local merge tarafından tekrar disabled state’e ezilmemesi için yeni local scope timestamp’iyle kaydedilir.

## Kanıt ve doğrulama

Source/test evidence:

- `node --check app.js` ve `node --check sync.js` — PASS.
- `node tests/reminders/test_reminder_retention.js` — PASS; 5 case / 58 assertion: bounded retention, malformed defaults, confirmation, tombstone/no-replay, disable-all undo ve full reset residue boundary.
- `node tests/reminders/test_reminder_privacy.js` — PASS; 4 case / 58 assertion: local-only sync projection, journal redaction ve export negative privacy boundary.
- `node tests/reminders/test_reminder_migration.js` — PASS; 5 case / 50 assertion.
- Related regression: delivery 38, Reminder Center advanced 48, concurrency 38, sync/privacy 97 assertion — PASS.
- `node .claude/skills/run-seyma/driver.mjs` — PASS; onboarding, seeded render, tab, dark theme ve header-save headless VM akışı.
- `node docs/reminders/verify-reminder-context.mjs` — PASS; 73 prompt / 67 local link, `approval=not_approved`.
- `git diff --check` — PASS.

Full-suite note: mevcut `test_reminder_digest.js` içindeki “on this day” fixture’ı 2025-08-16’yı sabitliyor; çalışma tarihi 2026-08-17 olduğu için bu eski date-sensitive case kartı bekleyip fail oluyor. REM-39 allowlist’i digest testini veya bu feature’ın tarih sözleşmesini değiştirmedi; REM-39 hedef testleri ve ilgili reminder regresyonları PASS.

Deployment/device evidence:

- Browser, local server, gerçek network, gerçek localStorage, canlı reminder verisi ve `mustafaras/seyma-data` yazımı kullanılmadı.
- Headless fixture fetch/Notification yüzeyleri mock ve network-disabled kaldı; export testi download’ı kapalı, yalnız in-memory summary doğrulandı.
- Push, merge, tag, Pages/deploy ve external write yapılmadı. `releaseApproval.status` `not_approved`; S5 kullanıcı cihazı kabulü pending.

## Handoff

REM-39 kapanmıştır. G9-J kanıtı tamamlandı; `REM-40` plan reconciliation ve traceability audit için sıradaki güvenli prompt olarak hazırdır. Yeni prompt başlamadan önce canonical context/state/ledger tekrar okunmalıdır.
