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
const sceneActions = (page) => page.eval(`JSON.stringify((function(){
  var glyph=document.querySelector('#k3pd29-glyph-sheet');
  var dialog=document.querySelector('[role=dialog]'),onb=document.querySelector('[data-onboarding-theme]');
  var root=glyph||dialog||onb||document.getElementById('app')||document.body;
  var scope=glyph?'glyph':dialog?'dialog':onb?'onboarding':'app';
  var controls=[].slice.call(root.querySelectorAll(':is(button,a[href],summary,[role=button]):not(input):not(select):not(textarea),.kao-roots-search > input[type=search]'));
  return {scope:scope,viewport:{width:innerWidth,height:innerHeight},actions:controls.map(function(el,i){
    var r=el.getBoundingClientRect(),cs=getComputedStyle(el),left=r.left,top=r.top,right=r.right,bottom=r.bottom;
    for(var p=el.parentElement;p;p=p.parentElement){var s=getComputedStyle(p),q=p.getBoundingClientRect();if(/(hidden|clip|auto|scroll)/.test(s.overflowX)){left=Math.max(left,q.left);right=Math.min(right,q.right)}if(/(hidden|clip|auto|scroll)/.test(s.overflowY)){top=Math.max(top,q.top);bottom=Math.min(bottom,q.bottom)}}
    left=Math.max(left,0);right=Math.min(right,innerWidth);top=Math.max(top,0);bottom=Math.min(bottom,innerHeight);
    var rendered=cs.display!=='none'&&cs.visibility!=='hidden'&&cs.opacity!=='0'&&r.width>0&&r.height>0;
    var visible=rendered&&right>left&&bottom>top;
    var hits=visible?[[0.5,0.5],[0.15,0.15],[0.85,0.15],[0.15,0.85],[0.85,0.85]].map(function(pt){var hit=document.elementFromPoint(left+(right-left)*pt[0],top+(bottom-top)*pt[1]);return !!hit&&(hit===el||el.contains(hit))}):[];
    var covered=visible&&hits.some(function(ok){return !ok});
    var contentOverlaps=[];
    if(visible)[].forEach.call(root.querySelectorAll('p,h1,h2,h3,h4,h5,h6,li,span,small,strong,em'),function(other){
      if(other===el||el.contains(other)||other.contains(el)||other.closest('button,a[href],summary,[role=button]'))return;
      if(other.closest('details:not([open])')&&!other.closest('summary'))return;
      var os=getComputedStyle(other),o=other.getBoundingClientRect();if(os.display==='none'||os.visibility==='hidden'||os.opacity==='0'||!o.width||!o.height)return;
      if(![].some.call(other.childNodes,function(n){return n.nodeType===3&&n.textContent.trim()}))return;
      var l=o.left,t=o.top,rr=o.right,bb=o.bottom;
      for(var a=other.parentElement;a;a=a.parentElement){var st=getComputedStyle(a),ar=a.getBoundingClientRect();if(/(hidden|clip|auto|scroll)/.test(st.overflowX)){l=Math.max(l,ar.left);rr=Math.min(rr,ar.right)}if(/(hidden|clip|auto|scroll)/.test(st.overflowY)){t=Math.max(t,ar.top);bb=Math.min(bb,ar.bottom)}}
      var ix=Math.min(right,rr)-Math.max(left,l),iy=Math.min(bottom,bb)-Math.max(top,t);
      if(ix>1&&iy>1)contentOverlaps.push({tag:other.tagName,x:Math.round(l),y:Math.round(t),width:Math.round(rr-l),height:Math.round(bb-t),overlapPx:Math.round(Math.min(ix,iy))});
    });
    return {index:i,tag:el.tagName,cls:String(el.className||'').slice(0,80),x:Math.round(r.left),y:Math.round(r.top),width:Math.round(r.width),height:Math.round(r.height),clipLeft:Math.round(left),clipTop:Math.round(top),clipRight:Math.round(right),clipBottom:Math.round(bottom),rendered:rendered,visible:visible,fullyVisible:visible&&left<=r.left+1&&right>=r.right-1&&top<=r.top+1&&bottom>=r.bottom-1,covered:covered,hits:hits,disabled:!!el.disabled,contentOverlaps:contentOverlaps};
  })};
})())`);

try {
 await ready();await browser.eval("localStorage.setItem('seyma-reset-v1',JSON.stringify((function(){var d=window.createDefaultData();d.settings.locationEnabled=true;return d})()))");await ready();
 await browser.eval(`(function(){ui.authUnlocked=true;ui.locationGateState='granted';var q=SeymaQuranLearn.ensureQuranLearn(data);q.onboarding.doneAt='2026-09-20T00:00:00.000Z';q.onboarding.start='level1';q.settings.autoAdvance=false;var u1=QuranCurriculumV2.units[0],L=QuranLexiconV1.lemmas.slice().sort(function(a,b){return (b.freq||0)-(a.freq||0)}).slice(0,60);L.forEach(function(l){['ar>tr','tr>ar'].forEach(function(d){q.cards['w:'+l.id+':'+d]={state:'review',s:40,due:'2026-12-01T00:00:00.000Z'}})});u1.lessons.slice(0,2).forEach(function(l){q.path.lessons[l.id]={startedAt:'2026-09-21T00:00:00.000Z',doneAt:'2026-09-21T00:00:00.000Z',score:1,introducedLemmas:l.lemmaIds.slice()}});q.milestones.besmele='2026-09-21T00:00:00.000Z';q.milestones.fatiha='2026-09-22T00:00:00.000Z';return true})()`);
 await browser.eval(`App.setTheme(${dark?'true':'false'});SeymaQuranLearn.kaoOpen('home')`);
 await browser.eval("SeymaQuranLearn.kaoNav('concept',window.QuranGrammarV1.concepts[0].id)");await browser.wait(500);
 await browser.eval("document.querySelector('.kao-grammar-lesson').scrollIntoView({block:'center'})");await browser.wait(600);
 const facts=await browser.eval(`(function(){var root=document.getElementById('root'),cs=getComputedStyle(root);return {dataTheme:root.getAttribute('data-theme'),surface:cs.getPropertyValue('--quran-surface').trim(),ink:cs.getPropertyValue('--quran-ink').trim(),fontReady:document.fonts.status,fontCheck:document.fonts.check('16px \"K3P Scheherazade\"','ب')}})()`);
 const actions=JSON.parse(await sceneActions(browser));const targets=actions.actions.filter(a=>a.tag==='SUMMARY'||a.cls==='kao-grammar-lesson');

 fs.mkdirSync(out,{recursive:true});const shot=path.join(out,`${theme}-${width}-${inset}.webp`);await browser.shot(shot,{format:'webp',quality:90});
 const crypto=await import('node:crypto');const sha256=crypto.createHash('sha256').update(fs.readFileSync(shot)).digest('hex');const assets=Object.entries(sourceInventory.files).map(([path,sha256])=>({path,sha256}));
 fs.writeFileSync(shot+'.json',JSON.stringify({generatedAt:new Date().toISOString(),theme,width,height:844,inset,facts,actions,sha256,assets,conflicts:sourceInventory.conflicts},null,2)+'\n');
 if(facts.dataTheme!==theme||facts.surface.toLowerCase()!==(dark?'#151c28':'#f7f5ee')||facts.ink.toLowerCase()!==(dark?'#e8ebf2':'#172b45')||facts.fontReady!=='loaded'||!facts.fontCheck||targets.length!==2||targets.some(x=>!x.fullyVisible||x.covered||x.contentOverlaps.length))throw Error('kavram hedef ölçümü FAIL: '+JSON.stringify({facts,targets}));
 if(sourceInventory.conflicts.length)throw Error('kaynak hash çakışması');console.log('PASS kavram scroll sonrası',theme,width,inset);
}finally{await browser.close();fs.rmSync(profileDir,{recursive:true,force:true,maxRetries:10,retryDelay:200});}
