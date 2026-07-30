(function(){
  'use strict';

  // Diyanet Din İşleri Yüksek Kurulu'nun yayımladığı yaygın 99 isim sırası.
  // Ebced hedefi, aşağıdaki harekesiz Arapça yazımın "asıl ebced /
  // el-cümelü'l-kebîr" değeridir. Tek isimlerde el- takısı sayılmaz; Allah
  // lafzı ve iki birleşik isim kendi açık yazımlarıyla hesaplanır.
  var RAW=[
    ['Allah','الله'],['er-Rahmân','رحمن'],['er-Rahîm','رحيم'],['el-Melik','ملك'],
    ['el-Kuddûs','قدوس'],['es-Selâm','سلام'],['el-Mü’min','مؤمن'],['el-Müheymin','مهيمن'],
    ['el-Azîz','عزيز'],['el-Cebbâr','جبار'],['el-Mütekebbir','متكبر'],['el-Hâlik','خالق'],
    ['el-Bâri’','بارئ'],['el-Musavvir','مصور'],['el-Gaffâr','غفار'],['el-Kahhâr','قهار'],
    ['el-Vehhâb','وهاب'],['er-Rezzâk','رزاق'],['el-Fettâh','فتاح'],['el-Alîm','عليم'],
    ['el-Kâbız','قابض'],['el-Bâsıt','باسط'],['el-Hâfıd','خافض'],['er-Râfi’','رافع'],
    ['el-Muizz','معز'],['el-Müzill','مذل'],['es-Semî’','سميع'],['el-Basîr','بصير'],
    ['el-Hakem','حكم'],['el-Adl','عدل'],['el-Latîf','لطيف'],['el-Habîr','خبير'],
    ['el-Halîm','حليم'],['el-Azîm','عظيم'],['el-Gafûr','غفور'],['eş-Şekûr','شكور'],
    ['el-Aliyy','علي'],['el-Kebîr','كبير'],['el-Hafîz','حفيظ'],['el-Mukît','مقيت'],
    ['el-Hasîb','حسيب'],['el-Celîl','جليل'],['el-Kerîm','كريم'],['er-Rakîb','رقيب'],
    ['el-Mücîb','مجيب'],['el-Vâsi’','واسع'],['el-Hakîm','حكيم'],['el-Vedûd','ودود'],
    ['el-Mecîd','مجيد'],['el-Bâis','باعث'],['eş-Şehîd','شهيد'],['el-Hakk','حق'],
    ['el-Vekîl','وكيل'],['el-Kavî','قوي'],['el-Metîn','متين'],['el-Velî','ولي'],
    ['el-Hamîd','حميد'],['el-Muhsî','محصي'],['el-Mübdi’','مبدئ'],['el-Muîd','معيد'],
    ['el-Muhyî','محيي'],['el-Mümît','مميت'],['el-Hayy','حي'],['el-Kayyûm','قيوم'],
    ['el-Vâcid','واجد'],['el-Mâcid','ماجد'],['el-Vâhid','واحد'],['es-Samed','صمد'],
    ['el-Kâdir','قادر'],['el-Muktedir','مقتدر'],['el-Mukaddim','مقدم'],['el-Muahhir','مؤخر'],
    ['el-Evvel','أول'],['el-Âhir','آخر'],['ez-Zâhir','ظاهر'],['el-Bâtın','باطن'],
    ['el-Vâlî','والي'],['el-Müteâlî','متعالي'],['el-Berr','بر'],['et-Tevvâb','تواب'],
    ['el-Müntekim','منتقم'],['el-Afüv','عفو'],['er-Raûf','رؤوف'],['Mâlikü’l-Mülk','مالك الملك'],
    ['Zü’l-Celâli ve’l-İkrâm','ذو الجلال والإكرام'],['el-Muksit','مقسط'],['el-Câmi’','جامع'],
    ['el-Ganî','غني'],['el-Mugnî','مغني'],['el-Mâni’','مانع'],['ed-Dârr','ضار'],
    ['en-Nâfi’','نافع'],['en-Nûr','نور'],['el-Hâdî','هادي'],['el-Bedî’','بديع'],
    ['el-Bâkî','باقي'],['el-Vâris','وارث'],['er-Reşîd','رشيد'],['es-Sabûr','صبور']
  ];

  var VALUES={
    'ا':1,'ب':2,'ج':3,'د':4,'ه':5,'و':6,'ز':7,'ح':8,'ط':9,'ي':10,
    'ك':20,'ل':30,'م':40,'ن':50,'س':60,'ع':70,'ف':80,'ص':90,'ق':100,
    'ر':200,'ش':300,'ت':400,'ث':500,'خ':600,'ذ':700,'ض':800,'ظ':900,'غ':1000
  };
  function normalizeArabic(text){
    return String(text||'')
      .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g,'')
      .replace(/[آأإؤئء]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ت');
  }
  function ebced(text){
    var total=0, clean=normalizeArabic(text);
    for(var i=0;i<clean.length;i++) total+=VALUES[clean.charAt(i)]||0;
    return total;
  }
  var names=RAW.map(function(row,index){
    return Object.freeze({
      id:'esma_'+String(index+1).padStart(2,'0'),
      order:index+1,
      name:row[0],
      arabic:row[1],
      ebced:ebced(row[1])
    });
  });

  window.EsmaulHusnaV1=Object.freeze({
    version:'1.0.0',
    names:Object.freeze(names),
    ebced:ebced,
    normalizeArabic:normalizeArabic,
    method:'Asıl ebced (el-cümelü’l-kebîr); tek isimlerde el- takısı hariç',
    sources:Object.freeze({
      names:'https://kurul.diyanet.gov.tr/tr/fetva/allahin-99-ismi-hakkinda-bilgi-verir-misiniz/56aa0e7b-6fe0-45ce-0892-08dd1c135351',
      ebced:'https://islamansiklopedisi.org.tr/ebced'
    })
  });
})();
