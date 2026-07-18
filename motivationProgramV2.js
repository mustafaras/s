/* motivationProgramV2.js
   Şeyma uygulaması için 120 günlük bilimsel-temelli motivasyon programı.
   V2.1: aktif görev kilidi + minimum görev + başarı hikâyesi.
   Ana sözlerin tamamı özgün yazılmıştır; klinik tedavi değildir.
*/
(function(){
  "use strict";
  var PROGRAM = [
{
    "day": 1,
    "phaseCode": "F1",
    "phaseTitle": "Faz 1 — Fark Etme",
    "phaseGoal": "Dürtü, düşünce, duygu ve davranışı ayırmak; otomatik geri çekilmeyi görünür kılmak.",
    "domain": "farkindalik",
    "domainLabel": "Farkındalık",
    "quoteKind": "original_science_based",
    "quote": "Bugün kendini düzeltilecek bir problem gibi değil, anlaşılacak bir sistem gibi ele al.",
    "source": null,
    "psychologicalLens": "otomatik tepkiyi yavaşlatma",
    "explanation": "Bu günün amacı otomatik savunmayı suçlamak değil, onu fark edip daha esnek bir seçenek üretmektir.",
    "reflectionQuestion": "Bu tepki beni gerçekten korudu mu, yoksa yalnızca teması mı erteledi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f1",
      "farkindalik",
      "otomatik-tepkiyi-yavaşlatma"
    ],
    "standardTask": "Bugün geri çekilmek istediğin bir anda 90 saniye dur ve dürtünün adını yaz.",
    "minimumTask": "Geri çekilme veya otomatik tepkiyle ilgili yalnızca bir kelime yaz.",
    "successMeaning": "Otomatik tepkiyi fark ettin; bu, değişim için ilk davranış verisidir.",
    "reflectionExamples": [
      "Bugün geri çekilme isteği geldiğinde 90 sn durdum; vücudumda gerilme fark ettim, hemen tepki vermek zorunda değilmişim.",
      "Dürtü anında altımda kırılganlık olduğunu gördüm; sadece 'kaygı' diye adlandırmak yoğunluğu biraz azalttı.",
      "Cevap vermeden önce 'şu anda zihnim ne diyor?' diye sordum; bu duruş, dürtüyü veri olarak görmek için yeterliydi."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bugün geri çekilmek istediğin bir anda 90 saniye dur ve dürtünün adını yaz."
  },
  {
    "day": 2,
    "phaseCode": "F1",
    "phaseTitle": "Faz 1 — Fark Etme",
    "phaseGoal": "Dürtü, düşünce, duygu ve davranışı ayırmak; otomatik geri çekilmeyi görünür kılmak.",
    "domain": "duygu-adlandirma",
    "domainLabel": "Duygu adlandırma",
    "quoteKind": "original_science_based",
    "quote": "Geri çekilme isteği geldiğinde hemen kaybolma; önce bunun neyi korumaya çalıştığını dinle.",
    "source": null,
    "psychologicalLens": "duygu ayrıştırma",
    "explanation": "Küçük davranış, zihne soyut motivasyondan daha güvenilir kanıt verir.",
    "reflectionQuestion": "Şu an hissettiğim şeyin en doğru adı ne?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f1",
      "duygu-adlandirma",
      "duygu-ayrıştırma"
    ],
    "standardTask": "Bugünün baskın duygusunu üç düzeyde yaz: görünen duygu, alttaki duygu, bedendeki his.",
    "minimumTask": "Bugünkü baskın duygunu tek kelimeyle adlandır.",
    "successMeaning": "Duyguyu adlandırdın; belirsiz iç basıncı daha yönetilebilir hâle getirdin.",
    "reflectionExamples": [
      "Bugün görünürde bunalım hissediyordum ama altında üzüntü vardı; göğsümde ağırlık fark ettim.",
      "Duyguyu sadece 'kötü' değil, 'hayal kırıklığı' diye adlandırınca daha yönetilebilir geldi; zihnim 'hâlâ güvensiz' dedi.",
      "Üç katman yazdım: dışta bunalım, ortada suçluluk, bedende sıkışma; bu ayrıştırma panik hissini durdurdu."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bugünün baskın duygusunu üç düzeyde yaz: görünen duygu, alttaki duygu, bedendeki his."
  },
  {
    "day": 3,
    "phaseCode": "F1",
    "phaseTitle": "Faz 1 — Fark Etme",
    "phaseGoal": "Dürtü, düşünce, duygu ve davranışı ayırmak; otomatik geri çekilmeyi görünür kılmak.",
    "domain": "bilissel-mesafe",
    "domainLabel": "Bilişsel mesafe",
    "quoteKind": "original_science_based",
    "quote": "Bir duygunun yoğun olması, onun verdiği talimatın doğru olduğu anlamına gelmez.",
    "source": null,
    "psychologicalLens": "bilişsel ayrışma",
    "explanation": "Duygu ve düşünceyi ayırmak, tepki vermeden önce seçim alanı açar.",
    "reflectionQuestion": "Bu düşünceye yüzde kaç inanıyorum ve hangi kanıt eksik?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f1",
      "bilissel-mesafe",
      "bilişsel-ayrışma"
    ],
    "standardTask": "Zorlayan düşüncenin başına şu ifadeyi ekle: 'Zihnim şu anda bana ... diyor.'",
    "minimumTask": "Zorlayan düşünceni 'Zihnim şu anda bana ... diyor' kalıbıyla bir cümleye çevir.",
    "successMeaning": "Düşünceyle arana mesafe koydun; onu gerçek değil veri olarak ele aldın.",
    "reflectionExamples": [
      "Zihnim 'kontrol etmeliyim' diyordu; başına 'zihnim şu anda bana ... diyor' ekleyince gerçekliği azaldı.",
      "Bu düşünceye %70 inanıyordum ama kanıt listelediğimde alternatif açıklamanın eksik olduğunu gördüm.",
      "Düşünceyi bir cümle olarak yazıp okudum; aynı cümle tekrarlanınca bir 'veri parçası' gibi durdu."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Zorlayan düşüncenin başına şu ifadeyi ekle: 'Zihnim şu anda bana ... diyor.'"
  },
  {
    "day": 4,
    "phaseCode": "F1",
    "phaseTitle": "Faz 1 — Fark Etme",
    "phaseGoal": "Dürtü, düşünce, duygu ve davranışı ayırmak; otomatik geri çekilmeyi görünür kılmak.",
    "domain": "davranissal-aktivasyon",
    "domainLabel": "Davranışsal aktivasyon",
    "quoteKind": "original_science_based",
    "quote": "Hazır hissetmiyorsan da çok küçük bir başlangıç yapabilirsin.",
    "source": null,
    "psychologicalLens": "davranışsal aktivasyon",
    "explanation": "Yakınlık ve sınır birlikte çalıştığında ilişki daha az tehditkâr hale gelir.",
    "reflectionQuestion": "En küçük uygulanabilir adım neydi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f1",
      "davranissal-aktivasyon",
      "davranışsal-aktivasyon"
    ],
    "standardTask": "İki dakikada başlayabileceğin bir davranış seç ve yalnızca iki dakika uygula.",
    "minimumTask": "Görevin yalnızca ilk 60 saniyesini yap.",
    "successMeaning": "Motivasyonu beklemeden davranış başlattın.",
    "reflectionExamples": [
      "Hazır değildim ama temizlik için sadece iki dakika başladım; sonra doğal olarak devam etmek istedim.",
      "Motivasyonu beklemeden 3 dk yürüdüm; başlangıcın hissettiğimden çok daha küçük olabileceğini yeniden öğrendim.",
      "Bugünün minimumu 'ilk adımı yazmak' idi; yaptığımda kendime 'bu da sayılır' demeyi başardım."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "İki dakikada başlayabileceğin bir davranış seç ve yalnızca iki dakika uygula."
  },
  {
    "day": 5,
    "phaseCode": "F1",
    "phaseTitle": "Faz 1 — Fark Etme",
    "phaseGoal": "Dürtü, düşünce, duygu ve davranışı ayırmak; otomatik geri çekilmeyi görünür kılmak.",
    "domain": "oz-sefkat",
    "domainLabel": "Öz-şefkat",
    "quoteKind": "original_science_based",
    "quote": "Kendine sert davranmak disiplin gibi görünebilir; ama sürdürülebilirlik başka bir şeydir.",
    "source": null,
    "psychologicalLens": "öz-şefkatli iç konuşma",
    "explanation": "Kapasiteye göre ayarlanmış hedef, sürdürülebilirlik ve öz-yeterlik için daha uygundur.",
    "reflectionQuestion": "Kendime daha adil davransaydım aynı durumda ne derdim?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f1",
      "oz-sefkat",
      "öz-şefkatli-iç-konuşma"
    ],
    "standardTask": "Sert bir iç cümleni daha adil ve uygulanabilir bir cümleye çevir.",
    "minimumTask": "Kendine söylediğin sert cümleyi fark et ve yanına daha adil bir kelime ekle.",
    "successMeaning": "Öz-eleştiriye karşı daha sürdürülebilir bir iç dil denedin.",
    "reflectionExamples": [
      "Kendime 'hiçbir işe yaramıyorsun' dediğimi fark ettim; yerine 'bugün zordu, yeterince çabaladım' desem daha adil ve sürdürülebilir olurdu.",
      "Aynı durumda arkadaşıma nasıl konuşurdum? Ona her gün aynı değil, kendime ise başkaları daha iyi demiştim; bugün dengeledim.",
      "Başarısızlık değil, kapasite sınırı; 'bugün bu kadar yeter' demek, daha uzun soluklu çalışmamı sağlıyor."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Sert bir iç cümleni daha adil ve uygulanabilir bir cümleye çevir."
  },
  {
    "day": 6,
    "phaseCode": "F1",
    "phaseTitle": "Faz 1 — Fark Etme",
    "phaseGoal": "Dürtü, düşünce, duygu ve davranışı ayırmak; otomatik geri çekilmeyi görünür kılmak.",
    "domain": "belirsizlik",
    "domainLabel": "Belirsizlik toleransı",
    "quoteKind": "original_science_based",
    "quote": "Kesinlik arayışı bazen kaygıyı bitirmez; yalnızca bir sonraki kontrol ihtiyacını büyütür.",
    "source": null,
    "psychologicalLens": "belirsizlikle kalma",
    "explanation": "Bu günün amacı otomatik savunmayı suçlamak değil, onu fark edip daha esnek bir seçenek üretmektir.",
    "reflectionQuestion": "Bu belirsizlikle kalınca korktuğum şey gerçekten oldu mu?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f1",
      "belirsizlik",
      "belirsizlikle-kalma"
    ],
    "standardTask": "Düşük riskli bir belirsizliği 20 dakika kontrol etmeden bırak.",
    "minimumTask": "Bir kontrol davranışını yalnızca 5 dakika ertele.",
    "successMeaning": "Kontrol dürtüsünü erteledin; kaygıya yeni öğrenme alanı açtın.",
    "reflectionExamples": [
      "Sağlık belirtisi belirsizliğiyle 20 dk kontrol etmeden kaldım; korktuğum yetersizlik gerçekleşmedi.",
      "Kontrol dürtüsünü bir saat erteledim; dürtünün geçici olduğunu, paniğin ise dalga gibi geldiğini gördüm.",
      "Kesinlik aramak yerine 'şu an yeterli bilgi var mı?' diye sordum; cevap evetti, ek kontrole gerek kalmadı."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Düşük riskli bir belirsizliği 20 dakika kontrol etmeden bırak."
  },
  {
    "day": 7,
    "phaseCode": "F1",
    "phaseTitle": "Faz 1 — Fark Etme",
    "phaseGoal": "Dürtü, düşünce, duygu ve davranışı ayırmak; otomatik geri çekilmeyi görünür kılmak.",
    "domain": "destek",
    "domainLabel": "Destek isteme",
    "quoteKind": "original_science_based",
    "quote": "Destek istemek, kendi gücünden vazgeçmek değil; yükünü daha akıllı taşımaktır.",
    "source": null,
    "psychologicalLens": "sosyal destek aktivasyonu",
    "explanation": "Küçük davranış, zihne soyut motivasyondan daha güvenilir kanıt verir.",
    "reflectionQuestion": "Destek istemek nasıl hissettirdi: riskli, rahatlatıcı, garip, nötr?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f1",
      "destek",
      "sosyal-destek-aktivasyonu"
    ],
    "standardTask": "Güvendiğin bir kişiden küçük ve somut bir destek iste.",
    "minimumTask": "Destek isteyebileceğin kişinin adını ve isteyeceğin şeyi taslak olarak yaz.",
    "successMeaning": "Destek isteme davranışının ilk basamağını görünür yaptın.",
    "reflectionExamples": [
      "Duygusal bir yük konusunda yakın arkadaşımdan yardım istedim; istemek utanç değil, çözüm üretmekmiş.",
      "Destek ararken 'bu konuda fikrini alabilir miyim' dedim; karşı tarafın sadece dinlemesi bile yükümü hafifletti.",
      "Yalnız başa çıkmak zorunda değilim; bugün yalnızca dinlenme talep ettim, bu yakınlığı güvenli kıldı."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Güvendiğin bir kişiden küçük ve somut bir destek iste."
  },
  {
    "day": 8,
    "phaseCode": "F1",
    "phaseTitle": "Faz 1 — Fark Etme",
    "phaseGoal": "Dürtü, düşünce, duygu ve davranışı ayırmak; otomatik geri çekilmeyi görünür kılmak.",
    "domain": "sinir",
    "domainLabel": "Sınır koyma",
    "quoteKind": "original_science_based",
    "quote": "Sınır, duvar değildir; temasın hangi koşullarda güvenli kalacağını söyler.",
    "source": null,
    "psychologicalLens": "sınır netliği",
    "explanation": "Duygu ve düşünceyi ayırmak, tepki vermeden önce seçim alanı açar.",
    "reflectionQuestion": "Sınırımı söyleyince temas daha mı netleşti?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f1",
      "sinir",
      "sınır-netliği"
    ],
    "standardTask": "Bir sınır cümlesi kur: 'Şu an ... yapacağım; ... zamanda döneceğim.'",
    "minimumTask": "Koymak istediğin sınırı göndermeden önce tek cümleyle taslaklaştır.",
    "successMeaning": "Sınırı kopmadan ve cezalandırmadan ifade etmeye yaklaştın.",
    "reflectionExamples": [
      "Sosyal bir davet durumunda 'bugün bunu yapamam' dedim; sert değil, net bir çerçeve kurmak rahatlattı.",
      "Hayır demek önce panik, sonra rahatlama getirdi; karşı taraf soru sordu, ben sınırımda kaldım.",
      "Sınırımı açıkça söyleyince suçluluk hissettim ama uzun vadede daha net hissettim."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bir sınır cümlesi kur: 'Şu an ... yapacağım; ... zamanda döneceğim.'"
  },
  {
    "day": 9,
    "phaseCode": "F1",
    "phaseTitle": "Faz 1 — Fark Etme",
    "phaseGoal": "Dürtü, düşünce, duygu ve davranışı ayırmak; otomatik geri çekilmeyi görünür kılmak.",
    "domain": "onarim",
    "domainLabel": "İlişki onarımı",
    "quoteKind": "original_science_based",
    "quote": "Kırgınlık söylenmediğinde çoğu zaman soğukluk gibi görünür.",
    "source": null,
    "psychologicalLens": "ilişki onarımı",
    "explanation": "Yakınlık ve sınır birlikte çalıştığında ilişki daha az tehditkâr hale gelir.",
    "reflectionQuestion": "Onarım denemem ilişkiye hangi yeni bilgiyi ekledi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f1",
      "onarim",
      "ilişki-onarımı"
    ],
    "standardTask": "Uzaklaştığın bir kişiye açıklama taslağı yaz: 'Geri çekildim çünkü ...'",
    "minimumTask": "Onarım cümlesini göndermeden yalnızca notlara yaz.",
    "successMeaning": "Uzaklaşma yerine onarım seçeneğini zihinde erişilebilir yaptın.",
    "reflectionExamples": [
      "Eşimle unutulan bir söz sonrası 'tekrar dinlemek isterim' dedim; onarım büyük jest değil, küçük ve samimi adım.",
      "Özür yerine açıklama ve 'seni dinlemek için zaman ayırayım' sundum; ilişkideki gerilim açık konuşunca azaldı.",
      "Onarım denemem yumuşamaya yol açtı; denemek, mükemmel olmaktan daha değerli."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Uzaklaştığın bir kişiye açıklama taslağı yaz: 'Geri çekildim çünkü ...'"
  },
  {
    "day": 10,
    "phaseCode": "F1",
    "phaseTitle": "Faz 1 — Fark Etme",
    "phaseGoal": "Dürtü, düşünce, duygu ve davranışı ayırmak; otomatik geri çekilmeyi görünür kılmak.",
    "domain": "yakinlik",
    "domainLabel": "Yakınlık toleransı",
    "quoteKind": "original_science_based",
    "quote": "Yakınlık, kendinden vazgeçmek değildir; güvenli dozda temas kurmaktır.",
    "source": null,
    "psychologicalLens": "kademeli yakınlık",
    "explanation": "Kapasiteye göre ayarlanmış hedef, sürdürülebilirlik ve öz-yeterlik için daha uygundur.",
    "reflectionQuestion": "Yakınlık dozu bana fazla mı geldi, yoksa yönetilebilir miydi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f1",
      "yakinlik",
      "kademeli-yakınlık"
    ],
    "standardTask": "Normalde saklayacağın küçük bir doğruyu güvenli bir kişiye söyle.",
    "minimumTask": "Güvenli bir kişiye söyleyebileceğin yüzde beşlik açıklık cümlesini yaz.",
    "successMeaning": "Tam kapanma yerine güvenli dozda temas ihtimalini artırdın.",
    "reflectionExamples": [
      "Yakınlık anında çekilme isteği geldi; bu sefer 30 sn daha kaldım ve panik aynı kaldı ama katlanabilirdidi.",
      "Eşimle sarılma anında 'buradayım' demek, uzaklaşmaktan daha güvenli hissettirdi.",
      "Yakınlığa maruz kalınca bedenim titredi; nefes alıp kalmak, duygu geçene kadar yeterliymiş."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Normalde saklayacağın küçük bir doğruyu güvenli bir kişiye söyle."
  },
  {
    "day": 11,
    "phaseCode": "F1",
    "phaseTitle": "Faz 1 — Fark Etme",
    "phaseGoal": "Dürtü, düşünce, duygu ve davranışı ayırmak; otomatik geri çekilmeyi görünür kılmak.",
    "domain": "enerji",
    "domainLabel": "Enerji yönetimi",
    "quoteKind": "original_science_based",
    "quote": "Bugünkü enerjini geçmişteki en iyi hâlinle değil, bugünkü verinle değerlendir.",
    "source": null,
    "psychologicalLens": "kapasiteye göre hedefleme",
    "explanation": "Bu günün amacı otomatik savunmayı suçlamak değil, onu fark edip daha esnek bir seçenek üretmektir.",
    "reflectionQuestion": "Hedefi küçültmek ilerlemeyi artırdı mı azalttı mı?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f1",
      "enerji",
      "kapasiteye-göre-hedefleme"
    ],
    "standardTask": "Enerjini 0–10 puanla; bugünkü hedefini bu puana göre küçült.",
    "minimumTask": "Enerjini 0–10 arasında puanla ve hedefi bir kademe küçült.",
    "successMeaning": "Kapasiteye göre hedef ayarladın; sürdürülebilirliği korudun.",
    "reflectionExamples": [
      "Bugün enerjim dalgalı idi; kısa bir mola yapınca düşüş yavaşladı ve daha sürdürülebilir çalıştım.",
      "İrade değil ritim; nefes mola verince odaklanmam geri geldi, kendimi suçlamadım.",
      "Yüksek enerjili saatlerimi zor problem için, düşüklerini dinlenme için kullandım; verim değil, denge önemli."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Enerjini 0–10 puanla; bugünkü hedefini bu puana göre küçült."
  },
  {
    "day": 12,
    "phaseCode": "F1",
    "phaseTitle": "Faz 1 — Fark Etme",
    "phaseGoal": "Dürtü, düşünce, duygu ve davranışı ayırmak; otomatik geri çekilmeyi görünür kılmak.",
    "domain": "deger",
    "domainLabel": "Değer odaklılık",
    "quoteKind": "original_science_based",
    "quote": "Değerlerin, zor günlerde bile yönünü gösteren küçük pusulalardır.",
    "source": null,
    "psychologicalLens": "değer temelli davranış",
    "explanation": "Küçük davranış, zihne soyut motivasyondan daha güvenilir kanıt verir.",
    "reflectionQuestion": "Bugünkü davranışım uzun vadede hangi kişiye dönüşmeme yardım ediyor?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f1",
      "deger",
      "değer-temelli-davranış"
    ],
    "standardTask": "Bugün yaptığın tek davranışın hangi değere hizmet ettiğini yaz.",
    "minimumTask": "Bugün korumak istediğin değeri tek kelimeyle yaz.",
    "successMeaning": "Duygu durumdan bağımsız olarak yönünü değerle bağladın.",
    "reflectionExamples": [
      "Bugün yakınlık değerime hizmet eden küçük eylem: bir adım attım; uzun hedef değil, bugünkü seçim önemli.",
      "yorgunluk anı anında değerim dürüstlük olduğunu hatırladım; bu, seçimi kolaylaştırdı.",
      "Davranışım (küçük bir adım attım) ile sağlık arasındaki bağ kurunca motivasyonum içsel."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bugün yaptığın tek davranışın hangi değere hizmet ettiğini yaz."
  },
  {
    "day": 13,
    "phaseCode": "F1",
    "phaseTitle": "Faz 1 — Fark Etme",
    "phaseGoal": "Dürtü, düşünce, duygu ve davranışı ayırmak; otomatik geri çekilmeyi görünür kılmak.",
    "domain": "farkindalik",
    "domainLabel": "Farkındalık",
    "quoteKind": "original_science_based",
    "quote": "Bir şeyi fark etmek, onu hemen değiştirmek zorunda olduğun anlamına gelmez.",
    "source": null,
    "psychologicalLens": "otomatik tepkiyi yavaşlatma",
    "explanation": "Duygu ve düşünceyi ayırmak, tepki vermeden önce seçim alanı açar.",
    "reflectionQuestion": "Bu tepki beni gerçekten korudu mu, yoksa yalnızca teması mı erteledi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f1",
      "farkindalik",
      "otomatik-tepkiyi-yavaşlatma"
    ],
    "standardTask": "Bugün geri çekilmek istediğin bir anda 90 saniye dur ve dürtünün adını yaz.",
    "minimumTask": "Geri çekilme veya otomatik tepkiyle ilgili yalnızca bir kelime yaz.",
    "successMeaning": "Otomatik tepkiyi fark ettin; bu, değişim için ilk davranış verisidir.",
    "reflectionExamples": [
      "Bugün düşünce döngüsü anında bir nefes durup fark ettim; vücudumda sıkışma hissettim, hemen tepki vermek zorunda değilmişim.",
      "Dürtü anında altımda çaresizlik olduğunu gördüm; sadece adlandırmak yoğunluğu biraz azalttı.",
      "Kapatma yapmadan önce 'şu anda zihnim ne diyor?' diye sordum; bu duruş, dürtüyü veri olarak görmek için yeterliydi."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bugün geri çekilmek istediğin bir anda 90 saniye dur ve dürtünün adını yaz."
  },
  {
    "day": 14,
    "phaseCode": "F1",
    "phaseTitle": "Faz 1 — Fark Etme",
    "phaseGoal": "Dürtü, düşünce, duygu ve davranışı ayırmak; otomatik geri çekilmeyi görünür kılmak.",
    "domain": "duygu-adlandirma",
    "domainLabel": "Duygu adlandırma",
    "quoteKind": "original_science_based",
    "quote": "Zihnin tehdit aradığında her sessizlik kanıt gibi görünebilir; yine de kanıt olmayabilir.",
    "source": null,
    "psychologicalLens": "duygu ayrıştırma",
    "explanation": "Yakınlık ve sınır birlikte çalıştığında ilişki daha az tehditkâr hale gelir.",
    "reflectionQuestion": "Şu an hissettiğim şeyin en doğru adı ne?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f1",
      "duygu-adlandirma",
      "duygu-ayrıştırma"
    ],
    "standardTask": "Bugünün baskın duygusunu üç düzeyde yaz: görünen duygu, alttaki duygu, bedendeki his.",
    "minimumTask": "Bugünkü baskın duygunu tek kelimeyle adlandır.",
    "successMeaning": "Duyguyu adlandırdın; belirsiz iç basıncı daha yönetilebilir hâle getirdin.",
    "reflectionExamples": [
      "Bugün görünürde sinir hissediyordum ama altında suçluluk vardı; göğsümde boşluk fark ettim.",
      "Duyguyu sadece 'kötü' değil, 'kaygı' diye adlandırınca daha yönetilebilir geldi; zihnim 'hâlâ güvensiz' dedi.",
      "Üç katman yazdım: dışta sinir, ortada yalnızlık, bedende sıkışma; bu ayrıştırma panik hissini durdurdu."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bugünün baskın duygusunu üç düzeyde yaz: görünen duygu, alttaki duygu, bedendeki his."
  },
  {
    "day": 15,
    "phaseCode": "F1",
    "phaseTitle": "Faz 1 — Fark Etme",
    "phaseGoal": "Dürtü, düşünce, duygu ve davranışı ayırmak; otomatik geri çekilmeyi görünür kılmak.",
    "domain": "bilissel-mesafe",
    "domainLabel": "Bilişsel mesafe",
    "quoteKind": "original_science_based",
    "quote": "İçine kapanma isteği bir durma işareti olabilir; yolun sonu olmak zorunda değildir.",
    "source": null,
    "psychologicalLens": "bilişsel ayrışma",
    "explanation": "Kapasiteye göre ayarlanmış hedef, sürdürülebilirlik ve öz-yeterlik için daha uygundur.",
    "reflectionQuestion": "Bu düşünceye yüzde kaç inanıyorum ve hangi kanıt eksik?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f1",
      "bilissel-mesafe",
      "bilişsel-ayrışma"
    ],
    "standardTask": "Zorlayan düşüncenin başına şu ifadeyi ekle: 'Zihnim şu anda bana ... diyor.'",
    "minimumTask": "Zorlayan düşünceni 'Zihnim şu anda bana ... diyor' kalıbıyla bir cümleye çevir.",
    "successMeaning": "Düşünceyle arana mesafe koydun; onu gerçek değil veri olarak ele aldın.",
    "reflectionExamples": [
      "Zihnim 'bu işe yaramayacak' diyordu; başına 'zihnim şu anda bana ... diyor' ekleyince gerçekliği azaldı.",
      "Bu düşünceye %60 inanıyordum ama kanıt listelediğimde başarıldığına dair kanıtın eksik olduğunu gördüm.",
      "Düşünceyi bir cümle olarak yazıp okudum; aynı cümle tekrarlanınca bir 'veri parçası' gibi durdu."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Zorlayan düşüncenin başına şu ifadeyi ekle: 'Zihnim şu anda bana ... diyor.'"
  },
  {
    "day": 16,
    "phaseCode": "F1",
    "phaseTitle": "Faz 1 — Fark Etme",
    "phaseGoal": "Dürtü, düşünce, duygu ve davranışı ayırmak; otomatik geri çekilmeyi görünür kılmak.",
    "domain": "davranissal-aktivasyon",
    "domainLabel": "Davranışsal aktivasyon",
    "quoteKind": "original_science_based",
    "quote": "Bugün büyük bir dönüşüm değil, tekrar edilebilir bir davranış seç.",
    "source": null,
    "psychologicalLens": "davranışsal aktivasyon",
    "explanation": "Bu günün amacı otomatik savunmayı suçlamak değil, onu fark edip daha esnek bir seçenek üretmektir.",
    "reflectionQuestion": "En küçük uygulanabilir adım neydi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f1",
      "davranissal-aktivasyon",
      "davranışsal-aktivasyon"
    ],
    "standardTask": "İki dakikada başlayabileceğin bir davranış seç ve yalnızca iki dakika uygula.",
    "minimumTask": "Görevin yalnızca ilk 60 saniyesini yap.",
    "successMeaning": "Motivasyonu beklemeden davranış başlattın.",
    "reflectionExamples": [
      "Hazır değildim ama mesaj yazma için sadece iki dakika başladım; sonrasında kayganlık hissettim.",
      "Motivasyonu beklemeden bir cümle yazdım; başlangıç, hissettiğimden çok daha küçük bir şeymiş.",
      "Bugünün minimumu 1 dk başlangıç idi; yaptığımda kendime 'bu da sayılır' demeyi öğrendim."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "İki dakikada başlayabileceğin bir davranış seç ve yalnızca iki dakika uygula."
  },
  {
    "day": 17,
    "phaseCode": "F1",
    "phaseTitle": "Faz 1 — Fark Etme",
    "phaseGoal": "Dürtü, düşünce, duygu ve davranışı ayırmak; otomatik geri çekilmeyi görünür kılmak.",
    "domain": "oz-sefkat",
    "domainLabel": "Öz-şefkat",
    "quoteKind": "original_science_based",
    "quote": "Kendini suçlamak bilgi üretmiyorsa, sadece yük bindiriyordur.",
    "source": null,
    "psychologicalLens": "öz-şefkatli iç konuşma",
    "explanation": "Küçük davranış, zihne soyut motivasyondan daha güvenilir kanıt verir.",
    "reflectionQuestion": "Kendime daha adil davransaydım aynı durumda ne derdim?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f1",
      "oz-sefkat",
      "öz-şefkatli-iç-konuşma"
    ],
    "standardTask": "Sert bir iç cümleni daha adil ve uygulanabilir bir cümleye çevir.",
    "minimumTask": "Kendine söylediğin sert cümleyi fark et ve yanına daha adil bir kelime ekle.",
    "successMeaning": "Öz-eleştiriye karşı daha sürdürülebilir bir iç dil denedin.",
    "reflectionExamples": [
      "Kendime 'neden bu kadar yavaşsın' dediğimi fark ettim; yerine 'küçük adım da adımdır' desem daha adil ve sürdürülebilir olurdu.",
      "Aynı durumda arkadaşıma nasıl konuşurdum? Ona sabırlı ol, kendime ise başkaları daha iyi demiştim; bugün dengeledim.",
      "Başarısızlık değil, kapasite sınırı; 'bugün bu kadar yeter' demek, daha uzun soluklu çalışmamı sağlıyor."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Sert bir iç cümleni daha adil ve uygulanabilir bir cümleye çevir."
  },
  {
    "day": 18,
    "phaseCode": "F1",
    "phaseTitle": "Faz 1 — Fark Etme",
    "phaseGoal": "Dürtü, düşünce, duygu ve davranışı ayırmak; otomatik geri çekilmeyi görünür kılmak.",
    "domain": "belirsizlik",
    "domainLabel": "Belirsizlik toleransı",
    "quoteKind": "original_science_based",
    "quote": "Belirsizlikle kalmak, kontrolü bırakmak değil; kontrol edilemeyeni zorlamamaktır.",
    "source": null,
    "psychologicalLens": "belirsizlikle kalma",
    "explanation": "Duygu ve düşünceyi ayırmak, tepki vermeden önce seçim alanı açar.",
    "reflectionQuestion": "Bu belirsizlikle kalınca korktuğum şey gerçekten oldu mu?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f1",
      "belirsizlik",
      "belirsizlikle-kalma"
    ],
    "standardTask": "Düşük riskli bir belirsizliği 20 dakika kontrol etmeden bırak.",
    "minimumTask": "Bir kontrol davranışını yalnızca 5 dakika ertele.",
    "successMeaning": "Kontrol dürtüsünü erteledin; kaygıya yeni öğrenme alanı açtın.",
    "reflectionExamples": [
      "ilişki durumu belirsizliğiyle 20 dk kalınca korktuğum en kötü senaryo gerçekleşmedi; kaygı gerçeklik değilmiş.",
      "Kontrol dürtüsünü bir saat erteledim; sonrasında kaygı kendi kendine düştü ve fark ettim ki dürtü geçici.",
      "Kesinlik aramak yerine 'şu an yeterli bilgi var mı?' diye sordum; cevap evetti, ek kontrole gerek kalmadı."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Düşük riskli bir belirsizliği 20 dakika kontrol etmeden bırak."
  },
  {
    "day": 19,
    "phaseCode": "F1",
    "phaseTitle": "Faz 1 — Fark Etme",
    "phaseGoal": "Dürtü, düşünce, duygu ve davranışı ayırmak; otomatik geri çekilmeyi görünür kılmak.",
    "domain": "destek",
    "domainLabel": "Destek isteme",
    "quoteKind": "original_science_based",
    "quote": "Bir cümlelik yardım isteği, haftalarca tahmin edilmeyi beklemekten daha nettir.",
    "source": null,
    "psychologicalLens": "sosyal destek aktivasyonu",
    "explanation": "Yakınlık ve sınır birlikte çalıştığında ilişki daha az tehditkâr hale gelir.",
    "reflectionQuestion": "Destek istemek nasıl hissettirdi: riskli, rahatlatıcı, garip, nötr?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f1",
      "destek",
      "sosyal-destek-aktivasyonu"
    ],
    "standardTask": "Güvendiğin bir kişiden küçük ve somut bir destek iste.",
    "minimumTask": "Destek isteyebileceğin kişinin adını ve isteyeceğin şeyi taslak olarak yaz.",
    "successMeaning": "Destek isteme davranışının ilk basamağını görünür yaptın.",
    "reflectionExamples": [
      "pratik iş konusunda bir kişiden yardım istedim; istemek utanç değil, çözüm üretmekmiş.",
      "Destek ararken 'bana 5 dk dinler misin' dedim; karşı tarafın sadece dinlemesi bile yükümü hafifletti.",
      "Yalnız başa çıkmak zorunda değilim; bugün yalnızca dinleme talep ettim, bu yakınlığı güvenli kıldı."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Güvendiğin bir kişiden küçük ve somut bir destek iste."
  },
  {
    "day": 20,
    "phaseCode": "F1",
    "phaseTitle": "Faz 1 — Fark Etme",
    "phaseGoal": "Dürtü, düşünce, duygu ve davranışı ayırmak; otomatik geri çekilmeyi görünür kılmak.",
    "domain": "sinir",
    "domainLabel": "Sınır koyma",
    "quoteKind": "original_science_based",
    "quote": "Sınırını sakin söyleyebilmek, içinden kopmaktan daha olgun bir korunmadır.",
    "source": null,
    "psychologicalLens": "sınır netliği",
    "explanation": "Kapasiteye göre ayarlanmış hedef, sürdürülebilirlik ve öz-yeterlik için daha uygundur.",
    "reflectionQuestion": "Sınırımı söyleyince temas daha mı netleşti?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f1",
      "sinir",
      "sınır-netliği"
    ],
    "standardTask": "Bir sınır cümlesi kur: 'Şu an ... yapacağım; ... zamanda döneceğim.'",
    "minimumTask": "Koymak istediğin sınırı göndermeden önce tek cümleyle taslaklaştır.",
    "successMeaning": "Sınırı kopmadan ve cezalandırmadan ifade etmeye yaklaştın.",
    "reflectionExamples": [
      "sosyal bir davet durumunda 'şu sınır benim için önemli' dedim; sert değil, net bir çerçeve kurmak rahatlattı.",
      "Hayır demek önce panik, sonra rahatlama getirdi; karşı taraf anlayışla karşıladı, ben sınırımda kaldım.",
      "Sınırımı açıkça söyleyince suçluluk hissettim ama uzun vadede daha az yorgun fark ettim."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bir sınır cümlesi kur: 'Şu an ... yapacağım; ... zamanda döneceğim.'"
  },
  {
    "day": 21,
    "phaseCode": "F1",
    "phaseTitle": "Faz 1 — Fark Etme",
    "phaseGoal": "Dürtü, düşünce, duygu ve davranışı ayırmak; otomatik geri çekilmeyi görünür kılmak.",
    "domain": "onarim",
    "domainLabel": "İlişki onarımı",
    "quoteKind": "original_science_based",
    "quote": "Onarım, haklı çıkmak değil; temasın yeniden güvenli olup olmadığını konuşmaktır.",
    "source": null,
    "psychologicalLens": "ilişki onarımı",
    "explanation": "Bu günün amacı otomatik savunmayı suçlamak değil, onu fark edip daha esnek bir seçenek üretmektir.",
    "reflectionQuestion": "Onarım denemem ilişkiye hangi yeni bilgiyi ekledi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f1",
      "onarim",
      "ilişki-onarımı"
    ],
    "standardTask": "Uzaklaştığın bir kişiye açıklama taslağı yaz: 'Geri çekildim çünkü ...'",
    "minimumTask": "Onarım cümlesini göndermeden yalnızca notlara yaz.",
    "successMeaning": "Uzaklaşma yerine onarım seçeneğini zihinde erişilebilir yaptın.",
    "reflectionExamples": [
      "arkadaşımla yaşanan geciken bir cevap sonrası 'özür dilerim, amacım şuydu' dedim; onarım büyük jest değil, küçük ve samimi adım.",
      "Özür yerine açıklama ve 'daha dikkatli olacağım' sundum; ilişkideki gerilim açık konuşunca azaldı.",
      "Onarım denemem daha net konuşmama yardım etti; denemek, mükemmel olmaktan daha değerli."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Uzaklaştığın bir kişiye açıklama taslağı yaz: 'Geri çekildim çünkü ...'"
  },
  {
    "day": 22,
    "phaseCode": "F1",
    "phaseTitle": "Faz 1 — Fark Etme",
    "phaseGoal": "Dürtü, düşünce, duygu ve davranışı ayırmak; otomatik geri çekilmeyi görünür kılmak.",
    "domain": "yakinlik",
    "domainLabel": "Yakınlık toleransı",
    "quoteKind": "original_science_based",
    "quote": "Birine biraz yaklaşmak, ona tamamen yaslanmak zorunda olduğun anlamına gelmez.",
    "source": null,
    "psychologicalLens": "kademeli yakınlık",
    "explanation": "Küçük davranış, zihne soyut motivasyondan daha güvenilir kanıt verir.",
    "reflectionQuestion": "Yakınlık dozu bana fazla mı geldi, yoksa yönetilebilir miydi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f1",
      "yakinlik",
      "kademeli-yakınlık"
    ],
    "standardTask": "Normalde saklayacağın küçük bir doğruyu güvenli bir kişiye söyle.",
    "minimumTask": "Güvenli bir kişiye söyleyebileceğin yüzde beşlik açıklık cümlesini yaz.",
    "successMeaning": "Tam kapanma yerine güvenli dozda temas ihtimalini artırdın.",
    "reflectionExamples": [
      "Yakınlık anında çekilme isteği geldi; bu sefer 30 sn kadar kaldım ve panik hafifledi.",
      "ailem ile sarılma anında 'buradayım' demek, uzaklaşmaktan daha güvenli hissettirdi.",
      "Yakınlığa maruz kalınca bedenim sıcak yaptı; nefes alıp kalmak, duygu geçene kadar yeterliymiş."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Normalde saklayacağın küçük bir doğruyu güvenli bir kişiye söyle."
  },
  {
    "day": 23,
    "phaseCode": "F1",
    "phaseTitle": "Faz 1 — Fark Etme",
    "phaseGoal": "Dürtü, düşünce, duygu ve davranışı ayırmak; otomatik geri çekilmeyi görünür kılmak.",
    "domain": "enerji",
    "domainLabel": "Enerji yönetimi",
    "quoteKind": "original_science_based",
    "quote": "Yorgun zihin kalıcı kararlar vermekte iyi bir danışman değildir.",
    "source": null,
    "psychologicalLens": "kapasiteye göre hedefleme",
    "explanation": "Duygu ve düşünceyi ayırmak, tepki vermeden önce seçim alanı açar.",
    "reflectionQuestion": "Hedefi küçültmek ilerlemeyi artırdı mı azalttı mı?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f1",
      "enerji",
      "kapasiteye-göre-hedefleme"
    ],
    "standardTask": "Enerjini 0–10 puanla; bugünkü hedefini bu puana göre küçült.",
    "minimumTask": "Enerjini 0–10 arasında puanla ve hedefi bir kademe küçült.",
    "successMeaning": "Kapasiteye göre hedef ayarladın; sürdürülebilirliği korudun.",
    "reflectionExamples": [
      "Bugün enerjim düşük idi; 10 dk yürüyüş yapınca odak döndü ve daha sürdürülebilir çalıştım.",
      "İrade değil ritim; 20 dk mola verince odaklanmam geri geldi, kendimi suçlamadım.",
      "Yüksek enerjili saatlerimi zor problem için, düşüklerini hafif iş için kullandım; verim değil, denge önemli."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Enerjini 0–10 puanla; bugünkü hedefini bu puana göre küçült."
  },
  {
    "day": 24,
    "phaseCode": "F1",
    "phaseTitle": "Faz 1 — Fark Etme",
    "phaseGoal": "Dürtü, düşünce, duygu ve davranışı ayırmak; otomatik geri çekilmeyi görünür kılmak.",
    "domain": "deger",
    "domainLabel": "Değer odaklılık",
    "quoteKind": "original_science_based",
    "quote": "Bugün davranışınla hangi değeri büyüttüğünü seç: açıklık, düzen, sağlık ya da güven.",
    "source": null,
    "psychologicalLens": "değer temelli davranış",
    "explanation": "Yakınlık ve sınır birlikte çalıştığında ilişki daha az tehditkâr hale gelir.",
    "reflectionQuestion": "Bugünkü davranışım uzun vadede hangi kişiye dönüşmeme yardım ediyor?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f1",
      "deger",
      "değer-temelli-davranış"
    ],
    "standardTask": "Bugün yaptığın tek davranışın hangi değere hizmet ettiğini yaz.",
    "minimumTask": "Bugün korumak istediğin değeri tek kelimeyle yaz.",
    "successMeaning": "Duygu durumdan bağımsız olarak yönünü değerle bağladın.",
    "reflectionExamples": [
      "Bugün üretkenlik değerime hizmet eden eylem: zor bir konuşma yaptım; uzun hedef değil, bugünkü seçim önemli.",
      "rekabet anında değerim sabır olduğunu hatırladım; bu, seçimi kolaylaştırdı.",
      "Davranışım (kendimi dinledim) ile sabır arasındaki bağ kurunca motivasyonum içsel."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bugün yaptığın tek davranışın hangi değere hizmet ettiğini yaz."
  },
  {
    "day": 25,
    "phaseCode": "F1",
    "phaseTitle": "Faz 1 — Fark Etme",
    "phaseGoal": "Dürtü, düşünce, duygu ve davranışı ayırmak; otomatik geri çekilmeyi görünür kılmak.",
    "domain": "farkindalik",
    "domainLabel": "Farkındalık",
    "quoteKind": "original_science_based",
    "quote": "Otomatik tepki ile seçilmiş davranış arasındaki küçük boşluk, değişimin başladığı yerdir.",
    "source": null,
    "psychologicalLens": "otomatik tepkiyi yavaşlatma",
    "explanation": "Kapasiteye göre ayarlanmış hedef, sürdürülebilirlik ve öz-yeterlik için daha uygundur.",
    "reflectionQuestion": "Bu tepki beni gerçekten korudu mu, yoksa yalnızca teması mı erteledi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f1",
      "farkindalik",
      "otomatik-tepkiyi-yavaşlatma"
    ],
    "standardTask": "Bugün geri çekilmek istediğin bir anda 90 saniye dur ve dürtünün adını yaz.",
    "minimumTask": "Geri çekilme veya otomatik tepkiyle ilgili yalnızca bir kelime yaz.",
    "successMeaning": "Otomatik tepkiyi fark ettin; bu, değişim için ilk davranış verisidir.",
    "reflectionExamples": [
      "Bugün kaçınma anında 90 sn durup fark ettim; vücudumda duraklama hissettim, hemen tepki vermek zorunda değilmişim.",
      "Dürtü geldiğinde fark ettim ki aslında alt duygu hissediyordum; sadece durup adlandırmak yoğunluğu azalttı.",
      "kapatma yapmadan önce kendime 'şu anda ne oluyor?' diye sordum; bu küçük duruş, otomatikliği yavaşlatmak için bir veri."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bugün geri çekilmek istediğin bir anda 90 saniye dur ve dürtünün adını yaz."
  },
  {
    "day": 26,
    "phaseCode": "F1",
    "phaseTitle": "Faz 1 — Fark Etme",
    "phaseGoal": "Dürtü, düşünce, duygu ve davranışı ayırmak; otomatik geri çekilmeyi görünür kılmak.",
    "domain": "duygu-adlandirma",
    "domainLabel": "Duygu adlandırma",
    "quoteKind": "original_science_based",
    "quote": "Duygunun adını doğru koyarsan, çözümü de daha doğru seçersin.",
    "source": null,
    "psychologicalLens": "duygu ayrıştırma",
    "explanation": "Bu günün amacı otomatik savunmayı suçlamak değil, onu fark edip daha esnek bir seçenek üretmektir.",
    "reflectionQuestion": "Şu an hissettiğim şeyin en doğru adı ne?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f1",
      "duygu-adlandirma",
      "duygu-ayrıştırma"
    ],
    "standardTask": "Bugünün baskın duygusunu üç düzeyde yaz: görünen duygu, alttaki duygu, bedendeki his.",
    "minimumTask": "Bugünkü baskın duygunu tek kelimeyle adlandır.",
    "successMeaning": "Duyguyu adlandırdın; belirsiz iç basıncı daha yönetilebilir hâle getirdin.",
    "reflectionExamples": [
      "Bugün görünürde sinir hissediyordum ama altında korku vardı; göğsümde sıkışma fark ettim.",
      "Duyguyu sadece 'kötü' değil, 'hayal kırıklığı' diye adlandırınca daha yönetilebilir geldi; zihnim 'hâlâ güvensiz' dedi.",
      "Üç katman yazdım: dışta bunalım, ortada yalnızlık, bedende nefes daralması; bu ayrıştırma panik hissini durdurdu."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bugünün baskın duygusunu üç düzeyde yaz: görünen duygu, alttaki duygu, bedendeki his."
  },
  {
    "day": 27,
    "phaseCode": "F1",
    "phaseTitle": "Faz 1 — Fark Etme",
    "phaseGoal": "Dürtü, düşünce, duygu ve davranışı ayırmak; otomatik geri çekilmeyi görünür kılmak.",
    "domain": "bilissel-mesafe",
    "domainLabel": "Bilişsel mesafe",
    "quoteKind": "original_science_based",
    "quote": "Her düşünceye mahkeme kurma; bazıları sadece zihinsel gürültüdür.",
    "source": null,
    "psychologicalLens": "bilişsel ayrışma",
    "explanation": "Küçük davranış, zihne soyut motivasyondan daha güvenilir kanıt verir.",
    "reflectionQuestion": "Bu düşünceye yüzde kaç inanıyorum ve hangi kanıt eksik?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f1",
      "bilissel-mesafe",
      "bilişsel-ayrışma"
    ],
    "standardTask": "Zorlayan düşüncenin başına şu ifadeyi ekle: 'Zihnim şu anda bana ... diyor.'",
    "minimumTask": "Zorlayan düşünceni 'Zihnim şu anda bana ... diyor' kalıbıyla bir cümleye çevir.",
    "successMeaning": "Düşünceyle arana mesafe koydun; onu gerçek değil veri olarak ele aldın.",
    "reflectionExamples": [
      "Zihnim 'daha iyi hissetmem lazım' diyordu; başına 'zihnim şu anda bana ... diyor' ekleyince gerçekliği azaldı.",
      "Bu düşünceye %70 inanıyordum ama kanıt listelediğimde geçicilik kanıtının eksik olduğunu gördüm.",
      "Düşünceyi bir cümle olarak yazıp okudum; aynı cümle tekrarlanınca bir 'veri parçası' gibi durdu."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Zorlayan düşüncenin başına şu ifadeyi ekle: 'Zihnim şu anda bana ... diyor.'"
  },
  {
    "day": 28,
    "phaseCode": "F1",
    "phaseTitle": "Faz 1 — Fark Etme",
    "phaseGoal": "Dürtü, düşünce, duygu ve davranışı ayırmak; otomatik geri çekilmeyi görünür kılmak.",
    "domain": "davranissal-aktivasyon",
    "domainLabel": "Davranışsal aktivasyon",
    "quoteKind": "original_science_based",
    "quote": "Motivasyon gelmeden de iki dakikalık eylem yapılabilir.",
    "source": null,
    "psychologicalLens": "davranışsal aktivasyon",
    "explanation": "Duygu ve düşünceyi ayırmak, tepki vermeden önce seçim alanı açar.",
    "reflectionQuestion": "En küçük uygulanabilir adım neydi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f1",
      "davranissal-aktivasyon",
      "davranışsal-aktivasyon"
    ],
    "standardTask": "İki dakikada başlayabileceğin bir davranış seç ve yalnızca iki dakika uygula.",
    "minimumTask": "Görevin yalnızca ilk 60 saniyesini yap.",
    "successMeaning": "Motivasyonu beklemeden davranış başlattın.",
    "reflectionExamples": [
      "Hazır değildim ama temizlik için sadece iki dakika başladım; sonrasında en azından başlamış oldum.",
      "Motivasyonu beklemeden 3 dk yürüdüm yaptım; başlangıç, hissettiğimden çok daha küçük bir şeymiş.",
      "Bugünün minimumu 1 dk başlangıç idi; yaptığımda kendime 'bu da sayılır' demeyi öğrendim."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "İki dakikada başlayabileceğin bir davranış seç ve yalnızca iki dakika uygula."
  },
  {
    "day": 29,
    "phaseCode": "F1",
    "phaseTitle": "Faz 1 — Fark Etme",
    "phaseGoal": "Dürtü, düşünce, duygu ve davranışı ayırmak; otomatik geri çekilmeyi görünür kılmak.",
    "domain": "oz-sefkat",
    "domainLabel": "Öz-şefkat",
    "quoteKind": "original_science_based",
    "quote": "Öz-şefkat, kendine bahane üretmek değil; yeniden denemeyi mümkün kılmaktır.",
    "source": null,
    "psychologicalLens": "öz-şefkatli iç konuşma",
    "explanation": "Yakınlık ve sınır birlikte çalıştığında ilişki daha az tehditkâr hale gelir.",
    "reflectionQuestion": "Kendime daha adil davransaydım aynı durumda ne derdim?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f1",
      "oz-sefkat",
      "öz-şefkatli-iç-konuşma"
    ],
    "standardTask": "Sert bir iç cümleni daha adil ve uygulanabilir bir cümleye çevir.",
    "minimumTask": "Kendine söylediğin sert cümleyi fark et ve yanına daha adil bir kelime ekle.",
    "successMeaning": "Öz-eleştiriye karşı daha sürdürülebilir bir iç dil denedin.",
    "reflectionExamples": [
      "Kendime 'neden bu kadar yavaşsın' dediğimi fark ettim; yerine 'bugün zordu, yeterince çabaladım' desem daha adil ve sürdürülebilir olurdu.",
      "Aynı durumda arkadaşıma nasıl konuşurdum? Ona her gün aynı değil, kendime ise neden bu kadar yavaşsın demiştim; bugün dengeledim.",
      "Başarısızlık değil, kapasite sınırı; 'bugün bu kadar yeter' demek, daha uzun soluklu çalışmamı sağlıyor."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Sert bir iç cümleni daha adil ve uygulanabilir bir cümleye çevir."
  },
  {
    "day": 30,
    "phaseCode": "F1",
    "phaseTitle": "Faz 1 — Fark Etme",
    "phaseGoal": "Dürtü, düşünce, duygu ve davranışı ayırmak; otomatik geri çekilmeyi görünür kılmak.",
    "domain": "belirsizlik",
    "domainLabel": "Belirsizlik toleransı",
    "quoteKind": "original_science_based",
    "quote": "Kaygı kesin cevap ister; gelişim çoğu zaman yeterince iyi cevaplarla ilerler.",
    "source": null,
    "psychologicalLens": "belirsizlikle kalma",
    "explanation": "Kapasiteye göre ayarlanmış hedef, sürdürülebilirlik ve öz-yeterlik için daha uygundur.",
    "reflectionQuestion": "Bu belirsizlikle kalınca korktuğum şey gerçekten oldu mu?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f1",
      "belirsizlik",
      "belirsizlikle-kalma"
    ],
    "standardTask": "Düşük riskli bir belirsizliği 20 dakika kontrol etmeden bırak.",
    "minimumTask": "Bir kontrol davranışını yalnızca 5 dakika ertele.",
    "successMeaning": "Kontrol dürtüsünü erteledin; kaygıya yeni öğrenme alanı açtın.",
    "reflectionExamples": [
      "sağlık belirtisi belirsizliğiyle 20 dk kalınca korktuğum kaybetme gerçekleşmedi; kaygı gerçeklik değilmiş.",
      "Kontrol dürtüsünü bir saat erteledim; sonrasında aslında güvenli olduğumu gördüm ve fark ettim ki dürtü geçici.",
      "Kesinlik aramak yerine 'şu an yeterli bilgi var mı?' diye sordum; cevap evetti, ek kontrole gerek kalmadı."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Düşük riskli bir belirsizliği 20 dakika kontrol etmeden bırak."
  },
  {
    "day": 31,
    "phaseCode": "F2",
    "phaseTitle": "Faz 2 — Düzenleme",
    "phaseGoal": "Kaygı, ruminasyon, enerji ve öz-eleştiriyle daha işlevli çalışmak.",
    "domain": "destek",
    "domainLabel": "Destek isteme",
    "quoteKind": "original_science_based",
    "quote": "İnsanlara ihtiyaç duymak zayıflık değil, insan türünün tasarım özelliklerinden biridir.",
    "source": null,
    "psychologicalLens": "sosyal destek aktivasyonu",
    "explanation": "Bu günün amacı otomatik savunmayı suçlamak değil, onu fark edip daha esnek bir seçenek üretmektir.",
    "reflectionQuestion": "Destek istemek nasıl hissettirdi: riskli, rahatlatıcı, garip, nötr?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f2",
      "destek",
      "sosyal-destek-aktivasyonu"
    ],
    "standardTask": "Güvendiğin bir kişiden küçük ve somut bir destek iste.",
    "minimumTask": "Destek isteyebileceğin kişinin adını ve isteyeceğin şeyi taslak olarak yaz.",
    "successMeaning": "Destek isteme davranışının ilk basamağını görünür yaptın.",
    "reflectionExamples": [
      "karar verme konusunda bir kişiden yardım istedim; istemek utanç değil, çözüm üretmekmiş.",
      "Destek ararken 'şunu birlikte yapalım' dedim; karşı tarafın sadece dinlemesi bile yükümü hafifletti.",
      "Yalnız başa çıkmak zorunda değilim; bugün fikir talep ettim, bu yakınlığı güvenli kıldı."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Güvendiğin bir kişiden küçük ve somut bir destek iste."
  },
  {
    "day": 32,
    "phaseCode": "F2",
    "phaseTitle": "Faz 2 — Düzenleme",
    "phaseGoal": "Kaygı, ruminasyon, enerji ve öz-eleştiriyle daha işlevli çalışmak.",
    "domain": "sinir",
    "domainLabel": "Sınır koyma",
    "quoteKind": "original_science_based",
    "quote": "Sınırın karşı tarafı cezalandırmak için değil, kendini düzenlemek için varsa daha temizdir.",
    "source": null,
    "psychologicalLens": "sınır netliği",
    "explanation": "Küçük davranış, zihne soyut motivasyondan daha güvenilir kanıt verir.",
    "reflectionQuestion": "Sınırımı söyleyince temas daha mı netleşti?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f2",
      "sinir",
      "sınır-netliği"
    ],
    "standardTask": "Bir sınır cümlesi kur: 'Şu an ... yapacağım; ... zamanda döneceğim.'",
    "minimumTask": "Koymak istediğin sınırı göndermeden önce tek cümleyle taslaklaştır.",
    "successMeaning": "Sınırı kopmadan ve cezalandırmadan ifade etmeye yaklaştın.",
    "reflectionExamples": [
      "dijital erişim durumunda 'bugün bunu yapamam' dedim; sert değil, net bir çerçeve kurmak rahatlattı.",
      "Hayır demek önce panik, sonra rahatlama getirdi; karşı tarafta kısa bir sessizlik oldu, ben sınırımda kaldım.",
      "Sınırımı açıkça söyleyince suçluluk hissettim ama uzun vadede daha az çatışma fark ettim."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bir sınır cümlesi kur: 'Şu an ... yapacağım; ... zamanda döneceğim.'"
  },
  {
    "day": 33,
    "phaseCode": "F2",
    "phaseTitle": "Faz 2 — Düzenleme",
    "phaseGoal": "Kaygı, ruminasyon, enerji ve öz-eleştiriyle daha işlevli çalışmak.",
    "domain": "onarim",
    "domainLabel": "İlişki onarımı",
    "quoteKind": "original_science_based",
    "quote": "Geç söylenen kırgınlık büyür; erken söylenen kırgınlık çalışılabilir kalır.",
    "source": null,
    "psychologicalLens": "ilişki onarımı",
    "explanation": "Duygu ve düşünceyi ayırmak, tepki vermeden önce seçim alanı açar.",
    "reflectionQuestion": "Onarım denemem ilişkiye hangi yeni bilgiyi ekledi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f2",
      "onarim",
      "ilişki-onarımı"
    ],
    "standardTask": "Uzaklaştığın bir kişiye açıklama taslağı yaz: 'Geri çekildim çünkü ...'",
    "minimumTask": "Onarım cümlesini göndermeden yalnızca notlara yaz.",
    "successMeaning": "Uzaklaşma yerine onarım seçeneğini zihinde erişilebilir yaptın.",
    "reflectionExamples": [
      "eşimle yaşanan unutulan bir söz sonrası 'senin için ne yapabilirim' dedim; onarım büyük jest değil, küçük ve samimi adım.",
      "Özür yerine açıklama ve 'daha dikkatli olacağım' sundum; ilişkideki gerilim açık konuşunca azaldı.",
      "Onarım denemem daha net konuşmama yardım etti; denemek, mükemmel olmaktan daha değerli."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Uzaklaştığın bir kişiye açıklama taslağı yaz: 'Geri çekildim çünkü ...'"
  },
  {
    "day": 34,
    "phaseCode": "F2",
    "phaseTitle": "Faz 2 — Düzenleme",
    "phaseGoal": "Kaygı, ruminasyon, enerji ve öz-eleştiriyle daha işlevli çalışmak.",
    "domain": "yakinlik",
    "domainLabel": "Yakınlık toleransı",
    "quoteKind": "original_science_based",
    "quote": "Yakınlık toleransı, küçük tekrarlarla gelişen bir kas gibidir.",
    "source": null,
    "psychologicalLens": "kademeli yakınlık",
    "explanation": "Yakınlık ve sınır birlikte çalıştığında ilişki daha az tehditkâr hale gelir.",
    "reflectionQuestion": "Yakınlık dozu bana fazla mı geldi, yoksa yönetilebilir miydi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f2",
      "yakinlik",
      "kademeli-yakınlık"
    ],
    "standardTask": "Normalde saklayacağın küçük bir doğruyu güvenli bir kişiye söyle.",
    "minimumTask": "Güvenli bir kişiye söyleyebileceğin yüzde beşlik açıklık cümlesini yaz.",
    "successMeaning": "Tam kapanma yerine güvenli dozda temas ihtimalini artırdın.",
    "reflectionExamples": [
      "Yakınlık anında çekilme isteği geldi; bu sefer birkaç nefes kadar kaldım ve panik hafifledi.",
      "yakın arkadaşım ile göz teması anında 'buradayım' demek, uzaklaşmaktan daha güvenli hissettirdi.",
      "Yakınlığa maruz kalınca bedenim nefes hızlandı yaptı; nefes alıp kalmak, duygu geçene kadar yeterliymiş."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Normalde saklayacağın küçük bir doğruyu güvenli bir kişiye söyle."
  },
  {
    "day": 35,
    "phaseCode": "F2",
    "phaseTitle": "Faz 2 — Düzenleme",
    "phaseGoal": "Kaygı, ruminasyon, enerji ve öz-eleştiriyle daha işlevli çalışmak.",
    "domain": "enerji",
    "domainLabel": "Enerji yönetimi",
    "quoteKind": "original_science_based",
    "quote": "Bugün kapasiten düşükse hedefi küçült; yönü iptal etme.",
    "source": null,
    "psychologicalLens": "kapasiteye göre hedefleme",
    "explanation": "Kapasiteye göre ayarlanmış hedef, sürdürülebilirlik ve öz-yeterlik için daha uygundur.",
    "reflectionQuestion": "Hedefi küçültmek ilerlemeyi artırdı mı azalttı mı?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f2",
      "enerji",
      "kapasiteye-göre-hedefleme"
    ],
    "standardTask": "Enerjini 0–10 puanla; bugünkü hedefini bu puana göre küçült.",
    "minimumTask": "Enerjini 0–10 arasında puanla ve hedefi bir kademe küçült.",
    "successMeaning": "Kapasiteye göre hedef ayarladın; sürdürülebilirliği korudun.",
    "reflectionExamples": [
      "Bugün enerjim dalgalı idi; su ve ışık yapınca odak döndü ve daha sürdürülebilir çalıştım.",
      "İrade değil ritim; 10 dk mola verince odaklanmam geri geldi, kendimi suçlamadım.",
      "Yüksek enerjili saatlerimi zor problem için, düşüklerini dinlenme için kullandım; verim değil, denge önemli."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Enerjini 0–10 puanla; bugünkü hedefini bu puana göre küçült."
  },
  {
    "day": 36,
    "phaseCode": "F2",
    "phaseTitle": "Faz 2 — Düzenleme",
    "phaseGoal": "Kaygı, ruminasyon, enerji ve öz-eleştiriyle daha işlevli çalışmak.",
    "domain": "deger",
    "domainLabel": "Değer odaklılık",
    "quoteKind": "original_science_based",
    "quote": "Değer odaklı hareket, iyi hissetmeyi beklemeden anlamlı olanı seçmektir.",
    "source": null,
    "psychologicalLens": "değer temelli davranış",
    "explanation": "Bu günün amacı otomatik savunmayı suçlamak değil, onu fark edip daha esnek bir seçenek üretmektir.",
    "reflectionQuestion": "Bugünkü davranışım uzun vadede hangi kişiye dönüşmeme yardım ediyor?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f2",
      "deger",
      "değer-temelli-davranış"
    ],
    "standardTask": "Bugün yaptığın tek davranışın hangi değere hizmet ettiğini yaz.",
    "minimumTask": "Bugün korumak istediğin değeri tek kelimeyle yaz.",
    "successMeaning": "Duygu durumdan bağımsız olarak yönünü değerle bağladın.",
    "reflectionExamples": [
      "Bugün üretkenlik değerime hizmet eden küçük eylem: bir adım attım; uzun hedef değil, bugünkü seçim önemli.",
      "beklenti baskısı anında değerim adil olmak olduğunu hatırladım; bu, seçimi kolaylaştırdı.",
      "Davranışım (sınır koydum) ile sabır arasındaki bağ kurunca motivasyonum içsel."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bugün yaptığın tek davranışın hangi değere hizmet ettiğini yaz."
  },
  {
    "day": 37,
    "phaseCode": "F2",
    "phaseTitle": "Faz 2 — Düzenleme",
    "phaseGoal": "Kaygı, ruminasyon, enerji ve öz-eleştiriyle daha işlevli çalışmak.",
    "domain": "farkindalik",
    "domainLabel": "Farkındalık",
    "quoteKind": "original_science_based",
    "quote": "Kaçınma bazen korur; ama sürekli kullanılırsa hayat alanını daraltır.",
    "source": null,
    "psychologicalLens": "otomatik tepkiyi yavaşlatma",
    "explanation": "Küçük davranış, zihne soyut motivasyondan daha güvenilir kanıt verir.",
    "reflectionQuestion": "Bu tepki beni gerçekten korudu mu, yoksa yalnızca teması mı erteledi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f2",
      "farkindalik",
      "otomatik-tepkiyi-yavaşlatma"
    ],
    "standardTask": "Bugün geri çekilmek istediğin bir anda 90 saniye dur ve dürtünün adını yaz.",
    "minimumTask": "Geri çekilme veya otomatik tepkiyle ilgili yalnızca bir kelime yaz.",
    "successMeaning": "Otomatik tepkiyi fark ettin; bu, değişim için ilk davranış verisidir.",
    "reflectionExamples": [
      "Bugün geri çekilme isteği geldiğinde 90 sn durdum; vücudumda gerilme fark ettim, hemen tepki vermek zorunda değilmişim.",
      "Dürtü anında altımda yalnızlık olduğunu gördüm; sadece 'kaygı' diye adlandırmak yoğunluğu biraz azalttı.",
      "Cevap vermeden önce 'şu anda zihnim ne diyor?' diye sordum; bu duruş, dürtüyü veri olarak görmek için yeterliydi."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bugün geri çekilmek istediğin bir anda 90 saniye dur ve dürtünün adını yaz."
  },
  {
    "day": 38,
    "phaseCode": "F2",
    "phaseTitle": "Faz 2 — Düzenleme",
    "phaseGoal": "Kaygı, ruminasyon, enerji ve öz-eleştiriyle daha işlevli çalışmak.",
    "domain": "duygu-adlandirma",
    "domainLabel": "Duygu adlandırma",
    "quoteKind": "original_science_based",
    "quote": "Bedendeki sıkışma, zihnin henüz cümleye çeviremediği bir bilgi olabilir.",
    "source": null,
    "psychologicalLens": "duygu ayrıştırma",
    "explanation": "Duygu ve düşünceyi ayırmak, tepki vermeden önce seçim alanı açar.",
    "reflectionQuestion": "Şu an hissettiğim şeyin en doğru adı ne?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f2",
      "duygu-adlandirma",
      "duygu-ayrıştırma"
    ],
    "standardTask": "Bugünün baskın duygusunu üç düzeyde yaz: görünen duygu, alttaki duygu, bedendeki his.",
    "minimumTask": "Bugünkü baskın duygunu tek kelimeyle adlandır.",
    "successMeaning": "Duyguyu adlandırdın; belirsiz iç basıncı daha yönetilebilir hâle getirdin.",
    "reflectionExamples": [
      "Bugün görünürde sinir hissediyordum ama altında üzüntü vardı; göğsümde nefes daralması fark ettim.",
      "Duyguyu sadece 'kötü' değil, 'kaygı' diye adlandırınca daha yönetilebilir geldi; zihnim 'hâlâ güvensiz' dedi.",
      "Üç katman yazdım: dışta bunalım, ortada yalnızlık, bedende nefes daralması; bu ayrıştırma panik hissini durdurdu."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bugünün baskın duygusunu üç düzeyde yaz: görünen duygu, alttaki duygu, bedendeki his."
  },
  {
    "day": 39,
    "phaseCode": "F2",
    "phaseTitle": "Faz 2 — Düzenleme",
    "phaseGoal": "Kaygı, ruminasyon, enerji ve öz-eleştiriyle daha işlevli çalışmak.",
    "domain": "bilissel-mesafe",
    "domainLabel": "Bilişsel mesafe",
    "quoteKind": "original_science_based",
    "quote": "Bir düşünceyi 'gerçek' diye değil, 'zihnimden geçen veri' diye ele almak özgürlük sağlar.",
    "source": null,
    "psychologicalLens": "bilişsel ayrışma",
    "explanation": "Yakınlık ve sınır birlikte çalıştığında ilişki daha az tehditkâr hale gelir.",
    "reflectionQuestion": "Bu düşünceye yüzde kaç inanıyorum ve hangi kanıt eksik?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f2",
      "bilissel-mesafe",
      "bilişsel-ayrışma"
    ],
    "standardTask": "Zorlayan düşüncenin başına şu ifadeyi ekle: 'Zihnim şu anda bana ... diyor.'",
    "minimumTask": "Zorlayan düşünceni 'Zihnim şu anda bana ... diyor' kalıbıyla bir cümleye çevir.",
    "successMeaning": "Düşünceyle arana mesafe koydun; onu gerçek değil veri olarak ele aldın.",
    "reflectionExamples": [
      "Zihnim 'kontrol etmeliyim' diyordu; başına 'zihnim şu anda bana ... diyor' ekleyince gerçekliği azaldı.",
      "Bu düşünceye %70 inanıyordum ama kanıt listelediğimde geçicilik kanıtının eksik olduğunu gördüm.",
      "Düşünceyi bir cümle olarak yazıp okudum; aynı cümle tekrarlanınca bir 'veri parçası' gibi durdu."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Zorlayan düşüncenin başına şu ifadeyi ekle: 'Zihnim şu anda bana ... diyor.'"
  },
  {
    "day": 40,
    "phaseCode": "F2",
    "phaseTitle": "Faz 2 — Düzenleme",
    "phaseGoal": "Kaygı, ruminasyon, enerji ve öz-eleştiriyle daha işlevli çalışmak.",
    "domain": "davranissal-aktivasyon",
    "domainLabel": "Davranışsal aktivasyon",
    "quoteKind": "original_science_based",
    "quote": "Beş dakika dürüst eylem, bir saatlik kendini suçlamadan daha üretkendir.",
    "source": null,
    "psychologicalLens": "davranışsal aktivasyon",
    "explanation": "Kapasiteye göre ayarlanmış hedef, sürdürülebilirlik ve öz-yeterlik için daha uygundur.",
    "reflectionQuestion": "En küçük uygulanabilir adım neydi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f2",
      "davranissal-aktivasyon",
      "davranışsal-aktivasyon"
    ],
    "standardTask": "İki dakikada başlayabileceğin bir davranış seç ve yalnızca iki dakika uygula.",
    "minimumTask": "Görevin yalnızca ilk 60 saniyesini yap.",
    "successMeaning": "Motivasyonu beklemeden davranış başlattın.",
    "reflectionExamples": [
      "Hazır değildim ama okuma için sadece iki dakika başladım; sonrasında en azından başlamış oldum.",
      "Motivasyonu beklemeden 3 dk yürüdüm yaptım; başlangıç, hissettiğimden çok daha küçük bir şeymiş.",
      "Bugünün minimumu 1 dk başlangıç idi; yaptığımda kendime 'bu da sayılır' demeyi öğrendim."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "İki dakikada başlayabileceğin bir davranış seç ve yalnızca iki dakika uygula."
  },
  {
    "day": 41,
    "phaseCode": "F2",
    "phaseTitle": "Faz 2 — Düzenleme",
    "phaseGoal": "Kaygı, ruminasyon, enerji ve öz-eleştiriyle daha işlevli çalışmak.",
    "domain": "oz-sefkat",
    "domainLabel": "Öz-şefkat",
    "quoteKind": "original_science_based",
    "quote": "Kendine nazik davranmak standardı düşürmez; sinir sistemini öğrenmeye açık tutar.",
    "source": null,
    "psychologicalLens": "öz-şefkatli iç konuşma",
    "explanation": "Bu günün amacı otomatik savunmayı suçlamak değil, onu fark edip daha esnek bir seçenek üretmektir.",
    "reflectionQuestion": "Kendime daha adil davransaydım aynı durumda ne derdim?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f2",
      "oz-sefkat",
      "öz-şefkatli-iç-konuşma"
    ],
    "standardTask": "Sert bir iç cümleni daha adil ve uygulanabilir bir cümleye çevir.",
    "minimumTask": "Kendine söylediğin sert cümleyi fark et ve yanına daha adil bir kelime ekle.",
    "successMeaning": "Öz-eleştiriye karşı daha sürdürülebilir bir iç dil denedin.",
    "reflectionExamples": [
      "Kendime 'neden bu kadar yavaşsın' dediğimi fark ettim; yerine 'küçük adım da adımdır' desem daha adil ve sürdürülebilir olurdu.",
      "Aynı durumda arkadaşıma nasıl konuşurdum? Ona sabırlı ol, kendime ise neden bu kadar yavaşsın demiştim; bugün dengeledim.",
      "Başarısızlık değil, kapasite sınırı; 'bugün bu kadar yeter' demek, daha uzun soluklu çalışmamı sağlıyor."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Sert bir iç cümleni daha adil ve uygulanabilir bir cümleye çevir."
  },
  {
    "day": 42,
    "phaseCode": "F2",
    "phaseTitle": "Faz 2 — Düzenleme",
    "phaseGoal": "Kaygı, ruminasyon, enerji ve öz-eleştiriyle daha işlevli çalışmak.",
    "domain": "belirsizlik",
    "domainLabel": "Belirsizlik toleransı",
    "quoteKind": "original_science_based",
    "quote": "Belirsizliği tamamen yok edemiyorsan, onunla kalma süreni küçük küçük artır.",
    "source": null,
    "psychologicalLens": "belirsizlikle kalma",
    "explanation": "Küçük davranış, zihne soyut motivasyondan daha güvenilir kanıt verir.",
    "reflectionQuestion": "Bu belirsizlikle kalınca korktuğum şey gerçekten oldu mu?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f2",
      "belirsizlik",
      "belirsizlikle-kalma"
    ],
    "standardTask": "Düşük riskli bir belirsizliği 20 dakika kontrol etmeden bırak.",
    "minimumTask": "Bir kontrol davranışını yalnızca 5 dakika ertele.",
    "successMeaning": "Kontrol dürtüsünü erteledin; kaygıya yeni öğrenme alanı açtın.",
    "reflectionExamples": [
      "bir mesajın cevabı belirsizliğiyle 20 dk kalınca korktuğum kaybetme gerçekleşmedi; kaygı gerçeklik değilmiş.",
      "Kontrol dürtüsünü 15 dk erteledim; sonrasında kaygı kendi kendine düştü ve fark ettim ki dürtü geçici.",
      "Kesinlik aramak yerine 'şu an yeterli bilgi var mı?' diye sordum; cevap evetti, ek kontrole gerek kalmadı."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Düşük riskli bir belirsizliği 20 dakika kontrol etmeden bırak."
  },
  {
    "day": 43,
    "phaseCode": "F2",
    "phaseTitle": "Faz 2 — Düzenleme",
    "phaseGoal": "Kaygı, ruminasyon, enerji ve öz-eleştiriyle daha işlevli çalışmak.",
    "domain": "destek",
    "domainLabel": "Destek isteme",
    "quoteKind": "original_science_based",
    "quote": "Destek istemeyi dramatik hale getirmek zorunda değilsin; küçük ve somut iste.",
    "source": null,
    "psychologicalLens": "sosyal destek aktivasyonu",
    "explanation": "Duygu ve düşünceyi ayırmak, tepki vermeden önce seçim alanı açar.",
    "reflectionQuestion": "Destek istemek nasıl hissettirdi: riskli, rahatlatıcı, garip, nötr?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f2",
      "destek",
      "sosyal-destek-aktivasyonu"
    ],
    "standardTask": "Güvendiğin bir kişiden küçük ve somut bir destek iste.",
    "minimumTask": "Destek isteyebileceğin kişinin adını ve isteyeceğin şeyi taslak olarak yaz.",
    "successMeaning": "Destek isteme davranışının ilk basamağını görünür yaptın.",
    "reflectionExamples": [
      "pratik iş konusunda bir kişiden yardım istedim; istemek utanç değil, çözüm üretmekmiş.",
      "Destek ararken 'bu konuda fikrini alabilir miyim' dedim; karşı tarafın sadece dinlemesi bile yükümü hafifletti.",
      "Yalnız başa çıkmak zorunda değilim; bugün yalnızca dinleme talep ettim, bu yakınlığı güvenli kıldı."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Güvendiğin bir kişiden küçük ve somut bir destek iste."
  },
  {
    "day": 44,
    "phaseCode": "F2",
    "phaseTitle": "Faz 2 — Düzenleme",
    "phaseGoal": "Kaygı, ruminasyon, enerji ve öz-eleştiriyle daha işlevli çalışmak.",
    "domain": "sinir",
    "domainLabel": "Sınır koyma",
    "quoteKind": "original_science_based",
    "quote": "Net sınır, belirsiz mesafeden daha az yaralar.",
    "source": null,
    "psychologicalLens": "sınır netliği",
    "explanation": "Yakınlık ve sınır birlikte çalıştığında ilişki daha az tehditkâr hale gelir.",
    "reflectionQuestion": "Sınırımı söyleyince temas daha mı netleşti?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f2",
      "sinir",
      "sınır-netliği"
    ],
    "standardTask": "Bir sınır cümlesi kur: 'Şu an ... yapacağım; ... zamanda döneceğim.'",
    "minimumTask": "Koymak istediğin sınırı göndermeden önce tek cümleyle taslaklaştır.",
    "successMeaning": "Sınırı kopmadan ve cezalandırmadan ifade etmeye yaklaştın.",
    "reflectionExamples": [
      "aile içi talep durumunda 'bugün bunu yapamam' dedim; sert değil, net bir çerçeve kurmak rahatlattı.",
      "Hayır demek önce panik, sonra rahatlama getirdi; karşı tarafta kısa bir sessizlik oldu, ben sınırımda kaldım.",
      "Sınırımı açıkça söyleyince suçluluk hissettim ama uzun vadede daha az yorgun fark ettim."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bir sınır cümlesi kur: 'Şu an ... yapacağım; ... zamanda döneceğim.'"
  },
  {
    "day": 45,
    "phaseCode": "F2",
    "phaseTitle": "Faz 2 — Düzenleme",
    "phaseGoal": "Kaygı, ruminasyon, enerji ve öz-eleştiriyle daha işlevli çalışmak.",
    "domain": "onarim",
    "domainLabel": "İlişki onarımı",
    "quoteKind": "original_science_based",
    "quote": "Uzaklaşmadan önce açıklama yapmak, ilişkiye harita bırakmaktır.",
    "source": null,
    "psychologicalLens": "ilişki onarımı",
    "explanation": "Kapasiteye göre ayarlanmış hedef, sürdürülebilirlik ve öz-yeterlik için daha uygundur.",
    "reflectionQuestion": "Onarım denemem ilişkiye hangi yeni bilgiyi ekledi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f2",
      "onarim",
      "ilişki-onarımı"
    ],
    "standardTask": "Uzaklaştığın bir kişiye açıklama taslağı yaz: 'Geri çekildim çünkü ...'",
    "minimumTask": "Onarım cümlesini göndermeden yalnızca notlara yaz.",
    "successMeaning": "Uzaklaşma yerine onarım seçeneğini zihinde erişilebilir yaptın.",
    "reflectionExamples": [
      "eşimle yaşanan unutulan bir söz sonrası 'tekrar dinlemek isterim' dedim; onarım büyük jest değil, küçük ve samimi adım.",
      "Özür yerine açıklama ve 'seni dinlemek için zaman ayırayım' sundum; ilişkideki gerilim açık konuşunca azaldı.",
      "Onarım denemem yumuşama oldu ile sonuçlandı; denemek, mükemmel olmaktan daha değerli."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Uzaklaştığın bir kişiye açıklama taslağı yaz: 'Geri çekildim çünkü ...'"
  },
  {
    "day": 46,
    "phaseCode": "F2",
    "phaseTitle": "Faz 2 — Düzenleme",
    "phaseGoal": "Kaygı, ruminasyon, enerji ve öz-eleştiriyle daha işlevli çalışmak.",
    "domain": "yakinlik",
    "domainLabel": "Yakınlık toleransı",
    "quoteKind": "original_science_based",
    "quote": "Yakınlık, her şeyi anlatmak değil; saklanmadan küçük bir doğruyu paylaşmaktır.",
    "source": null,
    "psychologicalLens": "kademeli yakınlık",
    "explanation": "Bu günün amacı otomatik savunmayı suçlamak değil, onu fark edip daha esnek bir seçenek üretmektir.",
    "reflectionQuestion": "Yakınlık dozu bana fazla mı geldi, yoksa yönetilebilir miydi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f2",
      "yakinlik",
      "kademeli-yakınlık"
    ],
    "standardTask": "Normalde saklayacağın küçük bir doğruyu güvenli bir kişiye söyle.",
    "minimumTask": "Güvenli bir kişiye söyleyebileceğin yüzde beşlik açıklık cümlesini yaz.",
    "successMeaning": "Tam kapanma yerine güvenli dozda temas ihtimalini artırdın.",
    "reflectionExamples": [
      "Yakınlık anında çekilme isteği geldi; bu sefer 1 dk kadar kaldım ve panik aynı kaldı ama katlanabilirdi.",
      "yakın arkadaşım ile göz teması anında 'buradayım' demek, uzaklaşmaktan daha güvenli hissettirdi.",
      "Yakınlığa maruz kalınca bedenim nefes hızlandı yaptı; nefes alıp kalmak, duygu geçene kadar yeterliymiş."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Normalde saklayacağın küçük bir doğruyu güvenli bir kişiye söyle."
  },
  {
    "day": 47,
    "phaseCode": "F2",
    "phaseTitle": "Faz 2 — Düzenleme",
    "phaseGoal": "Kaygı, ruminasyon, enerji ve öz-eleştiriyle daha işlevli çalışmak.",
    "domain": "enerji",
    "domainLabel": "Enerji yönetimi",
    "quoteKind": "original_science_based",
    "quote": "Bugün bedeninin verdiği enerji raporunu ciddiye al.",
    "source": null,
    "psychologicalLens": "kapasiteye göre hedefleme",
    "explanation": "Küçük davranış, zihne soyut motivasyondan daha güvenilir kanıt verir.",
    "reflectionQuestion": "Hedefi küçültmek ilerlemeyi artırdı mı azalttı mı?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f2",
      "enerji",
      "kapasiteye-göre-hedefleme"
    ],
    "standardTask": "Enerjini 0–10 puanla; bugünkü hedefini bu puana göre küçült.",
    "minimumTask": "Enerjini 0–10 arasında puanla ve hedefi bir kademe küçült.",
    "successMeaning": "Kapasiteye göre hedef ayarladın; sürdürülebilirliği korudun.",
    "reflectionExamples": [
      "Bugün enerjim dalgalı idi; kısa bir mola yapınca biraz toparladım ve daha sürdürülebilir çalıştım.",
      "İrade değil ritim; 20 dk mola verince odaklanmam geri geldi, kendimi suçlamadım.",
      "Yüksek enerjili saatlerimi yaratıcı iş için, düşüklerini admin için kullandım; verim değil, denge önemli."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Enerjini 0–10 puanla; bugünkü hedefini bu puana göre küçült."
  },
  {
    "day": 48,
    "phaseCode": "F2",
    "phaseTitle": "Faz 2 — Düzenleme",
    "phaseGoal": "Kaygı, ruminasyon, enerji ve öz-eleştiriyle daha işlevli çalışmak.",
    "domain": "deger",
    "domainLabel": "Değer odaklılık",
    "quoteKind": "original_science_based",
    "quote": "Yönünü değer belirlesin; hızını kapasite belirlesin.",
    "source": null,
    "psychologicalLens": "değer temelli davranış",
    "explanation": "Duygu ve düşünceyi ayırmak, tepki vermeden önce seçim alanı açar.",
    "reflectionQuestion": "Bugünkü davranışım uzun vadede hangi kişiye dönüşmeme yardım ediyor?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f2",
      "deger",
      "değer-temelli-davranış"
    ],
    "standardTask": "Bugün yaptığın tek davranışın hangi değere hizmet ettiğini yaz.",
    "minimumTask": "Bugün korumak istediğin değeri tek kelimeyle yaz.",
    "successMeaning": "Duygu durumdan bağımsız olarak yönünü değerle bağladın.",
    "reflectionExamples": [
      "Bugün sabır değerime hizmet eden eylem: kendimi dinledim; uzun hedef değil, bugünkü seçim önemli.",
      "rekabet anında değerim sabır olduğunu hatırladım; bu, seçimi kolaylaştırdı.",
      "Davranışım (küçük bir adım attım) ile üretkenlik arasındaki bağ kurunca motivasyonum içsel."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bugün yaptığın tek davranışın hangi değere hizmet ettiğini yaz."
  },
  {
    "day": 49,
    "phaseCode": "F2",
    "phaseTitle": "Faz 2 — Düzenleme",
    "phaseGoal": "Kaygı, ruminasyon, enerji ve öz-eleştiriyle daha işlevli çalışmak.",
    "domain": "farkindalik",
    "domainLabel": "Farkındalık",
    "quoteKind": "original_science_based",
    "quote": "Kendini gözlemlemek, kendini yargılamakla aynı şey değildir.",
    "source": null,
    "psychologicalLens": "otomatik tepkiyi yavaşlatma",
    "explanation": "Yakınlık ve sınır birlikte çalıştığında ilişki daha az tehditkâr hale gelir.",
    "reflectionQuestion": "Bu tepki beni gerçekten korudu mu, yoksa yalnızca teması mı erteledi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f2",
      "farkindalik",
      "otomatik-tepkiyi-yavaşlatma"
    ],
    "standardTask": "Bugün geri çekilmek istediğin bir anda 90 saniye dur ve dürtünün adını yaz.",
    "minimumTask": "Geri çekilme veya otomatik tepkiyle ilgili yalnızca bir kelime yaz.",
    "successMeaning": "Otomatik tepkiyi fark ettin; bu, değişim için ilk davranış verisidir.",
    "reflectionExamples": [
      "Bugün düşünce döngüsü anında birkaç saniye durup fark ettim; vücudumda hızlanma hissettim, hemen tepki vermek zorunda değilmişim.",
      "Dürtü geldiğinde fark ettim ki aslında alt duygu hissediyordum; sadece durup adlandırmak yoğunluğu azalttı.",
      "cevap verme yapmadan önce kendime 'şu anda ne oluyor?' diye sordum; bu küçük duruş, otomatikliği yavaşlatmak için bir veri."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bugün geri çekilmek istediğin bir anda 90 saniye dur ve dürtünün adını yaz."
  },
  {
    "day": 50,
    "phaseCode": "F2",
    "phaseTitle": "Faz 2 — Düzenleme",
    "phaseGoal": "Kaygı, ruminasyon, enerji ve öz-eleştiriyle daha işlevli çalışmak.",
    "domain": "duygu-adlandirma",
    "domainLabel": "Duygu adlandırma",
    "quoteKind": "original_science_based",
    "quote": "Kırgınlığın altında çoğu zaman karşılanmamış bir ihtiyaç vardır.",
    "source": null,
    "psychologicalLens": "duygu ayrıştırma",
    "explanation": "Kapasiteye göre ayarlanmış hedef, sürdürülebilirlik ve öz-yeterlik için daha uygundur.",
    "reflectionQuestion": "Şu an hissettiğim şeyin en doğru adı ne?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f2",
      "duygu-adlandirma",
      "duygu-ayrıştırma"
    ],
    "standardTask": "Bugünün baskın duygusunu üç düzeyde yaz: görünen duygu, alttaki duygu, bedendeki his.",
    "minimumTask": "Bugünkü baskın duygunu tek kelimeyle adlandır.",
    "successMeaning": "Duyguyu adlandırdın; belirsiz iç basıncı daha yönetilebilir hâle getirdin.",
    "reflectionExamples": [
      "Bugün görünürde bunalım hissediyordum ama altında yalnızlık vardı; göğsümde ağırlık fark ettim.",
      "Duyguyu sadece 'kötü' değil, 'hayal kırıklığı' diye adlandırınca daha yönetilebilir geldi; zihnim 'hâlâ güvensiz' dedi.",
      "Üç katman yazdım: dışta öfke, ortada yalnızlık, bedende nefes daralması; bu ayrıştırma panik hissini durdurdu."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bugünün baskın duygusunu üç düzeyde yaz: görünen duygu, alttaki duygu, bedendeki his."
  },
  {
    "day": 51,
    "phaseCode": "F2",
    "phaseTitle": "Faz 2 — Düzenleme",
    "phaseGoal": "Kaygı, ruminasyon, enerji ve öz-eleştiriyle daha işlevli çalışmak.",
    "domain": "bilissel-mesafe",
    "domainLabel": "Bilişsel mesafe",
    "quoteKind": "original_science_based",
    "quote": "Tekrarlayan düşünce, çözüm üretmiyorsa bilgi değil döngüdür.",
    "source": null,
    "psychologicalLens": "bilişsel ayrışma",
    "explanation": "Bu günün amacı otomatik savunmayı suçlamak değil, onu fark edip daha esnek bir seçenek üretmektir.",
    "reflectionQuestion": "Bu düşünceye yüzde kaç inanıyorum ve hangi kanıt eksik?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f2",
      "bilissel-mesafe",
      "bilişsel-ayrışma"
    ],
    "standardTask": "Zorlayan düşüncenin başına şu ifadeyi ekle: 'Zihnim şu anda bana ... diyor.'",
    "minimumTask": "Zorlayan düşünceni 'Zihnim şu anda bana ... diyor' kalıbıyla bir cümleye çevir.",
    "successMeaning": "Düşünceyle arana mesafe koydun; onu gerçek değil veri olarak ele aldın.",
    "reflectionExamples": [
      "Zihnim 'daha iyi hissetmem lazım' diyordu; başına 'zihnim şu anda bana ... diyor' ekleyince gerçekliği azaldı.",
      "Bu düşünceye %80 inanıyordum ama kanıt listelediğimde alternatif açıklamanın eksik olduğunu gördüm.",
      "Düşünceyi bir cümle olarak yazıp okudum; aynı cümle tekrarlanınca bir 'veri parçası' gibi durdu."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Zorlayan düşüncenin başına şu ifadeyi ekle: 'Zihnim şu anda bana ... diyor.'"
  },
  {
    "day": 52,
    "phaseCode": "F2",
    "phaseTitle": "Faz 2 — Düzenleme",
    "phaseGoal": "Kaygı, ruminasyon, enerji ve öz-eleştiriyle daha işlevli çalışmak.",
    "domain": "davranissal-aktivasyon",
    "domainLabel": "Davranışsal aktivasyon",
    "quoteKind": "original_science_based",
    "quote": "Eylemi küçültmek, hedefi terk etmek değildir.",
    "source": null,
    "psychologicalLens": "davranışsal aktivasyon",
    "explanation": "Küçük davranış, zihne soyut motivasyondan daha güvenilir kanıt verir.",
    "reflectionQuestion": "En küçük uygulanabilir adım neydi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f2",
      "davranissal-aktivasyon",
      "davranışsal-aktivasyon"
    ],
    "standardTask": "İki dakikada başlayabileceğin bir davranış seç ve yalnızca iki dakika uygula.",
    "minimumTask": "Görevin yalnızca ilk 60 saniyesini yap.",
    "successMeaning": "Motivasyonu beklemeden davranış başlattın.",
    "reflectionExamples": [
      "Hazır değildim ama mesaj yazma için sadece iki dakika başladım; sonrasında kayganlık hissettim.",
      "Motivasyonu beklemeden bir cümle yazdım; başlangıç, hissettiğimden çok daha küçük bir şeymiş.",
      "Bugünün minimumu 1 dk başlangıç idi; yaptığımda kendime 'bu da sayılır' demeyi öğrendim."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "İki dakikada başlayabileceğin bir davranış seç ve yalnızca iki dakika uygula."
  },
  {
    "day": 53,
    "phaseCode": "F2",
    "phaseTitle": "Faz 2 — Düzenleme",
    "phaseGoal": "Kaygı, ruminasyon, enerji ve öz-eleştiriyle daha işlevli çalışmak.",
    "domain": "oz-sefkat",
    "domainLabel": "Öz-şefkat",
    "quoteKind": "original_science_based",
    "quote": "Kendine karşı kullandığın dili, ilişki kurmak istediğin birine kullanır mıydın?",
    "source": null,
    "psychologicalLens": "öz-şefkatli iç konuşma",
    "explanation": "Duygu ve düşünceyi ayırmak, tepki vermeden önce seçim alanı açar.",
    "reflectionQuestion": "Kendime daha adil davransaydım aynı durumda ne derdim?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f2",
      "oz-sefkat",
      "öz-şefkatli-iç-konuşma"
    ],
    "standardTask": "Sert bir iç cümleni daha adil ve uygulanabilir bir cümleye çevir.",
    "minimumTask": "Kendine söylediğin sert cümleyi fark et ve yanına daha adil bir kelime ekle.",
    "successMeaning": "Öz-eleştiriye karşı daha sürdürülebilir bir iç dil denedin.",
    "reflectionExamples": [
      "Kendime 'başkaları daha iyi' dediğimi fark ettim; yerine 'bugün zordu, yeterince çabaladım' desem daha adil ve sürdürülebilir olurdu.",
      "Aynı durumda arkadaşıma nasıl konuşurdum? Ona her gün aynı değil, kendime ise başkaları daha iyi demiştim; bugün dengeledim.",
      "Başarısızlık değil, kapasite sınırı; 'bugün bu kadar yeter' demek, daha uzun soluklu çalışmamı sağlıyor."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Sert bir iç cümleni daha adil ve uygulanabilir bir cümleye çevir."
  },
  {
    "day": 54,
    "phaseCode": "F2",
    "phaseTitle": "Faz 2 — Düzenleme",
    "phaseGoal": "Kaygı, ruminasyon, enerji ve öz-eleştiriyle daha işlevli çalışmak.",
    "domain": "belirsizlik",
    "domainLabel": "Belirsizlik toleransı",
    "quoteKind": "original_science_based",
    "quote": "Kaygı seni korumaya çalışıyor olabilir; yine de direksiyona geçmek zorunda değil.",
    "source": null,
    "psychologicalLens": "belirsizlikle kalma",
    "explanation": "Yakınlık ve sınır birlikte çalıştığında ilişki daha az tehditkâr hale gelir.",
    "reflectionQuestion": "Bu belirsizlikle kalınca korktuğum şey gerçekten oldu mu?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f2",
      "belirsizlik",
      "belirsizlikle-kalma"
    ],
    "standardTask": "Düşük riskli bir belirsizliği 20 dakika kontrol etmeden bırak.",
    "minimumTask": "Bir kontrol davranışını yalnızca 5 dakika ertele.",
    "successMeaning": "Kontrol dürtüsünü erteledin; kaygıya yeni öğrenme alanı açtın.",
    "reflectionExamples": [
      "bir mesajın cevabı belirsizliğiyle 20 dk kalınca korktuğum yetersizlik gerçekleşmedi; kaygı gerçeklik değilmiş.",
      "Kontrol dürtüsünü bir saat erteledim; sonrasında dürtü geçti ve fark ettim ki dürtü geçici.",
      "Kesinlik aramak yerine 'şu an yeterli bilgi var mı?' diye sordum; cevap evetti, ek kontrole gerek kalmadı."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Düşük riskli bir belirsizliği 20 dakika kontrol etmeden bırak."
  },
  {
    "day": 55,
    "phaseCode": "F2",
    "phaseTitle": "Faz 2 — Düzenleme",
    "phaseGoal": "Kaygı, ruminasyon, enerji ve öz-eleştiriyle daha işlevli çalışmak.",
    "domain": "destek",
    "domainLabel": "Destek isteme",
    "quoteKind": "original_science_based",
    "quote": "Destek istemek için dağılmayı bekleme; erken ve küçük istemek daha sağlıklıdır.",
    "source": null,
    "psychologicalLens": "sosyal destek aktivasyonu",
    "explanation": "Kapasiteye göre ayarlanmış hedef, sürdürülebilirlik ve öz-yeterlik için daha uygundur.",
    "reflectionQuestion": "Destek istemek nasıl hissettirdi: riskli, rahatlatıcı, garip, nötr?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f2",
      "destek",
      "sosyal-destek-aktivasyonu"
    ],
    "standardTask": "Güvendiğin bir kişiden küçük ve somut bir destek iste.",
    "minimumTask": "Destek isteyebileceğin kişinin adını ve isteyeceğin şeyi taslak olarak yaz.",
    "successMeaning": "Destek isteme davranışının ilk basamağını görünür yaptın.",
    "reflectionExamples": [
      "karar verme konusunda bir kişiden yardım istedim; istemek utanç değil, çözüm üretmekmiş.",
      "Destek ararken 'bu konuda fikrini alabilir miyim' dedim; karşı tarafın sadece dinlemesi bile yükümü hafifletti.",
      "Yalnız başa çıkmak zorunda değilim; bugün yalnızca dinleme talep ettim, bu yakınlığı güvenli kıldı."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Güvendiğin bir kişiden küçük ve somut bir destek iste."
  },
  {
    "day": 56,
    "phaseCode": "F2",
    "phaseTitle": "Faz 2 — Düzenleme",
    "phaseGoal": "Kaygı, ruminasyon, enerji ve öz-eleştiriyle daha işlevli çalışmak.",
    "domain": "sinir",
    "domainLabel": "Sınır koyma",
    "quoteKind": "original_science_based",
    "quote": "Sınır koyarken sevgi göstermek mümkündür.",
    "source": null,
    "psychologicalLens": "sınır netliği",
    "explanation": "Bu günün amacı otomatik savunmayı suçlamak değil, onu fark edip daha esnek bir seçenek üretmektir.",
    "reflectionQuestion": "Sınırımı söyleyince temas daha mı netleşti?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f2",
      "sinir",
      "sınır-netliği"
    ],
    "standardTask": "Bir sınır cümlesi kur: 'Şu an ... yapacağım; ... zamanda döneceğim.'",
    "minimumTask": "Koymak istediğin sınırı göndermeden önce tek cümleyle taslaklaştır.",
    "successMeaning": "Sınırı kopmadan ve cezalandırmadan ifade etmeye yaklaştın.",
    "reflectionExamples": [
      "iş yükü durumunda 'şu sınır benim için önemli' dedim; sert değil, net bir çerçeve kurmak rahatlattı.",
      "Hayır demek önce panik, sonra rahatlama getirdi; karşı taraf soru sordu, ben sınırımda kaldım.",
      "Sınırımı açıkça söyleyince suçluluk hissettim ama uzun vadede daha az yorgun fark ettim."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bir sınır cümlesi kur: 'Şu an ... yapacağım; ... zamanda döneceğim.'"
  },
  {
    "day": 57,
    "phaseCode": "F2",
    "phaseTitle": "Faz 2 — Düzenleme",
    "phaseGoal": "Kaygı, ruminasyon, enerji ve öz-eleştiriyle daha işlevli çalışmak.",
    "domain": "onarim",
    "domainLabel": "İlişki onarımı",
    "quoteKind": "original_science_based",
    "quote": "Onarım cümlesi uzun olmak zorunda değil; dürüst olması yeterlidir.",
    "source": null,
    "psychologicalLens": "ilişki onarımı",
    "explanation": "Küçük davranış, zihne soyut motivasyondan daha güvenilir kanıt verir.",
    "reflectionQuestion": "Onarım denemem ilişkiye hangi yeni bilgiyi ekledi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f2",
      "onarim",
      "ilişki-onarımı"
    ],
    "standardTask": "Uzaklaştığın bir kişiye açıklama taslağı yaz: 'Geri çekildim çünkü ...'",
    "minimumTask": "Onarım cümlesini göndermeden yalnızca notlara yaz.",
    "successMeaning": "Uzaklaşma yerine onarım seçeneğini zihinde erişilebilir yaptın.",
    "reflectionExamples": [
      "ailemle yaşanan unutulan bir söz sonrası 'senin için ne yapabilirim' dedim; onarım büyük jest değil, küçük ve samimi adım.",
      "Özür yerine açıklama ve 'seni dinlemek için zaman ayırayım' sundum; ilişkideki gerilim açık konuşunca azaldı.",
      "Onarım denemem en azından elimi uzatmamı sağladı; denemek, mükemmel olmaktan daha değerli."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Uzaklaştığın bir kişiye açıklama taslağı yaz: 'Geri çekildim çünkü ...'"
  },
  {
    "day": 58,
    "phaseCode": "F2",
    "phaseTitle": "Faz 2 — Düzenleme",
    "phaseGoal": "Kaygı, ruminasyon, enerji ve öz-eleştiriyle daha işlevli çalışmak.",
    "domain": "yakinlik",
    "domainLabel": "Yakınlık toleransı",
    "quoteKind": "original_science_based",
    "quote": "Birine güvenmek, kontrolü tamamen bırakmak değil; küçük riskleri test etmektir.",
    "source": null,
    "psychologicalLens": "kademeli yakınlık",
    "explanation": "Duygu ve düşünceyi ayırmak, tepki vermeden önce seçim alanı açar.",
    "reflectionQuestion": "Yakınlık dozu bana fazla mı geldi, yoksa yönetilebilir miydi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f2",
      "yakinlik",
      "kademeli-yakınlık"
    ],
    "standardTask": "Normalde saklayacağın küçük bir doğruyu güvenli bir kişiye söyle.",
    "minimumTask": "Güvenli bir kişiye söyleyebileceğin yüzde beşlik açıklık cümlesini yaz.",
    "successMeaning": "Tam kapanma yerine güvenli dozda temas ihtimalini artırdın.",
    "reflectionExamples": [
      "Yakınlık anında çekilme isteği geldi; bu sefer 1 dk kadar kaldım ve panik aynı kaldı ama katlanabilirdi.",
      "ailem ile sarılma anında 'buradayım' demek, uzaklaşmaktan daha güvenli hissettirdi.",
      "Yakınlığa maruz kalınca bedenim nefes hızlandı yaptı; nefes alıp kalmak, duygu geçene kadar yeterliymiş."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Normalde saklayacağın küçük bir doğruyu güvenli bir kişiye söyle."
  },
  {
    "day": 59,
    "phaseCode": "F2",
    "phaseTitle": "Faz 2 — Düzenleme",
    "phaseGoal": "Kaygı, ruminasyon, enerji ve öz-eleştiriyle daha işlevli çalışmak.",
    "domain": "enerji",
    "domainLabel": "Enerji yönetimi",
    "quoteKind": "original_science_based",
    "quote": "Uykusuzluk, açlık ve stres düşünceleri daha tehditkâr gösterebilir.",
    "source": null,
    "psychologicalLens": "kapasiteye göre hedefleme",
    "explanation": "Yakınlık ve sınır birlikte çalıştığında ilişki daha az tehditkâr hale gelir.",
    "reflectionQuestion": "Hedefi küçültmek ilerlemeyi artırdı mı azalttı mı?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f2",
      "enerji",
      "kapasiteye-göre-hedefleme"
    ],
    "standardTask": "Enerjini 0–10 puanla; bugünkü hedefini bu puana göre küçült.",
    "minimumTask": "Enerjini 0–10 arasında puanla ve hedefi bir kademe küçült.",
    "successMeaning": "Kapasiteye göre hedef ayarladın; sürdürülebilirliği korudun.",
    "reflectionExamples": [
      "Bugün enerjim yorucu idi; hafif esneme yapınca odak döndü ve daha sürdürülebilir çalıştım.",
      "İrade değil ritim; 10 dk mola verince odaklanmam geri geldi, kendimi suçlamadım.",
      "Yüksek enerjili saatlerimi yaratıcı iş için, düşüklerini admin için kullandım; verim değil, denge önemli."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Enerjini 0–10 puanla; bugünkü hedefini bu puana göre küçült."
  },
  {
    "day": 60,
    "phaseCode": "F2",
    "phaseTitle": "Faz 2 — Düzenleme",
    "phaseGoal": "Kaygı, ruminasyon, enerji ve öz-eleştiriyle daha işlevli çalışmak.",
    "domain": "deger",
    "domainLabel": "Değer odaklılık",
    "quoteKind": "original_science_based",
    "quote": "Bugün küçük bir değer davranışı seç; görünür olmasa da sistemine veri olur.",
    "source": null,
    "psychologicalLens": "değer temelli davranış",
    "explanation": "Kapasiteye göre ayarlanmış hedef, sürdürülebilirlik ve öz-yeterlik için daha uygundur.",
    "reflectionQuestion": "Bugünkü davranışım uzun vadede hangi kişiye dönüşmeme yardım ediyor?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f2",
      "deger",
      "değer-temelli-davranış"
    ],
    "standardTask": "Bugün yaptığın tek davranışın hangi değere hizmet ettiğini yaz.",
    "minimumTask": "Bugün korumak istediğin değeri tek kelimeyle yaz.",
    "successMeaning": "Duygu durumdan bağımsız olarak yönünü değerle bağladın.",
    "reflectionExamples": [
      "Bugün üretkenlik değerime hizmet eden eylem: zor bir konuşma yaptım; uzun hedef değil, bugünkü seçim önemli.",
      "beklenti baskısı anında değerim yakınlık olduğunu hatırladım; bu, seçimi kolaylaştırdı.",
      "Davranışım (sınır koydum) ile yakınlık arasındaki bağ kurunca motivasyonum içsel."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bugün yaptığın tek davranışın hangi değere hizmet ettiğini yaz."
  },
  {
    "day": 61,
    "phaseCode": "F3",
    "phaseTitle": "Faz 3 — Temas",
    "phaseGoal": "İhtiyaç, sınır, destek isteme, yakınlık toleransı ve onarım becerilerini uygulamak.",
    "domain": "farkindalik",
    "domainLabel": "Farkındalık",
    "quoteKind": "original_science_based",
    "quote": "Dur ve sor: Şu an yaptığım şey beni koruyor mu, yoksa teması erteliyor mu?",
    "source": null,
    "psychologicalLens": "otomatik tepkiyi yavaşlatma",
    "explanation": "Bu günün amacı otomatik savunmayı suçlamak değil, onu fark edip daha esnek bir seçenek üretmektir.",
    "reflectionQuestion": "Bu tepki beni gerçekten korudu mu, yoksa yalnızca teması mı erteledi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f3",
      "farkindalik",
      "otomatik-tepkiyi-yavaşlatma"
    ],
    "standardTask": "Bugün geri çekilmek istediğin bir anda 90 saniye dur ve dürtünün adını yaz.",
    "minimumTask": "Geri çekilme veya otomatik tepkiyle ilgili yalnızca bir kelime yaz.",
    "successMeaning": "Otomatik tepkiyi fark ettin; bu, değişim için ilk davranış verisidir.",
    "reflectionExamples": [
      "Bugün geri çekilme isteği geldiğinde 90 sn durdum; vücudumda gerilme fark ettim, hemen tepki vermek zorunda değilmişim.",
      "Dürtü anında altımda suçluluk olduğunu gördüm; sadece 'kaygı' diye adlandırmak yoğunluğu biraz azalttı.",
      "Cevap vermeden önce 'şu anda zihnim ne diyor?' diye sordum; bu duruş, dürtüyü veri olarak görmek için yeterliydi."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bugün geri çekilmek istediğin bir anda 90 saniye dur ve dürtünün adını yaz."
  },
  {
    "day": 62,
    "phaseCode": "F3",
    "phaseTitle": "Faz 3 — Temas",
    "phaseGoal": "İhtiyaç, sınır, destek isteme, yakınlık toleransı ve onarım becerilerini uygulamak.",
    "domain": "duygu-adlandirma",
    "domainLabel": "Duygu adlandırma",
    "quoteKind": "original_science_based",
    "quote": "Duyguyu bastırmak yerine dozunu düşürmek daha sürdürülebilir olabilir.",
    "source": null,
    "psychologicalLens": "duygu ayrıştırma",
    "explanation": "Küçük davranış, zihne soyut motivasyondan daha güvenilir kanıt verir.",
    "reflectionQuestion": "Şu an hissettiğim şeyin en doğru adı ne?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f3",
      "duygu-adlandirma",
      "duygu-ayrıştırma"
    ],
    "standardTask": "Bugünün baskın duygusunu üç düzeyde yaz: görünen duygu, alttaki duygu, bedendeki his.",
    "minimumTask": "Bugünkü baskın duygunu tek kelimeyle adlandır.",
    "successMeaning": "Duyguyu adlandırdın; belirsiz iç basıncı daha yönetilebilir hâle getirdin.",
    "reflectionExamples": [
      "Bugün görünürde sinir hissediyordum ama altında yalnızlık vardı; göğsümde boşluk fark ettim.",
      "Duyguyu sadece 'kötü' değil, 'hayal kırıklığı' diye adlandırınca daha yönetilebilir geldi; zihnim 'hâlâ güvensiz' dedi.",
      "Üç katman yazdım: dışta sinir, ortada korku, bedende sıkışma; bu ayrıştırma panik hissini durdurdu."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bugünün baskın duygusunu üç düzeyde yaz: görünen duygu, alttaki duygu, bedendeki his."
  },
  {
    "day": 63,
    "phaseCode": "F3",
    "phaseTitle": "Faz 3 — Temas",
    "phaseGoal": "İhtiyaç, sınır, destek isteme, yakınlık toleransı ve onarım becerilerini uygulamak.",
    "domain": "bilissel-mesafe",
    "domainLabel": "Bilişsel mesafe",
    "quoteKind": "original_science_based",
    "quote": "Zihnin felaket senaryosu üretirse, ondan kanıt ve alternatif açıklama iste.",
    "source": null,
    "psychologicalLens": "bilişsel ayrışma",
    "explanation": "Duygu ve düşünceyi ayırmak, tepki vermeden önce seçim alanı açar.",
    "reflectionQuestion": "Bu düşünceye yüzde kaç inanıyorum ve hangi kanıt eksik?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f3",
      "bilissel-mesafe",
      "bilişsel-ayrışma"
    ],
    "standardTask": "Zorlayan düşüncenin başına şu ifadeyi ekle: 'Zihnim şu anda bana ... diyor.'",
    "minimumTask": "Zorlayan düşünceni 'Zihnim şu anda bana ... diyor' kalıbıyla bir cümleye çevir.",
    "successMeaning": "Düşünceyle arana mesafe koydun; onu gerçek değil veri olarak ele aldın.",
    "reflectionExamples": [
      "Zihnim 'her şey benim hatam' diyordu; başına 'zihnim şu anda bana ... diyor' ekleyince gerçekliği azaldı.",
      "Bu düşünceye %70 inanıyordum ama kanıt listelediğimde başarıldığına dair kanıtın eksik olduğunu gördüm.",
      "Düşünceyi bir cümle olarak yazıp okudum; aynı cümle tekrarlanınca bir 'veri parçası' gibi durdu."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Zorlayan düşüncenin başına şu ifadeyi ekle: 'Zihnim şu anda bana ... diyor.'"
  },
  {
    "day": 64,
    "phaseCode": "F3",
    "phaseTitle": "Faz 3 — Temas",
    "phaseGoal": "İhtiyaç, sınır, destek isteme, yakınlık toleransı ve onarım becerilerini uygulamak.",
    "domain": "davranissal-aktivasyon",
    "domainLabel": "Davranışsal aktivasyon",
    "quoteKind": "original_science_based",
    "quote": "Başlamak için kendini ikna etmeye çalışma; ortamı kolaylaştır.",
    "source": null,
    "psychologicalLens": "davranışsal aktivasyon",
    "explanation": "Yakınlık ve sınır birlikte çalıştığında ilişki daha az tehditkâr hale gelir.",
    "reflectionQuestion": "En küçük uygulanabilir adım neydi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f3",
      "davranissal-aktivasyon",
      "davranışsal-aktivasyon"
    ],
    "standardTask": "İki dakikada başlayabileceğin bir davranış seç ve yalnızca iki dakika uygula.",
    "minimumTask": "Görevin yalnızca ilk 60 saniyesini yap.",
    "successMeaning": "Motivasyonu beklemeden davranış başlattın.",
    "reflectionExamples": [
      "Hazır değildim ama egzersiz için sadece iki dakika başladım; sonrasında en azından başlamış oldum.",
      "Motivasyonu beklemeden bir cümle yazdım; başlangıç, hissettiğimden çok daha küçük bir şeymiş.",
      "Bugünün minimumu 1 dk başlangıç idi; yaptığımda kendime 'bu da sayılır' demeyi öğrendim."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "İki dakikada başlayabileceğin bir davranış seç ve yalnızca iki dakika uygula."
  },
  {
    "day": 65,
    "phaseCode": "F3",
    "phaseTitle": "Faz 3 — Temas",
    "phaseGoal": "İhtiyaç, sınır, destek isteme, yakınlık toleransı ve onarım becerilerini uygulamak.",
    "domain": "oz-sefkat",
    "domainLabel": "Öz-şefkat",
    "quoteKind": "original_science_based",
    "quote": "Kendine şefkat göstermek, sorumluluğu bırakmak değil; sorumluluğu taşınabilir kılmaktır.",
    "source": null,
    "psychologicalLens": "öz-şefkatli iç konuşma",
    "explanation": "Kapasiteye göre ayarlanmış hedef, sürdürülebilirlik ve öz-yeterlik için daha uygundur.",
    "reflectionQuestion": "Kendime daha adil davransaydım aynı durumda ne derdim?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f3",
      "oz-sefkat",
      "öz-şefkatli-iç-konuşma"
    ],
    "standardTask": "Sert bir iç cümleni daha adil ve uygulanabilir bir cümleye çevir.",
    "minimumTask": "Kendine söylediğin sert cümleyi fark et ve yanına daha adil bir kelime ekle.",
    "successMeaning": "Öz-eleştiriye karşı daha sürdürülebilir bir iç dil denedin.",
    "reflectionExamples": [
      "Kendime 'başkaları daha iyi' dediğimi fark ettim; yerine 'bugün zordu, yeterince çabaladım' desem daha adil ve sürdürülebilir olurdu.",
      "Aynı durumda arkadaşıma nasıl konuşurdum? Ona sabırlı ol, kendime ise başkaları daha iyi demiştim; bugün dengeledim.",
      "Başarısızlık değil, kapasite sınırı; 'bugün bu kadar yeter' demek, daha uzun soluklu çalışmamı sağlıyor."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Sert bir iç cümleni daha adil ve uygulanabilir bir cümleye çevir."
  },
  {
    "day": 66,
    "phaseCode": "F3",
    "phaseTitle": "Faz 3 — Temas",
    "phaseGoal": "İhtiyaç, sınır, destek isteme, yakınlık toleransı ve onarım becerilerini uygulamak.",
    "domain": "belirsizlik",
    "domainLabel": "Belirsizlik toleransı",
    "quoteKind": "original_science_based",
    "quote": "Her belirsizliği çözmeye çalışmak, zihni alarmda tutar.",
    "source": null,
    "psychologicalLens": "belirsizlikle kalma",
    "explanation": "Bu günün amacı otomatik savunmayı suçlamak değil, onu fark edip daha esnek bir seçenek üretmektir.",
    "reflectionQuestion": "Bu belirsizlikle kalınca korktuğum şey gerçekten oldu mu?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f3",
      "belirsizlik",
      "belirsizlikle-kalma"
    ],
    "standardTask": "Düşük riskli bir belirsizliği 20 dakika kontrol etmeden bırak.",
    "minimumTask": "Bir kontrol davranışını yalnızca 5 dakika ertele.",
    "successMeaning": "Kontrol dürtüsünü erteledin; kaygıya yeni öğrenme alanı açtın.",
    "reflectionExamples": [
      "ilişki durumu belirsizliğiyle 20 dk kalınca korktuğum reddedilme gerçekleşmedi; kaygı gerçeklik değilmiş.",
      "Kontrol dürtüsünü bir saat erteledim; sonrasında aslında güvenli olduğumu gördüm ve fark ettim ki dürtü geçici.",
      "Kesinlik aramak yerine 'şu an yeterli bilgi var mı?' diye sordum; cevap evetti, ek kontrole gerek kalmadı."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Düşük riskli bir belirsizliği 20 dakika kontrol etmeden bırak."
  },
  {
    "day": 67,
    "phaseCode": "F3",
    "phaseTitle": "Faz 3 — Temas",
    "phaseGoal": "İhtiyaç, sınır, destek isteme, yakınlık toleransı ve onarım becerilerini uygulamak.",
    "domain": "destek",
    "domainLabel": "Destek isteme",
    "quoteKind": "original_science_based",
    "quote": "Biri yanına gelene kadar beklemek yerine, ihtiyacını görünür kıl.",
    "source": null,
    "psychologicalLens": "sosyal destek aktivasyonu",
    "explanation": "Küçük davranış, zihne soyut motivasyondan daha güvenilir kanıt verir.",
    "reflectionQuestion": "Destek istemek nasıl hissettirdi: riskli, rahatlatıcı, garip, nötr?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f3",
      "destek",
      "sosyal-destek-aktivasyonu"
    ],
    "standardTask": "Güvendiğin bir kişiden küçük ve somut bir destek iste.",
    "minimumTask": "Destek isteyebileceğin kişinin adını ve isteyeceğin şeyi taslak olarak yaz.",
    "successMeaning": "Destek isteme davranışının ilk basamağını görünür yaptın.",
    "reflectionExamples": [
      "duygusal bir yük konusunda bir kişiden yardım istedim; istemek utanç değil, çözüm üretmekmiş.",
      "Destek ararken 'bana 5 dk dinler misin' dedim; karşı tarafın sadece dinlemesi bile yükümü hafifletti.",
      "Yalnız başa çıkmak zorunda değilim; bugün yalnızca dinleme talep ettim, bu yakınlığı güvenli kıldı."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Güvendiğin bir kişiden küçük ve somut bir destek iste."
  },
  {
    "day": 68,
    "phaseCode": "F3",
    "phaseTitle": "Faz 3 — Temas",
    "phaseGoal": "İhtiyaç, sınır, destek isteme, yakınlık toleransı ve onarım becerilerini uygulamak.",
    "domain": "sinir",
    "domainLabel": "Sınır koyma",
    "quoteKind": "original_science_based",
    "quote": "Sınırını açıklamak, karşı tarafı zihin okumaya mahkûm etmemektir.",
    "source": null,
    "psychologicalLens": "sınır netliği",
    "explanation": "Duygu ve düşünceyi ayırmak, tepki vermeden önce seçim alanı açar.",
    "reflectionQuestion": "Sınırımı söyleyince temas daha mı netleşti?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f3",
      "sinir",
      "sınır-netliği"
    ],
    "standardTask": "Bir sınır cümlesi kur: 'Şu an ... yapacağım; ... zamanda döneceğim.'",
    "minimumTask": "Koymak istediğin sınırı göndermeden önce tek cümleyle taslaklaştır.",
    "successMeaning": "Sınırı kopmadan ve cezalandırmadan ifade etmeye yaklaştın.",
    "reflectionExamples": [
      "sosyal bir davet durumunda 'bugün bunu yapamam' dedim; sert değil, net bir çerçeve kurmak rahatlattı.",
      "Hayır demek önce panik, sonra rahatlama getirdi; karşı taraf soru sordu, ben sınırımda kaldım.",
      "Sınırımı açıkça söyleyince suçluluk hissettim ama uzun vadede daha net hissettim."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bir sınır cümlesi kur: 'Şu an ... yapacağım; ... zamanda döneceğim.'"
  },
  {
    "day": 69,
    "phaseCode": "F3",
    "phaseTitle": "Faz 3 — Temas",
    "phaseGoal": "İhtiyaç, sınır, destek isteme, yakınlık toleransı ve onarım becerilerini uygulamak.",
    "domain": "onarim",
    "domainLabel": "İlişki onarımı",
    "quoteKind": "original_science_based",
    "quote": "Kırıldığında susmak seni koruyabilir; ama anlaşılmayı da geciktirebilir.",
    "source": null,
    "psychologicalLens": "ilişki onarımı",
    "explanation": "Yakınlık ve sınır birlikte çalıştığında ilişki daha az tehditkâr hale gelir.",
    "reflectionQuestion": "Onarım denemem ilişkiye hangi yeni bilgiyi ekledi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f3",
      "onarim",
      "ilişki-onarımı"
    ],
    "standardTask": "Uzaklaştığın bir kişiye açıklama taslağı yaz: 'Geri çekildim çünkü ...'",
    "minimumTask": "Onarım cümlesini göndermeden yalnızca notlara yaz.",
    "successMeaning": "Uzaklaşma yerine onarım seçeneğini zihinde erişilebilir yaptın.",
    "reflectionExamples": [
      "ailemle yaşanan geciken bir cevap sonrası 'özür dilerim, amacım şuydu' dedim; onarım büyük jest değil, küçük ve samimi adım.",
      "Özür yerine açıklama ve 'daha dikkatli olacağım' sundum; ilişkideki gerilim açık konuşunca azaldı.",
      "Onarım denemem en azından elimi uzatmamı sağladı; denemek, mükemmel olmaktan daha değerli."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Uzaklaştığın bir kişiye açıklama taslağı yaz: 'Geri çekildim çünkü ...'"
  },
  {
    "day": 70,
    "phaseCode": "F3",
    "phaseTitle": "Faz 3 — Temas",
    "phaseGoal": "İhtiyaç, sınır, destek isteme, yakınlık toleransı ve onarım becerilerini uygulamak.",
    "domain": "yakinlik",
    "domainLabel": "Yakınlık toleransı",
    "quoteKind": "original_science_based",
    "quote": "Yakınlıkta bunaldığında tamamen kaçmak yerine tempo iste.",
    "source": null,
    "psychologicalLens": "kademeli yakınlık",
    "explanation": "Kapasiteye göre ayarlanmış hedef, sürdürülebilirlik ve öz-yeterlik için daha uygundur.",
    "reflectionQuestion": "Yakınlık dozu bana fazla mı geldi, yoksa yönetilebilir miydi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f3",
      "yakinlik",
      "kademeli-yakınlık"
    ],
    "standardTask": "Normalde saklayacağın küçük bir doğruyu güvenli bir kişiye söyle.",
    "minimumTask": "Güvenli bir kişiye söyleyebileceğin yüzde beşlik açıklık cümlesini yaz.",
    "successMeaning": "Tam kapanma yerine güvenli dozda temas ihtimalini artırdın.",
    "reflectionExamples": [
      "Yakınlık anında çekilme isteği geldi; bu sefer 1 dk kadar kaldım ve panik hafifledi.",
      "yakın arkadaşım ile göz teması anında 'buradayım' demek, uzaklaşmaktan daha güvenli hissettirdi.",
      "Yakınlığa maruz kalınca bedenim gerildi yaptı; nefes alıp kalmak, duygu geçene kadar yeterliymiş."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Normalde saklayacağın küçük bir doğruyu güvenli bir kişiye söyle."
  },
  {
    "day": 71,
    "phaseCode": "F3",
    "phaseTitle": "Faz 3 — Temas",
    "phaseGoal": "İhtiyaç, sınır, destek isteme, yakınlık toleransı ve onarım becerilerini uygulamak.",
    "domain": "enerji",
    "domainLabel": "Enerji yönetimi",
    "quoteKind": "original_science_based",
    "quote": "Enerji azsa sistemin bozuk değildir; sistemin veri veriyordur.",
    "source": null,
    "psychologicalLens": "kapasiteye göre hedefleme",
    "explanation": "Bu günün amacı otomatik savunmayı suçlamak değil, onu fark edip daha esnek bir seçenek üretmektir.",
    "reflectionQuestion": "Hedefi küçültmek ilerlemeyi artırdı mı azalttı mı?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f3",
      "enerji",
      "kapasiteye-göre-hedefleme"
    ],
    "standardTask": "Enerjini 0–10 puanla; bugünkü hedefini bu puana göre küçült.",
    "minimumTask": "Enerjini 0–10 arasında puanla ve hedefi bir kademe küçült.",
    "successMeaning": "Kapasiteye göre hedef ayarladın; sürdürülebilirliği korudun.",
    "reflectionExamples": [
      "Bugün enerjim dalgalı idi; kısa bir mola yapınca düşüş yavaşladı ve daha sürdürülebilir çalıştım.",
      "İrade değil ritim; 20 dk mola verince odaklanmam geri geldi, kendimi suçlamadım.",
      "Yüksek enerjili saatlerimi zor problem için, düşüklerini hafif iş için kullandım; verim değil, denge önemli."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Enerjini 0–10 puanla; bugünkü hedefini bu puana göre küçült."
  },
  {
    "day": 72,
    "phaseCode": "F3",
    "phaseTitle": "Faz 3 — Temas",
    "phaseGoal": "İhtiyaç, sınır, destek isteme, yakınlık toleransı ve onarım becerilerini uygulamak.",
    "domain": "deger",
    "domainLabel": "Değer odaklılık",
    "quoteKind": "original_science_based",
    "quote": "Değerler sonuç garantisi vermez; davranış yönü verir.",
    "source": null,
    "psychologicalLens": "değer temelli davranış",
    "explanation": "Küçük davranış, zihne soyut motivasyondan daha güvenilir kanıt verir.",
    "reflectionQuestion": "Bugünkü davranışım uzun vadede hangi kişiye dönüşmeme yardım ediyor?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f3",
      "deger",
      "değer-temelli-davranış"
    ],
    "standardTask": "Bugün yaptığın tek davranışın hangi değere hizmet ettiğini yaz.",
    "minimumTask": "Bugün korumak istediğin değeri tek kelimeyle yaz.",
    "successMeaning": "Duygu durumdan bağımsız olarak yönünü değerle bağladın.",
    "reflectionExamples": [
      "Bugün yakınlık değerime hizmet eden küçük eylem: bir adım attım; uzun hedef değil, bugünkü seçim önemli.",
      "yorgunluk anı anında değerim üretkenlik olduğunu hatırladım; bu, seçimi kolaylaştırdı.",
      "Davranışım (sınır koydum) ile yakınlık arasındaki bağ kurunca motivasyonum içsel."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bugün yaptığın tek davranışın hangi değere hizmet ettiğini yaz."
  },
  {
    "day": 73,
    "phaseCode": "F3",
    "phaseTitle": "Faz 3 — Temas",
    "phaseGoal": "İhtiyaç, sınır, destek isteme, yakınlık toleransı ve onarım becerilerini uygulamak.",
    "domain": "farkindalik",
    "domainLabel": "Farkındalık",
    "quoteKind": "original_science_based",
    "quote": "Bugün otomatik davranışını yakalarsan, günü kaybetmiş sayılmazsın.",
    "source": null,
    "psychologicalLens": "otomatik tepkiyi yavaşlatma",
    "explanation": "Duygu ve düşünceyi ayırmak, tepki vermeden önce seçim alanı açar.",
    "reflectionQuestion": "Bu tepki beni gerçekten korudu mu, yoksa yalnızca teması mı erteledi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f3",
      "farkindalik",
      "otomatik-tepkiyi-yavaşlatma"
    ],
    "standardTask": "Bugün geri çekilmek istediğin bir anda 90 saniye dur ve dürtünün adını yaz.",
    "minimumTask": "Geri çekilme veya otomatik tepkiyle ilgili yalnızca bir kelime yaz.",
    "successMeaning": "Otomatik tepkiyi fark ettin; bu, değişim için ilk davranış verisidir.",
    "reflectionExamples": [
      "Bugün düşünce döngüsü anında bir nefes durup fark ettim; vücudumda sıkışma hissettim, hemen tepki vermek zorunda değilmişim.",
      "Dürtü geldiğinde fark ettim ki aslında alt duygu hissediyordum; sadece durup adlandırmak yoğunluğu azalttı.",
      "cevap verme yapmadan önce kendime 'şu anda ne oluyor?' diye sordum; bu küçük duruş, dürtüyü veri olarak görmek için bir veri."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bugün geri çekilmek istediğin bir anda 90 saniye dur ve dürtünün adını yaz."
  },
  {
    "day": 74,
    "phaseCode": "F3",
    "phaseTitle": "Faz 3 — Temas",
    "phaseGoal": "İhtiyaç, sınır, destek isteme, yakınlık toleransı ve onarım becerilerini uygulamak.",
    "domain": "duygu-adlandirma",
    "domainLabel": "Duygu adlandırma",
    "quoteKind": "original_science_based",
    "quote": "Bir duyguyu adlandırmak, onu küçültmez; onu taşınabilir hale getirebilir.",
    "source": null,
    "psychologicalLens": "duygu ayrıştırma",
    "explanation": "Yakınlık ve sınır birlikte çalıştığında ilişki daha az tehditkâr hale gelir.",
    "reflectionQuestion": "Şu an hissettiğim şeyin en doğru adı ne?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f3",
      "duygu-adlandirma",
      "duygu-ayrıştırma"
    ],
    "standardTask": "Bugünün baskın duygusunu üç düzeyde yaz: görünen duygu, alttaki duygu, bedendeki his.",
    "minimumTask": "Bugünkü baskın duygunu tek kelimeyle adlandır.",
    "successMeaning": "Duyguyu adlandırdın; belirsiz iç basıncı daha yönetilebilir hâle getirdin.",
    "reflectionExamples": [
      "Bugün görünürde öfke hissediyordum ama altında suçluluk vardı; göğsümde çarpıntı fark ettim.",
      "Duyguyu sadece 'kötü' değil, 'yalnızlık' diye adlandırınca daha yönetilebilir geldi; zihnim 'hâlâ güvensiz' dedi.",
      "Üç katman yazdım: dışta sinir, ortada yalnızlık, bedende sıkışma; bu ayrıştırma panik hissini durdurdu."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bugünün baskın duygusunu üç düzeyde yaz: görünen duygu, alttaki duygu, bedendeki his."
  },
  {
    "day": 75,
    "phaseCode": "F3",
    "phaseTitle": "Faz 3 — Temas",
    "phaseGoal": "İhtiyaç, sınır, destek isteme, yakınlık toleransı ve onarım becerilerini uygulamak.",
    "domain": "bilissel-mesafe",
    "domainLabel": "Bilişsel mesafe",
    "quoteKind": "original_science_based",
    "quote": "Düşüncenin sesi yüksek olabilir; doğruluk seviyesi ayrıca incelenir.",
    "source": null,
    "psychologicalLens": "bilişsel ayrışma",
    "explanation": "Kapasiteye göre ayarlanmış hedef, sürdürülebilirlik ve öz-yeterlik için daha uygundur.",
    "reflectionQuestion": "Bu düşünceye yüzde kaç inanıyorum ve hangi kanıt eksik?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f3",
      "bilissel-mesafe",
      "bilişsel-ayrışma"
    ],
    "standardTask": "Zorlayan düşüncenin başına şu ifadeyi ekle: 'Zihnim şu anda bana ... diyor.'",
    "minimumTask": "Zorlayan düşünceni 'Zihnim şu anda bana ... diyor' kalıbıyla bir cümleye çevir.",
    "successMeaning": "Düşünceyle arana mesafe koydun; onu gerçek değil veri olarak ele aldın.",
    "reflectionExamples": [
      "Zihnim 'kontrol etmeliyim' diyordu; başına 'zihnim şu anda bana ... diyor' ekleyince gerçekliği azaldı.",
      "Bu düşünceye %90 inanıyordum ama kanıt listelediğimde alternatif açıklamanın eksik olduğunu gördüm.",
      "Düşünceyi bir cümle olarak yazıp okudum; aynı cümle tekrarlanınca bir 'veri parçası' gibi durdu."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Zorlayan düşüncenin başına şu ifadeyi ekle: 'Zihnim şu anda bana ... diyor.'"
  },
  {
    "day": 76,
    "phaseCode": "F3",
    "phaseTitle": "Faz 3 — Temas",
    "phaseGoal": "İhtiyaç, sınır, destek isteme, yakınlık toleransı ve onarım becerilerini uygulamak.",
    "domain": "davranissal-aktivasyon",
    "domainLabel": "Davranışsal aktivasyon",
    "quoteKind": "original_science_based",
    "quote": "Planın en küçük versiyonu, plansız beklemekten daha iyidir.",
    "source": null,
    "psychologicalLens": "davranışsal aktivasyon",
    "explanation": "Bu günün amacı otomatik savunmayı suçlamak değil, onu fark edip daha esnek bir seçenek üretmektir.",
    "reflectionQuestion": "En küçük uygulanabilir adım neydi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f3",
      "davranissal-aktivasyon",
      "davranışsal-aktivasyon"
    ],
    "standardTask": "İki dakikada başlayabileceğin bir davranış seç ve yalnızca iki dakika uygula.",
    "minimumTask": "Görevin yalnızca ilk 60 saniyesini yap.",
    "successMeaning": "Motivasyonu beklemeden davranış başlattın.",
    "reflectionExamples": [
      "Hazır değildim ama egzersiz için sadece iki dakika başladım; sonrasında kayganlık hissettim.",
      "Motivasyonu beklemeden 3 dk yürüdüm yaptım; başlangıç, hissettiğimden çok daha küçük bir şeymiş.",
      "Bugünün minimumu bir nefes + bir cümle idi; yaptığımda kendime 'bu da sayılır' demeyi öğrendim."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "İki dakikada başlayabileceğin bir davranış seç ve yalnızca iki dakika uygula."
  },
  {
    "day": 77,
    "phaseCode": "F3",
    "phaseTitle": "Faz 3 — Temas",
    "phaseGoal": "İhtiyaç, sınır, destek isteme, yakınlık toleransı ve onarım becerilerini uygulamak.",
    "domain": "oz-sefkat",
    "domainLabel": "Öz-şefkat",
    "quoteKind": "original_science_based",
    "quote": "Kendini affetmek, aynı hatayı savunmak değil; öğrenmeyi sürdürmektir.",
    "source": null,
    "psychologicalLens": "öz-şefkatli iç konuşma",
    "explanation": "Küçük davranış, zihne soyut motivasyondan daha güvenilir kanıt verir.",
    "reflectionQuestion": "Kendime daha adil davransaydım aynı durumda ne derdim?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f3",
      "oz-sefkat",
      "öz-şefkatli-iç-konuşma"
    ],
    "standardTask": "Sert bir iç cümleni daha adil ve uygulanabilir bir cümleye çevir.",
    "minimumTask": "Kendine söylediğin sert cümleyi fark et ve yanına daha adil bir kelime ekle.",
    "successMeaning": "Öz-eleştiriye karşı daha sürdürülebilir bir iç dil denedin.",
    "reflectionExamples": [
      "Kendime 'hiçbir işe yaramıyorsun' dediğimi fark ettim; yerine 'küçük adım da adımdır' desem daha adil ve sürdürülebilir olurdu.",
      "Aynı durumda arkadaşıma nasıl konuşurdum? Ona her gün aynı değil, kendime ise başkaları daha iyi demiştim; bugün dengeledim.",
      "Başarısızlık değil, kapasite sınırı; 'bugün bu kadar yeter' demek, daha uzun soluklu çalışmamı sağlıyor."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Sert bir iç cümleni daha adil ve uygulanabilir bir cümleye çevir."
  },
  {
    "day": 78,
    "phaseCode": "F3",
    "phaseTitle": "Faz 3 — Temas",
    "phaseGoal": "İhtiyaç, sınır, destek isteme, yakınlık toleransı ve onarım becerilerini uygulamak.",
    "domain": "belirsizlik",
    "domainLabel": "Belirsizlik toleransı",
    "quoteKind": "original_science_based",
    "quote": "Belirsizlik dayanılmaz değil; sadece pratik edilmemiş olabilir.",
    "source": null,
    "psychologicalLens": "belirsizlikle kalma",
    "explanation": "Duygu ve düşünceyi ayırmak, tepki vermeden önce seçim alanı açar.",
    "reflectionQuestion": "Bu belirsizlikle kalınca korktuğum şey gerçekten oldu mu?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f3",
      "belirsizlik",
      "belirsizlikle-kalma"
    ],
    "standardTask": "Düşük riskli bir belirsizliği 20 dakika kontrol etmeden bırak.",
    "minimumTask": "Bir kontrol davranışını yalnızca 5 dakika ertele.",
    "successMeaning": "Kontrol dürtüsünü erteledin; kaygıya yeni öğrenme alanı açtın.",
    "reflectionExamples": [
      "iş sonucu belirsizliğiyle 20 dk kalınca korktuğum en kötü senaryo gerçekleşmedi; kaygı gerçeklik değilmiş.",
      "Kontrol dürtüsünü bir saat erteledim; sonrasında kaygı kendi kendine düştü ve fark ettim ki dürtü geçici.",
      "Kesinlik aramak yerine 'şu an yeterli bilgi var mı?' diye sordum; cevap evetti, ek kontrole gerek kalmadı."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Düşük riskli bir belirsizliği 20 dakika kontrol etmeden bırak."
  },
  {
    "day": 79,
    "phaseCode": "F3",
    "phaseTitle": "Faz 3 — Temas",
    "phaseGoal": "İhtiyaç, sınır, destek isteme, yakınlık toleransı ve onarım becerilerini uygulamak.",
    "domain": "destek",
    "domainLabel": "Destek isteme",
    "quoteKind": "original_science_based",
    "quote": "Yardım istemek, ilişkinin güvenilirliğini test eden küçük bir deneydir.",
    "source": null,
    "psychologicalLens": "sosyal destek aktivasyonu",
    "explanation": "Yakınlık ve sınır birlikte çalıştığında ilişki daha az tehditkâr hale gelir.",
    "reflectionQuestion": "Destek istemek nasıl hissettirdi: riskli, rahatlatıcı, garip, nötr?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f3",
      "destek",
      "sosyal-destek-aktivasyonu"
    ],
    "standardTask": "Güvendiğin bir kişiden küçük ve somut bir destek iste.",
    "minimumTask": "Destek isteyebileceğin kişinin adını ve isteyeceğin şeyi taslak olarak yaz.",
    "successMeaning": "Destek isteme davranışının ilk basamağını görünür yaptın.",
    "reflectionExamples": [
      "karar verme konusunda bir kişiden yardım istedim; istemek utanç değil, çözüm üretmekmiş.",
      "Destek ararken 'şunu birlikte yapalım' dedim; karşı tarafın sadece dinlemesi bile yükümü hafifletti.",
      "Yalnız başa çıkmak zorunda değilim; bugün yalnızca dinleme talep ettim, bu yakınlığı güvenli kıldı."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Güvendiğin bir kişiden küçük ve somut bir destek iste."
  },
  {
    "day": 80,
    "phaseCode": "F3",
    "phaseTitle": "Faz 3 — Temas",
    "phaseGoal": "İhtiyaç, sınır, destek isteme, yakınlık toleransı ve onarım becerilerini uygulamak.",
    "domain": "sinir",
    "domainLabel": "Sınır koyma",
    "quoteKind": "original_science_based",
    "quote": "Sınır, hem sana hem karşı tarafa ne bekleyeceğini söyler.",
    "source": null,
    "psychologicalLens": "sınır netliği",
    "explanation": "Kapasiteye göre ayarlanmış hedef, sürdürülebilirlik ve öz-yeterlik için daha uygundur.",
    "reflectionQuestion": "Sınırımı söyleyince temas daha mı netleşti?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f3",
      "sinir",
      "sınır-netliği"
    ],
    "standardTask": "Bir sınır cümlesi kur: 'Şu an ... yapacağım; ... zamanda döneceğim.'",
    "minimumTask": "Koymak istediğin sınırı göndermeden önce tek cümleyle taslaklaştır.",
    "successMeaning": "Sınırı kopmadan ve cezalandırmadan ifade etmeye yaklaştın.",
    "reflectionExamples": [
      "dijital erişim durumunda 'şu sınır benim için önemli' dedim; sert değil, net bir çerçeve kurmak rahatlattı.",
      "Hayır demek önce panik, sonra rahatlama getirdi; karşı taraf soru sordu, ben sınırımda kaldım.",
      "Sınırımı açıkça söyleyince suçluluk hissettim ama uzun vadede daha net hissettim."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bir sınır cümlesi kur: 'Şu an ... yapacağım; ... zamanda döneceğim.'"
  },
  {
    "day": 81,
    "phaseCode": "F3",
    "phaseTitle": "Faz 3 — Temas",
    "phaseGoal": "İhtiyaç, sınır, destek isteme, yakınlık toleransı ve onarım becerilerini uygulamak.",
    "domain": "onarim",
    "domainLabel": "İlişki onarımı",
    "quoteKind": "original_science_based",
    "quote": "İlişkiyi onaran şey kusursuzluk değil, geri dönme kapasitesidir.",
    "source": null,
    "psychologicalLens": "ilişki onarımı",
    "explanation": "Bu günün amacı otomatik savunmayı suçlamak değil, onu fark edip daha esnek bir seçenek üretmektir.",
    "reflectionQuestion": "Onarım denemem ilişkiye hangi yeni bilgiyi ekledi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f3",
      "onarim",
      "ilişki-onarımı"
    ],
    "standardTask": "Uzaklaştığın bir kişiye açıklama taslağı yaz: 'Geri çekildim çünkü ...'",
    "minimumTask": "Onarım cümlesini göndermeden yalnızca notlara yaz.",
    "successMeaning": "Uzaklaşma yerine onarım seçeneğini zihinde erişilebilir yaptın.",
    "reflectionExamples": [
      "iş arkadaşımla yaşanan geciken bir cevap sonrası 'tekrar dinlemek isterim' dedim; onarım büyük jest değil, küçük ve samimi adım.",
      "Özür yerine açıklama ve 'daha dikkatli olacağım' sundum; ilişkideki gerilim açık konuşunca azaldı.",
      "Onarım denemem daha net konuşmama yardım etti; denemek, mükemmel olmaktan daha değerli."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Uzaklaştığın bir kişiye açıklama taslağı yaz: 'Geri çekildim çünkü ...'"
  },
  {
    "day": 82,
    "phaseCode": "F3",
    "phaseTitle": "Faz 3 — Temas",
    "phaseGoal": "İhtiyaç, sınır, destek isteme, yakınlık toleransı ve onarım becerilerini uygulamak.",
    "domain": "yakinlik",
    "domainLabel": "Yakınlık toleransı",
    "quoteKind": "original_science_based",
    "quote": "Yakınlık ihtiyacını yok saymak, onu ortadan kaldırmaz; sadece dolaylı hale getirir.",
    "source": null,
    "psychologicalLens": "kademeli yakınlık",
    "explanation": "Küçük davranış, zihne soyut motivasyondan daha güvenilir kanıt verir.",
    "reflectionQuestion": "Yakınlık dozu bana fazla mı geldi, yoksa yönetilebilir miydi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f3",
      "yakinlik",
      "kademeli-yakınlık"
    ],
    "standardTask": "Normalde saklayacağın küçük bir doğruyu güvenli bir kişiye söyle.",
    "minimumTask": "Güvenli bir kişiye söyleyebileceğin yüzde beşlik açıklık cümlesini yaz.",
    "successMeaning": "Tam kapanma yerine güvenli dozda temas ihtimalini artırdın.",
    "reflectionExamples": [
      "Yakınlık anında çekilme isteği geldi; bu sefer 1 dk kadar kaldım ve panik azaldı.",
      "yakın arkadaşım ile sarılma anında 'buradayım' demek, uzaklaşmaktan daha güvenli hissettirdi.",
      "Yakınlığa maruz kalınca bedenim gerildi yaptı; nefes alıp kalmak, duygu geçene kadar yeterliymiş."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Normalde saklayacağın küçük bir doğruyu güvenli bir kişiye söyle."
  },
  {
    "day": 83,
    "phaseCode": "F3",
    "phaseTitle": "Faz 3 — Temas",
    "phaseGoal": "İhtiyaç, sınır, destek isteme, yakınlık toleransı ve onarım becerilerini uygulamak.",
    "domain": "enerji",
    "domainLabel": "Enerji yönetimi",
    "quoteKind": "original_science_based",
    "quote": "Bugünkü düşük tempo, uzun vadeli ilerlemeyi iptal etmez.",
    "source": null,
    "psychologicalLens": "kapasiteye göre hedefleme",
    "explanation": "Duygu ve düşünceyi ayırmak, tepki vermeden önce seçim alanı açar.",
    "reflectionQuestion": "Hedefi küçültmek ilerlemeyi artırdı mı azalttı mı?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f3",
      "enerji",
      "kapasiteye-göre-hedefleme"
    ],
    "standardTask": "Enerjini 0–10 puanla; bugünkü hedefini bu puana göre küçült.",
    "minimumTask": "Enerjini 0–10 arasında puanla ve hedefi bir kademe küçült.",
    "successMeaning": "Kapasiteye göre hedef ayarladın; sürdürülebilirliği korudun.",
    "reflectionExamples": [
      "Bugün enerjim düşük idi; su ve ışık yapınca düşüş yavaşladı ve daha sürdürülebilir çalıştım.",
      "İrade değil ritim; 10 dk mola verince odaklanmam geri geldi, kendimi suçlamadım.",
      "Yüksek enerjili saatlerimi iletişim için, düşüklerini dinlenme için kullandım; verim değil, denge önemli."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Enerjini 0–10 puanla; bugünkü hedefini bu puana göre küçült."
  },
  {
    "day": 84,
    "phaseCode": "F3",
    "phaseTitle": "Faz 3 — Temas",
    "phaseGoal": "İhtiyaç, sınır, destek isteme, yakınlık toleransı ve onarım becerilerini uygulamak.",
    "domain": "deger",
    "domainLabel": "Değer odaklılık",
    "quoteKind": "original_science_based",
    "quote": "Zor günde değerli davranış daha küçük olur; yine de değerlidir.",
    "source": null,
    "psychologicalLens": "değer temelli davranış",
    "explanation": "Yakınlık ve sınır birlikte çalıştığında ilişki daha az tehditkâr hale gelir.",
    "reflectionQuestion": "Bugünkü davranışım uzun vadede hangi kişiye dönüşmeme yardım ediyor?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f3",
      "deger",
      "değer-temelli-davranış"
    ],
    "standardTask": "Bugün yaptığın tek davranışın hangi değere hizmet ettiğini yaz.",
    "minimumTask": "Bugün korumak istediğin değeri tek kelimeyle yaz.",
    "successMeaning": "Duygu durumdan bağımsız olarak yönünü değerle bağladın.",
    "reflectionExamples": [
      "Bugün sabır değerime hizmet eden eylem: kendimi dinledim; uzun hedef değil, bugünkü seçim önemli.",
      "rekabet anında değerim sabır olduğunu hatırladım; bu, seçimi kolaylaştırdı.",
      "Davranışım (sınır koydum) ile yakınlık arasındaki bağ kurunca motivasyonum içsel."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bugün yaptığın tek davranışın hangi değere hizmet ettiğini yaz."
  },
  {
    "day": 85,
    "phaseCode": "F3",
    "phaseTitle": "Faz 3 — Temas",
    "phaseGoal": "İhtiyaç, sınır, destek isteme, yakınlık toleransı ve onarım becerilerini uygulamak.",
    "domain": "farkindalik",
    "domainLabel": "Farkındalık",
    "quoteKind": "original_science_based",
    "quote": "İçindeki savunma sistemine düşman olma; onu güncellemeye çalış.",
    "source": null,
    "psychologicalLens": "otomatik tepkiyi yavaşlatma",
    "explanation": "Kapasiteye göre ayarlanmış hedef, sürdürülebilirlik ve öz-yeterlik için daha uygundur.",
    "reflectionQuestion": "Bu tepki beni gerçekten korudu mu, yoksa yalnızca teması mı erteledi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f3",
      "farkindalik",
      "otomatik-tepkiyi-yavaşlatma"
    ],
    "standardTask": "Bugün geri çekilmek istediğin bir anda 90 saniye dur ve dürtünün adını yaz.",
    "minimumTask": "Geri çekilme veya otomatik tepkiyle ilgili yalnızca bir kelime yaz.",
    "successMeaning": "Otomatik tepkiyi fark ettin; bu, değişim için ilk davranış verisidir.",
    "reflectionExamples": [
      "Bugün düşünce döngüsü anında bir nefes durup fark ettim; vücudumda duraklama hissettim, hemen tepki vermek zorunda değilmişim.",
      "Dürtü geldiğinde fark ettim ki aslında alt duygu hissediyordum; sadece durup adlandırmak yoğunluğu azalttı.",
      "kapatma yapmadan önce kendime 'şu anda ne oluyor?' diye sordum; bu küçük duruş, seçim alanı açmak için bir veri."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bugün geri çekilmek istediğin bir anda 90 saniye dur ve dürtünün adını yaz."
  },
  {
    "day": 86,
    "phaseCode": "F3",
    "phaseTitle": "Faz 3 — Temas",
    "phaseGoal": "İhtiyaç, sınır, destek isteme, yakınlık toleransı ve onarım becerilerini uygulamak.",
    "domain": "duygu-adlandirma",
    "domainLabel": "Duygu adlandırma",
    "quoteKind": "original_science_based",
    "quote": "Hislerini anlatmak için onları tamamen anlamış olman gerekmez.",
    "source": null,
    "psychologicalLens": "duygu ayrıştırma",
    "explanation": "Bu günün amacı otomatik savunmayı suçlamak değil, onu fark edip daha esnek bir seçenek üretmektir.",
    "reflectionQuestion": "Şu an hissettiğim şeyin en doğru adı ne?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f3",
      "duygu-adlandirma",
      "duygu-ayrıştırma"
    ],
    "standardTask": "Bugünün baskın duygusunu üç düzeyde yaz: görünen duygu, alttaki duygu, bedendeki his.",
    "minimumTask": "Bugünkü baskın duygunu tek kelimeyle adlandır.",
    "successMeaning": "Duyguyu adlandırdın; belirsiz iç basıncı daha yönetilebilir hâle getirdin.",
    "reflectionExamples": [
      "Bugün görünürde kaygı hissediyordum ama altında suçluluk vardı; göğsümde ağırlık fark ettim.",
      "Duyguyu sadece 'kötü' değil, 'yalnızlık' diye adlandırınca daha yönetilebilir geldi; zihnim 'hâlâ güvensiz' dedi.",
      "Üç katman yazdım: dışta öfke, ortada çaresizlik, bedende ağırlık; bu ayrıştırma panik hissini durdurdu."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bugünün baskın duygusunu üç düzeyde yaz: görünen duygu, alttaki duygu, bedendeki his."
  },
  {
    "day": 87,
    "phaseCode": "F3",
    "phaseTitle": "Faz 3 — Temas",
    "phaseGoal": "İhtiyaç, sınır, destek isteme, yakınlık toleransı ve onarım becerilerini uygulamak.",
    "domain": "bilissel-mesafe",
    "domainLabel": "Bilişsel mesafe",
    "quoteKind": "original_science_based",
    "quote": "Bir düşünceyi not etmek, onunla birleşmek yerine onu dışarı almaktır.",
    "source": null,
    "psychologicalLens": "bilişsel ayrışma",
    "explanation": "Küçük davranış, zihne soyut motivasyondan daha güvenilir kanıt verir.",
    "reflectionQuestion": "Bu düşünceye yüzde kaç inanıyorum ve hangi kanıt eksik?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f3",
      "bilissel-mesafe",
      "bilişsel-ayrışma"
    ],
    "standardTask": "Zorlayan düşüncenin başına şu ifadeyi ekle: 'Zihnim şu anda bana ... diyor.'",
    "minimumTask": "Zorlayan düşünceni 'Zihnim şu anda bana ... diyor' kalıbıyla bir cümleye çevir.",
    "successMeaning": "Düşünceyle arana mesafe koydun; onu gerçek değil veri olarak ele aldın.",
    "reflectionExamples": [
      "Zihnim 'daha iyi hissetmem lazım' diyordu; başına 'zihnim şu anda bana ... diyor' ekleyince gerçekliği azaldı.",
      "Bu düşünceye %80 inanıyordum ama kanıt listelediğimde dış etkenler eksik olduğunu gördüm.",
      "Düşünceyi bir cümle olarak yazıp okudum; aynı cümle tekrarlanınca bir 'veri parçası' gibi durdu."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Zorlayan düşüncenin başına şu ifadeyi ekle: 'Zihnim şu anda bana ... diyor.'"
  },
  {
    "day": 88,
    "phaseCode": "F3",
    "phaseTitle": "Faz 3 — Temas",
    "phaseGoal": "İhtiyaç, sınır, destek isteme, yakınlık toleransı ve onarım becerilerini uygulamak.",
    "domain": "davranissal-aktivasyon",
    "domainLabel": "Davranışsal aktivasyon",
    "quoteKind": "original_science_based",
    "quote": "İki dakikalık düzenleme, iki saatlik kaçınmanın önüne geçebilir.",
    "source": null,
    "psychologicalLens": "davranışsal aktivasyon",
    "explanation": "Duygu ve düşünceyi ayırmak, tepki vermeden önce seçim alanı açar.",
    "reflectionQuestion": "En küçük uygulanabilir adım neydi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f3",
      "davranissal-aktivasyon",
      "davranışsal-aktivasyon"
    ],
    "standardTask": "İki dakikada başlayabileceğin bir davranış seç ve yalnızca iki dakika uygula.",
    "minimumTask": "Görevin yalnızca ilk 60 saniyesini yap.",
    "successMeaning": "Motivasyonu beklemeden davranış başlattın.",
    "reflectionExamples": [
      "Hazır değildim ama egzersiz için sadece iki dakika başladım; sonrasında devam etmek istedim.",
      "Motivasyonu beklemeden bir başlık açtım yaptım; başlangıç, hissettiğimden çok daha küçük bir şeymiş.",
      "Bugünün minimumu 1 dk başlangıç idi; yaptığımda kendime 'bu da sayılır' demeyi öğrendim."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "İki dakikada başlayabileceğin bir davranış seç ve yalnızca iki dakika uygula."
  },
  {
    "day": 89,
    "phaseCode": "F3",
    "phaseTitle": "Faz 3 — Temas",
    "phaseGoal": "İhtiyaç, sınır, destek isteme, yakınlık toleransı ve onarım becerilerini uygulamak.",
    "domain": "oz-sefkat",
    "domainLabel": "Öz-şefkat",
    "quoteKind": "original_science_based",
    "quote": "Öz-eleştiri seni harekete geçirmiyorsa, sadece yormaya başlamıştır.",
    "source": null,
    "psychologicalLens": "öz-şefkatli iç konuşma",
    "explanation": "Yakınlık ve sınır birlikte çalıştığında ilişki daha az tehditkâr hale gelir.",
    "reflectionQuestion": "Kendime daha adil davransaydım aynı durumda ne derdim?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f3",
      "oz-sefkat",
      "öz-şefkatli-iç-konuşma"
    ],
    "standardTask": "Sert bir iç cümleni daha adil ve uygulanabilir bir cümleye çevir.",
    "minimumTask": "Kendine söylediğin sert cümleyi fark et ve yanına daha adil bir kelime ekle.",
    "successMeaning": "Öz-eleştiriye karşı daha sürdürülebilir bir iç dil denedin.",
    "reflectionExamples": [
      "Kendime 'hiçbir işe yaramıyorsun' dediğimi fark ettim; yerine 'bugün zordu, yeterince çabaladım' desem daha adil ve sürdürülebilir olurdu.",
      "Aynı durumda arkadaşıma nasıl konuşurdum? Ona kendine zaman ver, kendime ise neden bu kadar yavaşsın demiştim; bugün dengeledim.",
      "Başarısızlık değil, kapasite sınırı; 'bugün bu kadar yeter' demek, daha uzun soluklu çalışmamı sağlıyor."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Sert bir iç cümleni daha adil ve uygulanabilir bir cümleye çevir."
  },
  {
    "day": 90,
    "phaseCode": "F3",
    "phaseTitle": "Faz 3 — Temas",
    "phaseGoal": "İhtiyaç, sınır, destek isteme, yakınlık toleransı ve onarım becerilerini uygulamak.",
    "domain": "belirsizlik",
    "domainLabel": "Belirsizlik toleransı",
    "quoteKind": "original_science_based",
    "quote": "Kaygının istediği garanti ile hayatın verebildiği bilgi aynı şey olmayabilir.",
    "source": null,
    "psychologicalLens": "belirsizlikle kalma",
    "explanation": "Kapasiteye göre ayarlanmış hedef, sürdürülebilirlik ve öz-yeterlik için daha uygundur.",
    "reflectionQuestion": "Bu belirsizlikle kalınca korktuğum şey gerçekten oldu mu?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f3",
      "belirsizlik",
      "belirsizlikle-kalma"
    ],
    "standardTask": "Düşük riskli bir belirsizliği 20 dakika kontrol etmeden bırak.",
    "minimumTask": "Bir kontrol davranışını yalnızca 5 dakika ertele.",
    "successMeaning": "Kontrol dürtüsünü erteledin; kaygıya yeni öğrenme alanı açtın.",
    "reflectionExamples": [
      "bir mesajın cevabı belirsizliğiyle 20 dk kalınca korktuğum reddedilme gerçekleşmedi; kaygı gerçeklik değilmiş.",
      "Kontrol dürtüsünü bir saat erteledim; sonrasında dürtü geçti ve fark ettim ki dürtü geçici.",
      "Kesinlik aramak yerine 'şu an yeterli bilgi var mı?' diye sordum; cevap evetti, ek kontrole gerek kalmadı."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Düşük riskli bir belirsizliği 20 dakika kontrol etmeden bırak."
  },
  {
    "day": 91,
    "phaseCode": "F4",
    "phaseTitle": "Faz 4 — Pekiştirme",
    "phaseGoal": "Yeni davranışı tekrar, değer, takip ve ilişki güvenliğiyle kalıcılaştırmak.",
    "domain": "destek",
    "domainLabel": "Destek isteme",
    "quoteKind": "original_science_based",
    "quote": "İhtiyacını söylemek, karşı tarafı suçlamak zorunda değildir.",
    "source": null,
    "psychologicalLens": "sosyal destek aktivasyonu",
    "explanation": "Bu günün amacı otomatik savunmayı suçlamak değil, onu fark edip daha esnek bir seçenek üretmektir.",
    "reflectionQuestion": "Destek istemek nasıl hissettirdi: riskli, rahatlatıcı, garip, nötr?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f4",
      "destek",
      "sosyal-destek-aktivasyonu"
    ],
    "standardTask": "Güvendiğin bir kişiden küçük ve somut bir destek iste.",
    "minimumTask": "Destek isteyebileceğin kişinin adını ve isteyeceğin şeyi taslak olarak yaz.",
    "successMeaning": "Destek isteme davranışının ilk basamağını görünür yaptın.",
    "reflectionExamples": [
      "duygusal bir yük konusunda bir kişiden yardım istedim; istemek utanç değil, çözüm üretmekmiş.",
      "Destek ararken 'şunu birlikte yapalım' dedim; karşı tarafın sadece dinlemesi bile yükümü hafifletti.",
      "Yalnız başa çıkmak zorunda değilim; bugün fikir talep ettim, bu yakınlığı güvenli kıldı."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Güvendiğin bir kişiden küçük ve somut bir destek iste."
  },
  {
    "day": 92,
    "phaseCode": "F4",
    "phaseTitle": "Faz 4 — Pekiştirme",
    "phaseGoal": "Yeni davranışı tekrar, değer, takip ve ilişki güvenliğiyle kalıcılaştırmak.",
    "domain": "sinir",
    "domainLabel": "Sınır koyma",
    "quoteKind": "original_science_based",
    "quote": "Sağlıklı sınır, açıklık ve mesafenin birlikte var olabildiği yerdir.",
    "source": null,
    "psychologicalLens": "sınır netliği",
    "explanation": "Küçük davranış, zihne soyut motivasyondan daha güvenilir kanıt verir.",
    "reflectionQuestion": "Sınırımı söyleyince temas daha mı netleşti?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f4",
      "sinir",
      "sınır-netliği"
    ],
    "standardTask": "Bir sınır cümlesi kur: 'Şu an ... yapacağım; ... zamanda döneceğim.'",
    "minimumTask": "Koymak istediğin sınırı göndermeden önce tek cümleyle taslaklaştır.",
    "successMeaning": "Sınırı kopmadan ve cezalandırmadan ifade etmeye yaklaştın.",
    "reflectionExamples": [
      "dijital erişim durumunda 'bugün bunu yapamam' dedim; sert değil, net bir çerçeve kurmak rahatlattı.",
      "Hayır demek önce panik, sonra rahatlama getirdi; karşı taraf soru sordu, ben sınırımda kaldım.",
      "Sınırımı açıkça söyleyince suçluluk hissettim ama uzun vadede daha az çatışma fark ettim."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bir sınır cümlesi kur: 'Şu an ... yapacağım; ... zamanda döneceğim.'"
  },
  {
    "day": 93,
    "phaseCode": "F4",
    "phaseTitle": "Faz 4 — Pekiştirme",
    "phaseGoal": "Yeni davranışı tekrar, değer, takip ve ilişki güvenliğiyle kalıcılaştırmak.",
    "domain": "onarim",
    "domainLabel": "İlişki onarımı",
    "quoteKind": "original_science_based",
    "quote": "Kısa bir özür ya da açıklama, uzun bir soğukluktan daha az maliyetlidir.",
    "source": null,
    "psychologicalLens": "ilişki onarımı",
    "explanation": "Duygu ve düşünceyi ayırmak, tepki vermeden önce seçim alanı açar.",
    "reflectionQuestion": "Onarım denemem ilişkiye hangi yeni bilgiyi ekledi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f4",
      "onarim",
      "ilişki-onarımı"
    ],
    "standardTask": "Uzaklaştığın bir kişiye açıklama taslağı yaz: 'Geri çekildim çünkü ...'",
    "minimumTask": "Onarım cümlesini göndermeden yalnızca notlara yaz.",
    "successMeaning": "Uzaklaşma yerine onarım seçeneğini zihinde erişilebilir yaptın.",
    "reflectionExamples": [
      "iş arkadaşımla yaşanan geciken bir cevap sonrası 'tekrar dinlemek isterim' dedim; onarım büyük jest değil, küçük ve samimi adım.",
      "Özür yerine açıklama ve 'birlikte bir çözüm bulalım' sundum; ilişkideki gerilim açık konuşunca azaldı.",
      "Onarım denemem daha net konuşmama yardım etti; denemek, mükemmel olmaktan daha değerli."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Uzaklaştığın bir kişiye açıklama taslağı yaz: 'Geri çekildim çünkü ...'"
  },
  {
    "day": 94,
    "phaseCode": "F4",
    "phaseTitle": "Faz 4 — Pekiştirme",
    "phaseGoal": "Yeni davranışı tekrar, değer, takip ve ilişki güvenliğiyle kalıcılaştırmak.",
    "domain": "yakinlik",
    "domainLabel": "Yakınlık toleransı",
    "quoteKind": "original_science_based",
    "quote": "Yakınlıkta güven, tek büyük itirafla değil küçük tutarlı temaslarla kurulur.",
    "source": null,
    "psychologicalLens": "kademeli yakınlık",
    "explanation": "Yakınlık ve sınır birlikte çalıştığında ilişki daha az tehditkâr hale gelir.",
    "reflectionQuestion": "Yakınlık dozu bana fazla mı geldi, yoksa yönetilebilir miydi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f4",
      "yakinlik",
      "kademeli-yakınlık"
    ],
    "standardTask": "Normalde saklayacağın küçük bir doğruyu güvenli bir kişiye söyle.",
    "minimumTask": "Güvenli bir kişiye söyleyebileceğin yüzde beşlik açıklık cümlesini yaz.",
    "successMeaning": "Tam kapanma yerine güvenli dozda temas ihtimalini artırdın.",
    "reflectionExamples": [
      "Yakınlık anında çekilme isteği geldi; bu sefer birkaç nefes kadar kaldım ve panik aynı kaldı ama katlanabilirdi.",
      "eşim ile sarılma anında 'buradayım' demek, uzaklaşmaktan daha güvenli hissettirdi.",
      "Yakınlığa maruz kalınca bedenim nefes hızlandı yaptı; nefes alıp kalmak, duygu geçene kadar yeterliymiş."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Normalde saklayacağın küçük bir doğruyu güvenli bir kişiye söyle."
  },
  {
    "day": 95,
    "phaseCode": "F4",
    "phaseTitle": "Faz 4 — Pekiştirme",
    "phaseGoal": "Yeni davranışı tekrar, değer, takip ve ilişki güvenliğiyle kalıcılaştırmak.",
    "domain": "enerji",
    "domainLabel": "Enerji yönetimi",
    "quoteKind": "original_science_based",
    "quote": "Bugün kendine bakım davranışını lüks değil bakım verisi olarak gör.",
    "source": null,
    "psychologicalLens": "kapasiteye göre hedefleme",
    "explanation": "Kapasiteye göre ayarlanmış hedef, sürdürülebilirlik ve öz-yeterlik için daha uygundur.",
    "reflectionQuestion": "Hedefi küçültmek ilerlemeyi artırdı mı azalttı mı?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f4",
      "enerji",
      "kapasiteye-göre-hedefleme"
    ],
    "standardTask": "Enerjini 0–10 puanla; bugünkü hedefini bu puana göre küçült.",
    "minimumTask": "Enerjini 0–10 arasında puanla ve hedefi bir kademe küçült.",
    "successMeaning": "Kapasiteye göre hedef ayarladın; sürdürülebilirliği korudun.",
    "reflectionExamples": [
      "Bugün enerjim dalgalı idi; 10 dk yürüyüş yapınca düşüş yavaşladı ve daha sürdürülebilir çalıştım.",
      "İrade değil ritim; nefes mola verince odaklanmam geri geldi, kendimi suçlamadım.",
      "Yüksek enerjili saatlerimi iletişim için, düşüklerini admin için kullandım; verim değil, denge önemli."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Enerjini 0–10 puanla; bugünkü hedefini bu puana göre küçült."
  },
  {
    "day": 96,
    "phaseCode": "F4",
    "phaseTitle": "Faz 4 — Pekiştirme",
    "phaseGoal": "Yeni davranışı tekrar, değer, takip ve ilişki güvenliğiyle kalıcılaştırmak.",
    "domain": "deger",
    "domainLabel": "Değer odaklılık",
    "quoteKind": "original_science_based",
    "quote": "Sonuçları değil, seçtiğin küçük davranışı sahiplen.",
    "source": null,
    "psychologicalLens": "değer temelli davranış",
    "explanation": "Bu günün amacı otomatik savunmayı suçlamak değil, onu fark edip daha esnek bir seçenek üretmektir.",
    "reflectionQuestion": "Bugünkü davranışım uzun vadede hangi kişiye dönüşmeme yardım ediyor?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f4",
      "deger",
      "değer-temelli-davranış"
    ],
    "standardTask": "Bugün yaptığın tek davranışın hangi değere hizmet ettiğini yaz.",
    "minimumTask": "Bugün korumak istediğin değeri tek kelimeyle yaz.",
    "successMeaning": "Duygu durumdan bağımsız olarak yönünü değerle bağladın.",
    "reflectionExamples": [
      "Bugün yakınlık değerime hizmet eden eylem: sınır koydum; uzun hedef değil, bugünkü seçim önemli.",
      "zor bir seçim anında değerim üretkenlik olduğunu hatırladım; bu, seçimi kolaylaştırdı.",
      "Davranışım (kendimi dinledim) ile dürüstlük arasındaki bağ kurunca motivasyonum içsel."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bugün yaptığın tek davranışın hangi değere hizmet ettiğini yaz."
  },
  {
    "day": 97,
    "phaseCode": "F4",
    "phaseTitle": "Faz 4 — Pekiştirme",
    "phaseGoal": "Yeni davranışı tekrar, değer, takip ve ilişki güvenliğiyle kalıcılaştırmak.",
    "domain": "farkindalik",
    "domainLabel": "Farkındalık",
    "quoteKind": "original_science_based",
    "quote": "Bir an durmak, kaçmak değildir; seçmek için alan açmaktır.",
    "source": null,
    "psychologicalLens": "otomatik tepkiyi yavaşlatma",
    "explanation": "Küçük davranış, zihne soyut motivasyondan daha güvenilir kanıt verir.",
    "reflectionQuestion": "Bu tepki beni gerçekten korudu mu, yoksa yalnızca teması mı erteledi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f4",
      "farkindalik",
      "otomatik-tepkiyi-yavaşlatma"
    ],
    "standardTask": "Bugün geri çekilmek istediğin bir anda 90 saniye dur ve dürtünün adını yaz.",
    "minimumTask": "Geri çekilme veya otomatik tepkiyle ilgili yalnızca bir kelime yaz.",
    "successMeaning": "Otomatik tepkiyi fark ettin; bu, değişim için ilk davranış verisidir.",
    "reflectionExamples": [
      "Bugün geri çekilme isteği geldiğinde 90 sn durdum; vücudumda gerilme fark ettim, hemen tepki vermek zorunda değilmişim.",
      "Dürtü anında altımda korku olduğunu gördüm; sadece 'kaygı' diye adlandırmak yoğunluğu biraz azalttı.",
      "Cevap vermeden önce 'şu anda zihnim ne diyor?' diye sordum; bu duruş, dürtüyü veri olarak görmek için yeterliydi."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bugün geri çekilmek istediğin bir anda 90 saniye dur ve dürtünün adını yaz."
  },
  {
    "day": 98,
    "phaseCode": "F4",
    "phaseTitle": "Faz 4 — Pekiştirme",
    "phaseGoal": "Yeni davranışı tekrar, değer, takip ve ilişki güvenliğiyle kalıcılaştırmak.",
    "domain": "duygu-adlandirma",
    "domainLabel": "Duygu adlandırma",
    "quoteKind": "original_science_based",
    "quote": "Duygunun geçmesini beklemek yerine, duygu varken güvenli davranmayı öğren.",
    "source": null,
    "psychologicalLens": "duygu ayrıştırma",
    "explanation": "Duygu ve düşünceyi ayırmak, tepki vermeden önce seçim alanı açar.",
    "reflectionQuestion": "Şu an hissettiğim şeyin en doğru adı ne?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f4",
      "duygu-adlandirma",
      "duygu-ayrıştırma"
    ],
    "standardTask": "Bugünün baskın duygusunu üç düzeyde yaz: görünen duygu, alttaki duygu, bedendeki his.",
    "minimumTask": "Bugünkü baskın duygunu tek kelimeyle adlandır.",
    "successMeaning": "Duyguyu adlandırdın; belirsiz iç basıncı daha yönetilebilir hâle getirdin.",
    "reflectionExamples": [
      "Bugün görünürde bunalım hissediyordum ama altında yalnızlık vardı; göğsümde sıkışma fark ettim.",
      "Duyguyu sadece 'kötü' değil, 'yalnızlık' diye adlandırınca daha yönetilebilir geldi; zihnim 'hâlâ güvensiz' dedi.",
      "Üç katman yazdım: dışta kaygı, ortada suçluluk, bedende sıkışma; bu ayrıştırma panik hissini durdurdu."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bugünün baskın duygusunu üç düzeyde yaz: görünen duygu, alttaki duygu, bedendeki his."
  },
  {
    "day": 99,
    "phaseCode": "F4",
    "phaseTitle": "Faz 4 — Pekiştirme",
    "phaseGoal": "Yeni davranışı tekrar, değer, takip ve ilişki güvenliğiyle kalıcılaştırmak.",
    "domain": "bilissel-mesafe",
    "domainLabel": "Bilişsel mesafe",
    "quoteKind": "original_science_based",
    "quote": "Zihninin anlattığı hikâyeyi dinle; ama tek anlatıcı o olmasın.",
    "source": null,
    "psychologicalLens": "bilişsel ayrışma",
    "explanation": "Yakınlık ve sınır birlikte çalıştığında ilişki daha az tehditkâr hale gelir.",
    "reflectionQuestion": "Bu düşünceye yüzde kaç inanıyorum ve hangi kanıt eksik?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f4",
      "bilissel-mesafe",
      "bilişsel-ayrışma"
    ],
    "standardTask": "Zorlayan düşüncenin başına şu ifadeyi ekle: 'Zihnim şu anda bana ... diyor.'",
    "minimumTask": "Zorlayan düşünceni 'Zihnim şu anda bana ... diyor' kalıbıyla bir cümleye çevir.",
    "successMeaning": "Düşünceyle arana mesafe koydun; onu gerçek değil veri olarak ele aldın.",
    "reflectionExamples": [
      "Zihnim 'daha iyi hissetmem lazım' diyordu; başına 'zihnim şu anda bana ... diyor' ekleyince gerçekliği azaldı.",
      "Bu düşünceye %60 inanıyordum ama kanıt listelediğimde dış etkenler eksik olduğunu gördüm.",
      "Düşünceyi bir cümle olarak yazıp okudum; aynı cümle tekrarlanınca bir 'veri parçası' gibi durdu."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Zorlayan düşüncenin başına şu ifadeyi ekle: 'Zihnim şu anda bana ... diyor.'"
  },
  {
    "day": 100,
    "phaseCode": "F4",
    "phaseTitle": "Faz 4 — Pekiştirme",
    "phaseGoal": "Yeni davranışı tekrar, değer, takip ve ilişki güvenliğiyle kalıcılaştırmak.",
    "domain": "davranissal-aktivasyon",
    "domainLabel": "Davranışsal aktivasyon",
    "quoteKind": "original_science_based",
    "quote": "Başaramadığın günü telafi etmeye çalışma; ertesi davranışı küçült ve sürdür.",
    "source": null,
    "psychologicalLens": "davranışsal aktivasyon",
    "explanation": "Kapasiteye göre ayarlanmış hedef, sürdürülebilirlik ve öz-yeterlik için daha uygundur.",
    "reflectionQuestion": "En küçük uygulanabilir adım neydi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f4",
      "davranissal-aktivasyon",
      "davranışsal-aktivasyon"
    ],
    "standardTask": "İki dakikada başlayabileceğin bir davranış seç ve yalnızca iki dakika uygula.",
    "minimumTask": "Görevin yalnızca ilk 60 saniyesini yap.",
    "successMeaning": "Motivasyonu beklemeden davranış başlattın.",
    "reflectionExamples": [
      "Hazır değildim ama egzersiz için sadece iki dakika başladım; sonrasında kayganlık hissettim.",
      "Motivasyonu beklemeden bir cümle yazdım; başlangıç, hissettiğimden çok daha küçük bir şeymiş.",
      "Bugünün minimumu ilk adımı yazmak idi; yaptığımda kendime 'bu da sayılır' demeyi öğrendim."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "İki dakikada başlayabileceğin bir davranış seç ve yalnızca iki dakika uygula."
  },
  {
    "day": 101,
    "phaseCode": "F4",
    "phaseTitle": "Faz 4 — Pekiştirme",
    "phaseGoal": "Yeni davranışı tekrar, değer, takip ve ilişki güvenliğiyle kalıcılaştırmak.",
    "domain": "oz-sefkat",
    "domainLabel": "Öz-şefkat",
    "quoteKind": "original_science_based",
    "quote": "Kendine saygı bazen daha çok zorlamak değil, doğru dozu seçmektir.",
    "source": null,
    "psychologicalLens": "öz-şefkatli iç konuşma",
    "explanation": "Bu günün amacı otomatik savunmayı suçlamak değil, onu fark edip daha esnek bir seçenek üretmektir.",
    "reflectionQuestion": "Kendime daha adil davransaydım aynı durumda ne derdim?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f4",
      "oz-sefkat",
      "öz-şefkatli-iç-konuşma"
    ],
    "standardTask": "Sert bir iç cümleni daha adil ve uygulanabilir bir cümleye çevir.",
    "minimumTask": "Kendine söylediğin sert cümleyi fark et ve yanına daha adil bir kelime ekle.",
    "successMeaning": "Öz-eleştiriye karşı daha sürdürülebilir bir iç dil denedin.",
    "reflectionExamples": [
      "Kendime 'hiçbir işe yaramıyorsun' dediğimi fark ettim; yerine 'küçük adım da adımdır' desem daha adil ve sürdürülebilir olurdu.",
      "Aynı durumda arkadaşıma nasıl konuşurdum? Ona sabırlı ol, kendime ise hiçbir işe yaramıyorsun demiştim; bugün dengeledim.",
      "Başarısızlık değil, kapasite sınırı; 'bugün bu kadar yeter' demek, daha uzun soluklu çalışmamı sağlıyor."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Sert bir iç cümleni daha adil ve uygulanabilir bir cümleye çevir."
  },
  {
    "day": 102,
    "phaseCode": "F4",
    "phaseTitle": "Faz 4 — Pekiştirme",
    "phaseGoal": "Yeni davranışı tekrar, değer, takip ve ilişki güvenliğiyle kalıcılaştırmak.",
    "domain": "belirsizlik",
    "domainLabel": "Belirsizlik toleransı",
    "quoteKind": "original_science_based",
    "quote": "Kontrol edemediklerini bırakmak, umursamamak değil; enerjiyi korumaktır.",
    "source": null,
    "psychologicalLens": "belirsizlikle kalma",
    "explanation": "Küçük davranış, zihne soyut motivasyondan daha güvenilir kanıt verir.",
    "reflectionQuestion": "Bu belirsizlikle kalınca korktuğum şey gerçekten oldu mu?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f4",
      "belirsizlik",
      "belirsizlikle-kalma"
    ],
    "standardTask": "Düşük riskli bir belirsizliği 20 dakika kontrol etmeden bırak.",
    "minimumTask": "Bir kontrol davranışını yalnızca 5 dakika ertele.",
    "successMeaning": "Kontrol dürtüsünü erteledin; kaygıya yeni öğrenme alanı açtın.",
    "reflectionExamples": [
      "sağlık belirtisi belirsizliğiyle 20 dk kalınca korktuğum en kötü senaryo gerçekleşmedi; kaygı gerçeklik değilmiş.",
      "Kontrol dürtüsünü bir saat erteledim; sonrasında kaygı kendi kendine düştü ve fark ettim ki dürtü geçici.",
      "Kesinlik aramak yerine 'şu an yeterli bilgi var mı?' diye sordum; cevap evetti, ek kontrole gerek kalmadı."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Düşük riskli bir belirsizliği 20 dakika kontrol etmeden bırak."
  },
  {
    "day": 103,
    "phaseCode": "F4",
    "phaseTitle": "Faz 4 — Pekiştirme",
    "phaseGoal": "Yeni davranışı tekrar, değer, takip ve ilişki güvenliğiyle kalıcılaştırmak.",
    "domain": "destek",
    "domainLabel": "Destek isteme",
    "quoteKind": "original_science_based",
    "quote": "Bir mesaj, bir rica, bir açıklama: yakınlık bazen bu kadar küçük başlar.",
    "source": null,
    "psychologicalLens": "sosyal destek aktivasyonu",
    "explanation": "Duygu ve düşünceyi ayırmak, tepki vermeden önce seçim alanı açar.",
    "reflectionQuestion": "Destek istemek nasıl hissettirdi: riskli, rahatlatıcı, garip, nötr?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f4",
      "destek",
      "sosyal-destek-aktivasyonu"
    ],
    "standardTask": "Güvendiğin bir kişiden küçük ve somut bir destek iste.",
    "minimumTask": "Destek isteyebileceğin kişinin adını ve isteyeceğin şeyi taslak olarak yaz.",
    "successMeaning": "Destek isteme davranışının ilk basamağını görünür yaptın.",
    "reflectionExamples": [
      "karar verme konusunda bir kişiden yardım istedim; istemek utanç değil, çözüm üretmekmiş.",
      "Destek ararken 'şunu birlikte yapalım' dedim; karşı tarafın sadece dinlemesi bile yükümü hafifletti.",
      "Yalnız başa çıkmak zorunda değilim; bugün bir gözden geçirme talep ettim, bu yakınlığı güvenli kıldı."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Güvendiğin bir kişiden küçük ve somut bir destek iste."
  },
  {
    "day": 104,
    "phaseCode": "F4",
    "phaseTitle": "Faz 4 — Pekiştirme",
    "phaseGoal": "Yeni davranışı tekrar, değer, takip ve ilişki güvenliğiyle kalıcılaştırmak.",
    "domain": "sinir",
    "domainLabel": "Sınır koyma",
    "quoteKind": "original_science_based",
    "quote": "Sınırın varsa söyle; yoksa kırgınlık sınırın yerine konuşmaya başlar.",
    "source": null,
    "psychologicalLens": "sınır netliği",
    "explanation": "Yakınlık ve sınır birlikte çalıştığında ilişki daha az tehditkâr hale gelir.",
    "reflectionQuestion": "Sınırımı söyleyince temas daha mı netleşti?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f4",
      "sinir",
      "sınır-netliği"
    ],
    "standardTask": "Bir sınır cümlesi kur: 'Şu an ... yapacağım; ... zamanda döneceğim.'",
    "minimumTask": "Koymak istediğin sınırı göndermeden önce tek cümleyle taslaklaştır.",
    "successMeaning": "Sınırı kopmadan ve cezalandırmadan ifade etmeye yaklaştın.",
    "reflectionExamples": [
      "sosyal bir davet durumunda 'bugün bunu yapamam' dedim; sert değil, net bir çerçeve kurmak rahatlattı.",
      "Hayır demek önce panik, sonra rahatlama getirdi; karşı taraf anlayışla karşıladı, ben sınırımda kaldım.",
      "Sınırımı açıkça söyleyince suçluluk hissettim ama uzun vadede daha az yorgun fark ettim."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bir sınır cümlesi kur: 'Şu an ... yapacağım; ... zamanda döneceğim.'"
  },
  {
    "day": 105,
    "phaseCode": "F4",
    "phaseTitle": "Faz 4 — Pekiştirme",
    "phaseGoal": "Yeni davranışı tekrar, değer, takip ve ilişki güvenliğiyle kalıcılaştırmak.",
    "domain": "onarim",
    "domainLabel": "İlişki onarımı",
    "quoteKind": "original_science_based",
    "quote": "Onarım, geçmişi silmez; gelecekteki güvene yeni veri ekler.",
    "source": null,
    "psychologicalLens": "ilişki onarımı",
    "explanation": "Kapasiteye göre ayarlanmış hedef, sürdürülebilirlik ve öz-yeterlik için daha uygundur.",
    "reflectionQuestion": "Onarım denemem ilişkiye hangi yeni bilgiyi ekledi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f4",
      "onarim",
      "ilişki-onarımı"
    ],
    "standardTask": "Uzaklaştığın bir kişiye açıklama taslağı yaz: 'Geri çekildim çünkü ...'",
    "minimumTask": "Onarım cümlesini göndermeden yalnızca notlara yaz.",
    "successMeaning": "Uzaklaşma yerine onarım seçeneğini zihinde erişilebilir yaptın.",
    "reflectionExamples": [
      "arkadaşımla yaşanan küçük bir sert cümle sonrası 'özür dilerim, amacım şuydu' dedim; onarım büyük jest değil, küçük ve samimi adım.",
      "Özür yerine açıklama ve 'seni dinlemek için zaman ayırayım' sundum; ilişkideki gerilim açık konuşunca azaldı.",
      "Onarım denemem daha net konuşmama yardım etti; denemek, mükemmel olmaktan daha değerli."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Uzaklaştığın bir kişiye açıklama taslağı yaz: 'Geri çekildim çünkü ...'"
  },
  {
    "day": 106,
    "phaseCode": "F4",
    "phaseTitle": "Faz 4 — Pekiştirme",
    "phaseGoal": "Yeni davranışı tekrar, değer, takip ve ilişki güvenliğiyle kalıcılaştırmak.",
    "domain": "yakinlik",
    "domainLabel": "Yakınlık toleransı",
    "quoteKind": "original_science_based",
    "quote": "Yakınlık güvenli geldiğinde değil, güvenli dozlar denendikçe öğrenilir.",
    "source": null,
    "psychologicalLens": "kademeli yakınlık",
    "explanation": "Bu günün amacı otomatik savunmayı suçlamak değil, onu fark edip daha esnek bir seçenek üretmektir.",
    "reflectionQuestion": "Yakınlık dozu bana fazla mı geldi, yoksa yönetilebilir miydi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f4",
      "yakinlik",
      "kademeli-yakınlık"
    ],
    "standardTask": "Normalde saklayacağın küçük bir doğruyu güvenli bir kişiye söyle.",
    "minimumTask": "Güvenli bir kişiye söyleyebileceğin yüzde beşlik açıklık cümlesini yaz.",
    "successMeaning": "Tam kapanma yerine güvenli dozda temas ihtimalini artırdın.",
    "reflectionExamples": [
      "Yakınlık anında çekilme isteği geldi; bu sefer birkaç nefes kadar kaldım ve panik azaldı.",
      "yakın arkadaşım ile samimi konuşma anında 'buradayım' demek, uzaklaşmaktan daha güvenli hissettirdi.",
      "Yakınlığa maruz kalınca bedenim gerildi yaptı; nefes alıp kalmak, duygu geçene kadar yeterliymiş."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Normalde saklayacağın küçük bir doğruyu güvenli bir kişiye söyle."
  },
  {
    "day": 107,
    "phaseCode": "F4",
    "phaseTitle": "Faz 4 — Pekiştirme",
    "phaseGoal": "Yeni davranışı tekrar, değer, takip ve ilişki güvenliğiyle kalıcılaştırmak.",
    "domain": "enerji",
    "domainLabel": "Enerji yönetimi",
    "quoteKind": "original_science_based",
    "quote": "Bugünün yükünü tek başına taşımak zorunda olup olmadığını yeniden sor.",
    "source": null,
    "psychologicalLens": "kapasiteye göre hedefleme",
    "explanation": "Küçük davranış, zihne soyut motivasyondan daha güvenilir kanıt verir.",
    "reflectionQuestion": "Hedefi küçültmek ilerlemeyi artırdı mı azalttı mı?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f4",
      "enerji",
      "kapasiteye-göre-hedefleme"
    ],
    "standardTask": "Enerjini 0–10 puanla; bugünkü hedefini bu puana göre küçült.",
    "minimumTask": "Enerjini 0–10 arasında puanla ve hedefi bir kademe küçült.",
    "successMeaning": "Kapasiteye göre hedef ayarladın; sürdürülebilirliği korudun.",
    "reflectionExamples": [
      "Bugün enerjim yorucu idi; hafif esneme yapınca odak döndü ve daha sürdürülebilir çalıştım.",
      "İrade değil ritim; 10 dk mola verince odaklanmam geri geldi, kendimi suçlamadım.",
      "Yüksek enerjili saatlerimi yaratıcı iş için, düşüklerini dinlenme için kullandım; verim değil, denge önemli."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Enerjini 0–10 puanla; bugünkü hedefini bu puana göre küçült."
  },
  {
    "day": 108,
    "phaseCode": "F4",
    "phaseTitle": "Faz 4 — Pekiştirme",
    "phaseGoal": "Yeni davranışı tekrar, değer, takip ve ilişki güvenliğiyle kalıcılaştırmak.",
    "domain": "deger",
    "domainLabel": "Değer odaklılık",
    "quoteKind": "original_science_based",
    "quote": "Değerli hayat, her gün iyi hissetmek değil; zor günde de yön seçebilmektir.",
    "source": null,
    "psychologicalLens": "değer temelli davranış",
    "explanation": "Duygu ve düşünceyi ayırmak, tepki vermeden önce seçim alanı açar.",
    "reflectionQuestion": "Bugünkü davranışım uzun vadede hangi kişiye dönüşmeme yardım ediyor?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f4",
      "deger",
      "değer-temelli-davranış"
    ],
    "standardTask": "Bugün yaptığın tek davranışın hangi değere hizmet ettiğini yaz.",
    "minimumTask": "Bugün korumak istediğin değeri tek kelimeyle yaz.",
    "successMeaning": "Duygu durumdan bağımsız olarak yönünü değerle bağladın.",
    "reflectionExamples": [
      "Bugün adil olmak değerime hizmet eden küçük eylem küçük bir adım attım; uzun hedef değil, bugünkü seçim önemli.",
      "rekabet anında değerim adil olmak olduğunu hatırladım; bu, seçimi kolaylaştırdı.",
      "Davranışım (kendimi dinledim) ile sağlık arasındaki bağ kurunca motivasyonum içsel."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bugün yaptığın tek davranışın hangi değere hizmet ettiğini yaz."
  },
  {
    "day": 109,
    "phaseCode": "F4",
    "phaseTitle": "Faz 4 — Pekiştirme",
    "phaseGoal": "Yeni davranışı tekrar, değer, takip ve ilişki güvenliğiyle kalıcılaştırmak.",
    "domain": "farkindalik",
    "domainLabel": "Farkındalık",
    "quoteKind": "original_science_based",
    "quote": "Kendini değiştirmeye çalışmadan önce, kendini doğru okumayı öğren.",
    "source": null,
    "psychologicalLens": "otomatik tepkiyi yavaşlatma",
    "explanation": "Yakınlık ve sınır birlikte çalıştığında ilişki daha az tehditkâr hale gelir.",
    "reflectionQuestion": "Bu tepki beni gerçekten korudu mu, yoksa yalnızca teması mı erteledi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f4",
      "farkindalik",
      "otomatik-tepkiyi-yavaşlatma"
    ],
    "standardTask": "Bugün geri çekilmek istediğin bir anda 90 saniye dur ve dürtünün adını yaz.",
    "minimumTask": "Geri çekilme veya otomatik tepkiyle ilgili yalnızca bir kelime yaz.",
    "successMeaning": "Otomatik tepkiyi fark ettin; bu, değişim için ilk davranış verisidir.",
    "reflectionExamples": [
      "Bugün geri çekilme anında birkaç saniye durup fark ettim; vücudumda sıkışma hissettim, hemen tepki vermek zorunda değilmişim.",
      "Dürtü geldiğinde fark ettim ki aslında alt duygu hissediyordum; sadece durup adlandırmak yoğunluğu azalttı.",
      "cevap verme yapmadan önce kendime 'şu anda ne oluyor?' diye sordum; bu küçük duruş, seçim alanı açmak için bir veri."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bugün geri çekilmek istediğin bir anda 90 saniye dur ve dürtünün adını yaz."
  },
  {
    "day": 110,
    "phaseCode": "F4",
    "phaseTitle": "Faz 4 — Pekiştirme",
    "phaseGoal": "Yeni davranışı tekrar, değer, takip ve ilişki güvenliğiyle kalıcılaştırmak.",
    "domain": "duygu-adlandirma",
    "domainLabel": "Duygu adlandırma",
    "quoteKind": "original_science_based",
    "quote": "Geri çekilme geldiğinde şu soruyu sor: Alan mı istiyorum, anlaşılmak mı?",
    "source": null,
    "psychologicalLens": "duygu ayrıştırma",
    "explanation": "Kapasiteye göre ayarlanmış hedef, sürdürülebilirlik ve öz-yeterlik için daha uygundur.",
    "reflectionQuestion": "Şu an hissettiğim şeyin en doğru adı ne?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f4",
      "duygu-adlandirma",
      "duygu-ayrıştırma"
    ],
    "standardTask": "Bugünün baskın duygusunu üç düzeyde yaz: görünen duygu, alttaki duygu, bedendeki his.",
    "minimumTask": "Bugünkü baskın duygunu tek kelimeyle adlandır.",
    "successMeaning": "Duyguyu adlandırdın; belirsiz iç basıncı daha yönetilebilir hâle getirdin.",
    "reflectionExamples": [
      "Bugün görünürde öfke hissediyordum ama altında çaresizlik vardı; göğsümde boşluk fark ettim.",
      "Duyguyu sadece 'kötü' değil, 'hayal kırıklığı' diye adlandırınca daha yönetilebilir geldi; zihnim 'hâlâ güvensiz' dedi.",
      "Üç katman yazdım: dışta bunalım, ortada suçluluk, bedende boşluk; bu ayrıştırma panik hissini durdurdu."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bugünün baskın duygusunu üç düzeyde yaz: görünen duygu, alttaki duygu, bedendeki his."
  },
  {
    "day": 111,
    "phaseCode": "F4",
    "phaseTitle": "Faz 4 — Pekiştirme",
    "phaseGoal": "Yeni davranışı tekrar, değer, takip ve ilişki güvenliğiyle kalıcılaştırmak.",
    "domain": "bilissel-mesafe",
    "domainLabel": "Bilişsel mesafe",
    "quoteKind": "original_science_based",
    "quote": "Her duygu bir haber getirir; her haber emir değildir.",
    "source": null,
    "psychologicalLens": "bilişsel ayrışma",
    "explanation": "Bu günün amacı otomatik savunmayı suçlamak değil, onu fark edip daha esnek bir seçenek üretmektir.",
    "reflectionQuestion": "Bu düşünceye yüzde kaç inanıyorum ve hangi kanıt eksik?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f4",
      "bilissel-mesafe",
      "bilişsel-ayrışma"
    ],
    "standardTask": "Zorlayan düşüncenin başına şu ifadeyi ekle: 'Zihnim şu anda bana ... diyor.'",
    "minimumTask": "Zorlayan düşünceni 'Zihnim şu anda bana ... diyor' kalıbıyla bir cümleye çevir.",
    "successMeaning": "Düşünceyle arana mesafe koydun; onu gerçek değil veri olarak ele aldın.",
    "reflectionExamples": [
      "Zihnim 'daha iyi hissetmem lazım' diyordu; başına 'zihnim şu anda bana ... diyor' ekleyince gerçekliği azaldı.",
      "Bu düşünceye %90 inanıyordum ama kanıt listelediğimde başarıldığına dair kanıtın eksik olduğunu gördüm.",
      "Düşünceyi bir cümle olarak yazıp okudum; aynı cümle tekrarlanınca bir 'veri parçası' gibi durdu."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Zorlayan düşüncenin başına şu ifadeyi ekle: 'Zihnim şu anda bana ... diyor.'"
  },
  {
    "day": 112,
    "phaseCode": "F4",
    "phaseTitle": "Faz 4 — Pekiştirme",
    "phaseGoal": "Yeni davranışı tekrar, değer, takip ve ilişki güvenliğiyle kalıcılaştırmak.",
    "domain": "davranissal-aktivasyon",
    "domainLabel": "Davranışsal aktivasyon",
    "quoteKind": "original_science_based",
    "quote": "Başlangıç küçükse direnç de küçülür.",
    "source": null,
    "psychologicalLens": "davranışsal aktivasyon",
    "explanation": "Küçük davranış, zihne soyut motivasyondan daha güvenilir kanıt verir.",
    "reflectionQuestion": "En küçük uygulanabilir adım neydi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f4",
      "davranissal-aktivasyon",
      "davranışsal-aktivasyon"
    ],
    "standardTask": "İki dakikada başlayabileceğin bir davranış seç ve yalnızca iki dakika uygula.",
    "minimumTask": "Görevin yalnızca ilk 60 saniyesini yap.",
    "successMeaning": "Motivasyonu beklemeden davranış başlattın.",
    "reflectionExamples": [
      "Hazır değildim ama odaklanma için sadece iki dakika başladım; sonrasında devam etmek istedim.",
      "Motivasyonu beklemeden bir başlık açtım yaptım; başlangıç, hissettiğimden çok daha küçük bir şeymiş.",
      "Bugünün minimumu ilk adımı yazmak idi; yaptığımda kendime 'bu da sayılır' demeyi öğrendim."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "İki dakikada başlayabileceğin bir davranış seç ve yalnızca iki dakika uygula."
  },
  {
    "day": 113,
    "phaseCode": "F4",
    "phaseTitle": "Faz 4 — Pekiştirme",
    "phaseGoal": "Yeni davranışı tekrar, değer, takip ve ilişki güvenliğiyle kalıcılaştırmak.",
    "domain": "oz-sefkat",
    "domainLabel": "Öz-şefkat",
    "quoteKind": "original_science_based",
    "quote": "Kendine iyi davranmak, gevşemek değil; sistemi uzun vadeye hazırlamaktır.",
    "source": null,
    "psychologicalLens": "öz-şefkatli iç konuşma",
    "explanation": "Duygu ve düşünceyi ayırmak, tepki vermeden önce seçim alanı açar.",
    "reflectionQuestion": "Kendime daha adil davransaydım aynı durumda ne derdim?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f4",
      "oz-sefkat",
      "öz-şefkatli-iç-konuşma"
    ],
    "standardTask": "Sert bir iç cümleni daha adil ve uygulanabilir bir cümleye çevir.",
    "minimumTask": "Kendine söylediğin sert cümleyi fark et ve yanına daha adil bir kelime ekle.",
    "successMeaning": "Öz-eleştiriye karşı daha sürdürülebilir bir iç dil denedin.",
    "reflectionExamples": [
      "Kendime 'neden bu kadar yavaşsın' dediğimi fark ettim; yerine 'tempo değişebilir, bu beni tanımlamaz' desem daha adil ve sürdürülebilir olurdu.",
      "Aynı durumda arkadaşıma nasıl konuşurdum? Ona her gün aynı değil, kendime ise hiçbir işe yaramıyorsun demiştim; bugün dengeledim.",
      "Başarısızlık değil, kapasite sınırı; 'bugün bu kadar yeter' demek, daha uzun soluklu çalışmamı sağlıyor."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Sert bir iç cümleni daha adil ve uygulanabilir bir cümleye çevir."
  },
  {
    "day": 114,
    "phaseCode": "F4",
    "phaseTitle": "Faz 4 — Pekiştirme",
    "phaseGoal": "Yeni davranışı tekrar, değer, takip ve ilişki güvenliğiyle kalıcılaştırmak.",
    "domain": "belirsizlik",
    "domainLabel": "Belirsizlik toleransı",
    "quoteKind": "original_science_based",
    "quote": "Belirsizlikle kalabildiğin her küçük an, kaygıya yeni bilgi verir.",
    "source": null,
    "psychologicalLens": "belirsizlikle kalma",
    "explanation": "Yakınlık ve sınır birlikte çalıştığında ilişki daha az tehditkâr hale gelir.",
    "reflectionQuestion": "Bu belirsizlikle kalınca korktuğum şey gerçekten oldu mu?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f4",
      "belirsizlik",
      "belirsizlikle-kalma"
    ],
    "standardTask": "Düşük riskli bir belirsizliği 20 dakika kontrol etmeden bırak.",
    "minimumTask": "Bir kontrol davranışını yalnızca 5 dakika ertele.",
    "successMeaning": "Kontrol dürtüsünü erteledin; kaygıya yeni öğrenme alanı açtın.",
    "reflectionExamples": [
      "ilişki durumu belirsizliğiyle 20 dk kalınca korktuğum yetersizlik gerçekleşmedi; kaygı gerçeklik değilmiş.",
      "Kontrol dürtüsünü 15 dk erteledim; sonrasında kaygı kendi kendine düştü ve fark ettim ki dürtü geçici.",
      "Kesinlik aramak yerine 'şu an yeterli bilgi var mı?' diye sordum; cevap evetti, ek kontrole gerek kalmadı."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Düşük riskli bir belirsizliği 20 dakika kontrol etmeden bırak."
  },
  {
    "day": 115,
    "phaseCode": "F4",
    "phaseTitle": "Faz 4 — Pekiştirme",
    "phaseGoal": "Yeni davranışı tekrar, değer, takip ve ilişki güvenliğiyle kalıcılaştırmak.",
    "domain": "destek",
    "domainLabel": "Destek isteme",
    "quoteKind": "original_science_based",
    "quote": "Destek istemek, ilişkiye güven inşa etme fırsatı da verir.",
    "source": null,
    "psychologicalLens": "sosyal destek aktivasyonu",
    "explanation": "Kapasiteye göre ayarlanmış hedef, sürdürülebilirlik ve öz-yeterlik için daha uygundur.",
    "reflectionQuestion": "Destek istemek nasıl hissettirdi: riskli, rahatlatıcı, garip, nötr?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f4",
      "destek",
      "sosyal-destek-aktivasyonu"
    ],
    "standardTask": "Güvendiğin bir kişiden küçük ve somut bir destek iste.",
    "minimumTask": "Destek isteyebileceğin kişinin adını ve isteyeceğin şeyi taslak olarak yaz.",
    "successMeaning": "Destek isteme davranışının ilk basamağını görünür yaptın.",
    "reflectionExamples": [
      "pratik iş konusunda bir kişiden yardım istedim; istemek utanç değil, çözüm üretmekmiş.",
      "Destek ararken 'bu konuda fikrini alabilir miyim' dedim; karşı tarafın sadece dinlemesi bile yükümü hafifletti.",
      "Yalnız başa çıkmak zorunda değilim; bugün yalnızca dinleme talep ettim, bu yakınlığı güvenli kıldı."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Güvendiğin bir kişiden küçük ve somut bir destek iste."
  },
  {
    "day": 116,
    "phaseCode": "F4",
    "phaseTitle": "Faz 4 — Pekiştirme",
    "phaseGoal": "Yeni davranışı tekrar, değer, takip ve ilişki güvenliğiyle kalıcılaştırmak.",
    "domain": "sinir",
    "domainLabel": "Sınır koyma",
    "quoteKind": "original_science_based",
    "quote": "Sınırın net olduğunda yakınlık daha az tehditkâr hale gelir.",
    "source": null,
    "psychologicalLens": "sınır netliği",
    "explanation": "Bu günün amacı otomatik savunmayı suçlamak değil, onu fark edip daha esnek bir seçenek üretmektir.",
    "reflectionQuestion": "Sınırımı söyleyince temas daha mı netleşti?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f4",
      "sinir",
      "sınır-netliği"
    ],
    "standardTask": "Bir sınır cümlesi kur: 'Şu an ... yapacağım; ... zamanda döneceğim.'",
    "minimumTask": "Koymak istediğin sınırı göndermeden önce tek cümleyle taslaklaştır.",
    "successMeaning": "Sınırı kopmadan ve cezalandırmadan ifade etmeye yaklaştın.",
    "reflectionExamples": [
      "aile içi talep durumunda 'bugün bunu yapamam' dedim; sert değil, net bir çerçeve kurmak rahatlattı.",
      "Hayır demek önce panik, sonra rahatlama getirdi; karşı taraf soru sordu, ben sınırımda kaldım.",
      "Sınırımı açıkça söyleyince suçluluk hissettim ama uzun vadede daha net hissettim."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bir sınır cümlesi kur: 'Şu an ... yapacağım; ... zamanda döneceğim.'"
  },
  {
    "day": 117,
    "phaseCode": "F4",
    "phaseTitle": "Faz 4 — Pekiştirme",
    "phaseGoal": "Yeni davranışı tekrar, değer, takip ve ilişki güvenliğiyle kalıcılaştırmak.",
    "domain": "onarim",
    "domainLabel": "İlişki onarımı",
    "quoteKind": "original_science_based",
    "quote": "Bir kırgınlığı erken söylemek, ilişkiyi mahkeme salonuna çevirmeden konuşmaktır.",
    "source": null,
    "psychologicalLens": "ilişki onarımı",
    "explanation": "Küçük davranış, zihne soyut motivasyondan daha güvenilir kanıt verir.",
    "reflectionQuestion": "Onarım denemem ilişkiye hangi yeni bilgiyi ekledi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f4",
      "onarim",
      "ilişki-onarımı"
    ],
    "standardTask": "Uzaklaştığın bir kişiye açıklama taslağı yaz: 'Geri çekildim çünkü ...'",
    "minimumTask": "Onarım cümlesini göndermeden yalnızca notlara yaz.",
    "successMeaning": "Uzaklaşma yerine onarım seçeneğini zihinde erişilebilir yaptın.",
    "reflectionExamples": [
      "arkadaşımla yaşanan küçük bir sert cümle sonrası 'özür dilerim, amacım şuydu' dedim; onarım büyük jest değil, küçük ve samimi adım.",
      "Özür yerine açıklama ve 'seni dinlemek için zaman ayırayım' sundum; ilişkideki gerilim açık konuşunca azaldı.",
      "Onarım denemem daha net konuşmama yardım etti; denemek, mükemmel olmaktan daha değerli."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Uzaklaştığın bir kişiye açıklama taslağı yaz: 'Geri çekildim çünkü ...'"
  },
  {
    "day": 118,
    "phaseCode": "F4",
    "phaseTitle": "Faz 4 — Pekiştirme",
    "phaseGoal": "Yeni davranışı tekrar, değer, takip ve ilişki güvenliğiyle kalıcılaştırmak.",
    "domain": "yakinlik",
    "domainLabel": "Yakınlık toleransı",
    "quoteKind": "original_science_based",
    "quote": "Yakınlık kurarken kendi alanını koruyabilirsin; ikisi rakip değildir.",
    "source": null,
    "psychologicalLens": "kademeli yakınlık",
    "explanation": "Duygu ve düşünceyi ayırmak, tepki vermeden önce seçim alanı açar.",
    "reflectionQuestion": "Yakınlık dozu bana fazla mı geldi, yoksa yönetilebilir miydi?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f4",
      "yakinlik",
      "kademeli-yakınlık"
    ],
    "standardTask": "Normalde saklayacağın küçük bir doğruyu güvenli bir kişiye söyle.",
    "minimumTask": "Güvenli bir kişiye söyleyebileceğin yüzde beşlik açıklık cümlesini yaz.",
    "successMeaning": "Tam kapanma yerine güvenli dozda temas ihtimalini artırdın.",
    "reflectionExamples": [
      "Yakınlık anında çekilme isteği geldi; bu sefer 30 sn kadar kaldım ve panik aynı kaldı ama katlanabilirdi.",
      "eşim ile sarılma anında 'buradayım' demek, uzaklaşmaktan daha güvenli hissettirdi.",
      "Yakınlığa maruz kalınca bedenim titredi; nefes alıp kalmak, duygu geçene kadar yeterliymiş."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Normalde saklayacağın küçük bir doğruyu güvenli bir kişiye söyle."
  },
  {
    "day": 119,
    "phaseCode": "F4",
    "phaseTitle": "Faz 4 — Pekiştirme",
    "phaseGoal": "Yeni davranışı tekrar, değer, takip ve ilişki güvenliğiyle kalıcılaştırmak.",
    "domain": "enerji",
    "domainLabel": "Enerji yönetimi",
    "quoteKind": "original_science_based",
    "quote": "Yorgunken kendin hakkında verdiğin kararları geçici kabul et.",
    "source": null,
    "psychologicalLens": "kapasiteye göre hedefleme",
    "explanation": "Yakınlık ve sınır birlikte çalıştığında ilişki daha az tehditkâr hale gelir.",
    "reflectionQuestion": "Hedefi küçültmek ilerlemeyi artırdı mı azalttı mı?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f4",
      "enerji",
      "kapasiteye-göre-hedefleme"
    ],
    "standardTask": "Enerjini 0–10 puanla; bugünkü hedefini bu puana göre küçült.",
    "minimumTask": "Enerjini 0–10 arasında puanla ve hedefi bir kademe küçült.",
    "successMeaning": "Kapasiteye göre hedef ayarladın; sürdürülebilirliği korudun.",
    "reflectionExamples": [
      "Bugün enerjim düşük idi; su ve ışık yapınca biraz toparladım ve daha sürdürülebilir çalıştım.",
      "İrade değil ritim; 20 dk mola verince odaklanmam geri geldi, kendimi suçlamadım.",
      "Yüksek enerjili saatlerimi iletişim için, düşüklerini hafif iş için kullandım; verim değil, denge önemli."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Enerjini 0–10 puanla; bugünkü hedefini bu puana göre küçült."
  },
  {
    "day": 120,
    "phaseCode": "F4",
    "phaseTitle": "Faz 4 — Pekiştirme",
    "phaseGoal": "Yeni davranışı tekrar, değer, takip ve ilişki güvenliğiyle kalıcılaştırmak.",
    "domain": "deger",
    "domainLabel": "Değer odaklılık",
    "quoteKind": "original_science_based",
    "quote": "Bugün küçük ama değerli bir davranışı kayda geçir; zihin kanıt ister.",
    "source": null,
    "psychologicalLens": "değer temelli davranış",
    "explanation": "Kapasiteye göre ayarlanmış hedef, sürdürülebilirlik ve öz-yeterlik için daha uygundur.",
    "reflectionQuestion": "Bugünkü davranışım uzun vadede hangi kişiye dönüşmeme yardım ediyor?",
    "completionMetric": "active | minimum_completed | completed | paused",
    "eveningCheck": "Bugün bu mikro görevi tamamladıysan bir cümlelik gözlem yaz; tamamlamadıysan dozu nasıl küçülteceğini yaz.",
    "appNudge": {
      "morning": "Bugün tek hedef: küçük, gözlenebilir bir davranış.",
      "evening": "Tamamlanma değil, veri önemli. Ne öğrendin?",
      "hardDay": "Zor gün modu: görevi yarıya indir, programı bırakma."
    },
    "tags": [
      "f4",
      "deger",
      "değer-temelli-davranış"
    ],
    "standardTask": "Bugün yaptığın tek davranışın hangi değere hizmet ettiğini yaz.",
    "minimumTask": "Bugün korumak istediğin değeri tek kelimeyle yaz.",
    "successMeaning": "Duygu durumdan bağımsız olarak yönünü değerle bağladın.",
    "reflectionExamples": [
      "Bugün yakınlık değerime hizmet eden küçük eylem: bir adım attım; uzun hedef değil, bugünkü seçim önemli.",
      "zor bir seçim anında değerim sağlık olduğunu hatırladım; bu, seçimi kolaylaştırdı.",
      "Davranışım (zor bir konuşma yaptım) ile adil olmak arasındaki bağ kurunca motivasyonum içsel."
    ],
    "progressRule": "Bu gün, standardTask veya minimumTask tamamlanmadan sonraki güne geçmez.",
    "allowedStatuses": [
      "active",
      "minimum_completed",
      "completed",
      "paused"
    ],
    "microTaskDeprecated": "Bugün yaptığın tek davranışın hangi değere hizmet ettiğini yaz."
  }
];

  function clampDay(n){
    n = Number(n || 1);
    if(!isFinite(n) || n < 1) n = 1;
    if(n > PROGRAM.length) n = PROGRAM.length;
    return n;
  }

  function ensureMotivationRoot(data){
    if(!data) return null;
    if(!data.motivation){
      data.motivation = {
        version: "2.1.0",
        currentProgramDay: 1,
        startedAt: new Date().toISOString(),
        stats: {
          pathStreak: 0,
          bestPathStreak: 0,
          courageEvidence: 0,
          returnCount: 0,
          completedTotal: 0,
          minimumTotal: 0
        },
        history: {}
      };
    }
    if(!data.motivation.stats) data.motivation.stats = {};
    if(!data.motivation.history) data.motivation.history = {};
    if(!data.motivation.currentProgramDay) data.motivation.currentProgramDay = 1;
    return data.motivation;
  }

  function activeDay(data){
    var root = ensureMotivationRoot(data);
    var n = root ? root.currentProgramDay : 1;
    return getProgramDay(n);
  }

  function getProgramDay(dayIndex){
    return PROGRAM[clampDay(dayIndex) - 1];
  }

  function isCourageDomain(domain){
    return domain === "destek" || domain === "sinir" || domain === "onarim" || domain === "yakinlik";
  }

  function dayState(data, dateKey){
    var root = ensureMotivationRoot(data);
    return root && root.history ? (root.history[dateKey] || null) : null;
  }

  function record(data, dateKey, status, reflection){
    var root = ensureMotivationRoot(data);
    var mot = activeDay(data);
    var now = new Date().toISOString();
    var old = root.history[dateKey] || null;
    var prevLast = root.lastCompletedAt ? new Date(root.lastCompletedAt).getTime() : null;
    var gapHours = prevLast ? ((Date.now() - prevLast) / 36e5) : 0;
    var wasAlreadyProgramComplete = !!root.completedAt;

    var rec = {
      date: dateKey,
      programDay: mot.day,
      phaseCode: mot.phaseCode,
      domain: mot.domain,
      status: status,
      reflection: String(reflection || "").slice(0, 280),
      quote: mot.quote,
      standardTask: mot.standardTask,
      minimumTask: mot.minimumTask,
      successMeaning: mot.successMeaning,
      savedAt: now
    };

    root.history[dateKey] = rec;

    if(status === "completed" || status === "minimum_completed"){
      var isNewCompletion = !old || (old.status !== "completed" && old.status !== "minimum_completed");
      // Once the 120-day path is finished, later completions on new dates still
      // save history (nothing is lost) but no longer inflate stats or try to
      // advance past the final day - otherwise repeat taps after day 120 would
      // silently keep incrementing completedTotal/pathStreak forever.
      if(isNewCompletion && !wasAlreadyProgramComplete){
        root.stats.completedTotal = Number(root.stats.completedTotal || 0) + 1;
        if(status === "minimum_completed") root.stats.minimumTotal = Number(root.stats.minimumTotal || 0) + 1;
        root.stats.pathStreak = Number(root.stats.pathStreak || 0) + 1;
        root.stats.bestPathStreak = Math.max(Number(root.stats.bestPathStreak || 0), root.stats.pathStreak);
        if(isCourageDomain(mot.domain)) root.stats.courageEvidence = Number(root.stats.courageEvidence || 0) + 1;
        if(gapHours >= 48) root.stats.returnCount = Number(root.stats.returnCount || 0) + 1;
        root.lastCompletedAt = now;
        var nextDay = Number(root.currentProgramDay || 1) + 1;
        if(nextDay > PROGRAM.length){
          root.currentProgramDay = PROGRAM.length;
          root.completedAt = now;
        } else {
          root.currentProgramDay = clampDay(nextDay);
        }
      }
    } else if(status === "paused"){
      root.pausedAt = now;
    }
    return rec;
  }

  function progressSummary(data){
    var root = ensureMotivationRoot(data);
    var cur = clampDay(root.currentProgramDay || 1);
    var stats = root.stats || {};
    var complete = !!root.completedAt;
    return {
      currentProgramDay: cur,
      totalDays: PROGRAM.length,
      percent: complete ? 100 : Math.round(((cur - 1) / PROGRAM.length) * 100),
      programComplete: complete,
      completedAt: root.completedAt || null,
      pathStreak: Number(stats.pathStreak || 0),
      bestPathStreak: Number(stats.bestPathStreak || 0),
      courageEvidence: Number(stats.courageEvidence || 0),
      returnCount: Number(stats.returnCount || 0),
      completedTotal: Number(stats.completedTotal || 0),
      minimumTotal: Number(stats.minimumTotal || 0)
    };
  }

  function allEntriesForPanel(data){
    var root = ensureMotivationRoot(data);
    var hist = root.history || {};
    return Object.keys(hist).sort().map(function(k){ return hist[k]; });
  }

  window.MOTIVATION_PROGRAM_V2 = PROGRAM;
  window.MotivationProgramV2 = {
    version: "2.1.0",
    all: PROGRAM,
    getProgramDay: getProgramDay,
    activeDay: activeDay,
    ensureMotivationRoot: ensureMotivationRoot,
    dayState: dayState,
    record: record,
    progressSummary: progressSummary,
    allEntriesForPanel: allEntriesForPanel
  };
})();
