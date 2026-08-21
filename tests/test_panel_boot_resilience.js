// PANEL-BOOT — panel boot/poll dayanıklılık fixture'ı.
//
// Kapsanan gerçek arıza (2026-08-21): panel "Çekirdek başlatılıyor…" yer
// tutucusunda takılı kalıyor, DevTools konsolu data/latest.json'a giden
// net::ERR_HTTP2_PROTOCOL_ERROR istekleriyle doluyordu. Kök nedenler:
//   1) hiçbir panel fetch'inde zaman aşımı yoktu — takılı bir HTTP/2 akışı
//      promise'i ne çözüyor ne reddediyordu, boot sonsuza kadar asılı kalıyordu;
//   2) load() tek uçuş kilidi olmadan interval + visibilitychange + focus ile
//      üst üste çağrılıyordu;
//   3) loadEventLogP her turda 120 güne kadar EŞ ZAMANLI GitHub isteği açıyordu;
//   4) sabit 5 sn interval hata hâlinde de aynı hızda istek üretiyordu.
//
// Yalnızca sentetik VM verisi; gerçek ağ, gerçek token, gerçek kullanıcı verisi yok.
'use strict';
var fs=require('fs');
var path=require('path');
var vm=require('vm');
var repoRoot=require('./repo-root');
var source=fs.readFileSync(path.join(repoRoot,'panel.js'),'utf8');
var panelHtml=fs.readFileSync(path.join(repoRoot,'panel.html'),'utf8');
var manifestSource=fs.readFileSync(path.join(repoRoot,'panelCoverageManifest.js'),'utf8');

var passed=0,failed=0;
function ok(name,condition,detail){ if(condition){passed++;console.log('  ✓ '+name);}else{failed++;console.log('  ✗ '+name+(detail?' — '+detail:''));} }
function extractFunction(name){
  var start=source.indexOf('function '+name+'(');
  if(start<0) throw new Error(name+' panel.js içinde bulunamadı');
  var end=source.indexOf('\nfunction ',start+10);
  return source.slice(start,end<0?source.length:end);
}
function wait(ms){ return new Promise(function(r){ setTimeout(r,ms); }); }

console.log('\n=== PANEL-BOOT — boot/poll dayanıklılık fixture ===\n');

// ── [1] panelFetchP: zaman aşımı ve gerçek iptal ──────────────────────
console.log('[1] Zaman aşımlı fetch sarmalayıcı');
function fetchCtx(fetchImpl){
  var ctx={Promise:Promise,Object:Object,Error:Error,setTimeout:setTimeout,clearTimeout:clearTimeout,
    AbortController:AbortController,PANEL_FETCH_TIMEOUT_MS:20000,fetch:fetchImpl};
  vm.runInNewContext(extractFunction('panelFetchP'),ctx,{filename:'panel-boot-fetch.js'});
  return ctx;
}
var aborted=false;
var hangCtx=fetchCtx(function(url,opts){
  if(opts&&opts.signal) opts.signal.addEventListener('abort',function(){ aborted=true; });
  return new Promise(function(){}); // hiç settle etmez — takılı HTTP/2 akışı
});
var step1=hangCtx.panelFetchP('https://api.github.com/x',{headers:{}},60).then(function(){
  ok('takılı istek çözülmemeli',false,'promise beklenmedik şekilde resolve oldu');
},function(err){
  ok('takılı istek zaman aşımıyla reddedilir',!!err&&err.code==='timeout');
  ok('takılı istek gerçekten iptal edilir (AbortController)',aborted===true);
});

var step2=step1.then(function(){
  var okCtx=fetchCtx(function(){ return Promise.resolve({status:200,ok:true}); });
  return okCtx.panelFetchP('https://api.github.com/y',{},1000).then(function(r){
    ok('sağlıklı yanıt sarmalayıcıdan bozulmadan geçer',r&&r.status===200);
  });
}).then(function(){
  var errCtx=fetchCtx(function(){ return Promise.reject(new Error('Failed to fetch')); });
  return errCtx.panelFetchP('https://api.github.com/z',{},1000).then(function(){
    ok('ağ hatası yutulmamalı',false);
  },function(e){
    ok('ağ hatası olduğu gibi yukarı taşınır',/Failed to fetch/.test(String(e&&e.message)));
  });
});

// ── [2] Backoff eğrisi ────────────────────────────────────────────────
var step3=step2.then(function(){
  console.log('[2] Ardışık hata backoff eğrisi');
  var ctx={Math:Math,PANEL_CONSECUTIVE_ERRORS:0,PANEL_POLL_BASE_MS:5000,PANEL_POLL_MAX_MS:60000,PANEL_POLL_BACKOFF_STEPS:4};
  vm.runInNewContext(extractFunction('panelPollDelayP'),ctx,{filename:'panel-boot-backoff.js'});
  ok('hata yokken taban aralık korunur',ctx.panelPollDelayP()===5000);
  ctx.PANEL_CONSECUTIVE_ERRORS=1; var d1=ctx.panelPollDelayP();
  ctx.PANEL_CONSECUTIVE_ERRORS=3; var d3=ctx.panelPollDelayP();
  ctx.PANEL_CONSECUTIVE_ERRORS=50; var dMax=ctx.panelPollDelayP();
  ok('ilk hatada aralık büyür',d1>5000&&d1<=20000,'d1='+d1);
  ok('ardışık hatada üstel yavaşlar',d3>d1,'d1='+d1+' d3='+d3);
  ok('backoff üst sınırı aşmaz',dMax<=60000&&dMax>=d3,'dMax='+dMax);
});

// ── [3] Event-log gün dosyaları: sınırlı eşzamanlılık + önbellek ──────
var step4=step3.then(function(){
  console.log('[3] Event-log gün dosyası çekimi');
  var days=[]; for(var i=0;i<40;i++) days.push('2026-07-'+String((i%28)+1));
  var inFlight=0,maxInFlight=0,requested=[];
  var ctx={
    Promise:Promise,Math:Math,Array:Array,String:String,Object:Object,
    EVENT_LOG_DIR:'data/events',
    PANEL_EVENT_FETCH_CONCURRENCY:4,
    PANEL_EVENT_REFRESH_DAYS:2,
    PANEL_TRANSPORT_CACHE:{},
    eventDayKeysP:function(){ return days; },
    buildEventLogStateP:function(root,rows){ return {rows:rows}; },
    loadTransportFileP:function(p){
      requested.push(p); inFlight++; if(inFlight>maxInFlight) maxInFlight=inFlight;
      return new Promise(function(res){ setTimeout(function(){ inFlight--; res({raw:'{"events":[]}',sha:'x'}); },5); });
    }
  };
  vm.runInNewContext(extractFunction('loadEventLogP'),ctx,{filename:'panel-boot-eventlog.js'});
  return ctx.loadEventLogP({}).then(function(state){
    ok('tüm günler sonuç satırına dönüşür',state.rows.length===days.length,'rows='+state.rows.length);
    ok('eş zamanlı istek sınırı aşılmaz',maxInFlight<=4,'maxInFlight='+maxInFlight);
    ok('ilk turda önbellek boşken tüm günler çekilir',requested.length===days.length,'requested='+requested.length);
    // İkinci tur: kapanmış günler transport önbelleğinden gelmeli.
    days.forEach(function(d){ ctx.PANEL_TRANSPORT_CACHE['data/events/'+d+'.json']={raw:'{"events":[]}',sha:'x'}; });
    requested.length=0;
    return ctx.loadEventLogP({});
  }).then(function(state2){
    ok('ikinci turda yalnız en yeni günler yeniden çekilir',requested.length===2,'requested='+requested.length);
    ok('önbellekten gelen günler sonuçta korunur',state2.rows.length===days.length);
  });
});

// ── [4] Tam boot: takılı ağ paneli yer tutucuda bırakmaz ──────────────
function bootPanel(mode){
  var src=source
    .replace('PANEL_FETCH_TIMEOUT_MS=20000','PANEL_FETCH_TIMEOUT_MS=120')
    .replace('PANEL_TRANSPORT_TIMEOUT_MS=15000','PANEL_TRANSPORT_TIMEOUT_MS=120')
    .replace('PANEL_BOOT_STALL_MS=25000','PANEL_BOOT_STALL_MS=700')
    .replace('PANEL_POLL_BASE_MS=5000','PANEL_POLL_BASE_MS=80')
    .replace('PANEL_POLL_MAX_MS=60000','PANEL_POLL_MAX_MS=800');
  function el(){ return {_html:'',dataset:{},style:{},classList:{contains:function(){return false;},add:function(){},remove:function(){}},children:[],
    get innerHTML(){return this._html;}, set innerHTML(v){this._html=v;},
    setAttribute:function(){},getAttribute:function(){return null;},addEventListener:function(){},removeEventListener:function(){},
    focus:function(){},querySelector:function(){return null;},querySelectorAll:function(){return [];},isConnected:true,textContent:''}; }
  var app=el(); app.innerHTML='<div class="card">Çekirdek başlatılıyor…</div>';
  var log=[],store={'seyma-panel-token':'test-token-not-real'};
  var sandbox={
    console:{log:function(){},warn:function(){},error:function(){}},
    Date:Date,Math:Math,JSON:JSON,Promise:Promise,String:String,Number:Number,Object:Object,Array:Array,Boolean:Boolean,
    RegExp:RegExp,Error:Error,TypeError:TypeError,isNaN:isNaN,isFinite:isFinite,parseInt:parseInt,parseFloat:parseFloat,
    encodeURIComponent:encodeURIComponent,decodeURIComponent:decodeURIComponent,
    URLSearchParams:URLSearchParams,TextEncoder:TextEncoder,TextDecoder:TextDecoder,AbortController:AbortController,
    btoa:function(s){return Buffer.from(s,'binary').toString('base64');},
    atob:function(s){return Buffer.from(s,'base64').toString('binary');},
    location:{search:'',href:'https://example.invalid/panel.html',replace:function(){}},
    localStorage:{getItem:function(k){return k in store?store[k]:null;},setItem:function(k,v){store[k]=String(v);},removeItem:function(k){delete store[k];}},
    setTimeout:setTimeout,clearTimeout:clearTimeout,setInterval:setInterval,clearInterval:clearInterval,
    requestAnimationFrame:function(){},
    fetch:function(url){ log.push(String(url)); return mode==='hang'?new Promise(function(){}):Promise.reject(new TypeError('Failed to fetch')); },
    document:{activeElement:null,body:{contains:function(){return true;}},
      getElementById:function(id){ return id==='app'?app:null; },
      querySelector:function(){return null;},querySelectorAll:function(){return [];},
      addEventListener:function(){},removeEventListener:function(){},
      createElement:function(){return el();},documentElement:el(),hidden:false,visibilityState:'visible'},
    navigator:{userAgent:'node',onLine:true},
    performance:{now:function(){return Date.now();}}
  };
  sandbox.window=sandbox; sandbox.window.addEventListener=function(){}; sandbox.self=sandbox;
  vm.createContext(sandbox);
  vm.runInContext(manifestSource,sandbox,{filename:'panelCoverageManifest.js'});
  vm.runInContext(src,sandbox,{filename:'panel.js'});
  return {app:app,log:log};
}

var step5=step4.then(function(){
  console.log('[4] Tam boot — takılı ve hatalı ağ');
  var hang=bootPanel('hang');
  return wait(600).then(function(){
    ok('takılı ağda panel yer tutucuda kalmaz',hang.app.innerHTML.indexOf('Çekirdek başlatılıyor')<0,hang.app.innerHTML.slice(0,80));
    ok('takılı ağda gözlemciye teşhis/yeniden deneme yolu sunulur',/Tekrar Dene|Çekirdek başlatılamadı|Bağlantı bekleniyor/.test(hang.app.innerHTML));
    var latest=hang.log.filter(function(u){return u.indexOf('latest.json')>=0;}).length;
    ok('takılı ağda istek seli oluşmaz',latest>0&&latest<=8,'latest istekleri='+latest);
  });
}).then(function(){
  var err=bootPanel('neterr');
  return wait(600).then(function(){
    ok('ağ hatasında panel yer tutucuda kalmaz',err.app.innerHTML.indexOf('Çekirdek başlatılıyor')<0);
    var latest=err.log.filter(function(u){return u.indexOf('latest.json')>=0;}).length;
    ok('ağ hatasında backoff istek sayısını sınırlar',latest>0&&latest<=10,'latest istekleri='+latest);
  });
});

// ── [5] Kaynak sözleşmesi ─────────────────────────────────────────────
var step6=step5.then(function(){
  console.log('[5] Kaynak sözleşmesi');
  ok('latest.json okuma yolu zaman aşımı sarmalayıcısını kullanır',/return panelFetchP\(api,/.test(source));
  ok('transport okuma yolu zaman aşımı sarmalayıcısını kullanır',/return panelFetchP\(ghTransportApiP\(path\)/.test(source));
  ok('load() tek uçuş kilidiyle korunur',source.indexOf('if(PANEL_LOAD_INFLIGHT) return PANEL_LOAD_INFLIGHT;')>=0);
  ok('ilk boyamadan önce hata ekranı taslak korumasıyla yutulmaz',/if\(PANEL_FIRST_PAINT&&panelDraftActiveP\(\)\)/.test(source));
  ok('sabit 5 sn poll interval kaldırıldı',source.indexOf('},5000);')<0);
  ok('poll zincirleme zamanlayıcıyla kurulur',source.indexOf('schedulePanelPollP();')>=0);
  ok('boot durma emniyeti mevcut',source.indexOf('PANEL_BOOT_STALL_MS')>=0&&/boot timeout/.test(source));
  var vis=(source.match(/addEventListener\((["'])visibilitychange\1/g)||[]).length;
  ok('yinelenen visibilitychange dinleyicisi yok',vis===1,'sayı='+vis);
  ok('panel kabuğu watchdog\'u panel.js\'ten önce çalışır',
    panelHtml.indexOf('__panelBootFailure')>=0&&panelHtml.indexOf('__panelBootFailure')<panelHtml.indexOf('panel.js?v='));
  // Gözlemci sınırı: dayanıklılık yaması hiçbir yazma yolu açmaz.
  var wrapper=extractFunction('panelFetchP');
  ['method:','PUT','POST','PATCH','DELETE','body:','localStorage'].forEach(function(needle){
    ok('panelFetchP yazma yolu açmaz ('+needle+')',wrapper.indexOf(needle)<0);
  });
});

step6.then(function(){
  console.log('\nPANEL-BOOT fixture result: '+(failed?'FAIL':'PASS')+' ('+passed+' passed, '+failed+' failed)\n');
  process.exit(failed?1:0);
}).catch(function(e){
  console.log('\nPANEL-BOOT fixture ÇÖKTÜ: '+(e&&e.stack||e)+'\n');
  process.exit(1);
});
