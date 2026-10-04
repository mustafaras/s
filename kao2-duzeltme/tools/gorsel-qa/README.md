# Görsel QA aracı (kontrollü yerel; yalnız kullanıcı "ekran görüntüsü" isterse)

CLAUDE.md "kontrollü yerel görsel QA" istisnası kapsamındadır. Sunucu AÇMAZ, soket dinlemez:
`cdp.mjs`, boş geçici profilli headless Chrome for Testing'i CDP pipe ile sürer; `http://127.0.0.1:9000/*`
isteklerini diskteki bir dizinden karşılar, diğer tüm dış istekleri keser. Origin `127.0.0.1` olduğundan
`sync.js` Guard 1 geçerlidir (önce `node tests/app/test_local_visual_qa_guard.js`). `forceSync` yok, token yok.

Kullanım (Bash `dangerouslyDisableSandbox` ister: Chrome macOS sandbox içinde açılmıyor; kullanıcı onayı gerekir):

    node kao2-duzeltme/tools/gorsel-qa/shoot.mjs <kök-dizin> <çıktı-dizini> <profil-adı>

- `<kök-dizin>`: depo kökü (yerel) ya da `git archive <commit> | tar -x -C <dizin>` ile çıkarılmış önceki sürüm.
  `$TMPDIR` sandbox dışında farklı olabilir; mutlak yol ver.
- Profil adı her çalıştırmada yeni olmalı (eski profili silme gerektirmez).
- Sentetik durum: `createDefaultData()` + 60 kelimelik kart; giriş/konum kapıları parola ya da izin alanına
  dokunmadan oturum bayraklarıyla (`ui.authUnlocked`, `ui.locationGateState`, `settings.locationEnabled`) geçilir.
- 19 görünümün PNG'sini ve `log.txt` yazar. Çok görüntü için PIL ile kontak sayfası çıkarıp bakmak ucuzdur.
- Chrome yolu `cdp.mjs` başında (ms-playwright önbelleği); farklı makinede güncelle.

K2F-34/35 önce/sonra senaryosu: `node kao2-duzeltme/tools/gorsel-qa/shoot-k2f34-35.mjs <kök> <çıktı> <profil>` (yol/ünite/ilerleme ekranları + 8 yerleştirme sorusu).
