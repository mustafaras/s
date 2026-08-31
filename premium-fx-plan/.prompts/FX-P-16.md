---
code: FX-P-16
name: audio test fixturelarini guncelle ve kapsam raporu uret
phase: Faz 1
agent: test uzmanı
prerequisites:
  - FX-P-15 tamamlandı
  - Branch: premium-fx-local
input_files:
  - /Users/m_ras/Desktop/seyma/tests/app/test_premium_audio_fx.js
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
  - /Users/m_ras/Desktop/seyma/app.js
output_files:
  - /Users/m_ras/Desktop/seyma/tests/app/test_premium_audio_fx.js
  - /Users/m_ras/Desktop/seyma/tests/app/test_faz_minus11_boundary.js (guncelleme)
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/deliverables/REVIEW-CHECKLIST.md (guncelleme)
forbidden:
  - app.js davranışını değiştirme (sadece testleri doğrula)
  - index.html'den app.js tag'ini kaldırma
  - git push / PR / deploy
---

# FX-P-16 · audio test fixture’larını güncelle ve kapsam raporu üret

## Amaç

Dalga 1 kapanışı. Tüm `SeyAudio` yüzeyini (`tap`, `success`, `warning`, `bell`, `voice`, `ambient`) ve `app.js`’teki çağrı noktalarını testle doğrula; kapsam raporu üret.

## Girdi

- Mevcut `tests/app/test_premium_audio_fx.js`
- `app.js` içindeki `SeyAudio.*` çağrı noktaları (`grep -n 'SeyAudio\.' app.js`)
- `mediaFx.js` API yüzeyi

## Adımlar

1. **FX-PROMPT-STATE.json güncelle:** `activePrompt: "FX-P-16"`.

2. **`test_premium_audio_fx.js` güncelle:**
   - Her bir `SeyAudio` fonksiyonunun var ve çağrılabilir olduğunu assert et.
   - `AudioContext` stub ile gerçek osilatör/zarfların oluşturulduğunu doğrula (mock `createOscillator`/`createGain` sayaçları).
   - `settings.premiumAtmosphere=false` ve `prefers-reduced-motion: reduce` durumlarında `isAllowed()` false döndüğünü ve ses üretilmediğini doğrula.
   - `tap()`, `success()`, `warning()`, `bell()` çağrıldığında osilatör/gain oluşum sayısının beklendiği gibi arttığını kontrol et.

3. **Boundary test güncelle:**
   - `test_faz_minus11_boundary.js` içinde `SeyAudio` ve `SeyAudio.tap/success/warning/bell` varlığı assert edilsin (artık app.js içinde çağrıldığı için "henüz çağrılmıyor" testleri kalkar, yerine "çağrı noktaları var" testi gelir).

4. **Kapsam raporu oluştur:**
   - Şablon: `premium-fx-plan/deliverables/REVIEW-CHECKLIST.md` içine "Dalga 1 Audio" satırları ekle:
     ```markdown
     - [x] SeyAudio.tap() entegre edildi (app.js çağrı noktaları: ...)
     - [x] SeyAudio.success() entegre edildi
     - [x] SeyAudio.warning() entegre edildi
     - [x] SeyAudio.bell() entegre edildi
     - [x] Audio test fixture PASS
     ```

5. **Syntax check ve testler:**
   ```bash
   node --check tests/app/test_premium_audio_fx.js
   node tests/app/test_premium_audio_fx.js
   ```

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check app.js && node --check app/core/mediaFx.js
node tests/app/test_premium_audio_fx.js
node tests/app/test_faz_minus11_boundary.js
node tests/app/test_modularization_boundary.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_faz10_sync.js
node tests/panel/test_faz11_panel.js
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
  | FX-P-16 | 2026-08-31 | GitHub Copilot | audio test + kapsam | ✅ TAMAMLANDI | <yerel commit> | S5/S6 geçti | Dalga 1 Audio tamamlandı; SeyAudio yüzeyi ve app.js entegrasyonu testlendi, REVIEW-CHECKLIST güncellendi. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: `currentPhase: "Faz 1 tamamlandı"`, `lastCompletedFaz: "Faz 1"`, sıradaki `Dalga 2 / FX-P-21` (ayrı onay bekleniyor).
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-16"`, `currentPhase: "Faz 1 tamamlandı"`.
- `NEXT-STEPS.md` güncelle: Faz 1 tamamlandı, Dalga 2 (Haptics) için kullanıcı onayı bekleniyor.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-16 Faz 1 audio test fixture ve kapsam raporu"
```

**Push yapma.**

## Rollback

```bash
git checkout -- tests/app/test_premium_audio_fx.js tests/app/test_faz_minus11_boundary.js premium-fx-plan/deliverables/REVIEW-CHECKLIST.md
```

## Handoff Notu

Dalga 2 Haptics başlar: FX-P-21 `SeyHaptics` implementasyonu.
