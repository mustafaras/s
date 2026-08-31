---
code: FX-P-36
name: Visual FX test fixturelari ve Faz 3 kapanis
phase: Faz 3
agent: test uzmanı
prerequisites:
  - FX-P-35 tamamlandı
  - Branch: premium-fx-local
input_files:
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
  - /Users/m_ras/Desktop/seyma/app.js
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/deliverables/REVIEW-CHECKLIST.md
output_files:
  - /Users/m_ras/Desktop/seyma/tests/app/test_premium_fx_utils.js
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/deliverables/REVIEW-CHECKLIST.md
forbidden:
  - app.js davranışını değiştirme
  - index.html'den app.js tag'ini kaldırma
  - git push / PR / deploy
---

# FX-P-36 · Visual FX test fixture’ları ve Faz 3 kapanış

## Amaç

Dalga 3 kapanışı. `SeyFx` utility fonksiyonları, gating kombinasyonları ve app.js entegrasyon noktalarını testle doğrula; kapsam raporu güncelle.

## Girdi

- Mevcut `mediaFx.js`
- `app.js` içindeki `SeyFx.*` çağrı noktaları

## Adımlar

1. **FX-PROMPT-STATE.json güncelle:** `activePrompt: "FX-P-36"`.

2. **`tests/app/test_premium_fx_utils.js` oluştur:**
   - `vm` ile `constants.js`, `state.js`, `mediaFx.js` yükle.
   - `SeyFx.isPremiumFxEnabled` kombinasyonlarını test et:
     - `premiumAtmosphere=true` + reduced-motion=false → true
     - `premiumAtmosphere=false` → false
     - reduced-motion=true → false (premiumAtmosphere true olsa bile)
   - `SeyFx.ripple`’ın gating kapalıyken hiçbir şey yapmadığını doğrula.
   - `SeyFx.countUp`’ın reduced-motion’da doğrudan hedef değeri yazdığını doğrula.
   - `SeyFx.shimmer`’ın elemente class eklediğini (gating açıkken) ve reduced-motion’da eklemeyip doğrudan döndüğünü doğrula.
   - `SeyFx.ambientAllowed` ve `SeyFx.isSoundAllowed` kombinasyonlarını test et.

3. **`REVIEW-CHECKLIST.md` güncelle:** Dalga 3 satırları ekle:
   ```markdown
   - [x] SeyFx.isPremiumFxEnabled / prefersReducedMotion / shouldAnimate / ambientAllowed / isSoundAllowed uygulandı
   - [x] Ripple efekti implemente edildi
   - [x] Shimmer efekti implemente edildi
   - [x] Count-up animasyonu implemente edildi
   - [x] Micro-FX entegrasyonu yapıldı
   - [x] Visual FX test fixture PASS
   ```

4. **Syntax check ve testler.**

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check tests/app/test_premium_fx_utils.js
node tests/app/test_premium_fx_utils.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_faz10_sync.js
node tests/panel/test_faz11_panel.js
for f in tests/panel-v2/test_panel_v2_*.js; do node "$f" || echo "FAIL: $f"; done
```

## S6 Değişmezlik Kanıtı

```bash
grep -o 'App\.[a-zA-Z0-9_]*\s*=' app.js | sort -u | wc -l
grep -o 'onclick="App\.[a-zA-Z0-9_]*' app.js | sort | uniq -c
grep -c 'src="app.js' index.html
```

## Anti-Amnesi Güncellemesi

- `.anti-amnesia/LEDGER.md`’e satır ekle:
  ```markdown
  | FX-P-36 | 2026-08-31 | GitHub Copilot | visual FX test + kapsam | ✅ TAMAMLANDI | <yerel commit> | S5/S6 geçti | Dalga 3 Visual micro-FX tamamlandı; SeyFx gating ve entegrasyon test edildi. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: `currentPhase: "Faz 3 tamamlandı"`, `lastCompletedFaz: "Faz 3"`, sıradaki `Dalga 4 / FX-P-41` (ayrı onay bekleniyor).
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-36"`, `currentPhase: "Faz 3 tamamlandı"`.
- `NEXT-STEPS.md` güncelle: Faz 3 tamamlandı, Dalga 4 (Time theme) için kullanıcı onayı bekleniyor.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-36 Faz 3 visual FX test fixture ve kapsam raporu"
```

**Push yapma.**

## Rollback

```bash
git checkout -- tests/app/test_premium_fx_utils.js premium-fx-plan/deliverables/REVIEW-CHECKLIST.md
```

## Handoff Notu

Dalga 4 Time theme başlar: FX-P-41 `SeyTimeTheme.classForHour()`.
