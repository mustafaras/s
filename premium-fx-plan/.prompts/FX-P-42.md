---
code: FX-P-42
name: Root zaman temasi sinif guncellemesi
phase: Faz 4
agent: integration
prerequisites:
  - FX-P-41 tamamlandi
  - Branch: premium-fx-local
input_files:
  - /Users/m_ras/Desktop/seyma/app/core/timeTheme.js
  - /Users/m_ras/Desktop/seyma/app.js
  - /Users/m_ras/Desktop/seyma/index.html
  - /Users/m_ras/Desktop/seyma/app/styles.css
output_files:
  - /Users/m_ras/Desktop/seyma/app/core/timeTheme.js
  - /Users/m_ras/Desktop/seyma/app.js
  - /Users/m_ras/Desktop/seyma/app/styles.css
forbidden:
  - App.* yuzeyini degistirme
  - data/settings seklini degistirme
  - git push / PR / deploy
---

# FX-P-42 · Root zaman teması sınıf güncellemesi

## Amaç

`SeyTimeTheme.apply()` ile `#root` elementine mevcut saat aralığı sınıfını ekle. Tema değişikliklerinin uygulama başında ve 30 sn’lik poll loop içinde çalışmasını sağla.

## Girdi

- `timeTheme.js` iskeleti
- `app.js` boot ve poll döngüsü

## Adımlar

1. **FX-PROMPT-STATE.json güncelle:** `activePrompt: "FX-P-42"`.

2. **`SeyTimeTheme.apply()` implemente et:**
   ```js
   apply: function(){
     var root = document && document.getElementById ? document.getElementById('root') : null;
     if (!root) return;
     var classes = ['theme-time-dawn','theme-time-day','theme-time-dusk','theme-time-night'];
     var now = classForHour();
     classes.forEach(function(c){ root.classList.remove(c); });
     root.classList.add(now);
   }
   ```

3. **`app.js` boot sırasında çağr:**
   - `render()` sonunda veya boot başarılı olduktan sonra `if(window.SeyTimeTheme) window.SeyTimeTheme.apply();` ekle.
   - Animasyon yoğunluğu olmaması için `raf` throttle yok; sınıf değiştirme maliyeti düşük.

4. **CSS zaman-teması değişkenleri ekle (opsiyonel):**
   - Her saat aralığı için `--surface-dawn`, `--surface-day`, `--surface-dusk`, `--surface-night` tonlarını `app/styles.css`’te tanımla.
   - Mevcut light/dark temasına göre sadece vurgu tonlarını değiştir; tüm rengi değiştirme.

5. **Cache-bump:** `app/styles.css` ve `timeTheme.js` sürümlerini `index.html`’de güncelle.

6. **Syntax check:**
   ```bash
   node --check app.js && node --check app/core/timeTheme.js
   ```

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_premium_time_theme.js
node tests/app/test_faz10_sync.js
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
  | FX-P-42 | 2026-08-31 | GitHub Copilot | root zaman temasi uygulamasi | ✅ TAMAMLANDI | <yerel commit> | S5/S6 gecti | #root siniflari apply() ile guncellendi; boot/poll'de cagriliyor. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: "Devam Eden" → `FX-P-43`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-42"`, `currentPhase: "Faz 4"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-42 Faz 4 root zaman temasi uygulamasi"
```

**Push yapma.**

## Rollback

```bash
git checkout -- app.js app/core/timeTheme.js app/styles.css
```

## Handoff Notu

FX-P-43: Mevsimsel renk fonksiyonu.
