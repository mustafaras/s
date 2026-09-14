// MON-40 · reminder runtime adapters.
// Frozen catalog/engine/scheduler/delivery modules remain read-only owners;
// delivery, permission, sync and persistence stay in app.js. The Reminder
// Center shell/card view below is a read-only adapter over the existing
// Catalog/API surface; App handlers remain app-owned.
(function(root){
  var deps=null;


  var viewDeps=null;
  var REQUIRED_DEPENDENCIES=['catalog','engine','scheduler','data','ui','reminderLifecycleState','PRAYER_NAMES','PRAYER_ORDER','ZIKR_V2_VISIBLE','REMINDER_EVENT_SUMMARY','SEYMA_REMINDERS','SEYMA_APP_SURFACE','esc','icon','todayStr','minToHHMM','hhmmToMin','prayerSettings','prayerMethod','prayerLocation','prayerLocationHash','syncConfigured','normalizeSyncReceipt','featuresLive','saygiPersonById','saygiCurrentPerson','saygiArticleReadableFor','caffeineTargetBed','caffeineCutoffTime','appendReminderEvent','activeDate','editing','saygiPeople'];
  var FALLBACK_POLICY_DEFAULTS={
    dailyFlowBudget:3,
    nativeDailyCap:3,
    lowPriorityNativeCap:1,
    sameCategoryCooldownMinutes:360,
    capacityMode:'balanced',
    quietHours:{start:'22:30',end:'07:30'}
  };
  var FALLBACK_CHANNELS={in_app:true,native:true};
  var FALLBACK_QUIET_BEHAVIORS={suppress:true,defer:true,in_app:true};
  var FALLBACK_CAPACITY_MODES={balanced:true,light:true,silent:true,ritual:true};
  var FALLBACK_PRIORITY_RANK={P0:0,P1:1,P2:2,P3:3};

  function registerReminders(next){
    if(deps||!next||typeof next!=='object'||Array.isArray(next)) return false;
    for(var i=0;i<REQUIRED_DEPENDENCIES.length;i++) if(typeof next[REQUIRED_DEPENDENCIES[i]]!=='function') return false;
    deps=next;
    return true;
  }
  var REQUIRED_VIEW_DEPENDENCIES=['ui','root','definitions','copy','icon','esc','normalizePolicy','permissionSnapshot','permissionExplanation','profileLabel','deepLinkTarget','previewSafeCopy','channels','validTime'];
  function registerReminderView(next){
    if(viewDeps||!next||typeof next!=='object'||Array.isArray(next)) return false;
    for(var i=0;i<REQUIRED_VIEW_DEPENDENCIES.length;i++) if(typeof next[REQUIRED_VIEW_DEPENDENCIES[i]]!=='function') return false;
    viewDeps=next;
    return true;
  }
  function viewDep(name,fallback){
    var value=viewDeps&&viewDeps[name];
    if(typeof value==='function'){
      try{return value();}catch(e){return fallback;}
    }
    return value===undefined?fallback:value;
  }
  function viewCall(name,args,fallback){
    var value=viewDeps&&viewDeps[name];
    if(typeof value!=='function') return fallback;
    try{
      var result=value.apply(null,args||[]);
      return result===undefined?fallback:result;
    }catch(e){
      return fallback;
    }
  }
  function dep(name,fallback){
    var value=deps&&deps[name];
    if(typeof value==='function'){
      try{return value();}catch(e){return fallback;}
    }
    return value===undefined?fallback:value;
  }
  function callDep(name,args){
    var value=deps&&deps[name];
    if(typeof value!=='function') return null;
    try{return value.apply(null,args||[]);}catch(e){return null;}
  }
  function enumHas(map,value){
    var source=map&&typeof map==='object'?map:FALLBACK_CHANNELS;
    return typeof value==='string'&&Object.prototype.hasOwnProperty.call(source,value);
  }
  function validTime(value){
    var external=deps&&deps.validTime;
    if(typeof external==='function'){
      try{return external(value);}catch(e){}
    }
    return typeof value==='string'&&/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
  }
  function catalog(){ return dep('catalog',root&&root.ReminderCatalogV1)||null; }
  function engine(){ return dep('engine',root&&root.ReminderEngineV1)||null; }
  function scheduler(){ return dep('scheduler',root&&root.ReminderSchedulerV1)||null; }
  function policyDefaults(){ return dep('policyDefaults',FALLBACK_POLICY_DEFAULTS)||FALLBACK_POLICY_DEFAULTS; }
  function channels(){ return dep('channels',FALLBACK_CHANNELS)||FALLBACK_CHANNELS; }
  function quietBehaviors(){ return dep('quietBehaviors',FALLBACK_QUIET_BEHAVIORS)||FALLBACK_QUIET_BEHAVIORS; }
  function capacityModes(){ return dep('capacityModes',FALLBACK_CAPACITY_MODES)||FALLBACK_CAPACITY_MODES; }
  function priorityRank(){ return dep('priorityRank',FALLBACK_PRIORITY_RANK)||FALLBACK_PRIORITY_RANK; }

  // Catalog is frozen content. These adapters return a fresh list and never
  // expose a mutable catalog reference to the app runtime.
  function reminderDefinitions(){
    var source=catalog(), list=source&&typeof source.list==='function'?source.list():[];
    return Array.isArray(list)?list.filter(function(def){ return def&&typeof def==='object'; }):[];
  }
  function reminderCopy(key,fallback){
    var source=catalog(), value=null;
    try{ value=source&&typeof source.getCopy==='function'?source.getCopy(key):null; }catch(e){ value=null; }
    return typeof value==='string'&&value?value:String(fallback||'');
  }

  // Pure policy adapters. They consume explicit input plus the dependency bag;
  // they do not read data, time, DOM, storage, network or notification state.
  function reminderPolicyInteger(value,min,max,fallback){
    return Number.isInteger(value)&&value>=min&&value<=max?value:fallback;
  }
  function reminderPolicyTimeMinutes(value){
    if(typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<1440) return Math.floor(value);
    if(typeof value==='object'&&value&&Number.isInteger(value.hour)&&Number.isInteger(value.minute)&&value.hour>=0&&value.hour<=23&&value.minute>=0&&value.minute<=59) return value.hour*60+value.minute;
    if(!validTime(value)) return null;
    return Number(value.slice(0,2))*60+Number(value.slice(3,5));
  }
  function reminderQuietHoursState(localTime,quietHours){
    var minutes=reminderPolicyTimeMinutes(localTime), interval=quietHours&&typeof quietHours==='object'?quietHours:{};
    var start=reminderPolicyTimeMinutes(interval.start), end=reminderPolicyTimeMinutes(interval.end);
    if(minutes===null||start===null||end===null||start===end) return {quiet:false,minutes:minutes,start:start,end:end};
    var quiet=start<end?(minutes>=start&&minutes<end):(minutes>=start||minutes<end);
    return {quiet:quiet,minutes:minutes,start:start,end:end};
  }
  function reminderPolicySelectedCategories(context){
    var out=[],seen={}, source=context&&Array.isArray(context.selectedCategories)?context.selectedCategories:[];
    if(context&&typeof context.selectedCategory==='string') source=source.concat([context.selectedCategory]);
    source.forEach(function(category){ category=String(category||''); if(category&&!seen[category]){ seen[category]=true; out.push(category); } });
    return out;
  }
  function reminderPolicyRecentCategoryAge(entry,currentMinutes){
    if(!entry||typeof entry!=='object') return null;
    var age=entry.minutesAgo;
    if(!Number.isFinite(age)) age=entry.ageMinutes;
    if(!Number.isFinite(age)) age=entry.minutesSince;
    if(Number.isFinite(age)&&age>=0) return age;
    if(Number.isFinite(entry.atMinutes)&&Number.isFinite(currentMinutes)){
      var delta=currentMinutes-entry.atMinutes;
      if(delta<0) delta+=1440;
      return delta>=0?delta:null;
    }
    if(entry.recent===true||entry.isRecent===true) return 0;
    return null;
  }
  function reminderPolicyRecentCategoryCooldown(category,context,cooldownMinutes,currentMinutes){
    if(!cooldownMinutes) return {active:false,remaining:0};
    var deliveries=context&&Array.isArray(context.recentCategoryDeliveries)?context.recentCategoryDeliveries:[], latest=null;
    deliveries.forEach(function(entry){
      if(!entry||String(entry.category||'')!==category) return;
      var age=reminderPolicyRecentCategoryAge(entry,currentMinutes);
      if(age!==null&&(latest===null||age<latest)) latest=age;
    });
    if(context&&context.lastCategoryDeliveryMinutesAgo&&Number.isFinite(context.lastCategoryDeliveryMinutesAgo[category])){
      var direct=context.lastCategoryDeliveryMinutesAgo[category];
      if(direct>=0&&(latest===null||direct<latest)) latest=direct;
    }
    return {active:latest!==null&&latest<cooldownMinutes,remaining:latest===null?0:Math.max(0,cooldownMinutes-latest),ageMinutes:latest};
  }
  function reminderPolicyPriority(value){
    var rank=priorityRank(), priority=String(value||'P3').toUpperCase();
    return Object.prototype.hasOwnProperty.call(rank,priority)?priority:'P3';
  }
  function reminderPolicyMode(value){ return enumHas(capacityModes(),value)?value:'balanced'; }
  function reminderPolicyInputParts(input){
    var x=input&&typeof input==='object'?input:{}, definition=x.definition&&typeof x.definition==='object'?x.definition:x, preference=x.preference&&typeof x.preference==='object'?x.preference:(x.reminderPreference&&typeof x.reminderPreference==='object'?x.reminderPreference:{}), context=x.context&&typeof x.context==='object'?x.context:(x.suppressionContext&&typeof x.suppressionContext==='object'?x.suppressionContext:(x.suppression&&typeof x.suppression==='object'?x.suppression:{}));
    return {input:x,definition:definition,preference:preference,context:context};
  }
  function reminderPolicyEvaluate(input){
    var parts=reminderPolicyInputParts(input), definition=parts.definition, preference=parts.preference, context=parts.context, rank=priorityRank(), quietMap=quietBehaviors(), channelMap=channels(), defaults=policyDefaults();
    var id=String(definition.id||preference.reminderId||''), category=String(definition.category||preference.category||''), priority=reminderPolicyPriority(definition.priority||preference.priority), mode=reminderPolicyMode(context.capacityMode||context.todayMode||context.mode), requestedChannel=enumHas(channelMap,preference.channel)?preference.channel:(enumHas(channelMap,definition.defaultChannel)?definition.defaultChannel:'in_app');
    var enabled=preference.enabled===true||(!Object.keys(preference).length&&parts.input.enabled===true);
    var quietHours=context.quietHours&&typeof context.quietHours==='object'?context.quietHours:(defaults.quietHours||{start:'22:30',end:'07:30'});
    var quietState=typeof context.quietHours==='boolean'?{quiet:context.quietHours,minutes:reminderPolicyTimeMinutes(context.localTime||context.localTimeOfDay||context.time)}:reminderQuietHoursState(context.localTime||context.localTimeOfDay||context.time,quietHours), cap=reminderPolicyInteger(context.nativeDailyCap,0,24,defaults.nativeDailyCap==null?3:defaults.nativeDailyCap), used=reminderPolicyInteger(context.nativeBudgetUsed,0,100000,0), suppliedRemaining=reminderPolicyInteger(context.dailyBudgetRemaining,0,100000,-1), remaining=suppliedRemaining>=0?Math.min(cap,suppliedRemaining):Math.max(0,cap-used), lowCap=reminderPolicyInteger(context.lowPriorityNativeCap,0,24,defaults.lowPriorityNativeCap==null?1:defaults.lowPriorityNativeCap), lowUsed=reminderPolicyInteger(context.lowPriorityNativeUsed,0,100000,0), cooldownMinutes=reminderPolicyInteger(context.sameCategoryCooldownMinutes,0,1440,defaults.sameCategoryCooldownMinutes==null?360:defaults.sameCategoryCooldownMinutes), cooldown=context.careOccurrence===true?{active:false,remaining:0}:reminderPolicyRecentCategoryCooldown(category,context,cooldownMinutes,quietState.minutes), selectedCategories=reminderPolicySelectedCategories(context), explicitlySelected=context.explicitlySelected===true||preference.explicitlySelected===true||preference.userScheduled===true||preference.userCreated===true, actionRequired=context.actionRequired===true||context.systemActionRequired===true||parts.input.actionRequired===true, permissionState=String(context.permissionState||'granted'), nativeRequested=requestedChannel==='native';
    var result={id:id,category:category,priority:priority,mode:mode,requestedChannel:requestedChannel,allowed:false,inAppAllowed:false,nativeAllowed:false,nativeOccurrence:false,channel:'suppressed',suppressed:true,grouped:false,reason:'disabled',quietHours:quietState.quiet,quiet:quietState.quiet,budgetRemaining:remaining,lowPriorityBudgetRemaining:Math.max(0,lowCap-lowUsed),cooldownActive:cooldown.active,cooldownRemainingMinutes:cooldown.remaining,completionConsidered:false,completionNeutral:true,punitive:false,alarm:false};
    if(!id||!category||!Object.prototype.hasOwnProperty.call(rank,priority)){ result.reason='invalid-definition'; return result; }
    if(!enabled) return result;
    var capacityBlocked=false;
    if(mode==='silent'&&priority!=='P0') capacityBlocked=true;
    if(mode==='light'&&priority!=='P0'&&!(priority==='P1'&&explicitlySelected)) capacityBlocked=true;
    if(mode==='ritual'&&priority!=='P0'){
      var ritualSelection=selectedCategories.length?selectedCategories.indexOf(category)>=0:category==='ritual';
      if(category==='care'&&explicitlySelected) ritualSelection=true;
      if(category==='health'&&explicitlySelected) ritualSelection=true;
      if(!ritualSelection) capacityBlocked=true;
    }
    if(capacityBlocked){ result.reason='capacity-'+mode; result.grouped=mode==='ritual'; return result; }
    if(priority==='P0'&&!actionRequired){ result.reason='p0-not-required'; return result; }
    var behavior=quietMap[preference.quietHoursBehavior]?preference.quietHoursBehavior:'defer';
    var quietException=priority==='P1'&&explicitlySelected&&(preference.quietHoursException===true||context.allowQuietHoursException===true);
    if(quietState.quiet&&!quietException&&priority!=='P0'&&behavior==='suppress'){ result.reason='quiet-hours-suppressed'; return result; }
    if(quietState.quiet&&!quietException&&priority!=='P0'&&behavior!=='in_app'&&behavior!=='defer'){ result.reason='quiet-hours-suppressed'; return result; }
    result.inAppAllowed=true; result.allowed=true; result.channel='in_app'; result.suppressed=false;
    if(!nativeRequested){ result.reason=quietState.quiet?'quiet-hours-in-app':'in-app'; return result; }
    if(mode==='silent'){ result.reason='capacity-silent'; return result; }
    if(permissionState!=='granted'){ result.reason='permission-'+(permissionState||'unavailable'); return result; }
    if(quietState.quiet&&!quietException){ result.reason=priority==='P0'?'p0-quiet-hours-in-app':(behavior==='in_app'?'quiet-hours-in-app':'quiet-hours-deferred'); return result; }
    if(priority==='P3'&&preference.channel!=='native'&&preference.nativeOptIn!==true){ result.reason='p3-native-default-off'; return result; }
    if(cooldown.active){ result.reason='category-cooldown'; return result; }
    if(remaining<=0){ result.reason='native-daily-cap'; return result; }
    if((priority==='P2'||priority==='P3')&&lowUsed>=lowCap){ result.reason='low-priority-native-cap'; return result; }
    result.nativeAllowed=true; result.nativeOccurrence=true; result.channel='native'; result.reason='native-allowed';
    return result;
  }
  function reminderPolicySelectNativeCandidates(input){
    var source=Array.isArray(input)?input:((input&&Array.isArray(input.candidates))?input.candidates:[]), options=Array.isArray(input)?{}:((input&&typeof input==='object')?input:{}), cap=reminderPolicyInteger(options.nativeDailyCap,0,24,(policyDefaults().nativeDailyCap==null?3:policyDefaults().nativeDailyCap)), selected=[], rejected=[], candidates=[], rank=priorityRank();
    source.forEach(function(candidate,index){
      if(!candidate||typeof candidate!=='object') return;
      var policy=candidate.policy&&typeof candidate.policy==='object'?candidate.policy:reminderPolicyEvaluate({definition:candidate.definition||candidate,preference:candidate.preference||{enabled:candidate.enabled===true,channel:candidate.channel||candidate.defaultChannel},context:Object.assign({},options.context||{},{nativeBudgetUsed:reminderPolicyInteger(options.nativeBudgetUsed,0,100000,0)+selected.length})});
      candidates.push({candidate:candidate,policy:policy,index:index});
    });
    candidates.sort(function(left,right){
      var rankLeft=Object.prototype.hasOwnProperty.call(rank,left.policy.priority)?rank[left.policy.priority]:99, rankRight=Object.prototype.hasOwnProperty.call(rank,right.policy.priority)?rank[right.policy.priority]:99;
      if(rankLeft!==rankRight) return rankLeft-rankRight;
      var explicitLeft=left.candidate.explicitlySelected===true||left.policy.requestedChannel==='native'?0:1, explicitRight=right.candidate.explicitlySelected===true||right.policy.requestedChannel==='native'?0:1;
      if(explicitLeft!==explicitRight) return explicitLeft-explicitRight;
      var timeLeft=String(left.candidate.scheduledAt||left.candidate.localTime||''), timeRight=String(right.candidate.scheduledAt||right.candidate.localTime||'');
      if(timeLeft!==timeRight) return timeLeft<timeRight?-1:1;
      var idLeft=String(left.policy.id||left.candidate.id||''), idRight=String(right.policy.id||right.candidate.id||'');
      if(idLeft!==idRight) return idLeft<idRight?-1:1;
      return left.index-right.index;
    });
    candidates.forEach(function(entry){
      if(entry.policy.nativeAllowed&&selected.length<cap) selected.push(entry.candidate);
      else rejected.push({candidate:entry.candidate,reason:entry.policy.nativeAllowed?'native-daily-cap':entry.policy.reason});
    });
    return {selected:selected,rejected:rejected,remaining:Math.max(0,cap-selected.length),nativeDailyCap:cap};
  }

  // Frozen engine and scheduler adapters. The frozen registries are never
  // copied; callers receive only their explicit result/object.
  // Saf (motorsuz) motor gövdeleri: HEAD'teki app tarafı saf üretici/localParts
  // buraya MON2-02 ile taşındı; sarmalayıcılar motor yokken saf sonuca düşer.
  function reminderEnginePureLocalParts(instantMs,timezone){
    if(!Number.isFinite(instantMs)||!reminderEngineTimezoneValid(timezone)) return null;
    try{
      var parts=new Intl.DateTimeFormat('en-US',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date(instantMs)), out={};
      parts.forEach(function(part){ if(part.type!=='literal') out[part.type]=part.value; });
      var date=String(out.year)+'-'+String(out.month)+'-'+String(out.day), time=String(out.hour)+':'+String(out.minute)+':'+String(out.second);
      return reminderEngineValidDate(date)&&reminderEngineParseTime(time)?{year:Number(out.year),month:Number(out.month),day:Number(out.day),hour:Number(out.hour),minute:Number(out.minute),second:Number(out.second),localDate:date,localTime:time}:null;
    }catch(e){ return null; }
  }
  function reminderEnginePureGenerateOccurrence(input){
    var x=input&&typeof input==='object'?input:{}, definition=x.definition&&typeof x.definition==='object'?x.definition:x, reminderId=String(x.reminderId||definition.id||''), timezone=String(x.timezone||definition.timezone||REMINDER_ENGINE_DEFAULT_TIMEZONE), instantMs=reminderEngineInstantMs(x), instantParts=instantMs===null?null:reminderEnginePureLocalParts(instantMs,timezone), localDate=reminderEngineValidDate(x.localDate)?x.localDate:(instantParts&&instantParts.localDate||''), nowLocalDate=reminderEngineValidDate(x.nowLocalDate)?x.nowLocalDate:(reminderEngineValidDate(x.currentLocalDate)?x.currentLocalDate:(instantParts&&instantParts.localDate)||localDate), nowLocalTime=x.nowLocalTime||x.currentLocalTime||(instantParts&&instantParts.localTime)||'';
    var fail=function(reason,extra){ return Object.assign({ok:false,occurrence:null,reason:reason,replay:false,nativeReplay:false,stale:false},extra||{}); };
    if(!reminderId||!reminderEngineTimezoneValid(timezone)) return fail('invalid-timezone-or-reminder');
    if(!localDate||!reminderEngineValidDate(localDate)) return fail('invalid-local-date');
    var scheduled=reminderEngineScheduledTime(x,definition,localDate,timezone);
    if(!scheduled) return fail('invalid-trigger');
    if(scheduled.stale) return fail(scheduled.reason||'stale-prayer-data',{stale:true,sourceRevision:scheduled.sourceRevision||''});
    if(!scheduled.time) return fail(scheduled.reason||'invalid-trigger');
    if(!scheduled.localDate||!reminderEngineValidDate(scheduled.localDate)) return fail('invalid-scheduled-date');
    var scheduledAt=scheduled.time, definitionVersion=String(x.definitionVersion||definition.definitionVersion||'1'), comparison=nowLocalTime?reminderEngineCompareDateTime(scheduled.localDate,scheduledAt,nowLocalDate,nowLocalTime):null, past=comparison!==null&&comparison<0, due=comparison!==null&&comparison<=0;
    var occurrence={reminderId:reminderId,occurrenceId:reminderEngineOccurrenceId(reminderId,scheduled.localDate,scheduledAt,timezone,definitionVersion),localDate:scheduled.localDate,scheduledAt:scheduledAt,timezone:timezone,sourceRevision:String(x.sourceRevision||scheduled.sourceRevision||definition.sourceRevision||definitionVersion),priority:reminderPolicyPriority(definition.priority||x.priority||'P3'),definitionVersion:definitionVersion,triggerType:String(x.triggerType||definition.triggerType||'fixed-time'),hijriOffset:Number.isInteger(x.hijriOffset)&&x.hijriOffset>=-2&&x.hijriOffset<=2?x.hijriOffset:0,due:due,past:past,replay:false,nativeReplay:false,shouldReplay:false};
    return Object.assign({ok:true,reason:null,occurrence:occurrence},occurrence);
  }

  function reminderEngineLocalParts(instantMs,timezone){
    var source=engine();
    return source&&typeof source.localParts==='function'?source.localParts(instantMs,timezone):reminderEnginePureLocalParts(instantMs,timezone);
  }
  function reminderEngineGenerateOccurrence(input){
    var source=engine();
    return source&&typeof source.generateOccurrence==='function'?source.generateOccurrence(input):reminderEnginePureGenerateOccurrence(input);
  }
  function reminderSchedulerCreate(options){
    var source=scheduler();
    return source&&typeof source.create==='function'?source.create(options||{}):null;
  }

  // MON-41 view adapters. These functions receive only live read resolvers and
  // existing app-owned section HTML. They never touch DOM/storage/network,
  // never request native permission and never mutate data/ui. App.* strings in
  // the markup are intentionally unchanged handler shims owned by app.js.
  function reminderWindowLabel(def){
    var w=def&&def.defaultWindow;
    if(!w||typeof w!=='object') return 'Zaman penceresi hazırlanıyor';
    if(w.kind==='offset') return 'Vakit öncesi · '+Number(w.earliestMinutesBefore||0)+'–'+Number(w.latestMinutesBefore||0)+' dk';
    if(w.time&&viewCall('validTime',[String(w.time)],false)) return 'Saat · '+String(w.time);
    if(w.start&&w.end) return String(w.start)+'–'+String(w.end);
    return 'Olayla birlikte';
  }
  function reminderChannelLabel(def){
    return def&&def.defaultChannel==='native'?'Native + uygulama içi':'Uygulama içi';
  }
  function reminderCategoryState(rootValue,category){
    var defs=viewCall('definitions',[],[]), channelMap=viewDep('channels',FALLBACK_CHANNELS), enabled=0, channel=null, mixed=false;
    defs=(Array.isArray(defs)?defs:[]).filter(function(def){ return String(def.category||'')===String(category||''); });
    defs.forEach(function(def){
      var pref=rootValue&&rootValue.preferences?rootValue.preferences[def.id]:null, isEnabled=!!(pref&&pref.enabled), nextChannel=pref&&enumHas(channelMap,pref.channel)?pref.channel:'in_app';
      if(isEnabled) enabled++;
      if(channel===null) channel=nextChannel; else if(channel!==nextChannel) mixed=true;
    });
    return {defs:defs,enabledCount:enabled,total:defs.length,allEnabled:defs.length>0&&enabled===defs.length,someEnabled:enabled>0,channel:mixed?'mixed':(channel||'in_app')};
  }
  function reminderCategoryChannelLabel(channel){
    if(channel==='native') return 'Native · izin varsa; uygulama içi yedek açık';
    if(channel==='mixed') return 'Karışık kanal';
    return 'Uygulama içi';
  }
  function reminderCapacityModeLabel(mode){
    var labels={balanced:'Dengeli',light:'Hafif gün',silent:'Sessiz',ritual:'Ritüel odaklı'};
    return labels[mode]||labels.balanced;
  }
  function reminderCenterClone(value){
    try{ return JSON.parse(JSON.stringify(value)); }catch(e){ return null; }
  }
  function reminderCenterEnabledCount(rootValue,defs){
    var preferences=rootValue&&rootValue.preferences&&typeof rootValue.preferences==='object'?rootValue.preferences:{}, list=Array.isArray(defs)?defs:[];
    return list.filter(function(def){ var pref=preferences[String(def&&def.id||'')]; return !(pref&&pref.enabled===false); }).length;
  }
  function reminderCardHTML(def,index){
    var ui=viewDep('ui',{}), rootValue=viewCall('root',[],{}), id=String(def&&def.id||''), preview=ui.reminderPreviewId===id, pref=rootValue&&rootValue.preferences?rootValue.preferences[id]:null, enabled=!pref||pref.enabled!==false;
    var target=viewCall('deepLinkTarget',[{reminderId:id,deepLink:String(def&&def.deepLink||'')}],{ok:false}), targetState=target&&target.ok?'available':'unavailable';
    var copy=function(key,fallback){ return viewCall('copy',[key,fallback],fallback); }, icon=function(name,size){ return viewCall('icon',[name,size],''); }, esc=function(value){ return viewCall('esc',[value],String(value==null?'':value)); };
    var title=String(def&&def.privateTitle||''), safe=viewCall('previewSafeCopy',[def],{detail:''}), body=ui.reminderPreviewLegacyId===id?String(def&&def.privateBody||''):String(safe&&safe.detail||'');
    var h='<article class="sey-reminder-card sey-stagger" style="--i:'+Math.min(index,8)+'" data-reminder-id="'+esc(id)+'" data-reminder-category="'+esc(String(def&&def.category||''))+'" aria-labelledby="sey-reminder-card-title-'+index+'">';
    h+='<div class="sey-reminder-card-top"><span class="sey-reminder-card-index" aria-hidden="true">'+(index+1)+'</span><div class="sey-reminder-card-copy"><span class="sey-reminder-card-category">'+esc(String(def&&def.category||'').replace(/_/g,' '))+'</span><h3 id="sey-reminder-card-title-'+index+'">'+esc(title)+'</h3></div><span class="sey-reminder-card-state">'+esc(String(def&&def.priority||'—'))+' · Öneri</span></div>';
    h+='<div class="sey-reminder-card-meta"><span><b>Tetikleyici</b>'+esc(String(def&&def.triggerType||'—'))+'</span><span><b>Pencere</b>'+esc(reminderWindowLabel(def))+'</span><span><b>Kanal</b>'+esc(reminderChannelLabel(def))+'</span><span data-reminder-target-state="'+targetState+'"><b>Bağlantı</b>'+esc(target&&target.ok?String(def&&def.deepLink||'—'):'Şimdilik kullanılamıyor')+'</span></div>';
    h+='<small class="sey-reminder-card-version">Tanım v'+esc(String(def&&def.definitionVersion||'—'))+'</small>';
    if(!target||!target.ok) h+='<div class="sey-reminder-unavailable" data-reminder-target-state="unavailable" role="status"><strong>Bu durak şu anda kullanılamıyor.</strong><span>Hatırlatma ayarı burada korunur; hedef hazır olduğunda yeniden açabilirsin.</span></div>';
    h+='<div class="sey-reminder-card-actions"><button type="button" class="sey-reminder-secondary" onclick="App.previewReminderSafe(\''+esc(id)+'\')" aria-expanded="'+(preview?'true':'false')+'" aria-controls="sey-reminder-preview-'+index+'">'+esc(preview?copy('inApp.actions.previewClose','Önizlemeyi kapat'):copy('inApp.actions.previewOpen','Uygulama içi önizleme'))+'</button><button type="button" class="sey-reminder-secondary'+(enabled?'':' is-disabled')+'" onclick="App.setReminderEnabled(\''+esc(id)+'\','+(enabled?'false':'true')+')" aria-pressed="'+enabled+'">'+esc(enabled?copy('inApp.actions.disableReminder','Bu durağı kapat'):copy('inApp.actions.enableReminder','Bu durağı tekrar aç'))+'</button></div>';
    if(preview) h+='<div id="sey-reminder-preview-'+index+'" class="sey-reminder-preview" role="status" aria-live="polite"><span class="sey-reminder-preview-kicker">'+esc(copy('inApp.preview.kicker','UYGULAMA İÇİ ÖNİZLEME · GÜVENLİ'))+'</span><strong>'+esc(title)+'</strong><p>'+esc(body)+'</p><small>'+esc(copy('inApp.preview.bodySuffix','Bu yalnızca uygulama içi bir önizlemedir; native izin, bildirim veya kayıt oluşturmaz. Hassas reminder gövdesi gösterilmez.'))+'</small></div>';
    h+='</article>';
    return h;
  }
  function reminderCenterOverlayHTML(){
    var rootValue=viewCall('root',[],{})||{}, policy=viewCall('normalizePolicy',[rootValue.policy],{})||{}, defs=viewCall('definitions',[],[]), ui=viewDep('ui',{})||{}, muted=!!ui.reminderTodayMuted, remaining=muted?0:reminderCenterEnabledCount(rootValue,defs), snapshot=viewCall('permissionSnapshot',[],null), permission=viewCall('permissionExplanation',[snapshot],{})||{}, sections=viewCall('sections',[],null)||(function(){ var uiv=viewDep('ui',{})||{}; return { notice:reminderCenterNoticeHTML(), systemStatus:reminderSystemStatusHTML(), profile:reminderProfileSectionHTML(rootValue), digestLauncher:reminderDigestLauncherHTML(), digest:uiv.reminderDigestOpen?reminderDigestHTML():'', testPreview:reminderTestPreviewHTML(), policy:reminderCenterPolicyHTML(rootValue), personalization:reminderPersonalizationHTML(rootValue), permission:reminderPermissionExplanationHTML(permission), categories:reminderCategoryControlsHTML(rootValue), specialDays:reminderSpecialDaysSectionHTML(rootValue), care:reminderCareControlsHTML(rootValue), medication:reminderMedicationSectionHTML(rootValue), history:reminderCenterHistoryHTML(), retention:reminderCenterRetentionHTML() }; })(), copy=function(key,fallback){ return viewCall('copy',[key,fallback],fallback); }, icon=function(name,size){ return viewCall('icon',[name,size],''); }, esc=function(value){ return viewCall('esc',[value],String(value==null?'':value)); }, profileLabel=String(viewCall('profileLabel',[rootValue.profile],'')||'');
    var h='<div id="sey-reminder-overlay" class="sey-reminder-overlay" role="dialog" aria-modal="true" aria-labelledby="sey-reminder-title" aria-describedby="sey-reminder-overview-copy" tabindex="-1" onclick="App.closeReminderCenter()" onkeydown="if(event.key===\'Escape\'){event.preventDefault();App.closeReminderCenter();}">';
    h+='<section id="sey-reminder-screen" class="sey-reminder-screen" tabindex="-1" onkeydown="App.onReminderKeydown(event)" onclick="event.stopPropagation()">';
    h+='<header class="sey-reminder-header"><div><span class="sey-reminder-eyebrow">ŞEYMA · RİTİM MERKEZİ</span><h2 id="sey-reminder-title">'+esc(copy('inApp.center.title','Hatırlatmalar ve bildirimler'))+'</h2><p>'+esc(copy('inApp.center.subtitle','Günün küçük duraklarını burada sakince gözden geçir.'))+'</p></div><button data-fx="close" type="button" class="sey-reminder-close" onclick="App.closeReminderCenter()" aria-label="'+esc(copy('inApp.center.closeLabel','Hatırlatmalar ve bildirimler merkezini kapat'))+'">'+icon('x',18)+'</button></header>';
    h+='<main id="sey-reminder-scroll" class="sey-reminder-scroll">';
    h+=sections.notice||'';
    h+='<section class="sey-reminder-intro" aria-labelledby="sey-reminder-overview-title"><div class="sey-reminder-intro-mark" aria-hidden="true">'+icon('bell-ring',22)+'</div><div><h3 id="sey-reminder-overview-title">'+esc(copy('inApp.center.introTitle','Kontrol sende'))+'</h3><p id="sey-reminder-overview-copy">'+esc(copy('inApp.center.introBody','Native kanal yalnız açık bir kullanıcı eylemiyle açılır; ilk yüklemede izin istenmez. Uygulama içi önizleme izin gerektirmez.'))+'</p></div></section>';
    h+=sections.systemStatus||'';
    h+=sections.profile||'';
    h+='<section class="sey-reminder-summary" aria-label="Bugünün hatırlatma özeti">';
    [[ 'sun','Bugünün modu',reminderCapacityModeLabel(policy.capacityMode),'Profil: '+profileLabel],['check-check','Kalan öneri',String(remaining),'Katalog kapsamı · '+defs.length+' tanım'],['circle-check','Native izin',permission.label,permission.meaning],['moon','Sessiz saatler',policy.quietHours.start+'–'+policy.quietHours.end,'Kullanıcı tercihi · quiet interval'],['activity','Native bütçesi','0 / '+policy.nativeDailyCap,'Günlük üst sınır · düşük öncelik '+policy.lowPriorityNativeCap+' · cooldown '+policy.sameCategoryCooldownMinutes+' dk']].forEach(function(item){
      h+='<div class="sey-reminder-summary-item"><span class="sey-reminder-summary-icon" aria-hidden="true">'+icon(item[0],16)+'</span><span><small>'+esc(item[1])+'</small><strong>'+esc(item[2])+'</strong><em>'+esc(item[3])+'</em></span></div>';
    });
    h+='</section>';
    h+='<section class="sey-reminder-actions" aria-label="Hatırlatma eylemleri"><button type="button" class="sey-reminder-primary" onclick="App.testReminder()">'+icon('play',16)+'<span>Sentetik test reminder · Uygulama içi önizleme/test</span></button><button type="button" class="sey-reminder-mute'+(muted?' is-muted':'')+'" onclick="App.muteReminderToday()" aria-pressed="'+muted+'">'+icon('bell-off',16)+'<span>'+(muted?esc(copy('inApp.mute.todayRestore','Bugün susturuldu · geri getir')):esc(copy('inApp.mute.todayAll','Bugün tümünü sustur')))+'</span></button></section>';
    h+='<div id="sey-reminder-digest-target">'+(sections.digestLauncher||'')+(sections.digest||'')+'</div>';
    h+='<div id="sey-reminder-test-preview-target">'+(sections.testPreview||'')+'</div>';
    h+=sections.policy||'';
    h+=sections.personalization||'';
    h+='<p class="sey-reminder-live-note" role="status" aria-live="polite" aria-atomic="true" id="sey-reminder-center-live-region" data-reminder-render-target="reminder-center-live">'+icon('info',14)+' '+esc(copy('inApp.center.liveNote','Native seçimi izin, mahrem kopya ve desteklenen PWA koşullarıyla sınırlıdır; izin kapalıysa uygulama içi kartlar korunur.'))+'</p>';
    h+=sections.permission||'';
    h+=sections.categories||'';
    h+=sections.specialDays||'';
    h+=sections.care||'';
    h+=sections.medication||'';
    h+=sections.history||'';
    h+=sections.retention||'';
    h+='<section class="sey-reminder-catalog" aria-labelledby="sey-reminder-catalog-title"><div class="sey-reminder-section-head"><div><span class="sey-reminder-eyebrow">KATALOGDAN GELEN DURAKLAR</span><h3 id="sey-reminder-catalog-title">Öneri alanları</h3></div><span class="sey-reminder-count">'+defs.length+'</span></div>';
    if(!defs.length){
      h+='<div class="sey-reminder-empty" role="status"><span aria-hidden="true">'+icon('sparkles',22)+'</span><strong>'+esc(copy('inApp.empty.catalogTitle','Şimdilik katalogda etkin hatırlatma yok.'))+'</strong><p>'+esc(copy('inApp.empty.catalogBody','Merkez hazır; yeni kayıtlar geldiğinde burada görünür.'))+'</p></div>';
    } else {
      h+='<div class="sey-reminder-catalog-list">'; defs.forEach(function(def,index){ h+=reminderCardHTML(def,index); }); h+='</div>';
    }
    h+='</section>';
    h+='<p class="sey-reminder-privacy">Katalog başlığı uygulama içinde görünür. Ayrıntı metni yalnızca yukarıdaki uygulama içi önizlemede gösterilir; kaydedilmez ve dışarı gönderilmez.</p>';
    h+='</main></section></div>';
    return h;
  }


  // MON2-02: taşıma kapsamı — with-gövdesinin çıplak harici adları canlı bag
  // getter'larından çözülür (Proxy yerine sıradan nesne; K1 ev-deseni).
  var SCOPE_NAMES=[
    'data','ui','reminderLifecycleState','PRAYER_NAMES','PRAYER_ORDER',
    'ZIKR_V2_VISIBLE','REMINDER_EVENT_SUMMARY','SEYMA_REMINDERS','SEYMA_APP_SURFACE',
    'esc','icon','todayStr','minToHHMM','hhmmToMin','prayerSettings','prayerMethod',
    'prayerLocation','prayerLocationHash','syncConfigured','normalizeSyncReceipt',
    'featuresLive','saygiPersonById','saygiCurrentPerson','saygiArticleReadableFor',
    'caffeineTargetBed','caffeineCutoffTime','appendReminderEvent','activeDate',
    'editing','saygiPeople',
    'persistReminderEvent',
    'reminderEventActionForDelivery',
    'reminderSchemaCompatibility',
    'reminderDeliveryStorageRead',
    'reminderDeliveryStorageWrite',
    'reminderLifecycleDefaultContext',
    'reminderLifecycleDraftActive',
    'reminderLifecycleReplaceTarget',
    'reminderLifecycleUpdateLive',
    'reminderLifecycleRenderIfNeeded',
    'reminderActionStorageRead',
    'reminderActionStorageWrite',
    'reminderPermissionState',
    'reminderPermissionSnapshot',
    'reminderSystemOffline',
    'reminderCurrentRoot',
    'reminderNativeDisplay',
    'download'
  ];
  var scope={};
  for(var _si=0;_si<SCOPE_NAMES.length;_si++){
    (function(_name){
      Object.defineProperty(scope,_name,{enumerable:true,
        get:function(){
          // MON2-02 düzeltmesi: kapsam yalnızca deps bag'den çözülür. deps bag
          // sözleşmesi "argsız getter" olduğu için f() hem fonksiyon adları için
          // ham fonksiyonu hem değer adları için canlı değeri verir. viewDeps
          // üyeleri RAW'dır (viewCall sözleşmesi) ve burada f() ile çözülürse
          // icon/esc gibi yardımcılar argsız çağrılıp bozulur.
          var f=deps&&deps[_name];
          if(typeof f!=='function') return undefined;
          return f();
        },
        set:function(){ throw new Error('MON2-02: registry kapsamına yazma yok: '+_name); }
      });
    })(SCOPE_NAMES[_si]);
  }

  // MON2-02: taşınan saf/B1 reminder gövdeleri ve sabitleri.
  with(scope){
  var REMINDER_PREFERENCE_SCHEMA_VERSION=1;
  var REMINDER_SCHEMA_STATUS={missing:1,legacy:1,current:1,future:1,malformed:1};
  var REMINDER_CHANNELS={in_app:true,native:true};
  var REMINDER_PRIVACY_MODES={private:true,safe_summary:true};
  var REMINDER_QUIET_BEHAVIORS={suppress:true,defer:true,in_app:true};
  var REMINDER_RESERVED_JOURNAL_ROOTS={delivery:true,deliveryLog:true,reminderDelivery:true,reminderDeliveries:true,reminderHistory:true,notificationDelivery:true};
  var REMINDER_SYNC_BLOCKED_ROOTS={reminders:true,delivery:true,deliveryLog:true,reminderDelivery:true,reminderDeliveries:true,reminderHistory:true,notificationDelivery:true};
  var REMINDER_SYNC_BLOCKED_KEY=/reminder|occurrence|quiet.?hours|catch.?up|notification.?delivery/i;
  function isReminderSyncBlockedKey(key){ return !!REMINDER_SYNC_BLOCKED_ROOTS[String(key||'')]||REMINDER_SYNC_BLOCKED_KEY.test(String(key||'')); }
  var REMINDER_SNOOZE_OPTIONS={
    '10m':true,'30m':true,'1h':true,'todayOff':true,'thisEvening':true,'tomorrow':true
  };
  var REMINDER_CAPACITY_MODES={balanced:true,light:true,silent:true,ritual:true};
  var REMINDER_PRIORITY_RANK={P0:0,P1:1,P2:2,P3:3};
  var REMINDER_CARE_CATEGORY='care';
  var REMINDER_CARE_KEYS=['water','sleep','caffeine','movement'];
  var REMINDER_MEDICATION_SCHEMA_VERSION=1;
  var REMINDER_MEDICATION_ID_PREFIX='reminder.medication.v1.';
  var REMINDER_MEDICATION_NAME_MAX=80;
  var REMINDER_MEDICATION_LABEL_MAX=60;
  var REMINDER_MEDICATION_NOTE_MAX=240;
  var REMINDER_MEDICATION_MAX_SCHEDULES=24;
  var REMINDER_MEDICATION_NATIVE_TITLE='Bir küçük hatırlatman hazır';
  var REMINDER_MEDICATION_NATIVE_BODY='Seçtiğin saati kontrol etmek için Şeyma’yı açabilirsin.';
  var REMINDER_MEDICATION_SAFETY_COPY='Bu özellik yalnızca senin girdiğin zamanı hatırlatır; doz, tedavi veya tıbbi karar önermez. Sağlıkla ilgili kararlar için doktorunun veya eczacının yönlendirmesini takip et.';
  var REMINDER_SPECIAL_DAYS_ID='reminder.special.v1.hijri';
  var REMINDER_SPECIAL_DAYS_MODES={all:true,selected:true,none:true};
  var REMINDER_SPECIAL_DAY_OPTIONS=[
    {id:'hijri-new-year',label:'Hicri Yeni Yıl'},
    {id:'ashura',label:'Aşure Günü'},
    {id:'regaip-kandili',label:'Regaip Kandili'},
    {id:'beraat-kandili',label:'Beraat Kandili'},
    {id:'ramadan-start',label:'Ramazan Başlangıcı'},
    {id:'kadir-gecesi',label:'Kadir Gecesi'},
    {id:'ramadan-bayrami',label:'Ramazan Bayramı'},
    {id:'kurban-bayrami',label:'Kurban Bayramı'},
    {id:'mevlid-kandili',label:'Mevlid Kandili'}
  ];
  var REMINDER_SPECIAL_DAYS_DEFINITION={
    id:REMINDER_SPECIAL_DAYS_ID,
    category:'special',
    priority:'P2',
    triggerType:'special-day',
    deepLink:'faith',
    privateTitle:'Özel bir gün için sakin bir durak',
    privateBody:'İstersen bugünü kendi ritminde anabilirsin.',
    detailKeys:['specialDayLabel','hijriDate','hijriOffset'],
    defaultWindow:{kind:'fixed-time',timezone:'user',time:'10:00',start:'10:00',end:null},
    defaultChannel:'in_app',
    snoozeOptions:['30m','1h','todayOff'],
    suppressionRules:['completed','quietHours','categoryCooldown','groupedWithHigherPriority'],
    definitionVersion:'1.0.0'
  };
  var REMINDER_SPECIAL_NATIVE_TITLE='Şeyma’da küçük bir durak hazır';
  var REMINDER_SPECIAL_NATIVE_BODY='İstersen uygulamayı açıp bugünün küçük alanına bakabilirsin.';
  var REMINDER_CARE_DEFINITIONS=[
    {id:'reminder.care.v1.water',careKey:'water',category:REMINDER_CARE_CATEGORY,priority:'P2',triggerType:'care-window',deepLink:'health',definitionVersion:'1',defaultChannel:'in_app',privateTitle:'Su için küçük bir ara',privateBody:'İstersen şimdi bir bardak suya uğrayabilirsin.',snoozeOptions:['30m','1h','todayOff'],existingSurface:'water'},
    {id:'reminder.care.v1.sleep',careKey:'sleep',category:REMINDER_CARE_CATEGORY,priority:'P2',triggerType:'care-window',deepLink:'health',definitionVersion:'1',defaultChannel:'in_app',privateTitle:'Uykuya hazırlık için küçük bir ara',privateBody:'İstersen akşam hazırlık alanını açabilirsin.',snoozeOptions:['30m','1h','thisEvening','todayOff'],existingSurface:'h-sleepprep'},
    {id:'reminder.care.v1.caffeine',careKey:'caffeine',category:REMINDER_CARE_CATEGORY,priority:'P2',triggerType:'care-window',deepLink:'health',definitionVersion:'1',defaultChannel:'in_app',privateTitle:'Kafein için günün kapanış noktası',privateBody:'İstersen kafein kartına sakince göz atabilirsin.',snoozeOptions:['30m','1h','todayOff'],existingSurface:'h-caffeine'},
    {id:'reminder.care.v1.movement',careKey:'movement',category:REMINDER_CARE_CATEGORY,priority:'P2',triggerType:'care-window',deepLink:'health',definitionVersion:'1',defaultChannel:'in_app',privateTitle:'Hareket için kısa bir ara',privateBody:'İstersen kısa bir yürüyüş veya esneme alanı açabilirsin.',snoozeOptions:['30m','1h','todayOff'],existingSurface:'soul-activity'}
  ];
  var REMINDER_POLICY_DEFAULTS={
    quietHours:{start:'22:30',end:'07:30'},
    nativeDailyCap:3,
    lowPriorityNativeCap:1,
    sameCategoryCooldownMinutes:360,
    dailyFlowBudget:3,
    capacityMode:'balanced'
  };
  var REMINDER_PROFILE_IDS={calm:true,balanced:true,supportive:true,ritual:true,custom:true};
  var REMINDER_PROFILE_LIST=[
    {id:'calm',label:'Sakin',description:'Yalnızca uygulama içi günlük kartları; native kapalı.'},
    {id:'balanced',label:'Dengeli',description:'Seçtiğin ritüeller için sınırlı native öneri; bakım uygulama içinde.'},
    {id:'supportive',label:'Destekleyici',description:'Dengeli’ye ek olarak seçili destek ve günlük davetleri.'},
    {id:'ritual',label:'Ritüel odaklı',description:'Seçtiğin ibadet, zikir veya okuma durakları öne çıkar.'},
    {id:'custom',label:'Özel',description:'Her kategori ve kanal tercihini sen belirlersin.'}
  ];
  var REMINDER_CATEGORY_META={
    ritual:{label:'Ritüel ve ibadet',description:'Namaz, zikir, ilham ve okuma durakları',icon:'sparkles'},
    support:{label:'Destek ve nefes',description:'Terapi odası ve küçük destek araçları',icon:'heart-handshake'},
    reflection:{label:'Günlük ve yansıma',description:'Günü kapatma ve sakin yazma alanı',icon:'book-open'},
    system:{label:'Sistem durumu',description:'Yalnız gerçekten eylem gerektiğinde gösterilen güvenli durumlar',icon:'circle-check'}
  };
  var REMINDER_CATEGORY_ORDER=['ritual','support','reflection','system'];
  var REMINDER_PERMISSION_STATES={unsupported:true,default:true,granted:true,denied:true,revoked:true,'temporary-error':true,error:true,'pwa-limited':true};
  var REMINDER_PERMISSION_ALIASES={prompt:'default',error:'temporary-error'};
  var REMINDER_PERMISSION_STORAGE_KEY='seyma-reminder-permission-v1';
  var REMINDER_NATIVE_PREVIEW_TAG='reminder-preview-v1';
  var REMINDER_NATIVE_TAG_PREFIX='seyma-reminder-v1:';
  var REMINDER_NATIVE_FOREGROUND_SOURCES={boot:true,foreground:true,focus:true,pageshow:true,visibilitychange:true,online:true,timer:true,manual:true};
  var REMINDER_NATIVE_ACTIONS={
    open:{title:'Aç'},
    snooze:{title:'10 dk ertele'},
    todayOff:{title:'Bugün sustur'}
  };
  var REMINDER_PERSONALIZATION_SCHEMA_VERSION=1;
  var REMINDER_PERSONALIZATION_HISTORY_MODES={none:true,local:true};
  var REMINDER_PERSONALIZATION_SIGNAL_TYPES={category:true,time:true,snooze:true,feedback:true};
  var REMINDER_PERSONALIZATION_FEEDBACK={more_quiet:true,time_wrong:true,channel_wrong:true,keep:true};
  var REMINDER_PERSONALIZATION_MAX_SIGNALS=60;
  var REMINDER_PERSONALIZATION_MAX_DISMISSED=24;
  var REMINDER_PERSONALIZATION_MAX_APPLIED=24;
  var REMINDER_DIGEST_SCHEMA_VERSION=1;
  var REMINDER_DIGEST_WINDOW_DAYS=7;
  var REMINDER_DIGEST_DEFAULT_TIMEZONE='Europe/Istanbul';
  var REMINDER_DIGEST_REFLECTIONS=[
    {id:'notice',label:'Bende ne kaldı?',prompt:'Bu hafta bende ne kaldı? İstersen tek bir kelimeyle durabilirsin.'},
    {id:'soften',label:'Neyi yavaşlatabilirim?',prompt:'Neyi biraz yavaşlatmak bana iyi gelebilir?'},
    {id:'space',label:'Kendime hangi alanı açabilirim?',prompt:'Kendime bu hafta hangi küçük alanı açabilirim?'}
  ];
  var REMINDER_RETENTION_POLICY={
    schemaVersion:1,
    preference:{mode:'until-cleared',maxAgeDays:null,maxEntries:null},
    occurrence:{mode:'derived-ephemeral',maxAgeDays:1,maxEntries:200},
    deliveryJournal:{mode:'local-bounded',maxAgeDays:30,maxEntries:200},
    notificationHistory:{mode:'local-bounded',maxAgeDays:14,maxEntries:100},
    digest:{mode:'ephemeral-local',maxAgeDays:7,maxEntries:0}
  };
  function reminderDeliveryModule(){
    try{ if(typeof window!=='undefined'&&window.ReminderDeliveryV1&&typeof window.ReminderDeliveryV1.channelForNotification==='function') return window.ReminderDeliveryV1; }catch(e){}
    return null;
  }
  function reminderNotificationChannel(input){
    var module=reminderDeliveryModule();
    if(module&&typeof module.channelForNotification==='function') return module.channelForNotification(input);
    var x=input&&typeof input==='object'?input:{}, d=x.data&&typeof x.data==='object'?x.data:{};
    var tag=String(x.tag!==undefined?x.tag:(d.tag||'')||''), type=String(d.type!==undefined?d.type:(x.type||'')||'');
    if(type==='reminder'||type==='reminder-preview'||tag===REMINDER_NATIVE_PREVIEW_TAG||tag.indexOf(REMINDER_NATIVE_TAG_PREFIX)===0) return 'reminder';
    if(type==='aeon-message'||type==='aeon-answer'||tag.indexOf('aeon-')===0) return 'aeon';
    return '';
  }
  function emptyReminderOnboarding(){ return {completed:false,selectedCategories:[]}; }
  function emptyReminderPolicy(){ return {quietHours:{start:REMINDER_POLICY_DEFAULTS.quietHours.start,end:REMINDER_POLICY_DEFAULTS.quietHours.end},nativeDailyCap:REMINDER_POLICY_DEFAULTS.nativeDailyCap,lowPriorityNativeCap:REMINDER_POLICY_DEFAULTS.lowPriorityNativeCap,sameCategoryCooldownMinutes:REMINDER_POLICY_DEFAULTS.sameCategoryCooldownMinutes,dailyFlowBudget:REMINDER_POLICY_DEFAULTS.dailyFlowBudget,capacityMode:REMINDER_POLICY_DEFAULTS.capacityMode,careNativeCategories:[],careMovementOptIn:false}; }
  function emptyReminderPersonalization(){ return {schemaVersion:REMINDER_PERSONALIZATION_SCHEMA_VERSION,optIn:false,historyMode:'none',autoApply:false,signals:[],dismissed:[],applied:[],updatedAt:''}; }
  function emptyReminderState(){ return {schemaVersion:REMINDER_PREFERENCE_SCHEMA_VERSION,preferences:{},profile:'balanced',onboarding:emptyReminderOnboarding(),policy:emptyReminderPolicy(),specialDays:emptyReminderSpecialDays(),medications:[],personalization:emptyReminderPersonalization(),_localMeta:{}}; }
  function reminderLocalClone(value){ try{ return JSON.parse(JSON.stringify(value)); }catch(e){ return null; } }
  function stripReminderReservedRoots(target){
    if(!target||typeof target!=='object'||Array.isArray(target)) return target;
    Object.keys(REMINDER_RESERVED_JOURNAL_ROOTS).forEach(function(key){ if(Object.prototype.hasOwnProperty.call(target,key)) delete target[key]; });
    return target;
  }
  function reminderRetentionPolicySnapshot(){ return reminderLocalClone(REMINDER_RETENTION_POLICY)||{schemaVersion:1,preference:{mode:'until-cleared',maxAgeDays:null,maxEntries:null},occurrence:{mode:'derived-ephemeral',maxAgeDays:1,maxEntries:200},deliveryJournal:{mode:'local-bounded',maxAgeDays:30,maxEntries:200},notificationHistory:{mode:'local-bounded',maxAgeDays:14,maxEntries:100},digest:{mode:'ephemeral-local',maxAgeDays:7,maxEntries:0}}; }
  function reminderLocalMeta(root){
    if(!root||typeof root!=='object'||Array.isArray(root)) return {};
    if(!root._localMeta||typeof root._localMeta!=='object'||Array.isArray(root._localMeta)) root._localMeta={};
    return root._localMeta;
  }
  function reminderLocalTouch(root,scope,at){
    var iso=validReminderIso(at)?new Date(at).toISOString():new Date().toISOString(), meta=reminderLocalMeta(root);
    if(['preferences','profile','onboarding','policy','specialDays','medications','personalization'].indexOf(String(scope||''))>=0) meta[String(scope)]=iso;
    return iso;
  }
  function reminderLocalStamp(root,scope,fallback){
    var meta=root&&root._localMeta&&typeof root._localMeta==='object'?root._localMeta:{}, at=meta[String(scope||'')];
    return validReminderIso(at)?new Date(at).toISOString():(validReminderIso(fallback)?new Date(fallback).toISOString():'');
  }
  function reminderLocalChoose(localValue,remoteValue,localAt,remoteAt){
    if(localValue===undefined) return reminderLocalClone(remoteValue);
    if(remoteValue===undefined) return reminderLocalClone(localValue);
    var l=validReminderIso(localAt)?new Date(localAt).getTime():null, r=validReminderIso(remoteAt)?new Date(remoteAt).getTime():null;
    return r!==null&&l!==null&&r>l?reminderLocalClone(remoteValue):reminderLocalClone(localValue);
  }
  function reminderLocalChooseScope(localValue,remoteValue,localRoot,remoteRoot,scope,localSavedAt,remoteSavedAt){
    var localMeta=localRoot&&localRoot._localMeta&&typeof localRoot._localMeta==='object'?localRoot._localMeta:{}, remoteMeta=remoteRoot&&remoteRoot._localMeta&&typeof remoteRoot._localMeta==='object'?remoteRoot._localMeta:{}, localAt=validReminderIso(localMeta[String(scope||'')])?localMeta[String(scope||'')]:'' , remoteAt=validReminderIso(remoteMeta[String(scope||'')])?remoteMeta[String(scope||'')]:'';
    // An explicit scope edit outranks a stale tab's later full-save timestamp.
    // Only when neither side has a scope marker do we fall back to snapshot time.
    if(remoteAt&&!localAt) return reminderLocalClone(remoteValue);
    if(localAt&&!remoteAt) return reminderLocalClone(localValue);
    return reminderLocalChoose(localValue,remoteValue,localAt||localSavedAt,remoteAt||remoteSavedAt);
  }
  function reminderLocalMergePreference(localValue,remoteValue,localSavedAt,remoteSavedAt){
    if(localValue===undefined) return reminderLocalClone(remoteValue);
    if(remoteValue===undefined) return reminderLocalClone(localValue);
    var localAt=localValue&&localValue.lastEditedAt, remoteAt=remoteValue&&remoteValue.lastEditedAt;
    // Explicit preference edits already carry their own timestamp. A legacy
    // preference without one yields to a persisted, timestamped edit; it must
    // never erase a newer choice merely because an old tab saved the full state.
    if(validReminderIso(remoteAt)&&(!validReminderIso(localAt)||remoteAt>localAt)) return reminderLocalClone(remoteValue);
    if(validReminderIso(localAt)&&(!validReminderIso(remoteAt)||localAt>=remoteAt)) return reminderLocalClone(localValue);
    return reminderLocalChoose(localValue,remoteValue,localSavedAt,remoteSavedAt);
  }
  function reminderLocalMergeList(localList,remoteList,localSavedAt,remoteSavedAt){
    var local=Array.isArray(localList)?localList:[], remote=Array.isArray(remoteList)?remoteList:[], out=[], byId={};
    local.forEach(function(item){ if(item&&item.id){ byId[String(item.id)]=reminderLocalClone(item); } });
    remote.forEach(function(item){
      if(!item||!item.id){ return; }
      var id=String(item.id), existing=byId[id];
      if(!existing){ byId[id]=reminderLocalClone(item); return; }
      var localAt=existing.updatedAt, remoteAt=item.updatedAt;
      if(validReminderIso(remoteAt)&&(!validReminderIso(localAt)||remoteAt>localAt)) byId[id]=reminderLocalClone(item);
    });
    Object.keys(byId).forEach(function(id){ out.push(byId[id]); });
    if(!out.length&&local.length!==remote.length){
      return reminderLocalChoose(local,remote,localSavedAt,remoteSavedAt)||[];
    }
    return out;
  }
  function reminderLocalChooseList(localList,remoteList,localRoot,remoteRoot,localSavedAt,remoteSavedAt){
    var localAt=reminderLocalStamp(localRoot,'medications',''), remoteAt=reminderLocalStamp(remoteRoot,'medications','');
    // A medication delete is a real local edit, not an empty list to union
    // back with a stale tab. Prefer the newest explicit list edit; only legacy
    // roots without a marker use the additive item merge.
    if(localAt&&!remoteAt) return reminderLocalClone(localList)||[];
    if(remoteAt&&!localAt) return reminderLocalClone(remoteList)||[];
    if(localAt||remoteAt) return reminderLocalChoose(localList,remoteList,localAt,remoteAt)||[];
    return reminderLocalMergeList(localList,remoteList,localSavedAt,remoteSavedAt);
  }
  function mergeReminderLocalState(localRoot,remoteRoot,localSavedAt,remoteSavedAt){
    var local=localRoot&&typeof localRoot==='object'&&!Array.isArray(localRoot)?reminderLocalClone(localRoot):null;
    var remote=remoteRoot&&typeof remoteRoot==='object'&&!Array.isArray(remoteRoot)?reminderLocalClone(remoteRoot):null;
    // A newer/malformed root is opaque. Do not flatten it into the v1 merge
    // shape; a newer app can still recover the preserved local object later.
    if(local&&!reminderSchemaCompatibility(local).supported) return local;
    if(remote&&!reminderSchemaCompatibility(remote).supported) return local||remote;
    if(!local) return remote||emptyReminderState();
    if(!remote) return local;
    var out=local, localMeta=local._localMeta&&typeof local._localMeta==='object'?local._localMeta:{}, remoteMeta=remote._localMeta&&typeof remote._localMeta==='object'?remote._localMeta:{};
    out.schemaVersion=Math.max(Number(out.schemaVersion)||REMINDER_PREFERENCE_SCHEMA_VERSION,Number(remote.schemaVersion)||REMINDER_PREFERENCE_SCHEMA_VERSION);
    out.preferences=out.preferences&&typeof out.preferences==='object'&&!Array.isArray(out.preferences)?out.preferences:{};
    var remotePreferences=remote.preferences&&typeof remote.preferences==='object'&&!Array.isArray(remote.preferences)?remote.preferences:{};
    Object.keys(remotePreferences).forEach(function(id){ out.preferences[id]=reminderLocalMergePreference(out.preferences[id],remotePreferences[id],localSavedAt,remoteSavedAt); });
    ['profile','onboarding','policy','specialDays','personalization'].forEach(function(scope){
      var chosen=reminderLocalChooseScope(out[scope],remote[scope],local,remote,scope,localSavedAt,remoteSavedAt);
      if(chosen!==undefined) out[scope]=chosen;
    });
    out.medications=reminderLocalChooseList(out.medications,remote.medications,local,remote,localSavedAt,remoteSavedAt);
    var localMetaSnapshot=reminderLocalClone(localMeta)||{}, remoteMetaSnapshot=reminderLocalClone(remoteMeta)||{};
    out._localMeta={};
    Object.keys(localMetaSnapshot).concat(Object.keys(remoteMetaSnapshot)).forEach(function(scope){
      var at=validReminderIso(localMetaSnapshot[scope])?new Date(localMetaSnapshot[scope]).toISOString():'', remoteAt=validReminderIso(remoteMetaSnapshot[scope])?new Date(remoteMetaSnapshot[scope]).toISOString():'';
      out._localMeta[scope]=at&&remoteAt?(remoteAt>at?remoteAt:at):(at||remoteAt||'');
    });
    return out;
  }
  function reminderMedicationText(value,max){ return String(value==null?'':value).replace(/\u0000/g,'').replace(/\r\n?/g,'\n').trim().slice(0,max); }
  function reminderMedicationId(value){ var id=String(value||''); return /^reminder\.medication\.v1\.[A-Za-z0-9._%-]{1,160}$/.test(id)?id:''; }
  function reminderMedicationNewId(nowIso){
    var stamp=String(Date.parse(nowIso||'')||Date.now().valueOf()).replace(/[^0-9]/g,'');
    return REMINDER_MEDICATION_ID_PREFIX+stamp+'-'+Math.floor(Math.random()*1000000).toString(36);
  }
  function normalizeReminderMedication(value,options){
    var x=value&&typeof value==='object'&&!Array.isArray(value)?value:{}, opts=options&&typeof options==='object'?options:{}, nowIso=validReminderIso(opts.nowIso)?opts.nowIso:'';
    var id=reminderMedicationId(x.id); if(!id&&opts.generateId===true) id=reminderMedicationNewId(nowIso); if(!id) return null;
    var name=reminderMedicationText(x.name,REMINDER_MEDICATION_NAME_MAX), time=String(x.time||'').trim(), label=reminderMedicationText(x.privateLabel,REMINDER_MEDICATION_LABEL_MAX), note=reminderMedicationText(x.note,REMINDER_MEDICATION_NOTE_MAX);
    if(!name||!validReminderTime(time)) return null;
    var kind=String(x.kind||'medication'); if(kind!=='medication'&&kind!=='supplement') kind='medication';
    var timezone=validReminderTimezone(x.timezone)?String(x.timezone):REMINDER_ENGINE_DEFAULT_TIMEZONE;
    var createdAt=validReminderIso(x.createdAt)?new Date(x.createdAt).toISOString():nowIso, updatedAt=validReminderIso(x.updatedAt)?new Date(x.updatedAt).toISOString():createdAt;
    return {id:id,kind:kind,name:name,privateLabel:label,time:time,note:note,timezone:timezone,enabled:x.enabled!==false,createdAt:createdAt,updatedAt:updatedAt};
  }
  function normalizeReminderMedications(value,options){
    var source=Array.isArray(value)?value:[], out=[], seen={}, opts=options&&typeof options==='object'?options:{};
    source.forEach(function(item){ var normalized=normalizeReminderMedication(item,opts); if(normalized&&!seen[normalized.id]&&out.length<REMINDER_MEDICATION_MAX_SCHEDULES){ seen[normalized.id]=true; out.push(normalized); } });
    return out;
  }
  function normalizeReminderProfile(value){ return reminderEnumHas(REMINDER_PROFILE_IDS,value)?value:'balanced'; }
  function normalizeReminderCategories(value){
    var out=[],seen={};
    if(!Array.isArray(value)) return out;
    value.forEach(function(category){
      category=String(category||'');
      if(REMINDER_CATEGORY_META[category]&&!seen[category]&&out.length<3){ seen[category]=true; out.push(category); }
    });
    return out;
  }
  function normalizeReminderCareCategories(value){
    var out=[],seen={};
    if(!Array.isArray(value)) return out;
    value.forEach(function(category){
      category=String(category||'');
      if(REMINDER_CARE_KEYS.indexOf(category)>=0&&!seen[category]&&out.length<2){ seen[category]=true; out.push(category); }
    });
    return out;
  }
  function reminderSpecialDayOptionById(id){
    var key=String(id||'');
    for(var i=0;i<REMINDER_SPECIAL_DAY_OPTIONS.length;i++) if(REMINDER_SPECIAL_DAY_OPTIONS[i].id===key) return REMINDER_SPECIAL_DAY_OPTIONS[i];
    return null;
  }
  function reminderSpecialDayId(label){
    var text=String(label||'');
    for(var i=0;i<REMINDER_SPECIAL_DAY_OPTIONS.length;i++) if(REMINDER_SPECIAL_DAY_OPTIONS[i].label===text) return REMINDER_SPECIAL_DAY_OPTIONS[i].id;
    return '';
  }
  function normalizeReminderSpecialDaySelection(value){
    var source=Array.isArray(value)?value:[], out=[], seen={};
    source.forEach(function(item){
      var id=reminderSpecialDayOptionById(item)?String(item):reminderSpecialDayId(item);
      if(id&&!seen[id]){ seen[id]=true; out.push(id); }
    });
    return out;
  }
  function normalizeReminderSpecialDays(value){
    var out=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
    if(!reminderEnumHas(REMINDER_SPECIAL_DAYS_MODES,out.mode)) out.mode='none';
    out.selectedDays=normalizeReminderSpecialDaySelection(out.selectedDays);
    if(!validReminderTime(out.time)) out.time='10:00';
    if(!validReminderTimezone(out.timezone)) out.timezone='Europe/Istanbul';
    if(!reminderEnumHas(REMINDER_CHANNELS,out.channel)) out.channel='in_app';
    return out;
  }
  function emptyReminderSpecialDays(){ return {mode:'none',selectedDays:[],time:'10:00',timezone:'Europe/Istanbul',channel:'in_app'}; }
  function normalizeReminderOnboarding(value){
    var out=value&&typeof value==='object'&&!Array.isArray(value)?value:emptyReminderOnboarding();
    if(typeof out.completed!=='boolean') out.completed=false;
    out.selectedCategories=normalizeReminderCategories(out.selectedCategories);
    return out;
  }
  function reminderPermissionExplanation(state){
    var key=reminderPermissionState({state:state});
    var copy={
      unsupported:{label:reminderCopy('inApp.permission.unsupported.label','Desteklenmiyor'),meaning:reminderCopy('inApp.permission.unsupported.meaning','Bu tarayıcı native bildirim sunmuyor.'),action:reminderCopy('inApp.permission.unsupported.action','Uygulama içi hatırlatmaları kullan.'),tone:'neutral'},
      'default':{label:reminderCopy('inApp.permission.default.label','Henüz sorulmadı'),meaning:reminderCopy('inApp.permission.default.meaning','Native bildirim izni henüz seçilmedi.'),action:reminderCopy('inApp.permission.default.action','İzin açıklamasını incele; bu ekranda izin istenmez.'),tone:'neutral'},
      granted:{label:reminderCopy('inApp.permission.granted.label','Verildi'),meaning:reminderCopy('inApp.permission.granted.meaning','Native kanal kullanılabilir.'),action:reminderCopy('inApp.permission.granted.action','Uygulama içi kartlar yine açık kalır; gerçek gönderim ayrı bir adımda yönetilir.'),tone:'positive'},
      denied:{label:reminderCopy('inApp.permission.denied.label','Reddedildi'),meaning:reminderCopy('inApp.permission.denied.meaning','Tarayıcı izni kapalı.'),action:reminderCopy('inApp.permission.denied.action','Tarayıcı ayarlarından açabilirsin; uygulama içi hatırlatmalar açık kalır.'),tone:'caution'},
      'temporary-error':{label:reminderCopy('inApp.permission.temporaryError.label','Geçici hata'),meaning:reminderCopy('inApp.permission.temporaryError.meaning','Bildirim gönderme anında geçici bir hata oldu.'),action:reminderCopy('inApp.permission.temporaryError.action','Yeniden denenebilir; uygulama içi kart korunur.'),tone:'caution'},
      'pwa-limited':{label:reminderCopy('inApp.permission.pwaLimited.label','PWA sınırlaması'),meaning:reminderCopy('inApp.permission.pwaLimited.meaning','Uygulama kapalıyken zamanlama garanti edilemiyor.'),action:reminderCopy('inApp.permission.pwaLimited.action','Uygulamayı açınca catch-up kartını görebilirsin.'),tone:'caution'},
      revoked:{label:reminderCopy('inApp.permission.revoked.label','Geri alındı'),meaning:reminderCopy('inApp.permission.revoked.meaning','Daha önce verilen native izin şu anda kapalı görünüyor.'),action:reminderCopy('inApp.permission.revoked.action','İstersen buradan yeniden verebilirsin; uygulama içi hatırlatmalar açık kalır.'),tone:'caution'}
    };
    var out=copy[key]||copy['temporary-error']; out.state=key; return out;
  }
  function reminderNativeSafeCopy(input){
    var x=input&&typeof input==='object'?input:{}, definition=x.definition&&typeof x.definition==='object'?x.definition:{}, occurrence=x.occurrence&&typeof x.occurrence==='object'?x.occurrence:{};
    // Preview is always synthetic: occurrence/native fields may contain private user copy.
    var title=reminderCopy('native.generic.title','Şeyma’da küçük bir durak hazır').trim();
    var body=reminderCopy('native.generic.body','İstersen uygulamayı açıp bugünün küçük alanına bakabilirsin.').trim();
    return {title:title.slice(0,80),body:body.slice(0,180),tag:REMINDER_NATIVE_PREVIEW_TAG,deepLink:String(x.deepLink||occurrence.deepLink||definition.deepLink||'settings')};
  }
  function reminderNativeActionList(){
    return Object.keys(REMINDER_NATIVE_ACTIONS).map(function(action){ return {action:action,title:REMINDER_NATIVE_ACTIONS[action].title}; });
  }
  function reminderNativeTag(occurrenceId){
    var module=reminderDeliveryModule();
    if(module&&typeof module.deliveryTag==='function') return module.deliveryTag(occurrenceId);
    var id=reminderActionSafeToken(occurrenceId,240); if(!id) return '';
    return (REMINDER_NATIVE_TAG_PREFIX+encodeURIComponent(id)).slice(0,220);
  }
  function reminderNativeTargetView(target){
    var t=target&&typeof target==='object'?target:{};
    return {deepLink:String(t.deepLink||''),targetId:String(t.targetId||''),kind:String(t.kind||''),openDetail:t.openDetail===true,therapyToolId:String(t.therapyToolId||'')};
  }
  function reminderNativeDeliveryCopy(input){
    var x=input&&typeof input==='object'?input:{}, occurrence=x.occurrence&&typeof x.occurrence==='object'?x.occurrence:{}, reminderId=String(x.reminderId||occurrence.reminderId||(x.definition&&x.definition.id)||''), occurrenceId=reminderActionSafeToken(x.occurrenceId||occurrence.occurrenceId||occurrence.id,240), definition=reminderActionDefinition(reminderId);
    if(!reminderId||!occurrenceId||!definition) return {ok:false,reason:'invalid-native-payload'};
    var canonicalDeepLink=String(definition.deepLink||''), suppliedDeepLink=String(x.deepLink||occurrence.deepLink||'');
    if(!REMINDER_DEEP_LINK_TARGETS[canonicalDeepLink]||suppliedDeepLink&&suppliedDeepLink!==canonicalDeepLink) return {ok:false,reason:'target-mismatch'};
    var target=reminderDeepLinkTarget({reminderId:reminderId,deepLink:canonicalDeepLink,occurrence:occurrence,openDetail:occurrence.openDetail===true});
    if(!target.ok) return {ok:false,reason:'unknown-reminder-target'};
    var safe=null;
    if(reminderId===REMINDER_THERAPY_ID) safe=reminderTherapyPrivateCopy({occurrence:occurrence},definition);
    else if(reminderId===REMINDER_SAYGI_ID) safe=reminderSaygiPrivateCopy({occurrence:occurrence},definition);
    else if(reminderId.indexOf(REMINDER_MEDICATION_ID_PREFIX)===0) safe=reminderMedicationNativeCopy({occurrence:occurrence});
    if(!safe) safe={title:String(definition.privateTitle||''),detail:String(definition.privateBody||''),deepLink:canonicalDeepLink};
    if(!safe.title||!safe.detail) return {ok:false,reason:'missing-safe-copy'};
    var snoozeOptions=(Array.isArray(definition.snoozeOptions)?definition.snoozeOptions:[]).filter(function(option){ return reminderEnumHas(REMINDER_SNOOZE_OPTIONS,String(option)); }), defaultSnooze=snoozeOptions.indexOf('10m')>=0?'10m':(snoozeOptions[0]||'');
    return {ok:true,reason:null,reminderId:reminderId,occurrenceId:occurrenceId,title:String(safe.title).slice(0,80),body:String(safe.detail).slice(0,180),tag:reminderNativeTag(occurrenceId),deepLink:target.deepLink,target:reminderNativeTargetView(target),timezone:reminderEngineTimezoneValid(String(occurrence.timezone||''))?String(occurrence.timezone):REMINDER_ENGINE_DEFAULT_TIMEZONE,snoozeOptions:snoozeOptions,defaultSnoozeOption:defaultSnooze};
  }
  function reminderNativePayload(copy){
    var target=copy&&copy.target&&typeof copy.target==='object'?copy.target:{};
    return {type:'reminder',occurrenceId:copy.occurrenceId,reminderId:copy.reminderId,deepLink:copy.deepLink,targetId:target.targetId,openDetail:target.openDetail===true,therapyToolId:target.therapyToolId||'',timezone:copy.timezone||REMINDER_ENGINE_DEFAULT_TIMEZONE,mainAction:'open',snoozeAction:'snooze',snoozeOption:copy.defaultSnoozeOption||'',muteAction:'todayOff'};
  }
  function reminderProfileById(id){
    var key=normalizeReminderProfile(id);
    for(var i=0;i<REMINDER_PROFILE_LIST.length;i++) if(REMINDER_PROFILE_LIST[i].id===key) return REMINDER_PROFILE_LIST[i];
    return REMINDER_PROFILE_LIST[1];
  }
  function reminderProfileChannel(profileId,category,enabled){
    if(!enabled) return 'in_app';
    if((profileId==='balanced'||profileId==='supportive'||profileId==='ritual')&&category==='ritual') return 'native';
    return 'in_app';
  }
  function reminderCategoryIds(){
    var out=[],seen={};
    REMINDER_CATEGORY_ORDER.forEach(function(category){ if(REMINDER_CATEGORY_META[category]){ seen[category]=true; out.push(category); } });
    if(typeof reminderDefinitions==='function') reminderDefinitions().forEach(function(def){ var category=String(def&&def.category||''); if(category&&!seen[category]){ seen[category]=true; out.push(category); } });
    return out;
  }
  function reminderCategoryMeta(category){
    if(String(category||'')===REMINDER_CARE_CATEGORY) return {label:'Günlük bakım',description:'Su, uykuya hazırlık, kafein ve isteğe bağlı hareket',icon:'heart-pulse'};
    if(String(category||'')==='health') return {label:'Kişisel sağlık saati',description:'Yalnızca senin kurduğun ilaç veya takviye zamanı',icon:'pill'};
    if(String(category||'')==='special') return {label:'Özel günler ve Hicri takvim',description:'Seçtiğin Hicri günler için sakin uygulama içi duraklar',icon:'moon-star'};
    return REMINDER_CATEGORY_META[category]||{label:category,description:'Hatırlatma kategorisi',icon:'bell-ring'};
  }
  function reminderCategorySelection(root){
    var selected=root&&root.onboarding?normalizeReminderCategories(root.onboarding.selectedCategories):[];
    if(selected.length) return selected;
    var derived=[],seen={};
    if(root&&root.preferences) Object.keys(root.preferences).forEach(function(id){
      var pref=root.preferences[id], def=typeof ReminderCatalogV1!=='undefined'&&ReminderCatalogV1.get?ReminderCatalogV1.get(id):null;
      if(pref&&pref.enabled&&def&&!seen[def.category]&&derived.length<3){ seen[def.category]=true; derived.push(def.category); }
    });
    return derived;
  }
  function reminderMergeProfileSuggestions(root,profileId,selectedCategories){
    if(!root) return;
    var selected=normalizeReminderCategories(selectedCategories), defs=typeof reminderDefinitions==='function'?reminderDefinitions():[];
    root.profile=normalizeReminderProfile(profileId);
    defs.forEach(function(def){
      if(!def||!def.id) return;
      var id=String(def.id), existing=root.preferences[id], pref=existing&&typeof existing==='object'&&!Array.isArray(existing)?existing:{};
      var enabled=selected.indexOf(String(def.category||''))>=0;
      if(!Object.prototype.hasOwnProperty.call(pref,'reminderId')) pref.reminderId=id;
      if(!Object.prototype.hasOwnProperty.call(pref,'enabled')) pref.enabled=enabled;
      if(!Object.prototype.hasOwnProperty.call(pref,'privacyMode')) pref.privacyMode='private';
      if(!Object.prototype.hasOwnProperty.call(pref,'channel')) pref.channel=reminderProfileChannel(root.profile,String(def.category||''),enabled);
      root.preferences[id]=normalizeReminderPreference(id,pref);
    });
  }
  function reminderEnsurePreference(root,id){
    var pref=root.preferences[id];
    if(!pref||typeof pref!=='object'||Array.isArray(pref)) pref={};
    if(!Object.prototype.hasOwnProperty.call(pref,'reminderId')) pref.reminderId=id;
    if(!Object.prototype.hasOwnProperty.call(pref,'enabled')) pref.enabled=false;
    if(!Object.prototype.hasOwnProperty.call(pref,'privacyMode')) pref.privacyMode='private';
    if(!Object.prototype.hasOwnProperty.call(pref,'channel')) pref.channel='in_app';
    root.preferences[id]=normalizeReminderPreference(id,pref);
    return root.preferences[id];
  }
  function reminderSpecialDaysState(root){
    var state=normalizeReminderSpecialDays(root&&root.specialDays); if(root) root.specialDays=state; return state;
  }
  function reminderSpecialDaysCommit(root,state,nowIso){
    var next=normalizeReminderSpecialDays(state), pref=reminderEnsurePreference(root,REMINDER_SPECIAL_DAYS_ID), recordedAt=validReminderIso(nowIso)?nowIso:new Date().toISOString();
    root.specialDays=next;
    pref.enabled=next.mode!=='none'; pref.channel=next.channel; pref.timezone=next.timezone; pref.time=next.time; pref.lastEditedAt=recordedAt; pref.specialDayMode=next.mode; pref.selectedDays=next.selectedDays.slice();
    root.preferences[REMINDER_SPECIAL_DAYS_ID]=normalizeReminderPreference(REMINDER_SPECIAL_DAYS_ID,pref);
    reminderLocalTouch(root,'specialDays',recordedAt);
    return next;
  }
  function validReminderTime(value){
    if(typeof value!=='string'||!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) return false;
    return true;
  }
  function validReminderTimezone(value){
    if(typeof value!=='string'||!value.trim()) return false;
    try{ new Intl.DateTimeFormat('en-US',{timeZone:value}).format(new Date(0)); return true; }catch(e){ return false; }
  }
  function validReminderIso(value){ return typeof value==='string'&&!!value&&isFinite(Date.parse(value)); }
  function reminderEnumHas(map,value){ return typeof value==='string'&&Object.prototype.hasOwnProperty.call(map,value); }
  function normalizeReminderPreference(id,value){
    var out=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
    // Map key is the canonical identity; a malformed/mismatched embedded ID cannot
    // create a second owner for the same preference.
    out.reminderId=String(id);
    if(typeof out.enabled!=='boolean') out.enabled=false;
    if(!reminderEnumHas(REMINDER_PRIVACY_MODES,out.privacyMode)) out.privacyMode='private';
    if(Object.prototype.hasOwnProperty.call(out,'daysOfWeek')){
      if(!Array.isArray(out.daysOfWeek)) delete out.daysOfWeek;
      else {
        var days=[], seenDays={};
        out.daysOfWeek.forEach(function(day){
          if(Number.isInteger(day)&&day>=0&&day<=6&&!seenDays[day]){ seenDays[day]=true; days.push(day); }
        });
        days.sort(function(a,b){ return a-b; }); out.daysOfWeek=days;
      }
    }
    if(Object.prototype.hasOwnProperty.call(out,'timeWindow')){
      if(!out.timeWindow||typeof out.timeWindow!=='object'||Array.isArray(out.timeWindow)) delete out.timeWindow;
      else {
        if(Object.prototype.hasOwnProperty.call(out.timeWindow,'start')&&!validReminderTime(out.timeWindow.start)) delete out.timeWindow.start;
        if(Object.prototype.hasOwnProperty.call(out.timeWindow,'end')&&!validReminderTime(out.timeWindow.end)) delete out.timeWindow.end;
      }
    }
    if(Object.prototype.hasOwnProperty.call(out,'offsetMinutes')&&
       (!Number.isInteger(out.offsetMinutes)||out.offsetMinutes<-1440||out.offsetMinutes>1440)) delete out.offsetMinutes;
    if(Object.prototype.hasOwnProperty.call(out,'timezone')&&!validReminderTimezone(out.timezone)) delete out.timezone;
    if(Object.prototype.hasOwnProperty.call(out,'channel')&&!reminderEnumHas(REMINDER_CHANNELS,out.channel)) delete out.channel;
    if(Object.prototype.hasOwnProperty.call(out,'quietHoursBehavior')&&!reminderEnumHas(REMINDER_QUIET_BEHAVIORS,out.quietHoursBehavior)) delete out.quietHoursBehavior;
    if(Object.prototype.hasOwnProperty.call(out,'maxPerDay')&&
       (!Number.isInteger(out.maxPerDay)||out.maxPerDay<0||out.maxPerDay>24)) delete out.maxPerDay;
    if(Object.prototype.hasOwnProperty.call(out,'snoozeOptions')){
      if(!Array.isArray(out.snoozeOptions)) delete out.snoozeOptions;
      else out.snoozeOptions=out.snoozeOptions.filter(function(option){ return reminderEnumHas(REMINDER_SNOOZE_OPTIONS,option); });
    }
    if(Object.prototype.hasOwnProperty.call(out,'lastEditedAt')&&!validReminderIso(out.lastEditedAt)) delete out.lastEditedAt;
    else if(Object.prototype.hasOwnProperty.call(out,'lastEditedAt')) out.lastEditedAt=new Date(out.lastEditedAt).toISOString();
    return out;
  }
  function normalizeReminderPolicy(value){
    var out=value&&typeof value==='object'&&!Array.isArray(value)?value:emptyReminderPolicy();
    var quiet=out.quietHours&&typeof out.quietHours==='object'&&!Array.isArray(out.quietHours)?out.quietHours:{};
    if(!validReminderTime(quiet.start)) quiet.start=REMINDER_POLICY_DEFAULTS.quietHours.start;
    if(!validReminderTime(quiet.end)) quiet.end=REMINDER_POLICY_DEFAULTS.quietHours.end;
    out.quietHours=quiet;
    var nativeCap=Object.prototype.hasOwnProperty.call(out,'nativeDailyCap')?out.nativeDailyCap:out.dailyCap;
    var lowCap=Object.prototype.hasOwnProperty.call(out,'lowPriorityNativeCap')?out.lowPriorityNativeCap:out.lowPriorityCap;
    var cooldown=Object.prototype.hasOwnProperty.call(out,'sameCategoryCooldownMinutes')?out.sameCategoryCooldownMinutes:out.categoryCooldownMinutes;
    out.nativeDailyCap=reminderPolicyInteger(nativeCap,0,24,REMINDER_POLICY_DEFAULTS.nativeDailyCap);
    out.lowPriorityNativeCap=reminderPolicyInteger(lowCap,0,24,REMINDER_POLICY_DEFAULTS.lowPriorityNativeCap);
    out.sameCategoryCooldownMinutes=reminderPolicyInteger(cooldown,0,1440,REMINDER_POLICY_DEFAULTS.sameCategoryCooldownMinutes);
    out.dailyFlowBudget=reminderPolicyInteger(out.dailyFlowBudget,0,24,REMINDER_POLICY_DEFAULTS.dailyFlowBudget);
    if(!reminderEnumHas(REMINDER_CAPACITY_MODES,out.capacityMode)) out.capacityMode=REMINDER_POLICY_DEFAULTS.capacityMode;
    out.careNativeCategories=normalizeReminderCareCategories(out.careNativeCategories);
    out.careMovementOptIn=out.careMovementOptIn===true;
    return out;
  }
  function reminderPersonalizationSafeToken(value,max){ var text=String(value==null?'':value); return text&&text.length<=(max||220)&&/^[A-Za-z0-9._:%-]+$/.test(text)?text:''; }
  function reminderPersonalizationReminderId(value){ var text=String(value==null?'':value); return /^reminder\.[A-Za-z0-9._:%-]{1,220}$/.test(text)?text:''; }
  function reminderPersonalizationSignalSource(type){ return {category:'explicit-category-choice',time:'explicit-time-choice',snooze:'explicit-snooze',feedback:'explicit-feedback'}[String(type||'')]||''; }
  function reminderPersonalizationSignalValue(type,value){
    var key=String(type||''), text=String(value==null?'':value);
    if(key==='category'&&['enabled','disabled','channel_in_app','channel_native'].indexOf(text)>=0) return text;
    if(key==='time'&&(validReminderTime(text)||/^(?:[01]\d|2[0-3]):[0-5]\d-(?:[01]\d|2[0-3]):[0-5]\d$/.test(text))) return text;
    if(key==='snooze'&&reminderEnumHas(REMINDER_SNOOZE_OPTIONS,text)) return text;
    if(key==='feedback'&&reminderEnumHas(REMINDER_PERSONALIZATION_FEEDBACK,text)) return text;
    return '';
  }
  function reminderPersonalizationSignalNormalize(value){
    var x=value&&typeof value==='object'&&!Array.isArray(value)?value:{}, type=String(x.type||''), source=String(x.source||'');
    if(!REMINDER_PERSONALIZATION_SIGNAL_TYPES[type]||source!==reminderPersonalizationSignalSource(type)) return null;
    var signalValue=reminderPersonalizationSignalValue(type,x.value), reminderId=reminderPersonalizationReminderId(x.reminderId);
    if(!signalValue||(type!=='feedback'&&!reminderId)||(type==='feedback'&&x.reminderId&&!reminderId)||!validReminderIso(x.recordedAt)) return null;
    var recordedAt=new Date(x.recordedAt).toISOString(), signalId=reminderPersonalizationSafeToken(x.signalId,280);
    if(!signalId) signalId='reminder-personalization-signal-v1:'+type+':'+(reminderId||'global')+':'+signalValue+':'+recordedAt;
    return {signalId:signalId.slice(0,280),type:type,source:source,reminderId:reminderId,value:signalValue,recordedAt:recordedAt};
  }
  function reminderPersonalizationReasonLabel(code){
    var labels={snooze_mismatch:'Aynı durak için üç açık erteleme seçimi, zamanın veya yoğunluğun sana uymadığını gösteriyor olabilir.',more_quiet:'Açık “daha sakin olsun” geri bildirimin, bugünün akışını hafifletmeyi öneriyor.',channel_wrong:'Açık kanal geri bildirimin, bu durağı uygulama içinde tutmayı öneriyor.'};
    return labels[String(code||'')]||'Bu öneri yalnızca açık tercih sinyallerine dayanır.';
  }
  function reminderPersonalizationSourceLabel(source){ return ({'explicit-category-choice':'Açık kategori seçimi','explicit-time-choice':'Açık saat seçimi','explicit-snooze':'Açık erteleme seçimi','explicit-feedback':'Açık geri bildirim'})[String(source||'')]||'Açık kullanıcı seçimi'; }
  function reminderPersonalizationSourceSignals(value){ var source=Array.isArray(value)?value:[],out=[],seen={}; source.forEach(function(item){ var id=reminderPersonalizationSafeToken(item,280); if(id&&!seen[id]&&out.length<6){ seen[id]=true; out.push(id); } }); return out; }
  function reminderPersonalizationAppliedNormalize(value){
    var x=value&&typeof value==='object'&&!Array.isArray(value)?value:{}, kind=String(x.kind||''), field=String(x.field||''), suggestionId=reminderPersonalizationSafeToken(x.suggestionId,280), reminderId=reminderPersonalizationReminderId(x.reminderId), previous=String(x.previousValue||''), proposed=String(x.proposedValue||'');
    if((kind!=='channel'&&kind!=='capacity')||((kind==='channel'&&field!=='channel')||(kind==='capacity'&&field!=='capacityMode'))||!suggestionId||!validReminderIso(x.appliedAt)||['accepted','undone'].indexOf(String(x.status||''))<0) return null;
    if(kind==='channel'&&(previous!=='native'||proposed!=='in_app'||!reminderId)) return null;
    if(kind==='capacity'&&((previous!=='balanced'&&previous!=='ritual')||proposed!=='light')) return null;
    return {suggestionId:suggestionId,kind:kind,reminderId:reminderId,field:field,previousValue:previous,proposedValue:proposed,reasonCode:reminderEnumHas({snooze_mismatch:true,more_quiet:true,channel_wrong:true},x.reasonCode)?String(x.reasonCode):'more_quiet',sourceSignals:reminderPersonalizationSourceSignals(x.sourceSignals),appliedAt:new Date(x.appliedAt).toISOString(),undoneAt:validReminderIso(x.undoneAt)?new Date(x.undoneAt).toISOString():'',status:String(x.status)};
  }
  function reminderPersonalizationClone(value){ try{ return JSON.parse(JSON.stringify(value)); }catch(e){ return {}; } }
  function normalizeReminderPersonalization(value){
    var x=value&&typeof value==='object'&&!Array.isArray(value)?value:{}, out=emptyReminderPersonalization();
    out.schemaVersion=Number.isInteger(x.schemaVersion)&&x.schemaVersion>=REMINDER_PERSONALIZATION_SCHEMA_VERSION?x.schemaVersion:REMINDER_PERSONALIZATION_SCHEMA_VERSION; out.optIn=x.optIn===true; out.historyMode=out.optIn&&reminderEnumHas(REMINDER_PERSONALIZATION_HISTORY_MODES,x.historyMode)?String(x.historyMode):'none'; out.autoApply=false; out.updatedAt=validReminderIso(x.updatedAt)?new Date(x.updatedAt).toISOString():'';
    if(!out.optIn||out.historyMode!=='local') return out;
    var signals=Array.isArray(x.signals)?x.signals:[],signalSeen={}; signals.forEach(function(item){ var normalized=reminderPersonalizationSignalNormalize(item); if(normalized&&!signalSeen[normalized.signalId]){ signalSeen[normalized.signalId]=true; out.signals.push(normalized); } }); if(out.signals.length>REMINDER_PERSONALIZATION_MAX_SIGNALS) out.signals=out.signals.slice(-REMINDER_PERSONALIZATION_MAX_SIGNALS);
    var dismissed=Array.isArray(x.dismissed)?x.dismissed:[],dismissedSeen={}; dismissed.forEach(function(item){ var id=reminderPersonalizationSafeToken(item,280); if(id&&!dismissedSeen[id]){ dismissedSeen[id]=true; out.dismissed.push(id); } }); if(out.dismissed.length>REMINDER_PERSONALIZATION_MAX_DISMISSED) out.dismissed=out.dismissed.slice(-REMINDER_PERSONALIZATION_MAX_DISMISSED);
    var applied=Array.isArray(x.applied)?x.applied:[],appliedSeen={}; applied.forEach(function(item){ var normalized=reminderPersonalizationAppliedNormalize(item); if(normalized&&!appliedSeen[normalized.suggestionId]){ appliedSeen[normalized.suggestionId]=true; out.applied.push(normalized); } }); if(out.applied.length>REMINDER_PERSONALIZATION_MAX_APPLIED) out.applied=out.applied.slice(-REMINDER_PERSONALIZATION_MAX_APPLIED);
    return out;
  }
  var REMINDER_ENGINE_VERSION='1';
  function reminderPersonalizationPreference(preferences,reminderId){ var source=preferences&&typeof preferences==='object'?preferences:{}, pref=source[reminderId]; return pref&&typeof pref==='object'&&!Array.isArray(pref)?pref:{}; }
  function reminderPersonalizationSuggestions(input){
    var x=input&&typeof input==='object'?input:{}, personalization=normalizeReminderPersonalization(x.personalization||x.state), preferences=x.preferences&&typeof x.preferences==='object'?x.preferences:{}, policy=normalizeReminderPolicy(reminderPersonalizationClone(x.policy||{})), suggestions=[];
    if(!personalization.optIn||personalization.historyMode!=='local') return suggestions;
    var dismissed={}, applied={}, seenSuggestions={}; personalization.dismissed.forEach(function(id){ dismissed[id]=true; }); personalization.applied.forEach(function(item){ if(item.status==='accepted') applied[item.suggestionId]=true; });
    function add(candidate){ if(candidate&&!dismissed[candidate.id]&&!applied[candidate.id]&&!seenSuggestions[candidate.id]){ seenSuggestions[candidate.id]=true; suggestions.push(candidate); } }
    var snoozes={}; personalization.signals.forEach(function(signal){ if(signal.type==='snooze'&&signal.reminderId){ if(!snoozes[signal.reminderId]) snoozes[signal.reminderId]=[]; snoozes[signal.reminderId].push(signal); } });
    Object.keys(snoozes).sort().forEach(function(reminderId){
      var pref=reminderPersonalizationPreference(preferences,reminderId), entries=snoozes[reminderId]; if(entries.length<3||pref.channel!=='native') return;
      var id='reminder-personalization-v1:channel:'+encodeURIComponent(reminderId)+':in_app';
      add({id:id,kind:'channel',field:'channel',reminderId:reminderId,previousValue:'native',proposedValue:'in_app',reasonCode:'snooze_mismatch',reason:reminderPersonalizationReasonLabel('snooze_mismatch'),source:'explicit-snooze',sourceLabel:reminderPersonalizationSourceLabel('explicit-snooze'),sourceSignals:entries.slice(-3).map(function(item){ return item.signalId; }),reversible:true,status:'pending'});
    });
    var quietSignals=personalization.signals.filter(function(signal){ return signal.type==='feedback'&&signal.value==='more_quiet'; });
    if(quietSignals.length&&policy.capacityMode!=='light'&&policy.capacityMode!=='silent') add({id:'reminder-personalization-v1:capacity:light',kind:'capacity',field:'capacityMode',reminderId:'',previousValue:policy.capacityMode,proposedValue:'light',reasonCode:'more_quiet',reason:reminderPersonalizationReasonLabel('more_quiet'),source:'explicit-feedback',sourceLabel:reminderPersonalizationSourceLabel('explicit-feedback'),sourceSignals:quietSignals.slice(-3).map(function(item){ return item.signalId; }),reversible:true,status:'pending'});
    var wrongChannels={}; personalization.signals.forEach(function(signal){ if(signal.type==='feedback'&&signal.value==='channel_wrong'&&signal.reminderId) wrongChannels[signal.reminderId]=signal; });
    Object.keys(wrongChannels).sort().forEach(function(reminderId){ var pref=reminderPersonalizationPreference(preferences,reminderId); if(pref.channel!=='native') return; var signal=wrongChannels[reminderId], id='reminder-personalization-v1:channel:'+encodeURIComponent(reminderId)+':in_app'; add({id:id,kind:'channel',field:'channel',reminderId:reminderId,previousValue:'native',proposedValue:'in_app',reasonCode:'channel_wrong',reason:reminderPersonalizationReasonLabel('channel_wrong'),source:'explicit-feedback',sourceLabel:reminderPersonalizationSourceLabel('explicit-feedback'),sourceSignals:[signal.signalId],reversible:true,status:'pending'}); });
    return suggestions;
  }
  function reminderPersonalizationState(root){ return normalizeReminderPersonalization(root&&root.personalization); }
  function reminderPersonalizationCommit(root,state){ if(!root) return null; root.personalization=normalizeReminderPersonalization(state); return root.personalization; }
  function reminderPersonalizationSignalRecord(root,signal,nowIso){
    var state=normalizeReminderPersonalization(root&&root.personalization); if(!root||!state.optIn||state.historyMode!=='local') return {ok:false,changed:false,reason:state.optIn?'history-disabled':'opt-in-required',state:state};
    var raw=Object.assign({},signal||{}, {recordedAt:validReminderIso(nowIso)?nowIso:(signal&&signal.recordedAt||'')}), normalized=reminderPersonalizationSignalNormalize(raw); if(!normalized) return {ok:false,changed:false,reason:'invalid-explicit-signal',state:state};
    if(state.signals.some(function(item){ return item.signalId===normalized.signalId; })) return {ok:true,changed:false,duplicate:true,reason:null,state:state,signal:normalized};
    state.signals.push(normalized); if(state.signals.length>REMINDER_PERSONALIZATION_MAX_SIGNALS) state.signals=state.signals.slice(-REMINDER_PERSONALIZATION_MAX_SIGNALS); state.updatedAt=normalized.recordedAt; reminderPersonalizationCommit(root,state); return {ok:true,changed:true,duplicate:false,reason:null,state:state,signal:normalized};
  }
  function reminderPersonalizationApplySuggestion(input){
    var x=input&&typeof input==='object'?input:{}, root=x.root, state=normalizeReminderPersonalization(root&&root.personalization), suggestions=Array.isArray(x.suggestions)?x.suggestions:reminderPersonalizationSuggestions({personalization:state,preferences:root&&root.preferences,policy:root&&root.policy}), id=reminderPersonalizationSafeToken(x.suggestionId||x.id,280), suggestion=suggestions.find(function(item){ return item.id===id; });
    if(!root||!state.optIn||state.historyMode!=='local') return {ok:false,changed:false,reason:'opt-in-required'}; if(!suggestion||suggestion.reversible!==true) return {ok:false,changed:false,reason:'suggestion-not-available'}; if(state.applied.some(function(item){ return item.suggestionId===suggestion.id&&item.status==='accepted'; })) return {ok:true,changed:false,duplicate:true,reason:null,suggestion:suggestion};
    var changed=false, pref=null;
    if(suggestion.kind==='channel'){ pref=reminderPersonalizationPreference(root.preferences,suggestion.reminderId); if(pref.channel!==suggestion.previousValue) return {ok:false,changed:false,reason:'setting-changed',suggestion:suggestion}; pref=reminderEnsurePreference(root,suggestion.reminderId); pref.channel='in_app'; pref.lastEditedAt=validReminderIso(x.nowIso)?x.nowIso:(state.updatedAt||''); root.preferences[suggestion.reminderId]=normalizeReminderPreference(suggestion.reminderId,pref); changed=true; }
    else if(suggestion.kind==='capacity'){ var policy=normalizeReminderPolicy(root.policy); if(policy.capacityMode!==suggestion.previousValue) return {ok:false,changed:false,reason:'setting-changed',suggestion:suggestion}; policy.capacityMode='light'; root.policy=normalizeReminderPolicy(policy); changed=true; }
    if(!changed) return {ok:false,changed:false,reason:'unsafe-suggestion',suggestion:suggestion};
    var applied={suggestionId:suggestion.id,kind:suggestion.kind,reminderId:suggestion.reminderId||'',field:suggestion.field,previousValue:suggestion.previousValue,proposedValue:suggestion.proposedValue,reasonCode:suggestion.reasonCode,sourceSignals:suggestion.sourceSignals,appliedAt:validReminderIso(x.nowIso)?new Date(x.nowIso).toISOString():(state.updatedAt||'1970-01-01T00:00:00.000Z'),undoneAt:'',status:'accepted'};
    state.applied=state.applied.filter(function(item){ return item.suggestionId!==suggestion.id; }); state.applied.push(applied); if(state.applied.length>REMINDER_PERSONALIZATION_MAX_APPLIED) state.applied=state.applied.slice(-REMINDER_PERSONALIZATION_MAX_APPLIED); state.updatedAt=applied.appliedAt; reminderPersonalizationCommit(root,state); return {ok:true,changed:true,duplicate:false,reason:null,suggestion:suggestion,applied:applied};
  }
  function reminderPersonalizationUndoSuggestion(input){
    var x=input&&typeof input==='object'?input:{}, root=x.root, state=normalizeReminderPersonalization(root&&root.personalization), id=reminderPersonalizationSafeToken(x.suggestionId||x.id,280), entry=state.applied.find(function(item){ return item.suggestionId===id&&item.status==='accepted'; }); if(!root||!entry) return {ok:false,changed:false,reason:'applied-suggestion-not-found'};
    if(entry.kind==='channel'){ var pref=reminderPersonalizationPreference(root.preferences,entry.reminderId); if(pref.channel!==entry.proposedValue) return {ok:false,changed:false,reason:'setting-changed'}; pref=reminderEnsurePreference(root,entry.reminderId); pref.channel=entry.previousValue; pref.lastEditedAt=validReminderIso(x.nowIso)?x.nowIso:(state.updatedAt||''); root.preferences[entry.reminderId]=normalizeReminderPreference(entry.reminderId,pref); }
    else if(entry.kind==='capacity'){ var policy=normalizeReminderPolicy(root.policy); if(policy.capacityMode!==entry.proposedValue) return {ok:false,changed:false,reason:'setting-changed'}; policy.capacityMode=entry.previousValue; root.policy=normalizeReminderPolicy(policy); }
    else return {ok:false,changed:false,reason:'unsafe-suggestion'};
    entry.status='undone'; entry.undoneAt=validReminderIso(x.nowIso)?new Date(x.nowIso).toISOString():(state.updatedAt||'1970-01-01T00:00:00.000Z'); state.updatedAt=entry.undoneAt; reminderPersonalizationCommit(root,state); return {ok:true,changed:true,reason:null,entry:entry};
  }
  function reminderPersonalizationDismissSuggestion(input){
    var x=input&&typeof input==='object'?input:{}, root=x.root, state=normalizeReminderPersonalization(root&&root.personalization), id=reminderPersonalizationSafeToken(x.suggestionId||x.id,280); if(!root||!state.optIn||state.historyMode!=='local'||!id) return {ok:false,changed:false,reason:'opt-in-required'};
    if(state.dismissed.indexOf(id)<0) state.dismissed.push(id); if(state.dismissed.length>REMINDER_PERSONALIZATION_MAX_DISMISSED) state.dismissed=state.dismissed.slice(-REMINDER_PERSONALIZATION_MAX_DISMISSED); if(validReminderIso(x.nowIso)) state.updatedAt=new Date(x.nowIso).toISOString(); reminderPersonalizationCommit(root,state); return {ok:true,changed:true,reason:null,suggestionId:id};
  }
  function reminderPersonalizationSetOptIn(root,optIn,options){
    if(!root) return {ok:false,changed:false,reason:'no-data'}; var state=normalizeReminderPersonalization(root.personalization), next=optIn===true; state.optIn=next; state.historyMode=next&&options&&options.historyMode==='local'?'local':'none'; state.autoApply=false; if(!next||state.historyMode!=='local'){ state.signals=[]; state.dismissed=[]; state.applied=[]; } if(validReminderIso(options&&options.nowIso)) state.updatedAt=new Date(options.nowIso).toISOString(); reminderPersonalizationCommit(root,state); return {ok:true,changed:true,reason:null,state:state};
  }
  function reminderPersonalizationSetHistoryMode(root,mode,nowIso){
    if(!root) return {ok:false,changed:false,reason:'no-data'}; var state=normalizeReminderPersonalization(root.personalization), next=String(mode||''); if(!REMINDER_PERSONALIZATION_HISTORY_MODES[next]) return {ok:false,changed:false,reason:'invalid-history-mode'}; if(next==='local'&&!state.optIn) return {ok:false,changed:false,reason:'opt-in-required'}; state.historyMode=next; if(next==='none'){ state.signals=[]; state.dismissed=[]; state.applied=[]; } if(validReminderIso(nowIso)) state.updatedAt=new Date(nowIso).toISOString(); reminderPersonalizationCommit(root,state); return {ok:true,changed:true,reason:null,state:state};
  }
  function reminderPersonalizationReset(root,nowIso){ if(!root) return {ok:false,changed:false,reason:'no-data'}; var state=emptyReminderPersonalization(); if(validReminderIso(nowIso)) state.updatedAt=new Date(nowIso).toISOString(); reminderPersonalizationCommit(root,state); return {ok:true,changed:true,reason:null,state:state}; }
  function reminderDigestDateShift(date,delta){
    if(!reminderEngineValidDate(date)) return '';
    var p=String(date).split('-').map(Number), d=new Date(Date.UTC(p[0],p[1]-1,p[2]));
    d.setUTCDate(d.getUTCDate()+Number(delta||0));
    return d.toISOString().slice(0,10);
  }
  function reminderDigestDateDistance(from,to){
    if(!reminderEngineValidDate(from)||!reminderEngineValidDate(to)) return null;
    var a=String(from).split('-').map(Number), b=String(to).split('-').map(Number);
    return Math.round((Date.UTC(b[0],b[1]-1,b[2])-Date.UTC(a[0],a[1]-1,a[2]))/86400000);
  }
  function reminderDigestTimezone(value){
    var timezone=String(value||'');
    if(reminderEngineTimezoneValid(timezone)) return timezone;
    try{
      var detected=Intl.DateTimeFormat().resolvedOptions().timeZone;
      if(reminderEngineTimezoneValid(detected)) return detected;
    }catch(e){}
    return REMINDER_DIGEST_DEFAULT_TIMEZONE;
  }
  function reminderDigestLocalDate(input,timezone){
    var x=input&&typeof input==='object'?input:{}, explicit=String(x.localDate||'');
    if(reminderEngineValidDate(explicit)) return explicit;
    var iso=String(x.nowIso||x.instantIso||'');
    if(validReminderIso(iso)){
      var parts=reminderEngineLocalParts(Date.parse(iso),timezone);
      if(parts&&reminderEngineValidDate(parts.localDate)) return parts.localDate;
    }
    return todayStr();
  }
  function reminderDigestReflectionOption(id){
    var key=String(id||'');
    for(var i=0;i<REMINDER_DIGEST_REFLECTIONS.length;i++) if(REMINDER_DIGEST_REFLECTIONS[i].id===key) return REMINDER_DIGEST_REFLECTIONS[i];
    return null;
  }
  function reminderDigestBuild(input){
    var x=input&&typeof input==='object'?input:{}, source=x.data&&typeof x.data==='object'&&!Array.isArray(x.data)?x.data:(data&&typeof data==='object'?data:{}), timezone=reminderDigestTimezone(x.timezone), localDate=reminderDigestLocalDate(x,timezone), startDate=reminderEngineValidDate(source.startDate)?String(source.startDate):'', days=source.days&&typeof source.days==='object'&&!Array.isArray(source.days)?source.days:{}, start=reminderDigestDateShift(localDate,-(REMINDER_DIGEST_WINDOW_DAYS-1)), presenceDates=[];
    for(var date=start, distance=reminderDigestDateDistance(start,localDate);date&&distance!==null&&distance>=0&&distance<REMINDER_DIGEST_WINDOW_DAYS;date=reminderDigestDateShift(date,1),distance=reminderDigestDateDistance(date,localDate)){
      if(Object.prototype.hasOwnProperty.call(days,date)&&days[date]&&typeof days[date]==='object'&&!Array.isArray(days[date])) presenceDates.push(date);
    }
    var historyCleared=x.historyCleared===true, hasHistory=presenceDates.length>0, sinceStart=startDate?reminderDigestDateDistance(startDate,localDate):null, firstWeek=!historyCleared&&hasHistory&&sinceStart!==null&&sinceStart>=0&&sinceStart<REMINDER_DIGEST_WINDOW_DAYS;
    var state=historyCleared?'cleared-history':(!hasHistory?'empty':(firstWeek?'first-week':'available'));
    return {
      schemaVersion:REMINDER_DIGEST_SCHEMA_VERSION,
      state:state,
      localOnly:true,
      userInitiated:true,
      timezone:timezone,
      window:{kind:'last-seven-local-days',startDate:start,endDate:localDate,days:REMINDER_DIGEST_WINDOW_DAYS},
      hasLocalHistory:hasHistory,
      historyState:historyCleared?'cleared':(hasHistory?'present':'empty'),
      source:'local.days.presence-only',
      reflectionOptions:REMINDER_DIGEST_REFLECTIONS.map(function(option){ return {id:option.id,label:option.label,prompt:option.prompt}; }),
      privacyBoundary:{rawDaily:false,therapy:false,mood:false,worshipCompletion:false,medicationDetail:false,reminderBody:false},
      deliveryBoundary:{nativeEligible:false,nativeOptInRequired:true,notificationCreated:false,sync:false,externalAnalytics:false},
      policyBoundary:{consumesReminderBudget:false,quietHoursAffects:false,addsOccurrence:false,addsDelivery:false},
      noOp:{available:true,persists:false,notifies:false}
    };
  }
  var REMINDER_ENGINE_DEFAULT_TIMEZONE='Europe/Istanbul';
  var REMINDER_ENGINE_DAY_PART_TIMES={morning:'08:00',day:'12:00',afternoon:'15:00',evening:'19:00',night:'22:00'};
  function reminderEngineValidDate(value){
    if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    var p=value.split('-').map(Number), y=p[0],m=p[1],d=p[2];
    if(m<1||m>12||d<1) return false;
    var leap=(y%4===0&&y%100!==0)||y%400===0, days=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31];
    return d<=days[m-1];
  }
  function reminderEngineParseTime(value){
    if(typeof value!=='string'||!/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(value)) return null;
    var p=value.split(':'); return {hour:Number(p[0]),minute:Number(p[1]),second:Number(p[2]||0),text:p[0]+':'+p[1],seconds:Number(p[0])*3600+Number(p[1])*60+Number(p[2]||0)};
  }
  function reminderEngineFormatTime(hour,minute){
    return (hour<10?'0':'')+hour+':'+(minute<10?'0':'')+minute;
  }
  function reminderEngineAddDays(date,delta){
    if(!reminderEngineValidDate(date)||!Number.isInteger(delta)) return null;
    var p=date.split('-').map(Number), ms=Date.UTC(p[0],p[1]-1,p[2])+delta*86400000, d=new Date(ms);
    return d.getUTCFullYear()+'-'+(d.getUTCMonth()+1<10?'0':'')+(d.getUTCMonth()+1)+'-'+(d.getUTCDate()<10?'0':'')+d.getUTCDate();
  }
  function reminderEngineTimezoneValid(timezone){
    try{ new Intl.DateTimeFormat('en-US',{timeZone:timezone}).format(new Date(0)); return true; }catch(e){ return false; }
  }
  function reminderEngineInstantMs(input){
    var x=input&&typeof input==='object'?input:{};
    var value=Object.prototype.hasOwnProperty.call(x,'instantMs')?x.instantMs:(Object.prototype.hasOwnProperty.call(x,'epochMs')?x.epochMs:(Object.prototype.hasOwnProperty.call(x,'instantIso')?x.instantIso:x.nowIso));
    if(typeof value==='number'&&Number.isFinite(value)) return value;
    if(typeof value==='string'&&value){ var ms=new Date(value).getTime(); return Number.isFinite(ms)?ms:null; }
    return null;
  }
  function reminderEngineCompareDateTime(date,time,otherDate,otherTime){
    if(!reminderEngineValidDate(date)||!reminderEngineValidDate(otherDate)) return null;
    var left=reminderEngineParseTime(time),right=reminderEngineParseTime(otherTime); if(!left||!right) return null;
    if(date!==otherDate) return date<otherDate?-1:1;
    return left.seconds<right.seconds?-1:(left.seconds>right.seconds?1:0);
  }
  function reminderEngineSource(input,definition){
    var x=input&&typeof input==='object'?input:{}, d=definition&&typeof definition==='object'?definition:{};
    return x.prayerData&&typeof x.prayerData==='object'?x.prayerData:(x.prayer&&typeof x.prayer==='object'?x.prayer:(d.prayerData&&typeof d.prayerData==='object'?d.prayerData:null));
  }
  function reminderEnginePrayerTime(input,definition,localDate,timezone){
    var source=reminderEngineSource(input,definition), result={source:source,stale:false};
    if(!source||source.stale===true||source.isStale===true){ result.stale=true; result.reason='stale-prayer-data'; return result; }
    if(input.offline===true&&(source.fallback===true||source.offlineFallback===true)&&source.fresh!==true){ result.stale=true; result.reason='offline-prayer-data'; return result; }
    var times=source.times&&typeof source.times==='object'?source.times:(source.prayerTimes&&typeof source.prayerTimes==='object'?source.prayerTimes:source), key=String(input.prayerKey||input.prayerName||definition.prayerKey||definition.prayerName||'');
    if(!key||!times||typeof times[key]!=='string'){ result.reason='missing-prayer-time'; return result; }
    var parsed=reminderEngineParseTime(times[key]); if(!parsed){ result.reason='invalid-prayer-time'; return result; }
    var sourceDate=source.localDate||source.date||source.fetchedForDate||'';
    if(!sourceDate||sourceDate!==localDate){ result.stale=true; result.reason='stale-prayer-data'; return result; }
    var fetchedAt=source.fetchedAt||source.updatedAt||'';
    if(!fetchedAt||!Number.isFinite(new Date(fetchedAt).getTime())){ result.stale=true; result.reason='stale-prayer-data'; return result; }
    var nowMs=reminderEngineInstantMs(input), fetchedMs=new Date(fetchedAt).getTime(), maxAgeHours=Number.isFinite(input.prayerMaxAgeHours)?Math.max(0,input.prayerMaxAgeHours):48;
    if(nowMs!==null){ var ageHours=(nowMs-fetchedMs)/3600000; if(ageHours<0||ageHours>maxAgeHours){ result.stale=true; result.reason='stale-prayer-data'; return result; } }
    if(input.locationHash&&String(input.locationHash)!==String(source.fetchedFor||'')){ result.stale=true; result.reason='stale-prayer-data'; return result; }
    if(input.prayerMethod&&String(input.prayerMethod)!==String(source.method||'')){ result.stale=true; result.reason='stale-prayer-data'; return result; }
    var offset=Number.isInteger(input.offsetMinutes)?input.offsetMinutes:(Number.isInteger(definition.offsetMinutes)?definition.offsetMinutes:0);
    if(Number.isInteger(input.beforeMinutes)) offset=-Math.abs(input.beforeMinutes);
    var total=parsed.hour*60+parsed.minute+offset, dayDelta=Math.floor(total/1440); total%=1440; if(total<0){ total+=1440; dayDelta--; }
    result.time=reminderEngineFormatTime(Math.floor(total/60),total%60); result.localDate=dayDelta?reminderEngineAddDays(localDate,dayDelta):localDate; result.sourceRevision=String(source.revision||source.sourceRevision||definition.sourceRevision||definition.definitionVersion||''); result.key=key; return result;
  }
  function reminderEngineScheduledTime(input,definition,localDate,timezone){
    var trigger=String(input.triggerType||definition.triggerType||'fixed-time').toLowerCase(), timeValue=input.scheduledAt||input.time||definition.scheduledAt||definition.time;
    if(trigger==='prayer-offset'||trigger==='prayer' || input.prayerData||input.prayer){ return reminderEnginePrayerTime(input,definition,localDate,timezone); }
    if(trigger==='day-part'||input.dayPart||definition.dayPart){
      var part=String(input.dayPart||definition.dayPart||'day'), map=input.dayPartTimes||definition.dayPartTimes||REMINDER_ENGINE_DAY_PART_TIMES; timeValue=map[part]||REMINDER_ENGINE_DAY_PART_TIMES[part]||'';
    }
    if(!timeValue&&definition.defaultWindow&&typeof definition.defaultWindow==='object') timeValue=definition.defaultWindow.start||'';
    var parsed=reminderEngineParseTime(String(timeValue||''));
    return parsed?{time:parsed.text,localDate:localDate,sourceRevision:String(input.sourceRevision||definition.sourceRevision||definition.definitionVersion||''),stale:false}:null;
  }
  function reminderEngineOccurrenceId(reminderId,localDate,scheduledAt,timezone,definitionVersion){
    var values=[reminderId,localDate,scheduledAt,timezone,definitionVersion].map(function(value){ return encodeURIComponent(String(value==null?'':value)); });
    return 'reminder-occurrence-v'+REMINDER_ENGINE_VERSION+':'+values.join('|');
  }
  function reminderSpecialDayFailure(reason,extra){ return Object.assign({ok:false,occurrence:null,reason:String(reason||'invalid-special-day'),stale:false,replay:false,nativeReplay:false},extra||{}); }
  function reminderSpecialDayOffset(input){
    var x=input&&typeof input==='object'?input:{}, value=Object.prototype.hasOwnProperty.call(x,'offsetDays')?x.offsetDays:x.hijriOffset;
    return Number.isInteger(value)&&value>=-2&&value<=2?value:0;
  }
  function reminderSpecialDayLookup(localDate,offsetDays){
    if(!reminderEngineValidDate(localDate)) return null;
    var calendar=typeof window!=='undefined'&&window.HijriCalendarV1?window.HijriCalendarV1:null;
    if(!calendar||typeof calendar.holyDay!=='function') return null;
    var shiftedDate=reminderEngineAddDays(localDate,offsetDays);
    if(!shiftedDate) return null;
    var label=String(calendar.holyDay(shiftedDate,0)||'');
    if(!label) return null;
    var hijri=typeof calendar.hijriFrom==='function'?calendar.hijriFrom(localDate,offsetDays):null;
    return {id:reminderSpecialDayId(label),label:label,lookupDate:shiftedDate,hijri:hijri};
  }
  function reminderSpecialDayDefinition(state){
    var special=normalizeReminderSpecialDays(state), time=special.time;
    return Object.assign({},REMINDER_SPECIAL_DAYS_DEFINITION,{defaultWindow:Object.assign({},REMINDER_SPECIAL_DAYS_DEFINITION.defaultWindow,{kind:'fixed-time',time:time,start:time,end:null})});
  }
  function reminderSpecialDayPolicyPreference(state){
    var special=normalizeReminderSpecialDays(state);
    return {reminderId:REMINDER_SPECIAL_DAYS_ID,enabled:special.mode!=='none',privacyMode:'private',channel:special.channel,timezone:special.timezone,time:special.time,quietHoursBehavior:'defer',specialDayMode:special.mode,selectedDays:special.selectedDays.slice(),explicitlySelected:true,userCreated:true};
  }
  function reminderSpecialDayOccurrence(input){
    var x=input&&typeof input==='object'?input:{}, state=normalizeReminderSpecialDays(x.specialDays||x.preference), definition=reminderSpecialDayDefinition(state), timezone=String(x.timezone||state.timezone||'Europe/Istanbul'), instantMs=reminderEngineInstantMs(x), instantParts=instantMs===null?null:reminderEngineLocalParts(instantMs,timezone), localDate=reminderEngineValidDate(x.localDate)?x.localDate:(instantParts&&instantParts.localDate||''), nowLocalDate=reminderEngineValidDate(x.nowLocalDate)?x.nowLocalDate:(instantParts&&instantParts.localDate)||localDate, nowLocalTime=String(x.nowLocalTime||x.currentLocalTime||(instantParts&&instantParts.localTime)||'').slice(0,5), offsetDays=reminderSpecialDayOffset(x);
    if(state.mode==='none') return reminderSpecialDayFailure('preference-not-selected');
    if(!localDate||!reminderEngineValidDate(localDate)||!reminderEngineTimezoneValid(timezone)) return reminderSpecialDayFailure('invalid-special-day-clock');
    var special=reminderSpecialDayLookup(localDate,offsetDays);
    if(!special) return reminderSpecialDayFailure('not-special-day');
    if(state.mode==='selected'&&(special.id===''||state.selectedDays.indexOf(special.id)<0)) return reminderSpecialDayFailure('outside-selected-days',{specialDayId:special.id,specialDayLabel:special.label});
    var generated=reminderEngineAdapterGenerateOccurrence({definition:{id:REMINDER_SPECIAL_DAYS_ID,triggerType:'fixed-time',time:state.time,definitionVersion:definition.definitionVersion,priority:definition.priority},reminderId:REMINDER_SPECIAL_DAYS_ID,localDate:localDate,nowLocalDate:nowLocalDate,nowLocalTime:nowLocalTime,timezone:timezone,instantIso:x.instantIso||x.nowIso,hijriOffset:offsetDays,sourceRevision:'hijri-calendar-v1'});
    if(!generated.ok||!generated.occurrence) return generated;
    var hijri=special.hijri, hijriDate=hijri&&hijri.day&&hijri.monthName?hijri.day+' '+hijri.monthName+' '+hijri.year:'';
    var occurrence=Object.assign({},generated.occurrence,{reminderId:REMINDER_SPECIAL_DAYS_ID,category:'special',priority:'P2',deepLink:'faith',triggerType:'special-day',specialDayId:special.id,specialDayLabel:special.label,hijriDate:hijriDate,hijriOffset:offsetDays,nativeTitle:REMINDER_SPECIAL_NATIVE_TITLE,nativeBody:REMINDER_SPECIAL_NATIVE_BODY,replay:false,nativeReplay:false,shouldReplay:false});
    return Object.assign({},generated,{occurrence:occurrence,definition:definition,preference:reminderSpecialDayPolicyPreference(state),specialDayId:special.id,specialDayLabel:special.label});
  }
  function reminderSpecialDayLifecycleCandidates(input){
    var x=input&&typeof input==='object'?input:{}, root=x.root&&typeof x.root==='object'?x.root:(data&&data.reminders), state=normalizeReminderSpecialDays(root&&root.specialDays), context=x.context&&typeof x.context==='object'?x.context:{}, baseDate=String(x.localDate||context.localDate||''), baseTime=String(x.localTime||context.localTime||'12:00').slice(0,5), timezone=String(x.timezone||state.timezone||context.timezone||'Europe/Istanbul'), out=[];
    var preference=root&&root.preferences&&root.preferences[REMINDER_SPECIAL_DAYS_ID];
    if(state.mode==='none'||!preference||preference.enabled!==true||!reminderEngineValidDate(baseDate)) return out;
    var dates=[baseDate]; if(x.catchUp===true){ var previous=reminderEngineAddDays(baseDate,-1); if(previous) dates.push(previous); }
    dates.forEach(function(localDate){
      var result=reminderSpecialDayOccurrence({specialDays:state,localDate:localDate,nowLocalDate:baseDate,nowLocalTime:baseTime,timezone:timezone,instantIso:context.nowIso,hijriOffset:x.hijriOffset,offsetDays:x.offsetDays});
      if(!result.ok||!result.occurrence) return;
      var occurrence=result.occurrence;
      out.push({occurrence:occurrence,definition:result.definition,preference:reminderSpecialDayPolicyPreference(state),reminderId:REMINDER_SPECIAL_DAYS_ID,specialDayId:result.specialDayId,specialDayLabel:result.specialDayLabel,privateTitle:result.specialDayLabel+' için sakin bir durak',privateBody:REMINDER_SPECIAL_DAYS_DEFINITION.privateBody,nativeTitle:REMINDER_SPECIAL_NATIVE_TITLE,nativeBody:REMINDER_SPECIAL_NATIVE_BODY,explicitlySelected:true,userCreated:true,due:occurrence.due});
    });
    return out;
  }
  function reminderMedicationFailure(reason,extra){ return Object.assign({ok:false,occurrence:null,reason:String(reason||'invalid-medication-schedule'),stale:false,replay:false,nativeReplay:false},extra||{}); }
  function reminderMedicationDefinition(schedule){
    var s=normalizeReminderMedication(schedule);
    if(!s) return null;
    return {id:s.id,category:'health',priority:'P1',triggerType:'medication-schedule',deepLink:'health',definitionVersion:String(REMINDER_MEDICATION_SCHEMA_VERSION),defaultChannel:'in_app',defaultWindow:{kind:'time-range',timezone:s.timezone,start:s.time,end:s.time},snoozeOptions:['30m','1h','todayOff'],privateTitle:REMINDER_MEDICATION_NATIVE_TITLE,privateBody:REMINDER_MEDICATION_NATIVE_BODY,userOwnedSchedule:true};
  }
  function reminderMedicationScheduleById(id,source){
    var list=Array.isArray(source)?source:(data&&data.reminders&&Array.isArray(data.reminders.medications)?data.reminders.medications:[]), key=String(id||'');
    for(var i=0;i<list.length;i++){ if(list[i]&&String(list[i].id||'')===key) return list[i]; }
    return null;
  }
  function reminderMedicationOccurrence(input){
    var x=input&&typeof input==='object'?input:{}, raw=x.schedule&&typeof x.schedule==='object'?x.schedule:(x.medication&&typeof x.medication==='object'?x.medication:x), schedule=normalizeReminderMedication(raw), nowValue=x.nowIso||x.instantIso||x.now||'', instantMs=reminderEngineInstantMs({instantIso:nowValue}), timezone=String(x.timezone||schedule&&schedule.timezone||REMINDER_ENGINE_DEFAULT_TIMEZONE), parts=instantMs===null?null:reminderEngineLocalParts(instantMs,timezone), localDate=String(x.localDate||x.nowLocalDate||(parts&&parts.localDate)||''), localTime=String(x.localTime||x.nowLocalTime||(parts&&parts.localTime)||'').slice(0,5);
    if(!schedule) return reminderMedicationFailure('invalid-schedule');
    if(schedule.enabled!==true) return reminderMedicationFailure('schedule-disabled');
    if(instantMs===null||!reminderEngineValidDate(localDate)) return reminderMedicationFailure('invalid-medication-clock');
    var definition=reminderMedicationDefinition(schedule), generated=reminderEngineAdapterGenerateOccurrence({definition:{id:schedule.id,triggerType:'fixed-time',time:schedule.time,definitionVersion:String(REMINDER_MEDICATION_SCHEMA_VERSION)},reminderId:schedule.id,localDate:localDate,nowLocalDate:localDate,nowLocalTime:localTime,timezone:timezone,instantIso:nowValue,sourceRevision:'medication-schedule-v1'});
    if(!generated.ok||!generated.occurrence) return generated;
    var occurrence=Object.assign({},generated.occurrence,{occurrenceId:'reminder-medication-v1:'+encodeURIComponent(schedule.id)+':'+encodeURIComponent(localDate)+':'+encodeURIComponent(schedule.time)+':'+encodeURIComponent(timezone),reminderId:schedule.id,category:'health',priority:'P1',deepLink:'health',triggerType:'medication-schedule',medicationScheduleId:schedule.id,userOwnedSchedule:true,explicitlySelected:true,due:generated.occurrence.due&&!generated.occurrence.past,missed:generated.occurrence.past===true,replay:false,nativeReplay:false,shouldReplay:false,nativeTitle:REMINDER_MEDICATION_NATIVE_TITLE,nativeBody:REMINDER_MEDICATION_NATIVE_BODY,dataRequirement:'none'});
    return Object.assign({},generated,{occurrence:occurrence,definition:definition,missed:occurrence.missed});
  }
  function reminderMedicationPolicyPreference(schedule){
    var s=normalizeReminderMedication(schedule), out={reminderId:s?s.id:'',enabled:!!(s&&s.enabled),privacyMode:'private',channel:s&&s.channel==='native'?'native':'in_app',quietHoursBehavior:'defer',userScheduled:true,userCreated:true,explicitlySelected:true};
    return out;
  }
  function reminderMedicationPrivateCopy(input,definition){
    var x=input&&typeof input==='object'?input:{}, occurrence=x.occurrence&&typeof x.occurrence==='object'?x.occurrence:x, schedule=x.schedule&&typeof x.schedule==='object'?x.schedule:reminderMedicationScheduleById(x.medicationScheduleId||occurrence.medicationScheduleId||x.reminderId);
    schedule=normalizeReminderMedication(schedule);
    if(!schedule) return null;
    var label=schedule.privateLabel||schedule.name, detail=schedule.name+' · '+schedule.time;
    if(schedule.note) detail+=' · '+schedule.note;
    return {title:label,detail:detail,deepLink:'health',private:true};
  }
  function reminderMedicationNativeCopy(){ return {title:REMINDER_MEDICATION_NATIVE_TITLE,detail:REMINDER_MEDICATION_NATIVE_BODY,deepLink:'health'}; }
  function reminderMedicationLifecycleCandidates(input){
    var x=input&&typeof input==='object'?input:{}, root=x.root&&typeof x.root==='object'?x.root:(data&&data.reminders), list=root&&Array.isArray(root.medications)?root.medications:[], context=x.context&&typeof x.context==='object'?x.context:{}, out=[];
    list.forEach(function(raw){
      var schedule=normalizeReminderMedication(raw); if(!schedule||schedule.enabled!==true) return;
      var result=reminderMedicationOccurrence({schedule:schedule,nowIso:context.nowIso,timezone:schedule.timezone});
      if(!result.ok||!result.occurrence) return;
      // REM-20: current-day schedule only. Missed occurrences are marked and
      // never converted into catch-up, replacement or dose advice.
      out.push({occurrence:result.occurrence,definition:result.definition,preference:reminderMedicationPolicyPreference(schedule),reminderId:schedule.id,medicationScheduleId:schedule.id,userScheduled:true,explicitlySelected:true,due:result.occurrence.due});
    });
    return out;
  }
  function reminderAppClockBoundary(input){
    var x=input&&typeof input==='object'?input:{}, root=reminderCurrentRoot(), settings=data&&data.settings&&data.settings.prayer, configured=String(x.timezone||((root&&root.timezone)||'')||((settings&&settings.timezone)||'')||REMINDER_ENGINE_DEFAULT_TIMEZONE), raw=x.nowIso||x.instantIso||x.now, nowIso=reminderDeliveryIso(raw)||new Date().toISOString(), instantMs=Date.parse(nowIso), parts=reminderEngineAdapterLocalParts(instantMs,configured), selectedDate=reminderEngineValidDate(x.activeDate)?x.activeDate:'';
    if(!selectedDate){ try{ if(typeof activeDate==='function') selectedDate=activeDate(); }catch(e){ selectedDate=''; } }
    return {nowIso:nowIso,instantMs:instantMs,timezone:configured,wallClockDate:parts&&parts.localDate||'',wallClockTime:parts&&parts.localTime?parts.localTime.slice(0,5):'',activeDate:selectedDate,selectedDateIsHistorical:!!(selectedDate&&parts&&selectedDate!==parts.localDate)};
  }
  function reminderAppEngineInput(input){
    var source=input&&typeof input==='object'?input:{}, out=Object.assign({},source), clock=reminderAppClockBoundary(source), hasInstant=Object.prototype.hasOwnProperty.call(out,'instantMs')||Object.prototype.hasOwnProperty.call(out,'epochMs')||Object.prototype.hasOwnProperty.call(out,'instantIso')||Object.prototype.hasOwnProperty.call(out,'nowIso'), hasExplicitLocalTime=!!(out.nowLocalTime||out.currentLocalTime);
    if(!out.timezone) out.timezone=clock.timezone;
    if((!hasInstant||!reminderDeliveryIso(out.instantIso||out.nowIso||out.now))&&!Object.prototype.hasOwnProperty.call(out,'localDate')) out.instantIso=clock.nowIso;
    if(!reminderEngineValidDate(out.nowLocalDate)&&!reminderEngineValidDate(out.currentLocalDate)&&!hasExplicitLocalTime) out.nowLocalDate=clock.wallClockDate;
    if(!out.nowLocalTime&&!out.currentLocalTime) out.nowLocalTime=clock.wallClockTime;
    return {input:out,clock:clock};
  }
  function reminderEngineModule(){
    // REM-54: dolayli `window[key]` erisimi yerine dogrudan referans. Modul
    // artik index.html tarafindan yukleniyor; asagidaki inline fallback yalnizca
    // modul yuklenemezse devreye girer ve ayni sonucu uretir.
    try{ if(typeof window!=='undefined'&&window.ReminderEngineV1&&typeof window.ReminderEngineV1.generateOccurrence==='function') return window.ReminderEngineV1; }catch(e){}
    return null;
  }
  function reminderEngineAdapterLocalParts(instantMs,timezone){
    var engine=reminderEngineModule();
    if(SEYMA_REMINDERS&&engine&&typeof SEYMA_REMINDERS.reminderEngineLocalParts==='function') return SEYMA_REMINDERS.reminderEngineLocalParts.apply(null,arguments);
    return engine&&typeof engine.localParts==='function'?engine.localParts(instantMs,timezone):reminderEngineLocalParts(instantMs,timezone);
  }
  function reminderEngineAdapterGenerateOccurrence(input){
    var prepared=reminderAppEngineInput(input), engine=reminderEngineModule();
    if(SEYMA_REMINDERS&&engine&&typeof SEYMA_REMINDERS.reminderEngineGenerateOccurrence==='function') return SEYMA_REMINDERS.reminderEngineGenerateOccurrence(prepared.input);
    return engine?engine.generateOccurrence(prepared.input):reminderEngineGenerateOccurrence(prepared.input);
  }
  var REMINDER_PRAYER_ID='reminder.catalog.v1.prayer';
  var REMINDER_PRAYER_KEYS=null;
  function reminderPrayerKeys(){ if(!REMINDER_PRAYER_KEYS){ try{ REMINDER_PRAYER_KEYS=PRAYER_ORDER.slice(); }catch(e){ REMINDER_PRAYER_KEYS=[]; } } return REMINDER_PRAYER_KEYS; }
  function reminderPrayerFailure(reason,extra){ return Object.assign({ok:false,occurrence:null,reason:String(reason||'invalid-prayer-data'),stale:false,replay:false,nativeReplay:false},extra||{}); }
  function reminderPrayerSource(input){
    var x=input&&typeof input==='object'?input:{}, raw=x.prayerData&&typeof x.prayerData==='object'?x.prayerData:(x.source&&typeof x.source==='object'?x.source:null);
    if(!raw) return null;
    var source=Object.assign({},raw), times=raw.times&&typeof raw.times==='object'?Object.assign({},raw.times):(raw.prayerTimes&&typeof raw.prayerTimes==='object'?Object.assign({},raw.prayerTimes):{});
    reminderPrayerKeys().forEach(function(key){ if(typeof times[key]!=='string'&&raw[key]&&typeof raw[key]==='object'&&typeof raw[key].time==='string') times[key]=raw[key].time; });
    source.times=times;
    source.localDate=String(raw.localDate||raw.date||raw.fetchedForDate||x.localDate||'');
    source.fetchedAt=String(raw.fetchedAt||raw.updatedAt||'');
    source.fetchedFor=String(raw.fetchedFor||raw.locationHash||raw.locationFingerprint||'');
    source.method=String(raw.method||raw.fetchedMethod||'');
    source.revision=String(raw.revision||raw.sourceRevision||([source.fetchedAt,source.fetchedFor,source.method].join('|')));
    return source;
  }
  function reminderPrayerSelectedKeys(input){
    var x=input&&typeof input==='object'?input:{}, raw=[];
    if(Array.isArray(x.prayerKeys)) raw=x.prayerKeys;
    else if(Array.isArray(x.selectedPrayerKeys)) raw=x.selectedPrayerKeys;
    else if(x.prayerKey||x.prayerName||x.selectedPrayer) raw=[x.prayerKey||x.prayerName||x.selectedPrayer];
    if(!raw.length) raw=reminderPrayerKeys().slice();
    var out=[],seen={};
    raw.forEach(function(key){ key=String(key||''); if(reminderPrayerKeys().indexOf(key)>=0&&!seen[key]){ seen[key]=true; out.push(key); } });
    return out;
  }
  function reminderPrayerOffsetInput(input,definition){
    var x=input&&typeof input==='object'?input:{}, preference=x.preference&&typeof x.preference==='object'?x.preference:{};
    if(Number.isInteger(x.offsetMinutes)) return {offsetMinutes:x.offsetMinutes};
    if(Number.isInteger(x.beforeMinutes)) return {beforeMinutes:Math.abs(x.beforeMinutes)};
    if(Number.isInteger(preference.offsetMinutes)) return {offsetMinutes:preference.offsetMinutes};
    if(Number.isInteger(preference.beforeMinutes)) return {beforeMinutes:Math.abs(preference.beforeMinutes)};
    if(definition&&Number.isInteger(definition.offsetMinutes)) return {offsetMinutes:definition.offsetMinutes};
    return {offsetMinutes:0};
  }
  function reminderPrayerOccurrence(input){
    var x=input&&typeof input==='object'?input:{}, definition=x.definition&&typeof x.definition==='object'?x.definition:(typeof ReminderCatalogV1!=='undefined'&&ReminderCatalogV1.get?ReminderCatalogV1.get(REMINDER_PRAYER_ID):{id:REMINDER_PRAYER_ID,triggerType:'prayer-offset',definitionVersion:'1',deepLink:'faith'}), key=String(x.prayerKey||x.prayerName||x.selectedPrayer||'');
    if(reminderPrayerKeys().indexOf(key)<0) return reminderPrayerFailure('invalid-prayer-key');
    var source=reminderPrayerSource(x);
    if(!source) return reminderPrayerFailure('missing-prayer-data');
    var expectedLocation=String(x.locationHash||x.prayerLocationHash||''), expectedMethod=String(x.prayerMethod||x.method||'');
    if(x.requireLocation===true&&(!expectedLocation||!source.fetchedFor||source.fetchedFor!==expectedLocation)) return reminderPrayerFailure('prayer-location-changed',{stale:true});
    if(expectedLocation&&source.fetchedFor!==expectedLocation) return reminderPrayerFailure('prayer-location-changed',{stale:true});
    if(x.requireMethod===true&&(!expectedMethod||!source.method||source.method!==expectedMethod)) return reminderPrayerFailure('prayer-method-changed',{stale:true});
    if(expectedMethod&&source.method!==expectedMethod) return reminderPrayerFailure('prayer-method-changed',{stale:true});
    if(x.offline===true&&(source.fallback===true||source.offlineFallback===true)&&source.fresh!==true) return reminderPrayerFailure('offline-prayer-data',{stale:true});
    var offset=reminderPrayerOffsetInput(x,definition), hijriOffset=Number.isInteger(x.hijriOffset)&&x.hijriOffset>=-2&&x.hijriOffset<=2?x.hijriOffset:0;
    var generated=reminderEngineAdapterGenerateOccurrence(Object.assign({},x,offset,{definition:definition,reminderId:String(x.reminderId||definition.id||REMINDER_PRAYER_ID),prayerKey:key,prayerData:source,hijriOffset:hijriOffset}));
    if(!generated.ok||!generated.occurrence) return generated;
    var occurrence=Object.assign({},generated.occurrence,{deepLink:String(definition.deepLink||'faith'),prayerKey:key,prayerName:PRAYER_NAMES[key]||key,offsetMinutes:Number.isInteger(offset.offsetMinutes)?offset.offsetMinutes:-Math.abs(offset.beforeMinutes||0)});
    return Object.assign({},generated,occurrence);
  }
  function reminderPrayerOccurrences(input){
    var x=input&&typeof input==='object'?input:{}, keys=reminderPrayerSelectedKeys(x), out=[];
    keys.forEach(function(key){ out.push(reminderPrayerOccurrence(Object.assign({},x,{prayerKey:key}))); });
    return out;
  }
  function reminderPrayerSourceForDate(date){
    var day=data&&data.days&&data.days[date], p=day&&day.prayer;
    if(!p||typeof p!=='object') return null;
    var times={}; reminderPrayerKeys().forEach(function(key){ if(p[key]&&typeof p[key].time==='string') times[key]=p[key].time; });
    return {localDate:String(date||''),fetchedAt:String(p.fetchedAt||''),fetchedFor:String(p.fetchedFor||''),method:String(p.fetchedMethod||p.method||''),times:times,revision:String(p.fetchedRevision||p.fetchedAt||''),fallback:!!p.offlineFallback};
  }
  function reminderPrayerLifecycleKeys(preference,input){
    var source=preference&&typeof preference==='object'?preference:{}, x=input&&typeof input==='object'?input:{};
    if(Array.isArray(source.prayerKeys)) return reminderPrayerSelectedKeys({prayerKeys:source.prayerKeys});
    if(source.prayerKey) return reminderPrayerSelectedKeys({prayerKey:source.prayerKey});
    if(x.prayerKey) return reminderPrayerSelectedKeys({prayerKey:x.prayerKey});
    return reminderPrayerKeys().slice();
  }
  function reminderPrayerLifecycleInput(preference,input,localDate,source){
    var x=input&&typeof input==='object'?input:{}, s=prayerSettings(), loc=prayerLocation(), out={prayerData:source,localDate:localDate,prayerMethod:prayerMethod(),locationHash:prayerLocationHash(),requireMethod:true,requireLocation:true,offline:x.offline===true};
    if(preference&&Number.isInteger(preference.offsetMinutes)) out.offsetMinutes=preference.offsetMinutes;
    else if(preference&&Number.isInteger(preference.beforeMinutes)) out.beforeMinutes=preference.beforeMinutes;
    else if(s&&Number.isFinite(Number(s.reminderOffsetMinutes))) out.beforeMinutes=Math.abs(Number(s.reminderOffsetMinutes));
    if(x.hijriOffset!==undefined) out.hijriOffset=x.hijriOffset;
    else out.hijriOffset=s&&Number.isInteger(s.hijriOffset)&&s.hijriOffset>=-2&&s.hijriOffset<=2?s.hijriOffset:0;
    if(!loc) out.requireLocation=true;
    return out;
  }
  var REMINDER_SYSTEM_STATUS_VERSION=1;
  var REMINDER_SYSTEM_SYNC_STATES={disabled:true,idle:true,pending:true,synced:true,error:true,offline:true};
  function reminderSystemLocalDate(input,timezone){
    var x=input&&typeof input==='object'?input:{}, direct=String(x.localDate||'');
    if(reminderEngineValidDate(direct)) return direct;
    var nowIso=String(x.nowIso||x.instantIso||''), ms=Date.parse(nowIso), local=Number.isFinite(ms)?reminderEngineLocalParts(ms,timezone):null;
    return local&&reminderEngineValidDate(local.localDate)?local.localDate:'';
  }
  function reminderSystemPrayerStatus(input){
    var x=input&&typeof input==='object'?input:{}, timezone=String(x.timezone||REMINDER_ENGINE_DEFAULT_TIMEZONE), localDate=reminderSystemLocalDate(x,timezone), source=x.prayerData&&typeof x.prayerData==='object'?reminderPrayerSource({prayerData:x.prayerData,localDate:localDate}):(localDate?reminderPrayerSourceForDate(localDate):null);
    if(!source||typeof source!=='object') return {state:'unavailable',canGenerate:false,reason:'missing-prayer-data'};
    var times=source.times&&typeof source.times==='object'?source.times:{}, hasAny=false, complete=true;
    reminderPrayerKeys().forEach(function(key){ if(typeof times[key]==='string'&&reminderEngineParseTime(times[key])) hasAny=true; else complete=false; });
    if(!hasAny) return {state:'unavailable',canGenerate:false,reason:'missing-prayer-time'};
    if(!complete) return {state:'unavailable',canGenerate:false,reason:'incomplete-prayer-data'};
    if(!reminderEngineValidDate(localDate)||String(source.localDate||'')!==localDate) return {state:'stale',canGenerate:false,reason:'stale-prayer-data'};
    var fetchedMs=Date.parse(String(source.fetchedAt||''));
    if(!Number.isFinite(fetchedMs)) return {state:'stale',canGenerate:false,reason:'stale-prayer-data'};
    var nowMs=Date.parse(String(x.nowIso||x.instantIso||'')), maxAgeHours=Number.isFinite(Number(x.prayerMaxAgeHours))?Math.max(0,Number(x.prayerMaxAgeHours)):48;
    if(Number.isFinite(nowMs)){ var ageHours=(nowMs-fetchedMs)/3600000; if(ageHours<0||ageHours>maxAgeHours) return {state:'stale',canGenerate:false,reason:'stale-prayer-data'}; }
    if(x.locationHash&&String(source.fetchedFor||'')!==String(x.locationHash)) return {state:'stale',canGenerate:false,reason:'prayer-location-changed'};
    if(x.prayerMethod&&String(source.method||'')!==String(x.prayerMethod)) return {state:'stale',canGenerate:false,reason:'prayer-method-changed'};
    if(x.offline===true&&(source.fallback===true||source.offlineFallback===true)&&source.fresh!==true) return {state:'stale',canGenerate:false,reason:'offline-prayer-data'};
    return {state:'fresh',canGenerate:true,reason:null};
  }
  function reminderSystemSyncStatus(input){
    var x=input&&typeof input==='object'?input:{}, configured=x.configured===true, receipt=normalizeSyncReceipt(x.receipt), status=String(receipt.status||'idle'), code=String(receipt.lastErrorCode||'');
    if(!configured) return {state:'disabled',pending:false,ok:true,reason:'sync-not-configured'};
    if(x.offline===true||status==='offline'||code==='offline') return {state:'offline',pending:false,ok:false,reason:'sync-offline'};
    if(status==='queued'||status==='saving'||status==='retrying'||status==='local_saved') return {state:'pending',pending:true,ok:false,reason:'sync-pending'};
    if(status==='error'||status==='permission'||status==='conflict'||status==='anti_clobber'||code) return {state:'error',pending:false,ok:false,reason:'sync-error'};
    if(status==='accepted') return {state:'synced',pending:false,ok:true,reason:null};
    return {state:REMINDER_SYSTEM_SYNC_STATES[status]?status:'idle',pending:false,ok:status==='idle',reason:null};
  }
  function reminderSystemStatus(input){
    var x=input&&typeof input==='object'?input:{}, offline=reminderSystemOffline(x), timezone=String(x.timezone||REMINDER_ENGINE_DEFAULT_TIMEZONE), localDate=reminderSystemLocalDate(x,timezone), permission=Object.prototype.hasOwnProperty.call(x,'permissionState')?reminderPermissionState({state:x.permissionState}):Object.prototype.hasOwnProperty.call(x,'permission')?reminderPermissionState({permission:x.permission}):reminderPermissionSnapshot(), prayer=reminderSystemPrayerStatus(Object.assign({},x,{offline:offline,timezone:timezone,localDate:localDate,locationHash:x.locationHash||prayerLocationHash(),prayerMethod:x.prayerMethod||prayerMethod()})), sync=reminderSystemSyncStatus({configured:x.configured===true,receipt:x.receipt|| (data&&data.syncReceipt),offline:offline}), recovery=x.recovery===true||x.source==='online';
    var state=offline?'offline':recovery?'recovery':prayer.state==='stale'?'stale':prayer.state==='unavailable'?'unavailable':'fresh';
    return {
      schemaVersion:REMINDER_SYSTEM_STATUS_VERSION,
      state:state,
      networkState:offline?'offline':'online',
      prayerState:prayer.state,
      prayerCanGenerate:prayer.canGenerate===true,
      permissionState:permission,
      syncState:sync.state,
      syncPending:sync.pending===true,
      backgroundState:'unsupported',
      recoveryState:recovery?'recovery':'idle',
      capability:{inApp:'available',prayerInApp:prayer.canGenerate===true?'available':'blocked',native:!offline&&permission==='granted'&&prayer.canGenerate===true?'possible':'in_app_only'},
      reasons:{overall:state,prayer:prayer.reason||null,sync:sync.reason||null}
    };
  }
  function reminderCrossSurfaceLayer(name,code,owner,reason,evidence){
    return {name:name,code:code,owner:owner,reason:reason||null,evidence:evidence||'synthetic-boundary'};
  }
  function reminderCrossSurfaceReceiptEvidence(receipt){
    var x=receipt&&typeof receipt==='object'?receipt:{}, status=String(x.status||'idle'), required=['snapshotRevision','sourceLatestSha','acceptedAt'], missing=[];
    required.forEach(function(key){ if(typeof x[key]!=='string'||!x[key]) missing.push(key); });
    if(status==='accepted'&&missing.length) return {ok:false,code:'receipt_missing',reason:'accepted-proof-incomplete',missingProof:missing};
    if(status==='accepted') return {ok:true,code:'accepted',reason:null,missingProof:[]};
    if(status==='offline') return {ok:false,code:'offline',reason:'sync-offline',missingProof:[]};
    if(status==='conflict'||x.lastErrorCode==='conflict') return {ok:false,code:'conflict',reason:'sync-conflict',missingProof:[]};
    if(status==='error'||x.lastErrorCode) return {ok:false,code:'error',reason:'sync-error',missingProof:[]};
    if(status==='queued'||status==='saving'||status==='retrying'||status==='local_saved') return {ok:false,code:'pending',reason:'sync-pending',missingProof:[]};
    return {ok:false,code:'missing',reason:'sync-not-accepted',missingProof:[]};
  }
  function reminderCrossSurfaceCapability(input){
    var x=input&&typeof input==='object'?input:{}, c=x.capability&&typeof x.capability==='object'?x.capability:{}, permission=String(c.permissionState||x.permissionState||'granted'), prayer=String(c.prayerState||x.prayerState||'fresh'), inApp=c.inApp==='blocked'?'blocked':'available', native='possible';
    if(permission==='denied'||permission==='unsupported'||permission==='temporary-error'||permission==='pwa-limited'||permission==='revoked') native='blocked';
    if(prayer==='stale'||prayer==='unavailable'){ inApp='blocked'; return reminderCrossSurfaceLayer('capability','blocked','app-status','prayer-'+prayer,{inApp:inApp,native:native,prayer:'blocked'}); }
    return reminderCrossSurfaceLayer('capability',inApp==='available'?'available':'blocked','app-status',native==='blocked'?'native-permission-denied':null,{inApp:inApp,native:native,prayer:'available'});
  }
  function reminderCrossSurfaceStatus(input){
    var x=input&&typeof input==='object'?input:{}, local=x.local&&typeof x.local==='object'?x.local:{}, delivery=x.delivery&&typeof x.delivery==='object'?x.delivery:{}, sync=x.sync&&typeof x.sync==='object'?x.sync:{}, projection=x.projection&&typeof x.projection==='object'?x.projection:{}, panel=x.panel&&typeof x.panel==='object'?x.panel:{}, cap=reminderCrossSurfaceCapability(x), receiptEvidence=reminderCrossSurfaceReceiptEvidence(sync.receipt||x.receipt), configured=sync.configured!==false&&x.configured!==false;
    var localScheduled=local.scheduled===true||x.localScheduled===true, localLayer=reminderCrossSurfaceLayer('localScheduled',localScheduled?'scheduled':'not_scheduled','local-scheduler',localScheduled?null:'schedule-not-created',{scheduled:localScheduled});
    var deliveredStatus=String(delivery.status||''), delivered=delivery.delivered===true||deliveredStatus==='delivered'||deliveredStatus==='shown'||deliveredStatus==='opened', deliveryCode=delivered?'delivered':(deliveredStatus==='suppressed'||delivery.suppressed===true?'suppressed':deliveredStatus==='error'?'error':'not_delivered');
    var deliveredLayer=reminderCrossSurfaceLayer('delivered',deliveryCode,'local-delivery',delivered?null:(deliveryCode==='error'?'delivery-error':'delivery-not-confirmed'),{channel:delivery.channel==='native'?'native':'in_app'});
    var syncCode=!configured?'not_configured':x.offline===true?'offline':receiptEvidence.code==='accepted'?'accepted':receiptEvidence.code==='receipt_missing'?'unverified':receiptEvidence.code==='conflict'?'conflict':receiptEvidence.code==='error'?'error':receiptEvidence.code==='pending'?'pending':'missing';
    var syncReason=syncCode==='accepted'?null:syncCode==='offline'?'sync-offline':syncCode==='not_configured'?'sync-not-configured':receiptEvidence.reason;
    var syncLayer=reminderCrossSurfaceLayer('syncAccepted',syncCode,'sync-receipt',syncReason,{proof:syncCode==='accepted'?'complete':'incomplete'});
    var projectionReason=String(projection.reason||projection.status||''), projectionCode=projection.built===true||projectionReason==='ready'||projection.status==='built'?'built':projectionReason==='projection_stale'||projection.stale===true?'stale':projectionReason==='projection_invalid'||projectionReason==='projection_parse_failed'||projection.error===true?'error':'missing';
    var projectionLayer=reminderCrossSurfaceLayer('projectionBuilt',projectionCode,'projection',projectionCode==='built'?null:(projectionCode==='stale'?'projection-stale':projectionCode==='error'?'projection-error':'projection-missing'),{source:projection.source==='projection'?'projection':'fallback'});
    var panelPoll=String(panel.pollStatus||panel.status||''), panelVisible=panel.visible===true, panelCode=panel.error===true||panelPoll==='error'?'error':panelPoll==='304'||panelPoll==='not_modified'?(panelVisible?'not_modified':'not_visible'):panelVisible?'visible':panel.deferred===true?'deferred':'not_visible';
    var panelLayer=reminderCrossSurfaceLayer('panelVisible',panelCode,'observer-panel',panelCode==='not_modified'?'panel-304-preserved':panelCode==='visible'?null:panelCode==='error'?'panel-error':'panel-not-visible',{conditional:panelPoll==='304'||panelPoll==='not_modified'});
    var deviceCode=x.device&&x.device.accepted===true||x.deviceAccepted===true?'accepted':'unverified', deviceLayer=reminderCrossSurfaceLayer('deviceAccepted',deviceCode,'user-device',deviceCode==='accepted'?null:'device-acceptance-unverified',{userEvidence:deviceCode==='accepted'});
    var layers={capability:cap,localScheduled:localLayer,delivered:deliveredLayer,syncAccepted:syncLayer,projectionBuilt:projectionLayer,panelVisible:panelLayer,deviceAccepted:deviceLayer}, blockers=[];
    function needs(name,codes){ if(codes.indexOf(layers[name].code)<0) blockers.push({layer:name,code:layers[name].code,reason:layers[name].reason}); }
    needs('capability',['available']); needs('localScheduled',['scheduled']); needs('delivered',['delivered']); needs('syncAccepted',['accepted']); needs('projectionBuilt',['built']); needs('panelVisible',['visible','not_modified']); needs('deviceAccepted',['accepted']);
    var claim=blockers.length===0, hasUnverified=blockers.some(function(b){return b.code==='unverified';}), overall=claim?'accepted':hasUnverified?'unverified':'partial';
    var out={schemaVersion:1,layers:layers,overall:{code:overall,claim:claim,green:claim,blockers:blockers},blockers:blockers,claim:claim};
    var previous=x.previousStatus||x.previous; if(previous) out.transition=reminderCrossSurfaceTransition(previous,out);
    return out;
  }
  function reminderCrossSurfaceRank(layer,code){
    var ranks={capability:{blocked:0,available:2},localScheduled:{not_scheduled:0,scheduled:2},delivered:{not_delivered:0,error:0,suppressed:1,delivered:2},syncAccepted:{missing:0,offline:0,conflict:0,error:0,not_configured:1,pending:1,unverified:1,accepted:2},projectionBuilt:{missing:0,error:0,stale:1,built:2},panelVisible:{not_visible:0,error:0,deferred:1,visible:2,not_modified:2},deviceAccepted:{unverified:0,accepted:2}};
    return ranks[layer]&&Object.prototype.hasOwnProperty.call(ranks[layer],code)?ranks[layer][code]:0;
  }
  function reminderCrossSurfaceTransition(previous,current){
    var p=previous&&previous.layers?previous.layers:{}, n=current&&current.layers?current.layers:{}, changes=[], rose=false, fell=false;
    ['capability','localScheduled','delivered','syncAccepted','projectionBuilt','panelVisible','deviceAccepted'].forEach(function(name){ var from=p[name]&&p[name].code||'missing', to=n[name]&&n[name].code||'missing'; if(from===to) return; var fromRank=reminderCrossSurfaceRank(name,from), toRank=reminderCrossSurfaceRank(name,to), regression=toRank<fromRank; changes.push({layer:name,from:from,to:to,direction:regression?'regression':toRank>fromRank?'advance':'lateral',reason:n[name]&&n[name].reason||'status-changed'}); if(regression) fell=true; else if(toRank>fromRank) rose=true; });
    return {direction:!changes.length?'unchanged':fell?'regression':rose?'advance':'lateral',nonMonotonic:fell,changes:changes};
  }
  function reminderSystemStatusCopy(kind,state){
    var copy={
      overall:{
        fresh:{label:reminderCopy('inApp.status.overall.fresh.label','Durum güncel'),detail:reminderCopy('inApp.status.overall.fresh.detail','Yerel reminder akışı kullanılabilir.')},
        stale:{label:reminderCopy('inApp.status.overall.stale.label','Vakit verisi eski'),detail:reminderCopy('inApp.status.overall.stale.detail','Yeni vakit reminderı üretilmiyor; güncel veri gelene kadar bekleniyor.')},
        unavailable:{label:reminderCopy('inApp.status.overall.unavailable.label','Vakit verisi hazır değil'),detail:reminderCopy('inApp.status.overall.unavailable.detail','Vakit verisi olmadan bu reminder oluşturulmaz; diğer uygulama içi alanlar açık kalır.')},
        offline:{label:reminderCopy('inApp.status.overall.offline.label','Çevrimdışısın'),detail:reminderCopy('inApp.status.overall.offline.detail','Yerel kayıt korunur; native kanal ve ağ gerektiren yenilemeler bağlantı dönene kadar bekler.')},
        recovery:{label:reminderCopy('inApp.status.overall.recovery.label','Bağlantı geri geldi'),detail:reminderCopy('inApp.status.overall.recovery.detail','Varsa son 24 saat tek kontrollü uygulama içi özette kalır; geçmiş native olarak yeniden oynatılmaz.')}
      },
      prayer:{
        fresh:{label:reminderCopy('inApp.status.prayer.fresh.label','Vakit verisi güncel'),detail:reminderCopy('inApp.status.prayer.fresh.detail','Vakit kaynağı bu yerel gün için kullanılabilir.')},
        stale:{label:reminderCopy('inApp.status.prayer.stale.label','Vakit verisi eski'),detail:reminderCopy('inApp.status.prayer.stale.detail','Yeni vakitmiş gibi uygulama içi veya native reminder gösterilmiyor.')},
        unavailable:{label:reminderCopy('inApp.status.prayer.unavailable.label','Vakit verisi kullanılamıyor'),detail:reminderCopy('inApp.status.prayer.unavailable.detail','Tamamlanmamış veya doğrulanamayan veriyle reminder üretilmiyor.')}
      },
      permission:{},
      sync:{},
      background:{unsupported:{label:reminderCopy('inApp.status.background.unsupported.label','Arka plan zamanlaması garanti değil'),detail:reminderCopy('inApp.status.background.unsupported.detail','Uygulama kapalıyken kesin yerel alarm vaadi yok; foreground ve açılış catch-up sınırı kullanılır.')}}
    };
    // REM-52: `revoked` has no lexicon entry yet (the catalog is frozen content
    // outside this prompt's scope), so it carries an explicit honest fallback
    // instead of the generic one.
    var permissionFallback={revoked:{label:'Native izin geri alınmış',detail:'Daha önce verilen izin şu anda kapalı; uygulama içi reminderlar açık kalır ve izin kendiliğinden yeniden istenmez.'}};
    ['granted','denied','unsupported','default','revoked','temporary-error','pwa-limited'].forEach(function(permissionState){
      var fb=permissionFallback[permissionState]||{label:'Native durum',detail:'Uygulama içi reminder korunur.'};
      copy.permission[permissionState]={label:reminderCopy('inApp.status.permission.'+permissionState+'.label',fb.label),detail:reminderCopy('inApp.status.permission.'+permissionState+'.detail',fb.detail)};
    });
    ['disabled','idle','synced','pending','offline','error'].forEach(function(syncState){
      copy.sync[syncState]={label:reminderCopy('inApp.status.sync.'+syncState+'.label','Senkron durumu'),detail:reminderCopy('inApp.status.sync.'+syncState+'.detail','Yerel reminder deneyimi korunur.')};
    });
    var group=copy[kind]||copy.overall, value=group[state]||group.unavailable||group.idle||group.unsupported||group.fresh||{label:'Durum bilinmiyor',detail:'Uygulama içi güvenli akış korunur.'};
    return {label:value.label,detail:value.detail};
  }
  function reminderSystemStatusHTML(){
    var last=reminderLifecycleState.lastResult||{}, report=reminderSystemStatus({nowIso:new Date().toISOString(),online:!reminderSystemOffline(),permissionState:reminderPermissionSnapshot(),configured:syncConfigured(),receipt:data&&data.syncReceipt,recovery:last.recoveryState==='recovery'}), overall=reminderSystemStatusCopy('overall',report.state), entries=[{kind:'overall',state:report.state,label:'Genel durum'},{kind:'prayer',state:report.prayerState,label:'Vakit verisi'},{kind:'permission',state:report.permissionState,label:'Native izin'},{kind:'sync',state:report.syncState,label:'Senkron'},{kind:'background',state:report.backgroundState,label:'Arka plan'}], h='<section id="sey-reminder-system-status" class="sey-reminder-system-status" data-reminder-render-target="reminder-center-status" data-reminder-system-state="'+esc(report.state)+'" aria-labelledby="sey-reminder-system-title" aria-describedby="sey-reminder-system-help"><div class="sey-reminder-section-head"><div><span class="sey-reminder-eyebrow">DÜRÜST SİSTEM DURUMU</span><h3 id="sey-reminder-system-title">Ne mümkün, ne bekliyor?</h3></div><span class="sey-reminder-status-pill" data-reminder-capability-state="'+esc(report.state)+'">'+esc(overall.label)+'</span></div><p id="sey-reminder-system-help" class="sey-reminder-profile-note">'+esc(overall.detail)+'</p><div class="sey-reminder-system-list" role="list" aria-label="Reminder capability durumları">';
    entries.forEach(function(item){ var copy=reminderSystemStatusCopy(item.kind,item.state), attr=item.kind==='permission'?(item.state==='denied'?'permission-denied':item.state):item.kind==='sync'?'sync-'+item.state:item.state; h+='<div class="sey-reminder-system-row" role="listitem" data-reminder-capability="'+esc(item.kind)+'" data-reminder-capability-state="'+esc(attr)+'"><span class="sey-reminder-system-dot" aria-hidden="true"></span><span class="sey-reminder-system-copy"><strong>'+esc(item.label)+' · '+esc(copy.label)+'</strong><small>'+esc(copy.detail)+'</small></span></div>'; });
    h+='</div><p class="sey-reminder-system-safe" role="status" aria-live="polite">'+icon(report.state==='fresh'?'circle-check':report.state==='recovery'?'rotate-ccw':'info',14)+' '+esc(reminderCopy('inApp.status.safe','Reminder deneyimi yerelde devam eder; sistem verisi eskiyse yeni vakit reminderı sessizce uydurulmaz.'))+'</p></section>';
    return h;
  }
  var REMINDER_ZIKR_ID='reminder.catalog.v1.zikr';
  var REMINDER_ZIKR_FREQUENCIES={weekly:true,'selected-window':true};
  var REMINDER_ZIKR_MIN_INTERVAL_DAYS=7;
  function reminderZikrFailure(reason,extra){ return Object.assign({ok:false,occurrence:null,reason:String(reason||'invalid-zikr-data'),stale:false,replay:false,nativeReplay:false},extra||{}); }
  function reminderZikrFeatureEnabled(input){
    var x=input&&typeof input==='object'?input:{};
    if(typeof x.featureEnabled==='boolean') return x.featureEnabled;
    if(typeof x.featureVisible==='boolean') return x.featureVisible;
    if(typeof x.zikrFeatureVisible==='boolean') return x.zikrFeatureVisible;
    return ZIKR_V2_VISIBLE===true&& (typeof featuresLive!=='function'||featuresLive());
  }
  function reminderZikrPreferenceSelected(preference){ return !!(preference&&typeof preference==='object'&&!Array.isArray(preference)&&preference.enabled===true); }
  function reminderZikrDefinition(input){
    var x=input&&typeof input==='object'?input:{}, fallback={id:REMINDER_ZIKR_ID,category:'ritual',priority:'P2',triggerType:'scheduled-window',deepLink:'zikr',definitionVersion:'1',defaultWindow:{kind:'time-range',timezone:'user',start:'09:00',end:'22:00'}};
    if(x.definition&&typeof x.definition==='object') return x.definition;
    if(typeof ReminderCatalogV1!=='undefined'&&ReminderCatalogV1.get){ var def=ReminderCatalogV1.get(REMINDER_ZIKR_ID); if(def) return def; }
    return fallback;
  }
  function reminderZikrSource(input){
    var x=input&&typeof input==='object'?input:{}, source=x.zikrData&&typeof x.zikrData==='object'?x.zikrData:(x.zikr&&typeof x.zikr==='object'?x.zikr:(data&&data.zikr&&typeof data.zikr==='object'?data.zikr:null));
    return source&&typeof source==='object'&&!Array.isArray(source)?source:null;
  }
  function reminderZikrLocalContext(input,timezone){
    var x=input&&typeof input==='object'?input:{}, nowValue=x.nowIso||x.instantIso||x.now||'', instantMs=reminderEngineInstantMs({instantIso:nowValue}), parts=instantMs===null?null:reminderEngineLocalParts(instantMs,timezone), localDate=String(x.localDate||x.nowLocalDate||(parts&&parts.localDate)||''), localTime=String(x.localTime||x.nowLocalTime||(parts&&parts.localTime)||'');
    return {nowIso:String(nowValue||''),instantMs:instantMs,localDate:localDate,localTime:localTime};
  }
  function reminderZikrWeekday(localDate){
    if(!reminderEngineValidDate(localDate)) return -1;
    var p=localDate.split('-').map(Number); return new Date(Date.UTC(p[0],p[1]-1,p[2])).getUTCDay();
  }
  function reminderZikrDaysAllowed(preference,journey,localDate){
    var p=preference&&typeof preference==='object'?preference:{}, raw=journey?(Array.isArray(p.journeyDaysOfWeek)?p.journeyDaysOfWeek:(Array.isArray(p.daysOfWeek)?p.daysOfWeek:null)):(Array.isArray(p.daysOfWeek)?p.daysOfWeek:null);
    if(!raw) return true;
    var day=reminderZikrWeekday(localDate||'');
    return day>=0&&raw.indexOf(day)>=0;
  }
  function reminderZikrWindow(preference,definition,journey){
    var p=preference&&typeof preference==='object'?preference:{}, d=definition&&typeof definition==='object'?definition:{}, raw=journey?(p.journeyWindow||p.timeWindow):(p.timeWindow);
    if(!raw) raw=d.defaultWindow;
    if(!raw||typeof raw!=='object'||!validReminderTime(raw.start)||!validReminderTime(raw.end)) return null;
    return {start:String(raw.start),end:String(raw.end)};
  }
  function reminderZikrWindowDue(window,localTime){
    if(!window) return false;
    var now=reminderPolicyTimeMinutes(localTime), start=reminderPolicyTimeMinutes(window.start), end=reminderPolicyTimeMinutes(window.end);
    if(now===null||start===null||end===null||start===end) return false;
    return start<end?now>=start&&now<=end:now>=start||now<=end;
  }
  function reminderZikrOccurrenceId(kind,parts){
    var values=[kind].concat(parts||[]).map(function(value){ return encodeURIComponent(String(value==null?'':value)); });
    return 'reminder-zikr-v1:'+values.join('|');
  }
  function reminderZikrMakeOccurrence(input,definition,context,window,kind,sourceRevision){
    var x=input&&typeof input==='object'?input:{}, d=definition&&typeof definition==='object'?definition:{}, engineDefinition={id:REMINDER_ZIKR_ID,category:'ritual',priority:'P2',triggerType:'fixed-time',time:window&&window.start||'',definitionVersion:String(d.definitionVersion||'1')}, generated=reminderEngineAdapterGenerateOccurrence({definition:engineDefinition,reminderId:REMINDER_ZIKR_ID,localDate:context.localDate,nowLocalDate:context.localDate,nowLocalTime:context.localTime,timezone:String(x.timezone||'Europe/Istanbul'),instantIso:context.nowIso,sourceRevision:sourceRevision||'zikr-reminder-v1'});
    if(!generated.ok||!generated.occurrence) return generated;
    var occurrence=Object.assign({},generated.occurrence,{occurrenceId:reminderZikrOccurrenceId(kind,[context.localDate,window.start,sourceRevision||'']),category:'ritual',deepLink:'zikr',triggerType:kind==='reflection'?'session-reflection':'scheduled-window',sourceRevision:String(sourceRevision||'zikr-reminder-v1'),past:false,replay:false,nativeReplay:false,shouldReplay:false,due:reminderZikrWindowDue(window,context.localTime)});
    return Object.assign({},generated,occurrence,{occurrence:occurrence,kind:kind});
  }
  function reminderZikrDailyOccurrence(input){
    var x=input&&typeof input==='object'?input:{}, preference=x.preference&&typeof x.preference==='object'?x.preference:{}, definition=reminderZikrDefinition(x);
    if(!reminderZikrFeatureEnabled(x)) return reminderZikrFailure('feature-disabled',{featureVisible:false});
    if(!reminderZikrPreferenceSelected(preference)) return reminderZikrFailure('preference-not-selected');
    if(preference.dailyEnabled===false||preference.dailyInvite===false) return reminderZikrFailure('daily-disabled');
    var timezone=String(x.timezone||preference.timezone||'Europe/Istanbul'), context=reminderZikrLocalContext(x,timezone);
    if(!reminderEngineValidDate(context.localDate)) return reminderZikrFailure('invalid-local-date');
    if(!reminderZikrDaysAllowed(preference,false,context.localDate)) return reminderZikrFailure('outside-selected-days');
    var window=reminderZikrWindow(preference,definition,false); if(!window) return reminderZikrFailure('invalid-zikr-window');
    return reminderZikrMakeOccurrence(Object.assign({},x,{timezone:timezone}),definition,context,window,'daily','daily:'+context.localDate);
  }
  function reminderZikrJourneyActive(journey){
    if(!journey||typeof journey!=='object') return false;
    if(Array.isArray(journey.hatims)&&journey.hatims.length){
      if(journey.activeHatimId){ for(var i=0;i<journey.hatims.length;i++) if(journey.hatims[i]&&journey.hatims[i].id===journey.activeHatimId) return journey.hatims[i].status==='active'; }
      return journey.hatims.some(function(h){ return h&&h.status==='active'; });
    }
    return Number(journey.lifetimeCount)>0;
  }
  function reminderZikrJourneyEntry(input,preference){
    var source=reminderZikrSource(input), journeys=source&&source.journeys&&typeof source.journeys==='object'?source.journeys:{}, p=preference&&typeof preference==='object'?preference:{}, requested=String(p.presetId||p.zikrPresetId||(source.settings&&source.settings.activePresetId)||''), ids=Object.keys(journeys).sort();
    if(requested&&!journeys[requested]) return null;
    if(requested) ids=[requested].concat(ids.filter(function(id){ return id!==requested; }));
    for(var i=0;i<ids.length;i++){
      var id=ids[i], journey=journeys[id]; if(!reminderZikrJourneyActive(journey)) continue;
      var lastAt=String(journey.lastAt||''); if(!lastAt||!Number.isFinite(Date.parse(lastAt))) continue;
      return {presetId:id,journey:journey,lastAt:lastAt};
    }
    return null;
  }
  function reminderZikrJourneyOccurrence(input){
    var x=input&&typeof input==='object'?input:{}, preference=x.preference&&typeof x.preference==='object'?x.preference:{}, definition=reminderZikrDefinition(x), frequency=String(preference.journeyFrequency||'weekly');
    if(!reminderZikrFeatureEnabled(x)) return reminderZikrFailure('feature-disabled',{featureVisible:false});
    if(!reminderZikrPreferenceSelected(preference)) return reminderZikrFailure('preference-not-selected');
    if(preference.journeyEnabled!==true) return reminderZikrFailure('journey-not-selected');
    if(!REMINDER_ZIKR_FREQUENCIES[frequency]) return reminderZikrFailure('invalid-journey-frequency');
    var timezone=String(x.timezone||preference.timezone||'Europe/Istanbul'), context=reminderZikrLocalContext(x,timezone), entry=reminderZikrJourneyEntry(x,preference);
    if(!entry) return reminderZikrFailure('no-active-journey');
    if(!reminderEngineValidDate(context.localDate)||context.instantMs===null) return reminderZikrFailure('invalid-journey-clock');
    var lastMs=Date.parse(entry.lastAt), ageMs=context.instantMs-lastMs, minDays=Number.isInteger(preference.journeyMinIntervalDays)?Math.max(REMINDER_ZIKR_MIN_INTERVAL_DAYS,Math.min(30,preference.journeyMinIntervalDays)):REMINDER_ZIKR_MIN_INTERVAL_DAYS;
    if(ageMs<minDays*86400000) return reminderZikrFailure('journey-too-soon');
    if(frequency==='selected-window'&&!preference.journeyWindow&&!preference.timeWindow) return reminderZikrFailure('journey-window-not-selected');
    if(!reminderZikrDaysAllowed(preference,true,context.localDate)) return reminderZikrFailure('outside-selected-days');
    var window=reminderZikrWindow(preference,definition,true); if(!window) return reminderZikrFailure('invalid-journey-window');
    var intervalDays=frequency==='weekly'?REMINDER_ZIKR_MIN_INTERVAL_DAYS:minDays, intervalBucket=Math.floor(ageMs/(intervalDays*86400000)), result=reminderZikrMakeOccurrence(Object.assign({},x,{timezone:timezone}),definition,context,window,'journey','journey:'+entry.presetId+':'+entry.lastAt+':'+frequency+':'+intervalBucket), occurrence=result.occurrence;
    if(!result.ok||!occurrence) return result;
    occurrence.occurrenceId=reminderZikrOccurrenceId('journey',[entry.presetId,entry.lastAt,frequency,intervalBucket,window.start,window.end]); occurrence.journeyPresetId=entry.presetId; occurrence.frequency=frequency; occurrence.intervalBucket=intervalBucket; occurrence.due=reminderZikrWindowDue(window,context.localTime);
    return Object.assign({},result,occurrence,{occurrence:occurrence,kind:'journey'});
  }
  function reminderZikrReflectionOccurrence(input){
    var x=input&&typeof input==='object'?input:{}, preference=x.preference&&typeof x.preference==='object'?x.preference:{}, definition=reminderZikrDefinition(x), source=reminderZikrSource(x), session=x.session&&typeof x.session==='object'?x.session:(source&&source.activeSession&&typeof source.activeSession==='object'?source.activeSession:null);
    if(!reminderZikrFeatureEnabled(x)) return reminderZikrFailure('feature-disabled',{featureVisible:false});
    if(!reminderZikrPreferenceSelected(preference)) return reminderZikrFailure('preference-not-selected');
    if(preference.reflectionAfterSession!==true) return reminderZikrFailure('reflection-optional-off');
    if(!session||Number(session.count)<=0) return reminderZikrFailure('no-ended-session');
    var ended=!!(session.endedAt||session.completedAt||session.pausedAt||session.status==='ended'||session.status==='paused');
    if(!ended) return reminderZikrFailure('session-still-open');
    var timezone=String(x.timezone||preference.timezone||'Europe/Istanbul'), context=reminderZikrLocalContext(x,timezone), date=String(session.date||context.localDate), presetId=String(session.presetId||preference.presetId||'');
    if(!reminderEngineValidDate(context.localDate)||!presetId) return reminderZikrFailure('invalid-session');
    var reflections=source&&Array.isArray(source.reflections)?source.reflections:[];
    if(reflections.some(function(ref){ return ref&&String(ref.date||'')===date&&String(ref.presetId||'')===presetId; })) return reminderZikrFailure('reflection-already-recorded');
    var localTime=context.localTime&&context.localTime.slice(0,5); if(!validReminderTime(localTime)) return reminderZikrFailure('invalid-session-clock');
    var result=reminderZikrMakeOccurrence(Object.assign({},x,{timezone:timezone}),definition,context,{start:localTime,end:localTime},'reflection','reflection:'+String(session.id||date+'|'+presetId)), occurrence=result.occurrence;
    if(!result.ok||!occurrence) return result;
    occurrence.occurrenceId=reminderZikrOccurrenceId('reflection',[String(session.id||date+'|'+presetId)]); occurrence.reflectionOptional=true; occurrence.due=true; occurrence.past=false; occurrence.nativeAllowed=false; occurrence.channel='in_app';
    return Object.assign({},result,occurrence,{occurrence:occurrence,kind:'reflection'});
  }
  function reminderZikrOccurrences(input){
    var x=input&&typeof input==='object'?input:{}, out=[], daily=reminderZikrDailyOccurrence(x), journey=reminderZikrJourneyOccurrence(x), reflection=reminderZikrReflectionOccurrence(x);
    [daily,journey,reflection].forEach(function(result){ if(result&&result.ok&&result.occurrence) out.push(result); });
    return out;
  }
  function reminderZikrReflectionPolicy(definition,preference,context){
    var safePreference=Object.assign({},preference||{}, {channel:'in_app'}), policy=reminderPolicyEvaluate({definition:definition,preference:safePreference,context:context});
    policy.requestedChannel='in_app'; policy.nativeAllowed=false; policy.nativeOccurrence=false; policy.channel='in_app'; return policy;
  }
  function reminderZikrLifecycleCandidates(input){
    var x=input&&typeof input==='object'?input:{}, preference=x.preference&&typeof x.preference==='object'?x.preference:{}, definition=reminderZikrDefinition(x);
    if(!reminderZikrFeatureEnabled(x)||!reminderZikrPreferenceSelected(preference)) return [];
    var results=reminderZikrOccurrences(x), out=[];
    results.forEach(function(result){
      var candidate={occurrence:result.occurrence,definition:definition,preference:preference,due:result.occurrence.due,userSelected:true};
      if(result.kind==='reflection') candidate.policy=reminderZikrReflectionPolicy(definition,preference,x.context||{});
      out.push(candidate);
    });
    return out;
  }
  var REMINDER_THERAPY_ID='reminder.catalog.v1.therapy';
  var REMINDER_THERAPY_TOOL_IDS={firstStep:true,selfCompassion:true,breath:true,thought:true};
  var REMINDER_THERAPY_TOOL_ALIASES={
    'first-step':'firstStep','first_step':'firstStep','firststep':'firstStep',
    'self-compassion':'selfCompassion','self_compassion':'selfCompassion','selfcare':'selfCompassion',
    breathing:'breath','breathwork':'breath',
    cbt:'thought','thought-record':'thought','thought_record':'thought','cognitive':'thought'
  };
  var REMINDER_THERAPY_FREQUENCIES={daily:true,weekly:true,'selected-window':true};
  function reminderTherapyFailure(reason,extra){ return Object.assign({ok:false,occurrence:null,reason:String(reason||'invalid-therapy-preference'),stale:false,replay:false,nativeReplay:false},extra||{}); }
  function reminderTherapyDefinition(input){
    var x=input&&typeof input==='object'?input:{}, fallback={id:REMINDER_THERAPY_ID,category:'support',priority:'P2',triggerType:'scheduled-window',deepLink:'room',definitionVersion:'1',defaultWindow:{kind:'time-range',timezone:'user',start:'10:00',end:'21:00'}};
    if(x.definition&&typeof x.definition==='object') return x.definition;
    if(typeof ReminderCatalogV1!=='undefined'&&ReminderCatalogV1.get){ var def=ReminderCatalogV1.get(REMINDER_THERAPY_ID); if(def) return def; }
    return fallback;
  }
  function reminderTherapyToolFromValue(value){
    var raw=String(value||'').trim(), key=raw.toLowerCase();
    if(REMINDER_THERAPY_TOOL_IDS[raw]) return raw;
    return REMINDER_THERAPY_TOOL_ALIASES[key]||'';
  }
  function reminderTherapyToolId(input){
    var x=input&&typeof input==='object'?input:{};
    return reminderTherapyToolFromValue(x.therapyToolId||x.toolId||x.practiceId||x.selectedPractice||x.selectedTool||x.practice||'');
  }
  function reminderTherapySelectedTool(preference){
    var p=preference&&typeof preference==='object'&&!Array.isArray(preference)?preference:{};
    return p.enabled===true?reminderTherapyToolId(p):'';
  }
  function reminderTherapyPreferenceSelected(preference){ return !!reminderTherapySelectedTool(preference); }
  function reminderTherapyLocalContext(input,timezone){
    var x=input&&typeof input==='object'?input:{}, nowValue=x.nowIso||x.instantIso||x.now||'', instantMs=reminderEngineInstantMs({instantIso:nowValue}), parts=instantMs===null?null:reminderEngineLocalParts(instantMs,timezone), localDate=String(x.localDate||x.nowLocalDate||(parts&&parts.localDate)||''), localTime=String(x.localTime||x.nowLocalTime||(parts&&parts.localTime)||'');
    return {nowIso:String(nowValue||''),instantMs:instantMs,localDate:localDate,localTime:localTime};
  }
  function reminderTherapyWeekday(localDate){
    if(!reminderEngineValidDate(localDate)) return -1;
    var p=localDate.split('-').map(Number); return new Date(Date.UTC(p[0],p[1]-1,p[2])).getUTCDay();
  }
  function reminderTherapyFrequency(preference){
    var p=preference&&typeof preference==='object'?preference:{}, frequency=String(p.frequency||p.therapyFrequency||'weekly');
    return REMINDER_THERAPY_FREQUENCIES[frequency]?frequency:'';
  }
  function reminderTherapyWindow(preference,definition,frequency){
    var p=preference&&typeof preference==='object'?preference:{}, d=definition&&typeof definition==='object'?definition:{}, explicit=p.therapyWindow||p.timeWindow, raw=explicit||d.defaultWindow;
    if(frequency==='selected-window'&&!explicit) return null;
    if(!raw||typeof raw!=='object'||!validReminderTime(raw.start)||!validReminderTime(raw.end)) return null;
    return {start:String(raw.start),end:String(raw.end),explicit:!!explicit};
  }
  function reminderTherapyDaysAllowed(preference,frequency,localDate){
    var p=preference&&typeof preference==='object'?preference:{}, raw=Array.isArray(p.daysOfWeek)?p.daysOfWeek:null, day=reminderTherapyWeekday(localDate);
    if(day<0) return false;
    if(raw){ if(!raw.length) return frequency==='daily'; return raw.some(function(value){ return Number.isInteger(value)&&value>=0&&value<=6&&value===day; }); }
    if(frequency==='selected-window') return false;
    if(frequency==='weekly'){
      var anchor=Number.isInteger(p.weeklyDay)?p.weeklyDay:(Number.isInteger(p.dayOfWeek)?p.dayOfWeek:1);
      return anchor>=0&&anchor<=6&&anchor===day;
    }
    return true;
  }
  function reminderTherapyWindowDue(window,localTime){
    if(!window) return false;
    var now=reminderPolicyTimeMinutes(localTime), start=reminderPolicyTimeMinutes(window.start), end=reminderPolicyTimeMinutes(window.end);
    if(now===null||start===null||end===null||start===end) return false;
    return start<end?now>=start&&now<=end:now>=start||now<=end;
  }
  function reminderTherapyOccurrenceId(toolId,frequency,localDate,scheduledAt,timezone){
    return 'reminder-therapy-v1:'+[toolId,frequency,localDate,scheduledAt,timezone].map(function(value){ return encodeURIComponent(String(value||'')); }).join('|');
  }
  function reminderTherapyOccurrence(input){
    var x=input&&typeof input==='object'?input:{}, preference=x.preference&&typeof x.preference==='object'?x.preference:{}, definition=reminderTherapyDefinition(x), toolId=reminderTherapySelectedTool(preference), frequency=reminderTherapyFrequency(preference);
    if(String(x.reminderId||definition.id||REMINDER_THERAPY_ID)!==REMINDER_THERAPY_ID) return reminderTherapyFailure('invalid-reminder-id');
    if(preference.enabled!==true) return reminderTherapyFailure('preference-disabled');
    if(!toolId) return reminderTherapyFailure('preference-not-selected');
    if(!frequency) return reminderTherapyFailure('invalid-therapy-frequency');
    if(frequency==='daily'&&preference.dailyEnabled===false) return reminderTherapyFailure('daily-disabled');
    var timezone=String(x.timezone||preference.timezone||'Europe/Istanbul'), context=reminderTherapyLocalContext(x,timezone);
    if(!reminderEngineValidDate(context.localDate)||context.instantMs===null) return reminderTherapyFailure('invalid-therapy-clock');
    if(!reminderTherapyDaysAllowed(preference,frequency,context.localDate)) return reminderTherapyFailure('outside-selected-days');
    var window=reminderTherapyWindow(preference,definition,frequency); if(!window) return reminderTherapyFailure(frequency==='selected-window'?'therapy-window-not-selected':'invalid-therapy-window');
    var capacity=String(x.capacityMode||x.todayMode||(x.context&&x.context.capacityMode)||'balanced');
    if(capacity==='silent') return reminderTherapyFailure('capacity-silent',{suppressed:true});
    // A light day can never turn a daily choice into more delivery. Let the
    // shared policy suppress the remaining low-priority weekly candidate.
    if(capacity==='light'&&frequency==='daily') return reminderTherapyFailure('capacity-light-reduced',{suppressed:true,reduced:true});
    var engineDefinition={id:REMINDER_THERAPY_ID,category:'support',priority:'P2',triggerType:'fixed-time',time:window.start,definitionVersion:String(definition.definitionVersion||'1')}, generated=reminderEngineAdapterGenerateOccurrence({definition:engineDefinition,reminderId:REMINDER_THERAPY_ID,localDate:context.localDate,nowLocalDate:context.localDate,nowLocalTime:context.localTime,timezone:timezone,instantIso:context.nowIso,sourceRevision:'therapy-reminder-v1'});
    if(!generated.ok||!generated.occurrence) return generated;
    var occurrence=Object.assign({},generated.occurrence,{occurrenceId:reminderTherapyOccurrenceId(toolId,frequency,context.localDate,window.start,timezone),category:'support',deepLink:'room',therapyToolId:toolId,toolId:toolId,toolTarget:'room:'+toolId,frequency:frequency,userSelected:true,forced:false,requiresForm:false,requiresResult:false,scheduledWindow:{start:window.start,end:window.end},due:reminderTherapyWindowDue(window,context.localTime),past:false,replay:false,nativeReplay:false,shouldReplay:false});
    return Object.assign({},generated,occurrence,{occurrence:occurrence,toolId:toolId,frequency:frequency});
  }
  function reminderTherapyPrivateCopy(input,definition){
    var d=definition&&typeof definition==='object'?definition:reminderTherapyDefinition(input), x=input&&typeof input==='object'?input:{};
    if(String(d.id||'')!==REMINDER_THERAPY_ID&&String(d.deepLink||'')!=='room') return null;
    return {title:'Şeyma’da sana ayırabileceğin sakin bir alan var.',detail:'İstersen küçük bir durak açabilirsin.',deepLink:'room',therapyToolId:reminderTherapyToolId(x.occurrence&&typeof x.occurrence==='object'?x.occurrence:x)};
  }
  function reminderTherapyPolicyPreference(preference){
    var p=preference&&typeof preference==='object'?preference:{}, out={reminderId:REMINDER_THERAPY_ID,enabled:p.enabled===true};
    ['channel','nativeOptIn','quietHoursBehavior','quietHoursException','explicitlySelected','userScheduled','userCreated'].forEach(function(key){ if(Object.prototype.hasOwnProperty.call(p,key)) out[key]=p[key]; });
    return out;
  }
  function reminderTherapyLifecycleCandidates(input){
    var x=input&&typeof input==='object'?input:{}, preference=x.preference&&typeof x.preference==='object'?x.preference:{}, definition=reminderTherapyDefinition(x);
    if(!reminderTherapyPreferenceSelected(preference)) return [];
    var result=reminderTherapyOccurrence(Object.assign({},x,{preference:preference,definition:definition,reminderId:REMINDER_THERAPY_ID}));
    if(!result.ok||!result.occurrence) return [];
    return [{occurrence:result.occurrence,definition:definition,preference:reminderTherapyPolicyPreference(preference),due:result.occurrence.due,userSelected:true}];
  }
  var REMINDER_SAYGI_ID='reminder.catalog.v1.saygi';
  var REMINDER_SAYGI_FREQUENCIES={daily:true};
  function reminderSaygiFailure(reason,extra){ return Object.assign({ok:false,occurrence:null,reason:String(reason||'invalid-saygi-preference'),articleStatus:'unknown',stale:false,replay:false,nativeReplay:false},extra||{}); }
  function reminderSaygiDefinition(input){
    var x=input&&typeof input==='object'?input:{};
    if(x.definition&&typeof x.definition==='object') return x.definition;
    if(typeof ReminderCatalogV1!=='undefined'&&ReminderCatalogV1.get){ var def=ReminderCatalogV1.get(REMINDER_SAYGI_ID); if(def) return def; }
    return {id:REMINDER_SAYGI_ID,category:'ritual',priority:'P3',triggerType:'scheduled-window',deepLink:'saygi',definitionVersion:'1',defaultWindow:{kind:'time-range',timezone:'user',start:'09:00',end:'20:00'}};
  }
  function reminderSaygiFrequency(preference){
    var p=preference&&typeof preference==='object'?preference:{}, frequency=String(p.frequency||p.readingFrequency||'daily');
    return REMINDER_SAYGI_FREQUENCIES[frequency]?frequency:'';
  }
  function reminderSaygiWindow(preference,definition,frequency){
    var p=preference&&typeof preference==='object'?preference:{}, d=definition&&typeof definition==='object'?definition:{}, explicit=p.readingWindow||p.timeWindow, raw=explicit||d.defaultWindow;
    // A Saygı reminder must be user-selected; catalog defaults are preview-only.
    if(!explicit) return null;
    if(!raw||typeof raw!=='object'||!validReminderTime(raw.start)||!validReminderTime(raw.end)) return null;
    return {start:String(raw.start),end:String(raw.end)};
  }
  function reminderSaygiWeekday(localDate){
    if(!reminderEngineValidDate(localDate)) return -1;
    var p=localDate.split('-').map(Number); return new Date(Date.UTC(p[0],p[1]-1,p[2])).getUTCDay();
  }
  function reminderSaygiDaysAllowed(preference,localDate){
    var p=preference&&typeof preference==='object'?preference:{}, day=reminderSaygiWeekday(localDate);
    if(day<0) return false;
    if(!Array.isArray(p.daysOfWeek)) return true;
    return p.daysOfWeek.some(function(value){ return Number.isInteger(value)&&value>=0&&value<=6&&value===day; });
  }
  function reminderSaygiWindowDue(window,localTime){
    if(!window) return false;
    var now=reminderPolicyTimeMinutes(localTime), start=reminderPolicyTimeMinutes(window.start), end=reminderPolicyTimeMinutes(window.end);
    if(now===null||start===null||end===null||start===end) return false;
    return start<end?now>=start&&now<=end:now>=start||now<=end;
  }
  function reminderSaygiPerson(input){
    var x=input&&typeof input==='object'?input:{}, raw=x.person&&typeof x.person==='object'?x.person:null, id=String(x.personId||x.selectedPersonId||(raw&&raw.id)||'');
    if(id){ var selected=saygiPersonById(id); return selected&&selected.id===id?selected:null; }
    return saygiCurrentPerson();
  }
  function reminderSaygiArticleState(person,input){
    var x=input&&typeof input==='object'?input:{}, article=x.article&&typeof x.article==='object'?x.article:null;
    if(!article&&typeof ui!=='undefined'&&ui.saygiArticle&&typeof ui.saygiArticle==='object') article=ui.saygiArticle;
    var localDate=String(x.localDate||todayStr());
    if(article&&saygiArticleReadableFor(person,article,localDate)) return {status:'ready',article:article};
    if(String(x.articleStatus||'')==='error'||(typeof ui!=='undefined'&&ui.saygiError)) return {status:'error',article:null};
    if(String(x.articleStatus||'')==='loading'||(typeof ui!=='undefined'&&ui.saygiLoading)) return {status:'loading',article:null};
    return {status:'missing',article:null};
  }
  function reminderSaygiReadState(person,input){
    var x=input&&typeof input==='object'?input:{}, localDate=String(x.localDate||todayStr()), source=x.readState&&typeof x.readState==='object'?x.readState:x;
    if(source.read===true||source.completed===true) return true;
    if(source.personId&&String(source.personId)!==String(person&&person.id||'')) return false;
    if(source.readAt&&String(source.readAt).slice(0,10)===localDate) return true;
    var day=x.day&&typeof x.day==='object'?x.day:null, saygi=day&&day.saygi&&typeof day.saygi==='object'?day.saygi:null;
    return !!(saygi&&String(saygi.personId||'')===String(person&&person.id||'')&&String(saygi.readAt||'').slice(0,10)===localDate);
  }
  function reminderSaygiOccurrence(input){
    var x=input&&typeof input==='object'?input:{}, preference=x.preference&&typeof x.preference==='object'?x.preference:{}, definition=reminderSaygiDefinition(x), frequency=reminderSaygiFrequency(preference), person=reminderSaygiPerson(x);
    if(String(x.reminderId||definition.id||REMINDER_SAYGI_ID)!==REMINDER_SAYGI_ID) return reminderSaygiFailure('invalid-reminder-id');
    if(preference.enabled!==true) return reminderSaygiFailure('preference-disabled');
    if(!frequency) return reminderSaygiFailure('invalid-saygi-frequency');
    if(preference.dailyEnabled===false) return reminderSaygiFailure('daily-disabled');
    if(!person) return reminderSaygiFailure('invalid-person');
    var timezone=String(x.timezone||preference.timezone||'Europe/Istanbul'), nowValue=x.nowIso||x.instantIso||x.now||'', instantMs=reminderEngineInstantMs({instantIso:nowValue}), parts=instantMs===null?null:reminderEngineLocalParts(instantMs,timezone), localDate=String(x.localDate||x.nowLocalDate||(parts&&parts.localDate)||''), localTime=String(x.localTime||x.nowLocalTime||(parts&&parts.localTime)||'');
    if(!reminderEngineValidDate(localDate)||instantMs===null) return reminderSaygiFailure('invalid-saygi-clock');
    if(!reminderSaygiDaysAllowed(preference,localDate)) return reminderSaygiFailure('outside-selected-days');
    var window=reminderSaygiWindow(preference,definition,frequency); if(!window) return reminderSaygiFailure('reading-window-not-selected');
    var articleState=reminderSaygiArticleState(person,Object.assign({},x,{localDate:localDate}));
    if(articleState.status!=='ready') return reminderSaygiFailure('article-unavailable',{articleStatus:articleState.status,stale:articleState.status==='error'});
    if(reminderSaygiReadState(person,Object.assign({},x,{localDate:localDate}))) return reminderSaygiFailure('already-read',{articleStatus:'ready'});
    var engineDefinition={id:REMINDER_SAYGI_ID,category:'ritual',priority:'P3',triggerType:'fixed-time',time:window.start,definitionVersion:String(definition.definitionVersion||'1')}, generated=reminderEngineAdapterGenerateOccurrence({definition:engineDefinition,reminderId:REMINDER_SAYGI_ID,localDate:localDate,nowLocalDate:localDate,nowLocalTime:localTime,timezone:timezone,instantIso:nowValue,sourceRevision:'saygi-reading-v1'});
    if(!generated.ok||!generated.occurrence) return generated;
    var occurrence=Object.assign({},generated.occurrence,{occurrenceId:'reminder-saygi-v1:'+encodeURIComponent(localDate),category:'ritual',deepLink:'saygi',openDetail:true,personId:person.id,articleStatus:'ready',readAction:'markSaygiRead',frequency:frequency,userSelected:true,forced:false,readRequired:true,scheduledWindow:{start:window.start,end:window.end},due:reminderSaygiWindowDue(window,localTime),past:false,replay:false,nativeReplay:false,shouldReplay:false});
    return Object.assign({},generated,occurrence,{occurrence:occurrence,personId:person.id,frequency:frequency,articleStatus:'ready'});
  }
  function reminderSaygiPrivateCopy(input,definition){
    var d=definition&&typeof definition==='object'?definition:reminderSaygiDefinition(input);
    if(String(d.id||'')!==REMINDER_SAYGI_ID&&String(d.deepLink||'')!=='saygi') return null;
    return {title:'Bugünün ilham durağı hazır',detail:'Birkaç dakikan varsa bugünkü okumayı açabilirsin.',deepLink:'saygi',openDetail:true};
  }
  function reminderSaygiPolicyPreference(preference){
    var p=preference&&typeof preference==='object'?preference:{}, out={reminderId:REMINDER_SAYGI_ID,enabled:p.enabled===true};
    ['channel','nativeOptIn','quietHoursBehavior','quietHoursException','explicitlySelected','userScheduled','userCreated'].forEach(function(key){ if(Object.prototype.hasOwnProperty.call(p,key)) out[key]=p[key]; });
    return out;
  }
  function reminderSaygiLifecycleCandidates(input){
    var x=input&&typeof input==='object'?input:{}, preference=x.preference&&typeof x.preference==='object'?x.preference:{}, definition=reminderSaygiDefinition(x);
    if(preference.enabled!==true) return [];
    var result=reminderSaygiOccurrence(Object.assign({},x,{preference:preference,definition:definition,reminderId:REMINDER_SAYGI_ID}));
    if(!result.ok||!result.occurrence) return [];
    return [{occurrence:result.occurrence,definition:definition,preference:reminderSaygiPolicyPreference(preference),due:result.occurrence.due,userSelected:true}];
  }
  var REMINDER_DELIVERY_SCHEMA_VERSION=2;
  var REMINDER_DELIVERY_KEY='seyma-reminder-delivery-v1';
  var REMINDER_STATE_OWNER_CONTRACT={
    schemaVersion:1,
    definition:{owner:'ReminderCatalogV1',storage:'code/catalog',persisted:false,privacyClass:'P0'},
    preference:{owner:'data.reminders.preferences',storage:'localStorage:seyma-reset-v1',persisted:true,sync:'blocked-before-sync',privacyClass:'P2'},
    occurrence:{owner:'foreground-reminder-scheduler',storage:'derived-ephemeral',persisted:false,privacyClass:'P1/P2'},
    deliveryJournal:{owner:'device-delivery-adapter',storage:'localStorage:seyma-reminder-delivery-v1',persisted:false,sync:'never',privacyClass:'P1/P2'},
    suppression:{owner:'reminder-policy-evaluator',storage:'evaluation-context',persisted:false,privacyClass:'P2/P3'},
    syncGate:{owner:'app.reminderSyncPayload',blockedRoots:Object.keys(REMINDER_SYNC_BLOCKED_ROOTS).sort()}
  };
  function reminderStateContract(){ return reminderLocalClone(REMINDER_STATE_OWNER_CONTRACT)||{}; }
  var REMINDER_DELIVERY_MAX_AGE_MS=REMINDER_RETENTION_POLICY.deliveryJournal.maxAgeDays*24*60*60*1000;
  var REMINDER_DELIVERY_MAX_ENTRIES=REMINDER_RETENTION_POLICY.deliveryJournal.maxEntries;
  var REMINDER_DELIVERY_STATUSES={scheduled:true,shown:true,opened:true,snoozed:true,dismissed:true,suppressed:true,failed:true};
  var REMINDER_DELIVERY_STATUS_LIST=['scheduled','shown','opened','snoozed','dismissed','suppressed','failed'];
  var REMINDER_DELIVERY_STATUS_RANK={scheduled:0,shown:1,opened:2,snoozed:3,dismissed:3,suppressed:3,failed:3};
  var REMINDER_DELIVERY_CHANNELS={in_app:true,native:true};
  var REMINDER_DELIVERY_REASONS={
    'quiet-hours':true,
    'daily-budget':true,
    'category-cooldown':true,
    'permission-denied':true,
    'not-visible':true,
    'today-muted':true,
    'stale-data':true,
    'already-completed':true,
    'duplicate':true,
    'capacity':true,
    'disabled':true,
    'invalid':true,
    'not-required':true,
    'channel-policy':true,
    'unsupported':true,
    'catchup-grouped':true,
    'catchup-expired':true,
    'storage-error':true,
    'native-error':true,
    'unknown':true
  };
  var REMINDER_DELIVERY_BLOCKING_STATUSES={shown:true,opened:true,snoozed:true,dismissed:true,suppressed:true};
  function reminderDeliveryEmpty(){ return {schemaVersion:REMINDER_DELIVERY_SCHEMA_VERSION,entries:[],clearBoundaryAt:'',generation:0,tombstones:[]}; }
  function reminderDeliveryIso(value){
    if(value instanceof Date){ var dateMs=value.getTime(); return Number.isFinite(dateMs)?new Date(dateMs).toISOString():null; }
    if(typeof value==='number'&&Number.isFinite(value)) return new Date(value).toISOString();
    if(typeof value!=='string'||!value.trim()) return null;
    var parsed=Date.parse(value); return Number.isFinite(parsed)?new Date(parsed).toISOString():null;
  }
  function reminderDeliveryNow(value){ return reminderDeliveryIso(value)||new Date().toISOString(); }
  function reminderDeliveryText(value,max){
    if(typeof value!=='string') return '';
    var text=value.trim(); return text&&text.length<=(max||240)?text:'';
  }
  function reminderDeliveryChannel(value){
    var channel=String(value||'').trim().toLowerCase();
    if(channel==='app'||channel==='in-app') channel='in_app';
    return REMINDER_DELIVERY_CHANNELS[channel]?channel:'in_app';
  }
  function reminderDeliveryStatus(value){
    var status=String(value||'').trim().toLowerCase();
    return REMINDER_DELIVERY_STATUSES[status]?status:null;
  }
  function reminderDeliveryReason(value){
    var reason=String(value||'').trim().toLowerCase();
    var direct={
      'quiet-hours':'quiet-hours','quiet-hours-suppressed':'quiet-hours','quiet-hours-deferred':'quiet-hours','quiet-hours-in-app':'quiet-hours',
      'native-daily-cap':'daily-budget','low-priority-native-cap':'daily-budget','daily-budget':'daily-budget',
      'category-cooldown':'category-cooldown','same-category-cooldown':'category-cooldown',
      'permission-denied':'permission-denied','permission-default':'permission-denied','permission-unavailable':'permission-denied',
      'not-visible':'not-visible','visibility-hidden':'not-visible','today-muted':'today-muted',
      'stale-data':'stale-data','stale-prayer-data':'stale-data','already-completed':'already-completed','completed':'already-completed',
      'duplicate':'duplicate','capacity-silent':'capacity','capacity-light':'capacity','capacity-ritual':'capacity',
      'disabled':'disabled','invalid-definition':'invalid','invalid-occurrence':'invalid','p0-not-required':'not-required',
      'p3-native-default-off':'channel-policy','catch-up-grouped':'catchup-grouped','coalesced':'catchup-grouped','catch-up-expired':'catchup-expired','unsupported':'unsupported','storage-error':'storage-error','native-error':'native-error'
    };
    if(direct[reason]) return direct[reason];
    return REMINDER_DELIVERY_REASONS[reason]?reason:'unknown';
  }
  function reminderDeliveryActionStatus(status){ return status==='opened'||status==='snoozed'||status==='dismissed'; }
  function reminderDeliveryEntry(raw,nowIso){
    var x=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:null;
    if(!x) return null;
    var occurrenceId=reminderDeliveryText(x.occurrenceId||x.id,240), status=reminderDeliveryStatus(x.status);
    if(!occurrenceId||!status) return null;
    var recordedAt=reminderDeliveryIso(x.recordedAt||x.updatedAt||x.createdAt||x.occurredAt||x.at||x.timestamp||x.shownAt||x.actedAt)||nowIso;
    if(!recordedAt) return null;
    var out={occurrenceId:occurrenceId,channel:reminderDeliveryChannel(x.channel),status:status,recordedAt:recordedAt};
    var shownAt=reminderDeliveryIso(x.shownAt), actedAt=reminderDeliveryIso(x.actedAt);
    if(shownAt) out.shownAt=shownAt;
    if(actedAt) out.actedAt=actedAt;
    if(status==='shown'&&!out.shownAt) out.shownAt=recordedAt;
    if(reminderDeliveryActionStatus(status)&&!out.actedAt) out.actedAt=recordedAt;
    if(status==='suppressed'||status==='failed') out.reason=reminderDeliveryReason(x.reason);
    return out;
  }
  function reminderDeliveryEntryRank(status){ return Object.prototype.hasOwnProperty.call(REMINDER_DELIVERY_STATUS_RANK,status)?REMINDER_DELIVERY_STATUS_RANK[status]:-1; }
  function reminderDeliveryMergeEntry(current,next){
    if(!current) return next;
    if(!next) return current;
    var currentMs=Date.parse(current.recordedAt), nextMs=Date.parse(next.recordedAt), nextIsLater=nextMs>=currentMs;
    var currentRank=reminderDeliveryEntryRank(current.status), nextRank=reminderDeliveryEntryRank(next.status);
    var out=Object.assign({},current);
    if(nextRank>currentRank||(nextRank===currentRank&&nextIsLater)){
      out.status=next.status; out.channel=next.channel; out.recordedAt=next.recordedAt;
      if(next.reason) out.reason=next.reason; else delete out.reason;
    }
    if(!out.shownAt&&next.shownAt) out.shownAt=next.shownAt;
    if(!out.actedAt&&next.actedAt) out.actedAt=next.actedAt;
    if(next.shownAt&&out.shownAt&&Date.parse(next.shownAt)<Date.parse(out.shownAt)) out.shownAt=next.shownAt;
    if(next.actedAt&&out.actedAt&&Date.parse(next.actedAt)>Date.parse(out.actedAt)) out.actedAt=next.actedAt;
    return out;
  }
  function reminderDeliveryOccurrenceAt(input,fallbackIso){
    var x=input&&typeof input==='object'?input:{}, occurrence=x.occurrence&&typeof x.occurrence==='object'?x.occurrence:x, direct=reminderDeliveryIso(occurrence.scheduledAtIso||occurrence.occurrenceAt||occurrence.triggeredAt||x.scheduledAtIso||x.occurrenceAt);
    if(direct) return direct;
    var localDate=String(occurrence.localDate||x.localDate||''), scheduledAt=String(occurrence.scheduledAt||occurrence.localTime||x.scheduledAt||x.localTime||''), timezone=String(occurrence.timezone||x.timezone||REMINDER_ENGINE_DEFAULT_TIMEZONE);
    if(reminderEngineValidDate(localDate)&&reminderEngineParseTime(scheduledAt)&&reminderEngineTimezoneValid(timezone)){
      var ms=reminderCatchupLocalDateTimeMs(localDate,scheduledAt,timezone);
      if(Number.isFinite(ms)) return new Date(ms).toISOString();
    }
    return reminderDeliveryIso(fallbackIso);
  }
  function reminderDeliveryClearBoundary(raw){
    var x=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
    return reminderDeliveryIso(x.clearBoundaryAt||x.clearedAt||x.historyClearedAt)||'';
  }
  function reminderDeliveryTombstones(raw){
    var source=raw&&typeof raw==='object'&&!Array.isArray(raw)&&Array.isArray(raw.tombstones)?raw.tombstones:[], seen={}, out=[];
    source.forEach(function(value){ var id=reminderDeliveryText(value,240); if(id&&!seen[id]){ seen[id]=true; out.push(id); } });
    return out.slice(-REMINDER_DELIVERY_MAX_ENTRIES);
  }
  function reminderDeliveryBlockedByClear(log,occurrenceId,occurrence,nowIso){
    var id=reminderDeliveryText(occurrenceId,240), boundary=log&&reminderDeliveryClearBoundary(log), tombstones=log&&Array.isArray(log.tombstones)?log.tombstones:[];
    if(id&&tombstones.indexOf(id)>=0) return 'cleared-boundary';
    if(!boundary) return '';
    var occurrenceAt=reminderDeliveryOccurrenceAt(occurrence,nowIso), boundaryMs=Date.parse(boundary), occurrenceMs=Date.parse(occurrenceAt);
    return Number.isFinite(boundaryMs)&&Number.isFinite(occurrenceMs)&&occurrenceMs<=boundaryMs?'cleared-boundary':'';
  }
  function reminderDeliveryNormalize(raw,now){
    var nowIso=reminderDeliveryNow(now), source=[];
    if(Array.isArray(raw)) source=raw;
    else if(raw&&typeof raw==='object'){
      if(Array.isArray(raw.entries)) source=raw.entries;
      else if(Array.isArray(raw.deliveries)) source=raw.deliveries;
      else if(Array.isArray(raw.records)) source=raw.records;
      else if(raw.occurrenceId||raw.id) source=[raw];
    }
    var byId={};
    source.forEach(function(item){
      var entry=reminderDeliveryEntry(item,nowIso); if(!entry) return;
      byId[entry.occurrenceId]=reminderDeliveryMergeEntry(byId[entry.occurrenceId],entry);
    });
    var cutoff=Date.parse(nowIso)-REMINDER_DELIVERY_MAX_AGE_MS;
    var entries=Object.keys(byId).map(function(id){ return byId[id]; }).filter(function(entry){
      var at=Date.parse(entry.recordedAt); return Number.isFinite(at)&&at>=cutoff;
    });
    entries.sort(function(a,b){ var delta=Date.parse(a.recordedAt)-Date.parse(b.recordedAt); return delta||a.occurrenceId.localeCompare(b.occurrenceId); });
    if(entries.length>REMINDER_DELIVERY_MAX_ENTRIES) entries=entries.slice(-REMINDER_DELIVERY_MAX_ENTRIES);
    return {schemaVersion:REMINDER_DELIVERY_SCHEMA_VERSION,entries:entries,clearBoundaryAt:reminderDeliveryClearBoundary(raw),generation:(raw&&typeof raw==='object'&&!Array.isArray(raw)&&Number.isInteger(raw.generation)&&raw.generation>=0?raw.generation:0),tombstones:reminderDeliveryTombstones(raw)};
  }
  function reminderDeliveryFind(log,occurrenceId){
    var id=reminderDeliveryText(occurrenceId,240), entries=log&&Array.isArray(log.entries)?log.entries:[];
    for(var i=0;i<entries.length;i++) if(entries[i]&&entries[i].occurrenceId===id) return entries[i];
    return null;
  }
  function reminderDeliveryCanShowPure(raw,occurrenceId){
    var log=reminderDeliveryNormalize(raw), occurrence=arguments.length>2?arguments[2]:null, nowIso=arguments.length>3?arguments[3]:null;
    if(reminderDeliveryBlockedByClear(log,occurrenceId,occurrence,nowIso)) return false;
    var entry=reminderDeliveryFind(log,occurrenceId);
    return !entry||entry.status==='scheduled'||entry.status==='failed';
  }
  function reminderDeliveryResult(log,entry,changed,duplicate,reason,created){
    return {ok:!reason,changed:!!changed,created:!!created,duplicate:!!duplicate,reason:reason||null,entry:entry||null,log:log};
  }
  function reminderDeliveryRecordPure(raw,input,now){
    var nowIso=reminderDeliveryNow(now), log=reminderDeliveryNormalize(raw,nowIso), x=input&&typeof input==='object'?input:{}, occurrence=x.occurrence&&typeof x.occurrence==='object'?x.occurrence:x;
    var occurrenceId=reminderDeliveryText(x.occurrenceId||occurrence.occurrenceId||occurrence.id,240), status=reminderDeliveryStatus(x.status||'scheduled');
    if(!occurrenceId||!status) return reminderDeliveryResult(log,null,false,false,'invalid');
    var eventAt=reminderDeliveryNow(x.at||x.recordedAt||x.now||nowIso), incoming=reminderDeliveryEntry({occurrenceId:occurrenceId,channel:x.channel||occurrence.channel,status:status,recordedAt:eventAt,shownAt:x.shownAt,actedAt:x.actedAt,reason:x.reason},eventAt), current=reminderDeliveryFind(log,occurrenceId);
    if(!incoming) return reminderDeliveryResult(log,null,false,false,'invalid');
    var clearReason=reminderDeliveryBlockedByClear(log,occurrenceId,occurrence,eventAt);
    if(clearReason) return reminderDeliveryResult(log,null,false,true,clearReason,false);
    if(!current){ log.entries.push(incoming); log=reminderDeliveryNormalize(log,nowIso); return reminderDeliveryResult(log,reminderDeliveryFind(log,occurrenceId),true,false,null,true); }
    var currentRank=reminderDeliveryEntryRank(current.status), incomingRank=reminderDeliveryEntryRank(status), allowResurface=x.resurface===true||x.fromSnooze===true;
    var hiddenResurface=current.status==='suppressed'&&current.reason==='not-visible'&&status==='shown'&&allowResurface;
    if(status===current.status || (REMINDER_DELIVERY_BLOCKING_STATUSES[current.status]&&status==='shown'&&!allowResurface) || (status==='scheduled'&&current.status!=='scheduled'&&current.status!=='failed') || (current.status==='suppressed'&&status!=='failed'&&status!=='suppressed'&&!hiddenResurface)) return reminderDeliveryResult(log,current,false,true,null,false);
    if(current.status==='failed'&&(status==='scheduled'||status==='shown')) currentRank=-1;
    if(status!=='failed'&&status!=='shown'&&incomingRank<currentRank) return reminderDeliveryResult(log,current,false,true,null,false);
    var before=JSON.stringify(current);
    var merged=current.status==='failed'&&(status==='scheduled'||status==='shown')?Object.assign({},incoming):reminderDeliveryMergeEntry(current,incoming);
    if(status==='shown'&&allowResurface&&(current.status==='snoozed'||hiddenResurface)){ merged.status='shown'; merged.channel=incoming.channel; merged.recordedAt=incoming.recordedAt; merged.shownAt=merged.shownAt||incoming.recordedAt; delete merged.reason; }
    if(status==='failed'){ merged.status='failed'; merged.channel=incoming.channel; merged.recordedAt=incoming.recordedAt; merged.reason=incoming.reason||'unknown'; }
    if(status==='suppressed'){ merged.status='suppressed'; merged.channel=incoming.channel; merged.recordedAt=incoming.recordedAt; merged.reason=incoming.reason||'unknown'; }
    log.entries[log.entries.indexOf(current)]=merged; log=reminderDeliveryNormalize(log,nowIso);
    var after=JSON.stringify(merged), changed=before!==after;
    return reminderDeliveryResult(log,reminderDeliveryFind(log,occurrenceId),changed,!changed,null,false);
  }
  function reminderDeliveryLoad(now,persist){
    var raw=reminderDeliveryStorageRead(), parsed=null;
    if(raw){ try{ parsed=JSON.parse(raw); }catch(e){ parsed=null; } }
    var log=reminderDeliveryNormalize(parsed,now);
    if(persist!==false&&raw!==JSON.stringify(log)) reminderDeliveryStorageWrite(log);
    return log;
  }
  function reminderDeliveryCommit(input){
    var x=input&&typeof input==='object'?input:{}, now=x.at||x.recordedAt||x.now, current=reminderDeliveryLoad(now,true), result=reminderDeliveryRecordPure(current,x,now);
    var persisted=true;
    if(result.changed) persisted=reminderDeliveryStorageWrite(result.log);
    if(result.changed&&persisted){
      var eventAction=reminderEventActionForDelivery(x.status);
      if(eventAction) persistReminderEvent(eventAction,x.occurrenceId|| (x.occurrence&&x.occurrence.occurrenceId)||'');
    }
    if(!result.ok&&!result.reason) result.reason='storage-error';
    return result;
  }
  function reminderDeliveryAction(status,occurrence,options){
    var input=occurrence&&typeof occurrence==='object'?Object.assign({},occurrence):{occurrenceId:occurrence};
    if(options&&typeof options==='object') input=Object.assign(input,options);
    input.status=status; return reminderDeliveryCommit(input);
  }
  function reminderDeliveryRecordAdapter(input,status,options){
    var record;
    if(typeof input==='string') record={occurrenceId:input};
    else if(input&&typeof input==='object') record=Object.assign({},input);
    else record={};
    if(status&&typeof status==='object'){ options=status; status=options.status; }
    if(status&&typeof status==='string') record.status=status;
    if(options&&typeof options==='object') record=Object.assign(record,options);
    return reminderDeliveryCommit(record);
  }
  var REMINDER_LIFECYCLE_INTERVAL_MS=30000;
  var REMINDER_LIFECYCLE_VISIBILITY={visible:true,hidden:true};
  var REMINDER_SCHEDULER_BURST_MS=1000;
  var REMINDER_SCHEDULER_TRIGGER_ORDER=['boot','foreground','focus','pageshow','online','hidden','visibilitychange','timer','offline','manual'];
  function reminderLifecycleVisibility(value){
    var state=String(value||'').toLowerCase();
    return REMINDER_LIFECYCLE_VISIBILITY[state]?state:'visible';
  }
  function reminderLifecycleOccurrenceId(value){
    var x=value&&typeof value==='object'?value:{};
    return reminderDeliveryText(x.occurrenceId||x.id,240);
  }
  function reminderLifecycleCandidateList(input){
    var x=input&&typeof input==='object'?input:{}, source=Array.isArray(x.occurrences)?x.occurrences:(Array.isArray(x.candidates)?x.candidates:[]);
    if(!source.length&&x.occurrence&&typeof x.occurrence==='object') source=[x.occurrence];
    return source.filter(function(item){ return item&&typeof item==='object'&&!Array.isArray(item); });
  }
  function reminderLifecycleRecordResult(item,recordResult,extra){
    var out={occurrenceId:reminderLifecycleOccurrenceId(item),status:recordResult&&recordResult.entry?recordResult.entry.status:null,reason:recordResult&&recordResult.entry?recordResult.entry.reason||null:(recordResult&&recordResult.reason||null),changed:!!(recordResult&&recordResult.changed),duplicate:!!(recordResult&&recordResult.duplicate)};
    if(extra&&typeof extra==='object') Object.keys(extra).forEach(function(key){ out[key]=extra[key]; });
    return out;
  }
  function reminderLifecycleRecordFailure(log,item,nowIso){
    var occurrenceId=reminderLifecycleOccurrenceId(item), current=reminderDeliveryFind(log,occurrenceId);
    // A terminal delivery must remain truthful; an evaluator failure cannot
    // rewrite an already shown/opened/snoozed/dismissed/suppressed occurrence.
    if(!occurrenceId||(current&&current.status!=='failed')) return {log:log,result:null};
    var result=reminderDeliveryRecordPure(log,{occurrenceId:occurrenceId,occurrence:item,status:'failed',channel:'in_app',reason:'unknown',now:nowIso},nowIso);
    return {log:result.log,result:result};
  }
  var REMINDER_CATCHUP_MAX_AGE_MS=REMINDER_RETENTION_POLICY.occurrence.maxAgeDays*24*60*60*1000;
  var REMINDER_CATCHUP_REASON='catchup-grouped';
  var REMINDER_CATCHUP_EXPIRED_REASON='catchup-expired';
  var REMINDER_CATCHUP_SUMMARY_VERSION=1;
  function reminderCatchupLocalDateTimeMs(localDate,localTime,timezone){
    if(!reminderEngineValidDate(localDate)||!reminderEngineTimezoneValid(timezone)) return null;
    var parsed=reminderEngineParseTime(localTime); if(!parsed) return null;
    var parts=localDate.split('-').map(Number), desired=Date.UTC(parts[0],parts[1]-1,parts[2],parsed.hour,parsed.minute,parsed.second);
    if(!Number.isFinite(desired)) return null;
    var guess=desired;
    for(var i=0;i<4;i++){
      var seen=reminderEngineLocalParts(guess,timezone); if(!seen) return null;
      var seenMs=Date.UTC(seen.year,seen.month-1,seen.day,seen.hour,seen.minute,seen.second), delta=desired-seenMs;
      guess+=delta; if(Math.abs(delta)<1000) break;
    }
    return Number.isFinite(guess)?guess:null;
  }
  function reminderCatchupOccurrenceMs(item,timezone){
    var x=item&&typeof item==='object'?item:{};
    var direct=['scheduledAtIso','dueAt','occurredAt','triggeredAt'];
    for(var i=0;i<direct.length;i++){
      var value=x[direct[i]];
      if(typeof value==='string'&&Number.isFinite(Date.parse(value))) return Date.parse(value);
    }
    var localDate=x.localDate||x.date, localTime=x.scheduledAt||x.localTime||x.time;
    return reminderCatchupLocalDateTimeMs(String(localDate||''),String(localTime||''),String(x.timezone||timezone||REMINDER_ENGINE_DEFAULT_TIMEZONE));
  }
  function reminderCatchupHash(value){
    var text=String(value||''), hash=2166136261;
    for(var i=0;i<text.length;i++){ hash^=text.charCodeAt(i); hash=Math.imul(hash,16777619); }
    return ('00000000'+(hash>>>0).toString(16)).slice(-8);
  }
  function reminderCatchupPriority(candidate,definition,item){
    return reminderPolicyPriority((item&&item.priority)||(definition&&definition.priority)||(candidate&&candidate.priority)||'P3');
  }
  function reminderCatchupPrecedence(candidate,definition,item){
    var x=candidate&&typeof candidate==='object'?candidate:{}, occurrence=item&&typeof item==='object'?item:{}, def=definition&&typeof definition==='object'?definition:{};
    var priority=reminderCatchupPriority(x,def,occurrence), category=String(occurrence.category||def.category||x.category||''), source=String(occurrence.source||def.source||x.source||occurrence.origin||def.origin||x.origin||occurrence.kind||def.kind||x.kind||'').toLowerCase();
    var userCreated=x.userCreated===true||x.userScheduled===true||x.explicitlySelected===true||occurrence.userCreated===true||occurrence.userScheduled===true||occurrence.explicitlySelected===true||/(user|custom|personal|manual)/.test(source);
    var ritual=category==='ritual'||source==='ritual'||source==='faith';
    var discovery=category==='discovery'||source==='discovery'||x.discovery===true||occurrence.discovery===true;
    if(priority==='P1'&&userCreated) return {rank:0,label:'user-created-p1',priority:priority,category:category||'custom'};
    if(priority==='P2'&&ritual) return {rank:1,label:'ritual-p2',priority:priority,category:category||'ritual'};
    if(priority==='P3'&&discovery) return {rank:2,label:'discovery-p3',priority:priority,category:category||'discovery'};
    return {rank:3+(REMINDER_PRIORITY_RANK[priority]||3),label:'priority-'+priority.toLowerCase(),priority:priority,category:category||'other'};
  }
  function reminderCatchupPolicyAllowed(policy){
    if(!policy||typeof policy!=='object') return false;
    if(policy.allowed===true||policy.inAppAllowed===true) return true;
    var reason=String(policy.reason||'');
    return reason==='quiet-hours-suppressed'||reason==='quiet-hours-deferred'||reason==='native-daily-cap'||reason==='low-priority-native-cap'||reason==='category-cooldown'||reason.indexOf('permission-')===0;
  }
  function reminderCatchupBlockingEntry(entry){
    if(!entry) return false;
    if(entry.status==='shown'||entry.status==='opened'||entry.status==='snoozed'||entry.status==='dismissed') return true;
    return entry.status==='suppressed'&&(entry.reason==='already-completed'||entry.reason===REMINDER_CATCHUP_REASON||entry.reason===REMINDER_CATCHUP_EXPIRED_REASON);
  }
  function reminderCatchupPlan(input){
    var x=input&&typeof input==='object'?input:{}, context=x.context&&typeof x.context==='object'?x.context:{}, timezone=String(x.timezone||context.timezone||REMINDER_ENGINE_DEFAULT_TIMEZONE), nowIso=reminderDeliveryNow(x.nowIso||x.now), nowMs=Date.parse(nowIso), windowMs=Number.isInteger(x.maxAgeMs)&&x.maxAgeMs>0?Math.min(x.maxAgeMs,REMINDER_CATCHUP_MAX_AGE_MS):REMINDER_CATCHUP_MAX_AGE_MS, source=Array.isArray(x.occurrences)?x.occurrences:(Array.isArray(x.candidates)?x.candidates:[]), log=reminderDeliveryNormalize(x.deliveryLog||x.journal||x.log,nowIso), seen={}, members=[], expired=[], historicalIds=[];
    if(!Number.isFinite(nowMs)) return {summary:null,members:[],expired:[],historicalIds:[],nowIso:nowIso,timezone:timezone};
    source.forEach(function(candidate){
      if(!candidate||typeof candidate!=='object') return;
      var item=candidate.occurrence&&typeof candidate.occurrence==='object'?candidate.occurrence:candidate, occurrenceId=reminderLifecycleOccurrenceId(item);
      if(!occurrenceId||seen[occurrenceId]||item.due===false||candidate.due===false) return;
      var scheduledMs=reminderCatchupOccurrenceMs(item,timezone), isPast=item.past===true;
      if(!isPast) return;
      seen[occurrenceId]=true; historicalIds.push(occurrenceId);
      if(item.completed===true||candidate.completed===true){ expired.push({occurrenceId:occurrenceId,current:null,reason:'already-completed'}); return; }
      var current=reminderDeliveryFind(log,occurrenceId);
      if(reminderCatchupBlockingEntry(current)) return;
      var ageMs=scheduledMs===null?null:nowMs-scheduledMs;
      if(ageMs===null||ageMs<0||ageMs>windowMs){ expired.push({occurrenceId:occurrenceId,current:current}); return; }
      var definition=candidate.definition&&typeof candidate.definition==='object'?candidate.definition:item, preference=candidate.preference&&typeof candidate.preference==='object'?candidate.preference:{}, policy=candidate.policy&&typeof candidate.policy==='object'?candidate.policy:reminderPolicyEvaluate({definition:definition,preference:preference,context:context});
      if(!reminderCatchupPolicyAllowed(policy)) return;
      var precedence=reminderCatchupPrecedence(candidate,definition,item), priority=reminderCatchupPriority(candidate,definition,item);
      members.push({occurrenceId:occurrenceId,scheduledMs:scheduledMs,priority:priority,category:precedence.category,precedence:precedence.label,precedenceRank:precedence.rank,eveningCoalesced:item.eveningCoalesced===true||candidate.eveningCoalesced===true});
    });
    members.sort(function(a,b){ return a.precedenceRank-b.precedenceRank||a.scheduledMs-b.scheduledMs||a.occurrenceId.localeCompare(b.occurrenceId); });
    var summary=null;
    if(members.length){
      var primary=members[0], local=reminderEngineLocalParts(nowMs,timezone), localDate=local&&local.localDate||nowIso.slice(0,10), digest=reminderCatchupHash(localDate+'|'+members.map(function(member){ return member.occurrenceId; }).sort().join('|'));
      summary={schemaVersion:REMINDER_CATCHUP_SUMMARY_VERSION,id:'reminder-catchup-v1:'+localDate+':'+digest,channel:'in_app',inAppOnly:true,nativeAllowed:false,nativeReplay:false,replay:false,priority:primary.priority,precedence:primary.precedence,category:members.length===1?primary.category:'mixed',count:members.length,eveningCoalesced:members.some(function(member){ return member.eveningCoalesced===true; }),window:'last-24h',reason:REMINDER_CATCHUP_REASON,copyKey:'catchup.generic',label:'Günün için birkaç küçük durak hazır'};
    }
    return {summary:summary,members:members,expired:expired,historicalIds:historicalIds,nowIso:nowIso,timezone:timezone};
  }
  function reminderCatchupPublic(plan){
    var summary=plan&&plan.summary?Object.assign({},plan.summary):null;
    return {ok:true,summaries:summary?[summary]:[],summary:summary,eligibleCount:plan&&plan.members?plan.members.length:0,expiredCount:plan&&plan.expired?plan.expired.length:0,reason:summary?summary.reason:null,nativeReplay:false,inAppOnly:true,timezone:plan&&plan.timezone||REMINDER_ENGINE_DEFAULT_TIMEZONE,nowIso:plan&&plan.nowIso||''};
  }
  function reminderEvaluateReminders(input){
    var x=input&&typeof input==='object'?input:{}, nowIso=reminderDeliveryNow(x.nowIso||x.now), suppliedContext=x.context&&typeof x.context==='object'?x.context:{}, context=Object.assign({},suppliedContext), visibility=reminderLifecycleVisibility(x.visibilityState||context.visibilityState), source=reminderLifecycleCandidateList(x), log=reminderDeliveryNormalize(x.deliveryLog||x.journal||x.log,nowIso), initialLog=JSON.stringify(log), results=[],errors=[],shownCount=0,suppressedCount=0,duplicateCount=0,scheduledCount=0,catchUpRequested=(x.catchUp===true||x.reopen===true)&&context.offline!==true,catchUpPlan=catchUpRequested?reminderCatchupPlan({nowIso:nowIso,timezone:x.timezone||context.timezone,context:context,occurrences:source,deliveryLog:log}):null,catchUpIds={};
    context.visibilityState=visibility;
    if(!Array.isArray(context.recentCategoryDeliveries)) context.recentCategoryDeliveries=[];
    if(catchUpPlan){
      catchUpPlan.historicalIds.forEach(function(id){ catchUpIds[id]=true; });
      catchUpPlan.expired.forEach(function(member){
        var expiredResult=reminderDeliveryRecordPure(log,{occurrenceId:member.occurrenceId,status:'suppressed',channel:'in_app',reason:member.reason||REMINDER_CATCHUP_EXPIRED_REASON,now:nowIso},nowIso);
        log=expiredResult.log; if(expiredResult.duplicate) duplicateCount++; else suppressedCount++;
      });
      if(catchUpPlan.summary){
        var summaryRecord=reminderDeliveryRecordPure(log,{occurrenceId:catchUpPlan.summary.id,status:'shown',channel:'in_app',now:nowIso},nowIso);
        log=summaryRecord.log; if(summaryRecord.duplicate) duplicateCount++; else if(summaryRecord.changed) shownCount++;
        results.push({occurrenceId:catchUpPlan.summary.id,status:'shown',channel:'in_app',summary:true,count:catchUpPlan.summary.count,reason:REMINDER_CATCHUP_REASON,changed:!!summaryRecord.changed,duplicate:!!summaryRecord.duplicate});
        catchUpPlan.members.forEach(function(member){
          var memberResult=reminderDeliveryRecordPure(log,{occurrenceId:member.occurrenceId,status:'suppressed',channel:'in_app',reason:REMINDER_CATCHUP_REASON,now:nowIso},nowIso);
          log=memberResult.log; if(memberResult.duplicate) duplicateCount++; else suppressedCount++;
        });
      }
    }
    source.forEach(function(candidate){
      var item=candidate.occurrence&&typeof candidate.occurrence==='object'?candidate.occurrence:candidate, occurrenceId=reminderLifecycleOccurrenceId(item), result=null;
      try{
        if(!occurrenceId){
          errors.push({occurrenceId:'',reason:'invalid'});
          results.push({occurrenceId:'',status:'failed',reason:'invalid',changed:false,duplicate:false});
          return;
        }
        if(catchUpIds[occurrenceId]) return;
        var due=item.due!==false&&candidate.due!==false;
        if(!due){
          result=reminderDeliveryRecordPure(log,{occurrenceId:occurrenceId,occurrence:item,status:'scheduled',channel:candidate.channel||item.channel,now:nowIso},nowIso);
          log=result.log; scheduledCount++; results.push(reminderLifecycleRecordResult(item,result,{status:'scheduled'}));
          if(result.duplicate) duplicateCount++;
          return;
        }
        var definition=candidate.definition&&typeof candidate.definition==='object'?candidate.definition:item, preference=candidate.preference&&typeof candidate.preference==='object'?candidate.preference:{}, policyContext=(candidate.careKey||item.careKey)?Object.assign({},context,{careOccurrence:true,explicitlySelected:candidate.explicitlySelected===true||item.explicitlySelected===true}):context, policy=candidate.policy&&typeof candidate.policy==='object'?candidate.policy:reminderPolicyEvaluate({definition:definition,preference:preference,context:policyContext});
        if(!policy||typeof policy!=='object'){
          result=reminderDeliveryRecordPure(log,{occurrenceId:occurrenceId,occurrence:item,status:'failed',channel:'in_app',reason:'invalid',now:nowIso},nowIso);
          log=result.log; errors.push({occurrenceId:occurrenceId,reason:'invalid'}); results.push(reminderLifecycleRecordResult(item,result,{status:'failed',reason:'invalid'})); return;
        }
        var suppressedReason=null;
        if(visibility==='hidden') suppressedReason='not-visible';
        else if(candidate.completed===true||item.completed===true) suppressedReason='already-completed';
        else if(policy.allowed!==true||policy.suppressed===true) suppressedReason=reminderDeliveryReason(policy.reason||'unknown');
        if(suppressedReason){
          result=reminderDeliveryRecordPure(log,{occurrenceId:occurrenceId,occurrence:item,status:'suppressed',channel:policy.channel||candidate.channel||item.channel,reason:suppressedReason,now:nowIso},nowIso);
          log=result.log; suppressedCount++; if(result.duplicate) duplicateCount++; results.push(reminderLifecycleRecordResult(item,result,{status:'suppressed',reason:suppressedReason,nativeAllowed:false,policyReason:policy.reason||suppressedReason})); return;
        }
        var channel=policy.channel==='native'&&!item.nativeReplay&&!item.replay&&context.offline!==true?'native':'in_app';
        result=reminderDeliveryRecordPure(log,{occurrenceId:occurrenceId,occurrence:item,status:'shown',channel:channel,now:nowIso,resurface:visibility==='visible'},nowIso);
        log=result.log; if(result.duplicate) duplicateCount++; else if(result.changed) shownCount++;
        results.push(reminderLifecycleRecordResult(item,result,{status:result.entry&&result.entry.status||'shown',channel:channel,nativeAllowed:policy.nativeAllowed===true&&channel==='native',policyReason:policy.reason||null}));
        if(result.changed){
          var category=String(definition.category||item.category||'');
          if(category) context.recentCategoryDeliveries.push({category:category,minutesAgo:0});
          if(channel==='native') context.nativeBudgetUsed=(Number(context.nativeBudgetUsed)||0)+1;
        }
      }catch(e){
        var failure=reminderLifecycleRecordFailure(log,item,nowIso);
        log=failure.log;
        errors.push({occurrenceId:occurrenceId||'',reason:'unknown'});
        results.push(failure.result?reminderLifecycleRecordResult(item,failure.result,{status:'failed',reason:'unknown'}):{occurrenceId:occurrenceId||'',status:'failed',reason:'unknown',changed:false,duplicate:false});
      }
    });
    return {ok:errors.length===0,status:'evaluated',source:String(x.source||'manual'),evaluatedAt:nowIso,visibilityState:visibility,changed:JSON.stringify(log)!==initialLog,shownCount:shownCount,suppressedCount:suppressedCount,scheduledCount:scheduledCount,duplicateCount:duplicateCount,errors:errors,results:results,catchUpSummary:catchUpPlan&&catchUpPlan.summary?Object.assign({},catchUpPlan.summary):null,catchUpSummaries:catchUpPlan&&catchUpPlan.summary?[Object.assign({},catchUpPlan.summary)]:[],catchUpCount:catchUpPlan&&catchUpPlan.members?catchUpPlan.members.length:0,log:log};
  }
  function reminderLifecycleWindowDue(definition,localTime){
    var window=definition&&definition.defaultWindow;
    if(!window||window.kind!=='time-range') return true;
    var now=reminderPolicyTimeMinutes(localTime),start=reminderPolicyTimeMinutes(window.start),end=reminderPolicyTimeMinutes(window.end);
    if(now===null||start===null||end===null) return false;
    return start<end?now>=start&&now<=end:now>=start||now<=end;
  }
  function reminderCareDefinition(key){
    key=String(key||'');
    for(var i=0;i<REMINDER_CARE_DEFINITIONS.length;i++) if(REMINDER_CARE_DEFINITIONS[i].careKey===key) return REMINDER_CARE_DEFINITIONS[i];
    return null;
  }
  function reminderCareDefinitions(){ return REMINDER_CARE_DEFINITIONS.map(function(def){ return Object.assign({},def,{snoozeOptions:Array.isArray(def.snoozeOptions)?def.snoozeOptions.slice():[]}); }); }
  function reminderCareNativeCategories(value){
    var source=Array.isArray(value)?value:(value&&Array.isArray(value.careNativeCategories)?value.careNativeCategories:[]);
    return normalizeReminderCareCategories(source);
  }
  function reminderCareWakeWindow(value){
    var x=value&&typeof value==='object'?value:{}, raw=x.wakeWindow&&typeof x.wakeWindow==='object'?x.wakeWindow:(x.careWakeWindow&&typeof x.careWakeWindow==='object'?x.careWakeWindow:null);
    if(!raw||!validReminderTime(raw.start)||!validReminderTime(raw.end)) raw={start:'08:00',end:'22:00'};
    return {start:String(raw.start),end:String(raw.end)};
  }
  function reminderCareWindowContains(localTime,window){
    var now=reminderPolicyTimeMinutes(localTime), start=reminderPolicyTimeMinutes(window&&window.start), end=reminderPolicyTimeMinutes(window&&window.end);
    if(now===null||start===null||end===null||start===end) return false;
    return start<end?now>=start&&now<=end:now>=start||now<=end;
  }
  function reminderCareSlotTimes(window,count){
    var start=reminderPolicyTimeMinutes(window&&window.start), end=reminderPolicyTimeMinutes(window&&window.end), total=[];
    if(start===null||end===null||start===end) return total;
    if(end<=start) end+=1440;
    for(var i=1;i<=count;i++){ var minute=Math.round(start+(end-start)*i/(count+1))%1440, label=minToHHMM(minute); if(label&&total.indexOf(label)<0) total.push(label); }
    return total;
  }
  function reminderCareEveningActive(localTime){
    var minutes=reminderPolicyTimeMinutes(localTime); return minutes!==null&&minutes>=17*60;
  }
  function reminderCareMovementTime(window){
    var start=reminderPolicyTimeMinutes(window&&window.start), end=reminderPolicyTimeMinutes(window&&window.end);
    if(start===null||end===null||start===end) return '15:00';
    if(end<=start) end+=1440;
    return minToHHMM(Math.round(start+(end-start)*0.55)%1440)||'15:00';
  }
  function reminderCarePreference(definition,selectedCategories){
    var key=String(definition&&definition.careKey||''), nativeSelected=selectedCategories.indexOf(key)>=0;
    return {reminderId:String(definition&&definition.id||''),enabled:true,privacyMode:'private',channel:nativeSelected?'native':'in_app',nativeOptIn:nativeSelected,explicitlySelected:nativeSelected,quietHoursBehavior:'defer'};
  }
  function reminderCareOccurrenceId(key,localDate,scheduledAt,timezone){ return 'reminder-care-v1:'+encodeURIComponent(String(key||''))+':'+encodeURIComponent(String(localDate||''))+':'+encodeURIComponent(String(scheduledAt||''))+':'+encodeURIComponent(String(timezone||REMINDER_ENGINE_DEFAULT_TIMEZONE)); }
  function reminderCareLifecycleCandidates(options){
    var opts=options&&typeof options==='object'?options:{}, source=opts.source&&typeof opts.source==='object'?opts.source:opts, context=opts.context&&typeof opts.context==='object'?opts.context:(source.context&&typeof source.context==='object'?source.context:{}), root=opts.root&&typeof opts.root==='object'?opts.root:null, rawPolicy=opts.policy&&typeof opts.policy==='object'?opts.policy:(root&&root.policy&&typeof root.policy==='object'?root.policy:{}), policy=normalizeReminderPolicy(Object.assign({},rawPolicy)), timezone=String(opts.timezone||source.timezone||context.timezone||'Europe/Istanbul'), localDate=String(opts.localDate||context.localDate||''), localTime=String(opts.localTime||context.localTime||'12:00').slice(0,5), selected=reminderCareNativeCategories(policy.careNativeCategories), wakeWindow=reminderCareWakeWindow({wakeWindow:opts.wakeWindow||source.wakeWindow||context.wakeWindow,careWakeWindow:policy.careWakeWindow}), movementOptIn=policy.careMovementOptIn===true||opts.careMovementOptIn===true||source.careMovementOptIn===true, out=[];
    if(!reminderEngineValidDate(localDate)||!reminderEngineTimezoneValid(timezone)) return out;
    var definitions={}; REMINDER_CARE_DEFINITIONS.forEach(function(def){ definitions[def.careKey]=def; });
    var targetBedMinutes=hhmmToMin(caffeineTargetBed()); if(targetBedMinutes===null) targetBedMinutes=1410;
    var slots={water:reminderCareSlotTimes(wakeWindow,3),sleep:[minToHHMM(targetBedMinutes-60)],caffeine:[caffeineCutoffTime(caffeineTargetBed())],movement:[reminderCareMovementTime(wakeWindow)]};
    var activeKeys=selected.slice(); if(movementOptIn&&activeKeys.indexOf('movement')<0) activeKeys.push('movement');
    REMINDER_CARE_KEYS.forEach(function(key){
      if(activeKeys.indexOf(key)<0) return;
      var definition=definitions[key], existingPreference=root&&root.preferences&&root.preferences[definition&&definition.id];
      if(existingPreference&&existingPreference.enabled===false) return;
      var times=slots[key]||[], inWake=reminderCareWindowContains(localTime,wakeWindow), evening=reminderCareEveningActive(localTime);
      if(!definition||!times.length) return;
      times.forEach(function(scheduledAt,index){
        if(!validReminderTime(scheduledAt)) return;
        var activeWindow=key==='water'||key==='movement'?inWake:evening;
        var generated=reminderEngineAdapterGenerateOccurrence({definition:Object.assign({},definition,{time:scheduledAt}),reminderId:definition.id,localDate:localDate,nowLocalDate:localDate,nowLocalTime:localTime,timezone:timezone,instantIso:context.nowIso||'',sourceRevision:'care-v1'});
        if(!generated.ok||!generated.occurrence) return;
        var occurrence=Object.assign({},generated.occurrence,{occurrenceId:reminderCareOccurrenceId(key,localDate,scheduledAt,timezone),category:REMINDER_CARE_CATEGORY,careKey:key,careSlot:index+1,deepLink:'health',nativeTitle:definition.privateTitle,nativeBody:definition.privateBody,dataRequirement:'none',existingSurface:definition.existingSurface,careNudgeKey:'care:'+key+':'+index,replay:false,nativeReplay:false,shouldReplay:false});
        occurrence.due=occurrence.due&&activeWindow;
        var preference=reminderCarePreference(definition,selected);
        out.push({occurrence:occurrence,definition:Object.assign({},definition,{time:scheduledAt}),preference:preference,reminderId:definition.id,careKey:key,careSlot:index+1,existingSurface:definition.existingSurface,careNudgeKey:occurrence.careNudgeKey,explicitlySelected:preference.explicitlySelected, due:occurrence.due});
      });
    });
    return out;
  }
  function reminderCareNudgeSources(){ return REMINDER_CARE_DEFINITIONS.map(function(def){ return {careKey:def.careKey,reminderId:def.id,existingSurface:def.existingSurface,deepLink:def.deepLink}; }); }
  var REMINDER_EVENING_ID='reminder.coalesced.evening.v1';
  var REMINDER_EVENING_START_MINUTES=18*60;
  var REMINDER_EVENING_SURFACES={
    zikr:{reminderId:REMINDER_ZIKR_ID,deepLink:'zikr',label:'Zikir',detail:'Kısa bir sakinlik alanı',category:'ritual'},
    saygi:{reminderId:REMINDER_SAYGI_ID,deepLink:'saygi',label:'İlham okuması',detail:'Bugünün ilham durağı',category:'ritual'},
    reading:{reminderId:'reminder.catalog.v1.reading',deepLink:'reading',label:'Kitaplık',detail:'Okuma yolculuğu',category:'ritual'},
    journal:{reminderId:'reminder.catalog.v1.journal',deepLink:'gunluk',label:'Günlük Işığı',detail:'Günü sakince kapatma',category:'reflection'}
  };
  function reminderEveningSurface(candidate){
    var x=candidate&&typeof candidate==='object'?candidate:{}, occurrence=x.occurrence&&typeof x.occurrence==='object'?x.occurrence:x, definition=x.definition&&typeof x.definition==='object'?x.definition:{};
    var deepLink=String(x.deepLink||occurrence.deepLink||definition.deepLink||''), id=String(x.reminderId||occurrence.reminderId||definition.id||'');
    var keys=Object.keys(REMINDER_EVENING_SURFACES);
    for(var i=0;i<keys.length;i++){ var surface=REMINDER_EVENING_SURFACES[keys[i]]; if(surface.deepLink===deepLink||surface.reminderId===id) return Object.assign({key:keys[i]},surface); }
    return null;
  }
  function reminderEveningWindowStart(preference){
    var p=preference&&typeof preference==='object'?preference:{};
    var keys=['eveningWindow','readingWindow','timeWindow'];
    for(var i=0;i<keys.length;i++){
      var window=p[keys[i]];
      if(window&&typeof window==='object'&&validReminderTime(window.start)) return String(window.start);
    }
    return '';
  }
  function reminderEveningCandidateEligible(candidate,context){
    var x=candidate&&typeof candidate==='object'?candidate:{}, occurrence=x.occurrence&&typeof x.occurrence==='object'?x.occurrence:x, surface=reminderEveningSurface(x), ctx=context&&typeof context==='object'?context:{};
    if(!surface||occurrence.historical===true||x.historical===true) return false;
    if(String(occurrence.localDate||'')!==String(ctx.localDate||'')) return false;
    if(x.eveningEligible===true||occurrence.eveningEligible===true) return true;
    var preference=x.preference&&typeof x.preference==='object'?x.preference:{}, selectedStart=reminderEveningWindowStart(preference), start=reminderPolicyTimeMinutes(selectedStart||String(occurrence.scheduledAt||occurrence.localTime||''));
    // Saygı/zikir evening windows are explicit user choices. Reading/journal
    // retain their catalog evening windows when no custom start is present.
    if(selectedStart) return start!==null&&start>=REMINDER_EVENING_START_MINUTES;
    return (surface.key==='reading'||surface.key==='journal')&&start!==null&&start>=REMINDER_EVENING_START_MINUTES;
  }
  function reminderEveningExplicitSelection(candidate){
    var x=candidate&&typeof candidate==='object'?candidate:{}, p=x.preference&&typeof x.preference==='object'?x.preference:{}, o=x.occurrence&&typeof x.occurrence==='object'?x.occurrence:x;
    return x.eveningPrimary===true||x.userSelected===true||x.explicitlySelected===true||x.userScheduled===true||x.userCreated===true||o.eveningPrimary===true||o.userSelected===true||o.explicitlySelected===true||o.userScheduled===true||o.userCreated===true||p.eveningPrimary===true||p.primary===true||p.userSelected===true||p.explicitlySelected===true||p.userScheduled===true||p.userCreated===true||!!reminderEveningWindowStart(p);
  }
  function reminderEveningCandidateCompare(left,right){
    var a=left&&typeof left==='object'?left:{}, b=right&&typeof right==='object'?right:{}, ap=a.preference&&typeof a.preference==='object'?a.preference:{}, bp=b.preference&&typeof b.preference==='object'?b.preference:{}, ao=a.occurrence&&typeof a.occurrence==='object'?a.occurrence:a, bo=b.occurrence&&typeof b.occurrence==='object'?b.occurrence:b;
    var aPrimary=a.eveningPrimary===true||ap.eveningPrimary===true||ap.primary===true, bPrimary=b.eveningPrimary===true||bp.eveningPrimary===true||bp.primary===true;
    if(aPrimary!==bPrimary) return aPrimary?-1:1;
    var aSelected=reminderEveningExplicitSelection(a), bSelected=reminderEveningExplicitSelection(b);
    if(aSelected!==bSelected) return aSelected?-1:1;
    var aNative=ap.channel==='native', bNative=bp.channel==='native';
    if(aNative!==bNative) return aNative?-1:1;
    var aPriority=REMINDER_PRIORITY_RANK[reminderPolicyPriority(ao.priority||(a.definition&&a.definition.priority))]||3, bPriority=REMINDER_PRIORITY_RANK[reminderPolicyPriority(bo.priority||(b.definition&&b.definition.priority))]||3;
    if(aPriority!==bPriority) return aPriority-bPriority;
    var aEdited=Date.parse(String(ap.lastEditedAt||'')), bEdited=Date.parse(String(bp.lastEditedAt||''));
    if(Number.isFinite(aEdited)&&Number.isFinite(bEdited)&&aEdited!==bEdited) return bEdited-aEdited;
    var aId=String(a.reminderId||ao.reminderId||''), bId=String(b.reminderId||bo.reminderId||'');
    return aId.localeCompare(bId);
  }
  function reminderEveningSafeAlternative(candidate){
    var surface=reminderEveningSurface(candidate), occurrence=candidate&&candidate.occurrence&&typeof candidate.occurrence==='object'?candidate.occurrence:(candidate||{});
    if(!surface) return null;
    return {reminderId:surface.reminderId,deepLink:surface.deepLink,label:surface.label,detail:surface.detail,category:surface.category,priority:reminderPolicyPriority(occurrence.priority||(candidate&&candidate.definition&&candidate.definition.priority)||'P3')};
  }
  function reminderEveningSafeGroup(value){
    var x=value&&typeof value==='object'?value:{}, rawPrimary=x.primary&&typeof x.primary==='object'?x.primary:null, primary=null, alternatives=[];
    if(rawPrimary){ var primarySurface=reminderEveningSurface(rawPrimary); if(primarySurface) primary={reminderId:primarySurface.reminderId,deepLink:primarySurface.deepLink,label:primarySurface.label,detail:primarySurface.detail,category:primarySurface.category,priority:reminderPolicyPriority(rawPrimary.priority||'P3')}; }
    var raw=Array.isArray(x.alternatives)?x.alternatives:[];
    raw.forEach(function(item){ var surface=reminderEveningSurface(item); if(!surface) return; var safe={reminderId:surface.reminderId,deepLink:surface.deepLink,label:surface.label,detail:surface.detail,category:surface.category,priority:reminderPolicyPriority(item.priority||'P3')}; if(!alternatives.some(function(existing){ return existing.deepLink===safe.deepLink; })) alternatives.push(safe); });
    if(primary&&alternatives.some(function(item){ return item.deepLink===primary.deepLink; })) alternatives=alternatives.filter(function(item){ return item.deepLink!==primary.deepLink; });
    return primary&&alternatives.length?{primary:primary,alternatives:alternatives,count:alternatives.length+1}:null;
  }
  function reminderEveningOccurrenceId(localDate,scheduledAt,timezone){ return REMINDER_EVENING_ID+':'+encodeURIComponent(String(localDate||''))+':'+encodeURIComponent(String(scheduledAt||''))+':'+encodeURIComponent(String(timezone||REMINDER_ENGINE_DEFAULT_TIMEZONE)); }
  function reminderEveningCoalesceCandidates(input,context){
    var source=Array.isArray(input)?input.filter(function(item){ return item&&typeof item==='object'&&!Array.isArray(item); }):[], ctx=context&&typeof context==='object'?context:{};
    if(source.length<2||ctx.coalesceEvening===false) return source.slice();
    var eligible=[], bySurface={}, selectedKeys={};
    source.forEach(function(candidate){
      if(!reminderEveningCandidateEligible(candidate,ctx)) return;
      var surface=reminderEveningSurface(candidate); if(!surface) return;
      eligible.push(candidate);
      var current=bySurface[surface.key]; if(!current||reminderEveningCandidateCompare(candidate,current)<0) bySurface[surface.key]=candidate;
    });
    var selected=Object.keys(bySurface).map(function(key){ selectedKeys[key]=true; return bySurface[key]; });
    if(selected.length<2) return source.slice();
    selected.sort(reminderEveningCandidateCompare);
    var primary=selected[0], primaryOccurrence=primary.occurrence&&typeof primary.occurrence==='object'?primary.occurrence:primary, primaryDefinition=primary.definition&&typeof primary.definition==='object'?primary.definition:{}, primarySurface=reminderEveningSurface(primary), timezone=String(primaryOccurrence.timezone||ctx.timezone||REMINDER_ENGINE_DEFAULT_TIMEZONE), earliest='';
    eligible.forEach(function(candidate){ var item=candidate.occurrence&&typeof candidate.occurrence==='object'?candidate.occurrence:candidate, time=String(item.scheduledAt||item.localTime||''); if(!validReminderTime(time)) return; if(!earliest||time<earliest) earliest=time; });
    if(!earliest) return source.slice();
    var definition={id:String(primary.reminderId||primaryOccurrence.reminderId||primaryDefinition.id||primarySurface.reminderId),category:String(primaryOccurrence.category||primaryDefinition.category||primarySurface.category),priority:reminderPolicyPriority(primaryOccurrence.priority||primaryDefinition.priority||'P3'),triggerType:'fixed-time',time:earliest,deepLink:primarySurface.deepLink,privateTitle:'Akşamı tek bir küçük davetle kapatabilirsin',privateBody:'İstersen Şeyma’da seçtiğin küçük durağı açabilirsin.',defaultChannel:String((primary.preference&&primary.preference.channel)||primaryDefinition.defaultChannel||'in_app'),snoozeOptions:Array.isArray(primaryDefinition.snoozeOptions)?primaryDefinition.snoozeOptions.slice():['30m','1h','thisEvening','todayOff'],definitionVersion:'1'};
    var generated=reminderEngineAdapterGenerateOccurrence({definition:definition,reminderId:definition.id,localDate:String(ctx.localDate||primaryOccurrence.localDate||''),nowLocalDate:String(ctx.localDate||primaryOccurrence.localDate||''),nowLocalTime:String(ctx.localTime||'12:00'),timezone:timezone,instantIso:ctx.nowIso||'',sourceRevision:'evening-coalesced-v1'});
    if(!generated.ok||!generated.occurrence) return source.slice();
    var safeAlternatives=selected.map(reminderEveningSafeAlternative).filter(Boolean), safePrimary=safeAlternatives.shift(), group=reminderEveningSafeGroup({primary:safePrimary,alternatives:safeAlternatives});
    if(!group) return source.slice();
    var occurrence=Object.assign({},generated.occurrence,{occurrenceId:reminderEveningOccurrenceId(generated.occurrence.localDate,earliest,timezone),reminderId:definition.id,category:definition.category,priority:definition.priority,deepLink:primarySurface.deepLink,eveningCoalesced:true,coalescedFromCount:eligible.length,eveningGroup:group,nativeTitle:definition.privateTitle,nativeBody:definition.privateBody,dataRequirement:'none',quietHoursInherited:true,nativeReplay:false,replay:false,shouldReplay:false,past:false});
    var coalesced={occurrence:occurrence,definition:definition,preference:primary.preference&&typeof primary.preference==='object'?primary.preference:{enabled:true,channel:'in_app'},reminderId:definition.id,eveningCoalesced:true,eveningGroup:group,due:occurrence.due,explicitlySelected:reminderEveningExplicitSelection(primary)};
    return source.filter(function(candidate){ var surface=reminderEveningSurface(candidate); return !surface||!selectedKeys[surface.key]; }).concat([coalesced]);
  }
  var REMINDER_DAILY_FLOW_VERSION='1';
  var REMINDER_DAILY_FLOW_WINDOWS={
    morning:{label:'Sabah açılışı',start:'00:00',end:'11:59'},
    day:{label:'Gün içi küçük odak',start:'12:00',end:'17:59'},
    evening:{label:'Akşam kapanışı',start:'18:00',end:'23:59'},
    light:{label:'Hafif gün',start:'00:00',end:'23:59'}
  };
  var REMINDER_DAILY_FLOW_LABELS={
    faith:'İman Köşesi',zikr:'Zikir',room:'Sakin destek',saygi:'İlham okuması',reading:'Kitaplık',gunluk:'Günlük Işığı',health:'Beden bakımı',settings:'Ayarlar'
  };
  var REMINDER_DAILY_FLOW_CARE_LABELS={water:'Su',sleep:'Uykuya hazırlık',caffeine:'Kafein',movement:'Hareket'};
  function reminderDailyFlowTime(value){
    var minutes=reminderPolicyTimeMinutes(value);
    return minutes===null?null:minutes;
  }
  function reminderDailyFlowIdForTime(localTime){
    var minutes=reminderDailyFlowTime(localTime);
    if(minutes===null||minutes<12*60) return 'morning';
    return minutes<18*60?'day':'evening';
  }
  function reminderDailyFlowPolicy(input){
    var x=input&&typeof input==='object'?input:{}, context=x.context&&typeof x.context==='object'?x.context:x, localTime=String(x.localTime||context.localTime||'12:00').slice(0,5), mode=reminderPolicyMode(x.capacityMode||context.capacityMode||context.todayMode||context.mode), flowId=mode==='light'?'light':(mode==='silent'?'light':reminderDailyFlowIdForTime(localTime)), window=REMINDER_DAILY_FLOW_WINDOWS[flowId]||REMINDER_DAILY_FLOW_WINDOWS.day, fallbackCap=reminderPolicyInteger(context.nativeDailyCap,0,24,REMINDER_POLICY_DEFAULTS.nativeDailyCap), budget=reminderPolicyInteger(x.dailyFlowBudget,0,24,reminderPolicyInteger(context.dailyFlowBudget,0,24,fallbackCap)), maxCandidates=mode==='silent'?0:(mode==='light'?Math.min(1,budget):budget);
    return {id:'reminder.daily-flow.policy.v'+REMINDER_DAILY_FLOW_VERSION,version:REMINDER_DAILY_FLOW_VERSION,flowId:flowId,flowLabel:window.label,capacityMode:mode,localDate:String(x.localDate||context.localDate||''),localTime:localTime,timezone:String(x.timezone||context.timezone||REMINDER_ENGINE_DEFAULT_TIMEZONE),window:{start:window.start,end:window.end},candidateBudget:budget,maxCandidates:maxCandidates,primaryLimit:1,coalesce:true,nowNotAction:'todayOff',nativeReplay:false};
  }
  function reminderDailyFlowCandidateOccurrence(candidate){ return candidate&&candidate.occurrence&&typeof candidate.occurrence==='object'?candidate.occurrence:(candidate&&typeof candidate==='object'?candidate:{}); }
  function reminderDailyFlowCandidateDate(candidate,policy){ return String(reminderDailyFlowCandidateOccurrence(candidate).localDate||candidate.localDate||(policy&&policy.localDate)||''); }
  function reminderDailyFlowCandidateExplicit(candidate){
    var x=candidate&&typeof candidate==='object'?candidate:{}, occurrence=reminderDailyFlowCandidateOccurrence(candidate), preference=x.preference&&typeof x.preference==='object'?x.preference:{};
    return x.explicitlySelected===true||x.userSelected===true||x.userScheduled===true||x.userCreated===true||occurrence.explicitlySelected===true||occurrence.userSelected===true||occurrence.userScheduled===true||occurrence.userCreated===true||reminderEveningExplicitSelection(candidate);
  }
  function reminderDailyFlowCandidateDecision(candidate,context){
    var occurrence=reminderDailyFlowCandidateOccurrence(candidate), definition=candidate&&candidate.definition&&typeof candidate.definition==='object'?candidate.definition:occurrence, preference=candidate&&candidate.preference&&typeof candidate.preference==='object'?candidate.preference:{enabled:candidate&&candidate.enabled===true,channel:candidate&&candidate.channel||definition.defaultChannel||'in_app'};
    return reminderPolicyEvaluate({definition:definition,preference:preference,context:Object.assign({},context||{}, {nativeBudgetUsed:0,lowPriorityNativeUsed:0})});
  }
  function reminderDailyFlowCandidateEligible(candidate,policy,context){
    if(!candidate||typeof candidate!=='object'||Array.isArray(candidate)) return false;
    var occurrence=reminderDailyFlowCandidateOccurrence(candidate);
    if(occurrence.past===true||occurrence.historical===true||candidate.historical===true||occurrence.due===false||candidate.due===false) return false;
    if(policy&&policy.localDate&&reminderDailyFlowCandidateDate(candidate,policy)!==policy.localDate) return false;
    var decision=reminderDailyFlowCandidateDecision(candidate,Object.assign({},context||{}, {capacityMode:policy&&policy.capacityMode||context&&context.capacityMode,localTime:policy&&policy.localTime||context&&context.localTime}));
    return !!(decision&&decision.allowed===true&&decision.inAppAllowed===true);
  }
  function reminderDailyFlowCandidateCompare(left,right){
    var a=left&&typeof left==='object'?left:{}, b=right&&typeof right==='object'?right:{}, ao=reminderDailyFlowCandidateOccurrence(a), bo=reminderDailyFlowCandidateOccurrence(b), ap=a.preference&&typeof a.preference==='object'?a.preference:{}, bp=b.preference&&typeof b.preference==='object'?b.preference:{};
    var aExplicit=reminderDailyFlowCandidateExplicit(a), bExplicit=reminderDailyFlowCandidateExplicit(b);
    if(aExplicit!==bExplicit) return aExplicit?-1:1;
    var aPriority=REMINDER_PRIORITY_RANK[reminderPolicyPriority(ao.priority||(a.definition&&a.definition.priority)||'P3')]||3, bPriority=REMINDER_PRIORITY_RANK[reminderPolicyPriority(bo.priority||(b.definition&&b.definition.priority)||'P3')]||3;
    if(aPriority!==bPriority) return aPriority-bPriority;
    var aNative=ap.channel==='native', bNative=bp.channel==='native';
    if(aNative!==bNative) return aNative?-1:1;
    var aTime=String(ao.scheduledAt||ao.localTime||a.scheduledAt||a.localTime||''), bTime=String(bo.scheduledAt||bo.localTime||b.scheduledAt||b.localTime||'');
    if(aTime!==bTime) return aTime<bTime?-1:1;
    var aId=String(a.reminderId||ao.reminderId||(a.definition&&a.definition.id)||''), bId=String(b.reminderId||bo.reminderId||(b.definition&&b.definition.id)||'');
    return aId.localeCompare(bId);
  }
  function reminderDailyFlowSafeValue(value){
    var x=value&&typeof value==='object'?value:{}, occurrence=x.occurrence&&typeof x.occurrence==='object'?x.occurrence:x, definition=x.definition&&typeof x.definition==='object'?x.definition:{}, deepLink=String(x.deepLink||occurrence.deepLink||definition.deepLink||''), reminderId=String(x.reminderId||occurrence.reminderId||definition.id||''), surface=reminderEveningSurface(x), careKey=String(x.careKey||occurrence.careKey||''), category=String(x.category||occurrence.category||definition.category||'');
    if(surface){ deepLink=surface.deepLink; reminderId=surface.reminderId; category=surface.category; }
    if(!deepLink||!REMINDER_DAILY_FLOW_LABELS[deepLink]&&!careKey) return null;
    var label=careKey&&REMINDER_DAILY_FLOW_CARE_LABELS[careKey]?REMINDER_DAILY_FLOW_CARE_LABELS[careKey]:(REMINDER_DAILY_FLOW_LABELS[deepLink]||'Küçük durak');
    if(deepLink==='health'&&!careKey) label=REMINDER_DAILY_FLOW_LABELS.health;
    return {reminderId:reminderId,deepLink:deepLink,label:label,detail:'İstersen bu küçük durağı uygulamanın içinde açabilirsin.',category:category||'ritual',priority:reminderPolicyPriority(x.priority||occurrence.priority||definition.priority||'P3')};
  }
  function reminderDailyFlowSafeMembers(candidate){
    var occurrence=reminderDailyFlowCandidateOccurrence(candidate), group=occurrence.eveningGroup||occurrence.flowGroup||(candidate&&candidate.eveningGroup), raw=[];
    if(group&&group.primary) raw.push(group.primary);
    if(group&&Array.isArray(group.alternatives)) raw=raw.concat(group.alternatives);
    if(!raw.length) raw=[candidate];
    var out=[];
    raw.forEach(function(value){ var safe=reminderDailyFlowSafeValue(value); if(safe&&!out.some(function(existing){ return existing.deepLink===safe.deepLink&&existing.reminderId===safe.reminderId; })) out.push(safe); });
    return out;
  }
  function reminderDailyFlowGroup(candidates,policy){
    var selected=Array.isArray(candidates)?candidates:[], primary=selected[0], primaryMembers=reminderDailyFlowSafeMembers(primary), safePrimary=primaryMembers[0]||null, alternatives=[];
    selected.forEach(function(candidate,index){ reminderDailyFlowSafeMembers(candidate).forEach(function(safe){ if(index===0&&safe.reminderId===safePrimary.reminderId&&safe.deepLink===safePrimary.deepLink) return; if(!alternatives.some(function(existing){ return existing.deepLink===safe.deepLink; })) alternatives.push(safe); }); });
    if(!safePrimary) return null;
    return {flowId:policy.flowId,label:policy.flowLabel,primary:safePrimary,alternatives:alternatives,count:alternatives.length+1,nowNotAction:policy.nowNotAction};
  }
  function reminderDailyFlowCopy(policy){
    if(policy.capacityMode==='light') return {title:'Bugün tek bir küçük adım yeterli olabilir',body:'İstersen Şeyma’da sana iyi gelen küçük alanlardan birini açabilirsin.'};
    if(policy.flowId==='morning') return {title:'Güne küçük bir alan açabilirsin',body:'İstersen günün ilk sakin durağını uygulamanın içinde açabilirsin.'};
    if(policy.flowId==='day') return {title:'Günün içinde kısa bir durak hazır',body:'İstersen şimdi tek bir küçük odağa uğrayabilirsin.'};
    return {title:'Akşamı tek bir küçük davetle kapatabilirsin',body:'İstersen Şeyma’da seçtiğin küçük durağı açabilirsin.'};
  }
  function reminderDailyFlowDecorate(candidate,policy){
    var occurrence=reminderDailyFlowCandidateOccurrence(candidate), nextOccurrence=Object.assign({},occurrence,{dailyFlowVersion:REMINDER_DAILY_FLOW_VERSION,flowId:policy.flowId,flowLabel:policy.flowLabel,flowCapacityMode:policy.capacityMode,nowNotAction:policy.nowNotAction,nativeReplay:false,replay:false}), next=Object.assign({},candidate,{occurrence:nextOccurrence,dailyFlow:policy.flowId,flowId:policy.flowId,flowLabel:policy.flowLabel,flowCapacityMode:policy.capacityMode,nowNotAction:policy.nowNotAction});
    if(policy.capacityMode==='light'){
      var copy=reminderDailyFlowCopy(policy);
      next.occurrence=Object.assign({},nextOccurrence,{nativeTitle:copy.title,nativeBody:copy.body});
      next.definition=Object.assign({},candidate.definition&&typeof candidate.definition==='object'?candidate.definition:{},{privateTitle:copy.title,privateBody:copy.body});
      next.privateTitle=copy.title;
      next.privateBody=copy.body;
      next.title=copy.title;
      next.detail=copy.body;
    }
    return next;
  }
  function reminderDailyFlowCoalesceCandidates(input,context){
    var source=Array.isArray(input)?input.filter(function(item){ return item&&typeof item==='object'&&!Array.isArray(item); }):[], ctx=context&&typeof context==='object'?context:{}, policy=reminderDailyFlowPolicy({context:ctx});
    if(policy.maxCandidates<=0) return source.filter(function(candidate){ return reminderDailyFlowCandidateDate(candidate,policy)!==policy.localDate||reminderDailyFlowCandidateOccurrence(candidate).past===true; });
    var eligible=[], untouched=[];
    source.forEach(function(candidate){
      if(reminderDailyFlowCandidateDate(candidate,policy)!==policy.localDate||reminderDailyFlowCandidateOccurrence(candidate).past===true||reminderDailyFlowCandidateOccurrence(candidate).historical===true){ untouched.push(candidate); return; }
      var decision=reminderDailyFlowCandidateDecision(candidate,Object.assign({},ctx,{capacityMode:policy.capacityMode,localTime:policy.localTime}));
      if(decision&&decision.allowed===true&&decision.inAppAllowed===true) eligible.push(candidate);
      else if(!decision||String(decision.reason||'').indexOf('capacity-')!==0) untouched.push(candidate);
    });
    if(!eligible.length) return untouched;
    eligible.sort(reminderDailyFlowCandidateCompare);
    if(!reminderDailyFlowSafeMembers(eligible[0]).length) return untouched.concat(eligible);
    if(eligible.length===1) return untouched.concat([reminderDailyFlowDecorate(eligible[0],policy)]);
    var primary=eligible[0], primaryOccurrence=reminderDailyFlowCandidateOccurrence(primary), primaryDefinition=primary.definition&&typeof primary.definition==='object'?primary.definition:primaryOccurrence, timezone=String(primaryOccurrence.timezone||policy.timezone||REMINDER_ENGINE_DEFAULT_TIMEZONE), earliest='';
    eligible.forEach(function(candidate){ var occurrence=reminderDailyFlowCandidateOccurrence(candidate), time=String(occurrence.scheduledAt||occurrence.localTime||candidate.scheduledAt||candidate.localTime||''); if(validReminderTime(time)&&(!earliest||time<earliest)) earliest=time; });
    if(!earliest) earliest=validReminderTime(policy.localTime)?policy.localTime:'12:00';
    var group=reminderDailyFlowGroup(eligible,policy); if(!group) return untouched.concat(eligible);
    var copy=reminderDailyFlowCopy(policy), primarySafe=reminderDailyFlowSafeMembers(primary)[0]||{}, category=String(primaryOccurrence.category||primaryDefinition.category||primarySafe.category||'ritual'), priority=reminderPolicyPriority(primaryOccurrence.priority||primaryDefinition.priority||primarySafe.priority||'P3'), coalescedSnoozeOptions=[];
    eligible.forEach(function(candidate){ var candidateDefinition=candidate.definition&&typeof candidate.definition==='object'?candidate.definition:reminderDailyFlowCandidateOccurrence(candidate); (Array.isArray(candidateDefinition.snoozeOptions)?candidateDefinition.snoozeOptions:[]).forEach(function(option){ option=String(option); if(reminderEnumHas(REMINDER_SNOOZE_OPTIONS,option)&&coalescedSnoozeOptions.indexOf(option)<0) coalescedSnoozeOptions.push(option); }); });
    if(!coalescedSnoozeOptions.length) coalescedSnoozeOptions=['30m','1h','todayOff'];
    var definition={id:String(primary.reminderId||primaryOccurrence.reminderId||primaryDefinition.id||''),category:category,priority:priority,triggerType:'fixed-time',time:earliest,deepLink:String(primarySafe.deepLink||primaryOccurrence.deepLink||primaryDefinition.deepLink||'settings'),privateTitle:copy.title,privateBody:copy.body,defaultChannel:String(primary.preference&&primary.preference.channel||primaryDefinition.defaultChannel||'in_app'),snoozeOptions:coalescedSnoozeOptions,definitionVersion:'1'};
    var generated=reminderEngineAdapterGenerateOccurrence({definition:definition,reminderId:definition.id,localDate:policy.localDate,nowLocalDate:policy.localDate,nowLocalTime:policy.localTime,timezone:timezone,instantIso:ctx.nowIso||'',sourceRevision:'daily-flow-v1'});
    if(!generated.ok||!generated.occurrence) return untouched.concat(eligible);
    var occurrence=Object.assign({},generated.occurrence,{occurrenceId:'reminder-daily-flow-v'+REMINDER_DAILY_FLOW_VERSION+':'+encodeURIComponent(policy.flowId)+':'+encodeURIComponent(policy.localDate)+':'+encodeURIComponent(earliest)+':'+encodeURIComponent(timezone),reminderId:definition.id,category:category,priority:priority,deepLink:definition.deepLink,flowId:policy.flowId,flowLabel:policy.flowLabel,flowCapacityMode:policy.capacityMode,dailyFlowVersion:REMINDER_DAILY_FLOW_VERSION,coalescedFromCount:eligible.length,flowGroup:group,nativeTitle:copy.title,nativeBody:copy.body,nowNotAction:policy.nowNotAction,quietHoursInherited:true,nativeReplay:false,replay:false,shouldReplay:false,past:false});
    if(policy.flowId==='evening') occurrence.eveningGroup=group;
    var allCare=eligible.every(function(candidate){ var item=reminderDailyFlowCandidateOccurrence(candidate); return String(item.category||candidate.category||'')===REMINDER_CARE_CATEGORY||!!(candidate.careKey||item.careKey); }), primaryPreference=Object.assign({},primary.preference&&typeof primary.preference==='object'?primary.preference:{enabled:true,channel:'in_app'});
    if(allCare&&eligible.length>1) primaryPreference.channel='in_app';
    return untouched.concat([{occurrence:occurrence,definition:definition,preference:primaryPreference,reminderId:definition.id,flowId:policy.flowId,flowLabel:policy.flowLabel,dailyFlow:policy.flowId,flowCapacityMode:policy.capacityMode,flowGroup:group,eveningGroup:policy.flowId==='evening'?group:null,eveningCoalesced:policy.flowId==='evening',due:occurrence.due,explicitlySelected:reminderDailyFlowCandidateExplicit(primary)}]);
  }
  function reminderLifecycleBuildCandidates(input,context,root){
    var x=input&&typeof input==='object'?input:{}, explicit=reminderLifecycleCandidateList(x);
    if(explicit.length) return reminderDailyFlowCoalesceCandidates(explicit,context);
    var defs=Array.isArray(x.definitions)?x.definitions:reminderDefinitions(), out=[],preferences=root&&root.preferences&&typeof root.preferences==='object'?root.preferences:{};
    defs.forEach(function(definition){
      if(!definition||typeof definition!=='object'||!definition.id) return;
      var preference=preferences[definition.id];
      if(!preference||preference.enabled!==true) return;
      var timezone=String(preference.timezone||context.timezone||'Europe/Istanbul'), preferenceNow=reminderEngineLocalParts(Date.parse(context.nowIso||''),timezone), baseDate=preferenceNow&&preferenceNow.localDate||context.localDate, baseTime=preferenceNow&&preferenceNow.localTime?preferenceNow.localTime.slice(0,5):context.localTime;
      if(!reminderEngineValidDate(baseDate)) return;
      if(String(definition.id)===REMINDER_ZIKR_ID){
        reminderZikrLifecycleCandidates({preference:preference,definition:definition,timezone:timezone,nowIso:context.nowIso,localDate:baseDate,localTime:baseTime,zikrData:x.zikrData,featureEnabled:x.zikrFeatureEnabled,context:context}).forEach(function(candidate){ out.push(candidate); });
        return;
      }
      if(String(definition.id)===REMINDER_THERAPY_ID){
        reminderTherapyLifecycleCandidates({preference:preference,definition:definition,timezone:timezone,nowIso:context.nowIso,localDate:baseDate,localTime:baseTime,context:context}).forEach(function(candidate){ out.push(candidate); });
        return;
      }
      if(String(definition.id)===REMINDER_SAYGI_ID){
        var saygiDay=data&&data.days&&data.days[baseDate]&&typeof data.days[baseDate]==='object'?data.days[baseDate]:null;
        reminderSaygiLifecycleCandidates({preference:preference,definition:definition,timezone:timezone,nowIso:context.nowIso,localDate:baseDate,localTime:baseTime,day:saygiDay,article:x.saygiArticle,articleStatus:x.saygiArticleStatus,context:context}).forEach(function(candidate){ out.push(candidate); });
        return;
      }
      var datesForPreference=[baseDate];
      if(x.catchUp===true){ var previousDate=reminderEngineAddDays(baseDate,-1); if(previousDate) datesForPreference.push(previousDate); }
      datesForPreference.forEach(function(localDate){
        if(String(definition.id)===REMINDER_PRAYER_ID||String(definition.triggerType||'')==='prayer-offset'){
          var prayerSource=x.prayerData&&typeof x.prayerData==='object'?x.prayerData:reminderPrayerSourceForDate(localDate), prayerInput=reminderPrayerLifecycleInput(preference,x,localDate,prayerSource);
          reminderPrayerLifecycleKeys(preference,x).forEach(function(prayerKey){
            var prayerGenerated=reminderPrayerOccurrence(Object.assign({},prayerInput,{definition:definition,reminderId:definition.id,prayerKey:prayerKey,timezone:timezone,instantIso:context.nowIso,nowLocalDate:baseDate,nowLocalTime:baseTime}));
            if(!prayerGenerated.ok||!prayerGenerated.occurrence) return;
            var prayerHistoricalDate=localDate!==baseDate;
            prayerGenerated.occurrence.due=prayerGenerated.occurrence.due&&(prayerHistoricalDate||reminderLifecycleWindowDue(definition,baseTime));
            out.push({occurrence:prayerGenerated.occurrence,definition:definition,preference:preference,due:prayerGenerated.occurrence.due});
          });
          return;
        }
        var generated=reminderEngineAdapterGenerateOccurrence({definition:definition,reminderId:definition.id,localDate:localDate,nowLocalDate:baseDate,nowLocalTime:baseTime,timezone:timezone,instantIso:context.nowIso,prayerData:x.prayerData,prayerKey:x.prayerKey,offsetMinutes:preference.offsetMinutes});
        if(!generated.ok||!generated.occurrence) return;
        var historicalDate=localDate!==baseDate;
        generated.occurrence.due=generated.occurrence.due&&(historicalDate||reminderLifecycleWindowDue(definition,baseTime));
        out.push({occurrence:generated.occurrence,definition:definition,preference:preference,due:generated.occurrence.due});
      });
    });
    reminderMedicationLifecycleCandidates({source:x,context:context,root:root}).forEach(function(candidate){ out.push(candidate); });
    reminderCareLifecycleCandidates({source:x,context:context,root:root}).forEach(function(candidate){ out.push(candidate); });
    var specialOffset=0;
    try{ var prayer=prayerSettings(); specialOffset=Number.isInteger(prayer&&prayer.hijriOffset)?Math.max(-2,Math.min(2,prayer.hijriOffset)):0; }catch(e){ specialOffset=0; }
    reminderSpecialDayLifecycleCandidates({source:x,context:context,root:root,localDate:context.localDate,localTime:context.localTime,timezone:context.timezone,catchUp:x.catchUp===true,hijriOffset:specialOffset}).forEach(function(candidate){ out.push(candidate); });
    return reminderDailyFlowCoalesceCandidates(reminderEveningCoalesceCandidates(out,context),context);
  }
  function reminderLifecycleIsPrayerCandidate(candidate){
    var x=candidate&&typeof candidate==='object'?candidate:{}, occurrence=x.occurrence&&typeof x.occurrence==='object'?x.occurrence:x, definition=x.definition&&typeof x.definition==='object'?x.definition:{};
    // A generated prayer occurrence carries its selected key.  Do not classify
    // an arbitrary synthetic occurrence that merely reuses the catalog id as a
    // live prayer source; older pure lifecycle fixtures and app-only previews
    // must remain independently testable.
    return !!occurrence.prayerKey&&(String(x.reminderId||occurrence.reminderId||definition.id||'')===REMINDER_PRAYER_ID||String(occurrence.triggerType||definition.triggerType||'')==='prayer-offset');
  }
  function reminderLifecycleCandidateSignature(candidates){
    var rows=(Array.isArray(candidates)?candidates:[]).map(function(candidate){
      var x=candidate&&typeof candidate==='object'?candidate:{}, occurrence=x.occurrence&&typeof x.occurrence==='object'?x.occurrence:x, policy=x.policy&&typeof x.policy==='object'?x.policy:{}, preference=x.preference&&typeof x.preference==='object'?x.preference:{};
      return [
        reminderLifecycleOccurrenceId(occurrence),
        String(x.reminderId||occurrence.reminderId||''),
        String(occurrence.localDate||''),
        String(occurrence.scheduledAt||occurrence.scheduledAtIso||occurrence.localTime||''),
        String(occurrence.timezone||''),
        String(occurrence.deepLink||''),
        occurrence.due===true?'due':'window',
        String(x.flowId||occurrence.flowId||''),
        String(x.reason||occurrence.reason||policy.reason||''),
        String(preference.channel||occurrence.channel||''),
        preference.enabled===true?'enabled':'disabled',
        policy.inAppAllowed===true?'in-app':'no-in-app',
        policy.nativeAllowed===true?'native':'no-native'
      ].join('~');
    });
    rows.sort();
    return rows.join('|');
  }
  function reminderLifecycleOverlayOpen(){
    if(typeof ui==='undefined'||!ui) return false;
    var keys=['readingOpen','watchOpen','listeningOpen','learningOpen','soulArchiveOpen','soulPracticePicker','soulActivityOpen','faithOpen','zikrOpen','qiblaOpen','saygiPersonOpen','quranJourneyOpen','roomOpen','crisisKind','dayDetail','emergency','resetStep','weatherOpen','locNudgeOpen','reminderCenterOpen'];
    for(var i=0;i<keys.length;i++) if(ui[keys[i]]) return true;
    return false;
  }
  function reminderLifecycleTarget(options){
    var x=options&&typeof options==='object'?options:{};
    if(typeof ui==='undefined'||!ui) return '';
    if(x.target==='reminder-center'||x.target==='center') return ui.reminderCenterOpen?'reminder-center':'';
    if(x.target==='reminder-inbox'||x.target==='inbox') return ui.tab==='bugun'&&!(typeof editing==='function'&&editing())?'reminder-inbox':'';
    if(ui.reminderCenterOpen) return 'reminder-center';
    if(ui.tab==='bugun'&&!(typeof editing==='function'&&editing())) return 'reminder-inbox';
    return '';
  }
  function reminderLifecycleLiveHTML(result){
    var x=result&&typeof result==='object'?result:{}, shown=Number(x.shownCount)||0, scheduled=Number(x.scheduledCount)||0, suppressed=Number(x.suppressedCount)||0;
    var text=shown>0?'Yeni bir sakin reminder durağı hazır.':scheduled>0?'Bir reminder durağı planlandı.':suppressed>0?'Reminder durumu daha sakin tutuldu.':'Reminder durumu güncellendi.';
    return icon(shown>0?'bell-ring':'info',14)+' <span>'+esc(text)+'</span>';
  }
  function reminderLifecycleTargetedUpdate(target,result,draftActive){
    if(target==='reminder-center'){
      var changed=false;
      // A draft or focused field makes the live region the only safe repaint.
      // The capability block has no input and may be replaced otherwise.
      if(!draftActive) changed=reminderLifecycleReplaceTarget('sey-reminder-system-status',reminderSystemStatusHTML())||changed;
      // Digest ve sentetik test önizlemesi sadece ilgili alt bölgeleri yeniden çizer;
      // böylece buton tıklamaları tüm merkez yerine yalnız bu kartı günceller.
      changed=reminderLifecycleReplaceTarget('sey-reminder-digest-target',
        reminderDigestLauncherHTML()+(ui.reminderDigestOpen?reminderDigestHTML():''))||changed;
      changed=reminderLifecycleReplaceTarget('sey-reminder-test-preview-target',reminderTestPreviewHTML())||changed;
      return reminderLifecycleUpdateLive('sey-reminder-center-live-region',result)||changed;
    }
    if(target==='reminder-inbox'){
      if(draftActive) return reminderLifecycleUpdateLive('sey-reminder-inbox-live',result);
      return reminderLifecycleReplaceTarget('sey-reminder-inbox-card',reminderInboxCardHTML());
    }
    return false;
  }
  function reminderLifecycleRecordReceipt(receipt,nowIso){
    var x=receipt&&typeof receipt==='object'?receipt:{}, at=validReminderIso(nowIso)?new Date(nowIso).toISOString():new Date().toISOString(), item={at:at,source:String(x.source||''),policy:String(x.policy||''),reason:String(x.reason||''),target:String(x.target||''),mode:String(x.mode||'none'),fullRender:x.fullRender===true,targetedUpdate:x.targetedUpdate===true,draftActive:x.draftActive===true,overlayOpen:x.overlayOpen===true,tabActive:x.tabActive===true};
    reminderLifecycleState.renderPolicy=item.policy; reminderLifecycleState.renderTarget=item.target; reminderLifecycleState.renderReceipt=item;
    reminderLifecycleState.renderReceiptHistory.push(item); if(reminderLifecycleState.renderReceiptHistory.length>12) reminderLifecycleState.renderReceiptHistory.shift();
    return item;
  }
  function reminderLifecycleRenderPolicy(result,context,sourceName,options){
    var x=options&&typeof options==='object'?options:{}, c=context&&typeof context==='object'?context:{visibilityState:'visible'}, changed=!!(result&&result.changed)||!!(result&&result.nativeShownCount)||x.force===true, actionAccepted=x.actionAccepted===true||(result&&result.actionAccepted===true)||sourceName==='action', draftActive=reminderLifecycleDraftActive(), overlayOpen=reminderLifecycleOverlayOpen(), target=reminderLifecycleTarget(x), tabActive=target!=='';
    var base={changed:changed,actionAccepted:actionAccepted,draftActive:draftActive,overlayOpen:overlayOpen,tabActive:tabActive,target:target,mode:'defer',reason:'render-deferred',policy:'deferred'};
    if(!changed) return Object.assign(base,{mode:'no-op',reason:'candidate-unchanged',policy:'candidate-unchanged',target:'',tabActive:false});
    if(!tabActive) return Object.assign(base,{reason:'tab-inactive',policy:'tab-inactive',target:''});
    if(overlayOpen&&!ui.reminderCenterOpen) return Object.assign(base,{reason:'overlay-open',policy:'overlay-open',target:''});
    if(x.overlayOpenSkip) overlayOpen=false;
    if(draftActive) return Object.assign(base,{mode:'targeted',reason:'draft-active',policy:'draft-active',target:target==='reminder-center'?'reminder-center-live':'reminder-inbox-live'});
    if(x.requiresFullRender===true) return Object.assign(base,{mode:'full',reason:'action-accepted',policy:'action-accepted'});
    if(target) return Object.assign(base,{mode:'targeted',reason:actionAccepted?'action-accepted-targeted':'targeted-update',policy:actionAccepted?'action-accepted-targeted':'targeted-update'});
    if((sourceName==='timer'||sourceName==='boot'||actionAccepted)&&c.visibilityState==='visible') return Object.assign(base,{mode:'full',reason:actionAccepted?'action-accepted':'candidate-changed',policy:actionAccepted?'action-accepted':'candidate-changed'});
    return base;
  }
  function reminderRenderAction(reason,options){
    var x=options&&typeof options==='object'?options:{}, context={visibilityState:reminderLifecycleVisibility(x.visibilityState||'visible'),nowIso:x.nowIso||new Date().toISOString()}, result=Object.assign({changed:true,actionAccepted:true,shownCount:0,scheduledCount:0,suppressedCount:0},x.result||{});
    // Tam overlay açıkken bile action'ın sonucunu gösterebilmek için
    // reminder merkezi hedefleri overlayOpen kontrolünü atlar.
    var target=String(x.target||''), overlayOpenSkip=target==='reminder-center'||target==='reminder-center-live';
    return reminderLifecycleRenderIfNeeded(result,reminderLifecycleState.candidateSignature,context,'action',{actionAccepted:true,requiresFullRender:x.requiresFullRender===true,target:target,force:true,overlayOpenSkip:overlayOpenSkip});
  }
  function reminderLifecycleEvaluate(source,input){
    if(source&&typeof source==='object'&&input===undefined){ input=source; source=input.source||'manual'; }
    var x=input&&typeof input==='object'?Object.assign({},input):{}, nowIso=reminderDeliveryNow(x.nowIso||x.now), sourceName=String(source||x.source||'manual');
    if(reminderLifecycleState.running) return {ok:true,status:'skipped',source:sourceName,reason:'duplicate',changed:false,results:[],errors:[]};
    if(!data) return {ok:true,status:'skipped',source:sourceName,reason:'no-data',changed:false,results:[],errors:[]};
    reminderLifecycleState.running=true;
    try{
      var root=reminderCurrentRoot(), context=reminderLifecycleDefaultContext(x,nowIso), recoveryCatchUp=sourceName==='online'&&context.offline!==true&&reminderLifecycleState.recoveryPending===true, systemStatus=reminderSystemStatus({nowIso:nowIso,localDate:context.localDate,timezone:context.timezone,offline:context.offline,permissionState:context.permissionState,receipt:data&&data.syncReceipt,configured:syncConfigured(),prayerData:x.prayerData,recovery:recoveryCatchUp}), catchUp=(x.catchUp===true||sourceName==='boot'||sourceName==='foreground'||sourceName==='focus'||sourceName==='pageshow'||sourceName==='visibilitychange'||(sourceName==='online'&&recoveryCatchUp))&&context.offline!==true, candidateInput=Object.assign({},x,{catchUp:catchUp,offline:context.offline}), candidates=reminderLifecycleBuildCandidates(candidateInput,context,root), stalePrayerBlocked=0, candidateById={};
      if(context.offline===true||sourceName==='offline') reminderLifecycleState.recoveryPending=true;
      candidates=candidates.filter(function(candidate){ if(!reminderLifecycleIsPrayerCandidate(candidate)) return true; if(systemStatus.prayerState==='fresh') return true; stalePrayerBlocked++; return false; });
      candidates.forEach(function(candidate){ var candidateOccurrence=candidate&&candidate.occurrence&&typeof candidate.occurrence==='object'?candidate.occurrence:candidate, candidateId=reminderLifecycleOccurrenceId(candidateOccurrence); if(candidateId&&!candidateById[candidateId]) candidateById[candidateId]=candidate; });
      var current=reminderDeliveryLoad(nowIso,false), result=reminderEvaluateReminders({source:sourceName,nowIso:nowIso,visibilityState:context.visibilityState,context:context,occurrences:candidates,deliveryLog:current,catchUp:catchUp});
      var persisted=true;
      if(result.changed&&!reminderDeliveryStorageWrite(result.log)){ persisted=false; result.ok=false; result.errors=(result.errors||[]).concat([{occurrenceId:'',reason:'storage-error'}]); }
      result.persisted=persisted;
      // Scheduler teslimi pure evaluator içinde oluşur; event log'a yalnızca
      // gerçekten yeni bir shown kaydı durable olduktan sonra yazılır. Aynı tick,
      // focus veya retry tekrarında changed=false olduğundan yeni event çıkmaz.
      var deliveredEventCount=0;
      if(persisted&&Array.isArray(result.results)) result.results.forEach(function(deliveryResult){
        if(!deliveryResult||deliveryResult.status!=='shown'||deliveryResult.changed!==true||deliveryResult.duplicate===true) return;
        if(appendReminderEvent(data,'delivered',deliveryResult.occurrenceId)) deliveredEventCount++;
      });
      result.eventLogChanged=deliveredEventCount>0;
      // Delivery evaluator mevcut sözleşmede canonical `data` save'i yapmaz;
      // event projection bellekte tutulur ve sonraki gerçek app save'ine dahil
      // olur. Böylece foreground tick reminder state'i veya sync receipt'i
      // action lifecycle'dan bağımsız olarak değiştirmez.
      var nativeResults=[];
      if(persisted&&Array.isArray(result.results)) result.results.forEach(function(deliveryResult){
        if(!deliveryResult||deliveryResult.status!=='shown'||deliveryResult.channel!=='native'||deliveryResult.changed!==true||deliveryResult.duplicate===true||deliveryResult.nativeAllowed!==true) return;
        var candidate=candidateById[String(deliveryResult.occurrenceId||'')]; if(!candidate) return;
        var occurrence=candidate.occurrence&&typeof candidate.occurrence==='object'?candidate.occurrence:candidate;
        var native=reminderNativeDisplay({source:sourceName,visibilityState:context.visibilityState,occurrence:occurrence,definition:candidate.definition,reminderId:candidate.reminderId||occurrence.reminderId,occurrenceId:deliveryResult.occurrenceId,deepLink:occurrence.deepLink,policy:{nativeAllowed:true,channel:'native',reason:deliveryResult.policyReason||'native-allowed'},changed:true,duplicate:false});
        deliveryResult.nativeStatus=native.ok?'shown':'blocked';
        deliveryResult.nativeReason=native.reason||null;
        nativeResults.push({occurrenceId:deliveryResult.occurrenceId,status:deliveryResult.nativeStatus,reason:deliveryResult.nativeReason});
      });
      result.nativeResults=nativeResults; result.nativeShownCount=nativeResults.filter(function(item){ return item.status==='shown'; }).length; result.systemStatus=systemStatus; result.stalePrayerBlocked=stalePrayerBlocked; result.recoveryState=recoveryCatchUp?'recovery':'idle'; result.catchUpPerformed=catchUp;
      result.candidateSignature=reminderLifecycleCandidateSignature(candidates);
      result.rendered=reminderLifecycleRenderIfNeeded(result,result.candidateSignature,context,sourceName);
      var renderReceipt=reminderLifecycleState.renderReceipt;
      result.renderMode=renderReceipt?renderReceipt.mode:'none'; result.renderPolicy=renderReceipt?renderReceipt.policy:''; result.renderReason=renderReceipt?renderReceipt.reason:''; result.renderTarget=renderReceipt?renderReceipt.target:'';
      result.candidateChanged=!!reminderLifecycleState.candidateChanged;
      if(sourceName==='online'&&context.offline!==true&&result.ok===true&&persisted) reminderLifecycleState.recoveryPending=false;
      else if(context.offline===true||sourceName==='offline') reminderLifecycleState.recoveryPending=true;
      reminderLifecycleState.lastSource=sourceName; reminderLifecycleState.lastEvaluatedAt=nowIso; reminderLifecycleState.lastResult={status:result.status,source:result.source,visibilityState:result.visibilityState,shownCount:result.shownCount,suppressedCount:result.suppressedCount,scheduledCount:result.scheduledCount,duplicateCount:result.duplicateCount,errorCount:result.errors.length,persisted:persisted,recoveryState:result.recoveryState,catchUpPerformed:result.catchUpPerformed,candidateChanged:!!result.candidateChanged,rendered:!!result.rendered,renderReason:reminderLifecycleState.lastRenderReason,candidateCount:candidates.length};
      return result;
    }catch(e){
      var failed={ok:false,status:'failed',source:sourceName,reason:'unknown',changed:false,results:[],errors:[{occurrenceId:'',reason:'unknown'}],persisted:false};
      reminderLifecycleState.lastSource=sourceName; reminderLifecycleState.lastEvaluatedAt=nowIso; reminderLifecycleState.lastResult={status:'failed',source:sourceName,errorCount:1,persisted:false};
      return failed;
    }finally{ reminderLifecycleState.running=false; }
  }
  function reminderSchedulerFallbackCreate(){
    var matrix={}, history=[], evaluateCount=0, receivedCount=0, coalescedCount=0, deliveryCount=0, lastTrigger='', lastAtMs=null, lastEvaluation=null, lastDelivery=null;
    REMINDER_SCHEDULER_TRIGGER_ORDER.forEach(function(name){ matrix[name]={received:0,evaluated:0,coalesced:0,lastAtMs:null}; });
    function snapshot(){
      var copy={}; Object.keys(matrix).forEach(function(name){ copy[name]=Object.assign({},matrix[name]); });
      return {version:'1',burstMs:REMINDER_SCHEDULER_BURST_MS,foregroundOnly:true,backgroundScheduling:false,appClosedGuarantee:false,nativeReplay:false,catchUpMaxAgeMs:86400000,triggerOrder:REMINDER_SCHEDULER_TRIGGER_ORDER.slice(),triggerMatrix:copy,triggerHistory:history.map(function(entry){ return Object.assign({},entry); }),receivedCount:receivedCount,evaluateCount:evaluateCount,coalescedCount:coalescedCount,deliveryCount:deliveryCount,lastTrigger:lastTrigger,lastAtMs:lastAtMs,lastEvaluation:lastEvaluation?Object.assign({},lastEvaluation):null,lastDelivery:lastDelivery?Object.assign({},lastDelivery):null};
    }
    function summary(result){
      var x=result&&typeof result==='object'?result:{};
      return {ok:x.ok!==false,status:String(x.status||''),source:String(x.source||''),changed:x.changed===true,shownCount:Number(x.shownCount)||0,nativeShownCount:Number(x.nativeShownCount)||0,suppressedCount:Number(x.suppressedCount)||0,duplicateCount:Number(x.duplicateCount)||0,catchUpCount:Number(x.catchUpCount)||0,catchUpPerformed:x.catchUpPerformed===true,nativeReplay:false};
    }
    return {trigger:function(source,payload){
      var name=REMINDER_SCHEDULER_TRIGGER_ORDER.indexOf(String(source||'manual'))>=0?String(source||'manual'):'manual', x=payload&&typeof payload==='object'?Object.assign({},payload):{}, at=Number.isFinite(Number(x.triggerAtMs))?Number(x.triggerAtMs):(Number.isFinite(Number(x.schedulerAtMs))?Number(x.schedulerAtMs):Date.now()), row=matrix[name], previous=row.lastAtMs, burst=previous!==null&&at>=previous&&at-previous<REMINDER_SCHEDULER_BURST_MS;
      receivedCount++; row.received++; lastTrigger=name; lastAtMs=at;
      if(burst){ row.coalesced++; coalescedCount++; history.push({source:name,atMs:at,accepted:false,status:'coalesced',reason:'trigger-burst'}); if(history.length>32) history.shift(); return {ok:true,status:'coalesced',source:name,reason:'trigger-burst',changed:false,shownCount:0,nativeShownCount:0,duplicateCount:1,scheduler:snapshot()}; }
      row.evaluated++; row.lastAtMs=at; var result;
      try{ result=reminderLifecycleEvaluate(name,x); }catch(e){ result={ok:false,status:'failed',source:name,reason:'unknown',changed:false}; }
      evaluateCount++; var safe=summary(result); lastEvaluation=safe; deliveryCount+=safe.shownCount+safe.nativeShownCount; if(safe.shownCount||safe.nativeShownCount) lastDelivery=safe;
      history.push({source:name,atMs:at,accepted:true,status:'evaluated',shownCount:safe.shownCount,nativeShownCount:safe.nativeShownCount,duplicateCount:safe.duplicateCount,catchUpCount:safe.catchUpCount}); if(history.length>32) history.shift();
      return result&&typeof result==='object'?Object.assign({},result,{scheduler:snapshot()}):result;
    },snapshot:snapshot,reset:function(){ REMINDER_SCHEDULER_TRIGGER_ORDER.forEach(function(name){ matrix[name]={received:0,evaluated:0,coalesced:0,lastAtMs:null}; }); history=[]; receivedCount=0; evaluateCount=0; coalescedCount=0; deliveryCount=0; lastTrigger=''; lastAtMs=null; lastEvaluation=null; lastDelivery=null; }};
  }
  function reminderLifecycleTick(){ return SEYMA_APP_SURFACE.reminderLifecycleTimer.apply(null,arguments); }
  function reminderSyncPayload(source){
    var out;
    if(!source||typeof source!=='object'||Array.isArray(source)) return null;
    try{ out=JSON.parse(JSON.stringify(source)); }catch(e){ return null; }
    Object.keys(out).forEach(function(key){ if(isReminderSyncBlockedKey(key)) delete out[key]; });
    return out;
  }
  var REMINDER_PRIVACY_FORBIDDEN_FIELDS=[
    'privateDetail','privateLabel','privateBody','rawBody','body','detail','note','notes','userNote',
    'therapyNote','therapyDetail','medicationName','dose','doseText','mood','moodNote','journal',
    'journalEntry','prayerCompletion','completedPrayers','ghToken','openaiKey','syncUrl','auth','token',
    'lat','lng','coords','gps','location','locationHistory','nativeTitle','nativeBody'
  ];
  var REMINDER_PRIVACY_SCHEMAS=null;
  // MON2-02: şema nesnesi tembel kurulu — REMINDER_EVENT_SUMMARY deps bag kaydından sonra okunur.
  function reminderPrivacySchemasObject(){
    if(!REMINDER_PRIVACY_SCHEMAS) REMINDER_PRIVACY_SCHEMAS={
    schemaVersion:1,
    localOnlyKey:{
      id:'localOnlyKey',
      storage:'localStorage:seyma-reminder-delivery-v1 | seyma-reminder-actions-v1 | seyma-reminder-permission-v1',
      synced:false,
      inCanonicalData:false,
      fieldRule:'allowlist',
      allowedFields:['schemaVersion','generation','clearBoundaryAt','updatedAt','entries','tombstones','state','everGranted','occurrenceId','parentOccurrenceId','reminderId','channel','status','reason','action','actionId','option','timezone','recordedAt','actedAt','createdAt','scheduledAt','shownAt','openedAt','snoozedUntil','terminalAt'],
      forbiddenFields:REMINDER_PRIVACY_FORBIDDEN_FIELDS
    },
    canonicalPreference:{
      id:'canonicalPreference',
      storage:'localStorage:seyma-reset-v1 -> data.reminders',
      synced:false,
      inCanonicalData:true,
      fieldRule:'additive-local-only',
      blockedSyncRoots:Object.keys(REMINDER_SYNC_BLOCKED_ROOTS).sort(),
      forbiddenFields:[]
    },
    safeEventSummary:{
      id:'safeEventSummary',
      storage:'data.eventLog',
      synced:true,
      inCanonicalData:true,
      fieldRule:'fixed-summary',
      allowedFields:['section','path','operation','summary','correlationId','privacyClass'],
      fixedSummary:REMINDER_EVENT_SUMMARY,
      correlationPrefix:'reminder-v1:',
      forbiddenFields:REMINDER_PRIVACY_FORBIDDEN_FIELDS
    },
    projectionSummary:{
      id:'projectionSummary',
      storage:'derived: reminderRetentionSummary / observer projection',
      synced:false,
      inCanonicalData:false,
      fieldRule:'aggregate-only',
      forbiddenFields:REMINDER_PRIVACY_FORBIDDEN_FIELDS
    },
    nativeCopy:{
      id:'nativeCopy',
      storage:'OS notification centre',
      synced:false,
      inCanonicalData:false,
      fieldRule:'allowlist',
      allowedFields:['title','body','tag','deepLink'],
      source:'catalog-private-copy',
      forbiddenFields:REMINDER_PRIVACY_FORBIDDEN_FIELDS
    }
    };
    return REMINDER_PRIVACY_SCHEMAS;
  }
  function reminderPrivacySchemas(){ return reminderLocalClone(reminderPrivacySchemasObject())||{}; }
  function reminderPrivacyHasContent(value){
    if(value===null||value===undefined||value===false||value==='') return false;
    if(Array.isArray(value)) return value.length>0;
    if(typeof value==='object') return Object.keys(value).length>0;
    return true;
  }
  function reminderPrivacyWalk(value,visit,pathPrefix){
    var path=String(pathPrefix||'');
    if(!value||typeof value!=='object') return;
    if(Array.isArray(value)){ value.forEach(function(item,index){ reminderPrivacyWalk(item,visit,path+'['+index+']'); }); return; }
    Object.keys(value).forEach(function(key){ visit(key,value[key],path?path+'.'+key:key); reminderPrivacyWalk(value[key],visit,path?path+'.'+key:key); });
  }
  function reminderPrivacyReport(schemaId,value,samples){
    var schema=reminderPrivacySchemasObject()[String(schemaId||'')];
    if(!schema) return {ok:false,schema:null,reason:'unknown-schema',forbiddenFields:[],unexpectedFields:[],leakedSamples:[]};
    var forbidden=[], unexpected=[], allowed=Array.isArray(schema.allowedFields)?schema.allowedFields:null;
    var blocked={}; (schema.forbiddenFields||[]).forEach(function(field){ blocked[field]=true; });
    reminderPrivacyWalk(value,function(key,child,path){
      // A declared boundary flag (`medicationName:false`) is a promise, not
      // content; only a field that actually carries a value is a leak.
      if(blocked[key]&&!(allowed&&allowed.indexOf(key)>=0)&&reminderPrivacyHasContent(child)) forbidden.push(path);
      if(allowed&&allowed.indexOf(key)<0) unexpected.push(path);
    },'');
    var text=''; try{ text=JSON.stringify(value)||''; }catch(e){ text=''; }
    var leaked=(Array.isArray(samples)?samples:[]).map(String).filter(Boolean).filter(function(sample){ return text.indexOf(sample)>=0; });
    return {
      ok:forbidden.length===0&&unexpected.length===0&&leaked.length===0,
      schema:schema.id,
      synced:schema.synced===true,
      reason:null,
      forbiddenFields:forbidden,
      unexpectedFields:unexpected,
      leakedSamples:leaked
    };
  }
  function reminderCenterNativeUsed(nowIso){
    var iso=reminderDeliveryNow(nowIso), parts=reminderEngineLocalParts(Date.parse(iso),REMINDER_ENGINE_DEFAULT_TIMEZONE), date=parts&&parts.localDate, count=0;
    if(!date) return 0;
    reminderDeliveryLoad(iso,true).entries.forEach(function(entry){
      if(entry.channel!=='native'||['shown','opened','snoozed','dismissed'].indexOf(entry.status)<0) return;
      var at=reminderEngineLocalParts(Date.parse(entry.recordedAt),REMINDER_ENGINE_DEFAULT_TIMEZONE);
      if(at&&at.localDate===date) count++;
    });
    return count;
  }
  function reminderCenterHistoryEntries(nowIso){
    var iso=reminderDeliveryNow(nowIso), rows=[];
    reminderDeliveryLoad(iso,true).entries.forEach(function(entry){
      rows.push({kind:'delivery',recordedAt:entry.recordedAt,status:String(entry.status||'event'),channel:String(entry.channel||'in_app'),label:reminderCopy('inApp.history.label','Bir reminder durağı'),detail:entry.channel==='native'?reminderCopy('inApp.history.nativeChannel','Native kanal meta verisi'):reminderCopy('inApp.history.inAppChannel','Uygulama içi kanal')});
    });
    reminderActionLoad(iso,true).entries.forEach(function(entry){
      var action=String(entry.action||'işlem'), labels={snooze:reminderCopy('inApp.history.status.snoozed','Ertelendi'),todayOff:reminderCopy('inApp.mute.today','Bugün susturuldu'),disable:reminderCopy('inApp.history.status.dismissed','Kapatıldı'),enable:reminderCopy('inApp.history.status.reopened','Tekrar açıldı'),open:reminderCopy('inApp.history.status.opened','Açıldı')};
      rows.push({kind:'action',recordedAt:entry.recordedAt,status:labels[action]||reminderCopy('inApp.history.unknownAction','İşlem kaydı'),channel:'local',label:reminderCopy('inApp.history.label','Bir reminder durağı'),detail:action==='snooze'&&entry.option?(reminderCopy('inApp.history.selection','Seçim')+': '+(reminderActionOptionLabel(entry.option)||reminderCopy('inApp.history.shortDuration','kısa süre'))):reminderCopy('inApp.history.settingsAction','Ayar eylemi')});
    });
    rows.sort(function(a,b){ return Date.parse(b.recordedAt)-Date.parse(a.recordedAt); });
    return rows.slice(0,5).map(function(row){ return {kind:row.kind,recordedAt:row.recordedAt,status:row.status,channel:row.channel,label:row.label,detail:row.detail}; });
  }
  function reminderCenterHistoryStatusLabel(status){
    var labels={scheduled:reminderCopy('inApp.history.status.scheduled','Planlandı'),shown:reminderCopy('inApp.history.status.shown','Gösterildi'),opened:reminderCopy('inApp.history.status.opened','Açıldı'),snoozed:reminderCopy('inApp.history.status.snoozed','Ertelendi'),dismissed:reminderCopy('inApp.history.status.dismissed','Kapatıldı'),suppressed:reminderCopy('inApp.history.status.suppressed','Sakince tutuldu'),failed:reminderCopy('inApp.history.status.failed','Gönderilemedi')};
    return labels[String(status||'')]||String(status||reminderCopy('inApp.history.unknownStatus','Kısa olay'));
  }
  function reminderCenterHistoryHTML(){
    var rows=reminderCenterHistoryEntries(), h='<section class="sey-reminder-history" aria-labelledby="sey-reminder-history-title"><div class="sey-reminder-section-head"><div><span class="sey-reminder-eyebrow">YEREL VE KISA ÖMÜRLÜ</span><h3 id="sey-reminder-history-title">'+esc(reminderCopy('inApp.history.title','Son reminder geçmişi'))+'</h3></div><span class="sey-reminder-count">'+rows.length+'</span></div><p class="sey-reminder-profile-note">'+esc(reminderCopy('inApp.history.note','Yalnız durum, kanal ve zaman tutulur. Reminder gövdesi, kişisel not veya sağlık ayrıntısı burada gösterilmez.'))+'</p>';
    if(!rows.length) h+='<div class="sey-reminder-empty" data-reminder-history-state="empty" role="status"><span aria-hidden="true">'+icon('history',22)+'</span><strong>'+esc(reminderCopy('inApp.history.emptyTitle','Henüz geçmiş yok.'))+'</strong><p>'+esc(reminderCopy('inApp.history.emptyBody','Sentetik testler ve ayar değişiklikleri de dış sisteme gönderilmez.'))+'</p></div>';
    else {
      h+='<div class="sey-reminder-history-list" role="list" aria-label="Son reminder geçmişi">';
      rows.forEach(function(row,index){
        var at=validReminderIso(row.recordedAt)?new Date(row.recordedAt).toLocaleString('tr-TR',{dateStyle:'short',timeStyle:'short'}):'zaman bilgisi yok', statusLabel=row.kind==='delivery'?reminderCenterHistoryStatusLabel(row.status):String(row.status||'İşlem kaydı');
        h+='<div class="sey-reminder-history-row" role="listitem" data-reminder-history-kind="'+esc(row.kind)+'"><span class="sey-reminder-history-icon" aria-hidden="true">'+icon(row.kind==='action'?'check-check':'bell',15)+'</span><span class="sey-reminder-history-copy"><strong>'+esc(statusLabel)+'</strong><small>'+esc(row.label)+' · '+esc(row.detail)+'</small></span><time datetime="'+esc(row.recordedAt)+'">'+esc(at)+'</time></div>';
      });
      h+='</div>';
    }
    h+='<div class="sey-reminder-history-actions"><button data-fx="destructive" type="button" class="sey-reminder-secondary" onclick="App.clearReminderHistory()"'+(rows.length?'':' disabled')+'>'+esc(reminderCopy('inApp.history.clear','Geçmişi temizle'))+'</button>'+(ui.reminderHistoryUndo?'<button type="button" class="sey-reminder-secondary" onclick="App.undoReminderHistory()">'+esc(reminderCopy('inApp.history.undo','Geri al'))+'</button>':'')+'</div></section>';
    return h;
  }
  function reminderCenterRetentionHTML(){
    var summary=reminderRetentionSummary({download:false}), undo=!!ui.reminderAllUndo, total=summary.deliveryJournal.entryCount+summary.notificationHistory.entryCount, h='<section class="sey-reminder-retention" data-reminder-retention-surface="local-only" aria-labelledby="sey-reminder-retention-title"><div class="sey-reminder-section-head"><div class="sey-reminder-retention-heading"><span class="sey-reminder-eyebrow">YEREL KONTROL · REM-39</span><h3 id="sey-reminder-retention-title">Saklama ve çıkış</h3><p class="sey-reminder-retention-subtitle">Bu cihazdaki tercihleri, kısa süreli geçmişi ve güvenli dışa aktarmayı yönet.</p></div><span class="sey-reminder-count" aria-label="'+total+' toplam kısa süreli kayıt">'+total+'</span></div>';
    h+='<p class="sey-reminder-profile-note sey-reminder-retention-note">Tercihler sen temizleyene kadar bu cihazda kalır. Teslim ve işlem günlükleri sınırlı süre tutulur. Dışa aktarma yalnızca anonim özet üretir; kişisel içerik içermez.</p>';
    h+='<div class="sey-reminder-retention-grid" role="list" aria-label="Hatırlatma saklama özeti"><div class="sey-reminder-retention-metric" role="listitem"><strong>Tercihler</strong><small>Manuel temizliğe kadar</small><b>'+summary.preferences.configuredCount+' ayar</b></div><div class="sey-reminder-retention-metric" role="listitem"><strong>Teslim günlüğü</strong><small>Son 30 gün · en fazla 200</small><b>'+summary.deliveryJournal.entryCount+' kayıt</b></div><div class="sey-reminder-retention-metric" role="listitem"><strong>İşlem geçmişi</strong><small>Son 14 gün · en fazla 100</small><b>'+summary.notificationHistory.entryCount+' kayıt</b></div><div class="sey-reminder-retention-metric" role="listitem"><strong>Sakin özet</strong><small>Son 7 yerel gün</small><b>Kalıcı değil</b></div></div>';
    h+='<div class="sey-reminder-retention-actions" aria-label="Hatırlatma veri eylemleri"><div class="sey-reminder-retention-primary-actions"><button type="button" class="sey-reminder-primary" onclick="App.exportReminderSummary()">'+icon('download',15)+' Güvenli özeti dışa aktar</button><button type="button" class="sey-reminder-secondary" onclick="App.disableAllReminders()">'+icon('bell-off',15)+' Tümünü kapat</button></div>'+(undo?'<div class="sey-reminder-retention-undo-row"><button type="button" class="sey-reminder-secondary" onclick="App.undoDisableAllReminders()">'+icon('rotate-ccw',15)+' Tümünü geri al</button></div>':'')+'<div class="sey-reminder-retention-danger"><span class="sey-reminder-retention-danger-label">Dikkat · yerel temizleme</span><button data-fx="destructive" type="button" class="sey-reminder-secondary is-danger" onclick="App.reminderFullReset()">'+icon('trash-2',15)+' Reminder verilerini sıfırla</button></div></div>';
    h+='<p class="sey-reminder-retention-boundary" role="note">“Tümünü kapat” tercihleri ve geçmişi korur; istersen geri alabilirsin. “Reminder verilerini sıfırla” yalnız reminder kayıtlarını ve izin durumunu siler; Şeyma’nın günlük kayıtlarına dokunmaz.</p></section>';
    return h;
  }
  function reminderPersonalizationHTML(root){
    var state=reminderPersonalizationState(root), suggestions=reminderPersonalizationSuggestions({personalization:state,preferences:root&&root.preferences,policy:root&&root.policy}), accepted=state.applied.filter(function(item){ return item.status==='accepted'; }), h='<section class="sey-reminder-personalization" data-reminder-personalization-state="'+(state.optIn&&state.historyMode==='local'?'local':'off')+'" aria-labelledby="sey-reminder-personalization-title"><div class="sey-reminder-section-head"><div><span class="sey-reminder-eyebrow">AÇIK SEÇİMLERLE UYARLAMA</span><h3 id="sey-reminder-personalization-title">Ritmini birlikte ayarlayalım</h3></div><span class="sey-reminder-profile-active">'+(state.optIn&&state.historyMode==='local'?'Açık':'Kapalı')+'</span></div>';
    h+='<p class="sey-reminder-profile-note">Yalnız açık kategori, saat, erteleme ve geri bildirim seçimlerin kaynak alınır. Bu katman kendiliğinden ayar değiştirmez; öneriler yerel kalır ve her zaman geri alınabilir.</p>';
    if(!state.optIn){
      h+='<div class="sey-reminder-empty" data-reminder-personalization-history="none" role="status"><span aria-hidden="true">'+icon('sliders-horizontal',22)+'</span><strong>Uyarlama kapalı.</strong><p>Hiç sinyal tutulmuyor ve hiçbir öneri üretilmiyor.</p><button type="button" class="sey-reminder-primary" onclick="App.setReminderPersonalizationOptIn(true)">Açık seçimlerle uyarlamayı aç</button></div>';
    } else {
      h+='<div class="sey-reminder-personalization-controls"><div><strong>'+ (state.historyMode==='local'?'Yerel geçmiş açık':'Yerel geçmiş kapalı') +'</strong><small>Otomatik uygulama: her zaman kapalı. '+(state.historyMode==='local'?'Sadece bu cihazda sınırlı sinyal tutulur.':'Geçmiş tutulmaz; uyarlama çalışmaz.')+'</small></div><div class="sey-reminder-personalization-actions">'+(state.historyMode==='local'?'<button type="button" class="sey-reminder-secondary" onclick="App.setReminderPersonalizationHistoryMode(\'none\')">Geçmişi kapat</button>':'<button type="button" class="sey-reminder-primary" onclick="App.setReminderPersonalizationHistoryMode(\'local\')">Yerel geçmişi aç</button>')+'<button type="button" class="sey-reminder-secondary" onclick="App.setReminderPersonalizationOptIn(false)">Uyarlamayı kapat</button></div></div>';
      if(state.historyMode==='local'){
        h+='<div class="sey-reminder-personalization-sources" aria-label="Uyarlama kaynakları"><span><strong>'+state.signals.filter(function(item){ return item.type==='category'; }).length+'</strong><small>'+reminderPersonalizationSourceLabel('explicit-category-choice')+'</small></span><span><strong>'+state.signals.filter(function(item){ return item.type==='time'; }).length+'</strong><small>'+reminderPersonalizationSourceLabel('explicit-time-choice')+'</small></span><span><strong>'+state.signals.filter(function(item){ return item.type==='snooze'; }).length+'</strong><small>'+reminderPersonalizationSourceLabel('explicit-snooze')+'</small></span><span><strong>'+state.signals.filter(function(item){ return item.type==='feedback'; }).length+'</strong><small>'+reminderPersonalizationSourceLabel('explicit-feedback')+'</small></span></div>';
        h+='<div class="sey-reminder-personalization-feedback"><strong>Açık geri bildirim ver</strong><small>Bir ayarı sessizce değiştirmez; yalnızca sen onaylarsan güvenli bir öneri hazırlanır.</small><div class="sey-reminder-personalization-actions"><button type="button" class="sey-reminder-secondary" onclick="App.recordReminderPersonalizationFeedback(\'more_quiet\')">Daha sakin olsun</button><button type="button" class="sey-reminder-secondary" onclick="App.recordReminderPersonalizationFeedback(\'time_wrong\')">Saat uygun değil</button><button type="button" class="sey-reminder-secondary" onclick="App.recordReminderPersonalizationFeedback(\'keep\')">Böyle kalsın</button></div></div>';
        if(suggestions.length){ h+='<div class="sey-reminder-personalization-suggestions" role="list" aria-label="Uyarlama önerileri">'; suggestions.forEach(function(suggestion){ h+='<article class="sey-reminder-personalization-suggestion" role="listitem" data-reminder-personalization-suggestion="'+esc(suggestion.id)+'"><strong>'+(suggestion.kind==='capacity'?'Bugünün akışını hafiflet':'Bir durağı uygulama içinde tut')+'</strong><p>'+esc(suggestion.reason)+'</p><small>Kaynak: '+esc(suggestion.sourceLabel)+' · Kendiliğinden uygulanmaz · geri alınabilir</small><div class="sey-reminder-personalization-actions"><button data-fx="confirm" type="button" class="sey-reminder-primary" onclick="App.applyReminderPersonalizationSuggestion(\''+esc(suggestion.id)+'\')">Uygula</button><button type="button" class="sey-reminder-secondary" onclick="App.dismissReminderPersonalizationSuggestion(\''+esc(suggestion.id)+'\')">Şimdi değil</button></div></article>'; }); h+='</div>'; }
        else h+='<div class="sey-reminder-empty" data-reminder-personalization-suggestions="empty" role="status"><strong>Şimdilik öneri yok.</strong><p>Açık seçimlerin güvenli bir değişiklik için yeterli ve tutarlı olduğunda burada nedenini görürsün.</p></div>';
        if(accepted.length){ h+='<div class="sey-reminder-personalization-applied" role="list" aria-label="Uygulanmış uyarlamalar"><strong>Uygulanan öneriler</strong>'; accepted.forEach(function(entry){ h+='<div role="listitem"><span>'+esc(reminderPersonalizationReasonLabel(entry.reasonCode))+'</span><button type="button" class="sey-reminder-secondary" onclick="App.undoReminderPersonalizationSuggestion(\''+esc(entry.suggestionId)+'\')">Geri al</button></div>'; }); h+='</div>'; }
        h+='<button data-fx="destructive" type="button" class="sey-reminder-secondary" onclick="App.resetReminderPersonalization()">Uyarlama geçmişini ve tercihini sıfırla</button>';
      }
    }
    return h+'</section>';
  }
  function reminderCenterPolicyHTML(root){
    var policy=normalizeReminderPolicy(root&&root.policy), h='<section class="sey-reminder-policy" aria-labelledby="sey-reminder-policy-title"><div class="sey-reminder-section-head"><div><span class="sey-reminder-eyebrow">BUGÜNÜN KAPASİTESİ</span><h3 id="sey-reminder-policy-title">Sessizlik ve bütçe</h3></div><span class="sey-reminder-profile-active">'+esc(reminderCapacityModeLabel(policy.capacityMode))+'</span></div><p class="sey-reminder-profile-note">Bu genel ayarlar kategori seçimlerini silmez. Bir kategoriye verdiğin kanal veya açık/kapalı kararı, profil ve genel bütçe değişse de korunur.</p><div class="sey-reminder-policy-grid">';
    h+='<label>Bugünün modu<select aria-label="Bugünün reminder modu" onchange="App.setReminderCapacityMode(this.value)"><option value="balanced"'+(policy.capacityMode==='balanced'?' selected':'')+'>Dengeli</option><option value="light"'+(policy.capacityMode==='light'?' selected':'')+'>Hafif gün</option><option value="silent"'+(policy.capacityMode==='silent'?' selected':'')+'>Sessiz</option><option value="ritual"'+(policy.capacityMode==='ritual'?' selected':'')+'>Ritüel odaklı</option></select></label>';
    h+='<label>Günlük akış bütçesi<input type="number" min="0" max="24" step="1" value="'+policy.dailyFlowBudget+'" aria-label="Günlük akış bütçesi" onchange="App.setReminderDailyFlowBudget(this.value)"><small>En fazla 24 uygulama içi öneri</small></label>';
    h+='<label>Native günlük üst sınır<input type="number" min="0" max="24" step="1" value="'+policy.nativeDailyCap+'" aria-label="Native günlük üst sınır" onchange="App.setReminderNativeDailyCap(this.value)"><small>Bugün kullanılan: '+reminderCenterNativeUsed()+'</small></label>';
    h+='<label>Düşük öncelik sınırı<input type="number" min="0" max="24" step="1" value="'+policy.lowPriorityNativeCap+'" aria-label="Düşük öncelikli native sınırı" onchange="App.setReminderLowPriorityNativeCap(this.value)"><small>P3 / düşük yoğunluklu adaylar</small></label>';
    h+='</div><div class="sey-reminder-policy-quiet"><span><strong>Sessiz saatler</strong><small>Bu aralıkta uygulama içi kartlar korunur; native kanal ertelenir veya tutulur.</small></span><label>Başlangıç<input type="time" value="'+esc(policy.quietHours.start)+'" aria-label="Sessiz saat başlangıcı" onchange="App.setReminderQuietHours(this.value,\''+esc(policy.quietHours.end)+'\')"></label><label>Bitiş<input type="time" value="'+esc(policy.quietHours.end)+'" aria-label="Sessiz saat bitişi" onchange="App.setReminderQuietHours(\''+esc(policy.quietHours.start)+'\',this.value)"></label></div><div class="sey-reminder-policy-actions"><button data-fx="destructive" type="button" class="sey-reminder-secondary" onclick="App.resetReminderCenter()">Genel ayarları sıfırla</button><small>Kategori override’ları korunur.</small></div></section>';
    return h;
  }
  function reminderCenterNoticeHTML(){
    if(!ui.reminderCenterNotice) return '';
    return '<div class="sey-reminder-center-notice" role="status" aria-live="polite"><span aria-hidden="true">'+icon('check-check',16)+'</span><span>'+esc(ui.reminderCenterNotice)+'</span>'+(ui.reminderCenterUndo?'<button data-fx="destructive" type="button" class="sey-reminder-secondary" onclick="App.undoReminderCenterReset()">Geri al</button>':'')+'</div>';
  }
  function reminderDigestLauncherHTML(){
    return '<section class="sey-reminder-digest-launcher" aria-labelledby="sey-reminder-digest-launcher-title"><div><span class="sey-reminder-eyebrow">İSTEĞE BAĞLI · YALNIZCA BU CİHAZDA</span><h3 id="sey-reminder-digest-launcher-title">Bu hafta ve eski bir gün</h3><p>Bildirim üretmeden, puan tutmadan, istersen haftana sakince bak.</p></div><button data-fx="open" type="button" class="sey-reminder-primary" onclick="App.openReminderDigest()">Sakin alana bak</button></section>';
  }
  function reminderDigestHTML(){
    var digest=reminderDigestBuild({data:data}), state=ui.reminderDigestState==='no-op'?'no-op':digest.state, selected=reminderDigestReflectionOption(ui.reminderDigestReflection), h='<section class="sey-reminder-digest" data-reminder-digest-state="'+esc(state)+'" aria-labelledby="sey-reminder-digest-title">';
    h+='<div class="sey-reminder-section-head"><div><span class="sey-reminder-eyebrow">YEREL · KULLANICI İSTERSE</span><h3 id="sey-reminder-digest-title">Haftalık sakin alan</h3></div><button type="button" class="sey-reminder-secondary" onclick="App.dismissReminderDigest()">Şimdilik değil</button></div>';
    h+='<p class="sey-reminder-digest-window">'+esc(digest.window.startDate)+' – '+esc(digest.window.endDate)+' · '+esc(digest.timezone)+'</p>';
    if(state==='no-op'){
      h+='<div class="sey-reminder-digest-empty" data-reminder-digest-no-op="true" role="status"><span aria-hidden="true">'+icon('pause-circle',23)+'</span><strong>'+esc(reminderCopy('inApp.empty.noOpTitle','Burada durmak da tamam.'))+'</strong><p>'+esc(reminderCopy('inApp.empty.noOpBody','Hiçbir şey seçilmedi, kaydedilmedi ve bildirim üretilmedi.'))+'</p><button data-fx="open" type="button" class="sey-reminder-secondary" onclick="App.openReminderDigest()">Alanı yeniden aç</button></div>';
    } else if(state==='empty'||state==='cleared-history'){
      h+='<div class="sey-reminder-digest-empty" role="status"><span aria-hidden="true">'+icon(state==='cleared-history'?'eraser':'sparkles',23)+'</span><strong>'+(state==='cleared-history'?esc(reminderCopy('inApp.empty.clearedHistoryTitle','Geçmiş temizlendi.')):esc(reminderCopy('inApp.empty.digestTitle','Bu hafta için sakin bir boşluk var.')))+'</strong><p>'+(state==='cleared-history'?esc(reminderCopy('inApp.empty.clearedHistoryBody','Bu ekran yeniden boş ve yerel kalır.')):esc(reminderCopy('inApp.empty.digestBody','Burada gösterecek güvenli bir yerel özet yok. Hiçbir şey eklemen gerekmiyor.')))+'</p></div>';
    } else {
      h+='<div class="sey-reminder-digest-intro"><strong>'+(state==='first-week'?esc(reminderCopy('inApp.empty.digestFirstWeek','İlk haftan için yumuşak bir başlangıç.')):esc(reminderCopy('inApp.empty.digestOngoing','Bu hafta için bir durak.')))+'</strong><p>'+esc(reminderCopy('inApp.empty.digestBoundary','Bu alan yaptın / yapmadın hesabı değildir. Yalnızca senin istediğinde açılır; günlük ayrıntılar, mood, ibadet, terapi ve ilaç bilgileri bu özete girmez.'))+'</p></div>';
      h+='<div class="sey-reminder-digest-options" role="group" aria-label="Sakin reflection seçenekleri">';
      digest.reflectionOptions.forEach(function(option){ h+='<button type="button" class="sey-reminder-digest-option'+(selected&&selected.id===option.id?' is-selected':'')+'" onclick="App.selectReminderDigestReflection(\''+option.id+'\')" aria-pressed="'+(selected&&selected.id===option.id)+'"><strong>'+esc(option.label)+'</strong><span>'+esc(option.prompt)+'</span></button>'; });
      h+='</div>';
      if(selected) h+='<div class="sey-reminder-digest-selected" role="status"><span aria-hidden="true">'+icon('feather',15)+'</span><span>'+esc(selected.prompt)+'</span><small>Bu cümle yalnızca bu ekranda; kaydedilmez.</small></div>';
    }
    h+='<p class="sey-reminder-digest-boundary" role="note">Bu alan yalnız cihaz içinde çalışır. Native opt-in’den bağımsızdır, reminder bütçesi ve sessiz saatlerden etkilenmez; sync, analytics ve delivery kaydı oluşturmaz.</p></section>';
    return h;
  }
  function reminderTestPreviewHTML(){
    if(!ui.reminderTestState) return '';
    var h='<section class="sey-reminder-test-preview" data-reminder-test="synthetic" aria-labelledby="sey-reminder-test-title" role="status"><span class="sey-reminder-preview-kicker">'+esc(reminderCopy('inApp.preview.kicker','UYGULAMA İÇİ ÖNİZLEME · GÜVENLİ'))+'</span><h3 id="sey-reminder-test-title">'+esc(reminderCopy('inApp.preview.syntheticTitle','Şeyma’da küçük bir durak hazır'))+'</h3><p>'+esc(reminderCopy('inApp.preview.syntheticBody','Bu yalnızca uygulama içinde gösterildi. Gerçek Notification oluşturulmadı, dış sisteme gönderilmedi ve geçmişe yazılmadı.'))+'</p><small>'+esc(reminderCopy('inApp.preview.syntheticNote','Hassas reminder gövdesi burada kullanılmaz.'))+'</small></section>';
    return h;
  }
  function reminderPermissionExplanationHTML(copy){
    var c=copy||reminderPermissionExplanation('temporary-error');
    var h='<section class="sey-reminder-permission" data-reminder-permission-state="'+esc(c.state)+'" aria-live="polite" aria-atomic="true" aria-labelledby="sey-reminder-permission-title"><div class="sey-reminder-permission-top"><span class="sey-reminder-permission-icon" aria-hidden="true">'+icon(c.state==='granted'?'circle-check':(c.state==='denied'||c.state==='revoked'||c.state==='temporary-error'||c.state==='pwa-limited')?'triangle-alert':'info',17)+'</span><div><span class="sey-reminder-eyebrow">İZİN DURUMUNU ANLAMA</span><h3 id="sey-reminder-permission-title">'+esc(c.label)+'</h3></div></div><p>'+esc(c.meaning)+'</p><small>'+esc(c.action)+'</small>';
    if(c.state==='default') h+='<button type="button" class="sey-reminder-primary" data-reminder-permission-action="request" onclick="App.requestReminderPermission()">'+esc(reminderCopy('inApp.permission.request','Native kanalı aç'))+'</button><small>'+esc(reminderCopy('inApp.permission.explicitNote','İzin yalnız bu açık eylemden sonra istenir; ilk yüklemede istenmez.'))+'</small>';
    else if(c.state==='revoked') h+='<button type="button" class="sey-reminder-primary" data-reminder-permission-action="request" onclick="App.requestReminderPermission()">'+esc(reminderCopy('inApp.permission.revokedAction','Native kanalı yeniden aç'))+'</button><small>'+esc(reminderCopy('inApp.permission.revokedNote','Bu izin daha önce verilmişti ve şu anda kapalı görünüyor. Yeniden istemek yalnız sen dokunduğunda olur.'))+'</small>';
    else if(c.state==='denied') h+='<div class="sey-reminder-permission-help" data-reminder-permission-help="true"><strong>'+esc(reminderCopy('inApp.permission.settingsTitle','Tarayıcı ayarları rehberi'))+'</strong><small>'+esc(reminderCopy('inApp.permission.settingsBody','Bu site için tarayıcı ayarlarında Bildirimler bölümünü açıp İzin ver seçeneğini seçebilirsin. O zamana kadar uygulama içi kartlar çalışır.'))+'</small></div>';
    else if(c.state==='granted') h+='<button type="button" class="sey-reminder-secondary" data-reminder-permission-action="preview" onclick="App.testReminder()">'+esc(reminderCopy('inApp.permission.previewAction','Uygulama içi test akışını gör'))+'</button><small>'+esc(reminderCopy('inApp.permission.previewNote','Bu test gerçek Notification oluşturmaz.'))+'</small>';
    else if(c.state==='unsupported') h+='<small data-reminder-permission-fallback="in-app">'+esc(reminderCopy('inApp.permission.fallbackInApp','Native yerine uygulama içi hatırlatmalar kullanılabilir.'))+'</small>';
    else if(c.state==='temporary-error') h+='<button type="button" class="sey-reminder-secondary" data-reminder-permission-action="retry" onclick="App.requestReminderPermission()">'+esc(reminderCopy('inApp.permission.retry','Yeniden dene'))+'</button><small>'+esc(reminderCopy('inApp.permission.retryNote','Bu yeniden deneme yalnızca sen dokunduğunda yapılır.'))+'</small>';
    else if(c.state==='pwa-limited') h+='<small data-reminder-permission-fallback="catch-up">'+esc(reminderCopy('inApp.permission.fallbackCatchup','Uygulama açıldığında uygulama içi catch-up kartı gösterilebilir.'))+'</small>';
    h+='</section>';
    return h;
  }
  function reminderProfileSectionHTML(root){
    var active=normalizeReminderProfile(root&&root.profile), setup=!!(root&&root.onboarding&&!root.onboarding.completed), selected=setup?normalizeReminderCategories(ui.reminderSetupCategories):[];
    var h='<section class="sey-reminder-profiles" aria-labelledby="sey-reminder-profile-title"><div class="sey-reminder-section-head"><div><span class="sey-reminder-eyebrow">SANA UYAN BAŞLANGIÇ</span><h3 id="sey-reminder-profile-title">Profilini seç</h3></div><span class="sey-reminder-profile-active">'+esc(reminderProfileById(active).label)+'</span></div><p class="sey-reminder-profile-note">Profil yalnızca henüz seçilmemiş alanlara öneri ekler; daha önce verdiğin açık / kapalı ve kanal kararları korunur.</p><div class="sey-reminder-profile-list" role="radiogroup" aria-label="Hatırlatma profili">';
    REMINDER_PROFILE_LIST.forEach(function(profile){
      var isActive=profile.id===active;
      h+='<button type="button" class="sey-reminder-profile-choice'+(isActive?' is-active':'')+'" onclick="App.setReminderProfile(\''+esc(profile.id)+'\')" role="radio" aria-checked="'+isActive+'"><strong>'+esc(profile.label)+'</strong><small>'+esc(profile.description)+'</small></button>';
    });
    h+='</div>';
    if(setup){
      h+='<div class="sey-reminder-setup" aria-labelledby="sey-reminder-setup-title"><div class="sey-reminder-setup-head"><div><h4 id="sey-reminder-setup-title">Gün içinde neleri hatırlamamı istersin?</h4><p>En fazla üç başlangıç alanı seçebilirsin. Sonra her kategoriyi ayrıca değiştirebilirsin.</p></div><strong>'+selected.length+'/3</strong></div><div class="sey-reminder-setup-list" role="group" aria-label="Başlangıç kategorileri">';
      reminderCategoryIds().forEach(function(category){
        var meta=reminderCategoryMeta(category), chosen=selected.indexOf(category)>=0;
        h+='<button type="button" class="sey-reminder-setup-choice'+(chosen?' is-selected':'')+'" onclick="App.toggleReminderSetupCategory(\''+esc(category)+'\')" aria-pressed="'+chosen+'"><span aria-hidden="true">'+icon(meta.icon,15)+'</span><span><strong>'+esc(meta.label)+'</strong><small>'+esc(meta.description)+'</small></span></button>';
      });
      h+='</div><button data-fx="confirm" type="button" class="sey-reminder-setup-confirm" onclick="App.confirmReminderSetup()">Bu seçimlerle başla</button></div>';
    }
    return h+'</section>';
  }
  function reminderCategoryControlsHTML(root){
    var h='<section class="sey-reminder-categories" aria-labelledby="sey-reminder-categories-title"><div class="sey-reminder-section-head"><div><span class="sey-reminder-eyebrow">KATEGORİ TERCİHLERİ</span><h3 id="sey-reminder-categories-title">Her durak sende</h3></div></div><p class="sey-reminder-profile-note">Açıp kapatabilir, kanalı kategori bazında seçebilirsin. Native seçsen bile uygulama içi kartlar reddedilen izinde açık kalır.</p><div class="sey-reminder-category-list">';
    reminderCategoryIds().forEach(function(category){
      var meta=reminderCategoryMeta(category), state=reminderCategoryState(root,category), selectedChannel=state.channel==='mixed'?'in_app':state.channel;
      h+='<article class="sey-reminder-category" data-reminder-category-control="'+esc(category)+'"><div class="sey-reminder-category-head"><span class="sey-reminder-category-icon" aria-hidden="true">'+icon(meta.icon,17)+'</span><div><h4>'+esc(meta.label)+'</h4><p>'+esc(meta.description)+'</p></div><button type="button" class="sey-reminder-category-toggle'+(state.allEnabled?' is-on':'')+'" onclick="App.setReminderCategoryEnabled(\''+esc(category)+'\')" aria-pressed="'+state.allEnabled+'">'+(state.allEnabled?'Açık':'Kapalı')+'</button></div><div class="sey-reminder-category-meta"><span>'+state.enabledCount+'/'+state.total+' durak açık</span><label><span>Kanal</span><select aria-label="'+esc(meta.label)+' kanalı" onchange="App.setReminderCategoryChannel(\''+esc(category)+'\',this.value)"><option value="in_app"'+(selectedChannel==='in_app'?' selected':'')+'>Uygulama içi</option><option value="native"'+(selectedChannel==='native'?' selected':'')+'>Native · izin varsa</option></select></label></div><small class="sey-reminder-category-channel">'+esc(reminderCategoryChannelLabel(state.channel))+'</small></article>';
    });
    return h+'</div></section>';
  }
  function reminderSpecialDaysSectionHTML(root){
    var state=reminderSpecialDaysState(root), selected=state.selectedDays, offset=Number(prayerSettings()&&prayerSettings().hijriOffset)||0, modeOptions=[['all','Tüm özel günler','Kaynakta bulunan tüm Hicri / mübarek günler'],['selected','Yalnızca seçtiklerim','Sadece aşağıda işaretlediğin günler'],['none','Hiçbiri','Özel gün occurrence’ı üretme']];
    var h='<section class="sey-reminder-profiles sey-reminder-special" aria-labelledby="sey-reminder-special-title"><div class="sey-reminder-section-head"><div><span class="sey-reminder-eyebrow">HİCRİ TAKVİM</span><h3 id="sey-reminder-special-title">Özel günler sende</h3></div><span class="sey-reminder-profile-active">'+esc(state.mode==='all'?'Tümü':state.mode==='selected'?'Seçtiklerim':'Hiçbiri')+'</span></div>';
    h+='<p class="sey-reminder-profile-note">Hicri tarih ve mübarek gün bilgisi uygulamada görünmeye devam eder. Hatırlatma yalnızca sen seçersen oluşur; seçmediğin günler için hiçbir reminder üretilmez.</p><div class="sey-reminder-profile-list" role="radiogroup" aria-label="Özel gün tercihi">';
    modeOptions.forEach(function(item){ var active=state.mode===item[0]; h+='<button type="button" class="sey-reminder-profile-choice'+(active?' is-active':'')+'" onclick="App.setReminderSpecialDaysMode(\''+item[0]+'\')" role="radio" aria-checked="'+active+'"><strong>'+item[1]+'</strong><small>'+item[2]+'</small></button>'; });
    h+='</div>';
    if(state.mode==='selected'){
      h+='<div class="sey-reminder-setup" aria-labelledby="sey-reminder-special-list-title"><div class="sey-reminder-setup-head"><div><h4 id="sey-reminder-special-list-title">Gün seçimi</h4><p>Birden fazla gün seçebilirsin; bu liste yalnızca uygulama içi tercihini belirler.</p></div><strong>'+selected.length+'/'+REMINDER_SPECIAL_DAY_OPTIONS.length+'</strong></div><div class="sey-reminder-setup-list" role="group" aria-label="Seçilebilir özel günler">';
      REMINDER_SPECIAL_DAY_OPTIONS.forEach(function(option){ var active=selected.indexOf(option.id)>=0; h+='<button type="button" class="sey-reminder-setup-choice'+(active?' is-selected':'')+'" onclick="App.toggleReminderSpecialDay(\''+option.id+'\')" aria-pressed="'+active+'"><span aria-hidden="true">'+icon(active?'circle-check':'moon-star',15)+'</span><span><strong>'+esc(option.label)+'</strong><small>'+(active?'Seçildi':'Seçmek için dokun')+'</small></span></button>'; });
      h+='</div>'+(selected.length?'':'<p class="sey-reminder-profile-note" role="status">Henüz gün seçmedin; bu modda occurrence oluşmaz.</p>')+'</div>';
    }
    h+='<div class="sey-reminder-category-meta"><span>Hicri offset: <strong>'+(offset>0?'+':'')+offset+' gün</strong></span><label><span>Uygulama saati</span><input type="time" value="'+esc(state.time)+'" onchange="App.setReminderSpecialDaysTime(this.value)" aria-label="Özel gün hatırlatma saati" style="min-height:44px;padding:5px 7px;border:1px solid var(--field-bd);border-radius:9px;background:var(--card);color:var(--text);font:inherit;font-size:var(--f-caption2);"></label></div>';
    h+='<div class="sey-reminder-category-meta"><span>Native kanal başlangıçta kapalıdır.</span><label><span>Kanal</span><select aria-label="Özel gün hatırlatma kanalı" onchange="App.setReminderSpecialDaysChannel(this.value)"><option value="in_app"'+(state.channel==='in_app'?' selected':'')+'>Uygulama içi</option><option value="native"'+(state.channel==='native'?' selected':'')+'>Native · izin varsa</option></select></label></div>';
    h+='<small class="sey-reminder-category-channel">Offset değişirse occurrence tarihi yerel Hicri tercihe göre yeniden hesaplanır. Metin zorunluluk, puan veya ticari çağrı taşımaz.</small></section>';
    return h;
  }
  function reminderCareControlsHTML(root){
    var policy=normalizeReminderPolicy(root&&root.policy), selected=reminderCareNativeCategories(policy.careNativeCategories), movement=policy.careMovementOptIn===true;
    var labels={water:{label:'Su',description:'Uyanıklık penceresinde en fazla üç yumuşak durak',icon:'droplet'},sleep:{label:'Uykuya hazırlık',description:'Akşamda tek hazırlık penceresi',icon:'moon'},caffeine:{label:'Kafein kapanışı',description:'Yatıştan önce tek sakince kapanış noktası',icon:'coffee'},movement:{label:'Hareket / esneme',description:'Yalnız sen açarsan kısa bir hareket daveti',icon:'footprints'}};
    var h='<section class="sey-reminder-care" aria-labelledby="sey-reminder-care-title"><div class="sey-reminder-section-head"><div><span class="sey-reminder-eyebrow">GÜNLÜK BAKIM BÜTÇESİ</span><h3 id="sey-reminder-care-title">Native’de en fazla iki bakım alanı</h3></div><span class="sey-reminder-care-count">'+selected.length+'/2</span></div><p class="sey-reminder-profile-note">Seçilmeyen alanlar yalnız uygulama içinde kalır. Aynı bakım kaydı ayrı kartlarda çoğaltılmaz; sağlık dili öneri düzeyindedir, tıbbi gereklilik iddiası taşımaz.</p><div class="sey-reminder-care-list" role="group" aria-label="Native bakım alanları">';
    REMINDER_CARE_KEYS.forEach(function(key){
      var meta=labels[key], isSelected=selected.indexOf(key)>=0, locked=!isSelected&&selected.length>=2;
      h+='<button type="button" class="sey-reminder-care-choice'+(isSelected?' is-selected':'')+(locked?' is-locked':'')+'" onclick="App.toggleReminderCareNative(\''+key+'\')" aria-pressed="'+isSelected+'" aria-label="'+esc(meta.label)+' native seçimini '+(isSelected?'kaldır':'aç')+'"><span class="sey-reminder-care-choice-icon" aria-hidden="true">'+icon(meta.icon,16)+'</span><span class="sey-reminder-care-choice-copy"><strong>'+esc(meta.label)+'</strong><small>'+esc(meta.description)+'</small></span><span class="sey-reminder-care-choice-state">'+(isSelected?'Native':'Uygulama içi')+'</span></button>';
    });
    h+='</div><div class="sey-reminder-care-optin"><div><strong>Hareket davetini ayrıca aç</strong><small>Kısa yürüyüş veya esneme için opt-in; kayıt girilmezse bunu tamamlanması gereken bir veri saymayız.</small></div><button type="button" class="sey-reminder-care-toggle'+(movement?' is-on':'')+'" onclick="App.setReminderCareMovementOptIn('+(movement?'false':'true')+')" aria-pressed="'+movement+'">'+(movement?'Açık':'Kapalı')+'</button></div></section>';
    return h;
  }
  function reminderMedicationKindLabel(kind){ return kind==='supplement'?'Takviye':'İlaç'; }
  function reminderMedicationDraftState(){
    var d=ui.reminderMedicationDraft&&typeof ui.reminderMedicationDraft==='object'?ui.reminderMedicationDraft:{};
    return {kind:d.kind==='supplement'?'supplement':'medication',name:reminderMedicationText(d.name,REMINDER_MEDICATION_NAME_MAX),privateLabel:reminderMedicationText(d.privateLabel,REMINDER_MEDICATION_LABEL_MAX),time:validReminderTime(d.time)?d.time:'',note:reminderMedicationText(d.note,REMINDER_MEDICATION_NOTE_MAX)};
  }
  function reminderMedicationSectionHTML(root){
    var list=root&&Array.isArray(root.medications)?root.medications:[], draft=reminderMedicationDraftState(), editingId=String(ui.reminderMedicationEditingId||''), editing=editingId!=='', h='<section class="sey-reminder-medications" data-reminder-medication-surface="local-only" aria-labelledby="sey-reminder-medication-title">';
    h+='<div class="sey-reminder-section-head"><div><span class="sey-reminder-eyebrow">YALNIZCA SENİN KURDUĞUN SAAT</span><h3 id="sey-reminder-medication-title">İlaç / takviye saati</h3></div><span class="sey-reminder-count">'+list.length+'</span></div>';
    h+='<p class="sey-reminder-medication-safety" role="note" data-reminder-medication-safety="true">'+esc(REMINDER_MEDICATION_SAFETY_COPY)+'</p>';
    if(ui.reminderMedicationError) h+='<p role="alert" style="margin:0;padding:9px 10px;border-left:3px solid var(--drop);border-radius:4px 10px 10px 4px;background:color-mix(in srgb,var(--drop) 8%,var(--card));color:var(--text);font-size:var(--f-caption2);line-height:1.4;">'+esc(ui.reminderMedicationError)+'</p>';
    h+='<div class="sey-reminder-medication-form" data-reminder-medication-form="true"><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;min-width:0;">';
    h+='<label style="display:flex;flex-direction:column;gap:4px;min-width:0;color:var(--muted);font-size:var(--f-caption2);font-weight:850;">Tür<select id="sey-reminder-medication-kind" aria-label="Hatırlatma türü" maxlength="12" onchange="App.setReminderMedicationDraftField(\'kind\',this.value)" style="width:100%;min-height:44px;padding:8px 9px;border:1px solid var(--field-bd);border-radius:10px;background:var(--field);color:var(--text);font:inherit;font-size:var(--f-caption1);"><option value="medication"'+(draft.kind==='medication'?' selected':'')+'>İlaç</option><option value="supplement"'+(draft.kind==='supplement'?' selected':'')+'>Takviye</option></select></label>';
    h+='<label style="display:flex;flex-direction:column;gap:4px;min-width:0;color:var(--muted);font-size:var(--f-caption2);font-weight:850;">Saat<input id="sey-reminder-medication-time" type="time" maxlength="5" value="'+esc(draft.time)+'" onchange="App.setReminderMedicationDraftField(\'time\',this.value)" oninput="App.setReminderMedicationDraftField(\'time\',this.value)" aria-label="İlaç veya takviye hatırlatma saati" style="width:100%;min-height:44px;padding:8px 9px;border:1px solid var(--field-bd);border-radius:10px;background:var(--field);color:var(--text);font:inherit;font-size:var(--f-caption1);"></label></div>';
    h+='<label style="display:flex;flex-direction:column;gap:4px;color:var(--muted);font-size:var(--f-caption2);font-weight:850;">Ad<input id="sey-reminder-medication-name" aria-label="İlaç veya takviye adı" type="text" maxlength="'+REMINDER_MEDICATION_NAME_MAX+'" value="'+esc(draft.name)+'" oninput="App.setReminderMedicationDraftField(\'name\',this.value)" placeholder="Kendi adın" autocomplete="off" style="width:100%;min-height:44px;padding:9px 10px;border:1px solid var(--field-bd);background:var(--field);border-radius:10px;color:var(--text);font:inherit;font-size:var(--f-caption1);"></label>';
    h+='<label style="display:flex;flex-direction:column;gap:4px;color:var(--muted);font-size:var(--f-caption2);font-weight:850;">Özel etiket <span style="font-weight:600;color:var(--faint);">yalnız uygulamada</span><input id="sey-reminder-medication-label" aria-label="İlaç veya takviye özel etiketi" type="text" maxlength="'+REMINDER_MEDICATION_LABEL_MAX+'" value="'+esc(draft.privateLabel)+'" oninput="App.setReminderMedicationDraftField(\'privateLabel\',this.value)" placeholder="Özel bir etiket" autocomplete="off" style="width:100%;min-height:44px;padding:9px 10px;border:1px solid var(--field-bd);background:var(--field);border-radius:10px;color:var(--text);font:inherit;font-size:var(--f-caption1);"></label>';
    h+='<label style="display:flex;flex-direction:column;gap:4px;color:var(--muted);font-size:var(--f-caption2);font-weight:850;">Not <span style="font-weight:600;color:var(--faint);">'+REMINDER_MEDICATION_NOTE_MAX+' karaktere kadar · yerel</span><textarea id="sey-reminder-medication-note" aria-label="İlaç veya takviye yerel notu" maxlength="'+REMINDER_MEDICATION_NOTE_MAX+'" oninput="App.setReminderMedicationDraftField(\'note\',this.value)" placeholder="İstersen kendin için kısa bir not">'+esc(draft.note)+'</textarea></label>';
    h+='<div style="display:flex;gap:7px;flex-wrap:wrap;"><button type="button" class="sey-reminder-primary" onclick="App.saveReminderMedicationDraft()">'+(editing?'Düzenlemeyi kaydet':'Saati ekle')+'</button>'+(editing?'<button type="button" class="sey-reminder-secondary" onclick="App.cancelReminderMedicationEdit()">Vazgeç</button>':'')+'</div>';
    h+='<p class="sey-reminder-medication-native-note" role="note">Native yüzey için varsayılan metin geneldir; ad, etiket, not ve doz bildirim gövdesine yazılmaz.</p></div>';
    if(list.length){
      h+='<div class="sey-reminder-medication-list" role="list" aria-label="Yerel ilaç ve takviye saatleri">';
      list.forEach(function(schedule){
        var title=schedule.privateLabel||schedule.name, kind=reminderMedicationKindLabel(schedule.kind);
        h+='<article class="sey-reminder-medication-item" data-reminder-medication-id="'+esc(schedule.id)+'" role="listitem"><div style="min-width:0;flex:1;"><strong>'+esc(title)+'</strong><small>'+esc(kind+' · '+schedule.name+' · her gün '+schedule.time)+'</small>'+(schedule.note?'<p>'+esc(schedule.note)+'</p>':'')+'</div><div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;"><button type="button" class="sey-reminder-secondary" onclick="App.editReminderMedication(\''+esc(schedule.id)+'\')">Düzenle</button><button type="button" class="sey-reminder-secondary" onclick="App.muteReminderMedicationToday(\''+esc(schedule.id)+'\')">Bugün sustur</button><button data-fx="destructive" type="button" class="sey-reminder-secondary is-disabled" onclick="App.deleteReminderMedication(\''+esc(schedule.id)+'\')">Sil</button></div></article>';
      });
      h+='</div>';
    } else {
      h+='<div class="sey-reminder-empty" data-reminder-medication-empty="true"><span aria-hidden="true">'+icon('pill',22)+'</span><strong>'+esc(reminderCopy('inApp.empty.medicationTitle','Henüz kişisel sağlık saati yok.'))+'</strong><p>'+esc(reminderCopy('inApp.empty.medicationBody','Bir saat kurarsan yalnız o saati hatırlatırız; doz veya tedavi kararı üretmeyiz.'))+'</p></div>';
    }
    h+='<button data-fx="destructive" type="button" class="sey-reminder-medication-clear" onclick="App.clearReminderMedicationLocal()"'+(list.length?'':' disabled')+'>'+esc(reminderCopy('inApp.empty.medicationClear','Yerel ilaç / takviye kayıtlarını temizle'))+'</button></section>';
    return h;
  }
  var REMINDER_INBOX_HIDDEN_STATUSES={opened:true,snoozed:true,dismissed:true};
  var REMINDER_INBOX_REASON_LABELS={
    'quiet-hours':'Sessiz saatlere göre daha sakin tutuldu',
    'daily-budget':'Bugünün kapasitesi dolu; burada daha az gösteriliyor',
    'category-cooldown':'Aynı alandan kısa süre önce bir durak gösterildi',
    'permission-denied':'Native izin kapalı; uygulama içi kart korunuyor',
    'not-visible':'Uygulama görünür olduğunda yeniden bakılacak',
    'today-muted':'Bugün için sessize alındı',
    'stale-data':'Güvenilir veri bekleniyor; kart sakin tutuldu',
    'already-completed':'Bugün için tamamlandı',
    'catchup-grouped':'Geçmiş duraklar tek bir genel özette tutuldu',
    'catchup-expired':'Geçmiş duraklar yeniden kuyruğa alınmadı',
    'capacity':'Bugünün modu daha az durak gösteriyor',
    'disabled':'Bu durak kapalı',
    'invalid':'Durak ayrıntısı hazır değil',
    'unknown':'Bugün için daha sakin tutuldu'
  };
  function reminderInboxReasonLabel(reason){
    var key=reminderDeliveryReason(reason);
    return REMINDER_INBOX_REASON_LABELS[key]||REMINDER_INBOX_REASON_LABELS.unknown;
  }
  function reminderInboxActionArg(value){ return esc(encodeURIComponent(String(value==null?'':value))); }
  function reminderInboxContext(input){
    var x=input&&typeof input==='object'?input:{}, supplied=x.context&&typeof x.context==='object'?x.context:{}, nowIso=String(x.nowIso||supplied.nowIso||'');
    if(!nowIso) nowIso=reminderDeliveryNow();
    var context=reminderLifecycleDefaultContext({timezone:x.timezone||supplied.timezone,context:Object.assign({},supplied,{nowIso:nowIso})},nowIso);
    return {nowIso:nowIso,context:context,localDate:String(x.localDate||context.localDate||''),root:reminderCurrentRoot()};
  }
  function reminderInboxDefinitionMap(input){
    var map={}, defs=Array.isArray(input&&input.definitions)?input.definitions:reminderDefinitions();
    defs.forEach(function(def){ if(def&&def.id) map[String(def.id)]=def; });
    return map;
  }
  function reminderPrayerPrivateCopy(candidate,definition){
    var def=definition&&typeof definition==='object'?definition:{};
    if(String(def.id||'')!==REMINDER_PRAYER_ID&&String(def.deepLink||'')!=='faith') return null;
    return {title:String(def.privateTitle||'Küçük bir durak yaklaşırken'),detail:String(def.privateBody||'İstersen Şeyma’da sakin bir an açabilirsin.'),deepLink:'faith'};
  }
  function reminderInboxBuildItems(input){
    var x=input&&typeof input==='object'?input:{}, parts=reminderInboxContext(x), supplied=Object.prototype.hasOwnProperty.call(x,'occurrences')||Object.prototype.hasOwnProperty.call(x,'candidates')||Object.prototype.hasOwnProperty.call(x,'occurrence'), source;
    if(supplied){ source=Array.isArray(x.occurrences)?x.occurrences:Array.isArray(x.candidates)?x.candidates:(x.occurrence&&typeof x.occurrence==='object'?[x.occurrence]:[]); }
    else source=reminderLifecycleBuildCandidates({definitions:x.definitions,catchUp:false,prayerData:x.prayerData,prayerKey:x.prayerKey},parts.context,parts.root).concat(reminderActionDueCandidates(parts.nowIso,parts.context,parts.root));
    if(supplied) source=reminderDailyFlowCoalesceCandidates(source,parts.context);
    var defs=reminderInboxDefinitionMap(x), rawLog=Object.prototype.hasOwnProperty.call(x,'deliveryLog')?x.deliveryLog:reminderDeliveryLoad(parts.nowIso,false), log=reminderDeliveryNormalize(rawLog,parts.nowIso), seen={}, items=[];
    source.forEach(function(candidate,index){
      if(!candidate||typeof candidate!=='object'||Array.isArray(candidate)) return;
      var occurrence=candidate.occurrence&&typeof candidate.occurrence==='object'?candidate.occurrence:candidate;
      // Historical occurrences belong to the REM-11 generic catch-up summary;
      // they must not become individual in-app or native replay cards here.
      if(occurrence.past===true||occurrence.historical===true||candidate.historical===true) return;
      if(occurrence.localDate&&parts.localDate&&String(occurrence.localDate)!==parts.localDate) return;
      if(occurrence.due===false||candidate.due===false) return;
      var reminderId=String(candidate.reminderId||occurrence.reminderId||occurrence.definitionId||'');
      var definition=candidate.definition&&typeof candidate.definition==='object'?candidate.definition:(occurrence.definition&&typeof occurrence.definition==='object'?occurrence.definition:(defs[reminderId]||null));
      if(!reminderId&&definition&&definition.id) reminderId=String(definition.id);
      var preference=candidate.preference&&typeof candidate.preference==='object'?candidate.preference:{};
      var policy=candidate.policy&&typeof candidate.policy==='object'?candidate.policy:null;
      if(!policy&&definition&&(candidate.preference||Object.prototype.hasOwnProperty.call(candidate,'enabled'))){
        policy=reminderPolicyEvaluate({definition:definition,preference:preference,context:parts.context});
      }
      if(!policy) policy={allowed:true,inAppAllowed:true,suppressed:false,channel:'in_app',reason:'in-app'};
      var occurrenceId=String(candidate.occurrenceId||occurrence.occurrenceId||occurrence.id||reminderId||('inbox-'+index));
      if(!occurrenceId||seen[occurrenceId]) return;
      seen[occurrenceId]=true;
      var delivery=reminderDeliveryFind(log,occurrenceId), status=String(candidate.status||occurrence.status||(delivery&&delivery.status)||'pending'), suppressed=candidate.suppressed===true||occurrence.suppressed===true||candidate.completed===true||occurrence.completed===true||status==='suppressed'||policy.suppressed===true||policy.inAppAllowed===false;
      if(REMINDER_INBOX_HIDDEN_STATUSES[status]&&!suppressed) return;
      var category=String(candidate.category||occurrence.category||(definition&&definition.category)||'system'), meta=reminderCategoryMeta(category), priority=reminderPolicyPriority(candidate.priority||occurrence.priority||(definition&&definition.priority)||'P3'), precedence=reminderCatchupPrecedence(Object.assign({},candidate,{priority:priority}),definition,Object.assign({},occurrence,{priority:priority}));
      var catalogSnoozeOptions=definition&&Array.isArray(definition.snoozeOptions)?definition.snoozeOptions:[];
      var snoozeOptions=(Array.isArray(candidate.snoozeOptions)?candidate.snoozeOptions:catalogSnoozeOptions).filter(function(option){ return reminderEnumHas(REMINDER_SNOOZE_OPTIONS,String(option)); });
      var prayerCopy=reminderPrayerPrivateCopy(candidate,definition), therapyCopy=reminderTherapyPrivateCopy({candidate:candidate,occurrence:occurrence},definition), medicationCopy=reminderMedicationPrivateCopy({candidate:candidate,occurrence:occurrence,medicationScheduleId:candidate.medicationScheduleId||occurrence.medicationScheduleId},definition), safeCopy=therapyCopy||prayerCopy||medicationCopy, title=safeCopy?safeCopy.title:String(candidate.privateTitle||candidate.title||(definition&&definition.privateTitle)||'Sakin bir durak hazır'), detail=safeCopy?safeCopy.detail:String(candidate.detail||candidate.privateBody||candidate.body||(definition&&definition.privateBody)||'İstersen Şeyma’da küçük bir alan açabilirsin.'), deepLink=safeCopy?safeCopy.deepLink:String(candidate.deepLink||(definition&&definition.deepLink)||''), therapyToolId=therapyCopy?reminderTherapyToolId(occurrence):'';
      // Inbox is an in-app surface; preserve the catalog's existing detail copy.
      // Native/private delivery uses reminderTherapyPrivateCopy separately.
      safeCopy=prayerCopy||medicationCopy;
      if(!safeCopy){
        title=String(candidate.privateTitle||candidate.title||(definition&&definition.privateTitle)||'Sakin bir durak hazır');
        detail=String(candidate.detail||candidate.privateBody||candidate.body||(definition&&definition.privateBody)||'İstersen Şeyma’da küçük bir alan açabilirsin.');
        deepLink=String(candidate.deepLink||(definition&&definition.deepLink)||'');
      }
      var flowId=String(candidate.flowId||occurrence.flowId||''), flowLabel=String(candidate.flowLabel||occurrence.flowLabel||''), flowGroup=occurrence.flowGroup||candidate.flowGroup||null;
      items.push({occurrenceId:occurrenceId,reminderId:reminderId,category:category,categoryLabel:String(meta.label||category||'Hatırlatma'),categoryIcon:String(meta.icon||'bell-ring'),priority:priority,precedenceRank:precedence.rank,scheduledAt:String(occurrence.scheduledAt||occurrence.scheduledAtIso||occurrence.localTime||''),title:title,detail:detail,deepLink:deepLink,therapyToolId:therapyToolId,snoozeOptions:snoozeOptions,flowId:flowId,flowLabel:flowLabel,nowNotAction:String(candidate.nowNotAction||occurrence.nowNotAction||'todayOff'),flowGroup:flowGroup,eveningGroup:flowGroup||reminderEveningSafeGroup(occurrence.eveningGroup||candidate.eveningGroup),suppressed:suppressed,reason:reminderInboxReasonLabel(candidate.reason||occurrence.reason||policy.reason||(delivery&&delivery.reason)),status:status});
    });
    items.sort(function(a,b){ return (a.suppressed?1:0)-(b.suppressed?1:0)||a.precedenceRank-b.precedenceRank||a.scheduledAt.localeCompare(b.scheduledAt)||a.occurrenceId.localeCompare(b.occurrenceId); });
    return {items:items,active:items.filter(function(item){ return !item.suppressed; }),suppressed:items.filter(function(item){ return item.suppressed; }),muted:typeof x.todayMuted==='boolean'?x.todayMuted:!!ui.reminderInboxTodayMuted,nowIso:parts.nowIso,timezone:parts.context.timezone,localDate:parts.localDate};
  }
  var REMINDER_ACTION_SCHEMA_VERSION=1;
  var REMINDER_ACTION_KEY='seyma-reminder-actions-v1';
  var REMINDER_ACTION_MAX_AGE_MS=REMINDER_RETENTION_POLICY.notificationHistory.maxAgeDays*24*60*60*1000;
  var REMINDER_ACTION_MAX_ENTRIES=REMINDER_RETENTION_POLICY.notificationHistory.maxEntries;
  var REMINDER_ACTIONS={snooze:true,todayOff:true,disable:true,enable:true,open:true};
  var REMINDER_ACTION_STATUSES={scheduled:true,suppressed:true,disabled:true,enabled:true,completed:true,reverted:true};
  var REMINDER_ACTION_OPTION_LABELS={'10m':reminderCopy('inApp.snooze.10m','10 dakika'),'30m':reminderCopy('inApp.snooze.30m','30 dakika'),'1h':reminderCopy('inApp.snooze.1h','1 saat'),thisEvening:reminderCopy('inApp.snooze.thisEvening','Bu akşam'),tomorrow:reminderCopy('inApp.snooze.tomorrow','Yarın'),todayOff:reminderCopy('inApp.snooze.todayOff','Bugün bir daha gösterme')};
  var REMINDER_DEEP_LINK_TARGETS={
    faith:{targetId:'faith',kind:'overlay',handler:'openFaithCorner',requiredState:'prayer-data',backPath:'bugun'},
    zikr:{targetId:'zikr',kind:'overlay',handler:'openZikr',requiredState:'zikr-session',backPath:'bugun'},
    room:{targetId:'room',kind:'overlay',handler:'openRoom',requiredState:'therapy-tool',backPath:'bugun'},
    saygi:{targetId:'saygi',kind:'tab',handler:'go',requiredState:'saygi-content',backPath:'bugun'},
    reading:{targetId:'reading',kind:'overlay',handler:'openReading',requiredState:'reading-library',backPath:'bugun'},
    gunluk:{targetId:'gunluk',kind:'overlay',handler:'openJournalModal',requiredState:'none',backPath:'bugun'},
    health:{targetId:'saglik',kind:'tab',handler:'go',requiredState:'care-config',backPath:'bugun'},
    settings:{targetId:'ayarlar',kind:'tab',handler:'go',requiredState:'none',backPath:'bugun'}
  };
  var REMINDER_SURFACE_STATES={ready:1,degraded:1,unavailable:1};
  function reminderSurfaceRoot(){ try{ return (data&&data.reminders&&typeof data.reminders==='object')?data.reminders:{}; }catch(e){ return {}; } }
  function reminderSurfaceState(requiredState){
    var d=null; try{ d=data; }catch(e){ d=null; }
    if(!d||requiredState==='none') return {state:'ready',reason:null};
    if(requiredState==='prayer-data'){
      // Kanonik cozumleme reminderEngineSource ile AYNI sirayi izler: prayerData
      // asil alandir, `prayer` geriye donuk esdegeridir.
      var src=(d.prayerData&&typeof d.prayerData==='object')?d.prayerData:((d.prayer&&typeof d.prayer==='object')?d.prayer:null);
      if(!src||!(src.times||src.prayerTimes)) return {state:'degraded',reason:'prayer-data-unavailable'};
      // Sozlesme: reminderSystemPrayerStatus girdiyi `prayerData` alanindan okur.
      var st=reminderSystemPrayerStatus({prayerData:src,nowIso:new Date().toISOString()});
      if(st&&st.state==='stale') return {state:'degraded',reason:'prayer-data-stale'};
      if(st&&st.state==='unavailable') return {state:'degraded',reason:'prayer-data-unavailable'};
      return {state:'ready',reason:null};
    }
    if(requiredState==='zikr-session'){
      var z=(d.zikr&&typeof d.zikr==='object')?d.zikr:null, sess=z&&z.session&&typeof z.session==='object'?z.session:null;
      if(sess&&(sess.paused===true||sess.status==='paused')) return {state:'degraded',reason:'zikr-session-paused'};
      return {state:'ready',reason:null};
    }
    if(requiredState==='therapy-tool'){
      var root=reminderSurfaceRoot(), pref=root.preferences?root.preferences[REMINDER_THERAPY_ID]:null;
      if(!reminderTherapyPreferenceSelected(pref)) return {state:'degraded',reason:'therapy-tool-unselected'};
      return {state:'ready',reason:null};
    }
    if(requiredState==='saygi-content'){
      if(!saygiPeople().length) return {state:'degraded',reason:'saygi-content-unavailable'};
      return {state:'ready',reason:null};
    }
    if(requiredState==='reading-library'){
      var books=(d.library&&Array.isArray(d.library.books))?d.library.books:[];
      if(!books.length) return {state:'degraded',reason:'reading-library-empty'};
      return {state:'ready',reason:null};
    }
    if(requiredState==='care-config'){
      var meds=reminderSurfaceRoot().medications;
      if(!Array.isArray(meds)||!meds.length) return {state:'degraded',reason:'care-unconfigured'};
      return {state:'ready',reason:null};
    }
    return {state:'ready',reason:null};
  }
  function reminderSurfaceTable(){
    var C=(typeof window!=='undefined'&&window.ReminderCatalogV1)||null;
    var defs=(C&&typeof C.list==='function')?C.list():[];
    return defs.map(function(def){
      var link=String(def&&def.deepLink||''), t=REMINDER_DEEP_LINK_TARGETS[link]||null;
      var st=t?reminderSurfaceState(t.requiredState):{state:'unavailable',reason:'unavailable-target'};
      return {
        reminderId:String(def&&def.id||''), deepLink:link,
        targetId:t?t.targetId:'', kind:t?t.kind:'unavailable', handler:t?t.handler:'',
        handlerBound:!!(t&&typeof App[t.handler]==='function'),
        requiredState:t?t.requiredState:'', backPath:t?t.backPath:'',
        surfaceState:st.state, unavailableReason:st.reason
      };
    });
  }
  function reminderActionSafeToken(value,max){
    var token=String(value==null?'':value);
    if(!token||token.length>(max||240)||!/^[A-Za-z0-9._:%|+\-]+$/.test(token)) return '';
    return token;
  }
  function reminderActionOption(value){
    var option=String(value||'');
    return reminderEnumHas(REMINDER_SNOOZE_OPTIONS,option)?option:'';
  }
  function reminderActionOptionLabel(value){ return REMINDER_ACTION_OPTION_LABELS[reminderActionOption(value)]||''; }
  function reminderActionNormalizeEntry(raw,nowIso){
    var x=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:null;
    if(!x||!REMINDER_ACTIONS[String(x.action||'')]) return null;
    var action=String(x.action), actionId=reminderActionSafeToken(x.actionId,240), recordedAt=reminderDeliveryIso(x.recordedAt||x.at||x.timestamp)||nowIso;
    if(!actionId||!recordedAt) return null;
    var status=String(x.status||'completed');
    var out={actionId:actionId,action:action,recordedAt:recordedAt,status:REMINDER_ACTION_STATUSES[status]?status:'completed'};
    var occurrenceId=reminderActionSafeToken(x.occurrenceId,240), reminderId=reminderActionSafeToken(x.reminderId,240), parentOccurrenceId=reminderActionSafeToken(x.parentOccurrenceId,240), option=reminderActionOption(x.option);
    if(occurrenceId) out.occurrenceId=occurrenceId;
    if(reminderId) out.reminderId=reminderId;
    if(parentOccurrenceId) out.parentOccurrenceId=parentOccurrenceId;
    if(option) out.option=option;
    if(typeof x.scheduledAt==='string'&&Number.isFinite(Date.parse(x.scheduledAt))) out.scheduledAt=new Date(x.scheduledAt).toISOString();
    if(typeof x.timezone==='string'&&x.timezone.length<=80&&reminderEngineTimezoneValid(x.timezone)) out.timezone=x.timezone;
    if(typeof x.reason==='string'&&REMINDER_DELIVERY_REASONS[reminderDeliveryReason(x.reason)]) out.reason=reminderDeliveryReason(x.reason);
    return out;
  }
  function reminderActionNormalize(raw,now){
    var nowIso=reminderDeliveryNow(now), source=raw&&typeof raw==='object'&&Array.isArray(raw.entries)?raw.entries:(Array.isArray(raw)?raw:[]), byId={};
    source.forEach(function(item){ var entry=reminderActionNormalizeEntry(item,nowIso); if(entry) byId[entry.actionId]=entry; });
    var cutoff=Date.parse(nowIso)-REMINDER_ACTION_MAX_AGE_MS;
    var entries=Object.keys(byId).map(function(id){ return byId[id]; }).filter(function(entry){ return Date.parse(entry.recordedAt)>=cutoff; });
    entries.sort(function(a,b){ return Date.parse(a.recordedAt)-Date.parse(b.recordedAt)||a.actionId.localeCompare(b.actionId); });
    if(entries.length>REMINDER_ACTION_MAX_ENTRIES) entries=entries.slice(-REMINDER_ACTION_MAX_ENTRIES);
    return {schemaVersion:REMINDER_ACTION_SCHEMA_VERSION,entries:entries};
  }
  function reminderActionLoad(now,persist){
    var raw=reminderActionStorageRead(), parsed=null;
    if(raw){ try{ parsed=JSON.parse(raw); }catch(e){ parsed=null; } }
    var state=reminderActionNormalize(parsed,now);
    if(persist!==false&&raw!==JSON.stringify(state)) reminderActionStorageWrite(state);
    return state;
  }
  function reminderRetentionSummary(input){
    var x=input&&typeof input==='object'?input:{}, nowIso=reminderDeliveryNow(x.nowIso||x.now), root=x.root&&typeof x.root==='object'?x.root:reminderCurrentRoot(), preferences=root&&root.preferences&&typeof root.preferences==='object'&&!Array.isArray(root.preferences)?root.preferences:{}, defs=Array.isArray(x.definitions)?x.definitions:reminderDefinitions(), delivery=reminderDeliveryNormalize(Object.prototype.hasOwnProperty.call(x,'deliveryLog')?x.deliveryLog:null,nowIso), actions=reminderActionNormalize(Object.prototype.hasOwnProperty.call(x,'actionLog')?x.actionLog:null,nowIso), digest=reminderDigestBuild({data:x.data&&typeof x.data==='object'?x.data:data,nowIso:nowIso,timezone:x.timezone});
    if(!Object.prototype.hasOwnProperty.call(x,'deliveryLog')) delivery=reminderDeliveryLoad(nowIso,false);
    if(!Object.prototype.hasOwnProperty.call(x,'actionLog')) actions=reminderActionLoad(nowIso,false);
    var enabled=0, disabled=0, channels={in_app:0,native:0}, statuses={}, actionTypes={};
    Object.keys(preferences).forEach(function(id){ var pref=preferences[id]&&typeof preferences[id]==='object'?preferences[id]:{}; if(pref.enabled===false) disabled++; else enabled++; var channel=REMINDER_CHANNELS[pref.channel]?pref.channel:'in_app'; channels[channel]++; });
    (delivery.entries||[]).forEach(function(entry){ var status=String(entry&&entry.status||'unknown'); statuses[status]=(statuses[status]||0)+1; });
    (actions.entries||[]).forEach(function(entry){ var action=String(entry&&entry.action||'unknown'); actionTypes[action]=(actionTypes[action]||0)+1; });
    return {
      schemaVersion:1,
      kind:'reminder-summary',
      exportedAt:nowIso,
      localOnly:true,
      retention:reminderRetentionPolicySnapshot(),
      preferences:{profile:normalizeReminderProfile(root&&root.profile),configuredCount:Object.keys(preferences).length,enabledCount:enabled,disabledCount:disabled,channelCounts:channels,catalogCount:defs.length},
      deliveryJournal:{entryCount:(delivery.entries||[]).length,statusCounts:statuses,clearGeneration:Number(delivery.generation)||0,clearBoundaryAt:delivery.clearBoundaryAt||''},
      notificationHistory:{entryCount:(actions.entries||[]).length,actionCounts:actionTypes},
      digest:{state:String(digest.state||'empty'),window:reminderLocalClone(digest.window),hasLocalHistory:digest.hasLocalHistory===true,localOnly:true},
      privacyBoundary:{rawNote:false,therapyBody:false,medicationDose:false,medicationName:false,nativeBody:false,token:false,syncSecret:false,occurrenceSchedule:false,deliveryBody:false}
    };
  }
  function reminderExportSummary(input){
    var x=input&&typeof input==='object'?input:{}, summary=reminderRetentionSummary(x);
    if(x.download!==false){
      try{ if(typeof Blob==='function'&&typeof download==='function'){ download(new Blob([JSON.stringify(summary,null,2)],{type:'application/json'}),'seyma-reminder-ozeti.json'); } }catch(e){}
    }
    return summary;
  }
  function reminderActionDefinition(reminderId){
    var id=String(reminderId||''), catalog=typeof ReminderCatalogV1!=='undefined'?ReminderCatalogV1:null;
    if(catalog&&typeof catalog.get==='function'){
      var catalogDefinition=catalog.get(id); if(catalogDefinition) return catalogDefinition;
    }
    if(id===REMINDER_SPECIAL_DAYS_ID) return reminderSpecialDayDefinition(emptyReminderSpecialDays());
    for(var i=0;i<REMINDER_CARE_DEFINITIONS.length;i++) if(REMINDER_CARE_DEFINITIONS[i].id===id) return REMINDER_CARE_DEFINITIONS[i];
    var medication=reminderMedicationScheduleById(id); if(medication) return reminderMedicationDefinition(medication);
    return null;
  }
  function reminderActionLocalTime(ms,timezone){
    var parts=reminderEngineLocalParts(ms,timezone); return parts?{localDate:parts.localDate,localTime:parts.localTime.slice(0,5)}:null;
  }
  function reminderActionScheduledAt(option,nowIso,timezone,definition){
    var nowMs=Date.parse(nowIso), parts=reminderEngineLocalParts(nowMs,timezone), targetMs=null, targetDate='', targetTime='';
    if(!Number.isFinite(nowMs)||!parts) return null;
    if(option==='10m'||option==='30m'||option==='1h') targetMs=nowMs+({'10m':600000,'30m':1800000,'1h':3600000}[option]);
    else if(option==='thisEvening'){
      targetDate=parts.localDate; targetTime='19:00';
      if(parts.hour>=19) targetDate=reminderEngineAddDays(targetDate,1);
      targetMs=reminderCatchupLocalDateTimeMs(targetDate,targetTime,timezone);
    } else if(option==='tomorrow'){
      targetDate=reminderEngineAddDays(parts.localDate,1); targetTime=definition&&definition.defaultWindow&&validReminderTime(definition.defaultWindow.start)?definition.defaultWindow.start:'09:00';
      targetMs=reminderCatchupLocalDateTimeMs(targetDate,targetTime,timezone);
    }
    if(!Number.isFinite(targetMs)||targetMs<=nowMs) return null;
    var local=reminderActionLocalTime(targetMs,timezone); if(!local) return null;
    return {instantIso:new Date(targetMs).toISOString(),localDate:local.localDate,localTime:local.localTime};
  }
  function reminderSnoozePlan(input){
    var x=input&&typeof input==='object'?input:{}, occurrence=x.occurrence&&typeof x.occurrence==='object'?x.occurrence:x, reminderId=String(x.reminderId||occurrence.reminderId||''), definition=x.definition&&typeof x.definition==='object'?x.definition:reminderActionDefinition(reminderId), option=reminderActionOption(x.option), nowIso=reminderDeliveryNow(x.nowIso||x.now), timezone=String(x.timezone||occurrence.timezone||(definition&&definition.defaultWindow&&definition.defaultWindow.timezone)||REMINDER_ENGINE_DEFAULT_TIMEZONE), parentOccurrenceId=reminderActionSafeToken(x.occurrenceId||occurrence.occurrenceId||occurrence.id,240);
    if(!reminderId||!parentOccurrenceId||!definition||!option||!Array.isArray(definition.snoozeOptions)||definition.snoozeOptions.indexOf(option)<0) return {ok:false,reason:'invalid-option',occurrence:null};
    if(!reminderEngineTimezoneValid(timezone)) return {ok:false,reason:'invalid-timezone',occurrence:null};
    var target=reminderActionScheduledAt(option,nowIso,timezone,definition);
    if(!target) return {ok:false,reason:'invalid-schedule',occurrence:null};
    var actionId='reminder-action-v1:snooze:'+encodeURIComponent(parentOccurrenceId)+':'+option;
    var occurrenceId='reminder-snooze-v1:'+encodeURIComponent(parentOccurrenceId)+'|'+option+'|'+encodeURIComponent(target.instantIso)+'|'+encodeURIComponent(timezone);
    var occurrenceOut={reminderId:reminderId,occurrenceId:occurrenceId,localDate:target.localDate,scheduledAt:target.localTime,scheduledAtIso:target.instantIso,timezone:timezone,priority:reminderPolicyPriority(occurrence.priority||definition.priority||'P3'),definitionVersion:String(occurrence.definitionVersion||definition.definitionVersion||'1'),due:false,past:false,replay:false,nativeReplay:false,sourceRevision:String(occurrence.sourceRevision||definition.definitionVersion||'1')};
    return {ok:true,reason:null,actionId:actionId,option:option,timezone:timezone,scheduledAt:target.instantIso,localDate:target.localDate,occurrence:occurrenceOut};
  }
  function reminderDeepLinkTarget(input){
    var x=typeof input==='string'?{deepLink:input}:input&&typeof input==='object'?input:{}, occurrence=x.occurrence&&typeof x.occurrence==='object'?x.occurrence:{}, reminderId=String(x.reminderId||occurrence.reminderId||''), definition=reminderActionDefinition(reminderId), deepLink=String(x.deepLink||occurrence.deepLink||'');
    if(!definition) return {ok:false,available:false,reason:'unknown-reminder-target',reminderId:reminderId,deepLink:deepLink,targetId:'',kind:'unavailable',handler:''};
    var canonicalDeepLink=String(definition.deepLink||''), target=REMINDER_DEEP_LINK_TARGETS[canonicalDeepLink];
    if(!target) return {ok:false,available:false,reason:'unavailable-target',reminderId:reminderId,deepLink:canonicalDeepLink,targetId:'',kind:'unavailable',handler:''};
    if(deepLink&&deepLink!==canonicalDeepLink) return {ok:false,available:false,reason:'target-mismatch',reminderId:reminderId,deepLink:'',targetId:'',kind:'unavailable',handler:target.handler||''};
    // REM-51 gorev 5 — kayitli handler App'te GERCEKTEN yoksa hedef acilmis gibi
    // davranilmaz. Eskiden ok:true doner, sonra sessizce hicbir sey olmazdi.
    if(!target.handler||typeof App[target.handler]!=='function')
      return {ok:false,available:false,reason:'handler-missing',reminderId:reminderId,deepLink:canonicalDeepLink,targetId:target.targetId,kind:'unavailable',handler:String(target.handler||'')};
    var therapyToolId=reminderTherapyToolId(Object.assign({},occurrence,x));
    // REM-51 gorev 2 — ozellik durumu AYRI alanlarda tasinir; ok'i dusurmez.
    var surface=reminderSurfaceState(target.requiredState);
    return {ok:true,available:true,reason:null,reminderId:reminderId,deepLink:canonicalDeepLink,targetId:target.targetId,kind:target.kind,handler:target.handler||'',requiredState:String(target.requiredState||'none'),backPath:String(target.backPath||''),surfaceState:surface.state,unavailableReason:surface.reason,therapyToolId:reminderId===REMINDER_THERAPY_ID?therapyToolId:'',openDetail:canonicalDeepLink==='saygi'?(x.openDetail!==false&&occurrence.openDetail!==false):false};
  }
  function reminderActionOccurrence(occurrenceId,reminderId,options){
    var x=options&&typeof options==='object'?options:{}, definition=reminderActionDefinition(reminderId), nowIso=reminderDeliveryNow(x.nowIso||x.now), context=reminderLifecycleDefaultContext({timezone:x.timezone,context:{nowIso:nowIso}},nowIso), localDate=String(x.localDate||context.localDate||''), localTime=String(x.localTime||context.localTime||'12:00').slice(0,5);
    return Object.assign({occurrenceId:String(occurrenceId||''),reminderId:String(reminderId||''),localDate:localDate,scheduledAt:localTime,timezone:String(x.timezone||context.timezone||REMINDER_ENGINE_DEFAULT_TIMEZONE),priority:reminderPolicyPriority(definition&&definition.priority||'P3'),definitionVersion:String(definition&&definition.definitionVersion||'1')},x.occurrence&&typeof x.occurrence==='object'?x.occurrence:{});
  }
  function reminderActionFind(actionId,now){
    var state=reminderActionLoad(now,true); return state.entries.filter(function(entry){ return entry.actionId===actionId; })[0]||null;
  }
  function reminderActionDueCandidates(nowIso,context,root){
    var nowMs=Date.parse(nowIso), localDate=String(context&&context.localDate||''), out=[];
    if(!Number.isFinite(nowMs)||!localDate) return out;
    reminderActionLoad(nowIso,true).entries.forEach(function(entry){
      if(entry.action!=='snooze'||!entry.scheduledAt||!Number.isFinite(Date.parse(entry.scheduledAt))||Date.parse(entry.scheduledAt)>nowMs) return;
      var definition=reminderActionDefinition(entry.reminderId), timezone=entry.timezone||String(context.timezone||REMINDER_ENGINE_DEFAULT_TIMEZONE), local=reminderActionLocalTime(Date.parse(entry.scheduledAt),timezone);
      if(!definition||!local||local.localDate!==localDate) return;
      var delivery=reminderDeliveryFind(reminderDeliveryLoad(nowIso,false),entry.occurrenceId);
      if(delivery&&REMINDER_INBOX_HIDDEN_STATUSES[delivery.status]&&!delivery.reason) return;
      var medication=reminderMedicationScheduleById(entry.reminderId,root&&root.medications), pref=root&&root.preferences?root.preferences[entry.reminderId]:null;
      if(!pref&&medication) pref=reminderMedicationPolicyPreference(medication);
      var occurrence={reminderId:entry.reminderId,occurrenceId:entry.occurrenceId,localDate:local.localDate,scheduledAt:local.localTime,timezone:timezone,due:true,past:false,replay:false,nativeReplay:false,priority:definition.priority,definitionVersion:definition.definitionVersion};
      if(medication){ occurrence.medicationScheduleId=medication.id; occurrence.userOwnedSchedule=true; occurrence.explicitlySelected=true; occurrence.deepLink='health'; occurrence.nativeTitle=REMINDER_MEDICATION_NATIVE_TITLE; occurrence.nativeBody=REMINDER_MEDICATION_NATIVE_BODY; }
      if(entry.reminderId===REMINDER_THERAPY_ID){ var therapyToolId=reminderTherapySelectedTool(pref); if(therapyToolId){ occurrence.deepLink='room'; occurrence.therapyToolId=therapyToolId; occurrence.toolId=therapyToolId; occurrence.toolTarget='room:'+therapyToolId; } }
      out.push({reminderId:entry.reminderId,occurrence:occurrence,definition:definition,preference:pref||{enabled:true,channel:'in_app'},enabled:!(pref&&pref.enabled===false)});
    });
    return out;
  }
  function reminderInboxItemHTML(item,index){
    var occurrenceArg=reminderInboxActionArg(item.occurrenceId), reminderArg=reminderInboxActionArg(item.reminderId), therapyToolArg=reminderInboxActionArg(item.therapyToolId||''), options=Array.isArray(item.snoozeOptions)?item.snoozeOptions:[], group=item.eveningGroup||item.flowGroup, groupLabel=item.flowId==='evening'?'Bu akşam · tek davet':item.flowId==='light'?'Hafif gün · tek küçük adım':(item.flowLabel?item.flowLabel+' · ortak durak':'Bugünün ortak durağı'), h='<article class="sey-reminder-inbox-item sey-stagger" style="--i:'+Math.min(index,8)+'" data-reminder-inbox-occurrence="'+esc(item.occurrenceId)+'" data-reminder-inbox-category="'+esc(item.category)+'" data-reminder-inbox-flow="'+esc(item.flowId||'')+'" role="listitem">';
    h+='<div class="sey-reminder-inbox-item-top"><span class="sey-reminder-inbox-icon" aria-hidden="true">'+icon(item.categoryIcon,17)+'</span><div class="sey-reminder-inbox-copy">'+(item.flowLabel?'<span class="sey-reminder-inbox-flow">'+esc(item.flowLabel)+'</span>':'')+'<span class="sey-reminder-inbox-category">'+esc(item.categoryLabel)+'</span><h3>'+esc(item.title)+'</h3><p>'+esc(item.detail)+'</p></div><span class="sey-reminder-inbox-priority">'+esc(item.priority)+'</span></div>';
    if(group){
      h+='<div class="sey-reminder-evening-group" role="group" aria-label="'+esc(groupLabel)+'"><span class="sey-reminder-evening-group-label">'+esc(groupLabel)+'</span><span class="sey-reminder-evening-group-primary">'+esc(reminderCopy('inApp.inbox.groupPrimary','Ana durak'))+': '+esc(group.primary.label)+'</span>';
      if(group.alternatives.length){
        h+='<span class="sey-reminder-evening-group-help">'+esc(reminderCopy('inApp.inbox.groupHelp','Diğer küçük duraklar uygulamanın içinde:'))+'</span><div class="sey-reminder-evening-group-actions">';
        group.alternatives.forEach(function(alternative){ var altOccurrence=reminderInboxActionArg(item.occurrenceId), altReminder=reminderInboxActionArg(alternative.reminderId), altDeepLink=reminderInboxActionArg(alternative.deepLink); h+='<button type="button" onclick="App.reminderInboxEveningTarget(decodeURIComponent(\''+altOccurrence+'\'),decodeURIComponent(\''+altReminder+'\'),decodeURIComponent(\''+altDeepLink+'\'))">'+esc(alternative.label)+'</button>'; });
        h+='</div>';
      }
      h+='</div>';
    }
    h+='<div class="sey-reminder-inbox-item-actions"><button type="button" id="sey-reminder-inbox-primary-'+esc(encodeURIComponent(String(item.occurrenceId)))+'" class="sey-reminder-inbox-primary" onclick="App.reminderInboxPrimary(decodeURIComponent(\''+occurrenceArg+'\'),decodeURIComponent(\''+reminderArg+'\'),decodeURIComponent(\''+therapyToolArg+'\'))">'+esc(reminderCopy('inApp.actions.openReminder','Bu durağı aç'))+'</button><button type="button" class="sey-reminder-inbox-now-not" onclick="App.reminderInboxOverflow(decodeURIComponent(\''+occurrenceArg+'\'),\'nowNot\',decodeURIComponent(\''+reminderArg+'\'))">'+esc(reminderCopy('inApp.actions.nowNot','Şimdi değil'))+'</button><details class="sey-reminder-inbox-overflow"><summary aria-label="'+esc(item.title)+' için diğer seçenekler">'+esc(reminderCopy('inApp.actions.more','Diğer seçenekler'))+'</summary><div class="sey-reminder-inbox-menu">';
    if(options.length){ options.forEach(function(option){ var optionArg=reminderInboxActionArg(option); h+='<button type="button" onclick="App.reminderInboxOverflow(decodeURIComponent(\''+occurrenceArg+'\'),\'snooze\',decodeURIComponent(\''+reminderArg+'\'),decodeURIComponent(\''+optionArg+'\'))">'+esc(reminderCopy('inApp.actions.snooze','Ertele'))+' · '+esc(reminderActionOptionLabel(option))+'</button>'; }); }
    else h+='<button type="button" disabled aria-disabled="true">'+esc(reminderCopy('inApp.actions.snooze','Ertele'))+'</button>';
    h+='<button type="button" onclick="App.reminderInboxOverflow(decodeURIComponent(\''+occurrenceArg+'\'),\'todayOff\',decodeURIComponent(\''+reminderArg+'\'))">'+esc(reminderCopy('inApp.actions.todayOff','Bugün sustur · bugün bir daha gösterme'))+'</button><button type="button" onclick="App.reminderInboxOverflow(decodeURIComponent(\''+occurrenceArg+'\'),\'settings\',decodeURIComponent(\''+reminderArg+'\'))">'+esc(reminderCopy('inApp.actions.details','Ayrıntıları aç'))+'</button><button type="button" class="is-danger" onclick="App.reminderInboxOverflow(decodeURIComponent(\''+occurrenceArg+'\'),\'disable\',decodeURIComponent(\''+reminderArg+'\'))">'+esc(reminderCopy('inApp.actions.disable','Kapat · bu hatırlatmayı kapat'))+'</button></div></details></div>';
    h+='</article>';
    return h;
  }
  function reminderInboxCardHTML(input){
    var view=reminderInboxBuildItems(input), active=view.active, suppressed=view.suppressed, muted=view.muted, state=muted?'muted':active.length?'active':suppressed.length?'suppressed':'empty', remaining=muted?0:active.length, h='<section id="sey-reminder-inbox-card" class="sey-reminder-inbox surface" data-reminder-render-target="reminder-inbox" data-reminder-inbox-state="'+state+'" aria-labelledby="sey-reminder-inbox-title" aria-describedby="sey-reminder-inbox-help">';
    h+='<div class="sey-reminder-inbox-head"><div class="sey-reminder-inbox-mark" aria-hidden="true">'+icon(state==='suppressed'?'moon':state==='empty'?'sparkles':'bell-ring',20)+'</div><div class="sey-reminder-inbox-heading"><span class="sey-reminder-inbox-eyebrow">'+esc(reminderCopy('inApp.inbox.eyebrow','BUGÜNÜN SAKİN DURAKLARI'))+'</span><h2 id="sey-reminder-inbox-title">'+esc(reminderCopy('inApp.inbox.title','Bugün için küçük duraklar'))+'</h2><p id="sey-reminder-inbox-help">'+(state==='active'?(active.length===1?esc(reminderCopy('inApp.inbox.activeOne','İstersen tek bir küçük adımla başlayabilirsin.')):active.length+' öneri aynı sakin yüzeyde gruplanıyor.') :state==='suppressed'?esc(reminderCopy('inApp.inbox.suppressed','Bugün daha sakin tutuldu; kendine yük bindirmeden burada kalabilirsin.')):state==='muted'?esc(reminderCopy('inApp.inbox.muted','Bugün için öneriler sessize alındı; dilediğinde geri getirebilirsin.')):esc(reminderCopy('inApp.inbox.empty','Şu an burada açılacak bir öneri yok; bu da tamam.')))+'</p></div><div id="sey-reminder-inbox-count" class="sey-reminder-inbox-count" aria-label="Kalan öneri sayısı"><strong>'+remaining+'</strong><span>Kalan öneri</span></div></div>';
    h+='<div id="sey-reminder-inbox-live" class="sey-reminder-inbox-summary" role="status" aria-live="polite" aria-atomic="true"><span>'+icon('clock-3',14)+'</span><span>'+ (muted?esc(reminderCopy('inApp.mute.today','Bugün susturuldu')):remaining+' '+esc(reminderCopy('inApp.inbox.remaining','sakin öneri hazır'))) + (suppressed.length&&!muted?' · '+suppressed.length+' '+esc(reminderCopy('inApp.inbox.suppressedCount','daha sakin tutuldu')):'') +'</span></div>';
    if(active.length){
      h+='<div class="sey-reminder-inbox-list'+(active.length>1?' is-grouped':' is-single')+'" role="list" aria-label="Bugünün reminder önerileri">';
      if(active.length>1) h+='<div class="sey-reminder-inbox-group-note"><span>'+icon('layers-2',14)+'</span><span>'+esc(reminderCopy('inApp.inbox.groupNote','Bugün için küçük duraklar'))+' · '+active.length+' öneri</span></div>';
      active.forEach(function(item,index){ h+=reminderInboxItemHTML(item,index); });
      h+='</div>';
    } else if(state==='suppressed') {
      h+='<div class="sey-reminder-inbox-empty is-suppressed" role="status"><span aria-hidden="true">'+icon('pause-circle',21)+'</span><strong>Bugün biraz daha sakin</strong><p>'+esc(suppressed[0].reason)+'</p></div>';
    } else if(state==='muted') {
      h+='<div class="sey-reminder-inbox-empty is-muted" role="status"><span aria-hidden="true">'+icon('bell-off',21)+'</span><strong>'+esc(reminderCopy('inApp.inbox.mutedTitle','Bugün susturuldu'))+'</strong><p>'+esc(reminderCopy('inApp.inbox.mutedBody','Öneriler kaydedilmedi; yalnızca bu uygulama oturumunda sakinleşti.'))+'</p></div>';
    } else {
      h+='<div class="sey-reminder-inbox-empty" role="status"><span aria-hidden="true">'+icon('sparkles',21)+'</span><strong>'+esc(reminderCopy('inApp.inbox.emptyTitle','Şimdilik boş'))+'</strong><p>'+esc(reminderCopy('inApp.inbox.emptyBody','Bugün için uygun bir öneri oluştuğunda burada görünür.'))+'</p></div>';
    }
    h+='<div class="sey-reminder-inbox-footer"><button type="button" class="sey-reminder-inbox-mute'+(muted?' is-muted':'')+'" onclick="App.reminderInboxMuteToday()" aria-pressed="'+muted+'">'+icon(muted?'bell':'bell-off',15)+'<span>'+(muted?esc(reminderCopy('inApp.inbox.restore','Bugün susturuldu · geri getir')):esc(reminderCopy('inApp.inbox.mute','Bugün tümünü sustur')))+'</span></button><button data-fx="open" type="button" id="sey-reminder-inbox-center" class="sey-reminder-inbox-center" onclick="App.openReminderCenter()">'+esc(reminderCopy('inApp.inbox.centerAction','Hatırlatma merkezini aç'))+'</button></div>';
    h+='<p class="sey-reminder-inbox-privacy" role="note">'+esc(reminderCopy('inApp.inbox.privacy','Bu kart yalnız uygulama içinde görünür; native başlık, not veya hassas ayrıntı delivery günlüğüne yazılmaz.'))+'</p></section>';
    return h;
  }
  function reminderPreviewSafeCopy(def){
    var category=reminderCategoryMeta(String(def&&def.category||''));
    return {title:reminderCopy('inApp.preview.syntheticTitle','Şeyma’da küçük bir durak hazır'),detail:category.label+' '+reminderCopy('inApp.preview.syntheticDetail','için yalnızca uygulama içinde gösterilen sentetik test.')};
  }
  function reminderMedicationCurrentList(){
    var root=reminderCurrentRoot(); if(!root) return null;
    if(!Array.isArray(root.medications)) root.medications=[];
    return root.medications;
  }
  function reminderMedicationDraftFromSchedule(schedule){
    var s=normalizeReminderMedication(schedule); return s?{kind:s.kind,name:s.name,privateLabel:s.privateLabel,time:s.time,note:s.note}:null;
  }
  function reminderMedicationHistoryMatches(entry,ids){
    var text=String(entry&&entry.occurrenceId||''); if(!text) return false;
    return ids.some(function(id){ return text.indexOf(String(id))>=0||text.indexOf(encodeURIComponent(String(id)))>=0; });
  }
  function reminderMedicationClearHistory(ids){
    var result={delivery:0,actions:0}; if(!Array.isArray(ids)||!ids.length||typeof reminderDeliveryStorageRead!=='function'||typeof reminderActionStorageRead!=='function') return result;
    try{
      var delivery=reminderDeliveryLoad(new Date().toISOString(),false), kept=delivery.entries.filter(function(entry){ return !reminderMedicationHistoryMatches(entry,ids); });
      result.delivery=delivery.entries.length-kept.length; reminderDeliveryStorageWrite({schemaVersion:REMINDER_DELIVERY_SCHEMA_VERSION,entries:kept});
    }catch(e){}
    try{
      var actions=reminderActionLoad(new Date().toISOString(),false), actionKept=actions.entries.filter(function(entry){ return ids.indexOf(String(entry.reminderId||''))<0&&!reminderMedicationHistoryMatches(entry,ids); });
      result.actions=actions.entries.length-actionKept.length; reminderActionStorageWrite({schemaVersion:REMINDER_ACTION_SCHEMA_VERSION,entries:actionKept});
    }catch(e){}
    return result;
  }
  function reminderConfirmAction(message,options){
    var x=options&&typeof options==='object'?options:{};
    if(x.confirmed===true) return true;
    try{ return typeof confirm==='function'&&confirm(message); }catch(e){ return false; }
  }
  function reminderServiceWorkerClickPayload(input){
    var x=input&&typeof input==='object'&&!Array.isArray(input)?input:null;
    if(!x||x.type!=='reminder') return null;
    var target=reminderDeepLinkTarget(x), occurrenceId=reminderActionSafeToken(x.occurrenceId,240), action=String(x.action||'open');
    if(!target.ok||!occurrenceId||x.targetId!==target.targetId) return null;
    if(x.openDetail!==undefined&&typeof x.openDetail!=='boolean') return null;
    if(x.therapyToolId!==undefined&&String(x.therapyToolId)!==String(target.therapyToolId||'')) return null;
    if(action==='mute') action='todayOff';
    if(action!=='open'&&action!=='snooze'&&action!=='todayOff') return null;
    var option=x.snoozeOption===undefined||x.snoozeOption===''?'':reminderActionOption(x.snoozeOption), timezone=x.timezone===undefined||x.timezone===''?'':String(x.timezone);
    if(x.snoozeOption!==undefined&&x.snoozeOption!==''&&!option) return null;
    if(timezone&&!reminderEngineTimezoneValid(timezone)) return null;
    return {type:'reminder',occurrenceId:occurrenceId,reminderId:target.reminderId,deepLink:target.deepLink,targetId:target.targetId,openDetail:target.openDetail,therapyToolId:target.therapyToolId||'',action:action,snoozeOption:option,timezone:timezone};
  }
  function stepReminder(rec){
    if(ui.stepRemindHidden) return '';
    var hr=new Date().getHours();
    if(hr<19&&hr>4) return '';
    var stepsEmpty=!(rec&&rec.walk&&rec.walk.steps!=null&&rec.walk.steps!=='');
    if(!stepsEmpty) return '';
    return '<div style="display:flex;align-items:center;gap:11px;background:linear-gradient(135deg,rgba(230,193,90,0.14),rgba(155,127,201,0.10));border:1px solid rgba(201,160,60,0.35);border-radius:16px;padding:12px 14px;">'
      +'<span style="flex-shrink:0;display:inline-flex;">'+icon('footprints',20)+'</span>'
      +'<div style="flex:1;min-width:0;"><div style="font-size:var(--f-footnote);font-weight:700;color:var(--text);">Bugünün adımını eklemek ister misin?</div><div style="font-size:var(--f-caption1);color:var(--muted);line-height:1.35;">Telefonundaki adımı yazman ya da Sağlık’tan çekmen yeter — zorunlu değil.</div></div>'
      +'<button onclick="App.go(\'saglik\')" style="flex-shrink:0;border:none;cursor:pointer;background:linear-gradient(135deg,#E6C15A,#C99A3A);color:#1a1404;font-weight:800;font-size:var(--f-footnote);padding:9px 13px;border-radius:12px;">Ekle</button>'
      +'<button onclick="App.hideStepRemind()" aria-label="Kapat" style="flex-shrink:0;border:none;background:none;cursor:pointer;color:var(--faint);display:flex;align-items:center;justify-content:center;">'+icon('x',14)+'</button></div>';
  }
  function reconcileReminderStorageEvent(event){ return SEYMA_APP_SURFACE.reconcileReminderStorageEvent.apply(null,arguments); }
  }
  root["REMINDER_ACTIONS"]=typeof REMINDER_ACTIONS!=='undefined'?REMINDER_ACTIONS:root["REMINDER_ACTIONS"];
  root["REMINDER_ACTION_KEY"]=typeof REMINDER_ACTION_KEY!=='undefined'?REMINDER_ACTION_KEY:root["REMINDER_ACTION_KEY"];
  root["REMINDER_ACTION_MAX_AGE_MS"]=typeof REMINDER_ACTION_MAX_AGE_MS!=='undefined'?REMINDER_ACTION_MAX_AGE_MS:root["REMINDER_ACTION_MAX_AGE_MS"];
  root["REMINDER_ACTION_MAX_ENTRIES"]=typeof REMINDER_ACTION_MAX_ENTRIES!=='undefined'?REMINDER_ACTION_MAX_ENTRIES:root["REMINDER_ACTION_MAX_ENTRIES"];
  root["REMINDER_ACTION_OPTION_LABELS"]=typeof REMINDER_ACTION_OPTION_LABELS!=='undefined'?REMINDER_ACTION_OPTION_LABELS:root["REMINDER_ACTION_OPTION_LABELS"];
  root["REMINDER_ACTION_SCHEMA_VERSION"]=typeof REMINDER_ACTION_SCHEMA_VERSION!=='undefined'?REMINDER_ACTION_SCHEMA_VERSION:root["REMINDER_ACTION_SCHEMA_VERSION"];
  root["REMINDER_ACTION_STATUSES"]=typeof REMINDER_ACTION_STATUSES!=='undefined'?REMINDER_ACTION_STATUSES:root["REMINDER_ACTION_STATUSES"];
  root["REMINDER_CAPACITY_MODES"]=typeof REMINDER_CAPACITY_MODES!=='undefined'?REMINDER_CAPACITY_MODES:root["REMINDER_CAPACITY_MODES"];
  root["REMINDER_CARE_CATEGORY"]=typeof REMINDER_CARE_CATEGORY!=='undefined'?REMINDER_CARE_CATEGORY:root["REMINDER_CARE_CATEGORY"];
  root["REMINDER_CARE_DEFINITIONS"]=typeof REMINDER_CARE_DEFINITIONS!=='undefined'?REMINDER_CARE_DEFINITIONS:root["REMINDER_CARE_DEFINITIONS"];
  root["REMINDER_CARE_KEYS"]=typeof REMINDER_CARE_KEYS!=='undefined'?REMINDER_CARE_KEYS:root["REMINDER_CARE_KEYS"];
  root["REMINDER_CATCHUP_EXPIRED_REASON"]=typeof REMINDER_CATCHUP_EXPIRED_REASON!=='undefined'?REMINDER_CATCHUP_EXPIRED_REASON:root["REMINDER_CATCHUP_EXPIRED_REASON"];
  root["REMINDER_CATCHUP_MAX_AGE_MS"]=typeof REMINDER_CATCHUP_MAX_AGE_MS!=='undefined'?REMINDER_CATCHUP_MAX_AGE_MS:root["REMINDER_CATCHUP_MAX_AGE_MS"];
  root["REMINDER_CATCHUP_REASON"]=typeof REMINDER_CATCHUP_REASON!=='undefined'?REMINDER_CATCHUP_REASON:root["REMINDER_CATCHUP_REASON"];
  root["REMINDER_CATCHUP_SUMMARY_VERSION"]=typeof REMINDER_CATCHUP_SUMMARY_VERSION!=='undefined'?REMINDER_CATCHUP_SUMMARY_VERSION:root["REMINDER_CATCHUP_SUMMARY_VERSION"];
  root["REMINDER_CATEGORY_META"]=typeof REMINDER_CATEGORY_META!=='undefined'?REMINDER_CATEGORY_META:root["REMINDER_CATEGORY_META"];
  root["REMINDER_CATEGORY_ORDER"]=typeof REMINDER_CATEGORY_ORDER!=='undefined'?REMINDER_CATEGORY_ORDER:root["REMINDER_CATEGORY_ORDER"];
  root["REMINDER_CHANNELS"]=typeof REMINDER_CHANNELS!=='undefined'?REMINDER_CHANNELS:root["REMINDER_CHANNELS"];
  root["REMINDER_DAILY_FLOW_CARE_LABELS"]=typeof REMINDER_DAILY_FLOW_CARE_LABELS!=='undefined'?REMINDER_DAILY_FLOW_CARE_LABELS:root["REMINDER_DAILY_FLOW_CARE_LABELS"];
  root["REMINDER_DAILY_FLOW_LABELS"]=typeof REMINDER_DAILY_FLOW_LABELS!=='undefined'?REMINDER_DAILY_FLOW_LABELS:root["REMINDER_DAILY_FLOW_LABELS"];
  root["REMINDER_DAILY_FLOW_VERSION"]=typeof REMINDER_DAILY_FLOW_VERSION!=='undefined'?REMINDER_DAILY_FLOW_VERSION:root["REMINDER_DAILY_FLOW_VERSION"];
  root["REMINDER_DAILY_FLOW_WINDOWS"]=typeof REMINDER_DAILY_FLOW_WINDOWS!=='undefined'?REMINDER_DAILY_FLOW_WINDOWS:root["REMINDER_DAILY_FLOW_WINDOWS"];
  root["REMINDER_DEEP_LINK_TARGETS"]=typeof REMINDER_DEEP_LINK_TARGETS!=='undefined'?REMINDER_DEEP_LINK_TARGETS:root["REMINDER_DEEP_LINK_TARGETS"];
  root["REMINDER_DELIVERY_BLOCKING_STATUSES"]=typeof REMINDER_DELIVERY_BLOCKING_STATUSES!=='undefined'?REMINDER_DELIVERY_BLOCKING_STATUSES:root["REMINDER_DELIVERY_BLOCKING_STATUSES"];
  root["REMINDER_DELIVERY_CHANNELS"]=typeof REMINDER_DELIVERY_CHANNELS!=='undefined'?REMINDER_DELIVERY_CHANNELS:root["REMINDER_DELIVERY_CHANNELS"];
  root["REMINDER_DELIVERY_KEY"]=typeof REMINDER_DELIVERY_KEY!=='undefined'?REMINDER_DELIVERY_KEY:root["REMINDER_DELIVERY_KEY"];
  root["REMINDER_DELIVERY_MAX_AGE_MS"]=typeof REMINDER_DELIVERY_MAX_AGE_MS!=='undefined'?REMINDER_DELIVERY_MAX_AGE_MS:root["REMINDER_DELIVERY_MAX_AGE_MS"];
  root["REMINDER_DELIVERY_MAX_ENTRIES"]=typeof REMINDER_DELIVERY_MAX_ENTRIES!=='undefined'?REMINDER_DELIVERY_MAX_ENTRIES:root["REMINDER_DELIVERY_MAX_ENTRIES"];
  root["REMINDER_DELIVERY_REASONS"]=typeof REMINDER_DELIVERY_REASONS!=='undefined'?REMINDER_DELIVERY_REASONS:root["REMINDER_DELIVERY_REASONS"];
  root["REMINDER_DELIVERY_SCHEMA_VERSION"]=typeof REMINDER_DELIVERY_SCHEMA_VERSION!=='undefined'?REMINDER_DELIVERY_SCHEMA_VERSION:root["REMINDER_DELIVERY_SCHEMA_VERSION"];
  root["REMINDER_DELIVERY_STATUSES"]=typeof REMINDER_DELIVERY_STATUSES!=='undefined'?REMINDER_DELIVERY_STATUSES:root["REMINDER_DELIVERY_STATUSES"];
  root["REMINDER_DELIVERY_STATUS_LIST"]=typeof REMINDER_DELIVERY_STATUS_LIST!=='undefined'?REMINDER_DELIVERY_STATUS_LIST:root["REMINDER_DELIVERY_STATUS_LIST"];
  root["REMINDER_DELIVERY_STATUS_RANK"]=typeof REMINDER_DELIVERY_STATUS_RANK!=='undefined'?REMINDER_DELIVERY_STATUS_RANK:root["REMINDER_DELIVERY_STATUS_RANK"];
  root["REMINDER_DIGEST_DEFAULT_TIMEZONE"]=typeof REMINDER_DIGEST_DEFAULT_TIMEZONE!=='undefined'?REMINDER_DIGEST_DEFAULT_TIMEZONE:root["REMINDER_DIGEST_DEFAULT_TIMEZONE"];
  root["REMINDER_DIGEST_REFLECTIONS"]=typeof REMINDER_DIGEST_REFLECTIONS!=='undefined'?REMINDER_DIGEST_REFLECTIONS:root["REMINDER_DIGEST_REFLECTIONS"];
  root["REMINDER_DIGEST_SCHEMA_VERSION"]=typeof REMINDER_DIGEST_SCHEMA_VERSION!=='undefined'?REMINDER_DIGEST_SCHEMA_VERSION:root["REMINDER_DIGEST_SCHEMA_VERSION"];
  root["REMINDER_DIGEST_WINDOW_DAYS"]=typeof REMINDER_DIGEST_WINDOW_DAYS!=='undefined'?REMINDER_DIGEST_WINDOW_DAYS:root["REMINDER_DIGEST_WINDOW_DAYS"];
  root["REMINDER_ENGINE_DAY_PART_TIMES"]=typeof REMINDER_ENGINE_DAY_PART_TIMES!=='undefined'?REMINDER_ENGINE_DAY_PART_TIMES:root["REMINDER_ENGINE_DAY_PART_TIMES"];
  root["REMINDER_ENGINE_DEFAULT_TIMEZONE"]=typeof REMINDER_ENGINE_DEFAULT_TIMEZONE!=='undefined'?REMINDER_ENGINE_DEFAULT_TIMEZONE:root["REMINDER_ENGINE_DEFAULT_TIMEZONE"];
  root["REMINDER_ENGINE_VERSION"]=typeof REMINDER_ENGINE_VERSION!=='undefined'?REMINDER_ENGINE_VERSION:root["REMINDER_ENGINE_VERSION"];
  root["REMINDER_EVENING_ID"]=typeof REMINDER_EVENING_ID!=='undefined'?REMINDER_EVENING_ID:root["REMINDER_EVENING_ID"];
  root["REMINDER_EVENING_START_MINUTES"]=typeof REMINDER_EVENING_START_MINUTES!=='undefined'?REMINDER_EVENING_START_MINUTES:root["REMINDER_EVENING_START_MINUTES"];
  root["REMINDER_EVENING_SURFACES"]=typeof REMINDER_EVENING_SURFACES!=='undefined'?REMINDER_EVENING_SURFACES:root["REMINDER_EVENING_SURFACES"];
  root["REMINDER_EVENT_ACTIONS"]=typeof REMINDER_EVENT_ACTIONS!=='undefined'?REMINDER_EVENT_ACTIONS:root["REMINDER_EVENT_ACTIONS"];
  root["REMINDER_EVENT_SUMMARY"]=typeof REMINDER_EVENT_SUMMARY!=='undefined'?REMINDER_EVENT_SUMMARY:root["REMINDER_EVENT_SUMMARY"];
  root["REMINDER_INBOX_HIDDEN_STATUSES"]=typeof REMINDER_INBOX_HIDDEN_STATUSES!=='undefined'?REMINDER_INBOX_HIDDEN_STATUSES:root["REMINDER_INBOX_HIDDEN_STATUSES"];
  root["REMINDER_INBOX_REASON_LABELS"]=typeof REMINDER_INBOX_REASON_LABELS!=='undefined'?REMINDER_INBOX_REASON_LABELS:root["REMINDER_INBOX_REASON_LABELS"];
  root["REMINDER_LIFECYCLE_INTERVAL_MS"]=typeof REMINDER_LIFECYCLE_INTERVAL_MS!=='undefined'?REMINDER_LIFECYCLE_INTERVAL_MS:root["REMINDER_LIFECYCLE_INTERVAL_MS"];
  root["REMINDER_LIFECYCLE_VISIBILITY"]=typeof REMINDER_LIFECYCLE_VISIBILITY!=='undefined'?REMINDER_LIFECYCLE_VISIBILITY:root["REMINDER_LIFECYCLE_VISIBILITY"];
  root["REMINDER_MEDICATION_ID_PREFIX"]=typeof REMINDER_MEDICATION_ID_PREFIX!=='undefined'?REMINDER_MEDICATION_ID_PREFIX:root["REMINDER_MEDICATION_ID_PREFIX"];
  root["REMINDER_MEDICATION_LABEL_MAX"]=typeof REMINDER_MEDICATION_LABEL_MAX!=='undefined'?REMINDER_MEDICATION_LABEL_MAX:root["REMINDER_MEDICATION_LABEL_MAX"];
  root["REMINDER_MEDICATION_MAX_SCHEDULES"]=typeof REMINDER_MEDICATION_MAX_SCHEDULES!=='undefined'?REMINDER_MEDICATION_MAX_SCHEDULES:root["REMINDER_MEDICATION_MAX_SCHEDULES"];
  root["REMINDER_MEDICATION_NAME_MAX"]=typeof REMINDER_MEDICATION_NAME_MAX!=='undefined'?REMINDER_MEDICATION_NAME_MAX:root["REMINDER_MEDICATION_NAME_MAX"];
  root["REMINDER_MEDICATION_NATIVE_BODY"]=typeof REMINDER_MEDICATION_NATIVE_BODY!=='undefined'?REMINDER_MEDICATION_NATIVE_BODY:root["REMINDER_MEDICATION_NATIVE_BODY"];
  root["REMINDER_MEDICATION_NATIVE_TITLE"]=typeof REMINDER_MEDICATION_NATIVE_TITLE!=='undefined'?REMINDER_MEDICATION_NATIVE_TITLE:root["REMINDER_MEDICATION_NATIVE_TITLE"];
  root["REMINDER_MEDICATION_NOTE_MAX"]=typeof REMINDER_MEDICATION_NOTE_MAX!=='undefined'?REMINDER_MEDICATION_NOTE_MAX:root["REMINDER_MEDICATION_NOTE_MAX"];
  root["REMINDER_MEDICATION_SAFETY_COPY"]=typeof REMINDER_MEDICATION_SAFETY_COPY!=='undefined'?REMINDER_MEDICATION_SAFETY_COPY:root["REMINDER_MEDICATION_SAFETY_COPY"];
  root["REMINDER_MEDICATION_SCHEMA_VERSION"]=typeof REMINDER_MEDICATION_SCHEMA_VERSION!=='undefined'?REMINDER_MEDICATION_SCHEMA_VERSION:root["REMINDER_MEDICATION_SCHEMA_VERSION"];
  root["REMINDER_NATIVE_ACTIONS"]=typeof REMINDER_NATIVE_ACTIONS!=='undefined'?REMINDER_NATIVE_ACTIONS:root["REMINDER_NATIVE_ACTIONS"];
  root["REMINDER_NATIVE_FOREGROUND_SOURCES"]=typeof REMINDER_NATIVE_FOREGROUND_SOURCES!=='undefined'?REMINDER_NATIVE_FOREGROUND_SOURCES:root["REMINDER_NATIVE_FOREGROUND_SOURCES"];
  root["REMINDER_NATIVE_PREVIEW_TAG"]=typeof REMINDER_NATIVE_PREVIEW_TAG!=='undefined'?REMINDER_NATIVE_PREVIEW_TAG:root["REMINDER_NATIVE_PREVIEW_TAG"];
  root["REMINDER_NATIVE_TAG_PREFIX"]=typeof REMINDER_NATIVE_TAG_PREFIX!=='undefined'?REMINDER_NATIVE_TAG_PREFIX:root["REMINDER_NATIVE_TAG_PREFIX"];
  root["REMINDER_PERMISSION_ALIASES"]=typeof REMINDER_PERMISSION_ALIASES!=='undefined'?REMINDER_PERMISSION_ALIASES:root["REMINDER_PERMISSION_ALIASES"];
  root["REMINDER_PERMISSION_STATES"]=typeof REMINDER_PERMISSION_STATES!=='undefined'?REMINDER_PERMISSION_STATES:root["REMINDER_PERMISSION_STATES"];
  root["REMINDER_PERMISSION_STORAGE_KEY"]=typeof REMINDER_PERMISSION_STORAGE_KEY!=='undefined'?REMINDER_PERMISSION_STORAGE_KEY:root["REMINDER_PERMISSION_STORAGE_KEY"];
  root["REMINDER_PERSONALIZATION_FEEDBACK"]=typeof REMINDER_PERSONALIZATION_FEEDBACK!=='undefined'?REMINDER_PERSONALIZATION_FEEDBACK:root["REMINDER_PERSONALIZATION_FEEDBACK"];
  root["REMINDER_PERSONALIZATION_HISTORY_MODES"]=typeof REMINDER_PERSONALIZATION_HISTORY_MODES!=='undefined'?REMINDER_PERSONALIZATION_HISTORY_MODES:root["REMINDER_PERSONALIZATION_HISTORY_MODES"];
  root["REMINDER_PERSONALIZATION_MAX_APPLIED"]=typeof REMINDER_PERSONALIZATION_MAX_APPLIED!=='undefined'?REMINDER_PERSONALIZATION_MAX_APPLIED:root["REMINDER_PERSONALIZATION_MAX_APPLIED"];
  root["REMINDER_PERSONALIZATION_MAX_DISMISSED"]=typeof REMINDER_PERSONALIZATION_MAX_DISMISSED!=='undefined'?REMINDER_PERSONALIZATION_MAX_DISMISSED:root["REMINDER_PERSONALIZATION_MAX_DISMISSED"];
  root["REMINDER_PERSONALIZATION_MAX_SIGNALS"]=typeof REMINDER_PERSONALIZATION_MAX_SIGNALS!=='undefined'?REMINDER_PERSONALIZATION_MAX_SIGNALS:root["REMINDER_PERSONALIZATION_MAX_SIGNALS"];
  root["REMINDER_PERSONALIZATION_SCHEMA_VERSION"]=typeof REMINDER_PERSONALIZATION_SCHEMA_VERSION!=='undefined'?REMINDER_PERSONALIZATION_SCHEMA_VERSION:root["REMINDER_PERSONALIZATION_SCHEMA_VERSION"];
  root["REMINDER_PERSONALIZATION_SIGNAL_TYPES"]=typeof REMINDER_PERSONALIZATION_SIGNAL_TYPES!=='undefined'?REMINDER_PERSONALIZATION_SIGNAL_TYPES:root["REMINDER_PERSONALIZATION_SIGNAL_TYPES"];
  root["REMINDER_POLICY_DEFAULTS"]=typeof REMINDER_POLICY_DEFAULTS!=='undefined'?REMINDER_POLICY_DEFAULTS:root["REMINDER_POLICY_DEFAULTS"];
  root["REMINDER_PRAYER_ID"]=typeof REMINDER_PRAYER_ID!=='undefined'?REMINDER_PRAYER_ID:root["REMINDER_PRAYER_ID"];
  root["REMINDER_PRAYER_KEYS"]=typeof REMINDER_PRAYER_KEYS!=='undefined'?REMINDER_PRAYER_KEYS:root["REMINDER_PRAYER_KEYS"];
  root["REMINDER_PREFERENCE_SCHEMA_VERSION"]=typeof REMINDER_PREFERENCE_SCHEMA_VERSION!=='undefined'?REMINDER_PREFERENCE_SCHEMA_VERSION:root["REMINDER_PREFERENCE_SCHEMA_VERSION"];
  root["REMINDER_PRIORITY_RANK"]=typeof REMINDER_PRIORITY_RANK!=='undefined'?REMINDER_PRIORITY_RANK:root["REMINDER_PRIORITY_RANK"];
  root["REMINDER_PRIVACY_FORBIDDEN_FIELDS"]=typeof REMINDER_PRIVACY_FORBIDDEN_FIELDS!=='undefined'?REMINDER_PRIVACY_FORBIDDEN_FIELDS:root["REMINDER_PRIVACY_FORBIDDEN_FIELDS"];
  root["REMINDER_PRIVACY_MODES"]=typeof REMINDER_PRIVACY_MODES!=='undefined'?REMINDER_PRIVACY_MODES:root["REMINDER_PRIVACY_MODES"];
  root["REMINDER_PRIVACY_SCHEMAS"]=typeof REMINDER_PRIVACY_SCHEMAS!=='undefined'?REMINDER_PRIVACY_SCHEMAS:root["REMINDER_PRIVACY_SCHEMAS"];
  root["REMINDER_PROFILE_IDS"]=typeof REMINDER_PROFILE_IDS!=='undefined'?REMINDER_PROFILE_IDS:root["REMINDER_PROFILE_IDS"];
  root["REMINDER_PROFILE_LIST"]=typeof REMINDER_PROFILE_LIST!=='undefined'?REMINDER_PROFILE_LIST:root["REMINDER_PROFILE_LIST"];
  root["REMINDER_QUIET_BEHAVIORS"]=typeof REMINDER_QUIET_BEHAVIORS!=='undefined'?REMINDER_QUIET_BEHAVIORS:root["REMINDER_QUIET_BEHAVIORS"];
  root["REMINDER_RESERVED_JOURNAL_ROOTS"]=typeof REMINDER_RESERVED_JOURNAL_ROOTS!=='undefined'?REMINDER_RESERVED_JOURNAL_ROOTS:root["REMINDER_RESERVED_JOURNAL_ROOTS"];
  root["REMINDER_RETENTION_POLICY"]=typeof REMINDER_RETENTION_POLICY!=='undefined'?REMINDER_RETENTION_POLICY:root["REMINDER_RETENTION_POLICY"];
  root["REMINDER_SAYGI_FREQUENCIES"]=typeof REMINDER_SAYGI_FREQUENCIES!=='undefined'?REMINDER_SAYGI_FREQUENCIES:root["REMINDER_SAYGI_FREQUENCIES"];
  root["REMINDER_SAYGI_ID"]=typeof REMINDER_SAYGI_ID!=='undefined'?REMINDER_SAYGI_ID:root["REMINDER_SAYGI_ID"];
  root["REMINDER_SCHEDULER_BURST_MS"]=typeof REMINDER_SCHEDULER_BURST_MS!=='undefined'?REMINDER_SCHEDULER_BURST_MS:root["REMINDER_SCHEDULER_BURST_MS"];
  root["REMINDER_SCHEDULER_TRIGGER_ORDER"]=typeof REMINDER_SCHEDULER_TRIGGER_ORDER!=='undefined'?REMINDER_SCHEDULER_TRIGGER_ORDER:root["REMINDER_SCHEDULER_TRIGGER_ORDER"];
  root["REMINDER_SCHEMA_STATUS"]=typeof REMINDER_SCHEMA_STATUS!=='undefined'?REMINDER_SCHEMA_STATUS:root["REMINDER_SCHEMA_STATUS"];
  root["REMINDER_SNOOZE_OPTIONS"]=typeof REMINDER_SNOOZE_OPTIONS!=='undefined'?REMINDER_SNOOZE_OPTIONS:root["REMINDER_SNOOZE_OPTIONS"];
  root["REMINDER_SPECIAL_DAYS_DEFINITION"]=typeof REMINDER_SPECIAL_DAYS_DEFINITION!=='undefined'?REMINDER_SPECIAL_DAYS_DEFINITION:root["REMINDER_SPECIAL_DAYS_DEFINITION"];
  root["REMINDER_SPECIAL_DAYS_ID"]=typeof REMINDER_SPECIAL_DAYS_ID!=='undefined'?REMINDER_SPECIAL_DAYS_ID:root["REMINDER_SPECIAL_DAYS_ID"];
  root["REMINDER_SPECIAL_DAYS_MODES"]=typeof REMINDER_SPECIAL_DAYS_MODES!=='undefined'?REMINDER_SPECIAL_DAYS_MODES:root["REMINDER_SPECIAL_DAYS_MODES"];
  root["REMINDER_SPECIAL_DAY_OPTIONS"]=typeof REMINDER_SPECIAL_DAY_OPTIONS!=='undefined'?REMINDER_SPECIAL_DAY_OPTIONS:root["REMINDER_SPECIAL_DAY_OPTIONS"];
  root["REMINDER_SPECIAL_NATIVE_BODY"]=typeof REMINDER_SPECIAL_NATIVE_BODY!=='undefined'?REMINDER_SPECIAL_NATIVE_BODY:root["REMINDER_SPECIAL_NATIVE_BODY"];
  root["REMINDER_SPECIAL_NATIVE_TITLE"]=typeof REMINDER_SPECIAL_NATIVE_TITLE!=='undefined'?REMINDER_SPECIAL_NATIVE_TITLE:root["REMINDER_SPECIAL_NATIVE_TITLE"];
  root["REMINDER_STATE_OWNER_CONTRACT"]=typeof REMINDER_STATE_OWNER_CONTRACT!=='undefined'?REMINDER_STATE_OWNER_CONTRACT:root["REMINDER_STATE_OWNER_CONTRACT"];
  root["REMINDER_SURFACE_STATES"]=typeof REMINDER_SURFACE_STATES!=='undefined'?REMINDER_SURFACE_STATES:root["REMINDER_SURFACE_STATES"];
  root["REMINDER_SYNC_BLOCKED_KEY"]=typeof REMINDER_SYNC_BLOCKED_KEY!=='undefined'?REMINDER_SYNC_BLOCKED_KEY:root["REMINDER_SYNC_BLOCKED_KEY"];
  root["REMINDER_SYNC_BLOCKED_ROOTS"]=typeof REMINDER_SYNC_BLOCKED_ROOTS!=='undefined'?REMINDER_SYNC_BLOCKED_ROOTS:root["REMINDER_SYNC_BLOCKED_ROOTS"];
  root["REMINDER_SYSTEM_STATUS_VERSION"]=typeof REMINDER_SYSTEM_STATUS_VERSION!=='undefined'?REMINDER_SYSTEM_STATUS_VERSION:root["REMINDER_SYSTEM_STATUS_VERSION"];
  root["REMINDER_SYSTEM_SYNC_STATES"]=typeof REMINDER_SYSTEM_SYNC_STATES!=='undefined'?REMINDER_SYSTEM_SYNC_STATES:root["REMINDER_SYSTEM_SYNC_STATES"];
  root["REMINDER_THERAPY_FREQUENCIES"]=typeof REMINDER_THERAPY_FREQUENCIES!=='undefined'?REMINDER_THERAPY_FREQUENCIES:root["REMINDER_THERAPY_FREQUENCIES"];
  root["REMINDER_THERAPY_ID"]=typeof REMINDER_THERAPY_ID!=='undefined'?REMINDER_THERAPY_ID:root["REMINDER_THERAPY_ID"];
  root["REMINDER_THERAPY_TOOL_ALIASES"]=typeof REMINDER_THERAPY_TOOL_ALIASES!=='undefined'?REMINDER_THERAPY_TOOL_ALIASES:root["REMINDER_THERAPY_TOOL_ALIASES"];
  root["REMINDER_THERAPY_TOOL_IDS"]=typeof REMINDER_THERAPY_TOOL_IDS!=='undefined'?REMINDER_THERAPY_TOOL_IDS:root["REMINDER_THERAPY_TOOL_IDS"];
  root["REMINDER_ZIKR_FREQUENCIES"]=typeof REMINDER_ZIKR_FREQUENCIES!=='undefined'?REMINDER_ZIKR_FREQUENCIES:root["REMINDER_ZIKR_FREQUENCIES"];
  root["REMINDER_ZIKR_ID"]=typeof REMINDER_ZIKR_ID!=='undefined'?REMINDER_ZIKR_ID:root["REMINDER_ZIKR_ID"];
  root["REMINDER_ZIKR_MIN_INTERVAL_DAYS"]=typeof REMINDER_ZIKR_MIN_INTERVAL_DAYS!=='undefined'?REMINDER_ZIKR_MIN_INTERVAL_DAYS:root["REMINDER_ZIKR_MIN_INTERVAL_DAYS"];
  root["appendReminderEvent"]=typeof appendReminderEvent!=='undefined'?appendReminderEvent:root["appendReminderEvent"];
  root["emptyReminderOnboarding"]=typeof emptyReminderOnboarding!=='undefined'?emptyReminderOnboarding:root["emptyReminderOnboarding"];
  root["emptyReminderPersonalization"]=typeof emptyReminderPersonalization!=='undefined'?emptyReminderPersonalization:root["emptyReminderPersonalization"];
  root["emptyReminderPolicy"]=typeof emptyReminderPolicy!=='undefined'?emptyReminderPolicy:root["emptyReminderPolicy"];
  root["emptyReminderSpecialDays"]=typeof emptyReminderSpecialDays!=='undefined'?emptyReminderSpecialDays:root["emptyReminderSpecialDays"];
  root["emptyReminderState"]=typeof emptyReminderState!=='undefined'?emptyReminderState:root["emptyReminderState"];
  root["isReminderSyncBlockedKey"]=typeof isReminderSyncBlockedKey!=='undefined'?isReminderSyncBlockedKey:root["isReminderSyncBlockedKey"];
  root["mergePersistedReminderState"]=typeof mergePersistedReminderState!=='undefined'?mergePersistedReminderState:root["mergePersistedReminderState"];
  root["mergeReminderLocalState"]=typeof mergeReminderLocalState!=='undefined'?mergeReminderLocalState:root["mergeReminderLocalState"];
  root["migrateReminderState"]=typeof migrateReminderState!=='undefined'?migrateReminderState:root["migrateReminderState"];
  root["normalizeReminderCareCategories"]=typeof normalizeReminderCareCategories!=='undefined'?normalizeReminderCareCategories:root["normalizeReminderCareCategories"];
  root["normalizeReminderCategories"]=typeof normalizeReminderCategories!=='undefined'?normalizeReminderCategories:root["normalizeReminderCategories"];
  root["normalizeReminderMedication"]=typeof normalizeReminderMedication!=='undefined'?normalizeReminderMedication:root["normalizeReminderMedication"];
  root["normalizeReminderMedications"]=typeof normalizeReminderMedications!=='undefined'?normalizeReminderMedications:root["normalizeReminderMedications"];
  root["normalizeReminderOnboarding"]=typeof normalizeReminderOnboarding!=='undefined'?normalizeReminderOnboarding:root["normalizeReminderOnboarding"];
  root["normalizeReminderPersonalization"]=typeof normalizeReminderPersonalization!=='undefined'?normalizeReminderPersonalization:root["normalizeReminderPersonalization"];
  root["normalizeReminderPolicy"]=typeof normalizeReminderPolicy!=='undefined'?normalizeReminderPolicy:root["normalizeReminderPolicy"];
  root["normalizeReminderPreference"]=typeof normalizeReminderPreference!=='undefined'?normalizeReminderPreference:root["normalizeReminderPreference"];
  root["normalizeReminderProfile"]=typeof normalizeReminderProfile!=='undefined'?normalizeReminderProfile:root["normalizeReminderProfile"];
  root["normalizeReminderSpecialDaySelection"]=typeof normalizeReminderSpecialDaySelection!=='undefined'?normalizeReminderSpecialDaySelection:root["normalizeReminderSpecialDaySelection"];
  root["normalizeReminderSpecialDays"]=typeof normalizeReminderSpecialDays!=='undefined'?normalizeReminderSpecialDays:root["normalizeReminderSpecialDays"];
  root["persistReminderEvent"]=typeof persistReminderEvent!=='undefined'?persistReminderEvent:root["persistReminderEvent"];
  root["reconcileReminderStorageEvent"]=typeof reconcileReminderStorageEvent!=='undefined'?reconcileReminderStorageEvent:root["reconcileReminderStorageEvent"];
  root["reminderActionCommit"]=typeof reminderActionCommit!=='undefined'?reminderActionCommit:root["reminderActionCommit"];
  root["reminderActionDefinition"]=typeof reminderActionDefinition!=='undefined'?reminderActionDefinition:root["reminderActionDefinition"];
  root["reminderActionDueCandidates"]=typeof reminderActionDueCandidates!=='undefined'?reminderActionDueCandidates:root["reminderActionDueCandidates"];
  root["reminderActionFind"]=typeof reminderActionFind!=='undefined'?reminderActionFind:root["reminderActionFind"];
  root["reminderActionLoad"]=typeof reminderActionLoad!=='undefined'?reminderActionLoad:root["reminderActionLoad"];
  root["reminderActionLocalTime"]=typeof reminderActionLocalTime!=='undefined'?reminderActionLocalTime:root["reminderActionLocalTime"];
  root["reminderActionNormalize"]=typeof reminderActionNormalize!=='undefined'?reminderActionNormalize:root["reminderActionNormalize"];
  root["reminderActionNormalizeEntry"]=typeof reminderActionNormalizeEntry!=='undefined'?reminderActionNormalizeEntry:root["reminderActionNormalizeEntry"];
  root["reminderActionOccurrence"]=typeof reminderActionOccurrence!=='undefined'?reminderActionOccurrence:root["reminderActionOccurrence"];
  root["reminderActionOption"]=typeof reminderActionOption!=='undefined'?reminderActionOption:root["reminderActionOption"];
  root["reminderActionOptionLabel"]=typeof reminderActionOptionLabel!=='undefined'?reminderActionOptionLabel:root["reminderActionOptionLabel"];
  root["reminderActionSafeToken"]=typeof reminderActionSafeToken!=='undefined'?reminderActionSafeToken:root["reminderActionSafeToken"];
  root["reminderActionScheduledAt"]=typeof reminderActionScheduledAt!=='undefined'?reminderActionScheduledAt:root["reminderActionScheduledAt"];
  root["reminderActionStorageRead"]=typeof reminderActionStorageRead!=='undefined'?reminderActionStorageRead:root["reminderActionStorageRead"];
  root["reminderActionStorageWrite"]=typeof reminderActionStorageWrite!=='undefined'?reminderActionStorageWrite:root["reminderActionStorageWrite"];
  root["reminderActiveElementId"]=typeof reminderActiveElementId!=='undefined'?reminderActiveElementId:root["reminderActiveElementId"];
  root["reminderAppClockBoundary"]=typeof reminderAppClockBoundary!=='undefined'?reminderAppClockBoundary:root["reminderAppClockBoundary"];
  root["reminderAppEngineInput"]=typeof reminderAppEngineInput!=='undefined'?reminderAppEngineInput:root["reminderAppEngineInput"];
  root["reminderCapacityModeLabel"]=typeof reminderCapacityModeLabel!=='undefined'?reminderCapacityModeLabel:root["reminderCapacityModeLabel"];
  root["reminderCardHTML"]=typeof reminderCardHTML!=='undefined'?reminderCardHTML:root["reminderCardHTML"];
  root["reminderCareControlsHTML"]=typeof reminderCareControlsHTML!=='undefined'?reminderCareControlsHTML:root["reminderCareControlsHTML"];
  root["reminderCareDefinition"]=typeof reminderCareDefinition!=='undefined'?reminderCareDefinition:root["reminderCareDefinition"];
  root["reminderCareDefinitions"]=typeof reminderCareDefinitions!=='undefined'?reminderCareDefinitions:root["reminderCareDefinitions"];
  root["reminderCareEveningActive"]=typeof reminderCareEveningActive!=='undefined'?reminderCareEveningActive:root["reminderCareEveningActive"];
  root["reminderCareLifecycleCandidates"]=typeof reminderCareLifecycleCandidates!=='undefined'?reminderCareLifecycleCandidates:root["reminderCareLifecycleCandidates"];
  root["reminderCareMovementTime"]=typeof reminderCareMovementTime!=='undefined'?reminderCareMovementTime:root["reminderCareMovementTime"];
  root["reminderCareNativeCategories"]=typeof reminderCareNativeCategories!=='undefined'?reminderCareNativeCategories:root["reminderCareNativeCategories"];
  root["reminderCareNudgeSources"]=typeof reminderCareNudgeSources!=='undefined'?reminderCareNudgeSources:root["reminderCareNudgeSources"];
  root["reminderCareOccurrenceId"]=typeof reminderCareOccurrenceId!=='undefined'?reminderCareOccurrenceId:root["reminderCareOccurrenceId"];
  root["reminderCarePreference"]=typeof reminderCarePreference!=='undefined'?reminderCarePreference:root["reminderCarePreference"];
  root["reminderCareSlotTimes"]=typeof reminderCareSlotTimes!=='undefined'?reminderCareSlotTimes:root["reminderCareSlotTimes"];
  root["reminderCareWakeWindow"]=typeof reminderCareWakeWindow!=='undefined'?reminderCareWakeWindow:root["reminderCareWakeWindow"];
  root["reminderCareWindowContains"]=typeof reminderCareWindowContains!=='undefined'?reminderCareWindowContains:root["reminderCareWindowContains"];
  root["reminderCatchupBlockingEntry"]=typeof reminderCatchupBlockingEntry!=='undefined'?reminderCatchupBlockingEntry:root["reminderCatchupBlockingEntry"];
  root["reminderCatchupHash"]=typeof reminderCatchupHash!=='undefined'?reminderCatchupHash:root["reminderCatchupHash"];
  root["reminderCatchupLocalDateTimeMs"]=typeof reminderCatchupLocalDateTimeMs!=='undefined'?reminderCatchupLocalDateTimeMs:root["reminderCatchupLocalDateTimeMs"];
  root["reminderCatchupOccurrenceMs"]=typeof reminderCatchupOccurrenceMs!=='undefined'?reminderCatchupOccurrenceMs:root["reminderCatchupOccurrenceMs"];
  root["reminderCatchupPlan"]=typeof reminderCatchupPlan!=='undefined'?reminderCatchupPlan:root["reminderCatchupPlan"];
  root["reminderCatchupPolicyAllowed"]=typeof reminderCatchupPolicyAllowed!=='undefined'?reminderCatchupPolicyAllowed:root["reminderCatchupPolicyAllowed"];
  root["reminderCatchupPrecedence"]=typeof reminderCatchupPrecedence!=='undefined'?reminderCatchupPrecedence:root["reminderCatchupPrecedence"];
  root["reminderCatchupPriority"]=typeof reminderCatchupPriority!=='undefined'?reminderCatchupPriority:root["reminderCatchupPriority"];
  root["reminderCatchupPublic"]=typeof reminderCatchupPublic!=='undefined'?reminderCatchupPublic:root["reminderCatchupPublic"];
  root["reminderCategoryChannelLabel"]=typeof reminderCategoryChannelLabel!=='undefined'?reminderCategoryChannelLabel:root["reminderCategoryChannelLabel"];
  root["reminderCategoryControlsHTML"]=typeof reminderCategoryControlsHTML!=='undefined'?reminderCategoryControlsHTML:root["reminderCategoryControlsHTML"];
  root["reminderCategoryIds"]=typeof reminderCategoryIds!=='undefined'?reminderCategoryIds:root["reminderCategoryIds"];
  root["reminderCategoryMeta"]=typeof reminderCategoryMeta!=='undefined'?reminderCategoryMeta:root["reminderCategoryMeta"];
  root["reminderCategorySelection"]=typeof reminderCategorySelection!=='undefined'?reminderCategorySelection:root["reminderCategorySelection"];
  root["reminderCategoryState"]=typeof reminderCategoryState!=='undefined'?reminderCategoryState:root["reminderCategoryState"];
  root["reminderCenterClone"]=typeof reminderCenterClone!=='undefined'?reminderCenterClone:root["reminderCenterClone"];
  root["reminderCenterEnabledCount"]=typeof reminderCenterEnabledCount!=='undefined'?reminderCenterEnabledCount:root["reminderCenterEnabledCount"];
  root["reminderCenterHistoryEntries"]=typeof reminderCenterHistoryEntries!=='undefined'?reminderCenterHistoryEntries:root["reminderCenterHistoryEntries"];
  root["reminderCenterHistoryHTML"]=typeof reminderCenterHistoryHTML!=='undefined'?reminderCenterHistoryHTML:root["reminderCenterHistoryHTML"];
  root["reminderCenterHistoryStatusLabel"]=typeof reminderCenterHistoryStatusLabel!=='undefined'?reminderCenterHistoryStatusLabel:root["reminderCenterHistoryStatusLabel"];
  root["reminderCenterNativeUsed"]=typeof reminderCenterNativeUsed!=='undefined'?reminderCenterNativeUsed:root["reminderCenterNativeUsed"];
  root["reminderCenterNoticeHTML"]=typeof reminderCenterNoticeHTML!=='undefined'?reminderCenterNoticeHTML:root["reminderCenterNoticeHTML"];
  root["reminderCenterOverlayHTML"]=typeof reminderCenterOverlayHTML!=='undefined'?reminderCenterOverlayHTML:root["reminderCenterOverlayHTML"];
  root["reminderCenterPolicyHTML"]=typeof reminderCenterPolicyHTML!=='undefined'?reminderCenterPolicyHTML:root["reminderCenterPolicyHTML"];
  root["reminderCenterRetentionHTML"]=typeof reminderCenterRetentionHTML!=='undefined'?reminderCenterRetentionHTML:root["reminderCenterRetentionHTML"];
  root["reminderChannelLabel"]=typeof reminderChannelLabel!=='undefined'?reminderChannelLabel:root["reminderChannelLabel"];
  root["reminderCloseForTarget"]=typeof reminderCloseForTarget!=='undefined'?reminderCloseForTarget:root["reminderCloseForTarget"];
  root["reminderConfirmAction"]=typeof reminderConfirmAction!=='undefined'?reminderConfirmAction:root["reminderConfirmAction"];
  root["reminderCopy"]=typeof reminderCopy!=='undefined'?reminderCopy:root["reminderCopy"];
  root["reminderCrossSurfaceCapability"]=typeof reminderCrossSurfaceCapability!=='undefined'?reminderCrossSurfaceCapability:root["reminderCrossSurfaceCapability"];
  root["reminderCrossSurfaceLayer"]=typeof reminderCrossSurfaceLayer!=='undefined'?reminderCrossSurfaceLayer:root["reminderCrossSurfaceLayer"];
  root["reminderCrossSurfaceRank"]=typeof reminderCrossSurfaceRank!=='undefined'?reminderCrossSurfaceRank:root["reminderCrossSurfaceRank"];
  root["reminderCrossSurfaceReceiptEvidence"]=typeof reminderCrossSurfaceReceiptEvidence!=='undefined'?reminderCrossSurfaceReceiptEvidence:root["reminderCrossSurfaceReceiptEvidence"];
  root["reminderCrossSurfaceStatus"]=typeof reminderCrossSurfaceStatus!=='undefined'?reminderCrossSurfaceStatus:root["reminderCrossSurfaceStatus"];
  root["reminderCrossSurfaceTransition"]=typeof reminderCrossSurfaceTransition!=='undefined'?reminderCrossSurfaceTransition:root["reminderCrossSurfaceTransition"];
  root["reminderCurrentRoot"]=typeof reminderCurrentRoot!=='undefined'?reminderCurrentRoot:root["reminderCurrentRoot"];
  root["reminderDailyFlowCandidateCompare"]=typeof reminderDailyFlowCandidateCompare!=='undefined'?reminderDailyFlowCandidateCompare:root["reminderDailyFlowCandidateCompare"];
  root["reminderDailyFlowCandidateDate"]=typeof reminderDailyFlowCandidateDate!=='undefined'?reminderDailyFlowCandidateDate:root["reminderDailyFlowCandidateDate"];
  root["reminderDailyFlowCandidateDecision"]=typeof reminderDailyFlowCandidateDecision!=='undefined'?reminderDailyFlowCandidateDecision:root["reminderDailyFlowCandidateDecision"];
  root["reminderDailyFlowCandidateEligible"]=typeof reminderDailyFlowCandidateEligible!=='undefined'?reminderDailyFlowCandidateEligible:root["reminderDailyFlowCandidateEligible"];
  root["reminderDailyFlowCandidateExplicit"]=typeof reminderDailyFlowCandidateExplicit!=='undefined'?reminderDailyFlowCandidateExplicit:root["reminderDailyFlowCandidateExplicit"];
  root["reminderDailyFlowCandidateOccurrence"]=typeof reminderDailyFlowCandidateOccurrence!=='undefined'?reminderDailyFlowCandidateOccurrence:root["reminderDailyFlowCandidateOccurrence"];
  root["reminderDailyFlowCoalesceCandidates"]=typeof reminderDailyFlowCoalesceCandidates!=='undefined'?reminderDailyFlowCoalesceCandidates:root["reminderDailyFlowCoalesceCandidates"];
  root["reminderDailyFlowCopy"]=typeof reminderDailyFlowCopy!=='undefined'?reminderDailyFlowCopy:root["reminderDailyFlowCopy"];
  root["reminderDailyFlowDecorate"]=typeof reminderDailyFlowDecorate!=='undefined'?reminderDailyFlowDecorate:root["reminderDailyFlowDecorate"];
  root["reminderDailyFlowGroup"]=typeof reminderDailyFlowGroup!=='undefined'?reminderDailyFlowGroup:root["reminderDailyFlowGroup"];
  root["reminderDailyFlowIdForTime"]=typeof reminderDailyFlowIdForTime!=='undefined'?reminderDailyFlowIdForTime:root["reminderDailyFlowIdForTime"];
  root["reminderDailyFlowPolicy"]=typeof reminderDailyFlowPolicy!=='undefined'?reminderDailyFlowPolicy:root["reminderDailyFlowPolicy"];
  root["reminderDailyFlowSafeMembers"]=typeof reminderDailyFlowSafeMembers!=='undefined'?reminderDailyFlowSafeMembers:root["reminderDailyFlowSafeMembers"];
  root["reminderDailyFlowSafeValue"]=typeof reminderDailyFlowSafeValue!=='undefined'?reminderDailyFlowSafeValue:root["reminderDailyFlowSafeValue"];
  root["reminderDailyFlowTime"]=typeof reminderDailyFlowTime!=='undefined'?reminderDailyFlowTime:root["reminderDailyFlowTime"];
  root["reminderDeepLinkTarget"]=typeof reminderDeepLinkTarget!=='undefined'?reminderDeepLinkTarget:root["reminderDeepLinkTarget"];
  root["reminderDefinitions"]=typeof reminderDefinitions!=='undefined'?reminderDefinitions:root["reminderDefinitions"];
  root["reminderDeliveryAction"]=typeof reminderDeliveryAction!=='undefined'?reminderDeliveryAction:root["reminderDeliveryAction"];
  root["reminderDeliveryActionStatus"]=typeof reminderDeliveryActionStatus!=='undefined'?reminderDeliveryActionStatus:root["reminderDeliveryActionStatus"];
  root["reminderDeliveryBlockedByClear"]=typeof reminderDeliveryBlockedByClear!=='undefined'?reminderDeliveryBlockedByClear:root["reminderDeliveryBlockedByClear"];
  root["reminderDeliveryCanShowPure"]=typeof reminderDeliveryCanShowPure!=='undefined'?reminderDeliveryCanShowPure:root["reminderDeliveryCanShowPure"];
  root["reminderDeliveryChannel"]=typeof reminderDeliveryChannel!=='undefined'?reminderDeliveryChannel:root["reminderDeliveryChannel"];
  root["reminderDeliveryClear"]=typeof reminderDeliveryClear!=='undefined'?reminderDeliveryClear:root["reminderDeliveryClear"];
  root["reminderDeliveryClearBoundary"]=typeof reminderDeliveryClearBoundary!=='undefined'?reminderDeliveryClearBoundary:root["reminderDeliveryClearBoundary"];
  root["reminderDeliveryCommit"]=typeof reminderDeliveryCommit!=='undefined'?reminderDeliveryCommit:root["reminderDeliveryCommit"];
  root["reminderDeliveryEmpty"]=typeof reminderDeliveryEmpty!=='undefined'?reminderDeliveryEmpty:root["reminderDeliveryEmpty"];
  root["reminderDeliveryEntry"]=typeof reminderDeliveryEntry!=='undefined'?reminderDeliveryEntry:root["reminderDeliveryEntry"];
  root["reminderDeliveryEntryRank"]=typeof reminderDeliveryEntryRank!=='undefined'?reminderDeliveryEntryRank:root["reminderDeliveryEntryRank"];
  root["reminderDeliveryFind"]=typeof reminderDeliveryFind!=='undefined'?reminderDeliveryFind:root["reminderDeliveryFind"];
  root["reminderDeliveryIso"]=typeof reminderDeliveryIso!=='undefined'?reminderDeliveryIso:root["reminderDeliveryIso"];
  root["reminderDeliveryLoad"]=typeof reminderDeliveryLoad!=='undefined'?reminderDeliveryLoad:root["reminderDeliveryLoad"];
  root["reminderDeliveryMergeEntry"]=typeof reminderDeliveryMergeEntry!=='undefined'?reminderDeliveryMergeEntry:root["reminderDeliveryMergeEntry"];
  root["reminderDeliveryModule"]=typeof reminderDeliveryModule!=='undefined'?reminderDeliveryModule:root["reminderDeliveryModule"];
  root["reminderDeliveryNormalize"]=typeof reminderDeliveryNormalize!=='undefined'?reminderDeliveryNormalize:root["reminderDeliveryNormalize"];
  root["reminderDeliveryNow"]=typeof reminderDeliveryNow!=='undefined'?reminderDeliveryNow:root["reminderDeliveryNow"];
  root["reminderDeliveryOccurrenceAt"]=typeof reminderDeliveryOccurrenceAt!=='undefined'?reminderDeliveryOccurrenceAt:root["reminderDeliveryOccurrenceAt"];
  root["reminderDeliveryReason"]=typeof reminderDeliveryReason!=='undefined'?reminderDeliveryReason:root["reminderDeliveryReason"];
  root["reminderDeliveryRecordAdapter"]=typeof reminderDeliveryRecordAdapter!=='undefined'?reminderDeliveryRecordAdapter:root["reminderDeliveryRecordAdapter"];
  root["reminderDeliveryRecordPure"]=typeof reminderDeliveryRecordPure!=='undefined'?reminderDeliveryRecordPure:root["reminderDeliveryRecordPure"];
  root["reminderDeliveryResult"]=typeof reminderDeliveryResult!=='undefined'?reminderDeliveryResult:root["reminderDeliveryResult"];
  root["reminderDeliveryStatus"]=typeof reminderDeliveryStatus!=='undefined'?reminderDeliveryStatus:root["reminderDeliveryStatus"];
  root["reminderDeliveryStorageRead"]=typeof reminderDeliveryStorageRead!=='undefined'?reminderDeliveryStorageRead:root["reminderDeliveryStorageRead"];
  root["reminderDeliveryStorageWrite"]=typeof reminderDeliveryStorageWrite!=='undefined'?reminderDeliveryStorageWrite:root["reminderDeliveryStorageWrite"];
  root["reminderDeliveryText"]=typeof reminderDeliveryText!=='undefined'?reminderDeliveryText:root["reminderDeliveryText"];
  root["reminderDeliveryTombstones"]=typeof reminderDeliveryTombstones!=='undefined'?reminderDeliveryTombstones:root["reminderDeliveryTombstones"];
  root["reminderDigestBuild"]=typeof reminderDigestBuild!=='undefined'?reminderDigestBuild:root["reminderDigestBuild"];
  root["reminderDigestDateDistance"]=typeof reminderDigestDateDistance!=='undefined'?reminderDigestDateDistance:root["reminderDigestDateDistance"];
  root["reminderDigestDateShift"]=typeof reminderDigestDateShift!=='undefined'?reminderDigestDateShift:root["reminderDigestDateShift"];
  root["reminderDigestHTML"]=typeof reminderDigestHTML!=='undefined'?reminderDigestHTML:root["reminderDigestHTML"];
  root["reminderDigestLauncherHTML"]=typeof reminderDigestLauncherHTML!=='undefined'?reminderDigestLauncherHTML:root["reminderDigestLauncherHTML"];
  root["reminderDigestLocalDate"]=typeof reminderDigestLocalDate!=='undefined'?reminderDigestLocalDate:root["reminderDigestLocalDate"];
  root["reminderDigestReflectionOption"]=typeof reminderDigestReflectionOption!=='undefined'?reminderDigestReflectionOption:root["reminderDigestReflectionOption"];
  root["reminderDigestTimezone"]=typeof reminderDigestTimezone!=='undefined'?reminderDigestTimezone:root["reminderDigestTimezone"];
  root["reminderEngineAdapterGenerateOccurrence"]=typeof reminderEngineAdapterGenerateOccurrence!=='undefined'?reminderEngineAdapterGenerateOccurrence:root["reminderEngineAdapterGenerateOccurrence"];
  root["reminderEngineAdapterLocalParts"]=typeof reminderEngineAdapterLocalParts!=='undefined'?reminderEngineAdapterLocalParts:root["reminderEngineAdapterLocalParts"];
  root["reminderEngineAddDays"]=typeof reminderEngineAddDays!=='undefined'?reminderEngineAddDays:root["reminderEngineAddDays"];
  root["reminderEngineCompareDateTime"]=typeof reminderEngineCompareDateTime!=='undefined'?reminderEngineCompareDateTime:root["reminderEngineCompareDateTime"];
  root["reminderEngineFormatTime"]=typeof reminderEngineFormatTime!=='undefined'?reminderEngineFormatTime:root["reminderEngineFormatTime"];
  root["reminderEngineGenerateOccurrence"]=typeof reminderEngineGenerateOccurrence!=='undefined'?reminderEngineGenerateOccurrence:root["reminderEngineGenerateOccurrence"];
  root["reminderEngineInstantMs"]=typeof reminderEngineInstantMs!=='undefined'?reminderEngineInstantMs:root["reminderEngineInstantMs"];
  root["reminderEngineLocalParts"]=typeof reminderEngineLocalParts!=='undefined'?reminderEngineLocalParts:root["reminderEngineLocalParts"];
  root["reminderEngineModule"]=typeof reminderEngineModule!=='undefined'?reminderEngineModule:root["reminderEngineModule"];
  root["reminderEngineOccurrenceId"]=typeof reminderEngineOccurrenceId!=='undefined'?reminderEngineOccurrenceId:root["reminderEngineOccurrenceId"];
  root["reminderEngineParseTime"]=typeof reminderEngineParseTime!=='undefined'?reminderEngineParseTime:root["reminderEngineParseTime"];
  root["reminderEnginePrayerTime"]=typeof reminderEnginePrayerTime!=='undefined'?reminderEnginePrayerTime:root["reminderEnginePrayerTime"];
  root["reminderEngineScheduledTime"]=typeof reminderEngineScheduledTime!=='undefined'?reminderEngineScheduledTime:root["reminderEngineScheduledTime"];
  root["reminderEngineSource"]=typeof reminderEngineSource!=='undefined'?reminderEngineSource:root["reminderEngineSource"];
  root["reminderEngineTimezoneValid"]=typeof reminderEngineTimezoneValid!=='undefined'?reminderEngineTimezoneValid:root["reminderEngineTimezoneValid"];
  root["reminderEngineValidDate"]=typeof reminderEngineValidDate!=='undefined'?reminderEngineValidDate:root["reminderEngineValidDate"];
  root["reminderEnsurePreference"]=typeof reminderEnsurePreference!=='undefined'?reminderEnsurePreference:root["reminderEnsurePreference"];
  root["reminderEnumHas"]=typeof reminderEnumHas!=='undefined'?reminderEnumHas:root["reminderEnumHas"];
  root["reminderEvaluateReminders"]=typeof reminderEvaluateReminders!=='undefined'?reminderEvaluateReminders:root["reminderEvaluateReminders"];
  root["reminderEveningCandidateCompare"]=typeof reminderEveningCandidateCompare!=='undefined'?reminderEveningCandidateCompare:root["reminderEveningCandidateCompare"];
  root["reminderEveningCandidateEligible"]=typeof reminderEveningCandidateEligible!=='undefined'?reminderEveningCandidateEligible:root["reminderEveningCandidateEligible"];
  root["reminderEveningCoalesceCandidates"]=typeof reminderEveningCoalesceCandidates!=='undefined'?reminderEveningCoalesceCandidates:root["reminderEveningCoalesceCandidates"];
  root["reminderEveningExplicitSelection"]=typeof reminderEveningExplicitSelection!=='undefined'?reminderEveningExplicitSelection:root["reminderEveningExplicitSelection"];
  root["reminderEveningOccurrenceId"]=typeof reminderEveningOccurrenceId!=='undefined'?reminderEveningOccurrenceId:root["reminderEveningOccurrenceId"];
  root["reminderEveningSafeAlternative"]=typeof reminderEveningSafeAlternative!=='undefined'?reminderEveningSafeAlternative:root["reminderEveningSafeAlternative"];
  root["reminderEveningSafeGroup"]=typeof reminderEveningSafeGroup!=='undefined'?reminderEveningSafeGroup:root["reminderEveningSafeGroup"];
  root["reminderEveningSurface"]=typeof reminderEveningSurface!=='undefined'?reminderEveningSurface:root["reminderEveningSurface"];
  root["reminderEveningWindowStart"]=typeof reminderEveningWindowStart!=='undefined'?reminderEveningWindowStart:root["reminderEveningWindowStart"];
  root["reminderEventActionForDelivery"]=typeof reminderEventActionForDelivery!=='undefined'?reminderEventActionForDelivery:root["reminderEventActionForDelivery"];
  root["reminderEventCorrelation"]=typeof reminderEventCorrelation!=='undefined'?reminderEventCorrelation:root["reminderEventCorrelation"];
  root["reminderEventDigest"]=typeof reminderEventDigest!=='undefined'?reminderEventDigest:root["reminderEventDigest"];
  root["reminderExportSummary"]=typeof reminderExportSummary!=='undefined'?reminderExportSummary:root["reminderExportSummary"];
  root["reminderInboxActionArg"]=typeof reminderInboxActionArg!=='undefined'?reminderInboxActionArg:root["reminderInboxActionArg"];
  root["reminderInboxBuildItems"]=typeof reminderInboxBuildItems!=='undefined'?reminderInboxBuildItems:root["reminderInboxBuildItems"];
  root["reminderInboxCardHTML"]=typeof reminderInboxCardHTML!=='undefined'?reminderInboxCardHTML:root["reminderInboxCardHTML"];
  root["reminderInboxContext"]=typeof reminderInboxContext!=='undefined'?reminderInboxContext:root["reminderInboxContext"];
  root["reminderInboxDefinitionMap"]=typeof reminderInboxDefinitionMap!=='undefined'?reminderInboxDefinitionMap:root["reminderInboxDefinitionMap"];
  root["reminderInboxItemHTML"]=typeof reminderInboxItemHTML!=='undefined'?reminderInboxItemHTML:root["reminderInboxItemHTML"];
  root["reminderInboxReasonLabel"]=typeof reminderInboxReasonLabel!=='undefined'?reminderInboxReasonLabel:root["reminderInboxReasonLabel"];
  root["reminderLifecycleBuildCandidates"]=typeof reminderLifecycleBuildCandidates!=='undefined'?reminderLifecycleBuildCandidates:root["reminderLifecycleBuildCandidates"];
  root["reminderLifecycleCandidateList"]=typeof reminderLifecycleCandidateList!=='undefined'?reminderLifecycleCandidateList:root["reminderLifecycleCandidateList"];
  root["reminderLifecycleCandidateSignature"]=typeof reminderLifecycleCandidateSignature!=='undefined'?reminderLifecycleCandidateSignature:root["reminderLifecycleCandidateSignature"];
  root["reminderLifecycleDefaultContext"]=typeof reminderLifecycleDefaultContext!=='undefined'?reminderLifecycleDefaultContext:root["reminderLifecycleDefaultContext"];
  root["reminderLifecycleDraftActive"]=typeof reminderLifecycleDraftActive!=='undefined'?reminderLifecycleDraftActive:root["reminderLifecycleDraftActive"];
  root["reminderLifecycleEvaluate"]=typeof reminderLifecycleEvaluate!=='undefined'?reminderLifecycleEvaluate:root["reminderLifecycleEvaluate"];
  root["reminderLifecycleIsPrayerCandidate"]=typeof reminderLifecycleIsPrayerCandidate!=='undefined'?reminderLifecycleIsPrayerCandidate:root["reminderLifecycleIsPrayerCandidate"];
  root["reminderLifecycleLiveHTML"]=typeof reminderLifecycleLiveHTML!=='undefined'?reminderLifecycleLiveHTML:root["reminderLifecycleLiveHTML"];
  root["reminderLifecycleOccurrenceId"]=typeof reminderLifecycleOccurrenceId!=='undefined'?reminderLifecycleOccurrenceId:root["reminderLifecycleOccurrenceId"];
  root["reminderLifecycleOverlayOpen"]=typeof reminderLifecycleOverlayOpen!=='undefined'?reminderLifecycleOverlayOpen:root["reminderLifecycleOverlayOpen"];
  root["reminderLifecycleRecordFailure"]=typeof reminderLifecycleRecordFailure!=='undefined'?reminderLifecycleRecordFailure:root["reminderLifecycleRecordFailure"];
  root["reminderLifecycleRecordReceipt"]=typeof reminderLifecycleRecordReceipt!=='undefined'?reminderLifecycleRecordReceipt:root["reminderLifecycleRecordReceipt"];
  root["reminderLifecycleRecordResult"]=typeof reminderLifecycleRecordResult!=='undefined'?reminderLifecycleRecordResult:root["reminderLifecycleRecordResult"];
  root["reminderLifecycleRenderIfNeeded"]=typeof reminderLifecycleRenderIfNeeded!=='undefined'?reminderLifecycleRenderIfNeeded:root["reminderLifecycleRenderIfNeeded"];
  root["reminderLifecycleRenderPolicy"]=typeof reminderLifecycleRenderPolicy!=='undefined'?reminderLifecycleRenderPolicy:root["reminderLifecycleRenderPolicy"];
  root["reminderLifecycleReplaceTarget"]=typeof reminderLifecycleReplaceTarget!=='undefined'?reminderLifecycleReplaceTarget:root["reminderLifecycleReplaceTarget"];
  root["reminderLifecycleTarget"]=typeof reminderLifecycleTarget!=='undefined'?reminderLifecycleTarget:root["reminderLifecycleTarget"];
  root["reminderLifecycleTargetedUpdate"]=typeof reminderLifecycleTargetedUpdate!=='undefined'?reminderLifecycleTargetedUpdate:root["reminderLifecycleTargetedUpdate"];
  root["reminderLifecycleTick"]=typeof reminderLifecycleTick!=='undefined'?reminderLifecycleTick:root["reminderLifecycleTick"];
  root["reminderLifecycleUpdateLive"]=typeof reminderLifecycleUpdateLive!=='undefined'?reminderLifecycleUpdateLive:root["reminderLifecycleUpdateLive"];
  root["reminderLifecycleVisibility"]=typeof reminderLifecycleVisibility!=='undefined'?reminderLifecycleVisibility:root["reminderLifecycleVisibility"];
  root["reminderLifecycleWindowDue"]=typeof reminderLifecycleWindowDue!=='undefined'?reminderLifecycleWindowDue:root["reminderLifecycleWindowDue"];
  root["reminderLocalChoose"]=typeof reminderLocalChoose!=='undefined'?reminderLocalChoose:root["reminderLocalChoose"];
  root["reminderLocalChooseList"]=typeof reminderLocalChooseList!=='undefined'?reminderLocalChooseList:root["reminderLocalChooseList"];
  root["reminderLocalChooseScope"]=typeof reminderLocalChooseScope!=='undefined'?reminderLocalChooseScope:root["reminderLocalChooseScope"];
  root["reminderLocalClone"]=typeof reminderLocalClone!=='undefined'?reminderLocalClone:root["reminderLocalClone"];
  root["reminderLocalMergeList"]=typeof reminderLocalMergeList!=='undefined'?reminderLocalMergeList:root["reminderLocalMergeList"];
  root["reminderLocalMergePreference"]=typeof reminderLocalMergePreference!=='undefined'?reminderLocalMergePreference:root["reminderLocalMergePreference"];
  root["reminderLocalMeta"]=typeof reminderLocalMeta!=='undefined'?reminderLocalMeta:root["reminderLocalMeta"];
  root["reminderLocalStamp"]=typeof reminderLocalStamp!=='undefined'?reminderLocalStamp:root["reminderLocalStamp"];
  root["reminderLocalTouch"]=typeof reminderLocalTouch!=='undefined'?reminderLocalTouch:root["reminderLocalTouch"];
  root["reminderLockBodyScroll"]=typeof reminderLockBodyScroll!=='undefined'?reminderLockBodyScroll:root["reminderLockBodyScroll"];
  root["reminderMedicationClearHistory"]=typeof reminderMedicationClearHistory!=='undefined'?reminderMedicationClearHistory:root["reminderMedicationClearHistory"];
  root["reminderMedicationCurrentList"]=typeof reminderMedicationCurrentList!=='undefined'?reminderMedicationCurrentList:root["reminderMedicationCurrentList"];
  root["reminderMedicationDefinition"]=typeof reminderMedicationDefinition!=='undefined'?reminderMedicationDefinition:root["reminderMedicationDefinition"];
  root["reminderMedicationDraftFromSchedule"]=typeof reminderMedicationDraftFromSchedule!=='undefined'?reminderMedicationDraftFromSchedule:root["reminderMedicationDraftFromSchedule"];
  root["reminderMedicationDraftState"]=typeof reminderMedicationDraftState!=='undefined'?reminderMedicationDraftState:root["reminderMedicationDraftState"];
  root["reminderMedicationFailure"]=typeof reminderMedicationFailure!=='undefined'?reminderMedicationFailure:root["reminderMedicationFailure"];
  root["reminderMedicationHistoryMatches"]=typeof reminderMedicationHistoryMatches!=='undefined'?reminderMedicationHistoryMatches:root["reminderMedicationHistoryMatches"];
  root["reminderMedicationId"]=typeof reminderMedicationId!=='undefined'?reminderMedicationId:root["reminderMedicationId"];
  root["reminderMedicationKindLabel"]=typeof reminderMedicationKindLabel!=='undefined'?reminderMedicationKindLabel:root["reminderMedicationKindLabel"];
  root["reminderMedicationLifecycleCandidates"]=typeof reminderMedicationLifecycleCandidates!=='undefined'?reminderMedicationLifecycleCandidates:root["reminderMedicationLifecycleCandidates"];
  root["reminderMedicationNativeCopy"]=typeof reminderMedicationNativeCopy!=='undefined'?reminderMedicationNativeCopy:root["reminderMedicationNativeCopy"];
  root["reminderMedicationNewId"]=typeof reminderMedicationNewId!=='undefined'?reminderMedicationNewId:root["reminderMedicationNewId"];
  root["reminderMedicationOccurrence"]=typeof reminderMedicationOccurrence!=='undefined'?reminderMedicationOccurrence:root["reminderMedicationOccurrence"];
  root["reminderMedicationPolicyPreference"]=typeof reminderMedicationPolicyPreference!=='undefined'?reminderMedicationPolicyPreference:root["reminderMedicationPolicyPreference"];
  root["reminderMedicationPrivateCopy"]=typeof reminderMedicationPrivateCopy!=='undefined'?reminderMedicationPrivateCopy:root["reminderMedicationPrivateCopy"];
  root["reminderMedicationScheduleById"]=typeof reminderMedicationScheduleById!=='undefined'?reminderMedicationScheduleById:root["reminderMedicationScheduleById"];
  root["reminderMedicationSectionHTML"]=typeof reminderMedicationSectionHTML!=='undefined'?reminderMedicationSectionHTML:root["reminderMedicationSectionHTML"];
  root["reminderMedicationText"]=typeof reminderMedicationText!=='undefined'?reminderMedicationText:root["reminderMedicationText"];
  root["reminderMergeProfileSuggestions"]=typeof reminderMergeProfileSuggestions!=='undefined'?reminderMergeProfileSuggestions:root["reminderMergeProfileSuggestions"];
  root["reminderNativeActionList"]=typeof reminderNativeActionList!=='undefined'?reminderNativeActionList:root["reminderNativeActionList"];
  root["reminderNativeDeliveryCopy"]=typeof reminderNativeDeliveryCopy!=='undefined'?reminderNativeDeliveryCopy:root["reminderNativeDeliveryCopy"];
  root["reminderNativeDisplay"]=typeof reminderNativeDisplay!=='undefined'?reminderNativeDisplay:root["reminderNativeDisplay"];
  root["reminderNativePayload"]=typeof reminderNativePayload!=='undefined'?reminderNativePayload:root["reminderNativePayload"];
  root["reminderNativeSafeCopy"]=typeof reminderNativeSafeCopy!=='undefined'?reminderNativeSafeCopy:root["reminderNativeSafeCopy"];
  root["reminderNativeTag"]=typeof reminderNativeTag!=='undefined'?reminderNativeTag:root["reminderNativeTag"];
  root["reminderNativeTargetView"]=typeof reminderNativeTargetView!=='undefined'?reminderNativeTargetView:root["reminderNativeTargetView"];
  root["reminderNotificationChannel"]=typeof reminderNotificationChannel!=='undefined'?reminderNotificationChannel:root["reminderNotificationChannel"];
  root["reminderPermissionCanRequest"]=typeof reminderPermissionCanRequest!=='undefined'?reminderPermissionCanRequest:root["reminderPermissionCanRequest"];
  root["reminderPermissionEverGrantedRead"]=typeof reminderPermissionEverGrantedRead!=='undefined'?reminderPermissionEverGrantedRead:root["reminderPermissionEverGrantedRead"];
  root["reminderPermissionExplanation"]=typeof reminderPermissionExplanation!=='undefined'?reminderPermissionExplanation:root["reminderPermissionExplanation"];
  root["reminderPermissionExplanationHTML"]=typeof reminderPermissionExplanationHTML!=='undefined'?reminderPermissionExplanationHTML:root["reminderPermissionExplanationHTML"];
  root["reminderPermissionRecord"]=typeof reminderPermissionRecord!=='undefined'?reminderPermissionRecord:root["reminderPermissionRecord"];
  root["reminderPermissionRequest"]=typeof reminderPermissionRequest!=='undefined'?reminderPermissionRequest:root["reminderPermissionRequest"];
  root["reminderPermissionSnapshot"]=typeof reminderPermissionSnapshot!=='undefined'?reminderPermissionSnapshot:root["reminderPermissionSnapshot"];
  root["reminderPermissionState"]=typeof reminderPermissionState!=='undefined'?reminderPermissionState:root["reminderPermissionState"];
  root["reminderPermissionStorageRead"]=typeof reminderPermissionStorageRead!=='undefined'?reminderPermissionStorageRead:root["reminderPermissionStorageRead"];
  root["reminderPermissionStorageWrite"]=typeof reminderPermissionStorageWrite!=='undefined'?reminderPermissionStorageWrite:root["reminderPermissionStorageWrite"];
  root["reminderPersonalizationAppliedNormalize"]=typeof reminderPersonalizationAppliedNormalize!=='undefined'?reminderPersonalizationAppliedNormalize:root["reminderPersonalizationAppliedNormalize"];
  root["reminderPersonalizationApplySuggestion"]=typeof reminderPersonalizationApplySuggestion!=='undefined'?reminderPersonalizationApplySuggestion:root["reminderPersonalizationApplySuggestion"];
  root["reminderPersonalizationClone"]=typeof reminderPersonalizationClone!=='undefined'?reminderPersonalizationClone:root["reminderPersonalizationClone"];
  root["reminderPersonalizationCommit"]=typeof reminderPersonalizationCommit!=='undefined'?reminderPersonalizationCommit:root["reminderPersonalizationCommit"];
  root["reminderPersonalizationDismissSuggestion"]=typeof reminderPersonalizationDismissSuggestion!=='undefined'?reminderPersonalizationDismissSuggestion:root["reminderPersonalizationDismissSuggestion"];
  root["reminderPersonalizationHTML"]=typeof reminderPersonalizationHTML!=='undefined'?reminderPersonalizationHTML:root["reminderPersonalizationHTML"];
  root["reminderPersonalizationPreference"]=typeof reminderPersonalizationPreference!=='undefined'?reminderPersonalizationPreference:root["reminderPersonalizationPreference"];
  root["reminderPersonalizationReasonLabel"]=typeof reminderPersonalizationReasonLabel!=='undefined'?reminderPersonalizationReasonLabel:root["reminderPersonalizationReasonLabel"];
  root["reminderPersonalizationReminderId"]=typeof reminderPersonalizationReminderId!=='undefined'?reminderPersonalizationReminderId:root["reminderPersonalizationReminderId"];
  root["reminderPersonalizationReset"]=typeof reminderPersonalizationReset!=='undefined'?reminderPersonalizationReset:root["reminderPersonalizationReset"];
  root["reminderPersonalizationSafeToken"]=typeof reminderPersonalizationSafeToken!=='undefined'?reminderPersonalizationSafeToken:root["reminderPersonalizationSafeToken"];
  root["reminderPersonalizationSetHistoryMode"]=typeof reminderPersonalizationSetHistoryMode!=='undefined'?reminderPersonalizationSetHistoryMode:root["reminderPersonalizationSetHistoryMode"];
  root["reminderPersonalizationSetOptIn"]=typeof reminderPersonalizationSetOptIn!=='undefined'?reminderPersonalizationSetOptIn:root["reminderPersonalizationSetOptIn"];
  root["reminderPersonalizationSignalNormalize"]=typeof reminderPersonalizationSignalNormalize!=='undefined'?reminderPersonalizationSignalNormalize:root["reminderPersonalizationSignalNormalize"];
  root["reminderPersonalizationSignalRecord"]=typeof reminderPersonalizationSignalRecord!=='undefined'?reminderPersonalizationSignalRecord:root["reminderPersonalizationSignalRecord"];
  root["reminderPersonalizationSignalSource"]=typeof reminderPersonalizationSignalSource!=='undefined'?reminderPersonalizationSignalSource:root["reminderPersonalizationSignalSource"];
  root["reminderPersonalizationSignalValue"]=typeof reminderPersonalizationSignalValue!=='undefined'?reminderPersonalizationSignalValue:root["reminderPersonalizationSignalValue"];
  root["reminderPersonalizationSourceLabel"]=typeof reminderPersonalizationSourceLabel!=='undefined'?reminderPersonalizationSourceLabel:root["reminderPersonalizationSourceLabel"];
  root["reminderPersonalizationSourceSignals"]=typeof reminderPersonalizationSourceSignals!=='undefined'?reminderPersonalizationSourceSignals:root["reminderPersonalizationSourceSignals"];
  root["reminderPersonalizationState"]=typeof reminderPersonalizationState!=='undefined'?reminderPersonalizationState:root["reminderPersonalizationState"];
  root["reminderPersonalizationSuggestions"]=typeof reminderPersonalizationSuggestions!=='undefined'?reminderPersonalizationSuggestions:root["reminderPersonalizationSuggestions"];
  root["reminderPersonalizationUndoSuggestion"]=typeof reminderPersonalizationUndoSuggestion!=='undefined'?reminderPersonalizationUndoSuggestion:root["reminderPersonalizationUndoSuggestion"];
  root["reminderPolicyEvaluate"]=typeof reminderPolicyEvaluate!=='undefined'?reminderPolicyEvaluate:root["reminderPolicyEvaluate"];
  root["reminderPolicyInputParts"]=typeof reminderPolicyInputParts!=='undefined'?reminderPolicyInputParts:root["reminderPolicyInputParts"];
  root["reminderPolicyInteger"]=typeof reminderPolicyInteger!=='undefined'?reminderPolicyInteger:root["reminderPolicyInteger"];
  root["reminderPolicyMode"]=typeof reminderPolicyMode!=='undefined'?reminderPolicyMode:root["reminderPolicyMode"];
  root["reminderPolicyPriority"]=typeof reminderPolicyPriority!=='undefined'?reminderPolicyPriority:root["reminderPolicyPriority"];
  root["reminderPolicyRecentCategoryAge"]=typeof reminderPolicyRecentCategoryAge!=='undefined'?reminderPolicyRecentCategoryAge:root["reminderPolicyRecentCategoryAge"];
  root["reminderPolicyRecentCategoryCooldown"]=typeof reminderPolicyRecentCategoryCooldown!=='undefined'?reminderPolicyRecentCategoryCooldown:root["reminderPolicyRecentCategoryCooldown"];
  root["reminderPolicySelectNativeCandidates"]=typeof reminderPolicySelectNativeCandidates!=='undefined'?reminderPolicySelectNativeCandidates:root["reminderPolicySelectNativeCandidates"];
  root["reminderPolicySelectedCategories"]=typeof reminderPolicySelectedCategories!=='undefined'?reminderPolicySelectedCategories:root["reminderPolicySelectedCategories"];
  root["reminderPolicyTimeMinutes"]=typeof reminderPolicyTimeMinutes!=='undefined'?reminderPolicyTimeMinutes:root["reminderPolicyTimeMinutes"];
  root["reminderPrayerFailure"]=typeof reminderPrayerFailure!=='undefined'?reminderPrayerFailure:root["reminderPrayerFailure"];
  root["reminderPrayerLifecycleInput"]=typeof reminderPrayerLifecycleInput!=='undefined'?reminderPrayerLifecycleInput:root["reminderPrayerLifecycleInput"];
  root["reminderPrayerLifecycleKeys"]=typeof reminderPrayerLifecycleKeys!=='undefined'?reminderPrayerLifecycleKeys:root["reminderPrayerLifecycleKeys"];
  root["reminderPrayerOccurrence"]=typeof reminderPrayerOccurrence!=='undefined'?reminderPrayerOccurrence:root["reminderPrayerOccurrence"];
  root["reminderPrayerOccurrences"]=typeof reminderPrayerOccurrences!=='undefined'?reminderPrayerOccurrences:root["reminderPrayerOccurrences"];
  root["reminderPrayerOffsetInput"]=typeof reminderPrayerOffsetInput!=='undefined'?reminderPrayerOffsetInput:root["reminderPrayerOffsetInput"];
  root["reminderPrayerPrivateCopy"]=typeof reminderPrayerPrivateCopy!=='undefined'?reminderPrayerPrivateCopy:root["reminderPrayerPrivateCopy"];
  root["reminderPrayerSelectedKeys"]=typeof reminderPrayerSelectedKeys!=='undefined'?reminderPrayerSelectedKeys:root["reminderPrayerSelectedKeys"];
  root["reminderPrayerSource"]=typeof reminderPrayerSource!=='undefined'?reminderPrayerSource:root["reminderPrayerSource"];
  root["reminderPrayerSourceForDate"]=typeof reminderPrayerSourceForDate!=='undefined'?reminderPrayerSourceForDate:root["reminderPrayerSourceForDate"];
  root["reminderPreviewNotification"]=typeof reminderPreviewNotification!=='undefined'?reminderPreviewNotification:root["reminderPreviewNotification"];
  root["reminderPreviewSafeCopy"]=typeof reminderPreviewSafeCopy!=='undefined'?reminderPreviewSafeCopy:root["reminderPreviewSafeCopy"];
  root["reminderPrivacyHasContent"]=typeof reminderPrivacyHasContent!=='undefined'?reminderPrivacyHasContent:root["reminderPrivacyHasContent"];
  root["reminderPrivacyReport"]=typeof reminderPrivacyReport!=='undefined'?reminderPrivacyReport:root["reminderPrivacyReport"];
  root["reminderPrivacySchemas"]=typeof reminderPrivacySchemas!=='undefined'?reminderPrivacySchemas:root["reminderPrivacySchemas"];
  root["reminderPrivacyWalk"]=typeof reminderPrivacyWalk!=='undefined'?reminderPrivacyWalk:root["reminderPrivacyWalk"];
  root["reminderProfileById"]=typeof reminderProfileById!=='undefined'?reminderProfileById:root["reminderProfileById"];
  root["reminderProfileChannel"]=typeof reminderProfileChannel!=='undefined'?reminderProfileChannel:root["reminderProfileChannel"];
  root["reminderProfileSectionHTML"]=typeof reminderProfileSectionHTML!=='undefined'?reminderProfileSectionHTML:root["reminderProfileSectionHTML"];
  root["reminderQuietHoursState"]=typeof reminderQuietHoursState!=='undefined'?reminderQuietHoursState:root["reminderQuietHoursState"];
  root["reminderRemoveLocalKey"]=typeof reminderRemoveLocalKey!=='undefined'?reminderRemoveLocalKey:root["reminderRemoveLocalKey"];
  root["reminderRenderAction"]=typeof reminderRenderAction!=='undefined'?reminderRenderAction:root["reminderRenderAction"];
  root["reminderRestoreFocus"]=typeof reminderRestoreFocus!=='undefined'?reminderRestoreFocus:root["reminderRestoreFocus"];
  root["reminderRetentionPolicySnapshot"]=typeof reminderRetentionPolicySnapshot!=='undefined'?reminderRetentionPolicySnapshot:root["reminderRetentionPolicySnapshot"];
  root["reminderRetentionSummary"]=typeof reminderRetentionSummary!=='undefined'?reminderRetentionSummary:root["reminderRetentionSummary"];
  root["reminderSaygiArticleState"]=typeof reminderSaygiArticleState!=='undefined'?reminderSaygiArticleState:root["reminderSaygiArticleState"];
  root["reminderSaygiDaysAllowed"]=typeof reminderSaygiDaysAllowed!=='undefined'?reminderSaygiDaysAllowed:root["reminderSaygiDaysAllowed"];
  root["reminderSaygiDefinition"]=typeof reminderSaygiDefinition!=='undefined'?reminderSaygiDefinition:root["reminderSaygiDefinition"];
  root["reminderSaygiFailure"]=typeof reminderSaygiFailure!=='undefined'?reminderSaygiFailure:root["reminderSaygiFailure"];
  root["reminderSaygiFrequency"]=typeof reminderSaygiFrequency!=='undefined'?reminderSaygiFrequency:root["reminderSaygiFrequency"];
  root["reminderSaygiLifecycleCandidates"]=typeof reminderSaygiLifecycleCandidates!=='undefined'?reminderSaygiLifecycleCandidates:root["reminderSaygiLifecycleCandidates"];
  root["reminderSaygiOccurrence"]=typeof reminderSaygiOccurrence!=='undefined'?reminderSaygiOccurrence:root["reminderSaygiOccurrence"];
  root["reminderSaygiPerson"]=typeof reminderSaygiPerson!=='undefined'?reminderSaygiPerson:root["reminderSaygiPerson"];
  root["reminderSaygiPolicyPreference"]=typeof reminderSaygiPolicyPreference!=='undefined'?reminderSaygiPolicyPreference:root["reminderSaygiPolicyPreference"];
  root["reminderSaygiPrivateCopy"]=typeof reminderSaygiPrivateCopy!=='undefined'?reminderSaygiPrivateCopy:root["reminderSaygiPrivateCopy"];
  root["reminderSaygiReadState"]=typeof reminderSaygiReadState!=='undefined'?reminderSaygiReadState:root["reminderSaygiReadState"];
  root["reminderSaygiWeekday"]=typeof reminderSaygiWeekday!=='undefined'?reminderSaygiWeekday:root["reminderSaygiWeekday"];
  root["reminderSaygiWindow"]=typeof reminderSaygiWindow!=='undefined'?reminderSaygiWindow:root["reminderSaygiWindow"];
  root["reminderSaygiWindowDue"]=typeof reminderSaygiWindowDue!=='undefined'?reminderSaygiWindowDue:root["reminderSaygiWindowDue"];
  root["reminderSchedulerDispatch"]=typeof reminderSchedulerDispatch!=='undefined'?reminderSchedulerDispatch:root["reminderSchedulerDispatch"];
  root["reminderSchedulerEnsure"]=typeof reminderSchedulerEnsure!=='undefined'?reminderSchedulerEnsure:root["reminderSchedulerEnsure"];
  root["reminderSchedulerFallbackCreate"]=typeof reminderSchedulerFallbackCreate!=='undefined'?reminderSchedulerFallbackCreate:root["reminderSchedulerFallbackCreate"];
  root["reminderSchedulerSnapshot"]=typeof reminderSchedulerSnapshot!=='undefined'?reminderSchedulerSnapshot:root["reminderSchedulerSnapshot"];
  root["reminderSchemaCompatibility"]=typeof reminderSchemaCompatibility!=='undefined'?reminderSchemaCompatibility:root["reminderSchemaCompatibility"];
  root["reminderSchemaStatusForData"]=typeof reminderSchemaStatusForData!=='undefined'?reminderSchemaStatusForData:root["reminderSchemaStatusForData"];
  root["reminderServiceWorkerClickPayload"]=typeof reminderServiceWorkerClickPayload!=='undefined'?reminderServiceWorkerClickPayload:root["reminderServiceWorkerClickPayload"];
  root["reminderSetEnabled"]=typeof reminderSetEnabled!=='undefined'?reminderSetEnabled:root["reminderSetEnabled"];
  root["reminderSnoozePlan"]=typeof reminderSnoozePlan!=='undefined'?reminderSnoozePlan:root["reminderSnoozePlan"];
  root["reminderSpecialDayDefinition"]=typeof reminderSpecialDayDefinition!=='undefined'?reminderSpecialDayDefinition:root["reminderSpecialDayDefinition"];
  root["reminderSpecialDayFailure"]=typeof reminderSpecialDayFailure!=='undefined'?reminderSpecialDayFailure:root["reminderSpecialDayFailure"];
  root["reminderSpecialDayId"]=typeof reminderSpecialDayId!=='undefined'?reminderSpecialDayId:root["reminderSpecialDayId"];
  root["reminderSpecialDayLifecycleCandidates"]=typeof reminderSpecialDayLifecycleCandidates!=='undefined'?reminderSpecialDayLifecycleCandidates:root["reminderSpecialDayLifecycleCandidates"];
  root["reminderSpecialDayLookup"]=typeof reminderSpecialDayLookup!=='undefined'?reminderSpecialDayLookup:root["reminderSpecialDayLookup"];
  root["reminderSpecialDayOccurrence"]=typeof reminderSpecialDayOccurrence!=='undefined'?reminderSpecialDayOccurrence:root["reminderSpecialDayOccurrence"];
  root["reminderSpecialDayOffset"]=typeof reminderSpecialDayOffset!=='undefined'?reminderSpecialDayOffset:root["reminderSpecialDayOffset"];
  root["reminderSpecialDayOptionById"]=typeof reminderSpecialDayOptionById!=='undefined'?reminderSpecialDayOptionById:root["reminderSpecialDayOptionById"];
  root["reminderSpecialDayPolicyPreference"]=typeof reminderSpecialDayPolicyPreference!=='undefined'?reminderSpecialDayPolicyPreference:root["reminderSpecialDayPolicyPreference"];
  root["reminderSpecialDaysCommit"]=typeof reminderSpecialDaysCommit!=='undefined'?reminderSpecialDaysCommit:root["reminderSpecialDaysCommit"];
  root["reminderSpecialDaysSectionHTML"]=typeof reminderSpecialDaysSectionHTML!=='undefined'?reminderSpecialDaysSectionHTML:root["reminderSpecialDaysSectionHTML"];
  root["reminderSpecialDaysState"]=typeof reminderSpecialDaysState!=='undefined'?reminderSpecialDaysState:root["reminderSpecialDaysState"];
  root["reminderStateContract"]=typeof reminderStateContract!=='undefined'?reminderStateContract:root["reminderStateContract"];
  root["reminderSurfaceRoot"]=typeof reminderSurfaceRoot!=='undefined'?reminderSurfaceRoot:root["reminderSurfaceRoot"];
  root["reminderSurfaceState"]=typeof reminderSurfaceState!=='undefined'?reminderSurfaceState:root["reminderSurfaceState"];
  root["reminderSurfaceTable"]=typeof reminderSurfaceTable!=='undefined'?reminderSurfaceTable:root["reminderSurfaceTable"];
  root["reminderSyncPayload"]=typeof reminderSyncPayload!=='undefined'?reminderSyncPayload:root["reminderSyncPayload"];
  root["reminderSystemLocalDate"]=typeof reminderSystemLocalDate!=='undefined'?reminderSystemLocalDate:root["reminderSystemLocalDate"];
  root["reminderSystemOffline"]=typeof reminderSystemOffline!=='undefined'?reminderSystemOffline:root["reminderSystemOffline"];
  root["reminderSystemPrayerStatus"]=typeof reminderSystemPrayerStatus!=='undefined'?reminderSystemPrayerStatus:root["reminderSystemPrayerStatus"];
  root["reminderSystemStatus"]=typeof reminderSystemStatus!=='undefined'?reminderSystemStatus:root["reminderSystemStatus"];
  root["reminderSystemStatusCopy"]=typeof reminderSystemStatusCopy!=='undefined'?reminderSystemStatusCopy:root["reminderSystemStatusCopy"];
  root["reminderSystemStatusHTML"]=typeof reminderSystemStatusHTML!=='undefined'?reminderSystemStatusHTML:root["reminderSystemStatusHTML"];
  root["reminderSystemSyncStatus"]=typeof reminderSystemSyncStatus!=='undefined'?reminderSystemSyncStatus:root["reminderSystemSyncStatus"];
  root["reminderTestPreviewHTML"]=typeof reminderTestPreviewHTML!=='undefined'?reminderTestPreviewHTML:root["reminderTestPreviewHTML"];
  root["reminderTherapyDaysAllowed"]=typeof reminderTherapyDaysAllowed!=='undefined'?reminderTherapyDaysAllowed:root["reminderTherapyDaysAllowed"];
  root["reminderTherapyDefinition"]=typeof reminderTherapyDefinition!=='undefined'?reminderTherapyDefinition:root["reminderTherapyDefinition"];
  root["reminderTherapyFailure"]=typeof reminderTherapyFailure!=='undefined'?reminderTherapyFailure:root["reminderTherapyFailure"];
  root["reminderTherapyFrequency"]=typeof reminderTherapyFrequency!=='undefined'?reminderTherapyFrequency:root["reminderTherapyFrequency"];
  root["reminderTherapyLifecycleCandidates"]=typeof reminderTherapyLifecycleCandidates!=='undefined'?reminderTherapyLifecycleCandidates:root["reminderTherapyLifecycleCandidates"];
  root["reminderTherapyLocalContext"]=typeof reminderTherapyLocalContext!=='undefined'?reminderTherapyLocalContext:root["reminderTherapyLocalContext"];
  root["reminderTherapyOccurrence"]=typeof reminderTherapyOccurrence!=='undefined'?reminderTherapyOccurrence:root["reminderTherapyOccurrence"];
  root["reminderTherapyOccurrenceId"]=typeof reminderTherapyOccurrenceId!=='undefined'?reminderTherapyOccurrenceId:root["reminderTherapyOccurrenceId"];
  root["reminderTherapyPolicyPreference"]=typeof reminderTherapyPolicyPreference!=='undefined'?reminderTherapyPolicyPreference:root["reminderTherapyPolicyPreference"];
  root["reminderTherapyPreferenceSelected"]=typeof reminderTherapyPreferenceSelected!=='undefined'?reminderTherapyPreferenceSelected:root["reminderTherapyPreferenceSelected"];
  root["reminderTherapyPrivateCopy"]=typeof reminderTherapyPrivateCopy!=='undefined'?reminderTherapyPrivateCopy:root["reminderTherapyPrivateCopy"];
  root["reminderTherapySelectedTool"]=typeof reminderTherapySelectedTool!=='undefined'?reminderTherapySelectedTool:root["reminderTherapySelectedTool"];
  root["reminderTherapyToolFromValue"]=typeof reminderTherapyToolFromValue!=='undefined'?reminderTherapyToolFromValue:root["reminderTherapyToolFromValue"];
  root["reminderTherapyToolId"]=typeof reminderTherapyToolId!=='undefined'?reminderTherapyToolId:root["reminderTherapyToolId"];
  root["reminderTherapyWeekday"]=typeof reminderTherapyWeekday!=='undefined'?reminderTherapyWeekday:root["reminderTherapyWeekday"];
  root["reminderTherapyWindow"]=typeof reminderTherapyWindow!=='undefined'?reminderTherapyWindow:root["reminderTherapyWindow"];
  root["reminderTherapyWindowDue"]=typeof reminderTherapyWindowDue!=='undefined'?reminderTherapyWindowDue:root["reminderTherapyWindowDue"];
  root["reminderUnlockBodyScroll"]=typeof reminderUnlockBodyScroll!=='undefined'?reminderUnlockBodyScroll:root["reminderUnlockBodyScroll"];
  root["reminderWindowLabel"]=typeof reminderWindowLabel!=='undefined'?reminderWindowLabel:root["reminderWindowLabel"];
  root["reminderZikrDailyOccurrence"]=typeof reminderZikrDailyOccurrence!=='undefined'?reminderZikrDailyOccurrence:root["reminderZikrDailyOccurrence"];
  root["reminderZikrDaysAllowed"]=typeof reminderZikrDaysAllowed!=='undefined'?reminderZikrDaysAllowed:root["reminderZikrDaysAllowed"];
  root["reminderZikrDefinition"]=typeof reminderZikrDefinition!=='undefined'?reminderZikrDefinition:root["reminderZikrDefinition"];
  root["reminderZikrFailure"]=typeof reminderZikrFailure!=='undefined'?reminderZikrFailure:root["reminderZikrFailure"];
  root["reminderZikrFeatureEnabled"]=typeof reminderZikrFeatureEnabled!=='undefined'?reminderZikrFeatureEnabled:root["reminderZikrFeatureEnabled"];
  root["reminderZikrJourneyActive"]=typeof reminderZikrJourneyActive!=='undefined'?reminderZikrJourneyActive:root["reminderZikrJourneyActive"];
  root["reminderZikrJourneyEntry"]=typeof reminderZikrJourneyEntry!=='undefined'?reminderZikrJourneyEntry:root["reminderZikrJourneyEntry"];
  root["reminderZikrJourneyOccurrence"]=typeof reminderZikrJourneyOccurrence!=='undefined'?reminderZikrJourneyOccurrence:root["reminderZikrJourneyOccurrence"];
  root["reminderZikrLifecycleCandidates"]=typeof reminderZikrLifecycleCandidates!=='undefined'?reminderZikrLifecycleCandidates:root["reminderZikrLifecycleCandidates"];
  root["reminderZikrLocalContext"]=typeof reminderZikrLocalContext!=='undefined'?reminderZikrLocalContext:root["reminderZikrLocalContext"];
  root["reminderZikrMakeOccurrence"]=typeof reminderZikrMakeOccurrence!=='undefined'?reminderZikrMakeOccurrence:root["reminderZikrMakeOccurrence"];
  root["reminderZikrOccurrenceId"]=typeof reminderZikrOccurrenceId!=='undefined'?reminderZikrOccurrenceId:root["reminderZikrOccurrenceId"];
  root["reminderZikrOccurrences"]=typeof reminderZikrOccurrences!=='undefined'?reminderZikrOccurrences:root["reminderZikrOccurrences"];
  root["reminderZikrPreferenceSelected"]=typeof reminderZikrPreferenceSelected!=='undefined'?reminderZikrPreferenceSelected:root["reminderZikrPreferenceSelected"];
  root["reminderZikrReflectionOccurrence"]=typeof reminderZikrReflectionOccurrence!=='undefined'?reminderZikrReflectionOccurrence:root["reminderZikrReflectionOccurrence"];
  root["reminderZikrReflectionPolicy"]=typeof reminderZikrReflectionPolicy!=='undefined'?reminderZikrReflectionPolicy:root["reminderZikrReflectionPolicy"];
  root["reminderZikrSource"]=typeof reminderZikrSource!=='undefined'?reminderZikrSource:root["reminderZikrSource"];
  root["reminderZikrWeekday"]=typeof reminderZikrWeekday!=='undefined'?reminderZikrWeekday:root["reminderZikrWeekday"];
  root["reminderZikrWindow"]=typeof reminderZikrWindow!=='undefined'?reminderZikrWindow:root["reminderZikrWindow"];
  root["reminderZikrWindowDue"]=typeof reminderZikrWindowDue!=='undefined'?reminderZikrWindowDue:root["reminderZikrWindowDue"];
  root["stepReminder"]=typeof stepReminder!=='undefined'?stepReminder:root["stepReminder"];
  root["stripReminderReservedRoots"]=typeof stripReminderReservedRoots!=='undefined'?stripReminderReservedRoots:root["stripReminderReservedRoots"];
  root["updateReminderPolicy"]=typeof updateReminderPolicy!=='undefined'?updateReminderPolicy:root["updateReminderPolicy"];
  root["validReminderIso"]=typeof validReminderIso!=='undefined'?validReminderIso:root["validReminderIso"];
  root["validReminderTime"]=typeof validReminderTime!=='undefined'?validReminderTime:root["validReminderTime"];
  root["validReminderTimezone"]=typeof validReminderTimezone!=='undefined'?validReminderTimezone:root["validReminderTimezone"];
  root.SeymaReminders=Object.freeze({
    registerReminders:registerReminders,
    reminderDefinitions:reminderDefinitions,
    reminderCopy:reminderCopy,
    reminderPolicyTimeMinutes:reminderPolicyTimeMinutes,
    reminderQuietHoursState:reminderQuietHoursState,
    reminderPolicySelectedCategories:reminderPolicySelectedCategories,
    reminderPolicyRecentCategoryAge:reminderPolicyRecentCategoryAge,
    reminderPolicyRecentCategoryCooldown:reminderPolicyRecentCategoryCooldown,
    reminderPolicyPriority:reminderPolicyPriority,
    reminderPolicyMode:reminderPolicyMode,
    reminderPolicyInputParts:reminderPolicyInputParts,
    reminderPolicyEvaluate:reminderPolicyEvaluate,
    reminderPolicySelectNativeCandidates:reminderPolicySelectNativeCandidates,
    reminderEngineLocalParts:reminderEngineLocalParts,
    reminderEngineGenerateOccurrence:reminderEngineGenerateOccurrence,
    reminderSchedulerCreate:reminderSchedulerCreate,
    reminderWindowLabel:reminderWindowLabel,
    reminderChannelLabel:reminderChannelLabel,
    reminderCategoryState:reminderCategoryState,
    reminderCategoryChannelLabel:reminderCategoryChannelLabel,
    reminderCapacityModeLabel:reminderCapacityModeLabel,
    reminderCenterClone:reminderCenterClone,
    reminderCenterEnabledCount:reminderCenterEnabledCount,
    reminderCardHTML:reminderCardHTML,
    reminderCenterOverlayHTML:reminderCenterOverlayHTML,
    reminderDeliveryModule:typeof reminderDeliveryModule!=='undefined'?reminderDeliveryModule:undefined,
    reminderNotificationChannel:typeof reminderNotificationChannel!=='undefined'?reminderNotificationChannel:undefined,
    emptyReminderPolicy:typeof emptyReminderPolicy!=='undefined'?emptyReminderPolicy:undefined,
    emptyReminderPersonalization:typeof emptyReminderPersonalization!=='undefined'?emptyReminderPersonalization:undefined,
    emptyReminderState:typeof emptyReminderState!=='undefined'?emptyReminderState:undefined,
    reminderLocalClone:typeof reminderLocalClone!=='undefined'?reminderLocalClone:undefined,
    stripReminderReservedRoots:typeof stripReminderReservedRoots!=='undefined'?stripReminderReservedRoots:undefined,
    reminderRetentionPolicySnapshot:typeof reminderRetentionPolicySnapshot!=='undefined'?reminderRetentionPolicySnapshot:undefined,
    reminderLocalMeta:typeof reminderLocalMeta!=='undefined'?reminderLocalMeta:undefined,
    reminderLocalTouch:typeof reminderLocalTouch!=='undefined'?reminderLocalTouch:undefined,
    mergeReminderLocalState:typeof mergeReminderLocalState!=='undefined'?mergeReminderLocalState:undefined,
    reminderMedicationText:typeof reminderMedicationText!=='undefined'?reminderMedicationText:undefined,
    normalizeReminderMedication:typeof normalizeReminderMedication!=='undefined'?normalizeReminderMedication:undefined,
    normalizeReminderMedications:typeof normalizeReminderMedications!=='undefined'?normalizeReminderMedications:undefined,
    normalizeReminderProfile:typeof normalizeReminderProfile!=='undefined'?normalizeReminderProfile:undefined,
    normalizeReminderCategories:typeof normalizeReminderCategories!=='undefined'?normalizeReminderCategories:undefined,
    normalizeReminderCareCategories:typeof normalizeReminderCareCategories!=='undefined'?normalizeReminderCareCategories:undefined,
    reminderSpecialDayOptionById:typeof reminderSpecialDayOptionById!=='undefined'?reminderSpecialDayOptionById:undefined,
    normalizeReminderSpecialDaySelection:typeof normalizeReminderSpecialDaySelection!=='undefined'?normalizeReminderSpecialDaySelection:undefined,
    normalizeReminderSpecialDays:typeof normalizeReminderSpecialDays!=='undefined'?normalizeReminderSpecialDays:undefined,
    normalizeReminderOnboarding:typeof normalizeReminderOnboarding!=='undefined'?normalizeReminderOnboarding:undefined,
    reminderPermissionExplanation:typeof reminderPermissionExplanation!=='undefined'?reminderPermissionExplanation:undefined,
    reminderNativeSafeCopy:typeof reminderNativeSafeCopy!=='undefined'?reminderNativeSafeCopy:undefined,
    reminderNativeActionList:typeof reminderNativeActionList!=='undefined'?reminderNativeActionList:undefined,
    reminderNativeTag:typeof reminderNativeTag!=='undefined'?reminderNativeTag:undefined,
    reminderNativeDeliveryCopy:typeof reminderNativeDeliveryCopy!=='undefined'?reminderNativeDeliveryCopy:undefined,
    reminderNativePayload:typeof reminderNativePayload!=='undefined'?reminderNativePayload:undefined,
    reminderProfileById:typeof reminderProfileById!=='undefined'?reminderProfileById:undefined,
    reminderCategoryIds:typeof reminderCategoryIds!=='undefined'?reminderCategoryIds:undefined,
    reminderCategoryMeta:typeof reminderCategoryMeta!=='undefined'?reminderCategoryMeta:undefined,
    reminderCategorySelection:typeof reminderCategorySelection!=='undefined'?reminderCategorySelection:undefined,
    reminderMergeProfileSuggestions:typeof reminderMergeProfileSuggestions!=='undefined'?reminderMergeProfileSuggestions:undefined,
    reminderEnsurePreference:typeof reminderEnsurePreference!=='undefined'?reminderEnsurePreference:undefined,
    reminderSpecialDaysState:typeof reminderSpecialDaysState!=='undefined'?reminderSpecialDaysState:undefined,
    reminderSpecialDaysCommit:typeof reminderSpecialDaysCommit!=='undefined'?reminderSpecialDaysCommit:undefined,
    validReminderTime:typeof validReminderTime!=='undefined'?validReminderTime:undefined,
    validReminderIso:typeof validReminderIso!=='undefined'?validReminderIso:undefined,
    reminderEnumHas:typeof reminderEnumHas!=='undefined'?reminderEnumHas:undefined,
    normalizeReminderPreference:typeof normalizeReminderPreference!=='undefined'?normalizeReminderPreference:undefined,
    reminderPolicyInteger:typeof reminderPolicyInteger!=='undefined'?reminderPolicyInteger:undefined,
    normalizeReminderPolicy:typeof normalizeReminderPolicy!=='undefined'?normalizeReminderPolicy:undefined,
    reminderPersonalizationClone:typeof reminderPersonalizationClone!=='undefined'?reminderPersonalizationClone:undefined,
    normalizeReminderPersonalization:typeof normalizeReminderPersonalization!=='undefined'?normalizeReminderPersonalization:undefined,
    reminderPersonalizationSuggestions:typeof reminderPersonalizationSuggestions!=='undefined'?reminderPersonalizationSuggestions:undefined,
    reminderPersonalizationState:typeof reminderPersonalizationState!=='undefined'?reminderPersonalizationState:undefined,
    reminderPersonalizationSignalRecord:typeof reminderPersonalizationSignalRecord!=='undefined'?reminderPersonalizationSignalRecord:undefined,
    reminderPersonalizationApplySuggestion:typeof reminderPersonalizationApplySuggestion!=='undefined'?reminderPersonalizationApplySuggestion:undefined,
    reminderPersonalizationUndoSuggestion:typeof reminderPersonalizationUndoSuggestion!=='undefined'?reminderPersonalizationUndoSuggestion:undefined,
    reminderPersonalizationDismissSuggestion:typeof reminderPersonalizationDismissSuggestion!=='undefined'?reminderPersonalizationDismissSuggestion:undefined,
    reminderPersonalizationSetOptIn:typeof reminderPersonalizationSetOptIn!=='undefined'?reminderPersonalizationSetOptIn:undefined,
    reminderPersonalizationSetHistoryMode:typeof reminderPersonalizationSetHistoryMode!=='undefined'?reminderPersonalizationSetHistoryMode:undefined,
    reminderPersonalizationReset:typeof reminderPersonalizationReset!=='undefined'?reminderPersonalizationReset:undefined,
    reminderDigestReflectionOption:typeof reminderDigestReflectionOption!=='undefined'?reminderDigestReflectionOption:undefined,
    reminderDigestBuild:typeof reminderDigestBuild!=='undefined'?reminderDigestBuild:undefined,
    reminderEngineOccurrenceId:typeof reminderEngineOccurrenceId!=='undefined'?reminderEngineOccurrenceId:undefined,
    reminderSpecialDayDefinition:typeof reminderSpecialDayDefinition!=='undefined'?reminderSpecialDayDefinition:undefined,
    reminderSpecialDayPolicyPreference:typeof reminderSpecialDayPolicyPreference!=='undefined'?reminderSpecialDayPolicyPreference:undefined,
    reminderSpecialDayOccurrence:typeof reminderSpecialDayOccurrence!=='undefined'?reminderSpecialDayOccurrence:undefined,
    reminderSpecialDayLifecycleCandidates:typeof reminderSpecialDayLifecycleCandidates!=='undefined'?reminderSpecialDayLifecycleCandidates:undefined,
    reminderMedicationDefinition:typeof reminderMedicationDefinition!=='undefined'?reminderMedicationDefinition:undefined,
    reminderMedicationScheduleById:typeof reminderMedicationScheduleById!=='undefined'?reminderMedicationScheduleById:undefined,
    reminderMedicationOccurrence:typeof reminderMedicationOccurrence!=='undefined'?reminderMedicationOccurrence:undefined,
    reminderMedicationPrivateCopy:typeof reminderMedicationPrivateCopy!=='undefined'?reminderMedicationPrivateCopy:undefined,
    reminderMedicationNativeCopy:typeof reminderMedicationNativeCopy!=='undefined'?reminderMedicationNativeCopy:undefined,
    reminderMedicationLifecycleCandidates:typeof reminderMedicationLifecycleCandidates!=='undefined'?reminderMedicationLifecycleCandidates:undefined,
    reminderAppClockBoundary:typeof reminderAppClockBoundary!=='undefined'?reminderAppClockBoundary:undefined,
    reminderAppEngineInput:typeof reminderAppEngineInput!=='undefined'?reminderAppEngineInput:undefined,
    reminderEngineModule:typeof reminderEngineModule!=='undefined'?reminderEngineModule:undefined,
    reminderEngineAdapterLocalParts:typeof reminderEngineAdapterLocalParts!=='undefined'?reminderEngineAdapterLocalParts:undefined,
    reminderEngineAdapterGenerateOccurrence:typeof reminderEngineAdapterGenerateOccurrence!=='undefined'?reminderEngineAdapterGenerateOccurrence:undefined,
    reminderPrayerOccurrence:typeof reminderPrayerOccurrence!=='undefined'?reminderPrayerOccurrence:undefined,
    reminderPrayerOccurrences:typeof reminderPrayerOccurrences!=='undefined'?reminderPrayerOccurrences:undefined,
    reminderSystemPrayerStatus:typeof reminderSystemPrayerStatus!=='undefined'?reminderSystemPrayerStatus:undefined,
    reminderSystemSyncStatus:typeof reminderSystemSyncStatus!=='undefined'?reminderSystemSyncStatus:undefined,
    reminderSystemStatus:typeof reminderSystemStatus!=='undefined'?reminderSystemStatus:undefined,
    reminderCrossSurfaceStatus:typeof reminderCrossSurfaceStatus!=='undefined'?reminderCrossSurfaceStatus:undefined,
    reminderCrossSurfaceTransition:typeof reminderCrossSurfaceTransition!=='undefined'?reminderCrossSurfaceTransition:undefined,
    reminderSystemStatusCopy:typeof reminderSystemStatusCopy!=='undefined'?reminderSystemStatusCopy:undefined,
    reminderSystemStatusHTML:typeof reminderSystemStatusHTML!=='undefined'?reminderSystemStatusHTML:undefined,
    reminderZikrFeatureEnabled:typeof reminderZikrFeatureEnabled!=='undefined'?reminderZikrFeatureEnabled:undefined,
    reminderZikrDailyOccurrence:typeof reminderZikrDailyOccurrence!=='undefined'?reminderZikrDailyOccurrence:undefined,
    reminderZikrJourneyOccurrence:typeof reminderZikrJourneyOccurrence!=='undefined'?reminderZikrJourneyOccurrence:undefined,
    reminderZikrReflectionOccurrence:typeof reminderZikrReflectionOccurrence!=='undefined'?reminderZikrReflectionOccurrence:undefined,
    reminderZikrOccurrences:typeof reminderZikrOccurrences!=='undefined'?reminderZikrOccurrences:undefined,
    reminderZikrLifecycleCandidates:typeof reminderZikrLifecycleCandidates!=='undefined'?reminderZikrLifecycleCandidates:undefined,
    reminderTherapyToolFromValue:typeof reminderTherapyToolFromValue!=='undefined'?reminderTherapyToolFromValue:undefined,
    reminderTherapyToolId:typeof reminderTherapyToolId!=='undefined'?reminderTherapyToolId:undefined,
    reminderTherapyOccurrence:typeof reminderTherapyOccurrence!=='undefined'?reminderTherapyOccurrence:undefined,
    reminderTherapyPrivateCopy:typeof reminderTherapyPrivateCopy!=='undefined'?reminderTherapyPrivateCopy:undefined,
    reminderTherapyLifecycleCandidates:typeof reminderTherapyLifecycleCandidates!=='undefined'?reminderTherapyLifecycleCandidates:undefined,
    reminderSaygiArticleState:typeof reminderSaygiArticleState!=='undefined'?reminderSaygiArticleState:undefined,
    reminderSaygiOccurrence:typeof reminderSaygiOccurrence!=='undefined'?reminderSaygiOccurrence:undefined,
    reminderSaygiPrivateCopy:typeof reminderSaygiPrivateCopy!=='undefined'?reminderSaygiPrivateCopy:undefined,
    reminderSaygiLifecycleCandidates:typeof reminderSaygiLifecycleCandidates!=='undefined'?reminderSaygiLifecycleCandidates:undefined,
    reminderStateContract:typeof reminderStateContract!=='undefined'?reminderStateContract:undefined,
    reminderDeliveryEmpty:typeof reminderDeliveryEmpty!=='undefined'?reminderDeliveryEmpty:undefined,
    reminderDeliveryNow:typeof reminderDeliveryNow!=='undefined'?reminderDeliveryNow:undefined,
    reminderDeliveryStatus:typeof reminderDeliveryStatus!=='undefined'?reminderDeliveryStatus:undefined,
    reminderDeliveryReason:typeof reminderDeliveryReason!=='undefined'?reminderDeliveryReason:undefined,
    reminderDeliveryTombstones:typeof reminderDeliveryTombstones!=='undefined'?reminderDeliveryTombstones:undefined,
    reminderDeliveryNormalize:typeof reminderDeliveryNormalize!=='undefined'?reminderDeliveryNormalize:undefined,
    reminderDeliveryFind:typeof reminderDeliveryFind!=='undefined'?reminderDeliveryFind:undefined,
    reminderDeliveryCanShowPure:typeof reminderDeliveryCanShowPure!=='undefined'?reminderDeliveryCanShowPure:undefined,
    reminderDeliveryLoad:typeof reminderDeliveryLoad!=='undefined'?reminderDeliveryLoad:undefined,
    reminderDeliveryAction:typeof reminderDeliveryAction!=='undefined'?reminderDeliveryAction:undefined,
    reminderDeliveryRecordAdapter:typeof reminderDeliveryRecordAdapter!=='undefined'?reminderDeliveryRecordAdapter:undefined,
    reminderLifecycleVisibility:typeof reminderLifecycleVisibility!=='undefined'?reminderLifecycleVisibility:undefined,
    reminderCatchupPlan:typeof reminderCatchupPlan!=='undefined'?reminderCatchupPlan:undefined,
    reminderCatchupPublic:typeof reminderCatchupPublic!=='undefined'?reminderCatchupPublic:undefined,
    reminderEvaluateReminders:typeof reminderEvaluateReminders!=='undefined'?reminderEvaluateReminders:undefined,
    reminderCareDefinitions:typeof reminderCareDefinitions!=='undefined'?reminderCareDefinitions:undefined,
    reminderCareNativeCategories:typeof reminderCareNativeCategories!=='undefined'?reminderCareNativeCategories:undefined,
    reminderCareLifecycleCandidates:typeof reminderCareLifecycleCandidates!=='undefined'?reminderCareLifecycleCandidates:undefined,
    reminderCareNudgeSources:typeof reminderCareNudgeSources!=='undefined'?reminderCareNudgeSources:undefined,
    reminderEveningSurface:typeof reminderEveningSurface!=='undefined'?reminderEveningSurface:undefined,
    reminderEveningSafeGroup:typeof reminderEveningSafeGroup!=='undefined'?reminderEveningSafeGroup:undefined,
    reminderEveningCoalesceCandidates:typeof reminderEveningCoalesceCandidates!=='undefined'?reminderEveningCoalesceCandidates:undefined,
    reminderDailyFlowPolicy:typeof reminderDailyFlowPolicy!=='undefined'?reminderDailyFlowPolicy:undefined,
    reminderDailyFlowGroup:typeof reminderDailyFlowGroup!=='undefined'?reminderDailyFlowGroup:undefined,
    reminderDailyFlowCoalesceCandidates:typeof reminderDailyFlowCoalesceCandidates!=='undefined'?reminderDailyFlowCoalesceCandidates:undefined,
    reminderLifecycleLiveHTML:typeof reminderLifecycleLiveHTML!=='undefined'?reminderLifecycleLiveHTML:undefined,
    reminderLifecycleTargetedUpdate:typeof reminderLifecycleTargetedUpdate!=='undefined'?reminderLifecycleTargetedUpdate:undefined,
    reminderLifecycleRecordReceipt:typeof reminderLifecycleRecordReceipt!=='undefined'?reminderLifecycleRecordReceipt:undefined,
    reminderLifecycleRenderPolicy:typeof reminderLifecycleRenderPolicy!=='undefined'?reminderLifecycleRenderPolicy:undefined,
    reminderRenderAction:typeof reminderRenderAction!=='undefined'?reminderRenderAction:undefined,
    reminderLifecycleEvaluate:typeof reminderLifecycleEvaluate!=='undefined'?reminderLifecycleEvaluate:undefined,
    reminderSchedulerFallbackCreate:typeof reminderSchedulerFallbackCreate!=='undefined'?reminderSchedulerFallbackCreate:undefined,
    reminderLifecycleTick:typeof reminderLifecycleTick!=='undefined'?reminderLifecycleTick:undefined,
    reminderSyncPayload:typeof reminderSyncPayload!=='undefined'?reminderSyncPayload:undefined,
    reminderPrivacySchemas:typeof reminderPrivacySchemas!=='undefined'?reminderPrivacySchemas:undefined,
    reminderPrivacyReport:typeof reminderPrivacyReport!=='undefined'?reminderPrivacyReport:undefined,
    reminderCenterHistoryHTML:typeof reminderCenterHistoryHTML!=='undefined'?reminderCenterHistoryHTML:undefined,
    reminderCenterRetentionHTML:typeof reminderCenterRetentionHTML!=='undefined'?reminderCenterRetentionHTML:undefined,
    reminderPersonalizationHTML:typeof reminderPersonalizationHTML!=='undefined'?reminderPersonalizationHTML:undefined,
    reminderCenterPolicyHTML:typeof reminderCenterPolicyHTML!=='undefined'?reminderCenterPolicyHTML:undefined,
    reminderCenterNoticeHTML:typeof reminderCenterNoticeHTML!=='undefined'?reminderCenterNoticeHTML:undefined,
    reminderDigestLauncherHTML:typeof reminderDigestLauncherHTML!=='undefined'?reminderDigestLauncherHTML:undefined,
    reminderDigestHTML:typeof reminderDigestHTML!=='undefined'?reminderDigestHTML:undefined,
    reminderTestPreviewHTML:typeof reminderTestPreviewHTML!=='undefined'?reminderTestPreviewHTML:undefined,
    reminderPermissionExplanationHTML:typeof reminderPermissionExplanationHTML!=='undefined'?reminderPermissionExplanationHTML:undefined,
    reminderProfileSectionHTML:typeof reminderProfileSectionHTML!=='undefined'?reminderProfileSectionHTML:undefined,
    reminderCategoryControlsHTML:typeof reminderCategoryControlsHTML!=='undefined'?reminderCategoryControlsHTML:undefined,
    reminderSpecialDaysSectionHTML:typeof reminderSpecialDaysSectionHTML!=='undefined'?reminderSpecialDaysSectionHTML:undefined,
    reminderCareControlsHTML:typeof reminderCareControlsHTML!=='undefined'?reminderCareControlsHTML:undefined,
    reminderMedicationDraftState:typeof reminderMedicationDraftState!=='undefined'?reminderMedicationDraftState:undefined,
    reminderMedicationSectionHTML:typeof reminderMedicationSectionHTML!=='undefined'?reminderMedicationSectionHTML:undefined,
    reminderPrayerPrivateCopy:typeof reminderPrayerPrivateCopy!=='undefined'?reminderPrayerPrivateCopy:undefined,
    reminderInboxBuildItems:typeof reminderInboxBuildItems!=='undefined'?reminderInboxBuildItems:undefined,
    reminderSurfaceState:typeof reminderSurfaceState!=='undefined'?reminderSurfaceState:undefined,
    reminderSurfaceTable:typeof reminderSurfaceTable!=='undefined'?reminderSurfaceTable:undefined,
    reminderActionSafeToken:typeof reminderActionSafeToken!=='undefined'?reminderActionSafeToken:undefined,
    reminderActionNormalizeEntry:typeof reminderActionNormalizeEntry!=='undefined'?reminderActionNormalizeEntry:undefined,
    reminderActionNormalize:typeof reminderActionNormalize!=='undefined'?reminderActionNormalize:undefined,
    reminderActionLoad:typeof reminderActionLoad!=='undefined'?reminderActionLoad:undefined,
    reminderRetentionSummary:typeof reminderRetentionSummary!=='undefined'?reminderRetentionSummary:undefined,
    reminderExportSummary:typeof reminderExportSummary!=='undefined'?reminderExportSummary:undefined,
    reminderActionDefinition:typeof reminderActionDefinition!=='undefined'?reminderActionDefinition:undefined,
    reminderSnoozePlan:typeof reminderSnoozePlan!=='undefined'?reminderSnoozePlan:undefined,
    reminderDeepLinkTarget:typeof reminderDeepLinkTarget!=='undefined'?reminderDeepLinkTarget:undefined,
    reminderActionOccurrence:typeof reminderActionOccurrence!=='undefined'?reminderActionOccurrence:undefined,
    reminderActionFind:typeof reminderActionFind!=='undefined'?reminderActionFind:undefined,
    reminderInboxCardHTML:typeof reminderInboxCardHTML!=='undefined'?reminderInboxCardHTML:undefined,
    reminderPreviewSafeCopy:typeof reminderPreviewSafeCopy!=='undefined'?reminderPreviewSafeCopy:undefined,
    reminderMedicationCurrentList:typeof reminderMedicationCurrentList!=='undefined'?reminderMedicationCurrentList:undefined,
    reminderMedicationDraftFromSchedule:typeof reminderMedicationDraftFromSchedule!=='undefined'?reminderMedicationDraftFromSchedule:undefined,
    reminderMedicationClearHistory:typeof reminderMedicationClearHistory!=='undefined'?reminderMedicationClearHistory:undefined,
    reminderConfirmAction:typeof reminderConfirmAction!=='undefined'?reminderConfirmAction:undefined,
    reminderServiceWorkerClickPayload:typeof reminderServiceWorkerClickPayload!=='undefined'?reminderServiceWorkerClickPayload:undefined,
    stepReminder:typeof stepReminder!=='undefined'?stepReminder:undefined,
    reconcileReminderStorageEvent:typeof reconcileReminderStorageEvent!=='undefined'?reconcileReminderStorageEvent:undefined,
    registerReminderView:typeof registerReminderView!=='undefined'?registerReminderView:undefined,
  });
})(typeof window!=='undefined'?window:this);
