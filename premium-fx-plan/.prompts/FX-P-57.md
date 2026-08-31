---
code: FX-P-57
name: Sesli rehberlik ayarlari - dil ve konusma hizi
phase: Faz 5
agent: integration
prerequisites:
  - FX-P-56 tamamlandı
  - Branch: premium-fx-local
  - SeyAudio.voice() ve greeting() tamamlanmış
input_files:
  - /Users/m_ras/Desktop/seyma/app.js
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
output_files:
  - /Users/m_ras/Desktop/seyma/app.js
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
forbidden:
  - App.* yüzeyini değiştirme
  - data/settings seklini değiştirme (sadece mevcut settings alanlarını UI'ya aç)
  - git push / PR / deploy
---

# FX-P-57 · Sesli rehberlik ayarları

## Amaç

Ayarlar ekranına sesli rehberlik alt paneli ekle: aktif/pasif toggle, konuşma dili seçimi (`tr-TR`, `en-US`, `ar-SA`) ve konuşma hızı (0.75x - 1.5x). Değerler `data.settings` içindeki mevcut alanlara yazılacak.

## Girdi

- `app.js` ayarlar render fonksiyonu
- `mediaFx.js` `SeyAudio.voice()` rate/lang girdileri

## Adımlar

1. **FX-PROMPT-STATE.json güncelle:** `activePrompt: "FX-P-57"`.

2. **Settings alanlarını tanımla (varsayılan backfill):**
   - `settings.voiceGuidance` (boolean)
   - `settings.voiceLang` (string, default `'tr-TR'`)
   - `settings.voiceRate` (number, default `1`)
   - Bu alanlar zaten FX-P-51 sonrası `SeyAudio.isVoiceEnabled()` tarafından okunuyorsa doğrula; yoksa `migrate()`'e ekle.

3. **Ayarlar UI ekle:**
   ```html
   <div class="settings-group">
     <div class="setting-row">
       <span>🎙️ Sesli rehberlik</span>
       <button type="button" class="sey-toggle" onclick="App.toggleSetting('voiceGuidance')">Açık</button>
     </div>
     <div class="setting-row">
       <span>Dil</span>
       <select onchange="App.setVoiceLang(this.value)">
         <option value="tr-TR">Türkçe</option>
         <option value="en-US">English</option>
         <option value="ar-SA">العربية</option>
       </select>
     </div>
     <div class="setting-row">
       <span>Hız <span id="voice-rate-val">1.0x</span></span>
       <input type="range" min="0.75" max="1.5" step="0.25" value="1"
              oninput="App.setVoiceRate(this.value)" />
     </div>
   </div>
   ```

4. **Handler ekle/koru:**
   - `App.setVoiceLang(lang)`: `data.settings.voiceLang = lang; save(); render();`
   - `App.setVoiceRate(rate)`: `data.settings.voiceRate = clamp(rate, 0.75, 1.5); save(); render();`
   - `App.toggleSetting('voiceGuidance')` zaten varsa genişlet.

5. **`SeyAudio.voice()` ayarlardan okusun:**
   - Eğer `opts.lang` veya `opts.rate` verilmemişse `data.settings.voiceLang` / `data.settings.voiceRate` kullan.

6. **Türkçe kopya:** "Sesli rehberlik", "Dil", "Hız".

7. **Syntax check:**
   ```bash
   node --check app.js
   node --check app/core/mediaFx.js
   ```

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check app.js
node --check app/core/mediaFx.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_premium_voice.js
node tests/app/test_premium_settings.js
node tests/app/test_faz10_sync.js
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
  | FX-P-57 | 2026-08-31 | GitHub Copilot | sesli rehberlik ayarlari | ✅ TAMAMLANDI | <yerel commit> | S5/S6 geçti | voiceGuidance/lang/rate ayarları UI'ya açıldı; SeyAudio.voice() varsayılanları settings'den okuyor. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: "Devam Eden" → `FX-P-58`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-57"`, `currentPhase: "Faz 5"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-57 Faz 5 sesli rehberlik dil ve hiz ayarlari"
```

**Push yapma.**

## Rollback

```bash
git checkout -- app.js app/core/mediaFx.js
```

## Handoff Notu

FX-P-58: Voice guidance final audit ve FX-LIBRARY.md voice catalog güncellemesi.
