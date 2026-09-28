# KAO — Ajan çalışma sözleşmesi

1. Giriş: [UYGULAMA-PROMPTLARI.md](UYGULAMA-PROMPTLARI.md) §0 (ilk 60 saniye) →
   `node kuran-ogreniyorum/tools/kao-plan-check.mjs --render` → CURRENT-STATE'teki
   **Sıradaki** prompt → `--card KAO-xx`. Tüm belgeleri her oturumda okuma;
   promptun 'Oku' listesi yeter.
2. CLAUDE.md "DATA SAFETY" bölümü ve `run-seyma` skill'i olduğu gibi geçerli.
   Uygulamayı tarayıcıda açma; headless harness kullan.
3. Kart sınırı dışındaki dosyaya dokunma. IIP'nin yazdığı dosyalara
   (`saygi.js`, `render.js`, `styles.css`, `app.js` hub bölümleri) yalnız
   Dalga 5'te ve IIP durumunu okuduktan sonra.
4. Arapça içerik yalnız `tools/kao-lexicon-build.mjs` çıktısından; hafızadan
   Arapça yazma. `verified:false` kayıt üretim paketine giremez.
5. Her kart: tek commit (konu `KAO-xx: …` — denetleyici kapsamı buna göre
   kontrol eder), `node --check`, ilgili fixture, `evidence/KAO-xx/EVIDENCE.json`
   + `HANDOFF.md`, LEDGER satırı, STATE güncellemesi; `kao-plan-check` PASS.
6. Push / merge / tag / deploy / `seyma-data` yazma: ayrı ayrı kullanıcı onayı.
7. Yorum satırında `App.kao…=` ya da tıklama niteliği adı yazma (fx2 düz
   metin pin tuzağı).
