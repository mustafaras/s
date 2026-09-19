# Ekran şartnamesi — 12 yüzey

Bunlar hedef ürün sözleşmeleridir, üretilmiş görsel prototip veya mevcut özellik iddiası değildir. Her ekran IIP-02'de yüksek ayrıntılı tasarım, ilgili uygulama kartında gerçek render kanıtı alır. Ortak ekran kimlikleri test ve görsel dosya adlarında kullanılır.

## Ortak kompozisyon

Birincil görev, içerik ve araç olmak üzere üç görsel ağırlık vardır. Başlık tekrar edilmez; bir ekranda bir ana dolu CTA, ikincil eylemlerde sakin yüzey. Portre ve desen metni perdelemez. Mobil 390×844 referansında üst bağlam yaklaşık 120–170 px, ana içerik başlangıcı ilk görünümde; bunlar taslak oranlardır, sistem başlığı/safe-area ölçülerek düzeltilir. Büyük yazıda ilk görünüm hedefi için metin kırpılmaz.

### S01 — Bugün

**İş:** nereden başlayacağını seçmek. Üstte bölüm başlığı ve beşli nav; altında küçük vakit/tarih; 1 günlük seçki; en çok 2 devam satırı; altta keşif bağlantıları. Seçki portresi/doku alanı kartın en çok üçte biri, başlık 2–3 satır sarılabilir. Örnek editoryal başlık: “Bugün bir fikre yer aç”. Ana CTA “Okumaya başla”. Sayaç rozetleri hero'nun önüne geçmez.

**Durumlar:** ilk girişte devam satırı yok; içerik yoksa mevcut öncüye açık bağlantı; source loading yalnız ilgili kartta; gün değişince seçim kullanıcı okumasını bölmeden sonraki girişte güncellenir. **Dönüş:** seçki dönüşü aynı scroll. **Kart:** 04/09/12. **Kanıt:** normal + boş + hata + uzun başlık.

### S02 — İlham keşfi

**İş:** adı veya konusu ile bir öncü bulmak. Başlık, arama, açılıp kapanabilir filtre özeti, sonuç adedi, isimli sonuç listesi. Her satır portre/monogram, ad, alan, kısa açıklama ve okundu metni. Mobil tek sütun; geniş ekranda iki sütun, okuma sırası doğal. 100 numaralı grid ikincil koleksiyon görünümü olarak korunabilir.

**Durumlar:** sorgu yazılırken odak sabit; sonuç yoksa sorgu korunur ve “Filtreleri temizle”; resim yoksa sabit ölçülü monogram. **Dönüş:** sorgu/filtre/listedeki kişi konumu oturumda korunur. **Kart:** 10. **Kanıt:** 100 sonuç, tek sonuç, sıfır sonuç, görselsiz.

### S03 — Öncü okuyucusu

**İş:** kesintisiz okumak. Üst araç çubuğu geri/Aa; başlık, alan, kaynak, süre; özgün giriş; biyografi; “Üzerinde düşün”; kaynak/lisans; mevcut Okudum eylemi. Ana metnin altına yapışan reklam benzeri kart yok. Uzun kişi ismi küçük fonta zorlanmaz.

**Durumlar:** makale yüklenirken iskelet ana metin alanına; TR yok EN gelirse dil etiketi; cache sürümü; hata/tekrar dene; okunmuş içerikte mevcut kayda git. **Dönüş:** modal açan kontrol; yeni kişi yüklemesi eski makale promise'ini geçersiz kılar. **Kart:** 05/11. **Kanıt:** 1 ve 20 paragraflı sentetik metin, %200, ekran okuyucu.

### S04 — İbadet ana ekranı

**İş:** zamanı anlamak ve kayıt açmak. Şehir/yöntem/tarih; sıradaki zaman; zaman çizelgesi; kayıt alanı; Kur’an/Zikir/Kıble/Takvim araçları. Güneş gibi zaman işaretleri ile kayıt yapılan ibadetler aynı ikon/metin durumuna sıkıştırılmaz. Eski kayıt belirsizse “Eski kayıt” alanında gösterilir.

**Durumlar:** GPS yoksa mevcut il seçimi; cache eskise bilgi bandı; saat bilinmiyorsa “—” ve açıklama. **Dönüş:** seçili gün korunur. **Kart:** 06/13/14. **Kanıt:** bugünkü/eski/eksik/şehir değişmiş vakit.

### S05 — Kayıt ayrıntısı

**İş:** mevcut alanları doğru gün/vakit için düzenlemek. Gün ve kayıt başlığı sabit; birincil durum; cemaat/geç/kaza/nafile/not ikincil ayrıntılar; mevcut kaydet/düzelt modeli. Görsel yenileme yeni onay adımı eklemez. Hedef ürünün undo davranışı mevcut domain API'sine göre kartta doğrulanır, varmış gibi kabul edilmez.

**Durumlar:** geçmiş gün uyarısı, kaydedilemediğinde taslak korunumu, iptal, kayıtlı değer. Klavye metni ve eylemi örtmez. **Kart:** 06/14. **Kanıt:** klavye, cancel, çift tıklama, gün değişimi.

### S06 — Zikir odak

**İş:** mevcut çalışmaya odaklanmak. Ad/anlam; aktif hatim/tur bağlamı; büyük sayaç; geri al/manuel giriş; anlam ve tefekkür alanı. Zikir arayüzünün mevcut güçlü tasarımı korunur; yeni kabuk ve kaynak dili uyarlanır. Yeni süslü sayaç motoru yazılmaz.

**Durumlar:** hazır/sayılıyor/tur tamam/hatim tamam/manuel giriş/geri al; kilit ekranı dönüşü; wake-lock yok. **Kart:** 07/12. **Kanıt:** tıklama yoluyla işlev, yalnız screenshot değil.

### S07 — Kur’an çalışma

**İş:** mevcut sûre çalışmasını sürdürmek. Sûre kimliği/nüzul ve durum; birincil sonraki eylem; video veya yokluk açıklaması; mevcut video notu; kaynak. Yeni genel “istek” kısayolu eklenmez. Ana odak video olduğunda editoryal vitrin alan kaplamaz.

**Durumlar:** idle/pending/error/delivered/watched/video unavailable; uzak güncelleme kontrolü; eski yanıt. **Kart:** 07/09. **Kanıt:** transport fixture + video DOM/not caret korunumu.

### S08 — Dua ve seçki okuyucusu

**İş:** kaynağı bilerek okumak. Başlık ve tür; Arapça; ayrı okunuş; ayrı anlam; kaynak; editoryal bağlam; isteğe bağlı düşünme. Metin türü ikonla değil görünür başlıkla ayrılır. Arapça blokta Latin tracking kullanılamaz.

**Durumlar:** lisans/inceleme bekleyen taslak kullanıcı kataloğunda görünmez; font yüklenmezse okunabilir fallback; yorum boşsa bölüm kaldırılır. **Kart:** 16/17. **Kanıt:** uzun harekeli metin, RTL/LTR karışık referans, kaynak modalı.

### S09 — Kıble ve takvim

**İş:** bir araçtan güvenilir bilgi almak. Kıblede hedef/cihaz yönü ve açıklama; takvimde tarih/offset/mübarek gün. İzin yalnız açık eylemle, reddedilince aynı sayfada hesap bilgisi devam eder. Yeni takvim doğruluk iddiası yok.

**Durumlar:** sensör kapalı/izin reddi/hassasiyet bilinmiyor; ±2 Hicri offset; şehir merkezi/GPS ayrımı. **Kart:** 06/13/17. **Kanıt:** sentetik sensör + kullanıcı cihazı ayrı.

### S10 — Ritim

**İş:** geçmiş kayıtların ne anlattığını görmek. Dönem, kayıt kapsamı, 3 ayrı faaliyet özeti, grafik+metin listesi, gün detayı. “Maneviyat/iman/başarı puanı” yok. Ay/yıl ısı haritası tek gezinti yolu değildir.

**Durumlar:** kayıt yok, yalnız not, karma eski/yeni kayıt, artık yıl; belirsiz payda oranı saklar. **Kart:** 15. **Kanıt:** bağımsız sayısal oracle, panel eşliği ve klavye listesi.

### S11 — Yer imleri ve yeniden ziyaret

**İş:** daha önce seçilen içeriği tekrar bulmak. İçerik türü, başlık, kaynak/sürüm; silme işlemi açık ve mümkünse geri alınabilir; yeniden açılan içerik değişmişse konum için açıklama. Yeni not toplama özelliği eklenmez.

**Durumlar:** boş, eski içerik sürümü, geri çekilmiş içerik, eşzamanlı silme. **Kart:** 20. **Kanıt:** merge/tombstone/migration ve odak dönüşü.

### S12 — Yolculuk ve offline yönetimi

**İş:** bir küçük programı sürdürmek; genel paketin durumunu bilmek. 7 gün listesi, bugünkü içerik, durdur/devam; offline ayarları ayrı araç panelinde sürüm/boyut/indirildi bilgisi. İçeriğe başlamak paket indirmeyi zorunlu kılmaz.

**Durumlar:** başlamadı/devam/ara/tamamlandı; indirme yok/kuruluyor/hazır/kota/eksik/silindi. **Kart:** 21/22. **Kanıt:** çift tamamla, kesik indirme, aktif çalışmada güncelleme.

## Görsel inceleme dosya adları

`S03-dark-390x844-text200-error.png` gibi ekran/tema/ölçü/metin/durum içeren adlar; yanlarında kullanılan sentetik veri etiketi, commit+diff hash ve gözlem notu. Dosyanın varlığı tek başına görsel PASS sayılmaz. Görsel üretim yetkisi yoksa çizim/spec tamamlanabilir, gerçek render kabulü bekler.
