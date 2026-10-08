// Denetim-3: 109 dersin yürüyüşünde GÖSTERİLEN gramer görevlerini topla (ağsız VM, gerçek handler'lar).
const path=require('path'); const root=process.argv[2];
const H=require(path.join(root,'tests/kao/helpers/kao-harness.js'));
const t=H.bootKao(); const q=H.freshUser(t);
const C=t.win.QuranCurriculumV2; const lessons=C.units.flatMap(u=>u.lessons.map(l=>l.id));
const out=[];
for(const id of lessons){
  t.ui.kaoLesson=null;
  if(!t.api.kaoLesson('start',id)) { out.push({lesson:id,err:'start false'}); continue; }
  const st=t.ui.kaoLesson;
  for(let g=0;g<400;g++){
    if(st.phase==='practice'||st.phase==='review'){
      const item=t.ui.kaoQueue[t.ui.kaoTaskIndex]; const task=item&&t.ui.kaoTasks[item.id]; if(!task) break;
      if(task.type==='grammar'||(item.group==='concept')||/^g:/.test(String(item.cardId||task.cardId||''))){
        out.push({lesson:id,cardId:item.cardId||task.cardId,kind:task.kind||'choice',gtype:task.grammarType,prompt:task.prompt,stimulus:task.stimulus||null,pron:task.stimulusPronunciation||'',answer:task.answer||null,teach:task.teach||task.explain||null,
          context:(task.context||[]).map(c=>c.label+(c.pronunciation?' ['+c.pronunciation+']':'')),
          choices:(task.choices||[]).map(c=>({l:c.label,p:c.pronunciation||'',correct:!!c.correct,ord:c.ordinal}))});
      }
      const ch=task.choices||[];
      if(task.kind==='order'){ ch.slice().sort((a,b)=>a.ordinal-b.ordinal).forEach(c=>t.api.kaoAnswer(task.id,c.choiceId)); }
      else { const p=ch.find(c=>c.correct)||ch[0]; t.api.kaoAnswer(task.id,p.choiceId); }
      t.api.kaoContinue(); continue;
    }
    const cur=st.plan[st.at]; if(!cur||cur.kind==='summary') break; t.api.kaoLesson('next');
  }
}
require('fs').writeFileSync(process.argv[3],JSON.stringify(out,null,1));
console.log('ders',lessons.length,'gösterilen gramer görevi',out.filter(x=>!x.err).length,'hata',out.filter(x=>x.err).length);
const kinds={}; out.forEach(x=>kinds[x.kind+'/'+x.gtype]=(kinds[x.kind+'/'+x.gtype]||0)+1); console.log(kinds);
