---
code: FX-P-46
name: CSS variables binding - zaman/mevsim degiskenleri
phase: Faz 4
agent: time theme uzmani
prerequisites:
  - FX-P-45 tamamlandi
  - Branch: premium-fx-local
  - SeyTimeTheme.apply() ve applySeasonal() tamamlanmış
input_files:
  - /Users/m_ras/Desktop/seyma/app/core/timeTheme.js
  - /Users/m_ras/Desktop/seyma/app/styles.css
  - /Users/m_ras/Desktop/seyma/index.html
output_files:
  - /Users/m_ras/Desktop/seyma/app/styles.css
  - /Users/m_ras/Desktop/seyma/app/core/timeTheme.js
forbidden:
  - app.js degistirme
  - data/settings seklini degistirme
  - git push / PR / deploy
---

# FX-P-46 · CSS variables binding — zaman/mevsim değişkenleri

## Amaç

Zaman ve mevsim temalarını `app/styles.css` içinde `--surface`, `--accent`, `--glow` değişkenleriyle merkezi hale getir; `#root` sınıf değişimleri otomatik olarak bu değişkenleri güncellesin.

## Girdi

- `app/styles.css` mevcut light/dark ve time/season değişkenleri
- `SeyTimeTheme.classForHour()` ve `seasonalClass()` sonuçları

## Adımlar

1. **FX-PROMPT-STATE.json güncelle:** `activePrompt: "FX-P-46"`.

2. **CSS değişken yapısını merkezileştir:**
   - `:root` veya `#root` default blokta:
     ```css
     --surface: #ffffff;
     --accent: var(--ok);
     --glow: rgba(250, 204, 21, 0.20);
     ```
   - `#root[data-theme="dark"]` default:
     ```css
     --surface: #0f172a;
     --accent: var(--ok);
     --glow: rgba(250, 204, 21, 0.12);
     ```

3. **Zaman dilimi binding:**
   ```css
   #root.theme-time-dawn { --surface: #fffbeb; --accent: #f59e0b; --glow: rgba(245, 158, 11, 0.18); }
   #root.theme-time-day { --surface: #ffffff; --accent: var(--ok); --glow: rgba(250, 204, 21, 0.20); }
   #root.theme-time-dusk { --surface: #fff7ed; --accent: #f97316; --glow: rgba(249, 115, 22, 0.18); }
   #root.theme-time-night { --surface: #1e293b; --accent: #818cf8; --glow: rgba(129, 140, 248, 0.16); }
   #root[data-theme="dark"].theme-time-dawn { --surface: #292524; --accent: #fbbf24; --glow: rgba(251, 191, 36, 0.14); }
   #root[data-theme="dark"].theme-time-day { --surface: #0f172a; --accent: var(--ok); --glow: rgba(250, 204, 21, 0.12); }
   #root[data-theme="dark"].theme-time-dusk { --surface: #281306; --accent: #fb923c; --glow: rgba(251, 146, 60, 0.14); }
   #root[data-theme="dark"].theme-time-night { --surface: #020617; --accent: #a5b4fc; --glow: rgba(165, 180, 252, 0.12); }
   ```

4. **Mevsim binding'i de `--season-accent` üzerinden tek noktada bırak:**
   - Mevcut `.theme-season-*` kuralları `--season-accent` ayarlamaya devam etsin.
   - Tekrar renk tanımlama yapma; sadece FX-LIBRARY'de açıklama ekle.

5. **`SeyTimeTheme` uygulama fonksiyonlarını koru:**
   - `apply()` ve `applySeasonal()` sadece class ekler/çıkarır; renk değerlerini doğrudan JS'den ayarlama.

6. **Cache-bump:** `app/styles.css` ve `timeTheme.js` sürümlerini `index.html`’de güncelle.

7. **Syntax check:**
   ```bash
   node --check app/core/timeTheme.js
   ```

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check app/core/timeTheme.js
node tests/app/test_premium_time_theme.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_faz10_sync.js
```

## Anti-Amnesi Güncellemesi

- `.anti-amnesia/LEDGER.md`’e satır ekle:
  ```markdown
  | FX-P-46 | 2026-08-31 | GitHub Copilot | CSS variables time/season binding | ✅ TAMAMLANDI | <yerel commit> | S5 geçti | --surface/--accent/--glow zaman ve karanlik moda gore bindinglendi. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: "Devam Eden" → `FX-P-47`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-46"`, `currentPhase: "Faz 4"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-46 Faz 4 zaman ve mevsim CSS degisken bindingi"
```

**Push yapma.**

## Rollback

```bash
git checkout -- app/styles.css app/core/timeTheme.js
```

## Handoff Notu

FX-P-47: Panel.html'de zaman/mevsim badge göstergesi.
