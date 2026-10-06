// usage: node shoot-app.mjs <root> <outDir> <profileName> [width] [dark]
// Ana uygulama sekmeleri (bugun/harita/rapor/saglik/saygi/mesaj/ayarlar) için kontrollü yerel görsel QA.
// shoot.mjs ile aynı güvenlik: CDP pipe, boş geçici profil, 127.0.0.1:9000, dış istekler kesik, token/forceSync yok.
// Her sekme: üstten başlayıp [data-scroll] kabını görünüm yüksekliği kadar kaydırarak en çok 6 görüntü + yatay taşma taraması.
import { launch } from './cdp.mjs';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
const [root, out, prof, widthArg, dark] = process.argv.slice(2);
const width = Number(widthArg) || 390;
fs.mkdirSync(out, { recursive: true });
const b = await launch(root, path.join(os.tmpdir(), prof), { width, height: 844 });
const log = [];
await b.goto('http://127.0.0.1:9000/index.html?v3done=1');
await b.eval(`localStorage.setItem('seyma-reset-v1', JSON.stringify((function(){var d=window.createDefaultData();d.settings.locationEnabled=true;${dark ? "d.settings.theme='dark';" : ''}return d})()))`);
await b.goto('http://127.0.0.1:9000/index.html?v3done=1');
log.push('origin: ' + await b.eval('location.origin + " token:" + !!(data.settings&&data.settings.ghToken) + " force:" + localStorage.getItem("seyma-sync-force")'));
await b.eval(`(function(){ui.authUnlocked=true;ui.locationGateState='granted';${dark ? "try{if(!dark)App.toggleTheme&&App.toggleTheme()}catch(e){}" : ''}return true})()`);
const SCAN = `(function(){
  var W=window.innerWidth, out=[];
  function path(el){ var n=el.tagName.toLowerCase(), c=(el.getAttribute('class')||'').trim().split(/\\s+/).slice(0,2).join('.'); return n+(c?'.'+c:''); }
  function scrollAnc(el){ for(var p=el.parentElement;p;p=p.parentElement){ var cs=getComputedStyle(p); if(/(auto|scroll)/.test(cs.overflowX)&&p.scrollWidth>p.clientWidth+1) return p; } return null; }
  var root=document.getElementById('root')||document.body, all=root.querySelectorAll('*');
  if(document.documentElement.scrollWidth>W+1) out.push('SAYFA-YATAY-KAYDIRMA sw='+document.documentElement.scrollWidth+' w='+W);
  for(var i=0;i<all.length;i++){ var el=all[i], cs=getComputedStyle(el); if(cs.display==='none'||cs.visibility==='hidden') continue;
    var r=el.getBoundingClientRect(); if(r.width===0&&r.height===0) continue;
    var txt=(el.textContent||'').replace(/\\s+/g,' ').trim();
    if(!txt||el.closest('svg')) continue;
    if((r.right>W+1||r.left<-1)&&!scrollAnc(el)&&el.children.length===0) out.push('DIŞARI-TAŞAR | '+path(el)+' | "'+txt.slice(0,40)+'" right='+Math.round(r.right));
    if(/(hidden|clip)/.test(cs.overflowX)&&el.clientWidth>2&&el.scrollWidth>el.clientWidth+1&&el.children.length===0&&cs.textOverflow!=='ellipsis') out.push('YATAY-KIRPILIR | '+path(el)+' | "'+txt.slice(0,40)+'" sw='+el.scrollWidth+' cw='+el.clientWidth);
  }
  return out.slice(0,25);
})()`;
for (const tab of ['bugun', 'harita', 'rapor', 'saglik', 'saygi', 'mesaj', 'ayarlar']) {
  try {
    await b.eval(`App.go('${tab}')`);
    await b.wait(900);
    const info = await b.eval(`(function(){var s=document.querySelector('[data-scroll]');return s?{sh:s.scrollHeight,ch:s.clientHeight}:{sh:0,ch:0}})()`);
    const steps = Math.min(8, Math.max(1, Math.ceil((info.sh || 844) / Math.max(1, info.ch || 844))));
    for (let i = 0; i < steps; i += 1) {
      await b.eval(`(function(){var s=document.querySelector('[data-scroll]');if(s)s.scrollTop=${i}*(s.clientHeight-40)})()`);
      await b.wait(350);
      await b.shot(path.join(out, `${tab}-${i + 1}.png`));
    }
    const issues = await b.eval(SCAN);
    log.push(`${tab} @${width}px: kaydırma ${info.sh}/${info.ch} · ${steps} görüntü · ${issues.length ? issues.join(' || ') : 'taşma yok'}`);
  } catch (e) { log.push(`${tab}: SKIP ${String(e.message).slice(0, 140)}`); }
}
fs.writeFileSync(path.join(out, 'log.txt'), log.join('\n') + '\n');
console.log(log.join('\n'));
await b.close();
