// PANEL-007 / PANEL-05 — sync event file merge/push fixture.
// Mock GitHub Contents API; gerçek repo, token ve kişisel veri kullanılmaz.
'use strict';
var fs=require('fs');
var path=require('path');
var repoRoot=require('./repo-root');
var passed=0,failed=0;
function ok(name,condition,detail){ if(condition){passed++;console.log('  ✓ '+name);}else{failed++;console.log('  ✗ '+name+(detail?' — '+detail:''));} }
var ls={};
global.localStorage={getItem:function(k){return Object.prototype.hasOwnProperty.call(ls,k)?ls[k]:null;},setItem:function(k,v){ls[k]=String(v);},removeItem:function(k){delete ls[k];}};
global.window={addEventListener:function(){},SeySync:null};
global.document={getElementById:function(){return null;}};
global.location={protocol:'https:',hostname:'example.test',search:''};
if(typeof TextEncoder==='undefined') global.TextEncoder=require('util').TextEncoder;
if(typeof TextDecoder==='undefined') global.TextDecoder=require('util').TextDecoder;
if(typeof btoa==='undefined') global.btoa=function(s){return Buffer.from(s,'binary').toString('base64');};
if(typeof atob==='undefined') global.atob=function(s){return Buffer.from(s,'base64').toString('binary');};
global.fetch=function(){ return Promise.reject(new Error('unexpected fetch')); };
var source=fs.readFileSync(path.join(repoRoot,'sync.js'),'utf8');
eval(source);
var S=global.window.SeySync;
if(!S){console.error('SeySync yüklenemedi');process.exit(1);}
function ev(seq,id,device,when){ return {eventId:id||device+'-'+seq,correlationId:id||device+'-'+seq,sequence:seq,occurredAt:when,persistedAt:when,submittedAt:null,acceptedAt:null,section:'content',path:'data.library.watchlist.music',operation:'update',summary:'İçerik/arşiv kaydı güncellendi',source:'app',sourceDeviceId:device,privacyClass:'summary',snapshotRevision:null}; }
function b64(s){ return Buffer.from(String(s),'utf8').toString('base64'); }
function utf8(s){ return Buffer.from(String(s),'base64').toString('utf8'); }

console.log('\n=== PANEL-007 / PANEL-05 — sync event file fixture ===\n');
console.log('[1] Normalize, merge ve duplicate idempotence');
var local={schemaVersion:1,sourceDeviceId:'dev_a',nextSequence:3,events:[ev(1,'evt-1','dev_a','2026-08-02T10:00:00.000Z'),ev(2,'evt-2','dev_a','2026-08-02T10:01:00.000Z')],published:{}};
var remote={schemaVersion:1,sourceDeviceId:'dev_b',nextSequence:2,events:[ev(1,'evt-1','dev_a','2026-08-02T10:00:00.000Z'),ev(1,'evt-b-1','dev_b','2026-08-02T10:02:00.000Z')]};
var merged=S.mergeEventLog(local,remote);
ok('iki cihaz eventleri korunur',merged.events.length===3&&merged.events.some(function(x){return x.sourceDeviceId==='dev_b';}));
ok('aynı eventId merge sonrası bir kez kalır',merged.events.filter(function(x){return x.eventId==='evt-1';}).length===1);
ok('event summary allowlist dışını yazmaz',S.normalizeEvent(Object.assign({},ev(3,'evt-3','dev_a','2026-08-02T10:03:00.000Z'),{summary:'RAW_PROFILE_RESPONSE'}),'dev_a').summary==='Güvenli kayıt özeti');
var file=S.mergeEventFile({date:'2026-08-02',events:[ev(1,'evt-1','dev_a','2026-08-02T10:00:00.000Z')]},{date:'2026-08-02',events:[ev(1,'evt-1','dev_a','2026-08-02T10:00:00.000Z'),ev(2,'evt-2','dev_a','2026-08-02T10:01:00.000Z')]},'2026-08-02');
ok('günlük dosya merge’i append-only/idempotent',file.events.length===2&&file.events[0].eventId==='evt-1'&&file.events[1].eventId==='evt-2');

console.log('[2] Accepted receipt ile canonical günlük PUT');
var calls=[],existing={date:'2026-08-02',events:[ev(1,'evt-remote','dev_remote','2026-08-02T09:00:00.000Z')]};
global.fetch=function(url,opts){
  calls.push({url:url,opts:opts});
  if(!opts||!opts.method) return Promise.resolve({status:200,ok:true,json:function(){return Promise.resolve({sha:'remote-sha',content:b64(JSON.stringify(existing))});}});
  return Promise.resolve({status:200,ok:true,json:function(){return Promise.resolve({content:{path:'data/events/2026-08-02.json'}});}});
};
var data={eventLog:{sourceDeviceId:'dev_a',events:[ev(2,'evt-local','dev_a','2026-08-02T12:00:00.000Z')],published:{}}};
var receipt={submittedAt:'2026-08-02T12:01:00.000Z',acceptedAt:'2026-08-02T12:02:00.000Z',snapshotRevision:'b'.repeat(40)};
var cfg={token:'test-token-never-real',owner:'owner',repo:'repo',branch:'main'};
S.pushEventLog(cfg,data,receipt).then(function(){
  var put=calls.filter(function(x){return x.opts&&x.opts.method==='PUT';})[0], body=put&&JSON.parse(put.opts.body), pushed=body&&JSON.parse(utf8(body.content));
  ok('event dosyası GET+PUT yapılır',calls.length===2&&!!put);
  ok('remote event kaybolmadan append edilir',pushed&&pushed.events.length===2&&pushed.events.some(function(x){return x.eventId==='evt-remote';})&&pushed.events.some(function(x){return x.eventId==='evt-local';}));
  ok('receipt tuple canonical event’e bağlanır',pushed&&pushed.events.some(function(x){return x.eventId==='evt-local'&&x.acceptedAt===receipt.acceptedAt&&x.snapshotRevision===receipt.snapshotRevision;}));
  ok('başarılı PUT yalnız event published işareti koyar',data.eventLog.published['evt-local']===true&&data.eventLog.events.length===1);
  console.log('\nPANEL-007 / PANEL-05 sync fixture result: '+(failed?'FAIL':'PASS')+' ('+passed+' passed, '+failed+' failed)');
  if(failed) process.exitCode=1;
}).catch(function(e){ console.error('  ✗ test exception: '+e.stack); process.exitCode=1; });
