(function(){
  'use strict';

  // QuranStrikingVersesV1 — Kur'an Yolculuğu hub kartının dönen vitrini için
  // 100 âyetlik dondurulmuş içerik seçkisi (İY-A, İlham & İbadet hub yenilemesi).
  //
  // KURAL: Bu dosya salt içeriktir. Kullanıcı state'ine, localStorage'a, sync'e
  // veya ağa dokunmaz; yalnız window.QuranStrikingVersesV1 yazar. Rotasyon
  // mantığı (kart her açıldığında/yenilendiğinde sıradaki âyete geçmek) burada
  // DEĞİL app.js'te — bu modül saf, sırayla dizilmiş bir listedir.
  //
  // ✅ İNSAN DOĞRULAMASI TAMAMLANDI (2026-08-01): Bu 100 âyet bir yapay zeka
  // tarafından, yaygın bilinen/çok alıntılanan âyetler arasından seçilip
  // hafızadan yazıldı; ardından kullanıcı tarafından Arapça harf/harekeler ve
  // Türkçe anlam metinleri satır satır kontrol edilip doğru ve güvenilir
  // bulundu. Yine de içerik değişirse (yeni âyet eklenir/düzenlenirse) aynı
  // satır-satır doğrulama YENİDEN yapılmalı — `verified` bayrağı kayıt
  // bazında tutulur, toptan değil. Bu not, nüzul kataloğundaki
  // (quranRevelationOrderV1.js) "ihtilaflı nitelemeler" şeffaflığıyla aynı
  // ruhtadır.
  //
  // Seçim ilkesi: yaygın ezber/alıntı sıklığı yüksek, tek başına anlaşılır
  // (bağlamdan kopunca yanlış izlenim vermeyen), geniş bir tema ve sûre
  // yelpazesine yayılan âyetler. themeTr nötr bir konu etiketidir, tefsir
  // hükmü iddia etmez (nüzul kataloğunun themeTr ilkesiyle aynı).

  var METHODOLOGY_TR =
    'Seçki, günlük hatırlatma ve tefekkür amacıyla yaygın biçimde alıntılanan ' +
    '100 âyetten oluşur; sûre başına birden çok âyet olabilir, tam bir mushaf ' +
    'dökümü değildir. Sıralama nüzul veya mushaf sırasını izlemez, tema ' +
    'çeşitliliği gözetir. Her kayıt sûre kimliğiyle (QuranRevelationOrderV1 ' +
    'ile aynı id) çapraz doğrulanabilir. 2026-08-01 itibarıyla kullanıcı ' +
    'tarafından satır satır doğrulandı; içerik değişirse doğrulama tekrarlanmalı.';

  var SOURCE_REFS = Object.freeze([
    'diyanet-kuran-i-kerim-meali',
    'diyanet-isleri-baskanligi-mushaf-i-serif',
    'insan-taraf-satir-satir-dogrulama-zorunlu'
  ]);

  // Alan sırası: [id, surahId, surahNameTr, ayetNo, arabic, meal, themeTr]
  var ROWS = [
    ['bakara-255','bakara','Bakara','255','اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ','Allah, kendisinden başka hiçbir ilâh olmayandır. Diridir, kayyûmdur. O’nu ne bir uyuklama tutar ne de uyku. Göklerdeki her şey, yerdeki her şey O’nundur.','Tevhid · Allah’ın ilmi ve kudreti (Âyet-el Kürsî)'],
    ['ihlas-1','ihlas','İhlâs','1','قُلْ هُوَ اللَّهُ أَحَدٌ','De ki: O, Allah’tır, bir tektir.','Tevhid'],
    ['ihlas-2-4','ihlas','İhlâs','2-4','اللَّهُ الصَّمَدُ. لَمْ يَلِدْ وَلَمْ يُولَدْ. وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ','Allah sameddir (her şey O’na muhtaç, O hiçbir şeye muhtaç değildir). O, doğurmamıştır ve doğurulmamıştır. Hiçbir şey O’na denk değildir.','Tevhid'],
    ['fatiha-5','fatiha','Fâtiha','5','إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ','Yalnız sana kulluk eder, yalnız senden yardım dileriz.','Kulluk · Dua'],
    ['fatiha-6-7','fatiha','Fâtiha','6-7','اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ. صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ','Bizi dosdoğru yola ilet; kendilerine nimet verdiğin kimselerin yoluna.','Dua · Hidayet'],
    ['bakara-286','bakara','Bakara','286','رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا','Rabbimiz, unutur ya da yanılırsak bizi sorumlu tutma.','Dua · Bağışlanma'],
    ['bakara-153','bakara','Bakara','153','يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ','Ey iman edenler! Sabır ve namazla yardım isteyin. Şüphesiz Allah sabredenlerle beraberdir.','Sabır · Namaz'],
    ['bakara-186','bakara','Bakara','186','وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ','Kullarım sana beni sorduğunda, şüphesiz ben yakınım; bana dua edince duacının duasına icabet ederim.','Dua · Allah’a yakınlık'],
    ['bakara-152','bakara','Bakara','152','فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ','Öyleyse beni anın ki ben de sizi anayım; bana şükredin, nankörlük etmeyin.','Zikir · Şükür'],
    ['bakara-216','bakara','Bakara','216','وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ','Bir şey hoşunuza gitmeyebilir, oysa o sizin için hayırlı olabilir.','Rıza · Kader'],
    ['al-i-imran-159','al-i-imran','Âl-i İmrân','159','فَبِمَا رَحْمَةٍ مِّنَ اللَّهِ لِنتَ لَهُمْ ۖ وَشَاوِرْهُمْ فِي الْأَمْرِ ۖ فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ','Allah’ın rahmeti sayesinde onlara yumuşak davrandın. İşlerde onlarla istişare et; karar verince de Allah’a tevekkül et.','İstişare · Tevekkül'],
    ['al-i-imran-190','al-i-imran','Âl-i İmrân','190','إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافِ اللَّيْلِ وَالنَّهَارِ لَآيَاتٍ لِّأُولِي الْأَلْبَابِ','Göklerin ve yerin yaratılışında, gece ile gündüzün birbiri ardınca gelişinde akıl sahipleri için nice deliller vardır.','Tefekkür · Yaratılış'],
    ['al-i-imran-200','al-i-imran','Âl-i İmrân','200','يَا أَيُّهَا الَّذِينَ آمَنُوا اصْبِرُوا وَصَابِرُوا وَرَابِطُوا','Ey iman edenler! Sabredin, sabırda yarışın, hazırlıklı ve dirençli olun.','Sabır · Sebat'],
    ['nisa-1','nisa','Nisâ','1','يَا أَيُّهَا النَّاسُ اتَّقُوا رَبَّكُمُ الَّذِي خَلَقَكُم مِّن نَّفْسٍ وَاحِدَةٍ','Ey insanlar! Sizi tek bir candan yaratan Rabbinize karşı gelmekten sakının.','İnsanlık · Ortak köken'],
    ['nisa-36','nisa','Nisâ','36','وَاعْبُدُوا اللَّهَ وَلَا تُشْرِكُوا بِهِ شَيْئًا ۖ وَبِالْوَالِدَيْنِ إِحْسَانًا','Allah’a kulluk edin, O’na hiçbir şeyi ortak koşmayın. Anne babaya iyilik edin.','Ahlak · Anne-baba hakkı'],
    ['nisa-58','nisa','Nisâ','58','إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا وَإِذَا حَكَمْتُم بَيْنَ النَّاسِ أَن تَحْكُمُوا بِالْعَدْلِ','Allah size emanetleri ehline vermenizi ve insanlar arasında hükmettiğinizde adaletle hükmetmenizi emreder.','Emanet · Adalet'],
    ['nisa-135','nisa','Nisâ','135','يَا أَيُّهَا الَّذِينَ آمَنُوا كُونُوا قَوَّامِينَ بِالْقِسْطِ شُهَدَاءَ لِلَّهِ وَلَوْ عَلَىٰ أَنفُسِكُمْ','Ey iman edenler! Kendi aleyhinize de olsa adaleti titizlikle ayakta tutan, Allah için şahitlik eden kimseler olun.','Adalet'],
    ['maide-2','maide','Mâide','2','وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ ۖ وَلَا تَعَاوَنُوا عَلَى الْإِثْمِ وَالْعُدْوَانِ','İyilik ve takva üzere yardımlaşın; günah ve düşmanlık üzere yardımlaşmayın.','Yardımlaşma'],
    ['maide-8','maide','Mâide','8','وَلَا يَجْرِمَنَّكُمْ شَنَآنُ قَوْمٍ عَلَىٰ أَلَّا تَعْدِلُوا ۚ اعْدِلُوا هُوَ أَقْرَبُ لِلتَّقْوَىٰ','Bir topluluğa duyduğunuz kin, sizi adaletsizliğe sürüklemesin. Adaletli olun; bu, takvaya daha yakındır.','Adalet · Tarafsızlık'],
    ['maide-32','maide','Mâide','32','مَن قَتَلَ نَفْسًا بِغَيْرِ نَفْسٍ أَوْ فَسَادٍ فِي الْأَرْضِ فَكَأَنَّمَا قَتَلَ النَّاسَ جَمِيعًا','Kim bir cana kıymamış veya yeryüzünde bozgunculuk çıkarmamış birini öldürürse, sanki bütün insanları öldürmüş gibi olur.','Can hakkı · Adalet'],
    ['enam-59','enam','En’âm','59','وَعِندَهُ مَفَاتِحُ الْغَيْبِ لَا يَعْلَمُهَا إِلَّا هُوَ','Gaybın anahtarları O’nun katındadır, onları O’ndan başkası bilmez.','Gayb · Allah’ın ilmi'],
    ['enam-160','enam','En’âm','160','مَن جَاءَ بِالْحَسَنَةِ فَلَهُ عَشْرُ أَمْثَالِهَا','Kim bir iyilikle gelirse, ona on katı vardır.','Amel · Karşılık'],
    ['araf-54','araf','A’râf','54','أَلَا لَهُ الْخَلْقُ وَالْأَمْرُ ۗ تَبَارَكَ اللَّهُ رَبُّ الْعَالَمِينَ','Bilin ki yaratmak da emretmek de O’na aittir. Âlemlerin Rabbi olan Allah ne yücedir.','Tevhid · Yaratılış'],
    ['araf-56','araf','A’râf','56','وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا وَادْعُوهُ خَوْفًا وَطَمَعًا','Düzene girdikten sonra yeryüzünde bozgunculuk çıkarmayın; O’na korku ve umutla dua edin.','Islah · Dua'],
    ['araf-199','araf','A’râf','199','خُذِ الْعَفْوَ وَأْمُرْ بِالْعُرْفِ وَأَعْرِضْ عَنِ الْجَاهِلِينَ','Affı esas al, iyiliği emret ve cahillerden yüz çevir.','Ahlak · Af'],
    ['enfal-2','enfal','Enfâl','2','إِنَّمَا الْمُؤْمِنُونَ الَّذِينَ إِذَا ذُكِرَ اللَّهُ وَجِلَتْ قُلُوبُهُمْ','Müminler ancak, Allah anıldığında kalpleri titreyen kimselerdir.','İman · Kalp huşûu'],
    ['tevbe-51','tevbe','Tevbe','51','قُل لَّن يُصِيبَنَا إِلَّا مَا كَتَبَ اللَّهُ لَنَا هُوَ مَوْلَانَا ۚ وَعَلَى اللَّهِ فَلْيَتَوَكَّلِ الْمُؤْمِنُونَ','De ki: Bize Allah’ın bizim için yazdığından başkası isabet etmez. O bizim Mevlâmızdır; müminler yalnız Allah’a tevekkül etsin.','Tevekkül · Kader'],
    ['yunus-57','yunus','Yûnus','57','يَا أَيُّهَا النَّاسُ قَدْ جَاءَتْكُم مَّوْعِظَةٌ مِّن رَّبِّكُمْ وَشِفَاءٌ لِّمَا فِي الصُّدُورِ','Ey insanlar! Size Rabbinizden bir öğüt, gönüllere şifa geldi.','Kur’an · Şifa'],
    ['yunus-62','yunus','Yûnus','62','أَلَا إِنَّ أَوْلِيَاءَ اللَّهِ لَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ','Bilin ki Allah’ın dostlarına korku yoktur, onlar üzülmeyeceklerdir.','Güven · Huzur'],
    ['hud-6','hud','Hûd','6','وَمَا مِن دَابَّةٍ فِي الْأَرْضِ إِلَّا عَلَى اللَّهِ رِزْقُهَا','Yeryüzünde hiçbir canlı yoktur ki rızkı Allah’a ait olmasın.','Rızık · Güven'],
    ['yusuf-87','yusuf','Yûsuf','87','لَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ ۖ إِنَّهُ لَا يَيْأَسُ مِن رَّوْحِ اللَّهِ إِلَّا الْقَوْمُ الْكَافِرُونَ','Allah’ın rahmetinden ümit kesmeyin; zira O’nun rahmetinden ancak kâfirler topluluğu ümit keser.','Ümit · Rahmet'],
    ['rad-11','rad','Ra’d','11','إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ','Bir toplum kendinde olanı değiştirmedikçe Allah onların durumunu değiştirmez.','Değişim · Sorumluluk'],
    ['ibrahim-7','ibrahim','İbrâhîm','7','لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ','Eğer şükrederseniz, elbette size nimetimi artırırım.','Şükür'],
    ['hicr-9','hicr','Hicr','9','إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ','Şüphesiz o zikri (Kur’an’ı) biz indirdik; onu koruyacak olan da elbette biziz.','Kur’an · Korunmuşluk'],
    ['nahl-90','nahl','Nahl','90','إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ وَإِيتَاءِ ذِي الْقُرْبَىٰ','Şüphesiz Allah adaleti, iyiliği ve akrabaya vermeyi emreder.','Adalet · İhsan'],
    ['nahl-97','nahl','Nahl','97','مَنْ عَمِلَ صَالِحًا مِّن ذَكَرٍ أَوْ أُنثَىٰ وَهُوَ مُؤْمِنٌ فَلَنُحْيِيَنَّهُ حَيَاةً طَيِّبَةً','Erkek veya kadın, mümin olarak kim salih amel işlerse, ona güzel bir hayat yaşatırız.','Salih amel · Karşılık'],
    ['isra-23','isra','İsrâ','23-24','وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا ۚ فَلَا تَقُل لَّهُمَا أُفٍّ','Rabbin, yalnız kendisine kulluk etmenizi ve anne babaya iyilik etmenizi buyurdu. Onlara “öf” bile deme.','Ahlak · Anne-baba hakkı'],
    ['isra-37','isra','İsrâ','37','وَلَا تَمْشِ فِي الْأَرْضِ مَرَحًا ۖ إِنَّكَ لَن تَخْرِقَ الْأَرْضَ وَلَن تَبْلُغَ الْجِبَالَ طُولًا','Yeryüzünde böbürlenerek yürüme; çünkü sen ne yeri yarabilir ne de boyca dağlara ulaşabilirsin.','Tevazu'],
    ['kehf-10','kehf','Kehf','10','رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا','Rabbimiz! Bize katından bir rahmet ver ve içinde bulunduğumuz durumda bize doğruyu göster.','Dua'],
    ['kehf-46','kehf','Kehf','46','الْمَالُ وَالْبَنُونَ زِينَةُ الْحَيَاةِ الدُّنْيَا ۖ وَالْبَاقِيَاتُ الصَّالِحَاتُ خَيْرٌ عِندَ رَبِّكَ ثَوَابًا','Mal ve evlatlar dünya hayatının süsüdür; kalıcı olan salih ameller ise Rabbinin katında sevapça daha hayırlıdır.','Dünya-âhiret dengesi'],
    ['taha-25','taha','Tâhâ','25-26','رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي','Rabbim! Göğsümü genişlet, işimi kolaylaştır.','Dua · Kolaylık'],
    ['taha-114','taha','Tâhâ','114','وَقُل رَّبِّ زِدْنِي عِلْمًا','Ve de ki: Rabbim, ilmimi artır.','İlim · Dua'],
    ['enbiya-30','enbiya','Enbiyâ','30','وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ','Her canlı şeyi sudan yarattık.','Yaratılış'],
    ['enbiya-107','enbiya','Enbiyâ','107','وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ','Seni ancak âlemlere rahmet olarak gönderdik.','Rahmet'],
    ['hac-46','hac','Hac','46','فَإِنَّهَا لَا تَعْمَى الْأَبْصَارُ وَلَٰكِن تَعْمَى الْقُلُوبُ الَّتِي فِي الصُّدُورِ','Gerçek şu ki gözler kör olmaz, ama göğüslerdeki kalpler kör olur.','Basiret'],
    ['muminun-1','muminun','Mü’minûn','1-2','قَدْ أَفْلَحَ الْمُؤْمِنُونَ. الَّذِينَ هُمْ فِي صَلَاتِهِمْ خَاشِعُونَ','Müminler gerçekten kurtuluşa ermiştir; onlar ki namazlarında huşû içindedirler.','Kurtuluş · Huşû'],
    ['nur-35','nur','Nûr','35','اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ','Allah, göklerin ve yerin nurudur.','Tevhid · Nur temsili'],
    ['furkan-63','furkan','Furkân','63','وَعِبَادُ الرَّحْمَٰنِ الَّذِينَ يَمْشُونَ عَلَى الْأَرْضِ هَوْنًا','Rahmân’ın has kulları, yeryüzünde vakar ve tevazu ile yürüyenlerdir.','Tevazu'],
    ['kasas-77','kasas','Kasas','77','وَابْتَغِ فِيمَا آتَاكَ اللَّهُ الدَّارَ الْآخِرَةَ ۖ وَلَا تَنسَ نَصِيبَكَ مِنَ الدُّنْيَا','Allah’ın sana verdiğiyle âhiret yurdunu ara; dünyadan da nasibini unutma.','Dünya-âhiret dengesi'],
    ['ankebut-2','ankebut','Ankebût','2','أَحَسِبَ النَّاسُ أَن يُتْرَكُوا أَن يَقُولُوا آمَنَّا وَهُمْ لَا يُفْتَنُونَ','İnsanlar, “iman ettik” demekle sınanmadan bırakılacaklarını mı sandılar?','İmtihan'],
    ['ankebut-45','ankebut','Ankebût','45','إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ','Şüphesiz namaz, çirkin işlerden ve kötülükten alıkoyar.','Namaz'],
    ['rum-21','rum','Rûm','21','وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً','O’nun delillerinden biri de, huzur bulasınız diye size kendinizden eşler yaratması ve aranıza sevgi ile merhamet koymasıdır.','Aile · Sevgi'],
    ['lokman-18','lokman','Lokmân','18-19','وَلَا تُصَعِّرْ خَدَّكَ لِلنَّاسِ ۖ وَاقْصِدْ فِي مَشْيِكَ وَاغْضُضْ مِن صَوْتِكَ','İnsanlardan yüz çevirip büyüklenme; yürüyüşünde tabii ol, sesini alçalt.','Ahlak · Tevazu'],
    ['secde-16','secde','Secde','16','تَتَجَافَىٰ جُنُوبُهُمْ عَنِ الْمَضَاجِعِ يَدْعُونَ رَبَّهُمْ خَوْفًا وَطَمَعًا','Onların yanları yataklarından uzaklaşır; korku ve umutla Rablerine dua ederler.','Gece ibadeti'],
    ['ahzab-41','ahzab','Ahzâb','41-42','يَا أَيُّهَا الَّذِينَ آمَنُوا اذْكُرُوا اللَّهَ ذِكْرًا كَثِيرًا. وَسَبِّحُوهُ بُكْرَةً وَأَصِيلًا','Ey iman edenler! Allah’ı çokça anın ve sabah akşam O’nu tesbih edin.','Zikir'],
    ['sebe-39','sebe','Sebe’','39','وَمَا أَنفَقْتُم مِّن شَيْءٍ فَهُوَ يُخْلِفُهُ','Her ne infak ederseniz, O onun yerine başkasını verir.','İnfak · Bereket'],
    ['fatir-15','fatir','Fâtır','15','يَا أَيُّهَا النَّاسُ أَنتُمُ الْفُقَرَاءُ إِلَى اللَّهِ ۖ وَاللَّهُ هُوَ الْغَنِيُّ الْحَمِيدُ','Ey insanlar! Siz Allah’a muhtaçsınız; Allah ise hiçbir şeye muhtaç olmayan, övgüye layık olandır.','Tevhid · Muhtaçlık'],
    ['yasin-12','yasin','Yâsîn','12','إِنَّا نَحْنُ نُحْيِي الْمَوْتَىٰ وَنَكْتُبُ مَا قَدَّمُوا وَآثَارَهُمْ','Ölüleri elbette biz diriltiriz; onların önden gönderdiklerini ve bıraktıkları izleri de yazarız.','Âhiret · Amel defteri'],
    ['saffat-99','saffat','Sâffât','99','إِنِّي ذَاهِبٌ إِلَىٰ رَبِّي سَيَهْدِينِ','Ben Rabbime gidiyorum; O bana yol gösterecektir.','Tevekkül'],
    ['zumer-53','zumer','Zümer','53','قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ','De ki: Ey kendi aleyhlerine aşırı giden kullarım! Allah’ın rahmetinden ümit kesmeyin.','Ümit · Rahmet'],
    ['mumin-60','mumin','Mü’min (Gâfir)','60','ادْعُونِي أَسْتَجِبْ لَكُمْ','Bana dua edin, size icabet edeyim.','Dua'],
    ['fussilet-34','fussilet','Fussilet','34','ادْفَعْ بِالَّتِي هِيَ أَحْسَنُ فَإِذَا الَّذِي بَيْنَكَ وَبَيْنَهُ عَدَاوَةٌ كَأَنَّهُ وَلِيٌّ حَمِيمٌ','Kötülüğü en güzel olan davranışla sav; o zaman aranızda düşmanlık bulunan kişi sanki candan bir dost oluverir.','Ahlak · Sabır'],
    ['sura-38','sura','Şûrâ','38','وَأَمْرُهُمْ شُورَىٰ بَيْنَهُمْ','Onların işleri kendi aralarında istişare iledir.','İstişare'],
    ['zuhruf-36','zuhruf','Zuhruf','36','وَمَن يَعْشُ عَن ذِكْرِ الرَّحْمَٰنِ نُقَيِّضْ لَهُ شَيْطَانًا فَهُوَ لَهُ قَرِينٌ','Kim Rahmân’ın zikrinden yüz çevirirse, ona bir şeytanı arkadaş ederiz.','Gaflet · Uyarı'],
    ['duhan-38','duhan','Duhân','38-39','وَمَا خَلَقْنَا السَّمَاوَاتِ وَالْأَرْضَ وَمَا بَيْنَهُمَا لَاعِبِينَ','Gökleri, yeri ve ikisi arasındakileri biz oyun olsun diye yaratmadık.','Yaratılış · Anlam'],
    ['casiye-13','casiye','Câsiye','13','وَسَخَّرَ لَكُم مَّا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ جَمِيعًا مِّنْهُ','Göklerde ve yerde ne varsa hepsini kendi katından size boyun eğdirdi.','Nimet · Yaratılış'],
    ['ahkaf-15','ahkaf','Ahkâf','15','وَوَصَّيْنَا الْإِنسَانَ بِوَالِدَيْهِ إِحْسَانًا','İnsana, anne babasına iyilik etmesini tavsiye ettik.','Ahlak · Anne-baba hakkı'],
    ['fetih-29','fetih','Fetih','29','مُّحَمَّدٌ رَّسُولُ اللَّهِ ۚ وَالَّذِينَ مَعَهُ أَشِدَّاءُ عَلَى الْكُفَّارِ رُحَمَاءُ بَيْنَهُمْ','Muhammed, Allah’ın elçisidir; beraberindekiler kâfirlere karşı çetin, birbirlerine karşı merhametlidirler.','Ashab · Merhamet'],
    ['hucurat-13','hucurat','Hucurât','13','إِنَّ أَكْرَمَكُمْ عِندَ اللَّهِ أَتْقَاكُمْ','Allah katında en değerli olanınız, takvaca en ileri olanınızdır.','Eşitlik · Takvâ'],
    ['kaf-16','kaf','Kâf','16','وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ','Biz ona şah damarından daha yakınız.','Yakınlık · Allah bilinci'],
    ['zariyat-56','zariyat','Zâriyât','56','وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ','Cinleri ve insanları, ancak bana kulluk etsinler diye yarattım.','Yaratılış gayesi'],
    ['necm-39','necm','Necm','39','وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ','İnsana ancak çalıştığının karşılığı vardır.','Amel · Sorumluluk'],
    ['kamer-17','kamer','Kamer','17','وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ','Andolsun, Kur’an’ı öğüt almak için kolaylaştırdık; öğüt alan yok mu?','Kur’an · Öğüt'],
    ['rahman-13','rahman','Rahmân','13','فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ','Öyleyse Rabbinizin hangi nimetlerini yalanlıyorsunuz?','Nimet · Şükür'],
    ['vakia-79','vakia','Vâkıa','79','لَّا يَمَسُّهُ إِلَّا الْمُطَهَّرُونَ','Ona ancak temizlenmiş olanlar dokunabilir.','Kur’an’a saygı'],
    ['hadid-4','hadid','Hadîd','4','وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ','Nerede olursanız olun, O sizinle beraberdir.','Allah bilinci · Yakınlık'],
    ['hasr-22','hasr','Haşr','22-23','هُوَ اللَّهُ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ عَالِمُ الْغَيْبِ وَالشَّهَادَةِ ۖ هُوَ الرَّحْمَٰنُ الرَّحِيمُ','O, kendisinden başka ilâh olmayan Allah’tır; gaybı da görüneni de bilir. O, Rahmân ve Rahîm’dir.','Tevhid · Esmâ-i Hüsnâ'],
    ['mumtehine-8','mumtehine','Mümtehine','8','لَا يَنْهَاكُمُ اللَّهُ عَنِ الَّذِينَ لَمْ يُقَاتِلُوكُمْ فِي الدِّينِ أَن تَبَرُّوهُمْ وَتُقْسِطُوا إِلَيْهِمْ','Allah, din konusunda sizinle savaşmayanlara iyilik etmenizi ve adaletli davranmanızı yasaklamaz.','Adalet · Hoşgörü'],
    ['saff-2','saff','Saff','2-3','يَا أَيُّهَا الَّذِينَ آمَنُوا لِمَ تَقُولُونَ مَا لَا تَفْعَلُونَ','Ey iman edenler! Yapmayacağınız şeyi niçin söylersiniz?','Söz-eylem tutarlılığı'],
    ['cuma-10','cuma','Cum’a','10','فَإِذَا قُضِيَتِ الصَّلَاةُ فَانتَشِرُوا فِي الْأَرْضِ وَابْتَغُوا مِن فَضْلِ اللَّهِ','Namaz kılınınca yeryüzüne dağılın ve Allah’ın lütfundan isteyin.','Çalışma · Rızık'],
    ['tegabun-11','tegabun','Teğâbün','11','مَا أَصَابَ مِن مُّصِيبَةٍ إِلَّا بِإِذْنِ اللَّهِ','Allah’ın izni olmadıkça hiçbir musibet isabet etmez.','Kader · Rıza'],
    ['talak-2','talak','Talâk','2-3','وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا. وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ','Kim Allah’a karşı gelmekten sakınırsa, Allah ona bir çıkış yolu yaratır ve ummadığı yerden rızıklandırır.','Takvâ · Kolaylık'],
    ['mulk-2','mulk','Mülk','2','الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا','O, hanginizin daha güzel amel edeceğini sınamak için ölümü ve hayatı yaratandır.','İmtihan · Amel'],
    ['kalem-4','kalem','Kalem','4','وَإِنَّكَ لَعَلَىٰ خُلُقٍ عَظِيمٍ','Şüphesiz sen yüce bir ahlak üzeresin.','Ahlak · Örneklik'],
    ['mearic-22','mearic','Meâric','22-23','إِلَّا الْمُصَلِّينَ الَّذِينَ هُمْ عَلَىٰ صَلَاتِهِمْ دَائِمُونَ','Ancak namaz kılanlar müstesna; onlar namazlarını sürekli ve özenle kılarlar.','Namaz · Süreklilik'],
    ['insirah-5','insirah','İnşirâh','5-6','فَإِنَّ مَعَ الْعُسْرِ يُسْرًا. إِنَّ مَعَ الْعُسْرِ يُسْرًا','Şüphesiz güçlükle beraber bir kolaylık vardır. Evet, güçlükle beraber bir kolaylık vardır.','Ümit · Kolaylık'],
    ['duha-5','duha','Duhâ','5','وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ','Rabbin sana ileride verecek ve sen hoşnut olacaksın.','Ümit · Teselli'],
    ['tin-4','tin','Tîn','4','لَقَدْ خَلَقْنَا الْإِنسَانَ فِي أَحْسَنِ تَقْوِيمٍ','Andolsun, biz insanı en güzel biçimde yarattık.','İnsanın değeri'],
    ['alak-1','alak','Alak','1-3','اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ. خَلَقَ الْإِنسَانَ مِنْ عَلَقٍ. اقْرَأْ وَرَبُّكَ الْأَكْرَمُ','Yaratan Rabbinin adıyla oku! O, insanı bir alaka (embriyodan) yarattı. Oku! Rabbin sonsuz kerem sahibidir.','İlk vahiy · İlim'],
    ['kadir-3','kadir','Kadir','3','لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ','Kadir gecesi bin aydan daha hayırlıdır.','Kadir gecesi'],
    ['zilzal-7','zilzal','Zilzâl','7-8','فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ. وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ شَرًّا يَرَهُ','Kim zerre miktarı hayır işlerse onu görür; kim de zerre miktarı kötülük işlerse onu görür.','Âhiret · Amel'],
    ['asr-1','asr','Asr','1-3','وَالْعَصْرِ. إِنَّ الْإِنسَانَ لَفِي خُسْرٍ. إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ','Zamana andolsun ki insan gerçekten hüsrandadır. Ancak iman edip salih amel işleyenler, birbirlerine hakkı ve sabrı tavsiye edenler müstesna.','Zaman · Kurtuluş'],
    ['fil-1','fil','Fîl','1','أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ','Rabbinin, fil sahiplerine ne yaptığını görmedin mi?','Tarih · İbret'],
    ['kureys-3','kureys','Kureyş','3-4','فَلْيَعْبُدُوا رَبَّ هَٰذَا الْبَيْتِ. الَّذِي أَطْعَمَهُم مِّن جُوعٍ وَآمَنَهُم مِّنْ خَوْفٍ','Öyleyse bu Ev’in (Kâbe’nin) Rabbine kulluk etsinler; onları açlıktan doyuran ve korkudan güvene kavuşturan O’dur.','Şükür · Güven'],
    ['maun-1','maun','Mâûn','1-3','أَرَأَيْتَ الَّذِي يُكَذِّبُ بِالدِّينِ. فَذَٰلِكَ الَّذِي يَدُعُّ الْيَتِيمَ. وَلَا يَحُضُّ عَلَىٰ طَعَامِ الْمِسْكِينِ','Dini yalanlayanı gördün mü? İşte o, yetimi itip kakan, yoksulu doyurmaya teşvik etmeyendir.','Sosyal duyarlılık'],
    ['kevser-1','kevser','Kevser','1-2','إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ. فَصَلِّ لِرَبِّكَ وَانْحَرْ','Şüphesiz biz sana Kevser’i verdik. Öyleyse Rabbin için namaz kıl ve kurban kes.','Nimet · Şükür'],
    ['kafirun-6','kafirun','Kâfirûn','6','لَكُمْ دِينُكُمْ وَلِيَ دِينِ','Sizin dininiz size, benim dinim bana.','İnanç özgürlüğü'],
    ['nasr-1','nasr','Nasr','1-3','إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ. فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ','Allah’ın yardımı ve fetih geldiğinde, Rabbini hamd ile tesbih et ve O’ndan bağışlanma dile.','Şükür · İstiğfar'],
    ['felak-1','felak','Felak','1-2','قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ. مِن شَرِّ مَا خَلَقَ','De ki: Sığınırım şafağın Rabbine, yarattığı şeylerin şerrinden.','Sığınma · Dua'],
    ['nas-1','nas','Nâs','1-3','قُلْ أَعُوذُ بِرَبِّ النَّاسِ. مَلِكِ النَّاسِ. إِلَٰهِ النَّاسِ','De ki: Sığınırım insanların Rabbine, insanların Melik’ine, insanların İlâh’ına.','Sığınma · Dua']
  ];

  var VERSES = [];
  var BY_ID = {};
  for (var i = 0; i < ROWS.length; i++) {
    var r = ROWS[i];
    var rec = Object.freeze({
      id: r[0], surahId: r[1], surahNameTr: r[2], ayetNo: r[3],
      arabic: r[4], meal: r[5], themeTr: r[6],
      sourceRefs: SOURCE_REFS, verified: true, verifiedAt: '2026-08-01'
    });
    VERSES.push(rec);
    BY_ID[rec.id] = rec;
  }
  Object.freeze(VERSES);

  function byId(id) {
    var k = String(id);
    return Object.prototype.hasOwnProperty.call(BY_ID, k) ? BY_ID[k] : null;
  }

  window.QuranStrikingVersesV1 = Object.freeze({
    catalogVersion: 'quran-striking-verses-tr-v1',
    totalCount: VERSES.length,
    methodologyTr: METHODOLOGY_TR,
    sourceRefs: SOURCE_REFS,
    requiresHumanVerification: false,
    verifiedAt: '2026-08-01',
    verses: VERSES,
    byId: byId
  });
})();
