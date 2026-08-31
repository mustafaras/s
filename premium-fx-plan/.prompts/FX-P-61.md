---
code: FX-P-61
name: Settings master switch ve UI
phase: Faz 6
agent: integration
prerequisites:
  - FX-P-54 tamamlandi
  - Branch: premium-fx-local
input_files:
  - /Users/m_ras/Desktop/seyma/app.js
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/API-TRANSITION-GUIDE.md §3
output_files:
  - /Users/m_ras/Desktop/seyma/app.js
forbidden:
  - data/settings seklini degistirme (sadece mevcut alanlari UI'ya ac)
  - migrate() degistirme
  - App.* yuzeyini degistirme
  - git push / PR / deploy
---

# FX-P-61 · Settings master switch ve UI

## Amac

Ayarlar ekranina "Premium Atmosfer" master switch ve alt seceneklerini (ses, haptic, zaman temasi, sesli rehberlik, ambiyans) ekle. Ayarlar `data.settings` icindeki mevcut alanlara bagli kalacak.

## Girdi

- `app.js` icerisindeki ayarlar render fonksiyonu
- API-TRANSITION-GUIDE.md §3

## Adimlar

1. **FX-PROMPT-STATE.json guncelle:** `activePrompt: "FX-P-61"`.

2. **Ayarlar render fonksiyonunu bul:** `ayarlarHTML()` veya benzeri ayarlar sekmesi render fonksiyonunu bul.

3. **Master switch ekle:**
   - `settings.premiumAtmosphere` icin toggle.
   - HTML ornegi:
     ```html
     <label class="setting-row">
       <span>✨ Premium Atmosfer</span>
       <button type="button" class="sey-toggle" data-on="1" onclick="App.toggleSetting('premiumAtmosphere')">Açık</button>
     </label>
     ```

4. **Alt secenekler (gating):**
   - `uiSounds`, `richHaptics`, `launchRitual`, `voiceGuidance`, `ambientSounds` icin satirlar ekle.
   - Bu secenekler sadece `data.settings.premiumAtmosphere === true` oldugunda etkin gorunur; kapalıysa gostersin ama disabled veya not-allowed style ile belirtilsin.

5. **`App.toggleSetting(key)` varsa genislet:**
   - Eger key premium atmosfer alanlarindan biri ise boolean flip yap, `save()` cagir, `render()` cagir.
   - `premiumAtmosphere` kapatildiginda diger FX'ler otomatik olarak sessiz/kitlenmis olur (gating zaten mediaFx/timeTheme icinde).

6. **Türkce kopya:**
   - "Premium Atmosfer", "Arayüz sesleri", "Dokunmatik geribildirim", "Açılış ritüeli", "Sesli rehberlik", "Ambiyans sesleri".

7. **Syntax check:**
   ```bash
   node --check app.js
   ```

## Test / Kanit

```bash
cd /Users/m_ras/Desktop/seyma
node --check app.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_faz10_sync.js
node tests/app/test_modularization_boundary.js
```

## S6 Degismezlik Kaniti

```bash
grep -o 'App\.[a-zA-Z0-9_]*\s*=' app.js | sort -u | wc -l
grep -o 'onclick="App\.[a-zA-Z0-9_]*' app.js | sort | uniq -c
grep -c 'src="app.js' index.html
```

## Anti-Amnesi Guncellemesi

- `.anti-amnesia/LEDGER.md`'e satir ekle:
  ```markdown
  | FX-P-61 | 2026-08-31 | GitHub Copilot | settings master switch UI | ✅ TAMAMLANDI | <yerel commit> | S5/S6 gecti | Premium atmosfer ve alt secenekler ayarlar ekranina eklendi; App.* yuzeyi korundu. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: "Devam Eden" → `FX-P-62`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-61"`, `currentPhase: "Faz 6"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-61 Faz 6 premium atmosfer ayar switchleri"
```

**Push yapma.**

## Rollback

```bash
git checkout -- app.js
```

## Handoff Notu

FX-P-62: Ayarlar persistence ve gating test fixture’lari.
