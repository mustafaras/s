# PANEL-03 — P1 Eksik Kök Modüller Prompt’u

## Amaç

Panelde hiç görünmeyen veya günlüklerden hatalı şekilde yeniden türetilen kök
modülleri canonical projection üzerinden görünür hale getir.

## Hedef alanlar

1. `data.dailyPhoto`: başlık, sanatçı, lisans, kaynak, pageUrl, fetchedAt,
   cache/stale/hata durumu.
2. `data.roomContentHistory`: gün, gösterilen kitap/izleme/ses öğesi,
   shownAt ve kaynak.
3. `data.saygi`: collection, streak, lastReadDate; günlük read kanıtıyla
   karşılaştırma.
4. `data.locNudge`: shown/dismiss/snooze/backoff/opt-out audit’i.
5. `data.locationLastTs`: örnek, işleme ve senkron zaman ayrımı.
6. `data.lastOpenedDate`, root `savedAt` ve ayar değişiklikleri.

## Kurallar

- Panel render sırasında kaynağa geri yazan backfill yapılmamalı.
- Türetilmiş değer source value’dan ayrı etiketlenmeli.
- Günlük konum track’i raw olarak basılmamalı.
- Günün fotoğrafı lisans/kaynak olmadan “hazır” görünmemeli.
- Saygı root ile daily evidence uyuşmazlığı ayrı alarm olmalı.

## Kabul kapısı

- Her hedef alan için dolu, eski, yok ve bozuk fixture render edilir.
- Kök ve günlük Saygı farkı gösterilebilir.
- Panel projection’ı mutate etmez.
- Privacy/redaction ve source badges görünürdür.

Ledger’ları eş sequence ile güncelle, test sonucunu yaz, sonra DUR.
