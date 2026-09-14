# MON2 · Güncel durum

**Güncelleme:** 2026-09-14 · **Durum:** `in_progress` · **Aktif kart:** MON2-02 · **Tamamlanan:** 1/8 (MON2-01)

## Canlı baseline (commit cf42949, `node tools/shell-inventory.mjs`)

- `app.js` 13.139 satır (11.839 kod / 1.140 yorum / 160 boş)
- 1.867 sütun-0 fonksiyon: 1.091 shim (1.148) · 530 küçük (2.950) · 246 büyük (5.107)
- 554 `App.x=function` · 391 inline onclick · 22 `*Legacy` (208) · 60 `*HTML` builder (1.129)
- Reminder: 529 fn / 3.247 satır; 293 fn / 1.770 satır yalnız-iç; 120 sabit / 288 satır
- `app/core/*` 29 dosya / 11.974 satır; `reminders.js` 360 satır

## MON2-01 sonrası (2026-09-14)

- `app.js` 13.150 satır (11.847 kod) — +8 kod / +3 yorum: `SEYMA_REMINDER_SURFACE` + fail-closed bag (app.js:5111)
- `app/core/reminderSurface.js` yüklü: index (`?v=20260914a`, reminders.js sonrası), driver/zikr FILES, rebind boot listesi, verify-state-migration
- `app.js?v=20260914b`; 4 app_surface fixture'ındaki literal sürüm assert'i güncellendi
- K6 paritesi: 14 fixture + acceptance `APP_SHELL_REGISTRIES` (modules: override'ları yalnız frozen dördü seçer)
- K7: `test_modularization_boundary [1]` → `shellBudget.maxTotalLines`; K8: cross_surface_status birleşik kaynak
- Düzeltildi (MON2 dışı `test:` commit'i): `test_premium_settings`/`test_premium_voice` 06:30 koşusunda 38/39 ve 59/67 vermişti — sebep kod değil, `mediaFx.js` quiet-time (23–07) gating'inin gerçek saati okuması; fixture'lar saati 12:00'a sabitler, quiet-time bloğu 23'e çekip gerçek-saat yolunu sınar (39/39, 68/68, saatten bağımsız)

## Bütçe (shellBudget)

13.200 satır · 22 Legacy · 3.300 reminder gövde · 1.150 HTML builder (13.150×1.02 > 13.200 → korunur). MON2-02 hedefi: 11.300 / 0 / 1.500 / 1.150.

## Sonraki güvenli adım

MON2-02 (README §5): `REMINDER_*` sabitleri + saf/B1 gövdeler + görünüm →
`app/core/reminders.js`; 22 `reminder*Legacy` silinir; `--domain reminder`
yalnız-iç listesi shim'siz; `registerReminderView` sections bag'i kalkar.
Yalnız aktif kart; push/deploy/browser/gerçek veri yok.

## Sınırlar

LOCAL-ONLY dal; push/merge/tag/deploy/browser/cihaz/gerçek veri/`seyma-data` yok.
Frozen: reminder×4, sync.js, sw.js, panel*, app/content, docs/reminders, MODULARIZATION.md.
