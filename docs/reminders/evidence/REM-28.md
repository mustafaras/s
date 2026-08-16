# REM-28 — Full regression, migration ve deterministic time matrix evidence

**Tarih:** 2026-08-16<br>
**Durum:** tamamlandı<br>
**Kapsam:** R8 full regression, additive migration, deterministic time
matrix ve reminder privacy boundary doğrulaması.

## Receipt

- **Program:** APP-REMINDER-UX
- **Prompt:** REM-28
- **Başlangıç HEAD:** `4feffeeacdc6aee5cc80f0901b7ce6c9ec23b05e`
- **Commit:** `2884fbeacdc6aee5cc80f0901b7ce6c9ec23b05e`
- **Release approval:** `NOT_APPROVED`
- **Approval evidence:** `none`

## Deterministic fixture düzeltmeleri

- `test_reminder_prayer.js` inbox projection çağrısına sentetik `NOW` ve
  `DATE` geçiriyor; test hostunun bugünkü tarihi artık fixture gününü
  değiştiremiyor.
- `test_reminder_saygi.js` `FixedDate` ile no-argument ve çok-parametreli
  tarih kurulumlarını sentetik `NOW` altında çalıştırıyor. Böylece Saygı
  article `dailyKey`, gün kişisi ve lifecycle dedupe zinciri wall-clock’a
  bağlı kalmıyor.
- Assertion kaldırılmadı veya gevşetilmedi; iki REM-27 date-pinned
  discrepancy bu şekilde deterministik olarak kapandı.

## Komut sonuçları

| Katman | Komut / yüzey | Sonuç | Kısa kanıt |
|---|---|---|---|
| Syntax | `node --check app.js sync.js sw.js hijriCalendar.js app/core/constants.js app/core/reminderCatalog.js panel.js panelCoverageManifest.js` | PASS | Her dosya ayrı `node --check` ile geçti |
| Context | `node docs/reminders/verify-reminder-context.mjs` | PASS | 73 prompt, 67 local link, approval `not_approved` |
| Headless app | `node .claude/skills/run-seyma/driver.mjs` | PASS | onboarding, seeded render, tab/theme/save akışları |
| Headless hub | `node .claude/skills/run-seyma/zikr-harness.mjs` | PASS | 90/90 assertion |
| Migration | `node .claude/skills/run-seyma/verify-state-migration-boundary.mjs` | PASS | B2 32/32, second-boot deep parity |
| Helper | `node .claude/skills/run-seyma/verify-state-helper-boundary.mjs` | PASS | B1 0 failure |
| Reminder | `for f in tests/reminders/test_*.js; do node "$f"; done` | PASS | 33/33 suite; contract, policy, UX, native, privacy ve integration tamamı geçti |
| Root | `for f in tests/test_*.js; do node "$f"; done` | PASS | 92/92 root fixture exit 0; Faz 10 sync 64/64, Panel/Faz/Quran regressionları geçti |
| Panel-v2 | `for f in tests/panel-v2/test_panel_v2_*.js; do node "$f"; done` | PASS | 27/27 fixture exit 0 |
| Whitespace | `git diff --check` | PASS | whitespace error yok |

## Time matrix

| Alan | Kanıt |
|---|---|
| Exact threshold | `test_reminder_scheduler.js` 54 assertion; eşik gözlemlenebilir |
| Midnight / offset crossing | scheduler 54 + timezones 28; local date ve prayer offset ayrımı |
| Quiet start/end | `test_reminder_quiet_hours.js` 28; inclusive/exclusive sınırlar |
| Europe/Istanbul | `test_reminder_timezones.js` 28; IANA timezone açık ve injected instant kullanılıyor |
| DST spring/fall | timezones 28; nonexistent hour ve repeated hour deterministic |
| Hicri offset -2/0/+2 | `test_reminder_special_days.js` 35; offset ID’yi değiştirmiyor |
| Stale prayer / method / city | `test_reminder_prayer.js` 48; stale, missing, offline ve metadata mismatch fail-closed |
| Offline / online / reopen | `test_reminder_lifecycle.js` 36 + `test_reminder_catchup.js` 46; replay yok |
| Duplicate / repeated evaluation | `test_reminder_delivery.js` 38 + Saygı 71; tek occurrence, ikinci değerlendirme duplicate |
| Clock backward / malformed input | scheduler 54 + timezones 28 + policy 71; invalid input fail-closed |

## Privacy matrix

- `test_reminder_native.js`, `test_reminder_copy.js`, `test_reminder_privacy.js`
  ve medication/care/therapy suites: notification title/body içinde mood,
  journal, prayer completion/note, therapy detail, medication name/dose veya
  raw private body yok.
- `test_reminder_sync_privacy.js`: token/secret, preference subtree,
  delivery/occurrence/schedule ve private note remote projectiondan çıkıyor;
  mock fetch dışında network yok.
- `test_reminder_panel_projection.js`: local-only reminder roots, schedule,
  occurrence, delivery detail ve private fields panel snapshot/projection’da
  redacted/no-op kalıyor.
- Root QY/sync fixtures ve tüm reminder helper’ları memory-only/mock fetch
  kullanıyor; gerçek `data/latest.json`, `mustafaras/seyma-data`, token veya
  browser localStorage yazımı yok.

## Scope and release boundary

- Değişen üretim dosyası yok. Değişen test/harness dosyaları:
  `tests/reminders/test_reminder_prayer.js`,
  `tests/reminders/test_reminder_saygi.js`.
- Closure docs: this evidence, reminder ledger ve STATE.
- Protected `data/`, `mustafaras/seyma-data`, archive ve workflow yolları
  değiştirilmedi.
- Browser açılmadı; server, real network, native notification ve external
  write çalıştırılmadı. Push, merge, tag, Pages/deploy yapılmadı.
- `releaseApproval.status` `not_approved` olarak korunuyor; user-device
  acceptance yapılmadı.

## Kanıt seviyeleri ve sonuç

- **S0/S1 source:** canonical docs, syntax, harness ve diff scope.
- **S2 synthetic:** full reminder/root/Panel-v2, app VM, migration/helper,
  time ve privacy matrix PASS.
- **S3 local commit:** `2884fbeacdc6aee5cc80f0901b7ce6c9ec23b05e`; yalnız local kanıt,
  remote equality veya release kanıtı değildir.
- **S4 remote / Pages:** N/A.
- **S5 user device:** N/A.

- **Durum:** done
- **Blocker:** none
- **Sonraki prompt:** REM-29 ready
