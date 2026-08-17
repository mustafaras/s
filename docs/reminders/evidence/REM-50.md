# REM-50 — App foreground lifecycle ve scheduler orchestration

## Receipt

- **Program:** APP-REMINDER-UX
- **Prompt:** REM-50
- **Tarih:** 2026-08-17
- **Commit:** `b0bba5d`
- **Repo:** `/Users/m_ras/Desktop/seyma`
- **Başlangıç HEAD:** `986ce137c5e679cc49eea8d8ed613f253914c36b`
- **Bitiş HEAD:** `b0bba5d` (runtime/test commit; closure receipt docs commit is recorded in STATE)
- **Release approval:** `NOT_APPROVED`
- **Approval evidence:** `none`

## Kapsam

- **Allowlist:** `app.js`, `app/core/reminderScheduler.js`, `tests/reminders/test_reminder_app_lifecycle.js`, `tests/reminders/test_reminder_lifecycle.js`, `tests/reminders/test_reminder_catchup.js`
- **Closure records:** `docs/reminders/evidence/REM-50.md`, `docs/reminders/APP-REMINDER-ANTI-AMNESIA-LEDGER.md`, `docs/reminders/APP-REMINDER-STATE.json`
- **Protected paths changed:** `no`

REM-50, foreground lifecycle girişlerini saf `ReminderSchedulerV1` orchestration
sözleşmesine bağladı. `boot`, `foreground`, `focus`, `pageshow`, `online`,
`hidden`, `visibilitychange`, `timer` ve `offline` ayrı bounded trigger
matrisinde kaydediliyor. Aynı trigger’ın 1 saniyelik burst’ünde ikinci
evaluation coalesced oluyor; delivery journal’daki stable occurrence dedupe
ile birlikte tek durable delivery kalıyor. ÆON/health/Quran poll timer’ı ile
reminder timer’ı ayrı handle’larda tutuluyor; foreground/online yan akışları
coalesced trigger’da yeniden çalışmıyor. Scheduler background scheduling,
app-closed guarantee ve native replay’i açıkça `false` tutuyor; recovery
catch-up üst sınırı 24 saat ve in-app only.

## Komut sonuçları

| Katman | Komut | Sonuç | Kısa kanıt |
|---|---|---|---|
| Syntax | `node --check app.js && node --check app/core/reminderScheduler.js` | PASS | syntax temiz |
| Unit / pure | `node tests/reminders/test_reminder_app_lifecycle.js` | PASS | 51 assertion; trigger matrix, burst coalescing, timer ayrımı, bounded recovery |
| Required lifecycle | `node tests/reminders/test_reminder_lifecycle.js` | PASS | 36 assertion; existing delivery/lifecycle regression |
| Required catch-up | `node tests/reminders/test_reminder_catchup.js` | PASS | 46 assertion; grouping, previous-local-date, no native replay |
| Reminder regression | `for f in tests/reminders/test_*.js; do node "$f"; done` | PASS | tüm reminder fixture döngüsü |
| Headless UI | `node .claude/skills/run-seyma/driver.mjs` | PASS | onboarding, location gate, seeded render, tab/theme/save interactions |
| Root / Panel regression | root fixture loop + Panel-v2 fixture loop | PASS | existing ÆON/panel surfaces unchanged |
| State boundaries | B1 / B2 / B3 fixtures | PASS | helper, migration parity ve dependency-bag sınırları |
| Syntax / diff | `node --check sync.js && node --check panel.js && git diff --check` | PASS | whitespace ve unrelated syntax temiz |
| Context | `node docs/reminders/verify-reminder-context.mjs` | PASS | 73 prompt / 66 local link; approval `not_approved` |

## Evidence seviyeleri

- **Source evidence:** S1 — trigger matrix, burst gate, independent timer handles,
  foreground-only/background capability flags ve bounded catch-up kaynakta mevcut.
- **Synthetic test evidence:** S2 — memory-only VM fixtures; browser, real
  localStorage, real network, notification, sync/data repo ve external telemetry
  kullanılmadı.
- **Commit evidence:** S3 — local runtime/test commit `b0bba5d`.
- **CI / Pages evidence:** S4 — closure sonrası standing main/Pages delivery
  receipt’i ayrıca eklenecek.
- **User-device evidence:** S5 pending — kullanıcı cihazında doğrulama yapılmadı.

## Release hard gate

- **Push / merge / tag / Pages / external write:** closure sonrası standing
  `after_each_prompt` delivery kapsamı dışında henüz yapılmadı.
- **`mustafaras/seyma-data` write:** `not performed`.
- **Release state:** `NOT_APPROVED`.

## Sonuç

- **Durum:** done
- **Blocker:** none
- **Sonraki prompt:** REM-51 — App feature surface adapter ve deep-link conformance (`ready`)
- **Not:** Background/app-closed local alarm guarantee’i veya S5 cihaz davranışı
  iddia edilmedi; yalnız sentetik source/test kanıtı üretildi.
