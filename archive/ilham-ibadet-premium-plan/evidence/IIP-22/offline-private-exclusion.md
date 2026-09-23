# Private cache exclusion receipt

`swOfflineRequestKey()` sentetik negatif matrisinde tokenlı URL, `/data/latest.json`, `panel.html`, video ve dış-origin isteklerini boş anahtarla reddetti. Politika ayrıca auth/secret/credential/signature/access-key/api-key sorgu adlarını, kişisel JSON dizinini, panel/v3 yüzeyini ve ses/video uzantılarını dışlar. Fetch handler yalnız exact manifest anahtarı varsa devreye girer; network fallback sonucu `cache.put` ile kaydedilmez.
