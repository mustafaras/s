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
  var KAO_SEMANTIC_CLUSTERS={
    SOZ_EMIR:['l_qaAla_657dd3','l_amor_9fbe48','l_qawol_58e075','l_amara_3fab3c'],
    IMAN_KUFUR:['l_aAmana_966a5c','l_kafara_af1746','l_mu_omin_870b47','l_ka_firuwn_165d2d','l_a_oraka_c73d6e','l_anfaqa_0b12ad','l_iyma_n_4151c0','l_mu_orik_2ba276','l_ariyk_5de5f5','l_kufor_1c9ee6','l_kaAfir_9b3cf0','l_muna_fiquwn_bdda5c','l_m_u_omina_t_b9c5a2','l_amina_0a79a6'],
    ILIM_CEHALET:['l_Ealima_ceb6d7','l_Ealiym_c50d0d','l_Eilom_2f0f9d','l_Ea_lamiyn_c337cf','l_aEolam_db561d','l_Eaqalu_36636d','l_Eal_ama_5c04b6'],
    AMEL_KARSILIK:['l_Ea_aAb_4b9936','l_Eamila_50319c','l_ajor_c798df','l_Eamal_8215bb','l_Hasiba_a4ca56','l_Ea_aba_be4552','l_HisaAb_b41eae'],
    NEFIS_KALP:['l_nafos_fde475','l_qalob_e14dcc','l_riyH_14b7a7','l_ruwH_1d9882'],
    KULLUK_DUA:['l_daEaA_f5ec67','l_Eabod_3558c0','l_Eabada_557021','l_akara_350195','l_duEaA_bcbfae'],
    KORKU_TAKVA:['l_t_aqaY_bc8006','l_xaAfa_29d6b0','l_mut_aqiyn_afd23b','l_xa_iYa_982ede','l_xawof_3af862'],
    HIDAYET_DALALET:['l_hadaY_a88771','l_hudFY_2e4b07','l_aDal_a_5ed954','l_Dal_a_2775a8','l_hotadaY_132fd7','l_Dala_l_fc4484','l_DaA_l_145c36'],
    RAHMET_ZULUM:['l_ZaAlim_fae7dd','l_r_aHiym_ecdbe9','l_raHomap_490a24','l_Zalama_7a9278','l_r_aHoma_n_c13ea2','l_r_aHima_870005','l_Zuluma_t_933b08'],
    ALGI_ISITME_GORME:['l_n_aZara_cdb6f4','l_samiEa_640570','l_baSiyr_69e5a4','l_baSar_691898','l_samiyE_d49cf3','l_aboSara_9f0224','l_samoE_5d4faf'],
    HAYAT_OLUM:['l_Hayaw_p_e08aa3','l_aHoyaA_35079e','l_mawot_7aa65a','l_m_aAta_a0f90e','l_m_ay_it_fb6ea2','l_Hay_3dc2a8','l_amaAta_5bf411','l_taHiy_ap_de08b0'],
    SABIR_ITAAT:['l_aTaAEa_74ca26','l_Sabara_34dfc2','l_sotaTaAEa_d34f23','l_TaEaAm_f85a5a']
  };
  var KAO_CLUSTER_BY_LEMMA=Object.create(null);
  Object.keys(KAO_SEMANTIC_CLUSTERS).forEach(function(cluster){
    KAO_SEMANTIC_CLUSTERS[cluster].forEach(function(id){
      if(!KAO_CLUSTER_BY_LEMMA[id]) KAO_CLUSTER_BY_LEMMA[id]=[];
      KAO_CLUSTER_BY_LEMMA[id].push(cluster);
    });
  });
  var REQUIRED_DEPS=['data','ui','save','render','todayStr','esc','icon','getDay'];
  var quranLearnDeps=null;
  var quranLearnSurfaceDeps=null;
  var caffeineTargetBedResolver=null;

  function registerQuranLearn(deps){
    if(quranLearnDeps||!deps||typeof deps!=='object'||Array.isArray(deps)) return false;
    for(var i=0;i<REQUIRED_DEPS.length;i+=1){
      if(typeof deps[REQUIRED_DEPS[i]]!=='function') return false;
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
    }
    return meta;
  }
  function semanticInfo(id,raw,opts){
    var meta=metaFor(id,raw,opts),lemmaId=lemmaIdForCard(id),keys=[],neighbors=[];
    if(meta.root) keys.push('root:'+meta.root);
    (KAO_CLUSTER_BY_LEMMA[lemmaId]||[]).forEach(function(value){ keys.push('cluster:'+value); });
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
    var records=source.map(function(raw){ return candidateRecord(raw,cards,opts); }).filter(Boolean);
    var seed=daySeed(now)+'|'+String(opts.sessionId||'');
    records.sort(function(a,b){ return b.priority-a.priority||seededRank(seed,a.cardId)-seededRank(seed,b.cardId)||a.cardId.localeCompare(b.cardId); });
    var due=records.filter(function(item){
      if(item.isNew||item.card.orphan===true) return false;
      var date=new Date(item.card.due||0);
      return isFinite(date.getTime())&&date.getTime()<=now.getTime();
    }).slice(0,60);
    var dailyNew=Math.max(0,Math.floor(nonNegativeNumber(q.settings&&q.settings.dailyNew,10)));
    var selectedNew=[];
    records.filter(function(item){ return item.isNew; }).some(function(item){
      if(selectedNew.length>=dailyNew) return true;
      if(recentNeighbor(item,cards,now,opts)) return false;
      if(selectedNew.some(function(other){ return semanticNeighbors(item.semantic,other.semantic); })) return false;
      selectedNew.push(item);
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
        if(item.type!=='grammar'&&n>=2&&out[n-1].type===item.type&&out[n-2].type===item.type) continue;
        index=i; break;
      }
      if(index<0) break;
      var chosen=remaining.splice(index,1)[0];
      typeCounts[chosen.type]+=1;
      out.push({id:'kao:'+daySeed(now)+':'+chosen.cardId,cardId:chosen.cardId,type:chosen.type,fragmentKind:chosen.raw&&chosen.raw.fragmentKind||null,isNew:chosen.isNew});
    }
    return out;
  }
  function kaoPickDistractors(d,targetId,count,options){
    var opts=options&&typeof options==='object'?options:{},q=quranLearnRoot(d),cards=objectOr(q.cards,{});
    var targetCard=objectOr(cards[targetId],{}),target=metaFor(targetId,null,opts);
    var previousMap=opts.previousDistractors&&typeof opts.previousDistractors==='object'?opts.previousDistractors:{};
    var previous=Array.isArray(previousMap[targetId])?previousMap[targetId]:(Array.isArray(targetCard.lastDistractors)?targetCard.lastDistractors:[]);
    var limit=Math.max(0,Math.floor(nonNegativeNumber(count,3)));
    return Object.keys(cards).filter(function(id){
      if(id===targetId||previous.indexOf(id)>=0) return false;
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
    var meta=metaFor(id,queueItem,opts),meanings=Array.isArray(meta.meanings)?meta.meanings:[];
    var direction=/:tr>ar$/.test(id)?'tr>ar':'ar>tr';
    var answer=direction==='tr>ar'?String(meta.ar||id):String(meanings[0]||meta.meaning||id);
    var picked=kaoPickDistractors(d,id,3,opts),lex=window.QuranLexiconV1;
    if(picked.length<3&&lex&&Array.isArray(lex.lemmas)){
      lex.lemmas.filter(function(lemma){ return lemma.id!==lemmaIdForCard(id)&&lemma.pos===meta.pos&&lemma.root!==meta.root; }).sort(function(a,b){ return seededRank(String(opts.seed||'')+'|fallback|'+id,a.id)-seededRank(String(opts.seed||'')+'|fallback|'+id,b.id); }).some(function(lemma){
        if(picked.length>=3) return true;
        picked.push({cardId:'w:'+lemma.id+':'+direction,label:direction==='tr>ar'?lemma.ar:String(lemma.meanings[0]||lemma.id)});
        return false;
      });
    }
    var choices=[{cardId:id,label:answer,pronunciation:direction==='tr>ar'?String(meta.translit||''):'',correct:true}].concat(picked.map(function(item){
      var itemMeta=metaFor(item.cardId,null,opts);
      return {cardId:item.cardId,label:direction==='tr>ar'?String(itemMeta.ar||item.label):String(item.label),pronunciation:direction==='tr>ar'?String(itemMeta.translit||''):'',correct:false};
    }));
    choices.sort(function(a,b){ return seededRank(String(opts.seed||'')+'|task|'+id,a.cardId)-seededRank(String(opts.seed||'')+'|task|'+id,b.cardId); });
    choices.forEach(function(choice,index){ choice.choiceId=String(queueItem&&queueItem.id||'task:'+id)+':choice:'+index; });
    return {id:String(queueItem&&queueItem.id||'task:'+id),cardId:id,type:cardType(id,queueItem&&queueItem.type),isNew:!!(queueItem&&queueItem.isNew),retry:!!(queueItem&&queueItem.retry),direction:direction,answer:answer,ar:String(meta.ar||''),meaning:String(meanings[0]||meta.meaning||''),translit:String(meta.translit||''),cognate:meta.cognate||null,clipId:lemmaIdForCard(id)?'w-'+lemmaIdForCard(id):'',choices:choices};
  }
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
  function kaoTodayStats(d,nowValue){
    var now=validDate(nowValue,'now'),q=ensureQuranLearn(d),cards=objectOr(q&&q.cards,{}),ids=Object.keys(cards);
    var due=0,known=Object.create(null);
    ids.forEach(function(id){
      var card=cards[id]||{},date=new Date(card.due||0),lemma=lemmaIdForCard(id);
      if(card.orphan!==true&&!(/^new$/.test(card.state||card.st))&&isFinite(date.getTime())&&date.getTime()<=now.getTime()) due+=1;
      if(lemma&&card.readerUnknown!==true&&(card.state==='review'||card.st==='review'||nonNegativeNumber(card.reps,0)>0)) known[lemma]=1;
    });
    var fresh=Math.max(0,Math.floor(nonNegativeNumber(q.settings&&q.settings.dailyNew,10)));
    return {due:Math.min(due,60),fresh:fresh,minutes:Math.max(1,Math.ceil((Math.min(due,60)+fresh)*0.55)),known:Object.keys(known).length};
  }
  function kaoMilestoneLabel(q){
    var labels={fatiha:'Fâtiha’yı anlıyorum',namaz:'Namazda ne dediğimi anlıyorum',half:'Kelimelerin yarısı tanıdık',twoThirds:'Üçte iki kapsam',eighty:'%80 kapsam',shortSurahs:'Kısa sûreler tamam'};
    var keys=['shortSurahs','eighty','twoThirds','half','namaz','fatiha'];
    for(var i=0;i<keys.length;i+=1) if(q.milestones&&q.milestones[keys[i]]) return labels[keys[i]];
    return 'İlk kilometre taşı: Fâtiha';
  }
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
  function kaoGateTasks(){
    var lex=window.QuranLexiconV1,p=window.QuranPhonicsV1,lemmas=lex&&Array.isArray(lex.lemmas)?lex.lemmas.filter(function(lemma){ return lemma.verified===true&&lemma.translit; }).slice(0,20):[],pairs=p&&Array.isArray(p.pairs)?p.pairs.slice(0,12):[],letters=p&&Array.isArray(p.letters)?p.letters:[];
    function letter(id){ return letters.find(function(item){ return item.id===id; })||{id:id,ar:id}; }
    return {reading:lemmas.map(function(lemma,index){ return {id:'read-'+lemma.id,ar:lemma.ar,answer:lemma.translit,choices:[lemma.translit,lemmas[(index+3)%lemmas.length].translit,lemmas[(index+7)%lemmas.length].translit].filter(function(value,pos,list){ return list.indexOf(value)===pos; })}; }),listening:pairs.map(function(pair,index){ var target=letter(index%2?pair.b:pair.a),other=letter(index%2?pair.a:pair.b); return {id:'listen-'+pair.id,pairId:pair.id,answer:target.id,choices:[target,other]}; }),lessons:kaoGateLessons()};
  }
  function finishGate(reading,listening,deferred){
    var q=ensureQuranLearn(quranLearnDeps.data()),ui=quranLearnDeps.ui(); q.gate.passed=reading>=18&&(deferred||listening>=10); q.gate.skipped=reading>=18&&!deferred&&listening>=10; q.gate.score=reading+(deferred?0:listening); q.gate.at=new Date().toISOString(); ui.kaoGatePhase=q.gate.skipped?'result':'lessons'; ui.kaoGateAudioDeferred=!!deferred; quranLearnDeps.save(); quranLearnDeps.render(); return true;
  }
  function kaoGate(action,value){
    if(!quranLearnDeps) return false;
    var ui=quranLearnDeps.ui(),q=ensureQuranLearn(quranLearnDeps.data()),tasks=kaoGateTasks(); action=action||'start';
    if(action==='start'){ ui.kaoView='gate'; ui.kaoGatePhase='reading'; ui.kaoGateIndex=0; ui.kaoGateReadingScore=0; ui.kaoGateListeningScore=0; ui.kaoGateAudioDeferred=false; ui.kaoAudioFailed=false; quranLearnDeps.render(); return true; }
    if(action==='answer'){
      var listening=ui.kaoGatePhase==='listening',list=listening?tasks.listening:tasks.reading,item=list[Math.max(0,Math.floor(nonNegativeNumber(ui.kaoGateIndex,0)))]; if(!item) return false;
      if(String(value)===String(item.answer)){ if(listening) ui.kaoGateListeningScore=(ui.kaoGateListeningScore||0)+1; else ui.kaoGateReadingScore=(ui.kaoGateReadingScore||0)+1; }
      ui.kaoGateIndex=(ui.kaoGateIndex||0)+1; if(ui.kaoGateIndex>=list.length){ if(!listening){ ui.kaoGatePhase='listening'; ui.kaoGateIndex=0; } else return finishGate(ui.kaoGateReadingScore||0,ui.kaoGateListeningScore||0,false); } quranLearnDeps.render(); return true;
    }
    if(action==='play'){
      var pair=String(value||''); if(!/^mp_[a-z_]+$/.test(pair)||!quranLearnSurfaceDeps||typeof quranLearnSurfaceDeps.createAudio!=='function') return false; var audio=quranLearnSurfaceDeps.createAudio('assets/kao/audio/p-'+pair+'.m4a'),failed=function(){ ui.kaoAudioFailed=true; quranLearnDeps.render(); }; if(typeof audio.addEventListener==='function') audio.addEventListener('error',failed,{once:true}); try{ var play=audio.play(); if(play&&typeof play.catch==='function') play.catch(failed); }catch(_error){ failed(); } return true;
    }
    if(action==='audio-unavailable'&&ui.kaoAudioFailed) return finishGate(ui.kaoGateReadingScore||0,0,true);
    if(action==='lesson'){ ui.kaoView='gate'; ui.kaoGatePhase='lesson'; ui.kaoGateLesson=Math.max(0,Math.min(11,Math.floor(nonNegativeNumber(value,0)))); quranLearnDeps.render(); return true; }
    if(action==='readability'&&value&&typeof value==='object'){ if(['1.9','2.2','2.5'].indexOf(String(value.lineHeight))>=0) q.readability.lineHeight=String(value.lineHeight); if(['normal','wide'].indexOf(value.wordSpacing)>=0) q.readability.wordSpacing=value.wordSpacing; if(typeof value.coloredHarakat==='boolean') q.readability.coloredHarakat=value.coloredHarakat; quranLearnDeps.save(); quranLearnDeps.render(); return true; }
    return false;
  }
  function kaoGateHTML(){
    if(!quranLearnDeps) return '';
    var q=ensureQuranLearn(quranLearnDeps.data()),ui=quranLearnDeps.ui(),tasks=kaoGateTasks(),phase=ui.kaoGatePhase||'reading',index=Math.max(0,Math.floor(nonNegativeNumber(ui.kaoGateIndex,0))),h='<main class="kao-gate" aria-labelledby="kao-gate-title"><div class="kao-view-head"><div><p class="kao-eyebrow">Seviye 0</p><h2 id="kao-gate-title">Harf · ses · hareke</h2></div><button type="button" class="kao-back" onclick="App.kaoSetView(\'home\')">Geri</button></div>';
    if(phase==='reading'){ var read=tasks.reading[index]; h+='<p class="kao-gate-note">20 kısa seçim · utanma yok, yalnız başlangıç yerini buluyoruz.</p>'+(read?'<section class="kao-gate-task"><small>'+(index+1)+' / 20</small><p class="kao-gate-ar" lang="ar" dir="rtl">'+gateArabic(read.ar,q)+'</p><h3>Doğru okunuşu seç</h3><div class="kao-choices">'+read.choices.map(function(choice){ return '<button type="button" onclick="App.kaoGate(\'answer\',\''+quranLearnDeps.esc(choice)+'\')">'+quranLearnDeps.esc(choice)+'</button>'; }).join('')+'</div></section>':''); }
    else if(phase==='listening'){ var listen=tasks.listening[index]; h+='<p class="kao-gate-note">12 minimal çift · sesi açamazsan bu bölüm ertelenir.</p>'+(listen?'<section class="kao-gate-task"><small>'+(index+1)+' / 12</small><button type="button" class="kao-audio" onclick="App.kaoGate(\'play\',\''+listen.pairId+'\')">'+quranLearnDeps.icon('volume-2',17)+' Sesi dinle</button><h3>Hangi harf?</h3><div class="kao-choices">'+listen.choices.map(function(choice){ return '<button type="button" lang="ar" dir="rtl" onclick="App.kaoGate(\'answer\',\''+choice.id+'\')">'+choice.ar+'</button>'; }).join('')+'</div>'+(ui.kaoAudioFailed?'<button type="button" class="kao-secondary" onclick="App.kaoGate(\'audio-unavailable\')">Ses bölümünü ertele</button>':'')+'</section>':''); }
    else if(phase==='lesson'){ var lesson=tasks.lessons[Math.max(0,Math.floor(nonNegativeNumber(ui.kaoGateLesson,0)))]; h+='<section class="kao-lesson"><p class="kao-eyebrow">Mini ders '+((ui.kaoGateLesson||0)+1)+' / 12</p><h3>'+quranLearnDeps.esc(lesson.title)+'</h3><div class="kao-sounds">'+lesson.sounds.map(function(sound){ return '<article><b lang="ar" dir="rtl">'+sound.ar+'</b><span>'+quranLearnDeps.esc(sound.tipTr)+'</span></article>'; }).join('')+'</div>'+lesson.rules.map(function(rule){ return '<p>'+quranLearnDeps.esc(rule.tipTr)+'</p>'; }).join('')+'</section>'; }
    else h+='<section class="kao-gate-result"><h3>Kapıyı geçtin</h3><p>Temel harf ve ses derslerini atlayabilirsin.</p></section>';
    h+='<section class="kao-readability"><h3>Okuma görünümü</h3><p style="'+kaoReadabilityStyle()+'" class="kao-gate-ar" lang="ar" dir="rtl">'+gateArabic('بِسْمِ ٱللَّهِ',q)+'</p><div><button type="button" onclick="App.kaoGate(\'readability\',{lineHeight:\'1.9\'})">Sıkı</button><button type="button" onclick="App.kaoGate(\'readability\',{lineHeight:\'2.2\'})">Rahat</button><button type="button" onclick="App.kaoGate(\'readability\',{lineHeight:\'2.5\',wordSpacing:\'wide\'})">Geniş</button><button type="button" onclick="App.kaoGate(\'readability\',{coloredHarakat:'+(q.readability.coloredHarakat?'false':'true')+'})">Renkli hareke: '+(q.readability.coloredHarakat?'açık':'kapalı')+'</button></div></section><h3>İstersen hızlıca hatırlayalım</h3><div class="kao-lesson-grid">'+tasks.lessons.map(function(lesson,i){ return '<button type="button" onclick="App.kaoGate(\'lesson\','+i+')"><span>'+String(i+1).padStart(2,'0')+'</span>'+quranLearnDeps.esc(lesson.title)+'</button>'; }).join('')+'</div>'+(ui.kaoGateAudioDeferred?'<p class="kao-gate-deferred">Ses bölümü ertelendi; ilk ses erişiminde T0 açılacak.</p>':'')+'</main>'; return h;
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
  function wordCardId(q,lemmaId){
    var cards=objectOr(q&&q.cards,{}),prefix='w:'+lemmaId+':',ids=Object.keys(cards).filter(function(id){ return id.indexOf(prefix)===0; });
    return ids[0]||prefix+'ar>tr';
  }
  function lemmaSurahId(lemma){
    var first=lemma&&Array.isArray(lemma.examples)&&lemma.examples[0],number=first&&String(first.ref||'').split(':')[0],catalog=window.QuranRevelationOrderV1;
    var surah=catalog&&typeof catalog.byMushafOrder==='function'?catalog.byMushafOrder(Number(number)):null;
    return surah&&surah.id?surah.id:'';
  }
  function kaoUnits(){
    if(!quranLearnDeps) return [];
    var d=quranLearnDeps.data(),q=ensureQuranLearn(d),lex=window.QuranLexiconV1,lemmas=lex&&Array.isArray(lex.lemmas)?lex.lemmas:[],cards=objectOr(q.cards,{}),known=Object.create(null);
    Object.keys(cards).forEach(function(id){ var lemmaId=lemmaIdForCard(id),card=cards[id]; if(lemmaId&&card&&card.orphan!==true&&card.readerUnknown!==true&&nonNegativeNumber(card.reps,0)>0) known[lemmaId]=1; });
    return Array.from({length:12},function(_unused,index){
      var start=Math.floor(index*lemmas.length/12),end=Math.floor((index+1)*lemmas.length/12),slice=lemmas.slice(start,end),done=slice.filter(function(lemma){ return known[lemma.id]; }).length,unit=q.units&&q.units[String(index+1)],representative=slice[0]||null;
      return {id:String(index+1),title:String(unit&&unit.title||('Ünite '+String(index+1))),done:done,total:slice.length,percent:slice.length?Math.round(done/slice.length*100):0,lemmaId:representative&&representative.id||'',surahId:lemmaSurahId(representative)};
    });
  }
  function kaoUnitsHTML(){
    if(!quranLearnDeps) return '';
    var d=quranLearnDeps.data(),journey=d&&d.quranJourney&&d.quranJourney.requests&&typeof d.quranJourney.requests==='object'?d.quranJourney.requests:{},units=kaoUnits(),suggested=units.find(function(unit){ return unit.percent<100; })||units[0],esc=quranLearnDeps.esc;
    var h='<main class="kao-units" aria-labelledby="kao-units-title"><div class="kao-view-head"><div><p class="kao-eyebrow">Öğrenme yolu</p><h2 id="kao-units-title">Üniteler</h2><p>Kilit yok; istediğin yerden açabilirsin.</p></div><button type="button" class="kao-back" onclick="App.kaoSetView(\'home\')">Geri</button></div>';
    h+='<section class="kao-levels" aria-label="Seviye durakları"><span>Seviye 0 · Sesler</span><span>Seviye 5 · Kökler</span><span>Seviye 6 · Âyetler</span></section><div class="kao-unit-list">';
    units.forEach(function(unit){
      var request=unit.surahId&&journey[unit.surahId],watched=!!(request&&(request.status==='watched'||request.status==='question_opened')),isSuggested=suggested&&suggested.id===unit.id;
      h+='<button type="button" class="kao-unit-card'+(isSuggested?' is-suggested':'')+'"'+(isSuggested?' aria-current="step"':'')+' onclick="App.kaoOpenWord(\''+esc(unit.lemmaId)+'\')"><span class="kao-unit-number">'+unit.id.padStart(2,'0')+'</span><span class="kao-unit-copy"><small>'+(isSuggested?'Sıra önerisi':'Ünite')+'</small><strong>'+esc(unit.title)+'</strong><span>'+unit.done+' / '+unit.total+' kelime</span></span><span class="kao-unit-side">'+(watched?'<b>'+quranLearnDeps.icon('check-circle',14)+' İzlendi</b>':'')+'<span class="kao-unit-progress" role="progressbar" aria-label="'+esc(unit.title)+' ilerlemesi" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+unit.percent+'"><i style="width:'+unit.percent+'%"></i></span></span></button>';
    });
    return h+'</div></main>';
  }
  function kaoOpenWord(lemmaId){
    if(!quranLearnDeps) return false;
    var lex=window.QuranLexiconV1,lemma=lex&&typeof lex.byId==='function'?lex.byId(String(lemmaId||'')):null;
    if(!lemma||lemma.verified!==true) return false;
    var ui=quranLearnDeps.ui(); ui.kaoWordId=lemma.id; ui.kaoWordLayer=1; ui.kaoView='word'; quranLearnDeps.render(); return true;
  }
  function kaoWordLayer(layer){
    if(!quranLearnDeps) return false;
    var ui=quranLearnDeps.ui(),n=Math.floor(Number(layer)),current=Math.max(1,Math.min(3,Math.floor(nonNegativeNumber(ui.kaoWordLayer,1))));
    if(n<1||n>3||!ui.kaoWordId||n>current+1) return false;
    ui.kaoWordLayer=n; quranLearnDeps.render(); return true;
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
  function kaoWordHTML(){
    if(!quranLearnDeps) return '';
    var d=quranLearnDeps.data(),q=ensureQuranLearn(d),ui=quranLearnDeps.ui(),lex=window.QuranLexiconV1,lemma=lex&&lex.byId&&lex.byId(ui.kaoWordId),layer=Math.max(1,Math.min(3,Math.floor(nonNegativeNumber(ui.kaoWordLayer,1)))),esc=quranLearnDeps.esc;
    if(!lemma) return kaoUnitsHTML();
    var cardId=wordCardId(q,lemma.id),card=objectOr(q.cards[cardId],{}),root=rootDetail(lemma.root),h='<main class="kao-word" data-word-layer="'+layer+'" aria-labelledby="kao-word-title"><div class="kao-view-head"><button type="button" class="kao-back" onclick="App.kaoSetView(\'units\')">Üniteler</button><span>Katman '+layer+' / 3</span></div>';
    if(layer===1){
      h+='<section class="kao-word-hero"><p id="kao-word-title" lang="ar" dir="rtl">'+esc(lemma.ar)+'</p><div class="kao-pronunciation"><small>Okunuş</small><strong lang="tr" dir="ltr">'+esc(lemma.translit||'Doğrulanmış okunuş henüz yok')+'</strong></div><button type="button" class="kao-audio" aria-label="'+esc(lemma.ar)+' Arapça telaffuzunu dinle" onclick="App.kaoPlay(\'w-'+esc(lemma.id)+'\',\'measured\')">'+quranLearnDeps.icon('volume-2',17)+' Telaffuzu dinle</button><h2>'+esc(lemma.meanings[0]||'')+'</h2>'+(lemma.meanings[1]?'<p>'+esc(lemma.meanings[1])+'</p>':'')+'</section><button type="button" class="kao-primary" onclick="App.kaoWordLayer(2)">Kökünü ve akrabalarını gör</button>';
    }else if(layer===2){
      h+='<section class="kao-root-tree"><p class="kao-eyebrow">Kök</p><h2 id="kao-word-title">'+kaoArabicPairHTML(Array.from(lemma.root||'').join('–'),root&&root.pronunciation,'kao-root-pair')+'</h2><p>'+esc(root&&root.meaning||lemma.pattern||'')+'</p><h3>Türkçedeki akrabaları</h3><div class="kao-derivatives">'+(root?root.derivatives.map(function(item){ return '<span><b>'+esc(item.tr)+'</b><small class="kao-pattern">'+esc(item.pattern)+'</small></span>'; }).join(''):'')+'</div>'+kaoCognateHTML(lemma)+'</section><button type="button" class="kao-primary" onclick="App.kaoWordLayer(3)">Kur’an’dan örnekleri gör</button>';
    }else{
      h+='<section class="kao-word-examples"><p class="kao-eyebrow">Kur’an’da</p><h2 id="kao-word-title">Üç bağlam</h2>'+lemma.examples.slice(0,3).map(function(example){ var pronunciation=kaoExamplePronunciationHTML(example,lemma,esc); return pronunciation?'<article class="kao-word-example"><p lang="ar" dir="rtl">'+esc(example.ar)+'</p>'+pronunciation+'<p>'+esc(example.tr)+'</p><small>'+esc(example.ref)+'</small></article>':'<article class="kao-word-example"><span class="kao-content-error" role="alert">Bu cümle, Latin okunuşu doğrulanmadan gösterilemez.</span></article>'; }).join('')+'<p class="kao-next-review">Sonraki tekrar: <strong>'+esc(nextReviewText(card))+'</strong></p></section>';
    }
    h+='<details class="kao-flag"><summary>Hata bildir</summary><div><button type="button" onclick="App.kaoFlag(\''+esc(cardId)+'\',\'meaning\')">Anlamı bildir</button><button type="button" onclick="App.kaoFlag(\''+esc(cardId)+'\',\'example\')">Örneği bildir</button></div></details></main>';
    return h;
  }
  function kaoFlag(cardId,kind){
    if(!quranLearnDeps||['meaning','example','audio','root'].indexOf(kind)<0||!currentCardId(cardId)) return false;
    var q=ensureQuranLearn(quranLearnDeps.data()),card=objectOr(q.cards[cardId],{}); q.cards[cardId]=card; card.flagged={at:new Date().toISOString(),kind:kind};
    quranLearnDeps.save(); if(quranLearnSurfaceDeps&&typeof quranLearnSurfaceDeps.toast==='function') quranLearnSurfaceDeps.toast('Teşekkürler, sonraki içerik sürümünde bakılacak'); quranLearnDeps.render(); return true;
  }
  function kaoUnitLabel(q){
    var ids=Object.keys(objectOr(q.units,{})).sort(),id=ids[0],unit=id&&q.units[id];
    if(!unit||typeof unit!=='object') return 'Ünite 1 · Kur’an’a giriş';
    return String(unit.title||unit.label||('Ünite '+String(unit.order||1)));
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
  function grammarCandidates(){
    var grammar=window.QuranGrammarV1,out=[];
    if(!grammar||!Array.isArray(grammar.concepts)) return out;
    KAO_GRAMMAR_TYPES.forEach(function(type){
      if(type==='Kalıp eşle'){
        var patternConcept=grammar.byId&&grammar.byId('g21'),patternTemplate=patternConcept&&(patternConcept.templates||[]).find(function(item){ return item.type===type; });
        if(patternTemplate){ out.push({id:'g:'+patternConcept.id+':'+patternTemplate.id,type:'grammar',priority:1}); return; }
      }
      for(var i=0;i<grammar.concepts.length;i+=1){
        var concept=grammar.concepts[i],template=(concept.templates||[]).find(function(item){ return item.type===type; });
        if(template){ out.push({id:'g:'+concept.id+':'+template.id,type:'grammar',priority:1}); break; }
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
  function kaoBuildGrammarTask(queueItem,d,options){
    var opts=options&&typeof options==='object'?options:{},cardId=String(queueItem&&queueItem.cardId||queueItem&&queueItem.id||''),record=grammarRecord(cardId);
    if(!record) return null;
    var concept=record.concept,template=record.template,type=template.type,table=(concept.tables||[])[0],rows=table&&Array.isArray(table.rows)?table.rows:[];
    var taskId=String(queueItem&&queueItem.id||'task:'+cardId),seed=String(opts.seed||taskId),index=rows.length?seededRank(seed,template.id)%rows.length:0;
    var row=rows[index]||{},answer='',stimulus='',stimulusPronunciation='',context=[],alternatives=[],errorClass=type==='Ek çöz'?'affix':type==='Kök bul'?'root':'rule';
    if(type==='Ek çöz'){
      var cells=(row.cells||[]).map(function(cell,cellIndex){ return {text:cellText(cell),pronunciation:cellPronunciation(cell),label:String((table.columns||[])[cellIndex+1]||row.label||'parça')}; }).filter(function(item){ return item.text; });
      var picked=cells[cells.length-1]||{text:String(row.label||''),label:String(row.label||'')};
      stimulus=picked.text; stimulusPronunciation=picked.pronunciation||''; answer='el + '+String(row.label||'kelime'); alternatives=rows.map(function(item){ return 'el + '+String(item.label||'kelime'); }).concat([String(row.label||''),picked.label]);
      context=[{label:'el = o bilinen',pronunciation:''},{label:String(row.label||concept.title),pronunciation:''}];
    }else if(type==='Çekim tablosu'){
      var arabic=(row.cells||[]).map(function(cell){ return {label:cellText(cell),pronunciation:cellPronunciation(cell)}; }).filter(function(value){ return /[\u0600-\u06ff]/.test(value.label); });
      answer=arabic[0]||{label:String(row.label||''),pronunciation:''}; stimulus=String(row.label||''); alternatives=rows.flatMap(function(item){ return (item.cells||[]).map(function(cell){ return {label:cellText(cell),pronunciation:cellPronunciation(cell)}; }).filter(function(value){ return /[\u0600-\u06ff]/.test(value.label); }); });
      context=[{label:String(table.title||concept.title),pronunciation:''}];
    }else if(type==='Kök bul'){
      var root=rootForLabel(row.label),arabicCell=(row.cells||[]).find(function(value){ return /[\u0600-\u06ff]/.test(cellText(value)); });
      stimulus=cellText(arabicCell)||String(row.label||''); stimulusPronunciation=cellPronunciation(arabicCell); answer=root?{label:Array.from(root.root).join('–'),pronunciation:String(root.pronunciation||'')}:{label:String(row.label||''),pronunciation:''};
      var roots=window.QuranGrammarV1&&window.QuranGrammarV1.unit11&&window.QuranGrammarV1.unit11.roots||[];
      alternatives=roots.slice(0,12).map(function(item){ return {label:Array.from(item.root).join('–'),pronunciation:String(item.pronunciation||'')}; }); context=[{label:String(row.label||concept.title),pronunciation:''}];
    }else{
      var matches=rows.map(function(item){ var arabic=(item.cells||[]).map(function(cell){ return {label:cellText(cell),pronunciation:cellPronunciation(cell)}; }).filter(function(value){ return /[\u0600-\u06ff]/.test(value.label); }),shift=(item.cells||[]).map(cellText).find(function(value){ return /^[IVX]+:/.test(value); }); return {word:(arabic[1]||arabic[0]||{}).label||'',pronunciation:(arabic[1]||arabic[0]||{}).pronunciation||'',meaning:shift?shift.replace(/^[IVX]+:\s*/, ''):String(item.label||'')}; }).filter(function(item){ return item.word&&item.meaning; }).slice(0,3);
      var selected=matches[seededRank(seed,template.id)%Math.max(1,matches.length)]||{word:'',meaning:''};
      stimulus=selected.word; stimulusPronunciation=selected.pronunciation||''; answer=selected.meaning; alternatives=matches.map(function(item){ return item.meaning; }); context=matches.map(function(item){ return {label:item.word,pronunciation:item.pronunciation}; });
    }
    var answerValue=choiceValue(answer);
    return {id:taskId,cardId:cardId,type:'grammar',grammarType:type,isNew:!!(queueItem&&queueItem.isNew),retry:!!(queueItem&&queueItem.retry),prompt:String(template.prompt||type),stimulus:stimulus,stimulusPronunciation:stimulusPronunciation,context:context,errorClass:errorClass,answer:answerValue.label,clipId:'',choices:choiceList(alternatives,answerValue,seed,taskId)};
  }
  function kaoCandidates(){
    var lex=window.QuranLexiconV1;
    if(!lex||!Array.isArray(lex.lemmas)) return [];
    var candidates=fragmentCandidates().concat(grammarCandidates(),lex.lemmas.map(function(lemma,index){ var direction=index%2?'tr>ar':'ar>tr'; return {id:'w:'+lemma.id+':'+direction,type:direction==='tr>ar'?'arabic':'meaning'}; })),cards=objectOr(quranLearnRoot(quranLearnDeps.data()).cards,{});
    Object.keys(cards).forEach(function(id){ if(candidates.every(function(item){ return item.id!==id; })) candidates.push({id:id}); });
    return candidates;
  }
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
    return '<p class="kao-cognate'+(warning?' is-shift':'')+'">'+(warning?quranLearnDeps.icon('alert-triangle',14)+' dikkat · ':'')+'Türkçede var: '+esc(task.cognate.tr)+(warning?' · '+esc(task.cognate.shift):'')+'</p>';
  }
  function kaoArabicPairHTML(ar,pronunciation,className){
    var esc=quranLearnDeps.esc,label=String(ar||''),reading=String(pronunciation||'');
    if(!reading) return '<span class="kao-content-error" role="alert">Bu Arapça içerik, Latin okunuşu doğrulanmadan gösterilemez.</span>';
    return '<span class="kao-arabic-stack'+(className?' '+className:'')+'"><span class="kao-arabic-text" lang="ar" dir="rtl">'+esc(label)+'</span><span class="kao-pronunciation-line" lang="tr">'+esc(reading)+'</span></span>';
  }
  function kaoTaskHTML(task){
    if(!quranLearnDeps) return '';
    var ui=quranLearnDeps.ui(),esc=quranLearnDeps.esc;
    if(!task){
      var durable=Math.max(0,Math.floor(nonNegativeNumber(ui.kaoDurableCount,0)));
      return '<section id="kao-task" class="kao-task kao-done"><span class="kao-done-mark" aria-hidden="true">✦</span><p class="kao-eyebrow">Bugünkü oturum tamam</p><h2>Bugün '+durable+' kelime daha kalıcı oldu</h2><div class="kao-done-actions"><button type="button" class="kao-primary" onclick="App.kaoSetView(\'home\')">Bugün yeter</button><button type="button" class="kao-secondary" onclick="App.kaoStart()">5 dakika daha</button></div></section>';
    }
    var autoplay=kaoShouldAutoplay(task,quranLearnDeps.data()),isGrammar=!!task.grammarType,isFragment=task.type==='fragment',prompt=isGrammar||isFragment?task.prompt:(task.direction==='tr>ar'?task.meaning:task.ar);
    var h='<section id="kao-task" class="kao-task" data-task-id="'+esc(task.id)+'"'+(autoplay?' data-autoplay="1"':'')+'>';
    h+='<div class="kao-task-top"><span>'+(isGrammar?esc(task.grammarType):(isFragment?(task.kind==='order'?'Kelime dizme':'Parça çevir'):(task.direction==='tr>ar'?'Arapçayı seç':'Anlamı seç')))+'</span><span>'+String((ui.kaoTaskIndex||0)+1)+' / '+String((ui.kaoQueue||[]).length)+'</span></div>';
    if(!isGrammar&&!isFragment&&task.direction==='ar>tr') h+='<h2 class="kao-question'+(autoplay?' kao-audio-pending':'')+'" data-kao-ar>'+kaoArabicPairHTML(prompt,task.translit,'kao-question-pair')+'</h2>';
    else h+='<h2 class="kao-question">'+esc(prompt)+'</h2>';
    if(isGrammar){ h+='<div class="kao-grammar-stimulus">'+(/[\u0600-\u06ff]/.test(task.stimulus)?kaoArabicPairHTML(task.stimulus,task.stimulusPronunciation,'kao-stimulus-pair'):esc(task.stimulus))+'</div>'; if(task.context&&task.context.length) h+='<div class="kao-grammar-context">'+task.context.map(function(item){ var value=item&&typeof item==='object'?item:{label:item,pronunciation:''}; return /[\u0600-\u06ff]/.test(value.label)?'<span>'+kaoArabicPairHTML(value.label,value.pronunciation,'kao-context-pair')+'</span>':'<span>'+esc(value.label)+'</span>'; }).join('')+'</div>'; }
    if(isFragment&&task.kind==='translate') h+='<div class="kao-fragment-stimulus">'+kaoArabicPairHTML(task.ar,task.pronunciation,'kao-fragment-pair')+'</div>';
    if(isFragment&&task.kind==='order'){
      var draft=Array.isArray(ui.kaoOrderDraft)?ui.kaoOrderDraft:[];
      h+='<div class="kao-order-target" aria-label="Seçilen kelime sırası">'+(draft.length?draft.map(function(choiceId){ var selected=task.choices.find(function(choice){ return choice.choiceId===choiceId; }); return selected?'<span>'+kaoArabicPairHTML(selected.label,selected.pronunciation,'kao-order-pair')+'</span>':''; }).join(''):'<span class="kao-order-empty">Önce fiili seç</span>')+'</div>';
    }
    if(task.clipId) h+='<button type="button" class="kao-audio" aria-label="Yavaş dinlemek için dokun; doğal hız için 350 milisaniye basılı tut" onpointerdown="this.dataset.kaoLong=\'\';this._kaoHold=setTimeout(()=>{this.dataset.kaoLong=\'1\';App.kaoPlay(\''+task.clipId+'\',\'flowing\')},350)" onpointerup="clearTimeout(this._kaoHold)" onpointercancel="clearTimeout(this._kaoHold)" onclick="if(this.dataset.kaoLong!==\'1\')App.kaoPlay(\''+task.clipId+'\',\'measured\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();App.kaoPlay(\''+task.clipId+'\',event.shiftKey?\'flowing\':\'measured\')}">'+quranLearnDeps.icon('volume-2',17)+' Dinle</button>';
    h+=kaoCognateHTML(task)+'<div class="kao-choices">';
    task.choices.forEach(function(choice){
      var selected=isFragment&&task.kind==='order'&&Array.isArray(ui.kaoOrderDraft)&&ui.kaoOrderDraft.indexOf(choice.choiceId)>=0;
      var arabic=/[\u0600-\u06ff]/.test(choice.label),classes=[];
      if(isGrammar||isFragment) classes.push('kao-chip');
      if(autoplay&&task.direction==='tr>ar') classes.push('kao-audio-pending');
      h+='<button type="button"'+(classes.length?' class="'+classes.join(' ')+'"':'')+(isFragment&&task.kind==='order'?' aria-pressed="'+(selected?'true':'false')+'"'+(selected?' disabled':''):'')+(arabic?' data-kao-ar aria-label="'+esc(choice.label+', okunuşu '+choice.pronunciation)+'"':'')+' onclick="App.kaoAnswer(\''+task.id+'\',\''+choice.choiceId+'\')">'+(arabic?kaoArabicPairHTML(choice.label,choice.pronunciation,'kao-choice-pair'):esc(choice.label))+'</button>';
    });
    h+='</div><p class="kao-live" aria-live="polite">'+esc(ui.kaoFeedback||'')+'</p>';
    if(ui.kaoUndo) h+='<button type="button" class="kao-undo" onclick="App.kaoUndo()">Geri al · 3 sn</button>';
    h+='</section>';
    return h;
  }
  function currentTask(){
    if(!quranLearnDeps) return null;
    var ui=quranLearnDeps.ui(),item=(ui.kaoQueue||[])[ui.kaoTaskIndex||0];
    if(!item) return null;
    ui.kaoTasks=objectOr(ui.kaoTasks,{});
    if(!ui.kaoTasks[item.id]) ui.kaoTasks[item.id]=kaoBuildTask(item,quranLearnDeps.data(),{seed:item.id});
    return ui.kaoTasks[item.id];
  }
  function paintTask(){
    if(!quranLearnSurfaceDeps||typeof quranLearnSurfaceDeps.taskElement!=='function') return false;
    var node=quranLearnSurfaceDeps.taskElement();
    if(!node) return false;
    var html=kaoTaskHTML(currentTask()),match=html.match(/^<section[^>]*>([\s\S]*)<\/section>$/);
    node.innerHTML=match?match[1]:html;
    if(typeof node.setAttribute==='function'){
      var task=currentTask(); node.setAttribute('data-task-id',task?task.id:'done');
      if(task&&kaoShouldAutoplay(task,quranLearnDeps.data())) node.setAttribute('data-autoplay','1'); else if(typeof node.removeAttribute==='function') node.removeAttribute('data-autoplay');
    }
    return true;
  }
  function startTaskPresentation(){
    var task=currentTask();
    if(task&&kaoShouldAutoplay(task,quranLearnDeps.data())) kaoPlay(task.clipId,'measured');
  }
  function kaoStart(){
    if(!quranLearnDeps) return false;
    var ui=quranLearnDeps.ui(),d=quranLearnDeps.data(),now=new Date(),q=ensureQuranLearn(d);
    ui.kaoQueue=kaoBuildQueue(d,now,{sessionId:quranLearnDeps.todayStr(),candidates:kaoCandidates()});
    ui.kaoTaskIndex=0; ui.kaoTaskStartedAt=now.getTime(); ui.kaoUndo=null; ui.kaoFeedback=''; ui.kaoAudioFailed=false; ui.kaoTasks={}; ui.kaoView='session'; ui.kaoOrderDraft=[]; ui.kaoDurableCount=0;
    ui.kaoQueue.forEach(function(item){ ui.kaoTasks[item.id]=kaoBuildTask(item,d,{seed:item.id}); });
    if(!q.startedAt) q.startedAt=now.toISOString();
    quranLearnDeps.render();
    if(quranLearnSurfaceDeps&&typeof quranLearnSurfaceDeps.setTimer==='function') quranLearnSurfaceDeps.setTimer(startTaskPresentation,0); else startTaskPresentation();
    return ui.kaoQueue.length;
  }
  function kaoAnswer(taskId,choiceId){
    if(!quranLearnDeps) return false;
    var ui=quranLearnDeps.ui(),task=currentTask();
    if(!task||task.id!==taskId) return false;
    var choice=task.choices.find(function(item){ return item.choiceId===choiceId; });
    if(!choice) return false;
    var correct;
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
    var d=quranLearnDeps.data(),q=ensureQuranLearn(d),cards=q.cards,key=quranLearnDeps.todayStr(),now=new Date(),hadCard=Object.prototype.hasOwnProperty.call(cards,task.cardId),hadDaily=Object.prototype.hasOwnProperty.call(q.daily,key);
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
      delayedDaily.answered+=1; delayedDaily.reviewed+=1; if(delayedCorrect) delayedDaily.correct+=1; q.daily[key]=delayedDaily;
      ui.kaoFeedback=delayedCorrect?'Doğru':'Doğru cevap: '+task.answer; ui.kaoTaskIndex+=1; ui.kaoTaskStartedAt=now.getTime(); ui.kaoUndo=null;
      quranLearnDeps.save(); paintTask(); startTaskPresentation(); return {correct:delayedCorrect,delayedScore:delayed.delayedScore};
    }
    ui.kaoUndo={expiresAt:now.getTime()+3000,cardId:task.cardId,hadCard:hadCard,card:cloneValue(cards[task.cardId]),dailyKey:key,hadDaily:hadDaily,daily:cloneValue(q.daily[key]),errors:cloneValue(q.errors),taskIndex:ui.kaoTaskIndex,queue:cloneValue(ui.kaoQueue),durableCount:ui.kaoDurableCount,orderDraft:[]};
    var previous=objectOr(cards[task.cardId],{}); correct=choice.correct===true;
    var grade=kaoGrade(correct,Math.max(0,now.getTime()-nonNegativeNumber(ui.kaoTaskStartedAt,now.getTime())),previous.reps),scheduled=kaoSchedule(previous,grade,now);
    if(correct&&scheduled.readerUnknown===true) delete scheduled.readerUnknown;
    cards[task.cardId]=scheduled;
    var daily=Object.assign({answered:0,correct:0,new:0,reviewed:0},objectOr(q.daily[key],{}));
    daily.answered+=1; if(correct) daily.correct+=1; if(task.isNew) daily.new+=1; else daily.reviewed+=1; q.daily[key]=daily;
    var calib=Object.assign({pred:0,ok:0,n:0},objectOr(daily.calib,{}));
    calib.pred=round8(nonNegativeNumber(calib.pred,0)+nonNegativeNumber(scheduled.predictedR,0)); calib.ok=nonNegativeNumber(calib.ok,0)+(correct?1:0); calib.n=nonNegativeNumber(calib.n,0)+1; daily.calib=calib;
    if(nonNegativeNumber(previous.s,0)<21&&nonNegativeNumber(scheduled.s,0)>=21) ui.kaoDurableCount=Math.floor(nonNegativeNumber(ui.kaoDurableCount,0))+1;
    if(!correct&&task.errorClass&&Object.prototype.hasOwnProperty.call(q.errors,task.errorClass)) q.errors[task.errorClass]+=1;
    if(!correct&&!task.retry) ui.kaoQueue.push(Object.assign({},ui.kaoQueue[ui.kaoTaskIndex],{id:task.id+':retry',retry:true,isNew:false}));
    ui.kaoFeedback=correct?'Doğru':(task.kind==='order'?'Fiil önce gelir: Arapçada çoğu kez fiil–özne–nesne sırası kullanılır.':'Doğru cevap: '+task.answer); ui.kaoTaskIndex+=1; ui.kaoTaskStartedAt=now.getTime(); ui.kaoOrderDraft=[];
    quranLearnDeps.save(); paintTask(); startTaskPresentation();
    if(quranLearnSurfaceDeps&&typeof quranLearnSurfaceDeps.setTimer==='function'){
      if(ui.kaoUndoTimer&&typeof quranLearnSurfaceDeps.clearTimer==='function') quranLearnSurfaceDeps.clearTimer(ui.kaoUndoTimer);
      ui.kaoUndoTimer=quranLearnSurfaceDeps.setTimer(function(){ if(ui.kaoUndo&&Date.now()>=ui.kaoUndo.expiresAt){ ui.kaoUndo=null; paintTask(); } },3000);
    }
    return {correct:correct,grade:grade};
  }
  function kaoUndo(){
    if(!quranLearnDeps) return false;
    var ui=quranLearnDeps.ui(),undo=ui.kaoUndo;
    if(!undo||Date.now()>undo.expiresAt) return false;
    var q=ensureQuranLearn(quranLearnDeps.data());
    if(undo.hadCard) q.cards[undo.cardId]=cloneValue(undo.card); else delete q.cards[undo.cardId];
    if(undo.hadDaily) q.daily[undo.dailyKey]=cloneValue(undo.daily); else delete q.daily[undo.dailyKey];
    if(undo.errors) q.errors=cloneValue(undo.errors);
    ui.kaoQueue=cloneValue(undo.queue); ui.kaoTaskIndex=undo.taskIndex; ui.kaoTaskStartedAt=Date.now(); ui.kaoDurableCount=Math.floor(nonNegativeNumber(undo.durableCount,0)); ui.kaoOrderDraft=cloneValue(undo.orderDraft)||[]; ui.kaoUndo=null; ui.kaoFeedback='Geri alındı';
    quranLearnDeps.save(); paintTask(); return true;
  }
  function safeClipId(value){ return /^w-l_[A-Za-z0-9_]+_[0-9a-f]{6}$/.test(String(value||'')); }
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
  function kaoSurahs(){
    var shorts=window.QuranShortSurahsV1;
    return shorts&&Array.isArray(shorts.surahs)?shorts.surahs.slice():[];
  }
  function kaoOpenSurah(surahId){
    if(!quranLearnDeps) return false;
    var id=Number(surahId),surah=kaoSurahs().find(function(item){ return item.id===id; });
    if(!surah||!surahWords(id).length) return false;
    var ui=quranLearnDeps.ui(); ui.kaoSurahId=id; ui.kaoView='reader'; quranLearnDeps.render(); return true;
  }
  function wordKnown(q,word){
    var explicit=q.surahs[String(word.surahId)]&&q.surahs[String(word.surahId)].words&&q.surahs[String(word.surahId)].words[word.id];
    var learned=['ar>tr','tr>ar'].some(function(direction){ var card=q.cards['w:'+word.lemmaId+':'+direction]; return card&&card.orphan!==true&&card.readerUnknown!==true&&nonNegativeNumber(card.reps,0)>0; });
    if(learned) return true;
    return !(explicit&&explicit.status==='unknown')&&learned;
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
    quranLearnDeps.save(); quranLearnDeps.render(); return true;
  }
  function kaoMarkUnderstood(){
    if(!quranLearnDeps) return false;
    var sid=Number(quranLearnDeps.ui().kaoSurahId);
    if(!kaoSurahs().some(function(item){ return item.id===sid; })) return false;
    var q=ensureQuranLearn(quranLearnDeps.data()),key=String(sid),record=objectOr(q.surahs[key],{}),now=new Date(); q.surahs[key]=record;
    record.understoodAt=now.toISOString(); record.delayedTestAt=addDays(now,7).toISOString(); record.delayedScore=null; record.delayedAnswered=0; record.delayedCompletedAt=null; record.confirmedAt=null; record.needsReread=false;
    quranLearnDeps.save(); quranLearnDeps.render(); return true;
  }
  function kaoReaderHTML(){
    if(!quranLearnDeps) return '';
    var q=ensureQuranLearn(quranLearnDeps.data()),ui=quranLearnDeps.ui(),surahs=kaoSurahs(),sid=Number(ui.kaoSurahId||surahs[0]&&surahs[0].id),surah=surahs.find(function(item){ return item.id===sid; });
    if(!surah) return '<main class="kao-reader"><span class="kao-content-error" role="alert">Kısa sûre içeriği bulunamadı.</span></main>';
    var esc=quranLearnDeps.esc,words=surahWords(sid),record=objectOr(q.surahs[String(sid)],{}),wordState=objectOr(record.words,{}),marks=Object.create(null);
    (window.QuranShortSurahsV1.waqfMarks||[]).forEach(function(mark){ marks[mark.afterWordId]=mark.mark; });
    var h='<main class="kao-reader" aria-labelledby="kao-reader-title"><div class="kao-view-head"><div><p class="kao-eyebrow">20 kısa sûre</p><h2 id="kao-reader-title">'+esc(surah.name)+'</h2><p>Her kelimenin okunuşu yanında; anlamı açmak için kelimeye dokun.</p></div><button type="button" class="kao-back" onclick="App.kaoSetView(\'units\')">Üniteler</button></div><div class="kao-surah-picker" aria-label="Kısa sûre seç">';
    surahs.forEach(function(item){ h+='<button type="button"'+(item.id===sid?' aria-current="true"':'')+' onclick="App.kaoOpenSurah('+item.id+')">'+esc(item.name)+'</button>'; }); h+='</div><section class="kao-reader-lines">';
    words.forEach(function(word,index){
      var known=wordKnown(q,word),revealed=known||!!(wordState[word.id]&&wordState[word.id].revealedAt),label=known?'bilinen kelime':'bilinmeyen kelime, dokunarak aç';
      h+='<span class="kao-reader-word '+(known?'is-known':(revealed?'is-revealed':'is-unknown'))+'"><button type="button" aria-label="'+label+'" onclick="App.kaoRevealWord('+index+')">'+kaoArabicPairHTML(word.ar,word.pronunciation,'kao-reader-pair')+'<span class="kao-reader-meaning">'+(revealed?esc(word.tr):'•••')+'</span></button>';
      if(marks[word.id]){ var popId='kao-waqf-'+String(sid)+'-'+String(index); h+='<button type="button" class="kao-waqf" popovertarget="'+popId+'" aria-label="Vakıf işareti '+esc(marks[word.id])+' açıklaması">'+esc(marks[word.id])+'</button><span id="'+popId+'" class="kao-waqf-note" popover>burada dur: cümle/anlam sınırı</span>'; }
      h+='</span>';
    });
    h+='</section><section class="kao-reader-understood"><p>'+(record.confirmedAt?'Gecikmeli test '+String(record.delayedScore)+'/5 · anlaşıldı':(record.needsReread?'Gecikmeli test '+String(record.delayedScore)+'/5 · tekrar oku':(record.delayedTestAt?'7 günlük test planlandı':'Okuma bitince anlayışını kaydet')))+'</p><button type="button" class="kao-primary" onclick="App.kaoMarkUnderstood()">Anladım</button></section></main>';
    return h;
  }
  function kaoHomeHTML(nowValue){
    if(!quranLearnDeps) return '';
    var d=quranLearnDeps.data(),q=ensureQuranLearn(d),now=nowValue?validDate(nowValue,'now'):new Date();
    var stats=kaoTodayStats(d,now),understood=(q.ayahs&&Array.isArray(q.ayahs.understood))?q.ayahs.understood.length:0;
    var percent=Math.min(100,Math.round(stats.known/524*100)),night=kaoNightWindow(d,now),esc=quranLearnDeps.esc,icon=quranLearnDeps.icon;
    var h='<main class="kao-home" aria-labelledby="kao-title">';
    h+='<section class="kao-hero"><span class="kao-hero-rosette" aria-hidden="true">✦</span><div class="kao-hero-copy"><p class="kao-eyebrow">Kelime kapsamın</p><div class="kao-coverage"><strong>'+percent+'%</strong><span>Kur’an kelimelerinin %'+percent+' kadarını tanıyorsun</span></div></div><div class="kao-progress" role="progressbar" aria-label="Kur’an kelime kapsamı" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+percent+'"><span style="width:'+percent+'%"></span></div><p class="kao-ayah-count"><span aria-hidden="true">۞</span> Anlaşılan âyet sayısı: <strong>'+understood+'</strong></p></section>';
    h+='<section class="kao-today"><div class="kao-section-head"><div><p class="kao-eyebrow">Bugünkü ders</p><h2>'+stats.due+' tekrar · '+stats.fresh+' yeni</h2></div><span class="kao-time-chip">~'+stats.minutes+' dk</span></div>';
    if(night) h+='<p class="kao-night">'+icon('moon',15)+' Gece tekrarı açık · '+night.durationMinutes+' dk, en fazla '+night.maxCards+' tekrar</p>';
    h+='<button type="button" class="kao-primary" onclick="App.kaoStart()">Bugünkü oturuma başla '+icon('arrow-right',16)+'</button></section>';
    h+='<section class="kao-summary"><span class="kao-summary-mark" aria-hidden="true">'+icon('compass',18)+'</span><div><p class="kao-eyebrow">Sıradaki ünite</p><h2>'+esc(kaoUnitLabel(q))+'</h2><p class="kao-milestone">'+icon('flag',15)+' '+esc(kaoMilestoneLabel(q))+'</p><button type="button" class="kao-link-button" onclick="App.kaoSetView(\'units\')">Tüm üniteleri gör</button><button type="button" class="kao-link-button" onclick="App.kaoOpenSurah(114)">20 kısa sûreyi oku</button><button type="button" class="kao-link-button" onclick="App.kaoGate(\'start\')">Seviye 0 giriş kontrolü</button></div></section></main>';
    return h;
  }
  function kaoHubCardHTML(){
    if(!quranLearnDeps) return '';
    var d=quranLearnDeps.data()||{},q=d.quranLearn&&typeof d.quranLearn==='object'&&!Array.isArray(d.quranLearn)?d.quranLearn:{},cards=objectOr(q.cards,{}),known=Object.create(null);
    Object.keys(cards).forEach(function(id){ var card=cards[id]||{},lemma=lemmaIdForCard(id); if(lemma&&card.orphan!==true&&card.readerUnknown!==true&&nonNegativeNumber(card.reps,0)>0) known[lemma]=1; });
    var learned=Object.keys(known).length,today=quranLearnDeps.todayStr(),daily=objectOr(objectOr(q.daily,{})[today],{}),answered=Math.floor(nonNegativeNumber(daily.answered,0)),started=!!q.startedAt||learned>0||answered>0;
    var icon=quranLearnDeps.icon,status=learned?learned+' kelime tanıdık':(answered?answered+' cevap bugün':'İlk oturum hazır'),action=started?'Devam et':'Öğrenmeye başla';
    return '<button type="button" id="kao-hub-entry" class="kao-hub-card" onclick="App.kaoOpen()" aria-haspopup="dialog" aria-label="Kur’an Arapçası Öğreniyorum; '+status+'; '+action+'">'+
      '<span class="kao-hub-spine" aria-hidden="true"></span><span class="kao-hub-frame" aria-hidden="true"></span><span class="kao-hub-ornament" aria-hidden="true">✦</span><span class="kao-hub-head"><span class="kao-hub-seal">'+icon('book-open',21)+'</span><span class="kao-hub-kicker"><small>KUR’AN ARAPÇASI</small><strong>Kur’an Arapçası Öğreniyorum</strong></span><span class="kao-hub-status">'+status+'</span></span>'+
      '<span class="kao-hub-copy">Kelimeleri tanı, kökleri keşfet; âyetlerin anlamına adım adım yaklaş.</span>'+
      '<span class="kao-hub-path" aria-label="Öğrenme yolu"><span><i></i><b>Kelime</b></span><span><i></i><b>Kök</b></span><span><i></i><b>Gramer</b></span><span><i></i><b>Âyet</b></span></span>'+
      '<span class="kao-hub-foot"><span>'+(answered?answered+' cevap bugün':'Günde yaklaşık 6 dakika')+'</span><b>'+action+' '+icon('arrow-right',15)+'</b></span></button>';
  }
  function kaoOverlayHTML(nowValue){
    if(!quranLearnDeps) return '';
    var ui=quranLearnDeps.ui(),icon=quranLearnDeps.icon;
    var view=ui.kaoView||'home',body=view==='home'?kaoHomeHTML(nowValue):(view==='units'?kaoUnitsHTML():(view==='word'?kaoWordHTML():(view==='reader'?kaoReaderHTML():(view==='gate'?kaoGateHTML():'<main class="kao-session">'+kaoTaskHTML(currentTask())+'</main>'))));
    return '<div id="sey-ov-back" class="kao-overlay" onclick="App.kaoClose()"><div id="sey-ov-card" class="kao-dialog" role="dialog" aria-modal="true" aria-labelledby="kao-title" tabindex="-1" onkeydown="App.onModalKeydown(event,App.kaoClose)" onclick="event.stopPropagation()"><span class="kao-dialog-frame" aria-hidden="true"></span><header class="kao-header"><span class="kao-header-mark" aria-hidden="true">'+icon('book-open',20)+'</span><div class="kao-header-copy"><p>Kur’an Arapçası · Günlük öğrenme</p><h1 id="kao-title">Kelimelerini tanı, âyetleri anla</h1></div><button type="button" class="kao-close" onclick="App.kaoClose()" aria-label="Kur’an Arapçası penceresini kapat">'+icon('x',18)+'</button></header><div id="sey-ov-body" class="kao-body scroll" style="'+kaoReadabilityStyle()+'">'+body+'</div></div></div>';
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
    ui.kaoOpen=true; ui.kaoView=typeof view==='string'&&view?view:'home';
    quranLearnSurfaceDeps.lockBody(); quranLearnDeps.render(); quranLearnSurfaceDeps.focusDialog('sey-ov-card');
    return true;
  }
  function kaoClose(){
    if(!quranLearnDeps||!quranLearnSurfaceDeps) return false;
    var body=function(){
      var ui=quranLearnDeps.ui(),returnId=ui.kaoReturnFocusId||'';
      quranLearnSurfaceDeps.unlockBody(); ui.kaoOpen=false; ui.kaoView='home'; ui.kaoReturnFocusId='';
      quranLearnDeps.render(); if(returnId) quranLearnSurfaceDeps.restoreFocus(returnId);
    };
    quranLearnSurfaceDeps.sheetClose('sey-ov-card','sey-ov-back',body);
    return true;
  }
  function kaoSetView(view){
    if(!quranLearnDeps) return false;
    quranLearnDeps.ui().kaoView=typeof view==='string'&&view?view:'home'; quranLearnDeps.render();
    return true;
  }
  function emptyQuranLearn(){
    return {
      schemaVersion:SCHEMA_VERSION,
      lexiconVersion:LEXICON_VERSION,
      startedAt:null,
      gate:{passed:false,skipped:false,score:null,at:null},
      settings:{dailyNew:10,audio:false,harakat:true,translit:true},
      cards:{},units:{},surahs:{},daily:{},
      milestones:{fatiha:null,namaz:null,half:null,twoThirds:null,eighty:null,shortSurahs:null},
      phonics:{style:'muallim'},
      errors:{sound:0,root:0,affix:0,cognate:0,rule:0,order:0},
      ayahs:{understood:[]},
      readability:{lineHeight:'normal',wordSpacing:'normal',coloredHarakat:true,fadeHarakat:false}
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
    q.settings.dailyNew=nonNegativeNumber(q.settings.dailyNew,10);
    q.settings.audio=boolOr(q.settings.audio,false);
    q.settings.harakat=boolOr(q.settings.harakat,true);
    q.settings.translit=boolOr(q.settings.translit,true);

    q.cards=objectOr(q.cards,{});
    q.units=objectOr(q.units,{});
    q.surahs=objectOr(q.surahs,{});
    q.daily=objectOr(q.daily,{});

    q.milestones=objectOr(q.milestones,{});
    ['fatiha','namaz','half','twoThirds','eighty','shortSurahs'].forEach(function(key){
      q.milestones[key]=nullableString(q.milestones[key]);
    });

    q.phonics=objectOr(q.phonics,{});
    if(typeof q.phonics.style!=='string'||!q.phonics.style) q.phonics.style='muallim';

    q.errors=objectOr(q.errors,{});
    ['sound','root','affix','cognate','rule','order'].forEach(function(key){
      q.errors[key]=nonNegativeNumber(q.errors[key],0);
    });

    q.ayahs=objectOr(q.ayahs,{});
    q.ayahs.understood=normalizeUnderstood(q.ayahs.understood);

    q.readability=objectOr(q.readability,{});
    if(['normal','wide','compact','1.9','2.2','2.5'].indexOf(String(q.readability.lineHeight))<0) q.readability.lineHeight='normal';
    if(['normal','wide'].indexOf(q.readability.wordSpacing)<0) q.readability.wordSpacing='normal';
    q.readability.coloredHarakat=boolOr(q.readability.coloredHarakat,true);
    q.readability.fadeHarakat=boolOr(q.readability.fadeHarakat,false);

    if(previousVersion!==LEXICON_VERSION) markOrphans(q.cards);
    return q;
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
    kaoFragmentCandidates:fragmentCandidates,
    kaoBuildFragmentTask:kaoBuildFragmentTask,
    kaoShouldAutoplay:kaoShouldAutoplay,
    kaoTaskHTML:kaoTaskHTML,
    kaoStart:kaoStart,
    kaoAnswer:kaoAnswer,
    kaoUndo:kaoUndo,
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
    kaoUnits:kaoUnits,
    kaoUnitsHTML:kaoUnitsHTML,
    kaoOpenWord:kaoOpenWord,
    kaoWordLayer:kaoWordLayer,
    kaoVerifiedAyahPronunciation:kaoVerifiedAyahPronunciation,
    kaoWordHTML:kaoWordHTML,
    kaoFlag:kaoFlag,
    kaoSurahs:kaoSurahs,
    kaoOpenSurah:kaoOpenSurah,
    kaoRevealWord:kaoRevealWord,
    kaoMarkUnderstood:kaoMarkUnderstood,
    kaoReaderHTML:kaoReaderHTML,
    kaoHubCardHTML:kaoHubCardHTML,
    kaoHomeHTML:kaoHomeHTML,
    kaoOverlayHTML:kaoOverlayHTML,
    kaoMount:kaoMount,
    kaoOpen:kaoOpen,
    kaoClose:kaoClose,
    kaoSetView:kaoSetView
  };
})();
