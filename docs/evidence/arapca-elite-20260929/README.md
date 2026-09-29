# Arapça sekmesi · rehberli premium görünüm

2026-09-29 kullanıcı isteği: Arapça sekmesinin tamamını daha özenli, akıcı ve yeni başlayanların rahat takip edeceği biçimde tasarlamak. Kaynak commit `4dbc89db`; GitHub Pages'te yayımlandı. Yayın kanıtı [YAYIN.md](YAYIN.md). KAO2-13 başlatılmadı.

## Tasarım ve kapsam

- Lacivert ders kapağı (#1C3A5F), fildişi okuma yüzeyi (#FFFDF8), altın başlık vurgusu (#E6CE8A) ve koyu altın etiketler (#7D5F18); koyu tema mevcut IIP tokenlarından gelir.
- Kapakta Georgia, içerikte uygulamanın sistem yazı ailesi. Başlık, açıklama ve yardımcı metinler ayrı boyut/ağırlıklarla düzenlendi.
- Ders eylemi açıklamalardan önce gelir. Mevcut KAO kartı bir kez çağrılır; gerçek Başla/Devam/Aç/Tekrar et durumu, süre ve ilerleme korunur. Kartın görünmediği durumda ölü düğme yerine durum açıklaması vardır.
- Dört dar sütun yerine tüm genişliklerde dikey öğrenme yolu: Tanış → Anla → Pekiştir → Uygula. Bu yol yöntem anlatımıdır; kullanıcı ilerlemesi gibi işaretlenmez.
- Yeni başlayanlar için açıklama ve üç yerel `details/summary` yardım bölümü. Yeni App handler, kalıcı veri, ağ isteği veya içerik modülü eklenmedi. Ders motoru ve ders pencereleri değiştirilmedi.
- `app/core/saygi.js`, `app/styles.css`; bu iki varlığın index/SW pini `20260929c`. Mevcut cache beklentileri ve IIP-09 görünüm sözleşmesi güncellendi.

## Doğrulama

- `tests/app/test_*.js`: 77/77 PASS; IIP-09 34/34, IIP-22 13/13.
- KAO hub 8/8; bağımsızlık ve render fixture'ları PASS.
- Projenin `run-seyma` headless driver'ı PASS; zikir/ibadet harness'i 95/95 PASS.
- `node --check app.js`, `sync.js`, `app/core/saygi.js`; `git diff --check` PASS.
- Apple kontrast kapısı: 30 token, 0 ihlal. Yeni yüzeyin hesaplanmış metin renkleri: açık 31 çift, en düşük 5.52:1; koyu 31 çift, en düşük 7.53:1. Dekoratif şekiller bu metin ölçümünün dışında.
- Ağsız statik görünüm: iki tema × 320/390/512/1280 px × %100/%200 yazı = 16 senaryo, yatay taşma yok. Düğme en az 48 px, yardım başlıkları en az 44 px. Devam/tamamlandı/gece tekrarı ve ilerleme halkası 320 px/%200 koşulunda da taşmıyor.
- Yerel açılır yardım fare ve Enter ile çalışıyor. Azaltılmış hareket tercihi, forced-colors emülasyonu ve tarayıcı hata kontrolü PASS. Uygulamanın genel azaltılmış hareket kuralı geçişleri 0.001 ms ile sınırlar.
- KAO2 senkronu PASS; sıra KAO2-13, ledger seq52.

## Görsel kanıtın sınırı

[Açık tema](light.png) ilk başlangıç örneğini, [koyu tema](dark.png) sentetik %40 ilerlemeli devam örneğini gösterir. Gerçek kullanıcı verisi değildir.

`render-check.cjs`, üretim Saygı ve KAO görünüm fonksiyonlarını Node VM'de çalıştırarak yalnız HTML/CSS üretir. Tarayıcıya `setContent` ile statik örnek aktarılır; ağ istekleri reddedilir, service worker engellenir ve CSP betikleri engeller. `app.js`/`sync.js` yüklenmez; sunucu, canlı site, kullanıcı profili ve gerçek localStorage kullanılmaz. Bu, uygulama veya gerçek cihaz kabulü değildir. Ayrıntılar `layout.log` içindedir.

Tekrar üretmek için Playwright'ın kurulu olduğu ortamda:

```sh
node docs/evidence/arapca-elite-20260929/render-check.cjs
```

Playwright farklı yerdeyse `SEYMA_PLAYWRIGHT_MODULE` değişkeni kurulu modülün yolunu gösterebilir. Betik paket indirmez; görselleri kendi kanıt klasörüne yazar.
