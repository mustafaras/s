# MON-S3 — 24 Modül Sahiplik ve Yükleme Matrisi

**Program:** `MONOLIT-BOLUMLENME` · **Prompt:** `MON-03` · **Tarih:** 2026-09-02
**Tür:** Sahiplik/bağımlılık kararı (kod taşıma yok) · **Dal:** `zikirmatik-manuel-zikir` — LOCAL-ONLY
**Öncüller:** MON-01 (shim kararı) · MON-02 (FX/App manifesti) · **Sınıf:** yapılandırma

## 1. Kaynaklar ve envanter kanıtı

- Hedef 24'lük liste: `premium-fx-plan/MODULARIZATION.md` §2.1 (satır 32–55).
- Üretim index sırası: `index.html` 43–53 (content), 54–64 (core), 70–72
  (coverage → app.js → sync.js). Yeni core satırları **64. satırdan sonra,
  70'ten önce** (reminderDelivery ile inline SW arasına) eklenir.
- Canlı yoğunluk: `reminder*` 374 function/202 App, `zikr*` 72/19,
  `quran*` 85/39 (canlı grep, 2026-09-02).
- B1 registry iskeleti canlı: `SeymaState` (`app/core/state.js`),
  `SeymaDateUtils` (`dateUtils.js`), `SeymaHelpers` (`helpers.js`),
  `SeymaSave` (`syncGlue.js`) — app.js bugün 0 doğrudan tüketim.

## 2. Etiket sözlüğü

| Etiket | Anlamı |
|---|---|
| **KORU** | Modül zaten var ve sahibidir; yalnız API/load-safe korunur, gövde taşınmaz. |
| **YENİ** | Dosya henüz yok; gövde app.js'ten sonraki dalgalarda taşınıp IIFE registry kurulur. |
| **SHIM** | Registry kurulduktan sonra app.js'te imza-koruyan delege (`return window.SeymaX.f.apply(null,arguments)`) bırakılır. |

**Registry erişimi (M1):** her YENİ hedef tek `window.Seyma<Module>` registry'si
kurar; app.js shim'i aynı ad/imza/return ile delege eder. İki modül aynı
fonksiyon adını sahiplenemez; iki sahip tespit edilirse prompt halt (§7).

## 3. Sahiplik matrisi — 24 hedef + frozen reminder dörtlüsü

| # | Modül (dosya) | Etiket | Registry adı | Bağımlılıklar (okuma yönü) | Dalga / kart | Forbidden reverse dependency | Index ekleme noktası |
|---|---|---|---|---|---|---|---|
| 1 | `app/core/constants.js` | KORU | `window.SeymaConstants` (mevcut) | — | — / FX-P-01 | constants'ı kimse değiştiremez; alt modüller constants'tan okur | 54 (mevcut) |
| 2 | `app/core/dateUtils.js` | KORU→genişlet | `window.SeymaDateUtils` | constants, `SeymaState` (guard'lı) | 2 / MON-07..09 | dateUtils helpers'a/state'e yazamaz | 55 (mevcut) |
| 3 | `app/core/state.js` | YENİ (iskelet var) | `window.SeymaState` | constants, dateUtils | 3 / MON-11..15 | state, helpers/save/callback'lere yazamaz; `data=` yazması yasak (M2) | 56 (mevcut) |
| 4 | `app/core/helpers.js` | KORU→genişlet | `window.SeymaHelpers` | constants, `SeymaState`, `SeymaDateUtils` | 2 / MON-10 | helpers, state rebind'ine dokunamaz | 58 (mevcut) |
| 5 | `app/core/mediaFx.js` | KORU | `window.SeyAudio/SeyHaptics/SeyFx` (mevcut) | constants, DOM/SesAPI | — / FX tamam | MON-S2 §5: hiçbir registry FX modüllerini yeniden tanımlayamaz/sarmalayamaz | 59 (mevcut) |
| 6 | `app/core/timeTheme.js` | KORU | `window.SeyTimeTheme` (mevcut) | constants | — / FX tamam | timeTheme, FX modüllerine yazamaz | 60 (mevcut) |
| 7 | `app/core/prayer.js` | YENİ | `window.SeymaPrayer` | constants, dateUtils, `SeymaState` | 5 / MON-19..21 | prayer, settings'e yazamaz; vakit cache modül-özel | helper.js sonrası, core bloğunun ilki |
| 8 | `app/core/zikir.js` | YENİ | `window.SeymaZikr` | constants, dateUtils, state, helpers, zikirCoreContentV1 | 5 / MON-22..25 | zikir, sync union matematiğine (V5) dokunamaz (I5) | prayer'dan sonra |
| 9 | `app/core/quran.js` | YENİ | `window.SeymaQuran` | constants, state, helpers, quranTransportV1/Revelation/Verses | 5 / MON-22..25 | quran, transport dosyalarına yazamaz; outbox/delivery salt akış | prayer/zikir'den sonra |
| 10 | `app/core/saygi.js` | YENİ | `window.SeymaSaygi` | constants, state, helpers, prayer, library, saygiPeople | 5 / MON-19..21 | saygi, prayer cache'ine yazamaz | prayer'dan sonra |
| 11 | `app/core/motivation.js` | YENİ | `window.SeymaMotivation` | constants, state, helpers, MotivationProgramV2 | 6 / MON-26..28 | motivation, profileAssessment'a yazamaz | domain bloğu |
| 12 | `app/core/crisis.js` | YENİ | `window.SeymaCrisis` | constants, state, helpers | 6 / MON-26..28 | crisis, settings'e yazamaz | domain bloğu |
| 13 | `app/core/journal.js` | YENİ | `window.SeymaJournal` | constants, state, helpers | 6 / MON-26..28 | journal, crisis'e yazamaz | domain bloğu |
| 14 | `app/core/health.js` | YENİ | `window.SeymaHealth` | constants, state, helpers, dateUtils | 6 / MON-26..28 | health, report hesaplarına yazamaz | domain bloğu |
| 15 | `app/core/library.js` | YENİ | `window.SeymaLibrary` | constants, state, helpers | 7 / MON-29..30 | library, saygi/quran hesaplarına yazamaz | domain bloğu |
| 16 | `app/core/report.js` | YENİ | `window.SeymaReport` | constants, state, helpers, dateUtils | 7 / MON-29..31 | report, day kayıtlarına yazamaz (salt-okur B1) | domain bloğu |
| 17 | `app/core/map.js` | YENİ | `window.SeymaMap` | constants, state, helpers | 7 / MON-29..31 | map, geolocation iznini resetlemez | domain bloğu |
| 18 | `app/core/profile.js` | YENİ | `window.SeymaProfile` | constants, state, helpers, profileAssessmentV1 | 7 / MON-32..33 | profile, assessment içeriğini (versioned) düzenleyemez | domain bloğu |
| 19 | `app/core/settings.js` | YENİ | `window.SeymaSettings` | constants, state, helpers | 7 / MON-33..35 | settings, secret alanlarını (`ghToken` vb.) yazamaz/dışa yazamaz (I5) | domain bloğu |
| 20 | `app/core/reminders.js` | YENİ | `window.SeymaReminderUI` | constants, state, helpers, Reminder dörtlüsü | 8 / MON-40..41 | reminderUI, frozen motorlara yazamaz; yalnız okur | reminderDelivery'den sonra |
| 21 | `app/core/syncGlue.js` | KORU→genişlet | `window.SeymaSave` | state | 4 / MON-16..18 | **M3:** `SeyOnSyncState/SeyOnSynced` app.js sahipliğinde kalır; syncGlue getter-only tuzak kuramaz | 57 (mevcut) |
| 22 | `app/core/messaging.js` | YENİ | `window.SeymaMessaging` | constants, state, helpers | 8 / MON-42..43 | messaging, panel dosyalarına (observer-inbox/outbox) yazamaz | domain bloğu sonu |
| 23 | `app/core/render.js` | YENİ | `window.SeymaRender` | hepsi (yukarıdakiler) | 9 / MON-44..49 | render, App handler yüzeyine yazamaz; onclick dizgisi üretir (I2/I4) | app.js'ten hemen önce |
| 24 | `app/core/appSurface.js` | YENİ | `window.SeymaAppSurface` | hepsi + render | 10 / MON-50..54 | appSurface, `data` rebind'ine dokunamaz (M2/M2prime); `window.App=App` app.js'te kalır | app.js'ten hemen önce, render.js'ten sonra |

### 3b. Frozen reminder dörtlüsü — KORU (matris dışı ama yükleme sırasında sabit)

| Dosya | Registry | Kural |
|---|---|---|
| `app/core/reminderCatalog.js` | `window.ReminderCatalogV1` | Frozen; gövde taşınmaz, ad/imza korunur (app.js 10 doğrudan referans). |
| `app/core/reminderEngine.js` | `window.ReminderEngineV1` | Frozen; yalnız salt-okur tüketim. |
| `app/core/reminderScheduler.js` | `window.ReminderSchedulerV1` | Frozen; timer sahipliği modül içi kalır. |
| `app/core/reminderDelivery.js` | `window.ReminderDeliveryV1` | Frozen; bildirim kanalı ayrıklığı fixture'larla korunur. |

## 4. Yükleme sırası ve index sözleşmesi

1. Mevcut sıra **değişmez**: content (43–53) → constants → dateUtils → state →
   syncGlue → helpers → mediaFx → timeTheme → reminder×4 (54–64).
2. Yeni YENİ modüller **yalnız 64. satırdan sonra, 70. satırdan (coverage
   manifest) önce** eklenir; her dosya kendi cache-bust `?v=` değerini taşır.
3. Registry yalnız kendi üyelerini kurar: yükleme anında DOM sorgusu, `fetch`,
   `setTimeout`, listener, localStorage okuma/yazma yasaktır (MON-S1 §5.4).
4. `app.js` her YENİ registry'den sonra yüklenir; shim'ler ilk çağrıda
   `window.Seyma<Module>`i çözer; registry yoksa app.js shim'i davranışı
   değiştirmez — fail-closed olarak mevcut gövde app.js'te kalır.
5. `sync.js` son kalır (72); hiçbir modül `sync.js`'i import edemez (I5).

**Forbidden reverse dependency özeti:** hiçbir `app/core/*` modülü
(a) `sync.js`'e, (b) `app.js`'in `data/ui/dark` rebind'lerine, (c) `panel/*`
dosyalarına, (d) kendisinden index'te sonra yüklenen bir core modülüne
yazma bağımlılığı kuramaz. Okuma yönü her zaman "önce yüklenen → sonra
yüklenen"dir; cycle = prompt halt.

## 5. Bağımlılık sınıflaması ve taşıma sınırı

Her YENİ hedef için taşınabilirlik etiketi (MON-S1 karar ağacıyla uyumlu):

- **(a) saf** — yalnız argümanları kullanır: `dateUtils` yardımcıları,
  `report` hesaplayıcıları, `zikrManual*` serbest fonksiyonları (MON-02 §2).
- **(b) B1 salt-okur** — `SeymaState.data/ui` okur, yazmaz.
- **(c) app.js kabuğunda kalır** — mutasyon/rebind/App handler: import/reset/
  unlock/late-boot `data=`, 6079→6138 geçici takası, `SeyOnSync*` atamaları,
  `save()` callback kaydı (M2/M2prime/M3).
- **(d) DOM/timer/ağ yan etkisi** — taşıma öncesi ayrı envanter; medya/moda
  overlay'lerinde sık. Bu etiketli gövde yalnız açık resolver kanıtıyla taşınır.

## 6. Cache-bust / FILES etkisi (bu kart için)

Bu kart **kod taşımaz**: yeni `app/core/*` dosyası yok, index script satırı
eklenmez, cache-bust değişmez, driver/zikr-harness FILES güncellenmez.
Matris, gelecek her taşıma kartının index/FILES etkisini §4 ile ölçer.

## 7. Doğrulama ve kabul

- Matris **24 benzersiz hedef** içerir (yukarıdaki tablo; reminders dahil,
  timeTheme MODULARIZATION.md'nin eski tablosunda 24. satırda tekrarlanmıştı —
  bu matris v2.1 tabloyu kaynak alır ve tekrarı eler).
- Index core sırası (54–64) kaynakla karşılaştırıldı: birebir.
- Tek fonksiyonun iki sahibi yok; M1–M4 çelişkisi yok (M3 syncGlue satırı
  ve MON-S2 FX yasağı açıkça işlendi).
- `git diff --check` PASS; bu prompt üretim kodu değiştirmez.

## 8. Halt koşulları

Çift sahiplik, cycle veya bir hedefin M1–M4 ile çelişmesi çözülemezse
`MON-S3` güncellenmeden ilerleme yok; LEDGER'a kanıt yazılır ve state
`blocked` yapılır. Bu kartta halt tetiklenmedi.

## 9. Sonraki kart

`MON-04 · Harness üretim yükleme-paritesi` — yeni açık kullanıcı onayı ile.