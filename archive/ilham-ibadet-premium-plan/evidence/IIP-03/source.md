# IIP-03 kaynak kapısı

Kaynak ve sentetik contract kanıtı:

- `app/core/prayer.js:11-12,92-102,154,166`: altı tarihsel alan, boş kayıt normalizasyonu, bağımsız Fajr/Sunrise mapping ve mevcut summary davranışı.
- `app/core/state.js:279`: migration sırasında mevcut günlerin prayer normalizer'ından geçmesi.
- `app/core/saygi.js:154-157,215`: mevcut `dayCount*6` hesabı ve yalnız kopya düzeltmesi.
- `panel/panel.js:408-421,610-619,4306,4331`: panel alanları, summary ve mevcut `days*6` hesabı; eşleşen kopya düzeltmesi.
- `tests/app/test_iip_03.js`: 14 sentetik source/contract kontrolü; kişisel veri okumaz.

Source gate sonucu: PASS. `node --check`, IIP-03 testi, mevcut Saygı sınırı ve prayer sınırı testleri temiz geçti. Ayrıntılı komut makbuzu `commands.md` içindedir.
