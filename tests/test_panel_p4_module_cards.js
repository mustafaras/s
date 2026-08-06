// PANEL-013 / PANEL-11 — D4 eksik/özet modül kartları fixture.
// Sentetik projection; gerçek ağ, browser, token, localStorage ve kişisel veri yoktur.
'use strict';
var fs=require('fs'),path=require('path'),vm=require('vm');
var repoRoot=require('./repo-root');
var panelSource=fs.readFileSync(path.join(repoRoot,'panel.js'),'utf8');
var passed=0,failed=0;
function ok(name,condition,detail){ if(condition){passed++;console.log('  ✓ '+name);}else{failed++;console.log('  ✗ '+name+(detail?' — '+detail:''));} }
function extractFunction(name){ var start=panelSource.indexOf('function '+name+'('); if(start<0) throw new Error(name+' bulunamadı'); var end=panelSource.indexOf('\nfunction ',start+10); return panelSource.slice(start,end<0?panelSource.length:end); }
function esc(v){ return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function makeProjection(){
  return {sections:{
    therapyProvenance:{status:'ok',date:'2026-08-03',thoughtCount:2,thoughts:[{summary:'Metin redacted',createdAt:'2026-08-03T10:00:00Z'}],consent:{panelSummarySharingAccepted:true},privacy:'sensitive_redacted'},
    profileProgress:{status:'active',responseCount:4,currentItemIndex:12,startedAt:'2026-08-01T10:00:00Z',completedAt:null,consent:{panelSummarySharingAccepted:false},privacy:'sensitive_redacted'},
    notificationTimeline:{status:'ok',count:3,counts:{created:3,delivered:2,read:1,error:1},events:[{createdAt:'2026-08-03T09:00:00Z',deliveredAt:'2026-08-03T09:01:00Z'}],sourcePath:'data.notifications',privacy:'metadata_only'},
    dailyPhoto:{status:'ready',ready:true,title:'Güvenli fotoğraf',license:'CC BY',source:'Wikimedia Commons',fetchedAt:'2026-08-03T08:00:00Z',cacheState:'fresh',sourcePath:'data.dailyPhoto',privacy:'public_metadata'},
    saygiRoot:{status:'ok',collectionCount:12,rootStreak:3,dailyEvidenceCount:3,dailyDerivedStreak:3,rootLastReadDate:'2026-08-03',dailyLatestReadDate:'2026-08-03',sourcePath:'data.saygi + data.days.*.saygi',privacy:'public_metadata'},
    locNudge:{status:'ok',shownCount:3,dismissCount:1,lastShownAt:'2026-08-03T07:00:00Z',snoozeUntil:null,sourcePath:'data.locNudge',privacy:'behavior_summary'},
    locationTiming:{status:'ok',sampleTs:'2026-08-03T07:01:00Z',processedTs:'2026-08-03T07:02:00Z',syncAcceptedAt:'2026-08-03T07:03:00Z',privacy:'timestamp_only'},
    archives:{library:{books:[{id:'b1'}]},watchlist:{items:[{id:'w1'}]},music:{items:[{id:'m1'}]}}
  }};
}
function makeData(){ return {quranJourney:{requests:{baqara:{status:'ready',videoId:'abcdefghijk',notes:[{kind:'reflection'}],updatedAt:'2026-08-03T06:00:00Z'}}},soulArchive:{items:[{type:'pilates',totalSessions:4,totalMinutes:120,lastAt:'2026-08-02T12:00:00Z'}]},profileAssessment:{responses:{raw_01:'PROFILE_RAW_RESPONSE_SENTINEL'}}}; }
var doc={activeElement:null,getElementById:function(){return null;},querySelector:function(){return null;}};
var context={window:{},UI:{d4SelectedModule:null},D:makeData(),PROJECTION:{sections:makeProjection().sections},D4_DRAWER_RETURN_ID:null,EVENT_DRAWER_RETURN_ID:null,Q_ERRORS:[],document:doc,Date:Date,Math:Math,Array:Array,Object:Object,String:String,Number:Number,isNaN:isNaN,JSON:JSON,esc:esc,icon:function(){return '';},p3TimeP:function(v){return v?'t:'+v:'—';},render:function(){},setTimeout:function(){},quranJourneyRootP:function(){return context.D&&context.D.quranJourney||null;},quranDeliveryErrorsP:function(){return context.Q_ERRORS;}};
var names=['d4SafeTimeP','d4LatestTimeP','d4CoverageBadgeP','therapyRecencyTextP','d4ModuleDescriptorsP','d4ModuleDrawerHTMLP','d4ModuleAtlasHTMLP','eventDrawerFocusableP','eventDrawerKeydownP','openD4ModuleDrawerP','closeD4ModuleDrawerP','p3BadgeP','statusToneP','panelToneOverrideP','panelStatusP','panelStatusBadgeHTMLP','p3StatusP'];
vm.runInNewContext(names.map(extractFunction).join('\n'),context,{filename:'panel-p4-module-cards.js'});

console.log('\n=== PANEL-013 / PANEL-11 — D4 module cards fixture ===\n');
var before=JSON.stringify({D:context.D,sections:context.PROJECTION.sections}), modules=context.d4ModuleDescriptorsP();
ok('yedi hedef modül tek descriptor sözleşmesinde',modules.length===7&&['therapy-profile','notification-delivery','quran-delivery','saygi-evidence','daily-photo','location-audit','archives-provenance'].every(function(k){return modules.some(function(m){return m.key===k;});}));
ok('descriptor üretimi source data’yı mutate etmez',JSON.stringify({D:context.D,sections:context.PROJECTION.sections})===before);
var full=context.d4ModuleAtlasHTMLP(), cardTitles=['Terapi + Profil','Bildirim Teslimatı','Kur’an Teslimatı','Saygı Kanıtı','Günün Fotoğrafı','Konum Audit','Zihin-Beden + Arşiv'];
ok('dolu fixture tüm kartları ve canonical metric’i render eder',cardTitles.every(function(x){return full.includes(x);})&&full.includes('Canonical metric'),cardTitles.filter(function(x){return !full.includes(x);}).join(', '));
ok('dolu fixture source/time/status/privacy/coverage taşır',full.includes('source-badge')&&full.includes('privacy-badge')&&full.includes('status-badge')&&full.includes('data-coverage="full"')&&full.includes('data-coverage="redacted"'));
ok('cross-check kopya metriği görünür',full.includes('Cross-check')&&full.includes('Root collection')&&full.includes('İletildi/okundu/error'));
ok('redacted fixture ham profil/terapi metni sızdırmaz',!full.includes('PROFILE_RAW_RESPONSE_SENTINEL')&&!full.includes('raw_01')&&full.includes('sensitive_redacted'));
context.UI.d4SelectedModule='therapy-profile';
var drawer=context.d4ModuleAtlasHTMLP();
ok('ortak D4 drawer modal ARIA ile açılır',drawer.includes('id="d4-module-drawer"')&&drawer.includes('role="dialog"')&&drawer.includes('aria-modal="true"')&&drawer.includes('aria-labelledby="d4-drawer-title"')&&drawer.includes('Event ayrıntısı')===false);
ok('D4 drawer canonical/cross-check/source time gösterir',drawer.includes('Canonical metric')&&drawer.includes('Cross-check')&&drawer.includes('Kaynak zamanı')&&drawer.includes('Terapi + Profil'));
ok('D4 yüzeyi latest full-replace/write kanalı açmaz',!panelSource.slice(panelSource.indexOf('function d4ModuleDescriptorsP'),panelSource.indexOf('function eventLogSourceP')).includes('data/latest.json')&&!panelSource.slice(panelSource.indexOf('function d4ModuleDescriptorsP'),panelSource.indexOf('function eventLogSourceP')).includes('SeySync.schedule'));

var old=makeProjection(); old.sections.dailyPhoto.status='stale'; old.sections.dailyPhoto.ready=false; old.sections.dailyPhoto.cacheState='stale'; old.sections.notificationTimeline.status='stale'; context.PROJECTION.sections=old.sections; context.UI.d4SelectedModule=null;
var oldHtml=context.d4ModuleAtlasHTMLP();
ok('eski fixture ayrı status ve cache mesajı taşır',oldHtml.includes('Eski cache')&&oldHtml.includes('stale')&&oldHtml.includes('Özet'));

context.PROJECTION.sections={therapyProvenance:{status:'missing',thoughtCount:0,consent:{}},profileProgress:{status:'missing',responseCount:0,consent:{}},notificationTimeline:{status:'missing',count:0,counts:{},events:[]},dailyPhoto:{status:'missing'},saygiRoot:{status:'missing'},locNudge:{status:'missing'},locationTiming:{status:'missing'},archives:{}}; context.D={};
var missingHtml=context.d4ModuleAtlasHTMLP();
ok('eksik fixture nedenli boş durumları görünür kılar',(missingHtml.match(/data-coverage="missing"/g)||[]).length===7&&missingHtml.includes('Eksik modüller')===false&&missingHtml.includes('Ayrıntıyı aç'));

var broken=makeProjection(); broken.sections.therapyProvenance.status='malformed'; broken.sections.profileProgress.status='malformed'; broken.sections.notificationTimeline.status='malformed'; broken.sections.dailyPhoto.status='error'; broken.sections.saygiRoot.status='mismatch'; broken.sections.locNudge.status='malformed'; broken.sections.locationTiming.status='malformed'; context.PROJECTION.sections=broken.sections; context.D={quranJourney:{requests:{x:{status:'waiting',updatedAt:'2026-08-03T01:00:00Z'}}},soulArchive:{items:[]}}; context.Q_ERRORS=[{surahId:'x',error:'safe_error'}];
var brokenHtml=context.d4ModuleAtlasHTMLP();
ok('bozuk fixture fail-closed status metinleri üretir',brokenHtml.includes('Bozuk')&&brokenHtml.includes('Hata')&&brokenHtml.includes('Uyuşmazlık')&&!brokenHtml.includes('safe_error'));

var focusFirst={disabled:false,getAttribute:function(){return null;},focus:function(){doc.activeElement=focusFirst;}};
var focusLast={disabled:false,getAttribute:function(){return null;},focus:function(){doc.activeElement=focusLast;}};
var drawerRoot={querySelectorAll:function(){return [focusFirst,focusLast];}};
doc.getElementById=function(id){return id==='d4-module-drawer'?drawerRoot:null;};
context.UI.d4SelectedModule='daily-photo'; doc.activeElement=focusFirst;
var key={key:'Tab',shiftKey:true,preventDefault:function(){key.prevented=true;}}; context.eventDrawerKeydownP(key);
ok('D4 drawer focus trap ortak handler ile çalışır',key.prevented===true&&doc.activeElement===focusLast);

console.log('\nPANEL-013 / PANEL-11 fixture result: '+(failed?'FAIL':'PASS')+' ('+passed+' passed, '+failed+' failed)');
if(failed) process.exitCode=1;
