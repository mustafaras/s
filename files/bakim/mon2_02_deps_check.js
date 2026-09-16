// MON2-02 iki yönlü bağımlılık denetimi v2
const fs=require('fs');
const headApp=fs.readFileSync('/tmp/head_app.js','utf8').split('\n');
const curApp=fs.readFileSync('app.js','utf8').split('\n');
const mod=fs.readFileSync('app/core/reminders.js','utf8').split('\n');

const KW=new Set(('function var let const return if else for while do switch case break continue try catch finally throw new delete typeof instanceof in of void this arguments null true false undefined NaN Infinity class extends super yield async await default with debugger static get set import export from as').split(' '));
const JS_G=new Set(('globalThis window document navigator localStorage sessionStorage location history console Math JSON Object Array String Number Boolean Date RegExp Error TypeError RangeError Promise Set Map WeakMap WeakSet Symbol Proxy Reflect parseInt parseFloat isNaN isFinite encodeURIComponent decodeURIComponent encodeURI decodeURI setTimeout clearTimeout setInterval clearInterval requestAnimationFrame cancelAnimationFrame fetch XMLHttpRequest URL URLSearchParams Blob FileReader FormData alert confirm prompt Notification AudioContext webkitAudioContext vibrate screen matchMedia getComputedStyle structuredClone crypto performance Intl event self top frames parent opener visualViewport indexedDB caches speechSynthesis AbortController TextDecoder TextEncoder MutationObserver IntersectionObserver ResizeObserver CustomEvent Event KeyboardEvent TouchEvent PointerEvent open close focus blur scrollTo scrollBy innerWidth innerHeight devicePixelRatio app App data ui dark migrate getDay createDefaultData save sync SeySync SeyAudio SeyHaptics SeyFx SeyTimeTheme SeySkyFx SeyOnSyncState SeyOnSynced SEYMA_APP_SURFACE SEYMA_REMINDERS ReminderCatalogV1 ReminderEngineV1 ReminderSchedulerV1 ReminderDeliveryV1 SeymaConstants SeymaState SeymaSave SeymaDateUtils SeymaHelpers SeymaRender SeymaAppSurface SeymaReminders MotivationProgramV2 MotivationNarratives SaygiPeople ProfileAssessmentV1 HijriCalendarV1 QuranRevelationOrderV1 QuranStrikingVersesV1 EsmaulHusnaV1 EsmaulHusnaV2 ZikirCoreContentV1 QuranTransportV1').split(' '));
const PROP=new Set(('length push pop shift unshift slice splice concat join indexOf lastIndexOf includes forEach map filter reduce some every find findIndex keys values entries assign freeze defineProperty getOwnPropertyNames hasOwnProperty toString toLocaleString valueOf charCodeAt charAt substring substr toUpperCase toLowerCase trim trimStart trimEnd padStart padEnd split replace replaceAll startsWith endsWith repeat match test exec call apply bind then catch finally floor ceil round abs min max random pow sqrt now parse stringify sort reverse flat flatMap from of isArray fromCharCode codePointAt cloneNode appendChild removeChild insertBefore querySelector querySelectorAll getElementById createElement createDocumentFragment textContent innerHTML className classList add remove toggle contains setAttribute getAttribute removeAttribute style value disabled checked dataset firstChild nextSibling parentNode parentElement children name type id href src title placeholder role tabindex ariaModal ariaLabel ariaHidden ariaLive open hidden action method target rel download files label description icon status code version supported currentVersion schemaVersion preferences profile onboarding policy specialDays medications personalization _localMeta enabled channel category occurrenceId occurrences context options candidates selected rejected reason kind operation section path correlationId savedAt date nativeDailyCap lowPriorityNativeCap sameCategoryCooldownMinutes dailyFlowBudget capacityMode quietHours start end careNativeCategories careMovementOptIn optIn historyMode autoApply signals dismissed applied updatedAt minutes hour minute key value text ok cancel confirm message preventDefault stopPropagation stopImmediatePropagation currentTarget bubbles cancelable shiftKey ctrlKey altKey metaKey repeat isComposing scrollIntoView scrollTop scrollHeight').split(' '));

// ---- modül analizi ----
const withStart=mod.findIndex(l=>/^  with\(scope\)\{/.test(l));
let compatStart=-1;for(let i=withStart;i<mod.length;i++){if(/^  root\["/.test(mod[i])){compatStart=i;break;}}
const modFns=new Set(),modVars=new Set();
for(let i=withStart;i<compatStart;i++){
  let m=mod[i].match(/^(?:  )?function ([A-Za-z_$][\w$]*)\(/);if(m)modFns.add(m[1]);
  m=mod[i].match(/^(?:  )?(?:var|let|const) ([A-Za-z_$][\w$]*)/);if(m)modVars.add(m[1]);
}
const modMembers=new Set([...modFns,...modVars]);
const compatNames=new Set();
for(let i=compatStart;i<mod.length;i++){const m=mod[i].match(/root\["([A-Za-z_$][\w$]*)"\]/);if(m)compatNames.add(m[1]);}
for(let i=0;i<withStart;i++){let m=mod[i].match(/^  function ([A-Za-z_$][\w$]*)\(/);if(m)modMembers.add(m[1]);m=mod[i].match(/^  (?:var|let|const) ([A-Za-z_$][\w$]*)/);if(m)modMembers.add(m[1]);}

// ---- current app.js ----
const curFns=new Set(),curVars=new Set();
for(const l of curApp){
  let m=l.match(/^(?:function ([A-Za-z_$][\w$]*)\(|  function ([A-Za-z_$][\w$]*)\()/);if(m)curFns.add(m[1]||m[2]);
  m=l.match(/^(?:var|let|const) ([A-Za-z_$][\w$]*)/);if(m)curVars.add(m[1]);
}

// ---- RESTORE ----
const RESTORE=['appendReminderEvent','persistReminderEvent','reminderEventDigest','reminderEventCorrelation','reminderSchemaCompatibility','reminderSchemaStatusForData','reminderPermissionRequest','reminderCurrentRoot','migrateReminderState','reminderLifecycleRenderIfNeeded','reminderActionCommit','updateReminderPolicy','reminderSetEnabled','reminderCloseForTarget','reminderPermissionSnapshot','reminderPermissionStorageRead','reminderPermissionStorageWrite','reminderNativeDisplay','reminderSystemOffline','reminderDeliveryStorageRead','reminderDeliveryStorageWrite','reminderLifecycleDefaultContext','reminderLifecycleDraftActive','reminderLifecycleReplaceTarget','reminderLifecycleUpdateLive','reminderActionStorageRead','reminderActionStorageWrite','reminderLockBodyScroll','reminderUnlockBodyScroll','reminderPreviewSafeCopyLegacy'];
const restSet=new Set(RESTORE);

function extractHead(name){
  const re=new RegExp('^function '+name+'\\(');
  for(let i=0;i<headApp.length;i++){
    if(re.test(headApp[i])){
      let j=i+1;
      while(j<headApp.length&&!/^}/.test(headApp[j]))j++;
      return {start:i+1,end:j+1,text:headApp.slice(i,j+1).join('\n')};
    }
  }
  return null;
}
function extractMod(name){
  const re=new RegExp('^  function '+name+'\\(');
  for(let i=withStart;i<compatStart;i++){
    if(re.test(mod[i])){
      let j=i+1;
      while(j<compatStart&&!/^  \}\s*$/.test(mod[j]))j++;
      return {start:i+1,end:j+1,text:mod.slice(i,j+1).join('\n')};
    }
  }
  return null;
}
function localsOf(sigLine,body){
  const loc=new Set();
  const pm=sigLine.match(/\(([^)]*)\)/);
  if(pm)pm[1].split(',').forEach(p=>{const n=p.trim().replace(/=.*/,'').trim();if(/^[A-Za-z_$][\w$]*$/.test(n))loc.add(n);});
  const re=/\b(?:var|let|const)\s+([^;\n]+?)(?=;|\n|$)/g;let m;
  while((m=re.exec(body))){m[1].split(',').forEach(function(chunk){const n=chunk.trim().replace(/=.*/,'').trim();if(/^[A-Za-z_$][\w$]*$/.test(n))loc.add(n);});}
  const fre=/function\s+([A-Za-z_$][\w$]*)\s*\(/g;while((m=fre.exec(body)))loc.add(m[1]);
  const cre=/catch\s*\(\s*([A-Za-z_$][\w$]*)\s*\)/g;while((m=cre.exec(body)))loc.add(m[1]);
  const fre2=/function\s*\(([^)]*)\)/g;while((m=fre2.exec(body)))m[1].split(',').forEach(p=>{const n=p.trim().replace(/=.*/,'').trim();if(/^[A-Za-z_$][\w$]*$/.test(n))loc.add(n);});
  return loc;
}
function refs(body){
  const noStr=body.replace(/\/\*[\s\S]*?\*\//g,' ').replace(/\/\/[^\n]*/g,' ').replace(/'(?:[^'\\]|\\.)*'/g,"''").replace(/"(?:[^"\\]|\\.)*"/g,'""').replace(/`(?:[^`\\]|\\.)*`/g,'``');
  const out=[];const idRe=/[A-Za-z_$][\w$]*/g;let m;
  while((m=idRe.exec(noStr))){
    const t=m[0];
    if(noStr.slice(Math.max(0,m.index-1),m.index)==='.')continue;
    if(/^\s*:/.test(noStr.slice(m.index+t.length)))continue;
    out.push(t);
  }
  return out;
}

// ==== A) restore gövdeleri ====
console.log('=== A) RESTORE gövdeleri: app.js kapsamında çözülemeyenler ===');
const allowA=new Set(['reminderDeliverySuppress']);
let aIssues=0;const seenA=new Set();
for(const name of RESTORE){
  const ex=extractHead(name);
  if(!ex){console.log('  !! HEAD yok:',name);aIssues++;continue;}
  const loc=localsOf(headApp[ex.start-1],ex.text);
  for(const r of refs(ex.text)){
    if(KW.has(r)||JS_G.has(r)||PROP.has(r))continue;
    if(loc.has(r))continue;
    if(curFns.has(r)||curVars.has(r))continue;
    if(restSet.has(r))continue;
    if(compatNames.has(r))continue;
    if(allowA.has(r)){aIssues++;console.log('  ~ '+name+' (HEAD '+ex.start+') -> '+r+' [HEAD latent]');continue;}
    if(!seenA.has(r)){seenA.add(r);aIssues++;console.log('  ? '+name+' (HEAD '+ex.start+'-'+ex.end+') -> '+r);}
  }
}

// ==== external bag ====
let bagStart=-1,bagEnd=-1;
for(let i=0;i<curApp.length;i++){if(curApp[i].includes('external:{')){bagStart=i;break;}}
for(let i=bagStart;i<curApp.length;i++){if(/^\s*\},?\s*$/.test(curApp[i])){bagEnd=i;break;}}
const bagSrc=curApp.slice(bagStart,bagEnd+1).join('\n');
const curBag=new Set();
{const inner=bagSrc.slice(bagSrc.indexOf('external:{')+10,bagSrc.lastIndexOf('}'));
 for(const e of inner.split(/,(?![^()]*\))/)){const mm=e.match(/^\s*([A-Za-z_$][\w$]*)\s*:/);if(mm)curBag.add(mm[1]);}}
const NEW_EXT=['reminderPermissionSnapshot','reminderPermissionStorageRead','reminderPermissionStorageWrite','reminderNativeDisplay','reminderSystemOffline','reminderDeliveryStorageRead','reminderDeliveryStorageWrite','reminderLifecycleDefaultContext','reminderLifecycleDraftActive','reminderLifecycleReplaceTarget','reminderLifecycleUpdateLive','reminderActionStorageRead','reminderActionStorageWrite','appendReminderEvent','persistReminderEvent','reminderCurrentRoot','reminderLifecycleRenderIfNeeded'];
const extBag=new Set([...curBag,...NEW_EXT]);

// ==== B) modülde kalan gövdeler ====
console.log('\n=== B) MODÜLDE KALAN gövdeler: çözülemeyen bare refler ===');
let bIssues=0;
for(const name of modFns){
  if(restSet.has(name))continue;
  const ex=extractMod(name);
  if(!ex)continue;
  const loc=localsOf(mod[ex.start-1],ex.text);
  for(const r of refs(ex.text)){
    if(KW.has(r)||JS_G.has(r)||PROP.has(r))continue;
    if(loc.has(r))continue;
    if(modMembers.has(r))continue;
    if(compatNames.has(r))continue;
    if(extBag.has(r))continue;
    if(restSet.has(r)){bIssues++;console.log('  ! '+name+' (modül '+ex.start+') -> '+r+' [silinecek gövde, external listede yok]');continue;}
    if(curFns.has(r)||curVars.has(r)){bIssues++;console.log('  ! '+name+' (modül '+ex.start+') -> '+r+' [app.js var, bag yok]');continue;}
    bIssues++;console.log('  ? '+name+' (modül '+ex.start+') -> '+r+' [bilinmeyen]');
  }
}
console.log('\nbag:',[...curBag].sort().join(','));
console.log('A issues:',aIssues,' B issues:',bIssues);