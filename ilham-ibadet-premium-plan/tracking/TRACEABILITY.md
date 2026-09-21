# Gereksinim → kart → test → kanıt

Üretilmiş görünüm; kriterler `REQUIREMENTS.json`, sonuçlar state receipt dizilerinden gelir. TC kimlikleri test senaryosudur; hepsi henüz otomatik test dosyası değildir.

| REQ / TC | Kart | Kabul | Olumsuz kontrol | Kanıt receipt sayısı |
|---|---|---|---|---|
| REQ-001 / TC-001 | [IIP-01](../cards/IIP-01.md) | Bugün, beş iç sekme, overlay ve reminder girişlerinin her biri sahip fonksiyon/DOM/veri/test satırına bağlı. | Kaynakta bir giriş eksik bırakıldığında envanter incelemesi başarısız sayılır. | 3 |
| REQ-002 / TC-002 | [IIP-01](../cards/IIP-01.md) | App isim/imza, çağrı grafiği, data rebind, shell ve yükleme listesi baseline olarak kaydedilir. | Değişmiş handler veya eksik script-list girişi dar fixture tarafından yakalanır. | 3 |
| REQ-003 / TC-003 | [IIP-02](../cards/IIP-02.md) | 12 ekranın ana varyantları; ışık/koyu ve büyük yazı için görsel referans üretilecek. | Sadece güzel hero olup hata/okuyucu/kayıt ekranı tasarlanmamışsa kabul yok. | 4 |
| REQ-004 / TC-004 | [IIP-02](../cards/IIP-02.md) | Her bileşenin renk/font/boşluk/radius/hareket rolü mevcut tokena veya gerekçeli öneriye bağlı. | Hardcoded renk, değişik ikon dili ve ölçülmemiş kontrast listede açık kalır. | 4 |
| REQ-005 / TC-005 | [IIP-03](../cards/IIP-03.md) | fajr/sunrise dahil altı alanın tarihsel UI, API ve panel anlamı belgelenir. | Sunrise eski kaydı belirsizse beş vakte otomatik dönüştürülmez. | 4 |
| REQ-006 / TC-006 | [IIP-03](../cards/IIP-03.md) | Nesne varlığı gerçek kayıt sayılmaz; bilinmeyen gün, sıfır ve zaman kapsamı ayrı tanımlanır. | Migration ile oluşmuş boş prayer nesnesi bilinçli sıfır diye raporlanmaz. | 4 |
| REQ-007 / TC-007 | [IIP-04](../cards/IIP-04.md) | Mevcut sıra korunarak araçlar kompakt, seçili içerik belirgin; her kontrol görünür. | 320 px ve yüzde 200 metinde başlık/eylem kesilmez. | 5 |
| REQ-008 / TC-008 | [IIP-04](../cards/IIP-04.md) | Seçili bölüm metin ve semantikle belirtilir; klavye/odak mevcut davranışı korur. | Sadece altın renkli seçim veya odak görünmezliği kabul edilmez. | 5 |
| REQ-009 / TC-009 | [IIP-05](../cards/IIP-05.md) | Metin 45–75 karakter hedefinde; paragraf, alıntı ve kaynak görsel olarak ayrılır. | Uzun Türkçe başlık, portresiz kişi ve uzun kaynak footer ile kesilme yok. | 5 |
| REQ-010 / TC-010 | [IIP-05](../cards/IIP-05.md) | Sabit eylem safe-area alanında son paragrafı örtmez; kilit nedeni görünür. | Yükleniyor/uzun içerik/okundu durumunda düğmenin işlevi mevcut kontratla aynı. | 5 |
| REQ-011 / TC-011 | [IIP-06](../cards/IIP-06.md) | Saat, kaynak, kayıt durumu, ayrıntı birbirine karışmaz; altı eski alan erişilir. | Büyük yazıda saat ve kayıt kontrolü üst üste binmez. | 5 |
| REQ-012 / TC-012 | [IIP-06](../cards/IIP-06.md) | Hesaplanan yön, cihaz yönü, hassasiyet ve sensör reddi ayrı okunur. | Sensör yokken sahte canlı ibre gösterilmez; var olan hesap korunur. | 5 |
| REQ-013 / TC-013 | [IIP-07](../cards/IIP-07.md) | Mevcut sayaç, hatim, manuel giriş, geri alma ve notlar aynı davranışla korunur. | 100 hızlı giriş, arka plan render ve hatim sınırı testi kayıpsız geçer. | 5 |
| REQ-014 / TC-014 | [IIP-07](../cards/IIP-07.md) | Sûre durumu, video ve notlar görsel iyileştirme sırasında korunur. | Not caret ve video düğümü arka plan güncellemesinde yeniden kurulmaz. | 5 |
| REQ-015 / TC-015 | [IIP-08](../cards/IIP-08.md) | İlgili dar testler, VM, syntax, bütçe ve diff kanıtı dosyalanır. | Bir FAIL varken A kabulü kapanmaz; fixture pinleri gerekçesiz güncellenmez. | 4 |
| REQ-016 / TC-016 | [IIP-08](../cards/IIP-08.md) | Planlanan ekran matrisi gerçek render üzerinde incelenir; cihaz kanıtı ayrı tutulur. | VM PASS ekran görüntüsü veya cihaz kabulü diye etiketlenmez. | 4 |
| REQ-017 / TC-017 | [IIP-09](../cards/IIP-09.md) | Bugün/İlham/İbadet/Zikir/Ritim; Kur’an ve kıble hedefleri en çok iki dokunuş. | Eski deep-link ve dönüş bağlamı aynı hedefe gider; hiçbir işlev kaybolmaz. | 5 |
| REQ-018 / TC-018 | [IIP-09](../cards/IIP-09.md) | Modal kapanınca açan kontrol, seçili sekme ve scroll korunur. | Hızlı aç/kapa ve tarayıcı geri hareketi çift modal veya boş kabuk üretmez. | 5 |
| REQ-019 / TC-019 | [IIP-10](../cards/IIP-10.md) | 100 kişi isim/alan/okundu ile aranır; Türkçe normalizasyon yalnız arama indeksine uygulanır. | I/İ/ı/i, boş sorgu, birden fazla filtre ve sıfır sonuç geçer. | 5 |
| REQ-020 / TC-020 | [IIP-10](../cards/IIP-10.md) | İsimli liste birincil; grid ikincil özet; bütün kişiler eşdeğer erişilebilir. | Koleksiyon klavyeyle 100 anlamsız numara zincirine mahkûm etmez. | 5 |
| REQ-021 / TC-021 | [IIP-11](../cards/IIP-11.md) | Oturumluk Aa, bölüm atlama ve konum koruma; varsayılana dönme var. | Büyütme sırasında metin ankrajı kaybolmaz; RTL ayrı dil yönü taşır. | 5 |
| REQ-022 / TC-022 | [IIP-11](../cards/IIP-11.md) | Mevcut gate A’da korunur; B’de erişilebilir alternatif açık ürün kararıyla eklenir. | Kaydırma/ekran okuyucu erişimi otomatik okudum kaydı oluşturmaz. | 5 |
| REQ-023 / TC-023 | [IIP-12](../cards/IIP-12.md) | Tek odak önerisi kaynak/süre ve seçim gerekçesiyle; deterministik seçilir. | Aynı gün yeniden render öneriyi rastgele değiştirmez; içerik yoksa dürüst boş hâl. | 5 |
| REQ-024 / TC-024 | [IIP-12](../cards/IIP-12.md) | Yalnız mevcut geçerli aktif zikir/Kur’an kaydı; yeni state kopyası yok. | Boş/bozuk/arşivlenmiş kayda giden Devam düğmesi oluşmaz. | 5 |
| REQ-025 / TC-025 | [IIP-13](../cards/IIP-13.md) | Tarih/şehir/yöntem eşleşmeyen cache açıkça eski olarak gösterilir. | Gece yarısı, şehir değişimi, timeout ve yöntem değişimi sahte güncel saat üretmez. | 5 |
| REQ-026 / TC-026 | [IIP-13](../cards/IIP-13.md) | Türkiye kapsamı açık; seyahat için otomatik destek iddiası yok. | GPS yurtdışında olsa bile Istanbul saati yerel saat diye sunulmaz. | 5 |
| REQ-027 / TC-027 | [IIP-14](../cards/IIP-14.md) | B’de yalnız sunum adaptörü; eski sunrise kayıtları ayrı tarihsel kayıt olarak kalır. | Girdi JSON önce/sonra aynı; belirsiz kayıttan yeni ibadet sınıfı türetilmez. | 0 |
| REQ-028 / TC-028 | [IIP-14](../cards/IIP-14.md) | Mevcut kaydet/düzelt eylemleri tek kez uygulanır; yeni namaz şeması program dışı ayrı ADR/backlog konusudur. | Çift tıklama, cancel ve geçmiş gün düzenleme kayıt çoğaltmaz. | 0 |
| REQ-029 / TC-029 | [IIP-15](../cards/IIP-15.md) | Vakit/zikir/okuma ayrı toplam; anlamsız birleşik skor veya belirsiz yüzde yok. | Gün yok, yalnız not, artık yıl ve eski kayıt örneği bağımsız hesapla aynı. | 0 |
| REQ-030 / TC-030 | [IIP-15](../cards/IIP-15.md) | Current-panel ile uygulama aynı kayıt tanımını kullanır; Panel-v2 ayrı regresyon. | Eski veri ve karma kayıtlar iki yüzeyde anlam değiştirmez. | 0 |
| REQ-031 / TC-031 | [IIP-16](../cards/IIP-16.md) | 10 öncü/12 dua/6 tema için kaynak, hak, bağlam ve insan incelemesi dosyalanır. | İncelenmemiş metin published durumuna geçmez; uydurma alıntı reddedilir. | 0 |
| REQ-032 / TC-032 | [IIP-16](../cards/IIP-16.md) | Kararlı id/sürüm, tür, lisans, düzeltme ve geri çekme kuralları vardır. | Kaynak geri çekilse geçmiş okuma kaydı silinmez; frozen katalog sessiz değişmez. | 0 |
| REQ-033 / TC-033 | [IIP-17](../cards/IIP-17.md) | Arapça/okunuş/meal/yorum ayrılır; kaynak bir eylemle açılır. | Hareke, RTL, font yok, yüklenemeyen içerik ve uzun referans geçer. | 0 |
| REQ-034 / TC-034 | [IIP-17](../cards/IIP-17.md) | İçerik türleri birbiriyle karıştırılmadan tematik bağlantıyla sunulur. | Editoryal tefekkür dinî metinmiş gibi aynı blokta görünmez. | 0 |
| REQ-035 / TC-035 | [IIP-18](../cards/IIP-18.md) | Akış, rapor, kaynak ve panel kanıtı birlikte incelenir. | 14–19 arasında koşullu bağımlılık döngüsü veya gizli migration bulunmaz. | 0 |
| REQ-036 / TC-036 | [IIP-18](../cards/IIP-18.md) | Pilot lisans/uzman incelemesi ve erişilebilirliği tamamlanmadan ürün yayını yok. | Taslak içerik üretimi yayın onayı diye işaretlenmez. | 0 |
| REQ-037 / TC-037 | [IIP-19](../cards/IIP-19.md) | Yeni alanlar için kimlik/sürüm/tombstone/merge/eski istemci/rollback tanımlı. | Aynı içerik için çift depo ve tarihsel veri kaybı tasarım incelemesinde engellenir. | 0 |
| REQ-038 / TC-038 | [IIP-19](../cards/IIP-19.md) | Yeni her alan için cihaz/data/panel/snapshot matrisi ve kullanıcı kararı var. | Özel not ya da tercih otomatik observer snapshot kapsamına eklenmez. | 0 |
| REQ-039 / TC-039 | [IIP-20](../cards/IIP-20.md) | Yer imi ve okuyucu tercihleri tek şemada; silme ve geri dönüş tanımlı. | İki cihaz çatışması, eski istemci ve migration ikinci çalışması test edilir. | 0 |
| REQ-040 / TC-040 | [IIP-20](../cards/IIP-20.md) | Konum contentId+revision+blockId ile; sürüm uyuşmazlığında güvenli başa dönüş. | Eski paragraf numarası yeni metinde rastgele konuma atlatmaz. | 0 |
| REQ-041 / TC-041 | [IIP-21](../cards/IIP-21.md) | Bir program, durdur/devam et, atlanan günde ceza yok; tamamlama açık eylem. | Çift tamamla ve içerik sürüm değişimi ilerlemeyi çoğaltmaz/silmez. | 0 |
| REQ-042 / TC-042 | [IIP-21](../cards/IIP-21.md) | Programın tamamlanması yeniden okumayı engellemez; içerik arşivi ulaşılır. | Program kapatılınca eski kayıt ve yer imleri korunur. | 0 |
| REQ-043 / TC-043 | [IIP-22](../cards/IIP-22.md) | Yalnız onaylı genel içerik; boyut/sürüm/kota/kaldırma ve kurulum durumu açık. | Tokenlı cevap veya kişisel JSON cache manifestine giremez. | 0 |
| REQ-044 / TC-044 | [IIP-22](../cards/IIP-22.md) | Aktif sayaç/not sırasında yeni SW sürümü zorla reload yapmaz. | Kısmi paket, kota hatası ve eski manifestten dönüş kullanımı kilitlemez. | 0 |
| REQ-045 / TC-045 | [IIP-23](../cards/IIP-23.md) | App/current-panel/Panel-v2, state/sync ve görsel kanıt ayrı raporlu. | Önemli bir fonksiyonun yalnız markup varlığıyla geçtiği kabul edilmez. | 0 |
| REQ-046 / TC-046 | [IIP-23](../cards/IIP-23.md) | iPhone Safari/PWA, Android Chrome ve klavye/ekran okuyucu örnekleri kayıtlı. | Ajan VM çıktısı kullanıcı cihazı sonucu diye doldurulmaz. | 0 |
| REQ-047 / TC-047 | [IIP-24](../cards/IIP-24.md) | Gereksinim→kart→test→kanıt→revizyon zinciri; bilinen sınırlar ve geri alma hazır. | Eksik kritik kabul, içerik hakkı veya yetki varken yayın hazır denmez. | 0 |
| REQ-048 / TC-048 | [IIP-24](../cards/IIP-24.md) | Tek state, sahiplik, bağımlılık, kanıt ve ledger aynı teslimde tutarlı. | Sahte done, döngü, eksik kanıt ve çakışan dosya kilidi denetimle yakalanır. | 0 |
