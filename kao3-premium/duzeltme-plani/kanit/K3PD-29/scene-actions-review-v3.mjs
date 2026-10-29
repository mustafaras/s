#!/usr/bin/env node
// Ham G4 sınıflama adayı. MANUEL İNCELEME YERİNE GEÇMEZ; otomatik PASS üretmez.
import fs from 'node:fs';
import path from 'node:path';
const base=path.join(process.cwd(),'kao3-premium/duzeltme-plani/kanit/K3PD-29/v11-20261028');
const names=['light-320','dark-320','light-390','dark-390','light-460','dark-460','light-390-inset'];
const rules=[
 [/^v01-|^z3-/,/kao-today-hero-link/], [/^v02-/,/kao-path-entry-row|kao-path-unit-row/], [/^v03-|^v07-|^v08-|^z2-|^s0-.*-cevap$/, /kao-primary/],
 [/^v04-/,/kao-audio|kao-secondary/], [/^v05-/,/kao-secondary/], [/^v06-/,/^$/], [/^z1-/,/kao-switch-row|kao-group-row/],
 [/^v09-/,/kao-prayer-word/], [/^v11-/,/^$/], [/^v12-/,/kao-grammar-row/], [/^v14-/,/kao-root-row|kao-roots/], [/^v15-/,/kao-secondary/],
 [/^s0-asama-[12]$/, /kao-primary/], [/^s0-asama-[34]$/, /kao-s0-choice/], [/^o3-/,/kao-primary/], [/^o4-/,/kao-onboard-option/],
 [/^o5-|^o6-/,/kao-onboard-choice/], [/^o7-/,/kao-onboard-chip|kao-primary/]
];
const output=[];
for(const n of names){const dir=path.join(base,n),m=JSON.parse(fs.readFileSync(path.join(dir,'MANIFEST.json'),'utf8'));for(const r of m.rows){if(r.cta)continue;const data=JSON.parse(r.actionsJson);if(r.sceneKind==='glyph'){output.push({run:n,scene:r.scene,screenshot:r.screenshot,sha256:r.sha256,selection:'N/A: glif tablosu',indices:[]});continue;}
 const visible=data.actions.filter(a=>a.rendered&&a.visible&&!a.disabled);let candidates=[];let selection;
 if(r.scene==='v01-home'||r.scene==='z3-tekrar-sonrasi-ana'){candidates=visible.filter(a=>/kao-today-hero-link|kao-notice-close/.test(a.cls));selection='hero ve varsa öncelikli uyarı kararları';}
 else if(r.scene==='v05-reader'){candidates=visible.filter(a=>!(/kao-navbar-action/.test(a.cls)));selection='okuyucu görünür kelime ve ses eylemleri';}
 else if(r.scene==='v13-concept'){candidates=data.actions.filter(a=>!a.disabled&&(a.tag==='SUMMARY'||/kao-grammar-lesson/.test(a.cls)));selection='görünüm altında kavram özeti ve ders eylemi; scroll kanıtı ayrı';}
 else if(r.scene==='v14-roots'){candidates=visible.filter(a=>a.tag==='INPUT'||/kao-secondary|kao-root-row/.test(a.cls));selection='kök arama, tüm kökler ve kök satırları';}
 else if(r.scene==='o1-ilk-acilis-1'){candidates=visible.filter(a=>a.tag==='BUTTON').slice(-1);selection='başlangıç düğmesi';}
 else {const rule=rules.find(([pattern])=>pattern.test(r.scene));if(rule){candidates=visible.filter(a=>rule[1].test(a.cls));selection='sahne sınıfından aday eylem';}else selection='birincil eylem tanımı incelenmeli';}
 const nonNav=visible.filter(a=>!(/kao-navbar-action/.test(a.cls)));
 output.push({run:n,scene:r.scene,theme:r.theme,viewport:r.viewport,screenshot:r.screenshot,sha256:r.sha256,selection,visibleEnabled:visible.length,nonNavigationVisible:nonNav.length,indices:candidates.map(a=>a.index),candidates:candidates.map(a=>({index:a.index,tag:a.tag,cls:a.cls,x:a.x,y:a.y,width:a.width,height:a.height,fullyVisible:a.fullyVisible,covered:a.covered,overlapCount:a.contentOverlaps.length})),verdict:'UNVERIFIED'});
}}
const file=path.join(base,'SAHNE-EYLEM-INCELEME-ADAYI-v3.json');fs.writeFileSync(file,JSON.stringify({status:'UNVERIFIED',note:'Tekil adaylar görüntü/kaynakla incelenmelidir; geometrik kesişim örtülme hükmü değildir.',scenes:output},null,2)+'\n');
console.log(`ADAY ${output.length} sahne kaydı; eylemli kayıtlar UNVERIFIED, glif N/A: ${file}`);
