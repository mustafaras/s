// PANEL-004 / PANEL-02 — coverage manifest + observer projection fixture.
// Yalnızca sentetik vm verisi kullanır; gerçek GitHub, browser, localStorage
// ve kullanıcı verisi yoktur.
'use strict';

var fs=require('fs');
var path=require('path');
var vm=require('vm');
var repoRoot=require('./repo-root');
var source=fs.readFileSync(path.join(repoRoot,'panelCoverageManifest.js'),'utf8');
var panelSource=fs.readFileSync(path.join(repoRoot,'panel.js'),'utf8');
var HASH_A='a'.repeat(40), HASH_B='b'.repeat(40), HASH_C='c'.repeat(40);
var receipt={schemaVersion:1,status:'accepted',snapshotRevision:HASH_C,sourceUpdatedAt:'2026-08-02T14:58:00.000Z',submittedAt:'2026-08-02T14:59:00.000Z',acceptedAt:'2026-08-02T15:00:00.000Z',sourceLatestSha:HASH_B,lastErrorCode:null};
var passed=0, failed=0;
function ok(name,condition,detail){ if(condition){passed++;console.log('  ✓ '+name);}else{failed++;console.log('  ✗ '+name+(detail?' — '+detail:''));} }
function makeData(){
  return {
    version:2,startDate:'2026-08-01',lastOpenedDate:'2026-08-02',lastOpenedAt:'2026-08-02T14:57:00.000Z',savedAt:'2026-08-02T14:58:00.000Z',
    syncReceipt:receipt,
    settings:{nickname:'Günışığı',ghRepo:'owner/repo',ghBranch:'main',ghToken:'secret-token',openaiKey:'raw-openai-key',syncUrl:'https://private.example/sync',auth:{session:'raw-auth'}},
    profileAssessment:{status:'completed',consent:{panelSummarySharingAccepted:true},responses:{item_1:{answer:'RAW_PROFILE_ANSWER',answeredAt:'2026-08-02T14:00:00.000Z'}},panelSummary:{confidenceScore:82,shortReport:'Güvenli özet'}},
    location:{lat:41.01,lon:28.97,accuracy:5,ts:'2026-08-02T14:56:00.000Z',source:'gps'},
    locationHistory:[{lat:41.01,lon:28.97,ts:'2026-08-02T14:55:00.000Z'},{lat:41.02,lon:28.98,ts:'2026-08-02T14:56:00.000Z'}],
    days:{'2026-08-02':{savedAt:'2026-08-02T14:58:00.000Z',note:'güvenli not',movement:{walkM:1200,track:[{lat:41.01,lon:28.97,ts:'2026-08-02T14:50:00.000Z'}]},media:{type:'photo',data:'BASE64_MEDIA_SENTINEL'}}},
    labResults:[{id:'lab-1',label:'özet',value:'summary',data:'BASE64_LAB_SENTINEL'}],
    notifications:[{id:'n1',status:'pending'}],quranJourney:{status:'ready'},saygi:{streak:3},
    aeon:{qa:[{id:'q1',question:'safe question'}],media:{data:'BASE64_AEON_SENTINEL'}},
    userTextSentinel:'ordinary safe note'
  };
}
var context={window:{},Date:Date,JSON:JSON,Array:Array,Object:Object,String:String,Number:Number,Boolean:Boolean,Math:Math,Date:Date,isNaN:isNaN};
vm.runInNewContext(source,context,{filename:'panelCoverageManifest.js'});
var P=context.window.PanelCoverageV1;
if(!P){ console.error('PanelCoverageV1 yüklenemedi'); process.exit(1); }

console.log('\n=== PANEL-004 / PANEL-02 — coverage ve projection fixture ===\n');
var data=makeData();
console.log('[1] Manifest ve coverage sınıfları');
var cov=P.coverageForData(data);
ok('manifest schema v1',P.MANIFEST.schemaVersion===1);
ok('tam alanlar sınıflanır',cov.full.indexOf('version')>=0&&cov.full.indexOf('startDate')>=0);
ok('özet alanlar sınıflanır',cov.summary.indexOf('userTextSentinel')>=0&&cov.summary.length>0);
ok('secret alan redacted sınıfında',cov.redacted.indexOf('settings.ghToken')>=0&&cov.redacted.indexOf('settings.openaiKey')>=0);
ok('raw profil cevapları redacted sınıfında',cov.redacted.indexOf('profileAssessment.responses')>=0);
ok('GPS kökü redacted sınıfında',cov.redacted.indexOf('location')>=0&&cov.redacted.indexOf('locationHistory')>=0);
ok('hareket izi redacted sınıfında',cov.redacted.indexOf('days.2026-08-02.movement.track')>=0);
ok('medya alanı redacted sınıfında',cov.redacted.indexOf('days.2026-08-02.media')>=0);
ok('lab binary redacted sınıfında',cov.redacted.indexOf('labResults.0.data')>=0);
ok('gelecek bilinmeyen alanlar unmapped kalmaz',Array.isArray(cov.unmappedPaths)&&cov.unmappedPaths.length===0);
ok('eksik kökler bilinçli listelenir',cov.missing.indexOf('locationHistory')<0&&cov.missing.indexOf('aeon')<0);
var sparseCov=P.coverageForData({version:2,days:{},settings:{}});
ok('eksik fixture alanları manifest missing listesine girer',sparseCov.missing.indexOf('profileAssessment')>=0&&sparseCov.missing.indexOf('location')>=0&&sparseCov.missing.indexOf('quranJourney')>=0);

console.log('[2] Projection redaction ve güvenli receipt');
var snapshot=P.buildObserverSnapshot(data,receipt,'2026-08-02T15:00:05.000Z');
var json=JSON.stringify(snapshot);
ok('projection schema ve revision taşır',snapshot.schemaVersion===1&&snapshot.snapshotRevision===HASH_C&&snapshot.sourceLatestSha===HASH_B);
ok('projection acceptedAt/sourceUpdatedAt taşır',snapshot.serverAcceptedAt===receipt.acceptedAt&&snapshot.sourceUpdatedAt===receipt.sourceUpdatedAt);
ok('coverage projection içine bağlanır',snapshot.coverage&&snapshot.coverage.redacted.indexOf('settings.ghToken')>=0);
ok('secret projection JSON’una girmez',!json.includes('secret-token')&&!json.includes('raw-openai-key')&&!json.includes('private.example'));
ok('raw profile response projection JSON’una girmez',!json.includes('RAW_PROFILE_ANSWER'));
ok('GPS koordinatları projection JSON’una girmez',!json.includes('41.01')&&!json.includes('28.97'));
ok('base64 medya/lab projection JSON’una girmez',!json.includes('BASE64_MEDIA_SENTINEL')&&!json.includes('BASE64_LAB_SENTINEL')&&!json.includes('BASE64_AEON_SENTINEL'));
ok('location yalnız redacted özet taşır',snapshot.data.location&&snapshot.data.location.privacy==='redacted'&&snapshot.data.location.lat===undefined);
ok('profil summary korunur, cevaplar elenir',snapshot.data.profileAssessment.panelSummary&&snapshot.data.profileAssessment.responses===undefined);

console.log('[3] Parse/fallback compatibility');
var parsed=P.parseObserverSnapshot(JSON.stringify(snapshot));
ok('geçerli projection parse edilir',parsed.ok&&parsed.value.snapshotRevision===HASH_C);
ok('boş projection parse hatası verir',!P.parseObserverSnapshot('').ok&&P.parseObserverSnapshot('').code==='projection_parse_failed');
ok('bozuk JSON parse hatası verir',!P.parseObserverSnapshot('{bozuk').ok);
ok('eksik schema reddedilir',!P.parseObserverSnapshot({schemaVersion:1,data:{}}).ok);
var chosen=P.chooseProjection(snapshot,data,receipt);
ok('eşleşen projection seçilir',chosen.source==='projection'&&chosen.reason==='ready');
ok('legacy seçimi projection ile aynı safe shape’i korur',chosen.data.location.lat===undefined&&chosen.data.profileAssessment.responses===undefined);
var staleReceipt={}; Object.keys(receipt).forEach(function(k){staleReceipt[k]=receipt[k];}); staleReceipt.sourceLatestSha=HASH_A;
var stale=P.chooseProjection(snapshot,data,staleReceipt);
ok('SHA uyuşmazlığı stale fallback olur',stale.source==='legacy_fallback'&&stale.reason==='projection_stale');
var missing=P.chooseProjection(null,data,receipt);
ok('projection yoksa legacy fallback olur',missing.source==='legacy_fallback'&&missing.reason==='projection_missing');
var broken=P.chooseProjection('{broken',data,receipt);
ok('projection parse bozuksa panel blank olmaz',broken.source==='legacy_fallback'&&broken.data&&broken.data.days);
var noReceipt=P.chooseProjection(snapshot,data,null);
ok('receipt yoksa projection başarıya yükselmez',noReceipt.source==='legacy_fallback'&&noReceipt.reason==='receipt_missing');
ok('fallback data raw secret taşımaz',!JSON.stringify(noReceipt.data).includes('secret-token')&&!JSON.stringify(noReceipt.data).includes('RAW_PROFILE_ANSWER'));

console.log('[4] Panel status DOM yüzeyi');
function extractFunction(name){
  var start=panelSource.indexOf('function '+name+'(');
  if(start<0) throw new Error(name+' bulunamadı');
  var end=panelSource.indexOf('\nfunction ',start+10);
  return panelSource.slice(start,end<0?panelSource.length:end);
}
var panelContext={
  esc:function(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');},
  String:String,Array:Array,Date:Date,Math:Math
};
vm.runInNewContext(extractFunction('projectionStatusP')+'\n'+extractFunction('statusToneP')+'\n'+extractFunction('panelStatusBadgeHTMLP')+'\n'+extractFunction('panelLegacyBadgeHTMLP')+'\n'+extractFunction('coverageRibbonHTMLP'),panelContext,{filename:'panel-p1-ribbon.js'});
var domHtml=panelContext.coverageRibbonHTMLP({source:'legacy_fallback',reason:'projection_invalid',coverage:cov});
ok('panel bozuk projection durumunu görünür kılar',domHtml.includes('Projection bozuk')&&domHtml.includes('legacy fallback'));
ok('coverage ribbon raw veri DOM’una taşımaz',!domHtml.includes('secret-token')&&!domHtml.includes('RAW_PROFILE_ANSWER')&&!domHtml.includes('41.01'));
ok('panel latest.json için PUT yolu taşımaz',!/data\/latest\.json[\s\S]{0,180}method:["']PUT/.test(panelSource));

console.log('\nPANEL-004 / PANEL-02 result: '+(failed?'FAIL':'PASS')+' ('+passed+' passed, '+failed+' failed)');
if(failed) process.exitCode=1;
