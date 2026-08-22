(function(){
  'use strict';

  // QuranRevelationOrderV1 — Raşit ile Kur’an Yolculuğu için dondurulmuş sûre
  // kataloğu. 114 sûre, Diyanet/TDV’nin de esas aldığı yaygın (Mısır/Kahire
  // tertibi) nüzul sırasıyla dizilidir.
  //
  // KURAL: Bu dosya salt içeriktir. Kullanıcı state’ine, localStorage’a,
  // sync’e veya ağa dokunmaz; yalnız window.QuranRevelationOrderV1 yazar.
  // Kullanıcı ilerlemesi data.quranJourney içinde tutulur (QY-02), burada değil.
  //
  // Kayıt alanları (sırayla):
  //   id                ASCII slug, benzersiz, kalıcı anahtar
  //   revelationOrder   nüzul sırası, 1..114 benzersiz
  //   mushafOrder       mushaf sırası, 1..114 benzersiz
  //   nameTr / nameAr   Türkçe / Arapça sûre adı
  //   revelationPlace   'Mekke' | 'Medine'
  //   ayahCount         Kûfe (Hafs) sayımına göre âyet sayısı
  //   themeTr           kısa, betimleyici konu özeti (tefsir hükmü vermez)
  //   sourceRefs        kaynak künyeleri
  //   editorialStatus   'reviewed'

  var METHODOLOGY_TR =
    'Sıralama, Diyanet İşleri Başkanlığı ve TDV İslâm Ansiklopedisi ' +
    'yayınlarında da esas alınan yaygın nüzul tertibine (Mısır/Kahire ' +
    'tertibi) dayanır. Nüzul sırası rivayete dayalı bir tertiptir; klasik ' +
    'kaynaklar arasında özellikle bazı kısa sûrelerin yeri ve birkaç sûrenin ' +
    'Mekkî/Medenî nitelemesi konusunda ihtilaf vardır. Bu katalog tek bir ' +
    'tertibi tutarlı biçimde uygular: 1–86 arası kayıtlar Mekke, 87–114 arası ' +
    'kayıtlar Medine dönemine yerleştirilmiştir. İhtilaflı nitelemeler ' +
    'disputedPlaceIds listesinde işaretlidir. Konu özetleri sûrenin genel ' +
    'muhtevasını betimler; nüzul sebebi veya tefsir hükmü iddiasında bulunmaz.';

  var SOURCE_REFS = Object.freeze([
    'diyanet-kuran-i-kerim-meali-sure-basliklari',
    'tdv-islam-ansiklopedisi-sure-maddeleri',
    'misir-kahire-mushafi-nuzul-tertibi'
  ]);

  // Mekkî/Medenî nitelemesi klasik kaynaklarda tartışmalı olan sûreler.
  var DISPUTED_PLACE_IDS = Object.freeze([
    'fatiha', 'mutaffifin', 'rad', 'rahman', 'insan', 'zilzal',
    'beyyine', 'tegabun', 'hac', 'nasr'
  ]);

  // Kayıtlar nüzul sırasına göre dizilidir.
  // Alan sırası: [id, revelationOrder, mushafOrder, nameTr, nameAr, ayahCount, themeTr]
  var ROWS = [
    ['alak',1,96,'Alak','العلق',19,'Yaratılış ve “oku” çağrısıyla açılan ilk vahiy bölümü; kalem, bilgi ve azgınlığın sınırı.'],
    ['kalem',2,68,'Kalem','القلم',52,'Kaleme ve yazılana yeminle başlar; peygamberin ahlâkı ve iftiraya karşı sabır.'],
    ['muzzemmil',3,73,'Müzzemmil','المزمل',20,'Gece kalkışı, ağır bir sözün yükü ve güzellikle yürütülen davet.'],
    ['muddessir',4,74,'Müddessir','المدثر',56,'Örtüsüne bürünene “kalk ve uyar” çağrısı; arınma, sabır ve hesap.'],
    ['fatiha',5,1,'Fâtiha','الفاتحة',7,'Kur’an’ın açılışı: hamd, rahmet, kulluk ve dosdoğru yol duası.'],
    ['mesed',6,111,'Tebbet (Mesed)','المسد',5,'Davete düşmanlıkta direnen bir tutumun akıbetini anlatan kısa sûre.'],
    ['tekvir',7,81,'Tekvîr','التكوير',29,'Güneşin dürülmesiyle açılan kıyamet sahnesi ve vahyin güvenilirliği.'],
    ['ala',8,87,'A’lâ','الأعلى',19,'Yüce Rabbin adını tesbih; yaratış, ölçü ve kolaylaştırılan öğüt.'],
    ['leyl',9,92,'Leyl','الليل',21,'Gece ile gündüzün karşıtlığında verme–cimrilik ve birbirinden ayrılan iki yol.'],
    ['fecr',10,89,'Fecr','الفجر',30,'Şafak yeminleri, geçmiş toplumların sonu ve huzura eren nefis.'],
    ['duha',11,93,'Duhâ','الضحى',11,'Kuşluk vaktiyle gelen teselli: terk edilmedin, yalnız bırakılmadın.'],
    ['insirah',12,94,'İnşirâh','الشرح',8,'Göğsün ferahlatılması ve her zorlukla beraber gelen kolaylık.'],
    ['asr',13,103,'Asr','العصر',3,'Zamana yeminle hüsranın istisnası: iman, sâlih amel, hak ve sabır.'],
    ['adiyat',14,100,'Âdiyât','العاديات',11,'Koşan atlar sahnesiyle insanın nankörlüğü ve gizlinin açığa çıkışı.'],
    ['kevser',15,108,'Kevser','الكوثر',3,'Verilen bol hayır; namaz, kurban ve kesintiye uğramayan hat.'],
    ['tekasur',16,102,'Tekâsür','التكاثر',8,'Çoklukla övünmenin oyalayıcılığı ve nimetten hesaba çekiliş.'],
    ['maun',17,107,'Mâûn','الماعون',7,'Dini yalanlamanın işaretleri: yetimi itmek, namazdan gafil olmak, yardımı esirgemek.'],
    ['kafirun',18,109,'Kâfirûn','الكافرون',6,'İnançta net sınır: “sizin dininiz size, benim dinim bana”.'],
    ['fil',19,105,'Fîl','الفيل',5,'Fil sahiplerinin planının boşa çıkarılışı.'],
    ['felak',20,113,'Felak','الفلق',5,'Şafağın Rabbine sığınma: karanlık, haset ve gizli kötülüğe karşı.'],
    ['nas',21,114,'Nâs','الناس',6,'İnsanların Rabbine sığınma: içe fısıldayan vesveseye karşı.'],
    ['ihlas',22,112,'İhlâs','الإخلاص',4,'Tevhidin özü: eşsiz olan; doğmamış ve doğurmamış olan.'],
    ['necm',23,53,'Necm','النجم',62,'Yıldıza yeminle vahyin kaynağı; hevadan değil, bildirilenden konuşmak.'],
    ['abese',24,80,'Abese','عبس',42,'Yüz çevirme uyarısı; öğüt isteyene öncelik ve hesap günü.'],
    ['kadir',25,97,'Kadir','القدر',5,'Bin aydan hayırlı gece ve inişin bereketi.'],
    ['sems',26,91,'Şems','الشمس',15,'Güneş ve ay yeminleri; nefsin arınması ile Semûd kıssasına kısa atıf.'],
    ['buruc',27,85,'Bürûc','البروج',22,'Burçlara yemin; inancı için ateşe atılanlar ve zulmün hesabı.'],
    ['tin',28,95,'Tîn','التين',8,'İncir ve zeytin yemini; en güzel biçimde yaratılan insanın iki ucu.'],
    ['kureys',29,106,'Kureyş','قريش',4,'Güvenli yolculuklar ve açlıktan doyuran Ev sahibine kulluk.'],
    ['karia',30,101,'Kâria','القارعة',11,'Kapı çalan gün; tartısı ağır ve hafif gelenler.'],
    ['kiyame',31,75,'Kıyâme','القيامة',40,'Kıyamet gününe ve kınayan nefse yemin; dirilişin gerçekliği.'],
    ['humeze',32,104,'Hümeze','الهمزة',9,'Arkadan çekiştiren, mal yığıp ölümsüzlük sanan tutumun sonu.'],
    ['murselat',33,77,'Mürselât','المرسلات',50,'Gönderilenlere yemin; ayırt etme günü ve yalanlayanlara uyarı.'],
    ['kaf',34,50,'Kâf','ق',45,'Şanlı Kur’an’a yemin; diriliş, yakın şahit ve kalpten geçenin bilinmesi.'],
    ['beled',35,90,'Beled','البلد',20,'Bu beldeye yemin; sarp yokuş: köle azadı ve açı doyurmak.'],
    ['tarik',36,86,'Târık','الطارق',17,'Gece gelen yıldız ve her nefsin üzerindeki koruyucu.'],
    ['kamer',37,54,'Kamer','القمر',55,'Ayın yarılması, geçmiş toplumlar ve tekrarlanan “öğüt kolaylaştırıldı” vurgusu.'],
    ['sad',38,38,'Sâd','ص',88,'Dâvûd, Süleymân ve Eyyûb’a değinen; öğüt ve hesap eksenli sûre.'],
    ['araf',39,7,'A’râf','الأعراف',206,'Peygamber kıssaları dizisi ve A’râf’taki bekleyiş sahnesi.'],
    ['cin',40,72,'Cin','الجن',28,'Kur’an’ı dinleyen cin topluluğu ve mescitlerin Allah’a ait oluşu.'],
    ['yasin',41,36,'Yâsîn','يس',83,'Uyarı, kasaba halkı örneği ve diriliş delilleri.'],
    ['furkan',42,25,'Furkân','الفرقان',77,'Hakkı bâtıldan ayıran ölçü ve Rahmân’ın kullarının nitelikleri.'],
    ['fatir',43,35,'Fâtır','فاطر',45,'Gökleri ve yeri yoktan yaratan; rüzgâr, ölü toprak ve diriliş.'],
    ['meryem',44,19,'Meryem','مريم',98,'Zekeriyyâ, Yahyâ, Meryem ve Îsâ’dan İbrâhîm’e uzanan anlatı.'],
    ['taha',45,20,'Tâhâ','طه',135,'Mûsâ’nın çağrılışı, Firavun’la karşılaşma ve uzun kıssa örgüsü.'],
    ['vakia',46,56,'Vâkıa','الواقعة',96,'Gerçekleşecek olan gün ve üç sınıfa ayrılan insanlar.'],
    ['suara',47,26,'Şuarâ','الشعراء',227,'Ardı ardına peygamber kıssaları ve şairlere dair kapanış.'],
    ['neml',48,27,'Neml','النمل',93,'Süleymân, karınca vadisi ve Sebe melikesi anlatısı.'],
    ['kasas',49,28,'Kasas','القصص',88,'Mûsâ’nın hayatı ve Kârûn örneğiyle güç–servet sınavı.'],
    ['isra',50,17,'İsrâ','الإسراء',111,'Gece yolculuğu ve ardından gelen ahlâk ilkeleri dizisi.'],
    ['yunus',51,10,'Yûnus','يونس',109,'Vahyin doğruluğu, Nûh ve Mûsâ kıssaları ile Yûnus kavmine atıf.'],
    ['hud',52,11,'Hûd','هود',123,'Peygamberlerin sabrı ve helâk edilen toplumların ortak dersi.'],
    ['yusuf',53,12,'Yûsuf','يوسف',111,'Baştan sona tek bir kıssa: rüya, kuyu, sabır ve kavuşma.'],
    ['hicr',54,15,'Hicr','الحجر',99,'Kur’an’ın korunması, yaratılış ve Hicr halkına atıf.'],
    ['enam',55,6,'En’âm','الأنعام',165,'Tevhid delilleri, İbrâhîm’in arayışı ve helâl–haram düzeni.'],
    ['saffat',56,37,'Sâffât','الصافات',182,'Saf saf dizilenlere yemin; İbrâhîm ve Yûnus kıssalarına değinir.'],
    ['lokman',57,31,'Lokmân','لقمان',34,'Bir babanın oğluna öğütleri ekseninde hikmet.'],
    ['sebe',58,34,'Sebe’','سبأ',54,'Dâvûd ve Süleymân’a verilenler ile Sebe halkının şükürden uzaklaşması.'],
    ['zumer',59,39,'Zümer','الزمر',75,'Hâlis din, rahmetten ümit kesmeme ve gruplar hâlinde sevk.'],
    ['mumin',60,40,'Mü’min (Gâfir)','غافر',85,'Bağışlayan Rab, Firavun ailesinden iman eden adam ve duanın değeri.'],
    ['fussilet',61,41,'Fussilet','فصلت',54,'Açıklanmış âyetler; kötülüğü iyilikle savmak ve âfâk–enfüs delilleri.'],
    ['sura',62,42,'Şûrâ','الشورى',53,'İşleri danışmayla yürütmek ve vahyin ortak çizgisi.'],
    ['zuhruf',63,43,'Zuhruf','الزخرف',89,'Dünya süsünün ölçüsü ve atalara körü körüne uyma eleştirisi.'],
    ['duhan',64,44,'Duhân','الدخان',59,'Mübarek gecede iniş, duman uyarısı ve hesap.'],
    ['casiye',65,45,'Câsiye','الجاثية',37,'Diz çökmüş toplumlar; hevayı ilâh edinme ve kitabın şahitliği.'],
    ['ahkaf',66,46,'Ahkâf','الأحقاف',35,'Âd kavmine atıf, anne–babaya iyilik ve cin topluluğunun dinleyişi.'],
    ['zariyat',67,51,'Zâriyât','الذاريات',60,'Savuran rüzgârlara yemin; misafir sahnesi ve kulluğun gayesi.'],
    ['gasiye',68,88,'Gâşiye','الغاشية',26,'Kaplayan gün; deve, gök, dağ ve yer üzerinden bakma çağrısı.'],
    ['kehf',69,18,'Kehf','الكهف',110,'Mağara gençleri, iki bağ sahibi, Mûsâ–Hızır ve Zülkarneyn.'],
    ['nahl',70,16,'Nahl','النحل',128,'Sayısız nimet, arı örneği ve güzel öğütle davet.'],
    ['nuh',71,71,'Nûh','نوح',28,'Nûh’un uzun daveti ve toplumunun direnişi.'],
    ['ibrahim',72,14,'İbrâhîm','إبراهيم',52,'Karanlıktan aydınlığa çıkarma, güzel söz örneği ve İbrâhîm’in duası.'],
    ['enbiya',73,21,'Enbiyâ','الأنبياء',112,'Peygamberler zinciri ve tek bir ümmet vurgusu.'],
    ['muminun',74,23,'Mü’minûn','المؤمنون',118,'Kurtuluşa erenlerin nitelikleri ve insanın yaratılış evreleri.'],
    ['secde',75,32,'Secde','السجدة',30,'Yaratılış, diriliş ve geceleri kalkan kullar.'],
    ['tur',76,52,'Tûr','الطور',49,'Tûr’a yemin; hesabın kaçınılmazlığı ve sabırlı davet.'],
    ['mulk',77,67,'Mülk','الملك',30,'Mülkün sahibi; ölüm–hayat sınavı ve kusursuz gök düzeni.'],
    ['hakka',78,69,'Hâkka','الحاقة',52,'Gerçekleşen gün ve kitabın sağdan ya da soldan verilişi.'],
    ['mearic',79,70,'Meâric','المعارج',44,'Yükselme yolları, sürekli namaz ve insanın tez canlılığı.'],
    ['nebe',80,78,'Nebe’','النبأ',40,'Büyük haber üzerine soru; yer–gök düzeni ve ayrılış günü.'],
    ['naziat',81,79,'Nâziât','النازعات',46,'Söküp çıkaranlara yemin; Mûsâ–Firavun ve saatin bilgisi.'],
    ['infitar',82,82,'İnfitâr','الانفطار',19,'Göğün yarılması ve amelleri kaydeden koruyucular.'],
    ['insikak',83,84,'İnşikâk','الانشقاق',25,'Göğün yarılışı, insanın Rabbine doğru çabası ve amel defteri.'],
    ['rum',84,30,'Rûm','الروم',60,'Rumların yenilgisinin ardından gelen galibiyet haberi ve yaratılış işaretleri.'],
    ['ankebut',85,29,'Ankebût','العنكبوت',69,'İmtihanın kaçınılmazlığı ve örümcek evi benzetmesi.'],
    ['mutaffifin',86,83,'Mutaffifîn','المطففين',36,'Ölçü ve tartıda eksiltme ile iki ayrı kayıt: siccîn ve illiyyûn.'],
    ['bakara',87,2,'Bakara','البقرة',286,'En uzun sûre: inanç, ibadet, hukuk ve toplum düzeninin ana çerçevesi.'],
    ['enfal',88,8,'Enfâl','الأنفال',75,'Bedir sonrası ganimet düzeni, savaş ahlâkı ve birlik.'],
    ['al-i-imran',89,3,'Âl-i İmrân','آل عمران',200,'Kitap ehliyle diyalog, Uhud dersleri ve sebat.'],
    ['ahzab',90,33,'Ahzâb','الأحزاب',73,'Hendek kuşatması, aile hukuku ve peygamber evi âdâbı.'],
    ['mumtehine',91,60,'Mümtehine','الممتحنة',13,'Dostluk–düşmanlık ölçüsü ve hicret eden kadınların durumu.'],
    ['nisa',92,4,'Nisâ','النساء',176,'Kadın, yetim, miras ve adalet ekseninde geniş hukuk.'],
    ['zilzal',93,99,'Zilzâl','الزلزلة',8,'Yerin sarsılışı ve zerre ağırlığınca amelin görülmesi.'],
    ['hadid',94,57,'Hadîd','الحديد',29,'Demirin gücü, infak ve kalplerin katılaşmaması uyarısı.'],
    ['muhammed',95,47,'Muhammed','محمد',38,'Savunma hukuku, sebat ve amellerin boşa gitmemesi.'],
    ['rad',96,13,'Ra’d','الرعد',43,'Gök gürültüsünün tesbihi, kalplerin huzuru ve hakkın kalıcılığı.'],
    ['rahman',97,55,'Rahmân','الرحمن',78,'Nimetlerin sayımı ve tekrarlanan “hangi nimeti yalanlarsınız” sorusu.'],
    ['insan',98,76,'İnsân (Dehr)','الإنسان',31,'İnsanın yaratılışı, sevdiği yiyeceği başkasına vermesi ve karşılığı.'],
    ['talak',99,65,'Talâk','الطلاق',12,'Ayrılık sürecinde ölçü, iddet ve takvâ ile açılan çıkış yolu.'],
    ['beyyine',100,98,'Beyyine','البينة',8,'Apaçık delil, ayrışma ve hâlis kulluk.'],
    ['hasr',101,59,'Haşr','الحشر',24,'Sürgün olayı, ganimet düzeni ve Allah’ın güzel isimleri.'],
    ['nur',102,24,'Nûr','النور',64,'İftiraya karşı hukuk, mahremiyet âdâbı ve nur temsili.'],
    ['hac',103,22,'Hac','الحج',78,'Hac çağrısı, kurban ve savunma izni.'],
    ['munafikun',104,63,'Münâfikûn','المنافقون',11,'İki yüzlü tutumun tarifi ve infak çağrısı.'],
    ['mucadele',105,58,'Mücâdele','المجادلة',22,'Şikâyetini Allah’a ileten kadın, zıhâr hükmü ve gizli konuşma âdâbı.'],
    ['hucurat',106,49,'Hucurât','الحجرات',18,'Toplum ahlâkı: haberi araştırmak, alay, gıybet ve kardeşlik.'],
    ['tahrim',107,66,'Tahrîm','التحريم',12,'Helâli kendine yasaklamamak, aile içi denge ve tövbe.'],
    ['tegabun',108,64,'Teğâbün','التغابن',18,'Aldanış günü; mal ve evlat sınavı ile Allah’a güvenme.'],
    ['saff',109,61,'Saff','الصف',14,'Söz ile eylemin tutarlılığı ve saf bağlamış birlik.'],
    ['cuma',110,62,'Cum’a','الجمعة',11,'Cuma çağrısı, alışverişi bırakma ve ilmin sorumluluğu.'],
    ['fetih',111,48,'Fetih','الفتح',29,'Hudeybiye sonrası apaçık fetih müjdesi ve biat.'],
    ['maide',112,5,'Mâide','المائدة',120,'Ahitlere vefa, helâl–haram, adalet ve sofra kıssası.'],
    ['tevbe',113,9,'Tevbe','التوبة',129,'Ahit bozanlarla ilişkiler, sefer sınavı ve tövbenin kabulü.'],
    ['nasr',114,110,'Nasr','النصر',3,'Yardım ve fetih geldiğinde tesbih, hamd ve istiğfar.']
  ];

  // Bu tertipte 1–86 Mekke, 87–114 Medine dönemidir (bkz. METHODOLOGY_TR).
  var LAST_MECCAN_ORDER = 86;

  var SURAHS = [];
  var BY_ID = {};
  var BY_REVELATION = {};
  var BY_MUSHAF = {};

  for (var i = 0; i < ROWS.length; i++) {
    var r = ROWS[i];
    var rec = Object.freeze({
      id: r[0],
      revelationOrder: r[1],
      mushafOrder: r[2],
      nameTr: r[3],
      nameAr: r[4],
      revelationPlace: r[1] <= LAST_MECCAN_ORDER ? 'Mekke' : 'Medine',
      ayahCount: r[5],
      themeTr: r[6],
      sourceRefs: SOURCE_REFS,
      editorialStatus: 'reviewed'
    });
    SURAHS.push(rec);
    BY_ID[rec.id] = rec;
    BY_REVELATION[rec.revelationOrder] = rec;
    BY_MUSHAF[rec.mushafOrder] = rec;
  }

  Object.freeze(SURAHS);

  function byId(id) {
    var k = String(id);
    return Object.prototype.hasOwnProperty.call(BY_ID, k) ? BY_ID[k] : null;
  }
  function byRevelationOrder(n) {
    var k = String(n);
    return Object.prototype.hasOwnProperty.call(BY_REVELATION, k) ? BY_REVELATION[k] : null;
  }
  function byMushafOrder(n) {
    var k = String(n);
    return Object.prototype.hasOwnProperty.call(BY_MUSHAF, k) ? BY_MUSHAF[k] : null;
  }
  function isPlaceDisputed(id) {
    return DISPUTED_PLACE_IDS.indexOf(String(id)) >= 0;
  }

  window.QuranRevelationOrderV1 = Object.freeze({
    catalogVersion: 'quran-revelation-tr-v1',
    totalCount: SURAHS.length,
    firstSurahId: SURAHS.length ? SURAHS[0].id : null,
    lastMeccanOrder: LAST_MECCAN_ORDER,
    methodologyTr: METHODOLOGY_TR,
    sourceRefs: SOURCE_REFS,
    disputedPlaceIds: DISPUTED_PLACE_IDS,
    surahs: SURAHS,
    byId: byId,
    byRevelationOrder: byRevelationOrder,
    byMushafOrder: byMushafOrder,
    isPlaceDisputed: isPlaceDisputed
  });
})();
