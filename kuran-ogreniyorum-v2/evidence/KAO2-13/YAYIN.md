# KAO2-13 yayın makbuzu

2026-09-29: Kullanıcı “push deploy” talimatıyla tamamlanmış KAO2-13 kapsamının yayınına açıkça onay verdi. KAO2-14 yayın kapsamına dahil değildir.

Kart kaynak commit'i `d93db66fc072bf2eee95d1d974fa3295fe6fe2cd`; release yetkisini kaydeden commit `32ba39c7bdb83f97b63613ae377b0ed39340a28d`. `kao2-yeniden-tasarim` ve `main`, ortak `28efe60af79dec6fb2e7a01fb786da7dc81b3c72` tabanından fast-forward ile `32ba39c7` üzerinde eşitlendi.

GitHub Actions [36576010829](https://github.com/mustafaras/s/actions/runs/36576010829) `success`: `validate` ve `deploy` işleri geçti; runtime-only zorunlu varlık koruması PASS.

Canlı `https://mustafaras.github.io/s/` adresindeki üç değişen runtime dosyası yalnız GET ile HTTP 200 verdi; 3/3 bayt ve SHA-256 değerleri yerel kaynakla birebir eşleşti. `KAO2-STATE.json` ve KAO2-13 kanıt belgesi runtime-only yayın dışında kaldı ve beklenen 404 verdi. Tam bayt/hash dökümü `release-live.json` içindedir. KAO pini `20260928b` korundu.

Kanıt düzeyleri: kaynak/test — PASS; yayın — Pages validate/deploy ve 3/3 canlı hash PASS; cihaz — doğrulanmadı. `mustafaras/seyma-data` deposuna yazılmadı; uygulama tarayıcıda açılmadı.
