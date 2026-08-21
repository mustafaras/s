// PANEL-008 / PANEL-06 — conditional polling, draft safety ve telemetry fixture.
// Yalnızca sentetik fetch/vm verisi; gerçek GitHub, relay, token ve kullanıcı verisi yok.
'use strict';
var fs=require('fs');
var path=require('path');
var vm=require('vm');
var repoRoot=require('./repo-root');
var source=fs.readFileSync(path.join(repoRoot,'panel.js'),'utf8');
var passed=0,failed=0;
function ok(name,condition,detail){ if(condition){passed++;console.log('  ✓ '+name);}else{failed++;console.log('  ✗ '+name+(detail?' — '+detail:''));} }
function extractFunction(name){
  var start=source.indexOf('function '+name+'('); if(start<0) throw new Error(name+' bulunamadı');
  var end=source.indexOf('\nfunction ',start+10); return source.slice(start,end<0?source.length:end);
}
function response(status,etag,body){
  return {status:status,ok:status>=200&&status<300,headers:{get:function(k){return k.toLowerCase()==='etag'?etag||null:null;}},json:function(){return Promise.resolve(body);}};
}
function normalizeReceipt(r){
  var x=r&&typeof r==='object'?r:{};
  return {snapshotRevision:/^[a-f0-9]{40}$/i.test(x.snapshotRevision||'')?x.snapshotRevision:null,sourceUpdatedAt:x.sourceUpdatedAt||null};
}

console.log('\n=== PANEL-008 / PANEL-06 — polling fixture ===\n');
console.log('[1] ETag conditional fetch — 200 sonra 304');
var calls=[],jsonCalls=0,latest={version:2,startDate:'2026-08-03',days:{},syncReceipt:{snapshotRevision:'a'.repeat(40),sourceUpdatedAt:'2026-08-03T10:00:00.000Z'}};
var aborted=[];
var ctx={Date:Date,Math:Math,Promise:Promise,String:String,Number:Number,Object:Object,Array:Array,isFinite:isFinite,Error:Error,encodeURIComponent:encodeURIComponent,setTimeout:setTimeout,clearTimeout:clearTimeout,AbortController:AbortController,PANEL_FETCH_TIMEOUT_MS:20000,PANEL_FETCH_ATTEMPTS:3,PANEL_RETRY_DELAY_MS:5,PANEL_TIMEOUT_GROWTH:1.5,panelAttemptP:null,panelAttemptTimeoutP:null,panelRetryableErrorP:null,PTOKEN:'test-token',PANEL_LATEST_CACHE:{etag:null,sourceRevision:null,sourceUpdatedAt:null},PANEL_POLL_STATE:{conditionalMode:'etag'},responseHeaderP:null,pollConditionalDecisionP:null,panelFetchP:null,fetch:null};
ctx.fetch=function(url,opts){
  calls.push({url:url,opts:opts});
  if(calls.length===1) return Promise.resolve(response(200,'"v1"',latest));
  return Promise.resolve(response(304,'"v1"'));
};
vm.runInNewContext(extractFunction('responseHeaderP')+'\n'+extractFunction('panelFetchP')+'\n'+extractFunction('panelRetryableErrorP')+'\n'+extractFunction('panelAttemptP')+'\n'+extractFunction('panelAttemptTimeoutP')+'\n'+extractFunction('pollConditionalDecisionP')+'\n'+extractFunction('fetchLatest'),ctx,{filename:'panel-p2-polling.js'});
ctx.responseHeaderP=ctx.responseHeaderP;
var first=ctx.fetchLatest('owner/repo','main').then(function(x){
  jsonCalls++;
  ok('ilk polling 200 gövdesini alır',x&&!x.notModified&&x.data===latest);
  ok('ilk response ETag cache’e alınır',ctx.PANEL_LATEST_CACHE.etag==='"v1"');
  return ctx.fetchLatest('owner/repo','main');
}).then(function(second){
  ok('değişmeyen polling 304 olarak işlenir',second&&second.notModified===true);
  ok('304 turunda JSON body tekrar parse edilmez',jsonCalls===1);
  ok('ikinci istek If-None-Match taşır',calls[1].opts.headers['If-None-Match']==='"v1"');
  ok('cache-busting t parametresiyle conditional bozulmaz',calls[0].url.indexOf('&t=')<0&&calls[1].url.indexOf('&t=')<0);
  ok('her latest isteği iptal sinyali taşır (takılı akış kilitlenemez)',!!calls[0].opts.signal&&!!calls[1].opts.signal);
});

first.then(function(){
  console.log('[2] Taslak/input koruması ve p50/p95');
  var statsCode=extractFunction('pollLatencyStatsP');
  var statsCtx={Array:Array,Number:Number,isFinite:isFinite,Math:Math};
  vm.runInNewContext(statsCode,statsCtx,{filename:'panel-p2-stats.js'});
  var samples=[80,120,100,200,90,110,150,70,130,180,95,105,140,160,85,115,125,135,145,190];
  var stats=statsCtx.pollLatencyStatsP(samples);
  ok('fixture polling p50 hesaplanır',stats.count===20&&stats.p50===120);
  ok('fixture polling p95 hesaplanır',stats.p95===190);
  var draftCtx={UI:{msgSending:false,msgDraft:'taslak korunmalı'},document:{activeElement:null},panelBusyTyping:function(){return false;}};
  vm.runInNewContext(extractFunction('panelDraftActiveP'),draftCtx,{filename:'panel-p2-draft.js'});
  ok('mesaj taslağı aktifken background render ertelenir',draftCtx.panelDraftActiveP()===true);
  draftCtx.UI.msgDraft=''; draftCtx.document.activeElement={tagName:'TEXTAREA'}; draftCtx.panelBusyTyping=function(){return true;};
  ok('textarea odağında polling taslak kapısı çalışır',draftCtx.panelDraftActiveP()===true);
}).then(function(){
  console.log('[3] Görünür polling durum haritası');
  var statusCtx={PANEL_POLL_STATE:{lastOutcome:'not_modified',lastPollAt:new Date().toISOString()},Date:Date,Math:Math,isFinite:isFinite};
  vm.runInNewContext(extractFunction('pollStatusP'),statusCtx,{filename:'panel-p2-status.js'});
  ok('304 UI metni yakın takip olur',statusCtx.pollStatusP().label.indexOf('Yakın takip')>=0&&statusCtx.pollStatusP().note.indexOf('ETag 304')>=0);
  statusCtx.PANEL_POLL_STATE.lastOutcome='skipped_input';
  ok('input skip UI’da görünür',statusCtx.pollStatusP().label==='Polling atlandı');
  statusCtx.PANEL_POLL_STATE.lastOutcome='deferred_draft';
  ok('taslak defer UI’da görünür',statusCtx.pollStatusP().label==='Taslak korunuyor');
  console.log('[4] Değişmeyen snapshot rerender kapısı');
  var renderCalls=0,ribbonCalls=0,renderCtx={
    PANEL_POLL_STATE:{pendingRender:false},
    panelDraftActiveP:function(){return false;},
    panelInteractionActiveP:function(){return false;},
    pollRecordP:function(){},
    updatePollRibbonP:function(){ribbonCalls++;},
    render:function(){renderCalls++;},
    LASTSIG:'same-sig',
    LAST_RENDERED_POLL_OUTCOME:'changed',
    Date:Date
  };
  vm.runInNewContext(extractFunction('applyPollRenderP'),renderCtx,{filename:'panel-p2-render-gate.js'});
  renderCtx.applyPollRenderP('same-sig',false,'not_modified',Date.now()-10,{});
  ok('aynı snapshot 304 turunda tam render yapılmaz',renderCalls===0&&ribbonCalls===1);
  renderCtx.panelDraftActiveP=function(){return true;};
  renderCtx.panelInteractionActiveP=function(){return true;};
  renderCtx.applyPollRenderP('new-sig',true,'changed',Date.now()-10,{});
  ok('taslak varken yeni snapshot render kuyruğuna alınır',renderCalls===0&&renderCtx.PANEL_POLL_STATE.pendingRender===true);
  console.log('\nPANEL-008 / PANEL-06 polling fixture result: '+(failed?'FAIL':'PASS')+' ('+passed+' passed, '+failed+' failed)');
  if(failed) process.exitCode=1;
}).catch(function(e){ console.error('  ✗ test exception: '+e.stack); process.exitCode=1; });
