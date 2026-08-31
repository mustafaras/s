---
code: FX-P-73
name: CODE-MAP ve mimari karar guncellemeleri
phase: Faz 7
agent: architect
prerequisites:
  - FX-P-72 tamamlandi
  - Branch: premium-fx-local
input_files:
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/CODE-MAP.md
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/MODULARIZATION.md
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/API-TRANSITION-GUIDE.md
output_files:
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/CODE-MAP.md
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/API-TRANSITION-GUIDE.md
forbidden:
  - app.js degistirme
  - git push / PR / deploy
---

# FX-P-73 · CODE-MAP ve mimari karar güncellemeleri

## Amaç

Yeni modüllerin (`dateUtils.js`, `helpers.js`, `mediaFx.js`, `timeTheme.js`) konumunu, sorumluluklarını ve bağımlılıklarını `CODE-MAP.md` ve `API-TRANSITION-GUIDE.md`’ye yaz. Mimari kararları belgele.

## Girdi

- Yeni `app/core/*.js` dosyaları
- Mevcut `CODE-MAP.md` ve `API-TRANSITION-GUIDE.md`

## Adımlar

1. **FX-PROMPT-STATE.json güncelle:** `activePrompt: "FX-P-73"`.

2. **`CODE-MAP.md` güncelle:**
   - `app/core/dateUtils.js`, `helpers.js`, `mediaFx.js`, `timeTheme.js` için girişler ekle.
   - Her modül için:
     - Sorumluluk (tek cümle)
     - Dışa açtığı global API (`window.SeymaDateUtils`, `window.SeymaHelpers`, `window.SeyFx`/`window.SeyAudio`, `window.SeyTimeTheme`)
     - Bağımlılıkları (constants.js, state.js, vb.)
     - Tüketiciler (app.js, panel, testler)

3. **`API-TRANSITION-GUIDE.md` güncelle:**
   - Yeni API’lerin imzalarını ve gating kurallarını doğrula.
   - Eksik parametre veya dönüş tipi varsa tamamla.

4. **Mimari karar ekle (Architecture Decision):**
   - "Neden IIFE + `window.*` global modül paternini koruduk?"
   - "Neden settings gating tüm FX’lerin ortasında?"
   - "Neden mediaFx.js hem ses hem haptic hem görsel FX’i tek dosyada tutuyoruz?"
   - Bu kararları `CODE-MAP.md` sonuna "Decisions" bölümü olarak ekle.

5. **Link kontrolü:**
   - Tüm `#` anchor’lar doğru mu?
   - Göreceli linkler (`./API-TRANSITION-GUIDE.md`) bozuk mu?

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check app/core/dateUtils.js
node --check app/core/helpers.js
node --check app/core/mediaFx.js
node --check app/core/timeTheme.js
node tests/app/test_modularization_boundary.js
```

## Anti-Amnesi Güncellemesi

- `.anti-amnesia/LEDGER.md`’e satır ekle:
  ```markdown
  | FX-P-73 | 2026-08-31 | GitHub Copilot | CODE-MAP ve mimari kararlar | ✅ TAMAMLANDI | <yerel commit> | S5 gecti | Yeni modul girisleri, API imzalari ve mimari kararlar guncellendi. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: "Devam Eden" → `FX-P-74`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-73"`, `currentPhase: "Faz 7"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-73 Faz 7 CODE-MAP ve mimari karar guncellemeleri"
```

**Push yapma.**

## Rollback

```bash
git checkout -- premium-fx-plan/CODE-MAP.md premium-fx-plan/API-TRANSITION-GUIDE.md
```

## Handoff Notu

FX-P-74: Final kapanis ve LOCAL-ONLY summary.
