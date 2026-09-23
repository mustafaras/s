# IIP-10 görsel render matrisi

Artifact: `evidence/IIP-10/render-matrix.html` — sayfanın kendi
`app/core/saygi.js` registry'sinden, sentetik 100 kişilik veriyle üretildi.

- **Veri seti:** `IIP10-SYN-01` — 100 uydurma kişi (id `syn-001…syn-100`), 3
  sentetik "okundu" kaydı. Kişisel veri, token, GPS, ağ çağrısı ve cihaz
  depolaması **yoktur**.
- **Üretim yöntemi:** `saygiCollectionCardHTML`, `saygiFilteredResultsHTML`,
  `saygiSearchControlsHTML` ve `saygiCollectionGridHTML` gerçek çıktısı; sabit
  HTML değil. Uzun listeler sahne başına kısaltıldı ve kısaltma artifact içinde
  açıkça yazıldı; tam 100 satırı `tests/app/test_iip_10.js` doğrular.

## Sahneler (12)

| # | Sahne | Beklenen gözlem |
|---|---|---|
| 1 | Varsayılan (TAM 100 satır, kısaltılmadı) | İsimli liste birincil; grid kapalı ikincil özet |
| 2 | Tek sonuç (`einstein`) | Tek eşleşme; alan/çağ/okundu metni görünür |
| 3 | Türkçe katlama (`ibn`) | "İbn Sina" ASCII sorgu ile bulunur |
| 4 | Aksan katlama (`cigdem`) | Aksansız yazım aksanlı adı bulur |
| 5 | Tek karakter (`i`) | Ölü sonuç yok; tam liste + "iki harf yeter" |
| 6 | Sıfır sonuç (`zzzznomatch`) | Ayrı boş görünüm + tek kurtarma eylemi |
| 7 | Alan filtresi (Bilim) | Yalnız bilim yarısı; çip seçili |
| 8 | Okundu filtresi (Okunanlar) | Yalnız depolanan okunmuş kayıtlar |
| 9 | Okundu filtresi (Okunmayanlar) | Okunanların tamamlayıcısı |
| 10 | Çok filtre (meşru sıfır sonuç) | Sorgu + iki filtre birlikte daraltır |
| 11 | Çok kelimeli alan sorgusu | Her kelime ayrı aranır |
| 12 | Sayı düzeni (ikincil özet, açık) | 100 numara korunur; erişilebilir ad bozulmaz |

## Durum kapsamı

| Hâl | Sahne |
|---|---|
| Yükleniyor | 1–12 (liste ağ çağrısı olmadan render edilir) |
| Boş (sıfır sonuç) | 6, 10 |
| Boş (tek karakter) | 5 |
| Hata (koleksiyon yok) | Fixture'da doğrulanır; görsel artifact'te ayrı sahne yok |
| Dönüş (sorgu korunur) | 2, 3, 4, 7, 11 — `input value` sorguyu taşır |

## Kapsam sınırı

Bu artifact **render** türündedir: gerçek tarayıcı ekran görüntüsü, ekran
okuyucu oturumu, fiziksel cihaz ve kullanıcı kabulü **değildir**. Dar ekran ve
reduced-motion varyantları `app/styles.css` içinde tanımlıdır ve fixture bunları
kaynak düzeyinde doğrular.
