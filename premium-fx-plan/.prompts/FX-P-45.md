---
code: FX-P-45
name: Quiet-time guard entegrasyonu - gece sessizlik kurali
phase: Faz 4
agent: time theme uzmani
prerequisites:
  - FX-P-44 tamamlandi
  - Branch: premium-fx-local
  - SeyTimeTheme.classForHour() ve apply() tamamlanmış
input_files:
  - /Users/m_ras/Desktop/seyma/app/core/timeTheme.js
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/SAFEGUARDS.md
output_files:
  - /Users/m_ras/Desktop/seyma/app/core/timeTheme.js
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
forbidden:
  - app.js degistirme
  - data/settings seklini degistirme
  - git push / PR / deploy
---

# FX-P-45 · Quiet-time guard entegrasyonu

## Amac

Gece 23:00 - 07:00 arasinda sesli rehberlik, ambiyans sesleri ve kutlama seslerinin otomatik olarak susturuldugu `SeyTimeTheme.isQuietTime(h)` kuralini merkezi gating'e bagla.

## Girdi

- `timeTheme.js` saat fonksiyonlari
- `mediaFx.js` ses ve ambiyans motoru
- `SAFEGUARDS.md` quiet-time kurali

## Adimlar

1. **FX-PROMPT-STATE.json guncelle:** `activePrompt: "FX-P-45"`.

2. **`isQuietTime(h)` implemente et:**
   ```js
   function isQuietTime(h){
     if (h == null) h = new Date().getHours();
     return h >= 23 || h < 7;
   }
   ```

3. **`window.SeyTimeTheme` expose guncelle:**
   ```js
   window.SeyTimeTheme = {
     classForHour: classForHour,
     apply: apply,
     seasonalClass: seasonalClass,
     applySeasonal: applySeasonal,
     isQuietTime: isQuietTime
   };
   ```

4. **Sesli rehberlik gating'i quiet-time ile birlestir:**
   - `mediaFx.js` icinde `SeyAudio.isVoiceEnabled()` veya `isSoundAllowed()` fonksiyonunu guncelle: quiet-time true oldugunda false donsun.
   - `SeyAudio.voice()` en ustte quiet-time check yapsin ve `false` donsun.

5. **Ambiyans gating'i quiet-time ile birlestir:**
   - `SeyAudio.ambient.start()` quiet-time icerisindeyse `false` donsun.

6. **Haptics quiet-time'dan muaf tut:**
   - Haptics gece susturulmaz; reduced-motion'a tabi olmaya devam eder.

7. **Test fixture guncelle:**
   - `tests/app/test_premium_time_theme.js` icerisine `isQuietTime` testleri ekle.
   - `tests/app/test_premium_voice.js` icerisine quiet-time'da `SeyAudio.voice` false, gunduz true testleri ekle.

8. **Syntax check:**
   ```bash
   node --check app/core/timeTheme.js
   node --check app/core/mediaFx.js
   ```

## Test / Kanit

```bash
cd /Users/m_ras/Desktop/seyma
node --check app/core/timeTheme.js
node --check app/core/mediaFx.js
node tests/app/test_premium_time_theme.js
node tests/app/test_premium_voice.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_faz10_sync.js
```

## Anti-Amnesi Guncellemesi

- `.anti-amnesia/LEDGER.md`'e satir ekle:
  ```markdown
  | FX-P-45 | 2026-08-31 | GitHub Copilot | quiet-time guard | ✅ TAMAMLANDI | <yerel commit> | S5 gecti | isQuietTime() eklendi; voice/ambient gating gece susturuluyor; haptics muaf. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: "Devam Eden" → `FX-P-46`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-45"`, `currentPhase: "Faz 4"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-45 Faz 4 quiet-time guard entegrasyonu"
```

**Push yapma.**

## Rollback

```bash
git checkout -- app/core/timeTheme.js app/core/mediaFx.js
```

## Handoff Notu

FX-P-46: Zaman/mevsim teması CSS değişkenleri binding.
