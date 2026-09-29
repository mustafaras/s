# KAO2-12 ve İlham & İbadet Arapça sekmesi yayın makbuzu

2026-09-29: Kullanıcının “tam ve kusursuz uyguladıysan canlıya al” isteğiyle KAO2-12 kapanışı ve daha önce onaylanan Arapça sekme birlikte yayımlandı.

Kaynak commit `94f866a60bbc8b10ae17c13b6f3cbee7789cad05`; `kao2-yeniden-tasarim` ve `main`, `828c9ef7` tabanından fast-forward ile eşitlendi.

GitHub Actions [36565235609](https://github.com/mustafaras/s/actions/runs/36565235609) `success`: `validate` ve `deploy` PASS. Runtime-only koruması geçti.

Canlı `https://mustafaras.github.io/s/` adresinde değişen 9 runtime dosyası yalnız GET ile HTTP 200 verdi; 9/9 SHA-256 değeri yerel kaynakla birebir eşleşti. KAO2-STATE ve KAO2-12 kanıt dosyası runtime-only yayın dışında ve beklenen 404. Ayrıntılı bayt/hash listesi `release-live.json` içindedir.

Yeni Arapça sekme için `app/styles.css` ve `app/core/saygi.js` pini `20260929b`; KAO2 runtime pini `20260928b` olarak kaldı. Cihaz kabulü doğrulanmadı.

Kanıt düzeyleri: kaynak/test — PASS; yayın — Pages ve 9/9 canlı hash doğrulandı; cihaz — doğrulanmadı. `mustafaras/seyma-data` deposuna yazılmadı, uygulama tarayıcıda açılmadı.
