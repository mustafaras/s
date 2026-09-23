# IIP-22 requirements gate

- REQ-043 / TC-043 PASS: 49 girdilik sürümlü public allowlist, 3.800.000 bayt tahmin, 3.826.930 bayt sentetik yerel toplam, ready/rollback/absent/quota/incomplete/partial/removed durumları, depolama kotası ve kullanıcı kaldırma eylemi sağlandı.
- REQ-044 / TC-044 PASS: `skipWaiting` ve otomatik reload yok; temp-cache atomik kurulum, kesik indirme ve kota temizliği, önceki sürüm fallback'i, kaldırılamayan cache'in kısmi sonuçla dönmesi ve yeni SW install yarışı sentetik test edildi.
- Olumsuz PASS: token/auth/secret/key sorguları, `/data/`, panel, video/ses, JSON yanıtları ve dış origin exact cache politikasından reddediliyor. Runtime yanıtları cache'e yazılmıyor.
