# 03 — Görsel yön ve ekran sözleşmesi

## Sanat yönetimi: Sıcak kütüphane

Şeyma'nın şampanya altını kimliğini koruyan; fildişi okuma yüzeyleri, koyu mürekkep metin, ince altın ayrımlar ve geniş nefes alanı. Dinî içerik için süsleme düşük yoğunlukta, metnin dışında kullanılır. Aynı ekranda tek baskın kart bulunur. Biyografi portresi ilham alanını, tipografi ve boşluk ibadet alanını taşır.

Bu bir yeni renk markası değildir. Canlı `--text`, `--muted`, `--card`, `--card-bd`, `--faith`, `--faith2`, `--zikr` tokenları temel alınır. İsimleri ve değerleri IIP-02'de kaynakla eşleştirilir. Yeni semantik token ancak gerçekten karşılığı yoksa, açık/koyu çiftle eklenir.

| Rol | Açık görünüm | Koyu görünüm | Uygulama kuralı |
|---|---|---|---|
| Ana zemin | Sıcak kırık beyaz | Sıcak koyu nötr | Mevcut kök temaya bağlı |
| Okuma yüzeyi | Opak fildişi | Opak yükseltilmiş koyu yüzey | Arkada animasyon okunabilirliği etkilemez |
| Vurgu | Altın detay ve koyu vurgu metni | Açık altın detay | Altın üstüne küçük beyaz metin otomatik kabul edilmez |
| Kaydedildi | Simge + açıklama | Aynı semantik | Yalnız renkle anlatılmaz |
| Hata/bekleme | Sakin açıklama + eylem | Aynı semantik | Dekoratif kırmızı başarı/başarısızlık sistemi yok |

**HIG bağlantısı:** tipografik hiyerarşi, tutarlı semantik renk ve erişilebilir yerleşim; [Apple foundations](https://developer.apple.com/design/human-interface-guidelines/foundations). Malzeme yönü için [Materials](https://developer.apple.com/design/human-interface-guidelines/materials). Buradaki ölçüler bu ürünün önerilen tasarım hedefleridir, Apple'ın web için zorunlu değerleri değildir.

## Ölçü sistemi

- Boşluk: 4 / 8 / 12 / 16 / 24 / 32 CSS px referans ölçeği; uygulamada mevcut spacing tokenları.
- Mobil kenar boşluğu 16–20; kart içi 16–24; masaüstü hub en çok yaklaşık 960 px, okuyucu 640–720 px.
- Başlık 24–30 px karşılığı, bölüm 20–22, gövde 17–18, meta 13–14; hepsi `rem`/mevcut font tokenları ile büyütülebilir.
- Türkçe gövde satır yüksekliği 1.55–1.7; Arapça 1.9–2.1 ve 26–32 px başlangıç; hareke/üst-alt işaret kırpılması test edilir.
- Arapça blok `lang=ar`, `dir=rtl`; Türkçe açıklama ve referans LTR; Arapçada letter-spacing uygulanmaz. Yeni font yalnız hakları, fallback ve indirme bütçesi doğrulanırsa paketlenir.
- Kart köşesi 20–24, küçük araç 12–16; tüm ölçüler mevcut radius ailesiyle eşleştirilir.
- Ana eylemler en az 44×44 CSS px ürün hedefi. WCAG 2.2 AA tabanı istisnalarıyla 24×24'tür; bunlar aynı iddia değildir: [W3C hedef boyutu](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).
- Metin 4.5:1; büyük metin 3:1; kontrol sınırı/odak için 3:1 hedeflenir. Gerçek renk çiftleri ölçülmeden PASS verilmez: [W3C kontrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

## Hedef ekran şemaları

Aşağıdakiler IIP-09 sonrası ürün hedefinin wireframe'leridir; çalışan ekran veya bitmiş görsel tasarım değildir.

```text
BUGÜN — 390 px mobil
┌──────────────────────────────────┐
│ İlham & İbadet              Araçlar│
│ Bugün  İlham  İbadet  Zikir  Ritim │
├──────────────────────────────────┤
│ Şehir · tarih · kaynak durumu     │
│ Sıradaki vakit    16:24   [Aç]    │
│                                  │
│ BUGÜNÜN SEÇKİSİ                  │
│ Bir fikrin peşinden gitmek        │
│ 5 dk · Öncü okuması               │
│ Kısa editoryal giriş…             │
│ [Okumaya başla]                   │
│                                  │
│ Kaldığın yer                     │
│ Zikir · mevcut hatim    [Devam]   │
│ Kur’an yolculuğu        [Aç]      │
│                                  │
│ Keşfet → Öncüler / Esmâ / Dua     │
└──────────────────────────────────┘
```

```text
OKUYUCU                           İBADET
┌────────────────────────┐        ┌────────────────────────┐
│ Geri   Başlık    Aa     │        │ Şehir · yöntem · tazelik│
│ Kişi / içerik türü      │        │ Sıradaki vakit ve saat  │
│ Süre · Kaynak          │        │ Günün zaman çizelgesi  │
│ Editoryal kısa giriş   │        │ Kayıt satırları         │
│ ──────────────────     │        │ [Kaydet] [Ayrıntılar]    │
│ Ana metin              │        │                        │
│ Alt başlık             │        │ Kur’an  Zikir  Kıble    │
│ İsteğe bağlı düşünme   │        │ Hicri takvim            │
│ Kaynak ve lisans       │        │                        │
├────────────────────────┤        └────────────────────────┘
│ Okudum / mevcut kayıt  │
└────────────────────────┘
```

Gösterilen saat/başlıklar sentetik tasarım örneğidir. Cihaz veya kullanıcı verisi değildir. İlk paket bu hedefe yaklaşan mevcut yerleşim tasarımını üretir; kart taşıma daha sonra yapılır.

## Bileşen davranışları

| Bileşen | Görsel kural | Etkileşim/durum |
|---|---|---|
| Günlük odak | Tek büyük başlık, en çok iki meta, tek CTA | Boş/yükleniyor/hata/hazır/tamamlandı |
| Devam satırı | Küçük simge, ad, gerçek durum | Yoksa görünmez; sahte ilerleme yok |
| Öncü listesi | Portre opsiyonel; isim ve alan her zaman görünür | Arama/filtre/boş sonuç; klavye ve ekran okuyucu |
| Vakit satırı | Saat tabular-nums; kaynak ayrı metada | Gelecek/şimdi/geçmiş zamansal durumları kayıt durumundan ayrı |
| Okuma eylemi | Safe-area üzerinde ayrılmış sabit alan | İçeriğin sonunu örtmez; disabled nedeni metinle |
| Ritim grafiği | Düşük yoğunluk; açık lejant | Eşdeğer metin/gün listesi; renk tek bilgi taşıyıcısı değil |
| Kaynak çekmecesi | Kısa başlık ve güvenilir bağlantı | Geri/ESC/odak dönüşü; modal içinde modal zinciri yok |

## Hareket ve duyusal kalite

Mevcut motion tokenlarıyla 120–180 ms dokunma geri bildirimi, 180–240 ms panel geçişi hedeflenir. Uzun metnin üstünde parıltı, otomatik kayan alıntı ve sürekli nabız yok. Sayaç ve geri bildirim mevcut FX tercihlerini dinler. Ses kendiliğinden başlamaz; titreşim tek doğrulama yolu olamaz. `prefers-reduced-motion` ve kullanıcının hareket azaltma ayarı birlikte geçerlidir.

## Responsive ve erişilebilirlik

320 / 390 / 430 / 768 / 1280 CSS px; açık/koyu; %200 metin ve 320 CSS px reflow denetlenir. Beş iç sekme 320 px veya büyük yazıda sıkışırsa iki satıra kontrollü sarılır; menü yatay kaydırmayla saklanmaz. Büyük ekranda özet yan sütun olabilir, metin satırı uzatılmaz. Safe-area, yatay telefon, klavye açık not alanı ve odak görünürlüğü ayrı senaryolardır. Tam ekran overlay'de geri/ESC, focus trap ve kapandığında tetikleyiciye odak dönüşü korunur.
