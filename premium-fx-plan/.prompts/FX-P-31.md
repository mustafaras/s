---
code: FX-P-31
name: SeyFx utility iskeleti - master gating tek noktaya topla
phase: Faz 3
agent: FX uzmanı
prerequisites:
  - FX-P-24 tamamlandı
  - Branch: premium-fx-local
input_files:
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/FX-LIBRARY.md
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/SAFEGUARDS.md
output_files:
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
forbidden:
  - app.js değiştirme
  - index.html'den app.js tag'ini kaldırma
  - git push / PR / deploy
---

# FX-P-31 · SeyFx utility iskeleti

## Amaç

Tüm görsel micro-FX için master gating’i tek noktaya (`SeyFx`) topla: `isPremiumFxEnabled`, `prefersReducedMotion`, `shouldAnimate`, `ambientAllowed` fonksiyonlarını tanımla; sonraki FX’ler bu yardımcıları kullanır.

## Girdi

- Mevcut `mediaFx.js` içinde `SeyFx` stub’ı
- `FX-LIBRARY.md` gating kuralları

## Adımlar

1. **FX-PROMPT-STATE.json güncelle:** `activePrompt: "FX-P-31"`.

2. **`SeyFx` utility’leri implemente et:**
   ```js
   function currentSettings(){
     return (window.SeymaConstants && window.SeymaConstants.data && window.SeymaConstants.data.settings) || {};
   }
   function prefersReducedMotion(){
     return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
   }
   function isPremiumFxEnabled(){
     var s = currentSettings();
     if (s.premiumAtmosphere === false) return false;
     if (prefersReducedMotion()) return false;
     return true;
   }
   function shouldAnimate(){ return isPremiumFxEnabled(); }
   function ambientAllowed(){
     var s = currentSettings();
     return isPremiumFxEnabled() && s.ambientSounds === true;
   }
   function isSoundAllowed(){
     var s = currentSettings();
     return isPremiumFxEnabled() && s.uiSounds !== false;
   }
   ```

3. **`window.SeyFx` expose et:**
   ```js
   window.SeyFx = {
     isPremiumFxEnabled: isPremiumFxEnabled,
     prefersReducedMotion: prefersReducedMotion,
     shouldAnimate: shouldAnimate,
     ambientAllowed: ambientAllowed,
     isSoundAllowed: isSoundAllowed,
     countUp: function(){},     // FX-P-34'te doldurulacak
     ripple: function(){},      // FX-P-32'te doldurulacak
     shimmer: function(){}      // FX-P-33'te doldurulacak
   };
   ```

4. **`SeyAudio.isAllowed` ve `SeyHaptics` gating fonksiyonlarını** `SeyFx.isSoundAllowed()` ve `SeyFx.isPremiumFxEnabled()` ile uyumlu hale getir (kod tekrarını azalt, ama mevcut bağımsızlığı bozma).

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

## Anti-Amnesi Güncellemesi

- `.anti-amnesia/LEDGER.md`’e satır ekle:
  ```markdown
  | FX-P-31 | 2026-08-31 | GitHub Copilot | SeyFx utility iskeleti | ✅ TAMAMLANDI | <yerel commit> | S5 geçti | isPremiumFxEnabled/prefersReducedMotion/shouldAnimate/ambientAllowed tanımlandı. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: "Devam Eden" → `FX-P-32`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-31"`, `currentPhase: "Faz 3"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-31 Faz 3 SeyFx master gating utilityleri"
```

**Push yapma.**

## Rollback

```bash
git checkout -- app/core/mediaFx.js
```

## Handoff Notu

FX-P-32: Ripple efekti CSS + JS implementasyonu.
