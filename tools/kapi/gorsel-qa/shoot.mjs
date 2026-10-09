// usage: node shoot.mjs <root> <outDir> <profileName>
import { launch } from './cdp.mjs';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
const [root, out, prof] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await launch(root, path.join(os.tmpdir(), prof));
const log = [];
const step = async (name, js, { scroll, open, dump } = {}) => {
  try {
    if (js) await b.eval(js);
    await b.wait(700);
    if (scroll) await b.eval(`(function(){var n=[].slice.call(document.querySelectorAll('h2,h3,summary,button,label,span,p')).filter(function(e){return e.textContent.indexOf(${JSON.stringify(scroll)})>=0&&e.children.length<4}).pop();if(n)n.scrollIntoView({block:'start'});return !!n})()`);
    if (open) await b.eval(`(function(){var d=document.querySelector('.kao-stats details');if(d)d.open=true})()`);
    await b.wait(400);
    await b.shot(path.join(out, name + '.png'));
    const txt = await b.eval(`(function(){var d=document.querySelector('[role=dialog]')||document.body;return d.innerText.replace(/\\s+/g,' ').slice(0,${dump || 300})})()`);
    log.push(`${name}: ${txt}`);
  } catch (e) { log.push(`${name}: SKIP ${String(e.message).slice(0, 120)}`); }
};
await b.goto('http://127.0.0.1:9000/index.html?v3done=1');
await b.eval(`localStorage.setItem('seyma-reset-v1', JSON.stringify((function(){var d=window.createDefaultData();d.settings.locationEnabled=true;return d})()))`);
await b.goto('http://127.0.0.1:9000/index.html?v3done=1');
log.push('origin: ' + await b.eval('location.origin + " token:" + !!(data.settings&&data.settings.ghToken) + " force:" + localStorage.getItem("seyma-sync-force")'));
const seed = `(function(){
  ui.authUnlocked=true; ui.locationGateState='granted';
  var q=SeymaQuranLearn.ensureQuranLearn(data);
  q.onboarding.doneAt='2026-09-20T00:00:00.000Z';
  var L=window.QuranLexiconV1.lemmas.slice().sort(function(a,b){return (b.freq||0)-(a.freq||0)}).slice(0,60);
  L.forEach(function(l){['ar>tr','tr>ar'].forEach(function(d){q.cards['w:'+l.id+':'+d]={state:'review',s:40,due:'2026-12-01T00:00:00.000Z'}})});
  for(var i=1;i<=4;i++){var d=new Date(Date.now()-i*86400000).toISOString().slice(0,10);q.daily[d]={answered:20,correct:16,new:2,reviewed:18,ms:20*9000}}
  return true})()`;
await b.eval(seed);
await step('01-bugun-hub', `SeymaQuranLearn.kaoOpen('home')`, { dump: 700 });
await step('02-ayarlar-ust', `SeymaQuranLearn.kaoSetView('settings')`, { dump: 900 });
await step('03-ayarlar-ogrenme', null, { scroll: 'Doğruda otomatik', dump: 500 });
await step('04-baslangic-noktasi', `App.kaoOnboard('change-start')`, { dump: 500 });
await step('05-ilerleme-ust', `SeymaQuranLearn.kaoSetView('stats')`, { dump: 600 });
await step('06-ilerleme-kalibrasyon-kapali', null, { scroll: 'Tekrar doğruluğu', dump: 500 });
await step('07-ilerleme-kalibrasyon-acik', null, { scroll: 'Tekrar doğruluğu', open: true, dump: 500 });
await step('08-ders-oynatici', `SeymaQuranLearn.kaoSetView('home'); [].slice.call(document.querySelectorAll('button')).filter(function(x){return x.textContent.trim()==='Başla'})[0].click()`, { dump: 700 });
await step('09-kelime-detayi', `(function(){var m=window.QuranCurriculumV2.lemmaToLesson,id=Object.keys(m).filter(function(k){var l=window.QuranLexiconV1.byId(k);return l&&l.verified===true&&l.root&&l.examples&&l.examples.length})[0];SeymaQuranLearn.kaoNav('word',id);return id})()`, { scroll: 'Bu kelimenin dersi', dump: 500 });
for (const [n, v] of [['10-yol-uniteler','units'],['11-gramer','grammar'],['12-okuyucu','reader'],['13-telaffuz','phonics'],['14-gunun-ayeti','ayah'],['15-namaz','prayer'],['16-kaynaklar','sources'],['17-kok-aileleri','roots'],['18-seviye0','gate']]) {
  await step(n, `SeymaQuranLearn.kaoSetView('${v}')`, { dump: 400 });
}
await step('19-unite-detayi', `SeymaQuranLearn.kaoNav('unit',1)`, { dump: 400 });
fs.writeFileSync(path.join(out, 'log.txt'), log.join('\n') + '\nblocked-external: ' + b.blocked.length + '\n');
console.log(log.join('\n'));
console.log('blocked external requests:', b.blocked.length);
await b.close();
