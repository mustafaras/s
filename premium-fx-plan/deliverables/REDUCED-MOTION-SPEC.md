# Reduced Motion Spec

Tüm yeni premium efektler, kullanıcı `prefers-reduced-motion: reduce` ayarını seçtiğinde pasif olmalıdır.

## CSS Kuralları

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
```

## JS Kuralları

- `prefersReducedMotion()` helper tanımlanmalı.
- Tüm animasyon yardımcıları (count-up, ripple, tab-change) bu helper’ı kontrol etmeli.
- `settings.premiumAtmosphere === false` olduğunda da aynı pasif davranış uygulanmalı.

## Test

- `tests/app/test_premium_reduced_motion.js` ile doğrulanmalı.
