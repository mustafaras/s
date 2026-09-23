# IIP-21 kapsam kanıtı

IIP-21, IIP-17’deki insan doğrulamalı `QuranStrikingVersesV1` kayıtlarından yedi duraklı tek pilot program ekler. Üretim değişiklikleri yalnız `app/core/state.js`, `app/core/saygi.js` ve `app.js` üzerindedir; `render.js` köprüsü ve sync sözleşmesi değiştirilmemiştir. Test kanıtı `tests/app/test_iip_21.js` içindedir.

Yeni dış kaynak, namaz migrationı, canlı kullanıcı verisi veya offline paket indirme akışı eklenmedi. Program içeriği katalog kimliklerine bağlıdır; içerik sürümü değişince ilerleme silinmez veya çoğaltılmaz.
