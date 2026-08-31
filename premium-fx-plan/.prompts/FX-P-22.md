---
code: FX-P-22
name: buton ve kart tiklamalarina SeyHaptics.tap() entegre et
phase: Faz 2
agent: integration
prerequisites:
  - FX-P-21 tamamlandı
  - Branch: premium-fx-local
  - SeyHaptics.tap() implemente edilmiş
input_files:
  - /Users/m_ras/Desktop/seyma/app.js
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/deliverables/SPEC-FAZ-1.md §1.3
output_files:
  - /Users/m_ras/Desktop/seyma/app.js
forbidden:
  - App.* yüzeyini değiştirme
  - inline onclick imzalarını değiştirme
  - data/settings şeklini değiştirme
  - git push / PR / deploy
---

# FX-P-22 · Buton ve kart tıklamalarına SeyHaptics.tap() entegre et

## Amaç

Kullanıcının dokunduğu her temel etkileşimde (kart toggle, buton, sekme, slider, yıldız puanlama) `SeyHaptics.tap()` geri bildirimi ver.

## Girdi

- `app.js` içindeki interaktif handler’lar
- `SPEC-FAZ-1.md` §1.3 haptik haritası

## Adımlar

1. **FX-PROMPT-STATE.json güncelle:** `activePrompt: "FX-P-22"`.

2. **Temel etkileşim handler’larına** şu bloğu ekle (her handler’ın başında veya sonunda, performansı etkilemeyecek şekilde):
   ```js
   if (window.SeyHaptics && typeof window.SeyHaptics.tap === 'function') {
     window.SeyHaptics.tap();
   }
   ```

3. **Entegre edilecek handler örnekleri** (eksik kalmaması için tüm ana etkileşimleri gez):
   - `App.setMood(id)`
   - `App.setEnergy(v)` / `App.setStress(v)`
   - `App.toggleHabit(key)`
   - `App.waterAdd(delta)` (delta > 0 iken)
   - `App.saveToday()`
   - `App.openX / closeX` overlay aç/kapa butonları
   - Yıldız puanlama (`starRow` üzerinden `App.setStar` vb.)
   - Segmented tab değişimi
   - Ayar toggle butonları

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
grep -n 'SeyHaptics.tap' app.js
```

## S6 Değişmezlik Kanıtı

```bash
grep -o 'App\.[a-zA-Z0-9_]*\s*=' app.js | sort -u | wc -l
grep -o 'onclick="App\.[a-zA-Z0-9_]*' app.js | sort | uniq -c
grep -c 'src="app.js' index.html
```

Fark varsa I2 ihlali → `git checkout -- app.js` ve kullanıcıya bildir.

## Anti-Amnesi Güncellemesi

- `.anti-amnesia/LEDGER.md`’e satır ekle:
  ```markdown
  | FX-P-22 | 2026-08-31 | GitHub Copilot | haptics tap entegrasyonu | ✅ TAMAMLANDI | <yerel commit> | S5 geçti | Kart, buton, sekme, puanlama ve overlay aç/kapa handler’larına SeyHaptics.tap() eklendi. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: "Devam Eden" → `FX-P-23`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-22"`, `currentPhase: "Faz 2"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-22 Faz 2 temel etkilesimlere haptics tap"
```

**Push yapma.**

## Rollback

```bash
git checkout -- app.js
```

## Handoff Notu

FX-P-23: streak/water haptics entegrasyonu.
