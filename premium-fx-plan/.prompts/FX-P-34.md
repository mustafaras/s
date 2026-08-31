---
code: FX-P-34
name: Count-up animasyonu - sayaclar yumusak artsin
phase: Faz 3
agent: FX uzmanı
prerequisites:
  - FX-P-33 tamamlandı
  - Branch: premium-fx-local
input_files:
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/FX-LIBRARY.md
output_files:
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
forbidden:
  - app.js değiştirme
  - index.html'den app.js tag'ini kaldırma
  - git push / PR / deploy
---

# FX-P-34 · Count-up animasyonu

## Amaç

Sayaç değerlerinin ani değişim yerine yumuşak artışla güncellenmesini sağlayan `SeyFx.countUp(options)` yardımcısı ekle.

## Girdi

- Mevcut `mediaFx.js`
- `FX-LIBRARY.md` count-up tanımı

## Adımlar

1. **FX-PROMPT-STATE.json güncelle:** `activePrompt: "FX-P-34"`.

2. **`SeyFx.countUp(options)` implemente et:**
   ```js
   countUp: function(options){
     if (!isPremiumFxEnabled() || typeof options !== 'object' || !options.el) return;
     var from = Number(options.from) || 0;
     var to = Number(options.to) || 0;
     var duration = Math.max(0, Math.min(Number(options.duration) || 800, 2000));
     var start = performance.now ? performance.now() : Date.now();
     var formatter = typeof options.formatter === 'function' ? options.formatter : function(v){ return Math.round(v); };
     var raf = window.requestAnimationFrame || window.setTimeout;
     function tick(now){
       var t = (now - start) / duration;
       if (t < 0) t = 0;
       if (t > 1) t = 1;
       var v = from + (to - from) * t;
       try { options.el.textContent = formatter(v); } catch(e){}
       if (t < 1) raf(tick);
     }
     raf(tick);
   }
   ```

3. **`countUp` reduced-motion uyumu:**
   - Eğer `prefersReducedMotion()` true ise doğrudan `options.el.textContent = formatter(to)` yap, animasyonu atla.

4. **Syntax check:**
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

## Anti-Amnesi Güncellemesi

- `.anti-amnesia/LEDGER.md`’e satır ekle:
  ```markdown
  | FX-P-34 | 2026-08-31 | GitHub Copilot | count-up animasyonu | ✅ TAMAMLANDI | <yerel commit> | S5 geçti | SeyFx.countUp() eklendi; reduced-motion’da anında günceller. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: "Devam Eden" → `FX-P-35`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-34"`, `currentPhase: "Faz 3"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-34 Faz 3 count-up animasyon yardimcisi"
```

**Push yapma.**

## Rollback

```bash
git checkout -- app/core/mediaFx.js
```

## Handoff Notu

FX-P-35: Micro-FX entegrasyonu (kart toggle, streak, su).
