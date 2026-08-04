# ÆON Panel-v2 Premium — Tasarım Referansı

> Görsel referanslar ve örnek HTML yapıları. `00-PLAN.md`'deki tasarım kararlarının somut kod karşılıkları.

---

## 1. Glassmorphism Kart

```css
.ae-card--glass {
  background: var(--ae-glass);
  backdrop-filter: blur(20px) saturate(1.1);
  -webkit-backdrop-filter: blur(20px) saturate(1.1);
  border: 1px solid var(--ae-glass-border);
  box-shadow: var(--ae-shadow-md), var(--ae-shadow-glow);
  transition: transform 0.3s var(--ae-ease), box-shadow 0.3s var(--ae-ease);
}
.ae-card--glass:hover {
  transform: translateY(-4px);
  box-shadow: var(--ae-shadow-lg), var(--ae-shadow-glow);
}
```

## 2. SVG Sparkline

```html
<svg class="ae-sparkline" viewBox="0 0 60 24" aria-hidden="true" width="60" height="24">
  <path d="M0,20 L10,15 L20,18 L30,8 L40,12 L50,4 L60,6" 
        stroke="var(--ae-accent)" fill="none" stroke-width="2" 
        vector-effect="non-scaling-stroke"/>
</svg>
```

## 3. Progress Ring

```html
<svg class="ae-ring" viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
  <circle class="ae-ring__bg" cx="20" cy="20" r="17" 
          fill="none" stroke="var(--ae-glass-border)" stroke-width="3"/>
  <circle class="ae-ring__fill" cx="20" cy="20" r="17" 
          fill="none" stroke="var(--ae-accent)" stroke-width="3"
          stroke-dasharray="106.8" stroke-dashoffset="26.7"
          stroke-linecap="round" transform="rotate(-90 20 20)"/>
  <text x="20" y="22" text-anchor="middle" 
        fill="var(--ae-text)" font-size="8" font-weight="800">75%</text>
</svg>
```

## 4. Gradient Bölücü

```css
.ae-divider {
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    var(--ae-accent) 20%, 
    var(--ae-accent2) 50%, 
    var(--ae-accent) 80%, 
    transparent 100%
  );
  margin: var(--ae-space-xl) 0;
  border: none;
  opacity: 0.5;
}
.ae-divider--label {
  display: flex;
  align-items: center;
  gap: var(--ae-space-md);
  font-size: var(--ae-scale-xs);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--ae-accent);
}
.ae-divider--label::before,
.ae-divider--label::after {
  content: "";
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--ae-accent));
}
.ae-divider--label::after {
  background: linear-gradient(90deg, var(--ae-accent), transparent);
}
```

## 5. Skeleton Yükleme

```css
.ae-skeleton {
  background: linear-gradient(
    90deg,
    var(--ae-glass) 25%,
    var(--ae-elevated) 50%,
    var(--ae-glass) 75%
  );
  background-size: 200% 100%;
  animation: aeShimmer 1.5s ease-in-out infinite;
  border-radius: var(--ae-radius-sm);
}
@keyframes aeShimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

## 6. Staggered Giriş

```css
.ae-stagger > .ae-card {
  opacity: 0;
  animation: aeSlideUp 0.4s var(--ae-ease) forwards;
}
.ae-stagger > .ae-card:nth-child(1) { animation-delay: 0ms; }
.ae-stagger > .ae-card:nth-child(2) { animation-delay: 80ms; }
.ae-stagger > .ae-card:nth-child(3) { animation-delay: 160ms; }
.ae-stagger > .ae-card:nth-child(4) { animation-delay: 240ms; }
.ae-stagger > .ae-card:nth-child(5) { animation-delay: 320ms; }
.ae-stagger > .ae-card:nth-child(6) { animation-delay: 400ms; }

@keyframes aeSlideUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## 7. Count-up Animasyonu

```css
@keyframes aeCountUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.ae-count-up {
  animation: aeCountUp 0.6s var(--ae-ease) both;
  display: inline-block;
}
```

## 8. Hero Metric Kartı (Yeni)

```html
<div class="ae-card ae-card--glass ae-metric ae-metric--mood">
  <div class="ae-metric__header">
    <span class="ae-metric__icon">🌤</span>
    <span class="ae-metric__label">Mod</span>
  </div>
  <div class="ae-metric__value">Huzurlu</div>
  <div class="ae-metric__footer">
    <svg class="ae-sparkline" viewBox="0 0 60 20" width="60" height="20">
      <path d="M0,16 L10,12 L20,14 L30,6 L40,8 L50,4 L60,5" 
            stroke="var(--ae-accent)" fill="none" stroke-width="1.5"/>
    </svg>
    <span class="ae-metric__delta ae-metric__delta--up">↑ %5</span>
  </div>
</div>
```

## 9. Trend Line Chart (Büyük)

```html
<div class="ae-card ae-card--glass ae-chart-card">
  <div class="ae-chart-card__header">
    <span class="ae-label">📈 Mod Trendi — Son 30 Gün</span>
  </div>
  <svg class="ae-chart" viewBox="0 0 300 120" preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--ae-accent)" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="var(--ae-accent)" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <!-- Grid lines -->
    <line x1="0" y1="20" x2="300" y2="20" stroke="var(--ae-glass-border)" stroke-dasharray="2,4"/>
    <line x1="0" y1="50" x2="300" y2="50" stroke="var(--ae-glass-border)" stroke-dasharray="2,4"/>
    <line x1="0" y1="80" x2="300" y2="80" stroke="var(--ae-glass-border)" stroke-dasharray="2,4"/>
    <line x1="0" y1="110" x2="300" y2="110" stroke="var(--ae-glass-border)" stroke-dasharray="2,4"/>
    <!-- Area fill -->
    <path d="M0,100 Q10,90 20,85 T40,70 T60,60 T80,75 T100,45 T120,55 T140,35 T160,50 T180,30 T200,40 T220,25 T240,35 T260,20 T280,30 T300,15 L300,120 L0,120 Z" 
          fill="url(#moodGrad)"/>
    <!-- Line -->
    <path d="M0,100 Q10,90 20,85 T40,70 T60,60 T80,75 T100,45 T120,55 T140,35 T160,50 T180,30 T200,40 T220,25 T240,35 T260,20 T280,30 T300,15" 
          stroke="var(--ae-accent)" fill="none" stroke-width="2" stroke-linecap="round"/>
    <!-- Data dots -->
    <circle cx="300" cy="15" r="4" fill="var(--ae-accent2)" stroke="var(--ae-page)" stroke-width="2"/>
  </svg>
</div>
```

## 10. Mobil Bottom Tab Bar

```css
@media (max-width: 460px) {
  .ae-tabs {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    border-radius: 0;
    border-top: 1px solid var(--ae-tab-bd);
    border-left: none;
    border-right: none;
    border-bottom: none;
    padding: var(--ae-space-xs) var(--ae-space-sm);
    padding-bottom: calc(env(safe-area-inset-bottom) + var(--ae-space-xs));
    background: var(--ae-surface);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
  .ae-app__body {
    padding-bottom: calc(80px + env(safe-area-inset-bottom));
  }
  .ae-topbar {
    padding-top: calc(env(safe-area-inset-top) + 8px);
  }
}
```

---

## Renk Karşılaştırması

| Alan | Şu Anki | Yeni |
|------|---------|------|
| Page bg (dark) | `#12100E` | `#0C0A09` |
| Card bg (dark) | `#1E1B17` | `rgba(255,255,255,0.04)` + blur |
| Accent (dark) | `#C9A86C` | `#D4AF6E` |
| Page bg (light) | `#F8F6F2` | `#F5F3EF` |
| Card bg (light) | `#FFFFFF` | `rgba(0,0,0,0.02)` + blur |
| Accent (light) | `#A4824C` | `#B08D4E` |
| Font | System stack | Inter + JetBrains Mono |
| Kart gölgesi | Tek shadow | Çok katmanlı shadow + glow |
| Animasyon | fadeIn (1) | 6 animasyon |
| Grafikler | CSS barlar | SVG line/area charts |
| Icon sistemi | Emoji string | Emoji (geçici) → SVG |
