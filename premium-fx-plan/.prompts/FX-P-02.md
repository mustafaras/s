---
code: FX-P-02
name: state.js ve syncGlue.js iskeletini hazırla
phase: Faz -1.1
agent: state / mimar uzmanı
prerequisites:
  - FX-P-01 tamamlandı
  - Branch: premium-fx-local
  - app.js hâlâ yüklü ve değişmemiş
input_files:
  - /Users/m_ras/Desktop/seyma/app.js
  - /Users/m_ras/Desktop/seyma/app/core/constants.js
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/MODULARIZATION.md
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/API-TRANSITION-GUIDE.md §2.5, §2.6
output_files:
  - /Users/m_ras/Desktop/seyma/app/core/state.js
  - /Users/m_ras/Desktop/seyma/app/core/syncGlue.js
forbidden:
  - app.js içeriğini değiştirme
  - save() ve migrate() implementasyonunu değiştirme
  - SeyOnSyncState / SeyOnSynced implementasyonunu değiştirme
  - git push / PR / deploy
---

# FX-P-02 · state.js ve syncGlue.js iskeletini hazırla

## Amaç

`data`, `ui`, `dark`, `migrate`, `getDay`, `createDefaultData` yüzeylerini `app/core/state.js`’e; `save()`, `SeyOnSyncState`, `SeyOnSynced` yüzeylerini `app/core/syncGlue.js`’e taşı ve `window.*` altında expose et. `app.js`’i değiştirme; bu prompt sadece yeni dosyalar yazıyor.

## Girdi

- `app.js`’teki ilgili satırlar:
  - `data` (2710), `ui` (4678), `dark` (4616) global tanımlar — **closure-scoped, `window`'da DEĞİL**
  - `migrate(d)` → line 4415
  - `getDay` → line 4922
  - `createDefaultData` → line 6684
  - `save()` → line 6229
  - `SeyOnSyncState`, `SeyOnSynced` → line 6198/6208 (zaten `window`'a atanıyor)

## Adımlar

1. `FX-PROMPT-STATE.json` güncelle: `activePrompt: "FX-P-02"`.

2. `app/core/state.js` oluştur:
   - IIFE; `window.SeymaState = { ... }`.
   - **Kritik (B1 kararı):** `data`, `ui`, `dark`, `migrate`, `getDay`, `createDefaultData` `app.js`'in IIFE kapsamındadır ve `window`'da DEĞİLDİR. Faz 0'da `app.js`'e **canlı getter** eklenecek (`Object.defineProperty(window, 'data', { get: () => data, configurable: true })` ve diğerleri). `window.SeymaState` getter'ları bu canlı getter'ları okur. Bu prompt (Faz -1.1) yalnızca iskeleti kurar; canlı getter'lar Faz 0'da (FX-P-05 sonrası) eklenir.
   - İçerik:
     ```js
     window.SeymaState = {
       get data(){ return window.data; },
       get ui(){ return window.ui; },
       get dark(){ return window.dark; },
       get migrate(){ return window.migrate; },
       get getDay(){ return window.getDay; },
       get createDefaultData(){ return window.createDefaultData; }
     };
     ```
   - **Not:** `emptyDay` fonksiyonu `app.js`'te YOKTUR (yalnızca `getDay` içinde satır içi day şablonu vardır). Expose edilmez; `getDay` yüzeyi yeterlidir.
   - Fonksiyon implementasyonlarını `app.js`'ten **kopyalama** — closure'da oldukları için kopyalanamaz ve kopyalanırsa bağımlılıklar kırılır. Getter'lar yeterlidir.

3. `app/core/syncGlue.js` oluştur:
   - IIFE.
   - `SeyOnSyncState`/`SeyOnSynced` zaten `app.js` tarafından `window`'a atanır (6198/6208) — **bunları yeniden tanımlama** (getter-only accessor yapılırsa app.js'in strict-mode ataması THROW eder). `save()` closure-scoped'tır (6229) ve `window`'da değildir; Faz 0'da canlı getter eklenecek.
   - İçerik:
     ```js
     Object.defineProperty(window, 'SeymaSave', {
       get: function(){ return window.save; },
       configurable: true
     });
     ```
   - Fonksiyon implementasyonlarını `app.js`'ten **kopyalama** — `save()` onlarca closure helper'a bağımlıdır; kopyalanırsa uygulama kırılır.

4. `index.html` güncelle:
   - `app/core/dateUtils.js`’ten hemen sonra ekle:
     ```html
     <script src="app/core/state.js?v=2026083101"></script>
     <script src="app/core/syncGlue.js?v=2026083101"></script>
     ```
   - `app.js` tag’i yerinde kalmalı.

5. `node --check` her yeni dosya için çalıştır.

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check app/core/state.js
node --check app/core/syncGlue.js
node --check app.js
node tests/app/test_modularization_boundary.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_faz10_sync.js
node tests/panel/test_faz11_panel.js
for f in tests/panel-v2/test_panel_v2_*.js; do node "$f" || echo "FAIL: $f"; done
```

Ek kanıt:
```bash
grep -c 'src="app.js' index.html   # 1
grep -o 'App\.[a-zA-Z0-9_]*\s*=' app.js | sort -u | wc -l  # önceki ile aynı
grep -o 'onclick="App\.[a-zA-Z0-9_]*' app.js | sort | uniq -c  # önceki ile aynı
```

## Anti-Amnesi Güncellemesi

- `.anti-amnesia/LEDGER.md`’e satır ekle (seq 20):
  ```markdown
  | 20 | 2026-08-31 | GitHub Copilot | FX-P-02 | ✅ TAMAMLANDI | <yerel commit> | S5 geçti | state.js ve syncGlue.js iskeletleri oluşturuldu; save/migrate dokunulmadı. |
  ```
- `.anti-amnesia/CURRENT-STATE.md` güncelle: `currentPhase: "Faz -1.1"`, sıradaki `FX-P-03`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-02"`, `currentPhase: "Faz -1.1"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-02 Faz -1.1 state.js ve syncGlue.js iskeletleri"
```

**Push yapma.**

## Rollback

```bash
git checkout -- .
git clean -fd app/core/state.js app/core/syncGlue.js
git reset HEAD~1
```

## Handoff Notu

FX-P-03 test fixture’larını ekleyecek. `app.js` hâlâ yüklü; yeni modüller `window.*` altında expose edildi ama `app.js` henüz onları kullanmıyor.
