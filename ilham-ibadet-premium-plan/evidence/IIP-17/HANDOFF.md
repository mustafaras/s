# IIP-17 devir

- Kaynaklı günlük dua/âyet okuyucusu İlham & İbadet “Öz” yüzeyine eklendi.
- Arapça, okunuş durumu, meal, editoryal tefekkür ve kaynak ayrı semantik bloklardır.
- Yalnız mevcut doğrulanmış katalog okunur; yeni içerik, veri alanı, handler veya ağ çağrısı yoktur.
- Yerel headless testler tamamlandı. Cihaz/ekran okuyucu ve production kabulü ayrıca yapılmalıdır.
- `saygi.js` ve `styles.css` değiştiği için cache-bust yayın entegrasyonunda ayrıca ele alınmalıdır; IIP-17 allowlist’i `index.html` içermez.
