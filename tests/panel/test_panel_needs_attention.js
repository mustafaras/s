// D1.1 (legacy Panel 1 çalışma özeti) — needsAttentionCardHTMLP fixture.
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
function esc(v){ return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

console.log('\n=== D1.1 — needsAttentionCardHTMLP fixture ===\n');

function buildContext(days){
  var context={
    window:{},D:{days:days||{}},Date:Date,JSON:JSON,Array:Array,Object:Object,String:String,Number:Number,Math:Math,isNaN:isNaN,
    icon:function(){return '';},esc:esc
  };
  var parts=['pad','fmt','today','addDays','recOf','needsAttentionCardHTMLP'].map(extractFunction).join('\n');
  vm.runInNewContext(parts,context,{filename:'panel-d1-1-needs-attention.js'});
  return context;
}

console.log('[1] Sakin durum — hiçbir madde tetiklenmez');
var ctxCalm=buildContext({});
var htmlCalm=ctxCalm.needsAttentionCardHTMLP({klass:'ok',txt:'Dusuk risk'},{'cok-iyi':0,'iyi':0,'normal':0,'zorlandim':0,'cok-zorlandim':0},[],0,0,0,null);
ok('sakin mesaj döner',htmlCalm.includes('Şu an dikkat gereken bir şey görünmüyor'));
ok('sakin durumda madde listesi yok',!htmlCalm.includes('<ul'));

console.log('[2] Eksik gün sayısı eşiği');
var ctxMissing=buildContext({});
var htmlMissing=ctxMissing.needsAttentionCardHTMLP({klass:'warn',txt:'Orta risk'},{'cok-iyi':0,'iyi':0,'normal':0,'zorlandim':0,'cok-zorlandim':0},[],3,0,0,null);
ok('missingCount=3 metni içerir',htmlMissing.includes('3 gündür kayıt yok'));

console.log('[3] Son 7 günde SOS');
var todayStr=(function(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})();
var days={}; days[todayStr]={cravingSOSCount:2};
var ctxSos2=buildContext(days);
var htmlSos=ctxSos2.needsAttentionCardHTMLP({klass:'warn',txt:'Orta risk'},{'cok-iyi':0,'iyi':0,'normal':0,'zorlandim':0,'cok-zorlandim':0},[todayStr],0,0,0,null);
ok('SOS metni içerir',htmlSos.includes('2 kez SOS kullanıldı'));

console.log('[4] Zor geçen gün sayısı eşiği');
var ctxTough=buildContext({});
var htmlTough=ctxTough.needsAttentionCardHTMLP({klass:'warn',txt:'Orta risk'},{'cok-iyi':0,'iyi':0,'normal':0,'zorlandim':2,'cok-zorlandim':1},[],0,0,0,null);
ok('zor geçen gün metni içerir',htmlTough.includes('3 gün zor geçmiş'));

console.log('[5] Uyku trendi düşüşü');
var ctxSleep=buildContext({});
var htmlSleep=ctxSleep.needsAttentionCardHTMLP({klass:'warn',txt:'Orta risk'},{'cok-iyi':0,'iyi':0,'normal':0,'zorlandim':0,'cok-zorlandim':0},[],0,4.5,7.2,null);
ok('uyku düşüşü metni içerir',htmlSleep.includes('Uyku ortalaması düşüyor'));
var ctxSleepStable=buildContext({});
var htmlSleepStable=ctxSleepStable.needsAttentionCardHTMLP({klass:'ok',txt:'Dusuk risk'},{'cok-iyi':0,'iyi':0,'normal':0,'zorlandim':0,'cok-zorlandim':0},[],0,7.0,7.2,null);
ok('küçük uyku farkı tetiklenmiyor',!htmlSleepStable.includes('Uyku ortalaması düşüyor'));

console.log('[6] Terapi son kayıt metni');
var ctxTherapy=buildContext({});
var htmlTherapy=ctxTherapy.needsAttentionCardHTMLP({klass:'warn',txt:'Orta risk'},{'cok-iyi':0,'iyi':0,'normal':0,'zorlandim':0,'cok-zorlandim':0},[],0,0,0,'Bugün kayıt yok · son kayıt 5 gün önce');
ok('terapi metni içerir',htmlTherapy.includes('son kayıt 5 gün önce'));

console.log('[7] XSS güvenliği — esc() ile kaçış');
var ctxXss=buildContext({});
var htmlXss=ctxXss.needsAttentionCardHTMLP({klass:'warn',txt:'Orta risk'},{'cok-iyi':0,'iyi':0,'normal':0,'zorlandim':0,'cok-zorlandim':0},[],0,0,0,'<img src=x onerror=alert(1)>');
ok('ham HTML enjekte edilmiyor',!htmlXss.includes('<img src=x'));
ok('kaçışlanmış hali mevcut',htmlXss.includes('&lt;img'));

console.log('[8] En fazla 3 madde gösterilir');
var ctxCap=buildContext({});
var htmlCap=ctxCap.needsAttentionCardHTMLP({klass:'danger',txt:'Yakin takip'},{'cok-iyi':0,'iyi':0,'normal':0,'zorlandim':2,'cok-zorlandim':1},[],5,4.0,7.5,'Terapi notu');
var liCount=(htmlCap.match(/<li /g)||[]).length;
ok('en fazla 3 madde',liCount<=3,'bulunan: '+liCount);

console.log('\nD1.1 needs-attention fixture result: '+(failed?'FAIL':'PASS')+' ('+passed+' passed, '+failed+' failed)');
if(failed) process.exitCode=1;
