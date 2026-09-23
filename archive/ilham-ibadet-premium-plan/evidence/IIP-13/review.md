# IIP-13 · review gate

İnceleyen: `copilot` · Yöntem: sentetik/headless (VM + kaynak okuma) · Cihaz/ekran okuyucu/tarayıcı/yayın **kapsam dışı**.

## Açık bulgular

- Açık **CRITICAL**: 0
- Açık **HIGH**: 0

Kapanış ölçütü sağlanmıştır. Bulgular kayıt içindir.

## Bulgular

### IIP13-REV-01 · yüksek · çözüldü
**Bulgu:** `faithPrayerFetchMeta` tazelik etiketini yaş üzerinden **gerçek
saatle** (`Date.now`) hesaplıyordu. Bu, render yoluna gizli bir **cihaz-saati
bağımlılığı** sokuyordu: aynı `data` ile çıktı cihaz saatine göre değişebilir ve
uygulamanın kendi gün modeli (`todayStr()`) ile gerçek takvim çakıştığında taze
kayıt yanlışlıkla "eski" görünürdü. Fixture'ın sentetik günü sabit olduğu için
kusur **testte birebir ortaya çıktı** (eşleşen taze kayıt "Bugüne ait"
beklenirken "Başka güne ait" döndü).

**Çözüm:** Render tazelik yolu gerçek saati artık **hiç okumaz**. Deterministik
gün/metot/konum eşleşmesi esastır; yaşa dayalı bayatlama `prayer.js`'teki
`prayerCacheFreshness(o)` içinde **açık `nowMs` parametresiyle** ölçülür
(deterministik, test edilebilir). Kalıcı bekçi eklendi: fixture, render tazelik
fonksiyonunun gövdesinde `prayerAgeInfo`/`Date.now` bulunmasını **yasaklar**.
Mutasyonla doğrulandı (kusur geri konunca **5 FAIL**).

### IIP13-REV-02 · orta · kabul edildi (kapsam kararı)
**Bulgu:** "stale" durumu için yeni bir CSS sınıfı (ör. `.is-stale`) yazmak
gerekebilirdi; ancak `app/styles.css` bu kartın **izin listesinde değildir**.

**Karar:** Yeni sınıf **yazılmadı**. "stale" durumu mevcut stilli `is-error`
sınıfıyla gösterilir (`strong.is-error` → `color: var(--warn-ink)`), çünkü eski
kayıt kullanıcı için **uyarı** niteliğindedir. Böylece IIP-11 REV-03 ve IIP-12
REV-03'ün tekrarı olan "stillsiz sınıf" hatası önlenir. Fixture, kullanılan her
sınıfın CSS'te var olduğunu ve CSS'siz yeni sınıf sızmadığını doğrular.

### IIP13-REV-03 · düşük · çözüldü (kanıt doğruluğu)
**Bulgu:** Sentetik artifact'ta S02 sahnesinin başlığı "başka güne ait" diyordu
ama kayıt tarihi uygulama günüyle aynıydı; etiket aslında "Bugüne ait" basıyordu
— yani **kanıt, iddia ettiği davranışı göstermiyordu**.

**Çözüm:** Sahne gerçekten dün yazılmış bir kayda çevrildi (`2026-09-03T23:50`)
ve artifact yeniden üretildi; doğrulama taraması artık `Başka güne ait` etiketini
**1 kez** buluyor.

## Kapsam kararları

- **Kullanıcı kaydı satırları doğrulanmaz.** Yalnız kayıt zamanı/metodu/konumu
  denetlenir. Sözleşme "cache" ve "kullanıcı kaydı" ayrımını korur; kayıtlı
  vakit saatlerinin kaynağa karşı karşılaştırılması bu kartın kapsamı dışıdır.
- **Türkiye dışı için gerçek yerel saat hesabı yapılmaz.** Plan bunu ayrı tasarım
  olarak bırakır; `Europe/Istanbul` sessizce değiştirilmez — kapsam dışı konum
  yalnız **işaretlenir** ve yerel saat iddiası kurulmaz.
- **`app.js` izinli olmadığı için** GPS izni, `App.refreshPrayerTimes` hata yolu ve
  toast metinleri dokunulmadı; hata görünürlüğü `fetchError` üzerinden
  `saygi.js`'te sağlanır.

## Korunan sözleşmeler (regresyon denetimi)

| Sözleşme | Sonuç |
|---|---|
| MON-19 `test_prayer_boundary.js` (fetch URL/credentials/timer sözleşmesi) | 19/19 PASS |
| `test_saygi_boundary.js` (`faithCornerOverlayHTML` klavye sözleşmesi) | 20/20 PASS |
| IIP-12 günlük odak + devam | 92/92 PASS |
| IIP-11 okuyucu · IIP-09 mimari | 55/55 · 22/22 PASS |
| `App.*` yüzeyi 720'de sabit | PASS |
| Bağımlılık listeleri büyümedi | PASS (15 / 10) |
| `tests/app` 63/63 · panel 23/23 · panel-v2 27/27 · quran 9/9 | PASS |

## Sınır beyanı

Bu inceleme **sentetik/headless**'tır. Gerçek tarayıcı render'ı, cihaz ölçümü,
ekran okuyucu ve yayın doğrulaması **yapılmamıştır** ve bu receipt'in kapsamı
dışındadır. Görsel kabul yalnız sentetik `render-matrix.html` (8 sahne) üzerindedir.
