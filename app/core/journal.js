(function(){
  'use strict';

  // MON-28 · Günlük Işığı / terapi notu domain registry
  // ---------------------------------------------------------------------------
  // Günlük metni, kelime/karakter görünümü, faz/prompt/science yardımcıları ve
  // salt HTML üreticileri burada yaşar. App-owned journal state writes, DOM
  // güncellemeleri, timer/focus yolu ve save sırası app.js'te kalır. Modül
  // yüklenirken storage, DOM, timer ve ağ erişimi açılmaz; canlı state ve
  // content bağımlılıkları resolver bag'inden her çağrıda çözülür.
  var journalDeps=null;
  var JOURNAL_DEPENDENCIES=['data','ui','activeDate','dayIndexFor','todayStr','addDays','icon','esc','find','motivationProgram'];

  function registerJournal(deps){
    if(journalDeps||!deps||typeof deps!=='object'||Array.isArray(deps)) return false;
    for(var i=0;i<JOURNAL_DEPENDENCIES.length;i++) if(typeof deps[JOURNAL_DEPENDENCIES[i]]!=='function') return false;
    journalDeps=deps;
    return true;
  }
  function dep(name){ return journalDeps&&typeof journalDeps[name]==='function'?journalDeps[name]:null; }
  function liveData(){ var f=dep('data'); if(f){ try{return f();}catch(e){} } var st=window.SeymaState; return st?st.data:null; }
  function liveUi(){ var f=dep('ui'); if(f){ try{return f();}catch(e){} } return null; }
  function call(name,args){ var f=dep(name); if(f) return f.apply(null,args); throw new Error('SeymaJournal: çözümlenemeyen bağımlılık '+name); }
  function activeDate(){ return call('activeDate',[]); }
  function dayIndexFor(date){ return call('dayIndexFor',[date]); }
  function todayStr(){ return call('todayStr',[]); }
  function addDays(date,amount){ return call('addDays',[date,amount]); }
  function icon(name,size){ return call('icon',[name,size]); }
  function esc(value){ return call('esc',[value]); }
  function find(){ return call('find',arguments); }
  function motivationProgram(){
    var f=dep('motivationProgram');
    if(f){ try{return f();}catch(e){} }
    return window.MotivationProgramV2||null;
  }

  var JOURNAL_MODES=[
    {id:'free',icon:'feather',label:'Serbest Akış',hint:'Pennebaker'},
    {id:'affect',icon:'brain',label:'Duygu Adlandırma',hint:'Lieberman'},
    {id:'gratitude',icon:'heart-handshake',label:'3 Güzel Şey',hint:'Seligman'},
    {id:'win',icon:'trophy',label:'Günün Kazanımı',hint:'Amabile'},
    {id:'selfCompassion',icon:'hand-heart',label:'Öz-Şefkat Molası',hint:'Neff'},
    {id:'reappraisal',icon:'refresh-cw',label:'Yeniden Değerleme',hint:'Gross'},
    {id:'values',icon:'compass',label:'Değer Bağlantısı',hint:'ACT'},
    {id:'urgeSurf',icon:'waves',label:'Dürtü Dalga Geçişi',hint:'Marlatt'}
  ];
  var JOURNAL_PHASE_PROMPTS={
    F1:{
      title:'Fark Etme',
      goal:'Bugün fark ettiğin bir dürtüyü, duyguyu veya düşünceyi yazmak.',
      free:['Bugün fark ettiğin bir dürtü/düşünce/duygu neydi? Vücudunda nerede hissettin?','Zihnine gelen ilk üç şeyi hiç süzme yaz.'],
      affect:['Bugün içinde en baskın olan duyguyu üç kelimeyle adlandır.','Şu an hissettiğin duygu nedir? İsmini koymak onu biraz yatıştırır.'],
      gratitude:['Bugün fark ettiğin üç küçük güzellik neydi?','Bugün sana nefes aldıran üç şey.'],
      win:['Bugün kendini fark etmenin/izlemenin kendisi bile bir kazanım. Ne gözlemledin?','Bugün farkındalıkla yaptığın en küçük şey.'],
      selfCompassion:['Bugün zorlandığın bir anda kendine nasıl davrandın? Daha nazik nasıl davranabilirdin?','Kendine bugün söylemek istediğin şefkatli bir cümle.'],
      reappraisal:['Bugün zorladığın bir olaya başka bir açıdan bakmak nasıl olurdu?','Bu durum üç ay sonra senin için ne ifade eder?'],
      values:['Bugün hangi değerini fark ettin? (Örn: dürüstlük, bağlılık, özgürlük, merhamet)','Bugün neye değer verdiğini fark ettiğin bir an.'],
      urgeSurf:['Bugün bir dürtü yükseldiğinde vücudunda neler hissettin? Nasıl geçti?','Bir dürtüyü sadece gözlemlemek: geldi, zirve yaptı, dağıldı.']
    },
    F2:{
      title:'Düzenleme',
      goal:'Bugün zihnin tekrar tekrar neye takıldığını fark edip küçük bir düzenleme yazmak.',
      free:['Bugün zihnin tekrar tekrar neye takıldı? Küçük bir düzenleme hamlesi ne olabilirdi?','Bugün düşüncelerinin seni nereye çektiğini fark ettin; o sen misin, yoksa zihnin mi?'],
      affect:['Bugün tekrar eden bir duygu nedir? Ona isim vermek zihnini yeniden düzenler.','Zihnin bugün hangi duyguya takıldı? Bu duygu ne anlatmak istiyor?'],
      gratitude:['Zor bir anda bugün görebildiğin küçük bir iyilik neydi?','Bugün sana “iyi ki” dedirten bir detay.'],
      win:['Bugün zihnini düzenlemek için attığın küçük bir adım.','Bugün eski alışkanlığından farklı düşündüğün bir an.'],
      selfCompassion:['Bugün kendini yargıladığın bir düşünceyi nasıl daha nazikçe yeniden yazabilirdin?','Zihnin sert konuşunca, ona hangi şefkatli cümleyle cevap verdin?'],
      reappraisal:['Bugün tekrar eden bir düşünceyi başka nasıl yorumlayabilirdin?','Zihnin söylediği “kesin” bir yargıya meydan okuyan bir bakış açısı.'],
      values:['Bugün zihnin seni çektiği yer, gerçekten değer verdiğin yön müydü?','Düşüncelerini hangi değerine göre düzenlemek isterdin?'],
      urgeSurf:['Bugün bir dürtü geldiğinde, onun “dalgası” kaç saniye sürdü? Yaz.','Dürtüyü engellemek yerine izlemek bugün nasıl bir fark yarattı?']
    },
    F3:{
      title:'Temas',
      goal:'Bugün bir ihtiyacını, sınırını veya destek isteğini dile getirmek üzerine yazmak.',
      free:['Bugün bir ihtiyacını, sınırını veya destek isteğini nasıl dile getirdin / getirebilirdin?','Bugün başka birine neye ihtiyacın olduğunu söylemek zor geldi?'],
      affect:['Bugün bir ilişkide hissettiğin duyguyu adlandır.','Duygunu söylemek zor geldiği bir an; ne hissediyordun?'],
      gratitude:['Bugün bir başkasından gelen küçük bir destek/iyilik neydi?','Bugün senin için “iyi ki varsın” dediğin biri ve nedeni.'],
      win:['Bugün bir ilişkide küçük bir iletişim kazanımın neydi?','Birine ihtiyacını söylemek için attığın küçük adım.'],
      selfCompassion:['Bugün başkalarına nazik olduğun kadar kendine nazik miydin?','Kendine ihtiyacın olduğunda destek istemek zor mu geldi?'],
      reappraisal:['Bugün birinin sözünü/hareketini başka nasıl yorumlayabilirdin?','Bir ilişkide bugün zorlanan anı, yarın arkana yaslanıp nasıl görürsün?'],
      values:['Bugün ilişkilerinde hangi değerine yaklaştın? (Örn: dürüstlük, yakınlık, adil olmak)','Bir iletişimde değerlerinle uyumlu davrandığın an.'],
      urgeSurf:['Bugün bir ilişkisel dürtü (öfke, uzaklaşma, yakınlaşma) geldiğinde ne yaptın?','Duygu dalgası geçene kadar nefes almak bugün bir ilişkini nasıl korudu?']
    },
    F4:{
      title:'Pekiştirme',
      goal:'Bugün hangi küçük tekrarı, değer hamlesini veya kendine sözünü fark ettiğini yazmak.',
      free:['Bugün hangi küçük tekrarı, değer hamlesini veya kendine sözünü fark ettin?','Bugün kendine verdiğin bir sözü tuttuğun an hangisiydi?'],
      affect:['Bugün hissettiğin olumlu bir duyguyu pekiştirmek için ne yazabilirsin?','Bugün içindeki en güzel duygu nedir? Onu büyüt.'],
      gratitude:['Bugün kendi kendine sağladığın bir iyilik neydi?','Bugün seni “iyi ki kendim için bunu yaptım” dedirten bir şey.'],
      win:['Bugün kendini ödüllendirmek için küçük bir kazanımı nasıl kutladın?','Bugün değerlerinle uyumlu bir “küçük zafer” yaz.'],
      selfCompassion:['Bugün kendini kutladığın bir an var mı?','Kendine bugün söylediğin en nazik cümle nedir?'],
      reappraisal:['Bugün zor bir deneyimi “geçmişte öğrenmem gereken bir ders” olarak nasıl görürsün?','Bir zorluğun bugün sana kazandırdığı yetkinlik nedir?'],
      values:['Bugün değerlerinden hangisini en çok yaşattın?','Yarın da aynı değere yaklaşmak için küçük bir söz yaz.'],
      urgeSurf:['Bugün eski bir dürtüye yenilmeden geçiş yaptığın anı yaz.','Dürtü dalgasının geçtiğini hatırlatan bir pekiştirme cümlesi.']
    }
  };

  function journalActivePhase(){
    var ad=null;
    var M=motivationProgram();
    if(M&&typeof M.activeDay==='function'){
      try{ ad=M.activeDay(liveData()); }catch(e){ ad=null; }
    }
    if(!ad) ad={phaseCode:'F1',phaseTitle:'Fark Etme',phaseGoal:'Bugün fark ettiğin bir dürtüyü, duyguyu veya düşünceyi yazmak.',dayIndex:Math.max(1,dayIndexFor(activeDate())),reflectionExamples:['Bugün fark ettiğin bir dürtü neydi?','Vücudunda nerede hissettin?','Bu dürtüyü adlandır.']};
    return ad;
  }
  function journalPhasePrompt(mode){
    var m=mode||'free';
    var ph=journalActivePhase();
    var code=(ph&&ph.phaseCode)||'F1';
    var p=JOURNAL_PHASE_PROMPTS[code]||JOURNAL_PHASE_PROMPTS.F1;
    var list=p[m]||p.free||['Bugünün ışığı için kendini serbest bırak.'];
    return list[Math.floor(Math.random()*list.length)];
  }
  function journalScienceHint(mode){
    var H={
      free:'Serbest yazmak, duyguları dışa vurmakla kortizolü düşürür; bağışıklığı destekler (Pennebaker).',
      affect:'Duyguyu adlandırmak amigdala aktivitesini azaltır, prefrontal korteksi güçlendirir (Lieberman).',
      gratitude:'Günde 3 iyi şey yazmak, ruh halini bir haftada yükseltir; etkisi aylarca sürer (Seligman).',
      win:'Küçük kazanımları fark etmek motivasyonu ve öz-yeterliliği artırır (Amabile).',
      selfCompassion:'Kendine nazik konuşmak depresyon ve anksiyete belirtilerini azaltır (Neff).',
      reappraisal:'Olaya başka açıdan bakmak duygu şiddetini düşürür (Gross).',
      values:'Değerlerine yaklaşmak davranışı yönlendirir ve anlam hissi verir (ACT).',
      urgeSurf:'Dürtüyü adlandırıp gözlemlemek, yerine verme olasılığını azaltır (Marlatt).'
    };
    return H[mode]||H.free;
  }
  function phaseDisplay(ph){
    var code=(ph&&ph.phaseCode)||'F1';
    var num=String(code).replace('F','');
    var title=(ph&&ph.phaseTitle)||'Fark Etme';
    if(/^\s*Faz\s+\d+/.test(title)){
      return title.replace(/\s*[—–-]\s*Faz\s+\d+\s*[—–-]\s*/g,' — ').replace(/\s+Faz\s+\d+\s*$/g,'').trim();
    }
    return 'Faz '+num+' — '+title;
  }
  function phaseShortTitle(ph){
    var title=(ph&&ph.phaseTitle)||'Fark Etme';
    var m=title.match(/^\s*Faz\s+\d+\s*[—–-]\s*(.+)$/);
    if(m) return m[1].trim();
    return title;
  }
  function journalStreak(){
    var today=todayStr();
    var data=liveData();
    var idx=Math.max(1,dayIndexFor(today));
    var streak=0;
    for(var i=0;i<idx;i++){
      var d=addDays(today,-i);
      var rec=data.days[d];
      var has=!!(rec&&(String(rec.note||'').trim()||String((rec.journal||{}).text||'').trim()));
      if(has) streak++; else break;
    }
    return streak;
  }
  function fmtDateShort(iso){
    if(!iso) return '';
    try{ var d=new Date(iso); return d.toLocaleDateString('tr-TR',{day:'numeric',month:'short'}); }catch(e){ return ''; }
  }
  function journalLightCardHTML(rec, streak){
    var has=rec&&rec.journal&&String(rec.journal.text||'').trim();
    var title=has?'Bugünün ışığı parlıyor ✨':'Bugünün ışığı henüz yazılmadı 🪶';
    var sub=has?(rec.journal.wordCount+' kelime · '+fmtDateShort(rec.journal.savedAt)):(streak>1?(streak+' günlük seri · yazmak seriyi korur'):'Birkaç satır yaz, kendine ışık tut');
    return '<button data-fx="open" type="button" onclick="App.openJournalModal()" class="sgl-journal-card sey-asbtn"><span class="sgl-journal-icon">'+icon('sparkles',17)+'</span><div class="sgl-journal-text"><div class="sgl-journal-title">'+esc(title)+'</div><div class="sgl-journal-sub">'+esc(sub)+'</div></div><span class="sgl-journal-action">'+(has?'Görüntüle':'Aç')+' '+icon('chevron-right',12)+'</span></button>';
  }
  function journalModalHTML(){
    var date=activeDate();
    var dayIdx=Math.max(1,dayIndexFor(date));
    var ph=journalActivePhase();
    var ui=liveUi();
    var mode=ui.journalMode||'free';
    var data=liveData();
    var text=String(ui.journalText!==undefined?ui.journalText:(data.days[date]&&data.days[date].journal?data.days[date].journal.text:''));
    var streak=journalStreak();
    var goal=data.settings.journalGoal||{words:30,chars:140};
    var words=String(text).trim()?String(text).trim().split(/\s+/).filter(function(w){return w.length>0;}).length:0;
    var chars=String(text).length;
    var met=(words>=goal.words||chars>=goal.chars);
    var pct=Math.min(100,Math.round((words/goal.words)*100));
    var mObj=find(JOURNAL_MODES,'id',mode)||JOURNAL_MODES[0];
    var hasSaved=(data.days[date]&&data.days[date].journal&&data.days[date].journal.savedAt);

    var h='<div onclick="App.closeJournalModal()" style="position:fixed;inset:0;z-index:350;background:rgba(44,36,38,0.52);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:stretch;justify-content:center;animation:seyFade .2s ease;">';
    h+='<div id="sey-journal-dialog" role="dialog" aria-modal="true" aria-label="Günışığı’nın Günlüğü" tabindex="-1" onkeydown="App.onModalKeydown(event,App.closeJournalModal)" onclick="event.stopPropagation()" style="position:relative;width:100%;max-width:480px;height:100%;background:var(--modal);box-shadow:0 0 60px rgba(0,0,0,0.32);animation:seyFloatIn .32s var(--ease-premium,ease);display:flex;flex-direction:column;overflow:hidden;">';

    h+='<div style="flex-shrink:0;position:relative;padding:calc(env(safe-area-inset-top) + 15px) 15px 15px;background:linear-gradient(135deg,var(--journal),var(--journal2));color:#fff;box-shadow:0 8px 22px color-mix(in srgb,var(--journal) 32%, transparent);overflow:hidden;">';
    h+='<div style="position:absolute;top:-40px;right:-34px;width:150px;height:150px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,0.22),transparent 70%);pointer-events:none;"></div>';
    h+='<div style="position:relative;display:flex;align-items:center;gap:12px;">';
    h+='<span style="width:46px;height:46px;border-radius:15px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.22);box-shadow:inset 0 1px 0 rgba(255,255,255,0.4);">'+icon('book-open',23)+'</span>';
    h+='<div style="flex:1;min-width:0;"><div style="font-size:var(--f-caption2);font-weight:800;letter-spacing:1px;opacity:.92;display:flex;align-items:center;gap:5px;">GÜNLÜK IŞIĞI <span style="font-size:var(--f-caption1);">🦩</span></div><div style="font-size:var(--f-title3);font-weight:800;line-height:1.15;margin-top:2px;">Günışığı\'nın Günlüğü</div></div>';
    h+='<button data-fx="close" onclick="App.closeJournalModal()" aria-label="Kapat" style="flex-shrink:0;border:none;cursor:pointer;background:rgba(255,255,255,0.22);width:36px;height:36px;border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center;">'+icon('x',17)+'</button>';
    h+='</div>';

    h+='<div style="position:relative;display:flex;gap:6px;margin-top:13px;">';
    h+='<div style="flex:1;display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.16);border-radius:11px;padding:7px 9px;"><span style="width:20px;height:20px;border-radius:50%;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.28);font-size:var(--f-caption2);font-weight:900;">'+ph.phaseCode.replace('F','')+'</span><span style="font-size:var(--f-caption1);font-weight:800;white-space:nowrap;">'+esc(phaseShortTitle(ph))+'</span></div>';
    h+='<div style="flex:1;display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.16);border-radius:11px;padding:7px 9px;"><span style="display:inline-flex;">'+icon('flame',14)+'</span><span style="font-size:var(--f-caption1);font-weight:800;white-space:nowrap;">'+streak+' günlük seri</span></div>';
    h+='<div style="flex:1;display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.16);border-radius:11px;padding:7px 9px;"><span style="display:inline-flex;">'+icon('sun',14)+'</span><span style="font-size:var(--f-caption1);font-weight:800;white-space:nowrap;">Gün '+dayIdx+'</span></div>';
    h+='</div>';
    h+='</div>';

    h+='<div class="scroll" style="flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px 15px 22px;display:flex;flex-direction:column;gap:14px;">';

    h+='<div style="display:flex;gap:10px;align-items:flex-start;background:linear-gradient(135deg,color-mix(in srgb,var(--journal) 12%,var(--card)),color-mix(in srgb,var(--journal2) 8%,var(--card)));border:1px solid color-mix(in srgb,var(--journal) 28%,var(--card-bd));border-radius:16px;padding:13px 14px;"><span style="flex-shrink:0;display:inline-flex;color:var(--journal);margin-top:1px;">'+icon('sparkles',18)+'</span><div style="font-size:var(--f-footnote);line-height:1.55;color:var(--text2);"><b style="color:var(--text);">'+esc(phaseDisplay(ph))+' · Gün '+dayIdx+'</b><br>'+esc(ph.phaseGoal||JOURNAL_PHASE_PROMPTS.F1.goal)+'</div></div>';

    h+='<div id="sey-journal-chips" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">';
    JOURNAL_MODES.forEach(function(m){
      var active=m.id===mode;
      var bg=active?'linear-gradient(135deg,var(--journal),var(--journal2))':'var(--icon)';
      var col=active?'#fff':'var(--text2)';
      var bd=active?'transparent':'var(--card-bd)';
      var sh=active?'0 6px 16px color-mix(in srgb,var(--journal-glow) 60%,transparent)':'none';
      h+='<button id="sey-journal-mode-'+m.id+'" onclick="App.setJournalMode(\''+m.id+'\')" style="border:'+bd+';cursor:pointer;background:'+bg+';color:'+col+';border-radius:14px;padding:10px 6px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;box-shadow:'+sh+';transition:transform .12s ease,box-shadow .2s ease;"><span style="font-size:var(--f-callout);">'+icon(m.icon,16)+'</span><span style="font-size:var(--f-caption2);font-weight:800;line-height:1.15;text-align:center;">'+esc(m.label)+'</span><span style="font-size:var(--f-caption2);opacity:.8;">'+esc(m.hint)+'</span></button>';
    });
    h+='</div>';

    h+='<div style="display:flex;gap:10px;align-items:flex-start;background:linear-gradient(160deg,rgba(255,225,154,0.20),rgba(201,184,255,0.14));border-radius:16px;padding:12px 13px;">';
    h+='<span style="flex-shrink:0;display:inline-flex;color:var(--journal);margin-top:2px;">'+icon('feather',17)+'</span>';
    h+='<div style="flex:1;min-width:0;"><div style="font-size:var(--f-footnote);font-weight:800;color:var(--text);margin-bottom:3px;">Bugünün sana sorduğu</div><div id="sey-journal-prompt" style="font-size:var(--f-subhead);line-height:1.45;color:var(--text2);">'+esc(ui.journalPromptUsed||journalPhasePrompt(mode))+'</div></div>';
    h+='<button onclick="App.useJournalPrompt()" style="flex-shrink:0;border:1px solid color-mix(in srgb,var(--journal) 40%,var(--card-bd));background:color-mix(in srgb,var(--journal) 10%,var(--card));color:var(--journal);border-radius:12px;padding:7px 10px;font-size:var(--f-caption1);font-weight:800;cursor:pointer;">Başka öneri</button>';
    h+='</div>';

    h+='<div id="sey-journal-science" style="display:flex;gap:10px;align-items:flex-start;background:color-mix(in srgb,var(--journal) 9%,var(--card));border:1px solid color-mix(in srgb,var(--journal) 26%,var(--card-bd));border-radius:16px;padding:13px 14px;"><span style="flex-shrink:0;color:var(--journal);display:inline-flex;margin-top:1px;">'+icon('brain',18)+'</span><div style="font-size:var(--f-footnote);line-height:1.6;color:var(--text2);"><b style="color:var(--text);">Bilimsel ipucu:</b> '+journalScienceHint(mode)+'</div></div>';

    h+='<div style="display:flex;flex-direction:column;gap:11px;">';
    h+='<textarea id="sey-journal-text" oninput="App.onJournalText(this)" placeholder="Bir satır bile yeter, Sevgili Günışığı. Yazmak beynin duygu devresini yatıştırır." rows="7" style="width:100%;box-sizing:border-box;border:1px solid color-mix(in srgb,var(--journal) 45%,var(--field-bd));background:var(--field);border-radius:18px;padding:14px 13px;font-size:var(--f-callout);outline:none;resize:none;line-height:1.6;color:var(--text);box-shadow:inset 0 1px 0 rgba(255,255,255,0.25);">'+esc(text)+'</textarea>';
    h+='<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">';
    h+='<div id="sey-journal-counts" style="font-size:var(--f-caption1);font-weight:700;color:var(--text2);">'+words+' kelime · '+chars+' karakter</div>';
    h+='<div id="sey-journal-goal" style="font-size:var(--f-caption1);font-weight:800;color:'+(met?'var(--ok)':'var(--muted)')+';">'+((words>=goal.words||chars>=goal.chars)?'Hedef tamamlandı ✨':('Hedef: '+goal.words+' kelime veya '+goal.chars+' karakter'))+'</div>';
    h+='</div>';
    h+='<div style="height:6px;background:var(--icon);border-radius:999px;overflow:hidden;">';
    h+='<div id="sey-journal-bar" style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,var(--journal),var(--journal2));border-radius:999px;transition:width .2s ease;"></div>';
    h+='</div>';
    h+='</div>';

    h+='<div style="display:flex;gap:8px;flex-wrap:wrap;">';
    h+='<div id="sey-journal-streak" style="font-size:var(--f-caption1);font-weight:800;color:var(--journal);background:color-mix(in srgb,var(--journal) 12%,var(--card));border:1px solid color-mix(in srgb,var(--journal) 25%,var(--card-bd));border-radius:999px;padding:7px 12px;display:inline-flex;align-items:center;gap:5px;">'+icon('flame',13)+streak+' günlük seri</div>';
    h+='<div style="font-size:var(--f-caption1);font-weight:800;color:var(--text2);background:var(--icon);border:1px solid var(--card-bd);border-radius:999px;padding:7px 12px;display:inline-flex;align-items:center;gap:5px;">'+icon('target',13)+(met?'Hedef tamamlandı':'Hedef: '+goal.words+' kelime')+'</div>';
    if(hasSaved) h+='<div style="font-size:var(--f-caption1);font-weight:800;color:var(--ok-ink);background:color-mix(in srgb,var(--ok) 12%,var(--card));border:1px solid color-mix(in srgb,var(--ok) 25%,var(--card-bd));border-radius:999px;padding:7px 12px;display:inline-flex;align-items:center;gap:5px;">'+icon('check-circle',13)+'Bugün kaydedildi</div>';
    h+='</div>';

    h+='</div>';

    h+='<div style="flex-shrink:0;padding:12px 15px calc(12px + env(safe-area-inset-bottom));background:var(--modal);border-top:1px solid var(--card-bd);display:flex;gap:10px;">';
    h+='<button data-fx="close" onclick="App.closeJournalModal()" style="flex:1;border:1px solid var(--card-bd);cursor:pointer;padding:14px;border-radius:16px;font-size:var(--f-subhead);font-weight:700;color:var(--text2);background:transparent;">Kapat</button>';
    h+='<button onclick="App.saveJournal()" style="flex:2;border:none;cursor:pointer;padding:14px;border-radius:16px;font-size:var(--f-subhead);font-weight:800;color:#fff;background:linear-gradient(135deg,var(--journal),var(--journal2));box-shadow:0 10px 24px color-mix(in srgb,var(--journal-glow) 55%,transparent),inset 0 1px 0 rgba(255,255,255,0.35);display:flex;align-items:center;justify-content:center;gap:6px;">'+(hasSaved?('Güncelle ve kapat '+icon('sparkles',16)):('Kaydet ve kapat '+icon('sparkles',16)))+'</button>';
    h+='</div>';

    h+='</div></div>';
    return h;
  }

  window.SeymaJournal={
    registerJournal:registerJournal,
    JOURNAL_DEPENDENCIES:JOURNAL_DEPENDENCIES,
    journalModes:function(){ return JOURNAL_MODES; },
    journalPhasePrompts:function(){ return JOURNAL_PHASE_PROMPTS; },
    journalActivePhase:journalActivePhase,
    journalPhasePrompt:journalPhasePrompt,
    journalScienceHint:journalScienceHint,
    phaseDisplay:phaseDisplay,
    phaseShortTitle:phaseShortTitle,
    journalStreak:journalStreak,
    fmtDateShort:fmtDateShort,
    journalLightCardHTML:journalLightCardHTML,
    journalModalHTML:journalModalHTML
  };
})();
