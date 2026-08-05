// PANEL-012 / PANEL-10 — D3 timeline + drawer sentetik fixture.
// Gerçek ağ, browser, token, localStorage ve kişisel veri yoktur.
'use strict';
var fs=require('fs'),path=require('path'),vm=require('vm');
var repoRoot=require('./repo-root');
var panelSource=fs.readFileSync(path.join(repoRoot,'panel.js'),'utf8');
var cssSource=fs.readFileSync(path.join(repoRoot,'panel.css'),'utf8');
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
var focusFirst={disabled:false,getAttribute:function(){return null;},focus:function(){doc.activeElement=focusFirst;}};
var focusLast={disabled:false,getAttribute:function(){return null;},focus:function(){doc.activeElement=focusLast;}};
var drawerRoot={querySelectorAll:function(){return [focusFirst,focusLast];},focus:function(){doc.activeElement=drawerRoot;}};
var trigger={id:'event-row-evt-chain-2',focus:function(){doc.activeElement=trigger;}};
var doc={activeElement:focusLast,getElementById:function(id){ if(id==='event-drawer-panel') return drawerRoot; if(id==='event-row-evt-chain-2') return trigger; return null; }};
var context={window:{},UI:{eventLimit:20,eventSelectedId:null,eventSelectedGroupKey:null,eventFilter:'all',eventDrawerLevel:1},EVENT_DRAWER_RETURN_ID:null,EVENT_LOG_STATE:{source:'event_files',events:[e1,e2,e3,e4],audit:{ok:true,issueCount:0,issues:[]},loadedAt:'2026-08-03T11:00:00.000Z'},Date:Date,JSON:JSON,Array:Array,Object:Object,String:String,Number:Number,Math:Math,isNaN:isNaN,esc:esc,icon:function(){return '<svg aria-hidden="true"></svg>';},p3TimeP:function(v){return v?'t:'+v:'—';},tsShort:function(v){return String(v);},render:function(){},setTimeout:function(fn){fn();},document:doc};
var names=['eventStatusP','eventTimeP','safeEventSummaryP','eventSourceKindForP','eventCategoryDefsP','eventClassificationP','eventPathLabelP','eventOperationLabelP','eventChangeDescriptorP','eventMatchesFilterP','eventFeatureForP','eventJsArgP','eventDrawerFocusableP','eventDrawerKeydownP','setEventFilterP','setEventDrawerLevelP','eventDetailsP','setEventLimitP','openEventDrawerP','closeEventDrawerP','eventLogSourceP','eventLogCardInnerHTMLP','eventLogCardHTMLP'];
vm.runInNewContext(names.map(extractFunction).join('\n'),context,{filename:'panel-p3-timeline-drawer.js'});

console.log('\n=== PANEL-012 / PANEL-10 — timeline + drawer fixture ===\n');
var html=context.eventLogCardHTMLP();
ok('dokuz timeline filtresi semantik olarak görünür', ['all','attention','sync','therapy-profile','quran-video','communication','user','derived','external'].every(function(k){return html.includes('data-filter="'+k+'"')&&html.includes('aria-pressed=');}));
ok('retry/merge/accepted zinciri tek satır grubudur',(html.match(/class="event-log-row"/g)||[]).length===3&&html.includes('zincir · 2'));
ok('satır source/status/revision/feature metadata taşır',html.includes('data-source=')&&html.includes('status-badge')&&html.includes('event-log-revision')&&html.includes('timeline-feature-icon'));
ok('hassas event özeti redacted kalır',!html.includes('PROFILE_RAW_RESPONSE_SENTINEL')&&html.includes('Güvenli kayıt özeti'));
context.UI.eventFilter='external';
var external=context.eventLogCardHTMLP();
ok('external filtresi yalnız dış kaynağı gösterir',external.includes('evt-external')&&!external.includes('evt-chain-1')&&!external.includes('evt-derived'));
context.UI.eventFilter='all'; context.UI.eventSelectedId='evt-chain-2'; context.UI.eventSelectedGroupKey='corr-chain'; context.UI.eventDrawerLevel=1;
var drawer=context.eventLogCardHTMLP();
ok('drawer modal ARIA sözleşmesi var',drawer.includes('role="dialog"')&&drawer.includes('aria-modal="true"')&&drawer.includes('aria-labelledby="event-drawer-title"')&&drawer.includes('aria-describedby="event-drawer-desc"'));
ok('drawer üç audit seviyesi ve zincir kanıtı taşır',drawer.includes('data-drawer-level="1"')&&drawer.includes('data-drawer-level="2"')&&drawer.includes('data-drawer-level="3"')&&drawer.includes('Event zinciri')&&drawer.includes('Sequence'));
ok('drawer ham payload sınırını görünür ilan eder',drawer.includes('Ham payload drawer’a taşınmaz')&&drawer.includes('token, GPS, profil cevabı ve base64 medya yoktur'));
doc.activeElement=focusFirst; var ev={key:'Tab',shiftKey:true,preventDefault:function(){ev.prevented=true;}}; context.eventDrawerKeydownP(ev);
ok('focus trap Shift+Tab ile ilk/son odağı döngüler',ev.prevented===true&&doc.activeElement===focusLast||doc.activeElement===focusFirst);
var ev2={key:'Tab',shiftKey:false,preventDefault:function(){ev2.prevented=true;}}; doc.activeElement=focusLast; context.eventDrawerKeydownP(ev2);
ok('focus trap Tab ile drawer içinde kalır',ev2.prevented===true&&doc.activeElement===focusFirst);
var escEv={key:'Escape',preventDefault:function(){escEv.prevented=true;}}; context.eventDrawerKeydownP(escEv);
ok('Esc drawer kapatma akışını çağırır',escEv.prevented===true&&context.UI.eventSelectedId===null);
ok('responsive drawer/reduced-motion sözleşmesi var',cssSource.includes('.event-drawer-panel{')&&cssSource.includes('@media(max-width:768px)')&&cssSource.includes('@media(prefers-reduced-motion:reduce)')&&cssSource.includes('width:100%'));
ok('cache-bust güncel panel sürümünde',htmlSource.includes('panel.css?v=20260805b')&&htmlSource.includes('panel.js?v=20260805c'));

console.log('\nPANEL-012 / PANEL-10 fixture result: '+(failed?'FAIL':'PASS')+' ('+passed+' passed, '+failed+' failed)');
if(failed) process.exitCode=1;
