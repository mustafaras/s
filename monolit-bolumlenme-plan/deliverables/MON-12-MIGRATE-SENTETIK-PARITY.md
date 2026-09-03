# MON-12 — migrate before/after sentetik JSON manifesti

**Tarih:** 2026-09-03
**Durum:** ✅ tamamlandı, LOCAL-ONLY
**Kapsam:** `app/core/state.js`, `app.js` migrate shim'i, migration boundary
fixture'ı ve bu kartın zorunlu anti-amnesia/cache kayıtları.

Bu belge, MON-12'deki gövde aktarımının kaynak sınırını ve sentetik kök
sonuçlarını kaydeder. Gerçek `localStorage`, tarayıcı, ağ, token veya
`mustafaras/seyma-data` kullanılmadı.

## 1. Taşınan gövde ve bağımlılık envanteri

`migrate(d)` gövdesi `app/core/state.js:46-285` içine taşındı. app.js'te
aynı imza korunarak yalnız şu shim kaldı:

```js
function migrate(d){ return window.SeymaState.migrate(d); }
```

Shim, `app.js:4519`; registry kurulumu ve açık dependency bag
`app.js:4477-4502` konumundadır. `registerMigrate()` ikinci kez kayıt kabul
etmez; eksik bağımlılıkta kısmi registry kurulmaz.

| Sınıf | Yardımcılar | Canlı kaynak ipucu |
|---|---|---|
| Migration/domain normalizer | `migrateReminderState`, `normalizeSyncReceipt`, `ensureEventLog`, `ensureSaygiDay`, `migrateZikrV2`, `ensureQuranJourney`, `ensureProfileAssessment`, `ensureTherapyAllDays`, `ensurePrayerDay`, `syncDerivedHabits` | `app.js:99, 1466, 1539, 2354, 4882-4883, 5073, 5179` |
| Root/collection default ve normalizer | `emptyZikrRoot`, `emptySaygiRoot`, `emptyLibrary`/`normBook`, `emptyWatchlist`/`normTitle`, `emptyMusic`/`normTrack`, `emptySoulArchive`/`normSoulItem` | `app.js:300, 488, 700, 5118-5123, 5933-5951` |
| B1 salt-okur / tarih | `todayStr` | `app.js:4646` → `SeymaDateUtils` |
| app.js kabuğunda kalan mutasyon/adaptör | `backfillArchivesFromDays` | `app.js:5955`; `data=d` + `finally{data=savedData}` korunur |
| Açık sabit | `caffeineDefaultBed` | app.js `CAFFEINE_DEFAULT_BED` değerinden bağlanır |

Registry DOM, timer, ağ, `localStorage`, sync veya `data` yeniden bağlama işi
yapmaz. `backfillArchivesFromDays` isimli dependency olarak çağrılır; onun
app.js closure adaptörü ve `try/finally` geri yüklemesi taşınmamıştır.

## 2. Sentetik kök matrisi

Fixture: [verify-state-migration-boundary.mjs](../../.claude/skills/run-seyma/verify-state-migration-boundary.mjs)

Her satırda aynı sentetik input iki bağımsız clone olarak registry ve app.js
shim'ine verildi; snapshot karşılaştırması `stable(JSON)` ile yapıldı.

| Kök | Beklenen sonuç | Sabitlenen kanıt |
|---|---|---|
| legacy `version: 1` | Mevcut migration normalizasyonu, `version: 2` | registry/shim eşit; `legacyRootField` korunuyor |
| normal `version: 2` | Mevcut migration normalizasyonu, `version: 2` | registry/shim eşit; `normalRootField` korunuyor |
| future `version: 3` | fail-closed: aynı nesne döner, nested migration/default/version rewrite yok | registry/shim eşit; root/day unknown alanları ve `settings: null` korunuyor; dependency/ağ çağrısı yok |

Future kontrolü bilinçli olarak sonlu sayısal top-level `version > 2` ile
sınırlıdır; malformed/non-numeric kökler önceki güvenli normalizasyon yolunu
korur. Unknown alanlar legacy/normal köklerde de silinmez.

## 3. Cache-bust ve FILES etkisi

- `index.html`: `app/core/state.js?v=20260903c`, `app.js?v=20260903a`.
- Üretim script sırası değişmedi: state, `app.js`ten önce yüklenir.
- `driver.mjs` ve `zikr-harness.mjs` FILES dizileri zaten state'i doğru
  sırada içerdiği için üretim paritesi korunmuştur.
- Migration fixture'ının FILES dizisi state registry'yi app.js'ten önce
  yükleyecek biçimde güncellendi.
- Shim kaynağını doğrudan eski gövde sanan ilgili headless app/reminder
  fixture'ları state.js'yi aynı yükleme sırasına ekleyecek şekilde güncellendi;
  sync/panel/data fixture'ı değiştirilmedi.

## 4. Değişmezlik ve kapı kanıtı

- `node --check app.js`, `sync.js`, `app/core/state.js`: PASS.
- B1 helper boundary: `0 failures`; B2 migration: `42 passed, 0 failed`;
  B3 adapter: `20 passed, 0 failed`.
- `test_faz10_sync`: `69 geçti, 0 kaldı`.
- `driver.mjs`: PASS; `zikr-harness.mjs`: `95/95 assertion pass`.
- `test_modularization_boundary`: `44/44`.
- App, panel, panel-v2 ve Quran fixture aileleri: PASS.
- Reminder smoke: `20 curated fixtures` PASS.
- `git diff --check`: PASS.

`sync.js`, `sanitize/sync`, schema alanları, App handler yüzeyi, `data`
rebindleri ve gerçek veri deposu bu kartta değiştirilmedi. Bu kanıt yerel ve
başsızdır; deploy, browser/device acceptance veya remote yazımı değildir.
