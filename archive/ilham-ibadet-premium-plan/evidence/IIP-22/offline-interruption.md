# Interruption and rollback receipt

Sentetik CacheStorage ile şu senaryolar PASS oldu: üçüncü indirmede kesinti sonrası temp cache temizliği; final kopyada `QuotaExceededError` sonrası yeni cache temizliği ve eski cache'in korunması; mevcut sürüm yokken eski cache'den exact asset fallback; bir cache silinemediğinde diğerlerinin kaldırılması ve `partial` sonucu; başarılı install sırasında `skipWaiting` çağrılmaması; index kayıt akışında `controllerchange` reload bulunmaması. Böylece yeni SW yarışı açık sayaç/not oturumunu zorla yenilemez.
