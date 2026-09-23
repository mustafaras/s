# IIP-10 değişiklik manifestosu

- Canlı doğrulama HEAD: `3ccfa70411a30ac15d1d9241874895ec41226dab`
- IIP-10 `diffHash`, bu manifestonun SHA-256 değeridir.

## Üretim değişiklikleri

| Dosya | Değişim |
|---|---|
| `app/core/saygi.js` | Türkçe normalizasyon + arama indeksi + lens modeli; isimli sonuç listesi; koleksiyon kartında numara gridi ikincil `<details>` özetine indirildi. |
| `app.js` | Tek dispatcher handler (`App.saygiLens`) + hedef-bölge boyama (`saygiPaintLens`); `ui` oturumluk arama/filtre/grid durumu; registry shim'leri. |
| `app/styles.css` | Arama alanı, filtre çipleri, isimli satırlar, boş/hint görünümleri, ikincil grid özeti; dar ekran ve reduced-motion varyantları. |

## Test değişiklikleri

| Dosya | Değişim |
|---|---|
| `tests/app/test_iip_10.js` | Yeni fixture — 61 kontrol (REQ-019/REQ-020 olumlu + olumsuz + boş/yükleniyor/hata/dönüş). |
| `tests/app/test_fx2_overlay_motion.js` | Yalnız pin: FX2-16.2 `App.*` 718 → 719 (+ DEC-07 referansı). |
| `tests/app/test_fx2_tab_transition.js` | Yalnız pin: FX2-15.7 `App.*` 718 → 719 (+ DEC-07 referansı). |
| `tests/app/test_fx2_touch_coverage.js` | Yalnız pin: FX2-10.9 `App.*` 718 → 719 (+ DEC-07 referansı). |

## Değişmeyenler

- `data` şeması, geçiş (migration), `sync.js`, depolama yazımı, sensör hesabı,
  modal handler kimlikleri ve çağrı sırası.
- `app/core/saygi.js` hâlâ hiç `App.*` ataması içermez.
- Kayıtlı bağımlılık sözleşmesi (`SAYGI_DEPENDENCIES`) büyümedi.
- `onclick=391` pini (üç FX2 fixture'ında da korundu).
- `index.html` cache-bust pinleri — bu kartta **değiştirilmedi** (integratör işi).

## Karar

- DEC-07: Öncü arama dispatcher'ı ve FX2 App yüzey pin güncellemesi.
  Onay: `evidence/IIP-10/decision-approval.md`.

## Bayat pin onarımı (kartın neden olmadığı)

Dört `test_app_surface_*_boundary.js` fixture'ı `index.html`'de artık canlı
olmayan cache-bust değerlerini bekliyordu (`app.js?v=20260916a`,
`appSurface.js?v=20260915c`). Bu uyuşmazlık HEAD'de de vardı; beklenen değerler
canlı değere getirildi. `index.html` **değiştirilmedi**.

## Düzeltme kaydı

İlk rapor bu uyuşmazlıkların altısını da "önceden var olan" saymıştı; bu yanlıştı.
`test_app_surface_daily_boundary.js` (556/718) ve `test_v3_welcome.js` (554/718)
pinleri HEAD'de geçiyordu ve yalnız yeni dispatcher handler'ı yüzünden kırıldı;
DEC-07 kapsamında güncellendi. Ayrıntı: `evidence/IIP-10/decision-approval.md`.
