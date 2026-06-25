// sync.js — Şeyma 🦩 repo senkron katmanı
// İki yöntem destekler:
//   1) Doğrudan GitHub: settings.ghToken + ghRepo (+ ghBranch) varsa, veriyi
//      tarayıcıdan doğrudan GitHub Contents API ile repoya yazar. Worker gerekmez.
//   2) Cloudflare Worker: settings.syncUrl varsa, veriyi o endpoint'e POST eder.
// Token YALNIZCA bu cihazın localStorage'ında durur; repoya/sayfaya yazılmaz.
// Hiçbiri tanımlı değilse sessizce devre dışı kalır (yalnızca yerel kayıt).
(function(){
"use strict";
var KEY='seyma-reset-v1';
var DEBOUNCE=4000;
var timer=null, lastPayload=null;
var state={status:'idle', last:null, error:null};

function settings(){
  if(lastPayload && lastPayload.settings) return lastPayload.settings;
  try{ var raw=localStorage.getItem(KEY); if(raw){ var d=JSON.parse(raw); return d&&d.settings||{}; } }catch(e){}
  return {};
}
function cfg(){
  var s=settings();
  var tok=(s.ghToken||'').trim(), repo=(s.ghRepo||'').trim();
  if(tok && repo.indexOf('/')>0){ var p=repo.split('/'); return {mode:'github', token:tok, owner:p[0].trim(), repo:p[1].trim(), branch:(s.ghBranch||'data').trim()||'data'}; }
  var url=(s.syncUrl||'').trim();
  if(url) return {mode:'worker', url:url};
  return null;
}
function pad(n){ return (n<10?'0':'')+n; }
function timeStr(iso){ try{ var d=new Date(iso); return pad(d.getHours())+':'+pad(d.getMinutes()); }catch(e){ return ''; } }
function statusText(){
  var c=cfg();
  if(!c) return 'Sync kapalı — veriler bu cihazda saklanıyor.';
  var where=c.mode==='github'?('GitHub · '+c.owner+'/'+c.repo+'@'+c.branch):'Worker';
  if(state.status==='saving') return 'Kaydediliyor… ('+where+')';
  if(state.status==='ok') return 'Repoya kaydedildi ✓ '+timeStr(state.last)+' · '+where;
  if(state.status==='error') return 'Sync hatası: '+(state.error||'bilinmiyor');
  return 'Hazır · '+where;
}
function paint(){ var el=document.getElementById('sey-sync-status'); if(el) el.textContent=statusText(); }
function setStatus(s,err){ state.status=s; if(s==='ok'){ state.last=new Date().toISOString(); state.error=null; } if(s==='error') state.error=err||'bilinmiyor'; paint(); }

// unicode-safe base64 (büyük JSON için döngülü)
function b64(str){ var bytes=new TextEncoder().encode(str); var bin=''; for(var i=0;i<bytes.length;i++) bin+=String.fromCharCode(bytes[i]); return btoa(bin); }

function ghHeaders(c){ return {'Authorization':'Bearer '+c.token,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'}; }
function ghPut(c, path, contentStr){
  var api='https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+path;
  var H=ghHeaders(c);
  return fetch(api+'?ref='+encodeURIComponent(c.branch),{headers:H})
    .then(function(r){ if(r.status===200) return r.json().then(function(g){ return g.sha; }); return null; })
    .then(function(sha){ var body={message:'sync: '+path, content:b64(contentStr), branch:c.branch}; if(sha) body.sha=sha;
      var H2={}; for(var k in H) H2[k]=H[k]; H2['Content-Type']='application/json';
      return fetch(api,{method:'PUT',headers:H2,body:JSON.stringify(body)}); })
    .then(function(r){ if(!r.ok) return r.text().then(function(t){ throw new Error(r.status+' '+t.slice(0,160)); }); });
}
function pushGithub(c, data){
  setStatus('saving');
  var today=(data&&data.lastOpenedDate)|| new Date().toISOString().slice(0,10);
  var latest=JSON.stringify(data,null,2);
  var snap=JSON.stringify({app:'seyma',date:today,savedAt:new Date().toISOString(),data:data},null,2);
  ghPut(c,'data/latest.json',latest)
    .then(function(){ return ghPut(c,'data/seyma-'+today+'.json',snap); })
    .then(function(){ setStatus('ok'); })
    .catch(function(e){ setStatus('error', String((e&&e.message)||e)); });
}
function pushWorker(c, data){
  setStatus('saving');
  var today=(data&&data.lastOpenedDate)|| new Date().toISOString().slice(0,10);
  var body=JSON.stringify({app:'seyma',date:today,savedAt:new Date().toISOString(),data:data});
  fetch(c.url,{method:'POST',headers:{'Content-Type':'application/json'},body:body})
    .then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.text().catch(function(){return '';}); })
    .then(function(){ setStatus('ok'); })
    .catch(function(e){ setStatus('error', String((e&&e.message)||e)); });
}
function doPush(data){ var c=cfg(); if(!c){ setStatus('idle'); return; } if(c.mode==='github') pushGithub(c,data); else pushWorker(c,data); }

window.SeySync={
  schedule:function(data){ lastPayload=data; if(!cfg()){ setStatus('idle'); return; } clearTimeout(timer); setStatus('saving'); timer=setTimeout(function(){ doPush(lastPayload); }, DEBOUNCE); },
  pushNow:function(){ clearTimeout(timer); if(lastPayload){ doPush(lastPayload); return; } try{ var raw=localStorage.getItem(KEY); if(raw) doPush(JSON.parse(raw)); }catch(e){} },
  statusText:statusText
};
})();
