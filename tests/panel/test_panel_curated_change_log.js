// D1.2 (legacy Panel 1 çalışma özeti) — curatedChangeLogCardHTMLP fixture.
// Yalnızca sentetik vm verisi; gerçek ağ, browser, token ve kişisel veri yok.
'use strict';
var fs=require('fs');
var path=require('path');
var vm=require('vm');
var repoRoot=require('../repo-root');
var panelSource=fs.readFileSync(path.join(repoRoot,'panel.js'),'utf8');
var passed=0,failed=0;
function ok(name,condition,detail){ if(condition){passed++;console.log('  ✓ '+name);}else{failed++;console.log('  ✗ '+name+(detail?' — '+detail:''));} }
function extractFunction(name){
  var start=panelSource.indexOf('function '+name+'('); if(start<0) throw new Error(name+' bulunamadı');
  var end=panelSource.indexOf('\nfunction ',start+10);
  return panelSource.slice(start,end<0?panelSource.length:end);
}
function esc(v){ return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function event(seq,id,device,when,section,summary,extra){
  return Object.assign({eventId:id,correlationId:id,sequence:seq,occurredAt:when,section:section,path:'data.days.*.'+section,operation:'record',summary:summary||'Kayıt güncellendi',source:'app',sourceDeviceId:device,privacyClass:'summary',snapshotRevision:'a'.repeat(40),acceptedAt:when},extra||{});
}

console.log('\n=== D1.2 — curatedChangeLogCardHTMLP fixture ===\n');

var FN_NAMES=['panelToneOverrideP','statusToneP','panelStatusBadgeHTMLP','panelStatusP','panelLegacyBadgeHTMLP',
  'eventLogSourceP','eventStatusP','eventCategoryDefsP','eventPathLabelP','eventOperationLabelP','eventChangeDescriptorP',
  'eventClassificationP','eventTimeP','safeEventSummaryP','eventSourceKindForP','eventMatchesFilterP','eventFeatureForP',
  'isReminderEventP','reminderEventActionP','reminderEventLabelP','eventDateStateP',
  'eventLogCardInnerHTMLP','eventLogCardHTMLP','curatedChangeLogGroupsP','curatedChangeLogCardInnerHTMLP','curatedChangeLogCardHTMLP','toggleCuratedLogShowAllP'];

function buildContext(events){
  var domCards={};
  var fakeDoc={ getElementById:function(id){ return domCards[id]||null; } };
  var context={
    window:{},UI:{eventFilter:'all',eventLimit:5,curatedLogShowAll:false},
    EVENT_LOG_STATE:{source:'event_files',events:events||[],audit:{ok:true,issueCount:0,issues:[]},loadedAt:'2026-08-06T12:00:00.000Z'},
    document:fakeDoc,render:function(){},
    Date:Date,JSON:JSON,Array:Array,Object:Object,String:String,Number:Number,Math:Math,isNaN:isNaN,
    icon:function(){return '';},esc:esc,tsShort:function(v){return String(v);},p3TimeP:function(v){return v?'t:'+v:'—';}
  };
  vm.runInNewContext(FN_NAMES.map(extractFunction).join('\n'),context,{filename:'panel-d1-2-curated-log.js'});
  return context;
}

console.log('[1] "Kullanıcı kayıtları" (user) kategorisi varsayılan görünümde yok');
var events1=[
  event(1,'evt-user-1','dev_a','2026-08-06T10:00:00.000Z','mood','Ruh hali kaydedildi'),
  event(2,'evt-sos-1','dev_a','2026-08-06T09:00:00.000Z','cravingSOSCount','SOS kullanıldı')
];
var ctx1=buildContext(events1);
var html1=ctx1.curatedChangeLogCardHTMLP();
ok('user kategorisi (mood) görünmüyor',!html1.includes('Ruh hali'));
ok('sync/diğer kategori görünüyor',html1.includes('data-category="sync"')||html1.includes('data-category="user"')===false);

console.log('[2] SOS/terapi/senkron gibi kategoriler görünür');
var events2=[
  event(1,'evt-therapy-1','dev_a','2026-08-06T11:00:00.000Z','therapy','Terapi kaydı güncellendi'),
  event(2,'evt-sync-1','dev_a','2026-08-06T10:30:00.000Z','sync','Senkron kabul edildi',{acceptedAt:'2026-08-06T10:30:05.000Z'})
];
var ctx2=buildContext(events2);
var html2=ctx2.curatedChangeLogCardHTMLP();
ok('terapi kategorisi görünüyor',html2.includes('data-category="therapy-profile"'));
ok('senkron kategorisi görünüyor',html2.includes('data-category="sync"'));

console.log('[3] 10 madde sınırı uygulanıyor');
var many=[]; for(var i=1;i<=15;i++) many.push(event(i,'evt-therapy-'+i,'dev_a','2026-08-06T'+String(10+Math.floor(i/2)).padStart(2,'0')+':00:00.000Z','therapy','Terapi kaydı '+i));
var ctx3=buildContext(many);
var html3=ctx3.curatedChangeLogCardHTMLP();
var rowCount=(html3.match(/class="event-log-row"/g)||[]).length;
ok('en fazla 10 satır render edilir',rowCount<=10,'bulunan: '+rowCount);

console.log('[4] Boş durum — süzülmüş liste boşsa sakin mesaj');
var onlyUser=[event(1,'evt-user-only','dev_a','2026-08-06T09:00:00.000Z','mood','Ruh hali kaydedildi')];
var ctx4=buildContext(onlyUser);
var html4=ctx4.curatedChangeLogCardHTMLP();
ok('boş durumda sakin mesaj görünür',html4.includes('Rutin dışı bir değişiklik yok'));

console.log('[5] "Tüm kayıtları göster" toggle — ham liste açılır');
var ctx5=buildContext(events2);
var htmlBefore=ctx5.curatedChangeLogCardInnerHTMLP();
ok('varsayılan kapalı — ham liste HTML\'i yok',!htmlBefore.includes('curated-log-full'));
ctx5.UI.curatedLogShowAll=true;
var htmlAfter=ctx5.curatedChangeLogCardInnerHTMLP();
ok('açılınca ham event log gömülü render edilir',htmlAfter.includes('curated-log-full')&&htmlAfter.includes('Son Değişiklikler'));

console.log('\nD1.2 curated-change-log fixture result: '+(failed?'FAIL':'PASS')+' ('+passed+' passed, '+failed+' failed)');
if(failed) process.exitCode=1;
