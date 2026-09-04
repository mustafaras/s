# MON-D4 — State + SyncGlue Dalga 4 Kapanış Raporu

**Program:** `MONOLIT-BOLUMLENME` · **Prompt:** `MON-18`
**Tarih:** `2026-09-04` · **Öncül:** `MON-17`
**Durum:** ✅ Kabul edildi — kodsuz kapanış, tek yerel commit, `LOCAL-ONLY`

## 1. Sonuç ve kapsam

MON-18, state ve syncGlue çekirdeğinin mevcut aktarımını tek bir no-network
kanıt paketi altında kapatır. Bu kartta üretim JavaScript'i, runtime semantiği
ve fixture kodu değiştirilmedi; yalnız bu rapor ile anti-amnesia durumu ve
append-only ledger güncellendi.

Canlı kaynakta aşağıdaki karar birlikte doğrulandı:

- `migrate`, `getDay` ve `createDefaultData` gövdeleri `app/core/state.js`
  registrylerinde; app.js aynı ad/imza/dönüşü koruyan shimleri taşır.
- `save(touchSource,eventSpec)` gövdesi `app/core/syncGlue.js` içindedir;
  app.js shim'i, callback atamaları ve `sync.js` çağrı yüzeyi yerindedir.
- Her registry açık resolver bag'iyle kayıt olur; eksik veya ikinci kayıt
  fail-closed reddedilir. State registryde mutable `data=` ataması yoktur.
- Headless VM'lerde gerçek ağ yoktur: state/sync kanıtında `fetch` ya hiç
  çağrılmaz ya da çözülmeyen Promise olarak tutulur; timerlar no-op'tur;
  `sync.js` uygulama boot fixture'larına yüklenmez.

Bu sonuç yerel kaynak/headless test kanıtıdır. Canlı sync, gerçek cihaz,
GitHub Pages, push/merge/tag/deploy ve `mustafaras/seyma-data` yazımı bu kartın
kapsamında değildir ve ayrı gatedir.

## 2. Otorite, sınır ve karar zinciri

Bu rapor aşağıdaki canlı sözleşmelerle birlikte okunur:

| Kaynak | MON-18'deki rol |
|---|---|
| `monolit-bolumlenme-plan/UYGULAMA-PROMPTLARI.md` | MON-18 kapsamı, kodsuz kapanış, doğrulama ve halt protokolü |
| `MON-S1-DELEGASYON-KARARI.md` | load-safe registry + app.js imza-koruyan shim |
| `MON-S3-MODUL-SAHIPLIK-MATRISI.md` | `SeymaState` / `SeymaSave` sahipliği ve reverse-dependency yasağı |
| `MON-S4-HARNESS-PARITE-KARARI.md` | index ↔ driver/zikr FILES yükleme paritesi |
| `MON-S5-FIXTURE-GECIS-MATRISI.md` | fixture geçişinin yalnız ilgili semantik değişimde yapılması |
| `MON-S6-STATE-MUTASYON-KARARI.md` | `data` rebind ve app.js kabuğu sahipliği |
| `MON-S7-SYNCGLUE-KARARI.md` | callbacklerin app.js'te kalması |
| `MON-S8-SYNCGLUE-SAVE-KARARI.md` | save gövdesi, resolverlar ve sıra |
| `.claude/skills/run-seyma/SKILL.md` | sentetik Node/VM, no-network ve no-op harness politikası |

Yasaklı yüzeyler: domain, render, App handler gövdeleri, `sync.js`, Guard 1/2,
sanitizer, production network, gerçek localStorage/token, panel, veri ve
browser/device kabulü.

## 3. Canlı kaynak baseline'ı

Kart öncesi ve kart sonrası üretim kaynakları aynı kalacak şekilde canlı ölçüm:

| Kaynak | Satır | SHA-256 | MON-18 etkisi |
|---|---:|---|---|
| `app.js` | 19.037 | `219e325546f98ac74d12f7f1e032d26528c1df2ddbabe397a550b323834a3270` | değişmedi |
| `app/core/state.js` | 498 | `31a8b7dc92321bb51dad4de2f51c0f8207b5613d69382d142acd759479a18e45` | değişmedi |
| `app/core/syncGlue.js` | 76 | `5afb61db5be5db77a1ad4e7477d0a9665e469c51c64cb3a85430bb198d2929d2` | değişmedi |
| `sync.js` | 1.276 | `89255c22ecbbae484667abfd47bf5ee8e6d407bcac09d246edc82b5513ecb5d8` | değişmedi |
| `index.html` | 74 | `79022853bcc7ad0e9d54a3c17809768194eeb6cd3124c04417e98d111e6f72e4` | değişmedi |

Canlı sahiplik çıpaları:

| Yüzey | Registry gövdesi | app.js shim/kayıt | Bağlayıcı sonuç |
|---|---|---|---|
| `migrate(d)` | `state.js:47-285` | kayıt `app.js:4477`; shim `app.js:4571` | state gövdesi + app.js imza koruması |
| `getDay(d,date,idx)` | `state.js:313-453` | kayıt `app.js:4505`; shim `app.js:4892` | verilen root/gün referansı yerinde korunur |
| `createDefaultData()` | `state.js:477-483` | kayıt `app.js:4529`; shim `app.js:6578` | fresh root üretimi registryde, rebind app.js'te |
| `save(touchSource,eventSpec)` | `syncGlue.js:39-70` | kayıt `app.js:4541`; shim `app.js:6165` | local persistence → projection → schedule |
| `window.SeymaState` | `state.js:485-496` | B1 getterlar `app.js:4564-4569` | yalnız canlı okuma; setter/store yok |
| `window.SeymaSave` / `window.save` | `syncGlue.js:72-75` / `app.js:4570` | save kaydı `app.js:4541` | kayıt öncesi undefined, kayıt sonrası canlı save |
| `SeyOnSyncState` / `SeyOnSynced` | — | atama/gövde `app.js:6134/6144` | callback sahibi app.js; syncGlue setter kurmaz |

### 3.1 `data` rebind ve callback envanteri

Yorumlar çıkarılarak yapılan `\bdata\s*=(?!=)` taramasında app.js'te **9
kaynak satırı / 11 token** vardır; state.js executable kodunda **0** atama
vardır. Dokuz app.js satırı şunlardır:

| Satır | Token | Sahiplik |
|---:|---:|---|
| `2772` | 1 | `var data=null`; app.js kapanış kökü |
| `4555` | 2 | localStorage parse ve catch fallback `null` |
| `4556` | 1 | boot migration sonucu |
| `6004` | 2 | archive backfill içindeki geçici `data=d` / `data=savedData` |
| `6583` | 1 | `App.start` default root rebind'i |
| `9250` | 1 | `App.importJson` import rebind'i |
| `9254` | 1 | `App.resetConfirm` reset rebind'i |
| `9280` | 1 | location late-boot default root |
| `18937` | 1 | auth unlock late-boot default root |

`SeyOnSyncState` ve `SeyOnSynced` ataması app.js'te **2**, syncGlue executable
kodunda **0**, sync.js'te **0**; sync.js callback invocation noktası
`sync.js:74` ve `sync.js:1000` olmak üzere **2** adettir. Getter-only callback
trap kurulmadığı için app.js strict-mode boot sınırı korunur.

## 4. State manifesti ve tüm resolver bag'leri

### 4.1 `migrate` — 23 named function + 1 sabit

`state.js:28-35` içindeki `MIGRATE_DEPENDENCIES` ve `app.js:4477-4502`
kaydı birebir aşağıdaki üyelerden oluşur:

```text
migrateReminderState, normalizeSyncReceipt, ensureEventLog,
emptyZikrRoot, migrateZikrV2, ensureSaygiDay, emptySaygiRoot,
ensureQuranJourney, emptyLibrary, normBook, emptyWatchlist, normTitle,
emptyMusic, normTrack, emptySoulArchive, normSoulItem,
backfillArchivesFromDays, todayStr, syncDerivedHabits,
ensureProfileAssessment, dailyPhotoCopy, ensureTherapyAllDays,
ensurePrayerDay, caffeineDefaultBed
```

İlk 23 isim fonksiyon olarak kontrol edilir; `caffeineDefaultBed` boş olmayan
string olarak kontrol edilir. Registry, kayıt olmadan input'u aynen döndürür;
kayıt sonrası `migrate` geçersiz/non-object/array root'u değiştirmez ve numeric
`version > 2` root'u opaque bırakır. Archive backfill'in closure `data` takası
registryye alınmaz; app.js'teki `try/finally` kabuğu korunur.

### 4.2 `getDay` — 17 named function + 2 dizi

`state.js:296-301` içindeki `GET_DAY_DEPENDENCIES`:

```text
emptyHabits, emptyMeals, emptyMealItems, emptyWindDown, emptyPrayerDay,
emptyDiscomfort, emptyMovement, emptyReading, emptyWatching,
emptyListening, emptyLearning, emptyHealth, emptyMagnesium,
emptyTherapy, ensureTherapyDay, ensurePrayerDay, caffeineLastTime
```

Buna ek olarak kayıt bag'i `habits` ve `windDownSteps` dizilerini zorunlu
tutar. Eksik/array olmayan bag reddedilir. Yeni gün yolu `d.days[date]` içine
tek gün şablonunu yazar; var gün yolu aynı gün ve nested referansları koruyup
yalnız eksik/bozuk alanları normalize eder. Unknown gün/root alanları ve
`data` closure'ı kopyalanmaz/rebind edilmez.

### 4.3 `createDefaultData` — 8 named function

`state.js:463-466`, `app.js:4529-4538`:

```text
todayStr, nowIso, emptySyncReceipt, emptyEventLog,
emptyReminderState, emptyLibrary, emptyWatchlist, emptyMusic
```

Kayıt öncesi `createDefaultData()` `null` döndürür; kayıt sonrası her çağrı
fresh root ve nested object üretir. Tarih/ISO üreticileri bag'den gelir;
registry yüklenirken çağrılmaz.

### 4.4 `save` — 11 named resolver + `key` string

`syncGlue.js:23-27`, `app.js:4541-4554`:

```text
data, ui, activeDate, syncDerivedHabits, normalizeSyncReceipt,
appendEvent, mergePersistedReminderState, reminderSyncPayload,
updateHeaderSave, storage, sync
```

Bu 11 üyenin tamamı fonksiyon olarak kontrol edilir; `key` ayrıca boş olmayan
string olarak kontrol edilir. `data`, `ui`, `storage` ve `sync` çağrı anında
çözülen resolverlardır; böylece import/reset/unlock sonrası bayat snapshot
oluşmaz. Registry kaydı DOM, localStorage, ağ veya timer çağırmaz.

Save gövdesinin korunmuş sırası:

1. Normal/event save'de dirty header state'i.
2. Active day üzerinden derived habit güncellemesi.
3. Receipt/event/normal save metadata'sı.
4. Local-only reminder merge ve canonical localStorage yazımı.
5. Reminder-free `reminderSyncPayload(data)` projection'ı.
6. Çağrı anında çözülen `sync.schedule(syncData)`.

`save(false)` dirty/event metadata'sını atlar; persistence ve schedule yolu
korunur. App.js shim ve registry save dönüşü açık bir değer üretmez; dönüş
`undefined` kalır.

## 5. Bağımlılık sınıflandırması ve S1–S8 / I1–I6 / M1–M4 kapıları

| Sınıf | Bu karttaki yüzey | Fail-closed sonucu |
|---|---|---|
| (a) saf üretim | `createDefaultData` root üretimi; tarih ve empty-root bağımlılıkları açık bag'den gelir | explicit bag yoksa kısmi/uydurma root üretimi yok |
| (b) B1 salt-okur | `SeymaState.data/ui/dark` soft getterları; save'in canlı data/ui resolverları | snapshot, setter, writable store veya dış `data=` yok |
| (c) argüman-mutasyonu / app.js kabuğu | `migrate` ve `getDay` verilen rootu yerinde normalize eder; rebind, import/reset/location/auth, archive `try/finally` ve callback atamaları app.js'te kalır | closure `data`'sına geçiş yok; eksik bag ile kısmi işlem yok |
| (d) yan etki | save çağrısındaki storage/header/schedule; sync.js transport | yalnız açık resolver/callback üzerinden; registry yüklemede çalışmaz |

| Kapı | MON-18 kararı ve canlı PASS kanıtı |
|---|---|
| **S1** | Load-safe `window.SeymaState`/`window.SeymaSave` registry + app.js shim deseni korunuyor. |
| **S2** | FX handler manifestine, Premium FX modüllerine ve çağrılarına dokunulmadı. |
| **S3** | `SeymaState` ve `SeymaSave` sahiplikleri yukarıdaki resolver tablosuyla tekilleşti; reverse dependency yok. |
| **S4** | `index.html` üretim sırası ile iki ana harness FILES paritesi değişmedi; `assertLoadOrder` yerinde. |
| **S5** | MON-18 semantik taşımadığı için fixture assertion geçişi yok; eski PASS yeni anlamla karıştırılmadı. |
| **S6** | State mutasyon/rebind kararı app.js'te; state.js executable `data=` sayısı 0. |
| **S7** | Callbackler app.js'te atanır/tanımlanır; syncGlue callback setter/wrapper kurmaz. |
| **S8** | Save gövdesi syncGlue'da; imza, `undefined` dönüş, persistence/projection/schedule sırası korunur. |
| **I1** | Data shape/persistence semantiği ve migrate/getDay/default snapshot parity değişmedi. |
| **I2** | `App` handler yüzeyi ve inline onclick sözleşmesi değişmedi; app.js tek IIFE ve `window.App` sahibi. |
| **I3** | Legacy/normal/future migration parity, getDay referans koruması ve default root hash PASS. |
| **I4** | Render/DOM/modal sahipliği bu kartta değişmedi; driver/zikr smoke PASS. |
| **I5** | `sync.js`, Guard 1/2, sanitizer, gerçek network ve veri deposu değişmedi; no-network kanıtı PASS. |
| **I6** | Bu rapor + anti-amnesia zinciri tek yerel MON-18 commitinde tutulur. |
| **M1** | Registryler yan etkisiz yüklenir; app.js signature-preserving delegate kullanır. |
| **M2** | `data`, `ui`, `dark` ve dokuz app.js data assignment source line app.js'te kalır. |
| **M3** | `SeyOnSyncState`/`SeyOnSynced` assignable app.js global yüzeyidir; syncGlue trap kurmaz. |
| **M4** | Premium FX API ve guarded call site'ları değişmez. |

## 6. Gerçek no-network ve mock fetch/timer kanıtı

Kanıt zinciri aynı davranış iddiasını farklı izolasyonlarda tekrar eder:

| Kanıt | Güvenlik gözlemi | Sonuç |
|---|---|---|
| B1 `verify-state-helper-boundary.mjs` | Extract edilen helper kaynaklarında localStorage/fetch/SeySync/save/data yüzeyi yok; fixture app.js boot etmez. | `0 failures` |
| B2 `verify-state-migration-boundary.mjs` | `fetch()` sayaç artırıp çözülmeyen Promise döndürür; timer/RAF no-op; `sync.js` yüklenmez; yalnız sentetik localStorage kullanılır. | `60/60`, fetch `0` |
| B3 `verify-state-adapter-contract.mjs` | Scratch adapter kaynağında localStorage/fetch/SeySync ve production app/sync importu yok. | `20/20` |
| `test_state_rebind_boundary.js` | VM `fetch` çözülmez, timerlar no-op, `SeySync` yok; rebind/auth/import/reset senaryoları sentetiktir. | `37/37`, fetch `0` |
| `test_syncGlue_save_boundary.js` | Registry yüklemesi fetch/setTimeout/localStorage stub yan etkisini artırmaz; save order için yalnız injected fake storage/sync kullanılır. | `19/19`, side-effect `0` |
| `driver.mjs` | `fetch` çözülmeyen Promise; timeout/interval/RAF no-op; `sync.js` FILES'ta yok. | PASS |
| `zikr-harness.mjs` | Varsayılan boot fetch'i çözülmez ve timerlar no-op'tur. Dış provenance senaryolarındaki yanıtlar açıkça finite mock olarak inject edilir; canlı ağ değildir. | `95/95` |
| `test_faz10_sync.js` | Merge/sanitize/Guard senaryolarında gerçek network yok; fetch çağrılmaması ve Guard 1/2 kaynakları doğrulanır. | `69/69` |

Bu nedenle “network çözülüyor” iddiası yoktur. Çözülmeyen Promise, test
process'ini askıda bırakmamak için callback üretmez; no-op timerlar polling ve
retry döngülerini çalıştırmaz. Injected fake storage yalnız assertion için
memory içi gözlem yüzeyidir ve gerçek kullanıcı localStorage'ı değildir.

## 7. Fixture değişikliği ve geçiş açıklaması

MON-18 çalışma sayfası “izinli değişim: kod yok” der. Bu kartta **fixture
dosyası değişmedi**; dolayısıyla yeni bir semantik iddia eski PASS'ın üzerine
eklenmedi. Kullanılan mevcut kanıt yüzeyleri:

| Fixture / harness | Mevcut sorumluluk | MON-18 durumu |
|---|---|---|
| `verify-state-helper-boundary.mjs` | B1 isolated helper/no-persistence sözleşmesi | çalıştırıldı, değişmedi |
| `verify-state-migration-boundary.mjs` | MON-12/13/14 migration/getDay/default legacy-normal-future parity | çalıştırıldı, `60/60`, değişmedi |
| `verify-state-adapter-contract.mjs` | B3 scratch dependency-bag contract | çalıştırıldı, `20/20`, değişmedi |
| `test_state_rebind_boundary.js` | MON-15 canlı getter, rebind, strict-mode ve state ownership | `37/37`, değişmedi |
| `test_syncGlue_save_boundary.js` | MON-17 save registry, lazy resolver, sıra ve `save(false)` | `19/19`, değişmedi |
| `test_faz10_sync.js` / `test_sync_large_file.js` | sync merge/Guard ve büyük dosya korumaları | `69/69` / `15/15`, değişmedi |
| `driver.mjs` / `zikr-harness.mjs` | gerçek app boot/render smoke; no-network VM | PASS / `95/95`, FILES değişmedi |
| Dört core boundary fixture | index/expose, state/app shim ve FX değişmezleri | `50/50`, `18/18`, `59/59`, `31/31`; değişmedi |

Önceki kart geçişi dürüstçe korunur: MON-17'de eklenen save boundary,
`local persistence → projection → schedule` sırasını kendi injected bag'iyle
ölçer; MON-18 bu fixture'ı “yeniden yazılmış” saymadı. MON-S5 kuralı gereği
fixture ancak o kartın semantiği değişirse aynı committe güncellenebilirdi;
MON-18 yalnız rapor/anti-amnesia kapanışı olduğu için böyle bir izin doğmadı.

## 8. Cache-bust ve production FILES etkisi

Yeni `app/core` dosyası yoktur; `index.html`, driver ve zikr-harness FILES
dizileri değişmemiştir. Üretim sırası ilgili bölümde şöyledir:

```text
app/core/constants.js?v=20260824a
app/core/dateUtils.js?v=20260903b
app/core/state.js?v=20260903e
app/core/syncGlue.js?v=20260904a
app/core/helpers.js?v=20260903b
...
app.js?v=20260904a
sync.js?v=20260902a
```

`sync.js` hiçbir app FILES dizisine eklenmez. Cache-bust değerleri ve
`assertLoadOrder` bu kartta değiştirilmedi; rapordaki kaynak hashleri bunu
ayrıca sabitler.

## 9. Doğrulama paketi

Commit öncesi ve dokümantasyon sonrası aynı kapı paketi yeniden çalıştırıldı;
son kayıt aşağıdaki sonuçları verir:

```text
node --check app.js sync.js app/core/state.js app/core/syncGlue.js  PASS
verify-state-helper-boundary.mjs                                  PASS (0 failures)
verify-state-migration-boundary.mjs                               PASS (60/60)
verify-state-adapter-contract.mjs                                 PASS (20/20)
test_state_rebind_boundary.js                                     PASS (37/37)
test_syncGlue_save_boundary.js                                    PASS (19/19)
test_faz10_sync.js                                                PASS (69/69)
test_sync_large_file.js                                            PASS (15/15)
driver.mjs                                                         PASS
zikr-harness.mjs                                                   PASS (95/95)
test_modularization_boundary.js                                    PASS (50/50)
test_faz_minus11_boundary.js                                       PASS (18/18)
test_date_utils_boundary.js                                        PASS (59/59)
test_helpers_boundary.js                                           PASS (31/31)
premium fixture family                                             PASS (8/8)
panel / panel-v2 / Quran / reminder fixture families                PASS
git diff --check                                                    PASS
```

Browser açılmadı, local server başlatılmadı, gerçek token/profile/localStorage
kullanılmadı, remote veya production network yazımı yapılmadı.

## 10. Kapanış ve açık kalan ayrı kapılar

State + syncGlue çekirdeğinde bu kart için açık, ölçülmemiş veya uydurulmuş bir
PASS iddiası bırakılmadı: tek sahiplik, doğru load order, tüm resolver listesi,
strict-mode sınırı, no-network/no-op davranışı ve hedef suite sonuçları birlikte
kayıt altındadır. Bunun anlamı canlı sync'in başarılı olduğu değildir; canlı
sync ve cihaz kabulü özellikle çalıştırılmamış ayrı kanıtlardır.

Anti-amnesia zinciri aynı yerel committe aşağıdaki üç dosyayla tamamlanır:

- `MON-STATE.json`: `lastCompletedPrompt=MON-18`, `nextPrompt=MON-19`, Dalga 4
  `3/3`, `blockedPrompt=null` ve MON-18 karar kaydı.
- `.anti-amnesia/CURRENT-STATE.md`: canlı locator, resolver manifesti,
  no-network sonucu, fixture/file etkisi ve MON-19 handoff'u.
- `.anti-amnesia/LEDGER.md`: önceki satırlar korunarak yeni MON-18 satırı
  append-only eklenir.

Sıradaki kart `MON-19 · prayer domain modülü`dür ve yeni açık kullanıcı onayı
olmadan başlatılmaz. Push, main merge, tag, Pages deploy, remote veri yazımı
ve browser/device acceptance ayrıca onaylıdır.
