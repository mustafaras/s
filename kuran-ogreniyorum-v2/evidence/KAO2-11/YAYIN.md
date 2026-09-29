# KAO2-11 yayın makbuzu

2026-09-29: kullanıcı "canlıya al" dedi. Yayınlanmamış tek iş KAO2-11'di (ilk açılış, başlangıç noktası ve yerleştirme).

Kaynak `e827d24b358db020bf34f5f1064df13e0476e48d`; `kao2-yeniden-tasarim` ve `main` `c23fe78e`'den fast-forward eşitlendi, merge commit'i yok.

GitHub Actions [36545143962](https://github.com/mustafaras/s/actions/runs/36545143962) `success`: `validate` ve `deploy` PASS.

Canlı `https://mustafaras.github.io/s/` üzerinden 16 runtime varlığı (KAO2-10 listesiyle aynı) yalnız GET ile HTTP 200; 16/16 SHA-256 yerel `e827d24b` ile birebir. STATE ve KAO2-11 KANIT runtime-only paket dışında, beklenen 404. Ayrıntı `release-live.json`. Pin `20260928b` korundu.

Risk notu: KAO2-11 `sw.js` ve `index.html`'e dokunmadı; service worker önceki yayınla bayt-eşit olduğundan yeni worker kurulmaz. Çevrimdışı paketi kurulu cihazlar aynı `?v=20260928b` URL'lerini önbellekten verir ve ilk açılışı `sw.js` değişene (en geç KAO2-27 pin yükseltmesi) kadar görmez. Paketi olmayan tarayıcılar yeni akışı alır. Mevcut (kartlı) kullanıcılar ilk açılışı hiç görmez; yeni düzende yalnız bir kez "Yeni düzen" notu çıkar.

Kanıt düzeyleri: kaynak/test — KAO2-11 P3 tamamen PASS; yayın — Actions success ve canlı 16/16 hash eşliği; cihaz — doğrulanmadı. Kişisel veri deposuna yazılmadı; tarayıcı veya sunucu açılmadı.
