// D1.4 (PANEL-DENETIM-MERKEZI-PROMPTLARI.md §12.1 A2) — monthlyHeatmapCardHTMLP fixture.
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

console.log('\n=== D1.4 — monthlyHeatmapCardHTMLP fixture ===\n');

var FN_NAMES=['pad','recOf','monthDaysP','shiftMonthP','setPanelMonthP','monthlyHeatmapCardHTMLP'];
function buildContext(days){
  var context={
    window:{},D:{days:days||{}},UI:{month:null},render:function(){},
    MOOD_LABEL:{"cok-iyi":"Çok iyi","iyi":"İyi","normal":"Normal","zorlandim":"Zorlandım","cok-zorlandim":"Çok zorlandım"},
    Date:Date,JSON:JSON,Array:Array,Object:Object,String:String,Number:Number,Math:Math,isNaN:isNaN,
    icon:function(){return '';},esc:esc
  };
  vm.runInNewContext(FN_NAMES.map(extractFunction).join('\n'),context,{filename:'panel-d1-4-monthly-heatmap.js'});
  return context;
}

console.log('[1] 31 günlük ay (Ocak 2026) — 31 hücre');
var ctx1=buildContext({});
var html1=ctx1.monthlyHeatmapCardHTMLP('2026-01');
var cells1=(html1.match(/class="monthly-heatmap-cell"/g)||[]).length;
ok('31 hücre üretir',cells1===31,'bulunan: '+cells1);

console.log('[2] Şubat 2026 (artık yıl değil) — 28 hücre');
var ctx2=buildContext({});
var html2=ctx2.monthlyHeatmapCardHTMLP('2026-02');
var cells2=(html2.match(/class="monthly-heatmap-cell"/g)||[]).length;
ok('28 hücre üretir (2026 artık yıl değil)',cells2===28,'bulunan: '+cells2);

console.log('[3] Şubat 2028 (artık yıl) — 29 hücre');
var ctx3=buildContext({});
var html3=ctx3.monthlyHeatmapCardHTMLP('2028-02');
var cells3=(html3.match(/class="monthly-heatmap-cell"/g)||[]).length;
ok('29 hücre üretir (2028 artık yıl)',cells3===29,'bulunan: '+cells3);

console.log('[4] 30 günlük ay (Nisan 2026) — 30 hücre');
var ctx4=buildContext({});
var html4=ctx4.monthlyHeatmapCardHTMLP('2026-04');
var cells4=(html4.match(/class="monthly-heatmap-cell"/g)||[]).length;
ok('30 hücre üretir',cells4===30,'bulunan: '+cells4);

console.log('[5] SOS günü işaretleniyor');
var ctx5=buildContext({'2026-01-15':{mood:'zorlandim',cravingSOSCount:2}});
var html5=ctx5.monthlyHeatmapCardHTMLP('2026-01');
ok('SOS badge görünür',html5.includes('2 SOS'));

console.log('[6] Veri olmayan gün hata fırlatmadan nötr render edilir');
var ctx6=buildContext({});
var html6;
try{ html6=ctx6.monthlyHeatmapCardHTMLP('2026-03'); }catch(e){ html6=null; }
ok('hata fırlatmadan render edilir',html6!==null);
ok('boş günler nötr arkaplan kullanır',html6.includes('var(--s1)'));

console.log('[7] Ay değiştirme kontrolleri render edilir');
var ctx7=buildContext({});
var html7=ctx7.monthlyHeatmapCardHTMLP('2026-06');
ok('önceki/sonraki ay butonları var',html7.includes("setPanelMonthP('2026-05')")&&html7.includes("setPanelMonthP('2026-07')"));

console.log('[8] Yıl sınırı geçişi (Aralık→Ocak, Ocak→Aralık)');
var ctx8=buildContext({});
ok('Aralık→Ocak yıl artışı',ctx8.shiftMonthP('2026-12',1)==='2027-01');
ok('Ocak→Aralık yıl azalışı',ctx8.shiftMonthP('2026-01',-1)==='2025-12');

console.log('\nD1.4 monthly-heatmap fixture result: '+(failed?'FAIL':'PASS')+' ('+passed+' passed, '+failed+' failed)');
if(failed) process.exitCode=1;
