// MON-34 · report domain registry: read-only analytics and report HTML.
// Data writes, settings/map/health ownership and print/DOM control remain in app.js.
(function(){
  'use strict';

  var reportDeps=null;
  var REPORT_DEPENDENCIES=['data','ui','dark','todayStr','addDays','diffDays','shortDate','pad','countRec','allDays','bestStreak','currentStreak','daysTracked','habitCountOn','htToday','find','icon','esc','habits','moods','dayNutrition','proteinGoal','waterGoalCups','moodScore','effSteps','dayMovement','fmtDist','sciNote','medFreeStreak'];

  function registerReport(deps){
    if(reportDeps||!deps||typeof deps!=='object'||Array.isArray(deps)) return false;
    for(var i=0;i<REPORT_DEPENDENCIES.length;i++) if(typeof deps[REPORT_DEPENDENCIES[i]]!=='function') return false;
    reportDeps=deps;
    return true;
  }
  function dep(name){ return reportDeps&&typeof reportDeps[name]==='function'?reportDeps[name]:null; }
  function call(name,args){ var f=dep(name); if(f) return f.apply(null,args||[]); throw new Error('SeymaReport: çözümlenemeyen bağımlılık '+name); }
  function liveData(){ return call('data',[]); }
  function liveUi(){ return call('ui',[]); }
  function liveDark(){ return !!call('dark',[]); }
  function todayStr(){ return call('todayStr',arguments); }
  function addDays(){ return call('addDays',arguments); }
  function diffDays(){ return call('diffDays',arguments); }
  function shortDate(){ return call('shortDate',arguments); }
  function pad(){ return call('pad',arguments); }
  function countRec(){ return call('countRec',arguments); }
  function allDays(){ return call('allDays',arguments); }
  function bestStreak(){ return call('bestStreak',arguments); }
  function currentStreak(){ return call('currentStreak',arguments); }
  function daysTracked(){ return call('daysTracked',arguments); }
  function habitCountOn(){ return call('habitCountOn',arguments); }
  function htToday(){ return call('htToday',arguments); }
  function find(){ return call('find',arguments); }
  function icon(){ return call('icon',arguments); }
  function esc(){ return call('esc',arguments); }
  function habitCatalog(){ return call('habits',[]); }
  function moodCatalog(){ return call('moods',[]); }
  function dayNutrition(){ return call('dayNutrition',arguments); }
  function proteinGoal(){ return call('proteinGoal',arguments); }
  function waterGoalCups(){ return call('waterGoalCups',arguments); }
  function moodScore(){ return call('moodScore',arguments); }
  function effSteps(){ return call('effSteps',arguments); }
  function dayMovement(){ return call('dayMovement',arguments); }
  function fmtDist(){ return call('fmtDist',arguments); }
  function sciNote(){ return call('sciNote',arguments); }
  function medFreeStreak(){ return call('medFreeStreak',arguments); }

  function lastNDays(n){
    var out=[],t=todayStr(),root=liveData(),days=(root&&root.days)||{};
    for(var i=n-1;i>=0;i--){ var d=addDays(t,-i); out.push({date:d,rec:days[d]||null}); }
    return out;
  }
  function habitRate(days,key){ var done=0; days.forEach(function(o){ if(o.rec&&o.rec.habits&&o.rec.habits[key]) done++; }); return days.length?Math.round(done/days.length*100):0; }
  function moodDist(days){ var m={}; days.forEach(function(o){ if(o.rec&&o.rec.mood) m[o.rec.mood]=(m[o.rec.mood]||0)+1; }); return m; }
  function monthlySummary(){
    var root=liveData(),days=(root&&root.days)||{},map={};
    for(var d in days){ var mo=d.slice(0,7); if(!map[mo]) map[mo]={ticks:0,days:0,list:[]}; map[mo].ticks+=countRec(days[d]); map[mo].days++; map[mo].list.push({date:d,rec:days[d]}); }
    return Object.keys(map).sort().reverse().map(function(k){ var m=map[k]; m.list.sort(function(a,b){return a.date<b.date?-1:1;}); return {month:k,avg:m.ticks/m.days,days:m.days,best:bestStreak(m.list)}; });
  }
  function trendBars(days,valFn,grad){ var max=1; days.forEach(function(o){ max=Math.max(max,valFn(o)); }); var h='<div style="display:flex;align-items:flex-end;gap:2px;height:52px;">'; days.forEach(function(o){ var v=valFn(o); var hh=v?Math.max(4,Math.round(v/max*52)):2; h+='<div style="flex:1;height:'+hh+'px;border-radius:3px;background:'+grad+';opacity:'+(v?1:0.22)+';"></div>'; }); h+='</div>'; return h; }
  function nextMilestone(streak){ var ms=[7,21,30,50,100,200,365,500,1000]; for(var i=0;i<ms.length;i++){ if(streak<ms[i]) return {target:ms[i],pct:Math.round(streak/ms[i]*100)}; } return null; }

  function moodScoreOf(rec){ var m={'cok-iyi':5,'iyi':4,'normal':3,'zorlandim':2,'cok-zorlandim':1}; return rec&&rec.mood&&m[rec.mood]?m[rec.mood]:null; }
  function avgOf(a){ return a.length?a.reduce(function(x,y){return x+y;},0)/a.length:null; }
  function weekSelfCard(){
    var days=lastNDays(7); var recorded=days.filter(function(o){return o.rec;});
    if(recorded.length<2) return '';
    var best=null; days.forEach(function(o){ if(o.rec){ var c=countRec(o.rec); if(!best||c>best.c) best={date:o.date,c:c,rec:o.rec}; } });
    var bestHabit=null,bestPct=-1; habitCatalog().forEach(function(hb){ var p=habitRate(days,hb.key); if(p>bestPct){bestPct=p;bestHabit=hb;} });
    var sleeps=[],waters=[],prots=[],medFree=0;
    recorded.forEach(function(o){ var r=o.rec; if(r.sleep&&r.sleep.hours!=null) sleeps.push(Number(r.sleep.hours)); if(typeof r.water==='number'&&r.water>0) waters.push(r.water); var pr=dayNutrition(r).protein; if(pr>0) prots.push(pr); if(r.sleep&&r.sleep.med&&r.sleep.med.type==='none') medFree++; });
    var sa=avgOf(sleeps),wa=avgOf(waters),pa=avgOf(prots);
    var moodLink=''; var gm=[],bm=[]; recorded.forEach(function(o){ var ms=moodScoreOf(o.rec),sh=(o.rec.sleep&&o.rec.sleep.hours!=null)?Number(o.rec.sleep.hours):null; if(ms==null||sh==null) return; (sh>=7?gm:bm).push(ms); });
    if(gm.length&&bm.length&&avgOf(gm)-avgOf(bm)>=0.4) moodLink='İyi uyuduğun günler modunu da yukarı çekmiş.';
    var rows=[];
    if(best) rows.push([icon('star',16),'En parlak günün', shortDate(best.date)+' · '+best.c+'/'+habitCountOn(best.date)+' tik']);
    if(bestHabit&&bestPct>0) rows.push([bestHabit.icon,'En güçlü alışkanlığın', esc(bestHabit.title)+' · %'+bestPct]);
    if(sa!=null) rows.push([icon('moon',16),'Ortalama uyku', sa.toFixed(1)+' saat']);
    if(wa!=null) rows.push([icon('droplet',16),'Ortalama su', wa.toFixed(1)+' bardak']);
    if(pa!=null) rows.push([icon('egg',16),'Ortalama protein', Math.round(pa)+' g']);
    if(medFree>0) rows.push([icon('moon',16),'İlaçsız gece', medFree+' gece']);
    var h='<div style="background:linear-gradient(135deg,rgba(255,225,154,0.4),rgba(247,221,229,0.55));border:1px solid var(--card-bd);border-radius:22px;padding:18px;display:flex;flex-direction:column;gap:12px;">';
    h+='<div style="font-size:var(--f-body);font-weight:800;color:var(--text);display:flex;align-items:center;gap:7px;">Bu hafta sen '+icon('sparkles',16)+'</div>';
    h+='<div style="display:flex;flex-direction:column;gap:9px;">';
    rows.forEach(function(r){ h+='<div style="display:flex;align-items:center;gap:11px;"><span style="width:24px;display:flex;justify-content:center;">'+r[0]+'</span><span style="flex:1;font-size:var(--f-footnote);color:var(--text2);">'+r[1]+'</span><span style="font-size:var(--f-subhead);font-weight:800;color:var(--text);text-align:right;">'+r[2]+'</span></div>'; });
    h+='</div>';
    if(moodLink) h+='<div style="font-size:var(--f-footnote);font-weight:600;color:var(--accent-ink);background:var(--card);border-radius:14px;padding:11px 13px;">'+moodLink+'</div>';
    h+='</div>';
    return h;
  }
  function corrInsights(){
    var days=lastNDays(30).filter(function(o){return o.rec;});
    if(days.length<6) return [];
    var out=[];
    function gavg(a){return a.length?a.reduce(function(x,y){return x+y;},0)/a.length:null;}
    var gm=[],bm=[]; days.forEach(function(o){ var ms=moodScoreOf(o.rec),sh=(o.rec.sleep&&o.rec.sleep.hours!=null)?Number(o.rec.sleep.hours):null; if(ms==null||sh==null) return; if(sh>=7) gm.push(ms); else if(sh<6) bm.push(ms); });
    if(gm.length>=3&&bm.length>=3&&gavg(gm)-gavg(bm)>=0.4) out.push([icon('moon',18),'7+ saat uyuduğun günlerde modun belirgin daha iyi. Uyku senin gizli süper gücün.']);
    var ws=[],ns=[]; days.forEach(function(o){ var sos=Number(o.rec.cravingSOSCount||0); ((o.rec.habits&&o.rec.habits.walked20)?ws:ns).push(sos); });
    if(ws.length>=3&&ns.length>=3&&gavg(ns)-gavg(ws)>=0.3) out.push([icon('footprints',18),'Yürüdüğün günlerde tatlı krizi sayın daha düşük. Ayaklar çalışınca tatlı lobisi sus pus.']);
    var hp=[],lp=[]; var pg=proteinGoal(); days.forEach(function(o){ var pr=dayNutrition(o.rec).protein,sos=Number(o.rec.cravingSOSCount||0); if(pr>=pg*0.8) hp.push(sos); else if(pr>0) lp.push(sos); });
    if(hp.length>=3&&lp.length>=3&&gavg(lp)-gavg(hp)>=0.3) out.push([icon('egg',18),'Proteini tutturduğun günlerde kriz daha az. Tokluk ekibi sahada.']);
    var he=[],le=[]; days.forEach(function(o){ var w=(typeof o.rec.water==='number')?o.rec.water:null,e=o.rec.energy; if(w==null||e==null) return; (w>=waterGoalCups(o.date)?he:le).push(Number(e)); });
    if(he.length>=3&&le.length>=3&&gavg(he)-gavg(le)>=0.3) out.push([icon('droplet',18),'Su hedefini tutturduğun günlerde enerjin daha yüksek. Beden susuz çalışmıyor.']);
    return out;
  }
  function consistencyMomentumCard(){
    var t=todayStr(),root=liveData(),days=(root&&root.days)||{};
    var d30=lastNDays(30);
    var active30=d30.filter(function(o){return o.rec&&countRec(o.rec)>0;}).length;
    var consist=Math.round(active30/30*100);
    var cur7=[],prev7=[];
    for(var i=0;i<7;i++){ var dk=addDays(t,-i); cur7.push(days[dk]?countRec(days[dk]):0); }
    for(var j=7;j<14;j++){ var dk2=addDays(t,-j); prev7.push(days[dk2]?countRec(days[dk2]):0); }
    var a7=avgOf(cur7), ap7=avgOf(prev7), momentum=(a7!=null&&ap7!=null)?(Math.round((a7-ap7)*10)/10):null;
    var wdSum=[0,0,0,0,0,0,0], wdMax=[0,0,0,0,0,0,0];
    for(var k=0;k<56;k++){ var dk3=addDays(t,-k); var r=days[dk3]; if(!r) continue; var p=dk3.split('-').map(Number); var wd=(new Date(p[0],p[1]-1,p[2]).getDay()+6)%7; wdSum[wd]+=countRec(r); wdMax[wd]+=habitCountOn(dk3); }
    var wdPct=[]; for(var w=0;w<7;w++){ wdPct.push(wdMax[w]>0?Math.round(wdSum[w]/wdMax[w]*100):null); }
    var hasWd=wdPct.some(function(x){return x!=null;});
    var wdLabels=['Pt','Sa','Ça','Pe','Cu','Ct','Pz'];
    var momIcon=momentum==null?'minus':(momentum>0?'trending-up':(momentum<0?'chart-column':'minus'));
    var momCol=momentum==null?'var(--muted)':(momentum>0?'#3F8A4F':(momentum<0?'#E9899F':'var(--muted)'));
    var momTxt=momentum==null?'—':((momentum>0?'+':'')+String(momentum).replace('.',','));
    var tile=function(val,label,col){ return '<div style="flex:1;min-width:0;background:var(--icon);border-radius:14px;padding:12px 8px;text-align:center;"><div style="font-size:var(--f-title3);font-weight:800;color:'+col+';line-height:1;font-variant-numeric:tabular-nums;">'+val+'</div><div style="font-size:var(--f-caption2);color:var(--faint);margin-top:4px;font-weight:700;letter-spacing:.2px;">'+label+'</div></div>'; };
    var h='<div class="surface" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;">';
    h+='<div style="font-size:var(--f-callout);font-weight:700;display:flex;align-items:center;gap:6px;"><span style="display:inline-flex;color:var(--accent-ink);">'+icon('microscope',16)+'</span>Tutarlılık & Momentum</div>';
    h+='<div style="display:flex;gap:8px;">'+tile('%'+consist,'Tutarlılık (30g)','var(--accent)')+tile(active30+'/30','Aktif gün','#5BA85B')+tile(momTxt,'Momentum (7g)',momCol)+'</div>';
    if(hasWd){
      h+='<div style="display:flex;flex-direction:column;gap:6px;"><div style="font-size:var(--f-caption1);font-weight:700;color:var(--muted);">Haftanın günleri (son 8 hafta)</div>';
      h+='<div style="display:flex;align-items:flex-end;gap:5px;height:46px;">';
      wdPct.forEach(function(pc){ var hh=pc!=null?Math.max(6,Math.round(pc/100*40)):4; var col=pc==null?'rgba(150,110,120,0.18)':(pc>=66?'#8FBF8A':(pc>=33?'#E9AFC1':'#C9B8FF')); h+='<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;"><div style="width:100%;max-width:20px;height:'+hh+'px;border-radius:5px;background:'+col+';"></div></div>'; });
      h+='</div>';
      h+='<div style="display:flex;gap:5px;">'; wdLabels.forEach(function(l){ h+='<div style="flex:1;text-align:center;font-size:var(--f-caption2);color:var(--faint);font-weight:700;">'+l+'</div>'; }); h+='</div>';
      h+='</div>';
    }
    h+=sciNote('Tutarlılık, tekil zirvelerden değerlidir: davranışın otomatikleşmesi (habit formation) tekrar sıklığına bağlıdır. Momentum, son 7 günün önceki 7 güne göre yönü — küçük pozitif ivme bile bileşik olarak birikir.');
    h+='</div>';
    return h;
  }
  function badgesGrid(){
    var all=allDays(); var best=bestStreak(all); var medStreak=medFreeStreak();
    var waterGoal=0,proteinGoalMet=0,perfect=0,readingDays=0; var pg=proteinGoal();
    all.forEach(function(o){ var r=o.rec; if(!r) return; if((r.water||0)>=waterGoalCups(o.date)) waterGoal++; if(dayNutrition(r).protein>=pg) proteinGoalMet++; if(countRec(r)>=habitCountOn(o.date)) perfect++; if(r.reading&&Array.isArray(r.reading.entries)&&r.reading.entries.length>0) readingDays++; });
    var badges=[
      {e:icon('flame',20),l:'7 gün seri',done:best>=7,sub:best>=7?'tamam':best+'/7'},
      {e:icon('trophy',20),l:'30 gün seri',done:best>=30,sub:best>=30?'tamam':best+'/30'},
      {e:icon('crown',20),l:'100 gün seri',done:best>=100,sub:best>=100?'tamam':best+'/100'},
      {e:icon('moon',20),l:'7 gece ilaçsız',done:medStreak>=7,sub:medStreak>=7?'tamam':medStreak+'/7'},
      {e:icon('droplet',20),l:'Su hedefi',done:waterGoal>=1,sub:waterGoal>0?waterGoal+' gün':'henüz yok'},
      {e:icon('egg',20),l:'Protein hedefi',done:proteinGoalMet>=1,sub:proteinGoalMet>0?proteinGoalMet+' gün':'henüz yok'},
      {e:icon('book-open',20),l:'Okuma tutkunu',done:readingDays>=7,sub:readingDays>=7?'tamam':readingDays+'/7'},
      {e:icon('sparkles',20),l:'7/7 mükemmel',done:perfect>=1,sub:perfect>0?perfect+' gün':'henüz yok'}
    ];
    var h='<div class="surface" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;"><div style="font-size:var(--f-callout);font-weight:700;display:flex;align-items:center;gap:7px;">Rozetler '+icon('trophy',17)+'</div>';
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;">';
    badges.forEach(function(b){ var on=b.done; h+='<div style="display:flex;align-items:center;gap:10px;border-radius:14px;padding:11px 12px;'+(on?'background:linear-gradient(135deg,rgba(255,232,163,0.55),rgba(247,221,229,0.6));border:1px solid #E9AFC1;':'background:var(--card);border:1px solid var(--card-bd);opacity:0.62;')+'"><span style="display:inline-flex;'+(on?'':'filter:grayscale(1);')+'">'+b.e+'</span><div style="min-width:0;"><div style="font-size:var(--f-footnote);font-weight:700;color:var(--text);">'+esc(b.l)+'</div><div style="font-size:var(--f-caption2);color:var(--faint);">'+esc(b.sub)+'</div></div></div>'; });
    h+='</div></div>';
    return h;
  }
  function weeklyStepRecap(){
    var stepOf=function(o){ return effSteps(o&&o.rec).steps||0; };
    var t=todayStr(),last7=lastNDays(7),root=liveData(),days=(root&&root.days)||{};
    var prev7=[]; for(var i=13;i>=7;i--){ var d=addDays(t,-i); prev7.push({date:d,rec:days[d]||null}); }
    var cov=last7.filter(function(o){return stepOf(o)>0;});
    var head='<div style="display:flex;align-items:center;gap:8px;"><span style="display:inline-flex;align-items:center;gap:4px;font-size:var(--f-caption1);font-weight:800;letter-spacing:.8px;color:#1a1404;background:linear-gradient(135deg,#E6C15A,#C99A3A);border-radius:999px;padding:3px 10px;">'+icon('hexagon',12)+' ÆON</span><span style="font-size:var(--f-subhead);font-weight:700;color:var(--text);">Haftalık adım özeti</span>';
    if(!cov.length){
      return '<div class="surface" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:10px;border:1px solid rgba(201,160,60,0.30);background:linear-gradient(135deg,rgba(230,193,90,0.10),rgba(155,127,201,0.07));">'+head+'</div>'
        +'<div style="font-size:var(--f-footnote);color:var(--text2);line-height:1.5;">Bu hafta henüz adım kaydın yok. Eklemen 5 saniye — ya da <b style="display:inline-flex;align-items:center;gap:4px;">'+icon('apple',13)+' Sağlık’tan çek</b> ile otomatik gelsin. Küçük bir veri, büyük resmi netleştirir.</div></div>';
    }
    var avg=Math.round(cov.reduce(function(a,o){return a+stepOf(o);},0)/cov.length);
    var peak=last7.reduce(function(m,o){return Math.max(m,stepOf(o));},0);
    var prevCov=prev7.filter(function(o){return stepOf(o)>0;});
    var prevAvg=prevCov.length?Math.round(prevCov.reduce(function(a,o){return a+stepOf(o);},0)/prevCov.length):null;
    var msg;
    if(avg>=7000) msg='Harika tempo — sağlık kazancının kanıtla en güçlü olduğu aralıktasın. Böyle sürdür.';
    else if(avg>=4000) msg='Güzel gidiyor; bu aralıkta bile kazanç net. Küçük artışlar büyük fark yapar.';
    else msg='Başlangıç senin hızında — yarın 500 adım fazlası bile ilerlemedir. Kendine yüklenme.';
    var h='<div class="surface" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:11px;border:1px solid rgba(201,160,60,0.30);background:linear-gradient(135deg,rgba(230,193,90,0.08),rgba(155,127,201,0.06));">';
    h+=head+'<span style="margin-left:auto;font-size:var(--f-caption1);color:var(--faint);font-weight:700;">'+cov.length+'/7 gün</span></div>';
    h+='<div style="display:flex;gap:14px;align-items:baseline;flex-wrap:wrap;"><div><span style="font-size:var(--f-title2);font-weight:800;color:var(--text);font-variant-numeric:tabular-nums;">'+avg.toLocaleString('tr-TR')+'</span><span style="font-size:var(--f-caption1);color:var(--faint);"> ort. adım/gün</span></div>';
    if(peak>0) h+='<div style="font-size:var(--f-footnote);color:var(--muted);">Tepe <b style="color:var(--text2);">'+peak.toLocaleString('tr-TR')+'</b></div>';
    if(prevAvg!=null){ var d2=avg-prevAvg, pct=prevAvg?Math.round(d2/prevAvg*100):0; h+='<div style="font-size:var(--f-footnote);font-weight:700;margin-left:auto;color:'+(d2>=0?'#3F8A4F':'#B0764F')+';">'+(d2>=0?'▲ +':'▼ ')+Math.abs(pct)+'% <span style="color:var(--faint);font-weight:600;">geçen haftaya göre</span></div>'; }
    h+='</div>';
    h+=trendBars(last7,function(o){return stepOf(o);},'linear-gradient(180deg,#E6C15A,#E9899F)');
    h+='<div style="font-size:var(--f-footnote);color:var(--text2);line-height:1.5;">'+msg+'</div>';
    h+='</div>';
    return h;
  }
  function distanceRecapCard(){
    var t=todayStr(),root=liveData(),days=(root&&root.days)||{},last7=lastNDays(7);
    var prev7=[]; for(var i=13;i>=7;i--){ var d=addDays(t,-i); prev7.push({date:d,rec:days[d]||null}); }
    var sum=function(list,key){ return list.reduce(function(a,o){ return a+dayMovement(o.rec)[key]; },0); };
    var wTot=sum(last7,'total'), wWalk=sum(last7,'walk'), wVeh=sum(last7,'veh');
    var pTot=sum(prev7,'total');
    var todayM=dayMovement(days[t]||null);
    var last30=lastNDays(30); var mTot=sum(last30,'total');
    var any=mTot>0||wTot>0||todayM.total>0;
    var head='<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:var(--f-callout);font-weight:700;color:var(--text);display:flex;align-items:center;gap:6px;">Mesafe & Hareket '+icon('map-pin',16)+'</span></div>';
    if(!any){
      return '<div class="surface" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:10px;">'+head
        +'<div style="font-size:var(--f-footnote);color:var(--text2);line-height:1.5;">Henüz kayıtlı hareket yok. Bugün ekranındaki <b>Konum & Hareket</b> kartından takibi açarsan, kat ettiğin mesafe burada günlük, haftalık ve zaman içinde birikir.</div></div>';
    }
    var h='<div class="surface" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;">'+head;
    h+='<div style="display:flex;gap:10px;">';
    h+='<div style="flex:1;background:var(--icon);border-radius:14px;padding:11px;text-align:center;"><div style="font-size:var(--f-caption2);color:var(--muted);font-weight:700;">Bugün</div><div style="font-size:var(--f-headline);font-weight:800;font-variant-numeric:tabular-nums;">'+fmtDist(todayM.total)+'</div></div>';
    h+='<div style="flex:1;background:var(--icon);border-radius:14px;padding:11px;text-align:center;"><div style="font-size:var(--f-caption2);color:var(--muted);font-weight:700;">Bu hafta</div><div style="font-size:var(--f-headline);font-weight:800;font-variant-numeric:tabular-nums;">'+fmtDist(wTot)+'</div></div>';
    h+='<div style="flex:1;background:var(--icon);border-radius:14px;padding:11px;text-align:center;"><div style="font-size:var(--f-caption2);color:var(--muted);font-weight:700;">30 gün</div><div style="font-size:var(--f-headline);font-weight:800;font-variant-numeric:tabular-nums;">'+fmtDist(mTot)+'</div></div>';
    h+='</div>';
    if(pTot>0){ var d2=wTot-pTot, pct=Math.round(d2/pTot*100); h+='<div style="font-size:var(--f-footnote);font-weight:700;color:'+(d2>=0?'#3F8A4F':'#B0764F')+';">'+(d2>=0?'▲ +':'▼ ')+Math.abs(pct)+'% <span style="color:var(--faint);font-weight:600;">geçen haftaya göre</span></div>'; }
    h+='<div style="font-size:var(--f-caption1);color:var(--muted);">Günlük mesafe (son 7 gün)</div>';
    h+=trendBars(last7,function(o){return dayMovement(o.rec).total;},'linear-gradient(180deg,#7DBE77,#9B7FC9)');
    h+='<div style="display:flex;gap:5px;">'; last7.forEach(function(o){ h+='<div style="flex:1;text-align:center;font-size:var(--f-caption2);color:var(--faint);">'+o.date.slice(8)+'</div>'; }); h+='</div>';
    h+='<div style="display:flex;gap:8px;font-size:var(--f-footnote);">';
    h+='<span style="flex:1;background:rgba(143,191,138,0.14);border-radius:10px;padding:8px 10px;color:var(--text2);display:flex;align-items:center;gap:5px;">'+icon('footprints',14)+' Yürüyüş <b style="margin-left:auto;">'+fmtDist(wWalk)+'</b></span>';
    h+='<span style="flex:1;background:rgba(201,184,255,0.16);border-radius:10px;padding:8px 10px;color:var(--text2);display:flex;align-items:center;gap:5px;">'+icon('car',14)+' Araç <b style="margin-left:auto;">'+fmtDist(wVeh)+'</b></span>';
    h+='</div>';
    h+='<div style="font-size:var(--f-caption2);color:var(--faint);line-height:1.4;">Ölçüm yalnızca uygulama açıkken birikir. Hareketler korunur, silinmez.</div>';
    h+='</div>';
    return h;
  }
  function moodHeatmapCard(){
    var mcol={'cok-iyi':'#FFD37A','iyi':'#F2B65A','normal':'#8FBF8A','zorlandim':'#9BB0D9','cok-zorlandim':'#B89BD9'};
    var root=liveData(),days=(root&&root.days)||{},today=todayStr();
    var startY=+String(root&&root.startDate||today).slice(0,4);
    var nowY=new Date().getFullYear();
    var view=liveUi(),curY=+(view.heatYear||nowY); if(curY<startY)curY=startY; if(curY>nowY)curY=nowY;
    var jan1=new Date(curY,0,1), dec31=new Date(curY,11,31);
    var startDow=(jan1.getDay()+6)%7; var start=new Date(jan1); start.setDate(start.getDate()-startDow);
    var CELL=13, GAP=3, STEP=CELL+GAP, DAYLABW=24;
    var monN=['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
    var dayLab=['Pzt','','Çar','','Cum','',''];
    var weeks=[], cur=new Date(start);
    while(cur<=dec31){ var col=[]; for(var d=0; d<7; d++){ col.push(new Date(cur)); cur.setDate(cur.getDate()+1); } weeks.push(col); }
    var nW=weeks.length;
    var h='<div class="surface" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:12px;">';
    h+='<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">';
    h+='<div style="font-size:var(--f-callout);font-weight:700;display:flex;align-items:center;gap:6px;">Mod ısı haritası '+icon('calendar',16)+'</div>';
    var prevOk=curY>startY, nextOk=curY<nowY;
    h+='<div style="display:flex;align-items:center;gap:6px;">';
    h+='<button '+(prevOk?'onclick="App.heatYear(-1)"':'disabled')+' style="border:none;cursor:'+(prevOk?'pointer':'default')+';width:28px;height:28px;border-radius:50%;background:var(--card);color:var(--text);font-size:var(--f-callout);opacity:'+(prevOk?'1':'0.3')+';">‹</button>';
    h+='<div style="font-size:var(--f-subhead);font-weight:800;min-width:46px;text-align:center;">'+curY+'</div>';
    h+='<button '+(nextOk?'onclick="App.heatYear(1)"':'disabled')+' style="border:none;cursor:'+(nextOk?'pointer':'default')+';width:28px;height:28px;border-radius:50%;background:var(--card);color:var(--text);font-size:var(--f-callout);opacity:'+(nextOk?'1':'0.3')+';">›</button>';
    h+='</div></div>';
    h+='<div style="overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:4px;">';
    h+='<div style="display:inline-flex;flex-direction:column;gap:4px;">';
    h+='<div style="position:relative;height:12px;margin-left:'+(DAYLABW+GAP)+'px;width:'+(nW*STEP)+'px;">';
    for(var w=0; w<nW; w++){ for(var di=0; di<7; di++){ var dd=weeks[w][di]; if(dd.getFullYear()===curY && dd.getDate()===1){ h+='<span style="position:absolute;left:'+(w*STEP)+'px;top:0;font-size:var(--f-caption2);font-weight:700;color:var(--faint);white-space:nowrap;">'+monN[dd.getMonth()]+'</span>'; } } }
    h+='</div>';
    h+='<div style="display:flex;gap:'+GAP+'px;">';
    h+='<div style="display:flex;flex-direction:column;gap:'+GAP+'px;width:'+DAYLABW+'px;">';
    for(var r=0; r<7; r++){ h+='<div style="height:'+CELL+'px;line-height:'+CELL+'px;font-size:var(--f-caption2);color:var(--faint);text-align:right;">'+dayLab[r]+'</div>'; }
    h+='</div>';
    var recDays=0;
    var moods=moodCatalog(),isDark=liveDark();
    for(var w2=0; w2<nW; w2++){
      h+='<div style="display:flex;flex-direction:column;gap:'+GAP+'px;">';
      for(var r2=0; r2<7; r2++){
        var dt=weeks[w2][r2]; var ds=dt.getFullYear()+'-'+pad(dt.getMonth()+1)+'-'+pad(dt.getDate());
        if(dt.getFullYear()!==curY){ h+='<div style="width:'+CELL+'px;height:'+CELL+'px;"></div>'; continue; }
        var future=diffDays(today,ds)>0; var rec=days[ds]||null; var bg, clk=false, tip=shortDate(ds)+'.'+curY;
        if(future){ bg='rgba(150,110,120,0.06)'; }
        else if(rec && rec.mood){ bg=mcol[rec.mood]||'#C9B8FF'; clk=true; recDays++; var mo=find(moods,'id',rec.mood); tip+=(mo?' · '+mo.short:''); }
        else if(rec){ bg=isDark?'rgba(233,175,193,0.30)':'rgba(150,110,120,0.24)'; clk=true; recDays++; tip+=' · kayıt var'; }
        else { bg=isDark?'rgba(255,255,255,0.05)':'rgba(150,110,120,0.10)'; clk=true; tip+=' · kayıt yok'; }
        var isT=ds===today;
        h+=(clk?'<button type="button" class="sey-asbtn" onclick="App.heatOpen(\''+ds+'\')" ':'<div ')+'title="'+tip+'" style="width:'+CELL+'px;height:'+CELL+'px;border-radius:3px;background:'+bg+';cursor:'+(clk?'pointer':'default')+';'+(isT?'box-shadow:0 0 0 1.5px var(--accent);':'')+'">'+(clk?'</button>':'</div>');
      }
      h+='</div>';
    }
    h+='</div></div></div>';
    h+='<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">';
    h+='<div style="display:flex;align-items:center;gap:5px;font-size:var(--f-caption2);color:var(--faint);">zor';
    ['cok-zorlandim','zorlandim','normal','iyi','cok-iyi'].forEach(function(mid){ h+='<span style="width:11px;height:11px;border-radius:3px;background:'+mcol[mid]+';display:inline-block;"></span>'; });
    h+='iyi</div>';
    h+='<div style="font-size:var(--f-caption2);color:var(--faint);">'+recDays+' gün kayıtlı · dokun → düzenle</div>';
    h+='</div>';
    if(recDays===0) h+='<div style="font-size:var(--f-caption1);color:var(--faint);line-height:1.5;">'+curY+' için henüz mod kaydı yok. Bir kareye dokunup o günü açabilirsin.</div>';
    h+='</div>';
    return h;
  }
  function raporHTML(){
    var all=allDays(); var last30=lastNDays(30);
    var totalTicks=0; all.forEach(function(o){ totalTicks+=countRec(o.rec); });
    var cur=currentStreak(), best=bestStreak(all), tracked=daysTracked();
    var h='<div style="animation:seyFade .3s ease;display:flex;flex-direction:column;gap:14px;">';
    var chips=[[icon('flame',13)+' Güncel seri',cur+' gün'],[icon('trophy',13)+' En iyi seri',best+' gün'],[icon('calendar',13)+' Takip günü',tracked],[icon('circle-check',13)+' Toplam tik',totalTicks]];
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;">';
    chips.forEach(function(c){ h+='<div class="surface" style="border-radius:16px;padding:13px;"><div style="font-size:var(--f-caption1);color:var(--faint);display:flex;align-items:center;gap:4px;">'+c[0]+'</div><div style="font-size:var(--f-title2);font-weight:800;margin-top:3px;">'+esc(c[1])+'</div></div>'; });
    h+='</div>';
    var msx=nextMilestone(cur); if(msx) h+='<div style="background:linear-gradient(135deg,#FFE19A,#F7C9B0);border-radius:16px;padding:12px 15px;font-size:var(--f-footnote);font-weight:700;color:#7A4A2E;display:flex;align-items:center;gap:7px;">'+icon('target',15)+' Sonraki kilometre taşı: '+msx.target+' gün · yolun %'+msx.pct+'</div>';
    h+=consistencyMomentumCard();
    h+=weekSelfCard();
    h+=distanceRecapCard();
    h+=weeklyStepRecap();
    var avg30=(last30.reduce(function(a,o){return a+countRec(o.rec);},0)/30).toFixed(1);
    h+='<div class="surface" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:10px;"><div style="display:flex;justify-content:space-between;align-items:baseline;"><div style="font-size:var(--f-callout);font-weight:700;">Son 30 gün — günlük tik</div><div style="font-size:var(--f-caption1);color:var(--faint);">ort. '+avg30+'/'+htToday()+'</div></div>';
    h+=trendBars(last30,function(o){return countRec(o.rec);},'linear-gradient(180deg,#E9899F,#C9B8FF)')+'</div>';
    h+='<div class="surface" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:11px;"><div style="font-size:var(--f-callout);font-weight:700;">Alışkanlık oranları (30 gün)</div>';
    habitCatalog().forEach(function(hb){ var pct=habitRate(last30,hb.key); h+='<div style="display:flex;flex-direction:column;gap:4px;"><div style="display:flex;justify-content:space-between;font-size:var(--f-footnote);"><span style="color:var(--text2);">'+hb.icon+' '+esc(hb.title)+'</span><span style="font-weight:700;color:var(--accent-ink);">%'+pct+'</span></div><div style="height:7px;border-radius:999px;background:rgba(150,110,120,0.13);overflow:hidden;"><div style="height:100%;width:'+pct+'%;border-radius:999px;background:linear-gradient(90deg,#E9AFC1,#C9B8FF);"></div></div></div>'; });
    h+=sciNote('Bir alışkanlık ne kadar sık tekrarlanırsa nöral yolu o kadar güçlenir (nöroplastisite); %60+ oran, davranışın otomatikleşmeye başladığını gösterir.');
    h+='</div>';
    var _mv=[],_ev=[],_sv=[];
    last30.forEach(function(o){ if(!o.rec) return; var _ms=moodScore(o.rec.mood); if(_ms!=null) _mv.push(_ms); if(o.rec.energy!=null) _ev.push(Number(o.rec.energy)); if(o.rec.stress!=null) _sv.push(Number(o.rec.stress)); });
    var _mA=avgOf(_mv),_eA=avgOf(_ev),_sA=avgOf(_sv);
    if(_mA!=null||_eA!=null||_sA!=null){
      var rtile=function(label,val,col){ return '<div style="flex:1;min-width:0;background:var(--icon);border-radius:14px;padding:12px 8px;text-align:center;"><div style="font-size:var(--f-title3);font-weight:800;color:'+col+';line-height:1;font-variant-numeric:tabular-nums;">'+(val!=null?val.toFixed(1).replace('.',','):'—')+'</div><div style="font-size:var(--f-caption2);color:var(--faint);margin-top:4px;font-weight:700;letter-spacing:.2px;">'+label+'</div></div>'; };
      h+='<div class="surface" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:11px;"><div style="font-size:var(--f-callout);font-weight:700;display:flex;align-items:center;gap:6px;"><span style="display:inline-flex;color:#8A75C8;">'+icon('brain',16)+'</span>Ruhsal eğilim — 30 gün</div>';
      h+='<div style="display:flex;gap:8px;">'+rtile('Mod /5',_mA,'#C97FA8')+rtile('Enerji /5',_eA,'#F5A623')+rtile('Stres /5',_sA,'#7C5CC4')+'</div>';
      h+=sciNote('Ruh hâli fiziksel alışkanlıklardan bağımsız değil: iyi uyku ve düzenli hareket modu yükseltir, kronik stres ise iştahı ve şeker isteğini besler. Bu üç ekseni birlikte izlemek, bedeni ve zihni tek sistem olarak görmeni sağlar.');
      h+='</div>';
    }
    var pAvg=avgOf(last30.filter(function(o){return o.rec;}).map(function(o){return dayNutrition(o.rec).protein;}).filter(function(v){return v>0;}));
    var wAvg=avgOf(last30.filter(function(o){return o.rec&&typeof o.rec.water==='number'&&o.rec.water>0;}).map(function(o){return o.rec.water;}));
    h+='<div class="surface" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:14px;">';
    h+='<div style="display:flex;justify-content:space-between;align-items:baseline;"><div style="font-size:var(--f-callout);font-weight:700;display:flex;align-items:center;gap:6px;">'+icon('egg',16)+' Protein trendi (30 gün)</div><div style="font-size:var(--f-caption1);color:var(--faint);">ort. '+(pAvg!=null?Math.round(pAvg)+' g':'—')+'</div></div>';
    h+=trendBars(last30,function(o){return o.rec?dayNutrition(o.rec).protein:0;},'linear-gradient(180deg,#F2B65A,#E9899F)');
    h+='<div style="display:flex;justify-content:space-between;align-items:baseline;"><div style="font-size:var(--f-callout);font-weight:700;display:flex;align-items:center;gap:6px;">'+icon('droplet',16)+' Su trendi (30 gün)</div><div style="font-size:var(--f-caption1);color:var(--faint);">ort. '+(wAvg!=null?(Math.round(wAvg*10)/10)+' bardak':'—')+'</div></div>';
    h+=trendBars(last30,function(o){return o.rec&&typeof o.rec.water==='number'?o.rec.water:0;},'linear-gradient(180deg,#7FC9E9,#C9B8FF)');
    h+='</div>';
    var ins=corrInsights();
    if(ins.length){ h+='<div class="surface" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:11px;"><div style="font-size:var(--f-callout);font-weight:700;display:flex;align-items:center;gap:6px;">Senin örüntülerin '+icon('search',16)+'</div>';
      ins.forEach(function(c){ h+='<div style="display:flex;gap:11px;align-items:flex-start;background:var(--card);border-radius:14px;padding:12px 13px;"><span style="flex-shrink:0;display:flex;">'+c[0]+'</span><span style="flex:1;font-size:var(--f-footnote);line-height:1.5;color:var(--text2);">'+esc(c[1])+'</span></div>'; });
      h+='<div style="font-size:var(--f-caption2);color:var(--faint);line-height:1.5;">Bunlar senin kayıtlarından çıkan eğilimler; tıbbi tavsiye değil, küçük ipuçları.</div></div>';
    }
    var md=moodDist(last30); var mtot=0; for(var mkk in md) mtot+=md[mkk];
    h+='<div class="surface" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:10px;"><div style="font-size:var(--f-callout);font-weight:700;">Mod dağılımı (30 gün)</div>';
    if(mtot){ var mcol={'cok-iyi':'#FFD37A','iyi':'#F2B65A','normal':'#8FBF8A','zorlandim':'#9BB0D9','cok-zorlandim':'#B89BD9'};
      h+='<div style="display:flex;height:14px;border-radius:999px;overflow:hidden;">'; moodCatalog().forEach(function(m){ var v=md[m.id]||0; if(v) h+='<div style="width:'+(v/mtot*100)+'%;background:'+(mcol[m.id]||'#C9B8FF')+';"></div>'; }); h+='</div>';
      h+='<div style="display:flex;flex-wrap:wrap;gap:10px;font-size:var(--f-caption1);color:var(--muted);">'; moodCatalog().forEach(function(m){ var v=md[m.id]||0; if(v) h+='<span style="display:inline-flex;align-items:center;gap:4px;">'+icon(m.icon,13)+' '+esc(m.short)+' <b>'+v+'</b></span>'; }); h+='</div>';
    } else h+='<div style="font-size:var(--f-footnote);color:var(--faint);">Bu dönemde mod kaydı yok.</div>';
    h+='</div>';
    h+=moodHeatmapCard();
    h+=badgesGrid();
    var months=monthlySummary();
    if(months.length){ var moN=['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
      h+='<div style="padding:4px 4px 0;"><div style="font-size:var(--f-body);font-weight:800;">Aylık özet</div></div>';
      months.slice(0,12).forEach(function(m){ var p=m.month.split('-'); h+='<div class="surface" style="border-radius:16px;padding:13px 15px;display:flex;justify-content:space-between;align-items:center;"><div><div style="font-size:var(--f-subhead);font-weight:800;">'+moN[+p[1]-1]+' '+p[0]+'</div><div style="font-size:var(--f-caption1);color:var(--faint);">'+m.days+' gün kayıt</div></div><div style="text-align:right;"><div style="font-size:var(--f-footnote);color:var(--accent-ink);font-weight:700;">ort. '+m.avg.toFixed(1)+'/'+htToday()+'</div><div style="font-size:var(--f-caption1);color:var(--muted);">en iyi seri '+m.best+'</div></div></div>'; });
    }
    h+='<div style="padding:8px 4px 0;"><div style="font-size:var(--f-title2);font-weight:800;display:flex;align-items:center;gap:8px;">Minik Kurallar '+icon('leaf',20)+'</div></div>';
    h+='<div class="surface" style="border-radius:22px;padding:18px;display:flex;flex-direction:column;gap:11px;">';
    [[icon('leaf',17),'Aç kalmak yok.'],[icon('cookie',17),'Tatlı hayatımızdan silinmiyor; sadece otomatik pilottan çıkıyor.'],[icon('moon',17),'Akşam 7\'den sonra önce şunu sor: gerçekten aç mıyım?'],[icon('egg',17),'Her öğüne protein eklemek krizleri sakinleştirir.'],[icon('sun',17),'D₃K₂ damla da küçük ritmin bir parçası.'],[icon('dumbbell',17),'Bir gün zor geçti diye sistem bitmez.'],[icon('footprints',17),'Yürüyüş kısa da olsa sayılır.'],[icon('heart',17),'Kendine kötü konuşmak yok.'],[icon('sun',17),'Kontrol, kendine sert davranmak değildir.']].forEach(function(r){ h+='<div style="display:flex;gap:10px;font-size:var(--f-subhead);line-height:1.45;"><span style="display:inline-flex;flex-shrink:0;">'+r[0]+'</span><span>'+esc(r[1])+'</span></div>'; });
    h+='</div>';
    h+='<button onclick="App.printReport()" style="border:none;cursor:pointer;width:100%;padding:16px;border-radius:18px;font-size:var(--f-callout);font-weight:700;color:#fff;background:linear-gradient(135deg,#6B4A3A,#A07A52);box-shadow:0 10px 22px rgba(107,74,58,0.3);margin-top:4px;display:flex;align-items:center;justify-content:center;gap:6px;">Rapor Oluştur / PDF '+icon('file-text',16)+'</button>';
    h+='</div>';
    return h;
  }

  var REPORT_MEMBERS=['lastNDays','habitRate','moodDist','monthlySummary','trendBars','nextMilestone','moodScoreOf','avgOf','weekSelfCard','corrInsights','consistencyMomentumCard','badgesGrid','weeklyStepRecap','distanceRecapCard','moodHeatmapCard','raporHTML'];
  window.SeymaReport={registerReport:registerReport,REPORT_DEPENDENCIES:REPORT_DEPENDENCIES,REPORT_MEMBERS:REPORT_MEMBERS,
    lastNDays:lastNDays,habitRate:habitRate,moodDist:moodDist,monthlySummary:monthlySummary,trendBars:trendBars,nextMilestone:nextMilestone,moodScoreOf:moodScoreOf,avgOf:avgOf,weekSelfCard:weekSelfCard,corrInsights:corrInsights,consistencyMomentumCard:consistencyMomentumCard,badgesGrid:badgesGrid,weeklyStepRecap:weeklyStepRecap,distanceRecapCard:distanceRecapCard,moodHeatmapCard:moodHeatmapCard,raporHTML:raporHTML};
}());
