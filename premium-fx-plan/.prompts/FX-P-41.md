---
code: FX-P-41
name: SeyTimeTheme.classForHour() implementasyonu
phase: Faz 4
agent: time theme uzmani
prerequisites:
  - FX-P-36 tamamlandi
  - Branch: premium-fx-local
input_files:
  - /Users/m_ras/Desktop/seyma/app/core/timeTheme.js
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/API-TRANSITION-GUIDE.md §2.4
output_files:
  - /Users/m_ras/Desktop/seyma/app/core/timeTheme.js
forbidden:
  - app.js degistirme
  - index.html'den app.js tag'ini kaldirma
  - git push / PR / deploy
---

# FX-P-41 · SeyTimeTheme.classForHour() implementasyonu

## Amac

Saat araliklarini `classForHour(h)` ile `theme-time-dawn` (05-08), `theme-time-day` (09-16), `theme-time-dusk` (17-20), `theme-time-night` (21-04) siniflarina eslestir.

## Girdi

- Mevcut `timeTheme.js` iskeleti
- `API-TRANSITION-GUIDE.md` §2.4

## Adimlar

1. **FX-PROMPT-STATE.json guncelle:** `activePrompt: "FX-P-41"`.

2. **`classForHour(h)` implemente et:**
   ```js
   function classForHour(h){
     if (h == null) h = new Date().getHours();
     if (h >= 5 && h <= 8) return 'theme-time-dawn';
     if (h >= 9 && h <= 16) return 'theme-time-day';
     if (h >= 17 && h <= 20) return 'theme-time-dusk';
     return 'theme-time-night';
   }
   ```

3. **`window.SeyTimeTheme` expose et:**
   ```js
   window.SeyTimeTheme = {
     classForHour: classForHour,
     apply: function(){},
     seasonalClass: function(){},
     applySeasonal: function(){}
   };
   ```

4. **Syntax check:**
   ```bash
   node --check app/core/timeTheme.js
   ```

## Test / Kanit

```bash
cd /Users/m_ras/Desktop/seyma
node --check app/core/timeTheme.js
node tests/app/test_premium_time_theme.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_faz10_sync.js
```

## Anti-Amnesi Guncellemesi

- `.anti-amnesia/LEDGER.md`'e satir ekle:
  ```markdown
  | FX-P-41 | 2026-08-31 | GitHub Copilot | time theme classForHour | ✅ TAMAMLANDI | <yerel commit> | S5 gecti | Saat araliklari dawn/day/dusk/night siniflarina eslestirildi. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: "Devam Eden" → `FX-P-42`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-41"`, `currentPhase: "Faz 4"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-41 Faz 4 time theme classForHour implementasyonu"
```

**Push yapma.**

## Rollback

```bash
git checkout -- app/core/timeTheme.js
```

## Handoff Notu

FX-P-42: `#root` class guncellemesi ve `SeyTimeTheme.apply()`.
