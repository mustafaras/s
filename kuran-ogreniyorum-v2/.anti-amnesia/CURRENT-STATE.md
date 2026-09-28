# KAO2 — CURRENT STATE

<!-- kao2-sync
nextCard: KAO2-06
lastSeq: 23
status: active
-->

Son güncelleme: 2026-09-28 · LEDGER seq23

## Şu an neredeyiz
KAO2-00…05 tamamlandı (6/28). KAO2-05 bileşen kütüphanesi P3 kapılarıyla yerelde tamamlandı. KAO2-03…04 için daha önce onaylanan Pages yayını/hash kanıtı korunuyor; KAO2-05 canlıya alınmadı.

## Sıradaki kartın tek cümlesi
Yalnız KAO2-06 geri bildirim paneli ve Devam akışını uygula; yeni yayın izni varsayma.

## Canlı gerçekler
- Dal `kao2-yeniden-tasarim`; bu kartın önceki commit'i `3d0b2a0`.
- Kaynak/test: 21 KAO fixture'ı, uygulama/panel/panel-v2/Kur'an aileleri, reminder smoke, iki headless sürücü, tasarım sözleşmesi, kontrast ve senkron kapıları PASS.
- Ölçümler KANIT.md'de: içerik gzip 158.372 KiB, quranLearn* runtime 53.770 KiB, CSS 7.329 KiB, VM p95 4.896 ms; kontrast 374 çiftte 0 eşik ihlali.
- Son onaylı yayın yalnız KAO2-03…04'tür; KAO2-05 ve sonrası için yayın yetkisi yoktur. Gerçek cihaz kabulü doğrulanmadı.
- `pages.yml` runtime-only paket kurar; KAO2 durum/kanıt belgeleri Pages paketine girmez.

## Açık riskler
- G1–G4, müfredat/metin, ses/lisans, uzman ve cihaz kararları kendi kapılarına kadar açık kalır.
- KAO2-05 için görsel/tarayıcı veya gerçek cihaz kabulü yapılmadı; KAO2-06 sonraki iş kalemidir.

## Bekleyen kullanıcı işleri
- KAO2-06'yı tek başına yürüt ve kart sonunda dur; yayın için ayrıca onay bekle.
