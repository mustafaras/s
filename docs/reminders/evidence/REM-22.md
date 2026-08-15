# REM-22 — Notification permission state machine evidence

**Tarih:** 2026-08-15<br>
**Durum:** tamamlandı<br>
**Implementation commit:** `60ea3d48bb0b2b324a95e9aaea819a65b3398c92`

## Uygulanan sözleşme

- Reminder permission state'leri `unsupported`, `default`, `granted`,
  `denied`, `temporary-error` ve `pwa-limited` olarak ayrıldı. `error` girişi
  güvenli biçimde `temporary-error` olarak normalize edilir.
- İlk boot'ta ne reminder ne ÆON için permission request yapılmaz. Native
  kanal select'i, bakım native opt-in'i veya merkezdeki açık izin düğmesi
  request'i başlatır. Reddedilen / desteklenmeyen / PWA-limited durumlarda
  uygulama içi kart korunur; otomatik permission loop yoktur.
- Reminder state ayrı device-local `seyma-reminder-permission-v1` anahtarında
  tutulur. ÆON'ın `data.settings.aeonNotifyPermission` alanı reminder akışı
  tarafından yazılmaz.
- Denied durumda Türkçe tarayıcı ayarları rehberi, unsupported durumda in-app
  fallback, PWA-limited durumda catch-up açıklaması ve geçici hatada yalnız
  kullanıcı dokunuşuyla retry gösterilir.
- Native preview genel ve mahrem kopya kullanır; kullanıcı notu, duygu, terapi,
  ilaç veya ÆON mesaj gövdesi native preview'a taşınmaz.

## Acceptance ve test receipt'leri

| Kapı | Kanıt |
|---|---|
| Required syntax | `node --check app.js` — PASS |
| Permission state machine | `node tests/reminders/test_reminder_permission.js` — PASS, 63 assertion; initial boot, explicit request, all states, fallback, no-loop ve ÆON field separation |
| Native mock contract | `node tests/reminders/test_reminder_native.js` — PASS, 22 assertion; explicit channel, separate state, private-safe preview, denied/PWA fallback |
| Required headless app | `node .claude/skills/run-seyma/driver.mjs` — PASS; onboarding, seeded render, interaction, theme ve save-state |
| Reminder regression | `tests/reminders/test_reminder_*.js` — 27 fixture, tamamı PASS |
| Wider regression | Root 32 fixture, Panel-v2 27 fixture, Zikr harness 90/90, B1/B2/B3 state boundaries — PASS |
| Context / whitespace | `verify-reminder-context.mjs` önceki canonical PASS; `git diff --check` — PASS |

## Safety and release boundary

Gerçek browser açılmadı, server başlatılmadı, gerçek localStorage/token/kullanıcı
verisi veya network kullanılmadı. `mustafaras/seyma-data` write, external
write, push, merge, Pages, deploy ve device acceptance yapılmadı. Release
approval `not_approved` olarak korunur.

## Kapanış

R6 permission gate'i state transition mock'ları, explicit user action, in-app
fallback ve ÆON/reminder ayrımıyla PASS edildi. `REM-23` sıradaki güvenli
prompt olarak hazırdır.
