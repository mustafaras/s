# IIP-14 inceleme

## Bulgular

1. **IIP14-REV-01 — çözüldü:** İlk state kaydında dosya yolları yanlışlıkla `resourceLocks` alanına yazıldı. `plan-check` fail-closed reddetti; yollar `locks/plannedWriteFiles` içinde bırakılıp `resourceLocks=[]` yapıldı.
2. **IIP14-REV-02 — kapsam dışı mevcut drift:** geniş `tests/app` taramasında beş app-surface/v3 fixture'ı canlı HEAD'deki `app.js` cache-bust pininden geride bulundu. IIP-14 kaynaklarıyla ilişkili değildir ve izinli dosyalara dokunulmadı.
3. **IIP14-REV-03 — beklenen tarihsel fixture devri:** `test_iip_03.js`, app paydasının IIP-14'e kadar çözümsüz kalacağını pinliyor. IIP-14 bu app tarafı devrini bilinçli olarak çözdüğü için eski assertion artık geçersizdir; IIP-03 kanıtı geriye dönük değiştirilmedi.

Açık kritik: 0. Açık yüksek: 0. Migration, ağ, storage, save veya yeni handler yok.
