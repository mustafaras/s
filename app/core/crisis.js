(function(){
  'use strict';

  // MON-27 · Kriz odası / craving domain registry
  // ---------------------------------------------------------------------------
  // Güvenlik-kritik kriz kopyası ve salt görünüm üreticileri burada yaşar.
  // App-owned state writes, save/commit, handler atamaları ve modal focus
  // altyapısı app.js'te kalır. Modül yüklenirken storage, DOM, timer ve ağ
  // erişimi açılmaz; bütün state bağımlılıkları canlı resolver bag'inden okunur.
  var crisisDeps=null;
  var CRISIS_DEPENDENCIES=['data','ui','dark','todayStr','isVacationDay','icon','esc','find','pad'];

  function registerCrisis(deps){
    if(crisisDeps||!deps||typeof deps!=='object'||Array.isArray(deps)) return false;
    for(var i=0;i<CRISIS_DEPENDENCIES.length;i++) if(typeof deps[CRISIS_DEPENDENCIES[i]]!=='function') return false;
    crisisDeps=deps;
    return true;
  }
  function dep(name){ return crisisDeps&&typeof crisisDeps[name]==='function'?crisisDeps[name]:null; }
  function stateData(){ var f=dep('data'); if(f){ try{return f();}catch(e){} } var st=window.SeymaState; return st?st.data:null; }
  function stateUi(){ var f=dep('ui'); if(f){ try{return f();}catch(e){} } return null; }
  function stateDark(){ var f=dep('dark'); if(f){ try{return !!f();}catch(e){} } return false; }
  function todayStr(){ var f=dep('todayStr'); return f?f():''; }
  function isVacationDay(date){ var f=dep('isVacationDay'); return f?!!f(date):false; }
  function icon(){ var f=dep('icon'); return f?f.apply(null,arguments):''; }
  function esc(){ var f=dep('esc'); return f?f.apply(null,arguments):String(arguments[0]==null?'':arguments[0]); }
  function find(){ var f=dep('find'); return f?f.apply(null,arguments):null; }
  function pad(){ var f=dep('pad'); return f?f.apply(null,arguments):String(arguments[0]==null?'':arguments[0]); }

  var CRISES={
    sweet:{
      key:'sweet', label:'Tatlı krizi', short:'Tatlı', icon:'cookie',
      accent:'#E9899F', accent2:'#C9B8FF', doneField:'craving10MinDone', habit:'sweetManaged',
      tag:'TATLI KRİZİ', hero:'Panik yok Şeyma — tatlı geldi diye tahtın sarsılmaz.',
      sciTitle:'Tatlı isteği bir dalga',
      sci:'Şeker isteği bir <b>dalga</b>dır: yükselir ve genelde kısa sürede kendiliğinden geriler. Beyin hızlı yakıt ve dopamin vaadiyle dürtükler; ama duyguyu fark edip adlandırınca prefrontal korteks devreye girer — karar tekrar senin olur.',
      winTitle:'İşte bu.',
      winText:'Tatlı seni değil, sen tatlıyı yönettin. Küçük bir farkındalık, büyük kontrol.',
      opts:[
        {label:'Su içtim',icon:'droplet'},
        {label:'Kahve/çay yaptım',icon:'coffee'},
        {label:'Yoğurt + tarçın denedim',icon:'apple'},
        {label:'Meyve + yoğurt yaptım',icon:'cherry'},
        {label:'1-2 kare bitterle kapattım',icon:'cookie'},
        {label:'Hâlâ istiyorum ama kontrollü yiyeceğim',icon:'heart-handshake'}
      ],
      triggers:[
        {id:'tired',icon:'battery-low',label:'Yorgunum',sci:'Yorgunluk öz-denetimi (prefrontal korteks) zayıflatır; beyin hızlı enerji için şeker ister.'},
        {id:'bored',icon:'cloud',label:'Sıkıldım',sci:'Can sıkıntısı dopamin arayışını tetikler; tatlı kolay bir uyaran vaadidir.'},
        {id:'hungry',icon:'utensils',label:'Gerçekten açım',sci:'Kan şekeri düşünce bu fizyolojik açlıktır — bastırma, dengeli bir öğünle karşıla.'},
        {id:'stress',icon:'wind',label:'Stresliyim',sci:'Kortizol iştahı ve şeker isteğini artırır; bu duygusal açlık mideden gelmez.'},
        {id:'habit',icon:'repeat',label:'Alışkanlık',sci:'Koşullanmış bir ipucu (saat, mekân, ruh hâli) otomatik isteği tetikler.'}
      ]
    },
    food:{
      key:'food', label:'Yemek krizi', short:'Yemek', icon:'utensils',
      accent:'#E0A55E', accent2:'#F2C879', doneField:'foodCravingDone', habit:'foodManaged',
      tag:'YEMEK / AÇLIK KRİZİ', hero:'Dur bakalım Şeyma — mide mi konuşuyor, yoksa moral mi?',
      sciTitle:'Gerçek açlık mı, duygusal açlık mı?',
      sci:'Fiziksel açlık <b>yavaş</b> kurulur, her yiyeceğe açıktır ve doyunca susar. Duygusal açlık <b>aniden</b> gelir, belirli bir şeyi ister ve doysan bile dinmez. İlk adım duyguyu fark etmek: kızgın mısın, yalnız mısın, yorgun musun? <b>HALT</b> sorusu seni gerçek ihtiyaçla buluşturur.',
      winTitle:'Bravo kaptan.',
      winText:'Açlığı dinledin, boğulmadın. Gerçek açlıksa dengeli beslendin; duygusalsa kendini başka türlü besledin.',
      opts:[
        {label:'Bir bardak su içip bekledim',icon:'droplet'},
        {label:'Ilık bitki çayı yaptım',icon:'coffee'},
        {label:'HALT sorusunu kendime sordum',icon:'brain'},
        {label:'Proteinli dengeli bir öğün planladım',icon:'egg'},
        {label:'Gerçekten açtım, oturup dengeli yedim',icon:'utensils'},
        {label:'Duygusaldı, başka bir şeyle avundum',icon:'heart-handshake'}
      ],
      triggers:[
        {id:'hungry',icon:'utensils',label:'Gerçekten açım',sci:'Fiziksel açlık: mide kazınması, halsizlik, saatlerdir yememek. Bunu bastırma — dengeli bir öğünle karşıla.'},
        {id:'emotional',icon:'heart',label:'Duygusal boşluk',sci:'Üzüntü, yalnızlık ya da can sıkıntısı “ağız yoluyla” avunma ister; yemek geçici bir yatıştırıcı olur.'},
        {id:'stress',icon:'wind',label:'Stres / kaygı',sci:'Kortizol iştahı ve özellikle yağlı-şekerli “konfor yemeği” isteğini artırır.'},
        {id:'tired',icon:'battery-low',label:'Yorgun / uykusuz',sci:'Az uyku grelini (açlık hormonu) yükseltir, leptini düşürür — sahte açlık sinyali doğar.'},
        {id:'habit',icon:'repeat',label:'Öğün atladım / saat geldi',sci:'Öğün atlamak sonraki krizi büyütür; “yemek saati” de koşullanmış bir ipucu olabilir.'}
      ]
    },
    coffee:{
      key:'coffee', label:'Kahve krizi', short:'Kahve', icon:'coffee',
      accent:'#A9805B', accent2:'#D8B892', doneField:'coffeeCravingDone', habit:'coffeeManaged',
      tag:'KAHVE / KAFEİN KRİZİ', hero:'Kahve iyidir Şeyma, ama saat kaç? Uykunla pazarlık etmeyelim.',
      sciTitle:'Gerçek yorgunluk mu, alışkanlık mı?',
      sci:'Kafein isteği çoğu zaman gerçek ihtiyaç değil; <b>alışkanlık</b> ve öğle sonrası enerji düşüşüdür. Kafein adenozin (uyku baskısı) reseptörlerini bloke eder; yarılanma ömrü ~5-6 saattir. İstek geldiğinde önce duyguyu adlandır: yorgunluk mu, alışkanlık mı, yoksa keyif mi?',
      winTitle:'Net karar.',
      winText:'Kahveyi yasaklamıyoruz; saatine, dozuna ve nedenine sen karar veriyorsun. Uyku bunu unutmayacak.',
      opts:[
        {label:'Bir bardak su içtim',icon:'droplet'},
        {label:'Kısa yürüyüş/esneme yaptım',icon:'footprints'},
        {label:'Kafeinsiz / bitki çayı tercih ettim',icon:'coffee'},
        {label:'İçtim ama saatine dikkat ettim',icon:'clock'},
        {label:'Bugünlük kotamı doldurdum, vazgeçtim',icon:'heart-handshake'}
      ],
      triggers:[
        {id:'habit',icon:'repeat',label:'Alışkanlık (saat/mekân)',sci:'Belirli bir saat, masa ya da mola “otomatik kahve” ipucudur; istek gerçek yorgunluktan değil koşullanmadan gelir.'},
        {id:'lowenergy',icon:'battery-low',label:'Öğle sonrası enerji dibi',sci:'Yemek sonrası doğal bir uyanıklık düşüşü; su, ışık ve kısa hareket çoğu kez kafeinden hızlı toparlar.'},
        {id:'tired',icon:'cloud',label:'Uykusuzum',sci:'Az uyku kafein ihtiyacını büyütür ama geç saatte kahve ertesi günü daha da uykusuz yapar — kısır döngü.'},
        {id:'stress',icon:'wind',label:'Stres / kaygı',sci:'Kafein kortizolü ve çarpıntıyı artırabilir; stresliyken fazla kahve kaygıyı besler.'},
        {id:'social',icon:'heart-handshake',label:'Keyif / sosyal',sci:'Bazen kahve gerçekten keyiftir — sorun değil; yalnızca saatine ve toplam doza göz kırp.'}
      ]
    }
  };
  var CRISIS_ORDER=['sweet','food','coffee'];

  function rasitActionsHTML(){
      var data=stateData(), dark=stateDark();
    if(isVacationDay(todayStr())){
      var vacAccent='var(--vacation)';
      return '<div class="surface" style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:13px;border:1px solid color-mix(in srgb,'+vacAccent+' 28%, var(--card-bd));box-shadow:0 12px 30px color-mix(in srgb,'+vacAccent+' 14%, transparent);">'
        +'<div style="display:flex;align-items:center;gap:11px;">'
        +'<span style="width:38px;height:38px;border-radius:13px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:#fff;background:linear-gradient(135deg,var(--vacation2),var(--vacation));box-shadow:0 6px 16px var(--vacation-glow);">'+icon('heart-handshake',19)+'</span>'
        +'<div style="flex:1;min-width:0;"><div style="font-size:var(--f-callout);font-weight:800;line-height:1.15;color:var(--text);display:flex;align-items:center;gap:6px;">Tatil modunda kriz odası dinleniyor <span style="font-size:var(--f-subhead);">🦩</span></div><div style="font-size:var(--f-caption1);color:var(--faint);margin-top:2px;line-height:1.3;">Raşit şu an uzakta; keyfini çıkar, bir şeyler sarpa sarılırsa yarın tekrar burada olur.</div></div>'
        +'</div></div>';
    }
    var day=(data&&data.days)?data.days[todayStr()]:null;
    var doneOf={sweet:!!(day&&day.craving10MinDone), food:!!(day&&day.foodCravingDone), coffee:!!(day&&day.coffeeCravingDone)};
    var tile=function(kind){
      var C=CRISES[kind]; var done=doneOf[kind];
      var badge=done?'<span style="position:absolute;top:6px;right:6px;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:'+C.accent+';background:'+(dark?'#0B0B0D':'#fff')+';box-shadow:'+(dark?'none':'0 2px 6px rgba(108,74,58,0.3)')+';">'+icon('check',11)+'</span>':'';
      var darkLine=dark?'<span aria-hidden="true" style="position:absolute;top:0;left:12px;right:12px;height:3px;border-radius:0 0 999px 999px;background:linear-gradient(90deg,'+C.accent+','+C.accent2+');"></span>':'';
      return '<button'+(dark?' data-dark-crisis-tile="'+kind+'"':'')+' onclick="App.openCrisis(\''+kind+'\')" style="position:relative;flex:1;min-width:0;cursor:pointer;padding:14px 6px 12px;border-radius:18px;'+(dark?'overflow:hidden;':'')+'display:flex;flex-direction:column;align-items:center;gap:6px;color:'+(dark?'#F7F4F6':'#fff')+';border:'+(dark?'1px solid color-mix(in srgb,'+C.accent+' 42%, rgba(255,255,255,.10))':'none')+';background:'+(dark?'linear-gradient(180deg,color-mix(in srgb,'+C.accent+' 9%,#141318),#09090B)':'linear-gradient(135deg,'+C.accent+','+C.accent2+')')+';box-shadow:'+(dark?'inset 0 1px 0 rgba(255,255,255,.035)':'0 10px 22px color-mix(in srgb,'+C.accent+' 42%, transparent)')+';transition:transform .18s var(--ease-premium,ease);">'
        +darkLine
        +badge
        +'<span style="width:38px;height:38px;border-radius:13px;display:inline-flex;align-items:center;justify-content:center;color:'+(dark?C.accent2:'#fff')+';background:'+(dark?'color-mix(in srgb,'+C.accent+' 13%, rgba(255,255,255,.035))':'rgba(255,255,255,0.22)')+';border:'+(dark?'1px solid color-mix(in srgb,'+C.accent+' 24%, transparent)':'none')+';box-shadow:'+(dark?'none':'inset 0 1px 0 rgba(255,255,255,0.4)')+';">'+icon(C.icon,19)+'</span>'
        +'<span style="font-size:var(--f-footnote);font-weight:800;letter-spacing:.1px;white-space:nowrap;">'+C.short+'</span>'
        +'<span style="font-size:var(--f-caption2);font-weight:800;letter-spacing:.4px;color:'+(dark?C.accent2:'currentColor')+';opacity:.92;text-transform:uppercase;">'+(done?'yönetildi ✓':'kriz odası')+'</span></button>';
    };
    var h='<div class="surface"'+(dark?' data-dark-variant="crisis"':'')+' style="border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:13px;'+(dark?'background:linear-gradient(145deg,#121013,#0B0B0D);':'')+'border:1px solid color-mix(in srgb,#E9899F '+(dark?'34':'26')+'%, var(--card-bd));box-shadow:'+(dark?'none':'0 12px 30px rgba(233,137,159,0.16)')+';">';
    h+='<div style="display:flex;align-items:center;gap:11px;">';
    h+='<span style="width:38px;height:38px;border-radius:13px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:#fff;background:'+(dark?'linear-gradient(135deg,#9B5870,#68577E)':'linear-gradient(135deg,#E9899F,#C9B8FF)')+';box-shadow:'+(dark?'none':'0 6px 16px rgba(233,137,159,0.4)')+';">'+icon('heart-handshake',19)+'</span>';
    h+='<div style="flex:1;min-width:0;"><div style="font-size:var(--f-callout);font-weight:800;line-height:1.15;color:var(--text);display:flex;align-items:center;gap:6px;">Kriz mi geldi? Raşit yetişiyor <span style="font-size:var(--f-subhead);">🦩</span></div><div style="font-size:var(--f-caption1);color:var(--faint);margin-top:2px;line-height:1.3;">Süreli, bilimsel bir odaya gir — bastırma, yönet.</div></div>';
    h+='</div>';
    h+='<div style="display:flex;gap:9px;">'+tile('sweet')+tile('food')+tile('coffee')+'</div>';
    h+='</div>';
    return h;
  }

  function crisisModalHTML(){
      var ui=stateUi();
    var kind=ui.crisisKind; var C=CRISES[kind]; if(!C) return '';
    var A=C.accent, A2=C.accent2, hr=new Date().getHours();
    var tcap=(kind==='coffee'?'MOLASI':'KURALI');
    var pill=function(n){ return '<span style="font-size:var(--f-caption2);font-weight:800;color:#fff;background:'+A+';border-radius:999px;min-width:20px;height:20px;padding:0 6px;display:inline-flex;align-items:center;justify-content:center;">'+n+'</span>'; };
    // Premium bölüm başlığı (açılır/kapanır DEĞİL): tüm içerik her zaman görünür,
    // sayfa serbestçe kaydırılır — çerçeve/kafes yok, hiçbir şey kırpılmaz.
    var secHead=function(ic,title,sub,n){
      var s='<div style="display:flex;align-items:center;gap:11px;">';
      s+='<span style="width:38px;height:38px;border-radius:13px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:'+A+';background:color-mix(in srgb,'+A+' 15%, var(--icon));box-shadow:inset 0 1px 0 rgba(255,255,255,0.4);">'+icon(ic,17)+'</span>';
      s+='<div style="flex:1;min-width:0;"><div style="font-size:var(--f-callout);font-weight:800;color:var(--text);line-height:1.15;">'+title+'</div><div style="font-size:var(--f-caption1);color:var(--faint);margin-top:2px;line-height:1.3;">'+sub+'</div></div>';
      if(n>0) s+='<div style="flex-shrink:0;">'+pill(n)+'</div>';
      s+='</div>';
      return s;
    };
    // Bölümü tek akışta toplayan sarmalayıcı: başlık + üstünde ince accent ayraç.
    var section=function(ic,title,sub,n,items){
      return '<div style="display:flex;flex-direction:column;gap:11px;padding-top:4px;">'
        +'<div style="height:1px;background:linear-gradient(90deg,transparent,color-mix(in srgb,'+A+' 30%, transparent),transparent);"></div>'
        +secHead(ic,title,sub,n)
        +'<div style="display:flex;flex-direction:column;gap:9px;">'+items+'</div></div>';
    };

    // Tam sayfa modal: alttan-sayfa yerine tüm ekranı kaplar → uzun expander gövdeleri
    // artık dar bir çerçeveye sıkışmaz, serbestçe kaydırılır. Birincil eylem sabit alt bar'da.
    var h='<div id="sey-crisis-back" onclick="App.closeCrisis()" style="position:fixed;inset:0;z-index:340;background:rgba(44,36,38,0.52);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:stretch;justify-content:center;animation:seyFade .2s ease;">';
    h+='<div id="sey-crisis-card" role="dialog" aria-modal="true" aria-label="Kriz odası" tabindex="-1" onkeydown="App.onModalKeydown(event,App.closeCrisis)" onclick="event.stopPropagation()" style="position:relative;width:100%;max-width:480px;height:100%;background:var(--modal);box-shadow:0 0 60px rgba(0,0,0,0.32);animation:seyFloatIn .32s var(--ease-premium,ease);display:flex;flex-direction:column;overflow:hidden;">';

    // sticky header (gradient accent, Raşit branding, safe-area üst boşluğu)
    h+='<div style="flex-shrink:0;position:relative;padding:calc(env(safe-area-inset-top) + 15px) 15px 15px;background:linear-gradient(135deg,'+A+','+A2+');color:#fff;box-shadow:0 8px 22px color-mix(in srgb,'+A+' 32%, transparent);overflow:hidden;">';
    h+='<div style="position:absolute;top:-40px;right:-34px;width:150px;height:150px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,0.22),transparent 70%);pointer-events:none;"></div>';
    h+='<div style="position:relative;display:flex;align-items:center;gap:12px;">';
    h+='<span style="width:46px;height:46px;border-radius:15px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.22);box-shadow:inset 0 1px 0 rgba(255,255,255,0.4);">'+icon(C.icon,23)+'</span>';
    h+='<div style="flex:1;min-width:0;"><div style="font-size:var(--f-caption2);font-weight:800;letter-spacing:1px;opacity:.92;display:flex;align-items:center;gap:5px;">'+C.tag+' <span style="font-size:var(--f-caption1);">🦩</span></div><div style="font-size:var(--f-title3);font-weight:800;line-height:1.15;margin-top:2px;">Raşit\'in Kriz Odası</div></div>';
    h+='<button data-fx="close" onclick="App.closeCrisis()" aria-label="Kapat" style="flex-shrink:0;border:none;cursor:pointer;background:rgba(255,255,255,0.22);width:36px;height:36px;border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center;">'+icon('x',17)+'</button>';
    h+='</div>';
    // 3 adımlı mikro-müdahale rayı: Dur → Dene → Karar ver
    h+='<div style="position:relative;display:flex;gap:6px;margin-top:13px;">';
    [['1','Dur'],['2','Dene'],['3','Karar ver']].forEach(function(st){
      h+='<div style="flex:1;display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.16);border-radius:11px;padding:7px 9px;"><span style="width:20px;height:20px;border-radius:50%;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.28);font-size:var(--f-caption2);font-weight:900;">'+st[0]+'</span><span style="font-size:var(--f-caption1);font-weight:800;white-space:nowrap;">'+st[1]+'</span></div>';
    });
    h+='</div>';
    h+='</div>';

    // scrollable body
    h+='<div id="sey-crisis-body" class="scroll" style="flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px 15px 22px;display:flex;flex-direction:column;gap:13px;">';

    // Raşit intro bubble
    h+='<div style="display:flex;align-items:flex-start;gap:10px;"><span style="width:36px;height:36px;border-radius:50%;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:#fff;background:linear-gradient(135deg,var(--room2),var(--room));box-shadow:0 5px 14px var(--room-glow);">'+icon('heart',17)+'</span><div class="surface" style="flex:1;min-width:0;border-radius:6px 18px 18px 18px;padding:12px 14px;border:1px solid color-mix(in srgb,'+A+' 24%, var(--card-bd));"><div style="font-size:var(--f-caption2);font-weight:800;letter-spacing:.8px;color:var(--room);margin-bottom:4px;">RAŞİT 🦩</div><div style="font-size:var(--f-subhead);line-height:1.5;color:var(--text2);">'+esc(C.hero)+'</div></div></div>';

    // ── Şu an kendimi nasıl hissediyorum? — Raşit sözünün hemen altında, belirgin ve teşvik edici ──
    var noteHas=!!(ui.crisisNote&&String(ui.crisisNote).trim());
    var trigN=ui.crisisTriggers.length+(noteHas?1:0);
    var noteCard='<div style="display:flex;flex-direction:column;gap:11px;background:linear-gradient(135deg,'+A+' 10%, color-mix(in srgb,'+A+' 5%, var(--card)));border:1px solid '+A+';border-radius:18px;padding:14px 14px 16px;box-shadow:0 8px 22px color-mix(in srgb,'+A+' 22%, transparent);">';
    noteCard+='<div style="display:flex;align-items:center;gap:9px;"><span style="width:30px;height:30px;border-radius:50%;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:#fff;background:linear-gradient(135deg,'+A+','+A2+');box-shadow:0 4px 10px color-mix(in srgb,'+A+' 40%, transparent);">'+icon('pencil',15)+'</span><div style="font-size:var(--f-subhead);font-weight:800;color:var(--text);line-height:1.2;">Şu an içinde ne hissediyorsun? 🦩</div></div>';
    noteCard+='<textarea id="crisis-note" oninput="App.onCrisisNote(this)" rows="3" placeholder="Birkaç kelimeyle yaz... Örn: iş stresi, can sıkıntısı, yorgunluk, ödül arayışı, kızgınlık. Yazmak beynin savunma devresini yatıştırır; sadece hissetmekten daha etkilidir." style="width:100%;box-sizing:border-box;border:1px solid color-mix(in srgb,'+A+' 50%, var(--field-bd));background:var(--field);border-radius:14px;padding:13px 12px;font-size:var(--f-subhead);outline:none;resize:none;line-height:1.55;color:var(--text);box-shadow:inset 0 1px 0 rgba(255,255,255,0.25);">'+esc(ui.crisisNote||'')+'</textarea>';
    noteCard+='<div style="font-size:var(--f-caption2);color:var(--muted);line-height:1.5;"><b style="color:var(--text);">Bilimsel ipucu:</b> Duyguyu adlandırmak amigdala aktivitesini azaltır, prefrontal korteksi güçlendirir. Yani hissettiğini söylemek seni biraz daha sakinleştirir.</div>';
    noteCard+='</div>';
    h+=noteCard;

    // science box
    h+='<div style="display:flex;gap:10px;align-items:flex-start;background:color-mix(in srgb,'+A+' 9%, var(--card));border:1px solid color-mix(in srgb,'+A+' 26%, var(--card-bd));border-radius:16px;padding:13px 14px;"><span style="flex-shrink:0;color:'+A+';display:inline-flex;margin-top:1px;">'+icon('brain',18)+'</span><div style="font-size:var(--f-footnote);line-height:1.6;color:var(--text2);"><b style="color:var(--text);">'+esc(C.sciTitle)+'</b><br>'+C.sci+'</div></div>';

    // coffee: saat-farkında uyku uyarısı
    if(kind==='coffee' && hr>=14){ h+='<div style="display:flex;gap:9px;align-items:flex-start;background:rgba(155,127,201,0.12);border:1px solid rgba(155,127,201,0.32);border-radius:14px;padding:11px 13px;"><span style="flex-shrink:0;color:#8A75C8;display:inline-flex;">'+icon('moon',16)+'</span><div style="font-size:var(--f-caption1);line-height:1.55;color:var(--text2);"><b>Saat '+pad(hr)+':00 civarı.</b> Kafein ~5-6 saat kalıcıdır; şimdi içersen gece uykun bölünebilir. Bugünlük kafeinsize ya da suya ne dersin?</div></div>'; }

    // ── Premium dropdown: Tetikleyiciler ──
    var trigOpen = !!ui.crisisTrigOpen;
    var trigCount = ui.crisisTriggers.length;
    var trigSummary = trigCount > 0
      ? ui.crisisTriggers.map(function(tid){ var t=find(C.triggers,'id',tid); return t?t.label:tid; }).join(', ')
      : 'Tetikleyiciyi seçmek için dokun';
    var trigChevRot = trigOpen ? '180deg' : '0deg';
    var trigDropBody = '';
    C.triggers.forEach(function(t){
      var sel=ui.crisisTriggers.indexOf(t.id)>=0;
      trigDropBody+='<button onclick="App.toggleCrisisTrigger(\''+t.id+'\')" style="display:flex;align-items:flex-start;gap:11px;width:100%;text-align:left;padding:12px 13px;border-radius:15px;cursor:pointer;transition:all .18s;'+(sel?('background:color-mix(in srgb,'+A+' 12%, var(--card));border:1px solid '+A+';box-shadow:0 6px 14px color-mix(in srgb,'+A+' 22%, transparent);'):'background:var(--card);border:1px solid var(--card-bd);')+'">';
      trigDropBody+='<span style="width:32px;height:32px;border-radius:10px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:'+A+';background:color-mix(in srgb,'+A+' 12%, var(--icon));">'+icon(t.icon,16)+'</span>';
      trigDropBody+='<span style="flex:1;min-width:0;"><span style="font-size:var(--f-subhead);font-weight:700;color:var(--text);display:block;">'+esc(t.label)+'</span><span style="font-size:var(--f-caption1);color:var(--muted);line-height:1.45;display:block;margin-top:2px;">'+esc(t.sci)+'</span></span>';
      trigDropBody+='<span style="width:22px;height:22px;border-radius:50%;flex-shrink:0;margin-top:4px;display:flex;align-items:center;justify-content:center;color:#fff;background:'+(sel?'linear-gradient(135deg,'+A+','+A2+')':'transparent')+';border:'+(sel?'none':'2px solid var(--field-bd)')+';">'+(sel?icon('check',12):'')+'</span>';
      trigDropBody+='</button>';
    });
    var trigDrop =
      '<div id="crisis-trig-drop" style="display:flex;flex-direction:column;gap:9px;'+(trigOpen?'':'display:none;')+'">'+trigDropBody+'</div>';
    var trigCard =
      '<div style="display:flex;flex-direction:column;gap:9px;background:var(--card);border:1px solid '+(trigCount>0?A:'var(--card-bd)')+';border-radius:20px;padding:13px 14px 14px;box-shadow:'+(trigCount>0?'0 8px 22px color-mix(in srgb,'+A+' 18%, transparent)':'0 5px 16px rgba(108,74,58,0.05)')+';">'
      +'<button type="button" class="sey-asbtn" onclick="App.toggleCrisisDropdown(\'trig\')" style="cursor:pointer;display:flex;align-items:center;gap:11px;">'
      +'<span style="width:36px;height:36px;border-radius:12px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:'+A+';background:color-mix(in srgb,'+A+' 14%, var(--icon));box-shadow:inset 0 1px 0 rgba(255,255,255,0.4);">'+icon('zap',16)+'</span>'
      +'<div style="flex:1;min-width:0;"><div style="font-size:var(--f-subhead);font-weight:800;color:var(--text);line-height:1.15;">Bu krizi ne tetikliyor?</div><div style="font-size:var(--f-caption1);color:'+(trigCount>0?A:'var(--faint)')+';margin-top:2px;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+esc(trigSummary)+'</div></div>'
      +'<span style="color:'+A+';display:inline-flex;transition:transform .25s var(--ease-premium,ease);transform:rotate('+trigChevRot+');">'+icon('chevron-down',16)+'</span>'
      +'</button>'
      +trigDrop
      +'<div style="font-size:var(--f-caption2);color:var(--faint);line-height:1.5;padding-top:1px;">İşaretlediğin tetikleyiciler Rapor’da örüntünü çıkarmama yardımcı olur.</div>'
      +'</div>';
    h+=trigCard;

    // ── Premium dropdown: Ne denedin? ──
    var triedOpen = !!ui.crisisTriedOpen;
    var triedN=ui.crisisOpts.length;
    var triedSummary = triedN > 0
      ? triedN + ' şey denedin'
      : 'Denediğin bir strateji var mı?';
    var triedChevRot = triedOpen ? '180deg' : '0deg';
    var triedDropBody='';
    C.opts.forEach(function(o){
      var val=o.label, sel=ui.crisisOpts.indexOf(val)>=0;
      var stl=sel?('background:color-mix(in srgb,'+A+' 14%, var(--card));border:1px solid '+A+';box-shadow:0 6px 14px color-mix(in srgb,'+A+' 24%, transparent);'):'background:var(--card);border:1px solid var(--card-bd);';
      triedDropBody+='<button onclick="App.toggleCrisisOpt(\''+val.replace(/'/g,"\\'")+'\')" style="display:flex;align-items:center;gap:10px;width:100%;padding:13px 14px;border-radius:15px;cursor:pointer;transition:all .18s;color:var(--text);'+stl+'"><span style="display:inline-flex;color:'+A+';">'+icon(o.icon,16)+'</span><span style="flex:1;text-align:left;font-size:var(--f-subhead);font-weight:600;">'+esc(val)+'</span><span style="width:24px;height:24px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;background:'+(sel?'linear-gradient(135deg,'+A+','+A2+')':'transparent')+';border:'+(sel?'none':'2px solid var(--field-bd)')+';">'+(sel?icon('check',13):'')+'</span></button>';
    });
    var triedDrop =
      '<div id="crisis-tried-drop" style="display:flex;flex-direction:column;gap:9px;'+(triedOpen?'':'display:none;')+'">'+triedDropBody+'</div>';
    var triedCard =
      '<div style="display:flex;flex-direction:column;gap:9px;background:var(--card);border:1px solid '+(triedN>0?A:'var(--card-bd)')+';border-radius:20px;padding:13px 14px 14px;box-shadow:'+(triedN>0?'0 8px 22px color-mix(in srgb,'+A+' 18%, transparent)':'0 5px 16px rgba(108,74,58,0.05)')+';">'
      +'<button type="button" class="sey-asbtn" onclick="App.toggleCrisisDropdown(\'tried\')" style="cursor:pointer;display:flex;align-items:center;gap:11px;">'
      +'<span style="width:36px;height:36px;border-radius:12px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:'+A+';background:color-mix(in srgb,'+A+' 14%, var(--icon));box-shadow:inset 0 1px 0 rgba(255,255,255,0.4);">'+icon('heart-handshake',16)+'</span>'
      +'<div style="flex:1;min-width:0;"><div style="font-size:var(--f-subhead);font-weight:800;color:var(--text);line-height:1.15;">Şu an ne denedin?</div><div style="font-size:var(--f-caption1);color:'+(triedN>0?A:'var(--faint)')+';margin-top:2px;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+esc(triedSummary)+'</div></div>'
      +'<span style="color:'+A+';display:inline-flex;transition:transform .25s var(--ease-premium,ease);transform:rotate('+triedChevRot+');">'+icon('chevron-down',16)+'</span>'
      +'</button>'
      +triedDrop
      +'<div style="font-size:var(--f-caption2);color:var(--faint);line-height:1.5;padding-top:1px;">Küçük bir hamle bile prefrontal korteksi devreye sokar; bu da kriz şiddetini düşürür.</div>'
      +'</div>';
    h+=triedCard;

    // done: kutlama kartı (eylem düğmeleri sabit alt bar'a taşındı)
    if(ui.crisisDone){
      h+='<div style="background:linear-gradient(135deg,color-mix(in srgb,'+A+' 22%, transparent),color-mix(in srgb,'+A2+' 26%, transparent));border:1px solid color-mix(in srgb,'+A+' 30%, var(--card-bd));border-radius:20px;padding:20px;text-align:center;animation:seyPop .3s ease;"><div style="width:52px;height:52px;border-radius:50%;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;color:#fff;background:linear-gradient(135deg,'+A+','+A2+');box-shadow:0 10px 24px color-mix(in srgb,'+A+' 40%, transparent);">'+icon('check',26)+'</div><div style="font-size:var(--f-title3);font-weight:800;margin-bottom:6px;color:var(--text);">'+esc(C.winTitle)+'</div><p style="margin:0;font-size:var(--f-subhead);line-height:1.55;color:var(--text2);">'+esc(C.winText)+'</p>'+(C.habit?'<div style="margin-top:12px;font-size:var(--f-caption1);font-weight:800;color:#3F8A4F;display:inline-flex;align-items:center;gap:5px;background:rgba(143,191,138,0.18);border-radius:999px;padding:5px 12px;">'+icon('check',12)+' Bugünün tikine işlendi</div>':'')+'</div>';
    }

    h+='</div>'; // body

    // ── sabit alt bar (birincil eylem her zaman erişilebilir) ──
    h+='<div style="flex-shrink:0;position:relative;padding:12px 15px calc(14px + env(safe-area-inset-bottom));background:var(--modal);border-top:1px solid var(--card-bd);box-shadow:0 -10px 26px rgba(0,0,0,0.07);">';
    if(ui.crisisDone){
      h+='<button data-fx="close" onclick="App.closeCrisis()" style="border:none;width:100%;padding:16px;border-radius:18px;font-size:var(--f-body);font-weight:800;color:#fff;background:linear-gradient(135deg,'+A+','+A2+');box-shadow:0 12px 26px color-mix(in srgb,'+A+' 42%, transparent);display:flex;align-items:center;justify-content:center;gap:7px;cursor:pointer;">Tamam, kapat '+icon('check',16)+'</button>';
      h+='<div style="font-size:var(--f-caption2);color:var(--faint);text-align:center;line-height:1.5;margin-top:8px;">Kaydını aldım; bugünün ilgili tiki kendiliğinden yeşillendi.'+(C.habit?' Seni takip ediyorum, Sevgili Günışığı.':'')+'</div>';
    } else {
      h+='<button onclick="App.completeCrisis()" style="border:none;width:100%;padding:16px;border-radius:18px;font-size:var(--f-body);font-weight:800;color:#fff;background:linear-gradient(135deg,'+A+','+A2+');box-shadow:0 12px 26px color-mix(in srgb,'+A+' 42%, transparent);display:flex;align-items:center;justify-content:center;gap:7px;cursor:pointer;opacity:1;">Krizi kaydet '+icon('check',16)+'</button>';
      h+='<div style="font-size:var(--f-caption2);color:var(--faint);text-align:center;line-height:1.5;margin-top:8px;">Herhangi bir duygu, tetikleyici, not veya denenen strateji girdin mi? “Krizi kaydet”e basınca bugünün ilgili tiki yeşillenir.'+(C.habit?'':' Kaydın Rapor’a işlenir.')+'</div>';
    }
    h+='</div>'; // footer

    h+='</div></div>'; // card + back
    return h;
  }

  window.SeymaCrisis={
    registerCrisis:registerCrisis,CRISIS_DEPENDENCIES:CRISIS_DEPENDENCIES,
    crises:function(){ return CRISES; },crisisFor:function(kind){ return CRISES[kind]||null; },
    crisisOrder:function(){ return CRISIS_ORDER.slice(); },
    rasitActionsHTML:rasitActionsHTML,crisisModalHTML:crisisModalHTML
  };
})();
