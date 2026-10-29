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

const reports=[];
async function keyboard(label,selector){
 const initial=await browser.eval(`(function(){var d=document.querySelector('[role=dialog]');if(!d)return {error:'dialog missing'};d.focus();var a=[].slice.call(d.querySelectorAll(${JSON.stringify(selector)})).filter(x=>!x.disabled);return {count:a.length,dialogFocused:document.activeElement===d}})()`);
 if(initial.error||!initial.count||!initial.dialogFocused){reports.push({label,selector,initial,error:'başlangıç veya hedef yok'});return;}
 let visited=[],sequence=[];for(let i=0;i<100&&visited.length<initial.count;i++){
  await browser.tab();
  const observation=await browser.eval(`(function(){var d=document.querySelector('[role=dialog]'),a=[].slice.call(d.querySelectorAll(${JSON.stringify(selector)})).filter(x=>!x.disabled),e=document.activeElement,idx=a.indexOf(e);if(idx<0)return {index:-1,tag:e&&e.tagName,cls:e&&String(e.className||'').slice(0,80)};var r=e.getBoundingClientRect(),l=r.left,t=r.top,rr=r.right,bb=r.bottom;for(var p=e.parentElement;p;p=p.parentElement){var s=getComputedStyle(p),q=p.getBoundingClientRect();if(/(hidden|clip|auto|scroll)/.test(s.overflowX)){l=Math.max(l,q.left);rr=Math.min(rr,q.right)}if(/(hidden|clip|auto|scroll)/.test(s.overflowY)){t=Math.max(t,q.top);bb=Math.min(bb,q.bottom)}}var h=document.elementFromPoint((l+rr)/2,(t+bb)/2);return {index:idx,tag:e.tagName,cls:String(e.className||'').slice(0,80),x:r.x,y:r.y,w:r.width,h:r.height,fullyVisible:r.left>=Math.max(0,l)-1&&r.right<=Math.min(innerWidth,rr)+1&&r.top>=Math.max(0,t)-1&&r.bottom<=Math.min(innerHeight,bb)+1,hit:h===e||e.contains(h)}})()`);
  sequence.push(observation);if(observation.index>=0&&!visited.some(x=>x.index===observation.index))visited.push(observation);
 }
 reports.push({label,selector,initial,visited,tabCount:sequence.length,sequence});
}
const selectors={goal:'.kao-lesson[data-lesson-stage="goal"] > .kao-lesson-next',intro:'.kao-lesson[data-lesson-stage="intro"] > .kao-lesson-next',concept:'.kao-lesson[data-lesson-stage="concept"] > .kao-lesson-next',apply:'.kao-lesson[data-lesson-stage="apply"] > .kao-lesson-next',summary:'.kao-lesson[data-lesson-stage="summary"] > .kao-lesson-next',feedback:'.kao-feedback-sheet .kao-feedback-continue, .kao-feedback-strip-continue',practice:'.kao-task.is-practice .kao-choices button:not(:disabled)',budget:'.kao-lesson[data-lesson-stage="budget"] > .kao-lesson-next'};
try{
 await ready();await browser.eval("localStorage.setItem('seyma-reset-v1',JSON.stringify((function(){var d=window.createDefaultData();d.settings.locationEnabled=true;return d})()))");await ready();
 await browser.eval(`(function(){ui.authUnlocked=true;ui.locationGateState='granted';var q=SeymaQuranLearn.ensureQuranLearn(data);q.onboarding.doneAt='2026-09-20T00:00:00.000Z';q.onboarding.start='level1';q.settings.autoAdvance=false;var u1=QuranCurriculumV2.units[0],L=QuranLexiconV1.lemmas.slice().sort(function(a,b){return (b.freq||0)-(a.freq||0)}).slice(0,60);L.forEach(function(l){['ar>tr','tr>ar'].forEach(function(d){q.cards['w:'+l.id+':'+d]={state:'review',s:40,due:'2026-12-01T00:00:00.000Z'}})});u1.lessons.slice(0,2).forEach(function(l){q.path.lessons[l.id]={startedAt:'2026-09-21T00:00:00.000Z',doneAt:'2026-09-21T00:00:00.000Z',score:1,introducedLemmas:l.lemmaIds.slice()}});q.milestones.besmele='2026-09-21T00:00:00.000Z';q.milestones.fatiha='2026-09-22T00:00:00.000Z';return true})()`);
 await browser.eval(`App.setTheme(${dark?'true':'false'});SeymaQuranLearn.kaoOpen('home')`);
 await browser.eval("SeymaQuranLearn.kaoSetView('home');App.kaoLesson('start','u01.03')");
 let tested=new Set();for(let k=0;k<120;k++){
  const st=await browser.eval("(function(){var s=ui.kaoLesson;if(!s)return {done:true};var it=s.plan[s.at];return {phase:s.phase,kind:it&&it.kind,done:false}})()");if(st.done)break;
  if(st.phase==='practice'){
   const task=await browser.eval("(function(){var q=ui.kaoQueue[ui.kaoTaskIndex],t=ui.kaoTasks[q.id];return {id:t.id,kind:t.kind,choices:t.choices.map(c=>({id:c.choiceId,correct:c.correct,ordinal:c.ordinal}))}})()");
   if(!tested.has('practice-mc')&&!['build','order'].includes(task.kind)){await keyboard('practice-mc',selectors.practice);tested.add('practice-mc')}
   if(task.kind==='order'){for(const c of task.choices.slice().sort((a,b)=>a.ordinal-b.ordinal))await browser.eval(`App.kaoAnswer(${JSON.stringify(task.id)},${JSON.stringify(c.id)})`)}else{const c=task.choices.find(c=>c.correct)||task.choices[0];await browser.eval(`App.kaoAnswer(${JSON.stringify(task.id)},${JSON.stringify(c.id)})`)}
   await browser.wait(100);if(!tested.has('feedback')){await keyboard('feedback',selectors.feedback);tested.add('feedback')}await browser.eval("App.kaoContinue()");continue;
  }
  const stage=st.kind||st.phase;if(selectors[stage]&&!tested.has(stage)){await keyboard(stage,selectors[stage]);tested.add(stage)}
  if(stage==='summary'||stage==='partEnd')break;await browser.eval("App.kaoLesson('next')");
 }
 await browser.eval(`(function(){var s=ui.kaoLesson;s.__qaSaved=s.plan[s.at];var a=s.plan.find(x=>x.kind==='apply');s.plan[s.at]={kind:'read',anchors:['surah:112'],words:a&&a.words||[]};App.setTheme(${dark?'true':'false'})})()`);await keyboard('read',selectors.apply);
 await browser.eval(`(function(){var s=ui.kaoLesson;s.plan[s.at]={kind:'partEnd',requiredMinutes:3,remainingMs:0,source:'history'};App.setTheme(${dark?'true':'false'})})()`);await keyboard('budget',selectors.budget);
 await browser.eval("(function(){var s=ui.kaoLesson;s.plan[s.at]=s.__qaSaved;delete s.__qaSaved;App.kaoLesson('finish')})()");
 for(const [variant,stability] of [['build',12],['cloze',40]]){
  await browser.eval(`(function(){SeymaQuranLearn.kaoSetView('home');App.kaoLesson('start','u01.03');var q=SeymaQuranLearn.ensureQuranLearn(data),api=SeymaQuranLearn;for(var l of QuranLexiconV1.lemmas){if(!l.verified)continue;for(var dir of ['ar>tr','tr>ar']){var cid='w:'+l.id+':'+dir;q.cards[cid]={state:'review',s:${stability},reps:8,due:'2026-09-29T00:00:00.000Z'};if(SeymaQuranLearnFlow.ladderArm(cid)!=='A')continue;var task=api.kaoBuildTask({id:'k3pd29-${variant}-'+cid,cardId:cid,isNew:false},data,{seed:'k3pd29-${variant}'});if(task&&task.kind===${JSON.stringify(variant)}&&(${JSON.stringify(variant)}!=='build'||task.choices.filter(c=>c.correct).length>=3)){ui.kaoLesson.phase='practice';ui.kaoQueue=[{id:task.id,cardId:task.cardId,isNew:false}];ui.kaoTasks={};ui.kaoTasks[task.id]=task;ui.kaoTaskIndex=0;ui.kaoTaskStartedAt=Date.now();ui.kaoPanel={open:false};ui.kaoOrderDraft=[];App.setTheme(${dark?'true':'false'});return true}}}throw Error('görev üretilemedi')})()`);
  await keyboard('practice-'+variant,selectors.practice);await browser.eval("App.kaoLesson('exit')");
 }
 const expected=['goal','intro','concept','practice-mc','practice-build','practice-cloze','feedback','apply','summary','read','budget'], labels=reports.map(x=>x.label);
 const missing=expected.filter(x=>!labels.includes(x));const failed=reports.filter(r=>r.error||r.visited.length!==r.initial.count||r.visited.some(x=>!x.fullyVisible||!x.hit));
 fs.mkdirSync(out,{recursive:true});const assets=Object.entries(sourceInventory.files).map(([path,sha256])=>({path,sha256}));fs.writeFileSync(path.join(out,'KEYBOARD-JOURNEY.json'),JSON.stringify({generatedAt:new Date().toISOString(),viewport:{width,height:844,inset},theme,reports,missing,failed:failed.map(x=>x.label),assets,conflicts:sourceInventory.conflicts},null,2)+'\n');
 if(missing.length||failed.length||sourceInventory.conflicts.length)throw Error('Tab yolu başarısız veya eksik: '+JSON.stringify({missing,failed:failed.map(x=>x.label)}));
 console.log('PASS gerçek Tab yolculuğu',theme,width,inset,reports.length);
}finally{await browser.close();fs.rmSync(profileDir,{recursive:true,force:true,maxRetries:10,retryDelay:200});}
