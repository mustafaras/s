// K3PD-15 ek görsel kanıt: (a) ended ile ilerleme, (b) klipsiz satır, (c) reduced-motion.
import { launch } from '../../../../../tools/kapi/gorsel-qa/cdp.mjs';
import os from 'node:os'; import path from 'node:path'; import fs from 'node:fs';
const [root, out, prof, label] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await launch(root, path.join(os.tmpdir(), prof));
const log = [];
const gilded = () => b.eval(`document.querySelectorAll('.kao-tezhip-word.is-gild').length`);
const total = () => b.eval(`document.querySelectorAll('.kao-tezhip-word').length`);
const WALK = `(function(){
  var guard=0;
  while(guard++<400){
    var st=ui.kaoLesson; if(!st) return 'no-state';
    var cur=st.plan[st.at||0];
    if(cur&&cur.kind==='apply') return 'at-apply';
    if(st.phase==='practice'||st.phase==='review'){
      var item=(ui.kaoQueue||[])[ui.kaoTaskIndex||0], t=item&&(ui.kaoTasks||{})[item.id];
      if(!t) return 'no-task';
      if(t.kind==='build'){
        var letters=Array.from(String(t.answer||'').replace(/[\\u064b-\\u065f\\u0670\\u06d6-\\u06ed]/g,''));
        var pool=(t.choices||[]).filter(function(c){return c.correct===true}).slice();
        letters.forEach(function(ch){ var i=-1; for(var k=0;k<pool.length;k+=1){ if(pool[k].label===ch){i=k;break;} } if(i>=0){ SeymaQuranLearn.kaoAnswer(t.id,pool.splice(i,1)[0].choiceId); } });
        SeymaQuranLearn.kaoContinue(); continue;
      }
      if(t.kind==='order'){
        (t.choices||[]).slice().sort(function(a,b){return a.ordinal-b.ordinal}).forEach(function(c){ SeymaQuranLearn.kaoAnswer(t.id,c.choiceId); });
        SeymaQuranLearn.kaoContinue(); continue;
      }
      var hit=(t.choices||[]).filter(function(c){return c.correct})[0]||(t.choices||[])[0];
      SeymaQuranLearn.kaoAnswer(t.id,hit.choiceId); SeymaQuranLearn.kaoContinue(); continue;
    }
    if(cur&&cur.kind==='partEnd'){ if(!SeymaQuranLearn.kaoLesson('budget-overrun')) return 'overrun-false'; continue; }
    if(!SeymaQuranLearn.kaoLesson('next')) return 'next-false@'+st.at;
  }
  return 'guard';
})()`;

async function boot(lessonId, pre) {
  await b.goto('http://127.0.0.1:9000/index.html?v3done=1');
  await b.eval(`localStorage.setItem('seyma-reset-v1', JSON.stringify((function(){var d=window.createDefaultData();d.settings.locationEnabled=true;var q=SeymaQuranLearn.ensureQuranLearn(d);q.onboarding.doneAt='2026-09-20T00:00:00.000Z';q.onboarding.start='level1';q.settings.audio=true;return d})()))`);
  await b.goto('http://127.0.0.1:9000/index.html?v3done=1');
  await b.eval(`(function(){ui.authUnlocked=true;ui.locationGateState='granted';${pre || ''}SeymaQuranLearn.kaoOpen('home');return SeymaQuranLearn.kaoLesson('start','${lessonId}','intro')})()`);
  return b.eval(WALK);
}

// (a) ended olayları vurguyu ilerletir — gerçek <audio> yerine kontrollü sentetik klip.
await boot('u01.02');
log.push(`[${label}] (a) setup: ${await b.eval(`ui.kaoLesson.plan[ui.kaoLesson.at].kind`)} · satır ${await total()} kelime`);
await b.eval(`(function(){
  window.__clips=[];
  var proto=HTMLMediaElement.prototype, realPlay=proto.play;
  proto.play=function(){ window.__clips.push(this); return new Promise(function(){}); };
  proto.__realPlay=realPlay;
  return true})()`);
await b.eval(`App.kaoLesson('gild')`);
await b.wait(400);
log.push(`[${label}] (a) t=400ms (ended yok): ${await gilded()}/${await total()} · izlenen klip: ${await b.eval('window.__clips.length')}`);
await shotSafe(`${label}-a1-ended-bekliyor`);

for (let step = 1; step <= 3; step += 1) {
  await b.eval(`(function(){var a=window.__clips[${step - 1}];if(a){a.dispatchEvent(new Event('ended'));}return !!a})()`);
  await b.wait(300);
  log.push(`[${label}] (a) ${step}. ended sonrası: ${await gilded()}/${await total()}`);
  await shotSafe(`${label}-a${step + 1}-ended-${step}`);
}

// (b) klipsiz satır (u04.01 — örnek cümlelerden kurulur)
const r = await boot('u04.01');
log.push(`[${label}] (b) klipsiz satır setup: ${r} · satır ${await total()} kelime`);
await b.eval(`App.kaoLesson('gild')`);
await b.wait(1400);
log.push(`[${label}] (b) klipsiz satır t=1400ms: ${await gilded()}/${await total()} (sessiz ritmik yedek)`);
await shotSafe(`${label}-b1-klipsiz-satir`);

// (c) reduced-motion: görsel statik
const rc = await boot('u01.02');
// boot yeniden yükler; yama SONRA uygulanır (aksi halde sayfa yenilenince silinir).
log.push(`[${label}] (c) reduced-motion yaması: ` + await b.eval(`(function(){window.SeyFx=Object.assign({},window.SeyFx,{shouldAnimate:function(){return false}});window.matchMedia=function(){return {matches:true,addEventListener:function(){},removeEventListener:function(){}}};return String(window.SeyFx.shouldAnimate())+' / matchMedia '+window.matchMedia('(prefers-reduced-motion:reduce)').matches})()`));
log.push(`[${label}] (c) reduced-motion setup: ${rc} · satır ${await total()} kelime`);
await b.eval(`App.kaoLesson('gild')`);
await b.wait(600);
log.push(`[${label}] (c) reduced-motion t=600ms: ${await gilded()}/${await total()} (statik)`);
await shotSafe(`${label}-c1-reduced-motion`);

async function shotSafe(name) { try { await b.shot(path.join(out, name + '.png')); } catch (e) { log.push(name + ': SHOT-FAIL'); } }

fs.writeFileSync(path.join(out, `log-${label}-ek.txt`), log.join('\n') + '\n');
console.log(log.join('\n'));
console.log('blocked dış istek:', b.blocked.length);
await b.close();
