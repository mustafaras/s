# KAO-16 · Devir

**Tarih:** 2026-09-25 · **Doğrulama tabanı:** `75208480b8458d9494f9a57b2ad8dcf471774150` · **Durum:** done

## Ne yapıldı

- Dondurulmuş 20 kısa sûre ve 618 kelime E6 okuyucuya bağlandı; her Arapça kelimenin hemen altında kaynaklı Latin okunuş görünür, okunuş eksikse içerik fail-closed hata yüzeyine düşer.
- Bilinen kelimelerin anlamı açık; bilinmeyen kelime dokunmayla açılır ve tanıdık sayacını artırmadan ertesi gün kuyruğuna alınır.
- Dondurulmuş altı vakıf işareti erişilebilir `.kao-waqf` kontrolüyle “burada dur: cümle/anlam sınırı” açıklamasını açar.
- “Anladım” kaydı `understoodAt` ve `delayedTestAt=+7 gün` üretir; vadesinde beş parça-çevir görevi oluşur, `delayedScore >=4` ise `confirmedAt` yazılır, değilse `needsReread` işaretlenir.
- GAP-08 kullanıcı onayıyla üç FX2 kardeş fixture karta alındı; App yüzeyi 731→734, `onclick` pini 392 kaldı.

## Kontrol sonuçları

- Değişen 7 JavaScript dosyası `node --check` → exit 0.
- 12 KAO fixture dosyası → PASS; render ve requirements yeni okuyucu/gecikmeli akışı kapsıyor.
- FX2 tab/overlay/touch → 7/7, 7/7, 14/14.
- Driver → PASS; Zikir → 95/95; state-rebind → 37/37; migration → 67/67; shell → PASS.
- Panel headless render → 50/50; plan-check → PASS (0 warn); diff-check → exit 0.

## Gereksinim kapanışı

| R-id | Durum | Kanıt |
|---|---|---|
| R-A6 | done | 6/6 vakıf işareti `.kao-waqf` kontrolü ve anlam-sınırı açıklamasıyla render edilir |
| R-C6 | partial | +7 gün, beş görev, `delayedScore` ve 4/5 kesinleştirme tamam; ısı haritası KAO-28b’de |

## Kalan sınır

Fiziksel cihaz ve gerçek VoiceOver kabulü yapılmadı. Push, merge, tag veya deploy yapılmadı.

## Sonraki yetkili eylem

`node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-17` yalnız yeni kullanıcı yetkisiyle uygulanır; KAO-17 bu oturumda başlatılmadı.
