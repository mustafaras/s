---
code: FX-P-63
name: Reduced motion ve accessibility uyumu
phase: Faz 6
agent: a11y uzmanı
prerequisites:
  - FX-P-62 tamamlandi
  - Branch: premium-fx-local
input_files:
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
  - /Users/m_ras/Desktop/seyma/app/core/timeTheme.js
  - /Users/m_ras/Desktop/seyma/app/styles.css
  - /Users/m_ras/Desktop/seyma/app.js
output_files:
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
  - /Users/m_ras/Desktop/seyma/app/core/timeTheme.js
  - /Users/m_ras/Desktop/seyma/app/styles.css
forbidden:
  - data/settings seklini degistirme
  - App.* yuzeyini degistirme
  - git push / PR / deploy
---

# FX-P-63 · Reduced motion ve accessibility uyumu

## Amac

`prefers-reduced-motion` ortam sorgusu ve kullanici tercihine dayali tüm FX'leri tamamen devre disi birak. A11y odak yonetimi ve ekran okuyucu uyumunu guclendir.

## Girdi

- `mediaFx.js` ve `timeTheme.js` gating fonksiyonlari
- `app/styles.css`
- `app.js` modal/overlay focus yonetimi

## Adimlar

1. **FX-PROMPT-STATE.json guncelle:** `activePrompt: "FX-P-63"`.

2. **Global reduced-motion guard:**
   - `mediaFx.js` icinde `prefersReducedMotion()` zaten varsa guclendir.
   - Eger yoksa:
     ```js
     function prefersReducedMotion(){
       if (typeof window === 'undefined' || !window.matchMedia) return false;
       return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
     }
     ```

3. **Tum animasyonlari kapat:**
   - `countUp`, `ripple`, `shimmer`, `confetti` reduced-motion true oldugunda no-op veya anlik sonuc.
   - `SeyFx.isPremiumFxEnabled()` zaten reduced-motion false gerektirsin.

4. **Zaman temasi gecislerini azalt:**
   - `.theme-time-*` siniflari arasi gecis suresini CSS'te kisalt veya devre disi birak:
     ```css
     @media (prefers-reduced-motion: reduce) {
       #root, #root * { transition-duration: 0.001ms !important; animation-duration: 0.001ms !important; }
     }
     ```

5. **Screen-reader hintleri:**
   - Premium FX'lerle gelen yeni butonlarin aria-label'lerini kontrol et; sadece icon varsa mutlaka label olsun.
   - Yeni ambiyans/voice toggle butonlarina `aria-pressed` ekle.

6. **Focus yonetimi:**
   - Yeni ayarlar arasinda Tab siralamasi bozulmamali; inline onclick butonlar otomatik focusable oldugundan sira HTML sirasina bagli.

7. **Syntax check:**
   ```bash
   node --check app/core/mediaFx.js && node --check app/core/timeTheme.js && node --check app.js
   ```

## Test / Kanit

```bash
cd /Users/m_ras/Desktop/seyma
node --check app/core/mediaFx.js
node --check app/core/timeTheme.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_premium_settings.js
node tests/app/test_premium_fx_utils.js
node tests/app/test_premium_time_theme.js
```

## Anti-Amnesi Guncellemesi

- `.anti-amnesia/LEDGER.md`'e satir ekle:
  ```markdown
  | FX-P-63 | 2026-08-31 | GitHub Copilot | reduced-motion + a11y | ✅ TAMAMLANDI | <yerel commit> | S5 gecti | prefers-reduced-motion global guard eklendi; animasyonlar aninda sonuclaniyor; aria-pressed eklendi. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: "Devam Eden" → `FX-P-64`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-63"`, `currentPhase: "Faz 6"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-63 Faz 6 reduced motion ve accessibility uyumu"
```

**Push yapma.**

## Rollback

```bash
git checkout -- app/core/mediaFx.js app/core/timeTheme.js app/styles.css
```

## Handoff Notu

FX-P-64: Panel-v2 ve panel senkronizasyonu.
