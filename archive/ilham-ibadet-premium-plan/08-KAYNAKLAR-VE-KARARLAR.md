# 08 — Kaynaklar, kararlar ve belirsizlikler

## Birincil dış kaynaklar

19 Eylül 2026'da araştırıldı. Web kaynakları tasarım/teknik kararın dayanağıdır; önerdiğimiz ekranların kullanışlı olduğunu kanıtlamaz.

| Kaynak | Kullanım | Sınır |
|---|---|---|
| [Apple HIG Foundations](https://developer.apple.com/design/human-interface-guidelines/foundations) | Renk, yerleşim, tipografi referans çerçevesi | Native ölçüler CSS'e zorunlu standart olarak aktarılmaz |
| [Apple Materials](https://developer.apple.com/design/human-interface-guidelines/materials) | Malzeme yönü referansı | Web sayfası metni araçta sınırlı; ayrıntılı çıkarım yüklenmiş yerel HIG rehberinden, ürüne öneri olarak yapıldı |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Reflow, focus, hareket, erişilebilirlik kontrol çerçevesi | Uygunluk için gerçek ölçüm gerekir |
| [Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) | 24 CSS px AA minimumu/istisnaları; ürün için 44 hedefi | 44 değeri burada ürün kararıdır |
| [Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) | Metin kontrastı | Ölçülmemiş renklere PASS verilmez |
| [AlAdhan Calculation Methods](https://aladhan.com/calculation-methods) | Sağlayıcı ve yöntem ayrımı | Diyanet yöntemi ile resmî saat kaynağı eşitlenmez |
| [Diyanet Meal ve Tefsir](https://kuran.diyanet.gov.tr/mushaf/tefsir-2/fatiha-suresi-1/ayet-1/diyanet-isleri-baskanligi-meali-1) | İçerik kaynak incelemesi için örnek | Yeniden yayımlama/lisans izni doğrulanmış değildir |

Yerel beceri referansları: `apple-design/references/hig/{accessibility,color,layout,typography}.md`; ilkeler vanilla web arayüzüne uyarlandı. Haricî ürünlerin pazarlama özellikleriyle doğrulanmamış rakip karşılaştırması yapılmadı.

## Güncel kararlar

V2 tek karar kaydı [tracking/DECISIONS.md](tracking/DECISIONS.md), riskler [tracking/RISKS.md](tracking/RISKS.md). Yeni ürün örnekleri [ürün vizyonunda](specs/01-URUN-VIZYONU.md) kaynaklandırılır. Buradaki dış referanslar korunur; ikinci bir karar/durum tablosu tutulmaz.
