---
code: FX-P-51
name: Sesli rehberlik API iskeleti SeyAudio.voice()
phase: Faz 5
agent: audio uzmanı
prerequisites:
  - FX-P-44 tamamlandi
  - Branch: premium-fx-local
input_files:
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/API-TRANSITION-GUIDE.md §2.3
output_files:
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
forbidden:
  - app.js degistirme
  - data/settings seklini degistirme
  - git push / PR / deploy
---

# FX-P-51 · Sesli rehberlik API iskeleti SeyAudio.voice()

## Amac

Metin tabanli sesli rehberlik API'sini `SeyAudio.voice(text, opts)` olarak implemente et; Web Speech API veya tts fallback secenekleriyle.

## Girdi

- Mevcut `mediaFx.js` iskeleti
- `API-TRANSITION-GUIDE.md` §2.3

## Adimlar

1. **FX-PROMPT-STATE.json guncelle:** `activePrompt: "FX-P-51"`.

2. **`SeyAudio.voice(text, opts)` implemente et:**
   ```js
   voice: function(text, opts){
     opts = opts || {};
     if (!isPremiumFxEnabled() || !window.SeyAudio.isVoiceEnabled()) return false;
     if (typeof window.speechSynthesis === 'undefined' || !window.speechSynthesis) return false;
     if (window.speechSynthesis.speaking){
       if (!opts.force) return false;
       try { window.speechSynthesis.cancel(); } catch(e){}
     }
     var u = new SpeechSynthesisUtterance(text);
     var voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
     if (opts.lang) u.lang = opts.lang;
     if (opts.rate) u.rate = clamp(opts.rate, 0.5, 2);
     if (opts.pitch) u.pitch = clamp(opts.pitch, 0.5, 2);
     if (Array.isArray(opts.voiceNames) && voices.length){
       var preferred = voices.find(function(v){ return opts.voiceNames.indexOf(v.name) >= 0 || opts.voiceNames.indexOf(v.lang) >= 0; });
       if (preferred) u.voice = preferred;
     }
     try {
       window.speechSynthesis.speak(u);
       return true;
     } catch(e){
       return false;
     }
   }
   ```

3. **`SeyAudio.isVoiceEnabled()` implemente et:**
   ```js
   isVoiceEnabled: function(){
     return !!(settings() && settings().voiceGuidance && typeof window.speechSynthesis !== 'undefined' && window.speechSynthesis);
   }
   ```

4. **`clamp` helpers:**
   - Eger `mediaFx.js` icinde `clamp` yoksa ekle:
   ```js
   function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }
   ```

5. **Fallback / no-op durumu:**
   - `speechSynthesis` yoksa fonksiyonlar hicbir sey yapmadan `false` donsun.

6. **Syntax check:**
   ```bash
   node --check app/core/mediaFx.js
   ```

## Test / Kanit

```bash
cd /Users/m_ras/Desktop/seyma
node --check app/core/mediaFx.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_modularization_boundary.js
```

## Anti-Amnesi Guncellemesi

- `.anti-amnesia/LEDGER.md`'e satir ekle:
  ```markdown
  | FX-P-51 | 2026-08-31 | GitHub Copilot | sesli rehberlik API iskeleti | ✅ TAMAMLANDI | <yerel commit> | S5 gecti | SeyAudio.voice() + isVoiceEnabled() eklendi; Speech API gating var. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: "Devam Eden" → `FX-P-52`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-51"`, `currentPhase: "Faz 5"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-51 Faz 5 sesli rehberlik API iskeleti"
```

**Push yapma.**

## Rollback

```bash
git checkout -- app/core/mediaFx.js
```

## Handoff Notu

FX-P-52: Sesli rehberlik entegrasyon noktalari.
