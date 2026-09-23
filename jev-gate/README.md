# JEV-GATE — TypeSafe/Jev başlangıç kapısı

Bu dizin, Şeyma'da Jev kullanımını üretim kodundan önce güvenlik ve ürün
kararlarına bağlayan küçük kontrol düzlemidir. Mevcut aşama **Gate 0 /
discovery**'dir; herhangi bir API çağrısı, SDK bağımlılığı veya kullanıcı verisi
aktarımı yapmaz.

## Neden ayrı bir kapı var?

Şeyma statik GitHub Pages uygulamasıdır. Bir TypeSafe API anahtarı tarayıcıya,
repo kaynaklarına, localStorage'a veya senkronize `data` nesnesine konamaz.
Jev yalnızca dar, typed bir yargı için ve sunucu tarafı bir aracı üzerinden
kullanılabilir. Kod; kesin kuralları, izinleri, eşikleri ve eylemi sahiplenmeye
devam eder.

## Gate 0 sözleşmesi

- Seçilmiş kullanım amacı yoktur; `selectedUseCase` değeri `null` kalır.
- Ağ ve canlı çıkarım kapalıdır.
- Gerçek/kişisel veri kullanımı kapalıdır.
- API anahtarı ve SDK tarayıcı yüzeylerine giremez.
- Sağlık/psikoloji teşhisi, tedavi kararı, kriz kararı ve dinî hüküm Jev'e
  devredilemez.
- Sonuç hiçbir zaman yazma, bildirim, senkronizasyon veya başka dış etki için
  tek başına yetki sayılmaz.

## Çalıştırma

```sh
node jev-gate/tools/jev-gate.mjs
node tests/jev-gate/test_jev_gate.js
```

İlk komut sözleşmeyi ve mevcut tarayıcı yüzeylerini denetler. İkinci komut,
kapının güvenli sözleşmeyi kabul edip anahtar/istemci sızıntısını reddettiğini
sentetik fixture'larla doğrular.

## Bir sonraki karar

Gate 1'e geçmeden önce tek bir düşük riskli davranış seçilmelidir. Aday örnekler:

1. Kullanıcının açık isteğini mevcut, sabit uygulama bölümlerinden birine yöneltme
   (`Choice`, mutlaka `no_match` seçeneğiyle).
2. Kullanıcının seçtiği içerik adaylarını yeniden sıralama; içerik üretmeme ve
   otomatik eylem yapmama.
3. Bir metnin önceden tanımlanmış güvenlik/escalation koşulunu taşıyıp taşımadığına
   dair yardımcı sinyal; deterministik kriz kuralları her zaman üstün kalır.

Seçim yapılmadan endpoint, SDK veya proxy kodu eklenmez. Gate 1 ayrıca veri
minimizasyonu şeması, sentetik değerlendirme seti, hata fallback'i, eşikler ve
sunucu tarafı secret sınırı istemelidir.

