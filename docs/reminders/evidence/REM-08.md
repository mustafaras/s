# REM-08 — Occurrence, timezone, midnight ve DST engine evidence

**Tarih:** 2026-08-13<br>
**Durum:** tamamlandı<br>
**Commit:** `10870c0` — `REM-08: deterministik reminder occurrence engine`

## Uygulanan sözleşme

- Fixed-time, day-part ve prayer-offset trigger’ları deterministic occurrence
  üretir.
- `occurrenceId`, `reminderId + localDate + scheduledAt + timezone +
  definitionVersion` bileşenlerinden oluşturulur.
- Europe/Istanbul midnight, exact second threshold, America/New_York spring /
  fall DST ve Hicri offset senaryoları sentetik input ile doğrulandı.
- Prayer source date, fetchedAt, location hash veya method metadata’sı stale /
  eksik / uyuşmaz ise kesin saat üretilmez.
- Geçmiş occurrence catch-up için işaretlenebilir; `replay`, `nativeReplay` ve
  `shouldReplay` her zaman false’tur. Native replay kuyruğu oluşturulmaz.
- Engine input’u mutate etmez; state, DOM, network, localStorage ve canlı saat
  okumaz.

## Acceptance ve test receipt’leri

| Kapı | Kanıt |
|---|---|
| Occurrence / trigger / stale / replay | `node tests/reminders/test_reminder_scheduler.js` — PASS, 8 case / 54 assertion |
| Timezone / midnight / DST / Hicri | `node tests/reminders/test_reminder_timezones.js` — PASS, 5 case / 23 assertion |
| Full reminder regression | `for f in tests/reminders/test_*.js; do node "$f" || exit 1; done` — PASS |
| Existing app regression | Root `tests/test_*.js` loop ve Panel-v2 loop — PASS |
| Migration / headless | B2 migration 32/32 PASS; `node .claude/skills/run-seyma/driver.mjs` PASS |
| Syntax / whitespace | `node --check app.js`; `git diff --check` — PASS |

## Sınırlar

- Browser açılmadı, server başlatılmadı, gerçek localStorage, token, kullanıcı
  verisi, network, external write, push, merge, Pages veya deploy yapılmadı.
- Release approval `not_approved` olarak kaldı.

## Kapanış

Blocker yok. Sonraki güvenli adım: **REM-09 — Suppression, dedupe ve device
delivery journal**.
