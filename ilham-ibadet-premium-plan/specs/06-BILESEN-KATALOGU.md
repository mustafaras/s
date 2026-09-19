# Bileşen kataloğu — uygulayıcı için ayrıntı

Bu katalog önerilen tasarım API'sidir; yeni global JS bileşen sistemi veya framework kurulmaz. Mevcut HTML builder/registry içinde küçük ortak sunum sözleşmeleri uygulanır. Nihai CSS adları IIP-02'de mevcut isimlerle eşleştirilir. Ana rol/tokenlar [tasarım sisteminde](../03-TASARIM-SISTEMI.md).

## C01 — Bölüm gezintisi

**Anatomi:** erişilebilir nav adı → seçili bölüm → ikon+metinli beş düğme. **Varyant:** normal, dar, büyük metin, focus, selected. Mevcut `aria-current` semantiği korunabilir; ARIA tab rolüne geçilirse ok tuşu/Home/End sözleşmesi bütünüyle uygulanmadan yarım tab sistemi yapılmaz. Dar görünümde kontrollü sarma, gizli yatay menü yok. Seçili durumu renk+şekil/metin ağırlığıyla. Tüm düğmelerin dokunma kutusu 44×44 ürün hedefini karşılar. Düğme içinde ikinci tıklanır hedef yok.

## C02 — Editoryal odak kartı

**Anatomi:** tür etiketi → başlık → kısa özgün giriş → kaynak/süre → ana CTA; görsel isteğe bağlı. Başlık sırası semantik heading yapısını izler. Kartın tamamı button ise içinde ayrı link olmaz; kaynak/CTA ayrıysa kart semantik article'dır. **Varyant:** portreli, metin odaklı, loading, source error, completed. Loading aynı yaklaşık alanı korur, hareket azaltmada parlamaz. Görsel dekoratifse boş alt; kimlik taşıyorsa kısa anlamlı alt. Hata boyu için sabit kart yüksekliği dayatılmaz.

## C03 — Devam satırı

**Anatomi:** tür simgesi → çalışma adı → gerçek durum → Devam. En fazla iki satır liste. Uzun ad sarılır; sayaç/hatim sayısı sabit genişlikte tabular-nums; durum açıklaması asıl bilgidir. Sırf satır dengesi için “%0” üretilmez. Arşivli/bozuk kayıtta satır kaldırılır ve diğer iş etkilenmez. Açılma hedefi mevcut domain handler'ına gider. Return focus aynı satır veya bölüm başlığıdır.

## C04 — Vakit ve kayıt satırı

**Anatomi:** zaman adı+saat → zamansal açıklama → bağımsız kayıt durumu → ayrıntı. Zaman çizelgesinde saat yalnız bilgi olabilir; bu satır görünümü otomatik ibadet checkbox'ı değildir. Gelecek/geçmiş vaktin görsel tonu yapılmış/yapılmamış kayıtla karışmaz. Eski cache küçük ama görünür tarih metniyle; yalnız tooltip yok. Not/nafile alt alanları klavye açıkken alt eylemi örtmez. Kayıt gününü geçmişte düzenlerken üst bağlam korunur.

## C05 — Okuyucu araç ve eylem alanı

**Üst:** geri, kısa bağlam, Aa. **Alt:** mevcut Okudum/kayıt eylemi; safe-area kadar ek alan, gövdede aynı büyüklükte boşluk. 320 px genişlikte iki satır metin taşabilir; hiçbir cihazda metin üzerine absolute CTA oturtulmaz. Modal z-index ortak mevcut katmanlarla uzlaştırılır; yeni en-büyük-sayı yarışı yok. Ekran okuyucu düğmenin kilit nedenini description ile alır. Aa popup'ı açılınca üst üste focus trap kurulmaz; kapanınca Aa'ya odak döner.

## C06 — Kaynak ve içerik türü

**Anatomi:** kaynak kurum/eser → referans → içerik türü/dil → lisans/açıklama → dış bağlantı. Asıl metin, meal ve editoryal yorum ayrı section/heading; kaynak ikonuna basmadan temel atıf görülebilir. Dış bağlantı yeni pencere açıyorsa erişilebilir metni bunu belirtir. URL ve alıntılar escape/sanitize sınırından geçer; renderer güvenilmeyen HTML'i doğrudan basmaz. Kaynak çekmecesi yüklenemese ana metin varsa kaybolmaz; atıf “doğrulandı” rozeti otomatik verilmez.

## C07 — Arama, filtre ve sonuç

**Anatomi:** görünür etiketli search → aktif filtre özeti → sonuç sayısı → sonuç listesi. Debounce kullanıcıya gecikme hissettirmeyecek yerel sınırda IIP-10 ölçümüyle seçilir; sabit ağ araması eklenmez. İlgisiz her tuşta bütün uygulama render edilmez. Composition ve caret korunur. Filtreler buton veya doğal form öğesi; aç/kapa `aria-expanded` ile. “Hepsini temizle” sorgu ve filtre kapsamını açık anlatır. Sonuç değişimi screen reader'da ölçülü polite bildirilir; her tuşta uzun liste okunmaz.

## C08 — Durum, geri bildirim ve veri görselleştirme

**Anatomi:** durum başlığı → neden → tek kurtarma eylemi. Boş, hata ve gerçek sıfır ayrı görünümler. Başarı toast'ı ilgili overlay üstünde ama fokus almadan; kalıcı hata toast kaybolunca anlaşılmaz hâle gelmez, satırda da bulunur. Isı haritası metin listesiyle eşdeğer; renk yalnız süs değilse açıklamalı lejant. Gün seçimi title tooltip'ine bağımlı olmaz. 365 hücre için klavye stratejisi (roving veya eşdeğer liste) bütün uygulanır; yarım grid ARIA yok.

## Bileşen kabul fişi

Her C01–C08 için: tüketen S ekranları, mevcut builder/CSS sahibi, token eşleme, varyantlar, focus/klavye, light/dark, %200, reduced-motion, hata/boş hâl, görsel artifact ve reviewer kararı. Bu fiş IIP-02 tasarımında açılır; ilgili üretim kartında actual render ile tamamlanır.
