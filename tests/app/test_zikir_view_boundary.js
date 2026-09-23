'use strict';

// MON-21 · SeymaZikir görünüm registry sınırı ve dump parity fixture'ı.
// Yalnız sentetik root/resolver kullanır; browser, localStorage, ağ ve gerçek
// kullanıcı verisi yoktur. Hash'ler MON-20 parent kaynaklarındaki görünüm
// gövdelerinin aynı sentetik fixture ile alınan sabit çıktılarıdır.

var fs=require('fs');
var path=require('path');
var vm=require('vm');
var crypto=require('crypto');
var repoRoot=require('../repo-root');
var source=fs.readFileSync(path.join(repoRoot,'app/core/zikir.js'),'utf8');
var appSource=fs.readFileSync(path.join(repoRoot,'app.js'),'utf8');
var passed=0,failed=0;
function ok(name,condition,detail){
  if(condition){ passed++; console.log('  ✓ '+name); }
  else { failed++; console.log('  ✗ '+name+(detail?' — '+detail:'')); }
}
function sha256(s){ return crypto.createHash('sha256').update(s).digest('hex'); }
function handlerList(s){ return Array.from(s.matchAll(/(?:onclick|oninput|onkeydown)="([^"]*)"/g),function(m){ return m[1]; }); }

var topicGroups=[
  {id:'all',label:'Tüm konular',icon:'sparkles',terms:[]},
  {id:'rahmet',label:'Merhamet',icon:'heart',terms:['merhamet','rahmet','sefkat','bagislayan','rahman','rahim','rauf']},
  {id:'huzur',label:'Huzur & Korunma',icon:'lock',terms:['huzur','guven','esenlik','koruyan','gozeten','selam','mumin','muheymin','hafiz']},
  {id:'rizik',label:'Rızık & Açılım',icon:'sun',terms:['rizik','bereket','acilim','kapilari acan','veren','gani','mugni','fettah','rezzak','vehhab']},
  {id:'sabir',label:'Güç & Sabır',icon:'sprout',terms:['sabir','guc','kudret','dayan','metin','kavi','aziz','cebb']},
  {id:'tevbe',label:'Af & Arınma',icon:'droplets',terms:['bagisla','affeden','tevbe','gunah','gafur','gaffar','afuv','estagfirullah']},
  {id:'sukur',label:'Şükür & Tesbih',icon:'flower-2',terms:['sukur','ovgu','tesbih','tenzih','yucelt','subhanallah','elhamdulillah','allahu ekber']}
];
var niyet={subhanallah:'O her türlü eksikten münezzehtir.',elhamdulillah:'Hamd yalnız O\'nadır.',allahu_ekber:'O en büyüktür.',la_ilaha_illallah:'O\'ndan başka ilah yoktur.',estagfirullah:'O çok bağışlayıcıdır.'};
function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function normalize(s){ return String(s||'').toLocaleLowerCase('tr-TR').replace(/[İIı]/g,'i').replace(/[üÜ]/g,'u').replace(/[öÖ]/g,'o').replace(/[çÇ]/g,'c').replace(/[şŞ]/g,'s').replace(/[ğĞ]/g,'g').replace(/[âÂ]/g,'a').replace(/[îÎ]/g,'i').replace(/[ûÛ]/g,'u'); }

function fixture(){
  var root={startDate:'2026-08-29',days:{},zikr:{}};
  var ui={
    zikrDetailOpen:true,zikrResetPending:true,zikrResetPresetId:'subhanallah',zikrActionNote:'Geri bildirim',
    zikrNoteOpen:true,zikrNotePresetId:'subhanallah',zikrNoteDraft:{mood:'huzurlu',feelings:'İçim sakin',thoughts:'Bugünü fark ettim',intention:'Şükür'},
    zikrNoteStatus:'Kaydedildi',zikrManualOpen:true,zikrManualPresetId:'subhanallah',
    zikrManualDraft:{presetId:'subhanallah',amount:'12',note:'Tespihle'},zikrPresetFilter:'',zikrLibFilter:'all',
    zikrTopic:'all',zikrFiltersOpen:true,zikrPresetDraft:null,zikrRemovePresetId:'er_rahman',
    zikrRemoveHatimId:'hatim-fixed',zikrSettingsNote:'Ayar kaydedildi'
  };
  var icon=function(name,size,cls){ return '<svg class="seyIcon'+(cls?' '+cls:'')+'" width="'+(size||20)+'" data-icon="'+name+'"></svg>'; };
  var contentFor=function(p){ return {meaningTr:(p&&p.name||'')+' anlamı',importanceTr:'Önemi',reflectionTr:'Tefekkür',verseNoteTr:'Ayet notu',sourceLabel:'Kaynak'}; };
  var topicGroup=function(id){ for(var i=0;i<topicGroups.length;i++) if(topicGroups[i].id===id) return topicGroups[i]; return topicGroups[0]; };
  var presetSearch=function(x){ return normalize([x.name,x.phrase,x.arabic,x.ebced||x.target,contentFor(x).meaningTr,contentFor(x).importanceTr].filter(Boolean).join(' ')); };
  var topicMatch=function(x,id){ var g=topicGroup(id); if(g.id==='all') return true; for(var i=0;i<g.terms.length;i++) if(presetSearch(x).indexOf(normalize(g.terms[i]))>=0) return true; return false; };
  var presetTopicLabel=function(x){ for(var i=1;i<topicGroups.length;i++) if(topicMatch(x,topicGroups[i].id)) return topicGroups[i].label; return x.kind==='esma'?'Esmâ-i Hüsnâ':'Temel zikir'; };
  var addDays=function(date,n){ var d=new Date(date+'T12:00:00Z'); d.setUTCDate(d.getUTCDate()+n); return d.toISOString().slice(0,10); };
  var todayStr=function(){ return '2026-09-04'; };
  var sandbox={
    console:console,Date:Date,Math:Math,JSON:JSON,Object:Object,Array:Array,String:String,Number:Number,Boolean:Boolean,
    RegExp:RegExp,Error:Error,Promise:Promise,Set:Set,Map:Map,Symbol:Symbol,Intl:Intl,isNaN:isNaN,isFinite:isFinite,
    parseInt:parseInt,parseFloat:parseFloat,window:null,
    EsmaulHusnaV1:{names:[{id:'er_rahman',name:'er-Rahmân',arabic:'الرحمن',ebced:298},{id:'el_fettah',name:'el-Fettâh',arabic:'الفتاح',ebced:489}]}
  };
  sandbox.window=sandbox;
  vm.runInNewContext(source,sandbox,{filename:'app/core/zikir.js'});
  var z=sandbox.SeymaZikr;
  var deps={
    data:function(){ return root; },
    getDay:function(d,date){ return d.days[date]||(d.days[date]={}); },
    todayStr:todayStr,addDays:addDays,dayIndexFor:function(){ return 1; },save:function(){},
    ui:function(){ return ui; },icon:icon,esc:esc,dateLabelTR:function(s){ return String(s); },contentFor:contentFor,
    niyet:function(){ return niyet; },normalizeSearchText:normalize,presetSearchText:presetSearch,
    topicGroups:function(){ return topicGroups; },topicGroup:topicGroup,topicMatch:topicMatch,
    presetTopicLabel:presetTopicLabel,ringRadius:function(){ return 108; },completeFlash:function(){ return true; },
    noteDraftFor:function(p){ return ui.zikrNotePresetId===p.id&&ui.zikrNoteDraft?ui.zikrNoteDraft:{mood:'',feelings:'',thoughts:'',intention:''}; },
    manualDraftFor:function(p){ return ui.zikrManualPresetId===p.id&&ui.zikrManualDraft?ui.zikrManualDraft:{presetId:p.id,amount:'',note:''}; }
  };
  if(!z.registerZikr(deps)) throw new Error('MON-21 fixture registry register failed');
  var zz=z.ensureZikrRoot(root);
  zz.settings={soundOn:true,haptic:true,autoAdvance:true,activePresetId:'subhanallah',defaultMode:'hatim',keepAwake:true,reducedMotion:false,breathGuide:true,confirmReset:true,focusMode:false};
  zz.sessions={
    '2026-09-04':{totalCount:7,completedSets:1,perPreset:{subhanallah:{count:7,completedCycles:0,lastAt:'2026-09-04T09:00:00.000Z'}},lastAt:'2026-09-04T09:00:00.000Z'},
    '2026-09-03':{totalCount:33,completedSets:1,perPreset:{subhanallah:{count:33,completedCycles:1,lastAt:'2026-09-03T09:00:00.000Z'}},lastAt:'2026-09-03T09:00:00.000Z'}
  };
  zz.journeys={
    subhanallah:{presetId:'subhanallah',lifetimeCount:66,activeHatimId:'',lastAt:'2026-09-04T09:00:00.000Z',lastSessionId:'session-fixed',completedHatims:0,legacyCompletedHatims:0,hatims:[]},
    er_rahman:{presetId:'er_rahman',lifetimeCount:298,activeHatimId:'hatim-fixed',lastAt:'2026-09-04T09:00:00.000Z',lastSessionId:'',completedHatims:0,legacyCompletedHatims:0,hatims:[{id:'hatim-fixed',mode:'ebced_square',baseTarget:298,target:88804,count:298,startedAt:'2026-09-01T09:00:00.000Z',completedAt:null,status:'active'}]}
  };
  zz.activeSession={id:'session-fixed',presetId:'subhanallah',hatimId:'',startedAt:'2026-09-04T08:00:00.000Z',lastAt:'2026-09-04T09:00:00.000Z',count:2,pausedAt:null};
  zz.reflections=[{id:'zn_2026-09-04_subhanallah',date:'2026-09-04',presetId:'subhanallah',presetName:'Sübhanallah',mood:'huzurlu',feelings:'İçim sakin',thoughts:'Bugünü fark ettim',intention:'Şükür',wordCount:7,createdAt:'2026-09-04T09:00:00.000Z',updatedAt:'2026-09-04T09:00:00.000Z'}];
  zz.manualEntries=[{id:'manual-fixed',date:'2026-09-04',presetId:'subhanallah',amount:12,note:'Tespihle',source:'manual',createdAt:'2026-09-04T09:00:00.000Z',updatedAt:'2026-09-04T09:00:00.000Z',revertedAt:null}];
  return {z:z,root:root,ui:ui};
}

console.log('\n=== MON-21 — SeymaZikir view boundary + dump parity ===\n');
var f=fixture(),z=f.z;
var moved=['zikrPreviewCardHTML','zikrDetailControlsHTML','zikrResetConfirmHTML','zikrActionNoteHTML','zikrNoteEditorHTML','zikrManualAmountOf','zikrManualQuickChips','zikrManualPreviewHTML','zikrManualSheetHTML','zikrCounterViewHTML','zikrPresetsResultsHTML','zikrPresetsViewHTML','zikrHatimsViewHTML','zikrHistoryViewHTML','zikrSettingsViewHTML','zikrViewBodyHTML'];
ok('registry tüm motor + görünüm üyelerini açıyor',moved.every(function(name){ return typeof z[name]==='function'; }));
ok('view registry yüklemede dış yan etki açmıyor',source.indexOf('document')<0&&source.indexOf('fetch(')<0&&source.indexOf('localStorage')<0&&source.indexOf('setTimeout(')<0&&source.indexOf('setInterval(')<0&&!/^[ \t]*(?:var[ \t]+)?data[ \t]*=/m.test(source));
// MON2-06 (K8 ilkesi: pin gövdeyi izler): zikrNoteDraftFor/zikrManualDraftFor
// gövdeleri app/core/zikir.js yüzey bölümüne taşındı; draft mutation'ının
// app-owned bag (ui) üzerinden yapıldığı artık o bölümde doğrulanır.
var zikirSurfaceSource=source.slice(source.indexOf('MON2-06'));
ok('view resolverları state mutation yerine app-owned bag kullanıyor',/function zikrNoteDraftFor\(p\)\{ return viewCall\('noteDraftFor',\[p\]\); \}/.test(source)&&/function zikrManualDraftFor\(p\)\{ return viewCall\('manualDraftFor',\[p\]\); \}/.test(source)&&/function zikrNoteDraftFor\(p\)[\s\S]*ui\.zikrNotePresetId/.test(zikirSurfaceSource)&&/function zikrManualDraftFor\(p\)[\s\S]*ui\.zikrManualPresetId/.test(zikirSurfaceSource));
ok('overlay ve yerinde paint kabuğu app-owned kaldı',/function zikroverlayHTML\(/.test(appSource)&&/function zikrPaintView\(/.test(appSource));
ok('tüm view shimleri imza ve apply yüzeyini koruyor',moved.every(function(name){ return new RegExp('function '+name+'\\([^)]*\\)\\{ return window\\.SeymaZikr\\.'+name+'\\.apply\\(null,arguments\\); \\}').test(appSource); }));

var p=z.zikrActivePreset(),root=f.root.zikr;
var cases=[
  ['counter','zikrCounterViewHTML',[p,root],'59a89e2eeb90545f6b522956f1a2bfc812c12666e9f73ef7d9c69128d0a046e1',29],
  ['presets','zikrPresetsViewHTML',[p,root],'e266e3c1f083c6f7fa08d9d51c41fa6ee6c2bf261e0dab27f01b85265e9f0ec2',29],
  ['hatims','zikrHatimsViewHTML',[p,root],'92706de84244bb3c197db3218411120960c634ca424ebf8092740456d0a58cfa',4],
  ['history','zikrHistoryViewHTML',[root],'60e0b7cd7cc21a4b21e33f97899103385f23e1d21d34661254883213d03a4755',1],
  ['settings','zikrSettingsViewHTML',[root],'352e380813453ce46c20449b7a8c79749ba4900b1d3ebc1a47e1f6bf5c0742d1',7],
  ['body','zikrViewBodyHTML',['counter',p,root],'59a89e2eeb90545f6b522956f1a2bfc812c12666e9f73ef7d9c69128d0a046e1',29]
];
cases.forEach(function(c){
  var html=z[c[1]].apply(null,c[2]), handlers=handlerList(html);
  ok(c[0]+' görünüm dump SHA-256 sabit parity',sha256(html)===c[3],sha256(html));
  ok(c[0]+' inline handler sayısı korunuyor',handlers.length===c[4],String(handlers.length));
});

console.log('\n=== Özet ===');
console.log('Passed: '+passed+' / '+(passed+failed));
if(failed) process.exitCode=1;
