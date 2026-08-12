# ÆON Panel-v2 Premium — 40 Sıralı Uygulama Promptu

> **Amaç:** PANEL-V2-PREMIUM-TASARIM klasöründeki tüm planları 40 adımda, sıralı ve bağımsız prompt'lar halinde uygulamak.
> Her prompt tek bir oturumda tamamlanabilir. Her adımda mevcut testlerin geçtiği doğrulanmalıdır.
> **Tarih:** 2026-08-04
> **Commit:** `704da96`

> **Arşiv durumu (2026-08-12):** Bu dosya 40 adımlık historical execution
> playbook’tur. 40/40 tamamlandı ve güncel source of truth
> [`.anti-amnesia/CURRENT-STATE.md`](.anti-amnesia/CURRENT-STATE.md) ile
> [`.anti-amnesia/LEDGER.md`](.anti-amnesia/LEDGER.md)’dir. Aşağıdaki özgün
> checkbox’lar geçmiş çalışma talimatlarıdır; yeni ajan Prompt 1’e dönmez.

---

## 🧠 Anti-Amnesia Protokolü

Her prompt'a başlamadan önce:

1. **Önce `LEDGER.md` okunur** — `PANEL-V2-PREMIUM-TASARIM/.anti-amnesia/LEDGER.md`
2. **Sonra `AGENT-CONTEXT.md` okunur** — bağımsız ajanlar için minimum bağlam
3. **Sonra `TOKEN-BUDGET.md` kontrol edilir** — context yönetimi kuralları
4. **Prompt tamamlandığında:**
   - `LEDGER.md` güncellenir (`✅ TAMAMLANDI`, `currentStep` ilerletilir)
   - `HANDOFF-TEMPLATE.md` kullanılarak `.anti-amnesia/handoff-PROMPT-XX.md` oluşturulur
   - Context >%70 ise `/compact` veya yeni oturum önerilir

Bu protokol sayesinde oturum veya ajan değişikliğinde yapı kaybolmadan devam eder.

---

## Nasıl Kullanılır

1. `LEDGER.md`'deki `currentStep` değerine bakın
2. İlgili Prompt bölümünü okuyun
3. Kod değişikliğini yapın, testleri çalıştırın, commit atın
4. `LEDGER.md`'yi ve handoff dosyasını güncelleyin
5. Her 5 adımda bir `git push origin main` yapın

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

### Ledger, Context & Handoff — Prompt 1

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 1 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 1 için `02`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-01.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
- [ ] Tüm mevcut testleri çalıştır: `for f in tests/panel-v2/test_panel_v2_*.js; do node "$f"; done`

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

### Ledger, Context & Handoff — Prompt 2

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 2 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 2 için `03`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-02.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
- [ ] Test: `node tests/panel-v2/test_panel_v2_css.js`

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

### Ledger, Context & Handoff — Prompt 3

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 3 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 3 için `04`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-03.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
- [ ] Test: `node tests/panel-v2/test_panel_v2_skeleton.js`

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

### Ledger, Context & Handoff — Prompt 4

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 4 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 4 için `05`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-04.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
- [ ] Test: `node tests/panel-v2/test_panel_v2_tabs.js`

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

### Ledger, Context & Handoff — Prompt 5

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 5 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 5 için `06`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-05.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
- [ ] Test: `node tests/panel-v2/test_panel_v2_css.js`

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

### Ledger, Context & Handoff — Prompt 6

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 6 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 6 için `07`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-06.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
- [ ] Test: `node tests/panel-v2/test_panel_v2_skeleton.js`

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

### Ledger, Context & Handoff — Prompt 7

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 7 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 7 için `08`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-07.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
- [ ] Test: `node tests/panel-v2/test_panel_v2_today.js`

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

### Ledger, Context & Handoff — Prompt 8

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 8 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 8 için `09`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-08.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
- [ ] Test: `node tests/panel-v2/test_panel_v2_today.js`

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

### Ledger, Context & Handoff — Prompt 9

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 9 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 9 için `10`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-09.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
- [ ] Test: `node tests/panel-v2/test_panel_v2_day_detail.js`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/00-PLAN.md` bölüm 3.2, `02-TASARIM-REFERANSI.md` bölüm 4

---

### Prompt 10: Gün Detayı Bölümlerini AeDivider ile Ayır

**Görev:** Gün Detayı sayfasındaki tüm bölümleri AeDivider ile ayırarak görsel hiyerarşiyi netleştir.

**Yapılacaklar:**
- [ ] `renderDay()` fonksiyonunda her bölüm arasına AeDivider ekle
- [ ] Bölüm başlıklarını AeDivider--label olarak düzenle
- [ ] Bölüm sırasını optimize et: Zamanlar → Ruh Hali → Alışkanlıklar → Beslenme → İbadet → Hareket → Konum → Döngü
- [ ] Her bölümün boş durum mesajlarını güncelle

### Ledger, Context & Handoff — Prompt 10

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 10 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 10 için `11`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-10.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
- [ ] Test: `node tests/panel-v2/test_panel_v2_day_detail.js`

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

### Ledger, Context & Handoff — Prompt 11

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 11 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 11 için `12`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-11.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
- [ ] Tüm testleri çalıştır: `for f in tests/panel-v2/test_panel_v2_*.js; do node "$f"; done`

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

### Ledger, Context & Handoff — Prompt 12

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 12 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 12 için `13`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-12.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
- [ ] Test: `node tests/panel-v2/test_panel_v2_today.js`

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

### Ledger, Context & Handoff — Prompt 13

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 13 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 13 için `14`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-13.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
- [ ] Test: `node tests/panel-v2/test_panel_v2_today.js`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/00-PLAN.md` bölüm 5.1, `02-TASARIM-REFERANSI.md` bölüm 9

---

### Prompt 14: Summary Grid Mini Sparkline'lar

**Görev:** Summary grid'deki her karta mini sparkline grafik ekle.

**Yapılacaklar:**
- [ ] `renderSummaryGrid()` fonksiyonunu güncelle
- [ ] Her SummaryCard'a mini sparkline SVG ekle
- [ ] Sparkline rengini metrik türüne göre ayarla
- [ ] 7/14/30 günlük veriyi sparkline'da göster

### Ledger, Context & Handoff — Prompt 14

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 14 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 14 için `15`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-14.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
- [ ] Test: `node tests/panel-v2/test_panel_v2_trends.js`

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

### Ledger, Context & Handoff — Prompt 15

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 15 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 15 için `16`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-15.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
- [ ] Test: `node tests/panel-v2/test_panel_v2_trends.js`

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

### Ledger, Context & Handoff — Prompt 16

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 16 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 16 için `17`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-16.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
- [ ] Test: `node tests/panel-v2/test_panel_v2_trends.js`

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

### Ledger, Context & Handoff — Prompt 17

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 17 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 17 için `18`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-17.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
- [ ] Test: `node tests/panel-v2/test_panel_v2_day_detail.js`

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

### Ledger, Context & Handoff — Prompt 18

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 18 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 18 için `19`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-18.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
- [ ] Test: `node tests/panel-v2/test_panel_v2_today.js`

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

### Ledger, Context & Handoff — Prompt 19

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 19 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 19 için `20`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-19.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
- [ ] Test: `node tests/panel-v2/test_panel_v2_trends.js`

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

### Ledger, Context & Handoff — Prompt 20

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 20 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 20 için `21`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-20.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
- [ ] Test: `node tests/panel-v2/test_panel_v2_day_detail.js`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/00-PLAN.md` bölüm 6.3

---

### Prompt 21: Arşivlere Arama & Filtre Ekle

**Görev:** Arşivler sayfasına arama çubuğu ve filtreleme ekle.

**Yapılacaklar:**
- [ ] Arama input'u ekle (kitaplar, filmler, müzik, alıntılar için)
- [ ] Filtreleme: durum (okunuyor/bitti/bırakıldı), tür, tarih aralığı
- [ ] Grid/görünüm seçeneği (liste / ızgara)
- [ ] Arama sonucu yoksa AeEmpty göster

### Ledger, Context & Handoff — Prompt 21

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 21 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 21 için `22`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-21.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
- [ ] Test: `node tests/panel-v2/test_panel_v2_archives.js`

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

### Ledger, Context & Handoff — Prompt 22

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 22 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 22 için `23`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-22.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
- [ ] Test: `node tests/panel-v2/test_panel_v2_system.js`

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

### Ledger, Context & Handoff — Prompt 23

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 23 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 23 için `24`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-23.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
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

### Ledger, Context & Handoff — Prompt 24

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 24 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 24 için `25`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-24.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
- [ ] Test: `node tests/panel-v2/test_panel_v2_css.js`

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

### Ledger, Context & Handoff — Prompt 25

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 25 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 25 için `26`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-25.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
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

### Ledger, Context & Handoff — Prompt 26

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 26 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 26 için `27`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-26.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
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

### Ledger, Context & Handoff — Prompt 27

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 27 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 27 için `28`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-27.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
- [ ] Test: `node tests/panel-v2/test_panel_v2_css.js`

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

### Ledger, Context & Handoff — Prompt 28

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 28 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 28 için `29`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-28.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
- [ ] Test: `node tests/panel-v2/test_panel_v2_tabs.js`

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

### Ledger, Context & Handoff — Prompt 29

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 29 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 29 için `30`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-29.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
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

### Ledger, Context & Handoff — Prompt 30

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 30 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 30 için `31`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-30.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
- [ ] Test: `node tests/panel-v2/test_panel_v2_system.js`

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

### Ledger, Context & Handoff — Prompt 31

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 31 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 31 için `32`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-31.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
- [ ] Test: `node tests/panel-v2/test_panel_v2_system.js`

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

### Ledger, Context & Handoff — Prompt 32

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 32 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 32 için `33`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-32.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
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

### Ledger, Context & Handoff — Prompt 33

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 33 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 33 için `34`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-33.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
- [ ] Test: `node tests/panel-v2/test_panel_v2_system.js`

**Referans:** `PANEL-V2-PREMIUM-TASARIM/03-BILGI-AKISI-KONTROL-TAKIP.md` bölüm 4.6, 5F

---

### Prompt 34: Sistem Sekmesi Sub-tab Yeniden Düzenleme

**Görev:** Sistem sekmesini 5 sub-tab ile yeniden düzenle: Durum, Olaylar, Denetim, Mesajlar, Ayarlar.

**Yapılacaklar:**
- [ ] Sub-tab listesini güncelle: status, events, audit, messages, settings
- [ ] `renderSystem()` fonksiyonunu güncelle
- [ ] Her sub-tab için render fonksiyonlarını bağla
- [ ] Sub-tab geçişlerinde animasyon ekle

### Ledger, Context & Handoff — Prompt 34

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 34 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 34 için `35`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-34.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
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

### Ledger, Context & Handoff — Prompt 35

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 35 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 35 için `36`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-35.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
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

### Ledger, Context & Handoff — Prompt 36

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 36 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 36 için `37`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-36.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
- [ ] Test: `node tests/panel-v2/test_panel_v2_css.js`

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

### Ledger, Context & Handoff — Prompt 37

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 37 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 37 için `38`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-37.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
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

### Ledger, Context & Handoff — Prompt 38

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 38 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 38 için `39`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-38.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
- [ ] Test: `node tests/panel-v2/test_panel_v2_skeleton.js`

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

### Ledger, Context & Handoff — Prompt 39

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 39 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini bir ileri taşı (Prompt 39 için `40`).
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-39.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Eğer başka bir ajan devralacaksa, son handoff dosyasının yolunu vurgula.
- [ ] Tüm testleri çalıştır

**Referans:** `PANEL-V2-PREMIUM-TASARIM/01-GOREV-LISTESI.md` Faz 6

---

### Prompt 40: Son QA & Deploy

**Görev:** Tüm testleri çalıştır, hata varsa düzelt, commit ve push yap.

**Yapılacaklar:**
- [ ] Tüm testleri çalıştır: `for f in tests/panel-v2/test_panel_v2_*.js; do node "$f"; done`
- [ ] Tüm panel testlerini çalıştır: `for f in tests/test_panel_p*.js; do node "$f"; done`
- [ ] Hataları düzelt
- [ ] Cache-busting versiyonunu güncelle (`panel-v2.html`'de `?v=YYYYMMDDx`)
- [ ] Commit: `git add panel-v2.html panel-v2.js panel-v2.css && git commit -m "Faz X: ..."`
- [ ] Push: `git push origin main`
- [ ] GitHub Pages deploy'ını kontrol et (1-2 dk)
- [ ] Canlıda test et: `https://mustafaras.github.io/s/panel-v2.html`

### Ledger, Context & Handoff — Prompt 40

- [ ] Bu prompt tamamlandığında `LEDGER.md`'de Prompt 40 satırını `✅ TAMAMLANDI` olarak güncelle.
- [ ] `currentStep` değerini `41` (tüm promptlar tamamlandı) olarak güncelle.
- [ ] Bitiş commit hash'ini, test sonuçlarını ve kısa notları `LEDGER.md`'ye yaz.
- [ ] `HANDOFF-TEMPLATE.md` şablonunu kullanarak `.anti-amnesia/handoff-PROMPT-40.md` oluştur.
- [ ] Context >%70 ise `/compact` veya yeni oturum öner.
- [ ] Tüm 40 prompt tamamlandığında `LEDGER.md`'de bir “Proje Tamamlandı” bölümü oluştur.

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
