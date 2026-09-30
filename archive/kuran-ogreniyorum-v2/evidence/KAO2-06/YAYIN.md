# KAO2-05…06 yayın makbuzu

2026-09-28 kullanıcı isteği: “push commit merge deploy, şimdiye kadar tüm yaptıklarımızı canlıya al”. Bu açık onay KAO2-05 ve KAO2-06 yerel işlerini de kapsadı; KAO2-07 kapsam dışı kaldı.

Kaynak `b36db6b2e6286247f8f29d4ac6362ce6b8ae401d`, `kao2-yeniden-tasarim` dalına push edildi. Remote KAO2 dalı ve `main`, önceki ortak `3d0b2a06254bdedc56a08673cbb31ba15d5a4785` başından bu commit'e fast-forward eşitlendi. Ayrı merge commit'i oluşturulmadı.

GitHub Actions [36446272528](https://github.com/mustafaras/s/actions/runs/36446272528) `success`: `validate` ve `deploy` işleri PASS. Runtime-only yayın paketi ve zorunlu varlık koruması geçti.

Canlı `https://mustafaras.github.io/s/` üzerinden 14 runtime varlığı HTTP 200 ile alındı; 14/14 bayt ve SHA-256 değerleri yerel `b36db6b` kaynaklarıyla birebir eşleşti. KAO2 durum ve kanıt belgeleri runtime-only yayın dışında kaldı ve beklenen HTTP 404 verdi. Dosya boyutları, SHA-256 değerleri, run kimliği ve doğrulama zamanı `release-live.json` içindedir. Cache pini `20260928b` korundu.

Kanıt düzeyleri: kaynak/test — KAO2-06 P3 tamamen PASS; yayın — Actions success ve canlı 14/14 hash eşliği; cihaz — doğrulanmadı. Kişisel veri deposuna yazılmadı; tarayıcı veya sunucu açılmadı.
