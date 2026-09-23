# IIP-11 görsel render matrisi

Artifact: `evidence/IIP-11/render-matrix.html` — sayfanın kendi
`app/core/saygi.js` registry'sinden, sentetik veriyle üretildi.

- **Veri seti:** `IIP11-SYN-01` — 1 sentetik kişi; 3 bölümlü uzun metin, 1
  paragraflık kısa metin ve bir RTL metin. Kişisel veri, token, GPS, ağ çağrısı ve
  cihaz depolaması **yoktur**.
- **Üretim yöntemi:** `saygiArticleBodyHTML`, `saygiSectionSkipHTML`,
  `saygiScaleToolHTML`, `saygiA11yAltHTML` gerçek çıktısı. Sabit HTML değildir.

## Sahneler

| # | Sahne | Beklenen gözlem |
|---|---|---|
| 1 | Varsayılan okuyucu (100%) | Aa aracı, bölüm atlama, kapsayıcı alternatif |
| 2 | Ölçek 112% | Gövde büyür; Aa etiketi ve aktif adım güncellenir |
| 3 | Ölçek 125% | Orta adım; "↺" varsayılana dön düğmesi görünür |
| 4 | Ölçek 140% | Üst adım; A+ hâlâ etkin |
| 5 | Ölçek 160% (sınır) | A+ devre dışı; metin sarmaya devam eder |
| 6 | Başlıksız kısa metin | Bölüm atlama çubuğu **yok**; okuyucu yine tam |
| 7 | RTL metin | `dir="rtl"`, görünür yön etiketi, sağa hizalama |
| 8 | 320px dar görünüm notu | Başlık öğeleri sarar; Aa değeri daralır |
| 9 | Kapsayıcı alternatif durumu | "Bölüm sonuna git" + polite durum metni |

## Durum kapsamı

| Hâl | Sahne |
|---|---|
| Yükleniyor | 1–5 (gövde ağ çağrısı olmadan render edilir) |
| Boş (bölüm yok) | 6 |
| Hata | Fixture'da doğrulanır (`saygiPersonModalHTML` hata kabuğu korunur) |
| Dönüş | 2–5: ölçek değişir, konum ankrajı korunur |

## Kapsam sınırı

**render** türündedir: gerçek tarayıcı ekran görüntüsü, ekran okuyucu oturumu,
fiziksel cihaz ve kullanıcı kabulü **değildir**. S03'ün istediği "%200 metin ve
ekran okuyucu" kanıtı cihaz kabulüne aittir ve burada iddia edilmez.
