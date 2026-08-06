'use strict';

var fs=require('fs'),path=require('path'),vm=require('vm');
var repoRoot=require('./repo-root');
var panelSource=fs.readFileSync(path.join(repoRoot,'panel.js'),'utf8');
var manifestSource=fs.readFileSync(path.join(repoRoot,'panelCoverageManifest.js'),'utf8');
var passed=0,failed=0;
function ok(name,condition,detail){ if(condition){passed++;console.log('  ✓ '+name);}else{failed++;console.log('  ✗ '+name+(detail?' — '+detail:''));} }
function extractFunction(name){ var start=panelSource.indexOf('function '+name+'('); if(start<0) throw new Error(name+' bulunamadı'); var end=panelSource.indexOf('\nfunction ',start+10); return panelSource.slice(start,end<0?panelSource.length:end); }

var context={Date:Date,Array:Array,Object:Object,String:String,Number:Number,Math:Math,isNaN:isNaN,JSON:JSON};
vm.runInNewContext(extractFunction('locationPointP')+'\n'+extractFunction('locationPointOrderP')+'\n'+extractFunction('googleMapsUrlP')+'\n'+extractFunction('locationContextFromDataP'),context,{filename:'panel-location.js'});

console.log('\n=== PANEL focus/location fixture ===\n');
var source={
  location:{lat:41.01,lng:28.97,acc:30,ts:'2026-08-05T10:00:00.000Z'},
  locationHistory:[
    {lat:41.00,lng:28.96,acc:50,ts:'2026-08-05T09:00:00.000Z'},
    {lat:41.02,lng:28.98,acc:14,ts:'2026-08-05T10:02:00.000Z'}
  ],
  days:{'2026-08-05':{movement:{track:[
    {lat:41.03,lng:28.99,mode:'vehicle',ts:'2026-08-05T10:03:00.000Z'},
    {lat:'bad',lng:28.99,mode:'vehicle',ts:'2026-08-05T10:04:00.000Z'}
  ]}}}
};
var before=JSON.stringify(source), contextResult=context.locationContextFromDataP(source);
ok('location kaynakları immutable okunur',JSON.stringify(source)===before);
ok('en yeni geçerli fix kök/iz/track arasından seçilir',contextResult.fix&&contextResult.fix.lat===41.03&&contextResult.fix.lng===28.99);
ok('geçersiz GPS noktası elenir',contextResult.tracks['2026-08-05'].length===1);
ok('konum geçmişi zaman sırasına alınır',contextResult.history[0].ts==='2026-08-05T09:00:00.000Z'&&contextResult.history[1].ts==='2026-08-05T10:02:00.000Z');
ok('konum bağlamı yalnız harita için gerekli alanları taşır',Object.keys(contextResult).sort().join(',')==='fix,history,tracks');
ok('Google Maps URL helper koordinatları encode eder',context.googleMapsUrlP?context.googleMapsUrlP(41.01,28.97)==='https://www.google.com/maps/search/?api=1&query=41.01,28.97':false);

var manifestContext={window:{},Date:Date,JSON:JSON,Array:Array,Object:Object,String:String,Number:Number,Boolean:Boolean,Math:Math,isNaN:isNaN};
vm.runInNewContext(manifestSource,manifestContext,{filename:'panelCoverageManifest.js'});
var safe=manifestContext.window.PanelCoverageV1.redactForObserver(source);
ok('observer projection raw GPS redaction sınırını korur',safe.location&&!('lat' in safe.location)&&safe.locationHistory.every(function(x){return !('lat' in x)&&!('lng' in x);}));

var renderStart=panelSource.indexOf('function render()'), renderEnd=panelSource.indexOf('\nfunction mapTileLayerByStyleP',renderStart);
var renderSource=panelSource.slice(renderStart,renderEnd);
var initStart=panelSource.indexOf('function initLocMap()'), initEnd=panelSource.indexOf('\nfunction fail(',initStart);
var initSource=panelSource.slice(initStart,initEnd);
context.esc=function(v){ return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); };
context.icon=function(){ return ''; };
context.PROJECTION={sections:{dailyPhoto:{status:'ready',title:'Fotoğraf'},roomContentHistory:{status:'ok',count:2},saygiRoot:{status:'ok',collectionCount:4},locationTiming:{status:'ok',sampleTs:'2026-08-05T10:00:00.000Z'},therapyProvenance:{status:'ok',thoughtCount:0},profileProgress:{status:'completed',responseCount:174},notificationTimeline:{status:'ok',count:24,counts:{delivered:24,read:24}},externalSources:{status:'ok',items:[]},lifecycle:{rootSavedAt:'2026-08-05T10:12:17.000Z'}}};
vm.runInNewContext(extractFunction('p3TimeP')+'\n'+extractFunction('statusToneP')+'\n'+extractFunction('panelToneOverrideP')+'\n'+extractFunction('panelStatusP')+'\n'+extractFunction('panelStatusBadgeHTMLP')+'\n'+extractFunction('p3StatusP')+'\n'+extractFunction('auditRollupStatusP')+'\n'+extractFunction('auditEntryHTMLP'),context,{filename:'panel-audit-entry.js'});
var auditHtml=context.auditEntryHTMLP();
ok('kompakt audit girişi gerçek HTML üretir',auditHtml.includes('Eksik Kök Modüller')&&auditHtml.includes('Terapi · Bildirim · Provenance')&&auditHtml.includes('174 cevap anahtarı')&&auditHtml.includes('Denetim Merkezi'));
// D3.1 (PANEL-DENETIM-MERKEZI-PROMPTLARI.md §4/§9 Faz 3) — auditEntryHTMLP()
// artık render()'ın birincil akışından da çıkarıldı (dev-mode'a taşındı,
// bkz. toggleAuditPage/setAuditTab). Bu assertion'ın özgün amacı korunuyor
// (ağır audit fragmanlarının render()'da tekrar basılmaması) ama artık
// auditEntryHTMLP() de bu listeye dahil — hiçbiri render()'da çağrılmamalı.
ok('normal dashboard audit fragmanlarını basmaz (dev-mode\'a taşındı)',!renderSource.includes('h+=auditEntryHTMLP();')&&!renderSource.includes('h+=rootModulesCardHTMLP();')&&!renderSource.includes('h+=p4ProvenanceCardHTMLP();')&&!renderSource.includes('h+=d4ModuleAtlasHTMLP();'));
ok('audit ayrıntıları sekmeli yüzeye bağlıdır',panelSource.includes('function auditPageHTMLP(')&&panelSource.includes('function setAuditTab(')&&panelSource.includes('function auditPaneHTMLP('));
ok('harita canonical panel fix bağlamını kullanır',initSource.includes('panelLocationP()')&&!initSource.includes('var loc=D&&D.location?D.location:null'));
ok('harita yeniden boyutlandırmayı güvenceye alır',initSource.includes('invalidateSize'));
ok('Google Maps canonical search URL sözleşmesi korunur',panelSource.includes('function googleMapsUrlP(')&&panelSource.includes('https://www.google.com/maps/search/?api=1&query='));

console.log('\nPANEL focus/location fixture result: '+(failed?'FAIL':'PASS')+' ('+passed+' passed, '+failed+' failed)');
if(failed) process.exitCode=1;