---
code: FX-P-64
name: Panel ve Panel-v2 senkronizasyonu
phase: Faz 6
agent: panel integration
prerequisites:
  - FX-P-63 tamamlandi
  - Branch: premium-fx-local
input_files:
  - /Users/m_ras/Desktop/seyma/panel.html
  - /Users/m_ras/Desktop/seyma/panel/panel.js
  - /Users/m_ras/Desktop/seyma/panel/v2/panel-v2.js
  - /Users/m_ras/Desktop/seyma/panel/v2/panel-v2.css
output_files:
  - /Users/m_ras/Desktop/seyma/panel.html
  - /Users/m_ras/Desktop/seyma/panel/panel.js
forbidden:
  - app.js degistirme
  - data/settings seklini degistirme
  - git push / PR / deploy
---

# FX-P-64 · Panel ve Panel-v2 senkronizasyonu

## Amac

Observer paneli icin premium atmosfer ayarlarini okuyabilen, yeni FX durumlarini gosteren (veya en azindan bozmayan) minimal guncellemeler ekle. Panel-v2'yi degistirme; mevcut panel uzerinde calis.

## Girdi

- `panel.html`
- `panel/panel.js`
- `panelCoverageManifest.js` (var olan redaksiyon kurallari)

## Adimlar

1. **FX-PROMPT-STATE.json guncelle:** `activePrompt: "FX-P-64"`.

2. **Panel settings summary guncelle:**
   - Eger panel'de `data.settings` ozeti varsa `premiumAtmosphere`, `uiSounds`, `voiceGuidance`, `ambientSounds` alanlarini goster.
   - Degerleri boolean olarak yaz; secret/profile/medya verisi sizdirmadan.

3. **Redaksiyon kontrolu:**
   - `panelCoverageManifest.js` icindeki alan listesine yeni `settings` alanlarini ekle, boylece `data/observer-snapshot.json` uretiminde bu alanlar redakte edilir veya izin verilir.
   - Hedef: panel observer yalnizca ayar switch'lerini gorebilir; icerikler (or. `ghToken`, profil detaylari) hala redakte kalmali.

4. **Panel durum karti ekle (opsiyonel):**
   - "Premium Atmosfer" durum karti: acik/kapali.
   - "Son FX etkinligi" (or. son sesli rehberlik mesaji veya ambiyans tipi) — sadece uygulamadan panelin gorebilecegi alanlar.

5. **Panel-v2 dokunma:**
   - Panel-v2 ayrı bir premium yuzey; sadece `panel-v2.html` script tag sirasinin bozulmadigini dogrula. Kod degistirme.

6. **Syntax check:**
   ```bash
   node --check panel/panel.js
   ```

## Test / Kanit

```bash
cd /Users/m_ras/Desktop/seyma
node --check panel/panel.js
node tests/panel/test_faz11_panel.js
node tests/panel/test_panel_p1_projection.js
node tests/panel/test_panel_p3_root_modules.js
node tests/panel/test_panel_p4_provenance.js
for f in tests/panel-v2/test_panel_v2_*.js; do node "$f" || echo "FAIL: $f"; done
```

## Anti-Amnesi Guncellemesi

- `.anti-amnesia/LEDGER.md`'e satir ekle:
  ```markdown
  | FX-P-64 | 2026-08-31 | GitHub Copilot | panel senkronizasyonu | ✅ TAMAMLANDI | <yerel commit> | S5 gecti | Panel settings summary guncellendi; redaksiyon manifestine yeni alanlar eklendi; panel-v2 dokunulmadi. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: "Devam Eden" → `FX-P-65`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-64"`, `currentPhase: "Faz 6"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-64 Faz 6 panel premium atmosfer senkronizasyonu"
```

**Push yapma.**

## Rollback

```bash
git checkout -- panel.html panel/panel.js panel/panelCoverageManifest.js
```

## Handoff Notu

FX-P-65: Full regression testleri ve Faz 6 kapanis.
