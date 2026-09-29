(function(window){
  'use strict';

  var deps=null;

  function register(nextDeps){
    if(deps||!nextDeps||typeof nextDeps!=='object'||Array.isArray(nextDeps)) return false;
    if(typeof nextDeps.esc!=='function'||typeof nextDeps.icon!=='function') return false;
    deps={esc:nextDeps.esc,icon:nextDeps.icon};
    return true;
  }
  function escapeText(value){
    if(!deps) throw new Error('KAO2-04: görünüm bağımlılıkları kayıtlı değil');
    return deps.esc(value==null?'':String(value));
  }
  function matchingDivEnd(html,start){
    var tags=/<\/?div\b[^>]*>/gi,depth=0,match;
    tags.lastIndex=start;
    while((match=tags.exec(html))){
      if(/^<\//.test(match[0])) depth-=1; else depth+=1;
      if(depth===0) return tags.lastIndex;
    }
    return -1;
  }
  function extractLargeTitle(html){
    var start=html.indexOf('<div class="kao-view-head"');
    if(start<0) return {html:html,content:''};
    var end=matchingDivEnd(html,start);
    if(end<0) throw new Error('KAO2-04: görünüm başlığı dengeli değil');
    var block=html.slice(start,end),openEnd=block.indexOf('>')+1,closeStart=block.lastIndexOf('</div>');
    var content=block.slice(openEnd,closeStart).replace(/<button\b(?=[^>]*class="kao-back")[^>]*>[\s\S]*?<\/button>/g,'');
    return {html:html.slice(0,start)+html.slice(end),content:content};
  }
  function navBar(options){
    if(!deps) throw new Error('KAO2-04: görünüm bağımlılıkları kayıtlı değil');
    var title=escapeText(options.title),isRoot=options.view==='home'||options.view==='onboard',action=isRoot?'App.kaoClose()':'App.kaoBack()',label=isRoot?'Kapat':'‹ '+escapeText(options.previousTitle||"Kur'an Arapçası");
    return '<nav class="kao-navbar" aria-label="'+title+'"><button type="button" class="kao-navbar-action" onclick="'+action+'" aria-label="'+label+'">'+label+'</button><span class="kao-navbar-title" title="'+title+'">'+title+'</span><span class="kao-navbar-spacer" aria-hidden="true"></span></nav>';
  }
  function largeTitle(title,content){
    var heading=content||'';
    if(!/<h2\b/i.test(heading)) heading='<h2 class="kao-largetitle-heading">'+escapeText(title)+'</h2>'+heading;
    return '<div class="kao-largetitle">'+heading+'</div>';
  }
  function renderScreen(options){
    if(!deps) throw new Error('KAO2-04: görünüm bağımlılıkları kayıtlı değil');
    if(options.view==='session') return options.body;
    var extracted=extractLargeTitle(String(options.body||''));
    return '<section class="kao-screen kao-screen-'+escapeText(options.view)+'">'+navBar(options)+largeTitle(options.title,extracted.content)+extracted.html+'</section>';
  }

  function actionCall(value){
    var name=value,args=[];
    if(value&&typeof value==='object'&&!Array.isArray(value)){name=value.name;args=value.args===undefined?[]:value.args;}
    var match=/^(?:App\.)?(kao[A-Za-z0-9_]*)$/.exec(String(name||'').trim());
    if(!match||!Array.isArray(args)) return '';
    var encoded=[];
    for(var i=0;i<args.length;i++){
      var arg=args[i];
      if(arg===null) encoded.push('null');
      else if(typeof arg==='string') encoded.push(JSON.stringify(arg));
      else if(typeof arg==='boolean') encoded.push(String(arg));
      else if(typeof arg==='number'&&Number.isFinite(arg)) encoded.push(String(arg));
      else return '';
    }
    return escapeText('App.'+match[1]+'('+encoded.join(',')+')');
  }
  function safeHref(value){
    var href=String(value||'');
    return /^#[A-Za-z][A-Za-z0-9_-]*$/.test(href)?href:'';
  }
  function groupedList(sections){
    if(!deps) throw new Error('KAO2-05: görünüm bağımlılıkları kayıtlı değil');
    if(!Array.isArray(sections)) return '<div class="kao-group-list"></div>';
    var html=sections.map(function(section){
      section=section&&typeof section==='object'?section:{};
      var rows=Array.isArray(section.rows)?section.rows:[];
      var rowHtml=rows.map(function(row,rowIndex){
        row=row&&typeof row==='object'?row:{};
        var title=escapeText(row.title),value=escapeText(row.value),icon=deps.icon(String(row.icon||''));
        var content='<span class="kao-group-icon" aria-hidden="true">'+icon+'</span><span class="kao-group-label">'+title+'</span><span class="kao-group-value">'+value+'</span><span class="kao-group-chevron" aria-hidden="true">›</span>'+(rowIndex<rows.length-1?'<span class="kao-group-separator" aria-hidden="true"></span>':'');
        var href=safeHref(row.href),call=actionCall(row.action);
        if(href) return '<a class="kao-group-row" href="'+escapeText(href)+'">'+content+'</a>';
        return '<button type="button" class="kao-group-row"'+(call?' onclick="'+call+'"':' disabled')+'>'+content+'</button>';
      }).join('');
      return '<section class="kao-group-section"><h3 class="kao-group-title">'+escapeText(section.title)+'</h3><div class="kao-group-surface">'+rowHtml+'</div>'+(section.footer?'<p class="kao-group-footer">'+escapeText(section.footer)+'</p>':'')+'</section>';
    }).join('');
    return '<div class="kao-group-list">'+html+'</div>';
  }
  function switchRow(options){
    if(!deps) throw new Error('KAO2-05: görünüm bağımlılıkları kayıtlı değil');
    options=options&&typeof options==='object'?options:{};
    var label=escapeText(options.label),checked=options.on===true,call=actionCall(options.action);
    return '<button type="button" class="kao-switch-row" role="switch" aria-checked="'+checked+'" aria-label="'+label+'"'+(call?' onclick="'+call+'"':' disabled')+'><span class="kao-switch-label">'+label+'</span><span class="kao-switch-track" aria-hidden="true"><span class="kao-switch-thumb"></span></span></button>';
  }
  function progressRing(pct,size,label){
    if(!deps) throw new Error('KAO2-05: görünüm bağımlılıkları kayıtlı değil');
    var number=Number(pct),value=Number.isFinite(number)?Math.round(Math.max(0,Math.min(100,number))):0;
    var dimension=[28,44,64].indexOf(Number(size));
    dimension=dimension<0?44:Number(size);
    var circumference=169.65,offset=(circumference*(100-value)/100).toFixed(2);
    return '<span class="kao-progress-ring" role="img" aria-label="'+escapeText(label)+': '+value+'%"><svg class="kao-progress-ring-svg kao-progress-ring-'+dimension+'" width="'+dimension+'" height="'+dimension+'" viewBox="0 0 64 64" aria-hidden="true"><circle class="kao-progress-ring-track" cx="32" cy="32" r="27" fill="none" stroke-width="4"></circle><circle class="kao-progress-ring-value" cx="32" cy="32" r="27" fill="none" stroke-width="4" stroke-dasharray="'+circumference+'" stroke-dashoffset="'+offset+'" transform="rotate(-90 32 32)"></circle></svg><span class="kao-progress-ring-text" aria-hidden="true">'+value+'%</span></span>';
  }
  function choice(options){
    if(!deps) throw new Error('KAO2-05: görünüm bağımlılıkları kayıtlı değil');
    options=options&&typeof options==='object'?options:{};
    var state=['correct','wrong','dim'].indexOf(options.state)>=0?options.state:'idle';
    var mark=state==='correct'?'✓':state==='wrong'?'✕':'';
    var screenText=state==='correct'?'Doğru cevap':state==='wrong'?'Senin seçimin':'';
    return '<div class="kao-choice kao-choice-'+state+'">'+(mark?'<span class="kao-choice-mark" aria-hidden="true">'+mark+'</span>':'')+(screenText?'<span class="kao-sr-only">'+screenText+'</span>':'')+'<span class="kao-choice-label">'+escapeText(options.label)+'</span></div>';
  }
  function feedbackSheet(options){
    if(!deps) throw new Error('KAO2-05: görünüm bağımlılıkları kayıtlı değil');
    options=options&&typeof options==='object'?options:{};
    var tone=['success','warning','neutral'].indexOf(options.tone)>=0?options.tone:'neutral';
    var actions=Array.isArray(options.actions)?options.actions:[];
    var actionHtml=actions.map(function(action){
      action=action&&typeof action==='object'?action:{};
      var call=actionCall(action.action);
      var kind=action.kind==='primary'?'kao-feedback-continue':(action.kind==='link'?'kao-feedback-undo':'');
      return '<button type="button" class="kao-feedback-action'+(kind?' '+kind:'')+'"'+(call?' onclick="'+call+'"':' disabled')+'>'+escapeText(action.label)+'</button>';
    }).join('');
    return '<section class="kao-feedback-sheet kao-feedback-'+tone+'"><div class="kao-feedback-message" role="status" aria-live="polite"><h3 class="kao-feedback-title">'+escapeText(options.title)+'</h3><p class="kao-feedback-body">'+escapeText(options.body)+'</p></div><div class="kao-feedback-actions">'+actionHtml+'</div></section>';
  }
  function primaryButton(options){
    if(!deps) throw new Error('KAO2-05: görünüm bağımlılıkları kayıtlı değil');
    options=options&&typeof options==='object'?options:{label:options};
    var call=actionCall(options.action),label=escapeText(options.label);
    return '<button type="button" class="kao-primary" aria-label="'+label+'"'+(call?' onclick="'+call+'"':' disabled')+'>'+label+'</button>';
  }

  // KAO2-09 · S-02 Bugün: HeroCard (tek birincil eylem) + Yolun kartı + iki grouped list.
  function heroCard(options){
    if(!deps) throw new Error('KAO2-09: görünüm bağımlılıkları kayıtlı değil');
    options=options&&typeof options==='object'?options:{};
    var foot=Array.isArray(options.foot)?options.foot:[];
    var footHtml=foot.map(function(line){
      line=line&&typeof line==='object'?line:{};
      return '<p class="kao-hero-note"><span class="kao-hero-note-icon" aria-hidden="true">'+deps.icon(String(line.icon||''))+'</span><span>'+escapeText(line.text)+'</span></p>';
    }).join('');
    return '<section class="kao-hero-card" aria-labelledby="kao-hero-title"><p class="kao-hero-eyebrow">'+escapeText(options.eyebrow)+'</p><h3 class="kao-hero-title" id="kao-hero-title">'+escapeText(options.title)+'</h3><p class="kao-hero-sub">'+escapeText(options.subtitle)+'</p>'+primaryButton(options.button)+(footHtml?'<div class="kao-hero-foot">'+footHtml+'</div>':'')+'</section>';
  }
  function pathCard(options){
    if(!deps) throw new Error('KAO2-09: görünüm bağımlılıkları kayıtlı değil');
    options=options&&typeof options==='object'?options:{};
    var number=Number(options.percent),pct=Number.isFinite(number)?Math.round(Math.max(0,Math.min(100,number))):0;
    var coverage=Number(options.coverage),hasCoverage=options.coverage!==null&&options.coverage!==undefined&&Number.isFinite(coverage);
    var meta=hasCoverage?'<p class="kao-path-meta">'+escapeText(options.known)+' kelime tanıdık · Kur’an kelimelerinin <span data-countup="'+Math.round(coverage)+'" data-countup-key="kao-coverage">'+Math.round(coverage)+'</span>%’i</p>':'<p class="kao-path-goal">'+escapeText(options.goal)+'</p>';
    var call=actionCall(options.action);
    return '<section class="kao-path-card" aria-labelledby="kao-path-title"><h3 class="kao-section-title" id="kao-path-title">Yolun</h3><div class="kao-path-surface"><p class="kao-path-level">'+escapeText(options.level)+'</p>'+
      '<div class="kao-path-bar" role="progressbar" aria-label="Ünite ilerlemesi" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+pct+'"><span class="kao-path-fill"'+(pct>0?' style="width:'+pct+'%"':'')+'></span></div>'+
      '<p class="kao-path-unit">'+escapeText(options.unit)+'</p>'+meta+
      '<button type="button" class="kao-path-more"'+(call?' onclick="'+call+'"':' disabled')+'><span>Tüm yolu gör</span><span class="kao-group-chevron" aria-hidden="true">›</span></button></div></section>';
  }
  function todayScreen(model){
    if(!deps) throw new Error('KAO2-09: görünüm bağımlılıkları kayıtlı değil');
    model=model&&typeof model==='object'?model:{};
    return '<main class="kao-today-screen" aria-label="Bugün">'+(model.notice?notice(model.notice):'')+heroCard(model.hero)+pathCard(model.path)+groupedList(model.lists)+'</main>';
  }

  // KAO2-11 · S-01 ilk açılış (05 §3) ve 05 §9 "Yeni düzen" notu. Eylemler yalnız actionCall ile üretilir.
  function linkButton(label,action,className){
    var call=actionCall(action);
    return '<button type="button" class="'+className+'"'+(call?' onclick="'+call+'"':' disabled')+'>'+escapeText(label)+'</button>';
  }
  function notice(options){
    if(!deps) throw new Error('KAO2-11: görünüm bağımlılıkları kayıtlı değil');
    options=options&&typeof options==='object'?options:{};
    var items=(Array.isArray(options.items)?options.items:[]).map(function(item){ return '<li class="kao-notice-item">'+escapeText(item)+'</li>'; }).join('');
    var close=options.close&&typeof options.close==='object'?linkButton(options.close.label,options.close.action,'kao-notice-close'):'';
    return '<section class="kao-notice" aria-labelledby="kao-notice-title"><h3 class="kao-notice-title" id="kao-notice-title">'+escapeText(options.title)+'</h3><ul class="kao-notice-list">'+items+'</ul>'+close+'</section>';
  }
  function onboardPoints(items){
    return '<ul class="kao-onboard-points">'+(Array.isArray(items)?items:[]).map(function(item){
      item=item&&typeof item==='object'?item:{};
      return '<li class="kao-onboard-point"><span class="kao-onboard-point-icon" aria-hidden="true">'+deps.icon(String(item.icon||''),18)+'</span><span class="kao-onboard-point-text"><strong>'+escapeText(item.title)+'</strong><span>'+escapeText(item.text)+'</span></span></li>';
    }).join('')+'</ul>';
  }
  function onboardOptions(items){
    return '<div class="kao-onboard-options">'+(Array.isArray(items)?items:[]).map(function(item){
      item=item&&typeof item==='object'?item:{};
      var call=actionCall(item.action);
      return '<button type="button" class="kao-onboard-option"'+(call?' onclick="'+call+'"':' disabled')+'><span class="kao-onboard-option-title">'+escapeText(item.title)+'</span><span class="kao-onboard-option-sub">'+escapeText(item.sub)+'</span></button>';
    }).join('')+'</div>';
  }
  function onboardSeg(options){
    options=options&&typeof options==='object'?options:{};
    var chips=(Array.isArray(options.items)?options.items:[]).map(function(item){
      item=item&&typeof item==='object'?item:{};
      var call=actionCall(item.action);
      return '<button type="button" class="kao-onboard-chip" aria-pressed="'+(item.pressed===true)+'"'+(call?' onclick="'+call+'"':' disabled')+'>'+escapeText(item.label)+'</button>';
    }).join('');
    return '<div class="kao-onboard-field"><p class="kao-onboard-label">'+escapeText(options.label)+'</p><div class="kao-onboard-seg" role="group" aria-label="'+escapeText(options.label)+'">'+chips+'</div>'+(options.hint?'<p class="kao-onboard-hint">'+escapeText(options.hint)+'</p>':'')+'</div>';
  }
  function onboardTask(options){
    options=options&&typeof options==='object'?options:{};
    var choices=(Array.isArray(options.choices)?options.choices:[]).map(function(item){
      item=item&&typeof item==='object'?item:{};
      var call=actionCall(item.action),lang=item.lang==='ar'?' lang="ar" dir="rtl"':'';
      return '<button type="button" class="kao-onboard-choice"'+lang+(call?' onclick="'+call+'"':' disabled')+'>'+escapeText(item.label)+'</button>';
    }).join('');
    var audio=options.audio?'<button type="button" class="kao-onboard-audio"'+(actionCall(options.audio.action)?' onclick="'+actionCall(options.audio.action)+'"':' disabled')+'>'+deps.icon('headphones',17)+' '+escapeText(options.audio.label)+'</button>':'';
    return '<section class="kao-onboard-task" aria-labelledby="kao-onboard-prompt"><p class="kao-onboard-kicker">'+escapeText(options.kicker)+'</p>'+(options.ar?'<p class="kao-onboard-ar" lang="ar" dir="rtl">'+escapeText(options.ar)+'</p>':'')+audio+'<h3 class="kao-onboard-prompt" id="kao-onboard-prompt">'+escapeText(options.prompt)+'</h3><div class="kao-onboard-choices">'+choices+'</div>'+(options.extra?linkButton(options.extra.label,options.extra.action,'kao-onboard-link'):'')+'</section>';
  }
  function onboardScreen(model){
    if(!deps) throw new Error('KAO2-11: görünüm bağımlılıkları kayıtlı değil');
    model=model&&typeof model==='object'?model:{};
    var back=model.back?linkButton('‹ Geri',model.back,'kao-onboard-link'):'<span class="kao-onboard-spacer" aria-hidden="true"></span>';
    var bar='<div class="kao-onboard-bar">'+back+'<span class="kao-onboard-progress">'+escapeText(model.progress)+'</span>'+linkButton('Atla',model.skip,'kao-onboard-link')+'</div>';
    var body=(model.note?'<p class="kao-onboard-note" role="status">'+escapeText(model.note)+'</p>':'')+(model.points?onboardPoints(model.points):'');
    if(model.options) body+=onboardOptions(model.options);
    if(model.task) body+=onboardTask(model.task);
    (Array.isArray(model.fields)?model.fields:[]).forEach(function(field){ body+=field&&field.kind==='switch'?'<div class="kao-onboard-field">'+switchRow(field)+'</div>':onboardSeg(field); });
    return '<main class="kao-onboard" aria-labelledby="kao-onboard-title"><div class="kao-view-head">'+bar+'<h2 class="kao-largetitle-heading" id="kao-onboard-title">'+escapeText(model.title)+'</h2>'+(model.lead?'<p class="kao-onboard-lead">'+escapeText(model.lead)+'</p>':'')+'</div>'+body+(model.primary?primaryButton(model.primary):'')+'</main>';
  }

  // KAO2-10 · 06 §5 hub kartı iç yüzü: tek bilgi + gerçek ünite halkası + eylem kapsülü.
  // Dış düğme motor tarafında kalır; burada etkileşimli öğe ya da tıklama niteliği üretilmez.
  function hubCard(options){
    if(!deps) throw new Error('KAO2-10: görünüm bağımlılıkları kayıtlı değil');
    options=options&&typeof options==='object'?options:{};
    var ring=options.ring&&typeof options.ring==='object'&&Number.isFinite(Number(options.ring.value))?progressRing(options.ring.value,28,options.ring.label):'';
    return '<span class="kao-hub-row"><span class="kao-hub-icon" aria-hidden="true">'+deps.icon('book-open',18)+'</span><span class="kao-hub-text"><span class="kao-hub-title">'+escapeText(options.title)+'</span><span class="kao-hub-sub">'+escapeText(options.subtitle)+'</span></span>'+ring+'</span>'+
      '<span class="kao-hub-cta">'+escapeText(options.action)+' <span aria-hidden="true">›</span></span>';
  }

  window.SeymaQuranLearnViews={version:1,register:register,navBar:navBar,largeTitle:largeTitle,renderScreen:renderScreen,groupedList:groupedList,switchRow:switchRow,progressRing:progressRing,choice:choice,feedbackSheet:feedbackSheet,primaryButton:primaryButton,heroCard:heroCard,pathCard:pathCard,todayScreen:todayScreen,hubCard:hubCard,notice:notice,onboardScreen:onboardScreen};
})(window);
