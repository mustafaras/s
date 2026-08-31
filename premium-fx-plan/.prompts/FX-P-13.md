---
code: FX-P-13
name: Basari ve kutlama seslerini entegre et
phase: Faz 1
agent: integration
prerequisites:
  - FX-P-12 tamamlandı
  - Branch: premium-fx-local
input_files:
  - /Users/m_ras/Desktop/seyma/app.js
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/FX-LIBRARY.md
output_files:
  - /Users/m_ras/Desktop/seyma/app.js
forbidden:
  - App.* yüzeyini değiştirme
  - data/settings şeklini değiştirme
  - git push / PR / deploy
---

# FX-P-13 · Başarı ve kutlama seslerini entegre et

## Amaç

Kart tamamlama, streak artışı, günlük hedef tamamlanması gibi pozitif kullanıcı eylemlerinde `SeyAudio.success()` çağrısını entegre et.

## Adımlar

1. `FX-PROMPT-STATE.json` güncelle: `activePrompt: "FX-P-13"`.

2. `app.js` içinde şu olumlu eylem noktalarını bul (CODE-MAP.md §audio entegrasyon tablosu):
   - Günlük kart toggle tamamlandığında
   - Streak sayacı arttığında
   - Bir gün için tüm hedefler tamamlandığında

3. Her noktada güvenli wrapper çağrısı ekle:
   ```js
   if (window.SeyAudio && typeof window.SeyAudio.success === 'function') {
     window.SeyAudio.success();
   }
   ```

4. Çağrılar, mevcut iş akışının ortasında değil, eylemin **sonunda** ve başarı koşulu sağlandığında olmalı.

5. `node --check app.js`.

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check app.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_faz10_sync.js
```

Ek kanıt:
```bash
grep -n 'SeyAudio.success' app.js
```

## Anti-Amnesi Güncellemesi

- `.anti-amnesia/LEDGER.md`’e satır ekle (seq 27):
  ```markdown
  | 27 | 2026-08-31 | GitHub Copilot | FX-P-13 | ✅ TAMAMLANDI | <yerel commit> | S5 geçti | Olumlu kullanıcı eylemlerine SeyAudio.success() entegre edildi. |
  ```
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-13"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-13 Faz 1 başarı/kutlama sesleri entegrasyonu"
```

**Push yapma.**

## Rollback

```bash
git checkout -- app.js
```

## Handoff Notu

FX-P-14 uyarı sesleri entegrasyonu.
