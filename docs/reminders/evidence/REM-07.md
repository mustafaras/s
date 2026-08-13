# REM-07 — Quiet hours, daily budget ve capacity mode evidence

**Tarih:** 2026-08-13<br>
**Durum:** tamamlandı<br>
**Commit:** `05a067d` — `REM-07: hatırlatma politika katmanı`

## Uygulanan sözleşme

- Policy varsayılanları kullanıcı state’inde modellenir: `22:30–07:30`, native
  günlük cap `3`, düşük öncelikli native cap `1`, kategori cooldown `360 dk`.
- P0/P1/P2/P3, quiet hours, native budget, same-category cooldown ve
  permission fallback kararları saf input/output helper’larıdır.
- Dengeli, Hafif gün, Sessiz ve Ritüel odaklı capacity mode kararları yalnız
  kullanıcının açık tercihiyle uygulanır; otomatik teşhis çıkarımı yoktur.
- Native uygunluğu ve uygulama içi uygunluk ayrı tutulur. Budget, quiet veya
  permission engelinde native occurrence üretilmez; güvenli durumda uygulama
  içi fallback korunur.
- Tamamlanmama sinyalleri policy tarafından cezaya veya alarma çevrilmez.

## Acceptance ve test receipt’leri

| Kapı | Kanıt |
|---|---|
| Pure priority / cap / mode policy | `node tests/reminders/test_reminder_policy.js` — PASS, 8 case / 71 assertion |
| Quiet boundary / exception | `node tests/reminders/test_reminder_quiet_hours.js` — PASS, 5 case / 28 assertion |
| Full reminder regression | `for f in tests/reminders/test_*.js; do node "$f" || exit 1; done` — PASS |
| Headless app | `node .claude/skills/run-seyma/driver.mjs` — PASS |
| Syntax / whitespace | `node --check app.js`; `git diff --check` — PASS |

## Pure boundary ve güvenlik

Policy kaynak bloğu `document`, `localStorage`, `fetch`, `Notification`, canlı
clock ve persistence erişimi kullanmaz. Browser açılmadı; gerçek localStorage,
token, kullanıcı verisi, network, external write, push, merge, Pages ve deploy
yapılmadı. Release approval `not_approved` kaldı.

## Kapanış

Blocker yok. G1 contract kanıtı tamamlandı. Sonraki güvenli adım: **REM-08 —
Occurrence, timezone, midnight ve DST engine**.
