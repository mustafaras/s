# KAO2-03…04 yayın makbuzu

2026-09-28 kullanıcı isteği: “canlıya al ve sıradan devam et”. Kullanıcı branch push, `main` fast-forward ve Pages yayınına KAO2-03…04 için açıkça izin verdi; KAO2-05 ve sonrası bu kapsamın dışındadır.

Kaynak commit `5037b07b0279596f4f703bb50f8d4f33c1c715b5`, `kao2-yeniden-tasarim` ve `main` dallarına fast-forward edildi. GitHub Actions [36423925592](https://github.com/mustafaras/s/actions/runs/36423925592) `success`: validate (JS syntax, panel script tags, headless render) ve deploy (runtime-only staging, required-assets guard, upload, Pages deployment) tümü PASS. Actions yalnız Node.js 20 geçişi ve runner imajı hakkında bilgilendirici uyarılar verdi.

Canlı `https://mustafaras.github.io/s/` uç noktalarından 14 runtime varlığı HTTP 200 ile alındı; her birinin SHA-256 değeri yerel dosyayla birebir eşleşti. `kuran-ogreniyorum-v2/KAO2-STATE.json` ve KAO2 kanıtı URL'leri runtime-only yayın kuralına uygun biçimde beklenen HTTP 404 döndürdü. Tam bayt, hash ve URL dökümü `release-live.json` içindedir.

Kanıt düzeyleri: kaynak/test — KAO2-04 KANIT.md'de P3 PASS; yayın — Actions success ve 14/14 hash eşliği; cihaz — doğrulanmadı. Kişisel veri deposuna yazılmadı; tarayıcı veya sunucu açılmadı.
