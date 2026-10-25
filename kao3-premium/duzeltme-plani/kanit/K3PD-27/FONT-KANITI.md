# K3PD-27 — Font teknik ölçümü

Tarih: 2026-10-25 · Font üretimi `--build` olmadan incelendi; yeni font üretilmedi.

## Mevcut dosya ve cmap

- Varlık: `assets/kao/font/ScheherazadeNew-Regular.k3p.woff2`
- Boyut: 25.060 bayt (150 KiB tavanının altında)
- Mevcut SHA-256: `cdf29cccf459341b9b59744ea2f728b589c839d1175fa094ecdd2bff3eb7a2c6`
- `git diff --quiet HEAD --` varlık ve lisans için exit 0; bu hash ayrıca K3P-07 üretim commit’i `c9dd5962` içindeki aynı varlığın yeniden hesaplanan SHA-256’sıyla eşleşti.
- `node tools/kao/kao-font-subset.mjs` exit 0: 12 kaynak dosya, içerikten 70 Arapça kod noktası + 35 zorunlu işaret/noktalama = 105 hedef kod noktası, 11 aralık.
- Yerel `fontTools 4.63.0` cmap okuması: cmap’te 105 tekil kod noktası; gereken 105/105 mevcut, eksik 0.

## CSS, service worker ve lisans

`app/kao.css:6` Scheherazade `@font-face` kuralı `font-display:swap`, `font-weight:400` ve `unicode-range: U+0600-06FF,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF` kullanıyor. CSS URL’si `?v=20261021a` olarak eşitlendi; `sw.js` manifest’indeki exact URL de aynı sürümü taşıyor. `swOfflineRequestKey` kontrolü ve `tests/app/test_iip_22.js` regresyonu exact CSS URL’sinin manifest anahtarı olarak çözüldüğünü doğruluyor; IIP-22 15/15 PASS.

`assets/kao/font/ScheherazadeNew-Regular.OFL.txt` mevcut, 4.495 bayt; SHA-256 `5b9fd21ce2377fc542debebd9edfe1c48f2d3525e78a2a8abdba4a0ec3280163`. Dosya SIL Open Font License 1.1’i ve SIL Global telif/Reserved Font Names bildirimini içeriyor.

30 zor glifin görsel karşılaştırması ve gerçek şekillendirme kabulü bu kartta yapılmadı; K3PD-29 kapsamıdır.

K3PD-27’nin ilk bağımsız incelemesi exact query uyumsuzluğu nedeniyle `PARTIAL` verdi. Kullanıcı onaylı dar CSS URL/test düzeltmesinden sonra `/root/k3pd27_audit` güncel diff’i salt-okur olarak yeniden denetledi ve PASS verdi; denetçi dosya yazmadı.
