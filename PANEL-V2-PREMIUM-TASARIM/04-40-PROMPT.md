# ÆON Panel-v2 Premium — 40 Sıralı Uygulama Promptu

> **Amaç:** PANEL-V2-PREMIUM-TASARIM klasöründeki tüm planları 40 adımda, sıralı ve bağımsız prompt'lar halinde uygulamak.
> Her prompt tek bir oturumda tamamlanabilir. Her adımda mevcut testlerin geçtiği doğrulanmalıdır.
> **Tarih:** 2026-08-04
> **Commit:** `392a6b3`

---

## Nasıl Kullanılır

1. Her prompt'u sırayla bir AI agent'ına verin
2. Agent prompt'u uygular, testleri çalıştırır, commit yapar
3. Bir sonraki prompt'a geçmeden önce tüm testlerin geçtiğini doğrulayın
4. Her 5 adımda bir `git push origin main` yapın

---

## FAZ 0: TASARIM SİSTEMİ ALTYAPISI (Prompt 1-6)

---

### Prompt 1: Yeni Renk Paleti & Tasarım Token'ları

**Görev:** `panel-v2.css`'deki renk paletini ve tasarım token'larını premium seviyeye yükselt.

**Yapılacaklar:**
- [ ] Koyu tema renklerini güncelle: `--ae-page: #0C0A09`, `--ae-bg: #11100E`, `--ae-surface: #1A1815`, `--ae-elevated: #221F1B`
- [ ] Aydınlık tema renklerini güncelle: `--ae-page: #F5F3EF`, `--ae-bg: #FDFCFA`, `--ae-surface: #FCFAF7`, `--ae-elevated: #FAF7F2`
- [ ] Accent renklerini güncelle: `--ae-accent: #D4AF6E` (dark), `--ae-accent2: #F0D48A`, `--ae-accent3: #A08040`
- [ ] Durum renklerini güncelle: `--ae-ok: #4CAF7A`, `--ae-warn: #D4A84C`, `--ae-drop: #C86565`, `--ae-info: #5E8AAA`
- [ ] Glassmorphism değişkenlerini ekle: `--ae-glass`, `--ae-glass-border`
- [ ] Glow değişkenlerini ekle: `--ae-glow-accent`, `--ae-glow-ok`, `--ae-glow-drop`
- [ ] Yeni gölge token'larını ekle: `--ae-shadow-sm`, `--ae-shadow-md`, `--ae-shadow-lg`, `--ae-shadow-xl`, `--ae-shadow-glow`
- [ ] Yeni spacing token'larını ekle: `--ae-space-2xs: 2px`, `--ae-space-2xl: 32px`, `--ae-space-3xl: 48px`
- [ ] Yeni radius token'larını ekle: `--ae-radius-xs: 6px`, `--ae-radius-xl: 28px`, `--ae-radius-full: 9999px`
- [ ] Tüm mevcut testleri çalıştır: `for f in tests/test_panel_v2_*.js; do node "$f"; done`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/00-PLAN.md` bölüm 2.1, 2.3, 2.4, 2.5

---

### Prompt 2: Tipografi Sistemi & Font Yükleme

**Görev:** Inter ve JetBrains Mono fontlarını yükle, tipografi scale sistemini oluştur.

**Yapılacaklar:**
- [ ] `panel-v2.html`'ye Inter + JetBrains Mono font link'lerini ekle (Google Fonts)
- [ ] CSS'e tipografi token'larını ekle: `--ae-font: 'Inter', -apple-system, sans-serif`, `--ae-mono: 'JetBrains Mono', monospace`
- [ ] Font scale token'larını ekle: `--ae-scale-xs: 10px`, `--ae-scale-sm: 12px`, `--ae-scale-md: 14px`, `--ae-scale-lg: 18px`, `--ae-scale-xl: 24px`, `--ae-scale-2xl: 32px`, `--ae-scale-3xl: 42px`
- [ ] Tüm mevcut font-size değerlerini yeni scale token'larına dönüştür
- [ ] Mono font'u koordinat/sayı gösterimlerinde kullan (`--ae-mono`)
- [ ] Test: `node tests/test_panel_v2_css.js`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/00-PLAN.md` bölüm 2.2

---

### Prompt 3: Glassmorphism Kart Sistemi

**Görev:** AeCard komponentini glassmorphism tabanlı yeniden tasarla.

**Yapılacaklar:**
- [ ] `.ae-card`'a `backdrop-filter: blur(20px)` ve `--ae-glass` arka plan ekle
- [ ] `.ae-card--glass` varyantı (tam cam efekti, hero kartlar)
- [ ] `.ae-card--solid` varyantı (düz arka plan, içerik yoğun kartlar)
- [ ] `.ae-card--gradient` varyantı (gradient arka plan, önemli metrikler)
- [ ] `.ae-card--outline` varyantı (sadece border, inline detaylar)
- [ ] Hover efektlerini güncelle: `translateY(-4px)`, glow artışı
- [ ] Tüm mevcut kart kullanımlarını yeni varyantlara güncelle
- [ ] Test: `node tests/test_panel_v2_skeleton.js`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/00-PLAN.md` bölüm 3.1, `02-TASARIM-REFERANSI.md` bölüm 1

---

### Prompt 4: Buton & Status Badge Sistemi

**Görev:** AeButton ve AeStatusBadge komponentlerini gradient + glow efektli yeniden tasarla.

**Yapılacaklar:**
- [ ] `.ae-btn--primary`'ye gradient arka plan ekle: `linear-gradient(135deg, var(--ae-accent), var(--ae-accent2))`
- [ ] `.ae-btn--primary:hover`'a glow shadow ekle
- [ ] Spring animasyonu ekle: hover `scale(1.02)`, active `scale(0.97)`
- [ ] `.ae-btn--drop`'a kırmızı gradient ekle
- [ ] `.ae-btn--pill`'e aktif durumda gradient ekle
- [ ] `.ae-status--ok .ae-status__dot`'a yeşil glow ekle: `box-shadow: 0 0 8px var(--ae-ok)`
- [ ] `.ae-status--drop .ae-status__dot`'a kırmızı pulse animasyonu ekle
- [ ] Tüm buton kullanımlarını güncelle
- [ ] Test: `node tests/test_panel_v2_tabs.js`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/00-PLAN.md` bölüm 3.1

---

### Prompt 5: Animasyon Kütüphanesi

**Görev:** Mevcut tek `aeFadeIn` animasyonunu 6 animasyonlu kapsamlı bir sisteme yükselt.

**Yapılacaklar:**
- [ ] `aeSlideUp` animasyonu ekle (kart girişi, `translateY(12px) → 0`)
- [ ] `aeScaleIn` animasyonu ekle (modal açılış, `scale(0.95) → 1`)
- [ ] `aeShimmer` animasyonu ekle (skeleton yükleme, `background-position` kaydırma)
- [ ] `aeCountUp` animasyonu ekle (sayı animasyonu, `translateY(8px) → 0`)
- [ ] `aePulse` animasyonu ekle (canlı durum, `opacity` dalgalanması)
- [ ] Staggered giriş CSS'ini ekle: `.ae-stagger > .ae-card:nth-child(n)` gecikmeleri
- [ ] Tüm `ae-fade-in` kullanımlarını uygun animasyonlarla değiştir
- [ ] `prefers-reduced-motion` desteğini koru
- [ ] Test: `node tests/test_panel_v2_css.js`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/00-PLAN.md` bölüm 4, `02-TASARIM-REFERANSI.md` bölüm 6

---

### Prompt 6: Skeleton Yükleme & Tooltip Komponentleri

**Görev:** AeSkeleton (yükleme iskeleti) ve AeTooltip (araç ipucu) komponentlerini ekle.

**Yapılacaklar:**
- [ ] `.ae-skeleton` CSS sınıfını oluştur (shimmer animasyonlu)
- [ ] `.ae-skeleton--text`, `.ae-skeleton--card`, `.ae-skeleton--circle` varyantları
- [ ] JS'de `AeSkeleton(opts)` fonksiyonunu oluştur
- [ ] `.ae-tooltip` CSS sınıfını oluştur (glass efektli, ok işaretli)
- [ ] JS'de `AeTooltip(opts)` fonksiyonunu oluştur
- [ ] Veri yüklenirken skeleton göster, yüklendiğinde gerçek içerik
- [ ] Test: `node tests/test_panel_v2_skeleton.js`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/00-PLAN.md` bölüm 3.2, `02-TASARIM-REFERANSI.md` bölüm 5

---

## FAZ 1: KOMPONENT YENİLEME (Prompt 7-12)

---

### Prompt 7: AeMetric & AeProgressRing Komponentleri

**Görev:** Hero kartların yerini alacak AeMetric (büyük metrik kartı) ve AeProgressRing (dairesel ilerleme) komponentlerini oluştur.

**Yapılacaklar:**
- [ ] `.ae-metric` CSS sınıfını oluştur (glass kart, büyük değer, sparkline, delta)
- [ ] JS'de `AeMetric(opts)` fonksiyonunu oluştur
- [ ] `.ae-ring` SVG progress ring CSS'ini oluştur
- [ ] JS'de `AeProgressRing(opts)` fonksiyonunu oluştur (yüzde değeri, renk)
- [ ] `renderHeroGrid()` fonksiyonunu güncelle: HeroCard → AeMetric + AeProgressRing
- [ ] Her metrik kartına mini sparkline ve delta oku ekle
- [ ] Test: `node tests/test_panel_v2_today.js`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/00-PLAN.md` bölüm 3.2, `02-TASARIM-REFERANSI.md` bölüm 3, 8

---

### Prompt 8: AeSparkline SVG Grafik Komponenti

**Görev:** Trend strip'teki CSS barların yerini alacak SVG sparkline komponentini oluştur.

**Yapılacaklar:**
- [ ] `.ae-sparkline` CSS sınıfını oluştur
- [ ] JS'de `AeSparkline(data, color, height)` fonksiyonunu oluştur
- [ ] Fonksiyon: `[1,3,2,5,4,6,3]` → SVG path + area fill + dots
- [ ] `renderTrendStrip()` fonksiyonunu güncelle: bar → sparkline
- [ ] Her metrik için farklı renk: mood=accent, sleep=info, steps=info, water=ok
- [ ] Test: `node tests/test_panel_v2_today.js`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/00-PLAN.md` bölüm 5.1, `02-TASARIM-REFERANSI.md` bölüm 2

---

### Prompt 9: AeDivider & AeToast Komponentleri

**Görev:** Gradient bölücü (AeDivider) ve slide-in bildirim (AeToast) komponentlerini ekle.

**Yapılacaklar:**
- [ ] `.ae-divider` CSS sınıfını oluştur (gradient, opsiyonel etiket)
- [ ] `.ae-divider--label` varyantı (ortada etiketli)
- [ ] JS'de `AeDivider(opts)` fonksiyonunu oluştur
- [ ] `.ae-toast` CSS sınıfını oluştur (glass, slide-in-right, auto-dismiss)
- [ ] `.ae-toast--success`, `.ae-toast--error`, `.ae-toast--info` varyantları
- [ ] JS'de `AeToast(opts)` ve `AeV2.showToast(message, type)` fonksiyonlarını oluştur
- [ ] Gün Detayı sayfasında bölümler arasına AeDivider ekle
- [ ] Test: `node tests/test_panel_v2_day_detail.js`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/00-PLAN.md` bölüm 3.2, `02-TASARIM-REFERANSI.md` bölüm 4

---

### Prompt 10: Gün Detayı Bölümlerini AeDivider ile Ayır

**Görev:** Gün Detayı sayfasındaki tüm bölümleri AeDivider ile ayırarak görsel hiyerarşiyi netleştir.

**Yapılacaklar:**
- [ ] `renderDay()` fonksiyonunda her bölüm arasına AeDivider ekle
- [ ] Bölüm başlıklarını AeDivider--label olarak düzenle
- [ ] Bölüm sırasını optimize et: Zamanlar → Ruh Hali → Alışkanlıklar → Beslenme → İbadet → Hareket → Konum → Döngü
- [ ] Her bölümün boş durum mesajlarını güncelle
- [ ] Test: `node tests/test_panel_v2_day_detail.js`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/00-PLAN.md` bölüm 6.3

---

### Prompt 11: Mevcut Komponentleri Yeni Sisteme Taşı

**Görev:** Tüm mevcut komponent fonksiyonlarını (AeCard, AeButton, AeEmpty, AeStatusBadge, SummaryCard, AnomalyCard) yeni tasarım sistemine güncelle.

**Yapılacaklar:**
- [ ] `AeCard()` fonksiyonuna `variant` parametresi ekle (glass/solid/gradient/outline)
- [ ] `AeButton()` fonksiyonuna gradient ve glow stilleri ekle
- [ ] `AeEmpty()` fonksiyonunun stillerini güncelle
- [ ] `SummaryCard()` fonksiyonunu AeMetric ile değiştir
- [ ] `AnomalyCard()` stillerini güncelle (glow, left border)
- [ ] `DetailSection()` ve `DetailBlock()` stillerini güncelle
- [ ] Tüm testleri çalıştır: `for f in tests/test_panel_v2_*.js; do node "$f"; done`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/00-PLAN.md` bölüm 3

---

### Prompt 12: Count-up Animasyonu & Sayı Gösterimi

**Görev:** Tüm sayısal değerlerin count-up animasyonu ile görünmesini sağla.

**Yapılacaklar:**
- [ ] JS'de `animateCountUp(element, targetValue, duration)` fonksiyonunu oluştur
- [ ] Hero kart değerlerine count-up ekle
- [ ] Summary kart değerlerine count-up ekle
- [ ] Trend strip değerlerine count-up ekle
- [ ] Sayfa değiştiğinde count-up'ları yeniden tetikle
- [ ] `prefers-reduced-motion`'da animasyonu atla
- [ ] Test: `node tests/test_panel_v2_today.js`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/00-PLAN.md` bölüm 4.1, `02-TASARIM-REFERANSI.md` bölüm 7

---

## FAZ 2: VERİ GÖRSELLEŞTİRME (Prompt 13-17)

---

### Prompt 13: Trend Strip SVG Sparkline Geçişi

**Görev:** Trend strip'teki CSS barları SVG sparkline grafiklerle değiştir.

**Yapılacaklar:**
- [ ] `renderTrendStrip()` fonksiyonunu yeniden yaz
- [ ] Her metrik için (mood, sleep, steps, water) SVG sparkline oluştur
- [ ] Sparkline: area fill + line + son nokta vurgusu
- [ ] Responsive: sparkline viewBox ile ölçeklenebilir
- [ ] Boş veri durumunda düz çizgi göster
- [ ] Test: `node tests/test_panel_v2_today.js`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/00-PLAN.md` bölüm 5.1, `02-TASARIM-REFERANSI.md` bölüm 9

---

### Prompt 14: Summary Grid Mini Sparkline'lar

**Görev:** Summary grid'deki her karta mini sparkline grafik ekle.

**Yapılacaklar:**
- [ ] `renderSummaryGrid()` fonksiyonunu güncelle
- [ ] Her SummaryCard'a mini sparkline SVG ekle
- [ ] Sparkline rengini metrik türüne göre ayarla
- [ ] 7/14/30 günlük veriyi sparkline'da göster
- [ ] Test: `node tests/test_panel_v2_trends.js`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/00-PLAN.md` bölüm 5.2

---

### Prompt 15: Büyük SVG Line Chart (Mod Trendi)

**Görev:** Trendler sayfasına 30 günlük mod trendi için büyük SVG line chart ekle.

**Yapılacaklar:**
- [ ] `renderMoodTrendChart()` fonksiyonunu oluştur
- [ ] SVG: grid lines + area fill + line + data dots
- [ ] X ekseni: gün etiketleri (her 5 günde bir)
- [ ] Y ekseni: 1-5 mood seviyesi
- [ ] Tooltip: hover'da gün ve değer göster
- [ ] Responsive: viewBox ile ölçeklenebilir
- [ ] Test: `node tests/test_panel_v2_trends.js`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/00-PLAN.md` bölüm 5.1, `02-TASARIM-REFERANSI.md` bölüm 9

---

### Prompt 16: SVG Area Chart (Uyku/Adım/Su)

**Görev:** Uyku, adım ve su metrikleri için SVG area chart'lar oluştur.

**Yapılacaklar:**
- [ ] `renderMetricChart(metricKey, data, color)` genel fonksiyonunu oluştur
- [ ] Uyku chart'ı (info rengi, 0-12 saat aralığı)
- [ ] Adım chart'ı (info rengi, 0-12000 aralığı)
- [ ] Su chart'ı (ok rengi, 0-12 bardak aralığı)
- [ ] Hedef çizgisi ekle (kesikli çizgi)
- [ ] Test: `node tests/test_panel_v2_trends.js`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/00-PLAN.md` bölüm 5.1

---

### Prompt 17: Isı Haritası İyileştirme

**Görev:** 30 günlük mood ısı haritasını geliştir (tooltip, hafta etiketleri, boş gün vurgusu).

**Yapılacaklar:**
- [ ] Her hücreye hover tooltip ekle (tarih, mod adı, not)
- [ ] Hafta etiketleri ekle (Pzt, Sal, Çar, Per, Cum, Cmt, Paz)
- [ ] Boş günleri farklı desenle göster (noktalı/noktasız)
- [ ] Bugün hücresini vurgula
- [ ] Responsive: 7 sütun → 5 sütun (küçük ekran)
- [ ] Test: `node tests/test_panel_v2_day_detail.js`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/00-PLAN.md` bölüm 5.4

---

## FAZ 3: SAYFA YENİLEME (Prompt 18-23)

---

### Prompt 18: Genel Bakış Sayfası Yeniden Tasarım

**Görev:** Genel Bakış sayfasını yeni tasarım sistemine göre yeniden düzenle.

**Yapılacaklar:**
- [ ] `renderToday()` fonksiyonunu yeniden yaz
- [ ] Hero grid: AeMetric + AeProgressRing kullan
- [ ] Trend strip: SVG sparkline'lar
- [ ] Quick notes: AeCard--glass içinde
- [ ] Location: AeCard--glass içinde harita + timeline
- [ ] Staggered giriş animasyonu ekle
- [ ] Test: `node tests/test_panel_v2_today.js`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/00-PLAN.md` bölüm 6.1

---

### Prompt 19: Trendler Sayfası Yeniden Tasarım

**Görev:** Trendler sayfasını SVG grafikler ve gelişmiş metrik kartlarıyla yeniden düzenle.

**Yapılacaklar:**
- [ ] `renderTrends()` fonksiyonunu yeniden yaz
- [ ] Window selector: pill butonlar (7/14/30)
- [ ] Summary grid: AeMetric + sparkline + delta
- [ ] Büyük SVG line chart (mod trendi)
- [ ] Area chart'lar (uyku/adım/su)
- [ ] Anomali kartları: AeCard--gradient ile vurgula
- [ ] Staggered giriş animasyonu
- [ ] Test: `node tests/test_panel_v2_trends.js`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/00-PLAN.md` bölüm 6.2

---

### Prompt 20: Gün Detayı Sayfası Akordeon Düzeni

**Görev:** Gün Detayı sayfasını akordeon/sekme şeklinde kategorize et.

**Yapılacaklar:**
- [ ] `renderDay()` fonksiyonunu yeniden yaz
- [ ] Her bölümü AeDivider--label ile ayır
- [ ] Bölümleri daraltılabilir yap (opsiyonel)
- [ ] Bölüm sırası: Zamanlar → Ruh Hali → Alışkanlıklar → Beslenme → İbadet → Hareket → Konum → Döngü
- [ ] Her bölümde chip'leri üstte göster
- [ ] Staggered giriş animasyonu
- [ ] Test: `node tests/test_panel_v2_day_detail.js`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/00-PLAN.md` bölüm 6.3

---

### Prompt 21: Arşivlere Arama & Filtre Ekle

**Görev:** Arşivler sayfasına arama çubuğu ve filtreleme ekle.

**Yapılacaklar:**
- [ ] Arama input'u ekle (kitaplar, filmler, müzik, alıntılar için)
- [ ] Filtreleme: durum (okunuyor/bitti/bırakıldı), tür, tarih aralığı
- [ ] Grid/görünüm seçeneği (liste / ızgara)
- [ ] Arama sonucu yoksa AeEmpty göster
- [ ] Test: `node tests/test_panel_v2_archives.js`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/00-PLAN.md` bölüm 6.4

---

### Prompt 22: Sistem Sayfası Görsel İyileştirme

**Görev:** Sistem sayfasını görsel olarak iyileştir (progress bar'lar, timeline, canlı metrikler).

**Yapılacaklar:**
- [ ] Durum kartlarına progress bar ekle (API limit, token ömrü)
- [ ] Audit sekmesine timeline görünümü ekle
- [ ] Mesajlar sekmesine bildirim animasyonu ekle
- [ ] Tüm kartları AeCard--glass yap
- [ ] Staggered giriş animasyonu
- [ ] Test: `node tests/test_panel_v2_system.js`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/00-PLAN.md` bölüm 6.5

---

### Prompt 23: Staggered Giriş & Sayfa Geçişleri

**Görev:** Tüm sayfalara staggered giriş animasyonu ve yumuşak sayfa geçişleri ekle.

**Yapılacaklar:**
- [ ] `.ae-stagger` container CSS'i ekle
- [ ] Her sayfanın render fonksiyonuna staggered wrapper ekle
- [ ] Tab değişiminde eski içerik fade-out, yeni içerik fade-in
- [ ] Kartlar sırayla görünür (0ms, 80ms, 160ms, ...)
- [ ] `prefers-reduced-motion` desteği
- [ ] Tüm testleri çalıştır

**Referans:** `PANEL-V2-PREMIUM-TASARIM/00-PLAN.md` bölüm 4.2, `02-TASARIM-REFERANSI.md` bölüm 6

---

## FAZ 4: MOBİL & RESPONSIVE (Prompt 24-27)

---

### Prompt 24: Mobil Bottom Tab Bar

**Görev:** Mobil görünümde (460px altı) tab bar'ı alta taşı.

**Yapılacaklar:**
- [ ] `@media (max-width: 460px)` sorgusu ekle
- [ ] `.ae-tabs`'ı `position: fixed; bottom: 0` yap
- [ ] Safe area padding ekle (`env(safe-area-inset-bottom)`)
- [ ] `.ae-app__body`'ye bottom padding ekle (tab bar yüksekliği kadar)
- [ ] Top tab bar'ı mobilde gizle
- [ ] Test: `node tests/test_panel_v2_css.js`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/00-PLAN.md` bölüm 7.2, `02-TASARIM-REFERANSI.md` bölüm 10

---

### Prompt 25: Swipe Gesture Desteği

**Görev:** Mobilde kaydırarak gün değiştirme desteği ekle.

**Yapılacaklar:**
- [ ] Touch event listener'ları ekle (`touchstart`, `touchmove`, `touchend`)
- [ ] Yatay kaydırmayı algıla (threshold: 50px)
- [ ] Sola kaydırma → sonraki gün, sağa kaydırma → önceki gün
- [ ] Sadece Gün Detayı sayfasında aktif et
- [ ] Çakışma önleme (dikey scroll ile karışmasın)
- [ ] Test: manuel tarayıcı testi

**Referans:** `PANEL-V2-PREMIUM-TASARIM/00-PLAN.md` bölüm 7.2

---

### Prompt 26: Pull-to-Refresh

**Görev:** Mobilde aşağı çekerek yenileme desteği ekle.

**Yapılacaklar:**
- [ ] Pull-to-refresh görsel gösterge ekle (dönen yüklenme animasyonu)
- [ ] Touch event'leri ile entegre et
- [ ] 60px eşik değeri
- [ ] Sadece mobilde aktif et
- [ ] Test: manuel tarayıcı testi

**Referans:** `PANEL-V2-PREMIUM-TASARIM/00-PLAN.md` bölüm 7.2

---

### Prompt 27: Touch-friendly Hit Areas

**Görev:** Tüm interaktif öğelerin minimum 44×44px touch hedef boyutuna sahip olduğunu doğrula ve düzelt.

**Yapılacaklar:**
- [ ] Tüm butonların min-width/height: 44px olduğunu kontrol et
- [ ] Tab öğelerinin min-height: 44px olduğunu kontrol et
- [ ] Chip'lerin min-height: 32px olduğunu kontrol et
- [ ] Tüm breakpoint'lerde test et (375px, 414px, 460px, 768px)
- [ ] Test: `node tests/test_panel_v2_css.js`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/00-PLAN.md` bölüm 7.2

---

## FAZ 5: BİLGİ AKIŞI & KONTROL TAKİP (Prompt 28-35)

---

### Prompt 28: Polling & Telemetry Altyapısı

**Görev:** Otomatik polling motoru ve istek süresi telemetrisini ekle.

**Yapılacaklar:**
- [ ] `syncStatus` nesnesini genişlet: `p50LatencyMs`, `p95LatencyMs`, `lastFetchDurationMs`, `totalFetchCount`, `errorCount`, `consecutiveErrors`, `lastSuccessAt`, `apiRateLimitRemaining`, `apiRateLimitReset`, `pollingIntervalMs`
- [ ] `startPolling()` fonksiyonunu oluştur (`setInterval(load, 60000)`)
- [ ] `stopPolling()` fonksiyonunu oluştur
- [ ] `updateLatencyTelemetry(durationMs)` fonksiyonunu oluştur (son 20 istek, p50/p95)
- [ ] GitHub API rate limit header'larını oku (`x-ratelimit-remaining`)
- [ ] Token varken polling başlat, token yokken durdur
- [ ] Veri tazelik göstergesi: "X dk önce" (syncStatus.lastSyncedAt vs Date.now())
- [ ] Test: `node tests/test_panel_v2_tabs.js`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/03-BILGI-AKISI-KONTROL-TAKIP.md` bölüm 3.1, 5A

---

### Prompt 29: Olay Günlüğü Görüntüleyicisi

**Görev:** Sistem sekmesine "Olaylar" sub-tab'ı ekle ve `data.eventLog.events`'i görüntüle.

**Yapılacaklar:**
- [ ] Sistem sekmesine 5. sub-tab ekle: "Olaylar"
- [ ] `renderEventLog()` fonksiyonunu oluştur
- [ ] `data.eventLog.events`'i oku (varsa) veya boş liste göster
- [ ] Filtreleme: bölüm (wellness/mood/sleep/...), işlem (create/update/...), tarih aralığı
- [ ] Sayfalama: 20/50/100
- [ ] Her olay: saat + icon + bölüm + işlem + revizyon
- [ ] Olay detay drawer'ı: eventId, correlationId, sequence, path, revision, kaynak, gizlilik
- [ ] `panelCoverageManifest.js`'deki `normalizeEvent` ve `parseEventLog`'u kullan
- [ ] Test: `node tests/test_panel_p2_event_log.js`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/03-BILGI-AKISI-KONTROL-TAKIP.md` bölüm 3.2, 4.3, 5B

---

### Prompt 30: Senkron Sağlık Paneli

**Görev:** Durum sekmesine senkron sağlık metrikleri ve görsel gösterge paneli ekle.

**Yapılacaklar:**
- [ ] 4 metrik kartı: Durum (✅/⚠️/❌), Gecikme (p50/p95), Hata Oranı (%), Veri Tazeliği (dk)
- [ ] İstek geçmişi mini grafiği (son 24 saat, SVG sparkline)
- [ ] API durumu kartı: kalan limit, sıfırlanma zamanı, token durumu
- [ ] Hata geçmişi listesi (son 10 hata)
- [ ] `renderStatusDetail()` fonksiyonunu güncelle
- [ ] Test: `node tests/test_panel_v2_system.js`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/03-BILGI-AKISI-KONTROL-TAKIP.md` bölüm 3.3, 4.2, 5C

---

### Prompt 31: Bildirim Yaşam Döngüsü

**Görev:** Mesajlar sekmesine bildirim yaşam döngüsü zaman çizelgesi görselleştirmesi ekle.

**Yapılacaklar:**
- [ ] `panelCoverageManifest.js`'deki `notificationEventProjection`'u kullan
- [ ] Bildirim zaman çizelgesi: oluşturulma → gönderilme → cihaza ulaşma → okunma → yanıtlanma
- [ ] Her aşama için saat bilgisi ve toplam süre
- [ ] Okunma/iletilme durumu göstergeleri (dot renkleri)
- [ ] Mesaj gönderme arayüzü (observer-inbox.json'a yazma)
- [ ] `renderMessages()` fonksiyonunu güncelle
- [ ] Test: `node tests/test_panel_v2_system.js`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/03-BILGI-AKISI-KONTROL-TAKIP.md` bölüm 3.4, 4.5, 5D

---

### Prompt 32: Sıra Denetimi & Revizyon Geçmişi

**Görev:** Denetim sekmesine sıra denetimi ve revizyon geçmişi ekle.

**Yapılacaklar:**
- [ ] `panelCoverageManifest.js`'deki `eventSequenceAudit`'i kullan
- [ ] Sıra denetimi kartı: sıra dışı olay sayısı, eksik olay sayısı, çift kayıt sayısı
- [ ] Detaylı rapor: hangi sequence'lerde sorun var
- [ ] Revizyon geçmişi listesi (son 20 revizyon, snapshotRevision'dan)
- [ ] `renderAuditDetail()` fonksiyonunu güncelle
- [ ] Test: `node tests/test_panel_p2_event_log.js`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/03-BILGI-AKISI-KONTROL-TAKIP.md` bölüm 3.5, 4.4, 5E

---

### Prompt 33: Ayarlar & Tanı Araçları

**Görev:** Ayarlar sekmesine polling yapılandırması, tanı araçları ve hakkında bölümü ekle.

**Yapılacaklar:**
- [ ] Polling aralığı seçici: [30sn] [60sn] [5dk] [Kapalı]
- [ ] Otomatik yenileme toggle'ı
- [ ] Tanı araçları: [Test Bağlantısı] [Veri Doğrulama] [Önbellek Temizle] [Zorla Senkron]
- [ ] Hakkında bölümü: sürüm, tarih, commit hash
- [ ] `renderSettings()` fonksiyonunu güncelle
- [ ] Test: `node tests/test_panel_v2_system.js`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/03-BILGI-AKISI-KONTROL-TAKIP.md` bölüm 4.6, 5F

---

### Prompt 34: Sistem Sekmesi Sub-tab Yeniden Düzenleme

**Görev:** Sistem sekmesini 5 sub-tab ile yeniden düzenle: Durum, Olaylar, Denetim, Mesajlar, Ayarlar.

**Yapılacaklar:**
- [ ] Sub-tab listesini güncelle: status, events, audit, messages, settings
- [ ] `renderSystem()` fonksiyonunu güncelle
- [ ] Her sub-tab için render fonksiyonlarını bağla
- [ ] Sub-tab geçişlerinde animasyon ekle
- [ ] Tüm testleri çalıştır

**Referans:** `PANEL-V2-PREMIUM-TASARIM/03-BILGI-AKISI-KONTROL-TAKIP.md` bölüm 4.1

---

### Prompt 35: Polling & Telemetry Testleri

**Görev:** Yeni polling ve telemetry sistemi için testler ekle.

**Yapılacaklar:**
- [ ] Polling başlatma/durdurma testi
- [ ] p50/p95 hesaplama testi (mock latency verileriyle)
- [ ] API rate limit okuma testi
- [ ] Veri tazelik hesaplama testi
- [ ] 304 yanıtında render tetiklenmeme testi
- [ ] Tüm testleri çalıştır

**Referans:** `PANEL-V2-PREMIUM-TASARIM/03-BILGI-AKISI-KONTROL-TAKIP.md` bölüm 6

---

## FAZ 6: ERİŞİLEBİLİRLİK & PERFORMANS (Prompt 36-38)

---

### Prompt 36: WCAG AA Renk Kontrastı Doğrulaması

**Görev:** Tüm metinlerin WCAG AA (4.5:1) kontrast oranını karşıladığını doğrula ve düzelt.

**Yapılacaklar:**
- [ ] Tüm metin renklerinin kontrast oranını hesapla (arka plana karşı)
- [ ] Düşük kontrastlı alanları tespit et ve düzelt
- [ ] Özellikle: `--ae-faint` ve `--ae-muted` değerlerini kontrol et
- [ ] Koyu ve aydınlık tema için ayrı ayrı doğrula
- [ ] Test: `node tests/test_panel_v2_css.js`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/00-PLAN.md` bölüm 8.2

---

### Prompt 37: Klavye Navigasyonu & Screen Reader

**Görev:** Tüm interaktif öğelerin klavye ile erişilebilir olduğunu ve screen reader uyumluluğunu sağla.

**Yapılacaklar:**
- [ ] Tüm butonların `tabindex` ve `aria-label` değerlerini kontrol et
- [ ] Dinamik içerik için `aria-live` region'ları ekle
- [ ] Focus order'ın mantıksal olduğunu doğrula
- [ ] Tab geçişlerinde focus yönetimi ekle
- [ ] Modal/overlay açıldığında focus trap ekle
- [ ] Test: manuel klavye testi

**Referans:** `PANEL-V2-PREMIUM-TASARIM/00-PLAN.md` bölüm 8.2

---

### Prompt 38: CSS Containment & Performans Optimizasyonu

**Görev:** CSS containment, lazy loading ve performans iyileştirmelerini ekle.

**Yapılacaklar:**
- [ ] Kartlara `contain: layout style paint` ekle
- [ ] Görünmeyen bölümlere `content-visibility: auto` ekle
- [ ] Leaflet harita lazy loading (sadece konum verisi varsa yükle)
- [ ] Arşiv verileri lazy loading (sayfa değiştikçe yükle)
- [ ] Debounce/throttle: scroll ve resize olayları
- [ ] Test: `node tests/test_panel_v2_skeleton.js`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/00-PLAN.md` bölüm 8.1

---

## FAZ 7: TEST & QA (Prompt 39-40)

---

### Prompt 39: Yeni Komponent Testleri

**Görev:** Tüm yeni komponentler için test dosyaları oluştur.

**Yapılacaklar:**
- [ ] AeMetric testi: değer, sparkline, delta gösterimi
- [ ] AeSparkline testi: SVG path oluşturma, boş veri
- [ ] AeProgressRing testi: yüzde hesaplama, renk
- [ ] AeDivider testi: gradient, etiket
- [ ] AeSkeleton testi: shimmer animasyonu
- [ ] AeToast testi: göster/kapat, otomatik kapanma
- [ ] Polling testi: başlat/durdur, p50/p95
- [ ] Event log testi: filtreleme, sayfalama, detay drawer'ı
- [ ] Tüm testleri çalıştır

**Referans:** `PANEL-V2-PREMIUM-TASARIM/01-GOREV-LISTESI.md` Faz 6

---

### Prompt 40: Son QA & Deploy

**Görev:** Tüm testleri çalıştır, hata varsa düzelt, commit ve push yap.

**Yapılacaklar:**
- [ ] Tüm testleri çalıştır: `for f in tests/test_panel_v2_*.js; do node "$f"; done`
- [ ] Tüm panel testlerini çalıştır: `for f in tests/test_panel_p*.js; do node "$f"; done`
- [ ] Hataları düzelt
- [ ] Cache-busting versiyonunu güncelle (`panel-v2.html`'de `?v=YYYYMMDDx`)
- [ ] Commit: `git add panel-v2.html panel-v2.js panel-v2.css && git commit -m "Faz X: ..."`
- [ ] Push: `git push origin main`
- [ ] GitHub Pages deploy'ını kontrol et (1-2 dk)
- [ ] Canlıda test et: `https://mustafaras.github.io/s/panel-v2.html`

---

## Hızlı Başvuru: Faz & Prompt Eşlemesi

| Faz | Prompt'lar | Konu | Tahmini Süre |
|-----|-----------|------|-------------|
| **Faz 0** | 1-6 | Tasarım Sistemi Altyapısı | 2-3 oturum |
| **Faz 1** | 7-12 | Komponent Yenileme | 2-3 oturum |
| **Faz 2** | 13-17 | Veri Görselleştirme | 2-3 oturum |
| **Faz 3** | 18-23 | Sayfa Yenileme | 2-3 oturum |
| **Faz 4** | 24-27 | Mobil & Responsive | 1-2 oturum |
| **Faz 5** | 28-35 | Bilgi Akışı & Kontrol Takip | 3-4 oturum |
| **Faz 6** | 36-38 | Erişilebilirlik & Performans | 1-2 oturum |
| **Faz 7** | 39-40 | Test & QA | 1-2 oturum |

**Toplam:** 40 prompt · 7 faz · ~14-22 oturum
