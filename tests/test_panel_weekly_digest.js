// D1.3 (PANEL-DENETIM-MERKEZI-PROMPTLARI.md §12.1 A4) — weeklyDigestCardHTMLP fixture.
// Yalnızca sentetik vm verisi; gerçek ağ, browser, token ve kişisel veri yok.
'use strict';
var fs=require('fs');
var path=require('path');
var vm=require('vm');
var repoRoot=require('./repo-root');
var panelSource=fs.readFileSync(path.join(repoRoot,'panel.js'),'utf8');
var passed=0,failed=0;
function ok(name,condition,detail){ if(condition){passed++;console.log('  ✓ '+name);}else{failed++;console.log('  ✗ '+name+(detail?' — '+detail:''));} }
function extractFunction(name){
  var start=panelSource.indexOf('function '+name+'('); if(start<0) throw new Error(name+' bulunamadı');
  var end=panelSource.indexOf('\nfunction ',start+10);
  return panelSource.slice(start,end<0?panelSource.length:end);
}
function esc(v){ return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

console.log('\n=== D1.3 — weeklyDigestCardHTMLP fixture ===\n');

function buildContext(){
  var context={ window:{},Date:Date,JSON:JSON,Array:Array,Object:Object,String:String,Number:Number,Math:Math,isNaN:isNaN,icon:function(){return '';},esc:esc };
  vm.runInNewContext(['trendArrowP','weeklyDigestCardHTMLP'].map(extractFunction).join('\n'),context,{filename:'panel-d1-3-weekly-digest.js'});
  return context;
}

console.log('[1] Uyku artışı → yukarı ok');
var ctx1=buildContext();
var html1=ctx1.weeklyDigestCardHTMLP(3.0,3.0,7.5,6.0,0,0,{sessionCount:5});
ok('uyku artışı metni içerir',html1.includes('uyku ortalaması 7.5 saat ↑'));

console.log('[2] Uyku azalışı → aşağı ok');
var ctx2=buildContext();
var html2=ctx2.weeklyDigestCardHTMLP(3.0,3.0,5.0,7.0,0,0,{sessionCount:5});
ok('uyku azalışı metni içerir',html2.includes('uyku ortalaması 5 saat ↓'));

console.log('[3] Uyku sabit (fark<0.05) → →');
var ctx3=buildContext();
var html3=ctx3.weeklyDigestCardHTMLP(3.0,3.0,7.0,7.02,0,0,{sessionCount:5});
ok('uyku sabit metni içerir',html3.includes('uyku ortalaması 7 saat →'));

console.log('[4] SOS=0 iken "0 SOS oldu" DEMEZ, "SOS olmadı" der');
var ctx4=buildContext();
var html4=ctx4.weeklyDigestCardHTMLP(3.0,3.0,7.0,7.0,0,2,{sessionCount:5});
ok('SOS olmadı metni doğru',html4.includes('SOS olmadı'));
ok('0 SOS oldu YANLIŞ metni yok',!html4.includes('0 kez SOS oldu')&&!html4.includes('0 SOS oldu'));

console.log('[5] SOS>0 iken sayı ve trend gösterilir');
var ctx5=buildContext();
var html5=ctx5.weeklyDigestCardHTMLP(3.0,3.0,7.0,7.0,3,1,{sessionCount:5});
ok('SOS sayısı ve ok metni içerir',html5.includes('3 kez SOS oldu ↑'));

console.log('[6] Ritim geçen haftaya göre sakin/benzer/daha hareketli');
var ctx6=buildContext();
var htmlCalm=ctx6.weeklyDigestCardHTMLP(2.0,4.0,7.0,7.0,0,0,{sessionCount:1});
ok('ritim sakin metni içerir',htmlCalm.includes('geçen haftaya göre sakin'));
var ctx7=buildContext();
var htmlBenzer=ctx7.weeklyDigestCardHTMLP(3.0,3.0,7.0,7.0,0,0,{sessionCount:1});
ok('ritim benzer metni içerir',htmlBenzer.includes('geçen haftaya göre benzer'));

console.log('[7] Uyku kaydı yoksa (curSleep=0) uygun mesaj');
var ctx8=buildContext();
var html8=ctx8.weeklyDigestCardHTMLP(3.0,3.0,0,0,0,0,{sessionCount:1});
ok('uyku kaydı yok metni içerir',html8.includes('uyku kaydı yok'));

console.log('\nD1.3 weekly-digest fixture result: '+(failed?'FAIL':'PASS')+' ('+passed+' passed, '+failed+' failed)');
if(failed) process.exitCode=1;
