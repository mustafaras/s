---
code: FX-P-32
name: Ripple efekti - dokunma koordinatlarina gore CSS ripple
phase: Faz 3
agent: CSS/FX uzmanı
prerequisites:
  - FX-P-31 tamamlandı
  - Branch: premium-fx-local
input_files:
  - /Users/m_ras/Desktop/seyma/app/styles.css
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/deliverables/REDUCED-MOTION-SPEC.md
output_files:
  - /Users/m_ras/Desktop/seyma/app/styles.css
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
forbidden:
  - app.js davranışını değiştirme
  - index.html'den app.js tag'ini kaldırma
  - git push / PR / deploy
---

# FX-P-32 · Ripple efekti

## Amaç

Dokunma koordinatlarına göre genişleyen CSS ripple efekti ekle; reduced-motion ve master switch kapalıyken sessiz.

## Girdi

- Mevcut `app/styles.css`
- `REDUCED-MOTION-SPEC.md`
- `SeyFx.isPremiumFxEnabled()`

## Adımlar

1. **FX-PROMPT-STATE.json güncelle:** `activePrompt: "FX-P-32"`.

2. **`app/styles.css` ekle:**
   ```css
   .sey-ripple {
     position: relative;
     overflow: hidden;
     transform: translate3d(0,0,0);
   }
   .sey-ripple-wave {
     position: absolute;
     border-radius: 50%;
     transform: scale(0);
     animation: sey-ripple-spread 0.55s linear forwards;
     pointer-events: none;
     background: currentColor;
     opacity: 0.18;
   }
   @keyframes sey-ripple-spread {
     to { transform: scale(4); opacity: 0; }
   }
   @media (prefers-reduced-motion: reduce) {
     .sey-ripple-wave { animation: none !important; opacity: 0; }
   }
   ```

3. **`SeyFx.ripple(event, color)` implemente et:**
   ```js
   ripple: function(event, color){
     if (!isPremiumFxEnabled()) return;
     var el = event && event.currentTarget;
     if (!el) return;
     var rect = el.getBoundingClientRect();
     var x = (event.clientX || rect.left + rect.width/2) - rect.left;
     var y = (event.clientY || rect.top + rect.height/2) - rect.top;
     var d = Math.max(rect.width, rect.height) * 2;
     var wave = document.createElement('span');
     wave.className = 'sey-ripple-wave';
     wave.style.left = (x - d/2) + 'px';
     wave.style.top = (y - d/2) + 'px';
     wave.style.width = wave.style.height = d + 'px';
     if (color) wave.style.background = color;
     el.appendChild(wave);
     setTimeout(function(){ wave.remove(); }, 600);
   }
   ```

4. **Cache-bump:** `index.html` içinde `app/styles.css` sürümünü güncelle.

5. **Syntax check:**
   ```bash
   node --check app/core/mediaFx.js
   ```

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check app/core/mediaFx.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_modularization_boundary.js
node tests/app/test_faz10_sync.js
```

Görsel QA (isteğe bağlı, kullanıcı onaylı):
```bash
python3 -m http.server 9000 --bind 127.0.0.1
```

## Anti-Amnesi Güncellemesi

- `.anti-amnesia/LEDGER.md`’e satır ekle:
  ```markdown
  | FX-P-32 | 2026-08-31 | GitHub Copilot | ripple efekti | ✅ TAMAMLANDI | <yerel commit> | S5 geçti | CSS ripple + SeyFx.ripple() implemente edildi; reduced-motion’a saygılı. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: "Devam Eden" → `FX-P-33`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-32"`, `currentPhase: "Faz 3"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-32 Faz 3 dokunma ripple efekti"
```

**Push yapma.**

## Rollback

```bash
git checkout -- app/styles.css app/core/mediaFx.js index.html
```

## Handoff Notu

FX-P-33: Shimmer efekti.
