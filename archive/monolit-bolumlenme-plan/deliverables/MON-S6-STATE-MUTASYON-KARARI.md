# MON-S6 — State Mutasyon ve Ownership Kararı

**Kart:** MON-11

**Tarih:** 2026-09-03

**Durum:** Kabul edildi; bu belge kod taşıma izni vermez.
**Kapsam:** `migrate`, `getDay`, `createDefaultData`, `data` rebindleri, B1 canlı getter sınırı.

## Karar özeti

`app.js`, kapanış içindeki `data` bağlamasının tek sahibidir. `window.SeymaState` yalnızca B1 canlı getter üzerinden güncel değeri okuyan bir adaptördür; setter, snapshot, yazılabilir store, olay veriyolu veya `data=` yetkisi değildir. Dış modüller `data`yı yeniden bağlayamaz.

State fonksiyonları ileride taşınacaksa bağımlılıkları açıklaştırılmalıdır; ancak `data` rebindini yapan App/boot kabuğu yerinde kalır. Özellikle arşiv backfillindeki geçici rebind ve `finally` geri yüklemesi app.js sahipliğinde kalacaktır. MON-11 hiçbir üretim kodu, B1 getter veya `migrate()` semantiği değiştirmez.

## Canlı kaynak tabanı

| Kanıt | Canlı konum / ölçüm | Anlamı |
|---|---:|---|
| `app.js` IIFE sonu | 19.203 | State kapanış sahibidir. |
| `data` bildirimi | L2772 | Tek kapanış bağlaması. |
| Yükleme / migration | L4474 / L4475 | Parse/fallback sonrası `data=migrate(data)`. |
| B1 getterlar | L4483–L4489 | `data`, `ui`, `dark`, `migrate`, `getDay`, `createDefaultData`, `save` canlı okunur. |
| `migrate` / `getDay` | L4490 / L5025 | Taşınacak en riskli state yüzeyleri. |
| Geçici rebind | L6140 | Backfill adaptörü; `try/finally` ile geri yükler. |
| Sync callback / `save` | L6270 / L6301 | Kapanış state’i ve sync ilişkisinin kanıtı. |
| `App` / varsayılan veri | L6471 / L6741 | Handler ve başlangıç yüzeyi. |
| Import / reset / location / auth | L9416 / L9420 / L9446 / L19103 | App sahipliğindeki rebind girişleri. |

Canlı taramada dokuz rebind kaynağı vardır: başlangıç bildirimi dahil 11 `data=` tokenı; bildirim hariç 10 yeniden-atama tokenı. Planın eski `6079` etiketi tarihsel satır numarasıdır; aynı davranış canlı kaynakta L6140’tadır.

## Fonksiyon bağımlılık ve mutasyon haritası

| Fonksiyon | Okur | Yazar / mutasyon | Closure ve yan etki ilişkisi | App / çağıran ilişkisi |
|---|---|---|---|---|
| `migrate(d)` | `d` şeması, gün/takvim alanları, content modülleri; dolaylı olarak tarih ve event-device yardımcıları | Aynı `d` nesnesini derinlemesine normalleştirir, `version=2` yapar, aynı kökü döndürür | `migrateReminderState`, event/receipt normalizerları, `ensureSaygiDay`, terapi/habit, zikir, Kur’an, profil, library/watchlist/music yardımcıları; `ensureEventLog`/`eventDeviceId` dolaylı localStorage başlatabilir; `syncDerivedHabits` kapanıştaki hedef/tatil ayarlarını okuyabilir; `backfillArchivesFromDays` geçici `data` bağlaması kullanır | Boot L4475, `App.start` L6749, location gate L9446, auth unlock L19103. `App.importJson` L9416 bilerek migrate çağırmadan ham import atar. |
| `getDay(d,date,idx)` | Verilen `d`, tarih ve habit/day varsayılanları | `d.days[date]` ve eksik iç alanları yerinde oluşturur/normalleştirir; gün kaydını döndürür | `emptyHabits`, `HABITS`, öğün, caffeine, wind-down, discomfort, movement, okuma/izleme/dinleme/öğrenme/sağlık/magnezyum/terapi/namaz yardımcıları | Doğrudan `App` çağırmaz; duygu, alışkanlık, not/öğün, medya, zikir, namaz, öğrenme/sağlık, kriz/günlük, terapi/motivasyon, Kur’an/ÆON ve magnezyum handler grupları bunu kullanır. |
| `createDefaultData()` | `todayStr`, `Date`, boş sync/event/reminder/library/watchlist/music üreticileri | Yeni bir root nesne üretir; kapanış `data`yı kendisi yeniden bağlamaz | `emptyEventLog` üzerinden `eventDeviceId` dolaylı localStorage başlangıcı yapabilir | Yalnız `data=migrate(createDefaultData())` zinciriyle `App.start`, location gate ve auth unlock tarafından kullanılır. |

Bu harita, `migrate`in salt bir saf normalizer olmadığını gösterir: doğrudan DOM/fetch/timer çağırmasa da closure yardımcıları, içerik yüzeyleri, event-device başlangıcı ve L6140 adaptörü vardır. B2’nin 32/32 sentetik parity geçişi bu mevcut davranışı kanıtlar; bağımlılıkları çözmeden taşıma izni vermez.

## Dokuz rebind kaynağı, on rebind tokenı ve M2 / M2prime kararı

| # | Canlı yer | Davranış | Sahiplik kararı |
|---:|---|---|---|
| 1 | L2772 | İlk `var data=null` | app.js kapanışı (M2) |
| 2 | L4474 | Boot parse/fallback ataması | app.js boot (M2) |
| 3 | L4475 | Boot migration sonucu | app.js boot (M2) |
| 4 | L6140 | Backfill için geçici `data=d` | app.js adaptörü (M2) |
| 5 | L6140 `finally` | Kaydedilmiş bağlamayı geri yükleme | app.js adaptörü (M2) |
| 6 | L6749 | `App.start` varsayılan root’u | App handler (M2prime) |
| 7 | L9416 | `App.importJson` ham importu | App handler (M2prime; migrate bypass korunur) |
| 8 | L9420 | `App.resetConfirm` ile `null` | App handler (M2prime) |
| 9 | L9446 | Location gate varsayılan root’u | App handler (M2prime) |
| 10 | L19103 | Auth unlock varsayılan root’u | App handler (M2prime) |

M2: `data`, `ui`, `dark` ve tüm rebindler app.js kapanışı/boot kabuğundadır. M2prime: import, reset ve kilit açma handlerları bu sahipliği dış modüle devretmez. State modülü verilen nesne üzerinde çalışabilir; kapanıştaki `data` adını atayamaz.

## L6079/L6140 `finally` davranış kanıtı

Tarihsel çalışma kartının `6079` referansı, bugünkü kaynakta L6140’taki aşağıdaki davranışa karşılık gelir:

```js
var savedData=data;
try {
  data=d;
  // archive backfill, normal dönüş veya hata
} finally {
  data=savedData;
}
```

Örnek A: çağrı öncesi kapanış `data=A`, parametre `d=B` ise backfill yardımcıları çalışırken `data=B` görür; normal dönüşten önce `finally` `data=A`yı geri yükler. Örnek B: yardımcı erken döner veya hata atarsa da `finally` çalışır ve çağrı tamamlandıktan sonra B1 getter tekrar `A`yı verir. Bu nedenle geçici rebind dış modüle taşınamaz; `finally` kaldırmak ya da yazılabilir registry ile ikame etmek M2’yi bozar ve hata yolunda yanlış root’un kalmasına neden olur.

## Registry seçenekleri

| Seçenek | Karar | Gerekçe |
|---|---|---|
| B1 canlı-okuma getter registry (`SeymaState`) | **Kabul** | Rebind sonrası her okumada güncel closure değeri çözülür; mevcut B1 sınırı korunur. |
| Snapshot nesne / bir-seferlik referans | Reddedildi | Reset, import ve kilit açmadan sonra eski root’a işaret eder. |
| Setter, `setData`, yazılabilir store veya dış `data=` | **Kesin yasak** | M2/M2prime’i ihlal eder; rebind sahipliği App/boot’tan çıkar. |
| Geniş, gizli dependency bag veya event bus | Reddedildi | Sahiplik ve çağrı sırası görünmez olur; MON-S1’in dar/açık bağımlılık ilkesiyle çelişir. |
| Dar, çağrı-başına açık dependency resolver | Koşullu gelecek seçenek | Yalnız her bağımlılık isimli, testli ve app.js shim’inden sağlanırsa; B3 scratch sözleşmesi üretim grafiğine alma izni değildir. |
| Dış modülün geçici rebind yapması | Reddedildi | L6140 `try/finally` app.js adapteri olarak kalmalıdır. |

Sonuç: `SeymaState` yalnız canlı getter okur. Registry, mutasyon komutu veya sahiplik transferi değildir; hiçbir dış modül `data=` yazmaz.

## MON-12 için sınır ve halt koşulu

MON-12, ancak `migrate` yardımcısı başına owner, giriş/çıkış, closure etkisi ve test kanıtını açıkça bağladıktan sonra başlayabilir. `migrate(d)` imzası, dönüş değeri, hata sırası, import bypassı ve app.js rebindleri korunacaktır. L6140 davranışı app.js adapterinde kalır veya aynı `try/finally` garantisini app.js sahipliğinde ispatlayan ayrı bir karar olmadan taşınmaz.

Herhangi bir migrate bağımlılığı için sahip/çağrı düzeni çözülemezse, B2 parity düşerse, dış modülde `data=` sızıntısı oluşursa veya B1 canlı getter semantiği değişirse çalışma **blocked** olur; eksik kanıt append-only LEDGER’a yazılır ve kullanıcı yönü olmadan sonraki karta geçilmez.

## MON-11 doğrulama ve dosya etkisi

| Kanıt | Sonuç |
|---|---|
| `verify-state-helper-boundary.mjs` (B1) | PASS — 0 failure |
| `verify-state-migration-boundary.mjs` (B2) | PASS — 32/32 |
| `verify-state-adapter-contract.mjs` (B3) | PASS — 20/20 |
| `test_faz10_sync.js` | PASS |
| `driver.mjs` / `zikr-harness.mjs` | PASS / PASS |
| S1–S8, I1–I6, M1–M4 tam yerel kapı seti | PASS |

Bu kart yalnız plan kaynaklarını değiştirdi. `app.js`, `app/core/state.js`, `index.html`, script sırası, cache-bust değerleri, FILES manifestleri ve üretim varlıkları değişmedi: **cache-bust etkisi yok; FILES etkisi yok.**
