# IIP-19 kalıcı veri ve paylaşım kararı

## Alan matrisi

| Alan | Cihaz/data | Sync/merge | Panel/snapshot | Kullanıcı kararı |
|---|---|---|---|---|
| Yer imi | `data` altında sürümlü `bookmarks` namespace'i | `bookmarkId` + revision; tombstone korunur | Varsayılan dışı; yalnız açık aggregate | Gerekli |
| Okuyucu konumu | `data` altında kaynak kimliğiyle konum | Kaynak kimliği + monotonic revision; saat tek otorite değil | Varsayılan dışı; ham konum paylaşılmaz | Gerekli |
| Program/yolculuk ilerlemesi | `data` altında sürümlü `programs` namespace'i | Event/ilerleme union; tamamlanma geriye çevrilmez | Yalnız açık özet; özel ayrıntı yok | Gerekli |
| Özel düşünme notu | Bu kartta yok | Sync edilmez | Snapshot'a girmez | Ayrı karar |
| Namaz kayıtları | Mevcut alanlar | Migration yok | Mevcut anlam korunur | Ayrı prayer ADR |

## Onay durumu

DEC-05 öneridir. Bu belge şema uygulama izni değildir; state/migration/sync/panel koduna geçiş ancak kullanıcı kararı, rollback kanıtı ve eski istemci testiyle ayrı kartta yapılabilir.
