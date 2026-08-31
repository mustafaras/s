---
code: FX-P-03
name: test_date_utils_boundary.js ve test_helpers_boundary.js ekle
phase: Faz -1.1
agent: test uzmanı
prerequisites:
  - FX-P-01 ve FX-P-02 tamamlandı
  - Branch: premium-fx-local
  - app.js hâlâ yüklü
input_files:
  - /Users/m_ras/Desktop/seyma/app/core/dateUtils.js
  - /Users/m_ras/Desktop/seyma/app/core/helpers.js
  - /Users/m_ras/Desktop/seyma/app/core/state.js
  - /Users/m_ras/Desktop/seyma/tests/app/test_modularization_boundary.js
output_files:
  - /Users/m_ras/Desktop/seyma/tests/app/test_date_utils_boundary.js
  - /Users/m_ras/Desktop/seyma/tests/app/test_helpers_boundary.js
forbidden:
  - app.js değiştirme
  - index.html'den app.js tag'ini kaldırma
  - git push / PR / deploy
---

# FX-P-03 · test_date_utils_boundary.js ve test_helpers_boundary.js ekle

## Amaç

Yeni `dateUtils.js` ve `helpers.js` modüllerinin `window.SeymaDateUtils` ve `window.SeymaHelpers` yüzeylerini, `app.js` hâlâ yüklüyken doğrulayan headless Node test fixture’ları oluştur.

## Girdi

- Mevcut `tests/app/test_modularization_boundary.js` yapısı (VM, mock localStorage/fetch/DOM).
- `dateUtils.js` ve `helpers.js` API yüzeyleri.

## Adımlar

1. `FX-PROMPT-STATE.json` güncelle: `activePrompt: "FX-P-03"`.

2. `tests/app/test_date_utils_boundary.js` oluştur:
   - `node:vm` ile `app.js` + `constants.js` + `dateUtils.js` + `state.js` + `syncGlue.js` yükle (sırayla).
   - `window.SeymaDateUtils`’nin var olduğunu assert et.
   - `todayStr()` string döndüğünü, `addDays('2026-08-31', 1) === '2026-09-01'` olduğunu, `diffDays` doğru işaret döndürdüğünü test et.
   - `pad2(3) === '03'` gibi sınır durumları test et.
   - `app.js`’teki orijinal fonksiyonlar hâlâ `window`’da tanımlı ve çalışıyor olmalı (değişmez I2).

3. `tests/app/test_helpers_boundary.js` oluştur:
   - Aynı VM kurulumu.
   - `window.SeymaHelpers` varlığı ve `segTabs`, `progBar`, `starRow`, `miniBars`, `statTile`, `collapsibleCardHTML`, `toast`, `confetti`, `haptic` fonksiyonları assert et.
   - `haptic()`’in `navigator.vibrate` olmadığında exception atmadığını doğrula.
   - `segTabs()`’in string HTML döndürdüğünü doğrula.

4. Her iki test dosyası da kendi içinde çalışabilir (standalone) olmalı: `node tests/app/test_*.js`.

5. `tests/app/test_modularization_boundary.js` güncelle (eğer gerekirse):
   - Yeni modüllerin yüklendiğini ve `app.js`’in hâlâ yüklü olduğunu teyit eden ek assertionlar.

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check tests/app/test_date_utils_boundary.js
node --check tests/app/test_helpers_boundary.js
node tests/app/test_date_utils_boundary.js
node tests/app/test_helpers_boundary.js
node tests/app/test_modularization_boundary.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_faz10_sync.js
```

Ek kanıt:
```bash
grep -c 'src="app.js' index.html   # 1
grep -o 'App\.[a-zA-Z0-9_]*\s*=' app.js | sort -u | wc -l  # önceki ile aynı
```

## Anti-Amnesi Güncellemesi

- `.anti-amnesia/LEDGER.md`’e satır ekle (seq 21):
  ```markdown
  | 21 | 2026-08-31 | GitHub Copilot | FX-P-03 | ✅ TAMAMLANDI | <yerel commit> | S5 geçti | dateUtils/helpers boundary test fixture'ları eklendi. |
  ```
- `.anti-amnesia/CURRENT-STATE.md` güncelle: `currentPhase: "Faz -1.1"`, sıradaki `FX-P-04`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-03"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-03 Faz -1.1 dateUtils ve helpers boundary testleri"
```

**Push yapma.**

## Rollback

```bash
git checkout -- .
git clean -fd tests/app/test_date_utils_boundary.js tests/app/test_helpers_boundary.js
git reset HEAD~1
```

## Handoff Notu

FX-P-04 `test_modularization_boundary.js`’i güncelleyip S5/S6 değişmezlik kanıtlarını çalıştıracak. Sonra Faz -1.1 tamamlanmış olacak.
