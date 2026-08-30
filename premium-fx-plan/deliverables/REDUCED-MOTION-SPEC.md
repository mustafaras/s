# Reduced Motion Spec

**Sürüm:** 2.1  
**Güncellendi:** 2026-08-30

Tüm yeni premium efektler, kullanıcı `prefers-reduced-motion: reduce` ayarını seçtiğinde pasif olmalıdır.

## CSS Kuralları

Mevcut `app/styles.css` içinde zaten 30+ reduce-motion bloğu var; bunların yanına eklenecek:

```css
@media (prefers-reduced-motion: reduce) {
  .sey-fx-shimmer,
  .sey-fx-ripple,
  .sey-fx-float,
  .sey-fx-count,
  .sey-fx-bounce,
  .sey-splash,
  .sey-splash-aurora,
  .sey-splash-wordmark,
  .sey-splash-flam,
  .sey-splash-greeting,
  .sey-time-theme,
  .sey-aurora,
  .sey-tab-change,
  .surface,
  .sey-bottomnav-item.is-active .sey-bottomnav-glyph,
  .sey-toggle,
  .sey-toggle-knob {
    animation: none !important;
    transition: none !important;
  }
  .surface:hover, .surface:active { transform: none !important; }
}

/* Faz 2’de tanımlanacak yeni keyframe’ler de aynı şekilde kapatılmalı: */
@media (prefers-reduced-motion: reduce) {
  .sey-ripple,
  .sey-ripple::after,
  .sey-nav-bounce,
  .sey-count-up,
  .sey-shimmer-ring { animation: none !important; transition: none !important; }
}
```

## JS Kuralları

- `prefersReducedMotion()` helper tanımlanmalı.
- Tüm animasyon yardımcıları (count-up, ripple, tab-change) bu helper’ı kontrol etmeli.
- `settings.premiumAtmosphere === false` olduğunda da aynı pasif davranış uygulanmalı.

## Test

- `tests/app/test_premium_reduced_motion.js` ile doğrulanmalı.
