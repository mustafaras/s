# IIP-04 kapsam kapısı

## İzinli yüzey

- Üretim: `app/core/saygi.js`, `app/styles.css`
- Test: `tests/app/test_saygi_boundary.js`, `tests/app/test_iip_04.js`

## Gerçekleşen değişiklik

- Beşli/dörtlü nav grid'i responsive auto-fit oldu.
- Seçili bölümün `aria-current`/`aria-pressed` semantiği ve görsel şekil vurgusu güçlendirildi.
- Nav, durum, metrik ve footer metinleri dar/büyük metin için sarılabilir hale getirildi.
- Ortak hub boşluğu 12px olarak birleştirildi.
- IIP-04 sentetik kaynak/style contract testi eklendi.

## Kapsam dışı

Data/migration/sync, handler gövdesi, canlı ağ, gerçek kullanıcı verisi, browser screenshot, cihaz/VoiceOver kabulü, IIP-05+ ve yeni içerik kapsam dışıdır.

Scope reviewer: Codex / integrator
