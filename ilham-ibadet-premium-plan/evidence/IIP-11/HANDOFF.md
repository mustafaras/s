# IIP-11 devir

- **Ajan / rol / tarih:** copilot / frontend / 2026-09-21.
- **Yetkili kapsam:** kullanıcının "go next be per perfect" talimatı → IIP-10 done,
  sıradaki kart IIP-11 (Okuyucu etkileşimleri) yetkilendirildi. Commit/push/deploy
  bu promptla **yetkili değildir**.
- **CWD / branch / HEAD:** `/Users/m_ras/Desktop/seyma` / `main` /
  `5e958998391487dcba98c3da4d77ea1160fafa6b`.
- **Kart durumu:** `done`; IIP-10 done, aktif lock yok.
- **Başlangıç dirty:** yok (temiz ağaç).
- **Değişen dosyalar:** `app/core/saygi.js`, `app.js`, `app/styles.css`,
  `tests/app/test_iip_11.js` (yeni), plan kaydı + `evidence/IIP-11/*`.
- **diffHash:** manifest dosyasının SHA-256 değeri.

## Davranış

Okuyucuya üç etkileşim eklendi, hepsi **oturumluk** (`ui` kanalı; `data`'ya,
depoya, sync'e yazılmaz):

1. **Aa / yazı ölçeği** — 5 sınırlı adım (100/112/125/140/160) + ayrı "varsayılana
   dön" düğmesi. Yalnız makale gövdesine uygulanır; kabuk ölçeklenmez. Aa
   değişiminde **ilk görünür paragraf ankrajı** yakalanır ve aynı ankraja dönülür.
2. **Bölüm atlama** — başlıklar numaralı hedef olur; yerel etiketli `<select>`.
   Başlıksız kısa metinde denetim **çizilmez**. Çıpalar `tabindex="-1"` ile
   klavyeyle odaklanabilir.
3. **Okuma konumu** — ankraj + göreli oran `[-1,1]` olarak saklanır (ham piksel
   değil); "başa dön" ayrı bir eylemdir, Aa ile birleşmez.
4. **RTL** — `dir="rtl"` + görünür yön etiketi; LTR'ye sızmaz; hizalama mantıksal.
5. **Kapsayıcı tamamlama alternatifi (B)** — klavyeyle "Bölüm sonuna git" +
   polite durum. **Kaydırma kapısı (A) birebir korundu.** B yalnız hazır olma
   sinyali verir; **otomatik "okudum" kaydı OLUŞTURMAZ** — kayıt hâlâ açık
   `App.markSaygiRead()` + gerçek `reading` girdisi ister.

## Test

IIP-11 **55/55**; Saygı 20/20, IIP-10 61/61, IIP-04 26, IIP-05 28/28, IIP-09 22/22,
zikir harness 95/95, driver PASS, shell gate PASS, modal-focus PASS;
**`tests/app` 61/61**, `tests/panel` 23/23, `tests/panel-v2` 27/27,
`tests/quran` 9/9, reminder smoke PASS; plan-check ve `diff --check` PASS.
Kayıt: `evidence/IIP-11/commands.log` (15 komut, hepsi exit 0).

## Düzeltilen kusurlar

**IIP11-REV-01.** Okuma konumu oranı `[0,1]`'e kırpılıyordu; doğru aralık
`[-1,1]` (negatif = ankraj görünümün üstünde). Kırpma negatif yarıyı yok ediyor ve
Aa sonrası geri dönüşü bozuyordu. Fixture yakaladı, düzeltildi.

**IIP11-REV-02 (yüksek, elle denetimde bulundu).** `App.openSaygiReading`
yanlışlıkla silinmişti; markup onu iki yerde çağırıyordu (okunmuş içerikte
"Okudum" → "Ne okundum kaydını aç") ve **okuma kaydı köprüsü kırıktı**. Bir
handler silinip bir yenisi eklendiği için yüzey sayısı 719=719 kaldı ve **hiçbir
pin yakalamadı**. Düzeltme: handler orijinal gövdesiyle geri kondu; **altı** pin
doğru değere çekildi (yüzey 720, atama 558, v3 handler 556, onclick 391 sabit);
`tests/app/test_iip_11.js`'e yüzey sayısından bağımsız **yetim-handler bekçisi**
eklendi (mutasyon testiyle doğrulandı).

## Önceki devirdeki YANLIŞ iddia (düzeltildi)

İlk devir "yeni App üyesi eklenmedi, hiçbir paylaşılan fixture pinlenmedi" diyordu.
**Yanlıştı.** `App.saygiReader` eklendi (yüzey 719→720) ve altı pin güncellenmesi
gerekti. Yanılgının nedeni, aynı anda bir handler'ın silinmiş olmasının sayıyı
719'da sabit tutmasıydı.

**IIP11-REV-03 (yüksek).** Ölçek CSS'i yanlış sarmalayıcıyı hedefliyordu
(okuyucu modal'ı `.saygi-article-modal`, kural `.saygi-article`) → ölçek asıl
yüzeyde hiç uygulanmıyordu; ayrıca `1em * scale` özgün taban boyutunu eziyor ve
ebeveyne göre çözülüyordu. Düzeltme: ölçek her bloğun **gerçek tabanıyla**
çarpılır, iki sarmalayıcı da kapsanır. Bekçi: ölçek içeren her kural modal'ı
içermek zorunda (iki mutasyonla doğrulandı).

## Yayın riski (yetki dışı — integratör kararı)

Cache-bust pinleri (`styles.css`/`saygi.js`/`app.js` = `20260921a`) IIP-10
yayınında konuldu; IIP-11 aynı üç dosyayı yeniden değiştirdi. IIP-10 sonrası
siteyi açan tarayıcı önbellekteki sürümü kullanabilir ve **IIP-11 arayüzünü
göremeyebilir**. `index.html` bu kartın allowlist'inde değil; bump yayından önce
yapılmalıdır.

## Eksik kabul

- Bağımsız insan incelemesi değil: `reviewer=copilot`.
- **Cihaz/ekran okuyucu kabulü yok.** S03'ün istediği "%200 metin + ekran okuyucu"
  kanıtı bu kartta üretilemez; cihaz kabulü ayrıdır.
- Tarayıcı ekran görüntüsü yok; görsel kanıt sentetik render artifact'idir.

## Bilinen sınırlar

- Bölüm atlama yalnız `h` bloklarını hedefler (bilinçli).
- B alternatifi bir ürün kararıdır ve varsayılan açıktır; `saygiA11yAlt=false` ile
  kapatılabilir.
- Genel undo **yapılmadı**: spec gereği IIP-14/20 sözleşmesi ister.
- Yer imi / okuyucu tercihi kalıcılığı IIP-19/20 kapsamındadır.

## Geri alma / veri uyumluluğu

Geri alma: üç üretim dosyasının + yeni fixture'ın diff'i dar bir commit ile geri
alınır. **Yeni kalıcı veri yok**; ölçek ve konum oturumluktur, bu yüzden IIP-19
uyumluluk sözleşmesi devreye girmez ve geçiş (migration) gerekmez.

## Süreç

Sunucu/tarayıcı başlatılmadı. Gerçek token / `localStorage` / kişisel veri
kullanılmadı; `seyma-data`'ya yazılmadı.

## Sonraki yetkili eylem

IIP-12 (Günlük odak ve devam et) **yalnız ayrıca yetkilendirildiğinde**; bu
oturumda başlanmadı. Kesin durma sınırı: commit/push/deploy/tag yok.
