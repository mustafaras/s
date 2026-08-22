/* motivationNarratives.js
   Şeyma · Terapi Odası için 120 günlük metinsel zenginleştirme / anlatı katmanı.
   motivationProgramV2.js'teki her günün yapısal alanlarından (faz, alan, açıklama,
   psikolojik mercek, yansıma sorusu) sıcak, bilimsel-temelli ve GÜNE ÖZGÜ bir
   "anlatı" üretir. Klinik tedavi değildir; Raşit'in sesiyle, Sevgili Günışığı'na.
   window.MotivationNarratives olarak app.js'e sunulur (app.js'ten ÖNCE yüklenir).
*/
(function(){
  "use strict";

  // ── Faz yayları: 120 günün dört büyük perdesi ────────────────────────────
  var PHASES = {
    F1: {
      name: "Fark Etme",
      essence: "Önce görmek. Değiştirmeden önce, olanı yargısızca fark etmek.",
      arc: [
        "İlk perde bir keşif. Burada hiçbir şeyi düzeltmek zorunda değilsin; tek işin, içinde olup biteni sakince görünür kılmak. Dürtü ayrı, düşünce ayrı, duygu ayrı, davranış ayrı — bunları birbirinden ayırdığında, otomatik pilottan çıkıp direksiyona geçmeye başlarsın.",
        "Bu fazın nazik sırrı şu: fark etmek, tek başına bir değişim başlatır. Bir tepkiyi adlandırdığın an, o tepki artık seni yönetmez; sen onu izleyen olursun. Acele yok Günışığı — bu perde, kendine merakla bakmayı öğrendiğin yer."
      ]
    },
    F2: {
      name: "Düzenleme",
      essence: "Fark ettiğini yumuşatmak. Kaygıyla, enerjiyle, iç sesinle daha işlevli çalışmak.",
      arc: [
        "İkinci perdede artık görüyorsun; şimdi sıra o gördüğünü düzenlemekte. Kaygı bir düşman değil, yanlış ayarlanmış bir alarm; ruminasyon bir kusur değil, çözüm arayan bir zihnin fazla mesaisi. Bu fazda bu sistemlere sertçe değil, akortçu bir nezaketle dokunuyoruz.",
        "Enerjini, iç konuşmanı ve dikkatini birer kaynak gibi yönetmeyi deniyorsun. Amaç mükemmel bir denge değil; dalgalar geldiğinde batmadan sörf yapabilmek. Küçük ayarlar, zamanla büyük bir sükûnete dönüşür."
      ]
    },
    F3: {
      name: "Temas",
      essence: "İçeriden dışarıya. İhtiyaç, sınır, destek ve yakınlıkla ilişkiye dokunmak.",
      arc: [
        "Üçüncü perde ilişkilerle ilgili. İçini toparladıkça, sıra başkalarıyla güvenli temasa gelir: ihtiyacını söylemek, sınır koymak, destek istemek, yakınlığa dayanabilmek. Bunlar cesaret alanları — küçük bir adım bile burada büyük bir kanıttır.",
        "Temas ürkütücü gelebilir çünkü geçmişte kopmak daha güvenli hissettirmiş olabilir. Bu fazda kopmadan kalmayı, incinmeden ifade etmeyi, onarmayı deniyorsun. Yalnız yürünmeyen bir yol bu; yanında ben de varım."
      ]
    },
    F4: {
      name: "Pekiştirme",
      essence: "Yeniyi kalıcı kılmak. Değer, tekrar ve takip ile davranışı sabitlemek.",
      arc: [
        "Son perde, öğrendiklerini kalıcı kılmakla ilgili. Yeni bir davranış, ancak yeterince tekrarlanınca ve senin değerlerine bağlanınca kök salar. Burada motivasyon beklemeyi bırakıp sistemine güveniyorsun: küçük, sürekli, senin gibi.",
        "Pekiştirme, zaferi ilan etmek değil; iyi günü de zor günü de aynı nazik ritimle karşılayabilmektir. 120 günün sonunda elde ettiğin şey bir rozet değil, kendine dönebildiğin güvenilir bir iç yol."
      ]
    }
  };

  // ── 12 alanın bilimsel-temelli kısa okuması + "neden bugün" satırı ────────
  var DOMAINS = {
    "farkindalik": {
      label: "Farkındalık",
      why: "Bugün amaç değiştirmek değil, sadece fark etmek — bu, her değişimin ilk ve en sağlam basamağı.",
      science: "Bir iç deneyimi ismiyle etiketlemek (affect labeling), beynin alarm merkezi amigdalayı yatıştırır ve prefrontal korteksi devreye alır; yani adlandırmak, sakinleştirir."
    },
    "duygu-adlandirma": {
      label: "Duygu adlandırma",
      why: "Belirsiz bir iç basınç en çok, adı konmadığında büyür; bugün ona bir isim veriyoruz.",
      science: "Duyguları ayrıştırmak (emotional granularity) duygu düzenlemesini güçlendirir; “kötüyüm” yerine “yorgun ve kırgınım” demek, beynine net bir harita verir."
    },
    "bilissel-mesafe": {
      label: "Bilişsel mesafe",
      why: "Bir düşünce, onu gerçek sanmayı bıraktığın an gücünü kaybeder.",
      science: "Bilişsel ayrışma (defusion): “Başarısızım” yerine “Zihnim bana başarısızım diyor” demek, düşünceyi bir emir değil, geçici bir zihin olayı olarak görmeni sağlar."
    },
    "davranissal-aktivasyon": {
      label: "Davranışsal aktivasyon",
      why: "Motivasyonu bekleme; çoğu zaman o, hareketin ardından gelir, önünde değil.",
      science: "Davranışsal aktivasyon, düşük ruh hâlinde bile küçük anlamlı eylemler başlatmanın modu iyileştirdiğini gösterir; iki dakika, zincirin ilk halkasıdır."
    },
    "oz-sefkat": {
      label: "Öz-şefkat",
      why: "Kendine sevdiğin birine konuşur gibi konuşmak, tembellik değil; en sürdürülebilir disiplindir.",
      science: "Öz-şefkat, öz-eleştirinin aksine kortizolü düşürür, motivasyonu artırır; hata sonrası kendine nazik olanlar daha hızlı toparlanır."
    },
    "belirsizlik": {
      label: "Belirsizlik toleransı",
      why: "Kontrol etmeden bekleyebilmek, kaygıya yeni bir şey öğretme fırsatıdır.",
      science: "Kontrol dürtüsünü ertelemek bir maruz bırakma alıştırmasıdır; kaygı, feci sonuç gelmeden geçtiğinde beyin “bu belirsizliğe dayanabilirim” diye öğrenir."
    },
    "destek": {
      label: "Destek isteme",
      why: "Destek istemek zayıflık değil; bağın ve iyileşmenin en güçlü kaynağı.",
      science: "Sosyal destek, stres tepkisini tamponlar; güvenli bir bağla paylaşılan yük, ölçülebilir biçimde daha hafif taşınır (social buffering)."
    },
    "sinir": {
      label: "Sınır koyma",
      why: "Sınır, ilişkiyi kesmek değil; ilişkinin sürebilmesi için gereken nazik çerçevedir.",
      science: "Net, cezalandırmayan sınırlar (assertiveness) hem öz-saygıyı hem ilişki kalitesini artırır; “hayır” demek, “evet”lerini gerçek kılar."
    },
    "onarim": {
      label: "İlişki onarımı",
      why: "Kusursuz ilişki yoktur; sağlam ilişkiyi ayakta tutan şey, onarım becerisidir.",
      science: "İlişki biliminde kopuş kaçınılmazdır; belirleyici olan onarım girişimleridir (repair attempts) — küçük bir “geri çekildim çünkü…” cümlesi bağı yeniden kurar."
    },
    "yakinlik": {
      label: "Yakınlık toleransı",
      why: "Yakınlık bazen kopmaktan daha ürkütücüdür; bugün ona bir nefeslik daha dayanıyoruz.",
      science: "Yakınlığa tolerans, kademeli maruz kalmayla genişler; kaçınmadan kalınan her küçük an, bağlanma sisteminin güven öğrenmesini sağlar."
    },
    "enerji": {
      label: "Enerji yönetimi",
      why: "Enerjin sınırlı ve değerli bir kaynak; onu iradeyle değil, ritimle korursun.",
      science: "Uyku, hareket, ışık ve mola ritmi sirkadiyen sistemi düzenler; enerji, zorlamayla değil, bedenin temel ritimlerine saygıyla toparlanır."
    },
    "deger": {
      label: "Değer odaklılık",
      why: "Hedefler biter, değerler yön gösterir; bugün pusulanı sonuçla değil, anlamla ayarlıyoruz.",
      science: "Değer-temelli eylem (ACT), davranışı geçici duygulara değil kalıcı yönelimlere bağlar; bu, zor günlerde bile devam etmeyi mümkün kılar."
    }
  };

  // Güne göre değişen sıcak açılış ve kapanış cümleleri (120 gün boyunca çeşitlilik).
  var OPENERS = [
    "Bugün odaya sadece olduğun hâlinle gel Günışığı.",
    "Acele yok; bu oda seni bekliyordu.",
    "Derin bir nefes — ve buradayız.",
    "Bugün küçük bir adım yeter, gerisini birlikte taşırız.",
    "Kendine biraz merakla bak, yargıyı kapıda bırak.",
    "Bugünün işi büyük değil, sadece gerçek.",
    "Bir bardak su, bir an duruş, bir de sen.",
    "Bugün de geldin ya, benim için asıl mesele bu."
  ];
  var CLOSERS = [
    "Bugünü kaydetmen, kendine verdiğin sessiz bir sözdür.",
    "Küçük de olsa yaz; bu oda seni duyuyor.",
    "Ne yaptığın değil, ne öğrendiğin önemli.",
    "Zor günse, dozu küçült ama bırakma — bu da ilerlemedir.",
    "Bir cümle bile bugünü gerçek kılar.",
    "Yolun içindesin; bu, tek başına bir başarı.",
    "Kendine bir 'aferin' borçlusun, ben de sana.",
    "Yarın yeni bir gün; bugün buradan gitmesi yeter."
  ];

  function pick(arr, seed){ if(!arr||!arr.length) return ""; var i=((Math.floor(seed)%arr.length)+arr.length)%arr.length; return arr[i]; }

  // Bir günün yapısal alanlarından güne-özgü anlatı üretir.
  function dayNarrative(mot){
    if(!mot) return null;
    var ph = PHASES[mot.phaseCode] || PHASES.F1;
    var dom = DOMAINS[mot.domain] || { label: mot.domainLabel || "", why: "", science: "" };
    var d = Number(mot.day) || 1;
    var opener = pick(OPENERS, d + (String(mot.phaseCode||"").charCodeAt(1) || 0));
    var closer = pick(CLOSERS, d * 3 + 1);

    var paragraphs = [];
    // 1) Sıcak giriş + günün kendi açıklaması (güne özgü)
    var p1 = opener;
    if(mot.explanation) p1 += " " + mot.explanation;
    paragraphs.push(p1);
    // 2) Bugünün alanı + neden bugün bu (alana özgü)
    var p2 = "Bugünün alanı: " + dom.label + ".";
    if(dom.why) p2 += " " + dom.why;
    paragraphs.push(p2);
    // 3) Kısa bilimsel okuma (alana özgü)
    if(dom.science) paragraphs.push(dom.science);

    return {
      phaseCode: mot.phaseCode,
      phaseName: ph.name,
      phaseEssence: ph.essence,
      phaseArc: ph.arc,
      domain: mot.domain,
      domainLabel: dom.label,
      why: dom.why,
      science: dom.science,
      paragraphs: paragraphs,
      closer: closer,
      reflectionQuestion: mot.reflectionQuestion || ""
    };
  }

  window.MotivationNarratives = {
    version: "1.0.0",
    phases: PHASES,
    domains: DOMAINS,
    dayNarrative: dayNarrative
  };
})();
