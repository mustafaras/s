---
code: FX-P-62
name: Ayarlar persistence ve gating test fixturelari
phase: Faz 6
agent: test uzmani
prerequisites:
  - FX-P-61 tamamlandi
  - Branch: premium-fx-local
input_files:
  - /Users/m_ras/Desktop/seyma/app.js
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
  - /Users/m_ras/Desktop/seyma/app/core/timeTheme.js
output_files:
  - /Users/m_ras/Desktop/seyma/tests/app/test_premium_settings.js
forbidden:
  - app.js davranisini degistirme
  - data/settings seklini degistirme
  - git push / PR / deploy
---

# FX-P-62 · Ayarlar persistence ve gating test fixture’ları

## Amaç

Ayarlar UI ve FX gating arasındaki bağlantıyı doğrula. `premiumAtmosphere` kapatıldığında tüm FX motorlarının kapalı olduğunu headless test et.

## Girdi

- `app.js` settings render ve toggle handler
- `mediaFx.js` gating fonksiyonları
- `timeTheme.js`

## Adımlar

1. **FX-PROMPT-STATE.json güncelle:** `activePrompt: "FX-P-62"`.

2. **`tests/app/test_premium_settings.js` oluştur:**
   - `vm` ile `constants.js`, `state.js`, `mediaFx.js`, `timeTheme.js` yükle.
   - `SeyFx.isPremiumFxEnabled({ premiumAtmosphere: true })` → true.
   - `SeyFx.isPremiumFxEnabled({ premiumAtmosphere: false })` → false.
   - `SeyFx.isPremiumFxEnabled({ premiumAtmosphere: true, reducedMotion: true })` → false.
   - `SeyAudio.isSoundEnabled({ uiSounds: true })` → true; `{ uiSounds: false }` → false.
   - `SeyAudio.isVoiceEnabled({ voiceGuidance: true })` ve Speech desteği varsa true; yoksa false.
   - `SeyTimeTheme` varlığını ve `classForHour` sonuçlarını doğrula.
   - `app.js` içindeki `App.toggleSetting` çağrılarını ve `premiumAtmosphere` geçişini statik doğrula (varsa).

3. **Persistence simülasyonu (opsiyonel):**
   - Mock localStorage’e yazıp `save()` sonrası veriyi okuyarak `data.settings.premiumAtmosphere` değişimini doğrula.

4. **Syntax check ve testler.**

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check tests/app/test_premium_settings.js
node tests/app/test_premium_settings.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_faz10_sync.js
```

## Anti-Amnesi Güncellemesi

- `.anti-amnesia/LEDGER.md`’e satır ekle:
  ```markdown
  | FX-P-62 | 2026-08-31 | GitHub Copilot | settings persistence/gating test | ✅ TAMAMLANDI | <yerel commit> | S5 gecti | Premium atmosfer kapalıyken tum FX gating false; test fixture gecti. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: "Devam Eden" → `FX-P-63`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-62"`, `currentPhase: "Faz 6"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-62 Faz 6 ayarlar persistence ve gating testi"
```

**Push yapma.**

## Rollback

```bash
git checkout -- tests/app/test_premium_settings.js
```

## Handoff Notu

FX-P-63: Reduced-motion ve accessibility uyumu.
