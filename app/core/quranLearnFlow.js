(function(window){
  'use strict';

  var VIEWS={home:true,units:true,word:true,reader:true,settings:true,phonics:true,ayah:true,map:true,prayer:true,stats:true,gate:true,session:true,grammar:true,roots:true,s0:true,sources:true};

  function entry(view,param,title){
    if(typeof view!=='string'||!VIEWS[view]) return null;
    if(param!==null&&param!==undefined&&typeof param!=='string'&&typeof param!=='number') return null;
    return {view:view,param:param===undefined?null:param,title:typeof title==='string'?title:''};
  }
  function home(title){ return {view:'home',param:null,title:typeof title==='string'&&title?title:"Kur'an Arapçası"}; }
  function createStack(homeTitle){ return [home(homeTitle)]; }
  function normalize(stack,homeTitle){
    var root=home(homeTitle),result=[root];
    if(!Array.isArray(stack)) return result;
    for(var i=0;i<stack.length;i+=1){
      var item=stack[i],normalized=item&&entry(item.view,item.param,item.title);
      if(!normalized) continue;
      if(normalized.view==='home'){
        if(result.length===1&&normalized.title) result[0]=normalized;
      }else result.push(normalized);
    }
    return result;
  }
  function openStack(view,param,title,homeTitle){
    var result=createStack(homeTitle),next=entry(view,param,title);
    if(next&&next.view!=='home') result.push(next);
    return result;
  }
  function push(stack,view,param,title,homeTitle){
    var result=normalize(stack,homeTitle),next=entry(view,param,title);
    if(next&&next.view!=='home') result.push(next);
    return result;
  }
  function reset(view,param,title,homeTitle){ return openStack(view,param,title,homeTitle); }
  function replaceTop(stack,view,param,title,homeTitle){
    var result=normalize(stack,homeTitle),next=entry(view,param,title);
    if(!next) return result;
    if(next.view==='home') return createStack(homeTitle);
    if(result.length===1) result.push(next); else result[result.length-1]=next;
    return result;
  }
  function current(stack,homeTitle){
    var result=normalize(stack,homeTitle);
    return result[result.length-1];
  }
  function previous(stack,homeTitle){
    var result=normalize(stack,homeTitle);
    return result.length>1?result[result.length-2]:null;
  }
  function back(stack,homeTitle){
    var result=normalize(stack,homeTitle);
    if(result.length<2) return {stack:result,entry:result[0],changed:false};
    result=result.slice(0,-1);
    return {stack:result,entry:result[result.length-1],changed:true};
  }

  // KAO2-08: saf müfredat ilerlemesi ve "sıradaki adım" (05 §4). Girdiler salt
  // okunur; saat yalnız parametre olarak gelir, bu dosya hiçbir durum yazmaz.
  var DAY_MS=86400000,REVIEW_CAP=20,DEBT_LIMIT=60,WARMUP_GAP_DAYS=7,WARMUP_CARDS=10;
  var MIN_PER_TASK=0.55,SETTLED_STABILITY=7,MASTERY_MINUTES=4,REPAIR_MINUTES=3,S0_MINUTES=5;
  var curriculumCache={source:null,value:null};

  function obj(value){ return value&&typeof value==='object'&&!Array.isArray(value)?value:{}; }
  function num(value,fallback){ return typeof value==='number'&&isFinite(value)?value:fallback; }
  function pad2(n){ return String(n).padStart(2,'0'); }
  function dayKey(date){ return date.getFullYear()+'-'+pad2(date.getMonth()+1)+'-'+pad2(date.getDate()); }
  function dayStart(key){ var p=key.split('-'); return new Date(Number(p[0]),Number(p[1])-1,Number(p[2])).getTime(); }
  function checkNow(now){
    if(!now||typeof now.getTime!=='function'||!isFinite(now.getTime())) throw new TypeError('KAO2-08: now geçerli bir tarih olmalı');
    return now;
  }
  function cardFor(q,lemmaId){ var card=obj(q.cards)['w:'+lemmaId+':ar>tr']; return card&&typeof card==='object'&&card.orphan!==true?card:null; }
  function isSettled(card){
    return !!card&&(card.state==='review'||card.st==='review')&&num(card.s,0)>=SETTLED_STABILITY&&card.readerUnknown!==true;
  }
  function lessonRecord(q,lessonId){ return obj(obj(obj(q).path).lessons)[lessonId]; }

  function curriculum(content){
    var source=content&&content.curriculum;
    if(!source||!Array.isArray(source.units)) throw new Error('KAO2-08: müfredat içeriği yok');
    if(curriculumCache.source===source) return curriculumCache.value;
    var lessonById={},unitOfLesson={},s0=source.s0&&Array.isArray(source.s0.lessons)?source.s0.lessons:[];
    source.units.forEach(function(unit){ unit.lessons.forEach(function(lesson){ lessonById[lesson.id]=lesson; unitOfLesson[lesson.id]=unit.id; }); });
    s0.forEach(function(lesson){ lessonById[lesson.id]=lesson; });
    var value={units:source.units,s0:s0,lessonById:lessonById,unitOfLesson:unitOfLesson,lemmaToLesson:obj(source.lemmaToLesson)};
    curriculumCache={source:source,value:value};
    return value;
  }
  function lessonOf(content,lemmaId){
    var map=curriculum(content).lemmaToLesson;
    return Object.prototype.hasOwnProperty.call(map,lemmaId)?map[lemmaId]:null;
  }
  function introduced(q,lemmaId,lessonId){
    var card=obj(obj(q).cards)['w:'+lemmaId+':ar>tr'];
    var record=lessonId?obj(lessonRecord(q,lessonId)):{};
    return !!((Array.isArray(record.introducedLemmas)&&record.introducedLemmas.indexOf(lemmaId)>=0)||(card&&(card.introducedAt||card.firstSeenAt||card.r||num(card.reps,0)>0||['learning','review','relearning'].indexOf(card.state)>=0||['learning','review','relearning'].indexOf(card.st)>=0)));
  }
  function audioAvailable(content,lemmaId){
    var available=obj(content&&content.audioLemmas);
    return available[lemmaId]===true;
  }
  function applyWords(lesson,content,q,fresh){
    var source=content&&content.shorts,apply=obj(lesson.apply),words=[];
    if(source&&apply.kind==='prayer'&&Array.isArray(source.prayerTexts)){
      var prayer=source.prayerTexts.find(function(item){ return item.id===apply.ref; });
      words=prayer&&Array.isArray(prayer.words)?prayer.words:[];
    }else if(source&&apply.kind==='surah'&&Array.isArray(source.words)){
      words=source.words.filter(function(item){ return Number(item.surahId)===Number(apply.ref); });
    }else if(source&&apply.kind==='lemma-pool'){
      var lex=content.lexicon,ids=Array.isArray(lesson.lemmaIds)?lesson.lemmaIds:[];
      words=ids.map(function(id){ return lex&&typeof lex.byId==='function'?lex.byId(id):null; }).filter(Boolean).map(function(item){ return {ar:item.ar,tr:(item.meanings||[])[0]||'',lemmaId:item.id,pronunciation:item.translit}; });
    }
    var qRoot=obj(q),freshSet=Object.create(null);
    fresh.forEach(function(id){ freshSet[id]=true; });
    // K2F-24 (K3-02): namaz metnindeki lp_* kelimesi, araçla üretilmiş muhafazakâr eşlemede (curriculum.prayerLemmaMap) bir l_* lemmasına
    // bağlıysa durumu o lemmadan türer; eşlenmeyen kelime open kalır. lemmaId aynen korunur, eşlenen kimlik mappedLemmaId'de taşınır.
    var prayerMap=obj(obj(content&&content.curriculum).prayerLemmaMap);
    return words.map(function(word){
      var lemmaId=typeof word.lemmaId==='string'?word.lemmaId:'',mapped=typeof prayerMap[lemmaId]==='string'?prayerMap[lemmaId]:'',stateId=mapped||lemmaId,isNew=!!(stateId&&freshSet[stateId]);
      var out={ar:String(word.ar||''),tr:String(word.tr||''),lemmaId:lemmaId,pronunciation:String(word.pronunciation||''),state:isNew?'new':(stateId&&introduced(qRoot,stateId,lesson.id)?'known':'open')};
      if(mapped) out.mappedLemmaId=mapped;
      return out;
    });
  }
  // K2F-23 (K3-01): çapa metni olmayan derste "Uygula" adımı dersin lemmalarının doğrulanmış ilk örnek cümlesiyle dolar
  // (önce yeni lemmalar, en çok 3). Arapça, okunuş ve çeviri yalnız lexicon `examples[0]`'dan gelir; doğrulanmamış örnek kullanılmaz.
  var APPLY_SENTENCE_MAX=3;
  function applySentences(content,fresh,eligible){
    var lex=content&&content.lexicon,order=fresh.concat(eligible.filter(function(id){ return fresh.indexOf(id)<0; })),out=[];
    for(var i=0;i<order.length&&out.length<APPLY_SENTENCE_MAX;i+=1){
      var lemma=lex&&typeof lex.byId==='function'?lex.byId(order[i]):null,source=lemma&&lemma.verified===true&&Array.isArray(lemma.examples)?lemma.examples[0]:null;
      if(!source||!source.ar||!source.tr||!source.ref||!source.pronunciation) continue;
      out.push({lemmaId:lemma.id,ar:String(source.ar),pronunciation:String(source.pronunciation),tr:String(source.tr),ref:String(source.ref),lemmaPronunciation:String(lemma.translit||'')});
    }
    return out;
  }
  // KAO2-12: tek dersin kaynak-bağlı sırası. İçerik ve veri salt okunur; bütün Arapça lexicon/anchor kaynaklarından gelir.
  // K2F-20 (A-6): ders içerikleri yeniden dağıtılabilir; tamamlanmış (doneAt) bir derse sonradan taşınan ve hiç tanışılmamış
  // kelimeler kaybolmasın diye SIRADAKİ dersin planına eklenir. Tamamlanmış ders tamamlanmış kalır, kart verisine dokunulmaz.
  // K2F-21: onaylanmamış (draft) ders başlığı plana sızmaz; kimlikten türetilen güvenli başlık kullanılır.
  function safeLessonTitle(lesson){
    var level=obj(lesson&&lesson.review).level,m=/^u0*(\d+)\.0*(\d+)$/.exec(String(lesson&&lesson.id||''));
    if(level==='sourced'||level==='expert'||!m) return String(lesson&&lesson.title||'');
    return 'Ünite '+m[1]+' · Ders '+m[2];
  }
  function carryOver(q,cur,lesson,content){
    var current=currentUnit(q,content),next=current&&current.progress&&current.progress.nextLesson;
    if(!next||next.id!==lesson.id||obj(lessonRecord(q,lesson.id)).doneAt) return [];
    var out=[],found=false;
    cur.units.forEach(function(unit){
      unit.lessons.forEach(function(prior){
        if(found) return;
        if(prior.id===lesson.id){ found=true; return; }
        if(!obj(lessonRecord(q,prior.id)).doneAt) return;
        (Array.isArray(prior.lemmaIds)?prior.lemmaIds:[]).forEach(function(id){
          if(typeof id==='string'&&id&&out.indexOf(id)<0&&!introduced(q,id,prior.id)) out.push(id);
        });
      });
    });
    return found?out:[];
  }
  function lessonPlan(snapshot,lessonId,now,content){
    checkNow(now);
    var snap=obj(snapshot),q=obj(snap.quranLearn),c=content||{},cur=curriculum(c),lesson=cur.lessonById[String(lessonId)];
    if(!lesson) return null;
    var own=Array.isArray(lesson.lemmaIds)?lesson.lemmaIds.filter(function(id){ return typeof id==='string'&&id; }):[],ids=own.concat(carryOver(q,cur,lesson,c).filter(function(id){ return own.indexOf(id)<0; })),settings=obj(q.settings),budget=Math.max(0,Math.floor(num(settings.dailyNew,10))),fresh=[],record=obj(lessonRecord(q,lesson.id)),resume=obj(record.resume),resumeIntro=String(resume.itemId||'');
    ids.forEach(function(id){ if(resumeIntro==='intro:'+id){ fresh.push(id); return; } if(!introduced(q,id,lesson.id)&&fresh.length<budget) fresh.push(id); });
    var eligible=ids.filter(function(id){ return introduced(q,id,lesson.id)||fresh.indexOf(id)>=0; });
    var lex=c.lexicon,grammar=c.grammar,lemmas=eligible.map(function(id){ return lex&&typeof lex.byId==='function'?lex.byId(id):null; }).filter(Boolean);
    var concept=lesson.conceptId&&grammar&&typeof grammar.byId==='function'?grammar.byId(lesson.conceptId):null;
    var templates=concept&&Array.isArray(concept.templates)?concept.templates:[];
    var items=[{id:'goal:'+lesson.id,kind:'goal',lessonId:lesson.id,title:safeLessonTitle(lesson),lemmaIds:eligible.slice(),newLemmaIds:fresh.slice(),apply:lesson.apply||null}];
    fresh.forEach(function(id,index){
      var lemma=lex&&typeof lex.byId==='function'?lex.byId(id):null;
      if(!lemma) return;
      var anchorWords=applyWords(lesson,c,q,fresh),anchor=anchorWords.find(function(word){ return word.lemmaId===id||word.mappedLemmaId===id; })||null;
      items.push({id:'intro:'+id,kind:'intro',lessonId:lesson.id,lemmaId:id,lemma:lemma,ordinal:index+1,total:fresh.length,anchor:anchor,applyRef:lesson.apply||null});
    });
    if(concept) items.push({id:'concept:'+concept.id,kind:'concept',lessonId:lesson.id,concept:concept});

    var practice=[],makeWord=function(id,direction,mode){
      var audio=mode===true,suffix=direction==='tr>ar'?'tr>ar':'ar>tr';
      var card=obj(obj(q.cards)['w:'+id+':ar>tr']);
      return {id:'practice:'+lesson.id+':'+id+':'+(audio?'audio':suffix),kind:'practice',group:'lemma',lessonId:lesson.id,lemmaId:id,cardId:'w:'+id+':'+suffix,type:direction==='tr>ar'?'arabic':'meaning',direction:audio?'audio>meaning':direction,choiceCount:0,audioOnly:audio,isNew:!num(card.reps,0)};
    };
    eligible.forEach(function(id){ practice.push(makeWord(id,'ar>tr',false)); });
    var hasAudio=eligible.filter(function(id){ return audioAvailable(c,id); }),conceptCount=Math.min(templates.length,4,Math.max(0,10-practice.length-(hasAudio.length?2:1)));
    var grammarItems=templates.slice(0,conceptCount).map(function(template){
      return {id:'practice:'+lesson.id+':'+concept.id+':'+template.id,kind:'practice',group:'concept',lessonId:lesson.id,conceptId:concept.id,cardId:'g:'+concept.id+':'+template.id,type:'grammar',templateId:template.id,choiceCount:4,isNew:false};
    });
    var budgetLeft=Math.max(0,10-practice.length-grammarItems.length),audioCount=hasAudio.length?Math.min(hasAudio.length,Math.max(1,Math.floor(budgetLeft/2))):0;
    var reverseCount=Math.min(eligible.length,Math.max(0,budgetLeft-audioCount));
    if(hasAudio.length&&budgetLeft-audioCount<1&&budgetLeft>1) audioCount=Math.max(1,audioCount-1),reverseCount=Math.min(eligible.length,budgetLeft-audioCount);
    hasAudio.slice(0,audioCount).forEach(function(id){ practice.push(makeWord(id,'ar>tr',true)); });
    eligible.slice(0,reverseCount).forEach(function(id){ practice.push(makeWord(id,'tr>ar',false)); });
    // K2F-11 (K4-04): aynı gramer türü ardışık gelmez. Önce türler açgözlüyle yayılır (özgün sıra eşitlikte korunur); yine de
    // bitişik kalan çiftler için kelime alıştırmasının bir kısmı araya konur (en fazla bitişik çift sayısı kadar, ilk öğe sabit).
    var typeOfGrammar=function(item){ var found=templates.find(function(entry){ return entry.id===item.templateId; }); return found?String(found.type):''; };
    var spread=[],pool=grammarItems.slice(),adjacent=0;
    while(pool.length){
      var at=pool.findIndex(function(item){ return !spread.length||typeOfGrammar(item)!==typeOfGrammar(spread[spread.length-1]); });
      if(at<0){ at=0; adjacent+=1; }
      spread.push(pool.splice(at,1)[0]);
    }
    var separators=practice.length>adjacent+1?practice.splice(practice.length-adjacent,adjacent):[];
    spread.forEach(function(item,index){
      if(index>0&&typeOfGrammar(item)===typeOfGrammar(spread[index-1])&&separators.length) practice.push(separators.shift());
      practice.push(item);
    });
    practice=practice.concat(separators);
    if(practice.length<6){
      var repeatIndex=0;
      while(practice.length<6&&eligible.length){ practice.push(makeWord(eligible[repeatIndex%eligible.length],'tr>ar',false)); repeatIndex+=1; }
    }
    practice=practice.slice(0,10);
    practice.forEach(function(item,index){ item.choiceCount=index===0?2:4; });
    items=items.concat(practice);

    var apply={id:'apply:'+lesson.id,kind:'apply',lessonId:lesson.id,ref:lesson.apply||null,words:applyWords(lesson,c,q,fresh)};
    if(obj(lesson.apply).kind==='examples'){ apply.mode='examples'; apply.sentences=applySentences(c,fresh,eligible.concat(ids.filter(function(id){ return eligible.indexOf(id)<0; }))); }
    items.push(apply);
    items.push({id:'summary:'+lesson.id,kind:'summary',lessonId:lesson.id,lemmaIds:eligible.slice(),newLemmaIds:fresh.slice(),practiceCount:practice.length});
    return items;
  }
  // K2F-05 (KR-1): ünite ustalık kontrolü — çapa metnini oku + 10 soruluk karma test. Saf; hiçbir durum yazmaz.
  // Tohum unitId + gün: kararlılığı eşit kartların sırası günlük karışır ama aynı gün bayt-eşit kalır.
  var MASTERY_ITEMS=10,MASTERY_CHOICES=4,MASTERY_DIRECTIONS=['ar>tr','tr>ar','audio>meaning'];
  function hash32(text){
    var h=2166136261;
    for(var i=0;i<text.length;i+=1){ h^=text.charCodeAt(i); h=Math.imul(h,16777619)>>>0; }
    return h>>>0;
  }
  function unitIntroducedLemmas(q,unit){
    var seen=Object.create(null),out=[];
    unit.lessons.forEach(function(lesson){
      (Array.isArray(lesson.lemmaIds)?lesson.lemmaIds:[]).forEach(function(id){
        if(typeof id!=='string'||!id||seen[id]) return;
        if(introduced(q,id,lesson.id)){ seen[id]=true; out.push(id); }
      });
    });
    return out;
  }
  // En zayıftan (kart kararlılığı s artan; kartsız = 0); eşitlikte tohumlu karma, son çare kimlik — belirlenimci.
  function rankWeakest(q,ids,seed){
    return ids.map(function(id){ var card=cardFor(q,id); return {id:id,s:card?num(card.s,0):0,tie:hash32(seed+':'+id)}; })
      .sort(function(a,b){ return a.s-b.s||a.tie-b.tie||(a.id<b.id?-1:(a.id>b.id?1:0)); })
      .map(function(entry){ return entry.id; });
  }
  function masteryRead(unit,content,q){
    var anchors=Array.isArray(unit.anchor)?unit.anchor:[],used=[],words=[];
    anchors.forEach(function(anchor){
      var match=/^(prayer|surah):(.+)$/.exec(String(anchor));
      if(!match) return;
      var part=applyWords({id:'mastery:'+unit.id,apply:{kind:match[1],ref:match[1]==='surah'?Number(match[2]):match[2]}},content,q,[]);
      if(!part.length) return;
      used.push(String(anchor)); words=words.concat(part);
    });
    return used.length?{words:words,anchors:used}:null;
  }
  function masteryItem(q,unit,lemmaId,direction,round){
    var audio=direction==='audio>meaning',reverse=direction==='tr>ar',card=obj(obj(q.cards)['w:'+lemmaId+':ar>tr']);
    return {id:'mastery:'+unit.id+':'+lemmaId+':'+(audio?'audio':direction)+(round>0?':r'+round:''),kind:'practice',group:'lemma',mastery:true,unitId:unit.id,lemmaId:lemmaId,cardId:'w:'+lemmaId+':'+(reverse?'tr>ar':'ar>tr'),type:reverse?'arabic':'meaning',direction:direction,choiceCount:MASTERY_CHOICES,audioOnly:audio,isNew:!num(card.reps,0)};
  }
  function masteryPlan(snapshot,unitId,now,content){
    checkNow(now);
    var q=obj(obj(snapshot).quranLearn),c=content||{},unit=findUnit(c,unitId);
    if(!unit) return null;
    var ids=unitIntroducedLemmas(q,unit);
    if(!ids.length) return null;
    var ranked=rankWeakest(q,ids,String(unit.id)+':'+dayKey(now));
    var practice=[];
    for(var round=0;practice.length<MASTERY_ITEMS;round+=1){
      var before=practice.length;
      for(var d=0;d<MASTERY_DIRECTIONS.length;d+=1){
        for(var i=0;i<ranked.length&&practice.length<MASTERY_ITEMS;i+=1){
          if(MASTERY_DIRECTIONS[d]==='audio>meaning'&&!audioAvailable(c,ranked[i])) continue;
          practice.push(masteryItem(q,unit,ranked[i],MASTERY_DIRECTIONS[d],round));
        }
      }
      if(practice.length===before) break;
    }
    var items=[{id:'goal:mastery:'+unit.id,kind:'goal',mastery:true,unitId:unit.id,title:String(unit.title||''),lemmaIds:ids.slice(),newLemmaIds:[],apply:null}];
    var anchor=masteryRead(unit,c,q);
    if(anchor) items.push({id:'read:mastery:'+unit.id,kind:'read',mastery:true,unitId:unit.id,words:anchor.words,anchors:anchor.anchors});
    items=items.concat(practice);
    items.push({id:'summary:mastery:'+unit.id,kind:'summary',mastery:true,unitId:unit.id,lemmaIds:ids.slice(),newLemmaIds:[],practiceCount:practice.length});
    return items;
  }
  // K2F-07: başarısız ustalıktan sonra onarım — yalnız karıştırılan (repair.lemmaIds ∩ ünite) kelimeler, iki yön,
  // tanış adımı yok, en çok 10 soru. Saf; durum yazmaz. Bitişte `repair:null` yazımı motora aittir.
  function repairPlan(snapshot,unitId,now,content){
    checkNow(now);
    var q=obj(obj(snapshot).quranLearn),c=content||{},unit=findUnit(c,unitId);
    if(!unit) return null;
    var inUnit=Object.create(null);
    unit.lessons.forEach(function(lesson){ (Array.isArray(lesson.lemmaIds)?lesson.lemmaIds:[]).forEach(function(id){ if(typeof id==='string'&&id) inUnit[id]=true; }); });
    var listed=obj(obj(obj(obj(q).path).units)[String(unit.id)]).repair,raw=Array.isArray(obj(listed).lemmaIds)?listed.lemmaIds:[],seen=Object.create(null),ids=[];
    raw.forEach(function(id){ if(typeof id==='string'&&inUnit[id]&&!seen[id]){ seen[id]=true; ids.push(id); } });
    if(!ids.length) return null;
    var ranked=rankWeakest(q,ids,'repair:'+unit.id+':'+dayKey(now)),practice=[];
    ['ar>tr','tr>ar'].forEach(function(direction){
      ranked.forEach(function(id){
        if(practice.length>=MASTERY_ITEMS) return;
        var item=masteryItem(q,unit,id,direction,0);
        item.id='repair:'+unit.id+':'+id+':'+direction; item.mastery=false; item.repair=true;
        practice.push(item);
      });
    });
    var items=[{id:'goal:repair:'+unit.id,kind:'goal',repair:true,unitId:unit.id,title:'Onarım: '+String(unit.title||''),lemmaIds:ranked.slice(),newLemmaIds:[],apply:null}].concat(practice);
    items.push({id:'summary:repair:'+unit.id,kind:'summary',repair:true,unitId:unit.id,lemmaIds:ranked.slice(),newLemmaIds:[],practiceCount:practice.length});
    return items;
  }
  // Ustalık kaydının tek yorumu: passed > skipped > repair > failed > none. Bozuk alanlar güvenli varsayılana düşer.
  function unitMastery(q,unitId){
    var record=obj(obj(obj(obj(q).path).units)[String(unitId)]);
    var attempts=Math.max(0,Math.floor(num(record.attempts,0)));
    var score=typeof record.masteryScore==='number'&&isFinite(record.masteryScore)?Math.max(0,Math.min(1,record.masteryScore)):null;
    var repair=obj(record.repair),hasRepair=Array.isArray(repair.lemmaIds)&&repair.lemmaIds.length>0,state='none';
    if(typeof record.masteryAt==='string'&&record.masteryAt) state='passed';
    else if(typeof record.skippedAt==='string'&&record.skippedAt) state='skipped';
    else if(hasRepair) state='repair';
    else if(attempts>0) state='failed';
    return {state:state,score:score,attempts:attempts};
  }
  // 08 §1: ders tamamı türetilebilir — path kaydı ya da dersin tüm lemmalarının ar>tr kartı.
  function lessonProgress(q,lessonId,content){
    var lesson=curriculum(content).lessonById[lessonId],ids=lesson&&Array.isArray(lesson.lemmaIds)?lesson.lemmaIds:[],record=obj(lessonRecord(q,lessonId)),presented=Array.isArray(record.introducedLemmas)?record.introducedLemmas:[];
    var introduced=0,settled=0;
    ids.forEach(function(id){ var card=cardFor(q,id); if(card||presented.indexOf(id)>=0){ introduced+=1; if(isSettled(card)) settled+=1; } });
    var legacyDerivable=!Array.isArray(record.introducedLemmas);
    return {total:ids.length,introduced:introduced,settled:settled,done:!!record.doneAt||(legacyDerivable&&ids.length>0&&introduced===ids.length)};
  }
  function findUnit(content,unitId){
    var units=curriculum(content).units;
    for(var i=0;i<units.length;i+=1) if(String(units[i].id)===String(unitId)) return units[i];
    return null;
  }
  function unitProgress(q,unitId,content){
    var unit=findUnit(content,unitId),out={words:0,known:0,lessonsDone:0,lessons:0,mastery:false,started:false,nextLesson:null,nextIndex:-1};
    if(!unit) return out;
    unit.lessons.forEach(function(lesson,index){
      var p=lessonProgress(q,lesson.id,content);
      out.words+=p.total; out.known+=p.settled; out.lessons+=1;
      if(p.done) out.lessonsDone+=1;
      else if(out.nextLesson===null){ out.nextLesson=lesson; out.nextIndex=index; }
      if(p.introduced>0||lessonRecord(q,lesson.id)) out.started=true;
    });
    var unitRecord=obj(obj(obj(obj(q).path).units)[String(unit.id)]);
    out.mastery=!!unitRecord.masteryAt;
    out.skipped=!out.mastery&&!!unitRecord.skippedAt;
    // K2F-07: ünite tamam = dersler bitti ∧ (ustalık geçildi ∨ şimdilik atlandı). Atlamak taş/masteryAt yazmaz.
    out.complete=out.lessons>0&&out.lessonsDone===out.lessons&&(out.mastery||out.skipped);
    return out;
  }
  // 05 §4: son 7 günün ölçülmüş görev süresi (ms/answered); yoksa 0,55 dk/görev; üst sınır günlük süre.
  function estimateMinutes(daily,tasks,now,capMinutes){
    if(!(tasks>0)) return 0;
    var days=obj(daily),today=dayStart(dayKey(checkNow(now))),ms=0,answered=0;
    Object.keys(days).forEach(function(key){
      if(!/^\d{4}-\d{2}-\d{2}$/.test(key)) return;
      var age=(today-dayStart(key))/DAY_MS,day=obj(days[key]);
      if(age<0||age>=7||!(num(day.ms,0)>0)||!(num(day.answered,0)>0)) return;
      ms+=day.ms; answered+=day.answered;
    });
    var perTask=answered>0?ms/answered/60000:MIN_PER_TASK,minutes=Math.max(1,Math.ceil(tasks*perTask-1e-9));
    return capMinutes>0?Math.min(minutes,capMinutes):minutes;
  }
  function dueCount(q,now){
    var cards=obj(q.cards),t=now.getTime(),n=0;
    Object.keys(cards).forEach(function(id){
      var card=obj(cards[id]),due=new Date(card.due||0).getTime();
      if(card.orphan!==true&&card.state!=='new'&&card.st!=='new'&&isFinite(due)&&due<=t) n+=1;
    });
    return n;
  }
  function daysSinceActive(q,now){
    var days=obj(q.daily),keys=Object.keys(days).filter(function(key){ return /^\d{4}-\d{2}-\d{2}$/.test(key)&&num(obj(days[key]).answered,0)>0; }).sort();
    if(!keys.length) return null;
    return Math.round((dayStart(dayKey(now))-dayStart(keys[keys.length-1]))/DAY_MS);
  }
  function step(kind,title,subtitle,minutes,action,param,counts){
    return {kind:kind,title:title,subtitle:subtitle,minutes:minutes,action:action,param:param===undefined?null:param,counts:counts||{reviews:0,fresh:0}};
  }
  function currentUnit(q,content){
    var units=curriculum(content).units;
    for(var i=0;i<units.length;i+=1){
      var p=unitProgress(q,units[i].id,content);
      if(!p.complete) return {unit:units[i],progress:p,previous:i>0?units[i-1]:null};
    }
    return null;
  }
  function firstOpenS0(q,content){
    var s0=curriculum(content).s0;
    for(var i=0;i<s0.length;i+=1) if(!obj(lessonRecord(q,s0[i].id)).doneAt) return {lesson:s0[i],index:i};
    return null;
  }
  function lessonStep(q,now,content,current,due,cap){
    var daily=obj(q.daily),lesson=current.progress.nextLesson,lp=lessonProgress(q,lesson.id,content);
    var reviews=Math.min(due,REVIEW_CAP),fresh=due>DEBT_LIMIT?0:Math.min(num(obj(q.settings).dailyNew,10),lp.total-lp.introduced);
    var minutes=estimateMinutes(daily,reviews+fresh,now,cap),counts={reviews:reviews,fresh:fresh};
    // 05 §10: tekrar borcu yeni kelimeyi sıfırladıysa ünite tanıtımı yerine "yalnız tekrar" günü.
    if(current.previous&&!current.progress.started&&fresh>0) return step('next-unit','Sıradaki ünite: '+current.unit.title,current.unit.promise,minutes,'kaoLesson',lesson.id,counts);
    var subtitle=fresh>0?reviews+' tekrar + '+fresh+' yeni · ~'+minutes+' dk':reviews+' tekrar · önce tekrarları bitirelim · ~'+minutes+' dk';
    return step('daily',current.unit.title+' · Ders '+(current.progress.nextIndex+1),subtitle,minutes,'kaoLesson',lesson.id,counts);
  }
  // 05 §4 öncelik sırası; ilk eşleşen kazanır. Kenar: 7+ gün ara → ısınma, tekrar borcu >60 → yeni 0.
  function nextStep(snapshot,now,content){
    checkNow(now);
    var snap=obj(snapshot),q=obj(snap.quranLearn),onboarding=obj(q.onboarding),daily=obj(q.daily),night=snap.night;
    var cap=[5,10,15].indexOf(onboarding.minutes)>=0?onboarding.minutes:0,due=dueCount(q,now);
    if(!onboarding.doneAt) return step('onboarding','Hoş geldin','1 dakikada başlayalım',1,'kaoOnboarding',null);
    if(night&&night.active===true&&due>0){
      var nightCards=Math.min(due,num(night.maxCards,8)),nightMin=num(night.durationMinutes,3);
      return step('night-review','Hafif tekrar','Uyumadan önce '+nightCards+' kart · ~'+nightMin+' dk',nightMin,'kaoStart',null,{reviews:nightCards,fresh:0});
    }
    var todayDone=obj(daily[dayKey(now)]).sessionDone===true,gap=daysSinceActive(q,now);
    var cardCount=Object.keys(obj(q.cards)).filter(function(id){ return obj(q.cards[id]).orphan!==true; }).length;
    if(!todayDone&&gap!==null&&gap>=WARMUP_GAP_DAYS&&cardCount>0){
      var warm=Math.min(WARMUP_CARDS,cardCount),warmMin=estimateMinutes(daily,warm,now,cap);
      return step('warmup','Yeniden ısınalım','En zayıf '+warm+' kelimeyle başla · ~'+warmMin+' dk',warmMin,'kaoStart',null,{reviews:warm,fresh:0});
    }
    var s0=onboarding.start==='s0'?firstOpenS0(q,content):null;
    if(s0) return step('s0-lesson','Harfler · Ders '+(s0.index+1)+': '+s0.lesson.title,'Seviye 0 · ~'+S0_MINUTES+' dk',S0_MINUTES,'kaoS0',s0.lesson.id);
    var current=currentUnit(q,content);
    if(current&&!current.progress.nextLesson){
      // K2F-07: öncelik repair > mastery. Onarım biter bitmez (repair:null) yeniden mastery önerilir.
      if(unitMastery(q,current.unit.id).state==='repair') return step('repair','Onarım: '+current.unit.title,'Karıştırdığın kelimeleri pekiştir · ~'+REPAIR_MINUTES+' dk',REPAIR_MINUTES,'kaoLesson','repair:'+current.unit.id);
      return step('mastery','Ustalık: '+current.unit.title,'Çapa metnini dokunmadan oku + karma test · ~'+MASTERY_MINUTES+' dk',MASTERY_MINUTES,'kaoLesson',current.unit.id);
    }
    if(current&&!todayDone) return lessonStep(q,now,content,current,due,cap);
    return step('rest',current?'Bugünlük tamam ✓':'Tüm üniteler tamam ✓','İstersen: Günün âyeti',0,'kaoOpenAyah',null);
  }

  window.SeymaQuranLearnFlow={version:1,createStack:createStack,openStack:openStack,push:push,reset:reset,replaceTop:replaceTop,current:current,previous:previous,back:back,
    curriculum:curriculum,lessonOf:lessonOf,lessonProgress:lessonProgress,unitProgress:unitProgress,nextStep:nextStep,lessonPlan:lessonPlan,masteryPlan:masteryPlan,repairPlan:repairPlan,unitMastery:unitMastery,estimateMinutes:estimateMinutes};
})(window);
