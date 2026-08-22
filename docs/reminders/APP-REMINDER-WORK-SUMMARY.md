# Reminder / Notification UX — Dondurulmuş İş Özeti

Bu dosya, `APP-REMINDER-UX` programının çalışma ağacında kalan tek insan-okunabilir
iş özetidir. REM-00..REM-72 promptbook, ayrı evidence makbuzları, geniş karar
günlüğü ve eski acceptance matrisi tarihsel çalışma kaydı olarak Git geçmişinde
bırakılmıştır; yeni ajan bunları okumadan mevcut kaynak ve test yüzeyinden
başlar.

## Son durum

- Prompt zinciri: `REM-00..REM-72` tamamlandı; yeni aktif prompt yok.
- State: [`APP-REMINDER-STATE.json`](APP-REMINDER-STATE.json),
  `activePrompt: null`, `lastCompletedPrompt: REM-72`.
- Release approval: `not_approved`; bu temizlik push, deploy, tag, force-push
  veya gerçek veri deposuna yazma yetkisi vermez.
- Kullanıcı cihazı kabulü: ajan tarafından yapılmadı; ayrı kanıt seviyesidir.

## Kapanan yüzeyler

- `REM-44..54`: Şeyma app runtime — boot, migration, deterministic clock,
  occurrence/lifecycle, Reminder Center, deep-link, native/ÆON ayrımı, privacy
  ve headless acceptance.
- `REM-55..66`: current ÆON observer panel — projection/provenance, coverage,
  redaction, ETag/304 polling, partial/stale states, status, timeline, write
  boundary, privacy, responsive/a11y/performance ve fixture sınırı.
- `REM-67..72`: app → sync → projection → panel lineage, cross-surface status,
  schema compatibility, integrated privacy/no-write ve integrated UX.
- Panel-v2 (`tests/panel-v2/`) bu programdan bağımsızdır ve ayrı regression
  yüzeyi olarak korunur.

## Güncel canonical yüzey

- Ürün kaynağı: `app.js`, `sync.js`, `sw.js`, `app/core/reminder*.js`,
  `panel.js`, `panel.css`, `panel.html`, `panelCoverageManifest.js`.
- Güvenlik ve release sınırı: [`APP-REMINDER-APPROVAL-GATE.md`](APP-REMINDER-APPROVAL-GATE.md).
- App/current-panel/Panel-v2 sahipliği: [`APP-REMINDER-APP-PANEL-SURFACE-MAP.md`](APP-REMINDER-APP-PANEL-SURFACE-MAP.md).
- Dondurma doğrulaması: [`verify-reminder-freeze.mjs`](verify-reminder-freeze.mjs).
- Bakım regression komutu: `node tests/reminders/run-reminder-smoke.mjs`.

## Korunan bakım regression seti

Bu testler production runtime’a yüklenmez; sentetik `node:vm`/mock sınırında
çalışır. Gerçek browser, ağ, token, localStorage veya `mustafaras/seyma-data`
yazımı yoktur.

- App: `test_reminder_boot.js`, `test_reminder_migration.js`,
  `test_reminder_app_acceptance.js`, `test_reminder_app_privacy.js`,
  `test_reminder_app_notification_boundary.js`.
- Sync/state: `test_reminder_sync_privacy.js`, `test_reminder_concurrency.js`.
- Current panel: `test_reminder_panel_source.js`,
  `test_reminder_panel_coverage.js`, `test_reminder_panel_redaction.js`,
  `test_reminder_panel_polling.js`, `test_reminder_panel_privacy.js`,
  `test_reminder_panel_a11y.js`, `test_reminder_panel_performance.js`,
  `test_reminder_panel_fixture_architecture.js`.
- Cross-surface: `test_reminder_end_to_end_lineage.js`,
  `test_reminder_cross_surface_schema.js`,
  `test_reminder_cross_surface_status.js`,
  `test_reminder_integrated_privacy.js`, `test_reminder_integrated_ux.js`.

## Güvenli devam kuralı

Yeni reminder davranışı istenirse eski REM prompt zinciri otomatik olarak
canlandırılmaz. Önce güncel source/test state okunur, yeni dar kapsam ve yeni
acceptance koşulu oluşturulur. Her doğrulama app, current panel ve Panel-v2
yüzeylerini ayrı raporlar; browser ve gerçek veri repo yazımı yasaktır.
