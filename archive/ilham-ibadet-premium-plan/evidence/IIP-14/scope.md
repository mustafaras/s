# IIP-14 kapsam kanıtı

Kart üretim kapsamı `app/core/prayer.js`, `app/core/saygi.js`, iki mevcut boundary fixture'ı ve yeni `tests/app/test_iip_14.js` ile sınırlı kaldı. Yayın entegrasyonunda bu değişen modüllerin cache-bust'ı `index.html`'de `20260921f` yapıldı; canlı HEAD ile eşleşmeyen eski app-surface/v3 pin fixture'ları ve IIP-03 app assertion'ı güncellendi. `app.js`, state/migration/sync, panel yüzeyleri ve veri şeması değiştirilmedi. Plan/evidence/state/ledger dosyaları teslim kaydıdır. Commit/push/deploy artık bu kullanıcı talimatıyla yetkilendirildi.
