# REM-14 — Namaz / İman Köşesi integration evidence

**Tarih:** 2026-08-15<br>
**Durum:** tamamlandı<br>
**Commit:** `494baab33a94db07ee31c025936799047e238692`

## Uygulanan sözleşme

- Mevcut İman Köşesi ve prayer timing yüzeyi kopyalanmadan, seçili vakit veya
  altı vakit için signed offset tabanlı occurrence adapterı eklendi.
- Occurrence yalnız redacted timing snapshot’tan türetilir; `performed`,
  `missed`, `note`, cemaat/kaza veya diğer günlük prayer alanlarını taşımaz.
- Stale, eksik, offline fallback, yöntem ve konum fingerprint uyuşmazlığında
  occurrence `null` ile fail-closed kalır; legacy prayer snapshot yöntemi
  doğrulanana kadar lifecycle’a kesin aday vermez.
- `faith` deep-link’i korunur; vakit sonrası kullanıcı kaydı zorunlu tutulmaz.
  Zikir / tefekkür çakışması mevcut grouping/policy katmanına bırakılır.
- Prayer cache ve günlük snapshot method metadata ile işaretlenir; yöntem veya
  konum değiştiğinde eski cache kesin vakit olarak yeniden kullanılmaz.

## Acceptance ve test receipt’leri

| Kapı | Kanıt |
|---|---|
| Prayer adapter | `node tests/reminders/test_reminder_prayer.js` — PASS, 6 case / 48 assertion |
| Timezone / offset / Hicri | `node tests/reminders/test_reminder_timezones.js` — PASS, 6 case / 28 assertion |
| Zikir / İman Köşesi headless | `node .claude/skills/run-seyma/zikr-harness.mjs` — PASS, 90/90 |
| Existing prayer engine | `node tests/reminders/test_reminder_scheduler.js` — PASS, 54 assertion |
| Reminder regression | All `tests/reminders/test_reminder_*.js` fixtures PASS |
| App / migration / panel regression | `driver.mjs`, B1/B2/B3, root fixtures and 27 Panel-v2 fixtures PASS |
| Syntax / diff / context | `node --check app.js`; `node --check sync.js`; `git diff --check`; `verify-reminder-context.mjs` — PASS |

## Sınırlar

Browser açılmadı, server başlatılmadı, gerçek localStorage/token/kullanıcı
verisi/network, external write, push, merge, Pages veya deploy yapılmadı.
Release approval `not_approved` olarak kaldı; kullanıcı cihazı kabulü
yapılmadı.

## Kapanış

Blocker yok. Canonical state `lastCompletedPrompt=REM-14`,
`activePrompt=REM-15`, `nextSafeAction=REM-15 local implementation/verification`
olarak güncellendi. REM-15 yalnız local implementation/verification için
ready’dir; release-ready değildir.
