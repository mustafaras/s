---
code: FX-P-12
name: Mevcut zikir tiklama sesini SeyAudio.tap()’e yonlendir
phase: Faz 1
agent: integration
prerequisites:
  - FX-P-11 tamamlandı
  - Branch: premium-fx-local
input_files:
  - /Users/m_ras/Desktop/seyma/app.js
  - /Users/m_ras/Desktop/seyma/app/core/mediaFx.js
  - /Users/m_ras/Desktop/seyma/premium-fx-plan/CODE-MAP.md
output_files:
  - /Users/m_ras/Desktop/seyma/app.js
forbidden:
  - zikrTickSound fonksiyon imzasını değiştirme
  - App.* yüzeyini değiştirme
  - data/settings şeklini değiştirme
  - git push / PR / deploy
---

# FX-P-12 · Mevcut zikir tıklama sesini SeyAudio.tap()’e yönlendir

## Amaç

`app.js` içindeki mevcut zikir tıklama ses üreten fonksiyonu (`zikrTickSound` ~line 8502) koruyarak, ses üretim kısmını `SeyAudio.tap()` çağrısıyla değiştir. Bu, yeni audio sisteminin ilk gerçek kullanım noktasıdır.

## Adımlar

1. `FX-PROMPT-STATE.json` güncelle: `activePrompt: "FX-P-12"`.

2. `app.js` içinde `zikrTickSound` fonksiyonunu bul.

3. Fonksiyonun **içindeki** AudioContext/osilatör oluşturma kodunu kaldır veya yoruma al.

4. Yerine şunu ekle:
   ```js
   if (window.SeyAudio && typeof window.SeyAudio.tap === 'function') {
     window.SeyAudio.tap();
   }
   ```
   Eğer `window.SeyAudio` yoksa (geriye dönük güvenlik), fonksiyon sessizce no-op olmalı.

5. Fonksiyon imzası ve çağrıldığı yerlerdeki kullanım aynı kalmalı.

6. `node --check app.js`.

## Test / Kanıt

```bash
cd /Users/m_ras/Desktop/seyma
node --check app.js
node .claude/skills/run-seyma/driver.mjs
node .claude/skills/run-seyma/zikr-harness.mjs
node tests/app/test_faz10_sync.js
node tests/app/test_modularization_boundary.js
node tests/panel/test_faz11_panel.js
for f in tests/panel-v2/test_panel_v2_*.js; do node "$f" || echo "FAIL: $f"; done
```

Ek kanıt:
```bash
grep -A 8 'function zikrTickSound' app.js
```

## Anti-Amnesi Güncellemesi

- `.anti-amnesia/LEDGER.md`’e satır ekle (seq 26):
  ```markdown
  | 26 | 2026-08-31 | GitHub Copilot | FX-P-12 | ✅ TAMAMLANDI | <yerel commit> | S5 geçti | zikrTickSound SeyAudio.tap() kullanacak şekilde yönlendirildi. |
  ```
- `.anti-amnesia/CURRENT-STATE.md` güncelle: sıradaki `FX-P-13`.
- `.anti-amnesia/FX-PROMPT-STATE.json`: `activePrompt: null`, `lastCompletedPrompt: "FX-P-12"`.

## Commit

```bash
git add -A
git commit -m "premium-fx: FX-P-12 Faz 1 zikrTickSound → SeyAudio.tap() yönlendirmesi"
```

**Push yapma.**

## Rollback

```bash
git checkout -- app.js
node --check app.js
```

## Handoff Notu

FX-P-13 başarı/kutlama seslerini (kart tamamlama, streak) entegre edecek.
