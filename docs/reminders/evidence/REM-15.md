# REM-15 — Zikir / tefekkür integration evidence

**Tarih:** 2026-08-15<br>
**Durum:** tamamlandı<br>
**Commit:** `7c095377111d87db14568c6fc3e34cc49bf05227`

## Uygulanan sözleşme

- Zikir occurrence üretimi yalnız `enabled: true` preference üzerinden
  çalışır. Günlük davet `dailyEnabled` ile kapatılabilir; preference yokken
  hiçbir native veya in-app zikir adayı üretilmez.
- Journey dönüşü ayrıca `journeyEnabled: true` seçimini ister. Frekans yalnız
  `weekly` veya açıkça seçilen `selected-window` olabilir; son oturumdan en az
  yedi gün geçmeden ve seçilen gün/pencere dışında yeni aday üretilmez.
  Historical catch-up bu adapterda devre dışıdır; aynı dönüş deterministik
  occurrence ID ile tekrar oynatılmaz.
- Session sonrası tefekkür `reflectionAfterSession: true` ile optional’dır.
  Reflection yalnız in-app kanala zorlanır; native body, delivery journal ve
  occurrence içine private reflection metni alınmaz.
- Zikir feature flag’i hidden olduğunda tüm zikir adayları fail-closed kalır;
  visible olduğunda yalnız geçerli preference ve seçili akışlar geri gelir.
  Metin ve policy katmanında seri kaybı, ceza veya dini doğruluk baskısı
  üreten bir copy eklenmemiştir.
- `zikr` deep-link’i korunur; daily, journey ve reflection adaylarının
  grouping/capacity kararı mevcut reminder policy engine’e bırakılır.

## Acceptance ve test receipt’leri

| Kapı | Kanıt |
|---|---|
| Zikir adapter | `node tests/reminders/test_reminder_zikr.js` — PASS, 5 case / 32 assertion |
| Privacy boundary | `node tests/reminders/test_reminder_privacy.js` — PASS, 3 case / 30 assertion |
| Hidden / visible flag ve overlay | `node .claude/skills/run-seyma/zikr-harness.mjs` — PASS, 90/90 |
| Journey / timezone regression | `node tests/reminders/test_reminder_timezones.js` — PASS, 6 case / 28 assertion |
| Reminder regression | All 20 `tests/reminders/test_*.js` fixtures PASS |
| App / root / panel regression | `driver.mjs`, root fixtures, 27 Panel-v2 fixtures and B1/B2/B3 PASS |
| Syntax / closure context | `node --check app.js`; `node --check sync.js`; `git diff --check`; `verify-reminder-context.mjs` — PASS |

## Sınırlar

Browser açılmadı, server başlatılmadı, gerçek localStorage/token/kullanıcı
verisi/network, external write, push, merge, Pages veya deploy yapılmadı.
Release approval `not_approved` olarak kaldı; kullanıcı cihazı ve gerçek
background notification kabulü yapılmadı.

## Kapanış

Blocker yok. Canonical state `lastCompletedPrompt=REM-15`,
`activePrompt=REM-16`, `nextSafeAction=REM-16 local implementation/verification;
no release action` olarak güncellendi. REM-16 yalnız local implementation ve
verification için ready’dir; release-ready değildir.
