// Hassas tarama: yorumlar + stringler + .prop erişimleri temizlenir
import fs from 'node:fs';
const head = fs.readFileSync('/tmp/head_app.js','utf8');const app = fs.readFileSync('app.js','utf8');
const mod = fs.readFileSync('app/core/reminders.js','utf8');

const RESTORE=['mergePersistedReminderState','reminderPermissionSnapshot','reminderPermissionStorageRead','reminderPermissionStorageWrite','reminderPreviewNotification','reminderNativeDisplay','reminderSystemOffline','reminderDeliveryStorageRead','reminderDeliveryStorageWrite','reminderDeliveryClear','reminderLifecycleDefaultContext','reminderLifecycleDraftActive','reminderLifecycleReplaceTarget','reminderLifecycleUpdateLive','reminderActionStorageRead','reminderActionStorageWrite','reminderLockBodyScroll','reminderUnlockBodyScroll','reminderActiveElementId','reminderRestoreFocus','reminderRemoveLocalKey','appendReminderEvent','persistReminderEvent','reminderPermissionRequest','reminderCurrentRoot','reminderLifecycleRenderIfNeeded','reminderActionCommit','updateReminderPolicy','reminderSetEnabled','reminderCloseForTarget','migrateReminderState'];

function headBody(name){const s=head.indexOf('function '+name+'(');if(s<0)return null;const e=head.indexOf('\nfunction ',s+10);return head.slice(s,e<0?head.length:e);}
function stripNoise(src){
  let out=src.replace(/\/\*[\s\S]*?\*\//g,' ').replace(/\/\/[^\n]*/g,' ');
  // string literal'ları boşalt (kaçışlı tırnak dahil)
  out=out.replace(/'(?:\\.|[^'\\])*'/g,"''").replace(/"(?:\\.|[^"\\])*"/g,'""').replace(/`(?:\\.|[^`\\])*`/g,'``');
  return out;
}
// app.js'de tanımlı tüm fonksiyon/var adları (kabaca)
const appFns=new Set([...app.matchAll(/\bfunction ([A-Za-z_$][\w$]*)\(/g)].map(m=>m[1]));
const appVars=new Set([...app.matchAll(/^\s*(?:var|let|const) ([A-Za-z_$][\w$]*)/gm)].map(m=>m[1]));
const exportedFromModule=new Set([...mod.matchAll(/root\["([^"]+)"\]=typeof/g)].map(m=>m[1]));
const moduleDeclares=new Set([...mod.matchAll(/^ {2}(?:function (\w+)|var (\w+))/gm)].map(m=>m[1]||m[2]));
const JS=new Set(['Object','Array','String','Number','Boolean','Math','JSON','Date','RegExp','Error','Promise','isNaN','parseInt','parseFloat','window','document','localStorage','navigator','Notification','setTimeout','clearTimeout','setInterval','clearInterval','fetch','globalThis','console','undefined','true','false','null','typeof','return','var','let','const','function','if','else','for','while','try','catch','new','delete','in','of','this','arguments','void','instanceof','Intl','URL','Blob','Map','Set','Symbol','performance','requestAnimationFrame','matchMedia','encodeURIComponent','decodeURIComponent','alert','confirm','location','history','screen','visualViewport','IntersectionObserver','MutationObserver','CustomEvent','KeyboardEvent','FocusEvent','Event','FormData','XMLHttpRequest','AbortController','Headers','Request','Response','structuredClone','queueMicrotask','TextEncoder','crypto','btoa','atob','Notification','serviceWorker','indexedDB','sessionStorage','caches','self','top','parent','frames','opener','origin','name','status','length','event']);

const appKnown=new Set([...appFns,...appVars,'data','ui','dark','App','SEYMA_REMINDERS','SEYMA_APP_SURFACE']);
// Modülde kalan + export edilen her ad: restore gövdeleri için serbest (trap window üzerinden çözer)
const moduleAvailable=new Set([...exportedFromModule].filter(n=>moduleDeclares.has(n)));

console.log('=== GERÇEK BARE-REF BOŞLUKLARI (restore gövdeleri) ===');
for(const fn of RESTORE){
  const raw=headBody(fn);
  if(!raw){console.log(fn,': HEAD-BULUNAMADI');continue;}
  const clean=stripNoise(raw);
  const ids=new Set([...clean.matchAll(/(?<![.\w$'"`])([A-Za-z_$][\w$]*)/g)].map(m=>m[1]));
  // yerel tanımlar: var/let/const/param/function adları
  const locals=new Set([...clean.matchAll(/(?:var|let|const)\s+([A-Za-z_$][\w$]*)/g)].map(m=>m[1]));
  for(const m of clean.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g)) locals.add(m[1]);
  for(const m of clean.matchAll(/function\s*\(([^)]*)\)/g)) for(const p of m[1].split(',')) {const t=p.trim().match(/[A-Za-z_$][\w$]*$/); if(t)locals.add(t[0]);}
  for(const m of clean.matchAll(/\(([A-Za-z_$][\w$]*)\)\s*=>/g)) locals.add(m[1]);
  for(const m of clean.matchAll(/catch\s*\(\s*([A-Za-z_$][\w$]*)\s*\)/g)) locals.add(m[1]);
  for(const m of clean.matchAll(/([A-Za-z_$][\w$]*)\s*(?::|=)\s*function/g)) locals.add(m[1]);
  const unknown=[...ids].filter(id=>!JS.has(id)&&!locals.has(id)&&!RESTORE.includes(id)&&!appKnown.has(id)&&!moduleAvailable.has(id));
  if(unknown.length) console.log(fn,'->',unknown.join(','));
}
console.log('\n=== MODULDE KALAN CAGRI ADAYLARI (external bag) ===');
const modLines=mod.split('\n');
const modFns=[];
for(let i=0;i<modLines.length;i++){const m=modLines[i].match(/^ {2}function (\w+)\(/);if(m)modFns.push({name:m[1],start:i});}
for(let i=0;i<modFns.length;i++)modFns[i].end=(i+1<modFns.length)?modFns[i+1].start:modLines.length;
const extNeed=new Set();
for(const fn of RESTORE){
  const needle=fn+'(';
  for(const f of modFns){
    if(RESTORE.includes(f.name)||f.name==='migrateReminderState')continue;
    const body=modLines.slice(f.start,f.end).join('\n');
    if(body.indexOf(needle)>=0){console.log(fn,'<-',f.name);extNeed.add(fn);}
  }
}
console.log('\nExternal bag eklenmesi gerekenler ('+extNeed.size+'):',[...extNeed].join(', '));
