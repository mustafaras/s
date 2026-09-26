# KAO-16b · Devir

**Tarih:** 2026-09-26 · **Doğrulama tabanı:** `4bf61c6bbeb8c5f3aae85b23b796a8aa819d2728` · **Durum:** done

## Ne yapıldı

- E11 “Namazda ne diyorum” (`App.kaoOpenPrayer()`, E1'den): 8 metin rekât sırasında; bilinen kelime anlamıyla açık, bilinmeyen kapalı (okunuş görünür, anlam •••); kapalıya dokunmak anlamı açar ve kelimeyi yarının tekrarına ekler; bilinen kelime kelime kartını açar; ilerleme çubuğu ve satır başına açık/kapalı sayısı.
- Ünite 1–3 kartları review olunca oturum sonu ekranında tek satır “Seviye 1 tamam · Namazda ne dediğini gör”.
- İçerik hattı: namaz metinlerinin 94 kelimesinin tamamı okunuşlu; iki araç hatası düzeltildi (digraf bozulması, ۟ işaretli harfin okunması) ve 3 modül araçla yeniden üretildi.
- R-A2 kuyruk yön dengesi düzeltildi (bazı günlerde tüm yeni kelimeler tek yöndeydi).

## Gereksinim kapanışı

| R-id | Durum | Kanıt |
|---|---|---|
| R-B2 | done | render fixture + içerik sözleşmesi (94/94 okunuş) |

## Sınırlar

50 Diyanet dua kelimesinin okunuşu D-12 yapay zekâ doğrulamalıdır (kullanıcı politikası: insan teyidi yok). Cihaz kabulü yok.

## Sonraki yetkili eylem

`node kuran-ogreniyorum/tools/kao-plan-check.mjs --card KAO-18`.
