# MON-29 — Health hesaplama registry kapanış kanıtı

Tarih: 2026-09-09
Dal: `premium-fx-gorsel-yuzey`
Durum: ✅ TAMAMLANDI — LOCAL-ONLY

## Karar

MON-28 ön koşulu canlı state/ledger zincirinden doğrulandı. Su, uyku,
beslenme, kafein, magnezyum, adım ve beden ölçümü hesaplama gövdeleri
`app/core/health.js` içindeki `window.SeymaHealth` registry'sine alındı.
`app.js` yalnızca imza-koruyan shimleri, canlı dependency bag kaydını ve
mutation/DOM/render/handler kabuğunu taşır. Yeni alan, schema, klinik öneri,
panel veya sync davranışı eklenmedi.

## Alt alan ve sahiplik çizelgesi

| Alt alan | Registry gövdeleri | App-owned kalan sınır |
|---|---|---|
| Kafein | katalog, mod/limit, saat dönüşümleri, içim toplamı, tek doz, kalıntı, cutoff/timing | kart HTML'i ve kullanıcı etkileşimleri |
| Beslenme | `FOOD_DB`, fallback, birimler, öğün/gün makro hesabı, hedef hesabı | `refreshTargets`, öğün metni ve canlı DOM güncellemesi |
| Su/uyku/adım | hedefler, readiness hesabı, movement/step türetimleri | gün/state yazımı ve tik/render yolları |
| Beden | yaş, BMI, aktivite katsayısı/etiketi, BMR/TDEE hedef vektörü | body kayıtları, ağırlık geçmişi ve kart görünümü |
| Magnezyum | sabitler, nudge sinyalleri/skoru, form seçimi, neden metni, istatistik | `recalcLutealHitRate`, kullanıcı state mutation ve UI copy kabuğu |
| Empty/helper | `emptyHealth`, `emptyMagnesium`, `medFreeStreak` | app.js çağrı imzaları ve kalıcı kayıt akışı |

Registry'nin 8 named dependency'si canlı çözülür: `data`, `dateUtils`,
`isVacationDay`, `vacationSettings`, `cycleStats`, `readingStats`, `num`,
`windDownSteps`. Tarih işlemleri `dateUtils` üzerinden çağrı anında yapılır;
module load sırasında DOM, storage, timer veya network açılmaz.

## Eşdeğerlik ve invariant kanıtı

- `tests/app/test_health_boundary.js`: **28/28** sentetik vector PASS.
  Kafein miktar/limit/kalıntı/saat sınırları, bilinen ve fallback besin
  girdileri, yuvarlama, tatil hedefleri, BMR/TDEE, BMI, uyku readiness,
  step-source önceliği, magnezyum nudge/istatistik ve state mutasyonsuzluğu
  doğrulandı.
- Parent/current kaynak karşılaştırması: `App.<name>=` **721/721**,
  doğrudan `app.js` `onclick=` **349/349**, `SeyAudio` **54/54**,
  `SeyHaptics` **42/42**, `SeyFx` **39/39**. State-rebind fixture kesin
  sayımı: data atama kaynak satırı **9**, token **11**; health taşıması bu
  sahiplik sınırını değiştirmedi.
- `driver.mjs --dump bugun` exit 0 ve seeded render üretildi. Modal/focus
  regresyonu exit 0; health registry ayrıca app bootunda load-safe ve
  mutation-free olarak doğrulandı. Bu kart hesaplama gövdelerine aittir;
  health kartlarının görünüm dump kararı MON-30 kapsamındadır.
- `app/core/health.js` 269 satırdır; `app.js` içindeki çağrı adları ve
  return şekilleri imza-koruyan shim olarak korunmuştur.

## Load-order / cache-bust / fixture etkisi

Üretim ve sentetik boot zinciri aynı sırayı taşır:

`motivation.js → crisis.js → journal.js → health.js → mediaFx.js`

`app/core/health.js?v=20260909a` ve değişen app kabuğu için
`app.js?v=20260909d` kullanıldı. `health.js` aynı committe `index.html`,
`.claude/skills/run-seyma/driver.mjs`,
`.claude/skills/run-seyma/zikr-harness.mjs` ve
`tests/app/test_state_rebind_boundary.js` listelerine eklendi. Health
dependency'sini gerektiren app-boot reminder/migration/ÆON/zikir fixture'ları
aynı sırayla güncellendi; panel ve sync fixture'larının sahipliği değişmedi.

## Gate sonucu

- Syntax: `node --check app.js`, `node --check sync.js`,
  `node --check app/core/health.js` — exit 0.
- Driver: seeded/onboarding, `--dump bugun`, reminder deep-link — exit 0.
- Zikr harness: **95/95**.
- State: rebind **37/37**, migration **60/60**, helper/adaptor sınırları
  PASS; Faz10 sync **69/69**.
- Health/today/modularization: **28/28**, **11/11**, **80/80**.
- Tam `tests/app/test_*.js` döngüsü exit 0; premium fixture ailesi exit 0.
- Tam panel, Panel-v2, Quran fixture aileleri exit 0; reminder smoke
  **20/20 curated fixtures** exit 0.
- Önceki domain regressions: journal **33/33**, crisis **40/40**, motivation
  focus, modal focus ve accessibility yolları PASS.
- `git diff --check` exit 0.

## Kapsam dışı ve açık sınırlar

`sync.js`, Guard 1/2, data schema/migrate/getDay, profile/motivation content,
panel, render/modal altyapısı ve yeni sağlık tavsiyesi değişmedi. Gerçek
veri, token, network, browser/device acceptance, remote push, merge, tag ve
deploy yapılmadı. Bir sağlık değeri/limit farkı bulunmadı; HALT/blocked yok.
`MON-30` health kart/yüzey çalışmasıdır ve yeni açık kullanıcı yönü olmadan
başlatılmaz.
