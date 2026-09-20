# IIP-02 kompozisyon matrisi

## Ortak sentetik veri

Bütün 12 ekran aynı `SYN-IIP02-01` kaydıyla tasarlandı. Bu veri gerçek kişiye veya canlı hesaba ait değildir.

| Alan | Sentetik değer |
|---|---|
| Tarih / konum | 19 Eylül 2026 · Ankara (sentetik) |
| Vakit | Sıradaki İkindi 16:42 · 3/6 kayıt |
| Günün öncüsü | Grace Hopper · 3 dk okuma · Wikipedia TR kaynak etiketi |
| Zikir | Ya Vedûd · 489 toplam · 82/99 tur |
| Kur'an | Alak 96 · teslim edildi · video yok açıklaması |
| Ritim | 7 gün penceresi · 5 aktif gün · 12 okuma · 3 zikir günü |
| Yer imleri | 2 kayıt: “Bugün bir fikre yer aç”, “Alak 96” |
| Yolculuk | 4/7 gün · paket indirilmedi |
| Görsel durumlar | light, dark, large-type (200%), loading, empty, error |

## Ortak yerleşim kontratı

390×844 referansında safe-area sonrası bağlam bandı 120–170 px aralığında kalır. Başlık bir kez görünür; beşli bölüm gezintisi başlığın altında tek bir düzenli yüzeydir. Her ekranda tek bir dolu ana CTA vardır. Portre/doku ilk bakış alanının üçte birinden büyük olamaz. 200% metin varyantında hiçbir başlık veya CTA kırpılmaz; kartlar dikey büyür ve yatayda gizli scroll açılmaz. Koyu tema yalnız yüzey/ink eşlemelerini değiştirir.

## A → B ekran matrisi

`A mevcut` satırı IIP-01 kaynak envanterinin yerleşim okumasıdır; screenshot veya cihaz kabulü iddiası taşımaz. `B hedef` yüksek ayrıntılı tasarım prototipinde uygulanmış kompozisyondur.

| Ekran | A mevcut yerleşim / eksik | B hedef kompozisyon | Zorunlu durum referansı |
|---|---|---|---|
| **S01 Bugün** | Header + beşli nav sonrası kartlar aynı ağırlıkta; devam satırları keşif kartlarıyla yarışabilir. | Üst bağlam → küçük vakit/tarih satırı → `C02` editoryal odak kartı (portre en fazla 1/3) → en fazla iki `C03` devam satırı → sakin keşif linkleri. Ana CTA “Okumaya başla”. | İlk girişte boş devam, kart loading/error, uzun 3 satır başlık. |
| **S02 İlham keşfi** | Öncü koleksiyonu ve grid yüzeyi vardır; arama/filtre odağı kaynak baseline'da ayrı bir kompozisyon olarak sabit değil. | Etiketli search → filtre özeti → sonuç adedi → tek sütun sonuç listesi. Genişte iki sütun yalnız okuma sırasını bozmazsa. Monogram sabit ölçülü. | 100 sonuç, tek sonuç, sıfır sonuç; sorgu ve focus korunur. |
| **S03 Öncü okuyucusu** | `#sey-ov-card` overlay'i mevcut okuyucu içeriğini taşır; araç çubuğu, kaynak ve okuma eylemi aynı dikey akışta ayrıştırılmalı. | Geri/Aa araç çubuğu → başlık/alan/kaynak/süre → özgün giriş → biyografi → “Üzerinde düşün” → kaynak/lisans → `C05` Okudum alanı. | Skeleton, TR→EN etiketi, hata/tekrar dene, 20 paragraflı metin, 200%. |
| **S04 İbadet ana ekranı** | İman kartı/overlay ve vakit araçları ayrı yüzeylerde; zaman göstergesi kayıt durumuyla karışma riski taşır. | Şehir/yöntem/tarih → sıradaki vakit hero'su → zaman çizelgesi (`C04`) → kayıt alanı → Kur'an/Zikir/Kıble/Takvim araçları. | GPS yok, cache eski, saat bilinmiyor (`—`), şehir değişmiş. |
| **S05 Kayıt ayrıntısı** | Generic overlay alanı kayıt detayını taşıyabilir; gün/vakit bağlamı ve ayrıntılar aynı görsel ağırlıkta kalabilir. | Sabit gün+vakit bağlamı → birincil kayıt durumu → cemaat/geç/kaza/nafile/not ikincil alanları → tek “Kaydet” CTA → iptal. | Geçmiş gün, taslak korunumu, iptal, kayıtlı değer, çift tıklama. |
| **S06 Zikir odak** | Zikir v2 mevcut güçlü tam ekran sayaç, geçmiş ve ayar yüzeylerine sahip; yeni kabuk bu odağı örtmemeli. | Ad/anlam → hatim/tur bağlamı → büyük sayaç → geri al/elle ekle → tefekkür alanı. Sayaç mevcut motoru kullanır; dekorasyon eylemi ele geçirmez. | hazır, sayılıyor, tur/hatim tamam, manuel giriş, geri al, kilit ekranı dönüşü. |
| **S07 Kur'an çalışma** | Kur'an overlay'i durum/video/not akışını taşıyor; editoryal önizleme ana video odağını örtmemeli. | Sûre kimliği/nüzul → “sıradaki eylem” → video veya yokluk açıklaması → mevcut video notu → kaynak. | idle/pending/error/delivered/watched/unavailable; eski yanıt ve caret korunumu. |
| **S08 Dua ve seçki okuyucusu** | Ayrı içerik katmanları için tek bir görünür okuma hiyerarşisi mevcut tasarım kapsamından ayrıca çıkarılmalı. | Başlık/tür → Arapça başlık ve metin → ayrı okunuş → ayrı anlam → kaynak → editoryal bağlam → isteğe bağlı düşünme. | Uzun harekeli metin, RTL/LTR, font fallback, kaynak modalı, boş yorum. |
| **S09 Kıble ve takvim** | Kıble overlay'i ve Hicri/takvim araçları farklı bilgi yoğunlukları taşıyor; yön hedefi önce gelmeli. | Hedef yön + cihaz yönü → açıklama/izin durumu → okuma değerleri → tarih/offset/mübarek gün. | Sensör kapalı, izin red, hassasiyet bilinmiyor, ±2 Hicri offset. |
| **S10 Ritim** | Rapor kartı ve yıllık ısı haritası vardır; grafik, metin ve gün ayrıntısı aynı görev yolunda toplanmalı. | Dönem/kapsam → üç ayrı faaliyet özeti → grafik + eşdeğer metin listesi → gün detayı. Puan veya tek renkli ısı haritası yok. | kayıt yok, yalnız not, karma eski/yeni, artık yıl, belirsiz payda. |
| **S11 Yer imleri** | IIP-01 kaynak baseline'ında ayrı yeniden ziyaret yüzeyi yok; hedef kartı uydurulmuş mevcut davranış sayılmaz. | Tür + başlık + kaynak/sürüm satırları → yeniden aç → açık silme/geri al → değişmiş içerik açıklaması. | boş, eski sürüm, geri çekilmiş içerik, eşzamanlı silme. |
| **S12 Yolculuk/offline** | Program ve ayar yüzeyleri ayrı; içerik başlatma ile paket indirme zorunluluğu görünür biçimde ayrılmalı. | 7 günlük program → bugünkü içerik → durdur/devam → ayrı offline paneli (sürüm/boyut/durum). | başlamadı/devam/ara/tamam; yok/kuruluyor/hazır/kota/eksik/silindi. |

## Tema ve büyük yazı referansları

| Varyant | Aynı kompozisyonda değişen | Değişmeyen |
|---|---|---|
| Light | `--bg`, `--card-solid`, `--text`, `--text2`, `--accent-ink`, alan yüzeyleri | Bilgi sırası, CTA konumu, ikon anlamı, focus sırası |
| Dark | `#root[data-theme="dark"]` karşılıkları, daha koyu yüzey, açık ink ve düşük glow | Aynı grid, aynı görev yolu, aynı metin |
| Large type | `--f-*` rem merdiveni, kartların dikey büyümesi, sarma | Yatay gizli scroll, CTA'nın anlamı, 44×44 dokunma hedefi |

Bu matriste “görsel referans” prototip artboard'larıdır. Gerçek uygulama render'ı ve cihaz doğrulaması `render-boundary.md` içinde ayrıca ayrılmıştır.
