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
  var ctx={Math:Math,Date:Date,PANEL_CONSECUTIVE_ERRORS:0,PANEL_POLL_BASE_MS:5000,PANEL_POLL_MAX_MS:60000,PANEL_POLL_BACKOFF_STEPS:4,
    PANEL_LAST_DIAG:{status:null,kind:null,attempts:0,at:null,resetAt:null,retryAfterMs:null}};
  vm.runInNewContext(extractFunction('panelPollDelayP'),ctx,{filename:'panel-boot-backoff.js'});
  ok('hata yokken taban aralık korunur',ctx.panelPollDelayP()===5000);
  ctx.PANEL_CONSECUTIVE_ERRORS=1; var d1=ctx.panelPollDelayP();
  ctx.PANEL_CONSECUTIVE_ERRORS=3; var d3=ctx.panelPollDelayP();
  ctx.PANEL_CONSECUTIVE_ERRORS=50; var dMax=ctx.panelPollDelayP();
  var rlCtx={Math:Math,Date:Date,PANEL_CONSECUTIVE_ERRORS:0,PANEL_POLL_BASE_MS:5000,PANEL_POLL_MAX_MS:60000,PANEL_POLL_BACKOFF_STEPS:4,
    PANEL_LAST_DIAG:{kind:'rate_limited',retryAfterMs:null,resetAt:Date.now()+40000}};
  vm.runInNewContext(extractFunction('panelPollDelayP'),rlCtx,{filename:'panel-boot-ratedelay.js'});
  var rlDelay=rlCtx.panelPollDelayP();
  ok('sınıra takılınca sıfırlanma zamanına kadar beklenir',rlDelay>=30000&&rlDelay<=60000,'rlDelay='+rlDelay);
  rlCtx.PANEL_LAST_DIAG={kind:'rate_limited',retryAfterMs:12000,resetAt:null};
  ok('Retry-After başlığı önceliklidir',rlCtx.panelPollDelayP()===12000,'='+rlCtx.panelPollDelayP());
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
function bootPanel(mode,seed){
  var src=source
    .replace('PANEL_FETCH_TIMEOUT_MS=30000','PANEL_FETCH_TIMEOUT_MS=60')
    .replace('PANEL_TRANSPORT_TIMEOUT_MS=30000','PANEL_TRANSPORT_TIMEOUT_MS=60')
    .replace('PANEL_BOOT_STALL_MS=20000','PANEL_BOOT_STALL_MS=250')
    .replace('PANEL_FETCH_ATTEMPTS=3','PANEL_FETCH_ATTEMPTS=2')
    .replace('PANEL_RETRY_DELAY_MS=1200','PANEL_RETRY_DELAY_MS=10')
    .replace('PANEL_POLL_BASE_MS=5000','PANEL_POLL_BASE_MS=80')
    .replace('PANEL_POLL_MAX_MS=60000','PANEL_POLL_MAX_MS=800');
  function el(){ return {_html:'',dataset:{},style:{},classList:{contains:function(){return false;},add:function(){},remove:function(){}},children:[],
    get innerHTML(){return this._html;}, set innerHTML(v){this._html=v;},
    setAttribute:function(){},getAttribute:function(){return null;},addEventListener:function(){},removeEventListener:function(){},
    focus:function(){},querySelector:function(){return null;},querySelectorAll:function(){return [];},isConnected:true,textContent:''}; }
  var app=el(); app.innerHTML='<div class="card">Çekirdek başlatılıyor…</div>';
  var log=[],store={'seyma-panel-token':'test-token-not-real'};
  if(seed) Object.keys(seed).forEach(function(k){ store[k]=seed[k]; });
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
    fetch:function(url){
      log.push(String(url));
      if(mode==='hang') return new Promise(function(){});
      if(mode==='ok'){
        if(String(url).indexOf('latest.json')<0) return Promise.resolve({status:404,ok:false,headers:{get:function(){return null;}},json:function(){return Promise.resolve({});},text:function(){return Promise.resolve('{}');}});
        var days={}; for(var i=0;i<10;i++){ days['2026-08-'+String(i+1).padStart(2,'0')]={mood:3,energy:3,ticks:{water:true}}; }
        var body={version:2,startDate:'2026-08-01',days:days,settings:{},syncReceipt:{schemaVersion:1,status:'accepted',snapshotRevision:'a'.repeat(40),sourceUpdatedAt:'2026-08-21T07:00:00.000Z'}};
        return Promise.resolve({status:200,ok:true,headers:{get:function(k){return String(k).toLowerCase()==='etag'?'"ok1"':null;}},json:function(){return Promise.resolve(body);},text:function(){return Promise.resolve(JSON.stringify(body));}});
      }
      return Promise.reject(new TypeError('Failed to fetch'));
    },
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
  return wait(400).then(function(){
    // Yer tutucu, istek uçuştayken dürüst bir ilerleme metnine dönmüş olmalı.
    ok('takılı ağda yer tutucu bırakılmaz (ilerleme ya da teşhis gösterilir)',
      hang.app.innerHTML.indexOf('Çekirdek başlatılıyor')<0,hang.app.innerHTML.slice(0,90));
    ok('indirme sürerken yanlışlıkla hata gösterilmez, dürüst ilerleme yazılır',
      /Veri indiriliyor|Tekrar Dene|Çekirdek başlatılamadı|Bağlantı bekleniyor/.test(hang.app.innerHTML));
    return wait(900);
  }).then(function(){
    ok('takılı ağda sonunda teşhis/yeniden deneme yolu sunulur',
      /Tekrar Dene|Çekirdek başlatılamadı|Bağlantı bekleniyor/.test(hang.app.innerHTML),hang.app.innerHTML.slice(0,90));
    var latest=hang.log.filter(function(u){return u.indexOf('latest.json')>=0;}).length;
    ok('takılı ağda istek seli oluşmaz',latest>0&&latest<=14,'latest istekleri='+latest);
  });
}).then(function(){
  var err=bootPanel('neterr');
  return wait(1200).then(function(){
    ok('ağ hatasında panel yer tutucuda kalmaz',err.app.innerHTML.indexOf('Çekirdek başlatılıyor')<0);
    ok('ağ hatasında gözlemciye teşhis yolu sunulur',/Tekrar Dene|Bağlantı bekleniyor|Çekirdek başlatılamadı/.test(err.app.innerHTML));
    var latest=err.log.filter(function(u){return u.indexOf('latest.json')>=0;}).length;
    ok('ağ hatasında retry+backoff istek sayısını sınırlar',latest>0&&latest<=20,'latest istekleri='+latest);
  });
});

// ── [4b] Yeniden deneme semantiği ─────────────────────────────────────
var step5b=step5.then(function(){
  console.log('[4b] Kopan gövde yeniden denenir, 4xx denenmez');
  function retryCtx(){
    var ctx={Promise:Promise,Math:Math,Error:Error,String:String,setTimeout:setTimeout,
      PANEL_FETCH_ATTEMPTS:3,PANEL_RETRY_DELAY_MS:1,PANEL_TIMEOUT_GROWTH:1.5,PANEL_FETCH_TIMEOUT_MS:30000};
    vm.runInNewContext(extractFunction('panelRetryableErrorP')+'\n'+extractFunction('panelAttemptP')+'\n'+extractFunction('panelAttemptTimeoutP'),ctx,{filename:'panel-boot-retry.js'});
    return ctx;
  }
  var c=retryCtx();
  // Yavaş hatta ölçülen gerçek arıza: gövde yarıda kopar, JSON parse patlar.
  var tries=0;
  return c.panelAttemptP(function(){
    tries++;
    if(tries<3) return Promise.reject(new SyntaxError('Unterminated string in JSON at position 438122'));
    return Promise.resolve('tam-govde');
  }).then(function(v){
    ok('kopan gövde yeniden denenir ve sonunda tamamlanır',v==='tam-govde'&&tries===3,'deneme='+tries);
  }).then(function(){
    var c2=retryCtx(), n=0;
    var auth=new Error('Token gecersiz veya yetkisiz.'); auth.noRetry=true;
    return c2.panelAttemptP(function(){ n++; return Promise.reject(auth); }).then(function(){
      ok('yetki hatası yeniden denenmemeli',false);
    },function(){
      ok('yetki hatası (4xx) asla yeniden denenmez',n===1,'deneme='+n);
    });
  }).then(function(){
    var c3=retryCtx(), n=0;
    var nf=new Error('data/latest.json bulunamadi.'); nf.notFound=true; nf.noRetry=true;
    return c3.panelAttemptP(function(){ n++; return Promise.reject(nf); }).catch(function(){
      ok('404 asla yeniden denenmez',n===1,'deneme='+n);
    });
  }).then(function(){
    var c4=retryCtx(), n=0;
    var rl=new Error('transport rate_limited'); rl.rateLimited=true;
    return c4.panelAttemptP(function(){ n++; return Promise.reject(rl); }).catch(function(){
      ok('rate limit yeniden denemeyle büyütülmez',n===1,'deneme='+n);
    });
  }).then(function(){
    // Sahada ölçülen arızanın birebir modeli: başlıklar 200, gövde yarıda
    // kopuk (1.662.015 bayt beklenirken ~440 KB gelip akış CANCEL oluyor).
    // İlk iki deneme parse'ta patlar, üçüncüsü tamamlanır.
    var attempts=0;
    var latest={version:2,startDate:'2026-06-24',days:{},syncReceipt:{snapshotRevision:'a'.repeat(40),sourceUpdatedAt:'2026-08-21T07:00:00.000Z'}};
    var ctx={Date:Date,Math:Math,Promise:Promise,String:String,Number:Number,Object:Object,Array:Array,
      isFinite:isFinite,Error:Error,encodeURIComponent:encodeURIComponent,setTimeout:setTimeout,clearTimeout:clearTimeout,
      AbortController:AbortController,PANEL_FETCH_TIMEOUT_MS:30000,PANEL_FETCH_ATTEMPTS:3,PANEL_RETRY_DELAY_MS:1,
      PANEL_TIMEOUT_GROWTH:1.5,PTOKEN:'test-token-not-real',PANEL_LAST_DIAG:{status:null,kind:null,attempts:0,at:null,resetAt:null,retryAfterMs:null},parseInt:parseInt,isNaN:isNaN,
      PANEL_LATEST_CACHE:{etag:null,sourceRevision:null,sourceUpdatedAt:null},PANEL_POLL_STATE:{conditionalMode:'etag'},
      fetch:function(){
        attempts++;
        var truncated=attempts<3;
        return Promise.resolve({status:200,ok:true,
          headers:{get:function(k){ return k.toLowerCase()==='etag'?'"v9"':null; }},
          json:function(){ return truncated
            ? Promise.reject(new SyntaxError('Unterminated string in JSON at position 438122'))
            : Promise.resolve(latest); }});
      }};
    vm.runInNewContext(extractFunction('responseHeaderP')+'\n'+extractFunction('panelRateInfoP')+'\n'+
      extractFunction('panelRateLimitedP')+'\n'+extractFunction('panelNoteDiagP')+'\n'+extractFunction('panelFetchP')+'\n'+
      extractFunction('panelRetryableErrorP')+'\n'+extractFunction('panelAttemptP')+'\n'+
      extractFunction('panelAttemptTimeoutP')+'\n'+extractFunction('pollConditionalDecisionP')+'\n'+
      extractFunction('fetchLatest'),ctx,{filename:'panel-boot-truncation.js'});
    return ctx.fetchLatest('mustafaras/seyma-data','main').then(function(res){
      ok('yarıda kopan snapshot yeniden denenerek tam alınır',!!res&&res.notModified===false&&res.data===latest,'deneme='+attempts);
      ok('kopan denemeler ETag önbelleğini kirletmez',ctx.PANEL_LATEST_CACHE.etag==='"v9"');
    });
  }).then(function(){
    var c5=retryCtx();
    ok('deneme zaman aşımı kademeli büyür',
      c5.panelAttemptTimeoutP(30000,1)===30000&&c5.panelAttemptTimeoutP(30000,2)===45000&&c5.panelAttemptTimeoutP(30000,3)===67500,
      [c5.panelAttemptTimeoutP(30000,1),c5.panelAttemptTimeoutP(30000,2),c5.panelAttemptTimeoutP(30000,3)].join('/'));
  });
});

// ── [4c] Sunucu sınırı, yetkisizlikten ayrılır ────────────────────────
var step5c=step5b.then(function(){
  console.log('[4c] 403-sınır ile 403-yetkisiz ayrımı');
  function latestCtx(status,headers){
    var ctx={Date:Date,Math:Math,Promise:Promise,String:String,Number:Number,Object:Object,Array:Array,
      isFinite:isFinite,isNaN:isNaN,parseInt:parseInt,Error:Error,encodeURIComponent:encodeURIComponent,
      setTimeout:setTimeout,clearTimeout:clearTimeout,AbortController:AbortController,
      PANEL_FETCH_TIMEOUT_MS:30000,PANEL_FETCH_ATTEMPTS:2,PANEL_RETRY_DELAY_MS:1,PANEL_TIMEOUT_GROWTH:1.5,
      PTOKEN:'test-token-not-real',calls:0,
      PANEL_LAST_DIAG:{status:null,kind:null,attempts:0,at:null,resetAt:null,retryAfterMs:null},
      PANEL_LATEST_CACHE:{etag:null,sourceRevision:null,sourceUpdatedAt:null},PANEL_POLL_STATE:{conditionalMode:'etag'}};
    ctx.fetch=function(){
      ctx.calls++;
      return Promise.resolve({status:status,ok:false,headers:{get:function(k){
        var v=headers[String(k).toLowerCase()]; return v===undefined?null:v; }}});
    };
    vm.runInNewContext(extractFunction('responseHeaderP')+'\n'+extractFunction('panelRateInfoP')+'\n'+
      extractFunction('panelRateLimitedP')+'\n'+extractFunction('panelNoteDiagP')+'\n'+extractFunction('panelFetchP')+'\n'+
      extractFunction('panelRetryableErrorP')+'\n'+extractFunction('panelAttemptP')+'\n'+
      extractFunction('panelAttemptTimeoutP')+'\n'+extractFunction('pollConditionalDecisionP')+'\n'+
      extractFunction('fetchLatest'),ctx,{filename:'panel-boot-ratelimit.js'});
    return ctx;
  }
  var reset=Math.floor((Date.now()+900000)/1000);
  var c1=latestCtx(403,{'x-ratelimit-remaining':'0','x-ratelimit-reset':String(reset)});
  return c1.fetchLatest('mustafaras/seyma-data','main').then(function(){
    ok('403+sınır hata vermeli',false);
  },function(err){
    ok('403 + remaining:0 sunucu sınırı sayılır, token gecersiz DEĞİL',
      err&&err.rateLimited===true&&!/gecersiz|yetkisiz/i.test(String(err.message)),String(err&&err.message));
    ok('sınır durumunda tanı kaydı sıfırlanma zamanını taşır',
      c1.PANEL_LAST_DIAG.kind==='rate_limited'&&c1.PANEL_LAST_DIAG.status===403&&c1.PANEL_LAST_DIAG.resetAt===reset*1000);
    ok('sınır hatası yeniden denemeyle büyütülmez',c1.calls===1,'istek='+c1.calls);
  }).then(function(){
    var c2=latestCtx(429,{'retry-after':'60'});
    return c2.fetchLatest('mustafaras/seyma-data','main').catch(function(err){
      ok('429 ikincil sınır olarak sınıflanır',err&&err.rateLimited===true);
      ok('Retry-After tanıya yazılır',c2.PANEL_LAST_DIAG.retryAfterMs===60000);
    });
  }).then(function(){
    var c3=latestCtx(403,{'x-ratelimit-remaining':'4712'});
    return c3.fetchLatest('mustafaras/seyma-data','main').catch(function(err){
      ok('kota doluyken DEĞİL de gerçek 403 ise yetkisizlik sayılır',
        /gecersiz|yetkisiz/i.test(String(err&&err.message))&&!err.rateLimited);
      ok('yetkisizlik tanısı doğru sınıflanır',c3.PANEL_LAST_DIAG.kind==='unauthorized');
    });
  }).then(function(){
    var c4=latestCtx(401,{});
    return c4.fetchLatest('mustafaras/seyma-data','main').catch(function(err){
      ok('401 her zaman yetkisizliktir',/gecersiz|yetkisiz/i.test(String(err&&err.message)));
    });
  });
});

// ── [4d] İlk render erteleme kilidi (KÖK SEBEP regresyonu) ───────────
// Saha arızası: gözlemci daha önce bir kartı açık bırakınca UI.expandedCards
// boot'ta localStorage'dan geri yükleniyor, panelInteractionActiveP() bunu
// "aktif etkileşim" sayıyor ve İLK render sonsuza dek erteleniyordu. Panel
// yer tutucuda kalıyor, boot emniyeti bunu "Bağlantı kurulamadı" diye
// gösteriyordu — oysa veri HTTP 200 ile gelmişti.
var step5d=step5c.then(function(){
  console.log('[4d] İlk render erteleme kilidi');
  function deferCtx(over){
    var ctx=Object.assign({Date:Date,Object:Object,String:String,
      PANEL_FIRST_PAINT:false,PANEL_DEFER_SINCE:null,PANEL_DEFER_MAX_MS:60000,
      D4_DRAWER_RETURN_ID:null,
      UI:{msgSending:false,msgDraft:'',eventFilter:'all',motivationFilter:'all',selectedDate:null,expandedCards:{},d4SelectedModule:null},
      document:{activeElement:null},
      panelBusyTyping:function(){return false;},
      today:function(){return '2026-08-21';}},over||{});
    vm.runInNewContext(extractFunction('panelDraftActiveP')+'\n'+extractFunction('panelInteractionActiveP')+'\n'+extractFunction('panelShouldDeferRenderP'),ctx,{filename:'panel-boot-defer.js'});
    return ctx;
  }
  var a=deferCtx({UI:{msgSending:false,msgDraft:'',eventFilter:'all',motivationFilter:'all',selectedDate:null,expandedCards:{ruh:true,beden:true},d4SelectedModule:null}});
  ok('geri yüklenmiş açık kartlar İLK render\'ı ERTELEYEMEZ',a.panelShouldDeferRenderP()===false);
  ok('bu durum gerçekten "etkileşim" sayılıyor (kapı ilk boyamada devre dışı)',a.panelInteractionActiveP()===true);

  var b=deferCtx({PANEL_FIRST_PAINT:true,UI:{msgSending:false,msgDraft:'',eventFilter:'all',motivationFilter:'all',selectedDate:null,expandedCards:{ruh:true},d4SelectedModule:null}});
  ok('ilk boyamadan SONRA açık kart REM-58 gereği ertelemeyi korur',b.panelShouldDeferRenderP()===true);
  b.PANEL_DEFER_SINCE=Date.now()-70000;
  ok('kalıcı görünüm tercihi render\'ı süresiz kilitleyemez (zorlama turu)',b.panelShouldDeferRenderP()===false);

  var c=deferCtx({PANEL_FIRST_PAINT:true,PANEL_DEFER_SINCE:Date.now()-999999,
    UI:{msgSending:false,msgDraft:'gözlemci yazıyor',eventFilter:'all',motivationFilter:'all',selectedDate:null,expandedCards:{},d4SelectedModule:null}});
  ok('taslak yazarken ASLA zorlanmaz (gözlemcinin yazdığı kesilmez)',c.panelShouldDeferRenderP()===true);

  var d=deferCtx({PANEL_FIRST_PAINT:true});
  ok('etkileşim yokken erteleme olmaz',d.panelShouldDeferRenderP()===false);

  ok('applyPollRenderP tek erteleme kapısını kullanır',/if\(panelShouldDeferRenderP\(\)\)\{/.test(source));
  ok('304 dalı da aynı kapıyı kullanır',/if\(hadPending\)\{ if\(panelShouldDeferRenderP\(\)\)/.test(source));
});

// ── [4e] Uçtan uca: açık kart hatırlanırken panel yine de açılır ─────
var step5e=step5d.then(function(){
  console.log('[4e] Uçtan uca — hatırlanan açık kartlarla boot');
  var b=bootPanel('ok',{'seyma-panel-expand-v1':JSON.stringify({ruh:true,beden:true,sureklilik:true})});
  return wait(700).then(function(){
    var html=b.app.innerHTML;
    ok('hatırlanan açık kartlar paneli yer tutucuda kilitlemez',html.indexOf('Çekirdek başlatılıyor')<0,html.slice(0,80));
    ok('hatırlanan açık kartlar sahte bağlantı hatası üretmez',html.indexOf('Bağlantı bekleniyor')<0);
    ok('panel gerçekten çizilir',html.length>5000,'html='+html.length);
  });
});

// ── [5] Kaynak sözleşmesi ─────────────────────────────────────────────
var step6=step5e.then(function(){
  console.log('[5] Kaynak sözleşmesi');
  ok('latest.json okuma yolu zaman aşımı sarmalayıcısını kullanır',/return panelFetchP\(api,/.test(source));
  ok('transport okuma yolu zaman aşımı sarmalayıcısını kullanır',/return panelFetchP\(ghTransportApiP\(path\)/.test(source));
  ok('load() tek uçuş kilidiyle korunur',source.indexOf('if(PANEL_LOAD_INFLIGHT) return PANEL_LOAD_INFLIGHT;')>=0);
  ok('ilk boyamadan önce hata ekranı taslak korumasıyla yutulmaz',/if\(PANEL_FIRST_PAINT&&panelDraftActiveP\(\)\)/.test(source));
  ok('sabit 5 sn poll interval kaldırıldı',source.indexOf('},5000);')<0);
  ok('poll zincirleme zamanlayıcıyla kurulur',source.indexOf('schedulePanelPollP();')>=0);
  ok('boot durma emniyeti mevcut',source.indexOf('PANEL_BOOT_STALL_MS')>=0&&/boot timeout/.test(source));
  ok('latest okuma yolu sınırlı yeniden deneme kullanır',/return panelAttemptP\(function\(attempt\)/.test(source));
  ok('transport ve mesaj okuma yolları da sınırlı yeniden deneme kullanır',(source.match(/return panelAttemptP\(function\(attempt\)/g)||[]).length===3);
  ok('boot yolunda korumasız okuma kalmadı',!/function loadInbox\(\)\{\s*return fetch\(/.test(source));
  ok('mesaj kanalı arızası paneli düşürmez',/unavailable:true/.test(source));
  // Aşama takibi: veri elde varken ağ hatası kartı gösterilmemeli.
  ok('poll turu aşama işaretliyor',['shape','sections','project','render'].every(function(x){ return source.indexOf("panelNoteStageP('"+x+"'")>=0; }));
  ok('render istisnası ağ hatasıyla karıştırılmaz',source.indexOf('function panelSafeRenderP()')>=0&&/Görünüm oluşturulamadı/.test(source));
  ok('veri alındıysa bağlantı kartı gösterilmez',/var veriAlindi=PANEL_LAST_DIAG&&PANEL_LAST_DIAG\.kind==='ok'/.test(source));
  ok('tanı hata METNİNİ değil yalnız SINIF adını saklar',/errName=err&&err\.name/.test(source)&&!/errName=err&&err\.message/.test(source));
  ok('son iyi anlık görünüm saklanır',source.indexOf('PANEL_LAST_GOOD=latestLegacy;')>=0);
  ok('aşama hatasında son çare ham veriyle çizilir',/if\(panelSafeRenderP\(\)\) return;/.test(source)&&/reason:'stage_failure'/.test(source));
  ok('son çare bile başarısızsa dürüst kart gösterilir',/try\{ panelRenderFailCardP\(\); \}catch\(e2\)\{ fail\(m\); \}/.test(source));
  ok('son çare redaction sınırını atlamaz',/PC\.redactForObserver/.test(source));
  ok('deneme zaman aşımı kademeli',source.indexOf('panelAttemptTimeoutP(PANEL_FETCH_TIMEOUT_MS,attempt)')>=0);
  ok('4xx yanıtlar noRetry ile işaretlenir',/a\.noRetry=true/.test(source)&&/e\.noRetry=true/.test(source)&&/te\.noRetry=true/.test(source));
  ok('indirme sürerken yanlış hata yerine ilerleme gösterilir',source.indexOf('PANEL_BOOT_WAIT_MARK')>=0&&/Veri indiriliyor/.test(source));
  ok('zaman bütçesi ölçülen yavaş hatta yetecek kadar geniş',/PANEL_FETCH_TIMEOUT_MS=30000/.test(source));
  ok('hata kartı HTTP durumunu görünür kılar',/Tanı: /.test(source)&&source.indexOf('panelDiagTextP')>=0);
  ok('tanı kaydı gizli veri taşımaz',(function(){
    var f=extractFunction('panelNoteDiagP')+extractFunction('panelDiagTextP');
    return ['PTOKEN','ghToken','localStorage','api.github.com','D.days'].every(function(n){ return f.indexOf(n)<0; });
  })());
  ok('sınıra takılınca poll sıfırlanma zamanına saygı duyar',/d\.kind==='rate_limited'/.test(source));
  // Öz-tanı: gözlemciyi döngüden çıkarır ama gizlilik sınırını genişletmez.
  ok('hata kartı öz-tanı yolu sunar',source.indexOf('window.runPanelSelfTest=runPanelSelfTestP')>=0&&/Tanı çalıştır/.test(source)&&source.indexOf('id="panel-selftest"')>=0);
  var probe=extractFunction('panelSelfTestP')+extractFunction('panelProbeP')+extractFunction('runPanelSelfTestP');
  ['method:"PUT"',"method:'PUT'","method:\"POST\"",'localStorage.setItem','localStorage.removeItem'].forEach(function(n){
    ok('öz-tanı yazma yolu açmaz ('+n+')',probe.indexOf(n)<0);
  });
  ok('öz-tanı yalnız GET kullanır',!/method\s*:/.test(probe));
  ok('öz-tanı token içeriğini çıktıya yazmaz',!/detail\s*:\s*[^,}]*PTOKEN/.test(probe));
  ok('öz-tanı gövde bütünlüğünü bayt olarak kontrol eder',/Content-Length/.test(probe)&&/YARIDA KESİLDİ/.test(probe));
  ok('öz-tanı kota adımı sınırı tüketmez (/rate_limit)',probe.indexOf('api.github.com/rate_limit')>=0);
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
