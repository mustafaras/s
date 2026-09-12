// MON-50 · daily App handler registry.
// The App object, data rebinds, save/render ownership and all inline caller
// names remain in app.js. This module is load-safe: it only records the
// explicit dependency bag and exposes signature-preserving handler bodies.
(function(){
  'use strict';

  var appSurfaceDeps=null;
  var APP_SURFACE_DEPENDENCIES=[
    'data','ui','app','activeDate','todayStr','dayIndexFor','getDay',
    'derivedHabits','countRec','habits','find','haptic','commit','editing',
    'htToday','confetti','habitProgress','waterGoalCups','sleepGoalHours',
    'stepsGoal','effSteps','isVacationDay','derivedProgText','toast','maybeStreak',
    'updateCardByKey','render','emptyMagnesium','pulseTimer','setPulseTimer',
    'clearTimeout','setTimeout','document','save'
  ];

  function registerAppSurface(deps){
    if(appSurfaceDeps||!deps||typeof deps!=='object'||Array.isArray(deps)) return false;
    for(var i=0;i<APP_SURFACE_DEPENDENCIES.length;i++){
      if(typeof deps[APP_SURFACE_DEPENDENCIES[i]]!=='function') return false;
    }
    appSurfaceDeps=deps;
    return true;
  }

  function dep(name){ return appSurfaceDeps&&typeof appSurfaceDeps[name]==='function'?appSurfaceDeps[name]:null; }
  function call(name,args){ var fn=dep(name); if(!fn) throw new Error('SeymaAppSurface: çözümlenemeyen bağımlılık '+name); return fn.apply(null,args||[]); }
  function liveData(){ return call('data'); }
  function liveUi(){ return call('ui'); }
  function app(){ return call('app'); }
  function schedulePulse(key){
    var ui=liveUi();
    ui.pulse=key;
    call('clearTimeout',[call('pulseTimer')]);
    call('setPulseTimer',[call('setTimeout',[function(){ liveUi().pulse=null; call('render'); },240])]);
  }

  function toggleHabit(key){
    if(window.SeyHaptics&&typeof window.SeyHaptics.tap==='function') window.SeyHaptics.tap();
    var date=call('activeDate'), idx=call('dayIndexFor',[date]), day=call('getDay',[liveData(),date,idx]);
    var derived=call('derivedHabits');
    // Su / uyku / yürüyüş tikleri elle işaretlenmez — yalnızca veri eşiği tutunca yeşillenir.
    if(derived[key]){ app().explainDerivedHabit(key,day); return; }
    // Magnezyum tik'i hem habits.magnesium hem de magnesium.taken kaydını senkronize eder;
    // skor/model logu da güncellensin diye mevcut toggleMgHabit akışını kullan.
    if(key==='magnesium'){ app().toggleMgHabit(); return; }
    var before=call('countRec',[day]); day.habits[key]=!day.habits[key]; day.savedAt=new Date().toISOString(); var after=call('countRec',[day]); call('haptic',[14]);
    schedulePulse(key);
    var msg='Kaydedildi'; if(day.habits[key]){ var h=call('find',[call('habits'),'key',key]); if(h) msg=h.msg; }
    call('commit',[msg]);
    if(call('editing')) return;
    var ht=call('htToday'); if(after>=ht&&before<ht){ call('confetti'); if(window.SeyAudio&&typeof window.SeyAudio.success==='function') window.SeyAudio.success(); if(window.SeyFx&&typeof window.SeyFx.shimmer==='function'){ try{ var rw=call('document').getElementById('sey-habits-ring-wrap'); if(rw) window.SeyFx.shimmer(rw); }catch(e){} } call('setTimeout',[function(){ call('toast',['Bugün '+ht+'/'+ht+'. Şeyma hanım kontrolü ele aldı.',2600]); },250]); }
    else if(day.habits[key]){ if(window.SeyAudio&&typeof window.SeyAudio.success==='function') window.SeyAudio.success(); call('maybeStreak'); }
  }

  function toggleMgHabit(){
    var date=call('activeDate'), day=call('getDay',[liveData(),date,call('dayIndexFor',[date])]);
    var before=call('countRec',[day]), after;
    var mg=day.magnesium||call('emptyMagnesium');
    if(mg.taken){ app().skipMagnesium(); }
    else { app().takeMagnesium(null,200); }
    after=call('countRec',[day]);
    schedulePulse('magnesium');
    // confetti / tamam bildirimi, sadece bugünkü toplam eşiği aşıldıysa
    if(!call('editing')){ var ht=call('htToday'); if(after>=ht&&before<ht){ call('confetti'); if(window.SeyAudio&&typeof window.SeyAudio.success==='function') window.SeyAudio.success(); call('setTimeout',[function(){ call('toast',['Bugün '+ht+'/'+ht+'. Şeyma hanım kontrolü ele aldı.',2600]); },250]); } }
  }

  // Türetilmiş tik'e dokunulduğunda: eşik tutuyorsa sıcak onay, tutmuyorsa ne yapılacağını kibarca anlat.
  function explainDerivedHabit(key,day){
    var p=call('habitProgress',[day,key]); if(!p) return; call('haptic',[10]);
    if(p.met){
      var g=call('waterGoalCups');
      var ok={ water:'Su tamam — '+g+'/'+g+' bardak. Bu tik otomatik, ellemene gerek yok.',
               sleepReg:'Uyku tamam — 7,5+ saat. Bu tik kendiliğinden yeşil kalır.',
               walked20:'Yürüyüş tamam — 4.500+ adım. Bu tik kendiliğinden yeşil kalır.',
               journaled:'Not tamam — bugün yazdın. Bu tik kendiliğinden yeşil kalır.',
               sweetManaged:'Tatlı krizini yönettin — bu tik kendiliğinden yeşil kaldı. Helal sana.',
               foodManaged:'Yemek/açlık krizini yönettin — bu tik kendiliğinden yeşil kaldı. Kaptan sensin.',
               coffeeManaged:'Kahve/kafein krizini yönettin — bu tik kendiliğinden yeşil kaldı. Net karar.',
               mediaFed:'Zihnini besledin — okudun/izledin/dinledin/öğrendin ya da kurs/pratik yaptın. Bu tik otomatik yeşil.',
               caffeineOk:'Kafein tiki temiz — günlük limit aşılmadı ve son kahve vaktinde. Otomatik yeşil.' };
      call('toast',[ok[key]||'Bu tik otomatik — eşik tuttuğunda kendiliğinden yeşil kalır.']); return;
    }
    // Kriz tikleri: dokununca ilgili kriz odasını (modal) aç — en işlevlisi bu.
    if(key==='sweetManaged'){ app().openCrisis('sweet'); return; }
    if(key==='foodManaged'){ app().openCrisis('food'); return; }
    if(key==='coffeeManaged'){ app().openCrisis('coffee'); return; }
    var msg;
    if(key==='water'){ var w=p.cur; var g=p.goal||call('waterGoalCups'); msg = w<=0
        ? 'Su tiki otomatik: '+g+' bardağı tamamlayınca kendiliğinden yeşillenir. Aşağıdaki “Su” kartından eklemeye başla.'
        : 'Su tikine az kaldı — şu an '+w+'/'+g+' bardak. '+(g-w)+' bardak daha, kendiliğinden yeşillenecek.'; }
    else if(key==='sleepReg'){ var h=p.cur; var sg=(p.goal||call('sleepGoalHours')); msg = h==null
        ? 'Uyku tiki otomatik: Sağlık kartına '+String(sg).replace('.',',')+' saat ve üzeri uyku girince kendiliğinden yeşillenir.'+(call('isVacationDay',[call('activeDate')])?' (tatil modunda esnetildi)':'')
        : 'Uyku tiki '+String(sg).replace('.',',')+' saatte yeşillenir'+(call('isVacationDay',[call('activeDate')])?' (tatil modunda esnetildi)':'')+' — şu an '+String(h).replace('.',',')+' saat. Girişini güncelleyince otomatik dolar.'; }
    else if(key==='walked20'){ var s=p.cur; var stg=(p.goal||call('stepsGoal')); msg = s<=0
        ? 'Yürüyüş tiki otomatik: '+stg.toLocaleString('tr-TR')+' adım girince kendiliğinden yeşillenir. Sağlık kartından adımını ekleyebilirsin.'+(call('isVacationDay',[call('activeDate')])?' (tatil modunda esnetildi)':'')
        : 'Yürüyüş tikine '+(stg-s).toLocaleString('tr-TR')+' adım kaldı — şu an '+s.toLocaleString('tr-TR')+'/'+stg.toLocaleString('tr-TR')+'. Girince otomatik yeşillenecek.'+(call('isVacationDay',[call('activeDate')])?' (tatil modunda esnetildi)':''); }
    else if(key==='journaled'){ msg='Not tiki otomatik: “Günün yansıması” kartına bir cümle bile yazınca kendiliğinden yeşillenir.'; }
    else if(key==='mediaFed'){ msg='Zihin tiki otomatik: Okudum / izledim / dinledim / öğrendim / kurs-pratik kutucuklarından birini doldur → yeşillenir.'; }
    else if(key==='caffeineOk'){ if(!p.amountOk) msg='Kafein tiki otomatik: günlük limit ('+p.goal+' mg) aşıldı — içeceği azaltınca kendiliğinden düzelir.'; else if(!p.timingOk) msg='Kafein tiki otomatik: miktar tamam ama son kahve önerilen saatten geç. Sağlık kartından saatini erkene çekince yeşillenir.'; else msg='Kafein tiki otomatik: bugün temiz — kendiliğinden yeşil.'; }
    else { msg=call('derivedProgText',[key,p])||'Bu tik otomatik — ilgili veriyi girince kendiliğinden yeşillenir.'; }
    call('toast',[msg,2800]);
  }

  function setMood(id){
    if(window.SeyHaptics&&typeof window.SeyHaptics.tap==='function') window.SeyHaptics.tap();
    var date=call('activeDate'), day=call('getDay',[liveData(),date,call('dayIndexFor',[date])]); day.mood=(day.mood===id?null:id); day.savedAt=new Date().toISOString(); var labels={normal:'Normal',iyi:'İyi',mükemmel:'Mükemmel',yorgun:'Yorgun',üzgün:'Üzgün',sinirli:'Sinirli','çok-zorlandim':'Çok zorlandım',kaygili:'Kaygılı', 'huzursuz':'Huzursuz', 'sakin':'Sakin'}; call('haptic',[14]); call('save',[false,{message:'Ruh hali güncellendi',meta:{section:'mood',path:'data.days.*.mood',operation:'update',summary:'Ruh hali güncellendi',detail:'Ruh hali',value:labels[id]||id,field:'mood'}}]); call('updateCardByKey',['mood']); call('updateCardByKey',['mental']);
  }

  function saveToday(){
    if(window.SeyHaptics&&typeof window.SeyHaptics.tap==='function') window.SeyHaptics.tap();
    call('getDay',[liveData(),call('todayStr'),call('dayIndexFor',[call('todayStr')])]);
    app().saveNow();
  }

  window.SeymaAppSurface={
    APP_SURFACE_DEPENDENCIES:APP_SURFACE_DEPENDENCIES.slice(),
    registerAppSurface:registerAppSurface,
    toggleHabit:toggleHabit,
    toggleMgHabit:toggleMgHabit,
    explainDerivedHabit:explainDerivedHabit,
    setMood:setMood,
    saveToday:saveToday
  };
})();
