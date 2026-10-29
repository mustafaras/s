#!/usr/bin/env node
// Converts validated v6 browser evidence into K3PD-21 geometry records.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const root=process.cwd();
const base=path.join(root,'kao3-premium/duzeltme-plani/kanit/K3PD-29/v6-20261028');
const names=['light-320','dark-320','light-390','dark-390','light-460','dark-460','light-390-inset'];
const dirs=names.map((name)=>path.join(base,name));
const verifier=path.join(root,'tools/kapi/gorsel-qa/gorsel-qa-manifest.mjs');
execFileSync(process.execPath,[verifier,'--kapsam','--v6-guncel',...dirs],{stdio:'inherit'});
const wanted=[['goal',/^l\d+-goal$/,'default'],['intro',/^l\d+-intro$/,'default'],['concept',/^l\d+-concept$/,'default'],['practice',/^l\d+-gorev-word$/,'mc'],['practice',/^l96-gorev-build$/,'build'],['practice',/^l97-gorev-cloze$/,'cloze'],['feedback',/^l\d+-panel-/,'default'],['apply',/^l\d+-apply$/,'default'],['summary',/^l\d+-summary$/,'default'],['partEnd',/^l99-partEnd$/,'default'],['read',/^l98-read$/,'default']];
const measurements=[];
for(const dir of dirs){
 const m=JSON.parse(fs.readFileSync(path.join(dir,'MANIFEST.json'),'utf8'));
 for(const [stage,pattern,variant] of wanted){
  const row=m.rows.find((r)=>pattern.test(r.scene));
  if(!row||!row.cta)throw Error(`${path.basename(dir)} ${stage}/${variant}: gerçek sahne yok`);
  const entry=m.ctaReport.find((r)=>r.scene===row.scene);
  if(!entry||!entry.repeatJson)throw Error(`${row.scene}: ikinci ölçüm yok`);
  const second=JSON.parse(entry.repeatJson);
  for(const [index,cta] of [row.cta,second].entries()){
    const keyboard=index?entry.keyboard:entry.keyboardFirst;
    if(!keyboard?.leftTarget||!keyboard.focused||!keyboard.visible)throw Error(`${row.scene}: klavye ölçümü eksik`);
    const covered=cta.hiddenBy||cta.overlapCovered||(cta.overlapsControl||[]).some((x)=>x.overlapPx>=8);
    measurements.push({stage,theme:m.theme,scenario:row.scene,variant,render:index+1,viewport:row.viewport,primary:{selector:cta.selector,x:cta.x,y:cta.y,width:cta.width,height:cta.height,visible:cta.visible},overlap:{covered:!!covered},focusReachable:true,source:{dir:path.relative(root,dir),scene:row.scene,screenshotSha256:row.sha256}});
  }
 }
}
const output=path.join(base,'MEASUREMENTS.json');
fs.writeFileSync(output,JSON.stringify({measurements},null,2)+'\n');
execFileSync(process.execPath,[path.join(root,'kao3-premium/araclar/eylem-geometri.cjs'),'--olcum',output],{stdio:'inherit'});
console.log(`PASS ${measurements.length} gerçek ölçüm · ${output}`);
