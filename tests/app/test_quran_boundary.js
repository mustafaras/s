'use strict';

// MON-22 · SeymaQuran registry sınırı.
// Domain state machinei ve read-only uzak apply yalnız sentetik state ile
// çalıştırılır. quranTransportV1/sync transportı, gerçek ağ ve veri deposu
// bu fixture'ın kapsamı dışındadır.
var fs=require('fs');
var path=require('path');
var vm=require('vm');
var repoRoot=require('../repo-root');
var passed=0,failed=0;
function ok(name,condition,detail){
  if(condition){ passed++; console.log('  ✓ '+name); }
  else { failed++; console.log('  ✗ '+name+(detail?' — '+detail:'')); }
}

var quranSrc=fs.readFileSync(path.join(repoRoot,'app/core/quran.js'),'utf8');
var appSrc=fs.readFileSync(path.join(repoRoot,'app.js'),'utf8');
var indexSrc=fs.readFileSync(path.join(repoRoot,'index.html'),'utf8');
var fetchCalls=0,storageGets=0,storageSets=0,timerCalls=0,saveCalls=0;
var sandbox={
  console:console,window:null,Math:Math,JSON:JSON,Object:Object,Array:Array,
  String:String,Number:Number,Boolean:Boolean,RegExp:RegExp,Error:Error,
  Promise:Promise,Date:Date,Intl:Intl,isFinite:isFinite,isNaN:isNaN,
  fetch:function(){ fetchCalls++; throw new Error('MON-22 fixture: fetch yasak'); },
  localStorage:{
    getItem:function(){ storageGets++; return null; },
    setItem:function(){ storageSets++; },
    removeItem:function(){}
  },
  setTimeout:function(){ timerCalls++; return 1; },
  setInterval:function(){ timerCalls++; return 1; },
  clearTimeout:function(){},clearInterval:function(){},
  QuranRevelationOrderV1:{
    firstSurahId:'alak',
    byId:function(id){ return (id==='alak'||id==='fatiha')?{id:id}:null; }
  },
  SeySync:null
};
sandbox.window=sandbox;
vm.runInNewContext(quranSrc,sandbox,{filename:'app/core/quran.js'});
var Q=sandbox.SeymaQuran;

console.log('\n=== MON-22 · SeymaQuran registry sınır testleri ===\n');
ok('quran.js load-safe registry expose edildi',Q&&typeof Q==='object');
ok('registry yüklemede fetch/storage/timer açılmadı',fetchCalls===0&&storageGets===0&&storageSets===0&&timerCalls===0);
ok('registry kaynağında DOM/storage/fetch/timer sahipliği yok',!/(localStorage|document|\bfetch\b|setTimeout|setInterval)/.test(quranSrc));
ok('eksik resolver bag fail-closed reddediliyor',Q.registerQuran({})===false);

var current={quranJourney:{activeSurahId:'  ALAK ',futureField:'keep',requests:{alak:{status:'idle',requestId:null}}}};
var deps={data:function(){ return current; }};
ok('canlı data resolver tek kez kaydediliyor',Q.registerQuran(deps)===true&&Q.registerQuran(deps)===false);
ok('requestId normalizer trim ve biçim kuralını uygular',Q.quranNormalizeRequestId('  qr_ABCDEFGH123456  ')==='qr_ABCDEFGH123456'&&Q.quranNormalizeRequestId('qr_short')===null);
ok('surah normalizer trim/lower ve katalog güvenliğini uygular',Q.quranNormalizeSurahId('  ALAK  ')==='alak'&&Q.quranSafeSurahId(' ALAK ')==='alak'&&Q.quranSafeSurahId('yok')==='');
ok('requestId üretimi transport biçimine uyar',/^qr_[A-Za-z0-9_-]{24}$/.test(Q.quranNewRequestId()));
ok('outbox writer yalnız explicit sync yüzeyini çözer',Q.quranOutboxWriter()===null);
sandbox.SeySync={pushQuranRequest:function(){}};
ok('outbox writer sync transportını çağırmadan çözer',Q.quranOutboxWriter()===sandbox.SeySync);
ok('active surah normalize edilir ve bilinmeyen journey alanı korunur',(function(){
  var q=Q.ensureQuranJourney(current);
  return q.activeSurahId==='alak'&&q.futureField==='keep'&&q.requests.alak;
})());

function event(type,at,extra){ return Object.assign({type:type,at:at},extra||{}); }
var r0=Q.quranNewRequest();
var r0Snapshot=JSON.stringify(r0);
var r1=Q.quranReduce(r0,event('request_submit','2026-09-04T10:00:00.000Z',{requestId:'qr_ABCDEFGH123456'}));
var r2=Q.quranReduce(r1.request,event('outbox_written','2026-09-04T10:00:01.000Z'));
var r3=Q.quranReduce(r2.request,event('delivery_receipt','2026-09-04T10:01:00.000Z',{sentAt:'2026-09-04T10:01:00.000Z'}));
var r4=Q.quranReduce(r3.request,event('await_reply','2026-09-04T10:01:00.000Z'));
var r5=Q.quranReduce(r4.request,event('response_received','2026-09-04T10:02:00.000Z'));
var r6=Q.quranReduce(r5.request,event('response_valid','2026-09-04T10:03:00.000Z',{responseId:'qrr_ABCDEFGH123456',videoId:'dQw4w9WgXcQ',source:'gmail_reply'}));
ok('request → outbox → delivery → response geçişi ready üretir',r1.ok&&r2.ok&&r3.ok&&r4.ok&&r5.ok&&r6.ok&&r6.request.status==='ready');
ok('reducer input state mutasyonunu korur',JSON.stringify(r0)===r0Snapshot&&r0.status==='idle');
var duplicate=Q.quranReduce(r6.request,event('response_valid','2026-09-04T10:04:00.000Z',{responseId:'qrr_ABCDEFGH123456',videoId:'dQw4w9WgXcQ',source:'gmail_reply'}));
ok('aynı response ikinci kez uygulandığında idempotent kalır',duplicate.ok&&duplicate.changed===false&&duplicate.reason==='duplicate_response');

current={quranJourney:{activeSurahId:'alak',requests:{alak:r2.request}}};
var delivery={requests:{'qr_ABCDEFGH123456':{status:'sent',sentAt:'2026-09-04T10:01:00.000Z',providerMessageId:'msg_1'}}};
var responses={responses:{'qr_ABCDEFGH123456':{requestId:'qr_ABCDEFGH123456',surahId:'alak',responseId:'qrr_ABCDEFGH123456',videoId:'dQw4w9WgXcQ',source:'gmail_reply',receivedAt:'2026-09-04T10:02:00.000Z',validatedAt:'2026-09-04T10:03:00.000Z',status:'ready'}}};
var applied=Q.quranApplyRemoteUpdates(delivery,responses);
var appliedAgain=Q.quranApplyRemoteUpdates(delivery,responses);
ok('read-only remote apply ilk geçişte ready ve responseChanged üretir',applied.changed===true&&applied.responseChanged===true&&current.quranJourney.requests.alak.status==='ready');
ok('read-only remote apply 200→304→200 tekrarında duplicate üretmez',appliedAgain.changed===false&&appliedAgain.responseChanged===false);
ok('remote apply save/network çağırmaz',saveCalls===0&&fetchCalls===0);

ok('app.js request/response shimleri registryye bağlı',/function quranReduce\(request,ev\)\{ return window\.SeymaQuran\.quranReduce/.test(appSrc)&&/function quranApplyRemoteUpdates\(delivery,responses\)\{ return window\.SeymaQuran\.quranApplyRemoteUpdates/.test(appSrc));
ok('UI handler kabuğu app.jste kalır',appSrc.indexOf('App.quranJourneyRequest')>=0&&appSrc.indexOf('App.refreshQuranUpdates')>=0);
var quranIdx=indexSrc.indexOf('src="app/core/quran.js?v=');
var appIdx=indexSrc.indexOf('src="app.js?v=');
ok('index quran.js cache-bust ile app.js öncesinde yüklenir',quranIdx>=0&&appIdx>quranIdx);

console.log('\n=== Özet ===');
console.log('Passed: '+passed+' / '+(passed+failed));
if(failed) process.exitCode=1;
