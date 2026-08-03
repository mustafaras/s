# PANEL-REVIZE-PLANI/prompts/ — Session Prompt Kataloğu

> Bu klasör, ÆON panel revizyonunu parça parça, farklı AI agent session'larında bile kesintisiz sürdürebilmek için hazırlanmış **sıralı ve bağımsız prompt'ları** içerir.

## Nasıl kullanılır

1. **Her yeni session'da önce** `P0-SESSION-START.md` verilir.
2. Daha sonra o sırada gelen fazın prompt dosyası (`P1-…`, `P2-…`, …) verilir.
3. Her prompt, kendi içinde **önceki fazın tamamlanmış olup olmadığını kontrol eder**; eksik varsa blocker yazdırır.
4. Tüm prompt'lar `PANEL-REVIZE-PLANI/panel-revize-state.json` üzerinden konuşur.

## Prompt dosyaları

| Sıra | Dosya | Verildiği durum |
|------|-------|-------------------|
| 0 | [P0-SESSION-START.md](P0-SESSION-START.md) | Her yeni session'ın ilk prompt'u. State okur, son durumu raporlar. |
| 1 | [P1-FAZ-0-HAZIRLIK.md](P1-FAZ-0-HAZIRLIK.md) | Faz 0 görevleri: `panel-v2.html`, `panel-v2.css` skeleton, `panel-v2.js` IIFE, adapter, state init. |
| 2 | [P2-FAZ-1-SEKME-ISKELETI.md](P2-FAZ-1-SEKME-ISKELETI.md) | Faz 1: 5 ana sekme, topbar, placeholder, test fixture. |
| 3 | [P3-FAZ-2-GENEL-BAKIS.md](P3-FAZ-2-GENEL-BAKIS.md) | Faz 2: Genel Bakış hero kartları, 7 günlük trend strip, hızlı notlar. |
| 4 | [P4-FAZ-3-TRENDLER.md](P4-FAZ-3-TRENDLER.md) | Faz 3: Trend summary kartları, anomali tespit ve anomali listesi. |
| 5 | [P5-FAZ-4-GUN-DETAYI.md](P5-FAZ-4-GUN-DETAYI.md) | Faz 4: Gün Detayı seçici, kategorize bölümler, redaction, test. |
| 6 | [P6-FAZ-5-ARSIVLER.md](P6-FAZ-5-ARSIVLER.md) | Faz 5: Arşivler alt sekmeleri, listeleme, pagination, test. |
| 7 | [P7-FAZ-6-SISTEM-MESAJLAR.md](P7-FAZ-6-SISTEM-MESAJLAR.md) | Faz 6: Sistem sekmesi, status badge, audit, inbox/outbox, ayarlar. |
| 8 | [P8-FAZ-7-POLISH.md](P8-FAZ-7-POLISH.md) | Faz 7: Design system tutarlılık, animasyon, responsive, a11y. |
| 9 | [P9-FAZ-8-TEST-KABUL.md](P9-FAZ-8-TEST-KABUL.md) | Faz 8: Tüm fixture'lar, veri doğruluğu karşılaştırması, kabul audit'ı. |
| 10 | [P10-FAZ-9-GECIS-DEPLOY.md](P10-FAZ-9-GECIS-DEPLOY.md) | Faz 9: Eski panel yedekleme, rename/cache-bump/deploy. |
| — | [PX-YARDIMCI-PROMPTLAR.md](PX-YARDIMCI-PROMPTLAR.md) | Debug, veri karşılaştırması, rollback, data safety hatırlatma. |

## Önemli kural

- Her prompt sonunda **mutlaka** `panel-revize-state.json` güncellenir.
- Bir sonraki session, `P0-SESSION-START.md` ile başlar ve state'den devam eder.
- Prompt'lar bağımsızdır ama `dependsOn` kontrolü sayesinde sırayı bozmaz.

---

Sonraki adım: [P0-SESSION-START.md](P0-SESSION-START.md)
