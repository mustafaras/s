# IIP-11 inceleme kaydı

Sentetik/headless kaynak ve davranış incelemesi. Fiziksel cihaz, ekran okuyucu,
tarayıcı ve yayın kabulü **kapsam dışıdır**.

| Alan | Sonuç |
|---|---|
| Açık kritik bulgu | 0 |
| Açık yüksek bulgu | 0 (1 bulundu, düzeltildi) |
| İnceleyen | copilot (self-review; bağımsız insan incelemesi değildir) |

## İncelenen başlıklar

1. **Veri sınırı.** Ölçek ve okuma konumu yalnız `ui` oturumluk kanalında; `data`,
   geçiş (migration), `sync.js` ve depolama yazımı değişmedi. `saygi.js` hâlâ hiç
   `App.*` ataması içermez.
2. **Gate A dokunulmadı.** Kaydırma kapısının `IntersectionObserver`, eşik ve
   fallback yolu birebir korundu; B alternatifi ondan bağımsız ve kapatılabilir.
3. **Otomatik kayıt yok.** B yolu yalnız hazır olma sinyali verir. Kayıt, gerçek
   `reading` girdisi + açık `markSaygiRead` ister. Zaman/quiz kapısı eklenmedi.
4. **Erişilebilirlik.** Aa aracı `role="group"` + etiketli düğmeler; ölçek değeri
   `aria-live="polite"`; bölüm atlama yerel etiketli `<select>`; çıpalar
   `tabindex="-1"` ile klavyeyle odaklanabilir; RTL `dir` ile bildirilir.
5. **Ankraj koruması.** Ölçek değişiminde önce ankraj yakalanır, sonra aynı
   ankraja dönülür; oran `[-1,1]` aralığındadır (negatif = ankraj üstte).
6. **App yüzeyi.** IIP-10'un dispatcher deseni yeniden kullanıldı: **yeni App
   üyesi eklenmedi**, hiçbir paylaşılan fixture pinlenmedi/zayıflatılmadı.

## Bulgu

**IIP11-REV-03 (yüksek, düzeltildi).** Ölçek CSS'i yanlış sarmalayıcıyı
hedefliyordu (`.saygi-article` ≠ okuyucu modal'ının `.saygi-article-modal` sınıfı)
→ ölçek asıl yüzeyde hiç uygulanmıyordu. `1em * scale` ayrıca özgün taban boyutunu
eziyor ve ebeveyne göre çözülüyordu. Ölçek artık her bloğun gerçek tabanıyla
çarpılır; ölçek içeren her kural modal'ı içermek zorunda (iki mutasyonla
doğrulandı).

**IIP11-REV-02 (yüksek, düzeltildi).** `App.openSaygiReading` yanlışlıkla
silinmişti; markup onu iki yerde çağırıyordu ve okuma kaydı köprüsü kırıktı. Yüzey
sayısı 719=719 kaldığı için hiçbir pin yakalamadı. Handler geri kondu, altı pin
doğru değere çekildi ve yetim-handler bekçisi eklendi.

**IIP11-REV-01 (düzeltildi).** Okuma konumu oranı ilk uygulamada `[0,1]` aralığına
kırpılıyordu; doğru aralık `[-1,1]`dir. `[0,1]` kırpma negatif yarıyı (ankraj
görünümün üstündeyken) yok ediyor ve Aa sonrası geri dönüşü bozuyordu. Fixture
yakaladı; kırpma `[-1,1]`'e düzeltildi ve test yeşile döndü.

## Bilinen sınırlar

- Ekran okuyucu ile gerçek okuma akışı ve %200 metinle cihaz testi yapılmadı;
  cihaz kabulü ayrıdır.
- Bölüm atlama yalnız başlık (`h`) bloklarını hedefler; başlıksız kısa metinde
  denetim çizilmez (bilinçli — boş araç yanıltıcı olurdu).
- B alternatifi bir ürün kararıdır ve varsayılan açıktır; kapatılabildiği
  fixture'da gösterilmiştir.
