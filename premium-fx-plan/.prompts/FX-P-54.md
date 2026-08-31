---
code: FX-P-54
name: Voice guidance test fixturelari ve Faz 5 kapanis
phase: Faz 5
agent: test uzmani
prerequisites:
  - FX-P-53 tamamlandi
  - Branch: premium-fx-local
input_files:
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
  - /Users/m_ras/Desktop/seyma/app.js
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/deliverables/REVIEW-CHECKLIST.md
output_files:
  - /Users/m_ras/Desktop/seyma/tests/app/test_premium_voice.js
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/deliverables/REVIEW-CHECKLIST.md
forbidden:
  - app.js davranisini degistirme
  - index.html'den app.js tag'ini kaldirmak
  - git push / PR / deploy
---

# FX-P-54 · Voice guidance test fixture’ları ve Faz 5 kapanış

## Amaç

Dalga 5 kapanışı. `SeyAudio.voice`, `isVoiceEnabled`, `isQuietTime` ve ambient gating’ini headless VM testiyle doğrula; kapsam raporu güncelle.

## Girdi

- `mediaFx.js`
- `app.js` içindeki `SeyAudio.voice` çağrı noktaları
- `REVIEW-CHECKLIST.md`

## Adımlar

1. **FX-PROMPT-STATE.json güncelle:** `activePrompt: "FX-P-54"`.

2. **`tests/app/test_premium_voice.js` oluştur:**
   - `vm` ile `constants.js`, `state.js`, `mediaFx.js` yükle.
   - `speechSynthesis` mock’u tanımla: `speaking`, `cancel()`, `speak(utterance)`, `getVoices()`.
   - `SeyAudio.isVoiceEnabled()` false döndürürken `SeyAudio.voice`’un `false` döndüğünü doğrula.
   - `voiceGuidance=true` ve `speechSynthesis` varsa `SeyAudio.voice('test')`’in `true` döndüğünü doğrula.
   - `isQuietTime(23)` true, `isQuietTime(10)` false doğrula.
   - `SeyAudio.ambient.isEnabled()` gating doğrula: `premiumAtmosphere=true` + `ambientSounds=true` + `AudioContext` var → true.
   - `app.js` içindeki `SeyAudio.voice` çağrılarının sayısını ve argümanlarını statik doğrula (en az onboarding, streak, zikir noktaları).

3. **`REVIEW-CHECKLIST.md` güncelle:**
   ```markdown
   - [x] SeyAudio.voice API uygulandı
   - [x] Sesli rehberlik uygulama noktalarına entegre edildi
   - [x] Ambiyans ses motoru iskeleti uygulandı
   - [x] Voice guidance test fixture PASS
   ```

4. **Syntax check ve testler.**

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check tests/app/test_premium_voice.js
node tests/app/test_premium_voice.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_faz10_sync.js
for f in tests/panel-v2/test_panel_v2_*.js; do node "$f" || echo "FAIL: $f"; done
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
  | FX-P-54 | 2026-08-31 | GitHub Copilot | voice test + Faz 5 kapanis | ✅ TAMAMLANDI | <yerel commit> | S5/S6 gecti | Dalga 5 Voice guidance tamamlandi; SeyAudio gating ve entegrasyon test edildi. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: `currentPhase: "Faz 5 tamamlandı"`, `lastCompletedFaz: "Faz 5"`, sıradaki `Dalga 6 / FX-P-61` (ayrı onay bekleniyor).
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-54"`, `currentPhase: "Faz 5 tamamlandı"`.
- `NEXT-STEPS.md` güncelle: Faz 5 tamamlandı, Dalga 6 (Settings & master switch) için kullanıcı onayı bekleniyor.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-54 Faz 5 voice guidance test fixture ve kapsam raporu"
```

**Push yapma.**

## Rollback

```bash
git checkout -- tests/app/test_premium_voice.js premium-fx-plan/deliverables/REVIEW-CHECKLIST.md
```

## Handoff Notu

Dalga 6 Settings başlar: FX-P-61 `settings.premiumAtmosphere` master switch.
