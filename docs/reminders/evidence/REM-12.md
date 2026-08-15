# REM-12 — In-app reminder inbox ve premium card evidence

**Tarih:** 2026-08-15<br>
**Durum:** tamamlandı<br>
**Commit:** `e5a1a6e` — `REM-12: uygulama ici reminder inbox karti`

## Uygulanan sözleşme

- Native izin olmadan empty, single, grouped ve suppressed inbox durumları
  sakin ve erişilebilir card yüzeyinde render edilir.
- Card category, kısa private title, detail, main action ve overflow actions
  taşır; P1 user-created > P2 ritual > P3 discovery sırası korunur.
- Bugün mute ve kalan öneri sayısı görünürdür; user text mevcut escape helper
  ile güvenli biçimde render edilir.
- Native, network, gerçek localStorage, data repo ve hassas payload sınırları
  inbox surface içinde açılmaz.

## Acceptance ve test receipt’leri

| Kapı | Kanıt |
|---|---|
| Inbox empty/single/grouped/suppressed, mute, escape | `node tests/reminders/test_reminder_inbox.js` — PASS, 6 case / 40 assertion |
| Headless app render / interaction | `node .claude/skills/run-seyma/driver.mjs` — PASS |
| Reminder regression | `for f in tests/reminders/test_reminder_*.js; do node "$f"; done` — PASS |
| Root / Panel-v2 regression | Root `tests/test_*.js` ve Panel-v2 loop — PASS |
| Boundary / syntax / context | B1/B2/B3 PASS; `node --check app.js`; `node --check sync.js`; `node docs/reminders/verify-reminder-context.mjs` — PASS |
| Diff scope | `git diff --check` — PASS |

## Sınırlar

Browser açılmadı, server başlatılmadı, gerçek localStorage, token, kullanıcı
verisi, network, external write, push, merge, Pages veya deploy yapılmadı.
Release approval `not_approved` olarak kaldı.

## Kapanış

Blocker yok. Sonraki güvenli adım REM-13 action/deep-link closure idi; o da
`fdc6617` ile tamamlandı. Sonraki kod promptu: **REM-14**.
