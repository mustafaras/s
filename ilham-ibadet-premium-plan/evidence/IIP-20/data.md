# IIP-20 veri kanıtı

## Şema

`bookmarks.items[]` kayıtları `bookmarkId`, `contentId`, `contentRevision`, numeric `revision`, `updatedAt`, `deviceId`, `tombstone` taşır. `reader.preferences` numeric revision’lı tercih kaydıdır. `reader.positions[contentId]` ayrıca içerik `revision` string’i, `writeRevision`, `blockId`, `ratio`, `updatedAt` ve `deviceId` taşır. `programs.items` aynı union/revision kuralını izler.

## Birleştirme ve geri alma

Birleştirme önce numeric revision, sonra updatedAt/deviceId ile deterministic winner seçer; tombstone kaybolmaz. Eski istemci bookmarks/reader/programs göndermediğinde local namespace korunur. İçerik revision uyuşmazlığında konum uygulanmaz; kullanıcı güvenli başlangıca döner. Kod geri alınsa bile yeni alanlar additive olduğu için eski istemci mevcut veriyi silemez; gerekirse namespace tombstone’larıyla kontrollü geri alma yapılır.

Kanıt yolları: migration=`evidence/IIP-20/data.md`, conflict=`evidence/IIP-20/requirements.md`, rollback=`evidence/IIP-20/data.md`.
