# IIP-07 gereksinim kanıtı

`tests/app/test_iip_07.js` ağsız `node:vm` fixture’ı ile ortak başlık/buton/
durum/kaynak yüzeylerini ve korunan gelişmiş yüzeyleri doğruladı.

- REQ-013 / TC-013: 100 hızlı sayaç, manuel giriş, geri alma, tefekkür notu,
  hatim/geçmiş boş durumları ve dönüş handler’ları korunuyor.
- REQ-014 / TC-014: Kur’an remote checking/error, video hazır/oynatılıyor,
  video yok, kilitli not, not alanı ve kütüphaneye dönüş durumları korunuyor.
- Olumsuz DOM kontrolü: loaded player sonrası watched repaint yalnız status ve
  action bölgelerini; not repaint yalnız `quran-video-notes` alanını boyuyor.
