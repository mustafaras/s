// D1.5 (legacy Panel 1 çalışma özeti §12.1 A6) — milestoneRibbonHTMLP fixture.
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

console.log('\n=== D1.5 — milestoneRibbonHTMLP fixture ===\n');

function buildContext(days,startDate){
  var context={
    window:{},D:{days:days||{},startDate:startDate||'2026-01-01'},
    Date:Date,JSON:JSON,Array:Array,Object:Object,String:String,Number:Number,Math:Math,isNaN:isNaN,
    icon:function(){return '';},esc:esc
  };
  vm.runInNewContext(['pad','fmt','today','addDays','diff','recOf','sosFreeStreakP','milestoneRibbonHTMLP'].map(extractFunction).join('\n'),context,{filename:'panel-d1-5-milestones.js'});
  return context;
}

console.log('[1] Yeni seri rekoru (streak===best>=7) rozeti görünür');
var ctx1=buildContext({});
var html1=ctx1.milestoneRibbonHTMLP(7,7,0,0);
ok('seri rekoru metni içerir',html1.includes('Yeni seri rekoru! 7 gün'));

console.log('[2] streak=5 (eşik altı) iken hiçbir rozet görünmez, kart tamamen boş');
var ctx2=buildContext({});
var html2=ctx2.milestoneRibbonHTMLP(5,5,0,0);
ok('boş string döner',html2==='');

console.log('[3] sosFreeStreak=30 iken ilgili rozet görünür');
var ctx3=buildContext({});
var html3=ctx3.milestoneRibbonHTMLP(3,7,0,30);
ok('SOS-suz rozeti görünür',html3.includes("30 gündür SOS'suz"));

console.log('[4] sosFreeStreak=29 (eşik altı) iken rozet görünmez');
var ctx4=buildContext({});
var html4=ctx4.milestoneRibbonHTMLP(3,7,0,29);
ok('29 günde rozet yok',!html4.includes("SOS'suz"));

console.log('[5] Terapi kullanım eşikleri (10/25/50) tam eşleşince rozet görünür');
[10,25,50].forEach(function(n){
  var ctxN=buildContext({});
  var htmlN=ctxN.milestoneRibbonHTMLP(3,7,n,0);
  ok('therapyUsageCount='+n+' rozeti görünür',htmlN.includes('Terapi aracını '+n+'. kez kullandın'));
});

console.log('[6] Terapi kullanım eşiği dışı (11) rozet göstermez');
var ctx6=buildContext({});
var html6=ctx6.milestoneRibbonHTMLP(3,7,11,0);
ok('11. kullanımda rozet yok',!html6.includes('Terapi aracını'));

console.log('[7] sosFreeStreakP — bugünden geriye SOS olmayan gün sayısı');
var days7={}; days7['2026-08-04']={cravingSOSCount:1};
var ctx7=buildContext(days7,'2026-08-01');
// today() gerçek sistem tarihini kullanır; bu yüzden yalnızca fonksiyonun
// hata fırlatmadan ve negatif olmayan bir sayı döndürdüğünü doğruluyoruz.
var streakVal=ctx7.sosFreeStreakP();
ok('sosFreeStreakP sayısal ve negatif değil',typeof streakVal==='number'&&streakVal>=0);

console.log('\nD1.5 milestones fixture result: '+(failed?'FAIL':'PASS')+' ('+passed+' passed, '+failed+' failed)');
if(failed) process.exitCode=1;
