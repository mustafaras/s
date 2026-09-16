# MON-S8 — syncGlue save gövde aktarımı kararı

**Program:** `MONOLIT-BOLUMLENME`
**Prompt:** `MON-17`
**Tarih:** 2026-09-04
**Durum:** `accepted` — tek yerel commit, `LOCAL-ONLY`
**Öncül:** `MON-16`

## 1. Amaç ve sınır

MON-17, `save(touchSource,eventSpec)` gövdesini sync davranışını değiştirmeden
`app/core/syncGlue.js` içindeki `SeymaSave` registry'sine aldı. `app.js` aynı
imzayı koruyan tek satırlık shim'i, callback atamalarını ve uygulama sahipliğini
korur.

Bu kartta değişmeyen sınırlar:

- `sync.js`, Guard 1/Guard 2, sanitizer gövdesi, callback gövdeleri ve
  `SeyOnSyncState`/`SeyOnSynced` atamaları
- `data`, `ui`, `dark`, import/reset/unlock/late-boot rebind sahipliği
- `sync.schedule` semantiği, çağrı zamanı ve local persistence sırası
- gerçek localStorage, token, remote, `mustafaras/seyma-data`, browser, cihaz,
  push, merge, tag ve deploy

## 2. Canlı locator ve ölçüm

Satırlar canlı kaynakta yeniden ölçüldü; tarihsel worksheet locator'ları
otorite değildir.

| Yüzey | Önce / sonra | Sahiplik |
|---|---:|---|
| `SeyOnSyncState` | `app.js:6118` → `app.js:6134` | app.js callback |
| `SeyOnSynced` | `app.js:6128` → `app.js:6144` | app.js callback |
| `save(touchSource,eventSpec)` | `app.js:6149` gövde → `app.js:6165` shim | app.js shim; syncGlue gövde |
| save registry kaydı | yok → `app.js:4541` | app.js resolver bag'i |
| `SeymaSave.save` gövdesi | getter yüzeyi → `syncGlue.js:39` | syncGlue |
| `window.save` canlı getter | `app.js:4554` → `app.js:4570` | app.js B1 |
| `sync.js` | 1.276 satır | değişmedi |
| `app.js` | 19.048 → 19.037 satır | 27 satırlık gövde çıkarıldı; callback/App yüzeyi korundu |
| `syncGlue.js` | 36 → 76 satır | registry + save gövdesi |

SHA-256 (kart öncesi `HEAD` / kart sonrası canlı kaynak):

```text
app.js before  8feda7eec8e5765a8cb9bea403c95f5f1930c04743281291422553f9edb0c574
app.js after   219e325546f98ac74d12f7f1e032d26528c1df2ddbabe397a550b323834a3270
syncGlue before dd46be47b599934d320668bfeee8768a81b0f96cf956af20e57658b59cb72adb
syncGlue after  5afb61db5be5db77a1ad4e7477d0a9665e469c51c64cb3a85430bb198d2929d2
sync.js        89255c22ecbbae484667abfd47bf5ee8e6d407bcac09d246edc82b5513ecb5d8
index.html     79022853bcc7ad0e9d54a3c17809768194eeb6cd3124c04417e98d111e6f72e4
```

`SeyOnSyncState` ve `SeyOnSynced` canlı gövde blokları önce/sonra eşittir;
app.js callback ataması `2`, syncGlue executable callback ataması `0`,
sync.js callback ataması `0` olarak kaldı. `sync.js` ve Guard hash'i
değişmedi.

## 3. Resolver sözleşmesi

`app.js:4541` tek kayıt noktasında aşağıdaki bağımlılıklar açıkça bağlandı:

```text
data, ui, activeDate, syncDerivedHabits, normalizeSyncReceipt,
appendEvent, mergePersistedReminderState, reminderSyncPayload,
updateHeaderSave, storage, key, sync
```

`data` ve `ui` closure'ı çağrı anında döndüren canlı resolver'lardır;
`storage` ve `sync` de lazy resolver'dır. Böylece reset/import/unlock gibi
rebind'lerden sonra save eski snapshot'a değil güncel app.js bağlamına yazar.
Registry kayıt sırasında DOM, localStorage, ağ veya timer çağrısı yapmaz;
eksik/ikinci kayıt fail-closed reddedilir.

## 4. Korunan save akışı

Registry gövdesinin gerçek sırası aşağıdaki sözleşmeyi korur:

1. Normal/event save'de `ui.saveState='dirty'` ve header güncellemesi.
2. Active day üzerinden derived habit güncellemesi.
3. Receipt normalizasyonu; event append; normal save metadata'sı.
4. Local-only reminder owner merge'i ve canonical `localStorage.setItem`.
5. `reminderSyncPayload(data)` ile sanitizer öncesi privacy projection.
6. Çağrı anında çözülen `SeySync.schedule(syncData)`.

`save(false)` dirty/event/savedAt değişikliklerini atlar; persistence ve
schedule davranışı korunur. Registry save ve app.js shim açık `return`
üretmez; shim'in `return` değeri de JavaScript `undefined` olarak kalır.
`reminderSyncPayload` yalnız resolver olarak bağlandı; sanitizer sınırı ve
`sync.js` içeriği değiştirilmedi.

Bağımsız sentetik resolver-bag kanıtında normal sıra:

```text
updateHeaderSave > activeDate > syncDerivedHabits > normalizeSyncReceipt >
appendEvent > mergePersistedReminderState > localStorage.setItem >
reminderSyncPayload > sync.resolve > schedule
```

Rebind sonrası yeni `data` nesnesinin persist edildiği; `save(false)` için
dirty/event atlandığı; dönüşün `undefined` olduğu ve sync resolver'ın lazy
çözüldüğü aynı VM kanıtında görüldü. Üretim driver'ı ayrıca header save path'ini
ve sonradan bağlanan `SeySync` ile schedule yolunu PASS etti.

## 5. Callback ve yükleme sınırı

Callbackler app.js global ataması olarak bırakıldı; `syncGlue` callback
setter/getter/wrapper kurmadı. `syncGlue` app.js'ten önce yüklenir, app.js
strict-mode IIFE içinde callbackleri atar, `sync.js` app.js'ten sonra yüklenir
ve yalnız callbackleri çağırır. MON-16 strict-mode `TypeError` trap kararı
aynen geçerlidir.

Üretim `index.html` sırası ve cache-bust:

```text
app/core/syncGlue.js?v=20260904a  (index.html:57)
app.js?v=20260904a               (index.html:71)
sync.js?v=20260902a              (index.html:72)
```

Driver/zikr production FILES listeleri zaten syncGlue'ı doğru yerde taşıdığı
için değişmedi. Yeni registry gerektiren eski tam-app VM fixture listeleri
aynı `state → syncGlue → helpers/app.js` sırasına hizalandı; bu test-harness
parite düzeltmesidir, üretim FILES veya runtime sırası değişikliği değildir.
İlk tam preflight'ta eksik listeler yakalandı; üretim kodu, `sync.js` veya
Guard failure'ı oluşmadan fail-closed düzeltildi ve etkilenen fixtureler
yeniden PASS verdi.

## 6. Doğrulama

Kart kapatılmadan önce yalnız Node/VM, sentetik ve no-network kanıt çalıştırıldı:

```text
node --check app.js sync.js app/core/syncGlue.js                 PASS
driver.mjs (save/header + lazy sync path)                        PASS
zikr-harness.mjs                                                 95/95 PASS
verify-state-helper-boundary.mjs                                 0 failures
verify-state-migration-boundary.mjs                              60/60 PASS
verify-state-adapter-contract.mjs                                20/20 PASS
test_state_rebind_boundary.js                                    PASS
test_syncGlue_save_boundary.js                                   19/19 PASS
test_faz10_sync.js                                               69/69 PASS
test_sync_large_file.js                                          15/15 PASS
test_modularization/date-utils/helpers/minus11 boundaries        PASS
tests/app tüm fixtureleri                                         PASS (23)
tests/panel tüm fixtureleri                                       PASS (23)
tests/panel-v2 tüm fixtureleri                                    PASS (27)
tests/quran tüm fixtureleri                                      PASS (9)
run-reminder-smoke.mjs                                           20 curated fixtures PASS
premium fixtures                                                  PASS (8)
git diff --check                                                  PASS
```

İlk preflight'ta görülen fixture yükleme eksikleri düzeltildikten sonra ilgili
reminder boot/acceptance/privacy/concurrency/migration ve zikir fixtureleri
de ayrı ayrı exit `0` verdi. Bu kanıt yerel kaynak/test kabulüdür; deploy,
cihaz veya canlı veri kabulü değildir.

## 7. Kabul ve handoff

MON-17 kabul edildi: save imzası, `undefined` dönüşü, local persistence ve
schedule sırası korunarak gövde syncGlue'a alındı; callback ownership app.js'te
kilitli kaldı; sync.js ve Guard hash'i değişmedi; B1 live resolver/rebind
kanıtlandı. Anti-amnesia state ve ledger bu belgeyle aynı yerel committe
güncellenir.

Sıradaki kart `MON-18` Dalga 4 state+sync kapanışıdır ve yeni açık kullanıcı
onayı olmadan başlatılamaz.
