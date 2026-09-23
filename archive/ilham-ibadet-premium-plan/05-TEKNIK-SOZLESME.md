# 05 — Teknik sözleşme ve veri güvenliği

## Yetki ve mevcut mimari

Bu dosya bir tasarım önerisidir. Mevcut [teknik ilkeler](../docs/GELISTIRME-PLANI.md), [işlev sözleşmesi](../docs/apple-design/IOS27-TASARIM-PLANI.md), [alan haritası](../docs/monolit-bolumlenme-haritasi.md) ve [MON2 kararları](../archive/monolit-bolumlenme-plan-2/README.md) temel alınır. Plan yeni bir monolit bölme programı başlatmaz.

**A paketi (IIP-01–08):** I1 veri şekli, I2 handler isim/imzaları, I3 migration, I4 render çağrı grafiği, I5 ağ/sync korunur; I6 her kart geri alınabilir. IIP-03 erken güven kopyası düzeltmesini de içerir; mevcut hesap ve veri değişmez. Görsel değişim adı altında yeni kayıt, düğme handler'ı veya gizli davranış eklenmez.

**B paketi (IIP-09–18):** navigasyon, hesap, oturumluk UI ve içerik sunumu değişir. Etkilenen I2/I4 sınırları kart bazında açıkça onaylanmadan uygulamaya geçilmez; mevcut global sözleşme sessizce gevşetilmez. Yeni içerik modülü gerekiyorsa alan haritası ve yükleme kararı önce tamamlanır. Kalıcı şema değişiklikleri C paketine aittir.

**C paketi (IIP-19–24):** yeni kalıcı tercih/yer imi/yolculuk ve çevrimdışı paket önerileri; I1/I3/I5 etkileri ayrı sözleşme gerektirir. “Planı uygula” kapsamı hangi kartları içeriyorsa yalnız onlar yürütülür. Yayın ve dış veri yazımı ayrıca yetkilendirilir.

## Dosya sahipliği

| İş | Birincil sahip | Korunacak sınır |
|---|---|---|
| Hub, öncü, ibadet raporu | `app/core/saygi.js` | Mevcut state getter/dependency-bag modeli |
| Vakit kaynakları ve zaman hesabı | `app/core/prayer.js` | Tarih/konum/yöntem/cache anahtarları |
| Zikir davranışı ve yerel UI | `app/core/zikir.js` | Sayaç/hatim/not tek gerçek kaynağı |
| Kur’an iş akışı | `app/core/quran.js` | Durum makinesi, idempotent teslim/pull |
| Kur’an HTML ve overlay birleşimi | `app/core/render.js` | Mevcut render/odak mekanizması |
| Görsel yüzey | `app/styles.css` | Dar `.saygi-page`/ilgili overlay kapsamı; global CSS sızıntısı yok |
| Katalog | `app/content/*` mevcut frozen modüller | Yerinde sessiz metin/kimlik değişimi yok |
| Mutation/rebind/boot ve handler ataması | `app.js` ve mevcut sahipler | Yeni iş gövdeleriyle kabuğu büyütme yok |
| State/sync/panel | `state.js`, `sync.js`, `panel/` | Yalnız ilgili onaylı veri kartı |

Yeni dosya gereksinimi önce mevcut alan sahibiyle değerlendirilir. Gerçekten yeni modül onaylanırsa `index.html`, driver FILES, zikr-harness FILES ve state-rebind boot listesi aynı değişimde güncellenir. Mevcut shell bütçesi 7.800/0/450/150; güncel ölçüm 7.610/0/408/57. Testi geçirmek için pin veya bütçe artırılmaz.

## Namaz anlam ve veri kararı

Altı zaman işareti gösterimi ile takip edilen ibadetlerin listesi ayrı kavram olarak tasarlanmalı. `sunrise` eski kayıtları silinmez veya doğrudan başka vakte taşınmaz. Önce `fajr/sunrise` alanlarının geçmiş UI anlamı ve panel karşılığı belirlenir. Alan incelemesi sonucuna göre bir sunum/hesap adaptörü önerilir; B paketinde migration yapılmaz. Belirsiz kayıt tarihsel olarak ayrı gösterilir; oran üretilmez. Yeni namaz şeması bu programın zorunlu kapsamı değildir; ayrı backlog/ADR ister ve IIP-19’a bağımlılık yaratmaz.

Raporda yalnız kaydedilen toplam güvenle sunulur. Açık uygunluk/katılım bilgisi olmadan oran “ibadet başarısı” diye gösterilmez. Mevcut şemada boş gün ile bilinçli sıfır ayrıştırılamıyorsa bu belirsizlik gösterilir. Yeni payda yalnız tanımı, tarih aralığı ve geçmiş kayıt politikası test edildiğinde devreye girer.

## Önerilen kalıcılık matrisi

| Bilgi | İlk paket | Genişletme kararı |
|---|---|---|
| Açık sekme, arama, filtre | `ui`, geçici | Sync edilmez |
| Sayaç/hatim/tefekkür | Mevcut `data.zikr` ve günlük aynaları | Yeni kopya depo yok |
| Sûre durumu ve video notu | Mevcut Kur’an modeli | Transport'tan bağımsız ikinci ilerleme yok |
| Öncü okundu | Mevcut `data.saygi` ve günlük kayıt | Çift okuma kaydı önlenir |
| Yazı boyutu/yer imi/okuma konumu | A paketinde geçici veya yok | C'de tek `data` kökü altında adlandırılmış şema |
| Genel düşünme notu | İlk kapsamda yok | Gizlilik, panel yansıması ve silme sözleşmesiyle ayrı karar |
| Kaynak metni/görsel cache | Kişisel not içermez | Boyut/sürüm/son-kullanım ile bağımsız cihaz cache |

Yeni kayıt tasarımı yapılırsa: sürüm, kararlı kimlik, güncelleme zamanı, silme/tombstone, çoklu cihaz çatışması, migration idempotence ve eski istemci davranışı birlikte tanımlanır. “Diziye ekle ve sync et” yeterli değildir. Yeni notu observer snapshot'a otomatik taşımak yerine mevcut redaction/coverage sözleşmesi değerlendirilir; roadmap'in panel yansıması kuralı korunur, paylaşılacak ayrıntı açıkça kararlaştırılır.

## Ağ ve çevrimdışı

Mevcut AlAdhan, Wikipedia ve Kur’an transport kanalları kendi sahiplerinde kalır. AlAdhan'da Diyanet hesap yöntemi bulunması resmî Diyanet saat servisiyle birebir veri kaynağı olduğu anlamına gelmez: [hesap yöntemleri](https://aladhan.com/calculation-methods). UI kaynak ve yöntem ayrımını göstermeli.

A/B paketinde yeni API, reminder zamanlayıcısı veya yeni uzak yazma endpoint/payload türü yok. Mevcut kullanıcı kayıtlarının mevcut save/sync akışı korunur; bu cümle mevcut eşitlemeyi kaldırma talimatı değildir. Ajan doğrulaması sentetiktir, canlı veri yazmaz. Kaynak hatasında tarihi farklı vakit bugünün saatiymiş gibi sunulmaz. Türkiye dışı saat dilimi otomatik desteği ayrıca tasarlanır; `Europe/Istanbul` sessizce değiştirilmez.

C'deki offline paket önerisi yalnız uygulama kabuğu ve onaylı genel içerik içindir: cache manifesti, sürüm, tahmini boyut, kota hatası, eski pakete dönüş ve kullanıcı kaldırma eylemi gerekir. Tokenlı GET, kişisel JSON, panel yanıtı, video ve dış servis yanıtları genel SW cache'ine konmaz. Önerilen ilk genel içerik paketi üst sınırı 10 MB; ölçülmüş mevcut boyut değildir. SW güncellemesi sayaç ortasında zorla reload yapamaz.

Uygulama kapalıyken garantili vakit bildirimi bu statik mimarinin mevcut teslimatı değildir. Frozen reminder programı bu planla açılmaz; mevcut deep-link davranışı yalnız regresyon olarak korunur.

## Geri alma ve sürüm

Her uygulama kartı dar diff, önce/sonra kanıtı ve geri alma notuyla teslim edilir. Kaynak değişikliklerinin geri alınması, yeni veriyi eski kodun okuyabildiği anlamına gelmez; şema kartlarının rollback stratejisi ayrıca test edilir. Cache-bust yayın paketinde bir kez koordine edilir. Commit/push/tag/deploy yetkisi mevcut oturum talimatlarından okunur; bu plan hiçbirini varsaymaz.
