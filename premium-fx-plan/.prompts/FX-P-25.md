---
code: FX-P-25
name: Scroll ve refresh haptic pattern'leri + reduced-motion kenar durumlari
phase: Faz 2
agent: haptics uzmanı
prerequisites:
  - FX-P-24 tamamlandı
  - Branch: premium-fx-local
  - SeyHaptics temel desenleri implemente edilmiş
input_files:
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/FX-LIBRARY.md
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/SAFEGUARDS.md
output_files:
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
  - /Users/m_ras/Desktop/seyma/tests/app/test_premium_haptics_scroll.js
forbidden:
  - app.js değiştirme
  - index.html'den app.js tag'ini kaldırma
  - data/settings şeklini değiştirme
  - git push / PR / deploy
---

# FX-P-25 · Scroll ve refresh haptic pattern'leri

## Amaç

Liste kaydırma, sayfa refresh ve uzun içerik gezinme anlarında `SeyHaptics.scrollTick()`, `SeyHaptics.refreshPulse()` ve `SeyHaptics.boundary()` desenlerini ekleyerek dokunsal geri bildirimi zenginleştir; reduced-motion tercihinin haptics'i de durdurduğu kenar durumlarını kapat.

## Girdi

- Mevcut `mediaFx.js` içindeki `SeyHaptics` desenleri
- `FX-LIBRARY.md` scroll/boundary haptics tanımları
- `SAFEGUARDS.md` reduced-motion kuralı

## Adımlar

1. **FX-PROMPT-STATE.json güncelle:** `activePrompt: "FX-P-25"`.

2. **`SeyHaptics` scroll/boundary desenlerini ekle:**
   ```js
   scrollTick: function(){ vibrate([8]); },
   refreshPulse: function(){ vibrate([12, 40, 12]); },
   boundary: function(){ vibrate([18, 18]); }
   ```

3. **Throttle'lı scroll helper ekle:**
   ```js
   var lastScrollVibrate = 0;
   window.SeyHaptics.scroll = function(force){
     if (!force && Date.now() - lastScrollVibrate < 120) return;
     lastScrollVibrate = Date.now();
     window.SeyHaptics.scrollTick();
   };
   ```

4. **Reduced-motion kenar durumlarını kapat:**
   - `vibrate()` içinde zaten reduced-motion kontrolü varsa doğrula.
   - Ek olarak `window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', ...)` kullanarak dinamik tercih değişiminde desenlerin anında sessizleştiğini garantile (bu listener sadece state izler, herhangi bir çağrı yapmaz).
   - iOS/Android'de `navigator.vibrate` desteklemeyen ortamda exception yememe testini güçlendir.

5. **`tests/app/test_premium_haptics_scroll.js` oluştur:**
   - `vm` ile `constants.js`, `state.js`, `mediaFx.js` yükle.
   - `SeyHaptics.scrollTick`, `refreshPulse`, `boundary` pattern uzunluklarını doğrula.
   - Throttle'ın 120 ms içinde ikinci çağrıyı engellediğini doğrula.
   - `prefers-reduced-motion: reduce` ve `premiumAtmosphere=false` durumlarında `navigator.vibrate` çağrılmadığını doğrula.
   - `navigator.vibrate` tanımsızken exception atmadığını doğrula.

6. **Syntax check:**
   ```bash
   node --check app/core/mediaFx.js
   node --check tests/app/test_premium_haptics_scroll.js
   ```

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check app/core/mediaFx.js
node --check tests/app/test_premium_haptics_scroll.js
node tests/app/test_premium_haptics_scroll.js
node tests/app/test_premium_haptics_fx.js
node tests/app/test_modularization_boundary.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_faz10_sync.js
```

## Anti-Amnesi Güncellemesi

- `.anti-amnesia/LEDGER.md`’e satır ekle:
  ```markdown
  | FX-P-25 | 2026-08-31 | GitHub Copilot | scroll/refresh/boundary haptics | ✅ TAMAMLANDI | <yerel commit> | S5 geçti | SeyHaptics.scrollTick/refreshPulse/boundary eklendi; reduced-motion dinamik değişim ve throttle test edildi. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: "Devam Eden" → `FX-P-26`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-25"`, `currentPhase: "Faz 2"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-25 Faz 2 scroll refresh boundary haptics ve reduced-motion kenar durumlari"
```

**Push yapma.**

## Rollback

```bash
git checkout -- app/core/mediaFx.js tests/app/test_premium_haptics_scroll.js
```

## Handoff Notu

FX-P-26: Haptics final audit ve FX-LIBRARY.md katalog güncellemesi.
