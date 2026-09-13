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
    reminderLifecycleTimer:reminderLifecycleTimer
  };
})();
