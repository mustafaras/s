# IIP-11 değişiklik manifestosu

- Canlı doğrulama HEAD: `5e958998391487dcba98c3da4d77ea1160fafa6b`
- IIP-11 `diffHash`, bu manifestonun SHA-256 değeridir.

## Üretim değişiklikleri

| Dosya | Değişim |
|---|---|
| `app/core/saygi.js` | Oturumluk yazı ölçeği (5 adım), bölüm çıpaları + atlama denetimi, okuma konumu (ankraj+oran `[-1,1]`), RTL yön meta verisi, kapsayıcı tamamlama alternatifi, Aa/başa dön araçları; makale gövdesi çıpa + `dir`/`data-saygi-scale` ile donatıldı. |
| `app.js` | Tek dispatcher `App.saygiReader(action,value)` + hedef-bölge yeniden boyama (`saygiPaintReader`); `ui` oturumluk okuyucu durumu; registry shim'leri. |
| `app/styles.css` | Aa aracı, bölüm atlama, kapsayıcı alternatif, RTL hizalaması, gövdeye ölçek uygulaması; dar ekran + reduced-motion varyantları. |

## Test

| Dosya | Değişim |
|---|---|
| `tests/app/test_iip_11.js` | Yeni fixture: 45 kontrol (REQ-021/REQ-022 olumlu + olumsuz + boş/hata/dönüş). |

## Değişmeyenler

- **Kaydırma kapısı (A):** `IntersectionObserver`, `threshold:.72`, fallback yolu,
  sentinel ve `App.markSaygiRead` aynen korundu.
- `data` şeması, geçiş (migration), `sync.js`, depolama yazımı, panel sözleşmesi.
- `app/core/saygi.js` hâlâ hiç `App.*` ataması içermez.
- Kayıtlı bağımlılık sözleşmesi (`SAYGI_DEPENDENCIES`) büyümedi.
- `index.html` cache-bust pinleri bu kartta değiştirilmedi.

## App yüzeyi pinleri (DÜZELTME — ilk devir yanlıştı)

Okuma dispatcher'ı `App.saygiReader` eklendi → yüzey 719 → **720**. İlk devirde
"yeni App üyesi eklenmedi" yazılmıştı; **yanlıştı**, çünkü aynı anda
`App.openSaygiReading` silindiği için sayı 719=719 kalıp sapmayı gizledi.
Düzeltme sonrası güncellenen pinler:

| Fixture | Pin | Sonuç |
|---|---|---|
| `test_fx2_overlay_motion.js` | `App.*` 719 | 720 |
| `test_fx2_tab_transition.js` | `App.*` 719 | 720 |
| `test_fx2_touch_coverage.js` | `App.*` 719 | 720 |
| `test_app_surface_daily_boundary.js` | atama 557 / yüzey 719 | 558 / 720 |
| `test_v3_welcome.js` | handler 555 / yüzey 719 | 556 / 720 |

`onclick=391` beşinde de korundu.

## Düzeltilen kusurlar

**IIP11-REV-03 (yüksek).** Ölçek CSS'i `.saygi-article`ı hedefliyordu ama okuyucu
modal'ı `.saygi-article-modal` kullanır → ölçek asıl yüzeyde hiç uygulanmıyordu;
`1em * scale` ayrıca özgün tabanı eziyordu. Ölçek artık her bloğun gerçek tabanıyla
çarpılır ve iki sarmalayıcıyı kapsar.

**IIP11-REV-02 (yüksek).** `App.openSaygiReading` yanlışlıkla silinmişti; markup
onu iki yerde çağırıyordu ve okuma kaydı köprüsü kırıktı. Yüzey 719=719 kaldığı
için hiçbir pin yakalamadı; handler orijinal gövdesiyle geri kondu, altı pin doğru
değere çekildi ve yüzey sayısından bağımsız **yetim-handler bekçisi** eklendi
(mutasyon testiyle doğrulandı).

**IIP11-REV-01.** Okuma konumu oranı `[0,1]`'e kırpılıyordu; doğru aralık
`[-1,1]`'dir. `[0,1]` kırpma, ankraj görünümün üstündeyken (negatif oran) konumu
yok ediyor ve Aa sonrası geri dönüşü bozuyordu. Fixture yakaladı, düzeltildi.
