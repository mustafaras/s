---
code: FX-P-52
name: Sesli rehberlik entegrasyon noktalari
phase: Faz 5
agent: integration
prerequisites:
  - FX-P-51 tamamlandi
  - Branch: premium-fx-local
input_files:
  - /Users/m_ras/Desktop/seyma/app.js
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
output_files:
  - /Users/m_ras/Desktop/seyma/app.js
forbidden:
  - App.* yuzeyini degistirme
  - inline onclick imzalarini degistirme
  - data/settings seklini degistirme
  - git push / PR / deploy
---

# FX-P-52 · Sesli rehberlik entegrasyon noktaları

## Amaç

`SeyAudio.voice()`’u, kullanıcıya kısa yönlendirmeler yapacağı kritik anlara entegre et: onboarding, hatırlatma, zikir hedefi tamamlandı, streak kutlaması.

## Girdi

- `app.js` içindeki ilgili handler ve render fonksiyonları
- `SeyAudio.voice()` API

## Adımlar

1. **FX-PROMPT-STATE.json güncelle:** `activePrompt: "FX-P-52"`.

2. **Onboarding voice prompt:**
   - İlk kez açılışta (veya ayar aktifse) karşılama mesajını sesli oku.
   - Koşul: `window.SeyAudio.isVoiceEnabled()` ve `data.meta.firstRun === true` gibi bir bayrak.
   - Örnek: `window.SeyAudio.voice('Sevgili Günışığı, hoş geldin. Bugün neler hissediyorsun?', { lang: 'tr-TR', rate: 1 });`

3. **Streak / kutlama sesli tebrik:**
   - Bir seri veya önemli başarı oluştuğunda kısa bir sesli mesaj.
   - Sürekli tekrarı önlemek için throttle (örneğin günde en fazla 1 kez) ekle.

4. **Zikir hedefi tamamlandığında:**
   - Zikir sayacı hedefe ulaştığında `window.SeyAudio.voice('Allah hu. Güzel bir mola vermek ister misin?', { lang: 'tr-TR' });` benzeri kısa mesaj.
   - Eğer kullanıcı sessiz zaman diliminde ise (örneğin 23:00-07:00 arası) çalışmasın.

5. **Hatırlatma sesli özet:**
   - Hatırlatma gösterildiğinde sesli özet (opsiyonel). Şu anki reminder motoru varsa, sadece ayar açıksa ve gündüzse oku.

6. **Silent-window guard:**
   - Saat 23:00 ile 07:00 arasında `SeyAudio.voice` otomatik olarak `false` dönsün veya çağrılmadan önce engellensin.
   - `mediaFx.js` içinde `SeyAudio.isQuietTime()` yardımcısı ekle.

7. **Syntax check:**
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
  | FX-P-52 | 2026-08-31 | GitHub Copilot | sesli rehberlik entegrasyonu | ✅ TAMAMLANDI | <yerel commit> | S5/S6 gecti | Onboarding, streak, zikir ve hatirlatici noktalari voice entegre edildi; sessiz pencere korunuyor. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: "Devam Eden" → `FX-P-53`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-52"`, `currentPhase: "Faz 5"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-52 Faz 5 sesli rehberlik uygulama entegrasyonu"
```

**Push yapma.**

## Rollback

```bash
git checkout -- app.js
```

## Handoff Notu

FX-P-53: Ambiyans sesleri.
