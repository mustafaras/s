# IIP-08 gereksinim kanıtı

## REQ-015 / TC-015 — paket regresyonu

İlgili sınır fixture'ları, IIP-07 fixture'ı, syntax/VM harness'i, shell bütçesi ve diff kontrolü birlikte PASS verdi. Olumlu yüzeyler korunurken hiçbir fixture pini gerekçesiz değiştirilmedi. Negatif koşul olarak ilgili gate'lerden biri başarısız olsaydı kabul verilmemesi kuralı uygulandı; başarısız kapı yoktur.

## REQ-016 / TC-016 — görsel kabul matrisi

Light/dark, 320/390/768 px, %200 metin dar sarma, reduced-motion ve ready/empty/loading/error/return durumları risk-temelli matriste işlendi. Matris, IIP-04/05/06/07 üretim registry/VM çıktısından alınan dört `visual-render.html` dosyasına bağlanır; kırık veya yalnız öz-beyan bağlantısı bırakılmaz. Browser screenshot, fiziksel cihaz veya VoiceOver kabulü değildir.

## Sonuç

`TC-015` ve `TC-016` PASS. IIP-08’in kart düzeyinde gerekli test ve görsel kabul kanıtı tamamlandı.
