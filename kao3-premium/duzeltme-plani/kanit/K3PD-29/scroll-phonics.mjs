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
const scenes=[['v07-phonics','phonics']];
try{
 await ready();await browser.eval("localStorage.setItem('seyma-reset-v1',JSON.stringify((function(){var d=window.createDefaultData();d.settings.locationEnabled=true;return d})()))");await ready();
 await browser.eval(`(function(){ui.authUnlocked=true;ui.locationGateState='granted';var q=SeymaQuranLearn.ensureQuranLearn(data);q.onboarding.doneAt='2026-09-20T00:00:00.000Z';q.onboarding.start='level1';q.settings.autoAdvance=false;var u1=QuranCurriculumV2.units[0],L=QuranLexiconV1.lemmas.slice().sort(function(a,b){return (b.freq||0)-(a.freq||0)}).slice(0,60);L.forEach(function(l){['ar>tr','tr>ar'].forEach(function(d){q.cards['w:'+l.id+':'+d]={state:'review',s:40,due:'2026-12-01T00:00:00.000Z'}})});u1.lessons.slice(0,2).forEach(function(l){q.path.lessons[l.id]={startedAt:'2026-09-21T00:00:00.000Z',doneAt:'2026-09-21T00:00:00.000Z',score:1,introducedLemmas:l.lemmaIds.slice()}});q.milestones.besmele='2026-09-21T00:00:00.000Z';q.milestones.fatiha='2026-09-22T00:00:00.000Z';return true})()`);
 await browser.eval(`App.setTheme(${dark?'true':'false'});SeymaQuranLearn.kaoOpen('home')`);
 const original=JSON.parse(fs.readFileSync(path.join(out,'MANIFEST.json'),'utf8')),reports=[];
 for(const [scene,view] of scenes){
  const row=original.rows.find(r=>r.scene===scene),a=JSON.parse(row.actionsJson).actions;
  const wanted=a.filter(x=>x.visible&&!x.disabled&&(!x.fullyVisible||x.covered)&&!/kao-navbar-action/.test(x.cls));
  await browser.eval(scene==='v05-reader' ? "SeymaQuranLearn.kaoNav('reader',112)" : `SeymaQuranLearn.kaoSetView(${JSON.stringify(view)})`);await browser.wait(500);
  if(scene==='z1-ayarlar-alt')await browser.eval("(function(){var s=document.querySelector('.kao-body');if(s)s.scrollTop=s.scrollHeight})()");
  for(const target of wanted){
   const result=JSON.parse(await browser.eval(`(async()=>JSON.stringify(await (async function(){var root=document.querySelector('[role=dialog]')||document.getElementById('app')||document.body;var list=[].slice.call(root.querySelectorAll(':is(button,a[href],summary,[role=button]):not(input):not(select):not(textarea),.kao-roots-search > input[type=search]'));var el=list[${target.index}];if(!el)return {missing:true};var before=el.getBoundingClientRect(),match=el.tagName===${JSON.stringify(target.tag)}&&String(el.className||'').slice(0,80)===${JSON.stringify(target.cls)};var body=document.querySelector('.kao-body'),scrollBefore=body&&body.scrollTop;el.scrollIntoView({block:'center',inline:'nearest'});var immediateRect=el.getBoundingClientRect(),immediateHit=document.elementFromPoint((immediateRect.left+immediateRect.right)/2,(immediateRect.top+immediateRect.bottom)/2);var immediate={rect:{x:immediateRect.x,y:immediateRect.y,w:immediateRect.width,h:immediateRect.height},hit:immediateHit===el||el.contains(immediateHit),hitTag:immediateHit&&immediateHit.tagName,hitClass:immediateHit&&String(immediateHit.className||'').slice(0,120)};await new Promise(resolve=>setTimeout(resolve,600));var r=el.getBoundingClientRect(),l=r.left,t=r.top,rr=r.right,bb=r.bottom;for(var p=el.parentElement;p;p=p.parentElement){var s=getComputedStyle(p),q=p.getBoundingClientRect();if(/(hidden|clip|auto|scroll)/.test(s.overflowX)){l=Math.max(l,q.left);rr=Math.min(rr,q.right)}if(/(hidden|clip|auto|scroll)/.test(s.overflowY)){t=Math.max(t,q.top);bb=Math.min(bb,q.bottom)}}var hit=document.elementFromPoint((l+rr)/2,(t+bb)/2);return {match:match,immediate:immediate,hitTag:hit&&hit.tagName,hitClass:hit&&String(hit.className||'').slice(0,120),before:{x:before.x,y:before.y,w:before.width,h:before.height},after:{x:r.x,y:r.y,w:r.width,h:r.height},scrollBefore:scrollBefore,scrollAfter:body&&body.scrollTop,fullyVisible:r.left>=l-1&&r.right<=rr+1&&r.top>=t-1&&r.bottom<=bb+1&&r.left>=0&&r.right<=innerWidth+1&&r.top>=0&&r.bottom<=innerHeight+1,hit:hit===el||el.contains(hit)}})()))()`));
   reports.push({scene,index:target.index,tag:target.tag,cls:target.cls,screenshotSha256:row.sha256,result});
  }
 }
 const assets=Object.entries(sourceInventory.files).map(([name,sha256])=>({path:name,sha256}));
 fs.writeFileSync(path.join(out,'SCROLL-PHONICS-20261029.json'),JSON.stringify({generatedAt:new Date().toISOString(),originalGeneratedAt:original.generatedAt,theme,viewport:original.viewport,reports,assets,conflicts:sourceInventory.conflicts},null,2)+'\n');
 if(sourceInventory.conflicts.length||reports.some(x=>!x.result.match||!x.result.fullyVisible||!x.result.hit))throw Error('bazı kaydırma hedefleri doğrulanamadı');
 console.log(`PASS ${theme} ${width}+${inset}: ${reports.length} kaydırılan kontrol`);
}finally{await browser.close();fs.rmSync(profileDir,{recursive:true,force:true,maxRetries:10,retryDelay:200});}
