# REM-27 — Accessibility, copy ve theme QA evidence

**Tarih:** 2026-08-16<br>
**Durum:** tamamlandı<br>
**Kapsam:** Reminder Center semantiği, keyboard/focus davranışı, live-region,
touch target, reduced-motion, Türkçe copy, light/dark contrast ve native
privacy negative QA.

## Uygulanan QA düzeltmeleri

- Reminder Center dialog’una açık accessible name/description, focusable
  shell, `Escape` kapanışı, `Tab` focus wrap ve kapanışta tetikleyene geri
  odak eklendi.
- Permission, preview ve status yüzeyleri polite live-region semantiği aldı;
  reminder düğmeleri `type="button"`, kart başlıkları `aria-labelledby`,
  medication alanları açık `aria-label` taşıyor.
- Care seçimleri için en az 44px touch target garanti edildi; özel gün saati
  40px’e yükseltildi. SVG/emoji dekoratif kaldı; eylemler görünür metin veya
  accessible label taşıyor.
- Dark theme’de eski light-theme mor/yeşil metinlerin düşük kontrastı için
  reminder-only text/focus/care/inbox token’ları eklendi. Reduced-motion
  halinde reminder overlay, controls ve transitions kapanıyor.
- `eksik`/shame çağrışımlı reminder copy’si seçenek sunan ve yargısız dile
  çekildi. Therapy, medication, mood, prayer, note, body, secret ve
  occurrence fixture’ları native delivery boundary’sinden çıkmıyor.
- `index.html` app/style cache-bust `20260816a` olarak güncellendi; sync.js
  değiştirilmediği için cache token’ı aynı bırakıldı.

## Sentetik kanıt

| Komut | Sonuç |
|---|---|
| `node --check app.js` | PASS |
| `node tests/reminders/test_reminder_accessibility.js` | PASS — 127 assertion |
| `node tests/reminders/test_reminder_copy.js` | PASS — 71 assertion |
| `node tests/reminders/test_reminder_contrast.js` | PASS — 33 assertion |
| `node .claude/skills/run-seyma/driver.mjs` | PASS — onboarding, seeded render, tab/theme/save interactions |
| `node .claude/skills/run-seyma/zikr-harness.mjs` | PASS — 90/90 assertion |
| `node tests/test_faz10_sync.js` | PASS — 64/64 |
| `node tests/test_panel_p6_qa_release.js` | PASS — 16/16 |
| `node tests/reminders/test_reminder_panel_projection.js` | PASS — 28/28 |
| `node docs/reminders/verify-reminder-context.mjs` | PASS — 73 prompts, approval `not_approved` |
| `git diff --check` | PASS |

Mevcut reminder regression setinde 30 dosyanın 28’i PASS oldu. İki eski,
REM-27 kaynak diff’inde değişmeyen date-pinned fixture suite’i bugünkü
`2026-08-16` gerçek saatinde kalan varsayımla fail etti:

- `test_reminder_prayer.js`: private prayer copy case’i
- `test_reminder_saygi.js`: runtime lifecycle dedupe case’i

Her iki suite’in diğer case’leri PASS’tır; sabit `2026-08-13` fixture günü ile
uygulamanın gerçek `Date.now()` günü arasındaki determinism farkı REM-28 full
regression/time-matrix kapsamında ele alınmalıdır. Bu fark REM-27’nin üç yeni
QA fixture’ını veya app/sync/panel privacy boundary’sini etkilemedi.

## Kanıt seviyeleri ve sınırlar

- **S0/S1 source:** `app.js`, `styles.css`, `index.html` cache-bust ve üç
  reminder QA fixture’ı.
- **S2 synthetic:** 127 accessibility, 71 copy/privacy, 33 contrast; driver,
  zikr 90/90, Faz 10 sync 64/64, Panel P6 16/16 ve panel projection 28/28.
- **S3 local commit:** `87842a1b2d64024f423808530e8173e679223b04`.
- **S4 remote / Pages:** N/A; push/deploy yapılmadı.
- **S5 user device:** N/A; browser açılmadı.

Gerçek GitHub fetch, `mustafaras/seyma-data`, gerçek localStorage, browser,
server ve native notification kullanılmadı. `releaseApproval.status`
`not_approved` kaldı. REM-28 sonraki güvenli prompttur.
