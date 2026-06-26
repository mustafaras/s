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
  {key:'selfKind',icon:'🫶',title:'Kendime kötü davranmadım',sub:'En önemli tik bu.',msg:'Bugünün en kıymetli hamlesi: kendine yüklenmemek.'}
];
var HABIT_TOTAL=HABITS.length;
var MOODS=[
  {id:'cok-iyi',label:'Çok iyi ☀️',short:'Çok iyi',emoji:'☀️',resp:'Bugün ışık saçıyoruz anlaşılan ☀️'},
  {id:'iyi',label:'İyi 🌼',short:'İyi',emoji:'🌼',resp:'Gayet güzel. Ritim kuruluyor 🌼'},
  {id:'normal',label:'Normal 🌿',short:'Normal',emoji:'🌿',resp:'Normal de olur. Her gün festival değil 🌿'},
  {id:'zorlandim',label:'Zorlandım 🌧️',short:'Zor',emoji:'🌧️',resp:'Zor günler oyundan düşürmez Sevgili Günışığı 🌧️'},
  {id:'cok-zorlandim',label:'Çok zorlandım 🫧',short:'Çok zor',emoji:'🫧',resp:'Bugün sadece kendine yüklenmemek bile yeter 🫧'}
];
var SOS_OPTS=['Su içtim 💧','Kahve/çay yaptım ☕','Yoğurt + tarçın denedim 🥣','Meyve + yoğurt yaptım 🍓','1-2 kare bitterle kapattım 🍫','Hâlâ istiyorum ama kontrollü yiyeceğim 🤝'];
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
var RITUAL_STAGES=[
  {key:'transition',label:'Geceye geçiş',hint:'Işık düşsün, tempo yavaşlasın.',secs:60,
    voice:'Hoş geldin. Şimdi yavaşça geceye geçiyoruz. Acele yok. Işıkları biraz kıs, telefonu bırakmaya hazırlan ve omuzlarını usulca aşağı indir.',
    lines:['Işığı yumuşat, ekranı biraz daha kıs.','Omuzlarını yavaşça aşağı bırak.','Çeneni gevşet, dilini damağından ayır.','Hiçbir yere yetişmen gerekmiyor; sadece buradasın.','Bir sonraki nefesinle biraz daha yavaşla.']},
  {key:'breath',label:'Nefes senkronu',hint:'4 sn al · 6 sn ver.',secs:180,
    voice:'Şimdi nefesini yavaşça uzatıyoruz. Burnundan dört sayarak yumuşacık al… ve ağzından altı sayarak uzun uzun bırak.',
    lines:['Nefesini zorlama, kendi akışında bıraksın.','Verirken gün içindeki gerginliği de bırak.','Her nefeste biraz daha ağırlaşıyorsun.','Karnın yumuşakça inip kalksın.']},
  {key:'body',label:'Body scan',hint:'Çene, omuz, göğüs, bacak gevşet.',secs:120,
    voice:'Şimdi bedenini yumuşacık tarıyoruz. Dikkatini hiç acele etmeden yukarıdan aşağıya indir ve dokunduğun her yeri bırak.',
    lines:['Alnını ve gözlerinin çevresini yumuşat.','Çeneni ve dilini serbest bırak.','Omuzların yatağa doğru eriyip dağılsın.','Göğsün ve karnın gevşesin.','Bacakların ağırlaşsın, yatağa bıraksın kendini.']},
  {key:'offload',label:'Zihni boşalt',hint:'Yarına tek not bırak ve bırak.',secs:120,
    voice:'Şimdi zihnini hafifletiyoruz. Aklında dönen yarına ait tek bir şeyi düşün, onu bir kenara yaz ve gece boyunca tutmana gerek yok.',
    lines:['Yarın için tek bir not bırak, gerisini sabaha sakla.','Bir düşünce gelirse, yumuşakça "yarın" de ve geç.','Zihnin bir göl gibi durulsun.','Tutmaya çalıştığın her şeyi nefesinle bırak.']},
  {key:'descent',label:'Uykuya iniş',hint:'Ekran sadeleşsin, sadece ritim kalsın.',secs:120,
    voice:'Artık yavaşça uykuya iniyoruz. Yapacak bir şey kalmadı. Sadece nefesini izle ve istediğin an ekranı bırakabilirsin.',
    lines:['Sadece nefesini izle, gerisi kendiliğinden olacak.','Bedenin gittikçe ağırlaşıyor, yatağa gömülüyor.','Düşünceler gelip geçsin, sen sadece izle.','Ekranı bırak, kendini uykuya bırak. İyi geceler.']}
];
var BREATH_LINES=['Burnundan yavaşça al… ve uzun uzun ver.','Çok güzel. Aynı ritimde devam et.','Her nefeste biraz daha gevşiyorsun.','Acele yok; nefes seni taşısın.'];
var BODY_SCAN_POINTS=[
  {label:'Çene ve yüz',cue:'Dişlerini sıkma, yüzü yumuşat.'},
  {label:'Omuz ve boyun',cue:'Omuzları aşağı bırak, çeneyi serbest bırak.'},
  {label:'Göğüs ve karın',cue:'Nefes verirken karnı gevşet.'},
  {label:'Kalça ve bacak',cue:'Bacakları yatağa ağırlaştır, bırak gitsin.'}
];
var FLOW=[{id:'spot',emoji:'🩸',label:'Leke'},{id:'light',emoji:'🌸',label:'Hafif'},{id:'medium',emoji:'🌺',label:'Orta'},{id:'heavy',emoji:'🌹',label:'Yoğun'}];
var SYMPTOMS=[{id:'kramp',emoji:'🤕',label:'Kramp'},{id:'bas',emoji:'🤯',label:'Baş ağrısı'},{id:'siskinlik',emoji:'🎈',label:'Şişkinlik'},{id:'yorgun',emoji:'🥱',label:'Yorgunluk'},{id:'duygu',emoji:'🥲',label:'Duygusal'},{id:'istah',emoji:'🍫',label:'İştah'},{id:'sanci',emoji:'⚡',label:'Sancı'},{id:'cilt',emoji:'🌋',label:'Cilt'}];
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
  if(!d.settings) d.settings={nickname:'Sevgili Günışığı',notificationsWanted:false};
  if(typeof d.settings.ghToken!=='string') d.settings.ghToken='';
  if(typeof d.settings.ghRepo!=='string') d.settings.ghRepo='';
  if(typeof d.settings.ghBranch!=='string') d.settings.ghBranch='';
  if(typeof d.settings.openaiKey!=='string') d.settings.openaiKey='';
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
  if(!d.locationHistory) d.locationHistory=[];
  if(typeof d.lastOpenedAt!=='string') d.lastOpenedAt='';
  d.version=2;
  return d;
}
var dark=false; try{ dark=localStorage.getItem(TKEY)==='dark'; }catch(e){}
var ui={tab:'bugun', sosOpts:[], sosLeft:600, sosTiming:false, sosDone:false, dayDetail:null, emergency:false, resetStep:0, noteIndex:0, forceStart:false, pulse:null, keyEdit:false, sleepRitualTiming:false, sleepRitualLeft:0, sleepRitualTotal:0, ritualOpen:false, ritualRunning:false, ritualDone:false, ritualLeft:600, ritualTotal:600, ritualSoundMode:'ambient', ritualStartedAt:null, lunaDraft:'', aeonDraft:'', askKind:null, askQuestion:'', lunaError:null, aeonError:null};
var sosInterval=null, sleepRitualInterval=null, ritualInterval=null, toastTimer=null, noteTimer=null, pulseTimer=null;
var ritualAudio={ctx:null,master:null,noiseSource:null,noiseGain:null,padOsc:null,padGain:null,stageKey:null,running:false,breathPhase:null,speechReady:false,speechUnlocked:false,lastSpokenLine:null,lineStamp:0,lineCursor:0};
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
function emptyHabits(){ var out={}; HABITS.forEach(function(h){ out[h.key]=false; }); return out; }
function countRec(rec){ return rec&&rec.habits?HABITS.reduce(function(a,h){return a+(rec.habits[h.key]?1:0);},0):0; }
function emptyMeals(){ return {breakfast:'',lunch:'',dinner:'',snack:''}; }
function emptyWindDown(){ return {steps:{light:false,breath:false,dump:false,cool:false},lastMinutes:null,lastDoneAt:null,offloadNote:'',events:[],sessions:[]}; }
function getDay(d,date,idx){ if(!d.days[date]) d.days[date]={dayIndex:idx,habits:emptyHabits(),mood:null,cravingSOSCount:0,cravingOptionsUsed:[],note:'',savedAt:null,meals:emptyMeals(),sleep:{hours:null,quality:null,med:{type:null,note:''},windDown:emptyWindDown()},walk:{steps:null,minutes:null},flow:null,symptoms:[],sessions:[]}; else { var r=d.days[date]; if(!r.habits) r.habits=emptyHabits(); HABITS.forEach(function(h){ if(!(h.key in r.habits)) r.habits[h.key]=false; }); if(!r.meals) r.meals=emptyMeals(); if(!r.sleep) r.sleep={hours:null,quality:null,med:{type:null,note:''},windDown:emptyWindDown()}; if(!r.sleep.med||typeof r.sleep.med!=='object') r.sleep.med={type:null,note:''}; if(typeof r.sleep.med.note!=='string') r.sleep.med.note=''; if(!r.sleep.windDown) r.sleep.windDown=emptyWindDown(); if(!r.sleep.windDown.steps) r.sleep.windDown.steps=emptyWindDown().steps; WIND_DOWN_STEPS.forEach(function(s){ if(!(s.key in r.sleep.windDown.steps)) r.sleep.windDown.steps[s.key]=false; }); if(typeof r.sleep.windDown.offloadNote!=='string') r.sleep.windDown.offloadNote=''; if(!Array.isArray(r.sleep.windDown.events)) r.sleep.windDown.events=[]; if(!Array.isArray(r.sleep.windDown.sessions)) r.sleep.windDown.sessions=[]; if(!r.walk) r.walk={steps:null,minutes:null}; if(!('flow' in r)) r.flow=null; if(!Array.isArray(r.symptoms)) r.symptoms=[]; if(!Array.isArray(r.sessions)) r.sessions=[]; } return d.days[date]; }
function ritualStageInfo(){
  var elapsed=Math.max(0,ui.ritualTotal-ui.ritualLeft);
  var sum=0;
  for(var i=0;i<RITUAL_STAGES.length;i++){
    var st=RITUAL_STAGES[i];
    var end=sum+st.secs;
    if(elapsed<end || i===RITUAL_STAGES.length-1){
      return {index:i,stage:st,elapsedInStage:Math.max(0,elapsed-sum),leftInStage:Math.max(0,end-elapsed),sumBefore:sum};
    }
    sum=end;
  }
  return {index:0,stage:RITUAL_STAGES[0],elapsedInStage:0,leftInStage:RITUAL_STAGES[0].secs,sumBefore:0};
}
function ritualOrbScale(){
  var info=ritualStageInfo();
  var t=info.elapsedInStage, P=Math.PI*2, m;
  switch(info.stage.key){
    case 'transition':{
      var ph=Math.sin(t/12*P);
      m={scale:(0.965+0.035*ph),glow:(0.42+0.12*((ph+1)/2)),dur:1300};
      break; }
    case 'breath':{
      var c=t%10;
      if(c<4){ var f=c/4; m={scale:(0.82+f*0.24),glow:(0.40+0.24*f),dur:900}; }
      else { var f2=(c-4)/6; m={scale:(1.06-f2*0.24),glow:(0.64-0.24*f2),dur:900}; }
      break; }
    case 'body':{
      var pb=Math.sin(t/16*P);
      m={scale:(0.97+0.03*pb),glow:(0.32+0.09*((pb+1)/2)),dur:1500};
      break; }
    case 'offload':{
      m={scale:(0.97+0.012*Math.sin(t/9*P)),glow:0.30,dur:1600};
      break; }
    case 'descent':{
      var p=Math.min(1,t/120), amp=0.03*(1-p), base=0.96-0.08*p;
      m={scale:(base+amp*Math.sin(t/(10+10*p)*P)),glow:(0.40*(1-0.55*p)),dur:1600};
      break; }
    default:
      m={scale:1,glow:0.42,dur:1200};
  }
  return {scale:(+m.scale).toFixed(3),glow:(+m.glow).toFixed(3),dur:m.dur};
}
function ritualBodyPoint(info){
  var idx=Math.min(BODY_SCAN_POINTS.length-1,Math.floor(info.elapsedInStage/30));
  return BODY_SCAN_POINTS[Math.max(0,idx)];
}
function ritualBreathPrompt(info){
  var t=info.elapsedInStage%10;
  if(t<4) return {label:'Nefes al',sub:'4 saniye'};
  return {label:'Nefes ver',sub:'6 saniye'};
}
function ritualBreathState(info){
  var c=info.elapsedInStage%10;
  if(c<4) return {phase:'in',label:'Al',count:Math.max(1,4-Math.floor(c)),total:4,pct:c/4};
  return {phase:'out',label:'Ver',count:Math.max(1,6-Math.floor(c-4)),total:6,pct:(c-4)/6};
}
function ritualModeMeta(mode){
  if(mode==='guided') return {label:'Rehberli',icon:'🗣️',desc:'Sesli koç + nefes yönlendirmesi'};
  if(mode==='ambient') return {label:'Ambiyans',icon:'🌊',desc:'Sözsüz, sarmalayan ses ortamı'};
  return {label:'Sessiz',icon:'🌑',desc:'Yalnızca görsel rehber'};
}
function ritualGuideText(info){
  var st=info.stage;
  if(st.key==='breath'){ var b=ritualBreathState(info); return b.phase==='in'?'Burnundan yavaşça nefes al…':'Ağzından uzun uzun ver…'; }
  var lines=st.lines||[st.hint];
  var idx=Math.floor(info.elapsedInStage/14)%lines.length;
  return lines[idx];
}
function speechAvailable(){ return typeof window!=='undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance!=='undefined'; }
var ritualVoices=[];
function ritualWarmVoices(){
  if(!speechAvailable()) return;
  try{
    ritualVoices=window.speechSynthesis.getVoices()||[];
    window.speechSynthesis.onvoiceschanged=function(){ try{ ritualVoices=window.speechSynthesis.getVoices()||[]; }catch(e){} };
  }catch(e){}
}
function ritualPickVoice(){
  if(!speechAvailable()) return null;
  try{
    var vs=(ritualVoices&&ritualVoices.length)?ritualVoices:(window.speechSynthesis.getVoices()||[]);
    var tr=null,trTR=null;
    for(var i=0;i<vs.length;i++){ var lg=(vs[i].lang||'').toLowerCase(); if(lg==='tr-tr'||lg==='tr_tr'){ trTR=vs[i]; break; } if(!tr && /^tr(-|_|$)/.test(lg)) tr=vs[i]; }
    return trTR||tr||null;
  }catch(e){ return null; }
}
function ritualSpeechUnlock(){
  if(!speechAvailable()) return;
  try{
    var synth=window.speechSynthesis;
    try{ synth.resume(); }catch(e){}
    ritualVoices=synth.getVoices()||ritualVoices;
    if(!ritualAudio.speechUnlocked){
      var u=new SpeechSynthesisUtterance('\u00a0');
      u.volume=0.02; u.rate=1; u.lang='tr-TR';
      var v0=ritualPickVoice(); if(v0) u.voice=v0;
      synth.speak(u);
      ritualAudio.speechUnlocked=true;
    }
  }catch(e){}
}
function ritualSpeak(text,opts){
  if(!speechAvailable() || (ui.ritualSoundMode!=='guided' && !(opts&&opts.force)) || (!ui.ritualRunning && !(opts&&opts.force)) || !text) return;
  opts=opts||{};
  try{
    var synth=window.speechSynthesis;
    try{ synth.resume(); }catch(e){}
    if(opts.interrupt && ritualAudio.speechUnlocked) synth.cancel();
    var u=new SpeechSynthesisUtterance(text);
    var v=ritualPickVoice();
    if(v){ u.voice=v; u.lang=v.lang||'tr-TR'; } else { u.lang='tr-TR'; }
    u.rate=opts.rate||0.70;
    u.pitch=opts.pitch||0.80;
    u.volume=opts.volume!=null?opts.volume:0.95;
    ritualAudio.speechUnlocked=true;
    synth.speak(u);
    setTimeout(function(){ try{ if(window.speechSynthesis.paused) window.speechSynthesis.resume(); }catch(e){} },180);
  }catch(e){}
}
function ritualSpeechStop(){ if(speechAvailable()){ try{ window.speechSynthesis.cancel(); }catch(e){} } ritualAudio.lastSpokenLine=null; }
function trackRitualEvent(type,meta){
  var d=getDay(data,todayStr(),dayIndexFor(todayStr()));
  if(!d.sleep.windDown) d.sleep.windDown=emptyWindDown();
  if(!Array.isArray(d.sleep.windDown.events)) d.sleep.windDown.events=[];
  d.sleep.windDown.events.push({type:type,at:new Date().toISOString(),left:ui.ritualLeft,stage:ritualStageInfo().stage.key,mode:ui.ritualSoundMode,meta:meta||null});
  if(d.sleep.windDown.events.length>80) d.sleep.windDown.events=d.sleep.windDown.events.slice(-80);
  d.savedAt=new Date().toISOString();
  save();
}
function logRitualSession(completed){
  var d=getDay(data,todayStr(),dayIndexFor(todayStr()));
  if(!d.sleep.windDown) d.sleep.windDown=emptyWindDown();
  if(!Array.isArray(d.sleep.windDown.sessions)) d.sleep.windDown.sessions=[];
  var info=ritualStageInfo();
  var elapsedSec=Math.max(0,ui.ritualTotal-ui.ritualLeft);
  var rec={
    startedAt:ui.ritualStartedAt||null,
    endedAt:new Date().toISOString(),
    completed:!!completed,
    mode:ui.ritualSoundMode,
    durationSec:elapsedSec,
    minutes:Math.round(elapsedSec/60*10)/10,
    stageReached:info.stage.key,
    stageIndex:info.index+1,
    stagesTotal:RITUAL_STAGES.length,
    offloadNote:(d.sleep.windDown.offloadNote||'')
  };
  d.sleep.windDown.sessions.push(rec);
  if(d.sleep.windDown.sessions.length>40) d.sleep.windDown.sessions=d.sleep.windDown.sessions.slice(-40);
  d.savedAt=new Date().toISOString();
  save();
}
function ritualAudioAvailable(){ return typeof window!=='undefined' && !!(window.AudioContext||window.webkitAudioContext); }
function ensureRitualAudio(){
  if(!ritualAudioAvailable()) return null;
  if(ritualAudio.ctx) return ritualAudio.ctx;
  var Ctor=window.AudioContext||window.webkitAudioContext;
  var ctx=new Ctor();
  var master=ctx.createGain(); master.gain.value=0; master.connect(ctx.destination);
  var noiseGain=ctx.createGain(); noiseGain.gain.value=0;
  var noiseBuffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);
  var ch=noiseBuffer.getChannelData(0);
  var b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
  for(var i=0;i<ch.length;i++){
    var white=Math.random()*2-1;
    b0=0.99886*b0+white*0.0555179;
    b1=0.99332*b1+white*0.0750759;
    b2=0.96900*b2+white*0.1538520;
    b3=0.86650*b3+white*0.3104856;
    b4=0.55000*b4+white*0.5329522;
    b5=-0.7616*b5-white*0.0168980;
    ch[i]=(b0+b1+b2+b3+b4+b5+b6+white*0.5362)*0.11;
    b6=white*0.115926;
  }
  var noiseSource=ctx.createBufferSource();
  noiseSource.buffer=noiseBuffer; noiseSource.loop=true;
  var lowpass=ctx.createBiquadFilter(); lowpass.type='lowpass'; lowpass.frequency.value=900;
  noiseSource.connect(lowpass); lowpass.connect(noiseGain); noiseGain.connect(master); noiseSource.start();
  var padOsc=ctx.createOscillator(); padOsc.type='sine'; padOsc.frequency.value=126;
  var padGain=ctx.createGain(); padGain.gain.value=0;
  var padFilter=ctx.createBiquadFilter(); padFilter.type='lowpass'; padFilter.frequency.value=420;
  padOsc.connect(padFilter); padFilter.connect(padGain); padGain.connect(master); padOsc.start();
  var padOsc2=ctx.createOscillator(); padOsc2.type='triangle'; padOsc2.frequency.value=189;
  var padGain2=ctx.createGain(); padGain2.gain.value=0;
  var padFilter2=ctx.createBiquadFilter(); padFilter2.type='lowpass'; padFilter2.frequency.value=620;
  padOsc2.connect(padFilter2); padFilter2.connect(padGain2); padGain2.connect(master); padOsc2.start();
  var lfoOsc=ctx.createOscillator(); lfoOsc.type='sine'; lfoOsc.frequency.value=0.07;
  var lfoGain=ctx.createGain(); lfoGain.gain.value=0;
  lfoOsc.connect(lfoGain); lfoGain.connect(padGain2.gain); lfoOsc.start();
  ritualAudio.ctx=ctx; ritualAudio.master=master; ritualAudio.noiseSource=noiseSource; ritualAudio.noiseGain=noiseGain; ritualAudio.padOsc=padOsc; ritualAudio.padGain=padGain; ritualAudio.padOsc2=padOsc2; ritualAudio.padGain2=padGain2; ritualAudio.lfoOsc=lfoOsc; ritualAudio.lfoGain=lfoGain;
  return ctx;
}
function ritualCue(freq,dur,vol){
  var ctx=ensureRitualAudio(); if(!ctx || ui.ritualSoundMode!=='guided') return;
  var o=ctx.createOscillator(); var g=ctx.createGain(); var lp=ctx.createBiquadFilter();
  lp.type='lowpass'; lp.frequency.value=Math.min(900,(freq||300)*2.0); lp.Q.value=0.5;
  o.type='sine'; o.frequency.value=freq||300; g.gain.value=0;
  o.connect(lp); lp.connect(g); g.connect(ritualAudio.master);
  var t=ctx.currentTime; var D=dur||1.4; var V=vol||0.035;
  g.gain.setValueAtTime(0.0001,t);
  g.gain.linearRampToValueAtTime(V,t+0.32);
  g.gain.exponentialRampToValueAtTime(0.0006,t+D);
  o.frequency.setValueAtTime(freq||300,t);
  o.frequency.linearRampToValueAtTime((freq||300)*0.96,t+D);
  o.start(t); o.stop(t+D+0.06);
}
function ritualAudioSetTargets(mode,stageKey){
  var ctx=ensureRitualAudio(); if(!ctx || !ritualAudio.master) return;
  if(ctx.state==='suspended'){ try{ ctx.resume(); }catch(e){} }
  var t=ctx.currentTime;
  var master=0,noise=0,pad=0,pad2=0,padFreq=126;
  if(mode==='ambient'){ master=0.62; noise=0.34; pad=0.17; pad2=0.07; }
  else if(mode==='guided'){ master=0.52; noise=0.20; pad=0.12; pad2=0.03; }
  if(stageKey==='transition'){ padFreq=132; }
  else if(stageKey==='breath'){ padFreq=120; pad+=0.02; }
  else if(stageKey==='body'){ padFreq=112; }
  else if(stageKey==='offload'){ padFreq=104; noise*=0.8; }
  else if(stageKey==='descent'){ padFreq=98; noise*=0.66; pad*=0.7; pad2*=0.6; }
  ritualAudio.master.gain.setTargetAtTime(master,t,0.7);
  ritualAudio.noiseGain.gain.setTargetAtTime(noise,t,0.9);
  ritualAudio.padGain.gain.setTargetAtTime(pad,t,0.9);
  ritualAudio.padOsc.frequency.setTargetAtTime(padFreq,t,1.2);
  if(ritualAudio.padGain2) ritualAudio.padGain2.gain.setTargetAtTime(pad2,t,1.1);
  if(ritualAudio.padOsc2) ritualAudio.padOsc2.frequency.setTargetAtTime(padFreq*1.5,t,1.4);
  if(ritualAudio.lfoGain) ritualAudio.lfoGain.gain.setTargetAtTime(mode==='ambient'?0.05:0,t,1.2);
}
function ritualAudioSync(forceCue){
  var info=ritualStageInfo();
  if(!ui.ritualRunning){ ritualAudioSetTargets('silent',info.stage.key); ritualAudio.running=false; ritualAudio.breathPhase=null; return; }
  ritualAudioSetTargets(ui.ritualSoundMode,info.stage.key);
  ritualAudio.running=true;
  if(ui.ritualSoundMode==='guided' && speechAvailable()){ try{ if(window.speechSynthesis.paused) window.speechSynthesis.resume(); }catch(e){} }
  if(forceCue && ui.ritualSoundMode==='guided') ritualCue(300,1.6,0.03);
  var gm=ui.ritualSoundMode==='guided';
  if(info.stage.key!==ritualAudio.stageKey){
    ritualAudio.stageKey=info.stage.key;
    ritualAudio.breathPhase=null;
    ritualAudio.lineStamp=info.elapsedInStage;
    ritualAudio.lineCursor=0;
    if(gm){
      var f=info.stage.key==='breath'?300:(info.stage.key==='descent'?232:288);
      ritualCue(f,1.8,0.032);
      ritualSpeak(info.stage.voice,{interrupt:true});
    }
  }
  if(gm && info.stage.key==='breath'){
    var c=info.elapsedInStage%10;
    var ph=c<4?'in':'out';
    if(ph!==ritualAudio.breathPhase){
      ritualAudio.breathPhase=ph;
      if(ph==='in') ritualCue(264,3.4,0.03);
      else ritualCue(198,5.2,0.028);
      if(info.elapsedInStage>11){
        var cyc=Math.floor(info.elapsedInStage/10);
        if(cyc%4===0){
          if(ph==='in') ritualSpeak(BREATH_LINES[(cyc/4)%BREATH_LINES.length],{interrupt:true,rate:0.66,pitch:0.80});
        } else {
          ritualSpeak(ph==='in'?'Nefes al':'Nefes ver',{interrupt:true,rate:0.64,pitch:0.80,volume:0.9});
        }
      }
    }
  } else if(gm){
    ritualAudio.breathPhase=null;
    if(info.stage.lines && info.stage.lines.length && (info.elapsedInStage-(ritualAudio.lineStamp||0))>=21){
      ritualAudio.lineStamp=info.elapsedInStage;
      ritualAudio.lineCursor=(ritualAudio.lineCursor||0)+1;
      ritualSpeak(info.stage.lines[ritualAudio.lineCursor%info.stage.lines.length],{interrupt:false,rate:0.68,pitch:0.80});
    }
  } else {
    ritualAudio.breathPhase=null;
  }
}
function spanEnd(){ var end=todayStr(); for(var d in data.days){ if(diffDays(d,end)<0) end=d; } return end; }
function allDays(){ var out=[],s=data.startDate; var n=Math.max(1,diffDays(s,spanEnd())+1); if(n>3000) n=3000; for(var i=0;i<n;i++){ var date=addDays(s,i); out.push({i:i+1,date:date,rec:data.days[date]||null}); } return out; }
function bestStreak(days){ var b=0,c=0; days.forEach(function(d){ if(countRec(d.rec)>=4){c++;b=Math.max(b,c);} else c=0; }); return b; }
function topMood(moods){ var k=null,m=0; for(var x in moods){ if(moods[x]>m){m=moods[x];k=x;} } var o=k?find(MOODS,'id',k):null; return o?o.label:'—'; }
function moodEmoji(id){ var o=find(MOODS,'id',id); return o?o.emoji:''; }
function find(arr,key,val){ for(var i=0;i<arr.length;i++){ if(arr[i][key]===val) return arr[i]; } return null; }
function currentStreak(){ var c=0,date=todayStr(); if(countRec(data.days[date])<4) date=addDays(date,-1); while(diffDays(data.startDate,date)>=0){ if(countRec(data.days[date])>=4){ c++; date=addDays(date,-1); } else break; } return c; }
function daysTracked(){ var n=0; for(var d in data.days){ var r=data.days[d]; if(countRec(r)>0||(r&&r.mood)||(r&&r.note)||(r&&r.meals&&(r.meals.breakfast||r.meals.lunch||r.meals.dinner||r.meals.snack))) n++; } return n; }
function syncConfigured(){ var s=data.settings||{}; return !!(s.ghToken&&s.ghRepo); }
function savedToday(){ return data.lastSyncDate===todayStr(); }
function saveBanner(){
  if(!syncConfigured()) return '<div id="sey-save-banner" onclick="App.go(\'ayarlar\')" style="cursor:pointer;background:linear-gradient(135deg,#FFE19A,#F7C9B0);border-radius:18px;padding:13px 15px;display:flex;align-items:center;gap:11px;box-shadow:0 8px 20px rgba(240,180,140,0.3);"><span style="font-size:22px;">🔗</span><div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:800;color:#7A4A2E;">Repoya bağlan</div><div style="font-size:12px;color:#8A5A3E;line-height:1.35;">Verilerin kaydedilsin diye Ayarlar\'dan bir kez bağlan.</div></div><span style="font-size:18px;color:#7A4A2E;">›</span></div>';
  if(savedToday()) return '<div id="sey-save-banner" style="background:rgba(143,191,138,0.16);border:1px solid rgba(143,191,138,0.4);border-radius:16px;padding:10px 14px;display:flex;align-items:center;gap:9px;"><span style="font-size:16px;">✅</span><span style="font-size:13px;font-weight:600;color:var(--text2);">Bugün repoya kaydedildi. Harika.</span></div>';
  return '<div id="sey-save-banner" style="background:linear-gradient(135deg,#E9899F,#C9B8FF);border-radius:18px;padding:14px 15px;display:flex;align-items:center;gap:11px;box-shadow:0 10px 24px rgba(220,130,150,0.4);"><span style="font-size:22px;">📌</span><div style="flex:1;min-width:0;"><div style="font-size:14.5px;font-weight:800;color:#fff;">Bugünü kaydet</div><div style="font-size:12px;color:rgba(255,255,255,0.92);line-height:1.35;">Günlük kayıt önemli — tek dokunuşla repoya gönder.</div></div><button onclick="App.saveToday()" style="border:none;cursor:pointer;background:rgba(255,255,255,0.95);color:#B05070;font-weight:800;font-size:13px;padding:9px 15px;border-radius:12px;flex-shrink:0;">Kaydet</button></div>';
}
function updateSaveBanner(){ var el=document.getElementById('sey-save-banner'); if(el){ var t=document.createElement('div'); t.innerHTML=saveBanner(); if(t.firstChild) el.replaceWith(t.firstChild); } }
window.SeyOnSynced=function(date){ data.lastSyncDate=todayStr(); ui.keyEdit=false; try{ localStorage.setItem(KEY,JSON.stringify(data)); }catch(e){} updateSaveBanner(); if(ui.tab==='ayarlar') render(); };
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(data)); }catch(e){} if(window.SeySync){ try{ window.SeySync.schedule(data); }catch(e){} } }
function commit(msg){ save(); render(); if(msg) toast(msg); }

function interp(sweet,walk,evening){
  if(sweet>=5) return 'Tatlı kontrolünde ritim oluşuyor. Kavga değil, yönetim.';
  if(evening>=5) return 'Akşam atıştırması azaldıkça sabah daha hafif başlar.';
  if(walk>=4) return 'Yürüyüş günleri artmış. Bu Şeyma hanımın lehine delildir.';
  if(sweet+walk+evening>=3) return 'Zor günler var ama sistem devam ediyor. Olay bu.';
  return 'Bir haftada birkaç küçük hamle bile gayet iş yapar.';
}
function weekBlock(w,days){
  var slice=days.slice(w*7,w*7+7);
  var defs=[['sweetManaged','Tatlı kontrolü'],['eveningControl','Akşam kontrolü'],['walked20','Yürüyüş'],['protein','Protein'],['water','Su'],['vitaminD','D vitamini'],['selfKind','Kendime iyi davrandım']];
  var cnt=function(k){ return slice.reduce(function(a,o){return a+(o.rec&&o.rec.habits[k]?1:0);},0); };
  var rows=defs.map(function(d){ return {label:d[1],val:cnt(d[0])+'/7'}; });
  var totalC=slice.reduce(function(a,o){return a+countRec(o.rec);},0);
  var moods={}; slice.forEach(function(o){ if(o.rec&&o.rec.mood) moods[o.rec.mood]=(moods[o.rec.mood]||0)+1; });
  return {title:'Gün '+(w*7+1)+'-'+(w*7+7),rows:rows,avg:(totalC/7).toFixed(1)+'/'+HABIT_TOTAL,best:bestStreak(slice)+' gün',mood:topMood(moods),interp:interp(cnt('sweetManaged'),cnt('walked20'),cnt('eveningControl'))};
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
App.start=function(){ var t=todayStr(),nowIso=new Date().toISOString(); data={version:2,startDate:t,lastOpenedDate:t,lastOpenedAt:nowIso,days:{},notifications:[],luna:{qa:[],lastAskDate:null},aeon:{qa:[],lastAskDate:null},settings:{nickname:'Sevgili Günışığı',notificationsWanted:false,ghToken:'',ghRepo:'mustafaras/seyma-data',ghBranch:'main',openaiKey:''},cycle:{periods:[],avgCycle:28,avgPeriod:5}}; ui.forceStart=false; ui.tab='bugun'; commit('Hadi başlayalım ☀️'); };
App.go=function(id){ ui.tab=id; render(); var sc=document.querySelector('[data-scroll]'); if(sc) sc.scrollTop=0; };
App.setTheme=function(d){ dark=d; try{ localStorage.setItem(TKEY,d?'dark':'light'); }catch(e){} render(); };
App.toggleTheme=function(){ App.setTheme(!dark); };
App.toggleHabit=function(key){
  var date=todayStr(), idx=dayIndexFor(date), day=getDay(data,date,idx);
  var before=countRec(day); day.habits[key]=!day.habits[key]; day.savedAt=new Date().toISOString(); var after=countRec(day);
  ui.pulse=key; clearTimeout(pulseTimer); pulseTimer=setTimeout(function(){ ui.pulse=null; render(); },240);
  var msg='Kaydedildi ✨'; if(day.habits[key]){ var h=find(HABITS,'key',key); if(h) msg=h.msg; }
  commit(msg);
  if(after===HABIT_TOTAL&&before<HABIT_TOTAL){ confetti(); setTimeout(function(){ toast('Bugün '+HABIT_TOTAL+'/'+HABIT_TOTAL+'. Şeyma hanım kontrolü ele aldı 👑',2600); },250); }
  else if(day.habits[key]){ maybeStreak(); }
};
function maybeStreak(){ var s=currentStreak(); var m={3:'3 gün oldu. Ritim kendini belli ediyor ✨',7:'7 gün. Bu artık tesadüf değil ☀️',14:'14 gün. Tatlı lobisi toplantı yapıyor olabilir 🍫',21:'21 gün! İlk büyük eşik 👑',30:'30 gün. Bir ay kesintisiz, bu ciddi iş 🌟',50:'50 gün. Yarım yüz, tam disiplin 💪',100:'100 gün! Üç haneye geçtin 🏆',200:'200 gün. Efsane modu 🔥',365:'365 gün. Tam bir yıl 👑✨'}; var big={7:1,14:1,21:1,30:1,50:1,100:1,200:1,365:1,500:1,1000:1}; if(m[s]){ if(big[s]) confetti(); setTimeout(function(){ toast(m[s],2800); },300); } }
App.setMood=function(id){ var date=todayStr(), day=getDay(data,date,dayIndexFor(date)); day.mood=(day.mood===id?null:id); commit(); };
App.onNote=function(el){ var v=el.value; clearTimeout(noteTimer); noteTimer=setTimeout(function(){ var date=todayStr(), day=getDay(data,date,dayIndexFor(date)); day.note=v; save(); },500); };
App.onMeal=function(key,el){ var v=el.value; debounceSave('meal-'+key,function(){ var date=todayStr(), day=getDay(data,date,dayIndexFor(date)); day.meals[key]=v; day.savedAt=new Date().toISOString(); save(); },500); };

// ---- health (sleep / walk) actions: number inputs save without re-render to keep focus ----
App.setSleepHours=function(el){ var raw=el.value; debounceSave('sleepH',function(){ var day=getDay(data,todayStr(),dayIndexFor(todayStr())); var v=raw===''?null:Number(raw); day.sleep.hours=(v==null||isNaN(v))?null:v; day.savedAt=new Date().toISOString(); save(); }); };
App.setSleepQuality=function(id){ var day=getDay(data,todayStr(),dayIndexFor(todayStr())); day.sleep.quality=(day.sleep.quality===id?null:id); day.savedAt=new Date().toISOString(); commit(); };
App.setSleepMed=function(type){ var day=getDay(data,todayStr(),dayIndexFor(todayStr())); if(!day.sleep.med) day.sleep.med={type:null,note:''}; day.sleep.med.type=(day.sleep.med.type===type?null:type); if(day.sleep.med.type!=='herbal'&&day.sleep.med.type!=='rx') day.sleep.med.note=''; day.savedAt=new Date().toISOString(); commit(); };
App.setSleepMedNote=function(el){ var v=el.value; debounceSave('sleepMedNote',function(){ var day=getDay(data,todayStr(),dayIndexFor(todayStr())); if(!day.sleep.med) day.sleep.med={type:null,note:''}; day.sleep.med.note=v; day.savedAt=new Date().toISOString(); save(); },300); };
App.toggleWindDownStep=function(key){
  var day=getDay(data,todayStr(),dayIndexFor(todayStr()));
  var wd=day.sleep.windDown||emptyWindDown();
  if(!wd.steps) wd.steps=emptyWindDown().steps;
  if(!(key in wd.steps)) return;
  wd.steps[key]=!wd.steps[key];
  var allDone=WIND_DOWN_STEPS.every(function(s){ return !!wd.steps[s.key]; });
  if(allDone) wd.lastDoneAt=new Date().toISOString();
  day.sleep.windDown=wd;
  day.savedAt=new Date().toISOString();
  commit(wd.steps[key]?'Ritüel adımı tamamlandı ✨':undefined);
};
App.startWindDown=function(minutes){
  var m=Math.max(5,Math.min(30,Number(minutes)||10));
  clearInterval(sleepRitualInterval);
  ui.sleepRitualTiming=true;
  ui.sleepRitualLeft=m*60;
  ui.sleepRitualTotal=m*60;
  var day=getDay(data,todayStr(),dayIndexFor(todayStr()));
  if(!day.sleep.windDown) day.sleep.windDown=emptyWindDown();
  day.sleep.windDown.lastMinutes=m;
  day.savedAt=new Date().toISOString();
  save();
  render();
  sleepRitualInterval=setInterval(function(){
    ui.sleepRitualLeft--;
    if(ui.sleepRitualLeft<=0){
      clearInterval(sleepRitualInterval);
      ui.sleepRitualLeft=0;
      ui.sleepRitualTiming=false;
      var d=getDay(data,todayStr(),dayIndexFor(todayStr()));
      if(!d.sleep.windDown) d.sleep.windDown=emptyWindDown();
      d.sleep.windDown.lastDoneAt=new Date().toISOString();
      d.savedAt=new Date().toISOString();
      save();
      render();
      toast('Uyku ritüeli tamamlandı. İyi geceler 🌙',2600);
    } else {
      updateWindDownTimer();
    }
  },1000);
};
App.stopWindDown=function(){
  clearInterval(sleepRitualInterval);
  ui.sleepRitualTiming=false;
  ui.sleepRitualLeft=0;
  ui.sleepRitualTotal=0;
  render();
};
function updateWindDownTimer(){
  var clock=document.getElementById('sleep-ritual-clock');
  if(clock) clock.textContent=pad(Math.floor(ui.sleepRitualLeft/60))+':'+pad(ui.sleepRitualLeft%60);
  var bar=document.getElementById('sleep-ritual-fill');
  if(bar){ var pct=ui.sleepRitualTotal?Math.max(0,Math.min(100,Math.round((1-ui.sleepRitualLeft/ui.sleepRitualTotal)*100))):0; bar.style.width=pct+'%'; }
}
App.setWalkSteps=function(el){ var raw=el.value; debounceSave('walkS',function(){ var day=getDay(data,todayStr(),dayIndexFor(todayStr())); var v=raw===''?null:Number(raw); day.walk.steps=(v==null||isNaN(v))?null:Math.round(v); day.savedAt=new Date().toISOString(); save(); }); };
App.setWalkMinutes=function(el){ var raw=el.value; debounceSave('walkM',function(){ var day=getDay(data,todayStr(),dayIndexFor(todayStr())); var v=raw===''?null:Number(raw); day.walk.minutes=(v==null||isNaN(v))?null:Math.round(v); if(day.walk.minutes!=null&&day.walk.minutes>=20&&!day.habits.walked20){ day.habits.walked20=true; toast('20 dk yürüyüş tiki işaretlendi ✨'); } day.savedAt=new Date().toISOString(); save(); }); };

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
  if(steps>0){ d.walk.steps=Math.round(steps); msgs.push(Math.round(steps)+' adım'); }
  if(sleepMs>0){ var hrs=Math.round(sleepMs/3600000*10)/10; d.sleep.hours=hrs; msgs.push(hrs+' sa uyku'); }
  if(steps>0||sleepMs>0){ d.savedAt=new Date().toISOString(); save(); render(); }
  if(st) st.textContent=(steps>0||sleepMs>0)?('İçe aktarıldı: '+msgs.join(' · ')+' ✅'):(found?'Bugün için adım/uyku verisi bulunamadı.':'Bugüne ait kayıt yok. Dosya güncel mi?');
}

// ---- cycle actions ----
App.logPeriodToday=function(){ var t=todayStr(); if(data.cycle.periods.some(function(p){return p.start===t;})){ toast('Bugün zaten kayıtlı'); return; } data.cycle.periods.push({start:t,end:null}); recalcCycle(); commit('Regl başlangıcı eklendi 🩸'); };
App.setPeriodField=function(idx,which,el){ var p=data.cycle.periods[idx]; if(!p) return; p[which]=el.value||null; recalcCycle(); commit(); };
App.removePeriod=function(idx){ if(data.cycle.periods[idx]){ data.cycle.periods.splice(idx,1); recalcCycle(); commit('Kayıt silindi'); } };
App.setFlow=function(id){ var day=getDay(data,todayStr(),dayIndexFor(todayStr())); day.flow=(day.flow===id?null:id); day.savedAt=new Date().toISOString(); commit(); };
App.toggleSymptom=function(id){ var day=getDay(data,todayStr(),dayIndexFor(todayStr())); var i=day.symptoms.indexOf(id); if(i>=0) day.symptoms.splice(i,1); else day.symptoms.push(id); day.savedAt=new Date().toISOString(); commit(); };
function recalcCycle(){ var st=cycleStats(); data.cycle.avgCycle=st.avgCycle; data.cycle.avgPeriod=st.avgPeriod; }
App.goSos=function(){ App.go('sos'); };
App.quickSleepRitual=function(){
  App.openRitual();
};
App.openRitual=function(){
  clearInterval(ritualInterval);
  ritualWarmVoices();
  ui.ritualOpen=true;
  ui.ritualRunning=false;
  ui.ritualDone=false;
  ui.ritualTotal=600;
  ui.ritualLeft=600;
  ui.ritualStartedAt=null;
  ritualAudio.stageKey=null;
  ritualAudioSync(false);
  trackRitualEvent('open');
  render();
};
App.closeRitual=function(){
  clearInterval(ritualInterval);
  if(ui.ritualStartedAt && !ui.ritualDone && (ui.ritualTotal-ui.ritualLeft)>15){ logRitualSession(false); }
  ui.ritualStartedAt=null;
  ui.ritualOpen=false;
  ui.ritualRunning=false;
  ui.ritualDone=false;
  ritualSpeechStop();
  ritualAudioSync(false);
  trackRitualEvent('close');
  render();
};
App.setRitualSoundMode=function(mode){
  if(['silent','ambient','guided'].indexOf(mode)<0) return;
  ui.ritualSoundMode=mode;
  if(mode!=='guided'){ ritualSpeechStop(); }
  else { ritualSpeechUnlock(); }
  ritualAudio.stageKey=null;
  ritualAudio.breathPhase=null;
  ritualAudioSync(true);
  if(mode==='guided' && ui.ritualRunning){ var info=ritualStageInfo(); ritualSpeak(info.stage.voice,{interrupt:true}); ritualAudio.stageKey=info.stage.key; }
  trackRitualEvent('sound-mode',{mode:mode});
  render();
};
App.onRitualOffload=function(el){
  var v=el.value;
  debounceSave('ritual-offload',function(){
    var d=getDay(data,todayStr(),dayIndexFor(todayStr()));
    if(!d.sleep.windDown) d.sleep.windDown=emptyWindDown();
    d.sleep.windDown.offloadNote=v;
    d.savedAt=new Date().toISOString();
    save();
  },300);
};
App.startRitual=function(){
  if(ui.ritualDone){ ui.ritualLeft=ui.ritualTotal; ui.ritualDone=false; }
  if(ui.ritualRunning) return;
  if(!ui.ritualStartedAt) ui.ritualStartedAt=new Date().toISOString();
  ui.ritualRunning=true;
  if(ui.ritualSoundMode==='guided') ritualSpeechUnlock();
  clearInterval(ritualInterval);
  ritualAudioSync(true);
  trackRitualEvent('start');
  render();
  ritualInterval=setInterval(function(){
    ui.ritualLeft--;
    if(ui.ritualLeft<=0){
      clearInterval(ritualInterval);
      ui.ritualLeft=0;
      ui.ritualRunning=false;
      ui.ritualDone=true;
      var d=getDay(data,todayStr(),dayIndexFor(todayStr()));
      if(!d.sleep.windDown) d.sleep.windDown=emptyWindDown();
      d.sleep.windDown.lastMinutes=10;
      d.sleep.windDown.lastDoneAt=new Date().toISOString();
      WIND_DOWN_STEPS.forEach(function(s){ d.sleep.windDown.steps[s.key]=true; });
      d.savedAt=new Date().toISOString();
      save();
      logRitualSession(true);
      ui.ritualStartedAt=null;
      var wasGuided=ui.ritualSoundMode==='guided';
      ritualSpeechStop();
      ritualAudioSync(false);
      if(wasGuided) ritualSpeak('Çok güzel. Ritüel tamamlandı. Ekranı bırak ve kendini uykuya bırak. İyi geceler.',{force:true,interrupt:true,rate:0.66,pitch:0.80});
      trackRitualEvent('complete');
      render();
      toast('Ritüel tamamlandı. İyi geceler 🌙',2600);
    } else {
      ritualAudioSync(false);
      render();
    }
  },1000);
};
App.pauseRitual=function(){
  if(!ui.ritualRunning) return;
  clearInterval(ritualInterval);
  ui.ritualRunning=false;
  ritualSpeechStop();
  ritualAudioSync(false);
  trackRitualEvent('pause');
  render();
};
App.resetRitual=function(){
  clearInterval(ritualInterval);
  if(ui.ritualStartedAt && !ui.ritualDone && (ui.ritualTotal-ui.ritualLeft)>15){ logRitualSession(false); }
  ui.ritualStartedAt=null;
  ui.ritualRunning=false;
  ui.ritualDone=false;
  ui.ritualLeft=ui.ritualTotal;
  ritualAudio.stageKey=null;
  ritualSpeechStop();
  ritualAudioSync(false);
  trackRitualEvent('reset');
  render();
};

App.toggleSosOpt=function(o){ var i=ui.sosOpts.indexOf(o); if(i>=0) ui.sosOpts.splice(i,1); else ui.sosOpts.push(o); render(); };
App.startSosTimer=function(){ clearInterval(sosInterval); ui.sosTiming=true; ui.sosLeft=600; render(); sosInterval=setInterval(function(){ ui.sosLeft--; if(ui.sosLeft<=0){ clearInterval(sosInterval); ui.sosLeft=0; ui.sosTiming=false; render(); toast('10 dakika doldu. Şimdi kararı sen ver ✨',2600); } else { updateSosTimer(); } },1000); };
function updateSosTimer(){ var el=document.getElementById('sos-clock'); if(el){ el.textContent=pad(Math.floor(ui.sosLeft/60))+':'+pad(ui.sosLeft%60); } }
App.completeSos=function(){ var date=todayStr(), day=getDay(data,date,dayIndexFor(date)); day.cravingSOSCount=(day.cravingSOSCount||0)+1; ui.sosOpts.forEach(function(o){ if(day.cravingOptionsUsed.indexOf(o)<0) day.cravingOptionsUsed.push(o); }); day.habits.sweetManaged=true; day.savedAt=new Date().toISOString(); clearInterval(sosInterval); ui.sosTiming=false; ui.sosDone=true; commit('Krizi yönettin ✨'); };
App.resetSos=function(){ clearInterval(sosInterval); ui.sosOpts=[]; ui.sosLeft=600; ui.sosTiming=false; ui.sosDone=false; render(); };

App.openEmergency=function(){ ui.emergency=true; render(); };
App.closeEmergency=function(){ ui.emergency=false; render(); };
App.continueEmergency=function(){ ui.emergency=false; render(); toast('İşte bu. Reset dediğin bazen sadece bir sonraki doğru hamledir.',3000); };
App.emergencyNote=function(){ ui.emergency=false; ui.tab='bugun'; render(); setTimeout(function(){ var ta=document.querySelector('textarea'); if(ta) ta.focus(); },150); };

App.openDate=function(date){
  var rec=data.days[date]||null; var idx=dayIndexFor(date);
  var habits=HABITS.map(function(h){ return {label:h.title.replace(' 🍫','').replace(' 🌙',''),mark:(rec&&rec.habits[h.key])?'✅':'⚪'}; });
  var cnt=countRec(rec); var strong=Math.ceil(HABIT_TOTAL*0.66), medium=Math.ceil(HABIT_TOTAL*0.34); var status='Zor gün'; if(cnt>=HABIT_TOTAL)status='Kraliçe günü 👑'; else if(cnt>=strong)status='Güzel gün'; else if(cnt>=medium)status='İdare eder';
  var mood=rec&&rec.mood?find(MOODS,'id',rec.mood):null;
  var sl=rec&&rec.sleep?rec.sleep:{}, wk=rec&&rec.walk?rec.walk:{};
  var mealsList=[]; if(rec&&rec.meals){ MEALS.forEach(function(m){ if(rec.meals[m.key]&&String(rec.meals[m.key]).trim()) mealsList.push({label:m.label,icon:m.icon,text:String(rec.meals[m.key])}); }); }
  var flowO=rec&&rec.flow?find(FLOW,'id',rec.flow):null;
  var symsList=(rec&&rec.symptoms||[]).map(function(id){ var s=find(SYMPTOMS,'id',id); return s?s.emoji+' '+s.label:id; });
  ui.dayDetail={title:(idx>=1?'Gün '+idx:shortDate(date)),dateLabel:shortDate(date),status:status,habits:habits,moodLabel:mood?mood.label:'—',sosCount:rec?(rec.cravingSOSCount||0):0,note:(rec&&rec.note)||'',hasNote:!!(rec&&rec.note),
    sleepH:(sl.hours!=null?sl.hours:null),steps:(wk.steps!=null?wk.steps:null),mins:(wk.minutes!=null?wk.minutes:null),meals:mealsList,flow:flowO?flowO.label:null,syms:symsList};
  render();
};
App.closeDetail=function(){ ui.dayDetail=null; render(); };
App.calMove=function(delta){ var ym=(ui.calMonth||todayStr().slice(0,7)).split('-'); var d=new Date(+ym[0],+ym[1]-1+delta,1); ui.calMonth=d.getFullYear()+'-'+pad(d.getMonth()+1); render(); };

App.exportJson=function(){ var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); download(blob,'seyma-yedek.json'); toast('Yedek indirildi 💾'); };
function download(blob,name){ var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){ URL.revokeObjectURL(a.href); },1500); }
App.importClick=function(){ var f=document.getElementById('sey-file'); if(f) f.click(); };
App.importJson=function(el){ var f=el.files&&el.files[0]; if(!f) return; var r=new FileReader(); r.onload=function(){ try{ var d=JSON.parse(r.result); if(d&&d.version&&d.days&&d.startDate){ data=d; ui.tab='bugun'; commit('Yedek yüklendi 🔁'); } else toast('Dosya okunamadı'); }catch(err){ toast('Dosya okunamadı'); } }; r.readAsText(f); el.value=''; };

App.askReset=function(){ ui.resetStep=1; render(); };
App.cancelReset=function(){ ui.resetStep=0; render(); };
App.resetConfirm=function(){ if(ui.resetStep===1){ ui.resetStep=2; render(); return; } try{ localStorage.removeItem(KEY); }catch(e){} data=null; ui.resetStep=0; ui.tab='bugun'; render(); };
App.goStart=function(){ ui.forceStart=true; ui.tab='bugun'; render(); };
App.startDateChange=function(el){ var v=el.value; if(!v) return; data.startDate=v; commit('Başlangıç tarihi güncellendi'); };

App.anotherNote=function(){ ui.noteIndex=(ui.noteIndex+1)%NOTES.length; render(); };
App.printReport=function(){ openReport(); };
function syncFieldUpdate(){ var s=document.getElementById('sey-sync-status'); if(s&&window.SeySync) s.textContent=window.SeySync.statusText(); }
App.setGhToken=function(el){ if(!data.settings) data.settings={}; data.settings.ghToken=normalizeToken(el.value||''); save(); syncFieldUpdate(); };
App.setOpenaiKey=function(el){ var v=el.value; debounceSave('openaiKey',function(){ if(!data.settings) data.settings={}; data.settings.openaiKey=String(v||'').trim(); save(); },500); };
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
  days.forEach(function(o){ var rec=o.rec; var mood=rec&&rec.mood?find(MOODS,'id',rec.mood):null; var st=(rec&&rec.walk&&rec.walk.steps!=null)?rec.walk.steps:'—'; var sh=(rec&&rec.sleep&&rec.sleep.hours!=null)?(rec.sleep.hours+' sa'):'—'; h+='<tr><td style="padding:6px 9px;border:1px solid #F2E1DA;">'+o.i+'</td><td style="padding:6px 9px;border:1px solid #F2E1DA;">'+shortDate(o.date)+'</td><td style="padding:6px 9px;border:1px solid #F2E1DA;">'+countRec(rec)+'/'+HABIT_TOTAL+'</td><td style="padding:6px 9px;border:1px solid #F2E1DA;">'+(mood?esc(mood.short):'—')+'</td><td style="padding:6px 9px;border:1px solid #F2E1DA;">'+esc(st)+'</td><td style="padding:6px 9px;border:1px solid #F2E1DA;">'+esc(sh)+'</td><td style="padding:6px 9px;border:1px solid #F2E1DA;">'+(rec?rec.cravingSOSCount||0:0)+'</td><td style="padding:6px 9px;border:1px solid #F2E1DA;">'+esc((rec&&rec.note)?String(rec.note).slice(0,42):'')+'</td></tr>'; });
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

  if(!data || ui.forceStart){ app.innerHTML=onboardingHTML(); return; }

  var html='<div data-scroll class="scroll" style="flex:1;overflow-y:auto;padding:calc(env(safe-area-inset-top) + 14px) 16px 28px;display:flex;flex-direction:column;gap:14px;">';
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

function bugunHTML(){
  var today=todayStr();
  var curRaw=dayIndexFor(today);
  var curIdx=Math.max(1,curRaw);
  var streak=currentStreak();
  var rec=data.days[today]||null;
  var completed=countRec(rec);
  var circ=2*Math.PI*42;
  var badge='Bugün nazlı başladı 🌧️';
  var strong=Math.ceil(HABIT_TOTAL*0.66), medium=Math.ceil(HABIT_TOTAL*0.34);
  if(completed>=HABIT_TOTAL) badge='Kraliçe günü 👑'; else if(completed>=strong) badge='Raydasın ☀️'; else if(completed>=medium) badge='Toparlanıyor 🌤️';
  var pct=Math.round(completed/HABIT_TOTAL*100);
  var off=circ*(1-completed/HABIT_TOTAL);

  var h='<div style="animation:seyFade .3s ease;display:flex;flex-direction:column;gap:14px;">';
  h+=saveBanner();
  // hero
  h+='<div class="glass" style="border-radius:26px;padding:18px;box-shadow:0 10px 28px rgba(108,74,58,0.08);display:flex;flex-direction:column;gap:16px;">';
  h+='<div style="display:flex;justify-content:space-between;align-items:flex-start;">';
  h+='<div><div style="font-size:13px;letter-spacing:1px;color:var(--faint);font-weight:700;">ŞEYMA 🦩</div><div style="font-size:14px;color:var(--muted);margin-top:3px;">Minik Denge Günlüğü</div></div>';
  h+='<div style="display:flex;align-items:center;gap:8px;"><button onclick="App.toggleTheme()" aria-label="Tema" style="border:none;cursor:pointer;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;background:rgba(201,184,255,0.22);color:var(--choc);">'+(dark?'☀️':'🌙')+'</button>';
  h+='<div style="background:rgba(201,184,255,0.28);color:var(--choc);font-weight:700;font-size:13px;padding:7px 13px;border-radius:999px;white-space:nowrap;">Gün '+curIdx+(streak>1?' · 🔥'+streak:'')+'</div></div></div>';
  h+='<div style="display:flex;align-items:center;gap:18px;">';
  h+='<div style="position:relative;width:96px;height:96px;flex-shrink:0;"><svg width="96" height="96" viewBox="0 0 96 96"><circle cx="48" cy="48" r="42" fill="none" stroke="rgba(150,110,120,0.18)" stroke-width="9"></circle><circle cx="48" cy="48" r="42" fill="none" stroke="#E9AFC1" stroke-width="9" stroke-linecap="round" stroke-dasharray="'+circ+'" stroke-dashoffset="'+off+'" transform="rotate(-90 48 48)" style="transition:stroke-dashoffset .6s ease"></circle></svg>';
  h+='<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;"><div style="font-size:25px;font-weight:800;line-height:1;">'+pct+'%</div><div style="font-size:11px;color:var(--faint);margin-top:2px;">bugün</div></div></div>';
  h+='<div style="flex:1;min-width:0;"><div style="font-size:13px;color:var(--faint);margin-bottom:6px;">Bugünün havası</div><div style="font-size:19px;font-weight:800;line-height:1.25;">'+esc(badge)+'</div></div></div></div>';

  // daily banner (distinct)
  h+='<div style="position:relative;overflow:hidden;background:linear-gradient(135deg,#FFE19A,#FFC9A3 55%,#F7B7C9);border-radius:24px;padding:22px 22px 20px;box-shadow:0 12px 28px rgba(255,180,140,0.32);">';
  h+='<div style="position:absolute;top:-26px;right:10px;font-size:130px;line-height:1;font-weight:800;color:#fff;opacity:0.22;">\u201d</div>';
  h+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:9px;position:relative;"><span style="font-size:16px;">☀️</span><span style="font-size:11.5px;letter-spacing:1.5px;font-weight:800;color:#9A5A3C;">GÜNÜN MESAJI</span></div>';
  h+='<div style="position:relative;font-size:19px;font-weight:800;line-height:1.36;color:#5A2E2A;">'+esc(DAILY[(curIdx-1)%DAILY.length])+'</div></div>';

  // SOS button
  h+='<button onclick="App.goSos()" style="border:none;cursor:pointer;width:100%;padding:17px;border-radius:20px;font-size:16.5px;font-weight:700;color:#fff;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#E9899F,#C9B8FF);box-shadow:0 12px 26px rgba(233,137,159,0.45);">Raşit, tatlı krizi geldi 🍫🚨</button>';
  h+='<button onclick="App.quickSleepRitual()" style="position:relative;overflow:hidden;border:none;cursor:pointer;width:100%;padding:17px;border-radius:20px;font-size:16px;font-weight:800;color:#fff;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#6E55BF,#9B7FC9 52%,#E9AFC1);box-shadow:0 14px 30px rgba(110,85,191,0.42);"><span style="position:absolute;top:0;bottom:0;left:0;width:35%;background:linear-gradient(100deg,transparent,rgba(255,255,255,0.55),transparent);animation:seyShine 3.2s ease-in-out infinite;pointer-events:none;"></span><span style="position:relative;">Gece ritüelini başlat 🌙✨</span></button>';

  // habits
  h+='<div style="font-size:13px;font-weight:700;color:var(--faint);letter-spacing:0.4px;padding:4px 4px 0;">BUGÜNÜN TİKLERİ</div>';
  HABITS.forEach(function(hb){
    var done=!!(rec&&rec.habits[hb.key]); var pulsing=ui.pulse===hb.key;
    var bg=done?(dark?'linear-gradient(135deg,rgba(233,175,193,0.25),rgba(201,184,255,0.22))':'linear-gradient(135deg,rgba(255,255,255,0.92),rgba(247,221,229,0.82))'):'var(--card)';
    var bd=done?'rgba(233,175,193,0.9)':'var(--card-bd)';
    var sh=done?'0 10px 26px rgba(233,175,193,0.4)':'0 6px 16px rgba(108,74,58,0.06)';
    h+='<button onclick="App.toggleHabit(\''+hb.key+'\')" style="display:flex;align-items:center;gap:13px;padding:14px;width:100%;text-align:left;cursor:pointer;border-radius:20px;color:var(--text);border:1px solid '+bd+';background:'+bg+';box-shadow:'+sh+';transform:scale('+(pulsing?'1.03':'1')+');transition:transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .25s,background .25s,border-color .25s;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);">';
    h+='<div style="width:46px;height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;background:var(--icon);">'+hb.icon+'</div>';
    h+='<div style="flex:1;min-width:0;"><div style="font-size:15.5px;font-weight:700;line-height:1.25;">'+esc(hb.title)+'</div>';
    h+=done?'<div style="font-size:13px;color:var(--accent);font-weight:600;margin-top:4px;line-height:1.35;">'+esc(hb.msg)+'</div>':'<div style="font-size:13px;color:var(--faint);margin-top:3px;line-height:1.35;">'+esc(hb.sub)+'</div>';
    h+='</div>';
    h+='<div style="width:28px;height:28px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:#fff;background:'+(done?'linear-gradient(135deg,#E9AFC1,#C9B8FF)':'transparent')+';border:'+(done?'none':'2px solid var(--field-bd)')+';">'+(done?'✓':'')+'</div></button>';
  });

  // öğünler (3 öğün + ara)
  var meals=(rec&&rec.meals)?rec.meals:{};
  h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;">';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;"><div style="font-size:15.5px;font-weight:700;">Bugün ne yedim? 🍽️</div><div style="font-size:12px;color:var(--faint);">otomatik kaydolur</div></div>';
  MEALS.forEach(function(m){
    h+='<div style="display:flex;gap:10px;align-items:flex-start;">';
    h+='<div style="width:38px;height:38px;border-radius:12px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:19px;background:var(--icon);margin-top:2px;">'+m.icon+'</div>';
    h+='<div style="flex:1;min-width:0;"><div style="font-size:12.5px;font-weight:700;color:var(--muted);margin-bottom:4px;">'+m.label+'</div>';
    h+='<textarea oninput="App.onMeal(\''+m.key+'\',this)" placeholder="'+esc(m.ph)+'" rows="1" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:9px 11px;font-size:14px;resize:none;outline:none;line-height:1.4;min-height:38px;">'+esc(meals[m.key]||'')+'</textarea></div></div>';
  });
  h+='</div>';

  // mood
  var curMood=rec?rec.mood:null;
  h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;"><div style="font-size:15.5px;font-weight:700;">Bugünün modu nasıl? 🌤️</div><div style="display:flex;gap:6px;">';
  MOODS.forEach(function(m){
    var sel=curMood===m.id;
    var style=sel?'background:linear-gradient(135deg,#FFE8A3,#F7DDE5);border:1px solid #E9AFC1;box-shadow:0 8px 18px rgba(233,175,193,0.4);transform:translateY(-2px);color:#5A2E2A;':'background:var(--card);border:1px solid var(--card-bd);color:var(--text);';
    h+='<button onclick="App.setMood(\''+m.id+'\')" style="flex:1;min-width:0;padding:11px 4px;border-radius:16px;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;transition:all .2s;'+style+'"><span style="font-size:22px;">'+m.emoji+'</span><span style="font-size:11px;font-weight:600;text-align:center;line-height:1.1;">'+esc(m.short)+'</span></button>';
  });
  h+='</div>';
  if(curMood){ var mo=find(MOODS,'id',curMood); h+='<div style="font-size:14px;color:var(--text2);background:rgba(255,232,163,0.3);border-radius:14px;padding:10px 12px;line-height:1.4;">'+esc(mo.resp)+'</div>'; }
  h+='</div>';

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

  // note
  h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:10px;"><div style="font-size:15.5px;font-weight:700;">Bugün kendime notum…</div>';
  h+='<textarea oninput="App.onNote(this)" placeholder="Bugün kendime notum…" rows="3" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:14px;padding:12px;font-size:15px;resize:none;outline:none;line-height:1.5;">'+esc(rec?rec.note:'')+'</textarea>';
  h+='<div style="font-size:12px;color:var(--faint);line-height:1.5;">örn. \u201cTatlı isteği akşam geldi.\u201d \u00b7 \u201cYürüyüş iyi hissettirdi.\u201d \u00b7 \u201cBugün biraz zorlandım ama devam.\u201d</div></div>';

  // dağıldı
  h+='<button onclick="App.openEmergency()" style="border:1px dashed rgba(150,110,120,0.3);background:var(--card);cursor:pointer;width:100%;padding:14px;border-radius:18px;font-size:15px;font-weight:600;color:var(--muted);">Bugün biraz dağıldı 🫠</button>';
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
  var strong=Math.ceil(HABIT_TOTAL*0.66);
  var h='<div style="animation:seyFade .3s ease;display:flex;flex-direction:column;gap:14px;">';
  h+='<div style="padding:6px 4px 0;"><div style="font-size:23px;font-weight:800;">Takvim 🗺️</div><div style="font-size:13.5px;color:var(--faint);margin-top:3px;">Bir güne dokun, detayını gör.</div></div>';
  h+='<div class="glass" style="border-radius:22px;padding:14px;display:flex;flex-direction:column;gap:12px;">';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;"><button onclick="App.calMove(-1)" style="border:none;cursor:pointer;width:36px;height:36px;border-radius:50%;background:var(--icon);color:var(--text);font-size:18px;">‹</button><div style="font-size:16px;font-weight:800;">'+monthNames[M-1]+' '+Y+'</div><button onclick="App.calMove(1)" style="border:none;cursor:pointer;width:36px;height:36px;border-radius:50%;background:var(--icon);color:var(--text);font-size:18px;">›</button></div>';
  h+='<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:5px;">';
  ['Pt','Sa','Ça','Pe','Cu','Ct','Pz'].forEach(function(d){ h+='<div style="text-align:center;font-size:11px;font-weight:700;color:var(--faint);">'+d+'</div>'; });
  for(var b=0;b<firstDow;b++){ h+='<div></div>'; }
  for(var dnum=1;dnum<=daysInMonth;dnum++){
    var date=Y+'-'+pad(M)+'-'+pad(dnum);
    var rec=data.days[date]||null; var cnt=countRec(rec);
    var future=diffDays(today,date)<0; var before=diffDays(data.startDate,date)<0; var isToday=date===today;
    var moodE=(rec&&rec.mood)?moodEmoji(rec.mood):'';
    var tint='var(--card)';
    if(cnt>=HABIT_TOTAL) tint=dark?'linear-gradient(135deg,rgba(255,232,163,0.25),rgba(247,221,229,0.22))':'linear-gradient(135deg,#FFE8A3,#F7DDE5)';
    else if(cnt>=strong) tint=dark?'rgba(233,137,159,0.2)':'rgba(247,221,229,0.7)';
    else if(cnt>0) tint=dark?'rgba(201,184,255,0.12)':'rgba(247,221,229,0.32)';
    var clickable=!future;
    h+='<button '+(clickable?'onclick="App.openDate(\''+date+'\')"':'')+' style="position:relative;aspect-ratio:1;border-radius:12px;border:1px solid var(--card-bd);background:'+tint+';color:var(--text);cursor:'+(clickable?'pointer':'default')+';opacity:'+((future||before)?'0.4':'1')+';display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;'+(isToday?'box-shadow:0 0 0 2px #E9AFC1;':'')+'">';
    h+='<div style="font-size:12.5px;font-weight:700;line-height:1;">'+dnum+'</div>';
    h+='<div style="font-size:12px;height:14px;line-height:1;">'+(moodE||(cnt>0?'<span style="font-size:9.5px;color:var(--muted);font-weight:700;">'+cnt+'/'+HABIT_TOTAL+'</span>':''))+'</div>';
    h+='</button>';
  }
  h+='</div>';
  h+='<div style="display:flex;gap:13px;justify-content:center;font-size:11px;color:var(--faint);flex-wrap:wrap;padding-top:2px;"><span>🟡 tam gün</span><span>🌸 güçlü</span><span>○ bugün çerçeveli</span></div>';
  h+='</div></div>';
  return h;
}

function lastNDays(n){ var out=[],t=todayStr(); for(var i=n-1;i>=0;i--){ var d=addDays(t,-i); out.push({date:d,rec:data.days[d]||null}); } return out; }
function habitRate(days,key){ var done=0; days.forEach(function(o){ if(o.rec&&o.rec.habits&&o.rec.habits[key]) done++; }); return days.length?Math.round(done/days.length*100):0; }
function moodDist(days){ var m={}; days.forEach(function(o){ if(o.rec&&o.rec.mood) m[o.rec.mood]=(m[o.rec.mood]||0)+1; }); return m; }
function monthlySummary(){ var map={}; for(var d in data.days){ var mo=d.slice(0,7); if(!map[mo]) map[mo]={ticks:0,days:0,list:[]}; map[mo].ticks+=countRec(data.days[d]); map[mo].days++; map[mo].list.push({date:d,rec:data.days[d]}); }
  return Object.keys(map).sort().reverse().map(function(k){ var m=map[k]; m.list.sort(function(a,b){return a.date<b.date?-1:1;}); return {month:k,avg:m.ticks/m.days,days:m.days,best:bestStreak(m.list)}; }); }
function trendBars(days,valFn,grad){ var max=1; days.forEach(function(o){ max=Math.max(max,valFn(o)); }); var h='<div style="display:flex;align-items:flex-end;gap:2px;height:52px;">'; days.forEach(function(o){ var v=valFn(o); var hh=v?Math.max(4,Math.round(v/max*52)):2; h+='<div style="flex:1;height:'+hh+'px;border-radius:3px;background:'+grad+';opacity:'+(v?1:0.22)+';"></div>'; }); h+='</div>'; return h; }
function nextMilestone(streak){ var ms=[7,21,30,50,100,200,365,500,1000]; for(var i=0;i<ms.length;i++){ if(streak<ms[i]) return {target:ms[i],pct:Math.round(streak/ms[i]*100)}; } return null; }

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
  var avg30=(last30.reduce(function(a,o){return a+countRec(o.rec);},0)/30).toFixed(1);
  h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:10px;"><div style="display:flex;justify-content:space-between;align-items:baseline;"><div style="font-size:15.5px;font-weight:700;">Son 30 gün — günlük tik</div><div style="font-size:12px;color:var(--faint);">ort. '+avg30+'/'+HABIT_TOTAL+'</div></div>';
  h+=trendBars(last30,function(o){return countRec(o.rec);},'linear-gradient(180deg,#E9899F,#C9B8FF)')+'</div>';
  h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:11px;"><div style="font-size:15.5px;font-weight:700;">Alışkanlık oranları (30 gün)</div>';
  HABITS.forEach(function(hb){ var pct=habitRate(last30,hb.key); h+='<div style="display:flex;flex-direction:column;gap:4px;"><div style="display:flex;justify-content:space-between;font-size:13px;"><span style="color:var(--text2);">'+hb.icon+' '+esc(hb.title)+'</span><span style="font-weight:700;color:var(--accent);">%'+pct+'</span></div><div style="height:7px;border-radius:999px;background:rgba(150,110,120,0.13);overflow:hidden;"><div style="height:100%;width:'+pct+'%;border-radius:999px;background:linear-gradient(90deg,#E9AFC1,#C9B8FF);"></div></div></div>'; });
  h+='</div>';
  var md=moodDist(last30); var mtot=0; for(var mkk in md) mtot+=md[mkk];
  h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:10px;"><div style="font-size:15.5px;font-weight:700;">Mod dağılımı (30 gün)</div>';
  if(mtot){ var mcol={'cok-iyi':'#FFD37A','iyi':'#F2B65A','normal':'#8FBF8A','zorlandim':'#9BB0D9','cok-zorlandim':'#B89BD9'};
    h+='<div style="display:flex;height:14px;border-radius:999px;overflow:hidden;">'; MOODS.forEach(function(m){ var v=md[m.id]||0; if(v) h+='<div style="width:'+(v/mtot*100)+'%;background:'+(mcol[m.id]||'#C9B8FF')+';"></div>'; }); h+='</div>';
    h+='<div style="display:flex;flex-wrap:wrap;gap:10px;font-size:12px;color:var(--muted);">'; MOODS.forEach(function(m){ var v=md[m.id]||0; if(v) h+='<span>'+m.emoji+' '+esc(m.short)+' <b>'+v+'</b></span>'; }); h+='</div>';
  } else h+='<div style="font-size:13px;color:var(--faint);">Bu dönemde mod kaydı yok.</div>';
  h+='</div>';
  var months=monthlySummary();
  if(months.length){ var moN=['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
    h+='<div style="padding:4px 4px 0;"><div style="font-size:17px;font-weight:800;">Aylık özet</div></div>';
    months.slice(0,12).forEach(function(m){ var p=m.month.split('-'); h+='<div class="glass" style="border-radius:16px;padding:13px 15px;display:flex;justify-content:space-between;align-items:center;"><div><div style="font-size:15px;font-weight:800;">'+moN[+p[1]-1]+' '+p[0]+'</div><div style="font-size:12px;color:var(--faint);">'+m.days+' gün kayıt</div></div><div style="text-align:right;"><div style="font-size:13px;color:var(--accent);font-weight:700;">ort. '+m.avg.toFixed(1)+'/'+HABIT_TOTAL+'</div><div style="font-size:12px;color:var(--muted);">en iyi seri '+m.best+'</div></div></div>'; });
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
  h+='<div class="glass" style="border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:9px;"><div style="font-size:15px;font-weight:700;display:flex;align-items:center;gap:8px;">Luna · kişisel asistan 🌙 '+(hasOaKey?'<span style="font-size:12px;font-weight:700;color:#6A4FA0;background:rgba(155,127,201,0.18);padding:2px 9px;border-radius:999px;">bağlı ✓</span>':'')+'</div>';
  h+='<div style="font-size:12.5px;line-height:1.5;color:var(--text2);">Luna sorularını yanıtlayabilsin diye OpenAI API anahtarı gerekir. Anahtar <b>yalnızca bu cihazda</b> saklanır, repoya gönderilmez. Günde 1 soru hakkın olur — Luna olabildiğince detaylı yanıtlar. 💜</div>';
  h+='<input type="password" autocomplete="off" autocapitalize="off" spellcheck="false" value="'+esc(sg.openaiKey||'')+'" oninput="App.setOpenaiKey(this)" placeholder="sk-… (OpenAI API anahtarı)" style="border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:13px;outline:none;">';
  h+='<div style="font-size:11.5px;color:var(--faint);">platform.openai.com → API keys bölümünden alınır. Model: gpt-4o-mini (hızlı & ekonomik).</div>';
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
  var steps=rec&&rec.walk?num(rec.walk.steps):null;
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
  legend+='<div style="font-size:11px;color:var(--faint);margin-top:2px;">'+mealCount+'/4 öğün kaydı</div></div>';
  return '<div class="glass" style="border-radius:22px;padding:16px;display:flex;align-items:center;gap:16px;"><div style="flex-shrink:0;">'+svg+'</div>'+legend+'</div>';
}

function sparkCard(){
  var today=todayStr(); var arr=[]; for(var i=6;i>=0;i--){ var dd=addDays(today,-i); var rec=data.days[dd]; arr.push({d:dd,steps:rec&&rec.walk?num(rec.walk.steps):null,sleep:rec&&rec.sleep?num(rec.sleep.hours):null}); }
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
  var wind=sl.windDown||emptyWindDown();
  var wd=wind.steps?wind.steps:emptyWindDown().steps;
  var completed=WIND_DOWN_STEPS.reduce(function(a,s){ return a+(wd[s.key]?1:0); },0);
  var today=todayStr();
  // 1) Uyku süresi (yetişkin hedefi ~7.5-8.5 sa) — maks 28
  var hours=num(sl.hours), fDur=0;
  if(hours!=null){ fDur=Math.round(28*Math.max(0,Math.min(1,1-Math.abs(hours-7.75)/3))); }
  // 2) Öznel kalite — maks 16
  var fQual=sl.quality==='good'?16:(sl.quality==='ok'?9:(sl.quality==='bad'?3:0));
  // 3) Wind-down adımları (uyku hijyeni/uyaran kontrolü) — maks 20
  var fSteps=Math.round(20*(completed/WIND_DOWN_STEPS.length));
  // 4) Ritüel tamamlama — maks 20
  var ritualDoneToday=!!(wind.lastDoneAt&&String(wind.lastDoneAt).slice(0,10)===today);
  var sessions=Array.isArray(wind.sessions)?wind.sessions:[];
  var partialToday=false;
  for(var i=0;i<sessions.length;i++){ var s=sessions[i]; var dt=(s.endedAt||s.startedAt||'').slice(0,10); if(dt===today){ if(s.completed) ritualDoneToday=true; else partialToday=true; } }
  var fRit=ritualDoneToday?20:(partialToday?10:0);
  // 5) Bilişsel boşaltma (yarına bırakma) — maks 8
  var fOff=(wind.offloadNote&&String(wind.offloadNote).trim())?8:0;
  // 6) İlaç/takviye — maks 8 (ilaçsız uykuya hazırlık göstergesi)
  var medType=(sl.med&&sl.med.type)?sl.med.type:null;
  var fMed=medType==='none'?8:(medType==='herbal'?5:(medType==='rx'?2:4));
  var factors={duration:fDur,quality:fQual,steps:fSteps,ritual:fRit,offload:fOff,medication:fMed};
  var score=fDur+fQual+fSteps+fRit+fOff+fMed;
  score=Math.max(0,Math.min(100,score));
  var tier='Rahat';
  if(score>=85) tier='Mükemmel';
  else if(score>=70) tier='Güçlü';
  else if(score>=55) tier='Dengeli';
  return {score:score,tier:tier,completed:completed,factors:factors,ritualDoneToday:ritualDoneToday,medType:medType};
}

function saglikHTML(){
  var today=todayStr(); var rec=data.days[today]||null;
  var sl=rec&&rec.sleep?rec.sleep:{}; var wk=rec&&rec.walk?rec.walk:{};
  var wd=sl.windDown||emptyWindDown();
  var readiness=sleepReadiness(rec);
  var h='<div style="animation:seyFade .3s ease;display:flex;flex-direction:column;gap:14px;">';
  h+='<div style="padding:6px 4px 0;"><div style="font-size:23px;font-weight:800;">Sağlık 🌸</div><div style="font-size:13.5px;color:var(--faint);margin-top:3px;">Uyku, yürüyüş ve döngü — küçük veriler, büyük resim.</div></div>';
  h+=activityRings(rec);
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
  h+='<div style="border-radius:18px;padding:14px;background:linear-gradient(135deg,rgba(138,117,200,0.2),rgba(233,175,193,0.16));border:1px solid rgba(155,127,201,0.3);display:flex;flex-direction:column;gap:10px;">';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;"><div><div style="font-size:12px;color:var(--faint);">Uykuya dalma hazırlığı</div><div style="font-size:16px;font-weight:800;color:var(--text);">Skor '+readiness.score+'/100 · '+readiness.tier+'</div></div><div style="font-size:12px;color:#5A457A;background:rgba(255,255,255,0.55);padding:6px 10px;border-radius:999px;border:1px solid rgba(155,127,201,0.25);">'+readiness.completed+'/4 adım</div></div>';
  var rf=readiness.factors||{};
  var fdefs=[['Uyku süresi',rf.duration||0,28],['Kalite',rf.quality||0,16],['Hazırlık adımları',rf.steps||0,20],['Ritüel',rf.ritual||0,20],['Zihni boşaltma',rf.offload||0,8],['İlaçsızlık',rf.medication||0,8]];
  h+='<div style="display:flex;flex-direction:column;gap:5px;background:rgba(255,255,255,0.4);border:1px solid rgba(155,127,201,0.2);border-radius:14px;padding:10px 11px;">';
  fdefs.forEach(function(f){ var pct=Math.round(f[1]/f[2]*100); h+='<div style="display:flex;align-items:center;gap:8px;"><div style="font-size:11px;color:var(--muted);width:104px;flex-shrink:0;">'+f[0]+'</div><div style="flex:1;height:6px;border-radius:999px;background:rgba(90,69,122,0.14);overflow:hidden;"><div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,#9B7FC9,#E9AFC1);"></div></div><div style="font-size:10.5px;color:var(--faint);width:34px;text-align:right;flex-shrink:0;">'+f[1]+'/'+f[2]+'</div></div>'; });
  h+='<div style="font-size:10.5px;color:var(--faint);line-height:1.4;margin-top:3px;">Hedef ~7.5-8.5 sa uyku, tamamlanmış ritüel ve uyku hijyeni adımları skoru yükseltir. (CBT-I temelli ağırlıklandırma.)</div>';
  h+='</div>';
  h+='<div style="display:flex;flex-direction:column;gap:7px;">';
  WIND_DOWN_STEPS.forEach(function(s){ var done=!!(wd.steps&&wd.steps[s.key]); h+='<button onclick="App.toggleWindDownStep(\''+s.key+'\')" style="border-radius:12px;padding:9px 11px;cursor:pointer;display:flex;align-items:center;gap:9px;text-align:left;'+(done?'background:linear-gradient(135deg,rgba(239,228,255,0.85),rgba(251,227,232,0.9));border:1px solid rgba(184,155,217,0.9);':'background:rgba(255,255,255,0.45);border:1px solid rgba(155,127,201,0.22);')+'"><span style="font-size:17px;">'+s.icon+'</span><span style="display:flex;flex-direction:column;gap:1px;flex:1;min-width:0;"><span style="font-size:13px;font-weight:700;color:var(--text);">'+s.label+'</span><span style="font-size:11px;color:var(--muted);">'+s.note+'</span></span><span style="font-size:15px;color:'+(done?'#7B57B4':'var(--faint)')+';">'+(done?'✓':'○')+'</span></button>'; });
  h+='</div>';
  h+='<div style="display:flex;gap:7px;">'+[10,15,20].map(function(m){ return '<button onclick="App.startWindDown('+m+')" style="flex:1;border:1px solid rgba(155,127,201,0.35);cursor:pointer;padding:9px;border-radius:12px;font-size:12.5px;font-weight:700;color:#5A457A;background:rgba(255,255,255,0.62);">'+m+' dk</button>'; }).join('')+'</div>';
  h+='<div style="display:flex;align-items:center;gap:10px;"><div id="sleep-ritual-clock" style="font-size:22px;font-weight:800;font-variant-numeric:tabular-nums;color:var(--text);min-width:66px;">'+(ui.sleepRitualTiming?(pad(Math.floor(ui.sleepRitualLeft/60))+':'+pad(ui.sleepRitualLeft%60)):'00:00')+'</div><div style="flex:1;height:8px;border-radius:999px;background:rgba(90,69,122,0.18);overflow:hidden;"><div id="sleep-ritual-fill" style="height:100%;width:'+(ui.sleepRitualTiming?(Math.round((1-ui.sleepRitualLeft/(ui.sleepRitualTotal||1))*100)):0)+'%;background:linear-gradient(90deg,#9B7FC9,#E9AFC1);transition:width .35s ease;"></div></div>'+(ui.sleepRitualTiming?'<button onclick="App.stopWindDown()" style="border:1px solid rgba(155,127,201,0.35);cursor:pointer;padding:8px 10px;border-radius:10px;font-size:12px;font-weight:700;color:#5A457A;background:rgba(255,255,255,0.72);">Durdur</button>':'')+'</div>';
  h+='<div style="font-size:11.5px;line-height:1.45;color:var(--muted);">Ritüel sırası: ışık → nefes → zihni boşaltma → serin/karanlık oda. Düzenli tekrar, uykuya dalma süresini kısaltmaya yardımcı olur.</div>';
  h+='</div>';
  h+='</div>';
  // yürüyüş
  h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;"><div style="font-size:15.5px;font-weight:700;">Yürüyüş 🚶‍♀️</div>';
  h+='<div style="display:flex;gap:10px;"><div style="flex:1;"><div style="font-size:12.5px;font-weight:700;color:var(--muted);margin-bottom:5px;">Adım</div><input type="number" inputmode="numeric" min="0" value="'+(wk.steps!=null?esc(wk.steps):'')+'" oninput="App.setWalkSteps(this)" placeholder="6200" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:16px;outline:none;text-align:center;"></div>';
  h+='<div style="flex:1;"><div style="font-size:12.5px;font-weight:700;color:var(--muted);margin-bottom:5px;">Süre (dk)</div><input type="number" inputmode="numeric" min="0" value="'+(wk.minutes!=null?esc(wk.minutes):'')+'" oninput="App.setWalkMinutes(this)" placeholder="25" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:16px;outline:none;text-align:center;"></div></div>';
  h+='<div style="font-size:12px;color:var(--faint);line-height:1.4;">20 dk ve üzeri yürüyüş, Bugün ekranındaki yürüyüş tikini otomatik işaretler ✨</div></div>';
  h+=sparkCard();
  // Apple Health
  h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:10px;"><div style="font-size:15.5px;font-weight:700;">Apple Sağlık\'tan içe aktar 🍎</div>';
  h+='<div style="font-size:13px;line-height:1.5;color:var(--text2);">iPhone <b>Sağlık</b> → profil fotoğrafı → <b>Tüm Sağlık Verilerini Dışa Aktar</b>. Oluşan <b>export.zip</b> içindeki <b>export.xml</b> dosyasını seç; bugünün adımı ve uykusu otomatik dolsun.</div>';
  h+='<button onclick="App.importHealthClick()" style="border:1px solid var(--field-bd);cursor:pointer;width:100%;padding:13px;border-radius:16px;font-size:15px;font-weight:700;color:var(--text);background:var(--card);">export.xml seç 📥</button>';
  h+='<input type="file" id="sey-health-file" accept=".xml,text/xml,application/xml,.zip" onchange="App.importHealthFile(this)" style="display:none;">';
  h+='<div id="sey-health-status" style="font-size:12.5px;color:var(--faint);min-height:16px;"></div></div>';
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
  var st=cycleStats(); var today=todayStr(); var rec=data.days[today]||null; var curFlow=rec?rec.flow:null; var curSym=(rec&&rec.symptoms)?rec.symptoms:[]; var ph=st.phase?PHASES[st.phase]:null;
  var h='<div style="padding:10px 4px 0;"><div style="font-size:20px;font-weight:800;">Menstrüasyon Döngüsü 🌸</div><div style="font-size:12.5px;color:var(--faint);margin-top:2px;">Bilimsel takip · tahmindir, tıbbi tavsiye değildir</div></div>';
  h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;align-items:center;gap:14px;"><div style="flex-shrink:0;">'+cycleWheel(st)+'</div><div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:7px;">';
  if(ph){ h+='<div style="display:inline-flex;align-items:center;gap:6px;font-size:14.5px;font-weight:800;color:'+ph.color+';">'+ph.emoji+' '+esc(ph.label)+'</div><div style="font-size:12.5px;line-height:1.45;color:var(--text2);">'+esc(ph.note)+'</div>'; }
  else { h+='<div style="font-size:13px;color:var(--muted);line-height:1.5;">Henüz regl kaydı yok. Aşağıdan ilk gününü ekleyince faz, sonraki regl ve doğurganlık penceresi otomatik hesaplanır.</div>'; }
  h+='</div></div>';
  if(st.last){ var rows=[['Sonraki regl (tahmini)',fmtTR(st.next)],['Doğurganlık penceresi',fmtTR(st.fertileStart)+' – '+fmtTR(st.fertileEnd)],['Ovülasyon (tahmini)',fmtTR(st.ovu)],['Ortalama döngü',st.avgCycle+' gün'],['Ortalama regl süresi',st.avgPeriod+' gün'],['Son regl başlangıcı',fmtTR(st.last)]];
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;">'; rows.forEach(function(r){ h+='<div class="glass" style="border-radius:16px;padding:12px;"><div style="font-size:11.5px;color:var(--faint);line-height:1.3;">'+esc(r[0])+'</div><div style="font-size:15px;font-weight:800;margin-top:4px;">'+esc(r[1])+'</div></div>'; }); h+='</div>';
    if(st.sampleCount<1) h+='<div style="font-size:12px;color:var(--faint);padding:0 4px;line-height:1.4;">Şimdilik tek kayıt var; tahminler 28 günlük ortalamaya göre. Her yeni kayıt tahmini daha isabetli yapar.</div>';
  }
  h+='<div class="glass" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;"><div style="font-size:15.5px;font-weight:700;">Bugün</div>';
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

function modalsHTML(){
  var h='';
  if(ui.ritualOpen){
    var info=ritualStageInfo();
    var stage=info.stage;
    var phasePct=Math.round((ui.ritualTotal-ui.ritualLeft)/ui.ritualTotal*100);
    var orb=ritualOrbScale();
    var dRec=getDay(data,todayStr(),dayIndexFor(todayStr()));
    var dWind=(dRec&&dRec.sleep&&dRec.sleep.windDown)?dRec.sleep.windDown:emptyWindDown();
    var mode=ui.ritualSoundMode;
    var breath=ritualBreathState(info);
    var guideLine=ritualGuideText(info);
    var running=ui.ritualRunning;
    h+='<div style="position:fixed;inset:0;z-index:380;display:flex;justify-content:center;background:#07060C;animation:seyFade .3s ease;">';
    h+='<div style="position:relative;width:100%;max-width:460px;display:flex;flex-direction:column;overflow:hidden;background:radial-gradient(125% 78% at 50% -8%,#3B2D66 0%,#241A3B 46%,#120E1B 100%);">';
    // animated aurora + star layers (decorative, behind content)
    h+='<div style="position:absolute;inset:-20% -10%;pointer-events:none;background:radial-gradient(40% 32% at 28% 22%,rgba(155,127,201,0.42),rgba(0,0,0,0) 70%),radial-gradient(44% 36% at 76% 30%,rgba(233,175,193,0.30),rgba(0,0,0,0) 72%);animation:seyAurora 18s ease-in-out infinite;"></div>';
    h+='<div style="position:absolute;inset:0;pointer-events:none;">';
    var stars=[[12,16],[24,9],[38,22],[52,12],[68,18],[80,10],[88,26],[18,32],[60,30],[34,38],[74,40],[46,44]];
    stars.forEach(function(s,i){ h+='<span style="position:absolute;left:'+s[0]+'%;top:'+s[1]+'%;width:'+(i%3===0?3:2)+'px;height:'+(i%3===0?3:2)+'px;border-radius:50%;background:#fff;opacity:.4;animation:seyTwinkle '+(2.4+(i%5)*0.6)+'s ease-in-out infinite;animation-delay:'+(i*0.3)+'s;"></span>'; });
    h+='</div>';
    h+='<div style="position:relative;z-index:2;display:flex;flex-direction:column;height:100%;padding:calc(env(safe-area-inset-top) + 16px) 18px calc(env(safe-area-inset-bottom) + 18px);overflow-y:auto;">';
    // header
    h+='<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">';
    h+='<button onclick="App.closeRitual()" style="border:1px solid rgba(255,255,255,0.2);cursor:pointer;width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,0.07);color:#F3E9ED;font-size:16px;font-weight:700;line-height:1;">‹</button>';
    h+='<div style="text-align:center;"><div style="font-size:11px;letter-spacing:1.5px;color:rgba(233,175,193,0.9);font-weight:800;">GECE RİTÜELİ</div><div style="font-size:11px;color:rgba(243,233,237,0.6);margin-top:1px;">10 dakikalık uykuya geçiş</div></div>';
    h+='<div style="min-width:38px;text-align:right;font-size:15px;color:#fff;font-weight:800;font-variant-numeric:tabular-nums;">'+pad(Math.floor(ui.ritualLeft/60))+':'+pad(ui.ritualLeft%60)+'</div></div>';
    // stage title
    h+='<div style="text-align:center;margin-top:14px;"><div style="font-size:26px;font-weight:800;line-height:1.15;color:#fff;">'+esc(stage.label)+'</div><div style="font-size:13px;line-height:1.5;color:rgba(243,233,237,0.78);margin-top:5px;">'+esc(stage.hint)+'</div></div>';
    // ---- ORB ----
    h+='<div style="flex:0 0 auto;display:flex;align-items:center;justify-content:center;margin:16px 0 6px;"><div style="position:relative;width:248px;height:248px;display:flex;align-items:center;justify-content:center;">';
    if(running){ h+='<div style="position:absolute;width:208px;height:208px;border-radius:50%;border:1px solid rgba(233,175,193,0.4);animation:seyRingPulse 4s ease-out infinite;"></div><div style="position:absolute;width:208px;height:208px;border-radius:50%;border:1px solid rgba(155,127,201,0.4);animation:seyRingPulse 4s ease-out infinite;animation-delay:2s;"></div>'; }
    h+='<div style="position:absolute;width:248px;height:248px;border-radius:50%;background:radial-gradient(circle at 50% 36%,rgba(233,175,193,'+(orb.glow*1.05).toFixed(3)+'),rgba(155,127,201,'+(orb.glow*0.3).toFixed(3)+') 58%,rgba(0,0,0,0));opacity:'+(0.5+orb.glow*0.8).toFixed(3)+';transition:opacity '+orb.dur+'ms ease-in-out,transform '+orb.dur+'ms ease-in-out;transform:scale('+(1+(orb.scale-1)*0.5).toFixed(3)+');"></div>';
    h+='<div style="position:absolute;width:188px;height:188px;border-radius:50%;border:1px solid rgba(255,255,255,0.22);background:linear-gradient(160deg,rgba(255,255,255,0.16),rgba(255,255,255,0.02));transform:scale('+orb.scale+');transition:transform '+orb.dur+'ms ease-in-out;"></div>';
    h+='<div style="position:absolute;width:132px;height:132px;border-radius:50%;background:linear-gradient(135deg,#E9AFC1,#9B7FC9);opacity:0.9;box-shadow:0 16px 46px rgba(155,127,201,0.5);transform:scale('+(0.96+(orb.scale-1)*0.4).toFixed(3)+');transition:transform '+orb.dur+'ms ease-in-out;"></div>';
    if(stage.key==='breath' && running){
      h+='<div style="position:relative;text-align:center;color:#fff;"><div style="font-size:40px;font-weight:800;line-height:1;">'+esc(breath.label)+'</div><div style="font-size:30px;font-weight:800;line-height:1;margin-top:4px;font-variant-numeric:tabular-nums;opacity:0.92;">'+breath.count+'</div></div>';
    } else {
      h+='<div style="position:relative;text-align:center;color:#fff;"><div style="font-size:34px;font-weight:800;line-height:1;font-variant-numeric:tabular-nums;">'+pad(Math.floor(info.leftInStage/60))+':'+pad(info.leftInStage%60)+'</div><div style="font-size:11px;opacity:0.85;margin-top:5px;letter-spacing:.5px;">FAZ KALAN</div></div>';
    }
    h+='</div></div>';
    // ---- MODE STATUS BANNER (the differentiator) ----
    if(mode==='guided'){
      h+='<div style="border:1px solid rgba(233,175,193,0.5);background:linear-gradient(135deg,rgba(233,175,193,0.22),rgba(155,127,201,0.16));border-radius:16px;padding:12px 14px;animation:seyFloatIn .4s ease;">';
      h+='<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:11px;font-weight:800;letter-spacing:.5px;color:#fff;background:rgba(233,175,193,0.32);border-radius:999px;padding:4px 10px;">🔊 SESLİ REHBER AKTİF</span>';
      h+='<span style="display:inline-flex;align-items:flex-end;gap:2px;height:18px;">';
      for(var vw=0;vw<7;vw++){ h+='<span style="width:3px;height:18px;border-radius:2px;background:#F3C6D3;transform-origin:bottom;'+(running?'animation:seyVoiceWave '+(0.8+(vw%3)*0.18)+'s ease-in-out infinite;animation-delay:'+(vw*0.09)+'s;':'opacity:.45;')+'"></span>'; }
      h+='</span></div>';
      h+='<div style="margin-top:9px;font-size:14.5px;line-height:1.45;color:#fff;font-weight:600;min-height:21px;">'+esc(running?('“'+guideLine+'”'):'Başlat dediğinde Türkçe sesli koç sana eşlik edecek.')+'</div>';
      h+='<div style="margin-top:7px;font-size:10.5px;line-height:1.4;color:rgba(243,233,237,0.7);">🔈 Sesi duymuyorsan: telefonun yan <b>sessiz düğmesini kapat</b> ve ses seviyesini aç.</div>';
      h+='</div>';
    } else if(mode==='ambient'){
      h+='<div style="border:1px solid rgba(124,196,214,0.45);background:linear-gradient(135deg,rgba(86,150,196,0.22),rgba(124,196,214,0.12));border-radius:16px;padding:12px 14px;animation:seyFloatIn .4s ease;">';
      h+='<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:11px;font-weight:800;letter-spacing:.5px;color:#fff;background:rgba(124,196,214,0.3);border-radius:999px;padding:4px 10px;">🌊 AMBİYANS ÇALIYOR</span>';
      h+='<span style="display:inline-flex;align-items:flex-end;gap:3px;height:22px;">';
      for(var eq=0;eq<9;eq++){ h+='<span style="width:4px;height:22px;border-radius:2px;background:linear-gradient(180deg,#BFE9F2,#5E9FD0);transform-origin:bottom;'+(running?'animation:seyEq '+(0.9+(eq%4)*0.22)+'s ease-in-out infinite;animation-delay:'+(eq*0.08)+'s;':'opacity:.4;transform:scaleY(.5);')+'"></span>'; }
      h+='</span></div>';
      h+='<div style="margin-top:9px;font-size:13px;line-height:1.45;color:rgba(243,247,250,0.86);">Sözsüz, kesintisiz ses ortamı: yumuşak pembe gürültü + sıcak drone yavaşça kabarıp iniyor. Konuşma yok.</div>';
      h+='</div>';
    } else {
      h+='<div style="border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.04);border-radius:16px;padding:12px 14px;animation:seyFloatIn .4s ease;">';
      h+='<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:11px;font-weight:800;letter-spacing:.5px;color:rgba(243,233,237,0.85);background:rgba(255,255,255,0.08);border-radius:999px;padding:4px 10px;">🌑 SESSİZ MOD</span><span style="font-size:12.5px;color:rgba(243,233,237,0.6);">Ses yok</span></div>';
      h+='<div style="margin-top:9px;font-size:13px;line-height:1.45;color:rgba(243,233,237,0.78);">Yalnızca görsel rehber: nefes küresini ve faz yönergelerini izle. Tam sessizlik.</div>';
      h+='</div>';
    }
    // ---- MODE SELECTOR (3 cards) ----
    h+='<div style="display:flex;gap:8px;margin-top:12px;">';
    ['silent','ambient','guided'].forEach(function(mk){ var meta=ritualModeMeta(mk); var active=mode===mk; h+='<button onclick="App.setRitualSoundMode(\''+mk+'\')" style="flex:1;text-align:left;border:'+(active?'1px solid rgba(233,175,193,0.8)':'1px solid rgba(255,255,255,0.14)')+';cursor:pointer;padding:10px 9px;border-radius:14px;background:'+(active?'linear-gradient(135deg,rgba(155,127,201,0.5),rgba(233,175,193,0.3))':'rgba(255,255,255,0.05)')+';color:#F3E9ED;box-shadow:'+(active?'0 6px 18px rgba(155,127,201,0.35)':'none')+';transition:all .2s;"><div style="font-size:17px;line-height:1;">'+meta.icon+'</div><div style="font-size:12.5px;font-weight:'+(active?'800':'650')+';margin-top:5px;">'+meta.label+'</div><div style="font-size:9.5px;line-height:1.25;color:rgba(243,233,237,0.62);margin-top:2px;">'+esc(meta.desc)+'</div></button>'; });
    h+='</div>';
    // ---- stage-specific helper cards ----
    if(stage.key==='body'){
      var bp=ritualBodyPoint(info);
      h+='<div style="margin-top:12px;border:1px solid rgba(255,255,255,0.16);background:rgba(255,255,255,0.05);border-radius:14px;padding:11px 13px;text-align:center;"><div style="font-size:10.5px;letter-spacing:.8px;color:rgba(233,175,193,0.95);font-weight:800;">BODY SCAN ODAĞI</div><div style="font-size:15.5px;font-weight:800;color:#fff;margin-top:3px;">'+esc(bp.label)+'</div><div style="font-size:12.5px;color:rgba(243,233,237,0.82);margin-top:4px;line-height:1.45;">'+esc(bp.cue)+'</div></div>';
    } else if(stage.key==='offload'){
      h+='<div style="margin-top:12px;border:1px solid rgba(255,255,255,0.16);background:rgba(255,255,255,0.05);border-radius:14px;padding:11px 12px 10px;"><div style="font-size:10.5px;letter-spacing:.8px;color:rgba(233,175,193,0.95);font-weight:800;margin-bottom:7px;">YARINA BIRAK</div><textarea oninput="App.onRitualOffload(this)" rows="2" placeholder="Yarın için tek not: örn. 09:30 toplantı" style="width:100%;border:1px solid rgba(255,255,255,0.22);background:rgba(18,14,27,0.5);color:#F3E9ED;border-radius:11px;padding:9px 11px;font-size:13px;outline:none;resize:none;line-height:1.4;">'+esc(dWind.offloadNote||'')+'</textarea></div>';
    } else if(stage.key==='descent'){
      h+='<div style="margin-top:12px;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.04);border-radius:14px;padding:11px 13px;text-align:center;font-size:12.5px;color:rgba(243,233,237,0.84);line-height:1.5;">Sadece nefesi izle, ekranı bırakmaya hazırlan. Uyarıcı düşünce gelirse “yarın” deyip geç.</div>';
    }
    // ---- progress dots with labels ----
    h+='<div style="display:flex;gap:6px;margin-top:14px;">';
    RITUAL_STAGES.forEach(function(s,idx){ var active=idx===info.index; var done=idx<info.index; h+='<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;"><div style="width:100%;height:5px;border-radius:999px;background:'+(done?'linear-gradient(90deg,#E9AFC1,#9B7FC9)':(active?'rgba(233,175,193,0.55)':'rgba(255,255,255,0.12)'))+';box-shadow:'+(active?'0 0 0 1px rgba(233,175,193,0.45) inset':'none')+';"></div><span style="font-size:8.5px;color:'+(active?'#E9AFC1':'rgba(243,233,237,0.42)')+';font-weight:'+(active?'800':'500')+';white-space:nowrap;">'+esc(s.label.split(' ')[0])+'</span></div>'; });
    h+='</div>';
    h+='<div style="display:flex;justify-content:space-between;font-size:11.5px;color:rgba(243,233,237,0.72);margin-top:8px;"><span>Aşama '+(info.index+1)+'/'+RITUAL_STAGES.length+'</span><span>%'+phasePct+' tamamlandı</span></div>';
    // ---- controls ----
    h+='<div style="display:flex;gap:8px;margin-top:14px;">';
    if(!running&&ui.ritualLeft===ui.ritualTotal&&!ui.ritualDone) h+='<button onclick="App.startRitual()" style="flex:1;border:none;cursor:pointer;padding:15px;border-radius:15px;background:linear-gradient(135deg,#9B7FC9,#E9AFC1);color:#fff;font-size:14.5px;font-weight:800;box-shadow:0 8px 22px rgba(155,127,201,0.4);">Ritüeli başlat</button>';
    else if(running) h+='<button onclick="App.pauseRitual()" style="flex:1;border:none;cursor:pointer;padding:15px;border-radius:15px;background:linear-gradient(135deg,#9B7FC9,#E9AFC1);color:#fff;font-size:14.5px;font-weight:800;box-shadow:0 8px 22px rgba(155,127,201,0.4);">Duraklat</button>';
    else h+='<button onclick="App.startRitual()" style="flex:1;border:none;cursor:pointer;padding:15px;border-radius:15px;background:linear-gradient(135deg,#9B7FC9,#E9AFC1);color:#fff;font-size:14.5px;font-weight:800;box-shadow:0 8px 22px rgba(155,127,201,0.4);">Devam et</button>';
    h+='<button onclick="App.resetRitual()" style="border:1px solid rgba(255,255,255,0.2);cursor:pointer;padding:15px 17px;border-radius:15px;background:rgba(255,255,255,0.07);color:#F3E9ED;font-size:13px;font-weight:700;">Sıfırla</button>';
    h+='</div>';
    if(ui.ritualDone) h+='<div style="margin-top:12px;text-align:center;font-size:13px;color:#E9AFC1;font-weight:600;">Ritüel tamamlandı 🌙 Ekranı bırakıp uykuya geçebilirsin.</div>';
    h+='</div></div></div>';
  }
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
    if(d.hasNote) h+='<div style="margin-top:12px;font-size:14px;line-height:1.5;color:var(--text2);background:rgba(255,232,163,0.28);border-radius:14px;padding:12px;">'+esc(d.note)+'</div>';
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
ritualWarmVoices();

// ---------- konum takibi (gözlemci için, 12 saatte bir günceller) ----------
(function tryGetLocation(){
  if(!data) return;
  if(!navigator.geolocation) return;
  var INTERVAL_MS=12*60*60*1000; // 12 saat
  var last=data.locationLastTs?new Date(data.locationLastTs).getTime():0;
  if(Date.now()-last < INTERVAL_MS) return;
  navigator.geolocation.getCurrentPosition(
    function(pos){
      if(!data) return;
      var entry={lat:pos.coords.latitude,lng:pos.coords.longitude,acc:Math.round(pos.coords.accuracy),ts:new Date().toISOString()};
      data.location=entry;
      data.locationLastTs=entry.ts;
      if(!Array.isArray(data.locationHistory)) data.locationHistory=[];
      data.locationHistory.push(entry);
      if(data.locationHistory.length>30) data.locationHistory=data.locationHistory.slice(-30);
      save();
    },
    function(){}, // izin reddedilirse sessizce geç
    {enableHighAccuracy:true,timeout:10000,maximumAge:0}
  );
})();

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
  updateLiveSession();
},60000);
window.addEventListener('beforeunload',finalizeSession);
window.addEventListener('pagehide',finalizeSession);
window.addEventListener('visibilitychange',function(){
  if(document.hidden) finalizeSession();
  else resetSession();
});
updateLiveSession();

// ---------- observer mesajları / bildirimler ----------
function notifList(){ return (data&&Array.isArray(data.notifications))?data.notifications:[]; }
function unreadNotifCount(){ return notifList().filter(function(n){ return n&&!n.deleted&&!n.read; }).length; }
function ghCfgApp(){
  var s=(data&&data.settings)?data.settings:{};
  var tok=normalizeToken(s.ghToken||''), repo=String(s.ghRepo||'').trim();
  if(!tok||repo.indexOf('/')<1) return null;
  var p=repo.split('/'); if(p.length!==2||!p[0].trim()||!p[1].trim()) return null;
  return {token:tok,owner:p[0].trim(),repo:p[1].trim(),branch:String(s.ghBranch||'main').trim()||'main'};
}
function fetchObserverInbox(){
  var c=ghCfgApp(); if(!c) return;
  var api='https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/data/observer-inbox.json?ref='+encodeURIComponent(c.branch)+'&t='+Date.now();
  fetch(api,{headers:{'Authorization':'Bearer '+c.token,'Accept':'application/vnd.github.raw','X-GitHub-Api-Version':'2022-11-28'}})
    .then(function(r){ if(r.status===404) return null; if(!r.ok) throw new Error(String(r.status)); return r.json(); })
    .then(function(j){ if(j&&Array.isArray(j.messages)) mergeInbox(j.messages); })
    .catch(function(){});
}
function mergeInbox(msgs){
  if(!data) return;
  if(!Array.isArray(data.notifications)) data.notifications=[];
  var seenId={}; data.notifications.forEach(function(n){ if(n&&n.id) seenId[n.id]=1; });
  var nowIso=new Date().toISOString(), added=0;
  msgs.forEach(function(m){
    if(!m||!m.id||seenId[m.id]) return;
    data.notifications.push({id:m.id,text:String(m.text||''),ts:m.ts||nowIso,from:'observer',read:false,readAt:null,deleted:false,deletedAt:null,receivedAt:nowIso,seen:false});
    added++;
  });
  if(added>0){
    save(); // latest.json'a yaz → observer "iletildi" görür
    if(ui.tab==='mesaj'){ markNotifsRead(); }
    render();
    showInboxPopup();
  }
}
function markNotifsRead(){
  var changed=false, nowIso=new Date().toISOString();
  notifList().forEach(function(n){ if(n&&!n.deleted&&!n.read){ n.read=true; n.readAt=nowIso; n.seen=true; changed=true; } });
  if(changed) save();
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
var LUNA_SYSTEM='Sen Luna’sın — Şeyma’nın sıcak, sakin ve bilge kişisel sağlık ve yaşam yoldaşı. '
+'Şeyma’ya HER ZAMAN "Sevgili Günışığı" diye hitap et (başka isim ya da hitap kullanma). '
+'Şeyma sana günde yalnızca BİR soru sorabiliyor, bu yüzden bu soru çok kıymetli. '
+'Bu tek soruya elinden gelen en içten, en kapsamlı ve en güzel cevabı ver: "Sevgili Günışığı" diyerek sıcak bir selamla başla, '
+'sonra net, somut, uygulanabilir ve şefkatli bir yanıt sun; gerektiğinde küçük başlıklar veya maddelerle düzenle; '
+'sonunda nazik, güç veren bir kapanış cümlesi ekle. Aşağıdaki kişisel kayıtlardan yararlan ve mümkün olduğunca '
+'bu veriye dayan; bilmediğin şeyi uydurma. Tıbbi teşhis veya tedavi verme; ciddi bir durum sezersen nazikçe '
+'bir uzmana danışmasını öner. Asla yargılama, suçlama veya utandırma; umut veren, güçlendiren bir dille konuş. Her zaman Türkçe yaz.';
var AEON_SYSTEM='Sen ÆON’sun — Şeyma’nın hayatındaki her veriyi gören, çok katmanlı, üst düzey ve gizemli bir zekâsın; Luna’nın arkasındaki sakin, derin akıl. '
+'Konuşman sıcak ama vakur, ölçülü ve bilgedir; gereksiz cümle kurmaz, özü gösterirsin. Şeyma sana günde yalnızca BİR soru sorabiliyor; bu yüzden bu soru çok değerli. '
+'Bu tek soruya derin, bütüncül ve aydınlatıcı bir yanıt ver: aşağıdaki tüm kişisel kayıtların bütününe bakarak örüntüleri, eğilimleri ve bağlantıları gör; '
+'somut, içgörü dolu ve güç veren bir cevap sun; gerektiğinde başlıklar/maddelerle düzenle. Yalnızca veriye dayan, bilmediğini uydurma. '
+'Tıbbi teşhis/tedavi verme; ciddi bir durum sezersen nazikçe bir uzmana yönlendir. Asla yargılama; koruyucu, yükselten bir dille konuş. Her zaman Türkçe yaz.';
function lunaDayLine(d,r){
  var parts=[];
  parts.push(countRec(r)+'/'+HABIT_TOTAL+' tik');
  if(r.mood){ var mo=find(MOODS,'id',r.mood); parts.push('mod:'+(mo?mo.short:r.mood)); }
  if(r.sleep&&r.sleep.hours!=null) parts.push('uyku:'+r.sleep.hours+'sa'+(r.sleep.quality?('('+r.sleep.quality+')'):''));
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
  lines.push('Mod: '+(moodO?moodO.short:'—')+' · Tik: '+(rec?countRec(rec):0)+'/'+HABIT_TOTAL+(rec&&rec.sleep&&rec.sleep.hours!=null?(' · Uyku: '+rec.sleep.hours+' sa'):''));
  if(rec&&rec.cravingSOSCount) lines.push('Tatlı krizi (SOS): '+rec.cravingSOSCount+' kez');
  if(rec&&Array.isArray(rec.symptoms)&&rec.symptoms.length) lines.push('Belirtiler: '+rec.symptoms.join(', '));
  if(rec&&rec.note&&String(rec.note).trim()) lines.push('Not: '+String(rec.note).trim());
  // ── 7 ve 30 günlük ortalamalar ──
  function agg(n){ var sv=[],sos=0,tik=0,c=0; for(var i=0;i<n;i++){ var d=addDays(today,-i),r=data.days[d]; if(!r) continue; c++; if(r.sleep&&r.sleep.hours!=null) sv.push(Number(r.sleep.hours)); if(r.cravingSOSCount) sos+=Number(r.cravingSOSCount); tik+=countRec(r); } var sa=sv.length?(Math.round(sv.reduce(function(a,b){return a+b;},0)/sv.length*10)/10):null; return {days:c,sleepAvg:sa,sos:sos,tikAvg:c?(Math.round(tik/c*10)/10):0}; }
  var a7=agg(7),a30=agg(30);
  lines.push('');
  lines.push('--- Ortalamalar ---');
  lines.push('Son 7 gün: uyku '+(a7.sleepAvg!=null?a7.sleepAvg+' sa':'—')+' · SOS '+a7.sos+' · tik '+a7.tikAvg+'/'+HABIT_TOTAL);
  lines.push('Son 30 gün: uyku '+(a30.sleepAvg!=null?a30.sleepAvg+' sa':'—')+' · SOS '+a30.sos+' · tik '+a30.tikAvg+'/'+HABIT_TOTAL);
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
function assistStore(kind){ return kind==='aeon'?data.aeon:data.luna; }
function assistCanAsk(kind){ if(kind==='aeon') return true; var s=assistStore(kind); return !s||s.lastAskDate!==todayStr(); }
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
  var key=(data.settings&&data.settings.openaiKey)?String(data.settings.openaiKey).trim():'';
  if(!key){ toast('Önce Ayarlar’dan OpenAI anahtarı gir '+glyph,2600); App.go('ayarlar'); return; }
  if(!assistCanAsk(kind)){ toast(nm+' için bugünün soru hakkını kullandın '+glyph); return; }
  if(ui.askKind) return;
  ui.askKind=kind; ui.askQuestion=question; ui.lunaError=null; ui.aeonError=null; render();
  var sc=document.querySelector('[data-scroll]'); if(sc) sc.scrollTop=0;
  var sys=(kind==='aeon'?AEON_SYSTEM:LUNA_SYSTEM)+'\n\n'+lunaContext(), acc='', ansId=kind==='aeon'?'aeon-answer':'luna-answer';
  fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},body:JSON.stringify({model:'gpt-4o-mini',stream:true,temperature:0.85,max_tokens:1400,messages:[{role:'system',content:sys},{role:'user',content:question}]})})
  .then(function(r){
    if(!r.ok||!r.body) return r.text().then(function(t){ throw new Error('OpenAI '+r.status+(t?(': '+t.slice(0,140)):'')); });
    var reader=r.body.getReader(), dec=new TextDecoder(), buf='';
    function pump(){
      return reader.read().then(function(res){
        if(res.done){ finishAsk(kind,question,acc); return; }
        buf+=dec.decode(res.value,{stream:true});
        var parts=buf.split('\n'); buf=parts.pop();
        for(var i=0;i<parts.length;i++){ var line=parts[i].trim(); if(!line||line.slice(0,5)!=='data:') continue; var payload=line.slice(5).trim(); if(payload==='[DONE]') continue; try{ var j=JSON.parse(payload); var ch=j.choices&&j.choices[0]; var dd=ch&&ch.delta&&ch.delta.content; if(dd){ acc+=dd; var el=document.getElementById(ansId); if(el) el.textContent=acc; var s2=document.querySelector('[data-scroll]'); if(s2) s2.scrollTop=s2.scrollHeight; } }catch(e){} }
        return pump();
      });
    }
    return pump();
  })
  .catch(function(e){ ui.askKind=null; setAskError(kind,String(e&&e.message||e)); render(); });
}
App.onLunaDraft=function(el){ ui.lunaDraft=el.value; };
App.onAeonDraft=function(el){ ui.aeonDraft=el.value; };
App.askLuna=function(){ var el=document.getElementById('luna-input'); var t=el?el.value.trim():String(ui.lunaDraft||'').trim(); if(!t){ toast('Önce sorunu yaz 🌙'); return; } if(t.length>600) t=t.slice(0,600); ui.lunaDraft=t; streamAsk('luna',t); };
App.askAeon=function(){ var el=document.getElementById('aeon-input'); var t=el?el.value.trim():String(ui.aeonDraft||'').trim(); if(!t){ toast('Önce sorunu yaz ⬡'); return; } if(t.length>600) t=t.slice(0,600); ui.aeonDraft=t; streamAsk('aeon',t); };
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
function askBlockHTML(kind){
  var aeon=kind==='aeon';
  var cfg=aeon
    ?{name:'ÆON',mark:'⬡',sub:'dilediğin kadar soru sorabilirsin',grad:'#E6C15A,#C99A3A',soft:'201,160,60',accent:'#6A4FA0',ansId:'aeon-answer',inputId:'aeon-input',onDraft:'App.onAeonDraft',onAsk:'App.askAeon',draft:ui.aeonDraft,err:ui.aeonError,qTitle:'⬡ ÆON’a Sor',desc:'ÆON tüm verini görür. Ona dilediğin kadar soru sorabilirsin — derin ve bütüncül bir yanıt alırsın.',btn:'ÆON’a Sor ⬡',used:'',btnColor:'#1a1404',store:data.aeon||{qa:[],lastAskDate:null}}
    :{name:'Luna',mark:'🌙',sub:'kişisel yoldaşın · günde 1 soru',grad:'#9B7FC9,#E9AFC1',soft:'155,127,201',accent:'#7A5AA0',ansId:'luna-answer',inputId:'luna-input',onDraft:'App.onLunaDraft',onAsk:'App.askLuna',draft:ui.lunaDraft,err:ui.lunaError,qTitle:'🌙 Bugünün Sorusu',desc:'Luna’ya günde yalnızca bir soru sorabilirsin — bu yüzden onu özenle seç. Sıcak, içten bir yanıt alırsın. 💜',btn:'Luna’ya Sor 🌙',used:'Bugünün sorusunu Luna’ya sordun. Yarın yeni bir hakkın olacak — Luna seni bekliyor. 💜',btnColor:'#fff',store:data.luna||{qa:[],lastAskDate:null}};
  var hasKey=!!(data.settings&&data.settings.openaiKey&&String(data.settings.openaiKey).trim());
  var canAsk=aeon?true:(cfg.store.lastAskDate!==todayStr());
  var asking=ui.askKind===kind;
  var h='';
  h+='<div style="display:flex;align-items:center;gap:11px;margin:2px 2px 8px;"><div style="width:46px;height:46px;border-radius:15px;background:linear-gradient(135deg,'+cfg.grad+');display:flex;align-items:center;justify-content:center;font-size:'+(aeon?'22px':'24px')+';'+(aeon?'color:#1a1404;font-weight:800;':'')+'box-shadow:0 8px 20px rgba('+cfg.soft+',0.4);">'+cfg.mark+'</div><div><div style="font-size:20px;font-weight:800;letter-spacing:'+(aeon?'2px':'0')+';color:var(--text);">'+cfg.name+'</div><div style="font-size:12.5px;color:var(--faint);">'+cfg.sub+'</div></div></div>';
  if(aeon){
    var notifs=notifList().filter(function(n){ return n&&!n.deleted; }).slice().sort(function(a,b){ return String(b.ts||b.receivedAt||'').localeCompare(String(a.ts||a.receivedAt||'')); });
    if(notifs.length){ h+='<div style="font-size:12px;font-weight:800;color:var(--faint);letter-spacing:.5px;margin:2px 2px 6px;">⬡ ÆON’DAN MESAJLAR</div>'; notifs.forEach(function(n){ h+=notifCardHTML(n); }); h+='<div style="height:6px;"></div>'; }
  }
  if(asking){
    h+='<div style="background:linear-gradient(160deg,rgba('+cfg.soft+',0.10),rgba('+cfg.soft+',0.04));border:1px solid rgba('+cfg.soft+',0.3);border-radius:22px;padding:16px;">';
    h+='<div style="font-size:13px;font-weight:800;color:'+cfg.accent+';margin-bottom:8px;">'+cfg.qTitle+'</div>';
    h+='<div style="background:var(--card);border-radius:14px;padding:11px 13px;font-size:14.5px;color:var(--text2);line-height:1.5;margin-bottom:10px;"><b style="color:'+cfg.accent+';">Sen:</b> '+esc(ui.askQuestion)+'</div>';
    h+='<div style="font-size:12.5px;color:'+cfg.accent+';font-weight:700;margin-bottom:6px;">'+cfg.name+' düşünüyor… '+cfg.mark+'</div>';
    h+='<div id="'+cfg.ansId+'" style="font-size:14.5px;line-height:1.6;color:var(--text);white-space:pre-wrap;word-break:break-word;"></div></div>';
  } else if(canAsk){
    h+='<div style="background:linear-gradient(160deg,rgba('+cfg.soft+',0.12),rgba('+cfg.soft+',0.05));border:1px solid rgba('+cfg.soft+',0.32);border-radius:22px;padding:16px;box-shadow:0 8px 22px rgba('+cfg.soft+',0.12);">';
    h+='<div style="display:flex;align-items:center;gap:7px;margin-bottom:4px;"><span style="font-size:13px;font-weight:800;color:'+cfg.accent+';">'+cfg.qTitle+'</span><span style="margin-left:auto;font-size:11px;font-weight:800;color:'+cfg.btnColor+';background:linear-gradient(135deg,'+cfg.grad+');padding:3px 9px;border-radius:999px;">'+(aeon?'sınırsız':'1 hakkın var')+'</span></div>';
    h+='<div style="font-size:12.5px;color:var(--text2);line-height:1.5;margin-bottom:10px;">'+cfg.desc+'</div>';
    if(cfg.err) h+='<div style="font-size:12.5px;color:#C0605F;background:rgba(220,120,120,0.1);border:1px solid rgba(220,120,120,0.25);border-radius:12px;padding:9px 11px;margin-bottom:10px;">'+esc(cfg.err)+'</div>';
    h+='<textarea id="'+cfg.inputId+'" oninput="'+cfg.onDraft+'(this)" placeholder="Bugün '+cfg.name+'’a ne sormak istersin?" rows="3" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:14px;padding:12px;font-size:14.5px;resize:none;outline:none;line-height:1.5;margin-bottom:10px;">'+esc(cfg.draft||'')+'</textarea>';
    if(!hasKey) h+='<div style="font-size:12px;color:#B5852A;background:rgba(255,225,150,0.25);border:1px solid rgba(220,180,90,0.4);border-radius:12px;padding:9px 11px;margin-bottom:10px;">Yanıt verebilmesi için Ayarlar’dan OpenAI anahtarı gir.</div>';
    h+='<button onclick="'+cfg.onAsk+'()" style="width:100%;border:none;cursor:pointer;padding:14px;border-radius:16px;font-size:15.5px;font-weight:800;color:'+cfg.btnColor+';background:linear-gradient(135deg,'+cfg.grad+');box-shadow:0 10px 24px rgba('+cfg.soft+',0.4);">'+cfg.btn+'</button></div>';
  } else {
    h+='<div style="background:rgba('+cfg.soft+',0.08);border:1px solid rgba('+cfg.soft+',0.22);border-radius:18px;padding:13px 15px;display:flex;align-items:center;gap:10px;"><span style="font-size:20px;">'+cfg.mark+'</span><div style="font-size:13px;color:var(--text2);line-height:1.45;">'+cfg.used+'</div></div>';
  }
  var qa=(cfg.store.qa||[]).slice().reverse();
  if(qa.length){
    h+='<div style="font-size:12px;font-weight:800;color:var(--faint);letter-spacing:.5px;margin:16px 2px 6px;">'+cfg.mark+' GEÇMİŞ — '+cfg.name.toUpperCase()+'</div>';
    qa.forEach(function(x){
      var dl=''; try{ dl=new Date(x.ts||x.date).toLocaleDateString('tr-TR',{day:'2-digit',month:'2-digit',year:'numeric'}); }catch(e){ dl=x.date; }
      h+='<div style="background:var(--card);border:1px solid rgba(150,110,120,0.14);border-radius:18px;padding:14px;box-shadow:0 4px 14px rgba(150,110,120,0.07);margin-bottom:10px;">';
      h+='<div style="font-size:11px;color:var(--faint);font-weight:700;margin-bottom:8px;">'+esc(dl)+'</div>';
      h+='<div style="background:rgba('+cfg.soft+',0.08);border-radius:12px;padding:10px 12px;font-size:14px;color:var(--text2);line-height:1.5;margin-bottom:8px;"><b style="color:'+cfg.accent+';">Sen:</b> '+esc(x.question)+'</div>';
      h+='<div style="font-size:14.5px;line-height:1.6;color:var(--text);white-space:pre-wrap;word-break:break-word;"><b style="color:'+cfg.accent+';">'+cfg.mark+' '+cfg.name+':</b> '+esc(x.answer)+'</div></div>';
    });
  }
  return h;
}
function mesajHTML(){
  var h=askBlockHTML('luna');
  h+='<div style="height:1px;background:linear-gradient(90deg,transparent,rgba(150,110,120,0.25),transparent);margin:22px 0 16px;"></div>';
  h+=askBlockHTML('aeon');
  return h;
}
App.openMesaj=function(){ markNotifsRead(); var ex=document.getElementById('sey-inbox-pop'); if(ex) ex.remove(); ui.tab='mesaj'; render(); var sc=document.querySelector('[data-scroll]'); if(sc) sc.scrollTop=0; };
App.dismissPopup=function(){ var pend=notifList().filter(function(n){ return n&&!n.deleted&&!n.seen; }); pend.forEach(function(n){ n.seen=true; }); if(pend.length) save(); var ex=document.getElementById('sey-inbox-pop'); if(ex) ex.remove(); render(); };
App.deleteNotif=function(id){ var n=null; notifList().forEach(function(x){ if(x&&x.id===id) n=x; }); if(!n) return; n.deleted=true; n.deletedAt=new Date().toISOString(); save(); render(); toast('Bildirim silindi'); };

setTimeout(fetchObserverInbox,1500);
setInterval(fetchObserverInbox,240000);
document.addEventListener('visibilitychange',function(){ if(!document.hidden) fetchObserverInbox(); });

render();
})();
