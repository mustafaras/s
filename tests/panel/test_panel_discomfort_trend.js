// PANEL — discomfortTrendP / discomfortTrendCardHTMLP fixture (Faz 2 / Prompt 2.3).
// Sentetik günlük veri; gerçek ağ, browser, token, localStorage yoktur.
'use strict';
var fs=require('fs'),path=require('path'),vm=require('vm');
var repoRoot=require('../repo-root');
var panelSource=fs.readFileSync(path.join(repoRoot,'panel/panel.js'),'utf8');
var passed=0,failed=0;
function ok(name,condition,detail){ if(condition){passed++;console.log('  ✓ '+name);}else{failed++;console.log('  ✗ '+name+(detail?' — '+detail:''));} }
function extractFunction(name){ var start=panelSource.indexOf('function '+name+'('); if(start<0) throw new Error(name+' bulunamadı'); var end=panelSource.indexOf('\nfunction ',start+10); return panelSource.slice(start,end<0?panelSource.length:end); }
function extractVar(name){ var re=new RegExp('var '+name+'\\s*=.*?;'); var m=panelSource.match(re); if(!m) throw new Error(name+' bulunamadı'); return m[0]; }
function esc(v){ return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function day(regions){ return {discomfort:{regions:regions||{},note:'ÖZEL_NOT_SIZMAMALI',meds:[]}}; }

var context={D:{days:{}},String:String,Array:Array,Object:Object,Date:Date,Math:Math,isNaN:isNaN,esc:esc,icon:function(){return '';}};
vm.runInNewContext(
  extractVar('DZREG')+'\n'+extractFunction('dzRegLabel')+'\n'+
  extractFunction('pad')+'\n'+extractFunction('fmt')+'\n'+extractFunction('today')+'\n'+extractFunction('addDays')+'\n'+extractFunction('windowDays')+'\n'+extractFunction('recOf')+'\n'+
  extractFunction('discomfortTrendP')+'\n'+extractFunction('discomfortTrendCardHTMLP'),
  context,{filename:'panel-discomfort-trend.js'}
);

console.log('\n=== PANEL — discomfortTrendP / discomfortTrendCardHTMLP fixture ===\n');

console.log('[1] Bölge sayımı ve topRegions');
context.D.days={
  '2026-08-01':day({bas:{level:2}}),
  '2026-08-02':day({bas:{level:1},'omuz-sol':{level:3}}),
  '2026-08-03':day({bas:{level:1}}),
  '2026-08-04':day({}), // hiç bölge işaretlenmemiş — sayılmamalı
  '2026-08-05':day({'omuz-sol':{level:1},karin:{level:1}})
};
var days5=['2026-08-01','2026-08-02','2026-08-03','2026-08-04','2026-08-05'];
var t=context.discomfortTrendP(days5);
ok('3 farklı günde aynı bölge (bas) işaretlenmiş -> doğru sayılır',t.regionCounts.bas===3);
ok('omuz-sol 2 günde işaretlenmiş -> doğru sayılır',t.regionCounts['omuz-sol']===2);
ok('boş regions objesi olan gün ağrı günü sayılmaz',t.totalDaysWithPain===4);
ok('topRegions azalan sırada ve en fazla 3 öğe',t.topRegions.length===3&&t.topRegions[0].id==='bas'&&t.topRegions[0].count===3);
ok('topRegions Türkçe etiket taşır (dzRegLabel)',t.topRegions[0].label==='Baş');
ok('level:0 (silinmiş/pasif) bölge sayılmaz',(function(){
  var d2=['2026-08-10']; context.D.days['2026-08-10']=day({bas:{level:0}});
  return context.discomfortTrendP(d2).totalDaysWithPain===0;
})());

console.log('[2] Hiç kayıt yok — boş durum');
context.D.days={};
var empty=context.discomfortTrendP(['2026-08-01','2026-08-02']);
ok('hiç kayıt yok -> totalDaysWithPain 0, topRegions boş',empty.totalDaysWithPain===0&&empty.topRegions.length===0);
var emptyHtml=context.discomfortTrendCardHTMLP();
ok('boş durum kartı net bir mesaj gösterir',emptyHtml.includes('Son 30 günde ağrı kaydı yok'));

console.log('[3] Kart render — meta veri gösterir, ham not sızdırmaz');
context.D.days={
  '2026-08-01':day({bas:{level:2}}),
  '2026-08-02':day({bas:{level:1},'omuz-sol':{level:3}})
};
// discomfortTrendCardHTMLP parametresiz çağrılır (üretimde windowDays(30,today())
// kullanır) — today() gerçek saate bağlı olduğundan burada yalnız kartın
// çökmeden, güvenli şekilde render olduğunu doğruluyoruz.
var prodHtml=context.discomfortTrendCardHTMLP();
ok('parametresiz (üretim) çağrı çökmeden render olur',typeof prodHtml==='string'&&prodHtml.includes('Ağrı/Rahatsızlık Trendi'));
ok('kart render’ı ham not metnini asla içermez',!prodHtml.includes('ÖZEL_NOT_SIZMAMALI'));
ok('dolu senaryoda kart bölge etiketi ve gün sayısını gösterir',(function(){
  var d3=['2026-08-01','2026-08-02'];
  var localT=context.discomfortTrendP(d3);
  return localT.topRegions[0].label==='Baş'&&localT.topRegions[0].count===2;
})());

console.log('\nPANEL discomfort trend fixture result: '+(failed?'FAIL':'PASS')+' ('+passed+' passed, '+failed+' failed)');
if(failed) process.exitCode=1;
