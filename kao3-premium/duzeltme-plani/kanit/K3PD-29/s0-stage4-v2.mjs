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
try {
 await ready();await browser.eval("localStorage.setItem('seyma-reset-v1',JSON.stringify((function(){var d=window.createDefaultData();d.settings.locationEnabled=true;return d})()))");await ready();
 await browser.eval(`(function(){ui.authUnlocked=true;ui.locationGateState='granted';var q=SeymaQuranLearn.ensureQuranLearn(data);q.onboarding.doneAt='2026-09-20T00:00:00.000Z';q.onboarding.start='level1';q.settings.autoAdvance=false;var u1=QuranCurriculumV2.units[0],L=QuranLexiconV1.lemmas.slice().sort(function(a,b){return (b.freq||0)-(a.freq||0)}).slice(0,60);L.forEach(function(l){['ar>tr','tr>ar'].forEach(function(d){q.cards['w:'+l.id+':'+d]={state:'review',s:40,due:'2026-12-01T00:00:00.000Z'}})});u1.lessons.slice(0,2).forEach(function(l){q.path.lessons[l.id]={startedAt:'2026-09-21T00:00:00.000Z',doneAt:'2026-09-21T00:00:00.000Z',score:1,introducedLemmas:l.lemmaIds.slice()}});q.milestones.besmele='2026-09-21T00:00:00.000Z';q.milestones.fatiha='2026-09-22T00:00:00.000Z';return true})()`);
 await browser.eval(`App.setTheme(${dark?'true':'false'});SeymaQuranLearn.kaoOpen('home')`);
 await browser.eval("SeymaQuranLearn.kaoSetView('home');App.kaoS0('start','s0.02')");
 let trace=[];
 for(let i=0;i<30;i++){
   const state=await browser.eval("(function(){var s=ui.kaoS0;return {stage:s.stage,index:s.drill?s.drill.index:null,total:s.drill?s.drill.items.length:null,picked:s.drill?s.drill.picked:null}})()");
   trace.push(state);if(state.stage===3)break;
   const changed=await browser.eval("(function(){var s=ui.kaoS0,d=s.drill;if(d&&s.stage===2&&d.picked===null){var q=d.items[d.index],c=q.choices.find(x=>x.correct);return !!(c&&App.kaoS0('answer',c.id))}return !!App.kaoS0('next')})()");
   if(!changed)throw Error('Seviye 0 ilerleme durdu');await browser.wait(80);
 }
 await browser.wait(400);
 const facts=await browser.eval(`(function(){var s=ui.kaoS0,root=document.querySelector('[role=dialog]'),el=root&&root.querySelector('.kao-primary'),r=el&&el.getBoundingClientRect(),h=r&&document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {stage:s&&s.stage,theme:(function(){var root=document.getElementById('root'),cs=getComputedStyle(root);return {dataTheme:root.getAttribute('data-theme'),surface:cs.getPropertyValue('--quran-surface').trim(),ink:cs.getPropertyValue('--quran-ink').trim()}})(),cta:el&&{text:el.textContent,disabled:el.disabled,x:r.x,y:r.y,w:r.width,h:r.height,hit:h===el||el.contains(h),visible:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight},fontReady:document.fonts.status,fontCheck:document.fonts.check('16px \"K3P Scheherazade\"','ب')}})()`);
 if(facts.stage!==3||!facts.cta||facts.cta.disabled||!facts.cta.visible||!facts.cta.hit||facts.fontReady!=='loaded'||!facts.fontCheck||facts.theme.dataTheme!==theme||facts.theme.surface.toLowerCase()!==(dark?'#151c28':'#f7f5ee')||facts.theme.ink.toLowerCase()!==(dark?'#e8ebf2':'#172b45'))throw Error('dördüncü aşama CTA doğrulanamadı: '+JSON.stringify(facts));
 fs.mkdirSync(out,{recursive:true});const shot=path.join(out,`${theme}-${width}-${inset}.webp`);await browser.shot(shot,{format:'webp',quality:90});
 const crypto=await import('node:crypto');const sha256=crypto.createHash('sha256').update(fs.readFileSync(shot)).digest('hex');const assets=Object.entries(sourceInventory.files).map(([path,sha256])=>({path,sha256}));
 fs.writeFileSync(shot+'.json',JSON.stringify({generatedAt:new Date().toISOString(),theme,width,height:844,inset,facts,trace,sha256,assets,conflicts:sourceInventory.conflicts},null,2)+'\n');
 if(sourceInventory.conflicts.length)throw Error('kaynak hash çakışması');console.log('PASS gerçek dördüncü aşama',theme,width,inset);
}finally{await browser.close();fs.rmSync(profileDir,{recursive:true,force:true,maxRetries:10,retryDelay:200});}
