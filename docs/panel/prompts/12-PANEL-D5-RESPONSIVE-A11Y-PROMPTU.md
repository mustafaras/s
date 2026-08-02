# PANEL-12 — D5 Responsive, Erişilebilirlik ve Motion Prompt’u

## Amaç

Paneli 375px mobil ekrandan 1440px desktop’a kadar okunabilir, klavye ve
ekran okuyucu ile kullanılabilir, yoğunluk kontrollü hale getir.

## Hedefler

- 375, 390, 430, 768, 1280 ve 1440px fixture/screenshot.
- Mobil tek kolon; tablet iki kolon; desktop 12 kolon.
- 480px max-width yalnız mobil koşulunda.
- Header, sticky nav, drawer ve section header çakışmaz.
- Tüm eylemler 44×44px.
- `aria-expanded`, `aria-controls`, `aria-current`, live regions.
- WCAG AA kontrast; renk tek anlam taşımaz.
- reduced-motion’da animasyon ve scroll davranışı stabil.

## Kabul kapısı

Horizontal overflow, clipped text, focus kaybı, contrast ve motion regression
olmaz. Uzun Türkçe metinler, büyük sayılar, boş/stale/error durumları test
edilir.

İki ledger’a kanıtlı sequence ekle, sonra DUR.
