---
code: FX-P-37
name: CSS transitions ve sayfa-level enter animasyonlari
phase: Faz 3
agent: FX uzmanı
prerequisites:
  - FX-P-36 tamamlandı
  - Branch: premium-fx-local
  - SeyFx utility ve gating fonksiyonları tamamlanmış
input_files:
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
  - /Users/m_ras/Desktop/seyma/app/styles.css
  - /Users/m_ras/Desktop/seyma/index.html
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/FX-LIBRARY.md
output_files:
  - /Users/m_ras/Desktop/seyma/app/styles.css
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
forbidden:
  - app.js değiştirme
  - index.html'den app.js tag'ini kaldırma
  - data/settings şeklini değiştirme
  - git push / PR / deploy
---

# FX-P-37 · CSS transitions ve sayfa-level enter animasyonları

## Amaç

Sayfa geçişlerinde ve önemli kartların ekrana gelişinde yumuşak `fade`/`slide` animasyonları tanımla; tümü `prefers-reduced-motion` ve `premiumAtmosphere` gating'e tabi olsun.

## Girdi

- Mevcut `app/styles.css` CSS değişkenleri ve global kuralları
- `SeyFx.shouldAnimate()` gating fonksiyonu
- `FX-LIBRARY.md` enter/transition tanımları

## Adımlar

1. **FX-PROMPT-STATE.json güncelle:** `activePrompt: "FX-P-37"`.

2. **CSS enter animasyonları ekle:**
   ```css
   @keyframes sey-fade-in {
     from { opacity: 0; transform: translateY(8px); }
     to { opacity: 1; transform: translateY(0); }
   }
   .sey-enter {
     animation: sey-fade-in 220ms ease-out forwards;
   }
   .sey-enter-delay-1 { animation-delay: 60ms; }
   .sey-enter-delay-2 { animation-delay: 120ms; }
   .sey-enter-delay-3 { animation-delay: 180ms; }
   ```

3. **Reduced-motion override:**
   ```css
   @media (prefers-reduced-motion: reduce) {
     .sey-enter, .sey-enter * {
       animation: none !important;
       opacity: 1 !important;
       transform: none !important;
     }
   }
   ```

4. **`SeyFx` page-enter helper ekle:**
   ```js
   enter: function(selector, staggerMs){
     if (!shouldAnimate()) return;
     var nodes = typeof selector === 'string' ? document.querySelectorAll(selector) : [selector];
     staggerMs = Math.max(0, Math.min(Number(staggerMs) || 60, 200));
     Array.prototype.forEach.call(nodes, function(el, i){
       el.classList.remove('sey-enter');
       el.style.animationDelay = (i * staggerMs) + 'ms';
       void el.offsetWidth;
       el.classList.add('sey-enter');
     });
   }
   ```

5. **Transition utility:**
   ```js
   transition: function(el, property, durationMs){
     if (!shouldAnimate()) return;
     if (!el || !el.style) return;
     durationMs = Math.max(0, Math.min(Number(durationMs) || 200, 1000));
     el.style.transition = property + ' ' + durationMs + 'ms ease';
     return el;
   }
   ```

6. **`SeyFx` expose güncelle:**
   ```js
   window.SeyFx = {
     // mevcut fonksiyonlar
     enter: enter,
     transition: transition
   };
   ```

7. **Cache-bump:** `app/styles.css` ve `mediaFx.js` sürümlerini `index.html`’de güncelle.

8. **Syntax check:**
   ```bash
   node --check app/core/mediaFx.js
   ```

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check app/core/mediaFx.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_premium_fx_utils.js
node tests/app/test_modularization_boundary.js
node tests/app/test_faz10_sync.js
```

## Anti-Amnesi Güncellemesi

- `.anti-amnesia/LEDGER.md`’e satır ekle:
  ```markdown
  | FX-P-37 | 2026-08-31 | GitHub Copilot | enter/transition animasyonları | ✅ TAMAMLANDI | <yerel commit> | S5 geçti | sey-enter, stagger delay, transition helper eklendi; reduced-motion override var. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: "Devam Eden" → `FX-P-38`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-37"`, `currentPhase: "Faz 3"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-37 Faz 3 CSS enter ve transition animasyonları"
```

**Push yapma.**

## Rollback

```bash
git checkout -- app/core/mediaFx.js app/styles.css
```

## Handoff Notu

FX-P-38: Visual FX performance audit ve reduced-motion final review.
