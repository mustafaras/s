# ÆON Paneli — PANEL-09 D2 Command Center ve Sync Ribbon

**Sequence:** `PANEL-011`
**Durum:** `completed`
**Tarih:** 2026-08-03
**Önkoşul:** D0 wireframe + D1 semantic token/component sözleşmesi

Bu teslimat ilk ekranı marka, canonical durum, senkron kanıtı ve hızlı
yönlendirme yüzeyi olarak düzenler. Dark/gold ÆON kimliği korunur; status
semantiği D1 token’larından gelir.

## 1. İlk ekran sözleşmesi

```text
ÆON command header
  → canonical status + yeni değişiklik chip’i
  → sync ribbon: local / remote / projection / panel poll
  → Ruh / Beden / Süreklilik / Senkron hero’ları
  → sakin risk / stale / conflict / error bandı
  → coverage özeti
  → tarih + pencere + bölüm navigasyonu
  → feature ve audit kartları
```

Header üç ayrı katmandır:

| Katman | İçerik | Semantik |
|---|---|---|
| Marka | ÆON + Observer · Command Center | Kimlik; durum iddiası değildir |
| Canonical status | Receipt/revision temelli tek ana badge | `ok`, `pending`, `warning`, `danger`, `muted` |
| Eylem | Yenile, yoğunluk, tarih/pencere, çıkış | ARIA label + 44px hedef |

## 2. Canonical status ve sync ribbon

`canonicalStatusP()` yalnız `syncStatusP()` receipt’i ve projection reason’ı
üzerinden karar verir. `accepted` ancak `acceptedAt` ve `sourceLatestSha`
whitelist receipt’te mevcutsa başarıya çıkar. Ribbon şu dört zamanı ayrı tutar:

- Yerel kayıt (`sourceUpdatedAt`),
- Uzak kabul (`acceptedAt`),
- Projection (`projectionBuiltAt`),
- Panel çekimi (`PANEL_POLL_AT`).

Revision, görünür revision, conditional/ETag modu ve güvenli SHA prefix’i
ayrıca gösterilir. `missing`, `stale`, `conflict` ve `error` farklı badge/note
durumlarıdır; eski görünüm güncel başarı gibi boyanmaz.

## 3. Dört durum hero’su

| Hero | Karar cümlesi | Kaynak |
|---|---|---|
| Ruh | Seçili günün duygusu ve günlük ritmi ne durumda? | mood + journal streak |
| Beden | Uyku, su ve enerji bedensel zemini taşıyor mu? | sleep/water/energy aggregate |
| Süreklilik | Kayıt ritmi devam ediyor mu? | streak + kayıt günü + oturum |
| Senkron | Panelin gördüğü veri canonical olarak kabul edildi mi? | receipt + revision + projection |

Eski çoklu KPI sayıları kaybolmaz; `d2-detail-metrics` altında ayrıntı
yoğunluklarına taşınır. Hızlı modda gizlenir, Standart/Audit modlarında
erişilebilir kalır.

## 4. Yeni değişiklik chip’i

Polling turunda önceki event kimlikleriyle yeni event kimlikleri karşılaştırılır.
Yeni veri geldiğinde header’da `N yeni değişiklik` chip’i görünür. Render
otomatik scroll yapmaz; yalnız kullanıcı chip’e basarsa event günlüğüne
manuel scroll gerçekleşir. Taslak/input odaklanmışsa mevcut D2 polling defer
kapısı korunur.

## 5. Responsive ve erişilebilirlik

- Desktop’ta 1280px’e kadar anlamlı genişlik ve dört hero kolonu kullanılır.
- Tablet iki hero kolonu kullanır.
- Mobilde header sticky dikey akışta kalır; jump-nav ve section header sticky
  olmaktan çıkarılarak çakışma önlenir.
- Yenile/çıkış eylemleri `aria-label` taşır; yoğunluk ve pencere kontrolleri
  `aria-pressed` kullanır; tarih alanı görünür label/id ile bağlıdır.
- Status badge’leri icon + metin taşır; `aria-live="polite"` yalnız durum
  özetlerinde kullanılır.
- `--touch-min: 44px` ve `prefers-reduced-motion: reduce` korunur.

## 6. Observer write sınırı

Bu teslimat yalnız read/render/poll yüzeyini değiştirir. `data/latest.json`
ve `data/observer-snapshot.json` için yeni PUT yolu eklenmemiştir. Mevcut
observer inbox, AEON outbox/media ve Kur’an teslim write kanalları
değiştirilmemiştir.

## 7. Kanıt

- D2 visual/a11y/safety fixture: **13 assertion PASS**,
- `node --check panel.js`, `sync.js`, `panelCoverageManifest.js`: PASS,
- panel script-tag balance/cache-bust: PASS (`20260803c`),
- PANEL-01 **27/27**, PANEL-02 **35/35**, PANEL-03 **26/26**,
  PANEL-04 **19/19**, PANEL-05 event **13/13** + sync **8/8**,
  PANEL-06 **15/15**,
- Faz 10 **64/64**, Faz 11 **50/50**, app driver PASS,
  Zikirmatik **90/90**, B1 PASS, B2 **32/32**, B3 **20/20**,
- `git diff --check`: PASS.

**Kabul:** Kullanıcı D2 command center ve sync ribbon teslimini açıkça kabul
etti; kabul kaydı paired ledger’larda `PANEL-011` sequence’iyle tutuluyor.

**Sonraki güvenli adım:** PANEL-012 / Prompt 10 D3 timeline-drawer teslimi
uygulandı ve kullanıcı review’ını bekliyor.
