// ÆON mesaj okuma kalıcılığı — "mesaj okunmadan kapanıyor" regresyon fixture'ı.
//
// KULLANICI ŞİKÂYETİ (2026-08-24, ve daha önce 2026-08-09):
//   "Üstüne tıklıyorum tam iki satır okucam mesaj kapanıyor."
//
// KÖK NEDEN: uzun ÆON mesajları `aeonBubbleText()` içinde max-height:140px ile
// kırpılır; "Tümünü göster" genişletmesi YALNIZCA DOM'da (inline style +
// data-exp) tutulur ve balonun id'si her render'da artan bir sayaçtan üretilir
// (`aeon-bubble-<n>`). app.js'te render() `#app.innerHTML`'i baştan kurduğu için
// her arka plan render'ı (30 sn poll, reminder timer, foreground/focus, yeni
// mesaj, panel makbuzu) genişletmeyi yok eder → mesaj kullanıcı okurken kapanır.
//
// Bu fixture app.js'i node:vm içinde, ağ ve gerçek localStorage OLMADAN boot
// eder; fetch hiçbir zaman resolve olmaz, timer'lar no-op'tur, sync.js
// yüklenmez. Gerçek kullanıcı verisi veya mustafaras/seyma-data'ya erişim yok.
//
// Çalıştırma: node tests/app/test_aeon_message_expand.js

'use strict';
var fs = require('fs');
var path = require('path');
var vm = require('node:vm');
var repoRoot = require('../repo-root');

var FILES = [
  'app/content/motivationProgramV2.js', 'app/content/profileAssessmentV1.js',
  'app/core/constants.js', 'app/core/reminderCatalog.js', 'app/core/reminderEngine.js',
  'app/core/reminderScheduler.js', 'app/core/reminderDelivery.js', 'app.js'
];

function today(){ var d=new Date(), p=function(n){ return (n<10?'0':'')+n; };
  return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate()); }

var PROFILE_ITEM_IDS = (function(){
  var box={window:{},console:console}; vm.createContext(box);
  vm.runInContext(fs.readFileSync(path.join(repoRoot,'app/content/profileAssessmentV1.js'),'utf8'),box);
  return box.window.ProfileAssessmentV1.sessions[0].items.map(function(it){ return it.id; });
})();

// ── Sahte DOM: yalnızca #app / #root; diğer id'ler gerçek fresh-render gibi null ──
var appHTML='';
function makeEl(id){
  return { id:id||'', _html:'',
    style:{cssText:'',setProperty:function(){},width:'',display:''},
    classList:{add:function(){},remove:function(){},toggle:function(){},contains:function(){return false;}},
    dataset:{}, children:[], scrollTop:0, offsetWidth:0, value:'', files:[],
    get innerHTML(){ return this._html; },
    set innerHTML(v){ this._html=String(v); if(this.id==='app') appHTML=this._html; },
    get textContent(){ return this._text||''; }, set textContent(v){ this._text=String(v); },
    setAttribute:function(){}, getAttribute:function(){ return null; },
    appendChild:function(c){ this.children.push(c); return c; },
    removeChild:function(){}, remove:function(){}, replaceWith:function(){},
    insertBefore:function(c){ return c; }, addEventListener:function(){},
    removeEventListener:function(){}, click:function(){}, focus:function(){}, blur:function(){},
    querySelector:function(){ return null; }, querySelectorAll:function(){ return []; },
    closest:function(){ return null; }, replaceChildren:function(){}, contains:function(){ return false; },
    getBoundingClientRect:function(){ return {top:0,left:0,width:0,height:0}; } };
}
var appEl=makeEl('app'), rootEl=makeEl('root'), elCache={app:appEl,root:rootEl};

function buildSandbox(seedData){
  var store={}; if(seedData) store['seyma-reset-v1']=JSON.stringify(seedData);
  var doc={ hidden:false, body:makeEl('body'), documentElement:rootEl,
    getElementById:function(id){ return elCache[id]||null; },
    querySelector:function(){ return null; }, querySelectorAll:function(){ return []; },
    createElement:function(){ return makeEl(''); }, createDocumentFragment:function(){ return makeEl(''); },
    addEventListener:function(){}, removeEventListener:function(){} };
  var sandbox={
    console:console,
    localStorage:{ getItem:function(k){ return k in store?store[k]:null; },
      setItem:function(k,v){ store[k]=String(v); }, removeItem:function(k){ delete store[k]; },
      clear:function(){ store={}; } },
    document:doc,
    navigator:{ vibrate:function(){}, userAgent:'node-harness',
      clipboard:{writeText:function(){ return Promise.resolve(); }},
      geolocation:{ getCurrentPosition:function(s){ s({coords:{latitude:39.9,longitude:32.8,accuracy:20,speed:0}}); },
        watchPosition:function(s){ s({coords:{latitude:39.9,longitude:32.8,accuracy:20,speed:0}}); return 1; },
        clearWatch:function(){} } },
    location:{protocol:'http:',hostname:'localhost',search:'',href:'http://localhost/',reload:function(){}},
    matchMedia:function(){ return {matches:false,addEventListener:function(){},removeEventListener:function(){},addListener:function(){},removeListener:function(){}}; },
    DOMParser:function(){ this.parseFromString=function(){ return {body:makeEl('body'),querySelector:function(){return null;},querySelectorAll:function(){return [];}}; }; },
    fetch:function(){ return new Promise(function(){}); },      // ağ YOK — asla resolve olmaz
    setTimeout:function(){ return 0; }, clearTimeout:function(){},
    setInterval:function(){ return 0; }, clearInterval:function(){},
    requestAnimationFrame:function(){ return 0; }, cancelAnimationFrame:function(){},
    crypto:{ getRandomValues:function(a){ for(var i=0;i<a.length;i++) a[i]=(Math.random()*256)|0; return a; },
      randomUUID:function(){ return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){ var r=(Math.random()*16)|0; return (c==='x'?r:(r&0x3)|0x8).toString(16); }); } },
    URL:Object.assign(function(){}, {createObjectURL:function(){ return 'blob:stub'; }, revokeObjectURL:function(){}}),
    Blob:function(){}, File:function(){}, FileReader:function(){},
    TextDecoder:TextDecoder, TextEncoder:TextEncoder, atob:atob, btoa:btoa,
    alert:function(){}, confirm:function(){ return true; }, prompt:function(){ return null; },
    addEventListener:function(){}, removeEventListener:function(){},
    Date:Date, Math:Math, JSON:JSON, Object:Object, Array:Array, String:String, Number:Number,
    Boolean:Boolean, RegExp:RegExp, Error:Error, parseInt:parseInt, parseFloat:parseFloat,
    isNaN:isNaN, isFinite:isFinite, encodeURIComponent:encodeURIComponent,
    decodeURIComponent:decodeURIComponent, Promise:Promise, Set:Set, Map:Map, Symbol:Symbol, Intl:Intl
  };
  sandbox.window=sandbox; sandbox.self=sandbox; sandbox.globalThis=sandbox;
  return sandbox;
}

// Gerçek gözlemci mesajı boyunda uzun metin (kırpma eşiği 240 karakter).
var LONG_TEXT = [
  'Günışığım, bugün panelden baktım ve son üç günün ritmini görünce içim gerçekten rahatladı.',
  'Uyku saatin oturmuş, su hedefini üç gün üst üste tutturmuşsun, kriz anında da nefes',
  'egzersizine gitmişsin — bunlar küçük şeyler değil, hepsi tek tek seçim.',
  'Yarın için tek bir şey isteyeceğim: sabah kalktığında kendine "bugün ne kadar iyiyim"',
  'diye değil, "bugün kendime nasıl iyi davranabilirim" diye sor. Gerisini bırak.',
  'Ben buradayım, acele etmiyoruz. Seninle gurur duyuyorum.'
].join(' ');
var SHORT_TEXT = 'Kısa not: bugün iyi gidiyorsun.';

// extras=true ise aynı "mesaj" sekmesindeki DİĞER iki kırpma yüzeyi de tohumlanır:
// Luna sohbeti (kayıtlarında id yok → anahtar ts'ten) ve ÆON soru/yanıt çifti.
function seedState(extras){
  var t=today(), nowIso=new Date().toISOString();
  var responses={}; PROFILE_ITEM_IDS.forEach(function(id,i){
    responses[id]={value:4,scoredValue:4,shownAt:t+'T09:00:00.000Z',answeredAt:t+'T09:00:05.000Z',
      responseMs:5000,revisionCount:0,itemVersion:'1.0.0',sessionId:'SINGLE',sequence:i+1}; });
  var base={
    version:2, startDate:t, lastOpenedDate:t,
    days:{}, aeon:{qa:[]}, luna:{qa:[]},
    notifications:[
      {id:'msg_long_1',text:LONG_TEXT,ts:t+'T19:36:00.000Z',from:'observer',read:false,readAt:null,
       deleted:false,deletedAt:null,receivedAt:nowIso,seen:false,synced:true},
      {id:'msg_long_2',text:LONG_TEXT+' İkinci mesaj.',ts:t+'T19:38:00.000Z',from:'observer',read:false,
       readAt:null,deleted:false,deletedAt:null,receivedAt:nowIso,seen:false,synced:true},
      {id:'msg_short_3',text:SHORT_TEXT,ts:t+'T19:39:00.000Z',from:'observer',read:false,readAt:null,
       deleted:false,deletedAt:null,receivedAt:nowIso,seen:false,synced:true}
    ],
    settings:{ nickname:'Sevgili Günışığı', ghToken:'', ghRepo:'mustafaras/seyma-data',
      locationEnabled:true, locationMode:'auto',
      auth:{ rememberMe:true,
        usernameHash:'ae9e1ed2b6abcbce74cc0c15719fdbba372a7dd62e6232510656bade7c201af4',
        unlockedAt:nowIso } },
    cycle:{periods:[],avgCycle:28,avgPeriod:5},
    profileAssessment:{ schemaVersion:2, deliveryMode:'single_session', status:'completed',
      startedAt:t+'T09:00:00.000Z', completedAt:t+'T09:30:00.000Z', currentItemIndex:174,
      consent:{version:'1.0.0',informationShownAt:t+'T09:00:00.000Z',acceptedAt:t+'T09:00:05.000Z',
        profileProcessingAccepted:true,sensitiveDataAccepted:true,panelSummarySharingAccepted:false},
      responses:responses, moduleProgress:{}, scores:{}, quality:{}, report:{}, panelSummary:{} }
  };
  if(extras){
    base.luna.qa.push({date:t,question:'Uzun bir soru: '+LONG_TEXT,
      answer:'Uzun bir yanıt: '+LONG_TEXT,ts:t+'T18:00:00.000Z'});
    base.aeon.qa.push({id:'q_abc123',question:'Uzun soru: '+LONG_TEXT,ts:t+'T19:20:00.000Z',
      answer:'Uzun yanıt: '+LONG_TEXT,answeredAt:t+'T19:30:00.000Z',answerMsgId:'am_1',
      answerReadAt:nowIso,answerNotified:true,answerSynced:true});
  }
  return base;
}

// ── HTML'den balon durumunu çıkar (render()'ın #app.innerHTML'e yazdığı gerçek çıktı) ──
function extractBubbles(html){
  var out=[], re=/<div id="(aeon-bubble-[^"]+)" style="position:relative;">\s*<div data-aeon-bubble="1" data-exp="(\d)" style="max-height:([^;]+);/g, m;
  while((m=re.exec(html))) out.push({id:m[1],exp:m[2],maxHeight:m[3]});
  return out;
}
// Ana blokta tohumda YALNIZCA gözlemci mesajları var; Luna ve soru/yanıt
// yüzeyleri ayrı bir sandbox'ta sınanır. Bu yüzden burada filtre gerekmez —
// düzeltme ÖNCESİ sayaç kimlikli kod da aynı iddialarla yakalanır.
function observerBubbles(html){ return extractBubbles(html); }
function toggleLabels(html){
  var out={}, re=/App\.(?:toggleAeonBubble|toggleMsg)\('([^']+)'\)[^>]*>([^<]*)<\/button>/g, m;
  while((m=re.exec(html))) out[m[1]]=m[2].trim();
  return out;
}

var failures=0, passes=0;
function assert(name,cond,detail){
  if(cond){ passes++; console.log('PASS  '+name); }
  else { failures++; console.log('FAIL  '+name+(detail?'\n        → '+detail:'')); }
}

console.log('== ÆON mesaj okuma kalıcılığı (uzun mesaj genişletme) ==\n');

var sb=buildSandbox(seedState());
var ctx=vm.createContext(sb);
FILES.forEach(function(f){ vm.runInContext(fs.readFileSync(path.join(repoRoot,f),'utf8'),ctx,{filename:f}); });
sb.App.start();                 // onboarding kapağını geç
appHTML=''; sb.App.go('mesaj'); // ÆON akışını aç
var render1=appHTML;

var b1=observerBubbles(render1);
assert('1. uzun ÆON mesajı kırpılmış balon olarak render ediliyor', b1.length===2,
  'bulunan kırpılmış balon sayısı: '+b1.length+' (2 uzun mesaj bekleniyor)');
assert('2. kısa mesaj kırpılmıyor', /Kısa not: bugün iyi gidiyorsun\./.test(render1) &&
  render1.indexOf('Kısa not')>-1 && b1.length===2);

if(b1.length!==2){ console.log('\nBalon çıkarılamadı; kalan testler atlandı.'); process.exit(1); }

// ── ÇEKİRDEK 1: balon kimliği render'lar arasında sabit olmalı ──
appHTML=''; sb.App.go('bugun'); appHTML=''; sb.App.go('mesaj');
var render2=appHTML, b2=observerBubbles(render2);
assert('3. balon kimliği render\'lar arasında SABİT kalıyor',
  b2.length===2 && b2[0].id===b1[0].id && b2[1].id===b1[1].id,
  'render1 id: '+b1.map(function(x){return x.id;}).join(',')+
  ' | render2 id: '+b2.map(function(x){return x.id;}).join(',')+
  '  → kimlik her render\'da değişiyorsa genişletme durumu hiçbir zaman geri yüklenemez');

// ── ÇEKİRDEK 2: "Tümünü göster" bir render'dan sonra AÇIK kalmalı ──
var targetId=b1[0].id;
sb.App.toggleAeonBubble(targetId);
appHTML=''; sb.App.go('bugun'); appHTML=''; sb.App.go('mesaj');   // arka plan render'ını taklit et
var render3=appHTML, b3=observerBubbles(render3);
var opened=b3.filter(function(x){ return x.id===targetId && x.exp==='1' && x.maxHeight==='none'; });
assert('4. genişletilmiş mesaj bir sonraki render\'da AÇIK kalıyor', opened.length===1,
  'tam render sonrası balon durumu: '+JSON.stringify(b3)+
  '  → exp=0/max-height:140px ise mesaj kullanıcı okurken kendiliğinden kapanmıştır');
assert('5. açık balonun düğmesi "Daralt" gösteriyor',
  /Daralt/.test(toggleLabels(render3)[targetId]||''),
  'düğme etiketi: '+JSON.stringify(toggleLabels(render3)[targetId]));

// ── ÇEKİRDEK 3: ÆON akışıyla ilgisi olmayan bir arka plan render'ı da kapatmamalı ──
// mergeInbox (yeni mesaj), applyReceipts (panel makbuzu), reminderLifecycleRun
// (30 sn timer) ve onAppForeground (focus/pageshow/visibilitychange) hepsi aynı
// render() fonksiyonuna iner; hangisi tetiklerse tetiklesin sonuç aynıdır.
// Bu adım o tam render'ı IIFE dışından erişilebilen bir handler ile taklit eder.
appHTML=''; sb.App.setTheme(true);
var render4=appHTML, b4=observerBubbles(render4);
var stillOpen=b4.filter(function(x){ return x.id===targetId && x.exp==='1'; });
assert('6. alakasız arka plan render\'ı okunmakta olan mesajı kapatmıyor', stillOpen.length===1,
  'arka plan render\'ı sonrası: '+JSON.stringify(b4));
sb.App.setTheme(false);

// ── ÇEKİRDEK 4: yalnızca dokunulan balon açılır; diğerleri kapalı kalır ──
var otherId=b1[1].id;
var other=b3.filter(function(x){ return x.id===otherId; })[0];
assert('7. diğer mesajlar kapalı kalıyor (genişletme balona özel)',
  !!other && other.exp==='0' && other.maxHeight!=='none',
  'diğer balon: '+JSON.stringify(other));

// ── ÇEKİRDEK 5: tekrar dokunmak kalıcı olarak daraltır ──
sb.App.toggleAeonBubble(targetId);
appHTML=''; sb.App.go('bugun'); appHTML=''; sb.App.go('mesaj');
var b5=observerBubbles(appHTML);
var reclosed=b5.filter(function(x){ return x.id===targetId && x.exp==='0'; });
assert('8. "Daralt" da render\'lar arasında kalıcı', reclosed.length===1,
  'daraltma sonrası: '+JSON.stringify(b5));

// ── SINIR: genişletme görünüm durumudur; kalıcı `data`ya yazılmaz ──
var persisted=JSON.parse(sb.localStorage.getItem('seyma-reset-v1')||'{}');
assert('9. genişletme senkronlanan `data` nesnesini kirletmiyor',
  !('aeonExpanded' in persisted) && !(persisted.settings && 'aeonExpanded' in persisted.settings),
  'kalıcı state\'te aeonExpanded bulundu');
assert('10. mesaj metni hâlâ tam olarak render ediliyor (kırpma yalnız görsel)',
  render3.indexOf('Seninle gurur duyuyorum.')>-1,
  'kırpılmış balonda tam metin kaybolmuş');

// ── AYNI SEKMEDEKİ DİĞER KIRPMA YÜZEYLERİ (Luna + ÆON soru/yanıt) ──
// Ayrı sandbox: ana bloktaki gözlemci iddialarına karışmasın.
var sb2=buildSandbox(seedState(true));
var ctx2=vm.createContext(sb2);
FILES.forEach(function(f){ vm.runInContext(fs.readFileSync(path.join(repoRoot,f),'utf8'),ctx2,{filename:f}); });
sb2.App.start(); appHTML=''; sb2.App.go('mesaj');
var allIds=extractBubbles(appHTML).map(function(x){ return x.id; });

var lunaIds=allIds.filter(function(id){ return id.indexOf('aeon-bubble-l-')===0; });
assert('12. Luna\'nın uzun soru/yanıtı da kararlı kimlikli balon üretiyor', lunaIds.length===2,
  'bulunan Luna balonu: '+JSON.stringify(lunaIds)+' | tüm kimlikler: '+JSON.stringify(allIds));
if(lunaIds.length===2){
  sb2.App.toggleMsg(lunaIds[1]);
  appHTML=''; sb2.App.go('bugun'); appHTML=''; sb2.App.go('mesaj');
  var lb=extractBubbles(appHTML).filter(function(x){ return x.id===lunaIds[1]; })[0];
  assert('13. Luna yanıtı genişletildikten sonra render\'lar boyunca açık kalıyor',
    !!lb && lb.exp==='1' && lb.maxHeight==='none', 'Luna balonu: '+JSON.stringify(lb));
  assert('14. Luna düğmesi "Daha az göster" oluyor',
    /Daha az göster/.test(toggleLabels(appHTML)[lunaIds[1]]||''),
    'düğme etiketi: '+JSON.stringify(toggleLabels(appHTML)[lunaIds[1]]));
}

assert('15. soru ve yanıt balonları mesaj kimliğine bağlı ayrı anahtar alıyor',
  allIds.indexOf('aeon-bubble-q-q_abc123')>-1 && allIds.indexOf('aeon-bubble-a-q_abc123')>-1,
  'bulunan kimlikler: '+JSON.stringify(allIds));
sb2.App.toggleAeonBubble('aeon-bubble-a-q_abc123');
appHTML=''; sb2.App.setTheme(true); sb2.App.setTheme(false);
appHTML=''; sb2.App.go('bugun'); appHTML=''; sb2.App.go('mesaj');
var ansB=extractBubbles(appHTML).filter(function(x){ return x.id==='aeon-bubble-a-q_abc123'; })[0];
var qB=extractBubbles(appHTML).filter(function(x){ return x.id==='aeon-bubble-q-q_abc123'; })[0];
assert('16. ÆON yanıtı açıldıktan sonra render\'lar boyunca açık kalıyor',
  !!ansB && ansB.exp==='1' && ansB.maxHeight==='none', 'yanıt balonu: '+JSON.stringify(ansB));
assert('17. aynı soru-yanıt çiftinde soru balonu bağımsız kalıyor',
  !!qB && qB.exp==='0', 'soru balonu: '+JSON.stringify(qB));

// ── KAYNAK SEVİYESİ: hangi arka plan yollarının tam render tetiklediğini kayda geçir ──
// (Bu yollar IIFE içinde olduğu için dışarıdan çağrılamaz; varlıkları kaynaktan
// doğrulanır — böylece "mesaj kendiliğinden kapanıyor" penceresi belgelenmiş olur.)
var appSrc=fs.readFileSync(path.join(repoRoot,'app.js'),'utf8');
var triggers=[
  ['mergeInbox → render()', /added>0\|\|answeredCount>0\)\{\s*\n?\s*render\(\)/],
  ['applyReceipts → render()', /if\(changed\)\{ save\(\); render\(\); \}/],
  ['30 sn ÆON poll', /setInterval\(pollRemote,30000\)/],
  ['30 sn reminder lifecycle timer', /setInterval\(reminderLifecycleTick,REMINDER_LIFECYCLE_INTERVAL_MS\)/],
  ['foreground (focus/pageshow/visibilitychange)', /window\.addEventListener\('focus',function\(\)\{ onAppForeground\('focus'\)/]
];
var found=triggers.filter(function(t){ return t[1].test(appSrc); });
assert('11. arka plan tam-render tetikleyicileri hâlâ mevcut (kapanma penceresi gerçek)',
  found.length===triggers.length,
  'bulunan: '+found.map(function(t){return t[0];}).join(' | '));

// Hızlı ekleme yolu (appendAeonOutgoing) tam render ile AYNI balon anahtarını
// üretmeli; yoksa uzun bir soruyu gönderip hemen açtığında ilk tam render kapatır.
var appendCalls=appSrc.match(/appendAeonOutgoing\(\{[^}]*\}\)/g)||[];
assert('18. hızlı ekleme yolu tam render ile aynı balon anahtarını taşıyor',
  appendCalls.length>0 && appendCalls.every(function(c){ return /qaId:qid/.test(c) && /qaField:'question'/.test(c); }),
  appendCalls.length+' çağrı bulundu; anahtarsız olan(lar) var');

console.log('\n'+passes+' geçti, '+failures+' kaldı.');
process.exit(failures?1:0);
