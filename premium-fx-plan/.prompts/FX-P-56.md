---
code: FX-P-56
name: Zaman dilimine gore selamlama - dawn day dusk night
phase: Faz 5
agent: audio uzmanı
prerequisites:
  - FX-P-55 tamamlandı
  - Branch: premium-fx-local
  - SeyAudio.voice() ve SeyTimeTheme.classForHour() tamamlanmış
input_files:
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
  - /Users/m_ras/Desktop/seyma/app/core/timeTheme.js
  - /Users/m_ras/Desktop/seyma/app.js
output_files:
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
  - /Users/m_ras/Desktop/seyma/app.js
forbidden:
  - App.* yüzeyini değiştirme
  - inline onclick imzalarını değiştirme
  - data/settings şeklini değiştirme
  - git push / PR / deploy
---

# FX-P-56 · Zaman dilimine göre selamlama

## Amaç

Uygulama açılışında veya ana ekrana dönüşte, mevcut zaman dilimine göre kısa, samimi bir sesli selamlama çal; quiet-time ve voiceGuidance gating'inden geçsin.

## Girdi

- `SeyAudio.voice()` API
- `SeyTimeTheme.classForHour()` sonuçları
- `app.js` boot / foreground dönüş akışı

## Adımlar

1. **FX-PROMPT-STATE.json güncelle:** `activePrompt: "FX-P-56"`.

2. **`SeyAudio.greeting()` ekle:**
   ```js
   greeting: function(){
     if (!window.SeyTimeTheme) return false;
     var cls = window.SeyTimeTheme.classForHour();
     var map = {
       'theme-time-dawn': 'Günaydın, Sevgili Günışığı. Yeni bir gün, yeni bir başlangıç.',
       'theme-time-day': 'Merhaba, Günışığı. Günün ortasında ne hissediyorsun?',
       'theme-time-dusk': 'İyi akşamlar, Günışığı. Günü yavaşça kapatma vakti.',
       'theme-time-night': 'İyi geceler, Sevgili Günışığı. Huzurla dinlen.'
     };
     var text = map[cls] || map['theme-time-day'];
     return window.SeyAudio.voice(text, { lang: 'tr-TR', rate: 1 });
   }
   ```

3. **`app.js` boot/foreground handler'larında çağır:**
   - İlk açılışta (onboarding sonrası ilk gerçek boot) `window.SeyAudio.greeting()` çağr.
   - Uygulama foreground'a döndüğünde (visibilitychange `visible` veya 30 sn poll'de önemli zaman atlama varsa) günde en fazla 2 kez selamlama çal.
   - Throttle için `data.meta.lastVoiceGreeting` zaman damgasını kullan; 4 saatten fazla ise tekrar çal.

4. **Frequency guard:**
   - `data.meta.lastVoiceGreeting` yoksa oluştur; `migrate()` içinde zaten `meta` alanı varsa oraya ekle (veri şekli değişmez, sadece yeni alan otomatik backfill edilir).

5. **Quiet-time zaten `SeyAudio.voice()` içinde engelleniyor; gece selamlama çalmaz.**

6. **Syntax check:**
   ```bash
   node --check app/core/mediaFx.js
   node --check app.js
   ```

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check app/core/mediaFx.js
node --check app.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_premium_voice.js
node tests/app/test_premium_time_theme.js
node tests/app/test_faz10_sync.js
```

Ek kanıt:
```bash
grep -n 'SeyAudio.greeting' app.js app/core/mediaFx.js
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
  | FX-P-56 | 2026-08-31 | GitHub Copilot | zaman dilimi selamlaması | ✅ TAMAMLANDI | <yerel commit> | S5/S6 geçti | SeyAudio.greeting() eklendi; boot/foreground'da 4 saat throttle ile çalınıyor; quiet-time korunuyor. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: "Devam Eden" → `FX-P-57`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-56"`, `currentPhase: "Faz 5"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-56 Faz 5 zaman dilimine gore sesli selamlama"
```

**Push yapma.**

## Rollback

```bash
git checkout -- app/core/mediaFx.js app.js
```

## Handoff Notu

FX-P-57: Sesli rehberlik ayarları UI (dil/hız toggle).
