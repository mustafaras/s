---
code: FX-P-21
name: SeyHaptics implementasyonu - tap success error refresh streak water
phase: Faz 2
agent: haptics uzmanı
prerequisites:
  - FX-P-16 tamamlandı
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

# FX-P-21 · SeyHaptics implementasyonu

## Amaç

`window.SeyHaptics` altındaki titreşim desenlerini (`tap`, `success`, `error`, `refresh`, `streak`, `water`) `navigator.vibrate` üzerinden implemente et; gating ve reduced-motion kurallarına uy.

## Girdi

- Mevcut `mediaFx.js` içinde `SeyHaptics` stub’ı
- `FX-LIBRARY.md` haptics pattern tanımları
- `SAFEGUARDS.md` reduced-motion kuralı

## Adımlar

1. **FX-PROMPT-STATE.json güncelle:** `activePrompt: "FX-P-21"`.

2. **Yardımcı fonksiyon ekle:**
   ```js
   function vibrate(pattern){
     if (!window.SeymaConstants || !window.SeymaConstants.data) return;
     var s = window.SeymaConstants.data.settings || {};
     if (s.premiumAtmosphere === false || s.richHaptics === false || s.haptics === false) return;
     if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
     if (!navigator.vibrate) return;
     try { navigator.vibrate(pattern); } catch(e){}
   }
   ```

3. **`SeyHaptics` desenleri tanımla:**
   ```js
   window.SeyHaptics = {
     tap: function(){ vibrate([15]); },
     success: function(){ vibrate([20, 30, 50]); },
     error: function(){ vibrate([40, 20, 40]); },
     refresh: function(){ vibrate([10, 20, 10, 20, 10]); },
     streak: function(){ vibrate([30, 50, 80]); },
     water: function(){ vibrate([10, 15, 10]); }
   };
   ```

4. **iOS no-op fallback zaten var** — `navigator.vibrate` desteklemeyen ortamlarda sessizce çıkılır.

5. **Syntax check:**
   ```bash
   node --check app/core/mediaFx.js
   ```

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check app/core/mediaFx.js
node tests/app/test_premium_haptics_fx.js
node tests/app/test_modularization_boundary.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_faz10_sync.js
```

## Anti-Amnesi Güncellemesi

- `.anti-amnesia/LEDGER.md`’e satır ekle:
  ```markdown
  | FX-P-21 | 2026-08-31 | GitHub Copilot | haptics implementasyonu | ✅ TAMAMLANDI | <yerel commit> | S5 geçti | SeyHaptics desenleri (tap/success/error/refresh/streak/water) ve gating implemente edildi. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: "Devam Eden" → `FX-P-22`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-21"`, `currentPhase: "Faz 2"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-21 Faz 2 haptics desenleri ve master gating"
```

**Push yapma.**

## Rollback

```bash
git checkout -- app/core/mediaFx.js
```

## Handoff Notu

FX-P-22: Buton/kart tıklamalarına `SeyHaptics.tap()` entegre et.
