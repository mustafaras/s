(function(){
  'use strict';

  // MON-19 · Namaz/vakit domain registry
  // ---------------------------------------------------------------------------
  // Registry yüklenirken hiçbir state, localStorage, konum, timer veya ağ
  // çağrısı yapılmaz. app.js, closure'daki canlı bağları aşağıdaki resolver
  // bag'iyle kaydeder; modül de bunları yalnız ilgili yardımcı çağrıldığında
  // çözer. Böylece import/reset/late-boot sonrası eski data snapshot'ı
  // tutulmaz ve fetch yolu yalnız kullanıcı eylemiyle açılır.
  var PRAYER_NAMES={fajr:'İmsak',sunrise:'Güneş',dhuhr:'Öğle',asr:'İkindi',maghrib:'Akşam',isha:'Yatsı'};
  var PRAYER_ORDER=['fajr','sunrise','dhuhr','asr','maghrib','isha'];
  var PRAYER_CITIES=[
    {name:'Adana',lat:37.0,lon:35.3213},{name:'Adıyaman',lat:37.7644,lon:38.2763},{name:'Afyonkarahisar',lat:38.7507,lon:30.5567},{name:'Ağrı',lat:39.7191,lon:43.0503},{name:'Amasya',lat:40.6499,lon:35.8353},{name:'Ankara',lat:39.9334,lon:32.8597},{name:'Antalya',lat:36.8969,lon:30.7133},{name:'Artvin',lat:41.1800,lon:41.8200},{name:'Aydın',lat:37.8380,lon:27.8456},{name:'Balıkesir',lat:39.6492,lon:27.8861},{name:'Bilecik',lat:40.1457,lon:29.9794},{name:'Bingöl',lat:38.8845,lon:40.4939},{name:'Bitlis',lat:38.4000,lon:42.1200},{name:'Bolu',lat:40.7350,lon:31.6061},{name:'Burdur',lat:37.7203,lon:30.2908},{name:'Bursa',lat:40.1826,lon:29.0665},{name:'Çanakkale',lat:40.1553,lon:26.4142},{name:'Çankırı',lat:40.6013,lon:33.6134},{name:'Çorum',lat:40.5506,lon:34.9556},{name:'Denizli',lat:37.7765,lon:29.0864},{name:'Diyarbakır',lat:37.9143,lon:40.2306},{name:'Edirne',lat:41.6772,lon:26.5557},{name:'Elazığ',lat:38.6748,lon:39.2225},{name:'Erzincan',lat:39.7463,lon:39.4911},{name:'Erzurum',lat:39.9043,lon:41.2679},{name:'Eskişehir',lat:39.7667,lon:30.5256},{name:'Gaziantep',lat:37.0662,lon:37.3833},{name:'Giresun',lat:40.9128,lon:38.3895},{name:'Gümüşhane',lat:40.4608,lon:39.4814},{name:'Hakkari',lat:37.5833,lon:43.7333},{name:'Hatay',lat:36.2026,lon:36.1604},{name:'Isparta',lat:37.7644,lon:30.5522},{name:'Mersin',lat:36.8121,lon:34.6415},{name:'İstanbul',lat:41.0082,lon:28.9784},{name:'İzmir',lat:38.4192,lon:27.1287},{name:'Kars',lat:40.6013,lon:43.0945},{name:'Kastamonu',lat:41.3887,lon:33.7827},{name:'Kayseri',lat:38.7205,lon:35.4826},{name:'Kırklareli',lat:41.7333,lon:27.2167},{name:'Kırşehir',lat:39.1425,lon:34.1709},{name:'Kocaeli',lat:40.7654,lon:29.9408},{name:'Konya',lat:37.8667,lon:32.4833},{name:'Kütahya',lat:39.4167,lon:29.9833},{name:'Malatya',lat:38.3552,lon:38.3095},{name:'Manisa',lat:38.6191,lon:27.4289},{name:'Kahramanmaraş',lat:37.5858,lon:36.9371},{name:'Mardin',lat:37.3212,lon:40.7245},{name:'Muğla',lat:37.2153,lon:28.3636},{name:'Muş',lat:38.7432,lon:41.5064},{name:'Nevşehir',lat:38.6247,lon:34.7142},{name:'Niğde',lat:37.9667,lon:34.6833},{name:'Ordu',lat:40.9839,lon:37.8764},{name:'Rize',lat:41.0201,lon:40.5235},{name:'Sakarya',lat:40.7563,lon:30.3783},{name:'Samsun',lat:41.2928,lon:36.3313},{name:'Siirt',lat:37.9293,lon:41.9420},{name:'Sinop',lat:42.0265,lon:35.1511},{name:'Sivas',lat:39.7477,lon:37.0179},{name:'Tekirdağ',lat:40.9780,lon:27.5111},{name:'Tokat',lat:40.3167,lon:36.5544},{name:'Trabzon',lat:41.0015,lon:39.7178},{name:'Tunceli',lat:39.1079,lon:39.5401},{name:'Şanlıurfa',lat:37.1591,lon:38.7969},{name:'Uşak',lat:38.6823,lon:29.4082},{name:'Van',lat:38.5012,lon:43.3727},{name:'Yozgat',lat:39.8181,lon:34.8147},{name:'Zonguldak',lat:41.4564,lon:31.7987},{name:'Aksaray',lat:38.3687,lon:34.0360},{name:'Bayburt',lat:40.2552,lon:40.2249},{name:'Karaman',lat:37.1811,lon:33.2150},{name:'Kırıkkale',lat:39.8508,lon:33.5063},{name:'Batman',lat:37.8812,lon:41.1301},{name:'Şırnak',lat:37.4187,lon:42.4918},{name:'Bartın',lat:41.6358,lon:32.3375},{name:'Ardahan',lat:41.1105,lon:42.7022},{name:'Iğdır',lat:39.9208,lon:44.0450},{name:'Yalova',lat:40.6500,lon:29.2667},{name:'Karabük',lat:41.2000,lon:32.6333},{name:'Kilis',lat:36.7184,lon:37.1212},{name:'Osmaniye',lat:37.0741,lon:36.2462},{name:'Düzce',lat:40.8438,lon:31.1565}
  ];
  var PRAYER_METHODS={diyanet:13,mwl:3,isna:2,karachi:1,makkah:4,egypt:5,tehran:7,ghana:8,kosovo:9};

  var PRAYER_DEPENDENCIES=['data','getDay','dayIndexFor','todayStr','addDays','pad','esc','save','storage','fetch'];
  var prayerDeps=null;
  function registerPrayer(deps){
    if(prayerDeps||!deps||typeof deps!=='object'||Array.isArray(deps)) return false;
    for(var i=0;i<PRAYER_DEPENDENCIES.length;i++) if(typeof deps[PRAYER_DEPENDENCIES[i]]!=='function') return false;
    prayerDeps=deps;
    return true;
  }
  function dep(name){ return prayerDeps&&typeof prayerDeps[name]==='function'?prayerDeps[name]:null; }
  function stateData(){
    var f=dep('data');
    if(f){ try{ return f(); }catch(e){} }
    var st=window.SeymaState;
    return st?st.data:null;
  }
  function stateGetDay(d,date,idx){
    var f=dep('getDay');
    if(f){ try{ return f(d,date,idx); }catch(e){} }
    var st=window.SeymaState;
    return st&&typeof st.getDay==='function'?st.getDay(d,date,idx):null;
  }
  function dateCall(name,args,fallback){
    var f=dep(name);
    if(f){ try{ return f.apply(null,args); }catch(e){} }
    var du=window.SeymaDateUtils;
    if(du&&typeof du[name]==='function') return du[name].apply(null,args);
    return fallback.apply(null,args);
  }
  function escValue(value){
    var f=dep('esc');
    if(f){ try{ return f(value); }catch(e){} }
    var h=window.SeymaHelpers;
    if(h&&typeof h.esc==='function') return h.esc(value);
    return String(value==null?'':value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function storage(){
    var f=dep('storage');
    if(f){ try{ return f(); }catch(e){} }
    return window.localStorage||null;
  }
  function save(){
    var f=dep('save');
    if(f){ return f.apply(null,Array.prototype.slice.call(arguments)); }
    var s=window.SeymaSave;
    if(s&&typeof s.save==='function') return s.save.apply(s,arguments);
    return undefined;
  }
  function fetchImpl(){
    var f=dep('fetch');
    if(f){ try{ return f(); }catch(e){} }
    return typeof window.fetch==='function'?window.fetch:null;
  }
  function timer(name){
    var f=window[name];
    return typeof f==='function'?f:null;
  }

  function prayerCityByName(name){
    if(!name) return null;
    var n=String(name).trim().toLowerCase().replace(/ş/g,'s').replace(/ı/g,'i').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ö/g,'o').replace(/ç/g,'c');
    for(var i=0;i<PRAYER_CITIES.length;i++){
      var c=PRAYER_CITIES[i];
      var cn=String(c.name).toLowerCase().replace(/ş/g,'s').replace(/ı/g,'i').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ö/g,'o').replace(/ç/g,'c');
      if(cn===n) return c;
    }
    return null;
  }
  function prayerCityOptionsHTML(selected){
    var s=selected||'';
    return PRAYER_CITIES.map(function(c){ var sel=c.name===s?' selected':''; return '<option value="'+escValue(c.name)+'"'+sel+'>'+escValue(c.name)+'</option>'; }).join('');
  }
  function emptyPrayerEntry(time){
    return {time:time||'',performed:false,inCongregation:false,late:false,madeUp:false,nafile:0,note:'',savedAt:''};
  }
  function emptyPrayerDay(){
    var p={};
    PRAYER_ORDER.forEach(function(k){ p[k]=emptyPrayerEntry(); });
    p.fetchedAt=''; p.fetchedFor=''; p.fetchedMethod=''; p.fetchError='';
    return p;
  }
  function ensurePrayerDay(day){
    if(!day) return null;
    if(!day.prayer||typeof day.prayer!=='object') day.prayer=emptyPrayerDay();
    var p=day.prayer;
    PRAYER_ORDER.forEach(function(k){ if(!p[k]||typeof p[k]!=='object') p[k]=emptyPrayerEntry(); var e=p[k]; if(typeof e.time!=='string') e.time=''; if(typeof e.performed!=='boolean') e.performed=false; if(typeof e.inCongregation!=='boolean') e.inCongregation=false; if(typeof e.late!=='boolean') e.late=false; if(typeof e.madeUp!=='boolean') e.madeUp=false; if(typeof e.nafile!=='number'||isNaN(e.nafile)) e.nafile=0; if(typeof e.note!=='string') e.note=''; if(typeof e.savedAt!=='string') e.savedAt=''; });
    if(typeof p.fetchedAt!=='string') p.fetchedAt=''; if(typeof p.fetchedFor!=='string') p.fetchedFor=''; if(typeof p.fetchedMethod!=='string') p.fetchedMethod=''; if(typeof p.fetchError!=='string') p.fetchError='';
    return p;
  }
  function prayerSettings(){
    var d=stateData();
    return (d&&d.settings&&d.settings.prayer)||{};
  }
  function prayerLocation(){ var s=prayerSettings(); return s.location||null; }
  function prayerLocationHash(){ var loc=prayerLocation(); if(!loc||typeof loc!=='object') return ''; return String(loc.lat||'')+','+String(loc.lon||'')+','+String(loc.cityName||''); }
  function prayerMethod(){ var s=prayerSettings(); var m=String(s.method||'diyanet').toLowerCase(); return PRAYER_METHODS.hasOwnProperty(m)?m:'diyanet'; }
  function prayerAdjustments(){ var s=prayerSettings(); var a=s.adjustments||{}, out={}; PRAYER_ORDER.forEach(function(k){ var v=Number(a[k]); out[k]=!isNaN(v)?Math.max(-90,Math.min(90,v)):0; }); return out; }

  function fmtPrayerTime(d){ if(!d||isNaN(d.getTime())) return ''; return dateCall('pad',[d.getHours()],function(n){ return String(n).padStart(2,'0'); })+':'+dateCall('pad',[d.getMinutes()],function(n){ return String(n).padStart(2,'0'); }); }
  function parsePrayerTime(t){ if(!t||typeof t!=='string') return null; var m=t.match(/^(\d{1,2}):(\d{2})$/); if(!m) return null; return {h:+m[1],m:+m[2]}; }
  function prayerCacheKey(date,locHash){ return 'seyma-prayer-cache-v1:'+String(date||'')+':'+String(locHash||prayerLocationHash()); }
  function prayerReadCache(date,locHash){
    try{ var s=storage(), raw=s&&s.getItem(prayerCacheKey(date,locHash)); if(raw){ var v=JSON.parse(raw); if(v&&typeof v==='object'&&v.times) return v; } }catch(e){}
    return null;
  }
  function prayerWriteCache(date,locHash,method,val){
    try{ var s=storage(); if(s) s.setItem(prayerCacheKey(date,locHash),JSON.stringify({date:date,locHash:locHash,method:method||'',times:val,fetchedAt:new Date().toISOString()})); }catch(e){}
  }

  // ── IIP-13 · Tazelik ve kapsam (salt-okur) ────────────────────────────────
  // Cache geçerliliği yalnız yaşa göre değil GÜN + KONUM(şehir/koordinat) +
  // YÖNTEM eşleşmesine göre değerlendirilir; uyuşmazlıkta kayıt "güncel"
  // sayılmaz (REQ-025). Bu yardımcılar kayıt oluşturmaz, ağa çıkmaz, state
  // yazmaz ve `Date.now()` yerine verilen `nowMs`'i kullanabilir (deterministik
  // test). Türkiye kapsamı açıkça raporlanır; yurtdışı konum için yerel saat
  // iddiası kurulmaz (REQ-026).
  var PRAYER_STALE_HOURS=48;
  function prayerAgeInfo(fetchedAt,nowMs){
    var t=Date.parse(String(fetchedAt||''));
    if(!isFinite(t)) return {ageH:null,stale:true};
    var base=isFinite(Number(nowMs))?Number(nowMs):Date.now();
    var ageH=(base-t)/3600000;
    if(!isFinite(ageH)||ageH<0) ageH=0;
    return {ageH:Math.round(ageH*10)/10,stale:ageH>=PRAYER_STALE_HOURS};
  }
  function prayerMethodLabel(method){
    var labels={diyanet:'Diyanet yöntemi',mwl:'Muslim World League',isna:'ISNA',karachi:'Karachi',makkah:'Umm al-Qura',egypt:'Egyptian General Authority',tehran:'Tehran',ghana:'Ghana',kosovo:'Kosovo'};
    var key=String(method||'diyanet').toLowerCase();
    return labels[key]||'Diyanet yöntemi';
  }
  function prayerCacheEntry(date,locHash){
    var v=prayerReadCache(date||dateCall('todayStr',[],function(){ return ''; }),locHash===undefined?prayerLocationHash():locHash);
    if(!v||typeof v!=='object') return null;
    return {times:v.times||null,method:String(v.method||''),fetchedAt:String(v.fetchedAt||''),locHash:String(v.locHash||''),date:String(v.date||'')};
  }
  function prayerCacheFreshness(o){
    o=o||{};
    var locHash=o.locHash===undefined?prayerLocationHash():String(o.locHash||'');
    var method=o.method===undefined?prayerMethod():String(o.method||'');
    var date=o.date||dateCall('todayStr',[],function(){ return ''; });
    var entry=prayerCacheEntry(date,locHash);
    if(!entry||!entry.times) return {state:'none',label:'Önbellek yok',detail:'Bu gün ve konum için kayıtlı vakit yok',stale:true,usable:false,ageH:null};
    if(entry.method!==method) return {state:'mismatch',label:'Yöntem uyuşmuyor',detail:'Kayıt '+prayerMethodLabel(entry.method)+', seçili '+prayerMethodLabel(method)+' · eski önbellek kullanılmaz',stale:true,usable:false,ageH:null};
    var age=prayerAgeInfo(entry.fetchedAt,o.nowMs), stamp=String(entry.fetchedAt).slice(0,16).replace('T',' '), ago='~'+String(Math.round(age.ageH))+' saat önce';
    if(age.stale) return {state:'stale',label:'Eski önbellek',detail:'Son kayıt '+stamp+' · '+ago,stale:true,usable:false,ageH:age.ageH};
    return {state:'fresh',label:'Güncel önbellek',detail:'Son kayıt '+stamp+' · '+ago,stale:false,usable:true,ageH:age.ageH};
  }
  // Uygulamanın kendi gün hesabı: kayıt tarihi bugün değilse gün dönmemiştir
  // (gece yarısı uyarısı). Başka güne ait kayıt güncel saat sayılmaz.
  function prayerDayFreshness(fetchedAt,date,nowMs){
    var dt=date||dateCall('todayStr',[],function(){ return ''; });
    if(!fetchedAt) return {state:'none',label:'Vakit yok',detail:'Kayıt henüz dolmadı',stale:true,dayMatch:false,ageH:null};
    if(String(fetchedAt).slice(0,10)!==String(dt)) return {state:'otherday',label:'Başka güne ait',detail:'Kayıt tarihi '+String(fetchedAt).slice(0,10)+' · bugün '+String(dt),stale:true,dayMatch:false,ageH:null};
    var age=prayerAgeInfo(fetchedAt,nowMs);
    return {state:age.stale?'stale':'fresh',label:age.stale?'Eski kayıt':'Bugüne ait',detail:'Son kayıt '+String(fetchedAt).slice(0,16).replace('T',' '),stale:age.stale,dayMatch:true,ageH:age.ageH};
  }
  // Türkiye kapsamı: şehir listesi yalnız 81 il içindir ve hesap yöntemi
  // Diyanet'tir. Koordinat TR kutusunun dışındaysa yerel saat iddiası kurulmaz.
  function prayerInTurkey(lat,lon){
    var la=Number(lat),lo=Number(lon);
    if(!isFinite(la)||!isFinite(lo)) return false;
    return la>=35.6&&la<=42.4&&lo>=25.5&&lo<=45.0;
  }
  function prayerCoverage(loc){
    var l=loc||prayerLocation();
    if(!l||typeof l!=='object'||isNaN(+l.lat)||isNaN(+l.lon)) return {state:'none',label:'Konum yok',detail:'Şehir seçilince kapsam doğrulanır',inTurkey:false,needsOwnTimezone:false};
    var tr=prayerInTurkey(l.lat,l.lon), gps=String(l.source||'').toLowerCase()==='gps', name=l.cityName?String(l.cityName):'konum';
    if(!tr) return {state:'outside',label:'Türkiye dışı',detail:(gps?'GPS '+name:name)+' · Türkiye listesi dışında · yerel saat olarak sunulmaz',inTurkey:false,needsOwnTimezone:true};
    return {state:'inside',label:'Türkiye kapsamı içinde',detail:(l.cityName?String(l.cityName)+' · ':'')+'81 il listesi ve Diyanet yöntemi',inTurkey:true,needsOwnTimezone:false};
  }
  function prayerTimesFromDay(p){ var out={}; PRAYER_ORDER.forEach(function(k){ out[k]=(p[k]&&p[k].time)||''; }); return out; }
  function currentPrayerIndex(times){
    var now=new Date(), curMin=now.getHours()*60+now.getMinutes(), best=-1;
    for(var i=PRAYER_ORDER.length-1;i>=0;i--){ var k=PRAYER_ORDER[i], pt=parsePrayerTime(times&&times[k]); if(pt){ var m=pt.h*60+pt.m; if(curMin>=m-1){ best=i; break; } } }
    return best;
  }
  function fetchAladhanTimes(date,lat,lon,method){
    var fetcher=fetchImpl();
    if(typeof fetcher!=='function') return Promise.reject(new Error('fetch yok'));
    var d=date||dateCall('todayStr',[],function(){ var x=new Date(); return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0'); });
    var url='https://api.aladhan.com/v1/timings/'+d+'?latitude='+encodeURIComponent(lat)+'&longitude='+encodeURIComponent(lon)+'&method='+encodeURIComponent(PRAYER_METHODS[method]||13)+'&timezonestring=Europe/Istanbul';
    var ctrl=(typeof window.AbortController==='function')?new window.AbortController():null, timeout=null, setTimer=timer('setTimeout'), clearTimer=timer('clearTimeout');
    if(ctrl&&setTimer) timeout=setTimer(function(){ try{ ctrl.abort(); }catch(e){} },16000);
    var opts={headers:{'Accept':'application/json'},credentials:'omit'}; if(ctrl) opts.signal=ctrl.signal;
    function clear(){ if(timeout&&clearTimer) clearTimer(timeout); }
    return fetcher(url,opts).then(function(res){ clear(); if(!res.ok){ var e=new Error('Vakit API '+res.status); e.status=res.status; return Promise.reject(e); } return res.json(); },function(err){ clear(); return Promise.reject(err); });
  }
  function fetchPrayerTimes(date,force){
    var loc=prayerLocation();
    if(!loc||typeof loc!=='object'||isNaN(+loc.lat)||isNaN(+loc.lon)) return Promise.reject(new Error('Konum ayarlanmamış'));
    var locHash=prayerLocationHash(), method=prayerMethod();
    if(!force){
      var cached=prayerReadCache(date,locHash);
      if(cached&&cached.times&&cached.fetchedAt&&String(cached.method||'')===method){ var ageH=(Date.now()-new Date(cached.fetchedAt).getTime())/3600000; if(ageH<48) return Promise.resolve(cached.times); }
      var d=stateData(), day=stateGetDay(d,date,dateCall('dayIndexFor',[date],function(){ return 1; })), p=(day&&day.prayer)||{};
      if(p.fetchedAt&&p.fetchedFor===locHash&&String(p.fetchedMethod||'')===method){ var age2=(Date.now()-new Date(p.fetchedAt).getTime())/3600000; if(age2<48) return Promise.resolve(prayerTimesFromDay(p)); }
    }
    return fetchAladhanTimes(date,loc.lat,loc.lon,prayerMethod()).then(function(j){
      if(!j||!j.data||!j.data.timings) return Promise.reject(new Error('Vakit verisi boş'));
      var t=j.data.timings, map={fajr:t.Fajr,sunrise:t.Sunrise,dhuhr:t.Dhuhr,asr:t.Asr,maghrib:t.Maghrib,isha:t.Isha};
      prayerWriteCache(date,locHash,method,map); return map;
    });
  }
  function applyPrayerTimesToDay(date,times){
    var d=stateData(), day=stateGetDay(d,date,dateCall('dayIndexFor',[date],function(){ return 1; })), p=ensurePrayerDay(day);
    PRAYER_ORDER.forEach(function(k){ p[k].time=String(times[k]||''); });
    p.fetchedAt=new Date().toISOString(); p.fetchedFor=prayerLocationHash(); p.fetchedMethod=prayerMethod(); p.fetchError='';
    day.savedAt=new Date().toISOString(); save();
  }
  function prayerDaySummary(p){
    var total=0,performed=0,congregation=0,late=0,madeUp=0,nafile=0;
    PRAYER_ORDER.forEach(function(k){ var e=p&&p[k]; if(!e) return; total++; if(e.performed){ performed++; if(e.inCongregation) congregation++; if(e.late) late++; if(e.madeUp) madeUp++; } nafile+=Math.max(0,Number(e.nafile)||0); });
    return {total:total,performed:performed,congregation:congregation,late:late,madeUp:madeUp,nafile:nafile};
  }
  function prayerPerformedCount(p){ var n=0; PRAYER_ORDER.forEach(function(k){ if(p&&p[k]&&p[k].performed) n++; }); return n; }
  function prayerAllDone(p){ return prayerPerformedCount(p)>=5; }
  function prayerStreak(){
    var dta=stateData()||{}, days=dta.days||{}, streak=0, d=dateCall('todayStr',[],function(){ return ''; });
    while(true){ var day=days[d], p=day&&day.prayer; if(!p||!prayerAllDone(p)) break; streak++; d=dateCall('addDays',[d,-1],function(){ return ''; }); if(d<dta.startDate&&streak>0) break; if(d<dta.startDate) break; }
    return streak;
  }
  function nextPrayerInfo(times){
    times=times||{};
    var now=new Date(),curMin=now.getHours()*60+now.getMinutes(),name='—',key=null,remMin=null,nextMin=null;
    for(var i=0;i<PRAYER_ORDER.length;i++){ var k=PRAYER_ORDER[i],pt=parsePrayerTime(times[k]); if(!pt) continue; var m=pt.h*60+pt.m; if(m>curMin){ key=k; name=PRAYER_NAMES[k]||k; nextMin=m; break; } }
    if(!key){ key=PRAYER_ORDER[0]; name=PRAYER_NAMES[PRAYER_ORDER[0]]; var pt2=parsePrayerTime(times[PRAYER_ORDER[0]]); if(pt2) nextMin=(pt2.h*60+pt2.m)+24*60; }
    if(nextMin!=null){ var diff=nextMin-curMin; remMin=diff<=0?24*60+diff:diff; }
    return {key:key,name:name,remMin:remMin,label:remMin!=null?remMin+' dk':''};
  }

  window.SeymaPrayer={
    registerPrayer:registerPrayer,
    PRAYER_NAMES:PRAYER_NAMES,
    PRAYER_ORDER:PRAYER_ORDER,
    PRAYER_CITIES:PRAYER_CITIES,
    PRAYER_METHODS:PRAYER_METHODS,
    prayerCityByName:prayerCityByName,
    prayerCityOptionsHTML:prayerCityOptionsHTML,
    emptyPrayerEntry:emptyPrayerEntry,
    emptyPrayerDay:emptyPrayerDay,
    ensurePrayerDay:ensurePrayerDay,
    prayerSettings:prayerSettings,
    prayerLocation:prayerLocation,
    prayerLocationHash:prayerLocationHash,
    prayerMethod:prayerMethod,
    prayerAdjustments:prayerAdjustments,
    fmtPrayerTime:fmtPrayerTime,
    parsePrayerTime:parsePrayerTime,
    prayerCacheKey:prayerCacheKey,
    prayerReadCache:prayerReadCache,
    prayerWriteCache:prayerWriteCache,
    PRAYER_STALE_HOURS:PRAYER_STALE_HOURS,
    prayerAgeInfo:prayerAgeInfo,
    prayerMethodLabel:prayerMethodLabel,
    prayerCacheEntry:prayerCacheEntry,
    prayerCacheFreshness:prayerCacheFreshness,
    prayerDayFreshness:prayerDayFreshness,
    prayerInTurkey:prayerInTurkey,
    prayerCoverage:prayerCoverage,
    prayerTimesFromDay:prayerTimesFromDay,
    currentPrayerIndex:currentPrayerIndex,
    fetchAladhanTimes:fetchAladhanTimes,
    fetchPrayerTimes:fetchPrayerTimes,
    applyPrayerTimesToDay:applyPrayerTimesToDay,
    prayerDaySummary:prayerDaySummary,
    prayerPerformedCount:prayerPerformedCount,
    prayerAllDone:prayerAllDone,
    prayerStreak:prayerStreak,
    nextPrayerInfo:nextPrayerInfo
  };
})();
