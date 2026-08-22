# APP-REMINDER-UX — App / Panel Surface Map

Bu kısa harita, dondurulmuş reminder işinin gerçek kod sahipliğini korur.
App runtime, current observer panel ve Panel-v2 birbirinden ayrı regression
yüzeyleridir.

## Program kapsamı

| Aralık | Yüzey | Ana sahipler |
|---|---|---|
| REM-44..54 | Şeyma app runtime | `index.html`, `app.js`, `sync.js`, `sw.js`, `app/core/reminder*.js` |
| REM-55..66 | Current ÆON observer panel | `panel.html`, `panel/panel.js`, `panel/panel.css`, `panel/panelCoverageManifest.js` |
| REM-67..72 | App → sync → projection → panel entegrasyonu | App, sync ve current panel sınırları |
| Ayrı | ÆON Panel-v2 Premium | `panel-v2.*`, `tests/panel-v2/` |

## Korunan sözleşmeler

- Tek app state `data` ve mevcut migration/save/sync akışı korunur.
- Panel gözlemcidir; reminder preference, occurrence, snooze, mute veya
  private detail için write authority değildir.
- Projection, coverage, redaction, stale/partial status ve transport kanıtları
  birbirinden ayrı raporlanır.
- Therapy, medication, journal, mood, raw note, token, GPS ve notification
  body gibi hassas içerik panel/native/sync yüzeylerine taşınmaz.
- ÆON sosyal notification akışı ile personal reminder aynı permission, budget,
  dedupe veya notification alanını paylaşmaz.
- Testler headless/mock/sentetik çalışır; browser, gerçek ağ, gerçek
  localStorage ve `mustafaras/seyma-data` yazımı yoktur.

## Doğrulama sahipleri

- App/reminder: `tests/reminders/run-reminder-smoke.mjs` içindeki boot,
  migration, privacy, native boundary, sync ve concurrency fixture'ları.
- Current panel: source, coverage, redaction, polling, privacy, a11y,
  performance ve architecture fixture'ları.
- Entegrasyon: lineage, cross-surface schema/status, integrated privacy ve UX
  fixture'ları.
- Panel-v2: `tests/panel-v2/` kendi 27 fixture'ı ile ayrıca çalıştırılır.

Bu harita eski promptların gap register'ı değildir. Yeni bir özellik için
önce açık kapsam, güncel source/test preflight'i ve privacy/write boundary
kararı gerekir.
