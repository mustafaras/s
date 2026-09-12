// MON-44 · render core registry.
// Onboarding ve Bugün kabuk gövdeleri burada; domain kart üreticileri, App handlers,
// root/app innerHTML, mutation/save/DOM ve modal ownership app.js'te kalır.
(function(){
  'use strict';

  var renderDeps=null;
  var RENDER_DEPENDENCIES=[
    'data','dark','todayStr','editing','activeDate','dayIndexFor','currentStreak',
    'countRec','habitCountOn','gununHavasi','dailyPhotoCardHTML',
    'saveBanner','shouldShowAeonNotifyBanner','aeonNotifyBannerHTML','locationCardHTML',
    'vacationCardHidden','vacationCardHTML','weatherHeaderHTML','journalLightCardHTML',
    'reminderInboxCardHTML','rasitBubbleHTML','rasitContactHTML','dateLabelTR','esc',
    'icon','heroPremiumStatsHTML','heroStatsHTML','heroTargetsHTML','heroScienceLine',
    'motivationTodayCardHTML','rasitActionsHTML','hubTilesHTML','magnesiumFeedbackHTML',
    'magnesiumBannerHTML','moodCardHTML','daily','motivationProgramV2','eveningNudge',
    'habitsCardHTML','stepReminder','beslenmeCardHTML','waterCard','reflectionCardHTML',
    'onThisDayCard'
  ];

  function registerRender(deps){
    if(renderDeps||!deps||typeof deps!=='object'||Array.isArray(deps)) return false;
    for(var i=0;i<RENDER_DEPENDENCIES.length;i++) if(typeof deps[RENDER_DEPENDENCIES[i]]!=='function') return false;
    renderDeps=deps;
    return true;
  }
  function dep(name){ return renderDeps&&typeof renderDeps[name]==='function'?renderDeps[name]:null; }
  function call(name,args){ var f=dep(name); if(f) return f.apply(null,args||[]); throw new Error('SeymaRender: çözümlenemeyen bağımlılık '+name); }
  function liveData(){ return call('data',[]); }
  function liveDark(){ return call('dark',[]); }
  function icon(){ return call('icon',arguments); }
  function esc(){ return call('esc',arguments); }
  function todayStr(){ return call('todayStr',arguments); }
  function editing(){ return call('editing',arguments); }
  function activeDate(){ return call('activeDate',arguments); }
  function dayIndexFor(){ return call('dayIndexFor',arguments); }
  function currentStreak(){ return call('currentStreak',arguments); }
  function countRec(){ return call('countRec',arguments); }
  function habitCountOn(){ return call('habitCountOn',arguments); }
  function gununHavasi(){ return call('gununHavasi',arguments); }
  function dailyPhotoCardHTML(){ return call('dailyPhotoCardHTML',arguments); }
  function saveBanner(){ return call('saveBanner',arguments); }
  function shouldShowAeonNotifyBanner(){ return call('shouldShowAeonNotifyBanner',arguments); }
  function aeonNotifyBannerHTML(){ return call('aeonNotifyBannerHTML',arguments); }
  function locationCardHTML(){ return call('locationCardHTML',arguments); }
  function vacationCardHidden(){ return call('vacationCardHidden',arguments); }
  function vacationCardHTML(){ return call('vacationCardHTML',arguments); }
  function weatherHeaderHTML(){ return call('weatherHeaderHTML',arguments); }
  function journalLightCardHTML(){ return call('journalLightCardHTML',arguments); }
  function reminderInboxCardHTML(){ return call('reminderInboxCardHTML',arguments); }
  function rasitBubbleHTML(){ return call('rasitBubbleHTML',arguments); }
  function rasitContactHTML(){ return call('rasitContactHTML',arguments); }
  function dateLabelTR(){ return call('dateLabelTR',arguments); }
  function heroPremiumStatsHTML(){ return call('heroPremiumStatsHTML',arguments); }
  function heroStatsHTML(){ return call('heroStatsHTML',arguments); }
  function heroTargetsHTML(){ return call('heroTargetsHTML',arguments); }
  function heroScienceLine(){ return call('heroScienceLine',arguments); }
  function motivationTodayCardHTML(){ return call('motivationTodayCardHTML',arguments); }
  function rasitActionsHTML(){ return call('rasitActionsHTML',arguments); }
  function hubTilesHTML(){ return call('hubTilesHTML',arguments); }
  function magnesiumFeedbackHTML(){ return call('magnesiumFeedbackHTML',arguments); }
  function magnesiumBannerHTML(){ return call('magnesiumBannerHTML',arguments); }
  function moodCardHTML(){ return call('moodCardHTML',arguments); }
  function motivationProgramV2(){ return call('motivationProgramV2',[]); }
  function eveningNudge(){ return call('eveningNudge',arguments); }
  function habitsCardHTML(){ return call('habitsCardHTML',arguments); }
  function stepReminder(){ return call('stepReminder',arguments); }
  function beslenmeCardHTML(){ return call('beslenmeCardHTML',arguments); }
  function waterCard(){ return call('waterCard',arguments); }
  function reflectionCardHTML(){ return call('reflectionCardHTML',arguments); }
  function onThisDayCard(){ return call('onThisDayCard',arguments); }

  function onboardingHTML(){
    var dark=liveDark();
  // v2.0 boot screen: dark → mevcut super-black, light → sıcak "delight" karşılığı.
  // Yalnızca onboarding tema-duyarlıdır; uygulamanın geri kalan tema sistemi değişmez.
  var MONO="'SF Mono',ui-monospace,'JetBrains Mono',Menlo,Consolas,'Liberation Mono',monospace";
  var P=dark?{
    mode:'super-black',page:'radial-gradient(125% 85% at 50% -5%,#12121B 0%,#0A0A0F 46%,#060608 100%)',text:'#E8E8EE',grid:'rgba(255,255,255,0.028)',strip:'#54545F',
    topGlow:'rgba(230,193,90,0.15)',sideGlow:'rgba(233,137,159,0.16)',themeBg:'rgba(255,255,255,0.045)',themeBd:'rgba(255,255,255,0.10)',themeText:'#A2A2AD',
    wordGrad:'linear-gradient(110deg,#FBE7CB,#F4B9CE 42%,#D9C2FF 66%,#FBE7CB)',wordShadow:'drop-shadow(0 2px 16px rgba(230,193,90,0.32))',
    superGrad:'linear-gradient(110deg,#B6B6C1,#F3F3F8 38%,#7E7E8B 60%,#D4D4DD)',superShadow:'drop-shadow(0 1px 2px rgba(0,0,0,0.6)) drop-shadow(0 0 15px rgba(200,205,222,0.20))',metal:'rgba(210,210,220,0.5)',tag:'#8A8A95',
    panelBd:'rgba(255,255,255,0.09)',panelBg:'linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.012))',panelShadow:'0 24px 56px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.06)',titleBg:'rgba(255,255,255,0.02)',titleBd:'rgba(255,255,255,0.07)',titleText:'#7C7C88',desc:'#777782',
    dash:'rgba(255,255,255,0.07)',specLabel:'#5F5F69',specVal:'#A2A2AD',status:'#5E5E68',statusSep:'#33333B',aeonBg:'linear-gradient(180deg,rgba(255,255,255,0.045),transparent)',aeonBd:'rgba(255,255,255,0.08)',aeonWord:'#F7F7FA',aeonSub:'#8B8B96',privacy:'#5A5A65'
  }:{
    mode:'delight',page:'radial-gradient(125% 88% at 50% -5%,#FFFFFF 0%,#FFF8F1 48%,#F4EEFF 100%)',text:'#2B2630',grid:'rgba(84,66,92,0.050)',strip:'#817783',
    topGlow:'rgba(246,193,119,0.30)',sideGlow:'rgba(233,137,159,0.20)',themeBg:'rgba(255,255,255,0.72)',themeBd:'rgba(91,72,98,0.14)',themeText:'#5F5662',
    wordGrad:'linear-gradient(110deg,#6D4652,#B76683 42%,#7864A6 68%,#6D4652)',wordShadow:'drop-shadow(0 2px 10px rgba(183,102,131,0.16))',
    superGrad:'linear-gradient(110deg,#28252C,#625D68 40%,#3B3741 66%,#28252C)',superShadow:'drop-shadow(0 1px 0 rgba(255,255,255,0.85))',metal:'rgba(81,73,86,0.34)',tag:'#766D78',
    panelBd:'rgba(91,72,98,0.14)',panelBg:'linear-gradient(180deg,rgba(255,255,255,0.90),rgba(255,250,247,0.76))',panelShadow:'0 24px 56px rgba(91,65,78,0.14),inset 0 1px 0 rgba(255,255,255,0.95)',titleBg:'rgba(92,72,99,0.035)',titleBd:'rgba(91,72,98,0.10)',titleText:'#756B77',desc:'#766D78',
    dash:'rgba(91,72,98,0.12)',specLabel:'#918792',specVal:'#49424C',status:'#756C77',statusSep:'#C9C0CA',aeonBg:'linear-gradient(180deg,rgba(255,255,255,0.60),rgba(246,238,255,0.34))',aeonBd:'rgba(91,72,98,0.11)',aeonWord:'#29252D',aeonSub:'#6F6672',privacy:'#716873'
  };
  // modüller — boot-log satırları (ad · açıklama · accent)
  var mods=[
    ['#E9899F','icsel_pusula','duygu takibi · notlar · içgörü'],
    ['#7BA7D0','saglik.sys','uyku · su · kafein · döngü'],
    ['#E0A93C','kriz_odasi','10 dk erteleme · güvenli çıkış'],
    ['#9B7FC9','motivasyon','120 gün · görev · günlük yansıma'],
    ['#E6C15A','aeon.link','mesaj · ses · fotoğraf · gözlemci'],
    ['#6E9C6A','medya.log','kitap · film/dizi · müzik günlüğü']
  ];
  var h='<div data-onboarding-theme="'+(dark?'dark':'light')+'" style="position:relative;flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column;font-family:'+MONO+';color:'+P.text+';background:'+P.page+';padding:calc(env(safe-area-inset-top) + 18px) 20px calc(env(safe-area-inset-bottom) + 16px);animation:seyFade .45s ease;">';
  // ── iOS-27 ambient: teknik grid (kenarlarda sönümlenir) + sıcak glow'lar ──
  h+='<div style="position:absolute;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient('+P.grid+' 1px,transparent 1px),linear-gradient(90deg,'+P.grid+' 1px,transparent 1px);background-size:27px 27px;-webkit-mask-image:radial-gradient(130% 92% at 50% 16%,#000 38%,transparent 80%);mask-image:radial-gradient(130% 92% at 50% 16%,#000 38%,transparent 80%);"></div>';
  h+='<div style="position:absolute;top:-9%;left:50%;transform:translateX(-50%);width:min(480px,150%);height:320px;background:radial-gradient(closest-side,'+P.topGlow+',transparent 74%);pointer-events:none;z-index:0;"></div>';
  h+='<div style="position:absolute;top:20%;right:-16%;width:240px;height:240px;background:radial-gradient(circle,'+P.sideGlow+',transparent 70%);pointer-events:none;z-index:0;"></div>';
  // ── üst: build strip ──
  h+='<div style="position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;font-size:var(--f-caption2);letter-spacing:1px;color:'+P.strip+';animation:seyFloatIn .5s ease both;">';
  h+='<span>SEYMA_OS</span><span style="display:inline-flex;align-items:center;gap:8px;"><span style="display:inline-flex;align-items:center;gap:6px;"><span style="width:6px;height:6px;border-radius:50%;background:#3F9E63;box-shadow:0 0 6px rgba(63,158,99,.42);animation:seyTwinkle 1.6s ease-in-out infinite;"></span>build · aeon</span><button onclick="App.toggleTheme()" aria-label="Başlangıç temasını değiştir" style="border:1px solid '+P.themeBd+';background:'+P.themeBg+';color:'+P.themeText+';border-radius:999px;padding:5px 8px;display:inline-flex;align-items:center;gap:4px;cursor:pointer;font-family:'+MONO+';font-size:var(--f-caption2);font-weight:800;letter-spacing:.35px;">'+icon(dark?'moon':'sun',11)+' '+P.mode+'</button></span>';
  h+='</div>';
  // ── orta blok (dikey ortalı): hero + terminal paneli ──
  h+='<div style="position:relative;z-index:1;flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;gap:15px;">';
  // HERO — Şeyma rozeti (korunur) + imza + "super-black" alt-imza + v2.0 vurgusu
  h+='<div style="display:flex;flex-direction:column;align-items:center;gap:8px;">';
  h+='<div style="position:relative;width:90px;height:90px;border-radius:28px;display:flex;align-items:center;justify-content:center;background:linear-gradient(150deg,#FFE8A3,#F7DDE5 52%,#E9CBFF);box-shadow:0 22px 52px rgba(230,193,90,0.28),0 0 0 1px rgba(255,255,255,0.10),inset 0 1.5px 0 rgba(255,255,255,0.7);overflow:hidden;animation:seyPop .6s var(--ease-premium,ease) both;">';
  h+='<span style="position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.6) 50%,transparent 70%);animation:seyShine 3.8s ease-in-out infinite;"></span>';
  h+='<span style="position:relative;font-size:48px;line-height:1;filter:drop-shadow(0 8px 14px rgba(190,108,139,0.4));">🦩</span></div>';
  h+='<div style="display:flex;align-items:center;justify-content:center;gap:9px;margin-top:2px;animation:seyFloatIn .5s .06s ease both;"><span class="sey-wordmark" style="font-size:44px;background:'+P.wordGrad+';-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;filter:'+P.wordShadow+';">Şeyma</span><span class="sey-wordmark-flam" style="font-size:var(--f-title1);">🦩</span></div>';
  // "super-black" — imza fontunda metalik gümüş alt-imza
  h+='<div style="display:flex;align-items:center;gap:9px;margin-top:-4px;animation:seyFloatIn .5s .09s ease both;"><span style="width:26px;height:1px;background:linear-gradient(90deg,transparent,'+P.metal+');"></span><span class="sey-wordmark" style="font-size:var(--f-title1);background:'+P.superGrad+';-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;filter:'+P.superShadow+';">'+P.mode+'</span><span style="width:26px;height:1px;background:linear-gradient(90deg,'+P.metal+',transparent);"></span></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;margin-top:2px;animation:seyFloatIn .5s .12s ease both;"><span style="font-size:var(--f-caption1);letter-spacing:1.5px;color:'+P.tag+';text-transform:uppercase;">minik denge günlüğü</span><span style="font-size:var(--f-caption1);font-weight:800;letter-spacing:.5px;color:#140C10;background:linear-gradient(135deg,#F2D98C,#E9AEC6);border-radius:999px;padding:3px 11px;box-shadow:0 6px 18px rgba(230,193,90,0.20);">v2.0</span></div>';
  h+='</div>';
  // TERMINAL PANEL — modüller boot-log + ÆON imzası
  h+='<div style="border:1px solid '+P.panelBd+';border-radius:18px;overflow:hidden;background:'+P.panelBg+';box-shadow:'+P.panelShadow+';animation:seyFloatIn .5s .16s ease both;">';
  // titlebar
  h+='<div style="display:flex;align-items:center;gap:7px;padding:10px 13px;border-bottom:1px solid '+P.titleBd+';background:'+P.titleBg+';">';
  ['#FF5F57','#FEBC2E','#28C840'].forEach(function(c){ h+='<span style="width:9px;height:9px;border-radius:50%;background:'+c+';box-shadow:0 0 6px '+c+'66;"></span>'; });
  h+='<span style="margin-left:7px;font-size:var(--f-caption2);color:'+P.titleText+';">seyma — denge.sys</span>';
  h+='<span style="margin-left:auto;font-size:var(--f-caption2);color:#3F9E63;letter-spacing:.5px;">● ready</span>';
  h+='</div>';
  // body: modül satırları
  h+='<div style="padding:11px 14px;display:flex;flex-direction:column;gap:8px;">';
  mods.forEach(function(m,i){
    var delay=(0.24+i*0.05).toFixed(2);
    h+='<div style="display:grid;grid-template-columns:7px 1fr auto;column-gap:9px;row-gap:2px;align-items:center;animation:seyFloatIn .5s '+delay+'s ease both;">';
    h+='<span style="width:7px;height:7px;border-radius:50%;flex-shrink:0;background:'+m[0]+';box-shadow:0 0 8px '+m[0]+';"></span>';
    h+='<span style="min-width:0;color:'+m[0]+';font-size:var(--f-caption1);line-height:1.2;font-weight:700;">'+m[1]+'</span>';
    h+='<span style="color:#3F9E63;font-size:var(--f-caption2);">ok</span>';
    h+='<span style="grid-column:2 / 4;min-width:0;color:'+P.desc+';font-size:var(--f-caption2);line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+m[2]+'</span>';
    h+='</div>';
  });
  h+='</div>';
  // teknik özet — saklama ve eşlik modelini kısa, açık ve doğru anlatır.
  h+='<div style="padding:10px 14px 9px;border-top:1px dashed '+P.dash+';display:grid;grid-template-columns:1fr 1fr;gap:7px 14px;font-size:var(--f-caption2);animation:seyFloatIn .5s .44s ease both;">';
  [['günlük','önce bu cihazda'],['yedek','sen bağlarsan GitHub'],['program','120 gün · 4 faz'],['eşlik','Luna + ÆON']].forEach(function(s){
    h+='<div style="min-width:0;"><div style="color:'+P.specLabel+';margin-bottom:2px;">'+s[0]+'</div><div style="color:'+P.specVal+';line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+s[1]+'</div></div>';
  });
  h+='</div>';
  // hazır göstergesi
  h+='<div style="display:flex;align-items:center;gap:7px;padding:2px 14px 10px;font-size:var(--f-caption2);letter-spacing:.2px;color:'+P.status+';white-space:nowrap;animation:seyFloatIn .5s .48s ease both;"><span style="color:#3F9E63;">▷</span><span>store·local</span><span style="color:'+P.statusSep+';">·</span><span>sync·github</span><span style="margin-left:auto;display:inline-flex;align-items:center;gap:6px;color:#3F9E63;flex-shrink:0;">hazır <span style="width:26px;height:4px;border-radius:999px;overflow:hidden;background:'+(dark?'rgba(255,255,255,0.08)':'rgba(91,72,98,0.10)')+';display:inline-block;"><span style="display:block;height:100%;width:100%;background:linear-gradient(90deg,#E6C15A,#E9899F,#9B7FC9);"></span></span> 100%</span></div>';
  // ÆON imzası — terminali ezmeyen küçük, beyaz ve sakin güven rozeti.
  h+='<div style="display:flex;align-items:center;gap:12px;padding:12px 14px 13px;border-top:1px solid '+P.aeonBd+';background:'+P.aeonBg+';animation:seyFloatIn .5s .54s ease both;">';
  h+='<div style="position:relative;width:52px;height:52px;border-radius:17px;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#101017;background:linear-gradient(145deg,#FFFFFF,#E9E9EF);border:1px solid '+(dark?'rgba(255,255,255,0.10)':'rgba(91,72,98,0.12)')+';box-shadow:'+(dark?'0 10px 25px rgba(255,255,255,0.12)':'0 10px 25px rgba(91,65,78,0.14)')+',inset 0 1px 0 #FFFFFF,inset 0 -2px 5px rgba(40,40,55,0.12);overflow:hidden;">';
  h+='<span style="position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.9) 50%,transparent 70%);animation:seyShine 4s ease-in-out infinite;"></span>';
  h+='<span style="position:relative;display:inline-flex;">'+icon('hexagon',25)+'</span></div>';
  h+='<div style="flex:1;min-width:0;"><div style="font-family:-apple-system,system-ui,\'Segoe UI\',sans-serif;font-size:var(--f-headline);font-weight:850;letter-spacing:3px;color:'+P.aeonWord+';">ÆON</div>';
  h+='<div style="font-size:var(--f-caption2);letter-spacing:.25px;color:'+P.aeonSub+';line-height:1.45;margin-top:2px;">Paylaştığın kayıtları anlamlandırır; mesaj, ses ve fotoğraflarında güvenilir bir gözlemci eşlik eder.</div></div>';
  h+='</div>';
  h+='</div>'; // terminal panel
  h+='</div>'; // orta blok
  // ── alt: CTA + gizlilik ──
  h+='<div style="position:relative;z-index:1;display:flex;flex-direction:column;gap:9px;animation:seyFloatIn .5s .56s ease both;">';
  h+='<button onclick="App.start()" style="position:relative;overflow:hidden;border:none;cursor:pointer;width:100%;padding:16px;border-radius:16px;font-family:'+MONO+';font-size:var(--f-subhead);font-weight:800;letter-spacing:.3px;color:#180D14;background:linear-gradient(135deg,#F4DCA0,#E9AEC6 52%,#CBB8FF);box-shadow:0 18px 40px rgba(233,137,159,0.30),inset 0 1px 0 rgba(255,255,255,0.4);display:flex;align-items:center;justify-content:center;gap:8px;"><span style="position:absolute;inset:0;background:linear-gradient(115deg,transparent 35%,rgba(255,255,255,0.5) 50%,transparent 65%);animation:seyShine 4.2s ease-in-out infinite;"></span><span style="position:relative;">❯ Tamam Raşit, başlayalım</span></button>';
  h+='<p style="margin:0;text-align:center;font-size:var(--f-caption2);line-height:1.5;color:'+P.privacy+';">Günlüğün önce bu cihazda saklanır. Yedekleme ancak sen bağlarsan açılır; kontrol her zaman sende kalır. 🔒</p>';
  h+='</div>';
  h+='</div>';
  return h;

  }

  function bugunHTML(){
    var data=liveData();
    var DAILY=call('daily',[]);
  var today=todayStr();
  var ed=editing();
  var viewDate=activeDate();
  var curRaw=dayIndexFor(viewDate);
  var curIdx=Math.max(1,curRaw);
  var streak=currentStreak();
  var rec=data.days[viewDate]||null;
  var completed=countRec(rec);
  var circ=2*Math.PI*42;
  var ht=habitCountOn(viewDate);
  var badge=gununHavasi(completed, ht, curIdx);
  var pct=Math.round(completed/ht*100);
  var off=circ*(1-completed/ht);
  var _hr=new Date().getHours();
  var _greet=(_hr>=5&&_hr<11)?'Günaydın':(_hr<18)?'İyi günler':(_hr<22)?'İyi akşamlar':'İyi geceler';

  var h='<div style="animation:seyFade .3s ease;display:flex;flex-direction:column;gap:14px;">';
  // ── En üst: repoya bağlan şeridi → hava (Günışığı) → Raşit'in sözü → konum → hero ──
  if(!ed){
    h+=dailyPhotoCardHTML(); // Günün Fotoğrafı — günün ilk kartı, her zaman açık
    h+=saveBanner();
    if(shouldShowAeonNotifyBanner()) h+=aeonNotifyBannerHTML({context:'bugun'});
    h+=locationCardHTML(); // Konum & Hareket: repoya bağlan şeridinin hemen altında
    if(!vacationCardHidden()) h+=vacationCardHTML(); // Tatil Modu — kullanıcı isterse Ayarlar'dan geri getirir
    h+=weatherHeaderHTML(_greet);
    h+=journalLightCardHTML(rec, streak); // Günlük Işığı — Günışığı hava kartının hemen altında
    h+=reminderInboxCardHTML(); // REM-12 — native kanal olmadan bugünün sakin inbox yüzeyi
    h+=rasitBubbleHTML(curIdx);
    h+=rasitContactHTML(); // Raşit'e yaz / ara — notlar kartının hemen altında (premium ikili)
  }
  // ── HERO: bugünün canlı özeti (dashboard) · niyet vurgulu ──
  h+='<div class="surface" style="border-radius:26px;padding:18px;box-shadow:0 10px 28px rgba(108,74,58,0.08);display:flex;flex-direction:column;gap:15px;">';
  h+='<div style="display:flex;justify-content:space-between;align-items:flex-start;">';
  h+='<div><div style="font-size:var(--f-footnote);letter-spacing:1px;color:var(--faint);font-weight:700;">ŞEYMA 🦩</div><div style="font-size:var(--f-subhead);color:var(--muted);margin-top:3px;">'+(ed?esc(dateLabelTR(viewDate)):'Minik Denge Günlüğü')+'</div></div>';
  h+='<div style="display:flex;align-items:center;gap:8px;">';
  h+='<div style="background:rgba(201,184,255,0.28);color:var(--choc);font-weight:700;font-size:var(--f-footnote);padding:7px 13px;border-radius:999px;white-space:nowrap;display:flex;align-items:center;gap:5px;">Gün '+curIdx+(!ed&&streak>1?('<span style="display:inline-flex;align-items:center;gap:2px;">'+icon('flame',13)+streak+'</span>'):'')+'</div></div></div>';
  h+='<div style="display:flex;align-items:center;gap:18px;">';
  h+='<div id="sey-habits-ring-wrap" style="position:relative;width:96px;height:96px;flex-shrink:0;"><svg width="96" height="96" viewBox="0 0 96 96"><circle cx="48" cy="48" r="42" fill="none" stroke="rgba(150,110,120,0.18)" stroke-width="9"></circle><circle class="sey-ring-seg" cx="48" cy="48" r="42" fill="none" stroke="#E9AFC1" stroke-width="9" stroke-linecap="round" stroke-dasharray="'+circ+'" stroke-dashoffset="'+off+'" transform="rotate(-90 48 48)"></circle></svg>';
  h+='<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;"><div style="font-size:var(--f-title1);font-weight:800;line-height:1;">'+pct+'%</div><div style="font-size:var(--f-caption2);color:var(--faint);margin-top:2px;">'+(ed?'o gün':'bugün')+'</div></div></div>';
  h+='<div style="flex:1;min-width:0;"><div style="font-size:var(--f-footnote);color:var(--faint);margin-bottom:6px;">'+(ed?'O günün havası':'Bugünün havası')+'</div><div style="font-size:var(--f-title3);font-weight:800;line-height:1.25;">'+esc(badge)+'</div><div style="font-size:var(--f-caption1);color:var(--muted);margin-top:5px;font-weight:600;">'+completed+'/'+ht+' tik bugün</div></div></div>';
  // premium istatistik şeridi (seri · 7 günlük ritim · mod eğilimi · en güçlü/zayıf tik)
  h+=heroPremiumStatsHTML(viewDate);
  // bugünkü girdi özeti (Mod · Su · Uyku · Adım)
  h+=heroStatsHTML(rec);
  // en önemli hedeflerin özet görünümü (Kalori · Protein · Su · Adım)
  h+=heroTargetsHTML(rec);
  // ── Niyet + bilimsel mikro-bilgi — hafif, üstten ayraçlı (fazla çerçeve yok) ──
  h+='<div style="border-top:1px solid var(--card-bd);padding-top:13px;display:flex;flex-direction:column;gap:12px;">';
  h+='<div style="display:flex;flex-direction:column;gap:7px;">';
  h+='<div style="display:flex;align-items:center;gap:7px;"><span style="display:inline-flex;color:var(--accent-ink);">'+icon('target',15)+'</span><span style="font-size:var(--f-caption1);font-weight:800;letter-spacing:1px;color:var(--accent-ink);">'+(ed?'O GÜNÜN NİYETİ':'BUGÜNÜN NİYETİ')+'</span></div>';
  h+='<input type="text" value="'+esc(rec&&rec.intention?rec.intention:'')+'" oninput="App.onIntention(this)" placeholder="'+(ed?'O günün niyeti…':'örn. Bugün kendime nazik olacağım')+'" maxlength="140" style="width:100%;box-sizing:border-box;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:12px 13px;font-size:var(--f-subhead);font-weight:700;outline:none;color:var(--text);">';
  h+='</div>';
  h+=heroScienceLine(rec);
  h+='</div>';
  h+='</div>';

  // Terapi Odası — hero'nun hemen altında
  if(!ed){ h+=motivationTodayCardHTML(); }

  // Raşit'in Kriz Odaları — üçlü buton (tatlı · yemek · kahve), her biri modal açar
  if(!ed) h+=rasitActionsHTML();

  // Zihnini besleyen hub kutucukları — bugünün modu kartının hemen üstünde
  if(!ed) h+=hubTilesHTML();

  // Dünkü magnezyum etkisi geri bildirimi
  if(!ed) h+=magnesiumFeedbackHTML(viewDate);

  // Magnezyum Danışmanı — bugünün modu kartının hemen üstünde
  if(!ed) h+=magnesiumBannerHTML(viewDate);

  // Bugünün modu
  h+=moodCardHTML(rec);

  // daily banner (distinct) — Motivasyon V2.1 devredeyken bu eski kart tekrar
  // eden bir "gunun mesaji" olarak kafa karistirmasin diye gosterilmez; DAILY
  // dizisi ve render kodu silinmedi, yalnizca V2 yokken devrede kalan bir
  // yedek (fallback) haline geldi.
  if(!motivationProgramV2()){
    h+='<div style="position:relative;overflow:hidden;background:linear-gradient(135deg,#FFE19A,#FFC9A3 55%,#F7B7C9);border-radius:24px;padding:22px 22px 20px;box-shadow:0 12px 28px rgba(255,180,140,0.32);">';
    h+='<div style="position:absolute;top:-26px;right:10px;font-size:130px;line-height:1;font-weight:800;color:#fff;opacity:0.22;">\u201d</div>';
    h+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:9px;position:relative;"><span style="display:inline-flex;">'+icon('sun',16)+'</span><span style="font-size:var(--f-caption1);letter-spacing:1.5px;font-weight:800;color:#9A5A3C;">GÜNÜN MESAJI</span></div>';
    h+='<div style="position:relative;font-size:var(--f-title3);font-weight:800;line-height:1.36;color:#5A2E2A;">'+esc(DAILY[(curIdx-1)%DAILY.length])+'</div></div>';
  }

  // günün niyeti artık hero kartının içinde (yukarıda).


  if(!ed){
  // akşam nudge (yalnızca gece, okuma eklenmediyse)
  h+=eveningNudge(rec);
  }

  // Bugünün tikleri (açılır kart)
  h+=habitsCardHTML(rec);

  // akşam adım hatırlatması (yalnızca akşam, bugünün adımı boşsa)
  if(!ed) h+=stepReminder(rec);

  // Beslenme — özet (makro) + "ne yedim" birleşik açılır kart
  h+=beslenmeCardHTML(rec);

  // su
  h+=waterCard(rec);

  // Günün yansıması — kendine not + 3 güzel şey, birleşik premium açılır kart
  h+=reflectionCardHTML(rec);

  // dağıldı
  if(!ed) h+=onThisDayCard();
  if(!ed) h+='<button data-fx="open" onclick="App.openEmergency()" style="border:1px dashed rgba(150,110,120,0.3);background:var(--card);cursor:pointer;width:100%;padding:14px;border-radius:18px;font-size:var(--f-subhead);font-weight:600;color:var(--muted);display:flex;align-items:center;justify-content:center;gap:6px;">Bugün biraz dağıldı '+icon('heart-handshake',15)+'</button>';
  h+='</div>';
  return h;

  }

  window.SeymaRender={
    registerRender:registerRender,
    onboardingHTML:onboardingHTML,
    bugunHTML:bugunHTML
  };
})();
