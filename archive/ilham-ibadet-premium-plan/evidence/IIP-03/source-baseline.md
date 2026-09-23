# IIP-03 kaynak ve anlam fişi

Tarih: 2026-09-20

Bu fiş yalnız kaynak kodu, test sözleşmeleri ve sentetik boş kayıt şekliyle hazırlanmıştır. Kişisel `data/`, localStorage, GitHub kaynağı, token veya cihaz kaydı okunmamıştır.

## Tarihsel alan anlamı

- `app/core/prayer.js:11-12` ve `panel/panel.js:408-409` altı alanı aynı sırada taşır: `fajr` = İmsak, `sunrise` = Güneş, ardından Öğle, İkindi, Akşam ve Yatsı.
- `app/core/prayer.js:154` Aladhan `Fajr` ve `Sunrise` değerlerini ayrı alanlara map eder. `sunrise` tarihsel olarak ayrı bir güneş doğuş vakti kaydıdır; beş vakitten birine sessizce dönüştürülmez.
- `app/core/prayer.js:92-102` ve `panel/panel.js:411-416` boş/eksik kayıtta altı alanı varsayılan boş ve `performed:false` durumuna getirir.
- `app/core/state.js:279` mevcut günleri aynı normalizer'dan geçirir. Bu nedenle `prayer` nesnesinin varlığı tek başına kişinin altı vakti bilinçli olarak kaydettiği anlamına gelmez.

## Payda ve açık sorun

- `app/core/saygi.js:154-157` haftalık paydada `dayCount*6`, `panel/panel.js:610-619` ise `days*6` kullanır. Her iki mevcut hesap da `prayer` nesnesi bulunan günleri kapsama alır.
- IIP-03 bu hesabı, alanları veya çağrı grafiğini değiştirmez. Boş gün, migration ile oluşan boş prayer nesnesi, bilinmeyen gün ve bilinçli sıfır ayrımı yeni bir payda politikası gerektirir.
- Bu nedenle sonuç başarı, ibadet uyumu veya katılım ölçümü değildir. Payda tanımı ve tarihsel kayıt politikası IIP-14/15 için açık sorun olarak bırakılmıştır.

## Yapılan sınırlı kopya düzeltmesi

- `app/core/saygi.js:215` oran etiketi `uyum` yerine `kayıtlı vakit payı` oldu.
- `panel/panel.js:4306,4331` aynı kavramı `kayıtlı vakit` ve gün kapsamı olarak ifade ediyor.
- Sayısal hesap, altı alan, mapping, veri yazımı ve handler/call graph değiştirilmedi.
