# MON-50 · Günlük App surface manifesti

Tarih: 2026-09-12
Dal: `premium-fx-gorsel-yuzey`
Kart: `MON-50` · öncül `MON-49` · sınıf `appSurface`
Durum: ✅ tamamlandı, LOCAL-ONLY

## Karar ve sınır

`app/core/appSurface.js`, günlük mood/habit yüzeyinin beş mevcut handler
gövdesini load-safe `SeymaAppSurface` registry'sine alır. `app.js` aynı
`App.<name>` üyelerini, isimlerini ve imzalarını signature-preserving shim
olarak tutar. `App={}` oluşturma noktası, `data`/`ui` rebindleri, `save`,
`commit`, `render`, modal/DOM sahipliği ve tüm yeni olmayan handler adları
app.js'te bırakılmıştır.

Canlı regex çıpası
`^\s*App\.(setMood|toggle|saveToday|addWater|set.*Health|.*Habit)\s*=`
yalnız şu beş mevcut atamayı buldu:

| Handler | İmza | Inline caller / üretim noktası |
|---|---|---|
| `App.toggleHabit` | `(key)` | Günlük habit satırı |
| `App.toggleMgHabit` | `()` | `App.toggleHabit('magnesium')` rotası |
| `App.explainDerivedHabit` | `(key,day)` | Türetilmiş habit satırı |
| `App.setMood` | `(id)` | Mood seçim kartı |
| `App.saveToday` | `()` | save banner + header save yüzeyi |

Yakındaki `onNote`, `onIntention`, `waterAdd`, `setEnergy`, `setStress`,
kafein/uyku/yürüyüş ve `takeMagnesium`/`skipMagnesium` gövdeleri bu kartın
çıpasında değildi; kapsam genişletilmedi. `maybeStreak` local helper olarak
app.js'te kaldı ve registry'ye açık resolver ile bağlandı.

## Registry dependency ve sahiplik matrisi

Registry'nin 34 üyelik manifesti kaynakta açıkça tutulur; eksik, ikinci veya
geç kayıt fail-closed olur. `data`, `ui` ve `pulseTimer` canlı resolver'dır;
registry bunların snapshot'ını tutmaz.

| Sınıf | Üyeler | Kural |
|---|---|---|
| Salt okuma / hesap | `activeDate`, `todayStr`, `dayIndexFor`, `getDay`, `derivedHabits`, `countRec`, `habits`, `find`, `habitProgress`, `waterGoalCups`, `sleepGoalHours`, `stepsGoal`, `effSteps`, `isVacationDay`, `derivedProgText`, `emptyMagnesium` | Mevcut app.js helper'larına çağrı anında çözülür |
| App-owned state | `data`, `ui`, `pulseTimer`, `setPulseTimer`, `app` | Rebind ve `this` davranışı app.js'te kalır |
| Mutation / persistence | `haptic`, `commit`, `save`, `updateCardByKey`, `render`, `maybeStreak`, `toast`, `confetti` | Registry yalnız mevcut çağrı sırasını sürer |
| DOM / timer | `document`, `clearTimeout`, `setTimeout` | Load sırasında çağrılmaz; pulse ve mevcut completion yolu içindir |

Opsiyonel `SeyHaptics`, `SeyAudio` ve `SeyFx` çağrıları mevcut global guard'ları
ve aynı kart/başarı yollarını korur; bu kart bu API'leri değiştirmemiştir.

## Korunan çağrı grafiği

- `toggleHabit`: tap haptic → canlı tarih/gün → türetilmiş habit veya
  magnesium App rotası; normal habit için count → mutation/savedAt → haptic →
  pulse timer → `commit` → editing guard → completion/confetti veya success/
  `maybeStreak`.
- `toggleMgHabit`: canlı gün → before count → mevcut
  `App.skipMagnesium()`/`App.takeMagnesium(null,200)` → after count → pulse →
  mevcut completion bildirimi.
- `explainDerivedHabit`: progress → haptic → met toast; kriz anahtarları
  mevcut `App.openCrisis` yollarına, diğerleri mevcut copy/toast yollarına gider.
- `setMood`: tap haptic → canlı gün → mood toggle + `savedAt` → metadata'lı
  `save(false, eventSpec)` → `updateCardByKey('mood')` →
  `updateCardByKey('mental')`.
- `saveToday`: tap haptic → `getDay(data,todayStr(),dayIndexFor(todayStr()))`
  → `App.saveNow()`.

## I1–I6 / M1–M4 ve kaynak kanıtı

MON-49 HEAD (`e4e8ddb`) ile çalışma ağacı karşılaştırması:

| Ölçüm | HEAD | MON-50 çalışma ağacı | Delta |
|---|---:|---:|---:|
| `App.* = function` | 556 | 556 | 0 |
| tüm `App.* =` atamaları | 721 | 721 | 0 |
| eşsiz App handler yüzeyi | 718 | 718 | 0 |
| birleşik inline `onclick=` (app + mevcut registry kaynakları) | 391 | 391 | 0 |
| app.js canonical `data` assignment satır/tokenı | 9 / 11 | 9 / 11 | 0 |
| canlı handler regex adayları | 5 | 5 | 0 |

`app.js` boyutu 1,123,893 → 1,118,852 byte ve 13,246 → 13,227 satırdır;
azalma yalnız beş gövdenin registry'ye alınmasından kaynaklanır. Yeni
`app/core/appSurface.js` 127 satır / 9,545 byte'tır. `app.js` içindeki beş
shim `SEYMA_APP_SURFACE.<name>.apply(null,arguments)` biçimini korur.

`index.html` yükleme sırası `render.js → appSurface.js → app.js` olarak
cache-bust ile güncellendi (`appSurface.js?v=20260912f`,
`app.js?v=20260912f`). Aynı dosya sırası driver, zikr-harness,
state-rebind, B2 migration ve app.js boot eden reminder/Aeon fixture'larına
yansıtıldı. CSS, `sync.js`, save semantiği, App.go, render çekirdeği, modal
contract, `migrate()` ve üretim verisi değiştirilmedi.

## Kanıt ve kapı özeti

- `test_app_surface_daily_boundary`: **19/19** — cold-load side-effect sınırı,
  dependency registration, five handler mutation/call order, App count,
  shim/signature, onclick/load-order/cache-bust kanıtı.
- `driver.mjs`: onboarding, seeded render ve interaction smoke **PASS**.
  MON-49 HEAD ile seeded `bugun` dump'ı iki tarafta **114,176 UTF-8 byte**;
  ham SHA'lar `2a3c2560…1fe20` / `77b52c5c…af219`, mevcut tek stokastik
  skor tokenı `N/100` olarak normalize edilince SHA iki tarafta
  `ac5dfe8a…9067d3` ve `cmp=0`.
- `zikr-harness.mjs`: **95/95**.
- `test_modularization_boundary`: **101/101**.
- `test_state_rebind_boundary`: **37/37**; canonical app.js data rebind
  **9 satır / 11 token**.
- `node --check app.js`, `sync.js`, `app/core/appSurface.js`: **PASS**.
- `test_faz10_sync`, modal focus, premium time-theme/reduced-motion ve tam
  app/panel/Panel-v2/Quran/reminder regresyonları kapanış koşuludur; hiçbir
  test gerçek browser, token, localStorage profili, network veya sync push
  kullanmaz.

`releaseApproval=not_approved`; browser/device acceptance, native permission,
remote, push/merge/tag/deploy ve `mustafaras/seyma-data` yazımı yapılmadı.
