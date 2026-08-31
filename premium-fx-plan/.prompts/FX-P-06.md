---
code: FX-P-06
name: mediaFx.js iskeletini gercek API yuzeyiyle olustur
phase: Faz 0
agent: FX uzmanı
prerequisites:
  - FX-P-05 tamamlandı
  - Branch: premium-fx-local
input_files:
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/API-TRANSITION-GUIDE.md §2.3
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/FX-LIBRARY.md
output_files:
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
forbidden:
  - app.js değiştirme
  - index.html'den app.js tag'ini kaldırma
  - git push / PR / deploy
---

# FX-P-06 · mediaFx.js iskeletini gerçek API yüzeyiyle oluştur

## Amaç

`mediaFx.js` içinde `SeyAudio`, `SeyHaptics`, `SeyFx` nesnelerinin tüm fonksiyonlarını, gating kurallarına uygun şekilde tanımla. Fonksiyonlar henüz full implementasyon içermeyebilir, ancak API imzası, parametreleri ve dönüş tipleri net olmalı.

## Adımlar

1. `FX-PROMPT-STATE.json` güncelle: `activePrompt: "FX-P-06"`.

2. `window.SeyAudio` güncelle:
   - `ctx` lazy init (AudioContext oluşturma)
   - `tap()`, `success()`, `warning()`, `bell()` temel osilatör/zarflar
   - `voice(text)` TTS wrapper (stub)
   - `ambient(type)` ambient sound stub

3. `window.SeyHaptics` güncelle:
   - `tap()`, `success()`, `error()`, `refresh()`, `streak()`, `water()`
   - `navigator.vibrate` yoksa no-op
   - `settings.richHaptics` ve `prefers-reduced-motion` gating

4. `window.SeyFx` güncelle:
   - `isPremiumFxEnabled()` → `settings.premiumAtmosphere && !prefersReducedMotion()`
   - `prefersReducedMotion()` → `window.matchMedia('(prefers-reduced-motion: reduce)').matches`
   - `shouldAnimate()` → alias
   - `ambientAllowed()` → `settings.ambientSounds && settings.premiumAtmosphere`
   - `countUp(options)`, `ripple(event, color)`, `shimmer(element)` stub

5. `node --check app/core/mediaFx.js` çalıştır.

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check app/core/mediaFx.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_modularization_boundary.js
node tests/app/test_faz10_sync.js
node tests/panel/test_faz11_panel.js
```

## Anti-Amnesi Güncellemesi

- `.anti-amnesia/LEDGER.md`’e satır ekle (seq 24):
  ```markdown
  | 24 | 2026-08-31 | GitHub Copilot | FX-P-06 | ✅ TAMAMLANDI | <yerel commit> | S5 geçti | mediaFx.js API yüzeyi ve gating fonksiyonları tanımlandı. |
  ```
- `.anti-amnesia/CURRENT-STATE.md` güncelle: `currentPhase: "Faz 0 tamamlandı"`, `lastCompletedFaz: "Faz 0"`, sıradaki `Dalga 1 / FX-P-11` (ayrı onay bekleniyor).
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-06"`, `currentPhase: "Faz 0 tamamlandı"`.
- `NEXT-STEPS.md` güncelle: Faz 0 tamamlandı, Dalga 1 için kullanıcı onayı bekleniyor.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-06 Faz 0 mediaFx.js API iskeleti ve master gating"
```

**Push yapma.**

## Rollback

```bash
git checkout -- app/core/mediaFx.js
git reset HEAD~1
```

## Handoff Notu

Dalga 0 tamamlandı. Dalga 1 (audio) için ayrı kullanıcı onayı alınacak. `mediaFx.js` artık güvenli gating fonksiyonları içeriyor; içerik sonraki fazlarda doldurulacak.
