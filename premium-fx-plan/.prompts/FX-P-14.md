---
code: FX-P-14
name: Uyarı seslerini entegre et
phase: Faz 1
agent: integration
prerequisites:
  - FX-P-13 tamamlandı
  - Branch: premium-fx-local
input_files:
  - /Users/m_ras/Desktop/seyma/app.js
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
output_files:
  - /Users/m_ras/Desktop/seyma/app.js
forbidden:
  - App.* yüzeyini değiştirme
  - data/settings şeklini değiştirme
  - git push / PR / deploy
---

# FX-P-14 · Uyarı seslerini entegre et

## Amaç

Sınır aşımı, hata, iptal, geçersiz giriş gibi durumlarda `SeyAudio.warning()` çağrısını entegre et.

## Adımlar

1. `FX-PROMPT-STATE.json` güncelle: `activePrompt: "FX-P-14"`.

2. `app.js` içinde uyarı sesi gerektiren noktaları bul:
   - Gün limiti aşıldığında
   - Form/overlay kapatma iptal
   - Hata toast’ları
   - Geçersiz tarih/giriş

3. Her noktada:
   ```js
   if (window.SeyAudio && typeof window.SeyAudio.warning === 'function') {
     window.SeyAudio.warning();
   }
   ```

4. `node --check app.js`.

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check app.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_faz10_sync.js
```

## Anti-Amnesi Güncellemesi

- `.anti-amnesia/LEDGER.md`’e satır ekle (seq 28):
  ```markdown
  | 28 | 2026-08-31 | GitHub Copilot | FX-P-14 | ✅ TAMAMLANDI | <yerel commit> | S5 geçti | Uyarı durumlarına SeyAudio.warning() entegre edildi. |
  ```
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-14"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-14 Faz 1 uyarı sesleri entegrasyonu"
```

**Push yapma.**

## Rollback

```bash
git checkout -- app.js
```

## Handoff Notu

FX-P-15 zil (`bell`) entegrasyonu.
