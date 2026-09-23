# IIP-02 kaynak ve sınır baselini

Tarih: 2026-09-19
Kart: IIP-02
Canlı HEAD: `03a8544` (`03a854475e98c5afd7cadf2ee670425ebb7c62c`)

Bu dosya salt-okur kaynak incelemesidir. IIP-02’nin üretim ve test allowlist'i boş olduğu için `app/` veya `tests/` altında değişiklik yapılmadı. A sütunu kaynak davranışını ve mevcut yüzeyleri tarif eder; gerçek ekran görüntüsü değildir.

## Mevcut sahiplik

- İlham & İbadet hub'ı ve beşli iç navigasyon: `app/core/saygi.js:239-243`; shell geçişi `app.js:3979`.
- Öncü koleksiyonu ve okuyucu overlay'i: `app/core/saygi.js:177,243`; `#sey-ov-card` / `#sey-ov-body`.
- İman/kıble kartları ve overlay: `app/core/saygi.js:176,184-234`; `app.js:4037,6047`.
- Zikir önizlemesi ve tam ekran sayaç: `app/core/zikir.js:614`; `app/core/render.js:1406-1424`; mevcut v2 yüzeyi ve durumları korunacak.
- Kur'an yolculuğu: `app/core/render.js:1427-1473`; `app.js:5725,5949-6005`.
- Rapor/ısı haritası: `app/core/saygi.js:214-215,239`; gün ayrıntısı `app.js:3980-3984`.

## Kullanılabilir üretim tokenları

`app/styles.css:214-365` açık tema için `--bg`, `--card-solid`, `--text`, `--text2`, `--muted`, `--accent`, `--accent-ink`, `--field`, `--field-bd`, `--gold-1..5`, `--f-*`, `--dur-1..5` ve `--ease-*` tanımlarını taşır. `app/styles.css:368-438` koyu temadaki karşılıkları ve zikir/kur'an/kıble yüzey tokenlarını taşır. IIP-02 tasarımı bu tokenları yeniden kullanır; yeni öneri alias'ları kod değişikliği olarak eklenmez.

Mevcut kodda ayrıca izlenecek iki risk vardır:

1. `app/core/settings.js` içinde bazı inline `border-radius`, `padding` ve doğrudan renk örnekleri bulunur. IIP-02 bunları sessizce değiştirmez; token haritasında migration notu olarak açıklar.
2. `app/core/saygi.js:170` kaynak bağlantısı için doğrudan bir renk tonu üretir. Hedef tasarım bu rolü içerik türü tokenına bağlar; bunun gerçek CSS'e taşınması sonraki üretim kartının işidir.

## Kanıt sınırı

Bu baselin browser, cihaz, VoiceOver, gerçek kullanıcı görevi veya üretim render'ı kanıtı değildir. IIP-02 artifact'i `prototype` türündedir. Gerçek render kanıtı, tasarım kararı onaylandıktan sonra ilgili üretim kartında alınacaktır.
