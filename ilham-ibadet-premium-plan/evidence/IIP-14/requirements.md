# IIP-14 gereksinim kanıtı

- REQ-027 / TC-027: `prayerHistoryPresentation()` altı eski anahtarı mutation olmadan okur; beş izlenen vakti ayırır ve `sunrise` kaydını `historical_sunrise` olarak ayrı tutar. Sentetik girdi önce/sonra byte-eşdeğerdir.
- REQ-028 / TC-028: tarihsel görünüm güvenilir payda kurmadığında `rate=null`, `maxPrays=null` döndürür; rapor kaynak kayıt sayısını ve belirsizlik açıklamasını gösterir. Mevcut skaler kayıt handler'ı, geçmiş gün açma yolu ve kayıt şeması değişmedi.
- Sonuç: `test_iip_14.js` 17/17, prayer boundary 22/22, Saygı boundary 21/21 PASS.
