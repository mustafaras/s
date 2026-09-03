# app.js Monolit Bölümleme — Güncel Durum

> Yeni oturum önce bu dosyayı, sonra `../MON-STATE.json` ve `LEDGER.md`yi
> okur. Kaynak/fixture bir iddiayla çelişirse canlı kaynak üstündür; fark
> ilk uygun LEDGER satırına yazılır.

## Durum tablosu

| Alan | Değer |
|---|---|
| Program | `MONOLIT-BOLUMLENME` |
| Durum | `in_progress` — Dalga 3 başladı (MON-11 tamamlandı) |
| Aktif / bloke | yok / yok |
| Son / sıradaki | `MON-11` / `MON-12` |
| Dalga / ilerleme | 3 sırada / 11/60 |
| Dal | `zikirmatik-manuel-zikir` (ZP-10 HEAD) — LOCAL-ONLY |
| Güncellendi | 2026-09-03 |

**Bağlayıcı durak:** `MON-11` tamamlandı: `SeymaState` yalnız B1 canlı getter
okur; `data` rebindleri app.js/App sahipliğinde kaldı ve dış modül `data=`
yazamaz. L6140 archive backfill `try/finally` geri yüklemesi taşınamaz state
adapteri olarak kilitlendi. Sonraki kart `MON-12` için yeni açık kullanıcı
onayı gerekir.

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
| `app.js` | 19.203 satır, IIFE sonu 19.203 | tek IIFE geçiş boyunca korunur |
| `var data=null` | 2772 | M2, app.js sahibi |
| yükleme / migrate | 4474 / 4475 | M2, app.js sahibi |
| B1 getter'ları | 4483 civarı, yedi getter | canlı bağ köprüsü |
| `migrate` / `getDay` | 4490 / 5025 | MON-11..15 yüksek risk |
| geçici `data=d` + finally | 6140 | `finally{data=savedData}` zinciri korunur |
| `SeyOnSyncState` / `SeyOnSynced` | 6270 / 6280 | M3, app.js sahipliği |
| `save` / `var App` | 6301 / 6471 | MON-16..18 / MON-50..54 |
| `createDefaultData` / `App.start` | 6741 / 6745 | MON-13..15 |
| import / reset / late-boot data= | 9416 / 9420 / 9446 / 19103 | M2prime, app.js'te kalır |
| `window.App=App` | 17267; atamalar sonra da sürer | I2, erken taşınmaz |
| `App.x=function` | 553 (ZP-10: 9 ekleme − setZikrPreset yeniden yazım) | baseline, her promptta değişmezlik kanıtı |
| inline onclick | satır 382 / occurrence 420 / eşsiz 325 | I2 için üç ayrı görünüm ölçüsü |
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
  index 43–71 sırasının birebir paritesi (23 dosya, app.js dahil; sync.js ve
  panel coverage kasıtlı dışarıda). Fail-fast `assertLoadOrder()` iki
  harness'ta da çalışır: sıra ihlali throw üretir. Kural: yeni core dosyası
  önce index'e, sonra FILES'a aynı konuma; sync.js hiç FILES'a eklenmez.
  Kaynak: [`../deliverables/MON-S4-HARNESS-PARITE-KARARI.md`](../deliverables/MON-S4-HARNESS-PARITE-KARARI.md).
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

## Sonraki güvenli adım

`MON-12`: migrate bağımlılık manifesti ve taşıma öncesi karar. Yüksek riskli
state sınırı için yeni açık kullanıcı onayı olmadan başlanmaz; MON-11 kararı
tek başına kod taşıma izni değildir.

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
