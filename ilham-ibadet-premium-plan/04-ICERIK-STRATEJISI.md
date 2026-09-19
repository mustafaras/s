# 04 — İçerik stratejisi ve editoryal üretim

## İçerik vaadi

Her içerik “Ne okuyorum, nereden geliyor, neden burada, istersem ne yapabilirim?” sorularını yanıtlamalı. Biyografi, dinî kaynak, editoryal yorum ve kişisel düşünme sorusu görsel olarak ayrılır. Öncülerin bilim/sanat hikâyeleri dinî otorite gibi sunulmaz; ayrı ilham damarını korur.

## İçerik aileleri

| Aile | Korunacak varlık | Premium geliştirme | İlk pilot |
|---|---|---|---|
| Öncüler | Mevcut 100 kişi ve kimlikleri | 80–120 kelimelik özgün giriş; üç doğrulanabilir dönüm noktası; seçilmiş kaynak; düşünme sorusu | Bilim/sanat dengesinde 10 kişi |
| Âyet seçkisi | İnsan tarafından doğrulanmış 100 âyet kataloğu | Referans görünürlüğü, meal adı, bağlama geçiş; mevcut metne sessiz düzenleme yok | Mevcut 10 kaydın kaynak/sunum denetimi |
| Esmâ | V1 sıra/hedef ve V2 anlam/tefekkür | Kaynak türü açık; anlam→düşünme→mevcut sayaç akışı | 10 ismin sunum denetimi |
| Dua | Yeni içerik ailesi | Asıl metin, okunuş, anlam, kaynak ve kullanım bağlamı ayrı | Kaynağı incelenmiş 12 kısa metin |
| Tematik seçki | Yeni editoryal katman | Sabır, şükür, merhamet, emanet, öğrenme, umut | 6 tema × 3 içerik bağlantısı |
| Takvim | Mevcut Hicri modül ve offset | Yaklaşan günün açıklaması; offset görünür; kesin tarih iddiasını koşullandır | 4 örnek gün kartı |

Pilot sayıları hedef hacimleridir; bu planla içerik yazılmış/onaylanmış değildir. Uzun katalog eklemeden önce 10 öncü + 12 dua ile kaynaklama, okunabilirlik ve tekrar kullanım modeli kanıtlanır. Hadis külliyatı ilk sürüme alınmaz; eklenirse eser/bölüm/numara ve değerlendirme kaynağıyla ayrı uzman incelemesi gerekir.

## İçerik şablonu

Önerilen yayın kaydı: `id`, `version`, `kind`, `title`, `summary`, `bodyBlocks`, `sourceRefs`, `rights`, `reviewStatus`, `reviewedAt`, `reviewedByRole`, `estimatedReadMinutes`, `themes`. Bunlar **taslak içerik metadata alanlarıdır**; kullanıcı `data` şeması değildir. Yeni katalog dosyası açma yetkisi vermez.

Bir kaynak: kurum/yazar, eser/sayfa veya sûre/âyet, URL, erişim tarihi, dil, lisans/yeniden kullanım durumu. Alıntı ile yeniden yazılmış açıklama ayrı blok türleri olur. Ses varsa okuyucu, lisans, süre ve metin karşılığı ayrıca gerekir.

### Örnek editoryal akış — taslak, dinî alıntı değil

- Tema: **Dikkat ve özen**.
- Başlık: **Bugün tek bir şeye yer aç**.
- Giriş: “Kısa bir okumadan sonra sende kalan tek düşünceyi seçebilirsin.”
- Kaynak içeriği: pilotta doğrulanmış bir biyografi veya kaynaklı metne bağlantı; burada uydurma alıntı kullanılmaz.
- Düşünme: “Bu okumadan yanında götürmek istediğin bir fikir var mı?”
- İsteğe bağlı eylem: “Bir cümleyle not et” — yalnız mevcut uygun not alanı varsa; yeni genel not deposu açılmaz.
- Kapanış: “Bugünlük bu kadar da yeter.”

## Editoryal kalite kapıları

1. Kaynak sahibi ve metin kimliği doğrulanır. Diyanet meal/tefsir alanı kaynak incelemesi için kullanılabilir: [Diyanet okuma alanı](https://kuran.diyanet.gov.tr/mushaf/tefsir-2/fatiha-suresi-1/ayet-1/diyanet-isleri-baskanligi-meali-1). Erişilebilir web sayfası, otomatik toplama veya uygulamada yeniden yayımlama izni sayılmaz.
2. Metin/çeviri, bağlam ve içerik türü kontrol edilir; dinî içerikte yetkin insan incelemesi yayın koşuludur. Ajan taslak üretimi tek başına onay değildir.
3. Mevcut frozen kataloglar yerinde değiştirilmez. Düzeltme gerekirse sürümleme ve eski kimliklerin devamı tasarlanır.
4. Arapça harf/hareke, Türkçe anlam, kaynak referansı birlikte karşılaştırılır. Ekranda normalizasyon uğruna metin değiştirilmez; arama indeksi ayrı normalize edilebilir.
5. İddialı kesin sonuçlar, “şu sayıda okuyunca mutlaka…” türü vaatler ve kaynaksız atıflar yayınlanmaz. Ebced hedefi, anlam kaynağı ve kişisel hedef farklı bilgiler olarak anlatılır.
6. Wikipedia portresi/metni için mevcut lisans/kaynak bilgisi korunur; görselin kendi lisansı ayrıca doğrulanır. Kaynak değişirse cache sürümü/atıf da güncellenir.
7. Kırık kaynak, geri çekme ve düzeltme akışı vardır: katalog kaydı yayından kaldırılabilir; kişinin eski okuma geçmişi silinmez.

## Kişiselleştirme

İlk sürüm gün ve açıkça seçilmiş tema ile deterministik öneri üretir. “Bunu neden görüyorum?” cevabı “Bugünün seçkisi” veya “Seçtiğin tema”dır. Ruh hâli, sağlık, konum veya özel notlardan örtük inanç/kişilik çıkarımı yapılmaz. Aynı içeriğe yeniden gelmek hata değildir; tekrarın nedeni anlaşılır olur. Mevcut âyet rotasyonunun davranışı değiştirilirse ayrı kabul kartı gerekir.

## Dil ve ritim

Kısa, sıcak Türkçe; ağır sloganlar ve sürekli ünlem yok. “Serin bozuldu” yerine “Kaldığın yer burada”; “İbadet puanın” yerine “Kaydettiğin vakitler”. Kişisel düşünme zorunlu alan değildir. Topluluk sıralaması, rekabet, suçluluk ve sağlık sonucu vaadi kullanılmaz.
