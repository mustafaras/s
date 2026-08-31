---
code: FX-P-23
name: streak ve water haptics entegrasyonu
phase: Faz 2
agent: integration
prerequisites:
  - FX-P-22 tamamlandı
  - Branch: premium-fx-local
input_files:
  - /Users/m_ras/Desktop/seyma/app.js
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
output_files:
  - /Users/m_ras/Desktop/seyma/app.js
forbidden:
  - App.* yüzeyini değiştirme
  - data/settings şeklini değiştirme
  - git push / PR / deploy
---

# FX-P-23 · Streak ve water haptics entegrasyonu

## Amaç

Uzun seri (streak) ve hidrasyon hatırlatma/kayıt anlarında `SeyHaptics.streak()` ve `SeyHaptics.water()` ile daha zengin titreşim geri bildirimi ver.

## Girdi

- `app.js` içinde streak hesaplama ve su ekleme akışları
- `SPEC-FAZ-1.md` §1.3

## Adımlar

1. **FX-PROMPT-STATE.json güncelle:** `activePrompt: "FX-P-23"`.

2. **Streak durumlarında `SeyHaptics.streak()` ekle:**
   - Günük streak artışı / uzun seri gösterimi
   - Zikir hatim tamamlama sonrası
   - Motivasyon programında ardışık gün tamamlama
   Her noktada:
   ```js
   if (window.SeyHaptics && typeof window.SeyHaptics.streak === 'function') {
     window.SeyHaptics.streak();
   }
   ```

3. **Su ekleme ve hatırlatma noktalarında `SeyHaptics.water()` ekle:**
   - `App.waterAdd(delta)` pozitif delta için (bu handler zaten `tap()` içeriyor; `water()` ile değiş tokuş veya ikisi ard arda olabilir, ama aynı event'te ikisi birden çalmaması için tek tercih ver)
   - Su hatırlatma kartı "ekledim" onayı

4. **Syntax check:**
   ```bash
   node --check app.js
   ```

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check app.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_premium_haptics_fx.js
node tests/app/test_faz10_sync.js
node tests/panel/test_faz11_panel.js
```

Ek kanıt:
```bash
grep -n 'SeyHaptics.streak\|SeyHaptics.water' app.js
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
  | FX-P-23 | 2026-08-31 | GitHub Copilot | streak/water haptics | ✅ TAMAMLANDI | <yerel commit> | S5 geçti | Streak ve su kayıt/hatırlatma noktalarına zengin titreşim geri bildirimi eklendi. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: "Devam Eden" → `FX-P-24`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-23"`, `currentPhase: "Faz 2"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-23 Faz 2 streak ve water haptics entegrasyonu"
```

**Push yapma.**

## Rollback

```bash
git checkout -- app.js
```

## Handoff Notu

FX-P-24: haptics test fixture’larını güncelle.
