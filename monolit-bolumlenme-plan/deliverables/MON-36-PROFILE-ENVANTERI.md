# MON-36 — Profile domain registry envanteri

Tarih: 2026-09-11
Dal: `premium-fx-gorsel-yuzey`
Kapsam: yalnız MON-36 profile domain modülü; LOCAL-ONLY

## Karar

174 maddelik profil assessment akışının saf content-okuma, consent görünümü,
progress/gate, scoring/quality ve report üreticileri `app/core/profile.js`
içindeki `window.SeymaProfile` registry'sine taşındı. Registry 30 üye ve şu
5 named live dependency ile bağlanır:

`data`, `ui`, `save`, `icon`, `esc`

`app/content/profileAssessmentV1.js` değişmedi; registry content kaydını
yalnızca `window.ProfileAssessmentV1` üzerinden okur.

## Sahiplik sınırı

Registryde kalan yüzey:

- `emptyProfileAssessment`, item/session lookup ve current-index hesaplama
- consent checks/rows ve consent görünümü
- item, break, SOS, completion ve assessment gate HTML üreticileri
- item/facet/construct/RAISEC/values/attachment scoring
- quality kategorisi, band/narrative ve profile report üretimi

`app.js`te bilinçli olarak kalan yüzey:

- `data`/`ui` closure rebind, `migrate`, `getDay` ve `save`
- consent/session mutation, response yazımı, progress advance/previous ve
  `App.*` handler yüzeyi
- `render`/DOM/focus/overlay kabuğu ve `buildProfilePanelSummary`
- `sync.js` profile merge/sanitize ve panel projection/provenance
- data schema ve frozen content

Bu kartta `profileAssessmentV1.js`, `sync.js`, panel kaynakları, panel schema,
migration schema veya yeni profile alanı değiştirilmedi.

## Parity kanıtı

`tests/app/test_profile_boundary.js`, HEAD'deki taşınmamış profile bloğunu
sentetik `node:vm` baseline olarak çalıştırıp yeni registryyi aynı fixture ile
karşılaştırır:

- frozen içerik: **174/174** item ve current-index parity
- cevaplı progress HTML: baseline/module **7698 JS byte**, birebir
- boş-session progress HTML: baseline/module **7416 JS byte**, birebir
- consent/privacy HTML: birebir
- scoring ve quality: JSON eşdeğer
- cold load: namespace dışında DOM/storage/network açılmaz
- profile source: `window.SeySync`, `localStorage`, `fetch(` ve `window.App`
  yok

Gerçek production-order driver kanıtı:

`node .claude/skills/run-seyma/driver.mjs --dump profile` exit 0; dump
`1 / 174 · %0` ilerleme ekranını taşıdı. `appHTML` **7416 JS karakter**,
dosya **7435 UTF-8 byte**, SHA-256:

`3ab539de5f61c5746375228d20f4bcf579abb127e5c0484e87a0ff1ff9e0b004`

## Load order / fixture etkisi

`app/core/profile.js?v=20260911a` `map → profile → mediaFx` sırasında;
`app.js?v=20260911a` sonrasında yüklenir. Aynı yeni dosya şu production-order
ve app-boot fixture listelerine eklendi:

- `.claude/skills/run-seyma/driver.mjs`
- `.claude/skills/run-seyma/zikr-harness.mjs`
- `tests/app/test_state_rebind_boundary.js`
- `.claude/skills/run-seyma/verify-state-migration-boundary.mjs`
- ilgili app/reminder VM boot listeleri

FX2-15/16/10 birleşik kaynak sayımları da registry kaynağını içerir; böylece
App/onclick yüzeyi önceki **718 / 391** sözleşmesiyle ölçülür.

## Kapılar

Exit 0 kanıtı:

- `node --check app.js && node --check sync.js && node --check app/core/profile.js`
- profile boundary, modularization **96/96**, driver, zikr **95/95**
- B1 helper, B2 migration **67/67**, B3 adapter **20/20**
- Faz10 sync **69/69**
- panel P4 provenance **28/28**, legacy panel **50/50**
- tüm `tests/app`, `tests/panel`, `tests/panel-v2`, `tests/quran`, premium
  fixture aileleri ve reminder smoke **20 curated fixtures**
- `git diff --check`

İlk tam koşuda çıkan üç fixture sayım farkı (FX2-16 overlay, FX2-15 tab,
FX2-10 touch) üretim failure'ı değildi; yeni profile registry dosyası birleşik
kaynak girdisine eklenerek düzeltildi ve ilgili kapılar yeniden PASS oldu.

## Sınırlar / kabul

Privacy ve consent parity farkı bulunmadı; halt/blocked yok. Bu kanıtlar
headless Node/VM ve sentetik state kanıtıdır. Browser/device acceptance,
production/live deploy, remote write, push/merge/tag ve
`mustafaras/seyma-data` yazımı yapılmadı. Sonraki MON-37 yeni açık kullanıcı
yönü olmadan başlatılmaz.
