# MON-39 · Domain ara-kapanış: 15 registry envanteri

Tarih: 2026-09-11
Dal: `premium-fx-gorsel-yuzey` — LOCAL-ONLY
Öncül: MON-38
Kapsam: yalnız domain sahiplik/delege envanteri ve kanıt zinciri; üretim kodu yok.

## Karar

Canlı kaynak yeniden ölçüldü. Prayer, Zikr, Quran, Saygı, Motivation, Crisis,
Journal, Health, Library, Report, Map, Profile ve Settings için tek registry
sahibi, app.js shim/delege yüzeyi ve named resolver bag'i mevcut ve
ölçülebilir. Reminders ve Messaging henüz registryye alınmamıştır; bu iki
hedefin sahibi açıkça app.js/frozen yüzey olarak kaydedilmiş, gelecek MON-40 ve
MON-42 sınırına bırakılmıştır. Böylece eksik bir registry varmış gibi olumlu
kanıt üretilmemiştir.

Bu belgede **source body** sayısı canlı dosyada `function NAME(` deklarasyonu
sayısıdır (iç içe deklarasyonlar dahil); **API function** sayısı load-safe VM'de
registryden expose edilen fonksiyon sayısıdır (`register*` hariç); **shim** sayısı
app.js'teki imza-koruyan `*.apply(null, arguments)` delege sayısıdır. Sayımlar
bu tanımlarla ve canlı kaynakla yeniden üretilebilir; taşınmayan app.js
fonksiyonları ayrıca “app-owned boundary” olarak listelenmiştir.

## 1. On beş domain hedef tablosu

| Domain / tek sahip | Kaynak gövde → API function | Shim / resolver | Fixture kanıtı | Dump tabı | Open risk ve app.js orphan/app-owned yüzey |
|---|---:|---|---|---|---|
| **Prayer** → `app/core/prayer.js`, `window.SeymaPrayer` | `217 wc` · `36 → 25` | `25` (`app.js:82–107`); `10` named resolver: `data,getDay,dayIndexFor,todayStr,addDays,pad,esc,save,storage,fetch` | `test_prayer_boundary.js` **19/19**; driver + zikr harness | `saygi` (faith aggregate) | `App.fetchPrayerLocationGPS`, `App.refreshPrayerTimes`, `App.togglePrayer`, `App.setPrayerCity`, `App.setPrayerMethod`, `App.setPrayerNote`, `App.generatePrayerReminder*`; permission/GPS, explicit fetch/cache, save ve reminder occurrence app-owned. |
| **Zikir** → `app/core/zikir.js`, `window.SeymaZikr` | `1040 wc` · `88 → 59` | `59` (`app.js:193–235`, `10263`, `10315`); `22` live resolver: motor 6 + view/UI 16 | `test_zikir_boundary.js` **17/17**, `test_zikir_view_boundary.js` **17/17**, manual **21/21**; zikr harness **95/95** | `saygi` aggregate + zikr harness | `App.openZikr/closeZikr/zikrTap`, preset/view/filter/note/manual/hatim/reset handlers, draft mutation, overlay/focus, DOM paint ve guide/FX kabuğu app-owned. |
| **Quran** → `app/core/quran.js`, `window.SeymaQuran` | `363 wc` · `28 → 21` | `21` (`app.js:360–380`); `1` resolver: `data` | `test_quran_boundary.js` **20/20**; Quran ailesi **9/9** | `saygi` (Quran hub) | `App.open/closeQuranJourney`, query/filter/modal/note/status handlers, `App.quranJourneyRequest/Submit`, `App.refreshQuranUpdates`, DOM/save kabuğu app-owned; outbox/delivery/response transport `SeySync`/content sahipliğinde. |
| **Saygı** → `app/core/saygi.js`, `window.SeymaSaygi` | `269 wc` · `101 → 76` | `76` (`app.js:266–341`); `15` named resolver: `data,ui,getDay,todayStr,addDays,diffDays,dayIndexFor,dateLabelTR,icon,esc,featuresLive,render,quranJourneyHubCardHTML,zikrVisible,zikrPreviewCardHTML` | `test_saygi_boundary.js` **20/20**; modal focus **41/41**; zikr harness **95/95** | `saygi` | `App.browseSaygiPerson`, `App.open/closeSaygi*`, `App.markSaygiRead`, `App.open/closeQibla`, `App.enableQiblaCompass`; orientation/GPS/permission, live DOM paint ve observer wiring app-owned; explicit Wikipedia fetch registry içinde lazy. |
| **Motivation** → `app/core/motivation.js`, `window.SeymaMotivation` | `744 wc` · `38 → 24` | `23` shim (`app.js:9377–9413`) + `flexNudgeFor` doğrudan registry edge'i; `13` resolver | `test_motivation_room_accessibility.js` **12/12**; driver bugun | `bugun` (Terapi Odası) | `App.open/closeRoom`, room tab/tool/card, `App.completeMotivationTask`, `App.saveDailyWin`, reflection/copy/tool timer handlerları ve `App.fetchProfileForRoom` ağ kabuğu app-owned; timer/DOM/save/network registryye taşınmadı. |
| **Crisis** → `app/core/crisis.js`, `window.SeymaCrisis` | `290 wc` · `13 → 5` | `4` shim (`crisisFor`, `crisisOrder`, `rasitActionsHTML`, `crisisModalHTML`) + `crises` sabit katalog doğrudan; `9` resolver | `test_crisis_boundary.js` **40/40**; modal focus **41/41** | `sos` | `App.open/closeCrisis`, dropdown/option/trigger/note, `App.completeCrisis`, `App.resetCrisis`; safety state write, save, focus ve close kabuğu app-owned. |
| **Journal** → `app/core/journal.js`, `window.SeymaJournal` | `267 wc` · `22 → 11` | `10` shim (`app.js:10051–10060`) + `journalPhasePrompts` sabit manifesti doğrudan; `10` resolver | `test_journal_boundary.js` **33/33**; modal focus **41/41** | `bugun` (Günlük Işığı) | `App.open/closeJournalModal`, `App.setJournalMode`, `App.onJournalText`, `App.useJournalPrompt`, `App.saveJournal`; textarea/DOM/focus, save sırası ve derived habit mutation app-owned. |
| **Health** → `app/core/health.js`, `window.SeymaHealth` | `1147 wc` · `138 → 84` | `83` external shim + `magnesiumCardHTML` registry içi internal helper; `44` resolver (`8 + 36 view`) | `test_health_boundary.js` **30/30**; today preferences **11/11**; modularization; driver | `saglik` | `App.take/skip/snooze/editMagnesium`, meal/sleep/cycle/body/lab/target handlers, `refreshTargets`, DOM/save/focus and schema/migrate app-owned. `magnesiumCardHTML` external orphan değil; `saglikHTML` içinden kullanılan internal view helperdır. |
| **Library** → `app/core/library.js`, `window.SeymaLibrary` | `666 wc` · `103 → 64` | `64` shim (`app.js:491–554`); `32` resolver | `test_library_boundary.js` **45/45**; daily photo **12/12**; modal focus **41/41** | `bugun` (beş hub) | `syncEntryToLibrary/Watchlist/Music/SoulArchive`, `unsyncSoulEntry`, `backfillArchivesFromDays`, entry/edit/delete/save/archive handlers ve focus/render app-owned; `bookId/itemId/archiveId` identity korunur. |
| **Report** → `app/core/report.js`, `window.SeymaReport` | `349 wc` · `49 → 16` | `16` shim (`app.js:10119–10134`); `29` resolver | `test_report_boundary.js` **12/12**; driver | `rapor` | `reportHTML`, `App.printReport`, print/DOM/render ve state rebind app-owned; registry yalnız KPI/trend/heatmap/read projection üretir. |
| **Map** → `app/core/map.js`, `window.SeymaMap` | `336 wc` · `51 → 16` | `16` shim (`app.js:670–688`, `haritaHTML` wrapper dahil); `24` resolver | `test_map_boundary.js` **14/14**; local visual guard; driver | `harita` | `App.requestLocationGatePermission`, `App.toggleLocation`, `App.toggleWeather`, watcher, `fetchWeather`, reverse geocode, persistence ve movement sync app-owned; cold render GPS/fetch başlatmaz. |
| **Profile** → `app/core/profile.js`, `window.SeymaProfile` | `870 wc` · `41 → 30` | `30` shim (`app.js:703–732`); `5` resolver: `data,ui,save,icon,esc` | `test_profile_boundary.js` PASS; **174/174** item/current-index, consent/privacy ve scoring/quality parity; P4 **28/28** | `profile` | `App.profileAcceptConsent`, answer/previous/break/SOS/completion/session mutation, `buildProfilePanelSummary`, render/DOM/focus, sync merge/sanitize ve schema app-owned. Frozen `profileAssessmentV1` salt-okur; privacy/consent sınırı açık. |
| **Settings** → `app/core/settings.js`, `window.SeymaSettings` | `205 wc` · `16 → 2` | `2` shim (`app.js:10136–10137`); `11` resolver: `state,view,theme,icon,esc,reminderCopy,daysTracked,countRec,featuresLive,todayStr,syncConfigured` | `test_settings_boundary.js` parent-history replay **13/13**; premium settings **39/39**; time-theme **53/53** | `ayarlar` | `migrate/createDefaultData`, schema/default, `App.setTheme`, `App.toggleHaptic`, `App.toggleSetting`, `App.adjustHijriOffset`, voice/premium/ambient/save/DOM/sync sanitize app-owned. Direct current-HEAD fixture kırmızısı MON-38 seq 53 olarak açıkça izlenmiştir; ürün/registry farkı değildir. |
| **Reminders** → app.js runtime adapter + frozen `ReminderCatalogV1/EngineV1/SchedulerV1/DeliveryV1` | Frozen dört dosya toplam `1053 wc` · `38 → 23` API function (`3+9+1+10`); app.js reminder runtime `376` declaration + `128` `App.*` handler | **SeymaReminders yok**; `Reminder*V1` global registryleri doğrudan read-only tüketilir; app runtime için shim/resolver registry yok | `tests/reminders/test_*.js`: **21/21** individual; `run-reminder-smoke.mjs`: **20 curated**; driver reminder deep-link | `bugun` Reminder Center/deep-link | MON-40 hedefidir. Native permission, delivery/scheduler, notification, sync/local merge ve release boundary app.js/frozen sahipliğinde kalır; releaseApproval hâlâ `NOT_APPROVED`. Bu bilinçli ön-registry orphan yüzeyidir, duplicate ownership değildir. |
| **Messaging** → app.js observer/ÆON/Luna/notification surface | `app.js:12063–13543` içinde `97` function declaration · `35` `App.*` handler; `app/core/messaging.js` yok | **SeymaMessaging yok**; shim/resolver yok; app.js doğrudan data/ui/DOM/network/timer/attachment sınırını taşır | `test_aeon_message_expand.js` **24/24**; modal focus **41/41**; driver `--dump mesaj` | `mesaj` | MON-42 hedefidir. `notif*`, `aeon*`, `luna*`, `streamAsk/finishAsk`, media/attachment, `mesajHTML`, `App.toggleMsg/toggleAeonBubble/openMesaj` ve 35 handler bilinçli app-owned orphan yüzeyidir; expand persistence, scroll, notification dedupe ve attachment akışı korunmadan taşınamaz. |

## 2. Resolver ve sahiplik mutabakatı

Registry export/shim karşılaştırması canlı source ve VM API anahtarlarıyla
yapıldı. Dışarıdan çağrılan fonksiyonlarda beklenmeyen orphan veya ikinci sahip
yoktur:

- Prayer **25/25**, Zikr **59/59**, Quran **21/21**, Saygı **76/76**,
  Library **64/64**, Report **16/16**, Map **16/16**, Profile **30/30**,
  Settings **2/2** shim/API eşleşmesidir.
- Motivation **24 API = 23 shim + doğrudan `flexNudgeFor`**; Crisis **5 API =
  4 shim + doğrudan `crises` katalog**; Journal **11 API = 10 shim + doğrudan
  `journalPhasePrompts` manifesti**. Bunlar ölçülmüş ve belgelenmiş doğrudan
  read edge'lerdir, orphan değildir.
- Health **84 API = 83 external shim + registry içi `magnesiumCardHTML`**;
  `magnesiumCardHTML` app.js dış çağrısı beklemeyen internal helperdır.
- Reminders ve Messaging için registry yokluğu, hedef kartlarının sıralı
  durumudur; app.js/frozen sahiplik açıkça yazıldığı için “registry var” diye
  yanlış pozitif üretilmemiştir.

Registry dependency graph'ında eager cycle, cold-load side effect veya
privacy/consent sınırı aşımı bulunmadı. `data/ui/dark` rebind, `migrate`,
`getDay`, `save`, DOM/render, permission, network, sync ve App mutation
fonksiyonları ilgili app.js sınırlarında kalır.

## 3. Dump manifesti

Komut: `node .claude/skills/run-seyma/driver.mjs --dump <tab>`. Ölçüm dosya
UTF-8 byte ve SHA-256'dır; driver'ın parantez içindeki değeri JS string byte
uzunluğudur.

| Dump | UTF-8 byte | SHA-256 | Not |
|---|---:|---|---|
| `bugun` | 112397 | `a452086444c96bf58fe4401740e9863d60169ad7545c412311f69969cc4b9a59` | Günışığı random skoru nedeniyle run-to-run SHA değişebilir; byte sabit yüzeydir. |
| `saglik` | 65868 | `b5cde2bf7d45ea30607d5177359e942e38c18c37269b156049d9d596cad4333c` | Health view/current run. |
| `saygi` | 20383 | `37805e0f4650baf8da475957d35dccecdf3510c24f2ddbd48cb8c21cf9d8f52b` | Zikir/Quran/prayer aggregate yüzeyi; random içerik etkilenebilir. |
| `sos` | 8099 | `4956039d2bab6e544b8bde98f6eced6114c1d210a2aa9fe9b4de5e20a0d3a40b` | Crisis safety surface. |
| `harita` | 29084 | `fda1652f8242b4c74fc1e2e6590b9ab26918bdc1f47b08ee7db0a55ba295c749` | Map dump. |
| `rapor` | 139367 | `65d8c7a4fb916ee39c7fa890bcc1ffa82477b7e2981224af1b22e530b465eaec` | Report dump. |
| `mesaj` | 17138 | `15df13b7138af356d7c5a4d9c80e0b5719eeb0e7d8b7d002bf1998c1b09394da` | Messaging dump; provider/token/network kullanılmadı. |
| `profile` | 7435 | `3ab539de5f61c5746375228d20f4bcf579abb127e5c0484e87a0ff1ff9e0b004` | `1 / 174 · %0`; consent/progress görünümü. |
| `ayarlar` | 46190 | `c9b61ca64b4905eac1df833af5e125f7e9898a7a123ab6df21c479af84704eb4` | Settings/FX read surface. |

Zikr ve Quran için dedicated driver tabı yoktur; `saygi` aggregate ve
`zikr-harness` canonical kanıttır. Reminders için `bugun` Reminder Center
deep-link canonical yüzeydir.

## 4. App / onclick / FX değişmezlik manifesti

Baseline `HEAD` ile current çalışma ağacı aynı canlı source olarak karşılaştırıldı;
delta sıfırdır:

| Ölçüm | HEAD | Current | Delta |
|---|---:|---:|---:|
| `App.<name> = function` | 556 | 556 | 0 |
| tüm `App.<name> =` | 721 | 721 | 0 |
| unique App assignment name | 718 | 718 | 0 |
| `App.<name>` reference | 1137 | 1137 | 0 |
| direct `onclick=...App.` (`app.js`) | 153 | 153 | 0 |
| state fixture canonical `data=` inventory | 9 source line / 11 token | 9 / 11 | 0 |
| `SeyAudio` / `SeyHaptics` / `SeyFx` / `SeyTimeTheme` | 78 / 63 / 58 / 6 | 78 / 63 / 58 / 6 | 0 |

`app.js`, `sync.js`, `index.html`, `driver.mjs`, `zikr-harness.mjs`,
`test_state_rebind_boundary.js` ve migration FILES kaynağının HEAD SHA/byte
değerleri current ile birebirdir. Profile content, sync merge, panel,
schema, render/appSurface ve FX kaynaklarında değişiklik yoktur.

## 5. Cache-bust / FILES etkisi

MON-39 envanter kartı üretim dosyası eklemedi; bu nedenle yeni cache-bust veya
FILES üyesi yoktur. Canlı index sırası ve mevcut değerler:

```text
prayer(20260904a) → zikir(20260904b) → quran(20260904a) → saygi(20260904a)
→ motivation(20260909a) → crisis(20260909a) → journal(20260909a)
→ health(20260910a) → library(20260910a) → report(20260910a)
→ map(20260910a) → profile(20260911a) → settings(20260911a)
→ mediaFx → timeTheme → reminderCatalog(20260813a) → reminderEngine(20260818a)
→ reminderScheduler(20260818a) → reminderDelivery(20260818a) → app.js
```

Bu sıra `index.html`, `driver.mjs`, `zikr-harness.mjs`,
`test_state_rebind_boundary.js` ve migration FILES ile eşleşir. `Messaging`
için yeni dosya, `Reminders` için `app/core/reminders.js` yeni dosyası bu kartta
oluşturulmadı; MON-40/42 yetkisi saklıdır.

## 6. Kapı kanıtı

| Kapı | Sonuç |
|---|---|
| `node --check` app/sync + 17 core/frozen reminder source | PASS |
| driver full | PASS |
| zikr harness | **95/95** |
| B1 helper / B2 migration / B3 adapter | PASS / **67/67** / **20/20** |
| modularization / Faz−1.1 / dateUtils / helpers / rebind / save / large file | **99/99** / **27/27** / **59/59** / **31/31** / **37/37** / **19/19** / **15/15** |
| domain boundaries | Prayer 19/19; Zikr 17/17 + view 17/17; Quran 20/20; Saygı 20/20; Motivation 12/12; Crisis 40/40; Journal 33/33; Health 30/30; Library 45/45; Report 12/12; Map 14/14; Profile PASS |
| Settings | MON-37 parent-history replay **13/13**; premium **39/39**; time-theme **53/53** |
| Messaging / modal | ÆON expand **24/24**; modal focus **41/41** |
| app family | current HEAD loop **43/44** only because direct Settings fixture has known HEAD^ locator failure; canonical parent-history replay restores the missing **13/13** |
| premium / panel / Panel-v2 / Quran | premium **9/9 files**; panel **23/23**; P3 **35/35**; P4 **28/28**; Panel-v2 **27/27**; Quran **9/9** |
| reminders | **21/21** individual fixtures + **20 curated smoke** |
| `git diff --check` | PASS |

The current-head Settings failure is not hidden: `test_settings_boundary.js`
uses `git show HEAD^:app.js`; after MON-38 that locator resolves the MON-37
shim instead of the pre-MON-37 body. The same test in a clean MON-37 commit
worktree (`32ad00a`) passes **13/13**. This is the exact MON-38 seq 53
fixture-history finding; no production, registry, privacy or semantics failure.

## 7. S1–S8 / I1–I6 / M1–M4 ve sınırlar

- S1–S8: source inventory, owner/delegate, load-order, fixture, dump,
  no-network/headless, privacy and local-only evidence recorded.
- I1: data shape/persistence semantics untouched; no schema/content change.
- I2: App names/signatures, inline onclick and handler surface unchanged.
- I3: migrate/default/future-root path unchanged; B2 **67/67**.
- I4: render/appSurface/modal/DOM ownership değiştirilmedi; dump/focus gates pass.
- I5: sync.js, Guard 1/2, panel and remote data boundary untouched.
- I6: only this deliverable and anti-amnesia state chain are in scope for the
  MON-39 local commit.
- M1: existing registries load-safe and shimmed; planned Reminders/Messaging
  absence is explicit rather than silently treated as complete.
- M2/M2prime: rebind/import/reset/location/auth boundaries remain app.js-owned.
- M3: sync globals and syncGlue setter ownership unchanged.
- M4: FX API occurrence and guarded call-site manifest delta is zero.

No orphan/duplicate ownership requiring a halt was found. The app-owned
functions listed in §1 are deliberate mutation/DOM/permission/network/render
boundaries, while the two not-yet-created registries are explicitly routed to
MON-40 and MON-42. Privacy/consent difference, eager side effect, content
mutation or schema difference bulunmadı.

## 8. Dürüstlük ve sonraki güvenli sınır

Kanıtlar Node/VM headless ve yerel kaynak karşılaştırmasıdır; gerçek browser,
device/GPS, live account, remote read/write, push, merge, tag, deploy veya
`mustafaras/seyma-data` yazımı yapılmadı. `releaseApproval=NOT_APPROVED` olarak
kalır. MON-39 sonrası sıralı hedef **MON-40 reminders runtime**'dır; kullanıcı
yönü olmadan otomatik uygulanmaz.
