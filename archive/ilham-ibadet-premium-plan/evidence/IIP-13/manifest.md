# IIP-13 · Kanıt manifesti — Vakit kaynağı ve tazelik

- **Kart:** IIP-13 · paket B · rol `domain` · boyut M
- **Bağımlılıklar:** IIP-03 `done`, IIP-09 `done`
- **Gerekli gate:** scope, requirements, review, source, visual
- **Veri etkili yazıcı:** `false` — yeni kalıcı alan, migration veya sync değişimi yok
- **Testler:** `tests/app/test_iip_13.js` (80 kontrol) · `tests/app/test_prayer_boundary.js` (19/19) · `tests/app/test_saygi_boundary.js` (20/20)
- **Sentetik görsel artifact:** `render-matrix.html` (8 sahne, gerçek registry çıktısı)

## Ne yapıldı

İki katman ayrıldı ve tazelik açık hâle getirildi:

1. **Tazelik (REQ-025).** Cache geçerliliği artık yalnız yaşa göre değil;
   **gün + konum(şehir/koordinat) + yöntem** eşleşmesine göre değerlendirilir.
   Uyuşmazlık **açıkça "eski"** olarak gösterilir ve eski kayıt güncel saat gibi
   sunulmaz:
   - **Gece yarısı:** başka güne ait kayıt → `Başka güne ait` (kayıt ve bugünün
     tarihi birlikte yazılır).
   - **Şehir değişimi:** kayıt başka konuma aitse → `Konum uyuşmuyor`.
   - **Yöntem değişimi:** kayıt MWL, seçili Diyanet → `Yöntem uyuşmuyor` (iki
     yöntem adıyla birlikte).
   - **Timeout/hata:** `Güncelleme hatası` + *"eski saatler gösterilmiyor"*.
   - Hiç kayıt yokken → `Saatler bekleniyor`.
2. **Kapsam (REQ-026).** Türkiye kapsamı açıkça raporlanır: 81 il listesi +
   Diyanet yöntemi. Türkiye kutusu dışındaki konum (ör. GPS ile Berlin) için
   `Türkiye dışı` yazılır ve *"yerel saat olarak sunulmaz"* denir; seyahat için
   **otomatik timezone desteği iddia edilmez**.

## Değişen davranış (kart kimliğiyle)

| Durum | Önce | Sonra |
|---|---|---|
| Kayıt başka güne ait | "Önbellek hazır" (yanıltıcı) | **"Başka güne ait" + gün gerekçesi** |
| Kayıt başka şehre ait | ayırt edilmiyordu | **"Konum uyuşmuyor"** |
| Yöntem değişti | yaş 48 saat içindeyse "hazır" | **"Yöntem uyuşmuyor" + iki yöntem adı** |
| Hata/timeout | yalnız hata metni | hata + **"eski saatler gösterilmiyor"** |
| Kayıt yok | "Saatler bekleniyor" | aynı (korundu) |
| Yurtdışı konum | kapsam bilgisi yoktu | **"Türkiye dışı" + yerel saat iddiası yok** |
| TR içi konum | — | **"Türkiye kapsamı içinde" + liste/yöntem** |

## Bulunan ve düzeltilen kusur (gizli determinizm)

**IIP13-REV-01 (yüksek).** İlk uygulamada tazelik etiketi yaşı **gerçek saatten**
(`Date.now`) hesaplıyordu. Bu, uygulamanın kendi gün modeline gizli bir
**cihaz-saati bağımlılığı** sokuyordu: aynı `data` ile render çıktısı cihaz
saatine göre değişebilir ve fixture'ın sentetik günü (`2026-09-04`) ile gerçek
gün çakıştığında "taze" kayıt yanlışlıkla "eski" görünürdü — testte birebir bu
oldu ve kusuru ortaya çıkardı.

**Çözüm:** render tazelik yolu gerçek saati **hiç okumaz**. Deterministik
gün/metot/konum eşleşmesi esastır; yaşa dayalı bayatlama `prayer.js`'teki
`prayerCacheFreshness(o)` içinde **açıkça `nowMs` parametresiyle** ölçülür
(deterministik ve test edilebilir). Kalıcı bekçi eklendi: fixture, render tazelik
fonksiyonunun gövdesinde `prayerAgeInfo`/`Date.now` bulunmasını **yasaklar**;
mutasyonla doğrulandı (kusur geri konunca 5 kontrol FAIL).

## Korunan sözleşmeler

| Sözleşme | Sonuç |
|---|---|
| `test_prayer_boundary.js` (MON-19 sınırı, fetch sözleşmesi) | **19/19 PASS** |
| `test_saygi_boundary.js` (önceki oturumdan; `faithCornerOverlayHTML` yalnız klavye sözleşmesi için kullanılır) | **20/20 PASS** |
| IIP-12 (günlük odak + devam) | 92/92 PASS |
| `App.*` yüzeyi 720'de sabit (yeni üye yok) | PASS |
| `PRAYER_DEPENDENCIES` / `SAYGI_DEPENDENCIES` listeleri büyümedi | PASS (10 / 15) |
| `tests/app` 63/63 · panel 23/23 · panel-v2 27/27 · quran 9/9 | PASS |

## Sınır: yeni `App.*` üyesi, yeni CSS sınıfı ve yeni bağımlılık YOK

`app.js` **izin listesinde değildir**; bu yüzden GPS/permission akışı ve
`App.refreshPrayerTimes` dokunulmadı. Yeni `App.*` üyesi açılmadı, yeni CSS
sınıfı yazılmadı (mevcut stilli `sg-tool-meta-grid` + `is-ready/is-error/is-idle`
durum sınıfları yeniden kullanıldı; "stale" durumu mevcut `is-error` ile
gösterilir — gerekçe `review.md`). Yeni zorunlu bağımlılık eklenmedi; yeni
yardımcılar mevcut `window.SeymaPrayer` kanalından çözülür.

## Bilinen kapsam dışı

- Kullanıcının kaydettiği vakit **satırlarının** saat eşleşmesi doğrulanmaz;
  yalnız kayıt zamanı/metodu/konumu denetlenir (sözleşme "cache" ve "kayıt"
  ayrımını korur).
- Türkiye dışı için gerçek yerel saat hesabı **yapılmaz** (plan bunu ayrı tasarım
  olarak bırakır; `Europe/Istanbul` sessizce değiştirilmez).
- Cihaz, ekran okuyucu, gerçek tarayıcı ve yayın kabulü **yok**.
