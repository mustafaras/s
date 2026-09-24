# KAO-13 handoff

KAO-13 tamamlandı. Dondurulmuş `QuranShortSurahsV1.words` kaynağından üretilen 4–6 çipli kelime dizme ve parça çeviri görevleri tam oturuma eklendi. Yanlış dizilim `errors.order` sayacını artırır ve G0.5 “Fiil önce gelir” ipucunu gösterir.

Her derecelendirilen cevap `daily[date].calib` altında `pred`, `ok` ve `n` toplamlarına eklenir. Geri alma kartı, günlük kalibrasyonu, hata sayaçlarını, kuyruğu ve oturumun kalıcılık sayısını geri yükler.

E3 görünümü bu oturumda `s < 21` düzeyinden `s >= 21` düzeyine geçen kartları tek sayı olarak “Bugün N kelime daha kalıcı oldu” biçiminde gösterir. Görünümde “Bugün yeter” ve “5 dakika daha” eylemleri vardır; puan/XP sunulmaz.

Kartın tüm zorunlu headless kapıları geçti. Sıradaki kart KAO-14’tür; başlatılmadı. KAO-13 için commit/push/merge/tag/deploy ve kullanıcı-cihaz kabulü yapılmadı.
