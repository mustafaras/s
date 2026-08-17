# REM-48 — App Reminder Center navigation, overlay ve deep-link

## Receipt

- **Program:** APP-REMINDER-UX
- **Prompt:** REM-48
- **Tarih:** 2026-08-17
- **Commit:** `0186402`
- **Repo:** `/Users/m_ras/Desktop/seyma`
- **Başlangıç HEAD:** `aba7c486ef825bc7a756e4e273442293d56067fb`
- **Bitiş HEAD:** `0186402` (runtime/test closure commit)
- **Release approval after receipt:** `NOT_APPROVED` (single-use approval consumed)
- **Approval evidence:** exact current user message recorded in STATE; receipt below

## Kapsam

- **Allowlist:** `app.js`, `styles.css`, `tests/reminders/test_reminder_app_navigation.js`; `index.html` asset contract sürümleri korunarak değişmedi.
- **Protected paths changed:** `no`

## Sonuç

Reminder Center, mevcut `Ayarlar > Hatırlatmalar ve bildirimler` bilgi mimarisinde
tek gerçek giriş olarak kaldı; paralel router eklenmedi. Katalog hedefleri tek
`reminderDeepLinkTarget` sözleşmesinden geçiyor ve gerçek `App` handler’larına
(`openFaithCorner`, `openZikr`, `openRoom`, `go`, `openReading`,
`openJournalModal`) bağlanıyor. Tanımsız veya eşleşmeyen hedefler fail-closed
`unavailable` sonucuna düşüyor ve merkez içinde görünür, sakin bir durum mesajı
gösteriyor.

Reminder Center ve reminder’dan açılan overlay’ler sayfa scroll’unu kilitliyor;
Escape / kapatma akışı body stilini geri yüklüyor ve odağı kaynak elemana
döndürüyor. Merkez içi yeniden render’larda scroll konumu, medication draft ve
aktif alan korunuyor. Reading / journal deep-link’leri mevcut taslak akışını
silmeden açılıyor. Native notification click ile uygulama içi inbox click aynı
canonical target çözümünü kullanıyor.

## Komut sonuçları

| Katman | Komut | Sonuç | Kısa kanıt |
|---|---|---|---|
| Required navigation | `node tests/reminders/test_reminder_app_navigation.js` | PASS | 6 case / 40 assertion; settings IA, overlay lock, Escape, focus, scroll, draft, unavailable ve native/in-app parity |
| Required deep-link | `node tests/reminders/test_reminder_deeplinks.js` | PASS | 6 case / 85 assertion; yedi katalog hedefi, allowlist, native/SW ve app card parity |
| Headless UI | `node .claude/skills/run-seyma/driver.mjs` | PASS | onboarding, seeded, location gate, tab, theme ve save surface |
| Reminder regression | `for f in tests/reminders/test_reminder_*.js; do node "$f"; done` | PASS | tam reminder fixture döngüsü |
| Root / Panel regression | `for f in tests/test_*.js; do node "$f"; done`; `for f in tests/panel-v2/test_panel_v2_*.js; do node "$f"; done` | PASS | root ve Panel-v2 fixture döngüleri |
| State boundaries | B1 / B2 / B3 migration-adapter fixtures | PASS | 0, 32 ve 20 assertion |
| Syntax | `node --check app.js && node --check sync.js` | PASS | syntax temiz |
| Context / diff | `node docs/reminders/verify-reminder-context.mjs`; `git diff --check` | PASS | 73 prompt, 66 link; whitespace hatası yok |

## Release receipt — 2026-08-17

- **Exact user approval:** `"push commit merge canlıya al"` in the current
  conversation.
- **Approved scope:** current `main` commit chain, `git push origin main`
  fast-forward, resulting GitHub Pages workflow/deployment, remote equality and
  read-only live HTTP/cache-bust verification.
- **Out of scope:** `mustafaras/seyma-data`, other remotes, tag, force-push,
  history rewrite and user-device acceptance. There was no separate PR merge;
  current `main` was already the release chain and was fast-forward pushed.
- **Release candidate:** `0f09d4a253202b48c68e0f52efc4d51d7ed9fc7a`.
- **Push:** `git push origin main`; `b9c1f22..0f09d4a main -> main` — **PASS**.
- **Remote equality:** local `HEAD`, `origin/main` and
  `git ls-remote origin refs/heads/main` all resolved to
  `0f09d4a253202b48c68e0f52efc4d51d7ed9fc7a` — **PASS**.
- **Workflow:** [Deploy static content to Pages run 32040122205](https://github.com/mustafaras/s/actions/runs/32040122205) — **success**; validate and deploy jobs passed.
- **Deployment:** GitHub deployment `5946481422`, environment `github-pages`,
  status `16918582760` — **success**.
- **Live URL:** [https://mustafaras.github.io/s/](https://mustafaras.github.io/s/) —
  HTTP 200.
- **Live assets:** live `index.html`, `app.js` and `styles.css` returned HTTP
  200 with `last-modified: 2026-08-17 14:46:18 GMT`; live source contained
  `sey-reminder-body-locked`, `reminderTargetReturnFocusId`,
  `showReminderUnavailable` and `sey-reminder-unavailable`.
- **Data safety:** no browser was opened, no generic local server was started,
  and no write was made to `mustafaras/seyma-data`.

## Evidence seviyeleri

- **Source evidence:** S1 — Ayarlar girişinin mevcut `App.go` / `render` kabuğunda
  kaldığı, target map’in allowlist olduğu, overlay shell’in safe-area ve
  erişilebilir close/focus davranışını koruduğu incelendi.
- **Synthetic test evidence:** S2 — fixture’lar memory-only; browser, network,
  Notification ve gerçek kullanıcı verisi kullanılmadı.
- **Commit evidence:** S3 — `0186402` local commit.
- **CI / Pages evidence:** S4 — workflow `32040122205`, deployment
  `5946481422`, deployment status `16918582760` and live HTTP/cache-bust
  evidence succeeded.
- **User-device evidence:** S5 pending — kullanıcı cihazı doğrulaması yapılmadı.

## Release hard gate

- Push / Pages deployment: `performed within approved current main scope`
- Separate PR merge / tag / force-push / other remote / external write: `not performed`
- `mustafaras/seyma-data` write: `not performed`
- Release state after receipt: `NOT_APPROVED` (approval consumed and reset)

## Sonraki güvenli adım

- **Durum:** done
- **Blocker:** none
- **Sonraki prompt:** REM-49 — App render lifecycle ve targeted update boundary
