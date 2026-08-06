// PANEL-003 / PANEL-01 — P0 senkron makbuzu ve panel projeksiyonu
// Tamamen sentetik vm/fetch fixture'ı: gerçek GitHub, localStorage veya kullanıcı
// verisi kullanılmaz. Başarılı kabul, anti-clobber duruşu ve panel fallback'i aynı
// sözleşme üzerinden sınar.

'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');
var repoRoot = require('./repo-root');

var syncSource = fs.readFileSync(path.join(repoRoot, 'sync.js'), 'utf8');
var coverageSource = fs.readFileSync(path.join(repoRoot, 'panelCoverageManifest.js'), 'utf8');
var panelSource = fs.readFileSync(path.join(repoRoot, 'panel.js'), 'utf8');
var KEY = 'seyma-reset-v1';
var HASH_A = 'a'.repeat(40);
var HASH_B = 'b'.repeat(40);
var HASH_C = 'c'.repeat(40);
var NOW = '2026-08-02T15:00:00.000Z';
var SUBMITTED = '2026-08-02T14:59:00.000Z';
var SOURCE = '2026-08-02T14:58:00.000Z';

var passed = 0;
var failed = 0;
function ok(name, condition, detail){
  if(condition){ passed++; console.log('  ✓ '+name); }
  else { failed++; console.log('  ✗ '+name+(detail?' — '+detail:'')); }
}
function b64(value){ return Buffer.from(String(value), 'utf8').toString('base64'); }
function unb64(value){ return Buffer.from(String(value), 'base64').toString('utf8'); }
function response(status, body){
  var text=body===undefined?'':(typeof body==='string'?body:JSON.stringify(body));
  return {
    status:status,
    ok:status>=200&&status<300,
    json:function(){ return Promise.resolve(body===undefined?{}:body); },
    text:function(){ return Promise.resolve(text); }
  };
}
function dayMap(n, prefix){
  var out={};
  for(var i=0;i<n;i++) out['2026-08-'+String(i+1).padStart(2,'0')]={note:(prefix||'remote')+' note'};
  return out;
}
function localState(dayCount){
  return {
    version:2,
    startDate:'2026-08-01',
    lastOpenedDate:'2026-08-02',
    savedAt:SOURCE,
    syncReceipt:{schemaVersion:1,status:'local_saved',sourceUpdatedAt:SOURCE,submittedAt:null,acceptedAt:null,snapshotRevision:null,sourceLatestSha:null,lastErrorCode:null},
    settings:{ghToken:'secret-token',ghRepo:'owner/repo',ghBranch:'main',openaiKey:'raw-openai-key'},
    days:dayMap(dayCount,'local'),
    userTextSentinel:'sadece yerel kullanıcı metni'
  };
}
function makeStorage(seed){
  var values={};
  values[KEY]=JSON.stringify(seed);
  return {
    getItem:function(k){ return Object.prototype.hasOwnProperty.call(values,k)?values[k]:null; },
    setItem:function(k,v){ values[k]=String(v); },
    removeItem:function(k){ delete values[k]; },
    raw:function(k){ return values[k]||null; }
  };
}
function makeContext(seed, remoteDays, latestSha, revision){
  var storage=makeStorage(seed), calls=[], stateReceipts=[], acceptedReceipts=[];
  var remote={version:2,days:dayMap(remoteDays,'remote'),savedAt:SOURCE};
  var fetchMock=function(url, opts){
    var u=new URL(url), marker='/contents/';
    var pathPart=u.pathname.indexOf(marker)>=0?u.pathname.slice(u.pathname.indexOf(marker)+marker.length):u.pathname;
    var method=(opts&&opts.method)||'GET';
    calls.push({path:pathPart,method:method,opts:opts||{}});
    if(pathPart.indexOf('data/backups/')===0) return Promise.resolve(method==='GET'?response(404):response(200,{}));
    if(pathPart==='data/latest.json'){
      if(method==='GET') return Promise.resolve(response(200,{sha:HASH_A,content:b64(JSON.stringify(remote))}));
      return Promise.resolve(response(200,{content:{sha:latestSha},commit:{sha:revision}}));
    }
    if(pathPart==='data/sync-receipt.json') return Promise.resolve(method==='GET'?response(404):response(200,{}));
    if(pathPart==='data/observer-snapshot.json') return Promise.resolve(method==='GET'?response(404):response(200,{}));
    if(pathPart.indexOf('data/gunluk/')===0) return Promise.resolve(method==='GET'?response(404):response(200,{}));
    return Promise.resolve(response(404));
  };
  var context={
    window:{
      addEventListener:function(){},
      SeyOnSyncState:function(receipt){ stateReceipts.push(receipt); },
      SeyOnSynced:function(receipt){ acceptedReceipts.push(receipt); }
    },
    localStorage:storage,
    fetch:fetchMock,
    location:{protocol:'https:',hostname:'example.test',search:''},
    document:{getElementById:function(){return null;}},
    console:console,
    Promise:Promise,
    Date:Date,
    Math:Math,
    JSON:JSON,
    String:String,
    Number:Number,
    Object:Object,
    Array:Array,
    Error:Error,
    URL:URL,
    TextEncoder:TextEncoder,
    TextDecoder:TextDecoder,
    Uint8Array:Uint8Array,
    setTimeout:setTimeout,
    clearTimeout:clearTimeout,
    isNaN:isNaN,
    isFinite:isFinite,
    atob:function(value){ return Buffer.from(String(value),'base64').toString('binary'); },
    btoa:function(value){ return Buffer.from(String(value),'binary').toString('base64'); },
    Buffer:Buffer
  };
  vm.runInNewContext(coverageSource,context,{filename:'panelCoverageManifest.js'});
  vm.runInNewContext(syncSource,context,{filename:'sync.js'});
  return {context:context,storage:storage,calls:calls,stateReceipts:stateReceipts,acceptedReceipts:acceptedReceipts};
}
function callOf(run, pathPart, method){
  return run.calls.find(function(c){ return c.path===pathPart&&c.method===method; });
}
function decodedBody(call){
  var body=call&&call.opts&&call.opts.body?JSON.parse(call.opts.body):null;
  return body&&body.content?JSON.parse(unb64(body.content)):null;
}

async function main(){
console.log('\n=== PANEL-003 / PANEL-01 — P0 senkron fixture ===\n');

console.log('[1] Başarılı push — revision + acceptedAt + güvenli receipt');
await (async function(){
  var run=makeContext(localState(1),0,HASH_B,HASH_C);
  var receipt=await run.context.window.SeySync.pushNow();
  var receiptPut=callOf(run,'data/sync-receipt.json','PUT');
  var latestPut=callOf(run,'data/latest.json','PUT');
  var persisted=JSON.parse(run.storage.raw(KEY));
  ok('push accepted receipt döndürür',!!receipt&&receipt.status==='accepted');
  ok('snapshotRevision server revision’dan gelir',receipt&&receipt.snapshotRevision===HASH_C);
  ok('acceptedAt üretilir',!!(receipt&&receipt.acceptedAt));
  ok('sourceLatestSha server latest SHA’sını taşır',receipt&&receipt.sourceLatestSha===HASH_B);
  ok('local callback server receipt’ini ayrı alır',run.acceptedReceipts.length===1&&run.acceptedReceipts[0].acceptedAt===receipt.acceptedAt);
  ok('local state saving ve accepted geçişini gördü',run.stateReceipts.some(function(x){return x.status==='saving';})&&run.stateReceipts.some(function(x){return x.status==='accepted';}));
  ok('persisted state accepted receipt içerir',persisted.syncReceipt&&persisted.syncReceipt.snapshotRevision===HASH_C);
  ok('receipt yalnızca whitelist alanlarını içerir',receiptPut&&Object.keys(decodedBody(receiptPut)).sort().join(',')==='acceptedAt,lastErrorCode,schemaVersion,snapshotRevision,sourceLatestSha,sourceUpdatedAt,status,submittedAt',receiptPut?Object.keys(decodedBody(receiptPut)).sort().join(','):'receipt PUT yok');
  var receiptJson=receiptPut&&JSON.stringify(decodedBody(receiptPut));
  ok('receipt token içermez',receiptJson&&!receiptJson.includes('secret-token'));
  ok('receipt raw kullanıcı metni içermez',receiptJson&&!receiptJson.includes('sadece yerel kullanıcı metni'));
  ok('latest payload token’ı ve openai anahtarını taşımıyor',latestPut&&!JSON.stringify(decodedBody(latestPut)).includes('secret-token')&&!JSON.stringify(decodedBody(latestPut)).includes('raw-openai-key'));
  var projectionPut=callOf(run,'data/observer-snapshot.json','PUT');
  ok('observer projection ayrı dosyaya yazılır',!!projectionPut);
  ok('observer projection da token taşımaz',projectionPut&&!JSON.stringify(decodedBody(projectionPut)).includes('secret-token')&&!JSON.stringify(decodedBody(projectionPut)).includes('raw-openai-key'));
})();

console.log('[2] Anti-clobber — gün farkı merge ile kapanırsa artık engel çıkarmaz');
await (async function(){
  var run=makeContext(localState(1),2,HASH_B,HASH_C);
  var result=await run.context.window.SeySync.pushNow();
  var persisted=JSON.parse(run.storage.raw(KEY));
  var latestPut=callOf(run,'data/latest.json','PUT');
  var receiptPut=callOf(run,'data/sync-receipt.json','PUT');
  ok('merge sonrası push accepted olur',!!result&&result.status==='accepted');
  ok('yerel state remote günleriyle genişler',persisted.days&&Object.keys(persisted.days).length===2);
  ok('latest PUT yapılır',!!latestPut);
  ok('accepted makbuzu panel yoluna yazılır',receiptPut&&decodedBody(receiptPut).status==='accepted');
  ok('makbuz token/raw metin içermez',receiptPut&&!JSON.stringify(decodedBody(receiptPut)).includes('secret-token')&&!JSON.stringify(decodedBody(receiptPut)).includes('sadece yerel kullanıcı metni'));
  ok('anti-clobber log human-readable code üretir',run.context.window.SeySync.syncErrorCode({code:'anti_clobber'})==='anti_clobber');
})();

console.log('[2b] Anti-clobber — forceSync bilinçli üzerine yazma yolunu korur');
await (async function(){
  var run=makeContext(localState(1),2,HASH_B,HASH_C);
  run.context.localStorage.setItem('seyma-sync-force','1');
  var result=await run.context.window.SeySync.pushNow();
  var persisted=JSON.parse(run.storage.raw(KEY));
  ok('forceSync açıkken push accepted olur',!!result&&result.status==='accepted');
  ok('forceSync açıkken yerel state remote günleriyle genişler',persisted.days&&Object.keys(persisted.days).length===2);
})();

function extractTopLevelFunction(source,name){
  var start=source.indexOf('function '+name+'(');
  if(start<0) throw new Error(name+' bulunamadı');
  var end=source.indexOf('\nfunction ',start+10);
  return source.slice(start,end<0?source.length:end).trim();
}

console.log('[3] Panel projection — local/remote/projection/panelPoll ayrı');
(function(){
  var map=panelSource.match(/var SYNC_STATUS_P=\{[\s\S]*?\};/);
  var names=['normalizeSyncReceiptP','syncStatusP','syncTimesP','syncTimeP','syncFreshnessP','statusToneP','panelStatusBadgeHTMLP','panelLegacyBadgeHTMLP','syncRibbonHTMLP'];
  var code=(map?map[0]:'')+'\n'+names.map(function(n){return extractTopLevelFunction(panelSource,n);}).join('\n');
  var context={
    Date:Date,Math:Math,String:String,Number:Number,isFinite:isFinite,
    esc:function(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');},
    tsShort:function(s){return s?String(s):'—';}
  };
  vm.runInNewContext(code,context,{filename:'panel-p0-helpers.js'});
  var accepted={schemaVersion:1,status:'accepted',snapshotRevision:HASH_C,sourceUpdatedAt:SOURCE,submittedAt:SUBMITTED,acceptedAt:NOW,sourceLatestSha:HASH_B,lastErrorCode:null};
  var times=context.syncTimesP(accepted,'2026-08-02T15:01:00.000Z');
  var html=context.syncRibbonHTMLP(accepted,'2026-08-02T15:01:00.000Z');
  ok('panel accepted receipt gösterir',context.syncStatusP(accepted).code==='accepted'&&html.includes('Uzak kayda alındı'));
  ok('panel revision gösterir',html.includes(HASH_C.slice(0,12)));
  ok('local/remote/projection/panelPoll ayrıdır',times.local===SOURCE&&times.remote===NOW&&times.projection===null&&!!times.panelPoll);
  ok('makbuzsuz panel başarı iddiası kullanmaz',context.syncStatusP(null).code==='missing'&&context.syncFreshnessP(null,null).klass==='warn');
  ok('geçersiz acceptedAt başarıya yükselmez',context.syncStatusP({status:'accepted',sourceLatestSha:HASH_B,snapshotRevision:HASH_C,acceptedAt:'kullanıcı metni'}).code==='missing');
  var anti={status:'anti_clobber',lastErrorCode:'anti_clobber',sourceLatestSha:null,snapshotRevision:null};
  var antiHtml=context.syncRibbonHTMLP(anti,null);
  ok('panel anti-clobber insan dilini gösterir',antiHtml.includes('Veri kaybını önlemek için durduruldu'));
  ok('panel receipt raw metni yansıtmaz',!html.includes('sadece yerel kullanıcı metni')&&!html.includes('secret-token'));
})();

console.log('[4] Section fetch failure — PROJECTION_SECTIONS korunur, sync ribbon uyarı gösterir');
(function(){
  var map=panelSource.match(/var SYNC_STATUS_P=\{[\s\S]*?\};/);
  var names=['normalizeSyncReceiptP','syncStatusP','syncTimesP','syncTimeP','syncFreshnessP','statusToneP','panelStatusBadgeHTMLP','panelLegacyBadgeHTMLP','syncRibbonHTMLP'];
  var code=(map?map[0]:'')+'\n'+names.map(function(n){return extractTopLevelFunction(panelSource,n);}).join('\n');
  var context={
    Date:Date,Math:Math,String:String,Number:Number,isFinite:isFinite,
    esc:function(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');},
    tsShort:function(s){return s?String(s):'—';},
    PANEL_POLL_STATE:{status:'idle',lastOutcome:'idle',conditionalMode:'etag'},
    pollStatusP:function(){ return {cls:'b-dim',label:'Yakın takip bekleniyor',note:'İlk panel çekimi bekleniyor.'}; }
  };
  // Test 1: SECTION_FETCH_STATE.ok=false → uyarı metni içermeli
  context.SECTION_FETCH_STATE={ok:false,lastError:'network',failedAt:'2026-08-02T15:00:00.000Z'};
  vm.runInNewContext(code,context,{filename:'panel-p0-section-fetch.js'});
  var accepted={schemaVersion:1,status:'accepted',snapshotRevision:HASH_C,sourceUpdatedAt:SOURCE,submittedAt:SUBMITTED,acceptedAt:NOW,sourceLatestSha:HASH_B,lastErrorCode:null};
  var html=context.syncRibbonHTMLP(accepted,'2026-08-02T15:01:00.000Z');
  ok('section fetch hatası sync ribbon uyarı metni içerir',html.includes('Bazı modüller geçici olarak yüklenemedi'));
  ok('section fetch hatası stale-banner class kullanır',html.includes('stale-banner'));
  // Test 2: SECTION_FETCH_STATE.ok=true → uyarı metni içermemeli
  context.SECTION_FETCH_STATE={ok:true,lastError:null,failedAt:null};
  var htmlOk=context.syncRibbonHTMLP(accepted,'2026-08-02T15:01:00.000Z');
  ok('section fetch başarılıysa uyarı metni içermez',!htmlOk.includes('Bazı modüller geçici olarak yüklenemedi'));
})();

console.log('\nPANEL-003 / PANEL-01 P0 result: '+(failed?'FAIL':'PASS')+' ('+passed+' passed, '+failed+' failed)');
if(failed) process.exitCode=1;
}
main().catch(function(err){ console.error(err&&err.stack||err); process.exitCode=1; });
