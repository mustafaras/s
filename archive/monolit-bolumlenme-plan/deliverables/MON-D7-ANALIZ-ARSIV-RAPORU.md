# MON-D7 · Arşiv / analiz / ayar regression raporu

Tarih: 2026-09-11
Dal: premium-fx-gorsel-yuzey — LOCAL-ONLY
Öncül: MON-37 tamamlandı
Kart sınıfı: kapanış
Karar: ✅ PASS — production kodu değiştirilmeden beş registry load-safe ve sahiplik sınırında doğrulandı.

## 1. Kapsam ve canlı otorite

Bu rapor yalnızca MON-33 Library, MON-34 Report, MON-35 Map, MON-36
Profile ve MON-37 Settings registrylerinin canlı kaynak, app.js registration
bag'i, load-order listeleri, dump çıktıları, privacy ve FX sınırlarını
denetler. Kaynaklar:

- app/core/library.js, report.js, map.js, profile.js, settings.js;
- app.js registration ve imza-koruyan shimleri;
- index.html, driver.mjs, zikr-harness.mjs,
  test_state_rebind_boundary.js ve migration FILES listeleri;
- ilgili domain boundary, sync, panel, premium ve headless regression
  fixture'ları.

MON-38 çalışma ağacında production kodu, content, sync, panel, schema,
cache-bust veya FILES değişikliği yapılmadı. Bu kartın tek çıktısı kanıt
raporu ve anti-amnesia state zinciridir.

## 2. Beş registry dependency manifesti

| Registry | Kaynak | Üye | Named dependency | Sahiplik özeti |
|---|---|---:|---:|---|
| SeymaLibrary | app/core/library.js · 666 satır / 108731 byte | 64 | 32 | Beş arşiv/hub görünümü ve istatistik okuması; entry yazımı, archive sync/backfill, save, DOM ve focus app.js |
| SeymaReport | app/core/report.js · 349 satır / 39294 byte | 16 | 29 | KPI, trend, heatmap ve rapor HTML read projection; migrate, save, print, DOM ve mutation app.js |
| SeymaMap | app/core/map.js · 336 satır / 33973 byte | 16 | 24 | Konum/hava/harita read projection; permission, watcher, fetch, persistence ve movement sync app.js |
| SeymaProfile | app/core/profile.js · 870 satır / 64171 byte | 30 | 5 | Frozen 174-item content okuması, consent/progress/scoring/report; consent/session mutation, panel summary ve sync app.js |
| SeymaSettings | app/core/settings.js · 205 satır / 29874 byte | 2 read/render | 11 | ayarlarHTML/settingsBtn; schema/default/migrate/toggle/save/DOM/sync sanitize app.js |

Exact named dependency listeleri:

- Library: data, ui, getDay, todayStr, addDays, dayIndexFor, shortDate,
  fmt, icon, esc, segTabs, progBar, starRow, miniBars, statTile,
  ensureLibrary, ensureWatchlist, ensureMusic, ensureSoulArchive, findBook,
  findTitle, findTrack, findSoulItem, soulActivityById, soulCatalog,
  bookGenres, titleGenres, listenKinds, fmtDur, saygiSafeUrl, wxHm, ucfirst.
- Report: data, ui, dark, todayStr, addDays, diffDays, shortDate, pad,
  countRec, allDays, bestStreak, currentStreak, daysTracked, habitCountOn,
  htToday, find, icon, esc, habits, moods, dayNutrition, proteinGoal,
  waterGoalCups, moodScore, effSteps, dayMovement, fmtDist, sciNote,
  medFreeStreak.
- Map: data, ui, dark, todayStr, pad, countRec, habitCountOn, diffDays,
  moodEmoji, icon, esc, sciNote, bestStreak, moodDist, featuresLive,
  hidePill, cardOpen, fmtDist, fmtDur, autoModeLabel, healthSetupCardHTML,
  collapsibleCardHTML, haversineM, moods.
- Profile: data, ui, save, icon, esc.
- Settings: state, view, theme, icon, esc, reminderCopy, daysTracked,
  countRec, featuresLive, todayStr, syncConfigured.

Settings ayrıca render çağrısı sırasında, opsiyonel salt-okur global edge olarak
MotivationProgramV2/MotivationNarratives sürüm-progress bilgisini ve
SeySync.statusText() durum metnini okur. Cold-load proxy auditinde bu edge'lerin
hiçbiri yükleme anında okunmadı; yazma, fetch, storage veya sync action yoktur.

## 3. Registry graph ve cycle denetimi

Registryler doğrudan import etmez; app.js registration bag'i ve canlı shimler
üzerinden resolver çağrısı yapar:

- app.js → SeymaLibrary: data/ui/state/date/helper/archive read resolverları.
- Library → Map: wxHm app.js shim'i üzerinden; çağrı learningEntryCard
  üretildiğinde lazy çözülür. Library ayrıca Saygi'nın saygiSafeUrl
  güvenli URL helper'ını resolver olarak kullanır.
- app.js → SeymaReport: state/date/analytics ve Health resolverları.
- Report → Health: dayNutrition, proteinGoal, waterGoalCups, effSteps,
  dayMovement ve medFreeStreak.
- app.js → SeymaMap: state/date/weather/health/helper resolverları.
- Map → Report: moodDist; Map → Health: healthSetupCardHTML; Map →
  Helpers: collapsibleCardHTML. MotivationProgramV2 progress'i Map'te
  yalnız render çağrısı sırasında opsiyonel okunur.
- app.js → SeymaProfile: live data/ui/save ve icon/escape resolverları.
  Profile content yalnız window.ProfileAssessmentV1 üzerinden okunur.
- app.js → SeymaSettings: live state/view/theme ve read-only copy/FX
  presentation resolverları.

Beş D7 registry arasında eager cycle yoktur. Library → Map kenarı, Library
modülü index içinde Map'ten önce yüklenmesine rağmen app.js function declaration
hoisting + çağrı-anı resolver ile güvenlidir; registration sırasında Map üyesi
çağrılmaz. Map → Report kenarı doğru index sırasındadır. Cold-load proxy auditinde
beş modülün her biri window read count=0 ile namespace dışında yan etki açmadan
expose edildi.

## 4. Load-safe ve ownership matrisi

| Registry | Cold-load DOM/storage/network/timer | Direct App/Sync access | Mutation sahibi | Denetim |
|---|---|---|---|---|
| Library | 0 / 0 / 0 / 0 | 0 / 0 | app.js entry/archive/save/focus | boundary 45 PASS |
| Report | 0 / 0 / 0 / 0 | 0 / 0 | app.js migrate/save/print/DOM | boundary 12 PASS |
| Map | 0 / 0 / 0 / 0 | 0 / 0 | app.js permission/watch/fetch/persistence | boundary 14 PASS |
| Profile | 0 / 0 / 0 / 0 | 0 / 0 | app.js consent/session/response/panel/sync | boundary PASS |
| Settings | 0 / 0 / 0 / 0 | 0 / 0 at load; status read yalnız render çağrısında | app.js settings schema/default/toggle/save/DOM | boundary 13/13 PASS |

Cold-load denetimi, document/localStorage/fetch/navigator/timer yüzeylerini
throw eden sentetik window Proxy ile tekrarlandı. Beş registryde de
window reads=[] ve expose edilen namespace görüldü. Bu, gerçek browser/device
acceptance değildir; modül yükleme sınırının Node/VM kanıtıdır.

## 5. Profile privacy ve consent zinciri

- ProfileAssessmentV1 frozen content olarak kaldı; registry 174/174 item ve
  current-index parity verdi.
- Consent/privacy HTML baseline ile birebir; cevaplı progress 7698 JS byte,
  boş-session progress 7416 JS byte, scoring ve quality deep-equal.
- profile.js içinde window.SeySync, localStorage, fetch( veya window.App
  kullanımı yoktur.
- Consent/session mutation, response yazımı, progress advance, panel summary,
  sync merge/sanitize ve schema app.js/panel/sync sahipliğinde kalmıştır.
- Panel P3 root-modules 35/35 ve P4 provenance 28/28: profil ilerlemesi
  consent ile görünür; raw response veya hassas profil metni projection/DOM'a
  taşınmaz.
- Faz10 sync 69/69: profile consent geriye dönük açılmaz, unknown consent
  alanları korunur, profileAssessment merge edilir, data.psych değişmez ve
  token alanları sanitize edilir.

Privacy/consent farkı bulunmadı; halt koşulu oluşmadı.

## 6. Map lazy call ve location privacy

Map boundary 14/14 PASS:

- map.js cold load'unda navigator.geolocation, watchPosition, fetch, timer,
  storage veya DOM çağrısı yoktur;
- fixed/live weather ve konum projection yalnız registry method çağrısında
  canlı state'ten seçilir;
- persisted locationEnabled boot'ta watcher veya silent permission probe
  başlatmaz;
- permission/error copy, navigator watcher, reverse geocode ve weather fetch
  app.js'te kalır;
- açık kullanıcı yolu App.requestLocationGatePermission/App.toggleWeather'tır;
- renderHarita state hazırlığı app.js shiminde korunur; registry HTML/projection
  testte state mutation yapmaz.

Map → Report/Health/Helpers kenarları read-only resolver olarak kalır; ağ,
izin ve persistence ownership sınırı aşılmaz.

## 7. Settings FX manifesti

| Surface | Settings presentation | Runtime owner / gate |
|---|---|---|
| premiumAtmosphere | master Açık/Kapalı | SeyFx master gate; SeyAudio/SeyHaptics/timeTheme |
| uiSounds | FX row | SeyAudio/SeyFx sound gate |
| richHaptics | FX row | SeyHaptics rich pattern gate |
| launchRitual | FX row | app boot/FX call sites |
| voiceGuidance | FX row + voice controls | SeyAudio voice gate ve quiet-time |
| ambientSounds | FX row | SeyAudio ambient gate |
| voiceCloudTts / voiceCloudVoice | voice seçici ve bağlı durum | App-owned setting; SeyAudio cloud path |
| voiceLang / voiceRate / voicePitch / local voice | read-only controls | App-owned handlers; runtime audio gate |

settings.js yalnız bu yüzeyleri okur ve HTML üretir. FX toggle mutation,
schema/default/migrate ve App handlerları app.js'te kalır. Premium settings
39/39 ve time-theme 53/53 PASS; master off, reduced-motion, sound, voice,
ambient, haptics ve time/season class gating regression vermedi.

## 8. Production-order dump manifesti

Driver commandı her tab için exit 0 verdi. Aşağıdaki ölçümler aynı sentetik
production-order harness koşusundaki current HTML dump dosyalarıdır:

| Surface / dump tab | UTF-8 byte | SHA-256 |
|---|---:|---|
| Library hub context · bugun | 112397 | df74c8edfbee6da8760f3e9c62ce891c350fc791596abc87d1be052a7183aa0e |
| Report · rapor | 139367 | 65d8c7a4fb916ee39c7fa890bcc1ffa82477b7e2981224af1b22e530b465eaec |
| Map · harita | 29084 | fda1652f8242b4c74fc1e2e6590b9ab26918bdc1f47b08ee7db0a55ba295c749 |
| Profile · profile | 7435 | 3ab539de5f61c5746375228d20f4bcf579abb127e5c0484e87a0ff1ff9e0b004 |
| Settings · ayarlar | 46190 | c9b61ca64b4905eac1df833af5e125f7e9898a7a123ab6df21c479af84704eb4 |

Profile ve Settings hashleri önceki kartların frozen parity kanıtlarıyla da
eşleşmektedir. MON-38 kod değişikliği olmadığı için yeni BEFORE/AFTER üretim
diff'i aranmadı; current dump manifesti ve önceki kart parity kanıtları birlikte
kapanış kanıtıdır.

`bugun` dumpı 112397 byte olarak sabit kaldı; pre-commit koşusundaki
`d71cf16e…14876` yerine final koşusunda `df74c8ed…3aa0e` SHA'sı geldi. İlk
fark mevcut günlük yüzeydeki rastgele `Günışığı` skorunun 82/100 → 87/100
değişmesidir; bu registry veya production değişikliği değildir. Rapor,
final koşusunun SHA'sını canonical manifest olarak kullanır; rapor/harita/
profile/ayarlar byte ve SHA değerleri final tekrarında sabit kaldı. Bu
non-deterministic dump notu append-only LEDGER seq 54'te de kaydedildi.

## 9. Cache-bust / FILES etkisi

MON-38 production değişikliği olmadığı için cache-bust ve FILES listelerinde
delta yoktur. Canlı relative order beş zincirin tamamında aynıdır:

library → report → map → profile → settings

PASS kaynakları:

- index.html: library/report/map v20260910a, profile/settings v20260911a;
- .claude/skills/run-seyma/driver.mjs;
- .claude/skills/run-seyma/zikr-harness.mjs;
- tests/app/test_state_rebind_boundary.js;
- .claude/skills/run-seyma/verify-state-migration-boundary.mjs.

Relative-order probe beş dosyada da PASS verdi. Kod/production değişikliği,
cache-bust bump veya yeni FILES üyesi gerekmedi.

## 10. Gate evidence

| Gate | Sonuç |
|---|---|
| node --check app.js, sync.js ve beş registry | PASS |
| driver full + bugun/rapor/harita/profile/ayarlar dump | PASS |
| Library/Report/Map/Profile/Settings boundary | 45 / 12 / 14 / PASS / 13/13 |
| modularization boundary | 99/99 |
| Faz10 sync | 69/69 |
| migration boundary | 67/67 |
| panel P3 / P4 | 35/35 · 28/28 |
| premium family | 9/9 |
| app family | 44/44 |
| zikr harness | 95/95 |
| panel / Panel-v2 / Quran | 23/23 · 27/27 · 9/9 |
| reminder smoke | 20 curated fixture, exit 0 |
| cold-load Proxy audit | beş registry PASS, window reads=[] |

Commit sonrası doğrulama notu: doğrudan yeni HEAD üzerinde çalıştırılan
`node tests/app/test_settings_boundary.js` çağrısı, fixture'ın
`git show HEAD^:app.js` ile baseline seçmesi nedeniyle `HEAD^` artık MON-37
shim'ini okudu ve eski render çağrısında `window.SeymaSettings` yok hatası
verdi. Bu production failure değildir ve kod değişikliği yapılmadı. Test,
MON-37 commit'inin temiz yerel klonunda (testin beklediği MON-37 → MON-36
parent history) yeniden çalıştırıldı ve **13/13 PASS** verdi. Aynı nedenle
geniş app loop'unun yeni HEAD'deki doğrudan tekrarında da yalnız bu fixture
failed; pre-commit canonical app gate **44/44 PASS** ve parent-checkout
replay ile Settings parity kanıtı korunmuştur. Bu fixture-history farkı
append-only LEDGER seq 53'te kaydedildi; state `blockedPrompt=null` kaldı.

## 11. S1–S8 / I1–I6 / M1–M4 kararı

- S1–S8: source, load-order, headless harness, privacy, no-network,
  redaction, sync ve local-only sınırları PASS.
- I1: data shape/persistence değişmedi; MON-38 production diff'i yok.
- I2: App handler/imza/inline onclick yüzeyi değişmedi.
- I3: migrate/default/future-root davranışı değişmedi; migration 67/67.
- I4: render/DOM/modal ownership değişmedi; dump ve panel gates PASS.
- I5: sync.js/Guard ve remote data boundary untouched; Faz10 PASS.
- I6: bu rapor + state zinciri tek yerel MON-38 commitinde tutulacak.
- M1: beş registry cold-load side-effect açmıyor.
- M2/M2prime: data/rebind/import/reset/unlock app.js ownershipinde.
- M3: sync globals ve syncGlue ownershipi değişmedi.
- M4: FX manifesti, master gate ve premium/time-theme regression PASS.

## 12. Açık sınırlar ve dürüstlük notu

- Headless Node/VM kanıtı gerçek browser/device acceptance değildir.
- Remote read/write, push, merge, tag, deploy ve mustafaras/seyma-data yazımı
  yapılmadı.
- Plan README başlığında eski 32/60 → MON-33 locator metni bulunuyor; canlı
  state otoritesi MON-STATE.json/CURRENT-STATE.md olduğundan bu kartta README
  dışı plan kaynağına dokunulmadı. Bu drift production, privacy veya eager
  side-effect bulgusu değildir.
- Settings'in MotivationProgramV2/MotivationNarratives/SeySync.statusText
  okumaları named resolver bag'i dışındaki opsiyonel call-time read edge'leridir;
  cold-load'da okunmadı ve herhangi bir write/network/permission yolu yoktur.
  Bu nedenle MON-38 halt koşulu değildir; gelecekte render/appSurface
  geçişinde korunması gereken açık bir ownership notudur.

## Sonuç

Beş registry load-safe, resolver graph cycle'sız ve ownership sınırları
kanıtlıdır. Profile privacy/consent, map lazy permission/network, settings FX
gating ve dump manifesti PASS'tir. MON-38 kabul edildi; sonraki kart MON-39'dur
ve yeni açık kullanıcı yönü olmadan başlatılamaz.
