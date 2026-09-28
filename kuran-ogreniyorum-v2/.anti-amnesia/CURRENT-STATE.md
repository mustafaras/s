# KAO2 — CURRENT STATE

<!-- kao2-sync
nextCard: KAO2-05
lastSeq: 21
status: active
-->

Son güncelleme: 2026-09-28 · LEDGER seq21

## Şu an neredeyiz
KAO2-00…04 tamamlandı (5/28). KAO2-04 tüm P3 kapılarıyla yerelde kapandı. Kullanıcı KAO2-03…04'ü canlıya alma isteğini açıkça verdi; yayın yetkisi seq21'de kaydedildi ve Pages/byte doğrulaması bekleniyor.

## Sıradaki kartın tek cümlesi
KAO2-04 Pages yayını ve canlı hash eşliği doğrulanınca KAO2-05 bileşen kütüphanesini uygula; bu kartı ayrıca yayımlama.

## Canlı gerçekler
- Dal `kao2-yeniden-tasarim`; `HEAD=e53486f5`, `origin/main=a488e5cc`, `origin/kao2-yeniden-tasarim=40ffe74e`; yerel dal main'den dört fast-forward commit ileride.
- Release scope: KAO2-03 ve KAO2-04. Açık kullanıcı onayı branch push + main fast-forward + Pages deployment'ı ve canlı byte/hash doğrulamasını kapsıyor; KAO2-05 ve sonrası hariç.
- Kaynak/test: P3 PASS; KAO2-04 ölçümleri ve test makbuzu `evidence/KAO2-04/KANIT.md` içinde.
- Önceki yayın yalnız KAO2-00…02, commit `5aff0012`; bu yeni yayının yerine geçmez.
- `pages.yml` runtime-only paket kurar; `kuran-ogreniyorum-v2/`, testler ve kanıtlar Pages paketinden hariçtir.

## Açık riskler
- Canlı dağıtım henüz oluşmadı; Actions sonucu ve yayımlanan dosyaların yerel SHA-256 eşliği doğrulanmalı. Gerçek cihaz kabulü bundan ayrı kalır.
- `releaseApproval` seq21 onayıyla KAO2-04'e kadar genişletildi; sonraki kart yerel-only.
- G1–G4, müfredat/metin, ses/lisans, uzman ve cihaz kararları kendi kapılarına kadar açık kalır.

## Bekleyen kullanıcı işleri
- Release doğrulanınca sıradaki tek kart KAO2-05'i yürüt; kart sonunda dur ve yeni release izni varsayma.
