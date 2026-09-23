# IIP-21 veri kanıtı

Program kaydı `programs.items.iip21-seven-day-pilot` altında additive tutulur: `status`, `contentVersion`, yedi `contentIds`, `completedDays`, `startedAt`, `pausedAt`, `completedAt`, `revision`, `updatedAt` ve `deviceId`.

İlerleme takvim gününden türetilmez; ilk tamamlanmamış durak seçilir. Aynı durak kimliği ikinci kez gelirse revision artmaz. `finish` yalnız yedi gün tamamlandıktan sonra status’ü `completed` yapar. Katalog sürümü değişirse kayıt korunur ve UI açık sürüm uyarısı verir; geçmiş günler/yer imleri silinmez.

Karar: `DEC-05` approved. Migration kanıtı `evidence/IIP-21/data.md`; conflict/rollback davranışı `evidence/IIP-21/requirements.md` ve `evidence/IIP-20/data.md` ile izlenir.
