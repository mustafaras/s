# KAO2-10 yayın makbuzu

2026-09-29: kullanıcı "tümünü canlıya al" dedi. Yayınlanmamış tek iş KAO2-10'du (hub kartı v2).

Kaynak `811ebc8835a789f23c48a0764b93460853092c68`; `kao2-yeniden-tasarim` ve `main` `4e836148`'den fast-forward eşitlendi, merge commit'i yok.

GitHub Actions [36534605512](https://github.com/mustafaras/s/actions/runs/36534605512) `success`: `validate` ve `deploy` PASS.

Canlı `https://mustafaras.github.io/s/` üzerinden 16 runtime varlığı (KAO2-09 listesi + `app/core/saygi.js`) yalnız GET ile HTTP 200; 16/16 SHA-256 yerel `811ebc88` ile birebir. STATE ve KAO2-10 KANIT runtime-only paket dışında, beklenen 404. Ayrıntı `release-live.json`. Pin `20260928b` korundu.

Risk notu: KAO2-10 `sw.js`'e dokunmadı; service worker önceki yayınla bayt-eşit olduğundan yeni worker kurulmaz. Çevrimdışı paketi kurulu cihazlar aynı `?v=20260928b` URL'lerini önbellekten verir ve yeni hub kartını `sw.js` değişene (en geç KAO2-27 pin yükseltmesi) kadar görmez; gördükleri sürüm KAO2-07…09 yayınının kendi içinde tutarlı hâlidir. Paketi olmayan tarayıcılar yeni kartı alır.

Kanıt düzeyleri: kaynak/test — KAO2-10 P3 tamamen PASS; yayın — Actions success ve canlı 16/16 hash eşliği; cihaz — doğrulanmadı. Kişisel veri deposuna yazılmadı; tarayıcı veya sunucu açılmadı.
