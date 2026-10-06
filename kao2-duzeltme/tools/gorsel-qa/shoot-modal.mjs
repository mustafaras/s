// usage: node shoot-modal.mjs <root> <outDir> <profileName> [width] [dark]
// Tüm KAO modal yüzeylerini (görünümler, ders aşamaları, panel, ilk açılış, S0, ustalık) çeker.
// Kontrollü yerel QA: sunucu yok, token yok, forceSync yok; origin 127.0.0.1 (Guard 1).
import { launch } from './cdp.mjs';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
const [root, out, prof, widthArg, dark] = process.argv.slice(2);
const width = Number(widthArg) || 390;
fs.mkdirSync(out, { recursive: true });
const b = await launch(root, path.join(os.tmpdir(), prof), { width, height: 844 });
const log = [];

const issues = [];
const SCAN = `(function(){
  var d=document.querySelector('[role=dialog]'); if(!d) return ['DİYALOG YOK'];
  var dr=d.getBoundingClientRect(), out=[], all=d.querySelectorAll('*');
  function path(el){ var n=el.tagName.toLowerCase(), c=(el.getAttribute('class')||'').trim().split(/\\s+/).slice(0,2).join('.'); return n+(c?'.'+c:''); }
  function hasText(el){ return (el.textContent||'').replace(/\\s+/g,'').length>0 && !el.querySelector('svg') || (el.childNodes.length&&[].some.call(el.childNodes,function(n){return n.nodeType===3&&n.textContent.trim()})); }
  function scrollAnc(el){ for(var p=el.parentElement;p&&p!==d&&!(p.classList&&(p.classList.contains('kao-body')||/kao-dialog/.test(p.className)));p=p.parentElement){ var cs=getComputedStyle(p); if(/(auto|scroll)/.test(cs.overflowX)) return true; } return false; }
  function add(kind,el,extra){ out.push(kind+' | '+path(el)+' | "'+(el.textContent||'').replace(/\\s+/g,' ').trim().slice(0,40)+'" '+(extra||'')); }
  for(var i=0;i<all.length;i++){ var el=all[i], cs=getComputedStyle(el); if(cs.display==='none'||cs.visibility==='hidden') continue;
    var r=el.getBoundingClientRect(); if(r.width===0&&r.height===0) continue;
    if(el.closest('.kao-sr-only')) continue; // ekran okuyucuya özel (bilerek 1 px)
    if(el.closest('svg')&&el.tagName.toLowerCase()!=='svg') continue;
    if(!scrollAnc(el)&&(r.right>dr.right+1||r.left<dr.left-1)&&hasText(el)) add('DIŞARI-TAŞAR',el,'right='+Math.round(r.right)+' dialog='+Math.round(dr.right));
    if(/(auto|scroll)/.test(cs.overflowX)&&el.scrollWidth>el.clientWidth+1&&el!==d&&!el.classList.contains('kao-body')&&!/kao-dialog/.test(el.className)) add('KAYDIRMALI-ALAN(bilgi)',el,'sw='+el.scrollWidth+' cw='+el.clientWidth);
    if(cs.overflowX==='visible'&&cs.display!=='inline'&&el.scrollWidth>el.clientWidth+1&&hasText(el)&&!scrollAnc(el)&&el.children.length===0) add('METİN-KUTUDAN-TAŞAR',el,'sw='+el.scrollWidth+' cw='+el.clientWidth);
    var clipX=/(hidden|clip)/.test(cs.overflowX), clipY=/(hidden|clip)/.test(cs.overflowY);
    if(clipX&&el.scrollWidth>el.clientWidth+1&&hasText(el)&&el.getAttribute('role')!=='progressbar') add('YATAY-KIRPILIR',el,'sw='+el.scrollWidth+' cw='+el.clientWidth);
    if(clipY&&el.scrollHeight>el.clientHeight+1&&hasText(el)&&el.getAttribute('role')!=='progressbar') add('DİKEY-KIRPILIR',el,'sh='+el.scrollHeight+' ch='+el.clientHeight);
    if(cs.textOverflow==='ellipsis'&&el.scrollWidth>el.clientWidth+1) add('ÜÇ-NOKTA',el,'sw='+el.scrollWidth+' cw='+el.clientWidth);
    if(cs.webkitLineClamp&&cs.webkitLineClamp!=='none'&&el.scrollHeight>el.clientHeight+1) add('SATIR-SINIRI',el);
    if(cs.whiteSpace==='nowrap'&&hasText(el)&&el.scrollWidth>el.clientWidth+1&&!scrollAnc(el)) add('NOWRAP-TAŞAR',el,'sw='+el.scrollWidth+' cw='+el.clientWidth);
  }
  var b=d.querySelector('.kao-body'); if(b&&b.scrollWidth>b.clientWidth+1){ var wide=[].slice.call(b.querySelectorAll('*')).filter(function(x){ if(x.closest('.kao-sr-only')||x.closest('svg')) return false; var q=x.getBoundingClientRect(); return q.width>0&&q.right>dr.right+1&&!scrollAnc(x); }).sort(function(x,y){return y.getBoundingClientRect().right-x.getBoundingClientRect().right}).slice(0,3).map(function(x){return path(x)+'@'+Math.round(x.getBoundingClientRect().right)+'["'+(x.textContent||'').replace(/\\s+/g,' ').trim().slice(0,24)+'"]'}); out.push('GÖVDE-YATAY-KAYDIRMA | .kao-body sw='+b.scrollWidth+' cw='+b.clientWidth+' | en geniş: '+wide.join(' ; ')); }
  return out; })()`;
const snap = async (name, js, dump = 160) => {
  try {
    if (js) await b.eval(js);
    await b.wait(600);
    await b.shot(path.join(out, name + '.png'));
    const m = await b.eval(`(function(){var d=document.querySelector('[role=dialog]');if(!d)return 'DİYALOG YOK';var s=d.querySelector('.kao-body')||d;return 'sw='+document.documentElement.scrollWidth+' cw='+document.documentElement.clientWidth+' dialogW='+Math.round(d.getBoundingClientRect().width)+' overflowX='+(s.scrollWidth>s.clientWidth+1)+' | '+d.innerText.replace(/\\s+/g,' ').slice(0,${dump})})()`);
    log.push(`${name}: ${m}`);
    if (process.env.KAO_QA_SCAN === '1') { const found = await b.eval(SCAN); for (const f of found) issues.push(`${name} @${width}px: ${f}`); }
  } catch (e) { log.push(`${name}: SKIP ${String(e.message).slice(0, 140)}`); }
};
await b.goto('http://127.0.0.1:9000/index.html?v3done=1');
await b.eval(`localStorage.setItem('seyma-reset-v1', JSON.stringify((function(){var d=window.createDefaultData();d.settings.locationEnabled=true;return d})()))`);
await b.goto('http://127.0.0.1:9000/index.html?v3done=1');
log.push('origin: ' + await b.eval('location.origin + " token:" + !!(data.settings&&data.settings.ghToken) + " force:" + localStorage.getItem("seyma-sync-force")'));
if (dark) { await b.eval(`App.setTheme(true)`); await b.wait(400); log.push('tema: ' + await b.eval(`document.getElementById('root').getAttribute('data-theme')`)); }
await b.eval(`(function(){
  ui.authUnlocked=true; ui.locationGateState='granted';
  var q=SeymaQuranLearn.ensureQuranLearn(data);
  q.onboarding.doneAt='2026-09-20T00:00:00.000Z'; q.onboarding.start='level1';
  var u1=window.QuranCurriculumV2.units[0];
  var L=window.QuranLexiconV1.lemmas.slice().sort(function(a,b){return (b.freq||0)-(a.freq||0)}).slice(0,60);
  L.forEach(function(l){['ar>tr','tr>ar'].forEach(function(d){q.cards['w:'+l.id+':'+d]={state:'review',s:40,due:'2026-12-01T00:00:00.000Z'}})});
  u1.lessons.slice(0,2).forEach(function(l){q.path.lessons[l.id]={startedAt:'2026-09-21T00:00:00.000Z',doneAt:'2026-09-21T00:00:00.000Z',score:1,introducedLemmas:l.lemmaIds.slice()}});
  q.milestones.besmele='2026-09-21T00:00:00.000Z'; q.milestones.fatiha='2026-09-22T00:00:00.000Z';
  for(var i=1;i<=6;i++){var d=new Date(Date.now()-i*86400000).toISOString().slice(0,10);q.daily[d]={answered:20,correct:16,new:2,reviewed:18,ms:20*9000}}
  return true})()`);
const VIEWS = [['home', ''], ['units', ''], ['unit', "SeymaQuranLearn.kaoNav('unit',1)"], ['word', ''], ['reader', "SeymaQuranLearn.kaoOpenSurah&&0"], ['settings', ''], ['phonics', ''], ['ayah', ''], ['prayer', ''], ['stats', ''], ['gate', ''], ['grammar', ''], ['concept', ''], ['roots', ''], ['sources', '']];
await b.eval(`SeymaQuranLearn.kaoOpen('home')`);
let n = 0;
for (const [v] of VIEWS) {
  n += 1;
  const js = v === 'unit' ? `SeymaQuranLearn.kaoNav('unit',1)`
    : v === 'word' ? `(function(){var m=window.QuranCurriculumV2.lemmaToLesson,id=Object.keys(m).filter(function(k){var l=window.QuranLexiconV1.byId(k);return l&&l.verified===true})[0];SeymaQuranLearn.kaoNav('word',id)})()`
    : v === 'reader' ? `SeymaQuranLearn.kaoNav('reader',112)`
    : v === 'concept' ? `SeymaQuranLearn.kaoNav('concept',window.QuranGrammarV1.concepts[0].id)`
    : `SeymaQuranLearn.kaoSetView('${v}')`;
  await snap(`v${String(n).padStart(2, '0')}-${v}`, js, 120);
}
// Ders oynatıcı aşamaları + panel
await b.eval(`SeymaQuranLearn.kaoSetView('home'); App.kaoLesson('start','u01.03')`);
let k = 0;
for (let guard = 0; guard < 40; guard++) {
  const st = JSON.parse(await b.eval(`JSON.stringify((function(){var s=ui.kaoLesson;if(!s)return {done:true};var it=s.plan[s.at];return {phase:s.phase,kind:it&&it.kind,done:false}})())`));
  if (st.done) break;
  k += 1;
  if (st.phase === 'practice') {
    const task = JSON.parse(await b.eval(`JSON.stringify((function(){var q=ui.kaoQueue[ui.kaoTaskIndex];var t=ui.kaoTasks[q.id];return {id:t.id,kind:t.kind,choices:t.choices.map(function(c){return {id:c.choiceId,correct:c.correct,ordinal:c.ordinal}})}})())`));
    await snap(`l${String(k).padStart(2, '0')}-gorev-${task.kind}`, null, 140);
    if (task.kind === 'order') { for (const c of task.choices.slice().sort((a, b2) => a.ordinal - b2.ordinal)) await b.eval(`App.kaoAnswer(${JSON.stringify(task.id)},${JSON.stringify(c.id)})`); }
    else { const pick = (k % 2 ? task.choices.find((c) => c.correct) : task.choices.find((c) => !c.correct)) || task.choices[0]; await b.eval(`App.kaoAnswer(${JSON.stringify(task.id)},${JSON.stringify(pick.id)})`); }
    await snap(`l${String(k).padStart(2, '0')}-panel-${k % 2 ? 'dogru' : 'yanlis'}`, null, 160);
    await b.eval(`App.kaoContinue()`);
    continue;
  }
  await snap(`l${String(k).padStart(2, '0')}-${st.kind}`, null, 140);
  if (st.kind === 'summary') break;
  await b.eval(`App.kaoLesson('next')`);
}
await b.eval(`App.kaoLesson('finish')`);
// S0
await b.eval(`SeymaQuranLearn.kaoSetView('home'); App.kaoS0('start','s0.02')`);
for (let i = 1; i <= 4; i++) {
  await snap(`s0-aşama-${i}`, null, 120);
  const picked = await b.eval(`(function(){var d=ui.kaoS0&&ui.kaoS0.drill;if(d&&d.picked===null){var q=d.items[d.index];App.kaoS0('answer',q.choices.filter(function(c){return c.correct})[0].id);return 'answer'}return 'next'})()`);
  if (picked === 'answer') { await snap(`s0-aşama-${i}-cevap`, null, 120); await b.eval(`App.kaoS0('next')`); } else await b.eval(`App.kaoS0('next')`);
}
// Ayarlar kaydırma + Ustalık
await b.eval(`SeymaQuranLearn.kaoSetView('settings')`);
await b.eval(`(function(){var s=document.querySelector('.kao-body');if(s)s.scrollTop=s.scrollHeight})()`);
await snap('z1-ayarlar-alt', null, 120);
await b.eval(`(function(){var q=SeymaQuranLearn.ensureQuranLearn(data);window.QuranCurriculumV2.units[0].lessons.forEach(function(l){q.path.lessons[l.id]={startedAt:'2026-09-21T00:00:00.000Z',doneAt:'2026-09-21T00:00:00.000Z',score:1,introducedLemmas:l.lemmaIds.slice()}})})()`);
await b.eval(`SeymaQuranLearn.kaoSetView('home'); App.kaoLesson('start',1)`);
await snap('z2-ustalik-baslangic', null, 140);
await b.eval(`App.kaoLesson('exit')`);
await snap('z3-tekrar-sonrasi-ana', null, 140);
// İlk açılış (taze profil)
await b.eval(`ui.kaoOpen&&App.kaoClose&&App.kaoClose()`);
// İlk açılış (taze profil): adım 1, 2, yerleştirme okuma/dinleme, 3
if (process.env.KAO_QA_SCAN === '1') {
  await b.close();
  const e = await launch(root, path.join(os.tmpdir(), prof + '-e'), { width, height: 844 });
  await e.goto('http://127.0.0.1:9000/index.html?v3done=1');
  await e.eval(`localStorage.setItem('seyma-reset-v1', JSON.stringify((function(){var d=window.createDefaultData();d.settings.locationEnabled=true;return d})()))`);
  await e.goto('http://127.0.0.1:9000/index.html?v3done=1');
  await e.eval(`ui.authUnlocked=true; ui.locationGateState='granted'; true`);
  await e.eval(`SeymaQuranLearn.kaoOpen('home')`);
  const scanE = async (name) => { await e.wait(500); await e.shot(path.join(out, name + '.png')); for (const f of await e.eval(SCAN)) issues.push(`${name} @${width}px: ${f}`); };
  await scanE('o1-ilk-acilis-1');
  await e.eval(`App.kaoOnboard('next')`); await scanE('o2-ilk-acilis-2');
  await e.eval(`App.kaoOnboard('choose','slow')`); await scanE('o3-yerlestirme-okuma');
  const tasks = JSON.parse(await e.eval(`JSON.stringify(SeymaQuranLearn.kaoPlacementTasks())`));
  for (const t of tasks.reading) await e.eval(`App.kaoOnboard('answer', ${JSON.stringify(t.answer)})`);
  await scanE('o4-yerlestirme-dinleme');
  for (const t of tasks.listening) await e.eval(`App.kaoOnboard('answer', ${JSON.stringify(t.answer)})`);
  await scanE('o5-ilk-acilis-3');
  await e.close();
} else { await b.close(); }
fs.writeFileSync(path.join(out, 'issues.txt'), issues.join('\n') + '\n');
console.log('TARAMA: ' + issues.length + ' bulgu'); console.log(issues.slice(0, 60).join('\n'));
fs.writeFileSync(path.join(out, 'log.txt'), log.join('\n') + '\nblocked-external: ' + b.blocked.length + '\n');
console.log(log.join('\n'));
