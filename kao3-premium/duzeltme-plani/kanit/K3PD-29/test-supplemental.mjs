#!/usr/bin/env node
// Gerçek kayıtların kopyasında bozuk ölçüm, envanter ve görüntü reddi; yalnız kendi geçici dizinini siler.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=process.cwd(),base='kao3-premium/duzeltme-plani/kanit/K3PD-29',name='home-primary-visible-20261029';
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'k3pd29-supplemental-test-')),dir=path.join(temp,name),validator=path.join(root,base,'supplemental-manifest.mjs');
try{
 fs.cpSync(path.join(root,base,name),dir,{recursive:true});
 function run(mode){return spawnSync(process.execPath,[validator,dir,mode],{cwd:root,encoding:'utf8'}).status;}
 if(run('--check')!==0)throw Error('geçerli kopya reddedildi');
 const log=path.join(dir,'light-320-0.webp.json'),original=fs.readFileSync(log,'utf8'),image=path.join(dir,'light-320-0.webp');
 const mutate=fn=>{const x=JSON.parse(original);fn(x);fs.writeFileSync(log,JSON.stringify(x));if(run('--write')===0)throw Error('bozuk ölçüm kabul edildi');fs.writeFileSync(log,original);};
 mutate(x=>{x.actions.actions.find(a=>a.cls.split(/\s+/).includes('kao-primary')).hits[0]=false});
 mutate(x=>{x.assets.pop()});
 mutate(x=>{delete x.actions.actions.find(a=>a.cls.split(/\s+/).includes('kao-primary')).clipLeft});
 mutate(x=>{x.facts.dataTheme='dark'});
 fs.appendFileSync(image,Buffer.from([0]));if(run('--write')===0)throw Error('değişmiş görüntü kabul edildi');
 const concept=path.join(temp,'concept-visible-v2-20261029');fs.cpSync(path.join(root,base,'concept-visible-v2-20261029'),concept,{recursive:true});const cl=path.join(concept,'light-320-0.webp.json'),cx=JSON.parse(fs.readFileSync(cl,'utf8'));const lesson=cx.actions.actions.find(a=>a.cls==='kao-grammar-lesson');lesson.tag='SUMMARY';lesson.cls='';fs.writeFileSync(cl,JSON.stringify(cx));if(spawnSync(process.execPath,[validator,concept,'--write'],{cwd:root,encoding:'utf8'}).status===0)throw Error('ders düğmesi eksik kavram kabul edildi');
 const s0=path.join(temp,'s0-stage4-v2-20261029');fs.cpSync(path.join(root,base,'s0-stage4-v2-20261029'),s0,{recursive:true});const sl=path.join(s0,'light-320-0.webp.json'),so=fs.readFileSync(sl,'utf8');for(const change of [x=>{x.facts.stage=2},x=>{x.facts.cta.y=10000}]){const x=JSON.parse(so);change(x);fs.writeFileSync(sl,JSON.stringify(x));if(spawnSync(process.execPath,[validator,s0,'--write'],{cwd:root,encoding:'utf8'}).status===0)throw Error('hatalı S0 aşama/viewport kabul edildi');}
 console.log('PASS geçerli ek manifest; sahte CTA hit, eksik geometri/kaynak, yanlış tema, eksik kavram düğmesi, hatalı S0 aşama/viewport ve görüntü byte değişimi reddedildi');
}finally{fs.rmSync(temp,{recursive:true,force:true,maxRetries:10,retryDelay:200});}
