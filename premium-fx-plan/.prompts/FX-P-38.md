---
code: FX-P-38
name: Visual FX performance audit ve reduced-motion final review
phase: Faz 3
agent: FX uzmanı
prerequisites:
  - FX-P-37 tamamlandı
  - Branch: premium-fx-local
  - SeyFx enter/transition ve temel micro-FX'ler tamamlanmış
input_files:
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
  - /Users/m_ras/Desktop/seyma/app/styles.css
  - /Users/m_ras/Desktop/seyma/app.js
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/FX-LIBRARY.md
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/REVIEW-CHECKLIST.md
output_files:
  - /Users/m_ras/Desktop/seyma/app/styles.css
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/FX-LIBRARY.md
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/REVIEW-CHECKLIST.md
forbidden:
  - app.js davranışını değiştirme
  - index.html'den app.js tag'ini kaldırma
  - data/settings şeklini değiştirme
  - git push / PR / deploy
---

# FX-P-38 · Visual FX performance audit ve reduced-motion final review

## Amaç

Dalga 3'ün performans ve erişilebilirlik denetimini yap: `will-change`, `contain`, `prefers-reduced-motion` kullanımını gözden geçir; visual FX kataloğunu `FX-LIBRARY.md`'ye işle ve Faz 3 çıkış check-list'ini işaretle.

## Girdi

- Mevcut `app/styles.css` animasyon/transition kuralları
- `mediaFx.js` visual FX implementasyonu
- `FX-LIBRARY.md` visual micro-FX tanımları

## Adımlar

1. **FX-PROMPT-STATE.json güncelle:** `activePrompt: "FX-P-38"`.

2. **Performance audit — CSS:**
   - `.sey-ripple`, `.sey-shimmer`, `.sey-enter` gibi animasyonlu class'larda `will-change: transform, opacity;` kullan; yalnızca animasyon öncesi ekle, sonrasında kaldırma mekanizması varsa onayla (örneğin `animationend` listener ile kaldırma; yoksa ekle).
   - Yoğun render alanlarında (`#app`, `.bento-grid`) `contain: layout paint` kullanımını değerlendir; uygun görülen yerlere ekle.
   - `transform` ve `opacity` dışında pahalı property animasyonu (`width`, `height`, `top`, `left`) varsa raporla ve değiştir.

3. **Performance audit — JS:**
   - `SeyFx.ripple`, `shimmer`, `countUp`, `enter` fonksiyonlarında `requestAnimationFrame` veya `setTimeout` chain'leri kontrol et; memory leak'e neden olan closure veya event listener kalmadığını doğrula.
   - Her FX fonksiyonunun gating kapalıyken en erken noktada return ettiğini kontrol et.

4. **Reduced-motion final review:**
   - `@media (prefers-reduced-motion: reduce)` ile tüm animasyon/transition'ların kapatıldığını doğrula.
   - `SeyFx.shouldAnimate()` ve `prefersReducedMotion()` arasındaki ilişkiyi FX-LIBRARY.md'de açıkla.

5. **`FX-LIBRARY.md` Visual FX katalog bölümünü güncelle:**
   ```markdown
   ## Visual FX Catalog (`window.SeyFx`)

   | Function | Effect | Gating | Performance notes |
   |----------|--------|--------|-------------------|
   | ripple | Tap expanding circle | premiumAtmosphere && !reduced-motion | will-change ekle/kaldır |
   | shimmer | Soft light sweep | premiumAtmosphere && !reduced-motion | CSS keyframes |
   | countUp | Number interpolation | premiumAtmosphere && !reduced-motion | raf with early exit |
   | enter | Fade/slide stagger | premiumAtmosphere && !reduced-motion | 60-180 ms stagger |
   | transition | CSS transition helper | premiumAtmosphere && !reduced-motion | property scoped |
   ```

6. **`REVIEW-CHECKLIST.md` Faz 3 final satırlarını işaretle/güncelle:**
   ```markdown
   - [x] SeyFx.isPremiumFxEnabled / prefersReducedMotion / shouldAnimate / ambientAllowed / isSoundAllowed uygulandı
   - [x] Ripple, shimmer, count-up, enter, transition implemente edildi
   - [x] will-change / contain kullanımı gözden geçirildi
   - [x] prefers-reduced-motion tüm animasyonları kapatıyor
   - [x] Visual FX test fixture PASS
   - [x] FX-LIBRARY.md visual FX katalogu güncellendi
   ```

7. **Audit raporu ekle (opsiyonel):** `premium-fx-plan/deliverables/VISUAL-FX-AUDIT.md` adında kısa bir rapor oluştur: bulunan riskler, uygulanan iyileştirmeler, kalan teknik borç.

8. **Syntax check:**
   ```bash
   node --check app/core/mediaFx.js
   ```

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check app/core/mediaFx.js
node tests/app/test_premium_fx_utils.js
node tests/app/test_premium_haptics_fx.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_faz10_sync.js
node tests/app/test_modularization_boundary.js
```

Ek kanıt:
```bash
grep -n 'will-change\|contain:' app/styles.css
grep -n 'prefers-reduced-motion' app/styles.css
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
  | FX-P-38 | 2026-08-31 | GitHub Copilot | visual FX performance audit | ✅ TAMAMLANDI | <yerel commit> | S5/S6 geçti | Dalga 3 Visual micro-FX tamamlandı; will-change/contain/reduced-motion denetlendi; FX-LIBRARY katalog güncellendi. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: `currentPhase: "Faz 3 tamamlandı"`, `lastCompletedFaz: "Faz 3"`, sıradaki `Dalga 4 / FX-P-41` (ayrı onay bekleniyor).
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-38"`, `currentPhase: "Faz 3 tamamlandı"`.
- `NEXT-STEPS.md` güncelle: Faz 3 tamamlandı, Dalga 4 (Time theme) için kullanıcı onayı bekleniyor.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-38 Faz 3 visual FX performans denetimi ve katalog"
```

**Push yapma.**

## Rollback

```bash
git checkout -- app/styles.css premium-fx-plan/FX-LIBRARY.md premium-fx-plan/REVIEW-CHECKLIST.md
```

## Handoff Notu

Dalga 4 Time theme başlar: FX-P-41 `SeyTimeTheme.classForHour()`.
