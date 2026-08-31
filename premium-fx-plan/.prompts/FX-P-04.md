---
code: FX-P-04
name: test_modularization_boundary.js güncelle ve S5/S6 kanıtlarını çalıştır
phase: Faz -1.1
agent: QA / genel
prerequisites:
  - FX-P-01 … FX-P-03 tamamlandı
  - Branch: premium-fx-local
input_files:
  - /Users/m_ras/Desktop/seyma/tests/app/test_modularization_boundary.js
  - /Users/m_ras/Desktop/seyma/index.html
  - /Users/m_ras/Desktop/seyma/app.js
output_files:
  - /Users/m_ras/Desktop/seyma/tests/app/test_modularization_boundary.js
forbidden:
  - app.js içeriğini değiştirme
  - index.html'den app.js tag'ini kaldırma
  - git push / PR / deploy
---

# FX-P-04 · test_modularization_boundary.js güncelle ve S5/S6 kanıtlarını çalıştır

## Amaç

Faz -1.1 kapanışı. Tüm yeni modüllerin `window.*` altında expose edildiğini, `app.js`’in hâlâ yüklü ve çalışır olduğunu, I2/I5 değişmezlerinin korunduğunu kanıtla.

## Adımlar

1. `FX-PROMPT-STATE.json` güncelle: `activePrompt: "FX-P-04"`.

2. `tests/app/test_modularization_boundary.js` güncelle:
   - `window.SeymaDateUtils`, `SeymaHelpers`, `SeymaState`, `SeymaSave`, `SeyOnSyncState`, `SeyOnSynced`, `SeyAudio`, `SeyHaptics`, `SeyFx`, `SeyTimeTheme` varlığını assert et.
   - `app.js`’in hâlâ yüklü olduğunu (`window.data`, `window.ui`, `window.App` gibi referanslar) doğrula.
   - `index.html` parse ederek `app.js` tag’inin hâlâ olduğunu ve yeni modüllerin `app.js`’ten önce yüklendiğini doğrula.

3. S5/S6 değişmezlik kanıtlarını çalıştır ve önce/sonra çıktıları kaydet:
   ```bash
   grep -o 'App\.[a-zA-Z0-9_]*\s*=' app.js | sort -u | wc -l > /tmp/fx-p04-before-app-count.txt
   grep -o 'onclick="App\.[a-zA-Z0-9_]*' app.js | sort | uniq -c > /tmp/fx-p04-before-onclick.txt
   grep -c 'src="app.js' index.html > /tmp/fx-p04-before-appjs.txt
   ```
   Testlerden sonra tekrar çalıştır; fark olmamalı.

4. Tüm testleri çalıştır.

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check tests/app/test_modularization_boundary.js
node tests/app/test_modularization_boundary.js
node tests/app/test_date_utils_boundary.js
node tests/app/test_helpers_boundary.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_faz10_sync.js
node tests/panel/test_faz11_panel.js
for f in tests/panel-v2/test_panel_v2_*.js; do node "$f" || echo "FAIL: $f"; done
```

Ek kanıt (fark yok):
```bash
diff /tmp/fx-p04-before-app-count.txt <(grep -o 'App\.[a-zA-Z0-9_]*\s*=' app.js | sort -u | wc -l)
diff /tmp/fx-p04-before-onclick.txt <(grep -o 'onclick="App\.[a-zA-Z0-9_]*' app.js | sort | uniq -c)
diff /tmp/fx-p04-before-appjs.txt <(grep -c 'src="app.js' index.html)
```

## Anti-Amnesi Güncellemesi

- `.anti-amnesia/LEDGER.md`’e satır ekle (seq 22):
  ```markdown
  | 22 | 2026-08-31 | GitHub Copilot | FX-P-04 | ✅ TAMAMLANDI | <yerel commit> | S5/S6 geçti | Faz -1.1 tamamlandı; tüm temel modüller expose edildi, app.js hâlâ yüklü. |
  ```
- `.anti-amnesia/CURRENT-STATE.md` güncelle: `currentPhase: "Faz -1.1 tamamlandı"`, `lastCompletedFaz: "Faz -1.1"`, sıradaki `Dalga 0 / FX-P-05` (ayrı onay bekleniyor).
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-04"`, `currentPhase: "Faz -1.1 tamamlandı"`.
- `NEXT-STEPS.md` güncelle: Faz -1.1 tamamlandı, Dalga 0 için kullanıcı onayı bekleniyor.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-04 Faz -1.1 kapanış; boundary testleri ve değişmezlik kanıtları"
```

**Push yapma.**

## Rollback

```bash
git checkout -- .
git reset HEAD~1
```

## Handoff Notu

Faz -1.1 tamamlandı. Dalga 0 (FX-P-05 … FX-P-06) için kullanıcıdan ayrı onay alınacak. O onay gelene kadar **hiçbir yeni uygulama kodu** yazılmamalı.
