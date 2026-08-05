'use strict';

var fs=require('fs'),path=require('path'),vm=require('vm');
var repoRoot=require('./repo-root');
var panelSource=fs.readFileSync(path.join(repoRoot,'panel.js'),'utf8');
var passed=0,failed=0;
function ok(name,condition,detail){ if(condition){passed++;console.log('  ✓ '+name);}else{failed++;console.log('  ✗ '+name+(detail?' — '+detail:''));} }
function extractFunction(name){ var start=panelSource.indexOf('function '+name+'('); if(start<0) return ''; var end=panelSource.indexOf('\nfunction ',start+10); return panelSource.slice(start,end<0?panelSource.length:end); }
function esc(v){ return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function event(overrides){
  var base={eventId:'evt-1',correlationId:'evt-1',sequence:1,occurredAt:'2026-08-05T10:00:00.000Z',persistedAt:'2026-08-05T10:00:01.000Z',submittedAt:'2026-08-05T10:00:02.000Z',acceptedAt:'2026-08-05T10:00:03.000Z',section:'mood',path:'data.days.*.mood',operation:'update',summary:'Güvenli kayıt özeti',source:'app',sourceDeviceId:'phone',privacyClass:'summary',snapshotRevision:'a'.repeat(40)};
  Object.keys(overrides||{}).forEach(function(k){base[k]=overrides[k];});
  return base;
}
function contextFor(extra){
  var renderCalls=0,card={scrollTop:13,innerHTML:'',querySelector:function(){return {focus:function(){card.focused=true;}};}};
  var ctx={
    window:{},
    UI:{eventLimit:5,eventExpanded:false,eventSelectedId:null,eventSelectedGroupKey:null,eventFilter:'all',eventDrawerLevel:1},
    EVENT_LOG_STATE:{source:'event_files',events:[],audit:{ok:true,issueCount:0,issues:[]},loadedAt:'2026-08-05T10:00:00.000Z'},
    Date:Date,JSON:JSON,Array:Array,Object:Object,String:String,Number:Number,Math:Math,isFinite:isFinite,
    document:{getElementById:function(id){return id==='event-log-card'?card:null;}},
    render:function(){renderCalls++;},esc:esc,icon:function(){return '';},tsShort:function(v){return String(v);},p3TimeP:function(v){return v?'t:'+v:'—';},
    setTimeout:function(){},requestAnimationFrame:null
  };
  Object.keys(extra||{}).forEach(function(k){ctx[k]=extra[k];});
  ctx.__renderCalls=function(){return renderCalls;};
  ctx.__card=card;
  return ctx;
}
function load(names,ctx){
  vm.runInNewContext(names.map(function(name){return extractFunction(name)||'function '+name+'(){ return null; }';}).join('\n'),ctx,{filename:'panel-event-focus.js'});
}

console.log('\n=== PANEL event focus fixture ===\n');
var descriptorCtx=contextFor();
load(['eventStatusP','eventSourceKindForP','eventClassificationP','eventPathLabelP','eventOperationLabelP','eventChangeDescriptorP','eventMatchesFilterP'],descriptorCtx);
var mood=event({eventId:'mood-1',section:'mood',path:'data.days.*.mood',operation:'update',detail:'Ruh hali',value:'Normal'});
var therapy=event({eventId:'therapy-1',section:'therapy',path:'data.days.*.therapy.thoughts',operation:'record'});
var notice=event({eventId:'notice-1',section:'notifications',path:'data.notifications',operation:'accepted',source:'delivery'});
var sync=event({eventId:'sync-1',section:'sync',path:'data.syncReceipt',operation:'merge',source:'observer'});
var external=event({eventId:'external-1',section:'system',path:'weather.fetch',operation:'update',source:'external'});
var moodChange=descriptorCtx.eventChangeDescriptorP(mood)||{};
ok('günlük kaydının neresi ve işlemi anlaşılır',moodChange.title==='Ruh hali: Normal güncellendi'&&moodChange.pathLabel==='Günlük / Ruh hali');
ok('terapi kaydı terapi/profil sınıfına girer',descriptorCtx.eventClassificationP(therapy)&&descriptorCtx.eventClassificationP(therapy).key==='therapy-profile'&&descriptorCtx.eventMatchesFilterP(therapy,'therapy-profile'));
ok('bildirim teslimatı iletişim sınıfına girer',descriptorCtx.eventClassificationP(notice)&&descriptorCtx.eventClassificationP(notice).key==='communication'&&descriptorCtx.eventMatchesFilterP(notice,'communication'));
ok('senkron zinciri ayrı sınıfa girer',descriptorCtx.eventClassificationP(sync)&&descriptorCtx.eventClassificationP(sync).key==='sync'&&descriptorCtx.eventMatchesFilterP(sync,'sync'));
ok('dış kaynak ayrı sınıfa girer',descriptorCtx.eventClassificationP(external)&&descriptorCtx.eventClassificationP(external).key==='external'&&descriptorCtx.eventMatchesFilterP(external,'external'));
ok('yanlış sekme event’i kabul etmez',!descriptorCtx.eventMatchesFilterP(therapy,'communication')&&!descriptorCtx.eventMatchesFilterP(external,'user'));

var events=[];
for(var i=0;i<12;i++) events.push(event({eventId:'evt-'+i,correlationId:'evt-'+i,sequence:i+1,path:i%2?'data.days.*.journal':'data.days.*.mood',section:i%2?'wellness':'mood',operation:i%3?'update':'record',detail:i%2?'Günlük notu':'Ruh hali',value:i%2?'Kısa not':'Normal'}));
var cardCtx=contextFor();
cardCtx.EVENT_LOG_STATE.events=events;
load(['eventStatusP','eventSourceKindForP','eventCategoryDefsP','eventClassificationP','eventPathLabelP','eventOperationLabelP','eventChangeDescriptorP','eventMatchesFilterP','eventFeatureForP','eventJsArgP','eventTimeP','safeEventSummaryP','eventLogSourceP','eventDetailsP','eventLogCardInnerHTMLP','eventLogCardHTMLP','refreshEventLogP','setEventFilterP','setEventLimitP','showMoreEventsP'],cardCtx);
var html=cardCtx.eventLogCardHTMLP();
ok('Tümü görünümünde varsayılan son 5 değişiklik görünür',(html.match(/class="event-log-row"/g)||[]).length===5);
ok('kart daha fazla göster seçeneği sunar',html.includes('Daha fazla göster')&&html.includes('data-event-action="load-more"'));
ok('sekme isimleri karar alanı olarak anlaşılır',html.includes('Kullanıcı kayıtları')&&html.includes('Senkronizasyon')&&html.includes('Terapi &amp; profil')&&html.includes('İletişim &amp; bildirim')&&html.includes('Kur’an &amp; içerik')&&html.includes('Otomatik özet')&&html.includes('Dış kaynak'));
ok('satır gerçek değişiklik açıklamasını ve alanı gösterir',html.includes('Ruh hali: Normal güncellendi')&&html.includes('Kullanıcı kayıtları'));

cardCtx.setEventFilterP('therapy-profile');
ok('filtre değişimi tam panel render etmez',cardCtx.__renderCalls()===0&&cardCtx.__card.innerHTML.includes('event-log'));
var beforeMore=cardCtx.UI.eventLimit;
cardCtx.showMoreEventsP();
ok('daha fazla göster beşer kayıt açar',cardCtx.UI.eventLimit===beforeMore+5&&cardCtx.__renderCalls()===0);

console.log('\nPANEL event focus fixture result: '+(failed?'FAIL':'PASS')+' ('+passed+' passed, '+failed+' failed)');
if(failed) process.exitCode=1;
