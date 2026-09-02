# app.js Monolit Bölümleme — Güncel Durum

> Yeni oturum önce bu dosyayı, sonra `../MON-STATE.json` ve `LEDGER.md`yi
> okur. Kaynak/fixture bir iddiayla çelişirse canlı kaynak üstündür; fark
> ilk uygun LEDGER satırına yazılır.

## Durum tablosu

| Alan | Değer |
|---|---|
| Program | `MONOLIT-BOLUMLENME` |
| Durum | `in_progress` — MON-03 tamamlandı |
| Aktif / bloke | yok / yok |
| Son / sıradaki | `MON-03` / `MON-04` |
| Dalga / ilerleme | 1 / 3/60 |
| Dal | `zikirmatik-manuel-zikir` (ZP-10 HEAD) — LOCAL-ONLY |
| Güncellendi | 2026-09-02 |

**Bağlayıcı durak:** `MON-03` yalnız sahiplik matrisi promptu olarak
tamamlandı; üretim kodu taşınmadı. `MON-04` yeni açık kullanıcı onayı
olmadan başlamaz.

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
| `app.js` | 19.247 satır, IIFE sonu 19.247 | tek IIFE geçiş boyunca korunur |
| `var data=null` | 2772 | M2, app.js sahibi |
| yükleme / migrate | 4474 / 4475 | M2, app.js sahibi |
| B1 getter'ları | 4483 civarı, yedi getter | canlı bağ köprüsü |
| `migrate` / `getDay` | 4490 / 5023 | MON-11..15 yüksek risk |
| geçici `data=d` + finally | 6138 | `finally{data=savedData}` zinciri korunur |
| `SeyOnSyncState` / `SeyOnSynced` | 6299 / 6309 | M3, app.js sahipliği |
| `save` / `var App` | 6330 / 6515 | MON-16..18 / MON-50..54 |
| `createDefaultData` / `App.start` | 6785 / 6789 | MON-13..15 |
| import / reset / late-boot data= | 9460 / 9464 / 19147 | M2prime, app.js'te kalır |
| `window.App=App` | 17311; atamalar sonra da sürer | I2, erken taşınmaz |
| `App.x=function` | 553 (ZP-10: 9 ekleme − setZikrPreset yeniden yazım) | baseline, her promptta değişmezlik kanıtı |
| inline onclick | satır 385 / occurrence 423 / eşsiz 326 | I2 için üç ayrı görünüm ölçüsü |
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
- `driver.mjs` şu an motivation/profile + constants + reminder×4 + app.js
  yükler. `zikr-harness.mjs` daha geniş content seti ile state/mediaFx yükler;
  dateUtils/syncGlue/helpers/timeTheme eksiktir. MON-04 bunları üretim sırasına
  eşitlemeden hiçbir gövde taşınmaz.
- `SeymaState`, `SeymaSave`, `SeymaDateUtils`, `SeymaHelpers` için app.js'te
  bugün doğrudan referans yoktur. Bu B1 skeleton durumudur; MON-07 sonrası
  yalnız hedefli değişir.

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

1. B1 getter'ları taze değer döndürür; snapshot/one-shot referans yasaktır.
2. 6079 geçici data takası ve dokuz yeniden atama app.js'te kalır.
3. `SeyOnSyncState` / `SeyOnSynced` app.js'e atanabilir kalır; getter-only
   accessor strict-mode boot throw eder.
4. `sync.js`, panel, `app/content/*`, frozen reminder motorları, SW ve gerçek
   veri bu programın kod kapsamı dışındadır.

## Sonraki güvenli adım

Kullanıcı uygulamaya açıkça onay verirse `MON-04`: driver/zikr-harness FILES
paritesi ve load-order kanıtı (`deliverables/MON-S4-HARNESS-PARITE-KARARI.md`).
Aksi halde bu durum değişmez.
