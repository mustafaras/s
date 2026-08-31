---
code: FX-P-43
name: Mevsimsel renk fonksiyonu
phase: Faz 4
agent: time theme uzmani
prerequisites:
  - FX-P-42 tamamlandi
  - Branch: premium-fx-local
input_files:
  - /Users/m_ras/Desktop/seyma/app/core/timeTheme.js
  - /Users/m_ras/Desktop/seyma/app/styles.css
output_files:
  - /Users/m_ras/Desktop/seyma/app/core/timeTheme.js
  - /Users/m_ras/Desktop/seyma/app/styles.css
forbidden:
  - app.js degistirme
  - data/settings seklini degistirme
  - git push / PR / deploy
---

# FX-P-43 · Mevsimsel renk fonksiyonu

## Amac

Hem Miladi hem Hicri takvime gore `seasonalClass()` ve `applySeasonal()` implemente et; CSS degiskenlerini mevsimsel tonlara kaydir.

## Girdi

- `timeTheme.js`
- `app/content/hijriCalendar.js` (mevcut `window.HijriCalendarV1` API)
- `app/core/dateUtils.js`

## Adimlar

1. **FX-PROMPT-STATE.json guncelle:** `activePrompt: "FX-P-43"`.

2. **`seasonalClass()` implemente et:**
   ```js
   function seasonalClass(d){
     var date = d || new Date();
     var m = date.getMonth() + 1;
     if (m >= 3 && m <= 5) return 'theme-season-spring';
     if (m >= 6 && m <= 8) return 'theme-season-summer';
     if (m >= 9 && m <= 11) return 'theme-season-autumn';
     return 'theme-season-winter';
   }
   ```

3. **`applySeasonal()` implemente et:**
   ```js
   applySeasonal: function(d){
     var root = document && document.getElementById ? document.getElementById('root') : null;
     if (!root) return;
     var classes = ['theme-season-spring','theme-season-summer','theme-season-autumn','theme-season-winter'];
     classes.forEach(function(c){ root.classList.remove(c); });
     root.classList.add(seasonalClass(d));
   }
   ```

4. **Hicri mevsim entegrasyonu (opsiyonel):**
   - Eger `window.HijriCalendarV1` varsa, mevcut Hicri ay adini alip `theme-hijri-{ay}` sınıfı ekle.
   - Bu sadece root sinifi ekleme; renkler light/dark temasinin vurgu tonlarina dokunsun.

5. **`app/styles.css` mevsimsel degiskenleri ekle:**
   ```css
   :root {
     --season-accent: var(--ok);
   }
   #root.theme-season-spring { --season-accent: #a3e635; }
   #root.theme-season-summer { --season-accent: #facc15; }
   #root.theme-season-autumn { --season-accent: #fb923c; }
   #root.theme-season-winter { --season-accent: #60a5fa; }
   #root[data-theme="dark"].theme-season-spring { --season-accent: #bef264; }
   #root[data-theme="dark"].theme-season-summer { --season-accent: #fde047; }
   #root[data-theme="dark"].theme-season-autumn { --season-accent: #fdba74; }
   #root[data-theme="dark"].theme-season-winter { --season-accent: #93c5fd; }
   ```

6. **Syntax check:**
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
```

## Anti-Amnesi Guncellemesi

- `.anti-amnesia/LEDGER.md`'e satir ekle:
  ```markdown
  | FX-P-43 | 2026-08-31 | GitHub Copilot | mevsimsel renk fonksiyonu | ✅ TAMAMLANDI | <yerel commit> | S5 gecti | seasonalClass/applySeasonal + CSS degiskenleri eklendi. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: "Devam Eden" → `FX-P-44`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-43"`, `currentPhase: "Faz 4"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-43 Faz 4 mevsimsel renk fonksiyonu"
```

**Push yapma.**

## Rollback

```bash
git checkout -- app/core/timeTheme.js app/styles.css
```

## Handoff Notu

FX-P-44: Zaman temasi test fixture’lari ve Faz 4 kapanis.
