// PANEL-005 / PANEL-03 — eksik kök modüller projection/render fixture.
// Sentetik vm verisi; gerçek ağ, browser, localStorage ve seyma-data yok.
'use strict';
var fs=require('fs');
var path=require('path');
var vm=require('vm');
var repoRoot=require('./repo-root');
var manifestSource=fs.readFileSync(path.join(repoRoot,'panelCoverageManifest.js'),'utf8');
var panelSource=fs.readFileSync(path.join(repoRoot,'panel.js'),'utf8');
var HASH_A='a'.repeat(40), HASH_B='b'.repeat(40), HASH_C='c'.repeat(40);
var receipt={status:'accepted',snapshotRevision:HASH_C,sourceLatestSha:HASH_B,sourceUpdatedAt:'2026-08-02T14:58:00.000Z',submittedAt:'2026-08-02T14:59:00.000Z',acceptedAt:'2026-08-02T15:00:00.000Z'};
var passed=0,failed=0;
function ok(name,condition,detail){ if(condition){passed++;console.log('  ✓ '+name);}else{failed++;console.log('  ✗ '+name+(detail?' — '+detail:''));} }
var manifestContext={window:{},Date:Date,JSON:JSON,Array:Array,Object:Object,String:String,Number:Number,Boolean:Boolean,Math:Math,isNaN:isNaN};
vm.runInNewContext(manifestSource,manifestContext,{filename:'panelCoverageManifest.js'});
var P=manifestContext.window.PanelCoverageV1;
if(!P){console.error('PanelCoverageV1 yüklenemedi');process.exit(1);}
function base(){
  return {version:2,startDate:'2026-08-01',lastOpenedDate:'2026-08-02',lastOpenedAt:'2026-08-02T14:57:00.000Z',savedAt:'2026-08-02T14:58:00.000Z',lastSyncDate:'2026-08-02',syncReceipt:receipt,
    settings:{locationEnabled:false,locationMode:'auto',caffeineMode:'standard',targetBed:'23:30',hideLocationCard:false,hideRepoBanner:false,profileAssessmentInactive:true,aeonNotifyPermission:'default',prayer:{method:'diyanet',remindersEnabled:true},magnesium:{enabled:true}},
    dailyPhoto:{date:'2026-08-02',url:'https://upload.wikimedia.org/photo.jpg',title:'Işık ve form',artist:'Bir sanatçı',license:'CC BY-SA 4.0',source:'Wikimedia Commons',pageUrl:'https://commons.wikimedia.org/wiki/File:photo.jpg',fetchedAt:'2026-08-02T10:00:00.000Z'},
    roomContentHistory:{'2026-08-02':{read:{title:'Bir Kitap',creator:'Yazar',year:2020,source:'Katalog',url:'https://example.test/book'},watch:{title:'Bir Film',creator:'Yönetmen',year:2021,source:'Katalog',url:'https://example.test/film'},listen:{title:'Bir Ses',creator:'Sunucu',year:2022,source:'Katalog',url:'https://example.test/audio'},shownAt:'2026-08-02T12:00:00.000Z'}},
    saygi:{collection:{p1:{name:'Öncü Bir',field:'Bilim',readAt:'2026-08-02T09:00:00.000Z',favorite:true}},streak:1,lastReadDate:'2026-08-02'},
    days:{'2026-08-02':{saygi:{personId:'p1',readAt:'2026-08-02T09:00:00.000Z'},movement:{track:[{lat:41.01,lng:28.97,ts:'2026-08-02T11:00:00.000Z'}]}}},
    locNudge:{shownCount:3,dismissCount:2,dismissStreak:2,dayCount:1,dayKey:'2026-08-02',lastShownAt:'2026-08-02T08:00:00.000Z',snoozeUntil:'2026-08-02T18:00:00.000Z',optOutDay:'',optedOut:false},
    location:{lat:41.01,lng:28.97,acc:8,ts:'2026-08-02T11:00:00.000Z'},locationLastTs:'2026-08-02T11:00:01.000Z'
  };
}
function extractFunction(name){
  var start=panelSource.indexOf('function '+name+'('); if(start<0) throw new Error(name+' bulunamadı');
  var end=panelSource.indexOf('\nfunction ',start+10); return panelSource.slice(start,end<0?panelSource.length:end);
}
var panelContext={
  PROJECTION:{sections:{},state:{source:'projection',reason:'ready',snapshot:null,data:null,coverage:null},sectionFetchState:{ok:true,lastError:null,failedAt:null}},
  String:String,Array:Array,Date:Date,Math:Math,isNaN:isNaN,
  icon:function(){return '';},
  esc:function(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
};
vm.runInNewContext('var STALE_WARN_DAYS=1, STALE_DANGER_DAYS=7;\n'+extractFunction('p3BadgeP')+'\n'+extractFunction('p3TimeP')+'\n'+extractFunction('statusToneP')+'\n'+extractFunction('panelToneOverrideP')+'\n'+extractFunction('panelStatusP')+'\n'+extractFunction('panelStatusBadgeHTMLP')+'\n'+extractFunction('p3StatusP')+'\n'+extractFunction('stalenessBadgeP')+'\n'+extractFunction('emptyStateReasonP')+'\n'+extractFunction('emptyStateNoteHTMLP')+'\n'+extractFunction('p3SettingsSummaryP')+'\n'+extractFunction('rootModulesCardHTMLP'),panelContext,{filename:'panel-p3-card.js'});

console.log('\n=== PANEL-005 / PANEL-03 — eksik kök modül fixture ===\n');
console.log('[1] Dolu fixture — all targets + source/privacy badges');
var full=base(), before=JSON.stringify(full), fullSnapshot=P.buildObserverSnapshot(full,receipt,'2026-08-02T15:00:05.000Z'), fullJson=JSON.stringify(fullSnapshot);
ok('projection üretimi source state’i mutate etmez',JSON.stringify(full)===before);
ok('dailyPhoto hazır yalnız lisans/kaynakla',fullSnapshot.sections.dailyPhoto.status==='ready'&&fullSnapshot.sections.dailyPhoto.ready===true);
ok('room history üç içerik gösterimini taşır',fullSnapshot.sections.roomContentHistory.count===3&&fullSnapshot.sections.roomContentHistory.records.every(function(x){return x.shownAt&&x.source;}));
ok('Saygı root + daily evidence eşleşir',fullSnapshot.sections.saygiRoot.status==='ok'&&!fullSnapshot.sections.saygiRoot.mismatch&&fullSnapshot.sections.saygiRoot.dailyLatestReadDate==='2026-08-02');
ok('locNudge audit ve backoff taşınır',fullSnapshot.sections.locNudge.shownCount===3&&fullSnapshot.sections.locNudge.dismissCount===2&&fullSnapshot.sections.locNudge.derivedBackoffHours===4);
ok('location sample/process/sync ayrı taşınır',fullSnapshot.sections.locationTiming.sampleTs&&fullSnapshot.sections.locationTiming.processedTs&&fullSnapshot.sections.locationTiming.syncAcceptedAt);
ok('lastOpened/root savedAt/settings summary taşınır',fullSnapshot.sections.lifecycle.lastOpenedDate==='2026-08-02'&&fullSnapshot.sections.lifecycle.rootSavedAt&&fullSnapshot.sections.lifecycle.settings.changedAt);
ok('raw daily GPS track projection’a girmez',!fullJson.includes('41.01')&&!fullJson.includes('28.97'));
panelContext.PROJECTION.sections=fullSnapshot.sections;
var fullHtml=panelContext.rootModulesCardHTMLP();
ok('dolu fixture panel kartında render olur',fullHtml.includes('Günün fotoğrafı')&&fullHtml.includes('Terapi Odası geçmişi')&&fullHtml.includes('Konum nudge audit'));
ok('source/privacy badges görünür',fullHtml.includes('data.dailyPhoto')&&fullHtml.includes('root: data.saygi')&&fullHtml.includes('GPS track redacted')&&fullHtml.includes('per-key audit yok'));
ok('izinli ayar özeti source zamanıyla görünür',fullHtml.includes('Ayar source zaman')&&fullHtml.includes('Konum modu')&&fullHtml.includes('Profil pasif'));

console.log('[2] Eski/stale fixture');
var stale=base(); stale.dailyPhoto.date='2026-08-01'; stale.dailyPhoto.fetchedAt='2026-08-01T10:00:00.000Z'; stale.roomContentHistory['2026-08-02'].shownAt='2025-01-01T12:00:00.000Z'; stale.saygi.lastReadDate='2025-01-01'; stale.days['2026-08-02'].saygi.readAt='2025-01-01T09:00:00.000Z'; stale.locNudge.lastShownAt='2025-01-01T08:00:00.000Z'; stale.location.ts='2025-01-01T11:00:00.000Z'; stale.locationLastTs='2025-01-01T11:00:01.000Z'; stale.savedAt='2025-01-01T12:00:00.000Z';
var staleSnapshot=P.buildObserverSnapshot(stale,receipt,'2026-08-02T15:00:05.000Z');
ok('stale fotoğraf kaynaklı olarak ayrılır',staleSnapshot.sections.dailyPhoto.status==='stale'&&staleSnapshot.sections.dailyPhoto.ready===false);
panelContext.PROJECTION.sections=staleSnapshot.sections;
var staleHtml=panelContext.rootModulesCardHTMLP();
ok('stale cache panelde hazır iddiası kullanmaz',staleHtml.includes('Eski cache')&&staleHtml.includes('Hazır değil'));
ok('eski kök tarihleri kaybolmadan render edilir',staleSnapshot.sections.roomContentHistory.records.length===3&&staleSnapshot.sections.lifecycle.rootSavedAt&&staleHtml.includes('2025-01-01'));

console.log('[3] Yok fixture');
var missing=base(); delete missing.dailyPhoto; delete missing.roomContentHistory; delete missing.saygi; delete missing.locNudge; delete missing.location; delete missing.locationLastTs; delete missing.days;
var missingSnapshot=P.buildObserverSnapshot(missing,receipt,'2026-08-02T15:00:05.000Z');
ok('dailyPhoto yok durumu',missingSnapshot.sections.dailyPhoto.status==='missing');
ok('room history yok durumu',missingSnapshot.sections.roomContentHistory.status==='missing');
ok('Saygı yok durumu',missingSnapshot.sections.saygiRoot.status==='missing');
ok('nudge/location timing yok durumu',missingSnapshot.sections.locNudge.status==='missing'&&missingSnapshot.sections.locationTiming.status==='missing'&&missingSnapshot.sections.locationTiming.sampleTs===null&&missingSnapshot.sections.locationTiming.processedTs===null);
panelContext.PROJECTION.sections=missingSnapshot.sections;
var missingHtml=panelContext.rootModulesCardHTMLP();
ok('yok fixture tüm hedef kartlarını boş durumla render eder',missingHtml.includes('Günün fotoğrafı')&&missingHtml.includes('Yok')&&missingHtml.includes('Konum zaman ayrımı'));

console.log('[4] Bozuk + Saygı mismatch fixture');
var broken=base(); broken.dailyPhoto='broken'; broken.roomContentHistory={bad:null}; broken.saygi={collection:'broken',streak:'NaN',lastReadDate:'2026-08-01'}; broken.locNudge={shownCount:'bad',dismissStreak:'bad'}; broken.locationLastTs='bad'; broken.days={'2026-08-02':{saygi:{personId:'p2',readAt:'2026-08-02T09:00:00.000Z'}}};
var brokenSnapshot=P.buildObserverSnapshot(broken,receipt,'2026-08-02T15:00:05.000Z');
ok('bozuk dailyPhoto çökmek yerine missing olur',brokenSnapshot.sections.dailyPhoto.status==='missing');
ok('bozuk room history malformed olur',brokenSnapshot.sections.roomContentHistory.status==='malformed');
ok('bozuk nudge malformed olur',brokenSnapshot.sections.locNudge.status==='malformed');
ok('bozuk location timing malformed olur',brokenSnapshot.sections.locationTiming.status==='malformed');
ok('root/daily Saygı farkı ayrı alarm olur',brokenSnapshot.sections.saygiRoot.mismatch===true&&brokenSnapshot.sections.saygiRoot.mismatchReasons.length>0);
panelContext.PROJECTION.sections=brokenSnapshot.sections;
var brokenHtml=panelContext.rootModulesCardHTMLP();
ok('mismatch alarmı panelde görünür',brokenHtml.includes('Uyuşmazlık')&&brokenHtml.includes('Root ve günlük read kanıtı uyuşmuyor'));
ok('render yolu source backfill çağırmıyor',panelSource.indexOf('backfillSoulArchiveFromDaysP();')<0);

console.log('[5] Konum örneği eski — stale');
var staleLoc=base(); staleLoc.lastOpenedDate='2026-08-10'; staleLoc.location.ts='2026-08-02T11:00:00.000Z'; staleLoc.locationLastTs='2026-08-02T11:00:01.000Z';
var staleLocSnapshot=P.buildObserverSnapshot(staleLoc,receipt,'2026-08-10T15:00:05.000Z');
ok('8 gün önceki konum örneği stale olur',staleLocSnapshot.sections.locationTiming.status==='stale'&&staleLocSnapshot.sections.locationTiming.daysSinceLastSample===8);
panelContext.PROJECTION.sections=staleLocSnapshot.sections;
var staleLocHtml=panelContext.rootModulesCardHTMLP();
ok('stale konum kartında Eski cache rozeti görünür',staleLocHtml.includes('Eski cache'));
var recentLoc=base(); recentLoc.lastOpenedDate='2026-08-03'; recentLoc.location.ts='2026-08-02T11:00:00.000Z'; recentLoc.locationLastTs='2026-08-02T11:00:01.000Z';
var recentLocSnapshot=P.buildObserverSnapshot(recentLoc,receipt,'2026-08-03T15:00:05.000Z');
ok('1 gün önceki konum örneği eşiği aşmaz, stale olmaz',recentLocSnapshot.sections.locationTiming.status==='ok'&&recentLocSnapshot.sections.locationTiming.daysSinceLastSample===1);

console.log('[6] Boş durum kategorileri — hiç kullanılmadı / senkron bekleniyor / hata');
panelContext.PROJECTION.state={source:'projection',reason:'ready',snapshot:null,data:null,coverage:null};
panelContext.PROJECTION.sectionFetchState={ok:true,lastError:null,failedAt:null};
ok('hiç kullanılmamış modül -> unused metni',panelContext.emptyStateReasonP('missing').kind==='unused'&&panelContext.emptyStateReasonP('missing').text.includes('henüz kullanılmamış'));
panelContext.PROJECTION.sectionFetchState={ok:false,lastError:'network',failedAt:'2026-08-05T10:00:00.000Z'};
ok('section_fetch_failed durumunda -> pending metni',panelContext.emptyStateReasonP('missing').kind==='pending'&&panelContext.emptyStateReasonP('missing').text.includes('Senkron bekleniyor'));
panelContext.PROJECTION.sectionFetchState={ok:true,lastError:null,failedAt:null};
panelContext.PROJECTION.state={source:'legacy_fallback',reason:'projection_invalid',snapshot:null,data:null,coverage:null};
ok('projection_invalid durumunda -> error metni',panelContext.emptyStateReasonP('missing').kind==='error'&&panelContext.emptyStateReasonP('missing').text.includes('hata'));
ok('missing olmayan status için null döner (ok/malformed/stale kendi mesajı korunur)',panelContext.emptyStateReasonP('ok')===null&&panelContext.emptyStateReasonP('malformed')===null&&panelContext.emptyStateReasonP('stale')===null);
ok('üç kategori metni birbirinden farklı',new Set(['unused','pending','error'].map(function(k){ var st=k==='pending'?{ok:false}:{ok:true}; panelContext.PROJECTION.sectionFetchState=st; panelContext.PROJECTION.state={reason:k==='error'?'projection_invalid':'ready'}; return panelContext.emptyStateReasonP('missing').text; })).size===3);
panelContext.PROJECTION.state={source:'projection',reason:'ready',snapshot:null,data:null,coverage:null};
panelContext.PROJECTION.sectionFetchState={ok:false,lastError:'network',failedAt:'2026-08-05T10:00:00.000Z'};
var emptyRoom=base(); delete emptyRoom.roomContentHistory;
var emptyRoomSnapshot=P.buildObserverSnapshot(emptyRoom,receipt,'2026-08-05T15:00:00.000Z');
panelContext.PROJECTION.sections=emptyRoomSnapshot.sections;
ok('kart seviyesinde de pending metni gerçekten render ediliyor (uçtan uca)',panelContext.rootModulesCardHTMLP().includes('Senkron bekleniyor · veri gelmiş olabilir'));

console.log('\nPANEL-005 / PANEL-03 result: '+(failed?'FAIL':'PASS')+' ('+passed+' passed, '+failed+' failed)');
if(failed) process.exitCode=1;
