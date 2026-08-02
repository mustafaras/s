# PANEL-05 — P2 Append-Only Event Log Prompt’u

## Amaç

Uygulama değişikliklerini source, zaman ve sıra bilgisiyle izlenebilir yapan
append-only event log’u ve panelin “Son Değişiklikler” veri kaynağını kur.

## Event sözleşmesi

`eventId`, `sequence`, `occurredAt`, `persistedAt`, `submittedAt`, `acceptedAt`,
`section`, `path`, `operation`, `summary`, `source`, `sourceDeviceId`,
`privacyClass`, `snapshotRevision` zorunlu alanlardır.

## Yapılacaklar

1. Anlamlı feature değişikliklerini sınıflandır; her micro render’ı event yapma.
2. Aynı event’in retry/merge/accepted kayıtlarını correlation ID ile grupla.
3. Günlük event dosyalarını append-only tut.
4. Ham token, raw GPS, raw profil ve base64 medya yazma.
5. Event sırası bozulduğunda panel alarm üret.
6. Projection event log olmadan da legacy snapshot ile açılabilsin.

## Kabul kapısı

- Sıra monotoniktir ve duplicate event idempotent işlenir.
- Event log kaybı latest snapshot’ı bozmaz.
- Panel son 20/50/100 event filtrelerini güvenle işler.
- Event ile ilgili snapshot/revision drawer’dan bulunabilir.

Kayıtları iki ledger’a ekle; event log dış servise yazıyorsa ayrıca kullanıcı
izni gerektiren sınırı belirt; sonra DUR.
