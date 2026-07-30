(function(){
  'use strict';

  // ZP-01 — 99 Esmâ içerik katmanı (V2).
  //
  // Bu modül esmaulHusnaV1.js'i DEĞİŞTİRMEZ; onun üzerine bir "içerik katmanı"
  // ekler. V1, her kayıt için id/order/name/arabic/ebced üretir (Arapça
  // hareke/normalizasyon kararı ve ebced yöntemi zaten orada belgelidir). V2,
  // aynı `order` anahtarıyla eşleşen meaningTr/importanceTr/reflectionTr/
  // sourceRefs/editorialStatus alanlarını ekler.
  //
  // DÜRÜSTLÜK NOTU (ZIKIRMATIK-IPHONE16-PREMIUM-PROMPT-PAKETI.md §1 ve ZP-01):
  // - meaningTr kısa ve Diyanet'in yaygın anlamıyla uyumlu tutulmuştur.
  // - importanceTr, ismi tanımaya yönelik 1-2 cümledir; vaat, reçeteli sayı,
  //   uydurma fazilet veya dinî hüküm İÇERMEZ.
  // - reflectionTr, emir kipi taşımayan tek bir tefekkür sorusudur; bir
  //   kurumdan alıntı değil, özgün bir tefekkür çerçevesidir.
  // - Ebced yöntemi burada TEKRAR anlatılmaz; yalnız `sources` içinde ayrı
  //   metadata olarak durur, meaning/importance kaynağıyla karıştırılmaz.
  // - Bu 99 isim, Allah'ın rivayet edilegelen ve yaygın öğretilen isimlerinden
  //   bir seçkidir; Allah'ın isim ve sıfatlarını bu 99'la sınırladığı
  //   iddiası taşımaz (bkz. `disclaimerLimitTr` altta).
  // - `editorialStatus` her kayıtta 'draft'tır. Hiçbiri henüz insan editoryal
  //   incelemesinden geçmedi; 'reviewed' olmadan yayın kabulüne girmez
  //   (ZP-01 kural 9). Bu içerik kullanıcı onayı beklenen bir taslaktır.

  var SOURCES = {
    'diyanet-99-isim': {
      title: "Allah'ın 99 İsmi Hakkında Bilgi Verir misiniz?",
      institution: 'Diyanet İşleri Başkanlığı Din İşleri Yüksek Kurulu',
      url: 'https://kurul.diyanet.gov.tr/tr/fetva/allahin-99-ismi-hakkinda-bilgi-verir-misiniz/56aa0e7b-6fe0-45ce-0892-08dd1c135351',
      accessedAt: '2026-07-29',
      usage: 'İsim sırası ile meaningTr/importanceTr taslak metinlerinin genel dayanağı'
    },
    'tdv-ebced-yontemi': {
      title: 'Ebced',
      institution: 'TDV İslâm Ansiklopedisi',
      url: 'https://islamansiklopedisi.org.tr/ebced',
      accessedAt: '2026-07-29',
      usage: "Yalnız ebced hesap yöntemi metadata'sı; anlam/önem kaynağı DEĞİLDİR"
    }
  };

  // Sıra (order) 1-99, esmaulHusnaV1.js'teki RAW dizisiyle birebir aynı sıra.
  var CONTENT = [
    { order:1, meaningTr:"Zâtına mahsus özel ismi; bütün güzel isim ve sıfatları kendinde toplayan ismi a'zam.", importanceTr:"Diğer 98 ismin tümü bu ismin farklı yönlerini anlatır; Allah lafzı bir sıfat değil doğrudan zâtın has ismidir.", reflectionTr:"Günlük konuşmanda 'Allah' derken zihninde hangi anı ya da sıfat canlanıyor?" },
    { order:2, meaningTr:"Bütün yaratılmışları ayrım gözetmeksizin kuşatan sınırsız merhamet sahibi.", importanceTr:"Rahmân ismi, rızkın ve varoluşun temelinde ayrım gözetmeyen bir şefkatin bulunduğunu hatırlatır.", reflectionTr:"Etrafındaki hangi nimet, karşılık beklemeden sana ulaşmış bir rahmet örneği?" },
    { order:3, meaningTr:"Özellikle iman edenlere yönelen, süreklilik taşıyan özel merhamet.", importanceTr:"Rahîm ismi, Rahmân'ın genel rahmetinden farklı olarak inanan kullara has bir yakınlığa işaret eder.", reflectionTr:"Hayatındaki hangi zorluk, sabırla beklediğinde bir rahmete dönüştü?" },
    { order:4, meaningTr:"Bütün mülkün ve otoritenin gerçek ve mutlak sahibi.", importanceTr:"Melik ismi, sahip olduğumuzu düşündüğümüz her şeyin aslında emanet olduğunu hatırlatır.", reflectionTr:"'Sahip olduğun' şeylerden hangisi aslında sana emanet edilmiş gibi hissettiriyor?" },
    { order:5, meaningTr:"Her türlü eksiklik, kusur ve benzetmeden münezzeh, mutlak temiz ve yüce.", importanceTr:"Kuddûs ismi, ilahî zâtın insan kavrayışının sınırlarını aştığını hatırlatan bir tenzih ismidir.", reflectionTr:"Bir şeyi tam olarak tarif edemediğinde, o şeyin büyüklüğünü nasıl hissedersin?" },
    { order:6, meaningTr:"Her türlü eksiklik ve afetten salim olan, esenliğin asıl kaynağı.", importanceTr:"Selâm ismi, gerçek huzurun nihai olarak nereden geldiğine dair bir hatırlatmadır.", reflectionTr:"Sana gerçek huzuru hissettiren anlar genelde neyle ilgilidir?" },
    { order:7, meaningTr:"Kullarına güven ve emniyet veren, vaadinde duran.", importanceTr:"Mü'min ismi, gerçek güvenin geçici kaynaklardan değil sabit bir yerden geldiğine işaret eder.", reflectionTr:"Kendini en güvende hissettiğin an, bu güvenin kaynağı neydi?" },
    { order:8, meaningTr:"Her şeyi görüp gözeten, koruyup denetleyen.", importanceTr:"Müheymin ismi, hiçbir hâlin gözden kaçmadığı bir gözetilmişlik duygusunu hatırlatır.", reflectionTr:"Kimse görmüyor sandığın bir anda, aslında gözetildiğini hatırlamak neyi değiştirir?" },
    { order:9, meaningTr:"Karşı konulamaz izzet, üstünlük ve güç sahibi.", importanceTr:"Azîz ismi, gerçek onurun ve gücün nereye dayandığını sorgulatan bir isimdir.", reflectionTr:"Kendi gücünün yettiği yer nerede biter?" },
    { order:10, meaningTr:"Kırığı onaran, eksiği tamamlayan, iradesini üstün kudretle yürüten.", importanceTr:"Cebbâr ismi, çaresiz görünen durumların onarılabileceğine dair bir hatırlatmadır.", reflectionTr:"Hayatında 'düzelmez' sandığın ama sonradan onarılan bir şey oldu mu?" },
    { order:11, meaningTr:"Büyüklük ve ululuk yalnızca kendisine ait olan.", importanceTr:"Mütekebbir ismi, gerçek büyüklüğün yaratılmışlara değil yaratana ait olduğunu hatırlatır.", reflectionTr:"Büyüklendiğin bir anın, seni gerçekte küçük düşüren bir yanı var mıydı?" },
    { order:12, meaningTr:"Her şeyi yoktan var eden yaratıcı.", importanceTr:"Hâlik ismi, varoluşun kaynağının rastlantı değil bir yaratma fiili olduğunu hatırlatır.", reflectionTr:"Kendi varlığını en çok hangi anda 'verilmiş bir şey' gibi hissedersin?" },
    { order:13, meaningTr:"Yarattıklarını kusursuz bir uyum ve düzen içinde var eden.", importanceTr:"Bâri' ismi, yaratılıştaki düzenin tesadüfi değil kasıtlı bir uyum olduğuna işaret eder.", reflectionTr:"Doğada fark ettiğin hangi uyum seni en çok şaşırtıyor?" },
    { order:14, meaningTr:"Her varlığa kendine özgü bir biçim ve suret veren.", importanceTr:"Musavvir ismi, her bir varlığın benzersiz bir şekilde tasarlandığını hatırlatır.", reflectionTr:"Kendi benzersiz yönlerinden hangisini en az fark ediyorsun?" },
    { order:15, meaningTr:"Günahları tekrar tekrar örten ve bağışlayan.", importanceTr:"Gaffâr ismi, tekrarlanan hataların bağışlanma kapısını kapatmadığını hatırlatır.", reflectionTr:"Kendini affetmekte en çok zorlandığın hata hangisi?" },
    { order:16, meaningTr:"Zorbaları ve büyüklenenleri kudretiyle boyun eğdiren.", importanceTr:"Kahhâr ismi, hiçbir haksız gücün kalıcı olmadığına dair bir hatırlatmadır.", reflectionTr:"Adaletsiz görünen bir durumun zamanla nasıl değiştiğine şahit oldun mu?" },
    { order:17, meaningTr:"Hiçbir karşılık beklemeden sürekli bağışta bulunan.", importanceTr:"Vehhâb ismi, bazı nimetlerin hak edilerek değil yalnızca lütufla geldiğini hatırlatır.", reflectionTr:"Hiçbir çaba göstermeden sana verilmiş bir şey hangisi?" },
    { order:18, meaningTr:"Bütün canlıların rızkını yaratıp ulaştıran.", importanceTr:"Rezzâk ismi, geçim kaygısının nihai kaynağının çaba kadar bir lütuf olduğunu hatırlatır.", reflectionTr:"Rızkının sana hangi beklenmedik yoldan ulaştığını hatırlıyor musun?" },
    { order:19, meaningTr:"Kapalı olan her şeyi açan, aradaki hükmü veren.", importanceTr:"Fettâh ismi, çıkmaz görünen durumların bir açılış kapısı olabileceğine işaret eder.", reflectionTr:"Uzun süre kapalı kalan hangi kapı sonunda açıldı?" },
    { order:20, meaningTr:"Görünen görünmeyen her şeyi kuşatan sınırsız ilim sahibi.", importanceTr:"Alîm ismi, hiçbir hâlin ve niyetin bilgisiz kalmadığını hatırlatır.", reflectionTr:"Kimsenin bilmediğini düşündüğün bir düşüncen, bilinmiş olsaydı ne değişirdi?" },
    { order:21, meaningTr:"Rızkı, canı veya imkânı dilediğinde daraltan.", importanceTr:"Kâbız ismi, darlığın da bir hikmete bağlı olabileceğini hatırlatan bir isimdir.", reflectionTr:"Geçmişteki bir darlık dönemi, sonradan nasıl bir anlam kazandı?" },
    { order:22, meaningTr:"Rızkı, canı veya imkânı dilediğinde genişletip bollaştıran.", importanceTr:"Bâsıt ismi, bolluğun da bir emanet ve sınav olduğunu hatırlatır.", reflectionTr:"Elindeki bolluğu fark ettiğin an, bunu kiminle paylaşabilirsin?" },
    { order:23, meaningTr:"Büyüklenip haddini aşanı manen alçaltan.", importanceTr:"Hâfıd ismi, konumun kalıcı olmadığını, büyüklenmenin sonunun düşüş olabileceğini hatırlatır.", reflectionTr:"Kibrin seni en çok hangi konuda yanılttığını fark ettin mi?" },
    { order:24, meaningTr:"Alçakgönüllü ve doğru yolda olanı derece bakımından yükselten.", importanceTr:"Râfi' ismi, gerçek yükselişin çoğu zaman sabır ve tevazu ile geldiğini hatırlatır.", reflectionTr:"Alçakgönüllülükle attığın bir adım seni nereye taşıdı?" },
    { order:25, meaningTr:"Dilediği kuluna izzet, şeref ve itibar veren.", importanceTr:"Muizz ismi, gerçek şerefin insanların takdirinden değil bu isimden geldiğini hatırlatır.", reflectionTr:"Başkalarının onayı olmadan da kendini değerli hissettiğin an hangisiydi?" },
    { order:26, meaningTr:"Dilediğini zillete, düşkünlüğe bırakan.", importanceTr:"Müzill ismi, haksız yollarla elde edilen üstünlüğün kalıcı olmadığını hatırlatır.", reflectionTr:"Geçici bir üstünlüğün sonradan nasıl boşa çıktığını gördün mü?" },
    { order:27, meaningTr:"Söyleneni, içten geçeni dahi eksiksiz işiten.", importanceTr:"Semî' ismi, en sessiz duanın bile duyulmadan kalmadığını hatırlatır.", reflectionTr:"Kimseye söylemediğin bir duan, duyulduğunu hatırlamak sana ne hissettirir?" },
    { order:28, meaningTr:"Görünen görünmeyen her şeyi eksiksiz gören.", importanceTr:"Basîr ismi, hiçbir çabanın ya da zorluğun gözden kaçmadığını hatırlatır.", reflectionTr:"Kimsenin görmediğini düşündüğün bir çaban, görülmüş olsaydı nasıl hissederdin?" },
    { order:29, meaningTr:"Aralarında nihai ve adil hükmü veren.", importanceTr:"Hakem ismi, dünyada eksik kalan adaletin nihayetinde tamamlanacağına dair bir güven verir.", reflectionTr:"Adaletsiz bulduğun bir durumu nihai bir hükme havale etmek nasıl bir rahatlık verir?" },
    { order:30, meaningTr:"Mutlak adalet sahibi; hiçbir şekilde zulmetmeyen.", importanceTr:"Adl ismi, evrendeki düzenin temelinde keyfilik değil adalet olduğunu hatırlatır.", reflectionTr:"Kendi kararlarında adaleti en çok nerede zorlanarak uyguluyorsun?" },
    { order:31, meaningTr:"En ince ayrıntıyı bilen, işleri lütufla kolaylaştıran.", importanceTr:"Latîf ismi, fark edilmeyen küçük kolaylıkların da bir lütuf olduğunu hatırlatır.", reflectionTr:"Küçük ama tam zamanında gelen bir kolaylık hangisiydi?" },
    { order:32, meaningTr:"Her işin iç yüzünden ve gizli yönünden haberdar olan.", importanceTr:"Habîr ismi, görünenin ardındaki gerçek niyetin de bilindiğini hatırlatır.", reflectionTr:"Görünüşte basit ama iç yüzü derin olan bir tecrüben var mı?" },
    { order:33, meaningTr:"Hemen cezalandırmayan, yumuşaklıkla ve sabırla muamele eden.", importanceTr:"Halîm ismi, mühlet verilmesinin bir zayıflık değil bir merhamet olduğunu hatırlatır.", reflectionTr:"Sana tanınan bir mühlet, ne yönde bir değişime vesile oldu?" },
    { order:34, meaningTr:"Büyüklüğü akıl ve tasavvurun ötesinde olan.", importanceTr:"Azîm ismi, karşılaştığımız sorunların o büyüklük karşısındaki gerçek ölçüsünü hatırlatır.", reflectionTr:"Şu an büyük görünen bir derdin, daha geniş bir bakışta nasıl görünür?" },
    { order:35, meaningTr:"Bağışlaması bol, tekrar tekrar affeden.", importanceTr:"Gafûr ismi, tövbe kapısının her zaman açık kaldığını hatırlatır.", reflectionTr:"Tekrar aynı hataya düşmek, seni affedilme umudundan uzaklaştırıyor mu yoksa yaklaştırıyor mu?" },
    { order:36, meaningTr:"Az amele bile büyük karşılık veren, şükrü değerlendiren.", importanceTr:"Şekûr ismi, küçük çabaların bile karşılıksız kalmadığını hatırlatır.", reflectionTr:"Küçük bir iyiliğin, beklemediğin büyüklükte bir karşılığı oldu mu?" },
    { order:37, meaningTr:"Zât, sıfat ve derece olarak en yüce olan.", importanceTr:"Aliyy ismi, dünyevi hiyerarşilerin ötesinde bir yüceliğin bulunduğunu hatırlatır.", reflectionTr:"Dünyevi bir makamın önemini daha büyük bir çerçevede nasıl görürsün?" },
    { order:38, meaningTr:"Büyüklüğü mutlak ve kıyaslanamaz olan.", importanceTr:"Kebîr ismi, insanın kendi büyüklük ölçütlerinin ne kadar sınırlı kaldığını hatırlatır.", reflectionTr:"Kendini büyük hissettiğin bir an, aslında ne kadar küçük bir ölçekteydi?" },
    { order:39, meaningTr:"Yarattığını, rızkını ve amelleri koruyup gözeten.", importanceTr:"Hafîz ismi, hiçbir çabanın kayıtsız kalmadığını hatırlatır.", reflectionTr:"Kimsenin fark etmediğini düşündüğün bir emeğin korunduğunu bilmek nasıl hissettirir?" },
    { order:40, meaningTr:"Rızkı ve gücü ihtiyaç ölçüsünde takdir edip veren.", importanceTr:"Mukît ismi, ihtiyaçların rastgele değil bir ölçüyle karşılandığını hatırlatır.", reflectionTr:"Tam ihtiyacın olan anda gelen bir destek hangisiydi?" },
    { order:41, meaningTr:"Kuluna yeten ve amellerin hesabını eksiksiz gören.", importanceTr:"Hasîb ismi, hesaba çekilecek olmanın bir sorumluluk bilinci verdiğini hatırlatır.", reflectionTr:"Bugünün hesabını kendine sorsan ilk fark edeceğin şey ne olurdu?" },
    { order:42, meaningTr:"Azamet, heybet ve ululuk sahibi.", importanceTr:"Celîl ismi, saygıyla karışık bir hayranlık duygusunu hatırlatan bir isimdir.", reflectionTr:"En çok hayranlık duyduğun manzara sende ne hissettiriyor?" },
    { order:43, meaningTr:"Cömertliği sınırsız, ikramı bol olan.", importanceTr:"Kerîm ismi, istemeden verilen nimetlerin de bir cömertlik işareti olduğunu hatırlatır.", reflectionTr:"İstemeden aldığın bir ikramı hatırlayabiliyor musun?" },
    { order:44, meaningTr:"Her hâli sürekli gözetip kontrol eden.", importanceTr:"Rakîb ismi, yalnız kaldığın anların da gözetim dışı olmadığını hatırlatır.", reflectionTr:"Yalnızken davranışların, kalabalıktakinden ne kadar farklı?" },
    { order:45, meaningTr:"Kendisine yapılan duaya icabet eden.", importanceTr:"Mücîb ismi, duanın karşılıksız kalmadığına, farklı şekillerde cevap bulabileceğine işaret eder.", reflectionTr:"Beklediğinden farklı bir şekilde karşılık bulan bir duan oldu mu?" },
    { order:46, meaningTr:"İlmi, rahmeti ve nimeti sınırsız genişlikte olan.", importanceTr:"Vâsi' ismi, imkânların insanın tahayyülünden daha geniş olabileceğini hatırlatır.", reflectionTr:"Daraldığını hissettiğin bir anda aslında ne kadar seçeneğin vardı?" },
    { order:47, meaningTr:"Her işi yerli yerinde, hikmetle yapan.", importanceTr:"Hakîm ismi, anlaşılmayan olayların ardında da bir hikmet olabileceğini hatırlatır.", reflectionTr:"O an anlam veremediğin bir olay sonradan nasıl bir hikmete büründü?" },
    { order:48, meaningTr:"Kullarını samimi ve karşılıksız bir sevgiyle seven.", importanceTr:"Vedûd ismi, sevilmenin insanların onayına bağlı olmadığını hatırlatır.", reflectionTr:"Karşılık beklemeden sevildiğini hissettiğin bir an var mı?" },
    { order:49, meaningTr:"Şanı, kadri ve cömertliği en yüce olan.", importanceTr:"Mecîd ismi, gerçek şerefin gösterişte değil özde olduğunu hatırlatır.", reflectionTr:"Gösterişsiz ama değerli bulduğun bir davranış hangisiydi?" },
    { order:50, meaningTr:"Ölüleri dirilten, gafleti uyandıran, elçiler gönderen.", importanceTr:"Bâis ismi, her bitişin aslında yeni bir başlangıca kapı olabileceğini hatırlatır.", reflectionTr:"Bir 'son'un yeni bir başlangıca dönüştüğü bir dönemi hatırlıyor musun?" },
    { order:51, meaningTr:"Her şeye bizzat ve doğrudan şahit olan.", importanceTr:"Şehîd ismi, en gizli anların bile bir şahidi olduğunu hatırlatır.", reflectionTr:"Kimsenin şahit olmadığını düşündüğün bir davranışın görülmüş olması ne hissettirir?" },
    { order:52, meaningTr:"Varlığı, sözü ve vaadi mutlak gerçek olan.", importanceTr:"Hakk ismi, geçici olanla kalıcı olanı ayırt etmeye çağıran bir isimdir.", reflectionTr:"Zamanla değişmeyen, senin için 'hep gerçek' kalan şey ne?" },
    { order:53, meaningTr:"Kendisine güvenilip işlerin havale edildiği, yeten.", importanceTr:"Vekîl ismi, elden geleni yaptıktan sonra gerisini bırakabilmenin bir huzur kaynağı olduğunu hatırlatır.", reflectionTr:"Elinden geleni yapıp gerisini bıraktığın bir an sana nasıl bir hafiflik verdi?" },
    { order:54, meaningTr:"Kudreti hiçbir şeyle sınırlanmayan, en güçlü.", importanceTr:"Kavî ismi, kendi gücümüzün yetmediği yerde bir dayanağın hâlâ var olduğunu hatırlatır.", reflectionTr:"Kendi gücünün yetmediği bir anda neye dayandın?" },
    { order:55, meaningTr:"Kudreti son derece sağlam ve sarsılmaz.", importanceTr:"Metîn ismi, sarsıntılı dönemlerde bile sabit bir dayanağın bulunduğunu hatırlatır.", reflectionTr:"Her şey sallantıdayken seni ayakta tutan neydi?" },
    { order:56, meaningTr:"Dostu olan kuluna yardım eden, işlerini üstlenen.", importanceTr:"Velî ismi, yalnız kalındığı düşünülen anlarda bile bir dostun var olduğunu hatırlatır.", reflectionTr:"Kimsesiz hissettiğin bir anda aslında yanında ne kalmıştı?" },
    { order:57, meaningTr:"Bizzat övgüye layık olan, her hâliyle övülmeyi hak eden.", importanceTr:"Hamîd ismi, şükrün karşılık beklemeden sunulan bir övgü olduğunu hatırlatır.", reflectionTr:"Bugün fark ettiğin ama dile getirmediğin bir şükür sebebi ne?" },
    { order:58, meaningTr:"Her şeyi tek tek sayıp eksiksiz bilen.", importanceTr:"Muhsî ismi, küçük gördüğümüz ayrıntıların bile bir kayıt altında olduğunu hatırlatır.", reflectionTr:"Önemsiz sandığın bir anın kayda değer olduğunu ne zaman fark ettin?" },
    { order:59, meaningTr:"Hiçbir örneğe dayanmadan ilk kez yaratan.", importanceTr:"Mübdi' ismi, yaratılışın bir taklit değil özgün bir başlangıç olduğunu hatırlatır.", reflectionTr:"Kendinde tamamen özgün hissettiğin bir yön hangisi?" },
    { order:60, meaningTr:"Yarattığını yok ettikten sonra yeniden var eden.", importanceTr:"Muîd ismi, bitmiş sanılan bir şeyin yeniden başlayabileceğine işaret eder.", reflectionTr:"Bittiğini düşündüğün ama yeniden başlayan bir şey oldu mu?" },
    { order:61, meaningTr:"Cansıza can veren, ölüyü dirilten.", importanceTr:"Muhyî ismi, umutsuz görünen bir hâlin bile yeniden canlanabileceğini hatırlatır.", reflectionTr:"İçindeki hangi umut bir süre sönük kaldıktan sonra yeniden canlandı?" },
    { order:62, meaningTr:"Canlıya ölümü takdir edip veren.", importanceTr:"Mümît ismi, ölümün rastlantı değil bir takdir olduğunu, hayatı anlamlı kılan bir sınır olduğunu hatırlatır.", reflectionTr:"Ölümü hatırlamak bugününü nasıl daha kıymetli kılar?" },
    { order:63, meaningTr:"Hayatı ezelî ve ebedî olan, asla sona ermeyen.", importanceTr:"Hayy ismi, her canlı hayatın kaynağının kesintisiz bir diriliğe dayandığını hatırlatır.", reflectionTr:"Kendi hayatındaki en 'canlı' hissettiğin an hangisiydi?" },
    { order:64, meaningTr:"Kendi kendine kaim olan, her şeyi ayakta tutan.", importanceTr:"Kayyûm ismi, her şeyin varlığını sürdürmesinin arkasında sürekli bir desteğin olduğunu hatırlatır.", reflectionTr:"Ayakta kalmakta zorlandığın bir dönemde seni neyin taşıdığını fark ettin mi?" },
    { order:65, meaningTr:"İstediğini dilediği anda bulan, hiçbir şeye muhtaç olmayan.", importanceTr:"Vâcid ismi, insanın aksine hiçbir eksiklik yaşamayan bir zenginliğe işaret eder.", reflectionTr:"Aradığın bir şeyi beklenmedik anda bulduğun bir tecrüben var mı?" },
    { order:66, meaningTr:"Cömertliği, şerefi ve ikramı çok yüce olan.", importanceTr:"Mâcid ismi, cömertliğin sınırlı bir kaynaktan değil sınırsız bir yücelikten geldiğini hatırlatır.", reflectionTr:"Beklenmedik bir cömertliğe tanık olduğun an hangisiydi?" },
    { order:67, meaningTr:"Zâtında, sıfatında ve fiillerinde eşi olmayan tek.", importanceTr:"Vâhid ismi, dağınık görünen hayatın tek bir kaynağa bağlandığını hatırlatır.", reflectionTr:"Hayatındaki farklı parçaları birleştiren tek bir ortak nokta var mı?" },
    { order:68, meaningTr:"Hiçbir şeye muhtaç olmayan, herkesin kendisine muhtaç olduğu.", importanceTr:"Samed ismi, aranan gerçek bağımsızlığın nihayetinde tek bir yöne çıktığını hatırlatır.", reflectionTr:"En çok neye 'muhtaç' hissediyorsun; bu ihtiyaç seni nereye yönlendiriyor?" },
    { order:69, meaningTr:"Dilediğini dilediği gibi yapmaya güç yetiren.", importanceTr:"Kâdir ismi, imkânsız görünen bir değişimin de mümkün olabileceğini hatırlatır.", reflectionTr:"'İmkânsız' dediğin bir şeyin sonradan mümkün olduğuna şahit oldun mu?" },
    { order:70, meaningTr:"Kudretini hiçbir engelle karşılaşmadan dilediği gibi yürüten.", importanceTr:"Muktedir ismi, karşımıza çıkan engellerin mutlak bir engel olmadığını hatırlatır.", reflectionTr:"Aşılmaz sandığın bir engel hangi yolla aşıldı?" },
    { order:71, meaningTr:"Dilediğini öne alan, derecesini ilerleten.", importanceTr:"Mukaddim ismi, sıranın her zaman göründüğü gibi işlemediğini hatırlatır.", reflectionTr:"Beklemediğin hâlde önce sıraya giren bir fırsatın oldu mu?" },
    { order:72, meaningTr:"Dilediğini geri bırakan, zamanını erteleyen.", importanceTr:"Muahhir ismi, ertelenen bir şeyin kaybolmuş olmayabileceğini hatırlatır.", reflectionTr:"Geciken ama sonunda gelen bir şey sabrına ne kattı?" },
    { order:73, meaningTr:"Varlığının bir başlangıcı olmayan, ezelî.", importanceTr:"Evvel ismi, her şeyin bir kaynağa dayandığını, o kaynağın kendisinin başlangıçsız olduğunu hatırlatır.", reflectionTr:"Kendi hikâyende en gerilere gittiğinde neyi 'başlangıç' olarak görürsün?" },
    { order:74, meaningTr:"Varlığının bir sonu olmayan, ebedî.", importanceTr:"Âhir ismi, her şeyin bir sona erdiği yerde bâki kalan bir gerçeğe işaret eder.", reflectionTr:"Geçici olanla kalıcı olanı ayırt ettiğinde ne değişir?" },
    { order:75, meaningTr:"Varlığı sayısız delille apaçık ortaya çıkan.", importanceTr:"Zâhir ismi, aranan cevabın çoğu zaman gözle görülenin içinde saklı olduğunu hatırlatır.", reflectionTr:"Üzerinde durmadan geçtiğin ama aslında anlamlı bir işaret hangisi?" },
    { order:76, meaningTr:"Zâtı akıl ve idrakle tam olarak kavranamayan, gizli.", importanceTr:"Bâtın ismi, her şeyin görünenden ibaret olmadığını hatırlatır.", reflectionTr:"Bir olayın görünmeyen tarafını sonradan anladığın bir an var mı?" },
    { order:77, meaningTr:"Bütün işleri yöneten, tedbiri elinde tutan.", importanceTr:"Vâlî ismi, dağınık görünen olayların aslında bir yönetim altında olduğunu hatırlatır.", reflectionTr:"Kontrolü elinden bıraktığın bir anda işler nasıl yoluna girdi?" },
    { order:78, meaningTr:"Her türlü eksiklik ve benzetmeden çok yüce.", importanceTr:"Müteâlî ismi, en yüce olanın insan ölçüleriyle kıyaslanamayacağını hatırlatır.", reflectionTr:"Anlayamadığın bir şeyi kıyaslamadan kabullenmek nasıl bir rahatlık verir?" },
    { order:79, meaningTr:"İyiliği bol, kullarına şefkatle muamele eden.", importanceTr:"Berr ismi, küçük iyiliklerin bile bir şefkat ifadesi olduğunu hatırlatır.", reflectionTr:"Bugün yaptığın küçük bir iyilik kimin gününü değiştirdi?" },
    { order:80, meaningTr:"Tövbeleri defalarca ve içtenlikle kabul eden.", importanceTr:"Tevvâb ismi, dönüş kapısının bir kereyle sınırlı olmadığını hatırlatır.", reflectionTr:"Yeniden bir başlangıç yapma isteğini en son ne zaman hissettin?" },
    { order:81, meaningTr:"Zulmü ve ısrarlı haksızlığı adaletiyle karşılıksız bırakmayan.", importanceTr:"Müntekim ismi, haksızlığın hesapsız kalmayacağına dair bir güvence verir.", reflectionTr:"Haksızlığa uğradığında adaletin er ya da geç yerini bulacağına güvenmek nasıl bir yük alır?" },
    { order:82, meaningTr:"Günahların izini bile silen, çok affedici.", importanceTr:"Afüv ismi, affın sadece cezayı ertelemek değil izini de silmek olduğunu hatırlatır.", reflectionTr:"Geçmişte iz bıraktığını düşündüğün bir hatan zamanla nasıl hafifledi?" },
    { order:83, meaningTr:"Çok şefkatli, en ince biçimde merhamet eden.", importanceTr:"Raûf ismi, merhametin bazen sertlikten değil ince bir şefkatten geldiğini hatırlatır.", reflectionTr:"Sana en ince biçimde gösterilen bir şefkati hatırlıyor musun?" },
    { order:84, meaningTr:"Bütün mülkün ve egemenliğin gerçek ve mutlak sahibi.", importanceTr:"Mâlikü'l-Mülk ismi, dünyadaki her gücün geçici bir emanet olduğunu hatırlatır.", reflectionTr:"Elinde tuttuğun bir gücü emanet gözüyle görmek neyi değiştirir?" },
    { order:85, meaningTr:"Hem sonsuz azamet hem sınırsız ikram ve cömertlik sahibi.", importanceTr:"Bu isim, büyüklük ile cömertliğin bir arada, çelişmeden bulunabileceğini hatırlatır.", reflectionTr:"Hayatında büyüklük ve cömertliğin bir arada bulunduğu bir örnek var mı?" },
    { order:86, meaningTr:"Hakkı sahibine, adaleti tam ölçüsüyle veren.", importanceTr:"Muksit ismi, adaletin eksiksiz uygulanabileceği bir ölçünün var olduğunu hatırlatır.", reflectionTr:"Kendi adalet anlayışını en çok hangi durumda sorgularsın?" },
    { order:87, meaningTr:"Dağınık olanı, farklı olanı bir araya toplayan.", importanceTr:"Câmi' ismi, parçalı görünen bir hayatın bir bütünlüğe kavuşabileceğini hatırlatır.", reflectionTr:"Hayatındaki dağınık parçalar hangi ortak amaç etrafında toplanabilir?" },
    { order:88, meaningTr:"Hiçbir şeye muhtaç olmayan, mutlak zenginlik sahibi.", importanceTr:"Ganî ismi, gerçek zenginliğin biriktirmekten değil ihtiyaçsızlıktan geldiğini hatırlatır.", reflectionTr:"En az ihtiyaç hissettiğin an kendini nasıl hissettin?" },
    { order:89, meaningTr:"Dilediğini zengin kılan, ihtiyaçtan kurtaran.", importanceTr:"Mugnî ismi, zenginliğin bazen beklenmedik bir yoldan geldiğini hatırlatır.", reflectionTr:"Bir ihtiyacın ummadığın bir yoldan giderildi mi?" },
    { order:90, meaningTr:"Dilemediği bir şeyin gerçekleşmesine izin vermeyen.", importanceTr:"Mâni' ismi, bazı 'engellenmelerin' aslında bir korumaya dönüşebileceğini hatırlatır.", reflectionTr:"Engellendiğinde kızdığın ama sonradan hayrına olduğunu fark ettiğin bir şey oldu mu?" },
    { order:91, meaningTr:"Hikmeti gereği, sınama veya uyarı olarak zararı da takdir eden.", importanceTr:"Dârr ismi, zorlukların da bir anlam ve sınır içinde takdir edildiğini hatırlatır.", reflectionTr:"Zor bir dönem seni hangi konuda daha dikkatli hâle getirdi?" },
    { order:92, meaningTr:"Faydayı ve iyiliği yaratıp kuluna ulaştıran.", importanceTr:"Nâfi' ismi, hangi çabanın gerçekten fayda vereceğinin nihai olarak buna bağlı olduğunu hatırlatır.", reflectionTr:"Küçük bir çaban beklenmedik bir faydaya dönüştü mü?" },
    { order:93, meaningTr:"Göklerin, yerin ve kalplerin aydınlığının kaynağı.", importanceTr:"Nûr ismi, karanlık görünen bir durumda bile bir aydınlanma imkânı olduğunu hatırlatır.", reflectionTr:"Karanlık bir dönemde seni aydınlatan küçük bir işaret neydi?" },
    { order:94, meaningTr:"Doğru yola ileten, kılavuzluk eden.", importanceTr:"Hâdî ismi, kaybolmuş hissedilen anlarda bile bir yol gösterenin var olduğunu hatırlatır.", reflectionTr:"Yolunu kaybettiğini hissettiğin bir anda seni yönlendiren neydi?" },
    { order:95, meaningTr:"Eşi benzeri olmayan bir tarzda, örneksiz yaratan.", importanceTr:"Bedî' ismi, yaratılıştaki özgünlüğün tesadüf değil bir sanat olduğunu hatırlatır.", reflectionTr:"Doğada gördüğün en özgün tasarım hangisiydi?" },
    { order:96, meaningTr:"Varlığı hiç sona ermeden sonsuza kadar devam eden.", importanceTr:"Bâkî ismi, gelip geçici olanla kalıcı olan arasındaki farkı hatırlatır.", reflectionTr:"Bugün yaptığın hangi şey geçici değil kalıcı bir iz bırakabilir?" },
    { order:97, meaningTr:"Her şeyin nihayetinde kendisine kalacağı asıl mirasçı.", importanceTr:"Vâris ismi, sahip olunan her şeyin geçici bir emanet olduğunu hatırlatır.", reflectionTr:"Arkanda kalıcı olarak neyi bırakmak istersin?" },
    { order:98, meaningTr:"Her işi doğru sonuca ulaştıracak hikmetle yöneten.", importanceTr:"Reşîd ismi, karmaşık görünen bir sürecin de doğru bir istikamete akabileceğini hatırlatır.", reflectionTr:"Başta amaçsız görünen bir yolun seni nereye ulaştırdığını fark ettin mi?" },
    { order:99, meaningTr:"Cezalandırmakta acele etmeyen, sonsuz sabır sahibi.", importanceTr:"Sabûr ismi, bize tanınan zamanın bir fırsat olduğunu hatırlatır.", reflectionTr:"Sabırla beklediğinde aceleyle kaçırabileceğin neyi kazandın?" }
  ];

  var CONTENT_BY_ORDER = {};
  for (var i = 0; i < CONTENT.length; i++) CONTENT_BY_ORDER[CONTENT[i].order] = CONTENT[i];

  var DISCLAIMER_LIMIT_TR = "Bu 99 isim, Allah'ın rivayet edilegelen ve yaygın olarak öğretilen isimlerinden bir seçkidir; Allah'ın isim ve sıfatlarının yalnız bunlardan ibaret olduğu iddia edilmez.";
  var DISCLAIMER_EBCED_TR = 'Ebced², geleneksel ebced hesabına dayalı kişisel bir tamamlama yolculuğudur; dua ve zikrin kabulü için zorunlu bir sayı değildir.';

  function build() {
    var base = (typeof window !== 'undefined' && window.EsmaulHusnaV1 && window.EsmaulHusnaV1.names) || [];
    var out = [];
    for (var i = 0; i < base.length; i++) {
      var rec = base[i];
      var c = CONTENT_BY_ORDER[rec.order] || {};
      out.push(Object.freeze({
        id: rec.id,
        order: rec.order,
        name: rec.name,
        arabic: rec.arabic,
        transliterationTr: rec.name,
        ebced: rec.ebced,
        meaningTr: c.meaningTr || '',
        importanceTr: c.importanceTr || '',
        reflectionTr: c.reflectionTr || '',
        sourceRefs: Object.freeze(['diyanet-99-isim']),
        editorialStatus: 'draft'
      }));
    }
    return out;
  }

  var names = Object.freeze(build());

  window.EsmaulHusnaV2 = Object.freeze({
    version: '2.0.0-draft',
    preparedAt: '2026-07-29',
    names: names,
    sources: Object.freeze(SOURCES),
    disclaimerLimitTr: DISCLAIMER_LIMIT_TR,
    disclaimerEbcedTr: DISCLAIMER_EBCED_TR,
    contentNote: "meaningTr/importanceTr taslak olarak 'diyanet-99-isim' genel kaynağına dayanır; reflectionTr özgün tefekkür sorularıdır, bir kurumdan alıntı değildir. editorialStatus tüm kayıtlarda 'draft'tır — insan editoryal incelemesi ve kullanıcı onayı olmadan 'reviewed' işaretlenmemeli ve yayına alınmamalıdır."
  });
})();
