# KAO2-07…09 yayın makbuzu

2026-09-29: KAO2-00…09 denetim raporundan sonra kullanıcı "onaylıyorum" dedi; onayın kapsamı sorulduğunda "hepsini" (denetim raporu + yayın + KAO2-10) yanıtını verdi. Bu açık onay KAO2-07, KAO2-08, KAO2-09 ve denetim FIX'lerini (LEDGER seq35–36) kapsar.

Kaynak `3b1b3d16bc26425e522cd42182da963ec451281e`, `kao2-yeniden-tasarim` dalına push edildi. Remote KAO2 dalı ve `main`, önceki ortak `944dae6c058e211fb2a72825adc1e3debcf6d93a` başından bu commit'e fast-forward eşitlendi. Ayrı merge commit'i oluşturulmadı.

GitHub Actions [36531279286](https://github.com/mustafaras/s/actions/runs/36531279286) `success`: `validate` ve `deploy` işleri PASS.

Canlı `https://mustafaras.github.io/s/` üzerinden 15 runtime varlığı (KAO2-06 emsalindeki 14 dosya + yeni `app/content/quranCurriculumV2.js`) yalnız GET ile HTTP 200 alındı; 15/15 SHA-256 yerel `3b1b3d16` kaynaklarıyla birebir eşleşti. KAO2 durum ve kanıt belgeleri runtime-only yayın dışında kaldı ve beklenen HTTP 404 verdi. Ayrıntılar `release-live.json` içindedir. Cache pini `20260928b` korundu (quranPhonicsV1 `20260924b`).

Risk notu: pin korunduğu için çevrimdışı paketi kurulu cihazlar, service worker yenilenip paket yeniden indirilene kadar eski ama kendi içinde tutarlı KAO sürümünü görebilir; `sw.js` içeriği değiştiği için yeni worker kurulumu paketi yeniler.

Kanıt düzeyleri: kaynak/test — denetim sonrası P3 tamamen PASS; yayın — Actions success ve canlı 15/15 hash eşliği; cihaz — doğrulanmadı. Kişisel veri deposuna yazılmadı; tarayıcı veya sunucu açılmadı.
