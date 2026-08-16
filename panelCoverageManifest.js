// ÆON Panel — P1 coverage manifest ve güvenli observer projection sözleşmesi.
// Ağ, DOM ve localStorage kullanmaz. app/sync/panel yüzeyleri bu saf adapter'ı
// aynı sözleşmeyle tüketir; ham kullanıcı verisi projection'a çıkmadan elenir.
(function(root){
"use strict";

var SECRET_KEYS={ghToken:1,openaiKey:1,syncUrl:1,auth:1,replyToken:1,token:1,password:1,githubToken:1,apiKey:1,accessToken:1,privateKey:1};
var HASH=/^[a-f0-9]{7,128}$/i;
var ISO_MAX=40;
// Terapi günlük/seyrek tutulabildiği için bir haftadan uzun sessizlik "eski" sayılır;
// konum örneği daha sık akan bir sinyal olduğundan eşik daha kısa tutulur.
var THERAPY_STALE_DAYS=7;
var LOCATION_STALE_DAYS=3;
// İki tarih (ISO veya YYYY-MM-DD) arasındaki gün farkını döner (b - a); geçersizse null.
function dayDiff(a,b){
  if(!a||!b) return null;
  var ta=Date.parse(String(a).slice(0,10)+'T00:00:00Z'), tb=Date.parse(String(b).slice(0,10)+'T00:00:00Z');
  if(isNaN(ta)||isNaN(tb)) return null;
  return Math.round((tb-ta)/86400000);
}

// Explicit rules are the audit surface. The final `*` rule deliberately makes
// unknown future fields summary-classified instead of silently unclassified.
var MANIFEST={
  schemaVersion:1,
  manifestVersion:"panel-coverage-v1",
  paths:[
    {path:"version",owner:"app",source:"state",privacy:"public_meta",mode:"full",fallback:"latest"},
    {path:"startDate",owner:"app",source:"state",privacy:"public_meta",mode:"full",fallback:"latest"},
    {path:"lastOpenedDate",owner:"app",source:"state",privacy:"public_meta",mode:"full",fallback:"latest"},
    {path:"lastOpenedAt",owner:"app",source:"state",privacy:"public_meta",mode:"full",fallback:"latest"},
    {path:"savedAt",owner:"app",source:"state",privacy:"public_meta",mode:"full",fallback:"latest"},
    {path:"syncReceipt",owner:"sync",source:"receipt",privacy:"metadata",mode:"redacted",fallback:"receipt"},
    {path:"dailyPhoto",owner:"content",source:"wikimedia_cache",privacy:"public_metadata",mode:"summary",fallback:"latest"},
    {path:"dailyPhoto.error",owner:"content",source:"wikimedia_cache",privacy:"external_error",mode:"redacted",fallback:"summary_only"},
    {path:"dailyPhoto.fetchError",owner:"content",source:"wikimedia_cache",privacy:"external_error",mode:"redacted",fallback:"summary_only"},
    {path:"roomContentHistory",owner:"therapy_room",source:"catalog_history",privacy:"public_metadata",mode:"summary",fallback:"latest"},
    {path:"saygi.collection",owner:"saygi",source:"user_read_state",privacy:"summary",mode:"summary",fallback:"latest"},
    {path:"saygi.streak",owner:"saygi",source:"user_read_state",privacy:"public_meta",mode:"full",fallback:"latest"},
    {path:"saygi.lastReadDate",owner:"saygi",source:"user_read_state",privacy:"public_meta",mode:"full",fallback:"latest"},
    {path:"locNudge",owner:"location",source:"behavior_audit",privacy:"summary",mode:"summary",fallback:"latest"},
    {path:"locationLastTs",owner:"location",source:"device_sensor",privacy:"timestamp",mode:"full",fallback:"latest"},
    {path:"settings.ghToken",owner:"sync",source:"device_secret",privacy:"secret",mode:"redacted",fallback:"never"},
    {path:"settings.openaiKey",owner:"sync",source:"device_secret",privacy:"secret",mode:"redacted",fallback:"never"},
    {path:"settings.syncUrl",owner:"sync",source:"device_secret",privacy:"secret",mode:"redacted",fallback:"never"},
    {path:"settings.auth",owner:"sync",source:"device_secret",privacy:"secret",mode:"redacted",fallback:"never"},
    {path:"profileAssessment.responses",owner:"profile",source:"user_input",privacy:"sensitive_raw",mode:"redacted",fallback:"summary_only"},
    {path:"profileAssessment",owner:"profile",source:"user_input",privacy:"sensitive_summary",mode:"summary",fallback:"latest"},
    {path:"days.*.therapy.firstStep.text",owner:"therapy",source:"user_input",privacy:"sensitive_raw",mode:"redacted",fallback:"summary_only"},
    {path:"days.*.therapy.selfCompassion.prompt",owner:"therapy",source:"user_input",privacy:"sensitive_raw",mode:"redacted",fallback:"summary_only"},
    {path:"days.*.therapy.selfCompassion.note",owner:"therapy",source:"user_input",privacy:"sensitive_raw",mode:"redacted",fallback:"summary_only"},
    {path:"days.*.therapy.decision.optionA",owner:"therapy",source:"user_input",privacy:"sensitive_raw",mode:"redacted",fallback:"summary_only"},
    {path:"days.*.therapy.decision.optionB",owner:"therapy",source:"user_input",privacy:"sensitive_raw",mode:"redacted",fallback:"summary_only"},
    {path:"days.*.therapy.decision.note",owner:"therapy",source:"user_input",privacy:"sensitive_raw",mode:"redacted",fallback:"summary_only"},
    {path:"days.*.therapy.thoughts",owner:"therapy",source:"user_input",privacy:"sensitive_raw",mode:"redacted",fallback:"summary_only"},
    {path:"days.*.therapy.dailyWin.text",owner:"therapy",source:"user_input",privacy:"sensitive_raw",mode:"redacted",fallback:"summary_only"},
    {path:"days.*.therapy.share.note",owner:"therapy",source:"user_input",privacy:"sensitive_raw",mode:"redacted",fallback:"summary_only"},
    {path:"days.*.sleep.windDown.events",owner:"sleep",source:"user_input",privacy:"event_metadata",mode:"redacted",fallback:"summary_only"},
    {path:"days.*.prayer.fetchError",owner:"prayer",source:"external_api",privacy:"external_error",mode:"redacted",fallback:"summary_only"},
    {path:"weather.error",owner:"weather",source:"external_api",privacy:"external_error",mode:"redacted",fallback:"summary_only"},
    {path:"weather.fetchError",owner:"weather",source:"external_api",privacy:"external_error",mode:"redacted",fallback:"summary_only"},
    {path:"location",owner:"location",source:"device_sensor",privacy:"gps_raw",mode:"redacted",fallback:"summary_only"},
    {path:"locationHistory",owner:"location",source:"device_sensor",privacy:"gps_raw",mode:"redacted",fallback:"summary_only"},
    {path:"days.*.movement.track",owner:"location",source:"device_sensor",privacy:"gps_raw",mode:"redacted",fallback:"summary_only"},
    {path:"labResults.*.data",owner:"health",source:"user_input",privacy:"raw_binary",mode:"redacted",fallback:"summary_only"},
    {path:"days.*.media",owner:"media",source:"user_input",privacy:"raw_media",mode:"redacted",fallback:"summary_only"},
    {path:"aeon-media",owner:"media",source:"transport",privacy:"raw_media",mode:"redacted",fallback:"never"},
    {path:"notifications",owner:"app",source:"state",privacy:"summary",mode:"summary",fallback:"latest"},
    // Reminder preferences and delivery are device-local by contract.  Keep
    // the panel fail-closed even if a legacy/incorrect latest fixture carries
    // one of these roots before the sync sanitizer has run.
    {path:"reminders",owner:"reminder",source:"device_local_state",privacy:"local_only",mode:"redacted",fallback:"never"},
    {path:"delivery",owner:"reminder",source:"device_local_state",privacy:"local_only",mode:"redacted",fallback:"never"},
    {path:"deliveryLog",owner:"reminder",source:"device_local_state",privacy:"local_only",mode:"redacted",fallback:"never"},
    {path:"reminderDelivery",owner:"reminder",source:"device_local_state",privacy:"local_only",mode:"redacted",fallback:"never"},
    {path:"reminderDeliveries",owner:"reminder",source:"device_local_state",privacy:"local_only",mode:"redacted",fallback:"never"},
    {path:"reminderHistory",owner:"reminder",source:"device_local_state",privacy:"local_only",mode:"redacted",fallback:"never"},
    {path:"notificationDelivery",owner:"reminder",source:"device_local_state",privacy:"local_only",mode:"redacted",fallback:"never"},
    {path:"eventLog",owner:"sync",source:"event_log",privacy:"metadata",mode:"summary",fallback:"event_files"},
    {path:"eventLog.events",owner:"sync",source:"event_log",privacy:"metadata",mode:"summary",fallback:"event_files"},
    {path:"quranJourney",owner:"quran",source:"state",privacy:"summary",mode:"summary",fallback:"latest"},
    {path:"saygi",owner:"saygi",source:"state",privacy:"summary",mode:"summary",fallback:"latest"},
    {path:"*",owner:"app",source:"state",privacy:"summary",mode:"summary",fallback:"latest"}
  ],
  expectedPaths:[
    "days","settings","profileAssessment","location","locationHistory",
    "notifications","quranJourney","saygi","dailyPhoto","roomContentHistory",
    "locNudge","locationLastTs","labResults","aeon","eventLog"
  ]
};

function isObject(v){ return !!v&&typeof v==='object'; }
function own(o,k){ return Object.prototype.hasOwnProperty.call(o,k); }
function cloneJson(v){ try{ return JSON.parse(JSON.stringify(v)); }catch(e){ return null; } }
function pathParts(path){ return String(path||'').split('.').filter(function(x){return x!=='';}); }
function pathText(parts){ return parts.join('.'); }
function globMatches(pattern,parts){
  var pp=pathParts(pattern), p=parts||[];
  if(pp.length!==p.length) return false;
  for(var i=0;i<pp.length;i++) if(pp[i]!=='*'&&pp[i]!==p[i]) return false;
  return true;
}
function ruleForPath(path){
  var parts=Array.isArray(path)?path:pathParts(path), best=null, score=-1;
  MANIFEST.paths.forEach(function(rule){
    if(!globMatches(rule.path,parts)) return;
    var rp=pathParts(rule.path), s=rp.reduce(function(n,x){return n+(x==='*'?0:2);},0)+rp.length;
    if(s>score){ best=rule; score=s; }
  });
  if(!best) best=MANIFEST.paths[MANIFEST.paths.length-1];
  return best;
}
var FULL_DETAIL_ALLOW={
  'days':1,'days.*':1,'days.*.habits':1,
  'days.*.mood':1,'days.*.note':1,'days.*.intention':1,'days.*.journal':1,'days.*.journal.text':1,'days.*.journal.mode':1,'days.*.journal.wordCount':1,'days.*.journal.charCount':1,'days.*.journal.savedAt':1,'days.*.journal.streakAtSave':1,'days.*.journal.metGoal':1,'days.*.journal.promptUsed':1,
  'days.*.gratitude':1,'days.*.savedAt':1,'days.*.dayIndex':1,
  'days.*.cravingSOSCount':1,'days.*.cravingOptionsUsed':1,'days.*.cravingTriggers':1,'days.*.craving10MinDone':1,'days.*.foodCravingDone':1,'days.*.coffeeCravingDone':1,'days.*.cravingTriggerNote':1,
  'days.*.meals':1,'days.*.mealItems':1,'days.*.water':1,'days.*.caffeine':1,'days.*.caffeine.last':1,'days.*.caffeine.cups':1,'days.*.caffeine.drinks':1,
  'days.*.energy':1,'days.*.stress':1,
  'days.*.sleep':1,'days.*.sleep.hours':1,'days.*.sleep.quality':1,'days.*.sleep.med':1,'days.*.sleep.med.type':1,'days.*.sleep.med.note':1,'days.*.sleep.windDown':1,'days.*.sleep.windDown.steps':1,'days.*.sleep.windDown.lastMinutes':1,'days.*.sleep.windDown.lastDoneAt':1,'days.*.sleep.windDown.offloadNote':1,'days.*.sleep.windDown.sessions':1,
  'days.*.walk':1,'days.*.walk.steps':1,'days.*.walk.minutes':1,
  'days.*.health':1,'days.*.health.steps':1,'days.*.health.walkM':1,'days.*.health.updatedAt':1,
  'days.*.movement':1,'days.*.movement.walkM':1,'days.*.movement.vehicleM':1,'days.*.movement.totalM':1,'days.*.movement.maxSpeed':1,'days.*.movement.samples':1,'days.*.movement.walkSec':1,'days.*.movement.vehicleSec':1,
  'days.*.location':1,'days.*.location.segments':1,'days.*.location.summary':1,
  'days.*.discomfort':1,'days.*.discomfort.regions':1,'days.*.discomfort.note':1,'days.*.discomfort.meds':1,
  'days.*.therapy':1,'days.*.therapy.breath':1,'days.*.therapy.breath.pattern':1,'days.*.therapy.breath.seconds':1,'days.*.therapy.breath.completedAt':1,
  'days.*.prayer':1,'days.*.prayer.fajr':1,'days.*.prayer.sunrise':1,'days.*.prayer.dhuhr':1,'days.*.prayer.asr':1,'days.*.prayer.maghrib':1,'days.*.prayer.isha':1,
  'days.*.reading':1,'days.*.reading.entries':1,'days.*.watching':1,'days.*.watching.entries':1,'days.*.listening':1,'days.*.listening.entries':1,'days.*.learning':1,'days.*.learning.entries':1,
  'days.*.soulActivities':1,'days.*.soulActivities.*':1,
  'days.*.nutri':1,'days.*.magnesium':1,'days.*.sessions':1,
  'settings':1,'settings.targets':1,'settings.prayer':1,'settings.theme':1,'settings.panelSummarySharingAccepted':1,'settings.profileProcessingAccepted':1,'settings.sensitiveDataAccepted':1,'settings.shareProfileSummary':1,
  'quranJourney':1,'saygi':1,'saygi.collection':1,'saygi.streak':1,'saygi.lastReadDate':1,'saygi.daily':1,
  'library':1,'watchlist':1,'music':1,'soulArchive':1,'dailyPhoto':1,'roomContentHistory':1,'notifications':1,'eventLog':1,'aeon':1,'aeon.qa':1,
  'zikr':1,'zikr.sessions':1,'zikr.lifetimeCount':1,'zikr.activeHatimId':1,'zikr.hatims':1,'zikr.presets':1,'zikr.editorialVersion':1
};
function fullDetailAllowed(path){
  var parts=Array.isArray(path)?path:pathParts(path), p=pathText(parts);
  if(FULL_DETAIL_ALLOW[p]) return true;
  // parent wildcard match for day-level arrays/objects
  if(parts.length>=2 && parts[0]==='days' && !/^\d+$/.test(parts[1])){
    var wildcard=parts.slice(0,2).concat(['*']).join('.');
    if(FULL_DETAIL_ALLOW[wildcard]) return true;
  }
  return false;
}
function modeForPath(parts,key,value,opts){
  var p=pathText(parts), low=p.toLowerCase(), k=String(key||'').toLowerCase();
  if(SECRET_KEYS[k]||SECRET_KEYS[String(key||'')]) return 'redacted';
  if(k==='base64'||k==='dataurl'||k==='contentbase64'||k==='raw') return 'redacted';
  if(/location|gps|movement|track/i.test(low)&&/^(lat|lng|lon|latitude|longitude|accuracy)$/.test(k)) return 'redacted';
  if((k==='data'||k==='content')&&(/media|attachment|upload|file|labresult|aeon/i.test(low)||typeof value!=='string'||String(value).length>40)) return 'redacted';
  if(opts&&opts.fullDetail&&fullDetailAllowed(parts)) return 'full';
  return ruleForPath(parts).mode||'summary';
}
function addUnique(a,v){ if(a.indexOf(v)<0) a.push(v); }
function walkCoverage(value,parts,out,opts){
  var rule=ruleForPath(parts), mode=rule.mode||'summary';
  if(opts&&opts.fullDetail) mode=modeForPath(parts,null,null,opts);
  if(parts.length && mode==='redacted'){
    addUnique(out.redacted,pathText(parts));
    return;
  }
  if(!isObject(value)||Array.isArray(value)&&value.length===0){
    if(parts.length) addUnique(out[mode]||out.summary,pathText(parts));
    return;
  }
  var keys=Object.keys(value);
  if(!keys.length){ if(parts.length) addUnique(out[mode]||out.summary,pathText(parts)); return; }
  keys.forEach(function(k){
    var next=parts.concat([k]), childMode=modeForPath(next,k,value[k],opts);
    if(childMode==='redacted') addUnique(out.redacted,pathText(next));
    else if(childMode==='full'){ addUnique(out.full,pathText(next)); if(isObject(value[k])&&!(Array.isArray(value[k])&&value[k].length===0)) walkCoverage(value[k],next,out,opts); }
    else if(isObject(value[k])&&!(Array.isArray(value[k])&&value[k].length===0)) walkCoverage(value[k],next,out,opts);
    else addUnique(out[childMode]||out.summary,pathText(next));
  });
}
function hasPath(obj,path){
  var cur=obj;
  for(var i=0, p=pathParts(path);i<p.length;i++){
    if(!isObject(cur)||!own(cur,p[i])) return false;
    cur=cur[p[i]];
  }
  return true;
}
function coverageForData(data,opts){
  opts=opts||{};
  var out={full:[],summary:[],redacted:[],missing:[],unmappedPaths:[]};
  walkCoverage(isObject(data)?data:{},[],out,opts);
  MANIFEST.expectedPaths.forEach(function(p){ if(!hasPath(data,p)) addUnique(out.missing,p); });
  ["full","summary","redacted","missing","unmappedPaths"].forEach(function(k){ out[k].sort(); });
  return out;
}
function redactedPaths(){ return MANIFEST.paths.filter(function(r){ return r.mode==='redacted'; }).map(function(r){ return r.path; }); }

function safeIso(v){
  if(typeof v!=='string'||!v||v.length>ISO_MAX) return null;
  var t=Date.parse(v); return isNaN(t)?null:new Date(t).toISOString();
}
function safeHash(v){ return typeof v==='string'&&HASH.test(v)?v:null; }
function safeText(v,max){ return typeof v==='string'&&v.length<=(max||160)?v:null; }
function safeReceipt(receipt){
  var r=isObject(receipt)?receipt:{};
  var statuses={idle:1,local_saved:1,queued:1,saving:1,retrying:1,accepted:1,error:1,offline:1,permission:1,unauthorized:1,forbidden:1,not_found:1,conflict:1,anti_clobber:1,rate_limited:1,receipt_failed:1};
  var errors={offline:1,unauthorized:1,forbidden:1,not_found:1,conflict:1,anti_clobber:1,validation:1,rate_limited:1,projection_failed:1,media_unavailable:1,network:1,receipt_failed:1,unknown:1};
  return {schemaVersion:1,status:statuses[r.status]?r.status:'idle',snapshotRevision:safeHash(r.snapshotRevision),sourceUpdatedAt:safeIso(r.sourceUpdatedAt),submittedAt:safeIso(r.submittedAt),acceptedAt:safeIso(r.acceptedAt),sourceLatestSha:safeHash(r.sourceLatestSha),lastErrorCode:errors[r.lastErrorCode]?r.lastErrorCode:null};
}
// ── PANEL-007 event adapter ────────────────────────────────────────────────
var EVENT_SECTIONS={wellness:1,mood:1,sleep:1,nutrition:1,content:1,therapy:1,profile:1,notifications:1,location:1,settings:1,quran:1,faith:1,sync:1,system:1,unknown:1};
var EVENT_OPERATIONS={create:1,update:1,delete:1,complete:1,record:1,accepted:1,retry:1,merge:1,sync_submitted:1};
var EVENT_SAFE_SUMMARIES={'Kriz desteği kaydı güncellendi':1,'Yansıtma/pratik kaydı güncellendi':1,'İçerik/arşiv kaydı güncellendi':1,'Profil ilerlemesi güncellendi':1,'Bildirim yaşam döngüsü güncellendi':1,'Konum/hareket kaydı güncellendi':1,'İman/okuma kaydı güncellendi':1,'Uyku/beden kaydı güncellendi':1,'Beslenme kaydı güncellendi':1,'Ayarlar güncellendi':1,'Uygulama kaydı güncellendi':1,'Güvenli kayıt özeti':1};
function eventPart(v,max){ var s=typeof v==='string'?v.trim():''; return s&&s.length<=(max||120)&&/^[a-zA-Z0-9:_./*-]+$/.test(s)?s:null; }
function eventSummary(v){
  var s=String(v||'').replace(/[\r\n\t]+/g,' ').trim().slice(0,120);
  if(!s||!EVENT_SAFE_SUMMARIES[s]||/ghp_|github_pat_|sk-[a-z0-9_-]{8,}/i.test(s)||/\b(?:lat|lon|latitude|longitude)\s*[:=]/i.test(s)) return 'Güvenli kayıt özeti';
  return s;
}
function normalizeEvent(e,fallbackDevice){
  if(!isObject(e)||Array.isArray(e)) return null;
  var seq=Number(e.sequence), id=eventPart(e.eventId,180), occurred=safeIso(e.occurredAt);
  if(!id||!isFinite(seq)||seq<1||Math.floor(seq)!==seq||!occurred) return null;
  var device=eventPart(e.sourceDeviceId||fallbackDevice,96); if(!device) return null;
  return {eventId:id,correlationId:eventPart(e.correlationId,180)||id,sequence:seq,occurredAt:occurred,persistedAt:safeIso(e.persistedAt)||occurred,submittedAt:safeIso(e.submittedAt),acceptedAt:safeIso(e.acceptedAt),section:EVENT_SECTIONS[e.section]?e.section:'unknown',path:eventPart(e.path,160)||'data',operation:EVENT_OPERATIONS[e.operation]?e.operation:'update',summary:eventSummary(e.summary),source:eventPart(e.source,40)||'app',sourceDeviceId:device,privacyClass:eventPart(e.privacyClass,40)||'summary',snapshotRevision:safeHash(e.snapshotRevision)};
}
function parseEventLog(raw,date){
  var x=raw; try{ if(typeof x==='string') x=JSON.parse(x); }catch(e){ return {ok:false,code:'event_log_parse_failed',date:date||null,events:[]}; }
  var arr=Array.isArray(x)?x:(x&&Array.isArray(x.events)?x.events:[]), out=[], seen={};
  arr.forEach(function(e){ var n=normalizeEvent(e,e&&e.sourceDeviceId); if(n&&!seen[n.eventId]){seen[n.eventId]=true;out.push(n);} });
  return {ok:!!(x&&typeof x==='object'),code:null,date:safeText((x&&x.date)||date,32),events:out};
}
function mergeEventLogs(a,b){
  var left=parseEventLog(a||{}).events,right=parseEventLog(b||{}).events,out=[],seen={};
  left.concat(right).forEach(function(e){ if(!seen[e.eventId]){seen[e.eventId]=true;out.push(e);} });
  out.sort(function(x,y){ return String(x.occurredAt).localeCompare(String(y.occurredAt))||x.sequence-y.sequence||String(x.eventId).localeCompare(String(y.eventId)); });
  return out;
}
function eventSequenceAudit(events){
  var groups={},issues=[],lastInput={};
  (Array.isArray(events)?events:[]).forEach(function(e){
    if(!e||!e.sourceDeviceId) return;
    var d=e.sourceDeviceId, seq=Number(e.sequence); groups[d]=groups[d]||[];
    if(lastInput[d]!=null&&seq<lastInput[d]) issues.push({kind:'out_of_order',device:d,sequence:seq,previous:lastInput[d]});
    if(lastInput[d]===seq) issues.push({kind:'duplicate_sequence',device:d,sequence:seq});
    lastInput[d]=seq; groups[d].push(e);
  });
  Object.keys(groups).forEach(function(d){
    var arr=groups[d].slice().sort(function(a,b){return a.sequence-b.sequence;}), prev=null;
    arr.forEach(function(e){ if(prev!==null&&e.sequence>prev+1) issues.push({kind:'sequence_gap',device:d,from:prev,to:e.sequence}); prev=e.sequence; });
  });
  return {ok:issues.length===0,issueCount:issues.length,issues:issues,deviceCount:Object.keys(groups).length};
}
function locationSummary(v){
  if(!isObject(v)) return null;
  var ts=safeIso(v.ts||v.updatedAt||v.savedAt);
  return {available:true,ts:ts,updatedAt:ts,source:safeText(v.source||v.mode||'device',32),privacy:'redacted'};
}
function historySummary(v){
  if(!Array.isArray(v)) return [];
  return v.slice(-200).map(function(x){
    if(!isObject(x)) return null;
    return {ts:safeIso(x.ts||x.updatedAt||x.savedAt||x.date),mode:safeText(x.mode||x.source||'record',32)};
  }).filter(Boolean);
}
function safeUrl(v){ return typeof v==='string'&&/^https?:\/\//i.test(v)&&v.length<=512?v:null; }
function validNumber(v){ return typeof v==='number'&&!isNaN(v)?v:null; }
function dailyPhotoProjection(v,referenceDate){
  var p=isObject(v)?v:{}, date=safeText(p.date,32), fetchedAt=safeIso(p.fetchedAt), error=safeErrorCode(p.error||p.fetchError), source=safeText(p.source,160), license=safeText(p.license,160), title=safeText(p.title,240), artist=safeText(p.artist,160), pageUrl=safeUrl(p.pageUrl), imageUrl=safeUrl(p.url);
  var stale=!!p.stale||p.cacheState==='stale'||!!(date&&referenceDate&&date!==referenceDate);
  var hasAny=!!(date||fetchedAt||title||artist||license||source||pageUrl||imageUrl||error);
  var ready=!!(title&&license&&source&&pageUrl&&fetchedAt&&!stale&&!error);
  return {status:error?'error':!hasAny?'missing':stale?'stale':ready?'ready':'incomplete',ready:ready,date:date,title:title,artist:artist,license:license,source:source,pageUrl:pageUrl,imageUrl:imageUrl,fetchedAt:fetchedAt,cacheState:stale?'stale':(fetchedAt?'fresh':'empty'),error:error,errorCode:error,sourcePath:'data.dailyPhoto',privacy:'public_metadata'};
}
function roomItemProjection(v,type,shownAt,day){
  var x=isObject(v)?v:{}, title=safeText(x.title,240);
  if(!title) return null;
  return {day:safeText(day,32),type:type,title:title,creator:safeText(x.creator||x.artist,180),year:validNumber(x.year),source:safeText(x.source,180),url:safeUrl(x.url),shownAt:safeIso(shownAt),privacy:'public_metadata'};
}
function roomHistoryProjection(v){
  if(!isObject(v)) return {status:'missing',count:0,invalidCount:0,records:[],sourcePath:'data.roomContentHistory',privacy:'public_metadata'};
  var records=[], invalid=0, types=[['read','kitap'],['watch','izleme'],['listen','ses']];
  Object.keys(v).sort().forEach(function(day){
    var row=v[day];
    if(!isObject(row)){ invalid++; return; }
    types.forEach(function(pair){ var item=roomItemProjection(row[pair[0]],pair[1],row.shownAt,day); if(item) records.push(item); else if(row[pair[0]]!==undefined) invalid++; });
  });
  records.sort(function(a,b){ return String(b.shownAt||b.day).localeCompare(String(a.shownAt||a.day)); });
  return {status:records.length?'ok':(invalid?'malformed':'missing'),count:records.length,invalidCount:invalid,latestShownAt:records.length?records[0].shownAt:null,records:records.slice(0,40),sourcePath:'data.roomContentHistory',privacy:'public_metadata'};
}
function previousDateString(v){
  if(typeof v!=='string'||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(v)) return null;
  var d=new Date(v+'T00:00:00Z'); if(isNaN(d.getTime())) return null; d.setUTCDate(d.getUTCDate()-1); return d.toISOString().slice(0,10);
}
function saygiProjection(root,days){
  var r=isObject(root)?root:{}, collection=isObject(r.collection)?r.collection:{}, entries=[], evidenceByDate={}, evidenceIds={};
  Object.keys(collection).forEach(function(id){ var x=collection[id]; if(!isObject(x)) return; entries.push({id:safeText(id,120),name:safeText(x.name||id,180),field:safeText(x.field,120),readAt:safeIso(x.readAt),favorite:!!x.favorite,privacy:'public_metadata'}); });
  if(isObject(days)) Object.keys(days).forEach(function(date){
    var d=days[date], s=d&&d.saygi;
    if(s&&isObject(s)&&s.readAt&&s.personId){ var ds=safeText(date,32), id=safeText(s.personId,120); evidenceByDate[ds]=true; evidenceIds[id]=true; }
    var en=d&&d.reading&&Array.isArray(d.reading.entries)?d.reading.entries:[];
    en.forEach(function(e){ if(e&&e.source==='saygi'&&e.personId){ var ed=safeText(date,32), eid=safeText(e.personId,120); evidenceByDate[ed]=true; evidenceIds[eid]=true; } });
  });
  var dates=Object.keys(evidenceByDate).sort(), dailyLatest=dates.length?dates[dates.length-1]:null, rootLast=safeText(r.lastReadDate,32), rootStreak=validNumber(r.streak)||0, dailyStreak=0, cursor=dailyLatest;
  while(cursor&&evidenceByDate[cursor]){ dailyStreak++; cursor=previousDateString(cursor); }
  var reasons=[];
  if(rootLast!==dailyLatest&&(rootLast||dailyLatest)) reasons.push('root_lastReadDate_daily_evidence_mismatch');
  if(rootStreak!==dailyStreak&&dailyLatest) reasons.push('root_streak_daily_evidence_mismatch');
  if(Object.keys(evidenceIds).length>entries.length) reasons.push('daily_person_not_in_root_collection');
  return {status:reasons.length?'mismatch':(entries.length||dates.length?'ok':'missing'),collection:entries.slice(0,200),collectionCount:entries.length,rootStreak:rootStreak,rootLastReadDate:rootLast,dailyEvidenceCount:dates.length,dailyEvidenceDates:dates.slice(-40),dailyLatestReadDate:dailyLatest,dailyDerivedStreak:dailyStreak,mismatch:reasons.length>0,mismatchReasons:reasons,sourcePath:'data.saygi + data.days.*.saygi',privacy:'public_metadata'};
}
function locNudgeProjection(v){
  if(!isObject(v)||!Object.keys(v).length) return {status:'missing',shownCount:0,dismissCount:0,dismissStreak:0,dayCount:0,lastShownAt:null,snoozeUntil:null,optOutDay:null,optedOut:false,derivedBackoffHours:0,sourcePath:'data.locNudge',privacy:'behavior_summary'};
  var malformed=false;
  ['shownCount','dismissCount','dismissStreak','dayCount'].forEach(function(k){ if(v[k]!==undefined&&validNumber(v[k])===null) malformed=true; });
  var streak=Math.max(0,validNumber(v.dismissStreak)||0);
  return {status:malformed?'malformed':'ok',shownCount:Math.max(0,validNumber(v.shownCount)||0),dismissCount:Math.max(0,validNumber(v.dismissCount)||0),dismissStreak:streak,dayCount:Math.max(0,validNumber(v.dayCount)||0),dayKey:safeText(v.dayKey,32),lastShownAt:safeIso(v.lastShownAt),snoozeUntil:safeIso(v.snoozeUntil),optOutDay:safeText(v.optOutDay,32),optedOut:!!v.optedOut,derivedBackoffHours:Math.min(24,streak*2),sourcePath:'data.locNudge',privacy:'behavior_summary'};
}
function locationTimingProjection(d,r,date){
  var root=isObject(d)?d:{}, loc=isObject(root.location)?root.location:null;
  var sampleTs=safeIso(loc&&loc.ts), processedTs=safeIso(root.locationLastTs), syncAcceptedAt=safeIso(r&&r.acceptedAt), malformed=!!(loc&&loc.ts!==undefined&&loc.ts!==null&&!sampleTs)||(root.locationLastTs!==undefined&&root.locationLastTs!==null&&!processedTs);
  var latestKnown=[sampleTs,processedTs].filter(Boolean).sort().slice(-1)[0]||null;
  var gap=latestKnown&&date?dayDiff(latestKnown,date):null;
  var stale=!malformed&&!!latestKnown&&gap!==null&&gap>LOCATION_STALE_DAYS;
  return {status:malformed?'malformed':(stale?'stale':(sampleTs||processedTs?'ok':'missing')),sampleTs:sampleTs,processedTs:processedTs,syncAcceptedAt:syncAcceptedAt,daysSinceLastSample:gap,sourceSample:'data.location.ts',sourceProcessed:'data.locationLastTs',sourceSync:'data.syncReceipt.acceptedAt',privacy:'timestamp_only'};
}
function settingsProjection(d){
  var root=isObject(d)?d:{}, s=isObject(root.settings)?root.settings:{}, pr=isObject(s.prayer)?s.prayer:{}, mg=isObject(s.magnesium)?s.magnesium:{};
  return {sourcePath:'data.settings',changedAt:safeIso(root.savedAt),perKeyAudit:false,tracked:{locationEnabled:typeof s.locationEnabled==='boolean'?s.locationEnabled:null,locationMode:safeText(s.locationMode,24),caffeineMode:safeText(s.caffeineMode,24),targetBed:safeText(s.targetBed,8),hideLocationCard:typeof s.hideLocationCard==='boolean'?s.hideLocationCard:null,hideRepoBanner:typeof s.hideRepoBanner==='boolean'?s.hideRepoBanner:null,profileAssessmentInactive:typeof s.profileAssessmentInactive==='boolean'?s.profileAssessmentInactive:null,aeonNotifyPermission:safeText(s.aeonNotifyPermission,24),prayerMethod:safeText(pr.method,24),prayerRemindersEnabled:typeof pr.remindersEnabled==='boolean'?pr.remindersEnabled:null,magnesiumEnabled:typeof mg.enabled==='boolean'?mg.enabled:null},privacy:'preferences_summary'};
}
function safeErrorCode(v){
  if(v===null||v===undefined||v==='') return null;
  var s=String(v).toLowerCase(), codes=['timeout','network','offline','unauthorized','forbidden','not_found','rate_limited','invalid','empty','unavailable','permission','conflict'];
  for(var i=0;i<codes.length;i++) if(s.indexOf(codes[i])>=0) return codes[i];
  return 'external_error';
}
function safeStage(v){
  var s=String(v||'').toLowerCase(), allowed={queued:1,sent:1,delivered:1,read:1,seen:1,deleted:1,synced:1,error:1,retrying:1,pending:1};
  return allowed[s]?s:null;
}
function boolPresent(v){ return typeof v==='string'?!!v.trim():v!==null&&v!==undefined; }
// data.days üzerinde, verilen tarihten ÖNCEKİ günler içinde anlamlı terapi
// içeriği (düşünce/karar/paylaşım) taşıyan en güncel gün anahtarını bulur.
// Ham düşünce/karar metnini döndürmez — yalnız tarih (meta veri).
function lastTherapyRecordDate(days,beforeDate){
  if(!isObject(days)) return null;
  var keys=Object.keys(days).filter(function(k){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(k)) return false;
    if(beforeDate&&k>=beforeDate) return false;
    var t=isObject(days[k])&&isObject(days[k].therapy)?days[k].therapy:null;
    if(!t) return false;
    return (Array.isArray(t.thoughts)&&t.thoughts.length>0)||isObject(t.decision)||isObject(t.share);
  });
  if(!keys.length) return null;
  keys.sort();
  return keys[keys.length-1];
}
function therapyProjection(source,date){
  var root=isObject(source)?source:{}, days=isObject(root.days)?root.days:{}, rec=isObject(days[date])?days[date]:null, t=rec&&isObject(rec.therapy)?rec.therapy:null, pa=isObject(root.profileAssessment)?root.profileAssessment:{}, consent=isObject(pa.consent)?pa.consent:{};
  if(!t){
    var lastDate=lastTherapyRecordDate(days,date), gap=lastDate?dayDiff(lastDate,date):null, stale=!!lastDate&&gap!==null&&gap>THERAPY_STALE_DAYS;
    return {status:stale?'stale':'missing',date:safeText(date,32),thoughtCount:0,thoughts:[],decision:null,share:null,windDown:{status:'missing',eventCount:0,totalMinutes:0,events:[]},consent:{panelSummarySharingAccepted:consent.panelSummarySharingAccepted===true,sensitiveDataAccepted:consent.sensitiveDataAccepted===true,rawText:'redacted'},sourcePath:'data.days.'+safeText(date,32)+'.therapy',provenance:'redacted',privacy:'sensitive_redacted',lastRecordedDate:lastDate,daysSinceLastRecord:gap};
  }
  var thoughts=[], invalidThoughts=0;
  if(Array.isArray(t.thoughts)) t.thoughts.forEach(function(x,i){
    if(!isObject(x)){ invalidThoughts++; return; }
    thoughts.push({index:i+1,createdAt:safeIso(x.createdAt),fields:{situation:boolPresent(x.situation),thought:boolPresent(x.thought),evidenceFor:boolPresent(x.evidenceFor),evidenceAgainst:boolPresent(x.evidenceAgainst),altThought:boolPresent(x.altThought)},summary:'Metin redacted',provenance:'redacted',privacy:'sensitive_redacted'});
  });
  var de=isObject(t.decision)?t.decision:null, decision=de?{status:safeStage(de.choice)?'chosen':(de.completedAt?'completed':'started'),choice:safeText(de.choice,80),completedAt:safeIso(de.completedAt),optionCount:(boolPresent(de.optionA)?1:0)+(boolPresent(de.optionB)?1:0),notePresent:boolPresent(de.note),note:null,noteStatus:boolPresent(de.note)?'redacted':'empty',provenance:'user_input',privacy:'sensitive_redacted'}:null;
  var sh=isObject(t.share)?t.share:null, deliveredAt=sh&&safeIso(sh.deliveredAt||sh.receivedAt||sh.syncedAt), share=sh?{status:safeStage(sh.status)||(deliveredAt?'delivered':(sh.sentAt?'sent':'pending')),sentAt:safeIso(sh.sentAt),deliveredAt:deliveredAt,syncedAt:safeIso(sh.syncedAt),notePresent:boolPresent(sh.note),note:null,noteStatus:boolPresent(sh.note)?'redacted':'empty',provenance:deliveredAt?'delivery':'user_input',privacy:'sensitive_redacted'}:null;
  var wd=rec&&rec.sleep&&isObject(rec.sleep.windDown)?rec.sleep.windDown:null, events=[], invalidEvents=0,totalMinutes=0;
  if(wd&&Array.isArray(wd.events)) wd.events.forEach(function(x){
    if(!isObject(x)){ invalidEvents++; return; }
    var mins=validNumber(x.minutes), seconds=validNumber(x.durationSeconds||x.seconds), type=safeText(x.type||x.event||x.name,60);
    if(mins===null&&seconds!==null) mins=Math.round(seconds/60*10)/10;
    if(mins!==null&&mins>=0) totalMinutes+=mins;
    events.push({type:type||'event',minutes:mins===null?null:Math.max(0,mins),at:safeIso(x.ts||x.at||x.startedAt),provenance:'user_input',privacy:'event_metadata'});
  });
  var steps=wd&&isObject(wd.steps)?['light','breath','dump','cool'].filter(function(k){return wd.steps[k]===true;}).length:0;
  var windDown={status:invalidEvents?'malformed':(events.length||steps?'ok':'missing'),eventCount:events.length,invalidCount:invalidEvents,totalMinutes:Math.round(totalMinutes*10)/10,completedSteps:steps,events:events.slice(0,40),provenance:events.length?'user_input':'derived',privacy:'event_metadata'};
  return {status:invalidThoughts||invalidEvents?'malformed':'ok',date:safeText(date,32),thoughtCount:thoughts.length,invalidThoughts:invalidThoughts,thoughts:thoughts.slice(0,40),decision:decision,share:share,windDown:windDown,consent:{panelSummarySharingAccepted:consent.panelSummarySharingAccepted===true,sensitiveDataAccepted:consent.sensitiveDataAccepted===true,rawText:'redacted'},sourcePath:'data.days.'+safeText(date,32)+'.therapy + sleep.windDown',provenance:'user_input',privacy:'sensitive_redacted'};
}
function profileProgressProjection(source){
  var root=isObject(source)?source:{}, pa=isObject(root.profileAssessment)?root.profileAssessment:null;
  if(!pa) return {status:'missing',responseCount:0,currentItemIndex:null,startedAt:null,completedAt:null,consent:{},rawResponses:'redacted',sourcePath:'data.profileAssessment',provenance:'derived',privacy:'sensitive_redacted'};
  var responses=isObject(pa.responses)?pa.responses:{}, progress=validNumber(pa.currentItemIndex), status=safeStage(pa.status)||safeText(pa.status,24)||'unknown', c=isObject(pa.consent)?pa.consent:{};
  return {status:status,responseCount:Object.keys(responses).length,currentItemIndex:progress,startedAt:safeIso(pa.startedAt),completedAt:safeIso(pa.completedAt),consent:{version:safeText(c.version,32),acceptedAt:safeIso(c.acceptedAt),profileProcessingAccepted:c.profileProcessingAccepted===true,sensitiveDataAccepted:c.sensitiveDataAccepted===true,panelSummarySharingAccepted:c.panelSummarySharingAccepted===true},panelSummaryAvailable:isObject(pa.panelSummary)&&Object.keys(pa.panelSummary).length>0,rawResponses:'redacted',sourcePath:'data.profileAssessment',provenance:'derived',privacy:'sensitive_redacted'};
}
function notificationEventProjection(n,kind,receipt){
  if(!isObject(n)) return null;
  var createdAt=safeIso(n.ts||n.createdAt), sentAt=safeIso(n.sentAt||n.submittedAt||n.sent), inboxAt=safeIso(n.inboxAt||n.queuedAt), deliveredAt=safeIso(n.deliveredAt||n.receivedAt), readAt=safeIso(n.readAt||n.seenAt), repliedAt=safeIso(n.repliedAt||n.respondedAt||n.responseAt||n.answerAt||n.replyAt), deletedAt=safeIso(n.deletedAt), syncedAt=safeIso(n.syncedAt||n.syncAt), retryAt=safeIso(n.retryAt||n.lastRetryAt), errorCode=safeErrorCode(n.errorCode||n.lastErrorCode||n.error), stages=[];
  if(createdAt) stages.push({name:'oluşturuldu',at:createdAt,provenance:kind==='aeon_answer'?'delivery':'observer'});
  if(sentAt) stages.push({name:'gönderildi',at:sentAt,provenance:'delivery'});
  if(inboxAt) stages.push({name:'inbox',at:inboxAt,provenance:'delivery'});
  if(deliveredAt) stages.push({name:'cihaza ulaştı',at:deliveredAt,provenance:'delivery'});
  if(readAt) stages.push({name:kind==='aeon_answer'?'görüldü':'okundu',at:readAt,provenance:'user_input'});
  if(repliedAt) stages.push({name:'yanıtlandı',at:repliedAt,provenance:'user_input'});
  if(deletedAt) stages.push({name:'silindi',at:deletedAt,provenance:'user_input'});
  if(syncedAt||n.synced===true) stages.push({name:'sync edildi',at:syncedAt,provenance:'delivery'});
  if(retryAt||n.retryCount) stages.push({name:n.retryCount?'retry':'retry/error',at:retryAt,provenance:'delivery'});
  if(errorCode) stages.push({name:'error',at:retryAt||createdAt,provenance:'delivery'});
  var status=deletedAt||n.deleted===true?'deleted':readAt?'read':deliveredAt?'delivered':createdAt?'created':'missing';
  return {id:safeText(n.id||n.responseId,120),kind:kind||'notification',status:status,createdAt:createdAt,sentAt:sentAt,inboxAt:inboxAt,deliveredAt:deliveredAt,readAt:readAt,repliedAt:repliedAt,answerReadAt:kind==='aeon_answer'?readAt:null,deletedAt:deletedAt,synced:n.synced===true,syncedAt:syncedAt,retryAt:retryAt,retryCount:validNumber(n.retryCount)||0,errorCode:errorCode,stages:stages,observerAcceptedAt:safeIso(receipt&&receipt.acceptedAt),provenance:kind==='aeon_answer'?'delivery':'observer',privacy:'metadata_only'};
}
function notificationTimelineProjection(source,receipt){
  var root=isObject(source)?source:{}, events=[], invalid=0;
  if(Array.isArray(root.notifications)) root.notifications.forEach(function(n){ var e=notificationEventProjection(n,'notification',receipt); if(e) events.push(e); else invalid++; });
  var qa=root.aeon&&Array.isArray(root.aeon.qa)?root.aeon.qa:[];
  qa.forEach(function(q){ if(!q||(!q.answer&&!q.answerMsgId)) return; var e=notificationEventProjection({id:q.answerMsgId||q.id,ts:q.answeredAt||q.ts,receivedAt:q.answerReceivedAt||q.receivedAt,readAt:q.answerReadAt,deliveredAt:q.answerDeliveredAt,synced:q.answerSynced,errorCode:q.answerErrorCode},'aeon_answer',receipt); if(e) events.push(e); });
  events.sort(function(a,b){return String(b.createdAt||b.deliveredAt||'').localeCompare(String(a.createdAt||a.deliveredAt||''));});
  var counts={created:0,delivered:0,read:0,deleted:0,synced:0,error:0}; events.forEach(function(e){ if(e.createdAt) counts.created++; if(e.deliveredAt) counts.delivered++; if(e.readAt) counts.read++; if(e.deletedAt||e.status==='deleted') counts.deleted++; if(e.synced) counts.synced++; if(e.errorCode) counts.error++; });
  return {status:invalid?'malformed':(events.length?'ok':'missing'),count:events.length,invalidCount:invalid,counts:counts,events:events.slice(0,80),observerReceipt:{acceptedAt:safeIso(receipt&&receipt.acceptedAt),snapshotRevision:safeHash(receipt&&receipt.snapshotRevision),provenance:'observer',privacy:'metadata_only'},sourcePath:'data.notifications + data.aeon.qa + sync receipt',provenance:'observer',privacy:'metadata_only'};
}
function externalFetchProjection(source,date,receipt){
  var root=isObject(source)?source:{}, items=[], photo=dailyPhotoProjection(root.dailyPhoto,date), day=isObject(root.days)&&isObject(root.days[date])?root.days[date]:null, prayer=day&&isObject(day.prayer)?day.prayer:null, weather=isObject(root.weather)?root.weather:null;
  items.push({name:'Günün fotoğrafı',status:photo.error?'error':photo.status,fetchedAt:photo.fetchedAt,errorCode:safeErrorCode(photo.error),source:'Wikimedia Commons',provenance:'external',privacy:'public_metadata'});
  var pError=prayer&&safeErrorCode(prayer.fetchError), pFetched=prayer&&safeIso(prayer.fetchedAt); items.push({name:'Namaz vakitleri',status:pError?'error':pFetched?'ok':'missing',fetchedAt:pFetched,errorCode:pError,source:'Aladhan',provenance:'external',privacy:'metadata'});
  var wError=weather&&safeErrorCode(weather.error||weather.fetchError), wFetched=weather&&safeIso(weather.fetchedAt); items.push({name:'Hava',status:wError?'error':wFetched?'ok':'missing',fetchedAt:wFetched,errorCode:wError,source:'Open-Meteo / app cache',provenance:'external',privacy:'metadata'});
  return {status:items.some(function(x){return x.status==='error';})?'error':items.some(function(x){return x.status==='ok'||x.status==='ready';})?'ok':'missing',items:items,observerAcceptedAt:safeIso(receipt&&receipt.acceptedAt),sourcePath:'external fetch/cache metadata',provenance:'external',privacy:'metadata'};
}
function isBlobPath(path,key,value){
  var low=String(path||'').toLowerCase(), k=String(key||'').toLowerCase();
  if(k==='base64'||k==='dataurl'||k==='contentbase64'||k==='raw') return true;
  if(/media|attachment|upload|file|labresult/.test(low)&&(k==='data'||k==='content'||typeof value==='string')) return true;
  return k==='data'&&typeof value==='string'&&value.length>40&&/^[a-z0-9+/=_-]+$/i.test(value);
}
function redact(value,parts){
  var path=pathText(parts), key=parts.length?parts[parts.length-1]:'';
  if(parts.length && modeForPath(parts,key,value)==='redacted'){
    if(path==='location') return locationSummary(value);
    if(path==='locationHistory') return historySummary(value);
    return undefined;
  }
  if(isBlobPath(path,key,value)) return undefined;
  if(Array.isArray(value)) return value.map(function(x,i){ return redact(x,parts.concat([String(i)])); }).filter(function(x){return x!==undefined;});
  if(isObject(value)){
    var out={};
    Object.keys(value).forEach(function(k){
      if(SECRET_KEYS[k]||isBlobPath(path+'.'+k,k,value[k])) return;
      var next=parts.concat([k]), v=redact(value[k],next);
      if(v!==undefined) out[k]=v;
    });
    return out;
  }
  if(typeof value==='string'&&value.length>10000) return undefined;
  return value;
}
function redactForObserver(data){
  var safe=redact(cloneJson(isObject(data)?data:{}),[]);
  return isObject(safe)?safe:{};
}
function sectionSnapshot(safe,receipt,source){
  var d=isObject(safe)?safe:{}, raw=isObject(source)?source:d, date=safeText(d.lastOpenedDate,32);
  return {
    today:{date:date,record:d.days&&date?d.days[date]||null:null},
    therapy:d.profileAssessment||null,
    notifications:Array.isArray(d.notifications)?{count:d.notifications.length}:null,
    quran:d.quranJourney||null,
    saygi:d.saygi||null,
    location:d.location||null,
    archives:{library:d.library||null,watchlist:d.watchlist||null,music:d.music||null},
    dailyPhoto:dailyPhotoProjection(raw.dailyPhoto||d.dailyPhoto,date),
    roomContentHistory:roomHistoryProjection(d.roomContentHistory),
    saygiRoot:saygiProjection(d.saygi,d.days),
    locNudge:locNudgeProjection(d.locNudge),
    locationTiming:locationTimingProjection(d,receipt,date),
    lifecycle:{lastOpenedDate:date,lastOpenedAt:safeIso(d.lastOpenedAt),rootSavedAt:safeIso(d.savedAt),lastSyncDate:safeText(d.lastSyncDate,32),settings:settingsProjection(d),sourcePath:'data.lastOpenedDate + data.savedAt + data.settings',privacy:'metadata_summary'},
    therapyProvenance:therapyProjection(raw,date),
    profileProgress:profileProgressProjection(raw),
    notificationTimeline:notificationTimelineProjection(raw,receipt),
    externalSources:externalFetchProjection(raw,date,receipt)
  };
}
function buildObserverSnapshot(data,receipt,projectionBuiltAt){
  var safe=redactForObserver(data), r=safeReceipt(receipt), built=safeIso(projectionBuiltAt)||new Date().toISOString();
  var sourceUpdatedAt=r.sourceUpdatedAt||safeIso(safe.savedAt);
  var sourceToProjection=sourceUpdatedAt?Math.max(0,Date.parse(built)-Date.parse(sourceUpdatedAt)):null;
  return {
    schemaVersion:1,
    manifestVersion:MANIFEST.manifestVersion,
    snapshotRevision:r.snapshotRevision,
    sourceLatestSha:r.sourceLatestSha,
    sourceUpdatedAt:sourceUpdatedAt,
    projectionBuiltAt:built,
    serverAcceptedAt:r.acceptedAt,
    lag:{sourceToProjectionMs:sourceToProjection,projectionToPanelMs:null},
    sync:{state:r.status==='accepted'?'accepted':r.status,lastErrorCode:r.lastErrorCode,conflict:r.status==='conflict'||r.status==='anti_clobber',pendingCount:0},
    coverage:coverageForData(data),
    sections:sectionSnapshot(safe,r,data),
    data:safe
  };
}
function parseObserverSnapshot(raw){
  var value=raw;
  try{ if(typeof raw==='string') value=JSON.parse(raw); }catch(e){ return {ok:false,code:'projection_parse_failed',value:null}; }
  if(!isObject(value)||value.schemaVersion!==1||!isObject(value.data)) return {ok:false,code:'projection_invalid',value:null};
  if(!safeHash(value.snapshotRevision)||!safeHash(value.sourceLatestSha)||!safeIso(value.projectionBuiltAt)) return {ok:false,code:'projection_invalid',value:null};
  return {ok:true,code:null,value:value};
}
function chooseProjection(projection,latest,receipt){
  var parsed=parseObserverSnapshot(projection), r=safeReceipt(receipt), legacy=redactForObserver(latest);
  if(!parsed.ok) return {source:'legacy_fallback',reason:projection?'projection_invalid': 'projection_missing',snapshot:null,data:legacy,coverage:coverageForData(latest),sections:sectionSnapshot(legacy,r,latest)};
  if(!r.acceptedAt||!r.sourceLatestSha) return {source:'legacy_fallback',reason:'receipt_missing',snapshot:null,data:legacy,coverage:coverageForData(latest),sections:sectionSnapshot(legacy,r,latest)};
  if(parsed.value.sourceLatestSha!==r.sourceLatestSha||parsed.value.snapshotRevision!==r.snapshotRevision) return {source:'legacy_fallback',reason:'projection_stale',snapshot:parsed.value,data:legacy,coverage:coverageForData(latest),sections:sectionSnapshot(legacy,r,latest)};
  var parsedData=redactForObserver(parsed.value.data), parsedSections=sectionSnapshot(parsedData,r,parsedData);
  if(isObject(parsed.value.sections)) Object.keys(parsed.value.sections).forEach(function(k){ parsedSections[k]=parsed.value.sections[k]; });
  return {source:'projection',reason:'ready',snapshot:parsed.value,data:parsedData,coverage:parsed.value.coverage||coverageForData(parsed.value.data),sections:parsedSections};
}

root.PanelCoverageV1={
  MANIFEST:MANIFEST,
  manifest:MANIFEST,
  ruleForPath:ruleForPath,
  coverageForData:coverageForData,
  redactForObserver:redactForObserver,
  buildObserverSnapshot:buildObserverSnapshot,
  parseObserverSnapshot:parseObserverSnapshot,
  chooseProjection:chooseProjection,
  normalizeEvent:normalizeEvent,
  parseEventLog:parseEventLog,
  mergeEventLogs:mergeEventLogs,
  eventSequenceAudit:eventSequenceAudit,
  notificationEventProjection:notificationEventProjection,
  notificationTimelineProjection:notificationTimelineProjection,
  normalizeReceipt:safeReceipt,
  FULL_DETAIL_ALLOW:FULL_DETAIL_ALLOW,
  redactedPaths:redactedPaths
};
})(typeof window!=='undefined'?window:this);
