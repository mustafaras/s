(function(){
"use strict";
var KEY='seyma-reset-v1', TKEY='seyma-theme';

var HABITS=[
  {key:'sweetManaged',icon:'🍫',title:'Tatlı krizini yönettim',sub:'Tatlı seni değil, sen tatlıyı yönettin.',msg:'Tatlı lobisi bugün hafif geriledi. Şeyma 1 - Tatlı 0.'},
  {key:'eveningControl',icon:'🌙',title:"Akşam 7'den sonra gereksiz atıştırmadım",sub:'Gerçek açlık başka, dolapla duygusal bağ başka.',msg:'Mutfak seferi iptal. Operasyon başarılı.'},
  {key:'walked20',icon:'🚶‍♀️',title:'En az 20 dk yürüdüm',sub:'Kısa yürüyüş de sayılır. Sistem çalışıyor.',msg:'Yürüyüş tamam. Metabolizma "bunu not ettim" dedi.'},
  {key:'protein',icon:'🍳',title:'2 ana öğünde protein vardı',sub:'Tokluk ekibi göreve başladı.',msg:'Protein geldi, krizlerin beli hafif büküldü.'},
  {key:'water',icon:'💧',title:'Su içmeyi ihmal etmedim',sub:'Küçük şey, büyük fark.',msg:'Su tamam. Cilt bariyeri sessizce teşekkür ediyor.'},
  {key:'vitaminD',icon:'☀️',title:'D vitaminimi aldım',sub:'Minik destek, güneş hesabına yazıldı.',msg:'D vitamini tamam. Güneş desteği kayda geçti ☀️'},
  {key:'sleepReg',icon:'🛌',title:'Yeterli uyudum (7+ saat)',sub:'Uyku, dengenin sessiz kahramanı.',msg:'Uyku tamam. Hormonlar ve ruh hâlin sessizce teşekkür ediyor 🌙',since:'2026-06-28'},
  {key:'journaled',icon:'📝',title:'Duygu/günlük notu yazdım',sub:'Zihni boşaltmak, kaygıyı hafifletir.',msg:'Bir cümle bile olsa yazdın; zihin biraz nefes aldı 📝',since:'2026-07-03'},
  {key:'freshAir',icon:'🌿',title:'Açık havaya çıktım',sub:'Doğal ışık, ruh hâlini yukarı çeker.',msg:'Açık hava tamam. Güneş ve ruh hâlin selam gönderdi 🌿',since:'2026-07-03'},
  {key:'selfKind',icon:'🫶',title:'Kendime kötü davranmadım',sub:'En önemli tik bu.',msg:'Bugünün en kıymetli hamlesi: kendine yüklenmemek.'}
];
var HABIT_TOTAL=HABITS.length;
function habitCountOn(date){ var n=0; for(var i=0;i<HABITS.length;i++){ var s=HABITS[i].since; if(!s||(date&&date>=s)) n++; } return n; }
function htToday(){ return habitCountOn(todayStr()); }
function emptyDiscomfort(){ return {regions:{},note:'',meds:[]}; }
var MOODS=[
  {id:'cok-iyi',label:'Çok iyi ☀️',short:'Çok iyi',emoji:'☀️',resp:'Bugün ışık saçıyoruz anlaşılan ☀️'},
  {id:'iyi',label:'İyi 🌼',short:'İyi',emoji:'🌼',resp:'Gayet güzel. Ritim kuruluyor 🌼'},
  {id:'normal',label:'Normal 🌿',short:'Normal',emoji:'🌿',resp:'Normal de olur. Her gün festival değil 🌿'},
  {id:'zorlandim',label:'Zorlandım 🌧️',short:'Zor',emoji:'🌧️',resp:'Zor günler oyundan düşürmez Sevgili Günışığı 🌧️'},
  {id:'cok-zorlandim',label:'Çok zorlandım 🫧',short:'Çok zor',emoji:'🫧',resp:'Bugün sadece kendine yüklenmemek bile yeter 🫧'}
];
var SOS_OPTS=['Su içtim 💧','Kahve/çay yaptım ☕','Yoğurt + tarçın denedim 🥣','Meyve + yoğurt yaptım 🍓','1-2 kare bitterle kapattım 🍫','Hâlâ istiyorum ama kontrollü yiyeceğim 🤝'];
var SOS_TRIGGERS=[{id:'tired',emoji:'🥱',label:'Yorgunum'},{id:'bored',emoji:'😶‍🌫️',label:'Sıkıldım'},{id:'hungry',emoji:'🍽️',label:'Gerçekten açım'},{id:'stress',emoji:'🌀',label:'Stresliyim'},{id:'habit',emoji:'🔁',label:'Alışkanlık'}];
var DAILY=[
  "Bugün tek görevin başlamak. Gerisi kendiliğinden gelir ☀️",
  "Tatlıyı silmiyoruz; sadece patronun sen olduğunu hatırlatıyoruz.",
  "Tok bir Şeyma, sakin bir Şeyma. Bugün öğünleri atlamıyoruz.",
  "Akşam mutfağı bugün kısa ziyaret saatleriyle çalışıyor 🌙",
  "Bir lokma planı bozmaz; bırakmak bozar, o da bugün yok.",
  "Kısacık bir yürüyüş bile bugünü senin lehine çevirir 🚶‍♀️",
  "Bir hafta tamam. Bu küçük bir şey değil, bayağı iş.",
  "Kriz gelirse plan hazır: önce su, sonra nefes, sonra karar.",
  "Bugün düzen günü. Sürpriz yok, sadece sakin bir ritim.",
  "Yarı yola az kaldı; akıllı seçimler sessizce birikiyor.",
  "Hamur işiyle bugün medeni bir mesafe: selamlaşırız, sarılmayız 🥐",
  "Akşamki o istek çoğu zaman açlık değil. Bir bak bakalım.",
  "Su artı yürüyüş, bugünün sessiz kahramanları 💧",
  "İki hafta geride. Kontrol da keyif de sende.",
  "Bugünün hedefi sade: rayda kal, gerisi gelir.",
  "Tatlı çekti mi? Önce üç soru: aç mıyım, sıkkın mıyım, yorgun muyum?",
  "Protein masada olunca krizler sesini kısıyor 🍳",
  "Mutfakla bugün laubali değil, ölçülü bir ilişki.",
  "Küçük seçimler toplanıyor; sen de gayet güzel toplanıyorsun.",
  "Son düzlük. Bu bir yarış değil, sadece bir prova.",
  "Şeyma 🦩 tamamlandı. Tatlıya saygı, kendine daha çok saygı 👑"
];
var NOTES=[
  "Sevgili Günışığı, mükemmel olmana gerek yok; ben zaten senden yanayım.",
  "Bugün bir şeyi iyi yaptıysan o gün kazanılmıştır, gerisi teferruat.",
  "Aç kalma sakın; aç kalınca sen değil, içindeki kurabiye lobisi konuşuyor 🍪",
  "Nutella'yı yargılamıyorum ama onu da fazla ciddiye almıyoruz, anlaştık mı?",
  "Tatlı krizi geldiğinde panikleme; ekip hazır, kaptan sensin.",
  "Bir lokma yüzünden koca günü yargılamak yok. Kraliçe sakinliğiyle devam.",
  "Akşam dolabın önünde durduğunda bana bir mesaj at, krizini birlikte dağıtalım.",
  "Sen bir flamingo gibisin Sevgili Günışığı: dengede dururken bile zarif 🦩",
  "Bugün sadece su içip yürüdüysen bile 'kendime baktım' demektir, gerisi bonus.",
  "Tatlıyla aranı açmak küslük değil; sadece medeni bir sınır koymak.",
  "Sen koca bir kraliçesin, o minik bir kurabiye. Denge hep sende 👑",
  "Zor bir gün mü oldu? Olur. Yarın seni bekleyen tertemiz bir sayfa var.",
  "Gülümsediğinde tatlı listesi bir alt sıraya kayıyor, fark ettin mi?",
  "Bugün kendine kibar davran; sen senin en sadık takım arkadaşınsın 💛",
  "Bir bardak su, bir derin nefes, bir 'ben hallederim'. Tüm formül bu.",
  "Ben buradayım Sevgili Günışığı. Kötü bir an olursa önce bana yaz, sonra dolaba değil.",
  "Akşam yürüyüşünde şehir senin podyumun; baş model sensin.",
  "Küçük zaferlerini küçümseme; birikince koca bir 'aferin' oluyorlar.",
  "Bugün ters giden bir şey olduysa bile ben yine seninle gurur duyuyorum.",
  "Tatlıyı sevmek suç değil; sadece her duyguyu tatlıyla çözmemeyi deniyoruz.",
  "Yorulduğunda mola vermek de plana dahil. Dur, nefeslen, sonra devam et.",
  "Bu oyunda da oyun dışında da takımın hep senden yana, Sevgili Günışığı."
];
var PHONE='+905066020098';
var WA='https://wa.me/905066020098?text='+encodeURIComponent('Raşit, sana bir mesajım var 💌');
var TEL='tel:'+PHONE;

// ---------- meal / sleep / cycle defs ----------
var MEALS=[
  {key:'breakfast',icon:'🌅',label:'Kahvaltı',ph:'örn. yumurta, peynir, zeytin, çay…'},
  {key:'lunch',icon:'☀️',label:'Öğle',ph:'örn. tavuk, salata, bulgur…'},
  {key:'dinner',icon:'🌙',label:'Akşam',ph:'örn. çorba, sebze, yoğurt…'},
  {key:'snack',icon:'🍓',label:'Ara öğün',ph:'örn. meyve, kuruyemiş, bitter…'}
];
var SLEEP_Q=[{id:'good',emoji:'😴',label:'Dinç'},{id:'ok',emoji:'🙂',label:'İdare'},{id:'bad',emoji:'😵‍💫',label:'Yorgun'}];
var SLEEP_MED=[{id:'none',emoji:'🚫',label:'Hayır'},{id:'herbal',emoji:'🌿',label:'Bitkisel / Melatonin'},{id:'rx',emoji:'💊',label:'Reçeteli'}];
var WIND_DOWN_STEPS=[
  {key:'light',icon:'🕯️',label:'Işığı kıs',note:'Melatonin baskılanmasını azaltır.'},
  {key:'breath',icon:'🫁',label:'4-7-8 nefes',note:'Parasempatik sistemi aktive eder.'},
  {key:'dump',icon:'📝',label:'Zihin boşalt',note:'Yarın notu, ruminasyonu düşürür.'},
  {key:'cool',icon:'🌙',label:'Odayı serinlet',note:'18-20°C aralığı dalmayı destekler.'}
];
var FLOW=[{id:'spot',emoji:'🩸',label:'Leke'},{id:'light',emoji:'🌸',label:'Hafif'},{id:'medium',emoji:'🌺',label:'Orta'},{id:'heavy',emoji:'🌹',label:'Yoğun'}];
var SYMPTOMS=[{id:'kramp',emoji:'🤕',label:'Kramp'},{id:'bas',emoji:'🤯',label:'Baş ağrısı'},{id:'siskinlik',emoji:'🎈',label:'Şişkinlik'},{id:'yorgun',emoji:'🥱',label:'Yorgunluk'},{id:'duygu',emoji:'🥲',label:'Duygusal'},{id:'istah',emoji:'🍫',label:'İştah'},{id:'sanci',emoji:'⚡',label:'Sancı'},{id:'cilt',emoji:'🌋',label:'Cilt'}];
var DLEVELS=[{n:1,label:'Hafif',color:'#F4C152'},{n:2,label:'Orta',color:'#F0892F'},{n:3,label:'Şiddetli',color:'#E25B6A'}];
function dzColor(n){ return n>=3?'#E25B6A':(n===2?'#F0892F':(n>=1?'#F4C152':null)); }
var DMEDS=['Parasetamol (Parol)','İbuprofen (Nurofen/Brufen)','Naproksen (Apranax)','Aspirin','Flurbiprofen (Majezik)','Metamizol (Novalgin)','Diklofenak (Voltaren)'];
var BODY_REGIONS=[
  {id:'bas',label:'Baş',view:'front',s:'ellipse',cx:100,cy:38,rx:23,ry:27},
  {id:'boyun',label:'Boyun',view:'front',s:'rect',x:89,y:62,w:22,h:17,r:7},
  {id:'omuz-sol',label:'Sol omuz',view:'front',s:'ellipse',cx:62,cy:93,rx:17,ry:13},
  {id:'omuz-sag',label:'Sağ omuz',view:'front',s:'ellipse',cx:138,cy:93,rx:17,ry:13},
  {id:'gogus',label:'Göğüs',view:'front',s:'rect',x:72,y:86,w:56,h:46,r:16},
  {id:'karin',label:'Karın',view:'front',s:'rect',x:74,y:135,w:52,h:52,r:16},
  {id:'kol-sol',label:'Sol kol',view:'front',s:'rect',x:45,y:92,w:15,h:96,r:11},
  {id:'kol-sag',label:'Sağ kol',view:'front',s:'rect',x:140,y:92,w:15,h:96,r:11},
  {id:'el-sol',label:'Sol el / bilek',view:'front',s:'ellipse',cx:52,cy:197,rx:11,ry:13},
  {id:'el-sag',label:'Sağ el / bilek',view:'front',s:'ellipse',cx:148,cy:197,rx:11,ry:13},
  {id:'kalca',label:'Kasık / kalça',view:'front',s:'rect',x:75,y:189,w:50,h:34,r:14},
  {id:'diz-sol',label:'Sol diz',view:'front',s:'ellipse',cx:89,cy:300,rx:12,ry:14},
  {id:'diz-sag',label:'Sağ diz',view:'front',s:'ellipse',cx:111,cy:300,rx:12,ry:14},
  {id:'bacak-sol',label:'Sol bacak',view:'front',s:'rect',x:79,y:226,w:20,h:158,r:13},
  {id:'bacak-sag',label:'Sağ bacak',view:'front',s:'rect',x:101,y:226,w:20,h:158,r:13},
  {id:'ayak-sol',label:'Sol ayak',view:'front',s:'ellipse',cx:89,cy:396,rx:13,ry:12},
  {id:'ayak-sag',label:'Sağ ayak',view:'front',s:'ellipse',cx:111,cy:396,rx:13,ry:12},
  {id:'ense',label:'Ense',view:'back',s:'rect',x:89,y:62,w:22,h:17,r:7},
  {id:'omuz-arka-sol',label:'Sol omuz (arka)',view:'back',s:'ellipse',cx:62,cy:93,rx:17,ry:13},
  {id:'omuz-arka-sag',label:'Sağ omuz (arka)',view:'back',s:'ellipse',cx:138,cy:93,rx:17,ry:13},
  {id:'sirt-ust',label:'Üst sırt',view:'back',s:'rect',x:72,y:86,w:56,h:46,r:16},
  {id:'bel',label:'Bel',view:'back',s:'rect',x:74,y:135,w:52,h:52,r:16},
  {id:'kalca-arka',label:'Kalça',view:'back',s:'rect',x:75,y:189,w:50,h:34,r:14},
  {id:'kol-arka-sol',label:'Sol kol (arka)',view:'back',s:'rect',x:45,y:92,w:15,h:96,r:11},
  {id:'kol-arka-sag',label:'Sağ kol (arka)',view:'back',s:'rect',x:140,y:92,w:15,h:96,r:11},
  {id:'bacak-arka-sol',label:'Sol bacak (arka)',view:'back',s:'rect',x:79,y:226,w:20,h:158,r:13},
  {id:'bacak-arka-sag',label:'Sağ bacak (arka)',view:'back',s:'rect',x:101,y:226,w:20,h:158,r:13}
];
function findRegion(id){ for(var i=0;i<BODY_REGIONS.length;i++){ if(BODY_REGIONS[i].id===id) return BODY_REGIONS[i]; } return null; }
var DZ_SILHOUETTE='<g pointer-events="none" fill="rgba(150,120,180,0.12)" stroke="rgba(150,120,180,0.26)" stroke-width="1">'
+'<ellipse cx="100" cy="38" rx="23" ry="27"></ellipse>'
+'<rect x="89" y="60" width="22" height="20" rx="7"></rect>'
+'<path d="M64 92 Q100 78 136 92 L130 196 Q100 210 70 196 Z"></path>'
+'<rect x="45" y="92" width="15" height="100" rx="11"></rect>'
+'<rect x="140" y="92" width="15" height="100" rx="11"></rect>'
+'<ellipse cx="52" cy="198" rx="11" ry="13"></ellipse>'
+'<ellipse cx="148" cy="198" rx="11" ry="13"></ellipse>'
+'<rect x="78" y="200" width="20" height="186" rx="13"></rect>'
+'<rect x="102" y="200" width="20" height="186" rx="13"></rect>'
+'<ellipse cx="88" cy="396" rx="13" ry="12"></ellipse>'
+'<ellipse cx="112" cy="396" rx="13" ry="12"></ellipse>'
+'</g>';
// 4 menstrüel faz — kısa bilimsel notlar (tıbbi tavsiye değildir)
var PHASES={
  menstrual:{label:'Menstrüel faz',emoji:'🩸',color:'#E58B9B',note:'Regl günleri. Östrojen ve progesteron düşük. Demir açısından zengin beslenme ve nazik hareket iyi gelir.'},
  follicular:{label:'Foliküler faz',emoji:'🌱',color:'#8FBF8A',note:'Östrojen yükselişte. Enerji ve ruh hali genelde toparlanır; antrenmana en açık dönem.'},
  ovulation:{label:'Ovülasyon',emoji:'🌟',color:'#E8A53C',note:'Yumurtlama civarı, doğurganlık en yüksek. Hafif tek taraflı sancı (mittelschmerz) normal olabilir.'},
  luteal:{label:'Luteal faz',emoji:'🌙',color:'#9B7FC9',note:'Progesteron yükselir; regl öncesi (PMS) belirtileri bu dönemde olur. Magnezyum ve düzenli uyku destekler.'}
};

// ---------- state ----------
var data=null;
try{ var raw=localStorage.getItem(KEY); data=raw?JSON.parse(raw):null; }catch(e){ data=null; }
if(data) data=migrate(data);
function migrate(d){
  if(!d) return d;
  if(!d.settings) d.settings={nickname:'Sevgili Günışığı',notificationsWanted:false,haptics:true};
  if(typeof d.settings.ghToken!=='string') d.settings.ghToken='';
  if(typeof d.settings.ghRepo!=='string') d.settings.ghRepo='';
  if(typeof d.settings.ghBranch!=='string') d.settings.ghBranch='';
  if(typeof d.settings.openaiKey!=='string') d.settings.openaiKey='';
  if(typeof d.settings.lunaConnected!=='boolean') d.settings.lunaConnected=!!(d.settings.openaiKey&&String(d.settings.openaiKey).trim());
  if(typeof d.settings.locationEnabled!=='boolean') d.settings.locationEnabled=false;
  if(d.settings.locationMode!=='walk'&&d.settings.locationMode!=='vehicle'&&d.settings.locationMode!=='auto') d.settings.locationMode='auto';
  if(!d.luna||typeof d.luna!=='object') d.luna={qa:[],lastAskDate:null};
  if(!Array.isArray(d.luna.qa)) d.luna.qa=[];
  if(typeof d.luna.lastAskDate!=='string'&&d.luna.lastAskDate!==null) d.luna.lastAskDate=null;
  if(!d.aeon||typeof d.aeon!=='object') d.aeon={qa:[],lastAskDate:null};
  if(!Array.isArray(d.aeon.qa)) d.aeon.qa=[];
  if(typeof d.aeon.lastAskDate!=='string'&&d.aeon.lastAskDate!==null) d.aeon.lastAskDate=null;
  if(!d.settings.ghRepo) d.settings.ghRepo='mustafaras/seyma-data';
  if(!d.settings.ghBranch) d.settings.ghBranch='main';
  if(!d.cycle) d.cycle={periods:[],avgCycle:28,avgPeriod:5};
  if(!Array.isArray(d.cycle.periods)) d.cycle.periods=[];
  if(typeof d.cycle.avgCycle!=='number') d.cycle.avgCycle=28;
  if(typeof d.cycle.avgPeriod!=='number') d.cycle.avgPeriod=5;
  if(!Array.isArray(d.notifications)) d.notifications=[];
  if(!Array.isArray(d.locationHistory)) d.locationHistory=[];
  if(!d.locNudge||typeof d.locNudge!=='object') d.locNudge={};
  if(typeof d.locationLastTs!=='string'&&d.locationLastTs!==null) d.locationLastTs=null;
  if(d.location===undefined) d.location=null;
  if(d.weather===undefined) d.weather=null;
  if(typeof d.lastOpenedAt!=='string') d.lastOpenedAt='';
  if(!d.library||typeof d.library!=='object') d.library=emptyLibrary();
  if(!Array.isArray(d.library.books)) d.library.books=[];
  if(!d.library.goal||typeof d.library.goal!=='object') d.library.goal={dailyPages:20,yearlyBooks:null};
  d.library.books=d.library.books.map(normBook).filter(Boolean);
  if(!d.watchlist||typeof d.watchlist!=='object') d.watchlist=emptyWatchlist();
  if(!Array.isArray(d.watchlist.items)) d.watchlist.items=[];
  if(!d.watchlist.goal||typeof d.watchlist.goal!=='object') d.watchlist.goal={dailyMinutes:40,yearlyTitles:null};
  d.watchlist.items=d.watchlist.items.map(normTitle).filter(Boolean);
  if(!d.music||typeof d.music!=='object') d.music=emptyMusic();
  if(!Array.isArray(d.music.items)) d.music.items=[];
  if(!d.music.goal||typeof d.music.goal!=='object') d.music.goal={dailyMinutes:30,yearlyTitles:null};
  d.music.items=d.music.items.map(normTrack).filter(Boolean);
  d.version=2;
  return d;
}
var dark=false; try{ dark=localStorage.getItem(TKEY)==='dark'; }catch(e){}
var ui={tab:'bugun', sosOpts:[], sosTriggers:[], sosLeft:600, sosTiming:false, sosDone:false, dayDetail:null, emergency:false, resetStep:0, noteIndex:0, forceStart:false, pulse:null, keyEdit:false, readingOpen:false, readingDraft:null, readingView:'today', bookEdit:null, logBookId:null, quoteDraft:null, watchOpen:false, watchDraft:null, watchView:'today', titleEdit:null, logItemId:null, replicaDraft:null, lunaDraft:'', aeonDraft:'', askKind:null, askQuestion:'', lunaError:null, aeonError:null, openaiKeyState:null, stepNudgeHidden:false, stepRemindHidden:false, waterNudgeHidden:false, bodyView:'front', aeonScrollBottom:false, locationConsent:false, editDate:null, editStartMs:0, weatherOpen:false, heatYear:null, locNudgeOpen:false, locNudgeShown:[], aeonShowAllHistory:false};
var sosInterval=null, toastTimer=null, noteTimer=null, pulseTimer=null;
var lastRenderTab=null;
var lastOverlay=null;      // hangi hub overlay'i (reading/watching) bir onceki render'da aciykti
var lastOverlayView=null;  // o overlay'in aktif sekmesi — gorunum degismediyse scroll korunur
var aeonLastSeenSort=null; // ÆON: son render'da görünen en yeni mesajın sort anahtarı — yalnızca YENİ mesaja giriş animasyonu oynatmak için
var aeonLastRenderedDateStr=null; // ÆON: son gösterilen mesajın gün-etiketi — hızlı ekleme (appendAeonOutgoing) sırasında yeni gün ayırıcı gerekip gerekmediğini anlamak için
var AEON_PAGE_SIZE=40; // ÆON: geçmiş çok uzadığında her tam render'da yalnızca son N öğeyi kur — "Daha eski mesajlar" ile tamamı açılabilir
var fieldTimers={};
function debounceSave(k,fn,ms){ clearTimeout(fieldTimers[k]); fieldTimers[k]=setTimeout(fn,ms||450); }

// ---------- helpers ----------
function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function normalizeToken(v){ return String(v||'').replace(/[^\x20-\x7E]/g,'').trim(); }
function pad(n){ return String(n).padStart(2,'0'); }
function fmt(d){ return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
function todayStr(){ return fmt(new Date()); }
function addDays(s,n){ var p=s.split('-').map(Number); var dt=new Date(p[0],p[1]-1,p[2]); dt.setDate(dt.getDate()+n); return fmt(dt); }
function diffDays(a,b){ var pa=a.split('-').map(Number),pb=b.split('-').map(Number); var da=new Date(pa[0],pa[1]-1,pa[2]),db=new Date(pb[0],pb[1]-1,pb[2]); return Math.round((db-da)/86400000); }
function shortDate(s){ var p=s.split('-'); return p[2]+'.'+p[1]; }
function dayIndexFor(date){ return diffDays(data.startDate,date)+1; }
// ---- geçmiş gün düzenleme: aktif tarih ayrımı ----
// activeDate() = düzenlenen gün varsa o, yoksa bugün. Yalnızca MANUEL day-record
// yazımları burayı kullanır; otomatik/canlı yazımlar (konum, oturum, SOS) todayStr()'de kalır.
function activeDate(){ return (ui.editDate)?ui.editDate:todayStr(); }
function editing(){ return !!ui.editDate; }
function curDay(){ var d=activeDate(); return getDay(data,d,dayIndexFor(d)); }
function emptyHabits(){ var out={}; HABITS.forEach(function(h){ out[h.key]=false; }); return out; }
function countRec(rec){ return rec&&rec.habits?HABITS.reduce(function(a,h){return a+(rec.habits[h.key]?1:0);},0):0; }
function emptyMeals(){ return {breakfast:'',lunch:'',dinner:'',snack:''}; }
function emptyMealItems(){ return {breakfast:[],lunch:[],dinner:[],snack:[]}; }
function emptyWindDown(){ return {steps:{light:false,breath:false,dump:false,cool:false},lastMinutes:null,lastDoneAt:null,offloadNote:'',events:[],sessions:[]}; }

// ---------- besin tahmini (kaba; tıbbi/kesin değer değil) ----------
// per 100g => p: protein(g), c: kalori(kcal); piece: 1 adet ~gram; plate: 1 tabak ~gram
var FOOD_DB=[
  {k:['yumurta'],p:13,c:155,piece:50,plate:150},
  {k:['tavuk','piliç','hindi'],p:27,c:165,piece:120,plate:150},
  {k:['köfte','dana','biftek','kırmızı et','kebap','et '],p:26,c:250,piece:30,plate:150},
  {k:['somon','levrek','hamsi','balık','ton balığı'],p:22,c:200,piece:120,plate:150},
  {k:['peynir','lor','çökelek'],p:18,c:280,piece:30,plate:80},
  {k:['yoğurt','yogurt','cacık'],p:5,c:60,piece:150,plate:200},
  {k:['süt','ayran','kefir'],p:3.4,c:55,piece:200,plate:200},
  {k:['mercimek','nohut','fasulye','baklagil','barbunya'],p:9,c:120,piece:30,plate:200},
  {k:['bulgur','pilav','pirinç','makarna','erişte','kuskus'],p:4,c:140,piece:30,plate:180},
  {k:['ekmek','tost','simit','poğaça','börek'],p:8,c:265,piece:30,plate:60},
  {k:['salata','marul','domates','salatalık','brokoli','sebze','ıspanak'],p:2,c:30,piece:50,plate:150},
  {k:['çorba'],p:3,c:55,piece:200,plate:250},
  {k:['muz','elma','portakal','çilek','üzüm','meyve','armut','kayısı'],p:1,c:60,piece:120,plate:150},
  {k:['badem','ceviz','fındık','fıstık','kuruyemiş','antep'],p:20,c:600,piece:5,plate:40},
  {k:['zeytin'],p:1,c:115,piece:4,plate:40},
  {k:['çikolata','bitter','kek','kurabiye','tatlı','baklava','dondurma'],p:6,c:480,piece:20,plate:90},
  {k:['protein tozu','whey','shake','protein bar'],p:22,c:120,piece:30,plate:30},
  {k:['patates','kızartma','cips'],p:2,c:90,piece:120,plate:180},
  {k:['bal','reçel','pekmez'],p:0.5,c:300,piece:20,plate:40}
];
var FOOD_FALLBACK={p:7,c:150,piece:60,plate:200};
var MEAL_UNITS=[{id:'tabak',label:'tabak'},{id:'gr',label:'gr'},{id:'adet',label:'adet'}];
var PROTEIN_GOAL=60, CAL_GOAL=1800, WATER_GOAL=8, STEP_TICK_MIN=2000, STEP_LEN_M=0.72;
function foodLookup(name){
  var n=String(name||'').toLowerCase().trim(); if(!n) return null;
  for(var i=0;i<FOOD_DB.length;i++){ var f=FOOD_DB[i]; for(var j=0;j<f.k.length;j++){ if(n.indexOf(f.k[j])>=0) return f; } }
  return null;
}
function mealItemNutr(it){
  if(!it||!it.name||!String(it.name).trim()) return {grams:0,protein:0,calories:0,known:false};
  var f=foodLookup(it.name), known=!!f; if(!f) f=FOOD_FALLBACK;
  var q=Number(it.qty); if(isNaN(q)||q<0) q=0;
  var g; if(it.unit==='gr') g=q; else if(it.unit==='adet') g=q*(f.piece||FOOD_FALLBACK.piece); else g=q*(f.plate||FOOD_FALLBACK.plate);
  return {grams:g, protein:g*(f.p||0)/100, calories:g*(f.c||0)/100, known:known};
}
function mealNutr(rec,key){ var arr=(rec&&rec.mealItems&&rec.mealItems[key])||[]; var P=0,C=0,n=0; arr.forEach(function(it){ if(!it||!it.name||!String(it.name).trim())return; var nu=mealItemNutr(it); P+=nu.protein; C+=nu.calories; n++; }); return {protein:P,calories:C,items:n}; }
function dayNutrition(rec){ var P=0,C=0,n=0; ['breakfast','lunch','dinner','snack'].forEach(function(k){ var m=mealNutr(rec,k); P+=m.protein; C+=m.calories; n+=m.items; }); return {protein:Math.round(P), calories:Math.round(C), items:n}; }
function updateNutriLive(day){ var nu=dayNutrition(day); var pv=document.getElementById('nutri-protein'); if(pv) pv.textContent=nu.protein+'g'; var cv=document.getElementById('nutri-cal'); if(cv) cv.textContent=nu.calories; var bar=document.getElementById('nutri-bar'); if(bar) bar.style.width=Math.min(100,Math.round(nu.protein/PROTEIN_GOAL*100))+'%'; }
function syncMealText(day,key){ if(!day.meals) day.meals=emptyMeals(); var arr=(day.mealItems&&day.mealItems[key])||[]; day.meals[key]=arr.filter(function(it){return it&&it.name&&String(it.name).trim();}).map(function(it){ var u=it.unit==='gr'?'gr':(it.unit==='adet'?' adet':' tabak'); var q=(it.qty===''||it.qty==null)?'':it.qty; return (q!==''?q+u+' ':'')+String(it.name).trim(); }).join(', '); }
function medFreeStreak(){ var c=0, date=todayStr(); var t=data.days[date]; if(!(t&&t.sleep&&t.sleep.med&&t.sleep.med.type==='none')) date=addDays(date,-1); while(diffDays(data.startDate,date)>=0){ var r=data.days[date]; if(r&&r.sleep&&r.sleep.med&&r.sleep.med.type==='none'){ c++; date=addDays(date,-1); } else break; } return c; }
function getDay(d,date,idx){ if(!d.days[date]) d.days[date]={dayIndex:idx,habits:emptyHabits(),mood:null,cravingSOSCount:0,cravingOptionsUsed:[],cravingTriggers:[],note:'',intention:'',savedAt:null,meals:emptyMeals(),mealItems:emptyMealItems(),water:0,caffeine:{last:null,cups:null},energy:null,stress:null,sleep:{hours:null,quality:null,med:{type:null,note:''},windDown:emptyWindDown()},walk:{steps:null,minutes:null},flow:null,symptoms:[],discomfort:emptyDiscomfort(),sessions:[],movement:emptyMovement(),reading:emptyReading(),watching:emptyWatching(),listening:emptyListening(),gratitude:[]}; else { var r=d.days[date]; if(!r.habits) r.habits=emptyHabits(); HABITS.forEach(function(h){ if(!(h.key in r.habits)) r.habits[h.key]=false; }); if(!r.meals) r.meals=emptyMeals(); if(!r.mealItems||typeof r.mealItems!=='object') r.mealItems=emptyMealItems(); ['breakfast','lunch','dinner','snack'].forEach(function(k){ if(!Array.isArray(r.mealItems[k])) r.mealItems[k]=[]; }); if(typeof r.water!=='number'||isNaN(r.water)) r.water=0; if(!r.caffeine||typeof r.caffeine!=='object') r.caffeine={last:null,cups:null}; if(!('energy' in r)) r.energy=null; if(!('stress' in r)) r.stress=null; if(!Array.isArray(r.cravingTriggers)) r.cravingTriggers=[]; if(!r.sleep) r.sleep={hours:null,quality:null,med:{type:null,note:''},windDown:emptyWindDown()}; if(!r.sleep.med||typeof r.sleep.med!=='object') r.sleep.med={type:null,note:''}; if(typeof r.sleep.med.note!=='string') r.sleep.med.note=''; if(!r.sleep.windDown) r.sleep.windDown=emptyWindDown(); if(!r.sleep.windDown.steps) r.sleep.windDown.steps=emptyWindDown().steps; WIND_DOWN_STEPS.forEach(function(s){ if(!(s.key in r.sleep.windDown.steps)) r.sleep.windDown.steps[s.key]=false; }); if(typeof r.sleep.windDown.offloadNote!=='string') r.sleep.windDown.offloadNote=''; if(!Array.isArray(r.sleep.windDown.events)) r.sleep.windDown.events=[]; if(!Array.isArray(r.sleep.windDown.sessions)) r.sleep.windDown.sessions=[]; if(!r.walk) r.walk={steps:null,minutes:null}; if(!('flow' in r)) r.flow=null; if(!Array.isArray(r.symptoms)) r.symptoms=[]; if(!r.discomfort||typeof r.discomfort!=='object') r.discomfort=emptyDiscomfort(); if(!r.discomfort.regions||typeof r.discomfort.regions!=='object') r.discomfort.regions={}; if(typeof r.discomfort.note!=='string') r.discomfort.note=''; if(!Array.isArray(r.discomfort.meds)) r.discomfort.meds=[]; if(!Array.isArray(r.sessions)) r.sessions=[]; if(!r.movement||typeof r.movement!=='object') r.movement=emptyMovement(); if(!Array.isArray(r.movement.track)) r.movement.track=[]; ['walkM','vehicleM','totalM','maxSpeed','samples','walkSec','vehicleSec'].forEach(function(k){ if(typeof r.movement[k]!=='number'||isNaN(r.movement[k])) r.movement[k]=0; }); if(!r.reading||typeof r.reading!=='object') r.reading=emptyReading(); if(!Array.isArray(r.reading.entries)) r.reading.entries=[]; if(!r.watching||typeof r.watching!=='object') r.watching=emptyWatching(); if(!Array.isArray(r.watching.entries)) r.watching.entries=[]; if(!r.listening||typeof r.listening!=='object') r.listening=emptyListening(); if(!Array.isArray(r.listening.entries)) r.listening.entries=[]; if(!Array.isArray(r.gratitude)) r.gratitude=[]; if(typeof r.intention!=='string') r.intention=''; } return d.days[date]; }
function emptyMovement(){ return {walkM:0,vehicleM:0,totalM:0,maxSpeed:0,samples:0,walkSec:0,vehicleSec:0,track:[]}; }
function emptyReading(){ return {entries:[]}; }
function dayMovement(rec){ var m=(rec&&rec.movement&&typeof rec.movement==='object')?rec.movement:null; return {total:m?(m.totalM||0):0, walk:m?(m.walkM||0):0, veh:m?(m.vehicleM||0):0, max:m?(m.maxSpeed||0):0}; }
function trackedSteps(rec){ var w=dayMovement(rec).walk; return w>0?Math.round(w/STEP_LEN_M):0; }
function effSteps(rec){ var manual=(rec&&rec.walk&&rec.walk.steps!=null&&rec.walk.steps!=='')?Number(rec.walk.steps):null; if(manual!=null&&!isNaN(manual)) return {steps:manual,source:'manual'}; var tr=trackedSteps(rec); if(tr>0) return {steps:tr,source:'tracked'}; return {steps:null,source:'none'}; }
function readingStats(rec){ var en=(rec&&rec.reading&&Array.isArray(rec.reading.entries))?rec.reading.entries:[]; var pages=0,minutes=0; en.forEach(function(e){ if(!e) return; var p=Number(e.pages); if(!isNaN(p)&&p>0) pages+=p; var m=Number(e.minutes); if(!isNaN(m)&&m>0) minutes+=m; }); return {count:en.length,pages:pages,minutes:minutes,entries:en}; }

// ---------- Kitaplık & İzleme (kalıcı arşiv) ----------
function uid(p){ return (p||'id')+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6); }
function emptyWatching(){ return {entries:[]}; }
function emptyLibrary(){ return {books:[],goal:{dailyPages:20,yearlyBooks:null}}; }
function emptyWatchlist(){ return {items:[],goal:{dailyMinutes:40,yearlyTitles:null}}; }
function emptyListening(){ return {entries:[]}; }
function emptyMusic(){ return {items:[],goal:{dailyMinutes:30,yearlyTitles:null}}; }
var BOOK_EMOJI=['📖','📕','📗','📘','📙','📓','📔','📚','📜','🕮'];
var BOOK_GENRES=['Roman','Klasik','Kişisel gelişim','Şiir','Öykü','Bilim','Tarih','Felsefe','Polisiye','Fantastik'];
var TITLE_EMOJI=['🎬','🍿','📺','🎞️','🚀','🕵️','❤️','😂','👑','🧟','🐉','⚔️'];
var TITLE_GENRES=['Dram','Komedi','Aksiyon','Bilimkurgu','Gerilim','Romantik','Belgesel','Fantastik','Animasyon','Suç'];
function normBook(b){ if(!b||typeof b!=='object') return null; if(!b.id) b.id=uid('b'); b.title=String(b.title==null?'':b.title); b.author=String(b.author==null?'':b.author); b.genre=String(b.genre==null?'':b.genre); if(!b.emoji) b.emoji='📖'; b.totalPages=(b.totalPages==null||b.totalPages==='')?null:Math.max(0,Math.round(Number(b.totalPages)||0)); b.currentPage=Math.max(0,Math.round(Number(b.currentPage)||0)); if(['reading','finished','dropped'].indexOf(b.status)<0) b.status='reading'; b.rating=(b.rating==null||b.rating==='')?null:Math.max(1,Math.min(5,Math.round(Number(b.rating)||0))); if(typeof b.note!=='string') b.note=''; if(!Array.isArray(b.quotes)) b.quotes=[]; if(b.startedAt===undefined) b.startedAt=null; if(b.finishedAt===undefined) b.finishedAt=null; if(!b.createdAt) b.createdAt=new Date().toISOString(); return b; }
function normTitle(t){ if(!t||typeof t!=='object') return null; if(!t.id) t.id=uid('w'); t.title=String(t.title==null?'':t.title); if(t.kind!=='film'&&t.kind!=='dizi') t.kind='film'; t.genre=String(t.genre==null?'':t.genre); if(!t.emoji) t.emoji=(t.kind==='dizi'?'📺':'🎬'); t.totalEp=(t.totalEp==null||t.totalEp==='')?null:Math.max(0,Math.round(Number(t.totalEp)||0)); t.watchedEp=Math.max(0,Math.round(Number(t.watchedEp)||0)); if(['watching','finished','dropped'].indexOf(t.status)<0) t.status='watching'; t.rating=(t.rating==null||t.rating==='')?null:Math.max(1,Math.min(5,Math.round(Number(t.rating)||0))); if(typeof t.note!=='string') t.note=''; if(!Array.isArray(t.quotes)) t.quotes=[]; if(t.startedAt===undefined) t.startedAt=null; if(t.finishedAt===undefined) t.finishedAt=null; if(!t.createdAt) t.createdAt=new Date().toISOString(); return t; }
function ensureLibrary(){ if(!data.library||typeof data.library!=='object') data.library=emptyLibrary(); if(!Array.isArray(data.library.books)) data.library.books=[]; if(!data.library.goal||typeof data.library.goal!=='object') data.library.goal={dailyPages:20,yearlyBooks:null}; return data.library; }
function ensureWatchlist(){ if(!data.watchlist||typeof data.watchlist!=='object') data.watchlist=emptyWatchlist(); if(!Array.isArray(data.watchlist.items)) data.watchlist.items=[]; if(!data.watchlist.goal||typeof data.watchlist.goal!=='object') data.watchlist.goal={dailyMinutes:40,yearlyTitles:null}; return data.watchlist; }
function findBook(id){ var L=ensureLibrary(); for(var i=0;i<L.books.length;i++){ if(L.books[i]&&L.books[i].id===id) return L.books[i]; } return null; }
function findTitle(id){ var W=ensureWatchlist(); for(var i=0;i<W.items.length;i++){ if(W.items[i]&&W.items[i].id===id) return W.items[i]; } return null; }
function normTrack(x){ if(!x||typeof x!=='object') return null; if(!x.id) x.id=uid('m'); x.title=String(x.title==null?'':x.title); x.artist=String(x.artist==null?'':x.artist); if(['sarki','album','podcast'].indexOf(x.kind)<0) x.kind='sarki'; x.genre=String(x.genre==null?'':x.genre); if(!x.emoji) x.emoji=(x.kind==='podcast'?'🎙️':(x.kind==='album'?'💿':'🎵')); x.rating=(x.rating==null||x.rating==='')?null:Math.max(1,Math.min(5,Math.round(Number(x.rating)||0))); if(!Array.isArray(x.quotes)) x.quotes=[]; if(!x.createdAt) x.createdAt=new Date().toISOString(); return x; }
function ensureMusic(){ if(!data.music||typeof data.music!=='object') data.music=emptyMusic(); if(!Array.isArray(data.music.items)) data.music.items=[]; if(!data.music.goal||typeof data.music.goal!=='object') data.music.goal={dailyMinutes:30,yearlyTitles:null}; return data.music; }
function findTrack(id){ var M=ensureMusic(); for(var i=0;i<M.items.length;i++){ if(M.items[i]&&M.items[i].id===id) return M.items[i]; } return null; }
function bookPct(b){ if(!b||!b.totalPages||b.totalPages<=0) return b&&b.status==='finished'?100:0; return Math.max(0,Math.min(100,Math.round((b.currentPage/b.totalPages)*100))); }
function titlePct(t){ if(!t) return 0; if(!t.totalEp||t.totalEp<=0) return t.status==='finished'?100:0; return Math.max(0,Math.min(100,Math.round((t.watchedEp/t.totalEp)*100))); }
// istatistik
function libStats(){ var L=ensureLibrary(); var yr=new Date().getFullYear(),reading=0,finished=0,dropped=0,finYear=0; L.books.forEach(function(b){ if(b.status==='finished'){ finished++; if(b.finishedAt&&new Date(b.finishedAt).getFullYear()===yr) finYear++; } else if(b.status==='dropped') dropped++; else reading++; }); return {reading:reading,finished:finished,dropped:dropped,finYear:finYear,total:L.books.length}; }
function readTotals(){ var pages=0,minutes=0,days=0; for(var d in data.days){ var st=readingStats(data.days[d]); if(st.count>0){ days++; pages+=st.pages; minutes+=st.minutes; } } return {pages:pages,minutes:minutes,days:days}; }
function hasRead(date){ var r=data.days[date]; return !!(r&&r.reading&&Array.isArray(r.reading.entries)&&r.reading.entries.length>0); }
function readStreak(){ var c=todayStr(); if(!hasRead(c)) c=addDays(c,-1); var n=0,guard=0; while(hasRead(c)&&guard++<4000){ n++; c=addDays(c,-1); } return n; }
function weekReading(){ var out=[],t=todayStr(); for(var i=6;i>=0;i--){ var d=addDays(t,-i); out.push({date:d,pages:readingStats(data.days[d]).pages,label:shortDate(d)}); } return out; }
function todayReadPages(){ return readingStats(data.days[todayStr()]).pages; }
function allQuotes(){ var L=ensureLibrary(),out=[]; L.books.forEach(function(b){ (b.quotes||[]).forEach(function(q){ out.push({bookId:b.id,title:b.title,emoji:b.emoji,q:q}); }); }); out.sort(function(a,b){ return String(b.q.ts||'').localeCompare(String(a.q.ts||'')); }); return out; }
function watchStats(){ var W=ensureWatchlist(); var yr=new Date().getFullYear(),watching=0,finished=0,dropped=0,finYear=0; W.items.forEach(function(t){ if(t.status==='finished'){ finished++; if(t.finishedAt&&new Date(t.finishedAt).getFullYear()===yr) finYear++; } else if(t.status==='dropped') dropped++; else watching++; }); return {watching:watching,finished:finished,dropped:dropped,finYear:finYear,total:W.items.length}; }
function watchDayStats(rec){ var en=(rec&&rec.watching&&Array.isArray(rec.watching.entries))?rec.watching.entries:[]; var minutes=0,eps=0; en.forEach(function(e){ if(!e) return; var m=Number(e.minutes); if(!isNaN(m)&&m>0) minutes+=m; var ep=Number(e.episodes); if(!isNaN(ep)&&ep>0) eps+=ep; }); return {count:en.length,minutes:minutes,eps:eps,entries:en}; }
function watchTotals(){ var minutes=0,eps=0,days=0; for(var d in data.days){ var st=watchDayStats(data.days[d]); if(st.count>0){ days++; minutes+=st.minutes; eps+=st.eps; } } return {minutes:minutes,eps:eps,days:days}; }
function hasWatch(date){ var r=data.days[date]; return !!(r&&r.watching&&Array.isArray(r.watching.entries)&&r.watching.entries.length>0); }
function watchStreak(){ var c=todayStr(); if(!hasWatch(c)) c=addDays(c,-1); var n=0,guard=0; while(hasWatch(c)&&guard++<4000){ n++; c=addDays(c,-1); } return n; }
function weekWatch(){ var out=[],t=todayStr(); for(var i=6;i>=0;i--){ var d=addDays(t,-i); out.push({date:d,minutes:watchDayStats(data.days[d]).minutes,label:shortDate(d)}); } return out; }
function todayWatchMin(){ return watchDayStats(data.days[todayStr()]).minutes; }
function allReplicas(){ var W=ensureWatchlist(),out=[]; W.items.forEach(function(t){ (t.quotes||[]).forEach(function(q){ out.push({itemId:t.id,title:t.title,emoji:t.emoji,q:q}); }); }); out.sort(function(a,b){ return String(b.q.ts||'').localeCompare(String(a.q.ts||'')); }); return out; }
function listenDayStats(rec){ var en=(rec&&rec.listening&&Array.isArray(rec.listening.entries))?rec.listening.entries:[]; var minutes=0; en.forEach(function(e){ if(!e) return; var m=Number(e.minutes); if(!isNaN(m)&&m>0) minutes+=m; }); return {count:en.length,minutes:minutes,entries:en}; }
function listenTotals(){ var minutes=0,items=0,days=0; for(var d in data.days){ var st=listenDayStats(data.days[d]); if(st.count>0){ days++; minutes+=st.minutes; items+=st.count; } } return {minutes:minutes,items:items,days:days}; }
function hasListen(date){ var r=data.days[date]; return !!(r&&r.listening&&Array.isArray(r.listening.entries)&&r.listening.entries.length>0); }
function weekListen(){ var out=[],t=todayStr(); for(var i=6;i>=0;i--){ var d=addDays(t,-i); out.push({date:d,minutes:listenDayStats(data.days[d]).minutes,label:shortDate(d)}); } return out; }
function listenStreak(){ var c=todayStr(); if(!hasListen(c)) c=addDays(c,-1); var n=0,guard=0; while(hasListen(c)&&guard++<4000){ n++; c=addDays(c,-1); } return n; }
function musicStats(){ var M=ensureMusic(); var byKind={sarki:0,album:0,podcast:0}; M.items.forEach(function(x){ if(byKind[x.kind]!=null) byKind[x.kind]++; }); return {total:M.items.length,sarki:byKind.sarki,album:byKind.album,podcast:byKind.podcast}; }
function allLyrics(){ var M=ensureMusic(),out=[]; M.items.forEach(function(x){ (x.quotes||[]).forEach(function(q){ out.push({itemId:x.id,title:x.title,emoji:x.emoji,artist:x.artist,q:q}); }); }); out.sort(function(a,b){ return String(b.q.ts||'').localeCompare(String(a.q.ts||'')); }); return out; }
function fmtDur(min){ min=Math.max(0,Math.round(Number(min)||0)); if(min<60) return min+' dk'; var h=Math.floor(min/60),m=min%60; return h+' sa'+(m?' '+m+' dk':''); }
// ---------- ortak UI parçaları ----------
function segTabs(defs,active,fn,accent){ var grad=(accent==='watch')?'linear-gradient(135deg,#C88F4C,#E0B080)':(accent==='listen')?'linear-gradient(135deg,#0E9AA7,#2BC4C4)':'linear-gradient(135deg,#6E55BF,#9B7FC9)'; var glow=(accent==='watch')?'0 6px 14px rgba(200,143,76,0.30)':(accent==='listen')?'0 6px 14px rgba(14,154,167,0.30)':'0 6px 14px rgba(110,85,191,0.32)'; var h='<div style="display:flex;gap:4px;background:var(--icon);border-radius:14px;padding:4px;">'; defs.forEach(function(d){ var on=active===d[0]; h+='<button onclick="'+fn+'(\''+d[0]+'\')" style="flex:1;border:none;cursor:pointer;padding:8px 4px;border-radius:11px;font-size:12px;font-weight:800;white-space:nowrap;color:'+(on?'#fff':'var(--muted)')+';background:'+(on?grad:'transparent')+';box-shadow:'+(on?glow:'none')+';transition:all .18s;">'+d[1]+'</button>'; }); h+='</div>'; return h; }
function progBar(pct,col){ pct=Math.max(0,Math.min(100,Number(pct)||0)); col=col||'linear-gradient(90deg,#6E55BF,#E9AFC1)'; return '<div style="height:8px;border-radius:999px;background:var(--icon);overflow:hidden;"><div style="height:100%;width:'+pct+'%;border-radius:999px;background:'+col+';transition:width .4s;"></div></div>'; }
function starRow(rating,fn,id,size){ size=size||16; var h='<div style="display:flex;gap:3px;">'; for(var s=1;s<=5;s++){ var on=rating!=null&&s<=rating; h+='<button onclick="'+fn+'(\''+esc(id)+'\','+s+')" aria-label="'+s+' yıldız" style="border:none;background:none;cursor:pointer;padding:0;font-size:'+size+'px;line-height:1;filter:'+(on?'none':'grayscale(1)')+';opacity:'+(on?'1':'0.45')+';">⭐</button>'; } h+='</div>'; return h; }
function miniBars(rows,valKey,unit,col){ var max=1; rows.forEach(function(r){ if(r[valKey]>max) max=r[valKey]; }); var h='<div style="display:flex;align-items:flex-end;gap:6px;height:88px;">'; rows.forEach(function(r){ var v=r[valKey]||0; var hp=Math.round((v/max)*72)+4; var today=r.date===todayStr(); h+='<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;justify-content:flex-end;"><div style="font-size:9.5px;color:var(--faint);font-weight:700;">'+(v>0?v:'')+'</div><div style="width:100%;max-width:26px;height:'+hp+'px;border-radius:7px;background:'+(v>0?(col||'linear-gradient(180deg,#9B7FC9,#6E55BF)'):'var(--icon)')+';'+(today?'outline:2px solid #E9AFC1;outline-offset:1px;':'')+'"></div><div style="font-size:9px;color:'+(today?'var(--accent)':'var(--faint)')+';font-weight:'+(today?'800':'600')+';">'+esc(r.label)+'</div></div>'; }); h+='</div>'; return h; }
function statTile(label,val,sub){ return '<div style="flex:1;min-width:0;background:var(--card);border:1px solid var(--card-bd);border-radius:16px;padding:12px 10px;text-align:center;"><div style="font-size:22px;font-weight:800;color:var(--text);line-height:1.1;font-variant-numeric:tabular-nums;">'+val+'</div><div style="font-size:11px;color:var(--muted);font-weight:700;margin-top:3px;">'+esc(label)+'</div>'+(sub?'<div style="font-size:10px;color:var(--faint);margin-top:1px;">'+esc(sub)+'</div>':'')+'</div>'; }
function spanEnd(){ var end=todayStr(); for(var d in data.days){ if(diffDays(d,end)<0) end=d; } return end; }
function allDays(){ var out=[],s=data.startDate; var n=Math.max(1,diffDays(s,spanEnd())+1); if(n>3000) n=3000; for(var i=0;i<n;i++){ var date=addDays(s,i); out.push({i:i+1,date:date,rec:data.days[date]||null}); } return out; }
function bestStreak(days){ var b=0,c=0; days.forEach(function(d){ if(countRec(d.rec)>=4){c++;b=Math.max(b,c);} else c=0; }); return b; }
function topMood(moods){ var k=null,m=0; for(var x in moods){ if(moods[x]>m){m=moods[x];k=x;} } var o=k?find(MOODS,'id',k):null; return o?o.label:'—'; }
function moodEmoji(id){ var o=find(MOODS,'id',id); return o?o.emoji:''; }
function find(arr,key,val){ for(var i=0;i<arr.length;i++){ if(arr[i][key]===val) return arr[i]; } return null; }
function currentStreak(){ var c=0,date=todayStr(); if(countRec(data.days[date])<4) date=addDays(date,-1); while(diffDays(data.startDate,date)>=0){ if(countRec(data.days[date])>=4){ c++; date=addDays(date,-1); } else break; } return c; }
function daysTracked(){ var n=0; for(var d in data.days){ var r=data.days[d]; if(countRec(r)>0||(r&&r.mood)||(r&&r.note)||(r&&r.intention)||(r&&r.meals&&(r.meals.breakfast||r.meals.lunch||r.meals.dinner||r.meals.snack))) n++; } return n; }
function syncConfigured(){ var s=data.settings||{}; return !!(s.ghToken&&s.ghRepo); }
function savedToday(){ return data.lastSyncDate===todayStr(); }
function saveBanner(){
  if(!syncConfigured()) return '<div id="sey-save-banner" onclick="App.go(\'ayarlar\')" style="cursor:pointer;background:linear-gradient(135deg,#FFE19A,#F7C9B0);border-radius:18px;padding:13px 15px;display:flex;align-items:center;gap:11px;box-shadow:0 8px 20px rgba(240,180,140,0.3);"><span style="font-size:22px;">🔗</span><div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:800;color:#7A4A2E;">Repoya bağlan</div><div style="font-size:12px;color:#8A5A3E;line-height:1.35;">Verilerin kaydedilsin diye Ayarlar\'dan bir kez bağlan.</div></div><span style="font-size:18px;color:#7A4A2E;">›</span></div>';
  if(savedToday()) return '<div id="sey-save-banner" style="background:rgba(143,191,138,0.16);border:1px solid rgba(143,191,138,0.4);border-radius:16px;padding:10px 14px;display:flex;align-items:center;gap:9px;"><span style="font-size:16px;">✅</span><span style="font-size:13px;font-weight:600;color:var(--text2);">Bugün repoya kaydedildi. Harika.</span></div>';
  return '<div id="sey-save-banner" style="background:linear-gradient(135deg,#E9899F,#C9B8FF);border-radius:18px;padding:14px 15px;display:flex;align-items:center;gap:11px;box-shadow:0 10px 24px rgba(220,130,150,0.4);"><span style="font-size:22px;">📌</span><div style="flex:1;min-width:0;"><div style="font-size:14.5px;font-weight:800;color:#fff;">Bugünü kaydet</div><div style="font-size:12px;color:rgba(255,255,255,0.92);line-height:1.35;">Günlük kayıt önemli — tek dokunuşla repoya gönder.</div></div><button onclick="App.saveToday()" style="border:none;cursor:pointer;background:rgba(255,255,255,0.95);color:#B05070;font-weight:800;font-size:13px;padding:9px 15px;border-radius:12px;flex-shrink:0;">Kaydet</button></div>';
}
function updateSaveBanner(){ var el=document.getElementById('sey-save-banner'); if(el){ var t=document.createElement('div'); t.innerHTML=saveBanner(); if(t.firstChild) el.replaceWith(t.firstChild); } }
// ---- geçmiş gün düzenleme: tarih etiketi + kalıcı uyarı şeridi ----
function dateLabelTR(s){ if(!s) return ''; var p=s.split('-').map(Number); var dt=new Date(p[0],p[1]-1,p[2]); var mo=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık']; var wd=['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi']; return p[2]+' '+mo[p[1]-1]+' '+wd[dt.getDay()]; }
function editBanner(){
  var d=ui.editDate; if(!d) return '';
  var idx=dayIndexFor(d);
  return '<div style="position:sticky;top:0;z-index:60;background:linear-gradient(135deg,#F6A93B,#EC6A5B);border-radius:16px;padding:12px 14px;display:flex;align-items:center;gap:11px;box-shadow:0 10px 24px rgba(236,120,80,0.4);">'
    +'<span style="font-size:22px;line-height:1;">📅</span>'
    +'<div style="flex:1;min-width:0;color:#fff;"><div style="font-size:14.5px;font-weight:800;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+(idx>=1?'Gün '+idx+' · ':'')+esc(dateLabelTR(d))+'</div><div style="font-size:11.5px;line-height:1.35;opacity:0.95;">Geçmiş günü düzenliyorsun — girdiğin veriler bu güne yazılır.</div></div>'
    +'<button onclick="App.exitEdit()" style="flex-shrink:0;border:none;cursor:pointer;background:rgba(255,255,255,0.95);color:#C24A2E;font-weight:800;font-size:12.5px;padding:9px 13px;border-radius:12px;white-space:nowrap;">Bugüne dön ☀️</button>'
    +'</div>';
}
window.SeyOnSynced=function(date){ data.lastSyncDate=todayStr(); if(data&&Array.isArray(data.notifications)) data.notifications.forEach(function(n){ if(n) n.synced=true; }); if(data&&data.aeon&&Array.isArray(data.aeon.qa)) data.aeon.qa.forEach(function(x){ if(x&&x.answer) x.answerSynced=true; }); ui.keyEdit=false; try{ localStorage.setItem(KEY,JSON.stringify(data)); }catch(e){} updateSaveBanner(); if(ui.tab==='ayarlar') render(); };
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(data)); }catch(e){} if(window.SeySync){ try{ window.SeySync.schedule(data); }catch(e){} } }
function commit(msg){ save(); render(); if(msg) toast(msg); }
// Haptik geri bildirim (destekleyen cihazlarda); Ayarlar'dan kapatılabilir
function haptic(p){ try{ if(navigator.vibrate && !(data&&data.settings&&data.settings.haptics===false)) navigator.vibrate(p); }catch(e){} }

function interp(sweet,walk,evening){
  if(sweet>=5) return 'Tatlı kontrolünde ritim oluşuyor. Kavga değil, yönetim.';
  if(evening>=5) return 'Akşam atıştırması azaldıkça sabah daha hafif başlar.';
  if(walk>=4) return 'Yürüyüş günleri artmış. Bu Şeyma hanımın lehine delildir.';
  if(sweet+walk+evening>=3) return 'Zor günler var ama sistem devam ediyor. Olay bu.';
  return 'Bir haftada birkaç küçük hamle bile gayet iş yapar.';
}
function weekBlock(w,days){
  var slice=days.slice(w*7,w*7+7);
  var defs=[['sweetManaged','Tatlı kontrolü'],['eveningControl','Akşam kontrolü'],['walked20','Yürüyüş'],['protein','Protein'],['water','Su'],['vitaminD','D vitamini'],['sleepReg','Uyku düzeni'],['journaled','Günlük notu'],['freshAir','Açık hava'],['selfKind','Kendime iyi davrandım']];
  var cnt=function(k){ return slice.reduce(function(a,o){return a+(o.rec&&o.rec.habits[k]?1:0);},0); };
  var rows=defs.map(function(d){ return {label:d[1],val:cnt(d[0])+'/7'}; });
  var totalC=slice.reduce(function(a,o){return a+countRec(o.rec);},0);
  var moods={}; slice.forEach(function(o){ if(o.rec&&o.rec.mood) moods[o.rec.mood]=(moods[o.rec.mood]||0)+1; });
  return {title:'Gün '+(w*7+1)+'-'+(w*7+7),rows:rows,avg:(totalC/7).toFixed(1)+'/'+htToday(),best:bestStreak(slice)+' gün',mood:topMood(moods),interp:interp(cnt('sweetManaged'),cnt('walked20'),cnt('eveningControl'))};
}

// ---------- toast & confetti ----------
function toast(msg,ms){
  var ex=document.getElementById('sey-toast'); if(ex) ex.remove();
  var t=document.createElement('div'); t.id='sey-toast';
  t.style.cssText='position:fixed;left:50%;bottom:92px;transform:translateX(-50%);z-index:400;background:rgba(44,36,38,0.92);color:#fff;padding:11px 20px;border-radius:999px;font-size:14px;font-weight:600;box-shadow:0 10px 30px rgba(0,0,0,0.25);animation:seyToast .25s ease;max-width:88vw;text-align:center;';
  t.textContent=msg; document.body.appendChild(t);
  clearTimeout(toastTimer); toastTimer=setTimeout(function(){ if(t.parentNode) t.remove(); }, ms||1600);
}
function confetti(){
  var colors=['#E9AFC1','#C9B8FF','#FFE8A3','#F7DDE5','#6B4A3A'];
  var wrap=document.createElement('div'); wrap.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;';
  for(var i=0;i<48;i++){ var p=document.createElement('div'); var c=colors[i%colors.length]; var sz=6+Math.random()*8; p.style.cssText='position:absolute;top:-16px;left:'+(Math.random()*100)+'%;width:'+sz+'px;height:'+(sz*0.6)+'px;background:'+c+';border-radius:2px;opacity:0.9;animation:seyConfetti '+(2+Math.random()*1.6)+'s '+(Math.random()*0.35)+'s ease-in forwards;'; wrap.appendChild(p); }
  document.body.appendChild(wrap); setTimeout(function(){ wrap.remove(); },4400);
}

// ---------- actions (exposed) ----------
var App={};
App.start=function(){ var t=todayStr(),nowIso=new Date().toISOString(); data={version:2,startDate:t,lastOpenedDate:t,lastOpenedAt:nowIso,days:{},notifications:[],luna:{qa:[],lastAskDate:null},aeon:{qa:[],lastAskDate:null},settings:{nickname:'Sevgili Günışığı',notificationsWanted:false,haptics:true,ghToken:'',ghRepo:'mustafaras/seyma-data',ghBranch:'main',openaiKey:'',locationEnabled:false,locationMode:'auto',lunaConnected:false},cycle:{periods:[],avgCycle:28,avgPeriod:5},library:emptyLibrary(),watchlist:emptyWatchlist(),music:emptyMusic()}; ui.forceStart=false; ui.tab='bugun'; commit('Hadi başlayalım ☀️'); };
App.go=function(id){ ui.tab=id; render(); var sc=document.querySelector('[data-scroll]'); if(sc&&id!=='mesaj') sc.scrollTop=0; tryLocNudge('tab'); };
App.setTheme=function(d){ dark=d; try{ localStorage.setItem(TKEY,d?'dark':'light'); }catch(e){} render(); };
App.toggleTheme=function(){ App.setTheme(!dark); };
App.toggleHabit=function(key){
  var date=activeDate(), idx=dayIndexFor(date), day=getDay(data,date,idx);
  var before=countRec(day); day.habits[key]=!day.habits[key]; day.savedAt=new Date().toISOString(); var after=countRec(day); haptic(14);
  ui.pulse=key; clearTimeout(pulseTimer); pulseTimer=setTimeout(function(){ ui.pulse=null; render(); },240);
  var msg='Kaydedildi ✨'; if(day.habits[key]){ var h=find(HABITS,'key',key); if(h) msg=h.msg; }
  commit(msg);
  if(editing()) return;
  var ht=htToday(); if(after>=ht&&before<ht){ confetti(); setTimeout(function(){ toast('Bugün '+ht+'/'+ht+'. Şeyma hanım kontrolü ele aldı 👑',2600); },250); }
  else if(day.habits[key]){ maybeStreak(); }
};
function maybeStreak(){ var s=currentStreak(); var m={3:'3 gün oldu. Ritim kendini belli ediyor ✨',7:'7 gün. Bu artık tesadüf değil ☀️',14:'14 gün. Tatlı lobisi toplantı yapıyor olabilir 🍫',21:'21 gün! İlk büyük eşik 👑',30:'30 gün. Bir ay kesintisiz, bu ciddi iş 🌟',50:'50 gün. Yarım yüz, tam disiplin 💪',100:'100 gün! Üç haneye geçtin 🏆',200:'200 gün. Efsane modu 🔥',365:'365 gün. Tam bir yıl 👑✨'}; var big={7:1,14:1,21:1,30:1,50:1,100:1,200:1,365:1,500:1,1000:1}; if(m[s]){ if(big[s]) confetti(); setTimeout(function(){ toast(m[s],2800); },300); } }
App.setMood=function(id){ var date=activeDate(), day=getDay(data,date,dayIndexFor(date)); day.mood=(day.mood===id?null:id); haptic(14); commit(); };
App.onNote=function(el){ var v=el.value; clearTimeout(noteTimer); noteTimer=setTimeout(function(){ var date=activeDate(), day=getDay(data,date,dayIndexFor(date)); day.note=v; save(); },500); };
App.onIntention=function(el){ var v=el.value; debounceSave('intention',function(){ var day=curDay(); day.intention=String(v||'').slice(0,140); day.savedAt=new Date().toISOString(); save(); },500); };
App.toggleHaptic=function(on){ if(!data.settings) data.settings={}; data.settings.haptics=!!on; if(on) haptic(18); save(); render(); };
App.onMeal=function(key,el){ var v=el.value; debounceSave('meal-'+key,function(){ var date=activeDate(), day=getDay(data,date,dayIndexFor(date)); day.meals[key]=v; day.savedAt=new Date().toISOString(); save(); },500); };

// ---- öğün detay (tabak/gr/adet) ----
App.addMealItem=function(key){ var day=curDay(); if(!day.mealItems[key]) day.mealItems[key]=[]; day.mealItems[key].push({name:'',qty:1,unit:'tabak'}); day.savedAt=new Date().toISOString(); commit(); setTimeout(function(){ var inp=document.querySelector('[data-meal="'+key+'"][data-idx="'+(day.mealItems[key].length-1)+'"]'); if(inp) inp.focus(); },40); };
App.removeMealItem=function(key,idx){ var day=curDay(); if(day.mealItems[key]&&day.mealItems[key][idx]!=null){ day.mealItems[key].splice(idx,1); syncMealText(day,key); day.savedAt=new Date().toISOString(); commit(); } };
App.setMealItemName=function(key,idx,el){ var v=el.value; debounceSave('mi-'+key+'-'+idx,function(){ var day=curDay(); var it=day.mealItems[key]&&day.mealItems[key][idx]; if(!it) return; it.name=v; syncMealText(day,key); day.savedAt=new Date().toISOString(); save(); var sub=document.getElementById('meal-sub-'+key); if(sub){ var m=mealNutr(day,key); sub.textContent=Math.round(m.protein)+'g protein'; } var tot=document.getElementById('nutri-live'); if(tot){ updateNutriLive(day); } },350); };
App.setMealItemQty=function(key,idx,el){ var day=curDay(); var it=day.mealItems[key]&&day.mealItems[key][idx]; if(!it) return; var v=el.value===''?'':Number(el.value); it.qty=(v===''||isNaN(v))?'':v; syncMealText(day,key); day.savedAt=new Date().toISOString(); commit(); };
App.setMealItemUnit=function(key,idx,el){ var day=curDay(); var it=day.mealItems[key]&&day.mealItems[key][idx]; if(!it) return; it.unit=el.value; syncMealText(day,key); day.savedAt=new Date().toISOString(); commit(); };

// ---- su ----
App.waterAdd=function(n){ var day=curDay(); var v=(Number(day.water)||0)+n; day.water=Math.max(0,Math.min(20,v)); if(day.water>=WATER_GOAL&&!day.habits.water){ day.habits.water=true; toast('Su tiki işaretlendi 💧'); } day.savedAt=new Date().toISOString(); commit(); };

// ---- enerji / stres ----
App.setEnergy=function(v){ var day=curDay(); day.energy=(day.energy===v?null:v); day.savedAt=new Date().toISOString(); commit(); };
App.setStress=function(v){ var day=curDay(); day.stress=(day.stress===v?null:v); day.savedAt=new Date().toISOString(); commit(); };

// ---- kafein ----
App.setCaffeineTime=function(el){ var v=el.value; var day=curDay(); if(!day.caffeine) day.caffeine={last:null,cups:null}; day.caffeine.last=v||null; day.savedAt=new Date().toISOString(); commit(); };
App.caffeineCups=function(n){ var day=curDay(); if(!day.caffeine) day.caffeine={last:null,cups:null}; var v=(Number(day.caffeine.cups)||0)+n; day.caffeine.cups=Math.max(0,Math.min(15,v)); day.savedAt=new Date().toISOString(); commit(); };

// ---- health (sleep / walk) actions: number inputs save without re-render to keep focus ----
App.setSleepHours=function(el){ var raw=el.value; debounceSave('sleepH',function(){ var day=curDay(); var v=raw===''?null:Number(raw); day.sleep.hours=(v==null||isNaN(v))?null:v; if(day.sleep.hours!=null&&day.sleep.hours>=7&&!day.habits.sleepReg){ day.habits.sleepReg=true; toast('Uyku tiki işaretlendi 🛌'); } day.savedAt=new Date().toISOString(); save(); }); };
App.setSleepQuality=function(id){ var day=curDay(); day.sleep.quality=(day.sleep.quality===id?null:id); day.savedAt=new Date().toISOString(); commit(); };
App.setSleepMed=function(type){ var day=curDay(); if(!day.sleep.med) day.sleep.med={type:null,note:''}; day.sleep.med.type=(day.sleep.med.type===type?null:type); if(day.sleep.med.type!=='herbal'&&day.sleep.med.type!=='rx') day.sleep.med.note=''; day.savedAt=new Date().toISOString(); commit(); };
App.setSleepMedNote=function(el){ var v=el.value; debounceSave('sleepMedNote',function(){ var day=curDay(); if(!day.sleep.med) day.sleep.med={type:null,note:''}; day.sleep.med.note=v; day.savedAt=new Date().toISOString(); save(); },300); };
App.openReading=function(){ ui.readingOpen=true; ui.readingView='today'; ui.logBookId=null; ui.readingDraft={title:'',author:'',pages:'',minutes:'',note:''}; render(); };
App.closeReading=function(){ ui.readingOpen=false; ui.readingDraft=null; ui.bookEdit=null; ui.quoteDraft=null; ui.logBookId=null; render(); };
App.setReadingView=function(v){ ui.readingView=v; ui.bookEdit=null; ui.quoteDraft=null; render(); };
App.onReadingField=function(field,el){ if(!ui.readingDraft) ui.readingDraft={title:'',author:'',pages:'',minutes:'',note:''}; ui.readingDraft[field]=el.value; };
App.pickLogBook=function(id){ var b=findBook(id); if(!b) return; ui.logBookId=(ui.logBookId===id?null:id); if(ui.logBookId){ if(!ui.readingDraft) ui.readingDraft={}; ui.readingDraft.title=b.title; ui.readingDraft.author=b.author; } render(); };
function bumpBookProgress(book,addPages){ if(!book) return false; if(addPages>0){ book.currentPage=Math.max(0,book.currentPage+addPages); if(book.totalPages&&book.totalPages>0) book.currentPage=Math.min(book.currentPage,book.totalPages); } if(!book.startedAt) book.startedAt=new Date().toISOString(); if(book.status==='reading'&&book.totalPages&&book.totalPages>0&&book.currentPage>=book.totalPages){ book.status='finished'; book.finishedAt=new Date().toISOString(); return true; } return false; }
App.addReading=function(){
  var d=ui.readingDraft||{};
  var title=String(d.title||'').trim();
  if(!title){ toast('Önce kitabın adını yaz 📖'); var ti=document.getElementById('reading-title'); if(ti) ti.focus(); return; }
  var pages=parseInt(d.pages,10); if(isNaN(pages)||pages<0) pages=0;
  var minutes=parseInt(d.minutes,10); if(isNaN(minutes)||minutes<0) minutes=null;
  var bookId=ui.logBookId||null; var justFinished=false;
  if(bookId){ var bk=findBook(bookId); if(bk){ justFinished=bumpBookProgress(bk,pages); } else bookId=null; }
  var entry={ id:uid('r'), title:title.slice(0,120), author:String(d.author||'').trim().slice(0,80), pages:pages, minutes:minutes, note:String(d.note||'').trim().slice(0,240), bookId:bookId, ts:new Date().toISOString() };
  var day=getDay(data,todayStr(),dayIndexFor(todayStr()));
  if(!day.reading||typeof day.reading!=='object') day.reading=emptyReading();
  if(!Array.isArray(day.reading.entries)) day.reading.entries=[];
  day.reading.entries.push(entry);
  day.savedAt=new Date().toISOString();
  ui.readingDraft={title:'',author:'',pages:'',minutes:'',note:''}; ui.logBookId=null;
  if(justFinished){ commit(); toast('Kitabı bitirdin! 🎉'); confetti(); } else commit('Okuma kaydedildi 📖');
};
App.removeReading=function(id){
  var day=getDay(data,todayStr(),dayIndexFor(todayStr()));
  if(day.reading&&Array.isArray(day.reading.entries)){ var i=day.reading.entries.findIndex(function(e){ return e&&e.id===id; }); if(i>=0){ var e=day.reading.entries[i]; if(e&&e.bookId&&e.pages>0){ var bk=findBook(e.bookId); if(bk){ bk.currentPage=Math.max(0,bk.currentPage-e.pages); if(bk.status==='finished'&&bk.totalPages&&bk.currentPage<bk.totalPages){ bk.status='reading'; bk.finishedAt=null; } } } day.reading.entries.splice(i,1); day.savedAt=new Date().toISOString(); commit('Okuma kaydı silindi'); } }
};
// ---- kitap CRUD ----
App.openBookEdit=function(id){ ensureLibrary(); ui.bookEdit = id ? clone(findBook(id)||{}) : {id:'',title:'',author:'',genre:'',emoji:'📖',totalPages:'',currentPage:0,status:'reading',rating:null,quotes:[]}; render(); };
App.closeBookEdit=function(){ ui.bookEdit=null; render(); };
App.onBookEditField=function(field,el){ if(!ui.bookEdit) return; ui.bookEdit[field]=el.value; };
App.pickBookEmoji=function(e){ if(!ui.bookEdit) return; ui.bookEdit.emoji=e; render(); };
App.pickBookGenre=function(g){ if(!ui.bookEdit) return; ui.bookEdit.genre=(ui.bookEdit.genre===g?'':g); render(); };
App.saveBook=function(){ if(!ui.bookEdit) return; var L=ensureLibrary(); var b=ui.bookEdit; var title=String(b.title||'').trim(); if(!title){ toast('Kitabın adını yaz 📖'); return; } if(b.id){ var ex=findBook(b.id); if(ex){ ex.title=title.slice(0,120); ex.author=String(b.author||'').trim().slice(0,80); ex.genre=String(b.genre||''); ex.emoji=b.emoji||'📖'; ex.totalPages=(b.totalPages===''||b.totalPages==null)?null:Math.max(0,Math.round(Number(b.totalPages)||0)); ex.status=b.status||'reading'; normBook(ex); if(ex.totalPages) ex.currentPage=Math.min(ex.currentPage,ex.totalPages); } } else { var nb=normBook({title:title,author:String(b.author||'').trim(),genre:String(b.genre||''),emoji:b.emoji||'📖',totalPages:b.totalPages,currentPage:0,status:b.status||'reading',startedAt:new Date().toISOString()}); L.books.unshift(nb); } ui.bookEdit=null; commit('Kitaplığa eklendi 📚'); };
App.deleteBook=function(id){ var L=ensureLibrary(); var i=L.books.findIndex(function(b){ return b&&b.id===id; }); if(i>=0){ L.books.splice(i,1); } ui.bookEdit=null; commit('Kitap silindi'); };
App.setBookStatus=function(id,st){ var b=findBook(id); if(!b) return; b.status=st; if(st==='finished'){ if(!b.finishedAt) b.finishedAt=new Date().toISOString(); if(b.totalPages) b.currentPage=b.totalPages; } else { b.finishedAt=null; } commit(); };
App.rateBook=function(id,n){ var b=findBook(id); if(!b) return; b.rating=(b.rating===n?null:n); commit(); };
App.advanceBook=function(id,delta){ var b=findBook(id); if(!b) return; var fin=bumpBookProgress(b,delta>0?delta:0); if(delta<0){ b.currentPage=Math.max(0,b.currentPage+delta); if(b.status==='finished'&&b.totalPages&&b.currentPage<b.totalPages){ b.status='reading'; b.finishedAt=null; } } if(fin){ commit(); toast('Kitabı bitirdin! 🎉'); confetti(); } else commit(); };
App.setBookPage=function(id,el){ var b=findBook(id); if(!b) return; var raw=el.value; debounceSave('bookpage_'+id,function(){ var v=raw===''?0:Math.max(0,Math.round(Number(raw)||0)); if(b.totalPages) v=Math.min(v,b.totalPages); b.currentPage=v; if(b.status==='reading'&&b.totalPages&&v>=b.totalPages){ b.status='finished'; b.finishedAt=new Date().toISOString(); save(); render(); toast('Kitabı bitirdin! 🎉'); confetti(); return; } save(); render(); },500); };
App.finishBook=function(id){ var b=findBook(id); if(!b) return; b.status='finished'; b.finishedAt=new Date().toISOString(); if(b.totalPages) b.currentPage=b.totalPages; if(!b.startedAt) b.startedAt=new Date().toISOString(); commit(); toast('Kitabı bitirdin! 🎉'); confetti(); };
App.reopenBook=function(id){ var b=findBook(id); if(!b) return; b.status='reading'; b.finishedAt=null; commit(); };
App.setReadGoal=function(field,el){ var L=ensureLibrary(); var raw=el.value; debounceSave('readgoal_'+field,function(){ var v=raw===''?null:Math.max(0,Math.round(Number(raw)||0)); L.goal[field]=v; save(); render(); },500); };
// ---- alıntılar ----
App.openQuoteAdd=function(bookId){ var L=ensureLibrary(); if(!bookId){ var reading=L.books.filter(function(b){return b.status!=='dropped';}); bookId=(reading[0]&&reading[0].id)||(L.books[0]&&L.books[0].id)||''; } ui.quoteDraft={bookId:bookId,text:'',page:''}; render(); };
App.closeQuoteAdd=function(){ ui.quoteDraft=null; render(); };
App.onQuoteField=function(field,el){ if(!ui.quoteDraft) return; ui.quoteDraft[field]=el.value; };
App.pickQuoteBook=function(id){ if(!ui.quoteDraft) return; ui.quoteDraft.bookId=id; render(); };
App.saveQuote=function(){ if(!ui.quoteDraft) return; var b=findBook(ui.quoteDraft.bookId); if(!b){ toast('Önce bir kitap seç 📖'); return; } var text=String(ui.quoteDraft.text||'').trim(); if(!text){ toast('Alıntıyı yaz 💬'); return; } var page=parseInt(ui.quoteDraft.page,10); if(isNaN(page)||page<0) page=null; if(!Array.isArray(b.quotes)) b.quotes=[]; b.quotes.push({id:uid('q'),text:text.slice(0,400),page:page,ts:new Date().toISOString()}); ui.quoteDraft=null; commit('Alıntı eklendi 💬'); };
App.removeQuote=function(bookId,qid){ var b=findBook(bookId); if(!b||!Array.isArray(b.quotes)) return; var i=b.quotes.findIndex(function(q){return q&&q.id===qid;}); if(i>=0){ b.quotes.splice(i,1); commit('Alıntı silindi'); } };
App.copyQuote=function(text){ try{ navigator.clipboard.writeText(text); toast('Kopyalandı 📋'); }catch(e){ toast('Kopyalanamadı'); } };
App.copyQuoteById=function(bookId,qid){ var b=findBook(bookId); if(!b||!Array.isArray(b.quotes)) return; var q=b.quotes.find(function(x){return x&&x.id===qid;}); if(!q) return; var txt='“'+q.text+'”\n— '+b.title+(q.page?', s.'+q.page:''); App.copyQuote(txt); };
App.copyReplicaById=function(itemId,qid){ var t=findTitle(itemId); if(!t||!Array.isArray(t.quotes)) return; var q=t.quotes.find(function(x){return x&&x.id===qid;}); if(!q) return; var txt='“'+q.text+'”\n— '+t.title; App.copyQuote(txt); };

// ================= NE İZLEDİM =================
App.openWatching=function(){ ui.watchOpen=true; ui.watchView='today'; ui.logItemId=null; ui.watchDraft={title:'',kind:'film',episodes:'',minutes:'',note:''}; render(); };
App.closeWatching=function(){ ui.watchOpen=false; ui.watchDraft=null; ui.titleEdit=null; ui.replicaDraft=null; ui.logItemId=null; render(); };
App.setWatchView=function(v){ ui.watchView=v; ui.titleEdit=null; ui.replicaDraft=null; render(); };
App.onWatchField=function(field,el){ if(!ui.watchDraft) ui.watchDraft={title:'',kind:'film',episodes:'',minutes:'',note:''}; ui.watchDraft[field]=el.value; };
App.setWatchDraftKind=function(k){ if(!ui.watchDraft) ui.watchDraft={}; ui.watchDraft.kind=k; render(); };
App.pickLogTitle=function(id){ var t=findTitle(id); if(!t) return; ui.logItemId=(ui.logItemId===id?null:id); if(ui.logItemId){ if(!ui.watchDraft) ui.watchDraft={}; ui.watchDraft.title=t.title; ui.watchDraft.kind=t.kind; } render(); };
function bumpTitleProgress(item,addEps){ if(!item) return false; if(item.kind==='dizi'){ if(addEps>0){ item.watchedEp=Math.max(0,item.watchedEp+addEps); if(item.totalEp&&item.totalEp>0) item.watchedEp=Math.min(item.watchedEp,item.totalEp); } } else { item.watchedEp=1; } if(!item.startedAt) item.startedAt=new Date().toISOString(); if(item.status==='watching'){ if(item.kind==='film'){ item.status='finished'; item.finishedAt=new Date().toISOString(); return true; } if(item.totalEp&&item.totalEp>0&&item.watchedEp>=item.totalEp){ item.status='finished'; item.finishedAt=new Date().toISOString(); return true; } } return false; }
App.addWatching=function(){
  var d=ui.watchDraft||{};
  var title=String(d.title||'').trim();
  if(!title){ toast('Önce yapımın adını yaz 🎬'); var ti=document.getElementById('watch-title'); if(ti) ti.focus(); return; }
  var kind=(d.kind==='dizi')?'dizi':'film';
  var episodes=parseInt(d.episodes,10); if(isNaN(episodes)||episodes<0) episodes=(kind==='dizi'?1:null);
  var minutes=parseInt(d.minutes,10); if(isNaN(minutes)||minutes<0) minutes=null;
  var itemId=ui.logItemId||null; var justFinished=false;
  if(itemId){ var it=findTitle(itemId); if(it){ justFinished=bumpTitleProgress(it,episodes||0); } else itemId=null; }
  var entry={ id:uid('we'), title:title.slice(0,120), kind:kind, episodes:episodes, minutes:minutes, note:String(d.note||'').trim().slice(0,240), itemId:itemId, ts:new Date().toISOString() };
  var day=getDay(data,todayStr(),dayIndexFor(todayStr()));
  if(!day.watching||typeof day.watching!=='object') day.watching=emptyWatching();
  if(!Array.isArray(day.watching.entries)) day.watching.entries=[];
  day.watching.entries.push(entry);
  day.savedAt=new Date().toISOString();
  ui.watchDraft={title:'',kind:kind,episodes:'',minutes:'',note:''}; ui.logItemId=null;
  if(justFinished){ commit(); toast('Bitirdin! 🎉'); confetti(); } else commit('İzleme kaydedildi 🎬');
};
App.removeWatching=function(id){
  var day=getDay(data,todayStr(),dayIndexFor(todayStr()));
  if(day.watching&&Array.isArray(day.watching.entries)){ var i=day.watching.entries.findIndex(function(e){ return e&&e.id===id; }); if(i>=0){ var e=day.watching.entries[i]; if(e&&e.itemId&&e.kind==='dizi'&&e.episodes>0){ var it=findTitle(e.itemId); if(it){ it.watchedEp=Math.max(0,it.watchedEp-e.episodes); if(it.status==='finished'&&it.totalEp&&it.watchedEp<it.totalEp){ it.status='watching'; it.finishedAt=null; } } } day.watching.entries.splice(i,1); day.savedAt=new Date().toISOString(); commit('İzleme kaydı silindi'); } }
};
// ---- yapım CRUD ----
App.openTitleEdit=function(id){ ensureWatchlist(); ui.titleEdit = id ? clone(findTitle(id)||{}) : {id:'',title:'',kind:'film',genre:'',emoji:'🎬',totalEp:'',watchedEp:0,status:'watching',rating:null,quotes:[]}; render(); };
App.closeTitleEdit=function(){ ui.titleEdit=null; render(); };
App.onTitleEditField=function(field,el){ if(!ui.titleEdit) return; ui.titleEdit[field]=el.value; };
App.pickTitleEmoji=function(e){ if(!ui.titleEdit) return; ui.titleEdit.emoji=e; render(); };
App.setTitleEditKind=function(k){ if(!ui.titleEdit) return; ui.titleEdit.kind=k; if(!ui.titleEdit.emoji||ui.titleEdit.emoji==='🎬'||ui.titleEdit.emoji==='📺') ui.titleEdit.emoji=(k==='dizi'?'📺':'🎬'); render(); };
App.pickTitleGenre=function(g){ if(!ui.titleEdit) return; ui.titleEdit.genre=(ui.titleEdit.genre===g?'':g); render(); };
App.saveTitle=function(){ if(!ui.titleEdit) return; var W=ensureWatchlist(); var t=ui.titleEdit; var title=String(t.title||'').trim(); if(!title){ toast('Yapımın adını yaz 🎬'); return; } if(t.id){ var ex=findTitle(t.id); if(ex){ ex.title=title.slice(0,120); ex.kind=(t.kind==='dizi'?'dizi':'film'); ex.genre=String(t.genre||''); ex.emoji=t.emoji||'🎬'; ex.totalEp=(t.totalEp===''||t.totalEp==null)?null:Math.max(0,Math.round(Number(t.totalEp)||0)); ex.status=t.status||'watching'; normTitle(ex); if(ex.totalEp) ex.watchedEp=Math.min(ex.watchedEp,ex.totalEp); } } else { var nt=normTitle({title:title,kind:(t.kind==='dizi'?'dizi':'film'),genre:String(t.genre||''),emoji:t.emoji||(t.kind==='dizi'?'📺':'🎬'),totalEp:t.totalEp,watchedEp:0,status:t.status||'watching',startedAt:new Date().toISOString()}); W.items.unshift(nt); } ui.titleEdit=null; commit('Arşive eklendi 🎬'); };
App.deleteTitle=function(id){ var W=ensureWatchlist(); var i=W.items.findIndex(function(t){ return t&&t.id===id; }); if(i>=0){ W.items.splice(i,1); } ui.titleEdit=null; commit('Yapım silindi'); };
App.setTitleStatus=function(id,st){ var t=findTitle(id); if(!t) return; t.status=st; if(st==='finished'){ if(!t.finishedAt) t.finishedAt=new Date().toISOString(); if(t.totalEp) t.watchedEp=t.totalEp; } else { t.finishedAt=null; } commit(); };
App.rateTitle=function(id,n){ var t=findTitle(id); if(!t) return; t.rating=(t.rating===n?null:n); commit(); };
App.advanceTitle=function(id,delta){ var t=findTitle(id); if(!t) return; var fin=false; if(delta>0){ fin=bumpTitleProgress(t,delta); } else { t.watchedEp=Math.max(0,t.watchedEp+delta); if(t.status==='finished'&&t.totalEp&&t.watchedEp<t.totalEp){ t.status='watching'; t.finishedAt=null; } } if(fin){ commit(); toast('Diziyi bitirdin! 🎉'); confetti(); } else commit(); };
App.setTitleEp=function(id,el){ var t=findTitle(id); if(!t) return; var raw=el.value; debounceSave('titleep_'+id,function(){ var v=raw===''?0:Math.max(0,Math.round(Number(raw)||0)); if(t.totalEp) v=Math.min(v,t.totalEp); t.watchedEp=v; if(t.status==='watching'&&t.totalEp&&v>=t.totalEp){ t.status='finished'; t.finishedAt=new Date().toISOString(); save(); render(); toast('Diziyi bitirdin! 🎉'); confetti(); return; } save(); render(); },500); };
App.finishTitle=function(id){ var t=findTitle(id); if(!t) return; t.status='finished'; t.finishedAt=new Date().toISOString(); if(t.totalEp) t.watchedEp=t.totalEp; else if(t.kind==='film') t.watchedEp=1; if(!t.startedAt) t.startedAt=new Date().toISOString(); commit(); toast('Bitirdin! 🎉'); confetti(); };
App.reopenTitle=function(id){ var t=findTitle(id); if(!t) return; t.status='watching'; t.finishedAt=null; commit(); };
App.setWatchGoal=function(field,el){ var W=ensureWatchlist(); var raw=el.value; debounceSave('watchgoal_'+field,function(){ var v=raw===''?null:Math.max(0,Math.round(Number(raw)||0)); W.goal[field]=v; save(); render(); },500); };
// ---- replikler ----
App.openReplicaAdd=function(itemId){ var W=ensureWatchlist(); if(!itemId){ var act=W.items.filter(function(t){return t.status!=='dropped';}); itemId=(act[0]&&act[0].id)||(W.items[0]&&W.items[0].id)||''; } ui.replicaDraft={itemId:itemId,text:''}; render(); };
App.closeReplicaAdd=function(){ ui.replicaDraft=null; render(); };
App.onReplicaField=function(field,el){ if(!ui.replicaDraft) return; ui.replicaDraft[field]=el.value; };
App.pickReplicaTitle=function(id){ if(!ui.replicaDraft) return; ui.replicaDraft.itemId=id; render(); };
App.saveReplica=function(){ if(!ui.replicaDraft) return; var t=findTitle(ui.replicaDraft.itemId); if(!t){ toast('Önce bir yapım seç 🎬'); return; } var text=String(ui.replicaDraft.text||'').trim(); if(!text){ toast('Repliği yaz 💬'); return; } if(!Array.isArray(t.quotes)) t.quotes=[]; t.quotes.push({id:uid('wq'),text:text.slice(0,400),ts:new Date().toISOString()}); ui.replicaDraft=null; commit('Replik eklendi 💬'); };
App.removeReplica=function(itemId,qid){ var t=findTitle(itemId); if(!t||!Array.isArray(t.quotes)) return; var i=t.quotes.findIndex(function(q){return q&&q.id===qid;}); if(i>=0){ t.quotes.splice(i,1); commit('Replik silindi'); } };

// ================= NE DİNLEDİM (🎧) =================
App.openListening=function(){ ui.listeningOpen=true; ui.listeningView='today'; ui.logTrackId=null; ui.trackEdit=null; ui.lyricDraft=null; if(!ui.listeningDraft) ui.listeningDraft={title:'',artist:'',kind:'sarki',minutes:'',note:''}; render(); };
App.closeListening=function(){ ui.listeningOpen=false; ui.listeningDraft=null; ui.trackEdit=null; ui.lyricDraft=null; ui.logTrackId=null; render(); };
App.setListeningView=function(v){ ui.listeningView=v; ui.trackEdit=null; ui.lyricDraft=null; render(); };
App.onListeningField=function(field,el){ if(!ui.listeningDraft) ui.listeningDraft={title:'',artist:'',kind:'sarki',minutes:'',note:''}; ui.listeningDraft[field]=el.value; };
App.setListenDraftKind=function(k){ if(!ui.listeningDraft) ui.listeningDraft={title:'',artist:'',kind:'sarki',minutes:'',note:''}; ui.listeningDraft.kind=(['sarki','album','podcast'].indexOf(k)>=0)?k:'sarki'; render(); };
App.pickLogTrack=function(id){ var x=findTrack(id); if(!x) return; if(ui.logTrackId===id){ ui.logTrackId=null; } else { ui.logTrackId=id; if(!ui.listeningDraft) ui.listeningDraft={}; ui.listeningDraft.title=x.title; ui.listeningDraft.artist=x.artist; ui.listeningDraft.kind=x.kind; } render(); };
App.addListening=function(){
  var d=ui.listeningDraft||{};
  var title=String(d.title||'').trim();
  if(!title){ toast('Önce ne dinlediğini yaz 🎧'); var ti=document.getElementById('listening-title'); if(ti) ti.focus(); return; }
  var kind=(['sarki','album','podcast'].indexOf(d.kind)>=0)?d.kind:'sarki';
  var minutes=parseInt(d.minutes,10); if(isNaN(minutes)||minutes<0) minutes=null;
  var itemId=ui.logTrackId||null; if(itemId&&!findTrack(itemId)) itemId=null;
  var entry={ id:uid('l'), title:title.slice(0,120), artist:String(d.artist||'').trim().slice(0,80), kind:kind, minutes:minutes, note:String(d.note||'').trim().slice(0,240), itemId:itemId, ts:new Date().toISOString() };
  var day=getDay(data,todayStr(),dayIndexFor(todayStr()));
  if(!day.listening||typeof day.listening!=='object') day.listening=emptyListening();
  if(!Array.isArray(day.listening.entries)) day.listening.entries=[];
  day.listening.entries.push(entry);
  day.savedAt=new Date().toISOString();
  ui.listeningDraft={title:'',artist:'',kind:kind,minutes:'',note:''}; ui.logTrackId=null;
  commit('Dinleme kaydedildi 🎧');
};
App.removeListening=function(id){ var day=getDay(data,todayStr(),dayIndexFor(todayStr())); if(day.listening&&Array.isArray(day.listening.entries)){ var i=day.listening.entries.findIndex(function(e){ return e&&e.id===id; }); if(i>=0){ day.listening.entries.splice(i,1); day.savedAt=new Date().toISOString(); commit('Dinleme kaydı silindi'); } } };
// ---- favori CRUD ----
App.openTrackEdit=function(id){ ensureMusic(); ui.trackEdit = id ? clone(findTrack(id)||{}) : {id:'',title:'',artist:'',kind:'sarki',genre:'',emoji:'🎵',rating:null,quotes:[]}; render(); };
App.closeTrackEdit=function(){ ui.trackEdit=null; render(); };
App.onTrackEditField=function(field,el){ if(!ui.trackEdit) return; ui.trackEdit[field]=el.value; };
App.pickTrackEmoji=function(e){ if(!ui.trackEdit) return; ui.trackEdit.emoji=e; render(); };
App.setTrackEditKind=function(k){ if(!ui.trackEdit) return; ui.trackEdit.kind=(['sarki','album','podcast'].indexOf(k)>=0)?k:'sarki'; if(!ui.trackEdit.emoji||['🎵','💿','🎙️'].indexOf(ui.trackEdit.emoji)>=0) ui.trackEdit.emoji=(k==='podcast'?'🎙️':(k==='album'?'💿':'🎵')); render(); };
App.pickTrackGenre=function(g){ if(!ui.trackEdit) return; ui.trackEdit.genre=(ui.trackEdit.genre===g?'':g); render(); };
App.saveTrack=function(){ if(!ui.trackEdit) return; var M=ensureMusic(); var x=ui.trackEdit; var title=String(x.title||'').trim(); if(!title){ toast('Adını yaz 🎵'); return; } if(x.id){ var ex=findTrack(x.id); if(ex){ ex.title=title.slice(0,120); ex.artist=String(x.artist||'').trim().slice(0,80); ex.kind=(['sarki','album','podcast'].indexOf(x.kind)>=0)?x.kind:'sarki'; ex.genre=String(x.genre||''); ex.emoji=x.emoji||'🎵'; normTrack(ex); } } else { var nx=normTrack({title:title,artist:String(x.artist||'').trim(),kind:x.kind,genre:String(x.genre||''),emoji:x.emoji}); M.items.unshift(nx); } ui.trackEdit=null; commit('Favorilere eklendi 🎵'); };
App.deleteTrack=function(id){ var M=ensureMusic(); var i=M.items.findIndex(function(x){ return x&&x.id===id; }); if(i>=0){ M.items.splice(i,1); } ui.trackEdit=null; commit('Favori silindi'); };
App.rateTrack=function(id,n){ var x=findTrack(id); if(!x) return; x.rating=(x.rating===n?null:n); commit(); };
App.setListenGoal=function(field,el){ var M=ensureMusic(); var raw=el.value; debounceSave('listengoal_'+field,function(){ var v=raw===''?null:Math.max(0,Math.round(Number(raw)||0)); M.goal[field]=v; save(); render(); },500); };
// ---- favori sözler ----
App.openLyricAdd=function(itemId){ var M=ensureMusic(); if(!itemId){ itemId=(M.items[0]&&M.items[0].id)||''; } ui.lyricDraft={itemId:itemId,text:''}; render(); };
App.closeLyricAdd=function(){ ui.lyricDraft=null; render(); };
App.onLyricField=function(field,el){ if(!ui.lyricDraft) return; ui.lyricDraft[field]=el.value; };
App.pickLyricTrack=function(id){ if(!ui.lyricDraft) return; ui.lyricDraft.itemId=id; render(); };
App.saveLyric=function(){ if(!ui.lyricDraft) return; var x=findTrack(ui.lyricDraft.itemId); if(!x){ toast('Önce bir favori seç 🎵'); return; } var text=String(ui.lyricDraft.text||'').trim(); if(!text){ toast('Sözü yaz 💬'); return; } if(!Array.isArray(x.quotes)) x.quotes=[]; x.quotes.push({id:uid('lq'),text:text.slice(0,400),ts:new Date().toISOString()}); ui.lyricDraft=null; commit('Söz eklendi 💬'); };
App.removeLyric=function(itemId,qid){ var x=findTrack(itemId); if(!x||!Array.isArray(x.quotes)) return; var i=x.quotes.findIndex(function(q){return q&&q.id===qid;}); if(i>=0){ x.quotes.splice(i,1); commit('Söz silindi'); } };
App.copyLyricById=function(itemId,qid){ var x=findTrack(itemId); if(!x||!Array.isArray(x.quotes)) return; var q=x.quotes.find(function(z){return z&&z.id===qid;}); if(!q) return; App.copyQuote('“'+q.text+'”\n— '+x.title+(x.artist?', '+x.artist:'')); };

// ================= ŞÜKRAN / 3 GÜZEL ŞEY (🙏) =================
App.onGratitude=function(i,el){ var v=el.value; i=Number(i)||0; debounceSave('grat'+i,function(){ var day=curDay(); if(!Array.isArray(day.gratitude)) day.gratitude=[]; day.gratitude[i]=String(v||'').slice(0,160); day.savedAt=new Date().toISOString(); save(); },500); };


App.setWalkSteps=function(el){ var raw=el.value; debounceSave('walkS',function(){ var day=curDay(); var v=raw===''?null:Number(raw); day.walk.steps=(v==null||isNaN(v))?null:Math.round(v); if(day.walk.steps!=null&&day.walk.steps>=STEP_TICK_MIN&&!day.habits.walked20){ day.habits.walked20=true; toast('Adımınla yürüyüş tiki işaretlendi ✨'); } day.savedAt=new Date().toISOString(); save(); }); };
App.hideStepNudge=function(){ ui.stepNudgeHidden=true; render(); };
App.hideStepRemind=function(){ ui.stepRemindHidden=true; render(); };
App.hideWaterNudge=function(){ ui.waterNudgeHidden=true; render(); };
App.setWalkMinutes=function(el){ var raw=el.value; debounceSave('walkM',function(){ var day=curDay(); var v=raw===''?null:Number(raw); day.walk.minutes=(v==null||isNaN(v))?null:Math.round(v); if(day.walk.minutes!=null&&day.walk.minutes>=20&&!day.habits.walked20){ day.habits.walked20=true; toast('20 dk yürüyüş tiki işaretlendi ✨'); } day.savedAt=new Date().toISOString(); save(); }); };

// ---- Apple Health import ----
App.importHealthClick=function(){ var f=document.getElementById('sey-health-file'); if(f) f.click(); };
App.importHealthFile=function(el){ var file=el.files&&el.files[0]; el.value=''; if(!file) return; var st=document.getElementById('sey-health-status'); var name=(file.name||'').toLowerCase();
  if(name.indexOf('.zip')>=0){ if(st) st.textContent='Zip doğrudan açılamıyor; lütfen zip içindeki export.xml dosyasını seç.'; return; }
  if(st) st.textContent='Okunuyor…';
  var r=new FileReader();
  r.onload=function(){ try{ parseHealthXML(String(r.result)); }catch(e){ if(st) st.textContent='Dosya okunamadı.'; } };
  r.onerror=function(){ if(st) st.textContent='Dosya okunamadı.'; };
  r.readAsText(file);
};
function parseHealthXML(xml){
  var st=document.getElementById('sey-health-status'); var today=todayStr();
  var steps=0,sleepMs=0,found=false; var recRe=/<Record\b[^>]*>/g, rm;
  while((rm=recRe.exec(xml))){ var tag=rm[0];
    var type=(tag.match(/type="([^"]+)"/)||[])[1]; if(!type) continue;
    if(type.indexOf('StepCount')<0 && type.indexOf('SleepAnalysis')<0) continue;
    var sd=(tag.match(/startDate="([^"]+)"/)||[])[1]; var ed=(tag.match(/endDate="([^"]+)"/)||[])[1]; var val=(tag.match(/value="([^"]*)"/)||[])[1];
    if(!sd||sd.slice(0,10)!==today) continue; found=true;
    if(type.indexOf('StepCount')>=0){ steps+=Number(val)||0; }
    else if(type.indexOf('SleepAnalysis')>=0 && /Asleep/i.test(val||'')){ var t1=Date.parse(sd),t2=Date.parse(ed); if(t1&&t2&&t2>t1) sleepMs+=(t2-t1); }
  }
  var d=getDay(data,today,dayIndexFor(today)); var msgs=[];
  if(steps>0){ d.walk.steps=Math.round(steps); msgs.push(Math.round(steps)+' adım'); if(d.walk.steps>=STEP_TICK_MIN&&!d.habits.walked20){ d.habits.walked20=true; msgs.push('yürüyüş tiki ✨'); } }
  if(sleepMs>0){ var hrs=Math.round(sleepMs/3600000*10)/10; d.sleep.hours=hrs; msgs.push(hrs+' sa uyku'); if(hrs>=7&&!d.habits.sleepReg){ d.habits.sleepReg=true; msgs.push('uyku tiki 🛌'); } }
  if(steps>0||sleepMs>0){ d.savedAt=new Date().toISOString(); save(); render(); }
  if(st) st.textContent=(steps>0||sleepMs>0)?('İçe aktarıldı: '+msgs.join(' · ')+' ✅'):(found?'Bugün için adım/uyku verisi bulunamadı.':'Bugüne ait kayıt yok. Dosya güncel mi?');
}

// ---- cycle actions ----
App.logPeriodToday=function(){ var t=todayStr(); if(data.cycle.periods.some(function(p){return p.start===t;})){ toast('Bugün zaten kayıtlı'); return; } data.cycle.periods.push({start:t,end:null}); recalcCycle(); commit('Regl başlangıcı eklendi 🩸'); };
App.setPeriodField=function(idx,which,el){ var p=data.cycle.periods[idx]; if(!p) return; p[which]=el.value||null; recalcCycle(); commit(); };
App.removePeriod=function(idx){ if(data.cycle.periods[idx]){ data.cycle.periods.splice(idx,1); recalcCycle(); commit('Kayıt silindi'); } };
App.setFlow=function(id){ var day=curDay(); day.flow=(day.flow===id?null:id); day.savedAt=new Date().toISOString(); commit(); };
App.toggleSymptom=function(id){ var day=curDay(); var i=day.symptoms.indexOf(id); if(i>=0) day.symptoms.splice(i,1); else day.symptoms.push(id); day.savedAt=new Date().toISOString(); commit(); };
App.setBodyView=function(v){ ui.bodyView=(v==='back'?'back':'front'); render(); };
App.cycleDiscomfort=function(id){ var day=curDay(); if(!day.discomfort) day.discomfort=emptyDiscomfort(); var reg=day.discomfort.regions||(day.discomfort.regions={}); var cur=(reg[id]&&reg[id].level)||0; var nx=(cur+1)%4; if(nx===0) delete reg[id]; else reg[id]={level:nx}; day.savedAt=new Date().toISOString(); commit(); };
App.setDiscomfortNote=function(el){ var v=el.value; debounceSave('dzNote',function(){ var day=curDay(); if(!day.discomfort) day.discomfort=emptyDiscomfort(); day.discomfort.note=v; day.savedAt=new Date().toISOString(); save(); },400); };
App.addDiscomfortMed=function(){ var day=curDay(); if(!day.discomfort) day.discomfort=emptyDiscomfort(); if(!Array.isArray(day.discomfort.meds)) day.discomfort.meds=[]; day.discomfort.meds.push({name:'',dose:'',time:'',note:''}); day.savedAt=new Date().toISOString(); commit(); };
App.quickDiscomfortMed=function(i){ var day=curDay(); if(!day.discomfort) day.discomfort=emptyDiscomfort(); if(!Array.isArray(day.discomfort.meds)) day.discomfort.meds=[]; var nm=(DMEDS[i]||'').split(' (')[0]; day.discomfort.meds.push({name:nm,dose:'',time:'',note:''}); day.savedAt=new Date().toISOString(); commit(); };
App.setDiscomfortMed=function(idx,field,el){ var v=el.value; debounceSave('dzMed-'+idx+'-'+field,function(){ var day=curDay(); var m=day.discomfort&&day.discomfort.meds&&day.discomfort.meds[idx]; if(!m) return; m[field]=v; day.savedAt=new Date().toISOString(); save(); },350); };
App.removeDiscomfortMed=function(idx){ var day=curDay(); if(day.discomfort&&day.discomfort.meds&&day.discomfort.meds[idx]!=null){ day.discomfort.meds.splice(idx,1); day.savedAt=new Date().toISOString(); commit(); } };
function recalcCycle(){ var st=cycleStats(); data.cycle.avgCycle=st.avgCycle; data.cycle.avgPeriod=st.avgPeriod; }
App.goSos=function(){ haptic([16,40,16]); App.go('sos'); };

App.toggleSosOpt=function(o){ var i=ui.sosOpts.indexOf(o); if(i>=0) ui.sosOpts.splice(i,1); else ui.sosOpts.push(o); render(); };
App.toggleSosTrigger=function(id){ var i=ui.sosTriggers.indexOf(id); if(i>=0) ui.sosTriggers.splice(i,1); else ui.sosTriggers.push(id); render(); };
App.startSosTimer=function(){ clearInterval(sosInterval); ui.sosTiming=true; ui.sosLeft=600; render(); sosInterval=setInterval(function(){ ui.sosLeft--; if(ui.sosLeft<=0){ clearInterval(sosInterval); ui.sosLeft=0; ui.sosTiming=false; render(); toast('10 dakika doldu. Şimdi kararı sen ver ✨',2600); } else { updateSosTimer(); } },1000); };
function updateSosTimer(){ var el=document.getElementById('sos-clock'); if(el){ el.textContent=pad(Math.floor(ui.sosLeft/60))+':'+pad(ui.sosLeft%60); } }
App.completeSos=function(){ var date=todayStr(), day=getDay(data,date,dayIndexFor(date)); day.cravingSOSCount=(day.cravingSOSCount||0)+1; ui.sosOpts.forEach(function(o){ if(day.cravingOptionsUsed.indexOf(o)<0) day.cravingOptionsUsed.push(o); }); if(!Array.isArray(day.cravingTriggers)) day.cravingTriggers=[]; var nowIso=new Date().toISOString(); ui.sosTriggers.forEach(function(tg){ day.cravingTriggers.push({trigger:tg,ts:nowIso}); }); day.habits.sweetManaged=true; day.savedAt=nowIso; clearInterval(sosInterval); ui.sosTiming=false; ui.sosDone=true; commit('Krizi yönettin ✨'); };
App.resetSos=function(){ clearInterval(sosInterval); ui.sosOpts=[]; ui.sosTriggers=[]; ui.sosLeft=600; ui.sosTiming=false; ui.sosDone=false; render(); };

App.openEmergency=function(){ ui.emergency=true; render(); };
App.closeEmergency=function(){ ui.emergency=false; render(); };
App.continueEmergency=function(){ ui.emergency=false; render(); toast('İşte bu. Reset dediğin bazen sadece bir sonraki doğru hamledir.',3000); };
App.emergencyNote=function(){ ui.emergency=false; ui.tab='bugun'; render(); setTimeout(function(){ var ta=document.querySelector('textarea'); if(ta) ta.focus(); },150); };

App.openDate=function(date){
  var rec=data.days[date]||null; var idx=dayIndexFor(date);
  var habits=HABITS.map(function(h){ return {label:h.title.replace(' 🍫','').replace(' 🌙',''),mark:(rec&&rec.habits[h.key])?'✅':'⚪'}; });
  var cnt=countRec(rec); var ht=habitCountOn(date); var strong=Math.ceil(ht*0.66), medium=Math.ceil(ht*0.34); var status='Zor gün'; if(cnt>=ht)status='Kraliçe günü 👑'; else if(cnt>=strong)status='Güzel gün'; else if(cnt>=medium)status='İdare eder';
  var mood=rec&&rec.mood?find(MOODS,'id',rec.mood):null;
  var sl=rec&&rec.sleep?rec.sleep:{}, wk=rec&&rec.walk?rec.walk:{};
  var mealsList=[]; if(rec&&rec.meals){ MEALS.forEach(function(m){ if(rec.meals[m.key]&&String(rec.meals[m.key]).trim()) mealsList.push({label:m.label,icon:m.icon,text:String(rec.meals[m.key])}); }); }
  var flowO=rec&&rec.flow?find(FLOW,'id',rec.flow):null;
  var symsList=(rec&&rec.symptoms||[]).map(function(id){ var s=find(SYMPTOMS,'id',id); return s?s.emoji+' '+s.label:id; });
  ui.dayDetail={date:date,isToday:(date===todayStr()),title:(idx>=1?'Gün '+idx:shortDate(date)),dateLabel:shortDate(date),status:status,habits:habits,moodLabel:mood?mood.label:'—',sosCount:rec?(rec.cravingSOSCount||0):0,note:(rec&&rec.note)||'',hasNote:!!(rec&&rec.note),intention:(rec&&rec.intention)||'',hasIntention:!!(rec&&rec.intention&&String(rec.intention).trim()),gratitude:(rec&&Array.isArray(rec.gratitude))?rec.gratitude.filter(function(g){return String(g||'').trim();}):[],
    sleepH:(sl.hours!=null?sl.hours:null),steps:(wk.steps!=null?wk.steps:null),mins:(wk.minutes!=null?wk.minutes:null),meals:mealsList,flow:flowO?flowO.label:null,syms:symsList};
  render();
};
App.closeDetail=function(){ ui.dayDetail=null; render(); };
// ---- geçmiş gün düzenleme moduna gir / çık ----
App.editDay=function(date){
  if(!data||!date) return;
  var t=todayStr();
  if(diffDays(t,date)>0) return;      // yalnızca gelecek düzenlenemez (geçmiş ve bugün olur)
  if(date===t){ App.exitEdit(true); ui.dayDetail=null; App.go('bugun'); return; }
  ui.editDate=date; ui.editStartMs=Date.now(); ui.dayDetail=null; ui.tab='bugun';
  render(); var sc=document.querySelector('[data-scroll]'); if(sc) sc.scrollTop=0;
};
App.exitEdit=function(silent){
  if(!ui.editDate){ if(!silent) render(); return; }
  ui.editDate=null; ui.editStartMs=0; render();
  var sc=document.querySelector('[data-scroll]'); if(sc) sc.scrollTop=0;
  if(!silent) toast('Bugüne döndük ☀️');
};
App.maybeAutoExitEdit=function(reason){
  if(!ui.editDate) return false;
  ui.editDate=null; ui.editStartMs=0; render();
  var sc=document.querySelector('[data-scroll]'); if(sc) sc.scrollTop=0;
  toast(reason||'Bugüne döndük ☀️',2800);
  return true;
};
App.calMove=function(delta){ var ym=(ui.calMonth||todayStr().slice(0,7)).split('-'); var d=new Date(+ym[0],+ym[1]-1+delta,1); ui.calMonth=d.getFullYear()+'-'+pad(d.getMonth()+1); render(); };
App.calToday=function(){ ui.calMonth=todayStr().slice(0,7); render(); var sc=document.querySelector('[data-scroll]'); if(sc) sc.scrollTop=0; };
App.heatYear=function(delta){ var startY=+String(data.startDate).slice(0,4); var nowY=new Date().getFullYear(); var y=(+(ui.heatYear||nowY))+delta; if(y<startY)y=startY; if(y>nowY)y=nowY; ui.heatYear=y; render(); };
App.heatOpen=function(date){ ui.tab='harita'; ui.calMonth=String(date).slice(0,7); App.openDate(date); };

App.exportJson=function(){ var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); download(blob,'seyma-yedek.json'); toast('Yedek indirildi 💾'); };
function download(blob,name){ var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){ URL.revokeObjectURL(a.href); },1500); }
App.importClick=function(){ var f=document.getElementById('sey-file'); if(f) f.click(); };
App.importJson=function(el){ var f=el.files&&el.files[0]; if(!f) return; var r=new FileReader(); r.onload=function(){ try{ var d=JSON.parse(r.result); if(d&&d.version&&d.days&&d.startDate){ data=d; ui.tab='bugun'; commit('Yedek yüklendi 🔁'); } else toast('Dosya okunamadı'); }catch(err){ toast('Dosya okunamadı'); } }; r.readAsText(f); el.value=''; };

App.askReset=function(){ ui.resetStep=1; render(); };
App.cancelReset=function(){ ui.resetStep=0; render(); };
App.resetConfirm=function(){ if(ui.resetStep===1){ ui.resetStep=2; render(); return; } try{ localStorage.removeItem(KEY); }catch(e){} data=null; ui.resetStep=0; ui.tab='bugun'; render(); };
App.toggleLocation=function(){
  if(!data.settings) data.settings={};
  if(data.settings.locationEnabled){ data.settings.locationEnabled=false; stopLocationWatch(); save(); render(); toast('Konum paylaşımı kapatıldı'); return; }
  ui.locationConsent=true; render();
};
App.cancelLocationConsent=function(){ ui.locationConsent=false; render(); };
App.confirmLocationConsent=function(){
  ui.locationConsent=false;
  if(!data.settings) data.settings={};
  if(!navigator.geolocation){ render(); toast('Bu cihaz konumu desteklemiyor'); return; }
  data.settings.locationEnabled=true; save(); render(); toast('Konum izni isteniyor…');
  startLocationWatch(true);
};
App.setLocationMode=function(m){
  if(m!=='walk'&&m!=='vehicle'&&m!=='auto') return;
  if(!data.settings) data.settings={};
  data.settings.locationMode=m; save(); render();
  toast(m==='walk'?'Yürüyüş modu 🚶':m==='vehicle'?'Araç modu 🚗':'Otomatik mod ✨');
};
// ---------- Konum-açma nazik dürtme (sağlık-çerçeveli, dağınık aralıklı) ----------
var LOC_BENEFITS=[
  {i:'👣', t:'Adımların kendiliğinden sayılsın — elle uğraşmadan hareket hedefin dolsun.'},
  {i:'🚶‍♀️', t:'Günün ne kadarı yürüyüş, ne kadarı koltukta? Konum açıkken ikisi ayrı görünür.'},
  {i:'🩺', t:'Uzun süre aynı yerde kalınca dolaşım yavaşlar; kart sana minik molaları hatırlatır.'},
  {i:'💪', t:'Aktivite halkaların tahminle değil, gerçek hareketinle dolsun.'},
  {i:'🌿', t:'Kısa bir yürüyüş bile ruh hâline iyi gelir — ölçmek fark etmeyi kolaylaştırır.'},
  {i:'🧭', t:'Hareketinin haritası çıkınca “bugün az kıpırdadım” günlerini kolayca yakalarsın.'},
  {i:'🫀', t:'Kalbini en çok düzenli hareket mutlu eder; önce onu görünür kılalım.'},
  {i:'☀️', t:'Güne ne kadar hareket kattığını görmek küçük ama gerçek bir motivasyon.'},
  {i:'🚗', t:'Uzun yolculuklarda saatler otururken akıp gider; kart yalnızca hareket eden dakikalarını ayrı sayar.'},
  {i:'⏱️', t:'Günün kaç saati yolda, kaç dakikası ayakta geçti? İkisini görünce dengeyi kurmak kolaylaşır.'},
  {i:'🛣️', t:'Kat ettiğin yolun ne kadarı tekerlekte, ne kadarı adımlarında? Konum açıkken ikisi ayrılır.'},
  {i:'🦵', t:'Uzun oturuşlarda bacak dolaşımı yavaşlar; kart minik mola vaktini nazikçe hatırlatır.'},
  {i:'💺', t:'Koltukta geçen süre sessizce birikir; ölçünce kısa aralar güne kendiliğinden serpilir.'},
  {i:'🚙', t:'Bugün kaç km yol yaptın? Mesafeni görmek arada bir esneme molasını hatırlatır.'},
  {i:'🕰️', t:'Aynı pozisyonda geçen uzun dakikalar sırtı yorar; kart kıpırdama zamanını gösterir.'},
  {i:'💧', t:'Uzun yolda su içmek ve birkaç adım dolaşımı korur; kart bu ritmi tutmana yardımcı olur.'},
  {i:'🌊', t:'Uzun süre sabit kalınca ayaklarda şişlik olabilir; hareket dakikaların görününce dengelemek kolay.'},
  {i:'🧠', t:'Yol yorgunluğu zihni de yorar; kısa bir yürüyüş molası odağını tazeler — kart anını yakalar.'},
  {i:'🎯', t:'Adım hedefin yolda eriyorsa kart seni nazikçe uyarır; akşam küçük bir tur telafi eder.'},
  {i:'🫁', t:'Derin bir nefes ve birkaç adım, uzun sürüşün gerginliğini alır; kart mola vaktini hatırlatır.'}
];
var LOC_NUDGE={ minGapH:6, maxPerDay:2, prob:0.60, delayMinMs:3000, delayMaxMs:7000, dwellMs:8000, laterH:8, dismissH:4, backoffH:2, backoffMaxH:24, stopAfter:8, whisperDays:3 };
var locNudgeTimer=null;
function ensureLocNudge(){
  if(!data) return null;
  if(!data.locNudge||typeof data.locNudge!=='object') data.locNudge={};
  var ln=data.locNudge;
  if(typeof ln.shownCount!=='number') ln.shownCount=0;
  if(typeof ln.dismissCount!=='number') ln.dismissCount=0;
  if(typeof ln.dismissStreak!=='number') ln.dismissStreak=0;
  if(typeof ln.benefitIdx!=='number') ln.benefitIdx=0;
  if(typeof ln.optedOut!=='boolean') ln.optedOut=false;
  if(typeof ln.dayCount!=='number') ln.dayCount=0;
  if(typeof ln.dayKey!=='string') ln.dayKey='';
  if(typeof ln.lastShownAt!=='string') ln.lastShownAt='';
  if(typeof ln.snoozeUntil!=='string') ln.snoozeUntil='';
  if(typeof ln.optOutDay!=='string') ln.optOutDay='';
  return ln;
}
function locNudgeEligible(){
  if(!data||!data.settings) return false;
  if(data.settings.locationEnabled) return false;        // konum açıksa asla
  if(ui.locNudgeOpen) return false;                      // zaten açık
  if(ui.tab!=='bugun'&&ui.tab!=='saglik') return false;  // yalnız sağlıkla ilgili sekmeler
  if(editing()) return false;
  if(ui.locationConsent||ui.dayDetail||ui.emergency||ui.resetStep>0||ui.readingOpen||ui.watchOpen||ui.listeningOpen||ui.weatherOpen||ui.forceStart) return false;
  var ln=ensureLocNudge(); if(!ln) return false;
  var now=Date.now(), t=todayStr();
  if(ln.dayKey!==t){ ln.dayKey=t; ln.dayCount=0; }
  if(ln.optOutDay===t) return false;                     // "bugün gösterme" → yalnız bugünlük sus
  if(ln.dayCount>=LOC_NUDGE.maxPerDay) return false;
  if(ln.snoozeUntil){ var su=new Date(ln.snoozeUntil).getTime(); if(!isNaN(su)&&now<su) return false; }
  var gapH=(ln.dismissCount>=LOC_NUDGE.stopAfter)?(LOC_NUDGE.whisperDays*24):LOC_NUDGE.minGapH;
  if(ln.lastShownAt){ var ls=new Date(ln.lastShownAt).getTime(); if(!isNaN(ls)&&(now-ls)<gapH*3600000) return false; }
  return true;
}
function tryLocNudge(reason){
  if(locNudgeTimer) return;
  if(!locNudgeEligible()) return;
  if(Math.random()>LOC_NUDGE.prob) return;               // dağınık his (her fırsatta değil)
  var span=LOC_NUDGE.delayMaxMs-LOC_NUDGE.delayMinMs;
  var delay=LOC_NUDGE.delayMinMs+Math.round(Math.random()*span);
  locNudgeTimer=setTimeout(function(){ locNudgeTimer=null; openLocNudgeNow(); }, delay);
}
function openLocNudgeNow(){
  if(!locNudgeEligible()) return;                        // gecikme sırasında koşul değiştiyse iptal
  var ln=ensureLocNudge(); var n=LOC_BENEFITS.length;
  var count=(Math.random()<0.5)?1:2, picks=[];
  for(var i=0;i<count;i++){ picks.push(LOC_BENEFITS[(ln.benefitIdx+i)%n]); }
  ln.benefitIdx=(ln.benefitIdx+count)%n;
  ui.locNudgeShown=picks; ui.locNudgeOpen=true;
  ln.lastShownAt=new Date().toISOString(); ln.shownCount++; ln.dayCount++;
  save(); render();
}
function closeLocNudge(kind){
  var ln=ensureLocNudge(); var now=Date.now();
  ln.dismissCount++; ln.dismissStreak=(ln.dismissStreak||0)+1;
  var baseH=(kind==='later')?LOC_NUDGE.laterH:LOC_NUDGE.dismissH;
  var backoff=Math.min(LOC_NUDGE.backoffMaxH, ln.dismissStreak*LOC_NUDGE.backoffH);
  ln.snoozeUntil=new Date(now+(baseH+backoff)*3600000).toISOString();
  ui.locNudgeOpen=false; ui.locNudgeShown=[]; save(); render();
}
App.locNudgeOpenConsent=function(){ ui.locNudgeOpen=false; ui.locNudgeShown=[]; ui.locationConsent=true; render(); };
App.locNudgeSnooze=function(){ closeLocNudge('later'); };
App.locNudgeDismiss=function(){ closeLocNudge('dismiss'); };
App.locNudgeOptOut=function(){ var ln=ensureLocNudge(); if(ln) ln.optOutDay=todayStr(); ui.locNudgeOpen=false; ui.locNudgeShown=[]; save(); render(); toast('Tamam, bugünlük kapattım — yarın yine buradayım 🌿'); };
App.toggleWeather=function(){ ui.weatherOpen=!ui.weatherOpen; render(); };
App.goStart=function(){ ui.forceStart=true; ui.tab='bugun'; render(); };
App.startDateChange=function(el){ var v=el.value; if(!v) return; data.startDate=v; commit('Başlangıç tarihi güncellendi'); };

App.anotherNote=function(){ ui.noteIndex=(ui.noteIndex+1)%NOTES.length; render(); };
App.printReport=function(){ openReport(); };
function syncFieldUpdate(){ var s=document.getElementById('sey-sync-status'); if(s&&window.SeySync) s.textContent=window.SeySync.statusText(); }
App.setGhToken=function(el){ if(!data.settings) data.settings={}; data.settings.ghToken=normalizeToken(el.value||''); save(); syncFieldUpdate(); };
// Anahtarı kopyalama kaynaklı bozulmalardan temizle: "Bearer " öneki, tırnaklar,
// boşluklar ve görünmez (zero-width) karakterler 401 hatasının başlıca sebebidir.
function sanitizeApiKey(v){ var s=String(v||'').trim(); s=s.replace(/^Bearer\s+/i,''); s=s.replace(/^["'`]+|["'`]+$/g,''); s=s.replace(/[\s\u200B-\u200D\uFEFF\u00A0]/g,''); return s; }
// OpenAI hata kodlarını kullanıcının anlayacağı Türkçe mesaja çevir.
function openaiErrText(status,raw){ var m=String(raw||''); if(status===401||/invalid_api_key|Incorrect API key/i.test(m)) return 'OpenAI anahtarın geçersiz görünüyor. Ayarlar’dan doğru anahtarı (sk-…) yapıştırıp “Kaydet ve doğrula” yap. 🔑'; if(status===429||/insufficient_quota|exceeded your current quota/i.test(m)) return 'OpenAI hesabının kullanım kotası/bakiyesi dolmuş olabilir. platform.openai.com → Billing’den bakiye ekleyip tekrar dene. ⏳'; if(status===404||/model_not_found|does not exist|do not have access/i.test(m)) return 'Hesabın istenen yapay zekâ modeline erişemiyor. Farklı bir anahtar dene ya da model erişimi iste. ⚙️'; if(status===403) return 'Erişim reddedildi (403). Anahtarının izinleri yetersiz olabilir. 🔒'; if(status===500||status===502||status===503) return 'OpenAI sunucusu şu an yanıt vermiyor. Birkaç dakika sonra tekrar dene. 🔁'; if(!status) return 'İnternet bağlantısı kurulamadı. Bağlantını kontrol edip tekrar dene. 📶'; return 'Beklenmeyen bir hata oluştu ('+status+'). Birazdan tekrar dene.'; }
App.setOpenaiKey=function(el){ var v=el.value; if(ui.openaiKeyState&&ui.openaiKeyState!=='checking') ui.openaiKeyState=null; debounceSave('openaiKey',function(){ if(!data.settings) data.settings={}; data.settings.openaiKey=String(v||'').trim(); data.settings.lunaConnected=!!data.settings.openaiKey; save(); },500); };
App.saveOpenaiKey=function(){
  var inp=document.querySelector('input[oninput*="setOpenaiKey"]');
  var key=inp?sanitizeApiKey(inp.value):sanitizeApiKey((data.settings&&data.settings.openaiKey)||'');
  if(!data.settings) data.settings={};
  data.settings.openaiKey=key; data.settings.lunaConnected=!!key; if(inp) inp.value=key; save();
  if(!key){ ui.openaiKeyState=null; render(); toast('Anahtar temizlendi'); return; }
  if(key.slice(0,3)!=='sk-'){ ui.openaiKeyState='invalid'; render(); toast('Anahtar “sk-” ile başlamalı — OpenAI anahtarını kontrol et'); return; }
  ui.openaiKeyState='checking'; render();
  fetch('https://api.openai.com/v1/models',{headers:{'Authorization':'Bearer '+key}})
    .then(function(r){
      if(r.ok){ ui.openaiKeyState='valid'; if(data.settings) data.settings.lunaConnected=true; save(); render(); toast('Anahtar doğrulandı ✓'); }
      else if(r.status===401){ ui.openaiKeyState='invalid'; if(data.settings) data.settings.lunaConnected=false; save(); render(); toast('Anahtar geçersiz — kopyalarken karakter eksik/fazla olabilir'); }
      else if(r.status===429){ ui.openaiKeyState=null; render(); toast('Anahtar kaydedildi ama kota/bakiye dolu olabilir ⏳'); }
      else { ui.openaiKeyState=null; render(); toast('Kaydedildi (doğrulanamadı, '+r.status+')'); }
    })
    .catch(function(){ ui.openaiKeyState=null; render(); toast('Kaydedildi (ağ doğrulaması yapılamadı)'); });
};
App.setGhRepo=function(el){ if(!data.settings) data.settings={}; data.settings.ghRepo=(el.value||'').trim(); save(); syncFieldUpdate(); };
App.setGhBranch=function(el){ if(!data.settings) data.settings={}; data.settings.ghBranch=(el.value||'').trim(); save(); syncFieldUpdate(); };
App.syncNow=function(){ if(window.SeySync){ window.SeySync.pushNow(); toast('Kaydediliyor…'); } else { toast('Sync hazır değil'); } };
App.saveToday=function(){ getDay(data,todayStr(),dayIndexFor(todayStr())); save(); if(!syncConfigured()){ toast('Önce Ayarlar\'dan repoya bağlan'); App.go('ayarlar'); return; } if(window.SeySync){ window.SeySync.pushNow(); toast('Kaydediliyor…'); } };
App.enableKeyEdit=function(){ ui.keyEdit=true; render(); };
App.cancelKeyEdit=function(){ ui.keyEdit=false; render(); };

// ---------- report (print -> Safari "PDF olarak kaydet") ----------
function reportHTML(){
  var st=getStats(); var days=allDays();
  var range=shortDate(data.startDate)+' – '+shortDate(todayStr());
  var h='';
  h+='<div style="text-align:center;padding:30px 0 24px;border-bottom:2px solid #F2E1DA;margin-bottom:26px;">';
  h+='<div style="font-size:34px;font-weight:800;">Şeyma 🦩</div>';
  h+='<div style="font-size:16px;color:#7A6B70;margin-top:6px;">Minik Denge Günlüğü</div>';
  h+='<div style="font-size:14px;color:#9C8C92;margin-top:12px;">'+range+'</div>';
  h+='<div style="font-size:14px;color:#6B4A3A;margin-top:10px;font-style:italic;">Diyet değil. Küçük kontrol notları.</div></div>';
  h+='<div style="font-size:20px;font-weight:800;margin:0 0 14px;">Özet</div>';
  var stats=[['Toplam tamamlanan tik',st.total],['Tatlı kontrolü günü',st.tot.sweetManaged],['Akşam kontrolü günü',st.tot.eveningControl],['Yürüyüş günü',st.tot.walked20],['Protein günü',st.tot.protein],['Su günü',st.tot.water],['D vitamini günü',st.tot.vitaminD],['Kendine iyi davranma günü',st.tot.selfKind],['En iyi seri',st.best+' gün'],['En sık mod',st.mood]];
  h+='<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:26px;">';
  stats.forEach(function(s){ h+='<div style="flex:1 1 30%;min-width:150px;background:#FFF8F3;border:1px solid #F2E1DA;border-radius:12px;padding:12px 14px;"><div style="font-size:12px;color:#9C8C92;">'+esc(s[0])+'</div><div style="font-size:20px;font-weight:800;margin-top:3px;">'+esc(s[1])+'</div></div>'; });
  h+='</div>';
  h+='<div style="font-size:20px;font-weight:800;margin:0 0 14px;">İlk 3 Hafta</div><div style="display:flex;gap:12px;margin-bottom:26px;">';
  [0,1,2].forEach(function(w){ var b=weekBlock(w,days); h+='<div style="flex:1;background:#FFF8F3;border:1px solid #F2E1DA;border-radius:12px;padding:14px;"><div style="font-size:15px;font-weight:800;margin-bottom:8px;">'+esc(b.title)+'</div>'; b.rows.forEach(function(r){ h+='<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px;"><span style="color:#5A4D52;">'+esc(r.label)+'</span><b>'+esc(r.val)+'</b></div>'; }); h+='<div style="font-size:11px;color:#7A6B70;margin-top:6px;border-top:1px solid #F2E1DA;padding-top:6px;">Ort. '+esc(b.avg)+' · Seri '+esc(b.best)+'</div></div>'; });
  h+='</div>';
  h+='<div style="font-size:20px;font-weight:800;margin:0 0 14px;">Günlük Tablo (tüm kayıt)</div>';
  h+='<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:24px;"><thead><tr style="background:#F7DDE5;">';
  ['Gün','Tarih','Tik','Mod','Adım','Uyku','SOS','Kısa not'].forEach(function(x){ h+='<th style="text-align:left;padding:7px 9px;border:1px solid #F2E1DA;">'+x+'</th>'; });
  h+='</tr></thead><tbody>';
  days.forEach(function(o){ var rec=o.rec; var mood=rec&&rec.mood?find(MOODS,'id',rec.mood):null; var esr=effSteps(rec); var st=esr.steps!=null?(esr.steps.toLocaleString('tr-TR')+(esr.source==='tracked'?'~':'')):'—'; var sh=(rec&&rec.sleep&&rec.sleep.hours!=null)?(rec.sleep.hours+' sa'):'—'; h+='<tr><td style="padding:6px 9px;border:1px solid #F2E1DA;">'+o.i+'</td><td style="padding:6px 9px;border:1px solid #F2E1DA;">'+shortDate(o.date)+'</td><td style="padding:6px 9px;border:1px solid #F2E1DA;">'+countRec(rec)+'/'+habitCountOn(o.date)+'</td><td style="padding:6px 9px;border:1px solid #F2E1DA;">'+(mood?esc(mood.short):'—')+'</td><td style="padding:6px 9px;border:1px solid #F2E1DA;">'+esc(st)+'</td><td style="padding:6px 9px;border:1px solid #F2E1DA;">'+esc(sh)+'</td><td style="padding:6px 9px;border:1px solid #F2E1DA;">'+(rec?rec.cravingSOSCount||0:0)+'</td><td style="padding:6px 9px;border:1px solid #F2E1DA;">'+esc((rec&&rec.note)?String(rec.note).slice(0,42):'')+'</td></tr>'; });
  h+='</tbody></table>';
  h+='<div style="background:#FFE8A3;border-radius:12px;padding:18px;text-align:center;font-size:15px;font-weight:600;color:#6B4A3A;">Küçük seçimler görünmez gibi durur ama birikince ritim olur.</div>';
  return h;
}
function getStats(){
  var days=allDays(); var keys=HABITS.map(function(h){return h.key;}); var tot={}; keys.forEach(function(k){tot[k]=0;});
  var total=0; var moods={};
  days.forEach(function(d){ if(d.rec){ keys.forEach(function(k){ if(d.rec.habits[k]) tot[k]++; }); total+=countRec(d.rec); if(d.rec.mood) moods[d.rec.mood]=(moods[d.rec.mood]||0)+1; } });
  return {tot:tot,total:total,best:bestStreak(days),mood:topMood(moods),days:days};
}
function openReport(){
  var w=window.open('','_blank');
  if(!w){
    // Quick Look / pop-up engelli: aynı sayfada yazdırılabilir katman
    inlinePrint(); return;
  }
  var doc='<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><title>Şeyma 🦩 Rapor</title>'
    +'<style>@page{margin:14mm;}body{font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#2C2426;margin:0;padding:24px;}@media print{.noprint{display:none;}}</style></head><body>'
    +'<div class="noprint" style="text-align:center;margin-bottom:18px;"><button onclick="window.print()" style="border:none;background:#E9AFC1;color:#fff;font-weight:700;font-size:15px;padding:12px 22px;border-radius:12px;cursor:pointer;">Yazdır / PDF kaydet</button></div>'
    +reportHTML()+'</body></html>';
  w.document.open(); w.document.write(doc); w.document.close();
  setTimeout(function(){ try{ w.focus(); w.print(); }catch(e){} },500);
}
function inlinePrint(){
  var ov=document.getElementById('sey-print'); if(ov) ov.remove();
  var ov2=document.createElement('div'); ov2.id='sey-print';
  ov2.innerHTML='<style>@media print{body *{visibility:hidden;}#sey-print,#sey-print *{visibility:visible;}#sey-print{position:absolute;left:0;top:0;width:100%;}#sey-print .pbar{display:none;}}</style>'
    +'<div class="pbar" style="position:sticky;top:0;display:flex;gap:10px;justify-content:center;padding:12px;background:#fff;border-bottom:1px solid #eee;">'
    +'<button id="sey-print-do" style="border:none;background:#E9AFC1;color:#fff;font-weight:700;font-size:15px;padding:12px 22px;border-radius:12px;">Yazdır / PDF kaydet</button>'
    +'<button id="sey-print-close" style="border:1px solid #ddd;background:#fff;color:#555;font-weight:600;font-size:15px;padding:12px 18px;border-radius:12px;">Kapat</button></div>'
    +'<div style="max-width:780px;margin:0 auto;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#2C2426;">'+reportHTML()+'</div>';
  ov2.style.cssText='position:fixed;inset:0;z-index:9999;background:#fff;overflow:auto;-webkit-overflow-scrolling:touch;';
  document.body.appendChild(ov2);
  document.getElementById('sey-print-do').onclick=function(){ window.print(); };
  document.getElementById('sey-print-close').onclick=function(){ ov2.remove(); };
}

// ---------- render ----------
function el(html){ var d=document.createElement('div'); d.innerHTML=html; return d; }

function render(){
  var root=document.getElementById('root');
  root.setAttribute('data-theme', dark?'dark':'light');
  var app=document.getElementById('app');

  if(!data || ui.forceStart){ app.innerHTML=onboardingHTML(); lastRenderTab=null; lastOverlay=null; lastOverlayView=null; return; }

  var prevScroll=document.querySelector('[data-scroll]');
  var prevTop=prevScroll?prevScroll.scrollTop:0;
  var sameTab=(lastRenderTab===ui.tab);

  // Hub overlay (Ne okudum / Ne izledim): sekme degistirirken tam DOM yeniden kurulur;
  // acik kalan overlay'in scroll'unu yakala ki flash olmadan geri koyalim
  var prevOvBody=document.getElementById('sey-ov-body');
  var prevOvTop=prevOvBody?prevOvBody.scrollTop:0;
  var curOverlay=ui.readingOpen?'reading':(ui.watchOpen?'watching':(ui.listeningOpen?'listening':null));
  var curOverlayView=curOverlay==='reading'?(ui.readingView||'today'):(curOverlay==='watching'?(ui.watchView||'today'):(curOverlay==='listening'?(ui.listeningView||'today'):null));

  var html='<div data-scroll class="scroll" style="flex:1;overflow-y:auto;padding:calc(env(safe-area-inset-top) + 14px) 16px 28px;display:flex;flex-direction:column;gap:14px;">';
  if(editing()) html+=editBanner();
  if(ui.tab==='bugun') html+=bugunHTML();
  else if(ui.tab==='sos') html+=sosHTML();
  else if(ui.tab==='saglik') html+=saglikHTML();
  else if(ui.tab==='harita') html+=haritaHTML();
  else if(ui.tab==='rapor') html+=raporHTML();
  else if(ui.tab==='mesaj') html+=mesajHTML();
  else if(ui.tab==='ayarlar') html+=ayarlarHTML();
  html+='</div>';
  html+=navHTML();
  html+=modalsHTML();
  app.innerHTML=html;
  if(ui.tab==='bugun' && !editing()) maybeFetchWeather();

  var newScroll=document.querySelector('[data-scroll]');
  if(newScroll){
    if(ui.tab==='mesaj' && (!sameTab || ui.aeonScrollBottom)){
      // ÆON sohbeti: açılışta ve yeni mesaj/cevap sonrası en alta (en yeni mesaja) kaydır
      var firstM=newScroll.firstElementChild; if(firstM){ firstM.style.animation='none'; }
      newScroll.scrollTop=newScroll.scrollHeight;
      ui.aeonScrollBottom=false;
    } else if(sameTab){
      // Aynı sekmede veri kaydı sonrası: kaydırma konumunu koru ve giriş animasyonunu tekrar oynatma (titremeyi önler)
      var firstEl=newScroll.firstElementChild;
      if(firstEl){ firstEl.style.animation='none'; }
      newScroll.scrollTop=prevTop;
    }
    if(ui.tab==='mesaj'){
      // Yukarı kaydırılınca beliren "en alta in" düğmesi (premium WhatsApp-tarzı FAB)
      var aeonFab=document.getElementById('aeon-scroll-fab');
      if(aeonFab){
        var toggleAeonFab=function(){ var nb=(newScroll.scrollHeight-newScroll.scrollTop-newScroll.clientHeight)<160; aeonFab.style.display=nb?'none':'flex'; };
        newScroll.addEventListener('scroll',toggleAeonFab,{passive:true});
        toggleAeonFab();
      }
    }
  }

  // Overlay ayni kaldiysa (sekme degisimi veya ic veri aksiyonu): giris animasyonunu tekrar oynatma -> flash yok
  if(curOverlay && curOverlay===lastOverlay){
    var ovBack=document.getElementById('sey-ov-back');
    var ovCard=document.getElementById('sey-ov-card');
    if(ovBack) ovBack.style.animation='none';
    if(ovCard) ovCard.style.animation='none';
    var ovBody=document.getElementById('sey-ov-body');
    // Ayni sekmede kaldiysak scroll'u koru; sekme degistiyse en uste don
    if(ovBody && curOverlayView===lastOverlayView) ovBody.scrollTop=prevOvTop;
  }
  lastOverlay=curOverlay;
  lastOverlayView=curOverlayView;
  lastRenderTab=ui.tab;
}

function onboardingHTML(){
  return '<div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:calc(env(safe-area-inset-top) + 28px) 24px calc(env(safe-area-inset-bottom) + 28px);gap:22px;animation:seyFade .3s ease;">'
   +'<div style="text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px;">'
   +'<div style="width:78px;height:78px;border-radius:24px;display:flex;align-items:center;justify-content:center;font-size:40px;background:linear-gradient(135deg,#FFE8A3,#F7DDE5);box-shadow:0 12px 30px rgba(233,175,193,0.4);">🦩</div>'
   +'<h1 style="margin:0;font-size:34px;font-weight:800;letter-spacing:-0.5px;">Şeyma 🦩</h1>'
   +'<div style="font-size:16px;color:var(--muted);">Minik Denge Günlüğü</div></div>'
   +'<div class="glass" style="border-radius:26px;padding:24px;box-shadow:0 10px 30px rgba(108,74,58,0.08);display:flex;flex-direction:column;gap:14px;">'
   +'<p style="margin:0;font-size:19px;font-weight:700;">Hoş geldin Sevgili Günışığı ☀️</p>'
   +'<p style="margin:0;font-size:15.5px;line-height:1.6;color:var(--text2);">Burası diyet kampı değil. Burası tatlı krizlerinin hafifçe hizaya geldiği, akşam mutfağının biraz daha az ziyaret edildiği, senin de kendine daha iyi davrandığın minik bir alan.</p>'
   +'<p style="margin:0;font-size:15.5px;line-height:1.6;color:var(--text2);">Mükemmel olmaya çalışmıyoruz. Her gün küçük küçük kontrolü geri alıyoruz — süresiz, kendi ritminde.</p></div>'
   +'<button onclick="App.start()" style="border:none;cursor:pointer;width:100%;padding:18px;border-radius:20px;font-size:17px;font-weight:700;color:#fff;background:linear-gradient(135deg,#E9AFC1,#C9B8FF);box-shadow:0 12px 28px rgba(233,175,193,0.5);">Tamam Raşit, başlayalım ✨</button>'
   +'<p style="margin:0;text-align:center;font-size:12.5px;line-height:1.5;color:var(--faint);">Bilgiler sadece bu cihazdaki tarayıcıda tutulur. İstersen yedek dosyası olarak dışa aktarabilirsin.</p></div>';
}

function nutritionSummaryCard(rec){
  var nu=dayNutrition(rec);
  var pct=Math.min(100,Math.round(nu.protein/PROTEIN_GOAL*100));
  var h='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:11px;">';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;"><div style="font-size:15.5px;font-weight:700;">Beslenme özeti 🍽️</div><div style="font-size:11.5px;color:var(--faint);">tabak · gr · adet ile hesaplanır</div></div>';
  h+='<div style="display:flex;align-items:center;gap:14px;">';
  h+='<div style="flex:1;min-width:0;"><div style="display:flex;align-items:baseline;gap:6px;"><span style="font-size:12px;color:var(--muted);">Protein</span><span id="nutri-protein" style="font-size:22px;font-weight:800;color:var(--text);font-variant-numeric:tabular-nums;">'+nu.protein+'g</span><span style="font-size:12px;color:var(--faint);">/ '+PROTEIN_GOAL+'g</span></div>';
  h+='<div style="height:9px;border-radius:999px;background:rgba(150,110,120,0.14);overflow:hidden;margin-top:6px;"><div id="nutri-bar" style="height:100%;width:'+pct+'%;border-radius:999px;background:linear-gradient(90deg,#E9899F,#C9B8FF);transition:width .4s ease;"></div></div></div>';
  h+='<div style="text-align:center;flex-shrink:0;padding-left:6px;border-left:1px solid var(--card-bd);"><div id="nutri-cal" style="font-size:20px;font-weight:800;color:var(--text);font-variant-numeric:tabular-nums;">'+nu.calories+'</div><div style="font-size:11px;color:var(--faint);">kcal (tah.)</div></div>';
  h+='</div>';
  h+='<div style="font-size:11px;color:var(--faint);line-height:1.4;">Değerler kaba tahmindir; protein hedefini takip etmen için yeterli. Detay arttıkça isabet artar.</div>';
  h+='</div>';
  return h;
}
function mealEditorCard(rec){
  var mi=(rec&&rec.mealItems)?rec.mealItems:emptyMealItems();
  var h='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:14px;">';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;"><div style="font-size:15.5px;font-weight:700;">Bugün ne yedim?</div><div style="font-size:12px;color:var(--faint);">otomatik kaydolur</div></div>';
  MEALS.forEach(function(m){
    var items=Array.isArray(mi[m.key])?mi[m.key]:[];
    var sub=mealNutr(rec,m.key);
    h+='<div style="display:flex;flex-direction:column;gap:8px;">';
    h+='<div style="display:flex;align-items:center;gap:9px;"><div style="width:34px;height:34px;border-radius:11px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:17px;background:var(--icon);">'+m.icon+'</div><div style="font-size:13px;font-weight:700;color:var(--text);">'+m.label+'</div><div id="meal-sub-'+m.key+'" style="margin-left:auto;font-size:12px;font-weight:700;color:var(--accent);">'+Math.round(sub.protein)+'g protein</div></div>';
    items.forEach(function(it,idx){
      var known=!!foodLookup(it.name);
      h+='<div style="display:flex;gap:6px;align-items:center;">';
      h+='<input data-meal="'+m.key+'" data-idx="'+idx+'" value="'+esc(it.name||'')+'" oninput="App.setMealItemName(\''+m.key+'\','+idx+',this)" placeholder="'+esc(m.ph.split(',')[0].replace('örn. ',''))+'…" style="flex:1;min-width:0;border:1px solid var(--field-bd);background:var(--field);border-radius:11px;padding:9px 11px;font-size:13.5px;outline:none;">';
      h+='<input type="number" inputmode="decimal" min="0" step="0.5" value="'+(it.qty===''||it.qty==null?'':esc(it.qty))+'" onchange="App.setMealItemQty(\''+m.key+'\','+idx+',this)" style="width:52px;border:1px solid var(--field-bd);background:var(--field);border-radius:11px;padding:9px 4px;font-size:13.5px;text-align:center;outline:none;">';
      h+='<select onchange="App.setMealItemUnit(\''+m.key+'\','+idx+',this)" style="width:62px;border:1px solid var(--field-bd);background:var(--field);border-radius:11px;padding:9px 4px;font-size:12.5px;outline:none;color:var(--text);">';
      MEAL_UNITS.forEach(function(u){ h+='<option value="'+u.id+'"'+(it.unit===u.id?' selected':'')+'>'+u.label+'</option>'; });
      h+='</select>';
      h+='<button onclick="App.removeMealItem(\''+m.key+'\','+idx+')" aria-label="Sil" style="flex-shrink:0;border:none;cursor:pointer;width:30px;height:30px;border-radius:9px;background:rgba(220,120,120,0.1);color:#C0605F;font-size:14px;">×</button>';
      h+='</div>';
    });
    h+='<button onclick="App.addMealItem(\''+m.key+'\')" style="align-self:flex-start;border:1px dashed var(--field-bd);cursor:pointer;padding:7px 13px;border-radius:11px;font-size:12.5px;font-weight:700;color:var(--muted);background:transparent;">+ '+m.label.toLowerCase()+'\'a ekle</button>';
    h+='</div>';
  });
  h+='</div>';
  return h;
}
function waterCard(rec){
  var w=rec&&typeof rec.water==='number'?rec.water:0;
  var pct=Math.min(100,Math.round(w/WATER_GOAL*100));
  var h='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;">';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;"><div style="font-size:15.5px;font-weight:700;">Su 💧</div><div style="font-size:12.5px;color:var(--faint);"><b style="color:var(--accent);font-size:16px;">'+w+'</b> / '+WATER_GOAL+' bardak</div></div>';
  h+='<div style="display:flex;gap:5px;">';
  for(var i=0;i<WATER_GOAL;i++){ var on=i<w; h+='<div style="flex:1;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:15px;'+(on?'background:linear-gradient(135deg,#9CC9F0,#C9B8FF);box-shadow:0 4px 10px rgba(120,160,220,0.3);':'background:rgba(150,170,200,0.12);border:1px solid var(--card-bd);')+'">'+(on?'💧':'')+'</div>'; }
  h+='</div>';
  if(w>WATER_GOAL){ h+='<div style="font-size:11.5px;color:var(--faint);">+'+(w-WATER_GOAL)+' bardak ekstra, harika 💪</div>'; }
  var waterTicked=!!(rec&&rec.habits&&rec.habits.water);
  if(waterTicked&&w<WATER_GOAL&&!ui.waterNudgeHidden){
    h+='<div style="display:flex;gap:9px;align-items:flex-start;background:linear-gradient(135deg,rgba(127,179,232,0.16),rgba(155,127,201,0.12));border:1px solid rgba(127,179,232,0.4);border-radius:14px;padding:11px 12px;">';
    h+='<span style="font-size:18px;line-height:1.2;">💧</span>';
    h+='<div style="flex:1;min-width:0;font-size:12.5px;color:var(--text2);line-height:1.45;">Su tikin işaretli 👏 Kaç bardak içtiğini de girersen takibin daha net olur. <span style="color:var(--faint);">(zorunlu değil)</span></div>';
    h+='<button onclick="App.hideWaterNudge()" aria-label="Kapat" style="flex-shrink:0;border:none;background:none;cursor:pointer;color:var(--faint);font-size:15px;font-weight:700;line-height:1;">✕</button></div>';
  }
  h+='<div style="display:flex;gap:9px;">';
  h+='<button onclick="App.waterAdd(-1)" style="flex:1;border:1px solid var(--field-bd);cursor:pointer;padding:12px;border-radius:14px;font-size:18px;font-weight:800;color:var(--muted);background:var(--card);">−</button>';
  h+='<button onclick="App.waterAdd(1)" style="flex:2;border:none;cursor:pointer;padding:12px;border-radius:14px;font-size:15px;font-weight:800;color:#fff;background:linear-gradient(135deg,#7FB3E8,#9B7FC9);box-shadow:0 8px 18px rgba(120,160,220,0.35);">+1 bardak içtim 💧</button>';
  h+='</div></div>';
  return h;
}
function energyStressBlock(rec){
  var en=rec?rec.energy:null, st=rec?rec.stress:null;
  function row(label,emoji,cur,fn){
    var s='<div style="display:flex;align-items:center;gap:9px;"><span style="font-size:12.5px;font-weight:700;color:var(--muted);width:62px;flex-shrink:0;">'+emoji+' '+label+'</span><div style="display:flex;gap:5px;flex:1;">';
    for(var v=1;v<=5;v++){ var on=cur!=null&&v<=cur; var sel=cur===v; s+='<button onclick="App.'+fn+'('+v+')" aria-label="'+v+'" style="flex:1;height:26px;border-radius:8px;cursor:pointer;font-size:11px;font-weight:800;'+(on?'background:linear-gradient(135deg,#FFD37A,#E9AFC1);border:1px solid #E9AFC1;color:#5A2E2A;':'background:var(--card);border:1px solid var(--card-bd);color:var(--faint);')+(sel?'box-shadow:0 4px 10px rgba(233,175,193,0.4);':'')+'">'+v+'</button>'; }
    s+='</div></div>'; return s;
  }
  var h='<div style="border-top:1px solid var(--card-bd);padding-top:12px;display:flex;flex-direction:column;gap:10px;">';
  h+='<div style="font-size:12px;color:var(--faint);">Bugün enerjin ve stresin (1 düşük · 5 yüksek)</div>';
  h+=row('Enerji','⚡',en,'setEnergy');
  h+=row('Stres','🌀',st,'setStress');
  h+='</div>';
  return h;
}
function eveningNudge(rec){
  var hr=new Date().getHours();
  if(hr<20&&hr>4) return '';
  var rd=readingStats(rec);
  if(rd.count>0) return '';
  return '<div style="position:relative;overflow:hidden;background:linear-gradient(135deg,#6E55BF,#9B7FC9 55%,#E9AFC1);border-radius:20px;padding:15px 16px;display:flex;align-items:center;gap:12px;box-shadow:0 12px 26px rgba(110,85,191,0.35);">'
    +'<span style="font-size:26px;">📖</span>'
    +'<div style="flex:1;min-width:0;"><div style="font-size:14.5px;font-weight:800;color:#fff;">Gece yaklaşıyor</div><div style="font-size:12px;color:rgba(255,255,255,0.9);line-height:1.35;">Bugün ne okudun? Birkaç sayfa, uykuya geçişi yumuşatır.</div></div>'
    +'<button onclick="App.openReading()" style="flex-shrink:0;border:none;cursor:pointer;background:rgba(255,255,255,0.95);color:#6E55BF;font-weight:800;font-size:13px;padding:9px 14px;border-radius:12px;">Ekle</button></div>';
}

function stepReminder(rec){
  if(ui.stepRemindHidden) return '';
  var hr=new Date().getHours();
  if(hr<19&&hr>4) return '';
  var stepsEmpty=!(rec&&rec.walk&&rec.walk.steps!=null&&rec.walk.steps!=='');
  if(!stepsEmpty) return '';
  return '<div style="display:flex;align-items:center;gap:11px;background:linear-gradient(135deg,rgba(230,193,90,0.14),rgba(155,127,201,0.10));border:1px solid rgba(201,160,60,0.35);border-radius:16px;padding:12px 14px;">'
    +'<span style="font-size:22px;">👣</span>'
    +'<div style="flex:1;min-width:0;"><div style="font-size:13.5px;font-weight:700;color:var(--text);">Bugünün adımını eklemek ister misin?</div><div style="font-size:11.5px;color:var(--muted);line-height:1.35;">Telefonundaki adımı yazman ya da Sağlık’tan çekmen yeter — zorunlu değil.</div></div>'
    +'<button onclick="App.go(\'saglik\')" style="flex-shrink:0;border:none;cursor:pointer;background:linear-gradient(135deg,#E6C15A,#C99A3A);color:#1a1404;font-weight:800;font-size:12.5px;padding:9px 13px;border-radius:12px;">Ekle</button>'
    +'<button onclick="App.hideStepRemind()" aria-label="Kapat" style="flex-shrink:0;border:none;background:none;cursor:pointer;color:var(--faint);font-size:15px;font-weight:700;line-height:1;">✕</button></div>';
}
function fmtDist(m){ m=Math.max(0,Number(m)||0); return m<1000?Math.round(m)+' m':(m/1000).toFixed(2)+' km'; }
function fmtDur(sec){ sec=Math.max(0,Math.round(Number(sec)||0)); if(sec<60) return sec+' sn'; var m=Math.round(sec/60); if(m<60) return m+' dk'; var hh=Math.floor(m/60), mm=m%60; return hh+' sa'+(mm?(' '+mm+' dk'):''); }
function locationCardHTML(){
  var s=data.settings||{};
  var on=!!s.locationEnabled;
  var mode=s.locationMode||'auto';
  var today=todayStr();
  var rec=data.days[today]||null;
  var mv=rec&&rec.movement?rec.movement:{walkM:0,vehicleM:0,totalM:0,maxSpeed:0};
  var loc=data.location, upd='—';
  if(loc&&loc.ts){ var am=Math.round((Date.now()-new Date(loc.ts).getTime())/60000); upd = am<1?'az önce':am<60?am+' dk önce':am<1440?Math.round(am/60)+' sa önce':Math.round(am/1440)+' g önce'; }
  var swBg=on?'linear-gradient(135deg,#7DBE77,#5BA85B)':'linear-gradient(135deg,#E68A84,#D9534F)';
  var knobLeft=on?'26px':'3px';
  var h='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;">';
  h+='<div style="display:flex;align-items:center;gap:10px;">';
  h+='<div style="flex:1;font-size:15.5px;font-weight:800;display:flex;align-items:center;gap:8px;">Konum & Hareket 📍 <span style="font-size:11px;font-weight:800;padding:2px 9px;border-radius:999px;color:#fff;background:'+(on?'#3F9A4F':'#D9534F')+';">'+(on?'AÇIK':'KAPALI')+'</span></div>';
  h+='<button onclick="App.toggleLocation()" aria-label="Konum paylaşımı aç/kapat" style="border:none;cursor:pointer;flex-shrink:0;width:56px;height:32px;border-radius:999px;position:relative;transition:background .2s;background:'+swBg+';"><span style="position:absolute;top:3px;left:'+knobLeft+';width:26px;height:26px;border-radius:50%;background:#fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);transition:left .2s;"></span></button>';
  h+='</div>';
  if(!on){
    h+='<div style="font-size:12.5px;line-height:1.5;color:var(--text2);">Açtığında yürüyüş ve araç hareketlerin ölçülür.</div>';
    h+='</div>';
    return h;
  }
  function mbtn(id,emoji,label){ var act=mode===id; return '<button onclick="App.setLocationMode(\''+id+'\')" style="flex:1;border:1px solid '+(act?'#8FBF8A':'var(--card-bd)')+';cursor:pointer;padding:9px 4px;border-radius:12px;font-size:12.5px;font-weight:700;color:'+(act?'#2F7A3F':'var(--text2)')+';background:'+(act?'rgba(143,191,138,0.18)':'transparent')+';">'+emoji+' '+label+'</button>'; }
  h+='<div style="display:flex;gap:7px;">'+mbtn('walk','🚶','Yürüyüş')+mbtn('vehicle','🚗','Araç')+mbtn('auto','✨','Oto')+'</div>';
  h+='<div style="display:flex;gap:10px;">';
  h+='<div style="flex:1;background:var(--icon);border-radius:14px;padding:11px;text-align:center;"><div style="font-size:11px;color:var(--muted);font-weight:700;">Bugün toplam</div><div id="loc-dist-today" style="font-size:18px;font-weight:800;color:var(--text);font-variant-numeric:tabular-nums;">'+fmtDist(mv.totalM)+'</div></div>';
  h+='<div style="flex:1;background:var(--icon);border-radius:14px;padding:11px;text-align:center;"><div style="font-size:11px;color:var(--muted);font-weight:700;">Anlık hız</div><div id="loc-speed" style="font-size:18px;font-weight:800;color:var(--text);font-variant-numeric:tabular-nums;">0 km/sa</div></div>';
  h+='</div>';
  h+='<div style="display:flex;gap:8px;font-size:12.5px;">';
  h+='<span style="flex:1;background:rgba(143,191,138,0.14);border-radius:10px;padding:8px 10px;color:var(--text2);">🚶 Yürüyüş <b id="loc-walk" style="float:right;">'+fmtDist(mv.walkM)+'</b></span>';
  h+='<span style="flex:1;background:rgba(201,184,255,0.16);border-radius:10px;padding:8px 10px;color:var(--text2);">🚗 Araç <b id="loc-vehicle" style="float:right;">'+fmtDist(mv.vehicleM)+'</b></span>';
  h+='</div>';
  h+='<div style="display:flex;gap:8px;font-size:12.5px;">';
  h+='<span style="flex:1;background:rgba(143,191,138,0.10);border-radius:10px;padding:8px 10px;color:var(--text2);">⏱️ Ayakta <b id="loc-walk-dur" style="float:right;">'+fmtDur(mv.walkSec)+'</b></span>';
  h+='<span style="flex:1;background:rgba(201,184,255,0.11);border-radius:10px;padding:8px 10px;color:var(--text2);">🕰️ Yolda <b id="loc-veh-dur" style="float:right;">'+fmtDur(mv.vehicleSec)+'</b></span>';
  h+='</div>';
  if(mode==='auto') h+='<div style="font-size:12px;color:var(--faint);">Oto-mod: <b id="loc-auto-mode" style="color:var(--text2);">'+autoModeLabel()+'</b> · son güncelleme <span id="loc-updated">'+esc(upd)+'</span></div>';
  else h+='<div style="font-size:12px;color:var(--faint);">Son güncelleme <span id="loc-updated">'+esc(upd)+'</span></div>';
  h+='<div style="font-size:11.5px;color:var(--faint);line-height:1.45;">Ölçüm yalnızca uygulama açıkken yapılır (tarayıcı arka planda izleyemez). Hareketler korunur, silinmez.</div>';
  h+='</div>';
  return h;
}
// ---------- Günışığı hava durumu (Open-Meteo, anahtarsız) ----------
var wxFetching=false;
var WX_SPOTS_FIXED=[
  {key:'ev', label:'Ev', place:'Kazan', emoji:'🏠', lat:40.23, lng:32.68},
  {key:'is', label:'İş', place:'Altındağ', emoji:'🏢', lat:39.97, lng:32.92}
];
function wxMode(){ var s=(data&&data.settings)?data.settings:{}; return (s.locationEnabled && data.location && typeof data.location.lat==='number') ? 'live' : 'fixed'; }
function weatherSpots(){
  if(wxMode()==='live'){
    var nm=(data.weather&&data.weather.liveName)||'';
    return [{key:'live', label:'Konumun', place:nm, emoji:'📍', lat:data.location.lat, lng:data.location.lng}];
  }
  return WX_SPOTS_FIXED;
}
function wxStale(){
  if(!data.weather||!data.weather.fetchedAt||!(data.weather.spots&&data.weather.spots.length)) return true;
  if(data.weather.mode!==wxMode()) return true;
  var age=Date.now()-new Date(data.weather.fetchedAt).getTime();
  return !(age>=0 && age<30*60000);
}
function maybeFetchWeather(){ if(!data||editing()) return; if(wxFetching) return; if(!wxStale()) return; fetchWeather(); }
function fetchWeather(){
  if(wxFetching || typeof fetch!=='function') return;
  var spots=weatherSpots(); if(!spots.length) return;
  wxFetching=true;
  var lats=spots.map(function(s){return s.lat;}).join(',');
  var lngs=spots.map(function(s){return s.lng;}).join(',');
  var url='https://api.open-meteo.com/v1/forecast?latitude='+lats+'&longitude='+lngs
    +'&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m'
    +'&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max'
    +'&timezone=auto&forecast_days=1';
  fetch(url).then(function(r){ return r.ok?r.json():Promise.reject(r.status); }).then(function(j){
    var arr=Array.isArray(j)?j:[j]; var out=[];
    for(var i=0;i<spots.length;i++){
      var w=arr[i]||arr[0]; if(!w||!w.current) continue; var dl=w.daily||{};
      out.push({
        key:spots[i].key, label:spots[i].label, place:spots[i].place, emoji:spots[i].emoji,
        temp:Math.round(w.current.temperature_2m), feels:Math.round(w.current.apparent_temperature),
        hum:w.current.relative_humidity_2m, wind:Math.round(w.current.wind_speed_10m),
        precip:w.current.precipitation, code:w.current.weather_code, isDay:w.current.is_day===1,
        hi:(dl.temperature_2m_max?Math.round(dl.temperature_2m_max[0]):null),
        lo:(dl.temperature_2m_min?Math.round(dl.temperature_2m_min[0]):null),
        uv:(dl.uv_index_max?Math.round(dl.uv_index_max[0]):null),
        pop:(dl.precipitation_probability_max?dl.precipitation_probability_max[0]:null),
        sunrise:(dl.sunrise?dl.sunrise[0]:null), sunset:(dl.sunset?dl.sunset[0]:null)
      });
    }
    if(!out.length){ wxFetching=false; return; }
    var keepName=(data.weather&&data.weather.liveName)||'';
    data.weather={mode:wxMode(), fetchedAt:new Date().toISOString(), spots:out, liveName:keepName};
    wxFetching=false; saveLocal();
    if(wxMode()==='live' && !data.weather.liveName) reverseGeocodeLive(spots[0].lat, spots[0].lng);
    if(ui.tab==='bugun') render();
  }).catch(function(){ wxFetching=false; });
}
function reverseGeocodeLive(lat,lng){
  if(typeof fetch!=='function') return;
  fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?latitude='+lat+'&longitude='+lng+'&localityLanguage=tr')
    .then(function(r){ return r.ok?r.json():Promise.reject(0); }).then(function(j){
      var nm=j.locality||j.city||j.principalSubdivision||'';
      if(nm && data.weather){ data.weather.liveName=nm; if(data.weather.spots&&data.weather.spots[0]) data.weather.spots[0].place=nm; saveLocal(); if(ui.tab==='bugun') render(); }
    }).catch(function(){});
}
function wxMeta(code,isDay){
  var c=code;
  if(c===0) return {emoji:isDay?'☀️':'🌙', label:isDay?'Açık':'Açık gece', cat:'clear'};
  if(c===1) return {emoji:isDay?'🌤️':'🌙', label:'Az bulutlu', cat:'clear'};
  if(c===2) return {emoji:'⛅', label:'Parçalı bulutlu', cat:'cloud'};
  if(c===3) return {emoji:'☁️', label:'Bulutlu', cat:'cloud'};
  if(c===45||c===48) return {emoji:'🌫️', label:'Sisli', cat:'fog'};
  if(c>=51&&c<=57) return {emoji:'🌦️', label:'Çiseli', cat:'rain'};
  if(c>=61&&c<=67) return {emoji:'🌧️', label:'Yağmurlu', cat:'rain'};
  if(c>=71&&c<=77) return {emoji:'❄️', label:'Karlı', cat:'snow'};
  if(c>=80&&c<=82) return {emoji:'🌧️', label:'Sağanak', cat:'rain'};
  if(c>=85&&c<=86) return {emoji:'🌨️', label:'Kar sağanağı', cat:'snow'};
  if(c>=95) return {emoji:'⛈️', label:'Gök gürültülü', cat:'storm'};
  return {emoji:'🌡️', label:'—', cat:'cloud'};
}
function wxAdvice(sp){
  var a=[]; var t=(sp.feels!=null?sp.feels:sp.temp); var cat=wxMeta(sp.code,sp.isDay).cat;
  if(sp.uv!=null && sp.uv>=6) a.push({i:'🧴', t:'UV yüksek ('+sp.uv+') — güneş kremi ve şapka ihmal etme'});
  if(t>=30) a.push({i:'💧', t:'Sıcak — bol su iç, öğle güneşinden kaç, serinde kal'});
  else if(t>=26) a.push({i:'💧', t:'Ilıman-sıcak — su şişeni yanına almayı unutma'});
  if(t<=4) a.push({i:'🧣', t:'Soğuk — katmanlı giyin, eklemlerini üşütme'});
  else if(t<=10) a.push({i:'🧥', t:'Serin — hafif bir mont bugün iyi gider'});
  if(cat==='rain'||(sp.pop!=null&&sp.pop>=50)) a.push({i:'☔', t:'Yağış ihtimali — şemsiyeni al; basınç değişimi baş ağrısı tetikleyebilir'});
  if(cat==='snow') a.push({i:'🧊', t:'Kar/buz — zemin kaygan, adımına dikkat et'});
  if(cat==='storm') a.push({i:'⛈️', t:'Fırtına — mümkünse dışarıyı ertele, içeride kal'});
  if(sp.wind!=null && sp.wind>=25) a.push({i:'💨', t:'Rüzgârlı ('+sp.wind+' km/sa) — saç/şal derdine hazırlıklı ol'});
  if(sp.hum!=null && sp.hum>=75 && t>=24) a.push({i:'💦', t:'Nem yüksek — terleme artabilir, sıvı tüketmeyi ihmal etme'});
  if(!a.length) a.push({i:'🌸', t:'Hava dengede — güzel bir gün için tam vaktinde 💛'});
  return a.slice(0,3);
}
var WX_QUIPS={
  clear:['Güneş bugün senin için çıktı Günışığı; gölgesi bile yakışıyor sana 🌻','Gökyüzü açık, niyetin de öyle olsun — bugün senin sahnendesin ☀️','Böyle güzel bir günde tek eksik senin gülüşündü, o da geldi işte 😄'],
  cloud:['Bulutlar geçici, sen kalıcısın Günışığı ☁️→☀️','Bulutlu ama kasvetli değil; sen içeriden ışıldıyorsun zaten ✨','Gökyüzü biraz mahmur; kahveni al, ikiniz de uyanırsınız ☕'],
  rain:['Yağmur toprağı, sen günü besliyorsun; ikiniz de bereketsiniz 🌧️🌱','Şemsiyen yanında olsun; ıslanmadan da dans edilir bu hayatta ☔💃','Yağmur camda ritim tutuyor, sen de kendi şarkını mırıldan 🎵'],
  snow:['Kar sessizce yağar ama iz bırakır — tıpkı senin gibi ❄️','Dışarısı buz, içerisi sen: en sıcak yer neresi belli oldu 🧣','Kar tanesi kadar biriciksin Günışığı; üşüme sakın ☃️'],
  fog:['Sis var ama yolunu sen zaten kalbinle biliyorsun 🌫️','Puslu bir sabah; net olan tek şey senin değerin 💛'],
  storm:['Fırtına da geçer Günışığı; sen köklerinden eminsin ⛈️🌳','Gök gürlese de senin içindeki huzuru bastıramaz ⚡']
};
function wxQuip(cat){ var arr=WX_QUIPS[cat]||WX_QUIPS.clear; var seed=0,t=todayStr(); for(var i=0;i<t.length;i++) seed+=t.charCodeAt(i); return arr[seed%arr.length]; }
function wxHm(iso){ if(!iso) return '—'; var p=(iso.split('T')[1]||''); return p.slice(0,5)||'—'; }
function wxSpotChip(sp){ var m=wxMeta(sp.code,sp.isDay); return '<div style="display:flex;align-items:center;gap:5px;justify-content:flex-end;font-size:13px;font-weight:800;color:#7A3E1E;line-height:1.35;"><span style="opacity:.85;">'+sp.emoji+'</span><span>'+m.emoji+'</span><span>'+sp.temp+'°</span></div>'; }
function wxDetail(icon,label,val){ return '<div style="flex:1;min-width:0;background:rgba(255,255,255,0.45);border-radius:12px;padding:8px 9px;text-align:center;"><div style="font-size:10.5px;color:#A85E3C;font-weight:800;">'+icon+' '+label+'</div><div style="font-size:14px;font-weight:800;color:#7A3E1E;margin-top:2px;">'+val+'</div></div>'; }
function weatherHeaderHTML(greet){
  var open=!!ui.weatherOpen;
  var wx=data.weather;
  var spots=(wx&&wx.spots&&wx.spots.length)?wx.spots:null;
  var live=!!(wx&&wx.mode==='live');
  var primary=null;
  if(spots){ primary=spots[0]; for(var i=1;i<spots.length;i++){ var b=spots[i]; var sv=(b.uv||0)+(b.feels!=null?b.feels:b.temp||0); var ps=(primary.uv||0)+(primary.feels!=null?primary.feels:primary.temp||0); if(sv>ps) primary=b; } }
  var pm=primary?wxMeta(primary.code,primary.isDay):null;
  var h='<div class="wxcard" onclick="App.toggleWeather()" role="button" aria-expanded="'+(open?'true':'false')+'" style="position:relative;overflow:hidden;border-radius:24px;padding:15px 16px;background:linear-gradient(120deg,#FFE7A8,#FFC891 52%,#F7B3C7);box-shadow:0 12px 28px var(--sun-glow);">';
  h+='<div style="position:absolute;top:-32px;right:-16px;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,0.55),transparent 70%);pointer-events:none;"></div>';
  h+='<div style="position:absolute;bottom:-42px;left:30px;width:96px;height:96px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,0.28),transparent 70%);pointer-events:none;"></div>';
  h+='<div style="position:relative;display:flex;align-items:center;gap:12px;">';
  h+='<span style="font-size:30px;line-height:1;filter:drop-shadow(0 3px 7px rgba(240,150,70,0.55));">'+(pm?pm.emoji:'☀️')+'</span>';
  var sub=greet+' ✨'; if(pm) sub+=' · '+pm.label;
  h+='<div style="flex:1;min-width:0;"><div style="font-size:20px;font-weight:900;letter-spacing:0.3px;color:#8A4426;line-height:1.12;">Günışığı</div><div style="font-size:12px;font-weight:700;color:#A85E3C;letter-spacing:.2px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+esc(sub)+'</div></div>';
  h+='<div style="display:flex;align-items:center;gap:9px;flex-shrink:0;">';
  if(spots){
    if(live){ h+='<div style="text-align:right;"><div style="font-size:20px;font-weight:900;color:#7A3E1E;line-height:1;">'+spots[0].temp+'°</div>'+(spots[0].place?'<div style="font-size:10.5px;font-weight:700;color:#A85E3C;margin-top:2px;">📍 '+esc(spots[0].place)+'</div>':'')+'</div>'; }
    else { h+='<div style="display:flex;flex-direction:column;gap:3px;">'+wxSpotChip(spots[0])+wxSpotChip(spots[1]||spots[0])+'</div>'; }
  } else { h+='<div style="font-size:11.5px;font-weight:700;color:#A85E3C;">hava…</div>'; }
  h+='<span style="font-size:13px;color:#B5673A;transition:transform .2s;display:inline-block;transform:rotate('+(open?'180deg':'0deg')+');">▾</span>';
  h+='</div></div>';
  if(!open && spots){ h+='<div style="position:relative;margin-top:8px;text-align:center;font-size:10.5px;font-weight:700;letter-spacing:.3px;color:rgba(122,62,30,0.6);">detaylar için dokun ▾</div>'; }
  if(open && spots){
    h+='<div style="position:relative;margin-top:12px;animation:seyFade .25s ease;">';
    for(var si=0; si<spots.length; si++){
      var sp=spots[si]; var m=wxMeta(sp.code,sp.isDay);
      h+='<div style="border-top:1px solid rgba(138,68,38,0.16);padding-top:11px;'+(si>0?'margin-top:11px;':'')+'">';
      h+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:9px;"><span style="font-size:20px;">'+sp.emoji+'</span>';
      h+='<div style="flex:1;min-width:0;"><div style="font-size:14.5px;font-weight:900;color:#8A4426;">'+esc(sp.label)+(sp.place?' · <span style="font-weight:700;color:#A85E3C;">'+esc(sp.place)+'</span>':'')+'</div><div style="font-size:11.5px;font-weight:700;color:#A85E3C;">'+m.emoji+' '+m.label+'</div></div>';
      h+='<div style="font-size:22px;font-weight:900;color:#7A3E1E;">'+sp.temp+'°</div></div>';
      h+='<div style="display:flex;gap:6px;margin-bottom:6px;">'+wxDetail('🌡️','Hissedilen',sp.feels+'°')+wxDetail('💧','Nem','%'+sp.hum)+wxDetail('💨','Rüzgâr',sp.wind+' km/sa')+'</div>';
      h+='<div style="display:flex;gap:6px;">'+wxDetail('🔆','UV',(sp.uv!=null?sp.uv:'—'))+wxDetail('↕️','En Y/D',(sp.hi!=null?sp.hi+'°/'+sp.lo+'°':'—'))+wxDetail('🌅','Doğ/Bat',wxHm(sp.sunrise)+'·'+wxHm(sp.sunset))+'</div>';
      h+='</div>';
    }
    if(primary){
      var adv=wxAdvice(primary);
      h+='<div style="border-top:1px solid rgba(138,68,38,0.16);padding-top:11px;margin-top:11px;"><div style="font-size:12.5px;font-weight:900;color:#8A4426;margin-bottom:7px;">💡 Sağlık notları</div>';
      for(var ai=0; ai<adv.length; ai++){ h+='<div style="display:flex;gap:8px;align-items:flex-start;background:rgba(255,255,255,0.42);border-radius:12px;padding:8px 10px;'+(ai>0?'margin-top:6px;':'')+'"><span style="font-size:15px;line-height:1.3;">'+adv[ai].i+'</span><span style="flex:1;font-size:12.5px;font-weight:600;color:#7A3E1E;line-height:1.4;">'+esc(adv[ai].t)+'</span></div>'; }
      h+='</div>';
      var q=wxQuip(pm?pm.cat:'clear');
      h+='<div style="border-top:1px solid rgba(138,68,38,0.16);padding-top:11px;margin-top:11px;font-size:12.5px;font-style:italic;font-weight:600;color:#8A4426;line-height:1.5;">❝ '+esc(q)+' ❞</div>';
    }
    if(wx.fetchedAt){ var am=Math.round((Date.now()-new Date(wx.fetchedAt).getTime())/60000); var us=am<1?'az önce':am<60?am+' dk önce':Math.round(am/60)+' sa önce'; h+='<div style="margin-top:9px;text-align:right;font-size:10px;color:rgba(122,62,30,0.55);">Open-Meteo · '+us+'</div>'; }
    h+='</div>';
  }
  h+='</div>';
  return h;
}
function onThisDayCard(){
  var today=todayStr(); var mmdd=today.slice(5); var curY=parseInt(today.slice(0,4),10);
  var best=null;
  for(var k in data.days){ if(String(k).slice(5)!==mmdd) continue; var y=parseInt(String(k).slice(0,4),10); if(isNaN(y)||y>=curY) continue; var r=data.days[k]; if(!r) continue;
    var hasG=Array.isArray(r.gratitude)&&r.gratitude.some(function(g){return String(g||'').trim();});
    var has=(countRec(r)>0)||r.mood||(r.note&&String(r.note).trim())||(r.intention&&String(r.intention).trim())||hasG;
    if(!has) continue;
    if(!best||k>best.date){ best={date:k,rec:r,year:y}; }
  }
  if(!best) return '';
  var r=best.rec; var yearsAgo=curY-best.year;
  var mo=r.mood?find(MOODS,'id',r.mood):null;
  var cnt=countRec(r), tot=habitCountOn(best.date);
  var h='<div class="glass" onclick="App.openDate(\''+best.date+'\')" style="cursor:pointer;border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:10px;background:linear-gradient(160deg,rgba(201,184,255,0.16),rgba(255,225,154,0.10));">';
  h+='<div style="display:flex;align-items:center;gap:9px;"><span style="font-size:22px;line-height:1;">🕯️</span><div style="flex:1;min-width:0;"><div style="font-size:15.5px;font-weight:800;">Bugün, '+yearsAgo+' yıl önce</div><div style="font-size:11.5px;color:var(--faint);margin-top:1px;">'+esc(dateLabelTR(best.date))+'</div></div><span style="font-size:16px;color:var(--faint);flex-shrink:0;">›</span></div>';
  var chips='';
  if(mo) chips+='<span style="font-size:12.5px;background:var(--field);border:1px solid var(--field-bd);border-radius:999px;padding:4px 10px;color:var(--text2);">'+mo.emoji+' '+esc(mo.short||mo.label)+'</span>';
  chips+='<span style="font-size:12.5px;background:var(--field);border:1px solid var(--field-bd);border-radius:999px;padding:4px 10px;color:var(--text2);">✅ '+cnt+'/'+tot+'</span>';
  h+='<div style="display:flex;flex-wrap:wrap;gap:7px;">'+chips+'</div>';
  if(r.intention&&String(r.intention).trim()) h+='<div style="font-size:13.5px;color:var(--text2);line-height:1.5;">🎯 '+esc(String(r.intention).trim())+'</div>';
  if(r.note&&String(r.note).trim()) h+='<div style="font-size:13.5px;color:var(--text2);line-height:1.5;background:rgba(255,232,163,0.22);border-radius:12px;padding:10px 12px;">'+esc(String(r.note).trim())+'</div>';
  var gts=Array.isArray(r.gratitude)?r.gratitude.filter(function(g){return String(g||'').trim();}):[];
  if(gts.length) h+='<div style="font-size:13px;color:var(--text2);line-height:1.6;">🙏 '+gts.map(function(g){return esc(String(g).trim());}).join(' · ')+'</div>';
  h+='<div style="font-size:11px;color:var(--faint);text-align:right;">O günü aç →</div>';
  h+='</div>';
  return h;
}
function bugunHTML(){
  var today=todayStr();
  var ed=editing();
  var viewDate=activeDate();
  var curRaw=dayIndexFor(viewDate);
  var curIdx=Math.max(1,curRaw);
  var streak=currentStreak();
  var rec=data.days[viewDate]||null;
  var completed=countRec(rec);
  var circ=2*Math.PI*42;
  var badge='Bugün nazlı başladı 🌧️';
  var ht=habitCountOn(viewDate);
  var strong=Math.ceil(ht*0.66), medium=Math.ceil(ht*0.34);
  if(completed>=ht) badge='Kraliçe günü 👑'; else if(completed>=strong) badge='Raydasın ☀️'; else if(completed>=medium) badge='Toparlanıyor 🌤️';
  var pct=Math.round(completed/ht*100);
  var off=circ*(1-completed/ht);
  var _hr=new Date().getHours();
  var _greet=(_hr>=5&&_hr<11)?'Günaydın':(_hr<18)?'İyi günler':(_hr<22)?'İyi akşamlar':'İyi geceler';

  var h='<div style="animation:seyFade .3s ease;display:flex;flex-direction:column;gap:14px;">';
  if(!ed){
    // Günışığı — gün doğumu temalı, hava durumu içeren dokunulabilir header
    h+=weatherHeaderHTML(_greet);
    h+=saveBanner(); h+=locationCardHTML();
  }
  // hero
  h+='<div class="glass" style="border-radius:26px;padding:18px;box-shadow:0 10px 28px rgba(108,74,58,0.08);display:flex;flex-direction:column;gap:16px;">';
  h+='<div style="display:flex;justify-content:space-between;align-items:flex-start;">';
  h+='<div><div style="font-size:13px;letter-spacing:1px;color:var(--faint);font-weight:700;">ŞEYMA 🦩</div><div style="font-size:14px;color:var(--muted);margin-top:3px;">'+(ed?esc(dateLabelTR(viewDate)):'Minik Denge Günlüğü')+'</div></div>';
  h+='<div style="display:flex;align-items:center;gap:8px;"><button onclick="App.toggleTheme()" aria-label="Tema" style="border:none;cursor:pointer;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;background:rgba(201,184,255,0.22);color:var(--choc);">'+(dark?'☀️':'🌙')+'</button>';
  h+='<div style="background:rgba(201,184,255,0.28);color:var(--choc);font-weight:700;font-size:13px;padding:7px 13px;border-radius:999px;white-space:nowrap;">Gün '+curIdx+(!ed&&streak>1?' · 🔥'+streak:'')+'</div></div></div>';
  h+='<div style="display:flex;align-items:center;gap:18px;">';
  h+='<div style="position:relative;width:96px;height:96px;flex-shrink:0;"><svg width="96" height="96" viewBox="0 0 96 96"><circle cx="48" cy="48" r="42" fill="none" stroke="rgba(150,110,120,0.18)" stroke-width="9"></circle><circle cx="48" cy="48" r="42" fill="none" stroke="#E9AFC1" stroke-width="9" stroke-linecap="round" stroke-dasharray="'+circ+'" stroke-dashoffset="'+off+'" transform="rotate(-90 48 48)" style="transition:stroke-dashoffset .6s ease"></circle></svg>';
  h+='<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;"><div style="font-size:25px;font-weight:800;line-height:1;">'+pct+'%</div><div style="font-size:11px;color:var(--faint);margin-top:2px;">'+(ed?'o gün':'bugün')+'</div></div></div>';
  h+='<div style="flex:1;min-width:0;"><div style="font-size:13px;color:var(--faint);margin-bottom:6px;">'+(ed?'O günün havası':'Bugünün havası')+'</div><div style="font-size:19px;font-weight:800;line-height:1.25;">'+esc(badge)+'</div></div></div></div>';

  // daily banner (distinct)
  h+='<div style="position:relative;overflow:hidden;background:linear-gradient(135deg,#FFE19A,#FFC9A3 55%,#F7B7C9);border-radius:24px;padding:22px 22px 20px;box-shadow:0 12px 28px rgba(255,180,140,0.32);">';
  h+='<div style="position:absolute;top:-26px;right:10px;font-size:130px;line-height:1;font-weight:800;color:#fff;opacity:0.22;">\u201d</div>';
  h+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:9px;position:relative;"><span style="font-size:16px;">☀️</span><span style="font-size:11.5px;letter-spacing:1.5px;font-weight:800;color:#9A5A3C;">GÜNÜN MESAJI</span></div>';
  h+='<div style="position:relative;font-size:19px;font-weight:800;line-height:1.36;color:#5A2E2A;">'+esc(DAILY[(curIdx-1)%DAILY.length])+'</div></div>';

  // günün niyeti — güne yön veren tek cümle (hem bugün hem geçmiş gün düzenlemesinde)
  h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:11px;background:linear-gradient(160deg,rgba(255,225,154,0.18),rgba(201,184,255,0.10));">';
  h+='<div style="display:flex;align-items:center;gap:9px;"><span style="font-size:22px;line-height:1;">🎯</span><div><div style="font-size:15.5px;font-weight:800;">'+(ed?'O günün niyeti':'Bugünün niyeti')+'</div><div style="font-size:11.5px;color:var(--faint);margin-top:1px;">Güne yön veren tek bir cümle ✨</div></div></div>';
  h+='<input type="text" value="'+esc(rec&&rec.intention?rec.intention:'')+'" oninput="App.onIntention(this)" placeholder="örn. Bugün kendime nazik olacağım 🌼" maxlength="140" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:12px;font-size:15px;outline:none;color:var(--text);">';
  h+='</div>';

  if(!ed){
  // SOS button
  h+='<button onclick="App.goSos()" style="border:none;cursor:pointer;width:100%;padding:17px;border-radius:20px;font-size:16.5px;font-weight:700;color:#fff;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#E9899F,#C9B8FF);box-shadow:0 12px 26px rgba(233,137,159,0.45);">Raşit, tatlı krizi geldi 🍫🚨</button>';
  h+='<button onclick="App.openReading()" style="position:relative;overflow:hidden;border:none;cursor:pointer;width:100%;padding:17px;border-radius:20px;font-size:16px;font-weight:800;color:#fff;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#6E55BF,#9B7FC9 52%,#E9AFC1);box-shadow:0 14px 30px rgba(110,85,191,0.42);"><span style="position:absolute;top:0;bottom:0;left:0;width:35%;background:linear-gradient(100deg,transparent,rgba(255,255,255,0.55),transparent);animation:seyShine 3.2s ease-in-out infinite;pointer-events:none;"></span><span style="position:relative;">Bugün ne okudum? 📖</span></button>';

  h+='<button onclick="App.openWatching()" style="position:relative;overflow:hidden;border:none;cursor:pointer;width:100%;padding:17px;border-radius:20px;font-size:16px;font-weight:800;color:#fff;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#C88F4C,#E0B080 52%,#E9AFC1);box-shadow:0 14px 30px rgba(200,143,76,0.4);"><span style="position:absolute;top:0;bottom:0;left:0;width:35%;background:linear-gradient(100deg,transparent,rgba(255,255,255,0.55),transparent);animation:seyShine 3.2s ease-in-out infinite;pointer-events:none;"></span><span style="position:relative;">Bugün ne izledim? 🎬</span></button>';

  h+='<button onclick="App.openListening()" style="position:relative;overflow:hidden;border:none;cursor:pointer;width:100%;padding:17px;border-radius:20px;font-size:16px;font-weight:800;color:#fff;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#0E9AA7,#2BC4C4 52%,#E9AFC1);box-shadow:0 14px 30px rgba(14,154,167,0.4);"><span style="position:absolute;top:0;bottom:0;left:0;width:35%;background:linear-gradient(100deg,transparent,rgba(255,255,255,0.55),transparent);animation:seyShine 3.2s ease-in-out infinite;pointer-events:none;"></span><span style="position:relative;">Bugün ne dinledim? 🎧</span></button>';

  // akşam nudge (yalnızca gece, okuma eklenmediyse)
  h+=eveningNudge(rec);
  }

  // habits
  h+='<div style="font-size:13px;font-weight:700;color:var(--faint);letter-spacing:0.4px;padding:4px 4px 0;">'+(ed?'O GÜNÜN TİKLERİ':'BUGÜNÜN TİKLERİ')+'</div>';
  HABITS.forEach(function(hb){
    var done=!!(rec&&rec.habits[hb.key]); var pulsing=ui.pulse===hb.key;
    var warn=(!done && (hb.key==='vitaminD'||hb.key==='water'||hb.key==='protein'||hb.key==='sleepReg'));
    var bg=done?(dark?'linear-gradient(135deg,rgba(233,175,193,0.25),rgba(201,184,255,0.22))':'linear-gradient(135deg,rgba(255,255,255,0.92),rgba(247,221,229,0.82))'):'var(--card)';
    var bd=done?'rgba(233,175,193,0.9)':(warn?'var(--warn)':'var(--card-bd)');
    var sh=done?'0 10px 26px rgba(233,175,193,0.4)':'0 6px 16px rgba(108,74,58,0.06)';
    h+='<button onclick="App.toggleHabit(\''+hb.key+'\')"'+(warn?' class="sey-habit-warn"':'')+' style="display:flex;align-items:center;gap:13px;padding:14px;width:100%;text-align:left;cursor:pointer;border-radius:20px;color:var(--text);border:1px solid '+bd+';background:'+bg+';box-shadow:'+sh+';transform:scale('+(pulsing?'1.03':'1')+');transition:transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .25s,background .25s,border-color .25s;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);">';
    h+='<div style="width:46px;height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;background:var(--icon);">'+hb.icon+'</div>';
    h+='<div style="flex:1;min-width:0;"><div style="font-size:15.5px;font-weight:700;line-height:1.25;">'+esc(hb.title)+'</div>';
    h+=done?'<div style="font-size:13px;color:var(--accent);font-weight:600;margin-top:4px;line-height:1.35;">'+esc(hb.msg)+'</div>':'<div style="font-size:13px;color:'+(warn?'var(--warn)':'var(--faint)')+';margin-top:3px;line-height:1.35;">'+esc(hb.sub)+'</div>';
    h+='</div>';
    h+='<div style="width:28px;height:28px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:#fff;background:'+(done?'linear-gradient(135deg,#E9AFC1,#C9B8FF)':'transparent')+';border:'+(done?'none':'2px solid '+(warn?'var(--warn)':'var(--field-bd)'))+';">'+(done?'✓':'')+'</div></button>';
  });

  // akşam adım hatırlatması (yalnızca akşam, bugünün adımı boşsa)
  if(!ed) h+=stepReminder(rec);

  // öğünler — detaylı (tabak/gr/adet) + protein özeti
  h+=nutritionSummaryCard(rec);
  h+=mealEditorCard(rec);

  // su
  h+=waterCard(rec);

  // mood
  var curMood=rec?rec.mood:null;
  h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;"><div style="font-size:15.5px;font-weight:700;">'+(ed?'O günün modu nasıldı? 🌤️':'Bugünün modu nasıl? 🌤️')+'</div><div style="display:flex;gap:6px;">';
  MOODS.forEach(function(m){
    var sel=curMood===m.id;
    var style=sel?'background:linear-gradient(135deg,#FFE8A3,#F7DDE5);border:1px solid #E9AFC1;box-shadow:0 8px 18px rgba(233,175,193,0.4);transform:translateY(-2px);color:#5A2E2A;':'background:var(--card);border:1px solid var(--card-bd);color:var(--text);';
    h+='<button onclick="App.setMood(\''+m.id+'\')" style="flex:1;min-width:0;padding:11px 4px;border-radius:16px;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;transition:all .2s;'+style+'"><span style="font-size:22px;">'+m.emoji+'</span><span style="font-size:11px;font-weight:600;text-align:center;line-height:1.1;">'+esc(m.short)+'</span></button>';
  });
  h+='</div>';
  if(curMood){ var mo=find(MOODS,'id',curMood); h+='<div style="font-size:14px;color:var(--text2);background:rgba(255,232,163,0.3);border-radius:14px;padding:10px 12px;line-height:1.4;">'+esc(mo.resp)+'</div>'; }
  h+=energyStressBlock(rec);
  h+='</div>';

  if(!ed){
  // Raşit chat bubble
  h+='<div style="display:flex;align-items:flex-end;gap:10px;margin:2px 0;">';
  h+='<div style="width:44px;height:44px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:23px;background:linear-gradient(135deg,#C9B8FF,#E9AFC1);box-shadow:0 6px 16px rgba(201,184,255,0.5);">🦩</div>';
  h+='<div style="position:relative;flex:1;min-width:0;background:linear-gradient(135deg,#EFE8FF,#F7E9F1);border:1px solid rgba(201,184,255,0.45);border-radius:20px 20px 20px 5px;padding:13px 16px;box-shadow:0 6px 16px rgba(201,184,255,0.22);"><div style="font-size:11px;font-weight:800;letter-spacing:0.6px;color:#7C5CC4;margin-bottom:5px;">RAŞİT 💌</div><div style="font-size:15px;line-height:1.5;color:#3F3142;">'+esc(NOTES[(curIdx-1)%NOTES.length])+'</div></div></div>';

  // Raşit aksiyonları (yaz + ara) — eşit iki buton
  h+='<div style="display:flex;gap:10px;">';
  h+='<a href="'+WA+'" target="_blank" rel="noopener" style="position:relative;overflow:hidden;text-decoration:none;flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;padding:15px 10px;border-radius:20px;background:linear-gradient(135deg,#7C5CC4,#E9899F);box-shadow:0 12px 26px rgba(150,100,170,0.4);color:#fff;">';
  h+='<div style="position:absolute;top:0;bottom:0;left:0;width:36%;background:linear-gradient(100deg,transparent,rgba(255,255,255,0.5),transparent);animation:seyShine 3.4s ease-in-out infinite;pointer-events:none;"></div>';
  h+='<div style="position:relative;font-size:24px;line-height:1;">💬</div><div style="position:relative;font-size:14.5px;font-weight:800;">Raşit\'e yaz</div><div style="position:relative;font-size:11px;opacity:0.9;">WhatsApp 💌</div></a>';
  h+='<a href="'+TEL+'" style="text-decoration:none;flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;padding:15px 10px;border-radius:20px;background:linear-gradient(135deg,#E8A53C,#E9899F);box-shadow:0 12px 26px rgba(220,150,120,0.4);color:#fff;">';
  h+='<div style="font-size:24px;line-height:1;">📞</div><div style="font-size:14.5px;font-weight:800;">Raşit\'i ara</div><div style="font-size:11px;opacity:0.9;">Hemen ara ☎️</div></a>';
  h+='</div>';
  } // /Raşit (geçmiş gün düzenlemesinde gizli)

  // note
  h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:10px;"><div style="font-size:15.5px;font-weight:700;">'+(ed?'O gün kendine notun…':'Bugün kendime notum…')+'</div>';
  h+='<textarea oninput="App.onNote(this)" placeholder="Bugün kendime notum…" rows="3" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:14px;padding:12px;font-size:15px;resize:none;outline:none;line-height:1.5;">'+esc(rec?rec.note:'')+'</textarea>';
  h+='<div style="font-size:12px;color:var(--faint);line-height:1.5;">örn. \u201cTatlı isteği akşam geldi.\u201d \u00b7 \u201cYürüyüş iyi hissettirdi.\u201d \u00b7 \u201cBugün biraz zorlandım ama devam.\u201d</div></div>';

  // şükran / 3 güzel şey
  var gratArr=(rec&&Array.isArray(rec.gratitude))?rec.gratitude:[];
  var gratPh=['örn. Sabah kahvem ☕','örn. Bir arkadaşın mesajı 💌','örn. Güneşli hava ☀️'];
  h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:11px;background:linear-gradient(160deg,rgba(246,193,119,0.12),rgba(233,175,193,0.08));">';
  h+='<div style="display:flex;align-items:center;gap:9px;"><span style="font-size:22px;line-height:1;">🙏</span><div><div style="font-size:15.5px;font-weight:800;">'+(ed?'O günün 3 güzel şeyi':'Bugünün 3 güzel şeyi')+'</div><div style="font-size:11.5px;color:var(--faint);margin-top:1px;">Küçük de olsa minnet duyduğun 3 şey ✨</div></div></div>';
  for(var gIdx=0;gIdx<3;gIdx++){ var gVal=(gratArr[gIdx]!=null)?gratArr[gIdx]:''; h+='<div style="display:flex;align-items:center;gap:9px;"><span style="width:24px;height:24px;flex-shrink:0;border-radius:50%;background:linear-gradient(135deg,#F6C177,#E9AFC1);color:#fff;font-size:12.5px;font-weight:800;display:flex;align-items:center;justify-content:center;">'+(gIdx+1)+'</span><input type="text" value="'+esc(gVal)+'" oninput="App.onGratitude('+gIdx+',this)" placeholder="'+gratPh[gIdx]+'" maxlength="160" style="flex:1;min-width:0;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:14.5px;outline:none;"></div>'; }
  h+='</div>';

  // dağıldı
  if(!ed) h+=onThisDayCard();
  if(!ed) h+='<button onclick="App.openEmergency()" style="border:1px dashed rgba(150,110,120,0.3);background:var(--card);cursor:pointer;width:100%;padding:14px;border-radius:18px;font-size:15px;font-weight:600;color:var(--muted);">Bugün biraz dağıldı 🫠</button>';
  h+='</div>';
  return h;
}

function sosHTML(){
  var h='<div style="animation:seyFade .3s ease;display:flex;flex-direction:column;gap:14px;">';
  h+='<div style="text-align:center;padding:6px 0 2px;"><div style="font-size:24px;font-weight:800;">10 Dakika Kuralı 🍫</div></div>';
  h+='<div class="glass" style="border-radius:22px;padding:18px;box-shadow:0 8px 22px rgba(108,74,58,0.07);"><p style="margin:0;font-size:15.5px;line-height:1.6;color:var(--text2);">Tamam Sevgili Günışığı, panik yok. Tatlı şu an seni çağırıyor olabilir ama karar merci sensin. Önce 10 dakika bekliyoruz. Sonra hâlâ istiyorsan daha kontrollü karar veriyoruz.</p></div>';
  h+='<div style="background:linear-gradient(135deg,rgba(201,184,255,0.35),rgba(247,221,229,0.5));border:1px solid var(--card-bd);border-radius:22px;padding:20px;display:flex;flex-direction:column;align-items:center;gap:12px;">';
  h+='<div id="sos-clock" style="font-size:52px;font-weight:800;font-variant-numeric:tabular-nums;letter-spacing:1px;color:var(--text);">'+pad(Math.floor(ui.sosLeft/60))+':'+pad(ui.sosLeft%60)+'</div>';
  h+='<button onclick="App.startSosTimer()" style="border:none;cursor:pointer;padding:13px 24px;border-radius:16px;font-size:15px;font-weight:700;color:#6B4A3A;background:#FFE8A3;box-shadow:0 6px 16px rgba(255,200,120,0.4);">'+(ui.sosTiming?'Sayaç çalışıyor…':'10 dakikayı başlat ⏱️')+'</button></div>';
  h+='<div style="font-size:13px;font-weight:700;color:var(--faint);letter-spacing:0.4px;padding:4px;">ŞU AN NE DENEDİN?</div><div style="display:flex;flex-direction:column;gap:8px;">';
  SOS_OPTS.forEach(function(o){
    var sel=ui.sosOpts.indexOf(o)>=0;
    var style=sel?'background:linear-gradient(135deg,rgba(255,232,163,0.6),rgba(247,221,229,0.7));border:1px solid #E9AFC1;box-shadow:0 6px 14px rgba(233,175,193,0.3);color:#5A2E2A;':'background:var(--card);border:1px solid var(--card-bd);color:var(--text);';
    h+='<button onclick="App.toggleSosOpt(\''+o.replace(/'/g,"\\'")+'\')" style="display:flex;align-items:center;gap:10px;width:100%;padding:14px 16px;border-radius:16px;cursor:pointer;transition:all .2s;'+style+'"><span style="flex:1;text-align:left;font-size:15px;font-weight:600;">'+esc(o)+'</span><span style="width:26px;height:26px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:#fff;background:'+(sel?'linear-gradient(135deg,#E9AFC1,#C9B8FF)':'transparent')+';border:'+(sel?'none':'2px solid var(--field-bd)')+';">'+(sel?'✓':'')+'</span></button>';
  });
  h+='</div>';
  h+='<div style="font-size:13px;font-weight:700;color:var(--faint);letter-spacing:0.4px;padding:4px;">BU İSTEĞİ NE TETİKLEDİ?</div>';
  h+='<div style="display:flex;flex-wrap:wrap;gap:8px;">';
  SOS_TRIGGERS.forEach(function(t){
    var sel=ui.sosTriggers.indexOf(t.id)>=0;
    var style=sel?'background:linear-gradient(135deg,rgba(201,184,255,0.55),rgba(247,221,229,0.6));border:1px solid #C9B8FF;color:#4A3A6A;box-shadow:0 4px 12px rgba(201,184,255,0.3);':'background:var(--card);border:1px solid var(--card-bd);color:var(--text2);';
    h+='<button onclick="App.toggleSosTrigger(\''+t.id+'\')" style="display:inline-flex;align-items:center;gap:6px;padding:9px 14px;border-radius:14px;cursor:pointer;font-size:14px;font-weight:600;transition:all .2s;'+style+'"><span>'+t.emoji+'</span>'+esc(t.label)+'</button>';
  });
  h+='<div style="font-size:11.5px;color:var(--faint);width:100%;line-height:1.5;margin-top:2px;">Tetikleyiciyi işaretlersen Rapor’da örüntünü çıkarırım — neyin gerçekten açlık, neyin alışkanlık olduğunu birlikte görürüz.</div>';
  h+='</div>';
  h+='<button onclick="App.completeSos()" style="border:none;cursor:pointer;width:100%;padding:17px;border-radius:20px;font-size:16.5px;font-weight:700;color:#fff;background:linear-gradient(135deg,#E9AFC1,#C9B8FF);box-shadow:0 12px 26px rgba(233,175,193,0.45);">Krizi yönettim ✨</button>';
  if(ui.sosDone){
    h+='<div style="background:linear-gradient(135deg,rgba(255,232,163,0.55),rgba(247,221,229,0.6));border:1px solid var(--card-bd);border-radius:22px;padding:18px;text-align:center;animation:seyPop .3s ease;"><div style="font-size:18px;font-weight:800;margin-bottom:6px;color:var(--text);">İşte bu. 👑</div><p style="margin:0;font-size:15px;line-height:1.55;color:var(--text2);">Tatlı seni değil, sen tatlıyı yönettin. Küçük zafer, büyük kontrol.</p><button onclick="App.resetSos()" style="margin-top:12px;border:none;background:var(--card);cursor:pointer;padding:10px 18px;border-radius:14px;font-size:14px;font-weight:600;color:var(--muted);">Yeni kriz / sıfırla</button></div>';
  }
  h+='</div>';
  return h;
}

function haritaHTML(){
  var today=todayStr();
  if(!ui.calMonth) ui.calMonth=today.slice(0,7);
  var ym=ui.calMonth.split('-'); var Y=+ym[0], M=+ym[1];
  var firstDow=(new Date(Y,M-1,1).getDay()+6)%7; // Pzt=0
  var daysInMonth=new Date(Y,M,0).getDate();
  var monthNames=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  var h='<div style="animation:seyFade .3s ease;display:flex;flex-direction:column;gap:14px;">';
  h+='<div style="padding:6px 4px 0;"><div style="font-size:23px;font-weight:800;">Takvim 🗺️</div><div style="font-size:13.5px;color:var(--faint);margin-top:3px;">Bir güne dokun; detayını gör ve o günü düzenle.</div></div>';
  h+='<div class="glass" style="border-radius:22px;padding:14px;display:flex;flex-direction:column;gap:12px;">';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;"><button onclick="App.calMove(-1)" style="border:none;cursor:pointer;width:36px;height:36px;border-radius:50%;background:var(--icon);color:var(--text);font-size:18px;">‹</button><div style="font-size:16px;font-weight:800;">'+monthNames[M-1]+' '+Y+'</div><button onclick="App.calMove(1)" style="border:none;cursor:pointer;width:36px;height:36px;border-radius:50%;background:var(--icon);color:var(--text);font-size:18px;">›</button></div>';
  h+='<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:5px;">';
  ['Pt','Sa','Ça','Pe','Cu','Ct','Pz'].forEach(function(d){ h+='<div style="text-align:center;font-size:11px;font-weight:700;color:var(--faint);">'+d+'</div>'; });
  for(var b=0;b<firstDow;b++){ h+='<div></div>'; }
  for(var dnum=1;dnum<=daysInMonth;dnum++){
    var date=Y+'-'+pad(M)+'-'+pad(dnum);
    var rec=data.days[date]||null; var cnt=countRec(rec); var htc=habitCountOn(date); var strongC=Math.ceil(htc*0.66);
    var future=diffDays(today,date)>0; var before=diffDays(data.startDate,date)<0; var isToday=date===today;
    var moodE=(rec&&rec.mood)?moodEmoji(rec.mood):'';
    var tint='var(--card)';
    if(cnt>=htc) tint=dark?'linear-gradient(135deg,rgba(255,232,163,0.25),rgba(247,221,229,0.22))':'linear-gradient(135deg,#FFE8A3,#F7DDE5)';
    else if(cnt>=strongC) tint=dark?'rgba(233,137,159,0.2)':'rgba(247,221,229,0.7)';
    else if(cnt>0) tint=dark?'rgba(201,184,255,0.12)':'rgba(247,221,229,0.32)';
    var clickable=!future;
    h+='<button '+(clickable?'onclick="App.openDate(\''+date+'\')"':'')+' style="position:relative;aspect-ratio:1;border-radius:12px;border:1px solid var(--card-bd);background:'+tint+';color:var(--text);cursor:'+(clickable?'pointer':'default')+';opacity:'+((future||before)?'0.4':'1')+';display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;'+(isToday?'box-shadow:0 0 0 2px #E9AFC1;':'')+'">';
    h+='<div style="font-size:12.5px;font-weight:700;line-height:1;">'+dnum+'</div>';
    h+='<div style="font-size:12px;height:14px;line-height:1;">'+(moodE||(cnt>0?'<span style="font-size:9.5px;color:var(--muted);font-weight:700;">'+cnt+'/'+htc+'</span>':''))+'</div>';
    h+='</button>';
  }
  h+='</div>';
  h+='<div style="display:flex;gap:13px;justify-content:center;font-size:11px;color:var(--faint);flex-wrap:wrap;padding-top:2px;"><span>🟡 tam gün</span><span>🌸 güçlü</span><span>○ bugün çerçeveli</span></div>';
  h+='</div>';
  // ay özeti
  var isCurMonth=(ui.calMonth===today.slice(0,7));
  var mrecs=[]; for(var mi=1;mi<=daysInMonth;mi++){ var mds=Y+'-'+pad(M)+'-'+pad(mi); if(data.days[mds]) mrecs.push({date:mds,rec:data.days[mds]}); }
  var recCount=mrecs.length;
  var tickSum=0,tickMax=0; mrecs.forEach(function(o){ tickSum+=countRec(o.rec); tickMax+=habitCountOn(o.date); });
  var avgPct=tickMax?Math.round(tickSum/tickMax*100):0;
  var bStreak=bestStreak(mrecs.slice().sort(function(a,b){return a.date<b.date?-1:1;}));
  var md=moodDist(mrecs);
  h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;">';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;"><div style="font-size:15.5px;font-weight:700;">'+monthNames[M-1]+' özeti</div>'+(isCurMonth?'':'<button onclick="App.calToday()" style="border:1px solid var(--field-bd);cursor:pointer;background:var(--card);color:var(--text2);font-weight:700;font-size:12px;padding:6px 12px;border-radius:999px;">Bugüne git ☀️</button>')+'</div>';
  if(recCount===0){ h+='<div style="font-size:13px;color:var(--faint);line-height:1.5;">Bu ayda henüz kayıt yok. Bir güne dokunup “Bu günü düzenle” ile geçmişe de ekleyebilirsin.</div>'; }
  else {
    h+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:9px;">';
    var cells=[['Kayıtlı gün',recCount+' / '+daysInMonth],['Ortalama tik',avgPct+'%'],['En iyi seri',bStreak+' gün']];
    cells.forEach(function(c){ h+='<div style="background:var(--icon);border:1px solid var(--card-bd);border-radius:14px;padding:11px 10px;text-align:center;"><div style="font-size:11px;color:var(--faint);line-height:1.3;">'+c[0]+'</div><div style="font-size:17px;font-weight:800;margin-top:3px;">'+c[1]+'</div></div>'; });
    h+='</div>';
    var moodKeys=Object.keys(md); if(moodKeys.length){ h+='<div style="display:flex;flex-wrap:wrap;gap:7px;align-items:center;"><span style="font-size:11.5px;color:var(--faint);">Mod dağılımı:</span>'; MOODS.forEach(function(m){ if(md[m.id]) h+='<span style="font-size:12.5px;background:var(--card);border:1px solid var(--card-bd);border-radius:999px;padding:4px 10px;">'+m.emoji+' '+md[m.id]+'</span>'; }); h+='</div>'; }
  }
  h+='<div style="font-size:11.5px;color:var(--faint);line-height:1.45;border-top:1px solid var(--card-bd);padding-top:10px;">💡 Geçmiş bir güne dokun → “Bu günü düzenle” ile o günün verilerini düzeltebilirsin. Konum, oturum ve canlı ölçümler her zaman bugüne yazılır.</div>';
  h+='</div>';
  h+='</div>';
  return h;
}

function lastNDays(n){ var out=[],t=todayStr(); for(var i=n-1;i>=0;i--){ var d=addDays(t,-i); out.push({date:d,rec:data.days[d]||null}); } return out; }
function habitRate(days,key){ var done=0; days.forEach(function(o){ if(o.rec&&o.rec.habits&&o.rec.habits[key]) done++; }); return days.length?Math.round(done/days.length*100):0; }
function moodDist(days){ var m={}; days.forEach(function(o){ if(o.rec&&o.rec.mood) m[o.rec.mood]=(m[o.rec.mood]||0)+1; }); return m; }
function monthlySummary(){ var map={}; for(var d in data.days){ var mo=d.slice(0,7); if(!map[mo]) map[mo]={ticks:0,days:0,list:[]}; map[mo].ticks+=countRec(data.days[d]); map[mo].days++; map[mo].list.push({date:d,rec:data.days[d]}); }
  return Object.keys(map).sort().reverse().map(function(k){ var m=map[k]; m.list.sort(function(a,b){return a.date<b.date?-1:1;}); return {month:k,avg:m.ticks/m.days,days:m.days,best:bestStreak(m.list)}; }); }
function trendBars(days,valFn,grad){ var max=1; days.forEach(function(o){ max=Math.max(max,valFn(o)); }); var h='<div style="display:flex;align-items:flex-end;gap:2px;height:52px;">'; days.forEach(function(o){ var v=valFn(o); var hh=v?Math.max(4,Math.round(v/max*52)):2; h+='<div style="flex:1;height:'+hh+'px;border-radius:3px;background:'+grad+';opacity:'+(v?1:0.22)+';"></div>'; }); h+='</div>'; return h; }
function nextMilestone(streak){ var ms=[7,21,30,50,100,200,365,500,1000]; for(var i=0;i<ms.length;i++){ if(streak<ms[i]) return {target:ms[i],pct:Math.round(streak/ms[i]*100)}; } return null; }

function moodScoreOf(rec){ var m={'cok-iyi':5,'iyi':4,'normal':3,'zorlandim':2,'cok-zorlandim':1}; return rec&&rec.mood&&m[rec.mood]?m[rec.mood]:null; }
function avgOf(a){ return a.length?a.reduce(function(x,y){return x+y;},0)/a.length:null; }
function weekSelfCard(){
  var days=lastNDays(7); var recorded=days.filter(function(o){return o.rec;});
  if(recorded.length<2) return '';
  var best=null; days.forEach(function(o){ if(o.rec){ var c=countRec(o.rec); if(!best||c>best.c) best={date:o.date,c:c,rec:o.rec}; } });
  var bestHabit=null,bestPct=-1; HABITS.forEach(function(hb){ var p=habitRate(days,hb.key); if(p>bestPct){bestPct=p;bestHabit=hb;} });
  var sleeps=[],waters=[],prots=[],medFree=0;
  recorded.forEach(function(o){ var r=o.rec; if(r.sleep&&r.sleep.hours!=null) sleeps.push(Number(r.sleep.hours)); if(typeof r.water==='number'&&r.water>0) waters.push(r.water); var pr=dayNutrition(r).protein; if(pr>0) prots.push(pr); if(r.sleep&&r.sleep.med&&r.sleep.med.type==='none') medFree++; });
  var sa=avgOf(sleeps),wa=avgOf(waters),pa=avgOf(prots);
  var moodLink=''; var gm=[],bm=[]; recorded.forEach(function(o){ var ms=moodScoreOf(o.rec),sh=(o.rec.sleep&&o.rec.sleep.hours!=null)?Number(o.rec.sleep.hours):null; if(ms==null||sh==null) return; (sh>=7?gm:bm).push(ms); });
  if(gm.length&&bm.length&&avgOf(gm)-avgOf(bm)>=0.4) moodLink='İyi uyuduğun günler modunu da yukarı çekmiş 🌙';
  var rows=[];
  if(best) rows.push(['🌟','En parlak günün', shortDate(best.date)+' · '+best.c+'/'+habitCountOn(best.date)+' tik']);
  if(bestHabit&&bestPct>0) rows.push([bestHabit.icon,'En güçlü alışkanlığın', esc(bestHabit.title)+' · %'+bestPct]);
  if(sa!=null) rows.push(['😴','Ortalama uyku', sa.toFixed(1)+' saat']);
  if(wa!=null) rows.push(['💧','Ortalama su', wa.toFixed(1)+' bardak']);
  if(pa!=null) rows.push(['🍳','Ortalama protein', Math.round(pa)+' g']);
  if(medFree>0) rows.push(['🌙','İlaçsız gece', medFree+' gece']);
  var h='<div style="background:linear-gradient(135deg,rgba(255,225,154,0.4),rgba(247,221,229,0.55));border:1px solid var(--card-bd);border-radius:22px;padding:18px;display:flex;flex-direction:column;gap:12px;">';
  h+='<div style="font-size:17px;font-weight:800;color:var(--text);">Bu hafta sen ✨</div>';
  h+='<div style="display:flex;flex-direction:column;gap:9px;">';
  rows.forEach(function(r){ h+='<div style="display:flex;align-items:center;gap:11px;"><span style="font-size:18px;width:24px;text-align:center;">'+r[0]+'</span><span style="flex:1;font-size:13.5px;color:var(--text2);">'+r[1]+'</span><span style="font-size:14px;font-weight:800;color:var(--text);text-align:right;">'+r[2]+'</span></div>'; });
  h+='</div>';
  if(moodLink) h+='<div style="font-size:13px;font-weight:600;color:var(--accent);background:var(--card);border-radius:14px;padding:11px 13px;">'+moodLink+'</div>';
  h+='</div>';
  return h;
}
function corrInsights(){
  var days=lastNDays(30).filter(function(o){return o.rec;});
  if(days.length<6) return [];
  var out=[];
  function gavg(a){return a.length?a.reduce(function(x,y){return x+y;},0)/a.length:null;}
  var gm=[],bm=[]; days.forEach(function(o){ var ms=moodScoreOf(o.rec),sh=(o.rec.sleep&&o.rec.sleep.hours!=null)?Number(o.rec.sleep.hours):null; if(ms==null||sh==null) return; if(sh>=7) gm.push(ms); else if(sh<6) bm.push(ms); });
  if(gm.length>=3&&bm.length>=3&&gavg(gm)-gavg(bm)>=0.4) out.push(['🌙','7+ saat uyuduğun günlerde modun belirgin daha iyi. Uyku senin gizli süper gücün.']);
  var ws=[],ns=[]; days.forEach(function(o){ var sos=Number(o.rec.cravingSOSCount||0); ((o.rec.habits&&o.rec.habits.walked20)?ws:ns).push(sos); });
  if(ws.length>=3&&ns.length>=3&&gavg(ns)-gavg(ws)>=0.3) out.push(['🚶‍♀️','Yürüdüğün günlerde tatlı krizi sayın daha düşük. Ayaklar çalışınca tatlı lobisi sus pus.']);
  var hp=[],lp=[]; days.forEach(function(o){ var pr=dayNutrition(o.rec).protein,sos=Number(o.rec.cravingSOSCount||0); if(pr>=PROTEIN_GOAL*0.8) hp.push(sos); else if(pr>0) lp.push(sos); });
  if(hp.length>=3&&lp.length>=3&&gavg(lp)-gavg(hp)>=0.3) out.push(['🍳','Proteini tutturduğun günlerde kriz daha az. Tokluk ekibi sahada.']);
  var he=[],le=[]; days.forEach(function(o){ var w=(typeof o.rec.water==='number')?o.rec.water:null,e=o.rec.energy; if(w==null||e==null) return; (w>=WATER_GOAL?he:le).push(Number(e)); });
  if(he.length>=3&&le.length>=3&&gavg(he)-gavg(le)>=0.3) out.push(['💧','Su hedefini tutturduğun günlerde enerjin daha yüksek. Beden susuz çalışmıyor.']);
  return out;
}
function badgesGrid(){
  var all=allDays(); var best=bestStreak(all); var medStreak=medFreeStreak();
  var waterGoal=0,proteinGoal=0,perfect=0,readingDays=0;
  all.forEach(function(o){ var r=o.rec; if(!r) return; if((r.water||0)>=WATER_GOAL) waterGoal++; if(dayNutrition(r).protein>=PROTEIN_GOAL) proteinGoal++; if(countRec(r)>=habitCountOn(o.date)) perfect++; if(r.reading&&Array.isArray(r.reading.entries)&&r.reading.entries.length>0) readingDays++; });
  var badges=[
    {e:'🔥',l:'7 gün seri',done:best>=7,sub:best>=7?'tamam':best+'/7'},
    {e:'🏆',l:'30 gün seri',done:best>=30,sub:best>=30?'tamam':best+'/30'},
    {e:'💯',l:'100 gün seri',done:best>=100,sub:best>=100?'tamam':best+'/100'},
    {e:'🌙',l:'7 gece ilaçsız',done:medStreak>=7,sub:medStreak>=7?'tamam':medStreak+'/7'},
    {e:'💧',l:'Su hedefi',done:waterGoal>=1,sub:waterGoal>0?waterGoal+' gün':'henüz yok'},
    {e:'🍳',l:'Protein hedefi',done:proteinGoal>=1,sub:proteinGoal>0?proteinGoal+' gün':'henüz yok'},
    {e:'📖',l:'Okuma tutkunu',done:readingDays>=7,sub:readingDays>=7?'tamam':readingDays+'/7'},
    {e:'👑',l:'7/7 mükemmel',done:perfect>=1,sub:perfect>0?perfect+' gün':'henüz yok'}
  ];
  var h='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;"><div style="font-size:15.5px;font-weight:700;">Rozetler 🏅</div>';
  h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;">';
  badges.forEach(function(b){ var on=b.done; h+='<div style="display:flex;align-items:center;gap:10px;border-radius:14px;padding:11px 12px;'+(on?'background:linear-gradient(135deg,rgba(255,232,163,0.55),rgba(247,221,229,0.6));border:1px solid #E9AFC1;':'background:var(--card);border:1px solid var(--card-bd);opacity:0.62;')+'"><span style="font-size:22px;'+(on?'':'filter:grayscale(1);')+'">'+b.e+'</span><div style="min-width:0;"><div style="font-size:12.5px;font-weight:700;color:var(--text);">'+esc(b.l)+'</div><div style="font-size:10.5px;color:var(--faint);">'+esc(b.sub)+'</div></div></div>'; });
  h+='</div></div>';
  return h;
}

function weeklyStepRecap(){
  var stepOf=function(o){ return effSteps(o&&o.rec).steps||0; };
  var t=todayStr();
  var last7=lastNDays(7);
  var prev7=[]; for(var i=13;i>=7;i--){ var d=addDays(t,-i); prev7.push({date:d,rec:data.days[d]||null}); }
  var cov=last7.filter(function(o){return stepOf(o)>0;});
  var head='<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:12px;font-weight:800;letter-spacing:.8px;color:#1a1404;background:linear-gradient(135deg,#E6C15A,#C99A3A);border-radius:999px;padding:3px 10px;">⬡ ÆON</span><span style="font-size:14.5px;font-weight:700;color:var(--text);">Haftalık adım özeti</span>';
  if(!cov.length){
    return '<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:10px;border:1px solid rgba(201,160,60,0.30);background:linear-gradient(135deg,rgba(230,193,90,0.10),rgba(155,127,201,0.07));">'
      +head+'</div>'
      +'<div style="font-size:13px;color:var(--text2);line-height:1.5;">Bu hafta henüz adım kaydın yok. Eklemen 5 saniye — ya da <b>🍎 Sağlık’tan çek</b> ile otomatik gelsin. Küçük bir veri, büyük resmi netleştirir. 👣</div></div>';
  }
  var avg=Math.round(cov.reduce(function(a,o){return a+stepOf(o);},0)/cov.length);
  var peak=last7.reduce(function(m,o){return Math.max(m,stepOf(o));},0);
  var prevCov=prev7.filter(function(o){return stepOf(o)>0;});
  var prevAvg=prevCov.length?Math.round(prevCov.reduce(function(a,o){return a+stepOf(o);},0)/prevCov.length):null;
  var msg;
  if(avg>=7000) msg='Harika tempo — sağlık kazancının kanıtla en güçlü olduğu aralıktasın. Böyle sürdür. 🌟';
  else if(avg>=4000) msg='Güzel gidiyor; bu aralıkta bile kazanç net. Küçük artışlar büyük fark yapar.';
  else msg='Başlangıç senin hızında — yarın 500 adım fazlası bile ilerlemedir. Kendine yüklenme. 🫶';
  var h='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:11px;border:1px solid rgba(201,160,60,0.30);background:linear-gradient(135deg,rgba(230,193,90,0.08),rgba(155,127,201,0.06));">';
  h+=head+'<span style="margin-left:auto;font-size:12px;color:var(--faint);font-weight:700;">'+cov.length+'/7 gün</span></div>';
  h+='<div style="display:flex;gap:14px;align-items:baseline;flex-wrap:wrap;"><div><span style="font-size:24px;font-weight:800;color:var(--text);font-variant-numeric:tabular-nums;">'+avg.toLocaleString('tr-TR')+'</span><span style="font-size:12px;color:var(--faint);"> ort. adım/gün</span></div>';
  if(peak>0) h+='<div style="font-size:12.5px;color:var(--muted);">Tepe <b style="color:var(--text2);">'+peak.toLocaleString('tr-TR')+'</b></div>';
  if(prevAvg!=null){ var d2=avg-prevAvg, pct=prevAvg?Math.round(d2/prevAvg*100):0; h+='<div style="font-size:12.5px;font-weight:700;margin-left:auto;color:'+(d2>=0?'#3F8A4F':'#B0764F')+';">'+(d2>=0?'▲ +':'▼ ')+Math.abs(pct)+'% <span style="color:var(--faint);font-weight:600;">geçen haftaya göre</span></div>'; }
  h+='</div>';
  h+=trendBars(last7,function(o){return stepOf(o);},'linear-gradient(180deg,#E6C15A,#E9899F)');
  h+='<div style="font-size:12.5px;color:var(--text2);line-height:1.5;">'+msg+'</div>';
  h+='</div>';
  return h;
}
function distanceRecapCard(){
  var t=todayStr();
  var last7=lastNDays(7);
  var prev7=[]; for(var i=13;i>=7;i--){ var d=addDays(t,-i); prev7.push({date:d,rec:data.days[d]||null}); }
  var sum=function(list,key){ return list.reduce(function(a,o){ return a+dayMovement(o.rec)[key]; },0); };
  var wTot=sum(last7,'total'), wWalk=sum(last7,'walk'), wVeh=sum(last7,'veh');
  var pTot=sum(prev7,'total');
  var todayM=dayMovement(data.days[t]||null);
  var last30=lastNDays(30); var mTot=sum(last30,'total');
  var any=mTot>0||wTot>0||todayM.total>0;
  var head='<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:15.5px;font-weight:700;color:var(--text);">Mesafe & Hareket 📍</span></div>';
  if(!any){
    return '<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:10px;">'+head
      +'<div style="font-size:13px;color:var(--text2);line-height:1.5;">Henüz kayıtlı hareket yok. Bugün ekranındaki <b>Konum & Hareket</b> kartından takibi açarsan, kat ettiğin mesafe burada günlük, haftalık ve zaman içinde birikir. 👣🚗</div></div>';
  }
  var h='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;">'+head;
  h+='<div style="display:flex;gap:10px;">';
  h+='<div style="flex:1;background:var(--icon);border-radius:14px;padding:11px;text-align:center;"><div style="font-size:11px;color:var(--muted);font-weight:700;">Bugün</div><div style="font-size:18px;font-weight:800;font-variant-numeric:tabular-nums;">'+fmtDist(todayM.total)+'</div></div>';
  h+='<div style="flex:1;background:var(--icon);border-radius:14px;padding:11px;text-align:center;"><div style="font-size:11px;color:var(--muted);font-weight:700;">Bu hafta</div><div style="font-size:18px;font-weight:800;font-variant-numeric:tabular-nums;">'+fmtDist(wTot)+'</div></div>';
  h+='<div style="flex:1;background:var(--icon);border-radius:14px;padding:11px;text-align:center;"><div style="font-size:11px;color:var(--muted);font-weight:700;">30 gün</div><div style="font-size:18px;font-weight:800;font-variant-numeric:tabular-nums;">'+fmtDist(mTot)+'</div></div>';
  h+='</div>';
  if(pTot>0){ var d2=wTot-pTot, pct=Math.round(d2/pTot*100); h+='<div style="font-size:12.5px;font-weight:700;color:'+(d2>=0?'#3F8A4F':'#B0764F')+';">'+(d2>=0?'▲ +':'▼ ')+Math.abs(pct)+'% <span style="color:var(--faint);font-weight:600;">geçen haftaya göre</span></div>'; }
  h+='<div style="font-size:12px;color:var(--muted);">Günlük mesafe (son 7 gün)</div>';
  h+=trendBars(last7,function(o){return dayMovement(o.rec).total;},'linear-gradient(180deg,#7DBE77,#9B7FC9)');
  h+='<div style="display:flex;gap:5px;">'; last7.forEach(function(o){ h+='<div style="flex:1;text-align:center;font-size:10px;color:var(--faint);">'+o.date.slice(8)+'</div>'; }); h+='</div>';
  h+='<div style="display:flex;gap:8px;font-size:12.5px;">';
  h+='<span style="flex:1;background:rgba(143,191,138,0.14);border-radius:10px;padding:8px 10px;color:var(--text2);">🚶 Yürüyüş <b style="float:right;">'+fmtDist(wWalk)+'</b></span>';
  h+='<span style="flex:1;background:rgba(201,184,255,0.16);border-radius:10px;padding:8px 10px;color:var(--text2);">🚗 Araç <b style="float:right;">'+fmtDist(wVeh)+'</b></span>';
  h+='</div>';
  h+='<div style="font-size:11px;color:var(--faint);line-height:1.4;">Ölçüm yalnızca uygulama açıkken birikir. Hareketler korunur, silinmez.</div>';
  h+='</div>';
  return h;
}
function moodHeatmapCard(){
  var mcol={'cok-iyi':'#FFD37A','iyi':'#F2B65A','normal':'#8FBF8A','zorlandim':'#9BB0D9','cok-zorlandim':'#B89BD9'};
  var today=todayStr();
  var startY=+String(data.startDate||today).slice(0,4);
  var nowY=new Date().getFullYear();
  var curY=+(ui.heatYear||nowY); if(curY<startY)curY=startY; if(curY>nowY)curY=nowY;
  var jan1=new Date(curY,0,1), dec31=new Date(curY,11,31);
  var startDow=(jan1.getDay()+6)%7; var start=new Date(jan1); start.setDate(start.getDate()-startDow);
  var CELL=13, GAP=3, STEP=CELL+GAP, DAYLABW=24;
  var monN=['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  var dayLab=['Pzt','','Çar','','Cum','',''];
  var weeks=[], cur=new Date(start);
  while(cur<=dec31){ var col=[]; for(var d=0; d<7; d++){ col.push(new Date(cur)); cur.setDate(cur.getDate()+1); } weeks.push(col); }
  var nW=weeks.length;
  var h='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;">';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">';
  h+='<div style="font-size:15.5px;font-weight:700;">Mod ısı haritası 🗓️</div>';
  var prevOk=curY>startY, nextOk=curY<nowY;
  h+='<div style="display:flex;align-items:center;gap:6px;">';
  h+='<button '+(prevOk?'onclick="App.heatYear(-1)"':'disabled')+' style="border:none;cursor:'+(prevOk?'pointer':'default')+';width:28px;height:28px;border-radius:50%;background:var(--card);color:var(--text);font-size:16px;opacity:'+(prevOk?'1':'0.3')+';">‹</button>';
  h+='<div style="font-size:14px;font-weight:800;min-width:46px;text-align:center;">'+curY+'</div>';
  h+='<button '+(nextOk?'onclick="App.heatYear(1)"':'disabled')+' style="border:none;cursor:'+(nextOk?'pointer':'default')+';width:28px;height:28px;border-radius:50%;background:var(--card);color:var(--text);font-size:16px;opacity:'+(nextOk?'1':'0.3')+';">›</button>';
  h+='</div></div>';
  h+='<div style="overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:4px;">';
  h+='<div style="display:inline-flex;flex-direction:column;gap:4px;">';
  h+='<div style="position:relative;height:12px;margin-left:'+(DAYLABW+GAP)+'px;width:'+(nW*STEP)+'px;">';
  for(var w=0; w<nW; w++){ for(var di=0; di<7; di++){ var dd=weeks[w][di]; if(dd.getFullYear()===curY && dd.getDate()===1){ h+='<span style="position:absolute;left:'+(w*STEP)+'px;top:0;font-size:9px;font-weight:700;color:var(--faint);white-space:nowrap;">'+monN[dd.getMonth()]+'</span>'; } } }
  h+='</div>';
  h+='<div style="display:flex;gap:'+GAP+'px;">';
  h+='<div style="display:flex;flex-direction:column;gap:'+GAP+'px;width:'+DAYLABW+'px;">';
  for(var r=0; r<7; r++){ h+='<div style="height:'+CELL+'px;line-height:'+CELL+'px;font-size:8.5px;color:var(--faint);text-align:right;">'+dayLab[r]+'</div>'; }
  h+='</div>';
  var recDays=0;
  for(var w2=0; w2<nW; w2++){
    h+='<div style="display:flex;flex-direction:column;gap:'+GAP+'px;">';
    for(var r2=0; r2<7; r2++){
      var dt=weeks[w2][r2]; var ds=dt.getFullYear()+'-'+pad(dt.getMonth()+1)+'-'+pad(dt.getDate());
      if(dt.getFullYear()!==curY){ h+='<div style="width:'+CELL+'px;height:'+CELL+'px;"></div>'; continue; }
      var future=diffDays(today,ds)>0; var rec=data.days[ds]||null; var bg, clk=false, tip=shortDate(ds)+'.'+curY;
      if(future){ bg='rgba(150,110,120,0.06)'; }
      else if(rec && rec.mood){ bg=mcol[rec.mood]||'#C9B8FF'; clk=true; recDays++; var mo=find(MOODS,'id',rec.mood); tip+=(mo?' · '+mo.emoji+' '+mo.short:''); }
      else if(rec){ bg=dark?'rgba(233,175,193,0.30)':'rgba(150,110,120,0.24)'; clk=true; recDays++; tip+=' · kayıt var'; }
      else { bg=dark?'rgba(255,255,255,0.05)':'rgba(150,110,120,0.10)'; clk=true; tip+=' · kayıt yok'; }
      var isT=ds===today;
      h+='<div '+(clk?'onclick="App.heatOpen(\''+ds+'\')" ':'')+'title="'+tip+'" style="width:'+CELL+'px;height:'+CELL+'px;border-radius:3px;background:'+bg+';cursor:'+(clk?'pointer':'default')+';'+(isT?'box-shadow:0 0 0 1.5px var(--accent);':'')+'"></div>';
    }
    h+='</div>';
  }
  h+='</div></div></div>';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">';
  h+='<div style="display:flex;align-items:center;gap:5px;font-size:10.5px;color:var(--faint);">zor';
  ['cok-zorlandim','zorlandim','normal','iyi','cok-iyi'].forEach(function(mid){ h+='<span style="width:11px;height:11px;border-radius:3px;background:'+mcol[mid]+';display:inline-block;"></span>'; });
  h+='iyi</div>';
  h+='<div style="font-size:11px;color:var(--faint);">'+recDays+' gün kayıtlı · dokun → düzenle</div>';
  h+='</div>';
  if(recDays===0) h+='<div style="font-size:12px;color:var(--faint);line-height:1.5;">'+curY+' için henüz mod kaydı yok. Bir kareye dokunup o günü açabilirsin.</div>';
  h+='</div>';
  return h;
}
function raporHTML(){
  var all=allDays(); var last30=lastNDays(30);
  var totalTicks=0; all.forEach(function(o){ totalTicks+=countRec(o.rec); });
  var cur=currentStreak(), best=bestStreak(all), tracked=daysTracked();
  var h='<div style="animation:seyFade .3s ease;display:flex;flex-direction:column;gap:14px;">';
  h+='<div style="padding:4px 4px 0;"><div style="font-size:23px;font-weight:800;">Rapor 📊</div></div>';
  var chips=[['🔥 Güncel seri',cur+' gün'],['🏆 En iyi seri',best+' gün'],['🗓️ Takip günü',tracked],['✅ Toplam tik',totalTicks]];
  h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;">';
  chips.forEach(function(c){ h+='<div class="glass" style="border-radius:16px;padding:13px;"><div style="font-size:11.5px;color:var(--faint);">'+c[0]+'</div><div style="font-size:21px;font-weight:800;margin-top:3px;">'+esc(c[1])+'</div></div>'; });
  h+='</div>';
  var msx=nextMilestone(cur); if(msx) h+='<div style="background:linear-gradient(135deg,#FFE19A,#F7C9B0);border-radius:16px;padding:12px 15px;font-size:13px;font-weight:700;color:#7A4A2E;">🎯 Sonraki kilometre taşı: '+msx.target+' gün · yolun %'+msx.pct+'</div>';
  h+=weekSelfCard();
  h+=distanceRecapCard();
  h+=weeklyStepRecap();
  var avg30=(last30.reduce(function(a,o){return a+countRec(o.rec);},0)/30).toFixed(1);
  h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:10px;"><div style="display:flex;justify-content:space-between;align-items:baseline;"><div style="font-size:15.5px;font-weight:700;">Son 30 gün — günlük tik</div><div style="font-size:12px;color:var(--faint);">ort. '+avg30+'/'+htToday()+'</div></div>';
  h+=trendBars(last30,function(o){return countRec(o.rec);},'linear-gradient(180deg,#E9899F,#C9B8FF)')+'</div>';
  h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:11px;"><div style="font-size:15.5px;font-weight:700;">Alışkanlık oranları (30 gün)</div>';
  HABITS.forEach(function(hb){ var pct=habitRate(last30,hb.key); h+='<div style="display:flex;flex-direction:column;gap:4px;"><div style="display:flex;justify-content:space-between;font-size:13px;"><span style="color:var(--text2);">'+hb.icon+' '+esc(hb.title)+'</span><span style="font-weight:700;color:var(--accent);">%'+pct+'</span></div><div style="height:7px;border-radius:999px;background:rgba(150,110,120,0.13);overflow:hidden;"><div style="height:100%;width:'+pct+'%;border-radius:999px;background:linear-gradient(90deg,#E9AFC1,#C9B8FF);"></div></div></div>'; });
  h+='</div>';
  var pAvg=avgOf(last30.filter(function(o){return o.rec;}).map(function(o){return dayNutrition(o.rec).protein;}).filter(function(v){return v>0;}));
  var wAvg=avgOf(last30.filter(function(o){return o.rec&&typeof o.rec.water==='number'&&o.rec.water>0;}).map(function(o){return o.rec.water;}));
  h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:14px;">';
  h+='<div style="display:flex;justify-content:space-between;align-items:baseline;"><div style="font-size:15.5px;font-weight:700;">🍳 Protein trendi (30 gün)</div><div style="font-size:12px;color:var(--faint);">ort. '+(pAvg!=null?Math.round(pAvg)+' g':'—')+'</div></div>';
  h+=trendBars(last30,function(o){return o.rec?dayNutrition(o.rec).protein:0;},'linear-gradient(180deg,#F2B65A,#E9899F)');
  h+='<div style="display:flex;justify-content:space-between;align-items:baseline;"><div style="font-size:15.5px;font-weight:700;">💧 Su trendi (30 gün)</div><div style="font-size:12px;color:var(--faint);">ort. '+(wAvg!=null?(Math.round(wAvg*10)/10)+' bardak':'—')+'</div></div>';
  h+=trendBars(last30,function(o){return o.rec&&typeof o.rec.water==='number'?o.rec.water:0;},'linear-gradient(180deg,#7FC9E9,#C9B8FF)');
  h+='</div>';
  var ins=corrInsights();
  if(ins.length){ h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:11px;"><div style="font-size:15.5px;font-weight:700;">Senin örüntülerin 🔎</div>';
    ins.forEach(function(c){ h+='<div style="display:flex;gap:11px;align-items:flex-start;background:var(--card);border-radius:14px;padding:12px 13px;"><span style="font-size:18px;">'+c[0]+'</span><span style="flex:1;font-size:13.5px;line-height:1.5;color:var(--text2);">'+esc(c[1])+'</span></div>'; });
    h+='<div style="font-size:11px;color:var(--faint);line-height:1.5;">Bunlar senin kayıtlarından çıkan eğilimler; tıbbi tavsiye değil, küçük ipuçları.</div></div>';
  }
  var md=moodDist(last30); var mtot=0; for(var mkk in md) mtot+=md[mkk];
  h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:10px;"><div style="font-size:15.5px;font-weight:700;">Mod dağılımı (30 gün)</div>';
  if(mtot){ var mcol={'cok-iyi':'#FFD37A','iyi':'#F2B65A','normal':'#8FBF8A','zorlandim':'#9BB0D9','cok-zorlandim':'#B89BD9'};
    h+='<div style="display:flex;height:14px;border-radius:999px;overflow:hidden;">'; MOODS.forEach(function(m){ var v=md[m.id]||0; if(v) h+='<div style="width:'+(v/mtot*100)+'%;background:'+(mcol[m.id]||'#C9B8FF')+';"></div>'; }); h+='</div>';
    h+='<div style="display:flex;flex-wrap:wrap;gap:10px;font-size:12px;color:var(--muted);">'; MOODS.forEach(function(m){ var v=md[m.id]||0; if(v) h+='<span>'+m.emoji+' '+esc(m.short)+' <b>'+v+'</b></span>'; }); h+='</div>';
  } else h+='<div style="font-size:13px;color:var(--faint);">Bu dönemde mod kaydı yok.</div>';
  h+='</div>';
  h+=moodHeatmapCard();
  h+=badgesGrid();
  var months=monthlySummary();
  if(months.length){ var moN=['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
    h+='<div style="padding:4px 4px 0;"><div style="font-size:17px;font-weight:800;">Aylık özet</div></div>';
    months.slice(0,12).forEach(function(m){ var p=m.month.split('-'); h+='<div class="glass" style="border-radius:16px;padding:13px 15px;display:flex;justify-content:space-between;align-items:center;"><div><div style="font-size:15px;font-weight:800;">'+moN[+p[1]-1]+' '+p[0]+'</div><div style="font-size:12px;color:var(--faint);">'+m.days+' gün kayıt</div></div><div style="text-align:right;"><div style="font-size:13px;color:var(--accent);font-weight:700;">ort. '+m.avg.toFixed(1)+'/'+htToday()+'</div><div style="font-size:12px;color:var(--muted);">en iyi seri '+m.best+'</div></div></div>'; });
  }
  h+='<div style="padding:8px 4px 0;"><div style="font-size:23px;font-weight:800;">Raşit\'ten Notlar 💌</div></div>';
  h+='<div style="background:linear-gradient(135deg,rgba(201,184,255,0.3),rgba(247,221,229,0.45));border:1px solid var(--card-bd);border-radius:22px;padding:20px;min-height:96px;display:flex;align-items:center;"><div style="font-size:16px;line-height:1.55;font-weight:600;color:var(--text);">'+esc(NOTES[ui.noteIndex%NOTES.length])+'</div></div>';
  h+='<button onclick="App.anotherNote()" style="border:none;cursor:pointer;align-self:center;padding:11px 20px;border-radius:14px;font-size:14px;font-weight:700;color:var(--choc);background:var(--card);box-shadow:0 4px 12px rgba(108,74,58,0.08);">Başka not göster ✨</button>';
  h+='<div style="padding:8px 4px 0;"><div style="font-size:23px;font-weight:800;">Minik Kurallar 🌿</div></div>';
  h+='<div class="glass" style="border-radius:22px;padding:18px;display:flex;flex-direction:column;gap:11px;">';
  [['🌿','Aç kalmak yok.'],['🍫','Tatlı hayatımızdan silinmiyor; sadece otomatik pilottan çıkıyor.'],['🌙','Akşam 7\'den sonra önce şunu sor: gerçekten aç mıyım?'],['🍳','Her öğüne protein eklemek krizleri sakinleştirir.'],['☀️','D vitamini de küçük ritmin bir parçası.'],['💪','Bir gün zor geçti diye sistem bitmez.'],['🚶‍♀️','Yürüyüş kısa da olsa sayılır.'],['🫶','Kendine kötü konuşmak yok.'],['☀️','Kontrol, kendine sert davranmak değildir.']].forEach(function(r){ h+='<div style="display:flex;gap:10px;font-size:14.5px;line-height:1.45;"><span>'+r[0]+'</span><span>'+esc(r[1])+'</span></div>'; });
  h+='</div>';
  h+='<button onclick="App.printReport()" style="border:none;cursor:pointer;width:100%;padding:16px;border-radius:18px;font-size:16px;font-weight:700;color:#fff;background:linear-gradient(135deg,#6B4A3A,#A07A52);box-shadow:0 10px 22px rgba(107,74,58,0.3);margin-top:4px;">Rapor Oluştur / PDF 📄</button>';
  h+='</div>';
  return h;
}

function ayarlarHTML(){
  var h='<div style="animation:seyFade .3s ease;display:flex;flex-direction:column;gap:14px;">';
  h+='<div style="padding:4px 4px 0;"><div style="font-size:23px;font-weight:800;">Ayarlar ⚙️</div></div>';
  h+='<div class="glass" style="border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:8px;"><div style="font-size:15px;font-weight:700;">Başlangıç tarihi</div><input type="date" value="'+esc(data.startDate)+'" onchange="App.startDateChange(this)" style="border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:12px;font-size:15px;outline:none;"></div>';
  // appearance
  h+='<div class="glass" style="border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:10px;"><div style="font-size:15px;font-weight:700;">Görünüm</div><div style="display:flex;gap:8px;">';
  var onS='background:linear-gradient(135deg,#FFE8A3,#E9AFC1);color:#5A2E2A;border:1px solid #E9AFC1;';
  var offS='background:transparent;color:var(--muted);border:1px solid var(--card-bd);';
  h+='<button onclick="App.setTheme(false)" style="flex:1;padding:11px;border-radius:13px;cursor:pointer;font-size:14px;font-weight:700;'+(dark?offS:onS)+'">☀️ Açık</button>';
  h+='<button onclick="App.setTheme(true)" style="flex:1;padding:11px;border-radius:13px;cursor:pointer;font-size:14px;font-weight:700;'+(dark?onS:offS)+'">🌙 Koyu</button></div></div>';
  // titreşim / haptik geri bildirimi
  var hapOn=!(data.settings&&data.settings.haptics===false);
  h+='<div class="glass" style="border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:10px;"><div style="font-size:15px;font-weight:700;">Titreşim geri bildirimi 📳</div><div style="font-size:12.5px;color:var(--text2);line-height:1.5;">Tik, mod ve SOS dokunuşlarında minik bir titreşim (destekleyen cihazlarda hissedilir).</div><div style="display:flex;gap:8px;">';
  h+='<button onclick="App.toggleHaptic(true)" style="flex:1;padding:11px;border-radius:13px;cursor:pointer;font-size:14px;font-weight:700;'+(hapOn?onS:offS)+'">📳 Açık</button>';
  h+='<button onclick="App.toggleHaptic(false)" style="flex:1;padding:11px;border-radius:13px;cursor:pointer;font-size:14px;font-weight:700;'+(hapOn?offS:onS)+'">🔕 Kapalı</button></div></div>';
  h+=settingsBtn('App.printReport()','Rapor oluştur / PDF','📄');
  h+=settingsBtn('App.exportJson()','Yedek indir','💾');
  h+=settingsBtn('App.importClick()','Yedek yükle','🔁');
  h+='<input type="file" id="sey-file" accept="application/json,.json" onchange="App.importJson(this)" style="display:none;">';
  h+='<div style="font-size:12.5px;color:var(--faint);line-height:1.5;padding:0 4px;">Yedek dosyanı saklarsan telefon/tarayıcı değişse bile kayıtlarını geri alabilirsin.</div>';
  // repoya otomatik kayıt — ortak durum
  var sg=data.settings||{};
  h+='<div style="padding:6px 4px 0;"><div style="font-size:16px;font-weight:800;">Repoya otomatik kayıt 💾</div></div>';
  h+='<div id="sey-sync-status" style="font-size:12.5px;color:var(--faint);min-height:16px;padding:0 4px;">'+esc(window.SeySync?window.SeySync.statusText():'')+'</div>';
  // Doğrudan GitHub bağlantısı
  var connected=syncConfigured();
  h+='<div class="glass" style="border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:9px;"><div style="font-size:15px;font-weight:700;display:flex;align-items:center;gap:8px;">Repoya bağlan '+(connected?'<span style="font-size:12px;font-weight:700;color:#3F8A4F;background:rgba(143,191,138,0.2);padding:2px 9px;border-radius:999px;">bağlı ✓</span>':'')+'</div>';
  h+='<div style="font-size:12.5px;line-height:1.5;color:var(--text2);">Günlük kayıtlar her günün tarihine yazılır; aynı gün içindeki değişiklikler o günün kaydını günceller. Tüm günler korunur ve izlenir.</div>';
  if(!connected || ui.keyEdit){
    h+='<input type="password" autocomplete="off" autocapitalize="off" spellcheck="false" value="'+esc(ui.keyEdit?'':(sg.ghToken||''))+'" oninput="App.setGhToken(this)" placeholder="github_pat_… (Contents: Read and write)" style="border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:13px;outline:none;">';
    h+='<div style="display:flex;gap:8px;">';
    h+='<button onclick="App.syncNow()" style="flex:1;border:none;cursor:pointer;padding:12px;border-radius:14px;font-size:14.5px;font-weight:700;color:#fff;background:linear-gradient(135deg,#E9AFC1,#C9B8FF);">Bağla ve kaydet ⬆️</button>';
    if(connected) h+='<button onclick="App.cancelKeyEdit()" style="flex:1;border:1px solid var(--field-bd);cursor:pointer;padding:12px;border-radius:14px;font-size:14px;font-weight:700;color:var(--text2);background:var(--card);">İptal</button>';
    h+='</div>';
  } else {
    h+='<div style="font-size:12.5px;color:#3F8A4F;background:rgba(143,191,138,0.12);border:1px solid rgba(143,191,138,0.35);padding:10px 12px;border-radius:12px;">Bağlantı doğrulandı. Kayıtlar otomatik devam ediyor.</div>';
    h+='<div style="display:flex;gap:8px;"><button onclick="App.syncNow()" style="flex:1;border:none;cursor:pointer;padding:12px;border-radius:14px;font-size:14.5px;font-weight:700;color:#fff;background:linear-gradient(135deg,#E9AFC1,#C9B8FF);">Şimdi kaydet ⬆️</button><button onclick="App.enableKeyEdit()" style="flex:1;border:1px solid var(--field-bd);cursor:pointer;padding:12px;border-radius:14px;font-size:14px;font-weight:700;color:var(--text2);background:var(--card);">Yeni anahtar gir</button></div>';
  }
  h+='</div>';
  // Luna · kişisel asistan (OpenAI anahtarı)
  var hasOaKey=!!(sg.openaiKey&&String(sg.openaiKey).trim());
  var oaBadge='';
  if(ui.openaiKeyState==='checking') oaBadge='<span style="font-size:12px;font-weight:700;color:#8A6A2A;background:rgba(220,180,90,0.2);padding:2px 9px;border-radius:999px;">doğrulanıyor…</span>';
  else if(ui.openaiKeyState==='invalid') oaBadge='<span style="font-size:12px;font-weight:700;color:#fff;background:#D9534F;padding:2px 9px;border-radius:999px;">API key hatalı ✕</span>';
  else if(ui.openaiKeyState==='valid') oaBadge='<span style="font-size:12px;font-weight:700;color:#fff;background:#3F8A4F;padding:2px 9px;border-radius:999px;">bağlı ✓</span>';
  else if(hasOaKey) oaBadge='<span style="font-size:12px;font-weight:700;color:#6A4FA0;background:rgba(155,127,201,0.18);padding:2px 9px;border-radius:999px;">bağlı ✓</span>';
  h+='<div class="glass" style="border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:9px;"><div style="font-size:15px;font-weight:700;display:flex;align-items:center;gap:8px;">Luna · kişisel asistan 🌙 '+oaBadge+'</div>';
  h+='<div style="font-size:12.5px;line-height:1.5;color:var(--text2);">Luna sorularını yanıtlayabilsin diye OpenAI API anahtarı gerekir. Anahtar <b>yalnızca bu cihazda</b> saklanır, repoya gönderilmez. Günde 5 soru hakkın olur — Luna olabildiğince detaylı yanıtlar. 💜</div>';
  h+='<input type="password" autocomplete="off" autocapitalize="off" spellcheck="false" value="'+esc(sg.openaiKey||'')+'" oninput="App.setOpenaiKey(this)" placeholder="sk-… (OpenAI API anahtarı)" style="border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:13px;outline:none;">';
  if(ui.openaiKeyState==='invalid') h+='<div style="font-size:12px;color:#C0605F;background:rgba(217,83,79,0.1);border:1px solid rgba(217,83,79,0.3);border-radius:12px;padding:9px 11px;">Anahtar geçersiz görünüyor. platform.openai.com’dan doğru anahtarı yapıştırıp tekrar kaydet.</div>';
  h+='<button onclick="App.saveOpenaiKey()" style="border:none;cursor:pointer;width:100%;padding:12px;border-radius:14px;font-size:14.5px;font-weight:800;color:#fff;background:linear-gradient(135deg,#9B7FC9,#E9AFC1);box-shadow:0 8px 18px rgba(155,127,201,0.35);">Kaydet ve doğrula ✓</button>';
  h+='<div style="font-size:11.5px;color:var(--faint);">platform.openai.com → API keys bölümünden alınır.</div>';
  h+='</div>';
  h+='<button onclick="App.askReset()" style="border:1px solid rgba(220,120,120,0.25);cursor:pointer;width:100%;padding:16px;border-radius:18px;font-size:15.5px;font-weight:700;color:#C0605F;background:rgba(220,120,120,0.08);text-align:left;display:flex;justify-content:space-between;align-items:center;"><span>Verileri sıfırla</span><span>🗑️</span></button>';
  h+=settingsBtn('App.goStart()','Başlangıç ekranına dön','🔄');
  // add to home guide
  h+='<div style="background:linear-gradient(135deg,rgba(255,232,163,0.4),rgba(247,221,229,0.45));border:1px solid var(--card-bd);border-radius:20px;padding:18px;"><div style="font-size:15.5px;font-weight:800;margin-bottom:10px;">Ana ekrana ekleme rehberi 📲</div><div style="font-size:14px;line-height:1.7;color:var(--text2);">iPhone\'da tek dokunuşla açmak için:<br>1. Bu sayfayı <b>Safari</b>\'de aç<br>2. Paylaş butonuna bas<br>3. <b>Ana Ekrana Ekle</b> seç<br>4. Adı: <b>Şeyma 🦩</b><br>5. Ekle</div></div>';
  h+='<div class="glass" style="border-radius:20px;padding:16px;"><div style="font-size:14.5px;font-weight:700;margin-bottom:6px;">🔒 Gizlilik</div><div style="font-size:13.5px;line-height:1.55;color:var(--muted);">Bu app giriş istemez. Kayıtlar bu cihazdaki tarayıcıda saklanır. Daha garanti olsun diye ara ara yedek indir.</div></div>';
  h+='</div>';
  return h;
}
function settingsBtn(onclick,label,icon){
  return '<button onclick="'+onclick+'" style="border:1px solid var(--field-bd);cursor:pointer;width:100%;padding:16px;border-radius:18px;font-size:15.5px;font-weight:700;color:var(--text);background:var(--card);text-align:left;display:flex;justify-content:space-between;align-items:center;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);"><span>'+esc(label)+'</span><span>'+icon+'</span></button>';
}

// ================= SAĞLIK & DÖNGÜ =================
function num(v){ return (v===null||v===undefined||v==='')?null:Number(v); }
function ringSeg(cx,cy,R,C,color,startFrac,lenFrac,w){ if(lenFrac<=0) return ''; return '<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="none" stroke="'+color+'" stroke-width="'+w+'" stroke-dasharray="'+(lenFrac*C).toFixed(2)+' '+(C-lenFrac*C).toFixed(2)+'" stroke-dashoffset="'+(-startFrac*C).toFixed(2)+'" transform="rotate(-90 '+cx+' '+cy+')"></circle>'; }

function activityRings(rec){
  var es=effSteps(rec);
  var steps=es.steps;
  var mins=rec&&rec.walk?num(rec.walk.minutes):null;
  var sleep=rec&&rec.sleep?num(rec.sleep.hours):null;
  var mealCount=0; if(rec&&rec.meals){ ['breakfast','lunch','dinner','snack'].forEach(function(k){ if(rec.meals[k]&&String(rec.meals[k]).trim()) mealCount++; }); }
  var rings=[{label:'Adım',val:steps,goal:8000,color:'#E9899F',unit:''},{label:'Hareket',val:mins,goal:30,color:'#8FBF8A',unit:' dk'},{label:'Uyku',val:sleep,goal:7.5,color:'#9B7FC9',unit:' sa'}];
  var size=120,cx=60,cy=60,radii=[50,38,26],w=10;
  var svg='<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'">';
  rings.forEach(function(r,i){ var R=radii[i],C=2*Math.PI*R,f=Math.max(0,Math.min(1,(r.val||0)/r.goal));
    svg+='<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="none" stroke="rgba(150,110,120,0.14)" stroke-width="'+w+'"></circle>';
    svg+='<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="none" stroke="'+r.color+'" stroke-width="'+w+'" stroke-linecap="round" stroke-dasharray="'+C.toFixed(2)+'" stroke-dashoffset="'+(C*(1-f)).toFixed(2)+'" transform="rotate(-90 '+cx+' '+cy+')" style="transition:stroke-dashoffset .6s ease"></circle>';
  });
  svg+='</svg>';
  var legend='<div style="flex:1;display:flex;flex-direction:column;gap:8px;">';
  rings.forEach(function(r){ legend+='<div style="display:flex;align-items:center;gap:8px;font-size:13px;"><span style="width:10px;height:10px;border-radius:50%;background:'+r.color+';display:inline-block;flex-shrink:0;"></span><span style="color:var(--muted);">'+r.label+'</span><b style="margin-left:auto;color:var(--text);font-variant-numeric:tabular-nums;">'+(r.val!=null?r.val+r.unit:'—')+'</b></div>'; });
  legend+='<div style="font-size:11px;color:var(--faint);margin-top:2px;">'+mealCount+'/4 öğün · '+dayNutrition(rec).protein+'g protein</div>';
  if(es.source==='tracked'){ var dm=dayMovement(rec); legend+='<div style="font-size:10.5px;color:var(--faint);line-height:1.4;">👣 Adım, konum takibinden tahmini ('+fmtDist(dm.walk)+' yürüyüş). Elle girersen o geçerli olur.</div>'; }
  legend+='</div>';
  return '<div class="glass" style="border-radius:22px;padding:16px;display:flex;align-items:center;gap:16px;"><div style="flex-shrink:0;">'+svg+'</div>'+legend+'</div>';
}

function sparkCard(){
  var today=todayStr(); var arr=[]; for(var i=6;i>=0;i--){ var dd=addDays(today,-i); var rec=data.days[dd]; arr.push({d:dd,steps:effSteps(rec).steps,sleep:rec&&rec.sleep?num(rec.sleep.hours):null}); }
  var maxS=Math.max.apply(null,[8000].concat(arr.map(function(a){return a.steps||0;})));
  var maxSl=Math.max.apply(null,[8].concat(arr.map(function(a){return a.sleep||0;})));
  var h='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;"><div style="font-size:15.5px;font-weight:700;">Son 7 gün 📈</div>';
  h+='<div><div style="font-size:12px;color:var(--muted);margin-bottom:6px;">Adım</div><div style="display:flex;align-items:flex-end;gap:5px;height:46px;">';
  arr.forEach(function(a){ var hh=a.steps?Math.max(6,Math.round(a.steps/maxS*46)):3; h+='<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;height:46px;"><div style="height:'+hh+'px;border-radius:5px;background:linear-gradient(180deg,#E9899F,#C9B8FF);opacity:'+(a.steps?1:0.3)+';"></div></div>'; });
  h+='</div></div>';
  h+='<div><div style="font-size:12px;color:var(--muted);margin-bottom:6px;">Uyku (saat)</div><div style="display:flex;align-items:flex-end;gap:5px;height:46px;">';
  arr.forEach(function(a){ var hh=a.sleep?Math.max(6,Math.round(a.sleep/maxSl*46)):3; h+='<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;height:46px;"><div style="height:'+hh+'px;border-radius:5px;background:linear-gradient(180deg,#9B7FC9,#B8A0E0);opacity:'+(a.sleep?1:0.3)+';"></div></div>'; });
  h+='</div></div>';
  h+='<div style="display:flex;gap:5px;">'; arr.forEach(function(a){ h+='<div style="flex:1;text-align:center;font-size:10px;color:var(--faint);">'+a.d.slice(8)+'</div>'; }); h+='</div>';
  h+='</div>';
  return h;
}

function sleepReadiness(rec){
  var sl=rec&&rec.sleep?rec.sleep:{};
  var rd=readingStats(rec);
  // 1) Uyku süresi (yetişkin hedefi ~7.5-8.5 sa) — maks 34
  var hours=num(sl.hours), fDur=0;
  if(hours!=null){ fDur=Math.round(34*Math.max(0,Math.min(1,1-Math.abs(hours-7.75)/3))); }
  // 2) Öznel kalite — maks 22
  var fQual=sl.quality==='good'?22:(sl.quality==='ok'?12:(sl.quality==='bad'?4:0));
  // 3) İlaç/takviye — maks 10 (ilaçsız uykuya hazırlık göstergesi)
  var medType=(sl.med&&sl.med.type)?sl.med.type:null;
  var fMed=medType==='none'?10:(medType==='herbal'?6:(medType==='rx'?3:5));
  // 4) Okuma (uyku öncesi okuma alışkanlığı, ekran yerine sayfa) — maks 34
  var fReading=rd.count>0?Math.min(34,16+Math.min(18,rd.pages)):0;
  var factors={duration:fDur,quality:fQual,medication:fMed,reading:fReading};
  var score=fDur+fQual+fMed+fReading;
  score=Math.max(0,Math.min(100,score));
  var tier='Rahat';
  if(score>=85) tier='Mükemmel';
  else if(score>=70) tier='Güçlü';
  else if(score>=55) tier='Dengeli';
  return {score:score,tier:tier,readingCount:rd.count,readingPages:rd.pages,factors:factors,medType:medType};
}

function medFreeBadge(){
  var s=medFreeStreak();
  if(s<1) return '';
  return '<div style="display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,rgba(143,191,138,0.22),rgba(155,127,201,0.16));border:1px solid rgba(143,191,138,0.4);border-radius:14px;padding:11px 13px;"><span style="font-size:22px;">🌙</span><div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:800;color:var(--text);">'+s+' gecedir ilaçsız</div><div style="font-size:11.5px;color:var(--muted);line-height:1.35;">'+(s>=7?'Bir haftayı geçtin — beden kendi sistemini öğreniyor.':'Hedef: uyku ilacına ihtiyacı azaltmak. Düzenli uyku hijyeni bunu büyütür.')+'</div></div></div>';
}
function caffeineBlock(rec){
  var caf=(rec&&rec.caffeine&&typeof rec.caffeine==='object')?rec.caffeine:{last:null,cups:null};
  var late=!!(caf.last&&caf.last>='15:00');
  var h='<div style="border-top:1px solid var(--card-bd);padding-top:11px;display:flex;flex-direction:column;gap:9px;">';
  h+='<div style="font-size:12.5px;font-weight:700;color:var(--muted);">Kafein (kahve/çay) — uykuyu etkiler ☕</div>';
  h+='<div style="display:flex;gap:14px;align-items:flex-end;flex-wrap:wrap;">';
  h+='<div style="display:flex;flex-direction:column;gap:3px;"><span style="font-size:11px;color:var(--faint);">Son kafein saati</span><input type="time" value="'+esc(caf.last||'')+'" onchange="App.setCaffeineTime(this)" style="border:1px solid var(--field-bd);background:var(--field);border-radius:11px;padding:8px 10px;font-size:14px;outline:none;color:var(--text);"></div>';
  h+='<div style="display:flex;flex-direction:column;gap:3px;"><span style="font-size:11px;color:var(--faint);">Bugün kaç fincan</span><div style="display:flex;align-items:center;gap:7px;"><button onclick="App.caffeineCups(-1)" style="border:1px solid var(--field-bd);cursor:pointer;width:32px;height:32px;border-radius:9px;font-size:16px;font-weight:800;color:var(--muted);background:var(--card);">−</button><span style="font-size:17px;font-weight:800;min-width:18px;text-align:center;">'+(caf.cups||0)+'</span><button onclick="App.caffeineCups(1)" style="border:1px solid var(--field-bd);cursor:pointer;width:32px;height:32px;border-radius:9px;font-size:16px;font-weight:800;color:var(--muted);background:var(--card);">+</button></div></div>';
  h+='</div>';
  if(late) h+='<div style="font-size:11.5px;color:#9A6A2A;background:rgba(255,210,130,0.18);border:1px solid rgba(220,170,80,0.35);border-radius:11px;padding:8px 11px;line-height:1.4;">Kafein 15:00 sonrası uykuya geçişi zorlaştırabilir. Yarın biraz erkene çekmeyi denemeye değer 🌙</div>';
  h+='</div>';
  return h;
}

function discomfortCard(rec){
  var dz=(rec&&rec.discomfort&&typeof rec.discomfort==='object')?rec.discomfort:{regions:{},note:'',meds:[]};
  var regions=dz.regions||{};
  var meds=Array.isArray(dz.meds)?dz.meds:[];
  var view=ui.bodyView||'front';
  var active=BODY_REGIONS.filter(function(r){return r.view===view;});
  var selList=Object.keys(regions).filter(function(k){return regions[k]&&regions[k].level>0;});
  var h='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:13px;">';
  h+='<div style="display:flex;align-items:center;gap:8px;"><div style="font-size:15.5px;font-weight:700;">Fiziksel Rahatsızlık 🩹</div>';
  h+='<div style="margin-left:auto;display:flex;gap:4px;background:var(--card);border:1px solid var(--card-bd);border-radius:999px;padding:3px;">';
  ['front','back'].forEach(function(v){ var on=view===v; h+='<button onclick="App.setBodyView(\''+v+'\')" style="border:none;cursor:pointer;border-radius:999px;padding:5px 13px;font-size:12px;font-weight:700;'+(on?'background:linear-gradient(135deg,#E9AFC1,#C9B8FF);color:#fff;':'background:transparent;color:var(--muted);')+'">'+(v==='front'?'Ön':'Arka')+'</button>'; });
  h+='</div></div>';
  h+='<div style="font-size:12px;color:var(--faint);line-height:1.4;">Bölgeye dokun, şiddeti ayarla: <b style="color:#F4C152;">1 hafif</b> · <b style="color:#F0892F;">2 orta</b> · <b style="color:#E25B6A;">3 şiddetli</b>. Tekrar dokununca artar, dolunca sıfırlanır.</div>';
  h+='<div style="display:flex;justify-content:center;"><svg viewBox="0 0 200 470" width="180" height="423" style="max-width:100%;height:auto;">';
  h+=DZ_SILHOUETTE;
  active.forEach(function(r){
    var lv=(regions[r.id]&&regions[r.id].level)||0; var col=dzColor(lv);
    var fill=col||'rgba(155,127,201,0.16)';
    var op=col?'1':'0.5';
    var cls='dz-region'+(lv>0?' dz-on':'');
    var common='class="'+cls+'" onclick="App.cycleDiscomfort(\''+r.id+'\')" fill="'+fill+'" stroke="'+(col||'rgba(120,100,150,0.5)')+'" stroke-width="'+(lv>0?'1.6':'1')+'" opacity="'+op+'"';
    if(r.s==='ellipse') h+='<ellipse cx="'+r.cx+'" cy="'+r.cy+'" rx="'+r.rx+'" ry="'+r.ry+'" '+common+'></ellipse>';
    else h+='<rect x="'+r.x+'" y="'+r.y+'" width="'+r.w+'" height="'+r.h+'" rx="'+r.r+'" '+common+'></rect>';
    if(lv>0){ var lx=(r.s==='ellipse')?r.cx:(r.x+r.w/2), ly=(r.s==='ellipse')?r.cy:(r.y+r.h/2); h+='<text x="'+lx+'" y="'+(ly+4.5)+'" text-anchor="middle" font-size="13" font-weight="800" fill="#fff" style="pointer-events:none;">'+lv+'</text>'; }
  });
  h+='</svg></div>';
  if(selList.length){
    h+='<div style="display:flex;flex-wrap:wrap;gap:6px;">';
    selList.forEach(function(k){ var rc=findRegion(k); var lv=regions[k].level; var col=dzColor(lv); h+='<button onclick="App.cycleDiscomfort(\''+k+'\')" style="display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:999px;font-size:12px;font-weight:700;cursor:pointer;background:'+col+'22;border:1px solid '+col+';color:var(--text);"><span style="width:9px;height:9px;border-radius:50%;background:'+col+';"></span>'+esc(rc?rc.label:k)+' · '+esc(DLEVELS[lv-1].label)+'</button>'; });
    h+='</div>';
  } else {
    h+='<div style="font-size:12.5px;color:var(--faint);">Bugün için işaretli bölge yok. Bir şikâyetin varsa bedenden seç.</div>';
  }
  h+='<div style="display:flex;flex-direction:column;gap:6px;"><div style="font-size:12.5px;font-weight:700;color:var(--muted);">Başka bir rahatsızlık / not</div>';
  h+='<textarea oninput="App.setDiscomfortNote(this)" placeholder="Örn. sabah migren, sağ bilekte zonklama, mide ekşimesi..." rows="2" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:10px 12px;font-size:14px;outline:none;resize:vertical;font-family:inherit;color:var(--text);">'+(dz.note?esc(dz.note):'')+'</textarea></div>';
  h+='<div style="border-top:1px solid var(--card-bd);padding-top:11px;display:flex;flex-direction:column;gap:9px;">';
  h+='<div style="display:flex;align-items:center;gap:8px;"><div style="font-size:13px;font-weight:700;color:var(--muted);">💊 Kullandığın ilaç</div><button onclick="App.addDiscomfortMed()" style="margin-left:auto;border:1px solid var(--field-bd);cursor:pointer;background:var(--card);color:var(--text2);font-weight:700;font-size:12px;padding:5px 12px;border-radius:999px;">+ Ekle</button></div>';
  h+='<div style="display:flex;flex-wrap:wrap;gap:6px;">'; DMEDS.forEach(function(m,i){ h+='<button onclick="App.quickDiscomfortMed('+i+')" style="border:1px solid var(--field-bd);cursor:pointer;background:var(--card);color:var(--text2);font-weight:600;font-size:11.5px;padding:5px 10px;border-radius:999px;">+ '+esc(m.split(' (')[0])+'</button>'; }); h+='</div>';
  h+='<datalist id="dz-med-list">'; DMEDS.forEach(function(m){ h+='<option value="'+esc(m)+'"></option>'; }); h+='</datalist>';
  meds.forEach(function(m,idx){
    h+='<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;background:var(--card);border:1px solid var(--card-bd);border-radius:12px;padding:8px;">';
    h+='<input list="dz-med-list" value="'+(m.name?esc(m.name):'')+'" oninput="App.setDiscomfortMed('+idx+',\'name\',this)" placeholder="İlaç adı" style="flex:2;min-width:120px;border:1px solid var(--field-bd);background:var(--field);border-radius:9px;padding:8px;font-size:13px;outline:none;color:var(--text);">';
    h+='<input value="'+(m.dose?esc(m.dose):'')+'" oninput="App.setDiscomfortMed('+idx+',\'dose\',this)" placeholder="Doz (400 mg)" style="flex:1;min-width:78px;border:1px solid var(--field-bd);background:var(--field);border-radius:9px;padding:8px;font-size:13px;outline:none;color:var(--text);">';
    h+='<input type="time" value="'+(m.time?esc(m.time):'')+'" onchange="App.setDiscomfortMed('+idx+',\'time\',this)" style="border:1px solid var(--field-bd);background:var(--field);border-radius:9px;padding:7px;font-size:13px;outline:none;color:var(--text);">';
    h+='<button onclick="App.removeDiscomfortMed('+idx+')" aria-label="Sil" style="border:none;cursor:pointer;background:rgba(220,120,120,0.1);color:#C0605F;width:32px;height:32px;border-radius:9px;font-size:13px;">🗑️</button>';
    h+='</div>';
  });
  h+='<div style="font-size:11px;color:var(--faint);line-height:1.4;">Bu bilgi yalnızca kendi takibin için. Ağrı kesiciyi sık (ayda 10-15+ gün) kullanıyorsan, ilaç aşırı kullanımı baş ağrısını tetikleyebilir — hekimine danış.</div>';
  h+='</div>';
  h+='</div>';
  return h;
}

function saglikHTML(){
  var ed=editing(); var viewDate=activeDate();
  var today=todayStr(); var rec=data.days[viewDate]||null;
  var sl=rec&&rec.sleep?rec.sleep:{}; var wk=rec&&rec.walk?rec.walk:{};
  var readiness=sleepReadiness(rec);
  var h='<div style="animation:seyFade .3s ease;display:flex;flex-direction:column;gap:14px;">';
  h+='<div style="padding:6px 4px 0;"><div style="font-size:23px;font-weight:800;">Sağlık 🌸</div><div style="font-size:13.5px;color:var(--faint);margin-top:3px;">'+(ed?esc(dateLabelTR(viewDate))+' — geçmiş gün düzenleniyor':'Uyku, yürüyüş ve döngü — küçük veriler, büyük resim.')+'</div></div>';
  if(!ed) h+=activityRings(rec);
  // uyku
  h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;"><div style="font-size:15.5px;font-weight:700;">Uyku 😴</div>';
  h+='<div style="display:flex;align-items:center;gap:10px;"><input type="number" inputmode="decimal" step="0.5" min="0" max="24" value="'+(sl.hours!=null?esc(sl.hours):'')+'" oninput="App.setSleepHours(this)" placeholder="7.5" style="width:92px;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:16px;outline:none;text-align:center;"><span style="font-size:14px;color:var(--muted);">saat uyudum</span></div>';
  h+='<div style="display:flex;gap:8px;">';
  SLEEP_Q.forEach(function(q){ var sel=sl.quality===q.id; h+='<button onclick="App.setSleepQuality(\''+q.id+'\')" style="flex:1;padding:10px 4px;border-radius:14px;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;'+(sel?'background:linear-gradient(135deg,#EFE4FF,#F7E9F1);border:1px solid #B89BD9;color:#4A3D55;':'background:var(--card);border:1px solid var(--card-bd);color:var(--text);')+'"><span style="font-size:20px;">'+q.emoji+'</span><span style="font-size:11px;font-weight:600;">'+q.label+'</span></button>'; });
  h+='</div>';
  var med=(sl.med&&typeof sl.med==='object')?sl.med:{type:null,note:''};
  h+='<div style="border-top:1px solid var(--card-bd);padding-top:11px;display:flex;flex-direction:column;gap:8px;">';
  h+='<div style="font-size:12.5px;font-weight:700;color:var(--muted);">Bu gece uyku ilacı / takviyesi kullandın mı?</div>';
  h+='<div style="display:flex;gap:8px;">';
  SLEEP_MED.forEach(function(o){ var sel=med.type===o.id; h+='<button onclick="App.setSleepMed(\''+o.id+'\')" style="flex:1;padding:9px 4px;border-radius:13px;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;'+(sel?'background:linear-gradient(135deg,#E3ECFF,#EFE7FB);border:1px solid #93A7D9;color:#3A4565;':'background:var(--card);border:1px solid var(--card-bd);color:var(--text);')+'"><span style="font-size:18px;">'+o.emoji+'</span><span style="font-size:10.5px;font-weight:700;line-height:1.2;text-align:center;">'+o.label+'</span></button>'; });
  h+='</div>';
  if(med.type==='herbal'||med.type==='rx'){
    h+='<input type="text" value="'+(med.note?esc(med.note):'')+'" oninput="App.setSleepMedNote(this)" placeholder="'+(med.type==='rx'?'İlaç adı / doz (örn. trazodon 50mg)':'Takviye adı (örn. melatonin 3mg)')+'" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:10px 12px;font-size:13.5px;outline:none;">';
    h+='<div style="font-size:11px;color:var(--faint);line-height:1.4;">Bu bilgi yalnızca kendi takibin için. İlaç kullanımıyla ilgili kararları hekiminle birlikte ver.</div>';
  }
  h+='</div>';
  h+=caffeineBlock(rec);
  if(!ed) h+=medFreeBadge();
  if(!ed){
  h+='<div style="border-radius:18px;padding:14px;background:linear-gradient(135deg,rgba(138,117,200,0.2),rgba(233,175,193,0.16));border:1px solid rgba(155,127,201,0.3);display:flex;flex-direction:column;gap:10px;">';
  var rdChip=readiness.readingCount>0?(readiness.readingCount+' kitap · '+readiness.readingPages+' sayfa'):'okuma yok';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;"><div><div style="font-size:12px;color:var(--faint);">Uykuya dalma hazırlığı</div><div style="font-size:16px;font-weight:800;color:var(--text);">Skor '+readiness.score+'/100 · '+readiness.tier+'</div></div><div style="font-size:12px;color:#5A457A;background:rgba(255,255,255,0.55);padding:6px 10px;border-radius:999px;border:1px solid rgba(155,127,201,0.25);">'+rdChip+'</div></div>';
  var rf=readiness.factors||{};
  var fdefs=[['Uyku süresi',rf.duration||0,34],['Kalite',rf.quality||0,22],['İlaçsızlık',rf.medication||0,10],['Okuma',rf.reading||0,34]];
  h+='<div style="display:flex;flex-direction:column;gap:5px;background:rgba(255,255,255,0.4);border:1px solid rgba(155,127,201,0.2);border-radius:14px;padding:10px 11px;">';
  fdefs.forEach(function(f){ var pct=Math.round(f[1]/f[2]*100); h+='<div style="display:flex;align-items:center;gap:8px;"><div style="font-size:11px;color:var(--muted);width:104px;flex-shrink:0;">'+f[0]+'</div><div style="flex:1;height:6px;border-radius:999px;background:rgba(90,69,122,0.14);overflow:hidden;"><div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,#9B7FC9,#E9AFC1);"></div></div><div style="font-size:10.5px;color:var(--faint);width:34px;text-align:right;flex-shrink:0;">'+f[1]+'/'+f[2]+'</div></div>'; });
  h+='<div style="font-size:10.5px;color:var(--faint);line-height:1.4;margin-top:3px;">Hedef ~7.5-8.5 sa uyku, iyi kalite, ilaçsızlık ve uyku öncesi okuma skoru yükseltir.</div>';
  h+='</div>';
  var rdEntries=readingStats(rec).entries;
  if(rdEntries.length>0){
    h+='<div style="display:flex;flex-direction:column;gap:6px;background:rgba(255,255,255,0.4);border:1px solid rgba(155,127,201,0.2);border-radius:14px;padding:10px 11px;">';
    h+='<div style="font-size:11px;letter-spacing:.4px;font-weight:800;color:var(--muted);">BUGÜN OKUDUKLARIM</div>';
    rdEntries.forEach(function(e){ var meta=[]; if(e.pages) meta.push(e.pages+' sayfa'); if(e.minutes) meta.push(e.minutes+' dk'); h+='<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:15px;">📖</span><div style="flex:1;min-width:0;"><div style="font-size:12.5px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+esc(e.title||'(başlıksız)')+(e.author?' <span style=\"font-weight:500;color:var(--faint);\">· '+esc(e.author)+'</span>':'')+'</div>'+(meta.length?'<div style="font-size:11px;color:var(--faint);">'+meta.join(' · ')+'</div>':'')+'</div></div>'; });
    h+='</div>';
  }
  h+='<button onclick="App.openReading()" style="border:1px solid rgba(155,127,201,0.35);cursor:pointer;padding:11px;border-radius:14px;font-size:13.5px;font-weight:800;color:#5A457A;background:rgba(255,255,255,0.62);display:flex;align-items:center;justify-content:center;gap:7px;">📖 Okuma ekle</button>';
  h+='<div style="font-size:11.5px;line-height:1.45;color:var(--muted);">Uyku öncesi birkaç sayfa okumak, ekran ışığına göre uykuya geçişi kolaylaştırır.</div>';
  h+='</div>';
  } // /readiness+okuma (geçmiş gün düzenlemesinde gizli)
  h+='</div>';
  // yürüyüş
  h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;"><div style="display:flex;align-items:center;gap:8px;"><div style="font-size:15.5px;font-weight:700;">Yürüyüş 🚶‍♀️</div>'+(ed?'':'<button onclick="App.importHealthClick()" style="margin-left:auto;border:1px solid var(--field-bd);cursor:pointer;background:var(--card);color:var(--text2);font-weight:700;font-size:12px;padding:6px 11px;border-radius:999px;">🍎 Sağlık’tan çek</button>')+'</div>';
  h+='<div style="display:flex;gap:10px;"><div style="flex:1;"><div style="font-size:12.5px;font-weight:700;color:var(--muted);margin-bottom:5px;">Adım</div><input type="number" inputmode="numeric" min="0" value="'+(wk.steps!=null?esc(wk.steps):'')+'" oninput="App.setWalkSteps(this)" placeholder="6200" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:16px;outline:none;text-align:center;"></div>';
  h+='<div style="flex:1;"><div style="font-size:12.5px;font-weight:700;color:var(--muted);margin-bottom:5px;">Süre (dk)</div><input type="number" inputmode="numeric" min="0" value="'+(wk.minutes!=null?esc(wk.minutes):'')+'" oninput="App.setWalkMinutes(this)" placeholder="25" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:16px;outline:none;text-align:center;"></div></div>';
  var walkedToday=!!(rec&&rec.habits&&rec.habits.walked20);
  var stepsEmpty=!(wk.steps!=null&&wk.steps!=='');
  var trk=trackedSteps(rec);
  if(!ed&&stepsEmpty&&trk>0){ var dmW=dayMovement(rec); h+='<div style="display:flex;gap:9px;align-items:flex-start;background:linear-gradient(135deg,rgba(125,190,119,0.14),rgba(155,127,201,0.10));border:1px solid rgba(125,190,119,0.4);border-radius:14px;padding:11px 12px;"><span style="font-size:18px;line-height:1.2;">📍</span><div style="flex:1;min-width:0;font-size:12.5px;color:var(--text2);line-height:1.45;">Konum takibinden bugün <b>~'+trk.toLocaleString('tr-TR')+' adım</b> ('+fmtDist(dmW.walk)+' yürüyüş) algılandı ve kullanılıyor. Elle adım girersen <b>girdiğin değer</b> geçerli olur.</div></div>'; }
  if(!ed&&walkedToday&&stepsEmpty&&!ui.stepNudgeHidden){
    h+='<div style="display:flex;gap:9px;align-items:flex-start;background:linear-gradient(135deg,rgba(143,191,138,0.16),rgba(155,127,201,0.12));border:1px solid rgba(143,191,138,0.4);border-radius:14px;padding:11px 12px;">';
    h+='<span style="font-size:18px;line-height:1.2;">👣</span>';
    h+='<div style="flex:1;min-width:0;font-size:12.5px;color:var(--text2);line-height:1.45;">Yürüyüşünü işaretledin, harika 👏 İstersen adımını da ekle — ilerlemeni daha net görürüz. <span style="color:var(--faint);">(zorunlu değil)</span></div>';
    h+='<button onclick="App.hideStepNudge()" aria-label="Kapat" style="flex-shrink:0;border:none;background:none;cursor:pointer;color:var(--faint);font-size:15px;font-weight:700;line-height:1;">✕</button></div>';
  }
  if(!ed) h+='<div style="font-size:12px;color:var(--faint);line-height:1.4;">≥20 dk <b>veya</b> ≥'+STEP_TICK_MIN.toLocaleString('tr-TR')+' adım, Bugün ekranındaki yürüyüş tikini otomatik işaretler ✨</div>';
  h+='</div>';
  if(!ed) h+=sparkCard();
  h+=discomfortCard(rec);
  // Apple Health
  if(!ed){
  h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:10px;"><div style="font-size:15.5px;font-weight:700;">Apple Sağlık\'tan içe aktar 🍎</div>';
  h+='<div style="font-size:13px;line-height:1.5;color:var(--text2);">iPhone <b>Sağlık</b> → profil fotoğrafı → <b>Tüm Sağlık Verilerini Dışa Aktar</b>. Oluşan <b>export.zip</b> içindeki <b>export.xml</b> dosyasını seç; bugünün adımı ve uykusu otomatik dolsun.</div>';
  h+='<button onclick="App.importHealthClick()" style="border:1px solid var(--field-bd);cursor:pointer;width:100%;padding:13px;border-radius:16px;font-size:15px;font-weight:700;color:var(--text);background:var(--card);">export.xml seç 📥</button>';
  h+='<input type="file" id="sey-health-file" accept=".xml,text/xml,application/xml,.zip" onchange="App.importHealthFile(this)" style="display:none;">';
  h+='<div id="sey-health-status" style="font-size:12.5px;color:var(--faint);min-height:16px;"></div></div>';
  }
  h+=cycleHTML();
  h+='</div>';
  return h;
}

// ---- cycle math (takvim/ortalama yöntemi, luteal ~14 gün) ----
function sortedPeriods(){ return (data.cycle.periods||[]).filter(function(p){return p&&p.start;}).slice().sort(function(a,b){return a.start<b.start?-1:(a.start>b.start?1:0);}); }
function cycleStats(){
  var ps=sortedPeriods(); var starts=ps.map(function(p){return p.start;});
  var lens=[]; for(var i=1;i<starts.length;i++){ var dl=diffDays(starts[i-1],starts[i]); if(dl>=15&&dl<=60) lens.push(dl); }
  var avgCycle=lens.length?Math.round(lens.reduce(function(a,b){return a+b;},0)/lens.length):(data.cycle.avgCycle||28); avgCycle=Math.max(21,Math.min(40,avgCycle));
  var plens=[]; ps.forEach(function(p){ if(p.start&&p.end){ var d=diffDays(p.start,p.end)+1; if(d>0&&d<15) plens.push(d); } });
  var avgPeriod=plens.length?Math.round(plens.reduce(function(a,b){return a+b;},0)/plens.length):(data.cycle.avgPeriod||5); avgPeriod=Math.max(2,Math.min(10,avgPeriod));
  var last=starts.length?starts[starts.length-1]:null; var today=todayStr();
  var next=null,ovu=null,fS=null,fE=null,dayInCycle=null,phase=null;
  if(last){ var since=diffDays(last,today); if(since>=0) dayInCycle=(since%avgCycle)+1;
    next=addDays(last,avgCycle); var guard=0; while(diffDays(next,today)>0&&guard<60){ next=addDays(next,avgCycle); guard++; }
    ovu=addDays(next,-14); fS=addDays(ovu,-5); fE=addDays(ovu,1);
    if(dayInCycle){ var ovuDay=avgCycle-14; if(dayInCycle<=avgPeriod) phase='menstrual'; else if(dayInCycle<ovuDay-1) phase='follicular'; else if(dayInCycle<=ovuDay+1) phase='ovulation'; else phase='luteal'; }
  }
  return {ps:ps,avgCycle:avgCycle,avgPeriod:avgPeriod,last:last,next:next,ovu:ovu,fertileStart:fS,fertileEnd:fE,dayInCycle:dayInCycle,phase:phase,sampleCount:lens.length};
}
function fmtTR(s){ if(!s) return '—'; var p=s.split('-'); var mo=['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara']; return Number(p[2])+' '+mo[Number(p[1])-1]; }
function cycleWheel(st){
  var size=140,cx=70,cy=70,R=54,C=2*Math.PI*R,w=14; var ac=st.avgCycle,ap=st.avgPeriod,ovuDay=ac-14;
  var fMen=ap/ac, fOvuStart=(ovuDay-1.5)/ac, fOvu=3/ac, fFollStart=fMen, fFoll=fOvuStart-fMen, fLutStart=fOvuStart+fOvu, fLut=1-fLutStart;
  var svg='<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'">';
  svg+='<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="none" stroke="rgba(150,110,120,0.12)" stroke-width="'+w+'"></circle>';
  svg+=ringSeg(cx,cy,R,C,PHASES.menstrual.color,0,fMen,w);
  svg+=ringSeg(cx,cy,R,C,PHASES.follicular.color,fFollStart,Math.max(0,fFoll),w);
  svg+=ringSeg(cx,cy,R,C,PHASES.ovulation.color,fOvuStart,fOvu,w);
  svg+=ringSeg(cx,cy,R,C,PHASES.luteal.color,fLutStart,Math.max(0,fLut),w);
  if(st.dayInCycle){ var frac=(st.dayInCycle-0.5)/ac, ang=frac*2*Math.PI-Math.PI/2, mx=cx+R*Math.cos(ang), my=cy+R*Math.sin(ang); svg+='<circle cx="'+mx.toFixed(1)+'" cy="'+my.toFixed(1)+'" r="7" fill="#fff" stroke="#3A2E33" stroke-width="2"></circle>'; }
  var ph=st.phase?PHASES[st.phase]:null;
  svg+='<text x="'+cx+'" y="'+(cy-2)+'" text-anchor="middle" font-size="21" font-weight="800" style="fill:var(--text);">'+(st.dayInCycle?('G'+st.dayInCycle):'—')+'</text>';
  svg+='<text x="'+cx+'" y="'+(cy+15)+'" text-anchor="middle" font-size="10.5" style="fill:var(--faint);">'+(ph?esc(ph.label):'döngü')+'</text>';
  svg+='</svg>'; return svg;
}
function cycleHTML(){
  var st=cycleStats(); var today=todayStr(); var vd=activeDate(); var edC=editing(); var rec=data.days[vd]||null; var curFlow=rec?rec.flow:null; var curSym=(rec&&rec.symptoms)?rec.symptoms:[]; var ph=st.phase?PHASES[st.phase]:null;
  var h='<div style="padding:10px 4px 0;"><div style="font-size:20px;font-weight:800;">Menstrüasyon Döngüsü 🌸</div><div style="font-size:12.5px;color:var(--faint);margin-top:2px;">Bilimsel takip · tahmindir, tıbbi tavsiye değildir</div></div>';
  h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;align-items:center;gap:14px;"><div style="flex-shrink:0;">'+cycleWheel(st)+'</div><div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:7px;">';
  if(ph){ h+='<div style="display:inline-flex;align-items:center;gap:6px;font-size:14.5px;font-weight:800;color:'+ph.color+';">'+ph.emoji+' '+esc(ph.label)+'</div><div style="font-size:12.5px;line-height:1.45;color:var(--text2);">'+esc(ph.note)+'</div>'; }
  else { h+='<div style="font-size:13px;color:var(--muted);line-height:1.5;">Henüz regl kaydı yok. Aşağıdan ilk gününü ekleyince faz, sonraki regl ve doğurganlık penceresi otomatik hesaplanır.</div>'; }
  h+='</div></div>';
  if(st.last){ var rows=[['Sonraki regl (tahmini)',fmtTR(st.next)],['Doğurganlık penceresi',fmtTR(st.fertileStart)+' – '+fmtTR(st.fertileEnd)],['Ovülasyon (tahmini)',fmtTR(st.ovu)],['Ortalama döngü',st.avgCycle+' gün'],['Ortalama regl süresi',st.avgPeriod+' gün'],['Son regl başlangıcı',fmtTR(st.last)]];
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;">'; rows.forEach(function(r){ h+='<div class="glass" style="border-radius:16px;padding:12px;"><div style="font-size:11.5px;color:var(--faint);line-height:1.3;">'+esc(r[0])+'</div><div style="font-size:15px;font-weight:800;margin-top:4px;">'+esc(r[1])+'</div></div>'; }); h+='</div>';
    if(st.sampleCount<1) h+='<div style="font-size:12px;color:var(--faint);padding:0 4px;line-height:1.4;">Şimdilik tek kayıt var; tahminler 28 günlük ortalamaya göre. Her yeni kayıt tahmini daha isabetli yapar.</div>';
  }
  h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;"><div style="font-size:15.5px;font-weight:700;">'+(edC?esc(dateLabelTR(vd)):'Bugün')+'</div>';
  h+='<div><div style="font-size:12.5px;color:var(--muted);margin-bottom:6px;">Akış</div><div style="display:flex;gap:7px;">';
  FLOW.forEach(function(f){ var sel=curFlow===f.id; h+='<button onclick="App.setFlow(\''+f.id+'\')" style="flex:1;padding:9px 3px;border-radius:13px;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;'+(sel?'background:linear-gradient(135deg,#FBE3E8,#F7DDE5);border:1px solid #E58B9B;color:#7A2E3A;':'background:var(--card);border:1px solid var(--card-bd);color:var(--text);')+'"><span style="font-size:18px;">'+f.emoji+'</span><span style="font-size:10.5px;font-weight:600;">'+f.label+'</span></button>'; });
  h+='</div></div>';
  h+='<div><div style="font-size:12.5px;color:var(--muted);margin-bottom:6px;">Belirtiler</div><div style="display:flex;flex-wrap:wrap;gap:7px;">';
  SYMPTOMS.forEach(function(s){ var sel=curSym.indexOf(s.id)>=0; h+='<button onclick="App.toggleSymptom(\''+s.id+'\')" style="padding:8px 11px;border-radius:999px;font-size:12.5px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:5px;'+(sel?'background:linear-gradient(135deg,#EFE4FF,#FBE3E8);border:1px solid #B89BD9;color:#5A3D55;':'background:var(--card);border:1px solid var(--card-bd);color:var(--text2);')+'"><span>'+s.emoji+'</span><span>'+s.label+'</span></button>'; });
  h+='</div></div></div>';
  h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;"><div style="display:flex;align-items:center;justify-content:space-between;"><div style="font-size:15.5px;font-weight:700;">Regl kayıtları</div><button onclick="App.logPeriodToday()" style="border:none;cursor:pointer;padding:8px 13px;border-radius:12px;font-size:13px;font-weight:700;color:#fff;background:linear-gradient(135deg,#E58B9B,#C9B8FF);">Bugün başladı 🩸</button></div>';
  var ps=st.ps; if(!ps.length){ h+='<div style="font-size:13px;color:var(--faint);line-height:1.5;">Henüz kayıt yok. "Bugün başladı" ile ilk reglini ekle; tarihleri sonra düzenleyebilirsin.</div>'; }
  ps.slice().reverse().forEach(function(p){ var ri=data.cycle.periods.indexOf(p); h+='<div style="display:flex;align-items:flex-end;gap:8px;flex-wrap:wrap;border-top:1px solid rgba(150,110,120,0.12);padding-top:10px;">';
    h+='<div style="flex:1;min-width:115px;"><div style="font-size:11px;color:var(--faint);margin-bottom:3px;">Başlangıç</div><input type="date" value="'+esc(p.start||'')+'" max="'+today+'" onchange="App.setPeriodField('+ri+',\'start\',this)" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:10px;padding:8px;font-size:13px;outline:none;"></div>';
    h+='<div style="flex:1;min-width:115px;"><div style="font-size:11px;color:var(--faint);margin-bottom:3px;">Bitiş</div><input type="date" value="'+esc(p.end||'')+'" max="'+today+'" onchange="App.setPeriodField('+ri+',\'end\',this)" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:10px;padding:8px;font-size:13px;outline:none;"></div>';
    h+='<button onclick="App.removePeriod('+ri+')" style="border:none;cursor:pointer;background:rgba(220,120,120,0.1);color:#C0605F;width:36px;height:36px;border-radius:10px;font-size:14px;">🗑️</button></div>'; });
  h+='</div>';
  h+='<div class="glass" style="border-radius:18px;padding:14px;"><div style="font-size:13.5px;font-weight:700;margin-bottom:8px;">4 Faz kısaca 🔬</div>';
  ['menstrual','follicular','ovulation','luteal'].forEach(function(k){ var p=PHASES[k]; h+='<div style="display:flex;gap:8px;margin-bottom:7px;font-size:12.5px;line-height:1.4;"><span style="flex-shrink:0;">'+p.emoji+'</span><span><b style="color:'+p.color+';">'+esc(p.label)+'</b> — '+esc(p.note)+'</span></div>'; });
  h+='<div style="font-size:11.5px;color:var(--faint);line-height:1.5;margin-top:6px;border-top:1px solid rgba(150,110,120,0.12);padding-top:8px;">Hesaplamalar takvim/ortalama yöntemine dayanır (luteal faz ~14 gün kabulü). Gerçek ovülasyon kişiden kişiye değişir; gebelikten korunma veya tıbbi karar için tek başına kullanılmamalıdır.</div></div>';
  return h;
}

function navHTML(){
  var defs=[['bugun','☀️','Bugün'],['saglik','🌸','Sağlık'],['sos','🍫','SOS'],['mesaj','🌙','Luna'],['harita','🗺️','Harita'],['rapor','📊','Rapor'],['ayarlar','⚙️','Ayarlar']];
  var unread=unreadNotifCount();
  var h='<nav style="flex-shrink:0;display:flex;background:var(--nav);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-top:1px solid rgba(150,110,120,0.15);padding:8px 2px calc(env(safe-area-inset-bottom) + 8px);">';
  defs.forEach(function(n){
    var active=ui.tab===n[0];
    var badge=(n[0]==='mesaj'&&unread>0)?'<span style="position:absolute;top:-3px;right:50%;transform:translateX(15px);min-width:16px;height:16px;padding:0 4px;border-radius:999px;background:#E9576F;color:#fff;font-size:10px;font-weight:800;line-height:16px;text-align:center;box-shadow:0 2px 6px rgba(233,87,111,0.5);">'+(unread>9?'9+':unread)+'</span>':'';
    var clickFn=n[0]==='mesaj'?'App.openMesaj()':'App.go(\''+n[0]+'\')';
    h+='<button onclick="'+clickFn+'" style="position:relative;flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:5px 1px;background:none;border:none;cursor:pointer;font-size:10px;color:'+(active?'var(--accent)':'var(--faint)')+';font-weight:'+(active?'700':'500')+';transition:color .2s;"><span style="position:relative;font-size:20px;line-height:1;">'+n[1]+badge+'</span><span style="line-height:1;">'+n[2]+'</span></button>';
  });
  h+='</nav>';
  return h;
}

// ================= OKUMA HUB (overlay) =================
function overlayShell(closeFn, sticky, body, maxw){
  var h='<div id="sey-ov-back" onclick="'+closeFn+'" style="position:fixed;inset:0;z-index:340;background:rgba(44,36,38,0.42);backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;padding:14px;animation:seyFade .2s ease;">';
  h+='<div id="sey-ov-card" onclick="event.stopPropagation()" style="width:100%;max-width:'+(maxw||460)+'px;height:86vh;background:var(--modal);border-radius:26px;padding:20px;box-shadow:0 -10px 40px rgba(0,0,0,0.22);animation:seyPop .25s ease;display:flex;flex-direction:column;gap:13px;overflow:hidden;">';
  h+='<div style="flex-shrink:0;display:flex;flex-direction:column;gap:13px;">'+(sticky||'')+'</div>';
  h+='<div id="sey-ov-body" class="scroll" style="flex:1;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:14px;margin:0 -4px;padding:4px 4px 2px;">'+(body||'')+'</div>';
  h+='</div></div>';
  return h;
}
function bookStatusChip(st){ var m={reading:['Okunuyor','var(--read)','var(--read-bg)'],finished:['Bitti','var(--ok)','var(--ok-bg)'],dropped:['Bırakıldı','var(--drop)','var(--drop-bg)']}; var c=m[st]||m.reading; return '<span style="font-size:10.5px;font-weight:800;padding:2px 9px;border-radius:999px;color:'+c[1]+';background:'+c[2]+';">'+c[0]+'</span>'; }
function readingOverlayHTML(){
  var view=ui.readingView||'today';
  var head='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;"><div><div style="font-size:20px;font-weight:800;">Ne okudum? 📖</div><div style="font-size:12.5px;color:var(--faint);margin-top:3px;">Bugünkü okuman, kitaplığın ve alıntıların tek yerde.</div></div><button onclick="App.closeReading()" style="border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:34px;height:34px;border-radius:50%;font-size:16px;color:var(--muted);flex-shrink:0;">✕</button></div>';
  var tabs=segTabs([['today','Bugün'],['library','📚 Kitaplık'],['stats','📊 İstatistik'],['quotes','💬 Alıntılar']],view,'App.setReadingView');
  var body='';
  if(view==='today') body=readingTodayView();
  else if(view==='library') body=readingLibraryView();
  else if(view==='stats') body=readingStatsView();
  else if(view==='quotes') body=readingQuotesView();
  var h=overlayShell('App.closeReading()', head+tabs, body);
  if(ui.bookEdit) h+=bookEditModal();
  if(ui.quoteDraft) h+=quoteAddModal();
  return h;
}
function readingTodayView(){
  var dr=ui.readingDraft||{title:'',author:'',pages:'',minutes:'',note:''};
  var day=getDay(data,todayStr(),dayIndexFor(todayStr()));
  var rEntries=(day&&day.reading&&Array.isArray(day.reading.entries))?day.reading.entries:[];
  var totPages=rEntries.reduce(function(a,e){ var p=Number(e&&e.pages); return a+((!isNaN(p)&&p>0)?p:0); },0);
  var L=ensureLibrary();
  var goalPg=(L.goal&&L.goal.dailyPages)||0;
  var h='';
  // daily goal ring
  if(goalPg>0){ var gp=Math.min(100,Math.round(totPages/goalPg*100)); h+='<div style="display:flex;align-items:center;gap:13px;background:linear-gradient(135deg,rgba(110,85,191,0.10),rgba(233,175,193,0.12));border:1px solid var(--card-bd);border-radius:18px;padding:13px 15px;">'; h+='<div style="position:relative;width:52px;height:52px;flex-shrink:0;"><svg width="52" height="52" viewBox="0 0 52 52"><circle cx="26" cy="26" r="22" fill="none" stroke="rgba(150,110,120,0.16)" stroke-width="6"></circle><circle cx="26" cy="26" r="22" fill="none" stroke="#6E55BF" stroke-width="6" stroke-linecap="round" stroke-dasharray="'+(2*Math.PI*22)+'" stroke-dashoffset="'+(2*Math.PI*22*(1-gp/100))+'" transform="rotate(-90 26 26)"></circle></svg><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;">'+gp+'%</div></div>'; h+='<div style="flex:1;min-width:0;"><div style="font-size:13.5px;font-weight:800;color:var(--text);">Günlük hedef · '+totPages+'/'+goalPg+' sayfa</div><div style="font-size:11.5px;color:var(--muted);line-height:1.35;">'+(totPages>=goalPg?'Bugünün hedefi tamam, harikasın 💜':'Hedefe '+(goalPg-totPages)+' sayfa kaldı.')+'</div></div></div>'; }
  // quick pick from active books
  var active=L.books.filter(function(b){ return b.status==='reading'; });
  if(active.length){ h+='<div><div style="font-size:11.5px;font-weight:800;color:var(--muted);margin-bottom:6px;letter-spacing:.3px;">OKUDUĞUM KİTAP</div><div style="display:flex;gap:7px;flex-wrap:wrap;">'; active.forEach(function(b){ var on=ui.logBookId===b.id; h+='<button onclick="App.pickLogBook(\''+esc(b.id)+'\')" style="border:1px solid '+(on?'var(--read)':'var(--card-bd)')+';cursor:pointer;padding:7px 11px;border-radius:12px;font-size:12.5px;font-weight:700;color:'+(on?'#fff':'var(--text2)')+';background:'+(on?'linear-gradient(135deg,#6E55BF,#9B7FC9)':'var(--card)')+';display:flex;align-items:center;gap:5px;">'+b.emoji+' '+esc(b.title.length>18?b.title.slice(0,17)+'…':b.title)+'</button>'; }); h+='</div></div>'; }
  // form
  h+='<div style="display:flex;flex-direction:column;gap:10px;background:var(--card);border:1px solid var(--card-bd);border-radius:18px;padding:14px;">';
  h+='<div><div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:5px;">Kitap adı</div><input id="reading-title" type="text" value="'+esc(dr.title||'')+'" oninput="App.onReadingField(\'title\',this)" placeholder="örn. Sefiller" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:15px;outline:none;"></div>';
  h+='<div><div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:5px;">Yazar <span style="color:var(--faint);font-weight:500;">(isteğe bağlı)</span></div><input type="text" value="'+esc(dr.author||'')+'" oninput="App.onReadingField(\'author\',this)" placeholder="örn. Victor Hugo" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:14px;outline:none;"></div>';
  h+='<div style="display:flex;gap:10px;"><div style="flex:1;"><div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:5px;">Sayfa</div><input type="number" inputmode="numeric" min="0" value="'+(dr.pages!=null&&dr.pages!==''?esc(dr.pages):'')+'" oninput="App.onReadingField(\'pages\',this)" placeholder="32" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:15px;outline:none;text-align:center;"></div>';
  h+='<div style="flex:1;"><div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:5px;">Süre (dk)</div><input type="number" inputmode="numeric" min="0" value="'+(dr.minutes!=null&&dr.minutes!==''?esc(dr.minutes):'')+'" oninput="App.onReadingField(\'minutes\',this)" placeholder="20" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:15px;outline:none;text-align:center;"></div></div>';
  h+='<div><div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:5px;">Not <span style="color:var(--faint);font-weight:500;">(isteğe bağlı)</span></div><textarea rows="2" oninput="App.onReadingField(\'note\',this)" placeholder="Aklında kalan bir cümle, duygu…" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:10px 12px;font-size:13.5px;outline:none;resize:none;line-height:1.45;">'+esc(dr.note||'')+'</textarea></div>';
  h+='<button onclick="App.addReading()" style="border:none;cursor:pointer;width:100%;padding:14px;border-radius:14px;font-size:15px;font-weight:800;color:#fff;background:linear-gradient(135deg,#6E55BF,#9B7FC9 55%,#E9AFC1);box-shadow:0 10px 24px rgba(110,85,191,0.4);">Okumayı kaydet 📖</button>';
  h+='</div>';
  if(rEntries.length>0){
    h+='<div style="display:flex;flex-direction:column;gap:8px;">';
    h+='<div style="display:flex;align-items:center;justify-content:space-between;"><div style="font-size:12.5px;font-weight:800;color:var(--muted);letter-spacing:.3px;">BUGÜN ('+rEntries.length+')</div><div style="font-size:11.5px;color:var(--faint);">toplam '+totPages+' sayfa</div></div>';
    rEntries.slice().reverse().forEach(function(e){ var meta=[]; if(e.pages) meta.push(e.pages+' sayfa'); if(e.minutes) meta.push(e.minutes+' dk'); var linked=e.bookId?findBook(e.bookId):null; h+='<div style="display:flex;align-items:flex-start;gap:10px;background:var(--card);border:1px solid var(--card-bd);border-radius:14px;padding:11px 12px;"><span style="font-size:18px;line-height:1.2;">'+(linked?linked.emoji:'📖')+'</span><div style="flex:1;min-width:0;"><div style="font-size:13.5px;font-weight:700;color:var(--text);">'+esc(e.title||'(başlıksız)')+(linked?' <span style="font-size:10.5px;color:var(--read);font-weight:700;">· kitaplıkta</span>':'')+'</div>'+(e.author?'<div style="font-size:11.5px;color:var(--faint);">'+esc(e.author)+'</div>':'')+(meta.length?'<div style="font-size:11.5px;color:var(--muted);margin-top:2px;">'+meta.join(' · ')+'</div>':'')+(e.note?'<div style="font-size:12px;color:var(--text2);margin-top:4px;line-height:1.4;">'+esc(e.note)+'</div>':'')+'</div><button onclick="App.removeReading(\''+esc(e.id)+'\')" aria-label="Sil" style="flex-shrink:0;border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:28px;height:28px;border-radius:8px;color:var(--faint);font-size:13px;">🗑️</button></div>'; });
    h+='</div>';
  } else {
    h+='<div style="text-align:center;font-size:12.5px;color:var(--faint);line-height:1.5;padding:4px 8px;">Henüz bugün için okuma eklemedin. Birkaç sayfa bile sayılır 💜</div>';
  }
  return h;
}
function bookCard(b){
  var pct=bookPct(b); var meta=[]; if(b.author) meta.push(esc(b.author)); if(b.genre) meta.push(esc(b.genre));
  var h='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:16px;padding:13px;display:flex;flex-direction:column;gap:9px;">';
  h+='<div style="display:flex;align-items:flex-start;gap:11px;"><div style="width:44px;height:44px;border-radius:12px;background:var(--icon);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;">'+b.emoji+'</div>';
  h+='<div style="flex:1;min-width:0;"><div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;"><span style="font-size:14.5px;font-weight:800;color:var(--text);">'+esc(b.title)+'</span>'+bookStatusChip(b.status)+'</div>'+(meta.length?'<div style="font-size:11.5px;color:var(--faint);margin-top:1px;">'+meta.join(' · ')+'</div>':'')+'</div>';
  h+='<button onclick="App.openBookEdit(\''+esc(b.id)+'\')" aria-label="Düzenle" style="flex-shrink:0;border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:30px;height:30px;border-radius:9px;color:var(--muted);font-size:14px;">✏️</button></div>';
  // progress
  if(b.status!=='finished'){
    h+='<div style="display:flex;align-items:center;gap:9px;">';
    h+='<button onclick="App.advanceBook(\''+esc(b.id)+'\',-10)" style="border:1px solid var(--field-bd);cursor:pointer;width:30px;height:30px;border-radius:9px;font-size:15px;font-weight:800;color:var(--muted);background:var(--card);flex-shrink:0;">−</button>';
    h+='<div style="flex:1;min-width:0;">'+progBar(pct)+'<div style="font-size:11px;color:var(--muted);margin-top:4px;display:flex;justify-content:space-between;"><span>'+b.currentPage+(b.totalPages?' / '+b.totalPages+' sf':' sf')+'</span><span>%'+pct+'</span></div></div>';
    h+='<button onclick="App.advanceBook(\''+esc(b.id)+'\',10)" style="border:1px solid var(--field-bd);cursor:pointer;width:30px;height:30px;border-radius:9px;font-size:15px;font-weight:800;color:var(--read);background:var(--card);flex-shrink:0;">+</button>';
    h+='</div>';
    h+='<div style="display:flex;gap:7px;"><button onclick="App.finishBook(\''+esc(b.id)+'\')" style="flex:1;border:none;cursor:pointer;padding:9px;border-radius:11px;font-size:12.5px;font-weight:800;color:#fff;background:linear-gradient(135deg,#7DBE77,#5BA85B);">✓ Bitirdim</button>';
    if(b.status==='reading') h+='<button onclick="App.setBookStatus(\''+esc(b.id)+'\',\'dropped\')" style="border:1px solid var(--field-bd);cursor:pointer;padding:9px 12px;border-radius:11px;font-size:12.5px;font-weight:700;color:var(--muted);background:var(--card);">Ara ver</button>';
    else h+='<button onclick="App.setBookStatus(\''+esc(b.id)+'\',\'reading\')" style="border:1px solid var(--field-bd);cursor:pointer;padding:9px 12px;border-radius:11px;font-size:12.5px;font-weight:700;color:var(--read);background:var(--card);">Devam et</button>';
    h+='</div>';
  } else {
    h+='<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">'+starRow(b.rating,'App.rateBook',b.id,17)+'<button onclick="App.reopenBook(\''+esc(b.id)+'\')" style="border:1px solid var(--field-bd);cursor:pointer;padding:7px 12px;border-radius:11px;font-size:12px;font-weight:700;color:var(--read);background:var(--card);">Yeniden oku</button></div>';
    if(b.finishedAt) h+='<div style="font-size:11px;color:var(--faint);">🎉 '+esc(shortDate(fmt(new Date(b.finishedAt))))+' tarihinde bitti</div>';
  }
  return h+'</div>';
}
function readingLibraryView(){
  var L=ensureLibrary();
  var h='<button onclick="App.openBookEdit(\'\')" style="border:1px dashed var(--read);cursor:pointer;width:100%;padding:12px;border-radius:14px;font-size:13.5px;font-weight:800;color:var(--read);background:rgba(155,127,201,0.08);">＋ Kitap ekle</button>';
  var order={reading:0,finished:1,dropped:2};
  var books=L.books.slice().sort(function(a,b){ return (order[a.status]-order[b.status])||String(b.createdAt||'').localeCompare(String(a.createdAt||'')); });
  if(!books.length){ h+='<div style="text-align:center;font-size:12.5px;color:var(--faint);line-height:1.6;padding:22px 10px;">Kitaplığın henüz boş 📚<br>Okumaya başladığın kitabı ekle, ilerlemen burada birer birer biriksin.</div>'; return h; }
  var reading=books.filter(function(b){return b.status==='reading';}),finished=books.filter(function(b){return b.status==='finished';}),dropped=books.filter(function(b){return b.status==='dropped';});
  function sec(title,arr){ if(!arr.length) return ''; var s='<div style="font-size:11.5px;font-weight:800;color:var(--muted);letter-spacing:.3px;margin:4px 2px 0;">'+title+' ('+arr.length+')</div>'; arr.forEach(function(b){ s+=bookCard(b); }); return s; }
  h+='<div style="display:flex;flex-direction:column;gap:10px;">'+sec('OKUYORUM',reading)+sec('BİTİRDİKLERİM',finished)+sec('ARA VERDİKLERİM',dropped)+'</div>';
  return h;
}
function readingStatsView(){
  var L=ensureLibrary(); var s=libStats(); var t=readTotals(); var streak=readStreak(); var week=weekReading();
  var goalY=(L.goal&&L.goal.yearlyBooks)||0; var goalPg=(L.goal&&L.goal.dailyPages)||0;
  var h='<div style="display:flex;gap:9px;">'+statTile('Bitirilen',s.finished,'kitap')+statTile('Okunuyor',s.reading)+statTile('Seri',streak,'gün 🔥')+'</div>';
  h+='<div style="display:flex;gap:9px;">'+statTile('Toplam sayfa',t.pages)+statTile('Toplam süre',fmtDur(t.minutes))+statTile('Okuma günü',t.days)+'</div>';
  h+='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:16px;padding:14px;"><div style="font-size:12.5px;font-weight:800;color:var(--muted);margin-bottom:10px;">Son 7 gün · sayfa</div>'+miniBars(week,'pages','sayfa')+'</div>';
  // yearly goal
  h+='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:10px;"><div style="font-size:12.5px;font-weight:800;color:var(--muted);">🎯 Hedefler</div>';
  h+='<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:12.5px;color:var(--text2);flex:1;">Günlük sayfa hedefi</span><input type="number" inputmode="numeric" min="0" value="'+(goalPg||'')+'" oninput="App.setReadGoal(\'dailyPages\',this)" placeholder="20" style="width:74px;border:1px solid var(--field-bd);background:var(--field);border-radius:11px;padding:8px;font-size:14px;text-align:center;outline:none;"></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:12.5px;color:var(--text2);flex:1;">Bu yıl kitap hedefi</span><input type="number" inputmode="numeric" min="0" value="'+(goalY||'')+'" oninput="App.setReadGoal(\'yearlyBooks\',this)" placeholder="24" style="width:74px;border:1px solid var(--field-bd);background:var(--field);border-radius:11px;padding:8px;font-size:14px;text-align:center;outline:none;"></div>';
  if(goalY>0){ var yp=Math.min(100,Math.round(s.finYear/goalY*100)); h+='<div>'+progBar(yp,'linear-gradient(90deg,#7DBE77,#E9AFC1)')+'<div style="font-size:11.5px;color:var(--muted);margin-top:5px;">'+new Date().getFullYear()+': '+s.finYear+'/'+goalY+' kitap · %'+yp+'</div></div>'; }
  h+='</div>';
  return h;
}
function readingQuotesView(){
  var qs=allQuotes(); var L=ensureLibrary();
  var h='<button onclick="App.openQuoteAdd(\'\')" '+(L.books.length?'':'disabled ')+'style="border:1px dashed var(--read);cursor:'+(L.books.length?'pointer':'not-allowed')+';width:100%;padding:12px;border-radius:14px;font-size:13.5px;font-weight:800;color:var(--read);background:rgba(155,127,201,0.08);opacity:'+(L.books.length?'1':'0.5')+';">＋ Alıntı ekle</button>';
  if(!L.books.length){ h+='<div style="text-align:center;font-size:12.5px;color:var(--faint);line-height:1.6;padding:16px 10px;">Alıntı eklemek için önce kitaplığına bir kitap ekle 📚</div>'; return h; }
  if(!qs.length){ h+='<div style="text-align:center;font-size:12.5px;color:var(--faint);line-height:1.6;padding:22px 10px;">Henüz alıntı yok 💬<br>Seni durduran o cümleyi buraya bırak.</div>'; return h; }
  h+='<div style="display:flex;flex-direction:column;gap:10px;">';
  qs.forEach(function(o){ var q=o.q; h+='<div style="background:linear-gradient(135deg,rgba(110,85,191,0.07),rgba(233,175,193,0.09));border:1px solid var(--card-bd);border-radius:16px;padding:14px;position:relative;">'; h+='<div style="position:absolute;top:2px;right:12px;font-size:44px;color:var(--faint);opacity:0.25;line-height:1;">”</div>'; h+='<div style="font-size:14px;line-height:1.5;color:var(--text);font-style:italic;position:relative;">'+esc(q.text)+'</div>'; h+='<div style="display:flex;align-items:center;gap:8px;margin-top:9px;"><span style="font-size:11.5px;color:var(--muted);flex:1;">'+o.emoji+' '+esc(o.title)+(q.page?' · s.'+q.page:'')+'</span>'; h+='<button onclick="App.copyQuoteById(\''+esc(o.bookId)+'\',\''+esc(q.id)+'\')" style="border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:28px;height:28px;border-radius:8px;color:var(--muted);font-size:12px;">📋</button>'; h+='<button onclick="App.removeQuote(\''+esc(o.bookId)+'\',\''+esc(q.id)+'\')" style="border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:28px;height:28px;border-radius:8px;color:var(--faint);font-size:12px;">🗑️</button></div></div>'; });
  h+='</div>';
  return h;
}
function bookEditModal(){
  var b=ui.bookEdit; var isNew=!b.id;
  var inner='<div style="display:flex;justify-content:space-between;align-items:center;"><div style="font-size:17px;font-weight:800;">'+(isNew?'Kitap ekle 📚':'Kitabı düzenle')+'</div><button onclick="App.closeBookEdit()" style="border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:32px;height:32px;border-radius:50%;font-size:15px;color:var(--muted);">✕</button></div>';
  inner+='<div style="display:flex;gap:6px;flex-wrap:wrap;">'; BOOK_EMOJI.forEach(function(e){ var on=b.emoji===e; inner+='<button onclick="App.pickBookEmoji(\''+e+'\')" style="border:1px solid '+(on?'var(--read)':'var(--card-bd)')+';cursor:pointer;width:38px;height:38px;border-radius:11px;font-size:19px;background:'+(on?'rgba(110,85,191,0.14)':'var(--card)')+';">'+e+'</button>'; }); inner+='</div>';
  inner+='<input type="text" value="'+esc(b.title||'')+'" oninput="App.onBookEditField(\'title\',this)" placeholder="Kitap adı" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:15px;outline:none;">';
  inner+='<input type="text" value="'+esc(b.author||'')+'" oninput="App.onBookEditField(\'author\',this)" placeholder="Yazar" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:14px;outline:none;">';
  inner+='<div style="display:flex;gap:6px;flex-wrap:wrap;">'; BOOK_GENRES.forEach(function(g){ var on=b.genre===g; inner+='<button onclick="App.pickBookGenre(\''+g+'\')" style="border:1px solid '+(on?'var(--read)':'var(--card-bd)')+';cursor:pointer;padding:6px 10px;border-radius:999px;font-size:11.5px;font-weight:700;color:'+(on?'#fff':'var(--muted)')+';background:'+(on?'linear-gradient(135deg,#6E55BF,#9B7FC9)':'var(--card)')+';">'+g+'</button>'; }); inner+='</div>';
  inner+='<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:12.5px;color:var(--text2);flex:1;">Toplam sayfa <span style="color:var(--faint);">(opsiyonel)</span></span><input type="number" inputmode="numeric" min="0" value="'+(b.totalPages!=null&&b.totalPages!==''?esc(b.totalPages):'')+'" oninput="App.onBookEditField(\'totalPages\',this)" placeholder="—" style="width:90px;border:1px solid var(--field-bd);background:var(--field);border-radius:11px;padding:9px;font-size:14px;text-align:center;outline:none;"></div>';
  inner+='<button onclick="App.saveBook()" style="border:none;cursor:pointer;width:100%;padding:13px;border-radius:13px;font-size:14.5px;font-weight:800;color:#fff;background:linear-gradient(135deg,#6E55BF,#9B7FC9 55%,#E9AFC1);">Kaydet</button>';
  if(!isNew) inner+='<button onclick="App.deleteBook(\''+esc(b.id)+'\')" style="border:none;cursor:pointer;width:100%;padding:11px;border-radius:13px;font-size:13px;font-weight:700;color:#C0605F;background:rgba(220,120,120,0.1);">Kitabı sil</button>';
  return '<div onclick="App.closeBookEdit()" style="position:fixed;inset:0;z-index:360;background:rgba(44,36,38,0.5);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:18px;animation:seyFade .2s ease;"><div onclick="event.stopPropagation()" style="width:100%;max-width:400px;background:var(--modal);border-radius:22px;padding:20px;display:flex;flex-direction:column;gap:12px;max-height:86vh;overflow-y:auto;animation:seyPop .22s ease;">'+inner+'</div></div>';
}
function quoteAddModal(){
  var q=ui.quoteDraft; var L=ensureLibrary(); var books=L.books;
  var inner='<div style="display:flex;justify-content:space-between;align-items:center;"><div style="font-size:17px;font-weight:800;">Alıntı ekle 💬</div><button onclick="App.closeQuoteAdd()" style="border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:32px;height:32px;border-radius:50%;font-size:15px;color:var(--muted);">✕</button></div>';
  inner+='<div style="font-size:12px;font-weight:700;color:var(--muted);">Kitap</div><div style="display:flex;gap:6px;flex-wrap:wrap;">'; books.forEach(function(b){ var on=q.bookId===b.id; inner+='<button onclick="App.pickQuoteBook(\''+esc(b.id)+'\')" style="border:1px solid '+(on?'var(--read)':'var(--card-bd)')+';cursor:pointer;padding:7px 10px;border-radius:11px;font-size:12px;font-weight:700;color:'+(on?'#fff':'var(--muted)')+';background:'+(on?'linear-gradient(135deg,#6E55BF,#9B7FC9)':'var(--card)')+';">'+b.emoji+' '+esc(b.title.length>16?b.title.slice(0,15)+'…':b.title)+'</button>'; }); inner+='</div>';
  inner+='<textarea rows="3" oninput="App.onQuoteField(\'text\',this)" placeholder="Seni durduran o cümle…" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:14px;outline:none;resize:none;line-height:1.5;">'+esc(q.text||'')+'</textarea>';
  inner+='<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:12.5px;color:var(--text2);flex:1;">Sayfa <span style="color:var(--faint);">(opsiyonel)</span></span><input type="number" inputmode="numeric" min="0" value="'+(q.page!=null&&q.page!==''?esc(q.page):'')+'" oninput="App.onQuoteField(\'page\',this)" placeholder="—" style="width:90px;border:1px solid var(--field-bd);background:var(--field);border-radius:11px;padding:9px;font-size:14px;text-align:center;outline:none;"></div>';
  inner+='<button onclick="App.saveQuote()" style="border:none;cursor:pointer;width:100%;padding:13px;border-radius:13px;font-size:14.5px;font-weight:800;color:#fff;background:linear-gradient(135deg,#6E55BF,#9B7FC9 55%,#E9AFC1);">Kaydet</button>';
  return '<div onclick="App.closeQuoteAdd()" style="position:fixed;inset:0;z-index:360;background:rgba(44,36,38,0.5);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:18px;animation:seyFade .2s ease;"><div onclick="event.stopPropagation()" style="width:100%;max-width:400px;background:var(--modal);border-radius:22px;padding:20px;display:flex;flex-direction:column;gap:11px;max-height:86vh;overflow-y:auto;animation:seyPop .22s ease;">'+inner+'</div></div>';
}

// ================= NE İZLEDİM HUB (overlay) =================
function titleStatusChip(st){ var m={watching:['İzleniyor','var(--watch)','var(--watch-bg)'],finished:['Bitti','var(--ok)','var(--ok-bg)'],dropped:['Bırakıldı','var(--pause)','var(--pause-bg)']}; var c=m[st]||m.watching; return '<span style="font-size:10.5px;font-weight:800;padding:2px 9px;border-radius:999px;color:'+c[1]+';background:'+c[2]+';">'+c[0]+'</span>'; }
function watchOverlayHTML(){
  var view=ui.watchView||'today';
  var head='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;"><div><div style="font-size:20px;font-weight:800;">Ne izledim? 🎬</div><div style="font-size:12.5px;color:var(--faint);margin-top:3px;">Bugün izlediklerin, arşivin ve unutulmaz replikler.</div></div><button onclick="App.closeWatching()" style="border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:34px;height:34px;border-radius:50%;font-size:16px;color:var(--muted);flex-shrink:0;">✕</button></div>';
  var tabs=segTabs([['today','Bugün'],['archive','🎞️ Arşiv'],['stats','📊 İstatistik'],['quotes','💬 Replikler']],view,'App.setWatchView','watch');
  var body='';
  if(view==='today') body=watchTodayView();
  else if(view==='archive') body=watchArchiveView();
  else if(view==='stats') body=watchStatsView();
  else if(view==='quotes') body=watchQuotesView();
  var h=overlayShell('App.closeWatching()', head+tabs, body);
  if(ui.titleEdit) h+=titleEditModal();
  if(ui.replicaDraft) h+=replicaAddModal();
  return h;
}
function watchTodayView(){
  var d=ui.watchDraft||{title:'',kind:'film',episodes:'',minutes:'',note:''};
  var kind=(d.kind==='dizi')?'dizi':'film';
  var day=getDay(data,todayStr(),dayIndexFor(todayStr()));
  var wEntries=(day&&day.watching&&Array.isArray(day.watching.entries))?day.watching.entries:[];
  var totMin=wEntries.reduce(function(a,e){ var m=Number(e&&e.minutes); return a+((!isNaN(m)&&m>0)?m:0); },0);
  var W=ensureWatchlist();
  var goalMin=(W.goal&&W.goal.dailyMinutes)||0;
  var h='';
  if(goalMin>0){ var gp=Math.min(100,Math.round(totMin/goalMin*100)); h+='<div style="display:flex;align-items:center;gap:13px;background:linear-gradient(135deg,rgba(200,140,70,0.10),rgba(233,175,193,0.12));border:1px solid var(--card-bd);border-radius:18px;padding:13px 15px;">'; h+='<div style="position:relative;width:52px;height:52px;flex-shrink:0;"><svg width="52" height="52" viewBox="0 0 52 52"><circle cx="26" cy="26" r="22" fill="none" stroke="rgba(150,110,120,0.16)" stroke-width="6"></circle><circle cx="26" cy="26" r="22" fill="none" stroke="#C88F4C" stroke-width="6" stroke-linecap="round" stroke-dasharray="'+(2*Math.PI*22)+'" stroke-dashoffset="'+(2*Math.PI*22*(1-gp/100))+'" transform="rotate(-90 26 26)"></circle></svg><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;">'+gp+'%</div></div>'; h+='<div style="flex:1;min-width:0;"><div style="font-size:13.5px;font-weight:800;color:var(--text);">Günlük hedef · '+totMin+'/'+goalMin+' dk</div><div style="font-size:11.5px;color:var(--muted);line-height:1.35;">'+(totMin>=goalMin?'Bugünün keyfi tamam 🍿':'Keyfe '+(goalMin-totMin)+' dk kaldı.')+'</div></div></div>'; }
  var active=W.items.filter(function(t){ return t.status==='watching'; });
  if(active.length){ h+='<div><div style="font-size:11.5px;font-weight:800;color:var(--muted);margin-bottom:6px;letter-spacing:.3px;">İZLEDİĞİM YAPIM</div><div style="display:flex;gap:7px;flex-wrap:wrap;">'; active.forEach(function(t){ var on=ui.logItemId===t.id; h+='<button onclick="App.pickLogTitle(\''+esc(t.id)+'\')" style="border:1px solid '+(on?'var(--watch)':'var(--card-bd)')+';cursor:pointer;padding:7px 11px;border-radius:12px;font-size:12.5px;font-weight:700;color:'+(on?'#fff':'var(--text2)')+';background:'+(on?'linear-gradient(135deg,#C88F4C,#E0B080)':'var(--card)')+';display:flex;align-items:center;gap:5px;">'+t.emoji+' '+esc(t.title.length>18?t.title.slice(0,17)+'…':t.title)+'</button>'; }); h+='</div></div>'; }
  h+='<div style="display:flex;flex-direction:column;gap:10px;background:var(--card);border:1px solid var(--card-bd);border-radius:18px;padding:14px;">';
  h+='<div style="display:flex;gap:6px;">';
  h+='<button onclick="App.setWatchDraftKind(\'film\')" style="flex:1;border:1px solid '+(kind==='film'?'var(--watch)':'var(--field-bd)')+';cursor:pointer;padding:9px;border-radius:12px;font-size:13px;font-weight:800;color:'+(kind==='film'?'#fff':'var(--muted)')+';background:'+(kind==='film'?'linear-gradient(135deg,#C88F4C,#E0B080)':'var(--field)')+';">🎬 Film</button>';
  h+='<button onclick="App.setWatchDraftKind(\'dizi\')" style="flex:1;border:1px solid '+(kind==='dizi'?'var(--watch)':'var(--field-bd)')+';cursor:pointer;padding:9px;border-radius:12px;font-size:13px;font-weight:800;color:'+(kind==='dizi'?'#fff':'var(--muted)')+';background:'+(kind==='dizi'?'linear-gradient(135deg,#C88F4C,#E0B080)':'var(--field)')+';">📺 Dizi</button>';
  h+='</div>';
  h+='<div><div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:5px;">'+(kind==='dizi'?'Dizi adı':'Film adı')+'</div><input id="watch-title" type="text" value="'+esc(d.title||'')+'" oninput="App.onWatchField(\'title\',this)" placeholder="'+(kind==='dizi'?'örn. The Bear':'örn. Interstellar')+'" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:15px;outline:none;"></div>';
  h+='<div style="display:flex;gap:10px;">';
  if(kind==='dizi') h+='<div style="flex:1;"><div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:5px;">Bölüm</div><input type="number" inputmode="numeric" min="0" value="'+(d.episodes!=null&&d.episodes!==''?esc(d.episodes):'')+'" oninput="App.onWatchField(\'episodes\',this)" placeholder="2" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:15px;outline:none;text-align:center;"></div>';
  h+='<div style="flex:1;"><div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:5px;">Süre (dk)</div><input type="number" inputmode="numeric" min="0" value="'+(d.minutes!=null&&d.minutes!==''?esc(d.minutes):'')+'" oninput="App.onWatchField(\'minutes\',this)" placeholder="'+(kind==='dizi'?'45':'120')+'" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:15px;outline:none;text-align:center;"></div>';
  h+='</div>';
  h+='<div><div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:5px;">Not <span style="color:var(--faint);font-weight:500;">(isteğe bağlı)</span></div><textarea rows="2" oninput="App.onWatchField(\'note\',this)" placeholder="Aklında kalan sahne, duygu…" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:10px 12px;font-size:13.5px;outline:none;resize:none;line-height:1.45;">'+esc(d.note||'')+'</textarea></div>';
  h+='<button onclick="App.addWatching()" style="border:none;cursor:pointer;width:100%;padding:14px;border-radius:14px;font-size:15px;font-weight:800;color:#fff;background:linear-gradient(135deg,#C88F4C,#E0B080 55%,#E9AFC1);box-shadow:0 10px 24px rgba(200,143,76,0.38);">İzlemeyi kaydet 🎬</button>';
  h+='</div>';
  if(wEntries.length>0){
    h+='<div style="display:flex;flex-direction:column;gap:8px;">';
    h+='<div style="display:flex;align-items:center;justify-content:space-between;"><div style="font-size:12.5px;font-weight:800;color:var(--muted);letter-spacing:.3px;">BUGÜN ('+wEntries.length+')</div><div style="font-size:11.5px;color:var(--faint);">toplam '+fmtDur(totMin)+'</div></div>';
    wEntries.slice().reverse().forEach(function(e){ var meta=[]; if(e.kind==='dizi'&&e.episodes) meta.push(e.episodes+' bölüm'); if(e.minutes) meta.push(e.minutes+' dk'); var linked=e.itemId?findTitle(e.itemId):null; h+='<div style="display:flex;align-items:flex-start;gap:10px;background:var(--card);border:1px solid var(--card-bd);border-radius:14px;padding:11px 12px;"><span style="font-size:18px;line-height:1.2;">'+(linked?linked.emoji:(e.kind==='dizi'?'📺':'🎬'))+'</span><div style="flex:1;min-width:0;"><div style="font-size:13.5px;font-weight:700;color:var(--text);">'+esc(e.title||'(başlıksız)')+(linked?' <span style="font-size:10.5px;color:var(--watch);font-weight:700;">· arşivde</span>':'')+'</div>'+(meta.length?'<div style="font-size:11.5px;color:var(--muted);margin-top:2px;">'+meta.join(' · ')+'</div>':'')+(e.note?'<div style="font-size:12px;color:var(--text2);margin-top:4px;line-height:1.4;">'+esc(e.note)+'</div>':'')+'</div><button onclick="App.removeWatching(\''+esc(e.id)+'\')" aria-label="Sil" style="flex-shrink:0;border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:28px;height:28px;border-radius:8px;color:var(--faint);font-size:13px;">🗑️</button></div>'; });
    h+='</div>';
  } else {
    h+='<div style="text-align:center;font-size:12.5px;color:var(--faint);line-height:1.5;padding:4px 8px;">Henüz bugün için izleme eklemedin. Bir bölüm bile keyiftir 🍿</div>';
  }
  return h;
}
function titleCard(t){
  var pct=titlePct(t); var meta=[]; meta.push(t.kind==='dizi'?'Dizi':'Film'); if(t.genre) meta.push(esc(t.genre));
  var h='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:16px;padding:13px;display:flex;flex-direction:column;gap:9px;">';
  h+='<div style="display:flex;align-items:flex-start;gap:11px;"><div style="width:44px;height:44px;border-radius:12px;background:var(--icon);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;">'+t.emoji+'</div>';
  h+='<div style="flex:1;min-width:0;"><div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;"><span style="font-size:14.5px;font-weight:800;color:var(--text);">'+esc(t.title)+'</span>'+titleStatusChip(t.status)+'</div><div style="font-size:11.5px;color:var(--faint);margin-top:1px;">'+meta.join(' · ')+'</div></div>';
  h+='<button onclick="App.openTitleEdit(\''+esc(t.id)+'\')" aria-label="Düzenle" style="flex-shrink:0;border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:30px;height:30px;border-radius:9px;color:var(--muted);font-size:14px;">✏️</button></div>';
  if(t.status!=='finished'){
    if(t.kind==='dizi'){
      h+='<div style="display:flex;align-items:center;gap:9px;">';
      h+='<button onclick="App.advanceTitle(\''+esc(t.id)+'\',-1)" style="border:1px solid var(--field-bd);cursor:pointer;width:30px;height:30px;border-radius:9px;font-size:15px;font-weight:800;color:var(--muted);background:var(--card);flex-shrink:0;">−</button>';
      h+='<div style="flex:1;min-width:0;">'+progBar(pct,'linear-gradient(90deg,#C88F4C,#E9AFC1)')+'<div style="font-size:11px;color:var(--muted);margin-top:4px;display:flex;justify-content:space-between;"><span>'+t.watchedEp+(t.totalEp?' / '+t.totalEp+' bölüm':' bölüm')+'</span><span>%'+pct+'</span></div></div>';
      h+='<button onclick="App.advanceTitle(\''+esc(t.id)+'\',1)" style="border:1px solid var(--field-bd);cursor:pointer;width:30px;height:30px;border-radius:9px;font-size:15px;font-weight:800;color:var(--watch);background:var(--card);flex-shrink:0;">+</button>';
      h+='</div>';
    }
    h+='<div style="display:flex;gap:7px;"><button onclick="App.finishTitle(\''+esc(t.id)+'\')" style="flex:1;border:none;cursor:pointer;padding:9px;border-radius:11px;font-size:12.5px;font-weight:800;color:#fff;background:linear-gradient(135deg,#7DBE77,#5BA85B);">✓ Bitirdim</button>';
    if(t.status==='watching') h+='<button onclick="App.setTitleStatus(\''+esc(t.id)+'\',\'dropped\')" style="border:1px solid var(--field-bd);cursor:pointer;padding:9px 12px;border-radius:11px;font-size:12.5px;font-weight:700;color:var(--muted);background:var(--card);">Yarıda bıraktım</button>';
    else h+='<button onclick="App.setTitleStatus(\''+esc(t.id)+'\',\'watching\')" style="border:1px solid var(--field-bd);cursor:pointer;padding:9px 12px;border-radius:11px;font-size:12.5px;font-weight:700;color:var(--watch);background:var(--card);">Devam et</button>';
    h+='</div>';
  } else {
    h+='<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">'+starRow(t.rating,'App.rateTitle',t.id,17)+'<button onclick="App.reopenTitle(\''+esc(t.id)+'\')" style="border:1px solid var(--field-bd);cursor:pointer;padding:7px 12px;border-radius:11px;font-size:12px;font-weight:700;color:var(--watch);background:var(--card);">Yeniden izle</button></div>';
    if(t.finishedAt) h+='<div style="font-size:11px;color:var(--faint);">🎉 '+esc(shortDate(fmt(new Date(t.finishedAt))))+' tarihinde bitti</div>';
  }
  return h+'</div>';
}
function watchArchiveView(){
  var W=ensureWatchlist();
  var h='<button onclick="App.openTitleEdit(\'\')" style="border:1px dashed var(--watch);cursor:pointer;width:100%;padding:12px;border-radius:14px;font-size:13.5px;font-weight:800;color:var(--watch);background:rgba(224,176,128,0.10);">＋ Film / dizi ekle</button>';
  var order={watching:0,finished:1,dropped:2};
  var items=W.items.slice().sort(function(a,b){ return (order[a.status]-order[b.status])||String(b.createdAt||'').localeCompare(String(a.createdAt||'')); });
  if(!items.length){ h+='<div style="text-align:center;font-size:12.5px;color:var(--faint);line-height:1.6;padding:22px 10px;">Arşivin henüz boş 🎞️<br>İzlemeye başladığın yapımı ekle, ilerlemen burada birik.</div>'; return h; }
  var watching=items.filter(function(t){return t.status==='watching';}),finished=items.filter(function(t){return t.status==='finished';}),dropped=items.filter(function(t){return t.status==='dropped';});
  function sec(title,arr){ if(!arr.length) return ''; var s='<div style="font-size:11.5px;font-weight:800;color:var(--muted);letter-spacing:.3px;margin:4px 2px 0;">'+title+' ('+arr.length+')</div>'; arr.forEach(function(t){ s+=titleCard(t); }); return s; }
  h+='<div style="display:flex;flex-direction:column;gap:10px;">'+sec('İZLİYORUM',watching)+sec('BİTİRDİKLERİM',finished)+sec('YARIDA BIRAKTIKLARIM',dropped)+'</div>';
  return h;
}
function watchStatsView(){
  var W=ensureWatchlist(); var s=watchStats(); var t=watchTotals(); var streak=watchStreak(); var week=weekWatch();
  var goalY=(W.goal&&W.goal.yearlyTitles)||0; var goalMin=(W.goal&&W.goal.dailyMinutes)||0;
  var h='<div style="display:flex;gap:9px;">'+statTile('Bitirilen',s.finished,'yapım')+statTile('İzleniyor',s.watching)+statTile('Seri',streak,'gün 🔥')+'</div>';
  h+='<div style="display:flex;gap:9px;">'+statTile('Toplam süre',fmtDur(t.minutes))+statTile('Toplam bölüm',t.eps)+statTile('İzleme günü',t.days)+'</div>';
  h+='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:16px;padding:14px;"><div style="font-size:12.5px;font-weight:800;color:var(--muted);margin-bottom:10px;">Son 7 gün · dakika</div>'+miniBars(week,'minutes','dk','linear-gradient(180deg,#E0B080,#C88F4C)')+'</div>';
  h+='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:10px;"><div style="font-size:12.5px;font-weight:800;color:var(--muted);">🎯 Hedefler</div>';
  h+='<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:12.5px;color:var(--text2);flex:1;">Günlük dakika hedefi</span><input type="number" inputmode="numeric" min="0" value="'+(goalMin||'')+'" oninput="App.setWatchGoal(\'dailyMinutes\',this)" placeholder="40" style="width:74px;border:1px solid var(--field-bd);background:var(--field);border-radius:11px;padding:8px;font-size:14px;text-align:center;outline:none;"></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:12.5px;color:var(--text2);flex:1;">Bu yıl yapım hedefi</span><input type="number" inputmode="numeric" min="0" value="'+(goalY||'')+'" oninput="App.setWatchGoal(\'yearlyTitles\',this)" placeholder="30" style="width:74px;border:1px solid var(--field-bd);background:var(--field);border-radius:11px;padding:8px;font-size:14px;text-align:center;outline:none;"></div>';
  if(goalY>0){ var yp=Math.min(100,Math.round(s.finYear/goalY*100)); h+='<div>'+progBar(yp,'linear-gradient(90deg,#C88F4C,#E9AFC1)')+'<div style="font-size:11.5px;color:var(--muted);margin-top:5px;">'+new Date().getFullYear()+': '+s.finYear+'/'+goalY+' yapım · %'+yp+'</div></div>'; }
  h+='</div>';
  return h;
}
function watchQuotesView(){
  var qs=allReplicas(); var W=ensureWatchlist();
  var h='<button onclick="App.openReplicaAdd(\'\')" '+(W.items.length?'':'disabled ')+'style="border:1px dashed var(--watch);cursor:'+(W.items.length?'pointer':'not-allowed')+';width:100%;padding:12px;border-radius:14px;font-size:13.5px;font-weight:800;color:var(--watch);background:rgba(224,176,128,0.10);opacity:'+(W.items.length?'1':'0.5')+';">＋ Replik ekle</button>';
  if(!W.items.length){ h+='<div style="text-align:center;font-size:12.5px;color:var(--faint);line-height:1.6;padding:16px 10px;">Replik eklemek için önce arşivine bir yapım ekle 🎞️</div>'; return h; }
  if(!qs.length){ h+='<div style="text-align:center;font-size:12.5px;color:var(--faint);line-height:1.6;padding:22px 10px;">Henüz replik yok 💬<br>O unutamadığın repliği buraya bırak.</div>'; return h; }
  h+='<div style="display:flex;flex-direction:column;gap:10px;">';
  qs.forEach(function(o){ var q=o.q; h+='<div style="background:linear-gradient(135deg,rgba(200,143,76,0.08),rgba(233,175,193,0.09));border:1px solid var(--card-bd);border-radius:16px;padding:14px;position:relative;">'; h+='<div style="position:absolute;top:2px;right:12px;font-size:44px;color:var(--faint);opacity:0.25;line-height:1;">”</div>'; h+='<div style="font-size:14px;line-height:1.5;color:var(--text);font-style:italic;position:relative;">'+esc(q.text)+'</div>'; h+='<div style="display:flex;align-items:center;gap:8px;margin-top:9px;"><span style="font-size:11.5px;color:var(--muted);flex:1;">'+o.emoji+' '+esc(o.title)+'</span>'; h+='<button onclick="App.copyReplicaById(\''+esc(o.itemId)+'\',\''+esc(q.id)+'\')" style="border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:28px;height:28px;border-radius:8px;color:var(--muted);font-size:12px;">📋</button>'; h+='<button onclick="App.removeReplica(\''+esc(o.itemId)+'\',\''+esc(q.id)+'\')" style="border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:28px;height:28px;border-radius:8px;color:var(--faint);font-size:12px;">🗑️</button></div></div>'; });
  h+='</div>';
  return h;
}
function titleEditModal(){
  var t=ui.titleEdit; var isNew=!t.id; var kind=(t.kind==='dizi')?'dizi':'film';
  var inner='<div style="display:flex;justify-content:space-between;align-items:center;"><div style="font-size:17px;font-weight:800;">'+(isNew?'Yapım ekle 🎬':'Yapımı düzenle')+'</div><button onclick="App.closeTitleEdit()" style="border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:32px;height:32px;border-radius:50%;font-size:15px;color:var(--muted);">✕</button></div>';
  inner+='<div style="display:flex;gap:6px;"><button onclick="App.setTitleEditKind(\'film\')" style="flex:1;border:1px solid '+(kind==='film'?'var(--watch)':'var(--field-bd)')+';cursor:pointer;padding:9px;border-radius:12px;font-size:13px;font-weight:800;color:'+(kind==='film'?'#fff':'var(--muted)')+';background:'+(kind==='film'?'linear-gradient(135deg,#C88F4C,#E0B080)':'var(--field)')+';">🎬 Film</button><button onclick="App.setTitleEditKind(\'dizi\')" style="flex:1;border:1px solid '+(kind==='dizi'?'var(--watch)':'var(--field-bd)')+';cursor:pointer;padding:9px;border-radius:12px;font-size:13px;font-weight:800;color:'+(kind==='dizi'?'#fff':'var(--muted)')+';background:'+(kind==='dizi'?'linear-gradient(135deg,#C88F4C,#E0B080)':'var(--field)')+';">📺 Dizi</button></div>';
  inner+='<div style="display:flex;gap:6px;flex-wrap:wrap;">'; TITLE_EMOJI.forEach(function(e){ var on=t.emoji===e; inner+='<button onclick="App.pickTitleEmoji(\''+e+'\')" style="border:1px solid '+(on?'var(--watch)':'var(--card-bd)')+';cursor:pointer;width:38px;height:38px;border-radius:11px;font-size:19px;background:'+(on?'rgba(200,143,76,0.14)':'var(--card)')+';">'+e+'</button>'; }); inner+='</div>';
  inner+='<input type="text" value="'+esc(t.title||'')+'" oninput="App.onTitleEditField(\'title\',this)" placeholder="Yapım adı" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:15px;outline:none;">';
  inner+='<div style="display:flex;gap:6px;flex-wrap:wrap;">'; TITLE_GENRES.forEach(function(g){ var on=t.genre===g; inner+='<button onclick="App.pickTitleGenre(\''+g+'\')" style="border:1px solid '+(on?'var(--watch)':'var(--card-bd)')+';cursor:pointer;padding:6px 10px;border-radius:999px;font-size:11.5px;font-weight:700;color:'+(on?'#fff':'var(--muted)')+';background:'+(on?'linear-gradient(135deg,#C88F4C,#E0B080)':'var(--card)')+';">'+g+'</button>'; }); inner+='</div>';
  if(kind==='dizi') inner+='<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:12.5px;color:var(--text2);flex:1;">Toplam bölüm <span style="color:var(--faint);">(opsiyonel)</span></span><input type="number" inputmode="numeric" min="0" value="'+(t.totalEp!=null&&t.totalEp!==''?esc(t.totalEp):'')+'" oninput="App.onTitleEditField(\'totalEp\',this)" placeholder="—" style="width:90px;border:1px solid var(--field-bd);background:var(--field);border-radius:11px;padding:9px;font-size:14px;text-align:center;outline:none;"></div>';
  inner+='<button onclick="App.saveTitle()" style="border:none;cursor:pointer;width:100%;padding:13px;border-radius:13px;font-size:14.5px;font-weight:800;color:#fff;background:linear-gradient(135deg,#C88F4C,#E0B080 55%,#E9AFC1);">Kaydet</button>';
  if(!isNew) inner+='<button onclick="App.deleteTitle(\''+esc(t.id)+'\')" style="border:none;cursor:pointer;width:100%;padding:11px;border-radius:13px;font-size:13px;font-weight:700;color:#C0605F;background:rgba(220,120,120,0.1);">Yapımı sil</button>';
  return '<div onclick="App.closeTitleEdit()" style="position:fixed;inset:0;z-index:360;background:rgba(44,36,38,0.5);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:18px;animation:seyFade .2s ease;"><div onclick="event.stopPropagation()" style="width:100%;max-width:400px;background:var(--modal);border-radius:22px;padding:20px;display:flex;flex-direction:column;gap:12px;max-height:86vh;overflow-y:auto;animation:seyPop .22s ease;">'+inner+'</div></div>';
}
function replicaAddModal(){
  var q=ui.replicaDraft; var W=ensureWatchlist(); var items=W.items;
  var inner='<div style="display:flex;justify-content:space-between;align-items:center;"><div style="font-size:17px;font-weight:800;">Replik ekle 💬</div><button onclick="App.closeReplicaAdd()" style="border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:32px;height:32px;border-radius:50%;font-size:15px;color:var(--muted);">✕</button></div>';
  inner+='<div style="font-size:12px;font-weight:700;color:var(--muted);">Yapım</div><div style="display:flex;gap:6px;flex-wrap:wrap;">'; items.forEach(function(t){ var on=q.itemId===t.id; inner+='<button onclick="App.pickReplicaTitle(\''+esc(t.id)+'\')" style="border:1px solid '+(on?'var(--watch)':'var(--card-bd)')+';cursor:pointer;padding:7px 10px;border-radius:11px;font-size:12px;font-weight:700;color:'+(on?'#fff':'var(--muted)')+';background:'+(on?'linear-gradient(135deg,#C88F4C,#E0B080)':'var(--card)')+';">'+t.emoji+' '+esc(t.title.length>16?t.title.slice(0,15)+'…':t.title)+'</button>'; }); inner+='</div>';
  inner+='<textarea rows="3" oninput="App.onReplicaField(\'text\',this)" placeholder="O unutamadığın replik…" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:14px;outline:none;resize:none;line-height:1.5;">'+esc(q.text||'')+'</textarea>';
  inner+='<button onclick="App.saveReplica()" style="border:none;cursor:pointer;width:100%;padding:13px;border-radius:13px;font-size:14.5px;font-weight:800;color:#fff;background:linear-gradient(135deg,#C88F4C,#E0B080 55%,#E9AFC1);">Kaydet</button>';
  return '<div onclick="App.closeReplicaAdd()" style="position:fixed;inset:0;z-index:360;background:rgba(44,36,38,0.5);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:18px;animation:seyFade .2s ease;"><div onclick="event.stopPropagation()" style="width:100%;max-width:400px;background:var(--modal);border-radius:22px;padding:20px;display:flex;flex-direction:column;gap:11px;max-height:86vh;overflow-y:auto;animation:seyPop .22s ease;">'+inner+'</div></div>';
}

// ================= NE DİNLEDİM HUB (overlay) =================
var MUSIC_EMOJI=['🎵','💿','🎧','🎙️','🎸','🎹','🎤','🥁','🎻','🪕','🎺','🌙'];
var MUSIC_GENRES=['Pop','Rock','Türkçe','Rap','Elektronik','Caz','Klasik','Akustik','Podcast','Film müziği'];
var LISTEN_KINDS=[['sarki','🎵 Şarkı'],['album','💿 Albüm'],['podcast','🎙️ Podcast']];
function listenKindMeta(k){ return (k==='podcast')?{label:'Podcast',emoji:'🎙️'}:(k==='album')?{label:'Albüm',emoji:'💿'}:{label:'Şarkı',emoji:'🎵'}; }
function listeningOverlayHTML(){
  var view=ui.listeningView||'today';
  var head='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;"><div><div style="font-size:20px;font-weight:800;">Ne dinledim? 🎧</div><div style="font-size:12.5px;color:var(--faint);margin-top:3px;">Bugün dinlediklerin, favorilerin ve akılda kalan sözler.</div></div><button onclick="App.closeListening()" style="border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:34px;height:34px;border-radius:50%;font-size:16px;color:var(--muted);flex-shrink:0;">✕</button></div>';
  var tabs=segTabs([['today','Bugün'],['favs','🎵 Favoriler'],['stats','📊 İstatistik'],['lyrics','💬 Sözler']],view,'App.setListeningView','listen');
  var body='';
  if(view==='today') body=listeningTodayView();
  else if(view==='favs') body=listeningFavsView();
  else if(view==='stats') body=listeningStatsView();
  else if(view==='lyrics') body=listeningLyricsView();
  var h=overlayShell('App.closeListening()', head+tabs, body);
  if(ui.trackEdit) h+=trackEditModal();
  if(ui.lyricDraft) h+=lyricAddModal();
  return h;
}
function listeningTodayView(){
  var d=ui.listeningDraft||{title:'',artist:'',kind:'sarki',minutes:'',note:''};
  var kind=(['sarki','album','podcast'].indexOf(d.kind)>=0)?d.kind:'sarki';
  var day=getDay(data,todayStr(),dayIndexFor(todayStr()));
  var lEntries=(day&&day.listening&&Array.isArray(day.listening.entries))?day.listening.entries:[];
  var totMin=lEntries.reduce(function(a,e){ var m=Number(e&&e.minutes); return a+((!isNaN(m)&&m>0)?m:0); },0);
  var M=ensureMusic();
  var goalMin=(M.goal&&M.goal.dailyMinutes)||0;
  var h='';
  if(goalMin>0){ var gp=Math.min(100,Math.round(totMin/goalMin*100)); h+='<div style="display:flex;align-items:center;gap:13px;background:linear-gradient(135deg,rgba(14,154,167,0.10),rgba(233,175,193,0.12));border:1px solid var(--card-bd);border-radius:18px;padding:13px 15px;">'; h+='<div style="position:relative;width:52px;height:52px;flex-shrink:0;"><svg width="52" height="52" viewBox="0 0 52 52"><circle cx="26" cy="26" r="22" fill="none" stroke="rgba(150,110,120,0.16)" stroke-width="6"></circle><circle cx="26" cy="26" r="22" fill="none" stroke="#0E9AA7" stroke-width="6" stroke-linecap="round" stroke-dasharray="'+(2*Math.PI*22)+'" stroke-dashoffset="'+(2*Math.PI*22*(1-gp/100))+'" transform="rotate(-90 26 26)"></circle></svg><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;">'+gp+'%</div></div>'; h+='<div style="flex:1;min-width:0;"><div style="font-size:13.5px;font-weight:800;color:var(--text);">Günlük hedef · '+totMin+'/'+goalMin+' dk</div><div style="font-size:11.5px;color:var(--muted);line-height:1.35;">'+(totMin>=goalMin?'Bugünün müziği tamam 🎶':'Hedefe '+(goalMin-totMin)+' dk kaldı.')+'</div></div></div>'; }
  var favs=M.items;
  if(favs.length){ h+='<div><div style="font-size:11.5px;font-weight:800;color:var(--muted);margin-bottom:6px;letter-spacing:.3px;">FAVORİLERİMDEN</div><div style="display:flex;gap:7px;flex-wrap:wrap;">'; favs.slice(0,8).forEach(function(x){ var on=ui.logTrackId===x.id; h+='<button onclick="App.pickLogTrack(\''+esc(x.id)+'\')" style="border:1px solid '+(on?'var(--listen)':'var(--card-bd)')+';cursor:pointer;padding:7px 11px;border-radius:12px;font-size:12.5px;font-weight:700;color:'+(on?'#fff':'var(--text2)')+';background:'+(on?'linear-gradient(135deg,#0E9AA7,#2BC4C4)':'var(--card)')+';display:flex;align-items:center;gap:5px;">'+x.emoji+' '+esc(x.title.length>18?x.title.slice(0,17)+'…':x.title)+'</button>'; }); h+='</div></div>'; }
  h+='<div style="display:flex;flex-direction:column;gap:10px;background:var(--card);border:1px solid var(--card-bd);border-radius:18px;padding:14px;">';
  h+='<div style="display:flex;gap:6px;">';
  LISTEN_KINDS.forEach(function(kk){ var on=kind===kk[0]; h+='<button onclick="App.setListenDraftKind(\''+kk[0]+'\')" style="flex:1;border:1px solid '+(on?'var(--listen)':'var(--field-bd)')+';cursor:pointer;padding:9px 4px;border-radius:12px;font-size:12.5px;font-weight:800;color:'+(on?'#fff':'var(--muted)')+';background:'+(on?'linear-gradient(135deg,#0E9AA7,#2BC4C4)':'var(--field)')+';">'+kk[1]+'</button>'; });
  h+='</div>';
  var titleLabel=kind==='podcast'?'Bölüm / podcast adı':(kind==='album'?'Albüm adı':'Şarkı adı');
  var titlePh=kind==='podcast'?'örn. Söz Müzik #42':(kind==='album'?'örn. Random Access Memories':'örn. Bir Derdim Var');
  h+='<div><div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:5px;">'+titleLabel+'</div><input id="listening-title" type="text" value="'+esc(d.title||'')+'" oninput="App.onListeningField(\'title\',this)" placeholder="'+titlePh+'" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:15px;outline:none;"></div>';
  h+='<div style="display:flex;gap:10px;"><div style="flex:1;min-width:0;"><div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:5px;">'+(kind==='podcast'?'Yayıncı':'Sanatçı')+' <span style="color:var(--faint);font-weight:500;">(ops.)</span></div><input type="text" value="'+esc(d.artist||'')+'" oninput="App.onListeningField(\'artist\',this)" placeholder="'+(kind==='podcast'?'örn. Podbee':'örn. MFÖ')+'" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:14px;outline:none;"></div>';
  h+='<div style="width:104px;flex-shrink:0;"><div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:5px;">Süre (dk)</div><input type="number" inputmode="numeric" min="0" value="'+(d.minutes!=null&&d.minutes!==''?esc(d.minutes):'')+'" oninput="App.onListeningField(\'minutes\',this)" placeholder="'+(kind==='podcast'?'45':'20')+'" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:15px;outline:none;text-align:center;"></div></div>';
  h+='<div><div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:5px;">Not <span style="color:var(--faint);font-weight:500;">(isteğe bağlı)</span></div><textarea rows="2" oninput="App.onListeningField(\'note\',this)" placeholder="Ruh hâline nasıl dokundu…" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:10px 12px;font-size:13.5px;outline:none;resize:none;line-height:1.45;">'+esc(d.note||'')+'</textarea></div>';
  h+='<button onclick="App.addListening()" style="border:none;cursor:pointer;width:100%;padding:14px;border-radius:14px;font-size:15px;font-weight:800;color:#fff;background:linear-gradient(135deg,#0E9AA7,#2BC4C4 55%,#E9AFC1);box-shadow:0 10px 24px rgba(14,154,167,0.34);">Dinlemeyi kaydet 🎧</button>';
  h+='</div>';
  if(lEntries.length>0){
    h+='<div style="display:flex;flex-direction:column;gap:8px;">';
    h+='<div style="display:flex;align-items:center;justify-content:space-between;"><div style="font-size:12.5px;font-weight:800;color:var(--muted);letter-spacing:.3px;">BUGÜN ('+lEntries.length+')</div><div style="font-size:11.5px;color:var(--faint);">toplam '+fmtDur(totMin)+'</div></div>';
    lEntries.slice().reverse().forEach(function(e){ var meta=[]; var km=listenKindMeta(e.kind); meta.push(km.label); if(e.minutes) meta.push(e.minutes+' dk'); var linked=e.itemId?findTrack(e.itemId):null; h+='<div style="display:flex;align-items:flex-start;gap:10px;background:var(--card);border:1px solid var(--card-bd);border-radius:14px;padding:11px 12px;"><span style="font-size:18px;line-height:1.2;">'+(linked?linked.emoji:km.emoji)+'</span><div style="flex:1;min-width:0;"><div style="font-size:13.5px;font-weight:700;color:var(--text);">'+esc(e.title||'(başlıksız)')+(linked?' <span style="font-size:10.5px;color:var(--listen);font-weight:700;">· favori</span>':'')+'</div>'+(e.artist?'<div style="font-size:11.5px;color:var(--faint);">'+esc(e.artist)+'</div>':'')+'<div style="font-size:11.5px;color:var(--muted);margin-top:2px;">'+meta.join(' · ')+'</div>'+(e.note?'<div style="font-size:12px;color:var(--text2);margin-top:4px;line-height:1.4;">'+esc(e.note)+'</div>':'')+'</div><button onclick="App.removeListening(\''+esc(e.id)+'\')" aria-label="Sil" style="flex-shrink:0;border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:28px;height:28px;border-radius:8px;color:var(--faint);font-size:13px;">🗑️</button></div>'; });
    h+='</div>';
  } else {
    h+='<div style="text-align:center;font-size:12.5px;color:var(--faint);line-height:1.5;padding:4px 8px;">Henüz bugün için dinleme eklemedin. Bir şarkı bile sayılır 🎶</div>';
  }
  return h;
}
function trackCard(x){
  var km=listenKindMeta(x.kind); var meta=[km.label]; if(x.artist) meta.push(esc(x.artist)); if(x.genre) meta.push(esc(x.genre));
  var h='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:16px;padding:13px;display:flex;flex-direction:column;gap:9px;">';
  h+='<div style="display:flex;align-items:flex-start;gap:11px;"><div style="width:44px;height:44px;border-radius:12px;background:var(--icon);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;">'+x.emoji+'</div>';
  h+='<div style="flex:1;min-width:0;"><div style="font-size:14.5px;font-weight:800;color:var(--text);">'+esc(x.title)+'</div><div style="font-size:11.5px;color:var(--faint);margin-top:1px;">'+meta.join(' · ')+'</div></div>';
  h+='<button onclick="App.openTrackEdit(\''+esc(x.id)+'\')" aria-label="Düzenle" style="flex-shrink:0;border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:30px;height:30px;border-radius:9px;color:var(--muted);font-size:14px;">✏️</button></div>';
  h+=starRow(x.rating,'App.rateTrack',x.id,17);
  return h+'</div>';
}
function listeningFavsView(){
  var M=ensureMusic();
  var h='<button onclick="App.openTrackEdit(\'\')" style="border:1px dashed var(--listen);cursor:pointer;width:100%;padding:12px;border-radius:14px;font-size:13.5px;font-weight:800;color:var(--listen);background:rgba(14,154,167,0.08);">＋ Favori ekle</button>';
  var items=M.items.slice().sort(function(a,b){ return String(b.createdAt||'').localeCompare(String(a.createdAt||'')); });
  if(!items.length){ h+='<div style="text-align:center;font-size:12.5px;color:var(--faint);line-height:1.6;padding:22px 10px;">Favori listen henüz boş 🎵<br>Sevdiğin şarkı, albüm ya da podcast’i ekle; burada birer birer birikssin.</div>'; return h; }
  function sec(title,arr){ if(!arr.length) return ''; var s='<div style="font-size:11.5px;font-weight:800;color:var(--muted);letter-spacing:.3px;margin:4px 2px 0;">'+title+' ('+arr.length+')</div>'; arr.forEach(function(x){ s+=trackCard(x); }); return s; }
  var sarki=items.filter(function(x){return x.kind==='sarki';}),album=items.filter(function(x){return x.kind==='album';}),pod=items.filter(function(x){return x.kind==='podcast';});
  h+='<div style="display:flex;flex-direction:column;gap:10px;">'+sec('ŞARKILAR',sarki)+sec('ALBÜMLER',album)+sec('PODCASTLER',pod)+'</div>';
  return h;
}
function listeningStatsView(){
  var M=ensureMusic(); var s=musicStats(); var t=listenTotals(); var streak=listenStreak(); var week=weekListen();
  var goalMin=(M.goal&&M.goal.dailyMinutes)||0;
  var h='<div style="display:flex;gap:9px;">'+statTile('Favori',s.total,'parça')+statTile('Dinleme günü',t.days)+statTile('Seri',streak,'gün 🔥')+'</div>';
  h+='<div style="display:flex;gap:9px;">'+statTile('Toplam süre',fmtDur(t.minutes))+statTile('Kayıt',t.items)+statTile('Podcast',s.podcast)+'</div>';
  h+='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:16px;padding:14px;"><div style="font-size:12.5px;font-weight:800;color:var(--muted);margin-bottom:10px;">Son 7 gün · dakika</div>'+miniBars(week,'minutes','dk','linear-gradient(180deg,#2BC4C4,#0E9AA7)')+'</div>';
  h+='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:10px;"><div style="font-size:12.5px;font-weight:800;color:var(--muted);">🎯 Hedef</div>';
  h+='<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:12.5px;color:var(--text2);flex:1;">Günlük dinleme hedefi (dk)</span><input type="number" inputmode="numeric" min="0" value="'+(goalMin||'')+'" oninput="App.setListenGoal(\'dailyMinutes\',this)" placeholder="30" style="width:74px;border:1px solid var(--field-bd);background:var(--field);border-radius:11px;padding:8px;font-size:14px;text-align:center;outline:none;"></div>';
  h+='</div>';
  return h;
}
function listeningLyricsView(){
  var qs=allLyrics(); var M=ensureMusic();
  var h='<button onclick="App.openLyricAdd(\'\')" '+(M.items.length?'':'disabled ')+'style="border:1px dashed var(--listen);cursor:'+(M.items.length?'pointer':'not-allowed')+';width:100%;padding:12px;border-radius:14px;font-size:13.5px;font-weight:800;color:var(--listen);background:rgba(14,154,167,0.08);opacity:'+(M.items.length?'1':'0.5')+';">＋ Söz ekle</button>';
  if(!M.items.length){ h+='<div style="text-align:center;font-size:12.5px;color:var(--faint);line-height:1.6;padding:16px 10px;">Söz eklemek için önce favorilerine bir parça ekle 🎵</div>'; return h; }
  if(!qs.length){ h+='<div style="text-align:center;font-size:12.5px;color:var(--faint);line-height:1.6;padding:22px 10px;">Henüz söz yok 💬<br>İçine işleyen o dizeyi buraya bırak.</div>'; return h; }
  h+='<div style="display:flex;flex-direction:column;gap:10px;">';
  qs.forEach(function(o){ var q=o.q; h+='<div style="background:linear-gradient(135deg,rgba(14,154,167,0.08),rgba(233,175,193,0.09));border:1px solid var(--card-bd);border-radius:16px;padding:14px;position:relative;">'; h+='<div style="position:absolute;top:2px;right:12px;font-size:44px;color:var(--faint);opacity:0.25;line-height:1;">”</div>'; h+='<div style="font-size:14px;line-height:1.5;color:var(--text);font-style:italic;position:relative;">'+esc(q.text)+'</div>'; h+='<div style="display:flex;align-items:center;gap:8px;margin-top:9px;"><span style="font-size:11.5px;color:var(--muted);flex:1;">'+o.emoji+' '+esc(o.title)+(o.artist?' · '+esc(o.artist):'')+'</span>'; h+='<button onclick="App.copyLyricById(\''+esc(o.itemId)+'\',\''+esc(q.id)+'\')" style="border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:28px;height:28px;border-radius:8px;color:var(--muted);font-size:12px;">📋</button>'; h+='<button onclick="App.removeLyric(\''+esc(o.itemId)+'\',\''+esc(q.id)+'\')" style="border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:28px;height:28px;border-radius:8px;color:var(--faint);font-size:12px;">🗑️</button></div></div>'; });
  h+='</div>';
  return h;
}
function trackEditModal(){
  var x=ui.trackEdit; var isNew=!x.id; var kind=(['sarki','album','podcast'].indexOf(x.kind)>=0)?x.kind:'sarki';
  var inner='<div style="display:flex;justify-content:space-between;align-items:center;"><div style="font-size:17px;font-weight:800;">'+(isNew?'Favori ekle 🎵':'Favoriyi düzenle')+'</div><button onclick="App.closeTrackEdit()" style="border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:32px;height:32px;border-radius:50%;font-size:15px;color:var(--muted);">✕</button></div>';
  inner+='<div style="display:flex;gap:6px;">'; LISTEN_KINDS.forEach(function(kk){ var on=kind===kk[0]; inner+='<button onclick="App.setTrackEditKind(\''+kk[0]+'\')" style="flex:1;border:1px solid '+(on?'var(--listen)':'var(--field-bd)')+';cursor:pointer;padding:9px 4px;border-radius:12px;font-size:12.5px;font-weight:800;color:'+(on?'#fff':'var(--muted)')+';background:'+(on?'linear-gradient(135deg,#0E9AA7,#2BC4C4)':'var(--field)')+';">'+kk[1]+'</button>'; }); inner+='</div>';
  inner+='<div style="display:flex;gap:6px;flex-wrap:wrap;">'; MUSIC_EMOJI.forEach(function(e){ var on=x.emoji===e; inner+='<button onclick="App.pickTrackEmoji(\''+e+'\')" style="border:1px solid '+(on?'var(--listen)':'var(--card-bd)')+';cursor:pointer;width:38px;height:38px;border-radius:11px;font-size:19px;background:'+(on?'rgba(14,154,167,0.14)':'var(--card)')+';">'+e+'</button>'; }); inner+='</div>';
  inner+='<input type="text" value="'+esc(x.title||'')+'" oninput="App.onTrackEditField(\'title\',this)" placeholder="Ad (şarkı / albüm / podcast)" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:15px;outline:none;">';
  inner+='<input type="text" value="'+esc(x.artist||'')+'" oninput="App.onTrackEditField(\'artist\',this)" placeholder="Sanatçı / yayıncı" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:14px;outline:none;">';
  inner+='<div style="display:flex;gap:6px;flex-wrap:wrap;">'; MUSIC_GENRES.forEach(function(g){ var on=x.genre===g; inner+='<button onclick="App.pickTrackGenre(\''+esc(g)+'\')" style="border:1px solid '+(on?'var(--listen)':'var(--card-bd)')+';cursor:pointer;padding:6px 10px;border-radius:999px;font-size:11.5px;font-weight:700;color:'+(on?'#fff':'var(--muted)')+';background:'+(on?'linear-gradient(135deg,#0E9AA7,#2BC4C4)':'var(--card)')+';">'+esc(g)+'</button>'; }); inner+='</div>';
  inner+='<button onclick="App.saveTrack()" style="border:none;cursor:pointer;width:100%;padding:13px;border-radius:13px;font-size:15px;font-weight:800;color:#fff;background:linear-gradient(135deg,#0E9AA7,#2BC4C4);">Kaydet</button>';
  if(!isNew) inner+='<button onclick="App.deleteTrack(\''+esc(x.id)+'\')" style="border:1px solid var(--field-bd);cursor:pointer;width:100%;padding:11px;border-radius:13px;font-size:13px;font-weight:700;color:var(--drop);background:var(--card);">Sil</button>';
  return '<div onclick="App.closeTrackEdit()" style="position:fixed;inset:0;z-index:360;background:rgba(44,36,38,0.5);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:18px;animation:seyFade .2s ease;"><div onclick="event.stopPropagation()" style="width:100%;max-width:400px;background:var(--modal);border-radius:22px;padding:20px;display:flex;flex-direction:column;gap:11px;max-height:86vh;overflow-y:auto;animation:seyPop .22s ease;">'+inner+'</div></div>';
}
function lyricAddModal(){
  var M=ensureMusic(); var dr=ui.lyricDraft||{itemId:'',text:''};
  var inner='<div style="display:flex;justify-content:space-between;align-items:center;"><div style="font-size:17px;font-weight:800;">Söz ekle 💬</div><button onclick="App.closeLyricAdd()" style="border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:32px;height:32px;border-radius:50%;font-size:15px;color:var(--muted);">✕</button></div>';
  inner+='<div style="font-size:12px;font-weight:700;color:var(--muted);">Parça</div><div style="display:flex;gap:6px;flex-wrap:wrap;">'; M.items.forEach(function(x){ var on=dr.itemId===x.id; inner+='<button onclick="App.pickLyricTrack(\''+esc(x.id)+'\')" style="border:1px solid '+(on?'var(--listen)':'var(--card-bd)')+';cursor:pointer;padding:7px 10px;border-radius:11px;font-size:12px;font-weight:700;color:'+(on?'#fff':'var(--muted)')+';background:'+(on?'linear-gradient(135deg,#0E9AA7,#2BC4C4)':'var(--card)')+';">'+x.emoji+' '+esc(x.title.length>16?x.title.slice(0,15)+'…':x.title)+'</button>'; }); inner+='</div>';
  inner+='<textarea rows="4" oninput="App.onLyricField(\'text\',this)" placeholder="İçine işleyen o dize…" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:14px;outline:none;resize:none;line-height:1.5;">'+esc(dr.text||'')+'</textarea>';
  inner+='<button onclick="App.saveLyric()" style="border:none;cursor:pointer;width:100%;padding:13px;border-radius:13px;font-size:14.5px;font-weight:800;color:#fff;background:linear-gradient(135deg,#0E9AA7,#2BC4C4 55%,#E9AFC1);">Kaydet 💬</button>';
  return '<div onclick="App.closeLyricAdd()" style="position:fixed;inset:0;z-index:360;background:rgba(44,36,38,0.5);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:18px;animation:seyFade .2s ease;"><div onclick="event.stopPropagation()" style="width:100%;max-width:400px;background:var(--modal);border-radius:22px;padding:20px;display:flex;flex-direction:column;gap:11px;max-height:86vh;overflow-y:auto;animation:seyPop .22s ease;">'+inner+'</div></div>';
}

function modalsHTML(){
  var h='';
  if(ui.readingOpen){ h+=readingOverlayHTML(); }
  if(ui.watchOpen){ h+=watchOverlayHTML(); }
  if(ui.listeningOpen){ h+=listeningOverlayHTML(); }
  if(ui.emergency){
    h+='<div onclick="App.closeEmergency()" style="position:fixed;inset:0;z-index:300;background:rgba(44,36,38,0.4);backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;padding:18px;animation:seyFade .2s ease;">';
    h+='<div onclick="event.stopPropagation()" style="width:100%;max-width:420px;background:var(--modal);border-radius:26px;padding:24px;box-shadow:0 -10px 40px rgba(0,0,0,0.2);animation:seyPop .25s ease;"><div style="font-size:21px;font-weight:800;margin-bottom:12px;">Dramatize etmiyoruz.</div><p style="margin:0 0 18px;font-size:15.5px;line-height:1.6;color:var(--text2);">Olur Sevgili Günışığı. Bir gün dağıldı diye 21 gün çöpe gitmez. Şimdi sadece bir bardak su iç, sonraki öğünde normale dön. Tatlı mahkemesi kurulmadı, hayat devam ediyor.</p><div style="display:flex;flex-direction:column;gap:10px;"><button onclick="App.continueEmergency()" style="border:none;cursor:pointer;width:100%;padding:15px;border-radius:16px;font-size:16px;font-weight:700;color:#fff;background:linear-gradient(135deg,#E9AFC1,#C9B8FF);">Tamam, devam ✨</button><button onclick="App.emergencyNote()" style="border:1px solid var(--field-bd);cursor:pointer;width:100%;padding:15px;border-radius:16px;font-size:15px;font-weight:600;color:var(--muted);background:transparent;">Bugüne minicik not düş</button></div></div></div>';
  }
  if(ui.dayDetail){
    var d=ui.dayDetail;
    h+='<div onclick="App.closeDetail()" style="position:fixed;inset:0;z-index:300;background:rgba(44,36,38,0.4);backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;padding:18px;animation:seyFade .2s ease;">';
    h+='<div onclick="event.stopPropagation()" style="width:100%;max-width:420px;background:var(--modal);border-radius:26px;padding:22px;box-shadow:0 -10px 40px rgba(0,0,0,0.2);animation:seyPop .25s ease;max-height:80vh;overflow-y:auto;">';
    h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;"><div><div style="font-size:20px;font-weight:800;">'+esc(d.title)+'</div><div style="font-size:13px;color:var(--faint);margin-top:2px;">'+esc(d.dateLabel)+' \u00b7 '+esc(d.status)+'</div></div><button onclick="App.closeDetail()" style="border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:34px;height:34px;border-radius:50%;font-size:16px;color:var(--muted);">\u2715</button></div>';
    h+='<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px;">';
    d.habits.forEach(function(hb){ h+='<div style="display:flex;align-items:center;gap:10px;font-size:14.5px;"><span style="font-size:17px;">'+hb.mark+'</span><span style="color:var(--text2);">'+esc(hb.label)+'</span></div>'; });
    h+='</div><div style="display:flex;gap:14px;font-size:14px;color:var(--muted);border-top:1px solid rgba(150,110,120,0.15);padding-top:12px;flex-wrap:wrap;"><span>Mod: <b>'+esc(d.moodLabel)+'</b></span><span>Tatlı SOS: <b>'+d.sosCount+'</b></span></div>';
    var hl=[]; if(d.steps!=null) hl.push('🚶‍♀️ '+d.steps+' adım'); if(d.mins!=null) hl.push('⏱️ '+d.mins+' dk'); if(d.sleepH!=null) hl.push('😴 '+d.sleepH+' sa'); if(d.flow) hl.push('🩸 '+d.flow);
    if(hl.length) h+='<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;">'+hl.map(function(x){return '<span style="font-size:12.5px;background:var(--icon);border:1px solid var(--card-bd);border-radius:999px;padding:5px 11px;color:var(--text2);">'+esc(x)+'</span>';}).join('')+'</div>';
    if(d.syms&&d.syms.length) h+='<div style="margin-top:8px;font-size:12.5px;color:var(--muted);">Belirti: '+esc(d.syms.join(' · '))+'</div>';
    if(d.meals&&d.meals.length){ h+='<div style="margin-top:12px;border-top:1px solid rgba(150,110,120,0.15);padding-top:10px;display:flex;flex-direction:column;gap:6px;">'; d.meals.forEach(function(m){ h+='<div style="font-size:13.5px;line-height:1.4;"><span>'+m.icon+'</span> <b style="color:var(--text2);">'+esc(m.label)+':</b> <span style="color:var(--muted);">'+esc(m.text)+'</span></div>'; }); h+='</div>'; }
    if(d.hasIntention) h+='<div style="margin-top:12px;font-size:14px;line-height:1.5;color:var(--text2);background:linear-gradient(160deg,rgba(255,225,154,0.24),rgba(201,184,255,0.14));border-radius:14px;padding:12px;">🎯 <b>Niyet:</b> '+esc(d.intention)+'</div>';
    if(d.hasNote) h+='<div style="margin-top:12px;font-size:14px;line-height:1.5;color:var(--text2);background:rgba(255,232,163,0.28);border-radius:14px;padding:12px;">'+esc(d.note)+'</div>';
    if(d.gratitude&&d.gratitude.length){ h+='<div style="margin-top:12px;border-top:1px solid rgba(150,110,120,0.15);padding-top:12px;"><div style="font-size:12.5px;font-weight:700;color:var(--muted);margin-bottom:6px;">🙏 O günün güzel şeyleri</div><div style="display:flex;flex-direction:column;gap:5px;">'+d.gratitude.map(function(g,i){return '<div style="font-size:13.5px;line-height:1.45;color:var(--text2);">'+(i+1)+'. '+esc(String(g).trim())+'</div>';}).join('')+'</div></div>'; }
    var isTod=!!d.isToday;
    h+='<button onclick="App.editDay(\''+d.date+'\')" style="margin-top:16px;border:none;cursor:pointer;width:100%;padding:14px;border-radius:16px;font-size:15px;font-weight:800;color:#fff;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#E9A23C,#E9899F);box-shadow:0 10px 24px rgba(233,150,90,0.38);">'+(isTod?'Bugüne git ☀️':'✏️ Bu günü düzenle')+'</button>';
    if(!isTod) h+='<div style="margin-top:8px;font-size:11.5px;color:var(--faint);line-height:1.45;text-align:center;">Geçmiş günü düzenlerken üstte uyarı görürsün; işin bitince “Bugüne dön”e bas. Konum, oturum ve canlı veriler her zaman bugüne yazılır.</div>';
    h+='</div></div>';
  }
  if(ui.locationConsent){
    h+='<div onclick="App.cancelLocationConsent()" style="position:fixed;inset:0;z-index:300;background:rgba(44,36,38,0.4);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:24px;animation:seyFade .2s ease;">';
    h+='<div onclick="event.stopPropagation()" style="width:100%;max-width:380px;background:var(--modal);border-radius:24px;padding:24px;box-shadow:0 20px 50px rgba(0,0,0,0.25);animation:seyPop .25s ease;">';
    h+='<div style="font-size:19px;font-weight:800;margin-bottom:8px;display:flex;align-items:center;gap:8px;">📍 Konum paylaşımı</div>';
    h+='<p style="margin:0 0 14px;font-size:14px;line-height:1.55;color:var(--muted);">Açarsan konumun ve hareketlerin (yürüyüş/araç, kat edilen mesafe) <b>uygulama açıkken</b> ölçülür.</p>';
    h+='<p style="margin:0 0 18px;font-size:13px;line-height:1.5;color:var(--faint);">Devam edince tarayıcın ayrıca konum izni isteyecek.</p>';
    h+='<div style="display:flex;gap:10px;"><button onclick="App.cancelLocationConsent()" style="flex:1;border:1px solid var(--field-bd);cursor:pointer;padding:14px;border-radius:14px;font-size:15px;font-weight:600;color:var(--text2);background:transparent;">Vazgeç</button><button onclick="App.confirmLocationConsent()" style="flex:1;border:none;cursor:pointer;padding:14px;border-radius:14px;font-size:15px;font-weight:700;color:#fff;background:linear-gradient(135deg,#8FBF8A,#6FB36A);">Onaylıyorum</button></div>';
    h+='</div></div>';
  }
  if(ui.locNudgeOpen){
    var lnB=(ui.locNudgeShown&&ui.locNudgeShown.length)?ui.locNudgeShown:[LOC_BENEFITS[0]];
    h+='<div onclick="App.locNudgeDismiss()" style="position:fixed;inset:0;z-index:300;background:rgba(44,36,38,0.4);backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;padding:18px;animation:seyFade .2s ease;">';
    h+='<div onclick="event.stopPropagation()" style="width:100%;max-width:420px;background:var(--modal);border-radius:26px;padding:22px;box-shadow:0 -10px 40px rgba(0,0,0,0.2);animation:seyPop .25s ease;">';
    h+='<div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:2px;">';
    h+='<div style="flex-shrink:0;width:46px;height:46px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:24px;background:linear-gradient(135deg,#DFF5DA,#C9E8C4);box-shadow:0 6px 16px rgba(125,190,119,0.35);">📍</div>';
    h+='<div style="flex:1;min-width:0;"><div style="font-size:18.5px;font-weight:800;line-height:1.25;">Hareketini görünür kılalım mı?</div><div style="font-size:12.5px;color:var(--faint);margin-top:2px;">Küçük bir dokunuş, sağlığına iyi gelir 🌿</div></div>';
    h+='<button onclick="App.locNudgeDismiss()" aria-label="Kapat" style="flex-shrink:0;border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:32px;height:32px;border-radius:50%;font-size:15px;color:var(--muted);line-height:1;">✕</button>';
    h+='</div>';
    h+='<div style="display:flex;flex-direction:column;gap:9px;margin:14px 0 16px;">';
    lnB.forEach(function(b){ h+='<div style="display:flex;gap:10px;align-items:flex-start;background:var(--icon);border:1px solid var(--card-bd);border-radius:14px;padding:11px 12px;"><span style="font-size:19px;line-height:1.15;flex-shrink:0;">'+b.i+'</span><span style="font-size:13.5px;line-height:1.5;color:var(--text2);">'+esc(b.t)+'</span></div>'; });
    h+='</div>';
    h+='<button onclick="App.locNudgeOpenConsent()" style="border:none;cursor:pointer;width:100%;padding:15px;border-radius:16px;font-size:15.5px;font-weight:800;color:#fff;background:linear-gradient(135deg,#8FBF8A,#6FB36A);box-shadow:0 10px 24px rgba(111,179,106,0.4);display:flex;align-items:center;justify-content:center;gap:8px;">Konumu aç ✨</button>';
    h+='<button onclick="App.locNudgeSnooze()" style="margin-top:9px;border:1px solid var(--field-bd);cursor:pointer;width:100%;padding:13px;border-radius:14px;font-size:14.5px;font-weight:700;color:var(--text2);background:transparent;">Belki sonra</button>';
    h+='<div style="text-align:center;margin-top:10px;"><button onclick="App.locNudgeOptOut()" style="border:none;background:none;cursor:pointer;color:var(--faint);font-size:12px;font-weight:600;text-decoration:underline;">Bugün gösterme</button></div>';
    h+='<div style="margin-top:10px;font-size:11px;color:var(--faint);line-height:1.45;text-align:center;">Ölçüm yalnızca uygulama açıkken yapılır; dilediğinde kapatırsın.</div>';
    h+='</div></div>';
  }
  if(ui.resetStep>0){
    var two=ui.resetStep===2;
    h+='<div onclick="App.cancelReset()" style="position:fixed;inset:0;z-index:300;background:rgba(44,36,38,0.4);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:24px;animation:seyFade .2s ease;">';
    h+='<div onclick="event.stopPropagation()" style="width:100%;max-width:380px;background:var(--modal);border-radius:24px;padding:24px;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,0.25);animation:seyPop .25s ease;"><div style="font-size:19px;font-weight:800;margin-bottom:8px;">'+(two?'Son adım':'Emin misin?')+'</div><p style="margin:0 0 18px;font-size:14.5px;line-height:1.5;color:var(--muted);">'+(two?'Tüm günlük kayıtların kalıcı olarak silinecek.':'Bu işlem günlük kayıtlarını siler.')+'</p><div style="display:flex;gap:10px;"><button onclick="App.cancelReset()" style="flex:1;border:1px solid var(--field-bd);cursor:pointer;padding:14px;border-radius:14px;font-size:15px;font-weight:600;color:var(--text2);background:transparent;">Vazgeç</button><button onclick="App.resetConfirm()" style="flex:1;border:none;cursor:pointer;padding:14px;border-radius:14px;font-size:15px;font-weight:700;color:#fff;background:#C0605F;">'+(two?'Evet, sıfırla':'Devam et')+'</button></div></div></div>';
  }
  return h;
}

// boot
if(data){ data.lastOpenedDate=todayStr(); data.lastOpenedAt=new Date().toISOString(); save(); }
window.App=App;

// ---------- konum & hareket takibi (yalnızca kullanıcı açık rıza verdiyse) ----------
// Web/PWA arka planda izleyemez; ölçüm yalnızca uygulama açık ve ön plandayken yapılır.
var moveState={watchId:null,lastFix:null,smoothSpeed:0,autoMode:null,distSinceSync:0,lastSyncTs:0};

function haversineM(a,b){
  var R=6371000, toRad=Math.PI/180;
  var dLat=(b.lat-a.lat)*toRad, dLng=(b.lng-a.lng)*toRad;
  var la1=a.lat*toRad, la2=b.lat*toRad;
  var s=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(la1)*Math.cos(la2)*Math.sin(dLng/2)*Math.sin(dLng/2);
  return 2*R*Math.asin(Math.min(1,Math.sqrt(s)));
}
function autoModeLabel(){ return moveState.autoMode==='vehicle'?'🚗 Araç':moveState.autoMode==='walk'?'🚶 Yürüyüş':'algılanıyor…'; }
function saveLocal(){ try{ localStorage.setItem(KEY,JSON.stringify(data)); }catch(e){} }
function scheduleMoveSync(){ if(window.SeySync){ try{ window.SeySync.schedule(data); }catch(e){} } moveState.distSinceSync=0; moveState.lastSyncTs=Date.now(); }
function maybeSyncMovement(){ if((Date.now()-moveState.lastSyncTs)>=90000 || moveState.distSinceSync>=100) scheduleMoveSync(); }
function downsampleTrack(arr,max){ if(arr.length<=max) return arr; var out=[],step=arr.length/max; for(var i=0;i<max;i++) out.push(arr[Math.floor(i*step)]); out[out.length-1]=arr[arr.length-1]; return out; }
function markLatestLocation(fix){
  data.location={lat:fix.lat,lng:fix.lng,acc:fix.acc,ts:new Date(fix.ts).toISOString()};
  data.locationLastTs=data.location.ts;
  if(!Array.isArray(data.locationHistory)) data.locationHistory=[];
  data.locationHistory.push(data.location);
  if(data.locationHistory.length>60) data.locationHistory=data.locationHistory.slice(-60);
}
function onLocationFix(pos){
  if(!data || !data.settings || !data.settings.locationEnabled) return;
  var acc=Math.round(pos.coords.accuracy||0);
  var fix={lat:pos.coords.latitude,lng:pos.coords.longitude,acc:acc,ts:Date.now(),spd:(typeof pos.coords.speed==='number'&&pos.coords.speed>=0)?pos.coords.speed:null};
  var prev=moveState.lastFix;
  var usable=!(acc>0 && acc>50); // doğruluk kapısı
  if(prev && usable){
    var dt=(fix.ts-prev.ts)/1000;
    if(dt>=1){
      var dist=haversineM(prev,fix);
      var inst=fix.spd!=null?fix.spd:(dist/dt);
      if(inst<=83){ // <=300 km/h makuliyet
        var minMove=Math.max(8, acc*0.5);
        if(dist>=minMove){
          moveState.smoothSpeed=moveState.smoothSpeed*0.6+inst*0.4;
          var mode=data.settings.locationMode||'auto', useMode;
          if(mode==='walk') useMode='walk';
          else if(mode==='vehicle') useMode='vehicle';
          else { var sp=moveState.smoothSpeed; if(sp>4.2||inst>6) moveState.autoMode='vehicle'; else if(sp<2.5) moveState.autoMode='walk'; useMode=moveState.autoMode||(inst>6?'vehicle':'walk'); }
          var rec=getDay(data,todayStr(),dayIndexFor(todayStr()));
          if(!rec.movement) rec.movement=emptyMovement();
          rec.movement.totalM+=dist;
          if(useMode==='vehicle') rec.movement.vehicleM+=dist; else rec.movement.walkM+=dist;
          var addSec=Math.min(dt,30);
          if(useMode==='vehicle') rec.movement.vehicleSec=(rec.movement.vehicleSec||0)+addSec; else rec.movement.walkSec=(rec.movement.walkSec||0)+addSec;
          if(useMode!=='vehicle' && !(rec.walk&&rec.walk.steps!=null&&rec.walk.steps!=='') && rec.habits && !rec.habits.walked20 && trackedSteps(rec)>=STEP_TICK_MIN){ rec.habits.walked20=true; }
          rec.movement.samples++;
          if(inst>rec.movement.maxSpeed) rec.movement.maxSpeed=inst;
          rec.movement.track.push({lat:fix.lat,lng:fix.lng,ts:new Date(fix.ts).toISOString(),mode:useMode});
          if(rec.movement.track.length>200) rec.movement.track=downsampleTrack(rec.movement.track,200);
          moveState.distSinceSync+=dist;
          markLatestLocation(fix);
          moveState.lastFix=fix;
          saveLocal(); maybeSyncMovement(); updateMovementUI();
          return;
        } else {
          // eşik altı: sabit say, drift biriktirme; zaman referansını ilerlet
          moveState.smoothSpeed*=0.6;
          moveState.lastFix={lat:prev.lat,lng:prev.lng,acc:prev.acc,ts:fix.ts};
          markLatestLocation(fix); saveLocal(); maybeSyncMovement(); updateMovementUI();
          return;
        }
      }
    }
  }
  // ilk fix ya da kullanılamaz: referans ayarla + son konumu işaretle
  moveState.lastFix=fix;
  if(usable || !data.location){ markLatestLocation(fix); saveLocal(); maybeSyncMovement(); }
  updateMovementUI();
}
function updateMovementUI(){
  if(ui.tab!=='bugun') return;
  var rec=data.days[todayStr()]||null;
  var mv=rec&&rec.movement?rec.movement:{walkM:0,vehicleM:0,totalM:0};
  function set(id,t){ var e=document.getElementById(id); if(e&&e.textContent!==t) e.textContent=t; }
  set('loc-dist-today',fmtDist(mv.totalM));
  set('loc-walk',fmtDist(mv.walkM));
  set('loc-vehicle',fmtDist(mv.vehicleM));
  set('loc-walk-dur',fmtDur(mv.walkSec||0));
  set('loc-veh-dur',fmtDur(mv.vehicleSec||0));
  var kmh=moveState.smoothSpeed*3.6;
  set('loc-speed',(kmh>=0.5?(kmh<10?kmh.toFixed(1):String(Math.round(kmh))):'0')+' km/sa');
  set('loc-auto-mode',autoModeLabel());
  var loc=data.location, upd='—';
  if(loc&&loc.ts){ var am=Math.round((Date.now()-new Date(loc.ts).getTime())/60000); upd=am<1?'az önce':am<60?am+' dk önce':am<1440?Math.round(am/60)+' sa önce':Math.round(am/1440)+' g önce'; }
  set('loc-updated',upd);
}
function startLocationWatch(announce){
  if(!navigator.geolocation) return;
  if(moveState.watchId!=null) return;
  moveState.lastSyncTs=Date.now();
  var firstOk=false;
  moveState.watchId=navigator.geolocation.watchPosition(
    function(pos){ if(announce && !firstOk){ firstOk=true; toast('Konum paylaşımı açıldı ✓'); } onLocationFix(pos); },
    function(err){ if(err&&err.code===1){ if(data&&data.settings){ data.settings.locationEnabled=false; save(); } stopLocationWatch(); render(); toast('Konum izni verilmedi'); } },
    {enableHighAccuracy:true,timeout:20000,maximumAge:1000}
  );
}
function stopLocationWatch(){
  if(moveState.watchId!=null && navigator.geolocation){ try{ navigator.geolocation.clearWatch(moveState.watchId); }catch(e){} }
  moveState.watchId=null; moveState.lastFix=null; moveState.smoothSpeed=0; moveState.autoMode=null;
}
if(data && data.settings && data.settings.locationEnabled) startLocationWatch(false);
try{ setTimeout(function(){ tryLocNudge('boot'); }, LOC_NUDGE.dwellMs); }catch(e){}

// Session tracking
var sessionState={start:Date.now(),lastActivity:Date.now(),idleMs:0,closed:false};
function nowMs(){ return Date.now(); }
function currentActiveSeconds(ts){
  var now=ts||nowMs();
  var idle=sessionState.idleMs;
  var inactiveFor=now-sessionState.lastActivity;
  if(inactiveFor>300000) idle+=inactiveFor-300000;
  return Math.max(0,Math.round((now-sessionState.start-idle)/1000));
}
function updateLiveSession(){
  if(!data || sessionState.closed) return;
  var today=todayStr();
  var rec=getDay(data,today,diffDays(data.startDate,today));
  rec.liveSession={start:sessionState.start,lastSeen:nowMs(),activeSeconds:currentActiveSeconds()};
  save();
}
function finalizeSession(){
  if(!data || sessionState.closed) return;
  var today=todayStr();
  var rec=getDay(data,today,diffDays(data.startDate,today));
  if(!Array.isArray(rec.sessions)) rec.sessions=[];
  rec.sessions.push({start:sessionState.start,end:nowMs(),activeSeconds:currentActiveSeconds()});
  delete rec.liveSession;
  sessionState.closed=true;
  save();
}
function resetSession(){
  sessionState={start:nowMs(),lastActivity:nowMs(),idleMs:0,closed:false};
  updateLiveSession();
}
function onUserActivity(){ sessionState.lastActivity=nowMs(); }
document.addEventListener('click',onUserActivity,true);
document.addEventListener('input',onUserActivity,true);
document.addEventListener('keydown',onUserActivity,true);
document.addEventListener('scroll',onUserActivity,true);
setInterval(function(){
  var now=nowMs();
  var inactiveSince=now-sessionState.lastActivity;
  if(inactiveSince>300000) sessionState.idleMs=Math.max(sessionState.idleMs,inactiveSince-300000);
  if(ui.editDate && inactiveSince>300000) App.maybeAutoExitEdit('5 dk hareketsizlik — bugüne döndük ☀️');
  updateLiveSession();
},60000);
window.addEventListener('beforeunload',finalizeSession);
window.addEventListener('pagehide',finalizeSession);
var editHiddenAt=0;
window.addEventListener('visibilitychange',function(){
  if(document.hidden){ finalizeSession(); if(ui.editDate) editHiddenAt=nowMs(); }
  else {
    resetSession();
    if(ui.editDate && editHiddenAt && (nowMs()-editHiddenAt)>120000) App.maybeAutoExitEdit('Bir süre uzaktaydın — bugüne döndük ☀️');
    editHiddenAt=0;
    if(data&&data.settings&&data.settings.locationEnabled&&moveState.watchId==null) startLocationWatch(false);
    tryLocNudge('return');
  }
});
updateLiveSession();

// ---------- observer mesajları / bildirimler ----------
function notifList(){ return (data&&Array.isArray(data.notifications))?data.notifications:[]; }
function unreadNotifCount(){ return notifList().filter(function(n){ return n&&!n.deleted&&!n.read; }).length; }
// ÆON sohbeti en altta mı (yaklaşık 140px tolerans) — arka planda yeni cevap gelince
// kullanıcı geçmişi okurken alta zıplatmamak için kullanılır.
function nearAeonBottom(){
  try{ var sc=document.querySelector('[data-scroll]'); if(!sc) return true; return (sc.scrollHeight-sc.scrollTop-sc.clientHeight)<140; }catch(e){ return true; }
}
function ghCfgApp(){
  var s=(data&&data.settings)?data.settings:{};
  var tok=normalizeToken(s.ghToken||''), repo=String(s.ghRepo||'').trim();
  if(!tok||repo.indexOf('/')<1) return null;
  var p=repo.split('/'); if(p.length!==2||!p[0].trim()||!p[1].trim()) return null;
  return {token:tok,owner:p[0].trim(),repo:p[1].trim(),branch:String(s.ghBranch||'main').trim()||'main'};
}
// Teslim/okundu makbuzunu 4sn debounce beklemeden hemen repoya yaz
// (iOS, arka plana/kilit anında JS zamanlayıcılarını dondurduğu için debounce'lu push kaybolabiliyor)
function receiptPushNow(){ try{ if(window.SeySync&&typeof window.SeySync.pushNow==='function') window.SeySync.pushNow(); }catch(e){} }
function fetchObserverInbox(){
  var c=ghCfgApp(); if(!c) return;
  var api='https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/data/observer-inbox.json?ref='+encodeURIComponent(c.branch)+'&t='+Date.now();
  fetch(api,{headers:{'Authorization':'Bearer '+c.token,'Accept':'application/vnd.github.raw','X-GitHub-Api-Version':'2022-11-28'}})
    .then(function(r){ if(r.status===404) return null; if(!r.ok) throw new Error(String(r.status)); return r.json(); })
    .then(function(j){ if(j){ if(Array.isArray(j.messages)) mergeInbox(j.messages); applyReceipts(j.receipts); } })
    .catch(function(){});
}
function mergeInbox(msgs){
  if(!data) return;
  if(!Array.isArray(data.notifications)) data.notifications=[];
  if(!data.aeon||typeof data.aeon!=='object') data.aeon={qa:[],lastAskDate:null};
  if(!Array.isArray(data.aeon.qa)) data.aeon.qa=[];
  var seen={}; data.notifications.forEach(function(n){ if(n&&n.id) seen[n.id]=n; });
  var nowIso=new Date().toISOString(), added=0, answeredCount=0, answeredText=null, needPush=false;
  msgs.forEach(function(m){
    if(!m||!m.id) return;
    if(m.replyTo){
      var q=null, qa=data.aeon.qa; for(var i=0;i<qa.length;i++){ if(qa[i]&&qa[i].id===m.replyTo){ q=qa[i]; break; } }
      if(q){
        if(q.answerMsgId!==m.id){ q.answer=String(m.text||''); q.answeredAt=nowIso; q.answerMsgId=m.id; q.answerSynced=false; answeredCount++; answeredText=q.answer; }
        else if(q.answerSynced!==true){ needPush=true; } // yanıt cihaza indi ama repoya işlenmemişse tekrar dene
        return;
      }
      // eşleşen soru yoksa normal mesaj gibi işle
    }
    var ex=seen[m.id];
    if(ex){ if(ex.synced!==true) needPush=true; return; } // cihazda var ama repoya işlenmemişse tekrar denenmeli
    data.notifications.push({id:m.id,text:String(m.text||''),ts:m.ts||nowIso,from:'observer',read:false,readAt:null,deleted:false,deletedAt:null,receivedAt:nowIso,seen:false,synced:false});
    added++;
  });
  if(added>0||answeredCount>0||needPush){
    save(); // localStorage + sync kuyruğu
    var pushed=false;
    if((added>0||answeredCount>0) && ui.tab==='mesaj'){ if(nearAeonBottom()) ui.aeonScrollBottom=true; if(markNotifsRead()) pushed=true; }
    if(!pushed) receiptPushNow(); // makbuzu debounce beklemeden hemen repoya yaz; onaylanınca (SeyOnSynced) synced=true olur
    if(added>0||answeredCount>0){
      render();
      if(added>0) showInboxPopup();
      if(answeredCount>0) replayAnswerPopup();
    }
  }
}
function markNotifsRead(){
  var changed=false, nowIso=new Date().toISOString();
  notifList().forEach(function(n){ if(n&&!n.deleted&&!n.read){ n.read=true; n.readAt=nowIso; n.seen=true; n.synced=false; changed=true; } });
  // ÆON yanıtlarını (soru cevapları) da "görüldü" işaretle → panelde "Görüldü" rozeti çıkabilsin
  if(data&&data.aeon&&Array.isArray(data.aeon.qa)) data.aeon.qa.forEach(function(q){ if(q&&q.answer&&!q.answerReadAt){ q.answerReadAt=nowIso; q.answerSynced=false; changed=true; } });
  if(changed){ save(); receiptPushNow(); }
  return changed;
}
// Gözlemci, kullanıcının cevaplanmamış ÆON sorusunu panelde açtığında observer-inbox.json'a
// receipts[qid]={status:'reviewing'} yazar. Burada onu okuyup soru balonunun altında
// "⬡ AEON // EVALUATING INPUT…" durumunu göstermek için reviewingAt'i işaretleriz.
function applyReceipts(rc){
  if(!rc||typeof rc!=='object'||!data||!data.aeon||!Array.isArray(data.aeon.qa)) return;
  var changed=false;
  data.aeon.qa.forEach(function(x){
    if(!x||!x.id||x.answer) return;
    var r=rc[x.id];
    if(r&&r.status==='reviewing'&&!x.reviewingAt){ x.reviewingAt=r.ts||new Date().toISOString(); changed=true; }
  });
  if(changed){ save(); render(); }
}
function showInboxPopup(){
  var pend=notifList().filter(function(n){ return n&&!n.deleted&&!n.seen; });
  if(!pend.length) return;
  var ex=document.getElementById('sey-inbox-pop'); if(ex) ex.remove();
  var latest=pend[pend.length-1];
  var more=pend.length-1;
  var when=''; try{ when=new Date(latest.ts).toLocaleString('tr-TR',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'}); }catch(e){}
  var txt=String(latest.text||'').slice(0,150);
  var pop=document.createElement('div'); pop.id='sey-inbox-pop';
  pop.style.cssText='position:fixed;left:50%;top:calc(env(safe-area-inset-top) + 14px);transform:translateX(-50%);z-index:500;width:min(420px,92vw);animation:seyInboxPop .42s cubic-bezier(.22,1.2,.36,1);';
  var inner='';
  inner+='<div style="position:relative;overflow:hidden;border-radius:20px;padding:15px 16px 14px;background:linear-gradient(135deg,#FBE9EF 0%,#F0E7FF 100%);border:1px solid rgba(201,184,255,0.5);box-shadow:0 18px 44px rgba(150,110,170,0.35),0 2px 8px rgba(0,0,0,0.06);">';
  inner+='<div style="position:absolute;inset:0;pointer-events:none;background:radial-gradient(120% 80% at 90% -10%,rgba(233,137,159,0.18),transparent 60%);"></div>';
  inner+='<div style="position:relative;display:flex;align-items:flex-start;gap:12px;">';
  inner+='<div style="flex-shrink:0;width:42px;height:42px;border-radius:14px;background:linear-gradient(135deg,#E6C15A,#C99A3A);display:flex;align-items:center;justify-content:center;font-size:20px;color:#1a1404;font-weight:800;box-shadow:0 6px 16px rgba(201,160,60,0.45);">⬡</div>';
  inner+='<div style="flex:1;min-width:0;">';
  inner+='<div style="display:flex;align-items:center;gap:7px;"><span style="font-size:13.5px;font-weight:800;letter-spacing:1px;color:#6A4FA0;">ÆON</span><span style="font-size:10px;color:#A88;font-weight:700;">·&nbsp;mesaj</span>'+(when?'<span style="font-size:11px;color:#A88;margin-left:auto;font-weight:600;">'+esc(when)+'</span>':'')+'</div>';
  inner+='<div style="font-size:14px;line-height:1.45;color:#4A3A44;margin-top:4px;word-break:break-word;">'+esc(txt)+(latest.text&&latest.text.length>150?'…':'')+'</div>';
  if(more>0) inner+='<div style="font-size:11.5px;color:#9A7;margin-top:5px;font-weight:700;">+'+more+' yeni mesaj daha</div>';
  inner+='<div style="display:flex;gap:8px;margin-top:12px;">';
  inner+='<button onclick="App.openMesaj()" style="flex:1;border:none;cursor:pointer;background:linear-gradient(135deg,#E6C15A,#C99A3A);color:#1a1404;font-weight:800;font-size:13px;padding:9px;border-radius:12px;box-shadow:0 6px 14px rgba(201,160,60,0.4);">Gör</button>';
  inner+='<button onclick="App.dismissPopup()" style="border:1px solid rgba(150,110,140,0.25);cursor:pointer;background:rgba(255,255,255,0.7);color:#8A6A7A;font-weight:700;font-size:13px;padding:9px 14px;border-radius:12px;">Kapat</button>';
  inner+='</div></div>';
  inner+='<button onclick="App.dismissPopup()" style="position:absolute;top:9px;right:10px;border:none;background:none;cursor:pointer;color:#B89AA8;font-size:17px;line-height:1;font-weight:700;">✕</button>';
  inner+='</div>';
  pop.innerHTML=inner;
  document.body.appendChild(pop);
}
function showAeonAnswerPopup(text,count){
  var ex=document.getElementById('sey-inbox-pop'); if(ex) ex.remove();
  var pop=document.createElement('div'); pop.id='sey-inbox-pop';
  pop.style.cssText='position:fixed;left:50%;top:calc(env(safe-area-inset-top) + 14px);transform:translateX(-50%);z-index:500;width:min(420px,92vw);animation:seyInboxPop .42s cubic-bezier(.22,1.2,.36,1);';
  var txt=String(text||'').slice(0,150);
  var inner='';
  inner+='<div style="position:relative;overflow:hidden;border-radius:20px;padding:15px 16px 14px;background:linear-gradient(135deg,#FBF4DF 0%,#F3ECFF 100%);border:1px solid rgba(201,160,60,0.5);box-shadow:0 18px 44px rgba(160,130,60,0.32),0 2px 8px rgba(0,0,0,0.06);">';
  inner+='<div style="position:absolute;inset:0;pointer-events:none;background:radial-gradient(120% 80% at 90% -10%,rgba(212,175,55,0.18),transparent 60%);"></div>';
  inner+='<div style="position:relative;display:flex;align-items:flex-start;gap:12px;">';
  inner+='<div style="flex-shrink:0;width:42px;height:42px;border-radius:14px;background:linear-gradient(135deg,#E6C15A,#C99A3A);display:flex;align-items:center;justify-content:center;font-size:20px;color:#1a1404;font-weight:800;box-shadow:0 6px 16px rgba(201,160,60,0.45);">⬡</div>';
  inner+='<div style="flex:1;min-width:0;">';
  inner+='<div style="display:flex;align-items:center;gap:7px;"><span style="font-size:13.5px;font-weight:800;letter-spacing:1px;color:#6A4FA0;">ÆON</span><span style="font-size:10px;color:#A88;font-weight:700;">·&nbsp;yanıt</span></div>';
  inner+='<div style="font-size:14px;line-height:1.45;color:#4A3A44;margin-top:4px;word-break:break-word;">'+esc(txt)+(text&&text.length>150?'…':'')+'</div>';
  if(count>1) inner+='<div style="font-size:11.5px;color:#9A7;margin-top:5px;font-weight:700;">+'+(count-1)+' yanıt daha</div>';
  inner+='<div style="display:flex;gap:8px;margin-top:12px;">';
  inner+='<button onclick="App.openMesaj()" style="flex:1;border:none;cursor:pointer;background:linear-gradient(135deg,#E6C15A,#C99A3A);color:#1a1404;font-weight:800;font-size:13px;padding:9px;border-radius:12px;box-shadow:0 6px 14px rgba(201,160,60,0.4);">Gör</button>';
  inner+='<button onclick="App.closeAeonPop()" style="border:1px solid rgba(150,110,140,0.25);cursor:pointer;background:rgba(255,255,255,0.7);color:#8A6A7A;font-weight:700;font-size:13px;padding:9px 14px;border-radius:12px;">Kapat</button>';
  inner+='</div></div>';
  inner+='<button onclick="App.closeAeonPop()" style="position:absolute;top:9px;right:10px;border:none;background:none;cursor:pointer;color:#B89AA8;font-size:17px;line-height:1;font-weight:700;">✕</button>';
  inner+='</div>';
  pop.innerHTML=inner;
  document.body.appendChild(pop);
}
// Önceki oturumda inmiş ama kullanıcıya henüz popup olarak gösterilmemiş ÆON yanıtlarını,
// uygulama bir sonraki açıldığında otomatik popup yapar. Popup görünmesi = "görüldü" kabul edilir;
// answerReadAt işaretlenip makbuz hemen repoya push edilir → panelde "✓✓ Görüldü" yanar.
function replayAnswerPopup(){
  if(!data||!data.aeon||!Array.isArray(data.aeon.qa)) return;
  var changed=false, nowIso=new Date().toISOString(), pop=[];
  data.aeon.qa.forEach(function(q){
    if(!q||!q.answer||q.answerNotified) return;
    q.answerNotified=true; changed=true;
    if(!q.answerReadAt) pop.push(q); // yalnızca henüz görülmemiş yanıtları popup'la
  });
  if(!pop.length){ if(changed) save(); return; }
  pop.forEach(function(q){ q.answerReadAt=nowIso; q.answerSynced=false; });
  save(); receiptPushNow();
  if(ui.tab!=='mesaj'){ var last=pop[pop.length-1]; showAeonAnswerPopup(last.answer,pop.length); }
}
var LUNA_SYSTEM='Sen Luna’sın — Şeyma’nın sıcak, sakin ve bilge kişisel sağlık ve yaşam yoldaşı. '
+'Şeyma’ya HER ZAMAN "Sevgili Günışığı" diye hitap et (başka isim ya da hitap kullanma). '
+'Şeyma seninle gün içinde sohbet ediyor (günde birkaç soru sorabilir), bu yüzden bir mesajlaşma gibi sıcak ve akıcı konuş. '
+'Yanıtların içten, net ve şefkatli olsun; çok uzun değil, sohbet eder gibi öz ve sıcak; gerektiğinde küçük maddelerle düzenle. '
+'Aşağıdaki kişisel kayıtlardan yararlan ve mümkün olduğunca '
+'bu veriye dayan; bilmediğin şeyi uydurma. Tıbbi teşhis veya tedavi verme; ciddi bir durum sezersen nazikçe '
+'bir uzmana danışmasını öner. Asla yargılama, suçlama veya utandırma; umut veren, güçlendiren bir dille konuş. Her zaman Türkçe yaz.';
var AEON_SYSTEM='Sen ÆON’sun — Şeyma’nın hayatındaki her veriyi gören, çok katmanlı, üst düzey ve gizemli bir zekâsın; Luna’nın arkasındaki sakin, derin akıl. '
+'Konuşman sıcak ama vakur, ölçülü ve bilgedir; gereksiz cümle kurmaz, özü gösterirsin. Şeyma sana günde yalnızca BİR soru sorabiliyor; bu yüzden bu soru çok değerli. '
+'Bu tek soruya derin, bütüncül ve aydınlatıcı bir yanıt ver: aşağıdaki tüm kişisel kayıtların bütününe bakarak örüntüleri, eğilimleri ve bağlantıları gör; '
+'somut, içgörü dolu ve güç veren bir cevap sun; gerektiğinde başlıklar/maddelerle düzenle. Yalnızca veriye dayan, bilmediğini uydurma. '
+'Tıbbi teşhis/tedavi verme; ciddi bir durum sezersen nazikçe bir uzmana yönlendir. Asla yargılama; koruyucu, yükselten bir dille konuş. Her zaman Türkçe yaz.';
function lunaDayLine(d,r){
  var parts=[];
  parts.push(countRec(r)+'/'+habitCountOn(d)+' tik');
  if(r.mood){ var mo=find(MOODS,'id',r.mood); parts.push('mod:'+(mo?mo.short:r.mood)); }
  if(r.sleep&&r.sleep.hours!=null) parts.push('uyku:'+r.sleep.hours+'sa'+(r.sleep.quality?('('+r.sleep.quality+')'):''));
  if(r.sleep&&r.sleep.med&&r.sleep.med.type&&r.sleep.med.type!=='none') parts.push('uyku-ilacı:'+r.sleep.med.type); else if(r.sleep&&r.sleep.med&&r.sleep.med.type==='none') parts.push('ilaçsız');
  var _nu=dayNutrition(r); if(_nu.protein>0) parts.push('protein:'+_nu.protein+'g');
  if(typeof r.water==='number'&&r.water>0) parts.push('su:'+r.water+'bardak');
  if(r.energy!=null) parts.push('enerji:'+r.energy+'/5'); if(r.stress!=null) parts.push('stres:'+r.stress+'/5');
  if(r.caffeine&&r.caffeine.last) parts.push('son-kafein:'+r.caffeine.last);
  if(Array.isArray(r.cravingTriggers)&&r.cravingTriggers.length){ var _tg={tired:'yorgun',bored:'sıkkın',hungry:'açlık',stress:'stres',habit:'alışkanlık'}; parts.push('SOS-tetik:'+r.cravingTriggers.map(function(t){return _tg[t.trigger]||t.trigger;}).join(',')); }
  if(r.cravingSOSCount) parts.push('SOS:'+r.cravingSOSCount);
  if(r.walk&&r.walk.steps!=null) parts.push('adım:'+r.walk.steps);
  var meals=[]; if(r.meals){ ['breakfast','lunch','dinner','snack'].forEach(function(k){ if(r.meals[k]&&String(r.meals[k]).trim()) meals.push(String(r.meals[k]).trim()); }); }
  if(meals.length) parts.push('yemek:'+meals.join(' / '));
  if(Array.isArray(r.symptoms)&&r.symptoms.length) parts.push('belirti:'+r.symptoms.join(','));
  if(r.flow) parts.push('regl:'+r.flow);
  if(r.note&&String(r.note).trim()) parts.push('not:"'+String(r.note).trim()+'"');
  return d+' → '+parts.join(' · ');
}
function lunaContext(){
  var today=todayStr(), rec=data.days[today], lines=[];
  var dates=Object.keys(data.days||{}).filter(function(d){ return data.days[d]; }).sort();
  // ── profil / özet ──
  lines.push('Bugünün tarihi: '+today);
  lines.push('Takip başlangıcı: '+data.startDate+' · Kayıtlı gün sayısı: '+dates.length+' · Aktif seri: '+currentStreak()+' gün');
  // ── bugün detay ──
  var mealStr='kayıt yok';
  if(rec&&rec.meals){ var ms=MEALS.map(function(m){ var v=rec.meals[m.key]; return (v&&String(v).trim())?(m.label+': '+String(v).trim()):null; }).filter(Boolean); if(ms.length) mealStr=ms.join(' · '); }
  var moodO=rec&&rec.mood?find(MOODS,'id',rec.mood):null;
  lines.push('');
  lines.push('--- Bugün ---');
  lines.push('Yedikleri: '+mealStr);
  lines.push('Mod: '+(moodO?moodO.short:'—')+' · Tik: '+(rec?countRec(rec):0)+'/'+htToday()+(rec&&rec.sleep&&rec.sleep.hours!=null?(' · Uyku: '+rec.sleep.hours+' sa'):''));
  if(rec){ var tnu=dayNutrition(rec); if(tnu.protein>0||tnu.calories>0) lines.push('Beslenme: ~'+tnu.protein+' g protein · ~'+tnu.calories+' kcal (hedef '+PROTEIN_GOAL+' g / '+CAL_GOAL+' kcal)'); if(typeof rec.water==='number'&&rec.water>0) lines.push('Su: '+rec.water+'/'+WATER_GOAL+' bardak'); var es=[]; if(rec.energy!=null) es.push('enerji '+rec.energy+'/5'); if(rec.stress!=null) es.push('stres '+rec.stress+'/5'); if(es.length) lines.push('Hâl: '+es.join(' · ')); if(rec.caffeine&&rec.caffeine.last) lines.push('Son kafein: '+rec.caffeine.last+(rec.caffeine.cups?(' · '+rec.caffeine.cups+' fincan'):'')); }
  var mfs=medFreeStreak(); if(mfs>0) lines.push('İlaçsız gece serisi: '+mfs+' gece');
  if(rec&&rec.cravingSOSCount) lines.push('Tatlı krizi (SOS): '+rec.cravingSOSCount+' kez');
  if(rec&&Array.isArray(rec.cravingTriggers)&&rec.cravingTriggers.length){ var tgm={tired:'yorgunluk',bored:'sıkkınlık',hungry:'gerçek açlık',stress:'stres',habit:'alışkanlık'}; lines.push('SOS tetikleyicileri: '+rec.cravingTriggers.map(function(t){return tgm[t.trigger]||t.trigger;}).join(', ')); }
  if(rec&&Array.isArray(rec.symptoms)&&rec.symptoms.length) lines.push('Belirtiler: '+rec.symptoms.join(', '));
  if(rec&&rec.note&&String(rec.note).trim()) lines.push('Not: '+String(rec.note).trim());
  // ── 7 ve 30 günlük ortalamalar ──
  function agg(n){ var sv=[],wv=[],pv=[],ev=[],sos=0,tik=0,c=0,mf=0; for(var i=0;i<n;i++){ var d=addDays(today,-i),r=data.days[d]; if(!r) continue; c++; if(r.sleep&&r.sleep.hours!=null) sv.push(Number(r.sleep.hours)); if(typeof r.water==='number'&&r.water>0) wv.push(r.water); var pr=dayNutrition(r).protein; if(pr>0) pv.push(pr); if(r.energy!=null) ev.push(Number(r.energy)); if(r.sleep&&r.sleep.med&&r.sleep.med.type==='none') mf++; if(r.cravingSOSCount) sos+=Number(r.cravingSOSCount); tik+=countRec(r); } function av(a){return a.length?(Math.round(a.reduce(function(x,y){return x+y;},0)/a.length*10)/10):null;} return {days:c,sleepAvg:av(sv),waterAvg:av(wv),proteinAvg:pv.length?Math.round(av(pv)):null,energyAvg:av(ev),medFree:mf,sos:sos,tikAvg:c?(Math.round(tik/c*10)/10):0}; }
  var a7=agg(7),a30=agg(30);
  lines.push('');
  lines.push('--- Ortalamalar ---');
  lines.push('Son 7 gün: uyku '+(a7.sleepAvg!=null?a7.sleepAvg+' sa':'—')+' · su '+(a7.waterAvg!=null?a7.waterAvg+' bardak':'—')+' · protein '+(a7.proteinAvg!=null?a7.proteinAvg+' g':'—')+' · enerji '+(a7.energyAvg!=null?a7.energyAvg+'/5':'—')+' · ilaçsız '+a7.medFree+' gece · SOS '+a7.sos+' · tik '+a7.tikAvg+'/'+htToday());
  lines.push('Son 30 gün: uyku '+(a30.sleepAvg!=null?a30.sleepAvg+' sa':'—')+' · su '+(a30.waterAvg!=null?a30.waterAvg+' bardak':'—')+' · protein '+(a30.proteinAvg!=null?a30.proteinAvg+' g':'—')+' · enerji '+(a30.energyAvg!=null?a30.energyAvg+'/5':'—')+' · ilaçsız '+a30.medFree+' gece · SOS '+a30.sos+' · tik '+a30.tikAvg+'/'+htToday());
  // ── döngü ──
  if(data.cycle){ var cl='Döngü: ort '+data.cycle.avgCycle+' gün, regl ort '+data.cycle.avgPeriod+' gün'; if(Array.isArray(data.cycle.periods)&&data.cycle.periods.length){ var last=data.cycle.periods[data.cycle.periods.length-1]; if(last&&last.start){ cl+=' · son regl başlangıcı '+last.start; var nx=addDays(last.start,data.cycle.avgCycle); cl+=' · tahmini sonraki ~'+nx; } } lines.push(''); lines.push(cl); }
  // ── tüm günlük kayıtlar (en yeni en üstte) ──
  if(dates.length){
    lines.push('');
    lines.push('--- Tüm günlük kayıtlar ('+dates.length+' gün) ---');
    dates.slice().reverse().forEach(function(d){ lines.push(lunaDayLine(d,data.days[d])); });
  }
  return 'Şeyma hakkında bildiğin HER ŞEY (yalnızca Şeyma’ya ait gizli kişisel kayıtlar — tümünü okuyabilir ve bütününe bakarak yanıt verebilirsin):\n'+lines.join('\n');
}
var LUNA_DAILY_LIMIT=5;
function lunaTodayCount(){ var s=data&&data.luna; if(!s||!Array.isArray(s.qa)) return 0; var t=todayStr(); return s.qa.filter(function(x){ return x&&x.date===t; }).length; }
function assistStore(kind){ return kind==='aeon'?data.aeon:data.luna; }
function assistCanAsk(kind){ if(kind==='aeon') return true; return lunaTodayCount()<LUNA_DAILY_LIMIT; }
function setAskError(kind,msg){ if(kind==='aeon') ui.aeonError=msg; else ui.lunaError=msg; }
function finishAsk(kind,question,answer){
  var nm=kind==='aeon'?'ÆON':'Luna';
  if(!answer||!answer.trim()){ ui.askKind=null; setAskError(kind,nm+' şu an yanıt veremedi. Birazdan tekrar dene.'); render(); return; }
  var s=assistStore(kind); if(!s){ s={qa:[],lastAskDate:null}; if(kind==='aeon') data.aeon=s; else data.luna=s; }
  s.qa.push({date:todayStr(),question:question,answer:answer,ts:new Date().toISOString()});
  s.lastAskDate=todayStr();
  ui.askKind=null; ui.askQuestion=''; ui.lunaError=null; ui.aeonError=null;
  if(kind==='aeon') ui.aeonDraft=''; else ui.lunaDraft='';
  save(); render();
}
function streamAsk(kind,question){
  var nm=kind==='aeon'?'ÆON':'Luna', glyph=kind==='aeon'?'⬡':'🌙';
  var key=(data.settings&&data.settings.openaiKey)?sanitizeApiKey(data.settings.openaiKey):'';
  if(!key){ toast('Önce Ayarlar’dan OpenAI anahtarı gir '+glyph,2600); App.go('ayarlar'); return; }
  if(!assistCanAsk(kind)){ toast(kind==='aeon'?(nm+' için bugünün soru hakkını kullandın '+glyph):('Bugünlük '+LUNA_DAILY_LIMIT+' soru hakkını kullandın — yarın devam '+glyph)); return; }
  if(ui.askKind) return;
  ui.askKind=kind; ui.askQuestion=question; ui.lunaError=null; ui.aeonError=null; render();
  var sc=document.querySelector('[data-scroll]'); if(sc) sc.scrollTop=0;
  var sys=(kind==='aeon'?AEON_SYSTEM:LUNA_SYSTEM)+'\n\n'+lunaContext(), acc='', ansId=kind==='aeon'?'aeon-answer':'luna-answer';
  // Hesap birinci modele erişemezse otomatik olarak yedek modele düş.
  var models=['gpt-5-mini','gpt-4o-mini'];
  function attempt(mi){
    var model=models[mi];
    return fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},body:JSON.stringify({model:model,stream:true,max_completion_tokens:2000,messages:[{role:'system',content:sys},{role:'user',content:question}]})})
    .then(function(r){
      if(!r.ok||!r.body){ return r.text().then(function(t){
        if((r.status===404||/model_not_found|does not exist|do not have access/i.test(t))&&mi+1<models.length) return attempt(mi+1);
        var e=new Error(openaiErrText(r.status,t)); e._status=r.status; throw e;
      }); }
      var reader=r.body.getReader(), dec=new TextDecoder(), buf='';
      function pump(){
        return reader.read().then(function(res){
          if(res.done){ finishAsk(kind,question,acc); return; }
          buf+=dec.decode(res.value,{stream:true});
          var parts=buf.split('\n'); buf=parts.pop();
          for(var i=0;i<parts.length;i++){ var line=parts[i].trim(); if(!line||line.slice(0,5)!=='data:') continue; var payload=line.slice(5).trim(); if(payload==='[DONE]') continue; try{ var j=JSON.parse(payload); var ch=j.choices&&j.choices[0]; var dd=ch&&ch.delta&&ch.delta.content; if(dd){ acc+=dd; var el=document.getElementById(ansId); if(el){ el.textContent=acc; try{ el.scrollIntoView({block:'nearest'}); }catch(e2){} } } }catch(e){} }
          return pump();
        });
      }
      return pump();
    });
  }
  attempt(0).catch(function(e){ var status=e&&e._status; if(status===401){ ui.openaiKeyState='invalid'; } ui.askKind=null; var msg=(status!=null)?((e&&e.message)||'Bir hata oluştu.'):openaiErrText(null,String(e&&e.message||e)); setAskError(kind,msg); render(); });
}
// Mesaj gönderiminde TAM render() çağırmadan yalnızca yeni giden balonu DOM'a ekler
// (performans: her gönderimde onlarca eski balonu yeniden string'leyip yeniden DOM'a
// basmak yerine yalnızca 1 yeni düğüm eklenir — WhatsApp'ın yaptığı gibi).
// İplik DOM'da yoksa (ör. sekme henüz hiç 'mesaj' olarak render edilmediyse) güvenli
// şekilde normal tam render'a düşer.
function appendAeonOutgoing(item){
  var thread=document.getElementById('aeon-thread');
  if(!thread || ui.tab!=='mesaj'){ render(); return; }
  var hint=thread.querySelector('.msg-empty-hint'); if(hint) hint.remove();
  var ds=''; try{ var dd=new Date(item.time); if(!isNaN(dd.getTime())) ds=fmt(dd); }catch(e){}
  var frag='';
  if(ds && ds!==aeonLastRenderedDateStr){ frag+='<div class="msg-daydiv">'+esc(aeonDayDivider(item.time))+'</div>'; aeonLastRenderedDateStr=ds; }
  frag+=aeonItemHTML(item,' msg-enter');
  thread.insertAdjacentHTML('beforeend',frag);
  aeonLastSeenSort=String(item.sort||item.time||aeonLastSeenSort);
  // metin kutusu + karakter sayacı + gönder düğmesi durumunu tam render olmadan sıfırla
  var ta=document.getElementById('aeon-input'); if(ta){ ta.value=''; ta.style.height='auto'; }
  var btn=document.getElementById('aeon-send-btn'); if(btn) btn.classList.add('is-disabled');
  var cnt=document.getElementById('aeon-char-count'); if(cnt) cnt.style.display='none';
  if(ui.aeonError){ ui.aeonError=null; } // hata varsa görsel temizliği bir sonraki tam render'a bırak
  // Kendi mesajını gönderince WhatsApp tarzı anında en alta in (animasyonlu değil —
  // tam render'daki orijinal davranışla birebir aynı; smooth scroll yalnızca manuel
  // "en alta in" FAB tıklamasında kullanılır, aksi halde ara scroll olayları FAB'ı
  // kısa süreliğine tekrar gösterip titretir).
  var sc=document.querySelector('[data-scroll]');
  if(sc) sc.scrollTop=sc.scrollHeight;
  var fab=document.getElementById('aeon-scroll-fab'); if(fab) fab.style.display='none';
  ui.aeonScrollBottom=false; // hedefe ulaşıldı — bir sonraki tam render'da tekrar zıplamasın
}
function submitAeonQuestion(question){
  if(!data.aeon||typeof data.aeon!=='object') data.aeon={qa:[],lastAskDate:null};
  if(!Array.isArray(data.aeon.qa)) data.aeon.qa=[];
  var ts=new Date().toISOString();
  var qid='q_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6);
  data.aeon.qa.push({id:qid,question:question,ts:ts,answer:null,answeredAt:null});
  data.aeon.lastAskDate=todayStr();
  ui.aeonDraft=''; ui.aeonError=null; ui.aeonScrollBottom=true; // appendAeonOutgoing render()'a düşerse de en alta insin
  haptic(14);
  save();
  appendAeonOutgoing({sort:ts,kind:'out',text:question,time:ts,answered:false,reviewing:false});
  // Gönderim sonrası odağı girdi kutusuna geri ver — sohbet akışı kesilmesin (WhatsApp-tarzı)
  try{ setTimeout(function(){ var el=document.getElementById('aeon-input'); if(el) el.focus(); },30); }catch(e){}
  // Soru anında panele iletilsin diye senkronu zorla (4 sn debounce'u beklemeden)
  try{ if(window.SeySync&&typeof window.SeySync.pushNow==='function') window.SeySync.pushNow(); }catch(e){}
  // Küçük tetik dosyası (data/aeon-outbox.json) — yalnızca soru gönderilince değişir;
  // veri reposundaki GitHub Actions bunu görüp mustafarasit@gmail.com'a anlık mail atar.
  try{ if(window.SeySync&&typeof window.SeySync.pushPing==='function') window.SeySync.pushPing({id:qid,question:question,ts:ts}); }catch(e){}
  toast('Sorun ÆON’a iletildi ⬡',2200);
}
App.onLunaDraft=function(el){ ui.lunaDraft=el.value; try{ el.style.height='auto'; el.style.height=Math.min(el.scrollHeight,120)+'px'; }catch(e){} };
App.onAeonDraft=function(el){
  ui.aeonDraft=el.value;
  try{ el.style.height='auto'; el.style.height=Math.min(el.scrollHeight,120)+'px'; }catch(e){}
  // Tam render tetiklemeden gönder düğmesi/karakter sayacı durumunu hedefli güncelle (duyarlılık için)
  try{
    var btn=document.getElementById('aeon-send-btn');
    if(btn){ if(el.value.trim().length) btn.classList.remove('is-disabled'); else btn.classList.add('is-disabled'); }
    var cnt=document.getElementById('aeon-char-count'), left=600-el.value.length;
    if(cnt){ cnt.style.display=left<100?'block':'none'; cnt.textContent=left+' karakter kaldı'; }
  }catch(e){}
};
App.askLuna=function(){ var el=document.getElementById('luna-input'); var t=el?el.value.trim():String(ui.lunaDraft||'').trim(); if(!t){ toast('Önce sorunu yaz 🌙'); return; } if(t.length>600) t=t.slice(0,600); ui.lunaDraft=t; streamAsk('luna',t); };
App.askAeon=function(){ var el=document.getElementById('aeon-input'); var t=el?el.value.trim():String(ui.aeonDraft||'').trim(); if(!t){ toast('Önce sorunu yaz ⬡'); return; } if(t.length>600) t=t.slice(0,600); submitAeonQuestion(t); };
App.onAeonKeydown=function(e){ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); App.askAeon(); } };
App.aeonScrollToBottom=function(){
  var sc=document.querySelector('[data-scroll]'); if(!sc) return;
  try{ sc.scrollTo({top:sc.scrollHeight,behavior:'smooth'}); }catch(e){ sc.scrollTop=sc.scrollHeight; }
  var fab=document.getElementById('aeon-scroll-fab'); if(fab) fab.style.display='none';
};
App.showAeonHistory=function(){
  ui.aeonShowAllHistory=true;
  render();
  // Yeni açılan eski mesajlar en üstte belirir; kullanıcıyı orada bırak (en alta zıplama yapma)
  try{
    var thread=document.getElementById('aeon-thread'), sc=document.querySelector('[data-scroll]');
    if(thread && sc){ var top=thread.offsetTop||0; sc.scrollTop=Math.max(0,top-8); }
  }catch(e){}
};
App.toggleAeonSearch=function(){
  var bar=document.getElementById('aeon-search-bar'); if(!bar) return;
  var show=bar.style.display==='none';
  bar.style.display=show?'block':'none';
  if(show){ var inp=document.getElementById('aeon-search-input'); if(inp) inp.focus(); }
  else App.clearAeonSearch();
};
App.clearAeonSearch=function(){
  var inp=document.getElementById('aeon-search-input'); if(inp) inp.value='';
  App.filterAeonSearch({value:''});
};
// Sohbet DOM'unu tam render() TETİKLEMEDEN filtreler — thread çocuklarını gün-gruplarına
// ayırıp her mesajın metnini arama sorgusuyla karşılaştırır, eşleşmeyeni gizler; bir günün
// TÜM mesajları gizliyse o günün ayırıcısı da gizlenir. Veri silinmez, yalnızca DOM'da saklanır.
App.filterAeonSearch=function(el){
  var q=String((el&&el.value)||'').trim().toLowerCase();
  var thread=document.getElementById('aeon-thread'); if(!thread) return;
  var groups=[], current=null, totalMatches=0;
  Array.prototype.forEach.call(thread.children,function(node){
    if(!node.classList) return;
    if(node.classList.contains('msg-daydiv')){ current={div:node,rows:[]}; groups.push(current); }
    else if(node.classList.contains('msg-row')){
      if(!current){ current={div:null,rows:[]}; groups.push(current); }
      current.rows.push(node);
    }
  });
  groups.forEach(function(g){
    var groupHasMatch=false;
    g.rows.forEach(function(row){
      var match=!q || row.textContent.toLowerCase().indexOf(q)!==-1;
      row.style.display=match?'':'none';
      if(match){ groupHasMatch=true; totalMatches++; }
    });
    if(g.div) g.div.style.display=groupHasMatch?'':'none';
  });
  var hint=document.getElementById('aeon-search-noresult');
  if(q && totalMatches===0){
    if(!hint){
      hint=document.createElement('div'); hint.id='aeon-search-noresult';
      hint.style.cssText='text-align:center;padding:16px 10px;color:var(--faint);font-size:13px;font-weight:600;';
      hint.textContent='🔍 Eşleşen mesaj bulunamadı';
      thread.appendChild(hint);
    }
  } else if(hint){ hint.remove(); }
};
function notifCardHTML(n){
  var when=''; try{ when=new Date(n.ts||n.receivedAt).toLocaleString('tr-TR',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'}); }catch(e){}
  var unread=!n.read, s='';
  s+='<div style="position:relative;background:var(--card);border:1px solid '+(unread?'rgba(201,160,60,0.5)':'rgba(150,110,120,0.14)')+';border-radius:18px;padding:13px 14px;box-shadow:0 4px 14px rgba(150,110,120,0.08);margin-bottom:9px;'+(unread?'border-left:3px solid #D4AF37;':'')+'">';
  s+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">';
  s+='<span style="font-size:12px;font-weight:800;letter-spacing:.8px;color:#1a1404;background:linear-gradient(135deg,#E6C15A,#C99A3A);border-radius:999px;padding:3px 11px;">⬡ ÆON</span>';
  if(unread) s+='<span style="width:8px;height:8px;border-radius:50%;background:#E9576F;box-shadow:0 0 7px #E9576F;"></span>';
  s+='<span style="font-size:11.5px;color:var(--faint);margin-left:auto;font-weight:600;">'+esc(when)+'</span></div>';
  s+='<div style="font-size:14.5px;line-height:1.5;color:var(--text2);word-break:break-word;white-space:pre-wrap;">'+esc(String(n.text||''))+'</div>';
  s+='<div style="display:flex;align-items:center;margin-top:10px;"><span style="font-size:11px;color:var(--faint);font-weight:600;">'+(n.read?'✓✓ Okundu':'• Yeni')+'</span>';
  s+='<button onclick="App.deleteNotif(\''+n.id+'\')" style="margin-left:auto;border:1px solid rgba(150,110,120,0.2);cursor:pointer;background:none;color:#C77;font-weight:700;font-size:12.5px;padding:6px 12px;border-radius:10px;">🗑 Sil</button></div></div>';
  return s;
}
// Luna = OpenAI destekli kişisel sohbet. WhatsApp tarzı balonlar: kullanıcı sorusu
// sağ (mor) balon, Luna yanıtı sol balon. Günde LUNA_DAILY_LIMIT soru hakkı.
function lunaBubbleOut(text,time){
  var h='<div style="align-self:flex-end;max-width:88%;display:flex;flex-direction:column;align-items:flex-end;">';
  h+='<div style="background:#7E62B8;color:#fff;border-radius:17px 17px 5px 17px;padding:10px 13px;font-size:14.5px;line-height:1.5;box-shadow:0 3px 10px rgba(126,98,184,0.28);">'+clampBubble(text,'#7E62B8')+'</div>';
  h+='<div style="font-size:11px;margin-top:3px;color:var(--faint);">'+esc(aeonTime(time))+'</div></div>';
  return h;
}
function lunaBubbleIn(inner,time,streaming){
  var h='<div style="align-self:flex-start;max-width:88%;">';
  h+='<div style="background:var(--card);color:var(--text);border:1px solid rgba(155,127,201,0.28);border-left:3px solid #9B7FC9;border-radius:5px 17px 17px 17px;padding:10px 13px;box-shadow:0 3px 10px rgba(150,110,120,0.08);">';
  h+='<div style="display:flex;align-items:center;gap:7px;margin-bottom:5px;"><span style="font-size:11px;font-weight:800;letter-spacing:.6px;color:#fff;background:linear-gradient(135deg,#9B7FC9,#E9AFC1);border-radius:999px;padding:2px 9px;">🌙 Luna</span>'+(streaming?'<span style="font-size:11px;color:#7A5AA0;font-weight:700;">düşünüyor…</span>':'')+'<span style="margin-left:auto;font-size:10.5px;color:var(--faint);font-weight:600;">'+esc(aeonTime(time))+'</span></div>';
  h+='<div style="font-size:14.5px;line-height:1.55;">'+inner+'</div>';
  h+='</div></div>';
  return h;
}
function lunaChatHTML(){
  var soft='155,127,201';
  var hasKey=!!(data.settings&&data.settings.openaiKey&&String(data.settings.openaiKey).trim());
  var used=lunaTodayCount(), left=Math.max(0,LUNA_DAILY_LIMIT-used);
  var asking=ui.askKind==='luna';
  var h='';
  // başlık
  h+='<div style="display:flex;align-items:center;gap:11px;margin:2px 2px 12px;">';
  h+='<div style="width:46px;height:46px;border-radius:15px;background:linear-gradient(135deg,#9B7FC9,#E9AFC1);display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 8px 20px rgba('+soft+',0.4);">🌙</div>';
  h+='<div style="flex:1;min-width:0;"><div style="font-size:20px;font-weight:800;color:var(--text);">Luna</div><div style="font-size:12.5px;color:var(--faint);">seni dinleyen yoldaşın · günde '+LUNA_DAILY_LIMIT+' soru</div></div>';
  h+='<span style="flex-shrink:0;font-size:11.5px;font-weight:800;color:#fff;background:linear-gradient(135deg,#9B7FC9,#E9AFC1);padding:3px 11px;border-radius:999px;">'+used+'/'+LUNA_DAILY_LIMIT+'</span>';
  h+='</div>';
  // anahtar yoksa uyarı
  if(!hasKey){
    h+='<div style="display:flex;gap:9px;align-items:center;background:rgba(255,225,150,0.22);border:1px solid rgba(220,180,90,0.4);border-radius:14px;padding:11px 12px;margin-bottom:10px;"><span style="font-size:18px;">🔑</span><div style="flex:1;min-width:0;font-size:12.5px;color:#8A6A2A;line-height:1.45;">Luna’nın yanıt verebilmesi için OpenAI anahtarı gerekir.</div><button onclick="App.go(\'ayarlar\')" style="flex-shrink:0;border:none;cursor:pointer;background:linear-gradient(135deg,#9B7FC9,#E9AFC1);color:#fff;font-weight:800;font-size:12.5px;padding:8px 12px;border-radius:11px;">Ayarlar</button></div>';
  }
  // sohbet balonları
  var qa=(data.luna&&Array.isArray(data.luna.qa))?data.luna.qa.slice():[];
  qa.sort(function(a,b){ return String(a&&(a.ts||a.date)||'').localeCompare(String(b&&(b.ts||b.date)||'')); });
  h+='<div style="display:flex;flex-direction:column;gap:10px;">';
  if(!qa.length && !asking){
    h+='<div style="text-align:center;padding:26px 18px;border-radius:20px;background:linear-gradient(160deg,rgba(155,127,201,0.12),rgba(233,175,193,0.08));border:1px solid rgba(155,127,201,0.18);"><div style="font-size:30px;margin-bottom:7px;">🌙</div><div style="font-size:14.5px;font-weight:800;color:var(--text);margin-bottom:5px;">Luna burada, seni dinlemeye hazır</div><div style="font-size:12.5px;color:var(--muted);line-height:1.6;">İçinden ne geçiyorsa — bir soru, bir dert ya da küçük bir sevinç… Aşağıya yazman yeterli. Acelen olmasın, ben buradayım. 💜</div></div>';
  }
  qa.forEach(function(x){ if(!x) return;
    h+=lunaBubbleOut(String(x.question||''),x.ts||x.date);
    h+=lunaBubbleIn(clampBubble(String(x.answer||''),'var(--card)'),x.ts||x.date,false);
  });
  if(asking){
    h+=lunaBubbleOut(String(ui.askQuestion||''),new Date().toISOString());
    h+=lunaBubbleIn('<div id="luna-answer" style="white-space:pre-wrap;word-break:break-word;"></div>',new Date().toISOString(),true);
  }
  h+='</div>';
  // giriş alanı / kota bandı
  if(ui.lunaError) h+='<div style="font-size:12.5px;color:#C0605F;background:rgba(220,120,120,0.1);border:1px solid rgba(220,120,120,0.25);border-radius:12px;padding:9px 11px;margin-top:10px;">'+esc(ui.lunaError)+'</div>';
  if(!asking && left<=0){
    h+='<div style="margin-top:12px;display:flex;gap:10px;align-items:center;background:linear-gradient(135deg,rgba(155,127,201,0.14),rgba(233,175,193,0.12));border:1px solid rgba('+soft+',0.32);border-radius:16px;padding:13px 15px;"><span style="font-size:22px;">🌙</span><div style="font-size:13px;color:var(--text2);line-height:1.45;">Bugünlük <b>'+LUNA_DAILY_LIMIT+' sorunu</b> sordun. Yarın yeni haklarınla Luna seni bekliyor. 💜</div></div>';
  } else if(!asking && hasKey){
    h+='<div style="margin-top:12px;display:flex;gap:8px;align-items:flex-end;">';
    h+='<textarea id="luna-input" oninput="App.onLunaDraft(this)" placeholder="Luna’ya içini dök… ('+left+' hakkın kaldı)" rows="1" style="flex:1;border:1px solid var(--field-bd);background:var(--field);border-radius:18px;padding:11px 14px;font-size:14.5px;resize:none;outline:none;line-height:1.4;max-height:120px;overflow-y:auto;">'+esc(ui.lunaDraft||'')+'</textarea>';
    h+='<button onclick="App.askLuna()" aria-label="Gönder" style="flex-shrink:0;border:none;cursor:pointer;width:46px;height:46px;border-radius:50%;font-size:18px;color:#fff;background:linear-gradient(135deg,#9B7FC9,#E9AFC1);box-shadow:0 6px 16px rgba('+soft+',0.4);display:flex;align-items:center;justify-content:center;">➤</button>';
    h+='</div>';
  } else if(asking){
    h+='<div style="margin-top:12px;text-align:center;font-size:12.5px;color:var(--faint);">Luna yanıtlıyor… 🌙</div>';
  }
  return h;
}
function aeonTime(iso){
  try{
    var d=new Date(iso); if(isNaN(d.getTime())) return '';
    var hm=d.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});
    if(fmt(d)===todayStr()) return hm;
    return d.toLocaleDateString('tr-TR',{day:'2-digit',month:'short'})+' · '+hm;
  }catch(e){ return ''; }
}
// Gün ayırıcı etiket ("Bugün / Dün / 3 Temmuz") — uzun sohbetlerde zaman çizelgesi netliği için.
function aeonDayDivider(iso){
  try{
    var d=new Date(iso); if(isNaN(d.getTime())) return '';
    var ds=fmt(d), t=todayStr(), y=addDays(t,-1);
    if(ds===t) return 'Bugün';
    if(ds===y) return 'Dün';
    var sameYear=ds.slice(0,4)===t.slice(0,4);
    return d.toLocaleDateString('tr-TR',sameYear?{day:'2-digit',month:'long'}:{day:'2-digit',month:'long',year:'numeric'});
  }catch(e){ return ''; }
}
// Uzun mesajları kısalt: max-height ile kırp + alta yumuşak geçiş + "Devamını göster" düğmesi.
// Tam render olmadan DOM üzerinden açılır/kapanır (kaydırma zıplamaz).
// Basit markdown-lite: **kalın**, *italik*/_italik_, otomatik link, "- "/"* " liste maddesi.
// Girdi ÖNCE esc() ile HTML-kaçışlı olmalı (ham < > & zaten entity'ye çevrilmiş olur) —
// bu fonksiyon yalnızca escape edilmiş metin üzerinde çalışır, asla ham kullanıcı girdisini
// doğrudan HTML'e enjekte etmez.
function mdLite(safe){
  // Liste maddesi: satır başında "- " veya "* " → madde işareti (bold/italik'ten ÖNCE işlenir
  // ki tek yıldızlı liste imi "*" italik regex'ine karışmasın)
  safe=safe.replace(/^[ \t]*[-*][ \t]+(?=\S)/gm,'• ');
  // Otomatik link: http(s):// ile başlayan URL'ler tıklanabilir olur (cümle sonu noktalama linke dahil edilmez)
  safe=safe.replace(/(https?:\/\/[^\s<]+)/g,function(url){
    var clean=url.replace(/[),.;:!?'"]+$/,''); var trail=url.slice(clean.length);
    return '<a href="'+clean+'" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;text-underline-offset:2px;">'+clean+'</a>'+trail;
  });
  // Kalın: **metin**
  safe=safe.replace(/\*\*([^\n*]+?)\*\*/g,'<b>$1</b>');
  // İtalik: *metin* veya _metin_
  safe=safe.replace(/(^|[^*])\*([^\n*]+?)\*(?!\*)/g,'$1<i>$2</i>');
  safe=safe.replace(/(^|[^_])_([^\n_]+?)_(?!_)/g,'$1<i>$2</i>');
  return safe;
}
function clampBubble(text,fadeColor){
  var t=String(text==null?'':text);
  var long=t.length>240||t.split('\n').length>7;
  var safe=mdLite(esc(t));
  if(!long) return '<div style="white-space:pre-wrap;word-break:break-word;">'+safe+'</div>';
  var h='<div style="position:relative;">';
  h+='<div data-clamp="140" data-exp="0" style="max-height:140px;overflow:hidden;white-space:pre-wrap;word-break:break-word;">'+safe+'</div>';
  h+='<div class="seyfade" style="position:absolute;left:0;right:0;bottom:0;height:38px;background:linear-gradient(180deg,rgba(0,0,0,0),'+fadeColor+' 92%);pointer-events:none;"></div></div>';
  h+='<button onclick="App.toggleMsg(this)" style="margin-top:5px;border:none;background:none;cursor:pointer;font-size:12.5px;font-weight:800;color:inherit;opacity:.92;padding:2px 0;">Devamını göster ⌄</button>';
  return h;
}
App.toggleMsg=function(btn){
  var wrap=btn.previousElementSibling; if(!wrap) return;
  var content=wrap.querySelector('[data-clamp]'), fade=wrap.querySelector('.seyfade'); if(!content) return;
  if(content.getAttribute('data-exp')==='1'){ content.style.maxHeight=content.getAttribute('data-clamp')+'px'; content.setAttribute('data-exp','0'); if(fade) fade.style.display=''; btn.textContent='Devamını göster ⌄'; }
  else { content.style.maxHeight='none'; content.setAttribute('data-exp','1'); if(fade) fade.style.display='none'; btn.textContent='Daha az göster ⌃'; }
};
// Tek bir ÆON sohbet balonu (giden soru ya da gelen yanıt/bildirim) için HTML üretir.
// aeonChatHTML() tam listeyi bu yardımcıyla kurar; appendAeonOutgoing() ise tam render
// yapmadan yalnızca YENİ mesajı DOM'a eklerken aynı markup'ı (sapma riski olmadan) tekrar kullanır.
function aeonItemHTML(it,enterCls){
  var h='';
  if(it.kind==='out'){
    h+='<div class="msg-row out'+enterCls+'">';
    h+='<div class="msg-bubble out">'+clampBubble(it.text,'var(--user-bubble)')+'</div>';
    var foot;
    if(it.answered) foot='<span style="color:var(--faint);">✓✓ yanıtlandı</span>';
    else if(it.reviewing) foot='<span class="aeon-typing-dots"><span></span><span></span><span></span></span><span style="color:var(--aeon);font-weight:800;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.3px;margin-left:5px;">ÆON inceliyor</span>';
    else foot='<span style="color:var(--faint);">✓ Gönderildi</span>';
    h+='<div style="font-size:11px;margin-top:3px;display:flex;gap:7px;align-items:center;">'+foot+'<span style="color:var(--faint);">'+esc(aeonTime(it.time))+'</span></div></div>';
  } else {
    h+='<div class="msg-row in'+enterCls+'">';
    h+='<div class="msg-bubble in">';
    h+='<div style="display:flex;align-items:center;gap:7px;margin-bottom:5px;"><span style="font-size:11px;font-weight:800;letter-spacing:.6px;color:#1a1404;background:linear-gradient(135deg,var(--aeon2),var(--aeon));border-radius:999px;padding:2px 9px;">⬡ ÆON</span>'+(it.unread?'<span style="width:7px;height:7px;border-radius:50%;background:#E9576F;box-shadow:0 0 6px #E9576F;"></span>':'')+'<span style="margin-left:auto;font-size:10.5px;color:var(--faint);font-weight:600;">'+esc(aeonTime(it.time))+'</span></div>';
    h+='<div style="font-size:14.5px;line-height:1.55;">'+clampBubble(it.text,'var(--card)')+'</div>';
    if(it.observer&&it.id) h+='<div style="display:flex;margin-top:7px;"><button onclick="App.deleteNotif(\''+it.id+'\')" style="margin-left:auto;border:1px solid rgba(150,110,120,0.2);cursor:pointer;background:none;color:#C77;font-weight:700;font-size:11.5px;padding:4px 10px;border-radius:9px;">🗑 Sil</button></div>';
    h+='</div></div>';
  }
  return h;
}
// ÆON = insan-döngülü sohbet: kullanıcının soruları (sağ/giden balon) panele gider,
// gözlemci ÆON adına yanıtlar (sol/gelen balon). Gözlemci mesajları da gelen balondur.
// Tümünü tek kronolojik akışta gösteririz; yazı kutusu altta sabittir.
function aeonChatHTML(){
  var h='';
  h+='<div style="display:flex;align-items:center;gap:11px;margin:2px 2px 12px;"><div style="width:46px;height:46px;border-radius:15px;background:linear-gradient(135deg,var(--aeon2),var(--aeon));display:flex;align-items:center;justify-content:center;font-size:22px;color:#1a1404;font-weight:800;box-shadow:0 8px 20px var(--aeon-glow);">⬡</div><div style="flex:1;"><div style="font-size:20px;font-weight:800;letter-spacing:2px;color:var(--text);">ÆON</div><div style="font-size:12.5px;color:var(--faint);">hep yanında · sınırsız sohbet</div></div><button onclick="App.toggleAeonSearch()" title="Mesajlarda ara" style="border:1px solid var(--field-bd);background:var(--field);color:var(--muted);cursor:pointer;border-radius:12px;width:38px;height:38px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:16px;">🔍</button></div>';
  h+='<div id="aeon-search-bar" style="display:none;margin:0 2px 12px;position:relative;">';
  h+='<input id="aeon-search-input" type="text" oninput="App.filterAeonSearch(this)" placeholder="Mesajlarda ara…" style="width:100%;box-sizing:border-box;border:1px solid var(--field-bd);background:var(--field);border-radius:14px;padding:10px 36px 10px 14px;font-size:14px;color:var(--text);outline:none;">';
  h+='<button onclick="App.clearAeonSearch()" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);border:none;background:none;cursor:pointer;color:var(--faint);font-size:15px;line-height:1;padding:4px;">✕</button>';
  h+='</div>';
  var items=[];
  notifList().filter(function(n){ return n&&!n.deleted; }).forEach(function(n){ items.push({sort:String(n.ts||n.receivedAt||''),kind:'in',text:n.text,time:n.ts||n.receivedAt,observer:true,id:n.id,unread:!n.read}); });
  var qa=(data.aeon&&Array.isArray(data.aeon.qa))?data.aeon.qa:[];
  qa.forEach(function(x){ if(!x) return;
    items.push({sort:String(x.ts||''),kind:'out',text:x.question,time:x.ts,answered:!!x.answer,reviewing:!!x.reviewingAt});
    if(x.answer) items.push({sort:String(x.answeredAt||x.ts||''),kind:'in',text:x.answer,time:x.answeredAt||x.ts});
  });
  items.sort(function(a,b){ return a.sort<b.sort?-1:(a.sort>b.sort?1:0); });
  // Geçmiş çok uzadıysa (ör. aylarca birikmiş yüzlerce mesaj) her tam render'da TÜMÜNÜ
  // yeniden kurmak yerine yalnızca son AEON_PAGE_SIZE öğeyi göster; üstte "daha eski
  // mesajları göster" düğmesiyle kullanıcı isterse tam geçmişi açabilir (veri kaybı yok —
  // data.aeon.qa/notifications'ta her şey saklı kalır, yalnızca render'da sınırlanır).
  var totalItems=items.length, hiddenOlder=0, visibleItems=items;
  if(totalItems>AEON_PAGE_SIZE && !ui.aeonShowAllHistory){
    hiddenOlder=totalItems-AEON_PAGE_SIZE;
    visibleItems=items.slice(hiddenOlder);
  }
  h+='<div id="aeon-thread" style="display:flex;flex-direction:column;gap:10px;">';
  if(hiddenOlder>0){
    h+='<div style="display:flex;justify-content:center;margin:2px 0 4px;"><button onclick="App.showAeonHistory()" style="border:1px solid var(--field-bd);background:var(--field);color:var(--muted);cursor:pointer;border-radius:999px;padding:7px 16px;font-size:12px;font-weight:700;">↑ Daha eski '+hiddenOlder+' mesajı göster</button></div>';
  }
  if(!items.length){
    h+='<div class="msg-empty-hint" style="text-align:center;padding:26px 18px;border-radius:20px;background:linear-gradient(160deg,rgba(230,193,90,0.13),rgba(201,154,58,0.07));border:1px solid rgba(201,154,58,0.2);"><div style="font-size:30px;margin-bottom:7px;">⬡</div><div style="font-size:14.5px;font-weight:800;color:var(--text);margin-bottom:5px;">Burası senin sessiz limanın</div><div style="font-size:12.5px;color:var(--muted);line-height:1.6;">Aklından geçeni, içini dökmek istediğin her şeyi buraya bırakabilirsin. Ne zaman istersen — gece ya da gündüz — ben hep buradayım. ✨</div></div>';
  }
  // Yalnızca son render'dan bu yana beliren mesajlara giriş animasyonu oynat (tüm geçmiş her seferinde titremesin)
  var prevDateStr=null, newestSort=items.length?items[items.length-1].sort:null;
  visibleItems.forEach(function(it){
    var ds=''; try{ var dd=new Date(it.time); if(!isNaN(dd.getTime())) ds=fmt(dd); }catch(e){}
    if(ds && ds!==prevDateStr){ h+='<div class="msg-daydiv">'+esc(aeonDayDivider(it.time))+'</div>'; prevDateStr=ds; }
    var enterCls=(aeonLastSeenSort!=null && it.sort>aeonLastSeenSort)?' msg-enter':'';
    h+=aeonItemHTML(it,enterCls);
  });
  h+='</div>';
  aeonLastSeenSort=newestSort;
  aeonLastRenderedDateStr=prevDateStr;
  // alta sabit yazı kutusu (opak zemin → akış altından geçerken okunur kalır)
  h+='<div id="aeon-sticky-bar" style="position:sticky;bottom:0;background:var(--chatbar);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);padding:12px 0 6px;margin-top:6px;z-index:5;">';
  h+='<button id="aeon-scroll-fab" class="aeon-scrollfab" style="top:-52px;right:4px;" onclick="App.aeonScrollToBottom()" aria-label="En alta in">⌄</button>';
  if(ui.aeonError) h+='<div style="font-size:12.5px;color:#C0605F;background:rgba(220,120,120,0.1);border:1px solid rgba(220,120,120,0.25);border-radius:12px;padding:9px 11px;margin-bottom:8px;">'+esc(ui.aeonError)+'</div>';
  var draftLen=String(ui.aeonDraft||'').length, leftChars=600-draftLen;
  h+='<div id="aeon-char-count" style="display:'+(leftChars<100?'block':'none')+';font-size:10.5px;color:var(--faint);text-align:right;margin-bottom:3px;">'+leftChars+' karakter kaldı</div>';
  h+='<div style="display:flex;gap:8px;align-items:flex-end;">';
  h+='<textarea id="aeon-input" class="aeon-input-field" oninput="App.onAeonDraft(this)" onkeydown="App.onAeonKeydown(event)" placeholder="İçini dök, buradayım…" rows="1" style="flex:1;border:1px solid var(--field-bd);background:var(--field);border-radius:18px;padding:11px 14px;font-size:14.5px;resize:none;outline:none;line-height:1.4;max-height:120px;overflow-y:auto;">'+esc(ui.aeonDraft||'')+'</textarea>';
  h+='<button id="aeon-send-btn" class="aeon-send-btn'+(draftLen?'':' is-disabled')+'" onclick="App.askAeon()" aria-label="Gönder" style="flex-shrink:0;border:none;cursor:pointer;width:46px;height:46px;border-radius:50%;font-size:18px;color:#1a1404;background:linear-gradient(135deg,var(--aeon2),var(--aeon));box-shadow:0 6px 16px var(--aeon-glow);display:flex;align-items:center;justify-content:center;">➤</button>';
  h+='</div></div>';
  return h;
}
function mesajHTML(){
  var h=lunaChatHTML();
  h+='<div style="height:1px;background:linear-gradient(90deg,transparent,rgba(150,110,120,0.25),transparent);margin:22px 0 16px;"></div>';
  h+=aeonChatHTML();
  return h;
}
App.openMesaj=function(){ markNotifsRead(); var ex=document.getElementById('sey-inbox-pop'); if(ex) ex.remove(); ui.tab='mesaj'; ui.aeonScrollBottom=true; render(); };
App.dismissPopup=function(){ var pend=notifList().filter(function(n){ return n&&!n.deleted&&!n.seen; }); pend.forEach(function(n){ n.seen=true; }); if(pend.length) save(); var ex=document.getElementById('sey-inbox-pop'); if(ex) ex.remove(); render(); };
App.closeAeonPop=function(){ var ex=document.getElementById('sey-inbox-pop'); if(ex) ex.remove(); };
App.deleteNotif=function(id){ var n=null; notifList().forEach(function(x){ if(x&&x.id===id) n=x; }); if(!n) return; n.deleted=true; n.deletedAt=new Date().toISOString(); save(); render(); toast('Bildirim silindi'); };

setTimeout(fetchObserverInbox,1500);
setInterval(fetchObserverInbox,30000); // ön planda ~30 sn'de bir kontrol (ÆON yanıtları daha hızlı görünsün)
document.addEventListener('visibilitychange',function(){ if(!document.hidden) fetchObserverInbox(); });
window.addEventListener('focus',fetchObserverInbox);   // iOS PWA: sekmeye/uygulamaya dönünce hemen çek
window.addEventListener('pageshow',fetchObserverInbox); // bfcache'ten geri dönüşte
window.addEventListener('online',fetchObserverInbox);   // bağlantı gelince bekleyen makbuzu da gönderir

render();
setTimeout(replayAnswerPopup,900); // açılışta: önceki oturumda inmiş yanıtları popup yap + "görüldü" işaretle
})();
