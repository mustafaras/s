// K3PD-15 görsel kanıt: ders zirvesinde ses–kelime senkronu.
// Kontrollü yerel QA: sunucu yok, soket yok; CDP pipe, boş geçici profil, origin 127.0.0.1:9000
// (sync.js Guard 1 geçerli), token yok, forceSync yok, dış istekler kesik.
// usage (repo kökünden): node kao3-premium/duzeltme-plani/kanit/K3PD-15/gorsel/yeniden-uret-1-ses-bitmeden.mjs <root> <outDir> <profileName> <label>
import { launch } from '../../../../../tools/kapi/gorsel-qa/cdp.mjs';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const [root, out, prof, label] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await launch(root, path.join(os.tmpdir(), prof));
const log = [];
const shot = (n) => b.shot(path.join(out, n + '.png'));
const gilded = () => b.eval(`document.querySelectorAll('.kao-tezhip-word.is-gild').length`);
const total = () => b.eval(`document.querySelectorAll('.kao-tezhip-word').length`);

await b.goto('http://127.0.0.1:9000/index.html?v3done=1');
await b.eval(`localStorage.setItem('seyma-reset-v1', JSON.stringify((function(){var d=window.createDefaultData();d.settings.locationEnabled=true;var q=SeymaQuranLearn.ensureQuranLearn(d);q.onboarding.doneAt='2026-09-20T00:00:00.000Z';q.onboarding.start='level1';q.settings.audio=true;return d})()))`);
await b.goto('http://127.0.0.1:9000/index.html?v3done=1');
log.push(`[${label}] origin: ` + await b.eval('location.origin + " · token:" + !!(data.settings&&data.settings.ghToken) + " · force:" + localStorage.getItem("seyma-sync-force")'));

const ready = `(function(){
  ui.authUnlocked=true; ui.locationGateState='granted'; ui.tab='bugun';
  var q=SeymaQuranLearn.ensureQuranLearn(data); q.settings.audio=true;
  SeymaQuranLearn.kaoOpen('home');
  if(!SeymaQuranLearn.kaoLesson('start','u01.02','intro')) return 'start-failed';
  var notes=[],guard=0;
  while(guard++<400){
    var st=ui.kaoLesson; if(!st) return 'no-state';
    var cur=st.plan[st.at||0];
    if(cur&&cur.kind==='apply') break;
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
      if(!hit) return 'no-choice';
      SeymaQuranLearn.kaoAnswer(t.id,hit.choiceId); SeymaQuranLearn.kaoContinue(); continue;
    }
    if(cur&&cur.kind==='partEnd'){ if(!SeymaQuranLearn.kaoLesson('budget-overrun')) return 'overrun-false'; continue; }
    if(!SeymaQuranLearn.kaoLesson('next')) return 'next-false@'+st.at;
  }
  var at=ui.kaoLesson.at;
  return 'at-apply@'+at;
})()`;
log.push(`[${label}] setup: ` + await b.eval(ready));
await b.wait(700);
const N = await total();
log.push(`[${label}] tezhip satırı: ${N} kelime · başlangıçta yaldız: ${await gilded()}`);
await shot(`${label}-0-yaldiz-oncesi`);

// --- Kontrollü sentetik ses: `play()` hiç bitmez (no ended, no error) -------
// Düzeltme öncesi kod bu durumda 9 kelimeyi timer ile yaldızlıyordu; yeni kod ilk kelimede bekler.
await b.eval(`(function(){window.__realPlay=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){return new Promise(function(){});};return true})()`);
await b.eval(`App.kaoLesson('gild')`);
await b.wait(350);
log.push(`[${label}] sentetik ses (ended yok) t=350ms  → yaldız: ${await gilded()}/${N}`);
await shot(`${label}-1-sentetik-350ms`);
await b.wait(1500);
log.push(`[${label}] sentetik ses (ended yok) t=1850ms → yaldız: ${await gilded()}/${N}`);
await shot(`${label}-2-sentetik-1850ms`);

// --- Çıkış: yarım kalan yaldız ve eski timer temizlenir ---------------------
await b.eval(`(function(){HTMLMediaElement.prototype.play=window.__realPlay;return true})()`);
const beforeExit = await gilded();
await b.eval(`SeymaQuranLearn.kaoLesson('exit')`);
await b.wait(1400);
log.push(`[${label}] çıkıştan sonra (1,4 sn bekleme): ekranda yaldız ${await b.eval(`document.querySelectorAll('.is-gild').length`)} · çıkış anı ${beforeExit}/${N}`);
await shot(`${label}-3-cikis-sonrasi`);

log.push(`[${label}] engellenen dış istek: ` + JSON.stringify(b.blocked.slice(0, 5)));
fs.writeFileSync(path.join(out, `log-${label}.txt`), log.join('\n') + '\n');
console.log(log.join('\n'));
await b.close();
