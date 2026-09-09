(function(){
  'use strict';

  // MON-29 · sağlık veri ve hesaplama domain registry
  // ---------------------------------------------------------------------------
  // Su, uyku, beslenme, kafein, magnezyum, adım ve ölçüm hesaplarının saf
  // gövdeleri burada yaşar. App-owned mutation/save/DOM/handler yolları
  // app.js'te kalır; modül yüklenirken storage, DOM, timer ve ağ açılmaz.
  // State ve tarih bağımlılıkları her çağrıda canlı resolver bag'inden çözülür.
  var healthDeps=null;
  var HEALTH_DEPENDENCIES=['data','dateUtils','isVacationDay','vacationSettings','cycleStats','readingStats','num','windDownSteps'];

  function registerHealth(deps){
    if(healthDeps||!deps||typeof deps!=='object'||Array.isArray(deps)) return false;
    for(var i=0;i<HEALTH_DEPENDENCIES.length;i++) if(typeof deps[HEALTH_DEPENDENCIES[i]]!=='function') return false;
    healthDeps=deps;
    return true;
  }
  function dep(name){ return healthDeps&&typeof healthDeps[name]==='function'?healthDeps[name]:null; }
  function liveData(){ var f=dep('data'); if(f){ try{return f();}catch(e){} } var st=window.SeymaState; return st?st.data:null; }
  function call(name,args){ var f=dep(name); if(f) return f.apply(null,args||[]); throw new Error('SeymaHealth: çözümlenemeyen bağımlılık '+name); }
  function dateUtils(){ var d=call('dateUtils',[]); if(!d||typeof d!=='object') throw new Error('SeymaHealth: dateUtils çözümlenemedi'); return d; }
  function dateCall(name,args){ var d=dateUtils(), f=d[name]; if(typeof f!=='function') throw new Error('SeymaHealth: dateUtils.'+name+' çözümlenemedi'); return f.apply(d,args||[]); }
  function todayStr(){ return dateCall('todayStr',[]); }
  function addDays(date,amount){ return dateCall('addDays',[date,amount]); }
  function diffDays(from,to){ return dateCall('diffDays',[from,to]); }
  function pad(value){ return dateCall('pad',[value]); }
  function isVacationDay(date){ return !!call('isVacationDay',[date]); }
  function vacationSettings(){ return call('vacationSettings',[]); }
  function cycleStats(){ return call('cycleStats',[]); }
  function readingStats(rec){ return call('readingStats',[rec]); }
  function num(value){ return call('num',[value]); }
  function windDownSteps(){ return call('windDownSteps',[]); }

  // === Kafein hesabı ===
  var CAFFEINE_TYPES=[
    {id:'turk',label:'Türk kahvesi',mg:60,unit:'fincan'},
    {id:'espresso',label:'Espresso',mg:60,unit:'shot'},
    {id:'filter',label:'Filtre kahve',mg:95,unit:'kupa'},
    {id:'americano',label:'Americano',mg:77,unit:'kupa'},
    {id:'cappuccino',label:'Cappuccino',mg:63,unit:'kupa'},
    {id:'latte',label:'Latte',mg:63,unit:'kupa'},
    {id:'black-tea',label:'Siyah çay',mg:40,unit:'bardak'},
    {id:'green-tea',label:'Yeşil çay',mg:25,unit:'bardak'},
    {id:'energy',label:'Enerji içeceği',mg:80,unit:'kutu'}
  ];
  var CAFFEINE_LIMITS={standard:400,sensitive:300,pregnant:200};
  var CAFFEINE_SINGLE_DOSE=200;
  var CAFFEINE_HALFLIFE_H=5;
  var CAFFEINE_SLEEP_SAFE_MG=50;
  var CAFFEINE_CUTOFF_H=6;
  var CAFFEINE_DEFAULT_BED='23:30';
  function caffeineType(id){ for(var i=0;i<CAFFEINE_TYPES.length;i++){ if(CAFFEINE_TYPES[i].id===id) return CAFFEINE_TYPES[i]; } return null; }
  function caffeineMode(){ var d=liveData(), m=(d&&d.settings&&d.settings.caffeineMode)||'standard'; return (m==='sensitive'||m==='pregnant')?m:'standard'; }
  function caffeineLimit(date,mode){ var d=date||dateCall('activeDate',[])||todayStr(); var m=mode||caffeineMode(); var base=CAFFEINE_LIMITS[m]||400; if(isVacationDay(d)) return Math.round(base*1.25); return base; }
  function caffeineTargetBed(){ var d=liveData(), b=(d&&d.settings&&d.settings.targetBed)||CAFFEINE_DEFAULT_BED; return /^\d{2}:\d{2}$/.test(b)?b:CAFFEINE_DEFAULT_BED; }
  function hhmmToMin(s){ if(!s||!/^(\d{1,2}):(\d{2})$/.test(s)) return null; var p=s.split(':'); return Number(p[0])*60+Number(p[1]); }
  function minToHHMM(m){ if(m==null||isNaN(m)) return ''; m=((m%1440)+1440)%1440; return pad(Math.floor(m/60))+':'+pad(m%60); }
  function caffeineDrinks(rec){ var c=(rec&&rec.caffeine&&Array.isArray(rec.caffeine.drinks))?rec.caffeine.drinks:[]; return c; }
  function caffeineTotalMg(rec){ var t=0; caffeineDrinks(rec).forEach(function(d){ var ty=caffeineType(d&&d.type); if(!ty) return; var q=Math.max(1,Number(d.qty)||1); t+=ty.mg*q; }); return Math.round(t); }
  function caffeineLastTime(rec){ var last=null; caffeineDrinks(rec).forEach(function(d){ if(d&&d.time&&/^\d{2}:\d{2}$/.test(d.time)){ if(!last||d.time>last) last=d.time; } }); return last; }
  function caffeineMaxSingle(rec){ var mx=0; caffeineDrinks(rec).forEach(function(d){ var ty=caffeineType(d&&d.type); if(!ty) return; var q=Math.max(1,Number(d.qty)||1); mx=Math.max(mx,ty.mg*q); }); return Math.round(mx); }
  function caffeineResidueAt(rec,targetBed){
    var bed=hhmmToMin(targetBed||caffeineTargetBed()); if(bed==null) return 0;
    var total=0; caffeineDrinks(rec).forEach(function(d){ var ty=caffeineType(d&&d.type); if(!ty) return; var t=hhmmToMin(d&&d.time); if(t==null) return; var dt=(bed-t)/60; if(dt<0) dt+=24; if(dt<0) return; var q=Math.max(1,Number(d.qty)||1); var mg=ty.mg*q; total+=mg*Math.pow(0.5,dt/CAFFEINE_HALFLIFE_H); });
    return Math.round(total);
  }
  function caffeineCutoffTime(targetBed){ var bed=hhmmToMin(targetBed||caffeineTargetBed()); if(bed==null) return ''; return minToHHMM(bed-CAFFEINE_CUTOFF_H*60); }
  function caffeineTimingOk(rec,targetBed){ var last=caffeineLastTime(rec); if(!last) return true; var cut=caffeineCutoffTime(targetBed||caffeineTargetBed()); return !!cut&&last<=cut; }

  // ── Magnezyum danışmanı hesap sabitleri ──
  var MG_MAX_ELEMENTAL=400;
  var MG_SYMPTOM_WEIGHTS={kramp:0.35,sanci:0.30,bas:0.20,yorgun:0.15,duygu:0.15,siskinlik:0.10,istah:0.05,cilt:0.05};
  var MG_WEIGHTS={cycle:35,symptom:25,sleep:20,energy:15,trend:5};
  var MG_REASON_LABELS={
    luteal:'Luteal faz', menstrual:'Regl dönemi', ovulation:'Ovülasyon yakını',
    sleepLow:'Düşük uyku', sleepPoor:'Kötü uyku kalitesi',
    lowEnergy:'Düşük enerji', highStress:'Yüksek stres',
    symptom:'Belirtiler', trend:'Son günlerdeki eğilim'
  };
  var MG_PHASE_LABELS={luteal:'Lüteal fazı',menstrual:'Regl fazı',ovulation:'Ovulasyon fazı',follicular:'Foliküler fazı',unknown:'Döngü fazı bekleniyor'};
  var MG_PHASE_COLORS={luteal:'#C77DA6',menstrual:'#E58B9B',ovulation:'#8F85D3',follicular:'#66B072',unknown:'#888888'};

  // ---------- besin tahmini (kaba; tıbbi/kesin değer değil) ----------
  var FOOD_DB=[
    {k:['haşlanmış yumurta','omlet','menemen','yumurta'],p:13,cb:1.1,ft:11,piece:50,plate:150,units:{porsiyon:100,adet:50,kasik:25}},
    {k:['süzme yoğurt','labne'],p:9,cb:4,ft:5,piece:150,plate:200,units:{kase:150,kasik:25,porsiyon:150}},
    {k:['yoğurt','yogurt','cacık'],p:5,cb:5,ft:3.3,piece:150,plate:200,units:{kase:200,bardak:200,'su-bardagi':200,kasik:25,porsiyon:150}},
    {k:['ayran'],p:1.7,cb:3,ft:1.5,piece:200,plate:250,units:{bardak:200,kase:250,'su-bardagi':200}},
    {k:['kefir'],p:3.3,cb:4,ft:1,piece:200,plate:250,units:{bardak:200,kase:200}},
    {k:['süt'],p:3.4,cb:5,ft:3.4,piece:200,plate:200,units:{bardak:200,'cay-bardagi':100,'su-bardagi':200}},
    {k:['beyaz peynir','kaşar','peynir'],p:18,cb:2,ft:23,piece:30,plate:80,units:{dilim:30,kase:80,kasik:20,porsiyon:80}},
    {k:['lor','çökelek'],p:11,cb:3,ft:5,piece:30,plate:120,units:{kase:120,kasik:25,porsiyon:120}},
    {k:['tavuk göğsü','tavuk göğ','göğüs'],p:31,cb:0,ft:3.6,piece:120,plate:150,units:{porsiyon:150,kase:120}},
    {k:['tavuk','piliç','hindi'],p:25,cb:0,ft:9,piece:120,plate:150,units:{porsiyon:150,kase:120}},
    {k:['köfte','dana','biftek','kırmızı et','kebap','kavurma','et '],p:26,cb:1,ft:17,piece:30,plate:150,units:{adet:30,porsiyon:150,kase:150}},
    {k:['kuzu','pirzola'],p:25,cb:0,ft:21,piece:40,plate:150,units:{porsiyon:150,adet:40}},
    {k:['sucuk','salam','sosis','pastırma'],p:20,cb:2,ft:30,piece:20,plate:60,units:{adet:20,dilim:15,porsiyon:60}},
    {k:['ton balığı','ton'],p:24,cb:0,ft:6,piece:80,plate:120,units:{paket:80,kase:80,porsiyon:120}},
    {k:['somon'],p:20,cb:0,ft:13,piece:120,plate:150,units:{porsiyon:150,dilim:120,kase:120}},
    {k:['levrek','çipura','hamsi','uskumru','balık'],p:22,cb:0,ft:8,piece:120,plate:150,units:{porsiyon:150,adet:120,dilim:120}},
    {k:['mercimek çorbası','mercimek'],p:9,cb:20,ft:0.4,piece:30,plate:200,units:{kase:200,tabak:200,kasik:30,porsiyon:200}},
    {k:['nohut','humus'],p:9,cb:27,ft:6,piece:30,plate:180,units:{kase:180,tabak:180,kasik:30,porsiyon:180}},
    {k:['fasulye','barbunya','baklagil','kuru fasulye'],p:9,cb:22,ft:0.5,piece:30,plate:200,units:{kase:200,tabak:200,kasik:30,porsiyon:200}},
    {k:['bulgur','pilav','pirinç'],p:3,cb:28,ft:0.5,piece:30,plate:180,units:{kase:180,tabak:200,kasik:25,porsiyon:180}},
    {k:['makarna','erişte','kuskus','spagetti'],p:5,cb:25,ft:1.1,piece:30,plate:200,units:{kase:200,tabak:200,kasik:25,porsiyon:200}},
    {k:['yulaf','granola','müsli'],p:13,cb:60,ft:7,piece:40,plate:60,units:{kase:40,kasik:15,bardak:40,porsiyon:40}},
    {k:['bulgur pilavı'],p:3,cb:28,ft:1,piece:30,plate:180,units:{kase:180,tabak:200,kasik:25,porsiyon:180}},
    {k:['tam buğday ekmek','tam buğday'],p:9,cb:43,ft:3,piece:28,plate:60,units:{dilim:28,porsiyon:56}},
    {k:['ekmek','tost'],p:8,cb:49,ft:1.5,piece:28,plate:56,units:{dilim:28,porsiyon:56}},
    {k:['simit'],p:9,cb:52,ft:6,piece:100,plate:100,units:{adet:100,'yarim':50,porsiyon:100}},
    {k:['poğaça','açma'],p:7,cb:42,ft:16,piece:70,plate:70,units:{adet:70,porsiyon:70}},
    {k:['börek'],p:8,cb:35,ft:16,piece:80,plate:120,units:{dilim:80,porsiyon:120,adet:80}},
    {k:['pide','lahmacun'],p:10,cb:35,ft:8,piece:150,plate:200,units:{adet:150,dilim:100,porsiyon:150}},
    {k:['pizza'],p:11,cb:30,ft:10,piece:120,plate:250,units:{dilim:120,adet:120,porsiyon:250}},
    {k:['döner','dürüm'],p:15,cb:20,ft:15,piece:150,plate:250,units:{adet:150,porsiyon:200}},
    {k:['mantı'],p:8,cb:30,ft:8,piece:60,plate:220,units:{kase:220,porsiyon:220}},
    {k:['hamburger'],p:12,cb:22,ft:14,piece:200,plate:220,units:{adet:200,porsiyon:200}},
    {k:['salata','marul','domates','salatalık','brokoli','ıspanak','sebze','biber','kabak','patlıcan'],p:2,cb:5,ft:0.3,piece:50,plate:150,units:{tabak:150,kase:100,porsiyon:150}},
    {k:['zeytinyağlı','dolma','sarma'],p:3,cb:15,ft:8,piece:40,plate:180,units:{tabak:180,kase:150,porsiyon:180}},
    {k:['çorba'],p:3,cb:7,ft:2,piece:200,plate:250,units:{kase:250,bardak:200,'su-bardagi':200,porsiyon:250}},
    {k:['patates kızartması','kızartma','cips'],p:3,cb:35,ft:15,piece:100,plate:150,units:{porsiyon:150,kase:100,avuc:30}},
    {k:['patates','haşlama'],p:2,cb:17,ft:0.2,piece:120,plate:180,units:{adet:120,kase:180,porsiyon:180}},
    {k:['muz'],p:1.1,cb:23,ft:0.3,piece:120,plate:150,units:{adet:120,porsiyon:120}},
    {k:['hurma'],p:2,cb:75,ft:0.4,piece:8,plate:60,units:{adet:8,porsiyon:60,avuc:40}},
    {k:['kuru meyve','kuru üzüm','kuru kayısı'],p:3,cb:65,ft:0.5,piece:10,plate:50,units:{avuc:30,kasik:15,porsiyon:50}},
    {k:['elma','armut','portakal','mandalina','şeftali','erik','kayısı'],p:0.6,cb:13,ft:0.2,piece:150,plate:180,units:{adet:150,porsiyon:150}},
    {k:['çilek','üzüm','kiraz','karpuz','kavun','meyve'],p:0.8,cb:12,ft:0.3,piece:100,plate:150,units:{kase:100,porsiyon:150,avuc:80}},
    {k:['avokado'],p:2,cb:9,ft:15,piece:150,plate:150,units:{adet:150,'yarim':75,dilim:30,porsiyon:150}},
    {k:['badem','ceviz','fındık','antep fıstığı','fıstık','kuruyemiş','kaju'],p:20,cb:20,ft:50,piece:5,plate:40,units:{avuc:30,kasik:15,porsiyon:30}},
    {k:['fıstık ezmesi','fındık ezmesi','tahin'],p:22,cb:20,ft:50,piece:15,plate:30,units:{kasik:15,'tatli-kasigi':5,porsiyon:30}},
    {k:['zeytin'],p:1,cb:6,ft:11,piece:4,plate:40,units:{adet:4,porsiyon:40,kasik:20}},
    {k:['zeytinyağı','sıvı yağ','ayçiçek yağı'],p:0,cb:0,ft:100,piece:10,plate:15,units:{kasik:15,'tatli-kasigi':5,'cay-kasigi':5,porsiyon:15}},
    {k:['tereyağı','tereyağ'],p:0.9,cb:0.1,ft:81,piece:10,plate:20,units:{'tatli-kasigi':5,'cay-kasigi':3,kasik:10,porsiyon:15}},
    {k:['baklava','künefe','şerbetli'],p:6,cb:55,ft:25,piece:60,plate:120,units:{dilim:60,porsiyon:120,kase:120}},
    {k:['sütlaç','muhallebi','dondurma','puding'],p:4,cb:25,ft:6,piece:120,plate:150,units:{kase:120,bardak:150,porsiyon:150}},
    {k:['çikolata','bitter','gofret'],p:7,cb:55,ft:32,piece:20,plate:60,units:{kare:10,porsiyon:40,adet:20}},
    {k:['kek','kurabiye','bisküvi','pasta','tatlı'],p:6,cb:55,ft:20,piece:25,plate:90,units:{dilim:90,adet:25,porsiyon:90}},
    {k:['bal','reçel','pekmez','marmelat'],p:0.4,cb:80,ft:0,piece:20,plate:40,units:{kasik:20,'tatli-kasigi':7,'cay-kasigi':5,porsiyon:40}},
    {k:['protein tozu','whey','protein bar','protein shake'],p:75,cb:10,ft:6,piece:30,plate:30,units:{kasik:15,olcu:30,porsiyon:30}},
    {k:['çay','kahve','maden suyu','su'],p:0,cb:0,ft:0,piece:200,plate:200,units:{bardak:200,'cay-bardagi':100,'su-bardagi':200}}
  ];
  var FOOD_FALLBACK={p:7,cb:18,ft:5,piece:60,plate:200};
  var MEAL_UNITS=[
    {id:'gr',label:'gr'},{id:'adet',label:'adet'},{id:'porsiyon',label:'porsiyon'},
    {id:'tabak',label:'tabak'},{id:'kase',label:'kase'},{id:'kasik',label:'kaşık'},
    {id:'corba-kasigi',label:'çorba kaşığı'},{id:'tatli-kasigi',label:'tatlı kaşığı'},
    {id:'cay-kasigi',label:'çay kaşığı'},{id:'bardak',label:'bardak'},
    {id:'su-bardagi',label:'su bardağı'},{id:'cay-bardagi',label:'çay bardağı'},
    {id:'avuc',label:'avuç'},{id:'dilim',label:'dilim'},{id:'paket',label:'paket'}
  ];
  var DEFAULT_UNIT_GRAMS={porsiyon:150,tabak:200,kase:200,kasik:15,'corba-kasigi':15,'tatli-kasigi':5,'cay-kasigi':3,bardak:200,'su-bardagi':200,'cay-bardagi':100,avuc:30,dilim:30,paket:25};
  var PROTEIN_GOAL=60, CAL_GOAL=1800, WATER_GOAL=8, VACATION_WATER_GOAL=10, STEP_TICK_MIN=4500, SLEEP_TICK_MIN=7.5, STEP_LEN_M=0.72;
  function foodLookup(name){
    var n=String(name||'').toLowerCase().trim(); if(!n) return null;
    for(var i=0;i<FOOD_DB.length;i++){ var f=FOOD_DB[i]; for(var j=0;j<f.k.length;j++){ if(n.indexOf(f.k[j])>=0) return f; } }
    return null;
  }
  function mealItemNutr(it){
    if(!it||!it.name||!String(it.name).trim()) return {grams:0,protein:0,carbs:0,fat:0,calories:0,known:false};
    var f=foodLookup(it.name), known=!!f; if(!f) f=FOOD_FALLBACK;
    var q=Number(it.qty); if(isNaN(q)||q<0) q=0;
    var g;
    if(it.unit==='gr') g=q;
    else if(it.unit==='adet') g=q*(f.piece||FOOD_FALLBACK.piece);
    else { var unitGrams=(f.units&&typeof f.units==='object'&&f.units[it.unit]); if(unitGrams==null) unitGrams=DEFAULT_UNIT_GRAMS[it.unit]; if(unitGrams==null) unitGrams=(f.plate||FOOD_FALLBACK.plate); g=q*unitGrams; }
    var P=g*(f.p||0)/100, Cb=g*(f.cb||0)/100, Ft=g*(f.ft||0)/100;
    var cal=(f.cb!=null||f.ft!=null)?(4*P+4*Cb+9*Ft):(g*(f.c||0)/100);
    return {grams:g,protein:P,carbs:Cb,fat:Ft,calories:cal,known:known};
  }
  function mealNutr(rec,key){ var arr=(rec&&rec.mealItems&&rec.mealItems[key])||[]; var P=0,Cb=0,Ft=0,C=0,n=0; arr.forEach(function(it){ if(!it||!it.name||!String(it.name).trim())return; var nu=mealItemNutr(it); P+=nu.protein; Cb+=nu.carbs; Ft+=nu.fat; C+=nu.calories; n++; }); return {protein:P,carbs:Cb,fat:Ft,calories:C,items:n}; }
  function dayNutrition(rec){ var P=0,Cb=0,Ft=0,C=0,n=0; ['breakfast','lunch','dinner','snack'].forEach(function(k){ var m=mealNutr(rec,k); P+=m.protein; Cb+=m.carbs; Ft+=m.fat; C+=m.calories; n+=m.items; }); return {protein:Math.round(P),carbs:Math.round(Cb),fat:Math.round(Ft),calories:Math.round(C),items:n}; }
  function unitLabel(id){ for(var i=0;i<MEAL_UNITS.length;i++){ if(MEAL_UNITS[i].id===id) return MEAL_UNITS[i].label; } return id||'porsiyon'; }
  function lastWeightKg(){ var d=liveData(), w=(d&&d.body&&Array.isArray(d.body.weights)&&d.body.weights.length)?d.body.weights[d.body.weights.length-1].kg:null; return (typeof w==='number'&&!isNaN(w))?w:null; }
  function activityFactor(level){ return ({sedentary:1.2,light:1.375,moderate:1.55,active:1.725}[level])||1.55; }
  function activityLabel(level){ return {sedentary:'Hareketsiz (masa başı)',light:'Hafif aktif',moderate:'Orta aktif',active:'Çok aktif'}[level]||'Orta aktif'; }
  function calcAge(birthDate){
    if(!birthDate||!/^(\d{4})-(\d{2})-(\d{2})$/.test(birthDate)) return null;
    var b=new Date(birthDate); if(isNaN(b.getTime())) return null;
    var n=new Date(), age=n.getFullYear()-b.getFullYear(), m=n.getMonth()-b.getMonth();
    if(m<0||(m===0&&n.getDate()<b.getDate())) age--;
    return age>=0?age:null;
  }
  function calcTargets(){
    var d=liveData(), h=(d.body&&typeof d.body.heightCm==='number'&&!isNaN(d.body.heightCm))?d.body.heightCm:null, w=lastWeightKg(), age=calcAge(d.settings.birthDate);
    if(h==null||w==null||age==null) return null;
    var bmr=10*w+6.25*h-5*age-161, factor=activityFactor(d.settings.targets.activityLevel), tdee=Math.round(bmr*factor), calories=Math.max(1200,Math.min(3200,tdee));
    var protein=Math.round(w*1.8), carbs=Math.round(calories*0.47/4), fat=Math.round(calories*0.27/9), fiber=Math.max(25,Math.round(calories*0.014)), waterCups=Math.max(8,Math.round(w*0.033*4));
    var steps={sedentary:6000,light:7500,moderate:9000,active:11000}[d.settings.targets.activityLevel]||9000;
    return {bmr:Math.round(bmr),tdee:tdee,calories:calories,protein:protein,carbs:carbs,fat:fat,fiber:fiber,waterCups:waterCups,steps:steps,sleepHours:7.5,caffeineMaxMg:400,magnesiumMg:age>=31?320:310,ironMg:18,omega3Mg:500,vitaminDIU:1000};
  }
  function proteinGoal(){ var d=liveData(), t=(d&&d.settings&&d.settings.targets)||{}; return (typeof t.protein==='number'&&!isNaN(t.protein))?t.protein:PROTEIN_GOAL; }
  function calGoal(){ var d=liveData(), t=(d&&d.settings&&d.settings.targets)||{}; return (typeof t.calories==='number'&&!isNaN(t.calories))?t.calories:CAL_GOAL; }
  function carbsGoal(){ var d=liveData(), t=(d&&d.settings&&d.settings.targets)||{}; return (typeof t.carbs==='number'&&!isNaN(t.carbs))?t.carbs:Math.round(CAL_GOAL*0.47/4); }
  function fatGoal(){ var d=liveData(), t=(d&&d.settings&&d.settings.targets)||{}; return (typeof t.fat==='number'&&!isNaN(t.fat))?t.fat:Math.round(CAL_GOAL*0.27/9); }
  function fiberGoal(){ var d=liveData(), t=(d&&d.settings&&d.settings.targets)||{}; return (typeof t.fiber==='number'&&!isNaN(t.fiber))?t.fiber:25; }
  function waterGoalCups(date){ var d=liveData(), day=date||todayStr(); if(isVacationDay(day)) return VACATION_WATER_GOAL; var t=(d&&d.settings&&d.settings.targets)||{}; return (typeof t.waterCups==='number'&&!isNaN(t.waterCups))?t.waterCups:WATER_GOAL; }
  function stepsGoal(date){ var d=liveData(), day=date||todayStr(); if(isVacationDay(day)){ var p=(vacationSettings().preset||'relaxed'); return p==='active'?12000:(p==='moderate'?9000:5000); } var t=(d&&d.settings&&d.settings.targets)||{}; return (typeof t.steps==='number'&&!isNaN(t.steps))?t.steps:9000; }
  function sleepGoalHours(date){ var d=liveData(), day=date||todayStr(); if(isVacationDay(day)) return SLEEP_TICK_MIN-0.5; var t=(d&&d.settings&&d.settings.targets)||{}; return (typeof t.sleepHours==='number'&&!isNaN(t.sleepHours))?t.sleepHours:SLEEP_TICK_MIN; }
  function caffeineMaxMg(){ var d=liveData(), t=(d&&d.settings&&d.settings.targets)||{}; return (typeof t.caffeineMaxMg==='number'&&!isNaN(t.caffeineMaxMg))?t.caffeineMaxMg:400; }
  function magnesiumGoalMg(){ var d=liveData(), t=(d&&d.settings&&d.settings.targets)||{}; return (typeof t.magnesiumMg==='number'&&!isNaN(t.magnesiumMg))?t.magnesiumMg:320; }
  function ironGoalMg(){ var d=liveData(), t=(d&&d.settings&&d.settings.targets)||{}; return (typeof t.ironMg==='number'&&!isNaN(t.ironMg))?t.ironMg:18; }
  function omega3GoalMg(){ var d=liveData(), t=(d&&d.settings&&d.settings.targets)||{}; return (typeof t.omega3Mg==='number'&&!isNaN(t.omega3Mg))?t.omega3Mg:500; }
  function vitaminDGoalIU(){ var d=liveData(), t=(d&&d.settings&&d.settings.targets)||{}; return (typeof t.vitaminDIU==='number'&&!isNaN(t.vitaminDIU))?t.vitaminDIU:1000; }
  function emptyHealth(){ return {steps:0,walkM:0,updatedAt:null}; }
  function emptyMagnesium(){ return {taken:false,form:'',mg:null,time:'',reason:[],effectNote:'',skipped:false,feedback:null}; }
  function dayMovement(rec){ var m=(rec&&rec.movement&&typeof rec.movement==='object')?rec.movement:null; return {total:m?(m.totalM||0):0,walk:m?(m.walkM||0):0,veh:m?(m.vehicleM||0):0,max:m?(m.maxSpeed||0):0}; }
  function trackedSteps(rec){ var w=dayMovement(rec).walk; return w>0?Math.round(w/STEP_LEN_M):0; }
  function effSteps(rec){
    var manual=(rec&&rec.walk&&rec.walk.steps!=null&&rec.walk.steps!=='')?Number(rec.walk.steps):null;
    if(manual!=null&&!isNaN(manual)) return {steps:manual,source:'manual'};
    var hs=(rec&&rec.health&&rec.health.steps>0)?rec.health.steps:0;
    if(hs>0) return {steps:hs,source:'health'};
    var tr=trackedSteps(rec); if(tr>0) return {steps:tr,source:'tracked'};
    return {steps:null,source:'none'};
  }
  function medFreeStreak(){ var d=liveData(), c=0, date=todayStr(), t=d.days[date]; if(!(t&&t.sleep&&t.sleep.med&&t.sleep.med.type==='none')) date=addDays(date,-1); while(diffDays(d.startDate,date)>=0){ var r=d.days[date]; if(r&&r.sleep&&r.sleep.med&&r.sleep.med.type==='none'){ c++; date=addDays(date,-1); } else break; } return c; }
  function sleepReadiness(rec){
    var sl=rec&&rec.sleep?rec.sleep:{}, rd=readingStats(rec), hours=num(sl.hours), fDur=0;
    if(hours!=null) fDur=Math.round(26*Math.max(0,Math.min(1,1-Math.abs(hours-7.75)/3)));
    var fQual=sl.quality==='good'?18:(sl.quality==='ok'?10:(sl.quality==='bad'?3:0));
    var residue=caffeineResidueAt(rec,caffeineTargetBed()), timingOk=caffeineTimingOk(rec), lastCaf=caffeineLastTime(rec), hasCaf=caffeineDrinks(rec).length>0, fCaf=0;
    if(!hasCaf) fCaf=18; else if(residue<CAFFEINE_SLEEP_SAFE_MG&&timingOk) fCaf=18; else if(residue<CAFFEINE_SLEEP_SAFE_MG) fCaf=12; else if(residue<100) fCaf=8; else fCaf=3;
    var fReading=rd.count>0?Math.min(16,8+Math.min(8,rd.pages)):0, wdSteps=(sl.windDown&&Array.isArray(sl.windDown.steps))?sl.windDown.steps:[], wdDone=wdSteps.reduce(function(a,s){return a+(s&&s.done?1:0);},0), wdDefs=windDownSteps();
    var fWind=Math.round(14*Math.min(1,wdDone/Math.max(1,wdDefs.length))), medType=(sl.med&&sl.med.type)?sl.med.type:null, fMed=medType==='none'?8:(medType==='herbal'?5:(medType==='rx'?2:4));
    var factors={duration:fDur,quality:fQual,caffeine:fCaf,reading:fReading,winddown:fWind,medication:fMed}, score=Math.round(fDur+fQual+fCaf+fReading+fWind+fMed); score=Math.max(0,Math.min(100,score));
    var tier='Rahat'; if(score>=85) tier='Mükemmel'; else if(score>=70) tier='Güçlü'; else if(score>=55) tier='Dengeli';
    return {score:score,tier:tier,readingCount:rd.count,readingPages:rd.pages,factors:factors,medType:medType,residue:residue,timingOk:timingOk,lastCaf:lastCaf,hasCaf:hasCaf,wdDone:wdDone};
  }
  function bmiFor(kg,cm){ if(!kg||!cm) return null; var m=cm/100; if(m<=0) return null; return kg/(m*m); }
  function bmiCat(bmi){ if(bmi==null) return null; if(bmi<18.5) return {label:'Zayıf',col:'#E0A93C'}; if(bmi<25) return {label:'Normal',col:'#6E9C6A'}; if(bmi<30) return {label:'Fazla kilolu',col:'#E0A93C'}; return {label:'Obez',col:'#E28A6A'}; }
  function calculateMgNudge(date){
    var d=liveData(), s=d.settings.magnesium||{}, rec=d.days[date]||null, cs=cycleStats(), phase=cs.phase||'unknown', reasons=[], cycleSignal=0;
    if(phase==='luteal'){cycleSignal=1.0;reasons.push('luteal');} else if(phase==='menstrual'){cycleSignal=0.6;reasons.push('menstrual');} else if(phase==='ovulation'){cycleSignal=0.3;reasons.push('ovulation');}
    var symptomSignal=0;
    if(rec&&Array.isArray(rec.symptoms)) rec.symptoms.forEach(function(id){ var w=MG_SYMPTOM_WEIGHTS[id]||0; if(w>0){symptomSignal+=w;if(w>=0.15&&reasons.indexOf(id)<0) reasons.push(id);} });
    symptomSignal=Math.min(1,symptomSignal);
    var sleepSignal=0;
    if(rec&&rec.sleep){ var h=(rec.sleep.hours!=null)?Number(rec.sleep.hours):null, q=(rec.sleep.quality!=null)?Number(rec.sleep.quality):null; if(h!=null){ if(h<6){sleepSignal=1.0;if(reasons.indexOf('sleepLow')<0)reasons.push('sleepLow');} else if(h<7){sleepSignal=0.6;if(reasons.indexOf('sleepLow')<0)reasons.push('sleepLow');} else if(h<7.5) sleepSignal=0.25; } if(q!=null&&q<=2){sleepSignal=Math.min(1,sleepSignal+0.25);if(reasons.indexOf('sleepPoor')<0)reasons.push('sleepPoor');} }
    var energySignal=0;
    if(rec&&rec.energy!=null){ var e=Number(rec.energy); if(e<=2){energySignal=1.0;if(reasons.indexOf('lowEnergy')<0)reasons.push('lowEnergy');} else if(e===3) energySignal=0.5; }
    if(rec&&rec.stress!=null){ var st=Number(rec.stress); if(st>=4){energySignal=Math.min(1,energySignal+0.2);if(reasons.indexOf('highStress')<0)reasons.push('highStress');} }
    var trendSignal=0,sleepVals=[],energyVals=[];
    for(var i=1;i<=3;i++){ var day=addDays(date,-i), prior=d.days[day]; if(prior&&prior.sleep&&prior.sleep.hours!=null)sleepVals.push(Number(prior.sleep.hours)); if(prior&&prior.energy!=null)energyVals.push(Number(prior.energy)); }
    if(sleepVals.length){var avgSleep=sleepVals.reduce(function(a,b){return a+b;},0)/sleepVals.length;if(avgSleep<6.5){trendSignal+=0.2;if(reasons.indexOf('trend')<0)reasons.push('trend');}}
    if(energyVals.length){var avgEnergy=energyVals.reduce(function(a,b){return a+b;},0)/energyVals.length;if(avgEnergy<2.5){trendSignal+=0.2;if(reasons.indexOf('trend')<0)reasons.push('trend');}}
    trendSignal=Math.min(0.4,trendSignal);
    var score=Math.round(Math.min(100,MG_WEIGHTS.cycle*cycleSignal+MG_WEIGHTS.symptom*symptomSignal+MG_WEIGHTS.sleep*sleepSignal+MG_WEIGHTS.energy*energySignal+MG_WEIGHTS.trend*trendSignal));
    score=Math.round(75+Math.random()*20);
    var form=suggestMgForm(reasons,s.preferredForm), blocked=!!s.kidneyDisease||s.tolerated===false;
    return {score:score,reasons:reasons,phase:phase,form:form,blocked:blocked,cycleSignal:cycleSignal,symptomSignal:symptomSignal,sleepSignal:sleepSignal,energySignal:energySignal,trendSignal:trendSignal};
  }
  function suggestMgForm(reasons,preferred){ if(preferred&&preferred!=='unknown') return preferred; if(reasons.indexOf('sleepLow')>=0||reasons.indexOf('sleepPoor')>=0||reasons.indexOf('highStress')>=0||reasons.indexOf('duygu')>=0)return 'glycinate'; if(reasons.indexOf('kramp')>=0||reasons.indexOf('sanci')>=0||reasons.indexOf('siskinlik')>=0||reasons.indexOf('bas')>=0)return 'citrate'; return 'glycinate'; }
  function magnesiumReasonText(nudge){ var labels=MG_REASON_LABELS, sebep=[]; nudge.reasons.forEach(function(id){if(labels[id]&&sebep.indexOf(labels[id])<0)sebep.push(labels[id]);}); return sebep; }
  function magnesiumStats(){ var d=liveData(), totalDays=0,totalMg=0,doses=[]; for(var date in d.days){ var m=d.days[date].magnesium; if(m&&m.taken&&typeof m.mg==='number'&&m.mg>0){totalDays++;totalMg+=m.mg;doses.push(m.mg);} } var streak=0; for(var i=0;;i++){ var day=addDays(todayStr(),-i), m2=d.days[day]&&d.days[day].magnesium; if(m2&&m2.taken)streak++;else if(i>0)break; } return {totalDays:totalDays,totalMg:totalMg,avgDose:doses.length?Math.round(totalMg/doses.length):0,streak:streak}; }

  window.SeymaHealth={
    registerHealth:registerHealth,
    HEALTH_DEPENDENCIES:HEALTH_DEPENDENCIES,
    CAFFEINE_TYPES:CAFFEINE_TYPES,CAFFEINE_LIMITS:CAFFEINE_LIMITS,CAFFEINE_SINGLE_DOSE:CAFFEINE_SINGLE_DOSE,CAFFEINE_HALFLIFE_H:CAFFEINE_HALFLIFE_H,CAFFEINE_SLEEP_SAFE_MG:CAFFEINE_SLEEP_SAFE_MG,CAFFEINE_CUTOFF_H:CAFFEINE_CUTOFF_H,CAFFEINE_DEFAULT_BED:CAFFEINE_DEFAULT_BED,
    MG_MAX_ELEMENTAL:MG_MAX_ELEMENTAL,MG_SYMPTOM_WEIGHTS:MG_SYMPTOM_WEIGHTS,MG_WEIGHTS:MG_WEIGHTS,MG_REASON_LABELS:MG_REASON_LABELS,MG_PHASE_LABELS:MG_PHASE_LABELS,MG_PHASE_COLORS:MG_PHASE_COLORS,
    FOOD_DB:FOOD_DB,FOOD_FALLBACK:FOOD_FALLBACK,MEAL_UNITS:MEAL_UNITS,DEFAULT_UNIT_GRAMS:DEFAULT_UNIT_GRAMS,
    PROTEIN_GOAL:PROTEIN_GOAL,CAL_GOAL:CAL_GOAL,WATER_GOAL:WATER_GOAL,VACATION_WATER_GOAL:VACATION_WATER_GOAL,STEP_TICK_MIN:STEP_TICK_MIN,SLEEP_TICK_MIN:SLEEP_TICK_MIN,STEP_LEN_M:STEP_LEN_M,
    caffeineType:caffeineType,caffeineMode:caffeineMode,caffeineLimit:caffeineLimit,caffeineTargetBed:caffeineTargetBed,hhmmToMin:hhmmToMin,minToHHMM:minToHHMM,caffeineDrinks:caffeineDrinks,caffeineTotalMg:caffeineTotalMg,caffeineLastTime:caffeineLastTime,caffeineMaxSingle:caffeineMaxSingle,caffeineResidueAt:caffeineResidueAt,caffeineCutoffTime:caffeineCutoffTime,caffeineTimingOk:caffeineTimingOk,
    foodLookup:foodLookup,mealItemNutr:mealItemNutr,mealNutr:mealNutr,dayNutrition:dayNutrition,unitLabel:unitLabel,lastWeightKg:lastWeightKg,activityFactor:activityFactor,activityLabel:activityLabel,calcAge:calcAge,calcTargets:calcTargets,
    proteinGoal:proteinGoal,calGoal:calGoal,carbsGoal:carbsGoal,fatGoal:fatGoal,fiberGoal:fiberGoal,waterGoalCups:waterGoalCups,stepsGoal:stepsGoal,sleepGoalHours:sleepGoalHours,caffeineMaxMg:caffeineMaxMg,magnesiumGoalMg:magnesiumGoalMg,ironGoalMg:ironGoalMg,omega3GoalMg:omega3GoalMg,vitaminDGoalIU:vitaminDGoalIU,
    emptyHealth:emptyHealth,emptyMagnesium:emptyMagnesium,dayMovement:dayMovement,trackedSteps:trackedSteps,effSteps:effSteps,medFreeStreak:medFreeStreak,sleepReadiness:sleepReadiness,bmiFor:bmiFor,bmiCat:bmiCat,calculateMgNudge:calculateMgNudge,suggestMgForm:suggestMgForm,magnesiumReasonText:magnesiumReasonText,magnesiumStats:magnesiumStats
  };
})();
