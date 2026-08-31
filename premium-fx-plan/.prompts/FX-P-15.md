---
code: FX-P-15
name: bell() entegrasyonu - zikir tamamlama ve hatirlatici kapanis
phase: Faz 1
agent: integration
prerequisites:
  - FX-P-14 tamamlandı
  - Branch: premium-fx-local
  - mediaFx.js içinde SeyAudio.bell() tanımlı
input_files:
  - /Users/m_ras/Desktop/seyma/app.js
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/deliverables/SPEC-FAZ-1.md §1.3
output_files:
  - /Users/m_ras/Desktop/seyma/app.js
forbidden:
  - App.* yüzeyini değiştirme
  - data/settings şeklini değiştirme
  - git push / PR / deploy
---

# FX-P-15 · bell() entegrasyonu — zikir tamamlama ve hatırlatıcı kapanış

## Amaç

Kutlama/ritüel gerektiren durumlarda `SeyAudio.bell()` çağrısını entegre et: zikir hedef tamamlanması, hatırlatma kapanışı, gün kapanışı gibi anlar.

## Girdi

- `app.js` içinde:
  - zikir preset tamamlama akışı (`presetDone`, `completeMotivationTask`, `hatim` tamamlama)
  - hatırlatma kapanış / snooze handler'ları
  - günü kapatma / "bugün bitti" ritüeli varsa
- `SPEC-FAZ-1.md` §1.3 bağlantı noktaları

## Adımlar

1. **FX-PROMPT-STATE.json güncelle:** `activePrompt: "FX-P-15"`.

2. **Zikir tamamlama noktalarında** `SeyAudio.bell()` çağrısı ekle:
   - Preset hedefine ulaşıldığında (tur/33/99/489 tamamlandığında)
   - Hatim tamamlandığında
   - `App.completeMotivationTask(status)` başarılı durumunda
   Her yerde:
   ```js
   if (window.SeyAudio && typeof window.SeyAudio.bell === 'function') {
     window.SeyAudio.bell();
   }
   ```

3. **Hatırlatma kapanışında** `SeyAudio.bell()` ekle:
   - Kullanıcı bir hatırlatmayı "tamamlandı" olarak işaretlediğinde
   - "Remind later" / snooze'da çalmaz, sadece kapatışta

4. **Gün kapanışı ritüeli** varsa (örn. `App.closeDay`, `App.endOfDay`) orada da `bell()` çalıştır.

5. **Syntax check:**
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
node tests/app/test_premium_audio_fx.js
node tests/panel/test_faz11_panel.js
```

Ek kanıt:
```bash
grep -n 'SeyAudio.bell' app.js
```

## S6 Değişmezlik Kanıtı

```bash
grep -o 'App\.[a-zA-Z0-9_]*\s*=' app.js | sort -u | wc -l
grep -o 'onclick="App\.[a-zA-Z0-9_]*' app.js | sort | uniq -c
grep -c 'src="app.js' index.html
```

Fark varsa I2/I5 ihlali → `git checkout -- app.js` ve kullanıcıya bildir.

## Anti-Amnesi Güncellemesi

- `.anti-amnesia/LEDGER.md`’e satır ekle:
  ```markdown
  | FX-P-15 | 2026-08-31 | GitHub Copilot | bell entegrasyonu | ✅ TAMAMLANDI | <yerel commit> | S5 geçti | Zikir tamamlama, hatim, hatırlatma kapanış ve gün kapanış noktalarına SeyAudio.bell() eklendi. |
  ```
- `.anti-amnesia/CURRENT-STATE.md`: "Devam Eden" → `FX-P-16`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-15"`, `currentPhase: "Faz 1"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-15 Faz 1 bell sesi entegrasyonu"
```

**Push yapma.**

## Rollback

```bash
git checkout -- app.js
```

## Handoff Notu

FX-P-16: audio test fixture’larını güncelle ve kapsam raporu üret.
