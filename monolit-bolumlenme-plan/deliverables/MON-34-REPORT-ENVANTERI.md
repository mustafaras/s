# MON-34 · Report domain registry

Tarih: 2026-09-10
Dal: `premium-fx-gorsel-yuzey`
Durum: ✅ yerel kapanış adayı; remote/deploy/device kabulü yok

## Karar ve sınır

`app/core/report.js`, rapor/istatistik/heatmap üreticilerini `window.SeymaReport`
registry'sinde toplar. `lastNDays`, mood dağılımı, trend/KPI kartları, aylık
özet, korelasyon içgörüleri, rozetler, hareket/adım özetleri, mood heatmap ve
`raporHTML` dahil 16 üye 29 named resolver dependency bag'i üzerinden canlı
state'i yalnız okur.

Bilerek taşınmayan sahiplik:

- `data`/`ui`/`dark` rebind, `migrate`, `getDay`, `save`, `render`, DOM/timer/
  network ve bütün `App.*` mutation yüzeyi app.js'te kaldı.
- `reportHTML`/`App.printReport` yazdırma akışı app.js'te kaldı; MON-34 yalnız
  `raporHTML` ve onun analiz/görünüm yardımcılarını taşır.
- map, settings, health migration ve chart algoritması taşınmadı veya
  değiştirilmedi. Health/movement/nutrition fonksiyonları yalnız read-only
  dependency olarak çözümlenir.

## Kaynak, parity ve load-order kanıtı

- Önceki app.js report gövdesi HEAD'de `lastNDays` satır 11032 ile
  `ayarlarHTML` öncesi satır 11336 arasındaydı; yeni module
  `app/core/report.js` **349 satır**, **16 member** ve **29 dependency** içerir.
- `app.js:605-638` registry kaydı, `app.js:11070-11085` imza-koruyan shimlerdir;
  `index.html` sırası `health → library → report → mediaFx`, report cache-bust
  `app/core/report.js?v=20260910a` olarak günceldir.
- `index.html`, driver, zikr-harness, state-rebind, migration B2 ve ilgili
  app-boot fixture FILES zincirleri aynı sıraya alındı.
- BEFORE/AFTER `driver.mjs --dump rapor`: her iki dosya **139278 UTF-8 byte**,
  SHA-256 `5d262bb477ecb2701c6db3287229f2631c4a9f5b63bb9616b0a9b7d88460ac71`;
  `cmp` eşit. Driver'ın JS string uzunluğu 138523'tür; dosya byte ölçümü
  UTF-8 olarak 139278'tir.
- Kaynak sayaçları: App assignment `721/721`, birleşik inline `onclick`
  `220/220` (app.js yalnız `216`, taşınan dört attribute module'de),
  `data=` tokenı `17/17`; `SeyAudio` `78/78`, `SeyHaptics` `63/63`,
  `SeyFx` `58/58`. Report module `data=` assignment tokenı **0**.

## Doğrulama

Başarılı kapılar:

- `node --check app.js`, `node --check sync.js`, `node --check app/core/report.js`
- `node tests/app/test_report_boundary.js` — 12 PASS: load-safe registry,
  dependency contract, 16 member, deterministik KPI/heatmap HTML, salt-okur
  state ve app shim/load-order sınırı.
- `node .claude/skills/run-seyma/driver.mjs --dump rapor` — PASS; exact dump
  parity yukarıdaki hash ile doğrulandı.
- `node .claude/skills/run-seyma/zikr-harness.mjs` — 95/95; `node tests/app/test_faz10_sync.js` — 69/69.
- `node tests/app/test_modularization_boundary.js`, state-rebind 37/37,
  B1 0 failure, B2 67/67, B3 20/20 ve save boundary 19/19.
- `tests/app/test_premium_*.js` — 9 fixture dosyası; tümü exit 0.
- Tam `tests/app` (41), `tests/panel` (23), `tests/panel-v2` (27),
  `tests/quran` (9) aileleri ve reminder smoke (20 curated) exit 0.
- `git diff --check` — temiz.

Kanıt sentetik Node/VM ve yerel kaynak karşılaştırmasıdır. Gerçek browser/device
acceptance, remote read/write, push, merge, tag, deploy veya
`mustafaras/seyma-data` yazımı yapılmadı. Sonraki MON-35 bu kartın kapsamı
dışındadır ve yeni açık kullanıcı yönü gerektirir.
