---
code: FX-P-53
name: Ambiyans sesleri - yagmur dalga nakar
phase: Faz 5
agent: audio uzmanı
prerequisites:
  - FX-P-52 tamamlandi
  - Branch: premium-fx-local
input_files:
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
  - /Users/m_ras/Desktop/seyma/app/styles.css
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/FX-LIBRARY.md
output_files:
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
  - /Users/m_ras/Desktop/seyma/app/styles.css
forbidden:
  - app.js degistirme
  - data/settings seklini degistirme
  - git push / PR / deploy
---

# FX-P-53 · Ambiyans sesleri

## Amac

Dusuk bantli, saf HTML5 Audio ile calisan ambiyans ses motoru ekle. Yağmur, dalga, ney/nakar gibi sesler için UI kontrolleri tanımla; harici dosya gerektirmeyen minimal osilatör fall-back kullan.

## Girdi

- `mediaFx.js`
- `FX-LIBRARY.md` ambiyans sesleri tanımı

## Adımlar

1. **FX-PROMPT-STATE.json güncelle:** `activePrompt: "FX-P-53"`.

2. **`SeyAudio.ambient` API iskeleti:**
   ```js
   ambient: {
     _ctx: null,
     _nodes: [],
     _playing: false,
     _type: null,
     isSupported: function(){ return !!(window.AudioContext || window.webkitAudioContext); },
     isEnabled: function(){ return settings() && settings().ambientSounds === true && window.SeyAudio.ambient.isSupported(); },
     start: function(type){
       if (!isPremiumFxEnabled() || !this.isEnabled()) return false;
       if (this._playing && this._type === type) return true;
       this.stop();
       this._type = type;
       this._playing = true;
       return true;
     },
     stop: function(){
       this._playing = false;
       this._type = null;
       return true;
     }
   }
   ```

3. **HTML5 Audio fall-back:**
   - Eğer `AudioContext` yoksa `<audio>` elementi oluştur; loop/ volume/ preload attribute’lerini ayarla.
   - URL yoksa osilatör tabanlı minimal ses üret (yalnızca Web Audio API destekliyorsa).

4. **Ambiyans UI butonları için CSS:**
   - `.ambient-control` sınıfı; koyu tema ve hover durumları.

5. **Gating:**
   - `premiumAtmosphere=true`, `ambientSounds=true`, ve quiet-time dışında çalışsın.
   - Eğer kullanıcı diğer sesli rehberlik çalışıyorsa ambiyans susturulsun.

6. **Syntax check:**
   ```bash
   node --check app/core/mediaFx.js
   ```

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check app/core/mediaFx.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_modularization_boundary.js
```

## Anti-Amnesi Güncellemesi

- `.anti-amnesia/LEDGER.md`’e satır ekle:
  ```markdown
  | FX-P-53 | 2026-08-31 | GitHub Copilot | ambiyans ses motoru | ✅ TAMAMLANDI | <yerel commit> | S5 gecti | SeyAudio.ambient API eklendi; gating ve quiet-time destekli. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: "Devam Eden" → `FX-P-54`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-53"`, `currentPhase: "Faz 5"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-53 Faz 5 ambiyans ses motoru iskeleti"
```

**Push yapma.**

## Rollback

```bash
git checkout -- app/core/mediaFx.js app/styles.css
```

## Handoff Notu

FX-P-54: Voice test fixture’ları ve Faz 5 kapanış.
