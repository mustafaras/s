# IIP-04 kaynak kapısı

Kaynak ve sentetik contract kanıtı:

- `app/core/saygi.js:239-241`: beşli/dörtlü nav, mevcut `App.setFaithTab` handler'ı ve hub çağrı sırası korunuyor.
- `app/core/saygi.js:173,239-241`: loading, empty/not-live, error/retry ve Öz/Öncü/İman/Zikir/Rapor dönüşleri korunuyor.
- `app/styles.css:141,685,900-919`: ortak 12px spacing, auto-fit nav, selected/focus semantics surface, wrap-safe card copy ve reduced-motion kuralları.
- `tests/app/test_iip_04.js`: 25 sentetik source/style contract kontrolü.

Source gate sonucu: PASS. `node --check app/core/saygi.js`, IIP-04 contract ve Saygı boundary temiz geçti; kişisel veri veya browser state okunmadı.
