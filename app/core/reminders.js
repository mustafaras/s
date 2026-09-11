// MON-40 · reminder runtime adapters.
// Frozen catalog/engine/scheduler/delivery modules remain read-only owners;
// delivery, permission, sync and persistence stay in app.js. The Reminder
// Center shell/card view below is a read-only adapter over the existing
// Catalog/API surface; App handlers remain app-owned.
(function(root){
  'use strict';

  var deps=null;
  var viewDeps=null;
  var REQUIRED_DEPENDENCIES=['catalog','engine','scheduler','validTime','enumHas','policyDefaults','channels','quietBehaviors','capacityModes','priorityRank'];
  var FALLBACK_POLICY_DEFAULTS={
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
  var REQUIRED_VIEW_DEPENDENCIES=['ui','root','definitions','copy','icon','esc','normalizePolicy','permissionSnapshot','permissionExplanation','profileLabel','sections','deepLinkTarget','previewSafeCopy','channels','validTime'];
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
  function reminderEngineLocalParts(instantMs,timezone){
    var source=engine();
    return source&&typeof source.localParts==='function'?source.localParts(instantMs,timezone):null;
  }
  function reminderEngineGenerateOccurrence(input){
    var source=engine();
    return source&&typeof source.generateOccurrence==='function'?source.generateOccurrence(input):{ok:false,occurrence:null,reason:'engine-unavailable'};
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
    var rootValue=viewCall('root',[],{})||{}, policy=viewCall('normalizePolicy',[rootValue.policy],{})||{}, defs=viewCall('definitions',[],[]), ui=viewDep('ui',{})||{}, muted=!!ui.reminderTodayMuted, remaining=muted?0:reminderCenterEnabledCount(rootValue,defs), snapshot=viewCall('permissionSnapshot',[],null), permission=viewCall('permissionExplanation',[snapshot],{})||{}, sections=viewCall('sections',[rootValue,permission],{})||{}, copy=function(key,fallback){ return viewCall('copy',[key,fallback],fallback); }, icon=function(name,size){ return viewCall('icon',[name,size],''); }, esc=function(value){ return viewCall('esc',[value],String(value==null?'':value)); }, profileLabel=String(viewCall('profileLabel',[rootValue.profile],'')||'');
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

  root.SeymaReminders=Object.freeze({
    registerReminders:registerReminders,
    registerReminderView:registerReminderView,
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
    reminderCenterOverlayHTML:reminderCenterOverlayHTML
  });
})(typeof window!=='undefined'?window:this);
