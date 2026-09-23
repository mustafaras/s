# IIP-02 tasarım ve gerçek render sınırı

## Yüksek ayrıntılı tasarım artifact'i

`prototype.html` aynı `SYN-IIP02-01` verisiyle 12 B hedef artboard'ını, light/dark swatch'larını, large-type davranışını, ortak tokenları ve A/B açıklamalarını taşır. Bu dosya `artifactKind=prototype` olarak kaydedilir. Static HTML tasarım niyetini gözden geçirilebilir kılar; uygulamanın DOM'u değildir.

`composition-matrix.md` her ekranın ana varyantını ve zorunlu loading/empty/error/reader/record/offline durumunu açıklar. `token-map.md` sekiz temel bileşenin renk, font, boşluk, radius, ikon, focus, hareket ve durum fişini taşır.

## Gerçek render kanıtı

IIP-02 oturumunda `app/` üretim dosyası değiştirilmedi, browser veya server başlatılmadı ve screenshot alınmadı. Bu nedenle aşağıdakiler **kanıtlanmış değildir**:

- Şeyma uygulamasının 12 hedef ekranı gerçek DOM'da B kompozisyonuna sahip.
- 390×844, 1024×900, dark veya 200% cihaz render'ı piksel olarak eşleşiyor.
- VoiceOver/focus sırası, görev süresi, motion ve kontrast alpha karışımları cihazda geçti.
- IIP-02 tasarım kararı ürün kabulüne veya yayın onayına dönüştü.

Actual render kartında yapılacak tekrar: aynı sentetik veriyle 12 ekran × light/dark/large-type; loading/empty/error/reader/record/offline varyantları; gerçek CSS computed-style ve kontrast ölçümü; keyboard/focus ve reduced-motion; screenshot hashleri. Bu tekrar IIP-02 kapsamına gizlice dahil edilmemiştir.

## Güvenli doğrulama

Bu artifact'in kontrolü ağsızdır. Gerçek kullanıcı verisi, token, localStorage, `mustafaras/seyma-data` veya servis yazımı kullanılmadı.
