---
code: FX-P-55
name: Zikir ve sura sesli rehberlik yardimcisi
phase: Faz 5
agent: audio uzmanı
prerequisites:
  - FX-P-54 tamamlandı
  - Branch: premium-fx-local
  - SeyAudio.voice() ve isQuietTime() tamamlanmış
input_files:
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
  - /Users/m_ras/Desktop/seyma/app/content/zikirCoreContentV1.js
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/FX-LIBRARY.md
output_files:
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
  - /Users/m_ras/Desktop/seyma/app.js
forbidden:
  - App.* yüzeyini değiştirme
  - inline onclick imzalarını değiştirme
  - data/settings şeklini değiştirme
  - git push / PR / deploy
---

# FX-P-55 · Zikir ve süre sesli rehberlik yardımcısı

## Amaç

Kullanıcı zikir veya süre etkileşimlerine kısa, sıcak ve saygılı sesli ipuçları ekleyerek manevi akışı destekle; her çağrı quiet-time ve voiceGuidance gating’inden geçsin.

## Girdi

- `mediaFx.js` `SeyAudio.voice()` API
- `app.js` içindeki zikir/süre handler’ları
- `zikirCoreContentV1.js` mevcut zikir isimleri (opsiyonel, kopya için)

## Adımlar

1. **FX-PROMPT-STATE.json güncelle:** `activePrompt: "FX-P-55"`.

2. **`SeyAudio` pratik rehberlik mesajları ekle:**
   ```js
   window.SeyAudio.guides = {
     zikirStart: function(){ return window.SeyAudio.voice('Başla, kalbin yumuşasın.', { lang: 'tr-TR', rate: 1 }); },
     zikirHalf: function(){ return window.SeyAudio.voice('Yarısı bitti, nefes al.', { lang: 'tr-TR', rate: 1 }); },
     zikirComplete: function(){ return window.SeyAudio.voice('Tamamladın. Allah kabul etsin.', { lang: 'tr-TR', rate: 1 }); },
     suraOpen: function(name){ return window.SeyAudio.voice(name + ' açıldı. Huşuyla oku.', { lang: 'tr-TR', rate: 1 }); },
     suraBookmark: function(){ return window.SeyAudio.voice('Yer işareti koydun.', { lang: 'tr-TR', rate: 1 }); }
   };
   ```

3. **`app.js` zikir handler’larına entegre et (sesli ipuçları):**
   - `App.zikirStart()` veya zikir sayacını başlatan handler’da `window.SeyAudio.guides.zikirStart()` çağr.
   - Hedefin yarısına ulaşıldığında `window.SeyAudio.guides.zikirHalf()` çağr.
   - Hedef tamamlandığında `window.SeyAudio.guides.zikirComplete()` çağr.
   - Süre açılışında `window.SeyAudio.guides.suraOpen(suraName)` çağr (opsiyonel).

4. **Throttle / frequency guard:**
   - Aynı zikir oturumu içinde ard arda sesli mesajların çalmaması için session-level flag kullan.
   - Örneğin `ui._voiceZikirHintGiven` gibi geçici bayrakla sadece oturum başlangıcında bir kez sesli ipucu ver.

5. **Quiet-time ve gating zaten `SeyAudio.voice()` içinde; doğrudan çağrı yeterli.**

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
node tests/app/test_faz10_sync.js
```

Ek kanıt:
```bash
grep -n 'SeyAudio.guides' app.js
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
  | FX-P-55 | 2026-08-31 | GitHub Copilot | zikir/sura sesli rehberlik | ✅ TAMAMLANDI | <yerel commit> | S5/S6 geçti | zikirStart/zikirHalf/zikirComplete/suraOpen kısa sesli ipuçları eklendi; quiet-time gating korundu. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: "Devam Eden" → `FX-P-56`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-55"`, `currentPhase: "Faz 5"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-55 Faz 5 zikir ve sure sesli rehberlik yardimcisi"
```

**Push yapma.**

## Rollback

```bash
git checkout -- app/core/mediaFx.js app.js
```

## Handoff Notu

FX-P-56: Zaman dilimine göre selamlama sesli mesajı (dawn/day/dusk/night).
