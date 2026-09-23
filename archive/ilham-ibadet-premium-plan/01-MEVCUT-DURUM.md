# 01 — Mevcut durum ve fırsatlar

İnceleme 19 Eylül 2026'da yerel kaynak ve sentetik Node VM testi üzerinden yapıldı. Canlı site veya kullanıcının tarayıcı deposu açılmadı. Aşağıdaki tasarım değerlendirmeleri koddan çıkarımdır; gerçek ekranda kontrast, taşma ve kullanım süresi ölçülmüş sayılmaz.

## Zaten güçlü olanlar

| Alan | Bugün mevcut | Kaynak |
|---|---|---|
| Hub | Öz / Öncü / İman / Zikir / Rapor; ortak vakit/Hicri şeridi | `app/core/saygi.js`: `faithNavHTML`, `saygiHTML` |
| Öncüler | 100 kişi, tarih bazlı seçim, TR→EN Wikipedia yedeği, makale cache, lisans/kaynak, önceki/sonraki, okuma sonu kapısı, koleksiyon | `saygi.js`, `app/content/saygiPeople.js` |
| Namaz | Altı zaman satırı, il/GPS, yöntem, dakika ayarları, cemaat/geç/kaza/nafile/not, cache | `app/core/prayer.js`, `saygi.js` |
| Kıble | Büyük-daire hesabı, mesafe, gerçek kuzey açıklaması, sensör izni/hata/hassasiyet, hedefli DOM güncellemesi | `saygi.js`: `qiblaMetrics`, `qiblaOverlayHTML` ve app kabuğu |
| Zikir | 99 Esmâ, anlam/tefekkür, sayaç, hatimler, favori/arama, manuel giriş, geri alma, günlük notlar, çalışan ses/hareket/uyanık tutma ayarları | `app/core/zikir.js`, `esmaulHusnaV1/V2.js` |
| Kur’an | 114 sûre, nüzul sırası, durum/arama/filtre, Raşit ile istek→teslim→video akışı, video notları, seçilmiş âyetler | `app/core/quran.js`, `app/core/render.js`, `app/content/quran*.js` |
| Rapor | Haftalık vakit/zikir/cemaat/seri, yıllık ısı haritası, gün detayı | `saygi.js`: `faithWeekKPIs`, `faithAnnualHeatmapHTML` |
| Güvenlik | Sync korumaları, bağımsız panel, migration ve transport fixture'ları | `sync.js`, `tests/`, `panel/` |

Bunlar sıfırdan üretilecek işler değildir. Özellikle “zikir notları”, “Esmâ arama”, “Kur’an notları”, “gerçek kıble” ve “koyu tema” yeni özellik gibi sunulmamalı.

## Bulgular

| ID / önem | Gözlem ve kanıt | Etki | Öneri / doğrulama |
|---|---|---|---|
| B01 / yüksek | `saygiHTML` her iç sekmede nav→vakit→kıble→Kur’an→seçili içerik üretir | Seçilen Öncü veya Rapor içeriği aşağıda kalabilir | İlk pakette kompakt ortak araçlar; tam yeniden sıralama ayrı davranış kartı. Gerçek ekran derinliği ölçülecek |
| B02 / kritik anlamsal inceleme | `PRAYER_ORDER` içinde `sunrise` var; `faithWeekKPIs` paydayı `dayCount*6` kuruyor; etiket “uyum” | Zaman çizelgesi ve ibadet kaydı aynı metrikte karışıyor | Beş ibadet / altı zaman işareti için ürün ve alan incelemesi; geçmişi sessizce yeniden yazma yok |
| B03 / yüksek | Yalnız `prayer` nesnesi bulunan günler paydaya giriyor; nesne migration ile de oluşabiliyor | Nesnenin varlığı bilinçli kayıtla eşdeğer olmayabilir | Bilinmeyen/sıfır ayrımı; eski veriden niyet çıkarmama; oranı tanımsızsa göstermeme |
| B04 / yüksek | 100 öncü `repeat(10,1fr)` grid ve numarayla gösteriliyor | İsimle keşif zayıf; dar ekranda hedef boyutu ölçülmeli | İsim/alan/okunma durumlu liste ana erişim, grid ikincil koleksiyon özeti |
| B05 / orta | Biyografi dış kaynağa ve makale yüklenmesine bağlı; cache/hata/tekrar dene zaten var | Günlük değer ağ başarısına bağımlı kalabiliyor | Editoryal kısa giriş ve açık cache tarihi; lisanslı yerel pilot |
| B06 / yüksek | `saygiFloatingReadHTML` aşırı yüksek z-index ve yoğun `!important` içeriyor | Klavye/safe-area/overlay çakışması bakım riski | Ortak katman sözleşmesi; küçük/büyük yazıda okunabilir eylem alanı |
| B07 / orta | `faithDayHeat` vakit ve zikri tek renk seviyesinde birleştiriyor | Renkten hangi faaliyet yapıldığı anlaşılamıyor | Ayrı lejant/filtre ve eşdeğer gün listesi; hesap değişimi ayrı kart |
| B08 / yüksek | Vakit isteği `Europe/Istanbul` kullanıyor; kaynak AlAdhan, yöntem 13 seçeneği var | Türkiye dışı konumda tarih/saat anlamı ayrıca ele alınmalı | Türkiye kapsamını açık etiketle; seyahat desteğini ayrı genişletme yap |
| B09 / orta | `sw.js` fetch cache stratejisi içermiyor | “Tam çevrimdışı uygulama” vaadi mevcut kanıtı aşar | Yerel katalog, makale cache ve tam offline kurulumu ayrı tanımla |

## Tasarım değerlendirmesi

**Genel: güçlü özellik tabanı; hiyerarşi ve editoryal deneyim geliştirilmeli.** Mevcut altın tema, yerel güncelleme yöntemleri, kaynak gösterimi ve hata durumları korunmaya değer. Premium iyileştirme, bütün kartların aynı anda dikkat çekmesini azaltıp her ekranın tek görevini belirginleştirmeli. İncelenmeyen ekranlara sayısal tasarım puanı verilmedi.

## Güncel kanıt

- `node .claude/skills/run-seyma/zikr-harness.mjs`: **95/95**, exit 0. Light/dark render, migration, sayaç, notlar, kıble, reminder köprüleri dâhil.
- `node tools/shell-inventory.mjs --gate`: **PASS**, exit 0; 7.610 satır, 0 Legacy, reminder 408, HTML gövde 57; handler gövdesi 554.
- Başlangıç çalışma ağacı temizdi. Referans HEAD README'de kayıtlıdır.

Bu sonuçlar tüm repo regresyonu, görsel QA, erişilebilirlik uygunluk belgesi veya cihaz kabulü değildir. Bu turda kaynak değiştirilmediği için bütün ürün testleri tekrar çalıştırılmadı.
