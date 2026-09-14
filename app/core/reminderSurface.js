// MON2-03 · reminder yüzey runtime: app.js'ten taşınan 37 yan etkili
// reminder fn gövdesi ve 51 App.*reminder* handler gövdesi (MON-50 appSurface
// deseni, with(scope) idiomu). Bağımlılık bag'i app.js boot'ta
// registerReminderSurface ile verilir; bag üyeleri getter fn'dir ve canlı
// değer/fn döndürür. K3 gereği mutable reminder değişkenleri app.js'te kalır
// ve setPermission*/setScheduler* çiftiyle yazılır. Modül yüklemesinde DOM/ağ/
// timer/storage erişimi yoktur (S5): document/localStorage/navigator/
// Notification erişimleri yalnız çağrı anında doc/ls/nav/N alias'larıyla
// çözülür. App nesnesi, data rebind'leri, save/render sırası, timer/listener
// kaydı ve inline caller yüzeyi app.js'te kalır (I1-I6).
(function(){
  var reminderSurfaceDeps=null;
  var REMINDER_SURFACE_DEPENDENCIES=['App','EVENT_LOG_SCHEMA_VERSION','KEY','REMINDER_ACTION_KEY','REMINDER_CARE_KEYS','REMINDER_CHANNELS','REMINDER_DELIVERY_BLOCKING_STATUSES','REMINDER_DELIVERY_KEY','REMINDER_DELIVERY_SCHEMA_VERSION','REMINDER_ENGINE_DEFAULT_TIMEZONE','REMINDER_EVENT_ACTIONS','REMINDER_EVENT_SUMMARY','REMINDER_MEDICATION_LABEL_MAX','REMINDER_MEDICATION_MAX_SCHEDULES','REMINDER_MEDICATION_NAME_MAX','REMINDER_MEDICATION_NOTE_MAX','REMINDER_NATIVE_FOREGROUND_SOURCES','REMINDER_NATIVE_PREVIEW_TAG','REMINDER_NATIVE_TAG_PREFIX','REMINDER_PERMISSION_ALIASES','REMINDER_PERMISSION_STATES','REMINDER_PERMISSION_STORAGE_KEY','REMINDER_PROFILE_IDS','REMINDER_SCHEDULER_BURST_MS','REMINDER_SPECIAL_DAYS_ID','REMINDER_SPECIAL_DAYS_MODES','SEYMA_REMINDERS','appendEvent','appendReminderEvent','data','emptyReminderPersonalization','emptyReminderPolicy','emptyReminderState','ensureEventLog','mergeReminderLocalState','migrateReminderState','normalizeReminderCareCategories','normalizeReminderCategories','normalizeReminderMedication','normalizeReminderPolicy','normalizeReminderPreference','normalizeReminderProfile','normalizeReminderSpecialDaySelection','quranUnlockBodyScroll','reminderActionDefinition','reminderActionFind','reminderActionLoad','reminderActionNormalize','reminderActionNormalizeEntry','reminderActionOccurrence','reminderActionSafeToken','reminderAppClockBoundary','reminderCareNativeCategories','reminderCategoryIds','reminderCategorySelection','reminderCategoryState','reminderCenterClone','reminderConfirmAction','reminderCopy','reminderDeepLinkTarget','reminderDefinitions','reminderDeliveryLoad','reminderDeliveryModule','reminderDeliveryNormalize','reminderDeliveryNow','reminderDeliveryReason','reminderDeliveryTombstones','reminderDigestReflectionOption','reminderEnsurePreference','reminderEnumHas','reminderEveningSurface','reminderEventCorrelation','reminderLifecycleEvaluate','reminderLifecycleLiveHTML','reminderLifecycleRecordReceipt','reminderLifecycleRenderPolicy','reminderLifecycleState','reminderLifecycleTargetedUpdate','reminderLifecycleVisibility','reminderLocalClone','reminderLocalTouch','reminderMedicationClearHistory','reminderMedicationCurrentList','reminderMedicationDraftFromSchedule','reminderMedicationDraftState','reminderMedicationOccurrence','reminderMedicationScheduleById','reminderMedicationText','reminderMergeProfileSuggestions','reminderMigrationStatus','reminderNativeActionList','reminderNativeDeliveryCopy','reminderNativePayload','reminderNativeSafeCopy','reminderPermissionEverGranted','reminderPermissionGrantObserved','reminderPermissionRequestInFlight','reminderPermissionTransientState','reminderPersonalizationSignalRecord','reminderPersonalizationSuggestions','reminderRenderAction','reminderSchedulerFallbackCreate','reminderSchedulerInstance','reminderSchemaStatusForData','reminderServiceWorkerClickPayload','reminderSnoozePlan','reminderSpecialDayOptionById','reminderSpecialDaysCommit','reminderSpecialDaysState','reminderTherapyToolFromValue','render','save','saveLocal','toast','todayStr','ui','validReminderTime','zikrUnlockBodyScroll','setPermissionTransient','setPermissionInFlight','setPermissionEverGranted','setPermissionGrantObserved','setSchedulerInstance'];

  function registerReminderSurface(deps){
    if(reminderSurfaceDeps||!deps||typeof deps!=='object'||Array.isArray(deps)) return false;
    for(var i=0;i<REMINDER_SURFACE_DEPENDENCIES.length;i++){
      if(typeof deps[REMINDER_SURFACE_DEPENDENCIES[i]]!=='function') return false;
    }
    reminderSurfaceDeps=deps;
    installScopeProperties(SCOPE);
    return true;
  }

  function dep(name){ return reminderSurfaceDeps&&typeof reminderSurfaceDeps[name]==='function'?reminderSurfaceDeps[name]:null; }
  function call(name,args){ var fn=dep(name); if(!fn) throw new Error('SeymaReminderSurface: çözümlenemeyen bağımlılık '+name); return fn.apply(null,args||[]); }
  function liveData(){ return call('data'); }
  function liveUi(){ return call('ui'); }
  function app(){ return call('app'); }
  function isRegistered(){ return !!reminderSurfaceDeps; }

  // with(SCOPE){...} bloğu modül YÜKLEME anında değerlendirilir; SCOPE null
  // olamaz ve with bağlamı yükleme anındaki objeye statik bağlıdır. Bu yüzden
  // with'e sabit boş bir kapsam objesi verilir; bag property'leri (canlı
  // getter) registerReminderSurface başarılı olduğunda AYNI OBJEYE eklenir —
  // with bağlamı objenin o anki property'lerini okur, gövdeler çağrı anında
  // app.js closure'undaki güncel değeri görür. Register çağrılmazsa kapsam
  // boş kalır ve gövdeler fail-closed ReferenceError verir (istenen davranış).
  var SCOPE=Object.create(null);

  // Modül-local gövde kilidi (I6: yalnız bu modülün Lock/Unlock gövdeleri yazar).
  var _reminderBodyLocked=false,_reminderBodyPrevOverflow='',_reminderBodyPrevOverscrollBehavior='';

  function installScopeProperties(s){
    for(var k in reminderSurfaceDeps){
      var f=reminderSurfaceDeps[k];
      if(typeof f!=='function') throw new Error('SeymaReminderSurface: bag üyesi getter değil: '+k);
      // Bag getter'ları property-getter olarak bağlanır: her erişim app.js
      // closure'undaki canlı değeri okur (data rebind/save/render fn güvenli).
      Object.defineProperty(s,k,{get:f});
    }
    Object.defineProperty(s,'doc',{get:function(){ return (typeof document!=='undefined')?document:null; }});
    Object.defineProperty(s,'ls',{get:function(){ return (typeof localStorage!=='undefined')?localStorage:null; }});
    Object.defineProperty(s,'nav',{get:function(){ return (typeof navigator!=='undefined')?navigator:null; }});
    Object.defineProperty(s,'N',{get:function(){ return (typeof Notification!=='undefined')?Notification:null; }});
  }
  with(SCOPE){
function mergePersistedReminderState(nowIso){
  if(!data||typeof localStorage==='undefined') return;
  try{
    var raw=ls.getItem(KEY); if(!raw) return;
    var persisted=JSON.parse(raw); if(!persisted||!persisted.reminders) return;
    data.reminders=mergeReminderLocalState(data.reminders,persisted.reminders,data.savedAt,persisted.savedAt||nowIso);
    migrateReminderState(data);
  }catch(e){}
}

function reminderActionCommit(entry,now,options){
  var nowIso=reminderDeliveryNow(now), next=reminderActionNormalizeEntry(entry,nowIso);
  if(!next) return {ok:false,changed:false,duplicate:false,reason:'invalid',entry:null,state:reminderActionLoad(nowIso,true)};
  var state=reminderActionLoad(nowIso,true), existing=state.entries.filter(function(item){ return item.actionId===next.actionId; })[0];
  if(existing) return {ok:true,changed:false,duplicate:true,reason:null,entry:existing,state:state};
  state.entries.push(next); state=reminderActionNormalize(state,nowIso);
  var persisted=reminderActionStorageWrite(state), eventAction=next.action==='todayOff'?'mute':next.action;
  if(persisted&&REMINDER_EVENT_ACTIONS[eventAction]){
    var eventKey=next.action==='snooze'?(next.parentOccurrenceId||next.occurrenceId):next.action==='todayOff'?next.occurrenceId:next.reminderId;
    var event=appendReminderEvent(data,eventAction,eventKey||next.actionId);
    if(event&&!(options&&options.persistEvent===false)){ try{ saveLocal(); }catch(e){} }
  }
  return {ok:true,changed:true,duplicate:false,reason:null,entry:next,state:state};
}

function reminderActionStorageRead(){ try{ return typeof localStorage==='undefined'?null:ls.getItem(REMINDER_ACTION_KEY); }catch(e){ return null; } }

function reminderActionStorageWrite(state){ try{ if(typeof localStorage==='undefined') return false; ls.setItem(REMINDER_ACTION_KEY,JSON.stringify(state)); return true; }catch(e){ return false; } }

function reminderActiveElementId(){
  try{
    var active=doc.activeElement, id=active&&active.id?String(active.id):'';
    return id&&id!=='sey-reminder-screen'?id:'';
  }catch(e){ return ''; }
}

function reminderCloseForTarget(){
  reminderUnlockBodyScroll();
  ui.reminderCenterOpen=false; ui.reminderPreviewId=''; ui.reminderTodayMuted=false;
  ui.faithOpen=false; ui.zikrOpen=false; ui.readingOpen=false; ui.journalOpen=false; ui.saygiPersonOpen=false; ui.roomOpen=false;
  try{ if(typeof zikrUnlockBodyScroll==='function') zikrUnlockBodyScroll(); }catch(e){}
  try{ if(typeof quranUnlockBodyScroll==='function') quranUnlockBodyScroll(); }catch(e){}
}

function reminderCurrentRoot(){
  if(!data||typeof data!=='object') return null;
  if(!data.reminders||typeof data.reminders!=='object'||Array.isArray(data.reminders)) data.reminders=emptyReminderState();
  migrateReminderState(data);
  if(reminderMigrationStatus&&!reminderMigrationStatus.supported) return null;
  return data.reminders;
}

function reminderDeliveryClear(now){
  try{
    if(typeof localStorage==='undefined') return false;
    // No-argument calls are the test/runtime hard-clear primitive. User-facing
    // clear passes an explicit timestamp so the boundary survives the delete.
    if(arguments.length===0){ ls.removeItem(REMINDER_DELIVERY_KEY); return true; }
    var nowIso=reminderDeliveryNow(now), current=reminderDeliveryLoad(nowIso,false), tombstones=(current.tombstones||[]).concat((current.entries||[]).map(function(entry){ return entry&&entry.occurrenceId; })).filter(Boolean), next={schemaVersion:REMINDER_DELIVERY_SCHEMA_VERSION,entries:[],clearBoundaryAt:nowIso,generation:(Number(current.generation)||0)+1,tombstones:reminderDeliveryTombstones({tombstones:tombstones})};
    return reminderDeliveryStorageWrite(next);
  }catch(e){ return false; }
}

function reminderDeliveryStorageRead(){
  try{ return typeof localStorage==='undefined'?null:ls.getItem(REMINDER_DELIVERY_KEY); }catch(e){ return null; }
}

function reminderDeliveryStorageWrite(log){
  try{ if(typeof localStorage==='undefined') return false; ls.setItem(REMINDER_DELIVERY_KEY,JSON.stringify(log)); return true; }catch(e){ return false; }
}

function reminderLifecycleDefaultContext(input,nowIso){
  var x=input&&typeof input==='object'?input:{}, root=reminderCurrentRoot(), policy=root?normalizeReminderPolicy(root.policy):emptyReminderPolicy(), clock=reminderAppClockBoundary(Object.assign({},x,{nowIso:nowIso})), timezone=clock.timezone, requestedVisibility=x.visibilityState||(x.context&&x.context.visibilityState), visibility;
  if(!requestedVisibility){ try{ requestedVisibility=doc.hidden?'hidden':'visible'; }catch(e){ requestedVisibility='visible'; } }
  visibility=reminderLifecycleVisibility(requestedVisibility);
  var context=Object.assign({timezone:timezone,nowIso:clock.nowIso,localDate:clock.wallClockDate||todayStr(),localTime:clock.wallClockTime||'12:00',quietHours:policy.quietHours,nativeDailyCap:policy.nativeDailyCap,lowPriorityNativeCap:policy.lowPriorityNativeCap,sameCategoryCooldownMinutes:policy.sameCategoryCooldownMinutes,dailyFlowBudget:policy.dailyFlowBudget,capacityMode:policy.capacityMode,selectedCategories:root?reminderCategorySelection(root):[],permissionState:x.permissionState||reminderPermissionSnapshot(),visibilityState:visibility,offline:reminderSystemOffline(x),online:!reminderSystemOffline(x)},x.context&&typeof x.context==='object'?x.context:{});
  context.visibilityState=visibility;
  context.offline=reminderSystemOffline(Object.assign({},x,{context:context})); context.online=!context.offline;
  return context;
}

function reminderLifecycleDraftActive(){
  if(typeof ui==='undefined'||!ui) return false;
  var draftKeys=['journalText','lunaDraft','aeonDraft','readingDraft','watchDraft','quoteDraft','quranNoteDraft','motivationReflectionDraft','soulActivityDraft','reminderMedicationDraft'];
  for(var i=0;i<draftKeys.length;i++){
    var value=ui[draftKeys[i]];
    if(typeof value==='string'&&value.length>0) return true;
    if(value&&typeof value==='object'){
      var keys=Object.keys(value);
      for(var j=0;j<keys.length;j++) if(String(value[keys[j]]==null?'':value[keys[j]]).length>0) return true;
    }
  }
  try{
    var active=document&&doc.activeElement, tag=active&&String(active.tagName||'').toUpperCase(), type=String(active&&active.type||'').toLowerCase();
    if(tag==='TEXTAREA'||(tag==='INPUT'&&['button','checkbox','radio','submit','reset','file'].indexOf(type)<0)) return true;
    if(active&&active.isContentEditable===true) return true;
  }catch(e){}
  return false;
}

function reminderLifecycleRenderIfNeeded(result,signature,context,sourceName,options){
  var candidateChanged=reminderLifecycleState.candidateSignature!==signature;
  reminderLifecycleState.candidateSignature=signature;
  reminderLifecycleState.candidateChanged=candidateChanged;
  var x=options&&typeof options==='object'?options:{}, policy=reminderLifecycleRenderPolicy(result,context,sourceName,Object.assign({},x,{force:candidateChanged||x.force===true}));
  var changed=candidateChanged||policy.changed;
  if(!changed||policy.mode==='no-op'){
    reminderLifecycleState.noOpCount+=1;
    reminderLifecycleState.lastRenderReason='candidate-stable';
    reminderLifecycleRecordReceipt({source:sourceName,policy:'candidate-unchanged',reason:'candidate-unchanged',target:'',mode:'no-op',draftActive:policy.draftActive,overlayOpen:policy.overlayOpen,tabActive:policy.tabActive},context&&context.nowIso);
    return false;
  }
  if(policy.mode==='targeted'){
    var targeted=reminderLifecycleTargetedUpdate(policy.target==='reminder-center-live'?'reminder-center':policy.target==='reminder-inbox-live'?'reminder-inbox':policy.target,result,policy.draftActive);
    if(targeted){ reminderLifecycleState.targetedUpdateCount+=1; reminderLifecycleState.lastRenderReason='targeted-update'; reminderLifecycleRecordReceipt({source:sourceName,policy:policy.policy,reason:policy.reason,target:policy.target,mode:'targeted',targetedUpdate:true,draftActive:policy.draftActive,overlayOpen:policy.overlayOpen,tabActive:policy.tabActive},context&&context.nowIso); return true; }
    if(policy.draftActive||policy.overlayOpen||!policy.tabActive){ reminderLifecycleState.deferredRenderCount+=1; reminderLifecycleState.lastRenderReason='render-deferred'; reminderLifecycleRecordReceipt({source:sourceName,policy:policy.policy,reason:policy.reason+'-target-missing',target:policy.target,mode:'defer',draftActive:policy.draftActive,overlayOpen:policy.overlayOpen,tabActive:policy.tabActive},context&&context.nowIso); return false; }
    policy=Object.assign(policy,{mode:'full',reason:policy.reason+'-target-missing',policy:policy.policy+'-fallback'});
  }
  if(policy.mode!=='full'||!context||context.visibilityState!=='visible'){
    reminderLifecycleState.deferredRenderCount+=1; reminderLifecycleState.lastRenderReason='render-deferred'; reminderLifecycleRecordReceipt({source:sourceName,policy:policy.policy,reason:policy.reason,target:policy.target,mode:'defer',draftActive:policy.draftActive,overlayOpen:policy.overlayOpen,tabActive:policy.tabActive},context&&context.nowIso); return false;
  }
  if(typeof render!=='function'){
    reminderLifecycleState.lastRenderReason='render-unavailable'; reminderLifecycleRecordReceipt({source:sourceName,policy:policy.policy,reason:'render-unavailable',target:policy.target,mode:'defer',draftActive:policy.draftActive,overlayOpen:policy.overlayOpen,tabActive:policy.tabActive},context&&context.nowIso); return false;
  }
  try{
    render(); reminderLifecycleState.renderCount+=1; reminderLifecycleState.lastRenderReason=policy.reason==='action-accepted'?'action-accepted':(candidateChanged?'candidate-changed':'delivery-changed'); reminderLifecycleRecordReceipt({source:sourceName,policy:policy.policy,reason:policy.reason,target:policy.target,mode:'full',fullRender:true,draftActive:policy.draftActive,overlayOpen:policy.overlayOpen,tabActive:policy.tabActive},context&&context.nowIso); return true;
  }catch(e){
    reminderLifecycleState.renderErrorCount+=1; reminderLifecycleState.lastRenderReason='render-error'; reminderLifecycleRecordReceipt({source:sourceName,policy:policy.policy,reason:'render-error',target:policy.target,mode:'defer',draftActive:policy.draftActive,overlayOpen:policy.overlayOpen,tabActive:policy.tabActive},context&&context.nowIso); return false;
  }
}

function reminderLifecycleReplaceTarget(id,html){
  try{
    var old=doc.getElementById(id); if(!old) return false;
    var holder=doc.createElement('div'); holder.innerHTML=html;
    var next=holder.firstElementChild||holder.firstChild; if(!next) return false;
    if(old.parentNode&&typeof old.parentNode.replaceChild==='function') old.parentNode.replaceChild(next,old);
    else if(typeof old.replaceWith==='function') old.replaceWith(next);
    else return false;
    return true;
  }catch(e){ return false; }
}

function reminderLifecycleUpdateLive(id,result){
  try{ var el=doc.getElementById(id); if(!el) return false; el.innerHTML=reminderLifecycleLiveHTML(result); return true; }catch(e){ return false; }
}

function reminderLockBodyScroll(){
  if(_reminderBodyLocked||typeof document==='undefined'||!doc.body) return;
  _reminderBodyPrevOverflow=doc.body.style.overflow||'';
  _reminderBodyPrevOverscrollBehavior=doc.body.style.overscrollBehavior||'';
  doc.body.style.overflow='hidden';
  doc.body.style.overscrollBehavior='none';
  try{ if(doc.body.classList) doc.body.classList.add('sey-reminder-body-locked'); }catch(e){}
  _reminderBodyLocked=true;
}

function reminderNativeDisplay(input){
  var x=input&&typeof input==='object'?input:{}, visibility=reminderLifecycleVisibility(x.visibilityState), source=String(x.source||''), policy=x.policy&&typeof x.policy==='object'?x.policy:null;
  if(x.foreground===false||!REMINDER_NATIVE_FOREGROUND_SOURCES[source]||visibility!=='visible') return {ok:false,reason:visibility!=='visible'?'not-visible':'not-foreground'};
  if(x.duplicate===true||x.alreadyDelivered===true||REMINDER_DELIVERY_BLOCKING_STATUSES[String(x.deliveryStatus||'')]) return {ok:false,reason:'duplicate'};
  if(!policy||policy.nativeAllowed!==true||policy.channel!=='native') return {ok:false,reason:reminderDeliveryReason(policy&&policy.reason||'channel-policy')};
  var permission=reminderPermissionSnapshot();
  if(permission!=='granted') return {ok:false,reason:'permission-'+permission};
  if(N==null) return {ok:false,reason:'unsupported'};
  var copy=reminderNativeDeliveryCopy(x); if(!copy.ok) return copy;
  var payload=reminderNativePayload(copy), options={body:copy.body,tag:copy.tag,renotify:false,silent:true,requireInteraction:false,data:payload,actions:reminderNativeActionList()};
  // Fail closed rather than emit a reminder onto the AEON tag/id namespace.
  if(reminderNotificationChannel({tag:copy.tag,data:payload})!=='reminder') return {ok:false,reason:'channel-boundary',copy:copy,payload:payload};
  try{
    var notification=new N(copy.title,options);
    return {ok:true,reason:null,copy:copy,payload:payload,options:options,notification:notification};
  }catch(e){ return {ok:false,reason:'native-error',copy:copy,payload:payload}; }
}

function reminderPermissionCanRequest(state){
  var key=reminderPermissionState({state:state}), module=reminderDeliveryModule();
  if(module&&typeof module.canRequestPermission==='function') return module.canRequestPermission(key)===true;
  return key==='default'||key==='revoked'||key==='temporary-error';
}

function reminderPermissionEverGrantedRead(){
  if(reminderPermissionEverGranted===null){
    var stored=reminderPermissionStorageRead();
    setPermissionEverGranted(!!(stored&&(stored.everGranted===true||stored.state==='granted')));
  }
  return reminderPermissionEverGranted===true;
}

function reminderPermissionRecord(state){
  var next=reminderPermissionState({state:state});
  setPermissionTransient(next==='temporary-error'?next:null);
  reminderPermissionStorageWrite(next);
  return next;
}

function reminderPermissionRequest(options){
  var x=options&&typeof options==='object'?options:{}, state=reminderPermissionSnapshot();
  if(!reminderPermissionCanRequest(state)) return Promise.resolve({ok:state==='granted',state:state,reason:'permission-'+state,requested:false,source:String(x.source||'explicit')});
  if(reminderPermissionRequestInFlight) return reminderPermissionRequestInFlight;
  if(N==null||typeof N.requestPermission!=='function'){
    var unsupported=reminderPermissionRecord('unsupported');
    return Promise.resolve({ok:false,state:unsupported,reason:'permission-unsupported',requested:false,source:String(x.source||'explicit')});
  }
  var requestResult;
  try{ requestResult=N.requestPermission(); }catch(e){
    var thrown=reminderPermissionRecord('temporary-error');
    if(x.render!==false) render();
    return Promise.resolve({ok:false,state:thrown,reason:'permission-request-error',requested:true,source:String(x.source||'explicit')});
  }
  setPermissionInFlight(Promise.resolve(requestResult).then(function(permission){
    var next=reminderPermissionState({permission:permission});
    if(next==='temporary-error') next=reminderPermissionRecord('temporary-error');
    else { setPermissionTransient(null); next=reminderPermissionRecord(next); }
    return {ok:next==='granted',state:next,permission:permission,reason:next==='granted'?null:'permission-'+next,requested:true,source:String(x.source||'explicit')};
  }).catch(function(){
    var failure=reminderPermissionRecord('temporary-error');
    return {ok:false,state:failure,reason:'permission-request-error',requested:true,source:String(x.source||'explicit')};
  }).then(function(result){
    setPermissionInFlight(null);
    if(x.render!==false) render();
    return result;
  }));
  return reminderPermissionRequestInFlight;
}

function reminderPermissionSnapshot(){
  var supported=false,permission=null,pwaLimited=false;
  try{
    supported=!!N&&typeof N.permission==='string';
    permission=supported?N.permission:null;
  }catch(e){ supported=false; permission=null; }
  try{
    var standalone=typeof navigator!=='undefined'&&navigator&&nav.standalone===true;
    var displayStandalone=typeof window!=='undefined'&&window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches;
    pwaLimited=!!(standalone||displayStandalone);
  }catch(e){ pwaLimited=false; }
  if(permission==='granted'&&!reminderPermissionGrantObserved&&!reminderPermissionEverGrantedRead()){ setPermissionGrantObserved(true); reminderPermissionStorageWrite('granted'); }
  if(reminderPermissionTransientState==='temporary-error'&&permission==='default') return 'temporary-error';
  if(permission!=='default') setPermissionTransient(null);
  return reminderPermissionState({supported:supported,permission:permission,pwaLimited:pwaLimited,previouslyGranted:reminderPermissionEverGrantedRead()});
}

function reminderPermissionState(input){
  var x=input&&typeof input==='object'?input:{};
  if(x.state==='error'||x.error===true) return 'temporary-error';
  var declared=typeof x.state==='undefined'?'':String(x.state);
  if(declared&&REMINDER_PERMISSION_ALIASES[declared]) declared=REMINDER_PERMISSION_ALIASES[declared];
  if(reminderEnumHas(REMINDER_PERMISSION_STATES,declared)&&declared!=='error') return declared;
  if(x.supported===false) return 'unsupported';
  if(x.pwaLimited===true) return 'pwa-limited';
  if(x.temporaryError===true) return 'temporary-error';
  var live=typeof x.permission==='undefined'?'':String(x.permission);
  if(live&&REMINDER_PERMISSION_ALIASES[live]) live=REMINDER_PERMISSION_ALIASES[live];
  if(live==='granted'||live==='denied') return live;
  // Only a remembered grant turns a bare `default` into `revoked`; a device
  // that was never granted stays at `default` and is never re-asked on its own.
  if(live==='default') return x.previouslyGranted===true?'revoked':'default';
  if(typeof x.permission==='undefined'&&N==null) return 'unsupported';
  return 'temporary-error';
}

function reminderPermissionStorageRead(){
  try{
    if(typeof localStorage==='undefined'||!localStorage||typeof ls.getItem!=='function') return null;
    var raw=ls.getItem(REMINDER_PERMISSION_STORAGE_KEY); if(!raw) return null;
    var parsed=JSON.parse(raw);
    return parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:null;
  }catch(e){ return null; }
}

function reminderPermissionStorageWrite(state){
  var everGranted=reminderPermissionEverGrantedRead()||state==='granted';
  setPermissionEverGranted(everGranted);
  try{ if(typeof localStorage!=='undefined'&&localStorage&&typeof ls.setItem==='function') ls.setItem(REMINDER_PERMISSION_STORAGE_KEY,JSON.stringify({state:state,everGranted:everGranted,updatedAt:new Date().toISOString()})); }catch(e){}
}

function reminderPreviewNotification(input){
  var state=reminderPermissionSnapshot(), copy=reminderNativeSafeCopy(input);
  if(state!=='granted') return {ok:false,state:state,reason:'permission-'+state,inAppFallback:true,copy:copy};
  if(N==null) return {ok:false,state:'unsupported',reason:'permission-unsupported',inAppFallback:true,copy:copy};
  try{
    var notification=new N(copy.title,{body:copy.body,tag:copy.tag,renotify:false,silent:true,data:{type:'reminder-preview',deepLink:copy.deepLink}});
    return {ok:true,state:state,reason:null,inAppFallback:false,copy:copy,notification:notification};
  }catch(e){
    var failure=reminderPermissionRecord('temporary-error');
    return {ok:false,state:failure,reason:'native-preview-error',inAppFallback:true,copy:copy};
  }
}

function reminderRemoveLocalKey(key){ try{ if(typeof localStorage!=='undefined'&&localStorage&&typeof ls.removeItem==='function') ls.removeItem(key); return true; }catch(e){ return false; } }

function reminderRestoreFocus(preferredId,fallbackId){
  var id=String(preferredId||fallbackId||''); if(!id) return false;
  try{ var el=doc.getElementById(id); if(el&&el.focus){ el.focus(); return true; } }catch(e){}
  return false;
}

function reminderSchedulerDispatch(source,input){ return reminderSchedulerEnsure().trigger(source,input); }

function reminderSchedulerEnsure(){
  if(reminderSchedulerInstance) return reminderSchedulerInstance;
  if(SEYMA_REMINDERS&&typeof SEYMA_REMINDERS.reminderSchedulerCreate==='function'){
    setSchedulerInstance(SEYMA_REMINDERS.reminderSchedulerCreate({burstMs:REMINDER_SCHEDULER_BURST_MS,now:function(){ return Date.now(); },evaluate:function(source,input){ return reminderLifecycleEvaluate(source,input); }}));
    if(reminderSchedulerInstance) return reminderSchedulerInstance;
  }
  var module=null;
  try{ if(typeof window!=='undefined'&&window.ReminderSchedulerV1&&typeof window.ReminderSchedulerV1.create==='function') module=window.ReminderSchedulerV1; }catch(e){ module=null; }
  if(module){ setSchedulerInstance(module.create({burstMs:REMINDER_SCHEDULER_BURST_MS,now:function(){ return Date.now(); },evaluate:function(source,input){ return reminderLifecycleEvaluate(source,input); }})); }
  else setSchedulerInstance(reminderSchedulerFallbackCreate());
  return reminderSchedulerInstance;
}

function reminderSchedulerSnapshot(){ return reminderSchedulerEnsure().snapshot(); }

function reminderSetEnabled(reminderId,enabled,options){
  var id=String(reminderId||''), definition=reminderActionDefinition(id), root=reminderCurrentRoot(), x=options&&typeof options==='object'?options:{}, nowIso=reminderDeliveryNow(x.nowIso||x.now);
  if(!definition||!root) return {ok:false,changed:false,duplicate:false,reason:'unknown-reminder'};
  var hadPreference=!!(root.preferences&&Object.prototype.hasOwnProperty.call(root.preferences,id)), existingPreference=hadPreference?root.preferences[id]:null, currentEnabled=hadPreference?!(existingPreference&&existingPreference.enabled===false):true, pref=reminderEnsurePreference(root,id), next=enabled===true, already=hadPreference&&currentEnabled===next;
  if(!already){
    pref.enabled=next; pref.lastEditedAt=nowIso;
    if(id===REMINDER_SPECIAL_DAYS_ID){
      var specialState=reminderSpecialDaysState(root);
      if(next){ if(specialState.mode==='none') specialState.mode=specialState.selectedDays.length?'selected':'all'; }
      else specialState.mode='none';
      reminderSpecialDaysCommit(root,specialState,nowIso);
    } else root.preferences[id]=normalizeReminderPreference(id,pref);
    reminderLocalTouch(root,'preferences',nowIso);
  }
  var action=already?{ok:true,changed:false,duplicate:true,reason:null,entry:null,state:reminderActionLoad(nowIso,true)}:reminderActionCommit({actionId:'reminder-action-v1:'+(next?'enable':'disable')+':'+encodeURIComponent(id)+':'+encodeURIComponent(nowIso),action:next?'enable':'disable',reminderId:id,recordedAt:nowIso,status:next?'enabled':'disabled'},nowIso,{persistEvent:false});
  if(!already&&x.occurrenceId&&!next) reminderDeliverySuppress({occurrenceId:x.occurrenceId,now:nowIso,reason:'disabled',channel:'in_app'});
  if(!already) save();
  if(!already||action.changed) reminderRenderAction('action-accepted',{target:x.occurrenceId?'reminder-inbox':'reminder-center',requiresFullRender:!x.occurrenceId});
  return {ok:true,changed:!already,duplicate:already||action.duplicate,reason:null,reminderId:id,enabled:next,preference:pref,action:action};
}

function reminderSystemOffline(input){
  var x=input&&typeof input==='object'?input:{};
  if(x.offline===true) return true;
  if(Object.prototype.hasOwnProperty.call(x,'online')) return x.online===false;
  if(x.context&&typeof x.context==='object'&&Object.prototype.hasOwnProperty.call(x.context,'offline')) return x.context.offline===true;
  try{ if(typeof navigator!=='undefined'&&navigator&&nav.onLine===false) return true; }catch(e){}
  return false;
}

function reminderUnlockBodyScroll(){
  if(!_reminderBodyLocked||typeof document==='undefined'||!doc.body) return;
  doc.body.style.overflow=_reminderBodyPrevOverflow;
  doc.body.style.overscrollBehavior=_reminderBodyPrevOverscrollBehavior;
  try{ if(doc.body.classList) doc.body.classList.remove('sey-reminder-body-locked'); }catch(e){}
  _reminderBodyLocked=false;
}

function updateReminderPolicy(mutator){
  var root=reminderCurrentRoot(); if(!root||typeof mutator!=='function') return;
  var nowIso=new Date().toISOString(), policy=normalizeReminderPolicy(root.policy); mutator(policy); root.policy=normalizeReminderPolicy(policy); reminderLocalTouch(root,'policy',nowIso); save(); render();
}
function App_clearReminderHistory(options){
  var x=options&&typeof options==='object'?options:{}, nowIso=reminderDeliveryNow(x.nowIso||x.now), delivery=reminderDeliveryLoad(nowIso,false), actions=reminderActionLoad(nowIso,false), count=(delivery.entries||[]).length+(actions.entries||[]).length;
  if(!count) return {ok:true,changed:false,reason:null,clearBoundaryAt:delivery.clearBoundaryAt||''};
  if(!reminderConfirmAction('Reminder geçmişi temizlensin mi? Bu cihazdaki kısa teslim ve işlem günlüğü silinecek.',x)) return {ok:false,changed:false,reason:'cancelled'};
  ui.reminderHistoryUndo={delivery:reminderCenterClone(delivery),actions:reminderCenterClone(actions)};
  var cleared=reminderDeliveryClear(nowIso); reminderActionStorageWrite(reminderActionNormalize([],nowIso));
  if(!cleared) return {ok:false,changed:false,reason:'storage-error'};
  ui.reminderCenterNotice='Son reminder geçmişi temizlendi. Eski duraklar yeniden oynatılmayacak; istersen hemen geri alabilirsin.';
  render();
  return {ok:true,changed:true,clearBoundaryAt:nowIso,generation:(Number(delivery.generation)||0)+1};
}


function App_clearReminderMedicationLocal(){
  var list=reminderMedicationCurrentList(); if(!list) return {ok:false,reason:'no-data'};
  if(!list.length) return {ok:true,cleared:0,history:{delivery:0,actions:0}};
  if(typeof confirm==='function'&&!confirm('Yerel ilaç ve takviye hatırlatmaları temizlensin mi?')) return {ok:false,reason:'cancelled'};
  var ids=list.map(function(item){ return item.id; }), count=list.length; list.splice(0,list.length); reminderLocalTouch(reminderCurrentRoot(),'medications',new Date().toISOString()); ui.reminderMedicationEditingId=''; ui.reminderMedicationDraft=null; ui.reminderMedicationError=''; var history=reminderMedicationClearHistory(ids); save(); render(); return {ok:true,cleared:count,history:history};
}


function App_closeReminderCenter(){
  var body=function(){
    var returnId=ui.reminderReturnFocusId||'sey-reminder-settings-entry';
    reminderUnlockBodyScroll(); ui.reminderCenterOpen=false; ui.reminderReturnFocusId=''; ui.reminderTargetReturnFocusId=''; ui.reminderPreviewId=''; ui.reminderPreviewLegacyId=''; ui.reminderTodayMuted=false; ui.reminderCenterNotice=''; ui.reminderCenterUndo=null; ui.reminderAllUndo=null; ui.reminderHistoryUndo=null; ui.reminderTestState=null; ui.reminderDigestOpen=false; ui.reminderDigestState='idle'; ui.reminderDigestReflection=''; render();
    var trigger=doc.getElementById(returnId);
    if(trigger&&trigger.focus) trigger.focus(); else reminderRestoreFocus(returnId,'sey-reminder-settings-entry');
  };
  if(window.SeyFx&&typeof window.SeyFx.sheetClose==='function') window.SeyFx.sheetClose('sey-reminder-screen','sey-reminder-overlay',body); else body();
}


function App_confirmReminderSetup(){
  var root=reminderCurrentRoot(); if(!root) return;
  var selected=normalizeReminderCategories(ui.reminderSetupCategories);
  root.onboarding.selectedCategories=selected; root.onboarding.completed=true; reminderLocalTouch(root,'onboarding',new Date().toISOString());
  reminderMergeProfileSuggestions(root,root.profile,selected); var setupNow=new Date().toISOString(); selected.forEach(function(category){ reminderPersonalizationSignalRecord(root,{type:'category',source:'explicit-category-choice',reminderId:'reminder.category.v1.'+category,value:'enabled'},setupNow); }); save(); render();
}


function App_deleteReminderMedication(id){
  var list=reminderMedicationCurrentList(), key=String(id||''), index=list?list.findIndex(function(item){ return item&&item.id===key; }):-1;
  if(index<0) return {ok:false,reason:'not-found'};
  if(typeof confirm==='function'&&!confirm('Bu yerel hatırlatma silinsin mi?')) return {ok:false,reason:'cancelled'};
  list.splice(index,1); reminderMedicationClearHistory([key]); reminderLocalTouch(reminderCurrentRoot(),'medications',new Date().toISOString()); if(ui.reminderMedicationEditingId===key){ ui.reminderMedicationEditingId=''; ui.reminderMedicationDraft=null; } save(); render(); return {ok:true,deleted:key};
}


function App_disableAllReminders(options){
  var root=reminderCurrentRoot(), x=options&&typeof options==='object'?options:{}, nowIso=reminderDeliveryNow(x.nowIso||x.now);
  if(!root) return {ok:false,changed:false,reason:'no-data'};
  if(!reminderConfirmAction('Tüm reminderlar kapatılsın mı? Tercihlerin ve geçmişin korunur; dilediğinde geri alabilirsin.',x)) return {ok:false,changed:false,reason:'cancelled'};
  ui.reminderAllUndo=reminderCenterClone(root);
  Object.keys(root.preferences||{}).forEach(function(id){ var pref=reminderEnsurePreference(root,id); pref.enabled=false; pref.lastEditedAt=nowIso; root.preferences[id]=normalizeReminderPreference(id,pref); });
  reminderDefinitions().forEach(function(def){ var id=String(def&&def.id||''); if(!id) return; var pref=reminderEnsurePreference(root,id); pref.enabled=false; pref.lastEditedAt=nowIso; root.preferences[id]=normalizeReminderPreference(id,pref); });
  var special=reminderSpecialDaysState(root); special.mode='none'; reminderSpecialDaysCommit(root,special,nowIso);
  root.medications=(Array.isArray(root.medications)?root.medications:[]).map(function(item){ var next=reminderLocalClone(item)||{}; next.enabled=false; return next; });
  root.policy=normalizeReminderPolicy(root.policy); root.policy.careNativeCategories=[]; root.policy.careMovementOptIn=false; root.personalization=emptyReminderPersonalization();
  ['preferences','specialDays','medications','policy','personalization'].forEach(function(scope){ reminderLocalTouch(root,scope,nowIso); });
  save(); ui.reminderCenterNotice='Tüm reminderlar kapatıldı. Tercihlerin silinmedi; geri alabilirsin.'; render();
  return {ok:true,changed:true,historyPreserved:true,undoAvailable:true};
}


function App_dismissReminderDigest(){
  if(!ui.reminderDigestOpen) return {ok:true,noOp:true,changed:false,persisted:false,notificationCreated:false};
  ui.reminderDigestState='no-op'; ui.reminderDigestReflection='';
  render();
  return {ok:true,noOp:true,changed:true,persisted:false,notificationCreated:false};
}


function App_editReminderMedication(id){
  var schedule=reminderMedicationScheduleById(id); if(!schedule) return {ok:false,reason:'not-found'};
  ui.reminderMedicationEditingId=schedule.id; ui.reminderMedicationDraft=reminderMedicationDraftFromSchedule(schedule); ui.reminderMedicationError=''; render(); return {ok:true,schedule:schedule};
}


function App_handleReminderNativeClick(payload){
  var target=reminderDeepLinkTarget(payload), x=payload&&typeof payload==='object'?payload:{};
  if(!target.ok) return target;
  var occurrenceId=reminderActionSafeToken(x.occurrenceId||(x.occurrence&&x.occurrence.occurrenceId),240), action=String(x.action||x.notificationAction||'open');
  if(!occurrenceId) return {ok:false,reason:'missing-occurrence-id'};
  if(action==='mute') action='todayOff';
  if(action!=='open'&&action!=='snooze'&&action!=='todayOff') return {ok:false,reason:'unknown-action'};
  var nowIso=new Date().toISOString(), occurrence=Object.assign({occurrenceId:occurrenceId,reminderId:target.reminderId,deepLink:target.deepLink,openDetail:target.openDetail,therapyToolId:target.therapyToolId||'',timezone:String(x.timezone||REMINDER_ENGINE_DEFAULT_TIMEZONE)},x.occurrence&&typeof x.occurrence==='object'?x.occurrence:{});
  if(action==='snooze') return App.reminderInboxSnooze(occurrenceId,String(x.snoozeOption||x.option||'10m'),target.reminderId,{nowIso:nowIso,occurrence:occurrence});
  if(action==='todayOff') return App.reminderInboxTodayOff(occurrenceId,target.reminderId,{nowIso:nowIso,occurrence:occurrence});
  App.reminderDeliveryOpen({occurrenceId:occurrenceId,channel:'native',now:nowIso});
  return App.openReminderTarget(Object.assign({},target,{occurrenceId:occurrenceId}));
}


function App_handleReminderServiceWorkerClick(payload){
  var safe=reminderServiceWorkerClickPayload(payload);
  if(!safe) return {ok:false,reason:'invalid-service-worker-payload'};
  return App.handleReminderNativeClick(safe);
}


function App_muteReminderMedicationToday(id,options){
  var schedule=reminderMedicationScheduleById(id), x=options&&typeof options==='object'?options:{}, nowIso=reminderDeliveryNow(x.nowIso||x.now); if(!schedule) return {ok:false,reason:'not-found'};
  var generated=reminderMedicationOccurrence({schedule:schedule,nowIso:nowIso}); if(!generated.ok||!generated.occurrence) return generated;
  return App.reminderInboxTodayOff(generated.occurrence.occurrenceId,schedule.id,{occurrence:generated.occurrence,reminderId:schedule.id,nowIso:nowIso,timezone:schedule.timezone});
}


function App_openReminderCenter(){
  var root=reminderCurrentRoot(), active=null;
  try{ active=doc.activeElement; }catch(e){ active=null; }
  ui.reminderReturnFocusId=active&&active.id?String(active.id):'sey-reminder-settings-entry';
  if(ui.reminderReturnFocusId==='sey-reminder-screen') ui.reminderReturnFocusId='sey-reminder-settings-entry';
  ui.reminderTargetReturnFocusId=''; ui.reminderCenterOpen=true; ui.reminderPreviewId=''; ui.reminderPreviewLegacyId=''; ui.reminderTodayMuted=false; ui.reminderCenterNotice=''; ui.reminderCenterUndo=null; ui.reminderAllUndo=null; ui.reminderHistoryUndo=null; ui.reminderTestState=null; ui.reminderDigestOpen=false; ui.reminderDigestState='idle'; ui.reminderDigestReflection=''; ui.reminderSetupCategories=reminderCategorySelection(root); reminderLockBodyScroll(); render();
  try{ var screen=doc.getElementById('sey-reminder-screen'); if(screen&&screen.focus) screen.focus(); }catch(e){}
}


function App_openReminderDigest(){
  if(!ui.reminderCenterOpen) return {ok:false,reason:'center-closed'};
  ui.reminderDigestOpen=true; ui.reminderDigestState='open'; ui.reminderDigestReflection='';
  render();
  return {ok:true,localOnly:true,userInitiated:true,notificationCreated:false,persisted:false};
}


function App_openReminderTarget(input){
  var target=reminderDeepLinkTarget(input); if(!target.ok){ App.showReminderUnavailable(input); return target; }
  var x=input&&typeof input==='object'?input:{};
  var sourceFocusId=String(x.returnFocusId||reminderActiveElementId()||ui.reminderReturnFocusId||'');
  if(sourceFocusId==='sey-reminder-screen') sourceFocusId=ui.reminderReturnFocusId||'sey-reminder-settings-entry';
  ui.reminderTargetReturnFocusId=sourceFocusId;
  reminderCloseForTarget();
  if(target.deepLink==='faith') App.openFaithCorner();
  else if(target.deepLink==='zikr') App.openZikr();
  else if(target.deepLink==='room'){
    App.openRoom();
    if(target.therapyToolId&&ui.roomOpen){ ui.roomTab='tools'; ui.roomTool=target.therapyToolId; App.updateRoom(); }
  }
  else if(target.deepLink==='saygi'){ App.go('saygi'); if(x.openDetail===true&&typeof App.openSaygiPreview==='function') App.openSaygiPreview(); }
  else if(target.deepLink==='reading') App.openReading({preserveDraft:true});
  else if(target.deepLink==='gunluk') App.openJournalModal({preserveDraft:true});
  else if(target.deepLink==='health') App.go('saglik');
  else if(target.deepLink==='settings') App.go('ayarlar');
  return target;
}


function App_previewReminder(id){
  var defs=reminderDefinitions(), target=String(id||'');
  if(!target&&defs.length) target=String(defs[0].id||'');
  ui.reminderPreviewId=(ui.reminderPreviewId===target?'':target);
  ui.reminderPreviewLegacyId=ui.reminderPreviewId?target:'';
  ui.reminderTestState=null;
  render();
  return {ok:!!target,reminderId:target,synthetic:true,external:false};
}


function App_previewReminderSafe(id){
  var defs=reminderDefinitions(), target=String(id||'');
  if(!target&&defs.length) target=String(defs[0].id||'');
  ui.reminderPreviewId=(ui.reminderPreviewId===target?'':target); ui.reminderPreviewLegacyId=''; ui.reminderTestState=null; render();
  return {ok:!!target,reminderId:target,synthetic:true,external:false,privateBody:false};
}


function App_reminderEventContract(){
  return {
    personal:{section:'wellness',path:'data.reminders',summary:REMINDER_EVENT_SUMMARY,actions:Object.keys(REMINDER_EVENT_ACTIONS).sort()},
    social:{section:'notifications',path:'data.aeon',summary:'Bildirim yaşam döngüsü güncellendi'},
    persistence:{eventLog:'data.eventLog',deliveryJournal:'localStorage:'+REMINDER_DELIVERY_KEY,actionJournal:'localStorage:'+REMINDER_ACTION_KEY,syncReceipt:'data.syncReceipt'}
  };
}


function App_reminderEventState(){
  var log=ensureEventLog(data);
  try{ return JSON.parse(JSON.stringify(log||{})); }catch(e){ return {schemaVersion:EVENT_LOG_SCHEMA_VERSION,events:[]}; }
}


function App_reminderFullReset(options){
  var x=options&&typeof options==='object'?options:{};
  if(!reminderConfirmAction('Reminder tercihleri, yerel geçmişi ve reminder izin durumu silinsin mi? Bu işlem Şeyma günlük kayıtlarına dokunmaz ve geri alınamaz.',x)) return {ok:false,changed:false,reason:'cancelled'};
  var keys=[REMINDER_DELIVERY_KEY,REMINDER_ACTION_KEY,REMINDER_PERMISSION_STORAGE_KEY], removed=[];
  keys.forEach(function(key){ if(reminderRemoveLocalKey(key)) removed.push(key); });
  setPermissionTransient(null); setPermissionInFlight(null); setPermissionEverGranted(null); setPermissionGrantObserved(false);
  if(data&&typeof data==='object'){
    data.reminders=emptyReminderState();
    try{ if(typeof localStorage!=='undefined') ls.setItem(KEY,JSON.stringify(data)); }catch(e){ return {ok:false,changed:false,reason:'storage-error'}; }
  }
  ui.reminderCenterNotice='Reminder tercihleri ve yerel geçmiş sıfırlandı.'; ui.reminderAllUndo=null; ui.reminderHistoryUndo=null; ui.reminderCenterUndo=null; ui.reminderTodayMuted=false; ui.reminderInboxTodayMuted=false; ui.reminderMedicationDraft=null; ui.reminderMedicationEditingId=''; ui.reminderMedicationError=''; ui.reminderDigestOpen=false; ui.reminderDigestState='idle'; ui.reminderDigestReflection=''; render();
  return {ok:true,changed:true,clearedKeys:removed,undoAvailable:false};
}


function App_reminderInboxEveningTarget(occurrenceId,reminderId,deepLink){
  var id=String(occurrenceId||''), reminder=String(reminderId||''), link=String(deepLink||''), surface=reminderEveningSurface({reminderId:reminder,deepLink:link});
  if(!surface) return {ok:false,reason:'unknown-evening-target'};
  var target=reminderDeepLinkTarget({occurrenceId:id,reminderId:surface.reminderId,deepLink:surface.deepLink,openDetail:surface.deepLink==='saygi',occurrence:{deepLink:surface.deepLink,openDetail:surface.deepLink==='saygi'}});
  if(!target.ok) return target;
  if(id) App.reminderDeliveryOpen({occurrenceId:id,channel:'in_app',now:new Date().toISOString()});
  return App.openReminderTarget(Object.assign({},target,{returnFocusId:reminderActiveElementId()}));
}


function App_reminderInboxOverflow(occurrenceId,action,reminderId,option){
  action=String(action||'');
  if(action==='nowNot') return App.reminderInboxTodayOff(occurrenceId,reminderId);
  if(action==='mute') return App.reminderInboxTodayOff(occurrenceId,reminderId);
  if(action==='todayOff') return App.reminderInboxTodayOff(occurrenceId,reminderId);
  if(action==='snooze') return App.reminderInboxSnooze(occurrenceId,option,reminderId);
  if(action==='disable') return App.reminderDisable(reminderId,{occurrenceId:occurrenceId});
  if(action==='enable') return App.reminderEnable(reminderId);
  if(action==='settings'||action==='details'){
    ui.reminderCenterOpen=true; ui.reminderPreviewId=String(reminderId||''); ui.reminderTodayMuted=false; render();
    return {ok:true,changed:true,reminderId:String(reminderId||''),targetId:'reminder-center'};
  }
  if(action==='open') return App.openReminderTarget({occurrenceId:occurrenceId,reminderId:reminderId});
  return {ok:false,reason:'unknown-action'};
}


function App_reminderInboxPrimary(occurrenceId,reminderId,therapyToolId){
  var nowIso=new Date().toISOString(), id=String(occurrenceId||''), reminder=String(reminderId||''), toolId=reminderTherapyToolFromValue(therapyToolId);
  var target=reminderDeepLinkTarget({occurrenceId:id,reminderId:reminder,therapyToolId:toolId});
  if(!target.ok) return target;
  if(id) App.reminderDeliveryOpen({occurrenceId:id,channel:'in_app',now:nowIso});
  if(window.SeyAudio&&typeof window.SeyAudio.bell==='function') window.SeyAudio.bell();
  return App.openReminderTarget(Object.assign({},target,{returnFocusId:reminderActiveElementId()}));
}


function App_reminderInboxSnooze(occurrenceId,option,reminderId,options){
  var x=options&&typeof options==='object'?Object.assign({},options):{}, id=String(occurrenceId||''), reminder=String(reminderId||x.reminderId||''), nowIso=reminderDeliveryNow(x.nowIso||x.now), occurrence=x.occurrence&&typeof x.occurrence==='object'?x.occurrence:reminderActionOccurrence(id,reminder,Object.assign({},x,{nowIso:nowIso}));
  x.nowIso=nowIso; x.occurrence=occurrence; x.occurrenceId=id; x.reminderId=reminder; x.option=String(option||'');
  var plan=reminderSnoozePlan(x);
  if(!plan.ok) return plan;
  var existing=reminderActionFind(plan.actionId,nowIso);
  if(existing) return {ok:true,duplicate:true,changed:false,reason:null,plan:plan,action:{entry:existing},occurrence:plan.occurrence};
  var original=App.reminderDeliverySnooze({occurrenceId:id,occurrence:occurrence,channel:'in_app',now:nowIso});
  var scheduled=App.reminderDeliverySchedule({occurrenceId:plan.occurrence.occurrenceId,occurrence:plan.occurrence,channel:'in_app',now:nowIso});
  var action=reminderActionCommit({actionId:plan.actionId,action:'snooze',occurrenceId:plan.occurrence.occurrenceId,parentOccurrenceId:id,reminderId:reminder,option:plan.option,scheduledAt:plan.scheduledAt,timezone:plan.timezone,recordedAt:nowIso,status:'scheduled'},nowIso);
  if(original.ok&&scheduled.ok&&action.ok&&!existing) reminderPersonalizationSignalRecord(reminderCurrentRoot(),{type:'snooze',source:'explicit-snooze',reminderId:reminder,value:plan.option},nowIso);
  var actionTarget=ui.reminderCenterOpen?'reminder-center':'reminder-inbox';
  if(action.ok) reminderRenderAction('action-accepted',{target:actionTarget,requiresFullRender:actionTarget==='reminder-center'});
  return {ok:!!(original.ok&&scheduled.ok&&action.ok),duplicate:false,changed:true,reason:original.reason||scheduled.reason||action.reason||null,plan:plan,original:original,scheduled:scheduled,action:action,occurrence:plan.occurrence};
}


function App_reminderInboxTodayOff(occurrenceId,reminderId,options){
  var x=options&&typeof options==='object'?options:{}, id=String(occurrenceId||''), reminder=String(reminderId||x.reminderId||''), nowIso=reminderDeliveryNow(x.nowIso||x.now), actionId='reminder-action-v1:todayOff:'+encodeURIComponent(id), existing=reminderActionFind(actionId,nowIso);
  if(existing) return {ok:true,duplicate:true,changed:false,reason:null,action:{entry:existing}};
  var occurrence=x.occurrence&&typeof x.occurrence==='object'?x.occurrence:reminderActionOccurrence(id,reminder,Object.assign({},x,{nowIso:nowIso})), suppressed=App.reminderDeliverySuppress({occurrenceId:id,occurrence:occurrence,channel:'in_app',reason:'today-muted',now:nowIso}), action=reminderActionCommit({actionId:actionId,action:'todayOff',occurrenceId:id,reminderId:reminder,recordedAt:nowIso,status:'suppressed',reason:'today-muted'},nowIso);
  var actionTarget=ui.reminderCenterOpen?'reminder-center':'reminder-inbox';
  if(action.ok) reminderRenderAction('action-accepted',{target:actionTarget,requiresFullRender:actionTarget==='reminder-center'});
  return {ok:!!(suppressed.ok&&action.ok),duplicate:false,changed:true,reason:suppressed.reason||action.reason||null,suppressed:suppressed,action:action};
}


function App_reminderLifecycleState(){
  return {running:!!reminderLifecycleState.running,lastSource:reminderLifecycleState.lastSource,lastEvaluatedAt:reminderLifecycleState.lastEvaluatedAt,recoveryPending:!!reminderLifecycleState.recoveryPending,candidateSignature:reminderLifecycleState.candidateSignature,candidateChanged:!!reminderLifecycleState.candidateChanged,renderCount:reminderLifecycleState.renderCount,noOpCount:reminderLifecycleState.noOpCount,renderErrorCount:reminderLifecycleState.renderErrorCount,lastRenderReason:reminderLifecycleState.lastRenderReason,renderPolicy:reminderLifecycleState.renderPolicy,renderTarget:reminderLifecycleState.renderTarget,targetedUpdateCount:reminderLifecycleState.targetedUpdateCount,deferredRenderCount:reminderLifecycleState.deferredRenderCount,renderReceipt:reminderLifecycleState.renderReceipt?Object.assign({},reminderLifecycleState.renderReceipt):null,renderReceiptHistory:reminderLifecycleState.renderReceiptHistory.slice(),lastResult:reminderLifecycleState.lastResult?Object.assign({},reminderLifecycleState.lastResult):null,scheduler:reminderSchedulerSnapshot()};
}


function App_reminderMedicationSchedules(){
  var root=reminderCurrentRoot();
  try{ return JSON.parse(JSON.stringify(root&&Array.isArray(root.medications)?root.medications:[])); }catch(e){ return []; }
}


function App_reminderNotificationBoundary(){
  var module=reminderDeliveryModule();
  var deliveryRuntime=typeof window!=='undefined'&&window.ReminderDeliveryV1?window.ReminderDeliveryV1:null;
  var channels=module?module.channels:{
    aeon:{id:'aeon',kind:'social',permissionField:'data.settings.aeonNotifyPermission',permissionScope:'synced-state',tagPrefix:'aeon-',capField:'AEON_NOTIFY_COOLDOWN_MS',historyField:'data.aeon.shownNotificationIds',historyScope:'synced-state',bodySource:'message-content',pushCapable:true,swRole:'show-and-route'},
    reminder:{id:'reminder',kind:'personal',permissionField:'localStorage:'+REMINDER_PERMISSION_STORAGE_KEY,permissionScope:'local-only',tagPrefix:REMINDER_NATIVE_TAG_PREFIX,capField:'data.reminders.policy.nativeDailyCap',historyField:'localStorage:'+REMINDER_ACTION_KEY,historyScope:'local-only',bodySource:'catalog-private-copy',pushCapable:false,swRole:'click-transport-only'}
  };
  var capabilities=module?module.capabilities:{backgroundScheduling:false,backgroundReplay:false,closedAppTimedDelivery:false,reminderPush:false,aeonPush:true,foregroundOnly:true,serviceWorkerRole:'click-transport-only'};
  var disjoint=module&&typeof module.disjointReport==='function'?module.disjointReport():{ok:true,shared:[]};
  return {moduleLoaded:!!module,deliveryRuntimeLoaded:!!deliveryRuntime,channels:channels,capabilities:capabilities,disjoint:disjoint,permissionStates:Object.keys(REMINDER_PERMISSION_STATES).filter(function(state){ return state!=='error'; }),permissionAliases:Object.assign({},REMINDER_PERMISSION_ALIASES)};
}


function App_reminderPersonalizationSuggestions(input){
  var x=input&&typeof input==='object'?Object.assign({},input):{}, root=reminderCurrentRoot();
  if(!Object.prototype.hasOwnProperty.call(x,'personalization')) x.personalization=root&&root.personalization;
  if(!Object.prototype.hasOwnProperty.call(x,'preferences')) x.preferences=root&&root.preferences;
  if(!Object.prototype.hasOwnProperty.call(x,'policy')) x.policy=root&&root.policy;
  return reminderPersonalizationSuggestions(x);
}


function App_reminderRenderPolicy(input){
  var x=input&&typeof input==='object'?input:{}, result=x.result||x, context=x.context||{visibilityState:x.visibilityState||'visible'}, source=String(x.source||'manual');
  return reminderLifecycleRenderPolicy(result,context,source,x);
}


function App_reminderSchemaStatus(){
  var status=reminderSchemaStatusForData(data);
  if(reminderMigrationStatus&&!reminderMigrationStatus.supported) status=Object.assign({},reminderMigrationStatus);
  return status;
}


function App_resetReminderCenter(){
  var root=reminderCurrentRoot(); if(!root) return {ok:false,reason:'no-data'};
  ui.reminderCenterUndo={policy:reminderCenterClone(root.policy),profile:root.profile};
  root.policy=emptyReminderPolicy(); root.profile='balanced';
  ui.reminderCenterNotice='Genel sessizlik ve bütçe ayarları sıfırlandı; kategori kararların korundu.';
  save(); render();
  return {ok:true,categoryOverridesPreserved:true};
}


function App_saveReminderMedicationDraft(){
  var list=reminderMedicationCurrentList(); if(!list) return {ok:false,reason:'no-data'};
  var draft=reminderMedicationDraftState(), editingId=String(ui.reminderMedicationEditingId||''), existing=editingId?reminderMedicationScheduleById(editingId,list):null, nowIso=new Date().toISOString(), raw=Object.assign({},draft,existing?{id:existing.id,createdAt:existing.createdAt,enabled:existing.enabled,timezone:existing.timezone}:{}), normalized=normalizeReminderMedication(raw,{generateId:!existing,nowIso:nowIso});
  if(!normalized){ ui.reminderMedicationError='Adını ve geçerli bir saati birlikte girer misin?'; render(); return {ok:false,reason:'invalid-schedule'}; }
  if(existing) normalized.updatedAt=nowIso;
  if(existing){ var index=list.indexOf(existing); if(index>=0) list[index]=normalized; }
  else list.unshift(normalized);
  list.splice(REMINDER_MEDICATION_MAX_SCHEDULES);
  reminderLocalTouch(reminderCurrentRoot(),'medications',nowIso);
  reminderPersonalizationSignalRecord(reminderCurrentRoot(),{type:'time',source:'explicit-time-choice',reminderId:normalized.id,value:normalized.time},nowIso);
  ui.reminderMedicationDraft=null; ui.reminderMedicationEditingId=''; ui.reminderMedicationError=''; save(); render();
  return {ok:true,schedule:normalized,updated:!!existing};
}


function App_selectReminderDigestReflection(id){
  if(!ui.reminderDigestOpen) return {ok:false,reason:'digest-closed'};
  var option=reminderDigestReflectionOption(id); if(!option) return {ok:false,reason:'unknown-reflection'};
  ui.reminderDigestState='open'; ui.reminderDigestReflection=option.id;
  render();
  return {ok:true,id:option.id,localOnly:true,persisted:false,notificationCreated:false};
}


function App_setReminderCareNativeCategories(categories){
  var next=normalizeReminderCareCategories(categories);
  updateReminderPolicy(function(policy){ policy.careNativeCategories=next.slice(); });
}


function App_setReminderCategoryChannel(category,channel){
  var root=reminderCurrentRoot(), state=root&&reminderCategoryState(root,category); channel=String(channel||'');
  if(!root||!state||!state.defs.length||!REMINDER_CHANNELS[channel]) return {ok:false,reason:'invalid-category-or-channel'};
  var nowIso=new Date().toISOString(); state.defs.forEach(function(def){ var pref=reminderEnsurePreference(root,def.id); pref.channel=channel; pref.lastEditedAt=nowIso; root.preferences[def.id]=normalizeReminderPreference(def.id,pref); reminderPersonalizationSignalRecord(root,{type:'category',source:'explicit-category-choice',reminderId:String(def.id),value:'channel_'+channel},nowIso); }); reminderLocalTouch(root,'preferences',nowIso);
  save(); render();
  var permissionRequest=channel==='native'?reminderPermissionRequest({source:'category:'+String(category||'')}):null;
  return {ok:true,category:String(category||''),channel:channel,permissionRequest:permissionRequest};
}


function App_setReminderCategoryEnabled(category,flag){
  var root=reminderCurrentRoot(), state=root&&reminderCategoryState(root,category); if(!root||!state||!state.defs.length) return;
  var next=typeof flag==='boolean'?flag:!state.allEnabled, nowIso=new Date().toISOString();
  state.defs.forEach(function(def){ var pref=reminderEnsurePreference(root,def.id); pref.enabled=next; pref.lastEditedAt=nowIso; root.preferences[def.id]=normalizeReminderPreference(def.id,pref); reminderPersonalizationSignalRecord(root,{type:'category',source:'explicit-category-choice',reminderId:String(def.id),value:next?'enabled':'disabled'},nowIso); });
  reminderLocalTouch(root,'preferences',nowIso); save(); render();
}


function App_setReminderMedicationDraftField(field,value){
  var allowed={kind:true,name:true,privateLabel:true,time:true,note:true}; if(!allowed[String(field)]) return;
  if(!ui.reminderMedicationDraft||typeof ui.reminderMedicationDraft!=='object') ui.reminderMedicationDraft={kind:'medication',name:'',privateLabel:'',time:'',note:''};
  ui.reminderMedicationDraft[String(field)]=String(value==null?'':value); if(field==='name') ui.reminderMedicationDraft.name=reminderMedicationText(value,REMINDER_MEDICATION_NAME_MAX); if(field==='privateLabel') ui.reminderMedicationDraft.privateLabel=reminderMedicationText(value,REMINDER_MEDICATION_LABEL_MAX); if(field==='note') ui.reminderMedicationDraft.note=reminderMedicationText(value,REMINDER_MEDICATION_NOTE_MAX);
}


function App_setReminderProfile(profileId){
  var root=reminderCurrentRoot(); profileId=String(profileId||'');
  if(!root||!REMINDER_PROFILE_IDS[profileId]) return;
  var pendingSetup=!root.onboarding.completed&&!ui.reminderSetupCategories.length;
  var selected=ui.reminderSetupCategories.length?normalizeReminderCategories(ui.reminderSetupCategories):reminderCategorySelection(root);
  root.profile=normalizeReminderProfile(profileId); reminderLocalTouch(root,'profile',new Date().toISOString());
  if(!pendingSetup) reminderMergeProfileSuggestions(root,profileId,selected);
  save(); render();
}


function App_setReminderSpecialDaysChannel(channel){
  var root=reminderCurrentRoot(), state=reminderSpecialDaysState(root), next=String(channel||''); if(!root||!REMINDER_CHANNELS[next]) return {ok:false,reason:'invalid-channel'};
  state.channel=next; reminderSpecialDaysCommit(root,state,new Date().toISOString()); save(); render();
  var permissionRequest=next==='native'?reminderPermissionRequest({source:'special-days'}):null;
  return {ok:true,preference:App.reminderSpecialDaysPreference(),permissionRequest:permissionRequest};
}


function App_setReminderSpecialDaysMode(mode){
  var root=reminderCurrentRoot(), state=reminderSpecialDaysState(root), next=String(mode||'');
  if(!root||!REMINDER_SPECIAL_DAYS_MODES[next]) return {ok:false,reason:'invalid-mode'};
  state.mode=next; reminderSpecialDaysCommit(root,state,new Date().toISOString()); save(); render(); return {ok:true,preference:App.reminderSpecialDaysPreference()};
}


function App_setReminderSpecialDaysSelection(selection){
  var root=reminderCurrentRoot(), state=reminderSpecialDaysState(root); if(!root) return {ok:false,reason:'no-data'};
  state.selectedDays=normalizeReminderSpecialDaySelection(selection); if(state.selectedDays.length&&state.mode==='none') state.mode='selected'; reminderSpecialDaysCommit(root,state,new Date().toISOString()); save(); render(); return {ok:true,preference:App.reminderSpecialDaysPreference()};
}


function App_setReminderSpecialDaysTime(time){
  var root=reminderCurrentRoot(), state=reminderSpecialDaysState(root); if(!root||!validReminderTime(String(time||''))) return {ok:false,reason:'invalid-time'};
  var nowIso=new Date().toISOString(); state.time=String(time); reminderSpecialDaysCommit(root,state,nowIso); reminderPersonalizationSignalRecord(root,{type:'time',source:'explicit-time-choice',reminderId:REMINDER_SPECIAL_DAYS_ID,value:String(time)},nowIso); save(); render(); return {ok:true,preference:App.reminderSpecialDaysPreference()};
}


function App_setReminderTimeWindow(reminderId,start,end){
  var root=reminderCurrentRoot(), id=String(reminderId||''), definition=reminderActionDefinition(id), from=String(start||''), to=String(end||'');
  if(!root||!definition||!validReminderTime(from)||(to&&!validReminderTime(to))) return {ok:false,reason:'invalid-time-window'};
  var nowIso=new Date().toISOString(), pref=reminderEnsurePreference(root,id); pref.timeWindow={start:from}; if(to) pref.timeWindow.end=to; pref.lastEditedAt=nowIso; root.preferences[id]=normalizeReminderPreference(id,pref); reminderLocalTouch(root,'preferences',nowIso); reminderPersonalizationSignalRecord(root,{type:'time',source:'explicit-time-choice',reminderId:id,value:to?from+'-'+to:from},nowIso); save(); render(); return {ok:true,reminderId:id,timeWindow:pref.timeWindow};
}


function App_showReminderUnavailable(input){
  var result=reminderDeepLinkTarget(input);
  var message=result.reason==='unknown-reminder-target'?'Bu hatırlatmanın hedefi bulunamadı.':'Bu durak şu anda kullanılamıyor; ayarın korunuyor.';
  ui.reminderCenterNotice=message;
  if(ui.reminderCenterOpen) render();
  return Object.assign({},result,{message:message,visible:!!ui.reminderCenterOpen});
}


function App_testReminder(id){
  var defs=reminderDefinitions(), target=String(id||'');
  if(!target&&defs.length) target=String(defs[0].id||'');
  var result={state:reminderPermissionSnapshot(),copy:{title:reminderCopy('inApp.preview.syntheticTitle','Şeyma’da küçük bir durak hazır'),body:reminderCopy('inApp.preview.syntheticResultBody','Bu yalnızca uygulama içinde gösterilen sentetik bir testtir.'),tag:REMINDER_NATIVE_PREVIEW_TAG,deepLink:'settings'}};
  ui.reminderPreviewId=''; ui.reminderPreviewLegacyId=''; ui.reminderTestState={reminderId:target,recordedAt:new Date().toISOString(),synthetic:true};
  // REM-72: test preview doğrudan DOM'da data-reminder-test="synthetic" oluşturmalı;
  // targeted update VM test fikstüründe innerHTML seviyesinde yansımadığı için
  // bu akışı tam render() ile güncelliyoruz. Overlay açıkken render() animasyonu
  // zaten durdurulduğundan "refresh" hissi oluşmaz.
  render();
  return {ok:true,synthetic:true,external:false,notificationCreated:false,copy:result.copy,state:result.state};
}


function App_toggleReminderCareNative(category){
  category=String(category||''); if(REMINDER_CARE_KEYS.indexOf(category)<0) return;
  var current=reminderCareNativeCategories(reminderPolicyForState()), index=current.indexOf(category);
  if(index>=0) current.splice(index,1);
  else { if(current.length>=2){ toast('Native için en fazla iki bakım alanı seçebilirsin.',1800); return; } current.push(category); }
  App.setReminderCareNativeCategories(current);
  if(index<0) reminderPermissionRequest({source:'care:'+category});
}


function App_toggleReminderSetupCategory(category){
  category=String(category||''); if(reminderCategoryIds().indexOf(category)<0) return;
  var selected=normalizeReminderCategories(ui.reminderSetupCategories), index=selected.indexOf(category);
  if(index>=0) selected.splice(index,1);
  else { if(selected.length>=3){ toast('Başlangıçta en fazla üç kategori seçebilirsin.',1800); return; } selected.push(category); }
  ui.reminderSetupCategories=selected; render();
}


function App_toggleReminderSpecialDay(id){
  var root=reminderCurrentRoot(), state=reminderSpecialDaysState(root), key=String(id||''), option=reminderSpecialDayOptionById(key); if(!root||!option) return {ok:false,reason:'unknown-special-day'};
  var selected=state.selectedDays.slice(), index=selected.indexOf(key); if(index>=0) selected.splice(index,1); else selected.push(key);
  state.mode='selected'; state.selectedDays=selected; reminderSpecialDaysCommit(root,state,new Date().toISOString()); save(); render(); return {ok:true,preference:App.reminderSpecialDaysPreference()};
}


function App_undoDisableAllReminders(){
  var x=arguments[0]&&typeof arguments[0]==='object'?arguments[0]:{}, root=reminderCurrentRoot(), snapshot=ui.reminderAllUndo;
  if(!root||!snapshot) return {ok:false,changed:false,reason:'nothing-to-undo'};
  var nowIso=reminderDeliveryNow(x.nowIso||x.now);
  root= data.reminders=reminderCenterClone(snapshot)||emptyReminderState(); migrateReminderState(data);
  Object.keys(root.preferences||{}).forEach(function(id){ var pref=reminderEnsurePreference(root,id); pref.lastEditedAt=nowIso; root.preferences[id]=normalizeReminderPreference(id,pref); });
  ['preferences','specialDays','medications','policy','personalization'].forEach(function(scope){ reminderLocalTouch(root,scope,nowIso); });
  ui.reminderAllUndo=null; ui.reminderCenterNotice='Tüm reminder tercihleri geri alındı.'; save(); render(); return {ok:true,changed:true};
}


function App_undoReminderCenterReset(){
  var root=reminderCurrentRoot(), snapshot=ui.reminderCenterUndo;
  if(!root||!snapshot||!snapshot.policy) return {ok:false,reason:'nothing-to-undo'};
  root.policy=normalizeReminderPolicy(reminderCenterClone(snapshot.policy)); root.profile=normalizeReminderProfile(snapshot.profile);
  ui.reminderCenterUndo=null; ui.reminderCenterNotice='Son genel ayar değişikliği geri alındı.'; save(); render();
  return {ok:true};
}


function App_undoReminderHistory(){
  var snapshot=ui.reminderHistoryUndo;
  if(!snapshot||!snapshot.delivery||!snapshot.actions) return {ok:false,reason:'nothing-to-undo'};
  reminderDeliveryStorageWrite(reminderDeliveryNormalize(snapshot.delivery)); reminderActionStorageWrite(reminderActionNormalize(snapshot.actions));
  ui.reminderHistoryUndo=null; ui.reminderCenterNotice='Son reminder geçmişi geri alındı.'; render();
  return {ok:true};
}

  }

  window.SeymaReminderSurface=Object.freeze({
    REMINDER_SURFACE_DEPENDENCIES:REMINDER_SURFACE_DEPENDENCIES.slice(),
    registerReminderSurface:registerReminderSurface,
    isRegistered:isRegistered,
    liveData:liveData,
    liveUi:liveUi,
    app:app,
mergePersistedReminderState:mergePersistedReminderState,
reminderActionCommit:reminderActionCommit,
reminderActionStorageRead:reminderActionStorageRead,
reminderActionStorageWrite:reminderActionStorageWrite,
reminderActiveElementId:reminderActiveElementId,
reminderCloseForTarget:reminderCloseForTarget,
reminderCurrentRoot:reminderCurrentRoot,
reminderDeliveryClear:reminderDeliveryClear,
reminderDeliveryStorageRead:reminderDeliveryStorageRead,
reminderDeliveryStorageWrite:reminderDeliveryStorageWrite,
reminderLifecycleDefaultContext:reminderLifecycleDefaultContext,
reminderLifecycleDraftActive:reminderLifecycleDraftActive,
reminderLifecycleRenderIfNeeded:reminderLifecycleRenderIfNeeded,
reminderLifecycleReplaceTarget:reminderLifecycleReplaceTarget,
reminderLifecycleUpdateLive:reminderLifecycleUpdateLive,
reminderLockBodyScroll:reminderLockBodyScroll,
reminderNativeDisplay:reminderNativeDisplay,
reminderPermissionCanRequest:reminderPermissionCanRequest,
reminderPermissionEverGrantedRead:reminderPermissionEverGrantedRead,
reminderPermissionRecord:reminderPermissionRecord,
reminderPermissionRequest:reminderPermissionRequest,
reminderPermissionSnapshot:reminderPermissionSnapshot,
reminderPermissionState:reminderPermissionState,
reminderPermissionStorageRead:reminderPermissionStorageRead,
reminderPermissionStorageWrite:reminderPermissionStorageWrite,
reminderPreviewNotification:reminderPreviewNotification,
reminderRemoveLocalKey:reminderRemoveLocalKey,
reminderRestoreFocus:reminderRestoreFocus,
reminderSchedulerDispatch:reminderSchedulerDispatch,
reminderSchedulerEnsure:reminderSchedulerEnsure,
reminderSchedulerSnapshot:reminderSchedulerSnapshot,
reminderSetEnabled:reminderSetEnabled,
reminderSystemOffline:reminderSystemOffline,
reminderUnlockBodyScroll:reminderUnlockBodyScroll,
updateReminderPolicy:updateReminderPolicy,
clearReminderHistory:App_clearReminderHistory,
clearReminderMedicationLocal:App_clearReminderMedicationLocal,
closeReminderCenter:App_closeReminderCenter,
confirmReminderSetup:App_confirmReminderSetup,
deleteReminderMedication:App_deleteReminderMedication,
disableAllReminders:App_disableAllReminders,
dismissReminderDigest:App_dismissReminderDigest,
editReminderMedication:App_editReminderMedication,
handleReminderNativeClick:App_handleReminderNativeClick,
handleReminderServiceWorkerClick:App_handleReminderServiceWorkerClick,
muteReminderMedicationToday:App_muteReminderMedicationToday,
openReminderCenter:App_openReminderCenter,
openReminderDigest:App_openReminderDigest,
openReminderTarget:App_openReminderTarget,
previewReminder:App_previewReminder,
previewReminderSafe:App_previewReminderSafe,
reminderEventContract:App_reminderEventContract,
reminderEventState:App_reminderEventState,
reminderFullReset:App_reminderFullReset,
reminderInboxEveningTarget:App_reminderInboxEveningTarget,
reminderInboxOverflow:App_reminderInboxOverflow,
reminderInboxPrimary:App_reminderInboxPrimary,
reminderInboxSnooze:App_reminderInboxSnooze,
reminderInboxTodayOff:App_reminderInboxTodayOff,
reminderLifecycleState:App_reminderLifecycleState,
reminderMedicationSchedules:App_reminderMedicationSchedules,
reminderNotificationBoundary:App_reminderNotificationBoundary,
reminderPersonalizationSuggestions:App_reminderPersonalizationSuggestions,
reminderRenderPolicy:App_reminderRenderPolicy,
reminderSchemaStatus:App_reminderSchemaStatus,
resetReminderCenter:App_resetReminderCenter,
saveReminderMedicationDraft:App_saveReminderMedicationDraft,
selectReminderDigestReflection:App_selectReminderDigestReflection,
setReminderCareNativeCategories:App_setReminderCareNativeCategories,
setReminderCategoryChannel:App_setReminderCategoryChannel,
setReminderCategoryEnabled:App_setReminderCategoryEnabled,
setReminderMedicationDraftField:App_setReminderMedicationDraftField,
setReminderProfile:App_setReminderProfile,
setReminderSpecialDaysChannel:App_setReminderSpecialDaysChannel,
setReminderSpecialDaysMode:App_setReminderSpecialDaysMode,
setReminderSpecialDaysSelection:App_setReminderSpecialDaysSelection,
setReminderSpecialDaysTime:App_setReminderSpecialDaysTime,
setReminderTimeWindow:App_setReminderTimeWindow,
showReminderUnavailable:App_showReminderUnavailable,
testReminder:App_testReminder,
toggleReminderCareNative:App_toggleReminderCareNative,
toggleReminderSetupCategory:App_toggleReminderSetupCategory,
toggleReminderSpecialDay:App_toggleReminderSpecialDay,
undoDisableAllReminders:App_undoDisableAllReminders,
undoReminderCenterReset:App_undoReminderCenterReset,
undoReminderHistory:App_undoReminderHistory
  });
})();
