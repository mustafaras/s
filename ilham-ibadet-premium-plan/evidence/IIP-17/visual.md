# IIP-17 sentetik görsel inceleme

`render-matrix.html`, üretim builder çıktısını açık 375 px ve koyu 430 px çerçevelerde aynı stylesheet ile sunar. Yeni üst şerit iki anlamlı bilgi grubuna ayrılır; emojisiz Lucide ikonları, tek ay-döngüsü göstergesi ve dar ekranda tek sütun sözleşmesi taşır. Arapça blok RTL, alan sahibi onaylı gerçek okunuş ve meal LTR’dir; font fallback zinciri ve taşma koruması vardır.

İzole `127.0.0.1:9000` sunucusu veri güvenliği Guard 1 testi 69/69 sonrasında açıldı; fakat hem IAB kullanılamadı hem Chrome QA sağlayıcısı iki kez request-header policy aşamasında açılamadı. Sunucu kapatıldı. Bu nedenle artifact gerçek tarayıcı ekran görüntüsü/cihaz kabulü değildir ve görsel gate yeniden incelemededir.
