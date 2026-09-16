# MON-13 — getDay gövdesi ve sentetik gün parity

**Tarih:** 2026-09-03
**Durum:** ✅ TAMAMLANDI — LOCAL-ONLY
**Öncül:** MON-12
**Sınıf:** state
**Kapılar:** S1–S8, I1–I6, M1–M4

## Karar ve sınır

`getDay(d,date,idx)` gövdesi `app/core/state.js` içindeki `SeymaState`
registry'sine taşındı. `app.js` aynı imzayı koruyan tek satırlık shim'i
(`window.SeymaState.getDay.apply(null,arguments)`) tutuyor. Registry, gün
nesnesini veya nested alanlarını kopyalamıyor; verilen `d.days[date]`
referansını yerinde normalleştiriyor. `data` closure'ı, dokuz `data=` rebind'i,
archive backfill ve `save()` app.js/App sahipliğinde kaldı.

Çalışma sayfasındaki tarihsel `app.js:4964` çıpası canlı kaynakla
mutabıklaştırıldı: MON-12 sonrası parent kaynakta gövde `app.js:4840`
çevresindeydi; yeni shim canlı `app.js:4863`, gövde `state.js:313-453` ve
registry kaydı `app.js:4503-4525` oldu. Bu yalnız satır kaymasıdır; default veya
referans sözleşmesi değiştirilmedi.

## Bağımlılık envanteri

| Sınıf | Bağımlılıklar | Uygulama kararı |
|---|---|---|
| Gün template/default | `emptyHabits`, `emptyMeals`, `emptyMealItems`, `emptyWindDown`, `emptyPrayerDay`, `emptyDiscomfort`, `emptyMovement`, `emptyReading`, `emptyWatching`, `emptyListening`, `emptyLearning`, `emptyHealth`, `emptyMagnesium`, `emptyTherapy` | app.js'ten named registry bag ile çözülür; yeni alan eklenmedi |
| Gün katalogları | `HABITS`, `WIND_DOWN_STEPS` | array referansları bag'de okunur; getDay bunları mutasyona uğratmaz |
| Var gün normalizasyonu | `caffeineLastTime`, `ensureTherapyDay`, `ensurePrayerDay` | aynı helper gövdeleri named resolver üzerinden çağrılır |
| Mutable app kabuğu | `data`, `ui`, `dark`, `save`, `backfillArchivesFromDays`, import/reset/late-boot atamaları | taşınmadı; state registry bunlara yazmaz |
| Yan etki | DOM, timer, ağ, localStorage, SeySync | getDay registry gövdesinde yok |

## Yeni gün / var gün envanteri

Yeni gün path'i yalnız `d.days[date]` yoksa çalışır ve mevcut template'in 37
top-level alanını üretir: `dayIndex`, alışkanlıklar, mood/craving alanları,
journal, meals/mealItems, water/caffeine, energy/stress, sleep/windDown, walk,
flow/symptoms/discomfort/sessions/movement, reading/watching/listening/learning,
gratitude/health/nutri/magnesium/therapy/prayer. Fixture, alan listesini ve
tüm nested default değerlerini ayrı ayrı sabit snapshot'a karşı doğrular.

Var gün path'i aynı gün object referansını korur; eksik nested alanları
normalleştirir, bilinmeyen gün/nested alanlarını saklar, legacy caffeine
`cups/last` değerlerini `drinks` ile uyumlar ve therapy/prayer garantilerini
uygular. Registry ve app.js shim çağrıları iki ayrı cloned root üzerinde
karşılaştırılır; yeni gün ve var gün testleri birbirine karıştırılmaz.

Yasaklar doğrulandı: yeni day alanı yok, archive backfill yok, `data=` taşıması
yok. `sync.js` ve veri deposu değişmedi.

## Kanıt paketi

`verify-state-migration-boundary.mjs` içindeki MON-13 bölümü:

- B2 toplamı: **51 passed, 0 failed**.
- Yeni gün: registry/shim snapshot parity, tam alan/default snapshot,
  mutable day referansı, root dışına yazmama.
- Var gün: registry/shim parity, aynı day ve nested sentinel referansı,
  unknown alan/kayıt korunumu, caffeine/journal/therapy/prayer nested defaults.
- Fixture ağ çağrısı: **0**; state modülü app.js kaydı olmadan kısmi
  normalizasyon yapmıyor.

Tam kapı paketi commit öncesi yeniden çalıştırıldı:

- syntax: `app.js`, `sync.js`, `app/core/state.js` PASS
- B1 `0 failures`, B2 `51/51`, B3 `20/20`
- `driver.mjs --dump bugun` PASS; dump SHA-256:
  `fd44d81747bc5fa31c8d702737ed87ec44e690339035d6487e7eceee3fc89059`
- zikr `95/95`, sync `69/69`
- modularization `47/47`, Faz−1.1 `18/18`, date-utils `58/58`, helpers `30/30`
- app, panel, panel-v2, Quran fixture aileleri ve reminder smoke exit 0
- `git diff --check` PASS

## Cache / FILES / sonraki sınır

Yeni dosya eklenmedi. `app/core/state.js` zaten index ve iki headless FILES
listesinde doğru sıradaydı; FILES etkisi yoktur. Değişen assetler için
`index.html` cache-bust değerleri state `20260903d`, app `20260903b` olarak
güncellendi. `sync.js`, `data/`, panel ve production/deploy yüzeyi değişmedi.

MON-13 bu yerel commit ile kapatılır. Sonraki sıralı kart `MON-14`
(`createDefaultData`) olup yeni açık kullanıcı onayı olmadan başlatılamaz;
push, merge, tag, deploy ve cihaz kabulü ayrıca yapılmamıştır.
