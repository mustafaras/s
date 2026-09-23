# IIP-06 gereksinim kanıtı

`node tests/app/test_iip_06.js` sentetik, no-network Node VM fixture’ı 21/21 PASS verdi.

| Gereksinim | Senaryo | Sonuç |
|---|---|---|
| REQ-011 / TC-011 | Altı mevcut vakit satırı; saat, kayıt, ayrıntı ve handler ayrımı | PASS |
| REQ-011 / TC-011 | Yöntem, GPS/şehir hassasiyeti ve veri durumu metaları | PASS |
| REQ-011 / TC-011 | Boş saat/cache durumu ve fetch hata durumu | PASS |
| REQ-011 / TC-011 | Büyük metin için grid/wrap-safe satır düzeni | PASS |
| REQ-012 / TC-012 | Hesaplanan hedef, cihaz yönü ve konum hassasiyeti ayrımı | PASS |
| REQ-012 / TC-012 | Sensör yokken idle ibre ve gerçek hesap görünürlüğü | PASS |
| REQ-012 / TC-012 | Sensör izni reddi `role=alert` hata yüzeyi | PASS |
| REQ-012 / TC-012 | Canlı mutlak yön/accuracy ve aç-kapa dönüşü | PASS |

Fixture gerçek token, localStorage, kişisel veri, ağ, GPS veya cihaz sensörü kullanmaz.
