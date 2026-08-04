# ÆON Panel-v2 — Premium Tasarım Planı

> **Hedef:** Mevcut panel-v2'yi sade, işlevsel bir gözlem panelinden, premium, profesyonel ve görsel olarak etkileyici bir "ÆON Orchestration Core" deneyimine dönüştürmek.
> **Tarih:** 2026-08-04
> **Durum:** Plan (henüz uygulanmadı)

---

## İçindekiler

1. [Tasarım Felsefesi](#1-tasarım-felsefesi)
2. [Görsel Kimlik & Tasarım Sistemi](#2-görsel-kimlik--tasarım-sistemi)
3. [Komponent Kütüphanesi](#3-komponent-kütüphanesi)
4. [Animasyon & Mikro-interaksiyon Sistemi](#4-animasyon--mikro-interaksiyon-sistemi)
5. [Veri Görselleştirme](#5-veri-görselleştirme)
6. [Sayfa / Ekran Tasarımları](#6-sayfa--ekran-tasarımları)
7. [Responsive & Mobil](#7-responsive--mobil)
8. [Performans & Erişilebilirlik](#8-performans--erişilebilirlik)
9. [Uygulama Fazları](#9-uygulama-fazları)
10. [Kabul Kriterleri](#10-kabul-kriterleri)

> **📎 İlgili dokümanlar:**
> - [`01-GOREV-LISTESI.md`](01-GOREV-LISTESI.md) — Tüm görevlerin checkbox listesi
> - [`02-TASARIM-REFERANSI.md`](02-TASARIM-REFERANSI.md) — Kod örnekleri ve tasarım referansları
> - [`03-BILGI-AKISI-KONTROL-TAKIP.md`](03-BILGI-AKISI-KONTROL-TAKIP.md) — Bilgi akışı, polling, olay günlüğü, senkron sağlığı ve kontrol takip sistemi

---

## 1. Tasarım Felsefesi

### 1.1. Vizyon

ÆON paneli, kullanıcının günlük yaşam verilerini gözlemleyen bir "dijital bilinç" gibi hissettirmeli. Veriler ham sayılar değil, bir hikâye anlatmalı. Tasarım, **karanlık bir kontrol odası** estetiğinde, **altın/bronz vurgularla** premium bir his vermeli.

### 1.2. Tasarım Prensipleri

| # | Prensip | Açıklama |
|---|---------|----------|
| 1 | **Karanlık öncelikli** | Varsayılan tema koyu, aydınlık tema ikincil. Tüm tasarım koyu temayı merkez alır. |
| 2 | **Veri hikâye anlatır** | Her kart bir soruya cevap vermeli. Sayılar değil, eğilimler ve içgörüler ön planda. |
| 3 | **Derinlik ve katman** | Glassmorphism, gölgeler, blur efektleri ile fiziksel derinlik hissi. |
| 4 | **Kesintisiz akış** | Geçişler yumuşak, animasyonlar doğal (spring tabanlı). Kullanıcı hiçbir şeyin "atladığını" hissetmemeli. |
| 5 | **Bilgi hiyerarşisi** | En önemli bilgi en büyük, en belirgin. İkincil detaylar geri planda. |
| 6 | **Tutarlılık** | Her komponent aynı dilde konuşur — aynı radius, aynı spacing, aynı renk paleti. |
| 7 | **Dokunsal his** | Her etkileşim bir geri bildirim üretir (hover, active, transition). |

### 1.3. İlham Kaynakları

- **Apple Health / Fitness** — veri kartları, gradyanlar, tipografi
- **Linear.app** — karanlık tema, mikro-animasyonlar, keskin tipografi
- **Notion** — veri tabanı görünümü, blok yapısı
- **Bloomberg Terminal** — karanlık tema, veri yoğunluğu, altın vurgular
- **Dribbble "dark dashboard"** — premium dashboard trendleri

---

## 2. Görsel Kimlik & Tasarım Sistemi

### 2.1. Renk Paleti (v2 — Premium)

#### Koyu Tema (Varsayılan)

| Token | Şu anki | Yeni Değer | Açıklama |
|-------|---------|------------|----------|
| `--ae-page` | `#12100E` | `#0C0A09` | Daha derin, neredeyse siyah zemin |
| `--ae-bg` | `#181513` | `#11100E` | Kart arka planı |
| `--ae-surface` | `#1E1B17` | `#1A1815` | Surface katmanı |
| `--ae-elevated` | `#26221D` | `#221F1B` | Yükseltilmiş katman |
| `--ae-text` | `#F4F0EA` | `#F5F0EB` | Sıcak beyaz metin |
| `--ae-muted` | `#9B958E` | `#8A847D` | İkincil metin |
| `--ae-faint` | `#6E6862` | `#5E5852` | Üçüncül metin |
| `--ae-accent` | `#C9A86C` | `#D4AF6E` | Daha parlak, sıcak altın |
| `--ae-accent2` | `#E8C887` | `#F0D48A` | Daha açık altın |
| `--ae-accent3` | — | `#A08040` | Koyu altın (vurgu gölgesi) |
| `--ae-ok` | `#4A8C6A` | `#4CAF7A` | Daha canlı yeşil |
| `--ae-warn` | `#C79A4F` | `#D4A84C` | Daha sıcak amber |
| `--ae-drop` | `#B85C5C` | `#C86565` | Daha belirgin kırmızı |
| `--ae-info` | `#5A7E9A` | `#5E8AAA` | Daha canlı mavi |
| `--ae-glass` | — | `rgba(255,255,255,0.04)` | Cam efekti tabanı |
| `--ae-glass-border` | — | `rgba(255,255,255,0.06)` | Cam efekti kenarlığı |
| `--ae-glow-accent` | — | `0 0 30px rgba(212,175,110,0.15)` | Altın parlama |
| `--ae-glow-ok` | — | `0 0 20px rgba(76,175,122,0.12)` | Yeşil parlama |
| `--ae-glow-drop` | — | `0 0 20px rgba(200,101,101,0.12)` | Kırmızı parlama |

#### Aydınlık Tema

| Token | Şu anki | Yeni Değer |
|-------|---------|------------|
| `--ae-page` | `#F8F6F2` | `#F5F3EF` |
| `--ae-bg` | `#FFFFFF` | `#FDFCFA` |
| `--ae-surface` | `#FFFFFF` | `#FCFAF7` |
| `--ae-elevated` | `#FDFBF8` | `#FAF7F2` |
| `--ae-text` | `#1F1C19` | `#1C1916` |
| `--ae-accent` | `#A4824C` | `#B08D4E` |
| `--ae-glass` | — | `rgba(0,0,0,0.02)` |

### 2.2. Tipografi Sistemi

| Token | Değer | Kullanım |
|-------|-------|----------|
| `--ae-font` | `'Inter', -apple-system, sans-serif` | Ana metin (Inter fontu yüklenecek) |
| `--ae-mono` | `'JetBrains Mono', 'SF Mono', monospace` | Sayılar, kod, koordinatlar |
| `--ae-scale-xs` | `10px / 1.4` | Label, chip metni |
| `--ae-scale-sm` | `12px / 1.5` | İkincil metin, meta |
| `--ae-scale-md` | `14px / 1.5` | Gövde metni |
| `--ae-scale-lg` | `18px / 1.3` | Kart değerleri, başlıklar |
| `--ae-scale-xl` | `24px / 1.2` | Hero değerleri |
| `--ae-scale-2xl` | `32px / 1.1` | Büyük metrikler |
| `--ae-scale-3xl` | `42px / 1.0` | Çok büyük değerler (nadir) |

**Font yükleme:** `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">`

### 2.3. Gölge Sistemi

| Token | Değer | Kullanım |
|-------|-------|----------|
| `--ae-shadow-sm` | `0 2px 8px rgba(0,0,0,0.12)` | Küçük kartlar |
| `--ae-shadow-md` | `0 8px 24px rgba(0,0,0,0.16)` | Normal kartlar |
| `--ae-shadow-lg` | `0 16px 48px rgba(0,0,0,0.20)` | Modal, dropdown |
| `--ae-shadow-xl` | `0 24px 64px rgba(0,0,0,0.25)` | Hero kartlar |
| `--ae-shadow-glow` | `0 0 30px rgba(212,175,110,0.10)` | Altın parlama |

### 2.4. Spacing Sistemi (Genişletilmiş)

| Token | Değer |
|-------|-------|
| `--ae-space-2xs` | `2px` |
| `--ae-space-xs` | `4px` |
| `--ae-space-sm` | `8px` |
| `--ae-space-md` | `12px` |
| `--ae-space-lg` | `16px` |
| `--ae-space-xl` | `24px` |
| `--ae-space-2xl` | `32px` |
| `--ae-space-3xl` | `48px` |

### 2.5. Border Radius Sistemi

| Token | Değer |
|-------|-------|
| `--ae-radius-xs` | `6px` |
| `--ae-radius-sm` | `10px` |
| `--ae-radius-md` | `14px` |
| `--ae-radius-lg` | `20px` |
| `--ae-radius-xl` | `28px` |
| `--ae-radius-full` | `9999px` |

---

## 3. Komponent Kütüphanesi

### 3.1. Mevcut Komponentlerin İyileştirmeleri

#### AeCard (Temel Kart)

**Mevcut:** Düz arka plan, ince border, gölge.
**Hedef:** Glassmorphism katmanlı kart.

```css
.ae-card {
  background: var(--ae-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--ae-glass-border);
  border-radius: var(--ae-radius-lg);
  box-shadow: var(--ae-shadow-md), var(--ae-shadow-glow);
  transition: transform 0.3s var(--ae-ease), box-shadow 0.3s var(--ae-ease);
}
.ae-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--ae-shadow-lg), var(--ae-shadow-glow);
}
```

**Varyantlar:**
- `.ae-card--glass` — Tam cam efekti (hero kartlar)
- `.ae-card--solid` — Düz arka plan (içerik yoğun kartlar)
- `.ae-card--gradient` — Gradient arka plan (önemli metrikler)
- `.ae-card--outline` — Sadece border, arka plan yok (inline detaylar)

#### AeButton

**Mevcut:** Düz buton, basit hover.
**Hedef:** Gradient, glow, spring animasyonlu.

```css
.ae-btn--primary {
  background: linear-gradient(135deg, var(--ae-accent), var(--ae-accent2));
  color: var(--ae-page);
  border: none;
  box-shadow: 0 4px 15px rgba(212,175,110,0.25);
}
.ae-btn--primary:hover {
  box-shadow: 0 6px 25px rgba(212,175,110,0.35);
  transform: translateY(-1px) scale(1.02);
}
.ae-btn--primary:active {
  transform: scale(0.97);
}
```

#### AeStatusBadge

**Mevcut:** Dot + label, statik.
**Hedef:** Canlı dot animasyonu, gradient arka plan.

```css
.ae-status--ok .ae-status__dot {
  background: var(--ae-ok);
  box-shadow: 0 0 8px var(--ae-ok);
}
.ae-status--drop .ae-status__dot {
  animation: aePulse 1.6s ease-in-out infinite;
  box-shadow: 0 0 12px var(--ae-drop);
}
```

### 3.2. Yeni Komponentler

#### AeMetric (Büyük Metrik Kartı)

Hero kartların yerini alacak, daha büyük, daha etkileyici metrik kartı.

```
┌─────────────────────────┐
│  🌙                     │
│  UYKU                   │
│  7.5 sa                 │
│  ████████░░  Kalite: 8  │
│  ← %5 dün               │
└─────────────────────────┘
```

#### AeSparkline (Mini Grafik)

Trend strip'teki renkli barların yerini alacak mini SVG çizgi grafik.

```html
<svg class="ae-sparkline" viewBox="0 0 60 24" aria-hidden="true">
  <path d="M0,20 L10,15 L20,18 L30,8 L40,12 L50,4 L60,6" 
        stroke="var(--ae-accent)" fill="none" stroke-width="2"/>
</svg>
```

#### AeProgressRing (Halka İlerleme)

Hedefe ulaşma yüzdesini gösteren dairesel ilerleme halkası.

```html
<svg class="ae-ring" viewBox="0 0 36 36">
  <path class="ae-ring__bg" d="M18 2 a16 16 0 1 1 0 32 a16 16 0 1 1 0-32"/>
  <path class="ae-ring__fill" stroke-dasharray="75, 100" d="M18 2 a16 16 0 1 1 0 32 a16 16 0 1 1 0-32"/>
</svg>
```

#### AeDivider (Bölücü)

İnce, altın vurgulu, opsiyonel etiketli bölücü.

```css
.ae-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--ae-accent), transparent);
  margin: var(--ae-space-lg) 0;
}
```

#### AeTooltip (Araç İpucu)

Hover ile açılan, okşamalı, cam efektli tooltip.

#### AeBadge (Rozet)

Sayısal bildirim/uyarı rozeti (ör: "3", "!").

#### AeSkeleton (İskelet Yükleme)

Veri yüklenirken gösterilen pürüzsüz animasyonlu iskelet.

```css
.ae-skeleton {
  background: linear-gradient(90deg, var(--ae-glass) 25%, var(--ae-elevated) 50%, var(--ae-glass) 75%);
  background-size: 200% 100%;
  animation: aeShimmer 1.5s ease-in-out infinite;
  border-radius: var(--ae-radius-sm);
}
```

#### AeToast (Bildirim)

Sağ üst köşede beliren, slide-in animasyonlu bildirim.

#### AeModal (Modal)

Blur arka planlı, scale-in animasyonlu, kapatılabilir modal.

---

## 4. Animasyon & Mikro-interaksiyon Sistemi

### 4.1. Animasyon Kütüphanesi

Mevcut `aeFadeIn` tek animasyonu yerine kapsamlı bir sistem:

| Animasyon | Süre | Easing | Kullanım |
|-----------|------|--------|----------|
| `aeFadeIn` | 0.35s | spring | Sayfa geçişleri, kart girişi |
| `aeSlideUp` | 0.4s | spring | Kartların sıralı girişi |
| `aeSlideInRight` | 0.3s | ease-out | Bildirimler, toast |
| `aeScaleIn` | 0.25s | spring | Modal açılış |
| `aeShimmer` | 1.5s | linear | İskelet yükleme |
| `aePulse` | 2s | ease-in-out | Canlı durum göstergeleri |
| `aeCountUp` | 0.8s | spring | Sayı animasyonu |
| `aeProgressFill` | 0.6s | ease-out | Bar/ring dolum |

### 4.2. Staggered Giriş

Kartların sıralı girişi için:

```css
.ae-card:nth-child(1) { animation-delay: 0ms; }
.ae-card:nth-child(2) { animation-delay: 80ms; }
.ae-card:nth-child(3) { animation-delay: 160ms; }
/* ... */
```

### 4.3. Mikro-interaksiyonlar

| Etkileşim | Efekt |
|-----------|-------|
| Kart hover | Yükselme (+4px), glow artışı |
| Buton hover | Scale(1.02), gradient kayması |
| Buton active | Scale(0.97) |
| Tab switch | Alt çizgi animasyonu, içerik fade |
| Sayı değişimi | Count-up animasyonu |
| Veri yükleme | Shimmer skeleton |
| Hata | Kırmızı pulse, shake |
| Başarı | Yeşil glow flash |

---

## 5. Veri Görselleştirme

### 5.1. Trend Grafikleri (Mevcut: Renkli Barlar → Hedef: SVG Grafikler)

**Mevcut:** 7 günlük dikey renkli barlar (101 CSS class ile).
**Hedef:** SVG tabanlı, interaktif, smooth line/area grafikler.

#### Mod Trendi (Line Chart)

```html
<svg viewBox="0 0 280 80" class="ae-chart ae-chart--mood">
  <defs>
    <linearGradient id="mood-fill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="var(--ae-accent)" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="var(--ae-accent)" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <path d="M0,60 Q10,55 20,50 T40,30 T60,20 T80,40 T100,10 T120,25 T140,15" 
        stroke="var(--ae-accent)" fill="url(#mood-fill)" stroke-width="2"/>
  <!-- Data dots -->
  <circle cx="0" cy="60" r="3" fill="var(--ae-accent)"/>
  <circle cx="20" cy="50" r="3" fill="var(--ae-accent)"/>
  <!-- ... -->
</svg>
```

#### Uyku / Adım / Su (Area Chart)

Aynı SVG yaklaşımı, farklı renklerde.

### 5.2. Mini Metrik Kartları

Her metrik için: değer + mini sparkline + delta oku.

```
┌──────────────────────┐
│  UYKU     7.5sa  ↑5% │
│  ╱╲    ╱╲            │
│ ╱  ╲  ╱  ╲  ╱╲      │
│╱    ╲╱    ╲╱  ╲╱╲    │
└──────────────────────┘
```

### 5.3. Radar / Polar Chart (Profil)

Profil değerlendirme sonuçları için radar grafik (isteğe bağlı, Faz 3).

### 5.4. Isı Haritası (Mevcut: Renkli Hücreler → Hedef: Gelişmiş)

Mevcut 30 günlük mood grid'i koru, ama:
- Hücrelere hover tooltip ekle (tarih, mod, not)
- Hafta etiketleri ekle (Pzt, Sal, ...)
- Boş günleri daha belirgin yap

---

## 6. Sayfa / Ekran Tasarımları

### 6.1. Genel Bakış (Today) — Yeniden Tasarım

```
┌──────────────────────────────────────┐
│  ÆON                    ↻  ✕  ◉    │  ← Topbar (sticky)
├──────────────────────────────────────┤
│  ◐ Genel Bakış  ◑ Trendler  ◎ Gün  │  ← Tabs
│  ◈ Arşivler     ◉ Sistem            │
├──────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐         │
│  │ 🌤 Mod   │  │ 🌙 Uyku  │         │  ← Hero Grid (2×2)
│  │ Huzurlu  │  │ 7.5 sa   │         │     Glass kartlar
│  │          │  │ Kalite 8 │         │     Progress ring'ler
│  └──────────┘  └──────────┘         │
│  ┌──────────┐  ┌──────────┐         │
│  │ 🆘 SOS   │  │ 👟 Adım  │         │
│  │  0       │  │ 8.432    │         │
│  └──────────┘  └──────────┘         │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ Son 7 Gün                    │   │  ← Trend Strip
│  │ Mod    ╱╲   ╱╲               │   │     SVG sparkline'lar
│  │ Uyku  ╱  ╲ ╱  ╲             │   │
│  │ Adım  ╱    ╲    ╲            │   │
│  │ Su    ╱      ╲    ╲          │   │
│  └──────────────────────────────┘   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ Hızlı Notlar                 │   │  ← Quick Notes
│  │ 📝 Günlük  📌 Not  🕯 Niyet │   │     Chip'ler
│  └──────────────────────────────┘   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ 📍 Konum & Zaman Çizelgesi   │   │  ← Location
│  │ [HARİTA]                     │   │     Leaflet + timeline
│  │ 09:00 41.0050, 28.9750       │   │
│  │ 10:30 41.0100, 28.9800       │   │
│  └──────────────────────────────┘   │
└──────────────────────────────────────┘
```

### 6.2. Trendler — Yeniden Tasarım

```
┌──────────────────────────────────────┐
│  Pencere: [7] [14] [30]             │  ← Window Selector
│                                      │
│  ┌──────────┐ ┌──────────┐         │
│  │ Uyku     │ │ Adım     │          │  ← Summary Grid
│  │ 7.2sa ↓  │ │ 6.500 ↓  │         │     Glass kartlar
│  │ Son 7 gün│ │ Son 7 gün│         │     Sparkline + delta
│  └──────────┘ └──────────┘         │
│  ┌──────────┐ ┌──────────┐         │
│  │ Su       │ │ SOS      │          │
│  │ 6.5 ↓    │ │ 2 ↑      │         │
│  └──────────┘ └──────────┘         │
│  ┌──────────┐ ┌──────────┐         │
│  │ Eksik    │ │ MOH      │          │
│  │ 3 gün    │ │ 5 gün    │         │
│  └──────────┘ └──────────┘         │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ 📈 Mod Trendi (30 gün)       │   │  ← SVG Line Chart
│  │  ╱╲    ╱╲    ╱╲              │   │
│  │ ╱  ╲  ╱  ╲  ╱  ╲            │   │
│  │╱    ╲╱    ╲╱    ╲            │   │
│  └──────────────────────────────┘   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ ⚠️ Tespit Edilen Durumlar    │   │  ← Anomalies
│  │ 🌙 Uyku düşüşü %20          │   │
│  │ 🆘 SOS artışı                │   │
│  └──────────────────────────────┘   │
└──────────────────────────────────────┘
```

### 6.3. Gün Detayı — Yeniden Tasarım

Gün detayı, akordeon/sekme şeklinde kategorize edilmiş bölümler:

```
┌──────────────────────────────────────┐
│  ◀  Bugün (04.08.2026)  ▶  [Detay] │  ← Date Picker
│                                      │
│  [Isı Haritası - 30 gün]            │  ← Heatmap
│                                      │
│  ⏱ Kayıt Zamanları                  │  ← Kompakt grid
│  ┌──────────┐ ┌──────────┐         │
│  │ Kayıt    │ │ Günlük   │         │
│  │ 12:00    │ │ 11:30    │         │
│  └──────────┘ └──────────┘         │
│                                      │
│  === RUH HALİ & TERAPİ ===          │  ← AeDivider
│  🌤 Huzurlu · 📝 Günlük · 🕯 Niyet │  ← Chips
│  📝 Günlük: "Bugün çok..."         │  ← Detail
│  💭 Düşünce: "İş stresi..."        │
│                                      │
│  === ALIŞKANLIKLAR ===              │  ← AeDivider
│  ✅ 8/15 alışkanlık                 │
│  💧 Su  😴 Uyku  👟 Yürüyüş       │  ← Done
│  ◻ Protein  ◻ D₃K₂                  │  ← Undone
│                                      │
│  === BESLENME ===                   │
│  💧 8 bardak · ☕ 2 kafein          │
│  🍽 Kahvaltı: yulaf                │
│  🍽 Öğle: mercimek çorbası         │
│                                      │
│  === İBADET ===                     │
│  🕌 4/5 vakit · 📿 1.234 zikir     │
│  🌟 Mevlana ✓                       │
│                                      │
│  === HAREKET & KONUM ===            │
│  👟 8.432 adım · 🚶 3.2 km         │
│  [HARİTA]                           │
│  🕐 09:00 41.0050, 28.9750         │
│  🕐 10:30 41.0100, 28.9800         │
│                                      │
│  === DÖNGÜ ===                      │
│  🩸 Orta · 🩺 kramp, baş ağrısı    │
└──────────────────────────────────────┘
```

### 6.4. Arşivler — Mevcut hali yeterli, küçük iyileştirmeler

- Arama çubuğu ekle
- Filtreleme (tarih aralığı, durum)
- Grid/görünüm seçeneği (liste / ızgara)

### 6.5. Sistem — Mevcut hali yeterli, görsel iyileştirmeler

- Durum kartlarına progress bar ekle (API limit, token ömrü)
- Mesajlar sekmesine bildirim sesi/animasyonu
- Audit sekmesine timeline görünümü

---

## 7. Responsive & Mobil

### 7.1. Breakpoint Stratejisi

| Breakpoint | Ekran | Düzen |
|------------|-------|-------|
| < 375px | Küçük telefon | Tek sütun, compact |
| 375-460px | iPhone SE/13/14 | 2 sütun hero, 1 sütun detay |
| 460-768px | Büyük telefon | 2 sütun hero, 2 sütun grid |
| 768-1024px | Tablet | 3 sütun grid, yan panel |
| 1024-1440px | Desktop | 4 sütun grid, max-width 1200px |
| > 1440px | Geniş ekran | Max-width 1400px, geniş kartlar |

### 7.2. Mobil İyileştirmeler

- Bottom tab bar (mevcut top tabs → mobilde bottom navigation)
- Swipe gestures (kaydırarak gün değiştirme)
- Pull-to-refresh
- Haptic feedback simülasyonu
- Touch-friendly hit areas (min 44px)

---

## 8. Performans & Erişilebilirlik

### 8.1. Performans

| Optimizasyon | Açıklama |
|-------------|----------|
| **SVG grafikler** | Canvas/div yerine SVG — daha hafif, ölçeklenebilir |
| **CSS containment** | `contain: layout style paint` ile yeniden render sınırlama |
| **content-visibility** | Görünmeyen bölümleri erteleme |
| **Lazy loading** | Leaflet harita ve arşiv verileri için |
| **debounce/throttle** | Scroll ve resize olayları için |
| **requestAnimationFrame** | Animasyonlar için |
| **CSS animasyonları** | JS animasyonları yerine CSS (GPU accelerated) |

### 8.2. Erişilebilirlik (a11y)

| Kriter | Mevcut | Hedef |
|--------|--------|-------|
| Renk kontrastı | Sadece focus-visible | Tüm metinler için WCAG AA (4.5:1) |
| Klavye navigasyonu | Tab tuşu ile | Tüm interaktif öğeler erişilebilir |
| Screen reader | ARIA rolleri var | Tüm dinamik içerik için live regions |
| Reduced motion | `prefers-reduced-motion` | Tüm animasyonlar saygı duyar |
| Focus order | Doğal DOM sırası | Mantıksal focus sırası |
| Touch targets | Yok | Min 44×44px tüm butonlar |

---

## 9. Uygulama Fazları

### Faz 0: Tasarım Sistemi Altyapısı (Tahmini: 1-2 oturum)

- [ ] Yeni renk paletini `panel-v2.css`'ye uygula
- [ ] Inter + JetBrains Mono fontlarını yükle
- [ ] Yeni gölge, spacing, radius token'larını ekle
- [ ] Glassmorphism kart stillerini oluştur
- [ ] Yeni animasyon kütüphanesini ekle
- [ ] Mevcut tüm testlerin geçtiğini doğrula

### Faz 1: Komponent Yenileme (Tahmini: 2-3 oturum)

- [ ] AeCard'ı glass/solid/gradient/outline varyantlarına ayır
- [ ] AeButton'ı gradient + spring animasyonlu yap
- [ ] AeStatusBadge'i glow efektli yap
- [ ] AeMetric komponentini oluştur (büyük metrik kartı)
- [ ] AeSparkline SVG komponentini oluştur
- [ ] AeProgressRing SVG komponentini oluştur
- [ ] AeDivider, AeSkeleton, AeTooltip komponentlerini ekle
- [ ] Tüm mevcut komponentleri yeni sisteme taşı

### Faz 2: Veri Görselleştirme (Tahmini: 2-3 oturum)

- [ ] Trend strip'teki barları SVG sparkline'larla değiştir
- [ ] Summary grid'deki kartlara mini sparkline ekle
- [ ] Mod trendi için büyük SVG line chart oluştur
- [ ] Progress ring'leri hero kartlara ekle
- [ ] Isı haritasını geliştir (tooltip, hafta etiketleri)
- [ ] Count-up animasyonunu ekle

### Faz 3: Sayfa Yenileme (Tahmini: 2-3 oturum)

- [ ] Genel Bakış sayfasını yeniden düzenle
- [ ] Trendler sayfasına SVG grafikler ekle
- [ ] Gün Detayı sayfasını akordeon/sekme yap
- [ ] Arşivlere arama ve filtre ekle
- [ ] Sistem sayfasına progress bar'lar ekle
- [ ] Staggered giriş animasyonlarını ekle

### Faz 4: Mobil & Responsive (Tahmini: 1-2 oturum)

- [ ] Bottom tab bar mobil görünümü
- [ ] Swipe gesture desteği
- [ ] Pull-to-refresh
- [ ] Touch-friendly hit areas
- [ ] Tüm breakpoint'lerde test

### Faz 5: Erişilebilirlik & Performans (Tahmini: 1 oturum)

- [ ] WCAG AA renk kontrastı doğrulaması
- [ ] Klavye navigasyonu testi
- [ ] Screen reader testi
- [ ] CSS containment ekle
- [ ] Lazy loading ekle
- [ ] Performans metriklerini ölç

### Faz 6: Test & QA (Tahmini: 1-2 oturum)

- [ ] Tüm yeni komponentler için test ekle
- [ ] SVG grafik render testleri
- [ ] Animasyon testleri (reduced-motion)
- [ ] Responsive testler
- [ ] Erişilebilirlik testleri
- [ ] Kullanıcı kabul testleri

---

## 10. Kabul Kriterleri

### 10.1. Tasarım Kalitesi

- [ ] Tüm kartlar glassmorphism efekti kullanıyor
- [ ] Tüm geçişler yumuşak ve doğal (spring easing)
- [ ] Renk paleti tutarlı, altın/bronz tema belirgin
- [ ] Tipografi hiyerarşisi net
- [ ] Hiçbir yerde ham emoji kullanılmıyor (SVG icon sistemi)
- [ ] Koyu tema varsayılan, aydınlık tema hatasız

### 10.2. Fonksiyonel Kalite

- [ ] Tüm mevcut testler geçiyor
- [ ] Tüm veri alanları görüntüleniyor
- [ ] Leaflet harita çalışıyor
- [ ] SVG grafikler doğru çiziyor
- [ ] Animasyonlar reduced-motion'da kapanıyor
- [ ] Klavye ile tam gezilebiliyor

### 10.3. Performans

- [ ] İlk render < 200ms
- [ ] Sayfa geçişleri < 100ms
- [ ] SVG grafikler < 50ms çizim
- [ ] Leaflet harita < 500ms yükleme
- [ ] Bellek kullanımı mevcut seviyeyi geçmiyor

### 10.4. Kod Kalitesi

- [ ] CSS token'ları tutarlı kullanılıyor
- [ ] JS fonksiyonları < 50 satır
- [ ] Tekrar eden CSS yok
- [ ] Yeni komponentler test edilmiş
- [ ] Eski (v1) panel.js/panel.css değişmemiş

---

## Ek: Mevcut Durum Değerlendirmesi

### Güçlü Yanlar (Korunacak)

- ✅ Sağlam veri erişim katmanı (40+ helper fonksiyon)
- ✅ Kapsamlı test süiti (9 test dosyası)
- ✅ Leaflet harita entegrasyonu
- ✅ ETag tabanlı akıllı polling
- ✅ Koyu/aydınlık tema desteği
- ✅ Density ayarları (compact/comfortable/spacious)
- ✅ ARIA rolleri ve erişilebilirlik temeli
- ✅ Responsive breakpoint'ler

### Zayıf Yanlar (İyileştirilecek)

- ❌ Emoji tabanlı icon sistemi (SVG'ye geçilmeli)
- ❌ Statik renkli barlar (SVG grafiklere geçilmeli)
- ❌ Tek animasyon (fadeIn) — zenginleştirilmeli
- ❌ Düz kart arka planları (glassmorphism eklenmeli)
- ❌ Sade tipografi (Inter fontu + scale sistemi eklenmeli)
- ❌ Yükleme durumu yok (skeleton eklenmeli)
- ❌ Mobil deneyim zayıf (bottom tabs, swipe eklenmeli)
- ❌ Arama/filtre yok (arşivler için)
- ❌ Renk kontrastı WCAG AA doğrulanmamış

---

*Bu plan, ÆON panel-v2'nin premium bir tasarım sistemine dönüşümü için yol haritasıdır. Her faz bağımsız olarak uygulanabilir ve her faz sonunda mevcut testlerin geçtiği doğrulanmalıdır.*
