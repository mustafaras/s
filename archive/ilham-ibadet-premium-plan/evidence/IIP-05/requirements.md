# IIP-05 gereksinim kapısı

## REQ-009 / TC-009 — okuma yüzeyi

PASS. Uzun Türkçe başlıklar `overflow-wrap:anywhere` ile kesilmez; makale ve biyografi için 43rem/68ch genişlik sözleşmesi, ayrı lead/alıntı görünümü, portresiz fallback ve kırık görselde metinli devam yolu üretildi. Kaynak/lisans footer'ı başlık, kopya ve lisans bağlantısını ayrı, sarılabilir alanlarda taşır.

Olumsuz senaryolar PASS: uzun başlık, portresiz kişi, uzun lisans/source kopyası ve broken image fixture'ı taşma veya içerik kaybı göstermedi.

## REQ-010 / TC-010 — Okudum eylemi

PASS. Mevcut `IntersectionObserver` threshold `0.72` ve observer yoksa scroll-bottom fallback korunuyor. Sabit düğme makale hazır olmadan disabled ve kilit nedenini `aria-describedby` ile açıklar; sona gelince `App.markSaygiRead()`, okunmuş durumda `App.openSaygiReading()` korunur. Modal gövdesi safe-area dahil yeterli alt boşluk ayırır.

Olumsuz senaryolar PASS: loading, empty/error, uzun içerik, kilitli ve okundu dönüş durumları sentetik fixture'da doğrulandı.
