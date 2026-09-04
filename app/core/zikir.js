(function(){
  'use strict';

  // MON-20 · Zikirmatik motor registry
  // Seed, normalizasyon, hedef/oturum matematiği, tap ve history/settings
  // motor gövdeleri burada yaşar. Root data rebind'i, render/DOM ve App
  // kabuğu app.js'te kalır; registry yalnız canlı resolver bag'i kullanır.
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

  window.SeymaZikr={
    registerZikr:registerZikr,
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
