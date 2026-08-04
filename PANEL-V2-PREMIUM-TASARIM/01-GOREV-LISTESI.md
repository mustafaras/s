# ÆON Panel-v2 Premium — Görev Listesi

> `00-PLAN.md`'deki 6 fazın özet görev listesi. Her görev tamamlandığında işaretlenir.

---

## Faz 0: Tasarım Sistemi Altyapısı

- [ ] Yeni renk paletini uygula (koyu + aydınlık)
- [ ] Inter + JetBrains Mono fontlarını yükle (`panel-v2.html`)
- [ ] Yeni gölge token'larını ekle (`--ae-shadow-*`)
- [ ] Yeni spacing token'larını ekle (`--ae-space-2xs`, `--ae-space-2xl`, `--ae-space-3xl`)
- [ ] Yeni radius token'larını ekle (`--ae-radius-xs`, `--ae-radius-xl`)
- [ ] Glassmorphism değişkenlerini ekle (`--ae-glass`, `--ae-glass-border`)
- [ ] Glow değişkenlerini ekle (`--ae-glow-*`)
- [ ] Yeni animasyon kütüphanesini ekle (`aeSlideUp`, `aeScaleIn`, `aeShimmer`, `aeCountUp`)
- [ ] Staggered giriş CSS'ini ekle
- [ ] Mevcut tüm testleri çalıştır ve geçtiğini doğrula

## Faz 1: Komponent Yenileme

- [ ] `AeCard` — glass/solid/gradient/outline varyantları
- [ ] `AeButton` — gradient + spring animasyonlu
- [ ] `AeStatusBadge` — glow efektli dot
- [ ] `AeMetric` — büyük metrik kartı (hero card yerine)
- [ ] `AeSparkline` — mini SVG çizgi grafik
- [ ] `AeProgressRing` — dairesel ilerleme halkası
- [ ] `AeDivider` — gradient bölücü
- [ ] `AeSkeleton` — iskelet yükleme animasyonu
- [ ] `AeTooltip` — cam efektli araç ipucu
- [ ] `AeToast` — slide-in bildirim
- [ ] Tüm mevcut komponentleri yeni sisteme taşı

## Faz 2: Veri Görselleştirme

- [ ] Trend strip'teki barları SVG sparkline'larla değiştir
- [ ] Summary grid'deki kartlara mini sparkline ekle
- [ ] Mod trendi için büyük SVG line chart
- [ ] Uyku/Adım/Su için SVG area chart
- [ ] Progress ring'leri hero kartlara ekle
- [ ] Isı haritasını geliştir (tooltip, hafta etiketleri)
- [ ] Count-up animasyonu (sayılar yüklenirken)

## Faz 3: Sayfa Yenileme

- [ ] Genel Bakış — hero grid + trend strip + notes + location
- [ ] Trendler — summary grid + SVG grafikler + anomaliler
- [ ] Gün Detayı — akordeon/sekme kategorizasyonu
- [ ] Arşivler — arama çubuğu + filtreleme
- [ ] Sistem — progress bar'lar + timeline audit
- [ ] Staggered giriş animasyonları

## Faz 4: Mobil & Responsive

- [ ] Bottom tab bar (mobilde)
- [ ] Swipe gesture (gün değiştirme)
- [ ] Pull-to-refresh
- [ ] Touch-friendly hit areas (min 44px)
- [ ] Tüm breakpoint'lerde test (375→1440px)

## Faz 5: Erişilebilirlik & Performans

- [ ] WCAG AA renk kontrastı doğrulaması
- [ ] Klavye navigasyonu testi
- [ ] Screen reader testi (live regions)
- [ ] CSS containment ekle
- [ ] Lazy loading (harita, arşivler)
- [ ] Performans metriklerini ölç

## Faz 6: Test & QA

- [ ] Yeni komponentler için testler
- [ ] SVG grafik render testleri
- [ ] Animasyon reduced-motion testleri
- [ ] Responsive testler
- [ ] Erişilebilirlik testleri
- [ ] Kullanıcı kabul testleri
