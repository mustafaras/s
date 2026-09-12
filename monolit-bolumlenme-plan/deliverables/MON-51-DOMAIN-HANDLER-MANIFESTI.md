# MON-51 — Domain handler manifest

## Karar ve uygulama

`SeymaAppSurface`, kapsam kararındaki 46 local UI handler için tek bir
`handler → mevcut domain registry` tablosu taşır. `app.js`, mevcut handler
fonksiyonlarını boot sonunda bir kez ilgili registry üstünde kaydeder; ardından
aynı `App.<name>` yüzeyi imza-nötr bir shim ile yalnız
`SeymaAppSurface.domainHandler()` yoluna gider. Böylece inline caller adları,
argümanlar ve return path korunur; ikinci bir domain registry ya da kopyalanmış
domain gövdesi oluşmaz.

`zikrManualApply`, zaten `SeymaZikr`in kanonik public API'si olduğundan
registration onu değiştirmez; dispatcher doğrudan bu mevcut API'ye gider.

## Kapsam ve sınır

Prayer 5, Zikir 4, Quran 12, Saygı 5, Motivation 6, Crisis 8 ve Journal 6
handler olmak üzere 46 isim `MON-51-HANDLER-SCOPE-KARARI.md` ile birebir
eşleşir. `fetchPrayerLocationGPS`, `refreshPrayerTimes`, Quran submit/watch/
question/refresh ve frozen outbox/delivery/WhatsApp akışları, `refreshSaygi`,
bildirim/izin, data rebind, `save`, `render`, DOM ve focus sahipliği kapsam
dışındadır ve app.js'te kalır.

## Kanıt

- `test_app_surface_domain_boundary.js`: **58/58** — cold-load, 46 tekil
  mapping, eksik/tekrar registration fail-closed, argüman/return aktarımı,
  public App shim ve yasak yol taraması.
- Ağsız tam regression: app **49** fixture, Quran **9**, current panel **23**,
  Panel-v2 **27**, reminder smoke **21**, driver, zikr **95/95**, B1/B2/B3,
  modularization **101/101**, state-rebind **37/37** ve Faz10 **69/69** PASS.
- `sync.js`, data şeması, frozen content/transport, panel kaynakları ve
  production data değişmedi. Browser/device, native permission, remote,
  push/merge/tag/deploy ve `mustafaras/seyma-data` yazımı yapılmadı.
