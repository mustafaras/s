---
code: FX-P-47
name: Panel time theme badge - observer'a zaman/mevsim gostergesi
phase: Faz 4
agent: panel integration
prerequisites:
  - FX-P-46 tamamlandi
  - Branch: premium-fx-local
  - SeyTimeTheme classForHour/seasonalClass/isQuietTime tamamlanmış
input_files:
  - /Users/m_ras/Desktop/seyma/panel.html
  - /Users/m_ras/Desktop/seyma/panel/panel.js
  - /Users/m_ras/Desktop/seyma/app/core/timeTheme.js
output_files:
  - /Users/m_ras/Desktop/seyma/panel.html
  - /Users/m_ras/Desktop/seyma/panel/panel.js
forbidden:
  - app.js degistirme
  - data/settings seklini degistirme
  - git push / PR / deploy
---

# FX-P-47 · Panel time theme badge

## Amaç

Observer panelinde (`panel.html`) kullanıcının uygulamasına ait mevcut zaman dilimi (dawn/day/dusk/night) ve mevsim bilgisini gizlilik koruyarak, redakte edilmiş bir badge olarak göster.

## Girdi

- `panel.html` header/status alanı
- `panel/panel.js` render fonksiyonları
- `timeTheme.js` sınıf ve quiet-time fonksiyonları

## Adımlar

1. **FX-PROMPT-STATE.json güncelle:** `activePrompt: "FX-P-47"`.

2. **Panel header'a badge alanı ekle:**
   - Mevcut panel header'da küçük bir durum kartı/şerit ekle.
   - Örnek HTML:
     ```html
     <div id="fx-time-badge" class="aeon-time-badge" style="display:none;">
       <span id="fx-time-icon">🌙</span>
       <span id="fx-time-label">Gece</span>
       <span id="fx-season-label" class="muted">· Kış</span>
     </div>
     ```

3. **`panel.js` içinde `renderTimeBadge()` yardımcısı ekle:**
   ```js
   function renderTimeBadge(){
     var now = new Date();
     var hourClass = window.SeyTimeTheme ? window.SeyTimeTheme.classForHour(now.getHours()) : '';
     var seasonClass = window.SeyTimeTheme ? window.SeyTimeTheme.seasonalClass(now) : '';
     var map = {
       'theme-time-dawn': { icon: '🌅', label: 'Şafak' },
       'theme-time-day': { icon: '☀️', label: 'Gündüz' },
       'theme-time-dusk': { icon: '🌇', label: 'Akşam' },
       'theme-time-night': { icon: '🌙', label: 'Gece' }
     };
     var seasonMap = {
       'theme-season-spring': 'Bahar',
       'theme-season-summer': 'Yaz',
       'theme-season-autumn': 'Sonbahar',
       'theme-season-winter': 'Kış'
     };
     var info = map[hourClass] || { icon: '•', label: '' };
     var season = seasonMap[seasonClass] || '';
     var el = document.getElementById('fx-time-badge');
     if (!el) return;
     el.style.display = 'inline-flex';
     document.getElementById('fx-time-icon').textContent = info.icon;
     document.getElementById('fx-time-label').textContent = info.label;
     document.getElementById('fx-season-label').textContent = season ? '· ' + season : '';
   }
   ```

4. **Quiet-time göstergesi:**
   - Eğer `window.SeyTimeTheme.isQuietTime()` true ise badge'e sessiz mod ibaresi ekle (örneğin `' 🔇 Sessiz'`).
   - Bu sadece UI göstergesidir; observer'a gerçet ses durumu aktarılmaz.

5. **CSS için minimal badge stili:**
   ```css
   .aeon-time-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; background: rgba(255,255,255,0.08); font-size: 12px; }
   .aeon-time-badge .muted { opacity: 0.7; }
   ```

6. **Panel veri bütünlüğünü koru:**
   - Sadece zaman/mevsim/karakter bilgisi göster; `data.days`, profil, medya, konum paylaşılmasın.
   - `panelCoverageManifest.js`'te yeni badge için herhangi bir veri çıkışı yok; değişiklik gerekmez.

7. **Syntax check:**
   ```bash
   node --check panel/panel.js
   ```

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check panel/panel.js
node tests/panel/test_faz11_panel.js
node tests/panel/test_panel_p1_projection.js
node tests/panel/test_panel_p3_root_modules.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_faz10_sync.js
```

## Anti-Amnesi Güncellemesi

- `.anti-amnesia/LEDGER.md`’e satır ekle:
  ```markdown
  | FX-P-47 | 2026-08-31 | GitHub Copilot | panel time theme badge | ✅ TAMAMLANDI | <yerel commit> | S5 geçti | panel.html'de zaman/mevsim/quiet-time badge eklendi; hicbir ozel veri sizdirilmadi. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: "Devam Eden" → `FX-P-48`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-47"`, `currentPhase: "Faz 4"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-47 Faz 4 panel time theme badge"
```

**Push yapma.**

## Rollback

```bash
git checkout -- panel.html panel/panel.js
```

## Handoff Notu

FX-P-48: Time theme final audit ve FX-LIBRARY.md time catalog güncellemesi.
