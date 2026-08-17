# REM-48 — App Reminder Center navigation, overlay ve deep-link

## Receipt

- **Program:** APP-REMINDER-UX
- **Prompt:** REM-48
- **Tarih:** 2026-08-17
- **Commit:** `0186402`
- **Repo:** `/Users/m_ras/Desktop/seyma`
- **Başlangıç HEAD:** `aba7c486ef825bc7a756e4e273442293d56067fb`
- **Bitiş HEAD:** `0186402` (runtime/test closure commit)
- **Release approval:** `NOT_APPROVED`
- **Approval evidence:** `none`

## Kapsam

- **Allowlist:** `app.js`, `styles.css`, `tests/reminders/test_reminder_app_navigation.js`; `index.html` değişmedi çünkü deploy yapılmadı ve mevcut sabit asset contract korunuyor.
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

## Evidence seviyeleri

- **Source evidence:** S1 — Ayarlar girişinin mevcut `App.go` / `render` kabuğunda
  kaldığı, target map’in allowlist olduğu, overlay shell’in safe-area ve
  erişilebilir close/focus davranışını koruduğu incelendi.
- **Synthetic test evidence:** S2 — fixture’lar memory-only; browser, network,
  Notification ve gerçek kullanıcı verisi kullanılmadı.
- **Commit evidence:** S3 — `0186402` local commit.
- **CI / Pages evidence:** N/A — push/deploy yapılmadı.
- **User-device evidence:** S5 pending — kullanıcı cihazı doğrulaması yapılmadı.

## Release hard gate

- Push / merge / tag / Pages / external write: `not performed`
- `mustafaras/seyma-data` write: `not performed`
- Release state: `NOT_APPROVED`

## Sonraki güvenli adım

- **Durum:** done
- **Blocker:** none
- **Sonraki prompt:** REM-49 — App render lifecycle ve targeted update boundary
