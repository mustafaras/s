// PANEL-006 / PANEL-04 — terapi, bildirim lifecycle ve provenance fixture.
// Sentetik vm verisi; gerçek ağ, browser, localStorage ve seyma-data yok.
'use strict';
var fs=require('fs');
var path=require('path');
var vm=require('vm');
var repoRoot=require('./repo-root');
var manifestSource=fs.readFileSync(path.join(repoRoot,'panelCoverageManifest.js'),'utf8');
var panelSource=fs.readFileSync(path.join(repoRoot,'panel.js'),'utf8');
var receipt={status:'accepted',snapshotRevision:'c'.repeat(40),sourceLatestSha:'b'.repeat(40),sourceUpdatedAt:'2026-08-02T14:58:00.000Z',submittedAt:'2026-08-02T14:59:00.000Z',acceptedAt:'2026-08-02T15:00:00.000Z'};
var passed=0,failed=0;
function ok(name,condition,detail){ if(condition){passed++;console.log('  ✓ '+name);}else{failed++;console.log('  ✗ '+name+(detail?' — '+detail:''));} }
var manifestContext={window:{},Date:Date,JSON:JSON,Array:Array,Object:Object,String:String,Number:Number,Boolean:Boolean,Math:Math,isNaN:isNaN};
vm.runInNewContext(manifestSource,manifestContext,{filename:'panelCoverageManifest.js'});
var P=manifestContext.window.PanelCoverageV1;
if(!P){console.error('PanelCoverageV1 yüklenemedi');process.exit(1);}
function fixture(){
  return {version:2,lastOpenedDate:'2026-08-02',savedAt:'2026-08-02T14:58:00.000Z',syncReceipt:receipt,
    profileAssessment:{status:'active',currentItemIndex:12,startedAt:'2026-08-01T10:00:00.000Z',completedAt:null,consent:{version:'v1',acceptedAt:'2026-08-01T09:00:00.000Z',profileProcessingAccepted:true,sensitiveDataAccepted:true,panelSummarySharingAccepted:false},responses:{q1:{value:5,raw:'PROFILE_RAW_RESPONSE_SENTINEL'}},panelSummary:{status:'in_progress'}},
    days:{'2026-08-02':{therapy:{firstStep:{text:'THERAPY_PRIVATE_FIRST_SENTINEL',completedAt:'2026-08-02T08:00:00.000Z'},selfCompassion:{prompt:'THERAPY_PRIVATE_PROMPT_SENTINEL',note:'THERAPY_PRIVATE_COMPASSION_SENTINEL',completedAt:'2026-08-02T08:10:00.000Z'},decision:{optionA:'THERAPY_PRIVATE_OPTION_A_SENTINEL',optionB:'THERAPY_PRIVATE_OPTION_B_SENTINEL',choice:'A',note:'THERAPY_PRIVATE_DECISION_NOTE_SENTINEL',completedAt:'2026-08-02T09:00:00.000Z'},thoughts:[{situation:'THERAPY_PRIVATE_SITUATION_SENTINEL',thought:'THERAPY_PRIVATE_THOUGHT_SENTINEL',evidenceFor:'THERAPY_PRIVATE_EVIDENCE_SENTINEL',evidenceAgainst:'',altThought:'',createdAt:'2026-08-02T09:30:00.000Z'}],dailyWin:{text:'THERAPY_PRIVATE_WIN_SENTINEL',completedAt:'2026-08-02T10:00:00.000Z'},share:{sentAt:'2026-08-02T11:00:00.000Z',deliveredAt:'2026-08-02T11:00:05.000Z',status:'delivered',note:'THERAPY_PRIVATE_SHARE_NOTE_SENTINEL'}},sleep:{windDown:{steps:{light:true,breath:true,dump:false,cool:false},events:[{type:'breath',minutes:4,ts:'2026-08-02T22:00:00.000Z'},{type:'cool',durationSeconds:120,ts:'2026-08-02T22:05:00.000Z'}]},prayer:{fetchError:'network timeout',fetchedAt:''}}}},
    notifications:[{id:'n1',text:'NOTIFICATION_TEXT_SENTINEL',ts:'2026-08-02T12:00:00.000Z',inboxAt:'2026-08-02T12:00:02.000Z',receivedAt:'2026-08-02T12:00:04.000Z',read:true,readAt:'2026-08-02T12:05:00.000Z',synced:true,syncedAt:'2026-08-02T12:06:00.000Z'},{id:'n2',text:'NOTIFICATION_UNREAD_SENTINEL',ts:'2026-08-02T13:00:00.000Z',receivedAt:'2026-08-02T13:00:04.000Z',read:false,retryCount:1,error:'network timeout'},{id:'n3',ts:'2026-08-02T14:00:00.000Z',deleted:true,deletedAt:'2026-08-02T14:02:00.000Z'}],
    aeon:{qa:[{id:'q1',answer:'ANSWER_CONTENT_NOT_IN_TIMELINE',answerMsgId:'ans1',answeredAt:'2026-08-02T13:30:00.000Z',answerReadAt:'2026-08-02T13:35:00.000Z'}]},
    dailyPhoto:{date:'2026-08-02',title:'Foto',license:'CC BY',source:'Wikimedia',pageUrl:'https://example.test/photo',fetchedAt:'2026-08-02T10:00:00.000Z',error:'network timeout'},
    weather:{fetchError:'forbidden',fetchedAt:''}
  };
}
function extractFunction(name){
  var start=panelSource.indexOf('function '+name+'('); if(start<0) throw new Error(name+' bulunamadı');
  var end=panelSource.indexOf('\nfunction ',start+10); return panelSource.slice(start,end<0?panelSource.length:end);
}
var panelContext={PROJECTION_SECTIONS:{},String:String,Array:Array,Date:Date,Math:Math,isNaN:isNaN,icon:function(){return '';},esc:function(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}};
vm.runInNewContext(extractFunction('p3BadgeP')+'\n'+extractFunction('p3TimeP')+'\n'+extractFunction('p3StatusP')+'\n'+extractFunction('p4StageTextP')+'\n'+extractFunction('p4ProvenanceCardHTMLP'),panelContext,{filename:'panel-p4-card.js'});

console.log('\n=== PANEL-006 / PANEL-04 — terapi, bildirim ve provenance fixture ===\n');
console.log('[1] Dolu fixture — sensitive redaction + safe lifecycle');
var full=fixture(), before=JSON.stringify(full), snapshot=P.buildObserverSnapshot(full,receipt,'2026-08-02T15:00:05.000Z'), json=JSON.stringify(snapshot), th=snapshot.sections.therapyProvenance, pp=snapshot.sections.profileProgress, nt=snapshot.sections.notificationTimeline, ex=snapshot.sections.externalSources;
ok('projection source state’i mutate etmez',JSON.stringify(full)===before);
ok('terapi metinleri data/sections projection’a girmez',!json.includes('THERAPY_PRIVATE_'),(json.match(/THERAPY_PRIVATE_[A-Z_]+/g)||[]).join(','));
ok('profil raw response projection’a girmez',!json.includes('PROFILE_RAW_RESPONSE_SENTINEL')&&pp.rawResponses==='redacted');
ok('thought count + güvenli özet + zaman korunur',th.status==='ok'&&th.thoughtCount===1&&th.thoughts[0].summary==='Metin redacted'&&th.thoughts[0].createdAt);
ok('decision choice/completion ve note sınırı korunur',th.decision.choice==='A'&&th.decision.completedAt&&th.decision.noteStatus==='redacted'&&th.decision.note===null);
ok('share sent/delivered ayrıdır, note gizlidir',th.share.status==='delivered'&&th.share.sentAt&&th.share.deliveredAt&&th.share.note===null);
ok('wind-down event tipi/süre ve agregat korunur',th.windDown.eventCount===2&&th.windDown.totalMinutes===6&&th.windDown.completedSteps===2);
ok('profil ilerlemesi consent ile görünür',pp.status==='active'&&pp.responseCount===1&&pp.currentItemIndex===12&&pp.consent.sensitiveDataAccepted===true&&pp.consent.panelSummarySharingAccepted===false);
ok('bildirim delivered/read ayrımı korunur',nt.status==='ok'&&nt.count===4&&nt.events.some(function(x){return x.id==='n2'&&x.status==='delivered'&&!x.readAt;})&&nt.events.some(function(x){return x.id==='n1'&&x.status==='read'&&x.readAt;}));
ok('bildirim deleted/synced/retry/error timeline’da ayrı',nt.counts.deleted===1&&nt.counts.synced===1&&nt.counts.error===1&&nt.events.some(function(x){return x.kind==='aeon_answer'&&x.answerReadAt;}));
ok('inbox/cihaz/okundu stage’leri ayrıdır',nt.events.some(function(x){return x.id==='n1'&&x.stages.some(function(y){return y.name==='inbox';})&&x.deliveredAt&&x.readAt;}));
ok('external fetch hatası missing’e düşmez',ex.status==='error'&&ex.items.some(function(x){return x.name==='Günün fotoğrafı'&&x.status==='error';})&&ex.items.some(function(x){return x.name==='Hava'&&x.errorCode==='forbidden';}));
panelContext.PROJECTION_SECTIONS=snapshot.sections;
var html=panelContext.p4ProvenanceCardHTMLP();
ok('provenance/source/time/privacy badge’leri render olur',html.includes('provenance: user_input')&&html.includes('observer receipt ayrı')&&html.includes('raw responses: redacted')&&html.includes('provenance: external'));
ok('P4 kartı hassas metinleri DOM’a taşımaz',!html.includes('THERAPY_PRIVATE_')&&!html.includes('PROFILE_RAW_RESPONSE')&&!html.includes('ANSWER_CONTENT_'));
ok('P4 kartı delivered ve read dilini ayırır',html.includes('İletildi')&&html.includes('Okundu'));
console.log('[2] Yok + bozuk fixture');
var missing={lastOpenedDate:'2026-08-02',days:{},notifications:[]}, missingSnapshot=P.buildObserverSnapshot(missing,receipt,'2026-08-02T15:00:05.000Z');
ok('yok fixture terapi/profil/bildirim/external durumunu taşır',missingSnapshot.sections.therapyProvenance.status==='missing'&&missingSnapshot.sections.profileProgress.status==='missing'&&missingSnapshot.sections.notificationTimeline.status==='missing'&&missingSnapshot.sections.externalSources.status==='missing');
panelContext.PROJECTION_SECTIONS=missingSnapshot.sections;
ok('yok fixture kartı çökmeksizin render olur',panelContext.p4ProvenanceCardHTMLP().includes('Terapi araçları')&&panelContext.p4ProvenanceCardHTMLP().includes('Kayıt yok'));
var broken=fixture(); broken.days['2026-08-02'].therapy.thoughts=[null]; broken.days['2026-08-02'].sleep.windDown.events=[null]; broken.notifications=[null]; broken.profileAssessment.responses='broken';
var brokenSnapshot=P.buildObserverSnapshot(broken,receipt,'2026-08-02T15:00:05.000Z');
ok('bozuk terapi/event/bildirim yapısı fail-safe görünür',brokenSnapshot.sections.therapyProvenance.status==='malformed'&&brokenSnapshot.sections.therapyProvenance.windDown.status==='malformed'&&brokenSnapshot.sections.notificationTimeline.status==='malformed');
ok('bozuk profil response tipi raw üretmez',brokenSnapshot.sections.profileProgress.rawResponses==='redacted'&&!JSON.stringify(brokenSnapshot).includes('THERAPY_PRIVATE_'));

console.log('[3] Eski terapi kaydı — stale (bugün kayıt yok, geçmişte var)');
var staleTherapy={lastOpenedDate:'2026-08-10',days:{'2026-08-01':{therapy:{thoughts:[{situation:'s',thought:'t',createdAt:'2026-08-01T09:00:00.000Z'}]}}},notifications:[]};
var staleTherapySnapshot=P.buildObserverSnapshot(staleTherapy,receipt,'2026-08-10T15:00:05.000Z');
ok('8 gün önceki terapi kaydı stale olur, missing değil',staleTherapySnapshot.sections.therapyProvenance.status==='stale'&&staleTherapySnapshot.sections.therapyProvenance.lastRecordedDate==='2026-08-01'&&staleTherapySnapshot.sections.therapyProvenance.daysSinceLastRecord===9);
ok('stale terapi ham düşünce metni sızdırmaz',!JSON.stringify(staleTherapySnapshot).includes('"t"')&&staleTherapySnapshot.sections.therapyProvenance.thoughts.length===0);
panelContext.PROJECTION_SECTIONS=staleTherapySnapshot.sections;
var staleTherapyHtml=panelContext.p4ProvenanceCardHTMLP();
ok('stale terapi kartında Eski cache rozeti görünür',staleTherapyHtml.includes('Eski cache'));
var recentTherapy={lastOpenedDate:'2026-08-10',days:{'2026-08-08':{therapy:{thoughts:[{situation:'s',thought:'t',createdAt:'2026-08-08T09:00:00.000Z'}]}}},notifications:[]};
var recentTherapySnapshot=P.buildObserverSnapshot(recentTherapy,receipt,'2026-08-10T15:00:05.000Z');
ok('2 gün önceki terapi kaydı eşiği aşmaz, stale olmaz',recentTherapySnapshot.sections.therapyProvenance.status==='missing'&&recentTherapySnapshot.sections.therapyProvenance.daysSinceLastRecord===2);
ok('hiç terapi kaydı olmayan fixture regresyonsuz missing kalır',missingSnapshot.sections.therapyProvenance.status==='missing'&&missingSnapshot.sections.therapyProvenance.lastRecordedDate===null);

console.log('\nPANEL-006 / PANEL-04 result: '+(failed?'FAIL':'PASS')+' ('+passed+' passed, '+failed+' failed)');
if(failed) process.exitCode=1;
