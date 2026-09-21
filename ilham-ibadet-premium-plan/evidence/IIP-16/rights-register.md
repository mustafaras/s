# IIP-16 hak kontrol kuyruğu

Bu kayıt hukuki izin vermez; yalnız kontrolün yapılacağı alanları tanımlar.

| Grup | Kaynak adayı | Hak durumu | Gerekli insan eylemi |
|---|---|---|---|
| 10 öncü | `app/content/saygiPeople.js` kimlik/metaverisi; biyografi kaynağı henüz seçilmedi | pending | kaynak URL, lisans, erişim tarihi ve iddia kanıtı |
| 12 dua/âyet | `app/content/quranStrikingVersesV1.js` mevcut aday kimlikleri | pending | meal/translation attribution, Arapça karşılaştırma ve yeniden kullanım kapsamı |
| 6 tema | `sourceCandidates` ile mevcut doğrulanmış kataloglara bağlanan editoryal köprü | pending | her tema için kaynak bağlamı, lisans/attribution, editör ve alan incelemesi |

Kaynak geri çekilirse aday `withdrawn` olur; geçmiş okuma kaydı silinmez.

## Codex ön inceleme notu — 2026-09-21

Bu tablo hukuki izin vermez ve lisans kararı üretmez. Manifestte 6 tema için
`type=theme` ile kayıt-başı `rightsEvidence`, `editorReview`, `domainReview`
ve `reviewerDecision` alanları artık mevcut; değerler bilinçli olarak
`pending`/`null`. İnsan hak kontrolörü ile yetkin alan inceleyicisi atanıp
kanıtları imzalamadan `rights_checked`, `approved` veya `published` geçişi
yapılmayacak.
