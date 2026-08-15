# REM-13 — Snooze, today mute, disable ve deep-link evidence

**Tarih:** 2026-08-15<br>
**Durum:** tamamlandı<br>
**Commit:** `fdc6617` — `REM-13: reminder actionlari ve deep link`

## Uygulanan sözleşme

- Catalog semantiğine göre 10 dakika, 30 dakika, 1 saat, bu akşam, yarın,
  bugün gösterme ve kalıcı kapatma seçenekleri modellenir.
- Snooze deterministic ve idempotent follow-up occurrence üretir; bugün mute,
  disable ve enable işlemleri ayrı, izlenebilir ve geri alınabilirdir.
- faith, zikr, room, saygi, reading, gunluk ve settings hedefleri tek target
  contract üzerinden card/native click ile eşleşir.
- Bir kategori kapatıldığında diğer kategori ve Notification permission state’i
  değişmez; action state `data.notifications`, sync ve panel journal’ından
  ayrıdır.

## Acceptance ve test receipt’leri

| Kapı | Kanıt |
|---|---|
| Snooze / today mute / disable / reversible state | `node tests/reminders/test_reminder_actions.js` — PASS, 4 case / 39 assertion |
| Deep-link target contract | `node tests/reminders/test_reminder_deeplinks.js` — PASS, 3 case / 63 assertion |
| Delivery / lifecycle / privacy regression | Delivery 38, lifecycle 36, privacy 30 assertion — PASS |
| Headless app render / interaction | `node .claude/skills/run-seyma/driver.mjs` — PASS |
| Full regression | Reminder, root `tests/test_*.js`, Panel-v2, B1/B2/B3 loops — PASS |
| Syntax / context / whitespace | `node --check app.js`; `node --check sync.js`; `node docs/reminders/verify-reminder-context.mjs`; `git diff --check` — PASS |

## Sınırlar

Browser açılmadı, server başlatılmadı, gerçek localStorage, token, kullanıcı
verisi, network, external write, push, merge, Pages veya deploy yapılmadı.
Release approval `not_approved` olarak kaldı.

## Kapanış

Blocker yok. Canonical state `lastCompletedPrompt=REM-13`,
`activePrompt=REM-14`, `nextSafeAction=REM-14 local implementation/verification`
olarak uzlaştırıldı. REM-14 release-ready değildir; yalnız sıradaki local
implementation promptudur.
