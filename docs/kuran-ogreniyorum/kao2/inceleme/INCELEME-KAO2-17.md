# İnceleme · KAO2-17 — Ünite ve ders metinleri

> Bu sayfa `tools/kao2-curriculum-build.mjs` ile üretilir; elle düzenlenmez.
> Onay: kutu işaretlenir, sonra `--apply-review` ile metin kaynağına taşınır.
> Onaylanmamış metinler `draft` kalır ve uygulamada **gösterilmez** (yerine "Ünite N · Ders M" yazar).

## Sana düşen

1. Aşağıdaki tabloları oku. Bir metni uygun buluyorsan **o satırın kutusunu `[x]` yap**.
2. Dinî bağlam taşıyan ünite metinlerinde L2 kutusu da vardır (alan uzmanı onayı).
3. İşin bitince bana **"L1 işaretlendi"** yaz. Kutusu işaretli olmayan hiçbir metin onaylanmış sayılmaz.

## Durum

- Toplam metin: **133**
- `draft` (görünmez): **0**
- `sourced` (görünür): **133**
- `expert` (görünür): **0**

## Onayı kim verdi

Kutudaki `[x]` tek başına kimin onayladığını söylemez; aşağıdaki sayılar metin kaynağındaki (`texts.tr.json`) `review.by` kaydından üretilir.

- `ai-delegated`: **132** — bu metinlerdeki `[x]` L1 işaretlerini kullanıcı değil, yetki devriyle yapay zekâ koydu (yetkiyi devreden: `owner`, devir tarihi 2026-10-02).
- `ai-delegated`: **1** — bu metinlerdeki `[x]` L1 işaretlerini kullanıcı değil, yetki devriyle yapay zekâ koydu (yetkiyi devreden: `owner`, devir tarihi 2026-10-07).
- `owner` (kullanıcının kendi kutu onayı): **0**
- `expert` (L2 alan uzmanı onayı): **0**

## Yeniden yazılan metinler (`draft`, K2F-21)

Bu dersler yeni kelime dağılımına göre yeniden yazıldı; sen onaylayana kadar uygulamada görünmez.

Yok.

## Yeniden onay gerekli

Bugün görünür olup **senin kendi onayını taşımayan** 133 metin vardır: u1, u01.01, u01.02, u01.03, u01.04, u01.05, u2, u02.01, u02.02, u02.03, u3, u03.01, u03.02, u03.03, u03.04, u03.05, u03.06, u4, u04.01, u04.02, u04.03, u04.04, u04.05, u5, u05.01, u05.02, u6, u06.01, u06.02, u06.03, u06.04, u06.05, u06.06, u06.07, u06.08, u06.09, u06.10, u06.11, u06.12, u06.13, u06.14, u06.15, u06.16, u06.17, u06.18, u06.19, u06.20, u06.21, u06.22, u06.23, u06.24, u06.25, u06.26, u06.27, u06.28, u06.29, u06.30, u7, u07.01, u07.02, u07.03, u07.04, u07.05, u07.06, u07.07, u07.08, u07.09, u8, u08.01, u08.02, u08.03, u08.04, u08.05, u08.06, u08.07, u08.08, u08.09, u9, u09.01, u09.02, u09.03, u09.04, u09.05, u09.06, u09.07, u09.08, u09.09, u09.10, u09.11, u10, u10.01, u10.02, u10.03, u10.04, u10.05, u10.06, u10.07, u10.08, u10.09, u10.10, u10.11, u10.12, u10.13, u10.14, u10.15, u10.16, u10.17, u10.18, u10.19, u10.20, u11, u11.01, u11.02, u11.03, u11.04, u11.05, u11.06, u12, u12.01, u12.02, u12.03, s0.01, s0.02, s0.03, s0.04, s0.05, s0.06, s0.07, s0.08, s0.09, s0.10, s0.11, s0.12.
Bunlardaki `[x]` senin kendi onayın değildir; işareti kimin koyduğu "Onayı kim verdi" bölümünde yazar.

## Üniteler

### Ünite 1 · Fâtiha

- Vaad: Her namazda okuduğun Fâtiha'yı kelime kelime anlayacaksın.
- Neden önemli: Fâtiha namazlarda tekrar tekrar okunur; bu yedi âyeti anlamak, öğrendiğin ilk kelimeleri hemen gerçek bir metinde kullanmanı sağlar. Yeni başlayan biri için en güçlü çapa budur.
- İnceleme: `sourced · ai-delegated` · kaynak: surah-theme, lexicon-meanings
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### Ünite 2 · Namazın cümleleri

- Vaad: Tekbirden selâma kadar namazda söylediklerini anlayacaksın.
- Neden önemli: Namaz, kelimeleri en sık duyduğun yerdir. İftitah tekbirinden selama kadar geçen cümleleri anlamak, öğrendiklerini günde beş kez uygulamana imkân verir.
- İnceleme: `sourced · ai-delegated` · kaynak: lexicon-meanings
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### Ünite 3 · Üç kısa sûre

- Vaad: İhlâs, Felak ve Nâs'ı anlayarak okuyacaksın.
- Neden önemli: Bu üç kısa sûre hem yeni başlayan için okunması kolay hem de anlamı berrak metinlerdir; kelime dağarcığını ilk gerçek sûre okumalarında kullanırsın.
- İnceleme: `sourced · ai-delegated` · kaynak: surah-theme, lexicon-meanings
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### Ünite 4 · Kur'an'ın tutkalı

- Vaad: Cümleleri birbirine bağlayan kelimeleri tanıyacaksın.
- Neden önemli: Uzun cümleleri anlamayı zorlaştıran şey çoğu zaman bağlaçlardır. Bu küçük kelimeleri tanıyınca cümlenin parçalarını ve bir fikrin nerede başka bir fikre bağlandığını görmen kolaylaşır.
- İnceleme: `sourced · ai-delegated` · kaynak: grammar-plain
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### Ünite 5 · Bu, şu, kim, ne

- Vaad: İşaret ve soru kelimeleriyle âyetin kime, neye döndüğünü göreceksin.
- Neden önemli: İşaret ve soru kelimeleri, cümlenin kimi ya da neyi konu edindiğini gösterir. Bunları tanıdığında âyetin yönünü bulman kolaylaşır.
- İnceleme: `sourced · ai-delegated` · kaynak: grammar-plain
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### Ünite 6 · Gök, yer ve insan

- Vaad: Kur'an'ın en sık isimlerini tanıyacaksın.
- Neden önemli: Kur'an'da isimler çok geçer ve sık geçen isimlerin birçoğu gök, yer, insan gibi gündelik kavramlardır. Bunları öğrenmek, okuduğun âyetlerde tanıdığın kelime sayısını hızla artırır.
- İnceleme: `sourced · ai-delegated` · kaynak: lexicon-meanings
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### Ünite 7 · Oldu, yaptı

- Vaad: Geçmiş zaman anlatılarını çözeceksin.
- Neden önemli: Kur'an'da geçmişte olanlar sık anlatılır. Geçmiş zaman kalıbını tanıdığında kıssa anlatımlarını daha rahat takip edersin.
- İnceleme: `sourced · ai-delegated` · kaynak: grammar-plain
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### Ünite 8 · Yapar, yapıyor

- Vaad: Şimdiki ve geniş zamanı tanıyacaksın.
- Neden önemli: Şimdiki ve geniş zaman kalıbı, süregelen işleri ve genel doğruları anlatır. Bu kalıbı tanıyınca fiilin süren ya da genel bir işi anlattığını fark edersin.
- İnceleme: `sourced · ai-delegated` · kaynak: grammar-plain
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### Ünite 9 · Yap, ver, bağışla

- Vaad: Emir ve dua cümlelerini anlayacaksın.
- Neden önemli: Kur'an'da emir ve dua kalıpları sık geçer. Bunları tanımak, hem yönlendirmeyi hem de yakarışı ayırt etmeni sağlar.
- İnceleme: `sourced · ai-delegated` · kaynak: grammar-plain
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### Ünite 10 · Bir kök, bir aile

- Vaad: Bir kökten türeyen kelime ailesini göreceksin.
- Neden önemli: Arapçada kelimeler ortak bir kökten türer. Tek bir kökü öğrenmek, aynı aileden gelen pek çok kelimeyi birden tanımanı sağlar; ilim, talim, muallim aynı köktendir.
- İnceleme: `sourced · ai-delegated` · kaynak: lexicon-meanings
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### Ünite 11 · Kalıplar

- Vaad: Kalıp değişince anlamın nasıl kaydığını göreceksin.
- Neden önemli: Aynı kökten gelen kelimeler kalıba göre farklı işler görür: yapan, yapılan, yapma. Kalıpları tanımak, bilmediğin bir kelimenin anlamı için sana ipucu verir.
- İnceleme: `sourced · ai-delegated` · kaynak: lexicon-meanings
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

### Ünite 12 · Eğer ve zaman

- Vaad: Şart ve zaman cümlelerini çözeceksin.
- Neden önemli: Şart ve zaman ifadeleri, bir olayın hangi koşulda ve ne zaman gerçekleştiğini söyler. Bunları tanımak, uzun cümleleri parçalara ayırmanı kolaylaştırır.
- İnceleme: `sourced · ai-delegated` · kaynak: grammar-plain
- [x] L1 metin uygun   - [ ] L2 (dinî bağlam) uygun

## Dersler

### Ünite 1 dersleri

| ders | başlık | hedef | inceleme | onay |
|---|---|---|---|---|
| u01.01 | Besmele | Besmelenin üç kelimesini tanıyıp 'iş önce gelir' kuralını göreceksin. | `sourced · ai-delegated` | - [x] |
| u01.02 | Rahîm ve Hamd | Rahmet ve övgü kelimelerini, 'el' takısıyla birlikte okuyacaksın. | `sourced · ai-delegated` | - [x] |
| u01.03 | Yalnız sana | Kulluğun yalnız O'na yöneldiğini anlatan cümleyi çözeceksin. | `sourced · ai-delegated` | - [x] |
| u01.04 | Doğru yol | Yol ve doğru kelimeleriyle kurulan isteği anlayacaksın. | `sourced · ai-delegated` | - [x] |
| u01.05 | Gazaba uğrayanlar değil | Fâtiha'yı baştan sona kesintisiz anlamlandıracaksın. | `sourced · ai-delegated` | - [x] |

### Ünite 2 dersleri

| ders | başlık | hedef | inceleme | onay |
|---|---|---|---|---|
| u02.01 | Büyüklük ve tek ilah | Namazda sık duyduğun 'daha büyük', 'tapılan' ve 'ey' kelimelerini küçük yardımcılarıyla birlikte göreceksin. | `sourced · ai-delegated` | - [x] |
| u02.02 | Tenzih, selâm ve bereket | Namazda sık geçen tenzih (her eksiklikten uzak tutma), namaz, selâm, temiz şeyler ve bereket kelimelerini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u02.03 | Namazda ne diyorum | Namaz cümlelerini baştan sona anlamlandıracaksın. | `sourced · ai-delegated` | - [x] |

### Ünite 3 dersleri

| ders | başlık | hedef | inceleme | onay |
|---|---|---|---|---|
| u03.01 | Kelime sonundaki ekler | İyelik ve çoğul eklerini ayırt edeceksin. | `sourced · ai-delegated` | - [x] |
| u03.02 | Sığınma ve sabah aydınlığı | Felak ve İhlâs'taki sığınma, şafak, denk ve 'oldu' gibi kelimeleri tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u03.03 | Yaratmak ve gece | Yaratma ve karanlık kelimelerini İhlâs ve Felak'te okuyacaksın. | `sourced · ai-delegated` | - [x] |
| u03.04 | Düğümlere üfleyenler | Felak sûresinin kötülük saydığı davranışları anlayacaksın. | `sourced · ai-delegated` | - [x] |
| u03.05 | Kıskançlık ve vesvese | Haset ve fısıltı kelimelerini Nâs sûresinde tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u03.06 | Üç sûreyi birlikte okuma | İhlâs, Felak ve Nâs sûrelerini baştan sona anlayarak okuyacaksın. | `sourced · ai-delegated` | - [x] |

### Ünite 4 dersleri

| ders | başlık | hedef | inceleme | onay |
|---|---|---|---|---|
| u04.01 | Dikkat ve vurgu | Cümleye dikkat çeken, onu vurgulayan ve başka kelimelere bağlayan küçük kelimelerle birlikte 'üstünde' kelimesini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u04.02 | O gün, her ve bazı | 'O gün', 'hayır, aksine', 'her', 'bazı' ve 'yanında' gibi küçük kelimeleri tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u04.03 | 'sonra', 'ile' ve 'veya' | Sıra, birliktelik, seçenek ve karşıtlık bildiren küçük kelimelerle birlikte gelecekte 'hayır' diyen 'asla' kelimesini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u04.04 | 'ya da', 'ama' ve 'ise' | Seçenek, karşıtlık ve gelecek bildiren 'ya … ya da', 'veya', 'ama', 'ileride' ve 'ise' kelimelerini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u04.05 | 'asla', 'sanki' ve 'umulur ki' | Reddetme, benzetme ve umut bildiren 'asla', 'öyleyse', 'sanki', 'umulur ki' ve 'hayır öyle değil' kelimelerini tanıyacaksın. | `sourced · ai-delegated` | - [x] |

### Ünite 5 dersleri

| ders | başlık | hedef | inceleme | onay |
|---|---|---|---|---|
| u05.01 | İşaret kelimeleri | 'bu, şu, onlar' kelimeleriyle cümlenin kimi gösterdiğini göreceksin. | `sourced · ai-delegated` | - [x] |
| u05.02 | Soru kelimeleri | 'kim, ne, hangi, nasıl' sorularıyla âyetin neyi sorduğunu anlayacaksın. | `sourced · ai-delegated` | - [x] |

### Ünite 6 dersleri

| ders | başlık | hedef | inceleme | onay |
|---|---|---|---|---|
| u06.01 | Gök, yer ve işitme | Yer, gök, işitme ve 'kendi' kelimelerini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u06.02 | Kitap ve kalp | Kitap ve kalp kelimeleriyle iç dünyayı anlatan cümleleri okuyacaksın. | `sourced · ai-delegated` | - [x] |
| u06.03 | Ödül ve karşılık | Karşılık ve durak kelimelerini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u06.04 | Âyet ve işaret | 'âyet' kelimesinin delil anlamını göreceksin. | `sourced · ai-delegated` | - [x] |
| u06.05 | Musa ve halkı | Peygamber adlarını ve topluluk kelimelerini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u06.06 | Güç ve sahiplik | Güç ve sahip olma kelimelerini ayırt edeceksin. | `sourced · ai-delegated` | - [x] |
| u06.07 | Mal, dost ve gece | Mal, dost, gece, ilk ve inkâr kelimelerini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u06.08 | Oğullar ve arkadaşlar | Aile ve arkadaşlık kelimelerini okuyacaksın. | `sourced · ai-delegated` | - [x] |
| u06.09 | Peygamber ve Firavun | Haber getiren elçi ve karşıt figür kelimelerini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u06.10 | Delil ve insan | Apaçık delil ve insan kelimelerini ayırt edeceksin. | `sourced · ai-delegated` | - [x] |
| u06.11 | İbrahim ve ev | Ev ve yemin kelimelerini kıssa bağlamında okuyacaksın. | `sourced · ai-delegated` | - [x] |
| u06.12 | Oğul ve su | Aile ve doğa kelimelerini birlikte tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u06.13 | Göz ve gündüz | Görme ve zaman kelimelerini ayırt edeceksin. | `sourced · ai-delegated` | - [x] |
| u06.14 | Nehir ve vade | Doğa ve süre kelimelerini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u06.15 | Düşman ve yurt | Karşıtlık ve mekân kelimelerini okuyacaksın. | `sourced · ai-delegated` | - [x] |
| u06.16 | İşiten ve gücü yeten | İki sık geçen ismi tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u06.17 | Nuh ve ışık | Peygamber adını ve aydınlık kelimesini okuyacaksın. | `sourced · ai-delegated` | - [x] |
| u06.18 | Dağ ve günah | Doğa ve sorumluluk kelimelerini ayırt edeceksin. | `sourced · ai-delegated` | - [x] |
| u06.19 | Nimet ve geçimlik | İyilik ve rızık kelimelerini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u06.20 | Topluluk ve kutsal | Grup, topluluk, kutsal, değerli ve 'bir' kelimelerini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u06.21 | Önderler ve kuvvet | Liderlik ve güç kelimelerini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u06.22 | Ordu ve haber | Kalabalık ve bildiri kelimelerini ayırt edeceksin. | `sourced · ai-delegated` | - [x] |
| u06.23 | Söz ve nesil | Konuşma ve soy kelimelerini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u06.24 | Ay ve Yusuf | Göksel varlık ve peygamber adını birlikte okuyacaksın. | `sourced · ai-delegated` | - [x] |
| u06.25 | Semûd ve Âdem | Topluluk ve ilk insan adlarını tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u06.26 | İsa ve dil | Peygamber adını ve konuşma organını okuyacaksın. | `sourced · ai-delegated` | - [x] |
| u06.27 | Muhtaç olmayan | 'Hiçbir şeye muhtaç olmayan' anlamını pekiştireceksin. | `sourced · ai-delegated` | - [x] |
| u06.28 | Gemi ve yoksul | Kıssa ve toplum kelimelerini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u06.29 | İyiler ve kötülük | Ahlaki karşıtlıkları okuyacaksın. | `sourced · ai-delegated` | - [x] |
| u06.30 | İsimlerin dünyası | Ünitenin en sık isimlerini birlikte pekiştireceksin. | `sourced · ai-delegated` | - [x] |

### Ünite 7 dersleri

| ders | başlık | hedef | inceleme | onay |
|---|---|---|---|---|
| u07.01 | Geçmişte olanlar | Helal kıldı, yaptı, bildi ve geldi gibi geçmişte olan işleri anlatan fiilleri tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u07.02 | Gönderme ve yalanlama | Gönderdi, yalanladı, inkâr etti ve indirdi fiillerini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u07.03 | İnanmak ve yapmak | İnandı, döndü, ortaya çıkardı, hazırladı ve yaptı fiillerini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u07.04 | Duymak ve girmek | Duydu, girdi, kazandı, ulaştı ve rızık verdi fiillerini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u07.05 | Vurmak ve çıkmak | Hareket bildiren fiilleri ayırt edeceksin. | `sourced · ai-delegated` | - [x] |
| u07.06 | Şükretmek ve sahip olmak | Şükretti, sahip oldu, sandı, diledi ve taşıdı fiillerini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u07.07 | Bırakmak ve toplamak | Terk etme ve bir araya getirme fiillerini okuyacaksın. | `sourced · ai-delegated` | - [x] |
| u07.08 | Kalmak ve güç yetirmek | Süreklilik ve yeterlilik fiillerini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u07.09 | Tuzak ve yükseltmek | Tuzak kurdu, yükseltti, gerçekleşti ve tanıdı fiillerini okuyacaksın. | `sourced · ai-delegated` | - [x] |

### Ünite 8 dersleri

| ders | başlık | hedef | inceleme | onay |
|---|---|---|---|---|
| u08.01 | Şimdiki ve geniş zaman | Gelir, görür, harcar, öldürür ve sabreder gibi 'yapar, yapıyor' kalıbını tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u08.02 | Bulmak, bakmak ve sormak | Buldu, baktı, yaptı, aldı ve sordu fiillerini, 'yapmaz, yapmadı' olumsuzlarıyla birlikte göreceksin. | `sourced · ai-delegated` | - [x] |
| u08.03 | Korkmak ve emretmek | Duygu ve buyruk fiillerini şimdiki zamanda tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u08.04 | Tövbe ve okumak | Dönüş ve okuma fiillerini ayırt edeceksin. | `sourced · ai-delegated` | - [x] |
| u08.05 | Artırmak ve sanmak | Çoğaltma ve zan fiillerini okuyacaksın. | `sourced · ai-delegated` | - [x] |
| u08.06 | Razı olmak | Hoşnutluk ve engelleme fiillerini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u08.07 | Umut, yetmek ve affetmek | Umulur ki, kötü oldu, affetti, yasakladı ve yetti fiillerini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u08.08 | İsyan ve aramak | Karşı gelme ve isteme fiillerini okuyacaksın. | `sourced · ai-delegated` | - [x] |
| u08.09 | Bağışlamak ve yürümek | Bağışladı, gizledi, yürüdü, sınadı, koydu ve umar fiillerini okuyacaksın. | `sourced · ai-delegated` | - [x] |

### Ünite 9 dersleri

| ders | başlık | hedef | inceleme | onay |
|---|---|---|---|---|
| u09.01 | Anmak, yemek, vermek: fiil kökleri | Anmak, yemek, merhamet etmek, bağışlamak ve vermek fiillerini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u09.02 | Uymak ve yüz çevirmek | Uydu, edindi, çıkardı, yüz çevirdi ve itaat etti fiillerini okuyacaksın. | `sourced · ai-delegated` | - [x] |
| u09.03 | Vahyetmek ve sevmek | Bildirme ve sevgi fiillerini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u09.04 | Savaşmak ve yok etmek | Savaşma ve yok etme fiillerini ayırt edeceksin. | `sourced · ai-delegated` | - [x] |
| u09.05 | Seslenmek ve tenzih | Çağrı ve tenzih fiillerini okuyacaksın. | `sourced · ai-delegated` | - [x] |
| u09.06 | Göstermek ve dayanmak | Gösterdi, dayandı, haram kıldı, istedi ve kurtardı fiillerini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u09.07 | Açıklamak | Açıkladı, yöneldi, ayrılığa düştü, aradı ve yemin etti fiillerini ayırt edeceksin. | `sourced · ai-delegated` | - [x] |
| u09.08 | Yöneltmek ve fayda | Çevirme ve yarar fiillerini okuyacaksın. | `sourced · ai-delegated` | - [x] |
| u09.09 | Kurtuluş ve çaba | Başarı ve gayret fiillerini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u09.10 | Vefat ve kurtarmak | Son verme ve kurtarma fiillerini okuyacaksın. | `sourced · ai-delegated` | - [x] |
| u09.11 | Çağırmak, sakınmak ve müjdelemek | Çağırdı, sakındı, alay etti, müjdeledi, yüz çevirdi ve konuştu fiillerini birlikte pekiştireceksin. | `sourced · ai-delegated` | - [x] |

### Ünite 10 dersleri

| ders | başlık | hedef | inceleme | onay |
|---|---|---|---|---|
| u10.01 | Yapan ve yapılan | 'İnanan', 'yalanlayan', 'her şeyi bilen' ve 'adı konmuş' gibi, işi yapanı ya da yapılanı anlatan kelimelerle 'güvende oldu' kelimesini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u10.02 | Fiilin adı | 'bilme, anma, inanma' isimlerini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u10.03 | Daha iyi bilen ve daha çok | Daha iyi bilen, daha çok, daha çetin, anma ve öğüt kelimelerini okuyacaksın. | `sourced · ai-delegated` | - [x] |
| u10.04 | İnkâr eden | Yapan ismini olumsuz bağlamda tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u10.05 | Tanıklık eden | Tanıklık ve iş kelimelerini ayırt edeceksin. | `sourced · ai-delegated` | - [x] |
| u10.06 | Zulmetmek | Haksızlık ve iyilik kavramlarını okuyacaksın. | `sourced · ai-delegated` | - [x] |
| u10.07 | İyi işler | Güzel ameller ve rızık kelimelerini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u10.08 | Toplamak ve hayat | Yaşam ve doğru yol kelimelerini okuyacaksın. | `sourced · ai-delegated` | - [x] |
| u10.09 | Diri ve yolunu kaybetmek | Canlılık ve sapma karşıtlığını tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u10.10 | Ölüm ve sapkınlık | Son ve yitirme kelimelerini okuyacaksın. | `sourced · ai-delegated` | - [x] |
| u10.11 | Ölmek ve nimet | Geçiş ve iyilik kelimelerini ayırt edeceksin. | `sourced · ai-delegated` | - [x] |
| u10.12 | Ölü ve secde | Durum ve eylem kelimelerini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u10.13 | Yardımcı ve zafer | Destek ve başarı kelimelerini okuyacaksın. | `sourced · ai-delegated` | - [x] |
| u10.14 | Son ve sürekli kalan | Zaman ve kalıcılık kelimelerini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u10.15 | Görünmeyen ve sakınanlar | Gizlilik ve korunma kavramlarını okuyacaksın. | `sourced · ai-delegated` | - [x] |
| u10.16 | İzin ve delil | Yetki ve kanıt kelimelerini ayırt edeceksin. | `sourced · ai-delegated` | - [x] |
| u10.17 | Kaybedenler | Kayıp ve arınma kelimelerini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u10.18 | Eşit ve boş | Denklik ve geçersizlik kelimelerini okuyacaksın. | `sourced · ai-delegated` | - [x] |
| u10.19 | Topluluk ve sığınak | Grup ve barınma kelimelerini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u10.20 | Kök ailesi: hüküm ve hikmet | Hükmetmek, hüküm ve hikmet kelimelerinin aynı kökten geldiğini göreceksin; yanında 'sanı' da var. | `sourced · ai-delegated` | - [x] |

### Ünite 11 dersleri

| ders | başlık | hedef | inceleme | onay |
|---|---|---|---|---|
| u11.01 | Kalıp değişince anlam değişir | Öğretti, bağışlanma diledi, Müslüman ve teslim oldu kelimelerinde kalıbın anlamı nasıl değiştirdiğini göreceksin. | `sourced · ai-delegated` | - [x] |
| u11.02 | İnanan ve düşünen | İnanç ve düşünme kalıplarını tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u11.03 | İman, iyilik ve diriltmek | İman, iyilik etmek, hikmet sahibi ve diriltmek kelimelerini okuyacaksın. | `sourced · ai-delegated` | - [x] |
| u11.04 | Selâmlama ve ıslah | Selâmlama, düzeltmek ve can almak kelimelerini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u11.05 | Doğru yol ve ortak koşmak | Doğru yola ulaşmak, ortak koşmak ve dosdoğru kılmak fiillerini okuyacaksın. | `sourced · ai-delegated` | - [x] |
| u11.06 | Ortak koşmak | Kalıpları karşıtlık içinde pekiştireceksin. | `sourced · ai-delegated` | - [x] |

### Ünite 12 dersleri

| ders | başlık | hedef | inceleme | onay |
|---|---|---|---|---|
| u12.01 | 'eğer', '-ınca', '-seydi' | Şart kalıplarını tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u12.02 | Önce, sonra ve o vakit | '-ınca', 'önce', 'hani, o vakit' ve 'sonra' gibi zamanı belirten kelimeleri tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| u12.03 | Sık kalıplar | 'Hiçbir zaman', 'vakit' ve 'kim' kelimeleriyle sık kullanılan kalıpları pekiştireceksin. | `sourced · ai-delegated` | - [x] |

## Seviye 0

| ders | başlık | hedef | inceleme | onay |
|---|---|---|---|---|
| s0.01 | Sağdan sola, harf ve hareke | Yazının sağdan sola aktığını ve harflerin üstündeki ve altındaki küçük işaretlerin ünlü sesi verdiğini göreceksin. | `sourced · ai-delegated` | - [x] |
| s0.02 | Nokta ailesi | Aynı gövdeyi paylaşan harfleri noktalarına bakarak ayırt edeceksin. | `sourced · ai-delegated` | - [x] |
| s0.03 | Esre ve ötre | İki kısa ünlü işaretini tanıyıp sesini doğru çıkaracaksın. | `sourced · ai-delegated` | - [x] |
| s0.04 | Çengel ailesi | Çengelli harfleri yazılış biçiminden tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| s0.05 | Bağlanmayan harfler | Sonraki harfe bağlanmayan harfleri göreceksin. | `sourced · ai-delegated` | - [x] |
| s0.06 | Dişli aile | Dişli harfleri ve aralarındaki farkı ayırt edeceksin. | `sourced · ai-delegated` | - [x] |
| s0.07 | Konum şekilleri | Bir harfin başta, ortada ve sonda nasıl değiştiğini göreceksin. | `sourced · ai-delegated` | - [x] |
| s0.08 | Sükûn ve kapalı hece | Ünsüzle kapanan heceyi tanıyıp duraksız okuyacaksın. | `sourced · ai-delegated` | - [x] |
| s0.09 | Uzatma (med) ve şedde | İkizlenen harfi ve uzun okunan sesi ayırt edeceksin. | `sourced · ai-delegated` | - [x] |
| s0.10 | Kalan harfler | Geri kalan harflerin seslerini ve çıkış yerlerini tanıyacaksın. | `sourced · ai-delegated` | - [x] |
| s0.11 | Tenvin, elif-lâm, vasıl | Tenvini ve kelime başındaki 'el' takısını tanıyıp okuyuşa katacaksın. | `sourced · ai-delegated` | - [x] |
| s0.12 | İlk okuma provası | Nerede duracağını bilerek kısa bir metni baştan sona okuyacaksın. | `sourced · ai-delegated` | - [x] |
