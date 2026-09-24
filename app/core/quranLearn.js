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
    var remaining=due.concat(selectedNew),out=[],typeCounts={grammar:0,fragment:0,word:0};
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
      out.push({id:'kao:'+daySeed(now)+':'+chosen.cardId,cardId:chosen.cardId,type:chosen.type,isNew:chosen.isNew});
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
    var choices=[{cardId:id,label:answer,correct:true}].concat(picked.map(function(item){
      var itemMeta=metaFor(item.cardId,null,opts);
      return {cardId:item.cardId,label:direction==='tr>ar'?String(itemMeta.ar||item.label):String(item.label),correct:false};
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
      if(lemma&&(card.state==='review'||card.st==='review'||nonNegativeNumber(card.reps,0)>0)) known[lemma]=1;
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
  function cellText(cell){ return Array.isArray(cell)?String(cell[1]||''):(typeof cell==='string'?cell:''); }
  function choiceList(values,answer,seed,taskId){
    var seen=Object.create(null),list=[];
    [answer].concat(values).forEach(function(value){ value=String(value||''); if(value&&!seen[value]){ seen[value]=1; list.push(value); } });
    list=list.slice(0,4).map(function(label){ return {label:label,correct:label===answer}; });
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
    var row=rows[index]||{},answer='',stimulus='',context=[],alternatives=[],errorClass=type==='Ek çöz'?'affix':type==='Kök bul'?'root':'rule';
    if(type==='Ek çöz'){
      var cells=(row.cells||[]).map(function(cell,cellIndex){ return {text:cellText(cell),label:String((table.columns||[])[cellIndex+1]||row.label||'parça')}; }).filter(function(item){ return item.text; });
      var picked=cells[cells.length-1]||{text:String(row.label||''),label:String(row.label||'')};
      stimulus=picked.text; answer='el + '+String(row.label||'kelime'); alternatives=rows.map(function(item){ return 'el + '+String(item.label||'kelime'); }).concat([String(row.label||''),picked.label]);
      context=['el = o bilinen',String(row.label||concept.title)];
    }else if(type==='Çekim tablosu'){
      var arabic=(row.cells||[]).map(cellText).filter(function(value){ return /[\u0600-\u06ff]/.test(value); });
      answer=arabic[0]||String(row.label||''); stimulus=String(row.label||''); alternatives=rows.flatMap(function(item){ return (item.cells||[]).map(cellText).filter(function(value){ return /[\u0600-\u06ff]/.test(value); }); });
      context=[String(table.title||concept.title)];
    }else if(type==='Kök bul'){
      var root=rootForLabel(row.label),arabicWord=(row.cells||[]).map(cellText).find(function(value){ return /[\u0600-\u06ff]/.test(value); });
      stimulus=arabicWord||String(row.label||''); answer=root?Array.from(root.root).join('–'):String(row.label||'');
      var roots=window.QuranGrammarV1&&window.QuranGrammarV1.unit11&&window.QuranGrammarV1.unit11.roots||[];
      alternatives=roots.slice(0,12).map(function(item){ return Array.from(item.root).join('–'); }); context=[String(row.label||concept.title)];
    }else{
      var matches=rows.map(function(item){ var arabic=(item.cells||[]).map(cellText).filter(function(value){ return /[\u0600-\u06ff]/.test(value); }),shift=(item.cells||[]).map(cellText).find(function(value){ return /^[IVX]+:/.test(value); }); return {word:arabic[1]||arabic[0]||'',meaning:shift?shift.replace(/^[IVX]+:\s*/, ''):String(item.label||'')}; }).filter(function(item){ return item.word&&item.meaning; }).slice(0,3);
      var selected=matches[seededRank(seed,template.id)%Math.max(1,matches.length)]||{word:'',meaning:''};
      stimulus=selected.word; answer=selected.meaning; alternatives=matches.map(function(item){ return item.meaning; }); context=matches.map(function(item){ return item.word; });
    }
    return {id:taskId,cardId:cardId,type:'grammar',grammarType:type,isNew:!!(queueItem&&queueItem.isNew),retry:!!(queueItem&&queueItem.retry),prompt:String(template.prompt||type),stimulus:stimulus,context:context,errorClass:errorClass,answer:answer,clipId:'',choices:choiceList(alternatives,answer,seed,taskId)};
  }
  function kaoCandidates(){
    var lex=window.QuranLexiconV1;
    if(!lex||!Array.isArray(lex.lemmas)) return [];
    var candidates=grammarCandidates().concat(lex.lemmas.map(function(lemma,index){ var direction=index%2?'tr>ar':'ar>tr'; return {id:'w:'+lemma.id+':'+direction,type:direction==='tr>ar'?'arabic':'meaning'}; })),cards=objectOr(quranLearnRoot(quranLearnDeps.data()).cards,{});
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
  function kaoTaskHTML(task){
    if(!quranLearnDeps) return '';
    var ui=quranLearnDeps.ui(),esc=quranLearnDeps.esc;
    if(!task) return '<section id="kao-task" class="kao-task"><h2>Oturum tamamlandı</h2><button type="button" class="kao-primary" onclick="App.kaoSetView(\'home\')">Ana ekrana dön</button></section>';
    var autoplay=kaoShouldAutoplay(task,quranLearnDeps.data()),isGrammar=!!task.grammarType,prompt=isGrammar?task.prompt:(task.direction==='tr>ar'?task.meaning:task.ar);
    var h='<section id="kao-task" class="kao-task" data-task-id="'+esc(task.id)+'"'+(autoplay?' data-autoplay="1"':'')+'>';
    h+='<div class="kao-task-top"><span>'+(isGrammar?esc(task.grammarType):(task.direction==='tr>ar'?'Arapçayı seç':'Anlamı seç'))+'</span><span>'+String((ui.kaoTaskIndex||0)+1)+' / '+String((ui.kaoQueue||[]).length)+'</span></div>';
    h+='<h2 class="kao-question'+(autoplay&&task.direction==='ar>tr'?' kao-audio-pending':'')+'"'+(!isGrammar&&task.direction==='ar>tr'?' lang="ar" dir="rtl" data-kao-ar':'')+'>'+esc(prompt)+'</h2>';
    if(isGrammar){ h+='<p class="kao-grammar-stimulus"'+(/[\u0600-\u06ff]/.test(task.stimulus)?' lang="ar" dir="rtl"':'')+'>'+esc(task.stimulus)+'</p>'; if(task.context&&task.context.length) h+='<div class="kao-grammar-context">'+task.context.map(function(item){ return '<span>'+esc(item)+'</span>'; }).join('')+'</div>'; }
    if(task.translit&&task.direction==='ar>tr') h+='<p class="kao-translit">'+esc(task.translit)+'</p>';
    if(task.clipId) h+='<button type="button" class="kao-audio" aria-label="Yavaş dinlemek için dokun; doğal hız için 350 milisaniye basılı tut" onpointerdown="this.dataset.kaoLong=\'\';this._kaoHold=setTimeout(()=>{this.dataset.kaoLong=\'1\';App.kaoPlay(\''+task.clipId+'\',\'flowing\')},350)" onpointerup="clearTimeout(this._kaoHold)" onpointercancel="clearTimeout(this._kaoHold)" onclick="if(this.dataset.kaoLong!==\'1\')App.kaoPlay(\''+task.clipId+'\',\'measured\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();App.kaoPlay(\''+task.clipId+'\',event.shiftKey?\'flowing\':\'measured\')}">'+quranLearnDeps.icon('volume-2',17)+' Dinle</button>';
    h+=kaoCognateHTML(task)+'<div class="kao-choices">';
    task.choices.forEach(function(choice){ h+='<button type="button"'+(isGrammar?' class="kao-chip"':(task.direction==='tr>ar'?' lang="ar" dir="rtl" data-kao-ar'+(autoplay?' class="kao-audio-pending"':''):''))+' onclick="App.kaoAnswer(\''+task.id+'\',\''+choice.choiceId+'\')">'+esc(choice.label)+'</button>'; });
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
    ui.kaoTaskIndex=0; ui.kaoTaskStartedAt=now.getTime(); ui.kaoUndo=null; ui.kaoFeedback=''; ui.kaoAudioFailed=false; ui.kaoTasks={}; ui.kaoView='session';
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
    var d=quranLearnDeps.data(),q=ensureQuranLearn(d),cards=q.cards,key=quranLearnDeps.todayStr(),now=new Date(),hadCard=Object.prototype.hasOwnProperty.call(cards,task.cardId),hadDaily=Object.prototype.hasOwnProperty.call(q.daily,key);
    ui.kaoUndo={expiresAt:now.getTime()+3000,cardId:task.cardId,hadCard:hadCard,card:cloneValue(cards[task.cardId]),dailyKey:key,hadDaily:hadDaily,daily:cloneValue(q.daily[key]),errors:cloneValue(q.errors),taskIndex:ui.kaoTaskIndex,queue:cloneValue(ui.kaoQueue)};
    var previous=objectOr(cards[task.cardId],{}),correct=choice.correct===true,grade=kaoGrade(correct,Math.max(0,now.getTime()-nonNegativeNumber(ui.kaoTaskStartedAt,now.getTime())),previous.reps);
    cards[task.cardId]=kaoSchedule(previous,grade,now);
    var daily=Object.assign({answered:0,correct:0,new:0,reviewed:0},objectOr(q.daily[key],{}));
    daily.answered+=1; if(correct) daily.correct+=1; if(task.isNew) daily.new+=1; else daily.reviewed+=1; q.daily[key]=daily;
    if(!correct&&task.errorClass&&Object.prototype.hasOwnProperty.call(q.errors,task.errorClass)) q.errors[task.errorClass]+=1;
    if(!correct&&!task.retry) ui.kaoQueue.push(Object.assign({},ui.kaoQueue[ui.kaoTaskIndex],{id:task.id+':retry',retry:true,isNew:false}));
    ui.kaoFeedback=correct?'Doğru':'Doğru cevap: '+task.answer; ui.kaoTaskIndex+=1; ui.kaoTaskStartedAt=now.getTime();
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
    ui.kaoQueue=cloneValue(undo.queue); ui.kaoTaskIndex=undo.taskIndex; ui.kaoTaskStartedAt=Date.now(); ui.kaoUndo=null; ui.kaoFeedback='Geri alındı';
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
  function kaoHomeHTML(nowValue){
    if(!quranLearnDeps) return '';
    var d=quranLearnDeps.data(),q=ensureQuranLearn(d),now=nowValue?validDate(nowValue,'now'):new Date();
    var stats=kaoTodayStats(d,now),understood=(q.ayahs&&Array.isArray(q.ayahs.understood))?q.ayahs.understood.length:0;
    var percent=Math.min(100,Math.round(stats.known/524*100)),night=kaoNightWindow(d,now),esc=quranLearnDeps.esc,icon=quranLearnDeps.icon;
    var h='<main class="kao-home" aria-labelledby="kao-title">';
    h+='<section class="kao-hero"><p class="kao-eyebrow">Kapsam</p><div class="kao-coverage"><strong>'+percent+'%</strong><span>Kur’an kelimelerinin %'+percent+' kadarını tanıyorsun</span></div><div class="kao-progress" role="progressbar" aria-label="Kur’an kelime kapsamı" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+percent+'"><span style="width:'+percent+'%"></span></div><p class="kao-ayah-count">Anlaşılan âyet sayısı: '+understood+'</p></section>';
    h+='<section class="kao-today"><p class="kao-eyebrow">Bugün</p><h2>'+stats.due+' tekrar · '+stats.fresh+' yeni · ~'+stats.minutes+' dk</h2>';
    if(night) h+='<p class="kao-night">'+icon('moon',15)+' Gece tekrarı açık · '+night.durationMinutes+' dk, en fazla '+night.maxCards+' tekrar</p>';
    h+='<button type="button" class="kao-primary" onclick="App.kaoStart()">Bugünkü oturuma başla '+icon('arrow-right',16)+'</button></section>';
    h+='<section class="kao-summary"><div><p class="kao-eyebrow">Sıradaki ünite</p><h2>'+esc(kaoUnitLabel(q))+'</h2></div><p class="kao-milestone">'+icon('flag',15)+' '+esc(kaoMilestoneLabel(q))+'</p></section></main>';
    return h;
  }
  function kaoHubCardHTML(){
    if(!quranLearnDeps) return '';
    var d=quranLearnDeps.data()||{},q=d.quranLearn&&typeof d.quranLearn==='object'&&!Array.isArray(d.quranLearn)?d.quranLearn:{},cards=objectOr(q.cards,{}),known=Object.create(null);
    Object.keys(cards).forEach(function(id){ var card=cards[id]||{},lemma=lemmaIdForCard(id); if(lemma&&card.orphan!==true&&nonNegativeNumber(card.reps,0)>0) known[lemma]=1; });
    var learned=Object.keys(known).length,today=quranLearnDeps.todayStr(),daily=objectOr(objectOr(q.daily,{})[today],{}),answered=Math.floor(nonNegativeNumber(daily.answered,0)),started=!!q.startedAt||learned>0||answered>0;
    var icon=quranLearnDeps.icon,status=learned?learned+' kelime tanıdık':(answered?answered+' cevap bugün':'İlk oturum hazır'),action=started?'Devam et':'Öğrenmeye başla';
    return '<button type="button" id="kao-hub-entry" class="kao-hub-card" onclick="App.kaoOpen()" aria-haspopup="dialog" aria-label="Kur’an Arapçası Öğreniyorum; '+status+'; '+action+'">'+
      '<span class="kao-hub-frame" aria-hidden="true"></span><span class="kao-hub-head"><span class="kao-hub-seal">'+icon('book-open',21)+'</span><span class="kao-hub-kicker"><small>KUR’AN ARAPÇASI</small><strong>Kur’an Arapçası Öğreniyorum</strong></span><span class="kao-hub-status">'+status+'</span></span>'+
      '<span class="kao-hub-copy">Kelimeleri tanı, kökleri keşfet; âyetlerin anlamına adım adım yaklaş.</span>'+
      '<span class="kao-hub-path" aria-label="Öğrenme yolu"><span><i></i><b>Kelime</b></span><span><i></i><b>Kök</b></span><span><i></i><b>Gramer</b></span><span><i></i><b>Âyet</b></span></span>'+
      '<span class="kao-hub-foot"><span>'+(answered?answered+' cevap bugün':'Günde yaklaşık 6 dakika')+'</span><b>'+action+' '+icon('arrow-right',15)+'</b></span></button>';
  }
  function kaoOverlayHTML(nowValue){
    if(!quranLearnDeps) return '';
    var ui=quranLearnDeps.ui(),icon=quranLearnDeps.icon;
    var body=(ui.kaoView||'home')==='home'?kaoHomeHTML(nowValue):'<main class="kao-session">'+kaoTaskHTML(currentTask())+'</main>';
    return '<div id="sey-ov-back" class="kao-overlay" onclick="App.kaoClose()"><div id="sey-ov-card" class="kao-dialog" role="dialog" aria-modal="true" aria-labelledby="kao-title" tabindex="-1" onkeydown="App.onModalKeydown(event,App.kaoClose)" onclick="event.stopPropagation()"><header class="kao-header"><button type="button" class="kao-close" onclick="App.kaoClose()" aria-label="Kur’an Arapçası penceresini kapat">'+icon('x',18)+'</button><div><p>Kur’an Arapçası</p><h1 id="kao-title">Kelimelerini tanı, âyetleri anla</h1></div></header><div id="sey-ov-body" class="kao-body scroll">'+body+'</div></div></div>';
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
    if(['normal','wide','compact'].indexOf(q.readability.lineHeight)<0) q.readability.lineHeight='normal';
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
    kaoPickDistractors:kaoPickDistractors,
    kaoBuildTask:kaoBuildTask,
    kaoGrammarCandidates:grammarCandidates,
    kaoBuildGrammarTask:kaoBuildGrammarTask,
    kaoShouldAutoplay:kaoShouldAutoplay,
    kaoTaskHTML:kaoTaskHTML,
    kaoStart:kaoStart,
    kaoAnswer:kaoAnswer,
    kaoUndo:kaoUndo,
    kaoPlay:kaoPlay,
    kaoNightWindow:kaoNightWindow,
    kaoHubCardHTML:kaoHubCardHTML,
    kaoHomeHTML:kaoHomeHTML,
    kaoOverlayHTML:kaoOverlayHTML,
    kaoMount:kaoMount,
    kaoOpen:kaoOpen,
    kaoClose:kaoClose,
    kaoSetView:kaoSetView
  };
})();
