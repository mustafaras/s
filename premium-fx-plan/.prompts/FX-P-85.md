---
code: FX-P-85
name: Splash veri-durumu hatirlatmasi
phase: FX-WAVE-2 / Dalga 9
agent: integration
prerequisites:
  - FX-P-84 tamamlandi
input_files:
  - /Users/m_ras/Desktop/seyma/app.js
  - /Users/m_ras/Desktop/seyma/index.html
output_files:
  - /Users/m_ras/Desktop/seyma/app.js
  - /Users/m_ras/Desktop/seyma/index.html
forbidden:
  - splash akisini degistiren diger satirlar
  - yeni settings alani
  - ses/autoplay (SAFEGUARDS 3.2)
  - git push / PR / deploy
---

# FX-P-85 · Splash veri-durumu hatırlatması

## Amaç

Plandaki §4.3.3: dünün kaydedilmediği açılışta splash alt metni nazikçe hatırlatır; tamamsa boş kalır. Sadece görsel metin — ses yok.

## Kesin Bağlantı Noktaları (doğrulanmış)

- `index.html:22-27`: `#sey-splash` bloğu — alt satır: `<div style="...">Günışığına hoş geldin</div>`.
- `app.js:17403-17416`: `hideSplash()` + boot IIFE (`launchRitual` gating + 900ms timeout) — not güncellemesi **bu IIFE içinde**, `setTimeout(hideSplash,900)` satırından önce yapılmalı (splash görünürken).
- `yesterdayStr` helper'ı `app.js`'te mevcut (dateUtils zinciri); yoksa `todayStr`'den türetme YAPMA — önce `grep -n 'function yesterdayStr' app.js app/core/dateUtils.js` ile doğrula.

## Adımlar

1. **`FX-PROMPT-STATE.json`:** `activePrompt: "FX-P-85"`.

2. **`index.html`:** `#sey-splash` içindeki karşılama satırının altına boş not div'i ekle:
   ```html
   <div id="sey-splash-note" style="min-height:18px;font-size:var(--f-caption1);color:var(--text2);"></div>
   ```

3. **`app.js`:** boot IIFE'sinde (`app.js:17410-17416`), `setTimeout(hideSplash, 900);` satırının **hemen üstüne**:
   ```js
   // FX-P-85: dün kaydedilmemişse nazik hatırlatma (splash görünürken; ses yok,
   // emoji yok — K1: düz metin, splash'ın premium diline uygun).
   try{
     var yd=data&&data.days&&data.days[yesterdayStr()];
     var ydone=yd&&((yd.mood&&yd.mood.length)||(yd.ticks&&Object.keys(yd.ticks).length));
     if(!ydone){ var nt=document.getElementById('sey-splash-note'); if(nt) nt.textContent='Dünü de kaydetmeyi unutma'; }
   }catch(e){}
   ```
   `!on||reduced` erken-dönüş dalı **değişmez** (splash hiç görünmüyorsa not'a da gerek yok).

4. **Önce doğrula:** `yd.mood` alan yapısını `grep -n 'mood:' app.js | head -5` ile kontrol et — mood bir string dizisi ya da tek string olabilir; `ydone` koşulunu gerçek yapıya göre yaz (tahminle alanda uydurma). `data.days` anahtar biçimi `todayStr()` çıktısıdır.

5. **Cache-bump (S9):** `index.html` → `app.js?v=20260906a`.

## Yasaklar

`hideSplash` gövdesini değiştirmek; `launchRitual` varsayılanını değiştirmek; ses çalmak; yeni settings alanı.

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check app.js
node .claude/skills/run-seyma/driver.mjs
node tests/app/test_premium_launch_splash.js
```

`tests/app/test_premium_launch_splash.js`'e 3 assertion:
1. dün boş seed ile boot → `#sey-splash-note` metni `'Dünü de kaydetmeyi unutma ☀️'`.
2. dün dolu seed ile boot → not boş (`''`).
3. `launchRitual=false` → not elemanına hiç dokunulmaz (boş kalır).

Fixture'da `yesterdayStr` gerçek boot akışından geldiği için mock tarihi driver boot setiyle hizala (mevcut fixture deseni).

## S6 Değişmezlik Kanıtı

```bash
grep -o 'App\.[a-zA-Z0-9_]*\s*=' app.js | sort -u | wc -l   # değişmedi
grep -c 'src="app.js' index.html                             # 1
```

## Bitiş (S7/S8)

LEDGER + `CURRENT-STATE.md` + durum makinesi; commit: `premium-fx: FX-P-85 splash dün hatırlatması`. **Push yok.**