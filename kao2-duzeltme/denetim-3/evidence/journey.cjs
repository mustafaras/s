// Denetim-3 bağımsız yolculuk: her gün yalnız ana ekrandaki BİRİNCİL düğmeye dokun (durum elle kurulmaz), günü ilerlet.
const path=require('path'); const root=process.argv[2];
const H=require(path.join(root,'tests/kao/helpers/kao-harness.js'));
const parseArgs=s=>Function('return ['+s.replace(/&quot;/g,'"').replace(/&#39;/g,"'")+']')();
function dayIso(i){ return new Date(Date.UTC(2026,9,1+i,9,0,0)).toISOString(); }
function journey(label,start,days,tapsPerDay){
  let q=null; const lessons=[], s0=new Set(), log=[]; let t;
  for(let d=0; d<days; d++){
    t=H.bootKao({now:dayIso(d)});
    if(!q){ q=H.freshUser(t,start?{start}:undefined); } else { t.data.quranLearn=q; }
    for(let k=0;k<tapsPerDay;k++){
      H.openView(t,'home'); const tap=H.tapPrimary(t);
      if(!tap){ log.push(d+':yok'); break; }
      log.push(d+':'+tap.name+'('+tap.args.join(',')+')');
      if(tap.name==='kaoS0'&&t.ui.kaoS0){
        s0.add(t.ui.kaoS0.lessonId);
        for(let g=0;g<300&&t.ui.kaoS0&&!t.ui.kaoS0.done;g++){
          const st=t.ui.kaoS0; const flow=t.api.kaoS0Lesson?t.api.kaoS0Lesson(st.lessonId):null;
          const dr=st.drill;
          if(dr&&dr.items&&dr.picked===null){ const it=dr.items[dr.index]; const c=it.choices.find(c=>c.correct===true); t.api.kaoS0('answer',c.id); continue; }
          if(t.api.kaoS0('next')) continue;
          if(t.api.kaoS0('read')) continue;
          log.push(d+':S0 takıldı stage='+st.stage); break;
        }
        if(t.ui.kaoS0&&t.ui.kaoS0.done) log.push(d+':S0 bitti '+t.ui.kaoS0.lessonId);
        continue;
      }
      if(t.ui.kaoLesson){ lessons.push(String(tap.args[1]||t.ui.kaoLesson.lessonId)); H.playLesson(t,{answer:'correct'}); t.api.kaoLesson('finish'); }
    }
    q=t.data.quranLearn;
  }
  const units=(q.path&&q.path.units)||{}; const masteryAt=Object.keys(units).filter(k=>units[k]&&units[k].masteryAt);
  return {label,lessons,s0:[...s0],masteryAt,log};
}
const a=journey('level1',null,25,3);
console.log(JSON.stringify({senaryo:a.label,açılanDersler:a.lessons,masteryAt:a.masteryAt,ilkEylemler:a.log.slice(0,12)}));
console.log('Ünite 1 ustalığı kaydedildi (masteryAt):', a.masteryAt.length?'EVET '+a.masteryAt.join(','):'HAYIR');
console.log('Ünite 2 dersine birincil düğmeyle ulaşıldı:', a.lessons.some(x=>/u02\./.test(x))?'EVET':'HAYIR');
const b=journey('s0',  's0',16,2);
console.log(JSON.stringify({senaryo:b.label,s0Dersleri:b.s0,eylemler:b.log}));
console.log('S0 ana yolu ders açıyor (boş değil):', b.s0.length?'EVET ('+b.s0.length+' ders)':'HAYIR');
