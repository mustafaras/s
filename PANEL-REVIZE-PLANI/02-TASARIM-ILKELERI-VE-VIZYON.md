# PANEL-REVIZE: Tasarım İlkeleri ve Vizyon

> Yeni ÆON Observer Dashboard'un neden varacağı yer ve onu tanımlayan prensipler.

## 1. Vizyon cümlesi

**"Gözlemci, Şeyma'nın gününü ve trendini bir bakışta anlar; detaylar ise istendiğinde, bir profesyonel raporun netliğiyle açılır."**

Mevcut panelin "her şeyi aynı anda göster" yaklaşımı yerine, yeni panel:

- **ilk bakışta sinyal** verir,
- **ikinci katmanda özet** sunar,
- **üçüncü katmanda detay** açar,
- **hiçbir veriyi kaybetmez**, yalnızca görünürlük düzeyini yönetir.

## 2. Duygusal ton: premium, sakın, güvenilir

ÆON, Şeyma'nın kişisel verilerine bakan **güvenilir ikinci göz**dir. Panelin tonu:

- **Sakin (calm):** Endişe uyandıran kırmızı yerine, anomali vurgusu.
- **Saygılı (respectful):** Veriler kişisel; gösterim ölçülü.
- **Profesyonel (professional):** Bir klinik rapor / premium finans dashboard karışımı.
- **Sıcak (warm):** Altın teması ve "Sevgili Günışığı" tonu korunur; teknik soğukluğa kaymaz.

## 3. Premium tanımı

Bu projede "premium" şu anlama gelir:

| Premium öğesi | Mevcut durum | Hedef |
|---------------|--------------|-------|
| Boşluk ve nefes alma | Kartlar üst üste yığılı | Her kartın kendine ait alanı var |
| Renk disiplini | 10+ aksan rengi | 3-4 anlamlı aksan |
| Tipografi hiyerarşisi | Çok küçük etiketler | Net başlık/ölçü/imza hiyerarşisi |
| Yüzey hiyerarşisi | Tek kart seviyesi | Hero / summary / detail / archive seviyeleri |
| Hareket kalitesi | SetTimeout'larla harita init | Az, ama anlamlı geçiş |
| Veri güveni | Teknik fallback mesajları | Sessiz ve sağlam kurtarma |

## 4. Tasarım prensipleri

### P1. Katmanlı açılım (Progressive Disclosure)

Hiçbir kart başlangıçta tüm detayı göstermez. Her ekran bir **önem sırası** taşır.

- **L1 — Sinyal:** Bugünün modu, son SOS, uyku uyarısı, senkron durumu.
- **L2 — Özet:** 7/14/30 günlük trendler, seçili günün öne çıkan metrikleri.
- **L3 — Detay:** Seçili günün tüm girdileri, terapi, öğün, konum segmentleri.
- **L4 — Arşiv:** Kütüphane, izleme, dinleme, alıntılar, uzun vadeli raporlar.

### P2. Bir veri, bir hakiki konum

Aynı metrik panelde birkaç yerde tekrarlanmayacak. Her metrik tek birincil konuma sahip olur; diğer yerlerde yalnızca ona referans verilebilir.

| Metrik | Birincil konum | İkincil gösterim |
|--------|----------------|------------------|
| SOS | Trend + anomali kartı | Detayda listesi |
| Uyku | Gündelik yaşam sinyali | Detayda saat/süre |
| Okuma | Arşiv / haftalık hedef | Seçili gün detayı |
| Konum | Harita + günlük rota | Ham locationHistory gizli/redacted |

### P3. Sessiz senkron güveni

Senkron durumu her zaman görünür ama asla baskın değildir. Tek bir **durum rozeti** yeterlidir. Detaylı audit bilgileri (revision, SHA, ETag, p50/p95) bir "Sistem durumu" çekmecesinde gizlenir.

### P4. Mobil öncelikli, geniş ekrana genişleyen

- Tasarım 375px-460px arası için optimize edilir.
- Geniş ekranda kartlar iki sütuna genişler; içerik aynı kalır.
- Topbar tek satırda kalır; gereksiz elementler alt menüye veya sekmelere gider.

### P5. Anlamlı renk sözleşmesi

| Renk | Anlam | Kullanım |
|------|-------|----------|
| Altın | Marka, premium vurgu, ana CTA | ÆON markası, aktif sekme, hero vurgu |
| Yeşil | Olumlu, sağlıklı, tamamlandı | Hedefe ulaşıldı, trend iyileşti |
| Amber | Uyarı, dikkat, eğilim | Anomali, sınırda değer |
| Kırmızı | Risk, acil, SOS | Kriz, kritik düşüş |
| Mor/Mavi | Arşiv, içerik, ibadet | Kütüphane, Kuran, zikir |

Diğer tüm renkler (journal, vacation, soul, faith, zikr vb.) **sadece kendi modül ikonlarında** veya **detay vurgularında** kullanılır; kart arka planlarında veya başlıklarında kullanılmaz.

### P6. Kart yüzey hiyerarşisi

| Seviye | Yüzey | Kullanım |
|--------|-------|----------|
| Hero | Yüksek kontrast, altın vurgu, büyük tip | Günlük sinyaller |
| Summary | Cam yüzey, altın border | Trend kartları |
| Detail | Daha koyuk yüzey, iç içe | Açılır detaylar |
| Archive | En koyuk, düşük vurgu | Uzun listeler |

### P7. Sessiz boş durumlar

"Veri yok" mesajları her kartta ayrı ayrı tekrarlanmaz. Her modül için standart bir boş durum dili vardır:

- "Henüz kayıt yok" (örneğin bugün hiç adım yok)
- "Bu pencerede veri yok" (örneğin 7 günde SOS yok)
- "Kaynak bekleniyor" (örneğin konum izni kapalı)

### P8. Odak ve sakinlik

- Sabit 5 bölüm başlığı yerine, **günlük yaşam akışı** mantığıyla sekmeler.
- Jump-nav kaldırılabilir veya sekme menüsüne dönüşür.
- Sticky header'lar azaltılır; ekranın üst kısmı temiz tutulur.

## 5. Ana akış senaryoları

### S1. Gözlemci her gün açıyor

1. ÆON markası ve tek senkron rozeti görür.
2. Bugünün sinyal kartları: mod, uyku, su, SOS, adım.
3. 7 günlük mini trend çizgileri.
4. Gerekiyorsa detay sekmesi / tarih seçici.

### S2. Gözlemci anomali arıyor

1. "Trendler & Uyarılar" sekmesine geçer.
2. Son 14/30 günlük anomali listesi: uyku düşüşü, SOS artışı, eksik gün, ilaç sıklığı.
3. Bir anomaliye tıklayınca ilgili güne ve detaya gider.

### S3. Gözlemci belirli günü incelemek istiyor

1. Tarih seçici veya takvim ısı haritasından gün seçer.
2. "Gün Detayı" sekmesi açılır.
3. Tüm girdiler kategorilere ayrılmış şekilde (öğün, ibadet, terapi, hareket, içerik) gösterilir.

### S4. Gözlemci uzun vadeli arşiv görmek istiyor

1. "Arşivler" sekmesine geçer.
2. Kütüphane, izleme, dinleme, alıntılar ayrı alt-sekmelerde.

## 6. Kullanıcı tarafından kaçırılmaması gereken veriler

Aşağıdaki veriler, yeni panelde **daha belirgin** hale getirilir:

- **SOS artışı veya kriz geçmişi:** Anomali sekmesinde öne çıkar.
- **Uyku düşüş trendi:** Trend uyarı kartında.
- **İlaç aşırı kullanımı sinyali:** (MOH ≥ 10 gün) anomali kartında.
- **Terapi paylaşımı / güvenli mesaj:** Gün detayında ve ayrı "Mesajlar" sekmesinde.
- **Eksik gün sayısı:** Trend kartında ve anomali listesinde.
- **Namaz / zikir / Kuran ibadet verileri:** "İbadet & İçgörü" sekmesinde toplanır.
- **Konum / hareket:** Harita odaklı özet; ham GPS listesi kaldırılır.

## 7. Vizyondan çıkan özet

Yeni ÆON panel:

- **Daha az kart**, daha fazla anlam.
- **Sekmeli akış** yerine sonsuz scroll.
- **Birincil sinyaller** öne çıkar.
- **Detaylar** istendiğinde açılır.
- **Teknik durum** sade ve sessiz.
- **Premium altın dark tema** korunur; renk disiplini getirilir.
- **Hiçbir veri kaybolmaz**; yalnızca görünürlük düzeyi değişir.

---

Önceki: [01-MEVCUT-SORUNLAR-ANALIZI.md](01-MEVCUT-SORUNLAR-ANALIZI.md)  
Sonraki: [03-BILGI-MIMARISI-VE-SEVKIYAT.md](03-BILGI-MIMARISI-VE-SEVKIYAT.md)
