# IIP denetim baseline'ı — P00

**Ölçüm:** 2026-09-22 · **HEAD:** `8ba784e` (P09 sonrası — `plan-check.mjs` artık exit 0)
**Yöntem:** her fixture tek tek koşuldu, **gerçek exit kodu** kaydedildi (`$?` doğrudan okundu, pipeline ile gizlenmedi).
**Dosya niteliği:** Bu bir **denetim notudur**, program kanıtı (receipt) değildir. `plan-check` bunu doğrulamaz.

## Özet

| Aile | PASS | FAIL |
|---|---|---|
| `tests/app` | 60 | **13** |
| `tests/panel` | 23 | 0 |
| `tests/panel-v2` | 27 | 0 |
| `tests/quran` | 8 | **1** |
| `tests/reminders` | 1 | 0 |
| `tools/` + harness | 4 | **2** |
| **TOPLAM** | **123** | **16** |

## Başarısız 16 kontrol

| # | Kontrol | exit | Kısa hata |
|---|---|---|---|
| 1 | `tests/app/test_app_surface_boot_boundary.js` | 1 | `data rebinds stay out of the registry and production cache-bust is paired` |
| 2 | `tests/app/test_app_surface_domain_boundary.js` | 1 | `production loads appSurface before app.js with fresh cache versions` |
| 3 | `tests/app/test_app_surface_lifecycle_boundary.js` | 1 | `production cache busts the changed registry and app shell together` |
| 4 | `tests/app/test_app_surface_overlay_boundary.js` | 1 | `production loads appSurface before app.js with fresh cache versions` |
| 5 | `tests/app/test_header_celestial_timeline.js` | 1 | `CSS ve appSurface cache sürümleri yükseltildi` |
| 6 | `tests/app/test_header_night_contrast.js` | 1 | `stylesheet cache sürümü yükseltildi` |
| 7 | `tests/app/test_iip_03.js` | 1 | `panel weekly denominator remains unchanged and is documented as unresolved` |
| 8 | `tests/app/test_iip_05.js` | 1 | `scope contract: no App assignment or migration change was introduced` |
| 9 | `tests/app/test_iip_06.js` | 1 | `scope contract: no migration, App assignment or live data behavior was added` |
| 10 | `tests/app/test_iip_09.js` | 1 | `scope contract: no migration/storage/network behavior was added` |
| 11 | `tests/app/test_iip_12.js` | 1 | `odak render data'yı değiştirmez` + `yeni kalıcı alan açılmaz` + `saygi.js yeni App üyesi ATAMAZ` |
| 12 | `tests/app/test_iip_13.js` | 1 | `saygi.js yeni App üyesi ATAMAZ` |
| 13 | `tests/app/test_v3_welcome.js` | 1 | `appSurface.js cache-bust güncel (B2 düzeltmesi)` |
| 14 | `tests/quran/test_quran_striking_verses.js` | 1 | (P05'te incelenecek) |
| 15 | `plan-check.mjs --self-test` | 1 | `Self-test requires structurally valid baseline` |
| 16 | `plan-check.integration.py` | 1 | `FileExistsError` (satır 12) |

## Yeşil olan kritik kontroller

- `plan-check.mjs` → **exit 0** (P09 düzeltmesi bu turda yapıldı)
- `driver.mjs`, `zikr-harness.mjs`, `shell-inventory.mjs --gate` → exit 0
- `tests/reminders/run-reminder-smoke.mjs` → exit 0
- Tüm `tests/panel` (23) ve `tests/panel-v2` (27) → exit 0
- Geniş sınır fixture'ları (`saygi`, `prayer`, `zikir`, `quran`, `render`, `state_rebind`, `modal_focus`) → exit 0

## Çalışma ağacı durumu (ölçüm anında)

```
(clean — 8ba784e push edildi, dirty dosya yok)
```

## Notlar

1. **16 → hedef 0.** P01-P07 testleri, P11-P12 araçları hedefler.
2. **Dağılım:** 13 fixture kırmızısının 8'i bayat pin/regex (P01-P04, P07), 1'i gerçek mutasyon (P06, `test_iip_12`), 4'ü kapsam bekçisi (P07).
3. **P09 öncesi durum:** `plan-check.mjs` da exit 1 idi (`card contract drift IIP-24`); bu turda `--render` ile normalize edildi ve doğrulandı.
