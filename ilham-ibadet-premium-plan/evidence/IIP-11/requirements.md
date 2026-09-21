# IIP-11 gereksinim kanıtı — REQ-021 / REQ-022

Fixture: `node tests/app/test_iip_11.js` — **45 PASS, 0 FAIL**.

## REQ-021 / TC-021 — Okuyucu etkileşimleri

**Kabul:** Oturumluk Aa, bölüm atlama ve konum koruma; varsayılana dönme var.

### Olumlu

| Durum | Doğrulanan davranış |
|---|---|
| Aa ölçeği | 5 sınırlı adım (100/112/125/140/160), varsayılan 100, etiket canlı. |
| Ölçek uygulaması | Yalnız makale gövdesine `--saygi-scale` uygulanır; kabuk ölçeklenmez. |
| Bölüm atlama | Başlıklar numaralı hedef olur; yerel `<label>`+`<select>`; her bölüm erişilebilir. |
| Konum koruma | Ankraj + göreli oran saklanır (ham piksel değil). |
| Varsayılana dönme | Ayrı "↺" eylemi ölçeği sıfırlar; "başa dön" konumu temizler (Aa ile birleşmez). |
| Çıpalar | Bloklar kimlikli ve `tabindex="-1"`; başlığa klavyeyle gidilebilir. |

### Olumsuz

| Vaka | Doğrulanan davranış |
|---|---|
| **Büyütmede metin ankrajı kaybolmaz** | Ölçek değişimi ankrajı önce yakalar, sonra aynı ankraja geri döner. |
| **RTL ayrı dil yönü taşır** | `dir="rtl"` + görünür yön etiketi; LTR'ye sızmaz; hizalama mantıksal. |
| Aralık dışı ölçek indeksi | 99 → güvenli 100; çökmez. |
| Boş/başlıksız metin | Bölüm yoksa boş atlama çubuğu **çizilmez**. |
| Konum kalıcılığı | `ui` dışına çıkmaz; `data`'ya veya depoya yazılmaz. |

## REQ-022 / TC-022 — Kaydırma kapısı ve erişilebilir alternatif

**Kabul:** Mevcut gate A'da korunur; B'de erişilebilir alternatif açık ürün
kararıyla eklenir.

| Durum | Doğrulanan davranış |
|---|---|
| Gate A korunur | `IntersectionObserver` + `threshold:.72` ve fallback yolu aynen; sentinel + `markSaygiRead` aynı. |
| B alternatifi | Varsayılan açık; klavyeyle erişilebilir "Bölüm sonuna git" düğmesi. |
| Duyuru | `role="status"` + `aria-live="polite"`; alarm değil. |
| Açık beyan | Metin, bu yolun kayıt oluşturmadığını baştan söyler. |
| Kapatılabilir | `saygiA11yAlt=false` ile B kapanır, A etkilenmez. |

### Olumsuz vaka (kartın açıkça istediği)

| Vaka | Doğrulanan davranış |
|---|---|
| **Kaydırma/ekran okuyucu erişimi otomatik "okudum" kaydı oluşturmaz** | B yolu yalnız `ui.saygiReadReady=true` yapar; `save()` çağırmaz, `entries.push` etmez. Kayıt hâlâ açık `App.markSaygiRead()` + gerçek `reading` girdisi ister. |
| Zaman/quiz kapısı | Yok: `quiz`, `saygiReadTimer`, `zorunluQuiz` hiç geçmez. |
| Erken kayıt | `saygiArticleReadableFor` + okunabilir gövde koşulu korunur. |
