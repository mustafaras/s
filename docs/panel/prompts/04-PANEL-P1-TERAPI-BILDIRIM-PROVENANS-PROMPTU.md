# PANEL-04 — P1 Terapi, Bildirim ve Provenance Prompt’u

## Amaç

Seçili gün özetinin ötesine geçerek terapi araçları, bildirim yaşam döngüsü,
profil ilerlemesi ve tüm önemli metriklerin kaynak sınıfını güvenli biçimde
izlenebilir yap.

## Terapi kapsamı

- `therapy.thoughts[]`: sayı + güvenli özet + zaman; raw hassas metin için
  consent/redaction.
- `therapy.decision`: seçim, tamamlanma ve karar notu sınırı.
- `therapy.share`: gönderim, teslim ve paylaşım metadata’sı; not varsayılan
  gizli.
- `sleep.windDown.events[]`: event tipi ve süre; gerekli ise yalnız agregat.

## Bildirim kapsamı

- oluşturuldu,
- inbox’a yazıldı,
- cihaza ulaştı,
- okundu/görüldü,
- silindi,
- sync edildi,
- retry/error.

`synced`, `receivedAt`, `readAt`, `answerReadAt` ve observer receipts tek
timeline üzerinde ilişkilendirilmeli.

## Provenance

Her metrik veya event şu sınıflardan birini taşımalı: `user_input`, `derived`,
`external`, `delivery`, `observer`, `redacted`.

## Kabul kapısı

- Raw profil response ve terapi hassas metni varsayılan DOM’a girmez.
- Bildirim “iletildi” ile “okundu”yu karıştırmaz.
- Dış kaynak fetch hatası veri yokmuş gibi gösterilmez.
- Source/time/privacy badge’leri tutarlıdır.

İki ledger’da eş sequence kaydı aç, gerçek test kanıtını ekle ve DUR.
