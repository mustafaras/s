> Yöntem düzeltmesi: Bu genel çekimler sırasında onboarding denetimi, boş sentetik profilde parola alanının DOM’da var olup olmadığını sorguladı; parola değeri okunmadı veya doldurulmadı, gerçek profil kullanılmadı. Alanın kendisine otomasyonla erişmeme sınırı bakımından bu sorgu sorunludur; genel çekim aracından kaldırıldı. Ham sonuçlar korunur ve bu yöntem G4 uyumlu diye sunulmaz.

# K3PD-29 · 2026-10-28 · v4b sentetik görsel ölçüm

Yedi geçici profil koşumu: 320/390/460 × açık/koyu ve 390 açık +34 px inset. `--kapsam --v4-guncel` exit 0: 532 görüntü/log/manifest satırı (76 × 7), 7/7 kombinasyon ve 0 beyan edilmiş üretim bulgusu. Her sahnede gerçek font yüklemesi/`document.fonts.check` loglanır; gerçek sunulan yerel kaynak baytlarının hashleri manifestte ve kaynak listesi log özetinde bağlıdır. K3P glif tablosu 460 px açık referansla aynı 30 dizide, ölçülen 4× ölçekte karşılaştırıldı: exit 0.

`l98-read` ve `l99-partEnd`, gerçek ders durumu içinde sentetik plan öğeleriyle ölçülen ek senaryolardır; read uygulamada `apply`, partEnd `budget` DOM aşamasına eşlenir. Bu yedi koşumun aracı token alanı okumaz; dış ağ CDP ile engellenir, gerçek profil/token ve force-sync kullanılmaz. Sunucu başlatılmadı.

Bu sürümde CTA kararlılığı `layoutY` ölçer, gerçek ekran y'si iki render için ayrı kaydedilmez. `focusReachable`, gerçek Tab erişimi değildir. MC/build/cloze için tüm 77 hücrede ayrı klavye ve ardışık ekran geometrisi kanıtı yoktur. Bu nedenle 21'in tam kabulü, 29'un bağımsız nihai kabulü ve yayın henüz sağlanmadı. Önceki v1/v2/v3 ve özel betiklerde boş sentetik `ghToken` alanı boolean kontrolü için okunmuştur: gerçek token kullanılmamış ve değer loglanmamıştır, ancak bu yöntem G4 alan okumama kuralına uymamıştır. Önceki ham kayıtlar korunur.

Kaynak listesi ve log birlikte tutarlı biçimde değiştirilirse, imzalı dış tanık olmadığı için tahrifatı tek başına engellemez. Fiziksel cihaz, gerçek ekran okuyucu veya canlı yayın kabulü değildir.
