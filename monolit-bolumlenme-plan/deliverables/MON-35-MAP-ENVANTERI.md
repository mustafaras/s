# MON-35 · Map domain registry

Tarih: 2026-09-10
Dal: `premium-fx-gorsel-yuzey`
Durum: ✅ yerel kapanış; remote/deploy/device kabulü yok

## Karar ve sınır

`app/core/map.js`, harita/konum/hava görünüm ve analiz yardımcılarını
`window.SeymaMap` registry'sinde toplar. Modül yükleme anında salt-okur ve
yan etkisizdir; canlı `data`/`ui`/`dark` değerlerini çağrı anında çözen 23
named dependency ile 16 registry üyesi taşır:

- `locationCardHTML`, konum/live-mode yardımcıları ve hareket görünüm
  projeksiyonu;
- sabit/live weather spot, stale ve hava sunum yardımcıları;
- `weatherHeaderHTML` ve `haritaHTML`.

Bilerek taşınmayan sahiplik:

- `data`/`ui`/`dark` rebind, `migrate`, `getDay`, `save`, `render`, DOM ve
  `App.*` handler/mutation kabuğu app.js'te kaldı.
- `startLocationWatch`, `App.requestLocationGatePermission`, `onLocationFix`,
  `fetchWeather`, `reverseGeocodeLive`, `saveLocal` ve movement sync app.js'te
  kaldı. Map registry hiçbir persistence, network veya permission çağrısı
  yapmaz.
- `sync.js`/Guard, panel, health/settings, data schema ve chart algoritması
  değiştirilmedi.

## Lazy konum/hava sınırı

Persist edilmiş `locationEnabled` değeri artık boot sırasında GPS watcher veya
sessiz permission probe başlatmaz; boot gate `checking` durumunda kalır.
`App.requestLocationGatePermission` açık kullanıcı eylemi olarak mevcut
permission/error akışını sürdürür. Hava kartını açmak (`App.toggleWeather`)
watcher ve stale hava fetch yolunu başlatabilir; foreground dönüşündeki mevcut
watcher yenilemesi korunur. İlk render'da map/weather fetch çağrısı yoktur.

Kod 1/2/3 ve `permission-denied`/`position-unavailable`/`timeout` hata
semantiği ile mevcut Türkçe hata metinleri app.js'te korunmuştur. Gerçek GPS,
hava API'si, tarayıcı permission'ı ve panel davranışı bu kartta çalıştırılmadı.

## Kaynak ve parity kanıtı

- `app/core/map.js`: **336 satır**, **33973 byte**; cold-load taramasında
  storage/DOM/timer/network/geolocation ve executable `data=` yok.
- `app.js`: registry bag'i ve 16 imza-koruyan shim; `CARD_BUILDERS.location`
  yalnız shimden çözülür. Harita render shim'i mevcut `ui.calMonth` başlangıç
  davranışını korur.
- `index.html`: `health → library → report → map → mediaFx`; yeni asset
  `app/core/map.js?v=20260910a`, app cache-bust `app.js?v=20260910c`.
  Aynı `report → map` sırası driver, zikr-harness,
  `test_state_rebind_boundary`, migration B2 ve ilgili app-boot fixture
  FILES listelerinde güncellendi.
- Kaynak sayaçları HEAD/current: App assignment **721/721**, birleşik inline
  `onclick` **216/216** (current app.js 209 + map 7), `SeyAudio`
  **78/78**, `SeyHaptics` **63/63**, `SeyFx` **58/58**. State rebind
  sözleşmesi **9 kaynak satırı / 11 token** olarak kaldı.
- Temiz HEAD arşivi ve current çalışma ağacından `driver.mjs --dump harita`:
  BEFORE/AFTER her biri **29053 UTF-8 byte**, SHA-256
  `f879dcb80ebf7abd2259cb7697388f28126faf0f6ef329ebc2ec7d93c179da9f`;
  `cmp:0`.

## Doğrulama

Başarılı kapılar:

- `node --check app.js`, `node --check sync.js`,
  `node --check app/core/map.js`;
- `node tests/app/test_map_boundary.js` — **14/14**: registry, 23-dependency
  fail-closed kaydı, 16 üye, fixed/live projection, HTML/state immutability,
  app-owned permission/network ve boot-time lazy sınırı;
- `node tests/app/test_local_visual_qa_guard.js` — tüm güvenlik kontrolleri
  PASS;
- `node .claude/skills/run-seyma/driver.mjs --dump harita` — PASS ve yukarıdaki
  byte parity; normal driver — PASS; `zikr-harness` — **95/95**;
- tam `tests/app` ailesi (**42 fixture**) exit 0; B1 helper 0 failure, B2
  **67/67**, B3 **20/20**, state-rebind **37/37**, Faz10 sync **69/69**,
  sync-large **15/15**;
- premium fixture ailesi (**9**), panel (**23**), Panel-v2 (**27**), Quran
  (**9**, transport **207/207**) ve tüm reminder test/smoke ailesi exit 0;
- `git diff --check` — temiz.

Headless Node/VM ve temiz HEAD dump kanıtıdır. Gerçek browser/device, GPS,
weather API, live remote read/write, push, merge, tag, deploy veya
`mustafaras/seyma-data` yazımı yapılmadı. Başarısız kapı yok, blocked yok;
sonraki MON-36 yeni açık kullanıcı yönü gerektirir.
