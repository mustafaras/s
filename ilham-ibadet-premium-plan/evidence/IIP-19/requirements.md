# IIP-19 gereksinim kanıtı

- REQ-037 / TC-037: Yer imi, okuyucu konumu ve program ilerlemesi için kararlı kimlik, şema sürümü, güncelleme zamanı, tombstone, merge sırası, eski istemci davranışı ve rollback senaryosu karar taslağında tanımlandı. Namaz migration kapsam dışıdır. Teknik testler Faz 10 senkronizasyonunda 69/69 ve MON-15 state-rebind'de 37/37 geçti. Sonuç: `pass` (şema kararı henüz approved değildir).
- REQ-038 / TC-038: Her önerilen alan için cihaz/data/panel/snapshot matrisi ve kullanıcı karar noktası kaydedildi. Özel not/tercih observer snapshot'a varsayılan olarak girmez. DEC-05 hâlâ `proposed`; alan sahibi kararı olmadan kalıcı uygulama başlamaz. Sonuç: `pending_review`.
