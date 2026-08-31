---
code: FX-P-33
name: Shimmer efekti - yukleme ve kutlama durumlari
phase: Faz 3
agent: CSS/FX uzmanı
prerequisites:
  - FX-P-32 tamamlandı
  - Branch: premium-fx-local
input_files:
  - /Users/m_ras/Desktop/seyma/app/styles.css
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
output_files:
  - /Users/m_ras/Desktop/seyma/app/styles.css
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
forbidden:
  - app.js davranışını değiştirme
  - index.html'den app.js tag'ini kaldırma
  - git push / PR / deploy
---

# FX-P-33 · Shimmer efekti

## Amaç

Yükleme ve kutlama durumlarında kullanılacak CSS shimmer efekti ve `SeyFx.shimmer(element)` yardımcısını ekle.

## Girdi

- Mevcut `app/styles.css`
- `SeyFx.isPremiumFxEnabled()`

## Adımlar

1. **FX-PROMPT-STATE.json güncelle:** `activePrompt: "FX-P-33"`.

2. **`app/styles.css` ekle:**
   ```css
   .sey-shimmer {
     position: relative;
     overflow: hidden;
   }
   .sey-shimmer::after {
     content: '';
     position: absolute;
     inset: 0;
     background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.14) 50%, transparent 100%);
     transform: translateX(-100%);
     animation: sey-shimmer-sweep 1.4s ease-in-out infinite;
   }
   @keyframes sey-shimmer-sweep {
     to { transform: translateX(100%); }
   }
   @media (prefers-reduced-motion: reduce) {
     .sey-shimmer::after { animation: none !important; transform: translateX(0); opacity: 0; }
   }
   #root[data-theme="dark"] .sey-shimmer::after {
     background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.07) 50%, transparent 100%);
   }
   ```

3. **`SeyFx.shimmer(element)` implemente et:**
   ```js
   shimmer: function(element){
     if (!isPremiumFxEnabled() || !element) return;
     element.classList.add('sey-shimmer');
     setTimeout(function(){ element.classList.remove('sey-shimmer'); }, 1400);
   }
   ```

4. **Cache-bump:** `app/styles.css` sürümünü `index.html`’de güncelle.

5. **Syntax check.**

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
  | FX-P-33 | 2026-08-31 | GitHub Copilot | shimmer efekti | ✅ TAMAMLANDI | <yerel commit> | S5 geçti | CSS shimmer + SeyFx.shimmer() eklendi; koyu tema ve reduced-motion uyumlu. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: "Devam Eden" → `FX-P-34`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-33"`, `currentPhase: "Faz 3"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-33 Faz 3 shimmer efekti"
```

**Push yapma.**

## Rollback

```bash
git checkout -- app/styles.css app/core/mediaFx.js index.html
```

## Handoff Notu

FX-P-34: Count-up animasyonu.
