// MON-50 · daily App handler registry.
// The App object, data rebinds, save/render ownership and all inline caller
// names remain in app.js. This module is load-safe: it only records the
// explicit dependency bag and exposes signature-preserving handler bodies.
(function(){
  'use strict';

  var appSurfaceDeps=null;
  var APP_SURFACE_DEPENDENCIES=[
    'data','ui','app','activeDate','todayStr','dayIndexFor','getDay',
    'derivedHabits','countRec','habits','find','haptic','commit','editing',
    'htToday','confetti','habitProgress','waterGoalCups','sleepGoalHours',
    'stepsGoal','effSteps','isVacationDay','derivedProgText','toast','maybeStreak',
    'updateCardByKey','render','emptyMagnesium','pulseTimer','setPulseTimer',
    'clearTimeout','setTimeout','document','save'
  ];

  function registerAppSurface(deps){
    if(appSurfaceDeps||!deps||typeof deps!=='object'||Array.isArray(deps)) return false;
    for(var i=0;i<APP_SURFACE_DEPENDENCIES.length;i++){
      if(typeof deps[APP_SURFACE_DEPENDENCIES[i]]!=='function') return false;
    }
    appSurfaceDeps=deps;
    return true;
  }

  function dep(name){ return appSurfaceDeps&&typeof appSurfaceDeps[name]==='function'?appSurfaceDeps[name]:null; }
  function call(name,args){ var fn=dep(name); if(!fn) throw new Error('SeymaAppSurface: çözümlenemeyen bağımlılık '+name); return fn.apply(null,args||[]); }
  function liveData(){ return call('data'); }
  function liveUi(){ return call('ui'); }
  function app(){ return call('app'); }
  function schedulePulse(key){
    var ui=liveUi();
    ui.pulse=key;
    call('clearTimeout',[call('pulseTimer')]);
    call('setPulseTimer',[call('setTimeout',[function(){ liveUi().pulse=null; call('render'); },240])]);
  }

  function toggleHabit(key){
    if(window.SeyHaptics&&typeof window.SeyHaptics.tap==='function') window.SeyHaptics.tap();
    var date=call('activeDate'), idx=call('dayIndexFor',[date]), day=call('getDay',[liveData(),date,idx]);
    var derived=call('derivedHabits');
    // Su / uyku / yürüyüş tikleri elle işaretlenmez — yalnızca veri eşiği tutunca yeşillenir.
    if(derived[key]){ app().explainDerivedHabit(key,day); return; }
    // Magnezyum tik'i hem habits.magnesium hem de magnesium.taken kaydını senkronize eder;
    // skor/model logu da güncellensin diye mevcut toggleMgHabit akışını kullan.
    if(key==='magnesium'){ app().toggleMgHabit(); return; }
    var before=call('countRec',[day]); day.habits[key]=!day.habits[key]; day.savedAt=new Date().toISOString(); var after=call('countRec',[day]); call('haptic',[14]);
    schedulePulse(key);
    var msg='Kaydedildi'; if(day.habits[key]){ var h=call('find',[call('habits'),'key',key]); if(h) msg=h.msg; }
    call('commit',[msg]);
    if(call('editing')) return;
    var ht=call('htToday'); if(after>=ht&&before<ht){ call('confetti'); if(window.SeyAudio&&typeof window.SeyAudio.success==='function') window.SeyAudio.success(); if(window.SeyFx&&typeof window.SeyFx.shimmer==='function'){ try{ var rw=call('document').getElementById('sey-habits-ring-wrap'); if(rw) window.SeyFx.shimmer(rw); }catch(e){} } call('setTimeout',[function(){ call('toast',['Bugün '+ht+'/'+ht+'. Şeyma hanım kontrolü ele aldı.',2600]); },250]); }
    else if(day.habits[key]){ if(window.SeyAudio&&typeof window.SeyAudio.success==='function') window.SeyAudio.success(); call('maybeStreak'); }
  }

  function toggleMgHabit(){
    var date=call('activeDate'), day=call('getDay',[liveData(),date,call('dayIndexFor',[date])]);
    var before=call('countRec',[day]), after;
    var mg=day.magnesium||call('emptyMagnesium');
    if(mg.taken){ app().skipMagnesium(); }
    else { app().takeMagnesium(null,200); }
    after=call('countRec',[day]);
    schedulePulse('magnesium');
    // confetti / tamam bildirimi, sadece bugünkü toplam eşiği aşıldıysa
    if(!call('editing')){ var ht=call('htToday'); if(after>=ht&&before<ht){ call('confetti'); if(window.SeyAudio&&typeof window.SeyAudio.success==='function') window.SeyAudio.success(); call('setTimeout',[function(){ call('toast',['Bugün '+ht+'/'+ht+'. Şeyma hanım kontrolü ele aldı.',2600]); },250]); } }
  }

  // Türetilmiş tik'e dokunulduğunda: eşik tutuyorsa sıcak onay, tutmuyorsa ne yapılacağını kibarca anlat.
  function explainDerivedHabit(key,day){
    var p=call('habitProgress',[day,key]); if(!p) return; call('haptic',[10]);
    if(p.met){
      var g=call('waterGoalCups');
      var ok={ water:'Su tamam — '+g+'/'+g+' bardak. Bu tik otomatik, ellemene gerek yok.',
               sleepReg:'Uyku tamam — 7,5+ saat. Bu tik kendiliğinden yeşil kalır.',
               walked20:'Yürüyüş tamam — 4.500+ adım. Bu tik kendiliğinden yeşil kalır.',
               journaled:'Not tamam — bugün yazdın. Bu tik kendiliğinden yeşil kalır.',
               sweetManaged:'Tatlı krizini yönettin — bu tik kendiliğinden yeşil kaldı. Helal sana.',
               foodManaged:'Yemek/açlık krizini yönettin — bu tik kendiliğinden yeşil kaldı. Kaptan sensin.',
               coffeeManaged:'Kahve/kafein krizini yönettin — bu tik kendiliğinden yeşil kaldı. Net karar.',
               mediaFed:'Zihnini besledin — okudun/izledin/dinledin/öğrendin ya da kurs/pratik yaptın. Bu tik otomatik yeşil.',
               caffeineOk:'Kafein tiki temiz — günlük limit aşılmadı ve son kahve vaktinde. Otomatik yeşil.' };
      call('toast',[ok[key]||'Bu tik otomatik — eşik tuttuğunda kendiliğinden yeşil kalır.']); return;
    }
    // Kriz tikleri: dokununca ilgili kriz odasını (modal) aç — en işlevlisi bu.
    if(key==='sweetManaged'){ app().openCrisis('sweet'); return; }
    if(key==='foodManaged'){ app().openCrisis('food'); return; }
    if(key==='coffeeManaged'){ app().openCrisis('coffee'); return; }
    var msg;
    if(key==='water'){ var w=p.cur; var g=p.goal||call('waterGoalCups'); msg = w<=0
        ? 'Su tiki otomatik: '+g+' bardağı tamamlayınca kendiliğinden yeşillenir. Aşağıdaki “Su” kartından eklemeye başla.'
        : 'Su tikine az kaldı — şu an '+w+'/'+g+' bardak. '+(g-w)+' bardak daha, kendiliğinden yeşillenecek.'; }
    else if(key==='sleepReg'){ var h=p.cur; var sg=(p.goal||call('sleepGoalHours')); msg = h==null
        ? 'Uyku tiki otomatik: Sağlık kartına '+String(sg).replace('.',',')+' saat ve üzeri uyku girince kendiliğinden yeşillenir.'+(call('isVacationDay',[call('activeDate')])?' (tatil modunda esnetildi)':'')
        : 'Uyku tiki '+String(sg).replace('.',',')+' saatte yeşillenir'+(call('isVacationDay',[call('activeDate')])?' (tatil modunda esnetildi)':'')+' — şu an '+String(h).replace('.',',')+' saat. Girişini güncelleyince otomatik dolar.'; }
    else if(key==='walked20'){ var s=p.cur; var stg=(p.goal||call('stepsGoal')); msg = s<=0
        ? 'Yürüyüş tiki otomatik: '+stg.toLocaleString('tr-TR')+' adım girince kendiliğinden yeşillenir. Sağlık kartından adımını ekleyebilirsin.'+(call('isVacationDay',[call('activeDate')])?' (tatil modunda esnetildi)':'')
        : 'Yürüyüş tikine '+(stg-s).toLocaleString('tr-TR')+' adım kaldı — şu an '+s.toLocaleString('tr-TR')+'/'+stg.toLocaleString('tr-TR')+'. Girince otomatik yeşillenecek.'+(call('isVacationDay',[call('activeDate')])?' (tatil modunda esnetildi)':''); }
    else if(key==='journaled'){ msg='Not tiki otomatik: “Günün yansıması” kartına bir cümle bile yazınca kendiliğinden yeşillenir.'; }
    else if(key==='mediaFed'){ msg='Zihin tiki otomatik: Okudum / izledim / dinledim / öğrendim / kurs-pratik kutucuklarından birini doldur → yeşillenir.'; }
    else if(key==='caffeineOk'){ if(!p.amountOk) msg='Kafein tiki otomatik: günlük limit ('+p.goal+' mg) aşıldı — içeceği azaltınca kendiliğinden düzelir.'; else if(!p.timingOk) msg='Kafein tiki otomatik: miktar tamam ama son kahve önerilen saatten geç. Sağlık kartından saatini erkene çekince yeşillenir.'; else msg='Kafein tiki otomatik: bugün temiz — kendiliğinden yeşil.'; }
    else { msg=call('derivedProgText',[key,p])||'Bu tik otomatik — ilgili veriyi girince kendiliğinden yeşillenir.'; }
    call('toast',[msg,2800]);
  }

  function setMood(id){
    if(window.SeyHaptics&&typeof window.SeyHaptics.tap==='function') window.SeyHaptics.tap();
    var date=call('activeDate'), day=call('getDay',[liveData(),date,call('dayIndexFor',[date])]); day.mood=(day.mood===id?null:id); day.savedAt=new Date().toISOString(); var labels={normal:'Normal',iyi:'İyi',mükemmel:'Mükemmel',yorgun:'Yorgun',üzgün:'Üzgün',sinirli:'Sinirli','çok-zorlandim':'Çok zorlandım',kaygili:'Kaygılı', 'huzursuz':'Huzursuz', 'sakin':'Sakin'}; call('haptic',[14]); call('save',[false,{message:'Ruh hali güncellendi',meta:{section:'mood',path:'data.days.*.mood',operation:'update',summary:'Ruh hali güncellendi',detail:'Ruh hali',value:labels[id]||id,field:'mood'}}]); call('updateCardByKey',['mood']); call('updateCardByKey',['mental']);
  }

  function saveToday(){
    if(window.SeyHaptics&&typeof window.SeyHaptics.tap==='function') window.SeyHaptics.tap();
    call('getDay',[liveData(),call('todayStr'),call('dayIndexFor',[call('todayStr')])]);
    app().saveNow();
  }

  // MON-51: the approved domain-handler shells dispatch only to their
  // pre-existing domain registries. This module never copies domain logic or
  // creates another domain owner.
  var DOMAIN_HANDLER_REGISTRIES={
    setPrayerCity:'SeymaPrayer',setPrayerMethod:'SeymaPrayer',togglePrayer:'SeymaPrayer',setPrayerNote:'SeymaPrayer',changeNafile:'SeymaPrayer',setZikrPreset:'SeymaZikr',zikrManualApply:'SeymaZikr',toggleZikrPause:'SeymaZikr',startNewZikrHatim:'SeymaZikr',
    quranNoteField:'SeymaQuran',quranAddNote:'SeymaQuran',openQuranJourney:'SeymaQuran',closeQuranJourney:'SeymaQuran',openQuranSurah:'SeymaQuran',backToQuranLibrary:'SeymaQuran',setQuranQuery:'SeymaQuran',clearQuranQuery:'SeymaQuran',setQuranFilter:'SeymaQuran',resetQuranLens:'SeymaQuran',toggleQuranFilters:'SeymaQuran',onQuranKeydown:'SeymaQuran',
    openSaygiPreview:'SeymaSaygi',openSaygiCollectionPerson:'SeymaSaygi',browseSaygiPerson:'SeymaSaygi',closeSaygiPerson:'SeymaSaygi',markSaygiRead:'SeymaSaygi',openRoom:'SeymaMotivation',closeRoom:'SeymaMotivation',updateRoom:'SeymaMotivation',setRoomTab:'SeymaMotivation',toggleRoomTool:'SeymaMotivation',toggleMotivationCard:'SeymaMotivation',
    openCrisis:'SeymaCrisis',closeCrisis:'SeymaCrisis',toggleCrisisDropdown:'SeymaCrisis',toggleCrisisOpt:'SeymaCrisis',toggleCrisisTrigger:'SeymaCrisis',onCrisisNote:'SeymaCrisis',completeCrisis:'SeymaCrisis',resetCrisis:'SeymaCrisis',openJournalModal:'SeymaJournal',closeJournalModal:'SeymaJournal',setJournalMode:'SeymaJournal',onJournalText:'SeymaJournal',useJournalPrompt:'SeymaJournal',saveJournal:'SeymaJournal'
  };
  function registerDomainHandlers(handlers){
    if(!handlers||typeof handlers!=='object'||Array.isArray(handlers)) return false;
    var names=Object.keys(DOMAIN_HANDLER_REGISTRIES),i,name,registry;
    for(i=0;i<names.length;i++){ name=names[i]; registry=window[DOMAIN_HANDLER_REGISTRIES[name]]; if(!registry||typeof handlers[name]!=='function'||(typeof registry[name]==='function'&&name!=='zikrManualApply')) return false; }
    for(i=0;i<names.length;i++){ name=names[i]; if(typeof window[DOMAIN_HANDLER_REGISTRIES[name]][name]!=='function') window[DOMAIN_HANDLER_REGISTRIES[name]][name]=handlers[name]; }
    return true;
  }
  function domainHandler(name,args){ var registry=window[DOMAIN_HANDLER_REGISTRIES[name]],fn=registry&&registry[name]; if(typeof fn!=='function') throw new Error('SeymaAppSurface: domain handler çözümlenemedi '+name); return fn.apply(null,args||[]); }

  // MON-52: overlay and settings shells only. Sensitive profile consent,
  // notification permission, transport, upload/send and destructive actions
  // intentionally have no entry here.
  var OVERLAY_HANDLER_REGISTRIES={
    openReading:'SeymaLibrary',closeReading:'SeymaLibrary',setReadingView:'SeymaLibrary',openWatching:'SeymaLibrary',closeWatching:'SeymaLibrary',setWatchView:'SeymaLibrary',openListening:'SeymaLibrary',closeListening:'SeymaLibrary',setListeningView:'SeymaLibrary',openLearning:'SeymaLibrary',closeLearning:'SeymaLibrary',openSoulActivity:'SeymaLibrary',closeSoulActivity:'SeymaLibrary',openSoulPracticePicker:'SeymaLibrary',closeSoulPracticePicker:'SeymaLibrary',pickSoulPractice:'SeymaLibrary',openSoulArchive:'SeymaLibrary',closeSoulArchive:'SeymaLibrary',setSoulArchiveFilter:'SeymaLibrary',
    setTheme:'SeymaSettings',toggleTheme:'SeymaSettings',toggleHaptic:'SeymaSettings',setVoiceGuidance:'SeymaSettings',setVoiceLang:'SeymaSettings',setVoiceRate:'SeymaSettings',setVoiceCloudVoice:'SeymaSettings',setVoicePitch:'SeymaSettings',setVoiceVoiceName:'SeymaSettings',toggleSetting:'SeymaSettings',
    toggleMsg:'SeymaMessaging',toggleAeonBubble:'SeymaMessaging',openMesaj:'SeymaMessaging',showAeonHistory:'SeymaMessaging',toggleAeonSearch:'SeymaMessaging',clearAeonSearch:'SeymaMessaging',filterAeonSearch:'SeymaMessaging',aeonOpenAttachSheet:'SeymaMessaging',aeonCloseAttachSheet:'SeymaMessaging'
  };
  var overlayHandlers=null;
  function registerOverlayHandlers(handlers){
    if(!handlers||typeof handlers!=='object'||Array.isArray(handlers)) return false;
    if(overlayHandlers) return false;
    var names=Object.keys(OVERLAY_HANDLER_REGISTRIES),i,name,registry;
    for(i=0;i<names.length;i++){ name=names[i]; registry=window[OVERLAY_HANDLER_REGISTRIES[name]]; if(!registry||typeof handlers[name]!=='function') return false; }
    overlayHandlers={};
    for(i=0;i<names.length;i++){ name=names[i]; overlayHandlers[name]=handlers[name]; }
    return true;
  }
  function overlayHandler(name,args){ var registry=window[OVERLAY_HANDLER_REGISTRIES[name]],fn=overlayHandlers&&overlayHandlers[name]; if(!registry||typeof fn!=='function') throw new Error('SeymaAppSurface: overlay handler çözümlenemedi '+name); return fn.apply(null,args||[]); }

  // MON-53: global timer/listener/foreground bridges. Registration remains in
  // app.js; this registry owns only callback bodies and resolves app state at
  // callback time. Nothing below runs while this file is loading.
  var lifecycleDeps=null;
  var LIFECYCLE_DEPENDENCIES=[
    'data','ui','document','sync','audio','nowMs','todayStr','getDay','diffDays',
    'currentActiveSeconds','flushFieldTimers','updateLiveSession','save','render',
    'maybeAutoExitEdit','startLocationWatch','tryLocNudge','moveState',
    'fetchObserverInbox','fetchHealthSync','maybeFetchDailyPhoto','syncHeaderScene',
    'quranHasRemoteRequest','app','reminderSchedulerDispatch','reminderSystemOffline',
    'mergeReminderLocalState','migrateReminderState','storageKey','reminderDeliveryKey',
    'getSessionState','setSessionState','getEditHiddenAt','setEditHiddenAt'
  ];
  var lifecycleState={lastSyncRetryWatchdogAt:0,quranLastForegroundPullAt:0};

  function registerLifecycleCallbacks(deps){
    if(lifecycleDeps||!deps||typeof deps!=='object'||Array.isArray(deps)) return false;
    for(var i=0;i<LIFECYCLE_DEPENDENCIES.length;i++){
      if(typeof deps[LIFECYCLE_DEPENDENCIES[i]]!=='function') return false;
    }
    lifecycleDeps=deps;
    return true;
  }
  function lifecycleDep(name){ return lifecycleDeps&&typeof lifecycleDeps[name]==='function'?lifecycleDeps[name]:null; }
  function lifecycleCall(name,args){ var fn=lifecycleDep(name); if(!fn) throw new Error('SeymaAppSurface: çözümlenemeyen lifecycle bağımlılığı '+name); return fn.apply(null,args||[]); }

  function onUserActivity(){
    var session=lifecycleCall('getSessionState');
    if(session) session.lastActivity=lifecycleCall('nowMs');
  }
  function sessionHeartbeat(){
    var session=lifecycleCall('getSessionState'), now=lifecycleCall('nowMs');
    if(!session) return;
    var inactiveSince=now-session.lastActivity;
    if(inactiveSince>300000) session.idleMs=Math.max(session.idleMs,inactiveSince-300000);
    var ui=lifecycleCall('ui');
    if(ui.editDate&&inactiveSince>300000) lifecycleCall('maybeAutoExitEdit',['5 dk hareketsizlik — bugüne döndük']);
    lifecycleCall('updateLiveSession');
  }
  function finalizeSession(){
    lifecycleCall('flushFieldTimers');
    var audio=lifecycleCall('audio'), ambient=audio&&audio.ambient;
    if(ambient&&typeof ambient.stop==='function') ambient.stop();
    var data=lifecycleCall('data'), session=lifecycleCall('getSessionState');
    if(!data||!session||session.closed) return;
    var today=lifecycleCall('todayStr');
    var rec=lifecycleCall('getDay',[data,today,lifecycleCall('diffDays',[data.startDate,today])]);
    if(!Array.isArray(rec.sessions)) rec.sessions=[];
    rec.sessions.push({start:session.start,end:lifecycleCall('nowMs'),activeSeconds:lifecycleCall('currentActiveSeconds')});
    delete rec.liveSession;
    session.closed=true;
    lifecycleCall('save');
  }
  function resetSession(){
    lifecycleCall('setSessionState',[{start:lifecycleCall('nowMs'),lastActivity:lifecycleCall('nowMs'),idleMs:0,closed:false}]);
    lifecycleCall('updateLiveSession');
  }
  function onSessionVisibilityChange(){
    var doc=lifecycleCall('document'), ui=lifecycleCall('ui');
    if(doc.hidden){
      finalizeSession();
      if(ui.editDate) lifecycleCall('setEditHiddenAt',[lifecycleCall('nowMs')]);
      return;
    }
    resetSession();
    var hiddenAt=lifecycleCall('getEditHiddenAt'), now=lifecycleCall('nowMs');
    if(ui.editDate&&hiddenAt&&(now-hiddenAt)>120000) lifecycleCall('maybeAutoExitEdit',['Bir süre uzaktaydın — bugüne döndük']);
    lifecycleCall('setEditHiddenAt',[0]);
    var data=lifecycleCall('data'), moveState=lifecycleCall('moveState');
    if(data&&data.settings&&data.settings.locationEnabled&&moveState.watchId==null) lifecycleCall('startLocationWatch',[false]);
    lifecycleCall('tryLocNudge',['return']);
  }
  function maybeRetrySync(){
    try{
      var data=lifecycleCall('data'), sync=lifecycleCall('sync');
      if(!data||!data.syncReceipt||!data.syncReceipt.lastErrorCode) return;
      if(!sync||typeof sync.retryIfPending!=='function') return;
      var now=lifecycleCall('nowMs');
      if(now-lifecycleState.lastSyncRetryWatchdogAt<300000) return;
      lifecycleState.lastSyncRetryWatchdogAt=now;
      sync.retryIfPending();
    }catch(e){}
  }
  function maybePullQuranForeground(force){
    var data=lifecycleCall('data');
    if(!data||!lifecycleCall('quranHasRemoteRequest')) return;
    try{ if(lifecycleCall('document').hidden&&!force) return; }catch(e){}
    var now=lifecycleCall('nowMs');
    if(!force&&now-lifecycleState.quranLastForegroundPullAt<25000) return;
    lifecycleState.quranLastForegroundPullAt=now;
    var app=lifecycleCall('app');
    if(app&&typeof app.refreshQuranUpdates==='function') app.refreshQuranUpdates(true,!!force);
  }
  function pollRemote(skipQuran){
    lifecycleCall('fetchObserverInbox');
    lifecycleCall('fetchHealthSync');
    maybeRetrySync();
    if(!skipQuran) maybePullQuranForeground(false);
  }
  function maybeVoiceGreeting(){
    try{
      var data=lifecycleCall('data');
      if(!data||!data.settings) return;
      var audio=lifecycleCall('audio');
      if(audio&&typeof audio.isQuietTime==='function'&&audio.isQuietTime()) return;
      var s=data.settings, now=lifecycleCall('nowMs'), today=lifecycleCall('todayStr');
      if(s.voiceGreetingDate!==today){ s.voiceGreetingDate=today; s.voiceGreetingCount=0; }
      if(s.voiceGreetingCount>=2) return;
      var last=Date.parse(s.lastVoiceGreetingAt||'')||0;
      if(last&&(now-last)<4*60*60*1000) return;
      s.lastVoiceGreetingAt=new Date().toISOString();
      s.voiceGreetingCount=(s.voiceGreetingCount||0)+1;
      if(audio&&typeof audio.greeting==='function') audio.greeting();
      lifecycleCall('save',[false]);
    }catch(e){}
  }
  function onAppForeground(source){
    var trigger=source||'foreground';
    var lifecycle=lifecycleCall('reminderSchedulerDispatch',[trigger,{offline:lifecycleCall('reminderSystemOffline')}]);
    if(lifecycle&&lifecycle.status==='coalesced') return lifecycle;
    var data=lifecycleCall('data');
    if(data){
      data.lastOpenedDate=lifecycleCall('todayStr');
      data.lastOpenedAt=new Date().toISOString();
      lifecycleCall('save',[false]);
    }
    pollRemote(true);
    maybePullQuranForeground(true);
    lifecycleCall('maybeFetchDailyPhoto');
    maybeVoiceGreeting();
    return lifecycle;
  }
  function reconcileReminderStorageEvent(event){
    var e=event&&typeof event==='object'?event:{};
    if(e.key===lifecycleCall('reminderDeliveryKey')){ if(lifecycleCall('ui').reminderCenterOpen) lifecycleCall('render'); return; }
    var data=lifecycleCall('data');
    if(e.key!==lifecycleCall('storageKey')||!e.newValue||!data) return;
    try{
      var incoming=JSON.parse(e.newValue), before=JSON.stringify(data.reminders), incomingRoot=incoming&&incoming.reminders;
      if(!incomingRoot) return;
      data.reminders=lifecycleCall('mergeReminderLocalState',[data.reminders,incomingRoot,data.savedAt,incoming.savedAt]);
      lifecycleCall('migrateReminderState',[data]);
      if(before!==JSON.stringify(data.reminders)&&lifecycleCall('ui').reminderCenterOpen) lifecycleCall('render');
    }catch(error){}
  }
  function onDocumentVisibilityChange(){
    if(lifecycleCall('document').hidden) lifecycleCall('reminderSchedulerDispatch',['hidden']);
    else onAppForeground('visibilitychange');
  }
  function onWindowFocus(){ return onAppForeground('focus'); }
  function onWindowPageshow(){ return onAppForeground('pageshow'); }
  function onWindowOnline(){
    var lifecycle=lifecycleCall('reminderSchedulerDispatch',['online',{online:true,offline:false}]);
    if(lifecycle&&lifecycle.status==='coalesced') return lifecycle;
    pollRemote(true);
    maybePullQuranForeground(true);
    if(lifecycleCall('ui').reminderCenterOpen) lifecycleCall('render');
  }
  function onWindowOffline(){
    var lifecycle=lifecycleCall('reminderSchedulerDispatch',['offline',{online:false,offline:true}]);
    if(lifecycle&&lifecycle.status==='coalesced') return lifecycle;
    if(lifecycleCall('ui').reminderCenterOpen) lifecycleCall('render');
  }
  function ambienceRefresh(){
    try{ if(!lifecycleCall('document').hidden) lifecycleCall('syncHeaderScene'); }catch(e){}
  }
  function reminderLifecycleTimer(){ return lifecycleCall('reminderSchedulerDispatch',['timer']); }

  // MON-54: boot/start/late-boot bridges. The registry owns only the
  // callback bodies; App exposure, data rebinds and the final call site stay
  // in app.js. Nothing below runs while this file is loading.
  var bootDeps=null;
  var BOOT_DEPENDENCIES=[
    'data','ui','ensureStartData','ensureAuthData','motivation','featuresLive',
    'commit','reminderSchedulerDispatch','audio','save','render','document',
    'touch','setTimeout','matchMedia','addDays','todayStr','replayAnswerPopup',
    'maybeVoiceGreeting','sha256','authHash','toast'
  ];
  function registerBootCallbacks(deps){
    if(bootDeps||!deps||typeof deps!=='object'||Array.isArray(deps)) return false;
    for(var i=0;i<BOOT_DEPENDENCIES.length;i++){
      if(typeof deps[BOOT_DEPENDENCIES[i]]!=='function') return false;
    }
    bootDeps=deps;
    return true;
  }
  function bootDep(name){ return bootDeps&&typeof bootDeps[name]==='function'?bootDeps[name]:null; }
  function bootCall(name,args){ var fn=bootDep(name); if(!fn) throw new Error('SeymaAppSurface: çözümlenemeyen boot bağımlılığı '+name); return fn.apply(null,args||[]); }

  function start(){
    var data=bootCall('data'), ui=bootCall('ui');
    if(data){ ui.forceStart=false; ui.tab='bugun'; bootCall('render'); bootCall('reminderSchedulerDispatch',['boot']); return; }
    data=bootCall('ensureStartData');
    var motivation=bootCall('motivation');
    if(motivation&&bootCall('featuresLive')) motivation.ensureMotivationRoot(data);
    ui.forceStart=false; ui.tab='bugun'; bootCall('commit',['Hadi başlayalım']); bootCall('reminderSchedulerDispatch',['boot']);
    try{
      if(data&&data.settings&&!data.settings.voiceOnboardedAt){
        data.settings.voiceOnboardedAt=new Date().toISOString();
        var audio=bootCall('audio');
        if(audio&&typeof audio.voice==='function') audio.voice('Sevgili Günışığı, hoş geldin. Bugün neler hissediyorsun?',{lang:'tr-TR',rate:1});
        bootCall('save',[false]);
      }
    }catch(e){}
  }

  function submitAuth(){
    var doc=bootCall('document');
    var u=(doc.getElementById('sey-auth-user').value||'').trim();
    var p=(doc.getElementById('sey-auth-pass').value||'').trim();
    var ui=bootCall('ui');
    if(!u||!p){ ui.authError=true; ui.authErrorMsg='Lütfen kullanıcı adını ve parolanı yaz.'; bootCall('render'); return; }
    if(bootCall('sha256',[u])===bootCall('authHash')&&bootCall('sha256',[p])===bootCall('authHash')){
      if(!bootCall('data')) bootCall('ensureAuthData');
      var data=bootCall('data'), a=data.settings.auth;
      a.usernameHash=bootCall('authHash');
      a.usernameMask=u.length>2?u.charAt(0)+'*'.repeat(u.length-2)+u.charAt(u.length-1):'***';
      a.rememberMe=!!ui.authRemember;
      a.unlockedAt=new Date().toISOString();
      a.unlockCount=(a.unlockCount||0)+1;
      ui.authError=false; ui.authErrorMsg=''; ui.authRemember=false; ui.authUnlocked=true;
      bootCall('save'); bootCall('render'); bootCall('toast',['Hoş geldin, Sevgili Günışığı ✨',2600]);
    }else{
      ui.authError=true; ui.authErrorMsg='Giriş bilgileri uyuşmadı. Bir nefes al ve tekrar dene.'; bootCall('render');
    }
  }
  function toggleRememberAuth(){ var ui=bootCall('ui'); ui.authRemember=!ui.authRemember; bootCall('render'); }
  function dismissAuthError(){ var ui=bootCall('ui'); ui.authError=false; ui.authErrorMsg=''; bootCall('render'); }

  function hideSplash(){
    var sp=bootCall('document').getElementById('sey-splash');
    if(!sp) return;
    sp.style.opacity='0';
    bootCall('setTimeout',[function(){ sp.style.display='none'; },480]);
  }
  function initialRender(){
    var data=bootCall('data'), doc=bootCall('document');
    bootCall('render');
    try{
      var touch=bootCall('touch');
      if(touch&&typeof touch.install==='function') touch.install(doc.getElementById('root'));
    }catch(e){}
    if(data) bootCall('reminderSchedulerDispatch',['boot']);
    if(data) bootCall('save',[false]);
    bootCall('setTimeout',[function(){ bootCall('maybeVoiceGreeting'); },2200]);
    bootCall('setTimeout',[function(){ bootCall('replayAnswerPopup'); },900]);

    var sp=doc.getElementById('sey-splash');
    if(!sp) return;
    var settings=data&&data.settings;
    var on=!!(settings&&settings.launchRitual);
    var mm=bootCall('matchMedia');
    var reduced=mm&&mm('(prefers-reduced-motion: reduce)').matches;
    if(!on||reduced){ sp.style.display='none'; return; }
    try{
      var yd=data&&data.days?data.days[bootCall('addDays',[bootCall('todayStr'),-1])]:null;
      var ydone=yd&&!!(yd.savedAt||yd.mood||(yd.habits&&Object.keys(yd.habits).some(function(k){return yd.habits[k];}))||(typeof yd.water==='number'&&yd.water>0));
      if(!ydone){ var nt=doc.getElementById('sey-splash-note'); if(nt) nt.textContent='Dünü de kaydetmeyi unutma'; }
    }catch(e){}
    bootCall('setTimeout',[hideSplash,900]);
  }

  window.SeymaAppSurface={
    APP_SURFACE_DEPENDENCIES:APP_SURFACE_DEPENDENCIES.slice(),
    registerAppSurface:registerAppSurface,
    toggleHabit:toggleHabit,
    toggleMgHabit:toggleMgHabit,
    explainDerivedHabit:explainDerivedHabit,
    setMood:setMood,
    saveToday:saveToday,
    DOMAIN_HANDLER_REGISTRIES:DOMAIN_HANDLER_REGISTRIES,
    registerDomainHandlers:registerDomainHandlers,
    domainHandler:domainHandler,
    OVERLAY_HANDLER_REGISTRIES:OVERLAY_HANDLER_REGISTRIES,
    registerOverlayHandlers:registerOverlayHandlers,
    overlayHandler:overlayHandler,
    LIFECYCLE_DEPENDENCIES:LIFECYCLE_DEPENDENCIES.slice(),
    registerLifecycleCallbacks:registerLifecycleCallbacks,
    onUserActivity:onUserActivity,
    sessionHeartbeat:sessionHeartbeat,
    finalizeSession:finalizeSession,
    resetSession:resetSession,
    onSessionVisibilityChange:onSessionVisibilityChange,
    maybeRetrySync:maybeRetrySync,
    maybePullQuranForeground:maybePullQuranForeground,
    pollRemote:pollRemote,
    maybeVoiceGreeting:maybeVoiceGreeting,
    onAppForeground:onAppForeground,
    reconcileReminderStorageEvent:reconcileReminderStorageEvent,
    onDocumentVisibilityChange:onDocumentVisibilityChange,
    onWindowFocus:onWindowFocus,
    onWindowPageshow:onWindowPageshow,
    onWindowOnline:onWindowOnline,
    onWindowOffline:onWindowOffline,
    ambienceRefresh:ambienceRefresh,
    reminderLifecycleTimer:reminderLifecycleTimer,
    BOOT_DEPENDENCIES:BOOT_DEPENDENCIES.slice(),
    registerBootCallbacks:registerBootCallbacks,
    start:start,
    submitAuth:submitAuth,
    toggleRememberAuth:toggleRememberAuth,
    dismissAuthError:dismissAuthError,
    initialRender:initialRender
  };
})();

// MON2-07 · alan yüzey bölümü — app.js'ten taşınan 24 gövde (aeon / location /
// header / weather / photo / habit / hero / luna). Ağ/GPS/notification ÇAĞRISI
// app.js'te kalır; burada yalnız saf hazırlık/parse/apply gövdeleri yaşar.
// MON-50 deseni: sloppy-mode IIFE + with(SCOPE) + canlı property-getter'lar.
// Dosyanın strict ana IIFE'sine dokunmaz; yüklemede DOM/ağ/timer erişimi yok (S5).
// K4 kuralı: DOM/timer erişimi ÇIPLAK GLOBAL değil, dep-bag takma adıyla
// (`doc`/`defer`) yapılır — böylece bu dosya tarayıcı globali adı taşımaz.
(function(){
  var FIELD_SURFACE_DEPENDENCIES=["App","HDR_PHASE_TR","MEALS","MOODS","activeDate","addDays","aeonAudioEls","aeonEnsureMediaLoaded","aeonLoadVisibleMedia","aeonMediaCache","aeonPaintFileCard","aeonPaintVoicePlayer","aeonPickAudioMime","aeonRec","aeonRecPaintBars","aeonRecSample","aeonRecTimeStr","aeonTextById","caffeineDrinks","caffeineLastTime","caffeineLimit","caffeineTimingOk","caffeineTotalMg","calGoal","countRec","createDefaultData","currentStreak","dayNutrition","doc","effSteps","el","esc","find","habitCountOn","habitProgress","hasAnyHubEntry","headerActionHTML","headerSaveState","headerSceneHTML","headerSkyClass","headerSkyClassNow","headerSolarProgress","headerSyncSubtitle","heroScienceLine","heroStatTile","htToday","humanFileSize","icon","isIOS","isStandalonePWA","isVacationDay","locationGateErrorText","locationGateFailure","locationGatePermanentFailure","locationGateResetNudge","lunaContext","lunaDayLine","medFreeStreak","onLocationFix","proteinGoal","psychSummaryLines","render","save","sleepGoalHours","stepsGoal","stopLocationWatch","todayStr","waterGoalCups","wxHm","wxMeta"];
  var fieldSurfaceDeps=null;
  var FIELD_SCOPE=Object.create(null);
  function registerFieldSurface(deps){
    if(fieldSurfaceDeps||!deps||typeof deps!=='object'||Array.isArray(deps)) return false;
    for(var fi=0;fi<FIELD_SURFACE_DEPENDENCIES.length;fi++){ if(typeof deps[FIELD_SURFACE_DEPENDENCIES[fi]]!=='function') return false; }
    fieldSurfaceDeps=deps; installFieldScope(); return true;
  }
  function isFieldSurfaceReady(){ return !!fieldSurfaceDeps; }
  function installFieldScope(){
    var seen={},k,d,n;
    var ns=window.SeymaAppSurface||{};
    for(k in ns) if(Object.prototype.hasOwnProperty.call(ns,k)) seen[k]=1;
    for(d=0;d<FIELD_SURFACE_DEPENDENCIES.length;d++){ n=FIELD_SURFACE_DEPENDENCIES[d]; seen[n]=1; }
    Object.keys(seen).forEach(function(name){
      if(Object.prototype.hasOwnProperty.call(FIELD_SCOPE,name)) return;
      Object.defineProperty(FIELD_SCOPE,name,{
        get:function(){
          if(fieldSurfaceDeps&&Object.prototype.hasOwnProperty.call(fieldSurfaceDeps,name)) return fieldSurfaceDeps[name]();
          var live=window.SeymaAppSurface, moved=live&&live[name];
          return typeof moved==='function'?moved:undefined;
        },
        configurable:true,enumerable:true
      });
    });
  }
  with(FIELD_SCOPE){
function habitProgress(rec,key,date){
  if(key==='water'){ var w=(rec&&typeof rec.water==='number'&&rec.water>0)?rec.water:0; var g=waterGoalCups(date); return {met:w>=g,cur:w,goal:g,unit:'bardak',has:w>0}; }
  if(key==='sleepReg'){ var h=(rec&&rec.sleep&&rec.sleep.hours!=null&&rec.sleep.hours!=='')?Number(rec.sleep.hours):null; if(h!=null&&isNaN(h)) h=null; var sg=sleepGoalHours(date); return {met:(h!=null&&h>=sg),cur:h,goal:sg,unit:'saat',has:h!=null}; }
  if(key==='walked20'){ var e=effSteps(rec); var s=(e.steps!=null&&!isNaN(e.steps))?e.steps:0; var stg=stepsGoal(date); return {met:s>=stg,cur:s,goal:stg,unit:'adım',has:s>0,source:e.source}; }
  if(key==='journaled'){ var nt=(rec&&(String(rec.note||'').trim()||String((rec.journal&&rec.journal.text)||'').trim()))?1:0; return {met:nt>0,cur:nt,goal:1,binary:true,has:nt>0}; }
  if(key==='sweetManaged'){ var cd=!!(rec&&rec.craving10MinDone); return {met:cd,cur:cd?1:0,goal:1,binary:true,has:cd}; }
  if(key==='foodManaged'){ var fd=!!(rec&&rec.foodCravingDone); return {met:fd,cur:fd?1:0,goal:1,binary:true,has:fd}; }
  if(key==='coffeeManaged'){ var kd=!!(rec&&rec.coffeeCravingDone); return {met:kd,cur:kd?1:0,goal:1,binary:true,has:kd}; }
  if(key==='mediaFed'){ var any=hasAnyHubEntry(rec); return {met:any,cur:any?1:0,goal:1,binary:true,has:any}; }
  if(key==='caffeineOk'){ var cafTotal=caffeineTotalMg(rec); var cafLimit=caffeineLimit(date); var cafLast=caffeineLastTime(rec); var cafHas=caffeineDrinks(rec).length>0; var amountOk=cafTotal<=cafLimit; var timingOk=caffeineTimingOk(rec); var met=amountOk&&(cafHas?timingOk:true); return {met:met,cur:cafTotal,goal:cafLimit,unit:'mg',has:cafHas,amountOk:amountOk,timingOk:timingOk}; }
  return null;
}

function headerSyncSubtitle(){
  try{
    var r=(data&&data.syncReceipt)||null;
    if(!r||!r.acceptedAt) return '';
    var mins=Math.floor((Date.now()-Date.parse(r.acceptedAt))/60000);
    if(!isFinite(mins)||mins<0) return '';
    if(mins<2) return 'az önce';
    if(mins<60) return mins+' dk önce';
    var hrs=Math.floor(mins/60);
    if(hrs<24) return hrs+' sa önce';
    return Math.floor(hrs/24)+' gün önce';
  }catch(e){ return ''; }
}

function headerSaveState(){
  var s=ui.saveState||'clean', last=headerSyncSubtitle();
  var seen=last?(' · panelde son görünen: '+last):'';
  if(s==='saving') return {cls:'is-saving',icon:'rotate-ccw',label:'Eşitleniyor…',aria:'Panel ile eşitleniyor',title:'Uzak kayıt okunuyor, birleştiriliyor ve gönderiliyor',busy:true,disabled:true};
  if(s==='error') return {cls:'is-error',icon:'triangle-alert',label:'Tekrar dene',aria:'Eşitleme başarısız oldu, tekrar dene',title:'Eşitleme tamamlanamadı'+seen+' · tekrar denemek için dokun'};
  if(s==='local') return {cls:'is-local',icon:'check',label:'Cihazda',aria:'Veriler cihaza kaydedildi',title:'Cihaza kaydedildi · panele göndermek için Ayarlar\'dan repoya bağlan'};
  if(s==='synced') return {cls:'is-synced',icon:'circle-check',label:'Eşitlendi',aria:'Panel ile eşitlendi',title:'Panel bu ana kadarki her şeyi gördü'};
  if(s==='dirty') return {cls:'is-dirty',icon:'rotate-ccw',label:'Eşitle',aria:'Panel ile şimdi eşitle',title:'Panele gitmemiş değişiklik var'+seen+' · eşitlemek için dokun'};
  return {cls:'is-clean',icon:'rotate-ccw',label:'Eşitle',aria:'Panel ile şimdi eşitle',title:'Panel ile şimdi eşitle'+seen};
}

function locationGateErrorText(code,reason){
  if(reason==='insecure-context') return 'Konum yalnızca güvenli bağlantıda (https) çalışır. Bu sayfa güvensiz bir adresten açıldığı için Safari izin penceresini hiç göstermiyor.';
  if(reason==='unsupported') return 'Bu tarayıcıda konum hizmeti kullanılamıyor. Safari’yi güncelleyip tekrar dene.';
  if(code===1) return isIOS()?(isStandalonePWA()?'Konum izni kapalı. Ayarlar → Şeyma → Konum → “Uygulamayı Kullanırken” seçeneğini aç.':'Konum izni kapalı. Safari’de aA → Web Sitesi Ayarları → Konum → İzin Ver yolunu aç.'):'Konum izni verilmedi. Tarayıcının site ayarlarında Konum → İzin Ver seçeneğini aç.';
  if(code===2) return 'Konum bulunamadı. Cihazın Konum Servisleri açıkken yeniden dene.';
  if(code===3) return 'Konum isteği zaman aşımına uğradı. Birkaç saniye sonra yeniden dene.';
  return 'Konum izni doğrulanamadı. Safari ayarlarını kontrol edip yeniden dene.';
}

function locationGatePermanentFailure(code,reason){
  return reason==='unsupported'||reason==='insecure-context'||code===1;
}

function locationGateFailure(code,reason){
  ui.locationGateRequestInFlight=false;
  ui.locationGateState=reason==='unsupported'?'unsupported':(code===1?'denied':'unavailable');
  ui.locationGateError=locationGateErrorText(code,reason);
  locationGateResetNudge();
  stopLocationWatch();
  if(data&&data.settings&&locationGatePermanentFailure(code,reason)){
    data.settings.locationEnabled=false;
    data.settings.locationDisabledAt=new Date().toISOString();
    data.settings.locationDisabledReason=reason||'permission-denied';
    save(false);
  }
  render();
}



function heroStatTile(ic,val,label,accent,met){
  var col=met?'#3F8A4F':accent;
  var bg=met?'rgba(143,191,138,0.16)':'var(--icon)';
  var filled=(val!=='—');
  return '<div style="flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 4px;border-radius:15px;background:'+bg+';border:1px solid '+(met?'rgba(143,191,138,0.34)':'transparent')+';">'
    +'<span style="display:inline-flex;color:'+(filled?col:'var(--faint)')+';">'+icon(ic,15)+'</span>'
    +'<span style="font-size:var(--f-footnote);font-weight:800;line-height:1.05;color:'+(filled?'var(--text)':'var(--faint)')+';white-space:nowrap;">'+val+'</span>'
    +'<span style="font-size:var(--f-caption2);font-weight:700;letter-spacing:.3px;color:var(--faint);text-transform:uppercase;">'+label+'</span></div>';
}

function heroScienceLine(rec){
  var sh=(rec&&rec.sleep&&rec.sleep.hours!=null&&rec.sleep.hours!=='')?Number(rec.sleep.hours):null;
  var water=rec?(Number(rec.water)||0):0;
  var wg=waterGoalCups(activeDate());
  var es=effSteps(rec);
  var mood=rec&&rec.mood;
  var txt;
  var sg=sleepGoalHours(activeDate()), stg=stepsGoal(activeDate());
  if(sh!=null&&sh<sg) txt=String(sg).replace('.',',')+'+ saat uyku, açlık hormonlarını (leptin/grelin) dengeler — şeker isteğini düşürür.';
  else if(water<wg) txt='Hafif susuzluk bile yorgunluk ve tatlı isteği gibi hissedilir; önce bir bardak su.';
  else if(es.steps!=null&&es.steps<stg) txt='Kısa bir yürüyüş bile kan şekerini ve ruh hâlini dengeler — 10 dakika yeter.'+(isVacationDay(activeDate())?' (tatil modunda adım hedefi esnetildi)':'');
  else if(mood==='zorlandim'||mood==='cok-zorlandim') txt='Zor günlerde beyin hızlı dopamin arar; kendine nazik ol — küçük bir adım bile kayda geçer.';
  else if(isVacationDay(activeDate())) txt='Tatil modunda esneklik var; küçük bir adım, bir bardak su ve kendi kendine nazik bir cümle yeter.';
  else txt='Küçük ve tutarlı adımlar, güçlü iradeden daha kalıcıdır — beyin (nöroplastisite) böyle öğrenir.';
  return '<div style="display:flex;align-items:flex-start;gap:8px;">'
    +'<span style="flex-shrink:0;color:var(--accent-ink);display:inline-flex;margin-top:1px;">'+icon('brain',14)+'</span>'
    +'<span style="font-size:var(--f-caption1);line-height:1.5;color:var(--muted);">'+txt+'</span></div>';
}

function headerActionHTML(a){
  if(!a) return '';
  var cls='sey-header-action'+(a.primary?' is-primary':'');
  return '<button class="'+cls+'" '+(a.disabled?'disabled':'onclick="'+a.fn+'"')+' aria-label="'+esc(a.label)+'" title="'+esc(a.label)+'">'
    +icon(a.icon||'sparkles',16)+'<span>'+esc(a.label)+'</span></button>';
}

function headerSkyClass(sc){
  var t=(sc&&sc.time)?sc.time.replace('amb-time-','sky-time-'):'';
  var w=(sc&&sc.weather)?sc.weather.replace('amb-wx-','sky-wx-'):'';
  return ('sey-hdr-sky '+t+' '+w).replace(/\s+/g,' ').trim();
}

function headerSkyClassNow(){
  // premiumAtmosphere kapalıysa gökyüzü de sönük kalır (gating sızıntısı yok).
  if(!data||!data.settings||!data.settings.premiumAtmosphere) return 'sey-hdr-sky';
  if(!window.SeyAmbience||typeof window.SeyAmbience.scene!=='function') return 'sey-hdr-sky';
  try{ return headerSkyClass(window.SeyAmbience.scene()); }catch(e){ return 'sey-hdr-sky'; }
}

function headerSolarProgress(spot,now){
  // 0–1: gün doğumu → gün batımı. Veri yoksa null (yay çizilmez).
  if(!spot||!spot.sunrise||!spot.sunset) return null;
  var sr=new Date(spot.sunrise).getTime(), ss=new Date(spot.sunset).getTime();
  if(!isFinite(sr)||!isFinite(ss)||ss<=sr) return null;
  var t=(now||new Date()).getTime();
  return Math.max(0,Math.min(1,(t-sr)/(ss-sr)));
}

function headerSceneHTML(){
  if(!window.SeyAmbience||typeof window.SeyAmbience.scene!=='function') return '';
  // premiumAtmosphere kapalıyken şerit de görünmez — gating sızıntısı olmasın.
  if(!data||!data.settings||!data.settings.premiumAtmosphere) return '';
  var sc; try{ sc=window.SeyAmbience.scene(); }catch(e){ return ''; }
  if(!sc) return '';
  var spot=(data.weather&&data.weather.spots&&data.weather.spots.length)?data.weather.spots[0]:null;
  var meta=spot?wxMeta(spot.code,spot.isDay):null;
  var phase=HDR_PHASE_TR[sc.time]||'Bugün';
  var isNight=(sc.time==='amb-time-night');
  var prog=headerSolarProgress(spot);

  var h='<div class="sey-hdr-scene" aria-hidden="false">';

  // — hava rozeti —
  // TAM-DENETIM B-11: `sey-enter-delay-1/2/3` CSS'te tanımlıydı ama hiçbir
  // kaynakta kullanılmıyordu (ölü stil). Silmek yerine burada kademeli girişe
  // bağlandı — üç sahne öğesi sırayla belirir, borç kapanır.
  h+='<div class="sey-hdr-wx sey-enter sey-enter-delay-1">';
  h+='<span class="sey-hdr-wx-glyph">'+(meta?meta.emoji:icon(isNight?'moon':'sun',17))+'</span>';
  if(spot&&spot.temp!=null) h+='<span class="sey-hdr-wx-temp">'+esc(String(Math.round(spot.temp)))+'°</span>';
  h+='<span class="sey-hdr-wx-label">'+esc(meta?meta.label:'hava bekleniyor')+'</span>';
  h+='</div>';

  // — güneş yayı: gerçek doğuş/batış ilerlemesi —
  if(prog!=null){
    // Kuadratik Bézier P0(6,30) P1(60,-1) P2(114,30) üzerinde nokta.
    var t=prog, mt=1-t;
    var dx=mt*mt*6 + 2*mt*t*60 + t*t*114;
    var dy=mt*mt*30 + 2*mt*t*(-1) + t*t*30;
    h+='<div class="sey-hdr-arc sey-enter sey-enter-delay-2'+(isNight?' is-night':'')+'">';
    h+='<svg viewBox="0 0 120 34" preserveAspectRatio="none" focusable="false" aria-hidden="true">';
    h+='<path class="sey-hdr-arc-track" d="M6,30 Q60,-1 114,30" pathLength="1"/>';
    h+='<path class="sey-hdr-arc-done" d="M6,30 Q60,-1 114,30" pathLength="1" style="stroke-dasharray:'+t.toFixed(3)+' 1;"/>';
    h+='<circle class="sey-hdr-arc-dot" cx="'+dx.toFixed(2)+'" cy="'+dy.toFixed(2)+'" r="3.4"/>';
    h+='</svg></div>';
  }

  // — vakit etiketi + doğuş/batış saati —
  h+='<div class="sey-hdr-phase sey-enter sey-enter-delay-3">';
  h+='<span class="sey-hdr-phase-name">'+esc(phase)+'</span>';
  if(spot&&spot.sunrise&&spot.sunset){
    h+='<span class="sey-hdr-phase-time">'+icon(isNight?'sunrise':'sunset',10)+' '+esc(isNight?wxHm(spot.sunrise):wxHm(spot.sunset))+'</span>';
  }
  h+='</div>';

  h+='</div>';
  return h;
}

function aeonEnsureMediaLoaded(mediaId,kind,elId){
  var el=doc.getElementById(elId); if(!el||!mediaId) return;
  function paint(m){
    if(!m){ el.innerHTML='<span style="opacity:.6;display:inline-flex;">'+icon('triangle-alert',16)+'</span>'; return; }
    var uri='data:'+(m.mime||'')+';base64,'+m.data;
    if(kind==='image') el.innerHTML='<img src="'+uri+'" style="width:100%;height:100%;object-fit:cover;display:block;">';
    else if(kind==='voice') aeonPaintVoicePlayer(el,mediaId,m,uri);
    else if(kind==='file') aeonPaintFileCard(el,mediaId,m);
  }
  if(aeonMediaCache[mediaId]){ paint(aeonMediaCache[mediaId]); return; }
  fetchAeonMedia(mediaId).then(paint).catch(function(){ paint(null); });
}

function aeonLoadVisibleMedia(){
  var els=doc.querySelectorAll('.aeon-media-slot');
  for(var i=0;i<els.length;i++){ var el=els[i]; aeonEnsureMediaLoaded(el.getAttribute('data-media-id'),el.getAttribute('data-media-kind'),el.id); }
}

function aeonPaintVoicePlayer(container,mediaId,m,uri){
  var peaks=(m.peaks&&m.peaks.length)?m.peaks:[.3,.5,.4,.6,.35,.55,.45,.65,.3,.5,.4,.6,.35,.55,.45,.65];
  var bars=peaks.map(function(v){ return '<span style="flex:1;min-width:2px;border-radius:2px;background:currentColor;opacity:.55;height:'+Math.max(3,Math.round(v*22))+'px;"></span>'; }).join('');
  container.innerHTML='<div style="display:flex;align-items:center;gap:9px;min-width:170px;">'
    +'<button onclick="App.aeonToggleVoice(\''+mediaId+'\')" id="aeon-voice-btn-'+mediaId+'" aria-label="Oynat/duraklat" style="flex-shrink:0;border:none;cursor:pointer;width:32px;height:32px;border-radius:50%;background:currentColor;display:flex;align-items:center;justify-content:center;"><span id="aeon-voice-icon-'+mediaId+'" style="color:var(--card);font-size:var(--f-caption1);">▶</span></button>'
    +'<div style="flex:1;display:flex;align-items:center;gap:1.5px;height:24px;min-width:0;">'+bars+'</div>'
    +'<span id="aeon-voice-time-'+mediaId+'" style="flex-shrink:0;font-size:var(--f-caption2);opacity:.75;font-variant-numeric:tabular-nums;">'+aeonRecTimeStr(m.durationSec)+'</span>'
    +'</div>';
  if(!aeonAudioEls[mediaId]) aeonAudioEls[mediaId]={uri:uri,audio:null,durationSec:m.durationSec};
}

function aeonPaintFileCard(container,mediaId,m){
  var name=m.name||'Belge', size=m.size!=null?humanFileSize(m.size):'';
  container.setAttribute('onclick','App.aeonOpenFile(\''+mediaId+'\')');
  container.style.cursor='pointer';
  container.innerHTML='<div style="display:flex;align-items:center;gap:11px;min-width:170px;max-width:260px;">'
    +'<span style="flex-shrink:0;width:36px;height:36px;border-radius:11px;display:flex;align-items:center;justify-content:center;background:currentColor;color:inherit;"><span style="display:flex;color:var(--card);">'+icon('file-text',17)+'</span></span>'
    +'<div style="flex:1;min-width:0;"><div style="font-size:var(--f-footnote);font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+esc(name)+'</div>'
    +'<div style="font-size:var(--f-caption2);opacity:.7;margin-top:1px;">'+(size?esc(size)+' · ':'')+'aç / indir</div></div>'
    +'<span style="flex-shrink:0;display:inline-flex;opacity:.75;">'+icon('download',15)+'</span>'
    +'</div>';
}

function aeonTextById(kind,id,field){
  if(kind==='notif'){ var n=notifList().find(function(x){ return x&&x.id===id; }); return n?n.text:null; }
  var qa=(data.aeon&&Array.isArray(data.aeon.qa))?data.aeon.qa:[];
  var q=qa.find(function(x){ return x&&x.id===id; });
  if(!q) return null;
  return field==='answer'?q.answer:q.question;
}

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
  if(Array.isArray(r.cravingTriggers)&&r.cravingTriggers.length){ var _tg={tired:'yorgun',bored:'sıkkın',hungry:'açlık',stress:'stres',habit:'alışkanlık',emotional:'duygusal',lowenergy:'enerji dibi',social:'keyif/sosyal'}; parts.push('Kriz-tetik:'+r.cravingTriggers.map(function(t){return _tg[t.trigger]||t.trigger;}).join(',')); }
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
  if(rec){ var tnu=dayNutrition(rec); if(tnu.protein>0||tnu.calories>0) lines.push('Beslenme: ~'+tnu.protein+' g protein · ~'+tnu.calories+' kcal (hedef '+proteinGoal()+' g / '+calGoal()+' kcal)'); if(typeof rec.water==='number'&&rec.water>0) lines.push('Su: '+rec.water+'/'+waterGoalCups(today)+' bardak'); var es=[]; if(rec.energy!=null) es.push('enerji '+rec.energy+'/5'); if(rec.stress!=null) es.push('stres '+rec.stress+'/5'); if(es.length) lines.push('Hâl: '+es.join(' · ')); if(rec.caffeine&&rec.caffeine.last) lines.push('Son kafein: '+rec.caffeine.last+(rec.caffeine.cups?(' · '+rec.caffeine.cups+' fincan'):'')); }
  var mfs=medFreeStreak(); if(mfs>0) lines.push('İlaçsız gece serisi: '+mfs+' gece');
  if(rec&&rec.cravingSOSCount){ var _ck=[]; if(rec.craving10MinDone) _ck.push('tatlı'); if(rec.foodCravingDone) _ck.push('yemek'); if(rec.coffeeCravingDone) _ck.push('kahve'); lines.push('Kriz yönetimi (SOS): '+rec.cravingSOSCount+' kez'+(_ck.length?(' · '+_ck.join(', ')):'')); }
  if(rec&&Array.isArray(rec.cravingTriggers)&&rec.cravingTriggers.length){ var tgm={tired:'yorgunluk',bored:'sıkkınlık',hungry:'gerçek açlık',stress:'stres',habit:'alışkanlık',emotional:'duygusal açlık',lowenergy:'enerji dibi',social:'keyif/sosyal'}; lines.push('Kriz tetikleyicileri: '+rec.cravingTriggers.map(function(t){return tgm[t.trigger]||t.trigger;}).join(', ')); }
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
  // ── psikolojik profil (öz-bildirim tarama; tanı değil) ──
  if(data.psych&&data.psych.scores){
    lines.push('');
    lines.push('--- Psikolojik profil (iki haftada bir yenilenen öz-bildirim TARAMA anketi; klinik tanı DEĞİL, '+String(data.psych.completedAt||'').slice(0,10)+') ---');
    psychSummaryLines(data.psych.scores).forEach(function(l){ lines.push(l); });
    lines.push('Ton yönergesi: Bu profile göre tonunu nazikçe uyarla — güven/bağlanma hassassa daha çok güven ver ve tutarlı ol; dikkat dağınıksa yanıtını kısa, adım adım ve net tut; kaygı/duygudurum yüksekse yumuşak, yargısız ve umut veren ol. Bu profili Şeyma’ya bir etiket gibi okuma, yalnızca ona nasıl eşlik edeceğini şekillendirmek için kullan.');
  }
  // ── tüm günlük kayıtlar (en yeni en üstte) ──
  if(dates.length){
    lines.push('');
    lines.push('--- Tüm günlük kayıtlar ('+dates.length+' gün) ---');
    dates.slice().reverse().forEach(function(d){ lines.push(lunaDayLine(d,data.days[d])); });
  }
  return 'Şeyma hakkında bildiğin HER ŞEY (yalnızca Şeyma’ya ait gizli kişisel kayıtlar — tümünü okuyabilir ve bütününe bakarak yanıt verebilirsin):\n'+lines.join('\n');
}

function aeonPickAudioMime(){
  var cands=['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/aac'];
  for(var i=0;i<cands.length;i++){ if(window.MediaRecorder&&MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(cands[i])) return cands[i]; }
  return '';
}

function aeonRecPaintBars(){
  var wrap=doc.getElementById('aeon-rec-wave'); if(!wrap||!aeonRec) return;
  var bars=aeonRec.peaks.slice(-28);
  wrap.innerHTML=bars.map(function(v){ return '<span style="flex:1;min-width:2px;border-radius:2px;background:#1a1404;opacity:.75;height:'+Math.max(3,Math.round(v*24))+'px;"></span>'; }).join('');
}

function aeonRecSample(){
  if(!aeonRec||!aeonRec.analyser) return;
  var arr=new Uint8Array(aeonRec.analyser.frequencyBinCount);
  function step(){
    if(!aeonRec||!aeonRec.analyser) return;
    aeonRec.analyser.getByteFrequencyData(arr);
    var sum=0; for(var i=0;i<arr.length;i++) sum+=arr[i];
    aeonRec.peaks.push(sum/arr.length/255);
    if(aeonRec.peaks.length>500) aeonRec.peaks.shift();
    aeonRecPaintBars();
    aeonRec.raf=requestAnimationFrame(step);
  }
  aeonRec.raf=requestAnimationFrame(step);
}
  }
  window.SeymaAppSurface.habitProgress=habitProgress;
  window.SeymaAppSurface.headerSyncSubtitle=headerSyncSubtitle;
  window.SeymaAppSurface.headerSaveState=headerSaveState;
  window.SeymaAppSurface.locationGateErrorText=locationGateErrorText;
  window.SeymaAppSurface.locationGatePermanentFailure=locationGatePermanentFailure;
  window.SeymaAppSurface.locationGateFailure=locationGateFailure;
  window.SeymaAppSurface.heroStatTile=heroStatTile;
  window.SeymaAppSurface.heroScienceLine=heroScienceLine;
  window.SeymaAppSurface.headerActionHTML=headerActionHTML;
  window.SeymaAppSurface.headerSkyClass=headerSkyClass;
  window.SeymaAppSurface.headerSkyClassNow=headerSkyClassNow;
  window.SeymaAppSurface.headerSolarProgress=headerSolarProgress;
  window.SeymaAppSurface.headerSceneHTML=headerSceneHTML;
  window.SeymaAppSurface.aeonEnsureMediaLoaded=aeonEnsureMediaLoaded;
  window.SeymaAppSurface.aeonLoadVisibleMedia=aeonLoadVisibleMedia;
  window.SeymaAppSurface.aeonPaintVoicePlayer=aeonPaintVoicePlayer;
  window.SeymaAppSurface.aeonPaintFileCard=aeonPaintFileCard;
  window.SeymaAppSurface.aeonTextById=aeonTextById;
  window.SeymaAppSurface.lunaDayLine=lunaDayLine;
  window.SeymaAppSurface.lunaContext=lunaContext;
  window.SeymaAppSurface.aeonPickAudioMime=aeonPickAudioMime;
  window.SeymaAppSurface.aeonRecPaintBars=aeonRecPaintBars;
  window.SeymaAppSurface.aeonRecSample=aeonRecSample;
  window.SeymaAppSurface.registerFieldSurface=registerFieldSurface;
  window.SeymaAppSurface.isFieldSurfaceReady=isFieldSurfaceReady;
  window.SeymaAppSurface.FIELD_SURFACE_DEPENDENCIES=FIELD_SURFACE_DEPENDENCIES.slice();
})();
