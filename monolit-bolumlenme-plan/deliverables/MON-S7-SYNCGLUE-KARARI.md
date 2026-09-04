# MON-S7 — syncGlue callback sahipliği kararı

**Program:** `MONOLIT-BOLUMLENME`
**Prompt:** `MON-16`
**Tarih:** 2026-09-04
**Durum:** `accepted`
**Öncül:** `MON-15`

## 1. Amaç ve kapsam

MON-16, sync köprüsünün strict-mode yükleme sırasını ve sahiplik sınırını
karara bağlar. Bu kartta üretim gövdesi taşınmadı; yalnızca canlı kaynak
envanteri, bağımlılık/çağrı akışı, strict-mode riski ve sonraki karta bağlayıcı
karar kaydedildi.

Kapsam dışı bırakılanlar:

- `sync.js`, Guard 1/Guard 2, remote, token ve gerçek localStorage değişikliği
- `save()` gövdesinin taşınması; bu `MON-17` kapsamıdır
- `SeyOnSyncState` veya `SeyOnSynced` gövdesinin taşınması
- browser, gerçek cihaz, `mustafaras/seyma-data`, push, merge, tag ve deploy

## 2. Canlı baseline ve satır drift’i

MON-16 kartındaki `save 6271` satır ipucu tarihsel kalmıştır. Canlı kaynakta
aynı yüzeyler aşağıdaki konumdadır; satırlar yalnız locator’dır ve her kartta
yeniden ölçülmelidir.

| Yüzey | Canlı konum | Sahip |
|---|---:|---|
| `window.SeyOnSyncState` ataması | `app.js:6118` | app.js |
| `window.SeyOnSynced` ataması | `app.js:6128` | app.js |
| `save(touchSource,eventSpec)` | `app.js:6149` | app.js; MON-17’ye kadar |
| `window.save` canlı getter’ı | `app.js:4554` | app.js B1 |
| `SeymaSave` getter tanımı | `app/core/syncGlue.js:32-35` | syncGlue |
| `localReceipt` | `sync.js:67-75` | sync.js çağırıcı |
| `doPush` / `doPushInner` | `sync.js:975-1014` | sync.js çağırıcı |
| `SeySync.schedule` / `pushNow` | `sync.js:1225-1226` | sync.js çağırıcı |
| `SeySync.retryIfPending` | `sync.js:1267` | sync.js çağırıcı |
| online retry listener | `sync.js:1273` | sync.js |
| foreground retry watchdog | `app.js:17498-17508` | app.js çağırıcı |

Yükleme sırası `index.html` içinde `syncGlue` (`:57`) → `app.js` (`:71`) →
`sync.js` (`:72`) şeklindedir. `syncGlue` app.js’ten önce yüklenir; sync.js
app.js’ten sonra yüklenir.

## 3. Sahiplik kararı

### Kabul edilen karar

`SeyOnSyncState` ve `SeyOnSynced` callback gövdeleri app.js’te kalır.
`syncGlue` yalnızca mevcut `SeymaSave` canlı getter yüzeyini taşır; callback
registry’si, callback setter’ı veya callback wrapper’ı kurmaz. `MON-17`, bu
kararı koruyarak yalnız `save()` gövdesini taşıyabilir.

| Aday | Karar | Gerekçe |
|---|---|---|
| `SeyOnSyncState` | app.js sahibi | `data`/`ui` closure’ı, receipt normalizasyonu, localStorage, DOM ve render kullanır |
| `SeyOnSynced` | app.js sahibi | `data`/`ui`, tarih, timer, toast, localStorage, header ve render kullanır |
| `save()` | MON-17’ye kadar app.js sahibi | closure state, active date, event/reminder persistence ve `SeySync.schedule` sırasına bağlıdır |
| `SeymaSave` | syncGlue canlı getter | app.js’in daha sonra expose ettiği `window.save` değerini snapshot almadan okur |
| `sync.js` | çağırıcı/transport sahibi | callbackleri yalnızca guarded invocation olarak çağırır; uygulama callbackini tanımlamaz |

Reddedilen seçenekler:

1. Callback gövdelerini syncGlue’a taşımak: closure, DOM, timer ve persistence
   bağımlılıklarını registry’ye sokar; load-safe sınırı bozar.
2. `SeyOnSyncState`/`SeyOnSynced` için syncGlue’da getter-only slot açmak:
   syncGlue app.js’ten önce yüklendiği için app.js’in strict-mode global
   ataması `TypeError` ile boot’u kırar.
3. Callbackleri sync.js’e taşımak: uygulama UI/state sahipliğini transport
   katmanına geçirir ve I5/M3 sınırını bozar.

## 4. Callback ve save akışı

### Başlangıç

1. syncGlue, yalnız `window.SeymaSave` getter’ını tanımlar.
2. app.js, `window.SeyOnSyncState` ve `window.SeyOnSynced` fonksiyonlarını
   atar; callbackler closure’daki güncel `data` ve `ui` değerlerini okur.
3. app.js, `window.save` canlı getter’ını expose eder.
4. sync.js daha sonra yüklenir; callbackleri tanımlamaz, yalnız çağırır.

### `save()`

`app.js:6149` akışı sırasıyla:

1. kullanıcı değişikliğinde header state’i dirty yapar;
2. active date ve `data.days` üzerinden derived habit güncellemesini dener;
3. receipt/event/reminder persistence hazırlığını yapar;
4. canonical `data`yı localStorage’a yazar;
5. reminder-free projection üretir;
6. `window.SeySync.schedule(syncData)` çağrısını yapar.

Bu gövde saf değildir. `data`, `ui`, `activeDate`, `syncDerivedHabits`,
`normalizeSyncReceipt`, `appendEvent`, `mergePersistedReminderState`,
localStorage, reminder projection ve `SeySync.schedule` bağımlılıkları vardır.

### Sync callback sırası

| Olay | sync.js işlemi | Callback sonucu |
|---|---|---|
| schedule | `localReceipt(... queued)` | `SeyOnSyncState` receipt/UI/local state’i günceller |
| debounce sonrası push | `localReceipt(... saving)` | `SeyOnSyncState` receipt/UI/local state’i günceller |
| başarılı push | `localReceipt(receipt)` ardından `SeyOnSynced(receipt)` | accepted receipt, notification/QA sync işaretleri, header ve render güncellenir |
| hata/conflict/anti-clobber | failure receipt ardından `localReceipt(... error)` | `SeyOnSyncState` hata state’ini gösterir; `SeyOnSynced` çağrılmaz |
| retry | `localReceipt(... retrying)`, 500 ms timer | `SeyOnSyncState` retry state’ini gösterir; normal push zinciri devam eder |

`localReceipt` callbacki `sync.js:74`te; başarılı kabul callbacki
`sync.js:1000`de çağırır. Callbacklerin çağrılmaması transport akışını
çökertmez; çağrıların `try/catch` sınırı sync.js’te korunur. Callbacklerin
varlığı ise uygulamanın receipt/UI yansımasını canlı tutar.

## 5. Retry etkisi ve sahiplik değişmezliği

`SeySync.retryIfPending` yalnızca bekleyen payload ve yapılandırılmış sync
durumunda çalışır; retry receipt’ini yazar, mevcut timer’ı temizler ve 500 ms
sonra aynı `doPush` zincirini çağırır. `sync.js` online listener’ı bunu
`online` olayında tetikler. Sekme hiç arka plana alınmadan açık kalırsa
app.js’in `maybeRetrySync` watchdog’u `pollRemote` içinden en fazla 5 dakikalık
throttle ile aynı retry API’sini çağırır.

Bu ek tetikleyiciler yeni callback sahibi oluşturmaz. Tek-uçuş koruması
`doPush` içinde `inFlight`/`rerunPending` ile korunur; retry, callbacklerin
yalnızca yeni receipt geçişlerini almasına neden olur. Guard 1/2 ve retry
semantiği sync.js’te kalır.

## 6. Strict-mode kanıtı

`syncGlue` app.js’ten önce yüklendiği için aşağıdaki sahte tasarım güvenli
değildir:

```js
Object.defineProperty(window, 'SeyOnSynced', { get: function(){ return fn; } });
// app.js strict-mode içinde:
window.SeyOnSynced = function(receipt) {};
// sonuç: TypeError
```

VM-local sentetik probe’da getter-only callback property’sine strict-mode
ataması `TypeError` verdi. Canlı kaynakta ise syncGlue callback property’si
tanımlamaz; bu yüzden app.js ataması boot sırasında güvenlidir.

Buna karşılık `SeymaSave` yeni bir property adıdır. syncGlue’daki getter
`window.save` değerini çağrı anında okur; app.js’in daha sonra kurduğu canlı
getter ile çakışmaz ve save snapshot’ı tutmaz.

## 7. Değişmezlik ölçümleri

MON-16 kod taşıma kartı değildir. Uygulama öncesi ve sonrası canlı ölçümde
değişmez kalanlar:

| Ölçüm | Sonuç |
|---|---:|
| app.js callback ataması | 2 |
| syncGlue executable callback ataması | 0 |
| sync.js callback ataması | 0 |
| sync.js callback invocation yüzeyi | 2 (`localReceipt`, accepted) |
| `app.js` | 19.048 satır |
| `syncGlue.js` | 36 satır |
| `sync.js` | 1.276 satır |
| index/app.js/sync.js cache-bust ve FILES | değişmedi |

Kaynak SHA-256 kanıtı:

```text
app.js                         8feda7eec8e5765a8cb9bea403c95f5f1930c04743281291422553f9edb0c574
app/core/syncGlue.js           dd46be47b599934d320668bfeee8768a81b0f96cf956af20e57658b59cb72adb
sync.js                        89255c22ecbbae484667abfd47bf5ee8e6d407bcac09d246edc82b5513ecb5d8
index.html                     312ba0c8173947bc5d032c3cd1923226297feade9d6bd4e5205e32018f47fd56
```

## 8. Doğrulama ve kabul

MON-16 için canlı kaynak ve güvenli headless kapıları:

```text
node tests/app/test_faz10_sync.js                    69/69 PASS
node --check app.js                                  PASS
node --check sync.js                                 PASS
node .claude/skills/run-seyma/driver.mjs             PASS
node .claude/skills/run-seyma/zikr-harness.mjs       95/95 PASS
node tests/app/test_modularization_boundary.js       47/47 PASS
node tests/app/test_faz_minus11_boundary.js          18/18 PASS
node tests/app/test_date_utils_boundary.js           58/58 PASS
node tests/app/test_helpers_boundary.js              30/30 PASS
node tests/app/test_state_rebind_boundary.js         37/37 PASS
node tests/panel/test_faz11_panel.js                 50/50 PASS
for f in tests/app/test_premium_*.js; do node "$f"; done 59/59 PASS
node tests/reminders/run-reminder-smoke.mjs          20/20 PASS
```

Ek olarak tüm `tests/app`, `tests/panel`, `tests/panel-v2` ve `tests/quran`
fixture aileleri exit 0 verdi. `git diff --check` PASS; browser, remote,
token, gerçek localStorage ve veri deposu yazımı yoktur.

Kabul dört koşulla sağlanmıştır:

1. Callbacklerin tek sahibi app.js’tir.
2. Yükleme sırası callback atamasını strict-mode’da güvenli bırakır.
3. Sync ve retry hedef suite’leri PASS’tir.
4. I1–I6 ve M1–M4 içinde MON-16 nedeniyle davranış farkı yoktur.

## 9. Handoff

MON-16 kabul edilmiştir. Callback sahipliği app.js’te kilitli, syncGlue
callback registry’si yasaklı ve `SeymaSave` canlı getter sınırı korunmuştur.
Sıradaki kart `MON-17` — save gövde aktarımıdır; yeni açık kullanıcı onayı
olmadan başlatılmaz.
