# REM-31 — Sabah, gün içi, akşam ve düşük kapasite akışları evidence

**Tarih:** 2026-08-16<br>
**Durum:** `done` — local source, synthetic contract ve headless verification<br>
**Kapsam:** G9-B için sabah açılışı, gün içi tek odak, akşam kapanışı ve
kullanıcı seçtiği hafif gün modunun ortak policy ile coalesce edilmesi.

## 1. Source ve canonical context evidence

- **Repository:** `/Users/m_ras/Desktop/seyma`
- **Başlangıç branch/status:** `main...origin/main [ahead 68]`; başlangıç
  çalışma ağacı temizdi.
- **Başlangıç HEAD:** `ace261b0128bafe69bfbebb11afcd9f4dc4a602a`.
- **Bitiş source commit:** `b4dfb579408c0ebe2eec1db9f3fe6d06d24998c8`
  (`REM-31: günlük akışları coalesce et`).
- Canonical kaynaklar: `AGENTS.md`, `GELISTIRME-PLANI.md`, reminder README,
  `APP-REMINDER-CONTEXT.md`, güncel `APP-REMINDER-STATE.json`, anti-amnesia
  ledger, REM-07 / REM-11 / REM-18 ve UX planı §4.3, §6.4, §9.1–9.3, §10.
- Ön koşul: `node docs/reminders/verify-reminder-context.mjs` →
  `REMINDER CONTEXT PASS: 73 prompts, 67 local links, approval=not_approved`.
- Çalışma allowlist’i source/test için `app.js`, `styles.css` ve
  `tests/reminders/test_reminder_daily_flows.js` idi. Canonical kapanışın
  zorunlu evidence/ledger/state dosyaları ayrıca güncellendi.
- `data/`, `sync.js`, gerçek sync, panel, archive, secrets ve external
  system değişmedi.

## 2. REM-31 implementation evidence

- `dailyFlowBudget` additive policy alanı olarak normalize edildi; default
  ortak bütçe `3`, context ile deterministic override edilebilir ve bounded
  `0..24` aralığında kalır.
- Sabah / gün içi / akşam seçimi local time ile; `light` ve `silent` kapasite
  aynı günlük akış policy’si ile modellenir. Hafif gün en fazla tek adım
  bırakır; silent gün current-date adaylarını üretmez.
- Namaz, zikir, okuma, günlük ve bakım adayları allowlisted deep-link,
  kategori ve öncelik üzerinden tek bir bounded flow group içinde birleşir.
  Private note, mood, journal body ve rutin ayrıntıları flow/native sınırına
  taşınmaz.
- Deterministic flow occurrence ID aynı local date, pencere, saat ve timezone
  için tekrarlı app-open/focus/visibility/pageshow değerlendirmelerinde sabit
  kalır. Existing delivery journal duplicate koruması ikinci row üretmez.
- Akşam flow’unda tek primary davet ve uygulama içi alternatifler kalır.
  Native replay/catch-up yoktur; geçmiş adaylar catch-up katmanına bırakılır.
- Hafif gün yalnız explicit P1 adayını tutar; title/body ortak isteğe bağlı
  kopyaya çekilir. Zorunluluk, suçluluk, başarısızlık veya skor dili
  üretilmez.
- `Bu durağı aç` allowlisted deep-link’e gider. `Şimdi değil`, mevcut local
  `todayOff` no-op/idempotent çıkışına bağlanır; iki kez çağrıda ikinci
  değişiklik oluşmaz.

## 3. Test / acceptance evidence

| Katman | Komut | Sonuç | Kısa kanıt |
|---|---|---|---|
| Syntax | `node --check app.js` | PASS | exit 0 |
| REM-31 contract | `node tests/reminders/test_reminder_daily_flows.js` | PASS | 40 assertions |
| Shared budget regression | `node tests/reminders/test_reminder_budget.js` | PASS | 18 assertions |
| Full reminder regression | `for f in tests/reminders/test_reminder_*.js; do node "$f" || exit 1; done` | PASS | tüm reminder fixture döngüsü exit 0; REM-30 dahil |
| Headless app | `node .claude/skills/run-seyma/driver.mjs` | PASS | onboarding, seeded render, tab/theme/save interactions |
| Diff | `git diff --check` | PASS | whitespace error yok |

REM-31 fixture’ı ayrıca şu kabul durumlarını doğrudan kanıtlar:

- üç günlük dönem: sabah, gün içi ve akşam aynı ortak budget üst sınırını
  aşmaz;
- akşam: tek primary davet, alternatifler in-app group içinde;
- düşük kapasite: explicit P1 dışı adaylar elenir; tek adayda bile kopya
  optional ve guilt-free kalır;
- app-open, focus, visibility ve pageshow: aynı occurrence ID ve delivery
  journal’da tek kayıt;
- deep-link ve `Şimdi değil`: allowlist, no-op ve idempotence PASS;
- synthetic fixture gerçek localStorage, browser, server, network, native
  notification veya gerçek kullanıcı verisi kullanmaz.

## 4. Evidence levels ve release hard gate

- **S0/S1:** source diff, canonical context, policy ve flow contract.
- **S2:** headless/synthetic reminder suite, budget, driver, syntax ve diff.
- **S3:** local commit `b4dfb579408c0ebe2eec1db9f3fe6d06d24998c8`.
- **S4:** N/A — push, CI, Pages ve deploy yapılmadı.
- **S5:** pending — kullanıcı cihazı kabulü ajan tarafından yapılmadı.

- Push / merge / tag / Pages / external write: yapılmadı.
- `mustafaras/seyma-data` write: yapılmadı.
- `releaseApproval.status`: `not_approved`; scope boş kaldı.
- Bu evidence source/test kanıtıdır; production, deploy veya cihaz davranışı
  iddiası değildir.

## Sonuç

- **Durum:** `done`
- **Blocker:** none for G9-B local closure; S5 user-device acceptance ve
  release approval program hard gate olarak pending.
- **Sonraki prompt:** `REM-32`
