// PANEL-012 / PANEL-10 — D3 timeline + drawer sentetik fixture.
// Gerçek ağ, browser, token, localStorage ve kişisel veri yoktur.
'use strict';
var fs=require('fs'),path=require('path'),vm=require('vm');
var repoRoot=require('./repo-root');
var panelSource=fs.readFileSync(path.join(repoRoot,'panel.js'),'utf8');
var htmlSource=fs.readFileSync(path.join(repoRoot,'panel.html'),'utf8');
var passed=0,failed=0;
function ok(name,condition,detail){ if(condition){passed++;console.log('  ✓ '+name);}else{failed++;console.log('  ✗ '+name+(detail?' — '+detail:''));} }
function extractFunction(name){ var start=panelSource.indexOf('function '+name+'('); if(start<0) throw new Error(name+' bulunamadı'); var end=panelSource.indexOf('\nfunction ',start+10); return panelSource.slice(start,end<0?panelSource.length:end); }
function esc(v){ return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function event(id,seq,correlation,source,section,summary){ return {eventId:id,correlationId:correlation,sequence:seq,occurredAt:'2026-08-03T10:0'+seq+':00.000Z',persistedAt:'2026-08-03T10:0'+seq+':00.000Z',submittedAt:'2026-08-03T10:0'+seq+':01.000Z',acceptedAt:seq===2?'2026-08-03T10:0'+seq+':02.000Z':null,section:section,path:'data.'+section+'.*',operation:'record',summary:summary||'Güvenli değişiklik özeti',source:source,sourceDeviceId:'dev_fixture',privacyClass:'summary',snapshotRevision:'r'.repeat(40)}; }
var e1=event('evt-chain-1',1,'corr-chain','app','therapy','Terapi kaydı oluşturuldu');
var e2=event('evt-chain-2',2,'corr-chain','app','therapy','retry merge accepted');
var e3=event('evt-external',3,'corr-external','external','quran','PROFILE_RAW_RESPONSE_SENTINEL');
var e4=event('evt-derived',4,'corr-derived','derived','continuity','Süreklilik türetildi');
var doc={activeElement:null,getElementById:function(){return null;}};
var context={window:{},UI:{eventLimit:20,eventFilter:'all',d4SelectedModule:null},EVENT_LOG_STATE:{source:'event_files',events:[e1,e2,e3,e4],audit:{ok:true,issueCount:0,issues:[]},loadedAt:'2026-08-03T11:00:00.000Z'},Date:Date,JSON:JSON,Array:Array,Object:Object,String:String,Number:Number,Math:Math,isNaN:isNaN,esc:esc,icon:function(){return '<svg aria-hidden="true"></svg>';},p3TimeP:function(v){return v?'t:'+v:'—';},tsShort:function(v){return String(v);},render:function(){},setTimeout:function(fn){fn();},document:doc};
var names=['eventStatusP','eventTimeP','safeEventSummaryP','eventSourceKindForP','eventCategoryDefsP','eventClassificationP','eventPathLabelP','eventOperationLabelP','eventChangeDescriptorP','eventMatchesFilterP','eventFeatureForP','eventJsArgP','setEventFilterP','setEventLimitP','eventLogSourceP','statusToneP','panelStatusBadgeHTMLP','panelLegacyBadgeHTMLP','eventLogCardInnerHTMLP','eventLogCardHTMLP'];
vm.runInNewContext(names.map(extractFunction).join('\n'),context,{filename:'panel-p3-timeline-drawer.js'});

console.log('\n=== PANEL-012 / PANEL-10 — timeline fixture ===\n');
var html=context.eventLogCardHTMLP();
ok('dokuz timeline filtresi semantik olarak görünür', ['all','attention','sync','therapy-profile','quran-video','communication','user','derived','external'].every(function(k){return html.includes('data-filter="'+k+'"')&&html.includes('aria-pressed=');}));
ok('retry/merge/accepted zinciri tek satır grubudur',(html.match(/class="event-log-row"/g)||[]).length===3&&html.includes('zincir · 2'));
ok('satır source/status/revision/feature metadata taşır',html.includes('data-source=')&&html.includes('status-badge')&&html.includes('event-log-revision')&&html.includes('timeline-feature-icon'));
ok('hassas event özeti redacted kalır',!html.includes('PROFILE_RAW_RESPONSE_SENTINEL')&&html.includes('Güvenli kayıt özeti'));
ok('event satırları tıklanabilir drawer tetiklemez (ölü kod temizlendi)',!html.includes('onclick="openEventDrawerP')&&!html.includes('event-drawer-panel'));
context.UI.eventFilter='external';
var external=context.eventLogCardHTMLP();
ok('external filtresi yalnız dış kaynağı gösterir',external.includes('evt-external')&&!external.includes('evt-chain-1')&&!external.includes('evt-derived'));
ok('cache-bust güncel panel sürümünde',htmlSource.includes('panel.css?v=20260809c')&&htmlSource.includes('panel.js?v=20260811a'));

console.log('\nPANEL-012 / PANEL-10 fixture result: '+(failed?'FAIL':'PASS')+' ('+passed+' passed, '+failed+' failed)');
if(failed) process.exitCode=1;
