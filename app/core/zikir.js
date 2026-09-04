(function(){
  'use strict';

  // MON-20/21 · Zikirmatik motor + görünüm registry
  // Seed, motor ve saf HTML görünüm gövdeleri burada yaşar. Root data rebind'i,
  // draft mutation'ları, render/DOM ve App kabuğu app.js'te kalır; registry
  // yalnız canlı resolver bag'i kullanır.
  var ZIKR_DEPENDENCIES=['data','getDay','todayStr','addDays','dayIndexFor','save'];
  var zikrDeps=null;

  function registerZikr(deps){
    if(zikrDeps||!deps||typeof deps!=='object'||Array.isArray(deps)) return false;
    for(var i=0;i<ZIKR_DEPENDENCIES.length;i++) if(typeof deps[ZIKR_DEPENDENCIES[i]]!=='function') return false;
    zikrDeps=deps;
    return true;
  }
  function dep(name){ return zikrDeps&&typeof zikrDeps[name]==='function'?zikrDeps[name]:null; }
  function stateData(){
    var f=dep('data');
    if(f){ try{ return f(); }catch(e){} }
    var st=window.SeymaState;
    return st?st.data:null;
  }
  function getDay(d,date,idx){
    var f=dep('getDay');
    if(f){ try{ return f(d,date,idx); }catch(e){} }
    var st=window.SeymaState;
    return st&&typeof st.getDay==='function'?st.getDay(d,date,idx):null;
  }
  function dateCall(name,args,fallback){
    var f=dep(name);
    if(f){ try{ return f.apply(null,args); }catch(e){} }
    var du=window.SeymaDateUtils;
    if(du&&typeof du[name]==='function') return du[name].apply(null,args);
    return fallback.apply(null,args);
  }
  function todayStr(){ return dateCall('todayStr',[],function(){ var d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }); }
  function addDays(s,n){ return dateCall('addDays',[s,n],function(){ var p=String(s).split('-').map(Number), d=new Date(p[0],p[1]-1,p[2]); d.setDate(d.getDate()+n); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }); }
  function dayIndexFor(s){ return dateCall('dayIndexFor',[s],function(){ return 1; }); }
  function save(){
    var f=dep('save');
    if(f) return f.apply(null,arguments);
    var s=window.SeymaSave;
    if(s&&typeof s.save==='function') return s.save.apply(s,arguments);
    return undefined;
  }

var ZIKR_SEED=[
  // ZP-08.1 düzeltmesi: `arabic` alanı önceden hiç yoktu, bu yüzden UI
  // Arapça sütununda x.arabic||x.phrase fallback'i devreye girip TÜRKÇE
  // transliterasyonu dar/Arapça-fontlu sütuna taşırıyordu (gerçek görsel
  // bug). Arapça yazım zikirCoreContentV1.js'teki originalText ile birebir
  // aynı (harekesiz yazım kararı esmaulHusnaV1.js ile tutarlı).
  {id:'subhanallah', name:'Sübhanallah', phrase:'Sübhanallah', arabic:'سبحان الله', target:33, color:'zikr',builtIn:true,kind:'core'},
  {id:'elhamdulillah', name:'Elhamdülillah', phrase:'Elhamdülillah', arabic:'الحمد لله', target:33, color:'zikr',builtIn:true,kind:'core'},
  {id:'allahu_ekber', name:'Allahü Ekber', phrase:'Allahü Ekber', arabic:'الله أكبر', target:34, color:'zikr',builtIn:true,kind:'core'},
  {id:'la_ilaha_illallah', name:'Lâ ilâhe illallah', phrase:'Lâ ilâhe illallah', arabic:'لا إله إلا الله', target:100, color:'zikr',builtIn:true,kind:'core'},
  {id:'estagfirullah', name:'Estağfirullah', phrase:'Estağfirullah', arabic:'أستغفر الله', target:100, color:'zikr',builtIn:true,kind:'core'}
];
// ZP-04: V3 şema yükseltmesi — schemaVersion 3'e çıkar. ZIKR_MIGRATION_VERSION
// KASITLI OLARAK 'zikr_v2' kalır: bu sabit yalnız aşağıdaki migrateZikrV2'nin
// riskli v1->v2 "journeys'i toplamlardan yeniden kur" bloğunu bir kez tetikler.
// Bu sabiti değiştirmek o bloğu ZATEN V2/V3'e geçmiş kullanıcılarda tekrar
// çalıştırıp gerçek hatims[] geçmişini ezerdi — bkz. ZIKIRMATIK-REDESIGN-
// DENETIMI.md §1.2. V3'e özgü yükseltme tamamen ayrı, additive bir fonksiyonda
// (migrateZikrV3) ve schemaVersion<3 kontrolüyle yürütülür.
//
// V5 (manuel zikir): schemaVersion 4→5. ZIKR_MIGRATION_VERSION hâlâ 'zikr_v2'
// kalır — aynı nedenle. Manuel kayıtların merge matematiği (sync.js mergeZikr)
// schemaVersion'a değil, manualEntries dizisinin VARLIĞINA bağlıdır; iki cihaz
// farklı şema sürümündeyse bile union doğru çalışır.
var ZIKR_SCHEMA_VERSION=5, ZIKR_MIGRATION_VERSION='zikr_v2', _zikrNormalizedRef=null;
function zikrUid(prefix){ return (prefix||'z')+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8); }
function zikrInt(v){ v=Number(v); return Number.isSafeInteger(v)&&v>0?v:0; }
function emptyZikrRoot(){
  return {
    schemaVersion:ZIKR_SCHEMA_VERSION,migrationVersion:ZIKR_MIGRATION_VERSION,editorialVersion:0,
    presets:[],journeys:{},sessions:{},reflections:[],manualEntries:[],activeSession:null,
    settings:{soundOn:false,haptic:true,autoAdvance:false,activePresetId:'',defaultMode:'hatim',keepAwake:false,reducedMotion:false,breathGuide:false,confirmReset:true,focusMode:false},
    streakDate:'',streak:0
  };
}
// Manuel zikir kayıtları için giriş üst sınırları — tek elle kayıt, gerçek bir
// ibadet birikimini taşımaya yarar; tek seferde uçsuz bir sayı yazmak hem
// yanlış dokunuş koruması hem de merge matematiğinin sinir sınırları içindir.
var ZIKR_MANUAL_MAX=100000, ZIKR_MANUAL_KEEP=100;
function zikrNormalizeManualEntry(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw)) return null;
  if(typeof raw.date!=='string'||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(raw.date)) return null;
  if(typeof raw.presetId!=='string'||!raw.presetId) return null;
  var amount=zikrInt(raw.amount); if(amount<=0) return null;
  var id=(typeof raw.id==='string'&&raw.id)?raw.id.slice(0,80):zikrUid('zm');
  var createdAt=(typeof raw.createdAt==='string'&&raw.createdAt)?raw.createdAt:'';
  var updatedAt=(typeof raw.updatedAt==='string'&&raw.updatedAt)?raw.updatedAt:createdAt;
  var reverted=raw.revertedAt;
  return {id:id,date:raw.date,presetId:raw.presetId,amount:amount,
    note:typeof raw.note==='string'?raw.note.slice(0,200):'',source:'manual',
    createdAt:createdAt,updatedAt:updatedAt,
    revertedAt:(typeof reverted==='string'&&reverted)?reverted:null};
}
function migrateZikrV5(z){
  // ZP-10 (manuel zikir): additive ve idempotent — mevcut sayım/tur/hatim
  // değerlerine DOKUNMAZ, yalnız manualEntries dizisini güvenceye alır.
  if(!Array.isArray(z.manualEntries)) z.manualEntries=[];
  var byId={}, cleaned=[];
  z.manualEntries.forEach(function(raw){
    var rec=zikrNormalizeManualEntry(raw); if(!rec) return;
    var prev=byId[rec.id];
    if(!prev||String(rec.updatedAt||rec.createdAt)>String(prev.updatedAt||prev.createdAt)) byId[rec.id]=rec;
  });
  Object.keys(byId).forEach(function(k){ cleaned.push(byId[k]); });
  cleaned.sort(function(a,b){ return String(b.updatedAt||b.createdAt).localeCompare(String(a.updatedAt||a.createdAt)); });
  if(cleaned.length>ZIKR_MANUAL_KEEP) cleaned=cleaned.slice(0,ZIKR_MANUAL_KEEP);
  z.manualEntries=cleaned;
}
function emptyZikrDay(){ return {totalCount:0,completedSets:0,perPreset:{},lastAt:null}; }
function emptyZikrPresetDay(){ return {count:0,completedCycles:0,lastAt:null}; }
function zikrEsmaSeed(){
  var src=window.EsmaulHusnaV1&&Array.isArray(window.EsmaulHusnaV1.names)?window.EsmaulHusnaV1.names:[];
  return src.map(function(x){ return {id:x.id,name:x.name,phrase:x.arabic,target:x.ebced,color:'zikr',favorite:false,createdAt:'',builtIn:true,kind:'esma',arabic:x.arabic,ebced:x.ebced,countDirection:'down'}; });
}
function zikrSeedPreset(p){
  // ZP-06: updatedAt, çoklu cihaz merge'inde last-write-wins kararını
  // zamana bağlamak için var (bkz. sync.js mergeById — zaten updatedAt'ı
  // tanınan bir zaman damgası alanı olarak kontrol ediyordu, yalnız
  // presetlerde hiç dolu değildi). Yalnız gerçek bir düzenlemede
  // (favori/ekleme/arşivleme) güncellenir; her normalize çağrısında DEĞİL.
  return {id:p.id,name:p.name,phrase:p.phrase,target:p.target,color:p.color||'zikr',favorite:!!p.favorite,createdAt:p.createdAt||'',updatedAt:p.updatedAt||p.createdAt||'',builtIn:!!p.builtIn,kind:p.kind||'core',arabic:p.arabic||'',ebced:Number(p.ebced)||0,countDirection:p.countDirection==='down'?'down':'up',hatimMode:p.kind==='esma'?'ebced_square':'simple',archived:!!p.archived};
}
function zikrBaseTarget(p){ return Math.max(1,zikrInt(p&&p.kind==='esma'?(p.ebced||p.target):p&&p.target)||1); }
function zikrHatimTarget(p){ var b=zikrBaseTarget(p); return p&&p.kind==='esma'?b*b:b; }
function zikrMath(p,count){
  var base=zikrBaseTarget(p), target=zikrHatimTarget(p), raw=zikrInt(count), isEsma=p&&p.kind==='esma', c=isEsma?Math.max(0,Math.min(raw,target)):raw;
  var complete=!!isEsma&&c>=target, pos=c%base, cycles=Math.floor(c/base), atBoundary=!isEsma&&c>0&&pos===0;
  return {
    baseTarget:base,hatimTarget:target,count:c,completedCycles:isEsma?Math.min(base,cycles):cycles,
    cyclePosition:complete||atBoundary?base:pos,currentCycleNo:complete?base:(atBoundary?cycles:cycles+1),
    remainingInCycle:complete||atBoundary?0:base-pos,
    remainingInHatim:isEsma?Math.max(0,target-c):0,progress:isEsma?(target?Math.min(1,c/target):0):(base?Math.min(1,(complete||atBoundary?base:pos)/base):0),complete:complete
  };
}
function zikrNewHatim(p,count,status,startedAt){
  var c=Math.max(0,Math.min(zikrInt(count),zikrHatimTarget(p))), done=status==='completed'||c>=zikrHatimTarget(p);
  return {id:zikrUid('hatim'),mode:p&&p.kind==='esma'?'ebced_square':'simple',baseTarget:zikrBaseTarget(p),target:zikrHatimTarget(p),count:c,startedAt:startedAt||new Date().toISOString(),completedAt:done?new Date().toISOString():null,status:done?'completed':'active'};
}
function zikrNormalizeRoot(rootData){
  if(!rootData) return emptyZikrRoot();
  if(!rootData.zikr||typeof rootData.zikr!=='object') rootData.zikr=emptyZikrRoot();
  var z=rootData.zikr;
  if(!Array.isArray(z.presets)) z.presets=[];
  var seeds=ZIKR_SEED.concat(zikrEsmaSeed()), byId={};
  z.presets.forEach(function(p){ if(p&&p.id) byId[p.id]=p; });
  seeds.forEach(function(seed){
    var p=byId[seed.id];
    if(!p){ p=zikrSeedPreset(seed); if(seed.id==='subhanallah') p.favorite=true; z.presets.push(p); byId[p.id]=p; }
    else {
      p.builtIn=true; p.kind=seed.kind||p.kind||'core';
      // Eski core presetleri `arabic` alanından önce yaratılmış olabilir.
      // Katalogdaki güvenilir metni geri doldur; Latin `phrase` iki kez görünmesin.
      if(seed.arabic) p.arabic=seed.arabic;
      if(seed.kind==='esma'){ p.ebced=seed.ebced; p.target=seed.ebced; p.countDirection='down'; p.hatimMode='ebced_square'; }
    }
  });
  z.presets=z.presets.filter(function(p){ return p&&p.id; }).map(function(p){ var n=zikrSeedPreset(p); if(p.favorite) n.favorite=true; return n; });
  byId={}; z.presets.forEach(function(p){ byId[p.id]=p; });
  if(!z.sessions||typeof z.sessions!=='object') z.sessions={};
  if(!z.journeys||typeof z.journeys!=='object') z.journeys={};
  if(!Array.isArray(z.reflections)) z.reflections=[];
  if(!z.settings||typeof z.settings!=='object') z.settings={};
  if(typeof z.settings.soundOn!=='boolean') z.settings.soundOn=false;
  if(typeof z.settings.haptic!=='boolean') z.settings.haptic=true;
  if(typeof z.settings.autoAdvance!=='boolean') z.settings.autoAdvance=false;
  if(typeof z.settings.keepAwake!=='boolean') z.settings.keepAwake=false;
  if(typeof z.settings.reducedMotion!=='boolean') z.settings.reducedMotion=false;
  if(typeof z.settings.breathGuide!=='boolean') z.settings.breathGuide=false;
  if(typeof z.settings.confirmReset!=='boolean') z.settings.confirmReset=true;
  if(typeof z.settings.focusMode!=='boolean') z.settings.focusMode=false;
  if(z.settings.defaultMode!=='hatim'&&z.settings.defaultMode!=='cycle') z.settings.defaultMode='hatim';
  if(typeof z.settings.activePresetId!=='string'||!z.settings.activePresetId) z.settings.activePresetId=z.presets[0].id;
  if(!byId[z.settings.activePresetId]) z.settings.activePresetId=z.presets[0].id;
  if(z.activeSession!==null&&(!z.activeSession||typeof z.activeSession!=='object')) z.activeSession=null;
  if(typeof z.streak!=='number'||isNaN(z.streak)) z.streak=0;
  if(typeof z.streakDate!=='string') z.streakDate='';
  return z;
}
function migrateZikrV4(z){
  if(!Array.isArray(z.reflections)) z.reflections=[];
  var byId={};
  z.reflections.forEach(function(raw){
    if(!raw||typeof raw!=='object'||typeof raw.date!=='string'||typeof raw.presetId!=='string') return;
    var id=(typeof raw.id==='string'&&raw.id)?raw.id:('zn_'+raw.date+'_'+raw.presetId);
    var rec={
      id:id,date:raw.date,presetId:raw.presetId,presetName:typeof raw.presetName==='string'?raw.presetName:'',
      mood:typeof raw.mood==='string'?raw.mood:'',
      feelings:typeof raw.feelings==='string'?raw.feelings:'',
      thoughts:typeof raw.thoughts==='string'?raw.thoughts:'',
      intention:typeof raw.intention==='string'?raw.intention:'',
      wordCount:zikrInt(raw.wordCount),
      createdAt:typeof raw.createdAt==='string'?raw.createdAt:'',
      updatedAt:typeof raw.updatedAt==='string'?raw.updatedAt:(typeof raw.createdAt==='string'?raw.createdAt:'')
    };
    if(!rec.feelings.trim()&&!rec.thoughts.trim()&&!rec.intention.trim()&&!rec.mood) return;
    var prev=byId[id];
    if(!prev||(rec.updatedAt||rec.createdAt)>(prev.updatedAt||prev.createdAt)) byId[id]=rec;
  });
  z.reflections=Object.keys(byId).map(function(id){ return byId[id]; }).sort(function(a,b){ return (b.updatedAt||b.createdAt).localeCompare(a.updatedAt||a.createdAt); });
}
function migrateZikrV3(z){
  // ZP-04: V3 şema yükseltmesi — editorialVersion, katalogdan düşen presetleri
  // SİLMEK yerine archived=true işaretleme, journeys/hatims alt alanlarının
  // güvenli normalizasyonu. Bilinçli olarak SAF/idempotent: hiçbir geçerli
  // lifetime/completedHatims/count DEĞERİNİ düşürmez veya yeniden hesaplamaz;
  // yalnız eksik/tip-hatalı alanları safe default ile tamamlar ya da
  // okunamayan (obje bile olmayan) çöp kayıtları eler. Bu fonksiyon
  // migrateZikrV2 içinden yalnız schemaVersion<3 iken, tek sefer çağrılır
  // (bkz. çağıran taraftaki needsV3 kontrolü) — eski migrationVersion
  // kapısından tamamen bağımsızdır.
  if(typeof z.editorialVersion!=='number'||isNaN(z.editorialVersion)) z.editorialVersion=0;

  var seedIds={}; ZIKR_SEED.concat(zikrEsmaSeed()).forEach(function(s){ seedIds[s.id]=true; });
  z.presets.forEach(function(p){
    if(!p) return;
    var wasArchived=!!p.archived;
    if(seedIds[p.id]) p.archived=false;
    else if(p.builtIn) p.archived=true; // katalogda artık yok: sil değil, arşivle
    else if(typeof p.archived!=='boolean') p.archived=false; // kullanıcı özel preseti: dokunma, yalnız tip garantile
    // ZP-06: archived durumu gerçekten değiştiyse updatedAt'ı damgala — çoklu
    // cihaz merge'inde (sync.js mergeById) hangi cihazın arşiv kararının daha
    // yeni olduğu bununla çözülür. Değişmediyse dokunma (gereksiz churn yok).
    if(!!p.archived!==wasArchived) p.updatedAt=new Date().toISOString();
    if(typeof p.updatedAt!=='string') p.updatedAt=p.createdAt||'';
  });

  Object.keys(z.journeys).forEach(function(pid){
    var j=z.journeys[pid];
    if(!j||typeof j!=='object'){ delete z.journeys[pid]; return; } // okunamaz kayıt: lifetime zaten burada tutulmuyordu, kaybedilecek toplam yok
    j.presetId=(typeof j.presetId==='string'&&j.presetId)?j.presetId:pid;
    j.lifetimeCount=zikrInt(j.lifetimeCount);
    j.completedHatims=zikrInt(j.completedHatims);
    j.legacyCompletedHatims=zikrInt(j.legacyCompletedHatims);
    if(typeof j.activeHatimId!=='string') j.activeHatimId='';
    if(typeof j.lastAt!=='string') j.lastAt='';
    if(typeof j.lastSessionId!=='string') j.lastSessionId='';
    if(!Array.isArray(j.hatims)) j.hatims=[];
    var p=z.presets.find(function(x){ return x.id===pid; }), seenIds={}, cleaned=[];
    j.hatims.forEach(function(h){
      if(!h||typeof h!=='object') return; // okunamaz hatim: at (lifetimeCount/completedHatims sayaçları ayrı tutulur, düşmez)
      if(!h.id||seenIds[h.id]) h.id=zikrUid('hatim');
      seenIds[h.id]=true;
      h.baseTarget=zikrInt(h.baseTarget)||(p?zikrBaseTarget(p):1);
      h.target=zikrInt(h.target)||(p?zikrHatimTarget(p):(h.baseTarget||1));
      h.count=zikrInt(h.count); // yalnız tip/işaret güvenliği; hedefe göre KIRPILMAZ (o, okuma anında zikrMath'te yapılır)
      h.status=(h.status==='completed'||h.status==='archived'||h.status==='active')?h.status:(h.target>0&&h.count>=h.target?'completed':'active');
      if(typeof h.startedAt!=='string'||!h.startedAt) h.startedAt=j.lastAt||new Date().toISOString();
      if(h.status==='completed'){ if(typeof h.completedAt!=='string'||!h.completedAt) h.completedAt=h.startedAt; }
      else if(typeof h.completedAt!=='string') h.completedAt=null;
      cleaned.push(h);
    });
    j.hatims=cleaned;
    if(j.activeHatimId&&!seenIds[j.activeHatimId]) j.activeHatimId='';
  });
}
function migrateZikrV2(rootData){
  var z=zikrNormalizeRoot(rootData), totals={}, firstAt={}, lastAt={}, needsV3=zikrInt(z.schemaVersion)<3, needsV4=zikrInt(z.schemaVersion)<4;
  Object.keys(z.sessions).sort().forEach(function(date){
    var day=z.sessions[date]; if(!day||typeof day!=='object') day=z.sessions[date]=emptyZikrDay();
    if(!day.perPreset||typeof day.perPreset!=='object') day.perPreset={};
    var sum=0, sets=0;
    Object.keys(day.perPreset).forEach(function(pid){
      var raw=day.perPreset[pid], rec=(raw&&typeof raw==='object')?raw:{count:raw};
      var count=zikrInt(rec.count), p=z.presets.find(function(x){ return x.id===pid; });
      rec={count:count,completedCycles:zikrInt(rec.completedCycles)||(p?Math.floor(count/zikrBaseTarget(p)):0),lastAt:typeof rec.lastAt==='string'?rec.lastAt:(day.lastAt||null)};
      day.perPreset[pid]=rec; sum+=count; sets+=rec.completedCycles;
      totals[pid]=(totals[pid]||0)+count;
      if(!firstAt[pid]) firstAt[pid]=date+'T00:00:00.000Z';
      lastAt[pid]=rec.lastAt||date+'T23:59:59.000Z';
    });
    day.totalCount=zikrInt(day.totalCount)||sum;
    day.completedSets=zikrInt(day.completedSets)||sets;
    if(typeof day.lastAt!=='string'&&day.lastAt!==null) day.lastAt=null;
  });
  if(z.migrationVersion!==ZIKR_MIGRATION_VERSION){
    Object.keys(totals).forEach(function(pid){
      var p=z.presets.find(function(x){ return x.id===pid; }); if(!p) return;
      var total=totals[pid], target=zikrHatimTarget(p), completed=p.kind==='esma'?Math.floor(total/target):0, remainder=p.kind==='esma'?(total%target):0;
      var journey={presetId:pid,lifetimeCount:total,activeHatimId:'',lastAt:lastAt[pid]||'',lastSessionId:'',completedHatims:completed,legacyCompletedHatims:completed,hatims:[]};
      if(p.kind==='esma'){
        if(remainder>0){ var active=zikrNewHatim(p,remainder,'active',firstAt[pid]); journey.hatims.push(active); journey.activeHatimId=active.id; }
        else if(total>0){ var done=zikrNewHatim(p,target,'completed',firstAt[pid]); done.completedAt=lastAt[pid]||done.completedAt; journey.hatims.push(done); journey.activeHatimId=done.id; }
      }
      z.journeys[pid]=journey;
    });
    z.migrationVersion=ZIKR_MIGRATION_VERSION;
  }
  if(needsV3) migrateZikrV3(z);
  if(needsV4) migrateZikrV4(z);
  // V5 manuel kayıt güvencesi: her yüklemede additive/idempotent çalışır —
  // schemaVersion kapısına bağlı DEĞİLDİR ki eski kayıtlarla gelen veri de
  // normalize edilsin.
  migrateZikrV5(z);
  z.schemaVersion=ZIKR_SCHEMA_VERSION;
  return z;
}
function ensureZikrRoot(rootData){
  var owner=rootData||stateData(); if(!owner) return emptyZikrRoot();
  if(owner.zikr&&owner.zikr===_zikrNormalizedRef&&owner.zikr.schemaVersion===ZIKR_SCHEMA_VERSION&&owner.zikr.migrationVersion===ZIKR_MIGRATION_VERSION) return owner.zikr;
  var z=zikrNormalizeRoot(owner);
  if(z.schemaVersion!==ZIKR_SCHEMA_VERSION||z.migrationVersion!==ZIKR_MIGRATION_VERSION) z=migrateZikrV2(owner);
  _zikrNormalizedRef=z;
  return z;
}
function zikrPreset(id){ var z=ensureZikrRoot(); for(var i=0;i<z.presets.length;i++){ if(z.presets[i].id===id) return z.presets[i]; } return z.presets[0]||null; }
function zikrActivePreset(){ var z=ensureZikrRoot(); return zikrPreset(z.settings.activePresetId)||z.presets[0]; }
function zikrDay(date){ date=date||todayStr(); var z=ensureZikrRoot(); if(!z.sessions[date]||typeof z.sessions[date]!=='object') z.sessions[date]=emptyZikrDay(); var s=z.sessions[date]; if(typeof s.totalCount!=='number'||isNaN(s.totalCount)) s.totalCount=0; if(typeof s.completedSets!=='number'||isNaN(s.completedSets)) s.completedSets=0; if(!s.perPreset||typeof s.perPreset!=='object') s.perPreset={}; return s; }
function zikrPresetDay(day,presetId){ var raw=day.perPreset[presetId]; if(!raw||typeof raw!=='object') raw={count:raw}; var rec={count:zikrInt(raw&&raw.count),completedCycles:zikrInt(raw&&raw.completedCycles),lastAt:raw&&typeof raw.lastAt==='string'?raw.lastAt:null}; day.perPreset[presetId]=rec; return rec; }
function zikrPresetDayCount(day,presetId){ return zikrPresetDay(day,presetId).count; }
function zikrReflectionId(date,presetId){ return 'zn_'+date+'_'+presetId; }
function zikrReflection(date,presetId){
  var z=ensureZikrRoot(), id=zikrReflectionId(date||todayStr(),presetId||zikrActivePreset().id);
  for(var i=0;i<z.reflections.length;i++) if(z.reflections[i]&&z.reflections[i].id===id) return z.reflections[i];
  return null;
}
function zikrReflectionWordCount(d){
  var text=[d&&d.feelings,d&&d.thoughts,d&&d.intention].join(' ').trim();
  return text?text.split(/\s+/).filter(Boolean).length:0;
}
function zikrReflectionsFor(date,presetId){
  return ensureZikrRoot().reflections.filter(function(x){ return x&&(!date||x.date===date)&&(!presetId||x.presetId===presetId); }).sort(function(a,b){ return (b.updatedAt||b.createdAt).localeCompare(a.updatedAt||a.createdAt); });
}
function zikrPresetDone(date,preset){ var day=zikrDay(date), count=zikrPresetDayCount(day,preset.id); return zikrBaseTarget(preset)>0?count>=zikrBaseTarget(preset):false; }
function zikrDayCompleted(date){ var done=false; var z=ensureZikrRoot(); z.presets.forEach(function(p){ if(zikrPresetDone(date,p)) done=true; }); return done; }
function zikrStreak(){ return ensureZikrRoot().streak; }
function zikrWeek(date){ var set={}, total=0, perPreset={}; for(var i=0;i<7;i++){ var d=addDays(date,-i); var day=zikrDay(d); total+=day.totalCount; day.perPreset&&Object.keys(day.perPreset).forEach(function(pid){ perPreset[pid]=(perPreset[pid]||0)+zikrPresetDayCount(day,pid); }); if(zikrDayCompleted(d)) set[d]=1; } return {total:total,days:Object.keys(set).length,perPreset:perPreset}; }
function zikrJourney(preset,create){
  var z=ensureZikrRoot(), p=preset||zikrActivePreset(), j=z.journeys[p.id];
  if(!j&&create!==false) j=z.journeys[p.id]={presetId:p.id,lifetimeCount:0,activeHatimId:'',lastAt:'',lastSessionId:'',completedHatims:0,legacyCompletedHatims:0,hatims:[]};
  if(!j) return null;
  if(!Array.isArray(j.hatims)) j.hatims=[];
  j.lifetimeCount=zikrInt(j.lifetimeCount); j.completedHatims=zikrInt(j.completedHatims);
  if(typeof j.activeHatimId!=='string') j.activeHatimId='';
  return j;
}
function zikrActiveHatim(preset,create){
  var p=preset||zikrActivePreset(); if(!p||p.kind!=='esma') return null;
  var j=zikrJourney(p,create), h=null; if(!j) return null;
  for(var i=0;i<j.hatims.length;i++){ if(j.hatims[i]&&j.hatims[i].id===j.activeHatimId){ h=j.hatims[i]; break; } }
  if(!h&&create!==false){ h=zikrNewHatim(p,0,'active'); j.hatims.push(h); j.activeHatimId=h.id; }
  return h;
}
function zikrJourneyProgress(preset){
  var p=preset||zikrActivePreset(), j=zikrJourney(p,true), h=zikrActiveHatim(p,false);
  if(p.kind!=='esma') return {journey:j,hatim:null,math:zikrMath(p,j.lifetimeCount),count:j.lifetimeCount};
  return {journey:j,hatim:h,math:zikrMath(p,h?h.count:0),count:h?h.count:0};
}
// ZP-05 — Zikirmatik oturum durum makinesi (tek doğruluk kaynağı).
//
// Durumlar:
//   idle            — preset seçili, bu preset için henüz aktif/duraklamış
//                      bir activeSession yok (ör. az önce preset değiştirildi).
//   active          — activeSession bu presete ait ve pausedAt boş; dokunma
//                      kabul edilir.
//   paused          — activeSession bu presete ait ve pausedAt dolu; dokunma
//                      App.toggleZikrPause ile yeniden 'active'e döner.
//   hatim-complete   — (yalnız esma) aktif hatim status==='completed'; kalıcı
//                      bir dinlenme durumudur, otomatik yeni hatim AÇILMAZ.
//   cycle-complete   — kalıcı bir durum DEĞİL, active→active kendi-döngüsü
//                      üzerinde anlık bir OLAYDIR (zikrTouchTick sonucunda
//                      `doneNow===true`); veri modelinde "sıkışıp kalınan" bir
//                      hâl yoktur, bir sonraki tur otomatik başlar.
//   error-recoverable — geçerli bir preset çözülemediğinde (ör. z.presets boş)
//                      düşülen güvenli varsayılan; hiçbir zaman throw etmez.
//
// İzinli geçişler (olay → yan etki):
//   idle --zikrTap--> active                : zikrTouchTick() journey+aktif
//   paused --zikrTap--> paused              : mutasyon yok; önce Sürdür gerekir
//     hatim+gün kaydı+activeSession'ı TEK senkron çağrıda atomik günceller;
//     ardından save() çağrılır (rule 3). doneNow ise 'cycle-complete' OLAYI
//     ateşlenir (spark/toast), hatim tamamlandıysa 'hatim-complete'e geçilir.
//   hatim-complete --zikrTap--> hatim-complete : hiçbir mutasyon yapılmaz,
//     yalnız bilgilendirme toast'ı; save() ÇAĞRILMAZ (delta üretilmez).
//   active --toggleZikrPause--> paused       : activeSession.pausedAt=now.
//   paused --toggleZikrPause--> active       : yeni/devam eden activeSession,
//     pausedAt=null.
//   (herhangi) --setZikrPreset(id)--> idle    : zikrPauseSession() ESKİ
//     preseti duraklatır (silmez); yeni preset kendi journey'sinde `idle`
//     başlar — iki yolculuk birbirinden asla karışmaz (rule 7).
//   (herhangi) --closeZikr--> (aynı state, ama oturum duraklamış)
//   active/paused/idle --zikrUndo--> (aynı state, sayaç -1) : yalnız CARİ
//     presetin BUGÜNKÜ sayımı >0 ise uygulanır; 0 altına asla inmez (rule 5).
//   hatim-complete --zikrUndo--> active        : tamamlanma geri alınır
//     (h.status='active', completedHatims-1).
//   hatim-complete --startNewZikrHatim--> idle : eski hatim zaten 'completed'
//     ise dokunulmaz, tamamlanmamış bir yolculuk varsa 'archived' olur; yeni
//     hatim count=0 ile başlar (rule 8 — yalnız açık kullanıcı eylemiyle).
//   (gün değişimi, herhangi bir state) --> (aynı state korunur) : yeni tarihte
//     zikrDay() günlük sayaç sıfırla başlar, journey/hatim/lifetimeCount
//     ETKİLENMEZ (rule 6).
//
// Dokunma kaynağı: tek `onclick="App.zikrTap()"` (bkz. zikrCounterViewHTML) —
// ayrı bir pointerdown/touchstart bağlayıcısı YOKTUR, bu yüzden gerçek
// tarayıcıda pointerup/click/touch sentezinden çift sayım yapısal olarak
// mümkün değildir (rule 4); bu sözleşme güncel faith-hub harness'ında
// sentetik etkileşimlerle korunur.
function zikrSessionState(preset){
  var p=preset||zikrActivePreset(); if(!p) return 'error-recoverable';
  var curHatimId='';
  if(p.kind==='esma'){
    var h=zikrActiveHatim(p,false); if(h&&h.status==='completed') return 'hatim-complete';
    curHatimId=h?h.id:'';
  }
  var z=ensureZikrRoot(), s=z.activeSession;
  // Esmâ'da oturum yalnız CARİ hatime aitse geçerli sayılır — startNewZikrHatim
  // sonrası eski (duraklamış) oturum yeni hatimle eşleşmediği için 'idle'e düşer.
  if(s&&s.presetId===p.id&&(p.kind!=='esma'||s.hatimId===curHatimId)) return s.pausedAt?'paused':'active';
  return 'idle';
}
function zikrTouchTick(){
  var p=zikrActivePreset(); if(!p) return null;
  // Duraklatılmış oturumda sayaç dokunuşu artık sessizce yeni bir oturum
  // başlatmaz. Duraklat gerçekten durdurur; açık "Sürdür" eylemi gerekir.
  if(zikrSessionState(p)==='paused') return {preset:p,paused:true};
  var date=todayStr(), day=zikrDay(date), pd=zikrPresetDay(day,p.id), z=ensureZikrRoot(), jp=zikrJourneyProgress(p), j=jp.journey, h=jp.hatim;
  if(p.kind==='esma'&&h&&h.status==='completed') return {preset:p,hatimComplete:true,count:h.count,total:day.totalCount,doneNow:false,target:zikrBaseTarget(p),math:zikrMath(p,h.count)};
  if(p.kind==='esma'&&!h){ h=zikrActiveHatim(p,true); }
  var before=zikrMath(p,p.kind==='esma'?h.count:j.lifetimeCount), now=new Date().toISOString();
  j.lifetimeCount=zikrInt(j.lifetimeCount)+1; j.lastAt=now;
  if(p.kind==='esma'){ h.count++; h.lastAt=now; }
  pd.count++; pd.lastAt=now; day.totalCount++; day.lastAt=now;
  var after=zikrMath(p,p.kind==='esma'?h.count:j.lifetimeCount), doneNow=after.completedCycles>before.completedCycles;
  if(doneNow){ pd.completedCycles++; day.completedSets++; }
  if(p.kind==='esma'&&after.complete){ h.status='completed'; h.completedAt=now; j.completedHatims++; }
  var session=z.activeSession;
  if(!session||session.presetId!==p.id||session.pausedAt){ session=z.activeSession={id:zikrUid('zs'),presetId:p.id,hatimId:h?h.id:'',startedAt:now,lastAt:now,count:0,pausedAt:null}; }
  session.count++; session.lastAt=now; j.lastSessionId=session.id;
  // Günlük kayıt aynası (panel/gün-detayı için)
  syncZikrDayMirror(date,day);
  // streak: bugün ilk kez herhangi hedef dolduysa tarihi kaydet
  var z=ensureZikrRoot();
  if(doneNow&&z.streakDate!==date){
    var yester=addDays(date,-1);
    z.streak = (zikrDayCompleted(yester)||z.streakDate===yester) ? (z.streak+1) : 1;
    z.streakDate=date;
  }
  return {preset:p,count:pd.count,total:day.totalCount,doneNow:doneNow,target:zikrBaseTarget(p),hatimDone:p.kind==='esma'&&after.complete,math:after,journey:j,hatim:h,
    // FX-P-55: sesli ipucu olayları — sessionStarted yalnız oturumun ilk
    // dokunuşunda (yeni session id), halfNow bu turun ortasına tam geçişte.
    sessionStarted:session.count===1, halfNow:(!doneNow&&after.cyclePosition===Math.ceil(zikrBaseTarget(p)/2))};
}
function syncZikrDayMirror(date,day){
  try{
    var dd=getDay(stateData(),date,dayIndexFor(date)); if(!dd.zikr) dd.zikr=emptyZikrDay();
    dd.zikr.totalCount=day.totalCount; dd.zikr.completedSets=day.completedSets;
    dd.zikr.perPreset=JSON.parse(JSON.stringify(day.perPreset)); dd.zikr.lastAt=day.lastAt||null;
  }catch(e){}
}

// ── ZP-10 · Manuel zikir girişi (elle sayım) ─────────────────────────────
// Kullanıcı tespih/cemaat/kağıt gibi yöntemlerle saydığı zikirleri uygulama
// dışında biriktirip TEK BÜTÜN olarak kaydeder. Sayım aynı kanala (sessions.
// perPreset + journeys.lifetimeCount + hatim) işlenir; BİRDEN fazı, tur
// tamamlanması, streak ve panel/ısı haritası otomatik tutarlı kalır. Fark:
// her kayıt manualEntries[] içinde salt-okunur bir olay olarak da yaşar —
// provenance dürüstlüğü ("bu sayı nereden geldi?") ve sync.js'teki yeni
// union-temelli merge matematiği (max kuralının eşzamanlı-artış körlüğünü
// olay günlüğüyle aşması) bu dizinin varlığına bağlıdır.
function zikrManualActive(date,presetId){
  var z=ensureZikrRoot(), total=0;
  (z.manualEntries||[]).forEach(function(e){
    if(e&&!e.revertedAt&&e.date===date&&e.presetId===presetId) total+=zikrInt(e.amount);
  });
  return total;
}


function zikrTickSound(){
  if(!ensureZikrRoot().settings.soundOn) return;
  // FX-P-12: ses üretimi SeyAudio.tap()'e yönlendirildi.
  // Eski AudioContext/osilatör kodu kaldırıldı; SeyAudio yoksa sessizce no-op.
  if(window.SeyAudio && typeof window.SeyAudio.tap === 'function'){
    window.SeyAudio.tap();
  }
}
function zikrPauseSession(){
  var z=ensureZikrRoot(); if(z.activeSession&&!z.activeSession.pausedAt) z.activeSession.pausedAt=new Date().toISOString();
}
function zikrManualApply(presetId,amount,date,note){
  var p=zikrPreset(presetId); if(!p) return null;
  var n=zikrInt(amount); if(n<=0) return null;
  if(n>ZIKR_MANUAL_MAX) return null;
  var d=/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(String(date||''))?date:todayStr();
  var z=ensureZikrRoot(), day=zikrDay(d), pd=zikrPresetDay(day,p.id), jp=zikrJourneyProgress(p), j=jp.journey, h=jp.hatim;
  var now=new Date().toISOString();
  // Esmâ: hatim hedefini aşan giriş kabul edilmez — kalanı asla geçmez.
  if(p.kind==='esma'){
    if(h&&h.status==='completed') return null;
    if(!h) h=zikrActiveHatim(p,true);
    var target=zikrHatimTarget(p), room=target-zikrInt(h.count);
    if(room<=0) return null;
    if(n>room) n=room;
  }
  var before=zikrMath(p,p.kind==='esma'?h.count:j.lifetimeCount);
  j.lifetimeCount=zikrInt(j.lifetimeCount)+n; j.lastAt=now;
  if(p.kind==='esma'){ h.count+=n; h.lastAt=now; }
  pd.count+=n; pd.lastAt=now; day.totalCount+=n; day.lastAt=now;
  var after=zikrMath(p,p.kind==='esma'?h.count:j.lifetimeCount);
  var cyclesGained=after.completedCycles-before.completedCycles;
  if(cyclesGained>0){ pd.completedCycles+=cyclesGained; day.completedSets+=cyclesGained; }
  if(p.kind==='esma'&&after.complete){ h.status='completed'; h.completedAt=now; j.completedHatims++; }
  var rec={id:zikrUid('zm'),date:d,presetId:p.id,amount:n,note:String(note||'').trim().slice(0,200),source:'manual',createdAt:now,updatedAt:now,revertedAt:null};
  z.manualEntries.push(rec);
  // streak: bugüne dair herhangi bir hedef dolduysa tarihi kaydet (zikrTouchTick
  // ile aynı sözleşme).
  if(cyclesGained>0&&z.streakDate!==d){
    var yester=addDays(d,-1);
    z.streak=(zikrDayCompleted(yester)||z.streakDate===yester)?(z.streak+1):1;
    z.streakDate=d;
  }
  if(d===todayStr()) syncZikrDayMirror(d,day);
  save();
  return {rec:rec,preset:p,day:day,pd:pd,math:after,journey:j,hatim:h,applied:n,cyclesGained:cyclesGained};
}
function zikrManualUndoEntry(entryId){
  var z=ensureZikrRoot(); if(!Array.isArray(z.manualEntries)) return null;
  var e=null; for(var i=0;i<z.manualEntries.length;i++){ if(z.manualEntries[i]&&z.manualEntries[i].id===entryId&&!z.manualEntries[i].revertedAt){ e=z.manualEntries[i]; break; } }
  if(!e) return null;
  var p=zikrPreset(e.presetId); if(!p) return null;
  var now=new Date().toISOString();
  e.revertedAt=now; e.updatedAt=now;
  var day=zikrDay(e.date), pd=zikrPresetDay(day,e.presetId), jp=zikrJourneyProgress(p), j=jp.journey, h=jp.hatim;
  var before=zikrMath(p,p.kind==='esma'&&h?h.count:j.lifetimeCount);
  if(p.kind==='esma'&&h){
    if(h.status==='completed'&&h.count>=zikrHatimTarget(p)){ h.status='active'; h.completedAt=null; j.completedHatims=Math.max(0,j.completedHatims-1); }
    h.count=Math.max(0,h.count-e.amount); h.lastAt=now;
  }
  j.lifetimeCount=Math.max(0,j.lifetimeCount-e.amount); j.lastAt=now;
  pd.count=Math.max(0,pd.count-e.amount); pd.lastAt=now;
  day.totalCount=Math.max(0,day.totalCount-e.amount); day.lastAt=now;
  var after=zikrMath(p,p.kind==='esma'&&h?h.count:j.lifetimeCount);
  if(after.completedCycles<before.completedCycles){
    var lost=before.completedCycles-after.completedCycles;
    pd.completedCycles=Math.max(0,pd.completedCycles-lost); day.completedSets=Math.max(0,day.completedSets-lost);
  }
  var active=ensureZikrRoot();
  if(active.activeSession&&active.activeSession.presetId===p.id) active.activeSession.count=Math.max(0,zikrInt(active.activeSession.count)-e.amount);
  if(e.date===todayStr()) syncZikrDayMirror(e.date,day);
  save();
  return {entry:e,preset:p,day:day,pd:pd,math:after,journey:j,hatim:h};
}
// Manuel kayıt + dokunuş sayımlarını birleştirir: cihaz bazında dokunuş sayımı
// zaten sayaçta; manuel kayıtların union'ı (id bazlı, reverted hariç) üstüne
// YENİDEN EKLENMEZ — sayaç zaten birleştirilmiş manuel kayıtları içerir.
// (sync.js tarafındaki formül için bkz. mergeZikr — burada yalnız görünüm.)
function zikrManualEntryCountFor(date,presetId){
  var z=ensureZikrRoot(), out=[];
  (z.manualEntries||[]).forEach(function(e){ if(e&&e.date===date&&e.presetId===presetId) out.push(e); });
  return out;
}
// ZP-10: pure test yüzeyi — merge matematiğinin uygulama tarafı doğrudan
// test edilebilir olsun diye App üzerinden de açılır (ZP-03 deseni).

  // MON-21 · Zikirmatik görünüm registry
  // Saf HTML üreticileri burada yaşar; UI draft mutation'ları, overlay/focus,
  // DOM paint ve App handler kabuğu app.js'te kalır.
  function viewCall(name,args){
    var f=dep(name);
    if(f){ try{ return f.apply(null,args||[]); }catch(e){} }
    return null;
  }
  function viewUi(){
    var ui=viewCall('ui');
    return ui&&typeof ui==='object'?ui:{};
  }
  function esc(s){
    var out=viewCall('esc',[s]);
    if(out!=null) return out;
    return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function icon(name,size,cls){
    var out=viewCall('icon',[name,size,cls]);
    return out==null?'':out;
  }
  function dateLabelTR(s){
    var out=viewCall('dateLabelTR',[s]);
    return out==null?String(s==null?'':s):out;
  }
  function viewContentFor(p){ return viewCall('contentFor',[p]); }
  function viewNormalizeSearchText(s){
    var out=viewCall('normalizeSearchText',[s]);
    return out==null?String(s||'').toLocaleLowerCase('tr-TR'):out;
  }
  function viewPresetSearchText(x){ return viewCall('presetSearchText',[x])||''; }
  function viewTopicGroups(){
    var out=viewCall('topicGroups');
    return Array.isArray(out)?out:[];
  }
  function viewTopicGroup(id){
    var out=viewCall('topicGroup',[id]);
    return out||{id:'all',label:'Tüm konular',icon:'sparkles',terms:[]};
  }
  function viewTopicMatch(x,id){
    var out=viewCall('topicMatch',[x,id]);
    return out===null?viewTopicGroup(id).id==='all':!!out;
  }
  function viewPresetTopicLabel(x){ return viewCall('presetTopicLabel',[x])||''; }
  function viewNiyet(){ return viewCall('niyet')||{}; }
  function viewRingRadius(){
    var out=viewCall('ringRadius');
    return typeof out==='number'&&isFinite(out)?out:108;
  }
  function viewCompleteFlash(){ return !!viewCall('completeFlash'); }
  // Draft kurucuları ui'yi başlatabildiği için app.js-owned resolver olarak kalır.
  function zikrNoteDraftFor(p){ return viewCall('noteDraftFor',[p]); }
  function zikrManualDraftFor(p){ return viewCall('manualDraftFor',[p]); }
function zikrPreviewCardHTML(){
  var p=zikrActivePreset(), day=zikrDay(todayStr()), jp=zikrJourneyProgress(p), m=jp.math;
  var pct=Math.round(m.progress*100), streak=zikrStreak(), pd=zikrPresetDay(day,p.id);
  var content=viewContentFor(p), state=zikrSessionState(p);
  var stateLabel=state==='active'?'Devam ediyor':(state==='paused'?'Duraklatıldı':'Başlamaya hazır');
  var arabic=p.arabic||(p.kind==='esma'?p.phrase:'');
  var h='<button id="zikr-preview-card" class="sg-faith-preview-card zikr-v2-preview is-'+state+'" onclick="App.openZikr()" aria-label="Zikirmatiği tam ekran aç">';
  h+='<div class="zikr-v2-preview-top"><span class="zikr-v2-preview-icon">'+icon('sparkles',20)+'<i aria-hidden="true"></i></span><div class="zikr-v2-preview-copy"><strong>Zikirmatik</strong><small>Günlük zikir yolculuğun</small></div><span class="zikr-v2-preview-status '+state+'">'+stateLabel+'</span></div>';
  h+='<div class="zikr-v2-preview-focus"><div><span class="eyebrow">'+(p.kind==='esma'?'AKTİF ESMÂ':'AKTİF ZİKİR')+'</span><strong>'+esc(p.name)+'</strong>'+(content&&content.meaningTr?'<p>'+esc(content.meaningTr)+'</p>':'')+'</div>'+(arabic?'<span class="arabic" lang="ar" dir="rtl">'+esc(arabic)+'</span>':'')+'</div>';
  h+='<div class="zikr-v2-preview-metric"><div><span>Bugün</span><strong>'+pd.count.toLocaleString('tr-TR')+'</strong><small>'+day.totalCount.toLocaleString('tr-TR')+' toplam</small></div><div><span>Bu tur</span><strong>'+m.cyclePosition+' / '+m.baseTarget+'</strong><small>'+m.remainingInCycle+' kaldı</small></div><div><span>'+(p.kind==='esma'?'Tam hatim':'Ömürlük')+'</span><strong>'+(p.kind==='esma'?m.count.toLocaleString('tr-TR'):jp.journey.lifetimeCount.toLocaleString('tr-TR'))+'</strong><small>'+(p.kind==='esma'?m.hatimTarget.toLocaleString('tr-TR')+' hedef':Math.floor(jp.journey.lifetimeCount/m.baseTarget)+' tur')+'</small></div></div>';
  h+='<div class="zikr-v2-preview-bar"><i style="width:'+pct+'%"></i></div>';
  h+='<div class="zikr-v2-preview-foot"><span>'+(streak?icon('flame',12)+streak+' günlük devamlılık':'Bugün toplam '+day.totalCount.toLocaleString('tr-TR'))+'</span><b>Sayaca geç '+icon('chevron-right',13)+'</b></div>';
  h+='</button>';
  return h;
}
function zikrDetailControlsHTML(p){
  var ui=viewUi();
  var content=viewContentFor(p);
  var hasRichContent=!!(content&&(content.importanceTr||content.reflectionTr||content.sourceLabel));
  var h='<button class="zikr-v2-detail-toggle" onclick="App.toggleZikrDetail()" aria-expanded="'+(!!ui.zikrDetailOpen)+'" aria-controls="zikr-detail-sheet">'+(hasRichContent?(ui.zikrDetailOpen?'Önemi ve tefekkür ▲':'Önemi ve tefekkür ▾'):(ui.zikrDetailOpen?'Anlamı ve önemi ▲':'Anlamı ve önemi ▾'))+'</button>';
  if(ui.zikrDetailOpen){
    h+='<div id="zikr-detail-sheet" class="zikr-v2-detail-sheet" role="region" aria-label="'+esc(p.name)+' önemi ve tefekkür">';
    if(hasRichContent){
      if(content.importanceTr) h+='<p>'+esc(content.importanceTr)+'</p>';
      if(content.reflectionTr) h+='<p class="reflect">'+esc(content.reflectionTr)+'</p>';
      if(content.verseNoteTr) h+='<p class="verse">'+esc(content.verseNoteTr)+'</p>';
      if(p.kind==='esma') h+='<p class="disclaimer">Ebced², geleneksel ebced hesabına dayalı kişisel bir tamamlama yolculuğudur; dua ve zikrin kabulü için zorunlu bir sayı değildir.</p>';
      if(content.sourceLabel) h+='<p class="source">Kaynak: '+esc(content.sourceLabel)+'</p>';
    } else h+='Ebced değerleri geleneksel harf hesabıdır; ibadetin kabulü veya dinî bir zorunluluk için bilimsel ölçü değildir. Sayaç yalnızca kişisel takip aracıdır.';
    h+='</div>';
  }
  return h;
}
function zikrResetConfirmHTML(p,pd){
  var ui=viewUi();
  if(!ui.zikrResetPending||ui.zikrResetPresetId!==p.id) return '';
  var amount=zikrInt(pd&&pd.count);
  return '<div class="zikr-v2-reset-confirm" role="alert" aria-live="assertive"><span class="icon">'+icon('trash-2',18)+'</span><div class="copy"><strong>Bugünkü sayımı sıfırla?</strong><small>'+esc(p.name)+' · '+amount.toLocaleString('tr-TR')+' sayım, ilerlemeden geri alınacak.</small></div><div class="actions"><button class="cancel" onclick="App.cancelZikrReset()">Vazgeç</button><button class="confirm" onclick="App.confirmZikrResetToday()">'+amount.toLocaleString('tr-TR')+' sayımı sıfırla</button></div></div>';
}
function zikrActionNoteHTML(){
  var ui=viewUi();
  return ui.zikrActionNote?'<div class="zikr-v2-action-note" role="status" aria-live="polite">'+icon('rotate-ccw',14)+'<span>'+esc(ui.zikrActionNote)+'</span></div>':'';
}
function zikrNoteEditorHTML(p){
  var ui=viewUi();
  var d=zikrNoteDraftFor(p), saved=zikrReflection(todayStr(),p.id);
  var moods=[['huzurlu','Huzurlu'],['şükür','Şükür dolu'],['umutlu','Umutlu'],['dalgın','Dalgın'],['yorgun','Yorgun'],['zorlanıyorum','Zorlanıyorum']];
  var words=zikrReflectionWordCount(d), h='<section id="zikr-note-region" class="zikr-v2-note'+(ui.zikrNoteOpen?' is-open':'')+'">';
  // Nazik davet: bugün bu zikirden en az bir tık var ama henüz not yoksa,
  // toggle'ın üstünde daha görünür bir davet çıkar — zorlamaz, günlük not
  // yazılınca ya da panel kapanıp açılana kadar kendiliğinden kaybolur.
  if(!ui.zikrNoteOpen&&!saved&&zikrPresetDay(zikrDay(todayStr()),p.id).count>0){
    h+='<button class="zikr-v2-note-invite" onclick="App.toggleZikrNote()"><span class="icon">'+icon('feather',16)+'</span><span><strong>Bugünü birkaç kelimeyle anlat</strong><em>'+esc(p.name)+' çekerken içinden ne geçti?</em></span><b>'+icon('chevron-right',15)+'</b></button>';
  }
  h+='<button class="zikr-v2-note-summary" onclick="App.toggleZikrNote()" aria-expanded="'+(!!ui.zikrNoteOpen)+'" aria-controls="zikr-note-editor"><span class="icon">'+icon('pen-line',18)+'</span><span><small>TEFEKKÜR GÜNLÜĞÜ</small><strong>Hislerim · Düşüncelerim</strong><em>'+esc(p.name)+' için bugüne özel</em></span><b>'+(saved?icon('circle-check',15):icon('chevron-down',16))+'</b></button>';
  if(ui.zikrNoteOpen){
    h+='<div id="zikr-note-editor" class="zikr-v2-note-editor">';
    h+='<div class="zikr-v2-note-context"><span>'+icon('calendar',13)+dateLabelTR(todayStr())+'</span><strong>'+esc(p.name)+'</strong></div>';
    h+='<div class="zikr-v2-note-moods" role="group" aria-label="Bugünkü duygum">'; moods.forEach(function(m){ h+='<button class="'+(d.mood===m[0]?'on':'')+'" onclick="App.setZikrNoteMood(\''+m[0]+'\')" aria-pressed="'+(d.mood===m[0])+'">'+m[1]+'</button>'; }); h+='</div>';
    h+='<label><span>Hislerim</span><small>Bu zikri çekerken kalbinde ve bedeninde ne vardı?</small><textarea maxlength="2000" rows="3" placeholder="Olduğu gibi yazabilirsin…" oninput="App.onZikrNoteField(\'feelings\',this)">'+esc(d.feelings)+'</textarea></label>';
    h+='<label><span>Düşüncelerim</span><small>Zihninden geçen, fark ettiğin ya da anlam verdiğin şeyler.</small><textarea maxlength="3000" rows="4" placeholder="Bugün zihnimde kalan…" oninput="App.onZikrNoteField(\'thoughts\',this)">'+esc(d.thoughts)+'</textarea></label>';
    h+='<label><span>Duam · niyetim</span><small>Yanında taşımak istediğin kısa cümle.</small><textarea maxlength="1000" rows="2" placeholder="Allah’ım…" oninput="App.onZikrNoteField(\'intention\',this)">'+esc(d.intention)+'</textarea></label>';
    h+='<div class="zikr-v2-note-foot"><span id="zikr-note-count">'+words+' kelime</span><button onclick="App.saveZikrNote()">'+icon('save',15)+(saved?'Notu güncelle':'Günlüğe kaydet')+'</button></div>';
    h+='<div id="zikr-note-status" class="zikr-v2-note-status" role="status" aria-live="polite"'+(ui.zikrNoteStatus?'':' hidden')+'>'+esc(ui.zikrNoteStatus)+'</div>';
    h+='</div>';
  } else if(saved){
    h+='<div class="zikr-v2-note-saved"><span>'+icon('circle-check',14)+' Bugünkü tefekkürün arşivde</span><b>'+saved.wordCount+' kelime</b></div>';
  }
  h+='</section>'; return h;
}
function zikrManualAmountOf(d){
  var raw=String(d&&d.amount||'').trim();
  if(!/^[0-9]+$/.test(raw)) return 0;
  return zikrInt(parseInt(raw,10));
}
function zikrManualQuickChips(p){
  // Hızlı çipler: temel/core zikirlerde klasik turlar; Esmâ'da hatme kalanını
  // bir dokunuşla dolduran tek çip — hedef aşımı fiziksel olarak imkânsız.
  if(p.kind==='esma'){
    var jp=zikrJourneyProgress(p), h=jp.hatim, remaining=h?Math.max(0,zikrHatimTarget(p)-zikrInt(h.count)):zikrHatimTarget(p);
    return remaining>0?[[String(remaining),'Kalan '+(remaining.toLocaleString('tr-TR'))]]:[];
  }
  return [[String(p.target||33),(p.target||33)+' bir tur'],['100','+100'],['500','+500']];
}
function zikrManualPreviewHTML(p,d){
  var amount=zikrManualAmountOf(d);
  if(amount<=0) return '';
  var jp=zikrJourneyProgress(p), m=jp.math;
  var date=todayStr();
  var day=zikrDay(date), pd=zikrPresetDay(day,p.id);
  var todayAfter=pd.count+amount, totalAfter=day.totalCount+amount;
  var h='';
  h+='<div class="zikr-v2-manual-preview" role="status" aria-live="polite">';
  h+='<span>Bugün '+pd.count.toLocaleString('tr-TR')+' → <b>'+todayAfter.toLocaleString('tr-TR')+'</b>';
  h+=' · Ömürlük '+zikrInt(jp.journey.lifetimeCount).toLocaleString('tr-TR')+' → <b>'+(zikrInt(jp.journey.lifetimeCount)+amount).toLocaleString('tr-TR')+'</b>';
  if(p.kind==='esma'&&jp.hatim){
    var room=zikrHatimTarget(p)-zikrInt(jp.hatim.count);
    var capped=Math.min(amount,Math.max(0,room));
    h+=' · Hatim '+(zikrInt(jp.hatim.count)+capped).toLocaleString('tr-TR')+'/'+zikrHatimTarget(p).toLocaleString('tr-TR');
  }
  h+='</span></div>';
  return h;
}
function zikrManualSheetHTML(p){
  var ui=viewUi();
  if(!ui.zikrManualOpen) return '';
  var d=zikrManualDraftFor(p);
  var chips=zikrManualQuickChips(p);
  var amount=zikrManualAmountOf(d);
  var todayManual=zikrManualActive(todayStr(),p.id);
  var h='<section id="zikr-manual-sheet" class="zikr-v2-manual'+(ui.zikrManualOpen?' is-open':'')+'" aria-label="Elle zikir ekle">';
  h+='<div class="zikr-v2-manual-head"><span class="icon">'+icon('pencil',17)+'</span><div><small>ELLE SAYIM EKLE</small><strong>'+esc(p.name)+'</strong></div><button class="close" onclick="App.toggleZikrManual()" aria-label="El eklemeyi kapat">'+icon('x',15)+'</button></div>';
  h+='<p class="zikr-v2-manual-lead">Tespihle, cemaatle ya da sayfa üzerinde saydığın zikirleri tek bütünde ekle. Sayacın ilerlemesiyle birlikte kaydedilir.</p>';
  h+='<div class="zikr-v2-manual-stepper" role="group" aria-label="Miktar">';
  h+='<button class="step" onclick="App.zikrManualStep(-1)" aria-label="On azalt">−</button>';
  h+='<input id="zikr-manual-amount" type="text" inputmode="numeric" pattern="[0-9]*" value="'+esc(d.amount||'')+'" oninput="App.onZikrManualAmount(this)" placeholder="0" aria-label="Miktar">';
  h+='<button class="step" onclick="App.zikrManualStep(1)" aria-label="On artır">+</button>';
  h+='</div>';
  if(chips.length){
    h+='<div class="zikr-v2-manual-chips" role="group" aria-label="Hızlı miktar">';
    chips.forEach(function(c){ h+='<button onclick="App.zikrManualChip('+c[0]+')">'+esc(c[1])+'</button>'; });
    h+='</div>';
  }
  h+='<div id="zikr-manual-preview">'+zikrManualPreviewHTML(p,d)+'</div>';
  h+='<label class="zikr-v2-manual-note"><span>Nasıl? <em>(isteğe bağlı)</em></span><input type="text" maxlength="200" value="'+esc(d.note||'')+'" oninput="App.onZikrManualNote(this)" placeholder="Tespihle, cemaatle…"></label>';
  if(todayManual>0) h+='<div class="zikr-v2-manual-today">'+icon('feather',13)+' Bugün elle eklenen: <b>'+todayManual.toLocaleString('tr-TR')+'</b></div>';
  h+='<div class="zikr-v2-manual-actions"><button class="ghost" onclick="App.toggleZikrManual()">Vazgeç</button><button class="primary" onclick="App.saveZikrManual()"'+(amount<=0?' disabled':'')+'>'+icon('check',15)+' Sayıma ekle</button></div>';
  h+='</section>';
  return h;
}
function zikrCounterViewHTML(p,z){
  var ui=viewUi();
  var jp=zikrJourneyProgress(p), m=jp.math, day=zikrDay(todayStr()), pd=zikrPresetDay(day,p.id);
  var session=z.activeSession&&z.activeSession.presetId===p.id?z.activeSession:null;
  var sessionState=zikrSessionState(p), pauseLabel=sessionState==='active'?'Duraklat':(sessionState==='paused'?'Sürdür':'Başlat');
  var R=viewRingRadius(), C=2*Math.PI*R, cyclePct=m.complete?1:(m.cyclePosition/m.baseTarget), off=C*(1-cyclePct);
  var h='<section class="zikr-v2-counter'+(z.settings.focusMode?' is-focus':'')+'" aria-labelledby="zikr-active-name">';
  // ZP-08.1: eski genel "NİYET" kutusu kaldırıldı — kullanıcı geri bildirimi
  // ("esmanın anlamı görünmüyor") üzerine Esmâ/zikrin GERÇEK Türkçe anlamı
  // artık isim bloğunun altında DOĞRUDAN görünür, tıklama gerektirmez.
  // İçerik modülü (esmaulHusnaV2.js/zikirCoreContentV1.js) yoksa eski
  // ZIKR_NIYET/generic metne düşülür (geriye dönük güvenli).
  var content=viewContentFor(p);
  var meaningTr=(content&&content.meaningTr)||viewNiyet()[p.id]||(p.kind==='esma'?'Bu ismin anlamı yakında eklenecek.':'Niyet kalpten gelir; sayı yalnızca ritmi korur.');
  h+='<div class="zikr-v2-name"><div class="arabic" lang="ar" dir="rtl">'+esc(p.arabic||p.phrase||p.name)+'</div>';
  // ZP-08.2: tezhip esinli ince altın ayraç — Arapça hattı Türkçe adından
  // ayıran tek dekoratif öğe (metin arkasında değil, kendi satırında).
  h+='<div class="ornament" aria-hidden="true"><i></i><b>﴿﴾</b><i></i></div>';
  h+='<h2 id="zikr-active-name">'+esc(p.name)+'</h2>';
  h+='<p class="zikr-v2-meaning">'+esc(meaningTr)+'</p>';
  h+='<div class="meta">'+(p.kind==='esma'?'<span>Ebced <b>'+m.baseTarget+'</b></span><span>Tam hatim <b>'+m.baseTarget+'²</b> · <b>'+m.hatimTarget.toLocaleString('tr-TR')+'</b></span>':'<span>Tur hedefi <b>'+m.baseTarget+'</b></span>')+'</div>';
  h+='<div id="zikr-detail-region">'+zikrDetailControlsHTML(p)+'</div>';
  h+='</div>';
  if(p.kind==='esma'&&m.complete){
    h+='<div class="zikr-v2-complete"><div class="spark">✦</div><h3>Ebced² Tam Hatim tamamlandı</h3><p>'+m.hatimTarget.toLocaleString('tr-TR')+' zikir ve '+m.completedCycles+' tam tur, güvenle arşivlendi.</p><button onclick="App.startNewZikrHatim()">Yeni hatim başlat</button></div>';
  } else {
    h+='<button id="zikr-tap-button" class="zikr-v2-tap is-'+sessionState+(z.settings.breathGuide?' is-breathing':'')+'" onclick="App.zikrTap()" aria-label="'+esc(p.name)+' sayacını bir artır">';
    h+='<span class="zikr-v2-aura" aria-hidden="true"></span><span class="zikr-v2-halo"></span><svg viewBox="0 0 260 260" aria-hidden="true"><circle cx="130" cy="130" r="124" class="rim"/><circle cx="130" cy="130" r="116" class="beads"/><circle cx="130" cy="130" r="'+R+'" class="track"/><circle id="zikr-live-ring" cx="130" cy="130" r="'+R+'" class="progress" stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+'"/><circle cx="130" cy="130" r="91" class="inner-rim"/><g class="marks"><path d="M130 2l5 6-5 6-5-6z"/><path d="M258 130l-6 5-6-5 6-5z"/><path d="M130 258l-5-6 5-6 5 6z"/><path d="M2 130l6-5 6 5-6 5z"/></g></svg>';
    h+='<span class="zikr-v2-orbit" aria-hidden="true"><i></i><i></i><i></i></span>';
    h+='<span class="zikr-v2-core"><b id="zikr-live-kicker">'+m.currentCycleNo+'. TUR · '+m.cyclePosition+' SAYILDI</b><strong id="zikr-live-count">'+(p.kind==='esma'?m.remainingInCycle:m.cyclePosition)+'</strong><small id="zikr-live-sub">'+(p.kind==='esma'?'kaldı':'/ '+m.baseTarget)+'</small><i aria-hidden="true">✦</i><em id="zikr-live-action">'+(sessionState==='paused'?'sürdür ve zikret':'dokunarak zikret')+'</em></span>';
    h+='<span class="zikr-done-spark'+(viewCompleteFlash()?' on':'')+'"><b>✦</b></span></button>';
  }
  // ZP-07 rule 2: sayaç ekranında en fazla ÜÇ ilerleme seviyesi bir arada
  // gösterilir — "bugün", "bu tur", "tam hatim/ömürlük" (prompt paketi §3).
  // Önceki sürümde ayrı bir "seans" sayacı da vardı (toplam 5 rakam); bu,
  // gereksiz rozet/istatistik kalabalığı sayıldığı için kaldırıldı. Oturum
  // sayısı hâlâ activeSession'da tutuluyor ve durum makinesinden okunabilir;
  // yalnız her an ekranda GÖRÜNMÜYOR.
  h+='<div class="zikr-v2-cycle-grid">';
  h+='<div><span>BUGÜN</span><strong id="zikr-live-today">'+pd.count.toLocaleString('tr-TR')+'</strong><small id="zikr-live-today-sub">'+day.totalCount.toLocaleString('tr-TR')+' toplam</small></div>';
  h+='<div><span>BU TUR</span><strong id="zikr-live-cycle">'+(m.complete?m.baseTarget+' tur tamam':m.currentCycleNo+'. tur · '+m.cyclePosition+'/'+m.baseTarget)+'</strong><small id="zikr-live-cycle-sub">'+(m.complete?'Yeni hatme hazırsın':m.remainingInCycle+' kaldı')+'</small></div>';
  h+='<div><span>'+(p.kind==='esma'?'TAM HATİM':'ÖMÜRLÜK')+'</span><strong id="zikr-live-hatim">'+(p.kind==='esma'?(m.count.toLocaleString('tr-TR')+' / '+m.hatimTarget.toLocaleString('tr-TR')):(jp.journey.lifetimeCount.toLocaleString('tr-TR')+' zikir'))+'</strong><small id="zikr-live-hatim-sub">'+(p.kind==='esma'?m.remainingInHatim.toLocaleString('tr-TR')+' kaldı':Math.floor(jp.journey.lifetimeCount/m.baseTarget)+' tur')+'</small></div>';
  h+='</div>';
  h+='<div id="zikr-action-region">'+zikrActionNoteHTML()+'</div>';
  h+='<div id="zikr-reset-region">'+zikrResetConfirmHTML(p,pd)+'</div>';
  h+='<div id="zikr-manual-region">'+zikrManualSheetHTML(p)+'</div>';
  // Alt eylem bölgesi: sırasında gereken geri al / duraklat ve kullanıcının
  // açıkça istediği, onay korumalı "bugünü sıfırla". Ses/titreşim/odak/nefes/
  // hareket ayarları Ayarlar sekmesinde kalır.
  h+='<div class="zikr-v2-dock" role="toolbar" aria-label="Sayaç araçları">';
  h+='<button id="zikr-undo-button" onclick="App.zikrUndo()" aria-label="Son sayaç işlemini geri al">'+icon('rotate-ccw',17)+'<span>Geri al</span></button>';
  h+='<button id="zikr-pause-button" class="pause '+sessionState+'" onclick="App.toggleZikrPause()" aria-label="'+pauseLabel+'">'+icon(sessionState==='active'?'pause':'play',17)+'<span>'+pauseLabel+'</span></button>';
  h+='<button id="zikr-manual-button" class="manual'+(ui.zikrManualOpen?' is-open':'')+'" onclick="App.toggleZikrManual()" aria-expanded="'+(!!ui.zikrManualOpen)+'" aria-controls="zikr-manual-region" aria-label="Elle zikir sayımı ekle">'+icon('pencil',17)+'<span>Elle ekle</span></button>';
  h+='<button id="zikr-reset-button" class="reset'+(ui.zikrResetPending&&ui.zikrResetPresetId===p.id?' is-armed':'')+'" onclick="App.zikrResetToday()" aria-label="Bugünkü '+esc(p.name)+' sayımını sıfırla">'+icon('trash-2',17)+'<span>'+(ui.zikrResetPending&&ui.zikrResetPresetId===p.id?'Onay bekliyor':'Sıfırla')+'</span></button>';
  h+='</div>';
  h+='<div id="zikr-note-host">'+zikrNoteEditorHTML(p)+'</div>';
  h+='<div class="zikr-v2-sr" role="status" aria-live="polite">'+(m.complete?esc(p.name)+' Ebced kare tam hatmi tamamlandı':esc(p.name)+', '+m.currentCycleNo+'. tur, '+m.cyclePosition+' sayıldı, '+m.remainingInCycle+' kaldı')+'</div>';
  h+='</section>';
  return h;
}
function zikrPresetsResultsHTML(p,z){
  var ui=viewUi();
  var filter=viewNormalizeSearchText(String(ui.zikrPresetFilter||'').trim());
  var mode=ui.zikrLibFilter||'all', topic=viewTopicGroup(ui.zikrTopic||'all').id;
  function modeMatch(x){
    if(mode==='fav') return !!x.favorite;
    var pr=zikrJourneyProgress(x);
    if(mode==='active') return pr.math.count>0&&!pr.math.complete;
    if(mode==='done') return pr.math.complete||zikrInt(pr.journey&&pr.journey.completedHatims)>0;
    return true;
  }
  var themed=z.presets.filter(function(x){ return viewTopicMatch(x,topic); });
  var searched=themed.filter(function(x){ return !filter||viewPresetSearchText(x).indexOf(filter)>=0; });
  var visible=searched.filter(modeMatch);
  var counts={all:searched.length,active:0,done:0,fav:0};
  searched.forEach(function(x){
    var pr=zikrJourneyProgress(x);
    if(pr.math.count>0&&!pr.math.complete) counts.active++;
    if(pr.math.complete||zikrInt(pr.journey&&pr.journey.completedHatims)>0) counts.done++;
    if(x.favorite) counts.fav++;
  });
  var modeLabel={all:'Tümü',active:'Devam eden',done:'Tamamlanan',fav:'Favoriler'}[mode]||'Tümü';
  var h='<section class="zikr-v2-filter-expander'+(ui.zikrFiltersOpen?' is-open':'')+'">';
  h+='<button class="zikr-v2-filter-summary" onclick="App.toggleZikrFilters()" aria-expanded="'+(!!ui.zikrFiltersOpen)+'" aria-controls="zikr-filter-panel"><span class="filter-icon">'+icon('settings',17)+'</span><span class="filter-copy"><small>KEŞİF FİLTRELERİ</small><strong>'+esc(viewTopicGroup(topic).label)+' · '+modeLabel+'</strong></span><span class="filter-count">'+visible.length+' kayıt</span><span class="filter-chevron">'+icon('chevron-down',16)+'</span></button>';
  h+='<div id="zikr-filter-panel" class="zikr-v2-filter-panel"'+(ui.zikrFiltersOpen?'':' hidden')+'>';
  h+='<div class="zikr-v2-topic-head"><span>NİYETİNE GÖRE KEŞFET</span><small>Yakın anlamlı Esmâ ve zikirler birlikte</small></div>';
  h+='<div class="zikr-v2-topics" role="group" aria-label="Niyet ve konu filtresi">';
  viewTopicGroups().forEach(function(group){
    var count=z.presets.filter(function(x){ return viewTopicMatch(x,group.id); }).length;
    h+='<button class="'+(topic===group.id?'on':'')+'" onclick="App.setZikrTopic(\''+group.id+'\')" aria-pressed="'+(topic===group.id)+'">'+icon(group.icon,14)+'<span>'+group.label+'</span><b>'+count+'</b></button>';
  });
  h+='</div>';
  h+='<div class="zikr-v2-chips" role="group" aria-label="İlerleme filtresi">';
  [['all','Tümü'],['active','Devam eden'],['done','Tamamlanan'],['fav','Favoriler']].forEach(function(f){
    h+='<button class="'+(mode===f[0]?'on':'')+'" onclick="App.setZikrLibFilter(\''+f[0]+'\')" aria-pressed="'+(mode===f[0])+'">'+f[1]+'<b>'+counts[f[0]]+'</b></button>';
  });
  h+='</div></div></section><div class="zikr-v2-result-note"><strong>'+visible.length+'</strong> kayıt'+(topic!=='all'?' · '+esc(viewTopicGroup(topic).label):'')+(filter?' · “'+esc(ui.zikrPresetFilter||'')+'”':'')+'</div>';
  h+='<div class="zikr-v2-preset-list">';
  visible.forEach(function(x){
    var pr=zikrJourneyProgress(x), xm=pr.math, active=x.id===p.id, xc=viewContentFor(x);
    var arabic=x.arabic||(x.kind==='esma'?x.phrase:'');
    var progress=Math.round(xm.progress*100), topicLabel=viewPresetTopicLabel(x);
    h+='<article class="zikr-v2-preset '+(active?'active':'')+'"><button class="main" onclick="App.setZikrPreset(\''+esc(x.id)+'\')">';
    h+='<span class="preset-head"><span class="topic">'+esc(topicLabel)+'</span>'+(active?'<span class="state">AKTİF</span>':'')+'</span>';
    h+='<span class="titleline"><strong>'+esc(x.name)+'</strong>'+(arabic?'<span class="arabic" lang="ar" dir="rtl">'+esc(arabic)+'</span>':'')+'</span>';
    if(xc&&xc.meaningTr) h+='<span class="meaning">'+esc(xc.meaningTr)+'</span>';
    h+='<span class="progress"><i><b style="width:'+progress+'%"></b></i><span>'+(x.kind==='esma'?('Ebced '+xm.baseTarget+' · '+xm.count.toLocaleString('tr-TR')+'/'+xm.hatimTarget.toLocaleString('tr-TR')):('Hedef '+xm.baseTarget+' · '+pr.journey.lifetimeCount.toLocaleString('tr-TR')+' ömürlük'))+'</span></span>';
    h+='</button><button class="fav" onclick="App.toggleZikrFavorite(\''+esc(x.id)+'\')" aria-label="'+esc(x.name)+' favorisini değiştir" aria-pressed="'+x.favorite+'">★</button>';
    if(!x.builtIn) h+='<button class="remove" onclick="App.deleteZikrPreset(\''+esc(x.id)+'\')" aria-label="'+esc(x.name)+' presetini sil">×</button>';
    h+='</article>';
  });
  if(!visible.length) h+='<div class="zikr-v2-empty"><strong>Bu mercekte eşleşme yok.</strong><span>Aramayı temizleyebilir veya başka bir niyet konusu seçebilirsin.</span></div>';
  h+='</div>';
  if(ui.zikrPresetDraft) h+='<div class="zikr-v2-custom"><h3>Kişisel zikir</h3><input value="'+esc(ui.zikrPresetDraft.name||'')+'" oninput="App.onZikrPresetField(\'name\',this)" placeholder="Zikir adı"><input value="'+esc(ui.zikrPresetDraft.target||'100')+'" type="number" min="1" max="1000000" inputmode="numeric" oninput="App.onZikrPresetField(\'target\',this)" placeholder="Tur hedefi"><div><button onclick="App.saveZikrPreset()">Kaydet</button><button class="ghost" onclick="App.cancelZikrPresetAdd()">Vazgeç</button></div></div>';
  else h+='<button class="zikr-v2-add" onclick="App.openZikrPresetAdd()">'+icon('sparkles',15)+' Kişisel zikir oluştur</button>';
  return h;
}
function zikrPresetsViewHTML(p,z){
  var ui=viewUi();
  var h='<section class="zikr-v2-library"><div class="zikr-v2-section-head"><div><span>ESMÂ KÜTÜPHANESİ</span><h2>İsmi değil, anlamı keşfet</h2><p>99 Esmâ ve temel zikirler; niyet, anlam ve devam eden yolculuklarına göre düzenlendi.</p></div></div>';
  h+='<label class="zikr-v2-search">'+icon('search',16)+'<input id="zikr-search-input" value="'+esc(ui.zikrPresetFilter||'')+'" oninput="App.setZikrPresetFilter(this)" placeholder="İsim, anlam, Arapça veya ebced ara" aria-label="Zikir ara"><button id="zikr-search-clear" class="clear" onclick="App.clearZikrPresetFilter()" aria-label="Aramayı temizle"'+(ui.zikrPresetFilter?'':' hidden')+'>'+icon('x',13)+'</button></label>';
  h+='<div id="zikr-library-results">'+zikrPresetsResultsHTML(p,z)+'</div>';
  h+='<p class="zikr-v2-disclaimer">Esmâ anlamları sabit editoryal içerikten gelir. Konu grupları keşif içindir; dinî hüküm veya reçeteli sayı önerisi değildir.</p></section>';
  return h;
}
function zikrHatimsViewHTML(p,z){
  var ui=viewUi();
  var esmas=z.presets.filter(function(x){ return x.kind==='esma'; }), ongoing='', archive='';
  function card(x,j,h,m){
    var done=h.status==='completed', pct=m.progress*100, content=viewContentFor(x), category=viewPresetTopicLabel(x);
    var armed=ui.zikrRemovePresetId===x.id&&ui.zikrRemoveHatimId===h.id;
    var c='<article class="zikr-v2-hatim-card '+(done?'complete':'')+'">';
    c+='<div class="hatim-badges"><span class="state">'+(done?'TAMAMLANDI':'DEVAM EDİYOR')+'</span><span class="category">'+esc(category)+'</span></div>';
    c+='<div class="top"><div><h3>'+esc(x.name)+'</h3>'+(content&&content.meaningTr?'<p>'+esc(content.meaningTr)+'</p>':'')+'</div><span class="arabic" lang="ar" dir="rtl">'+esc(x.arabic||x.phrase||'•')+'</span></div>';
    c+='<div class="hatim-metrics"><div><span>SAYILAN</span><strong>'+m.count.toLocaleString('tr-TR')+'</strong></div><div><span>TUR</span><strong>'+m.completedCycles+' / '+m.baseTarget+'</strong></div><div><span>KALAN</span><strong>'+m.remainingInHatim.toLocaleString('tr-TR')+'</strong></div></div>';
    c+='<div class="progress-head"><span>Ebced² hedef · '+m.hatimTarget.toLocaleString('tr-TR')+'</span><b>%'+(pct<10?pct.toFixed(1).replace('.',','):Math.round(pct))+'</b></div><div class="bar"><i style="width:'+Math.round(pct)+'%"></i></div>';
    c+='<div class="foot"><span>'+m.cyclePosition+' / '+m.baseTarget+' bu tur</span><span>'+zikrInt(j.completedHatims)+' tam hatim</span></div>';
    c+='<div class="actions"><button class="primary" onclick="App.openZikrHatim(\''+esc(x.id)+'\',\''+esc(h.id)+'\')">'+(done?'Görüntüle':'Devam et')+'</button><button class="remove" onclick="App.requestRemoveZikrHatim(\''+esc(x.id)+'\',\''+esc(h.id)+'\')">'+icon('trash-2',14)+' Kaldır</button></div>';
    if(armed) c+='<div class="remove-confirm" role="alert"><strong>Bu hatmi listeden kaldır?</strong><span>Ömürlük toplamın korunur; kayıt arşivlenir.</span><div><button onclick="App.cancelRemoveZikrHatim()">Vazgeç</button><button class="danger" onclick="App.confirmRemoveZikrHatim()">Kaldır</button></div></div>';
    c+='</article>';
    return c;
  }
  esmas.forEach(function(x){
    var j=zikrJourney(x,false); if(!j) return;
    (j.hatims||[]).forEach(function(h){
      if(!h||h.status==='archived') return;
      var m=zikrMath(x,h.count);
      if(h.status==='completed') archive+=card(x,j,h,m); else ongoing+=card(x,j,h,m);
    });
  });
  var out='<section class="zikr-v2-hatims"><div class="zikr-v2-section-head"><div><span>HATİMLERİM</span><h2>Kalıcı Esmâ yolculukları</h2><p>Uygulamayı kapatsan da her isim kendi kaldığı yerden devam eder.</p></div></div>';
  if(ongoing||archive){
    if(ongoing) out+='<div class="zikr-v2-group"><h3>Devam edenler</h3>'+ongoing+'</div>';
    if(archive) out+='<div class="zikr-v2-group"><h3>Arşiv · tamamlananlar</h3>'+archive+'</div>';
  } else {
    out+='<div class="zikr-v2-empty"><strong>Henüz başlayan bir Esmâ hatmi yok.</strong><span>Kütüphaneden bir isim seçip ilk dokunuşunla başlayabilirsin.</span><button onclick="App.setZikrView(\'presets\')">99 Esmâ’yı aç</button></div>';
  }
  out+='</section>'; return out;
}
function zikrHistoryViewHTML(z){
  // ZP-07: eski "Özet" görünümünün istatistik kısmı — ayarlar buradan
  // zikrSettingsViewHTML'e taşındı (tek görevli ekran ilkesi). Derin nötr
  // analiz/ısı haritası zenginleştirmesi ZP-18'in kapsamıdır.
  var day=zikrDay(todayStr()), w=zikrWeek(todayStr()), lifetime=0, completed=0, max=1, bars='', top=[];
  Object.keys(z.journeys).forEach(function(pid){ var j=z.journeys[pid]; lifetime+=zikrInt(j&&j.lifetimeCount); completed+=zikrInt(j&&j.completedHatims); if(j&&j.lifetimeCount){ var p=zikrPreset(pid); top.push({name:p&&p.name||pid,count:j.lifetimeCount}); } });
  for(var i=6;i>=0;i--){ var date=addDays(todayStr(),-i), d=zikrDay(date); if(d.totalCount>max) max=d.totalCount; }
  for(var k=6;k>=0;k--){ var dt=addDays(todayStr(),-k), dy=zikrDay(dt), hp=Math.max(5,Math.round(dy.totalCount/max*100)); bars+='<div><i style="height:'+hp+'%"></i><b>'+dy.totalCount+'</b><span>'+['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'][new Date(dt+'T12:00:00').getDay()]+'</span></div>'; }
  top.sort(function(a,b){return b.count-a.count;});
  var h='<section class="zikr-v2-stats"><div class="zikr-v2-section-head"><div><span>GEÇMİŞ</span><h2>Yargısız, sakin ilerleme</h2><p>Sayılar performans notu değil; yalnızca kaldığın yeri hatırlatır.</p></div></div>';
  h+='<div class="zikr-v2-kpis"><div><span>BUGÜN</span><strong>'+day.totalCount.toLocaleString('tr-TR')+'</strong><small>'+day.completedSets+' tur</small></div><div><span>7 GÜN</span><strong>'+w.total.toLocaleString('tr-TR')+'</strong><small>'+w.days+' aktif gün</small></div><div><span>ÖMÜRLÜK</span><strong>'+lifetime.toLocaleString('tr-TR')+'</strong><small>'+completed+' tam hatim</small></div></div>';
  h+='<div class="zikr-v2-week"><div class="title"><strong>Son 7 gün</strong><span>'+zikrStreak()+' gün devamlılık</span></div><div class="bars">'+bars+'</div></div>';
  if(top.length){ h+='<div class="zikr-v2-top"><h3>En çok eşlik edenler</h3>'; top.slice(0,5).forEach(function(x,i){ h+='<div><span><b>'+(i+1)+'</b>'+esc(x.name)+'</span><strong>'+x.count.toLocaleString('tr-TR')+'</strong></div>'; }); h+='</div>'; }
  var notes=zikrReflectionsFor();
  h+='<div class="zikr-v2-note-archive"><div class="title"><div><span>TEFEKKÜR ARŞİVİ</span><h3>Kalbinde kalanlar</h3></div><b>'+notes.length+' kayıt</b></div>';
  if(notes.length) notes.slice(0,30).forEach(function(n){
    var mood=n.mood?'<span class="mood">'+esc(n.mood)+'</span>':'';
    h+='<article><div class="head"><div><time>'+esc(dateLabelTR(n.date))+'</time><strong>'+esc(n.presetName||(zikrPreset(n.presetId)||{}).name||n.presetId)+'</strong></div>'+mood+'</div>';
    if(n.feelings) h+='<p><b>Hislerim</b>'+esc(n.feelings)+'</p>';
    if(n.thoughts) h+='<p><b>Düşüncelerim</b>'+esc(n.thoughts)+'</p>';
    if(n.intention) h+='<p class="intention"><b>Duam · niyetim</b>'+esc(n.intention)+'</p>';
    h+='<footer>'+n.wordCount+' kelime · '+esc((n.updatedAt||'').slice(11,16))+'</footer></article>';
  }); else h+='<div class="zikr-v2-empty"><strong>Henüz tefekkür kaydı yok.</strong><span>Sayaç ekranında ilk notunu yazdığında burada tarih ve zikir adına göre arşivlenecek.</span></div>';
  h+='</div>';
  // ZP-10: elle sayım defteri — provenance dürüstlüğü. Her kayıt salt-okunur
  // bir olaydır; geri alınanlar (revertedAt) soluk tonla "geri alındı" yazar.
  var manuals=(Array.isArray(z.manualEntries)?z.manualEntries:[]).slice().sort(function(a,b){ return String(b.updatedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.createdAt||'')); }).slice(0,30);
  h+='<div class="zikr-v2-manual-archive"><div class="title"><div><span>ELLE SAYIM DEFTERİ</span><h3>Sayaç dışı eklenenler</h3></div><b>'+manuals.length+' kayıt</b></div>';
  if(manuals.length) manuals.forEach(function(e){
    var done=!e.revertedAt;
    h+='<article'+(done?'':' class="is-reverted"')+'><div class="head"><div><time>'+esc(dateLabelTR(e.date))+'</time><strong>'+esc((zikrPreset(e.presetId)||{}).name||e.presetId)+'</strong></div><b class="amount">'+zikrInt(e.amount).toLocaleString('tr-TR')+'</b></div>';
    if(e.note) h+='<p>'+esc(e.note)+'</p>';
    h+='<footer>'+(done?'Elle eklendi':'Geri alındı · '+esc((e.revertedAt||'').slice(11,16)))+' · '+esc((e.updatedAt||e.createdAt||'').slice(11,16))+'</footer>';
    if(done) h+='<div class="undo-row"><button onclick="App.undoZikrManual(\''+esc(e.id)+'\')">'+icon('rotate-ccw',13)+' Bu kaydı geri al</button></div>';
    h+='</article>';
  }); else h+='<div class="zikr-v2-empty"><strong>Henüz elle sayım eklenmedi.</strong><span>Sayaçta "Elle ekle" ile tespih ya da cemaat zikirlerini kaydettiğinde defter burada tutulur.</span></div>';
  h+='</div>';
  h+='</section>'; return h;
}
function zikrSettingsViewHTML(z){
  var ui=viewUi();
  // ZP-07: sayaç ekranındaki dock'tan (ses/titreşim/odak) ve eski "Özet"ten
  // (nefes/hareket/uyanık-tut/otomatik-ilerleme) TÜM ayarlar tek bir yerde.
  // ZP-08.2: 7 ayar tek uzun listeden anlamlı üç gruba ayrıldı (duyusal /
  // odak / akış) — tarama yükünü azaltan gruplama, ayar sayısı aynı.
  function row(key,title,sub){
    return '<button id="zikr-setting-'+key+'" onclick="App.toggleZikrSetting(\''+key+'\')" aria-pressed="'+!!z.settings[key]+'"><span><b>'+title+'</b><small>'+sub+'</small></span><i class="'+(z.settings[key]?'on':'')+'"></i></button>';
  }
  var h='<section class="zikr-v2-settings-view"><div class="zikr-v2-section-head"><div><span>AYARLAR</span><h2>Sayaç deneyimi</h2><p>Bu ayarlar kapalıyken de sayaç çalışmaya devam eder.</p></div></div>';
  h+='<div class="zikr-v2-settings"><h3>Duyusal geri bildirim</h3>';
  h+=row('soundOn','Ses','Her dokunuşta hafif bir tık sesi');
  h+=row('haptic','Titreşim','Desteklenen cihazlarda dokunma geri bildirimi');
  h+='</div>';
  h+='<div class="zikr-v2-settings"><h3>Odak ve ekran</h3>';
  h+=row('focusMode','Odak modu','Sayaç ekranında yalnız isim ve sayaç kalır');
  h+=row('breathGuide','Nefes ritmi','İsteğe bağlı yavaş görsel rehber');
  h+=row('reducedMotion','Hareketi azalt','Sayaç animasyonlarını sakinleştirir');
  h+=row('keepAwake','Ekranı uyanık tut','Desteklenen cihazlarda yalnız sayaç açıkken');
  h+='</div>';
  h+='<div class="zikr-v2-settings"><h3>Akış</h3>';
  h+=row('autoAdvance','Otomatik sıradaki zikir','Yalnız normal tur tamamlanınca');
  h+='</div>';
  h+='<div id="zikr-settings-note" class="zikr-v2-settings-note" role="status" aria-live="polite"'+(ui.zikrSettingsNote?'':' hidden')+'>'+(ui.zikrSettingsNote?(icon('circle-check',14)+'<span>'+esc(ui.zikrSettingsNote)+'</span>'):'')+'</div>';
  h+='<p class="zikr-v2-disclaimer">Ebced², geleneksel ebced hesabına dayalı kişisel bir tamamlama yolculuğudur; dua ve zikrin kabulü için zorunlu bir sayı değildir.</p>';
  h+='</section>'; return h;
}
function zikrViewBodyHTML(view,p,z){
  return view==='presets'?zikrPresetsViewHTML(p,z):(view==='hatims'?zikrHatimsViewHTML(p,z):(view==='history'?zikrHistoryViewHTML(z):(view==='settings'?zikrSettingsViewHTML(z):zikrCounterViewHTML(p,z))));
}

  window.SeymaZikr={
    registerZikr:registerZikr,
    zikrPreviewCardHTML:zikrPreviewCardHTML,
    zikrDetailControlsHTML:zikrDetailControlsHTML,
    zikrResetConfirmHTML:zikrResetConfirmHTML,
    zikrActionNoteHTML:zikrActionNoteHTML,
    zikrNoteEditorHTML:zikrNoteEditorHTML,
    zikrManualAmountOf:zikrManualAmountOf,
    zikrManualQuickChips:zikrManualQuickChips,
    zikrManualPreviewHTML:zikrManualPreviewHTML,
    zikrManualSheetHTML:zikrManualSheetHTML,
    zikrCounterViewHTML:zikrCounterViewHTML,
    zikrPresetsResultsHTML:zikrPresetsResultsHTML,
    zikrPresetsViewHTML:zikrPresetsViewHTML,
    zikrHatimsViewHTML:zikrHatimsViewHTML,
    zikrHistoryViewHTML:zikrHistoryViewHTML,
    zikrSettingsViewHTML:zikrSettingsViewHTML,
    zikrViewBodyHTML:zikrViewBodyHTML,
    ZIKR_SEED:ZIKR_SEED,
    ZIKR_SCHEMA_VERSION:ZIKR_SCHEMA_VERSION,
    ZIKR_MIGRATION_VERSION:ZIKR_MIGRATION_VERSION,
    ZIKR_MANUAL_MAX:ZIKR_MANUAL_MAX,
    ZIKR_MANUAL_KEEP:ZIKR_MANUAL_KEEP,
    zikrUid:zikrUid,
    zikrInt:zikrInt,
    emptyZikrRoot:emptyZikrRoot,
    zikrNormalizeManualEntry:zikrNormalizeManualEntry,
    migrateZikrV5:migrateZikrV5,
    emptyZikrDay:emptyZikrDay,
    emptyZikrPresetDay:emptyZikrPresetDay,
    zikrEsmaSeed:zikrEsmaSeed,
    zikrSeedPreset:zikrSeedPreset,
    zikrBaseTarget:zikrBaseTarget,
    zikrHatimTarget:zikrHatimTarget,
    zikrMath:zikrMath,
    zikrNewHatim:zikrNewHatim,
    zikrNormalizeRoot:zikrNormalizeRoot,
    migrateZikrV4:migrateZikrV4,
    migrateZikrV3:migrateZikrV3,
    migrateZikrV2:migrateZikrV2,
    ensureZikrRoot:ensureZikrRoot,
    zikrPreset:zikrPreset,
    zikrActivePreset:zikrActivePreset,
    zikrDay:zikrDay,
    zikrPresetDay:zikrPresetDay,
    zikrPresetDayCount:zikrPresetDayCount,
    zikrReflectionId:zikrReflectionId,
    zikrReflection:zikrReflection,
    zikrReflectionWordCount:zikrReflectionWordCount,
    zikrReflectionsFor:zikrReflectionsFor,
    zikrPresetDone:zikrPresetDone,
    zikrDayCompleted:zikrDayCompleted,
    zikrStreak:zikrStreak,
    zikrWeek:zikrWeek,
    zikrJourney:zikrJourney,
    zikrActiveHatim:zikrActiveHatim,
    zikrJourneyProgress:zikrJourneyProgress,
    zikrSessionState:zikrSessionState,
    zikrTouchTick:zikrTouchTick,
    syncZikrDayMirror:syncZikrDayMirror,
    zikrManualActive:zikrManualActive,
    zikrTickSound:zikrTickSound,
    zikrPauseSession:zikrPauseSession,
    zikrManualApply:zikrManualApply,
    zikrManualUndoEntry:zikrManualUndoEntry,
    zikrManualEntryCountFor:zikrManualEntryCountFor
  };
})();
