# PANEL-REVIZE: Estetik ve Design System

> Yeni ÆON panelinin görsel dili, renk paleti, tipografi, grid, spacing ve animasyonları.

## 1. Felsefe

Yeni ÆON paneli:

- **Karanlık ve altın** tonlarında, gece gözlem odası hissi.
- **Yüksek kontrastlı sinyaller** ama sade arka plan.
- **Nefes alan boşluklar**; kartlar arası yeterli mesafe.
- **Mobil öncelikli**; tüm ölçüler dar ekrandan türetilir.
- **Premium dokunuşlar:** cam yüzeyler, ince altın border'lar, anlamlı gölge derinliği.

## 2. Renk paleti

### 2.1 Ana renkler

```css
:root {
  --ae-bg:        #0b0b0e;   /* derin arka plan */
  --ae-surface-1: #141419;   /* birincil kart yüzeyi */
  --ae-surface-2: #1c1c24;   /* ikincil/detay yüzeyi */
  --ae-surface-3: #24242e;   /* archive / disabled yüzeyi */

  --ae-gold:      #c9a227;   /* marka, aktif, CTA */
  --ae-gold-soft: #e8c766;   /* vurgu, hover */
  --ae-gold-dim:  #5c4b1b;   /* border, divider */

  --ae-text-1:    #f4f4f5;   /* ana metin */
  --ae-text-2:    #a1a1aa;   /* ikincil metin */
  --ae-text-3:    #71717a;   /* placeholder, footer */
}
```

### 2.2 Durum renkleri (kısıtlı)

```css
:root {
  --ae-ok:     #22c55e;   /* güncel, sağlıklı, tamamlandı */
  --ae-warn:   #f59e0b;   /* uyarı, sınırda */
  --ae-risk:   #ef4444;   /* risk, SOS, kriz */
  --ae-info:   #8b5cf6;   /* arşiv, ibadet, içgörü */
}
```

### 2.3 Modül renkleri (yalnızca ikon / chip)

```css
:root {
  --ae-mood:   #ec4899;   /* ruh hali */
  --ae-faith:  #6366f1;   /* ibadet / Kuran / zikir */
  --ae-body:   #06b6d4;   /* vücut / uyku / su */
  --ae-mind:   #a855f7;   /* terapi / meditasyon */
}
```

Kural: modül renkleri yalnızca **ikon, chip ve küçük vurgu** için; kart arka planı veya büyük metin için kullanılmaz.

## 3. Tipografi

### 3.1 Font stack

```css
:root {
  --ae-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --ae-font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
```

### 3.2 Ölçek

| Token | Boyut | Ağırlık | Kullanım |
|-------|-------|---------|----------|
| `--ae-display` | 48px / 32px (mobil) | 700 | Hero sayıları |
| `--ae-heading-1` | 28px / 24px | 700 | Sekme başlıkları |
| `--ae-heading-2` | 22px / 18px | 600 | Kart başlıkları |
| `--ae-heading-3` | 17px / 15px | 600 | Bölüm başlıkları |
| `--ae-body` | 15px / 14px | 400 | Kart içeriği |
| `--ae-caption` | 13px / 12px | 400 | Açıklamalar |
| `--ae-micro` | 11px / 10px | 500 | Etiketler, timestamp |

Mobil için `clamp()` veya media query ile ölçeklenir.

## 4. Grid ve layout

### 4.1 Ana konteyner

```css
.ae-app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 12px 32px;
}
```

### 4.2 Kart grid'i

```css
.ae-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(12, 1fr);
}

/* Mobil */
.ae-grid--today {
  grid-template-columns: repeat(2, 1fr); /* 4 hero kart 2x2 */
}

.ae-card--summary {
  grid-column: span 12; /* mobilde tam genişlik */
}

/* Masaüstü */
@media (min-width: 768px) {
  .ae-card--summary { grid-column: span 4; }
  .ae-card--anomaly { grid-column: span 6; }
}
```

## 5. Spacing sistemi

| Token | Değer | Kullanım |
|-------|-------|----------|
| `--ae-space-1` | 4px | chip iç boşluk, ikon margin |
| `--ae-space-2` | 8px | satır aralığı, buton padding |
| `--ae-space-3` | 12px | kart padding, grid gap |
| `--ae-space-4` | 16px | bölüm margin |
| `--ae-space-5` | 24px | büyük bölüm ayrımı |
| `--ae-space-6` | 32px | sayfa alt boşluk |

## 6. Kart yüzeyleri ve shadow

```css
.ae-card {
  background: var(--ae-surface-1);
  border: 1px solid var(--ae-surface-2);
  border-radius: 16px;
  padding: var(--ae-space-3);
  box-shadow: 0 1px 2px rgba(0,0,0,0.24);
}

.ae-card--hero {
  background: linear-gradient(145deg, var(--ae-surface-1), var(--ae-surface-2));
  border-color: var(--ae-gold-dim);
}

.ae-card--summary:hover {
  border-color: var(--ae-gold-dim);
}

.ae-card--anomaly {
  border-left: 4px solid var(--ae-warn);
}
```

## 7. Sekmeler

```css
.ae-tabs {
  display: flex;
  gap: var(--ae-space-1);
  overflow-x: auto;
  padding-bottom: var(--ae-space-2);
  border-bottom: 1px solid var(--ae-surface-2);
}

.ae-tab {
  padding: 10px 14px;
  border: none;
  background: transparent;
  color: var(--ae-text-2);
  font-size: var(--ae-body);
  white-space: nowrap;
  border-radius: 12px;
}

.ae-tab.is-active {
  color: var(--ae-gold);
  background: rgba(201, 162, 39, 0.12);
}
```

## 8. Butonlar

```css
.ae-btn {
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid var(--ae-gold-dim);
  background: var(--ae-surface-2);
  color: var(--ae-text-1);
  font-weight: 600;
}

.ae-btn--primary {
  background: var(--ae-gold);
  color: #0b0b0e;
  border-color: var(--ae-gold);
}

.ae-btn--ghost {
  background: transparent;
  border-color: var(--ae-surface-2);
}

.ae-btn--icon {
  width: 36px;
  height: 36px;
  padding: 0;
}
```

## 9. Animasyonlar

Animasyonlar çok az ve amaçlıdır:

```css
/* Sekme geçişi */
.ae-tab.is-active {
  transition: background-color 0.2s ease, color 0.2s ease;
}

/* Kart hover */
.ae-card {
  transition: border-color 0.2s ease, transform 0.15s ease;
}

/* Anomali pulse */
@keyframes ae-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.ae-status--risk .ae-status__dot {
  animation: ae-pulse 1.5s infinite;
}
```

Ağır animasyonlardan kaçınılır; özellikle Leaflet harita init veya render loop'ta zamanlayıcı karmaşası istenmez.

## 10. Aksan ve vurgu kullanımı

| Durum | Vurgu |
|-------|-------|
| Aktif sekme | Altın arka plan + altın metin |
| Hero kart | Altın border + altın eyebrow |
| Anomali | Sol border rengi (warn/risk) |
| Trend düşüşü | Kırmızı / amber mini ok |
| Trend yükselişi | Yeşil mini ok |
| Arşiv modülü | Mor ikon |
| Boş durum | Soluk ikon + gri metin |

## 11. Light tema

ÆON paneli varsayılan olarak dark/gold kalır. Isteğe bağlı light tema aşağıdaki gibi tanımlanır:

```css
.ae-app[data-theme="light"] {
  --ae-bg: #f7f7f8;
  --ae-surface-1: #ffffff;
  --ae-surface-2: #f4f4f5;
  --ae-surface-3: #e4e4e7;
  --ae-text-1: #18181b;
  --ae-text-2: #52525b;
  --ae-text-3: #a1a1aa;
  /* durum ve altın renkleri aynı kalır */
}
```

## 12. Estetik sistemden çıkan kurallar

1. **Koyu arka plan, tek yüzey ailesi.**
2. **Altın tek premium/marka rengidir.**
3. **Durum renkleri 4 adetle sınırlıdır.**
4. **Modül renkleri yalnızca ikon/chip.**
5. **Boşluk ve tipografi hiyerarşisi mobilde korunur.**
6. **Animasyon minimal ve amaçlıdır.**

---

Önceki: [04-KOMPONENT-KUTUPHANESI.md](04-KOMPONENT-KUTUPHANESI.md)  
Sonraki: [06-VERI-GUVENLIGI-VE-HATA-DURUMLARI.md](06-VERI-GUVENLIGI-VE-HATA-DURUMLARI.md)
