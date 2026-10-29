#!/usr/bin/env node
// Yeni ekran görüntüsü üretmez: v11'de kısmen görülen örneklerin sentetik profilde kaydırılarak erişimini sınar.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';
const [root,out,name,widthArg,theme,insetArg]=process.argv.slice(2);
if(!root||!out||!name)throw Error('root out name width theme inset gerekli');
if(!/^k3pd29-scroll-[a-z0-9-]+$/.test(name))throw Error('geçici profil adı geçersiz');
const {launch}=await import(pathToFileURL(path.join(root,'tools/kapi/gorsel-qa/cdp.mjs')).href);
const width=Number(widthArg),inset=Number(insetArg)||0,dark=theme==='dark';
const sourceInventory={files:Object.create(null),conflicts:[]};
const profileDir=path.join(os.tmpdir(),name);
if(fs.existsSync(profileDir))throw Error('geçici profil zaten var');
const browser=await launch(root,profileDir,{width,height:844,scale:1,insets:inset?{bottom:inset}:null,sourceInventory});
async function ready(){await browser.goto('http://127.0.0.1:9000/index.html?v3done=1');for(let n=0;n<120;n++){if(await browser.eval("typeof window.createDefaultData==='function'&&typeof App!=='undefined'&&typeof ui!=='undefined'"))return;await browser.wait(250)}throw Error('başlangıç hazır değil');}

if(!fs.readFileSync(path.join(root,"tools/kapi/gorsel-qa/shoot-modal.mjs"),"utf8").includes("// ── Seviye 0 ───────────────────────────────────────────────────────────────────────────────────\nawait b.eval(`SeymaQuranLearn.kaoSetView('home'); App.kaoS0('start','${process.env.KAO_QA_S0 || 's0.02'}')`);\nfor (let i = 1; i <= 4; i += 1) {\n  // Döngü sayacı gerçek aşama değildir: drill birçok soruyla aynı aşamada kalır.\n  const s0 = await b.eval(`(function(){var s=ui.kaoS0,d=s&&s.drill;return {stage:s&&s.stage,question:d?d.index:null}})()`);\n  if (!s0 || !Number.isInteger(s0.stage)) throw new Error('S0 aşama kimliği ölçülemedi');\n  const s0Scene = `s0-asama-${s0.stage + 1}${s0.question === null ? '' : `-soru-${s0.question + 1}`}`;\n  await snap(b, { profile: 'ana', scene: s0Scene, sceneKind: 's0' }, null, { dump: 110 });\n  const picked = await b.eval(`(function(){var d=ui.kaoS0&&ui.kaoS0.drill;if(d&&d.picked===null){var q=d.items[d.index];App.kaoS0('answer',q.choices.filter(function(c){return c.correct})[0].id);return 'answer'}return 'next'})()`);\n  if (picked === 'answer') {\n    await snap(b, { profile: 'ana', scene: `${s0Scene}-cevap`, sceneKind: 's0' }, null, { dump: 110 });\n  }\n  await b.eval(`App.kaoS0('next')`);\n  await b.wait(200);\n}\n// Aşama 4, drill'in bütün soruları yanıtlanmadan açılmaz; yalnız gerçek geçişi yakala.\nfor (let guard = 0; guard < 100; guard += 1) {\n  const state = await b.eval(`(function(){var s=ui.kaoS0,d=s&&s.drill;return {stage:s&&s.stage,index:d&&d.index,picked:d&&d.picked}})()`);\n  if (state.stage === 3) break;\n  if (state.stage !== 2) throw new Error('S0 gerçek dördüncü aşamaya beklenmeyen geçiş');\n  const advanced = await b.eval(`(function(){var d=ui.kaoS0.drill;if(d.picked===null){var q=d.items[d.index],c=q.choices.find(function(x){return x.correct});return !!(c&&App.kaoS0('answer',c.id))}return !!App.kaoS0('next')})()`);\n  if (!advanced) throw new Error('S0 drill ilerlemedi');\n}\nconst s0FinalStage = await b.eval(`ui.kaoS0&&ui.kaoS0.stage`);\nif (s0FinalStage !== 3) throw new Error('S0 gerçek dördüncü aşama erişilemedi');\nawait snap(b, { profile:'ana', scene:'s0-asama-4-gercek', sceneKind:'s0' }, null, { dump:110 });\n\n"))throw Error("shoot S0 bölümü dry-run ile eşleşmiyor");
const b=browser;const observed=[];async function snap(page,row){const actual=await page.eval("(function(){var s=ui.kaoS0,d=s&&s.drill;return {stage:s.stage,question:d&&d.index}})()");observed.push({scene:row.scene,...actual});}
try {
 await ready();await browser.eval("localStorage.setItem('seyma-reset-v1',JSON.stringify((function(){var d=window.createDefaultData();d.settings.locationEnabled=true;return d})()))");await ready();
 await browser.eval(`(function(){ui.authUnlocked=true;ui.locationGateState='granted';var q=SeymaQuranLearn.ensureQuranLearn(data);q.onboarding.doneAt='2026-09-20T00:00:00.000Z';q.onboarding.start='level1';q.settings.autoAdvance=false;var u1=QuranCurriculumV2.units[0],L=QuranLexiconV1.lemmas.slice().sort(function(a,b){return (b.freq||0)-(a.freq||0)}).slice(0,60);L.forEach(function(l){['ar>tr','tr>ar'].forEach(function(d){q.cards['w:'+l.id+':'+d]={state:'review',s:40,due:'2026-12-01T00:00:00.000Z'}})});u1.lessons.slice(0,2).forEach(function(l){q.path.lessons[l.id]={startedAt:'2026-09-21T00:00:00.000Z',doneAt:'2026-09-21T00:00:00.000Z',score:1,introducedLemmas:l.lemmaIds.slice()}});q.milestones.besmele='2026-09-21T00:00:00.000Z';q.milestones.fatiha='2026-09-22T00:00:00.000Z';return true})()`);
 await browser.eval(`App.setTheme(${dark?'true':'false'});SeymaQuranLearn.kaoOpen('home')`);
// ── Seviye 0 ───────────────────────────────────────────────────────────────────────────────────
await b.eval(`SeymaQuranLearn.kaoSetView('home'); App.kaoS0('start','${process.env.KAO_QA_S0 || 's0.02'}')`);
for (let i = 1; i <= 4; i += 1) {
  // Döngü sayacı gerçek aşama değildir: drill birçok soruyla aynı aşamada kalır.
  const s0 = await b.eval(`(function(){var s=ui.kaoS0,d=s&&s.drill;return {stage:s&&s.stage,question:d?d.index:null}})()`);
  if (!s0 || !Number.isInteger(s0.stage)) throw new Error('S0 aşama kimliği ölçülemedi');
  const s0Scene = `s0-asama-${s0.stage + 1}${s0.question === null ? '' : `-soru-${s0.question + 1}`}`;
  await snap(b, { profile: 'ana', scene: s0Scene, sceneKind: 's0' }, null, { dump: 110 });
  const picked = await b.eval(`(function(){var d=ui.kaoS0&&ui.kaoS0.drill;if(d&&d.picked===null){var q=d.items[d.index];App.kaoS0('answer',q.choices.filter(function(c){return c.correct})[0].id);return 'answer'}return 'next'})()`);
  if (picked === 'answer') {
    await snap(b, { profile: 'ana', scene: `${s0Scene}-cevap`, sceneKind: 's0' }, null, { dump: 110 });
  }
  await b.eval(`App.kaoS0('next')`);
  await b.wait(200);
}
// Aşama 4, drill'in bütün soruları yanıtlanmadan açılmaz; yalnız gerçek geçişi yakala.
for (let guard = 0; guard < 100; guard += 1) {
  const state = await b.eval(`(function(){var s=ui.kaoS0,d=s&&s.drill;return {stage:s&&s.stage,index:d&&d.index,picked:d&&d.picked}})()`);
  if (state.stage === 3) break;
  if (state.stage !== 2) throw new Error('S0 gerçek dördüncü aşamaya beklenmeyen geçiş');
  const advanced = await b.eval(`(function(){var d=ui.kaoS0.drill;if(d.picked===null){var q=d.items[d.index],c=q.choices.find(function(x){return x.correct});return !!(c&&App.kaoS0('answer',c.id))}return !!App.kaoS0('next')})()`);
  if (!advanced) throw new Error('S0 drill ilerlemedi');
}
const s0FinalStage = await b.eval(`ui.kaoS0&&ui.kaoS0.stage`);
if (s0FinalStage !== 3) throw new Error('S0 gerçek dördüncü aşama erişilemedi');
await snap(b, { profile:'ana', scene:'s0-asama-4-gercek', sceneKind:'s0' }, null, { dump:110 });


 const expected=['s0-asama-1','s0-asama-2','s0-asama-3-soru-1','s0-asama-3-soru-1-cevap','s0-asama-3-soru-2','s0-asama-3-soru-2-cevap','s0-asama-4-gercek'];
 if(JSON.stringify(observed.map(x=>x.scene))!==JSON.stringify(expected)||observed.at(-1).stage!==3)throw Error('yanlış sahne/aşama '+JSON.stringify(observed));
 fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'SHOOT-S0-DRYRUN.json'),JSON.stringify({generatedAt:new Date().toISOString(),observed,sourceAssets:sourceInventory.files,conflicts:sourceInventory.conflicts},null,2)+'\n');console.log('PASS gerçek S0 aşama/soru adları ve 4/4 geçişi, 7 sahne; ekran görüntüsü yok');
}finally{await browser.close();fs.rmSync(profileDir,{recursive:true,force:true,maxRetries:10,retryDelay:200});}
