# PANEL-01 — P0 Senkron Makbuzu ve Revision Prompt’u

## Amaç

Panelde “son kayıt” ile “uzak sunucu tarafından kabul edilmiş son snapshot”
ayrımını kur. Gerçek gecikme, revision, conflict ve hata görünürlüğünü
uygulama/panel sözleşmesine ekle.

## Önkoşul

- `PANEL-00` okunmuş olmalı.
- `PANEL-002` docs-index/docs-pack state’i kullanıcı tarafından onaylanmış olmalı.
- Operations ve State ledger’da aynı sequence bulunmalı.

## Zorunlu inceleme

- `app.js` `save()`, `SeyOnSynced`, `lastSyncDate`, root `savedAt`.
- `sync.js` `schedule`, `doPush`, `putLatestGuarded`, backup ve merge.
- `panel.html` `lastSavedAt`, `freshness`, `load`, `panelSig`.

## Yapılacaklar

1. `snapshotRevision`, `sourceUpdatedAt`, `submittedAt`, `acceptedAt`,
   `sourceLatestSha` ve güvenli `lastErrorCode` sözleşmesini tasarla.
2. Receipt’in token, raw payload veya kullanıcı metni içermediğini kanıtla.
3. Local callback ile server receipt’i birbirinden ayır.
4. Panel için `local`, `remote`, `projection`, `panelPoll` zamanlarını
   ayrı hesapla.
5. Conflict, anti-clobber, retry, offline ve permission durumlarını
   insan diline çeviren status map oluştur.
6. Mevcut sync güvenlik guard’larını koru; full-replace davranışını sessizce
   değiştirme.

## Kabul kapısı

- Başarılı push synthetic fixture’da revision ve acceptedAt gösterir.
- Anti-clobber senaryosu “veri kaybını önlemek için durduruldu” olarak görünür.
- Receipt yoksa panel “başarılı” iddiası kullanmaz.
- Eski snapshot alanları migration/fallback ile kırılmaz.
- Senkron testleri, panel testi ve syntax kontrolleri geçer.

## Ledger ve durma kuralı

İş bitince yeni `PANEL-###` kaydını iki ledger’a aynı sıra ile ekle. Kanıt
yoksa `ready_for_review` yaz; `completed` yazma. Rapor ver ve DUR.
