---
code: FX-P-11
name: SeyAudio Web Audio boot ve temel UI sesleri
phase: Faz 1
agent: audio uzmanı
prerequisites:
  - Faz 0 tamamlandı (FX-P-05, FX-P-06)
  - Kullanıcı onayı: Dalga 1 (Audio) başlasın.
  - Branch: premium-fx-local
input_files:
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/FX-LIBRARY.md
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/deliverables/SPEC-FAZ-1.md
output_files:
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
forbidden:
  - app.js değiştirme (henüz)
  - git push / PR / deploy
---

# FX-P-11 · SeyAudio Web Audio boot ve temel UI sesleri

## Amaç

`SeyAudio` içinde Web Audio AudioContext boot mantığını ve `tap()`, `success()`, `warning()`, `bell()` fonksiyonlarını, `settings.premiumAtmosphere` + `settings.uiSounds` + `prefers-reduced-motion` gating’ine uygun şekilde implemente et.

## Adımlar

1. `FX-PROMPT-STATE.json` güncelle: `activePrompt: "FX-P-11"`.

2. `SeyAudio.ctx` lazy init:
   - `if (!SeyAudio.ctx) SeyAudio.ctx = new (window.AudioContext || window.webkitAudioContext)();`
   - Suspend/Resume yönetimi ekle.

3. `tap()` implementasyonu:
   - Kısa yüksek frekanslı "blip" (sin wave, 150ms, hızlı attack/decay).
   - Gating: `if (!SeyFx.isPremiumFxEnabled() || !data.settings.uiSounds) return;`

4. `success()` implementasyonu:
   - İki tonlu artan arpejio (örn. 523Hz → 784Hz, 200ms).
   - Gating aynı.

5. `warning()` implementasyonu:
   - Düşük frekanslı kısa buzz (örn. 200Hz saw, 250ms).
   - Gating aynı.

6. `bell()` implementasyonu:
   - Yumuşak zil/kutu sesi (örn. 880Hz sine + hafif vibrato, 600ms).
   - Gating aynı.

7. Tüm sesler `prefers-reduced-motion: reduce` varsa sessiz olmalı (erişilebilirlik).

8. `node --check app/core/mediaFx.js`.

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

- `.anti-amnesia/LEDGER.md`’e satır ekle (seq 25):
  ```markdown
  | 25 | 2026-08-31 | GitHub Copilot | FX-P-11 | ✅ TAMAMLANDI | <yerel commit> | S5 geçti | SeyAudio temel UI sesleri implemente edildi. |
  ```
- `.anti-amnesia/CURRENT-STATE.md` güncelle: `currentPhase: "Faz 1"`, sıradaki `FX-P-12`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-11"`, `currentPhase: "Faz 1"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-11 Faz 1 SeyAudio tap/success/warning/bell implementasyonu"
```

**Push yapma.**

## Rollback

```bash
git checkout -- app/core/mediaFx.js
git reset HEAD~1
```

## Handoff Notu

FX-P-12 mevcut `zikrTickSound` çağrı noktasını `SeyAudio.tap()` kullanacak şekilde yönlendirecek. Bu ilk `app.js` değişikliği olacak; I2/I3/I4 korunmalı.
