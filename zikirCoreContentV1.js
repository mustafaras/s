(function(){
  'use strict';

  // ZP-02 — Çekirdek zikir presetleri (Sübhanallah/Elhamdülillah/Allahü Ekber/
  // Lâ ilâhe illallah/Estağfirullah) için Türkçe anlam/önem/tefekkür/kaynak
  // içerik katmanı.
  //
  // Bu modül app.js'teki `ZIKR_SEED`/`ZIKR_NIYET`'i DEĞİŞTİRMEZ; onların
  // üzerine ayrı bir içerik katmanı olarak durur. `content` nesnesi
  // `ZIKR_SEED[i].id` ile birebir aynı anahtarları kullanır
  // (subhanallah/elhamdulillah/allahu_ekber/la_ilaha_illallah/estagfirullah),
  // böylece ileride (ZP-13'te) app.js bu modülü id üzerinden tüketebilir.
  //
  // ARAPÇA YAZIM KARARI (esmaulHusnaV1.js ile tutarlı): harekesiz yazım
  // kullanılır; ayrı bir normalizasyon kuralı icat edilmez, aynı kararın
  // devamıdır.
  //
  // KAYNAK KARARI: Bu 5 ifade için tek tek doğrulanmış kurumsal web adresi
  // yerine — hatalı/uydurma bir URL vermektense — birincil kaynak olan
  // Kur'an-ı Kerim'e ve yalnızca eminlik derecem yüksek olan ayet
  // adreslerine (Fatiha 1:2, Muhammed 47:19) atıf yapılır. Emin olmadığım
  // ayet numaraları (ör. tekbir/tesbih/istiğfarın tam adresi) kesin numarayla
  // İDDİA EDİLMEZ; yalnızca genel tema olarak belirtilir. Hiçbir hadis metni
  // veya sevap/fazilet rakamı kullanılmaz (ZP-02 KABUL: "Kaynaksız hadis veya
  // fazilet metni yok").
  //
  // KULLANICI PRESET SÖZLEŞMESİ (ZP-02 madde 4-5, henüz app.js'e bağlanmadı,
  // yalnızca karar belgesi): yerleşik 5 metin kullanıcı tarafından
  // değiştirilemez; kullanıcı kendi presetini oluşturduğunda meaningTr/
  // importanceTr alanları isteğe bağlıdır ve UI'da "Kişisel not" etiketiyle
  // gösterilmelidir — kurumsal "Anlamı/Önemi" başlıklarıyla karıştırılmamalı.
  var USER_PRESET_CONTRACT = Object.freeze({
    meaningTrRequired: false,
    importanceTrRequired: false,
    personalNoteLabelTr: "Kişisel not",
    builtInLocked: true,
    note: "Kullanıcı özel presetleri bu kayıtları değiştiremez; kendi meaningTr/importanceTr metni yazarsa UI bunu kurumsal içerikten ayrışan \"Kişisel not\" etiketiyle göstermeli."
  });

  var SOURCES = {
    "kuran-i-kerim-genel": {
      title: "Kur'an-ı Kerim",
      institution: "Birincil kaynak metin",
      url: null,
      accessedAt: "2026-07-29",
      usage: "Tesbih/tahmid/tekbir/tevhid/istiğfar ifadelerinin Kur'an kökenli genel dayanağı"
    }
  };

  var CONTENT = {
    subhanallah: {
      originalText: "سبحان الله",
      transliterationTr: "Sübhanallah",
      meaningTr: "Allah'ı her türlü eksiklik, ortak ve benzetmeden tenzih etmek, O'nu yüceltmek.",
      importanceTr: "Sübhanallah, Allah hakkında yakışmayan her düşünceyi reddeden bir tesbih ifadesidir; namazda ve günlük zikirde en sık tekrarlanan cümlelerden biridir.",
      reflectionTr: "Bugün Allah'a yakıştıramadığın bir düşünceyi fark ettiğinde ne hissettin?",
      sourceRefs: ["kuran-i-kerim-genel"],
      verseNoteTr: "Kur'an'da tesbih teması genel olarak işlenir (örn. es-Sâffât sûresinin tenzih ayetleri); tek bir ayete özgü bir alıntı olarak sunulmaz.",
      kind: "core",
      editorialStatus: "draft"
    },
    elhamdulillah: {
      originalText: "الحمد لله",
      transliterationTr: "Elhamdülillah",
      meaningTr: "Bütün övgü ve şükrün yalnızca Allah'a ait olduğunu ifade etmek.",
      importanceTr: "Elhamdülillah, Fâtiha sûresinin ilk ayetiyle başlayan, hem nimet hem de zorluk anında söylenen temel bir şükür ifadesidir.",
      reflectionTr: "Bugün fark ettiğin ama teşekkür etmeyi unuttuğun bir nimet var mı?",
      sourceRefs: ["kuran-i-kerim-genel"],
      verseNoteTr: "Fâtiha 1:2 (“el-Hamdü lillâhi Rabbi'l-âlemîn”).",
      kind: "core",
      editorialStatus: "draft"
    },
    allahu_ekber: {
      originalText: "الله أكبر",
      transliterationTr: "Allahü Ekber",
      meaningTr: "Allah'ın her şeyden büyük ve üstün olduğunu ifade eden tekbir cümlesi.",
      importanceTr: "Allahü Ekber; ezanda, namazda ve bayram tekbirlerinde kullanılan, Allah'ın büyüklüğünü hatırlatan temel bir ifadedir.",
      reflectionTr: "Şu an seni en çok meşgul eden mesele, O'nun büyüklüğü karşısında nasıl küçülüyor?",
      sourceRefs: ["kuran-i-kerim-genel"],
      verseNoteTr: "Esas olarak namaz/ezan ve bayram tekbirlerindeki liturjik kullanımıyla bilinir; tek bir ayet alıntısı olarak sunulmaz.",
      kind: "core",
      editorialStatus: "draft"
    },
    la_ilaha_illallah: {
      originalText: "لا إله إلا الله",
      transliterationTr: "Lâ ilâhe illallah",
      meaningTr: "Allah'tan başka hiçbir ilah olmadığını ifade eden tevhid cümlesi.",
      importanceTr: "Lâ ilâhe illallah, İslam inancının özünü oluşturan kelime-i tevhiddir; farklı ayetlerde bu hakikat çeşitli biçimlerde vurgulanır.",
      reflectionTr: "Güvenini en çok neye bağladığını fark ettiğinde, bu cümle sana ne hatırlatıyor?",
      sourceRefs: ["kuran-i-kerim-genel"],
      verseNoteTr: "Muhammed 47:19 (“fa'lem ennehû lâ ilâhe illallah”) gibi ayetlerde geçen tevhid ifadesi.",
      kind: "core",
      editorialStatus: "draft"
    },
    estagfirullah: {
      originalText: "أستغفر الله",
      transliterationTr: "Estağfirullah",
      meaningTr: "Allah'tan bağışlanma dilemek.",
      importanceTr: "Estağfirullah, günlük hayatta hata ve gafletin ardından sıkça tekrarlanan bir istiğfar/tövbe ifadesidir.",
      reflectionTr: "Bugün üzerinde durup bağışlanma dilemek istediğin bir an var mı?",
      sourceRefs: ["kuran-i-kerim-genel"],
      verseNoteTr: "Kur'an'da istiğfar teması genel olarak işlenir (örn. Nûh sûresindeki istiğfar çağrısı); tek bir ayete özgü bir alıntı olarak sunulmaz.",
      kind: "core",
      editorialStatus: "draft"
    }
  };

  window.ZikirCoreContentV1 = Object.freeze({
    version: "1.0.0-draft",
    preparedAt: "2026-07-29",
    content: Object.freeze(CONTENT),
    ids: Object.freeze(Object.keys(CONTENT)),
    sources: Object.freeze(SOURCES),
    userPresetContract: USER_PRESET_CONTRACT,
    contentNote: "Yerleşik 5 çekirdek zikrin meaningTr/importanceTr metinleri taslaktır (editorialStatus:'draft'); hiçbir hadis metni veya sayısal fazilet iddiası içermez. reflectionTr özgün tefekkür sorularıdır. İnsan editoryal incelemesi ve kullanıcı onayı olmadan 'reviewed' işaretlenmemeli ve app.js'e bağlanmamalıdır."
  });
})();
