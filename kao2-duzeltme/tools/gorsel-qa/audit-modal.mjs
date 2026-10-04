// usage: node audit-modal.mjs <root> <outDir> <profileName> [width] [dark|light] [yazı ölçeği, ör. 2 = %200]
// Tüm KAO modal görünümlerini ve ders akışlarını gezer: ekran görüntüsü + otomatik DOM denetimi
// (sıkışık metin, kırpılan taşma, 44 px altı dokunma hedefi, ekran dışı eleman, yatay kaydırma). Sentetik veri.
import { launch } from './cdp.mjs';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
const [root, out, prof, widthArg, themeArg, scaleArg] = process.argv.slice(2);
const width = Number(widthArg) || 390, theme = themeArg === 'light' ? 'light' : 'dark', scale = Number(scaleArg) || 1;
fs.mkdirSync(out, { recursive: true });
const b = await launch(root, path.join(os.tmpdir(), prof), { width, height: 844 });
const log = [], seen = new Set();
const AUDIT = `(function(){
  var dlg=document.querySelector('[role=dialog]')||document.body,issues=[],vw=window.innerWidth;
  if(document.documentElement.scrollWidth>vw+1) issues.push('YATAY KAYDIRMA doc='+document.documentElement.scrollWidth+' vw='+vw);
  if(dlg.scrollWidth>dlg.clientWidth+1) issues.push('YATAY TAŞMA dialog sw='+dlg.scrollWidth+' cw='+dlg.clientWidth);
  [].slice.call(dlg.querySelectorAll('*')).forEach(function(e){
    var cs=getComputedStyle(e); if(cs.display==='none'||cs.visibility==='hidden'||e.closest('[hidden],[aria-hidden=true]')) return;
    var closed=e.closest('details:not([open])'); if(closed&&e!==closed&&!e.closest('summary')) return;
    var r=e.getBoundingClientRect(); if(r.width===0&&r.height===0) return;
    var own=[].slice.call(e.childNodes).filter(function(n){return n.nodeType===3&&n.textContent.trim().length>0}).map(function(n){return n.textContent.trim()}).join(' ');
    var id=e.tagName.toLowerCase()+(e.className&&typeof e.className==='string'?'.'+e.className.trim().split(/\\s+/).join('.'):'');
    var tops={},nTxt=0;[].slice.call(e.childNodes).forEach(function(n){if(n.nodeType===3&&n.textContent.trim()){var rg=document.createRange();rg.selectNodeContents(n);[].slice.call(rg.getClientRects()).forEach(function(q){tops[Math.round(q.top/4)]=1;nTxt++})}});
    var lines=Object.keys(tops).length;
    if(own.length>=8&&lines>=3&&r.width<120&&own.length/lines<7&&cs.display!=='inline'&&!e.closest('.kao-sr-only')) issues.push('DAR SÜTUN '+id+' w='+Math.round(r.width)+' satır='+lines+' "'+own.slice(0,22)+'"');
    if(!e.closest('.kao-sr-only')&&cs.overflowX!=='visible'&&e.clientWidth>0&&e.scrollWidth>e.clientWidth+2&&!/^(html|body)$/i.test(e.tagName)&&e.scrollHeight<=e.clientHeight+2&&!/auto|scroll/.test(cs.overflowX)) issues.push('KIRPILAN '+id+' sw='+e.scrollWidth+' cw='+e.clientWidth);
    var par=e.parentElement;
    if(par&&par!==dlg&&cs.position!=='absolute'&&cs.position!=='fixed'&&cs.position!=='sticky'&&!e.closest('.kao-sr-only')){
      var pr=par.getBoundingClientRect(),pcs=getComputedStyle(par),boxed=parseFloat(pcs.borderTopWidth)>0||/hidden|clip/.test(pcs.overflow);
      if(boxed&&pr.height>0&&(r.top<pr.top-1.5||r.bottom>pr.bottom+1.5)&&!/auto|scroll/.test(pcs.overflowY)) issues.push('TAŞAN ÇOCUK '+id+' '+Math.round(r.height)+'px > kap '+Math.round(pr.height)+'px ('+par.className+')');
    }
    var tap=(e.tagName==='BUTTON'||e.tagName==='A'||e.tagName==='SUMMARY'||e.getAttribute('role')==='button'||e.getAttribute('role')==='switch');
    if(tap&&cs.pointerEvents!=='none'&&!e.disabled&&(r.height<43.5||r.width<43.5)) issues.push('KÜÇÜK HEDEF '+id+' '+Math.round(r.width)+'x'+Math.round(r.height)+' "'+(e.textContent||'').trim().slice(0,14)+'"');
    var sc=false;for(var p=e.parentElement;p&&p!==dlg;p=p.parentElement){if(/auto|scroll/.test(getComputedStyle(p).overflowX)){sc=true;break}}
    if(!sc&&(r.right>vw+1||r.left<-1)) issues.push('EKRAN DIŞI '+id+' l='+Math.round(r.left)+' r='+Math.round(r.right));
  });
  return issues.filter(function(x,i,a){return a.indexOf(x)===i}).slice(0,14);
})()`;
const frame = async (name) => {
  const key = await b.eval(`(function(){var d=document.querySelector('[role=dialog]')||document.body;var sc=[].slice.call(d.querySelectorAll('*')).filter(function(e){return e.scrollTop>0})[0];return d.innerText.replace(/\\s+/g,' ').slice(0,400)+'@'+(sc?Math.round(sc.scrollTop):0)})()`);
  if (seen.has(name.split('-')[0] + key)) return false;
  seen.add(name.split('-')[0] + key);
  await b.shot(path.join(out, name + '.png'));
  const issues = await b.eval(AUDIT);
  log.push(`## ${name}: ${key.slice(0, 90)}`);
  issues.forEach((i) => log.push('   ! ' + i));
  return true;
};
await b.goto('http://127.0.0.1:9000/index.html?v3done=1');
await b.eval(`localStorage.setItem('seyma-reset-v1', JSON.stringify((function(){var d=window.createDefaultData();d.settings.locationEnabled=true;return d})()))`);
await b.goto('http://127.0.0.1:9000/index.html?v3done=1');
log.push('origin: ' + await b.eval('location.origin + " force:" + localStorage.getItem("seyma-sync-force")') + ' width=' + width);
const seed = (withCards) => `(function(){
  ui.authUnlocked=true; ui.locationGateState='granted';
  var q=SeymaQuranLearn.ensureQuranLearn(data); q.onboarding.doneAt='2026-09-20T00:00:00.000Z';
  if(${withCards}){var L=window.QuranLexiconV1.lemmas.slice().sort(function(a,b){return (b.freq||0)-(a.freq||0)}).slice(0,60);
  L.forEach(function(l){['ar>tr','tr>ar'].forEach(function(d){q.cards['w:'+l.id+':'+d]={state:'review',s:40,due:'2026-12-01T00:00:00.000Z'}})});
  q.path.lessons=q.path.lessons||{}; q.path.lessons['u01.01']={doneAt:'2026-09-25T00:00:00.000Z'};
  for(var i=1;i<=4;i++){var d=new Date(Date.now()-i*86400000).toISOString().slice(0,10);q.daily[d]={answered:20,correct:16,new:2,reviewed:18,ms:20*9000}}}
  return true})()`;
await b.eval(seed(true));
if (theme === 'light') await b.eval('App.setTheme(false)');
if (scale !== 1) await b.eval(`document.documentElement.style.fontSize='${16 * scale}px'`);
log.push(`tema=${theme} yazı-ölçeği=${scale} gerçek-tema=` + await b.eval(`document.getElementById('root').getAttribute('data-theme')`));
for (const v of ['home', 'units', 'grammar', 'reader', 'phonics', 'ayah', 'prayer', 'sources', 'roots', 'gate', 'stats', 'settings']) {
  await b.eval(`SeymaQuranLearn.kaoOpen('home'); SeymaQuranLearn.kaoSetView('${v}')`); await b.wait(500);
  await frame('v-' + v);
  await b.eval(`(function(){var d=document.querySelector('[role=dialog] .kao-body, [role=dialog]');var s=[].slice.call(document.querySelectorAll('[role=dialog] *')).filter(function(e){return e.scrollHeight>e.clientHeight+40&&/auto|scroll/.test(getComputedStyle(e).overflowY)})[0];if(s)s.scrollTop=s.scrollHeight})()`);
  await b.wait(300); await frame('v-' + v + '-alt');
}
for (const u of [1, 2, 3, 6, 12]) { await b.eval(`SeymaQuranLearn.kaoOpen('home'); SeymaQuranLearn.kaoNav('unit',${u})`); await b.wait(500); await frame('unit-' + u); }
// kelime detayı
await b.eval(`(function(){var m=window.QuranCurriculumV2.lemmaToLesson,id=Object.keys(m).filter(function(k){var l=window.QuranLexiconV1.byId(k);return l&&l.verified===true&&l.root&&l.examples&&l.examples.length})[0];SeymaQuranLearn.kaoOpen('home');SeymaQuranLearn.kaoNav('word',id)})()`); await b.wait(500); await frame('word');
// DOM güdümlü yürüyüş: cevapla → birincil düğme
const walk = async (prefix, startJs, max) => {
  await b.eval(`SeymaQuranLearn.kaoOpen('home')`); await b.eval(startJs); await b.wait(600);
  for (let i = 0; i < max; i++) {
    await frame(`${prefix}-${String(i).padStart(2, '0')}`);
    const act = await b.eval(`(function(){
      var d=document.querySelector('[role=dialog]')||document.body;
      var ch=[].slice.call(d.querySelectorAll('.kao-choices button:not([disabled]), .kao-s0-choice:not([disabled])'));
      if(ch.length){ ch[0].click(); return 'choice'; }
      var p=[].slice.call(d.querySelectorAll('.kao-primary:not([disabled])'))[0];
      if(p){ p.click(); return 'primary:'+p.textContent.trim().slice(0,20); }
      var s=[].slice.call(d.querySelectorAll('.kao-secondary:not([disabled])')).filter(function(x){return /geç|Sonraki|Devam|ilerle/i.test(x.textContent)})[0];
      if(s){ s.click(); return 'secondary'; }
      return 'none'; })()`);
    await b.wait(450);
    if (act === 'none') break;
  }
};
for (let n = 1; n <= 12; n++) {
  const id = 's0.' + String(n).padStart(2, '0');
  await b.eval(seed(false)); await walk('s0-' + String(n).padStart(2, '0'), `App.kaoS0('start','${id}')`, 14);
}
for (const id of ['u01.02', 'u02.01', 'u05.01', 'u09.01']) {
  await b.eval(seed(true)); await walk('ders-' + id.replace('.', '_'), `App.kaoLesson('start','${id}')`, 24);
}
fs.writeFileSync(path.join(out, 'audit.txt'), log.join('\n') + '\nblocked-external: ' + b.blocked.length + '\n');
console.log(log.filter((l) => l.startsWith('   !') || l.startsWith('origin')).length, 'satır bulgu/başlık');
await b.close();
