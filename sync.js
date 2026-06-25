// sync.js — Şeyma 🦩 repo/bulut senkron katmanı
// Bir senkron adresi (data.settings.syncUrl) tanımlıysa, kaydedilen veriyi
// debounce ile o endpoint'e POST eder. Tanımlı değilse sessizce devre dışı kalır.
// Token / kimlik bilgisi BURADA tutulmaz; uçtaki Worker'da gizli kalır.
(function(){
"use strict";
var KEY='seyma-reset-v1';
var DEBOUNCE=4000;
var timer=null, lastPayload=null;
var state={status:'idle', last:null, error:null};

function endpoint(){
  if(lastPayload && lastPayload.settings) return (lastPayload.settings.syncUrl||'').trim();
  try{ var raw=localStorage.getItem(KEY); if(!raw) return ''; var d=JSON.parse(raw); return ((d&&d.settings&&d.settings.syncUrl)||'').trim(); }catch(e){ return ''; }
}
function pad(n){ return (n<10?'0':'')+n; }
function timeStr(iso){ try{ var d=new Date(iso); return pad(d.getHours())+':'+pad(d.getMinutes()); }catch(e){ return ''; } }
function statusText(){
  var u=endpoint();
  if(!u) return 'Sync kapalı — veriler bu cihazda saklanıyor.';
  if(state.status==='saving') return 'Repoya kaydediliyor…';
  if(state.status==='ok') return 'Repoya kaydedildi ✓ '+timeStr(state.last);
  if(state.status==='error') return 'Sync hatası: '+(state.error||'bilinmiyor');
  return 'Sync hazır.';
}
function paint(){ var el=document.getElementById('sey-sync-status'); if(el) el.textContent=statusText(); }
function setStatus(s,err){ state.status=s; if(s==='ok'){ state.last=new Date().toISOString(); state.error=null; } if(s==='error') state.error=err||'bilinmiyor'; paint(); }

function doPush(data){
  var url=endpoint(); if(!url){ setStatus('idle'); return; }
  setStatus('saving');
  var today=(data&&data.lastOpenedDate)|| new Date().toISOString().slice(0,10);
  var body=JSON.stringify({ app:'seyma', date:today, savedAt:new Date().toISOString(), data:data });
  fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:body})
    .then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.text().catch(function(){return '';}); })
    .then(function(){ setStatus('ok'); })
    .catch(function(e){ setStatus('error', String((e&&e.message)||e)); });
}

window.SeySync={
  // debounced: app.js her save() sonrası çağırır
  schedule:function(data){ lastPayload=data; if(!endpoint()){ setStatus('idle'); return; } clearTimeout(timer); setStatus('saving'); timer=setTimeout(function(){ doPush(lastPayload); }, DEBOUNCE); },
  // anında gönder (Ayarlar > "Şimdi gönder")
  pushNow:function(){ clearTimeout(timer); if(lastPayload){ doPush(lastPayload); return; } try{ var raw=localStorage.getItem(KEY); if(raw) doPush(JSON.parse(raw)); }catch(e){} },
  statusText:statusText
};
})();
