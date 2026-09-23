# IIP-08 kapsam kanıtı

- Kart: `IIP-08 — İlk paket kabulü`
- Yetkili yüzey: paket A'nın IIP-05, IIP-06 ve IIP-07 çıktılarının kabulü.
- IIP-08 için `allowedProductionFiles` ve `allowedTestFiles` boş/okuma amaçlıdır; bu kart yeni üretim kodu veya fixture değiştirmez.
- IIP-07'den taşınan çalışma ağacındaki dosyalar önceki kartın kapsamındadır: `app/core/zikir.js`, `app/core/render.js`, `app/styles.css`, `tests/app/test_iip_07.js`.
- IIP-08'e ait yeni dosyalar yalnızca `ilham-ibadet-premium-plan/evidence/IIP-08/` altında kabul kanıtıdır.
- Gerçek token, localStorage, kişisel veri, `mustafaras/seyma-data`, browser profili veya sunucu kullanılmadı.

## Kapsam sonucu

`REQ-015` ve `REQ-016` için kart brief'indeki dar test/VM, görsel matris ve negatif koşullar kontrol edildi. IIP-09 veya başka bir kart başlatılmadı.
