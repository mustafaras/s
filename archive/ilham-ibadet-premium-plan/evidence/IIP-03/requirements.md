# IIP-03 gereksinim kapısı

## REQ-005 / TC-005 — tarihsel anlam ve payda

PASS. Kaynak fişi altı alanın UI/API/panel anlamını, bağımsız `Fajr`/`Sunrise` mapping'ini ve mevcut `dayCount*6` / `days*6` payda davranışını gösteriyor. `sunrise` dönüşümü yapılmadı; belirsiz payda IIP-14/15'e bırakıldı.

## REQ-006 / TC-006 — kayıt varlığı ve bilinçli sıfır ayrımı

PASS. `emptyPrayerEntry` sentetik boş alanları `performed:false` ile kuruyor; state migration mevcut normalizer'ı çağırıyor. Yeni rapor hesabı eklenmedi ve boş/migration kaynaklı nesne başarı olarak adlandırılmadı.

## Kopya kontrolü

PASS. `saygi.js` oran etiketi `kayıtlı vakit payı`; paneldeki eşdeğer özetler `kayıtlı vakit` / `gün kapsamı`. Eski `uyum` etiketi kaldırıldı.
