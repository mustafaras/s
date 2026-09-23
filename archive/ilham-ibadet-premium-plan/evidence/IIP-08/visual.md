# IIP-08 görsel kabul kanıtı

Artifact: [`render-matrix.html`](render-matrix.html)

Bu dosya, paket A'nın IIP-04/IIP-05/IIP-06/IIP-07 gerçek VM/registry render yakalamalarını aynı risk-temelli kabul matrisi altında toplar. Matris light/dark, 320/390/768 px, %200 metin, reduced-motion, loading/empty/error/ready/return ve 430/1280 px ortak yerleşim sınırlarını kapsar.

`render-matrix.html` yakalamaların indeksidir; tek başına uygulama render kanıtı değildir. Bağlı dört `visual-render.html` üretim registry/VM çıktılarıdır. Browser screenshot, fiziksel cihaz, VoiceOver veya kullanıcı kabulü değildir. Bu nedenle yayın tamamlanmış olsa bile `deviceAcceptance` `not_verified` olarak kalır.
