#!/usr/bin/env node
// v11 başlangıç karesinde görünmeyen kavram hedeflerini sentetik profilde kaydırıp ek görüntü ve geometri kaydeder.
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

function loadScan(filename){const src=fs.readFileSync(filename,'utf8'),a=src.indexOf('const sceneActions ='),z=src.indexOf('\nconst ORIGIN',a);if(a<0||z<0)throw Error('tarama kaynağı bulunamadı');return Function(src.slice(a,z)+'\nreturn sceneActions;')();}
const oldScan=loadScan(path.join(root,'kao3-premium/duzeltme-plani/kanit/K3PD-29/v11-20261028/shoot-modal-v11-source.mjs'));const newScan=loadScan(path.join(root,'tools/kapi/gorsel-qa/shoot-modal.mjs'));
try {
 await ready();await browser.eval("localStorage.setItem('seyma-reset-v1',JSON.stringify((function(){var d=window.createDefaultData();d.settings.locationEnabled=true;return d})()))");await ready();
 await browser.eval(`(function(){ui.authUnlocked=true;ui.locationGateState='granted';var q=SeymaQuranLearn.ensureQuranLearn(data);q.onboarding.doneAt='2026-09-20T00:00:00.000Z';q.onboarding.start='level1';q.settings.autoAdvance=false;var u1=QuranCurriculumV2.units[0],L=QuranLexiconV1.lemmas.slice().sort(function(a,b){return (b.freq||0)-(a.freq||0)}).slice(0,60);L.forEach(function(l){['ar>tr','tr>ar'].forEach(function(d){q.cards['w:'+l.id+':'+d]={state:'review',s:40,due:'2026-12-01T00:00:00.000Z'}})});u1.lessons.slice(0,2).forEach(function(l){q.path.lessons[l.id]={startedAt:'2026-09-21T00:00:00.000Z',doneAt:'2026-09-21T00:00:00.000Z',score:1,introducedLemmas:l.lemmaIds.slice()}});q.milestones.besmele='2026-09-21T00:00:00.000Z';q.milestones.fatiha='2026-09-22T00:00:00.000Z';return true})()`);
 await browser.eval(`App.setTheme(${dark?'true':'false'});SeymaQuranLearn.kaoOpen('home')`);
 await browser.eval("SeymaQuranLearn.kaoNav('concept',window.QuranGrammarV1.concepts[0].id)");await browser.wait(500);await browser.eval("document.querySelector('.kao-grammar-lesson').scrollIntoView({block:'center'})");await browser.wait(600);
 const button=async fn=>JSON.parse(await fn(browser)).actions.find(a=>a.cls==='kao-grammar-lesson');
 const before=await button(oldScan),closed=await button(newScan);
 if(!before.contentOverlaps.some(x=>x.tag==='P')||closed.contentOverlaps.length)throw Error('kapalı details negatif kontrolü başarısız '+JSON.stringify({before,closed}));
 await browser.eval("(function(){var d=document.querySelector('details.kao-grammar-term'),r=document.querySelector('.kao-grammar-lesson').getBoundingClientRect();d.open=true;d.style.position='fixed';d.style.left=r.left+'px';d.style.top=(r.top-44)+'px';d.style.width=r.width+'px';d.style.overflow='visible';d.style.zIndex='9999'})()");
 const open=await button(newScan);if(!open.contentOverlaps.some(x=>x.tag==='P'))throw Error('açık/örtüşen details pozitif kontrolü kaçtı '+JSON.stringify(open));
 fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'DETAILS-SCAN-DRYRUN.json'),JSON.stringify({generatedAt:new Date().toISOString(),before,closed,open,note:'Açık pozitif vaka sentetik CSS yerleştirmesidir; üretim kusuru değildir.',sourceAssets:sourceInventory.files,conflicts:sourceInventory.conflicts},null,2)+'\n');console.log('PASS kapalı details yanlış pozitif reddi ve açık örtüşme pozitif kontrolü');
}finally{await browser.close();fs.rmSync(profileDir,{recursive:true,force:true,maxRetries:10,retryDelay:200});}
