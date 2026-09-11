// MON-40 · reminder runtime adapters.
// Frozen catalog/engine/scheduler/delivery modules remain read-only owners;
// delivery, permission, sync, persistence and Reminder Center UI stay in app.js.
(function(root){
  'use strict';

  var deps=null;
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
    reminderSchedulerCreate:reminderSchedulerCreate
  });
})(typeof window!=='undefined'?window:this);
