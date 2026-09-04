# MON-20 — Zikir motor envanteri

**Tarih:** 2026-09-04
**Öncül:** MON-19
**Durum:** ✅ tamamlandı; LOCAL-ONLY
**Dal:** `zikirmatik-manuel-zikir`

## Karar ve sınır

MON-20, zikir domaininin seed, normalizasyon, hedef/hatim matematiği,
oturum, tarihçe/tefekkür, ayar, dokunuş ve manuel kayıt motorunu
`window.SeymaZikr` registry'sine aldı. `app.js` aynı imza ve dönüş yüzeyini
koruyan shimleri ve tek dependency bag kaydını taşır.

`data` kökünün bildirimi/rebind'i, `getDay` sahibi olan app kabuğu,
`render`/DOM/timer davranışı ve bütün `App.*` handler gövdeleri app.js'te
kaldı. Zikir view üreticileri özellikle taşınmadı. `sync.js`, panel,
frozen zikir content katalogları, veri dosyaları ve network yüzeyi değişmedi.

## Taşınan üyeler

Kaynak: [`app/core/zikir.js`](../../app/core/zikir.js).

- Seed ve şema: `ZIKR_SEED`, `ZIKR_SCHEMA_VERSION`, `ZIKR_MIGRATION_VERSION`,
  `ZIKR_MANUAL_MAX`, `ZIKR_MANUAL_KEEP`.
- Normalizasyon/migration: `emptyZikrRoot`, `zikrNormalizeManualEntry`,
  `migrateZikrV5`, `emptyZikrDay`, `emptyZikrPresetDay`, `zikrEsmaSeed`,
  `zikrSeedPreset`, `zikrNormalizeRoot`, `migrateZikrV2/V3/V4`.
- Hedef/oturum/tarihçe: `zikrBaseTarget`, `zikrHatimTarget`, `zikrMath`,
  `zikrNewHatim`, `ensureZikrRoot`, `zikrPreset`, `zikrActivePreset`,
  `zikrDay`, `zikrPresetDay`, `zikrPresetDayCount`, `zikrReflection*`,
  `zikrPresetDone`, `zikrDayCompleted`, `zikrStreak`, `zikrWeek`,
  `zikrJourney`, `zikrActiveHatim`, `zikrJourneyProgress`,
  `zikrSessionState`, `zikrTouchTick`, `syncZikrDayMirror`.
- Manuel motor ve FX: `zikrManualActive`, `zikrTickSound`,
  `zikrPauseSession`, `zikrManualApply`, `zikrManualUndoEntry`,
  `zikrManualEntryCountFor`.

Registry, `data/getDay/todayStr/addDays/dayIndexFor/save` resolver bag'i
olmaksızın fail-closed'dur; yükleme anında resolver çağırmaz. Modülün
`document`, `fetch`, `localStorage`, timer ve executable `data=` yüzeyi yoktur.
`stateData()` canlı `data` resolverını okur; snapshot root veya root rebind'i
kurmaz.

## FX ve görünüm değişmezliği

- `SeyAudio.tap` tek gerçek çağrı olarak modüle taşındı; `soundOn` guardı ve
  `window.SeyAudio`/fonksiyon varlığı kontrolü aynen korundu.
- `SeyAudio.guides.zikirStart`, `zikirComplete`, `zikirHalf`,
  `SeyHaptics.streak` ve zikir completion `SeyAudio.bell` çağrıları app-owned
  `App.zikrTap`/manuel kabukta kaldı; yeni ses veya haptic eklenmedi.
- `App.zikrTap` kaynak gövdesi öncesi/sonrası byte-eşit; zikir view fonksiyonları
  (`zikrPreviewCardHTML`–`zikrPaintPauseButton`) öncesi/sonrası byte-eşit.
- `ZIKR_SEED` ve content bridge (`ZIKR_NIYET` dahil) önce/sonra byte-eşit.
- `driver --dump saygi` gibi aggregate dump'lar mevcut Qur'an striking-verse
  randomizasyonu nedeniyle genel olarak deterministik değildir. MON-20'nin
  zikir kapsamı olan `#zikr-preview-card` dump parçası HEAD/yeni kaynakta
  `1879/1879` byte ve byte-eşittir; bu karşılaştırma `saygi` ve `bugun`
  fixture'larında yapıldı. Farklılaşan aggregate metin zikir yüzeyi değildir.

## Yükleme, cache-bust ve fixture etkisi

- `index.html:60`: `app/core/zikir.js?v=20260904a`, prayer'dan sonra ve
  `app.js`'ten önce.
- `index.html:73`: app bundle `app.js?v=20260904c`.
- `.claude/skills/run-seyma/driver.mjs` ve `zikr-harness.mjs` FILES listeleri
  aynı üretim sırasına `app/core/zikir.js` eklenerek güncellendi.
- Zikir registry'sini yükleyen state/app/reminder sentetik fixture'ları aynı
  sıraya hizalandı. `verify-state-helper-boundary.mjs`, MON-20 shim'inin
  izole B1 çağrısında zikir registry'sini de yükler; `emptyZikrRoot` güncel
  V5 sözleşmesiyle doğrulanır.
- Yeni ağsız fixture: [`tests/app/test_zikir_boundary.js`](../../tests/app/test_zikir_boundary.js).
  View sahipliği, canlı resolver, hedef/oturum, tap guard, pause, manual save
  ve app-owned guide/haptic/bell sınırlarını kapsar.

## Kanıt paketi

Başarılı son koşular:

- Syntax: `node --check` app.js, sync.js, zikir.js ve state/syncGlue/prayer/
  dateUtils/helpers — exit 0.
- State/B1/B2/B3 ve core sınırları — PASS; B2 `60/60`, B3 `20/20`, state
  rebind `37/37`, prayer `19/19`, zikir `17/17`, date-utils `59/59`, helpers
  `31/31`, syncGlue save `19/19`.
- `node .claude/skills/run-seyma/driver.mjs` — PASS.
- `node .claude/skills/run-seyma/zikr-harness.mjs` — `95/95 assertion pass`.
- `tests/app/test_zikr_manual_entry.js` — `21 geçti, 0 kaldı`.
- `tests/app/test_modularization_boundary.js` — `57/57`; Faz −1.1 — `23/23`;
  premium audio `26/26`, haptics `25/25`, voice `59/59`.
- Tüm app fixture ailesi — 25 dosya, exit 0; panel — 23 dosya, exit 0;
  Panel-v2 — 27 dosya, exit 0; Quran — 9 dosya, exit 0; reminder freeze ve
  smoke — `20 curated fixtures`, exit 0.
- `git diff --check` — temiz.

Bu kanıt başsız/local ve veri güvenlidir: browser/device acceptance, push,
merge, tag, deploy, remote veya `mustafaras/seyma-data` yazımı yapılmadı.
MON-21'e otomatik geçiş yapılmaz; yeni kullanıcı onayı gerekir.
