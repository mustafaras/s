---
code: FX-P-89
name: app contain izole denemesi (DENEYSEL, opsiyonel)
phase: FX-WAVE-2 / Dalga 10
agent: visual
prerequisites:
  - FX-P-87 tamamlandi
  - Kullanici onayi: contain denemesi istendi (yoksa bu prompt ATLANIR ve FX-P-90'a gecilir)
input_files:
  - /Users/m_ras/Desktop/seyma/app/styles.css
output_files:
  - /Users/m_ras/Desktop/seyma/app/styles.css
forbidden:
  - #root/body contain
  - paint/size kombinasyonu ilk denemede
  - app.js duzenleme
  - git push / PR / deploy
---

# FX-P-89 · `#app` contain izole denemesi

## Amaç

`VISUAL-FX-AUDIT.md`'de bilinçli ertelenen `contain` optimizasyonunu **izole ve geri alınabilir** tek commit'te denemek. **Herhangi bir görsel regresyonda commit tamamen geri alınır** ve madde kalıcı olarak "uygulanmayacak" işaretlenir.

## Kesin Bağlantı Noktaları

- `index.html` satır 5: `<div id="app" style="...overflow:hidden;">` — inline style mevcut; contain **styles.css'ten** eklenir (inline'a dokunma).
- Riskli yüzeyler: `#sey-splash` (fixed, `#app` DIŞINDA — contain'den etkilenmez, doğrulanmalı), `.sey-bottomnav` (fixed/sticky), `#sey-toast`, modal overlay'ler, dropdown select'ler.

## Adımlar

1. **`FX-PROMPT-STATE.json`:** `activePrompt: "FX-P-89"`.

2. **Referans ölçüm (önce):** `node .claude/skills/run-seyma/driver.mjs --dump bugun > /tmp/fx89-before.txt` ve modal açan bir akışın dump'ı. (İstenirse kontrollü port-9000 protokolüyle ekran görüntüsü — CLAUDE.md veri güvenliği kurallarına sadık.)

3. **`app/styles.css`** FX bölümüne tek kural:
   ```css
   /* FX-P-89 (DENEYSEL): #app içine layout izolasyonu. paint/size KULLANMA —
      fixed nav/splash taşma riski. Regresyonda bu blok tamamen geri alınır. */
   #app{contain:layout style;}
   ```

4. **Doğrulama akışı (hepsi geçmeli):**
   ```bash
   node --check app.js
   node .claude/skills/run-seyma/driver.mjs
   node .claude/skills/run-seyma/zikr-harness.mjs
   for f in tests/panel-v2/test_panel_v2_*.js; do node "$f" || echo "FAIL: $f"; done
   ```
   Ek manuel kontrol listesi (driver dump ile): toast görünürlüğü, modal backdrop tam ekran mı, bottomnav sabit mi, splash fade-out normal mi, `sey-aurora` katmanı (FX-P-81) taşmıyor mu.

5. **Karar:**
   - Her şey normalse: LEDGER'a "contain:layout style BAŞARILI" notu, cache-bump (`styles.css?v=20260906a`), commit.
   - Herhangi bir görsel sapma: `git checkout -- app/styles.css`, LEDGER'a "contain kalıcı olarak UYGULANMAYACAK" notu, **commit yok** (yalnız durum güncellemesi).

## Yasaklar

`#root`/`body`/`html` contain; `paint`/`size`; kademeli denemeler (tek kural, tek commit).

## Test / Kanıt

Yukarıdaki §4 akışı. S5 ekstra: `node tests/app/test_premium_reduced_motion.js`.

## Bitiş (S7/S8)

Durum makinesi + LEDGER ("başarılı" ya da "kalıcı erteleme" — ikisi de seri için geçerli kapanıştır); commit yalnız başarıda: `premium-fx: FX-P-89 contain denemesi`. **Push yok.**