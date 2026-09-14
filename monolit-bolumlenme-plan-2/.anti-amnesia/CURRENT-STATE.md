# MON2 · Güncel durum

**Güncelleme:** 2026-09-14 · **Durum:** `in_progress` · **Aktif kart:** MON2-03 · **Tamamlanan:** 2/8 (MON2-01, MON2-02)

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

## MON2-02 sonrası (2026-09-14)

- `app.js` 13.150 → **10.277 satır** (9.029 kod) — 22 `reminder*Legacy` silindi, kalan Legacy **0**
- `app/core/reminders.js` 360 → 4.189 satır: REMINDER_* sabitleri, saf/B1 gövdeler, görünüm üreticileri (registry +171 üye); `reminderSurface.js` K4/K5 iskelet (42 satır)
- Deps bag 33→51 getter üye (`app.js:1455-1511`); view bag `app.js:1513-1531` (sections yok — modül içi üretim, L1525 notu); scope getter **deps-only**
- Lazy-constant deseni: `REMINDER_PRAYER_KEYS` (6 tüketici) + `REMINDER_PRIVACY_SCHEMAS` (`reminderPrivacySchemasObject()`) — modül yükleme sırası app.js boot sabitlerinden önce geldiği için load-time referans `undefined` üretiyordu
- `migrateReminderState` + `REMINDER_*` boot sabitleri app.js'te kaldı (migrate/rebind sahipliği I1-I6)
- Reminder ayak izi: 355 fn / **947 kod satırı** (hedef ≤1.500); 121 sabit / 289 satır
- Cache-bust: `reminders.js?v=20260914a`, `app.js?v=20260914c`; 4 app_surface + ui_boundary pin'i güncellendi
- Fixture devirleri (K8 ilkesi — pin gövdeyi izler): `cross_surface_status` extractFunction (girinti+yorum duyarlı süslü tarama) ve birleşik kaynak sırası [reminders, reminderSurface, app]; `integrated_ux` `sey-reminder-inbox-live` → APP_REMINDER_SOURCE; 3 `test_fx2_*` combinedSource += reminders/reminderSurface (onclick 391 sabit); `ui_boundary` mutation regex ×3 sıkılaştırma
- Kapı: smoke **21/21** · `--gate` PASS (10.277/0/947/928) · driver+zikr 95/95 · verify-state B1/B2/B3 · tests/app **53/53** · App.x=554 · onclick=391 · dump `bugun/ayarlar` bayt-eşit

## Bütçe (shellBudget)

11.300 satır · 0 Legacy · 1.500 reminder gövde · 1.150 HTML builder (MON2-02 plan bütçesi; ölçüm 10.277/0/947/928 ile altında). MON2-03 hedefi: 10.300 / 0 / 450 / 950.

## Sonraki güvenli adım

MON2-03 (README §5): kalan reminder `App.*` handler gövdeleri →
`reminderSurface.js`/`reminders.js` (App.* shim + atama app.js'te kalır — I1-I6).
Push/deploy/browser/gerçek veri yok.

## Sınırlar

LOCAL-ONLY dal; push/merge/tag/deploy/browser/cihaz/gerçek veri/`seyma-data` yok.
Frozen: reminder×4, sync.js, sw.js, panel*, app/content, docs/reminders, MODULARIZATION.md.
