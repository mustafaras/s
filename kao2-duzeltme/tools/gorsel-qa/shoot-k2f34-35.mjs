// usage: node shoot-k2f34-35.mjs <root> <outDir> <profileName>
// K2F-34 (yerleştirme şıkları) + K2F-35 (halka %, ünite "kalıcı kelime", namaz taşı etiketi) görsel kanıtı. Sentetik veri.
import { launch } from './cdp.mjs';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
const [root, out, prof] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await launch(root, path.join(os.tmpdir(), prof));
const log = [];
const shot = async (name, js, dump = 500) => {
  try {
    if (js) await b.eval(js);
    await b.wait(700);
    await b.shot(path.join(out, name + '.png'));
    const txt = await b.eval(`(function(){var d=document.querySelector('[role=dialog]')||document.body;return d.innerText.replace(/\\s+/g,' ').slice(0,${dump})})()`);
    log.push(`${name}: ${txt}`);
  } catch (e) { log.push(`${name}: SKIP ${String(e.message).slice(0, 120)}`); }
};
await b.goto('http://127.0.0.1:9000/index.html?v3done=1');
await b.eval(`localStorage.setItem('seyma-reset-v1', JSON.stringify((function(){var d=window.createDefaultData();d.settings.locationEnabled=true;return d})()))`);
await b.goto('http://127.0.0.1:9000/index.html?v3done=1');
log.push('origin: ' + await b.eval('location.origin + " force:" + localStorage.getItem("seyma-sync-force")'));
await b.eval(`(function(){
  ui.authUnlocked=true; ui.locationGateState='granted';
  var q=SeymaQuranLearn.ensureQuranLearn(data);
  q.onboarding.doneAt='2026-09-20T00:00:00.000Z';
  var L=window.QuranLexiconV1.lemmas.slice().sort(function(a,b){return (b.freq||0)-(a.freq||0)}).slice(0,60);
  L.forEach(function(l){['ar>tr','tr>ar'].forEach(function(d){q.cards['w:'+l.id+':'+d]={state:'review',s:40,due:'2026-12-01T00:00:00.000Z'}})});
  q.path.lessons=q.path.lessons||{}; q.path.lessons['u01.01']={doneAt:'2026-09-25T00:00:00.000Z'};
  return true})()`);
await shot('K35-1-uniteler-halka', `SeymaQuranLearn.kaoOpen('home'); SeymaQuranLearn.kaoSetView('units')`, 700);
await shot('K35-2-unite-detayi', `SeymaQuranLearn.kaoNav('unit',1)`, 500);
await shot('K35-3-ilerleme-tas-etiketi', `(function(){var q=SeymaQuranLearn.ensureQuranLearn(data);q.milestones={besmele:'2026-09-21T00:00:00.000Z',fatiha:'2026-09-24T00:00:00.000Z'}})(); SeymaQuranLearn.kaoSetView('stats'); (function(){var n=[].slice.call(document.querySelectorAll('li,p,span,div,h3')).filter(function(e){return /Namazda geçen|Namazımı anlıyorum/.test(e.textContent)&&e.children.length<4}).pop();if(n)n.scrollIntoView({block:'center'})})()`, 900);
// K2F-34: yerleştirme okuma soruları (8) — her soruda doğru şık işaretlenmeden, ekranda görünen haliyle
await b.eval(`SeymaQuranLearn.kaoSetView('home'); App.kaoOnboard('change-start'); App.kaoOnboard('choose','slow')`);
for (let i = 1; i <= 8; i++) {
  await shot('K34-okuma-' + i, null, 260);
  const info = await b.eval(`(function(){var t=SeymaQuranLearn.kaoPlacementTasks().reading[${i - 1}];return t.choices.map(function(c,k){return (c===t.answer?'*':'')+c+'('+c.normalize('NFC').length+')'}).join(' | ')})()`);
  log.push(`K34-okuma-${i} şıklar (*doğru, parantez harf sayısı): ${info}`);
  await b.eval(`(function(){var t=SeymaQuranLearn.kaoPlacementTasks().reading[${i - 1}];App.kaoOnboard('answer',t.answer)})()`);
}
fs.writeFileSync(path.join(out, 'log.txt'), log.join('\n') + '\nblocked-external: ' + b.blocked.length + '\n');
console.log(log.join('\n'));
console.log('blocked external requests:', b.blocked.length);
await b.close();
