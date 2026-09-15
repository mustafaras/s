# MON2 · Güncel durum

**Güncelleme:** 2026-09-15 · **Durum:** `in_progress` · **Aktif kart:** MON2-08 (Kapanış) · **Tamamlanan:** 7/8 (MON2-01…07) · **Dalga 1 (Reminder) + 2 (Görünüm) + 3 (Alan) kapandı**

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

## MON2-06 sonrası (2026-09-15 · Alan dalgası, kart 6/8)

- `app.js` 8.969 → **7.797 satır** (6.766 kod) — −1.172 satır; bütçe 8.500'ü **703 satır marjla** geçti
- Taşınanlar: **146 gövde** → `SeymaQuran` 52 (quran.js 363→876), `SeymaZikr` 57 (zikir.js 1.044→1.724), `SeymaProfile` 17 + `SeymaPsych` 20 (profile.js 879→1.447); MON-50 appSurface deseni (sloppy IIFE + `with(SCOPE)` + canlı property-getter'lar). Saf gövdeler + K4 handler gövdeleri modülde; app.js'te **124 adet 1-liner shim** ve dep bag'leri kalır
- **Kök düzeltme — K4'ün gerçek anlamı (dep bag):** 37 yan-etkili gövde önce ÇIPLAK GLOBAL kullanıyordu (`document`×48+17+10, `setTimeout(`×2+2+3, `window.SeySync`×2+17) → MON-20/21/22/36 saflık sözleşmelerini kırıyordu (4 fixture kırmızı). Gövdeler bag takma adlarına çevrildi: **`document`→`doc`**, **`setTimeout(`→`defer(`**, **`window.SeySync`→`sync`**; üç bag'e `doc`/`defer` (+quran/profile'da `sync`) eklendi. Domain dosyaları artık **hiçbir tarayıcı globali adı taşımaz** → saflık sözleşmeleri zayıflatılmadan PASS
- **5. app_surface cache-bust pin'i** (`test_app_surface_boot_boundary.js:178`) MON2-01…05'te gözden kaçmıştı; bu kartta yakalandı ve senkronlandı (artık 5 pin)
- Cache-bust: `zikir.js?v=20260915a`, `quran.js?v=20260915a`, `profile.js?v=20260915a`, `app.js?v=20260915a` + 5 app_surface pin'i
- Fixture devirleri (K8 — pin gövdeyi izler): `test_zikir_boundary` (zikrTap bölümü → MON2-06 dilimi), `test_zikir_view_boundary` (draft mutation pin'i → dilim), `test_modal_focus_containment` (onZikrKeydown → `function App_onZikrKeydown(e){`), `test_premium_haptics_fx` + `test_premium_voice` (appSrc += zikir.js), `test_fx2_overlay_motion` (closeX araması zikir/quran'ı da tarar; combinedSource'a EKLENMEDİ — onclick=391 pini bu dosyalar hariç ölçüldü), `zikr-harness` (undo toast → `movedSource`)
- Kapı: syntax (app+sync+core×31) · smoke **21/21** (73 assertion) · `--gate` PASS (7.797/0/408/97) · driver+zikr **95/95** · verify-state B1/B2/B3 · tests/app **52/52** · panel 23/23 · panel-v2 27/27 · quran 9/9 · reminders 21/21 · sync 69/69 · `App.x=554` · onclick(kombine)=391 · dump **6/6 BAYT-EŞİT** (deterministik)
- Dump notu: `bugun`/`reading` ham koşumda tek satır farklıydı — `calculateMgNudge` `Math.random` skoru (MON2-05'te belgelenmiş, önceden var). Geçici tmp sabitlemeyle 6/6 bayt-eşit; üretim kodu değişmedi (LEDGER seq 7 sapma 8)
- Kalan 3 saf gövde kartın açık kapsam dışı: `zikrSyncWakeLock` (README: app.js'te kalır), `quranOnPlayerStateChange`/`quranAttachPlayer` (YouTube iframe API → MON2-07 ağ kapsamı)
- Ölçüm dosyaları: `app.js` 7.796 · `app/core/zikir.js` 1.724 · `app/core/quran.js` 876 · `app/core/profile.js` 1.447 · `app/core/appSurface.js` 459

## Bütçe (shellBudget)

Aktif (MON2-07): 8.000 satır · 0 Legacy · 450 reminder gövde · 150 HTML builder. Ölçüm 7.797/0/408/97 — 8.000'e 203 satır marj. MON2-07 sonunda bütçe ölçülen+%2 ile daraltılır; asla gevşetilmez.

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

## MON2-07 sonrası (2026-09-15 · Alan dalgası, kart 7/8)

- `app.js` 7.797 → **7.603 satır** (6.589 kod) — −194 satır; bütçe 7.800'e 197 satır marj
- `app/core/appSurface.js` 459 → **840 satır**: yeni **alan yüzey bölümü** (24 gövde, aeon/location/header/weather/photo/habit/hero/luna). Yeni dosya YOK (K5)
- Desen: ikinci **sloppy IIFE, DOSYA SONUNDA** (`with(FIELD_SCOPE)` + canlı property-getter'lar). Ana IIFE `'use strict'` taşıdığı için `with` oraya konamaz (ilk denemede SyntaxError — dosya sonu zorunlu)
- **KÖK DÜZELTME 1 — bag üyeleri değer-üretici olmalı:** ilk yazımda `activeDate:activeDate` biçimindeydi; FIELD_SCOPE getter'ı üyeyi **çağırıp** sonucu değer sanıyor → `locationGateResetNudge is not a function`. MON2-06 deseni gereği **hepsi** `function(){ return X; }` yapıldı
- **KÖK DÜZELTME 2 — S3/I1 ihlali geri alındı:** `locationGateGranted` gövdesi `data=migrate(createDefaultData())` içeriyordu (data rebind app.js'te kalır). app.js'e geri alındı; `test_state_rebind_boundary` yeniden 9 rebind satırı + 11 token görüyor; dep listesinden çıkarıldı
- **KÖK DÜZELTME 3 — K4 (dep bag):** 3 `document.` kullanımı `doc` takma adına çevrildi + `doc:function(){ return document; }` bag üyesi. appSurface.js hiç tarayıcı globali adı taşımaz
- **Ağ/GPS/notification kuralı uygulandı** — app.js'te kalanlar: `locationGateSilentVerify` (57), `streamAsk` (34), `mergeInbox` (48), `showNativeAeonNotification` (52), `fetchWeather` (40), `fetchDailyPhoto` (38); `sha256` WebCrypto da kaldı (kart hükmü)
- `*HTML` builder gölge sayımı 6/97 → **4/57** (headerSceneHTML 49 + headerActionHTML 6 taşındı; bunlar builder ölçütüne giriyordu)
- Fixture devirleri (K8 — pin gövdeyi izler): `test_fx2_overlay_motion`, `test_fx2_tab_transition`, `test_fx2_touch_coverage` → `combinedSource += appSurface.js` (onclick=391 sabit kaldı — appSurface'te onclick yok)
- Cache-bust: `appSurface.js?v=20260915b`, `app.js?v=20260915b` + **5 app_surface pin'i**. Not: sed ile toplu değişim fazla kaçış ekledi (`appSurface\\.js\\?v=`); perl ile geri alındı
- Kapı: syntax (app+sync+core×31) · smoke **21/21** (73 assertion) · `--gate` PASS (7.603/0/408/57) · driver+zikr **95/95** · verify-state B1/B2/B3 · tests/app **52/52** · panel 23/23 · panel-v2 27/27 · quran 9/9 · reminders 21/21 · sync 69/69 · `App.x=554` · onclick=391 · dump **6/6 BAYT-EŞİT**

## Bütçe (shellBudget)

Aktif (MON2-08): 7.800 satır · 0 Legacy · 450 reminder gövde · 150 HTML builder. Ölçüm 7.603/0/408/57 — 7.800'e 197 satır marj. MON2-08 kapanışta bütçeyi dondurur; asla gevşetilmez.

## Sonraki güvenli adım

MON2-08 (seri kapanışı): tam set + panel/panel-v2 + quran + reminder smoke; `deliverables/MON2-SERI-KAPANIS.md` (son envanter, 25 modül API/owner tablosu, shim envanteri, bütçe dondurma, açık kalanlar). `MON2-STATE.json` `status=completed`, `nextPrompt=null`, `releaseApproval=not_approved`. CLAUDE.md/AGENTS.md modularization bullet'ı "MON2 complete" ile güncellenir.
Push/deploy/browser/gerçek veri yok.

## Sınırlar

LOCAL-ONLY dal; push/merge/tag/deploy/browser/cihaz/gerçek veri/`seyma-data` yok.
Frozen: reminder×4, sync.js, sw.js, panel*, app/content, docs/reminders, MODULARIZATION.md.
