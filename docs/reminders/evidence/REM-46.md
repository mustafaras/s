# REM-46 — App clock, timezone ve engine adapter

## Receipt

- **Program:** APP-REMINDER-UX
- **Prompt:** REM-46
- **Tarih:** 2026-08-17
- **Commit:** `a61f1f03d293a50b72db3c1f7e8242c7fdbfe384`
- **Repo:** `/Users/m_ras/Desktop/seyma`
- **Başlangıç HEAD:** `00d1aaa0471d83da2c1fd0948ae5036431bc4f60`
- **Bitiş source/test HEAD:** `a61f1f03d293a50b72db3c1f7e8242c7fdbfe384`
- **Release approval after receipt:** `NOT_APPROVED` (single-use approval consumed after successful deployment)
- **Approval evidence:** recorded in the release receipt below; state was reset after the receipt

## Kapsam

- Allowlist:
  - `app/core/reminderEngine.js`
  - `app.js` clock / engine adapter boundary
  - `tests/reminders/test_reminder_app_engine.js`
  - `tests/reminders/test_reminder_timezones.js`
  - `tests/reminders/test_reminder_scheduler.js`
  - `docs/reminders/evidence/REM-46.md`
- Protected paths changed: **no**

## Release receipt — 2026-08-17

- **Exact user approval:** `"onaylıyorum"` in response to the explicit scope of
  `main` push and the GitHub Pages deployment it triggers.
- **Approved scope:** `git push origin main` fast-forward only; the resulting
  GitHub Pages workflow/deployment; read-only remote, Pages and live evidence.
- **Out of scope:** `mustafaras/seyma-data`, other remotes, tag, force-push,
  history rewrite, merge and user-device acceptance.
- **Release candidate:** `f0c16cb6a81657455b123afb61d784b90c2656f2`
  (`Release approval: main Pages deploy scope`).
- **Push:** `git push origin main`; `42d9f08..f0c16cb main -> main` — **PASS**.
- **Remote equality:** local `HEAD`, `origin/main` and
  `git ls-remote origin refs/heads/main` all resolved to
  `f0c16cb6a81657455b123afb61d784b90c2656f2` — **PASS**.
- **Workflow:** [Deploy static content to Pages run 32036680380](https://github.com/mustafaras/s/actions/runs/32036680380) — **success**;
  validate and deploy jobs both passed.
- **Deployment:** GitHub deployment `5946090608`, environment `github-pages`,
  status `success`; deployment status `16917414126` — **PASS**.
- **Live URL:** [https://mustafaras.github.io/s/](https://mustafaras.github.io/s/) —
  HTTP 200.
- **Live asset/cache-bust:** `index.html` HTTP 200 with
  `styles.css?v=20260817b` and `app.js?v=20260817a`; `app.js` and `styles.css`
  HTTP 200. Pages response `last-modified: Mon, 17 Aug 2026 13:49:04 GMT`.
- **Data safety:** no browser was opened, no server was started, and no write
  was made to `mustafaras/seyma-data`.

## Uygulanan sınır

- Pure `ReminderEngineV1` yalnız injected instant, local date, wall-clock time ve timezone girdilerini tüketir; DOM, localStorage, network, Notification ve live clock bağımlılığı yoktur.
- App adapter mevcut Şeyma clock boundary’sinden canonical `nowIso` ve `Europe/Istanbul` timezone üretir; selected historical `activeDate` ayrı metadata olarak kalır ve occurrence local date’ini değiştirmez.
- Occurrence ID yalnız `reminderId + localDate + scheduledAt + timezone + definitionVersion` bileşenlerinden türetilir; Hicri offset metadata olarak kalır.
- Europe/Istanbul midnight, DST, invalid timezone/date ve prayer-offset midnight-crossing durumları deterministic fixture’lerle kanıtlandı.
- Hicri özel-gün adapter’ı mevcut `HijriCalendarV1` helper’ını ve ±2 offset sınırını korur; offset occurrence identity’ye eklenmez.
- Prayer snapshot local date / fetchedAt / location / method / freshness sınırlarından geçmezse candidate `stale-prayer-data`, `unavailable` veya `suppressed` olarak fail-closed kalır; native replay üretilmez.
- Boot, foreground ve historical navigation aynı occurrence ID’sini üretir; delivery journal / pure evaluator ikinci gösterimi duplicate olarak tutar.

## Komut sonuçları

| Katman | Komut | Sonuç | Kısa kanıt |
|---|---|---|---|
| App / pure parity | `node tests/reminders/test_reminder_app_engine.js` | PASS | 26 assertion; injected clock, adapter parity, activeDate ayrımı, midnight/DST, Hicri identity, stale prayer ve dedupe |
| Scheduler | `node tests/reminders/test_reminder_scheduler.js` | PASS | 54 assertion; fixed/day-part/prayer occurrence, threshold, stale fail-closed ve no replay |
| Time matrix | `node tests/reminders/test_reminder_timezones.js` | PASS | 28 assertion; Istanbul midnight, DST spring/fall, invalid date/timezone, prayer midnight ve Hicri offset |
| Hicri adapter regression | `node tests/reminders/test_reminder_special_days.js` | PASS | 35 assertion; `HijriCalendarV1` offset -2/0/+2 ve selected/all/none sınırı |
| Lifecycle regression | `node tests/reminders/test_reminder_lifecycle.js` | PASS | 36 assertion; boot/focus/pageshow/visibility/online/timer idempotency ve duplicate journal |
| Headless app | `node .claude/skills/run-seyma/driver.mjs` | PASS | onboarding, seeded boot, location gate, interaction ve iki tema |
| Reminder regression | `for f in tests/reminders/test_*.js; do node "$f" >/dev/null || exit 1; done` | PASS | tüm reminder fixture loop’u exit 0 |
| Root regression | `for f in tests/test_*.js; do node "$f" >/dev/null || exit 1; done` | PASS | exit 0; yalnız synthetic network guard uyarıları |
| Panel-v2 regression | `for f in tests/panel-v2/test_panel_v2_*.js; do node "$f" >/dev/null || exit 1; done` | PASS | exit 0 |
| Syntax | `node --check app.js`; `node --check app/core/reminderEngine.js`; test syntax | PASS | exit 0 |
| Context | `node docs/reminders/verify-reminder-context.mjs` | PASS | 73 prompt, 66 local link, `approval=not_approved` |
| Diff | `git diff --check` | PASS | whitespace hatası yok |

## Evidence seviyeleri

- **Source evidence:** S1 — pure engine module, app clock boundary, active-date separation and prayer freshness gate.
- **Synthetic test evidence:** S2 — Node VM / memory-only fixtures; browser, gerçek localStorage, token, ağ, native notification ve gerçek kullanıcı verisi yok.
- **Commit evidence:** S3 — local commit `a61f1f03d293a50b72db3c1f7e8242c7fdbfe384`.
- **CI / Pages evidence:** S4 — workflow `32036680380` and deployment
  `5946090608` succeeded; live URL and cache-bust headers were read-only
  verified.
- **User-device evidence:** S5 pending — kullanıcı cihazında doğrulama yapılmadı.

## Release hard gate

- Push / Pages deployment: **performed within the approved `main` scope**;
  merge/tag/force-push/other remote/external data write: **not performed**
- `mustafaras/seyma-data` write: **not performed**
- Browser / generic server / real localStorage / real notification: **not used**
- `releaseApproval`: **NOT_APPROVED** after successful deployment; the exact
  approval was consumed and reset in STATE.

## Sonuç

- **Durum:** done
- **Blocker:** none
- **Sonraki prompt:** REM-47
- **Not:** APP-02 engine bağlantısı kapandı; save / event-log, deploy ve device acceptance bu receipt’in iddiası değildir.
