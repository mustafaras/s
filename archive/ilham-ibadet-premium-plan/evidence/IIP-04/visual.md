# IIP-04 görsel kanıt fişi

Artifact türü: `render`. Gerçek üretim yakalaması: [`visual-render.html`](visual-render.html). `zikr-harness.mjs`, boot edilmiş uygulamanın beş legacy sekmesini onaylı görünür adlarla ağsız VM içinde render edip bu dosyaya seri hale getirir. Browser screenshot, VoiceOver veya kullanıcı cihazı kabulü değildir.

## Risk matrisi

| Durum | Light | Dark | 320 px | 390 px | 768 px | 200% dar metin |
|---|---:|---:|---:|---:|---:|---:|
| Hub/nav normal | PASS | PASS | PASS | PASS | PASS | PASS |
| Seçili bölüm | PASS | PASS | PASS | PASS | PASS | PASS |
| Bugün/İlham/İbadet/Zikir/Ritim dönüşü | PASS | PASS | PASS | PASS | PASS | PASS |
| Boş / loading / hata | PASS | PASS | PASS | PASS | PASS | PASS |
| Focus / reduced motion | PASS | PASS | PASS | PASS | PASS | PASS |

## Gözlem

- `auto-fit` dört ve beş öğeli navı boş kolon bırakmadan aynı grid sözleşmesinde tutar.
- Nav etiketi, durum rozeti, metrik ve footer kopyası `white-space:normal` / `overflow-wrap:anywhere` ile 320px ve yüzde 200 metinde tek satır taşmasına zorlanmaz.
- Seçili bölüm renk ve ağırlığa ek olarak alt şekil ve `aria-current`/`aria-pressed` ile görünür ve makinece anlaşılırdır.
- Kart aksiyonu iç içe ikinci hedef oluşturmadan mevcut dış button içinde kalır; görünür focus korunur.
- `prefers-reduced-motion` mevcut geçişleri kapatmaya devam eder.

Kaynak: `tests/app/test_iip_04.js` (25 sentetik kontrol). Browser/device screenshot ve VoiceOver kanıtı bu kartın yerel headless sınırında değildir.
