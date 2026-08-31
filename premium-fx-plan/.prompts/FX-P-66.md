---
code: FX-P-66
name: A/B premium toggle experiment UI
phase: Faz 6
agent: integration
prerequisites:
  - FX-P-65 tamamlandı
  - Branch: premium-fx-local
  - Premium atmosfer master switch ve alt ayarlar tamamlanmış
input_files:
  - /Users/m_ras/Desktop/seyma/app.js
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/SAFEGUARDS.md
output_files:
  - /Users/m_ras/Desktop/seyma/app.js
forbidden:
  - App.* yüzeyini değiştirme
  - data/settings şeklini değiştirme (sadece mevcut alanlara yaz)
  - migrate() davranışını değiştirme
  - git push / PR / deploy
---

# FX-P-66 · A/B premium toggle experiment UI

## Amaç

Ayarlar ekranına yumuşak bir “Premium Atmosfer” deneyimi sunan A/B tarzı toggle UI ekle: kullanıcı açınca hoş bir kopya, kapatınca sade ve minimal bir açıklama; her iki durumda da ayar mevcut `data.settings.premiumAtmosphere` alanına yazılır.

## Girdi

- `app.js` ayarlar render fonksiyonu
- `SAFEGUARDS.md` local-only ve data-shape değişmezlik kuralları

## Adımlar

1. **FX-PROMPT-STATE.json güncelle:** `activePrompt: "FX-P-66"`.

2. **Mevcut toggle’ı zenginleştir:**
   - Açıkken:
     ```html
     <div class="setting-row setting-featured">
       <div>
         <span>✨ Premium Atmosfer</span>
         <small class="setting-hint">Ses, haptic, zaman teması ve sesli rehberlik açık</small>
       </div>
       <button type="button" class="sey-toggle sey-toggle-on" onclick="App.toggleSetting('premiumAtmosphere')">Açık</button>
     </div>
     ```
   - Kapalıyken:
     ```html
     <div class="setting-row">
       <div>
         <span>✨ Premium Atmosfer</span>
         <small class="setting-hint">Deneyimi açarak ses, haptic ve görsel efektleri keşfet</small>
       </div>
       <button type="button" class="sey-toggle" onclick="App.toggleSetting('premiumAtmosphere')">Kapalı</button>
     </div>
     ```

3. **Alt seçeneklerin görünürlüğünü güncelle:**
   - `premiumAtmosphere === true` iken alt ayarlar (uiSounds, richHaptics, voiceGuidance, ambientSounds, launchRitual) normal görünür.
   - `premiumAtmosphere === false` iken alt seçenekler gri/opak görünür ama HTML içinde kalır; kullanıcı master açınca hemen etkinleşir.

4. **CSS için featured/hint stili ekle:**
   ```css
   .setting-featured { background: rgba(250, 204, 21, 0.08); border-radius: 12px; }
   .setting-hint { display: block; color: var(--muted); font-size: 12px; margin-top: 2px; }
   ```

5. **A/B kopya yoklaması (opsiyonel):**
   - Kapalı durumda iki farklı kopya denemek istersen `data.settings.premiumFxCopyVariant = 'A'` veya `'B'` kullan; UI buna göre farklı hint göster.
   - Default `'A'` olsun; migrate ile backfill edilir (yeni alan, mevcut settings nesnesine eklenir).

6. **Syntax check:**
   ```bash
   node --check app.js
   ```

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check app.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_premium_settings.js
node tests/app/test_faz10_sync.js
```

Ek kanıt:
```bash
grep -n 'premiumAtmosphere' app.js | head -20
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
  | FX-P-66 | 2026-08-31 | GitHub Copilot | A/B premium toggle experiment UI | ✅ TAMAMLANDI | <yerel commit> | S5/S6 geçti | Premium Atmosfer toggle UI zenginleştirildi; alt ayarlar açık/kapalı duruma göre vurgulanıyor. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: "Devam Eden" → `FX-P-67`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-66"`, `currentPhase: "Faz 6"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-66 Faz 6 A/B premium toggle experiment UI"
```

**Push yapma.**

## Rollback

```bash
git checkout -- app.js
```

## Handoff Notu

FX-P-67: Launch ritual splash sequence, sound, animation.
