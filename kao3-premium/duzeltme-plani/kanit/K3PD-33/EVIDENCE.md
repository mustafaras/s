# K3PD-33 kanıt: yayın ve canlı eşlik (ACCEPTED_DEVIATION)

- Aday A: `746ecdd256b26129c587104050b5e9cb716150c2`; `origin/main` = A (push 613a19c0..746ecdd2). Sonradan yalnız kayıt/belge commit'leri push edildi (`2d21720d`); üretim varlıkları A ile aynı.
- Workflow: "Deploy static content to Pages" run **40863074376**, head 746ecdd2, completed/success (GitHub API). Belge push'u için run 40869050015 success.
- Canlı eşlik (no-cache GET + SHA-256, 2026-10-29): index.html, sw.js ve manifest/index'teki tüm sürümlü URL'ler: **66/66 eşit**, 0 eksik (14 geçici IncompleteRead curl ile yeniden denenip geçti).
- Onay: kullanıcının açık talimatı 2026-10-29 ("açıkları kapat ve push commit merge deploy"; ardından "tümünü canlıya al"); aday özeti önceden sorulmadı → sapma.
- Deney takvimi: düzeltme canlıya 2026-10-29'da çıktı. 02/26 sözleşmesine göre ilk tam UTC günü 2026-10-30; 14 günlük pencere 2026-10-30…2026-11-12, 30 günlük 2026-10-30…2026-11-28 (türetildi; `deney-rapor.cjs` içindeki eski 1/17 Kasım sabitleri bu kartta kod değişikliği yasağı nedeniyle DEĞİŞTİRİLMEDİ, açık iş).
- Açık: cihaz kabulü user_attested (ajan doğrulaması yok); ekran okuyucu, L2, 230 kayıt, öğrenme etkisi (study14/30) kapıları pending. Makbuz commit'i yerel dalda; origin/main'e ikinci kez makbuz push'u zincir kuralı gereği ayrı kapsam ister (bu oturumda kullanıcı talimatıyla belge push'u yapıldı).
