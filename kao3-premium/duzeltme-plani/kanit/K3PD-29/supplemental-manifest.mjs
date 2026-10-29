#!/usr/bin/env node
// Ek görüntü ↔ ham JSON log ↔ manifest bağı. Eski v11 manifestini değiştirmez.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const [dir,mode]=process.argv.slice(2);
if(!dir||!['--write','--check'].includes(mode))throw Error('dizin ve --write veya --check gerekli');
const base=path.resolve(dir), names=['light-320-0','dark-320-0','light-390-0','dark-390-0','light-460-0','dark-460-0','light-390-34'];
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const root=process.cwd(),rows=[];
const reference=JSON.parse(fs.readFileSync(path.join(root,'kao3-premium/duzeltme-plani/kanit/K3PD-29/v11-20261028/light-320/MANIFEST.json'),'utf8')).sourceAssets;
const referencePaths=reference.map(x=>x.path).sort(),referenceSha=new Map(reference.map(x=>[x.path,x.sha256]));
for(const n of names){
 const shot=n+'.webp',log=shot+'.json',p=path.join(base,shot),q=path.join(base,log);
 const data=JSON.parse(fs.readFileSync(q,'utf8')), [theme,w,inset]=n.split('-');
 if(data.theme!==theme||data.width!==Number(w)||data.height!==844||data.inset!==Number(inset))throw Error(`${n}: viewport/tema kimliği`);
 if(hash(fs.readFileSync(p))!==data.sha256)throw Error(`${n}: görüntü SHA uyuşmazlığı`);
 const measuredTheme=typeof data.facts.theme==='object'?data.facts.theme.dataTheme:data.facts.dataTheme;
 if(measuredTheme!==theme||data.facts.fontReady!=='loaded'||!data.facts.fontCheck)throw Error(`${n}: ölçülen tema/font`);
 if(!Array.isArray(data.assets)||JSON.stringify(data.assets.map(x=>x.path).sort())!==JSON.stringify(referencePaths)||!Array.isArray(data.conflicts)||data.conflicts.length)throw Error(`${n}: kaynak envanteri v11 ile eşleşmiyor`);
 const kind=path.basename(base);
 if(kind==='s0-stage4-v2-20261029'){const c=data.facts.cta;if(data.facts.stage!==3||!c||c.disabled||!c.visible||!c.hit||![c.x,c.y,c.w,c.h].every(Number.isFinite)||c.h<44||c.w<44||c.x<0||c.y<0||c.x+c.w>data.width+1||c.y+c.h>data.height+1)throw Error(`${n}: S0 CTA ölçümü`);}
 else if(['concept-visible-v2-20261029','home-primary-visible-20261029','mastery-home-primary-visible-20261029'].includes(kind)){const all=data.actions?.actions;if(!Array.isArray(all))throw Error(`${n}: eylem ölçümü yok`);const selected=kind.startsWith('concept')?all.filter(a=>a.tag==='SUMMARY'||a.cls==='kao-grammar-lesson'):all.filter(a=>a.cls.split(/\s+/).includes('kao-primary'));const count=kind.startsWith('concept')?2:1;if(selected.length!==count||(kind.startsWith('concept')&&(selected.filter(a=>a.tag==='SUMMARY').length!==1||selected.filter(a=>a.cls==='kao-grammar-lesson').length!==1))||selected.some(a=>![a.x,a.y,a.width,a.height,a.clipLeft,a.clipTop,a.clipRight,a.clipBottom].every(Number.isFinite)||a.x<0||a.y<0||a.x+a.width>data.width+1||a.y+a.height>data.height+1||a.clipLeft>a.x+1||a.clipTop>a.y+1||a.clipRight<a.x+a.width-1||a.clipBottom<a.y+a.height-1||a.disabled||!a.fullyVisible||a.covered||a.width<44||a.height<44||!Array.isArray(a.hits)||a.hits.length!==5||a.hits.some(x=>x!==true)||!Array.isArray(a.contentOverlaps)||a.contentOverlaps.length))throw Error(`${n}: CTA geometri ölçümü`);}
 else throw Error(`bilinmeyen ek kanıt seti: ${kind}`);
 for(const a of data.assets){const f=path.resolve(root,a.path),rel=path.relative(root,f);if(!rel||rel==='..'||rel.startsWith('..'+path.sep)||path.isAbsolute(rel)||!fs.existsSync(f))throw Error(`${n}: kaynak yolu ${a.path}`);const actual=fs.realpathSync(f),actualRel=path.relative(fs.realpathSync(root),actual);if(!actualRel||actualRel==='..'||actualRel.startsWith('..'+path.sep)||path.isAbsolute(actualRel)||referenceSha.get(a.path)!==a.sha256||hash(fs.readFileSync(actual))!==a.sha256)throw Error(`${n}: kaynak hash ${a.path}`)}
 rows.push({scene:n,theme,width:Number(w),height:844,inset:Number(inset),screenshot:shot,screenshotSha256:data.sha256,log,logSha256:hash(fs.readFileSync(q)),generatedAt:data.generatedAt});
}
const manifestPath=path.join(base,'MANIFEST.json');
if(mode==='--write')fs.writeFileSync(manifestPath,JSON.stringify({schema:'k3pd29-supplemental-v1',note:'JSON logları çekim sırasında yazılmış gözlemdir; imzalı bağımsız tanık değildir. Kapsam ilgili sahneye özgüdür.',rows},null,2)+'\n');
else {const m=JSON.parse(fs.readFileSync(manifestPath,'utf8'));if(m.schema!=='k3pd29-supplemental-v1'||JSON.stringify(m.rows)!==JSON.stringify(rows))throw Error('ek manifest/log/görüntü farkı');}
console.log(`PASS ${path.basename(base)}: 7 görüntü/log/manifest ve kaynak hashleri`);
