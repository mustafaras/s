# PANEL-07 — D0 Bilgi Mimarisi ve Wireframe Prompt’u

## Amaç

Kod yazmadan ÆON panelin “Şimdi → Senkron → Son Değişiklikler → Ayrıntı”
akışını wireframe ve gezinme sözleşmesine dönüştür.

## Hedef akış

```text
Command header
→ sync ribbon
→ Şimdi hero
→ son değişiklikler
→ kritik/risk
→ bölüm navigasyonu
→ feature kartları
→ drawer/audit ayrıntısı
```

## Yapılacaklar

1. Mobil 375–430px, tablet 768px ve desktop 1280px wireframe’i çıkar.
2. “10 saniyelik bakış” ve “60 saniyelik audit” akışlarını ayrı tasarla.
3. Hızlı bakış/standart/audit yoğunluk modlarını konumlandır.
4. Boş, stale, error, redacted ve loading durumlarını göster.
5. Her kart için tek bir karar/amaç cümlesi yaz.
6. Hassas drawer sınırlarını wireframe’de belirginleştir.

## Kabul kapısı

- Tasarımda karta dönüşmemiş kritik veri kalmaz.
- Header ve sticky nav çakışmaz.
- Üstte hangi durumda aksiyon gerektiği anlaşılır.
- Wireframe teknik plan coverage/provenance alanlarıyla eşleşir.

Wireframe kabul edilmeden CSS veya panel HTML refactor’ı yapma. Ledger’ları
eş sequence ile güncelle ve DUR.
