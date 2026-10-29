#!/usr/bin/env node
// Bağımsız değil: CDP Tab günlüklerinin tutarlılığını ve sunulan kaynakları denetler.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=process.cwd(),base=path.join(root,'kao3-premium/duzeltme-plani/kanit/K3PD-29/v11-20261028');
const runs=[['light-320','light',320,0],['dark-320','dark',320,0],['light-390','light',390,0],['dark-390','dark',390,0],['light-460','light',460,0],['dark-460','dark',460,0],['light-390-inset','light',390,34]];
const selectors={goal:'.kao-lesson[data-lesson-stage=\"goal\"] > .kao-lesson-next',intro:'.kao-lesson[data-lesson-stage=\"intro\"] > .kao-lesson-next',concept:'.kao-lesson[data-lesson-stage=\"concept\"] > .kao-lesson-next',apply:'.kao-lesson[data-lesson-stage=\"apply\"] > .kao-lesson-next',summary:'.kao-lesson[data-lesson-stage=\"summary\"] > .kao-lesson-next',read:'.kao-lesson[data-lesson-stage=\"apply\"] > .kao-lesson-next',budget:'.kao-lesson[data-lesson-stage=\"budget\"] > .kao-lesson-next',feedback:'.kao-feedback-sheet .kao-feedback-continue, .kao-feedback-strip-continue','practice-mc':'.kao-task.is-practice .kao-choices button:not(:disabled)','practice-build':'.kao-task.is-practice .kao-choices button:not(:disabled)','practice-cloze':'.kao-task.is-practice .kao-choices button:not(:disabled)'};
const labels=Object.keys(selectors).sort(),hash=b=>crypto.createHash('sha256').update(b).digest('hex');let targets=0,tabs=0;
for(const [name,theme,width,inset] of runs){
 const log=JSON.parse(fs.readFileSync(path.join(base,name,'KEYBOARD-JOURNEY-v7.json'),'utf8')),ref=JSON.parse(fs.readFileSync(path.join(base,name,'MANIFEST.json'),'utf8'));
 if(log.measuredTheme?.dataTheme!==theme||log.measuredTheme?.surface?.toLowerCase()!==(theme==='dark'?'#151c28':'#f7f5ee')||log.measuredTheme?.ink?.toLowerCase()!==(theme==='dark'?'#e8ebf2':'#172b45'))throw Error(name+': gerçek tema');
 if(log.theme!==theme||log.viewport.width!==width||log.viewport.height!==844||log.viewport.inset!==inset||log.missing.length||log.failed.length||log.conflicts.length)throw Error(name+': koşum kimliği/hata');
 if(JSON.stringify(log.reports.map(r=>r.label).sort())!==JSON.stringify(labels))throw Error(name+': sahne kapsamı');
 const assets=[...log.assets].sort((a,b)=>a.path.localeCompare(b.path)),refAssets=[...ref.sourceAssets].sort((a,b)=>a.path.localeCompare(b.path));if(JSON.stringify(assets)!==JSON.stringify(refAssets))throw Error(name+': v11 kaynak envanteri farkı');
 for(const a of assets){const file=path.resolve(root,a.path),rel=path.relative(fs.realpathSync(root),fs.realpathSync(file));if(!rel||rel==='..'||rel.startsWith('..'+path.sep)||path.isAbsolute(rel)||hash(fs.readFileSync(file))!==a.sha256)throw Error(name+': kaynak SHA '+a.path)}
 for(const r of log.reports){if(r.selector!==selectors[r.label])throw Error(name+': beklenmeyen hedef seçici '+r.label);if(!r.initial.dialogFocused||r.initial.count<1||r.visited.length!==r.initial.count||r.sequence.length!==r.tabCount)throw Error(name+': diyalog/hedef sayısı '+r.label);const indices=r.visited.map(x=>x.index).sort((a,b)=>a-b);if(indices.some((v,i)=>v!==i))throw Error(name+': hedef eksik/tekrar '+r.label);
  for(const x of r.visited){const fields=['x','y','w','h','clipLeft','clipTop','clipRight','clipBottom','viewportWidth','viewportHeight'];if(!fields.every(k=>Number.isFinite(x[k]))||x.viewportWidth!==width||x.viewportHeight!==844||x.w<44||x.h<44||x.x<0||x.y<0||x.x+x.w>width+1||x.y+x.h>845||x.clipLeft>x.x+1||x.clipTop>x.y+1||x.clipRight<x.x+x.w-1||x.clipBottom<x.y+x.h-1||!x.fullyVisible||!x.hit||!r.sequence.some(s=>JSON.stringify(s)===JSON.stringify(x)))throw Error(name+': odak/kırpma/geometri '+r.label+' '+x.index);}
  targets+=r.initial.count;tabs+=r.tabCount;
 }
}
console.log(`PASS gerçek Tab kayıtları: ${runs.length} koşum · ${runs.length*labels.length} senaryo · ${targets} hedef · ${tabs} tuş olayı · kaynak hashleri`);
