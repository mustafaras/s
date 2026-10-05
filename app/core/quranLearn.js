/*
 * FSRS scheduler port: ts-fsrs v4.5.2 (FSRS-5.0), commit
 * cdd9158eedf81f3b962bf63f8d49346fcdccf8e6.
 * Copyright (c) 2024 Open Spaced Repetition. MIT License.
 * Source: https://github.com/open-spaced-repetition/ts-fsrs/tree/v4.5.2
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
(function(){
  'use strict';

  var SCHEMA_VERSION=1;
  var LEXICON_VERSION='quran-lexicon-tr-v1';
  var DAY_MS=86400000;
  var FSRS_DECAY=-0.5;
  var FSRS_FACTOR=19/81;
  var FSRS_RETENTION=0.9;
  var FSRS_MAX_INTERVAL=36500;
  var FSRS_WEIGHTS=[
    0.40255,1.18385,3.173,15.69105,7.1949,0.5345,1.4604,0.0046,1.54575,
    0.1192,1.01925,1.9395,0.11,0.29605,2.2698,0.2315,2.9898,0.51655,0.6621
  ];
  var KAO_GRAMMAR_TYPES=['Ek çöz','Çekim tablosu','Kök bul','Kalıp eşle'];
  var REQUIRED_DEPS=['data','ui','save','render','todayStr','esc','icon','getDay'];
  var quranLearnDeps=null;
  var quranLearnSurfaceDeps=null;
  var quranLearnViewRegistry=null;
  var caffeineTargetBedResolver=null;

  function registerQuranLearn(deps){
    if(quranLearnDeps||!deps||typeof deps!=='object'||Array.isArray(deps)) return false;
    for(var i=0;i<REQUIRED_DEPS.length;i+=1){
      if(typeof deps[REQUIRED_DEPS[i]]!=='function') return false;
    }
    var views=window.SeymaQuranLearnViews;
    if(views){
      if(typeof views.register!=='function'||!views.register({esc:deps.esc,icon:deps.icon})) return false;
      quranLearnViewRegistry=views;
    }
    quranLearnDeps=deps;
    return true;
  }
  function registerQuranLearnSurface(deps){
    var required=['lockBody','unlockBody','focusDialog','activeElementId','restoreFocus','sheetClose','mount'];
    if(quranLearnSurfaceDeps||!deps||typeof deps!=='object'||Array.isArray(deps)) return false;
    for(var i=0;i<required.length;i+=1) if(typeof deps[required[i]]!=='function') return false;
    quranLearnSurfaceDeps=deps;
    return true;
  }
  function registerCaffeineTargetBed(resolver){
    if(caffeineTargetBedResolver||typeof resolver!=='function') return false;
    caffeineTargetBedResolver=resolver;
    return true;
  }

  function objectOr(value,fallback){
    return value&&typeof value==='object'&&!Array.isArray(value)?value:fallback;
  }
  function nullableString(value){ return typeof value==='string'&&value?value:null; }
  function boolOr(value,fallback){ return typeof value==='boolean'?value:fallback; }
  function nonNegativeNumber(value,fallback){
    return typeof value==='number'&&isFinite(value)&&value>=0?value:fallback;
  }
  function keysOf(source){ return Object.keys(source&&typeof source==='object'?source:{}); }
  function round8(value){ return Number(value.toFixed(8)); }
  function clamp(value,min,max){ return Math.min(Math.max(value,min),max); }
  function validDate(value,label){
    var date=value instanceof Date?new Date(value.getTime()):new Date(value);
    if(!isFinite(date.getTime())) throw new TypeError(label+' must be a valid date');
    return date;
  }
  function addMinutes(date,minutes){ return new Date(date.getTime()+minutes*60000); }
  function addDays(date,days){ return new Date(date.getTime()+days*DAY_MS); }
  function elapsedDays(lastReview,now){
    if(!lastReview) return 0;
    return Math.max(0,Math.trunc((now.getTime()-validDate(lastReview,'card.r').getTime())/DAY_MS));
  }
  function constrainDifficulty(value){ return clamp(round8(value),1,10); }
  function initialStability(grade){ return Math.max(FSRS_WEIGHTS[grade-1],0.1); }
  function initialDifficulty(grade){
    return constrainDifficulty(FSRS_WEIGHTS[4]-Math.exp((grade-1)*FSRS_WEIGHTS[5])+1);
  }
  function meanReversion(initial,current){
    return round8(FSRS_WEIGHTS[7]*initial+(1-FSRS_WEIGHTS[7])*current);
  }
  function nextDifficulty(difficulty,grade){
    var delta=-FSRS_WEIGHTS[6]*(grade-3);
    var damped=round8(delta*(10-difficulty)/9);
    return constrainDifficulty(meanReversion(initialDifficulty(4),difficulty+damped));
  }
  function forgettingCurve(days,stability){
    return round8(Math.pow(1+FSRS_FACTOR*days/stability,FSRS_DECAY));
  }
  function nextRecallStability(difficulty,stability,retrievability,grade){
    var hard=grade===2?FSRS_WEIGHTS[15]:1;
    var easy=grade===4?FSRS_WEIGHTS[16]:1;
    var next=stability*(1+Math.exp(FSRS_WEIGHTS[8])*(11-difficulty)*Math.pow(stability,-FSRS_WEIGHTS[9])*(Math.exp((1-retrievability)*FSRS_WEIGHTS[10])-1)*hard*easy);
    return round8(clamp(next,0.01,FSRS_MAX_INTERVAL));
  }
  function nextForgetStability(difficulty,stability,retrievability){
    var next=FSRS_WEIGHTS[11]*Math.pow(difficulty,-FSRS_WEIGHTS[12])*(Math.pow(stability+1,FSRS_WEIGHTS[13])-1)*Math.exp((1-retrievability)*FSRS_WEIGHTS[14]);
    return round8(clamp(next,0.01,FSRS_MAX_INTERVAL));
  }
  function nextShortTermStability(stability,grade){
    return round8(clamp(stability*Math.exp(FSRS_WEIGHTS[17]*(grade-3+FSRS_WEIGHTS[18])),0.01,FSRS_MAX_INTERVAL));
  }
  function nextInterval(stability){
    var modifier=round8((Math.pow(FSRS_RETENTION,1/FSRS_DECAY)-1)/FSRS_FACTOR);
    return Math.min(Math.max(1,Math.round(stability*modifier)),FSRS_MAX_INTERVAL);
  }
  function cardState(value){
    return ['new','learning','review','relearning'].indexOf(value)>=0?value:'new';
  }
  function normalizedCard(card,now){
    var source=card&&typeof card==='object'&&!Array.isArray(card)?card:{};
    return {
      source:source,
      s:nonNegativeNumber(source.s,0),
      d:nonNegativeNumber(source.d,0),
      r:typeof source.r==='string'&&source.r?source.r:null,
      due:typeof source.due==='string'&&source.due?source.due:now.toISOString(),
      reps:Math.floor(nonNegativeNumber(source.reps,0)),
      lapses:Math.floor(nonNegativeNumber(source.lapses,0)),
      state:cardState(source.state)
    };
  }
  function resultCard(card,values,now,predictedR){
    var result=Object.assign({},card.source,values);
    result.r=now.toISOString();
    result.predictedR=predictedR;
    return result;
  }
  function reviewIntervals(difficulty,stability,retrievability){
    var againS=Math.min(round8(stability/Math.exp(FSRS_WEIGHTS[17]*FSRS_WEIGHTS[18])),nextForgetStability(difficulty,stability,retrievability));
    var hardS=nextRecallStability(difficulty,stability,retrievability,2);
    var goodS=nextRecallStability(difficulty,stability,retrievability,3);
    var easyS=nextRecallStability(difficulty,stability,retrievability,4);
    var hard=Math.min(nextInterval(hardS),nextInterval(goodS));
    var good=Math.max(nextInterval(goodS),hard+1);
    var easy=Math.max(nextInterval(easyS),good+1);
    return {stability:[againS,hardS,goodS,easyS],interval:[0,hard,good,easy]};
  }
  function kaoSchedule(input,grade,nowValue){
    if([1,2,3,4].indexOf(grade)<0) throw new RangeError('grade must be 1..4');
    var now=validDate(nowValue,'now');
    var card=normalizedCard(input,now);
    var days=elapsedDays(card.r,now);
    var predictedR=card.state==='new'||card.s<=0?1:forgettingCurve(days,card.s);
    var values={s:card.s,d:card.d,due:card.due,interval:0,reps:card.reps+1,lapses:card.lapses,state:card.state};

    if(card.state==='new'){
      values.s=initialStability(grade);
      values.d=initialDifficulty(grade);
      if(grade===1){ values.due=addMinutes(now,1).toISOString(); values.state='learning'; }
      if(grade===2){ values.due=addMinutes(now,5).toISOString(); values.state='learning'; }
      if(grade===3){ values.due=addMinutes(now,10).toISOString(); values.state='learning'; }
      if(grade===4){ values.interval=nextInterval(values.s); values.due=addDays(now,values.interval).toISOString(); values.state='review'; }
      return resultCard(card,values,now,predictedR);
    }

    values.d=nextDifficulty(card.d,grade);
    if(card.state==='learning'||card.state==='relearning'){
      values.s=nextShortTermStability(card.s,grade);
      if(grade===1) values.due=addMinutes(now,5).toISOString();
      if(grade===2) values.due=addMinutes(now,10).toISOString();
      if(grade===3){ values.interval=nextInterval(values.s); values.due=addDays(now,values.interval).toISOString(); values.state='review'; }
      if(grade===4){
        var goodInterval=nextInterval(nextShortTermStability(card.s,3));
        values.interval=Math.max(nextInterval(values.s),goodInterval+1);
        values.due=addDays(now,values.interval).toISOString();
        values.state='review';
      }
      return resultCard(card,values,now,predictedR);
    }

    var choices=reviewIntervals(card.d,card.s,predictedR);
    values.s=choices.stability[grade-1];
    values.interval=choices.interval[grade-1];
    if(grade===1){
      values.due=addMinutes(now,5).toISOString();
      values.state='relearning';
      values.lapses+=1;
    }else{
      values.due=addDays(now,values.interval).toISOString();
      values.state='review';
    }
    return resultCard(card,values,now,predictedR);
  }
  function kaoGrade(correct,responseMs,reps){
    if(!correct) return 1;
    if(nonNegativeNumber(responseMs,0)>8000) return 2;
    if(nonNegativeNumber(responseMs,0)<2500&&nonNegativeNumber(reps,0)>=3) return 4;
    return 3;
  }
  function quranLearnRoot(d){
    if(!d||typeof d!=='object'||Array.isArray(d)) return {};
    return d.quranLearn&&typeof d.quranLearn==='object'&&!Array.isArray(d.quranLearn)?d.quranLearn:d;
  }
  function cardType(id,explicit){
    if(explicit==='grammar'||explicit==='fragment'||explicit==='word'||explicit==='meaning'||explicit==='arabic') return explicit;
    if(/^g:/.test(id)) return 'grammar';
    if(/^s:/.test(id)) return 'fragment';
    return 'word';
  }
  function lemmaIdForCard(id){
    var match=String(id||'').match(/^w:([^:]+):(ar>tr|tr>ar)$/);
    return match?match[1]:null;
  }
  function metaFor(id,raw,opts){
    var catalog=opts&&opts.catalog&&typeof opts.catalog==='object'?opts.catalog:{};
    var meta=Object.assign({},catalog[id]||{},raw||{});
    var lemmaId=lemmaIdForCard(id),lex=window.QuranLexiconV1;
    var lemma=lemmaId&&lex&&typeof lex.byId==='function'?lex.byId(lemmaId):null;
    if(lemma){
      if(!meta.pos) meta.pos=lemma.pos;
      if(!meta.root) meta.root=lemma.root;
      if(!meta.meanings) meta.meanings=lemma.meanings;
      if(!meta.ar) meta.ar=lemma.ar;
      if(!meta.translit) meta.translit=lemma.translit;
      if(!meta.cognate) meta.cognate=lemma.cognate;
      // R-A5 komşuları: sözlüğün D-12 doğrulanmış kısa listesi (kaynak: tools/kao-lexicon-build.mjs SEM_NEIGHBOR_REVIEW).
      if(!meta.semNeighbors&&Array.isArray(lemma.semNeighbors)) meta.semNeighbors=lemma.semNeighbors;
    }
    return meta;
  }
  function semanticInfo(id,raw,opts){
    var meta=metaFor(id,raw,opts),lemmaId=lemmaIdForCard(id),keys=[],neighbors=[];
    if(meta.root) keys.push('root:'+meta.root);
    var sem=meta.semNeighbors;
    if(Array.isArray(sem)) neighbors=neighbors.concat(sem);
    else if(sem&&typeof sem==='object'){
      (Array.isArray(sem.clusters)?sem.clusters:[]).forEach(function(value){ keys.push('cluster:'+value); });
      neighbors=neighbors.concat(Array.isArray(sem.sameRoot)?sem.sameRoot:[]);
    }
    return {id:id,lemmaId:lemmaId,keys:Array.from(new Set(keys)),neighbors:Array.from(new Set(neighbors))};
  }
  function semanticNeighbors(a,b){
    if(a.keys.some(function(key){ return b.keys.indexOf(key)>=0; })) return true;
    return a.neighbors.indexOf(b.id)>=0||a.neighbors.indexOf(b.lemmaId)>=0||b.neighbors.indexOf(a.id)>=0||b.neighbors.indexOf(a.lemmaId)>=0;
  }
  function hashSeed(text){
    var hash=2166136261;
    for(var i=0;i<text.length;i+=1){ hash^=text.charCodeAt(i); hash=Math.imul(hash,16777619); }
    return hash>>>0;
  }
  function xorshift(value){
    var x=value>>>0||0x9e3779b9;
    x^=x<<13; x^=x>>>17; x^=x<<5;
    return x>>>0;
  }
  function seededRank(seed,id){ return xorshift(hashSeed(String(seed)+'|'+String(id))); }
  function daySeed(now){ return now.toISOString().slice(0,10); }
  function localDayOf(value){ var d=new Date(value); if(!isFinite(d.getTime())) return ''; var pad=function(n){ return (n<10?'0':'')+n; }; return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
  function candidateRecord(raw,cards,opts){
    var id=String(raw&&raw.cardId||raw&&raw.id||'');
    if(!id) return null;
    var card=cards[id]&&typeof cards[id]==='object'?cards[id]:{};
    var isNew=typeof raw.isNew==='boolean'?raw.isNew:(!cards[id]||card.state==='new'||card.st==='new'||(!card.reps&&card.state!=='review'&&card.st!=='review'));
    return {cardId:id,type:cardType(id,raw.type),isNew:isNew,priority:nonNegativeNumber(raw.priority,0),card:card,raw:raw,semantic:semanticInfo(id,raw,opts)};
  }
  function recentNeighbor(candidate,cards,now,opts){
    var ids=Object.keys(cards);
    for(var i=0;i<ids.length;i+=1){
      var other=cards[ids[i]],introduced=other&&(other.introducedAt||other.firstSeenAt);
      if(!introduced) continue;
      // Aynı lemmanın diğer yönü yeni kelime değildir; anlamsal aralık yalnız başka lemmalar arasında uygulanır.
      if(candidate.semantic.lemmaId&&lemmaIdForCard(ids[i])===candidate.semantic.lemmaId) continue;
      var at=new Date(introduced);
      if(!isFinite(at.getTime())||now.getTime()-at.getTime()>=3*DAY_MS) continue;
      if(semanticNeighbors(candidate.semantic,semanticInfo(ids[i],null,opts))) return true;
    }
    return false;
  }
  function kaoBuildQueue(d,nowValue,options){
    var opts=options&&typeof options==='object'?options:{};
    var now=validDate(nowValue,'now'),q=quranLearnRoot(d),cards=objectOr(q.cards,{});
    var source=Array.isArray(opts.candidates)?opts.candidates:Object.keys(cards).map(function(id){ return {id:id}; });
    // K2F-10: sunulamayan gramer kartı kuyruğa girmez (kart silinmez; yalnız sunumu kesilir, kapasite harcamaz).
    var records=source.map(function(raw){ return candidateRecord(raw,cards,opts); }).filter(Boolean).filter(function(item){
      return item.type!=='grammar'||kaoGrammarItemPresentable({id:'kao:'+daySeed(now)+':'+item.cardId,cardId:item.cardId},d);
    });
    var seed=daySeed(now)+'|'+String(opts.sessionId||'');
    records.sort(function(a,b){ return b.priority-a.priority||seededRank(seed,a.cardId)-seededRank(seed,b.cardId)||a.cardId.localeCompare(b.cardId); });
    var due=records.filter(function(item){
      if(item.isNew||item.card.orphan===true) return false;
      var date=new Date(item.card.due||0);
      return isFinite(date.getTime())&&date.getTime()<=now.getTime();
    }).slice(0,60);
    var dailyNew=Math.max(0,Math.floor(nonNegativeNumber(opts.dailyNew,nonNegativeNumber(q.settings&&q.settings.dailyNew,10))));
    var selectedNew=[],newRecords=records.filter(function(item){ return item.isNew; });
    var eligible=function(item,chosen){ return !recentNeighbor(item,cards,now,opts)&&!chosen.some(function(other){ return semanticNeighbors(item.semantic,other.semantic); }); };
    newRecords.some(function(item){
      if(selectedNew.length>=dailyNew) return true;
      if(eligible(item,selectedNew)) selectedNew.push(item);
      return false;
    });
    var remaining=due.concat(selectedNew),out=kaoDelayedCandidates(q,now),typeCounts={grammar:0,fragment:out.length,word:0};
    while(remaining.length){
      var index=-1;
      for(var i=0;i<remaining.length;i+=1){
        var item=remaining[i];
        if(item.type==='grammar'&&typeCounts.grammar>=4) continue;
        if(item.type==='fragment'&&typeCounts.fragment>=2) continue;
        var n=out.length;
        // KF-9: ardışık aynı tür ≤2 gramere de uygulanır; yalnız aynı tür kalırsa döngü durur ve oturum kısalır.
        if(n>=2&&out[n-1].type===item.type&&out[n-2].type===item.type) continue;
        index=i; break;
      }
      if(index<0) break;
      var chosen=remaining.splice(index,1)[0];
      typeCounts[chosen.type]+=1;
      out.push({id:'kao:'+daySeed(now)+':'+chosen.cardId,cardId:chosen.cardId,type:chosen.type,fragmentKind:chosen.raw&&chosen.raw.fragmentKind||null,isNew:chosen.isNew});
    }
    return out;
  }
  // R-A2: hedefin bir önceki tekrarındaki çeldiriciler (cevapta yazılan card.lastDistractors). Aynı lemmanın
  // öteki yön kartı da aynı çeldirici sayılır; dışlama lemma düzeyindedir.
  function previousDistractorLemmas(d,targetId,opts){
    var cards=objectOr(quranLearnRoot(d).cards,{}),targetCard=objectOr(cards[targetId],{});
    var previousMap=opts.previousDistractors&&typeof opts.previousDistractors==='object'?opts.previousDistractors:{};
    var previous=Array.isArray(previousMap[targetId])?previousMap[targetId]:(Array.isArray(targetCard.lastDistractors)?targetCard.lastDistractors:[]);
    return previous.map(function(id){ return lemmaIdForCard(id)||String(id); });
  }
  function kaoPickDistractors(d,targetId,count,options){
    var opts=options&&typeof options==='object'?options:{},q=quranLearnRoot(d),cards=objectOr(q.cards,{});
    var target=metaFor(targetId,null,opts),previous=previousDistractorLemmas(d,targetId,opts);
    var limit=Math.max(0,Math.floor(nonNegativeNumber(count,3)));
    return Object.keys(cards).filter(function(id){
      if(id===targetId||previous.indexOf(lemmaIdForCard(id)||id)>=0) return false;
      var card=cards[id],meta=metaFor(id,null,opts);
      return (card.state==='review'||card.st==='review')&&nonNegativeNumber(card.s,0)>=21&&!!target.pos&&meta.pos===target.pos&&!!target.root&&!!meta.root&&meta.root!==target.root;
    }).sort(function(a,b){
      return seededRank(String(opts.seed||'')+'|'+targetId,a)-seededRank(String(opts.seed||'')+'|'+targetId,b)||a.localeCompare(b);
    }).slice(0,limit).map(function(id){
      var meta=metaFor(id,null,opts),meanings=Array.isArray(meta.meanings)?meta.meanings:[];
      return {cardId:id,label:String(meanings[0]||meta.meaning||id)};
    });
  }
  function kaoBuildTask(queueItem,d,options){
    var opts=options&&typeof options==='object'?options:{};
    var id=String(queueItem&&queueItem.cardId||queueItem&&queueItem.id||'');
    if(queueItem&&queueItem.type==='fragment'||/^s:/.test(id)) return kaoBuildFragmentTask(queueItem,opts);
    if(/^g:/.test(id)) return kaoBuildGrammarTask(queueItem,d,opts);
    if(/^k:/.test(id)) return kaoBuildLinkTask(queueItem,opts); if(/^t:/.test(id)) return kaoBuildTransferTask(queueItem,opts);
    var meta=metaFor(id,queueItem,opts),meanings=Array.isArray(meta.meanings)?meta.meanings:[];
    var direction=/:tr>ar$/.test(id)?'tr>ar':'ar>tr';
    var answer=direction==='tr>ar'?String(meta.ar||id):String(meanings[0]||meta.meaning||id);
    var picked=kaoPickDistractors(d,id,3,opts),lex=window.QuranLexiconV1;
    if(picked.length<3&&lex&&Array.isArray(lex.lemmas)){
      // Sözlük yedeği katmanlı: (1) aynı tür, farklı kök; (2) hedef köksüzse öteki köksüz işlev kelimeleri; (3) son çare
      // herhangi bir kelime. Aynı kök yalnız kök varken dışlanır (köksüz edatlar birbirini elemez); etiketler tekildir.
      var previousLemmas=previousDistractorLemmas(d,id,opts),pickedLemmas=picked.map(function(item){ return lemmaIdForCard(item.cardId); }),targetLemma=lemmaIdForCard(id);
      var labelOf=function(lemma){ return direction==='tr>ar'?String(lemma.ar||lemma.id):String(lemma.meanings[0]||lemma.id); };
      var usedLabels=[answer].concat(picked.map(function(item){ return direction==='tr>ar'?String(metaFor(item.cardId,null,opts).ar||item.label):String(item.label); }));
      // Anlamca çakışan seçenek soruyu belirsiz yapar: ortak parçası (",", ";", "(", "/" ile ayrılmış) olan etiket elenir.
      var parts=function(label){ return String(label||'').toLocaleLowerCase('tr').split(/[,;()\/]+/).map(function(part){ return part.trim(); }).filter(Boolean); };
      var overlaps=function(label){ var own=parts(label); return usedLabels.some(function(used){ return parts(used).some(function(part){ return own.indexOf(part)>=0; }); }); };
      var eligible=function(lemma){ return lemma.id!==targetLemma&&!(meta.root&&lemma.root===meta.root)&&previousLemmas.indexOf(lemma.id)<0&&pickedLemmas.indexOf(lemma.id)<0; };
      var tiers=[function(lemma){ return lemma.pos===meta.pos; },function(lemma){ return !meta.root&&!lemma.root; },function(){ return true; }];
      tiers.some(function(tier){
        lex.lemmas.filter(function(lemma){ return eligible(lemma)&&tier(lemma); }).sort(function(a,b){ return seededRank(String(opts.seed||'')+'|fallback|'+id,a.id)-seededRank(String(opts.seed||'')+'|fallback|'+id,b.id); }).some(function(lemma){
          if(picked.length>=3) return true;
          var label=labelOf(lemma);
          if(overlaps(label)) return false;
          usedLabels.push(label); pickedLemmas.push(lemma.id);
          picked.push({cardId:'w:'+lemma.id+':'+direction,label:label});
          return false;
        });
        return picked.length>=3;
      });
    }
    var choices=[{cardId:id,label:answer,pronunciation:direction==='tr>ar'?kaoLemmaReading(lemmaIdForCard(id),meta.translit):'',correct:true}].concat(picked.map(function(item){
      var itemMeta=metaFor(item.cardId,null,opts);
      return {cardId:item.cardId,label:direction==='tr>ar'?String(itemMeta.ar||item.label):String(item.label),pronunciation:direction==='tr>ar'?kaoLemmaReading(lemmaIdForCard(item.cardId),itemMeta.translit):'',correct:false};
    }));
    choices.sort(function(a,b){ return seededRank(String(opts.seed||'')+'|task|'+id,a.cardId)-seededRank(String(opts.seed||'')+'|task|'+id,b.cardId); });
    if(typeof opts.choiceCount==='number'&&isFinite(opts.choiceCount)){
      var choiceCount=Math.max(2,Math.min(4,Math.floor(opts.choiceCount))),correctChoice=choices.find(function(choice){ return choice.correct===true; });
      if(correctChoice&&choices.length>choiceCount) choices=[correctChoice].concat(choices.filter(function(choice){ return choice!==correctChoice; }).slice(0,choiceCount-1)).sort(function(a,b){ return seededRank(String(opts.seed||'')+'|task|'+id,a.cardId)-seededRank(String(opts.seed||'')+'|task|'+id,b.cardId); });
    }
    choices.forEach(function(choice,index){ choice.choiceId=String(queueItem&&queueItem.id||'task:'+id)+':choice:'+index; });
    // R-B5 / 02 §5.3: hareke soldurma yalnız review ∧ s≥30 kartta (durable30). Hedefte anlam kayması (cognate.shift)
    // varsa yanlış cevap errors.cognate'e yazılır; telaffuz hataları kelime görevinde değil phonics.misheard'de sayılır.
    return {id:String(queueItem&&queueItem.id||'task:'+id),cardId:id,type:cardType(id,queueItem&&queueItem.type),isNew:!!(queueItem&&queueItem.isNew),retry:!!(queueItem&&queueItem.retry),direction:direction,audioOnly:opts.audioOnly===true,answer:answer,ar:String(meta.ar||''),meaning:String(meanings[0]||meta.meaning||''),translit:kaoLemmaReading(lemmaIdForCard(id),meta.translit),cognate:meta.cognate||null,durable30:isSettled(objectOr(quranLearnRoot(d).cards,{})[id],30),errorClass:meta.cognate&&meta.cognate.shift?'cognate':'',clipId:lemmaIdForCard(id)?'w-'+lemmaIdForCard(id):'',choices:choices};
  }
  // 02 §5.6 "bağ kur": hedefin Türkçe türevi (cognate.tr) seçilir; çeldiriciler başka kökten, anlam parçası çakışmayan türevler.
  function kaoBuildLinkTask(queueItem,opts){ var id=String(queueItem.cardId||''),lemmaId=id.slice(2),lemmas=window.QuranLexiconV1&&Array.isArray(window.QuranLexiconV1.lemmas)?window.QuranLexiconV1.lemmas:[],lemma=lemmas.find(function(l){ return l.id===lemmaId; }); if(!lemma||!lemma.cognate||!lemma.cognate.tr) return null; var seed=String(opts.seed||'')+'|link|'+lemmaId,answer=String(lemma.cognate.tr),used=[answer],picked=[],parts=function(label){ return String(label||'').toLocaleLowerCase('tr').split(/[,;()\/]+/).map(function(part){ return part.trim(); }).filter(Boolean); }; lemmas.filter(function(l){ return l.id!==lemmaId&&l.cognate&&l.cognate.tr&&!(lemma.root&&l.root===lemma.root); }).sort(function(a,b){ return seededRank(seed,a.id)-seededRank(seed,b.id)||a.id.localeCompare(b.id); }).some(function(l){ var label=String(l.cognate.tr),own=parts(label); if(used.some(function(u){ return parts(u).some(function(part){ return own.indexOf(part)>=0; }); })) return false; used.push(label); picked.push({cardId:'k:'+l.id,label:label,correct:false}); return picked.length>=3; }); var choices=[{cardId:id,label:answer,correct:true}].concat(picked).sort(function(a,b){ return seededRank(seed+'|order',a.cardId)-seededRank(seed+'|order',b.cardId); }); choices.forEach(function(choice,index){ choice.choiceId=String(queueItem.id)+':choice:'+index; }); return {id:String(queueItem.id),cardId:id,type:'link',kind:'link',isNew:false,retry:false,prompt:'Türkçedeki türevini seç',answer:answer,ar:String(lemma.ar||''),meaning:String((lemma.meanings||[])[0]||''),translit:kaoLemmaReading(lemmaId,lemma.translit),cognate:null,clipId:'',choices:choices}; }
  // Öğrenilen her 5. yeni kelimeden sonra bir "bağ kur" (sayaç: introducedAt'lı ar>tr kartlar + oturumdaki sıra; hedef son 5'ten).
  function kaoInsertLinks(queue,q,now){ var cards=objectOr(q.cards,{}),lemmas=window.QuranLexiconV1&&Array.isArray(window.QuranLexiconV1.lemmas)?window.QuranLexiconV1.lemmas:[],byId=Object.create(null),out=[]; lemmas.forEach(function(l){ byId[l.id]=l; }); var recent=Object.keys(cards).filter(function(cid){ return /:ar>tr$/.test(cid)&&cards[cid].introducedAt; }).sort(function(a,b){ return String(cards[b].introducedAt).localeCompare(String(cards[a].introducedAt)); }).map(lemmaIdForCard),count=recent.length; queue.forEach(function(item){ out.push(item); if(!item.isNew||!/^w:.+:ar>tr$/.test(item.cardId)) return; recent.unshift(lemmaIdForCard(item.cardId)); count+=1; var pick=count%5?null:recent.slice(0,5).find(function(lid){ return byId[lid]&&byId[lid].cognate&&byId[lid].cognate.tr; }); if(pick) out.push({id:'kao:'+daySeed(now)+':k:'+pick,cardId:'k:'+pick,type:'link',isNew:false}); }); return out; }
  function minuteOfDay(value){
    if(typeof value!=='string'||!/^\d{2}:\d{2}$/.test(value)) return null;
    var parts=value.split(':'),hour=Number(parts[0]),minute=Number(parts[1]);
    return hour<24&&minute<60?hour*60+minute:null;
  }
  function minuteLabel(value){
    var normalized=((value%1440)+1440)%1440;
    return String(Math.floor(normalized/60)).padStart(2,'0')+':'+String(normalized%60).padStart(2,'0');
  }
  function kaoNightWindow(d,nowValue){
    if(!d||!d.settings||typeof d.settings.targetBed!=='string') return false;
    var resolver=caffeineTargetBedResolver||(quranLearnDeps&&quranLearnDeps.caffeineTargetBed);
    if(typeof resolver!=='function') return false;
    var target;
    try{ target=resolver(); }catch(_error){ return false; }
    var bed=minuteOfDay(target),now=validDate(nowValue,'now');
    if(bed==null) return false;
    var current=now.getHours()*60+now.getMinutes(),until=(bed-current+1440)%1440;
    if(until>90) return false;
    return {active:true,targetBed:target,startsAt:minuteLabel(bed-90),durationMinutes:3,maxCards:8,reviewOnly:true};
  }
  // KAO2-16 · 07 §6: taş anahtar uzayı tek yerden türetilir; eski anahtarlar korunur.
  var KAO_MILESTONE_CORE={besmele:true,fatiha:true,namaz:true,half:true,twoThirds:true,eighty:true,shortSurahs:true};
  function kaoMilestoneKeys(){
    var curriculum=window.QuranCurriculumV2,units=curriculum&&Array.isArray(curriculum.units)?curriculum.units:[];
    return keysOf(KAO_MILESTONE_CORE).concat(units.map(function(unit){ return 'u'+unit.id; }));
  }
  function KAO_MILESTONE_SHAPE(){
    var shape={};
    kaoMilestoneKeys().forEach(function(key){ shape[key]=null; });
    return shape;
  }
  var KAO_MILESTONE_LABELS={besmele:'Besmele’yi okudum',fatiha:'Fâtiha’yı anlıyorum',namaz:'Namazımı anlıyorum',half:'Kelimelerin yarısı tanıdık',twoThirds:'Üçte iki kapsam',eighty:'%75 kapsam',shortSurahs:'Kısa sûreler tamam'};
  // KAO2-16 · 07 §6: ünite taşları müfredattan türetilir; etiketler tek sözlükten okunur.
  function kaoMilestoneLabels(){
    var labels={};
    keysOf(KAO_MILESTONE_LABELS).forEach(function(key){ labels[key]=KAO_MILESTONE_LABELS[key]; });
    var curriculum=window.QuranCurriculumV2,units=curriculum&&Array.isArray(curriculum.units)?curriculum.units:[];
    units.forEach(function(unit){ labels['u'+unit.id]=kaoUnitTitle(unit)+' ünitesini bitirdim'; });
    // K2F-35 (K4-04): namaz taşı gerçek kapsamı söyler (doğrulanmış namaz lemmaları); sayı yoksa eski etiket kalır.
    var prayerCount=kaoPrayerLemmaIds('namaz').length;
    if(prayerCount>0) labels.namaz='Namazda geçen '+prayerCount+' kelime tanıdık';
    return labels;
  }
  function kaoMilestoneLabel(q){
    var labels=kaoMilestoneLabels(),curriculum=window.QuranCurriculumV2,units=curriculum&&Array.isArray(curriculum.units)?curriculum.units:[];
    var keys=['shortSurahs','eighty','twoThirds','half','namaz','fatiha','besmele'].concat(units.map(function(unit){ return 'u'+unit.id; }).reverse());
    for(var i=0;i<keys.length;i+=1) if(q.milestones&&q.milestones[keys[i]]&&labels[keys[i]]) return labels[keys[i]];
    return 'İlk kilometre taşı: Fâtiha';
  }
  // KAO2-16 · 07 §6: Fâtiha/namaz taşları gerçek namaz metni lemmalarına bağlanır
  // (eski "sıklık dilimi" koşulu 03 §2 gereği düzeltildi). Yalnız doğrulanmış kimlikler sayılır.
  function kaoPrayerLemmaIds(kind){
    var shorts=window.QuranShortSurahsV1,texts=shorts&&Array.isArray(shorts.prayerTexts)?shorts.prayerTexts:[],lex=window.QuranLexiconV1,ids=Object.create(null);
    texts.filter(function(text){ return kind!=='fatiha'||text.id==='fatiha'; }).forEach(function(text){
      (Array.isArray(text.words)?text.words:[]).forEach(function(word){
        var id=word&&word.lemmaId,lemma=id&&lex&&typeof lex.byId==='function'?lex.byId(id):null;
        if(lemma&&lemma.verified===true) ids[id]=true;
      });
    });
    return Object.keys(ids);
  }
  function kaoUnitMastered(q,unitId){
    return !!objectOr(objectOr(objectOr(q.path,{}).units,{})[String(unitId)],{}).masteryAt;
  }
  function kaoS0PlacementPass(q){
    return nonNegativeNumber(objectOr(objectOr(q.onboarding,{}).placement,{}).reading,0)>=KAO_PLACEMENT_PASS;
  }
  // 'eighty' anahtarı korunur, eşiği 0,75 (KF-12): içerik token kapsamı tavanı %77,42 olduğundan %80 kazanılamıyordu.
  // Saf: yalnız henüz kazanılmamış ve koşulu sağlanan anahtarları döndürür. shortSurahs kendi yolunda (gecikmeli test).
  function kaoMilestoneCheck(d,nowIso){
    var q=quranLearnRoot(d),cards=objectOr(q.cards,{}),milestones=objectOr(q.milestones,{}),ratio=kaoCoverage(d).ratio;
    var settledForward=function(ids){ return ids.length>0&&ids.every(function(id){ return isSettled(cards['w:'+id+':ar>tr'],7); }); };
    var s0Done=!!objectOr(objectOr(objectOr(q.path,{}).lessons,{})['s0.12'],{}).doneAt;
    var reached={besmele:s0Done||kaoS0PlacementPass(q),fatiha:settledForward(kaoPrayerLemmaIds('fatiha')),namaz:settledForward(kaoPrayerLemmaIds('namaz')),half:ratio>=0.5,twoThirds:ratio>=0.68,eighty:ratio>=0.75};
    var curriculum=window.QuranCurriculumV2,units=curriculum&&Array.isArray(curriculum.units)?curriculum.units:[];
    units.forEach(function(unit){ reached['u'+unit.id]=kaoUnitMastered(q,unit.id); });
    return keysOf(reached).filter(function(key){ return reached[key]&&!milestones[key]; });
  }
  // Taş bir kez kazanılır: yalnız boş alana yazılır; kapsam düşse ya da undo yapılsa da geri alınmaz.
  function recordMilestones(q,d,now){
    var earned=kaoMilestoneCheck(d,now.toISOString());
    earned.forEach(function(key){ q.milestones[key]=now.toISOString(); });
    return earned;
  }
  var KAO_AR_TO_BW={"ء":"'","آ":"|","أ":">","ؤ":"&","إ":"<","ئ":"}","ا":"A","ب":"b","ة":"p","ت":"t","ث":"v","ج":"j","ح":"H","خ":"x","د":"d","ذ":"*","ر":"r","ز":"z","س":"s","ش":"$","ص":"S","ض":"D","ط":"T","ظ":"Z","ع":"E","غ":"g","ـ":"_","ف":"f","ق":"q","ك":"k","ل":"l","م":"m","ن":"n","ه":"h","و":"w","ى":"Y","ي":"y","ً":"F","ٌ":"N","ٍ":"K","َ":"a","ُ":"u","ِ":"i","ْ":"o","ّ":"~","ٰ":"`","ٱ":"{","ٓ":"^","ٔ":"#","۟":"@","۠":"\"","ۢ":"[","ۣ":";","ۥ":",","ۦ":".","ۨ":"!","۪":"-","۫":"+","۬":"%","ۭ":"]"};
  var KAO_DIA={"'":'ʾ','|':'ā','>':'ʾ','&':'ʾ','<':'ʾ','}':'ʾ',A:'ā',b:'b',p:'t',t:'t',v:'s̱',j:'c',H:'ḥ',x:'ḫ',d:'d','*':'ẕ',r:'r',z:'z',s:'s','$':'ş',S:'ṣ',D:'ḍ',T:'ṭ',Z:'ẓ',E:'ʿ',g:'ġ',f:'f',q:'ḳ',k:'k',l:'l',m:'m',n:'n',h:'h',w:'v',Y:'ī',y:'y',F:'an',N:'un',K:'in',a:'a',u:'u',i:'i','`':'ā','{':'a'};
  var KAO_DIA_LONG={A:'ā',Y:'ī',w:'ū',y:'ī','|':'ā','`':'ā'},KAO_DIA_IGNORE='_^#@"[;,.!-+%]o',KAO_GLIDE_NEXT='aiuFNKo~';
  // 10-TELAFFUZ §7: DİA katmanı, derleme aracının Buckwalter algoritmasının çalışma zamanı eşidir.
  function kaoDiaReading(ar){
    var chars=Array.from(String(ar||''),function(c){ return Object.prototype.hasOwnProperty.call(KAO_AR_TO_BW,c)?KAO_AR_TO_BW[c]:''; }).filter(Boolean),out=[],prevBase=null;
    var ignored=function(c){ return KAO_DIA_IGNORE.indexOf(c)>=0; };
    for(var index=0;index<chars.length;index+=1){
      var c=chars[index],lastBase=prevBase;
      if(chars[index+1]==='@'&&!ignored(c)) continue; // Uthmani ۟: taşıdığı harf okunmaz (araçla aynı kural)
      if(!ignored(c)&&c!=='~') prevBase=c;
      if('AY`'.indexOf(c)>=0&&lastBase==='F') continue;
      if(c==='~'){
        var bases=chars.slice(0,index).filter(function(x){ return !ignored(x)&&x!=='~'; }).reverse();
        if(out.length&&!(bases[0]&&bases[1]&&bases[0]===bases[1])) out.push(out[out.length-1]);
        continue;
      }
      if(ignored(c)) continue;
      var next=chars[index+1];
      if(KAO_DIA_LONG[c]&&'Yyw'.indexOf(c)>=0&&next==='`') continue;
      var afterFatha=lastBase==='a';
      if('wyY'.indexOf(c)>=0&&(KAO_GLIDE_NEXT.indexOf(next)>=0&&next!==undefined||('wy'.indexOf(c)>=0&&afterFatha&&['A','Y','`','a','i','u'].indexOf(next)<0))){ out.push(c==='w'?'v':'y'); continue; }
      var long=c==='Y'&&afterFatha?'ā':KAO_DIA_LONG[c];
      if(long){ if(out.length&&'aui'.indexOf(out[out.length-1])>=0&&out[out.length-1].length===1) out.pop(); if(out[out.length-1]===long) continue; out.push(long); continue; }
      if(Object.prototype.hasOwnProperty.call(KAO_DIA,c)) out.push(KAO_DIA[c]);
    }
    return out.join('');
  }
  function kaoReadability(){ return quranLearnDeps?objectOr(quranLearnRoot(quranLearnDeps.data()).readability,{}):{}; }
  function kaoMotionAllowed(){ var d=quranLearnDeps&&quranLearnDeps.data(); return !!(d&&d.settings&&d.settings.premiumAtmosphere); }
  function kaoSettingsOf(){ return quranLearnDeps?objectOr(quranLearnRoot(quranLearnDeps.data()).settings,{}):{}; }
  function kaoTranslitLayer(){ return kaoSettingsOf().translitLayer==='dia'?'dia':'tr'; }
  function kaoAudioStyle(){ return kaoSettingsOf().audioStyle==='flowing'?'flowing':'measured'; }
  // K2F-25: tanış kartı katmanları. Yalnız içerik modüllerinden gelen doğrulanmış bilgi gösterilir; eksikse katman hiç çizilmez (tahmin yok).
  function kaoIntroExample(lemma){
    var source=lemma&&lemma.verified===true&&Array.isArray(lemma.examples)?lemma.examples[0]:null;
    if(!source||!source.ar||!source.tr||!source.ref||!source.pronunciation) return null;
    return {ar:String(source.ar),pronunciation:String(source.pronunciation),tr:String(source.tr),ref:String(source.ref)};
  }
  function kaoIntroWhy(lemma){
    var grammar=window.QuranGrammarV1,unit=grammar&&grammar.unit11,roots=unit&&Array.isArray(unit.roots)?unit.roots:[],row=null,why={};
    for(var i=0;i<roots.length&&lemma&&lemma.root;i+=1){ if(roots[i]&&roots[i].root===lemma.root){ row=roots[i]; break; } }
    if(row) why.root={ar:String(row.root),reading:String(row.pronunciation||''),meaning:String(row.meaning||''),derivatives:(Array.isArray(row.derivatives)?row.derivatives:[]).map(function(item){ return String(item&&item.tr||''); }).filter(Boolean)};
    if(lemma&&lemma.cognate&&lemma.cognate.shift) why.shift=String(lemma.cognate.shift);
    return why.root||why.shift?why:null;
  }
  function kaoLemmaReading(lemmaId,fallback){
    var lex=window.QuranLexiconV1,lemma=lemmaId&&lex&&typeof lex.byId==='function'?lex.byId(lemmaId):null;
    if(!lemma||!lemma.translit) return String(fallback||'');
    return kaoTranslitLayer()==='dia'?(kaoDiaReading(lemma.ar)||lemma.translit):lemma.translit;
  }
  function kaoStripHarakat(text){ return String(text||'').replace(/[\u064b-\u065f\u0670\u06d6-\u06ed]/g,''); }
  var KAO_READABILITY_SAMPLE='بِسْمِ ٱللَّهِ';
  function kaoColorHarakat(text){
    return String(text||'').replace(/\u064e/g,'<span class="kao-h-fatha">َ</span>').replace(/\u0650/g,'<span class="kao-h-kesra">ِ</span>').replace(/\u064f/g,'<span class="kao-h-damma">ُ</span>');
  }
  function kaoReadabilityStyle(){
    if(!quranLearnDeps) return '--kao-ar-lh:2.2;--kao-ar-ws:normal';
    var q=ensureQuranLearn(quranLearnDeps.data()),r=q.readability||{},map={compact:'1.9',normal:'2.2',wide:'2.5'},line=map[r.lineHeight]||(['1.9','2.2','2.5'].indexOf(String(r.lineHeight))>=0?String(r.lineHeight):'2.2');
    return '--kao-ar-lh:'+line+';--kao-ar-ws:'+(r.wordSpacing==='wide'?'.18em':'normal');
  }
  function gateArabic(text,q){ return q&&q.readability&&q.readability.coloredHarakat?kaoColorHarakat(text):quranLearnDeps.esc(text); }
  function kaoGateLessons(){
    var p=window.QuranPhonicsV1,letters=p&&Array.isArray(p.letters)?p.letters:[],rules=p&&Array.isArray(p.rules)?p.rules:[],byId=Object.create(null);
    letters.forEach(function(letter){ byId[letter.id]=letter; });
    var specs=[['A-kova harfler 1',['ba','ta','jim']],['A-kova harfler 2',['dal','ra','zay']],['A-kova harfler 3',['sin','shin','fa']],['Konum şekilleri ve birleştirme',['kaf','lam','mim']],['Harf sesleri ve dudaklar',['nun','ha','waw']],['Hareke, med ve şedde',['ya']],['Kalınlık: ط ض ص',['tta','dad','sad']],['Dil kökü ve boğaz: ق ح',['qaf','hah']],['Peltek sesler: ث ذ ظ',['tha','dhal','zah']],['Boğaz sesleri: ع غ خ',['ayn','ghayn','khah']],['Elif-lâm ve vasıl hemzesi',['hamza']],['Vakıf ve okuma provası',[]]];
    return specs.map(function(spec,index){ return {id:'t0-'+(index+1),title:spec[0],sounds:spec[1].map(function(id){ return byId[id]; }).filter(Boolean),rules:index===5?rules.slice(0,2):(index===10?rules.slice(2,4):(index===11?rules.slice(4):[]))}; });
  }
  // K2F-34: okuma çeldiricileri en sık KAO_GATE_POOL kelimeden, doğru okunuşa uzunlukça en yakın (biri ≥, biri ≤) seçilir; doğru şık 3 konuma
  // dönüşümlü yerleşir; aynı Arapçanın hiçbir okunuşu çeldirici olmaz. Belirlenimci. Havuz yetmezse (örn. cevap havuzun en uzunu) en yakın olanlar alınır.
  var KAO_GATE_POOL=60;
  function kaoReadingLength(text){ return String(text||'').normalize('NFC').length; }
  function kaoGateChoices(pool,index,all){
    var lemma=pool[index],size=kaoReadingLength(lemma.translit),seen=Object.create(null),near=[];
    all.forEach(function(item){ if(item.ar===lemma.ar) seen[item.translit]=true; });
    seen[lemma.translit]=true;
    pool.forEach(function(item,at){
      if(seen[item.translit]) return;
      seen[item.translit]=true; near.push({text:item.translit,gap:kaoReadingLength(item.translit)-size,turn:(at-index+pool.length)%pool.length});
    });
    function closer(a,b){ return Math.abs(a.gap)-Math.abs(b.gap)||a.turn-b.turn; }
    function nearest(side,skip){ return near.filter(function(item){ return item!==skip&&(side>0?item.gap>=0:item.gap<=0); }).sort(closer)[0]; }
    var up=nearest(1),down=nearest(-1,up),wrong=[up,down].filter(Boolean);
    near.filter(function(item){ return wrong.indexOf(item)<0; }).sort(closer).slice(0,2-wrong.length).forEach(function(item){ wrong.push(item); });
    var choices=wrong.map(function(item){ return item.text; });
    choices.splice(index%3,0,lemma.translit);
    return choices;
  }
  function kaoGateTasks(){
    var lex=window.QuranLexiconV1,p=window.QuranPhonicsV1,verified=lex&&Array.isArray(lex.lemmas)?lex.lemmas.filter(function(lemma){ return lemma.verified===true&&lemma.translit; }):[],lemmas=verified.slice(0,20),pool=verified.slice(0,KAO_GATE_POOL),pairs=p&&Array.isArray(p.pairs)?p.pairs.slice(0,12):[],letters=p&&Array.isArray(p.letters)?p.letters:[];
    function letter(id){ return letters.find(function(item){ return item.id===id; })||{id:id,ar:id}; }
    return {reading:lemmas.map(function(lemma,index){ return {id:'read-'+lemma.id,ar:lemma.ar,answer:lemma.translit,choices:kaoGateChoices(pool,index,verified)}; }),listening:pairs.map(function(pair,index){ var target=letter(index%2?pair.b:pair.a),other=letter(index%2?pair.a:pair.b); return {id:'listen-'+pair.id,pairId:pair.id,answer:target.id,choices:Math.floor(index/2)%2?[other,target]:[target,other]}; }),lessons:kaoGateLessons()};
  }
  function finishGate(reading,listening,deferred){
    var q=ensureQuranLearn(quranLearnDeps.data()),ui=quranLearnDeps.ui(); q.gate.passed=reading>=18&&(deferred||listening>=10); q.gate.skipped=reading>=18&&!deferred&&listening>=10; q.gate.score=reading+(deferred?0:listening); q.gate.at=new Date().toISOString(); ui.kaoGatePhase=q.gate.skipped?'result':'lessons'; ui.kaoGateAudioDeferred=!!deferred; kaoSave(); quranLearnDeps.render(); return true;
  }
  function kaoGate(action,value){
    if(!quranLearnDeps) return false;
    var ui=quranLearnDeps.ui(),q=ensureQuranLearn(quranLearnDeps.data()),tasks=kaoGateTasks(); action=action||'start';
    if(action==='start'){ kaoApplyView(ui,'gate',null,ui.kaoView==='gate'?'replace':'push'); ui.kaoGatePhase='reading'; ui.kaoGateIndex=0; ui.kaoGateReadingScore=0; ui.kaoGateListeningScore=0; ui.kaoGateAudioDeferred=false; ui.kaoAudioFailed=false; quranLearnDeps.render(); return true; }
    if(action==='answer'){
      var listening=ui.kaoGatePhase==='listening',list=listening?tasks.listening:tasks.reading,item=list[Math.max(0,Math.floor(nonNegativeNumber(ui.kaoGateIndex,0)))]; if(!item) return false;
      if(String(value)===String(item.answer)){ if(listening) ui.kaoGateListeningScore=(ui.kaoGateListeningScore||0)+1; else ui.kaoGateReadingScore=(ui.kaoGateReadingScore||0)+1; }
      ui.kaoGateIndex=(ui.kaoGateIndex||0)+1; if(ui.kaoGateIndex>=list.length){ if(!listening){ ui.kaoGatePhase='listening'; ui.kaoGateIndex=0; } else return finishGate(ui.kaoGateReadingScore||0,ui.kaoGateListeningScore||0,false); } quranLearnDeps.render(); return true;
    }
    if(action==='play'){
      var pair=String(value||''); if(!/^mp_[a-z_]+$/.test(pair)||!quranLearnSurfaceDeps||typeof quranLearnSurfaceDeps.createAudio!=='function') return false; var audio=quranLearnSurfaceDeps.createAudio('assets/kao/audio/p-'+pair+'.m4a'),failed=function(){ ui.kaoAudioFailed=true; quranLearnDeps.render(); }; if(typeof audio.addEventListener==='function') audio.addEventListener('error',failed,{once:true}); try{ var play=audio.play(); if(play&&typeof play.catch==='function') play.catch(failed); }catch(_error){ failed(); } return true;
    }
    if(action==='audio-unavailable'&&ui.kaoAudioFailed) return finishGate(ui.kaoGateReadingScore||0,0,true);
    if(action==='lesson'){ kaoApplyView(ui,'gate',null,ui.kaoView==='gate'?'replace':'push'); ui.kaoGatePhase='lesson'; ui.kaoGateLesson=Math.max(0,Math.min(11,Math.floor(nonNegativeNumber(value,0)))); quranLearnDeps.render(); return true; }
    if(action==='readability'&&value&&typeof value==='object'){ if(['1.9','2.2','2.5'].indexOf(String(value.lineHeight))>=0) q.readability.lineHeight=String(value.lineHeight); if(['normal','wide'].indexOf(value.wordSpacing)>=0) q.readability.wordSpacing=value.wordSpacing; if(typeof value.coloredHarakat==='boolean') q.readability.coloredHarakat=value.coloredHarakat; kaoSave(); quranLearnDeps.render(); return true; }
    return false;
  }
  function kaoGateHTML(){
    if(!quranLearnDeps) return '';
    var q=ensureQuranLearn(quranLearnDeps.data()),ui=quranLearnDeps.ui(),tasks=kaoGateTasks(),phase=ui.kaoGatePhase||'reading',index=Math.max(0,Math.floor(nonNegativeNumber(ui.kaoGateIndex,0))),h='<main class="kao-gate" aria-labelledby="kao-gate-title"><div class="kao-view-head"><div><p class="kao-eyebrow">Seviye 0</p><h2 id="kao-gate-title">Harf · ses · hareke</h2></div><button type="button" class="kao-back" onclick="App.kaoSetView(\'home\')">Geri</button></div>';
    if(phase==='reading'){ var read=tasks.reading[index]; h+='<p class="kao-gate-note">20 kısa seçim · utanma yok, yalnız başlangıç yerini buluyoruz.</p>'+(read?'<section class="kao-gate-task"><small>'+(index+1)+' / 20</small><p class="kao-gate-ar" lang="ar" dir="rtl">'+gateArabic(read.ar,q)+'</p><h3>Doğru okunuşu seç</h3><div class="kao-choices">'+read.choices.map(function(choice){ return '<button type="button" onclick="App.kaoGate(\'answer\',\''+quranLearnDeps.esc(choice)+'\')">'+quranLearnDeps.esc(choice)+'</button>'; }).join('')+'</div></section>':''); }
    else if(phase==='listening'){ var listen=tasks.listening[index]; h+='<p class="kao-gate-note">12 minimal çift · sesi açamazsan bu bölüm ertelenir.</p>'+(listen?'<section class="kao-gate-task"><small>'+(index+1)+' / 12</small><button type="button" class="kao-audio" onclick="App.kaoGate(\'play\',\''+listen.pairId+'\')">'+quranLearnDeps.icon('headphones',17)+' Sesi dinle</button><h3>Hangi harf?</h3><div class="kao-choices">'+listen.choices.map(function(choice){ return '<button type="button" lang="ar" dir="rtl" onclick="App.kaoGate(\'answer\',\''+choice.id+'\')">'+choice.ar+'</button>'; }).join('')+'</div>'+(ui.kaoAudioFailed?'<button type="button" class="kao-secondary" onclick="App.kaoGate(\'audio-unavailable\')">Ses bölümünü ertele</button>':'')+'</section>':''); }
    else if(phase==='lesson'){ var lesson=tasks.lessons[Math.max(0,Math.floor(nonNegativeNumber(ui.kaoGateLesson,0)))]; h+='<section class="kao-lesson"><p class="kao-eyebrow">Mini ders '+((ui.kaoGateLesson||0)+1)+' / 12</p><h3>'+quranLearnDeps.esc(lesson.title)+'</h3><div class="kao-sounds">'+lesson.sounds.map(function(sound){ return '<article><b lang="ar" dir="rtl">'+sound.ar+'</b><span>'+quranLearnDeps.esc(sound.tipTr)+'</span></article>'; }).join('')+'</div>'+lesson.rules.map(function(rule){ return '<p>'+quranLearnDeps.esc(rule.tipTr)+'</p>'; }).join('')+'</section>'; }
    else h+='<section class="kao-gate-result"><h3>Kapıyı geçtin</h3><p>Temel harf ve ses derslerini atlayabilirsin.</p></section>';
    h+='<section class="kao-readability"><h3>Okuma görünümü</h3><p style="'+kaoReadabilityStyle()+'" class="kao-gate-ar" lang="ar" dir="rtl">'+gateArabic(KAO_READABILITY_SAMPLE,q)+'</p><div><button type="button" onclick="App.kaoGate(\'readability\',{lineHeight:\'1.9\'})">Sıkı</button><button type="button" onclick="App.kaoGate(\'readability\',{lineHeight:\'2.2\'})">Rahat</button><button type="button" onclick="App.kaoGate(\'readability\',{lineHeight:\'2.5\',wordSpacing:\'wide\'})">Geniş</button><button type="button" onclick="App.kaoGate(\'readability\',{coloredHarakat:'+(q.readability.coloredHarakat?'false':'true')+'})">Renkli hareke: '+(q.readability.coloredHarakat?'açık':'kapalı')+'</button></div></section><h3>İstersen hızlıca hatırlayalım</h3><div class="kao-lesson-grid">'+tasks.lessons.map(function(lesson,i){ return '<button type="button" onclick="App.kaoGate(\'lesson\','+i+')"><span>'+String(i+1).padStart(2,'0')+'</span>'+quranLearnDeps.esc(lesson.title)+'</button>'; }).join('')+'</div>'+(ui.kaoGateAudioDeferred?'<p class="kao-gate-deferred">Ses bölümü ertelendi; ilk ses erişiminde T0 açılacak.</p>':'')+'</main>'; return h;
  }
  function kaoRootCatalog(){
    var grammar=window.QuranGrammarV1,roots=grammar&&grammar.unit11&&Array.isArray(grammar.unit11.roots)?grammar.unit11.roots:[];
    return roots.map(function(item){ return {root:String(item.root||''),pronunciation:String(item.pronunciation||''),meaning:String(item.meaning||''),derivatives:(Array.isArray(item.derivatives)?item.derivatives:[]).map(function(derivative){ return {tr:String(derivative.tr||''),pattern:String(derivative.pattern||'')}; })}; }).filter(function(item){ return item.root; });
  }
  function kaoRootLemmaIds(root){
    var lex=window.QuranLexiconV1,ids=lex&&lex.roots&&lex.roots[root];
    return Array.isArray(ids)?ids.slice():[];
  }
  function rootDetail(root){ return kaoRootCatalog().find(function(item){ return item.root===root; })||null; }
  // KAO2-20 · S-11 kök aileleri. Öğrenme sırasındaki 73 aile önce; 301 köklük sözlük
  // isteğe bağlı keşif katmanı. Anlam/türev yalnız unit11'de bulunan 73 kökte vardır.
  function kaoRootStatus(q,lemmaId,known){ return known[lemmaId]?'known':(q&&q.cards&&q.cards[wordCardId(q,lemmaId)]?'learning':'new'); }
  function kaoRootsModel(){
    var catalog=kaoRootCatalog(),q=quranLearnDeps?ensureQuranLearn(quranLearnDeps.data()):null,known=q?kaoKnownLemmaSet(q):{};
    var families=catalog.map(function(item){
      var ids=kaoRootLemmaIds(item.root),learnt=ids.filter(function(id){ return !!known[id]; }).length;
      return {root:item.root,pronunciation:item.pronunciation,meaning:item.meaning,derivativeCount:item.derivatives.length,lemmaCount:ids.length,knownCount:learnt};
    });
    var lex=window.QuranLexiconV1,rootsMap=lex&&lex.roots&&typeof lex.roots==='object'?lex.roots:{};
    var detail=Object.create(null); catalog.forEach(function(item){ detail[item.root]=item; });
    var all=Object.keys(rootsMap).map(function(root){
      var ids=Array.isArray(rootsMap[root])?rootsMap[root]:[],d=detail[root];
      return {root:root,lemmaCount:ids.length,meaning:d?d.meaning:'',derivativeCount:d?d.derivatives.length:0,knownCount:ids.filter(function(id){ return !!known[id]; }).length};
    }).sort(function(a,b){ return b.lemmaCount-a.lemmaCount||(a.root<b.root?-1:(a.root>b.root?1:0)); });
    var ui=quranLearnDeps?quranLearnDeps.ui():{},allVisible=ui.kaoRootsAll===true,query=String(ui.kaoRootsQuery||'').trim();
    var list=allVisible?all:families;
    if(query){ var needle=query.toLocaleLowerCase('tr'); list=list.filter(function(item){ return item.root.indexOf(query)>=0||String(item.meaning||'').toLocaleLowerCase('tr').indexOf(needle)>=0; }); }
    return {families:families,all:allVisible?list:all,visible:list,allCount:all.length,allVisible:allVisible,query:query};
  }
  function kaoRootModel(root){
    var detail=rootDetail(root),q=quranLearnDeps?ensureQuranLearn(quranLearnDeps.data()):null,known=q?kaoKnownLemmaSet(q):{},lex=window.QuranLexiconV1;
    var lemmas=kaoRootLemmaIds(root).map(function(id){
      var lemma=lex&&typeof lex.byId==='function'?lex.byId(id):null;
      if(!lemma) return null;
      return {lemmaId:id,ar:String(lemma.ar||''),tr:String((lemma.meanings&&lemma.meanings[0])||''),status:kaoRootStatus(q,id,known)};
    }).filter(Boolean);
    var knownCount=lemmas.filter(function(item){ return item.status==='known'; }).length;
    var masteredText=!lemmas.length?'Bu kökten henüz müfredatta kelime yok.':(knownCount===lemmas.length?'Bu aileden '+String(lemmas.length)+' kelimenin tamamını biliyorsun.':String(knownCount)+' / '+String(lemmas.length)+' kelime öğrenildi.');
    return {root:root,pronunciation:detail?detail.pronunciation:'',meaning:detail?detail.meaning:'',derivatives:detail?detail.derivatives:[],lemmas:lemmas,knownCount:knownCount,masteredText:masteredText};
  }
  function kaoRootOpen(root){
    if(!quranLearnDeps) return false;
    var name=String(root||''),lex=window.QuranLexiconV1;
    if(!rootDetail(name)&&!(lex&&lex.roots&&lex.roots[name])) return false;
    var ui=quranLearnDeps.ui(); ui.kaoRoot=name; ui.kaoRootsAll=false; ui.kaoRootsQuery='';
    if(ui.kaoOpen&&quranLearnDeps.ui().kaoView!=='roots'){ kaoApplyView(ui,'roots',null,'push'); quranLearnDeps.render(); return true; }
    quranLearnDeps.render(); return true;
  }
  function kaoRoots(action,value){
    if(!quranLearnDeps) return false;
    var ui=quranLearnDeps.ui();
    if(action==='list'){ ui.kaoRoot=null; ui.kaoRootsQuery=''; quranLearnDeps.render(); return true; }
    if(action==='all'){ ui.kaoRootsAll=ui.kaoRootsAll!==true; quranLearnDeps.render(); return true; }
    if(action==='query'){ ui.kaoRootsQuery=String(value||''); quranLearnDeps.render(); return true; }
    if(action==='open') return kaoRootOpen(value);
    return false;
  }
  function kaoOpenRoots(){
    if(!quranLearnDeps) return false;
    var ui=quranLearnDeps.ui(); ui.kaoRoot=null; ui.kaoRootsAll=false; ui.kaoRootsQuery='';
    if(!ui.kaoOpen) return kaoOpen('roots');
    kaoShadowCleanup(); return kaoNav('roots',null);
  }
  // (f/B2) KAO2-21 S0 yüzeyi: kapı DOKUNULMAZ; Seviye 0 burada, AYRI yaşar.
  function kaoS0Start(lessonId){
    if(!quranLearnDeps) return false;
    var flow=kaoS0Lesson(lessonId); if(!flow) return false;
    var ui=quranLearnDeps.ui(),q0=ensureQuranLearn(quranLearnDeps.data()),rec0=kaoLessonRecord(q0,flow.id);
    if(!rec0.startedAt){ rec0.startedAt=new Date().toISOString(); kaoSave(); }
    ui.kaoS0={lessonId:flow.id,stage:0,answered:{},drill:null,showReading:false,done:false}; ui.kaoS0Note='';
    return true;
  }
  function kaoS0CanAudio(){
    return !!(quranLearnSurfaceDeps&&typeof quranLearnSurfaceDeps.createAudio==='function'&&quranLearnSurfaceDeps.isQuietTime!==true);
  }
  function kaoS0Play(srcs,onFail){
    if(!kaoS0CanAudio()||!srcs.length) return false;
    var i=0,step=function(){
      if(i>=srcs.length) return;
      var a=quranLearnSurfaceDeps.createAudio(KAO_PHONICS_AUDIO+srcs[i]); i+=1;
      if(!a){ if(typeof onFail==='function') onFail(); return; }
      a.preload='none';
      if(typeof a.addEventListener==='function') a.addEventListener('ended',step,{once:true});
      try{ var r=a.play(); if(r&&typeof r.catch==='function') r.catch(function(){ if(typeof onFail==='function') onFail(); }); }catch(_e){ if(typeof onFail==='function') onFail(); }
    };
    step(); return true;
  }
  function kaoS0(action,value){
    if(!quranLearnDeps) return false;
    var ui=quranLearnDeps.ui(),state=objectOr(ui.kaoS0,{});
    // K2F-12 (K5-02 i, ii): başlatma S0 görünümünü gerçekten açar (ana ekran → s0); s0'dayken ders değişimi üst öğeyi değiştirir.
    if(action==='start'){ if(!kaoS0Start(value)) return false; kaoApplyView(ui,'s0',value,ui.kaoView==='s0'?'replace':'push'); quranLearnDeps.render(); return true; }
    if(action==='next'){
      var flow=kaoS0Lesson(state.lessonId); if(!flow||state.done===true) return false;
      var stageKind=flow.stages[Math.min(flow.stages.length-1,Math.floor(nonNegativeNumber(state.stage,0)))].kind;
      if(stageKind==='drill'){
        // Alıştırma bitmeden `next` pasif: geçerli soru cevaplanmadan ilerlenmez; son soru cevaplanınca bir sonraki aşamaya geçilir.
        var drill=state.drill; if(!drill||drill.picked===null) return false;
        if(drill.index<drill.items.length-1){ drill.index+=1; drill.picked=null; ui.kaoS0=state; quranLearnDeps.render(); return true; }
      }
      if(stageKind==='read') return false;
      return kaoS0Advance(ui,state,flow);
    }
    if(action==='answer'){
      var f2=kaoS0Lesson(state.lessonId),dr=state.drill;
      if(!f2||state.done===true||!dr||dr.picked!==null||f2.stages[Math.floor(nonNegativeNumber(state.stage,0))].kind!=='drill') return false;
      var item=dr.items[dr.index],choice=item&&item.choices.filter(function(c){ return c.id===value; })[0];
      if(!choice) return false;
      dr.picked=choice.id; dr.results.push(choice.correct===true); if(choice.correct===true) dr.correct+=1;
      ui.kaoS0=state; quranLearnDeps.render(); return true;
    }
    if(action==='audio'){
      var f=kaoS0Lesson(state.lessonId),w=f&&(f.kind==='focus'?(f.examples||[])[Math.floor(Number(value))]:f.word);
      if(!w||!w.file) return false;
      if(!kaoS0CanAudio()){ ui.kaoS0Note='Bu cihazda ya da sessiz saatte ses kapalı; kelimeyi görerek öğren.'; quranLearnDeps.render(); return false; }
      var started=kaoS0Play([w.file],function(){ ui.kaoS0Note='Ses yüklenemedi; görsel akışla sürdür.'; quranLearnDeps.render(); });
      if(!started) ui.kaoS0Note='Ses başlatılamadı; görsel akışla sürdür.';
      quranLearnDeps.render(); return started;
    }
    if(action==='playall'){
      var ff=kaoS0Lesson(state.lessonId),ws=ff&&ff.words?ff.words:[];
      if(!ws.length) return false;
      if(!kaoS0CanAudio()){ ui.kaoS0Note='Bu cihazda ya da sessiz saatte ses kapalı; okunuşları okuyarak ilerle.'; quranLearnDeps.render(); return false; }
      var ok=kaoS0Play(ws.map(function(x){ return x.clip; }),function(){ ui.kaoS0Note='Ses yüklenemedi; okunuşları okuyarak ilerle.'; quranLearnDeps.render(); });
      quranLearnDeps.render(); return ok;
    }
    if(action==='read'){
      if(value==='toggle'){ state.showReading=state.showReading!==true; ui.kaoS0=state; quranLearnDeps.render(); return true; }
      var f3=kaoS0Lesson(state.lessonId);
      if(f3&&f3.stages[Math.floor(nonNegativeNumber(state.stage,0))].kind==='read'){
        state.done=true; ui.kaoS0=state; ui.kaoS0Note=f3.kind==='reading'?'Besmele ve Fâtiha’yı kelime kelime okudun.':'Gerçek kelimeyi okudun.';
        kaoS0Complete(f3,state); quranLearnDeps.render(); return true;
      }
      ui.kaoS0Note='Besmele ve Fâtiha’yı kelime kelime okudun.'; quranLearnDeps.render(); return true;
    }
    return false;
  }
  // K2F-14 · S0 alıştırmaları: dersin `focus`'una göre 6–8 puanlı, BELİRLENİMCİ (ders kimliği tohum) soru. Arapça ve okunuş yalnız modül verisinden
  // (QuranPhonicsV1 harfleri/okunuşları, QuranCurriculumV2 örnek kelimeleri, QuranShortSurahsV1 Fâtiha); çeldiriciler önce aynı dersten.
  var S0_DRILL_TARGET=8;
  function s0Order(list,seed,labelOf){
    return list.slice().sort(function(a,b){ var ka=String(labelOf(a)),kb=String(labelOf(b)); return seededRank(seed,ka)-seededRank(seed,kb)||ka.localeCompare(kb); });
  }
  // correct + önce `near` sonra `far` havuzundan benzersiz etiketli çeldiriciler (toplam ≤ 4 şık); <2 şık çıkarsa null.
  function s0Choices(correct,near,far,seed){
    var seen=Object.create(null),list=[correct],label=function(c){ return c.label; };
    seen[correct.label]=1;
    [near,far].forEach(function(pool){
      s0Order(pool,seed,label).forEach(function(c){ if(list.length>=4||!c.label||seen[c.label]) return; seen[c.label]=1; list.push(c); });
    });
    if(list.length<2) return null;
    return s0Order(list,seed+'|final',label).map(function(c,i){ return {id:'c'+i,label:c.label,ar:c.ar===true,correct:c===correct}; });
  }
  function s0Okunus(letter){
    var ph=window.QuranPhonicsV1,map=ph&&ph.translit&&ph.translit.bwToOkunus?ph.translit.bwToOkunus:{};
    return String(map[letter.bw]||letter.bw||'');
  }
  function kaoS0DrillItems(flow){
    var cur=window.QuranCurriculumV2,ph=window.QuranPhonicsV1,letters=ph&&Array.isArray(ph.letters)?ph.letters:[],byId={},items=[],seed=String(flow.id);
    letters.forEach(function(l){ byId[l.id]=l; });
    var table=kaoS0PositionTable(),rowOf={};
    table.rows.forEach(function(r){ rowOf[r.letterId]=r; });
    function add(type,prompt,stimulus,correct,near,far){
      if(items.length>=S0_DRILL_TARGET) return;
      var choices=s0Choices(correct,near,far,seed+'|'+items.length);
      if(choices) items.push({id:seed+':q'+items.length,type:type,prompt:prompt,stimulus:stimulus,choices:choices,answerLabel:correct.label});
    }
    function positionItem(letter,salt){
      var row=rowOf[letter.id];
      if(!row) return;
      var cells=row.cells.map(function(cell,i){ return {cell:cell,label:table.columns[i].label}; }).filter(function(x){ return !x.cell.unavailable&&x.cell.ar; });
      if(!cells.length) return;
      var pick=cells[seededRank(seed+'|pos|'+salt,letter.id)%cells.length];
      add('position','Bu şekil harfin hangi konumu?',{ar:pick.cell.ar},{label:pick.label},[],table.columns.map(function(c){ return {label:c.label}; }));
    }
    function allMarks(){
      var seen=Object.create(null),out=[];
      (cur&&cur.s0&&cur.s0.lessons||[]).forEach(function(l){ ((l.focus&&l.focus.marks)||[]).forEach(function(m){ if(!seen[m.id]){ seen[m.id]=1; out.push(m); } }); });
      return out;
    }
    function allExamples(){
      var seen=Object.create(null),out=[];
      (cur&&cur.s0&&cur.s0.lessons||[]).forEach(function(l){ (l.examples||[]).forEach(function(e){ if(!seen[e.wordId]){ seen[e.wordId]=1; out.push(e); } }); });
      return out;
    }
    if(flow.kind==='reading'){
      var seenTr=Object.create(null),words=flow.words.filter(function(w){ if(!w.ar||!w.tr||seenTr[w.tr]) return false; seenTr[w.tr]=1; return true; });
      var picked=s0Order(words,seed+'|words',function(w){ return w.ar; }).slice(0,S0_DRILL_TARGET);
      picked.forEach(function(w){ add('word-meaning','Bu kelime ne demek?',{ar:w.ar},{label:w.tr},[],words.map(function(x){ return {label:x.tr}; })); });
      return items;
    }
    if(flow.kind==='focus'&&flow.focus.kind==='positions'){
      var joining=s0Order(letters.filter(function(l){ var r=rowOf[l.id]; return r&&r.cells[1]&&!r.cells[1].unavailable; }),seed+'|letters',function(l){ return l.id; }).slice(0,4);
      joining.forEach(function(l,i){ positionItem(l,i); });
      joining.forEach(function(l){
        var row=rowOf[l.id],form=row.cells[2]&&!row.cells[2].unavailable?row.cells[2]:row.cells[1];
        add('form-letter','Bu şekil hangi harfe ait?',{ar:form.ar},{label:row.cells[0].ar,ar:true},[],letters.filter(function(o){ return o.id!==l.id&&rowOf[o.id]; }).map(function(o){ return {label:rowOf[o.id].cells[0].ar,ar:true}; }));
      });
      return items;
    }
    if(flow.kind==='focus'){
      var marks=flow.focus.marks||[],examples=flow.examples||[],pool=allExamples(),poolMarks=allMarks();
      marks.slice(0,3).forEach(function(m){ add('mark-name','Bu işaretin adı ne?',{glyph:m.glyph},{label:m.tr},marks.filter(function(x){ return x.id!==m.id; }).map(function(x){ return {label:x.tr}; }),poolMarks.map(function(x){ return {label:x.tr}; })); });
      examples.slice(0,3).forEach(function(e){ add('word-sound','Bu kelime nasıl okunur?',{ar:e.ar},{label:e.translit},examples.map(function(x){ return {label:x.translit}; }),pool.map(function(x){ return {label:x.translit}; })); });
      examples.slice(0,3).forEach(function(e){ add('word-meaning','Bu kelime ne demek?',{ar:e.ar},{label:e.tr},examples.map(function(x){ return {label:x.tr}; }),pool.map(function(x){ return {label:x.tr}; })); });
      return items;
    }
    // Harf dersleri: harf tanı ×3 · şekil ×2 · konum ×3 (stage.drills ile aynı dağılım)
    var mine=(flow.letters||[]).map(function(l){ return byId[l.id]; }).filter(Boolean);
    if(!mine.length) return items;
    var familyOkunus=mine.map(function(l){ return {label:s0Okunus(l)}; }),everyOkunus=letters.map(function(l){ return {label:s0Okunus(l)}; });
    for(var i=0;i<3;i+=1){ var l1=mine[i%mine.length]; add('letter-id','Bu harf hangi sesi verir?',{ar:l1.ar},{label:s0Okunus(l1)},familyOkunus,everyOkunus); }
    for(var j=0;j<2;j+=1){
      var l2=mine[(j+1)%mine.length],sound=s0Okunus(l2);
      var shapeNear=mine.filter(function(o){ return s0Okunus(o)!==sound; }).map(function(o){ return {label:o.ar,ar:true}; }),shapeFar=letters.filter(function(o){ return s0Okunus(o)!==sound; }).map(function(o){ return {label:o.ar,ar:true}; });
      add('shape','Hangi harf «'+sound+'» sesini verir?',{text:sound},{label:l2.ar,ar:true},shapeNear,shapeFar);
    }
    for(var k=0;k<3;k+=1) positionItem(mine[k%mine.length],k);
    return items;
  }
  function kaoS0DrillInit(flow){ return {items:kaoS0DrillItems(flow),index:0,correct:0,picked:null,results:[]}; }
  var S0_STAGE_LABELS={intro:'Açıklama',listen:'Dinle ve gör',drill:'Alıştırma',read:'Gerçek kelime',done:'Bitti'};
  function kaoS0Intro(flow){
    var letters=flow.letters||[],marks=flow.kind==='focus'?(flow.focus.marks||[]):[],sentence;
    if(flow.kind==='reading') sentence='Bu derste kısa bir metni kelime kelime dinleyerek okuyacaksın.';
    else if(flow.kind==='focus'&&flow.focus.kind==='positions') sentence='28 harfin her biri dört konumda yazılır: tek, başta, ortada, sonda.';
    else if(marks.length) sentence='Bu derste '+marks.length+' işaret var; her birini örnek kelimelerde göreceksin.';
    else sentence='Bu derste '+letters.length+' harf var; hepsini şekliyle ve sesiyle tanıyacaksın.';
    return {sentence:sentence,letters:letters,marks:marks};
  }
  function kaoS0StageModel(flow,state){
    var ui=quranLearnDeps.ui(),stages=flow.stages,index=Math.min(stages.length-1,Math.max(0,Math.floor(nonNegativeNumber(state.stage,0)))),stageKind=state.done?'done':stages[index].kind;
    var model={lessonId:flow.id,title:flow.title,goal:flow.goal,note:ui.kaoS0Note||'',stage:{index:state.done?stages.length-1:index,count:stages.length,kind:stageKind,label:S0_STAGE_LABELS[stageKind]||''}};
    var canAudio=kaoS0CanAudio();
    if(stageKind==='intro') model.intro=kaoS0Intro(flow);
    else if(stageKind==='listen'){
      var table=kaoS0PositionTable(),firstRow=flow.letters&&flow.letters[0]?table.rows.filter(function(r){ return r.letterId===flow.letters[0].id; })[0]:null;
      model.listen={kind:flow.kind,canAudio:canAudio,words:flow.words||[],marks:flow.kind==='focus'?(flow.focus.marks||[]):[],examples:flow.examples||[],
        word:flow.kind==='lesson'&&flow.word?flow.word:null,positionRow:firstRow||null,columns:table.columns,table:flow.kind==='focus'&&flow.focus.kind==='positions'?table:null};
    }else if(stageKind==='drill'){
      var drill=state.drill||kaoS0DrillInit(flow),item=drill.items[drill.index],picked=drill.picked;
      var correctChoice=item.choices.filter(function(c){ return c.correct; })[0];
      model.drill={index:drill.index,total:drill.items.length,correct:drill.correct,question:{prompt:item.prompt,stimulus:item.stimulus,picked:picked,
        choices:item.choices.map(function(c){ return {id:c.id,label:c.label,ar:c.ar,correct:picked!==null&&c.correct}; }),correct:picked!==null&&picked===correctChoice.id,answerLabel:item.answerLabel}};
    }else if(stageKind==='read'){
      var readWord=flow.kind==='lesson'?flow.word:(flow.kind==='focus'?(flow.examples&&flow.examples[0]?flow.examples[0]:flow.word):null);
      model.read={showReading:state.showReading===true,words:flow.kind==='reading'?flow.words:null,word:readWord};
    }else{
      var dr=state.drill||{items:[],correct:0};
      model.done={correct:dr.correct,total:dr.items.length};
    }
    return model;
  }
  // K2F-15 (K5-02 iii): S0 dersi YALNIZ read aşaması bitince kaydedilir: {startedAt, doneAt, score = alıştırma doğru/toplam}; Besmele taşı s0.12'ye bağlıdır.
  function kaoS0Complete(flow,state){
    var d=quranLearnDeps.data(),q=ensureQuranLearn(d),rec=kaoLessonRecord(q,flow.id),now=new Date(),dr=state.drill,total=dr&&dr.items?dr.items.length:0;
    rec.startedAt=rec.startedAt||now.toISOString(); rec.doneAt=rec.doneAt||now.toISOString(); rec.score=total?dr.correct/total:null;
    var earned=recordMilestones(q,d,now);
    kaoSave(); if(earned.length) kaoFx('milestone');
  }
  function kaoS0Advance(ui,state,flow){
    var next=Math.min(flow.stages.length-1,Math.floor(nonNegativeNumber(state.stage,0))+1);
    state.stage=next;
    if(flow.stages[next].kind==='drill'&&!state.drill) state.drill=kaoS0DrillInit(flow);
    ui.kaoS0=state; ui.kaoS0Note=''; quranLearnDeps.render(); return true;
  }
  function kaoS0HTML(){
    if(!quranLearnDeps) return '';
    var ui=quranLearnDeps.ui(),state=objectOr(ui.kaoS0,{}),flow=state.lessonId?kaoS0Lesson(state.lessonId):null;
    if(!flow) return '<main class="kao-s0"><span class="kao-content-error" role="alert">Seviye 0 dersi bulunamadı.</span></main>';
    return kaoViewsApi().s0Screen(kaoS0StageModel(flow,state));
  }
  function kaoRootsHTML(){
    if(!quranLearnDeps) return '';
    var esc=quranLearnDeps.esc,ui=quranLearnDeps.ui(),model=kaoRootsModel(),open=String(ui.kaoRoot||'');
    if(open){
      var detail=kaoRootModel(open);
      var h='<main class="kao-roots" aria-labelledby="kao-root-title"><div class="kao-view-head"><button type="button" class="kao-back" onclick="App.kaoRoots(\'list\')">‹ Kök aileleri</button><span>'+String(detail.lemmas.length)+' kelime</span></div>'
        +'<section class="kao-root-detail"><h2 id="kao-root-title" lang="ar" dir="rtl">'+esc(detail.root)+'</h2>'
        +(detail.pronunciation?'<p class="kao-root-pron" lang="tr">'+esc(detail.pronunciation)+'</p>':'')
        +'<p class="kao-root-meaning">'+(detail.meaning?esc(detail.meaning):'Anlam bu kök için henüz yazılmadı.')+'</p>'
        +'<p class="kao-root-mastered">'+esc(detail.masteredText)+'</p>';
      if(detail.derivatives.length){
        h+='<h3>Türkçeye geçen türevler</h3><ul class="kao-root-derivs">'+detail.derivatives.map(function(item){ return '<li><span lang="tr">'+esc(item.tr)+'</span>'+(item.pattern?'<small>'+esc(item.pattern)+'</small>':'')+'</li>'; }).join('')+'</ul>';
      }
      h+='<h3>Bu kökten kelimeler</h3>';
      h+=detail.lemmas.length?'<ul class="kao-root-lemmas">'+detail.lemmas.map(function(item){ return '<li><button type="button" class="kao-root-lemma" data-kao-root-state="'+item.status+'" onclick="App.kaoOpenWord(\''+esc(item.lemmaId)+'\')"><span lang="ar" dir="rtl">'+esc(item.ar)+'</span><span>'+esc(item.tr)+'</span><small>'+esc(item.status==='known'?'biliyorsun':(item.status==='learning'?'öğreniyorsun':'yeni'))+'</small></button></li>'; }).join('')+'</ul>':'<p class="kao-roots-empty">Bu kökten kelime henüz müfredata girmemiş.</p>';
      return h+'</section></main>';
    }
    var rows=model.visible,query=model.query;
    var h='<main class="kao-roots" aria-labelledby="kao-roots-title"><div class="kao-view-head"><div><p class="kao-eyebrow">Kök aileleri</p><h2 id="kao-roots-title">Bir kök, bir aile</h2><p>Öğrenme sırasındaki 73 aile; altında tüm sözlüğü keşfedebilirsin.</p></div><button type="button" class="kao-back" onclick="App.kaoSetView(\'home\')">Geri</button></div>';
    h+='<div class="kao-roots-tools"><label class="kao-roots-search"><span class="kao-sr-only">Kök ara</span><input type="search" value="'+esc(query)+'" placeholder="Kök ara" oninput="App.kaoRoots(\'query\',this.value)"></label>'
      +'<button type="button" class="kao-secondary" aria-pressed="'+(model.allVisible?'true':'false')+'" onclick="App.kaoRoots(\'all\')">'+(model.allVisible?'Öğrenme sırasına dön':'Tüm kökler ('+String(model.allCount)+')')+'</button></div>';
    if(!rows.length){ h+='<p class="kao-roots-empty">Bu aramaya uyan kök yok.</p>'; return h+'</main>'; }
    var listTitle=model.allVisible?'Sözlükteki tüm kökler':'Öğrenme sırasındaki kök aileleri';
    h+='<section class="kao-root-family-list" aria-label="'+esc(listTitle)+'"><h3>'+esc(listTitle)+'</h3><ul>';
    h+=rows.map(function(item){
      var meta=item.meaning?esc(item.meaning):String(item.lemmaCount)+' kelime';
      return '<li><button type="button" class="kao-root-row" onclick="App.kaoRoots(\'open\',\''+esc(item.root)+'\')"><span class="kao-root-ar" lang="ar" dir="rtl">'+esc(item.root)+'</span><span class="kao-root-body"><span class="kao-root-meta">'+meta+'</span><small>'+String(item.derivativeCount)+' Türkçe türev · '+String(item.lemmaCount)+' kelime'+(item.knownCount?' · '+String(item.knownCount)+' biliyorsun':'')+'</small></span><span class="kao-group-chevron" aria-hidden="true">›</span></button></li>';
    }).join('');
    return h+'</ul></section></main>';
  }
  function wordCardId(q,lemmaId){
    var cards=objectOr(q&&q.cards,{}),prefix='w:'+lemmaId+':',ids=Object.keys(cards).filter(function(id){ return id.indexOf(prefix)===0; });
    return ids[0]||prefix+'ar>tr';
  }
  // Ders kimliğinden ünite ve sıra bilgisi (KAO2-18 Y-02).
  function kaoCurriculumLesson(lessonId){
    var curriculum=window.QuranCurriculumV2,units=curriculum&&Array.isArray(curriculum.units)?curriculum.units:[],id=String(lessonId||'');
    for(var i=0;i<units.length;i+=1){ var list=units[i].lessons||[]; for(var j=0;j<list.length;j+=1) if(String(list[j].id)===id) return {lesson:list[j],unit:units[i],unitId:units[i].id,index:j}; }
    return null;
  }
  function kaoCurriculumUnit(unitId){
    var curriculum=window.QuranCurriculumV2,units=curriculum&&Array.isArray(curriculum.units)?curriculum.units:[];
    return units.find(function(unit){ return String(unit.id)===String(unitId); })||null;
  }
  function kaoPathModel(){
    if(!quranLearnDeps) return {levels:[]};
    var d=quranLearnDeps.data(),q=ensureQuranLearn(d),curriculum=window.QuranCurriculumV2,flow=window.SeymaQuranLearnFlow,content=kaoLessonContent(),known=kaoKnownLemmaSet(d);
    if(!curriculum||!flow||!Array.isArray(curriculum.levels)) return {levels:[]};
    var recommended=kaoCurrentUnit(q,flow,{curriculum:curriculum}),shorts=window.QuranShortSurahsV1||{},surahs=Array.isArray(shorts.surahs)?shorts.surahs:[],shortWords=Array.isArray(shorts.words)?shorts.words:[];
    var levels=curriculum.levels.map(function(level){
      if(level.id===0){
        var s0=curriculum.s0&&Array.isArray(curriculum.s0.lessons)?curriculum.s0.lessons:[],states=s0.map(function(lesson,index){ return {lesson:lesson,index:index,progress:flow.lessonProgress(q,lesson.id,content)}; }),done=states.filter(function(item){ return item.progress.done; }).length,next=states.find(function(item){ return !item.progress.done; }),record=next&&q.path&&q.path.lessons&&q.path.lessons[next.lesson.id],started=!!(next&&(done>0||next.progress.introduced>0||record&&record.startedAt));
        return {id:level.id,title:level.title,kind:'entry',titleText:next?next.lesson.title:'12 ders tamamlandı',description:next?(started?'Ders '+(next.index+1)+'’e devam et':'Başla · '+s0.length+' kısa ders'):'12 ders tamamlandı',percent:s0.length?done/s0.length*100:100,ringLabel:'Harf ve okuma dersleri',progressText:done+' / '+s0.length+' ders',action:next?{name:'kaoLesson',args:['start',next.lesson.id]}:null};
      }
      if(level.id===5){
        var knownWords=shortWords.filter(function(word){ return known[word.lemmaId]; }).length,totalWords=shortWords.length,first=surahs[0];
        return {id:level.id,title:level.title,kind:'entry',titleText:surahs.length+' kısa sûre',description:knownWords+' / '+totalWords+' kelime tanıdık · oku ve anlamı aç',percent:totalWords?knownWords/totalWords*100:0,ringLabel:'Kısa sûrelerde tanınan kelimeler',progressText:surahs.length+' sûre',action:first?{name:'kaoOpenSurah',args:[Number(first.id)]}:null};
      }
      if(level.id===6) return {id:level.id,title:level.title,kind:'note',description:'Kısa sûrelerden sonra Kur’an Yolculuğu ile serbest okumaya geç.'};
      var units=(Array.isArray(level.unitIds)?level.unitIds:[]).map(function(id){
        var unit=kaoCurriculumUnit(id); if(!unit) return null;
        var progress=flow.unitProgress(q,unit.id,content),percent=progress.lessons?progress.lessonsDone/progress.lessons*100:0;
        var t=kaoTextPair(unit,'Ünite ');
        return {id:unit.id,title:t.t,promise:t.p,percent:percent,ringLabel:t.t+' ders ilerlemesi',progressText:progress.lessonsDone+' / '+progress.lessons+' ders',current:recommended&&String(recommended.unit.id)===String(unit.id),action:{name:'kaoNav',args:['unit',unit.id]}};
      }).filter(Boolean);
      return {id:level.id,title:level.title,kind:'units',units:units};
    });
    return {levels:levels};
  }
  function kaoPathHTML(){
    if(!quranLearnDeps) return '';
    return kaoViewsApi().pathScreen(kaoPathModel());
  }
  function kaoUnitModel(unitId){
    if(!quranLearnDeps) return null;
    var unit=kaoCurriculumUnit(unitId); if(!unit) return null;
    var d=quranLearnDeps.data(),q=ensureQuranLearn(d),flow=window.SeymaQuranLearnFlow,content=kaoLessonContent(),progress=flow.unitProgress(q,unit.id,content),lex=window.QuranLexiconV1,known=kaoKnownLemmaSet(d),grammar=window.QuranGrammarV1,shorts=window.QuranShortSurahsV1||{},records=q.path&&q.path.lessons||{};
    var lessons=unit.lessons.map(function(lesson,index){ var state=flow.lessonProgress(q,lesson.id,content),title=kaoSafeLessonTitle(lesson); return {id:lesson.id,title:title,goal:kaoVisibleText(lesson.review,lesson.goal,''),done:state.done,current:progress.nextIndex===index&&!state.done}; });
    var words=unit.lessons.reduce(function(all,lesson){
      var record=records[lesson.id]&&typeof records[lesson.id]==='object'?records[lesson.id]:{},introduced=Array.isArray(record.introducedLemmas)?record.introducedLemmas:[];
      return all.concat(lesson.lemmaIds.map(function(id){
        var lemma=lex&&typeof lex.byId==='function'?lex.byId(id):null;
        if(!lemma||lemma.verified!==true||!lemma.translit||!Array.isArray(lemma.meanings)||!lemma.meanings[0]) return null;
        var card=q.cards&&q.cards['w:'+id+':ar>tr'],seen=introduced.indexOf(id)>=0||!!(card&&(card.introducedAt||card.firstSeenAt||card.r||nonNegativeNumber(card.reps,0)>0||['learning','review','relearning'].indexOf(card.state)>=0||['learning','review','relearning'].indexOf(card.st)>=0));
        return {id:id,ar:lemma.ar,pronunciation:kaoLemmaReading(id,lemma.translit),meaning:lemma.meanings[0],status:known[id]?'Tanıdık':(seen?'Çalışılıyor':'Sırada')};
      }).filter(Boolean));
    },[]);
    var concepts=(Array.isArray(unit.conceptIds)?unit.conceptIds:[]).map(function(id){ var item=grammar&&Array.isArray(grammar.concepts)&&grammar.concepts.find(function(value){ return value.id===id; }); return item&&item.title?{id:item.id,title:item.title}:null; }).filter(Boolean);
    var anchors=(Array.isArray(unit.anchor)?unit.anchor:[]).map(function(anchor){
      var match=String(anchor||'').match(/^(prayer|surah|lemma-pool):(.+)$/); if(!match) return '';
      if(match[1]==='prayer'){ var prayer=(shorts.prayerTexts||[]).find(function(item){ return item.id===match[2]; }); return prayer&& (prayer.title||prayer.name) || ''; }
      if(match[1]==='surah'){ var surah=(shorts.surahs||[]).find(function(item){ return String(item.id)===match[2]; }); return surah&&(surah.name||surah.title)||''; }
      return match[2]==='edat-baglac'?'Edat ve bağlaç kelimeleri':'Kelime seçkisi';
    }).filter(Boolean);
    var next=progress.nextLesson,action=next?{name:'kaoLesson',args:['start',next.id]}:null,actionLabel=next?(progress.started?'Ders '+(progress.nextIndex+1)+'’e devam et':'Başla'):'';
    // K2F-08: ustalık ders listesinden AYRI satırdır (○ kilitli · ● sırada/onarım · ✓ geçti · Atlandı); dersler bitince birincil eylem ustalık/onarım.
    var masteryInfo=flow.unitMastery(q,unit.id),mastery;
    if(masteryInfo.state==='passed') mastery={state:'passed',mark:'✓',label:'Ustalık geçildi',detail:masteryInfo.score!==null?'%'+Math.round(masteryInfo.score*100):''};
    else if(masteryInfo.state==='skipped') mastery={state:'skipped',mark:'–',label:'Ustalık',detail:'Atlandı'};
    else if(progress.lessonsDone<progress.lessons) mastery={state:'locked',mark:'○',label:'Ustalık kontrolü',detail:'Dersler bitince açılır'};
    else if(masteryInfo.state==='repair') mastery={state:'repair',mark:'●',label:'Onarım gerekiyor',detail:'Karıştırdığın kelimeleri pekiştir'};
    else mastery={state:'current',mark:'●',label:'Ustalık kontrolü',detail:'10 soru · en az 8 doğru'};
    if(!next&&mastery.state==='repair'){ action={name:'kaoLesson',args:['start','repair:'+unit.id]}; actionLabel='Onarım turuna başla'; }
    else if(!next&&mastery.state==='current'){ action={name:'kaoLesson',args:['start',unit.id]}; actionLabel='Ustalığa başla'; }
    var ut=kaoTextPair(unit,'Ünite ');
    return {id:unit.id,level:unit.level,title:ut.t,levelTitle:(window.QuranCurriculumV2.levels.find(function(level){ return level.id===unit.level; })||{}).title||'',promise:ut.p,percent:progress.lessons?progress.lessonsDone/progress.lessons*100:0,wordsKnown:progress.known,wordsTotal:progress.words,lessonsDone:progress.lessonsDone,lessonsTotal:progress.lessons,lessons:lessons,concepts:concepts,words:words,anchor:anchors.join(' · '),completed:progress.lessons>0&&progress.lessonsDone===progress.lessons,action:action,actionLabel:actionLabel,mastery:mastery};
  }
  function kaoUnitHTML(unitId){
    if(!quranLearnDeps) return '';
    var ui=quranLearnDeps.ui(),resolved=unitId===undefined||unitId===null?ui.kaoUnitId:unitId,model=kaoUnitModel(resolved);
    if(!model) return '<main class="kao-unit-screen"><p role="status">Bu ünite şu an açılamıyor.</p></main>';
    return kaoViewsApi().unitScreen(model);
  }
  function kaoOpenWord(lemmaId){
    if(!quranLearnDeps) return false;
    var lex=window.QuranLexiconV1,lemma=lex&&typeof lex.byId==='function'?lex.byId(String(lemmaId||'')):null;
    if(!lemma||lemma.verified!==true) return false;
    var ui=quranLearnDeps.ui(); kaoApplyView(ui,'word',lemma.id,ui.kaoView==='word'?'replace':'push'); quranLearnDeps.render(); return true;
  }
  function nextReviewText(card){
    var due=card&&new Date(card.due),now=new Date();
    if(!due||!isFinite(due.getTime())) return 'Henüz planlanmadı';
    var days=Math.max(0,Math.ceil((due.getTime()-now.getTime())/DAY_MS));
    return days===0?'Bugün':days+' gün';
  }
  function normalizeArabicForPronunciation(value){
    return String(value||'').normalize('NFKD')
      .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\s.،؛؟ۚۖ]/g,'')
      .replace(/[ٱأإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه');
  }
  function kaoVerifiedAyahPronunciation(example){
    var match=String(example&&example.ref||'').match(/^(\d+):(\d+(?:-\d+)?)$/),order=window.QuranRevelationOrderV1,catalog=window.QuranStrikingVersesV1;
    if(!match||!order||!Array.isArray(order.surahs)||!catalog||!Array.isArray(catalog.verses)) return '';
    var surah=order.surahs.find(function(item){ return item.mushafOrder===Number(match[1]); });
    if(!surah) return '';
    var verse=catalog.verses.find(function(item){
      return item.surahId===surah.id&&String(item.ayetNo)===match[2]&&item.transliterationTr&&item.transliterationVerifiedAt&&item.transliterationReviewer;
    });
    if(!verse||normalizeArabicForPronunciation(verse.arabic)!==normalizeArabicForPronunciation(example.ar)) return '';
    return String(verse.transliterationTr);
  }
  function kaoExamplePronunciationHTML(example,lemma,esc){
    var ayahPronunciation=kaoVerifiedAyahPronunciation(example),reading=ayahPronunciation||String(example&&example.pronunciation||'');
    if(!reading) return '';
    return '<div class="kao-example-pronunciation '+(ayahPronunciation?'is-verified':'is-corpus')+'"><small>Cümlenin okunuşu</small><p lang="tr" dir="ltr">'+esc(reading)+'</p></div>';
  }
  // KAO2-25 · S-08/02 T-19: katman sayfalaması KALDIRILDI; tek kaydırmalı detay sayfası.
  // Y-11: doğrulanmamış örnek HİÇ gösterilmez (iç kalite kuralı kullanıcıya sızmaz).
  function kaoWordLearningHTML(q,lemma,card,cardId){
    var esc=quranLearnDeps.esc,at=kaoCurrentUnitLabel(q),text=nextReviewText(card),lessonRow=kaoWordLessonRowHTML(lemma,esc);
    return '<section class="kao-word-learning" aria-labelledby="kao-word-learning-title"><h3 id="kao-word-learning-title">Öğrenme durumu</h3>'
      +lessonRow
      +'<p>Sonraki tekrar: <strong>'+esc(text)+'</strong></p>'
      +(at?'<p>Bulunduğun yer: <strong>'+esc(at)+'</strong></p>':'')
      +(lessonRow?'':'<button type="button" class="kao-secondary" onclick="App.kaoSetView(\'units\')">Derse dön</button>')+'</section>'
      +'<details class="kao-flag"><summary>Hata bildir</summary><div>'
      +'<button type="button" onclick="App.kaoFlag(\''+esc(cardId)+'\',\'meaning\')">Anlamı bildir</button>'
      +'<button type="button" onclick="App.kaoFlag(\''+esc(cardId)+'\',\'example\')">Örneği bildir</button>'
      +'</div></details>';
  }
  // K2F-33 (K6-05): kelimenin kendi dersi (lemmaToLesson) ve ünitesine geçiş; eşlemesi olmayan lemmada satır hiç çizilmez.
  function kaoWordLessonRowHTML(lemma,esc){
    var curriculum=window.QuranCurriculumV2,map=curriculum&&curriculum.lemmaToLesson,lessonId=map&&lemma?map[lemma.id]:null,
      lesson=lessonId&&typeof curriculum.byLesson==='function'?curriculum.byLesson(lessonId):null,match=/^u0*(\d+)\./.exec(String(lessonId||''));
    if(!lesson||!match) return '';
    var unitNo=Number(match[1]);
    return '<p>Bu kelimenin dersi: <strong>'+esc('Ünite '+unitNo+' · '+kaoSafeLessonTitle(lesson))+'</strong></p>'
      +'<button type="button" class="kao-secondary" onclick="App.kaoNav(\'unit\','+unitNo+')">Derse git</button>';
  }
  // Geçerli ünite/özet etiketi: panel aynasının okuduğu durumla aynı kaynaktan.
  function kaoCurrentUnitLabel(q){
    var curriculum=window.QuranCurriculumV2,unit=kaoCurrentUnit(q,window.SeymaQuranLearnFlow,{curriculum:curriculum});
    return unit&&unit.unit?'Ünite '+unit.unit.id+(curriculum&&typeof curriculum.byLesson==='function'?'':'')+(unit.progress&&unit.progress.lessonsDone?' · '+unit.progress.lessonsDone+'/'+unit.progress.lessons+' ders':''):'';
  }
  function kaoWordHTML(){
    if(!quranLearnDeps) return '';
    var d=quranLearnDeps.data(),q=ensureQuranLearn(d),ui=quranLearnDeps.ui(),lex=window.QuranLexiconV1,lemma=lex&&lex.byId&&lex.byId(ui.kaoWordId),esc=quranLearnDeps.esc;
    if(!lemma) return kaoPathHTML();
    var cardId=wordCardId(q,lemma.id),card=objectOr(q.cards[cardId],{}),root=rootDetail(lemma.root);
    var h='<main class="kao-word" aria-labelledby="kao-word-title">'
      +'<div class="kao-view-head"><button type="button" class="kao-back" onclick="App.kaoSetView(\'units\')">Kelimeler</button></div>';
    // 1) Kahraman: büyük Arapça + okunuş + dinle + anlam (ilk bakışta).
    h+='<section class="kao-word-hero"><p id="kao-word-title" lang="ar" dir="rtl">'+esc(lemma.ar)+'</p>'
      +'<div class="kao-pronunciation"><small>'+(kaoTranslitLayer()==='dia'?'DİA okunuşu':'Okunuş')+'</small>'
      +'<strong lang="tr" dir="ltr">'+esc(kaoLemmaReading(lemma.id,lemma.translit)||'Doğrulanmış okunuş henüz yok')+'</strong></div>'
      +'<button type="button" class="kao-audio" aria-label="'+esc(lemma.ar)+' Arapça telaffuzunu dinle" onclick="App.kaoPlay(\'w-'+esc(lemma.id)+'\',\''+kaoAudioStyle()+'\')">'+quranLearnDeps.icon('headphones',17)+' Telaffuzu dinle</button></section>';
    h+='<section class="kao-word-meanings"><h3>Anlamı</h3><p>'+esc(lemma.meanings[0]||'')+'</p>'+(lemma.meanings[1]?'<p>'+esc(lemma.meanings[1])+'</p>':'')+'</section>';
    // 2) "Türkçede": kognat ve varsa anlam kayması uyarısı.
    var cognate=kaoCognateHTML(lemma);
    if(cognate) h+='<section class="kao-word-cognate"><h3>Türkçede</h3>'+cognate+'</section>';
    // 3) Kök: aile bağlantısı.
    if(lemma.root){
      var rootAr=Array.from(lemma.root||'').join('–'),rootPair=(root&&root.pronunciation)?kaoArabicPairHTML(rootAr,root.pronunciation,'kao-root-pair'):(rootAr?'<span class="kao-arabic-stack kao-root-pair"><span class="kao-arabic-text" lang="ar" dir="rtl">'+esc(rootAr)+'</span></span>':'');
      h+='<section class="kao-word-root"><h3>Kök</h3>'+rootPair+'<p>'+esc(root&&root.meaning||lemma.pattern||'')+'</p>'
        +'<h4>Türkçedeki akrabaları</h4><div class="kao-derivatives">'+(root?root.derivatives.map(function(item){ return '<span><b>'+esc(item.tr)+'</b><small class="kao-pattern">'+esc(item.pattern)+'</small></span>'; }).join(''):'')+'</div>'
        +'<button type="button" class="kao-secondary" onclick="App.kaoRoots(\'open\',\''+esc(lemma.root||'')+'\')">Kök ailesini aç</button></section>';
    }
    // 4) Kur'an'dan örnekler: YALNIZ okunuşu doğrulanmış olanlar; doğrulanmamış hiç yazılmaz.
    var examples=(Array.isArray(lemma.examples)?lemma.examples:[]).filter(function(example){ return typeof example.pronunciation==='string'&&example.pronunciation; }).slice(0,3);
    h+='<section class="kao-word-examples"><h3>Kur\u2019anda</h3>'
      +(examples.length?examples.map(function(example){ return '<article class="kao-word-example"><p lang="ar" dir="rtl">'+esc(example.ar)+'</p>'+kaoExamplePronunciationHTML(example,lemma,esc)+'<p>'+esc(example.tr)+'</p><small>'+esc(example.ref)+'</small></article>'; }).join('')
        :'<p class="kao-setting-hint">Bu kelime için doğrulanmış okunuşlu örnekler hazırlanıyor.</p>')
      +'</section>';
    // 5) Öğrenme durumu + hata bildir (en altta).
    h+=kaoWordLearningHTML(q,lemma,card,cardId);
    return h+'</main>';
  }
 function kaoFlag(cardId,kind){
    if(!quranLearnDeps||['meaning','example','audio','root'].indexOf(kind)<0||!currentCardId(cardId)) return false;
    var q=ensureQuranLearn(quranLearnDeps.data()),card=objectOr(q.cards[cardId],{}); q.cards[cardId]=card; card.flagged={at:new Date().toISOString(),kind:kind};
    kaoSave(); if(quranLearnSurfaceDeps&&typeof quranLearnSurfaceDeps.toast==='function') quranLearnSurfaceDeps.toast('Teşekkürler, sonraki içerik sürümünde bakılacak'); quranLearnDeps.render(); return true;
  }
  // KAO2-17 · K-4: 'draft' metin kullanıcıya gösterilmez; güvenli yer tutucuya düşer.
  function kaoReviewLevel(review){
    var level=objectOr(review,{}).level;
    return level==='sourced'||level==='expert'?level:'draft';
  }
  function kaoVisibleText(review,value,fallback){
    return kaoReviewLevel(review)==='draft'?(fallback===undefined?null:fallback):(typeof value==='string'&&value?value:null);
  }
  function kaoUnitTitle(unit){
    return kaoVisibleText(unit&&unit.review,unit&&unit.title,'Ünite '+String(unit.id));
  }
  // Bağlam satırı etiketi: draft ünitede başlık "Ünite N" güvenli başlığına düşer; ön ek ikinci kez eklenmez.
  function kaoUnitContextLabel(unit){
    var prefix='Ünite '+String(unit.id),title=kaoUnitTitle(unit);
    return title===prefix?prefix:prefix+' · '+title;
  }
  function kaoTextPair(o,prefix){
    var fallback=String(prefix||'Ünite ')+String(o.id);
    return {t:kaoVisibleText(o.review,o.title,fallback),p:kaoVisibleText(o.review,o.promise,'')};
  }
  function kaoLessonTitle(lesson){
    var fallback='Ünite '+String(lesson&&lesson.unitId||'')+' · Ders '+String(lesson&&lesson.index||'');
    return kaoVisibleText(lesson&&lesson.review,lesson&&lesson.title,fallback);
  }
  // K2F-21 (KR-4): draft ders metni hiçbir ekranda görünmez; kimlikten türetilen güvenli başlık ("Ünite N · Ders M") kullanılır.
  function kaoSafeLessonTitle(lesson){
    var m=/^u0*(\d+)\.0*(\d+)$/.exec(String(lesson&&lesson.id||''));
    return kaoVisibleText(lesson&&lesson.review,lesson&&lesson.title,m?('Ünite '+m[1]+' · Ders '+m[2]):String(lesson&&lesson.title||''));
  }
  // KAO2-18 · 07 §4: hata sınıfına göre sade açıklama. Utandırmaz, nedeni ve
  // düzeltme adımını verir. Arapça yalnız görev nesnesinden gelir; sözlüğe bakılmaz.
  function kaoExplain(task,choice,correct){
    task=task&&typeof task==='object'?task:{};choice=choice&&typeof choice==='object'?choice:{};
    // Onaylı kavram metni varsa göreve iliştir (draft zaten null döner).
    if(!task.workedTr||!task.errorTr){
      var m=/^g:([^:]+):/.exec(String(task.cardId||'')),text=m?kaoConceptText(m[1]):null;
      if(text){ task=Object.assign({},task); if(text.workedTr) task.workedTr=text.workedTr; if(text.errorTr) task.errorTr=text.errorTr;
        var lv=text.level==='sourced'||text.level==='expert'?{level:text.level}:{level:'draft'}; task.workedReview=lv; task.errorReview=lv; }
    }
    var answer=String(task.answer||choice.label||''),ar=String(task.ar||''),translit=String(task.translit||task.pronunciation||'');
    var label=ar?(ar+(translit?' ('+translit+')':'')):(answer||'doğru cevap');
    if(correct) return answer?'Doğru — '+label+'.':'Doğru.';
    var kind=String(task.kind||task.type||'word');
    // Onaylı kavram metinleri (draft gizlenir).
    var worked=kaoVisibleText(task.workedReview,task.workedTr,''),errorText=kaoVisibleText(task.errorReview,task.errorTr,'');
    var line;
    if(kind==='grammar') line=errorText||'Bu görevde kalıbın işlevini yeniden düşün.';
    else if(kind==='order') line='Arapçada iş çoğu zaman önce gelir: fiil, sonra yapan, sonra etkilenen.';
    else if(kind==='sound') line='İki ses farklı çıkış yerlerinden gelir; bir daha dinle.';
    else if(task.cognate&&typeof task.cognate==='object'){
      var cog=String(task.cognate.tr||'');
      line=task.cognate.shift?('Dikkat: Türkçedeki '+cog+' ile aynı kökten ama burada anlamı kaymış. '+String(task.cognate.shift)):(cog?('Türkçedeki '+cog+' ile aynı kökten gelir.'):'');
    }
    else if(kind==='cognate') line='Türkçedeki akrabasıyla aynı kökten; burada anlamı farklı olabilir.';
    if(!line) line=(label&&ar)?('Bu kelimeyi yeniden düşün: '+label+'.'):'Cevabı bir daha düşün.';
    var steps=[line];
    if(worked) steps.push(worked);
    if(answer) steps.push('Doğru cevap: '+(ar?(ar+(translit?' ('+translit+')':'')):answer)+'.');
    return steps.join(' ');
  }
  function kaoTextSourceLabel(review){
    var level=kaoReviewLevel(review);
    if(level==='draft') return '';
    var sources=review&&Array.isArray(review.sources)?review.sources.join(', '):'içerik modülü';
    return 'Kaynak: '+sources;
  }
  // KAO2-15 · S-10: gramer notları. Kavramlar yalnız salt-okunur içerik modülünden gelir;
  // her kavram ait olduğu ünitede en az bir derse bağlıdır (curriculum unit.conceptIds).
  // KAO2-18: onaylı kavram metinleri (workedTr/errorTr). draft -> null (güvenli genel metin).
  function kaoConceptText(id){
    var src=window.QuranConceptTextsV1;
    return src&&typeof src.byId==='function'?src.byId(id):null;
  }
  function kaoGrammarConcept(id){
    if(!quranLearnDeps) return null;
    var grammar=window.QuranGrammarV1;
    return grammar&&typeof grammar.byId==='function'?grammar.byId(String(id||''))||null:null;
  }
  function kaoGrammarLessonsOf(id){
    var curriculum=window.QuranCurriculumV2,units=curriculum&&Array.isArray(curriculum.units)?curriculum.units:[],out=[];
    units.forEach(function(unit){ (unit.lessons||[]).forEach(function(lesson){ if(String(lesson.conceptId)===String(id)) out.push(lesson); }); });
    return out;
  }
  function kaoGrammarNoteModel(){
    if(!quranLearnDeps) return null;
    var grammar=window.QuranGrammarV1,concepts=grammar&&Array.isArray(grammar.concepts)?grammar.concepts:[],curriculum=window.QuranCurriculumV2,units=curriculum&&Array.isArray(curriculum.units)?curriculum.units:[],levels=curriculum&&Array.isArray(curriculum.levels)?curriculum.levels:[];
    var groups=units.map(function(unit){
      var items=concepts.filter(function(concept){ return Number(concept.unit)===Number(unit.id); });
      var level=levels.find(function(item){ return item.id===unit.level; });
      var label='Seviye '+unit.level+' · '+String(level&&level.title||'')+' · '+kaoUnitTitle(unit);
      return {id:unit.id,label:label,concepts:items.map(function(concept){ return {id:concept.id,title:concept.title,plainTr:concept.plainTr,action:{name:'kaoNav',args:['concept',concept.id]}}; })};
    }).filter(function(group){ return group.concepts.length>0; });
    return {intro:'Bir kez oku, sonra kavramı ders içinde uygula.',groups:groups};
  }
  function kaoGrammarHTML(){
    if(!quranLearnDeps) return '';
    return kaoViewsApi().grammarScreen(kaoGrammarNoteModel());
  }
  function kaoConceptModel(conceptId){
    if(!quranLearnDeps) return null;
    var concept=kaoGrammarConcept(conceptId);
    if(!concept) return null;
    var levels=window.QuranCurriculumV2&&Array.isArray(window.QuranCurriculumV2.levels)?window.QuranCurriculumV2.levels:[],unit=kaoCurriculumUnit(concept.unit),level=unit?levels.find(function(item){ return item.id===unit.level; }):null;
    var ct=kaoConceptText(concept.id),lv=ct&&(ct.level==='sourced'||ct.level==='expert')?{level:ct.level}:null;
    return {title:concept.title,plainTr:concept.plainTr,termTr:concept.termTr,workedTr:kaoVisibleText(lv,ct&&ct.workedTr,''),tables:Array.isArray(concept.tables)?concept.tables:[],examples:(Array.isArray(concept.examples)?concept.examples:[]).map(function(item){ return {ref:String(item.ref||''),tr:String(item.tr||''),words:(Array.isArray(item.words)?item.words:[]).map(function(word){ return {ar:String(word.ar||''),pronunciation:String(word.pronunciation||'')}; })}; }),notes:Array.isArray(concept.explanation)?concept.explanation.map(String):[],verified:concept.verified===true,levelTitle:level?String(level.title):'',lessons:kaoGrammarLessonsOf(concept.id).map(function(lesson){ return {id:lesson.id,title:lesson.title,action:{name:'kaoLesson',args:['start',lesson.id]}}; })};
  }
  function kaoConceptHTML(conceptId){
    if(!quranLearnDeps) return '';
    var ui=quranLearnDeps.ui(),resolved=conceptId===undefined||conceptId===null?ui.kaoConceptId:conceptId,model=kaoConceptModel(resolved);
    if(!model) return kaoGrammarHTML();
    return kaoViewsApi().grammarConceptScreen(model);
  }
  function cloneValue(value){ return value==null?value:JSON.parse(JSON.stringify(value)); }
  function grammarRecord(cardId){
    var match=String(cardId||'').match(/^g:([^:]+):(.+)$/),grammar=window.QuranGrammarV1;
    if(!match||!grammar||typeof grammar.byId!=='function') return null;
    var concept=grammar.byId(match[1]);
    if(!concept||!Array.isArray(concept.templates)) return null;
    var template=concept.templates.find(function(item){ return item.id===match[2]; });
    return template?{concept:concept,template:template}:null;
  }
  function grammarErrorClass(type){ return type==='Ek çöz'?'affix':type==='Kök bul'?'root':'rule'; }
  function grammarCandidates(){
    var grammar=window.QuranGrammarV1,out=[];
    if(!grammar||!Array.isArray(grammar.concepts)) return out;
    KAO_GRAMMAR_TYPES.forEach(function(type){
      if(type==='Kalıp eşle'){
        var patternConcept=grammar.byId&&grammar.byId('g21'),patternTemplate=patternConcept&&(patternConcept.templates||[]).find(function(item){ return item.type===type; });
        if(patternTemplate){ out.push({id:'g:'+patternConcept.id+':'+patternTemplate.id,type:'grammar',priority:1,errorClass:grammarErrorClass(type)}); return; }
      }
      for(var i=0;i<grammar.concepts.length;i+=1){
        var concept=grammar.concepts[i],template=(concept.templates||[]).find(function(item){ return item.type===type; });
        if(template){ out.push({id:'g:'+concept.id+':'+template.id,type:'grammar',priority:1,errorClass:grammarErrorClass(type)}); break; }
      }
    });
    return out;
  }
  function fragmentGroups(){
    var shorts=window.QuranShortSurahsV1,groups=Object.create(null);
    if(!shorts||!Array.isArray(shorts.words)) return [];
    shorts.words.forEach(function(word){
      var key=String(word.surahId)+':'+String(word.ayah);
      if(!groups[key]) groups[key]=[];
      groups[key].push(word);
    });
    return Object.keys(groups).sort(function(a,b){
      var aa=a.split(':').map(Number),bb=b.split(':').map(Number);
      return aa[0]-bb[0]||aa[1]-bb[1];
    }).map(function(key){
      var words=groups[key].sort(function(a,b){ return a.i-b.i; }).slice(0,6);
      return words.length>=4?{id:'s:'+key+':'+String(words[0].i),words:words}:null;
    }).filter(Boolean);
  }
  function fragmentCandidates(){
    return fragmentGroups().slice(0,2).map(function(group,index){
      return {id:group.id,type:'fragment',fragmentKind:index===0?'order':'translate',priority:2};
    });
  }
  function fragmentRecord(cardId){
    return fragmentGroups().find(function(group){ return group.id===cardId; })||null;
  }
  function surahWords(surahId){
    var shorts=window.QuranShortSurahsV1;
    return shorts&&Array.isArray(shorts.words)?shorts.words.filter(function(word){ return word.surahId===Number(surahId); }).sort(function(a,b){ return a.ayah-b.ayah||a.i-b.i; }):[];
  }
  function surahTestGroups(surahId){
    var words=surahWords(surahId),count=5;
    if(words.length<count) return [];
    return Array.from({length:count},function(_unused,index){
      var start=Math.floor(index*words.length/count),end=Math.floor((index+1)*words.length/count);
      return {id:'dt:'+String(surahId)+':'+String(index+1),surahId:Number(surahId),index:index,words:words.slice(start,end)};
    });
  }
  function kaoDelayedCandidates(d,nowValue){
    var q=quranLearnRoot(d),now=validDate(nowValue,'now'),surahs=objectOr(q.surahs,{}),out=[];
    Object.keys(surahs).sort(function(a,b){ return Number(b)-Number(a); }).some(function(key){
      var record=objectOr(surahs[key],{}),due=new Date(record.delayedTestAt||0),answered=Math.floor(nonNegativeNumber(record.delayedAnswered,0));
      if(record.delayedCompletedAt||!isFinite(due.getTime())||due.getTime()>now.getTime()) return false;
      surahTestGroups(Number(key)).slice(answered).forEach(function(group){
        out.push({id:'kao-delayed:'+String(key)+':'+String(group.index+1),cardId:group.id,type:'fragment',fragmentKind:'delayed',delayedSurahId:Number(key),delayedIndex:group.index,isNew:false});
      });
      return out.length>0;
    });
    return out;
  }
  function delayedFragmentRecord(queueItem){
    if(!queueItem||queueItem.fragmentKind!=='delayed') return null;
    return surahTestGroups(queueItem.delayedSurahId).find(function(group){ return group.index===Number(queueItem.delayedIndex); })||null;
  }
  function kaoBuildDelayedTask(queueItem,options){
    var group=delayedFragmentRecord(queueItem),opts=options&&typeof options==='object'?options:{};
    if(!group) return null;
    var taskId=String(queueItem.id||'task:'+group.id),answerAr=group.words.map(function(word){ return word.ar; }).join(' '),answerTr=group.words.map(function(word){ return word.tr; }).join(' '),pronunciation=group.words.map(function(word){ return word.pronunciation; }).join(' ');
    var alternatives=[];
    (window.QuranShortSurahsV1.surahs||[]).some(function(surah){
      if(surah.id===group.surahId) return false;
      surahTestGroups(surah.id).forEach(function(other){ if(alternatives.length<6) alternatives.push(other.words.map(function(word){ return word.tr; }).join(' ')); });
      return alternatives.length>=6;
    });
    var choices=choiceList(alternatives,answerTr,String(opts.seed||taskId),taskId);
    return {id:taskId,cardId:group.id,type:'fragment',kind:'translate',fragmentKind:'delayed',delayedSurahId:group.surahId,delayedIndex:group.index,isNew:false,retry:false,prompt:'7 gün sonra: parçayı çevir',answer:answerTr,ar:answerAr,pronunciation:pronunciation,meaning:answerTr,errorClass:'rule',clipId:'',choices:choices};
  }
  function kaoBuildFragmentTask(queueItem,options){
    if(queueItem&&queueItem.fragmentKind==='delayed') return kaoBuildDelayedTask(queueItem,options);
    var opts=options&&typeof options==='object'?options:{},cardId=String(queueItem&&queueItem.cardId||queueItem&&queueItem.id||''),record=fragmentRecord(cardId);
    if(!record) return null;
    var taskId=String(queueItem&&queueItem.id||'task:'+cardId),kind=queueItem&&queueItem.fragmentKind==='translate'?'translate':'order',seed=String(opts.seed||taskId);
    var answerAr=record.words.map(function(word){ return word.ar; }).join(' '),answerTr=record.words.map(function(word){ return word.tr; }).join(' '),pronunciation=record.words.map(function(word){ return word.pronunciation; }).join(' '),choices;
    if(kind==='order'){
      choices=record.words.map(function(word,index){ return {label:String(word.ar),pronunciation:String(word.pronunciation||''),ordinal:index,tokenId:String(word.id||index)}; });
      choices.sort(function(a,b){ return seededRank(seed+'|fragment-order',a.tokenId)-seededRank(seed+'|fragment-order',b.tokenId)||a.ordinal-b.ordinal; });
    }else{
      var alternatives=fragmentGroups().filter(function(group){ return group.id!==cardId; }).slice(0,8).map(function(group){ return group.words.map(function(word){ return word.tr; }).join(' '); });
      choices=choiceList(alternatives,answerTr,seed,taskId);
    }
    choices.forEach(function(choice,index){ choice.choiceId=taskId+':choice:'+index; });
    return {id:taskId,cardId:cardId,type:'fragment',kind:kind,isNew:!!(queueItem&&queueItem.isNew),retry:!!(queueItem&&queueItem.retry),prompt:kind==='order'?'Kelimeleri sırayla seç':'Parçayı çevir',answer:kind==='order'?answerAr:answerTr,ar:answerAr,pronunciation:pronunciation,meaning:answerTr,errorClass:kind==='order'?'order':'rule',clipId:'',choices:choices};
  }
  function cellText(cell){ return Array.isArray(cell)?String(cell[1]||''):(typeof cell==='string'?cell:''); }
  function cellPronunciation(cell){ return Array.isArray(cell)?String(cell[2]||''):''; }
  function choiceValue(value){ return value&&typeof value==='object'?{label:String(value.label||''),pronunciation:String(value.pronunciation||'')}:{label:String(value||''),pronunciation:''}; }
  function choiceList(values,answer,seed,taskId){
    var seen=Object.create(null),list=[],answerValue=choiceValue(answer);
    [answer].concat(values).forEach(function(value){ value=choiceValue(value); if(value.label&&!seen[value.label]){ seen[value.label]=1; list.push(value); } });
    list=list.slice(0,4).map(function(value){ return {label:value.label,pronunciation:value.pronunciation,correct:value.label===answerValue.label}; });
    list.sort(function(a,b){ return seededRank(seed+'|grammar',a.label)-seededRank(seed+'|grammar',b.label)||a.label.localeCompare(b.label); });
    list.forEach(function(choice,index){ choice.choiceId=taskId+':choice:'+index; });
    return list;
  }
  function rootForLabel(label){
    var grammar=window.QuranGrammarV1,roots=grammar&&grammar.unit11&&Array.isArray(grammar.unit11.roots)?grammar.unit11.roots:[];
    var base=String(label||'').replace(/\s*\(.+\)\s*$/,'').split(',')[0].trim();
    return roots.find(function(item){ return String(item.meaning||'').split(',').some(function(value){ return value.trim()===base; }); })||null;
  }
  // K2F-11 (K4-02 3/3): gramer görevleri doğrulanmış âyet örneğinden (QuranGrammarV1 examples) ve kavram tablosundan KURULUR.
  // Her tarif görev parçalarını döndürür ya da {unsupported:neden}: tablo tek anlamlı görev türetmeye yetmiyorsa görev
  // kurulmaz (tahmin edilmez; liste GRAMER-SABLON-L2.md). Arapça metin ve okunuş yalnız modül verisinden gelir.
  var GRAMMAR_ARABIC=/[؀-ۿ]/;
  function gramShuffle(values,seed){ return values.slice().sort(function(a,b){ var ka=choiceValue(a).label,kb=choiceValue(b).label; return seededRank(seed,ka)-seededRank(seed,kb)||ka.localeCompare(kb); }); }
  function gramPick(list,seed){ return list[seededRank(seed,'pick')%list.length]; }
  function gramBase(text){ return String(text||'').replace(/\s*\([^)]*\)/g,'').replace(/\s+/g,' ').trim(); }
  function gramCells(row){
    return (row&&Array.isArray(row.cells)?row.cells:[]).map(function(cell){
      if(Array.isArray(cell)){ var ar=String(cell[1]||''); return GRAMMAR_ARABIC.test(ar)?{kind:'ar',label:ar,pronunciation:String(cell[2]||'')}:{kind:'empty'}; }
      return typeof cell==='string'&&cell?{kind:'text',label:cell}:{kind:'empty'};
    });
  }
  function gramIsAr(cell){ return cell.kind==='ar'; }
  function gramIsText(cell){ return cell.kind==='text'; }
  function gramRows(record){ var table=(record.concept.tables||[])[0]; return table&&Array.isArray(table.rows)?table.rows:[]; }
  function gramExample(record){
    var id=record.template.exampleId,list=Array.isArray(record.concept.examples)?record.concept.examples:[];
    return id?list.find(function(item){ return item.id===id; })||null:null;
  }
  function gramWords(example){ return example&&Array.isArray(example.words)?example.words.filter(function(word){ return word&&word.ar; }):[]; }
  function gramUnsupported(reason){ return {unsupported:reason}; }
  // Kelime–anlam satırları: tek Arapça hücre + (tek metin hücresi ya da satır başlığı); çok Arapça hücreli satırda metin hücresinden
  // önceki en yakın Arapça hücre (ör. "II: öğretti" türemiş fiile aittir). Başka satır biçimi atlanır (anlamı tek değil).
  function gramMeaningItems(rows){
    var items=[];
    rows.forEach(function(row){
      var cells=gramCells(row),ar=cells.filter(gramIsAr),tx=cells.filter(gramIsText),stimulus=null,answer='';
      if(!ar.length||tx.length>1) return;
      if(tx.length===1){
        answer=tx[0].label.replace(/^[IVX]+:\s*/,'');
        if(ar.length===1) stimulus=ar[0];
        else for(var i=cells.indexOf(tx[0])-1;i>=0;i-=1) if(gramIsAr(cells[i])){ stimulus=cells[i]; break; }
      }else if(ar.length===1){ stimulus=ar[0]; answer=String(row.label||''); }
      if(stimulus&&answer) items.push({stimulus:stimulus,answer:answer,row:row});
    });
    return items;
  }
  // Rehberlik soldurma (Kalyuga vd. uzmanlık-tersine-çevrilme; Bjork "istenen zorluk"): ilk-kelime ipucu yalnız üç+ kelimelik parçada ve
  // kart henüz GRAMMAR_HINT_UNTIL_REPS kereden az tekrarlandıysa verilir; iki kelimelik parçada ipucu soruyu çözdüğü için hiç verilmez.
  var GRAMMAR_HINT_UNTIL_REPS=2;
  function gramOrderRecipe(record,seed,ctx){
    var example=gramExample(record),words=gramWords(example),hint=words.length>=3&&nonNegativeNumber(ctx&&ctx.reps,0)<GRAMMAR_HINT_UNTIL_REPS;
    if(!example||words.length<2) return gramUnsupported('örnek ya da en az iki kelime yok');
    var choices=words.map(function(word,index){ return {label:String(word.ar),pronunciation:String(word.pronunciation||''),ordinal:index,tokenId:'w'+index}; });
    choices.sort(function(a,b){ return seededRank(seed+'|grammar-order',a.tokenId)-seededRank(seed+'|grammar-order',b.tokenId)||a.ordinal-b.ordinal; });
    if(choices.every(function(item,index){ return item.ordinal===index; })) choices.push(choices.shift());
    return {kind:'order',choices:choices,answer:words.map(function(word){ return word.ar; }).join(' '),stimulus:hint?String(words[0].ar):'',stimulusPronunciation:hint?String(words[0].pronunciation||''):'',context:[{label:'Anlamı: '+example.tr,pronunciation:''}].concat(hint?[{label:'İpucu: parça yukarıdaki kelimeyle başlar',pronunciation:''}]:[])};
  }
  function gramTranslateRecipe(record,seed){
    var example=gramExample(record),grammar=window.QuranGrammarV1,same=[],other=[];
    if(!example||!example.ar||!example.tr) return gramUnsupported('örnek ya da çevirisi yok');
    grammar.concepts.forEach(function(concept){
      (concept.examples||[]).forEach(function(item){ if(item.id===example.id||!item.tr||item.tr===example.tr) return; (concept.id===record.concept.id?same:other).push(item.tr); });
    });
    return {stimulus:String(example.ar),stimulusPronunciation:gramWords(example).map(function(word){ return word.pronunciation||''; }).join(' '),answer:example.tr,alternatives:gramShuffle(same,seed+'|same').concat(gramShuffle(other,seed+'|other')),context:[{label:'Âyet '+example.ref,pronunciation:''}]};
  }
  // "'o yaptı' hücresini doldur": yönergedeki hücre (satır başlığı + Türkçe hücre) tabloda aranır; cevap o satırın Arapça hücresi.
  // Birden çok satır eşleşirse (erkek/kadın) seçilen satır yönergeye ve uyarana yazılır, böylece soru tek anlamlı kalır.
  function gramInflectionRecipe(record,seed){
    var rows=gramRows(record),quoted=/'([^']+)'/.exec(String(record.template.prompt||''));
    if(!quoted) return gramUnsupported('yönergede tırnaklı hücre yok');
    var parsed=rows.map(function(row){ var cells=gramCells(row); return {row:row,text:cells.find(gramIsText),ar:cells.find(gramIsAr)}; });
    var matches=parsed.filter(function(item){ return item.text&&item.ar&&gramBase(item.row.label)+' '+gramBase(item.text.label)===quoted[1]; });
    if(!matches.length) return gramUnsupported('yönergedeki hücre tabloda bir satırla eşleşmiyor');
    var chosen=gramPick(matches,seed+'|'+record.template.id),stimulus=matches.length>1?String(chosen.row.label)+' '+gramBase(chosen.text.label):quoted[1];
    var alternatives=gramShuffle(parsed.filter(function(item){ return item!==chosen&&item.ar; }).map(function(item){ return {label:item.ar.label,pronunciation:item.ar.pronunciation}; }),seed+'|cells');
    return {stimulus:stimulus,prompt:matches.length>1?"'"+stimulus+"' hücresini doldur.":undefined,answer:{label:chosen.ar.label,pronunciation:chosen.ar.pronunciation},alternatives:alternatives,context:[{label:String((record.concept.tables[0]||{}).title||record.concept.title),pronunciation:''}]};
  }
  function gramAffixRecipe(record,seed){
    var rows=gramRows(record),id=record.concept.id,tid=record.template.id;
    if(id==='g1'){
      var words=rows.map(function(row){ var ar=gramCells(row).filter(gramIsAr); return ar.length?{row:row,word:ar[ar.length-1]}:null; }).filter(Boolean);
      if(words.length<3) return gramUnsupported('tabloda en az üç "el"li kelime yok');
      var chosen=gramPick(words,seed+'|'+tid),others=words.filter(function(item){ return item!==chosen; }).map(function(item){ return 'el + '+item.row.label; });
      return {stimulus:chosen.word.label,stimulusPronunciation:chosen.word.pronunciation,answer:'el + '+chosen.row.label,alternatives:['bir '+chosen.row.label].concat(gramShuffle(others,seed+'|el')),context:[{label:'el = o bilinen',pronunciation:''},{label:String(chosen.row.label),pronunciation:''}]};
    }
    if(id==='g5'){
      var suffixes=rows.map(function(row){ var ar=gramCells(row).filter(gramIsAr); return ar.length===1?{row:row,word:ar[0]}:null; }).filter(Boolean);
      if(suffixes.length<3) return gramUnsupported('tabloda en az üç ekli kelime yok');
      var picked=gramPick(suffixes,seed+'|'+tid);
      return {stimulus:picked.word.label,stimulusPronunciation:picked.word.pronunciation,prompt:'Kelimeye yapışan ek hangisi?',answer:String(picked.row.label),alternatives:gramShuffle(suffixes.filter(function(item){ return item!==picked; }).map(function(item){ return String(item.row.label); }),seed+'|suffix'),context:[]};
    }
    if(id==='g13'||id==='g15'||id==='g17') return gramPersonRecipe(record,seed);
    return gramReverseRecipe(record,seed);
  }
  // Ek çöz şablonu kelime listesi tablosuna bağlıysa (parçalanacak gövde+ek verisi yok) görev tablodan "Arapça seç"e (Türkçe→Arapça) çevrilir:
  // üretme/geri çağırma yönü (Bjork "istenen zorluk") ve arayüzde dürüst tür etiketi; cevap tablodaki aynı satırdan gelir.
  function gramReverseRecipe(record,seed){
    var items=gramMeaningItems(gramRows(record)),counts=Object.create(null);
    items.forEach(function(item){ counts[item.answer]=(counts[item.answer]||0)+1; });
    items=items.filter(function(item){ return counts[item.answer]===1; });
    if(items.length<3) return gramUnsupported('tabloda tek anlamlı en az üç kelime–anlam satırı yok');
    var chosen=gramPick(items,seed+'|'+record.template.id);
    return {type:'Arapça seç',stimulus:'',prompt:"'"+chosen.answer+"' hangisi?",answer:{label:chosen.stimulus.label,pronunciation:chosen.stimulus.pronunciation},alternatives:gramShuffle(items.filter(function(item){ return item!==chosen; }).map(function(item){ return {label:item.stimulus.label,pronunciation:item.stimulus.pronunciation}; }),seed+'|reverse'),context:[]};
  }
  // Çekim/emir tablolarında "kelimeyi parçalarına ayır" yerine ek tanıma: Arapça biçim verilir, hangi şahıs/kime ait olduğu sorulur
  // (şahıs ekini tanımak). Aynı biçim iki satırda geçiyorsa (belirsiz) o satırlar ne soru ne çeldirici olur.
  var GRAMMAR_PERSON_PROMPTS={g13:'Bu geçmiş zaman biçimi kimin için? (şahıs ekini tanı)',g15:'Bu şimdiki zaman biçimi kimin için? (şahıs ekini tanı)',g17:'Bu emir kime söylenmiş?'};
  function gramPersonRecipe(record,seed){
    var forms=Object.create(null),items=gramRows(record).map(function(row){ var ar=gramCells(row).find(gramIsAr); return ar?{row:row,ar:ar}:null; }).filter(Boolean);
    items.forEach(function(item){ forms[item.ar.label]=(forms[item.ar.label]||0)+1; });
    var unique=items.filter(function(item){ return forms[item.ar.label]===1; });
    if(unique.length<4) return gramUnsupported('tabloda tek anlamlı (yinelenmeyen) en az dört biçim yok');
    var chosen=gramPick(unique,seed+'|'+record.template.id);
    return {stimulus:chosen.ar.label,stimulusPronunciation:chosen.ar.pronunciation,prompt:GRAMMAR_PERSON_PROMPTS[record.concept.id],answer:String(chosen.row.label),alternatives:gramShuffle(unique.filter(function(item){ return item!==chosen; }).map(function(item){ return String(item.row.label); }),seed+'|persons'),context:[{label:String((record.concept.tables[0]||{}).title||record.concept.title),pronunciation:''}]};
  }
  function gramColumnIndex(record,pattern){
    var columns=(record.concept.tables[0]||{}).columns||[];
    for(var i=1;i<columns.length;i+=1) if(pattern.test(String(columns[i]))) return i-1;
    return -1;
  }
  function gramArabicAt(row,index){
    var cell=index>=0&&row&&Array.isArray(row.cells)?row.cells[index]:null;
    return Array.isArray(cell)&&GRAMMAR_ARABIC.test(String(cell[1]||''))?{label:String(cell[1]),pronunciation:String(cell[2]||'')}:null;
  }
  // Aynı satırdaki iki sütun arasında eşleştirme (fiil→masdar, fâil→mef'ûl): sütunlar başlıktan bulunur, cevap aynı satırdan gelir.
  function gramColumnPairRecipe(record,seed,fromPattern,toPattern,prompt,hint){
    var from=gramColumnIndex(record,fromPattern),to=gramColumnIndex(record,toPattern);
    if(from<0||to<0) return gramUnsupported('tabloda gerekli sütun başlıkları yok');
    var items=gramRows(record).map(function(row){ var a=gramArabicAt(row,from),b=gramArabicAt(row,to); return a&&b?{row:row,from:a,to:b}:null; }).filter(Boolean);
    if(items.length<3) return gramUnsupported('tabloda en az üç dolu satır yok');
    var chosen=gramPick(items,seed+'|'+record.template.id);
    return {stimulus:chosen.from.label,stimulusPronunciation:chosen.from.pronunciation,prompt:prompt,answer:{label:chosen.to.label,pronunciation:chosen.to.pronunciation},alternatives:gramShuffle(items.filter(function(item){ return item!==chosen; }).map(function(item){ return {label:item.to.label,pronunciation:item.to.pronunciation}; }),seed+'|pairs'),context:[{label:hint+String(chosen.row.label),pronunciation:''}]};
  }
  // "'âlemlerin Rabbi' tamlaması hangisi?": Türkçe karşılık yönergede, şıklar tablodaki iki kelimelik tamlamalar (tamlanan + tamlayan).
  function gramPhraseRecipe(record,seed){
    var items=gramRows(record).map(function(row){ var ar=gramCells(row).filter(gramIsAr); return ar.length===2?{row:row,pair:{label:ar[0].label+' '+ar[1].label,pronunciation:ar[0].pronunciation+' '+ar[1].pronunciation}}:null; }).filter(Boolean);
    if(items.length<3) return gramUnsupported('tabloda en az üç iki kelimelik tamlama yok');
    var chosen=gramPick(items,seed+'|'+record.template.id);
    return {stimulus:'',prompt:"'"+chosen.row.label+"' tamlaması hangisi?",answer:chosen.pair,alternatives:gramShuffle(items.filter(function(item){ return item!==chosen; }).map(function(item){ return item.pair; }),seed+'|phrases'),context:[]};
  }
  // g10-k3: "söylenen (haber) hangisi?" — şıklar tablodaki Arapça hücreler; doğru = satırın haber hücresi, aynı satırın mübtedası çeldirici.
  function gramPredicateRecipe(record,seed){
    var subject=gramColumnIndex(record,/mübteda/i),predicate=gramColumnIndex(record,/haber/i);
    if(subject<0||predicate<0) return gramUnsupported('tabloda mübteda/haber sütunları yok');
    var items=gramRows(record).map(function(row){ var a=gramArabicAt(row,subject),b=gramArabicAt(row,predicate); return a&&b&&a.label!==b.label?{row:row,subject:a,predicate:b}:null; }).filter(Boolean);
    if(items.length<3) return gramUnsupported('tabloda en az üç mübteda–haber satırı yok');
    var chosen=gramPick(items,seed+'|'+record.template.id);
    var others=items.filter(function(item){ return item!==chosen&&item.predicate.label!==chosen.subject.label; }).map(function(item){ return {label:item.predicate.label,pronunciation:item.predicate.pronunciation}; });
    return {stimulus:'',prompt:"'"+chosen.row.label+"' cümlesinde söylenen (haber) hangisi?",answer:{label:chosen.predicate.label,pronunciation:chosen.predicate.pronunciation},alternatives:[{label:chosen.subject.label,pronunciation:chosen.subject.pronunciation}].concat(gramShuffle(others,seed+'|haber')),context:[]};
  }
  // g14-k2: uyaran doğrulanmış g14-e1 örneğindeki "kânû + fiil" kelimeleri; doğru anlam kavramın kural cümlesindeki ('-ıyordu, -ırdı') anlamdır.
  var GRAMMAR_KANE_ANSWER="Geçmişte süren iş: '-ıyordu, -ırdı'";
  function gramKaneRecipe(record,seed){
    var example=(record.concept.examples||[]).find(function(item){ return item.id==='g14-e1'; }),words=gramWords(example);
    if(!example||words.length<3||words[1].pronunciation!=='kânû') return gramUnsupported('doğrulanmış kâne örneği (g14-e1) bulunamadı');
    return {stimulus:String(words[1].ar)+' '+String(words[2].ar),stimulusPronunciation:String(words[1].pronunciation)+' '+String(words[2].pronunciation||''),prompt:"Bu ifadede 'kânû' fiile ne katar?",answer:GRAMMAR_KANE_ANSWER,alternatives:['Gelecek zaman anlamı','Olumsuzluk anlamı','Emir anlamı'],context:[]};
  }
  // g19-k3: uyaran fâil ya da mef'ûl sütunundan bir kelime; kök anlamı satır başlığından gelir, doğru şık o sütunun adıdır.
  function gramVoiceRecipe(record,seed){
    var fail=gramColumnIndex(record,/fâil/i),passive=gramColumnIndex(record,/mef/i);
    if(fail<0||passive<0) return gramUnsupported('tabloda fâil/mef\'ûl sütunları yok');
    var items=[],seen=Object.create(null);
    gramRows(record).forEach(function(row){
      [[fail,'fail'],[passive,'passive']].forEach(function(pair){
        var ar=gramArabicAt(row,pair[0]);
        if(ar&&!seen[ar.label]){ seen[ar.label]=1; items.push({row:row,side:pair[1],ar:ar}); }
      });
    });
    if(items.length<4) return gramUnsupported('tabloda en az dört fâil/mef\'ûl kelimesi yok');
    var chosen=gramPick(items,seed+'|'+record.template.id),isFail=chosen.side==='fail';
    return {stimulus:chosen.ar.label,stimulusPronunciation:chosen.ar.pronunciation,prompt:"Kökü '"+gramBase(chosen.row.label)+"' olan bu kelime yapan mı, yapılan mı?",answer:isFail?'Yapan (fâil)':'Yapılan (mef\'ûl)',alternatives:[isFail?'Yapılan (mef\'ûl)':'Yapan (fâil)'],context:[]};
  }
  function gramMeaningRecipe(record,seed){
    var id=record.template.id,rows=gramRows(record);
    if(id==='g10-k3') return gramPredicateRecipe(record,seed);
    if(id==='g14-k2') return gramKaneRecipe(record,seed);
    if(id==='g19-k3') return gramVoiceRecipe(record,seed);
    if(record.concept.id==='g2') return gramPhraseRecipe(record,seed);
    if(record.concept.id==='g20'){
      var masdar=gramColumnIndex(record,/masdar/i),named=gramRows(record).map(function(row){ var ar=gramArabicAt(row,masdar); return ar?{row:row,ar:ar}:null; }).filter(Boolean);
      if(named.length<3) return gramUnsupported('masdar sütunu yok ya da üç satırdan az');
      var pickedName=gramPick(named,seed+'|'+id);
      return {stimulus:pickedName.ar.label,stimulusPronunciation:pickedName.ar.pronunciation,answer:String(pickedName.row.label),alternatives:gramShuffle(named.filter(function(item){ return item!==pickedName; }).map(function(item){ return String(item.row.label); }),seed+'|names'),context:[]};
    }
    if(record.concept.id==='g12'){
      var pairs=rows.map(function(row){ var ar=gramCells(row).filter(gramIsAr); return ar.length===2?ar:null; }).filter(Boolean);
      if(pairs.length<2) return gramUnsupported('tekil/çoğul çifti yok');
      var pair=gramPick(pairs,seed+'|'+id),plural=seededRank(seed,'side')%2===1;
      return {stimulus:pair[plural?1:0].label,stimulusPronunciation:pair[plural?1:0].pronunciation,answer:plural?'Çoğul':'Tekil',alternatives:['Tekil','Çoğul'],context:[]};
    }
    if(record.concept.id==='g0_5'){
      var arabicRow=rows.find(function(row){ return gramCells(row).some(gramIsAr); }),roleRow=rows.find(function(row){ return /görev/.test(String(row.label||''))&&gramCells(row).every(gramIsText); });
      var first=arabicRow&&gramCells(arabicRow).find(gramIsAr),roles=roleRow?gramCells(roleRow).filter(gramIsText):[];
      if(!first||roles.length<2) return gramUnsupported('görev satırı yok');
      return {stimulus:first.label,stimulusPronunciation:first.pronunciation,answer:roles[0].label,alternatives:gramShuffle(roles.slice(1).map(function(item){ return item.label; }),seed+'|roles'),context:[]};
    }
    var items=gramMeaningItems(rows),distinct=Object.create(null);
    items.forEach(function(item){ distinct[item.answer]=1; });
    if(Object.keys(distinct).length<3) return gramUnsupported('tabloda tek anlamlı kelime–anlam satırı yok (satırda birden çok Arapça hücre ya da anlam hücresi eksik)');
    var chosen=gramPick(items,seed+'|'+id);
    return {stimulus:chosen.stimulus.label,stimulusPronunciation:chosen.stimulus.pronunciation,answer:chosen.answer,alternatives:gramShuffle(items.filter(function(item){ return item.answer!==chosen.answer; }).map(function(item){ return item.answer; }),seed+'|meanings'),context:[]};
  }
  function gramArabicChoiceRecipe(record,seed){
    var rows=gramRows(record),quoted=/'([^']+)'/.exec(String(record.template.prompt||''));
    if(!quoted) return gramUnsupported('yönergede tırnaklı Türkçe kelime yok');
    var items=rows.map(function(row){ var ar=gramCells(row).filter(gramIsAr); return ar.length===1?{row:row,ar:ar[0]}:null; }).filter(Boolean);
    var matches=items.filter(function(item){ return gramBase(item.row.label)===gramBase(quoted[1]); });
    if(!matches.length) return gramUnsupported('yönergedeki kelime tabloda bir satırla eşleşmiyor');
    var chosen=gramPick(matches,seed+'|'+record.template.id);
    return {stimulus:'',prompt:matches.length>1?"'"+chosen.row.label+"' hangisi?":undefined,answer:{label:chosen.ar.label,pronunciation:chosen.ar.pronunciation},alternatives:gramShuffle(items.filter(function(item){ return item!==chosen; }).map(function(item){ return {label:item.ar.label,pronunciation:item.ar.pronunciation}; }),seed+'|arabic'),context:[]};
  }
  function gramRootRecipe(record,seed){
    var items=gramRows(record).map(function(row){ var ar=gramCells(row).find(gramIsAr),root=rootForLabel(row.label); return ar&&root?{row:row,ar:ar,root:root}:null; }).filter(Boolean);
    if(!items.length) return gramUnsupported('kök listesinde eşleşen kök yok');
    var chosen=gramPick(items,seed+'|'+record.template.id),roots=window.QuranGrammarV1.unit11&&window.QuranGrammarV1.unit11.roots||[];
    return {stimulus:chosen.ar.label,stimulusPronunciation:chosen.ar.pronunciation,answer:{label:Array.from(chosen.root.root).join('–'),pronunciation:String(chosen.root.pronunciation||'')},alternatives:roots.slice(0,12).map(function(item){ return {label:Array.from(item.root).join('–'),pronunciation:String(item.pronunciation||'')}; }),context:[{label:String(chosen.row.label),pronunciation:''}]};
  }
  function gramPatternRecipe(record,seed){
    if(record.concept.id==='g19') return gramColumnPairRecipe(record,seed,/fâil/i,/mef/i,"Bu 'yapan' (fâil) kelimenin aynı kökten 'yapılan' (mef'ûl) biçimi hangisi?",'Kök anlamı: ');
    if(record.concept.id==='g20') return gramColumnPairRecipe(record,seed,/^Fiil/i,/masdar/i,'Bu fiilin adı (masdarı) hangisi?','Anlamı: ');
    if(record.concept.id!=='g21') return gramUnsupported('bu kavramda eşleştirme tarifi yok');
    var items=gramMeaningItems(gramRows(record)).slice(0,3);
    if(items.length<3) return gramUnsupported('tabloda üç eşleşebilir satır yok');
    var chosen=items[seededRank(seed,record.template.id)%items.length];
    return {stimulus:chosen.stimulus.label,stimulusPronunciation:chosen.stimulus.pronunciation,answer:chosen.answer,alternatives:items.map(function(item){ return item.answer; }),context:items.map(function(item){ return {label:item.stimulus.label,pronunciation:item.stimulus.pronunciation}; })};
  }
  function grammarRecipe(record,seed,ctx){
    var type=record.template.type;
    if(type==='Kelime dizme') return gramOrderRecipe(record,seed,ctx);
    if(type==='Parça çevir') return gramTranslateRecipe(record,seed);
    if(type==='Çekim tablosu') return gramInflectionRecipe(record,seed);
    if(type==='Ek çöz') return gramAffixRecipe(record,seed);
    if(type==='Anlam seç') return gramMeaningRecipe(record,seed);
    if(type==='Arapça seç') return gramArabicChoiceRecipe(record,seed);
    if(type==='Kök bul') return gramRootRecipe(record,seed);
    if(type==='Kalıp eşle') return gramPatternRecipe(record,seed);
    return gramUnsupported('bu tür için tarif yok');
  }
  // Boş dize = destekleniyor; aksi hâlde görev kurulamamasının gerekçesi (GRAMER-SABLON-L2.md bunu listeler).
  function kaoGrammarSupport(cardId){
    var record=grammarRecord(cardId);
    return record?(grammarRecipe(record,'support-probe',{reps:0}).unsupported||''):'şablon bulunamadı';
  }
  // "Yönlendirir + öğretir": cevaptan sonra kavramın kural cümlesi (plainTr) ve örnekli şablonda âyet künyesi + çevirisi gösterilir.
  function gramTeachLines(record,example){
    var out=[];
    if(example) out.push('Âyet '+example.ref+': “'+example.tr+'”');
    if(record.concept.plainTr) out.push('Kural: '+record.concept.plainTr);
    return out;
  }
  function gramTeach(record,example){ return gramTeachLines(record,example).join(' · '); }
  function kaoBuildGrammarTask(queueItem,d,options){
    var opts=options&&typeof options==='object'?options:{},cardId=String(queueItem&&queueItem.cardId||queueItem&&queueItem.id||''),record=grammarRecord(cardId);
    if(!record) return null;
    var taskId=String(queueItem&&queueItem.id||'task:'+cardId),seed=String(opts.seed||taskId),card=objectOr(quranLearnRoot(d).cards,{})[cardId];
    var recipe=grammarRecipe(record,seed,{reps:nonNegativeNumber(card&&card.reps,0)});
    if(recipe.unsupported) return null;
    var type=recipe.type||record.template.type,answerValue=choiceValue(recipe.answer),choices;
    if(recipe.choices){ choices=recipe.choices; choices.forEach(function(choice,index){ choice.choiceId=taskId+':choice:'+index; }); }
    else choices=choiceList(recipe.alternatives,answerValue,seed,taskId);
    var task={id:taskId,cardId:cardId,type:'grammar',grammarType:type,isNew:!!(queueItem&&queueItem.isNew),retry:!!(queueItem&&queueItem.retry),prompt:String(recipe.prompt||record.template.prompt||type),stimulus:recipe.stimulus||'',stimulusPronunciation:recipe.stimulusPronunciation||'',context:recipe.context||[],errorClass:grammarErrorClass(type),answer:answerValue.label,teach:gramTeach(record,gramExample(record)),teachLines:gramTeachLines(record,gramExample(record)),clipId:'',choices:choices};
    if(recipe.kind) task.kind=recipe.kind;
    return task;
  }
  // K2F-10 (K4-02, fail-closed): yanlış öğretebilecek gramer görevi HİÇ gösterilmez. Kurallar denetimin beş kuralıdır
  // (tek şık · "el +" yalnız g1 · Çekim tablosu dışında Arapça uyaran (Arapça seç'te boş olabilir) · Çekim tablosu yönergesindeki
  // hücre = uyaran · örnekli şablonda uyaran o âyet örneğinin içinde) + tam bir doğru şık + boş/yinelenen şık etiketi yok.
  // K2F-11: örnekli türler doğrulanmış örnekle karşılaştırılır (Parça çevir: uyaran = örnek Arapçası, doğru = örnek çevirisi;
  // Kelime dizme: sıra numaraları = örnek kelime sırası). Çözülemeyen kart ya da örnek de geçersiz sayılır.
  function kaoGrammarTaskValid(task){
    if(!task||task.type!=='grammar') return false;
    var record=grammarRecord(task.cardId),choices=Array.isArray(task.choices)?task.choices:[];
    if(!record||choices.length<2) return false;
    var type=record.template.type,example=gramExample(record),stimulus=String(task.stimulus||''),answer='';
    // İzinli tek yeniden türlendirme: kelime listesi tablosuna bağlı "Ek çöz" şablonu "Arapça seç" olarak gösterilir (gramReverseRecipe).
    if(task.grammarType!==type&&!(type==='Ek çöz'&&task.grammarType==='Arapça seç')) return false;
    type=task.grammarType;
    var labels=choices.map(function(item){ return String(item&&item.label||''); });
    if(labels.some(function(label){ return !label; })) return false;
    if(type==='Kelime dizme'){
      var words=gramWords(example),byOrdinal=choices.slice().sort(function(a,b){ return a.ordinal-b.ordinal; });
      if(task.kind!=='order'||words.length<2||choices.length!==words.length) return false;
      if(!byOrdinal.every(function(item,index){ return item.ordinal===index&&item.label===String(words[index].ar); })) return false;
    }else{
      var correct=choices.filter(function(item){ return item&&item.correct===true; });
      if(task.kind==='order'||correct.length!==1||labels.some(function(label,index){ return labels.indexOf(label)!==index; })) return false;
      answer=String(correct[0].label||'');
      if(type==='Parça çevir'&&(!example||answer!==example.tr||stimulus!==example.ar)) return false;
    }
    if(type==='Ek çöz'&&/^el \+/.test(answer)&&record.concept.id!=='g1') return false;
    if(type==='Çekim tablosu'){
      var quoted=/'([^']+)'/.exec(String(task.prompt||''));
      if(!stimulus||(quoted&&quoted[1]!==stimulus)) return false;
    }else if(stimulus){ if(!GRAMMAR_ARABIC.test(stimulus)) return false; }
    else if(type!=='Arapça seç'&&type!=='Kelime dizme'&&!choices.every(function(item){ return GRAMMAR_ARABIC.test(String(item.label||'')); })) return false;
    if(example&&(!example.ar||(stimulus?example.ar.indexOf(stimulus)<0:type!=='Kelime dizme'))) return false;
    return true;
  }
  // Bir kuyruk/plan öğesinin gramer görevi, GERÇEKTE kurulacağı tohumla (öğe kimliği) kurulup doğrulanır;
  // gramer dışı öğeler her zaman sunulabilir. Görev kuruluş kuralı değişmez, yalnız sunum kapısı eklenir.
  // Şablonu çözülemeyen `g:` kartı için görev hiç kurulmaz (yanlış öğretemez); kapı yalnız "kurulan ama yanlış" görevi keser,
  // çözülemeyen kartın eski davranışı (kuyruk zamanlaması) değişmez.
  function kaoGrammarItemPresentable(item,d){
    var id=String(item&&item.cardId||item&&item.id||'');
    if(!/^g:/.test(id)||!grammarRecord(id)) return true;
    return kaoGrammarTaskValid(kaoBuildGrammarTask(item,d,{seed:String(item&&item.id||id)}));
  }
  // Ders planında sunulamayan gramer alıştırmasını AYNI dersin bir kelime alıştırmasıyla değiştirir: öğe kimliği (devam
  // noktası) ve sırası korunur, alıştırma sayısı düşmez. Önce dersin henüz kullanılmamış kart yönleri, yoksa tekrar.
  function kaoLessonSafePlan(plan,d){
    var goal=plan.find(function(item){ return item.kind==='goal'; }),eligible=goal&&Array.isArray(goal.lemmaIds)?goal.lemmaIds:[];
    var used=Object.create(null),cards=objectOr(quranLearnRoot(d).cards,{}),spare=0;
    plan.forEach(function(item){ if(item.kind==='practice') used[item.cardId]=true; });
    function pickWord(){
      for(var i=0;i<eligible.length;i+=1) for(var k=0;k<2;k+=1){
        var direction=k===0?'tr>ar':'ar>tr',cardId='w:'+eligible[i]+':'+direction;
        if(!used[cardId]) return {lemmaId:eligible[i],direction:direction};
      }
      spare+=1; return {lemmaId:eligible[(spare-1)%eligible.length],direction:'tr>ar'};
    }
    return plan.reduce(function(out,item){
      if(item.kind!=='practice'||item.group!=='concept'||kaoGrammarItemPresentable({id:item.id,cardId:item.cardId,type:'grammar'},d)){ out.push(item); return out; }
      if(!eligible.length) return out;
      var word=pickWord(),cardId='w:'+word.lemmaId+':'+word.direction;
      used[cardId]=true;
      out.push({id:item.id,kind:'practice',group:'lemma',lessonId:item.lessonId,lemmaId:word.lemmaId,cardId:cardId,type:word.direction==='tr>ar'?'arabic':'meaning',direction:word.direction,choiceCount:item.choiceCount,audioOnly:false,isNew:!nonNegativeNumber(objectOr(cards[cardId],{}).reps,0),substitutedFor:item.cardId});
      return out;
    },[]);
  }
  function kaoCandidates(){
    var lex=window.QuranLexiconV1;
    if(!lex||!Array.isArray(lex.lemmas)) return [];
    // Y-2: her lemma önce ar>tr; tr>ar, ar>tr kartı en az bir takvim günü önce açıldıysa öncelikli aday olur.
    // Yeni kart bütçesi (dailyNew) iki yön için ortaktır.
    var cards=objectOr(quranLearnRoot(quranLearnDeps.data()).cards,{}),today=quranLearnDeps.todayStr();
    var reverse=lex.lemmas.filter(function(lemma){
      // Eski kartta tanıtım zamanı yoksa son tekrar (r) kullanılır; r tanıtımdan önce olamaz, ters yön erken açılmaz.
      var forward=cards['w:'+lemma.id+':ar>tr'],introduced=forward&&(forward.introducedAt||forward.firstSeenAt||forward.r);
      return introduced&&!cards['w:'+lemma.id+':tr>ar']&&localDayOf(introduced)&&localDayOf(introduced)<today;
    }).map(function(lemma){ return {id:'w:'+lemma.id+':tr>ar',type:'arabic',priority:1}; });
    var candidates=fragmentCandidates().concat(grammarCandidates(),reverse,lex.lemmas.map(function(lemma){ return {id:'w:'+lemma.id+':ar>tr',type:'meaning'}; }));
    Object.keys(cards).forEach(function(id){ if(candidates.every(function(item){ return item.id!==id; })) candidates.push({id:id}); });
    // 02 §5.7: zayıf hata sınıfının adayları öne (öncelik +1): kognat → anlamı kaymış kelime, kök/ek/kural → gramer türü, sıra → dizme.
    var weak=kaoWeakClass(quranLearnRoot(quranLearnDeps.data())),shift=Object.create(null);
    if(weak){ lex.lemmas.forEach(function(lemma){ if(lemma.cognate&&lemma.cognate.shift) shift[lemma.id]=1; }); candidates.forEach(function(item){ var cls=/^g:/.test(item.id)?item.errorClass:(item.type==='fragment'?(item.fragmentKind==='order'?'order':''):(shift[lemmaIdForCard(item.id)]?'cognate':'')); if(cls===weak) item.priority=nonNegativeNumber(item.priority,0)+1; }); }
    return candidates;
  }
  // Hata taksonomisi (02 §5.7): zayıf sınıf ≥3 hata ve en yüksek (eşitlikte KAO_ERROR_ORDER); ana ekranda en çok iki sınıf.
  var KAO_ERROR_ORDER=['sound','root','affix','cognate','rule','order'],KAO_ERROR_LABELS={sound:'ses',root:'kök',affix:'ek',cognate:'Türkçe benzeri kelimeler',rule:'kural',order:'sıra'};
  function kaoWeakClass(q){ var errors=objectOr(q&&q.errors,{}),best=null; KAO_ERROR_ORDER.forEach(function(key){ var n=nonNegativeNumber(errors[key],0); if(n>=3&&(!best||n>nonNegativeNumber(errors[best],0))) best=key; }); return best; }
  function kaoConfusedLine(q){ var errors=objectOr(q&&q.errors,{}),count=function(key){ return Math.floor(nonNegativeNumber(errors[key],0)); },top=KAO_ERROR_ORDER.filter(function(key){ return count(key)>0; }).sort(function(a,b){ return count(b)-count(a)||KAO_ERROR_ORDER.indexOf(a)-KAO_ERROR_ORDER.indexOf(b); }).slice(0,2); return top.length?'En çok karıştırdıkların: '+top.map(function(key){ return KAO_ERROR_LABELS[key]+' ('+count(key)+')'; }).join(' · '):''; }
  function kaoAudioEnabled(){
    if(!quranLearnDeps) return false;
    var q=ensureQuranLearn(quranLearnDeps.data()),quiet=quranLearnSurfaceDeps&&quranLearnSurfaceDeps.isQuietTime;
    if(!(q&&q.settings&&q.settings.audio)) return false;
    try{ return !(typeof quiet==='function'&&quiet()); }catch(_error){ return false; }
  }
  function kaoShouldAutoplay(task,d){
    var q=quranLearnRoot(d),card=objectOr(objectOr(q.cards,{})[task&&task.cardId],{});
    return !!(task&&task.clipId&&task.isNew&&nonNegativeNumber(card.reps,0)<2&&kaoAudioEnabled());
  }
  function kaoCognateHTML(task){
    if(!task||!task.cognate||!task.cognate.tr) return '';
    var esc=quranLearnDeps.esc,warning=!!task.cognate.shift;
    return '<p class="kao-cognate'+(warning?' is-shift':'')+'">'+(warning?quranLearnDeps.icon('triangle-alert',14)+' dikkat · ':'')+'Türkçede var: '+esc(task.cognate.tr)+(warning?' · '+esc(task.cognate.shift):'')+'</p>';
  }
  function kaoArabicPairHTML(ar,pronunciation,className,fade){
    var esc=quranLearnDeps.esc,label=String(ar||''),reading=String(pronunciation||''),settings=kaoSettingsOf(),harakat=settings.harakat!==false,readability=kaoReadability();
    if(!reading) return '<span class="kao-content-error" role="alert">Bu Arapça içerik, Latin okunuşu doğrulanmadan gösterilemez.</span>';
    var bare=kaoStripHarakat(label),text=!harakat?esc(bare):(fade&&readability.fadeHarakat&&bare!==label?'<button type="button" class="kao-fade'+(kaoMotionAllowed()?'':' is-instant')+'" aria-label="Harekeler soluyor; geri getirmek için dokun" onclick="this.classList.add(\'is-back\')"><span class="kao-fade-base" aria-hidden="true">'+esc(bare)+'</span><span class="kao-fade-full">'+esc(label)+'</span></button>':esc(label));
    return '<span class="kao-arabic-stack'+(className?' '+className:'')+'"><span class="kao-arabic-text" lang="ar" dir="rtl">'+text+'</span><span class="kao-pronunciation-line" lang="tr">'+esc(reading)+'</span></span>';
  }
  function kaoTaskHTML(task){
    if(!quranLearnDeps) return '';
    var ui=quranLearnDeps.ui(),esc=quranLearnDeps.esc;
    if(!task){
      var durable=Math.max(0,Math.floor(nonNegativeNumber(ui.kaoDurableCount,0)));
      return '<section id="kao-task" class="kao-task kao-done"><p class="kao-eyebrow">Bugünkü oturum tamam</p><h2>Bugün '+durable+' kelime daha kalıcı oldu</h2><div class="kao-done-actions"><button type="button" class="kao-primary" onclick="App.kaoSetView(\'home\')">Bugün yeter</button><button type="button" class="kao-secondary" onclick="App.kaoStart()">5 dakika daha</button></div>'+(kaoLevel1Ready(quranLearnDeps.data())?'<button type="button" class="kao-link-button kao-level1" onclick="App.kaoOpenPrayer()">Seviye 1 tamam · Namazda ne dediğini gör →</button>':'')+'</section>';
    }
    var panel=ui.kaoPanel&&ui.kaoPanel.open&&ui.kaoPanel.taskId===task.id?ui.kaoPanel:null,autoplay=kaoShouldAutoplay(task,quranLearnDeps.data()),isGrammar=!!task.grammarType,isFragment=task.type==='fragment',isLink=task.type==='link',isTransfer=task.type==='transfer',prompt=task.audioOnly?'Dinlediğin kelimenin anlamını seç':(isGrammar||isFragment||isTransfer?task.prompt:(task.direction==='tr>ar'?task.meaning:task.ar));
    var h='<section id="kao-task" class="kao-task" data-task-id="'+esc(task.id)+'"'+(autoplay?' data-autoplay="1"':'')+'>';
    var taskCount=Math.max(1,(ui.kaoQueue||[]).length),taskPosition=Math.min(taskCount,Math.max(1,(ui.kaoTaskIndex||0)+1));
    h+='<div class="kao-task-progress" role="progressbar" aria-label="Görev ilerlemesi" aria-valuemin="1" aria-valuemax="'+String(taskCount)+'" aria-valuenow="'+String(taskPosition)+'"><span style="width:'+String(Math.round(taskPosition/taskCount*100))+'%"></span></div>';
    h+='<div class="kao-task-top"><span>'+(isGrammar?esc(task.grammarType):(isFragment?(task.kind==='order'?'Kelime dizme':'Parça çevir'):(isLink?'Bağ kur · Türkçedeki türevi':(isTransfer?'Yeni âyet · haftalık test':(task.direction==='tr>ar'?'Arapçayı seç':'Anlamı seç')))))+'</span><span>'+String((ui.kaoTaskIndex||0)+1)+' / '+String((ui.kaoQueue||[]).length)+'</span></div>';
    if(!task.audioOnly&&!isGrammar&&!isFragment&&(task.direction==='ar>tr'||isLink)) h+='<h2 class="kao-question'+(autoplay?' kao-audio-pending':'')+'" data-kao-ar>'+kaoArabicPairHTML(prompt,task.translit,'kao-question-pair',task.durable30===true)+'</h2>';
    else h+='<h2 class="kao-question'+(isGrammar||isFragment||isTransfer?' kao-question-text':'')+'">'+esc(prompt)+'</h2>';
    if(isLink) h+='<p class="kao-eyebrow">Anlamı: '+esc(task.meaning)+'</p>';
    if(isGrammar){ h+='<div class="kao-grammar-stimulus">'+(/[\u0600-\u06ff]/.test(task.stimulus)?kaoArabicPairHTML(task.stimulus,task.stimulusPronunciation,'kao-stimulus-pair'):esc(task.stimulus))+'</div>'; if(task.context&&task.context.length) h+='<div class="kao-grammar-context">'+task.context.map(function(item){ var value=item&&typeof item==='object'?item:{label:item,pronunciation:''}; return /[\u0600-\u06ff]/.test(value.label)?'<span>'+kaoArabicPairHTML(value.label,value.pronunciation,'kao-context-pair')+'</span>':'<span>'+esc(value.label)+'</span>'; }).join('')+'</div>'; }
    if(isTransfer) h+='<p class="kao-eyebrow">'+esc(task.surah)+'</p>'; if((isFragment&&task.kind==='translate')||isTransfer) h+='<div class="kao-fragment-stimulus">'+kaoArabicPairHTML(task.ar,task.pronunciation,'kao-fragment-pair')+'</div>';
    if(task.kind==='order'){
      var draft=Array.isArray(ui.kaoOrderDraft)?ui.kaoOrderDraft:[];
      h+='<div class="kao-order-target" aria-label="Seçilen kelime sırası">'+(draft.length?draft.map(function(choiceId){ var selected=task.choices.find(function(choice){ return choice.choiceId===choiceId; }); return selected?'<span>'+kaoArabicPairHTML(selected.label,selected.pronunciation,'kao-order-pair')+'</span>':''; }).join(''):'<span class="kao-order-empty">'+(isFragment?'Önce fiili seç':'Kelimeleri sırayla seç')+'</span>')+'</div>';
    }
    if(task.clipId) h+='<div class="kao-audio-actions"><button type="button" class="kao-audio" aria-label="Yavaş dinlemek için dokun; doğal hız için 350 milisaniye basılı tut" onpointerdown="this.dataset.kaoLong=\'\';this._kaoHold=setTimeout(()=>{this.dataset.kaoLong=\'1\';App.kaoPlay(\''+task.clipId+'\',\'flowing\')},350)" onpointerup="clearTimeout(this._kaoHold)" onpointercancel="clearTimeout(this._kaoHold)" onclick="if(this.dataset.kaoLong!==\'1\')App.kaoPlay(\''+task.clipId+'\',\'measured\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();App.kaoPlay(\''+task.clipId+'\',event.shiftKey?\'flowing\':\'measured\')}">'+quranLearnDeps.icon('headphones',17)+' Dinle</button><button type="button" class="kao-audio-natural" onclick="App.kaoPlay(\''+task.clipId+'\',\'flowing\')">Doğal hız</button></div>';
    h+=kaoCognateHTML(task)+'<div class="kao-choices">';
    task.choices.forEach(function(choice){
      var selected=task.kind==='order'&&Array.isArray(ui.kaoOrderDraft)&&ui.kaoOrderDraft.indexOf(choice.choiceId)>=0;
      var arabic=/[\u0600-\u06ff]/.test(choice.label),classes=[],state='',disabled=selected;
      if(panel){
        if(task.kind==='order'){
          var orderPosition=(ui.kaoOrderDraft||[]).indexOf(choice.choiceId);
          state=orderPosition<0?'dim':(choice.ordinal===orderPosition?'correct':'wrong');
        }else if(choice.correct===true) state='correct';
        else if(choice.choiceId===panel.choiceId) state='wrong';
        else state='dim';
        if(state) classes.push('kao-choice-'+state);
        disabled=true;
      }
      if(isGrammar||isFragment||isTransfer) classes.push('kao-chip');
      if(autoplay&&task.direction==='tr>ar') classes.push('kao-audio-pending');
      var mark=state==='correct'?'✓':(state==='wrong'?'✕':''),screenText=state==='correct'?'Doğru cevap':(state==='wrong'?'Senin seçimin':'');
      h+='<button type="button"'+(classes.length?' class="'+classes.join(' ')+'"':'')+(task.kind==='order'?' aria-pressed="'+(selected?'true':'false')+'"':'')+(disabled?' disabled':'')+(arabic?' data-kao-ar aria-label="'+esc(choice.label+', okunuşu '+choice.pronunciation+(screenText?', '+screenText:''))+'"':'')+' onclick="App.kaoAnswer(\''+task.id+'\',\''+choice.choiceId+'\')">'+(mark?'<span class="kao-choice-mark" aria-hidden="true">'+mark+'</span><span class="kao-sr-only">'+screenText+'</span>':'')+(arabic?kaoArabicPairHTML(choice.label,choice.pronunciation,'kao-choice-pair'):esc(choice.label))+'</button>';
    });
    h+='</div><p class="kao-live" aria-live="polite">'+esc(panel?'':(ui.kaoFeedback||''))+'</p>';
    if(panel){
      var answer=String(panel.answer||task.answer||task.choices.filter(function(item){ return item.correct===true; }).map(function(item){ return item.label; }).join(' · '));
      // Geri bildirim gövdesi satır satır: Arapça cevap kendi RTL satırında (sıra görevinde kelimeler boşlukla), sonra âyet künyesi ve kural ayrı satırlar.
      var lines=[],answerIsArabic=/[\u0600-\u06ff]/.test(answer);
      if(answerIsArabic){ lines.push(panel.correct?'Doğru':'Doğru cevap:'); lines.push({text:task.kind==='order'?answer.split(' · ').join(' '):answer,lang:'ar'}); }
      else lines.push(panel.correct?'Doğru'+(answer?' — '+answer:''):'Doğru cevap: '+answer);
      (Array.isArray(task.teachLines)?task.teachLines:(task.teach?[task.teach]:[])).forEach(function(line){ lines.push(line); });
      if(task.cognate&&task.cognate.tr) lines.push('Türkçedeki akrabası: '+task.cognate.tr+(task.cognate.shift?' — '+task.cognate.shift:''));
      if(panel.note) lines.push(panel.note);
      h+=kaoViewsApi().feedbackSheet({tone:panel.correct?'success':'warning',title:panel.correct?'Doğru':'Bir daha bakalım',body:lines,actions:[{label:'Aslında biliyordum',action:'kaoUndo',kind:'link'},{label:'Devam',action:'kaoContinue',kind:'primary'}]});
    }
    h+='</section>';
    return h;
  }
  function currentTask(){
    if(!quranLearnDeps) return null;
    var ui=quranLearnDeps.ui(),item=(ui.kaoQueue||[])[ui.kaoTaskIndex||0];
    if(!item) return null;
    ui.kaoTasks=objectOr(ui.kaoTasks,{});
    if(!ui.kaoTasks[item.id]) ui.kaoTasks[item.id]=kaoBuildTask(item,quranLearnDeps.data(),{seed:item.id,choiceCount:item.choiceCount,audioOnly:item.audioOnly===true});
    return ui.kaoTasks[item.id];
  }
  // 04 §4 FX: premium katman (SeyHaptics/SeyAudio/SeyFx) kendi kapılarıyla (ayar, sessiz saat) çağrılır; konfeti yalnız SeyFx.shouldAnimate; modül yoksa atlanır.
  function kaoFx(kind,node){ var w=window; try{ if(kind==='enter'){ if(w.SeyFx&&typeof w.SeyFx.enter==='function') w.SeyFx.enter(node); return; } var tone=kind==='milestone'?'success':'tap'; if(w.SeyHaptics&&typeof w.SeyHaptics[tone]==='function') w.SeyHaptics[tone](); if(w.SeyAudio&&typeof w.SeyAudio[tone]==='function') w.SeyAudio[tone](); if(kind==='milestone'&&w.SeyFx&&typeof w.SeyFx.shouldAnimate==='function'&&w.SeyFx.shouldAnimate()&&w.SeymaHelpers&&typeof w.SeymaHelpers.confetti==='function') w.SeymaHelpers.confetti(); }catch(e){} }
  function kaoLessonMilestoneConfetti(ui){
    var state=ui&&ui.kaoLesson,earned=state&&Array.isArray(state.earnedMilestones)?state.earnedMilestones:[];
    if(!state||!earned.length||state.milestoneCelebrated) return false;
    state.milestoneCelebrated=true;
    try{ if(window.SeyFx&&typeof window.SeyFx.shouldAnimate==='function'&&window.SeyFx.shouldAnimate()&&window.SeymaHelpers&&typeof window.SeymaHelpers.confetti==='function') window.SeymaHelpers.confetti(); }catch(e){}
    return true;
  }
  function kaoRememberLessonMilestones(ui,earned){
    var state=ui&&ui.kaoLesson;
    if(!state||['review','practice'].indexOf(state.phase)<0||!Array.isArray(earned)||!earned.length) return false;
    state.earnedMilestones=Array.isArray(state.earnedMilestones)?state.earnedMilestones:[];
    earned.forEach(function(key){ if(state.earnedMilestones.indexOf(key)<0) state.earnedMilestones.push(key); });
    return true;
  }
  // K2F-28: yeni görev çizilince odak soruya gider (✕ ya da eski şıkta kalmaz).
  function kaoFocusQuestion(node){
    var question=node&&typeof node.querySelector==='function'?(node.querySelector('.kao-question')||node.querySelector('h2')):null;
    if(!question||typeof question.focus!=='function') return false;
    if(typeof question.setAttribute==='function') question.setAttribute('tabindex','-1');
    question.focus(); return true;
  }
  function paintTask(){
    if(!quranLearnSurfaceDeps||typeof quranLearnSurfaceDeps.taskElement!=='function') return false;
    var node=quranLearnSurfaceDeps.taskElement();
    if(!node) return false;
    var html=kaoTaskHTML(currentTask()),match=html.match(/^<section[^>]*>([\s\S]*)<\/section>$/);
    node.innerHTML=match?match[1]:html;
    var painted=currentTask(),paintedId=painted?painted.id:'done',paintUi=quranLearnDeps.ui(); if(paintUi.kaoPaintedId!==paintedId){ paintUi.kaoPaintedId=paintedId; kaoFx('enter',node); kaoFocusQuestion(node); }
    if(typeof node.setAttribute==='function'){
      var task=currentTask(); node.setAttribute('data-task-id',task?task.id:'done');
      if(task&&kaoShouldAutoplay(task,quranLearnDeps.data())) node.setAttribute('data-autoplay','1'); else if(typeof node.removeAttribute==='function') node.removeAttribute('data-autoplay');
    }
    if(paintUi.kaoPanel&&paintUi.kaoPanel.open&&node&&typeof node.querySelector==='function'){
      var continueButton=node.querySelector('.kao-feedback-continue'); if(continueButton&&typeof continueButton.focus==='function') continueButton.focus();
    }
    return true;
  }
  function startTaskPresentation(){
    var task=currentTask();
    if(task&&kaoShouldAutoplay(task,quranLearnDeps.data())) kaoPlay(task.clipId,kaoAudioStyle());
  }
  function kaoUndoSnapshot(q,ui,task,key,orderDraft){
    var cardId=String(task.cardId),surahId=String(task.delayedSurahId),hasSurah=task.fragmentKind==='delayed'&&Object.prototype.hasOwnProperty.call(q.surahs,surahId);
    return {cardId:cardId,hadCard:Object.prototype.hasOwnProperty.call(q.cards,cardId),card:cloneValue(q.cards[cardId]),dailyKey:key,hadDaily:Object.prototype.hasOwnProperty.call(q.daily,key),daily:cloneValue(q.daily[key]),errors:cloneValue(q.errors),milestones:cloneValue(q.milestones),kind:task.fragmentKind==='delayed'?'delayed':(task.type||'card'),surahId:surahId,hadSurah:hasSurah,surah:cloneValue(q.surahs[surahId]),hadTransfer:Object.prototype.hasOwnProperty.call(q,'transfer'),transfer:cloneValue(q.transfer),taskIndex:ui.kaoTaskIndex,queue:cloneValue(ui.kaoQueue),durableCount:ui.kaoDurableCount,orderDraft:cloneValue(orderDraft)||[],lesson:cloneValue(ui.kaoLesson)};
  }
  // K2F-31: görev süresi ölçümü üst sınırı (05 §4: uzun duraklama ortalamayı bozmaz).
  var KAO_TASK_MS_CAP=120000;
  function kaoTaskMs(ui,now){ return Math.min(KAO_TASK_MS_CAP,Math.max(0,now.getTime()-nonNegativeNumber(ui.kaoTaskStartedAt,now.getTime()))); }
  function kaoAnswerText(task){
    if(task&&task.kind==='order') return Array.isArray(task.choices)?task.choices.slice().sort(function(a,b){ return nonNegativeNumber(a.ordinal,0)-nonNegativeNumber(b.ordinal,0); }).map(function(item){ return item.label; }).join(' · '):'';
    if(task&&task.answer) return String(task.answer);
    return task&&Array.isArray(task.choices)?task.choices.filter(function(item){ return item.correct===true; }).map(function(item){ return item.label; }).join(' · '):'';
  }
  function kaoOpenFeedback(ui,task,correct,choiceId,note){
    var answer=kaoAnswerText(task);
    ui.kaoPanel={open:true,taskId:task.id,correct:correct===true,choiceId:choiceId||'',answer:answer,note:note||''};
    ui.kaoFeedback=correct?'Doğru':(task.kind==='order'&&note?note:'Doğru cevap: '+answer);
  }
  function kaoAutoAdvance(ui,q){
    if(q.settings.autoAdvance!==true||!ui.kaoPanel||ui.kaoPanel.open!==true||ui.kaoPanel.correct!==true||!quranLearnSurfaceDeps||typeof quranLearnSurfaceDeps.setTimer!=='function') return false;
    ui.kaoAdvanceTimer=quranLearnSurfaceDeps.setTimer(function(){
      if(ui.kaoPanel&&ui.kaoPanel.open&&ui.kaoPanel.correct===true) kaoContinue();
    },900);
    return true;
  }
  // K2F-31: sıradaki-adım tahmini de bu içerikle çalışır (plan eksik içerikle yarı sayıda adım üretir); ses haritası sözlük başına bir kez kurulur.
  var kaoAudioLemmaCache={lexicon:null,map:null};
  function kaoAudioLemmaMap(lexicon){
    if(kaoAudioLemmaCache.lexicon===lexicon&&kaoAudioLemmaCache.map) return kaoAudioLemmaCache.map;
    var lemmas=lexicon&&Array.isArray(lexicon.lemmas)?lexicon.lemmas:[],map=Object.create(null);
    lemmas.forEach(function(lemma){ if(lemma&&safeClipId('w-'+lemma.id)) map[lemma.id]=true; });
    kaoAudioLemmaCache={lexicon:lexicon,map:map};
    return map;
  }
  function kaoLessonContent(){
    var lexicon=window.QuranLexiconV1,audioLemmas=kaoAudioLemmaMap(lexicon);
    return {curriculum:window.QuranCurriculumV2,lexicon:lexicon,grammar:window.QuranGrammarV1,shorts:window.QuranShortSurahsV1,phonics:window.QuranPhonicsV1,audioLemmas:audioLemmas};
  }
  function kaoLessonRecord(q,id){
    q.path=objectOr(q.path,{}); q.path.lessons=objectOr(q.path.lessons,{});
    if(!q.path.lessons[id]||typeof q.path.lessons[id]!=='object'||Array.isArray(q.path.lessons[id])) q.path.lessons[id]={startedAt:null,doneAt:null,score:null};
    return q.path.lessons[id];
  }
  function kaoLessonSummaryForecast(d,state,now){
    var snapshot=cloneValue(d),q=ensureQuranLearn(snapshot),record=kaoLessonRecord(q,state.lessonId),today=quranLearnDeps.todayStr(),day=objectOr(q.daily[today],{});
    record.doneAt=now.toISOString(); record.score=state.answered?state.correct/state.answered:null; record.resume=null;
    q.daily[today]=Object.assign({},day,{lesson:true,sessionDone:true});
    var tomorrow=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1,now.getHours(),now.getMinutes(),now.getSeconds(),now.getMilliseconds());
    return kaoNextStepFor(snapshot,tomorrow);
  }
  function kaoElapsedProgramDays(startedAt,now){
    var startKey=localDayOf(startedAt),todayKey=localDayOf(now);
    if(!startKey||!todayKey) return null;
    function ordinal(key){ var parts=key.split('-'); return Date.UTC(Number(parts[0]),Number(parts[1])-1,Number(parts[2]))/DAY_MS; }
    return Math.max(0,Math.floor(ordinal(todayKey)-ordinal(startKey)));
  }
  function kaoLessonResume(ui){
    var state=ui&&ui.kaoLesson;if(!state||!quranLearnDeps) return false;
    if(kaoUnitSession(state)) return true; // ustalık/onarım oturumunun ders kaydı/devam noktası yoktur (K2F-06/07)
    var q=ensureQuranLearn(quranLearnDeps.data()),record=kaoLessonRecord(q,state.lessonId),itemId='',phase=state.phase||'lesson';
    if(phase==='review'||phase==='practice'){
      var item=(ui.kaoQueue||[])[ui.kaoTaskIndex||0]; itemId=item&&String(item.id||'')||'';
    }else{
      var planItem=(state.plan||[])[state.at||0]; itemId=planItem&&String(planItem.id||'')||'';
    }
    var lessonItem=(state.plan||[])[state.at||0];
    record.resume=itemId?{phase:phase,itemId:itemId,lessonItemId:lessonItem&&lessonItem.id||''}:null;
    return true;
  }
  function kaoLessonMarkIntro(ui,item){
    var q=ensureQuranLearn(quranLearnDeps.data()),record=kaoLessonRecord(q,item.lessonId),ids=Array.isArray(record.introducedLemmas)?record.introducedLemmas.slice():[];
    if(ids.indexOf(item.lemmaId)<0) ids.push(item.lemmaId);
    record.introducedLemmas=ids; record.startedAt=record.startedAt||new Date().toISOString();
    q.cards=objectOr(q.cards,{});
    var cardId='w:'+item.lemmaId+':ar>tr',card=objectOr(q.cards[cardId],{});
    if(!nonNegativeNumber(card.reps,0)&&!card.introducedAt){ card=Object.assign({state:'new',due:new Date().toISOString(),reps:0,l:0,s:0},card,{introducedAt:new Date().toISOString()}); q.cards[cardId]=card; }
  }
  function kaoLessonActivate(ui){
    if(!quranLearnDeps||!ui||!ui.kaoLesson) return false;
    var state=ui.kaoLesson,now=new Date(),phase=state.phase;
    if(phase==='review'){
      ui.kaoQueue=state.reviews.slice(); ui.kaoTaskIndex=0; ui.kaoTaskStartedAt=now.getTime();
      ui.kaoTasks={}; ui.kaoQueue.forEach(function(item){ ui.kaoTasks[item.id]=kaoBuildTask(item,quranLearnDeps.data(),{seed:item.id}); });
    }else if(phase==='practice'){
      var start=state.at||0,end=start;
      while(end<state.plan.length&&state.plan[end].kind==='practice') end+=1;
      state.practiceEndAt=end;
      ui.kaoQueue=state.plan.slice(start,end).map(function(item){ return {id:item.id,cardId:item.cardId,type:item.group==='concept'?'grammar':undefined,isNew:item.isNew===true,retry:false,choiceCount:item.choiceCount,audioOnly:item.audioOnly===true,lessonItemId:item.id}; });
      ui.kaoTaskIndex=0; ui.kaoTaskStartedAt=now.getTime(); ui.kaoTasks={}; ui.kaoQueue.forEach(function(item){ ui.kaoTasks[item.id]=kaoBuildTask(item,quranLearnDeps.data(),{seed:item.id,choiceCount:item.choiceCount,audioOnly:item.audioOnly}); });
    }else{
      ui.kaoQueue=[]; ui.kaoTaskIndex=0; ui.kaoTasks={};
      var current=(state.plan||[])[state.at||0];
      if(current&&current.kind==='intro') kaoLessonMarkIntro(ui,current);
      if(current&&current.kind==='summary'&&state.kind==='mastery') kaoMasteryRecord(state);
      if(current&&current.kind==='summary'&&state.kind==='repair') kaoRepairFinish(state);
    }
    kaoLessonResume(ui); ui.kaoPanel={open:false}; ui.kaoUndo=null; ui.kaoOrderDraft=[]; ui.kaoFeedback=''; ui.kaoAdvanceTimer=null; kaoSave();
    var activeItem=(state.plan||[])[state.at||0]; if(phase==='lesson'&&activeItem&&activeItem.kind==='summary') kaoLessonMilestoneConfetti(ui);
    kaoApplyView(ui,'session',null,ui.kaoView==='session'?'replace':'push');
    quranLearnDeps.render();
    if(phase==='review'||phase==='practice'){
      if(quranLearnSurfaceDeps&&typeof quranLearnSurfaceDeps.setTimer==='function') quranLearnSurfaceDeps.setTimer(startTaskPresentation,0); else startTaskPresentation();
    }else{
      var intro=(state.plan||[])[state.at||0];
      if(intro&&intro.kind==='intro'&&kaoShouldAutoplay({clipId:'w-'+intro.lemmaId,isNew:true,cardId:'w:'+intro.lemmaId+':ar>tr'},quranLearnDeps.data())) kaoPlay('w-'+intro.lemmaId,kaoAudioStyle());
    }
    return true;
  }
  function kaoLessonStart(lessonId,startMode){
    var ui=quranLearnDeps.ui(),d=quranLearnDeps.data(),q=ensureQuranLearn(d),content=kaoLessonContent(),curriculum=content.curriculum,flow=window.SeymaQuranLearnFlow;
    if(!curriculum||!flow||typeof flow.lessonPlan!=='function') return false;
    var resolved=String(lessonId||''),repairMatch=/^repair:(.+)$/.exec(resolved);
    if(repairMatch){ var repairUnit=curriculum.units.find(function(item){ return String(item.id)===repairMatch[1]; }); return repairUnit?kaoRepairStart(repairUnit,ui,q,content,flow):false; }
    var lesson=curriculum.byLesson&&curriculum.byLesson(resolved);
    // K2F-15: Seviye 0 dersleri ders oynatıcının boş planına (goal,apply,summary) değil S0 yüzeyine devredilir.
    if(!lesson&&curriculum.s0&&Array.isArray(curriculum.s0.lessons)&&curriculum.s0.lessons.some(function(item){ return String(item.id)===resolved; })) return kaoS0('start',resolved);
    if(!lesson){
      // K2F-06 (K4-01): ünite kimliği ustalık oturumudur; eski "son içerik dersine düş" geri dönüşü kaldırıldı.
      var unit=curriculum.units.find(function(item){ return String(item.id)===resolved; });
      if(unit) return kaoMasteryStart(unit,ui,q,content,flow);
    }
    if(!lesson) return false;
    if(ui.kaoLesson&&ui.kaoLesson.lessonId===lesson.id&&ui.kaoLesson.done!==true){
      kaoApplyView(ui,'session',null,ui.kaoView==='session'?'replace':'push'); quranLearnDeps.render();
      if(ui.kaoLesson.phase==='review'||ui.kaoLesson.phase==='practice') startTaskPresentation();
      return true;
    }
    var now=new Date(),plan=flow.lessonPlan({quranLearn:q},lesson.id,now,content);
    if(!Array.isArray(plan)||!plan.length) return false;
    plan=kaoLessonSafePlan(plan,d);
    var reviews=startMode==='intro'?[]:kaoBuildQueue(d,now,{sessionId:quranLearnDeps.todayStr(),candidates:kaoCandidates(),dailyNew:0}).filter(function(item){ return !item.isNew; }).slice(0,20);
    var record=kaoLessonRecord(q,lesson.id),resume=objectOr(record.resume,{}),state={lessonId:lesson.id,title:kaoSafeLessonTitle(lesson),plan:plan,at:0,phase:reviews.length?'review':'lesson',reviews:reviews,correct:0,answered:0,done:false,earnedMilestones:[],milestoneCelebrated:false,startedAt:record.startedAt||now.toISOString(),resumeAt:0};
    if(startMode==='intro'){ state.at=Math.max(0,plan.findIndex(function(item){ return item.kind==='intro'; })); state.resumeAt=state.at; }
    var planResumeId=resume.lessonItemId||((resume.phase!=='review'&&resume.itemId)?resume.itemId:'');
    if(planResumeId){ var planAt=plan.findIndex(function(item){ return item.id===planResumeId; }); if(planAt>=0) state.resumeAt=planAt; }
    if(resume.phase==='review'&&reviews.length){
      var reviewAt=reviews.findIndex(function(item){ return String(item.id)===String(resume.itemId)||String(item.cardId)===String(resume.itemId); });
      if(reviewAt>=0) state.reviewIndex=reviewAt;
    }else if(!reviews.length&&planResumeId){
      state.at=state.resumeAt; state.phase=plan[state.at].kind==='practice'?'practice':'lesson';
    }
    record.startedAt=record.startedAt||now.toISOString(); q.startedAt=q.startedAt||now.toISOString(); ui.kaoLesson=state; ui.kaoNight=false; ui.kaoDurableCount=0;
    if(state.phase==='review'&&state.reviewIndex>0){ state.reviews=reviews.slice(state.reviewIndex); }
    return kaoLessonActivate(ui);
  }
  // K2F-06 (K4-01): ünite ustalığı — çapa metnini oku + 10 soruluk karma test (eşik 0,8). Plan saf Flow'dan gelir.
  // Ders kaydı (path.lessons) yazılmaz; sonuç path.units[id]'ye özet ekranına ulaşıldığında bir kez kaydedilir.
  var KAO_MASTERY_PASS=0.8;
  function kaoMasteryStart(unit,ui,q,content,flow){
    if(typeof flow.masteryPlan!=='function') return false;
    var active=ui.kaoLesson;
    if(active&&active.kind==='mastery'&&active.unitId===unit.id&&active.done!==true){
      kaoApplyView(ui,'session',null,ui.kaoView==='session'?'replace':'push'); quranLearnDeps.render();
      if(active.phase==='practice') startTaskPresentation();
      return true;
    }
    var now=new Date(),plan=flow.masteryPlan({quranLearn:q},unit.id,now,content);
    if(!Array.isArray(plan)||!plan.length){
      if(quranLearnSurfaceDeps&&typeof quranLearnSurfaceDeps.toast==='function') quranLearnSurfaceDeps.toast('Ustalık kontrolü için önce bu ünitenin kelimelerini tanımalısın.');
      return false;
    }
    ui.kaoLesson={kind:'mastery',unitId:unit.id,lessonId:'mastery:'+unit.id,title:'Ustalık: '+String(unit.title||''),plan:plan,at:0,phase:'lesson',reviews:[],correct:0,answered:0,done:false,recorded:false,wrongLemmas:[],earnedMilestones:[],milestoneCelebrated:false,startedAt:now.toISOString(),resumeAt:0};
    ui.kaoNight=false; ui.kaoDurableCount=0;
    return kaoLessonActivate(ui);
  }
  function kaoMasteryRecord(state){
    if(!state||state.kind!=='mastery'||state.recorded===true||!quranLearnDeps) return false;
    var q=ensureQuranLearn(quranLearnDeps.data()),stamp=new Date().toISOString();
    var answered=Math.floor(nonNegativeNumber(state.answered,0)),correct=Math.min(answered,Math.floor(nonNegativeNumber(state.correct,0))),score=answered?correct/answered:0,passed=score>=KAO_MASTERY_PASS;
    q.path=objectOr(q.path,{}); q.path.units=objectOr(q.path.units,{});
    var key=String(state.unitId),previous=objectOr(q.path.units[key],{}),passedBefore=typeof previous.masteryAt==='string'&&!!previous.masteryAt;
    var next=Object.assign({masteryAt:null,masteryScore:null,attempts:0,lastAttemptAt:null,repair:null,skippedAt:null},previous);
    next.attempts=Math.floor(nonNegativeNumber(previous.attempts,0))+1; next.lastAttemptAt=stamp;
    if(passed&&!passedBefore){ next.masteryAt=stamp; next.masteryScore=score; next.repair=null; }
    else if(!passed&&!passedBefore){ next.masteryScore=score; next.repair={lemmaIds:validLemmaIds(state.wrongLemmas),at:stamp}; }
    q.path.units[key]=next; state.recorded=true; state.result={score:score,passed:passed||passedBefore,answered:answered,correct:correct};
    // K2F-08: u<n> taşı yalnız ustalık geçilince (kaoUnitMastered masteryAt'a bakar); özet için kazanılanlar oturumda tutulur.
    var earnedNow=recordMilestones(q,quranLearnDeps.data(),new Date());
    state.earnedMilestones=Array.isArray(state.earnedMilestones)?state.earnedMilestones:[];
    earnedNow.forEach(function(milestone){ if(state.earnedMilestones.indexOf(milestone)<0) state.earnedMilestones.push(milestone); });
    return true;
  }
  // K2F-07: onarım oturumu — yalnız karıştırılan kelimeler, iki yön; bitince repair:null (ustalık/deneme/ders kaydı yazılmaz).
  function kaoUnitSession(state){ return !!state&&(state.kind==='mastery'||state.kind==='repair'); }
  function kaoRepairStart(unit,ui,q,content,flow){
    if(typeof flow.repairPlan!=='function') return false;
    var active=ui.kaoLesson;
    if(active&&active.kind==='repair'&&active.unitId===unit.id&&active.done!==true){
      kaoApplyView(ui,'session',null,ui.kaoView==='session'?'replace':'push'); quranLearnDeps.render();
      if(active.phase==='practice') startTaskPresentation();
      return true;
    }
    var now=new Date(),plan=flow.repairPlan({quranLearn:q},unit.id,now,content);
    if(!Array.isArray(plan)||!plan.length){
      if(quranLearnSurfaceDeps&&typeof quranLearnSurfaceDeps.toast==='function') quranLearnSurfaceDeps.toast('Bu ünite için onarılacak kelime yok.');
      return false;
    }
    ui.kaoLesson={kind:'repair',unitId:unit.id,lessonId:'repair:'+unit.id,title:'Onarım: '+String(unit.title||''),plan:plan,at:0,phase:'lesson',reviews:[],correct:0,answered:0,done:false,recorded:false,earnedMilestones:[],milestoneCelebrated:false,startedAt:now.toISOString(),resumeAt:0};
    ui.kaoNight=false; ui.kaoDurableCount=0;
    return kaoLessonActivate(ui);
  }
  function kaoRepairFinish(state){
    if(!state||state.kind!=='repair'||state.recorded===true||!quranLearnDeps) return false;
    var q=ensureQuranLearn(quranLearnDeps.data()),units=objectOr(objectOr(q.path,{}).units,{}),rec=units[String(state.unitId)];
    if(rec&&typeof rec==='object') rec.repair=null;
    var answered=Math.floor(nonNegativeNumber(state.answered,0)),correct=Math.min(answered,Math.floor(nonNegativeNumber(state.correct,0)));
    state.recorded=true; state.result={score:answered?correct/answered:0,passed:true,answered:answered,correct:correct};
    return true;
  }
  // "Şimdilik atla" (KR-2): yalnız skippedAt yazar; masteryAt/taş yazmaz; geçilmiş ünitede kayıt değişmez.
  function kaoMasterySkip(unitId){
    if(!quranLearnDeps) return false;
    var curriculum=window.QuranCurriculumV2,unit=curriculum&&Array.isArray(curriculum.units)?curriculum.units.find(function(item){ return String(item.id)===String(unitId); }):null;
    if(!unit) return false;
    var q=ensureQuranLearn(quranLearnDeps.data());
    q.path=objectOr(q.path,{}); q.path.units=objectOr(q.path.units,{});
    var key=String(unit.id),rec=objectOr(q.path.units[key],{});
    if(typeof rec.masteryAt==='string'&&rec.masteryAt) return true;
    q.path.units[key]=Object.assign({masteryAt:null,masteryScore:null,attempts:0,lastAttemptAt:null,repair:null,skippedAt:null},rec,{skippedAt:new Date().toISOString()});
    kaoSave(); quranLearnDeps.render(); return true;
  }
  function kaoLessonHTML(){
    if(!quranLearnDeps) return '';
    var ui=quranLearnDeps.ui(),state=ui.kaoLesson;
    if(!state) return kaoTaskHTML(currentTask());
    if(state.phase==='review'||state.phase==='practice') return kaoTaskHTML(currentTask());
    var item=(state.plan||[])[state.at||0];
    if(!item) return '<main class="kao-lesson"><p role="status">Ders durumu yüklenemedi.</p></main>';
    // KAO2-18 (Y-02): ders bağlamı — hangi ünitenin kaçıncı dersi, hedefi ne.
    var lessonRef=kaoCurriculumLesson(state.lessonId),lessonUnit=lessonRef?kaoCurriculumUnit(lessonRef.unitId):null;
    var contextLine=lessonUnit?(kaoUnitContextLabel(lessonUnit)+' · Ders '+String(lessonRef.index+1)+' / '+String(lessonUnit.lessons.length)):'';
    if(kaoUnitSession(state)){ var sessionUnit=kaoCurriculumUnit(state.unitId),sessionLabel=state.kind==='repair'?'Onarım':'Ustalık kontrolü'; contextLine=sessionUnit?(kaoUnitContextLabel(sessionUnit)+' · '+sessionLabel):sessionLabel; }
    var model={stage:item.kind==='read'?'apply':item.kind,title:state.title,context:contextLine,step:(state.at||0)+1,stepTotal:state.plan.length,percent:((state.at||0)+1)/state.plan.length*100,action:item.kind==='summary'?{name:'kaoLesson',args:['finish']}:{name:'kaoLesson',args:['next']},exit:{name:'kaoLesson',args:['exit']},buttonLabel:item.kind==='summary'?'Bugün yeter':'Devam'};
    if(item.kind==='goal'&&state.kind==='repair'){
      model.promise='Karıştırdığın '+(item.lemmaIds||[]).length+' kelimeyi iki yönde tekrar edeceğiz. Bitince ustalık kontrolünü yeniden deneyebilirsin.';
    }else if(item.kind==='goal'&&state.kind==='mastery'){
      model.promise='Önce çapa metnini dokunmadan oku, sonra 10 soruluk karma testi geç. Geçmek için en az 8 doğru gerekir; olmazsa yalnız karıştırdığın kelimeleri tekrar ederiz.';
    }else if(item.kind==='goal'){
      model.promise='Bu derste '+(item.lemmaIds||[]).length+' kelimeyle çalışacağız. Önce tanış, ardından kavramı gör, pekiştir ve metinde bul.';
      model.goal=lessonRef?kaoVisibleText(lessonRef.lesson.review,lessonRef.lesson.goal,''):'';
    }
    if(item.kind==='intro'){
      var lemma=item.lemma||{}; model.ar=lemma.ar; model.pronunciation=kaoLemmaReading(item.lemmaId,lemma.translit); model.meaning=Array.isArray(lemma.meanings)?lemma.meanings.join(' · '):''; model.ordinal=item.ordinal; model.total=item.total;
      model.cognate=lemma.cognate&&lemma.cognate.tr?String(lemma.cognate.tr):''; model.example=kaoIntroExample(lemma); model.why=kaoIntroWhy(lemma);
      if(safeClipId('w-'+item.lemmaId)) model.audio={action:{name:'kaoPlay',args:['w-'+item.lemmaId,kaoAudioStyle()]}};
      model.anchorTitle=item.applyRef&&item.applyRef.ref?String(item.applyRef.ref==='fatiha'?'Fâtiha içindeki yeri':'Çapa metnindeki yeri'):'';
      model.anchor=item.anchor?[item.anchor]:[];
    }
    if(item.kind==='concept'){
      var concept=item.concept||{}; model.title=concept.title||'Kavram'; model.plainTr=concept.plainTr||concept.description||''; model.termTr=concept.termTr||''; model.table=Array.isArray(concept.tables)?concept.tables[0]:null;
    }
    if(item.kind==='apply'){
      var ref=item.ref||{},shorts=window.QuranShortSurahsV1,title='Çapa metni';
      if(ref.kind==='prayer'&&shorts&&Array.isArray(shorts.prayerTexts)){ var text=shorts.prayerTexts.find(function(value){ return value.id===ref.ref; }); if(text) title=text.title||text.name||text.id; }
      if(ref.kind==='surah'&&shorts&&Array.isArray(shorts.surahs)){ var surah=shorts.surahs.find(function(value){ return Number(value.id)===Number(ref.ref); }); if(surah) title=surah.name||surah.title||title; }
      model.title=title; model.lead='Yeni kelimeler vurgulu; diğer kelimeler çapa metninde yerinde.'; model.words=item.words||[];
      if(item.mode==='examples'){ model.title='Örnek cümleler'; model.lead='Bu dersin kelimelerini gerçek âyetlerde gör.'; model.sentences=item.sentences||[]; }
    }
    if(item.kind==='read'){
      // K2F-06: ustalık çapa metni — kelimeler Flow'dan (içerik modülü kaynaklı) gelir.
      var shortsContent=window.QuranShortSurahsV1,readTitles=(Array.isArray(item.anchors)?item.anchors:[]).map(function(anchor){
        var parts=/^(prayer|surah):(.+)$/.exec(String(anchor));
        if(!parts||!shortsContent) return '';
        if(parts[1]==='prayer'&&Array.isArray(shortsContent.prayerTexts)){ var prayerText=shortsContent.prayerTexts.find(function(value){ return value.id===parts[2]; }); return prayerText?String(prayerText.title||prayerText.name||prayerText.id):''; }
        if(parts[1]==='surah'&&Array.isArray(shortsContent.surahs)){ var readSurah=shortsContent.surahs.find(function(value){ return Number(value.id)===Number(parts[2]); }); return readSurah?String(readSurah.name||readSurah.title||''):''; }
        return '';
      }).filter(Boolean);
      model.title=readTitles.length?readTitles.join(' · '):'Çapa metni'; model.lead='Dokunmadan oku: kelimelerin anlamını içinden hatırlamaya çalış, hazır olunca devam et.'; model.words=item.words||[];
    }
    if(item.kind==='summary'&&kaoUnitSession(state)){
      var q0=ensureQuranLearn(quranLearnDeps.data()),result=objectOr(state.result,{score:0,passed:false,answered:0,correct:0}),masteryNext=kaoNextStepFor(quranLearnDeps.data(),new Date()),repairing=state.kind==='repair';
      model.title=repairing?'Onarım tamam ✓':(result.passed?'Ustalık geçildi ✓':'Biraz daha pekiştirelim');
      model.learnedWords=[]; model.learnedMore=0;
      model.accuracy=result.answered?Math.round(result.correct/result.answered*100):null; model.accuracyDetail=result.answered?(repairing?result.correct+' / '+result.answered+' soru':result.answered+' sorudan '+result.correct+' doğru · geçmek için en az 8'):'Cevap kaydı yok';
      model.tomorrowText=repairing?'Şimdi ustalık kontrolünü yeniden deneyebilirsin.':(result.passed?'Bir sonraki üniteye geçebilirsin.':'Bu sefer olmadı; karıştırdığın kelimeler için kısa bir onarım turu yapacağız.');
      model.nextStep=masteryNext?{title:masteryNext.title,subtitle:masteryNext.subtitle}:null; model.durable='';
      var masteryEarned=Array.isArray(state.earnedMilestones)?state.earnedMilestones.slice().reverse().find(function(key){ return !!(q0.milestones&&q0.milestones[key]&&kaoMilestoneLabels()[key]); }):'';
      model.milestone=!repairing&&masteryEarned?kaoMilestoneLabels()[masteryEarned]:'';
      model.secondaryAction={name:'kaoLesson',args:['more']};
    }else if(item.kind==='summary'){
      var q=ensureQuranLearn(quranLearnDeps.data()),record=kaoLessonRecord(q,state.lessonId),lexicon=window.QuranLexiconV1,knownIds=Array.isArray(record.introducedLemmas)?record.introducedLemmas:[],sessionIds=Array.isArray(item.newLemmaIds)?item.newLemmaIds:knownIds,seen=Object.create(null),words=[];
      sessionIds.forEach(function(id){
        if(typeof id!=='string'||seen[id]||knownIds.indexOf(id)<0) return;
        seen[id]=true; var lemma=lexicon&&typeof lexicon.byId==='function'?lexicon.byId(id):null;
        if(lemma) words.push({ar:lemma.ar,meaning:Array.isArray(lemma.meanings)?lemma.meanings[0]||'':'',id:id});
      });
      var answered=Math.floor(nonNegativeNumber(state.answered,0)),correct=Math.min(answered,Math.floor(nonNegativeNumber(state.correct,0))),next=kaoLessonSummaryForecast(quranLearnDeps.data(),state,new Date());
      model.title=state.title+' tamamlandı'; model.learnedWords=words.slice(0,10); model.learnedMore=Math.max(0,words.length-10);
      model.accuracy=answered?Math.round(correct/answered*100):null; model.accuracyDetail=answered?correct+' / '+answered+' görev':'Pekiştirme yanıtı kaydı yok';
      model.tomorrowCount=Math.floor(nonNegativeNumber(next&&next.counts&&next.counts.reviews,0)); model.tomorrowMinutes=Math.floor(nonNegativeNumber(next&&next.minutes,0));
      model.tomorrowText=model.tomorrowCount?model.tomorrowCount+' tekrar kartı · günlük plan ~'+model.tomorrowMinutes+' dk':(model.tomorrowMinutes?'Vadeli tekrar görünmüyor · günlük plan ~'+model.tomorrowMinutes+' dk':'Yarın için vadeli tekrar görünmüyor.');
      model.nextStep=next?{title:next.title,subtitle:next.subtitle}:null;
      var earned=Array.isArray(state.earnedMilestones)?state.earnedMilestones:[],earnedKey=earned.slice().reverse().find(function(key){ return !!(q.milestones&&q.milestones[key]&&KAO_MILESTONE_LABELS[key]); });
      model.milestone=earnedKey?KAO_MILESTONE_LABELS[earnedKey]:'';
      var elapsed=kaoElapsedProgramDays(q.startedAt,new Date()),durable=Math.floor(nonNegativeNumber(ui.kaoDurableCount,0));
      model.durable=elapsed!==null&&elapsed>=7&&durable>0?durable+' kelime daha kalıcı oldu':'';
      model.secondaryAction={name:'kaoLesson',args:['more']};
    }
    return kaoViewsApi().lessonScreen(model);
  }
  function kaoLesson(action,lessonId,startMode){
    if(!quranLearnDeps) return false;
    var ui=quranLearnDeps.ui(),q=ensureQuranLearn(quranLearnDeps.data()),state=ui.kaoLesson;
    if(action==='start') return kaoLessonStart(lessonId,startMode);
    if(action==='skip-mastery') return kaoMasterySkip(lessonId);
    // K2F-28: ✕ tek çıkış eylemi — ders de tekrar oturumu da buradan Bugün'e döner; bekleyen geçiş/panel temizlenir.
    if(action==='exit'){
      if(ui.kaoAdvanceTimer&&quranLearnSurfaceDeps&&typeof quranLearnSurfaceDeps.clearTimer==='function') quranLearnSurfaceDeps.clearTimer(ui.kaoAdvanceTimer);
      ui.kaoAdvanceTimer=null; ui.kaoPanel={open:false}; ui.kaoUndo=null; ui.kaoFeedback=''; ui.kaoOrderDraft=[];
      if(state){ kaoLessonResume(ui); kaoSave(); }
      kaoShadowCleanup(); kaoApplyView(ui,'home',null,'reset'); quranLearnDeps.render();
      if(quranLearnSurfaceDeps&&typeof quranLearnSurfaceDeps.focusDialog==='function') quranLearnSurfaceDeps.focusDialog('sey-ov-card');
      return true;
    }
    if(!state) return false;
    if(action==='next'){
      if(state.phase!=='lesson') return false;
      var current=(state.plan||[])[state.at||0]; if(!current||current.kind==='summary') return false;
      state.at+=1; state.phase=state.plan[state.at]&&state.plan[state.at].kind==='practice'?'practice':'lesson'; return kaoLessonActivate(ui);
    }
    if(action==='finish'||action==='more'){
      var currentItem=state.plan[state.at||0]; if(state.phase!=='lesson'||!currentItem||currentItem.kind!=='summary') return false;
      var now=new Date(),unitSession=kaoUnitSession(state),record=unitSession?null:kaoLessonRecord(q,state.lessonId),key=quranLearnDeps.todayStr(),day=Object.assign({answered:0,correct:0,new:0,reviewed:0},objectOr(q.daily[key],{}));
      if(state.kind==='mastery') kaoMasteryRecord(state); // özet ekranında zaten yazıldıysa tekrar sayılmaz
      else if(state.kind==='repair') kaoRepairFinish(state);
      else{ record.doneAt=now.toISOString(); record.score=state.answered?state.correct/state.answered:null; record.resume=null; }
      day.lesson=true; if(action==='finish') day.sessionDone=true; q.daily[key]=day; state.done=true; kaoSave();
      if(action==='more'){ ui.kaoLesson=null; kaoStart(5); return true; }
      kaoApplyView(ui,'home',null,'reset'); quranLearnDeps.render(); return true;
    }
    return false;
  }
  function kaoStart(extraMinutes){
    if(!quranLearnDeps) return false;
    var ui=quranLearnDeps.ui(),d=quranLearnDeps.data(),now=new Date(),q=ensureQuranLearn(d);
    ui.kaoLesson=null; // K2F-28: tekrar oturumu ders değildir; eski ders durumu etiketi/✕ çıkışını bozmasın (ders devamı kayıtlı resume'dan gelir)
    var night=kaoNightWindow(d,now);
    ui.kaoQueue=kaoBuildQueue(d,now,{sessionId:quranLearnDeps.todayStr(),candidates:kaoCandidates()});
    // R-A1: hedef yatıştan önceki 90 dk'da oturum yalnız tekrar kartlarından, en çok 8 kart.
    ui.kaoNight=!!night;
    if(night) ui.kaoQueue=ui.kaoQueue.filter(function(item){ return !item.isNew&&item.type!=='fragment'; }).slice(0,night.maxCards); else { ui.kaoQueue=kaoInsertLinks(ui.kaoQueue,q,now); var transfer=kaoTransferCandidate(d,now); if(transfer) ui.kaoQueue.push({id:'kao:'+daySeed(now)+':t:'+transfer.key,cardId:'t:'+transfer.key,type:'transfer',isNew:false}); }
    if(Number.isFinite(extraMinutes)&&extraMinutes>0){
      var flow=window.SeymaQuranLearnFlow,limit=0;
      if(flow&&typeof flow.estimateMinutes==='function') for(var count=1;count<=ui.kaoQueue.length;count+=1){ if(flow.estimateMinutes(q.daily,count,now,0)>extraMinutes) break; limit=count; }
      ui.kaoQueue=ui.kaoQueue.slice(0,limit);
    }
    ui.kaoTaskIndex=0; ui.kaoTaskStartedAt=now.getTime(); ui.kaoUndo=null; ui.kaoPanel={open:false}; ui.kaoAdvanceTimer=null; ui.kaoFeedback=''; ui.kaoAudioFailed=false; ui.kaoTasks={}; kaoApplyView(ui,'session',null,ui.kaoView==='session'?'replace':'push'); ui.kaoOrderDraft=[]; ui.kaoDurableCount=0;
    ui.kaoQueue.forEach(function(item){ ui.kaoTasks[item.id]=kaoBuildTask(item,d,{seed:item.id}); });
    if(!q.startedAt) q.startedAt=now.toISOString();
    quranLearnDeps.render();
    if(quranLearnSurfaceDeps&&typeof quranLearnSurfaceDeps.setTimer==='function') quranLearnSurfaceDeps.setTimer(startTaskPresentation,0); else startTaskPresentation();
    return ui.kaoQueue.length;
  }
  function kaoAnswer(taskId,choiceId){
    if(!quranLearnDeps) return false;
    var task=currentTask();
    if(!task||task.id!==taskId) return false;
    var choice=task.choices.find(function(item){ return item.choiceId===choiceId; });
    if(!choice) return false;
    return applyAnswer(task,choice,choiceId);
  }
  function applyAnswer(task,choice,choiceId){
    if(!quranLearnDeps||!task||!choice) return false;
    var ui=quranLearnDeps.ui();
    var correct,orderDraftBefore=cloneValue(ui.kaoOrderDraft)||[];
    if(task.kind==='order'){
      ui.kaoOrderDraft=Array.isArray(ui.kaoOrderDraft)?ui.kaoOrderDraft:[];
      if(ui.kaoOrderDraft.indexOf(choiceId)>=0) return false;
      ui.kaoOrderDraft.push(choiceId);
      if(ui.kaoOrderDraft.length<task.choices.length){
        ui.kaoFeedback=String(ui.kaoOrderDraft.length)+' / '+String(task.choices.length)+' kelime seçildi'; paintTask(); return {pending:true};
      }
      correct=ui.kaoOrderDraft.every(function(selectedId,index){
        var selected=task.choices.find(function(item){ return item.choiceId===selectedId; });
        return selected&&selected.ordinal===index;
      });
      choice={correct:correct};
    }
    var d=quranLearnDeps.data(),q=ensureQuranLearn(d),cards=q.cards,key=quranLearnDeps.todayStr(),now=new Date();
    ui.kaoUndo=kaoUndoSnapshot(q,ui,task,key,orderDraftBefore);
    if(task.fragmentKind==='delayed'){
      var delayed=objectOr(q.surahs[String(task.delayedSurahId)],{}),delayedCorrect=choice.correct===true;
      q.surahs[String(task.delayedSurahId)]=delayed;
      delayed.delayedAnswered=Math.floor(nonNegativeNumber(delayed.delayedAnswered,0))+1;
      delayed.delayedScore=Math.floor(nonNegativeNumber(delayed.delayedScore,0))+(delayedCorrect?1:0);
      if(delayed.delayedAnswered>=5){
        delayed.delayedCompletedAt=now.toISOString(); delayed.needsReread=delayed.delayedScore<4;
        if(delayed.delayedScore>=4) delayed.confirmedAt=now.toISOString(); else delayed.confirmedAt=null;
        var confirmed=Object.keys(q.surahs).filter(function(id){ return q.surahs[id]&&q.surahs[id].confirmedAt; }).length;
        if(confirmed>=20&&!q.milestones.shortSurahs) q.milestones.shortSurahs=now.toISOString();
      }
      var delayedDaily=Object.assign({answered:0,correct:0,new:0,reviewed:0},objectOr(q.daily[key],{}));
      delayedDaily.ms=nonNegativeNumber(delayedDaily.ms,0)+kaoTaskMs(ui,now);
      delayedDaily.answered+=1; delayedDaily.reviewed+=1; if(delayedCorrect) delayedDaily.correct+=1; q.daily[key]=delayedDaily;
      if(delayedCorrect) kaoFx('correct'); kaoOpenFeedback(ui,task,delayedCorrect,choiceId);
      kaoSave(); paintTask(); kaoAutoAdvance(ui,q); return {correct:delayedCorrect,delayedScore:delayed.delayedScore};
    }
    if(task.type==='link'){ var daily0=Object.assign({answered:0,correct:0,new:0,reviewed:0},objectOr(q.daily[key],{})),link=Object.assign({n:0,ok:0},objectOr(daily0.link,{})),linkOk=choice.correct===true; link.n+=1; if(linkOk){ link.ok+=1; kaoFx('correct'); } daily0.link=link; q.daily[key]=daily0; kaoOpenFeedback(ui,task,linkOk,choiceId,linkOk?'Bağ kuruldu':''); kaoSave(); paintTask(); kaoAutoAdvance(ui,q); return {correct:linkOk}; }
    if(task.type==='transfer'){ var tr0=objectOr(q.transfer,{}),trOk=choice.correct===true; if(trOk) kaoFx('correct'); q.transfer={lastAt:now.toISOString(),n:Math.floor(nonNegativeNumber(tr0.n,0))+1,ok:Math.floor(nonNegativeNumber(tr0.ok,0))+(trOk?1:0),seen:(Array.isArray(tr0.seen)?tr0.seen:[]).concat(task.key).slice(-120)}; kaoOpenFeedback(ui,task,trOk,choiceId); kaoSave(); paintTask(); kaoAutoAdvance(ui,q); return {correct:trOk}; }
    var previous=objectOr(cards[task.cardId],{}); correct=choice.correct===true;
    if(ui.kaoLesson&&ui.kaoLesson.phase==='practice') {
      ui.kaoLesson.answered=Math.floor(nonNegativeNumber(ui.kaoLesson.answered,0))+1; if(correct) ui.kaoLesson.correct=Math.floor(nonNegativeNumber(ui.kaoLesson.correct,0))+1;
      // K2F-06: ustalıkta yanlış cevaplanan kelimeler (tekilleştirilmiş) onarım listesine gider.
      if(!correct&&ui.kaoLesson.kind==='mastery'){ var missed=lemmaIdForCard(task.cardId); ui.kaoLesson.wrongLemmas=Array.isArray(ui.kaoLesson.wrongLemmas)?ui.kaoLesson.wrongLemmas:[]; if(missed&&ui.kaoLesson.wrongLemmas.indexOf(missed)<0) ui.kaoLesson.wrongLemmas.push(missed); }
    }
    var elapsed=Math.max(0,now.getTime()-nonNegativeNumber(ui.kaoTaskStartedAt,now.getTime())),grade=kaoGrade(correct,elapsed,previous.reps),scheduled=kaoSchedule(previous,grade,now);
    if(correct&&scheduled.readerUnknown===true) delete scheduled.readerUnknown;
    // R-A2: kelime görevinde bu tekrarın çeldiricileri (lemma kimliği; dışlama lemma düzeyinde, kart kimliğinden
    // küçük) sonraki tekrarda dışlanmak üzere kartta tutulur.
    if(/^w:/.test(task.cardId)&&Array.isArray(task.choices)) scheduled.lastDistractors=task.choices.filter(function(choice){ return !choice.correct&&choice.cardId; }).map(function(choice){ return lemmaIdForCard(choice.cardId)||String(choice.cardId); }).slice(0,3);
    // Kartın ilk sunuluşu: ters yön uygunluğu ve anlamsal aralık bu zamana bakar (resultCard sonraki cevaplarda korur).
    if(!scheduled.introducedAt&&!nonNegativeNumber(previous.reps,0)) scheduled.introducedAt=now.toISOString();
    var reviewed=nonNegativeNumber(previous.reps,0)>0,afterNight=reviewed&&typeof previous.nightAt==='string';
    if(ui.kaoNight) scheduled.nightAt=key; else delete scheduled.nightAt;
    cards[task.cardId]=scheduled;
    var daily=Object.assign({answered:0,correct:0,new:0,reviewed:0},objectOr(q.daily[key],{}));
    daily.ms=nonNegativeNumber(daily.ms,0)+kaoTaskMs(ui,now);
    daily.answered+=1; if(correct) daily.correct+=1; if(task.isNew) daily.new+=1; else daily.reviewed+=1; q.daily[key]=daily;
    var calib=Object.assign({pred:0,ok:0,n:0},objectOr(daily.calib,{}));
    calib.pred=round8(nonNegativeNumber(calib.pred,0)+nonNegativeNumber(scheduled.predictedR,0)); calib.ok=nonNegativeNumber(calib.ok,0)+(correct?1:0); calib.n=nonNegativeNumber(calib.n,0)+1; daily.calib=calib;
    // R-A3: tekrar cevapları 10 R-bandında öngörü/gerçek; R-A1: gece tekrarı sayısı ve bir sonraki tekrarın doğruluğu (gece sonrası / diğer).
    if(reviewed){ var bands=Array.isArray(calib.bands)&&calib.bands.length===10?calib.bands:Array.from({length:10},function(){ return {pred:0,ok:0,n:0}; }),band=bands[Math.min(9,Math.floor(nonNegativeNumber(scheduled.predictedR,0)*10))]; band.pred=round8(band.pred+nonNegativeNumber(scheduled.predictedR,0)); band.ok+=correct?1:0; band.n+=1; calib.bands=bands; var follow=afterNight?'nightFollow':'dayFollow'; daily[follow]=Object.assign({n:0,ok:0},objectOr(daily[follow],{})); daily[follow].n+=1; daily[follow].ok+=correct?1:0; }
    if(ui.kaoNight) daily.nightRev=Math.floor(nonNegativeNumber(daily.nightRev,0))+1;
    if(!isDurable(previous)&&isDurable(scheduled)) ui.kaoDurableCount=Math.floor(nonNegativeNumber(ui.kaoDurableCount,0))+1;
    if(!correct&&task.errorClass&&Object.prototype.hasOwnProperty.call(q.errors,task.errorClass)) q.errors[task.errorClass]+=1;
    // Ustalık karma testinde yanlışa anında yeniden deneme eklenmez: puan yalnız ilk 10 cevaptan gelir (K2F-06).
    if(!correct&&!task.retry&&!(ui.kaoLesson&&ui.kaoLesson.kind==='mastery')){
      // Yeniden deneme farklı tohumla (kimlik+':retry') kurulur; K2F-10: sunulamayan gramer görevi tekrarlanmaz.
      var retryItem=Object.assign({},ui.kaoQueue[ui.kaoTaskIndex],{id:task.id+':retry',retry:true,isNew:false});
      if(kaoGrammarItemPresentable(retryItem,d)) ui.kaoQueue.push(retryItem);
    }
    ui.kaoOrderDraft=task.kind==='order'?cloneValue(ui.kaoOrderDraft):[];
    var earned=recordMilestones(q,d,now),lessonMilestone=kaoRememberLessonMilestones(ui,earned); if(correct) kaoFx('correct'); if(earned.length&&!lessonMilestone) kaoFx('milestone');
    var notes=[]; if(task.kind==='order'&&task.type==='fragment'&&!correct) notes.push('Fiil önce gelir: Arapçada çoğu kez fiil–özne–nesne sırası kullanılır.'); if(earned.length&&!lessonMilestone) notes.push(KAO_MILESTONE_LABELS[earned[earned.length-1]]+' ✦');
    kaoOpenFeedback(ui,task,correct,choiceId,notes.join(' · '));
    kaoLessonResume(ui); kaoSave(); paintTask(); kaoAutoAdvance(ui,q);
    return {correct:correct,grade:grade};
  }
  function kaoContinue(){
    if(!quranLearnDeps) return false;
    var ui=quranLearnDeps.ui(),q=ensureQuranLearn(quranLearnDeps.data());
    if(!ui.kaoPanel||ui.kaoPanel.open!==true) return false;
    if(ui.kaoAdvanceTimer&&quranLearnSurfaceDeps&&typeof quranLearnSurfaceDeps.clearTimer==='function') quranLearnSurfaceDeps.clearTimer(ui.kaoAdvanceTimer);
    ui.kaoAdvanceTimer=null; ui.kaoPanel={open:false}; ui.kaoUndo=null; ui.kaoFeedback=''; ui.kaoTaskIndex+=1; ui.kaoTaskStartedAt=Date.now(); ui.kaoOrderDraft=[];
    if(ui.kaoLesson&&(ui.kaoLesson.phase==='review'||ui.kaoLesson.phase==='practice')){
      if(ui.kaoTaskIndex>=(ui.kaoQueue||[]).length){
        if(ui.kaoLesson.phase==='review'){ ui.kaoLesson.at=ui.kaoLesson.resumeAt||0; ui.kaoLesson.phase=ui.kaoLesson.plan[ui.kaoLesson.at]&&ui.kaoLesson.plan[ui.kaoLesson.at].kind==='practice'?'practice':'lesson'; }
        else { ui.kaoLesson.at=ui.kaoLesson.practiceEndAt; ui.kaoLesson.phase='lesson'; }
        return kaoLessonActivate(ui);
      }
      kaoLessonResume(ui); kaoSave(); paintTask(); startTaskPresentation(); return true;
    }
    // KAO2-08: oturumun son cevabından sonra günün dersi tamam; gece tekrarı sayılmaz. Render içinde yazım yok.
    if(!ui.kaoNight&&Array.isArray(ui.kaoQueue)&&ui.kaoQueue.length>0&&ui.kaoTaskIndex>=ui.kaoQueue.length){
      var key=quranLearnDeps.todayStr();
      q.daily[key]=Object.assign({answered:0,correct:0,new:0,reviewed:0},objectOr(q.daily[key],{}),{sessionDone:true});
      kaoSave();
    }
    paintTask(); startTaskPresentation(); return true;
  }
  function kaoUndo(){
    if(!quranLearnDeps) return false;
    var ui=quranLearnDeps.ui(),undo=ui.kaoUndo;
    if(!undo) return false;
    var q=ensureQuranLearn(quranLearnDeps.data());
    if(undo.hadCard) q.cards[undo.cardId]=cloneValue(undo.card); else delete q.cards[undo.cardId];
    if(undo.hadDaily) q.daily[undo.dailyKey]=cloneValue(undo.daily); else delete q.daily[undo.dailyKey];
    if(undo.errors) q.errors=cloneValue(undo.errors);
    if(undo.milestones) q.milestones=cloneValue(undo.milestones);
    if(undo.lesson) ui.kaoLesson=cloneValue(undo.lesson);
    if(undo.kind==='delayed') { if(undo.hadSurah) q.surahs[undo.surahId]=cloneValue(undo.surah); else delete q.surahs[undo.surahId]; }
    if(undo.kind==='transfer') { if(undo.hadTransfer) q.transfer=cloneValue(undo.transfer); else delete q.transfer; }
    if(ui.kaoAdvanceTimer&&quranLearnSurfaceDeps&&typeof quranLearnSurfaceDeps.clearTimer==='function') quranLearnSurfaceDeps.clearTimer(ui.kaoAdvanceTimer);
    ui.kaoAdvanceTimer=null; ui.kaoQueue=cloneValue(undo.queue); ui.kaoTaskIndex=undo.taskIndex; ui.kaoTaskStartedAt=Date.now(); ui.kaoDurableCount=Math.floor(nonNegativeNumber(undo.durableCount,0)); ui.kaoOrderDraft=cloneValue(undo.orderDraft)||[]; ui.kaoUndo=null; ui.kaoPanel={open:false}; ui.kaoFeedback='Geri alındı';
    kaoSave(); paintTask(); return true;
  }
  // KAO2-22 (K-3): ses kimlikleri iki biçimlidir — kelime klibi (`w-l_<id>_<hex6>`)
  // ve hece klibi (`y-<harf>_<hareke|sükûn|med>-<m|f>`). Başka biçim reddedilir.
  var KAO_CLIP_WORD=/^w-l_[A-Za-z0-9_]+_[0-9a-f]{6}$/,KAO_CLIP_SYL=/^y-[a-z]+_[a-z_]+-[mf]$/;
  function safeClipId(value){ var id=String(value||'').replace(/\.m4a$/,''); return KAO_CLIP_WORD.test(id)||KAO_CLIP_SYL.test(id); }
  // K-3 hece kimliği üretimi. Kayıt gelmeden klibe erişilmez; bu yalnız AD üretir.
  function kaoS0SyllableClipId(letterId,mark,voice){ return 'y-'+String(letterId||'')+'_'+String(mark||'')+'-'+String(voice||''); }
  // Kademe seçimi: hece klibi VARSA A, yoksa B (harf gerçek kelime içinde). Uydurma yok.
  function kaoS0ClipPlan(letterId){
    var word=kaoS0Word(letterId),ui=quranLearnDeps?quranLearnDeps.ui():{},have=objectOr(ui.kaoS0Syllables,{});
    var ids=[];
    ['fatha','kasra','damma','sukun'].forEach(function(mk){ ['m','f'].forEach(function(v){ var id=kaoS0SyllableClipId(letterId,mk,v); if(have[id]) ids.push(id); }); });
    return ids.length?{tier:'A',syllable:ids,word:word}:{tier:'B',syllable:null,word:word};
  }
  function kaoPlay(clipId,style){
    if(!quranLearnDeps||!quranLearnSurfaceDeps||typeof quranLearnSurfaceDeps.createAudio!=='function'||!safeClipId(clipId)) return false;
    var resolved=style==='flowing'?'flowing':'measured',ui=quranLearnDeps.ui(),audio=quranLearnSurfaceDeps.createAudio('assets/kao/audio/'+clipId+'-'+resolved+'.m4a');
    if(!audio) return false;
    audio.preload='none';
    var reveal=function(){ var node=typeof quranLearnSurfaceDeps.taskElement==='function'&&quranLearnSurfaceDeps.taskElement(),items=node&&typeof node.querySelectorAll==='function'?node.querySelectorAll('[data-kao-ar]'):[]; Array.prototype.forEach.call(items||[],function(ar){ if(ar&&ar.classList) ar.classList.remove('kao-audio-pending'); }); };
    if(typeof audio.addEventListener==='function'){ audio.addEventListener('playing',reveal,{once:true}); audio.addEventListener('error',function(){ ui.kaoAudioFailed=true; reveal(); },{once:true}); }
    if(typeof quranLearnSurfaceDeps.setTimer==='function') quranLearnSurfaceDeps.setTimer(reveal,150);
    try{ var result=audio.play(); if(result&&typeof result.catch==='function') result.catch(function(){ ui.kaoAudioFailed=true; reveal(); }); }catch(_error){ ui.kaoAudioFailed=true; reveal(); }
    return audio;
  }
  // KAO-17 · E7: ayarlar kalıcıdır (data.quranLearn.settings / readability); ağ yok.
  var KAO_DAILY_NEW=[5,10,15],KAO_LINE_HEIGHTS=['1.9','2.2','2.5'],KAO_CSV_HEADER='ar,tr,translit,root,tags';
  function kaoCommitSetting(change){
    if(!quranLearnDeps) return false;
    var q=ensureQuranLearn(quranLearnDeps.data());
    if(change(q)===false) return false;
    quranLearnDeps.ui().kaoTasks={}; kaoSave(); quranLearnDeps.render(); return true;
  }
  function kaoSetDailyNew(n){ var value=Number(n); return KAO_DAILY_NEW.indexOf(value)>=0&&kaoCommitSetting(function(q){ q.settings.dailyNew=value; }); }
  function kaoSetIntent(value){ return typeof value==='string'&&KAO_ONBOARD_INTENTS.some(function(pair){ return pair[0]===value; })&&kaoCommitSetting(function(q){ q.onboarding.intent=value; }); }
  function kaoSetAudioStyle(style){
    if(['off','measured','flowing'].indexOf(style)<0) return false;
    return kaoCommitSetting(function(q){ q.settings.audio=style!=='off'; if(style!=='off') q.settings.audioStyle=style; });
  }
  function kaoToggleAutoAdvance(){ return kaoCommitSetting(function(q){ q.settings.autoAdvance=q.settings.autoAdvance!==true; }); }
  function kaoToggleHarakat(){ return kaoCommitSetting(function(q){ q.settings.harakat=q.settings.harakat===false; }); }
  function kaoToggleFade(){ return kaoCommitSetting(function(q){ q.readability.fadeHarakat=!q.readability.fadeHarakat; }); }
  function kaoSetTranslit(layer){ return (layer==='tr'||layer==='dia')&&kaoCommitSetting(function(q){ q.settings.translitLayer=layer; }); }
  function kaoSetReadability(key,value){
    var valid=(key==='lineHeight'&&KAO_LINE_HEIGHTS.indexOf(String(value))>=0)||(key==='wordSpacing'&&(value==='normal'||value==='wide'))||(key==='coloredHarakat'&&typeof value==='boolean');
    return valid&&kaoCommitSetting(function(q){ q.readability[key]=key==='lineHeight'?String(value):value; });
  }
  function kaoReopenGate(){ return kaoGate('start'); }
  function kaoCsvCell(value){
    var text=String(value==null?'':value).replace(/[\r\n]+/g,' ');
    if(/^[=+\-@\t]/.test(text)) text="'"+text;
    return /[",]/.test(text)?'"'+text.replace(/"/g,'""')+'"':text;
  }
  function kaoKnownLemmas(d){
    var q=quranLearnRoot(d),cards=objectOr(q.cards,{}),lex=window.QuranLexiconV1,shorts=window.QuranShortSurahsV1,seen=Object.create(null),out=[],known=kaoKnownLemmaSet(d);
    Object.keys(cards).sort().forEach(function(id){
      var lemmaId=lemmaIdForCard(id);
      if(!lemmaId||seen[lemmaId]||!known[lemmaId]) return;
      var lemma=(lex&&typeof lex.byId==='function'&&lex.byId(lemmaId))||(shorts&&typeof shorts.lemmaById==='function'&&shorts.lemmaById(lemmaId));
      if(!lemma||!lemma.ar) return;
      seen[lemmaId]=1; out.push(lemma);
    });
    return out;
  }
  function kaoCsv(d){
    return [KAO_CSV_HEADER].concat(kaoKnownLemmas(d).map(function(lemma){
      var tags=['kuran-arapcasi',lemma.pos?'tur_'+lemma.pos:'',lemma.cognate&&lemma.cognate.tr?'turkcede_var':''].filter(Boolean).join(' ');
      return [lemma.ar,(lemma.meanings||[])[0]||'',kaoLemmaReading(lemma.id,lemma.translit),lemma.root||'',tags].map(kaoCsvCell).join(',');
    })).join('\r\n')+'\r\n';
  }
  function kaoExportCsv(){
    if(!quranLearnDeps||!quranLearnSurfaceDeps||typeof quranLearnSurfaceDeps.createLink!=='function') return false;
    var BlobCtor=window.Blob,urlApi=window.URL;
    if(typeof BlobCtor!=='function'||!urlApi||typeof urlApi.createObjectURL!=='function'||typeof urlApi.revokeObjectURL!=='function') return false;
    var d=quranLearnDeps.data(),count=kaoKnownLemmas(d).length,url=urlApi.createObjectURL(new BlobCtor(['\ufeff'+kaoCsv(d)],{type:'text/csv;charset=utf-8'})),revoke=function(){ urlApi.revokeObjectURL(url); };
    try{ var link=quranLearnSurfaceDeps.createLink(); link.href=url; link.download='kuran-kelimelerim-'+quranLearnDeps.todayStr()+'.csv'; link.rel='noopener'; link.click(); }
    catch(_error){ revoke(); quranLearnDeps.ui().kaoSettingsNote='CSV indirilemedi; tekrar dene.'; quranLearnDeps.render(); return false; }
    if(typeof quranLearnSurfaceDeps.setTimer==='function') quranLearnSurfaceDeps.setTimer(revoke,1000); else revoke();
    quranLearnDeps.ui().kaoSettingsNote=count+' kelime CSV olarak indirildi.'; quranLearnDeps.render(); return true;
  }
  function kaoSegHTML(label,options,current,handler){
    var esc=quranLearnDeps.esc;
    return '<div class="kao-setting"><p class="kao-setting-label">'+esc(label)+'</p><div class="kao-seg" role="group" aria-label="'+esc(label)+'">'+options.map(function(option){ return '<button type="button" aria-pressed="'+(String(option[0])===String(current)?'true':'false')+'" onclick="App.'+handler+'('+option[2]+')">'+esc(option[1])+'</button>'; }).join('')+'</div></div>';
  }
  // Ses kaynakları: kuran-ogreniyorum/content/audio-manifest.json → datasets[] (id, license, attribution, url); ad, id'den okunur.
  var KAO_AUDIO_SOURCES=[
    {name:'Tadabur (FaisaI/tadabur)',license:'CC BY-NC 4.0',attribution:'Faisal Alsaif, Faisal Almosallam, Haitham Aloqiel, Faris Alblehai',url:'https://huggingface.co/datasets/FaisaI/tadabur'},
    {name:'AQQD-v2',license:'CC0 1.0',attribution:'Taibah University academic initiative; R000 controlled single reciter',url:'https://doi.org/10.7910/DVN/A8GM5Y'}
  ];
  // Zamanlayıcı kaynağı: bu dosyanın başındaki ts-fsrs lisans başlığı.
  var KAO_FSRS_SOURCE={name:'ts-fsrs v4.5.2 (Open Spaced Repetition)',license:'MIT',url:'https://github.com/open-spaced-repetition/ts-fsrs/tree/v4.5.2'};
  function kaoContentSources(){
    var seen={},out=[];
    [window.QuranLexiconV1,window.QuranShortSurahsV1].forEach(function(mod){
      var list=mod&&mod.ATTRIBUTION&&Array.isArray(mod.ATTRIBUTION.sources)?mod.ATTRIBUTION.sources:[];
      list.forEach(function(s){ var key=s&&(s.url||s.name); if(!key||seen[key]) return; seen[key]=true; out.push(s); });
    });
    return out;
  }
  function kaoSourceItemHTML(s,esc){
    var name=/^https:\/\//.test(String(s.url||''))?'<a href="'+esc(s.url)+'" rel="noopener" target="_blank">'+esc(s.name)+'</a>':esc(s.name);
    return '<li>'+name+(s.license?' · <span class="kao-source-license">'+esc(s.license)+'</span>':'')+(s.attribution?'<span class="kao-source-note">'+esc(s.attribution)+'</span>':'')+'</li>';
  }
  function kaoSourcesHTML(esc){
    esc=typeof esc==='function'?esc:(quranLearnDeps&&quranLearnDeps.esc);
    var item=function(s){ return kaoSourceItemHTML(s,esc); };
    return '<section class="kao-sources" aria-labelledby="kao-sources-title"><h3 id="kao-sources-title">Kaynaklar ve lisanslar</h3><h4>Ses kayıtları</h4><ul>'+KAO_AUDIO_SOURCES.map(item).join('')+'</ul><h4>Metin, sözlük ve dualar</h4><ul>'+kaoContentSources().map(item).join('')+'</ul><h4>Tekrar zamanlaması</h4><ul>'+item(KAO_FSRS_SOURCE)+'</ul><p class="kao-setting-hint">Lisans adları her kaynağın kendi beyanıdır; bağlantılar yeni sekmede açılır.</p></section>';
  }
  // KAO2-23 (T-23): kaynak/lisans listesi Ayarlar gövdesinden ÇIKARILDI; ayrı
  // "Hakkında ve kaynaklar" alt sayfasına taşındı. Gelişmiş eylemler (Seviye 0
  // kontrolünü yeniden aç, CSV) iOS kalıbında derine iner.
  function kaoSourcesPageHTML(){
    if(!quranLearnDeps) return '';
    var esc=quranLearnDeps.esc,ui=quranLearnDeps.ui(),q=ensureQuranLearn(quranLearnDeps.data());
    var h='<main class="kao-sources-page" aria-labelledby="kao-sources-page-title"><div class="kao-view-head"><button type="button" class="kao-back" onclick="App.kaoSetView(\'settings\')">‹ Ayarlar</button></div>'
      +'<section class="kao-about"><h3 id="kao-sources-page-title" class="kao-sr-only">Hakkında ve kaynaklar</h3>'
      +'<p class="kao-setting-hint">Kur’an Arapçası öğrenme modülü. Öğrenme verilerin <strong>yalnız bu cihazda</strong> ve kendi veri deposunda tutulur; kaynak listesi ağa bağlanmaz.</p>'
      +'<dl class="kao-about-list"><dt>Sürüm</dt><dd>KAO2 · metin katmanı</dd>'
      +'<dt>Çalışma biçimi</dt><dd>Çevrimdışı çalışır; ses klipleri cihazda önbelleğe alınır.</dd>'
      +'<dt>Gizlilik</dt><dd>Mikrofon yalnız gölgeleme açıkken ve en çok 10 sn; kayıt cihazdan çıkmaz.</dd></dl></section>'
      +'<section class="kao-about-group"><h3>Gelişmiş</h3><div class="kao-setting-row"><button type="button" class="kao-secondary" onclick="App.kaoReopenGate()">Seviye 0 kontrolünü yeniden aç</button><button type="button" class="kao-secondary" onclick="App.kaoExportCsv()">Kelimelerimi indir (CSV)</button></div>'
      +'<p class="kao-setting-hint">CSV yalnız bu cihazda oluşturulur; Anki uyumlu sütunlar: ar, tr, translit, root, tags.</p><p class="kao-live" aria-live="polite">'+esc(ui.kaoSettingsNote||'')+'</p></section>'
      +kaoSourcesHTML(esc)+'</main>';
    return h;
  }
  function kaoStartLabel(start){ return start==='s0'?'Harflerle':(start==='level1'||start==='placement'?'Seviye 1':''); }
  function kaoSettingsHTML(){
    if(!quranLearnDeps) return '';
    var q=ensureQuranLearn(quranLearnDeps.data()),ui=quranLearnDeps.ui(),esc=quranLearnDeps.esc,s=q.settings,r=q.readability,lines={compact:'1.9',normal:'2.2',wide:'2.5'},line=lines[r.lineHeight]||String(r.lineHeight);
    var sample=KAO_READABILITY_SAMPLE,audio=s.audio?kaoAudioStyle():'off';
    var views=kaoViewsApi(),group=views.settingsGroup,sw=function(label,on,action){ return views.switchRow({label:label,on:on,action:action}); };
    var intentValue=String(q.onboarding.intent||''),intentHit=KAO_INTENT_PRAYERS.filter(function(pair){ return pair[0]===intentValue; })[0];
    var intentText=intentHit?('Her '+intentHit[1]+' namazından sonra 5 dakika'):(intentValue==='custom'?'Kendim seçerim':'Henüz seçilmedi');
    var h='<main class="kao-settings" aria-labelledby="kao-settings-title"><div class="kao-view-head"><div><p class="kao-eyebrow">Ayarlar</p><h2 id="kao-settings-title">Öğrenme ayarların</h2><p>Seçimlerin bu cihazda saklanır ve senkronla taşınır.</p></div><button type="button" class="kao-back" onclick="App.kaoSetView(\'home\')">Geri</button></div>';
    // K2F-29 (06/KAO2-23): amaca göre gruplar; tüm aç/kapat ayarları gerçek anahtardır (etiket değer içermez).
    h+=group('Günlük hedef',[kaoSegHTML('Günlük yeni kelime',KAO_DAILY_NEW.map(function(n){ return [n,String(n),n]; }),Math.floor(nonNegativeNumber(s.dailyNew,10)),'kaoSetDailyNew'),kaoSegHTML('Niyet',KAO_ONBOARD_INTENTS.map(function(pair){ return [pair[0],pair[1],"'"+pair[0]+"'"]; }),q.onboarding.intent,'kaoSetIntent')],'Niyet: '+intentText);
    h+=group('Ses',[kaoSegHTML('Yeni kelimede otomatik ses',[['off','Kapalı',"'off'"],['measured','Yavaş',"'measured'"],['flowing','Doğal',"'flowing'"]],audio,'kaoSetAudioStyle')],'Ses düğmesinde dokunmak yavaş, basılı tutmak doğal hızı çalar. Sessiz saatte otomatik ses çalmaz.');
    h+=group('Okuma',[
      kaoSegHTML('Latin okunuş katmanı',[['tr','Okunuş',"'tr'"],['dia','DİA',"'dia'"]],kaoTranslitLayer(),'kaoSetTranslit'),
      sw('Harekeleri göster',s.harakat!==false,{name:'kaoToggleHarakat'}),
      sw('Tekrarda harekeyi soldur',r.fadeHarakat===true,{name:'kaoToggleFade'}),
      kaoSegHTML('Arapça satır aralığı',KAO_LINE_HEIGHTS.map(function(v){ return [v,v==='1.9'?'Sıkı':(v==='2.2'?'Rahat':'Geniş'),"'lineHeight','"+v+"'"]; }),line,'kaoSetReadability'),
      kaoSegHTML('Kelime boşluğu',[['normal','Normal',"'wordSpacing','normal'"],['wide','Geniş',"'wordSpacing','wide'"]],r.wordSpacing,'kaoSetReadability'),
      sw('Renkli hareke (Seviye 0)',r.coloredHarakat===true,{name:'kaoSetReadability',args:['coloredHarakat',r.coloredHarakat!==true]}),
      '<p class="kao-gate-ar kao-settings-sample" lang="ar" dir="rtl" style="'+kaoReadabilityStyle()+'">'+(r.coloredHarakat?kaoColorHarakat(sample):esc(sample))+'</p>'
    ],'DİA katmanı kelime kartlarında harfleri birebir ayırır (ḥ, ṣ, ʿ); âyet ve parça okunuşları Okunuş katmanında kalır.');
    h+=group('Öğrenme',[sw('Doğruda otomatik geç',s.autoAdvance===true,{name:'kaoToggleAutoAdvance'}),views.groupRow({title:'Başlangıç noktasını değiştir',value:kaoStartLabel(q.onboarding.start),action:{name:'kaoOnboard',args:['change-start']}})],'Açıkken doğru cevaptan kısa süre sonra kendiliğinden sonraki göreve geçilir. Başlangıç noktası yalnız önerilen ilk dersi değiştirir; ilerlemen ve kartların korunur.');
    h+=group('Gölgeleme',[sw('Gölgeleme',s.shadowing===true,{name:'kaoToggleShadowing'})],'Açıkken Telaffuz stüdyosunda modeli dinleyip kendi sesini en çok 10 saniye kaydedebilirsin. Mikrofon yalnız sen başlatınca açılır; kayıt yalnız bu ekranda bellekte durur, hiçbir yere kaydedilmez ya da gönderilmez ve pencereyi kapatınca silinir.');
    h+=group('Görünürlük',[sw('İlham & İbadet’te kartı göster',s.kaoVisible!==false,{name:'kaoToggleVisible'})],'Kapatırsan kart gizlenir, verilerin korunur; uygulama Ayarları → Gizlenen kartlar bölümünden geri getirebilirsin.');
    h+=views.groupedList([{title:'Veri',rows:[{title:'Kelimelerimi indir (CSV)',action:{name:'kaoExportCsv'}},{title:'Seviye 0 kontrolünü yeniden aç',action:{name:'kaoReopenGate'}}],footer:'CSV yalnız bu cihazda oluşturulur; Anki uyumlu sütunlar: ar, tr, translit, root, tags.'},{title:'Hakkında',rows:[{title:'Hakkında ve kaynaklar',action:{name:'kaoSetView',args:['sources']}}]}]);
    h+='<p class="kao-live" aria-live="polite">'+esc(ui.kaoSettingsNote||'')+'</p></main>';
    return h;
  }
  // assets/kao/svg/* dosyalarının birebir kopyası (test_kao_phonics_contract.js eşitliği denetler).
  // KAO2-20: mahreç şemaları içerik katmanındadır (app/content/quranMahrecSchemasV1.js);
  // veri çalışma zamanı bütçesine yazılmaz. Erişim yalnız yukarıdaki yardımcıdan.
  // KAO-26 · E8 Telaffuz stüdyosu: algı görevleri yalnız paketli kliplerden; kartlar quranLearn.phonics['p:…'] (FSRS).
  var KAO_PHONICS_BUCKETS=[['B','Kova B · Yakın ama farklı'],['C','Kova C · Türkçede yok']],KAO_PHONICS_AUDIO='assets/kao/audio/';
  function phonicsSource(){ var p=window.QuranPhonicsV1; return p&&Array.isArray(p.letters)&&Array.isArray(p.pairs)?p:null; }
  function phonicsLetter(id){ var p=phonicsSource(); return p&&p.letters.find(function(letter){ return letter.id===id; })||null; }
  function phonicsLemma(id){ var lex=window.QuranLexiconV1; return lex&&typeof lex.byId==='function'?lex.byId(id):null; }
  function phonicsLetterLatin(letter){ var p=phonicsSource(),dia=p&&p.translit&&p.translit.bwToDia||{}; return String(dia[letter&&letter.bw]||''); }
  function phonicsLetterHTML(letter){ var esc=quranLearnDeps.esc; return '<span class="kao-ph-letter"><span lang="ar" dir="rtl">'+esc(letter.ar)+'</span><small>'+esc(phonicsLetterLatin(letter))+'</small></span>'; }
  function kaoMahrecSchemas(){
    var mod=window.QuranMahrecSchemasV1;
    return mod&&mod.schemas&&typeof mod.schemas==='object'?mod.schemas:{};
  }
  function phonicsSvgHTML(letter){
    var name=String(letter&&letter.svg||'').replace(/^.*\//,'').replace(/\.svg$/,''),schemas=kaoMahrecSchemas();
    return Object.prototype.hasOwnProperty.call(schemas,name)?'<span class="kao-mahrec">'+schemas[name]+'</span>':'';
  }
  function phonicsRoot(q){ q.phonics=objectOr(q.phonics,{}); q.phonics.misheard=objectOr(q.phonics.misheard,{}); return q.phonics; }
  function phonicsOrdered(list,seed,dueOf){ return list.slice().sort(function(a,b){ return dueOf(a)-dueOf(b)||seededRank(seed,a.id)-seededRank(seed,b.id); }); }
  function phonicsShuffle(list,seed){ return list.slice().sort(function(a,b){ return seededRank(seed,a.id)-seededRank(seed,b.id); }); }
  function phonicsWaqfTasks(seed,count){
    var shorts=window.QuranShortSurahsV1,words=shorts&&Array.isArray(shorts.words)?shorts.words:[],rule=(phonicsSource()&&phonicsSource().rules||[]).find(function(item){ return item.id==='r5_waqf'; });
    var marks=phonicsShuffle((shorts&&shorts.waqfMarks||[]).map(function(mark){ return Object.assign({id:mark.afterWordId},mark); }),seed+'|waqf');
    return marks.map(function(mark){
      var at=words.findIndex(function(word){ return word.id===mark.afterWordId; }),anchor=words[at];
      if(at<0) return null;
      var fragment=words.slice(Math.max(0,at-1),at+3).filter(function(word){ return word.surahId===anchor.surahId&&word.pronunciation; });
      if(fragment.length<3) return null;
      return {id:'ph:waqf:'+mark.afterWordId,kind:'waqf',cardKey:'p:waqf',audio:false,prompt:'Bu parçada vakıf (durak) işareti hangi iki kelimenin arasında?',words:fragment,
        choices:fragment.slice(0,-1).map(function(word,index){ return {id:word.id,text:(index+1)+'. ve '+(index+2)+'. kelimenin arası',correct:word.id===mark.afterWordId}; }),
        answerText:'Durak '+mark.mark+' işaretiyle '+(fragment.findIndex(function(word){ return word.id===mark.afterWordId; })+1)+'. kelimeden sonra: burada dur, cümle/anlam sınırı.'+(rule?' '+rule.tipTr:'')};
    }).filter(Boolean).slice(0,count);
  }
  function kaoPhonicsTasks(d,nowValue,options){
    var p=phonicsSource(),opts=options||{};
    if(!p) return [];
    var now=validDate(nowValue||new Date(),'now'),seed=String(opts.seed||now.toISOString().slice(0,10)),ph=objectOr(quranLearnRoot(d).phonics,{});
    var dueOf=function(key){ var card=ph[key]; return card&&card.due?Date.parse(card.due)||0:0; };
    if(opts.silent) return phonicsWaqfTasks(seed,2);
    var pairs=p.pairs.filter(function(pair){ return !opts.letterId||pair.a===opts.letterId||pair.b===opts.letterId; });
    pairs=phonicsOrdered(pairs.length?pairs:p.pairs,seed,function(pair){ return dueOf('p:'+pair.id); }).slice(0,3);
    var tasks=pairs.map(function(pair,index){
      var side=seededRank(seed+'|side',pair.id)%2?'b':'a',target=phonicsLetter(pair[side]),other=phonicsLetter(pair[side==='a'?'b':'a']),lemmaId=pair.exampleWords[side==='a'?0:1],style=index%2?'flowing':'measured';
      var clip=KAO_PHONICS_AUDIO+'w-'+lemmaId+'-'+style+'.m4a',base={cardKey:'p:'+pair.id,pairId:pair.id,audio:true,clips:[clip],targetLetter:target.id};
      if(index%2===0){
        var extra=phonicsShuffle(p.letters.filter(function(letter){ return (letter.bucket==='B'||letter.bucket==='C')&&letter.id!==pair.a&&letter.id!==pair.b; }),seed+'|extra|'+pair.id)[0];
        return Object.assign(base,{id:'ph:letter:'+pair.id,kind:'letter',prompt:'Hangi harfi duydun?',choices:phonicsShuffle([target,other,extra].filter(Boolean),seed+'|letter|'+pair.id).map(function(letter){ return {id:letter.id,letter:letter,correct:letter.id===target.id}; }),answerText:'Doğrusu: '+target.ar+' · '+phonicsLetterLatin(target)+' ('+target.mahrec+')'});
      }
      var lemmas=pair.exampleWords.map(phonicsLemma).filter(Boolean);
      return Object.assign(base,{id:'ph:word:'+pair.id,kind:'word',prompt:'Hangi kelimeyi duydun?',choices:phonicsShuffle(lemmas,seed+'|word|'+pair.id).map(function(lemma){ return {id:lemma.id,lemma:lemma,correct:lemma.id===lemmaId}; }),answerText:'Doğrusu: '+(phonicsLemma(lemmaId)||{}).translit});
    });
    var lemmas=phonicsShuffle((window.QuranLexiconV1&&window.QuranLexiconV1.lemmas||[]).filter(function(lemma){ return lemma.translit&&lemma.verified!==false; }),seed+'|lemma');
    [['medd',function(lemma){ return /[âîû]/.test(lemma.translit); },'Uzun ünlü (med) duydun mu?',['Evet, uzun ünlü var','Hayır, hepsi kısa']],['shadda',function(lemma){ return String(lemma.ar).indexOf('ّ')>=0; },'Şedde (ikizleşen ünsüz) duydun mu?',['Evet, şedde var','Hayır, şedde yok']]].forEach(function(spec,index){
      var want=seededRank(seed+'|'+spec[0],'want')%2===0,lemma=lemmas.slice(index*40).find(function(item){ return spec[1](item)===want; });
      if(lemma) tasks.push({id:'ph:'+spec[0]+':'+lemma.id,kind:spec[0],cardKey:'p:'+spec[0],audio:true,clips:[KAO_PHONICS_AUDIO+'w-'+lemma.id+'-measured.m4a'],prompt:spec[2],lemma:lemma,choices:[{id:'yes',text:spec[3][0],correct:want},{id:'no',text:spec[3][1],correct:!want}],answerText:'Kelime: '+lemma.translit+(want?' · '+spec[3][0].replace(/^Evet, /,''):' · '+spec[3][1].replace(/^Hayır, /,''))});
    });
    var shorts=window.QuranShortSurahsV1,words=shorts&&Array.isArray(shorts.words)?shorts.words:[],starts=phonicsShuffle(words.filter(function(word,index){ var run=words.slice(index,index+3); return run.length===3&&run.every(function(item){ return item.surahId===word.surahId&&item.ayah===word.ayah&&item.pronunciation; }); }),seed+'|order');
    if(starts.length){ var at=words.indexOf(starts[0]),run=words.slice(at,at+3); tasks.push({id:'ph:order:'+run[0].id,kind:'order',cardKey:'p:order',audio:true,clips:run.map(function(word){ return KAO_PHONICS_AUDIO+word.id+'.m4a'; }),prompt:'Dinle ve kelimeleri duyduğun sırayla diz',order:run.map(function(word){ return word.id; }),choices:phonicsShuffle(run,seed+'|chips').map(function(word){ return {id:word.id,word:word}; }),answerText:'Sıra: '+run.map(function(word){ return word.pronunciation; }).join(' · ')}); }
    return tasks.concat(phonicsWaqfTasks(seed,1));
  }
  function phonicsState(){ var ui=quranLearnDeps.ui(); ui.kaoPhonics=objectOr(ui.kaoPhonics,{phase:'home'}); return ui.kaoPhonics; }
  function phonicsGrade(task,correct){
    var q=ensureQuranLearn(quranLearnDeps.data()),ph=phonicsRoot(q),st=phonicsState(),now=new Date(),card=ph[task.cardKey];
    ph[task.cardKey]=kaoSchedule(card,kaoGrade(correct,now.getTime()-nonNegativeNumber(st.startedAt,now.getTime()),card&&card.reps),now);
    if(!correct&&task.targetLetter) ph.misheard[task.targetLetter]=Math.floor(nonNegativeNumber(ph.misheard[task.targetLetter],0))+1;
    // 10 §9: kova B/C algı doğruluğu (hedef harfin kovasına göre).
    var bucket=task.targetLetter&&(phonicsLetter(task.targetLetter)||{}).bucket; if(bucket==='B'||bucket==='C'){ ph.buckets=objectOr(ph.buckets,{}); var tally=Object.assign({n:0,ok:0},objectOr(ph.buckets[bucket],{})); tally.n+=1; if(correct) tally.ok+=1; ph.buckets[bucket]=tally; }
    st.correct=(st.correct||0)+(correct?1:0); st.feedback=(correct?'✓ Doğru. ':'✗ Bu sesi yakında tekrar dinleyeceğiz. ')+task.answerText;
    st.index=(st.index||0)+1; st.orderDraft=[]; st.startedAt=now.getTime(); if(st.index>=st.tasks.length) st.phase='done';
    kaoSave(); quranLearnDeps.render(); return true;
  }
  function phonicsGoSilent(){
    var st=phonicsState(),done=(st.tasks||[]).slice(0,st.index||0);
    st.silent=true; quranLearnDeps.ui().kaoAudioFailed=true;
    if(st.phase==='task'){ st.tasks=done.concat(kaoPhonicsTasks(quranLearnDeps.data(),new Date(),{silent:true}).filter(function(task){ return done.every(function(item){ return item.id!==task.id; }); })); if(st.index>=st.tasks.length) st.phase='done'; }
    quranLearnDeps.render(); return true;
  }
  function phonicsPlay(){
    var st=phonicsState(),task=(st.tasks||[])[st.index||0];
    if(!task||!task.audio||!quranLearnSurfaceDeps||typeof quranLearnSurfaceDeps.createAudio!=='function') return false;
    var failed=false,fail=function(){ if(failed) return; failed=true; st.feedback='Ses yüklenemedi; dinleme görevleri atlandı, görsel derslerle devam ediyoruz.'; phonicsGoSilent(); };
    var playAt=function(index){
      if(index>=task.clips.length||failed) return;
      var audio=quranLearnSurfaceDeps.createAudio(task.clips[index]); if(!audio){ fail(); return; }
      audio.preload='none';
      if(typeof audio.addEventListener==='function'){ audio.addEventListener('error',fail,{once:true}); audio.addEventListener('ended',function(){ playAt(index+1); },{once:true}); }
      try{ var result=audio.play(); if(result&&typeof result.catch==='function') result.catch(fail); }catch(_error){ fail(); }
    };
    playAt(0); return true;
  }
  function kaoPhonics(action,value){
    if(!quranLearnDeps) return false;
    var st=phonicsState(),task=(st.tasks||[])[st.index||0];
    if(action==='start'||action==='home'||action==='lesson'){ kaoShadowCleanup(); quranLearnDeps.ui().kaoShadowNote=''; }
    if(action==='start'){ var silent=!!st.silent||!!quranLearnDeps.ui().kaoAudioFailed; Object.assign(st,{phase:'task',silent:silent,tasks:kaoPhonicsTasks(quranLearnDeps.data(),new Date(),{letterId:st.letterId,silent:silent}),index:0,correct:0,feedback:'',orderDraft:[],startedAt:Date.now()}); if(!st.tasks.length) st.phase='done'; quranLearnDeps.render(); return true; }
    if(action==='silent') return phonicsGoSilent();
    if(action==='play') return phonicsPlay();
    if(action==='home'){ st.phase='home'; quranLearnDeps.render(); return true; }
    if(action==='lesson'){ if(!phonicsLetter(value)) return false; st.phase='lesson'; st.lessonId=value; quranLearnDeps.render(); return true; }
    if(action!=='answer'||st.phase!=='task'||!task) return false;
    var choice=task.choices.find(function(item){ return item.id===value; });
    if(!choice) return false;
    if(task.kind!=='order') return phonicsGrade(task,!!choice.correct);
    st.orderDraft=Array.isArray(st.orderDraft)?st.orderDraft:[];
    if(st.orderDraft.indexOf(choice.id)>=0) return false;
    st.orderDraft.push(choice.id);
    if(st.orderDraft.length<task.order.length){ quranLearnDeps.render(); return true; }
    return phonicsGrade(task,st.orderDraft.join('|')===task.order.join('|'));
  }
  function kaoPhonicsAttention(d,limit){
    var q=quranLearnRoot(d),misheard=objectOr(objectOr(q.phonics,{}).misheard,{}),cards=objectOr(q.cards,{}),lex=window.QuranLexiconV1,lemmas=lex&&Array.isArray(lex.lemmas)?lex.lemmas:[];
    var known=function(lemma){ return ['ar>tr','tr>ar'].some(function(direction){ var card=cards['w:'+lemma.id+':'+direction]; return card&&card.orphan!==true&&nonNegativeNumber(card.reps,0)>0; }); };
    return Object.keys(misheard).map(phonicsLetter).filter(function(letter){ return letter&&misheard[letter.id]>0; }).sort(function(a,b){ return misheard[b.id]-misheard[a.id]||a.id.localeCompare(b.id); }).map(function(letter){
      var words=lemmas.filter(function(lemma){ return lemma.translit&&String(lemma.ar).indexOf(letter.ar)>=0; }).sort(function(a,b){ return (known(b)?1:0)-(known(a)?1:0)||b.freq-a.freq; }).slice(0,limit||5);
      return {letter:letter,count:misheard[letter.id],words:words};
    });
  }
  function kaoPhonicsHTML(){
    if(!quranLearnDeps) return '';
    var st=phonicsState(),esc=quranLearnDeps.esc,icon=quranLearnDeps.icon,p=phonicsSource(),ui=quranLearnDeps.ui();
    var h='<main class="kao-phonics" aria-labelledby="kao-phonics-title"><div class="kao-view-head"><div><p class="kao-eyebrow">Telaffuz stüdyosu</p><h2 id="kao-phonics-title">Önce duy, sonra ayırt et</h2></div><button type="button" class="kao-back" onclick="'+(st.phase==='home'?'App.kaoSetView(\'home\')':'App.kaoPhonics(\'home\')')+'">Geri</button></div>';
    if(!p) return h+'<span class="kao-content-error" role="alert">Fonetik içerik bulunamadı.</span></main>';
    if(st.silent||ui.kaoAudioFailed) h+='<p class="kao-gate-deferred" role="status">'+icon('pause-circle',15)+' Ses yüklenemedi ya da sessiz çalışıyorsun: dinleme görevleri atlanır, görsel dersler ve vakıf görevi sürer.</p>';
    if(st.phase==='lesson'){
      var letter=phonicsLetter(st.lessonId),partners=p.pairs.filter(function(pair){ return pair.a===letter.id||pair.b===letter.id; });
      h+='<section class="kao-ph-lesson">'+phonicsSvgHTML(letter)+'<div>'+phonicsLetterHTML(letter)+'<p><strong>Mahreç:</strong> '+esc(letter.mahrec)+'</p><p>'+esc(letter.tipTr)+'</p></div></section>';
      partners.forEach(function(pair){ var other=phonicsLetter(pair.a===letter.id?pair.b:pair.a); h+='<section class="kao-ph-pair"><h3>Karıştırılan çift: '+esc(letter.ar)+' / '+esc(other.ar)+'</h3>'+pair.exampleWords.map(phonicsLemma).filter(Boolean).map(function(lemma){ return '<div class="kao-ph-example">'+kaoArabicPairHTML(lemma.ar,lemma.translit,'kao-ph-pairword')+(st.silent||ui.kaoAudioFailed?'':'<button type="button" class="kao-audio" aria-label="'+esc(lemma.translit)+' kelimesini dinle" onclick="App.kaoPlay(\'w-'+esc(lemma.id)+'\',\''+kaoAudioStyle()+'\')">'+icon('headphones',16)+' Dinle</button>')+'</div>'+(st.silent||ui.kaoAudioFailed?'':kaoShadowHTML('w-'+lemma.id)); }).join('')+'</section>'; });
      return h+(ui.kaoShadowNote?'<p class="kao-live" aria-live="polite">'+esc(ui.kaoShadowNote)+'</p>':'')+'<button type="button" class="kao-primary" onclick="App.kaoPhonics(\'start\')">Bu harfle çalış</button></main>';
    }
    if(st.phase==='task'){
      var task=st.tasks[st.index||0],draft=Array.isArray(st.orderDraft)?st.orderDraft:[];
      h+='<section id="kao-phonics-task" class="kao-task"><div class="kao-task-top"><span>'+esc(task.prompt)+'</span><span>'+((st.index||0)+1)+' / '+st.tasks.length+'</span></div>';
      if(task.audio) h+='<button type="button" class="kao-audio" onclick="App.kaoPhonics(\'play\')">'+icon('headphones',17)+' Sesi dinle</button>';
      if(task.kind==='waqf') h+='<ol class="kao-ph-fragment">'+task.words.map(function(word){ return '<li>'+kaoArabicPairHTML(word.ar,word.pronunciation,'kao-ph-pairword')+'</li>'; }).join('')+'</ol>';
      if(task.kind==='order') h+='<div class="kao-order-target" aria-label="Seçilen sıra">'+(draft.length?draft.map(function(id){ var chosen=task.choices.find(function(item){ return item.id===id; }); return '<span>'+kaoArabicPairHTML(chosen.word.ar,chosen.word.pronunciation,'kao-order-pair')+'</span>'; }).join(''):'<span class="kao-order-empty">İlk duyduğun kelimeyi seç</span>')+'</div>';
      h+='<div class="kao-choices">'+task.choices.map(function(choice){ var picked=draft.indexOf(choice.id)>=0,label=choice.letter?phonicsLetterHTML(choice.letter):(choice.lemma?kaoArabicPairHTML(choice.lemma.ar,choice.lemma.translit,'kao-choice-pair'):(choice.word?kaoArabicPairHTML(choice.word.ar,choice.word.pronunciation,'kao-choice-pair'):esc(choice.text))); return '<button type="button"'+(task.kind==='order'?' class="kao-chip" aria-pressed="'+(picked?'true':'false')+'"'+(picked?' disabled':''):'')+' onclick="App.kaoPhonics(\'answer\',\''+esc(choice.id)+'\')">'+label+'</button>'; }).join('')+'</div>';
      if(task.audio&&!st.silent) h+='<button type="button" class="kao-link-button" onclick="App.kaoPhonics(\'silent\')">Ses çalmıyor mu? Sessiz devam et</button>';
      return h+'<p class="kao-live" aria-live="polite">'+esc(st.feedback||'')+'</p></section></main>';
    }
    var attention=kaoPhonicsAttention(quranLearnDeps.data(),5);
    if(st.phase==='done') h+='<section class="kao-done"><h2>Stüdyo tamam: '+(st.correct||0)+' / '+(st.tasks||[]).length+' doğru</h2><p class="kao-live" aria-live="polite">'+esc(st.feedback||'')+'</p></section>';
    h+='<section class="kao-ph-intro"><p>Minimal çiftler, uzun ünlü, şedde, dinle-diz ve vakıf görevleri. Aynı kelimeyi yavaş ve doğal iki modelle duyarsın; ses yoksa görsel derslerle bitirirsin.</p><button type="button" class="kao-primary" onclick="App.kaoPhonics(\'start\')">'+(st.phase==='done'?'Yeniden çalış':'Stüdyoya başla')+'</button>'+(st.silent||ui.kaoAudioFailed?'':'<button type="button" class="kao-secondary" onclick="App.kaoPhonics(\'silent\')">Sessiz çalış (yalnız görsel)</button>')+'</section>';
    KAO_PHONICS_BUCKETS.forEach(function(bucket){ h+='<section class="kao-ph-bucket"><h3>'+esc(bucket[1])+'</h3><div class="kao-ph-letters">'+p.letters.filter(function(letter){ return letter.bucket===bucket[0]; }).map(function(letter){ return '<button type="button" aria-label="'+esc(phonicsLetterLatin(letter)+' harf dersi')+'" onclick="App.kaoPhonics(\'lesson\',\''+letter.id+'\')">'+phonicsLetterHTML(letter)+'</button>'; }).join('')+'</div></section>'; });
    var phs=objectOr(quranLearnRoot(quranLearnDeps.data()).phonics,{}),bk=objectOr(phs.buckets,{}),sf=objectOr(phs.self,{}),rate=function(r){ r=objectOr(r,{}); return r.n?'%'+Math.round(r.ok/r.n*100)+' ('+r.n+')':'— (0)'; };
    h+='<section class="kao-ph-report"><h3>Algı doğruluğu</h3><p>Kova B: '+rate(bk.B)+' · Kova C: '+rate(bk.C)+' · hedef ≥%85</p>'+(sf.n?'<p>Gölgeleme öz-değerlendirmen · Yakın: '+sf.near+' / '+sf.n+' (puan değil)</p>':'')+'</section>';
    if(attention.length) h+='<section class="kao-ph-attention"><h3>'+icon('triangle-alert',15)+' Dikkat listesi</h3>'+attention.map(function(item){ return '<div><p class="kao-cognate is-shift">'+icon('triangle-alert',14)+' dikkat · '+esc(item.letter.ar+' · '+phonicsLetterLatin(item.letter))+' '+item.count+' kez karıştı</p><ul>'+item.words.map(function(lemma){ return '<li><button type="button" onclick="App.kaoOpenWord(\''+esc(lemma.id)+'\')">'+kaoArabicPairHTML(lemma.ar,lemma.translit,'kao-ph-pairword')+'<span>'+esc(lemma.meanings[0]||'')+'</span></button></li>'; }).join('')+'</ul></div>'; }).join('')+'</section>';
    return h+'</main>';
  }
  // KAO-27 · Gölgeleme (D-10): kayıt yalnız bellekte (Blob URL ui'de), en çok 10 sn; data/depo/senkrona asla yazılmaz.
  var KAO_SHADOW_MAX_MS=10000;
  function kaoShadowEnabled(){ return kaoSettingsOf().shadowing===true; }
  function kaoShadowCleanup(){
    if(!quranLearnDeps) return false;
    var ui=quranLearnDeps.ui(),sh=ui.kaoShadow;
    if(!sh) return false;
    ui.kaoShadow=null;
    if(sh.timer&&quranLearnSurfaceDeps&&typeof quranLearnSurfaceDeps.clearTimer==='function') quranLearnSurfaceDeps.clearTimer(sh.timer);
    try{ if(sh.recorder&&sh.recorder.state==='recording') sh.recorder.stop(); }catch(_error){}
    if(sh.stream&&typeof sh.stream.getTracks==='function') sh.stream.getTracks().forEach(function(track){ track.stop(); });
    if(sh.url&&window.URL&&typeof window.URL.revokeObjectURL==='function') window.URL.revokeObjectURL(sh.url);
    return true;
  }
  function kaoShadowPlay(src,times,done){
    var left=times,next=function(){
      if(left<=0){ done(true); return; }
      left-=1;
      var audio=quranLearnSurfaceDeps.createAudio(src),failed=false,fail=function(){ if(failed) return; failed=true; done(false); };
      if(!audio){ fail(); return; }
      audio.preload='none';
      if(typeof audio.addEventListener==='function'){ audio.addEventListener('error',fail,{once:true}); audio.addEventListener('ended',next,{once:true}); }
      try{ var result=audio.play(); if(result&&typeof result.catch==='function') result.catch(fail); }catch(_error){ fail(); }
    };
    next();
  }
  function kaoShadowRecord(sh){
    var ui=quranLearnDeps.ui(),nav=window.navigator,Recorder=window.MediaRecorder,BlobCtor=window.Blob,urlApi=window.URL;
    if(!nav||!nav.mediaDevices||typeof nav.mediaDevices.getUserMedia!=='function'||typeof Recorder!=='function'||typeof BlobCtor!=='function'||!urlApi||typeof urlApi.createObjectURL!=='function'){ sh.phase='unsupported'; quranLearnDeps.render(); return false; }
    sh.phase='asking'; quranLearnDeps.render();
    nav.mediaDevices.getUserMedia({audio:true}).then(function(stream){
      if(ui.kaoShadow!==sh){ stream.getTracks().forEach(function(track){ track.stop(); }); return; }
      var recorder=new Recorder(stream),chunks=[];
      sh.stream=stream; sh.recorder=recorder;
      recorder.addEventListener('dataavailable',function(event){ if(event&&event.data&&event.data.size!==0) chunks.push(event.data); });
      recorder.addEventListener('stop',function(){
        stream.getTracks().forEach(function(track){ track.stop(); });
        if(ui.kaoShadow!==sh) return;
        sh.url=urlApi.createObjectURL(new BlobCtor(chunks,{type:recorder.mimeType||'audio/mp4'})); chunks=[]; sh.phase='recorded'; sh.recorder=null; sh.stream=null; quranLearnDeps.render();
      });
      recorder.start(); sh.phase='recording';
      sh.timer=quranLearnSurfaceDeps.setTimer(function(){ kaoRecordStop(); },KAO_SHADOW_MAX_MS);
      quranLearnDeps.render();
    }).catch(function(){ if(ui.kaoShadow!==sh) return; sh.phase='denied'; quranLearnDeps.render(); });
    return true;
  }
  function kaoRecordStart(clipId){
    if(!quranLearnDeps||!quranLearnSurfaceDeps||!kaoShadowEnabled()||!safeClipId(clipId)||typeof quranLearnSurfaceDeps.createAudio!=='function'||typeof quranLearnSurfaceDeps.setTimer!=='function') return false;
    kaoShadowCleanup();
    var ui=quranLearnDeps.ui(),sh={clipId:clipId,phase:'model',modelFailed:false,verdict:''};
    ui.kaoShadow=sh; quranLearnDeps.render();
    kaoShadowPlay(KAO_PHONICS_AUDIO+clipId+'-'+kaoAudioStyle()+'.m4a',2,function(ok){ if(ui.kaoShadow!==sh) return; sh.modelFailed=!ok; kaoShadowRecord(sh); });
    return true;
  }
  function kaoRecordStop(){
    if(!quranLearnDeps) return false;
    var sh=quranLearnDeps.ui().kaoShadow;
    if(!sh||!sh.recorder||sh.phase!=='recording') return false;
    if(sh.timer&&typeof quranLearnSurfaceDeps.clearTimer==='function') quranLearnSurfaceDeps.clearTimer(sh.timer);
    sh.timer=null; sh.phase='stopping';
    try{ sh.recorder.stop(); }catch(_error){ kaoShadowCleanup(); quranLearnDeps.render(); return false; }
    return true;
  }
  function kaoRecordPlay(which){
    if(!quranLearnDeps||!quranLearnSurfaceDeps) return false;
    var sh=quranLearnDeps.ui().kaoShadow;
    if(!sh||sh.phase!=='recorded') return false;
    kaoShadowPlay(which==='model'?KAO_PHONICS_AUDIO+sh.clipId+'-'+kaoAudioStyle()+'.m4a':sh.url,1,function(){});
    return true;
  }
  function kaoRecordDiscard(verdict){
    if(!quranLearnDeps) return false;
    var ui=quranLearnDeps.ui(),sh=ui.kaoShadow,clipId=sh&&sh.clipId;
    if(!sh) return false;
    var compared=sh.phase==='recorded';
    kaoShadowCleanup(); if(compared) kaoShadowVerdict(verdict);
    if(verdict==='again') return kaoRecordStart(clipId);
    if(verdict==='near') ui.kaoShadowNote='Yakın ✓ Kaydın silindi; istersen başka bir kelimeyle gölgele.';
    else ui.kaoShadowNote='Kaydın silindi.';
    quranLearnDeps.render(); return true;
  }
  // KAO-21: İlham & İbadet hub kartının görünürlüğü; gizliyken uygulama Ayarları'ndaki "Gizlenen kartlar" geri getirir.
  function kaoToggleVisible(){
    var wasHidden=false,done=kaoCommitSetting(function(q){ wasHidden=q.settings.kaoVisible===false; q.settings.kaoVisible=wasHidden; });
    // Arapça sekmesinde geri getirme kartı ders girişiyle yer değiştirir: klavye/ekran okuyucu odağı kaybolmasın.
    if(done&&wasHidden&&quranLearnSurfaceDeps&&quranLearnDeps.ui().faithTab==='arapca') quranLearnSurfaceDeps.restoreFocus('kao-hub-entry');
    return done;
  }
  function kaoToggleShadowing(){ var result=kaoCommitSetting(function(q){ q.settings.shadowing=q.settings.shadowing!==true; }); if(!kaoShadowEnabled()) kaoShadowCleanup(); return result; }
  // 10 §9: gölgeleme öz-değerlendirmesi yalnız sayı olarak tutulur ("Yakın" oranı raporlanır, puanlanmaz); kayıt asla kalıcı değil.
  function kaoShadowVerdict(verdict){ var ph=phonicsRoot(ensureQuranLearn(quranLearnDeps.data())),self=Object.assign({near:0,n:0},objectOr(ph.self,{})); self.n+=1; if(verdict==='near') self.near+=1; ph.self=self; kaoSave(); }
  function kaoShadowHTML(clipId){
    if(!quranLearnDeps) return '';
    var ui=quranLearnDeps.ui(),sh=ui.kaoShadow,esc=quranLearnDeps.esc;
    if(!kaoShadowEnabled()) return '<p class="kao-setting-hint">Gölgeleme kapalı. Açmak için <button type="button" class="kao-link-button" onclick="App.kaoSetView(\'settings\')">Ayarlar</button>.</p>';
    if(!sh||sh.clipId!==clipId) return '<button type="button" class="kao-secondary" onclick="App.kaoRecordStart(\''+esc(clipId)+'\')">'+quranLearnDeps.icon('mic',16)+' Gölgele: dinle, tekrar et, kendini dinle</button>';
    var messages={model:'Model iki kez çalıyor; dikkatle dinle.',asking:'Mikrofon izni isteniyor. Kayıt yalnız bu ekranda, bellekte tutulur.',recording:'Kaydediyorsun (en çok 10 saniye).',stopping:'Kayıt hazırlanıyor…',recorded:'Kendi sesini modelle karşılaştır; puan yok, yalnız sen karar verirsin.',denied:'Mikrofon izni verilmedi. Gölgeleme olmadan devam edebilirsin.',unsupported:'Bu cihaz ya da tarayıcı ses kaydını desteklemiyor.'};
    var h='<section class="kao-shadow" aria-live="polite"><p>'+esc(messages[sh.phase]||'')+(sh.modelFailed?' Model sesi yüklenemedi.':'')+'</p>';
    if(sh.phase==='recording') h+='<button type="button" class="kao-primary" onclick="App.kaoRecordStop()">Kaydı bitir</button>';
    if(sh.phase==='recorded') h+='<div class="kao-setting-row"><button type="button" class="kao-secondary" onclick="App.kaoRecordPlay(\'self\')">Kendi kaydımı dinle</button><button type="button" class="kao-secondary" onclick="App.kaoRecordPlay(\'model\')">Modeli dinle</button></div><div class="kao-seg" role="group" aria-label="Öz değerlendirme"><button type="button" onclick="App.kaoRecordDiscard(\'near\')">Yakın</button><button type="button" onclick="App.kaoRecordDiscard(\'again\')">Tekrar</button></div>';
    return h+'<button type="button" class="kao-link-button" onclick="App.kaoRecordDiscard()">Kaydı sil ve kapat</button></section>';
  }
  // KAO-28 · E9 Anlayabildiğin âyet: kapsam token düzeyindedir (01-ARASTIRMA: QAC 77.430 token; 02 §5.1 ≥%95 eşiği).
  var KAO_QURAN_TOKENS=77430,KAO_AYAH_THRESHOLD=0.95,KAO_UNDERSTOOD_MAX=400;
  // 02 §3 (Y-1): kalıcı kart = review ∧ s≥21, yetim ya da okuyucu-bilinmeyen değil. Tek tanım; E3 sayacı da kullanır.
  function isSettled(card,minStability){
    card=card&&typeof card==='object'?card:{};
    return (card.state==='review'||card.st==='review')&&nonNegativeNumber(card.s,0)>=minStability&&card.orphan!==true&&card.readerUnknown!==true;
  }
  function isDurable(card){ return isSettled(card,21); }
  // Bilinen lemma = her iki yönde (ar>tr ve tr>ar) kalıcı kart. E1, hub, E9, panel ve CSV bu kümeyi kullanır.
  function kaoKnownLemmaSet(d){
    var cards=objectOr(quranLearnRoot(d).cards,{}),durable=Object.create(null),known=Object.create(null);
    Object.keys(cards).forEach(function(id){ var match=String(id).match(/^w:([^:]+):(ar>tr|tr>ar)$/); if(match&&isDurable(cards[id])) (durable[match[1]]=durable[match[1]]||{})[match[2]]=1; });
    Object.keys(durable).forEach(function(lemmaId){ if(durable[lemmaId]['ar>tr']&&durable[lemmaId]['tr>ar']) known[lemmaId]=1; });
    return known;
  }
  function kaoCoverage(d,words){
    var known=kaoKnownLemmaSet(d);
    if(Array.isArray(words)){ var hit=words.filter(function(word){ return known[word&&word.lemmaId]; }).length; return {known:hit,total:words.length,ratio:words.length?hit/words.length:0}; }
    var lex=window.QuranLexiconV1,tokens=(lex&&Array.isArray(lex.lemmas)?lex.lemmas:[]).reduce(function(sum,lemma){ return sum+(known[lemma.id]?nonNegativeNumber(lemma.freq,0):0); },0);
    return {known:tokens,total:KAO_QURAN_TOKENS,ratio:Math.min(1,tokens/KAO_QURAN_TOKENS)};
  }
  function kaoAyahGroups(){
    var shorts=window.QuranShortSurahsV1,groups=Object.create(null),order=[];
    (shorts&&Array.isArray(shorts.words)?shorts.words:[]).forEach(function(word){ var key=word.surahId+':'+word.ayah; if(!groups[key]){ groups[key]=[]; order.push(key); } groups[key].push(word); });
    return order.map(function(key){ var words=groups[key].slice().sort(function(a,b){ return a.i-b.i; }); return {key:key,surahId:words[0].surahId,ayah:words[0].ayah,words:words}; }).filter(function(group){ return group.words.every(function(word){ return word.pronunciation&&word.tr; }); });
  }
  function kaoPickAyah(d,dateSeed){
    var understood=objectOr(quranLearnRoot(d).ayahs,{}).understood,seen=Object.create(null),seed=String(dateSeed||'');
    (Array.isArray(understood)?understood:[]).forEach(function(key){ seen[key]=1; });
    var ready=kaoAyahGroups().map(function(group){ return Object.assign({coverage:kaoCoverage(d,group.words)},group); }).filter(function(group){ return group.coverage.ratio>=KAO_AYAH_THRESHOLD; });
    ready.sort(function(a,b){ return (seen[a.key]?1:0)-(seen[b.key]?1:0)||seededRank(seed,a.key)-seededRank(seed,b.key); });
    return ready[0]||null;
  }
  // 02 §5.10 haftalık aktarım testi: son testten ≥7 gün; görülmemiş (anlaşıldı / test edilmiş / parça kartıyla eğitilmiş değil) ≥%95 âyet.
  function kaoTransferCandidate(d,nowValue){ var now=validDate(nowValue,'now'),q=quranLearnRoot(d),t=objectOr(q.transfer,{}),last=new Date(t.lastAt||0),skip=Object.create(null),seed='transfer|'+daySeed(now); if(t.lastAt&&isFinite(last.getTime())&&now.getTime()-last.getTime()<7*DAY_MS) return null; [].concat(objectOr(q.ayahs,{}).understood||[],Array.isArray(t.seen)?t.seen:[]).forEach(function(key){ skip[key]=1; }); Object.keys(objectOr(q.cards,{})).forEach(function(id){ var m=/^s:(\d+):(\d+):/.exec(id); if(m) skip[m[1]+':'+m[2]]=1; }); return kaoAyahGroups().filter(function(group){ return !skip[group.key]; }).map(function(group){ return Object.assign({coverage:kaoCoverage(d,group.words)},group); }).filter(function(group){ return group.coverage.ratio>=KAO_AYAH_THRESHOLD; }).sort(function(a,b){ return seededRank(seed,a.key)-seededRank(seed,b.key); })[0]||null; }
  // Doğru cevap: âyetin doğrulanmış kelime kelime Türkçesi; çeldiriciler uzunluğu en yakın başka âyetlerin çevirileri.
  function kaoBuildTransferTask(queueItem,opts){ var key=String(queueItem.cardId||'').slice(2),groups=kaoAyahGroups(),group=groups.find(function(g){ return g.key===key; }); if(!group) return null; var gloss=function(g){ return g.words.map(function(word){ return word.tr; }).join(' '); },seed=String(opts.seed||'')+'|transfer|'+key,answer=gloss(group),used=[answer],picked=[]; groups.filter(function(g){ return g.key!==key; }).sort(function(a,b){ return Math.abs(a.words.length-group.words.length)-Math.abs(b.words.length-group.words.length)||seededRank(seed,a.key)-seededRank(seed,b.key); }).some(function(g){ var label=gloss(g); if(used.indexOf(label)>=0) return false; used.push(label); picked.push({cardId:'t:'+g.key,label:label,correct:false}); return picked.length>=3; }); var choices=[{cardId:'t:'+key,label:answer,correct:true}].concat(picked).sort(function(a,b){ return seededRank(seed+'|order',a.cardId)-seededRank(seed+'|order',b.cardId); }); choices.forEach(function(choice,index){ choice.choiceId=String(queueItem.id)+':choice:'+index; }); return {id:String(queueItem.id),cardId:'t:'+key,type:'transfer',kind:'transfer',key:key,isNew:false,retry:false,prompt:'Bu âyetin kelime kelime çevirisini seç',answer:answer,ar:group.words.map(function(word){ return word.ar; }).join(' '),pronunciation:group.words.map(function(word){ return word.pronunciation; }).join(' '),surah:kaoSurahName(group.surahId)+' · '+group.ayah+'. âyet',cognate:null,clipId:'',choices:choices}; }
  function kaoNearestAyah(d){
    return kaoAyahGroups().map(function(group){ return Object.assign({coverage:kaoCoverage(d,group.words)},group); }).sort(function(a,b){ return b.coverage.ratio-a.coverage.ratio||(a.words.length-a.coverage.known)-(b.words.length-b.coverage.known)||a.key.localeCompare(b.key); })[0]||null;
  }
  function kaoSurahName(surahId){ var surah=kaoSurahs().find(function(item){ return item.id===surahId; }); return surah?surah.name:String(surahId); }
  function kaoPlaySequence(srcs,onFail){
    if(!quranLearnSurfaceDeps||typeof quranLearnSurfaceDeps.createAudio!=='function'||!srcs.length) return false;
    var failed=false,fail=function(){ if(failed) return; failed=true; if(typeof onFail==='function') onFail(); };
    var playAt=function(index){
      if(index>=srcs.length||failed) return;
      var audio=quranLearnSurfaceDeps.createAudio(srcs[index]); if(!audio){ fail(); return; }
      audio.preload='none';
      if(typeof audio.addEventListener==='function'){ audio.addEventListener('error',fail,{once:true}); audio.addEventListener('ended',function(){ playAt(index+1); },{once:true}); }
      try{ var result=audio.play(); if(result&&typeof result.catch==='function') result.catch(fail); }catch(_error){ fail(); }
    };
    playAt(0); return true;
  }
  function kaoTodayAyah(){
    if(!quranLearnDeps) return null;
    // Günün âyeti gün boyunca sabittir: "Anladım" sonrası başka âyete atlamaz (seçim ui'de, kalıcı değil).
    var ui=quranLearnDeps.ui(),d=quranLearnDeps.data(),today=quranLearnDeps.todayStr(),cached=ui.kaoAyahToday,group=cached&&cached.date===today&&kaoAyahGroups().find(function(item){ return item.key===cached.key; });
    if(group){ var coverage=kaoCoverage(d,group.words); if(coverage.ratio>=KAO_AYAH_THRESHOLD) return Object.assign({coverage:coverage},group); }
    var pick=kaoPickAyah(d,today); ui.kaoAyahToday=pick?{date:today,key:pick.key}:null; return pick;
  }
  function kaoOpenAyah(){
    if(!quranLearnDeps) return false;
    var ui=quranLearnDeps.ui(); ui.kaoAyahNote='';
    if(!ui.kaoOpen) return kaoOpen('ayah');
    kaoShadowCleanup(); return kaoNav('ayah');
  }
  function kaoAyah(action,value){
    if(!quranLearnDeps) return false;
    var ui=quranLearnDeps.ui(),pick=kaoTodayAyah();
    if(!pick) return false;
    if(action==='play'){
      var words=value==='all'?pick.words:[pick.words[Math.floor(Number(value))]].filter(Boolean);
      return kaoPlaySequence(words.map(function(word){ return KAO_PHONICS_AUDIO+word.id+'.m4a'; }),function(){ ui.kaoAudioFailed=true; ui.kaoAyahNote='Ses yüklenemedi; âyeti okunuş ve Türkçe anlamla sürdürebilirsin.'; quranLearnDeps.render(); });
    }
    if(action!=='understood') return false;
    var q=ensureQuranLearn(quranLearnDeps.data()),list=q.ayahs.understood.filter(function(key){ return key!==pick.key; });
    list.push(pick.key); q.ayahs.understood=list.slice(-KAO_UNDERSTOOD_MAX);
    ui.kaoAyahNote='Anladım olarak kaydedildi · toplam '+q.ayahs.understood.length+' âyet.';
    kaoSave(); quranLearnDeps.render(); return true;
  }
  function kaoAyahHTML(){
    if(!quranLearnDeps) return '';
    var ui=quranLearnDeps.ui(),esc=quranLearnDeps.esc,icon=quranLearnDeps.icon,d=quranLearnDeps.data(),pick=kaoTodayAyah(),q=ensureQuranLearn(d);
    var h='<main class="kao-ayah" aria-labelledby="kao-ayah-title"><div class="kao-view-head"><div><p class="kao-eyebrow">Bugün anlayabildiğin âyet</p><h2 id="kao-ayah-title">'+(pick?esc(kaoSurahName(pick.surahId))+' · '+pick.ayah+'. âyet':'Henüz hazır âyet yok')+'</h2><p class="kao-ayah-count">Anlaşılan âyet sayısı: <strong>'+(Array.isArray(q.ayahs&&q.ayahs.understood)?q.ayahs.understood.length:0)+'</strong></p></div><button type="button" class="kao-back" onclick="App.kaoSetView(\'home\')">Geri</button></div>';
    if(!pick){
      var near=kaoNearestAyah(d),missing=near?near.words.length-near.coverage.known:0;
      return h+'<section class="kao-ayah-empty"><p>Kelimelerinin en az %95’ini tanıdığın bir âyet açılınca burada görünecek.</p>'+(near?'<p>En yakın âyet: '+esc(kaoSurahName(near.surahId))+' '+near.ayah+' · %'+Math.floor(near.coverage.ratio*100)+' tanıdık, '+missing+' kelime kaldı.</p>':'')+'<button type="button" class="kao-primary" onclick="App.kaoStart()">Bugünkü oturuma başla</button></section></main>';
    }
    var done=q.ayahs.understood.indexOf(pick.key)>=0;
    h+='<p class="kao-ayah-coverage">'+icon('check-circle',15)+' Kelimelerin %'+Math.floor(pick.coverage.ratio*100)+'’ini tanıyorsun ('+pick.coverage.known+' / '+pick.coverage.total+')</p>';
    h+='<ol class="kao-ayah-words">'+pick.words.map(function(word,index){ return '<li><button type="button" aria-label="'+esc(word.pronunciation+', '+word.tr+'; dinle')+'" onclick="App.kaoAyah(\'play\','+index+')">'+kaoArabicPairHTML(word.ar,word.pronunciation,'kao-ayah-pair')+'<span class="kao-ayah-tr">'+esc(word.tr)+'</span></button></li>'; }).join('')+'</ol>';
    h+='<button type="button" class="kao-audio" onclick="App.kaoAyah(\'play\',\'all\')">'+icon('headphones',17)+' Âyeti kelime kelime dinle</button>';
    h+='<p class="kao-live" aria-live="polite">'+esc(ui.kaoAyahNote||'')+'</p><button type="button" class="kao-primary"'+(done?' aria-pressed="true"':'')+' onclick="App.kaoAyah(\'understood\')">'+(done?'Anladın ✓':'Anladım')+'</button></main>';
    return h;
  }
  // KAO-28b · E10 Mushaf ısı haritası (R-B1): 114 sûre × anlaşılan âyet oranı; gecikmeli testi ≥4/5 geçen sûre koyu (R-C6).
  function kaoSurahMap(d){
    var catalog=window.QuranRevelationOrderV1,q=quranLearnRoot(d),records=objectOr(q.surahs,{}),understood=objectOr(q.ayahs,{}).understood,perSurah=Object.create(null);
    (Array.isArray(understood)?understood:[]).forEach(function(key){ var match=String(key).match(/^(\d+):(\d+)$/); if(!match) return; perSurah[match[1]]=objectOr(perSurah[match[1]],{}); perSurah[match[1]][match[2]]=1; });
    return Array.from({length:114},function(_unused,index){
      var number=index+1,surah=catalog&&typeof catalog.byMushafOrder==='function'?catalog.byMushafOrder(number):null,total=surah?Math.max(1,Math.floor(nonNegativeNumber(surah.ayahCount,1))):1,record=objectOr(records[String(number)],{});
      var ayahs=Object.keys(objectOr(perSurah[String(number)],{})).filter(function(ayah){ return Number(ayah)>=1&&Number(ayah)<=total; }).length,confirmed=nonNegativeNumber(record.delayedScore,0)>=4&&!!record.confirmedAt;
      var percent=confirmed?100:Math.min(100,Math.floor(ayahs/total*100)),hasData=ayahs>0||!!record.understoodAt;
      var level=!hasData?0:(confirmed?5:(percent>=75?4:(percent>=50?3:(percent>=25?2:1))));
      var status=confirmed?'gecikmeli test '+record.delayedScore+'/5 · kesinleşti':(record.needsReread?'gecikmeli test '+record.delayedScore+'/5 · tekrar oku':(record.delayedTestAt?'7 günlük test bekliyor':''));
      return {number:number,name:surah?String(surah.nameTr):String(number),total:total,ayahs:ayahs,percent:percent,hasData:hasData,confirmed:confirmed,level:level,status:status};
    });
  }
  function kaoOpenMap(){
    if(!quranLearnDeps) return false;
    var ui=quranLearnDeps.ui();
    if(!ui.kaoOpen) return kaoOpen('map');
    kaoShadowCleanup(); return kaoNav('map');
  }
  // KAO2-24: harita gövdesi ayrıldı; İlerleme bölümü olarak yeniden kullanılır.
  function kaoSurahMapHTML(cells,q){
    if(!quranLearnDeps) return '';
    var esc=quranLearnDeps.esc,readable=Object.create(null),withData=cells.filter(function(cell){ return cell.hasData; });
    kaoSurahs().forEach(function(item){ readable[item.id]=1; });
    var h='<div class="kao-map"><p class="kao-map-note">Renk ve yüzde, o sûrede “anladım” dediğin âyetlerin oranıdır; kilit yok. Koyu hücre: 7 gün sonraki testte 4/5 ve üstü.</p>';
    h+='<div class="kao-map-grid" role="list" aria-label="114 sûrelik anlama haritası">'+cells.map(function(cell){
      var label=cell.name+': %'+cell.percent+' anlaşıldı',inner='<small>'+cell.number+'</small><b>'+(cell.hasData?'%'+cell.percent:'')+'</b>',attrs=' class="kao-map-cell" data-l="'+cell.level+'" aria-label="'+esc(label)+'" title="'+esc(label+(cell.status?' · '+cell.status:''))+'"';
      return '<span role="listitem">'+(readable[cell.number]?'<button type="button"'+attrs+' onclick="App.kaoOpenSurah('+cell.number+')">'+inner+'</button>':'<span'+attrs+' role="img">'+inner+'</span>')+'</span>';
    }).join('')+'</div>';
    h+='<div class="kao-map-legend" aria-hidden="true"><span>Veri yok</span><i data-l="0"></i><i data-l="1"></i><i data-l="2"></i><i data-l="3"></i><i data-l="4"></i><i data-l="5"></i><span>Kesinleşti</span></div>';
    h+='<section class="kao-map-list"><h3>Metin listesi</h3>'+(withData.length?'<ol>'+withData.map(function(cell){ return '<li value="'+cell.number+'">'+esc(cell.name)+' — %'+cell.percent+' anlaşıldı ('+cell.ayahs+' / '+cell.total+' âyet)'+(cell.status?' · '+esc(cell.status):'')+'</li>'; }).join('')+'</ol>':'<p>Henüz hiçbir sûrede anlaşılan âyet kaydı yok.</p>')+'<p>'+(114-withData.length)+' sûrede henüz veri yok.</p></section></div>';
    return h;
  }
  function kaoMapHTML(){ return quranLearnDeps?kaoSurahMapHTML(kaoSurahMap(quranLearnDeps.data()),quranLearnRoot(quranLearnDeps.data())):''; }
  // KAO-16b · E11 Namazda ne diyorum (R-B2): rekât sırası; bilinen kelime açık, bilinmeyen kapalı; dokunmak yarının kuyruğuna alır.
  function kaoPrayerTexts(){ var shorts=window.QuranShortSurahsV1; return shorts&&Array.isArray(shorts.prayerTexts)?shorts.prayerTexts:[]; }
  function kaoPrayerStats(d){
    var known=kaoKnownLemmaSet(d),open=0,total=0;
    kaoPrayerTexts().forEach(function(text){ text.words.forEach(function(word){ total+=1; if(known[word.lemmaId]) open+=1; }); });
    return {open:open,total:total,ratio:total?open/total:0};
  }
  function kaoLevel1Ready(d){
    var lex=window.QuranLexiconV1,lemmas=lex&&Array.isArray(lex.lemmas)?lex.lemmas:[],cards=objectOr(quranLearnRoot(d).cards,{}),end=Math.floor(3*lemmas.length/12);
    return end>0&&lemmas.slice(0,end).every(function(lemma){ return ['ar>tr','tr>ar'].some(function(direction){ var card=cards['w:'+lemma.id+':'+direction]; return card&&card.orphan!==true&&(card.state==='review'||card.st==='review'); }); });
  }
  function kaoOpenPrayer(){
    if(!quranLearnDeps) return false;
    var ui=quranLearnDeps.ui(); ui.kaoPrayerNote='';
    if(!ui.kaoOpen) return kaoOpen('prayer');
    kaoShadowCleanup(); return kaoNav('prayer');
  }
  function kaoPrayerWord(lineIndex,wordIndex){
    if(!quranLearnDeps) return false;
    var text=kaoPrayerTexts()[Math.floor(Number(lineIndex))],word=text&&text.words[Math.floor(Number(wordIndex))];
    if(!word||!word.pronunciation||!currentCardId('w:'+word.lemmaId+':ar>tr')) return false;
    var d=quranLearnDeps.data(),ui=quranLearnDeps.ui();
    if(kaoKnownLemmaSet(d)[word.lemmaId]){ var lex=window.QuranLexiconV1; if(lex&&typeof lex.byId==='function'&&lex.byId(word.lemmaId)) return kaoOpenWord(word.lemmaId); return false; }
    var q=ensureQuranLearn(d),cardId='w:'+word.lemmaId+':ar>tr',card=objectOr(q.cards[cardId],{}),now=new Date();
    ui.kaoPrayerRevealed=objectOr(ui.kaoPrayerRevealed,{}); ui.kaoPrayerRevealed[text.id+':'+wordIndex]=1;
    q.cards[cardId]=card;
    if(!nonNegativeNumber(card.reps,0)){ card.state='learning'; card.reps=1; card.s=0; card.d=0; card.r=now.toISOString(); card.due=addDays(now,1).toISOString(); card.introducedAt=now.toISOString(); card.tomorrowReason='prayer_unknown'; card.readerUnknown=true; }
    ui.kaoPrayerNote='“'+word.tr+'” yarınki tekrarına eklendi.';
    kaoSave(); quranLearnDeps.render(); return true;
  }
  function kaoPrayerHTML(){
    if(!quranLearnDeps) return '';
    var d=quranLearnDeps.data(),ui=quranLearnDeps.ui(),esc=quranLearnDeps.esc,known=kaoKnownLemmaSet(d),stats=kaoPrayerStats(d),revealed=objectOr(ui.kaoPrayerRevealed,{}),texts=kaoPrayerTexts();
    var h='<main class="kao-prayer" aria-labelledby="kao-prayer-title"><div class="kao-view-head"><div><p class="kao-eyebrow">Seviye 1 · Namazda ne diyorum</p><h2 id="kao-prayer-title">Bir rekâtta söylediklerin</h2><p>Tanıdığın kelimelerin anlamı açık; kapalı olana dokun, anlamını gör ve yarınki tekrarına eklensin.</p></div><button type="button" class="kao-back" onclick="App.kaoSetView(\'home\')">Geri</button></div>';
    if(!texts.length) return h+'<span class="kao-content-error" role="alert">Namaz metinleri bulunamadı.</span></main>';
    h+='<div class="kao-progress" role="progressbar" aria-label="Namaz metinlerinde açık kelime oranı" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+Math.floor(stats.ratio*100)+'"><span style="width:'+Math.floor(stats.ratio*100)+'%"></span></div><p class="kao-prayer-ratio">'+stats.open+' / '+stats.total+' kelime açık · %'+Math.floor(stats.ratio*100)+'</p>';
    texts.forEach(function(text,lineIndex){
      var open=text.words.filter(function(word){ return known[word.lemmaId]; }).length;
      h+='<section class="kao-prayer-line" aria-labelledby="kao-prayer-'+esc(text.id)+'"><div class="kao-section-head"><h3 id="kao-prayer-'+esc(text.id)+'"><span>'+(lineIndex+1)+'</span> '+esc(text.title)+'</h3><small>'+open+' / '+text.words.length+' açık</small></div><div class="kao-prayer-words">'+text.words.map(function(word,wordIndex){
        var isOpen=!!known[word.lemmaId],shown=isOpen||!!revealed[text.id+':'+wordIndex];
        return '<button type="button" class="kao-prayer-word '+(isOpen?'is-known':(shown?'is-revealed':'is-closed'))+'" aria-label="'+esc(word.pronunciation+(shown?', '+word.tr:', anlamı kapalı; dokununca açılır ve tekrara eklenir'))+'" onclick="App.kaoPrayerWord('+lineIndex+','+wordIndex+')">'+kaoArabicPairHTML(word.ar,word.pronunciation,'kao-prayer-pair')+'<span class="kao-prayer-tr">'+(shown?esc(word.tr):'•••')+'</span></button>';
      }).join('')+'</div></section>';
    });
    return h+'<p class="kao-live" aria-live="polite">'+esc(ui.kaoPrayerNote||'')+'</p></main>';
  }
  // KAO-19 · Panel aynası özeti (R-C1/R-C8): yalnız sayısal alanlar + ses sınıfı adı; kelime düzeyi bilgi yok.
  // Panel sözlüğü yüklemediği için kapsam burada hesaplanır ve her kayıtta quranLearn.summary'ye yazılır.
  function kaoSoundClass(letterId){
    var lesson=kaoGateLessons().find(function(item){ return item.sounds.some(function(sound){ return sound.id===letterId; }); });
    return lesson?String(lesson.title).split(':')[0].trim():null;
  }
  function kaoStudyStreak(daily){
    var dates=Object.keys(objectOr(daily,{})).filter(function(date){ return /^\d{4}-\d{2}-\d{2}$/.test(date)&&nonNegativeNumber(daily[date]&&daily[date].answered,0)>0; }).sort();
    var last=dates.length?dates[dates.length-1]:null,streak=0,cursor=last,seen=Object.create(null);
    dates.forEach(function(date){ seen[date]=1; });
    while(cursor&&seen[cursor]){ streak+=1; cursor=addDays(new Date(cursor+'T12:00:00Z'),-1).toISOString().slice(0,10); }
    return {last:last,streak:streak};
  }
  function kaoPanelSummary(d){
    var q=quranLearnRoot(d),cards=objectOr(q.cards,{}),misheard=objectOr(objectOr(q.phonics,{}).misheard,{}),classes=Object.create(null),study=kaoStudyStreak(q.daily);
    Object.keys(misheard).forEach(function(letterId){ var name=kaoSoundClass(letterId),count=Math.floor(nonNegativeNumber(misheard[letterId],0)); if(name&&count>0) classes[name]=(classes[name]||0)+count; });
    var top=Object.keys(classes).sort(function(a,b){ return classes[b]-classes[a]||a.localeCompare(b); })[0]||null;
    // KAO2-16 · 07 §6: yeni taş anahtarları (besmele, u1…u12) yalnız sayısal olarak taşınır.
    var milestones=objectOr(q.milestones,{}),milestoneKeys=Object.keys(milestones).filter(function(key){ return !!milestones[key]; });
    // KAO2-25 · S-08 panel aynası: nerede kaldığı + taşlar. Yalnız kimlik/sayı; anlatı metni YOK.
    var unitId=null,lessonId=null,lessonsDone=0,flow=window.SeymaQuranLearnFlow,curriculum=window.QuranCurriculumV2,nowValue=new Date();
    try{
      if(flow&&typeof flow.unitProgress==='function'&&curriculum){
        var content=kaoLessonContent(),at=kaoCurrentUnit(q,flow,content);
        if(at&&at.unit){ unitId=Number(at.unit.id)||null; lessonsDone=Math.floor(nonNegativeNumber(at.progress&&at.progress.lessonsDone,0)); }
        if(typeof flow.nextStep==='function'){
          var step=flow.nextStep({quranLearn:q,night:kaoNightWindow(d,nowValue)},nowValue,content);
          if(step&&(step.kind==='daily'||step.kind==='next-unit')&&step.param) lessonId=String(step.param);
        }
      }
    }catch(_error){}
    return {v:1,start:nullableString(q.startedAt),unit:unitId,lesson:lessonId&&/^[a-z0-9._-]{1,32}$/.test(lessonId)?lessonId:null,lessonsDone:lessonsDone,milestones:milestoneKeys.sort().join(','),coveragePercent:Math.floor(kaoCoverage(d).ratio*100),knownWords:Object.keys(kaoKnownLemmaSet(d)).length,understoodAyahs:Array.isArray(objectOr(q.ayahs,{}).understood)?q.ayahs.understood.length:0,
      milestoneCount:milestoneKeys.length,unitMilestones:milestoneKeys.filter(function(key){ return /^u\d+$/.test(key); }).length,besmele:!!milestones.besmele,
      lastStudiedDate:study.last,streakDays:study.streak,topSoundClass:top,flaggedCount:Object.keys(cards).filter(function(id){ return cards[id]&&cards[id].flagged&&typeof cards[id].flagged==='object'; }).length,updatedAt:new Date().toISOString()};
  }
  function kaoSave(){
    if(!quranLearnDeps) return false;
    var d=quranLearnDeps.data(),q=ensureQuranLearn(d);
    q.summary=kaoPanelSummary(d);
    return quranLearnDeps.save();
  }
  // KAO-20 · E1 istatistik (R-A3 tutunma + kalibrasyon, R-A1 gece tekrarı): yalnız daily toplamlarından, ağsız.
  function kaoStats(d,nowValue){
    var daily=objectOr(quranLearnRoot(d).daily,{}),now=validDate(nowValue||new Date(),'now');
    var windowOf=function(days){
      var cutoff=addDays(now,-days).toISOString().slice(0,10),out={n:0,ok:0,pred:0,bands:Array.from({length:10},function(){ return {pred:0,ok:0,n:0}; }),nightRev:0,nightFollow:{n:0,ok:0},dayFollow:{n:0,ok:0}};
      Object.keys(daily).filter(function(date){ return /^\d{4}-\d{2}-\d{2}$/.test(date)&&date>cutoff; }).forEach(function(date){
        var day=objectOr(daily[date],{}),calib=objectOr(day.calib,{}),bands=Array.isArray(calib.bands)?calib.bands:[];
        bands.forEach(function(band,index){ if(index>9||!band) return; var target=out.bands[index]; target.n+=nonNegativeNumber(band.n,0); target.ok+=nonNegativeNumber(band.ok,0); target.pred+=nonNegativeNumber(band.pred,0); out.n+=nonNegativeNumber(band.n,0); out.ok+=nonNegativeNumber(band.ok,0); out.pred+=nonNegativeNumber(band.pred,0); });
        out.nightRev+=Math.floor(nonNegativeNumber(day.nightRev,0));
        ['nightFollow','dayFollow'].forEach(function(key){ var value=objectOr(day[key],{}); out[key].n+=nonNegativeNumber(value.n,0); out[key].ok+=nonNegativeNumber(value.ok,0); });
      });
      return out;
    };
    return {twoWeeks:windowOf(14),sixWeeks:windowOf(42)};
  }
  // KAO2-24 · S-12 birleşik İlerleme modeli (saf; ağ/DOM/zamanlayıcı yok).
  // Kapsam eğrisi 03 §1 tablosunun ÇALIŞMA ZAMANI eşidir: lexicon `freq` toplamı,
  // sıklık sırasına göre ilk N lemma. Sabit yüzde yazılmaz; eğriden yeniden hesaplanır.
  var KAO_COVERAGE_POINTS=[50,100,200,300,524], KAO_COVERAGE_MIN_WORDS=15, KAO_STONE_PREVIEW=4;
  function kaoTotalLemmas(){ var lex=window.QuranLexiconV1; return lex&&Array.isArray(lex.lemmas)?lex.lemmas.length:0; }
  function kaoFrequencyOrdered(){
    var lex=window.QuranLexiconV1,lemmas=lex&&Array.isArray(lex.lemmas)?lex.lemmas.slice():[];
    return lemmas.sort(function(a,b){ return nonNegativeNumber(b.freq,0)-nonNegativeNumber(a.freq,0)||String(a.id).localeCompare(String(b.id)); });
  }
  function kaoCoverageAt(n){
    var lemmas=kaoFrequencyOrdered().slice(0,Math.max(0,Math.floor(nonNegativeNumber(n,0))));
    var tokens=lemmas.reduce(function(sum,lemma){ return sum+nonNegativeNumber(lemma.freq,0); },0);
    return Math.min(100,tokens/KAO_QURAN_TOKENS*100);
  }
  function kaoCoverageCurve(){
    return KAO_COVERAGE_POINTS.map(function(n){ return {n:n,percent:round8(kaoCoverageAt(n))}; });
  }
  function kaoCoverageMilestones(knownCount){
    return [
      {n:50,percent:round8(kaoCoverageAt(50)),phrase:'İlk 50 kelime'},
      {n:100,percent:round8(kaoCoverageAt(100)),phrase:'İlk 100 kelime'},
      {n:200,percent:round8(kaoCoverageAt(200)),phrase:'İlk 200 kelime'}
    ].map(function(point){ return Object.assign(point,{earned:knownCount>=point.n}); });
  }
  function kaoMilestoneProgress(d,nowIso){
    var q=quranLearnRoot(d),milestones=objectOr(q.milestones,{}),ratio=kaoCoverage(d).ratio,known=Object.keys(kaoKnownLemmaSet(d)).length;
    var settledForward=function(ids){ return ids.length>0&&ids.every(function(id){ return isSettled(q.cards['w:'+id+':ar>tr'],7); }); };
    var ratioOf=function(key){
      if(key==='besmele') return kaoS0PlacementPass(q)||!!objectOr(objectOr(objectOr(q.path,{}).lessons,{})['s0.12'],{}).doneAt?1:0;
      if(key==='fatiha'){ var ids=kaoPrayerLemmaIds('fatiha'); return ids.length?ids.filter(function(id){ return isSettled(q.cards['w:'+id+':ar>tr'],7); }).length/ids.length:0; }
      if(key==='namaz'){ var all=kaoPrayerLemmaIds('namaz'); return all.length?all.filter(function(id){ return isSettled(q.cards['w:'+id+':ar>tr'],7); }).length/all.length:0; }
      if(key==='half') return Math.min(1,ratio/0.5);
      if(key==='twoThirds') return Math.min(1,ratio/(2/3));
      if(key==='eighty') return Math.min(1,ratio/0.75);
      if(key==='shortSurahs'){ var short=kaoSurahs(),done=short.filter(function(item){ return !!objectOr(objectOr(q.surahs,String(item.id)),{}).understoodAt; }).length; return short.length?done/short.length:0; }
      return kaoUnitMastered(q,String(key).slice(1))?1:0;
    };
    var conditionOf=function(key){
      if(key==='besmele') return 'Seviye 0\u2019ı bitir (ya da yerleştirme sınavını geç)';
      if(key==='fatiha') return 'Fâtiha kelimelerinin tümü 7 gün oturmuş olsun';
      if(key==='namaz'){ var prayerCount=kaoPrayerLemmaIds('namaz').length; return prayerCount>0?'Namazda geçen '+prayerCount+' kelimenin tümü 7 gün oturmuş olsun':'Namaz metinlerindeki tüm kelimeler 7 gün oturmuş olsun'; }
      if(key==='half') return 'Kur\u2019an kelimelerinin yarısı tanıdık olsun';
      if(key==='twoThirds') return 'Üçte iki kapsama ulaş';
      if(key==='eighty') return 'Kapsam %75\u2019e ulaş';
      if(key==='shortSurahs') return 'Kısa sûrelerde anladığın 10 sûreyi kesinleştir';
      return 'Ünite ' + String(key).slice(1) + '\u2019i uzmanlık düzeyinde bitir';
    };
    var labels=kaoMilestoneLabels();
    var earned=[],next=null;
    kaoMilestoneKeys().forEach(function(key){
      var label=labels[key]; if(!label) return;
      if(milestones[key]) earned.push({key:key,label:label,at:milestones[key]});
      else if(!next){ next={key:key,label:label,condition:conditionOf(key),progress:round8(ratioOf(key))}; }
    });
    return {earned:earned.map(function(item){ return item.label; }),next:next};
  }
  function kaoPerceptionSummary(d,nowValue){
    var q=quranLearnRoot(d),misheard=objectOr(objectOr(q.phonics,{}).misheard,{}),classes=Object.create(null),flagged=0;
    Object.keys(misheard).forEach(function(letterId){
      var count=Math.floor(nonNegativeNumber(misheard[letterId],0)); if(count<=0) return;
      flagged+=count; var name=kaoSoundClass(letterId); if(name) classes[name]=(classes[name]||0)+count;
    });
    var sounds=Object.keys(classes).sort(function(a,b){ return classes[b]-classes[a]||a.localeCompare(b); }).map(function(name){ return {name:name,count:classes[name]}; });
    var stats=kaoStats(d,nowValue),day={n:0,ok:0};
    ['twoWeeks','sixWeeks'].forEach(function(){});
    var w=stats.twoWeeks;
    day.n=nonNegativeNumber(w.dayFollow.n,0)+nonNegativeNumber(w.nightFollow.n,0);
    day.ok=nonNegativeNumber(w.dayFollow.ok,0)+nonNegativeNumber(w.nightFollow.ok,0);
    return {flagged:flagged,sounds:sounds,accuracy:{ok:day.ok,n:day.n,ratio:day.n?day.ok/day.n:null},bands:w.bands};
  }
  function kaoWeekActivity(d,nowValue){
    var daily=objectOr(quranLearnRoot(d).daily,{}),now=validDate(nowValue||new Date(),'now'),days=[],studied=0,answered=0;
    for(var offset=6;offset>=0;offset-=1){
      var date=addDays(now,-offset).toISOString().slice(0,10),row=objectOr(daily[date],{}),did=nonNegativeNumber(row.answered,0)>0;
      if(did) studied+=1; answered+=nonNegativeNumber(row.answered,0);
      days.push({date:date,dow:dateDow(date),studied:did,answered:nonNegativeNumber(row.answered,0)});
    }
    return {days:days,studied:studied,answered:answered};
  }
  var KAO_WEEK_DOW=['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'];
  function dateDow(date){ var day=new Date(String(date)+'T12:00:00Z').getUTCDay(); return KAO_WEEK_DOW[day]||''; }
  function kaoProgressModel(data,nowValue){
    var d=data||(quranLearnDeps?quranLearnDeps.data():null);
    if(!d) return null;
    var now=validDate(nowValue||new Date(),'now'),q=ensureQuranLearn(d),cards=objectOr(q.cards,{}),known=kaoKnownLemmaSet(d),knownCount=Object.keys(known).length,ratio=kaoCoverage(d).ratio;
    var curve=kaoCoverageCurve().map(function(point){ return Object.assign(point,{earned:knownCount>=point.n,remaining:Math.max(0,point.n-knownCount)}); });
    var nextPoint=curve.filter(function(point){ return !point.earned; })[0]||null;
    var study=kaoStudyStreak(q.daily);
    return {
      knownCount:knownCount,total:kaoTotalLemmas(),percent:Math.floor(ratio*100),ratio:round8(ratio),
      coverage:kaoCoverageMilestones(knownCount),
      curve:curve,nextPoint:nextPoint,
      stones:kaoMilestoneProgress(d,now.toISOString()),
      week:kaoWeekActivity(d,now),
      lastStudied:study.last,
      map:kaoSurahMap(d),
      perception:kaoPerceptionSummary(d,now),
      stats:kaoStats(d,now)
    };
  }
  function kaoStatsHTML(nowValue){
    if(!quranLearnDeps) return '';
    var esc=quranLearnDeps.esc,stats=kaoStats(quranLearnDeps.data(),nowValue),pct=function(ok,n){ return n?'%'+Math.round(ok/n*100):'—'; },MIN=30;
    var line=function(label,w){ return '<p><strong>'+esc(label)+':</strong> tekrar doğruluğu '+pct(w.ok,w.n)+' · FSRS öngörüsü '+pct(w.pred,w.n)+' · '+w.n+' tekrar</p>'; };
    var h='<main class="kao-stats" aria-labelledby="kao-stats-title"><div class="kao-view-head"><div><h2 id="kao-stats-title">İlerleme</h2><p>Kaç kelime tanıdığını, bu haftanı ve tekrar doğruluğunu burada görürsün.</p></div><button type="button" class="kao-back" onclick="App.kaoSetView(\'home\')">Geri</button></div>';
    // S-12: İlerleme ekranı taşları UZLAŞTIRIR (mevcut kayıt yoluna ek; taş bir kez kazanılır).
    var awarded=recordMilestones(ensureQuranLearn(quranLearnDeps.data()),quranLearnDeps.data(),validDate(nowValue||new Date(),'now')),model;
    if(awarded.length) kaoSave();
    model=kaoProgressModel(quranLearnDeps.data(),nowValue);var curveLine=function(point){ return 'İlk '+point.n+' kelime ≈ %'+point.percent.toFixed(1).replace('.',',')+(point.earned?' · kazanıldı':''); };
    h+='<section class="kao-progress-hero"><h3>Tanıdık kelime</h3><p class="kao-progress-count"><strong>'+model.knownCount+'</strong> / '+model.total+' lemma · Kur\u2019an metninin <strong>%'+model.percent+'</strong>\u2019ini okuyabilirsin</p>';
    h+='<ul class="kao-progress-curve">'+model.coverage.map(function(point){ return '<li'+(point.earned?' class="is-earned"':'')+'><span class="kao-curve-mark" aria-hidden="true">'+(point.earned?'●':'○')+'</span>'+esc(curveLine(point))+'</li>'; }).join('')+'</ul>';
    h+='<p class="kao-setting-hint">'+(model.nextPoint?'Sıradaki hedef: '+model.nextPoint.n+' kelime · %'+model.nextPoint.percent.toFixed(1).replace('.',',')+' kapsam ('+model.nextPoint.remaining+' kelime kaldı)':'Tüm kapsam basamakları kazanıldı')+'</p></section>';
    h+='<section class="kao-progress-stones"><h3>Taşlar</h3>'+(model.stones.earned.length?'<ul class="kao-stone-earned">'+model.stones.earned.slice(0,KAO_STONE_PREVIEW).map(function(label){ return '<li><span class="kao-stone-mark" aria-hidden="true">✓</span>'+esc(label)+'</li>'; }).join('')+'</ul>':'<p class="kao-setting-hint">Henüz taş yok; ilk taş birkaç adım uzakta.</p>')+(model.stones.next?'<p class="kao-stone-next"><strong>Sıradaki:</strong> '+esc(model.stones.next.label)+'<span class="kao-stone-condition">'+esc(model.stones.next.condition)+'</span></p>':'')+'</section>';
    h+='<section class="kao-progress-week"><h3>Bu hafta</h3><p class="kao-week-line">Bu hafta '+model.week.studied+' gün çalıştın · '+model.week.answered+' tekrar</p><ol class="kao-week-days">'+model.week.days.map(function(day){ return '<li'+(day.studied?' class="is-studied"':'')+' title="'+esc(day.date)+'"><span aria-hidden="true">'+esc(day.dow)+'</span><span class="kao-week-dot"'+(day.studied?'':' aria-hidden="true"')+'></span></li>'; }).join('')+'</ol></section>';
    h+='<section class="kao-progress-map"><h3>114 sûrede anladıkların</h3>'+kaoSurahMapHTML(model.map,null)+'</section>';
    h+='<section class="kao-progress-perception"><h3>Algı doğruluğu</h3><p>İşaretlenen harf: <strong>'+model.perception.flagged+'</strong>'+(model.perception.sounds.length?' · en çok: '+esc(model.perception.sounds[0].name)+' ('+model.perception.sounds[0].count+')':' · henüz işaret yok')+'</p><p>Son 2 haftada tekrar doğruluğu '+pct(model.perception.accuracy.ok,model.perception.accuracy.n)+'</p></section>';
    h+='<section class="kao-progress-calibration"><h3>Tekrar doğruluğu</h3>'+line('Son 2 hafta',stats.twoWeeks)+line('Son 6 hafta',stats.sixWeeks)+(stats.sixWeeks.n<MIN?'<p class="kao-setting-hint">Anlamlı karşılaştırma için en az '+MIN+' tekrar gerekir.</p>':'');
    h+='<details class="kao-flag"><summary>Öngörü ile gerçek 10 R-bandında nasıl örtüşüyor (son 6 hafta)</summary><p class="kao-setting-hint">Yalnız tekrar cevapları sayılır; puan değil, öngörünün ne kadar isabetli olduğunu gösterir.</p><table class="kao-stats-table"><thead><tr><th scope="col">Öngörülen R</th><th scope="col">Tekrar</th><th scope="col">Öngörü</th><th scope="col">Gerçek</th></tr></thead><tbody>'+stats.sixWeeks.bands.map(function(band,index){ return '<tr><th scope="row">'+(index/10).toFixed(1)+'–'+((index+1)/10).toFixed(1)+'</th><td>'+band.n+'</td><td>'+pct(band.pred,band.n)+'</td><td>'+pct(band.ok,band.n)+'</td></tr>'; }).join('')+'</tbody></table></details></section>';
    var w=stats.sixWeeks;
    h+='<section><h3>Gece tekrarı</h3><p>'+w.nightRev+' gece tekrarı · gece sonrası ilk tekrarda doğruluk '+pct(w.nightFollow.ok,w.nightFollow.n)+' ('+w.nightFollow.n+') · diğer tekrarlarda '+pct(w.dayFollow.ok,w.dayFollow.n)+' ('+w.dayFollow.n+')</p>'+(w.nightFollow.n<MIN?'<p class="kao-setting-hint">Karşılaştırma, gece sonrası en az '+MIN+' tekrar birikince anlamlıdır.</p>':'')+'</section>';
    var tr=objectOr(quranLearnRoot(quranLearnDeps.data()).transfer,{}); h+='<section><h3>Yeni âyet testi (haftalık aktarım)</h3><p>'+(tr.n?tr.ok+' / '+tr.n+' doğru · '+pct(tr.ok,tr.n)+' · hiç görmediğin âyetlerde':'Henüz test yok: kelimelerinin %95’ini tanıdığın, görmediğin bir âyet çıkınca haftada bir sorulur.')+'</p></section>';
    // KAO2-24: harita artık ayrı görünüm değil; tek İlerleme ekranının bölümü.
    h+='</main>';
    return h;
  }
  function kaoOpenPhonics(letterId){
    if(!quranLearnDeps) return false;
    var ui=quranLearnDeps.ui(),letter=letterId?phonicsLetter(letterId):null;
    if(letterId&&!letter) return false;
    ui.kaoPhonics={phase:letter?'lesson':'home',lessonId:letter?letter.id:'',letterId:letter?letter.id:'',silent:false};
    if(!ui.kaoOpen) return kaoOpen('phonics');
    return kaoNav('phonics');
  }
  function kaoSurahs(){
    var shorts=window.QuranShortSurahsV1;
    return shorts&&Array.isArray(shorts.surahs)?shorts.surahs.slice():[];
  }
  function kaoOpenSurah(surahId){
    if(!quranLearnDeps) return false;
    var id=Number(surahId),surah=kaoSurahs().find(function(item){ return item.id===id; });
    if(!surah||!surahWords(id).length) return false;
    var ui=quranLearnDeps.ui(); ui.kaoSurahId=id; kaoApplyView(ui,'reader',id,ui.kaoView==='reader'?'replace':'push'); quranLearnDeps.render(); return true;
  }
  function wordKnown(q,word){
    var explicit=q.surahs[String(word.surahId)]&&q.surahs[String(word.surahId)].words&&q.surahs[String(word.surahId)].words[word.id];
    var learned=!!kaoKnownLemmaSet(q)[word.lemmaId];
    if(learned) return true;
    return !(explicit&&explicit.status==='unknown')&&learned;
  }
  // T-21: seçili sûrenin kaydırma hedefi MOTORDA belirlenir; render yalnız işareti taşır.
  function kaoReaderScrollTarget(){
    if(!quranLearnDeps) return null;
    var sid=Number(quranLearnDeps.ui().kaoSurahId);
    return kaoSurahs().some(function(item){ return item.id===sid; })?sid:null;
  }
  // Y-12: "Anladım" öncesi 3 soruluk hızlı kontrol. Sorular sûrenin KENDİ kelimelerinden
  // seçilir; sıra ve şıklar sûre kimliğine göre belirlenimcidir (rastgelelik yok).
  function kaoSurahCheckQuestions(surahId,words){
    var pool=[],seen=Object.create(null);
    words.forEach(function(word){ var tr=String(word.tr||''); if(tr&&!seen[tr]){ seen[tr]=true; pool.push(tr); } });
    if(words.length<3||pool.length<3) return [];
    return words.slice(0,3).map(function(word,index){
      var others=pool.filter(function(tr){ return tr!==word.tr; });
      if(others.length<2) return null;
      var distractors=[others[index%others.length],others[(index+1)%others.length]].filter(function(v,i,arr){ return v&&arr.indexOf(v)===i; });
      for(var i=0;distractors.length<2&&i<others.length;i+=1){ if(distractors.indexOf(others[i])<0) distractors.push(others[i]); }
      if(distractors.length<2) return null;
      var choices=[{id:'c',text:word.tr}].concat(distractors.slice(0,2).map(function(tr,i){ return {id:'x'+(i+1),text:tr}; }));
      // Belirlenimci karıştırma: sıralama metne, yön sûre kimliğine bağlı.
      choices=choices.slice().sort(function(a,b){ return a.text<b.text?-1:(a.text>b.text?1:0); });
      if(surahId%2===1) choices.reverse();
      return {id:'sc:'+String(surahId)+':'+String(word.id),lemmaId:word.lemmaId,
        prompt:'“'+word.ar+'” hangi anlama gelir?',correctId:'c',choices:choices};
    }).filter(Boolean);
  }
  function kaoSurahCheck(){
    if(!quranLearnDeps) return null;
    var ui=quranLearnDeps.ui(),sid=Number(ui.kaoSurahId),words=surahWords(sid);
    var state=objectOr(ui.kaoReaderCheckState,{});
    var questions=Array.isArray(state.questions)?state.questions:[];
    var answers=objectOr(state.answers,{});
    var answered=questions.filter(function(q){ return answers[q.id]!==undefined; }).length;
    // available: sûre kontrol SORABİLİR mi (kelime havuzu yeterli mi) — soruların
    // yüklenmiş olması değil. Aksi halde kontrol başlamadan "yetersiz" mesajı çıkardı.
    var canAsk=kaoSurahCheckQuestions(sid,words).length===3;
    return {surahId:sid,available:canAsk,questions:questions,answers:answers,
      answered:answered,correct:questions.filter(function(q){ return answers[q.id]===q.correctId; }).length,
      done:questions.length===3&&answered===questions.length};
  }
  // S-09(c): kelime kelime çalma. Her klibin öncesinde çalan kelime işaretlenir; ses
  // yoksa sessiz yola düşülür (okuyucu okunuş ve anlamla sürdürülebilir).
  function kaoReaderPlayWords(words,onFail){
    if(!quranLearnDeps||!words.length) return false;
    if(!quranLearnSurfaceDeps||typeof quranLearnSurfaceDeps.createAudio!=='function') return false;
    var ui=quranLearnDeps.ui(),failed=false;
    var fail=function(){ if(failed) return; failed=true; ui.kaoReaderPlaying=null; if(typeof onFail==='function') onFail(); };
    var playAt=function(index){
      if(index>=words.length||failed) return;
      var word=words[index];
      ui.kaoReaderPlaying=index;
      var audio=quranLearnSurfaceDeps.createAudio(KAO_PHONICS_AUDIO+'s-'+String(word.surahId)+'-'+String(word.ayah)+'-'+String(word.i)+'.m4a');
      if(!audio){ fail(); return; }
      audio.preload='none';
      if(typeof audio.addEventListener==='function'){
        audio.addEventListener('error',fail,{once:true});
        audio.addEventListener('ended',function(){ playAt(index+1); },{once:true});
      }
      try{ var result=audio.play(); if(result&&typeof result.catch==='function') result.catch(fail); }catch(_error){ fail(); }
    };
    playAt(0);
    return true;
  }
  // Y-12/T-20: okuyucunun tek eylem yüzeyi. Anlam kelime içinde değil ALT PANELDE
  // açılır (satır akışı bozulmaz) ve "Anladım" ancak hızlı kontrolden sonra yazılır.
  function kaoReader(action,value){
    if(!quranLearnDeps) return false;
    var ui=quranLearnDeps.ui(),words=surahWords(Number(ui.kaoSurahId));
    if(action==='word'){
      ui.kaoReaderWord=Math.floor(Number(value));
      return kaoRevealWord(value);
    }
    if(action==='close'){
      ui.kaoReaderWord=null;
      quranLearnDeps.render();
      return true;
    }
    if(action==='play'){
      // Uygulamanın genel ses kuralı: 23:00–07:00 sessiz saatte ses çalmaz
      // (SeyAudio de aynı kurala uyar). Okuma yolu sessizce sürer.
      if(quranLearnSurfaceDeps&&quranLearnSurfaceDeps.isQuietTime===true){
        ui.kaoReaderPlaying=null;
        ui.kaoReaderNote='Sessiz saat (23:00–07:00); okunuş ve Türkçe anlam açık.';
        quranLearnDeps.render();
        return false;
      }
      var list=value==='one'?[words[ui.kaoReaderWord]].filter(Boolean):words;
      ui.kaoReaderNote='';
      var started=kaoReaderPlayWords(list,function(){
        ui.kaoReaderPlaying=null;
        ui.kaoReaderNote='Ses yüklenemedi; sûreyi okunuş ve Türkçe anlamla sürdürebilirsin.';
        quranLearnDeps.render();
      });
      if(!started) ui.kaoReaderNote='Bu cihazda ses kapalı; okunuş ve anlam yine açık.';
      quranLearnDeps.render();
      return started;
    }
    if(action==='checkstart'){
      ui.kaoReaderCheckState={questions:kaoSurahCheckQuestions(Number(ui.kaoSurahId),words),answers:{},done:false};
      quranLearnDeps.render();
      return true;
    }
    if(action==='answer'){
      var picked=value&&typeof value==='object'?value:{},qs=objectOr(ui.kaoReaderCheckState,{});
      var q=String(picked.id||''),choice=String(picked.choice||'');
      if(!Array.isArray(qs.questions)||!qs.questions.some(function(item){ return item.id===q; })) return false;
      qs.answers=objectOr(qs.answers,{});
      qs.answers[q]=choice;
      var done=qs.questions.every(function(item){ return qs.answers[item.id]!==undefined; });
      qs.done=done;
      ui.kaoReaderCheckState=qs;
      quranLearnDeps.render();
      return true;
    }
    if(action==='understood') return kaoMarkUnderstood();
    return false;
  }
  function kaoRevealWord(index){
    if(!quranLearnDeps) return false;
    var ui=quranLearnDeps.ui(),sid=Number(ui.kaoSurahId),words=surahWords(sid),word=words[Math.floor(Number(index))];
    if(!word||!word.pronunciation) return false;
    var q=ensureQuranLearn(quranLearnDeps.data()),key=String(sid),record=objectOr(q.surahs[key],{}),now=new Date(); q.surahs[key]=record; record.words=objectOr(record.words,{});
    if(!wordKnown(q,word)){
      record.words[word.id]={status:'unknown',revealedAt:now.toISOString()};
      var cardId='w:'+word.lemmaId+':ar>tr',card=objectOr(q.cards[cardId],{}); q.cards[cardId]=card;
      if(!nonNegativeNumber(card.reps,0)){ card.state='learning'; card.reps=1; card.s=0; card.d=0; card.r=now.toISOString(); card.due=addDays(now,1).toISOString(); card.introducedAt=now.toISOString(); card.tomorrowReason='reader_unknown'; card.readerUnknown=true; }
    }
    kaoSave(); quranLearnDeps.render(); return true;
  }
  function kaoMarkUnderstood(){
    if(!quranLearnDeps) return false;
    var sid=Number(quranLearnDeps.ui().kaoSurahId);
    if(!kaoSurahs().some(function(item){ return item.id===sid; })) return false;
    var q=ensureQuranLearn(quranLearnDeps.data()),key=String(sid),record=objectOr(q.surahs[key],{}),now=new Date(); q.surahs[key]=record;
    record.understoodAt=now.toISOString(); record.delayedTestAt=addDays(now,7).toISOString(); record.delayedScore=null; record.delayedAnswered=0; record.delayedCompletedAt=null; record.confirmedAt=null; record.needsReread=false;
    recordMilestones(q,quranLearnDeps.data(),now);
    kaoSave(); quranLearnDeps.render(); return true;
  }
  function kaoReaderHTML(){
    if(!quranLearnDeps) return '';
    var q=ensureQuranLearn(quranLearnDeps.data()),ui=quranLearnDeps.ui(),surahs=kaoSurahs(),sid=Number(ui.kaoSurahId||surahs[0]&&surahs[0].id),surah=surahs.find(function(item){ return item.id===sid; });
    if(!surah) return '<main class="kao-reader"><span class="kao-content-error" role="alert">Kısa sûre içeriği bulunamadı.</span></main>';
    var esc=quranLearnDeps.esc,words=surahWords(sid),record=objectOr(q.surahs[String(sid)],{}),marks=Object.create(null);
    var playing=typeof ui.kaoReaderPlaying==='number'?ui.kaoReaderPlaying:-1,openIndex=typeof ui.kaoReaderWord==='number'?ui.kaoReaderWord:-1;
    (window.QuranShortSurahsV1.waqfMarks||[]).forEach(function(mark){ marks[mark.afterWordId]=mark.mark; });
    // (a) Sûre tanıtımı: yalnız donmuş nüzul/âyet/tema verisi (QuranRevelationOrderV1); K2F-26: kaynaksız bağlam metni yok.
    var order=window.QuranRevelationOrderV1,meta=order&&typeof order.byMushafOrder==='function'?order.byMushafOrder(sid):null;
    var theme=meta&&typeof meta.themeTr==='string'?meta.themeTr:'';
    var intro='';
    if(meta||theme){
      var facts=[];
      if(meta&&meta.revelationPlace) facts.push(esc(meta.revelationPlace===String('Mekke')?'Mekke’de indi':'Medine’de indi'));
      if(meta&&meta.ayahCount) facts.push(String(meta.ayahCount)+' âyet');
      facts.push(String(words.length)+' kelime');
      intro='<details class="kao-reader-surah"><summary><span class="kao-reader-surah-name">'+esc(surah.name)+'</span><span class="kao-reader-surah-facts">'+facts.join(' · ')+'</span></summary>'
        +(theme?'<p class="kao-reader-theme">'+esc(theme)+'</p>':'')
        +'</details>';
    }
    var target=kaoReaderScrollTarget(),check=kaoSurahCheck();
    var h='<main class="kao-reader" aria-labelledby="kao-reader-title"><div class="kao-view-head"><div><p class="kao-eyebrow">20 kısa sûre</p><h2 id="kao-reader-title">'+esc(surah.name)+'</h2><p>Kelimeler mushaf akışında; anlamı görmek için kelimeye dokun.</p></div><button type="button" class="kao-back" onclick="App.kaoSetView(\'units\')">Üniteler</button></div>'+intro
      +'<div class="kao-surah-picker" aria-label="Kısa sûre seç">';
    surahs.forEach(function(item){ h+='<button type="button"'+(item.id===target?' data-kao-scroll="'+item.id+'" aria-current="true"':'')+' onclick="App.kaoOpenSurah('+item.id+')">'+esc(item.name)+'</button>'; });
    h+='</div><div class="kao-reader-actions"><button type="button" class="kao-secondary" onclick="App.kaoReader(\'play\',\'all\')">Dinle</button>'
      +(ui.kaoReaderNote?'<p class="kao-reader-note" role="status">'+esc(ui.kaoReaderNote)+'</p>':'')
      +'</div><section class="kao-reader-lines">';
    words.forEach(function(word,index){
      var known=wordKnown(q,word),revealed=known||!!(record.words&&record.words[word.id]&&record.words[word.id].revealedAt);
      var label=known?'bilinen kelime':'bilinmeyen kelime, dokunarak aç';
      // T-20: kelime kenarlıksız çip; anlam kelime İÇİNDE basılmaz (satır akışı sabit).
      h+='<span class="kao-reader-word '+(known?'is-known':(revealed?'is-revealed':'is-unknown'))+'"'+(index===playing?' aria-current="true"':'')+'><button type="button" aria-label="'+label+'"'+(index===openIndex?' aria-expanded="true"':'')+' onclick="App.kaoReader(\'word\','+index+')">'+kaoArabicPairHTML(word.ar,word.pronunciation,'kao-reader-pair')+'</button>';
      if(marks[word.id]){ var popId='kao-waqf-'+String(sid)+'-'+String(index); h+='<button type="button" class="kao-waqf" popovertarget="'+popId+'" aria-label="Vakıf işareti '+esc(marks[word.id])+' açıklaması">'+esc(marks[word.id])+'</button><span id="'+popId+'" class="kao-waqf-note" popover>burada dur: cümle/anlam sınırı</span>'; }
      h+='</span>';
    });
    h+='</section>';
    // (b) Anlam ALT PANELİ: dokunulan kelimenin anlamı akışı bozmadan altta açılır.
    if(openIndex>=0&&words[openIndex]){
      var openWord=words[openIndex];
      h+='<section class="kao-reader-panel" role="dialog" aria-label="Kelime anlamı"><p class="kao-reader-panel-ar" lang="ar" dir="rtl">'+esc(openWord.ar)+'</p><p class="kao-reader-panel-tr">'+esc(openWord.tr)+'</p>'
        +'<div class="kao-reader-panel-actions"><button type="button" class="kao-secondary" onclick="App.kaoReader(\'play\',\'one\')">Kelimeyi dinle</button><button type="button" class="kao-secondary" onclick="App.kaoReader(\'close\')">Kapat</button></div></section>';
    }
    // (e) Y-12: "Anladım" öncesi 3 soruluk hızlı kontrol.
    h+='<section class="kao-reader-understood">';
    if(!check.available){
      h+='<p class="kao-reader-check-hint">Sûre kısa; hızlı kontrol için yeterli kelime yok. Okuduğunu kaydedebilirsin.</p>';
    }else if(!check.questions.length){
      h+='<p>Okumayı bitirdiysen üç soruyla anlayışını yoklayalım.</p><button type="button" class="kao-primary" onclick="App.kaoReader(\'checkstart\')">Anladım · 3 soru</button>';
    }else{
      h+='<div class="kao-reader-check" role="group" aria-label="Hızlı kontrol">';
      h+='<p class="kao-reader-check-kicker">Hızlı kontrol · '+String(check.answered)+' / 3</p>';
      check.questions.forEach(function(item){
        var answered=check.answers[item.id]!==undefined;
        h+='<fieldset class="kao-reader-question"'+(answered?' data-answered="true"':'')+'><legend>'+esc(item.prompt)+'</legend>';
        item.choices.forEach(function(choice){
          var isPicked=check.answers[item.id]===choice.id,isCorrect=answered&&choice.id===item.correctId;
          h+='<button type="button" class="kao-reader-option'+(isCorrect?' is-correct':'')+(isPicked&&!isCorrect?' is-wrong':'')+'"'+(answered?' disabled':'')+' onclick="App.kaoReader(\'answer\',{id:\''+item.id+'\',choice:\''+choice.id+'\'})">'+esc(choice.text)+'</button>';
        });
        h+='</fieldset>';
      });
      h+='</div>';
      if(check.done){
        h+='<p class="kao-reader-check-result">'+String(check.correct)+' / 3 doğru. '+(check.correct===3?'Hazırsın.':'Yanlışlar yarınki tekrara eklendi.')+'</p><button type="button" class="kao-primary" onclick="App.kaoReader(\'understood\')">Anladım · kaydet</button>';
      }else{
        h+='<button type="button" class="kao-primary" disabled>Önce üç soruyu yanıtla</button>';
      }
    }
    h+='<p class="kao-reader-status">'+(record.confirmedAt?'Gecikmeli test '+String(record.delayedScore)+'/5 · anlaşıldı':(record.needsReread?'Gecikmeli test '+String(record.delayedScore)+'/5 · tekrar oku':(record.delayedTestAt?'7 günlük test planlandı':'Okuma bitince anlayışını kaydet')))+'</p></section></main>';
    return h;
  }
  // KAO2-09 · S-02: nextStep eylem eşlemesi. Henüz handler'ı olmayan adımlar mevcut akışa bağlanır
  // (mastery → KAO2-13); tek birincil eylem her zaman çalışır durumda kalır. KAO2-11: onboarding → ilk açılış.
  var KAO_HOME_ACTIONS={onboarding:{label:'Başlayalım',action:{name:'kaoOnboard',args:['start']}},'night-review':{label:'',action:'kaoStart'},warmup:{label:'Isınmaya başla',action:'kaoStart'},'s0-lesson':{label:'Derse başla',action:'kaoS0'},mastery:{label:'Ustalığa başla',action:'kaoLesson'},repair:{label:'Onarım turuna başla',action:'kaoLesson'},'next-unit':{label:'Üniteye başla',action:'kaoLesson'},daily:{label:'Başla',action:'kaoLesson'},rest:{label:'Günün âyetini aç',action:'kaoOpenAyah'}};
  function kaoHomeHero(d,q,now,step){
    var night=kaoNightWindow(d,now),confused=kaoConfusedLine(q),map=KAO_HOME_ACTIONS[step.kind]||KAO_HOME_ACTIONS.daily,foot=[];
    if(night) foot.push({icon:'moon',text:'Gece tekrarı açık · '+night.durationMinutes+' dk, en fazla '+night.maxCards+' tekrar'});
    if(confused) foot.push({icon:'triangle-alert',text:confused});
    var label=step.kind==='night-review'&&night?'Gece tekrarına başla · en çok '+night.maxCards+' kart':map.label,action=map.action;
    if(['mastery','repair','next-unit','daily'].indexOf(step.kind)>=0) action={name:'kaoLesson',args:['start',step.param]};
    // K2F-15 (K5-01): Seviye 0 adımı ders oynatıcıya (boş plan) değil S0 yüzeyine gider.
    if(step.kind==='s0-lesson') action={name:'kaoS0',args:['start',step.param]};
    var hero={eyebrow:step.kind==='rest'?'Bugün':'Sıradaki',title:step.title,subtitle:step.subtitle,button:{label:label,action:action},foot:foot};
    // K2F-08 (KR-2): ustalık adımında ikincil metin düğmesi; atlamak taş/ustalık yazmaz.
    if(step.kind==='mastery') hero.secondary={label:'Şimdilik atla',action:{name:'kaoLesson',args:['skip-mastery',step.param]}};
    return hero;
  }
  // Yolun kartı ve hub kartı için ortak: dersleri ya da ustalığı bitmemiş ilk ünite (hepsi bittiyse son ünite).
  function kaoCurrentUnit(q,flow,content){
    var units=content.curriculum.units,current=units[units.length-1],progress=null;
    for(var i=0;i<units.length;i+=1){ var p=flow.unitProgress(q,units[i].id,content); if(!p.complete){ current=units[i]; progress=p; break; } }
    return {unit:current,progress:progress||flow.unitProgress(q,current.id,content)};
  }
  function kaoHomePath(d,q){
    var flow=window.SeymaQuranLearnFlow,content={curriculum:window.QuranCurriculumV2},units=content.curriculum.units,at=kaoCurrentUnit(q,flow,content),current=at.unit,progress=at.progress;
    var level=content.curriculum.levels.find(function(lv){ return lv.id===current.level; })||{title:'',unitIds:[current.id]};
    var known=Object.keys(kaoKnownLemmaSet(d)).length,percent=Math.min(100,Math.floor(kaoCoverage(d).ratio*100)),first=units[0],firstWords=first.lessons.reduce(function(n,l){ return n+l.lemmaIds.length; },0);
    return {level:'Seviye '+current.level+' · '+level.title,unit:'Ünite '+(level.unitIds.indexOf(current.id)+1)+'/'+level.unitIds.length+' · '+current.title+' · '+progress.lessonsDone+'/'+progress.lessons+' ders',percent:progress.lessons?progress.lessonsDone/progress.lessons*100:0,known:known,coverage:known>0?percent:null,goal:'İlk hedef: '+first.title+'’yı anlamak · '+firstWords+' kelime',openLabel:'Üniteyi aç',action:{name:'kaoNav',args:['unit',current.id]},moreAction:{name:'kaoSetView',args:['units']}};
  }
  function kaoHomeLists(q){
    var shorts=window.QuranShortSurahsV1,surahCount=shorts&&Array.isArray(shorts.surahs)?shorts.surahs.length:0,understood=q.ayahs&&Array.isArray(q.ayahs.understood)?q.ayahs.understood.length:0;
    // KAO2-20: kök aileleri bir keşif katmanıdır; kullanıcı henüz hiç kelime kartı
    // edinmediyse gizli kalır (yeni hesapta yol haritası sade kalsın).
    return [
      {title:'Keşfet',rows:[{icon:'book-open',title:'Kısa sûreler',value:surahCount?String(surahCount):'',action:{name:'kaoOpenSurah',args:[114]}},{icon:'mosque',title:'Namazda ne diyorum',action:'kaoOpenPrayer'},{icon:'quote',title:'Gramer notları',action:{name:'kaoSetView',args:['grammar']}},Object.keys(q.cards||{}).length>0?{icon:'sprout',title:'Kök aileleri',value:'73 aile',action:'kaoOpenRoots'}:null,kaoS0Visible(q)?{icon:'hexagon',title:'Seviye 0 · şekil aileleri',value:'12 ders',action:{name:'kaoS0',args:['start','s0.01']}}:null,{icon:'headphones',title:'Telaffuz stüdyosu',action:'kaoOpenPhonics'},{icon:'sparkles',title:'Günün âyeti',value:understood?understood+' anlaşıldı':'',action:'kaoOpenAyah'}].filter(Boolean)},
      {title:'Sen',rows:[{icon:'trending-up',title:'İlerleme',action:{name:'kaoSetView',args:['stats']}},{icon:'settings',title:'Ayarlar',action:{name:'kaoSetView',args:['settings']}}]}
    ];
  }
  function kaoHomeHTML(nowValue){
    if(!quranLearnDeps) return '';
    var d=quranLearnDeps.data(),q=ensureQuranLearn(d),now=nowValue?validDate(nowValue,'now'):new Date(),step=kaoNextStepFor(d,now);
    return kaoViewsApi().todayScreen({notice:quranLearnDeps.ui().kaoWhatsNew===true?KAO_WHATS_NEW:null,hero:kaoHomeHero(d,q,now,step),path:kaoHomePath(d,q),lists:kaoHomeLists(q)});
  }
  // KAO2-11 · S-01 ilk açılış (05 §3) ve mevcut kullanıcı geçişi (05 §9).
  // Adımlar yalnız ui.kaoOnboard'da yaşar; veri tek kayıtla "Bitir"/"Atla"da yazılır, render yazmaz.
  var KAO_WHATS_NEW={title:'Yeni düzen',items:['Her gün tek adım: Bugün ekranı sıradakini gösterir.','Kelimelerin tematik ünitelere yerleşti; ilerlemen olduğu gibi duruyor.','Tekrar takvimin ve kazandığın taşlar korunuyor.'],close:{label:'Tamam',action:{name:'kaoOnboard',args:['whats-new-close']}}};
  var KAO_ONBOARD_MINUTES=[5,10,15],KAO_ONBOARD_INTENTS=[['fajr','Sabah'],['dhuhr','Öğle'],['asr','İkindi'],['maghrib','Akşam'],['isha','Yatsı'],['custom','Kendim seçerim']];
  // Yerleştirme = kapı görevlerinin eşit aralıklı alt kümesi (20 okumadan 8, 12 dinlemeden 4); okuma ≥7/8 → Seviye 1.
  var KAO_PLACEMENT_READING=[0,2,5,7,10,12,15,17],KAO_PLACEMENT_LISTENING=[0,3,6,9],KAO_PLACEMENT_PASS=7;
  // 07 §2 şekil aileleri: S0 dersi → harf kimliği (QuranPhonicsV1). Hareke ve imla dersleri Unicode işaretinden bulunur.
  var KAO_S0_LETTERS={'s0.02':['ba','ta','tha','nun','ya'],'s0.04':['jim','hah','khah'],'s0.05':['dal','dhal','ra','zay','waw'],'s0.06':['sin','shin','sad','dad'],'s0.10':['tta','zah','ayn','ghayn','fa','qaf','kaf','lam','mim','ha','hamza']};
  var KAO_S0_MARKS=[[/\u064e/,'s0.01'],[/[\u064f\u0650]/,'s0.03'],[/\u0652/,'s0.08'],[/[\u0651\u0653\u0670\u0649]|[^\s]\u0627/,'s0.09'],[/[\u064b-\u064d\u0671]|^\u0627\u0644/,'s0.11'],[/[\u0622\u0623\u0625\u0627\u0671]/,'s0.05'],[/[\u0621-\u0626\u0629]/,'s0.10']];
  function kaoS0LessonOfLetter(letterId){
    var keys=Object.keys(KAO_S0_LETTERS);
    for(var i=0;i<keys.length;i+=1) if(KAO_S0_LETTERS[keys[i]].indexOf(letterId)>=0) return keys[i];
    return null;
  }
  // K2F-15 (f): S0 satırı onboarding.start==='s0' ya da başlanmış/bitmiş S0 dersi ya da kart varsa görünür (sıfır kartlı S0 öğrencisi de erişir).
  function kaoS0Visible(q){
    if(objectOr(q.onboarding,{}).start==='s0'||Object.keys(objectOr(q.cards,{})).length>0) return true;
    var lessons=objectOr(objectOr(q.path,{}).lessons,{});
    return kaoS0Ids().some(function(id){ var r=lessons[id]; return !!(r&&(r.startedAt||r.doneAt)); });
  }
  function kaoS0Ids(){ var c=window.QuranCurriculumV2,list=c&&c.s0&&Array.isArray(c.s0.lessons)?c.s0.lessons:[]; return list.map(function(lesson){ return String(lesson.id); }); }

  // KAO2-21 · Seviye 0 yeniden kuruluş (kullanıcı kararı: B2). Yeni S0 yüzeyi AYRI yaşar;
  // kapı (kaoGate) yalnız yerleştirme olarak DOKUNULMAZ kalır. İçerik yalnız donmuş
  // modüllerden gelir; elif (ا) veride olmadığı için aile kümesi veriyle sınırlıdır (A3).
  var KAO_S0_ZWJ='\u200d';
  var KAO_S0_SHAPES={'mahrec-ayn':'boğaz ortası','mahrec-dad':'dil yanı','mahrec-dhal':'dil ucu–diş arası'};
  function kaoS0LetterFamily(letterId){
    var keys=Object.keys(KAO_S0_LETTERS);
    for(var i=0;i<keys.length;i+=1) if(KAO_S0_LETTERS[keys[i]].indexOf(letterId)>=0) return keys[i];
    return null;
  }
  // (b) Konum tablosu: biçimler ZWJ ile MEKANİK üretilir; bağlanmayan harfte baş/orta YOK.
  function kaoS0PositionTable(){
    var lex=window.QuranLexiconV1,ph=window.QuranPhonicsV1,letters=ph&&Array.isArray(ph.letters)?ph.letters:[];
    var nonJoining=(lex&&Array.isArray(lex.nonJoining))?lex.nonJoining:['dal','dhal','ra','zay','waw','hamza'];
    var rows=letters.map(function(letter){
      var ar=String(letter.ar||''),joins=nonJoining.indexOf(letter.id)<0;
      return {letterId:letter.id,letter:ar,joins:joins,cells:[
        {key:'isolated',ar:ar},
        joins?{key:'initial',ar:ar+KAO_S0_ZWJ}:{key:'initial',ar:'',unavailable:true},
        joins?{key:'medial',ar:KAO_S0_ZWJ+ar+KAO_S0_ZWJ}:{key:'medial',ar:'',unavailable:true},
        {key:'final',ar:KAO_S0_ZWJ+ar}
      ]};
    });
    return {columns:[{key:'isolated',label:'Tek'},{key:'initial',label:'Başta'},{key:'medial',label:'Ortada'},{key:'final',label:'Sonda'}],rows:rows};
  }
  // (c) Her harf için gerçek kelime. Seçim YAPIDA yapılır (araç diski görebilir),
  // çalışma zamanı yalnız içerik modülünden okur — tarayıcı dosya varlığını sorgulayamaz.
  function kaoS0Words(){ var c=window.QuranCurriculumV2; return c&&c.s0&&c.s0.letters&&typeof c.s0.letters==='object'?c.s0.letters:{}; }
  function kaoS0Word(letterId){ var entry=kaoS0Words()[letterId]; return entry&&entry.word?entry.word:null; }
  // (d) Ders akışı: açıklama → dinle-gör → 6–8 alıştırma → gerçek kelime okuma.
  // Gerçek kelimeye Latin okunuşu sözlükten eklenir (Arapça + okunuş birlikte; harf kelimesi modülde okunuşsuz saklanır).
  function kaoS0WithReading(word){
    if(!word) return null;
    var lex=window.QuranLexiconV1,lemma=lex&&typeof lex.byId==='function'?lex.byId(String(word.wordId||'')):null;
    return Object.assign({},word,{translit:lemma&&lemma.translit?String(lemma.translit):''});
  }
  function kaoS0Lesson(lessonId){
    var id=String(lessonId||''),c=window.QuranCurriculumV2;
    var lesson=(c&&c.s0&&Array.isArray(c.s0.lessons)?c.s0.lessons:[]).filter(function(l){ return l.id===id; })[0];
    if(!lesson) return null;
    if(id==='s0.12') return {id:id,kind:'reading',title:lesson.title,goal:lesson.goal,
      stages:[{kind:'intro'},{kind:'listen',audio:true},{kind:'drill',count:8,drills:[{kind:'word-meaning',count:8}]},{kind:'read'}],words:kaoFatihaWords()};
    // K2F-13: harf listesi olmayan dersler (hareke, esre/ötre, konum, sükûn, med/şedde, tenvin/elif-lâm) `focus` + örnek kelimelerle gelir.
    if(lesson.focus&&typeof lesson.focus==='object'){
      var examples=Array.isArray(lesson.examples)?lesson.examples:[];
      // Örneksiz odak (konum dersi): gerçek kelime okuma için sıradaki bağlanan harfin kelimesi (belirlenimci: ilk uygun harf).
      var readWord=null;
      if(!examples.length){ var keys=Object.keys((c.s0.letters&&typeof c.s0.letters==='object')?c.s0.letters:{}).sort(); for(var wi=0;wi<keys.length&&!readWord;wi+=1){ var entry=c.s0.letters[keys[wi]]; if(entry&&entry.joins&&entry.word) readWord=kaoS0WithReading(entry.word); } }
      var focusDrills={marks:[{kind:'mark-name',count:3},{kind:'word-sound',count:3},{kind:'word-meaning',count:2}],sukun:[{kind:'mark-name',count:1},{kind:'word-sound',count:3},{kind:'word-meaning',count:3}],
        'madd-shadda':[{kind:'mark-name',count:2},{kind:'word-sound',count:3},{kind:'word-meaning',count:3}],'tanwin-al':[{kind:'mark-name',count:2},{kind:'word-sound',count:3},{kind:'word-meaning',count:3}],
        positions:[{kind:'position',count:4},{kind:'form-letter',count:4}]}[lesson.focus.kind]||[];
      return {id:id,kind:'focus',title:lesson.title,goal:lesson.goal,focus:lesson.focus,letters:[],word:readWord,examples:examples,
        stages:[{kind:'intro'},{kind:'listen',audio:examples.length>0},{kind:'drill',count:8,drills:focusDrills},{kind:'read'}]};
    }
    var letters=(c.s0.letters&&typeof c.s0.letters==='object')?c.s0.letters:{};
    var mine=Object.keys(letters).filter(function(k){ return (lesson.family||[]).indexOf(k)>=0; });
    // Aile bilgisi KAO_S0_LETTERS'tan gelir (derste hangi harfler tanıtılır).
    if(!mine.length){ var fid=Object.keys(KAO_S0_LETTERS).filter(function(k){ return k===id; })[0]; mine=fid?KAO_S0_LETTERS[fid].slice():[]; }
    var first=mine[0]?letters[mine[0]]:null,word=kaoS0WithReading(first&&first.word?first.word:null);
    var drills=[{kind:'letter-id',count:3},{kind:'position',count:3},{kind:'shape',count:2}];
    return {id:id,kind:'lesson',title:lesson.title,goal:lesson.goal,letters:mine.map(function(k){ return {id:k,ar:String(letters[k]&&letters[k].letter||'')}; }),
      word:word,stages:[{kind:'intro'},{kind:'listen',audio:!!word},{kind:'drill',count:8,drills:drills},{kind:'read'}]};
  }
  function kaoFatihaWords(){
    var shorts=window.QuranShortSurahsV1,text=shorts&&Array.isArray(shorts.prayerTexts)?shorts.prayerTexts.filter(function(p){ return p.id==='fatiha'; })[0]:null;
    var list=text&&Array.isArray(text.words)?text.words:[];
    return list.map(function(w){ return {ar:String(w.ar||''),tr:String(w.tr||''),pronunciation:String(w.pronunciation||''),clip:'w-'+String(w.lemmaId||'')+'-measured.m4a'}; });
  }
  function kaoS0Model(){
    var ph=window.QuranPhonicsV1,letters=ph&&Array.isArray(ph.letters)?ph.letters:[];
    return {introductions:letters.map(function(letter){
      var word=kaoS0Word(letter.id);
      return {letterId:letter.id,ar:String(letter.ar||''),mahrec:String(letter.mahrec||''),tipTr:String(letter.tipTr||''),
        lessonId:kaoS0LetterFamily(letter.id),wordClip:word,silent:!word};
    })};
  }
  function kaoOnboardFacts(){
    var lex=window.QuranLexiconV1,lemmas=lex&&Array.isArray(lex.lemmas)?lex.lemmas:[],tokens=lemmas.reduce(function(sum,lemma){ return sum+nonNegativeNumber(lemma.freq,0); },0);
    return {words:lemmas.length,percent:Math.floor(Math.min(1,tokens/KAO_QURAN_TOKENS)*100)};
  }
  function kaoPlacementTasks(){
    var gate=kaoGateTasks();
    return {reading:KAO_PLACEMENT_READING.map(function(i){ return gate.reading[i]; }).filter(Boolean),listening:KAO_PLACEMENT_LISTENING.map(function(i){ return gate.listening[i]; }).filter(Boolean)};
  }
  // Yanlış okunan kelimenin harf aileleri + işaret dersleri, yanlış duyulan çiftin harfleri; okuma provası (S0.12) her zaman kalır.
  function kaoPlacementMissing(tasks,answers,audioDeferred){
    var letters=window.QuranPhonicsV1&&Array.isArray(window.QuranPhonicsV1.letters)?window.QuranPhonicsV1.letters:[],byChar=Object.create(null),need={'s0.12':1};
    letters.forEach(function(letter){ if(letter&&letter.ar) byChar[letter.ar]=letter.id; });
    function add(lesson){ if(lesson) need[lesson]=1; }
    tasks.reading.forEach(function(task,i){
      if(answers.reading[i]!==false) return;
      var ar=String(task.ar||''); add('s0.07');
      Array.from(ar).forEach(function(ch){ add(kaoS0LessonOfLetter(byChar[ch])); });
      KAO_S0_MARKS.forEach(function(rule){ if(rule[0].test(ar)) add(rule[1]); });
    });
    if(!audioDeferred) tasks.listening.forEach(function(task,i){ if(answers.listening[i]===false) task.choices.forEach(function(choice){ add(kaoS0LessonOfLetter(choice.id)); }); });
    return kaoS0Ids().filter(function(id){ return need[id]; });
  }
  // İlk açılış bir yığın görünümü değil, ana ekranın modudur (gezinme yığını ve Flow görünüm listesi değişmez).
  var KAO_ONBOARD_TITLE='Hoş geldin';
  function kaoOnboardState(){ return {step:1,choice:null,minutes:5,intent:null,audio:true,placement:null,result:null}; }
  function kaoOnboardActive(ui){ return !!(ui&&ui.kaoOnboard&&typeof ui.kaoOnboard==='object'); }
  // Okuma görevi yoksa (eksik içerik) kanıt yoktur: tüm S0 dersleri eksik sayılır, hiçbiri sınanmadan işaretlenmez.
  function kaoPlacementResult(st){
    var tasks=kaoPlacementTasks(),p=st.placement,reading=p.reading.filter(function(ok){ return ok===true; }).length,listening=p.listening.filter(function(ok){ return ok===true; }).length;
    var start=tasks.reading.length&&reading>=KAO_PLACEMENT_PASS?'level1':'s0';
    return {start:start,record:{reading:reading,readingTotal:tasks.reading.length,listening:p.audioDeferred?null:listening,listeningTotal:tasks.listening.length,audioDeferred:p.audioDeferred===true,missing:start!=='s0'?[]:(tasks.reading.length?kaoPlacementMissing(tasks,p,p.audioDeferred):kaoS0Ids())}};
  }
  function kaoOnboardStart(st){ return st.choice==='none'?'s0':(st.choice==='slow'?(st.result?st.result.start:'s0'):'level1'); }
  function kaoPlacementAnswer(ui,st,value){
    var tasks=kaoPlacementTasks(),p=st.placement,listening=p.phase==='listening',list=listening?tasks.listening:tasks.reading,task=list[p.index];
    if(!task) return false;
    var valid=listening?task.choices.some(function(c){ return c.id===value; }):task.choices.indexOf(value)>=0;
    if(!valid) return false;
    (listening?p.listening:p.reading).push(String(value)===String(task.answer));
    p.index+=1;
    if(p.index<list.length) return true;
    if(!listening&&tasks.listening.length){ p.phase='listening'; p.index=0; ui.kaoAudioFailed=false; return true; }
    return kaoPlacementFinish(st);
  }
  function kaoPlacementFinish(st){ st.result=kaoPlacementResult(st); st.step=3; return true; }
  function kaoOnboardMove(ui,st,action,value){
    if(action==='next'&&st.step===1){ st.step=2; return true; }
    if(action==='back'&&st.step!==1){ st.step=st.step===2?1:2; st.placement=null; st.result=null; ui.kaoAudioFailed=false; return true; }
    if(action==='choose'&&st.step===2&&['none','slow','fluent'].indexOf(value)>=0){
      st.choice=value; st.result=null;
      if(value!=='slow'){ st.step=3; return true; }
      st.step='placement'; st.placement={phase:'reading',index:0,reading:[],listening:[],audioDeferred:false}; ui.kaoAudioFailed=false;
      return kaoPlacementTasks().reading.length?true:kaoPlacementFinish(st);
    }
    return false;
  }
  function kaoOnboardPlacement(ui,st,action,value){
    if(st.step!=='placement'||!st.placement) return false;
    if(action==='answer') return kaoPlacementAnswer(ui,st,value);
    var listen=st.placement.phase==='listening'?kaoPlacementTasks().listening[st.placement.index]:null;
    if(action==='play') return !!listen&&value===listen.pairId&&kaoGate('play',value);
    if(action==='audio-skip'&&listen&&ui.kaoAudioFailed===true){ st.placement.audioDeferred=true; return kaoPlacementFinish(st); }
    return false;
  }
  function kaoOnboardRhythm(st,action,value){
    if(st.step!==3) return false;
    if(action==='minutes'&&KAO_ONBOARD_MINUTES.indexOf(value)>=0){ st.minutes=value; return true; }
    if(action==='intent'&&KAO_ONBOARD_INTENTS.some(function(pair){ return pair[0]===value; })){ st.intent=value; return true; }
    if(action==='audio'){ st.audio=typeof value==='boolean'?value:!st.audio; return true; }
    return false;
  }
  // Atla: 05 §3 varsayılanları (Seviye 1, 5 dk, ses açık). Mevcut ilerleme kaydı silinmez; yalnız eksik olmayan S0 dersleri eklenir.
  function kaoOnboardCommit(ui,q,st,skip){
    var now=new Date().toISOString(),o=q.onboarding,start=skip?'level1':kaoOnboardStart(st),minutes=skip?5:st.minutes,audio=skip?true:st.audio!==false;
    o.doneAt=now; o.start=start; o.minutes=minutes; o.intent=skip?null:st.intent;
    if(!skip&&st.choice==='slow'&&st.result){
      o.placement=Object.assign({},st.result.record,{at:now});
      if(start==='s0') kaoS0Ids().forEach(function(id){ if(o.placement.missing.indexOf(id)<0&&!q.path.lessons[id]) q.path.lessons[id]={startedAt:null,doneAt:now,score:null,via:'placement'}; });
    }
    q.settings.dailyNew=minutes; q.settings.audio=audio; if(audio) q.settings.audioStyle='measured';
    ui.kaoOnboard=null; ui.kaoAudioFailed=false;
    kaoApplyView(ui,'home',null,'open'); kaoSave();
    if(!skip&&start==='level1'){
      var firstUnit=window.QuranCurriculumV2&&window.QuranCurriculumV2.units&&window.QuranCurriculumV2.units[0],firstLesson=firstUnit&&firstUnit.lessons&&firstUnit.lessons[0];
      if(firstLesson) return kaoLessonStart(firstLesson.id,'intro');
    }
    if(!skip&&start==='s0'){
      var missingFirst=o.placement&&Array.isArray(o.placement.missing)?o.placement.missing[0]:null,firstS0=missingFirst||kaoS0Ids()[0]; if(firstS0) return kaoLessonStart(firstS0,'intro');
    }
    return true;
  }
  // K2F-30: tamamlanmış kullanıcı için başlangıç noktasını değiştirme (ilk açılışın 2. adımı); yalnız onboarding.start yazılır.
  function kaoOnboardChangeLeave(ui,q,start){
    ui.kaoOnboard=null; ui.kaoAudioFailed=false;
    if(start&&start!==q.onboarding.start){ q.onboarding.start=start; kaoSave(); }
    kaoApplyView(ui,'settings',null,'open');
    if(quranLearnSurfaceDeps&&typeof quranLearnSurfaceDeps.focusDialog==='function') quranLearnSurfaceDeps.focusDialog('sey-ov-card');
    return true;
  }
  function kaoOnboardChangeStart(ui,q){
    if(!q.onboarding.doneAt) return false;
    kaoApplyView(ui,'home',null,'open');
    ui.kaoOnboard=Object.assign(kaoOnboardState(),{step:2,change:true});
    quranLearnDeps.render();
    if(quranLearnSurfaceDeps&&typeof quranLearnSurfaceDeps.focusDialog==='function') quranLearnSurfaceDeps.focusDialog('sey-ov-card');
    return true;
  }
  function kaoOnboardChangeStep(ui,q,st,action,value){
    var done;
    if(action==='skip'||(action==='back'&&st.step===2)) done=kaoOnboardChangeLeave(ui,q,null);
    else done=kaoOnboardMove(ui,st,action,value)||kaoOnboardPlacement(ui,st,action,value);
    if(done&&st.step===3) kaoOnboardChangeLeave(ui,q,kaoOnboardStart(st));
    return done;
  }
  function kaoOnboard(action,value){
    if(!quranLearnDeps) return false;
    var ui=quranLearnDeps.ui(),q=ensureQuranLearn(quranLearnDeps.data()),st=ui.kaoOnboard,changed=false;
    if(action==='whats-new-close'){ if(ui.kaoWhatsNew!==true) return false; ui.kaoWhatsNew=false; quranLearnDeps.render(); return true; }
    if(!q) return false;
    if(action==='change-start') return kaoOnboardChangeStart(ui,q);
    if(kaoOnboardActive(ui)&&st.change===true){ changed=kaoOnboardChangeStep(ui,q,st,action,value); if(changed) quranLearnDeps.render(); return changed; }
    if(q.onboarding.doneAt) return false;
    if(action==='start'){ ui.kaoOnboard=kaoOnboardState(); kaoApplyView(ui,'home',null,'open'); quranLearnDeps.render(); return true; }
    if(!kaoOnboardActive(ui)) return false;
    if(action==='skip') changed=kaoOnboardCommit(ui,q,st,true);
    else if(action==='finish') changed=st.step===3&&kaoOnboardCommit(ui,q,st,false);
    else changed=kaoOnboardMove(ui,st,action,value)||kaoOnboardPlacement(ui,st,action,value)||kaoOnboardRhythm(st,action,value);
    if(changed) quranLearnDeps.render();
    return changed;
  }
  function kaoOnboardAction(action,value){ return {name:'kaoOnboard',args:value===undefined?[action]:[action,value]}; }
  function kaoOnboardBody(ui,st){
    var unit1=window.QuranCurriculumV2&&Array.isArray(window.QuranCurriculumV2.units)&&window.QuranCurriculumV2.units[0],unitTitle=unit1&&unit1.title?String(unit1.title):'Fâtiha';
    if(st.step===1){ var facts=kaoOnboardFacts(); return {progress:'1/3',title:'Namazda söylediklerini anlamaya başla',points:[{icon:'book-open',title:facts.words+' kelime',text:'Bu kelimeler Kur’an metninin %'+facts.percent+' kadarını oluşturur.'},{icon:'repeat',title:'Önce öğren, sonra akıllı tekrar',text:'Her kelime, unutmaya yaklaştığın anda yeniden karşına çıkar.'},{icon:'mosque',title:unitTitle+'’dan başla',text:'Her gün namazda söylediğin metinleri anlayarak ilerlersin.'}],primary:{label:'Başlayalım',action:kaoOnboardAction('next')}}; }
    if(st.step===2) return {progress:st.change?'':'2/3',back:kaoOnboardAction('back'),title:'Arapça harfleri okuyabiliyor musun?',lead:'Doğru ya da yanlış yok; yalnız başlangıç yerini buluyoruz.',options:[{title:'Henüz değil',sub:'Harflerle başlayalım · 12 kısa ders',action:kaoOnboardAction('choose','none')},{title:'Harekeyle, yavaşça',sub:'2 dakikalık kısa kontrol',action:kaoOnboardAction('choose','slow')},{title:'Evet, rahat okurum',sub:'Seviye 1 · '+unitTitle,action:kaoOnboardAction('choose','fluent')}]};
    if(st.step==='placement') return kaoPlacementBody(ui,st);
    var start=kaoOnboardStart(st),r=st.result&&st.result.record;
    var note=r?'Okuma '+r.reading+'/'+r.readingTotal+(start==='level1'?' · '+unitTitle+'’dan başlıyoruz.':' · önce '+r.missing.length+' kısa harf dersi.')+(r.audioDeferred?' Ses çalmadığı için karar okumaya göre verildi.':''):'';
    return {progress:'3/3',back:kaoOnboardAction('back'),title:'Günde ne kadar?',lead:'Seçimlerini sonra Ayarlar’dan değiştirebilirsin.',note:note,
      fields:[{label:'Günlük süre',items:KAO_ONBOARD_MINUTES.map(function(n){ return {label:n+' dk',pressed:st.minutes===n,action:kaoOnboardAction('minutes',n)}; }),hint:'Günde ~'+st.minutes+' yeni kelime'},
        {label:'Ne zaman?',items:KAO_ONBOARD_INTENTS.map(function(pair){ return {label:pair[1],pressed:st.intent===pair[0],action:kaoOnboardAction('intent',pair[0])}; }),hint:'Bir niyet; bildirim gönderilmez.'},
        {kind:'switch',label:'Sesli öğren',on:st.audio!==false,action:kaoOnboardAction('audio')}],
      primary:{label:start==='s0'?'Harflerle başla':unitTitle+' ile başla',action:kaoOnboardAction('finish')}};
  }
  function kaoPlacementBody(ui,st){
    var tasks=kaoPlacementTasks(),p=st.placement,listening=p.phase==='listening',task=(listening?tasks.listening:tasks.reading)[p.index]||null,model={progress:st.change?'':'2/3',back:kaoOnboardAction('back'),title:listening?'Kısa dinleme kontrolü':'Kısa okuma kontrolü',lead:listening?'Sesi dinle, duyduğun harfi seç.':'Doğru okunuşu seç; utanma yok, yalnız yerini buluyoruz.'};
    if(!task) return model;
    if(!listening){ model.task={kicker:'Okuma '+(p.index+1)+'/'+tasks.reading.length,ar:task.ar,prompt:'Doğru okunuşu seç',choices:task.choices.map(function(choice){ return {label:choice,action:kaoOnboardAction('answer',choice)}; })}; return model; }
    model.task={kicker:'Dinleme '+(p.index+1)+'/'+tasks.listening.length,prompt:'Hangi harf?',audio:{label:'Sesi dinle',action:kaoOnboardAction('play',task.pairId)},choices:task.choices.map(function(choice){ return {label:choice.ar,lang:'ar',action:kaoOnboardAction('answer',choice.id)}; }),extra:ui.kaoAudioFailed===true?{label:'Ses çalmıyor · dinlemeyi atla',action:kaoOnboardAction('audio-skip')}:null};
    if(ui.kaoAudioFailed===true) model.note='Ses yüklenemedi; karar okumaya göre verilir.';
    return model;
  }
  function kaoOnboardHTML(){
    if(!quranLearnDeps) return '';
    var ui=quranLearnDeps.ui(),st=kaoOnboardActive(ui)?ui.kaoOnboard:kaoOnboardState();
    return kaoViewsApi().onboardScreen(Object.assign({skip:kaoOnboardAction('skip'),skipLabel:st.change?'Vazgeç':'Atla'},kaoOnboardBody(ui,st)));
  }
  // 02 §5.8 uygulama niyeti: bugünün namaz vakitleri yalnız okunur (days[bugün].prayer; yazma/gün kaydı yok, bildirim yok).
  var KAO_INTENT_PRAYERS=[['fajr','sabah'],['dhuhr','öğle'],['asr','ikindi'],['maghrib','akşam'],['isha','yatsı']]; function kaoIntentSuggestion(d,nowValue,today,intent){ var now=validDate(nowValue,'now'),day=objectOr(objectOr(d&&d.days,{})[today],{}),times=objectOr(day.prayer,{}),minutes=now.getHours()*60+now.getMinutes(),any=false,next=null,chosen=null; function clock(m,pair){ return pair[1]+' namazından sonra 5 dakika ('+(m[1].length<2?'0':'')+m[1]+':'+m[2]+')'; } KAO_INTENT_PRAYERS.forEach(function(pair){ var m=/(\d{1,2}):(\d{2})/.exec(String(objectOr(times[pair[0]],{}).time||'')); if(!m) return; any=true; if(pair[0]===intent) chosen=(Number(m[1])*60+Number(m[2])>minutes?'':'yarın ')+clock(m,pair); if(!next&&Number(m[1])*60+Number(m[2])>minutes) next=clock(m,pair); }); return chosen||(any?(next||'yarın sabah namazından sonra 5 dakika'):''); }
  // KAO2-10 · 05 §8 hub kartı: nextStep'ten tek bilgi + tek eylem; halka gerçek ünite ilerlemesi.
  // Ana sekme render'ında çalışır: veri yazmaz (normalizasyon kopyada) ve motor/müfredat eksikse sade karta düşer.
  var KAO_HUB_TITLE='Kur’an Arapçası';
  function kaoDueBefore(q,limitMs){
    var cards=objectOr(q.cards,{}),n=0;
    Object.keys(cards).forEach(function(id){ var card=objectOr(cards[id],{}),due=new Date(card.due||0).getTime(); if(card.orphan!==true&&card.state!=='new'&&card.st!=='new'&&isFinite(due)&&due<limitMs) n+=1; });
    return n;
  }
  function kaoHubModel(d,now){
    var flow=window.SeymaQuranLearnFlow,curriculum=window.QuranCurriculumV2;
    if(!flow||typeof flow.nextStep!=='function'||typeof flow.unitProgress!=='function'||!curriculum||!Array.isArray(curriculum.units)||!curriculum.units.length) return {title:KAO_HUB_TITLE,subtitle:'Kaldığın yerden devam et',action:'Aç',ring:null};
    var q=ensureQuranLearn({quranLearn:cloneValue(objectOr(d.quranLearn,null))}),content=kaoLessonContent();
    var step=flow.nextStep({quranLearn:q,night:kaoNightWindow(d,now)},now,content);
    if(step.kind==='onboarding') return {title:KAO_HUB_TITLE,subtitle:'Namazda söylediklerini anlamaya başla · 5 dk',action:'Başla',ring:null};
    var at=kaoCurrentUnit(q,flow,content),pct=at.progress.lessons?Math.round(at.progress.lessonsDone/at.progress.lessons*100):0;
    var ring=pct>0?{value:pct,label:'Ünite '+at.unit.id+' ilerlemesi'}:null;
    if(step.kind==='night-review') return {title:KAO_HUB_TITLE,subtitle:'Uyumadan önce '+step.counts.reviews+' kart · '+step.minutes+' dk',action:'Tekrar et',ring:ring};
    if(step.kind==='rest'){
      var tomorrow=kaoDueBefore(q,new Date(now.getFullYear(),now.getMonth(),now.getDate()+2).getTime());
      return {title:KAO_HUB_TITLE+' ✓',subtitle:'Bugünlük tamam'+(tomorrow>0?' · yarın '+tomorrow+' tekrar':''),action:'Aç',ring:ring};
    }
    var lesson=(step.kind==='daily'||step.kind==='next-unit')&&typeof curriculum.byLesson==='function'?curriculum.byLesson(step.param):null;
    var today=quranLearnDeps.todayStr(),answered=Math.floor(nonNegativeNumber(objectOr(q.daily[today],{}).answered,0)),intent=answered?'':kaoIntentSuggestion(d,now,today,q.onboarding&&q.onboarding.intent);
    return {title:KAO_HUB_TITLE+' · '+(step.kind==='s0-lesson'?'Harfler':'Ünite '+at.unit.id),subtitle:intent?'Niyet önerisi: '+intent:'Sıradaki: '+(lesson?kaoSafeLessonTitle(lesson):step.title)+' · '+step.minutes+' dk',action:'Devam',ring:ring};
  }
  function kaoHubCardHTML(){
    if(!quranLearnDeps) return '';
    var d=quranLearnDeps.data()||{},raw=objectOr(d.quranLearn,{}),hidden=!!(raw.settings&&raw.settings.kaoVisible===false);
    // Arapça sekmesi KAO'ya tek giriş: gizliyken boş bırakmak kullanıcıyı çıkmaza sokar → aynı düğme geri getirme kartı olur (mevcut kaoToggleVisible). Başka yerde kart gizli kalır.
    if(hidden&&quranLearnDeps.ui().faithTab!=='arapca') return '';
    var views=kaoViewsApi(),model,label,inner,id,call;
    if(hidden){
      id='kao-hub-restore'; call='App.kaoToggleVisible()'; label='Kur’an Arapçası ders kartı gizli; yeniden göstermek için dokun';
      inner=typeof views.hubCard==='function'?views.hubCard({title:'Ders kartı gizli',subtitle:'Gizlemiştin; dokunursan ders alanı yeniden görünür.',action:'Göster'}):'<span class="kao-hub-title">Ders kartı gizli · Göster</span>';
    }else{
      model=kaoHubModel(d,new Date()); id='kao-hub-entry'; call='App.kaoOpen()';
      label='Kur’an Arapçası Öğreniyorum; '+model.subtitle+(model.ring?'; '+model.ring.label+' %'+model.ring.value:'')+'; '+model.action;
      inner=typeof views.hubCard==='function'?views.hubCard(model):'<span class="kao-hub-title">'+quranLearnDeps.esc(model.title)+'</span>';
    }
    return '<button type="button" id="'+id+'" class="kao-hub-card" onclick="'+call+'"'+(hidden?'':' aria-haspopup="dialog"')+' aria-label="'+quranLearnDeps.esc(label)+'">'+inner+'</button>';
  }
  var KAO_HOME_TITLE="Kur'an Arapçası";
  var KAO_VIEW_TITLES={home:KAO_HOME_TITLE,units:'Yol',unit:'Ünite',word:'Kelime',reader:'Sûre',settings:'Ayarlar',phonics:'Telaffuz',ayah:'Günün âyeti',prayer:'Namazda ne diyorum',stats:'İlerleme',gate:'Harf kontrolü',session:'Oturum',grammar:'Gramer notları',concept:'Kavram',roots:'Kök aileleri',s0:'Harfler',sources:'Hakkında ve kaynaklar'};
  function kaoFlowApi(){
    var flow=window.SeymaQuranLearnFlow;
    if(!flow||flow.version!==1||typeof flow.createStack!=='function'||typeof flow.openStack!=='function'||typeof flow.push!=='function'||typeof flow.reset!=='function'||typeof flow.replaceTop!=='function'||typeof flow.current!=='function'||typeof flow.previous!=='function'||typeof flow.back!=='function') throw new Error('KAO2-04: gezinme akışı yüklenmedi');
    return flow;
  }
  function kaoRouteParam(ui,view,param){
    if(param!==undefined&&param!==null) return param;
    if(view==='unit') return ui.kaoUnitId||null;
    if(view==='word') return ui.kaoWordId||null;
    if(view==='concept') return ui.kaoConceptId||null;
    if(view==='reader') return Number(ui.kaoSurahId)||114;
    return null;
  }
  function kaoViewTitle(view,param,ui){
    var value=param===undefined||param===null?kaoRouteParam(ui||{},view,param):param;
    if(view==='word'){
      var lex=window.QuranLexiconV1,lemma=lex&&typeof lex.byId==='function'?lex.byId(String(value||'')):null;
      return lemma&&lemma.verified===true&&lemma.translit?String(lemma.translit):'Kelime';
    }
    if(view==='reader'){
      var surah=kaoSurahs().find(function(item){ return item.id===Number(value); });
      return surah?String(surah.name):'Sûre';
    }
    if(view==='unit'){
      var unit=kaoCurriculumUnit(value);
      return unit?kaoUnitTitle(unit):'Ünite';
    }
    if(view==='concept'){
      var grammar=window.QuranGrammarV1,concept=grammar&&typeof grammar.byId==='function'?grammar.byId(String(value||'')):null;
      return concept&&concept.title?String(concept.title):'Kavram';
    }
    return KAO_VIEW_TITLES[view]||KAO_HOME_TITLE;
  }
  function kaoEnsureStack(ui){
    var flow=kaoFlowApi(),view=typeof ui.kaoView==='string'&&KAO_VIEW_TITLES[ui.kaoView]?ui.kaoView:'home';
    if(!Array.isArray(ui.kaoStack)){
      var param=kaoRouteParam(ui,view,null),title=kaoViewTitle(view,param,ui);
      ui.kaoStack=view==='home'?flow.createStack(KAO_HOME_TITLE):flow.openStack(view,param,title,KAO_HOME_TITLE);
    }
    var current=flow.current(ui.kaoStack,KAO_HOME_TITLE);
    if(!current){ ui.kaoStack=flow.createStack(KAO_HOME_TITLE); current=flow.current(ui.kaoStack,KAO_HOME_TITLE); }
    if(view!==current.view){
      var nextParam=kaoRouteParam(ui,view,null),nextTitle=kaoViewTitle(view,nextParam,ui);
      ui.kaoStack=view==='home'?flow.createStack(KAO_HOME_TITLE):flow.reset(view,nextParam,nextTitle,KAO_HOME_TITLE);
      current=flow.current(ui.kaoStack,KAO_HOME_TITLE);
    }
    ui.kaoView=current.view;
    return ui.kaoStack;
  }
  function kaoApplyView(ui,view,param,mode){
    if(!KAO_VIEW_TITLES[view]) return null;
    if(ui.kaoOnboard&&ui.kaoOnboard.change===true) ui.kaoOnboard=null;
    var routeView=view==='unit'?'units':(view==='concept'?'grammar':view),flow=window.SeymaQuranLearnFlow,resolved=kaoRouteParam(ui,view,param),title=kaoViewTitle(view,resolved,ui),stack;
    if(view==='word'&&resolved!==null) ui.kaoWordId=String(resolved);
    if(view==='unit'&&resolved!==null) ui.kaoUnitId=String(resolved);
    if(view==='concept'&&resolved!==null) ui.kaoConceptId=String(resolved);
    if(view==='reader'&&resolved!==null) ui.kaoSurahId=Number(resolved);
    if(!flow){ ui.kaoView=routeView; return {view:routeView,param:resolved,title:title}; }
    if(flow.version!==1||typeof flow.createStack!=='function'||typeof flow.openStack!=='function'||typeof flow.push!=='function'||typeof flow.reset!=='function'||typeof flow.replaceTop!=='function'||typeof flow.current!=='function'||typeof flow.previous!=='function'||typeof flow.back!=='function') throw new Error('KAO2-04: gezinme akışı geçersiz');
    if(mode==='open') stack=routeView==='home'?flow.createStack(KAO_HOME_TITLE):flow.openStack(routeView,resolved,title,KAO_HOME_TITLE);
    else if(mode==='reset') stack=flow.reset(routeView,resolved,title,KAO_HOME_TITLE);
    else if(mode==='replace') stack=flow.replaceTop(kaoEnsureStack(ui),routeView,resolved,title,KAO_HOME_TITLE);
    else stack=flow.push(kaoEnsureStack(ui),routeView,resolved,title,KAO_HOME_TITLE);
    ui.kaoStack=stack;
    var current=flow.current(stack,KAO_HOME_TITLE);
    ui.kaoView=current.view;
    return current;
  }
  function kaoViewsApi(){
    if(quranLearnViewRegistry) return quranLearnViewRegistry;
    var views=window.SeymaQuranLearnViews;
    if(!views||views.version!==1||typeof views.register!=='function'||typeof views.renderScreen!=='function') throw new Error('KAO2-04: görünüm kayıt sistemi yüklenmedi');
    if(!quranLearnDeps||!views.register({esc:quranLearnDeps.esc,icon:quranLearnDeps.icon})) throw new Error('KAO2-04: görünüm bağımlılıkları kurulamadı');
    quranLearnViewRegistry=views;
    return quranLearnViewRegistry;
  }
  function kaoNav(view,param){
    view=kaoViewAlias(view);
    if(!quranLearnDeps||!KAO_VIEW_TITLES[view]) return false;
    var ui=quranLearnDeps.ui(),resolved=kaoRouteParam(ui,view,param);
    if(view==='word'){
      var lex=window.QuranLexiconV1,lemma=lex&&typeof lex.byId==='function'?lex.byId(String(resolved||'')):null;
      if(!lemma||lemma.verified!==true) return false;
    }
    if(view==='unit'&&!kaoCurriculumUnit(resolved)) return false;
    if(view==='concept'&&!kaoGrammarConcept(resolved)) return false;
    if(view==='reader'&&!kaoSurahs().some(function(item){ return item.id===Number(resolved); })) return false;
    if(view==='roots'&&resolved!==null){ var lexr=window.QuranLexiconV1,mapr=lexr&&lexr.roots||{}; if(!rootDetail(String(resolved))&&!mapr[String(resolved)]) return false; }
    if(view==='home') kaoApplyView(ui,'home',null,'reset');
    else kaoApplyView(ui,view,resolved,ui.kaoView===view?'replace':'push');
    quranLearnDeps.render();
    return true;
  }
  function kaoBack(){
    if(!quranLearnDeps) return false;
    var ui=quranLearnDeps.ui(),flow=kaoFlowApi(),result=flow.back(kaoEnsureStack(ui),KAO_HOME_TITLE);
    if(!result.changed) return false;
    ui.kaoStack=result.stack;
    ui.kaoView=result.entry.view;
    if(result.entry.view==='word'&&result.entry.param!==null) ui.kaoWordId=String(result.entry.param);
    if(result.entry.view==='reader'&&result.entry.param!==null) ui.kaoSurahId=Number(result.entry.param);
    quranLearnDeps.render();
    return true;
  }
  function kaoOverlayHTML(nowValue){
    if(!quranLearnDeps) return '';
    var ui=quranLearnDeps.ui(),stack=kaoEnsureStack(ui),flow=kaoFlowApi(),current=flow.current(stack,KAO_HOME_TITLE),previous=flow.previous(stack,KAO_HOME_TITLE);
    var view=current.view,unitDetail=view==='units'&&current.param!==null,onboarding=view==='home'&&kaoOnboardActive(ui),screenView=unitDetail?'unit':(view==='grammar'&&current.param!==null?'concept':view),body=(view==='sources'?kaoSourcesPageHTML():view==='s0'?kaoS0HTML():view==='roots'?kaoRootsHTML():onboarding?kaoOnboardHTML():view==='home'?kaoHomeHTML(nowValue):(view==='units'?(unitDetail?kaoUnitHTML(current.param):kaoPathHTML()):(view==='grammar'?(current.param!==null?kaoConceptHTML(current.param):kaoGrammarHTML()):(view==='word'?kaoWordHTML():(view==='reader'?kaoReaderHTML():(view==='gate'?kaoGateHTML():(view==='settings'?kaoSettingsHTML():(view==='phonics'?kaoPhonicsHTML():(view==='ayah'?kaoAyahHTML():(view==='map'?kaoMapHTML():(view==='prayer'?kaoPrayerHTML():(view==='stats'?kaoStatsHTML(nowValue):'<main class="kao-session">'+kaoLessonHTML()+'</main>'))))))))))));
    body=kaoViewsApi().renderScreen({exit:{name:'kaoLesson',args:['exit']},exitLabel:ui.kaoLesson?'Dersten çık':'Oturumdan çık',view:onboarding?'onboard':screenView,title:onboarding?KAO_ONBOARD_TITLE:(current.title||kaoViewTitle(screenView,current.param,ui)),previousTitle:previous&&previous.title||KAO_HOME_TITLE,body:body});
    var titleId=/class="kao-largetitle">[\s\S]*?<h2\b[^>]*\sid="([^"]+)"/.exec(body),dialogName=titleId?'aria-labelledby="'+titleId[1]+'"':'aria-label="Kur’an Arapçası · günlük oturum"';
    return '<div id="sey-ov-back" class="kao-overlay" onclick="App.kaoClose()"><div id="sey-ov-card" class="kao-dialog" style="'+kaoReadabilityStyle()+'" role="dialog" aria-modal="true" '+dialogName+' tabindex="-1" onkeydown="App.onModalKeydown(event,App.kaoClose)" onclick="event.stopPropagation()"><div id="sey-ov-body" class="kao-body scroll" style="'+kaoReadabilityStyle()+'">'+body+'</div></div></div>';
  }
  function kaoMount(nowValue){
    if(!quranLearnDeps||!quranLearnSurfaceDeps||!quranLearnDeps.ui().kaoOpen) return false;
    quranLearnSurfaceDeps.mount(kaoOverlayHTML(nowValue));
    return true;
  }
  function kaoOpen(view){
    if(!quranLearnDeps||!quranLearnSurfaceDeps) return false;
    var ui=quranLearnDeps.ui();
    ui.kaoReturnFocusId=quranLearnSurfaceDeps.activeElementId()||'';
    var target=typeof view==='string'&&KAO_VIEW_TITLES[view]?view:'home',q=ensureQuranLearn(quranLearnDeps.data());
    ui.kaoWhatsNew=false; ui.kaoOnboard=null;
    // 05 §3/§9: ilk açılış yalnız kartsız ve doneAt boş kullanıcıda ana ekranın yerini alır; legacy kullanıcıya not bir kez (gösterildiği an kaydedilir).
    if(target==='home'&&q&&!q.onboarding.doneAt) ui.kaoOnboard=kaoOnboardState();
    else if(target==='home'&&q&&q.onboarding.doneAt==='legacy'&&!q.onboarding.whatsNewAt){ q.onboarding.whatsNewAt=new Date().toISOString(); ui.kaoWhatsNew=true; kaoSave(); }
    kaoApplyView(ui,target,kaoRouteParam(ui,target,null),'open');
    ui.kaoOpen=true;
    quranLearnSurfaceDeps.lockBody(); quranLearnDeps.render(); quranLearnSurfaceDeps.focusDialog('sey-ov-card');
    return true;
  }
  function kaoClose(){
    if(!quranLearnDeps||!quranLearnSurfaceDeps) return false;
    var body=function(){
      var ui=quranLearnDeps.ui(),returnId=ui.kaoReturnFocusId||'';
      kaoShadowCleanup(); quranLearnSurfaceDeps.unlockBody(); ui.kaoOpen=false; ui.kaoStack=[]; ui.kaoView='home'; ui.kaoReturnFocusId=''; ui.kaoWhatsNew=false; ui.kaoOnboard=null;
      quranLearnDeps.render(); if(returnId) quranLearnSurfaceDeps.restoreFocus(returnId);
    };
    quranLearnSurfaceDeps.sheetClose('sey-ov-card','sey-ov-back',body);
    return true;
  }
  // KAO2-24 (S-12): ayrı harita görünümü kaldırıldı; tek İlerleme ekranına akar.
  // Tek noktadan takma ad: hem SetView hem Nav aynı kuralı uygular.
  function kaoViewAlias(view){ return view==='map'?'stats':view; }
  function kaoSetView(view){
    view=kaoViewAlias(view);
    if(!quranLearnDeps||!KAO_VIEW_TITLES[view]) return false;
    kaoShadowCleanup(); var ui=quranLearnDeps.ui(),param=kaoRouteParam(ui,view,null);
    if(view==='word'&&param){ var lex=window.QuranLexiconV1,lemma=lex&&typeof lex.byId==='function'?lex.byId(String(param)):null; if(!lemma||lemma.verified!==true) return false; }
    if(view==='reader'&&!kaoSurahs().some(function(item){ return item.id===Number(param); })) return false;
    if(view==='unit'&&!kaoCurriculumUnit(param)) return false;
    if(view==='concept'&&!kaoGrammarConcept(param)) return false;
    kaoApplyView(ui,view,param,'reset'); quranLearnDeps.render();
    return true;
  }
  function emptyQuranLearn(){
    return {
      schemaVersion:SCHEMA_VERSION,
      lexiconVersion:LEXICON_VERSION,
      startedAt:null,
      gate:{passed:false,skipped:false,score:null,at:null},
      settings:{dailyNew:KAO_ONBOARD_MINUTES[0],audio:false,autoAdvance:false,audioStyle:'measured',harakat:true,translit:true,translitLayer:'tr',shadowing:false,kaoVisible:true},
      cards:{},units:{},surahs:{},daily:{},
      milestones:KAO_MILESTONE_SHAPE(),
      phonics:{style:'muallim',misheard:{}},
      errors:{sound:0,root:0,affix:0,cognate:0,rule:0,order:0},
      ayahs:{understood:[]},
      readability:{lineHeight:'normal',wordSpacing:'normal',coloredHarakat:true,fadeHarakat:false},
      summary:null
    };
  }
  function currentCardId(id){
    var match,lex=window.QuranLexiconV1,grammar=window.QuranGrammarV1,shorts=window.QuranShortSurahsV1;
    match=String(id||'').match(/^w:([^:]+):(ar>tr|tr>ar)$/);
    if(match) return !!((lex&&typeof lex.byId==='function'&&lex.byId(match[1]))||(shorts&&typeof shorts.lemmaById==='function'&&shorts.lemmaById(match[1])));
    match=String(id||'').match(/^r:(.+)$/);
    if(match) return !!(lex&&lex.roots&&lex.roots[match[1]]);
    match=String(id||'').match(/^g:([^:]+):(.+)$/);
    if(match) return !!(grammar&&typeof grammar.byId==='function'&&grammar.byId(match[1]));
    match=String(id||'').match(/^s:(\d+):(\d+):(\d+)$/);
    if(match&&shorts&&Array.isArray(shorts.words)) return shorts.words.some(function(item){
      return item.surahId===Number(match[1])&&item.ayah===Number(match[2])&&item.i===Number(match[3]);
    });
    return false;
  }
  function markOrphans(cards){
    Object.keys(cards).forEach(function(id){
      var card=cards[id];
      if(!card||typeof card!=='object'||Array.isArray(card)) return;
      if(!currentCardId(id)) card.orphan=true;
      else if(card.orphan===true) delete card.orphan;
    });
  }
  function normalizeUnderstood(value){
    var seen=Object.create(null),out=[];
    (Array.isArray(value)?value:[]).forEach(function(ref){
      if(typeof ref!=='string'||!ref||seen[ref]||out.length>=400) return;
      seen[ref]=1; out.push(ref);
    });
    return out;
  }
  function ensureQuranLearn(d){
    if(!d||typeof d!=='object'||Array.isArray(d)) return null;
    if(!d.quranLearn||typeof d.quranLearn!=='object'||Array.isArray(d.quranLearn)) d.quranLearn=emptyQuranLearn();
    var q=d.quranLearn,previousVersion=q.lexiconVersion;
    q.schemaVersion=SCHEMA_VERSION;
    q.lexiconVersion=LEXICON_VERSION;
    q.startedAt=nullableString(q.startedAt);

    q.gate=objectOr(q.gate,{});
    q.gate.passed=boolOr(q.gate.passed,false);
    q.gate.skipped=boolOr(q.gate.skipped,false);
    q.gate.score=q.gate.score===null?null:nonNegativeNumber(q.gate.score,null);
    q.gate.at=nullableString(q.gate.at);

    q.settings=objectOr(q.settings,{});
    q.settings.dailyNew=nonNegativeNumber(q.settings.dailyNew,KAO_ONBOARD_MINUTES[0]);
    q.settings.audio=boolOr(q.settings.audio,false);
    q.settings.autoAdvance=boolOr(q.settings.autoAdvance,false);
    q.settings.harakat=boolOr(q.settings.harakat,true);
    q.settings.translit=boolOr(q.settings.translit,true);
    if(q.settings.audioStyle!=='flowing') q.settings.audioStyle='measured';
    if(q.settings.translitLayer!=='dia') q.settings.translitLayer='tr';
    q.settings.shadowing=q.settings.shadowing===true;
    q.settings.kaoVisible=q.settings.kaoVisible!==false;

    q.cards=objectOr(q.cards,{});
    q.units=objectOr(q.units,{});
    q.surahs=objectOr(q.surahs,{});
    q.daily=objectOr(q.daily,{});

    q.milestones=objectOr(q.milestones,{});
    // KAO2-16 · 07 §6: besmele ve ünite taşları (u1…u12) tanınır; eski anahtarlar korunur.
    kaoMilestoneKeys().forEach(function(key){
      if(Object.prototype.hasOwnProperty.call(q.milestones,key)||KAO_MILESTONE_CORE[key]) q.milestones[key]=nullableString(q.milestones[key]);
    });

    q.phonics=objectOr(q.phonics,{});
    if(typeof q.phonics.style!=='string'||!q.phonics.style) q.phonics.style='muallim';
    q.phonics.misheard=objectOr(q.phonics.misheard,{});
    if(q.phonics.buckets!==undefined){ var bk0=objectOr(q.phonics.buckets,{}); q.phonics.buckets={}; ['B','C'].forEach(function(key){ var r=objectOr(bk0[key],{}),n=Math.floor(nonNegativeNumber(r.n,0)); q.phonics.buckets[key]={n:n,ok:Math.min(n,Math.floor(nonNegativeNumber(r.ok,0)))}; }); }
    if(q.phonics.self!==undefined){ var sf0=objectOr(q.phonics.self,{}),sn=Math.floor(nonNegativeNumber(sf0.n,0)); q.phonics.self={near:Math.min(sn,Math.floor(nonNegativeNumber(sf0.near,0))),n:sn}; }
    Object.keys(q.phonics.misheard).forEach(function(key){ var count=Math.floor(nonNegativeNumber(q.phonics.misheard[key],0)); if(count>0) q.phonics.misheard[key]=count; else delete q.phonics.misheard[key]; });
    Object.keys(q.phonics).forEach(function(key){ if(/^p:/.test(key)&&(!q.phonics[key]||typeof q.phonics[key]!=='object'||Array.isArray(q.phonics[key]))) delete q.phonics[key]; });

    q.errors=objectOr(q.errors,{});
    ['sound','root','affix','cognate','rule','order'].forEach(function(key){
      q.errors[key]=nonNegativeNumber(q.errors[key],0);
    });

    q.ayahs=objectOr(q.ayahs,{});
    q.ayahs.understood=normalizeUnderstood(q.ayahs.understood);
    if(q.transfer!==undefined){ var tr1=objectOr(q.transfer,{}),trN=Math.floor(nonNegativeNumber(tr1.n,0)); q.transfer={lastAt:typeof tr1.lastAt==='string'&&isFinite(new Date(tr1.lastAt).getTime())?tr1.lastAt:null,n:trN,ok:Math.min(trN,Math.floor(nonNegativeNumber(tr1.ok,0))),seen:Array.isArray(tr1.seen)?tr1.seen.filter(function(key){ return typeof key==='string'&&/^\d+:\d+$/.test(key); }).slice(-120):[]}; }

    q.readability=objectOr(q.readability,{});
    if(['normal','wide','compact','1.9','2.2','2.5'].indexOf(String(q.readability.lineHeight))<0) q.readability.lineHeight='normal';
    if(['normal','wide'].indexOf(q.readability.wordSpacing)<0) q.readability.wordSpacing='normal';
    q.readability.coloredHarakat=boolOr(q.readability.coloredHarakat,true);
    q.readability.fadeHarakat=boolOr(q.readability.fadeHarakat,false);
    q.summary=q.summary&&typeof q.summary==='object'&&!Array.isArray(q.summary)?q.summary:null;

    normalizeOnboarding(q);
    normalizePath(q);

    if(previousVersion!==LEXICON_VERSION) markOrphans(q.cards);
    return q;
  }
  // KAO2-08 (08 §1): yalnız ekleme; bilinmeyen alanlar korunur, bozuk tipler varsayılana döner.
  function isoOrNull(value){ return typeof value==='string'&&value&&isFinite(new Date(value).getTime())?value:null; }
  function scoreOrNull(value){ return typeof value==='number'&&isFinite(value)&&value>=0&&value<=1?value:null; }
  function normalizeOnboarding(q){
    var o=objectOr(q.onboarding,{});
    o.doneAt=o.doneAt==='legacy'?'legacy':isoOrNull(o.doneAt);
    if(o.doneAt===null&&Object.keys(q.cards).length>0) o.doneAt='legacy';
    o.start=['s0','placement','level1'].indexOf(o.start)>=0?o.start:null;
    o.minutes=[5,10,15].indexOf(o.minutes)>=0?o.minutes:5;
    o.intent=['fajr','dhuhr','asr','maghrib','isha','custom'].indexOf(o.intent)>=0?o.intent:null;
    o.whatsNewAt=isoOrNull(o.whatsNewAt);
    if(o.placement!==undefined) o.placement=normalizePlacement(o.placement);
    q.onboarding=o;
  }
  // KAO2-11: yerleştirme özeti (yalnız sayılar + S0 ders kimlikleri); eski kayda alan eklenmez.
  function countOrNull(value,max){ return typeof value==='number'&&isFinite(value)&&value>=0?Math.min(max,Math.floor(value)):null; }
  function normalizePlacement(p){
    if(!p||typeof p!=='object'||Array.isArray(p)) return null;
    var readingTotal=countOrNull(p.readingTotal,20),listeningTotal=countOrNull(p.listeningTotal,12),reading=countOrNull(p.reading,20),listening=countOrNull(p.listening,12);
    var missing=(Array.isArray(p.missing)?p.missing:[]).filter(function(id,i,list){ return typeof id==='string'&&/^s0\.\d{2}$/.test(id)&&list.indexOf(id)===i; }).sort();
    return {reading:reading===null||readingTotal===null?reading:Math.min(reading,readingTotal),readingTotal:readingTotal,listening:listening===null||listeningTotal===null?listening:Math.min(listening,listeningTotal),listeningTotal:listeningTotal,audioDeferred:p.audioDeferred===true,missing:missing,at:isoOrNull(p.at)};
  }
  var LEMMA_ID_PATTERN=/^l_[A-Za-z0-9_]+_[0-9a-f]{6}$/;
  function validLemmaIds(list){
    return Array.isArray(list)?list.filter(function(id,index){ return typeof id==='string'&&LEMMA_ID_PATTERN.test(id)&&list.indexOf(id)===index; }):[];
  }
  function normalizeRepair(value){
    if(!value||typeof value!=='object'||Array.isArray(value)||!Array.isArray(value.lemmaIds)) return null;
    return {lemmaIds:validLemmaIds(value.lemmaIds),at:isoOrNull(value.at)};
  }
  function normalizePath(q){
    var p=objectOr(q.path,{}),lessons=objectOr(p.lessons,{}),units=objectOr(p.units,{}),cleanLessons={},cleanUnits={};
    Object.keys(lessons).forEach(function(id){
      var rec=lessons[id];
      if(!rec||typeof rec!=='object'||Array.isArray(rec)) return;
      var normalized=Object.assign({},rec,{startedAt:isoOrNull(rec.startedAt),doneAt:isoOrNull(rec.doneAt),score:scoreOrNull(rec.score)});
      if(Array.isArray(rec.introducedLemmas)) normalized.introducedLemmas=rec.introducedLemmas.filter(function(lemmaId,index,list){ return typeof lemmaId==='string'&&/^l_[A-Za-z0-9_]+_[0-9a-f]{6}$/.test(lemmaId)&&list.indexOf(lemmaId)===index; });
      if(rec.resume&&typeof rec.resume==='object'&&!Array.isArray(rec.resume)&&['review','lesson','practice'].indexOf(rec.resume.phase)>=0&&typeof rec.resume.itemId==='string') normalized.resume={phase:rec.resume.phase,itemId:rec.resume.itemId.slice(0,180),lessonItemId:typeof rec.resume.lessonItemId==='string'?rec.resume.lessonItemId.slice(0,180):''};
      else if(Object.prototype.hasOwnProperty.call(rec,'resume')) normalized.resume=null;
      cleanLessons[id]=normalized;
    });
    Object.keys(units).forEach(function(id){
      var rec=units[id];
      if(!/^\d+$/.test(id)||!rec||typeof rec!=='object'||Array.isArray(rec)) return;
      // K2F-06: ustalık kaydı — yalnız ekleme/normalizasyon; bozuk tip güvenli varsayılana düşer, bilinmeyen alanlar korunur.
      cleanUnits[id]=Object.assign({},rec,{masteryAt:isoOrNull(rec.masteryAt),masteryScore:scoreOrNull(rec.masteryScore),attempts:typeof rec.attempts==='number'&&isFinite(rec.attempts)&&rec.attempts>0?Math.floor(rec.attempts):0,lastAttemptAt:isoOrNull(rec.lastAttemptAt),repair:normalizeRepair(rec.repair),skippedAt:isoOrNull(rec.skippedAt)});
    });
    p.lessons=cleanLessons; p.units=cleanUnits; q.path=p;
  }
  // KAO2-08: "sıradaki adım" tek doğruluk kaynağı; saf Flow'u gerçek veriyle çağırır.
  function kaoNextStepFor(d,now){
    var flow=window.SeymaQuranLearnFlow,curriculum=window.QuranCurriculumV2;
    if(!flow||typeof flow.nextStep!=='function'||!curriculum) throw new Error('KAO2-08: akış motoru ya da müfredat yüklenmedi');
    return flow.nextStep({quranLearn:ensureQuranLearn(d),night:kaoNightWindow(d,now)},now,kaoLessonContent());
  }
  function kaoNextStep(nowValue){
    if(!quranLearnDeps) return null;
    return kaoNextStepFor(quranLearnDeps.data(),validDate(nowValue===undefined?new Date():nowValue,'now'));
  }

  window.SeymaQuranLearn={
    schemaVersion:SCHEMA_VERSION,
    lexiconVersion:LEXICON_VERSION,
    fsrsWeights:FSRS_WEIGHTS.slice(),
    fsrsRequestRetention:FSRS_RETENTION,
    registerQuranLearn:registerQuranLearn,
    registerQuranLearnSurface:registerQuranLearnSurface,
    registerCaffeineTargetBed:registerCaffeineTargetBed,
    emptyQuranLearn:emptyQuranLearn,
    ensureQuranLearn:ensureQuranLearn,
    kaoGrade:kaoGrade,
    kaoSchedule:kaoSchedule,
    kaoBuildQueue:kaoBuildQueue,
    kaoDelayedCandidates:kaoDelayedCandidates,
    kaoPickDistractors:kaoPickDistractors,
    kaoBuildTask:kaoBuildTask,
    kaoGrammarCandidates:grammarCandidates,
    kaoBuildGrammarTask:kaoBuildGrammarTask,
    kaoGrammarTaskValid:kaoGrammarTaskValid,
    kaoGrammarSupport:kaoGrammarSupport,
    kaoFragmentCandidates:fragmentCandidates,
    kaoBuildFragmentTask:kaoBuildFragmentTask,
    kaoShouldAutoplay:kaoShouldAutoplay,
    kaoTaskHTML:kaoTaskHTML,
    kaoStart:kaoStart,
    kaoLesson:kaoLesson,
    kaoAnswer:kaoAnswer,
    kaoContinue:kaoContinue,
    kaoNextStep:kaoNextStep,
    kaoUndo:kaoUndo,
    kaoMilestoneCheck:kaoMilestoneCheck,
    kaoMilestoneLabel:kaoMilestoneLabel,
    kaoUnitTitle:kaoUnitTitle,
    kaoLessonTitle:kaoLessonTitle,
    kaoReviewLevel:kaoReviewLevel,
    kaoTextSourceLabel:kaoTextSourceLabel,
    kaoExplain:kaoExplain,
    kaoCurriculumLesson:kaoCurriculumLesson,
    kaoMilestoneLabels:kaoMilestoneLabels,
    kaoCandidates:kaoCandidates,
    kaoWeakClass:kaoWeakClass,
    kaoIntentSuggestion:kaoIntentSuggestion,
    kaoTransferCandidate:kaoTransferCandidate,
    kaoPlay:kaoPlay,
    kaoNightWindow:kaoNightWindow,
    kaoColorHarakat:kaoColorHarakat,
    kaoReadabilityStyle:kaoReadabilityStyle,
    kaoGateLessons:kaoGateLessons,
    kaoGateTasks:kaoGateTasks,
    kaoGate:kaoGate,
    kaoGateHTML:kaoGateHTML,
    kaoRootCatalog:kaoRootCatalog,
    kaoRootLemmaIds:kaoRootLemmaIds,
    kaoRootsModel:kaoRootsModel,
    kaoRootModel:kaoRootModel,
    kaoRootOpen:kaoRootOpen,
    kaoRoots:kaoRoots,
    kaoRootsHTML:kaoRootsHTML,
    kaoOpenRoots:kaoOpenRoots,
    kaoS0Lesson:kaoS0Lesson,
    kaoS0Start:kaoS0Start,
    kaoS0Play:kaoS0Play,
    safeClipId:safeClipId,
    kaoS0SyllableClipId:kaoS0SyllableClipId,
    kaoS0ClipPlan:kaoS0ClipPlan,
    kaoS0PositionTable:kaoS0PositionTable,
    kaoS0Model:kaoS0Model,
    kaoS0:kaoS0,
    kaoLessonStart:kaoLessonStart,
    kaoS0HTML:kaoS0HTML,
    kaoSourcesHTML:kaoSourcesHTML,
    kaoSourcesPageHTML:kaoSourcesPageHTML,
    kaoPathHTML:kaoPathHTML,
    kaoUnitHTML:kaoUnitHTML,
    kaoGrammarHTML:kaoGrammarHTML,
    kaoConceptHTML:kaoConceptHTML,
    kaoGrammarNoteModel:kaoGrammarNoteModel,
    kaoConceptModel:kaoConceptModel,
    kaoOpenWord:kaoOpenWord,
    kaoVerifiedAyahPronunciation:kaoVerifiedAyahPronunciation,
    kaoWordHTML:kaoWordHTML,
    kaoFlag:kaoFlag,
    kaoSurahs:kaoSurahs,
    kaoOpenSurah:kaoOpenSurah,
    kaoRevealWord:kaoRevealWord,
    kaoMarkUnderstood:kaoMarkUnderstood,
    kaoReaderHTML:kaoReaderHTML,
    kaoReader:kaoReader,
    kaoReaderScrollTarget:kaoReaderScrollTarget,
    kaoSurahCheck:kaoSurahCheck,
    kaoHubCardHTML:kaoHubCardHTML,
    kaoHomeHTML:kaoHomeHTML,
    kaoOnboard:kaoOnboard,
    kaoOnboardHTML:kaoOnboardHTML,
    kaoOnboardFacts:kaoOnboardFacts,
    kaoPlacementTasks:kaoPlacementTasks,
    kaoS0LessonOfLetter:kaoS0LessonOfLetter,
    kaoOverlayHTML:kaoOverlayHTML,
    kaoMount:kaoMount,
    kaoOpen:kaoOpen,
    kaoClose:kaoClose,
    kaoSetView:kaoSetView,
    kaoNav:kaoNav,
    kaoBack:kaoBack,
    kaoDiaReading:kaoDiaReading,
    kaoLemmaReading:kaoLemmaReading,
    kaoStripHarakat:kaoStripHarakat,
    kaoSetDailyNew:kaoSetDailyNew,
    kaoSetIntent:kaoSetIntent,
    kaoSetAudioStyle:kaoSetAudioStyle,
    kaoToggleHarakat:kaoToggleHarakat,
    kaoToggleFade:kaoToggleFade,
    kaoSetTranslit:kaoSetTranslit,
    kaoSetReadability:kaoSetReadability,
    kaoReopenGate:kaoReopenGate,
    kaoCsv:kaoCsv,
    kaoExportCsv:kaoExportCsv,
    kaoSettingsHTML:kaoSettingsHTML,
    kaoMahrecSvg:kaoMahrecSchemas(),
    kaoPhonicsTasks:kaoPhonicsTasks,
    kaoPhonics:kaoPhonics,
    kaoPhonicsAttention:kaoPhonicsAttention,
    kaoPhonicsHTML:kaoPhonicsHTML,
    kaoOpenPhonics:kaoOpenPhonics,
    kaoStats:kaoStats,
    kaoStatsHTML:kaoStatsHTML,
    kaoProgressModel:kaoProgressModel,
    kaoCurrentUnit:kaoCurrentUnit,
    KAO_VIEW_TITLES:KAO_VIEW_TITLES,
    kaoCoverageCurve:kaoCoverageCurve,
    kaoCoverageAt:kaoCoverageAt,
    kaoPanelSummary:kaoPanelSummary,
    kaoSoundClass:kaoSoundClass,
    kaoKnownLemmaSet:kaoKnownLemmaSet,
    kaoCoverage:kaoCoverage,
    kaoAyahGroups:kaoAyahGroups,
    kaoPickAyah:kaoPickAyah,
    kaoNearestAyah:kaoNearestAyah,
    kaoOpenAyah:kaoOpenAyah,
    kaoAyah:kaoAyah,
    kaoAyahHTML:kaoAyahHTML,
    kaoSurahMap:kaoSurahMap,
    kaoOpenMap:kaoOpenMap,
    kaoMapHTML:kaoMapHTML,
    kaoPrayerStats:kaoPrayerStats,
    kaoLevel1Ready:kaoLevel1Ready,
    kaoOpenPrayer:kaoOpenPrayer,
    kaoPrayerWord:kaoPrayerWord,
    kaoPrayerHTML:kaoPrayerHTML,
    kaoRecordStart:kaoRecordStart,
    kaoRecordStop:kaoRecordStop,
    kaoRecordPlay:kaoRecordPlay,
    kaoRecordDiscard:kaoRecordDiscard,
    kaoToggleAutoAdvance:kaoToggleAutoAdvance,
    kaoToggleShadowing:kaoToggleShadowing,
    kaoToggleVisible:kaoToggleVisible,
    kaoShadowHTML:kaoShadowHTML,
    kaoShadowCleanup:kaoShadowCleanup
  };
})();
