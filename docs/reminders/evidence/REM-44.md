# REM-44 — App boot, script order ve global adapter

## Receipt

- **Program:** APP-REMINDER-UX
- **Prompt:** REM-44
- **Tarih:** 2026-08-17
- **Commit:** closure commit state/ledger’da kaydedilecek
- **Repo:** `/Users/m_ras/Desktop/seyma`
- **Başlangıç HEAD:** `1c8c33c59521c6c7f13f9cf836d6e206b4fa634e`
- **Bitiş HEAD:** closure commit state/ledger’da kaydedilecek
- **Release approval:** `NOT_APPROVED`
- **Approval evidence:** `none`

## Kapsam

- **Allowlist:** `index.html`, `app/core/reminder*.js`, `app.js` adapter boundary, `tests/reminders/test_reminder_boot.js`, `tests/reminders/test_reminder_contract.js`, `docs/reminders/evidence/REM-44.md`, canonical ledger/state closure files.
- **Protected paths changed:** `no`
- **Production change:** Yeni global namespace, event bus veya ayrı state/engine modülü eklenmedi. Mevcut sözleşme kanıtlandı: catalog `window.ReminderCatalogV1`; state ve engine adapter’ları app.js sonrası `window.App` yüzeyinde.

## Kaynak sözleşmesi

| Classic script | Sahip export | Boot zorunluluğu |
|---|---|---|
| `app/core/constants.js?v=20260809a` | `window.SeymaConstants` | `app.js` öncesi; app sabitleri için |
| `app/core/reminderCatalog.js?v=20260813a` | `window.ReminderCatalogV1` | `app.js` öncesi; catalog yoksa app empty state’e düşer |
| `app.js?v=20260817a` | `window.App` | catalog/constants sonrasında; state ve engine adapter giriş noktaları burada |
| `sync.js?v=20260811a` | `window.SeySync` | app.js sonrasında; app boot için opsiyonel |

`panelCoverageManifest.js` app.js’den önce yüklenen ayrı panel/projection modülüdür; REM-44 reminder owner değildir ve değiştirilmemiştir. Catalog listesi app.js’ye bağımlı değildir. `app.js` catalog erişimini `typeof`/optional checks ile yapar; eksik catalog tanım listesinde boş sonuç üretir, state/engine App surface’i yine boot edilebilir kalır.

## Komut sonuçları

| Katman | Komut | Sonuç | Kısa kanıt |
|---|---|---|---|
| Context | `node docs/reminders/verify-reminder-context.mjs` | PASS | 73 prompt, 66 local link, approval `not_approved` |
| Boot / namespace / cache | `node tests/reminders/test_reminder_boot.js` | PASS | 6 case / 38 assertion; clean, seeded, missing-catalog, namespace negative, script order/cache-bust |
| Contract | `node tests/reminders/test_reminder_contract.js` | PASS | 15 case / 74 assertion |
| Syntax | `node --check app.js` | PASS | exit 0 |
| Syntax | `node --check tests/reminders/test_reminder_boot.js` | PASS | exit 0 |
| Headless app | `node .claude/skills/run-seyma/driver.mjs` | PASS | onboarding, seeded, tab, card, dark-theme ve manual-save akışları |
| Migration boundary | `node .claude/skills/run-seyma/verify-state-migration-boundary.mjs` | PASS | 32/32 synthetic assertions |
| Panel regression | `node tests/test_faz11_panel.js` | PASS | 50/50 |
| Reminder regression | `for f in tests/reminders/test_*.js; do node "$f" || exit 1; done` | PASS | tüm mevcut reminder fixture loop’u; outputta FAIL yok |
| Diff | `git diff --check` | PASS | whitespace hatası yok |

## Evidence seviyeleri

- **Source evidence:** S0/S1 — bounded index/app/catalog inspection, classic order ve owner ayrımı.
- **Synthetic test evidence:** S2 — VM fixture gerçek browser, localStorage, sync, token veya network kullanmadan PASS.
- **Commit / remote evidence:** S3 — yalnız local commit; remote eşitliği ve deploy bu promptta yapılmadı.
- **CI / Pages evidence:** N/A — push/deploy yok.
- **User-device evidence:** S5 pending — agent browser açmadı.

## Release hard gate

- Push / merge / tag / Pages / external write: **not performed**
- `mustafaras/seyma-data` write: **not performed**
- Browser / real localStorage / real notification / network: **not used**
- `releaseApproval`: **NOT_APPROVED**

## Sonuç

- **Durum:** done
- **Blocker:** none
- **Sonraki prompt:** REM-45
- **APP gap:** APP-01 kapanır. REM-45 app state schema / ownership / additive migration için güvenli sonraki prompttur.
