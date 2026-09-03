# MON-14 — createDefaultData root ve sentetik boot parity

**Tarih:** 2026-09-03
**Durum:** ✅ TAMAMLANDI — LOCAL-ONLY
**Öncül:** MON-13
**Sınıf:** state
**Kapılar:** S1–S8, I1–I6, M1–M4

## Karar ve sınır

`createDefaultData()` gövdesi `app/core/state.js` içindeki `SeymaState`
registry'sine taşındı. `app.js` aynı çağrı yüzeyini koruyan imza-koruyan shim'i
tutar. `App.start`, konum late-boot ve auth-unlock yollarındaki
`data=migrate(createDefaultData())` atamaları app.js'te kaldı; import/reset ve
diğer `data` rebindleri değiştirilmedi.

Registry yalnız açık bir dependency bag ile kurulur ve yükleme sırasında hiçbir
bağımlılığı çağırmaz. Tarih bağımlılıkları `todayStr` ve `nowIso`; root üreticileri
`emptySyncReceipt`, `emptyEventLog`, `emptyReminderState`, `emptyLibrary`,
`emptyWatchlist` ve `emptyMusic` olarak adlandırılmıştır. `emptyEventLog`in
event-device localStorage davranışı korunur; registry closure `data`yı yeniden
bağlamaz.

## Default root snapshot manifesti

Sabit sentetik saat `2026-09-03T10:20:30.000Z`, deterministik
`Math.random() = 0.123456789` ve tam `JSON.stringify(root)` çıktısı kullanıldı.
MON-14 öncesi kaynak çıktısının SHA-256 referansı:

`5294f6a84f99d7a7d135f784ce13a9a956984b383417745141945a7da7f48000`

Taşıma sonrası registry ve app.js shim aynı SHA-256 değerini üretir. Root alan
sırası/kapsamı 19 alan olarak korunur:

`version | startDate | lastOpenedDate | lastOpenedAt | savedAt | syncReceipt | eventLog | days | notifications | reminders | luna | aeon | settings | cycle | library | watchlist | music | body | labResults`

`settings` alanları ve değerleri aynıdır: `nickname`, `notificationsWanted`,
`haptics`, `ghToken`, `ghRepo`, `ghBranch`, `healthGistId`, `openaiKey`,
`locationEnabled`, `locationMode`, `lunaConnected`.

## Kaynak ve sahiplik kanıtı

- Registry gövdesi: `app/core/state.js:456-484`.
- Registry kaydı: `app.js:4526-4538`; sekiz named dependency ve `nowIso`
  resolverı app.js'ten verilir.
- Shim: `app.js:6589`; `window.SeymaState.createDefaultData.apply(null,arguments)`.
- Onboarding/start: `app.js:6590-6594`.
- Location late-boot: `app.js:9289-9291`.
- Auth late-boot: `app.js:18940-18948`.
- Reset handler `data=null`: `app.js:9265` ve tüm diğer data rebindleri app.js'te
  kaldı.
- State registryde gerçek `data=` ataması yoktur; `sync.js`, `data/`, panel,
  content ve reminder kaynaklarına dokunulmadı.

## Sentetik doğrulama

`verify-state-migration-boundary.mjs` içindeki MON-14 B2-8 bölümü:

- Registry/shim tam JSON parity ve fresh root/nested referansları: PASS.
- Default root tam hash, 19 root alanı, settings snapshotı ve dört tarih alanı:
  PASS.
- App.js `data` bağlamı default üretiminde yeniden bağlanmıyor, fetch: 0:
  PASS.
- B2 toplamı: **60 passed, 0 failed**.

Onboarding ve seeded/late-boot uygulama yolları `driver.mjs` ile; state zinciri
`verify-state-helper-boundary.mjs`, B2 ve `verify-state-adapter-contract.mjs`
ile doğrulandı. Zikr, sync, tüm app/panel/Panel-v2/Quran fixture aileleri ve
reminder freeze/smoke kapıları exit 0 verdi. Bu kanıtlar headless/local-only'dir;
browser, cihaz kabulü, push, merge, tag, deploy ve gerçek veri deposu yazımı
yapılmadı.

## Cache / FILES / sonraki sınır

Değişen varlıklar için `index.html` cache-bust değerleri state
`20260903e`, app `20260903c` oldu. Yeni dosya eklenmedi; `index.html`,
`driver.mjs` ve `zikr-harness.mjs` FILES sıraları bu nedenle değişmedi.

MON-14 tek yerel commit ile kapatılır. Sonraki sıralı kart `MON-15`tir ve yeni
açık kullanıcı yönü olmadan başlatılamaz. Push, merge, tag, deploy ve cihaz
kabulü ayrıca gatedir.
