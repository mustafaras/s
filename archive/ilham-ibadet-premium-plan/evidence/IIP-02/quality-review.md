# IIP-02 kalite yeniden işleme

## Ölçek ve yöntem

Skorlar `specs/05-KALITE-SKOR-KARTI.md` formülüyle, tek inceleyici tarafından tasarım artifact'i üzerinde verildi. Bu bir cihaz veya kullanıcı görevi skoru değildir. A, IIP-01 kaynak baseline'ının tasarım olgunluğudur; B, IIP-02 prototipinin hedefe göre yeniden işlenmiş halidir.

| Boyut | A /4 | B /4 | Ağırlık | B kanıtı |
|---|---:|---:|---:|---|
| Hiyerarşi ve yön bulma | 2.0 | 3.5 | 20 | `composition-matrix.md` tüm S01–S12; ortak header/tek CTA kontratı |
| Okuma ve metin işçiliği | 2.0 | 3.5 | 20 | S03/S08 uzun metin, RTL/LTR, 200% ve font fallback varyantları |
| Etkileşim sürekliliği | 2.0 | 3.5 | 20 | S03/S05/S06/S07 dönüş, focus, caret, sayaç ve mevcut handler sınırları |
| İçerik değeri ve kaynak güveni | 2.0 | 3.25 | 15 | C06 kaynak anatomisi; source/error/unavailable durumları; “doğrulandı” rozeti uydurulmaz |
| Görsel tutarlılık ve karakter | 2.0 | 3.5 | 15 | token-map; light/dark aynı kompozisyon; C01–C08 ortak ikon dili |
| Boş/hata/geri dönüş kalitesi | 1.0 | 3.5 | 10 | 12 ekran durum sütunu; C02/C07/C08 varyant fişleri |
| **Ağırlıklı toplam** | **47.5/100** | **86.56/100** | **100** | hedef ≥85 ve her boyut ≥3 |

## 3,0 altındaki boyutların yeniden işlenmesi

- **Hiyerarşi:** A'da bölüm, içerik ve araçların aynı ağırlıkta kalma riskini; B'de bağlam → ana içerik → tek CTA → ikincil araç sırasını sabitledim.
- **Okuma:** A'da okuyucu, kaynak ve eylem ayrımı zayıftı; B'de S03/S08 ayrı semantik bölümler, uzun başlık sarma ve 200% alan büyümesi var.
- **Etkileşim:** A'da tasarım yüzeyi ile mevcut handler davranışı birbirine karıştırılabilirdi; B'de C05 dönüş/focus, C07 caret, C03/C04 durum ayrımı açık.
- **İçerik/güven:** A'da kaynak doğrulaması görsel rozete dönüşebilirdi; B'de görünür atıf, dil/lisans ve unavailable durumu ayrı.
- **Tutarlılık:** A'da domain renkleri ve inline örnekler parçalı; B'de semantic token tablosu ve ikon dili tek sözlükte.
- **Boş/hata:** A'da güzel hero tek başına yeterli değildi; B'de her ekran için loading/empty/error/return durumları ve C08 kurtarma eylemi tanımlı.

## Açık sınır

86.56 tasarım gözden geçirme skoru olarak hesaplandı. Gerçek render, ekran okuyucu, cihaz, görev süresi ve ikinci bağımsız reviewer yoktur. Bu sınırları kapatmadan DEC-01 onaylanmış veya ürün kabul edilmiş sayılmaz.
