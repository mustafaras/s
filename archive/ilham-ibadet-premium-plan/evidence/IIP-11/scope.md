# IIP-11 kapsam kaydı

## Kapsam

Kart IIP-11, "Okuyucu etkileşimleri" (REQ-021 / REQ-022). Yalnız üretim
allowlist'i ve kartın kendi test dosyası yazıldı. Paylaşılan fixture'lara
dokunulmadı — bu kart hiçbir App yüzey pinini değiştirmez.

## Değişen dosyalar

| Dosya | Değişim |
|---|---|
| `app/core/saygi.js` | Oturumluk yazı ölçeği (5 adım), bölüm çıpaları + atlama denetimi, okuma konumu (ankraj+oran), RTL yön meta verisi, kapsayıcı tamamlama alternatifi, Aa/başa dön araçları; makale gövdesi çıpa/meta ile donatıldı. |
| `app.js` | Tek dispatcher `App.saygiReader(action,value)` + hedef-bölge yeniden boyama (`saygiPaintReader`); `ui` oturumluk okuyucu durumu; registry shim'leri. |
| `app/styles.css` | Aa aracı, bölüm atlama, kapsayıcı alternatif, RTL hizalaması, ölçek uygulaması; dar ekran ve reduced-motion varyantları. |
| `tests/app/test_iip_11.js` | Yeni fixture: 45 kontrol (REQ-021/REQ-022 olumlu + olumsuz + boş/hata/dönüş). |

## Korunan sözleşmeler

- **Kaydırma kapısı (A) değişmedi:** `IntersectionObserver` + `threshold:.72` ve
  fallback yolu aynen duruyor; sentinel + `App.markSaygiRead()` aynı.
- `data` şeması, geçiş (migration), `sync.js`, depolama yazımı ve panel sözleşmesi
  değişmedi. Ölçek ve okuma konumu **yalnız `ui`** oturumluk kanalında yaşar.
- `app/core/saygi.js` hiç `App.*` ataması içermez.
- Kayıtlı bağımlılık sözleşmesi (`SAYGI_DEPENDENCIES`) büyümedi.
- **`App.*` yüzeyi değişmedi:** IIP-10'un dispatcher deseni kullanıldığı için yeni
  App üyesi eklenmedi; hiçbir paylaşılan fixture pinlenmedi.

## Kapsam dışı (yetki yok)

- IIP-12 ve sonrası: başlanmadı.
- Yayın / cihaz / ekran okuyucu kabulü: ayrı yetki.
- Yeni kalıcı veri (yer imi, okuyucu tercihi): IIP-19/20 kapsamı.
- Genel undo: spec gereği IIP-14/20 sözleşmesi ister, burada yapılmadı.
