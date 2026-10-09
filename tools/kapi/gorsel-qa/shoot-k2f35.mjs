// usage: node shoot-k2f35.mjs <root> <outDir> <profileName>
// K2F-34/35 kanıtı: halka %N, ünite "kalıcı kelime", namaz taşı etiketi, yerleştirme okuma/dinleme şık konumu.
// Kontrollü yerel QA: sunucu yok, token yok, forceSync yok; origin 127.0.0.1 (Guard 1).
import { launch } from './cdp.mjs';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
const [root, out, prof] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await launch(root, path.join(os.tmpdir(), prof));
const log = [];
const snap = async (name, js, dump = 500) => {
  try {
    if (js) await b.eval(js);
    await b.wait(700);
    await b.shot(path.join(out, name + '.png'));
    const txt = await b.eval(`(function(){var d=document.querySelector('[role=dialog]')||document.body;return d.innerText.replace(/\\s+/g,' ').slice(0,${dump})})()`);
    log.push(`${name}: ${txt}`);
  } catch (e) { log.push(`${name}: SKIP ${String(e.message).slice(0, 140)}`); }
};
const scrollTo = (text) => `(function(){var n=[].slice.call(document.querySelectorAll('h2,h3,summary,button,label,span,p,strong,li')).filter(function(e){return e.children.length<4&&e.textContent.indexOf(${JSON.stringify(text)})>=0})[0];if(n)n.scrollIntoView({block:'center'});return !!n})()`;
await b.goto('http://127.0.0.1:9000/index.html?v3done=1');
await b.eval(`localStorage.setItem('seyma-reset-v1', JSON.stringify((function(){var d=window.createDefaultData();d.settings.locationEnabled=true;return d})()))`);
await b.goto('http://127.0.0.1:9000/index.html?v3done=1');
log.push('origin: ' + await b.eval('location.origin + " token:" + !!(data.settings&&data.settings.ghToken) + " force:" + localStorage.getItem("seyma-sync-force")'));
const seed = `(function(){
  ui.authUnlocked=true; ui.locationGateState='granted';
  var q=SeymaQuranLearn.ensureQuranLearn(data);
  q.onboarding.doneAt='2026-09-20T00:00:00.000Z'; q.onboarding.start='level1';
  var u1=window.QuranCurriculumV2.units[0];
  var L=window.QuranLexiconV1.lemmas.slice().sort(function(a,b){return (b.freq||0)-(a.freq||0)}).slice(0,60);
  L.forEach(function(l){['ar>tr','tr>ar'].forEach(function(d){q.cards['w:'+l.id+':'+d]={state:'review',s:40,due:'2026-12-01T00:00:00.000Z'}})});
  u1.lessons.slice(0,1).forEach(function(l){q.path.lessons[l.id]={startedAt:'2026-09-21T00:00:00.000Z',doneAt:'2026-09-21T00:00:00.000Z',score:1,introducedLemmas:l.lemmaIds.slice()}});
  q.milestones.besmele='2026-09-21T00:00:00.000Z'; q.milestones.fatiha='2026-09-22T00:00:00.000Z';
  for(var i=1;i<=4;i++){var d=new Date(Date.now()-i*86400000).toISOString().slice(0,10);q.daily[d]={answered:20,correct:16,new:2,reviewed:18,ms:20*9000}}
  return true})()`;
await b.eval(seed);
// (a) Arapça sekmesi hub kartı: halka metni
await snap('a1-hub-halka-arapca-sekmesi', `ui.tab='saygi'; ui.faithTab='arapca'; if(window.SeymaQuranLearn&&SeymaQuranLearn.kaoOpen) {} App.setFaithTab('arapca'); window.scrollTo(0,0);`, 500);
log.push('a1-ring: ' + await b.eval(`(function(){var r=document.querySelector('.kao-hub-card .kao-progress-ring');return r?(r.getAttribute('aria-label')+' | görünür: '+r.querySelector('.kao-progress-ring-text').textContent):'halka yok'})()`));
// (b) Yol: ünite halkaları (Arapça sekmesinden çık: modal ana sekmede açılır)
await b.eval(`ui.tab='bugun'; App.setFaithTab('oz'); true`); await b.wait(500);
await snap('b1-yol-halkalar', `SeymaQuranLearn.kaoOpen('home'); SeymaQuranLearn.kaoSetView('units')`, 500);
log.push('b1-rings: ' + await b.eval(`[].slice.call(document.querySelectorAll('.kao-progress-ring')).map(function(r){return r.getAttribute('aria-label')+' → '+r.querySelector('.kao-progress-ring-text').textContent}).slice(0,3).join(' ; ')`));
// (c) Ünite detayı: "kalıcı kelime"
await snap('c1-unite-kalici-kelime', `SeymaQuranLearn.kaoNav('unit',1)`, 400);
log.push('c1-line: ' + await b.eval(`(function(){var p=document.querySelector('.kao-unit-progress p');return p?p.textContent:'yok'})()`));
// (d) İlerleme: sıradaki taş = namaz (koşul metni) ; sonra namaz kazanıldı (etiket)
await snap('d1-ilerleme-siradaki-tas-namaz', `SeymaQuranLearn.kaoSetView('stats')`, 700);
await b.eval(scrollTo('Namazda geçen')); await b.wait(500);
await b.shot(path.join(out, 'd1b-ilerleme-namaz-kosulu.png'));
log.push('d1-text: ' + await b.eval(`(function(){var m=document.body.innerText.match(/Namaz[^.\\n]{0,90}/g);return m?m.slice(0,4).join(' || '):'eşleşme yok'})()`));
await b.eval(`(function(){var q=SeymaQuranLearn.ensureQuranLearn(data);q.milestones.namaz='2026-09-30T00:00:00.000Z';SeymaQuranLearn.kaoSetView('home');SeymaQuranLearn.kaoSetView('stats')})()`);
await b.wait(600);
await b.eval(scrollTo('Namazda geçen')); await b.wait(500);
await b.shot(path.join(out, 'd2-ilerleme-namaz-kazanildi.png'));
log.push('d2-text: ' + await b.eval(`(function(){var m=document.body.innerText.match(/Namaz[^.\\n]{0,90}/g);return m?m.slice(0,4).join(' || '):'eşleşme yok'})()`));
// (e) Yerleştirme: okuma ve dinleme şık konumu — AYRI boş profil (taze kullanıcı; önceki durum karışmasın)
const blocked1 = b.blocked.length;
await b.close();
const e = await launch(root, path.join(os.tmpdir(), prof + '-e'));
const snapE = async (name, js, dump = 260) => {
  try {
    if (js) await e.eval(js);
    await e.wait(700);
    await e.shot(path.join(out, name + '.png'));
    log.push(`${name}: ` + await e.eval(`(function(){var d=document.querySelector('[role=dialog]')||document.body;return d.innerText.replace(/\\s+/g,' ').slice(0,${dump})})()`));
  } catch (err) { log.push(`${name}: SKIP ${String(err.message).slice(0, 140)}`); }
};
await e.goto('http://127.0.0.1:9000/index.html?v3done=1');
await e.eval(`localStorage.setItem('seyma-reset-v1', JSON.stringify((function(){var d=window.createDefaultData();d.settings.locationEnabled=true;return d})()))`);
await e.goto('http://127.0.0.1:9000/index.html?v3done=1');
log.push('origin-e: ' + await e.eval('location.origin + " token:" + !!(data.settings&&data.settings.ghToken) + " force:" + localStorage.getItem("seyma-sync-force")'));
await e.eval(`ui.authUnlocked=true; ui.locationGateState='granted'; true`);
await e.eval(`SeymaQuranLearn.kaoOpen('home')`);
await snapE('e1-ilk-acilis-1');
await e.eval(`App.kaoOnboard('next')`); await snapE('e2-ilk-acilis-2');
await e.eval(`App.kaoOnboard('choose','slow')`);
const tasks = JSON.parse(await e.eval(`JSON.stringify(SeymaQuranLearn.kaoPlacementTasks())`));
const readPos = tasks.reading.map((t) => t.choices.indexOf(t.answer));
const listenPos = tasks.listening.map((t) => t.choices.findIndex((c) => c.id === t.answer));
log.push(`okuma doğru şık konumu (0=1. düğme): ${readPos.join(',')} · dinleme: ${listenPos.join(',')}`);
for (let i = 0; i < tasks.reading.length; i++) {
  if (i < 3) await snapE(`e3-okuma-${i + 1}`);
  await e.eval(`App.kaoOnboard('answer', ${JSON.stringify(tasks.reading[i].answer)})`);
}
for (let i = 0; i < tasks.listening.length; i++) {
  await snapE(`e4-dinleme-${i + 1}`, null, 200);
  await e.eval(`App.kaoOnboard('answer', ${JSON.stringify(tasks.listening[i].answer)})`);
}
b.blocked.push(...e.blocked);
await e.close();
fs.writeFileSync(path.join(out, 'log.txt'), log.join('\n') + '\nblocked-external: ' + b.blocked.length + '\n');
console.log(log.join('\n'));
console.log('blocked external requests:', b.blocked.length);
