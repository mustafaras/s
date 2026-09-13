# MON-D11 — Delege ve eski gövde tamlık envanteri

**Kart:** MON-56
**Tarih:** 2026-09-13
**Durum:** ⛔ BLOKE — duplicate body bulundu; kaynak kodu değiştirilmedi
**Kapsam:** `app/core/*`, `app.js`, 24 hedef registry ve frozen/KORU yüzeyleri
**Çalışma ağacı başlangıcı:** temiz, `HEAD=23b6dd5` (`docs(mon): close final index and harness parity`)

## Karar

MON-56 kabul edilmedi. Canlı kaynak taraması, `SeymaHelpers` içinde taşınmış
olması gereken üç saf yardımcı gövdenin `app.js` içinde de gerçek gövde olarak
yaşadığını gösterdi:

| Üye | Registry gövdesi | app.js gövdesi | Sonuç |
|---|---:|---:|---|
| `icon` | `app/core/helpers.js:7` | `app.js:22` | duplicate body |
| `esc` | `app/core/helpers.js:3` | `app.js:4593` | duplicate body |
| `find` | `app/core/helpers.js:12` | `app.js:4812` | duplicate body |

Bu üçü yalnız resolver adı değildir: iki tarafta da executable saf helper
implementasyonu vardır. `app.js` tarafındaki implementasyonlar başka app-owned
gövdeler tarafından çağrılıyor olabilir; bu, ikinci registry gövdesini tek
sahipli hale getirmez. Kartın halt protokolü duplicate bulunduğunda düzeltme
uygulamayı değil bloke etmeyi emrettiği için bu committe otomatik cleanup,
shimleştirme, behavior değişikliği veya fixture gevşetmesi yapılmadı.

## Canlı envanter yöntemi ve sınırı

İlk sorgu, kart çalışma sayfasındaki kanonik komutla tekrarlandı:

```text
rg -n 'window\.Seyma|return window\.Seyma' app.js app/core/*.js
```

Registry global atamaları, `node:vm` içinde production core sırasıyla cold-load
edilerek `Object.keys` ile sayıldı. `app.js` shimleri imza-koruyan
`function ... { return <registry>.<member>.apply(null,arguments); }`
örüntüsüyle sayıldı; doğrudan `App.*` atamaları ve render adapterleri ayrı
tutuldu.

## 24 hedef registry / owner tablosu

`registry üyeleri` sütunu, canlı global exportun tüm public key envanteridir.
`Shim` sütunu yalnız app.js'teki imza-koruyan delegeyi gösterir; registry
registration bag'leri, constants ve doğrudan adapterler ayrıca belirtilmiştir.

| # | Kaynak → owner | Canlı export üye sayısı | Shim / adapter | Forbidden direct dependency ve app-owned exception |
|---:|---|---:|---|---|
| 1 | `app/core/constants.js:3` → `SeymaConstants` | 4: `KEY,TKEY,FEATURE_GATE_TS,ICONS` | Shim yok; app.js `SEYMA_CONSTANTS` | Mutable data/DOM/timer/ağ yok; sabitler app.js tarafından okunur. |
| 2 | `app/core/dateUtils.js:48` → `SeymaDateUtils` | 10: `pad,fmt,todayStr,addDays,diffDays,shortDate,dateLabelTR,dayIndexFor,activeDate,curDay` | 10 shim, app.js `4598–4895` | `data/ui` snapshotı yok; `activeDate/curDay` B1 getter üzerinden salt okur. |
| 3 | `app/core/state.js:513` → `SeymaState` | 9: `data,ui,dark,migrate,getDay,createDefaultData,registerMigrate,registerGetDay,registerCreateDefaultData` | `migrate` app.js `4470`, `getDay` `4660`, `createDefaultData` `5420`; B1 getterler app.js/app-owned | `data` rebind, import/reset/location/auth unlock ve `try/finally` swap app.js'te; state registry mutable root yazmaz. |
| 4 | `app/core/helpers.js:99` → `SeymaHelpers` | 12: `esc,icon,find,segTabs,progBar,starRow,miniBars,statTile,collapsibleCardHTML,toast,confetti,haptic` | 9 shim, app.js `4802–5077`; `esc/icon/find` doğrudan kullanımlar duplicate blocker | `toast/confetti/haptic` çağrı anında DOM/titreşim yapabilir; load-time side effect yok. `esc/icon/find` için tek-owner kararı eksik. |
| 5 | `app/core/mediaFx.js:305/527/592/832` → `SeyAudio/SeyHaptics/SeyFx/SeyTouch` | `SeyAudio` 25, `SeyHaptics` 6, `SeyFx` 12, `SeyTouch` 3 | Shim yok; mevcut KORU API | FX API yeniden tanımlanmaz/sarılmaz. Audio, pointer ve visibility etkileri mevcut guarded runtime exceptionıdır; app.js call-site/guard sahibi kalır. |
| 6 | `app/core/timeTheme.js:78/148` → `SeyTimeTheme/SeyAmbience` | 4 + 7: `classForHour,apply,seasonalClass,applySeasonal`; `weatherClass,intensity,seed,seasonClass,timeClass,scene,apply` | Shim yok; mevcut KORU API | Theme/aurora DOM yazımı yalnız çağrıda; timer üretmez. app.js çağrı sırası ve root ownership korunur. |
| 7 | `app/core/prayer.js:185` → `SeymaPrayer` | 30: registration + `PRAYER_NAMES,PRAYER_ORDER,PRAYER_CITIES,PRAYER_METHODS` + `prayerCityByName,prayerCityOptionsHTML,emptyPrayerEntry,emptyPrayerDay,ensurePrayerDay,prayerSettings,prayerLocation,prayerLocationHash,prayerMethod,prayerAdjustments,fmtPrayerTime,parsePrayerTime,prayerCacheKey,prayerReadCache,prayerWriteCache,prayerTimesFromDay,currentPrayerIndex,fetchAladhanTimes,fetchPrayerTimes,applyPrayerTimesToDay,prayerDaySummary,prayerPerformedCount,prayerAllDone,prayerStreak,nextPrayerInfo` | 25 shim, app.js `84–109` | GPS/permission, data mutation ve handler/save/render app.js'te; fetch fonksiyonu registryde yalnız çağrı zamanında çalışır, load-time ağ yok. |
| 8 | `app/core/zikir.js:973` → `SeymaZikr` | 65: registration, 5 zikir constantı, 59 public function/view üyesi | 59 shim, app.js `195–237`, `10111–10163` | App-owned draft/UI/DOM/save sınırı ve sync merge app.js/sync.js'te; `syncZikrDayMirror` çağrı anında resolver kullanır. |
| 9 | `app/core/quran.js:324` → `SeymaQuran` | 37: registration, 15 constant/schema key + `quranNullableStr,quranNormalizeRequestId,quranNormalizeSurahId,quranSafeSurahId,emptyQuranJourney,normQuranNote,quranSortNotes,quranStatusFromStamps,normQuranRequest,ensureQuranJourney,quranStatusRank,quranNewRequest,quranCanRequest,quranReduce,quranRandomToken,quranNewRequestId,quranRandomVerseStart,quranOutboxWriter,quranOutboxErrorLabel,quranResponseForSurah,quranApplyRemoteUpdates` | 21 shim, app.js `362–382`; outbox/transport adapter direct | Frozen transport/outbox/WhatsApp ve foreground pull app.js/content sınırında; `sync.js` yeniden tanımlanmaz. |
| 10 | `app/core/saygi.js:249` → `SeymaSaygi` | 79: registration, `SAYGI_EPOCH,SAYGI_CACHE_PREFIX` + 76 saygı/faith/qibla/read üyeleri; `saygiHTML` dahil | 75 shim, app.js `268–343`; `saygiHTML` render adapter üzerinden | Fetch, IntersectionObserver, permission ve read persistence çağrı-zamanlıdır; app.js handler/focus/save sahibi. `SeymaRender.saygiHTML` ayrı render katmanıdır, duplicate body değildir. |
| 11 | `app/core/motivation.js:730` → `SeymaMotivation` | 27: registration, dependency/catalog keyleri + 21 shim üyesi, `motivationTodayCardHTML,roomOverlayHTML,flexNudgeFor,ROOM_CONTENT_CATALOG,parseScientificProfileMD` | 21 shim, app.js `9334–9370`; 2 render adapter, `flexNudgeFor` direct read | `data`/save/DOM/render app.js; seeded catalog content core ownerıdır. |
| 12 | `app/core/crisis.js:284` → `SeymaCrisis` | 7: `registerCrisis,CRISIS_DEPENDENCIES,crises,crisisFor,crisisOrder,rasitActionsHTML,crisisModalHTML` | 4 shim, app.js `9822–9962` | Crisis data catalog read-only; modal mutation, focus, save and `App` handlers app.js. |
| 13 | `app/core/journal.js:252` → `SeymaJournal` | 13: registration/dependencies + `journalModes,journalPhasePrompts,journalActivePhase,journalPhasePrompt,journalScienceHint,phaseDisplay,phaseShortTitle,journalStreak,fmtDateShort,journalLightCardHTML,journalModalHTML` | 10 shim, app.js `9899–9908`; `journalPhasePrompts` direct catalog | Text input, debounce/save, DOM/focus and render app.js; registry bootta yazmaz. |
| 14 | `app/core/health.js:1130` → `SeymaHealth` | 112: registration/dependencies, nutrition/target constants and complete health function/view export; complete view list `ringSeg,macroBarHTML,nutriInsightHTML,beslenmeCardHTML,targetsCardHTML,waterCard,magnesiumFeedbackHTML,magnesiumBannerHTML,magnesiumCardHTML,magnesiumHeadline,activityRings,sparkCard,medFreeBadge,gaugeBadge,caffeineCurveSVG,caffeineBlock,sleepPrepCard,lastWeight,weightRefMs,weightWeekReady,nextWeightInDays,bodyCard,labCard,discomfortCard,moodScore,moodColorScore,mentalStats,mentalBalanceCard,healthSleepCard,healthWalkCard,healthAppleCard,saglikHTML,fmtTR,cycleWheel,cycleHTML` | 82 shim, app.js `878–10108`; render `saglikHTML` adapter | Data schema writes, native health/permission, DOM and render remain app.js; registry load-safe, call-time dependency resolver. |
| 15 | `app/core/library.js:665` → `SeymaLibrary` | 67: registration/dependencies, `LIBRARY_MEMBERS` and 55 read/view members including `readingStats,bookPct,titlePct,libStats,readTotals,hasRead,readStreak,weekReading,todayReadPages,allQuotes,watchStats,watchDayStats,watchTotals,hasWatch,watchStreak,weekWatch,todayWatchMin,allReplicas,listenDayStats,listenTotals,hasListen,weekListen,listenStreak,musicStats,allLyrics,overlayShell,soulOverlayShell,bookStatusChip,readingOverlayHTML,readingTodayView,bookCard,readingLibraryView,readingStatsView,readingQuotesView,compactModalShell,bookEditModal,quoteAddModal,titleStatusChip,watchOverlayHTML,watchTodayView,titleCard,watchArchiveView,watchStatsView,watchQuotesView,titleEditModal,replicaAddModal,listenKindMeta,listeningOverlayHTML,listeningTodayView,trackCard,listeningFavsView,listeningStatsView,listeningLyricsView,trackEditModal,lyricAddModal,learningEntryCard,learningTodayView,learningOverlayHTML,soulActivityTodayView,soulActivityEntryCard,soulPracticePickerHTML,soulActivityOverlayHTML,soulArchiveSessions,soulArchiveOverlayHTML` | 55 shim, app.js `493–555`; overlay adapters direct | App-owned entry writes, archive backfill, `findBook/findTitle/findTrack/findSoulItem`, DOM/focus/save remain app.js; core resolver names are adapters, not second owners. |
| 16 | `app/core/report.js:347` → `SeymaReport` | 19: registration/dependencies + `REPORT_MEMBERS` and `lastNDays,habitRate,moodDist,monthlySummary,trendBars,nextMilestone,moodScoreOf,avgOf,weekSelfCard,corrInsights,consistencyMomentumCard,badgesGrid,weeklyStepRecap,distanceRecapCard,moodHeatmapCard,raporHTML` | 15 shim, app.js `9967–9981`; `raporHTML` render adapter | Report calculation is registry-owned; print/DOM and cross-domain data write app.js. |
| 17 | `app/core/map.js:320` → `SeymaMap` | 19: registration/dependencies + `MAP_MEMBERS` and `locationCardHTML,hasLiveLocation,wxMode,weatherSpots,wxSpotIconName,wxSpotIcon,wxStale,wxMeta,wxAdvice,wxQuip,wxHm,wxSpotChip,wxLocationPendingChip,wxDetail,weatherHeaderHTML,haritaHTML` | 15 shim, app.js `672–686`; `haritaHTML` render adapter | GPS permission, reverse geocode, weather fetch and data write app.js-owned; map reads via live resolver. |
| 18 | `app/core/profile.js:831` → `SeymaProfile` | 37: registration/dependencies, consent/schema constants and complete `PROFILE_MEMBERS` 30-member assessment API | 30 shim, app.js `705–734`; App-owned consent handlers direct | Profile consent, answers, persistence, modal/focus and save remain app.js; no `data` rebind in registry. |
| 19 | `app/core/settings.js:200` → `SeymaSettings` | 3: `registerSettings,ayarlarHTML,settingsBtn` | `settingsBtn` shim app.js `9985`; `ayarlarHTML` through render registration | Settings schema/migrate/toggle/save and DOM are app.js; render adapter `SeymaRender.ayarlarHTML` is a separate layer. |
| 20 | `app/core/reminders.js:331` → `SeymaReminders` | 26: registration/view registration, definitions/copy, policy, engine/scheduler adapters and center/card views | app.js direct `SEYMA_REMINDERS` calls/registrations, no old `SeymaReminderUI` global | Delivery, permission, persistence, native notification, sync and app timer remain app.js. Live owner name is `SeymaReminders`; old S3 label `SeymaReminderUI` is not used. |
| 21 | `app/core/syncGlue.js:72` → `SeymaSave` | 2: `save,registerSave` | `save` shim app.js `4937` | `data/ui`, local persistence → privacy projection → `SeySync.schedule` order is app-registered; `SeyOnSyncState`/`SeyOnSynced` setters remain app.js. |
| 22 | `app/core/messaging.js:259` → `SeymaMessaging` | 21: registration, AEON constants and `messageTime,dayDivider,mdLite,bubbleDomId,bubbleExpanded,chatClampHTML,clampBubble,lunaBubbleOut,lunaBubbleIn,lunaChatHTML,aeonBubbleText,aeonBubbleKey,aeonMediaSlotHTML,aeonItemHTML,aeonAttachSheetHTML,aeonChatHTML,mesajHTML` | 15 shim, app.js `12895–12948`; `mesajHTML` render adapter | Fetch/poll, message persistence, panel receipt, DOM/scroll/focus and App handlers app.js; frozen API mutation yok. |
| 23 | `app/core/render.js:746` → `SeymaRender` | 24: registration, `onboardingHTML,bugunHTML,saglikHTML,raporHTML,haritaHTML,saygiHTML,motivationTodayCardHTML,roomOverlayHTML,readingOverlayHTML,watchOverlayHTML,listeningOverlayHTML,learningOverlayHTML,soulPracticePickerHTML,soulActivityOverlayHTML,soulArchiveOverlayHTML,ayarlarHTML,mesajHTML,appHeaderHTML,navHTML,overlayShell,soulOverlayShell,modalsHTML,render` | 21 shim, app.js `337–556`, `8688–12949` | `render` DOM/root/theme/scroll/focus call graph app.js dependency bag ile; registry load-safe, no eager render. Layered domain adapters (`saygiHTML`, `ayarlarHTML`, `mesajHTML` vb.) duplicate body değildir. |
| 24 | `app/core/appSurface.js:417` → `SeymaAppSurface` | 40: dependency/registration/dispatch keys + `toggleHabit,toggleMgHabit,explainDerivedHabit,setMood,saveToday`, domain/overlay/lifecycle handlers, `onUserActivity,sessionHeartbeat,finalizeSession,resetSession,onSessionVisibilityChange,maybeRetrySync,maybePullQuranForeground,pollRemote,maybeVoiceGreeting,onAppForeground,reconcileReminderStorageEvent,onDocumentVisibilityChange,onWindowFocus,onWindowPageshow,onWindowOnline,onWindowOffline,ambienceRefresh,reminderLifecycleTimer,start,submitAuth,toggleRememberAuth,dismissAuthError,initialRender` | daily/domain/overlay/lifecycle/boot kayıtları app.js'te; signature-preserving wrappers ve direct `App` delegates | Timer/listener registration, `window.App=App`, data rebind, DOM/focus, save/render/network order app.js-owned. `app.js:11295` içindeki `start` Qibla local helper'dır; `appSurface.js:344` boot owner ile duplicate değildir. |

## Frozen reminder ve ek KORU yüzeyleri

Bunlar 24 hedef tablonun ayrı frozen/KORU kanıtıdır:

| Kaynak → owner | Public inventory | app.js direct edge | Sonuç |
|---|---|---|---|
| `reminderCatalog.js:358` → `ReminderCatalogV1` | `version,idPrefix,copy,definitions,ids,get,getCopy,list` | `app.js:1470` ve reminder policy çağrıları | Tek frozen catalog owner; app.js yalnız okur. |
| `reminderEngine.js:212` → `ReminderEngineV1` | `version,defaultTimezone,validDate,parseTime,addDays,timezoneValid,instantMs,localParts,compareDateTime,occurrenceId,generateOccurrence` | `app.js:2672` ve adapter çağrıları | Tek frozen engine owner; delivery/persistence app.js. |
| `reminderScheduler.js:188` → `ReminderSchedulerV1` | `version,burstMs,catchUpMaxAgeMs,triggerOrder,create` | `app.js:4350` | Tek frozen scheduler owner; timer registration app.js. |
| `reminderDelivery.js:245` → `ReminderDeliveryV1` | `version,channels,capabilities,permissionStates,permissionAliases,nativeBodyPolicy,reminderTagPrefix,reminderPreviewTag,safeToken,deliveryTag,parseDeliveryTag,channelForTag,channelForPayloadType,channelForNotification,permissionState,canRequestPermission,disjointReport,nativeCopyReport` | `app.js:1549`, delivery adapter calls | Tek frozen delivery owner; native permission/notification app.js. |

`SeyAudio`, `SeyHaptics`, `SeyFx`, `SeyTouch`, `SeyTimeTheme`, `SeyAmbience`
ve `SeySkyFx` mevcut KORU API'leridir. Bu kartta yeniden tanımlanmadılar;
media/theme/sky source assignments sırasıyla `mediaFx.js:305/527/592/832`,
`timeTheme.js:78/148` ve `skyFx.js:291` içinde tekildir.

## Duplicate / orphan / forbidden dependency taraması

| Denetim | Canlı sonuç | Karar |
|---|---|---|
| Registry global assignment | Her hedef/frozen/KORU globali tek source assignment; app.js içinde 24 registry assignment yok | PASS |
| App shim member collision | Delegate regex setinde duplicate shim adı: `0` | PASS |
| Helper body ownership | `esc`, `icon`, `find`: core + app.js executable bodies | **FAIL — MON-56 halt** |
| Nested same-name helper | `app.js:11295 start` yalnız Qibla sensor local helper; appSurface `start` ile lexical/owner olarak ayrıdır | PASS / exception |
| Render/domain layered names | `saygiHTML`, `ayarlarHTML`, `mesajHTML`, library overlay names: domain owner + render adapter | PASS / documented exception |
| Direct app-owned helpers | `findBook/findTitle/findTrack/findSoulItem`, data/archive backfill ve handler writers app.js | PASS / documented exception |
| Reverse dependency | Core registryler `app.js` IIFE'ına veya panel'e import etmez; resolver bags kullanır | PASS |
| sync boundary | sync.js ve Guard 1/Guard 2 değişmedi; `SeyOnSyncState/SeyOnSynced` syncGlue tarafından set edilmez | PASS |
| Orphan registry member | Frozen/reminder/render adapters dahil canlı call/registration edge'i olmayan hedef üye bulunmadı | PASS; helper duplicate nedeniyle card kapanmaz |

### Duplicate kanıtı

```text
app.js:22    function icon(name,size,cls){ ... }
app.js:4593  function esc(s){ ... }
app.js:4812  function find(arr,key,val){ ... }

app/core/helpers.js:3   function esc(s){ ... }
app/core/helpers.js:7   function icon(name,size,cls){ ... }
app/core/helpers.js:12  function find(arr,key,val){ ... }
```

İki taraftaki `esc` ve `find` gövdeleri aynı executable saf davranışı,
`icon` ise aynı ICONS→SVG üretici davranışını taşır; yalnız isim benzerliği
değildir. Bu nedenle bunları “dependency adapter exception” diye kabul edip
MON-56'yı kapatmak yanlış olur. Çözüm kararı kullanıcı yönüyle ayrı bir
devam adımıdır; bu kartta uygulanmadı.

## App / onclick / data / FX baseline

Kaynak ölçümü ve mevcut fixture sözleşmesi:

| Ölçüm | Sonuç |
|---|---:|
| `App.* = function` | 556 |
| tüm `App.* =` occurrence | 721 |
| unique App surface | 718 |
| canonical `data` assignment source lines / tokens | 9 / 11 |
| birleşik canonical inline `onclick` | 391 |
| `test_fx2_touch_coverage.js` App/onclick assertion | PASS, 718 / 391 |
| FX public APIs | mevcut KORU surface unchanged |

Raw `rg` çıktısındaki object-property `data=` metinleri canonical rebind
sayımına katılmadı; canonical değer `test_state_rebind_boundary.js` ile
`9/11` olarak yeniden doğrulandı.

## I1–I6 / M1–M4 kontrolü

| Kapı | MON-56 canlı durumu |
|---|---|
| I1 | data shape/persistence değişmedi; kaynak değişikliği yok |
| I2 | App names/signatures/onclick değişmedi; kaynak değişikliği yok |
| I3 | migrate shim + state owner ayrımı mevcut; kaynak değişikliği yok |
| I4 | render/DOM/focus call graph değişmedi; kaynak değişikliği yok |
| I5 | sync.js/Guard 1/2 değişmedi; ağ/remote yazımı yok |
| I6 | Bu kart duplicate nedeniyle tamamlanmadı; sonraki kart açılmadı |
| M1 | Delege deseni çoğunlukla mevcut; `esc/icon/find` tek sahiplik şartı ihlal |
| M2/M2prime | data declaration, 9 rebind, import/reset/unlock app.js'te |
| M3 | callback setter sahipliği app.js'te |
| M4 | FX API/call-site yeniden tanımlanmadı |

## Koşulan kanıtlar

Duplicate tespitinden önce kaynak değişmeden koşulan kritik kapılar:

- `node --check app.js`, `node --check sync.js`, tüm `app/core/*.js`: **PASS**
- `node tests/app/test_modularization_boundary.js`: **101/101 PASS**
- `node tests/app/test_state_rebind_boundary.js`: **37/37 PASS**
- AppSurface daily/domain/overlay/lifecycle/boot: **19/19, 58/58, 49/49,
  16/16, 21/21 PASS**
- FX2 touch/audio/tab/ambience/overlay/palette: **14/14, 12/12, 7/7,
  14/14, 7/7, 12/12 PASS**
- ÆON expand: **24/24 PASS**; Faz10 sync: **69/69 PASS**
- `driver.mjs`: onboarding + seeded + interaction + reminder: **PASS**
- `zikr-harness.mjs`: **95/95 PASS**
- Premium fixture ailesi: **PASS**

Bu kapılar runtime parity'nin mevcut olduğunu gösterir; duplicate body
buluşunu geçersiz kılmaz. MON-56'nın kabulü için duplicate çözülmeden tam
owner inventory kapanışı verilmemiştir.

## Cache-bust / FILES / kapsam

Yeni core dosyası veya source behavior değişikliği yapılmadı. Bu nedenle
`index.html`, driver `FILES`, zikr `FILES`, `app.js`, `sync.js` ve FX manifest
değişmedi; MON-55'in production/harness parity kanıtı korunur. Cache-bust
değişikliği yapılmadı. Browser, local server, token, gerçek veri, remote,
push, merge, tag, deploy ve `mustafaras/seyma-data` write yapılmadı.

## Bloke handoff

MON-56, `SeymaHelpers.esc/icon/find` için tek owner kararı ve kaynak düzeltmesi
olmadan MON-57'ye geçemez. Bu kayıtta source cleanup uygulanmadı; kullanıcı
yönü olmadan sonraki karta geçilmeyecek.
