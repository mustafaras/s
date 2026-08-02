# PANEL-08 — D1 Semantic Token ve Component Sözleşmesi Prompt’u

## Amaç

Mevcut koyu-altın ÆON estetiğini koruyarak status/source/privacy ayrımını
ortak CSS/HTML component sözleşmesine taşımak.

## Token katmanları

- surfaces: background, section, card, nested, audit,
- status: ok, pending, warning, danger, muted,
- source: user, derived, external, delivery, observer,
- privacy: redacted, restricted,
- feature accents: quran, faith, zikr, soul, journal.

## Component’ler

- `sync-ribbon`,
- `status-badge`,
- `source-badge`,
- `privacy-badge`,
- `timeline-row`,
- `empty-state`,
- `error-state`,
- `stale-banner`,
- `detail-drawer`,
- `density-toggle`.

## Kurallar

- status yalnız renk değildir; icon + metin gerekir.
- inline stiller yeni component’lerde çoğaltılmaz.
- 44px touch target korunur.
- reduced-motion ve contrast token’ları baştan yazılır.

## Kabul kapısı

Component API’si desktop/mobile’de aynı semantiği taşır; mevcut kartların
status renkleri feature accent ile karıştırılmaz; visual fixture’lar temizdir.

İki ledger’a sequence ekle, CSS/syntax testlerini kanıtla, sonra DUR.
