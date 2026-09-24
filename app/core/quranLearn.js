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
    kaoSchedule:kaoSchedule
  };
})();
