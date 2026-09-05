---
code: FX-P-81
name: Aurora arka plan katmani
phase: FX-WAVE-2 / Dalga 8
agent: visual
prerequisites:
  - Seri açılışı tamamlandi (FX-WAVE-2-SERI.md)
  - Branch: premium-fx-gorsel-yuzey
input_files:
  - /Users/m_ras/Desktop/seyma/index.html
  - /Users/m_ras/Desktop/seyma/app/styles.css
  - /Users/m_ras/Desktop/seyma/app/core/timeTheme.js
output_files:
  - /Users/m_ras/Desktop/seyma/index.html
  - /Users/m_ras/Desktop/seyma/app/styles.css
  - /Users/m_ras/Desktop/seyma/app/core/timeTheme.js
forbidden:
  - app.js duzenleme
  - yeni settings alani (premiumAtmosphere ile gate var)
  - migrate()/save()/sync.js dokunma
  - git push / PR / deploy
---

# FX-P-81 · Aurora arka plan katmanı

## Amaç

`premiumAtmosphere` açıkken çok düşük opaklı, hareketli aurora arka plan katmanı göster; metin okunabilirliği bozulmasın. Plandaki §4.4.2 (PLAN-GORSEL-YUZEY-TAMAMLAMA.md §1, madde 1).

## Kesin Bağlantı Noktaları (doğrulanmış)

- `app/core/timeTheme.js` — `apply()` fonksiyonu: premium kapalıysa `if (!s.premiumAtmosphere) return;` ile erken dönüyor (satır ~14-19). Aurora sınıfı buradan yönetilecek; **erken dönüş dalında sınıf kaldırılmalı**, yoksa premium kapatılınca `theme-aurora` root'ta kalır.
- `app/styles.css` satır 13: `@keyframes seyAurora{...}` zaten mevcut — yeniden yazma, sadece kullan.
- `index.html` satır 22: `#sey-splash` div'i — aurora katmanı onun kardeşi olarak `#app`'in yanına eklenecek.

## Adımlar

1. **`FX-PROMPT-STATE.json`:** `activePrompt: "FX-P-81"`.

2. **`index.html`:** `<div id="app" ...></div>` satırından hemen sonra ekle:
   ```html
   <!-- FX-P-81: Aurora arka plan katmanı. `premiumAtmosphere` açıkken
        timeTheme.js root'a `theme-aurora` sınıfı ekler; kapalıyken katman
        tamamen görünmez. Emoji/dekorasyon yok; pointer-events kapalı. -->
   <div id="sey-aurora" aria-hidden="true"></div>
   ```

3. **`app/styles.css`:** `@keyframes seyAurora` satırının yakınına (dosyanın FX bölümüne, `.sey-ripple` bloklarının üstüne) ekle:
   ```css
   #sey-aurora{position:fixed;inset:-12%;z-index:0;pointer-events:none;opacity:0;background:radial-gradient(42% 34% at 24% 22%,color-mix(in srgb,var(--accent) 55%,transparent),transparent 70%),radial-gradient(38% 30% at 78% 30%,color-mix(in srgb,var(--room2,#8E7CC3) 45%,transparent),transparent 70%),radial-gradient(46% 36% at 50% 84%,color-mix(in srgb,var(--accent-ink,#D96D8B) 40%,transparent),transparent 72%);}
   #root.theme-aurora #sey-aurora{opacity:.16;animation:seyAurora 14s ease-in-out infinite;will-change:transform,opacity;}
   #root[data-theme="dark"].theme-aurora #sey-aurora{opacity:.10;}
   @media (prefers-reduced-motion: reduce){#root.theme-aurora #sey-aurora{animation:none!important;opacity:0!important;}}
   ```
   Not: `var(--accent)`/`var(--room2)`/`var(--accent-ink)` tokenlarını kullan; yeni hex tanımlama. `z-index:0` + `#app`'in mevcut `background:var(--bg)`'i ayırır; katman `#app` altında kalır.

4. **`app/core/timeTheme.js` — `apply()` gövdesini şu hale getir** (yalnız 2 dokunuş):
   ```js
   function apply(){
     var root = document.getElementById('root');
     if (!root) return;
     var s = settings();
     if (!s.premiumAtmosphere){ root.classList.remove('theme-aurora'); return; }
     var now = new Date();
     var cls = classForHour(now.getHours());
     root.classList.remove('theme-time-dawn','theme-time-day','theme-time-dusk','theme-time-night');
     root.classList.add(cls);
     root.classList.add('theme-aurora');
   }
   ```
   `applySeasonal()`, `seasonalClass()`, `classForHour()` **değişmez**. Export listesine yeni üye EKLEME.

5. **Cache-bump (S9):** `index.html`'te `app/styles.css?v=20260905a` → `?v=20260906a`; `timeTheme.js?v=20260901a` → `?v=20260906a`.

## Yasaklar

`app.js` düzenlemek; `--page`/`--bg` değerlerini değiştirmek; yeni settings alanı; `migrate()`.

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check app/core/timeTheme.js && node --check app.js
node .claude/skills/run-seyma/driver.mjs
node tests/app/test_premium_time_theme.js   # mevcut 49 assertion + aşağıdaki yeni 4
node docs/apple-design/verify-contrast.mjs  # kontrast: metin tokenlarına dokunulmadı
```

`tests/app/test_premium_time_theme.js`'e 4 assertion ekle (mevcut VM mock-document deseniyle):
1. premium açıkken `apply()` → root classList'inde `'theme-aurora'` var.
2. premium kapalıyken `apply()` → `'theme-aurora'` yok (remove dalı çalışıyor).
3. index.html metninde `'id="sey-aurora"'` geçiyor.
4. styles.css'te `'prefers-reduced-motion: reduce'` bloğunda `#root.theme-aurora #sey-aurora` kuralı var.

## S6 Değişmezlik Kanıtı

```bash
grep -o 'App\.[a-zA-Z0-9_]*\s*=' app.js | sort -u | wc -l   # değişmedi
grep -c 'src="app.js' index.html                             # 1
```

## Bitiş (S7/S8)

LEDGER satırı + `CURRENT-STATE.md` + durum makinesi (`lastCompletedPrompt: "FX-P-81"`), commit: `premium-fx: FX-P-81 aurora arka plan katmanı`. **Push yok.**