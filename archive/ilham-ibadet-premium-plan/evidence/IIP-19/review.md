# IIP-19 yeniden inceleme

### I1 / I3 / I5 eşlemesi

| Sözleşme | IIP-19 kararı | Uygulama durumu |
|---|---|---|
| I1 veri şekli | Tek `data` kökü altında sürümlü, adlandırılmış namespace; kararlı `id` ve `schemaVersion` | Öneri; kod yok |
| I3 migration | Eski kök korunur; yeni namespace için idempotent ileri migration, fiziksel silme yok | Bu kartta migration yok |
| I5 ağ/sync | Mevcut sync akışına ikinci depo eklenmez; merge/tombstone sözleşmesi onaylanmadan yazma yok | Öneri; kod yok |

### Çatışma ve geri alma

- Merge anahtarı alanın kararlı kimliğidir; daha yüksek `revision` kazanır, eşitte daha yeni `updatedAt`, yine eşitte deterministik `deviceId`/payload özeti kullanılır. Cihaz saati tek başına otorite değildir; saat geriye giderse revision düşmez.
- Tombstone `{id, deletedAt, revision, updatedAt}` olarak korunur; eski istemci silinmiş kaydı yeniden diriltemez. Fiziksel temizlik ayrı retention kararıdır.
- Eski istemci bilmediği namespace'i yazarken düşürmemelidir; mevcut bilinmeyen alan koruma testi referans alınır. Uyumlu olmayan tam-replace istemci tespit edilirse yazma fail-closed olur.
- Rollback kodu önceki sürüme dönse bile yeni alanları silmez; migration yalnız ileri ve idempotent olur. Gerekirse bilinen son veri snapshot'ı geri yüklenir; merge kanıtı olmadan otomatik restore yapılmaz.

Açık karar: DEC-05 kullanıcı tarafından onaylandı. IIP-20 yalnız tanımlanan namespace, merge/tombstone ve redaction sınırları içinde başlatıldı. Açık kritik veya yüksek teknik bulgu yoktur.
