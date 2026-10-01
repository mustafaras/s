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
    var secondaryCall=options.secondary&&typeof options.secondary==='object'?actionCall(options.secondary.action):'';
    var secondary=secondaryCall?'<button type="button" class="kao-hero-secondary" onclick="'+secondaryCall+'">'+escapeText(options.secondary.label)+'</button>':'';
    return '<section class="kao-hero-card" aria-labelledby="kao-hero-title"><p class="kao-hero-eyebrow">'+escapeText(options.eyebrow)+'</p><h3 class="kao-hero-title" id="kao-hero-title">'+escapeText(options.title)+'</h3><p class="kao-hero-sub">'+escapeText(options.subtitle)+'</p>'+primaryButton(options.button)+secondary+(footHtml?'<div class="kao-hero-foot">'+footHtml+'</div>':'')+'</section>';
  }
  function pathCard(options){
    if(!deps) throw new Error('KAO2-09: görünüm bağımlılıkları kayıtlı değil');
    options=options&&typeof options==='object'?options:{};
    var number=Number(options.percent),pct=Number.isFinite(number)?Math.round(Math.max(0,Math.min(100,number))):0;
    var coverage=Number(options.coverage),hasCoverage=options.coverage!==null&&options.coverage!==undefined&&Number.isFinite(coverage);
    var meta=hasCoverage?'<p class="kao-path-meta">'+escapeText(options.known)+' kelime tanıdık · Kur’an kelimelerinin <span data-countup="'+Math.round(coverage)+'" data-countup-key="kao-coverage">'+Math.round(coverage)+'</span>%’i</p>':'<p class="kao-path-goal">'+escapeText(options.goal)+'</p>';
    var call=actionCall(options.action),moreCall=actionCall(options.moreAction);
    return '<section class="kao-path-card" aria-labelledby="kao-path-title"><h3 class="kao-section-title" id="kao-path-title">Yolun</h3><div class="kao-path-surface"><p class="kao-path-level">'+escapeText(options.level)+'</p>'+
      '<div class="kao-path-bar" role="progressbar" aria-label="Ünite ilerlemesi" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+pct+'"><span class="kao-path-fill"'+(pct>0?' style="width:'+pct+'%"':'')+'></span></div>'+
      '<p class="kao-path-unit">'+escapeText(options.unit)+'</p>'+meta+
      // KAO2-18 (Y-01): birincil eylem içinde bulunulan ÜNİTEyi açar; Yol listesi ikincil kalır.
      (call?'<button type="button" class="kao-path-unit-open" onclick="'+call+'"><span>'+escapeText(options.openLabel||'Üniteyi aç')+'</span><span class="kao-group-chevron" aria-hidden="true">›</span></button>':'')+
      (moreCall?'<button type="button" class="kao-path-more" onclick="'+moreCall+'"><span>Tüm yolu gör</span><span class="kao-group-chevron" aria-hidden="true">›</span></button>':'')+'</div></section>';
  }
  function todayScreen(model){
    if(!deps) throw new Error('KAO2-09: görünüm bağımlılıkları kayıtlı değil');
    model=model&&typeof model==='object'?model:{};
    return '<main class="kao-today-screen" aria-label="Bugün">'+(model.notice?notice(model.notice):'')+heroCard(model.hero)+pathCard(model.path)+groupedList(model.lists)+'</main>';
  }

  // KAO2-13 · S-03: yedi gerçek seviye; S0/S5 ayrı girişler, S6 bilgilendirici.
  function pathScreen(model){
    if(!deps) throw new Error('KAO2-13: görünüm bağımlılıkları kayıtlı değil');
    model=model&&typeof model==='object'?model:{};
    var levels=(Array.isArray(model.levels)?model.levels:[]).map(function(level){
      level=level&&typeof level==='object'?level:{};
      var body='';
      if(level.kind==='units'){
        body='<div class="kao-path-unit-list">'+(Array.isArray(level.units)?level.units:[]).map(function(unit){
          unit=unit&&typeof unit==='object'?unit:{};
          var call=actionCall(unit.action),ring=progressRing(unit.percent,44,unit.ringLabel||unit.title+' ilerlemesi');
          return '<button type="button" class="kao-path-unit-row"'+(unit.current===true?' aria-current="step"':'')+(call?' onclick="'+call+'"':' disabled')+'><span class="kao-path-unit-index">Ünite '+escapeText(unit.id)+'</span><span class="kao-path-unit-copy"><strong>'+escapeText(unit.title)+'</strong><span class="kao-path-unit-promise">'+escapeText(unit.promise)+'</span><span class="kao-path-unit-meta">'+escapeText(unit.progressText)+'</span></span><span class="kao-path-unit-ring">'+ring+'<span aria-hidden="true">›</span></span></button>';
        }).join('')+'</div>';
      }else if(level.kind==='entry'){
        var call=actionCall(level.action),ring=progressRing(level.percent,44,level.ringLabel||level.title+' ilerlemesi');
        var entryContent='<span class="kao-path-entry-copy"><strong>'+escapeText(level.titleText||level.title)+'</strong><span>'+escapeText(level.description)+'</span><span class="kao-path-unit-meta">'+escapeText(level.progressText)+'</span></span><span class="kao-path-entry-side">'+ring+(call?'<span aria-hidden="true">›</span>':'')+'</span>';
        body=call?'<button type="button" class="kao-path-entry-row" onclick="'+call+'">'+entryContent+'</button>':'<div class="kao-path-entry-row is-complete" role="status">'+entryContent+'</div>';
      }else{
        body='<p class="kao-path-note">'+escapeText(level.description)+'</p>';
      }
      return '<section class="kao-path-level-section" aria-labelledby="kao-path-level-'+escapeText(level.id)+'"><h3 id="kao-path-level-'+escapeText(level.id)+'">Seviye '+escapeText(level.id)+' · '+escapeText(level.title)+'</h3>'+body+'</section>';
    }).join('');
    return '<main class="kao-path-screen" aria-label="Öğrenme yolu"><div class="kao-view-head"><div><p class="kao-eyebrow">Yolun</p><h2 class="kao-largetitle-heading" id="kao-path-title">Öğrenme yolu</h2><p class="kao-path-intro">Önerilen üniteyi izle ya da istediğin durağı aç.</p></div></div><div class="kao-path-levels">'+levels+'</div></main>';
  }

  // KAO2-13 · S-04: ders listesi durumları salt okunur; tek belirgin eylem sıradaki derstir.
  function unitScreen(model){
    if(!deps) throw new Error('KAO2-13: görünüm bağımlılıkları kayıtlı değil');
    model=model&&typeof model==='object'?model:{};
    var ring=progressRing(model.percent,44,model.title+' ders ilerlemesi');
    var lessons=(Array.isArray(model.lessons)?model.lessons:[]).map(function(lesson){
      lesson=lesson&&typeof lesson==='object'?lesson:{};
      var status=lesson.done===true?'done':(lesson.current===true?'current':'upcoming'),mark=status==='done'?'✓':(status==='current'?'●':'○');
      // KAO2-18 (Y-03): dersin hedef cümlesi listede görünür (onaylıysa).
      var goal=lesson.goal?'<span class="kao-unit-step-goal">'+escapeText(lesson.goal)+'</span>':'';
      return '<li class="kao-unit-step kao-unit-step-'+status+'"'+(lesson.current===true?' aria-current="step"':'')+'><span class="kao-unit-step-mark" aria-hidden="true">'+mark+'</span><span class="kao-unit-step-body"><span class="kao-unit-step-title">'+escapeText(lesson.title)+'</span>'+goal+'</span><span class="kao-sr-only">'+escapeText(status==='done'?'Tamamlandı':(status==='current'?'Sıradaki ders':'Sırada'))+'</span></li>';
    }).join('');
    var concepts=(Array.isArray(model.concepts)?model.concepts:[]).map(function(item){
      if(!item||typeof item!=='object') return '<li>'+escapeText(item)+'</li>';
      var call=actionCall({name:'kaoNav',args:['concept',item.id]});
      return '<li><button type="button" class="kao-unit-concept"'+(call?' onclick="'+call+'"':' disabled')+'><span>'+escapeText(item.title)+'</span><span class="kao-group-chevron" aria-hidden="true">›</span></button></li>';
    }).join('');
    var wordList=Array.isArray(model.words)?model.words:[],words=wordList.map(function(word){
      word=word&&typeof word==='object'?word:{};
      return '<li class="kao-unit-word"><span class="kao-unit-word-ar" lang="ar" dir="rtl">'+escapeText(word.ar)+'</span><span class="kao-unit-word-reading" lang="tr" dir="ltr">'+escapeText(word.pronunciation)+'</span><span class="kao-unit-word-meaning">'+escapeText(word.meaning)+'</span><span class="kao-unit-word-status">'+escapeText(word.status)+'</span></li>';
    }).join('');
    var mastery=model.mastery&&typeof model.mastery==='object'?model.mastery:null,masteryStates=['locked','current','repair','passed','skipped'];
    var masterySection=mastery?'<section class="kao-unit-section kao-unit-mastery" data-mastery-state="'+escapeText(masteryStates.indexOf(mastery.state)>=0?mastery.state:'locked')+'" aria-labelledby="kao-unit-mastery-title"><h3 id="kao-unit-mastery-title">Ustalık</h3><p class="kao-unit-mastery-row"><span class="kao-unit-step-mark" aria-hidden="true">'+escapeText(mastery.mark)+'</span><span class="kao-unit-mastery-label">'+escapeText(mastery.label)+'</span><span class="kao-unit-mastery-detail">'+escapeText(mastery.detail)+'</span></p></section>':'';
    var primary=model.action?primaryButton({label:model.actionLabel,action:model.action}):'';
    var completion=model.completed?'<p class="kao-unit-complete" role="status">Bu ünitedeki dersler tamamlandı.</p>':'';
    return '<main class="kao-unit-screen" aria-labelledby="kao-unit-title"><div class="kao-view-head"><div><p class="kao-eyebrow">Seviye '+escapeText(model.level)+' · '+escapeText(model.levelTitle)+'</p><h2 class="kao-largetitle-heading" id="kao-unit-title">'+escapeText(model.title)+'</h2><p class="kao-unit-promise"><span>Bitirince</span> '+escapeText(model.promise)+'</p></div></div><section class="kao-unit-progress" aria-label="Ünite ilerlemesi"><span>'+ring+'</span><p>'+escapeText(model.wordsKnown)+' / '+escapeText(model.wordsTotal)+' kelime · '+escapeText(model.lessonsDone)+' / '+escapeText(model.lessonsTotal)+' ders</p></section>'+primary+completion+'<section class="kao-unit-section" aria-labelledby="kao-unit-steps-title"><h3 id="kao-unit-steps-title">Dersler</h3><ol class="kao-unit-steps">'+lessons+'</ol></section>'+masterySection+'<section class="kao-unit-section" aria-labelledby="kao-unit-concepts-title"><h3 id="kao-unit-concepts-title">Kavramlar</h3><ul class="kao-unit-concepts">'+concepts+'</ul></section><details class="kao-unit-words"><summary><span>Kelimeler · '+escapeText(wordList.length)+'</span><span aria-hidden="true">›</span></summary><ol class="kao-unit-word-list">'+words+'</ol></details><p class="kao-unit-anchor"><span>Çapa metin</span> · '+escapeText(model.anchor)+'</p></main>';
  }

  // KAO2-12 · Kaynakları motor seçer; bu katman yalnız güvenli metin ve App eylemi çizer.
  function lessonScreen(model){
    if(!deps) throw new Error('KAO2-12: görünüm bağımlılıkları kayıtlı değil');
    model=model&&typeof model==='object'?model:{};
    var title=escapeText(model.title),label=escapeText(model.progress),call=actionCall(model.action),exit=actionCall(model.exit),body='';
    // KAO2-18 (Y-02): kullanıcı hangi ünitenin kaçıncı dersinde olduğunu görmeli.
    var ctx=model.context?'<p class="kao-lesson-context">'+escapeText(model.context)+'</p>':'';
    var top='<header class="kao-lesson-head"><span class="kao-lesson-step">'+label+'</span><button type="button" class="kao-lesson-exit"'+(exit?' onclick="'+exit+'"':' disabled')+' aria-label="Dersi kapat">Kapat</button></header>'+ctx;
    if(model.stage==='intro'){
      var anchor=(Array.isArray(model.anchor)?model.anchor:[]).map(function(word){
        word=word&&typeof word==='object'?word:{};
        var state=['new','known','open'].indexOf(word.state)>=0?word.state:'open';
        return '<span class="kao-lesson-anchor-word kao-lesson-anchor-'+state+'" lang="ar" dir="rtl"><b>'+escapeText(word.ar)+'</b><small>'+escapeText(word.tr)+'</small></span>';
      }).join('');
      var audio=model.audio&&typeof model.audio==='object'?model.audio:null,audioCall=audio?actionCall(audio.action):'';
      body='<section class="kao-lesson-card kao-lesson-intro" aria-labelledby="kao-lesson-title"><p class="kao-lesson-kicker">Yeni kelime · '+escapeText(model.ordinal)+' / '+escapeText(model.total)+'</p><p class="kao-lesson-ar" lang="ar" dir="rtl">'+escapeText(model.ar)+'</p><p class="kao-lesson-reading" lang="tr">'+escapeText(model.pronunciation)+'</p>'+(audio?'<button type="button" class="kao-lesson-audio"'+(audioCall?' onclick="'+audioCall+'"':' disabled')+'>'+deps.icon('headphones',17)+' Dinle</button>':'')+'<h3 id="kao-lesson-title">'+escapeText(model.meaning)+'</h3>'+(model.cognate?'<p class="kao-lesson-cognate">Türkçedeki akrabası: '+escapeText(model.cognate)+'</p>':'')+(model.anchorTitle?'<section class="kao-lesson-anchor"><h4>'+escapeText(model.anchorTitle)+'</h4><div class="kao-lesson-anchor-words">'+anchor+'</div></section>':'')+'</section>';
    }else if(model.stage==='concept'){
      var table=model.table&&typeof model.table==='object'?model.table:{},columns=Array.isArray(table.columns)?table.columns:[],rows=Array.isArray(table.rows)?table.rows:[];
      var head=columns.map(function(column){ return '<th scope="col">'+escapeText(typeof column==='object'?(column.label||column.title||''):column)+'</th>'; }).join('');
      var rowHtml=rows.map(function(row){
        var cells=Array.isArray(row.cells)?row.cells:[];
        if(row.label!==undefined) cells=[row.label].concat(cells);
        return '<tr>'+cells.map(function(cell){ return '<td>'+escapeText(Array.isArray(cell)?(cell[0]||cell[1]||''):(cell&&typeof cell==='object'?(cell.label||cell.text||''):cell))+'</td>'; }).join('')+'</tr>';
      }).join('');
      body='<section class="kao-lesson-card kao-lesson-concept" aria-labelledby="kao-lesson-title"><p class="kao-lesson-kicker">Kavram</p><h3 id="kao-lesson-title">'+title+'</h3><p>'+escapeText(model.plainTr)+'</p>'+(head||rowHtml?'<div class="kao-lesson-table-wrap"><table class="kao-lesson-table"><thead><tr>'+head+'</tr></thead><tbody>'+rowHtml+'</tbody></table></div>':'')+(model.termTr?'<details class="kao-lesson-term"><summary>Terimlere bak</summary><p>'+escapeText(model.termTr)+'</p></details>':'')+'</section>';
    }else if(model.stage==='apply'){
      var words=(Array.isArray(model.words)?model.words:[]).map(function(word){
        word=word&&typeof word==='object'?word:{};
        var state=['new','known','open'].indexOf(word.state)>=0?word.state:'open';
        return '<li class="kao-lesson-apply-word kao-lesson-apply-'+state+'"><span lang="ar" dir="rtl">'+escapeText(word.ar)+'</span><span>'+escapeText(word.tr)+'</span></li>';
      }).join('');
      body='<section class="kao-lesson-card kao-lesson-apply" aria-labelledby="kao-lesson-title"><p class="kao-lesson-kicker">Çapa metni</p><h3 id="kao-lesson-title">'+title+'</h3><p>'+escapeText(model.lead)+'</p><ol class="kao-lesson-apply-list">'+words+'</ol></section>';
    }else if(model.stage==='summary'){
      var learned=(Array.isArray(model.learnedWords)?model.learnedWords:[]).slice(0,10).map(function(word){
        word=word&&typeof word==='object'?word:{};
        return '<li class="kao-lesson-summary-word kao-lesson-apply-word"><span lang="ar" dir="rtl">'+escapeText(word.ar)+'</span><span>'+escapeText(word.meaning)+'</span></li>';
      }).join('');
      var accuracy=model.accuracy!==null&&Number.isFinite(Number(model.accuracy))?'<p class="kao-lesson-summary-accuracy"><strong>%'+escapeText(model.accuracy)+'</strong> doğruluk · '+escapeText(model.accuracyDetail)+'</p>':'<p class="kao-lesson-summary-accuracy">'+escapeText(model.accuracyDetail||'Pekiştirme yanıtı kaydı yok')+'</p>';
      var more=Number(model.learnedMore)>0?'<p class="kao-lesson-summary-more">ve '+escapeText(model.learnedMore)+' daha</p>':'';
      var words=learned?'<ol class="kao-lesson-apply-list">'+learned+'</ol>'+more:'<p class="kao-lesson-summary-empty">Bu oturumda yeni kelime tanıtılmadı.</p>';
      var durable=model.durable?'<p class="kao-lesson-summary-durable">'+escapeText(model.durable)+'</p>':'';
      var milestone=model.milestone?'<p class="kao-lesson-cognate">Bir kilometre taşını tamamladın: '+escapeText(model.milestone)+'.</p>':'';
      var next=model.nextStep&&typeof model.nextStep==='object'?model.nextStep:null;
      var nextHtml=next?'<section class="kao-lesson-anchor kao-lesson-summary-next" aria-labelledby="kao-lesson-summary-next-title"><h4 id="kao-lesson-summary-next-title">Sıradaki adım</h4><p>'+escapeText(next.title)+'</p><p>'+escapeText(next.subtitle)+'</p></section>':'';
      body='<section class="kao-lesson-card kao-lesson-summary" aria-labelledby="kao-lesson-title" aria-live="polite"><p class="kao-lesson-kicker">Ders tamamlandı</p><h3 id="kao-lesson-title">'+title+'</h3><section class="kao-lesson-anchor kao-lesson-summary-learned" aria-labelledby="kao-lesson-summary-learned-title"><h4 id="kao-lesson-summary-learned-title">Bu derste tanıştıkların</h4>'+words+accuracy+durable+'</section><section class="kao-lesson-anchor kao-lesson-summary-tomorrow" aria-labelledby="kao-lesson-summary-tomorrow-title"><h4 id="kao-lesson-summary-tomorrow-title">Yarın</h4><p>'+escapeText(model.tomorrowText)+'</p></section>'+nextHtml+milestone+'</section>';
    }else{
      var goalLine=model.goal?'<p class="kao-lesson-goal-line">'+escapeText(model.goal)+'</p>':'';
      body='<section class="kao-lesson-card kao-lesson-goal" aria-labelledby="kao-lesson-title"><p class="kao-lesson-kicker">Bugünün dersi</p><h3 id="kao-lesson-title">'+title+'</h3>'+goalLine+'<p>'+escapeText(model.promise)+'</p></section>';
    }
    var buttonLabel=escapeText(model.buttonLabel||'Devam');
    var secondaryCall=actionCall(model.secondaryAction),secondary=model.secondaryAction?'<button type="button" class="kao-lesson-audio kao-lesson-more"'+(secondaryCall?' onclick="'+secondaryCall+'"':' disabled')+'>'+escapeText(model.secondaryLabel||'5 dakika daha')+'</button>':'';
    return '<main class="kao-lesson" data-lesson-stage="'+escapeText(model.stage)+'" aria-label="Ders oynatıcı">'+top+'<div class="kao-lesson-progress" role="progressbar" aria-label="Ders adımı" aria-valuemin="1" aria-valuemax="'+escapeText(model.stepTotal||1)+'" aria-valuenow="'+escapeText(model.step||1)+'"><span style="width:'+String(Math.max(0,Math.min(100,Number(model.percent)||0)))+'%"></span></div>'+body+(model.actions?model.actions:'')+'<button type="button" class="kao-primary kao-lesson-next"'+(call?' onclick="'+call+'"':' disabled')+'>'+buttonLabel+'</button>'+secondary+'</main>';
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

  // KAO2-15 · S-10: 25 kavramlık kütüphane. Liste ünite sırasıyla; kavram sayfası
  // günlük Türkçe önce, terim ve tablo isteğe bağlı ayrıntı olarak gelir.
  function grammarTable(table){
    table=table&&typeof table==='object'?table:{};
    var columns=Array.isArray(table.columns)?table.columns:[],rows=Array.isArray(table.rows)?table.rows:[];
    function cell(value){
      if(Array.isArray(value)){ var reading=escapeText(value[2]); return '<span class="kao-grammar-ar" lang="ar" dir="rtl">'+escapeText(value[1])+'</span>'+(reading?'<span class="kao-grammar-reading" lang="tr" dir="ltr">'+reading+'</span>':''); }
      return escapeText(value);
    }
    var head=columns.length?'<tr>'+columns.map(function(column){ return '<th scope="col">'+escapeText(column)+'</th>'; }).join('')+'</tr>':'';
    var body=rows.map(function(row){
      row=row&&typeof row==='object'?row:{};
      var cells=Array.isArray(row.cells)?row.cells:[],out=[];
      if(row.label!==undefined) out.push('<th scope="row">'+cell(row.label)+'</th>');
      cells.forEach(function(value){ out.push('<td>'+cell(value)+'</td>'); });
      return '<tr>'+out.join('')+'</tr>';
    }).join('');
    return '<div class="kao-grammar-table-wrap"><table class="kao-grammar-table"><thead>'+head+'</thead><tbody>'+body+'</tbody></table></div>';
  }
  function grammarScreen(model){
    if(!deps) throw new Error('KAO2-15: görünüm bağımlılıkları kayıtlı değil');
    model=model&&typeof model==='object'?model:{};
    var groups=(Array.isArray(model.groups)?model.groups:[]).map(function(group){
      group=group&&typeof group==='object'?group:{};
      var rows=(Array.isArray(group.concepts)?group.concepts:[]).map(function(item){
        item=item&&typeof item==='object'?item:{};
        var call=actionCall(item.action);
        return '<li><button type="button" class="kao-grammar-row"'+(call?' onclick="'+call+'"':' disabled')+'><span class="kao-grammar-row-title">'+escapeText(item.title)+'</span><span class="kao-grammar-row-plain">'+escapeText(item.plainTr)+'</span><span class="kao-group-chevron" aria-hidden="true">›</span></button></li>';
      }).join('');
      return '<section class="kao-grammar-group" data-unit="'+escapeText(group.id)+'" aria-labelledby="kao-grammar-unit-'+escapeText(group.id)+'"><h3 id="kao-grammar-unit-'+escapeText(group.id)+'">'+escapeText(group.label)+'</h3><ul class="kao-grammar-unit">'+rows+'</ul></section>';
    }).join('');
    return '<main class="kao-grammar" aria-label="Gramer notları"><div class="kao-view-head"><div><p class="kao-eyebrow">Keşfet</p><h2 class="kao-largetitle-heading" id="kao-grammar-title">Gramer notları</h2><p class="kao-grammar-intro">'+escapeText(model.intro)+'</p></div></div><div class="kao-grammar-list">'+groups+'</div></main>';
  }
  function grammarConceptScreen(model){
    if(!deps) throw new Error('KAO2-15: görünüm bağımlılıkları kayıtlı değil');
    model=model&&typeof model==='object'?model:{};
    var examples=(Array.isArray(model.tables)?model.tables:[]).map(function(table){
      table=table&&typeof table==='object'?table:{};
      return '<section class="kao-grammar-example"><h4>'+escapeText(table.title)+'</h4>'+grammarTable(table)+'</section>';
    }).join('');
    var worked=model.workedTr?'<p class="kao-grammar-worked"><span>Çözümlü örnek</span> '+escapeText(model.workedTr)+'</p>':'';
    var lessons=(Array.isArray(model.lessons)?model.lessons:[]).map(function(item){
      item=item&&typeof item==='object'?item:{};
      var call=actionCall(item.action);
      return '<li><button type="button" class="kao-grammar-lesson"'+(call?' onclick="'+call+'"':' disabled')+'><span>'+escapeText(item.title)+'</span><span class="kao-group-chevron" aria-hidden="true">›</span></button></li>';
    }).join('');
    return '<main class="kao-grammar-concept" aria-labelledby="kao-grammar-title"><div class="kao-view-head"><div><p class="kao-eyebrow">Gramer</p><h2 class="kao-largetitle-heading" id="kao-grammar-title">'+escapeText(model.title)+'</h2><p class="kao-grammar-plain">'+escapeText(model.plainTr)+'</p>'+worked+'</div></div>'+examples+(model.termTr?'<details class="kao-grammar-term"><summary>Terimlere bak</summary><p>'+escapeText(model.termTr)+'</p></details>':'')+(lessons?'<section class="kao-grammar-lessons" aria-labelledby="kao-grammar-lessons-title"><h3 id="kao-grammar-lessons-title">Bu kavramın geçtiği dersler</h3><ul>'+lessons+'</ul></section>':'')+'</main>';
  }

  window.SeymaQuranLearnViews={version:1,register:register,navBar:navBar,largeTitle:largeTitle,renderScreen:renderScreen,groupedList:groupedList,switchRow:switchRow,progressRing:progressRing,choice:choice,feedbackSheet:feedbackSheet,primaryButton:primaryButton,heroCard:heroCard,pathCard:pathCard,todayScreen:todayScreen,pathScreen:pathScreen,unitScreen:unitScreen,hubCard:hubCard,notice:notice,onboardScreen:onboardScreen,lessonScreen:lessonScreen,grammarScreen:grammarScreen,grammarConceptScreen:grammarConceptScreen};
})(window);
