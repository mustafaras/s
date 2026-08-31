---
code: FX-P-35
name: Micro-FX entegrasyonu - kart toggle streak su
phase: Faz 3
agent: integration
prerequisites:
  - FX-P-34 tamamlandı
  - Branch: premium-fx-local
input_files:
  - /Users/m_ras/Desktop/seyma/app.js
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
  - /Users/m_ras/Desktop/seyma/app/styles.css
output_files:
  - /Users/m_ras/Desktop/seyma/app.js
  - /Users/m_ras/Desktop/seyma/app/styles.css
forbidden:
  - App.* yüzeyini değiştirme
  - inline onclick imzalarını değiştirme
  - data/settings şeklini değiştirme
  - git push / PR / deploy
---

# FX-P-35 · Micro-FX entegrasyonu

## Amaç

Ripple, shimmer ve count-up efektlerini gerçek etkileşim noktalarına entegre et: kart toggle, streak kutlaması, su ekleme.

## Girdi

- `app.js` içindeki interaktif render ve handler’lar
- `SeyFx.ripple`, `SeyFx.shimmer`, `SeyFx.countUp`

## Adımlar

1. **FX-PROMPT-STATE.json güncelle:** `activePrompt: "FX-P-35"`.

2. **Kart toggle butonlarına ripple ekle:**
   - Kart HTML’inde `class="sey-ripple"` kullan veya `onclick` handler’a `event` geçip `SeyFx.ripple(event)` çağr.
   - Örnek inline pattern:
     ```js
     ' onclick="App.toggleHabit(\''+esc(key)+'\'); if(window.SeyFx) window.SeyFx.ripple(event, \'var(--ok)\');"'
     ```

3. **Streak / kutlama shimmer’ı:**
   - Uzun seri gösteren kartlarda veya streak artışı olduğunda hedef elemente `window.SeyFx.shimmer(el)` çağr.
   - Örnek: `App.toggleHabit` başarılıysa ilgili kartın container’ını shimmerla.

4. **Count-up sayaçlar:**
   - Su miktarı, günük streak, zikir sayısı gibi ani değişen sayıları güncellerken `SeyFx.countUp({ el, from, to, duration: 500 })` çağr.
   - Element referansını `document.getElementById` ile al; yoksa eski doğrudan atamayı koru.

5. **CSS class’larını ekle:**
   - Gerekirse `.sey-ripple`, `.sey-shimmer` sınıflarını ilgili elementlere ekle; yalnızca render edilen HTML içinden.

6. **Syntax check:**
   ```bash
   node --check app.js
   ```

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check app.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_faz10_sync.js
node tests/panel/test_faz11_panel.js
```

Ek kanıt:
```bash
grep -n 'SeyFx.ripple\|SeyFx.shimmer\|SeyFx.countUp' app.js
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
  | FX-P-35 | 2026-08-31 | GitHub Copilot | micro-FX entegrasyonu | ✅ TAMAMLANDI | <yerel commit> | S5 geçti | Kart toggle, streak ve su noktalarına ripple/shimmer/count-up eklendi. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: "Devam Eden" → `FX-P-36`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-35"`, `currentPhase: "Faz 3"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-35 Faz 3 micro-FX uygulama entegrasyonu"
```

**Push yapma.**

## Rollback

```bash
git checkout -- app.js app/styles.css
```

## Handoff Notu

FX-P-36: Visual FX test fixture’ları.
