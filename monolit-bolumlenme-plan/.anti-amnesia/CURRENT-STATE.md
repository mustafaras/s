# app.js Monolit Bölümleme — Güncel Durum

> Yeni oturum önce bu dosyayı, sonra `../MON-STATE.json` ve `LEDGER.md`yi
> okur. Kaynak/fixture bir iddiayla çelişirse canlı kaynak üstündür; fark
> ilk uygun LEDGER satırına yazılır.

## Durum tablosu

| Alan | Değer |
|---|---|
| Program | `MONOLIT-BOLUMLENME` |
| Durum | `in_progress` — Dalga 6 devam ediyor (MON-29 tamamlandı) |
| Aktif / bloke | yok / yok |
| Son / sıradaki | `MON-29` / `MON-30` |
| Dalga / ilerleme | 6 devam ediyor (4/7) / 29/60 |
| Dal | `premium-fx-gorsel-yuzey` (MON zinciri `zikirmatik-manuel-zikir` dalını içerir) — LOCAL-ONLY |
| Güncellendi | 2026-09-09 |

## MON-29 kapanışı — health hesaplama registry

- Karar/kanıt: [`MON-29-HEALTH-CALCULATION-VECTORS.md`](../deliverables/MON-29-HEALTH-CALCULATION-VECTORS.md).
- [`app/core/health.js`](../../app/core/health.js) `SeymaHealth` registry'si
  su, uyku, beslenme, kafein, magnezyum, adım ve beden ölçümü hesaplama
  gövdelerini taşır: hedef/limit hesapları, besin lookup/makro, movement/step,
  sleep readiness, BMI/BMR/TDEE, magnezyum nudge/form/istatistik ve empty
  helper'lar. 8 named live resolver ile `dateUtils` çağrı anında çözülür;
  load-safe modül storage/DOM/timer/network açmaz.
- `app.js` `SeymaHealth` dependency bag kaydını, imza-koruyan shimleri,
  `refreshTargets`, öğün text/save akışını, `recalcLutealHitRate` mutationını,
  DOM/render ve App handler kabuğunu korur. Data/schema/migrate/getDay,
  sync.js/Guard, panel, content, profile/motivation ve render/modal altyapısı
  değişmedi.
- Sentetik health vector fixture **28/28**; state-rebind **37/37** ve kesin
  data atama sayımı **9 kaynak satırı / 11 token**. Parent/current kaynak
  sayımları App ataması **721/721**, doğrudan app.js onclick **349/349**,
  FX çağrıları değişmeden; driver `--dump bugun`, zikr **95/95**, Faz10 sync
  **69/69**, bugün kartı **11/11**, modularization **80/80** PASS.
- Syntax, tam `tests/app`, panel, Panel-v2, Quran, premium ve reminder
  smoke (**20/20 curated**) exit 0; `git diff --check` temiz. Health load
  order `motivation → crisis → journal → health → mediaFx`; index cache-bust
  `health.js?v=20260909a`, app cache-bust `app.js?v=20260909d` ve dört ana
  FILES listesi güncellendi. Browser/device, remote, push/merge/tag/deploy ve
  `mustafaras/seyma-data` yazımı yok; sağlık değeri/limit farkı, halt veya
  blocked yok. Sıradaki `MON-30` health kart/yüzeydir ve yeni açık kullanıcı
  yönü olmadan başlatılmaz.

## MON-28 kapanışı — journal domain registry

- Karar/kanıt: [`MON-28-JOURNAL-STATE-TRANSITION.md`](../deliverables/MON-28-JOURNAL-STATE-TRANSITION.md).
- [`app/core/journal.js`](../../app/core/journal.js) `SeymaJournal`
  registry'si Günlük Işığı'nın 8 modunu, F1–F4 prompt kataloğunu, aktif faz /
  prompt / science yardımcılarını, `journalStreak`, `fmtDateShort`,
  `journalLightCardHTML` ve `journalModalHTML` gövdelerini taşır. 10 named live
  resolver ile load-safe ve lazy content çözümlemelidir; text/count/streak ve
  savedAt görünümü korunur.
- `App.openJournalModal`, `closeJournalModal`, `setJournalMode`, `onJournalText`,
  `useJournalPrompt` ve `saveJournal` ile DOM, focus ve mutation sahipliği
  app.js'te kaldı. `saveJournal` sırası `text/count/streakAtSave/savedAt` →
  derived → `save(false,...)` → card/UI/render olarak korundu; data schema,
  `sync.js`, profile/motivation ve modal/render çekirdeği değişmedi.
- Parent/current sentetik `bugun` dump'ında journal kartı **1116/1116 byte**,
  SHA-256 `bc43679fa42eecb0e4029f712daffc502ed737b5be0d052c33a79a7378e40b57`
  birebir eşittir. Journal boundary `33/33`, modal focus `41/41`,
  modularization `76/76`, zikr `95/95`, Faz10 sync `69/69` PASS; driver
  `--dump bugun` ve tam regression aileleri exit 0.
- Yükleme zinciri `index.html`, driver/zikr `FILES`, state-rebind ve ilgili
  app-boot fixture'larında `motivation → crisis → journal → mediaFx` olarak
  hizalandı; `journal.js?v=20260909a` cache-bust kullanıldı. Browser/device,
  push/merge/tag/deploy ve `mustafaras/seyma-data` yazımı yok; halt yok.
  Sıradaki `MON-29` (health domain) yeni açık kullanıcı yönü olmadan başlamaz.

## MON-27 kapanışı — crisis domain registry

- Karar/kanıt: [`MON-27-CRISIS-ENVANTERI.md`](../deliverables/MON-27-CRISIS-ENVANTERI.md).
- [`app/core/crisis.js`](../../app/core/crisis.js) `SeymaCrisis` registry'si
  içinde `CRISES`/`CRISIS_ORDER`, `rasitActionsHTML` ve `crisisModalHTML`
  gövdelerini taşır. Üç kriz kataloğu, 17 seçenek ve 15 trigger güvenlik
  kopyası değiştirilmeden korunur; 9 canlı resolver ile load-safe çalışır.
  `App.openCrisis`, close/toggle/note/complete/reset state-write kabuğu
  app.js'te kaldı; modal altyapısı, render çekirdeği, migrate ve craving
  davranışı değişmedi.
- Parent/current sentetik `sos` dump'ında sweet/food/coffee tile çıktıları
  `4114/4114` byte, modal çıktıları sırasıyla `20162/20162`, `20439/20439`,
  `20261/20261` byte birebir eşittir. Birleşik kaynakta `onclick 391/391` ve
  unique `App 718/718`; crisis boundary `40/40`, modal focus `41/41` PASS.
- Yükleme zinciri `index.html`, driver/zikr `FILES`, state-rebind boot listesi
  ve ilgili app-boot fixture'larında aynı `motivation → crisis → mediaFx`
  konumuna güncellendi; cache-bust `crisis.js?v=20260909a` uygulandı.
  `sync.js`, Guard, data, frozen content, profile, panel ve remote yüzeyler
  değişmedi.
- Syntax, `driver --dump sos`, zikr `95/95`, modularization `72/72`, Faz10
  sync `69/69`, tüm app/panel/Panel-v2/Quran/reminder/premium aileleri ve
  `git diff --check` exit 0. Browser/device, push/merge/tag/deploy veya
  `mustafaras/seyma-data` yazımı yok; halt yok. Sıradaki `MON-28` yeni açık
  kullanıcı yönü olmadan başlamaz.

## MON-26 kapanışı — motivation domain registry

- Karar/kanıt: [`MON-26-MOTIVATION-ENVANTERI.md`](../deliverables/MON-26-MOTIVATION-ENVANTERI.md).
- [`app/core/motivation.js`](../../app/core/motivation.js) (744 satır)
  `SeymaMotivation` registry'si 22 saf görünüm üreticisi + 88 öğelik
  `ROOM_CONTENT_CATALOG` + `parseScientificProfileMD`/`roomValueKey` parser'ını
  taşır; 13 bağımlılık (`data/ui/dark/getDay/activeDate/diffDays/icon/esc/
  segTabs/progBar/featuresLive/fmtWhen/fmtDateNice`) canlı resolver bag'i ile
  çözülür, yükleme anında yan etkisizdir. [`app.js:405-421`](../../app.js)
  registerMotivation canlı bag'i ve `:10436-10460` 23 imza-koruyan shim'i;
  `App.openRoom/closeRoom/updateRoom/setRoomTab/toggleRoomTool`,
  `completeMotivationTask`, `saveDailyWin/copyFlexNudge` ve tüm tools
  save/timer/fetch handler'ları app-owned kaldı.
- **Fail-closed bulgu (düzeltildi):** dilim silmede `App.saveDailyWin`/
  `App.copyFlexNudge` gövdeleri yanlışlıkla silinmişti; fx2 yüzey sayım
  fixture'ları (combined App 718→716) yakaladı, gövdeler HEAD'den birebir geri
  getirildi. `copyFlexNudge` gün dizisi hesabı registry `flexNudgeFor`'dan okur
  (tek nudge kaynağı).
- Değişmezlik: birleşik kaynakta onclick 391 = 391, unique `App.x=` 718 = 718
  (I2); gerçek `data=` token 9 = 9 (M2); `--dump bugun` paritesi stokastik MG
  skoru normalize sonrası birebir. fx2 yüzey sayım fixture'ları (FX2-16.2,
  FX2-15.7, FX2-10.9) ve motivation_room_accessibility kaynak çıpası
  birleşik kaynağa/registry'e uyarlandı (MON-S5 geçiş izni, assertion semantiği
  korunarak).
- Yükleme paritesi: `index.html` `motivation.js?v=20260909a` (saygi→mediaFx
  arası), app cache-bust `v=20260909c`; driver/zikr FILES,
  `test_state_rebind_boundary.js` boot listesi + 12 app-boot fixture listesi
  (B2 migration, B1 helper, aeon_message_expand, zikr_manual_entry, 8 reminder
  fixture) motivation ile güncellendi (fail-closed preflight bulguları, üretim
  failure'ı olmadan).
- Kapılar: syntax ×3, driver, zikr 95/95, modularization 68/68, B1/B2/B3,
  rebind 37/37, save 19/19, Faz10 69/69, large-file 15/15, dört manevi
  boundary, fx2 66/66, premium 249/249, Quran ailesi, reminder smoke 20/20,
  panel faz11, motivation_room_accessibility, aeon_message_expand 24/24,
  `git diff --check` — tümü exit 0.
- Browser/device, push/merge/tag/deploy ve `mustafaras/seyma-data` yazımı yok.
  Sıradaki `MON-27` (crisis domain); yeni açık kullanıcı yönü olmadan
  başlatılmaz.

## MON-25 kapanışı — Dalga 5 kabul denetimi

- Karar/kanıt: [`MON-D5-ACCEPTANCE.md`](../deliverables/MON-D5-ACCEPTANCE.md).
- Canlı ölçüm (MON-24 `5314d38` → HEAD `df6eed8`): app.js 17.332 → 17.804
  satır; `App.fn` 553 → 556 (yalnız +3 additive voice handler:
  `App.setVoiceCloudVoice`/`setVoicePitch`/`setVoiceVoiceName`, FX-P-86/87);
  onclick 354 = 354; gerçek `data=` atama tokeni 9 = 9 (tamamı app.js'te);
  FX delta `SeyAudio +3/+3`, `SeyFx +21/+26`, `SeyTimeTheme +1` — tamamı
  MON-24 sonrası dalın 76 lokal SKY/PREM/FX2 commitinin belgelenmiş ekleri
  (`sky:`/`prem:` önekli; PREM-01 `SeyFx.transition` kaldırımı dahil), manevi
  registry sahipliğine dokunmaz.
- **Bulunan ve onarılan bozuk kapı:** SKY serisi `app/core/skyFx.js`'i
  `index.html` ve `zikr-harness.mjs`'e eklemiş ama `driver.mjs` FILES
  listesini atlamıştı; `driver.mjs` MON-04 `assertLoadOrder` ile exit 1
  veriyordu. Tek satırlık harness düzeltmesi (skyFx aynı konuma) sonrası
  driver exit 0. Ders: S4 parite zinciri dört listedir — `index.html`,
  `driver.mjs` FILES, `zikr-harness.mjs` FILES, `test_state_rebind_boundary.js`
  boot listesi.
- Tüm kapılar PASS: syntax ×2, driver (onarım sonrası), zikr 95/95, B1 0
  failure / B2 60/60 / B3 20/20, rebind 37/37, modularization 64/64,
  Faz−1.1 27/27, date-utils 59/59, helpers 31/31, save boundary 19/19,
  Faz10 69/69, large-file 15/15, manual 21/21, modal focus, dört manevi
  boundary 19/17/20/20, fx2 ailesi 66/66, premium 249/249, Quran ailesi,
  reminder smoke 20/20, panel faz11 50/50, `git diff --check` temiz.
- Üretim kodu, fixture semantiği, sync.js/Guard 1/2, data, cache-bust ve
  `index.html` bu kartta değişmedi; tek değişiklik driver.mjs harness
  paritesi + kanıt/durum zinciridir. Browser/device, push/merge/tag/deploy
  ve `mustafaras/seyma-data` yazımı yok. Sıradaki `MON-26` (motivation,
  Dalga 6); yeni açık kullanıcı yönü olmadan başlamaz.

## MON-24 kapanışı — manevi domainler çapraz regression

**Bağlayıcı durak:** `MON-15` tamamlandı: MON-11..14 state aktarımının canlı
getter, rebind ve strict-mode sınırı bağımsız sentetik VM fixture'ı ile kapatıldı.
Dokuz `app.js` data atama kaynak satırı (11 token), registryde sıfır gerçek
`data=` yazımı, import/reset/location/auth late-boot ve tarihsel 6079
`try/finally` geri-bind kanıtlandı. `data`, `ui`, `dark` ve App/boot sahipliği
app.js'te; `SeymaState` yalnız getter-only canlı okuma sunuyor. `MON-16` syncGlue
callback sahipliğini app.js'te kilitledi; `MON-17` save gövdesini syncGlue
registry'sine aldı, app.js shim/callback atamalarını ve schedule sırasını korudu.
`data`/`ui` ile storage/`SeySync` çağrı anında çözülen resolver'lardır. MON-18
state+sync çekirdeğini tüm resolver manifesti ve sentetik no-network kanıtıyla
kapattı. MON-19 prayer domain gövdelerini `SeymaPrayer` registry'sine aldı;
app.js canlı resolver bag'i ve 25 imza-koruyan shim korunurken cache/fetch yalnız
açık çağrıda çalışır, GPS app.js'te kalır. MON-22 quran state machine ve
delivery/response read-only apply gövdelerini `SeymaQuran` registry'sine aldı;
request/outbox helper shimleri registryye bağlandı, UI handler/render/save
kabukları app.js'te kaldı. `quranTransportV1`, `sync.js`, panel, workflow,
Gmail/App Script, data repo ve remote yazma yüzeyleri bu kartta değişmedi.

## MON-24 kapanışı — manevi domainler çapraz regression

- Karar/kanıt: [`MON-D5-MANEVI-DOMAIN-RAPORU.md`](../deliverables/MON-D5-MANEVI-DOMAIN-RAPORU.md).
- Bu kapanış kartı yalnız kanıt ve durum zinciridir; Prayer, Zikir, Quran ve
  Saygı kaynaklarında, `app.js`te, fixture semantiğinde veya render/App
  yüzeyinde değişiklik yapılmadı. Dört registry için yönlü dependency grafiği
  Saygı → Prayer/Zikir ve Saygı → Quran (app.js kabuğu üzerinden) kenarlarını;
  önkoşul yükleme sırası ise Prayer → Zikir → Quran → Saygı sırasını kaydeder.
  Komşu `window.Seyma*` registry nesnesine atama,
  circular dependency veya load-time DOM/storage/network/timer side-effect
  bulunmadı. Saygı'nın mevcut additive day/root normalizer çağrıları raporda
  görünür tutuldu; domain sınırını değiştiren yeni yazım değildir.
- Aynı seeded driver dump'ında `#zikr-preview-card` `1879` byte /
  `7aad7c7858bf254fded2cac0a42310dc2a0a67076d994000325eacbfdf3d37eb`,
  `#quran-journey-card` `1834` byte /
  `aeb3ac22336660eeab164a6cdb37ed5c4e7337e6eca4274a9d7b3c623dbc94ae` ve
  `#saygi-preview-card` `2175` byte /
  `3d2257924c9bdf52d1ee2f9dc5a5042cd4f53381a307484711db67e08ec59a44`
  ayrıştırıldı. Quran striking-verse başlangıcı random olduğu için Quran
  değeri tek koşum snapshot'ıdır; deterministik Saygı fixture'ı
  `1219` byte / `c69bee63eadfd109b8daa51b438e580ea6e88e7339356b21bfd534e0a853cf86`
  olarak ayrıca korundu.
- MON-S2 FX manifestine göre canlı app.js ölçümü `SeyAudio/SeyHaptics/SeyFx/
  SeyTimeTheme` için sırasıyla `24/50`, `21/42`, `2/4`, `2/2` satır/occurrence;
  yalnız MON-20'nin zikr ses gövdesi aktarımından gelen `SeyAudio -3/-3`
  farkı vardır. `mediaFx.js`, yeni FX çağrısı ve guard semantiği değişmedi.
- Kapılar yeniden PASS: Prayer `19/19`, Zikir `17/17`, Quran `20/20`, Saygı
  `20/20`, modal focus `39/39`, zikr-harness `95/95`, Quran ailesi `512/512`,
  premium ailesi `249/249`, B1/B2/B3 `0 failure`/`60/60`/`20/20`, driver ve
  syntax/diff check exit `0`; diğer MON-STATE gate grupları da exit `0`.
  Cache-bust, production FILES ve yükleme listelerinde etkisi yoktur.
- Browser/device acceptance, remote push, merge, tag, deploy ve
  `mustafaras/seyma-data` yazımı yapılmadı. Sıradaki `MON-25`tir; yeni açık
  kullanıcı yönü olmadan başlatılmaz.

## MON-23 kapanışı — Saygı domain registry ve modal focus parity

- Karar/kanıt: [`MON-23-SAYGI-MODAL-FOCUS-MANIFESTI.md`](../deliverables/MON-23-SAYGI-MODAL-FOCUS-MANIFESTI.md).
- [`app/core/saygi.js:1-269`](../../app/core/saygi.js) `SeymaSaygi` registry'si
  Saygı/Öncü içerik yardımcılarını, İman kart/overlay gövdelerini, kıble saf
  metrik/overlay yardımcılarını, Hicri/Kandil shimleri ve `wireSaygiReadGate`
  sözleşmesini taşır. `SaygiPeople` ve `HijriCalendarV1` çağrı anında çözülür;
  registry yüklemesi DOM, storage, timer veya ağ açmaz.
- [`app.js:270-341`](../../app.js) aynı isim/imza ile delegeleri, [`app.js:386-403`](../../app.js)
  canlı `data/ui/date/render/content` dependency bag kaydını korur. App
  handlerları, gerçek state rebind'i, ortak modal focus altyapısı ve kıble
  permission/sensör DOM akışı app.js'te kaldı; `qiblaSmoothAngle` de sensör
  kabuğunda tutuldu. SaygiPeople/Hijri content, prayer.js, panel ve modal
  altyapısı değişmedi.
- Yükleme/FILES paritesi [`index.html:55-76`](../../index.html),
  [`driver.mjs:227-261`](../../.claude/skills/run-seyma/driver.mjs) ve
  [`zikr-harness.mjs:134-162`](../../.claude/skills/run-seyma/zikr-harness.mjs)
  içinde `zikir → quran → saygi → mediaFx` sırasına hizalandı; yeni asset
  `app/core/saygi.js?v=20260904a`, app cache-bust `v=20260904f` oldu. Full-app
  reminder/helper/rebind fixture'ları da registryyi boot sırasına ekledi.
- [`test_saygi_boundary.js`](../../tests/app/test_saygi_boundary.js) `20/20`
  ile lazy content, root/read state, kıble metrikleri, üç modalın
  `role=dialog`/`aria-modal`/`tabindex`/`App.onModalKeydown` contractı, sabit
  Okudum eylemi ve parent/current synthetic preview dump parity'sini kanıtlar;
  dump 1219 byte / SHA-256
  `c69bee63eadfd109b8daa51b438e580ea6e88e7339356b21bfd534e0a853cf86`.
  Modal fixture 39/39, zikr-harness 95/95 ve driver exit 0'dır.
- Syntax, state B1/B2/rebind, app/premium/reminder regression kapıları PASS;
  `sync.js`, Guard 1/2, data, content, prayer, panel, browser/device, remote,
  push, merge, tag ve deploy değişmedi. Başarılı kapanıştan sonra sıradaki
  `MON-24` olup yeni açık kullanıcı yönü olmadan başlatılmaz.

## MON-22 kapanışı — Kur'an domain registry ve idempotent uzak apply

- Karar/kanıt: [`MON-22-QURAN-DOMAIN-ENVANTERI.md`](../deliverables/MON-22-QURAN-DOMAIN-ENVANTERI.md).
- [`app/core/quran.js:1-363`](../../app/core/quran.js) `SeymaQuran` registry'si
  şema/normalizer, durum rank/transition/reducer, requestId üretimi, outbox
  writer/error label ve read-only delivery/response apply üyelerini taşır.
  `registerQuran` yalnız canlı `data` resolver kabul eder; yüklemede DOM,
  storage, timer veya ağ çalıştırmaz.
- [`app.js:272-312`](../../app.js) sabitleri ve imza-koruyan quran shimlerini,
  [`app.js:13913-13922`](../../app.js) katalog/UI okuma yardımcılarını,
  [`app.js:14570-14817`](../../app.js) save/render ve `App.*` handler kabuğunu
  korur. `quranRandomVerseStart` yalnız UI başlangıç durumudur; kalıcı state'e
  yazılmaz. Uzak apply reducer üzerinden monotonic/idempotent çalışır; `save`
  veya fetch çağrısı registry içinde yoktur.
- Yükleme/FILES paritesi [`index.html:55-75`](../../index.html),
  [`driver.mjs:227-260`](../../.claude/skills/run-seyma/driver.mjs) ve
  [`zikr-harness.mjs:134-161`](../../.claude/skills/run-seyma/zikr-harness.mjs)
  içinde `zikir → quran → mediaFx` sırasındadır. Yeni asset
  `app/core/quran.js?v=20260904a`; app cache-bust `v=20260904e` oldu. Quran
  boot eden reminder fixture'ları da aynı dosyayı yükler.
- Yeni [`test_quran_boundary.js`](../../tests/app/test_quran_boundary.js)
  `20/20` ile requestId/sûre normalize, reducer akışı, live resolver,
  read-only apply ve app shim/UI kabuğunu doğrular. Quran ailesinin 9 fixture'ı
  toplam `512` assertion ile PASS: a11y `66/66`, catalog `70/70`, demo `9/9`,
  merge `38/38`, outbox `55/55`, panel parity `9/9`, pull `17/17`, striking
  verses `41/41`, transport `207/207`. Pull fixture'ı `200 → 304 → 200`,
  cache-miss 304 ve hata sınırlarını; merge/outbox fixture'ları duplicate
  request/response davranışını kanıtlar.
- Syntax, driver, zikr-harness `95/95`, Faz10 sync `69/69`, app/panel/
  Panel-v2/reminder regression aileleri ve `git diff --check` exit `0` verdi.
  Browser/device, deploy, push, merge, tag, workflow, Gmail/App Script,
  `mustafaras/seyma-data` ve başka remote yazımı yapılmadı. Başarılı kapanıştan
  sonra sıradaki `MON-23` olup yeni açık kullanıcı yönü olmadan başlatılmaz.

## MON-21 kapanışı — zikir görünüm ve hatim yüzeyleri

- Karar/kanıt: [`MON-21-ZIKIR-GORUNUM-DUMP-MANIFESTI.md`](../deliverables/MON-21-ZIKIR-GORUNUM-DUMP-MANIFESTI.md).
- `app/core/zikir.js:561-990` aynı `SeymaZikr` registry'sinde 16 saf zikir
  view/helper üreticisini taşır: counter, preset/results, hatim, history,
  settings, note/manual alt yüzeyleri ve body resolver. Resolver bag'i
  app.js'teki canlı `ui/content/icon/esc/date/topic/niyet/ring/flash` okurlarına
  bağlanır; registry load-safe kalır.
- `app.js:238-261` canlı bag'i, `app.js:13907-13921` 15 imza-koruyan shim'i ve
  `app.js:13959` body resolver shim'ini
  taşır. `zikrNoteDraftFor`/`zikrManualDraftFor` mutation gövdeleri
  `app.js:13923-13938`'de; overlay/focus ve yerinde `zikrPaintView`
  `app.js:13939-13972`'de app-owned kalır. Inline `onclick`/`oninput` ve modal
  sözleşmesinde değişiklik yoktur.
- Parent/current sentetik dump parity: counter `8670` byte / SHA-256
  `7b5889d77a927463efe0aab16ad76b88384908fee0090a277f0ea4168e6a16a3`,
  presets `8067` / `dc1a3175dc54733001d67a9b8f147f36569c5827e60e938a446350102dbdef4b`,
  hatims `1557` / `7eebfdbfe2eafeda2518cc098b3d7f7c74b582d33deaea0eecf6e59bc9851c4d`,
  history `2207` / `60e0b7cd7cc21a4b21e33f97899103385f23e1d21d34661254883213d03a4755`,
  settings `2260` / `80dfd44d0225f18e32589f2e36154a08529e507779e80935e23b173bf9d47a26`;
  her satır önce/sonra eşit ve handler dizisi `29/29`, `29/29`, `4/4`, `1/1`,
  `7/7` eşittir. Fixture `17/17` PASS.
- `index.html` yalnız değişen zikir/app assetleri için `zikir.js?v=20260904b`
  ve `app.js?v=20260904d` cache-bust aldı; production FILES listesine yeni
  giriş gerekmedi.
- Syntax, driver, zikr-harness `95/95`, premium audio/haptics/voice ve tam
  regression kapıları PASS. `sync.js`, Guard 1/2, data, frozen zikir content,
  render çekirdeği, motor/FX çağrıları, panel, browser/device, remote ve
  deploy değişmedi. Sonraki sıradaki kart MON-22'dir ve yeni açık kullanıcı
  yönü olmadan başlatılmaz.

## MON-20 kapanışı — zikir motoru

- Karar/kanıt: [`MON-20-ZIKIR-MOTOR-ENVANTERI.md`](../deliverables/MON-20-ZIKIR-MOTOR-ENVANTERI.md).
- `app/core/zikir.js:1-612` `SeymaZikr` registry'si seed, hedef/hatim,
  oturum, tarihçe/ayar ve manuel motor gövdelerini taşır. app.js'te canlı
  `data/getDay/tarih/save` bag'i, imza-koruyan shimler, root rebind, render,
  App handler ve guide/haptic/bell kabuğu kalır; zikir viewleri taşınmaz.
- `index.html` zikir modülünü prayer'dan sonra `v=20260904a` ile yükler;
  app cache-bust `v=20260904c` olur. Driver/zikr-harness ve ilgili sentetik
  fixture FILES listeleri aynı sıraya hizalıdır.
- Zikir boundary `17/17`, zikr-harness `95/95`, manuel zikir `21/21`,
  modularization `57/57`, Faz−1.1 `23/23`, premium `26/26`; tam app/panel/
  Panel-v2/Quran/reminder aileleri exit 0 verdi. `#zikr-preview-card` old/new
  dump parçası `1879/1879` byte-eşittir; aggregate dump random Qur'an içeriği
  nedeniyle zikir parity kanıtı olarak kullanılmaz.
- `sync.js`, Guard 1/2, data, panel, frozen zikir content, browser/device,
  remote, push, merge, tag ve deploy değişmedi. MON-21 yalnız yeni açık
  kullanıcı onayıyla başlatılabilir.

**Planlama derinliği:** `UYGULAMA-PROMPTLARI.md`, 60 kısa kabul kartına ek
olarak 60 çalışma sayfası içerir. Her sayfa kaynak grep'i, sekiz aşamalı
taşıma dizisi, registry/yükleme sınırı, kapı paketi ve fail-closed handoff
sunmaktadır. Bu ek tek başına uygulama durumu değildir; ilerleme yalnız
tamamlanan promptların gerçek kaydıyla güncellenir.

## MON-01 kapanışı — canlı karar kaydı

- Karar belgesi: [`MON-S1-DELEGASYON-KARARI.md`](../deliverables/MON-S1-DELEGASYON-KARARI.md).
- Kabul edilen yol: load-safe `window.Seyma<Module>` registry + app.js'te
  imza-koruyan shim; yalnız özgür fonksiyon ve açık dependency rotası varsa.
- Retler: snapshot global state, modülün `data=` yazması, event bus/bundler,
  sync callback'lerini taşımak ve monoliti tek seferde kaldırmak.
- Ölçüm düzeltmesi: 9 `data` kaynak satırı; aynı satırdaki çift yazımlar
  nedeniyle 11 token (başlangıç bildirimi dâhil), 10 rebind tokenı. App
  function-ataması 545, tüm App ataması 704, inline onclick 415/321.
- Kod/harness/index/sync/panel/content/veri değişmedi. Bu yalnız yerel,
  başsız kaynak kanıtıdır; deploy veya cihaz kabulü değildir.

## Canlı baseline (2026-09-02, ZP-10 sonrası — MON-02 güncellemesi)

> MON-01 baseline'ı ZP-10 (`cf88f83`) öncesi dosyaya aittir; satır numaraları
> kaymıştır. Bu tablo `MON-S2-FX-HANDLER-MANIFESTI.md` ile senkronizedir.

Satır numaraları yalnız yol göstericidir; her taşımada yeniden grep yapılır.

| Çıpa | Canlı değer | Koruma |
|---|---:|---|
| `app.js` | 19.037 satır, IIFE sonu 19.037 | tek IIFE; MON-17 save shim'i korunur |
| `var data=null` | 2772 | M2, app.js sahibi |
| yükleme / migrate shim | 4555 / 4571 | M2, registry gövdesi + app.js sahibi shim |
| B1 getter'ları | 4564–4570, yedi getter | canlı bağ köprüsü |
| `state migrate` / `getDay` | state.js:47 / state.js:313; app.js shim:4571 / 4892 | MON-12 / MON-13..15 yüksek risk |
| geçici `data=d` + finally | 6004 | `finally{data=savedData}` zinciri korunur |
| `SeyOnSyncState` / `SeyOnSynced` | 6134 / 6144 | M3, app.js sahipliği |
| `save` / `var App` | 6165 / 6308 | MON-17 shim / MON-50..54 |
| `createDefaultData` / `App.start` | 6578 / 6579 | MON-14 aktarımı / boot sahipliği; MON-15 denetimi |
| import / reset / late-boot data= | canlı grep ile yenilenir | M2prime, app.js'te kalır |
| `window.App=App` | 17101; atamalar sonra da sürer | I2, erken taşınmaz |
| `App.x=function` | 553 (ZP-10: 9 ekleme − setZikrPreset yeniden yazım) | baseline, her promptta değişmezlik kanıtı |
| inline onclick | source occurrence 423 / eşsiz handler 326 | I2 için üç ayrı görünüm ölçüsü |
| FX satır / occurrence | SeyAudio 27/53, SeyHaptics 21/42, SeyFx 2/4, SeyTimeTheme 2/2 | M4, 48 satır tablo MANIFESTI.md §4.2 |

## MON-02 kapanışı — FX/handler manifesti

- Manifest: [`../deliverables/MON-S2-FX-HANDLER-MANIFESTI.md`](../deliverables/MON-S2-FX-HANDLER-MANIFESTI.md).
- Baseline bayatlığı ZP-10 delta mutabakatıyla çözüldü: FX +2 occurrence
  tek yeni satırdır (`App.saveZikrManual` içi hatim `SeyAudio.bell`, 8996).
- Üç ölçüm metodu ayrı kaydedildi: satır/occurrence/eşsiz-ad karıştırılmaz.
- 48 FX satırının sahiplik fonksiyonu + guard türü tabloya bağlandı;
  gelecek registry'lerin FX modüllerini yeniden tanımlama/sarma yasağı
  MON-S2 kararı olarak kilitlendi.
- Manuel zikir yüzeyi (9 App handler + 9 serbest fonksiyon +
  `data.zikr.manualEntries`) zikir domainine sahiplendi; MON-02'de yalnız
  ölçüldü. `sync.js mergeZikr` V5 union matematiği I5 altında dokunulmaz.
- 12 doğrulama kapısı tümü PASS; kod, index, harness, fixture, data,
  browser, remote ve deploy değişmedi.

## Mevcut yükleme ve harness gerçeği

- `index.html`: content → constants → dateUtils/state/syncGlue/helpers/mediaFx/
  timeTheme → reminder×4 → inline SW → coverage manifest → app.js → sync.js.
  Yeni core satırları reminderDelivery sonrasına, inline SW önüne eklenir;
  cache-bust aynı committe artar.
- **MON-S4 kararı:** driver.mjs ve zikr-harness.mjs FILES dizileri artık
  index üretim sırasının birebir paritesidir. Başlangıçta 23 olan liste
  MON-19 prayer eklemesiyle 24 dosyaya (app.js dahil) çıktı; sync.js ve panel
  coverage kasıtlı dışarıdadır. Fail-fast `assertLoadOrder()` iki harness'ta
  da çalışır: sıra ihlali throw üretir. Kural: yeni core dosyası önce index'e,
  sonra FILES'a aynı konuma; sync.js hiç FILES'a eklenmez.
  Kaynak: [`../deliverables/MON-S4-HARNESS-PARITE-KARARI.md`](../deliverables/MON-S4-HARNESS-PARITE-KARARI.md).
- `SeymaState`, `SeymaDateUtils`, `SeymaHelpers` shimleri ve `SeymaSave` kayıt
  çağrısı app.js'te; `SeymaSave` save gövdesi syncGlue'tadır. Registryler
  app.js'ten önce yüklenir ve B1'de save kaydı yokken `SeymaSave.save` undefined
  kalır.

## 24 hedef modül ve ilerleme matrisi

Sahiplik kaynağı artık [`../deliverables/MON-S3-MODUL-SAHIPLIK-MATRISI.md`](../deliverables/MON-S3-MODUL-SAHIPLIK-MATRISI.md)'dir:
24 benzersiz hedef (6 KORU + 18 YENİ) + frozen reminder dörtlüsü, registry
adları, bağımlılık yönleri, forbidden reverse dependency ve index ekleme
noktası (reminderDelivery'den sonra, coverage manifest'ten önce) sabit.
Özet:

| Sınıf | Hedefler | Plan durumu |
|---|---|---|
| Var/korunacak altyapı (6) | constants, dateUtils, helpers, syncGlue, mediaFx, timeTheme | KORU; dateUtils/helpers/syncGlue sonradan genişletilir |
| Saf çekirdek | (dateUtils/helpers genişletmesi) | MON-07..10 |
| Mutable çekirdek (1) | state | MON-11..15 |
| Senkron köprü (1) | syncGlue genişletmesi | MON-16..18 |
| Domain (12) | prayer, zikir, quran, saygi, motivation, crisis, journal, health, library, report, map, profile, settings | MON-19..37 (tek tek kart başlığına hizalı: MON-S3 §7) |
| Reminder UI + messaging (2) | reminders, messaging | MON-40..42 (43 kapanış kartı) |
| Birleştirme (2) | render, appSurface | MON-44..54 |

## MON-03 kapanışı — sahiplik matrisi

- Matris: [`../deliverables/MON-S3-MODUL-SAHIPLIK-MATRISI.md`](../deliverables/MON-S3-MODUL-SAHIPLIK-MATRISI.md).
- 24 benzersiz hedef doğrulandı; index core sırası (54–64) kaynakla birebir.
- Kural: registry yalnız kendi üyelerini kurar (yan etkisiz); app.js shim
  fail-closed; hiçbir modül sync.js/panel/data-rebind'e yazamaz; cycle yok.
- Manuel zikir serbest fonksiyonları (a) saf sınıfına MON-S5 matrisi için
  işaretlendi. Halt tetiklenmedi.

## Premium FX mirası

`FX-SERI-KAPANIS-BELGESI.md` tamamlanmış LOCAL-ONLY serinin kaynağıdır.
MON-02 manifesti 48 çağrı satırını sahiplik fonksiyonu + guard türüyle
sabitledi (`MON-S2-FX-HANDLER-MANIFESTI.md` §4): `SeyAudio` (27 satır / 53
occurrence), `SeyHaptics` (21/42), `SeyTimeTheme` (2/2), `SeyFx` (2/4)
çağrılarının adı, guard biçimi ve kullanıcı ayar anlamı korunur. MON-S2
kararı: gelecekteki herhangi bir `window.Seyma<Module>` registry'si FX
modüllerini yeniden tanımlayamaz/sarmalayamaz. Her kod dalgası
`test_premium_*.js` ailesini çalıştırır. FX-P-66/67 ertelenmiştir; bu
serinin kapsamı değildir.

## Değişmez kararlar ve tuzaklar

0. **MON-S5 fixture geçiş sözleşmesi** ([`../deliverables/MON-S5-FIXTURE-GECIS-MATRISI.md`](../deliverables/MON-S5-FIXTURE-GECIS-MATRISI.md)):
   4 fixture'ın 138 assertion'ı 15 geçiş grubuna ayrıldı. Daima-değişmez:
   I2 App yüzeyi, IIFE+`window.App`, M3/B1 (`window.data/ui/save=` yasak),
   saf davranış testleri, helpers FX yasağı, `assertLoadOrder`. Kasıtlı
   geçişler: modularization [1] satır eşiği (MON-50..54), [4] sayaç tersine
   dönüş (MON-19), [8] migrate/save shim kabulü (MON-12/17), F-2 FX çağrı
   dosya-çifti kabulü (domain taşımaları, MON-S2 manifestiyle eşitlenir),
   F-3 ilk tüketim shim deseni (MON-07), D-3/H-4 iki-mod assertion
   (MON-11/17). Kural: eski PASS ≠ yeni semantik; fixture güncellemesi
   yalnız ilgili MON'un kendi commit'inde; tarif edilemeyen semantik = halt.
1. B1 getter'ları taze değer döndürür; snapshot/one-shot referans yasaktır.
2. 6138 geçici data takası ve dokuz yeniden atama app.js'te kalır.
3. `SeyOnSyncState` / `SeyOnSynced` app.js'e atanabilir kalır; getter-only
   accessor strict-mode boot throw eder.
4. `sync.js`, panel, `app/content/*`, frozen reminder motorları, SW ve gerçek
   veri bu programın kod kapsamı dışındadır.

## MON-07 kapanışı — dateUtils saf gövdeleri

- Altı saf gövde zaten yükleme-güvenli `app/core/dateUtils.js` registry'sinde
  bulunuyordu; MON-07 app.js kopyalarını aynı isim/imza/dönüşlü registry
  shimlerine indirdi. Registry dışında ikinci gövde kalmadı.
- `index.html`de dateUtils cache-bust `20260903a` yapıldı. Dosya önceden
  index ve iki headless FILES dizisinde doğru sırada olduğundan script sırası
  veya FILES dizisi değişmedi; `assertLoadOrder` korundu. Tam kapı setinin
  bulduğu reminder-smoke ve B2 state-migration VM yükleme eksikleri de yalnız
  fixture listelerinde aynı `constants → dateUtils → app.js` sırasıyla
  giderildi.
- Kanıt: syntax×2; `test_date_utils_boundary` 58/58; modularization 42/42;
  Faz−1.1 18/18 (F-3 artık altı shim'i doğrular); B1/B2/B3 state sınırları
  (B2 32/32) PASS; driver/zikr PASS; bugun dump SHA-256 değişmedi
  (`e43a604594a0da91d78978eb3b13844281cf19a08630073415f615ec990b1695`).
  Saat dilimi/string çıktısı sapması yoktur. Yerel PASS deploy veya cihaz
  kabulü değildir.

## MON-08 kapanışı — dateUtils state-okur yardımcıları

- `app/core/dateUtils.js` artık `dayIndexFor`/`activeDate`/`curDay` için
  yalnız B1 `SeymaState` getter'larını okur; `data`/`ui` rebind ya da
  `getDay` sahipliği registry'ye taşınmadı. `dateLabelTR`, app.js'in önceki
  hafta-günü metnine birebir hizalandı (`31 Ağustos Pazartesi`).
- app.js dört ince shim taşır. dateUtils zaten index ve iki ana harness FILES
  dizisinde doğru sırada olduğundan FILES değişmedi; cache-bust `20260903b`.
- Kanıt: date-utils 58/58 (rebind tazeliği dahil), B1/B2/B3 state sınırları,
  driver/zikr, modularization/Faz−1.1, sync/panel/premium/reminder kapıları
  PASS; eski-yeni dört fonksiyon ve B1 rebind eşitliği PASS; bugun dump
  SHA-256 değişmedi. Dokuz `data` atama çıpası app.js'te kaldı.

## MON-09 kapanışı — helpers saf görünüm üreticileri

- Altı app.js gövdesi `SeymaHelpers` registrysine taşındı; app.js'te aynı
  isim/imza/dönüşlü shimler kaldı. `miniBars` canlı tarihini DateUtils
  registryden, `starRow`/`statTile`/`collapsibleCardHTML` escaping ve SVG
  üretimini helpers içindeki açık resolverlardan alır; `data`/`ui`, DOM,
  timer, ağ ve App mutasyonu taşınmadı.
- Registryde önceden kalmış farklı ARIA/stil/onclick varyantları app.js'in
  gerçek çıktılarına hizalandı. Constants registry yalnız `ICONS` verdiği
  için SVG resolver, app.js icon sözleşmesiyle eşdeğer biçimde tamamlandı.
  `helpers.js` cache-bust `20260903a`; dosya önceden index ve ana FILES
  dizilerinde doğru sırada olduğundan sıra değişmedi.
- Kanıt: eski-yeni altı üretici eşit çıktı; `bugun` dump SHA-256
  `dc7af3b89b87f669b78d4c8895d965ebe98a3b34f722c70ebd2183dd83e90099`,
  `rapor` `5ceeffe4d0d7a7396f4b909c7249d18aa3f40c5ea6f6bcaa1da0ba28d8d0e334`.
  Helpers 30/30, date-utils 58/58, driver/zikr, state sınırları,
  modularization/Faz−1.1, sync/panel/premium ve reminder smoke 20/20 PASS.
  Yerel PASS deploy veya cihaz kabulü değildir.

## MON-10 kapanışı — helpers etkileşim yardımcıları ve saf çekirdek

- `toast`/`confetti` lazy DOM+timer gövdeleri ve legacy `haptic` B1-okur
  titreşim gövdesi registryye taşındı; app.js üç ince shim taşır. Toast timer
  slotu görünür `window.__seyToastTimer` resolverıyla sürer; registry yükleme
  anında DOM/timer/ağ/storage yan etkisi yoktur.
- Premium `SeyHaptics` çağrıları (42 occurrence) legacy hapticten ayrı kaldı.
  Yeni efekt, timer, notification veya gesture eklenmedi. Tam 12 üyelik
  manifesti [`MON-D2-CEKIRDEK-RAPORU.md`](../deliverables/MON-D2-CEKIRDEK-RAPORU.md)
  içindedir; helpers cache-bust `20260903b`, FILES sırası değişmedi.

## MON-11 kapanışı — state bağımlılık keşfi ve MON-S6

- Karar belgesi: [`MON-S6-STATE-MUTASYON-KARARI.md`](../deliverables/MON-S6-STATE-MUTASYON-KARARI.md).
  `migrate`, `getDay` ve `createDefaultData` için okuma/yazma, closure ve App
  handler ilişkileri; `data`nın dokuz rebind kaynağı; M2/M2prime sahipliği ve
  tarihsel L6079’un canlı L6140 `try/finally` geri yükleme davranışı kanıtlandı.
- Karar: `SeymaState` yalnız B1 canlı getter okur; dış modül `data=` yazmaz.
  Snapshot, setter/store ve event-bus registry kabul edilmez. Migrate
  bağımlılıkları çözümsüz değildir; L6140 adaptörü app.js sahipliğinde kalır.
- Canlı ölçüm yenilemesi, önceki tarihsel MON-S2 kayıtlarından drift gösterdi:
  19.247→19.203 satır ve inline `onclick` 385/423/326→382/420/325. Eski ledger
  satırları tarihsel makbuz olarak değiştirilmedi. Kod, B1 getter,
  `migrate()` semantiği, `index.html`, cache-bust ve FILES manifesti değişmedi.
- B1/B2/B3 state üçlüsü (0 failure; 32/32; 20/20), `test_faz10_sync`, driver,
  zikr ve tam yerel S1–S8, I1–I6, M1–M4 kapıları PASS verdi. Yerel PASS deploy
  veya cihaz kabulü değildir.

## MON-12 kapanışı — migrate registry ve sentetik parity

- Kanıt/manifeste: [`MON-12-MIGRATE-SENTETIK-PARITY.md`](../deliverables/MON-12-MIGRATE-SENTETIK-PARITY.md).
- `migrate` alt yardımcıları açık bir dependency bag ile registryye bağlandı;
  `registerMigrate` eksik/ikinci kaydı reddeder. Registryde DOM, timer, ağ,
  localStorage veya `data` rebind yoktur.
- `version > 2` olan sonlu sayısal future kökleri opak bırakılır: aynı nesne
  döner, nested migration/default/version rewrite çalışmaz. Legacy/normal
  köklerde bilinmeyen alan korunumu ayrıca fixture assertion'ına bağlıdır.
- `index.html` cache-bust state `20260903c`, app `20260903a` oldu. Üretim
  driver/zikr FILES sırası değişmedi; B2 ve app/reminder boot fixture'ları
  state.js'yi app.js'ten önce yükler.
- Kanıt: B1 `0 failures`, B2 `42/42`, B3 `20/20`; sync `69/69`; modularization
  `44/44`; driver, zikr `95/95`, app/panel/panel-v2/Quran fixture aileleri,
  reminder smoke `20/20` ve `git diff --check` PASS. Push/merge/tag/deploy,
  browser/device ve gerçek veri yazımı yok.

## MON-13 kapanışı — getDay registry ve sentetik parity

- Kanıt/manifeste: [`MON-13-GETDAY-SENTETIK-PARITY.md`](../deliverables/MON-13-GETDAY-SENTETIK-PARITY.md).
- `getDay` gövdesi `app/core/state.js:313-453` içinde tek sahibi oldu;
  `app.js:4863` aynı imzayı koruyan shim'dir. Registry kaydı
  `app.js:4503-4525` aralığında 17 named helper ve `HABITS`/
  `WIND_DOWN_STEPS` bag'iyle fail-closed kurulur.
- Yeni gün path'inde exact 37 alan/default snapshot; var gün path'inde aynı
  mutable day ve nested sentinel referansı, bilinmeyen alan korunumu,
  caffeine/journal/therapy/prayer nested normalization ve registry/shim
  parity kanıtlandı. Yeni alan, archive backfill veya `data=` taşıması yoktur.
- `app/core/state.js` zaten index + driver + zikr FILES sırasındadır; yeni
  dosya yok, FILES değişmedi. Cache-bust state `20260903d`, app `20260903b`.
  `sync.js`, `data/`, panel ve deploy yüzeyi dokunulmadı.
- Kanıt: syntax×3; B1 `0 failures`, B2 `51/51`, B3 `20/20`; driver bugun
  dump PASS (SHA-256 `fd44d81747bc5fa31c8d702737ed87ec44e690339035d6487e7eceee3fc89059`),
  zikr `95/95`, sync `69/69`, modularization `47/47`, Faz−1.1 `18/18`,
  date-utils `58/58`, helpers `30/30`, tüm fixture aileleri ve reminder
  smoke exit 0, `git diff --check` PASS.

## MON-14 kapanışı — createDefaultData registry ve sentetik boot parity

- Kanıt/manifeste: [`MON-14-DEFAULT-ROOT-SENTETIK-PARITY.md`](../deliverables/MON-14-DEFAULT-ROOT-SENTETIK-PARITY.md).
- `createDefaultData()` gövdesi `app/core/state.js:456-484` içinde tek sahibi
  oldu; app.js shim'i `app.js:6589` aynı `apply(null,arguments)` yüzeyini korur.
  `todayStr`/`nowIso` ve altı empty-root üreticisi açık named bag ile bağlandı;
  registry yükleme anında çağrı yapmaz.
- Sabit sentetik saat/rasgelelikte tam default root JSON SHA-256
  `5294f6a84f99d7a7d135f784ce13a9a956984b383417745141945a7da7f48000` olarak
  MON-13 öncesi/sonrası eşittir. 19 root alanı, settings/tarih snapshotı,
  fresh nested referanslar ve app.js `data` bağlamının yeniden bağlanmaması PASS.
- `App.start`, location/auth late-boot, import/reset ve `data=null` sahipliği
  app.js'te kaldı. B2 MON-14 dahil `60/60`; B1 `0 failures`, B3 `20/20`; syntax,
  driver onboarding+location+seeded, zikr `95/95`, sync `69/69`, core/app/panel/
  Panel-v2/Quran fixture aileleri, reminder freeze/smoke ve diff check PASS.
- `app/core/state.js` zaten index + driver + zikr FILES sırasındaydı; yeni dosya
  yok, FILES değişmedi. Cache-bust state `20260903e`, app `20260903c`.
  `sync.js`, `data/`, panel ve deploy yüzeyi dokunulmadı. Push/merge/tag/deploy,
  browser/device ve gerçek veri deposu yazımı yok.

## MON-15 kapanışı — state Dalga 3 ve B1 yeniden-atama denetimi

- Kanıt/manifeste: [`MON-D3-STATE-RAPORU.md`](../deliverables/MON-D3-STATE-RAPORU.md).
- Özel fixture: [`tests/app/test_state_rebind_boundary.js`](../../tests/app/test_state_rebind_boundary.js).
  Tam üretim script sırasını sentetik `node:vm` içinde yükler; gerçek browser,
  token, sync.js veya çözülen fetch kullanmaz.
- Canlı kaynak envanteri: `app.js`te dokuz data atama kaynak satırı ve 11 token;
  `app/core/state.js` gerçek kodunda sıfır `data=` yazımı. `ui` ve `dark`
  initialization/rebind sahipliği de app.js'te kaldı; `syncGlue` callback setterı
  yoktur.
- Yedi app B1 getterı (`data`, `ui`, `dark`, `migrate`, `getDay`,
  `createDefaultData`, `save`) ve `SeymaState` state getterları setter'sızdır.
  Strict-mode descriptor probe, dış yazmayı `TypeError` ile reddeder; canlı
  getter `ui`/`dark` değişimini ve `data` closure kimliğini taze okur.
- Sentetik import, iki adımlı reset, location late-boot, gerçek auth handlerının
  sandbox hash'iyle auth unlock late-boot yolu ve 6079 `try/finally` geçici
  takası PASS. `App.start`, `data=null`, import ve tüm rebind kaynakları app.js
  sahibinde kaldı. Acceptance: `37/37`.
- B1 `0 failures`, B2 `60/60`, B3 `20/20`; sync `69/69`, driver, zikr `95/95`,
  syntax ve premium PASS. Tam app/panel/Panel-v2/Quran/reminder aileleri ve
  diff/cache kontrolleri exit 0 verdi. Index cache-bust (`state 20260903e`,
  `app 20260903c`) ve driver/zikr FILES değişmedi; yeni production modülü yok.
  `sync.js`, `data/`, panel, push/merge/tag/deploy/browser/device ve gerçek veri
  deposu yazımı yok.

## MON-16 kapanışı — syncGlue callback sahipliği ve strict-mode kararı

- Karar/manifeste: [`MON-S7-SYNCGLUE-KARARI.md`](../deliverables/MON-S7-SYNCGLUE-KARARI.md).
- Canlı kaynak: `app.js:6118` `SeyOnSyncState`, `app.js:6128`
  `SeyOnSynced`, `app.js:6149` `save`; syncGlue `SeymaSave` getter’ı
  `app/core/syncGlue.js:32-35`; `sync.js` çağrıları `:74` ve `:1000`.
- Karar: callback gövdeleri app.js’te kalır. `syncGlue` callback setter/getter
  registry’si kurmaz; yalnız `SeymaSave` canlı getter’ını sunar. Çünkü syncGlue
  app.js’ten önce yüklenir ve getter-only callback property’si app.js strict-mode
  global atamasını `TypeError` ile kırar.
- `save()` closure state, DOM, timer/persistence yardımcıları ve
  `SeySync.schedule` sırasına bağlıdır; MON-16’da taşınmadı. `sync.js` yalnız
  queued/saving/retrying/accepted/error receipt geçişlerinde callbackleri çağırır.
- Callback ataması: app.js `2`, syncGlue executable `0`, sync.js `0`; retry
  kaynakları sync.js online listener + app.js’in 5 dakikalık foreground watchdog’u
  olarak kaydedildi. Index/FILES/cache-bust ve Guard 1/2 değişmedi.
- Kanıt: MON-S7 strict-mode probe PASS; sync `69/69`, syntax, driver, zikr
  `95/95`, state/B1/B2/B3, core/app/panel/Panel-v2/Quran fixture aileleri,
  reminder smoke ve `git diff --check` exit 0. Push/merge/tag/deploy,
  browser/device ve gerçek veri deposu yazımı yok.

## MON-17 kapanışı — syncGlue save gövde aktarımı

- Karar/manifeste: [`MON-S8-SYNCGLUE-SAVE-KARARI.md`](../deliverables/MON-S8-SYNCGLUE-SAVE-KARARI.md).
- `save(touchSource,eventSpec)` gövdesi `app/core/syncGlue.js:39` içindeki
  `SeymaSave.save` registry üyesine taşındı; app.js `:6165` aynı imzayı koruyan
  shim olarak kaldı. `data`/`ui` canlı resolver, storage/`SeySync` lazy resolver
  ile bağlandı; local persistence → privacy projection → schedule sırası,
  `save(false)` davranışı ve `undefined` dönüşü korundu.
- `SeyOnSyncState`/`SeyOnSynced` gövdeleri ve atamaları app.js'te kaldı:
  `:6134/:6144`, callback ataması 2; syncGlue executable callback ataması 0.
  `sync.js` ve Guard hash'i `89255c22ecbbae484667abfd47bf5ee8e6d407bcac09d246edc82b5513ecb5d8`
  olarak değişmedi. Index cache-bust app/syncGlue `20260904a`; production FILES
  zaten doğru sıradaydı.
- İlk tam preflight'ta yeni registryyi yüklemeyen sentetik fixture listeleri
  yakalandı; üretim failure'ı oluşmadan `state → syncGlue → helpers/app.js`
  sırasına hizalandı. Etkilenen fixturelerin tekrar koşusu ve tam app/panel/
  Panel-v2/Quran/premium/reminder kapıları exit 0 verdi: B2 `60/60`, B3 `20/20`,
  save boundary `19/19`, zikr `95/95`, sync `69/69`, large-file `15/15`,
  reminder smoke `20` curated.
- Yerel PASS deploy veya cihaz kabulü değildir. Push, merge, tag, deploy,
  browser, device ve gerçek veri deposu yazımı yapılmadı.

## MON-18 kapanışı — state + syncGlue Dalga 4 no-network raporu

- Kapanış raporu: [`MON-D4-STATE-SYNC-RAPORU.md`](../deliverables/MON-D4-STATE-SYNC-RAPORU.md).
- Kod değişmedi. Canlı manifest: `migrate` state.js `47-285` (23 function
  resolver + `caffeineDefaultBed`), `getDay` `313-453` (17 function resolver +
  `habits`/`windDownSteps` dizileri), `createDefaultData` `477-483` (8
  resolver), `save` syncGlue `39-70` (11 resolver + `key`). App.js shimleri
  `4571/4892/6165/6578`, registry kayıtları `4477/4505/4529/4541` olarak
  canlı kaynakla yeniden ölçüldü.
- `data=` sahipliği değişmedi: yorum dışı taramada app.js 9 kaynak satırı / 11
  token; state.js 0 executable atama. `SeyOnSyncState`/`SeyOnSynced` app.js'te
  `6134/6144`; syncGlue setter/wrapper kurmuyor.
- No-network: state üçlüsü B1 `0 failure`, B2 `60/60`, B3 `20/20`; state
  rebind `37/37`, save boundary `19/19`, sync `69/69`, büyük dosya `15/15`;
  fetch çözülmüyor veya hiç çağrılmıyor, timerlar no-op, sync.js state/app
  boot fixture'larına yüklenmiyor. Driver PASS, zikr `95/95`; zikr'in dış
  provenance vakaları açık finite mock ile sınırlıdır, canlı ağ kanıtı değildir.
- MON-18 fixture değişimi yoktur. MON-S5 gereği yalnız semantik taşıma olsaydı
  fixture güncellenirdi; mevcut state/save parity ve no-network fixture'ları
  aynı anlamla yeniden çalıştırıldı. Index cache-bust, production FILES,
  `sync.js`/Guard hash'i (`89255c22…`) değişmedi.
- I1-I6 ve M1-M4 farkı yok; açık kalan tek konular canlı sync, browser/device,
  push/merge/tag/deploy ve gerçek veri deposu yazımıdır. Bunlar bu yerel
  headless kapanışın sonucu değildir.

## MON-19 kapanışı — prayer domain registry

- Kapanış kanıtı: [`MON-19-PRAYER-FUNCTION-INVENTORY.md`](../deliverables/MON-19-PRAYER-FUNCTION-INVENTORY.md).
- `app/core/prayer.js:1-217`, `window.SeymaPrayer` altında 6 isim, 6 sıra,
  81 şehir, 9 yöntem ve 25 prayer fonksiyonunu taşır. `PRAYER_DEPENDENCIES`
  on named resolver bag'i `data`, `getDay`, `dayIndexFor`, `todayStr`,
  `addDays`, `pad`, `esc`, `save`, `storage`, `fetch` olarak açıktır.
- App.js `:76-107` aynı 25 fonksiyon için `apply(null,arguments)` shimlerini;
  `:4390-4404` canlı state/date/save/storage/fetch bag kaydını taşır.
  `App.fetchPrayerLocationGPS` `app.js`te kalmıştır; prayer modülünde GPS,
  permission, DOM veya production network yoktur.
- Registry load-safe kanıtı: `test_prayer_boundary.js` `19/19`; yüklemede
  fetch/timer/cache-localStorage çağrısı `0`, eksik/ikinci kayıt fail-closed,
  root rebind ve explicit mock fetch/cache hit/apply-save yolu PASS.
- Cache-bust/index/FILES aynı sırada güncellendi: `index.html:59`
  `prayer.js?v=20260904a`, app `v=20260904b`; driver ve zikr FILES paritesi
  `prayer.js`i helpers sonrasında taşır. `sync.js` hash'i
  `89255c22ecbbae484667abfd47bf5ee8e6d407bcac09d246edc82b5513ecb5d8`
  olarak değişmemiştir.
- MON-S5 izinli fixture geçişi yalnız modularization [0]/[4] ve Faz−1.1 F-1
  listelerine prayer eklenmesidir; ayrıca yeni prayer boundary yazılmıştır.
  Tam app boot yapan ilgili sentetik listeler yeni scripti production sırasıyla
  yükler. Eski anlamı bastıran başka assertion yoktur.
- `saygi` içindeki `<button id="faith-preview-card">` dump alt yüzeyi eski/yeni
  `1582` byte ve SHA-256 `a3a5c2c65d7fb74bf4f27dce3920f1802b54229019a0f8cb2ce222159684dcd9`
  olarak eşittir. Tüm saygi dump'ı random içerik taşıdığı için kapsamlı parite
  iddiası bu sabit alt yüzeyle sınırlıdır.
- App/onclick/FX ölçümleri değişmez: `App` assignment `715`, ref `1530`,
  inline onclick `462`, handler attribute `459`, `SeyAudio/SeyHaptics/SeyFx/
  SeyTimeTheme` `76/63/6/4`; state rebind kanıtı 9 source-line/11 token ve
  state executable `data=` `0` olarak kalır.
- Canlı tam kapı seti exit 0: syntax, B1 `0 failure`, B2 `60/60`, B3 `20/20`,
  driver, zikr `95/95`, modularization `52/52`, Faz−1.1 `20/20`, date-utils,
  helpers, state rebind, syncGlue save, Faz10, large-file, app/panel/
  Panel-v2/Quran aileleri, premium ve reminder smoke. `git diff --check` temiz.

`MON-19` tamamlandı; Dalga 5 `1/7`, toplam `19/60`. Sıradaki güvenli adım
`MON-20`: zikir motoru. Yeni açık kullanıcı onayı gerekir; MON-19 kararı
sonraki karta geçiş izni değildir.
