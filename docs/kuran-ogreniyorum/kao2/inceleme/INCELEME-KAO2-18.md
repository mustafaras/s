# İnceleme · KAO2-18 — Kavram çözümlü örnekleri ve hata açıklamaları

> Bu sayfa `tools/kao2-curriculum-build.mjs` ile üretilir; elle düzenlenmez.
> Onaylanmamış (`draft`) metinler uygulamada **gösterilmez**; yerine güvenli genel metin gelir.

## Durum

- Toplam kavram: **25**
- `draft` (görünmez): **0**

## Kavramlar

### g0_5 · Fiil önce gelir

- Çözümlü örnek (workedTr): Örnek: "yükseltiyor İbrahim temelleri" → önce iş, sonra yapan, sonra etkilenen.
- Hata açıklaması (errorTr): Sırayı Türkçedeki gibi kurma; önce işin (fiilin) geldiğini düşün.
- İnceleme: `sourced`
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### g1 · Başındaki 'el': o bilinen

- Çözümlü örnek (workedTr): Örnek: "kitap" belirsiz → "bir kitap"; başına "el" gelince "o kitap".
- Hata açıklaması (errorTr): Baştaki "el"i kelimenin parçası sanma; "o bilinen" anlamı kattığını anımsa.
- İnceleme: `sourced`
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### g10 · '-dır' yazılmaz: isim cümlesi

- Çözümlü örnek (workedTr): Örnek: "Allah Samed" → "Allah Samed'dir". "-dır" yazılmaz, cümle yine tamdır.
- Hata açıklaması (errorTr): Cümlede "-dır" arama; iki isim yan yana geldiyse cümle tamamdır.
- İnceleme: `sourced`
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### g11 · Sondaki yuvarlak 'te': dişil kelime

- Çözümlü örnek (workedTr): Örnek: sondaki yuvarlak 'te' çoğunlukla kelimenin dişil olduğunu gösterir.
- Hata açıklaması (errorTr): Sondaki yuvarlak işareti süs sanma; çoğunlukla kelimenin türünü belirttiğini anımsa.
- İnceleme: `sourced`
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### g12 · Çoğul: sona ek ya da içten değişim

- Çözümlü örnek (workedTr): Örnek: çoğul ya sona ek gelir ya da kelimenin içi değişir.
- Hata açıklaması (errorTr): Çoğulu yalnız eke bakarak arama; kelimenin içinin de değişebileceğini düşün.
- İnceleme: `sourced`
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### g13 · Geçmiş zaman: yaptı, yaptılar, yaptım

- Çözümlü örnek (workedTr): Örnek: "yaptı → yaptılar → yaptım" aynı kökten son ekle kurulur.
- Hata açıklaması (errorTr): Zamanı kökten ayırma; son eklerin kişiyi değiştirdiğini gör.
- İnceleme: `sourced`
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### g14 · Kâne: 'idi, oldu'

- Çözümlü örnek (workedTr): Örnek: "idi, oldu" anlamı veren fiil, ardından gelen fiile "-ıyordu" rengi katar.
- Hata açıklaması (errorTr): İki fiili iki ayrı zaman sanma; yardımcı fiilin zamanı taşıdığını anımsa.
- İnceleme: `sourced`
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### g15 · Şimdiki ve geniş zaman: yapar, yapıyor

- Çözümlü örnek (workedTr): Örnek: "yapar, yapıyor" anlamı fiilin başına gelen bir harfle kurulur.
- Hata açıklaması (errorTr): Şimdiki zamanı son ekte arama; fiilin başındaki harfe bak.
- İnceleme: `sourced`
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### g16 · Yapmaz, yapmadı, asla yapmayacak

- Çözümlü örnek (workedTr): Örnek: aynı fiil üç olumsuzlukla üç ayrı zaman anlatır: yapmaz, yapmadı, asla yapmayacak.
- Hata açıklaması (errorTr): Üç olumsuzluğu aynı sanma; hangi zamanı anlattığını ayırt et.
- İnceleme: `sourced`
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### g17 · Emir: yap!, deyin!

- Çözümlü örnek (workedTr): Örnek: 'dersin' → 'de!'; emir çoğunlukla şimdiki zaman fiilinin başı atılarak kurulur.
- Hata açıklaması (errorTr): Emri ayrı bir kelime sanma; şimdiki zaman fiilinden türediğini düşün.
- İnceleme: `sourced`
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### g18 · Seslenme: ey …

- Çözümlü örnek (workedTr): Örnek: seslenmek için 'ey' kullanılır; 'el'li bir kelimeye seslenirken araya ek bir kelime girer.
- Hata açıklaması (errorTr): Seslenmeyi cümlenin parçası sanma; kendinden sonraki ismi işaret ettiğini gör.
- İnceleme: `sourced`
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### g19 · Yapan ve yapılan: kâtib, mektûb

- Çözümlü örnek (workedTr): Örnek: aynı kökten "yazan" ve "yazılan" türer; biri yapanı, biri yapılanı gösterir.
- Hata açıklaması (errorTr): Kalıbı rastgele seçme; kelimenin yapan mı yapılan mı olduğunu sor.
- İnceleme: `sourced`
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### g2 · İki isim yan yana: …nın …ı

- Çözümlü örnek (workedTr): Örnek: "hesap gününün sahibi" → iki isim yan yana; ikincisi birincisini tamamlar.
- Hata açıklaması (errorTr): Tamlamayı Türkçedeki "-nın … -ı" bağı olarak oku; kelimeleri ayrı ayrı çevirme.
- İnceleme: `sourced`
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### g20 · Fiilin adı: bilme, anma, inanma

- Çözümlü örnek (workedTr): Örnek: "bildi" fiilinden "bilme, bilgi" adı türer.
- Hata açıklaması (errorTr): Fiille adını aynı sanma; adın işi değil, işin kendisini gösterdiğini anımsa.
- İnceleme: `sourced`
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### g21 · Kalıp değişince anlam kayar: ilim → talim

- Çözümlü örnek (workedTr): Örnek: "bildi" → "öğretti"; kalıp değişince anlam kayar.
- Hata açıklaması (errorTr): Kökü tanıyıp anlamı aynı sanma; kalıbın anlamı kaydırdığını düşün.
- İnceleme: `sourced`
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### g22 · 'Eğer', '-ınca', '-seydi'

- Çözümlü örnek (workedTr): Örnek: "eğer … -se", "-dığı zaman", "-seydi (ama olmadı)" ayrı kelimelerle kurulur.
- Hata açıklaması (errorTr): Şartı tek kalıp sanma; gerçekleşmiş, gerçekleşmemiş ve zaman anlamlarını ayır.
- İnceleme: `sourced`
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### g23 · Cümleye zaman rengi veren fiiller: kâne, leyse, asbaha

- Çözümlü örnek (workedTr): Örnek: "idi, değildir" gibi fiiller cümleye zaman ve durum rengi verir.
- Hata açıklaması (errorTr): Bu fiilleri asıl iş sanma; cümlenin rengini belirlediklerini gör.
- İnceleme: `sourced`
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### g24 · Kur'an'ın sık kalıpları

- Çözümlü örnek (workedTr): Örnek: bazı söz kalıpları sık tekrarlanır; kalıbı tanıyınca cümle bütün olarak açılır.
- Hata açıklaması (errorTr): Kelime kelime çevirip kalıbı kaçırma; tekrarlanan bütünü tanımaya çalış.
- İnceleme: `sourced`
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### g3 · '-de, -den, -e' kelimeleri

- Çözümlü örnek (workedTr): Örnek: "-de/-den/-e" anlamı Arapçada kelimenin önündeki küçük kelimeyle verilir.
- Hata açıklaması (errorTr): Bu anlamı kelime sonunda arama; cümlenin başındaki küçük kelimeye bak.
- İnceleme: `sourced`
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### g4 · 'o, onlar, sen, siz, ben, biz'

- Çözümlü örnek (workedTr): Örnek: 'o, onlar, sen, biz' gibi ayrı duran zamirler cümlede kendi başına bir kelimedir.
- Hata açıklaması (errorTr): Her zamiri ayrı kelime sanma; kelimeye yapışan zamirler de vardır (sonraki konu).
- İnceleme: `sourced`
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### g5 · Yapışık ekler: -ı, -leri, -in, -iniz, -im, -imiz

- Çözümlü örnek (workedTr): Örnek: "-ı, -leri, -in, -im" kelimenin sonuna yapışır ve sahibini gösterir.
- Hata açıklaması (errorTr): Eki kelimenin başında arama; sondaki parçaya bak.
- İnceleme: `sourced`
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### g6 · Olumsuzluk: lâ, lem, mâ

- Çözümlü örnek (workedTr): Örnek: "yok, değil, -me" anlamını üç ayrı olumsuzluk kelimesi taşır.
- Hata açıklaması (errorTr): Olumsuzluğu fiilin içinde arama; cümledeki ayrı olumsuzluk kelimesini bul.
- İnceleme: `sourced`
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### g7 · '-an, -en, ki o' bağları

- Çözümlü örnek (workedTr): Örnek: "-an, -en, ki o" bağları Arapçada ayrı kelimelerle kurulur.
- Hata açıklaması (errorTr): Bağı Türkçedeki gibi ekle arama; cümledeki ayrı bağ kelimesini gör.
- İnceleme: `sourced`
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### g8 · 'Şüphesiz' ve 'ancak': inne, illâ

- Çözümlü örnek (workedTr): Örnek: "şüphesiz" vurgusu bir kelimeyle, "ancak" sınırlaması başka bir kelimeyle yapılır.
- Hata açıklaması (errorTr): Vurgu ile sınırlamayı karıştırma; hangisinin pekiştirdiğini, hangisinin daralttığını düşün.
- İnceleme: `sourced`
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### g9 · Bu, şu, o, bunlar, onlar

- Çözümlü örnek (workedTr): Örnek: yakın için "bu", uzak için "o"; ikisi de tek başına durur.
- Hata açıklaması (errorTr): İşaret kelimesini ismin eki sanma; ayrı duran kelimeyi bul.
- İnceleme: `sourced`
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun
