# REM-04 — Preference state ve additive migration evidence

**Tarih:** 2026-08-13<br>
**Durum:** tamamlandı<br>
**Kapsam:** canonical reminder preference migration, local delivery ayrımı ve
fail-closed app→sync projection sınırı.

## Uygulanan sözleşme

- data.reminders additive olarak schemaVersion: 1 ve preferences: {}
  ile oluşturulur; mevcut days, settings.prayer, profileAssessment,
  zikr ve bilinmeyen alanlar korunur.
- Her preference için reminderId, enabled ve privacyMode zorunludur.
  Eksik veya bozuk değerler sırasıyla map key’i, false ve private ile
  güvenli biçimde backfill edilir.
- daysOfWeek, timeWindow, offsetMinutes, timezone, channel,
  quietHoursBehavior, maxPerDay, snoozeOptions ve lastEditedAt yalnız
  doğrulanabilir biçimleriyle tutulur; bilinmeyen alanlar korunur.
- Migration iki kez çalıştırıldığında reminder subtree’si derin parity verir.
  ReminderDelivery hiçbir zaman data içine veya data.notifications’a
  import edilmez; seyma-reminder-delivery-v1 ayrı local key olarak kalır.
- save() local canonical state’i korur, fakat SeySync.schedule çağrısına
  data.reminders çıkarılmış JSON projection verir. JSON projection üretilemezse
  sync çağrısı yapılmaz. Bu, REM-25’teki bağımsız sync.js sanitize/merge
  fixture’ı tamamlanana kadar fail-closed ara sınırdır.

## Test fixture kanıtı

| Komut | Sonuç |
|---|---|
| node tests/reminders/test_reminder_migration.js | PASS — 5 case, 50 assertion |
| node tests/reminders/test_reminder_privacy.js | PASS — 2 case, 19 assertion |
| node .claude/skills/run-seyma/verify-state-migration-boundary.mjs | PASS — 32 / 32 |
| node .claude/skills/run-seyma/driver.mjs | PASS — onboarding, seeded render, interaction ve save-state assertions |
| node --check app.js | PASS |
| node --check sync.js | PASS |
| node --check sw.js | PASS |
| node --check tests/reminders/test_reminder_migration.js | PASS |
| node --check tests/reminders/test_reminder_privacy.js | PASS |
| node --check tests/reminders/helpers/reminder-test-helper.js | PASS — değişmedi |
| git diff --check | PASS |

Privacy fixture’ı private detail, sensitive note ve synthetic secret’ın
scheduled projection’a girmediğini; canonical local state’te kaldığını;
delivery key’inin değişmediğini; data.notifications dizisinin delivery
owner’ına dönüşmediğini ve fetch sayısının sıfır olduğunu doğrular.

## Sınırlar ve değişmeyen yüzeyler

- sync.js değiştirilmedi. Mevcut genel sanitize() yalnız bilinen secret
  alanlarını kapsar; reminder-specific remote sanitize/merge kararı REM-25’in
  açık acceptance gate’idir. Bu nedenle cihazlar arası preference sync varsayılan
  değildir ve bu receipt full remote privacy PASS iddiası taşımaz.
- app/core/reminderCatalog.js, index.html, sw.js, data/,
  mustafaras/seyma-data, token/secret ve gerçek kullanıcı verisi değişmedi.
- Browser açılmadı, server başlatılmadı, gerçek localStorage, remote endpoint,
  Pages, deploy veya external system kullanılmadı.
- STATE.json.releaseApproval.status not_approved olarak kaldı; push, merge,
  tag ve canlı doğrulaması yapılmadı.

## Kapanış

REM-04 blocker’sız kapandı. Sonraki güvenli adım REM-05 Reminder Center
shell’idir.

## Local commit receipt

`15f1ba8` — `REM-04: reminder preference migration`
