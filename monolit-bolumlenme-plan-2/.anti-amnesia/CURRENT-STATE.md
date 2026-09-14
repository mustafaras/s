# MON2 · Güncel durum

**Güncelleme:** 2026-09-14 · **Durum:** `planned` · **Aktif kart:** MON2-01 · **Tamamlanan:** 0/8

## Canlı baseline (commit cf42949, `node tools/shell-inventory.mjs`)

- `app.js` 13.139 satır (11.839 kod / 1.140 yorum / 160 boş)
- 1.867 sütun-0 fonksiyon: 1.091 shim (1.148) · 530 küçük (2.950) · 246 büyük (5.107)
- 554 `App.x=function` · 391 inline onclick · 22 `*Legacy` (208) · 60 `*HTML` builder (1.129)
- Reminder: 529 fn / 3.247 satır; 293 fn / 1.770 satır yalnız-iç; 120 sabit / 288 satır
- `app/core/*` 29 dosya / 11.974 satır; `reminders.js` 360 satır

## Bütçe (shellBudget)

13.200 satır · 22 Legacy · 3.300 reminder gövde · 1.150 HTML builder → MON2-01 sonrası daraltılacak.

## Sonraki güvenli adım

MON2-01 (README §5): `reminderSurface.js` iskeleti, dört yükleme listesi,
11 fixture yükleme paritesi, `test_reminder_cross_surface_status.js` birleşik
kaynak, `test_modularization_boundary.js [1]` çevirisi, `--gate` PASS, tek yerel commit.

## Sınırlar

LOCAL-ONLY dal; push/merge/tag/deploy/browser/cihaz/gerçek veri/`seyma-data` yok.
Frozen: reminder×4, sync.js, sw.js, panel*, app/content, docs/reminders, MODULARIZATION.md.
