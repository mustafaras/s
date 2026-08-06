// PANEL-015 / PANEL-13 — D6 QA, release ve kullanıcı onayı kapısı.
// Sentetik release gate; gerçek ağ, browser, localStorage ve kişisel veri yoktur.
'use strict';
var fs=require('fs'),path=require('path'),vm=require('vm');
var root=require('./repo-root');
var panelSource=fs.readFileSync(path.join(root,'panel.js'),'utf8');
var cssSource=fs.readFileSync(path.join(root,'panel.css'),'utf8');
var htmlSource=fs.readFileSync(path.join(root,'panel.html'),'utf8');
var syncSource=fs.readFileSync(path.join(root,'sync.js'),'utf8');
var manifestSource=fs.readFileSync(path.join(root,'panelCoverageManifest.js'),'utf8');
var passed=0,failed=0;
function ok(name,condition,detail){ if(condition){passed++;console.log('  ✓ '+name);}else{failed++;console.log('  ✗ '+name+(detail?' — '+detail:''));} }
function extractFunction(name){ var start=panelSource.indexOf('function '+name+'('); if(start<0) throw new Error(name+' bulunamadı'); var end=panelSource.indexOf('\nfunction ',start+10); return panelSource.slice(start,end<0?panelSource.length:end); }
function esc(v){ return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function braceBalance(source){
  var clean=String(source||'').replace(/\/\*[\s\S]*?\*\//g,'').replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g,'');
  var depth=0;
  for(var i=0;i<clean.length;i++){ if(clean[i]==='{') depth++; if(clean[i]==='}') depth--; if(depth<0) return false; }
  return depth===0;
}
function makeProjectionData(){
  return {version:2,days:{},settings:{ghToken:'QA_SECRET_TOKEN',openaiKey:'QA_OPENAI_SECRET',syncUrl:'https://private.invalid/sync',auth:{session:'QA_AUTH_SECRET'}},profileAssessment:{responses:{item_1:'QA_RAW_PROFILE'},panelSummary:{shortReport:'Güvenli özet'}},location:{lat:41.01,lon:28.97},locationHistory:[{lat:41.01,lon:28.97}],days:{'2026-08-03':{note:'QA safe note',media:{data:'QA_BASE64_MEDIA'},movement:{track:[{lat:41.01,lon:28.97}]}}},quranJourney:{status:'ready'},saygi:{streak:3},notifications:[]};
}
function makeEvent(i){
  var n=String(i+1).padStart(4,'0');
  return {eventId:'qa-event-'+n,correlationId:'qa-correlation-'+n,sequence:i+1,occurredAt:'2026-08-03T10:00:00.000Z',persistedAt:'2026-08-03T10:00:00.000Z',submittedAt:'2026-08-03T10:00:01.000Z',acceptedAt:'2026-08-03T10:00:02.000Z',section:i%4===0?'therapy':i%4===1?'quran':i%4===2?'notifications':'mood',path:'data.qa.*',operation:'record',summary:'Güvenli kayıt özeti',source:i%3===0?'app':i%3===1?'derived':'external',sourceDeviceId:'qa-device',privacyClass:'summary',snapshotRevision:'a'.repeat(40)};
}

console.log('\n=== PANEL-015 / PANEL-13 — D6 QA + release gate fixture ===\n');

console.log('[1] Kod ve sözleşme gate’leri');
ok('CSS brace balance temiz',braceBalance(cssSource));
ok('panel inline script/script-tag balance temiz',(htmlSource.match(/<script\b/g)||[]).length===(htmlSource.match(/<\/script>/g)||[]).length);
ok('D5 cache sürümü release surface’te',htmlSource.includes('panel.css?v=20260805b')&&htmlSource.includes('panel.js?v=20260806n'));
ok('coverage manifest validator export ve schema v1 mevcut',manifestSource.includes('PanelCoverageV1')&&manifestSource.includes('schemaVersion:1'));
ok('sync retry 409/422 bounded ve anti-clobber guard mevcut',/r\.status===409\|\|r\.status===422/.test(syncSource)&&/attempt<3/.test(syncSource)&&syncSource.includes('anti_clobber'));
ok('offline/reconnect ve localhost push guard mevcut',syncSource.includes("retryIfPending:function")&&syncSource.includes("addEventListener('online'")&&syncSource.includes('devOrigin'));

console.log('[2] Coverage, projection redaction ve secret scanner');
var manifestContext={window:{},Date:Date,JSON:JSON,Array:Array,Object:Object,String:String,Number:Number,Boolean:Boolean,Math:Math,isNaN:isNaN};
vm.runInNewContext(manifestSource,manifestContext,{filename:'panelCoverageManifest.js'});
var P=manifestContext.window.PanelCoverageV1, data=makeProjectionData(), receipt={schemaVersion:1,status:'accepted',snapshotRevision:'b'.repeat(40),sourceUpdatedAt:'2026-08-03T10:00:00.000Z',submittedAt:'2026-08-03T10:00:01.000Z',acceptedAt:'2026-08-03T10:00:02.000Z',sourceLatestSha:'c'.repeat(40),lastErrorCode:null};
ok('manifest validator sentetik fixture’ı unmapped bırakmıyor',!!P&&P.coverageForData(data).unmappedPaths.length===0);
var snapshot=P&&P.buildObserverSnapshot(data,receipt,'2026-08-03T10:00:03.000Z'), snapshotJson=JSON.stringify(snapshot||{});
ok('projection secret/raw/GPS/media scanner temiz',!snapshotJson.includes('QA_SECRET_TOKEN')&&!snapshotJson.includes('QA_OPENAI_SECRET')&&!snapshotJson.includes('QA_AUTH_SECRET')&&!snapshotJson.includes('QA_RAW_PROFILE')&&!snapshotJson.includes('QA_BASE64_MEDIA')&&!snapshotJson.includes('41.01')&&!snapshotJson.includes('28.97'));
ok('projection receipt revision/SHA kanıtı korunuyor',snapshot&&snapshot.snapshotRevision===receipt.snapshotRevision&&snapshot.sourceLatestSha===receipt.sourceLatestSha);
ok('empty/full/stale/error/redacted projection sözleşmeleri mevcut',panelSource.includes('projection_missing')&&panelSource.includes('projection_stale')&&panelSource.includes('projection_load_failed')&&panelSource.includes('sensitive_redacted'));

console.log('[3] 1000 event timeline ve redacted rendering');
var events=[]; for(var i=0;i<1000;i++) events.push(makeEvent(i));
var doc={activeElement:null,getElementById:function(){return null;},querySelector:function(){return null;}};
var ctx={window:{},UI:{eventLimit:1000,eventFilter:'all',d4SelectedModule:null},EVENT_LOG_STATE:{source:'event_files',events:events,audit:{ok:true,issueCount:0,issues:[]},loadedAt:'2026-08-03T11:00:00.000Z'},Date:Date,JSON:JSON,Array:Array,Object:Object,String:String,Number:Number,Math:Math,isNaN:isNaN,esc:esc,icon:function(){return '<svg aria-hidden="true"></svg>';},p3TimeP:function(v){return v?'t:'+v:'—';},tsShort:function(v){return String(v);},render:function(){},setTimeout:function(fn){fn();},document:doc};
var names=['eventStatusP','eventTimeP','safeEventSummaryP','eventSourceKindForP','eventCategoryDefsP','eventClassificationP','eventPathLabelP','eventOperationLabelP','eventChangeDescriptorP','eventMatchesFilterP','eventFeatureForP','eventJsArgP','eventDrawerFocusableP','eventDrawerKeydownP','eventLogSourceP','statusToneP','panelStatusBadgeHTMLP','panelLegacyBadgeHTMLP','eventLogCardInnerHTMLP','eventLogCardHTMLP'];
vm.runInNewContext(names.map(extractFunction).join('\n'),ctx,{filename:'panel-p6-1000-event.js'});
var started=Date.now(),timeline=ctx.eventLogCardHTMLP(),elapsed=Date.now()-started;
ok('1000 event timeline tam kapasite render edilir',(timeline.match(/class="event-log-row"/g)||[]).length===1000);
ok('1000 event render güvenli özet ve süre sınırında',!timeline.includes('QA_SECRET_TOKEN')&&!timeline.includes('QA_RAW_PROFILE')&&elapsed<5000,'elapsed '+elapsed+'ms');

console.log('[4] Responsive/motion/privacy regression bağlantıları');
ok('D5 six viewport fixture gate bağlı',fs.existsSync(path.join(__dirname,'test_panel_p5_responsive_a11y.js'))&&fs.readFileSync(path.join(__dirname,'test_panel_p5_responsive_a11y.js'),'utf8').includes('1440px desktop'));
ok('input-focused polling/defer contract bağlı',panelSource.includes('panelDraftActiveP')&&panelSource.includes('skipped_input')&&panelSource.includes('deferred_draft'));
ok('observer read-only boundary korunuyor',!panelSource.includes('SeySync.schedule')&&!/data\/latest\.json[\s\S]{0,240}method:["']PUT/.test(panelSource));
ok('rollback/backup SHA dokümantasyon kapısı tanımlı',fs.existsSync(path.join(root,'.github/workflows/pages.yml')));

console.log('\nPANEL-015 / PANEL-13 fixture result: '+(failed?'FAIL':'PASS')+' ('+passed+' passed, '+failed+' failed)');
if(failed) process.exitCode=1;
