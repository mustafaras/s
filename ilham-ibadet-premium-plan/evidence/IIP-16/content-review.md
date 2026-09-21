# IIP-16 içerik inceleme defteri

Bu dosya 28 pilot adayının tamamı için aynı zorunlu alanları açıkça bırakır. Boş reviewer veya hak kanıtı PASS değildir.

## Durum sözlüğü

`draft` = metin/bağlam üretilecek; `sourced` = kaynak adayı kaydedildi; `rights_checked` = hak kanıtı insan tarafından kontrol edildi; `domain_review` = alan incelemesi tamamlandı; `approved`/`published` yalnız tüm önceki kapılar geçince kullanılabilir. `needs_revision` ve `withdrawn` geçmişi silmeden katalogdan çıkarır.

## Zorunlu kayıt alanları

Her aday için: içerik id, sürüm, tür, dil, yazar/özgün bölüm, asıl kaynak, iddia kanıtları, alıntı/meal/okunuş/yorum ayrımı, hak/izin kaynağı, editör/tarih/karar, alan inceleyicisi/tarih/karar, düzeltme, kullanıcı atfı, katalog/cache sürümü ve geri çekme yolu.

## İnsan incelemesi kuyruğu

`pilot-catalog.json` içindeki 28 kaydın tamamında `editorReview`, `domainReview`, `rightsEvidence` ve `reviewerDecision` alanları bilinçli olarak `pending`/`null`dır. Bu, eksiklik değil güvenlik kapısıdır: insan incelemesi yapılmadan içerik yayımlanamaz.
