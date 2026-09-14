# MON2 · Güncel durum

**Güncelleme:** 2026-09-14 · **Durum:** `in_progress` · **Aktif kart:** MON2-06 · **Tamamlanan:** 5/8 (MON2-01…05) · **Dalga 1 (Reminder) + Dalga 2 (Görünüm) kapandı**

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

## MON2-03 sonrası (2026-09-14)

- `app.js` 10.277 → **9.771 satır** (8.532 kod) — −506 satır; `app/core/reminderSurface.js` 42 → **1004 satır** (K4/K5 iskelet → gerçek gövdeler)
- Taşınanlar: **35 yan etkili reminder fn** (permission/native/lifecycle/scheduler/storage/action/medication/special-day/digest/sync/surface) + **51 `App.*reminder*` handler gövdesi** (MON-50 appSurface deseni; app.js'te 1-liner `App.x=…SEYMA_REMINDER_SURFACE.x.apply` shim'leri)
- **with(SCOPE) idiomu:** sabit `Object.create(null)` + `installScopeProperties(s)` — with bağlamı modül-yükleme anındaki objeye statik bağlı; register'da property-getter'lar (Object.defineProperty canlı getter) AYNI objeye eklenir. Register yoksa gövdeler fail-closed ReferenceError. `var SCOPE=buildScope()` modül-yüklemede çalışmaz (deps null).
- **REM-67 dilim sözleşmesi:** `appendReminderEvent` + `persistReminderEvent` app.js'te **tam gövde** kaldı (test_reminder_end_to_end_lineage app.js'in event-adapter dilimini izole VM'de çağırıyor; fn sayısı 37→35)
- Deps bag 122 → **123 üye** (+`appendReminderEvent` getter) + 5 setter helper (`setPermissionTransient/InFlight/EverGranted/GrantObserved`, `setSchedulerInstance`); `REMINDER_SURFACE_DEPENDENCIES` 123 ad; K3 mutable değişkenler (K8 pinler: scheduleMoveSync, reminderNotificationChannel, window.ReminderEngineV1, reminderLifecycleTick timer, reconcileReminderStorageEvent, App.onModalKeydown, reminderEventCorrelation, migrateReminderState) app.js'te kaldı
- Test sözleşme devirleri (K8 — pin gövdeyi izler): acceptance `referenced` shell registry'leri tarar; notification_boundary channel-boundary surfaceSource'ta da kabul; fx2_overlay FX2-16.1 closeX sarmalayıcı modül `function App_x(){}` + guard'lı `window.SeyFx.sheetClose` biçimini tanır
- Kapı: smoke **20/20** · `--gate` PASS (9.771/0/408/928) · driver+zikr 95/95 · verify-state B1/B2/B3 · tests/app **53/53** (fx2 6/6 dahil) · panel 23/23 · panel-v2 27/27 · quran 9/9 · sync 69/69 · App.x=554 · onclick(kombine)=391 · withModule:false PASS
- Cache-bust: `reminderSurface.js?v=20260914d`, `app.js?v=20260914d` + 4 app_surface pin'i güncellendi

## Bütçe (shellBudget)

Aktif (MON2-06): 8.500 satır · 0 Legacy · 450 reminder gövde · 150 HTML builder. Ölçüm 8.969/0/408/97 — builder zaten altında (MON2-05 97'ye indirdi); satır düşüşü MON2-06'nın işidir (8.969 → ≤8.500, alan gövdeleri registry'lere). Bütçe asla gevşetilmez; ölçüm tutmazsa kart bütçeyi ölçülen değere çeker ve sapmayı LEDGER'a yazar.

## MON2-04 sonrası (2026-09-14 · Dalga 1 kapanışı)

- Kod değişikliği YOK (kart kapanışı): ölçüm MON2-03 ile aynı — 9.771 / 0 / 408 / 928; `--gate` PASS
- Tam kapı seti koşuldu ve PASS: smoke 20/20, app_surface 4 fixture, modal, aeon, driver+zikr 95/95, verify-state ×3, tests/app (modülerleştirme + premium 8/8 + fx2 6/6), panel 23/23, panel-v2 27/27, quran 9/9, sync 69/69
- Doküman senkronu: CLAUDE.md/AGENTS.md repo layout (`reminderSurface.js` satırı, Legacy cümlesi silindi; MON2 bullet status/aktif kart güncel), `docs/GELISTIRME-PLANI.md` changelog + durum tablosu MON2 satırı, `tests/README.md` envanter notları, plan README §1 "Dalga 1 sonrası" kolonu
- Kapanış belgesi: [`deliverables/MON2-DALGA1-KAPANIS.md`](../deliverables/MON2-DALGA1-KAPANIS.md) (önce/sonra envanter, taşınan kod, 22 Legacy listesi, fixture listesi, kapı kanıtı)

## MON2-05 sonrası (2026-09-14 · Dalga 2 kapanışı)

- `app.js` 9.771 → **8.969 satır** (7.777 kod) — −802 satır; `app/core/render.js` **1.843 satır** (kod 1.620)
- Taşınanlar: **37 `*HTML` builder gövdesi** (831 kod satırı) → `render.js`; app.js'te 1-liner `SEYMA_RENDER.x.apply(null,arguments)` shim'ler
- Dep bag genişledi: **61 fn dep** + **14 sabit dep** (MOODS, REFLECT_PROMPTS, HABITS, DERIVED_HABITS, DERIVED_ACCENT, VACATION_WATER_GOAL, NOTES, SHORT_HABIT, WA, TEL, QURAN_DEFAULT_SURAH_ID, QURAN_FILTERS, QURAN_VIDEO_ID_RE, AEON_ICON_URL) + `find` çözücüsü; manifest aynı üye seti; MON-49 fail-closed korunur
- render.js: `call()`-wrapper'lar (61+1) + taşınan gövdeler (prologue idiomu: `var data=liveData(), ui=liveUi(), dark=liveDark(), CONST=call('CONST',[])`) + export map'e 37 mover + modalsHTML + render
- Kalan >2-satır `*HTML` builder: **6 fn / 97 satır** (haritaHTML, saveButtonHTML, dailyPhotoCardHTML, bugunHTML(4), headerActionHTML, headerSceneHTML) — bütçe ≤150
- `App.x=554` sabit; inline onclick fx2 birleşik kaynakta **391** sabit (render.js combinedSource'ta zaten vardı); `data=` 9 rebind, B1 getter, timer/listener kaydı, `window.App=App` app.js'te
- Dump kanıtı: driver `--dump bugun/rapor/ayarlar/hub` önce/sonra **4/4 BAYT-EŞİT** (31 PASS her iki tarafta). Not: `health.js` `calculateMgNudge`'ta önceden var olan `Math.random` skor satırı (75–95) dump'ı koşum başına değiştiriyordu — kanıt için geçici tmp driver kopyasında Math.random sabitlendi; üretim kodu değişmedi (LEDGER seq 6 sapma 5)
- Fixture devirleri (K8): `test_today_card_preferences` + `test_modal_focus_containment` bölümleri renderSource'a; `zikr-harness` z-index sözleşmesi birleşik kaynağa
- Kapı: smoke **21/21** · `--gate` PASS (9.400 bütçesi, 8.969/0/408/97) · driver+zikr **95/95** · verify-state B1/B2/B3 · tests/app **52/52** · panel 23/23 · panel-v2 27/27 · quran 9/9 · sync 69/69 · App.x=554 · onclick(kombine)=391
- Cache-bust: `render.js?v=20260914e`, `app.js?v=20260914e` + 4 app_surface pin'i güncellendi

## Sonraki güvenli adım

MON2-06 (README §6): alan gövdeleri quran/zikr/profile/psych → ilgili registry'ler — bütçe 8.500 / 0 / 450 / 150. Devir briefi: [`DEVIR-MON2-06.md`](../DEVIR-MON2-06.md).
Push/deploy/browser/gerçek veri yok.

## Sınırlar

LOCAL-ONLY dal; push/merge/tag/deploy/browser/cihaz/gerçek veri/`seyma-data` yok.
Frozen: reminder×4, sync.js, sw.js, panel*, app/content, docs/reminders, MODULARIZATION.md.
