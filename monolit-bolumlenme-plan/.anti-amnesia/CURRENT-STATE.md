# app.js Monolit Bölümleme — Güncel Durum

> Yeni oturum önce bu dosyayı, sonra `../MON-STATE.json` ve `LEDGER.md`yi
> okur. Kaynak/fixture bir iddiayla çelişirse canlı kaynak üstündür; fark
> ilk uygun LEDGER satırına yazılır.

## Durum tablosu

| Alan | Değer |
|---|---|
| Program | `MONOLIT-BOLUMLENME` |
| Durum | `ready` — plan v2.1 ayrıntılı, uygulama başlamadı |
| Aktif / bloke | yok / yok |
| Son / sıradaki | yok / `MON-01` |
| Dalga / ilerleme | 1 / 0/60 |
| Dal | `premium-fx-local` — LOCAL-ONLY |
| Güncellendi | 2026-09-02 |

**Bağlayıcı durak:** Kullanıcı yeni ve açık uygulama onayı vermeden `MON-01`
çalıştırılmaz. Bu klasörün planlama commit'i uygulama değildir.

**Planlama derinliği:** `UYGULAMA-PROMPTLARI.md`, 60 kısa kabul kartına ek
olarak 60 çalışma sayfası içerir. Her sayfa kaynak grep'i, sekiz aşamalı
taşıma dizisi, registry/yükleme sınırı, kapı paketi ve fail-closed handoff
sunmaktadır. Bu ek, uygulama durumu değildir; `0/60` değişmeden kalır.

## Canlı baseline (2026-09-02)

Satır numaraları yalnız yol göstericidir; her taşımada yeniden grep yapılır.

| Çıpa | Canlı değer | Koruma |
|---|---:|---|
| `app.js` | 18.957 satır, IIFE sonu 18.957 | tek IIFE geçiş boyunca korunur |
| `var data=null` | 2713 | M2, app.js sahibi |
| yükleme / migrate | 4415 / 4416 | M2, app.js sahibi |
| B1 getter'ları | 4424–4430, yedi getter | canlı bağ köprüsü |
| `migrate` / `getDay` | 4431 / 4964 | MON-11..15 yüksek risk |
| geçici `data=d` | 6079 | `finally` geri dönüşü korunur |
| `save` / `var App` | 6271 / 6456 | MON-16..18 / MON-50..54 |
| `createDefaultData` | 6726 | MON-13..15 |
| import / reset / unlock | 9266 / 9270 / 9296 | M2prime, app.js'te kalır |
| `window.App=App` | 17021; atamalar sonra da sürer | I2, erken taşınmaz |
| late-boot guard | 18857 | M2, app.js'te kalır |
| `App.x=function` | 545 | baseline, her promptta değişmezlik kanıtı |

## Mevcut yükleme ve harness gerçeği

- `index.html`: content → constants → dateUtils/state/syncGlue/helpers/mediaFx/
  timeTheme → reminder×4 → inline SW → coverage manifest → app.js → sync.js.
  Yeni core satırları reminderDelivery sonrasına, inline SW önüne eklenir;
  cache-bust aynı committe artar.
- `driver.mjs` şu an motivation/profile + constants + reminder×4 + app.js
  yükler. `zikr-harness.mjs` daha geniş content seti ile state/mediaFx yükler;
  dateUtils/syncGlue/helpers/timeTheme eksiktir. MON-04 bunları üretim sırasına
  eşitlemeden hiçbir gövde taşınmaz.
- `SeymaState`, `SeymaSave`, `SeymaDateUtils`, `SeymaHelpers` için app.js'te
  bugün doğrudan referans yoktur. Bu B1 skeleton durumudur; MON-07 sonrası
  yalnız hedefli değişir.

## 24 hedef modül ve ilerleme matrisi

| Sınıf | Hedefler | Plan durumu |
|---|---|---|
| Var/korunacak altyapı | constants, mediaFx, timeTheme, reminderCatalog/Engine/Scheduler/Delivery | API/load-safe koruma |
| Saf çekirdek | dateUtils, helpers | MON-07..10 |
| Mutable çekirdek | state | MON-11..15 |
| Senkron köprü | syncGlue | MON-16..18 |
| Domain | prayer, zikir, quran, saygi, motivation, crisis, journal, health, library, report, map, profile, settings, reminders, messaging | MON-19..43; domain kartı tek core modül |
| Birleştirme | render, appSurface | MON-44..54 |

## Premium FX mirası

`FX-SERI-KAPANIS-BELGESI.md` tamamlanmış LOCAL-ONLY serinin kaynağıdır.
`SeyAudio` (app.js'te 26 nitelikli referans), `SeyHaptics` (21),
`SeyTimeTheme` (2), `SeyFx` (2) çağrılarının adı, guard biçimi ve kullanıcı
ayar anlamı korunur. Her kod dalgası `test_premium_*.js` ailesini çalıştırır.
FX-P-66/67 ertelenmiştir; bu serinin kapsamı değildir.

## Değişmez kararlar ve tuzaklar

1. B1 getter'ları taze değer döndürür; snapshot/one-shot referans yasaktır.
2. 6079 geçici data takası ve dokuz yeniden atama app.js'te kalır.
3. `SeyOnSyncState` / `SeyOnSynced` app.js'e atanabilir kalır; getter-only
   accessor strict-mode boot throw eder.
4. `sync.js`, panel, `app/content/*`, frozen reminder motorları, SW ve gerçek
   veri bu programın kod kapsamı dışındadır.

## Sonraki güvenli adım

Kullanıcı uygulamaya açıkça onay verirse `MON-01`: canlı ön-uçuş +
`deliverables/MON-S1-...` karar taslağı. Aksi halde bu durum değişmez.
