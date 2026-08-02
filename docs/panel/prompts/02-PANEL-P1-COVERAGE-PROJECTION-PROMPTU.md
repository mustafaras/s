# PANEL-02 — P1 Coverage Manifest ve Observer Projection Prompt’u

## Amaç

Uygulamadaki her kalıcı alanın paneldeki durumunu görünür kıl: `full`,
`summary`, `redacted` veya `missing`. Panelin ham latest state’i dağınık
yorumlamak yerine güvenli ve küçük bir observer read-model tüketmesini sağla.

## Önkoşul

`PANEL-01` kabul edilmiş veya State ledger’da açıkça `ready_for_review` olarak
kanıtlanmış olmalı.

## Envanter

- `data` kök alanları ve `migrate()` backfill’leri.
- `days[date]` tüm alt alanları.
- `data/quran-*`, observer inbox/outbox, media metadata ve backup kanalları.
- Panelde `D.` referansı olmayan alanlar.

## Yapılacaklar

1. `panelCoverageManifest` şemasını oluştur.
2. Her yol için owner/source/privacy sınıfı ve fallback davranışı tanımla.
3. `observer-snapshot.json` projection sözleşmesini hazırla.
4. Secret, raw profile, raw GPS ve base64 media redaction’ını test et.
5. Projection yok/bozuk/stale olduğunda fail-closed fallback tasarla.
6. Projection üretimini latest yazımından ayır; panel latest’e yazmasın.

## Kabul kapısı

- Sentetik fixture’daki tüm kalıcı alanlar sınıflandırılır.
- Manifestteki `missing` alanlar bilinçli ve listelenmiş olur.
- Projection parse hatası tüm paneli boşaltmaz.
- Raw secret/hassas veri JSON veya DOM’a giremez.
- Legacy latest ile projection arasında güvenli uyumluluk testi vardır.

## Dur

Projection sözleşmesi kodlanmış olsa bile kullanıcı onayı olmadan gerçek
workflow veya dış servis yazımı yapma. İki ledger’a aynı sequence’i ekle,
kanıtları raporla ve DUR.
