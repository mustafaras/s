# MON-33 · Library domain registry

Tarih: 2026-09-10
Dal: `premium-fx-gorsel-yuzey`
Durum: ✅ yerel kapanış adayı; remote/deploy/device kabulü yok

## Karar ve sınır

`app/core/library.js`, okuma, izleme, dinleme, öğrenme ve soul hublarının
salt-okuma istatistik/görünüm üreticilerini `window.SeymaLibrary` registry'sinde
toplar. Modül yüklemede yan etkisiz ve lazy resolver bag'iyle çalışır. `app.js`
imza-koruyan shimleri, `App.*` entry mutation'larını, `save`/render/DOM/focus
kabuğunu ve arşiv kimliği üreten yolları korur.

Bilerek taşınmayan sahiplik:

- `syncEntryToLibrary`, `syncEntryToWatchlist`, `syncEntryToMusic`,
  `syncEntryToSoulArchive`, `unsyncSoulEntry` ve `backfillArchivesFromDays`
  app.js'te kaldı.
- `data`/`ui`, `migrate()`, `getDay()`, sync.js/Guard, panel, content ve
  6079 aday-kök backfill sınırı değiştirilmedi.
- `archiveId`, `bookId`, `itemId` ve günlük entry kimlikleri mevcut App-owned
  akışlarda aynı alan adlarıyla korunuyor.

## Kaynak ve load-order kanıtı

- `app/core/library.js`: 666 satır, 64 registry member.
- `index.html`: `health.js` sonrasında `library.js?v=20260910a`, `app.js?v=20260910b`
  öncesinde.
- Dört production FILES zinciri (`index.html`, `driver.mjs`, `zikr-harness.mjs`,
  `test_state_rebind_boundary.js`) ve app-boot fixture'ları aynı konuma alındı.
- Birleşik taşınmış kaynakta `App` surface 718, inline `onclick` 391 olarak
  korunuyor.

## Doğrulama

Başarılı kapılar:

- `node --check app.js`, `node --check sync.js`,
  `node --check app/core/library.js`
- `node .claude/skills/run-seyma/driver.mjs --dump bugun` — PASS; dump
  `/tmp/seyma-dump.html`, 111961 byte.
- `node tests/app/test_library_boundary.js` — 45 PASS: beş hub, archive/entry
  kimliği, modal dialog/focus, read-only state değişmezliği ve App-owned
  mutation sınırı.
- `node tests/app/test_modal_focus_containment.js` — 41 PASS.
- `node tests/app/test_daily_photo_history.js` — 12/12 PASS.
- `node tests/app/test_modularization_boundary.js` — 84/84 PASS.
- `node .claude/skills/run-seyma/zikr-harness.mjs` — 95/95 PASS.
- Tam `tests/app`, `tests/panel`, `tests/panel-v2`, `tests/quran` ve
  `tests/reminders` regression aileleri exit 0; reminder smoke 20 curated
  fixture PASS.
- `git diff --check` — temiz.

İnceleme kanıtı sentetik Node/VM'dir. Gerçek browser/device acceptance,
remote read/write, push, merge, tag ve deploy yapılmadı.
