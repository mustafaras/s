// PANEL-007 / PANEL-05 — append-only event log ve ÆON son değişiklikler fixture.
// Yalnızca sentetik vm verisi; gerçek ağ, browser, token ve kişisel veri yok.
'use strict';
var fs=require('fs');
var path=require('path');
var vm=require('vm');
var manifestSource=fs.readFileSync(path.join(__dirname,'panelCoverageManifest.js'),'utf8');
var panelSource=fs.readFileSync(path.join(__dirname,'panel.js'),'utf8');
var passed=0,failed=0;
function ok(name,condition,detail){ if(condition){passed++;console.log('  ✓ '+name);}else{failed++;console.log('  ✗ '+name+(detail?' — '+detail:''));} }
function extractFunction(name){
  var start=panelSource.indexOf('function '+name+'('); if(start<0) throw new Error(name+' bulunamadı');
  var end=panelSource.indexOf('\nfunction ',start+10);
  return panelSource.slice(start,end<0?panelSource.length:end);
}
function esc(v){ return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function event(seq,id,device,when,summary){
  return {eventId:id||device+'-'+seq,correlationId:id||device+'-'+seq,sequence:seq,occurredAt:when,persistedAt:when,submittedAt:'2026-08-02T12:01:00.000Z',acceptedAt:'2026-08-02T12:02:00.000Z',section:'therapy',path:'data.days.*.reflection',operation:'record',summary:summary||'Yansıtma/pratik kaydı güncellendi',source:'app',sourceDeviceId:device,privacyClass:'summary',snapshotRevision:'a'.repeat(40)};
}

var manifestContext={window:{},Date:Date,JSON:JSON,Array:Array,Object:Object,String:String,Number:Number,Boolean:Boolean,Math:Math,isNaN:isNaN};
vm.runInNewContext(manifestSource,manifestContext,{filename:'panelCoverageManifest.js'});
var P=manifestContext.window.PanelCoverageV1;
if(!P){console.error('PanelCoverageV1 yüklenemedi');process.exit(1);}

console.log('\n=== PANEL-007 / PANEL-05 — append-only event log fixture ===\n');
console.log('[1] Sözleşme, redaction, idempotence ve sıra alarmı');
var a=event(1,'evt-a-1','dev_a','2026-08-02T12:00:00.000Z');
var b=event(2,'evt-a-2','dev_a','2026-08-02T12:00:01.000Z','Profil RAW_RESPONSE_SENTINEL');
var duplicate=event(2,'evt-a-2','dev_a','2026-08-02T12:00:01.000Z');
var normalized=P.normalizeEvent(b,'dev_fallback');
ok('zorunlu alanlar normalize edilir',normalized&&normalized.eventId==='evt-a-2'&&normalized.sequence===2&&normalized.section==='therapy'&&normalized.path&&normalized.operation&&normalized.sourceDeviceId&&normalized.privacyClass&&normalized.snapshotRevision);
ok('profil/raw özet güvenli fallback olur',normalized.summary==='Güvenli kayıt özeti'&&!JSON.stringify(normalized).includes('PROFILE_RAW_RESPONSE_SENTINEL'));
ok('token/GPS benzeri özet güvenli fallback olur',P.normalizeEvent(Object.assign({},a,{summary:'ghp_1234567890 lat:41.0 lon:29.0'}),'dev_a').summary==='Güvenli kayıt özeti');
var merged=P.mergeEventLogs({events:[a,duplicate]},{events:[a,b]});
ok('duplicate eventId tekilleştirilir',merged.length===2&&merged.filter(function(x){return x.eventId==='evt-a-1';}).length===1);
var good=P.eventSequenceAudit([a,event(2,'evt-a-2','dev_a','2026-08-02T12:00:01.000Z')]);
ok('monotonik cihaz sequence’i PASS',good.ok&&good.issueCount===0&&good.deviceCount===1);
var bad=P.eventSequenceAudit([event(2,'evt-a-2','dev_a','2026-08-02T12:00:02.000Z'),event(1,'evt-a-1','dev_a','2026-08-02T12:00:03.000Z'),event(4,'evt-a-4','dev_a','2026-08-02T12:00:04.000Z')]);
ok('out-of-order ve gap panel alarmı üretir',!bad.ok&&bad.issues.some(function(x){return x.kind==='out_of_order';})&&bad.issues.some(function(x){return x.kind==='sequence_gap';}));

console.log('[2] Panel son 20/50/100 filtresi ve revision drawer');
var panelContext={
  window:{},PROJECTION_SECTIONS:{},EVENT_LOG_STATE:{source:'event_files',events:[a,b],audit:good,loadedAt:'2026-08-02T12:03:00.000Z'},
  UI:{eventLimit:20,eventSelectedId:null},Date:Date,JSON:JSON,Array:Array,Object:Object,String:String,Number:Number,Math:Math,
  icon:function(){return '';},esc:esc,tsShort:function(v){return String(v);},p3TimeP:function(v){return v?'t:'+v:'—';},
  render:function(){},eventLogSourceP:null,eventStatusP:null,eventTimeP:null,eventDetailsP:null
};
var parts=['eventLogSourceP','eventStatusP','eventTimeP','eventDetailsP','setEventLimitP','openEventDrawerP','closeEventDrawerP','eventLogCardHTMLP'].map(extractFunction).join('\n');
vm.runInNewContext(parts,panelContext,{filename:'panel-p2-event-card.js'});
var html=panelContext.eventLogCardHTMLP();
ok('event kartı render olur',html.includes('Son Değişiklikler')&&html.includes('son 20')&&html.includes('son 50')&&html.includes('son 100'));
ok('accepted durum rozeti görünür',html.includes('Uzak kabul')&&!html.includes('PROFILE_RAW_RESPONSE_SENTINEL'));
panelContext.UI.eventSelectedId='evt-a-1';
var drawerHtml=panelContext.eventLogCardHTMLP();
ok('event drawer event/correlation/path/revision gösterir',drawerHtml.includes('Event ID')&&drawerHtml.includes('Correlation ID')&&drawerHtml.includes('data.days.*.reflection')&&drawerHtml.includes('Snapshot revision')&&drawerHtml.includes('a'.repeat(40)));
ok('panel ham payload iddiası taşımaz',drawerHtml.includes('Ham payload drawer’a taşınmaz')&&drawerHtml.includes('token, GPS, profil cevabı ve base64 medya yoktur'));
var many=[]; for(var mi=1;mi<=105;mi++) many.push(event(mi,'evt-many-'+mi,'dev_many','2026-08-02T13:'+String(Math.floor(mi/60)).padStart(2,'0')+':'+String(mi%60).padStart(2,'0')+'.000Z'));
panelContext.EVENT_LOG_STATE={source:'event_files',events:many,audit:P.eventSequenceAudit(many),loadedAt:'2026-08-02T15:00:00.000Z'};
[20,50,100].forEach(function(limit){ panelContext.UI.eventLimit=limit; var filtered=panelContext.eventLogCardHTMLP(); var rows=(filtered.match(/class="event-log-row"/g)||[]).length; ok('son '+limit+' filtresi '+limit+' satırı güvenle işler',rows===limit); });

console.log('\nPANEL-007 / PANEL-05 panel fixture result: '+(failed?'FAIL':'PASS')+' ('+passed+' passed, '+failed+' failed)');
if(failed) process.exitCode=1;
