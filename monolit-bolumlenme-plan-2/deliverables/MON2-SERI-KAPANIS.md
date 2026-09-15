# MON2 · Seri Kapanış Belgesi

**Tarih:** 2026-09-15 · **Program:** `MON2-KABUK-INCELTME` · **Dal:** `premium-fx-gorsel-yuzey` (LOCAL-ONLY)
**Durum:** `completed` — 8/8 kart, Dalga 1–4 kapandı · **releaseApproval:** `not_approved`

---

## 1. Sonuç

| Ölçüm | MON2 öncesi | MON2 sonrası | Değişim |
|---|---:|---:|---:|
| `app.js` toplam satır | 13.139 | **7.603** | **−5.536 (%42)** |
| `app.js` kod satırı | 11.839 | **6.589** | −5.250 |
| Sütun-0 fonksiyon | 1.867 | 1.652 | −215 |
| 1-satır shim | 1.091 fn / 1.148 satır | 1.405 fn / 1.411 satır | +314 fn |
| Küçük gövde (3–10) | 530 fn / 2.950 satır | 158 fn / 902 satır | −2.048 satır |
| Büyük gövde (≥11) | 246 fn / 5.107 satır | 89 fn / 1.822 satır | −3.285 satır |
| `App.*` handler gövdesi | 554 fn / 2.430 satır | 554 fn / 1.638 satır | envanter sabit |
| `*Legacy` çift gövde | 22 fn / 208 satır | **0** | emekli |
| `*HTML()` builder (>2 satır) | 60 fn / 1.129 satır | **4 fn / 57 satır** | −1.072 satır |
| `var` blokları | — | 283 / 903 satır | |
| `app/core/*` | 29 dosya / 11.974 satır | **30 dosya / 20.034 satır** | +1 dosya |

**Bütçe (dondurulmuş):** `maxTotalLines: 7800` · `maxLegacyFunctions: 0` ·
`maxReminderFunctionCodeLines: 450` · `maxHtmlBuilderCodeLines: 150`.
Ölçüm **7.603 / 0 / 408 / 57** → hepsi sınır içinde.
Kapı: `node tools/shell-inventory.mjs --gate` → exit 0.

## 2. Kart kapanış tablosu

| Kart | Kapsam | `app.js` sonrası | Bütçe | Marj |
|---|---|---:|---:|---:|
| MON2-01 | Karar, iskelet, 4 liste, fixture paritesi, kapı aracı | 13.150 | 13.200 | 50 |
| MON2-02 | Sabitler + saf/B1 gövdeler → `reminders.js`; Legacy emekli | 10.277 | 11.300 | 1.023 |
| MON2-03 | Yan etkili gövdeler + 51 handler → `reminderSurface.js` | 9.771 | 10.300 | 529 |
| MON2-04 | Dalga 1 kapanışı (kod taşımadı) | 9.771 | 10.300 | 529 |
| MON2-05 | 37 `*HTML` builder (831 kod satırı) → `render.js` | 8.969 | 9.400 | 431 |
| MON2-06 | 146 alan gövdesi → `zikir.js`/`quran.js`/`profile.js` | 7.797 | 8.500 | **703** |
| MON2-07 | 24 alan gövdesi → `appSurface.js` alan yüzey bölümü | **7.603** | 8.000 | **397** |
| MON2-08 | Seri kapanışı (kod taşımadı) | 7.603 | 7.800 | **197** |

Her kart tek yerel commit; her kabul `--gate` ile sayısal. Bütçe her kapanışta
ölçülen değere çekildi, hiç gevşetilmedi.

## 3. Modül API / owner tablosu (30 dosya)

| # | Dosya | Sahip namespace | Satır | Not |
|---:|---|---|---:|---|
| 1 | `constants.js` | (boot sabitleri) | 157 | İlk `app/core` script'i |
| 2 | `dateUtils.js` | `SeymaDateUtils` | 60 | MON-07/08 |
| 3 | `state.js` | `SeymaState` | 526 | `migrate`/`getDay`/`createDefaultData` gövdeleri |
| 4 | `syncGlue.js` | `SeymaSave` | 76 | `save()` gövdesi |
| 5 | `helpers.js` | `SeymaHelpers` | 113 | 12 görünüm/etkileşim yardımcısı |
| 6 | `prayer.js` | `SeymaPrayer` | 217 | MON-19 |
| 7 | `zikir.js` | `SeymaZikr` | **1.724** | MON-20/21 + MON2-06 (57 gövde) |
| 8 | `quran.js` | `SeymaQuran` | **876** | MON-22 + MON2-06 (52 gövde) |
| 9 | `saygi.js` | `SeymaSaygi` | 269 | MON-23 |
| 10 | `motivation.js` | `SeymaMotivation` | 744 | MON-26 |
| 11 | `crisis.js` | `SeymaCrisis` | 290 | MON-27 |
| 12 | `journal.js` | `SeymaJournal` | 267 | MON-28 |
| 13 | `health.js` | `SeymaHealth` | 1.147 | MON-29/30/31 |
| 14 | `library.js` | `SeymaLibrary` | 666 | MON-33 |
| 15 | `report.js` | `SeymaReport` | 349 | MON-34 |
| 16 | `map.js` | `SeymaMap` | 336 | MON-35 |
| 17 | `profile.js` | `SeymaProfile` | **1.447** | MON-36 + MON2-06 (17 profile + 20 psych gövde) |
| 18 | `settings.js` | `SeymaSettings` | 205 | MON-37 |
| 19 | `reminderCatalog.js` | `ReminderCatalogV1` | 368 | Frozen (K9) |
| 20 | `reminderEngine.js` | `ReminderEngineV1` | 225 | Frozen (K9) |
| 21 | `reminderScheduler.js` | `ReminderSchedulerV1` | 195 | Frozen (K9) |
| 22 | `reminderDelivery.js` | `ReminderDeliveryV1` | 265 | Frozen (K9) |
| 23 | `reminders.js` | `SeymaReminders` | **4.189** | MON-40/41 + MON2-02 (sabitler + saf/B1 gövdeler) |
| 24 | `reminderSurface.js` | `SeymaReminderSurface` | **1.004** | **MON2-03 (yeni dosya, K5)** |
| 25 | `render.js` | `SeymaRender` | **1.843** | MON-44…54 + MON2-05 (37 builder) |
| 26 | `appSurface.js` | `SeymaAppSurface` | **840** | MON-50…54 + **MON2-07 alan yüzey bölümü** |
| 27 | `mediaFx.js` | (FX runtime) | 848 | FX-2 programı |
| 28 | `timeTheme.js` | (saat/tema) | 215 | FX-2 |
| 29 | `skyFx.js` | `SeySkyFx` | 291 | SKY serisi |
| 30 | `messaging.js` | `SeymaMessaging` | 282 | MON-42 |

**Büyüyen dosyalar:** `reminders.js` (360 → 4.189), `render.js` (→1.843),
`appSurface.js` (459 → 840), `profile.js` (→1.447), `zikir.js` (1.044 → 1.724),
`quran.js` (363 → 876).

**Yeni dosya sayısı:** 1 (`reminderSurface.js`, MON2-03) — K5 "Dalga 2–3 yeni dosya
açmaz" hükmü korundu; MON2-06/07 mevcut registry'lerin içine yüzey bölümü ekledi.

**Sahipsiz namespace'ler (fonksiyon/sabit kütüphanesi):** `constants.js`, `mediaFx.js`,
`reminderCatalog/Engine/Scheduler/Delivery.js` (frozen sürüm namespace'leri),
`reminders.js` (`SeymaReminders` üzerinden), `messaging.js`, `skyFx.js`, `timeTheme.js`.

## 4. Delege sözleşmeleri (S3 / M1–M4)

app.js'te kalan sahiplik (hiçbir karta taşınmadı):

- `var data/ui/dark` ve **9 `data=` rebind satırı** (11 token)
- 7 B1 canlı getter (`data`, `ui`, `dark`, `migrate`, `getDay`, `createDefaultData`, `save`)
- `SeyOnSyncState`/`SeyOnSynced` callback sahipliği
- Tüm timer/listener **kaydı** (gövde modülde, kayıt app.js'te)
- `window.App=App` ve **554 `App.x=function` ataması**
- ~180 `App.reminderX=reminderX` alias satırı
- `register*` bag'leri (fail-closed `throw`)
- Ağ/GPS/notification **çağrıları**: `locationGateSilentVerify`, `streamAsk`,
  `mergeInbox`, `showNativeAeonNotification`, `fetchWeather`, `fetchDailyPhoto`,
  `reverseGeocodeLive`, `startLocationWatch`, `stopLocationWatch`, `sha256`,
  `quranJourneySubmit`/`quranJourneySubmitProceed`, `zikrSyncWakeLock`

## 5. Shim envanteri

**1.405 shim / 1.411 kod satırı** (sütun-0 fonksiyonların %85'i).

Shim kalan adların gerekçeleri:

| Sınıf | Örnek | Neden shim? |
|---|---|---|
| Domain dışı çağrı | `quranReduce`, `zikrCounterViewHTML` | app.js kendi closure'ından çağırır |
| `App.x=` ataması | `App.zikrTap` | I2: App yüzeyi app.js sahibinde |
| Registration bag üyesi | `headerSceneHTML`, `habitProgress` | `register*` bag'i fonksiyon bekler |
| Timer/listener kaydı | `reminderLifecycleTick` | Kayıt app.js'te (S3) |
| İmza koruma | `App.profileAnswer` | Inline `onclick` metinleri değişmez (391 sabit) |

**1-satır shim standardı bilinçli:** MON döneminde "her taşınan gövdeye 1 satır shim"
kuralı 1–2 satırlık fonksiyonlarda sıfır kazanç üretiyordu; MON2'de bu kural
**yalnız gerekli adlar** için uygulandı (K2: aynı domain içi çağrılar shim'siz taşındı —
69 reminder + 47 zikr + 28 quran yalnız-iç fonksiyon).

**Kalan büyük gövdeler (89 fn / 1.822 satır):** çoğunlukla `data` rebind, B1 getter,
timer kaydı ve ağ çağrısı içeren app.js'e özgü kabuk kodudur.

## 6. Fixture evrimi (K8 ilkesi: pin gövdeyi izler)

| Kart | Devredilen fixture | Devir biçimi |
|---|---|---|
| MON2-01 | 14 fixture + acceptance `APP_SHELL_REGISTRIES`; K7 `test_modularization_boundary[1]` → `shellBudget.maxTotalLines`; K8 `cross_surface_status` birleşik kaynak | yükleme paritesi |
| MON2-02 | `cross_surface_status` (girinti/yorum duyarlı tarama), `integrated_ux`, 3× `test_fx2_*` combinedSource, `ui_boundary` regex | birleşik kaynak |
| MON2-03 | `acceptance` shell registry taraması, `notification_boundary`, `fx2_overlay` FX2-16.1 | birleşik kaynak |
| MON2-05 | `today_card_preferences`, `modal_focus_containment`, `zikr-harness` z-index | dilim → renderSource |
| MON2-06 | `test_zikir_boundary`, `test_zikir_view_boundary`, `modal_focus_containment`, `premium_haptics_fx`, `premium_voice`, `fx2_overlay_motion`, `zikr-harness` | dilim → registry |
| MON2-07 | `fx2_overlay_motion`, `fx2_tab_transition`, `fx2_touch_coverage` | `combinedSource += appSurface.js` |

**5 app_surface cache-bust pin'i** (`test_app_surface_{boot,domain,lifecycle,overlay}_boundary.js`
+ regex tabanlı `daily_boundary`) her cache-bust bump'ında senkronlanır.

## 7. Kalıcı sözleşmeler (MON2 sonrası)

1. **app.js shell** — `data` rebind, B1 getter, timer/listener kaydı, `window.App`,
   `App.x=` atamaları, `register*` bag'leri app.js'te kalır. Bunlar taşınmaz.
2. **Dep-bag zorunlu** — modüllere taşınan her gövde DOM/timer/sync'e **takma adla**
   erişir (`doc`/`defer`/`sync`); çıplak tarayıcı globali adı yasak.
3. **Bag üyeleri değer-üretici** — `X:function(){ return X; }`; çıplak fn referansı
   scope getter'ı tarafından çağrılır (MON2-07 kök düzeltmesi).
4. **Ağ/GPS/notification çağrısı app.js'te** — gövde "request builder" + "response
   applier" olarak bölünür, iki saf parça taşınır.
5. **`with` yalnız sloppy IIFE** — `appSurface.js`/domain dosyalarının ana IIFE'si
   strict; yüzey bölümü **dosya sonunda** ayrı IIFE olarak eklenir.
6. **Saflık sözleşmeleri korunur** — `test_zikir_boundary`, `test_quran_boundary`,
   `test_profile_boundary` ilgili dosyada hiçbir tarayıcı globali/storage/fetch
   görmemeli.
7. **Bütçe asla gevşetilmez** — her kart kapanışında ölçülen değere çekilir.
8. **Cache-bust pin'i 5 tanedir** — `sed` ile toplu değişim fazla kaçış ekler; `perl` kullan.

## 8. Açık kalanlar

| Konu | Durum | Neden |
|---|---|---|
| Ağ/GPS/notification gövdeleri | app.js'te | Kart hükmü (bilinçli sınır) |
| `locationGateGranted` | app.js'te | `data` rebind içerir (S3/I1) |
| `sha256` WebCrypto | app.js'te | Wrapper; saf değil |
| `quranJourneySubmit(Proceed)` | app.js'te | Ağ: pull + apply |
| `zikrSyncWakeLock` | app.js'te | Kart hükmü |
| Cihaz kabulü (K3) | **bekliyor** | Yalnız kullanıcı verebilir |
| Push / deploy / tag / merge | **yapılmadı** | LOCAL-ONLY, ayrı onay |
| `mustafaras/seyma-data` yazımı | **yapılmadı** | Ayrı onay |

## 9. Kanıt

- **Kapı seti (kapanışta, commit sonrası da yeşil):**
  syntax (app + sync + core×30 + sw + panel×2) · smoke **21/21** (73 assertion) ·
  `shell-inventory --gate` PASS · driver **31 PASS** · zikr-harness **95/95** ·
  verify-state B1/B2/B3 · tests/app **52/52** · tests/panel **23/23** ·
  tests/panel-v2 **27/27** · tests/quran **9/9** · tests/reminders **21/21** ·
  sync **69/69**
- **Değişmezlik pinleri:** `App.x=554` · `App.x unique (kombine)=718` ·
  `onclick (kombine)=391` · `data=` 9 satır / 11 token
- **Davranış parity:** driver dump `bugun/rapor/ayarlar/hub/profile/reading`
  **6/6 BAYT-EŞİT** (deterministik; `calculateMgNudge` `Math.random` skoru geçici
  tmp sabitlemeyle nötralize edildi — üretim kodu değişmedi)
- **Kanıt zinciri:** `.anti-amnesia/LEDGER.md` seq 0–9 · `MON2-STATE.json` ·
  `deliverables/MON2-DALGA1-KAPANIS.md`

## 10. Seri sınırı

MON2 bu belgeyle kapanır. **Sonraki her adım ayrı bir programdır**: kendi onayı,
state/kanıt zinciri ve bütçesi olmalıdır. `premium-fx-plan/MODULARIZATION.md`
24-modül haritası değişmedi (25. modül `reminderSurface.js` MON2 README §6'da
kayıtlı); `tests/app/test_modularization_boundary.js [7]` hâlâ v2.1/24 assert eder.
Dal `premium-fx-gorsel-yuzey` **LOCAL-ONLY** kalır.
