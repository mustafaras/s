// D2.1 (legacy Panel 1 çalışma özeti §5) — gizli dev-mode giriş noktası fixture.
// Yalnızca sentetik vm verisi; gerçek ağ, browser, token ve kişisel veri yok.
'use strict';
var fs=require('fs');
var path=require('path');
var vm=require('vm');
var repoRoot=require('../repo-root');
var panelSource=fs.readFileSync(path.join(repoRoot,'panel.js'),'utf8');
var passed=0,failed=0;
function ok(name,condition,detail){ if(condition){passed++;console.log('  ✓ '+name);}else{failed++;console.log('  ✗ '+name+(detail?' — '+detail:''));} }
function extractFunction(name){
  var start=panelSource.indexOf('function '+name+'('); if(start<0) throw new Error(name+' bulunamadı');
  var end=panelSource.indexOf('\nfunction ',start+10);
  return panelSource.slice(start,end<0?panelSource.length:end);
}

console.log('\n=== D2.1 — gizli dev-mode giriş noktası fixture ===\n');

function buildContext(searchStr){
  var toggleCalls=[];
  var context={
    window:{},UI:{devTapCount:0,devTapFirstAt:0,showAuditPage:false,auditReturnScroll:0},
    document:{querySelector:function(){return null;}},
    location:{search:searchStr||''},
    URLSearchParams:URLSearchParams,
    toggleAuditPage:function(show){ toggleCalls.push(show); context.UI.showAuditPage=!!show; },
    render:function(){},
    Date:Date,JSON:JSON
  };
  vm.runInNewContext(['devLogoTapP','initDevModeUrlTriggerP'].map(extractFunction).join('\n'),context,{filename:'panel-d2-1-dev-mode.js'});
  context._toggleCalls=toggleCalls;
  return context;
}

console.log('[1] 5 tıklamadan az toggleAuditPage tetiklemiyor');
var ctx1=buildContext();
for(var i=0;i<4;i++) ctx1.devLogoTapP();
ok('4 tıklamada tetiklenmedi',ctx1._toggleCalls.length===0);

console.log('[2] 5 tıklama (hızlı, 5 saniye içinde) tetikliyor');
var ctx2=buildContext();
for(var j=0;j<5;j++) ctx2.devLogoTapP();
ok('5 tıklamada tetiklendi',ctx2._toggleCalls.length===1&&ctx2._toggleCalls[0]===true);
ok('sayaç tetiklenince sıfırlanır',ctx2.UI.devTapCount===0);

console.log('[3] 5 saniyeden yavaş tıklamalar sayaç sıfırlanır, tetiklenmez');
var ctx3=buildContext();
var realNow=Date.now;
try{
  var t=1000000;
  Date.now=function(){ return t; };
  ctx3.devLogoTapP(); t+=1000; ctx3.devLogoTapP(); t+=1000; ctx3.devLogoTapP();
  t+=6000; // 5sn eşiğini aş
  ctx3.devLogoTapP(); t+=100; ctx3.devLogoTapP();
  ok('sayaç zaman aşımıyla sıfırlanır, 2 tıklamada tetiklenmedi',ctx3._toggleCalls.length===0);
} finally { Date.now=realNow; }

console.log('[4] ?debug=1 ile sayfa yüklendiğinde dev-mode kullanılabilir');
var ctx4=buildContext('?debug=1');
ctx4.initDevModeUrlTriggerP();
ok('debug=1 varken toggleAuditPage(true) çağrılır',ctx4._toggleCalls.length===1&&ctx4._toggleCalls[0]===true);

console.log('[5] debug parametresi yokken tetiklenmez');
var ctx5=buildContext('');
ctx5.initDevModeUrlTriggerP();
ok('debug parametresi yokken tetiklenmez',ctx5._toggleCalls.length===0);

console.log('\nD2.1 dev-mode-trigger fixture result: '+(failed?'FAIL':'PASS')+' ('+passed+' passed, '+failed+' failed)');
if(failed) process.exitCode=1;
