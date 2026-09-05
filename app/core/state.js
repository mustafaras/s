(function(){
  'use strict';
  // MON-12 · migrate gövde aktarımı
  // ---------------------------------------------------------------------------
  // `data`, `ui`, `dark` ve app.js kapanışındaki rebind'ler hâlâ app.js'in
  // sahibidir. Bu registry yalnızca migration gövdesini ve açık bağımlılık
  // resolver'ını taşır; dışarıya setter/store/event-bus veya kapanış bağını
  // yeniden atama yetkisi vermez. app.js aynı `function migrate(d)` imzasını
  // koruyan shim'i taşır.
  //
  // MİMARİ KARAR B1: `data` mutable bir bağlamadır. Bu nedenle registry hiçbir
  // zaman `window.data` snapshot'ı tutmaz ve migrate içinde kapanış data'sını
  // yeniden bağlamaz. Archive backfill'in `try/finally` adaptörü app.js'te
  // kalır; registry yalnızca onu isimli bir fonksiyon olarak çağırır.
  //
  // Not: `emptyDay` plan belgelerinde geçer ancak `app.js`'te böyle bir
  // fonksiyon YOKTUR (yalnızca `getDay` içinde satır içi day şablonu vardır).
  // Bu yüzden `emptyDay` burada expose edilmez; `getDay` yüzeyi yeterlidir.

  function soft(name){
    // `window[name]` üzerinden çözümlenen lazy getter.
    return function(){
      try{ return window[name]; }catch(e){ return null; }
    };
  }

  var migrateDeps = null;
  var MIGRATE_DEPENDENCIES = [
    'migrateReminderState', 'normalizeSyncReceipt', 'ensureEventLog',
    'emptyZikrRoot', 'migrateZikrV2', 'ensureSaygiDay', 'emptySaygiRoot', 'ensureQuranJourney',
    'emptyLibrary', 'normBook', 'emptyWatchlist', 'normTitle', 'emptyMusic',
    'normTrack', 'emptySoulArchive', 'normSoulItem', 'backfillArchivesFromDays',
    'todayStr', 'syncDerivedHabits', 'ensureProfileAssessment',
    'dailyPhotoCopy', 'ensureTherapyAllDays', 'ensurePrayerDay'
  ];

  function registerMigrate(deps){
    if(migrateDeps||!deps||typeof deps!=='object'||Array.isArray(deps)) return false;
    for(var i=0;i<MIGRATE_DEPENDENCIES.length;i++){
      if(typeof deps[MIGRATE_DEPENDENCIES[i]]!=='function') return false;
    }
    if(typeof deps.caffeineDefaultBed!=='string') return false;
    migrateDeps=deps;
    return true;
  }

  function migrate(d){
    // app.js yüklenmeden çağrılırsa hiçbir kökü kısmen normalleştirme.
    if(!migrateDeps) return d;
    var dep=migrateDeps;
    var migrateReminderState=dep.migrateReminderState;
    var normalizeSyncReceipt=dep.normalizeSyncReceipt;
    var ensureEventLog=dep.ensureEventLog;
    var emptyZikrRoot=dep.emptyZikrRoot;
    var migrateZikrV2=dep.migrateZikrV2;
    var ensureSaygiDay=dep.ensureSaygiDay;
    var emptySaygiRoot=dep.emptySaygiRoot;
    var ensureQuranJourney=dep.ensureQuranJourney;
    var emptyLibrary=dep.emptyLibrary;
    var normBook=dep.normBook;
    var emptyWatchlist=dep.emptyWatchlist;
    var normTitle=dep.normTitle;
    var emptyMusic=dep.emptyMusic;
    var normTrack=dep.normTrack;
    var emptySoulArchive=dep.emptySoulArchive;
    var normSoulItem=dep.normSoulItem;
    var backfillArchivesFromDays=dep.backfillArchivesFromDays;
    var todayStr=dep.todayStr;
    var syncDerivedHabits=dep.syncDerivedHabits;
    var ensureProfileAssessment=dep.ensureProfileAssessment;
    var dailyPhotoCopy=dep.dailyPhotoCopy;
    var ensureTherapyAllDays=dep.ensureTherapyAllDays;
    var ensurePrayerDay=dep.ensurePrayerDay;
    var CAFFEINE_DEFAULT_BED=dep.caffeineDefaultBed;

    if(!d||typeof d!=='object'||Array.isArray(d)) return d;
    // Top-level future roots are opaque to this build. Do not run any nested
    // migration, rewrite the version, or create defaults inside the root.
    if(typeof d.version==='number'&&isFinite(d.version)&&d.version>2) return d;
    migrateReminderState(d);
    d.syncReceipt=normalizeSyncReceipt(d.syncReceipt);
    ensureEventLog(d);
    if(typeof d.savedAt!=='string') d.savedAt='';
    if(!d.settings) d.settings={nickname:'Sevgili Günışığı',notificationsWanted:false,haptics:true};
    if(typeof d.settings.ghToken!=='string') d.settings.ghToken='';
    if(typeof d.settings.ghRepo!=='string') d.settings.ghRepo='';
    if(typeof d.settings.ghBranch!=='string') d.settings.ghBranch='';
    if(typeof d.settings.openaiKey!=='string') d.settings.openaiKey='';
    if(typeof d.settings.lunaConnected!=='boolean') d.settings.lunaConnected=!!(d.settings.openaiKey&&String(d.settings.openaiKey).trim());
    if(typeof d.settings.locationEnabled!=='boolean') d.settings.locationEnabled=false;
    if(d.settings.locationMode!=='walk'&&d.settings.locationMode!=='vehicle'&&d.settings.locationMode!=='auto') d.settings.locationMode='auto';
    // Konum aç/kapa audit kaydı: neden ve ne zaman değişti
    if(typeof d.settings.locationEnabledAt!=='string') d.settings.locationEnabledAt='';
    if(typeof d.settings.locationEnabledReason!=='string') d.settings.locationEnabledReason='';
    if(typeof d.settings.locationDisabledAt!=='string') d.settings.locationDisabledAt='';
    if(typeof d.settings.locationDisabledReason!=='string') d.settings.locationDisabledReason='';
    if(!d.luna||typeof d.luna!=='object') d.luna={qa:[],lastAskDate:null};
    if(!Array.isArray(d.luna.qa)) d.luna.qa=[];
    if(typeof d.luna.lastAskDate!=='string'&&d.luna.lastAskDate!==null) d.luna.lastAskDate=null;
    if(!d.aeon||typeof d.aeon!=='object') d.aeon={qa:[],lastAskDate:null,lastNotificationShownAt:null};
    if(!Array.isArray(d.aeon.qa)) d.aeon.qa=[];
    if(typeof d.aeon.lastAskDate!=='string'&&d.aeon.lastAskDate!==null) d.aeon.lastAskDate=null;
    if(typeof d.aeon.lastNotificationShownAt!=='string'&&d.aeon.lastNotificationShownAt!==null) d.aeon.lastNotificationShownAt=null;
    if(!Array.isArray(d.aeon.shownNotificationIds)) d.aeon.shownNotificationIds=[];
    if(typeof d.settings.aeonNotifyPermission!=='string') d.settings.aeonNotifyPermission='';
    if(typeof d.settings.aeonNotifyBannerDismissedAt!=='string'&&d.settings.aeonNotifyBannerDismissedAt!==null) d.settings.aeonNotifyBannerDismissedAt=null;
    if(!d.settings.ghRepo) d.settings.ghRepo='mustafaras/seyma-data';
    if(typeof d.settings.healthGistId!=='string') d.settings.healthGistId='';
    if(typeof d.settings.hideLocationCard!=='boolean') d.settings.hideLocationCard=false;
    if(typeof d.settings.hideRepoBanner!=='boolean') d.settings.hideRepoBanner=false;
    if(typeof d.settings.hideVacationCard!=='boolean') d.settings.hideVacationCard=false;
    if(typeof d.settings.profileAssessmentInactive!=='boolean') d.settings.profileAssessmentInactive=true;
    // Premium FX gate varsayılanları. mediaFx/timeTheme `!s.premiumAtmosphere`
    // ile kapanır; bu alan hiç yazılmadığı için ayarlar kartı "Açık" gösterirken
    // ses/titreşim/saat teması sessiz kalıyordu (alt anahtarlar açılsa bile).
    // Yalnızca eksikse doldurulur; kullanıcının bilinçli kapatma tercihi korunur.
    if(typeof d.settings.premiumAtmosphere!=='boolean') d.settings.premiumAtmosphere=true;
    if(typeof d.settings.uiSounds!=='boolean') d.settings.uiSounds=true;
    if(typeof d.settings.richHaptics!=='boolean') d.settings.richHaptics=true;
    // Kapalı kalanlar: sesli rehberlik ve ambiyans kendiliğinden ses çıkardığı için
    // opt-in; launchRitual'ın ise runtime karşılığı (splash) henüz yazılmadı.
    if(typeof d.settings.launchRitual!=='boolean') d.settings.launchRitual=false;
    if(typeof d.settings.voiceGuidance!=='boolean') d.settings.voiceGuidance=false;
    if(typeof d.settings.ambientSounds!=='boolean') d.settings.ambientSounds=false;
    // FX kapanış kararı D4 (kullanıcı kararı): bulut TTS varsayılan açık, yerel
    // sese düşüş kapalı. voiceGuidance kapalıyken ikisi de atıl; kullanıcı sesi
    // açtığında robotik yerel ses yerine sinirsel ses devreye girer.
    if(typeof d.settings.voiceCloudTts!=='boolean') d.settings.voiceCloudTts=true;
    if(typeof d.settings.voiceLocalFallback!=='boolean') d.settings.voiceLocalFallback=false;
    if(d.settings.caffeineMode!=='standard'&&d.settings.caffeineMode!=='sensitive'&&d.settings.caffeineMode!=='pregnant') d.settings.caffeineMode='standard';
    if(typeof d.settings.targetBed!=='string'||!/^\d{2}:\d{2}$/.test(d.settings.targetBed)) d.settings.targetBed=CAFFEINE_DEFAULT_BED;
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
    if(d.days&&typeof d.days==='object') Object.keys(d.days).forEach(function(k){ var rec=d.days[k]; if(rec&&typeof rec==='object'){ ensureSaygiDay(rec); if(!Array.isArray(rec.soulActivities)) rec.soulActivities=[]; } });
    if(typeof d.lastOpenedAt!=='string') d.lastOpenedAt='';
    // İlham & İbadet Faz 35/39: zikirmatik + saygı koleksiyonu backfill
    if(!d.zikr||typeof d.zikr!=='object') d.zikr=emptyZikrRoot();
    try{ migrateZikrV2(d); }catch(e){ try{ console.warn('[Zikirmatik] v2 migration uygulanamadı',e); }catch(_e){} }
    if(!d.saygi||typeof d.saygi!=='object') d.saygi=emptySaygiRoot();
    // Raşit ile Kur’an Yolculuğu (QY-02): V1 şema backfill — additive ve idempotent.
    try{ ensureQuranJourney(d); }catch(e){ try{ console.warn('[Kur’an] migration uygulanamadı',e); }catch(_e){} }
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
    if(!d.soulArchive||typeof d.soulArchive!=='object') d.soulArchive=emptySoulArchive();
    if(!Array.isArray(d.soulArchive.items)) d.soulArchive.items=[];
    d.soulArchive.items=d.soulArchive.items.map(normSoulItem).filter(Boolean);
    // Eski günlük okuma/izleme/dinleme ve zihin-beden kayıtlarını arşiv kataloglarına senkronize et.
    try{ backfillArchivesFromDays(d); }catch(e){}
    // Vücut ölçüleri (haftalık kilo + tek-seferlik boy). Yeni alan — eski kayıtlara backfill.
    if(!d.body||typeof d.body!=='object') d.body={heightCm:null,heightSetAt:null,weights:[]};
    // Doğum tarihi: metabolik profil için yaş hesaplaması; cinsiyet kadın olarak sabit.
    if(typeof d.settings.birthDate!=='string') d.settings.birthDate='';
    if(typeof d.body.heightCm!=='number'||isNaN(d.body.heightCm)) d.body.heightCm=null;
    if(typeof d.body.heightSetAt!=='string') d.body.heightSetAt=(d.body.heightSetAt||null)&&String(d.body.heightSetAt);
    if(d.body.heightSetAt===undefined) d.body.heightSetAt=null;
    if(!Array.isArray(d.body.weights)) d.body.weights=[];
    d.body.weights=d.body.weights.filter(function(w){ return w&&typeof w==='object'&&w.ts&&typeof w.kg==='number'&&!isNaN(w.kg); });
    // Kan/idrar tahlilleri (opsiyonel, panele iletilir). Medya data/aeon-media/<id>.json'da.
    if(!Array.isArray(d.labResults)) d.labResults=[];
    d.labResults=d.labResults.filter(function(x){ return x&&typeof x==='object'&&x.id&&Array.isArray(x.files); });
    // Veri-güdümlü tikleri bugüne göre bir kez hizala (geçmiş günlere dokunma — kayıt bütünlüğü).
    try{ var _t=todayStr(); if(d.days&&d.days[_t]&&d.days[_t].habits) syncDerivedHabits(d.days[_t],_t); }catch(e){}
    // Profil değerlendirmesi (data.profileAssessment) — data.psych'ten ayrı, tek seferlik.
    try{ ensureProfileAssessment(d); }catch(e){}
    // Günün fotoğrafı (Wikimedia Commons POTD) — önbellek + metadata.
    if(!d.dailyPhoto||typeof d.dailyPhoto!=='object') d.dailyPhoto={date:'',url:'',title:'',artist:'',license:'',description:'',source:'Wikimedia Commons',pageUrl:'',fetchedAt:''};
    if(typeof d.dailyPhoto.date!=='string') d.dailyPhoto.date='';
    if(typeof d.dailyPhoto.url!=='string') d.dailyPhoto.url='';
    if(typeof d.dailyPhoto.title!=='string') d.dailyPhoto.title='';
    if(typeof d.dailyPhoto.artist!=='string') d.dailyPhoto.artist='';
    if(typeof d.dailyPhoto.license!=='string') d.dailyPhoto.license='';
    if(typeof d.dailyPhoto.description!=='string') d.dailyPhoto.description='';
    if(typeof d.dailyPhoto.source!=='string') d.dailyPhoto.source='Wikimedia Commons';
    if(typeof d.dailyPhoto.pageUrl!=='string') d.dailyPhoto.pageUrl='';
    if(typeof d.dailyPhoto.fetchedAt!=='string') d.dailyPhoto.fetchedAt='';
    // Eski Commons:Picture_of_the_day sorgusu aynı gün için bayat bir görsel bırakabildi.
    if(typeof d.dailyPhoto.potdDate!=='string') d.dailyPhoto.potdDate='';
    // Önceki sürüm yalnız tek bir fotoğraf tutuyordu. Eski kaydı tarihçeye ekleyerek cache başlat.
    if(!d.dailyPhoto.history||typeof d.dailyPhoto.history!=='object'||Array.isArray(d.dailyPhoto.history)) d.dailyPhoto.history={};
    if(d.dailyPhoto.date&&d.dailyPhoto.url&&!d.dailyPhoto.history[d.dailyPhoto.date]) d.dailyPhoto.history[d.dailyPhoto.date]=dailyPhotoCopy(d.dailyPhoto);
    if(d.dailyPhoto.date!==todayStr()) d.dailyPhoto.fetchedAt='';
    // Bilimsel profil değerlendirmesi (runtime'da seyma-data'dan çekilir; backfill sadece iskelet).
    if(!d.scientificProfile||typeof d.scientificProfile!=='object') d.scientificProfile={};
    if(typeof d.scientificProfile.source!=='string') d.scientificProfile.source='';
    if(typeof d.scientificProfile.assessedAt!=='string') d.scientificProfile.assessedAt='';
    if(typeof d.scientificProfile.confidence!=='number'&&d.scientificProfile.confidence!==null) d.scientificProfile.confidence=null;
    if(typeof d.scientificProfile.consent!=='string') d.scientificProfile.consent='';
    if(!Array.isArray(d.scientificProfile.riasec)) d.scientificProfile.riasec=[];
    if(!Array.isArray(d.scientificProfile.values)) d.scientificProfile.values=[];
    if(!d.scientificProfile.traits||typeof d.scientificProfile.traits!=='object') d.scientificProfile.traits={};
    if(!d.scientificProfile.attachment||typeof d.scientificProfile.attachment!=='object') d.scientificProfile.attachment={};
    if(!Array.isArray(d.scientificProfile.strengths)) d.scientificProfile.strengths=[];
    if(!Array.isArray(d.scientificProfile.risks)) d.scientificProfile.risks=[];
    if(typeof d.scientificProfile.note!=='string') d.scientificProfile.note='Profil henüz yüklenmemiş. Ayarlar > Veri bağlantısından seyma-data reposu bağlanınca otomatik çekilir.';
    // Günlük Işığı — serbest günlük kaydı + hedef ayarları
    if(!d.settings.journalGoal||typeof d.settings.journalGoal!=='object') d.settings.journalGoal={words:30,chars:140};
    if(typeof d.settings.journalGoal.words!=='number'||isNaN(d.settings.journalGoal.words)) d.settings.journalGoal.words=30;
    if(typeof d.settings.journalGoal.chars!=='number'||isNaN(d.settings.journalGoal.chars)) d.settings.journalGoal.chars=140;
    if(d.days&&typeof d.days==='object') Object.keys(d.days).forEach(function(k){
      var day=d.days[k]; if(!day.journal||typeof day.journal!=='object') day.journal={text:'',mode:'free',promptUsed:'',wordCount:0,charCount:0,savedAt:null,streakAtSave:0,metGoal:false};
      var jn=day.journal; if(typeof jn.text!=='string') jn.text=''; if(typeof jn.mode!=='string') jn.mode='free'; if(typeof jn.promptUsed!=='string') jn.promptUsed=''; if(typeof jn.wordCount!=='number'||isNaN(jn.wordCount)) jn.wordCount=0; if(typeof jn.charCount!=='number'||isNaN(jn.charCount)) jn.charCount=0; if(typeof jn.savedAt!=='string'&&jn.savedAt!==null) jn.savedAt=null; if(typeof jn.streakAtSave!=='number'||isNaN(jn.streakAtSave)) jn.streakAtSave=0; if(typeof jn.metGoal!=='boolean') jn.metGoal=false;
    });
    // Terapi Odası günlük kayıtları
    ensureTherapyAllDays(d);
    if(!d.roomContentHistory||typeof d.roomContentHistory!=='object') d.roomContentHistory={};
    // Magnezyum Danışmanı — kullanıcı profili + model + günlük kayıt.
    if(!d.settings.magnesium||typeof d.settings.magnesium!=='object') d.settings.magnesium={enabled:false,onboardingDone:false,preferredForm:'',tolerated:true,kidneyDisease:false,lastNudgeDate:null,dismissedUntil:null};
    // D vitamini takviyesi formu/dozu — 20 Temmuz 2026 Pazartesi itibarıyla D₃K₂ damla.
    if(typeof d.settings.vitaminDForm!=='string') d.settings.vitaminDForm='D₃K₂ damla';
    if(typeof d.settings.vitaminDDose!=='string') d.settings.vitaminDDose='1 damla (D3 1000 IU + K2 100 mcg)';
    // Kişiye özel hedefler: boy/kilo/yaş/kadın → Mifflin-St Jeor + TDEE + makro/mikro/wellness.
    if(!d.settings.targets||typeof d.settings.targets!=='object') d.settings.targets={calories:null,protein:null,carbs:null,fat:null,fiber:null,waterCups:null,steps:null,sleepHours:null,caffeineMaxMg:null,magnesiumMg:null,ironMg:null,omega3Mg:null,vitaminDIU:null,bmr:null,tdee:null,activityLevel:'moderate',lastCalculatedAt:''};
    var t=d.settings.targets;
    ['calories','protein','carbs','fat','fiber','waterCups','steps','sleepHours','caffeineMaxMg','magnesiumMg','ironMg','omega3Mg','vitaminDIU','bmr','tdee'].forEach(function(k){ if(typeof t[k]!=='number'&&t[k]!==null) t[k]=null; });
    if(t.activityLevel!=='sedentary'&&t.activityLevel!=='light'&&t.activityLevel!=='moderate'&&t.activityLevel!=='active') t.activityLevel='moderate';
    if(typeof t.lastCalculatedAt!=='string') t.lastCalculatedAt='';
    var ms=d.settings.magnesium;
    if(typeof ms.enabled!=='boolean') ms.enabled=false;
    if(typeof ms.onboardingDone!=='boolean') ms.onboardingDone=false;
    if(typeof ms.preferredForm!=='string') ms.preferredForm='';
    if(typeof ms.tolerated!=='boolean') ms.tolerated=true;
    if(typeof ms.kidneyDisease!=='boolean') ms.kidneyDisease=false;
    if(typeof ms.lastNudgeDate!=='string'&&ms.lastNudgeDate!==null) ms.lastNudgeDate=null;
    if(typeof ms.dismissedUntil!=='string'&&ms.dismissedUntil!==null) ms.dismissedUntil=null;
    if(!d.magnesiumModel||typeof d.magnesiumModel!=='object') d.magnesiumModel={responseLog:[],lutealHitRate:null,lastCalculatedAt:null};
    if(!Array.isArray(d.magnesiumModel.responseLog)) d.magnesiumModel.responseLog=[];
    if(typeof d.magnesiumModel.lutealHitRate!=='number'&&d.magnesiumModel.lutealHitRate!==null) d.magnesiumModel.lutealHitRate=null;
    if(typeof d.magnesiumModel.lastCalculatedAt!=='string'&&d.magnesiumModel.lastCalculatedAt!==null) d.magnesiumModel.lastCalculatedAt=null;
    // Eski kayıtlarda magnesium habit göstergesi eksikse backfill et
    if(d.days&&typeof d.days==='object') Object.keys(d.days).forEach(function(k){ var day=d.days[k]; if(day&&typeof day==='object'&&day.magnesium&&day.magnesium.taken){ day.habits=day.habits||{}; day.habits.magnesium=true; } });
    if(d.days&&typeof d.days==='object') Object.keys(d.days).forEach(function(k){ var day=d.days[k]; if(day&&typeof day==='object'){ if(!day.magnesium||typeof day.magnesium!=='object') day.magnesium={taken:false,form:'',mg:null,time:'',reason:[],effectNote:'',skipped:false,feedback:null}; if(typeof day.magnesium.taken!=='boolean') day.magnesium.taken=false; if(typeof day.magnesium.form!=='string') day.magnesium.form=''; if(typeof day.magnesium.mg!=='number'&&day.magnesium.mg!==null) day.magnesium.mg=null; if(typeof day.magnesium.time!=='string') day.magnesium.time=''; if(!Array.isArray(day.magnesium.reason)) day.magnesium.reason=[]; if(typeof day.magnesium.effectNote!=='string') day.magnesium.effectNote=''; if(typeof day.magnesium.skipped!=='boolean') day.magnesium.skipped=false; if(day.magnesium.feedback!==null&&day.magnesium.feedback!==true&&day.magnesium.feedback!==false) day.magnesium.feedback=null; } });
    // Kilit ekranı zemin — eski kayıtlara backfill; kaynak kodda düz metin yok.
    if(!d.settings.auth||typeof d.settings.auth!=='object') d.settings.auth={};
    if(typeof d.settings.auth.usernameHash!=='string') d.settings.auth.usernameHash='';
    if(typeof d.settings.auth.usernameMask!=='string') d.settings.auth.usernameMask='';
    if(typeof d.settings.auth.rememberMe!=='boolean') d.settings.auth.rememberMe=false;
    if(typeof d.settings.auth.unlockedAt!=='string'&&d.settings.auth.unlockedAt!==null) d.settings.auth.unlockedAt=null;
    if(typeof d.settings.auth.unlockCount!=='number'||isNaN(d.settings.auth.unlockCount)) d.settings.auth.unlockCount=0;
    // Tatil Modu 🌴 — gezi dönemlerinde su hedefi 10 bardak + streak pause.
    if(!d.settings.vacation||typeof d.settings.vacation!=='object') d.settings.vacation={enabled:false,startAt:'',endAt:'',preset:'relaxed',reason:''};
    if(typeof d.settings.vacation.enabled!=='boolean') d.settings.vacation.enabled=false;
    if(typeof d.settings.vacation.startAt!=='string') d.settings.vacation.startAt='';
    if(typeof d.settings.vacation.endAt!=='string') d.settings.vacation.endAt='';
    if(d.settings.vacation.preset!=='relaxed'&&d.settings.vacation.preset!=='moderate'&&d.settings.vacation.preset!=='active') d.settings.vacation.preset='relaxed';
    if(typeof d.settings.vacation.reason!=='string') d.settings.vacation.reason='';
    if(typeof d.settings.vacation.enabledAt!=='string') d.settings.vacation.enabledAt='';
    // İman Köşesi — detaylı namaz takibi. settings.prayer + günlük prayers backfill.
    if(!d.settings.prayer||typeof d.settings.prayer!=='object') d.settings.prayer={method:'diyanet',location:null,adjustments:{},remindersEnabled:false,reminderOffsetMinutes:15,hijriOffset:0};
    var prSet=d.settings.prayer;
    if(typeof prSet.method!=='string') prSet.method='diyanet';
    if(prSet.location!==null&&(typeof prSet.location!=='object'||!prSet.location)) prSet.location=null;
    if(!prSet.adjustments||typeof prSet.adjustments!=='object') prSet.adjustments={};
    if(typeof prSet.remindersEnabled!=='boolean') prSet.remindersEnabled=false;
    if(typeof prSet.reminderOffsetMinutes!=='number'||isNaN(prSet.reminderOffsetMinutes)) prSet.reminderOffsetMinutes=15;
    if(typeof prSet.hijriOffset!=='number'||isNaN(prSet.hijriOffset)) prSet.hijriOffset=0;
    if(d.days&&typeof d.days==='object') Object.keys(d.days).forEach(function(k){ var day=d.days[k]; if(day&&typeof day==='object') ensurePrayerDay(day); });
    // FX-P-05 (Faz 0): Premium FX ayar alanları — additive backfill, idempotent.
    // Yalnızca settings.* altına alan eklenir; data şekli değişmez (I1/I3).
    if(d.settings==null) d.settings={};
    if(d.settings.premiumAtmosphere==null) d.settings.premiumAtmosphere=true;
    if(d.settings.uiSounds==null) d.settings.uiSounds=true;
    if(d.settings.voiceGuidance==null) d.settings.voiceGuidance=false;
    if(d.settings.ambientSounds==null) d.settings.ambientSounds=false;
    if(d.settings.richHaptics==null) d.settings.richHaptics=true;
    // FX-P-55: launchRitual opt-in'dir (splash her açılışta görünür). migrate()
    // ile aynı varsayılan (false) kullanılır — yeni kullanıcı splash'i yalnız
    // açıkça isterse görür; mevcut kullanıcıların aniden splash görmesi sürpriz
    // olmaz. Splash uygulandı (index.html #sey-splash + app.js hideSplash).
    if(d.settings.launchRitual==null) d.settings.launchRitual=false;
    // FX-P-52/56 (Faz 5): sesli rehberlik state alanları — additive backfill,
    // idempotent. Yalnızca settings.* altına eklenir; data şekli değişmez (I1/I3).
    if(d.settings.voiceOnboardedAt==null) d.settings.voiceOnboardedAt='';
    if(d.settings.lastVoiceGreetingAt==null) d.settings.lastVoiceGreetingAt='';
    if(d.settings.voiceGreetingDate==null) d.settings.voiceGreetingDate='';
    if(d.settings.voiceGreetingCount==null) d.settings.voiceGreetingCount=0;
    if(d.settings.voiceStreakDate==null) d.settings.voiceStreakDate='';
    if(d.settings.voiceZikrDate==null) d.settings.voiceZikrDate='';
    // FX-P-57: sesli rehberlik dil ve hız tercihleri.
    if(d.settings.voiceLang==null) d.settings.voiceLang='tr-TR';
    if(d.settings.voiceRate==null) d.settings.voiceRate=1;
    // Bulut TTS (premium sinirsel sesler) — varsayılan AÇIK: kullanıcı istedi
    // ki hep bulut sesi kullanılsın, yerel sese düşülmesin. openaiKey sanitize
    // ile repoya asla gitmez (sync.js delete c.settings.openaiKey).
    if(d.settings.voiceCloudTts==null) d.settings.voiceCloudTts=true;
    if(d.settings.voiceCloudVoice==null) d.settings.voiceCloudVoice='shimmer';
    if(d.settings.voiceLocalFallback==null) d.settings.voiceLocalFallback=false;
    d.version=2;
    return d;
  }

  // MON-13 · getDay gövde aktarımı
  // ---------------------------------------------------------------------------
  // getDay, verilen root içindeki gün kaydını yerinde normalleştirir. Registry
  // gün nesnesini veya nested alanlarını kopyalamaz; app.js sahipliğindeki
  // mutable `data` bağlamına da hiç yazmaz. Tüm closure bağımlılıkları isimli
  // bag üzerinden çözülür; eksik kayıtla kısmi normalizasyon yapılmaz.
  var getDayDeps=null;
  var GET_DAY_DEPENDENCIES=[
    'emptyHabits','emptyMeals','emptyMealItems','emptyWindDown','emptyPrayerDay',
    'emptyDiscomfort','emptyMovement','emptyReading','emptyWatching',
    'emptyListening','emptyLearning','emptyHealth','emptyMagnesium',
    'emptyTherapy','ensureTherapyDay','ensurePrayerDay','caffeineLastTime'
  ];

  function registerGetDay(deps){
    if(getDayDeps||!deps||typeof deps!=='object'||Array.isArray(deps)) return false;
    for(var i=0;i<GET_DAY_DEPENDENCIES.length;i++){
      if(typeof deps[GET_DAY_DEPENDENCIES[i]]!=='function') return false;
    }
    if(!Array.isArray(deps.habits)||!Array.isArray(deps.windDownSteps)) return false;
    getDayDeps=deps;
    return true;
  }

  function getDay(d,date,idx){
    if(!getDayDeps) return null;
    var dep=getDayDeps;
    var emptyHabits=dep.emptyHabits;
    var emptyMeals=dep.emptyMeals;
    var emptyMealItems=dep.emptyMealItems;
    var emptyWindDown=dep.emptyWindDown;
    var emptyPrayerDay=dep.emptyPrayerDay;
    var emptyDiscomfort=dep.emptyDiscomfort;
    var emptyMovement=dep.emptyMovement;
    var emptyReading=dep.emptyReading;
    var emptyWatching=dep.emptyWatching;
    var emptyListening=dep.emptyListening;
    var emptyLearning=dep.emptyLearning;
    var emptyHealth=dep.emptyHealth;
    var emptyMagnesium=dep.emptyMagnesium;
    var emptyTherapy=dep.emptyTherapy;
    var ensureTherapyDay=dep.ensureTherapyDay;
    var ensurePrayerDay=dep.ensurePrayerDay;
    var caffeineLastTime=dep.caffeineLastTime;
    var HABITS=dep.habits;
    var WIND_DOWN_STEPS=dep.windDownSteps;

    if(!d.days[date]){
      d.days[date]={
        dayIndex:idx,
        habits:emptyHabits(),
        mood:null,
        cravingSOSCount:0,
        cravingOptionsUsed:[],
        cravingTriggers:[],
        craving10MinDone:false,
        foodCravingDone:false,
        coffeeCravingDone:false,
        cravingTriggerNote:'',
        note:'',
        intention:'',
        journal:{text:'',mode:'free',promptUsed:'',wordCount:0,charCount:0,savedAt:null,streakAtSave:0,metGoal:false},
        savedAt:null,
        meals:emptyMeals(),
        mealItems:emptyMealItems(),
        water:0,
        caffeine:{last:null,cups:null},
        energy:null,
        stress:null,
        sleep:{hours:null,quality:null,med:{type:null,note:''},windDown:emptyWindDown()},
        walk:{steps:null,minutes:null},
        flow:null,
        symptoms:[],
        discomfort:emptyDiscomfort(),
        sessions:[],
        movement:emptyMovement(),
        reading:emptyReading(),
        watching:emptyWatching(),
        listening:emptyListening(),
        learning:emptyLearning(),
        gratitude:[],
        health:emptyHealth(),
        nutri:null,
        magnesium:emptyMagnesium(),
        therapy:emptyTherapy(),
        prayer:emptyPrayerDay()
      };
    }else{
      var r=d.days[date];
      if(!r.habits) r.habits=emptyHabits();
      HABITS.forEach(function(h){ if(!(h.key in r.habits)) r.habits[h.key]=false; });
      if(!r.meals) r.meals=emptyMeals();
      if(!r.mealItems||typeof r.mealItems!=='object') r.mealItems=emptyMealItems();
      ['breakfast','lunch','dinner','snack'].forEach(function(k){ if(!Array.isArray(r.mealItems[k])) r.mealItems[k]=[]; });
      if(typeof r.water!=='number'||isNaN(r.water)) r.water=0;
      if(!r.caffeine||typeof r.caffeine!=='object') r.caffeine={last:null,cups:null,drinks:[]};
      if(!Array.isArray(r.caffeine.drinks)){
        r.caffeine.drinks=[];
        var lc=Number(r.caffeine.cups)||0, ll=r.caffeine.last;
        if(lc>0){ for(var ci=0;ci<lc;ci++){ r.caffeine.drinks.push({type:'turk',time:(ci===lc-1&&ll)?ll:'09:00',qty:1}); } }
      }
      if(r.caffeine.drinks.length&&!r.caffeine.last) r.caffeine.last=caffeineLastTime({caffeine:r.caffeine});
      r.caffeine.cups=r.caffeine.drinks.length;
      if(!('energy' in r)) r.energy=null;
      if(!('stress' in r)) r.stress=null;
      if(!Array.isArray(r.cravingTriggers)) r.cravingTriggers=[];
      if(typeof r.craving10MinDone!=='boolean') r.craving10MinDone=false;
      if(typeof r.foodCravingDone!=='boolean') r.foodCravingDone=false;
      if(typeof r.coffeeCravingDone!=='boolean') r.coffeeCravingDone=false;
      if(typeof r.cravingTriggerNote!=='string') r.cravingTriggerNote='';
      if(!r.sleep) r.sleep={hours:null,quality:null,med:{type:null,note:''},windDown:emptyWindDown()};
      if(!r.sleep.med||typeof r.sleep.med!=='object') r.sleep.med={type:null,note:''};
      if(typeof r.sleep.med.note!=='string') r.sleep.med.note='';
      if(!r.sleep.windDown) r.sleep.windDown=emptyWindDown();
      if(!r.sleep.windDown.steps) r.sleep.windDown.steps=emptyWindDown().steps;
      WIND_DOWN_STEPS.forEach(function(s){ if(!(s.key in r.sleep.windDown.steps)) r.sleep.windDown.steps[s.key]=false; });
      if(typeof r.sleep.windDown.offloadNote!=='string') r.sleep.windDown.offloadNote='';
      if(!Array.isArray(r.sleep.windDown.events)) r.sleep.windDown.events=[];
      if(!Array.isArray(r.sleep.windDown.sessions)) r.sleep.windDown.sessions=[];
      if(!r.walk) r.walk={steps:null,minutes:null};
      if(!('flow' in r)) r.flow=null;
      if(!Array.isArray(r.symptoms)) r.symptoms=[];
      if(!r.discomfort||typeof r.discomfort!=='object') r.discomfort=emptyDiscomfort();
      if(!r.discomfort.regions||typeof r.discomfort.regions!=='object') r.discomfort.regions={};
      if(typeof r.discomfort.note!=='string') r.discomfort.note='';
      if(!Array.isArray(r.discomfort.meds)) r.discomfort.meds=[];
      if(!Array.isArray(r.sessions)) r.sessions=[];
      if(!r.movement||typeof r.movement!=='object') r.movement=emptyMovement();
      if(!Array.isArray(r.movement.track)) r.movement.track=[];
      ['walkM','vehicleM','totalM','maxSpeed','samples','walkSec','vehicleSec'].forEach(function(k){ if(typeof r.movement[k]!=='number'||isNaN(r.movement[k])) r.movement[k]=0; });
      if(!r.reading||typeof r.reading!=='object') r.reading=emptyReading();
      if(!Array.isArray(r.reading.entries)) r.reading.entries=[];
      if(!r.watching||typeof r.watching!=='object') r.watching=emptyWatching();
      if(!Array.isArray(r.watching.entries)) r.watching.entries=[];
      if(!r.listening||typeof r.listening!=='object') r.listening=emptyListening();
      if(!Array.isArray(r.listening.entries)) r.listening.entries=[];
      if(!r.learning||typeof r.learning!=='object') r.learning=emptyLearning();
      if(!Array.isArray(r.learning.entries)) r.learning.entries=[];
      if(!Array.isArray(r.gratitude)) r.gratitude=[];
      if(typeof r.intention!=='string') r.intention='';
      if(!r.health||typeof r.health!=='object') r.health=emptyHealth();
      if(!('nutri' in r)) r.nutri=null;
      if(!r.magnesium||typeof r.magnesium!=='object') r.magnesium=emptyMagnesium();
      if(typeof r.magnesium.taken!=='boolean') r.magnesium.taken=false;
      if(typeof r.magnesium.form!=='string') r.magnesium.form='';
      if(typeof r.magnesium.mg!=='number'&&r.magnesium.mg!==null) r.magnesium.mg=null;
      if(typeof r.magnesium.time!=='string') r.magnesium.time='';
      if(!Array.isArray(r.magnesium.reason)) r.magnesium.reason=[];
      if(typeof r.magnesium.effectNote!=='string') r.magnesium.effectNote='';
      if(typeof r.magnesium.skipped!=='boolean') r.magnesium.skipped=false;
      if(r.magnesium.feedback!==null&&r.magnesium.feedback!==true&&r.magnesium.feedback!==false) r.magnesium.feedback=null;
      if(!r.journal||typeof r.journal!=='object') r.journal={text:'',mode:'free',promptUsed:'',wordCount:0,charCount:0,savedAt:null,streakAtSave:0,metGoal:false};
      var jn=r.journal;
      if(typeof jn.text!=='string') jn.text='';
      if(typeof jn.mode!=='string') jn.mode='free';
      if(typeof jn.promptUsed!=='string') jn.promptUsed='';
      if(typeof jn.wordCount!=='number'||isNaN(jn.wordCount)) jn.wordCount=0;
      if(typeof jn.charCount!=='number'||isNaN(jn.charCount)) jn.charCount=0;
      if(typeof jn.savedAt!=='string'&&jn.savedAt!==null) jn.savedAt=null;
      if(typeof jn.streakAtSave!=='number'||isNaN(jn.streakAtSave)) jn.streakAtSave=0;
      if(typeof jn.metGoal!=='boolean') jn.metGoal=false;
      ensureTherapyDay(r);
      ensurePrayerDay(r);
    }
    return d.days[date];
  }

  // MON-14 · createDefaultData gövde aktarımı
  // ---------------------------------------------------------------------------
  // Başlangıç root'u registryde üretilir; app.js yalnızca aynı imzayı koruyan
  // shim'i ve root rebind kabuk atamalarını taşır. Tarih ve boş-root
  // üreticileri açık bag ile gelir; registry yüklenirken hiçbir fonksiyon
  // çağrılmaz, localStorage/DOM/ağ erişimi oluşmaz.
  var createDefaultDataDeps=null;
  var CREATE_DEFAULT_DATA_DEPENDENCIES=[
    'todayStr','nowIso','emptySyncReceipt','emptyEventLog','emptyReminderState',
    'emptyLibrary','emptyWatchlist','emptyMusic'
  ];

  function registerCreateDefaultData(deps){
    if(createDefaultDataDeps||!deps||typeof deps!=='object'||Array.isArray(deps)) return false;
    for(var i=0;i<CREATE_DEFAULT_DATA_DEPENDENCIES.length;i++){
      if(typeof deps[CREATE_DEFAULT_DATA_DEPENDENCIES[i]]!=='function') return false;
    }
    createDefaultDataDeps=deps;
    return true;
  }

  function createDefaultData(){
    // app.js kaydı olmadan kısmi/uydurma bir root üretme.
    if(!createDefaultDataDeps) return null;
    var dep=createDefaultDataDeps;
    var t=dep.todayStr(), nowIso=dep.nowIso();
    return {version:2,startDate:t,lastOpenedDate:t,lastOpenedAt:nowIso,savedAt:nowIso,syncReceipt:dep.emptySyncReceipt(),eventLog:dep.emptyEventLog(),days:{},notifications:[],reminders:dep.emptyReminderState(),luna:{qa:[],lastAskDate:null},aeon:{qa:[],lastAskDate:null},settings:{nickname:'Sevgili Günışığı',notificationsWanted:false,haptics:true,ghToken:'',ghRepo:'mustafaras/seyma-data',ghBranch:'main',healthGistId:'',openaiKey:'',locationEnabled:false,locationMode:'auto',lunaConnected:false},cycle:{periods:[],avgCycle:28,avgPeriod:5},library:dep.emptyLibrary(),watchlist:dep.emptyWatchlist(),music:dep.emptyMusic(),body:{heightCm:null,heightSetAt:null,weights:[]},labResults:[]};
  }

  window.SeymaState = {
    get data(){ return soft('data')(); },
    get ui(){ return soft('ui')(); },
    get dark(){ return soft('dark')(); },
    get migrate(){ return migrate; },
    // Faz -1.1 izolasyonunda eski kırılmaz fallback korunur; app.js kaydı
    // tamamlandığında getter artık registry gövdesini verir.
    get getDay(){ return getDayDeps ? getDay : soft('getDay')(); },
    get createDefaultData(){ return createDefaultDataDeps ? createDefaultData : soft('createDefaultData')(); },
    registerMigrate: registerMigrate,
    registerGetDay: registerGetDay,
    registerCreateDefaultData: registerCreateDefaultData
  };
})();
