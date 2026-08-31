---
code: FX-P-68
name: Final settings panel audit ve master switch cascade end-to-end test
phase: Faz 6
agent: QA lead
prerequisites:
  - FX-P-67 tamamlandı
  - Branch: premium-fx-local
  - Tüm Faz 6 ayarlar, launch ritual ve panel senkronizasyonu tamamlanmış
input_files:
  - /Users/m_ras/Desktop/seyma/app.js
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
  - /Users/m_ras/Desktop/seyma/app/core/timeTheme.js
  - /Users/m_ras/Desktop/seyma/panel.html
  - /Users/m_ras/Desktop/seyma/panel/panel.js
  - /Users/m_ras/Desktop/seyma/index.html
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/REVIEW-CHECKLIST.md
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/SAFEGUARDS.md
output_files:
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/REVIEW-CHECKLIST.md
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/SAFEGUARDS.md
forbidden:
  - app.js davranışını değiştirme
  - data/settings şeklini değiştirme
  - index.html'den app.js tag'ini kaldırma
  - git push / PR / deploy
---

# FX-P-68 · Final settings panel audit ve master switch cascade E2E test

## Amaç

Dalga 6'nın son denetimini yap: master switch `premiumAtmosphere` kapalıyken haptics, ses, animasyon, ambient, voice, launch ritual ve time theme'in tamamen susturulduğunu; açıkken her birinin kendi alt ayarına göre aktifleştiğini uçtan uca doğrula.

## Girdi

- `app.js` ayarlar UI ve toggle handler'ları
- `mediaFx.js` gating fonksiyonları (`SeyFx.isPremiumFxEnabled`, `SeyAudio.isSoundAllowed`, `SeyAudio.isVoiceEnabled`, `SeyAudio.ambient.isEnabled`)
- `timeTheme.js` apply/quiet-time fonksiyonları
- `panel.html` + `panel/panel.js` premium durum badge'i

## Adımlar

1. **FX-PROMPT-STATE.json güncelle:** `activePrompt: "FX-P-68"`.

2. **Master switch cascade matrisi oluştur:**
   ```markdown
   | premiumAtmosphere | uiSounds | richHaptics | voiceGuidance | ambientSounds | launchRitual | Beklenen |
   |-------------------|----------|-------------|---------------|---------------|--------------|----------|
   | false             | any      | any         | any           | any           | any          | Tüm FX sessiz |
   | true              | false    | true        | true          | true          | true         | Ses hariç FX çalışır |
   | true              | true     | false       | true          | true          | true         | Haptic hariç FX çalışır |
   | true              | true     | true        | false         | true          | true         | Voice hariç FX çalışır |
   | true              | true     | true        | true          | false         | true         | Ambient hariç FX çalışır |
   | true              | true     | true        | true          | true          | false        | Launch ritual gösterilmez |
   ```

3. **End-to-end test fixture oluştur:**
   - `tests/app/test_premium_master_cascade.js` dosyası oluştur.
   - `vm` ile `constants.js`, `state.js`, `mediaFx.js`, `timeTheme.js` yükle.
   - Yukarıdaki matrisin her satırı için gating fonksiyonlarının sonuçlarını doğrula.
   - `window.SeyTimeTheme.apply()` mock `document.getElementById` ile class değişimini doğrula.
   - Quiet-time (23:00-07:00) için voice ve ambient'in `false` döndüğünü doğrula.

4. **Panel E2E kontrol:**
   - `panel.js` içindeki `renderTimeBadge()` ve premium ayar özetinin bozulmadığını doğrula.
   - `panel.html` script tag sırasını ve `panel.js` tag varlığını kontrol et.

5. **`REVIEW-CHECKLIST.md` Faz 6 final satırlarını işaretle/güncelle:**
   ```markdown
   - [x] Premium Atmosfer master switch UI uygulandı
   - [x] A/B premium toggle experiment UI uygulandı
   - [x] Launch ritual splash sequence uygulandı
   - [x] Settings persistence ve gating testleri PASS
   - [x] Reduced-motion ve accessibility uyumu uygulandı
   - [x] Panel senkronizasyonu güncellendi
   - [x] Master switch cascade end-to-end test PASS
   - [x] Full regression suite PASS
   ```

6. **`SAFEGUARDS.md` son kontrol:**
   - `LOCAL-ONLY` kuralı geçerli mi?
   - `S6` data/migrate/save değişmezliği korunmuş mu?
   - `index.html` script tag sırası bozulmamış mı?
   - Eksik varsa seq satırı ekle.

7. **Final full regression suite çalıştır.**

8. **Syntax check:**
   ```bash
   node --check app.js
   node --check app/core/mediaFx.js
   node --check app/core/timeTheme.js
   node --check panel/panel.js
   ```

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check app.js
node --check app/core/mediaFx.js
node --check app/core/timeTheme.js
node --check panel/panel.js
node tests/app/test_premium_master_cascade.js
node tests/app/test_premium_settings.js
node tests/app/test_premium_voice.js
node tests/app/test_premium_fx_utils.js
node tests/app/test_premium_time_theme.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_faz10_sync.js
node tests/panel/test_faz11_panel.js
node tests/panel/test_panel_p1_projection.js
node tests/panel/test_panel_p3_root_modules.js
for f in tests/panel-v2/test_panel_v2_*.js; do node "$f" || echo "FAIL: $f"; done
```

## S6 Değişmezlik Kanıtı

```bash
grep -o 'App\.[a-zA-Z0-9_]*\s*=' app.js | sort -u | wc -l
grep -o 'onclick="App\.[a-zA-Z0-9_]*' app.js | sort | uniq -c
grep -c 'src="app.js' index.html
node tests/app/test_modularization_boundary.js
```

## Anti-Amnesi Güncellemesi

- `.anti-amnesia/LEDGER.md`’e satır ekle:
  ```markdown
  | FX-P-68 | 2026-08-31 | GitHub Copilot | master switch cascade E2E | ✅ TAMAMLANDI | <yerel commit> | S5/S6 geçti | Dalga 6 Settings tamamlandı; master switch cascade end-to-end testi geçti; REVIEW-CHECKLIST/SAFEGUARDS güncellendi. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: `currentPhase: "Faz 6 tamamlandı"`, `lastCompletedFaz: "Faz 6"`, sıradaki `Dalga 7 / FX-P-71` (ayrı onay bekleniyor).
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-68"`, `currentPhase: "Faz 6 tamamlandı"`.
- `NEXT-STEPS.md` güncelle: Faz 6 tamamlandı, Dalga 7 (Closure) için kullanıcı onayı bekleniyor.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-68 Faz 6 master switch cascade E2E ve final audit"
```

**Push yapma.**

## Rollback

```bash
git checkout -- tests/app/test_premium_master_cascade.js premium-fx-plan/REVIEW-CHECKLIST.md premium-fx-plan/SAFEGUARDS.md
```

## Handoff Notu

Dalga 7 Closure başlar: FX-P-71 `cross-wave integration smoke test`.
