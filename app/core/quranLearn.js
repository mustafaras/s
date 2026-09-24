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

  function registerQuranLearn(deps){
    if(quranLearnDeps||!deps||typeof deps!=='object'||Array.isArray(deps)) return false;
    for(var i=0;i<REQUIRED_DEPS.length;i+=1){
      if(typeof deps[REQUIRED_DEPS[i]]!=='function') return false;
    }
    quranLearnDeps=deps;
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
    if(explicit==='grammar'||explicit==='fragment'||explicit==='word') return explicit;
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
    return {cardId:id,type:cardType(id,raw.type),isNew:isNew,card:card,raw:raw,semantic:semanticInfo(id,raw,opts)};
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
    records.sort(function(a,b){ return seededRank(seed,a.cardId)-seededRank(seed,b.cardId)||a.cardId.localeCompare(b.cardId); });
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
        if(item.type==='grammar'&&typeCounts.grammar>=3) continue;
        if(item.type==='fragment'&&typeCounts.fragment>=2) continue;
        var n=out.length;
        if(n>=2&&out[n-1].type===item.type&&out[n-2].type===item.type) continue;
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
    var meta=metaFor(id,queueItem,opts),meanings=Array.isArray(meta.meanings)?meta.meanings:[];
    var answer=String(meanings[0]||meta.meaning||meta.ar||id);
    var choices=[{cardId:id,label:answer,correct:true}].concat(kaoPickDistractors(d,id,3,opts).map(function(item){ return {cardId:item.cardId,label:item.label,correct:false}; }));
    choices.sort(function(a,b){ return seededRank(String(opts.seed||'')+'|task|'+id,a.cardId)-seededRank(String(opts.seed||'')+'|task|'+id,b.cardId); });
    return {id:String(queueItem&&queueItem.id||'task:'+id),cardId:id,type:cardType(id,queueItem&&queueItem.type),isNew:!!(queueItem&&queueItem.isNew),answer:answer,choices:choices};
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
    if(!quranLearnDeps||typeof quranLearnDeps.caffeineTargetBed!=='function') return false;
    var target;
    try{ target=quranLearnDeps.caffeineTargetBed(); }catch(_error){ return false; }
    var bed=minuteOfDay(target),now=validDate(nowValue,'now');
    if(bed==null) return false;
    var current=now.getHours()*60+now.getMinutes(),until=(bed-current+1440)%1440;
    if(until>90) return false;
    return {active:true,targetBed:target,startsAt:minuteLabel(bed-90),durationMinutes:3,maxCards:8,reviewOnly:true};
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
    emptyQuranLearn:emptyQuranLearn,
    ensureQuranLearn:ensureQuranLearn,
    kaoGrade:kaoGrade,
    kaoSchedule:kaoSchedule,
    kaoBuildQueue:kaoBuildQueue,
    kaoPickDistractors:kaoPickDistractors,
    kaoBuildTask:kaoBuildTask,
    kaoNightWindow:kaoNightWindow
  };
})();
