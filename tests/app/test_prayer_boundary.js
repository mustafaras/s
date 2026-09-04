'use strict';

// MON-19 · SeymaPrayer registry sınırı.
// Yalnız sentetik state, mock fetch ve no-op timer kullanır; gerçek ağ, GPS,
// browser profili veya seyma-data yazımı yoktur.
var fs=require('fs');
var path=require('path');
var vm=require('vm');
var repoRoot=require('../repo-root');
var passed=0,failed=0;
function ok(name,condition,detail){
  if(condition){ passed++; console.log('  ✓ '+name); }
  else { failed++; console.log('  ✗ '+name+(detail?' — '+detail:'')); }
}
var store=Object.create(null), storageGets=0, storageSets=0, fetchCalls=0, timerCalls=0, clearCalls=0, saveCalls=0;
var localStorage={
  getItem:function(key){ storageGets++; return Object.prototype.hasOwnProperty.call(store,key)?store[key]:null; },
  setItem:function(key,value){ storageSets++; store[key]=String(value); },
  removeItem:function(key){ delete store[key]; }
};
function fetchMock(url,opts){
  fetchCalls++;
  ok('fetch URL Aladhan timings sözleşmesini koruyor', /^https:\/\/api\.aladhan\.com\/v1\/timings\/2026-09-04\?/.test(url));
  ok('fetch credentials omit ve JSON Accept ile sınırlı', opts&&opts.credentials==='omit'&&opts.headers&&opts.headers.Accept==='application/json');
  return Promise.resolve({ok:true,json:function(){ return Promise.resolve({data:{timings:{Fajr:'04:31',Sunrise:'06:02',Dhuhr:'13:01',Asr:'16:42',Maghrib:'19:54',Isha:'21:20'}}}); }});
}
function AbortControllerMock(){ this.signal={}; this.abort=function(){}; }
var sandbox={
  console:console, window:null, localStorage:localStorage, fetch:fetchMock,
  AbortController:AbortControllerMock,
  setTimeout:function(){ timerCalls++; return 7; },
  clearTimeout:function(){ clearCalls++; },
  encodeURIComponent:encodeURIComponent, Promise:Promise, Date:Date, Math:Math,
  JSON:JSON, Object:Object, Array:Array, String:String, Number:Number, Boolean:Boolean,
  RegExp:RegExp, Error:Error, isNaN:isNaN, isFinite:isFinite
};
sandbox.window=sandbox;
vm.runInNewContext(fs.readFileSync(path.join(repoRoot,'app/core/prayer.js'),'utf8'),sandbox,{filename:'app/core/prayer.js'});
var prayer=sandbox.SeymaPrayer;

ok('SeymaPrayer load-safe registry expose edildi', prayer&&typeof prayer==='object');
ok('registry yüklemede fetch çağrısı yok', fetchCalls===0);
ok('registry yüklemede timer çağrısı yok', timerCalls===0);
ok('registry yüklemede cache/localStorage çağrısı yok', storageGets===0&&storageSets===0);
ok('eksik resolver bag fail-closed reddediliyor', prayer.registerPrayer({})===false);
ok('şehir ve vakit sabitleri doğru kardinalitede', prayer.PRAYER_ORDER.length===6&&prayer.PRAYER_CITIES.length===81&&Object.keys(prayer.PRAYER_NAMES).length===6);
ok('şehir adı normalizasyonu korunuyor', prayer.prayerCityByName('  ankara  ').name==='Ankara');
ok('boş prayer günü altı vakti ve cache alanlarını kuruyor', (function(){ var p=prayer.emptyPrayerDay(); return prayer.PRAYER_ORDER.every(function(k){ return p[k]&&p[k].time===''&&p[k].performed===false; })&&p.fetchedAt===''&&p.fetchedFor===''&&p.fetchedMethod===''&&p.fetchError===''; })());

var rootA={startDate:'2026-09-01',settings:{prayer:{method:'MWL',location:{lat:39.9,lon:32.8,cityName:'Ankara'}}},days:{'2026-09-04':{prayer:{}}}};
var rootB={startDate:'2026-09-01',settings:{prayer:{method:'isna',location:{lat:38.4,lon:27.1,cityName:'İzmir'}}},days:{'2026-09-04':{prayer:{}}}};
var current=rootA;
var deps={
  data:function(){ return current; },
  getDay:function(d,date){ return d.days[date]||(d.days[date]={prayer:{}}); },
  dayIndexFor:function(){ return 4; },
  todayStr:function(){ return '2026-09-04'; },
  addDays:function(s,n){ return n<0?'2026-09-03':'2026-09-04'; },
  pad:function(n){ return String(n).padStart(2,'0'); },
  esc:function(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); },
  save:function(){ saveCalls++; },
  storage:function(){ return localStorage; },
  fetch:function(){ return fetchMock; }
};
ok('tam resolver bag tek kez kaydediliyor', prayer.registerPrayer(deps)===true&&prayer.registerPrayer(deps)===false);
ok('state/date resolverları canlı root üzerinden okunuyor', prayer.prayerLocationHash()==='39.9,32.8,Ankara'&&prayer.prayerMethod()==='mwl');
current=rootB;
ok('rebind sonrası prayer state snapshot değil', prayer.prayerLocationHash()==='38.4,27.1,İzmir'&&prayer.prayerMethod()==='isna');

async function run(){
  var times=await prayer.fetchPrayerTimes('2026-09-04',true);
  ok('fetch yalnız explicit çağrıdan sonra açılıyor', fetchCalls===1&&times.fajr==='04:31'&&times.isha==='21:20');
  ok('fetch timerı mock/no-op sınırında açılıp temizleniyor', timerCalls===1&&clearCalls===1);
  ok('fetch sonucu cache yazıyor', storageSets===1&&prayer.prayerReadCache('2026-09-04',prayer.prayerLocationHash()).times.fajr==='04:31');
  var callsBefore=fetchCalls;
  var cached=await prayer.fetchPrayerTimes('2026-09-04',false);
  ok('taze cache fetchi tekrar etmiyor', fetchCalls===callsBefore&&cached.isha==='21:20');
  prayer.applyPrayerTimesToDay('2026-09-04',cached);
  ok('applyPrayerTimesToDay canlı gün referansını ve save shimini koruyor', rootB.days['2026-09-04'].prayer.fajr.time==='04:31'&&rootB.days['2026-09-04'].savedAt&&saveCalls===1);
  var malformed={prayer:{fajr:{performed:'yes'},futurePrayerField:'keep'}};
  var normalized=prayer.ensurePrayerDay(malformed);
  ok('ensurePrayerDay normalizer unknown alanı koruyup alanları düzeltir', normalized.futurePrayerField==='keep'&&normalized.fajr.performed===false&&normalized.isha&&normalized.isha.time==='');
  console.log('\n=== Özet ===');
  console.log('Passed: '+passed+' / '+(passed+failed));
  if(failed) process.exitCode=1;
}
run().catch(function(err){ console.error(err&&err.stack||err); process.exitCode=1; });
