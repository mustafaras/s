---
code: FX-P-67
name: Launch ritual splash sequence sound animation
phase: Faz 6
agent: integration
prerequisites:
  - FX-P-66 tamamlandı
  - Branch: premium-fx-local
  - Premium atmosfer master switch ve ses/haptic/visual FX motorları tamamlanmış
input_files:
  - /Users/m_ras/Desktop/seyma/app.js
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
  - /Users/m_ras/Desktop/seyma/app/core/timeTheme.js
  - /Users/m_ras/Desktop/seyma/app/styles.css
  - /Users/m_ras/Desktop/seyma/index.html
output_files:
  - /Users/m_ras/Desktop/seyma/app.js
  - /Users/m_ras/Desktop/seyma/app/styles.css
forbidden:
  - App.* yüzeyini değiştirme
  - data/settings şeklini değiştirme
  - index.html'den app.js tag'ini kaldırma
  - git push / PR / deploy
---

# FX-P-67 · Launch ritual splash sequence

## Amaç

Uygulama açılışında “Premium Atmosfer” açıksa kısa bir açılış ritüeli çal: marka splash, yumuşak fade/slide animasyon, hoş bir sesli selamlama ve haptic onay; quiet-time ve reduced-motion’a tabi olsun.

## Girdi

- `app.js` boot akışı
- `SeyAudio.greeting()` ve `SeyHaptics.success()`
- `SeyFx.enter()` ve zaman teması
- `app/styles.css`

## Adımlar

1. **FX-PROMPT-STATE.json güncelle:** `activePrompt: "FX-P-67"`.

2. **Splash container ekle (HTML string olarak `app.js` içinde):**
   ```js
   function launchRitualHTML(){
     return '<div id="launch-ritual" class="launch-ritual" role="dialog" aria-modal="true" aria-label="Şeyma açılış ritüeli">' +
       '<div class="launch-mark">🦩</div>' +
       '<div class="launch-title">Şeyma</div>' +
       '<div class="launch-subtitle">Sevgili Günışığı, hoş geldin</div>' +
     '</div>';
   }
   ```

3. **`App.showLaunchRitual()` handler ekle:**
   ```js
   App.showLaunchRitual = function(){
     if (!window.SeyFx || !window.SeyFx.isPremiumFxEnabled()) return;
     if (window.SeyFx.prefersReducedMotion()) return;
     var appEl = document.getElementById('app');
     if (!appEl) return;
     appEl.innerHTML = launchRitualHTML();
     var ritual = document.getElementById('launch-ritual');
     if (ritual && window.SeyFx.enter) window.SeyFx.enter(ritual, 80);
     if (window.SeyAudio && window.SeyAudio.greeting) window.SeyAudio.greeting();
     if (window.SeyHaptics && window.SeyHaptics.success) window.SeyHaptics.success();
     setTimeout(function(){
       if (window.SeyTimeTheme && window.SeyTimeTheme.apply) window.SeyTimeTheme.apply();
       render();
     }, 1400);
   };
   ```

4. **Boot sırasında koşullu çağır:**
   - `data.settings.launchRitual === true` ve `data.meta.firstRun === false` ise (tekrar açılış) ritüeli göster.
   - İlk onboarding açılışında ritüel gösterme, çünkü kullanıcı henüz ayarlara karar vermemiş olabilir.

5. **CSS ekle:**
   ```css
   .launch-ritual {
     position: fixed; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
     background: var(--surface); color: var(--text); z-index: 1000;
   }
   .launch-mark { font-size: 72px; margin-bottom: 16px; }
   .launch-title { font-size: 32px; font-weight: 700; letter-spacing: 2px; }
   .launch-subtitle { font-size: 16px; color: var(--muted); margin-top: 8px; }
   @media (prefers-reduced-motion: reduce) {
     .launch-ritual, .launch-mark, .launch-title, .launch-subtitle { animation: none !important; }
   }
   ```

6. **Quiet-time:** `SeyAudio.greeting()` zaten quiet-time içinde false döner; ritüel animasyonu quiet-time'da da gösterilebilir (görsel sessiz değil).

7. **Cache-bump:** `app.js`, `app/styles.css` sürümlerini `index.html`’de güncelle.

8. **Syntax check:**
   ```bash
   node --check app.js
   ```

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check app.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_premium_settings.js
node tests/app/test_premium_voice.js
node tests/app/test_premium_fx_utils.js
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
  | FX-P-67 | 2026-08-31 | GitHub Copilot | launch ritual splash | ✅ TAMAMLANDI | <yerel commit> | S5/S6 geçti | Açılış ritüeli eklendi; splash, ses, haptic ve animasyon quiet-time/reduced-motion gatingli. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: "Devam Eden" → `FX-P-68`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-67"`, `currentPhase: "Faz 6"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-67 Faz 6 launch ritual splash sequence"
```

**Push yapma.**

## Rollback

```bash
git checkout -- app.js app/styles.css
```

## Handoff Notu

FX-P-68: Final settings/panel audit ve master switch cascade end-to-end test.
