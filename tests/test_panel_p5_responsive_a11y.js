// PANEL-014 / PANEL-12 — D5 responsive, accessibility ve motion fixture.
// Sentetik CSS/HTML/DOM sözleşmesi; browser, ağ, token, localStorage ve kişisel veri yoktur.
'use strict';
var fs=require('fs'),path=require('path'),vm=require('vm');
var repoRoot=require('./repo-root');
var panelSource=fs.readFileSync(path.join(repoRoot,'panel.js'),'utf8');
var cssSource=fs.readFileSync(path.join(repoRoot,'panel.css'),'utf8');
var htmlSource=fs.readFileSync(path.join(repoRoot,'panel.html'),'utf8');
var passed=0,failed=0;
function ok(name,condition,detail){ if(condition){passed++;console.log('  ✓ '+name);}else{failed++;console.log('  ✗ '+name+(detail?' — '+detail:''));} }
function extractFunction(name){ var start=panelSource.indexOf('function '+name+'('); if(start<0) throw new Error(name+' bulunamadı'); var end=panelSource.indexOf('\nfunction ',start+10); return panelSource.slice(start,end<0?panelSource.length:end); }
function esc(v){ return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function contrast(hexA,hexB){
  function lum(hex){ var h=hex.replace('#',''),r=parseInt(h.slice(0,2),16)/255,g=parseInt(h.slice(2,4),16)/255,b=parseInt(h.slice(4,6),16)/255; return [r,g,b].map(function(x){return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4);}).reduce(function(a,x,i){return a+[.2126,.7152,.0722][i]*x;},0); }
  var a=lum(hexA),b=lum(hexB); return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
}

console.log('\n=== PANEL-014 / PANEL-12 — D5 responsive + accessibility fixture ===\n');

var d5Start=cssSource.indexOf('/* ── D5 responsive / accessibility / motion contract ── */');
var beforeD5=d5Start<0?'':cssSource.slice(0,d5Start);
var viewportFixtures=[
  {label:'375px mobil',mobile:true,tablet:false,desktop:false},
  {label:'390px mobil',mobile:true,tablet:false,desktop:false},
  {label:'430px mobil',mobile:true,tablet:false,desktop:false},
  {label:'768px tablet',mobile:false,tablet:true,desktop:false},
  {label:'1280px desktop',mobile:false,tablet:false,desktop:true},
  {label:'1440px desktop',mobile:false,tablet:false,desktop:true}
];
viewportFixtures.forEach(function(v){
  var contract=v.mobile
    ? cssSource.includes('.d2-hero-grid,.d4-module-grid{grid-template-columns:1fr}')
    : v.tablet
      ? cssSource.includes('.d2-hero-grid,.d4-module-grid{grid-template-columns:repeat(2,minmax(0,1fr))}')
      : cssSource.includes('.bento{grid-template-columns:repeat(12,minmax(0,1fr));max-width:1280px}');
  ok(v.label+' layout contract',contract);
});
ok('480px max-width yalnız mobil media koşulunda tanımlı',!/(?:\.page|\.bento)[^{]*\{[^}]*max-width:480px/.test(beforeD5)&&cssSource.includes('@media(max-width:480px)')&&cssSource.includes('.page,.bento{width:100%;max-width:480px}'));
ok('desktop 12 kolon, tablet iki kolon, mobil tek kolon birlikte tanımlı',cssSource.includes('@media(min-width:1200px)')&&cssSource.includes('@media(min-width:769px) and (max-width:1199px)')&&cssSource.includes('@media(max-width:480px)'));
ok('header, sticky nav ve section header çakışma sözleşmesi',cssSource.includes('.jumpnav{top:0}')&&cssSource.includes('.section-header{top:var(--section-sticky-top)}')&&cssSource.includes('.jumpnav,.section-header{position:relative;top:auto}'));
ok('tüm ana eylemler 44px hedef sözleşmesine bağlı',cssSource.includes('--touch-min:44px')&&cssSource.includes('button{font:inherit;min-height:var(--touch-min)}')&&cssSource.includes('button[aria-label]{min-width:var(--touch-min)}'));
ok('visible focus ring ve yüksek kontrast override var',cssSource.includes('button:focus-visible')&&cssSource.includes('--focus-ring:0 0 0 4px #fff')&&cssSource.includes('@media(prefers-contrast:more)'));
ok('reduced-motion CSS tüm animasyon/transition/scroll davranışını sakinleştiriyor',cssSource.includes('@media(prefers-reduced-motion:reduce)')&&cssSource.includes('animation-duration:.01ms!important')&&cssSource.includes('scroll-behavior:auto!important'));
ok('panel HTML cache D5 sürümünde',htmlSource.includes('panel.css?v=20260805b')&&htmlSource.includes('panel.js?v=20260806f'));

var doc={activeElement:null,getElementById:function(){return null;},querySelector:function(){return null;}};
var context={window:{matchMedia:function(){return {matches:false};}},UI:{expandedCards:{},d4SelectedModule:null,eventSelectedId:null},CARDEXPKEY:'d5-fixture',document:doc,localStorage:{setItem:function(){}},esc:esc,icon:function(){return '';},String:String};
vm.runInNewContext([extractFunction('toggleCard'),extractFunction('cardWrap'),extractFunction('jumpToSection')].join('\n'),context,{filename:'panel-p5-responsive-a11y.js'});
var longText='Çok uzun Türkçe provenance özeti: ıİğĞşŞçÇ öÖ üÜ — '.repeat(8);
var card=context.cardWrap({key:'uzun-turkce-kart',title:'Zihin-Beden ve Arşivler için uzun başlık',summary:longText,details:longText,span:12});
ok('accordion native button + expanded/controls/hidden semantiği',card.includes('<button')&&card.includes('aria-expanded="false"')&&card.includes('aria-controls="card-exp-body-uzun-turkce-kart"')&&card.includes('aria-hidden="true"'));
ok('uzun Türkçe metin güvenli overflow sözleşmesine sahip',card.includes('Çok uzun Türkçe')&&cssSource.includes('overflow-wrap:anywhere'));

var scrollCall=null;
doc.getElementById=function(){return {scrollIntoView:function(opts){scrollCall=opts;}};};
context.jumpToSection('sec-today');
ok('normal motion section jump smooth',scrollCall&&scrollCall.behavior==='smooth');
context.window.matchMedia=function(){return {matches:true};};
context.jumpToSection('sec-today');
ok('reduced motion section jump auto',scrollCall&&scrollCall.behavior==='auto');

ok('ARIA live regions: status/sync/filter surfaces',panelSource.includes('class="topbar-status" aria-live="polite"')&&panelSource.includes('class="sync-ribbon" data-component="sync-ribbon" aria-label="Senkron sağlık özeti" aria-live="polite"')&&panelSource.includes('class="event-log-filter-summary" aria-live="polite"'));
ok('ARIA current/controls section navigation',/aria-controls="'\+sec\.id\+'"/.test(panelSource)&&panelSource.includes('aria-current="false"')&&panelSource.includes("setAttribute('aria-current'"));
ok('drawer/event/module expanded state controls',panelSource.includes('aria-controls="d4-module-drawer"')&&panelSource.includes('data-component="timeline-row"')&&panelSource.includes("UI.d4SelectedModule===m.key?'true':'false'"));
ok('accordion ve drawer focus kaybını önleyen native/focus sözleşmesi',panelSource.includes('card-exp-head')&&panelSource.includes('eventDrawerFocusableP')&&panelSource.includes('D4_DRAWER_RETURN_ID'));
ok('status rengi tek anlam değil, metin/icon badge korunuyor',panelSource.includes('d2StatusBadgeP')&&panelSource.includes('p3StatusP')&&cssSource.includes('.status-badge::before'));
ok('empty/stale/error/redacted fixture metinleri D4 atlas sözleşmesinde korunuyor',panelSource.includes('Eksik')&&panelSource.includes('Eski cache')&&panelSource.includes('Bozuk')&&panelSource.includes('Hata')&&panelSource.includes('Redacted'));

ok('muted text WCAG AA için dark surface üzerinde yeterli kontrast taşıyor',contrast('#a59d94','#070709')>=4.5&&contrast('#a59d94','#101019')>=4.5);

console.log('\nPANEL-014 / PANEL-12 fixture result: '+(failed?'FAIL':'PASS')+' ('+passed+' passed, '+failed+' failed)');
if(failed) process.exitCode=1;
