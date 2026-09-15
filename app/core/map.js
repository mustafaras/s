// MON-35 · map/location/weather domain registry.
// Access is read-only; geolocation permission, weather fetch and data writes remain in app.js.
(function(){
  'use strict';

  var mapDeps=null;
  var MAP_DEPENDENCIES=["data","ui","dark","todayStr","pad","countRec","habitCountOn","diffDays","moodEmoji","icon","esc","sciNote","bestStreak","moodDist","featuresLive","hidePill","cardOpen","fmtDist","fmtDur","autoModeLabel","healthSetupCardHTML","collapsibleCardHTML","haversineM","moods"];
  var MAP_MEMBERS=["locationCardHTML","hasLiveLocation","wxMode","weatherSpots","wxSpotIconName","wxSpotIcon","wxStale","wxMeta","wxAdvice","wxQuip","wxHm","wxSpotChip","wxLocationPendingChip","wxDetail","weatherHeaderHTML","haritaHTML"];

  function registerMap(deps){
    if(mapDeps||!deps||typeof deps!=='object'||Array.isArray(deps)) return false;
    for(var i=0;i<MAP_DEPENDENCIES.length;i++) if(typeof deps[MAP_DEPENDENCIES[i]]!=='function') return false;
    mapDeps=deps;
    return true;
  }
  function dep(name){ return mapDeps&&typeof mapDeps[name]==='function'?mapDeps[name]:null; }
  function call(name,args){ var f=dep(name); if(f) return f.apply(null,args||[]); throw new Error('SeymaMap: çözümlenemeyen bağımlılık '+name); }
  function liveData(){ return call('data',[]); }
  function liveUi(){ return call('ui',[]); }
  function liveDark(){ return !!call('dark',[]); }
  function todayStr(){ return call('todayStr',arguments); }
  function pad(){ return call('pad',arguments); }
  function countRec(){ return call('countRec',arguments); }
  function habitCountOn(){ return call('habitCountOn',arguments); }
  function diffDays(){ return call('diffDays',arguments); }
  function moodEmoji(){ return call('moodEmoji',arguments); }
  function icon(){ return call('icon',arguments); }
  function esc(){ return call('esc',arguments); }
  function sciNote(){ return call('sciNote',arguments); }
  function bestStreak(){ return call('bestStreak',arguments); }
  function moodDist(){ return call('moodDist',arguments); }
  function featuresLive(){ return call('featuresLive',arguments); }
  function hidePill(){ return call('hidePill',arguments); }
  function cardOpen(){ return call('cardOpen',arguments); }
  function fmtDist(){ return call('fmtDist',arguments); }
  function fmtDur(){ return call('fmtDur',arguments); }
  function autoModeLabel(){ return call('autoModeLabel',arguments); }
  function healthSetupCardHTML(){ return call('healthSetupCardHTML',arguments); }
  function collapsibleCardHTML(){ return call('collapsibleCardHTML',arguments); }
  function haversineM(){ return call('haversineM',arguments); }
  function moodCatalog(){ return call('moods',[]); }

function renderLocationCard(data){
  var s=data.settings||{};
  if(s.hideLocationCard) return '';
  var on=!!s.locationEnabled;
  var mode=s.locationMode||'auto';
  var today=todayStr();
  var rec=data.days[today]||null;
  var mv=rec&&rec.movement?rec.movement:{walkM:0,vehicleM:0,totalM:0,maxSpeed:0};
  var loc=data.location, upd='—';
  if(loc&&loc.ts){ var am=Math.round((Date.now()-new Date(loc.ts).getTime())/60000); upd = am<1?'az önce':am<60?am+' dk önce':am<1440?Math.round(am/60)+' sa önce':Math.round(am/1440)+' g önce'; }
  var swBg=on?'linear-gradient(135deg,#7DBE77,#5BA85B)':'linear-gradient(135deg,#E68A84,#D9534F)';
  var knobLeft=on?'26px':'3px';
  var hs=rec&&rec.health?rec.health:null;
  var hsBlock='';
  if(hs&&(hs.steps>0||hs.walkM>0)){
    var hsAge='';
    if(hs.updatedAt){ var hm=Math.round((Date.now()-new Date(hs.updatedAt).getTime())/60000); hsAge=hm<1?'az önce':hm<60?hm+' dk önce':hm<1440?Math.round(hm/60)+' sa önce':Math.round(hm/1440)+' g önce'; }
    hsBlock='<div style="display:flex;align-items:center;gap:10px;background:rgba(143,191,138,0.10);border:1px solid rgba(143,191,138,0.28);border-radius:14px;padding:10px 12px;">'
      +'<span style="flex-shrink:0;display:inline-flex;">'+icon('apple',18)+'</span>'
      +'<div style="flex:1;min-width:0;font-size:var(--f-footnote);color:var(--text2);"><b style="color:var(--text);">Sağlık senkronu:</b> '
      +(hs.steps>0?hs.steps.toLocaleString('tr-TR')+' adım':'')+(hs.steps>0&&hs.walkM>0?' · ':'')+(hs.walkM>0?fmtDist(hs.walkM):'')
      +'<div style="font-size:var(--f-caption2);color:var(--faint);margin-top:1px;">Telefon arka planda topladı'+(hsAge?' · '+hsAge:'')+'</div></div>'
      +'</div>';
  }
  // Açık/kapalı anahtarı başlıkta rozet olarak; anahtara dokunmak kartı açmasın (stopPropagation).
  var toggle='<button onclick="event.stopPropagation();App.toggleLocation()" aria-label="Konum aç/kapat" style="border:none;cursor:pointer;flex-shrink:0;width:50px;height:28px;border-radius:999px;position:relative;transition:background .2s;background:'+swBg+';"><span style="position:absolute;top:3px;left:'+(on?'25px':'3px')+';width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);transition:left .2s;"></span></button>';
  var statusPill='<span style="font-size:var(--f-caption2);font-weight:800;padding:2px 8px;border-radius:999px;color:#fff;background:'+(on?'#3F9A4F':'#D9534F')+';">'+(on?'AÇIK':'KAPALI')+'</span>';
  var badge='<div style="display:flex;align-items:center;gap:8px;">'+hidePill('location')+statusPill+toggle+'</div>';
  var subtitle=on?('Bugün '+fmtDist(mv.totalM)+' · ölçüm açık'):'GPS kapalı · açmak için sağdaki anahtar';
  var open=cardOpen('location', on);
  var b='';
  if(!on){
    b+=hsBlock;
    b+='<div style="font-size:var(--f-footnote);line-height:1.5;color:var(--text2);">Açtığında yürüyüş ve araç hareketlerin ölçülür (yalnızca uygulama açıkken).</div>';
    b+=healthSetupCardHTML(!!hs&&(hs.steps>0||hs.walkM>0));
    return collapsibleCardHTML({key:'location', id:'card-location', icon:icon('map-pin',18), accent:'#3F9A4F', title:'Konum & Hareket', subtitle:subtitle, badge:badge, open:open, body:b, hint:'ayrıntıları gör'});
  }
  function mbtn(id,emoji,label){ var act=mode===id; return '<button onclick="App.setLocationMode(\''+id+'\')" style="flex:1;border:1px solid '+(act?'#8FBF8A':'var(--card-bd)')+';cursor:pointer;padding:9px 4px;border-radius:12px;font-size:var(--f-footnote);font-weight:700;color:'+(act?'#2F7A3F':'var(--text2)')+';background:'+(act?'rgba(143,191,138,0.18)':'transparent')+';">'+emoji+' '+label+'</button>'; }
  b+='<div style="display:flex;gap:7px;">'+mbtn('walk',icon('footprints',14),'Yürüyüş')+mbtn('vehicle',icon('car',14),'Araç')+mbtn('auto',icon('sparkles',14),'Oto')+'</div>';
  b+='<div style="display:flex;gap:10px;">';
  b+='<div style="flex:1;background:var(--icon);border-radius:14px;padding:11px;text-align:center;"><div style="font-size:var(--f-caption2);color:var(--muted);font-weight:700;">Bugün toplam</div><div id="loc-dist-today" style="font-size:var(--f-headline);font-weight:800;color:var(--text);font-variant-numeric:tabular-nums;">'+fmtDist(mv.totalM)+'</div></div>';
  b+='<div style="flex:1;background:var(--icon);border-radius:14px;padding:11px;text-align:center;"><div style="font-size:var(--f-caption2);color:var(--muted);font-weight:700;">Anlık hız</div><div id="loc-speed" style="font-size:var(--f-headline);font-weight:800;color:var(--text);font-variant-numeric:tabular-nums;">0 km/sa</div></div>';
  b+='</div>';
  b+='<div style="display:flex;gap:8px;font-size:var(--f-footnote);">';
  b+='<span style="flex:1;background:rgba(143,191,138,0.14);border-radius:10px;padding:8px 10px;color:var(--text2);display:flex;align-items:center;gap:5px;">'+icon('footprints',14)+' Yürüyüş <b id="loc-walk" style="margin-left:auto;">'+fmtDist(mv.walkM)+'</b></span>';
  b+='<span style="flex:1;background:rgba(201,184,255,0.16);border-radius:10px;padding:8px 10px;color:var(--text2);display:flex;align-items:center;gap:5px;">'+icon('car',14)+' Araç <b id="loc-vehicle" style="margin-left:auto;">'+fmtDist(mv.vehicleM)+'</b></span>';
  b+='</div>';
  b+='<div style="display:flex;gap:8px;font-size:var(--f-footnote);">';
  b+='<span style="flex:1;background:rgba(143,191,138,0.10);border-radius:10px;padding:8px 10px;color:var(--text2);display:flex;align-items:center;gap:5px;">'+icon('clock',14)+' Ayakta <b id="loc-walk-dur" style="margin-left:auto;">'+fmtDur(mv.walkSec)+'</b></span>';
  b+='<span style="flex:1;background:rgba(201,184,255,0.11);border-radius:10px;padding:8px 10px;color:var(--text2);display:flex;align-items:center;gap:5px;">'+icon('clock',14)+' Yolda <b id="loc-veh-dur" style="margin-left:auto;">'+fmtDur(mv.vehicleSec)+'</b></span>';
  b+='</div>';
  if(mode==='auto') b+='<div style="font-size:var(--f-caption1);color:var(--faint);">Oto-mod: <b id="loc-auto-mode" style="color:var(--text2);">'+autoModeLabel()+'</b> · son güncelleme <span id="loc-updated">'+esc(upd)+'</span></div>';
  else b+='<div style="font-size:var(--f-caption1);color:var(--faint);">Son güncelleme <span id="loc-updated">'+esc(upd)+'</span></div>';
  b+=hsBlock;
  b+='<div style="font-size:var(--f-caption1);color:var(--faint);line-height:1.45;">GPS ölçümü yalnızca uygulama açıkken yapılır; Sağlık senkronu varsa tam günü tamamlar. Hareketler korunur, silinmez.</div>';
  b+=healthSetupCardHTML(!!hs&&(hs.steps>0||hs.walkM>0));
  return collapsibleCardHTML({key:'location', id:'card-location', icon:icon('map-pin',18), accent:'#3F9A4F', title:'Konum & Hareket', subtitle:subtitle, badge:badge, open:open, body:b, hint:'ayrıntıları gör'});
}


var WX_SPOTS_FIXED=[
  {key:'ev', label:'Ev', place:'Kazan', iconName:'house', lat:40.23, lng:32.68},
  {key:'is', label:'İş', place:'Altındağ', iconName:'building-2', lat:39.97, lng:32.92}
];
function hasLiveLocationFor(data){ return !!(data&&data.location&&typeof data.location.lat==='number'&&typeof data.location.lng==='number'); }
function wxModeFor(data){ var s=(data&&data.settings)?data.settings:{}; return (s.locationEnabled && hasLiveLocationFor(data)) ? 'live' : 'fixed'; }
function weatherSpotsFor(data){
  var fixed=WX_SPOTS_FIXED.slice();
  if(wxModeFor(data)==='live'){
    var nm=(data.weather&&data.weather.liveName)||'';
    return [{key:'live', label:'Konumun', place:nm, iconName:'map-pin', lat:data.location.lat, lng:data.location.lng}].concat(fixed);
  }
  return fixed;
}
function wxSpotIconName(sp){ return (sp&&sp.iconName)||(sp&&sp.key==='live'?'map-pin':(sp&&sp.key==='is'?'building-2':'house')); }
function wxSpotIcon(sp,size){ return icon(wxSpotIconName(sp),size||16); }
function wxStaleFor(data){
  var expected=weatherSpotsFor(data);
  if(!data.weather||!data.weather.fetchedAt||!(data.weather.spots&&data.weather.spots.length)) return true;
  if(data.weather.mode!==wxModeFor(data)) return true;
  if(data.weather.spots.length!==expected.length) return true;
  for(var i=0;i<expected.length;i++){ if(!data.weather.spots[i]||data.weather.spots[i].key!==expected[i].key) return true; }
  if(wxModeFor(data)==='live' && data.location && typeof data.location.lat==='number' && data.weather.coords){
    var moved=haversineM({lat:data.weather.coords.lat,lng:data.weather.coords.lng},{lat:data.location.lat,lng:data.location.lng});
    if(moved>3000) return true;   // ~3 km'den fazla oynadıysa konum havasını tazele
  }
  var age=Date.now()-new Date(data.weather.fetchedAt).getTime();
  return !(age>=0 && age<30*60000);
}


function wxMeta(code,isDay){
  var c=code;
  if(c===0) return {emoji:icon(isDay?'sun':'moon',18), label:isDay?'Açık':'Açık gece', cat:'clear'};
  if(c===1) return {emoji:icon(isDay?'cloud-sun':'moon',18), label:'Az bulutlu', cat:'clear'};
  if(c===2) return {emoji:icon('cloud-sun',18), label:'Parçalı bulutlu', cat:'cloud'};
  if(c===3) return {emoji:icon('cloud',18), label:'Bulutlu', cat:'cloud'};
  if(c===45||c===48) return {emoji:icon('cloud-fog',18), label:'Sisli', cat:'fog'};
  if(c>=51&&c<=57) return {emoji:icon('cloud-drizzle',18), label:'Çiseli', cat:'rain'};
  if(c>=61&&c<=67) return {emoji:icon('cloud-rain',18), label:'Yağmurlu', cat:'rain'};
  if(c>=71&&c<=77) return {emoji:icon('cloud-snow',18), label:'Karlı', cat:'snow'};
  if(c>=80&&c<=82) return {emoji:icon('cloud-rain',18), label:'Sağanak', cat:'rain'};
  if(c>=85&&c<=86) return {emoji:icon('cloud-snow',18), label:'Kar sağanağı', cat:'snow'};
  if(c>=95) return {emoji:icon('cloud-lightning',18), label:'Gök gürültülü', cat:'storm'};
  return {emoji:icon('thermometer',18), label:'—', cat:'cloud'};
}
function wxAdvice(sp){
  var a=[]; var t=(sp.feels!=null?sp.feels:sp.temp); var cat=wxMeta(sp.code,sp.isDay).cat;
  if(sp.uv!=null && sp.uv>=6) a.push({i:icon('sun',16), t:'UV yüksek ('+sp.uv+') — güneş kremi ve şapka ihmal etme'});
  if(t>=30) a.push({i:icon('droplet',16), t:'Sıcak — bol su iç, öğle güneşinden kaç, serinde kal'});
  else if(t>=26) a.push({i:icon('droplet',16), t:'Ilıman-sıcak — su şişeni yanına almayı unutma'});
  if(t<=4) a.push({i:icon('shirt',16), t:'Soğuk — katmanlı giyin, eklemlerini üşütme'});
  else if(t<=10) a.push({i:icon('shirt',16), t:'Serin — hafif bir mont bugün iyi gider'});
  if(cat==='rain'||(sp.pop!=null&&sp.pop>=50)) a.push({i:icon('umbrella',16), t:'Yağış ihtimali — şemsiyeni al; basınç değişimi baş ağrısı tetikleyebilir'});
  if(cat==='snow') a.push({i:icon('snowflake',16), t:'Kar/buz — zemin kaygan, adımına dikkat et'});
  if(cat==='storm') a.push({i:icon('cloud-lightning',16), t:'Fırtına — mümkünse dışarıyı ertele, içeride kal'});
  if(sp.wind!=null && sp.wind>=25) a.push({i:icon('wind',16), t:'Rüzgârlı ('+sp.wind+' km/sa) — saç/şal derdine hazırlıklı ol'});
  if(sp.hum!=null && sp.hum>=75 && t>=24) a.push({i:icon('droplets',16), t:'Nem yüksek — terleme artabilir, sıvı tüketmeyi ihmal etme'});
  if(!a.length) a.push({i:icon('flower-2',16), t:'Hava dengede — güzel bir gün için tam vaktinde'});
  return a.slice(0,3);
}
var WX_QUIPS={
  clear:['Güneş bugün senin için çıktı Günışığı; gölgesi bile yakışıyor sana','Gökyüzü açık, niyetin de öyle olsun — bugün senin sahnendesin','Böyle güzel bir günde tek eksik senin gülüşündü, o da geldi işte'],
  cloud:['Bulutlar geçici, sen kalıcısın Günışığı','Bulutlu ama kasvetli değil; sen içeriden ışıldıyorsun zaten','Gökyüzü biraz mahmur; kahveni al, ikiniz de uyanırsınız'],
  rain:['Yağmur toprağı, sen günü besliyorsun; ikiniz de bereketsiniz','Şemsiyen yanında olsun; ıslanmadan da dans edilir bu hayatta','Yağmur camda ritim tutuyor, sen de kendi şarkını mırıldan'],
  snow:['Kar sessizce yağar ama iz bırakır — tıpkı senin gibi','Dışarısı buz, içerisi sen: en sıcak yer neresi belli oldu','Kar tanesi kadar biriciksin Günışığı; üşüme sakın'],
  fog:['Sis var ama yolunu sen zaten kalbinle biliyorsun','Puslu bir sabah; net olan tek şey senin değerin'],
  storm:['Fırtına da geçer Günışığı; sen köklerinden eminsin','Gök gürlese de senin içindeki huzuru bastıramaz']
};
function wxQuip(cat){ var arr=WX_QUIPS[cat]||WX_QUIPS.clear; var seed=0,t=todayStr(); for(var i=0;i<t.length;i++) seed+=t.charCodeAt(i); return arr[seed%arr.length]; }
function wxHm(iso){ if(!iso) return '—'; var p=(iso.split('T')[1]||''); return p.slice(0,5)||'—'; }
function wxSpotChip(sp){ var dark=liveDark(),m=wxMeta(sp.code,sp.isDay),fg=dark?'#FFE1BC':'#7A3E1E',sub=dark?'#D6A57E':'#A85E3C'; return '<div style="display:flex;align-items:center;gap:5px;justify-content:flex-end;font-size:var(--f-footnote);font-weight:850;color:'+fg+';line-height:1.25;white-space:nowrap;"><span style="max-width:62px;overflow:hidden;text-overflow:ellipsis;font-size:var(--f-caption2);font-weight:900;color:'+sub+';">'+esc(sp.label||'')+'</span><span style="opacity:.85;display:inline-flex;">'+wxSpotIcon(sp,15)+'</span><span style="display:inline-flex;">'+m.emoji+'</span><span>'+sp.temp+'°</span></div>'; }
function wxLocationPendingChip(label){ var dark=liveDark(),fg=dark?'#D6A57E':'#A85E3C'; return '<div data-wx-location-pending style="display:flex;align-items:center;gap:5px;justify-content:flex-end;font-size:var(--f-caption2);font-weight:800;color:'+fg+';line-height:1.25;white-space:nowrap;"><span style="max-width:112px;overflow:hidden;text-overflow:ellipsis;">'+esc(label)+'</span><span style="display:inline-flex;opacity:.78;">'+icon('map-pin',14)+'</span><span style="width:6px;height:6px;border-radius:50%;background:#C77749;box-shadow:'+(dark?'none':'0 0 0 3px rgba(199,119,73,.14)')+';"></span></div>'; }
function wxDetail(icon,label,val){ var dark=liveDark(),bg=dark?'rgba(255,255,255,0.055)':'rgba(255,255,255,0.45)',lab=dark?'#D6A57E':'#A85E3C',fg=dark?'#FFE1BC':'#7A3E1E'; return '<div style="flex:1;min-width:0;background:'+bg+';border:'+(dark?'1px solid rgba(255,210,160,.09)':'none')+';border-radius:12px;padding:8px 9px;text-align:center;"><div style="font-size:var(--f-caption2);color:'+lab+';font-weight:800;">'+icon+' '+label+'</div><div style="font-size:var(--f-subhead);font-weight:800;color:'+fg+';margin-top:2px;">'+val+'</div></div>'; }
function renderWeatherHeader(data,ui,dark,greet){
  var open=!!ui.weatherOpen;
  var W=dark?{bg:'linear-gradient(120deg,#15120F,#211815 52%,#22131A)',bd:'rgba(255,199,142,.22)',shadow:'0 14px 30px rgba(0,0,0,.42)',orb1:'rgba(255,199,142,.09)',orb2:'rgba(242,154,184,.07)',icon:'drop-shadow(0 3px 6px rgba(0,0,0,.52))',title:'#FFD2A1',sub:'#D6A57E',chev:'#E0AD82',hint:'rgba(255,220,184,.58)',divider:'rgba(255,210,160,.14)',noteBg:'rgba(255,255,255,.05)',note:'#F0D8BC',foot:'rgba(235,205,174,.48)'}:{bg:'linear-gradient(120deg,#FFE7A8,#FFC891 52%,#F7B3C7)',bd:'transparent',shadow:'0 12px 28px var(--sun-glow)',orb1:'rgba(255,255,255,0.55)',orb2:'rgba(255,255,255,0.28)',icon:'drop-shadow(0 3px 7px rgba(240,150,70,0.55))',title:'#8A4426',sub:'#A85E3C',chev:'#B5673A',hint:'rgba(122,62,30,0.6)',divider:'rgba(138,68,38,0.16)',noteBg:'rgba(255,255,255,0.42)',note:'#7A3E1E',foot:'rgba(122,62,30,0.55)'};
  var wx=data.weather;
  var spots=(wx&&wx.spots&&wx.spots.length)?wx.spots:null;
  var live=!!(wx&&wx.mode==='live');
  var locationOn=!!(data&&data.settings&&data.settings.locationEnabled);
  var liveReady=!!(spots&&live&&spots[0]&&spots[0].key==='live');
  var locationPending=locationOn&&!liveReady;
  var locationPendingLabel=hasLiveLocationFor(data)?'Konum güncelleniyor…':'Konum bekleniyor…';
  var primary=null;
  if(spots){ primary=spots[0]; for(var i=1;i<spots.length;i++){ var b=spots[i]; var sv=(b.uv||0)+(b.feels!=null?b.feels:b.temp||0); var ps=(primary.uv||0)+(primary.feels!=null?primary.feels:primary.temp||0); if(sv>ps) primary=b; } }
  var pm=primary?wxMeta(primary.code,primary.isDay):null;
  var h='<button type="button" class="sey-asbtn wxcard"'+(dark?' data-dark-variant="weather"':'')+' onclick="App.toggleWeather()" aria-expanded="'+(open?'true':'false')+'" style="position:relative;overflow:hidden;border:1px solid '+W.bd+';border-radius:24px;padding:15px 16px;background:'+W.bg+';box-shadow:'+W.shadow+';">';
  h+='<div style="position:absolute;top:-32px;right:-16px;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle,'+W.orb1+',transparent 70%);pointer-events:none;"></div>';
  h+='<div style="position:absolute;bottom:-42px;left:30px;width:96px;height:96px;border-radius:50%;background:radial-gradient(circle,'+W.orb2+',transparent 70%);pointer-events:none;"></div>';
  h+='<div style="position:relative;display:flex;align-items:center;gap:12px;">';
  h+='<span style="display:inline-flex;filter:'+W.icon+';">'+(pm?pm.emoji:icon('sun',28))+'</span>';
  var sub=greet; if(pm) sub+=' · '+pm.label;
  h+='<div style="flex:1;min-width:0;"><div style="font-size:var(--f-title3);font-weight:900;letter-spacing:0.3px;color:'+W.title+';line-height:1.12;">Günışığı</div><div style="font-size:var(--f-caption1);font-weight:700;color:'+W.sub+';letter-spacing:.2px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+esc(sub)+'</div></div>';
  h+='<div style="display:flex;align-items:center;gap:9px;flex-shrink:0;">';
  if(spots||locationPending){
    h+='<div style="display:flex;flex-direction:column;gap:3px;align-items:flex-end;">';
    if(locationPending) h+=wxLocationPendingChip(locationPendingLabel);
    if(spots){ for(var ci=0; ci<Math.min(spots.length,locationPending?2:3); ci++){ h+=wxSpotChip(spots[ci]); } }
    h+='</div>';
  } else { h+='<div style="font-size:var(--f-caption1);font-weight:700;color:'+W.sub+';">hava…</div>'; }
  h+='<span style="color:'+W.chev+';transition:transform .2s;display:inline-flex;transform:rotate('+(open?'180deg':'0deg')+');">'+icon('chevron-down',14)+'</span>';
  h+='</div></div>';
  if(!open && spots){ h+='<div style="position:relative;margin-top:8px;text-align:center;font-size:var(--f-caption2);font-weight:700;letter-spacing:.3px;color:'+W.hint+';display:flex;align-items:center;justify-content:center;gap:4px;">detaylar için dokun '+icon('chevron-down',11)+'</div>'; }
  if(open && spots){
    h+='<div style="position:relative;margin-top:12px;animation:seyFade .25s ease;">';
    if(locationPending){
      h+='<div data-wx-location-pending style="display:flex;align-items:center;gap:8px;padding:10px 0 11px;color:'+W.title+';font-size:var(--f-footnote);font-weight:800;">'+icon('map-pin',17)+' <span>'+esc(locationPendingLabel)+'</span></div>';
    }
    for(var si=0; si<spots.length; si++){
      var sp=spots[si]; var m=wxMeta(sp.code,sp.isDay);
      h+='<div style="border-top:1px solid '+W.divider+';padding-top:11px;'+(si>0?'margin-top:11px;':'')+'">';
      h+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:9px;"><span style="display:inline-flex;">'+wxSpotIcon(sp,20)+'</span>';
      h+='<div style="flex:1;min-width:0;"><div style="font-size:var(--f-subhead);font-weight:900;color:'+W.title+';">'+esc(sp.label)+(sp.place?' · <span style="font-weight:700;color:'+W.sub+';">'+esc(sp.place)+'</span>':'')+'</div><div style="font-size:var(--f-caption1);font-weight:700;color:'+W.sub+';">'+m.emoji+' '+m.label+'</div></div>';
      h+='<div style="font-size:var(--f-title2);font-weight:900;color:'+(dark?'#FFE1BC':'#7A3E1E')+';">'+sp.temp+'°</div></div>';
      h+='<div style="display:flex;gap:6px;margin-bottom:6px;">'+wxDetail(icon('thermometer',13),'Hissedilen',sp.feels+'°')+wxDetail(icon('droplet',13),'Nem','%'+sp.hum)+wxDetail(icon('wind',13),'Rüzgâr',sp.wind+' km/sa')+'</div>';
      h+='<div style="display:flex;gap:6px;">'+wxDetail(icon('sun',13),'UV',(sp.uv!=null?sp.uv:'—'))+wxDetail(icon('arrow-up-down',13),'En Y/D',(sp.hi!=null?sp.hi+'°/'+sp.lo+'°':'—'))+wxDetail(icon('sunrise',13),'Doğ/Bat',wxHm(sp.sunrise)+'·'+wxHm(sp.sunset))+'</div>';
      h+='</div>';
    }
    if(primary){
      var adv=wxAdvice(primary);
      h+='<div style="border-top:1px solid '+W.divider+';padding-top:11px;margin-top:11px;"><div style="font-size:var(--f-footnote);font-weight:900;color:'+W.title+';margin-bottom:7px;display:flex;align-items:center;gap:5px;">'+icon('lightbulb',13)+' Sağlık notları</div>';
      for(var ai=0; ai<adv.length; ai++){ h+='<div style="display:flex;gap:8px;align-items:flex-start;background:'+W.noteBg+';border:'+(dark?'1px solid rgba(255,210,160,.08)':'none')+';border-radius:12px;padding:8px 10px;'+(ai>0?'margin-top:6px;':'')+'"><span style="font-size:var(--f-subhead);line-height:1.3;">'+adv[ai].i+'</span><span style="flex:1;font-size:var(--f-footnote);font-weight:600;color:'+W.note+';line-height:1.4;">'+esc(adv[ai].t)+'</span></div>'; }
      h+='</div>';
      var q=wxQuip(pm?pm.cat:'clear');
      h+='<div style="border-top:1px solid '+W.divider+';padding-top:11px;margin-top:11px;font-size:var(--f-footnote);font-style:italic;font-weight:600;color:'+W.title+';line-height:1.5;">❝ '+esc(q)+' ❞</div>';
    }
    if(wx.fetchedAt){ var am=Math.round((Date.now()-new Date(wx.fetchedAt).getTime())/60000); var us=am<1?'az önce':am<60?am+' dk önce':Math.round(am/60)+' sa önce'; h+='<div style="margin-top:9px;text-align:right;font-size:var(--f-caption2);color:'+W.foot+';">Open-Meteo · '+us+'</div>'; }
    h+='</div>';
  }
  h+='</button>';
  return h;
}


function renderHarita(data,ui,dark){
  var today=todayStr();
  // İlk açılış koruması: `ui.calMonth` yalnız App.calMove/calToday/heatOpen'da
  // kurulur; uygulamaya doğrudan harita sekmesiyle girilirse tanımsız kalır ve
  // `.split` çökerdi. app.js'teki korumalı `haritaHTML` shim'i render zincirinde
  // çağrılmadığı için (render.js kendi `mapTabHTML` yolunu kullanır) koruma
  // buraya taşındı.
  if(!ui.calMonth||typeof ui.calMonth!=='string'||ui.calMonth.indexOf('-')<0) ui.calMonth=today.slice(0,7);
  var ym=ui.calMonth.split('-'); var Y=+ym[0], M=+ym[1];
  var firstDow=(new Date(Y,M-1,1).getDay()+6)%7; // Pzt=0
  var daysInMonth=new Date(Y,M,0).getDate();
  var monthNames=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  var h='<div style="animation:seyFade .3s ease;display:flex;flex-direction:column;gap:14px;">';
  h+=sciNote('Tutarlılık, mükemmellikten güçlüdür: aralıklı ama sürekli tekrar (spaced repetition), davranışı kalıcı kılan sinaptik pekişmeyi besler. Boş günler bir kusur değil, ritmin parçasıdır.');
  h+='<div class="surface" style="border-radius:22px;padding:14px;display:flex;flex-direction:column;gap:12px;">';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;"><button onclick="App.calMove(-1)" style="border:none;cursor:pointer;width:36px;height:36px;border-radius:50%;background:var(--icon);color:var(--text);font-size:var(--f-headline);">‹</button><div style="font-size:var(--f-callout);font-weight:800;">'+monthNames[M-1]+' '+Y+'</div><button onclick="App.calMove(1)" style="border:none;cursor:pointer;width:36px;height:36px;border-radius:50%;background:var(--icon);color:var(--text);font-size:var(--f-headline);">›</button></div>';
  h+='<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:5px;">';
  ['Pt','Sa','Ça','Pe','Cu','Ct','Pz'].forEach(function(d){ h+='<div style="text-align:center;font-size:var(--f-caption2);font-weight:700;color:var(--faint);">'+d+'</div>'; });
  for(var b=0;b<firstDow;b++){ h+='<div></div>'; }
  for(var dnum=1;dnum<=daysInMonth;dnum++){
    var date=Y+'-'+pad(M)+'-'+pad(dnum);
    var rec=data.days[date]||null; var cnt=countRec(rec); var htc=habitCountOn(date); var strongC=Math.ceil(htc*0.66);
    var future=diffDays(today,date)>0; var before=diffDays(data.startDate,date)<0; var isToday=date===today;
    var moodE=(rec&&rec.mood)?moodEmoji(rec.mood,13):'';
    var tint='var(--card)';
    if(cnt>=htc) tint=dark?'linear-gradient(135deg,rgba(255,232,163,0.25),rgba(247,221,229,0.22))':'linear-gradient(135deg,#FFE8A3,#F7DDE5)';
    else if(cnt>=strongC) tint=dark?'rgba(233,137,159,0.2)':'rgba(247,221,229,0.7)';
    else if(cnt>0) tint=dark?'rgba(201,184,255,0.12)':'rgba(247,221,229,0.32)';
    var clickable=!future;
    h+='<button '+(clickable?'onclick="App.openDate(\''+date+'\')"':'')+' style="position:relative;aspect-ratio:1;border-radius:12px;border:1px solid var(--card-bd);background:'+tint+';color:var(--text);cursor:'+(clickable?'pointer':'default')+';opacity:'+((future||before)?'0.4':'1')+';display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;'+(isToday?'box-shadow:0 0 0 2px #E9AFC1;':'')+'">';
    h+='<div style="font-size:var(--f-footnote);font-weight:700;line-height:1;">'+dnum+'</div>';
    h+='<div style="font-size:var(--f-caption1);height:14px;line-height:1;">'+(moodE||(cnt>0?'<span style="font-size:var(--f-caption2);color:var(--muted);font-weight:700;">'+cnt+'/'+htc+'</span>':''))+'</div>';
    h+='</button>';
  }
  h+='</div>';
  h+='<div style="display:flex;gap:13px;justify-content:center;font-size:var(--f-caption2);color:var(--faint);flex-wrap:wrap;padding-top:2px;"><span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:50%;background:linear-gradient(135deg,#FFE8A3,#F7DDE5);border:1px solid var(--card-bd);"></span> tam gün</span><span style="display:inline-flex;align-items:center;gap:4px;">'+icon('flower-2',12)+' güçlü</span><span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:50%;border:2px solid #E9AFC1;"></span> bugün çerçeveli</span></div>';
  h+='</div>';
  // ay özeti
  var isCurMonth=(ui.calMonth===today.slice(0,7));
  var mrecs=[]; for(var mi=1;mi<=daysInMonth;mi++){ var mds=Y+'-'+pad(M)+'-'+pad(mi); if(data.days[mds]) mrecs.push({date:mds,rec:data.days[mds]}); }
  var recCount=mrecs.length;
  var tickSum=0,tickMax=0; mrecs.forEach(function(o){ tickSum+=countRec(o.rec); tickMax+=habitCountOn(o.date); });
  var avgPct=tickMax?Math.round(tickSum/tickMax*100):0;
  var bStreak=bestStreak(mrecs.slice().sort(function(a,b){return a.date<b.date?-1:1;}));
  var md=moodDist(mrecs);
  h+='<div class="surface" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;">';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;"><div style="font-size:var(--f-callout);font-weight:700;">'+monthNames[M-1]+' özeti</div>'+(isCurMonth?'':'<button onclick="App.calToday()" style="border:1px solid var(--field-bd);cursor:pointer;background:var(--card);color:var(--text2);font-weight:700;font-size:var(--f-caption1);padding:6px 12px;border-radius:999px;display:inline-flex;align-items:center;gap:4px;">Bugüne git '+icon('sun',13)+'</button>')+'</div>';
  if(recCount===0){ h+='<div style="font-size:var(--f-footnote);color:var(--faint);line-height:1.5;">Bu ayda henüz kayıt yok. Bir güne dokunup “Bu günü düzenle” ile geçmişe de ekleyebilirsin.</div>'; }
  else {
    h+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:9px;">';
    var cells=[['Kayıtlı gün',recCount+' / '+daysInMonth],['Ortalama tik',avgPct+'%'],['En iyi seri',bStreak+' gün']];
    cells.forEach(function(c){ h+='<div style="background:var(--icon);border:1px solid var(--card-bd);border-radius:14px;padding:11px 10px;text-align:center;"><div style="font-size:var(--f-caption2);color:var(--faint);line-height:1.3;">'+c[0]+'</div><div style="font-size:var(--f-body);font-weight:800;margin-top:3px;">'+c[1]+'</div></div>'; });
    h+='</div>';
    var moodKeys=Object.keys(md); if(moodKeys.length){ h+='<div style="display:flex;flex-wrap:wrap;gap:7px;align-items:center;"><span style="font-size:var(--f-caption1);color:var(--faint);">Mod dağılımı:</span>'; moodCatalog().forEach(function(m){ if(md[m.id]) h+='<span style="font-size:var(--f-footnote);background:var(--card);border:1px solid var(--card-bd);border-radius:999px;padding:4px 10px;display:inline-flex;align-items:center;gap:4px;">'+icon(m.icon,13)+' '+md[m.id]+'</span>'; }); h+='</div>'; }
    // ── Teknik detay: haftanın en tutarlı günü · geçen aya göre · faz ilerlemesi ──
    var wdSum=[0,0,0,0,0,0,0], wdMax=[0,0,0,0,0,0,0];
    mrecs.forEach(function(o){ var p=o.date.split('-').map(Number); var wd=(new Date(p[0],p[1]-1,p[2]).getDay()+6)%7; wdSum[wd]+=countRec(o.rec); wdMax[wd]+=habitCountOn(o.date); });
    var wdNames=['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar'];
    var bestWd=-1,bestWdPct=-1; for(var wi=0;wi<7;wi++){ if(wdMax[wi]>0){ var wp=Math.round(wdSum[wi]/wdMax[wi]*100); if(wp>bestWdPct){bestWdPct=wp;bestWd=wi;} } }
    var pmY=(M===1)?Y-1:Y, pmM=(M===1)?12:M-1, pmKey=pmY+'-'+pad(pmM), pmSum=0,pmMax=0;
    for(var pk in data.days){ if(pk.slice(0,7)===pmKey){ pmSum+=countRec(data.days[pk]); pmMax+=habitCountOn(pk); } }
    var pmPct=pmMax?Math.round(pmSum/pmMax*100):null, delta=(pmPct!=null)?(avgPct-pmPct):null;
    var detail=[];
    if(bestWd>=0) detail.push([icon('calendar',15),'En tutarlı günün','<b>'+wdNames[bestWd]+'</b> · %'+bestWdPct,'var(--accent)']);
    if(delta!=null){ var dcol=delta>0?'#3F8A4F':(delta<0?'#E9899F':'var(--muted)'); var dtxt=(delta>0?'+':'')+delta+' puan'; detail.push([icon(delta>=0?'trending-up':'chart-column',15),'Geçen aya göre','<b style="color:'+dcol+';">'+dtxt+'</b>','var(--muted)']); }
    if(window.MotivationProgramV2 && featuresLive()){ var _ms=window.MotivationProgramV2.progressSummary(data); detail.push([icon('compass',15),'İçsel Pusula','Gün '+_ms.currentProgramDay+'/'+_ms.totalDays+' · %'+_ms.percent,'#6E5FCB']); }
    if(detail.length){
      h+='<div style="display:flex;flex-direction:column;gap:8px;border-top:1px solid var(--card-bd);padding-top:11px;">';
      detail.forEach(function(r){ h+='<div style="display:flex;align-items:center;gap:10px;"><span style="width:24px;display:flex;justify-content:center;color:'+r[3]+';">'+r[0]+'</span><span style="flex:1;font-size:var(--f-footnote);color:var(--text2);">'+r[1]+'</span><span style="font-size:var(--f-footnote);color:var(--text);text-align:right;">'+r[2]+'</span></div>'; });
      h+='</div>';
    }
  }
  h+='<div style="font-size:var(--f-caption1);color:var(--faint);line-height:1.45;border-top:1px solid var(--card-bd);padding-top:10px;display:flex;gap:5px;">'+icon('lightbulb',13)+' Geçmiş bir güne dokun → “Bu günü düzenle” ile o günün verilerini düzeltebilirsin. Konum, oturum ve canlı ölçümler her zaman bugüne yazılır.</div>';
  h+='</div>';
  h+='</div>';
  return h;
}



  function locationCardHTML(){ return renderLocationCard(liveData()); }
  function hasLiveLocation(){ return hasLiveLocationFor(liveData()); }
  function wxMode(){ return wxModeFor(liveData()); }
  function weatherSpots(){ return weatherSpotsFor(liveData()); }
  function wxStale(){ return wxStaleFor(liveData()); }
  function weatherHeaderHTML(greet){ return renderWeatherHeader(liveData(),liveUi(),liveDark(),greet); }
  function haritaHTML(){ return renderHarita(liveData(),liveUi(),liveDark()); }

  window.SeymaMap={registerMap:registerMap,MAP_DEPENDENCIES:MAP_DEPENDENCIES,MAP_MEMBERS:MAP_MEMBERS,    locationCardHTML:locationCardHTML,
    hasLiveLocation:hasLiveLocation,
    wxMode:wxMode,
    weatherSpots:weatherSpots,
    wxSpotIconName:wxSpotIconName,
    wxSpotIcon:wxSpotIcon,
    wxStale:wxStale,
    wxMeta:wxMeta,
    wxAdvice:wxAdvice,
    wxQuip:wxQuip,
    wxHm:wxHm,
    wxSpotChip:wxSpotChip,
    wxLocationPendingChip:wxLocationPendingChip,
    wxDetail:wxDetail,
    weatherHeaderHTML:weatherHeaderHTML,
    haritaHTML:haritaHTML};
}());
