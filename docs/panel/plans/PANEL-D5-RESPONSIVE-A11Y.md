# ÆON Paneli — PANEL-12 D5 Responsive, Erişilebilirlik ve Motion

**Sequence:** `PANEL-014`
**Durum:** `ready_for_review`
**Tarih:** 2026-08-03
**Önkoşul:** D1–D4 kullanıcı kabulü/teslimleri ve paired ledger kanıtı

## Teslim özeti

D5, panelin 375px mobil ekrandan 1440px desktop’a kadar taşmadan okunmasını,
sticky yüzeylerin birbirini örtmemesini ve klavye/ekran okuyucu akışının
semantik kalmasını sağlar.

## Responsive sözleşmesi

| Viewport fixture | Düzen | Kanıt |
|---|---|---|
| 375 / 390 / 430px | Mobil tek kolon, 480px üst sınır yalnız mobil koşulunda | D5 fixture |
| 768px | Tablet iki kolon | D5 fixture |
| 1280 / 1440px | Desktop 12 kolon bento | D5 fixture |

Header desktop’ta fixed, mobilde sticky; section navigation desktop’ta üst
sticky şerit altında kalır, mobilde normal akışa döner. D3/D4 drawer’ları
viewport’u aşmadan desktop sağ panel ve mobil tam ekran davranışını korur.

## Accessibility ve motion sözleşmesi

- Eylemler `--touch-min: 44px` hedefini taşır; focus ring görünür ve yüksek
  kontrast modunda güçlenir.
- Section navigation `aria-controls` + `aria-current`; accordion ve drawer
  kontrolleri `aria-expanded` + `aria-hidden`; status/sync/filter yüzeyleri
  `aria-live` taşır.
- Native button semantiği, drawer focus trap/Esc/odak iadesi ve uzun Türkçe
  metinlerde `overflow-wrap:anywhere` korunur.
- `prefers-reduced-motion` CSS’te animation/transition/scroll davranışını,
  JS’te section jump davranışını `auto` yapar.
- Muted text token’ları dark surface üzerinde WCAG AA kontrastını karşılar;
  status yalnız renk ile anlatılmaz.

## Değişen yüzeyler

- `panel.css`: D5 breakpoint, overflow, sticky, target, focus, contrast ve
  reduced-motion katmanı; cache `20260803f`.
- `panel.js`: native accordion, ARIA state sync, semantic header/main,
  section current state, drawer/event expanded state ve reduced-motion jump.
- `panel.html`: D5 cache bump.
- `tests/test_panel_p5_responsive_a11y.js`: altı viewport ve accessibility/motion
  sentetik fixture’ı.

## Kanıt

- D5 fixture: **24/24 PASS**.
- D3/D4 fixture’ları ve Faz 11 panel harness’i PASS.
- `node --check` app/sync/panel/coverage, script-tag/cache, full regression,
  headless/migration ve `git diff --check` kapıları **PASS**.
- Browser veya local server açılmadı; sentetik CSS/DOM ve headless VM kullanıldı.

**Sonraki güvenli adım:** Kullanıcı D5 responsive/a11y/motion teslimini review
edip açık kabul verene kadar Prompt 13 / `PANEL-015` QA-release gate’i
başlatılmayacak.
