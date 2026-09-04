# MON-19 — Prayer Function Inventory ve Kapanış Kanıtı

**Program:** `MONOLIT-BOLUMLENME` · **Prompt:** `MON-19` · **Öncül:** `MON-18`
**Tarih:** `2026-09-04` · **Durum:** ✅ Kabul edildi · **Dal:**
`zikirmatik-manuel-zikir` — `LOCAL-ONLY`

## 1. Sonuç

Namaz/vakit yardımcıları `app/core/prayer.js` içindeki load-safe
`window.SeymaPrayer` registry'sine taşındı. `app.js` aynı adları, imzaları ve
dönüş yüzeyini koruyan 25 delegating shim ile kullanmaya devam ediyor. Registry
app.js'teki canlı `data`, `getDay`, tarih, `esc`, `save`, storage ve fetch bağlarını
çağrı anında çözüyor; kayıt sırasında state, localStorage, GPS, timer veya ağ
çağrısı yapmıyor.

MON-19 kabul cümlesi birlikte doğrudur: prayer tek sahipli registryye taşındı;
production/index ve iki ana harness sırası aynıdır; prayer boundary ve tam
regression setleri PASS'tır; I1–I6 ve M1–M4 için ölçülmemiş veya uydurulmuş bir
PASS iddiası bırakılmamıştır.

Bu yalnız yerel kaynak ve sentetik Node/VM kanıtıdır. Gerçek cihaz, browser,
canlı Aladhan/GitHub ağı, `mustafaras/seyma-data` yazımı, push, merge, tag,
deploy ve Pages kabulü yapılmamıştır.

## 2. Yetki, öncül ve sınır

Canlı karar zinciri `UYGULAMA-PROMPTLARI.md` MON-19 kartı/çalışma sayfası;
`MON-S1-DELEGASYON-KARARI.md`, `MON-S3-MODUL-SAHIPLIK-MATRISI.md`,
`MON-S4-HARNESS-PARITE-KARARI.md`, `MON-S5-FIXTURE-GECIS-MATRISI.md` ve
`MON-D4-STATE-SYNC-RAPORU.md` ile `.claude/skills/run-seyma/SKILL.md`'dir.

Bu kart yalnız prayer domain kaynaklarını, yükleme/fixture etkisini ve
anti-amnesia zincirini değiştirdi. Hicri içerik, zikir içeriği, render/App
handler gövdeleri, `sync.js`, Guard 1/2, panel, migration, data fixture'ı,
production network ve gerçek GPS akışı değiştirilmedi. `App.fetchPrayerLocationGPS`
app.js'te kaldı ve modül içine alınmadı.

## 3. Canlı envanter

MON-19 öncesi inventory sorgusu `rg -n 'PRAYER_NAMES|PRAYER_CITIES|fetchAladhan|Prayer|prayer' app.js`
ile doğrulandı. Taşınan sabitler:

| Üye | Canlı sonuç |
|---|---:|
| `PRAYER_NAMES` | 6 isim |
| `PRAYER_ORDER` | 6 sıra anahtarı |
| `PRAYER_CITIES` | 81 şehir; koordinatlar korunur |
| `PRAYER_METHODS` | 9 Aladhan yöntemi |
| prayer fonksiyonları | 25 registry export + 25 app.js shim |

MON-18 HEAD'den çıkarılan dört sabit ifade (`PRAYER_NAMES`, `PRAYER_ORDER`,
`PRAYER_CITIES`, `PRAYER_METHODS`) ile prayer.js karşılaştırması **MATCH**;
şehir koordinatlarında veya yöntem kodlarında sessiz değişiklik yoktur.

Taşınan 25 fonksiyon:

```text
prayerCityByName, prayerCityOptionsHTML, emptyPrayerEntry, emptyPrayerDay,
ensurePrayerDay, prayerSettings, prayerLocation, prayerLocationHash,
prayerMethod, prayerAdjustments, fmtPrayerTime, parsePrayerTime,
prayerCacheKey, prayerReadCache, prayerWriteCache, prayerTimesFromDay,
currentPrayerIndex, fetchAladhanTimes, fetchPrayerTimes,
applyPrayerTimesToDay, prayerDaySummary, prayerPerformedCount, prayerAllDone,
prayerStreak, nextPrayerInfo
```

`fmtPrayerTime` artık görünmez `pad2` closure'ı yerine named `pad` date
resolver'ını kullanır; geçerli saat çıktısı `HH:MM` olarak açıkça aynı
sözleşmede tutulur. Böylece prayer gövdesi app.js closure'ına gizli bağımlı
kalmaz.

## 4. Resolver ve yan etki matrisi

Registry kaydı `app.js:4393-4404` aralığında bir kez yapılır. Bag'in tüm üyeleri
zorunludur; eksik veya ikinci kayıt `false` döner ve app boot fail-closed olur.

| Resolver / yüzey | Sınıf | Kullanım sınırı |
|---|---|---|
| `data`, `getDay` | B1 canlı salt-okur | settings, cache kontrolü ve apply; snapshot tutulmaz |
| `dayIndexFor`, `todayStr`, `addDays`, `pad` | tarih resolverı | ilgili tarih/streak/format çağrısında çözülür |
| `esc` | saf görünüm bağı | yalnız şehir option HTML üretiminde; DOM yazmaz |
| `save` | app.js mutasyon kabuğu | yalnız `applyPrayerTimesToDay` yolunda |
| `storage` | local persistence | yalnız explicit cache read/write zincirinde |
| `fetch` | dış ağ | yalnız explicit `fetchAladhanTimes`/`fetchPrayerTimes` çağrısında |

`PRAYER_DEPENDENCIES` şu 10 adı birebir ilan eder:

```text
data, getDay, dayIndexFor, todayStr, addDays, pad, esc, save, storage, fetch
```

Yan etki yolu yalnız şu çağrı zinciridir:

```text
app.js render veya kullanıcı eylemi
  → app.js prayer shim
  → SeymaPrayer.fetchPrayerTimes / applyPrayerTimesToDay
  → taze cache dönüşü veya explicit fetch + AbortController timeout
  → apply çağrılırsa canlı gün normalizasyonu + app.js save
```

Registry IIFE'si yüklenirken bu zincirin hiçbir alt adımı çalışmaz. GPS,
permission ve `navigator.geolocation` mevcut app.js handler'ında bırakılmıştır.
`sync.js` prayer modülünün FILES listesinde yoktur.

## 5. Kaynak ve shim çıpaları

| Yüzey | Canlı konum |
|---|---|
| Registry IIFE / export | `app/core/prayer.js:1-217` |
| constants | `app/core/prayer.js:11-14` |
| dependency manifest | `app/core/prayer.js:16-27` |
| state/date/side-effect resolverları | `app/core/prayer.js:29-73` |
| fetch/cache gövdeleri | `app/core/prayer.js:115-167` |
| app.js constants aliasları ve 25 shim | `app.js:76-107` |
| prayer resolver bag'i | `app.js:4390-4404` |
| production script | `index.html:59` |
| driver/zikr FILES | `driver.mjs:239-251`, `zikr-harness.mjs:146-158` |

App yüzeyi ve callback/data sahipliği ölçümü:

| Ölçüm | MON-18 HEAD | MON-19 çalışma ağacı | Sonuç |
|---|---:|---:|---|
| app.js satırı | 19.037 | 18.968 | prayer gövdesi dışarı çıktı |
| `App.<name> =` | 715 | 715 | MATCH |
| `App.<name>` referansı | 1.530 | 1.530 | MATCH |
| inline `onclick=` | 462 | 462 | MATCH |
| inline handler özelliği | 459 | 459 | MATCH |
| `SeyAudio` occurrence | 76 | 76 | MATCH |
| `SeyHaptics` occurrence | 63 | 63 | MATCH |
| `SeyFx` occurrence | 6 | 6 | MATCH |
| `SeyTimeTheme` occurrence | 4 | 4 | MATCH |
| prayer wrapper | — | 25 | taşınan export sayısıyla eşit |

State mutasyon kanıtı değişmez: state rebind fixture'ı app.js'te 9 assignment
source-line / 11 token, state.js executable kaynakta 0 `data=` bildirir. Bu
kartta `migrate`, `getDay`, `createDefaultData`, `save`, sync callbackleri veya
data rebind noktaları yeniden sahiplenilmedi.

## 6. Cache-bust ve FILES etkisi

Yeni dosya `helpers.js` sonrasında eklendi:

```text
app/core/helpers.js?v=20260903b
app/core/prayer.js?v=20260904a
app/core/mediaFx.js?v=20260902a
...
app.js?v=20260904b
sync.js?v=20260902a
```

`driver.mjs` ve `zikr-harness.mjs` listelerine aynı konumda eklendi;
`assertLoadOrder` korunarak production prefix ile birebir eşleşir. Prayer için
tam app boot yapan state migration/rebind, ÆON, zikir manuel entry ve reminder
app/boot/acceptance/migration/privacy/concurrency/cross-surface fixture listeleri
de aynı sıraya alındı.

Fixture geçişi MON-S5'in MON-19 için açıkça izin verdiği iki assertionla
sınırlıdır:

- `test_modularization_boundary.js`: [0] beklenen yükleme listesine prayer
  eklendi; [4] eski `existing < 24` plan iddiasından gerçek
  `planlanan N modülden M taşındı` sayacına geçirildi ve prayer registry
  varlığı ayrıca doğrulandı.
- `test_faz_minus11_boundary.js`: F-1 module-expose listesine prayer eklendi.

`tests/app/test_prayer_boundary.js` yeni hedef fixture'ıdır;
`tests/README.md` envanterine eklendi. Başka fixture assertionı eski anlamı
bastırmak için değiştirilmedi.

## 7. No-network / mock fetch-timer kanıtı

Yeni prayer fixture'ı gerçek ağ veya browser kullanmadan şu sonuçları verir:

| Kanıt | Sonuç |
|---|---|
| Registry load-safe expose | PASS |
| yüklemede fetch çağrısı | `0` |
| yüklemede timer çağrısı | `0` |
| yüklemede cache/localStorage çağrısı | `0` |
| eksik/ikinci bag | fail-closed PASS |
| canlı root A → root B rebind | PASS |
| explicit mock fetch + URL/header/credentials | PASS |
| mock AbortController + no-op timer temizliği | PASS |
| cache write ve taze cache hit | PASS |
| apply + save shim + unknown alan koruması | PASS |
| toplam `test_prayer_boundary.js` | **19/19** |

`driver.mjs` ve `zikr-harness.mjs` no-network VM sınırında, fetch'i çözümsüz
Promise ve timerları no-op olarak çalıştırır. Zikr fixture'ının finite mock
provenance senaryoları canlı ağ değildir. `test_faz10_sync.js` sync merge,
sanitize ve Guard 1/2 kaynaklarını ayrı bir mock sınırında doğrular; prayer
taşıması sync yüzeyine dokunmadı.

## 8. Render/dump paritesi

Önce MON-18 HEAD'deki app.js blob'u, sonra MON-19 çalışma ağacındaki app.js
aynı driver VM ve aynı seeded fixture ile boot edildi. `saygi` tabındaki
`<button id="faith-preview-card">…</button>` alt yüzeyi:

```text
old bytes=1582 sha256=a3a5c2c65d7fb74bf4f27dce3920f1802b54229019a0f8cb2ce222159684dcd9
new bytes=1582 sha256=a3a5c2c65d7fb74bf4f27dce3920f1802b54229019a0f8cb2ce222159684dcd9
equal=true
```

Tüm `saygi` HTML'i random içerik nedeniyle byte-stable değildir; değişmezlik
iddiası yalnız prayer'a bağlı ve kimliği sabit preview alt yüzeyi üzerinden
yapılır. Böylece unrelated random içerik farkı prayer paritesi diye sunulmaz.

## 9. Kapı sonucu

Commit öncesi son koşuda aşağıdaki grupların her biri exit 0 verdi:

```text
node --check app.js sync.js app/core/prayer.js app/core/state.js app/core/syncGlue.js  PASS
verify-state-helper-boundary.mjs                                  PASS (0 failures)
verify-state-migration-boundary.mjs                               PASS (60/60)
verify-state-adapter-contract.mjs                                 PASS (20/20)
test_prayer_boundary.js                                           PASS (19/19)
driver.mjs                                                         PASS
zikr-harness.mjs                                                   PASS (95/95)
test_modularization_boundary.js                                    PASS (52/52)
test_faz_minus11_boundary.js                                       PASS (20/20)
test_date_utils_boundary.js                                        PASS (59/59)
test_helpers_boundary.js                                           PASS (31/31)
test_state_rebind_boundary.js                                      PASS (37/37)
test_syncGlue_save_boundary.js                                     PASS (19/19)
test_faz10_sync.js                                                 PASS (69/69)
test_sync_large_file.js                                            PASS (15/15)
premium fixture family                                             PASS (8 fixture files, each exit 0)
all tests/app, tests/panel, tests/panel-v2 and tests/quran families    exit 0
reminder smoke                                                     PASS (20 curated)
git diff --check                                                    PASS
```

Kaynak SHA-256 kanıtı:

| Kaynak | MON-19 sonrası |
|---|---|
| `app.js` | `7a3a2b3a5360e252ac75c2912777ad160e45d12650baa1bbf041869058964006` |
| `app/core/prayer.js` | `95a3051d3704e0a900f76a3a125f43d112c91c43a4451787938202114e16bd87` |
| `index.html` | `581043b54c93a472e8f885c183800f06988afb796d5b2c2be1725f2a896948f5` |
| `sync.js` | `89255c22ecbbae484667abfd47bf5ee8e6d407bcac09d246edc82b5513ecb5d8` |

`sync.js` hash'i MON-17/18 sonrası ile aynıdır; Guard ve sanitizer değişikliği
yoktur. `git diff --check` temizdir.

## 10. Anti-amnesia ve handoff

Aynı yerel commit içinde şu zincir güncellenir:

- `MON-STATE.json`: `lastCompletedPrompt=MON-19`, `nextPrompt=MON-20`,
  Dalga 5 `1/7`, toplam `19/60`, `MON-19` kararı ve prayer boundary kapısı;
- `.anti-amnesia/CURRENT-STATE.md`: canlı prayer locatorları, fixture geçişi,
  no-network sonucu ve yeni MON-20 handoff'u;
- `.anti-amnesia/LEDGER.md`: önceki satırlar korunarak MON-19 satırı sona
  append-only eklenir.

Sıradaki güvenli adım `MON-20 · zikir motor`dur ve ayrı, yeni açık kullanıcı
onayı olmadan başlatılmaz. Bu kartın yerel commit'i push/merge/tag/deploy veya
cihaz kabulü anlamına gelmez.
