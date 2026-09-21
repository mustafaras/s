# IIP-10 kapsam kaydı

## Kapsam

Kart IIP-10, "Öncü arama ve filtre" (REQ-019 / REQ-020). Yalnız üretim
allowlist'inde tanımlı dosyalar ve kartın kendi test dosyası yazıldı; paylaşılan
FX2 fixture'ları DEC-07 kararıyla yalnız **pin güncellemesi** için dokunuldu.

## Değişen dosyalar

### Üretim

| Dosya | Değişim |
|---|---|
| `app/core/saygi.js` | Türkçe normalizasyon + arama indeksi + lens modeli; isimli sonuç listesi; koleksiyon kartında numara gridi ikincil `<details>` özetine indirildi. |
| `app.js` | Tek dispatcher handler (`App.saygiLens`) + hedef-bölge boyama (`saygiPaintLens`); `ui` oturumluk arama/filtre/grid durumu; registry shim'leri. |
| `app/styles.css` | Arama alanı, filtre çipleri, isimli satırlar, boş/hint görünümleri, ikincil grid özeti; dar ekran ve reduced-motion varyantları. |

### Test

| Dosya | Değişim |
|---|---|
| `tests/app/test_iip_10.js` | Yeni fixture: 61 kontrol (REQ-019/REQ-020 olumlu + olumsuz + boş/yükleniyor/hata/dönüş). |
| `tests/app/test_fx2_overlay_motion.js` | Yalnız FX2-16.2 pin: `App.*` 718 → 719 + DEC-07 referansı. |
| `tests/app/test_fx2_tab_transition.js` | Yalnız FX2-15.7 pin: `App.*` 718 → 719 + DEC-07 referansı. |
| `tests/app/test_fx2_touch_coverage.js` | Yalnız FX2-10.9 pin: `App.*` 718 → 719 + DEC-07 referansı. |

### Plan kaydı

`IIP-STATE.json`, `cards/IIP-10.md`, `tracking/CURRENT-STATE.md`,
`tracking/DECISIONS.json`, `tracking/DECISIONS.md`, `tracking/LEDGER.jsonl`,
`evidence/IIP-10/*`.

## Korunan sözleşmeler

- `data` şeması, geçiş (migration), `sync.js`, depolama yazımı, sensör hesabı ve
  panel sözleşmesi **değişmedi**. Arama sorgusu yalnız `ui` oturumluk kanalında.
- `app/core/saygi.js` hiç `App.*` ataması içermez; yeni dispatcher `app.js`'tedir.
- Kayıtlı bağımlılık sözleşmesi (`SAYGI_DEPENDENCIES`) **büyümedi**: sorgu mevcut
  `ui` kanalından okunur.
- `onclick=391` pini korundu; yalnız `App.*` yüzeyi 718 → 719 oldu (DEC-07).
- `index.html` cache-bust pinleri bu kartta **değiştirilmedi** (integratör işi).

## Kapsam dışı (yetki yok)

- IIP-11 ve sonrası: hiç başlanmadı.
- Yayın / cihaz kabulü / canlı veri yazımı: ayrı yetki gerektirir.
- `index.html`: allowlist dışı; cache-bust bump'ı bu kartın kapsamında değildir.
