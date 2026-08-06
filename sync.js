// sync.js — Şeyma repo senkron katmanı (yalnızca doğrudan GitHub)
// settings.ghToken + ghRepo (+ ghBranch) tanımlıysa, veriyi tarayıcıdan
// doğrudan GitHub Contents API ile repoya yazar. Token YALNIZCA bu cihazın
// localStorage'ında durur; repoya/sayfaya yazılmaz. Tanımlı değilse devre dışı.
(function(){
"use strict";
var KEY='seyma-reset-v1';
// Kullanıcı bir kaydı değiştirdikten sonra uzak repoya ne kadar hızlı
// gönderileceği — panelin "eş zamanlı" hissetmesi için kısaltıldı (eskiden
// 4000ms). Yine de art arda hızlı etkileşimleri (birkaç habit tik'i,
// mood/su/enerji ayarı) TEK push'a topluyor; her tık başına ayrı istek
// atmaz.
var DEBOUNCE=1500;
var RECEIPT_PATH='data/sync-receipt.json';
var PROJECTION_PATH='data/observer-snapshot.json';
var timer=null, lastPayload=null;
var state={status:'idle', last:null, error:null};

var SYNC_STATUS_TEXT={idle:'Bağlı değil',local_saved:'Yerel kayıt bekliyor',queued:'Gönderilmek üzere bekliyor',saving:'Kaydediliyor…',retrying:'Yeniden deneniyor…',accepted:'Uzak kayda alındı',error:'Senkron hatası',offline:'Çevrimdışı',permission:'Yetki gerekli',unauthorized:'Yetki gerekli',forbidden:'Yetki gerekli',not_found:'Repo veya dosya bulunamadı',conflict:'Çakışma bekliyor',anti_clobber:'Veri kaybını önlemek için durduruldu',rate_limited:'Sunucu sınırı; sonra yeniden denenecek',receipt_failed:'Uzak kabul makbuzu alınamadı'};
var SYNC_RECEIPT_STATUSES={idle:1,local_saved:1,queued:1,saving:1,retrying:1,accepted:1,error:1,offline:1,permission:1,conflict:1,anti_clobber:1};
var SYNC_ERROR_CODES={offline:1,unauthorized:1,forbidden:1,not_found:1,conflict:1,anti_clobber:1,validation:1,rate_limited:1,projection_failed:1,media_unavailable:1,network:1,receipt_failed:1,unknown:1};
function emptySyncReceipt(){ return {schemaVersion:1,status:'idle',snapshotRevision:null,sourceUpdatedAt:null,submittedAt:null,acceptedAt:null,sourceLatestSha:null,lastErrorCode:null}; }
function safeReceiptString(v,max){ return typeof v==='string'&&v&&v.length<=(max||160)&&/^[a-f0-9]{7,128}$/i.test(v)?v:null; }
function safeReceiptIso(v){ if(typeof v!=='string'||!v||v.length>40) return null; var t=Date.parse(v); return isNaN(t)?null:new Date(t).toISOString(); }
function normalizeSyncReceipt(r){
  var out=emptySyncReceipt(), x=r&&typeof r==='object'?r:{};
  out.status=SYNC_RECEIPT_STATUSES[x.status]?x.status:'idle';
  out.snapshotRevision=safeReceiptString(x.snapshotRevision,128);
  out.sourceUpdatedAt=safeReceiptIso(x.sourceUpdatedAt);
  out.submittedAt=safeReceiptIso(x.submittedAt);
  out.acceptedAt=safeReceiptIso(x.acceptedAt);
  out.sourceLatestSha=safeReceiptString(x.sourceLatestSha,128);
  out.lastErrorCode=SYNC_ERROR_CODES[x.lastErrorCode]?x.lastErrorCode:null;
  return out;
}
function localReceipt(data,patch){
  var out=normalizeSyncReceipt(data&&data.syncReceipt), p=patch||{};
  Object.keys(p).forEach(function(k){ if(k in out) out[k]=p[k]; });
  out=normalizeSyncReceipt(out);
  if(data&&typeof data==='object') data.syncReceipt=out;
  try{ if(data&&typeof data==='object') localStorage.setItem(KEY,JSON.stringify(data)); }catch(e){}
  try{ if(window.SeyOnSyncState) window.SeyOnSyncState(out); }catch(e){}
  return out;
}
function errorCode(err){
  if(err&&SYNC_ERROR_CODES[err.code]) return err.code;
  var m=String((err&&err.message)||err||'').toLowerCase();
  if(m.indexOf('anti-clobber')>=0||m.indexOf('veri kayb')>=0) return 'anti_clobber';
  if(m.indexOf('offline')>=0||m.indexOf('network')>=0||m.indexOf('failed to fetch')>=0) return 'offline';
  if(m.indexOf('401')>=0||m.indexOf('unauthorized')>=0) return 'unauthorized';
  if(m.indexOf('403')>=0||m.indexOf('yetki')>=0||m.indexOf('forbidden')>=0) return 'forbidden';
  if(m.indexOf('404')>=0||m.indexOf('not found')>=0) return 'not_found';
  if(m.indexOf('409')>=0||m.indexOf('422')>=0||m.indexOf('conflict')>=0) return 'conflict';
  if(m.indexOf('429')>=0||m.indexOf('rate')>=0) return 'rate_limited';
  return 'unknown';
}
function failureStatus(code){
  return (code==='unauthorized'||code==='forbidden'||code==='not_found')?'permission':(SYNC_RECEIPT_STATUSES[code]?code:'error');
}
function writeFailureReceipt(c,pending,code){
  // latest.json'a dokunmadan yalnız whitelist metadata yazar; böylece
  // anti-clobber/conflict panelde görünür, receipt hiçbir ham veri taşımaz.
  if(!c||!pending||code==='receipt_failed') return Promise.resolve();
  var receipt=normalizeSyncReceipt(pending);
  receipt.status=failureStatus(code);
  receipt.lastErrorCode=SYNC_ERROR_CODES[code]?code:'unknown';
  return ghPut(c,RECEIPT_PATH,JSON.stringify(receipt,null,2)).catch(function(){ return null; });
}
// ── PANEL-007: günlük append-only event dosyaları ──────────────────────────
// latest.json full-replace sözleşmesine dokunulmaz. Olaylar ayrıca
// data/events/<YYYY-MM-DD>.json içinde GET+merge+PUT ile birleştirilir;
// aynı eventId tekrar gelirse mevcut satır korunur ve duplicate yazılmaz.
var EVENT_LOG_DIR='data/events', EVENT_LOG_SCHEMA_VERSION=1;
var EVENT_LOG_SECTIONS={wellness:1,mood:1,sleep:1,nutrition:1,content:1,therapy:1,profile:1,notifications:1,location:1,settings:1,quran:1,faith:1,sync:1,system:1,unknown:1};
var EVENT_LOG_OPERATIONS={create:1,update:1,delete:1,complete:1,record:1,accepted:1,retry:1,merge:1,sync_submitted:1};
var EVENT_LOG_SAFE_SUMMARIES={'Kriz desteği kaydı güncellendi':1,'Yansıtma/pratik kaydı güncellendi':1,'İçerik/arşiv kaydı güncellendi':1,'Profil ilerlemesi güncellendi':1,'Bildirim yaşam döngüsü güncellendi':1,'Konum/hareket kaydı güncellendi':1,'İman/okuma kaydı güncellendi':1,'Uyku/beden kaydı güncellendi':1,'Beslenme kaydı güncellendi':1,'Ayarlar güncellendi':1,'Uygulama kaydı güncellendi':1,'Güvenli kayıt özeti':1};
function eventLogSafePart(v,max){ var s=typeof v==='string'?v.trim():''; return s&&s.length<=(max||120)&&/^[a-zA-Z0-9:_./*-]+$/.test(s)?s:null; }
function eventLogSafeIso(v){ return safeReceiptIso(v); }
function eventLogSafeSummary(v){
  var s=String(v||'').replace(/[\r\n\t]+/g,' ').trim().slice(0,120);
  if(!s||!EVENT_LOG_SAFE_SUMMARIES[s]||/ghp_|github_pat_|sk-[a-z0-9_-]{8,}/i.test(s)||/\b(?:lat|lon|latitude|longitude)\s*[:=]/i.test(s)) return 'Güvenli kayıt özeti';
  return s;
}
function normalizeSyncEvent(e,fallbackDevice){
  if(!e||typeof e!=='object'||Array.isArray(e)) return null;
  var seq=Number(e.sequence), id=eventLogSafePart(e.eventId,180), occurred=eventLogSafeIso(e.occurredAt);
  if(!id||!isFinite(seq)||seq<1||Math.floor(seq)!==seq||!occurred) return null;
  var device=eventLogSafePart(e.sourceDeviceId||fallbackDevice,96); if(!device) return null;
  return {eventId:id,correlationId:eventLogSafePart(e.correlationId,180)||id,sequence:seq,occurredAt:occurred,persistedAt:eventLogSafeIso(e.persistedAt)||occurred,submittedAt:eventLogSafeIso(e.submittedAt),acceptedAt:eventLogSafeIso(e.acceptedAt),section:EVENT_LOG_SECTIONS[e.section]?e.section:'unknown',path:eventLogSafePart(e.path,160)||'data',operation:EVENT_LOG_OPERATIONS[e.operation]?e.operation:'update',summary:eventLogSafeSummary(e.summary),source:eventLogSafePart(e.source,40)||'app',sourceDeviceId:device,privacyClass:eventLogSafePart(e.privacyClass,40)||'summary',snapshotRevision:safeReceiptString(e.snapshotRevision,128)};
}
function emptyEventFile(date){ return {schemaVersion:EVENT_LOG_SCHEMA_VERSION,date:date,events:[]}; }
function parseEventFile(raw,date){
  var x=raw;
  try{ if(typeof x==='string') x=JSON.parse(x); }catch(e){ return emptyEventFile(date); }
  var out=emptyEventFile(date), seen={};
  var arr=Array.isArray(x)?x:(x&&Array.isArray(x.events)?x.events:[]);
  arr.forEach(function(e){ var n=normalizeSyncEvent(e,e&&e.sourceDeviceId); if(n&&!seen[n.eventId]){seen[n.eventId]=true;out.events.push(n);} });
  out.events.sort(function(a,b){ return String(a.occurredAt).localeCompare(String(b.occurredAt))||a.sequence-b.sequence||String(a.eventId).localeCompare(String(b.eventId)); });
  return out;
}
function mergeEventFile(current,incoming,date){
  var out=parseEventFile(current,date), seen={}; out.events.forEach(function(e){seen[e.eventId]=true;});
  parseEventFile(incoming,date).events.forEach(function(e){ if(!seen[e.eventId]){seen[e.eventId]=true;out.events.push(e);} });
  out.events.sort(function(a,b){ return String(a.occurredAt).localeCompare(String(b.occurredAt))||a.sequence-b.sequence||String(a.eventId).localeCompare(String(b.eventId)); });
  return out;
}
function eventLogDate(iso){ var s=eventLogSafeIso(iso); return s?s.slice(0,10):null; }
function eventLogForPush(data,receipt){
  var l=data&&data.eventLog, groups={}; if(!l||!Array.isArray(l.events)) return groups;
  var published=l.published&&typeof l.published==='object'?l.published:{};
  l.events.forEach(function(raw){
    var e=normalizeSyncEvent(raw,raw&&raw.sourceDeviceId); if(!e||published[e.eventId]) return;
    var day=eventLogDate(e.occurredAt); if(!day) return;
    // Local event is written only after the snapshot has been accepted, so the
    // canonical daily record carries the complete receipt tuple in one row.
    e.submittedAt=e.submittedAt||eventLogSafeIso(receipt&&receipt.submittedAt);
    e.acceptedAt=eventLogSafeIso(receipt&&receipt.acceptedAt);
    e.snapshotRevision=safeReceiptString(receipt&&receipt.snapshotRevision,128);
    (groups[day]||(groups[day]=[])).push(e);
  });
  return groups;
}
function putEventLogDayGuarded(c,date,events,attempt){
  attempt=attempt||0;
  var path=EVENT_LOG_DIR+'/'+date+'.json', api='https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+path, H=ghHeaders(c);
  return fetch(api+'?ref='+encodeURIComponent(c.branch)+'&t='+Date.now(),{headers:H})
    .then(function(r){ if(r.status===200) return r.json(); if(r.status===404) return null; var e=new Error(String(r.status)); e.code=r.status===401?'unauthorized':r.status===403?'forbidden':'unknown'; throw e; })
    .then(function(g){
      var sha=g&&g.sha, current=g&&g.content?parseEventFile(b64decodeUtf8(g.content),date):emptyEventFile(date), merged=mergeEventFile(current,{date:date,events:events},date), contentStr=JSON.stringify(merged,null,2), body={message:'sync: '+path,content:b64(contentStr),branch:c.branch};
      if(sha) body.sha=sha;
      var H2={}; for(var k in H) H2[k]=H[k]; H2['Content-Type']='application/json';
      return fetch(api,{method:'PUT',headers:H2,body:JSON.stringify(body)}).then(function(r){
        if(r.ok) return r.json().catch(function(){return {};});
        return r.text().then(function(t){ if((r.status===409||r.status===422)&&attempt<3) return putEventLogDayGuarded(c,date,events,attempt+1); var e=new Error(r.status+' '+t.slice(0,160)); e.code=(r.status===401?'unauthorized':r.status===403?'forbidden':(r.status===409||r.status===422)?'conflict':r.status===429?'rate_limited':'unknown'); throw e; });
      });
    });
}
function pushEventLog(c,data,receipt){
  var groups=eventLogForPush(data,receipt), days=Object.keys(groups), l=data&&data.eventLog;
  if(!days.length) return Promise.resolve();
  return Promise.all(days.map(function(day){ return putEventLogDayGuarded(c,day,groups[day]).then(function(){ if(l){ l.published=l.published&&typeof l.published==='object'?l.published:{}; groups[day].forEach(function(e){l.published[e.eventId]=true;}); } }); }));
}
function mergeEventLog(localLog,remoteLog){
  var local=localLog&&typeof localLog==='object'?localLog:{}, remote=remoteLog&&typeof remoteLog==='object'?remoteLog:{};
  var out=JSON.parse(JSON.stringify(local)), seen={}, source=out.sourceDeviceId||remote.sourceDeviceId||'dev_unknown', events=[];
  (Array.isArray(local.events)?local.events:[]).concat(Array.isArray(remote.events)?remote.events:[]).forEach(function(e){ var n=normalizeSyncEvent(e,e&&e.sourceDeviceId); if(n&&!seen[n.eventId]){seen[n.eventId]=true;events.push(n);} });
  events.sort(function(a,b){ return String(a.occurredAt).localeCompare(String(b.occurredAt))||a.sequence-b.sequence||String(a.eventId).localeCompare(String(b.eventId)); });
  out.schemaVersion=EVENT_LOG_SCHEMA_VERSION; out.sourceDeviceId=source; out.events=events.slice(-200); out.nextSequence=Math.max(1,Number(local.nextSequence)||1,Number(remote.nextSequence)||1);
  if(!out.days||typeof out.days!=='object'||Array.isArray(out.days)) out.days={}; Object.keys((remote&&remote.days)||{}).forEach(function(k){out.days[k]=true;});
  out.published=local.published&&typeof local.published==='object'?local.published:{};
  return out;
}

function settings(){
  if(lastPayload && lastPayload.settings) return lastPayload.settings;
  try{ var raw=localStorage.getItem(KEY); if(raw){ var d=JSON.parse(raw); return d&&d.settings||{}; } }catch(e){}
  return {};
}
function cfg(){
  var s=settings();
  var tok=(s.ghToken||'').trim(), repo=(s.ghRepo||'').trim();
  if(tok && repo.indexOf('/')>0){
    var p=repo.split('/');
    if(p.length!==2 || !p[0].trim() || !p[1].trim()) return null;
    return {token:tok, owner:p[0].trim(), repo:p[1].trim(), branch:(s.ghBranch||'main').trim()||'main'};
  }
  return null;
}
// ── VERİ GÜVENLİĞİ / DATA-SAFETY GUARDS ─────────────────────────────────────
// SORUN (2026-07-10): Uygulama yerel bir sunucudan (localhost) tarayıcıda
// açıldığında, o tarayıcının BAYAT/eksik localStorage durumu (hâlâ geçerli
// ghToken ile) otomatik push edildi ve data/latest.json'ı ezdi: 17 günlük
// gerçek veri, 3 günlük boş iskeletle değişti. Aşağıdaki iki guard bunu önler.
// Bilinçli kaçış kapısı: localStorage.setItem('seyma-sync-force','1') ya da ?forceSync=1
function devOrigin(){
  try{
    if(typeof location==='undefined') return false;
    if(location.protocol==='file:') return true;
    var h=(location.hostname||'').toLowerCase();
    return h==='localhost'||h==='127.0.0.1'||h==='0.0.0.0'||h==='::1'||/\.local$/.test(h);
  }catch(e){ return false; }
}
function syncForced(){
  try{
    if(localStorage.getItem('seyma-sync-force')==='1') return true;
    if(typeof location!=='undefined' && /[?&]forceSync=1/.test(location.search||'')) return true;
  }catch(e){}
  return false;
}
function dayCount(obj){ try{ return (obj&&obj.days&&typeof obj.days==='object') ? Object.keys(obj.days).length : 0; }catch(e){ return 0; } }
function b64decodeUtf8(s){ try{ var bin=atob(String(s).replace(/\s+/g,'')); var by=new Uint8Array(bin.length); for(var i=0;i<bin.length;i++) by[i]=bin.charCodeAt(i); return new TextDecoder().decode(by); }catch(e){ return ''; } }
function pad(n){ return (n<10?'0':'')+n; }
function timeStr(iso){ try{ var d=new Date(iso); return pad(d.getHours())+':'+pad(d.getMinutes()); }catch(e){ return ''; } }
function statusText(){
  var c=cfg();
  if(!c) return 'Bağlı değil';
  if(state.status==='saving') return 'Kaydediliyor…';
  if(state.status==='ok') return 'Uzak kayda alındı ✓ '+timeStr(state.last);
  if(state.status==='error') return SYNC_STATUS_TEXT[state.error]||'Senkron hatası';
  return 'Bağlantı hazır';
}
function paint(){ var el=document.getElementById('sey-sync-status'); if(el) el.textContent=statusText(); }
function setStatus(s,err){ state.status=s; if(s==='ok'){ state.last=new Date().toISOString(); state.error=null; } if(s==='error') state.error=SYNC_ERROR_CODES[err]?err:'unknown'; paint(); }

// unicode-safe base64 (büyük JSON için döngülü)
function b64(str){ var bytes=new TextEncoder().encode(str); var bin=''; for(var i=0;i<bytes.length;i++) bin+=String.fromCharCode(bytes[i]); return btoa(bin); }

function ghHeaders(c){ return {'Authorization':'Bearer '+c.token,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'}; }
function ghPut(c, path, contentStr, attempt){
  attempt=attempt||0;
  var api='https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+path;
  var H=ghHeaders(c);
  return fetch(api+'?ref='+encodeURIComponent(c.branch),{headers:H})
    .then(function(r){ if(r.status===200) return r.json().then(function(g){ return g.sha; }); return null; })
    .then(function(sha){ var body={message:'sync: '+path, content:b64(contentStr), branch:c.branch}; if(sha) body.sha=sha;
      var H2={}; for(var k in H) H2[k]=H[k]; H2['Content-Type']='application/json';
      return fetch(api,{method:'PUT',headers:H2,body:JSON.stringify(body)}); })
    .then(function(r){
      if(r.ok) return r.json().catch(function(){ return {}; });
      return r.text().then(function(t){
        if((r.status===409||r.status===422) && attempt<3) return ghPut(c,path,contentStr,attempt+1);
        var e=new Error(r.status+' '+t.slice(0,160)); e.code=(r.status===401?'unauthorized':r.status===403?'forbidden':(r.status===409||r.status===422)?'conflict':r.status===429?'rate_limited':'unknown'); throw e;
      });
    });
}
function isMissingRefError(err){
  var m=String((err&&err.message)||err||'').toLowerCase();
  return m.indexOf('no commit found for the ref')>=0 || m.indexOf('invalid request')>=0 || m.indexOf('reference does not exist')>=0 || m.indexOf('couldn\'t find remote ref')>=0;
}
function persistBranch(branch){
  try{
    var raw=localStorage.getItem(KEY); if(!raw) return;
    var d=JSON.parse(raw); if(!d||!d.settings) return;
    d.settings.ghBranch=branch;
    localStorage.setItem(KEY,JSON.stringify(d));
  }catch(e){}
}
// GUARD 2 — ANTI-CLOBBER: uzak latest.json'dan daha AZ güne düşecek push'u engelle.
// Günler yalnızca birikir; local<remote ise bu bir veri kaybı/ezme demektir.
function putLatestGuarded(c, latestStr, localData){
  var base='https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/data/latest.json';
  var H=ghHeaders(c);
  return fetch(base+'?ref='+encodeURIComponent(c.branch)+'&t='+Date.now(),{headers:H})
    .then(function(r){ if(r.status===200) return r.json(); return null; })
    .then(function(g){
      var sha=(g&&g.sha)||null, remoteDays=0, remoteObj=null;
      if(g&&g.content){ try{ remoteObj=JSON.parse(b64decodeUtf8(g.content)); }catch(e){} }
      try{ remoteDays=dayCount(remoteObj); }catch(e){}
      // CONFLICT-SAFE SYNC: önce uzak veriyi yerel ile birleştir; bu sayede bayat/eksik
      // bir cihaz açıldığında uzaktaki yeni günler kaybolmaz. Anti-clobber kontrolü
      // birleştirme sonrası çalışır: eğer merge local günlük sayısını remote kadar
      // tamamlayamadıysa, gerçek veri kaybı riski vardır ve push iptal edilir.
      if(remoteObj && localData){
        var mergedData=mergeData(localData, remoteObj);
        Object.keys(mergedData).forEach(function(k){ localData[k]=mergedData[k]; });
      }
      if(remoteObj && remoteObj.profileAssessment && localData && localData.profileAssessment){
        mergeProfileAssessment(localData.profileAssessment, remoteObj.profileAssessment);
        if(typeof window.SeySync.onProfileMerge==='function'){
          try{ window.SeySync.onProfileMerge(localData.profileAssessment); }catch(e){}
        }
      }
      latestStr=JSON.stringify(sanitize(localData),null,2);
      var localDays=dayCount(localData);
      if(remoteDays>0 && localDays<remoteDays && !syncForced()){
        try{ console.error('[SeySync] ANTI-CLOBBER: yerel '+localDays+' gün < uzak '+remoteDays+' gün. Veri kaybını önlemek için push İPTAL edildi. Bilinçli üzerine yazmak için: localStorage.setItem("seyma-sync-force","1")'); }catch(e){}
        setStatus('error','anti_clobber');
        var ac=new Error('anti-clobber: local '+localDays+' < remote '+remoteDays+' days'); ac.code='anti_clobber'; throw ac;
      }
      var body={message:'sync: data/latest.json', content:b64(latestStr), branch:c.branch}; if(sha) body.sha=sha;
      var H2={}; for(var k in H) H2[k]=H[k]; H2['Content-Type']='application/json';
      return fetch(base,{method:'PUT',headers:H2,body:JSON.stringify(body)}).then(function(r){
        if(r.ok) return r.json().catch(function(){ return {}; });
        return r.text().then(function(t){ var e=new Error(r.status+' '+t.slice(0,160)); e.code=(r.status===401?'unauthorized':r.status===403?'forbidden':(r.status===409||r.status===422)?'conflict':r.status===429?'rate_limited':'unknown'); throw e; });
      });
    });
}
function pushWithCfg(c, data, pendingReceipt){
  var today=(data&&data.lastOpenedDate)|| new Date().toISOString().slice(0,10);
  var latest=JSON.stringify(data,null,2);
  var nowIso=new Date().toISOString();
  var safeForFiles=sanitize(data);
  var snap=JSON.stringify({app:'seyma',date:today,savedAt:nowIso,data:safeForFiles},null,2);
  var pending=normalizeSyncReceipt(pendingReceipt||data.syncReceipt);
  if(!pending.sourceUpdatedAt) pending.sourceUpdatedAt=safeReceiptIso(data&&data.savedAt)||nowIso;
  if(!pending.submittedAt) pending.submittedAt=nowIso;
  // Her push öncesinde zaman damgalı yedek: bir şey ters giderse geri dönülebilir.
  var backup=JSON.stringify({app:'seyma',type:'pre-push-backup',savedAt:nowIso,data:data},null,2);
  return ghPut(c,'data/backups/'+nowIso.replace(/[:.]/g,'-')+'.json',backup)
    .catch(function(){})
    .then(function(){ return putLatestGuarded(c,latest,data); })
    .then(function(latestResult){
      var receipt=normalizeSyncReceipt(pending);
      receipt.status='accepted'; receipt.acceptedAt=new Date().toISOString(); receipt.lastErrorCode=null;
      receipt.sourceLatestSha=safeReceiptString(latestResult&&latestResult.content&&latestResult.content.sha,128);
      receipt.snapshotRevision=safeReceiptString((latestResult&&latestResult.commit&&latestResult.commit.sha)||(latestResult&&latestResult.content&&latestResult.content.sha),128);
      if(!receipt.sourceLatestSha||!receipt.snapshotRevision){ var re=new Error('sync receipt missing revision'); re.code='receipt_failed'; throw re; }
      return ghPut(c,RECEIPT_PATH,JSON.stringify(receipt,null,2)).then(function(){
        // Observer projection ayrı bir read-model dosyasıdır. latest.json'ın
        // full-replace/anti-clobber zincirine eklenmez; üretilemezse push
        // başarı iddiası vermez ve güvenli failure receipt yazılır.
        var P=window.PanelCoverageV1;
        if(!P||typeof P.buildObserverSnapshot!=='function'){
          var pe=new Error('observer projection unavailable'); pe.code='projection_failed'; throw pe;
        }
        var projection=P.buildObserverSnapshot(safeForFiles,receipt);
        return ghPut(c,PROJECTION_PATH,JSON.stringify(projection,null,2)).then(function(){ return receipt; });
      });
    })
    .then(function(receipt){
      return ghPut(c,'data/gunluk/'+today+'.json',snap).then(function(){
        // Event dosyası ayrı ve best-effort'tur: event yazımı kaybolsa bile
        // accepted latest snapshot bozulmaz; bir sonraki sync aynı eventId'yi
        // idempotent merge ile yeniden dener.
        return pushEventLog(c,data,receipt).catch(function(){ return null; }).then(function(){ return receipt; });
      });
    });
}

// ── Faz 10: profileAssessment çakışma çözümü (conflict resolution) ──────────────
// Saf fonksiyon: yerel profileAssessment'i uzak ile itemId bazında birleştirir.
// Veri kaybı üretmez — tamamlanmış cevaplar korunur, daha yüksek cevap kapsamı
// kazanır, iki cihaz cevapları itemId bazında birleştirilir. Completion monotonik
// (completed geriye düşmez). Consent geriye dönük otomatik açılmaz. Bilinmeyen
// alanlar silinmez. Yalnızca senkronize edilecek alanlar (Faz 10 listesi) merge edilir.
//
// Kurallar (prompt'tan birebir):
//   - Yanıt bazında en son geçerli answeredAt kazanır.
//   - Eşit answeredAt'te daha yüksek revisionCount kazanır.
//   - completion monotonik: completed → completed kalır, asla geriye düşmez.
//   - consent geriye dönük otomatik açılmaz: yalnızca her iki tarafta açıkça true
//     ise true kalır; yerel false + uzak true → false (kullanıcı geri çekmiş).
//     panelSummarySharingAccepted: yalnızca açık kullanıcı tercihinden gelir.
//   - bilinmeyen alanlar (pa objesindeki listede olmayan anahtarlar) silinmez.
//
// localPA yerinde (in-place) değiştirilir ve döndürülür. remotePA değiştirilmez.
function isCompleted(pa){ return !!(pa && pa.status==='completed'); }
function responseCoverage(pa){
  if(!pa||!pa.responses||typeof pa.responses!=='object') return 0;
  return Object.keys(pa.responses).length;
}
function mergeResponse(localR, remoteR){
  if(!remoteR||typeof remoteR!=='object') return localR;
  if(!localR||typeof localR!=='object') return remoteR;
  var localTs=localR.answeredAt, remoteTs=remoteR.answeredAt;
  if(!localTs) return remoteR;
  if(!remoteTs) return localR;
  if(remoteTs>localTs) return remoteR;
  if(localTs>remoteTs) return localR;
  // eşit timestamp — daha yüksek revisionCount kazanır
  var lRev=localR.revisionCount||0, rRev=remoteR.revisionCount||0;
  if(rRev>lRev) return remoteR;
  return localR;
}
function mergeConsent(localC, remoteC){
  if(!localC||typeof localC!=='object') localC={};
  if(!remoteC||typeof remoteC!=='object') return localC;
  var merged={};
  var keys={};
  Object.keys(localC).forEach(function(k){ keys[k]=true; });
  Object.keys(remoteC).forEach(function(k){ keys[k]=true; });
  Object.keys(keys).forEach(function(k){
    var lv=localC[k], rv=remoteC[k];
    if(k==='panelSummarySharingAccepted'){
      // Yalnızca açık kullanıcı tercihi — otomatik açma yok. Her iki taraf true ise true,
      // aksi halde false (bir taraf geri çekmiş sayılır).
      merged[k]=!!(lv===true && rv===true);
    } else if(k==='profileProcessingAccepted'||k==='sensitiveDataAccepted'){
      // Once true, always true — consent geriye dönük açılmaz/kapanmaz.
      merged[k]=!!(lv===true||rv===true);
    } else if(typeof lv==='string'||typeof rv==='string'){
      // timestampler (version, informationShownAt, acceptedAt): en son olanı al
      var ls=typeof lv==='string'?lv:'', rs=typeof rv==='string'?rv:'';
      merged[k]=(rs>ls)?rv:lv;
    } else {
      merged[k]=(lv!=null)?lv:rv;
    }
  });
  return merged;
}
function mergeProfileAssessment(localPA, remotePA){
  if(!localPA||typeof localPA!=='object') return localPA;
  if(!remotePA||typeof remotePA!=='object') return localPA;
  // Bilinmeyen alanları koru — yalnızca bilinen senkronize alanları merge et.
  // 1) status + completion: monotonik
  var localDone=isCompleted(localPA), remoteDone=isCompleted(remotePA);
  if(remoteDone && !localDone){
    localPA.status='completed';
    if(!localPA.completedAt && remotePA.completedAt) localPA.completedAt=remotePA.completedAt;
  } else if(remoteDone && localDone){
    // tamamlanmış + tamamlanmış — daha son completedAt kazanır
    if(remotePA.completedAt && (!localPA.completedAt || remotePA.completedAt>localPA.completedAt)){
      localPA.completedAt=remotePA.completedAt;
    }
  }
  // 2) timestamps: en son olanı al (startedAt ilk, completedAt yukarıda)
  if(remotePA.startedAt && (!localPA.startedAt || remotePA.startedAt<localPA.startedAt)){
    localPA.startedAt=remotePA.startedAt; // en erken başlangıç
  }
  // 3) deliveryMode: tek oturum (değişmez)
  if(remotePA.deliveryMode==='single_session' && localPA.deliveryMode!=='single_session'){
    localPA.deliveryMode='single_session';
  }
  // 4) currentItemIndex: daha yüksek cevap kapsamı kazanır (aşağıda responses sonra)
  // 5) consent: merge (geriye dönük açma yok)
  localPA.consent=mergeConsent(localPA.consent||{}, remotePA.consent||{});
  // 6) responses: itemId bazında birleştir
  var lr=localPA.responses||{}, rr=remotePA.responses||{};
  var merged={};
  var itemIds={};
  Object.keys(lr).forEach(function(k){ itemIds[k]=true; });
  Object.keys(rr).forEach(function(k){ itemIds[k]=true; });
  Object.keys(itemIds).forEach(function(id){
    var l=lr[id], r=rr[id];
    merged[id]=mergeResponse(l, r);
  });
  localPA.responses=merged;
  // 7) currentItemIndex: daha yüksek kapsamdan hesapla
  var localCov=responseCoverage({responses:lr}), mergedCov=Object.keys(merged).length;
  if(mergedCov>localCov || typeof localPA.currentItemIndex!=='number'){
    // yerel daha gerideyse uzak ileriyi al; yerel ilerdeyse koru
    if(typeof remotePA.currentItemIndex==='number' && remotePA.currentItemIndex>localPA.currentItemIndex){
      localPA.currentItemIndex=remotePA.currentItemIndex;
    }
  }
  // 8) moduleProgress: birleştir (breakAcknowledged true ise true kalır)
  var lp=localPA.moduleProgress||{}, rp=remotePA.moduleProgress||{};
  var mpKeys={};
  Object.keys(lp).forEach(function(k){ mpKeys[k]=true; });
  Object.keys(rp).forEach(function(k){ mpKeys[k]=true; });
  var mergedMP={};
  Object.keys(mpKeys).forEach(function(k){
    var l=lp[k]||{}, r=rp[k]||{};
    var mk={};
    Object.keys(l).forEach(function(f){ mk[f]=l[f]; });
    Object.keys(r).forEach(function(f){
      if(f==='breakAcknowledged'){ mk[f]=!!(l[f]||r[f]); }
      else if(f==='breakAcknowledgedAt'){ mk[f]=(r[f]&&(!l[f]||r[f]>l[f]))?r[f]:(l[f]||null); }
      else { mk[f]=(mk[f]!=null)?mk[f]:r[f]; }
    });
    mergedMP[k]=mk;
  });
  localPA.moduleProgress=mergedMP;
  // 9) scores/quality/report/panelSummary: completed ise en yüksek (en son)
  // üretilen kalır. Yerel completed ve yerel üretildiyse yereli koru; aksi halde
  // uzak completed varsa uzaktan al.
  if(remoteDone){
    if(remotePA.scores && Object.keys(remotePA.scores).length && (!localPA.scores || !Object.keys(localPA.scores).length)){
      localPA.scores=remotePA.scores;
    }
    if(remotePA.quality && Object.keys(remotePA.quality).length && (!localPA.quality || !Object.keys(localPA.quality).length)){
      localPA.quality=remotePA.quality;
    }
    if(remotePA.report && Object.keys(remotePA.report).length && (!localPA.report || !Object.keys(localPA.report).length)){
      localPA.report=remotePA.report;
    }
    if(remotePA.panelSummary && Object.keys(remotePA.panelSummary).length && (!localPA.panelSummary || !Object.keys(localPA.panelSummary).length)){
      localPA.panelSummary=remotePA.panelSummary;
    }
  }
  return localPA;
}

// ── GENEL VERİ BİRLEŞTİRME (conflict-safe sync) ─────────────────────────────────
// Problem: sync.js eskiden uzak latest.json'u tamamen yerel veriyle eziyordu.
// Çözüm: her push öncesinde uzak latest.json çekilir, yerel ile zaman damgasına
// göre birleştirilir, SONRA yazılır. Böylece bayat bir cihaz açılsa bile uzaktaki
// yeni günler/veriler kaybolmaz; iki uç birleşir.
//
// Kurallar:
//   - settings: yerel ayarlar esas; uzaktaki yalnızca yerelde olmayan anahtarları
//     ekler. Token/OpenAI key gibi hassas alanlar asla uzaktan alınmaz.
//   - data.days[date]: her gün için alanlar kendi updatedAt/ts/savedAt zamanına
//     göre seçilir; yalnızca bir tarafta varsa o alınır.
//   - notifications / aeon.messages: id bazında birleştirilir; read/seen/synced
//     bayrakları OR'lanır (bir tarafta okunduysa okunmuş sayılır).
//   - savedAt: en yeni değer korunur.
//   - profileAssessment: zaten mergeProfileAssessment ile ayrıca ele alınır.
function mergeById(localArr, remoteArr, keyField){
  if(!Array.isArray(localArr)) localArr=[];
  if(!Array.isArray(remoteArr)) remoteArr=[];
  var map={};
  localArr.forEach(function(x){ if(x && x[keyField]) map[x[keyField]]=JSON.parse(JSON.stringify(x)); });
  remoteArr.forEach(function(x){
    if(!x || !x[keyField]) return;
    var id=x[keyField];
    if(!map[id]){ map[id]=JSON.parse(JSON.stringify(x)); return; }
    var existing=map[id];
    // ZP-06 düzeltmesi: "uzak daha yeni mi" kararı kaydın ORİJİNAL (henüz hiçbir
    // alanı ezilmemiş) zaman damgalarından TEK SEFER hesaplanır ve tüm alanlara
    // aynı şekilde uygulanır. Önceden bu hesap her alan için existing[...] okuyarak
    // döngü İÇİNDE yapılıyordu; `updatedAt` alanının kendisi diğer alanlardan önce
    // işlenirse (ör. presetlerde updatedAt, archived'dan önce gelir) existing.updatedAt
    // döngü ortasında ezilip sonraki alanların kararını bozabiliyordu (alan sırasına
    // bağlı, kaçırılan güncelleme riski).
    var localTs=existing.ts || existing.receivedAt || existing.updatedAt || existing.savedAt;
    var remoteTs=x.ts || x.receivedAt || x.updatedAt || x.savedAt;
    var remoteNewer=typeof remoteTs==='string' && typeof localTs==='string' && remoteTs>localTs;
    Object.keys(x).forEach(function(k){
      if(!(k in existing)){ existing[k]=x[k]; return; }
      if(k==='read' || k==='seen' || k==='synced' || k==='deleted'){
        existing[k]=!!(existing[k] || x[k]);
        return;
      }
      if(remoteNewer){ existing[k]=x[k]; }
    });
  });
  return Object.keys(map).map(function(k){ return map[k]; });
}
function fieldTimestamp(v){
  if(!v || typeof v!=='object') return null;
  return v.updatedAt || v.ts || v.savedAt || v.receivedAt || v.createdAt || v.completedAt || null;
}
function mergeDay(localDay, remoteDay){
  if(!remoteDay || typeof remoteDay!=='object') return localDay || {};
  if(!localDay || typeof localDay!=='object') return JSON.parse(JSON.stringify(remoteDay));
  var merged=JSON.parse(JSON.stringify(localDay));
  // Gün seviyesinde zaman damgası; alanların kendi zamanı yoksa bunu kullan.
  var dayLocalTs=merged.updatedAt || merged.ts || merged.savedAt || merged.receivedAt || merged.createdAt || null;
  var dayRemoteTs=remoteDay.updatedAt || remoteDay.ts || remoteDay.savedAt || remoteDay.receivedAt || remoteDay.createdAt || null;
  Object.keys(remoteDay).forEach(function(k){
    if(!(k in merged)){ merged[k]=remoteDay[k]; return; }
    var localTs=fieldTimestamp(merged[k]), remoteTs=fieldTimestamp(remoteDay[k]);
    if(typeof localTs!=='string') localTs=dayLocalTs;
    if(typeof remoteTs!=='string') remoteTs=dayRemoteTs;
    if(typeof remoteTs==='string' && typeof localTs==='string' && remoteTs>localTs){ merged[k]=remoteDay[k]; }
    // eşit veya local daha yeni ise local kalır
  });
  return merged;
}
function mergeSettings(localS, remoteS){
  if(!remoteS || typeof remoteS!=='object') return localS || {};
  if(!localS || typeof localS!=='object') return JSON.parse(JSON.stringify(remoteS));
  var merged=JSON.parse(JSON.stringify(localS));
  // Uzaktan asla alınmayacak cihaza özel alanlar
  var localOnlyKeys={ghToken:true, openaiKey:true, syncUrl:true, auth:true, pin:true};
  Object.keys(remoteS).forEach(function(k){
    if(localOnlyKeys[k]) return; // local'deki değer korunur
    if(!(k in merged)) merged[k]=remoteS[k];
  });
  return merged;
}
// Zikirmatik v2: sayaçlar monotoniktir. İki cihazın aynı yolculuğunu
// birleştirirken daha yüksek sayım/tur/hatim korunur; hatim kimlikleri union
// edilir. Böylece bayat bir cihaz aktif adı veya lifetime sayısını geriye
// çekemez. Olay günlüğü tutulmadığından aynı tabandan eşzamanlı iki artışı
// toplamak çift sayım riski doğurur; bu nedenle güvenli kural max'tır.
function mergeZikr(localZ, remoteZ){
  if(!remoteZ || typeof remoteZ!=='object') return localZ || {};
  if(!localZ || typeof localZ!=='object') return JSON.parse(JSON.stringify(remoteZ));
  var out=JSON.parse(JSON.stringify(localZ));
  function num(v){ v=Number(v); return isFinite(v)&&v>0?Math.floor(v):0; }
  function later(a,b){ return (typeof b==='string'&&(!a||b>a))?b:a; }
  out.schemaVersion=Math.max(num(out.schemaVersion),num(remoteZ.schemaVersion));
  if(!out.migrationVersion&&remoteZ.migrationVersion) out.migrationVersion=remoteZ.migrationVersion;
  // ZP-06: editorialVersion (ZP-04'te eklendi) — schemaVersion ile aynı
  // monotonik mantık: içerik sürümü yalnız ileri gider, geri düşmez.
  out.editorialVersion=Math.max(num(out.editorialVersion),num(remoteZ.editorialVersion));
  out.presets=mergeById(Array.isArray(out.presets)?out.presets:[],Array.isArray(remoteZ.presets)?remoteZ.presets:[],'id');
  // Zikir tefekkürleri sabit gün+preset kimliği taşır. Aynı kayıt iki cihazda
  // düzenlenirse mergeById updatedAt üzerinden en yeni metni korur; farklı
  // günler ve farklı zikirler union olarak eksiksiz kalır.
  out.reflections=mergeById(Array.isArray(out.reflections)?out.reflections:[],Array.isArray(remoteZ.reflections)?remoteZ.reflections:[],'id');
  out.settings=mergeSettings(out.settings||{},remoteZ.settings||{});
  out.sessions=out.sessions&&typeof out.sessions==='object'?out.sessions:{};
  if(remoteZ.sessions&&typeof remoteZ.sessions==='object') Object.keys(remoteZ.sessions).forEach(function(date){
    var l=out.sessions[date], r=remoteZ.sessions[date];
    if(!l||typeof l!=='object'){ out.sessions[date]=JSON.parse(JSON.stringify(r)); return; }
    var m=JSON.parse(JSON.stringify(l)), lp=l.perPreset||{}, rp=r&&r.perPreset||{}, per={}, sum=0, sets=0;
    var ids={}; Object.keys(lp).forEach(function(k){ids[k]=1;}); Object.keys(rp).forEach(function(k){ids[k]=1;});
    Object.keys(ids).forEach(function(pid){
      var a=lp[pid], b=rp[pid], ao=a&&typeof a==='object'?a:{count:a}, bo=b&&typeof b==='object'?b:{count:b};
      var rec={count:Math.max(num(ao&&ao.count),num(bo&&bo.count)),completedCycles:Math.max(num(ao&&ao.completedCycles),num(bo&&bo.completedCycles)),lastAt:later(ao&&ao.lastAt,bo&&bo.lastAt)||null};
      per[pid]=rec; sum+=rec.count; sets+=rec.completedCycles;
    });
    m.perPreset=per; m.totalCount=Math.max(num(l.totalCount),num(r&&r.totalCount),sum); m.completedSets=Math.max(num(l.completedSets),num(r&&r.completedSets),sets); m.lastAt=later(l.lastAt,r&&r.lastAt)||null;
    out.sessions[date]=m;
  });
  out.journeys=out.journeys&&typeof out.journeys==='object'?out.journeys:{};
  if(remoteZ.journeys&&typeof remoteZ.journeys==='object') Object.keys(remoteZ.journeys).forEach(function(pid){
    var l=out.journeys[pid], r=remoteZ.journeys[pid];
    if(!l||typeof l!=='object'){ out.journeys[pid]=JSON.parse(JSON.stringify(r)); return; }
    var m=JSON.parse(JSON.stringify(l)), lh=Array.isArray(l.hatims)?l.hatims:[], rh=Array.isArray(r.hatims)?r.hatims:[], map={};
    lh.forEach(function(h){ if(h&&h.id) map[h.id]=JSON.parse(JSON.stringify(h)); });
    rh.forEach(function(h){
      if(!h||!h.id) return;
      if(!map[h.id]){ map[h.id]=JSON.parse(JSON.stringify(h)); return; }
      var x=map[h.id]; x.count=Math.max(num(x.count),num(h.count)); x.baseTarget=Math.max(num(x.baseTarget),num(h.baseTarget)); x.target=Math.max(num(x.target),num(h.target));
      if(x.status==='completed'||h.status==='completed'){ x.status='completed'; x.completedAt=later(x.completedAt,h.completedAt)||x.completedAt||h.completedAt||null; }
      else if((h.lastAt||h.startedAt||'')>(x.lastAt||x.startedAt||'')){ x.status=h.status||x.status; }
      x.lastAt=later(x.lastAt,h.lastAt)||x.lastAt||h.lastAt||null;
    });
    m.hatims=Object.keys(map).map(function(k){return map[k];});
    m.lifetimeCount=Math.max(num(l.lifetimeCount),num(r.lifetimeCount));
    var actualDone=m.hatims.filter(function(h){return h&&h.status==='completed';}).length;
    m.completedHatims=Math.max(num(l.completedHatims),num(r.completedHatims),actualDone);
    m.legacyCompletedHatims=Math.max(num(l.legacyCompletedHatims),num(r.legacyCompletedHatims));
    m.lastAt=later(l.lastAt,r.lastAt)||'';
    if((r.lastAt||'')>(l.lastAt||'')) m.activeHatimId=r.activeHatimId||m.activeHatimId;
    out.journeys[pid]=m;
  });
  out.streak=Math.max(num(out.streak),num(remoteZ.streak));
  if((remoteZ.streakDate||'')>(out.streakDate||'')) out.streakDate=remoteZ.streakDate;
  var la=out.activeSession, ra=remoteZ.activeSession;
  if(ra&&(!la||((ra.lastAt||ra.startedAt||'')>(la.lastAt||la.startedAt||'')))) out.activeSession=JSON.parse(JSON.stringify(ra));
  return out;
}
// ── QY-16: Kur’an Yolculuğu çoklu cihaz birleştirmesi ───────────────────────
// Plan §13 "Birleştirme kuralları" burada BİREBİR uygulanır:
//   - Farklı sûre istekleri union.
//   - Aynı istek `updatedAt` ile LWW, fakat durum geriye gidemez.
//   - `ready`, `watched` tarafından geriye çekilemez.
//   - `watchedAt` bir kez oluştuysa eski cihaz silemez.
//   - Yanıt/video geçmişi kaybolmaz.
// (Ayrı response dosyası zaten latest.json'dan bağımsız — QY-04/QY-08/QY-11
// isolasyonu; "aynı requestId iki kez eklenemez" kuralı da zaten
// upsertOutboxRequest'in map-by-requestId sözleşmesiyle sağlanıyor — burada
// yeniden uygulanmaz.)
//
// KEŞİF: mergeData bu faza kadar quranJourney'e hiç dokunmuyordu — iki
// cihazda da alan zaten var olduğu için "remote'de olup local'de olmayanı
// ekle" yedeği de devreye girmiyordu, yani B bayat kalmış bir cihazdan push
// ettiğinde A'nın az önce kaydettirdiği isteği/videoyu SESSİZCE EZİYORDU.
// Bu fonksiyon tam olarak o riski kapatır.
//
// Rütbe tablosu app.js'teki QURAN_RANK ile BİREBİR aynı (kasıtlı kopya —
// sync.js app.js'e bağımlı değildir, her modül kendi küçük sabitini taşır;
// bkz. diğer *_S yardımcıları ve mergeZikr'in kendi kopyaladığı örüntü).
var QURAN_RANK_S={idle:0,request_error:0,submitting:1,queued:2,notification_error:2,notified:3,awaiting_reply:4,validating_reply:5,invalid_reply:5,ready:6,video_unavailable:6,watching:7,watched:8,question_opened:9};
var QURAN_HISTORY_MAX_S=20;
var QURAN_NOTE_MAX_S=100;
function quranRankS(s){ return (typeof s==='string'&&typeof QURAN_RANK_S[s]==='number')?QURAN_RANK_S[s]:0; }
// videoHistory: iki cihazın ayrı ayrı archiveVideo ettiği kayıtları kaybetmeden
// birleştirir. responseId+videoId+replacedAt üçlüsü pratik bir doğal anahtar
// (aynı olayın iki cihazda aynı şekilde arşivlenmesi durumunda tekilleştirir).
function mergeQuranVideoHistory(a,b){
  var list=(Array.isArray(a)?a:[]).concat(Array.isArray(b)?b:[]);
  var seen={}, out=[];
  list.forEach(function(h){
    if(!h||typeof h!=='object') return;
    var key=(h.responseId||'')+'|'+(h.videoId||'')+'|'+(h.replacedAt||'');
    if(seen[key]) return;
    seen[key]=true; out.push(h);
  });
  out.sort(function(x,y){ return String(x.replacedAt||'').localeCompare(String(y.replacedAt||'')); });
  if(out.length>QURAN_HISTORY_MAX_S) out=out.slice(-QURAN_HISTORY_MAX_S);
  return out;
}
function mergeQuranNotes(a,b){
  var list=(Array.isArray(a)?a:[]).concat(Array.isArray(b)?b:[]), byId={};
  list.forEach(function(n){
    if(!n||typeof n!=='object'||!n.id||!n.text) return;
    var key=String(n.id), prev=byId[key];
    if(!prev||String(n.updatedAt||n.createdAt||'')>String(prev.updatedAt||prev.createdAt||'')) byId[key]=n;
  });
  var out=Object.keys(byId).map(function(k){ return byId[k]; });
  out.sort(function(x,y){ return String(y.updatedAt||y.createdAt||'').localeCompare(String(x.updatedAt||x.createdAt||'')); });
  return out.slice(0,QURAN_NOTE_MAX_S);
}
// Aynı sûrenin iki cihazdaki isteğini birleştirir. Kazanan taraf rütbeye göre
// seçilir (durum ASLA geriye gitmez); rütbe eşitse (örn. iki cihaz da 'ready'
// ama farklı videoId — "aynı request iki response alır" senaryosu) updatedAt
// LWW devreye girer. Kaybeden tarafın "bir kez oluşmuş" zaman damgaları ve
// video geçmişi yine de korunur — kazananda boşsa kaybedenden doldurulur.
function mergeQuranRequest(localReq, remoteReq){
  if(!remoteReq||typeof remoteReq!=='object') return localReq;
  if(!localReq||typeof localReq!=='object') return JSON.parse(JSON.stringify(remoteReq));
  var lRank=quranRankS(localReq.status), rRank=quranRankS(remoteReq.status);
  var winner, loser;
  if(lRank>rRank){ winner=localReq; loser=remoteReq; }
  else if(rRank>lRank){ winner=remoteReq; loser=localReq; }
  else if((remoteReq.updatedAt||'')>(localReq.updatedAt||'')){ winner=remoteReq; loser=localReq; }
  else { winner=localReq; loser=remoteReq; }
  var out=JSON.parse(JSON.stringify(winner));
  ['requestedAt','notifiedAt','readyAt','startedWatchingAt','watchedAt','questionOpenedAt'].forEach(function(k){
    if(!out[k]&&loser[k]) out[k]=loser[k];
  });
  out.videoHistory=mergeQuranVideoHistory(winner.videoHistory,loser.videoHistory);
  out.notes=mergeQuranNotes(winner.notes,loser.notes);
  out.lastNoteAt=(String(winner.lastNoteAt||'')>=String(loser.lastNoteAt||''))?(winner.lastNoteAt||loser.lastNoteAt||null):(loser.lastNoteAt||winner.lastNoteAt||null);
  return out;
}
function mergeQuranJourney(localQ, remoteQ){
  if(!remoteQ||typeof remoteQ!=='object') return localQ||{};
  if(!localQ||typeof localQ!=='object') return JSON.parse(JSON.stringify(remoteQ));
  var out=JSON.parse(JSON.stringify(localQ));
  function num(v){ v=Number(v); return isFinite(v)&&v>0?Math.floor(v):0; }
  out.schemaVersion=Math.max(num(out.schemaVersion)||1,num(remoteQ.schemaVersion)||1);
  if(!out.catalogVersion&&remoteQ.catalogVersion) out.catalogVersion=remoteQ.catalogVersion;
  // startedAt yolculuğun İLK başladığı an — LWW değil, en erken değer kazanır.
  if(remoteQ.startedAt&&(!out.startedAt||remoteQ.startedAt<out.startedAt)) out.startedAt=remoteQ.startedAt;
  out.requests=out.requests&&typeof out.requests==='object'?out.requests:{};
  if(remoteQ.requests&&typeof remoteQ.requests==='object'){
    Object.keys(remoteQ.requests).forEach(function(sid){
      out.requests[sid]=mergeQuranRequest(out.requests[sid],remoteQ.requests[sid]);
    });
  }
  return out;
}
function mergeData(localData, remoteData){
  if(!remoteData || typeof remoteData!=='object') return localData;
  if(!localData || typeof localData!=='object') return JSON.parse(JSON.stringify(remoteData));
  var merged=JSON.parse(JSON.stringify(localData));
  // settings
  merged.settings=mergeSettings(merged.settings, remoteData.settings);
  // days
  if(remoteData.days && typeof remoteData.days==='object'){
    merged.days=merged.days || {};
    Object.keys(remoteData.days).forEach(function(date){
      merged.days[date]=mergeDay(merged.days[date], remoteData.days[date]);
    });
  }
  // notifications
  if(remoteData.notifications && Array.isArray(remoteData.notifications)){
    merged.notifications=mergeById(merged.notifications || [], remoteData.notifications, 'id');
  }
  // aeon messages
  if(remoteData.aeon && remoteData.aeon.messages && Array.isArray(remoteData.aeon.messages)){
    merged.aeon=merged.aeon || {};
    merged.aeon.messages=mergeById(merged.aeon.messages || [], remoteData.aeon.messages, 'id');
  }
  if(remoteData.zikr && typeof remoteData.zikr==='object'){
    merged.zikr=mergeZikr(merged.zikr,remoteData.zikr);
  }
  // QY-16 — quranJourney bu satırdan önce hiç birleştirilmiyordu (bkz. yukarıdaki
  // mergeQuranJourney yorum bloğu); bayat bir cihazın push'u diğerinin isteğini/
  // videosunu sessizce ezebiliyordu.
  if(remoteData.quranJourney && typeof remoteData.quranJourney==='object'){
    merged.quranJourney=mergeQuranJourney(merged.quranJourney,remoteData.quranJourney);
  }
  if(remoteData.eventLog && typeof remoteData.eventLog==='object'){
    merged.eventLog=mergeEventLog(merged.eventLog,remoteData.eventLog);
  }
  // savedAt: en yeni
  if(remoteData.savedAt && typeof remoteData.savedAt==='string' && (!merged.savedAt || remoteData.savedAt>merged.savedAt)){
    merged.savedAt=remoteData.savedAt;
  }
  // lastOpenedDate: en yeni
  if(remoteData.lastOpenedDate && typeof remoteData.lastOpenedDate==='string' && (!merged.lastOpenedDate || remoteData.lastOpenedDate>merged.lastOpenedDate)){
    merged.lastOpenedDate=remoteData.lastOpenedDate;
  }
  // remote'de olup local'de olmayan üst seviye alanları ekle
  Object.keys(remoteData).forEach(function(k){
    if(!(k in merged)) merged[k]=JSON.parse(JSON.stringify(remoteData[k]));
  });
  return merged;
}

// repoya yazmadan önce hassas alanları (token + cihaz-özel kilit bilgisi) çıkar — public repoya sızmasın
function sanitize(data){
  var c; try{ c=JSON.parse(JSON.stringify(data)); }catch(e){ c=data; }
  if(c&&c.settings){ delete c.settings.ghToken; delete c.settings.syncUrl; delete c.settings.openaiKey; delete c.settings.auth; }
  if(c&&typeof c==='object') c.syncReceipt=normalizeSyncReceipt(c.syncReceipt);
  if(c&&c.eventLog&&typeof c.eventLog==='object') c.eventLog=mergeEventLog(c.eventLog,{});
  if(c&&c.weather&&Array.isArray(c.weather.spots)){ c.weather.spots.forEach(function(sp){ if(sp&&typeof sp==="object") delete sp.emoji; }); }
  if(c&&c.library&&Array.isArray(c.library.books)){ c.library.books.forEach(function(b){ if(b&&typeof b==="object") delete b.emoji; }); }
  if(c&&c.watchlist&&Array.isArray(c.watchlist.items)){ c.watchlist.items.forEach(function(t){ if(t&&typeof t==="object") delete t.emoji; }); }
  if(c&&c.music&&Array.isArray(c.music.items)){ c.music.items.forEach(function(m){ if(m&&typeof m==="object") delete m.emoji; }); }
  return c;
}
function doPush(data){
  var c=cfg(); if(!c){ setStatus('idle'); return Promise.resolve(null); }
  // GUARD 1 — yerel/geliştirme ortamından (localhost/file:) push etme. Bayat bir
  // localStorage durumu gerçek veriyi ezebilir (bkz. CLAUDE.md → Veri Güvenliği).
  if(devOrigin() && !syncForced()){
    setStatus('idle');
    try{ console.warn('[SeySync] Yerel ortam (localhost/file:) algılandı — push ENGELLENDİ (veri güvenliği). Bilinçli test için: localStorage.setItem("seyma-sync-force","1") veya ?forceSync=1'); }catch(e){}
    return Promise.resolve(null);
  }
  var nowIso=new Date().toISOString(), current=normalizeSyncReceipt(data&&data.syncReceipt);
  var pending=localReceipt(data,{status:'saving',sourceUpdatedAt:current.sourceUpdatedAt||safeReceiptIso(data&&data.savedAt)||nowIso,submittedAt:nowIso,lastErrorCode:null});
  setStatus('saving');
  if(data&&data.eventLog){ data.eventLog=mergeEventLog(data.eventLog,{}); }
  function accept(receipt){
    localReceipt(data,receipt); setStatus('ok'); if(window.SeyOnSynced){ try{ window.SeyOnSynced(receipt); }catch(e){} } return receipt;
  }
  return pushWithCfg(c,data,pending)
    .then(function(receipt){ return accept(receipt); })
    .catch(function(e){
      if(c.branch!=='main' && isMissingRefError(e)){
        var c2={token:c.token, owner:c.owner, repo:c.repo, branch:'main'};
        return pushWithCfg(c2,data,pending).then(function(receipt){ persistBranch('main'); return accept(receipt); });
      }
      throw e;
    })
    .catch(function(e){
      var code=errorCode(e), st=failureStatus(code);
      return writeFailureReceipt(c,pending,code).then(function(){
        localReceipt(data,{status:st,lastErrorCode:code}); setStatus('error',code); return null;
      });
    });
}

// ── QY-08: Kur’an Yolculuğu istek outbox'u ──────────────────────────────────
// data/quran-request-outbox.json TEK dosyası, QuranTransportV1 (QY-04)
// sözleşmesiyle okunup yazılır. KRİTİK İZOLASYON: latest.json'a ASLA
// dokunmaz, doPush()/putLatestGuarded()'ın full-replace zincirine hiç
// karışmaz — outbox kendi GET+merge+PUT döngüsünü ayrı yürütür.
//
// Guard 1 (dev-origin) burada da AYNEN uygulanır: yerel/geliştirme kökeninden
// gerçek bir Raşit'e-istek e-postası tetiklenmesin. Guard 2 (anti-clobber gün
// sayımı) yalnızca latest.json'un "gün" kavramına özgüdür; outbox bir kuyruk/
// defterdir, buraya taşınmaz — zayıflatma değil, kapsam dışı bırakmadır.
//
// replyToken YALNIZ burada üretilir ve YALNIZ outbox dosyasına yazılır;
// app.js'ten gelen payload'da hiç bulunmaz, çağırana asla geri döndürülmez
// (QuranTransportV1.containsSecret sözleşmesi). GitHub token ise hiçbir
// zaman JSON gövdesine girmez — yalnız Authorization header'ında taşınır
// (ghHeaders/ghPut ile aynı desen).
var QURAN_REPLY_ALPHABET='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function quranReplyToken(){
  var len=40, out='', bytes=null, i, n;
  try{
    if(typeof crypto!=='undefined' && crypto && typeof crypto.getRandomValues==='function' && typeof Uint8Array!=='undefined'){
      bytes=new Uint8Array(len); crypto.getRandomValues(bytes);
    }
  }catch(e){ bytes=null; }
  for(i=0;i<len;i++){
    n=bytes?bytes[i]:Math.floor(Math.random()*256);
    out+=QURAN_REPLY_ALPHABET.charAt(n%QURAN_REPLY_ALPHABET.length);
  }
  return out;
}
function quranOutboxEntryFromPayload(payload, at){
  return {
    requestId: payload.requestId,
    surahId: payload.surahId,
    revelationOrder: payload.revelationOrder,
    // mushafOrder QY-09'un e-posta gövdesindeki "Mushaf sırası" satırı için
    // gerekli; app.js payload'ında zaten var, burada ilk kez korunuyor.
    mushafOrder: (typeof payload.mushafOrder==='number') ? payload.mushafOrder : null,
    surahName: payload.surahName,
    requestedAt: payload.requestedAt || at,
    replyToken: quranReplyToken()
  };
}
// GET (sha + mevcut defter) → QuranTransportV1.upsertOutboxRequest (saf birleştirme)
// → PUT. 409/422 (eşzamanlı yazma çakışması) üzerine sha'yı yeniden okuyup
// sınırlı sayıda yeniden dener — ghPut()'taki desenin aynısı.
function putQuranOutboxGuarded(c, entry, at, attempt){
  attempt = attempt||0;
  var T = window.QuranTransportV1;
  var api = 'https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+T.PATHS.outbox;
  var H = ghHeaders(c);
  return fetch(api+'?ref='+encodeURIComponent(c.branch)+'&t='+Date.now(),{headers:H})
    .then(function(r){ if(r.status===200) return r.json(); return null; })
    .then(function(g){
      var sha=(g&&g.sha)||null, current=T.emptyOutbox();
      if(g && g.content){
        try{ var parsed=T.parseOutbox(b64decodeUtf8(g.content)); current=parsed.value; }catch(e){}
      }
      var res=T.upsertOutboxRequest(current, entry, at);
      if(!res.ok) return Promise.reject(new Error('quran_outbox_invalid_entry:'+(res.errors||[]).join(',')));
      var contentStr=JSON.stringify(res.value,null,2);
      var body={message:'quran-outbox: '+entry.surahId, content:b64(contentStr), branch:c.branch}; if(sha) body.sha=sha;
      var H2={}; for(var k in H) H2[k]=H[k]; H2['Content-Type']='application/json';
      return fetch(api,{method:'PUT',headers:H2,body:JSON.stringify(body)});
    })
    .then(function(r){
      if(r.ok) return;
      return r.text().then(function(t){
        if((r.status===409||r.status===422) && attempt<3) return putQuranOutboxGuarded(c,entry,at,attempt+1);
        throw new Error(r.status+' '+t.slice(0,160));
      });
    });
}
// Uygulama (app.js QY-07) bu fonksiyonu çağırır: cb(err) ve/veya döndürülen
// Promise ile sonuç bildirilir. Payload'da replyToken YOKTUR — üretimi ve
// saklanması tamamen burada, ağ sınırının ötesine hiç geçmez. Kanal
// yapılandırılmamışsa veya yerel kökendeyse istek yerelde AYNEN kalır
// (app.js zaten yerel kaydı önce, ağ çağrısından BAĞIMSIZ olarak yapar);
// burada yalnız "iletildi mi" sonucu bildirilir, yerel veri hiç kaybolmaz.
function pushQuranRequest(payload, cb){
  cb = typeof cb==='function' ? cb : function(){};
  var T = window.QuranTransportV1;
  if(!T || !payload || !T.isValidRequestId(payload.requestId) || !T.isValidSurahId(payload.surahId)){
    var e1=new Error('quran_outbox: geçersiz payload'); cb(e1); return Promise.reject(e1);
  }
  var c=cfg();
  if(!c){ var e2=new Error('quran_outbox: senkron yapılandırılmamış'); cb(e2); return Promise.reject(e2); }
  if(devOrigin() && !syncForced()){
    try{ console.warn('[SeySync] Yerel ortam (localhost/file:) algılandı — Kur’an isteği ENGELLENDİ (veri güvenliği). Bilinçli test için: localStorage.setItem("seyma-sync-force","1") veya ?forceSync=1'); }catch(e){}
    var e3=new Error('quran_outbox: yerel ortamdan push engellendi'); cb(e3); return Promise.reject(e3);
  }
  var at=new Date().toISOString();
  var entry=quranOutboxEntryFromPayload(payload, at);
  var chain;
  // fetch normalde reddedilen bir Promise döner, ama bozuk/mock bir ortamda
  // SENKRON fırlatabilir; bu durumda çağrı .then() bağlanmadan önce çöker.
  // try/catch, "outbox yazılamazsa yerel istek kaybolmaz" garantisinin UI'ya
  // asla bir istisna sızdırmadan ulaşmasını sağlar.
  try{ chain=putQuranOutboxGuarded(c, entry, at); }
  catch(syncErr){ cb(syncErr); return Promise.reject(syncErr); }
  return chain
    .then(function(){ cb(null); })
    .catch(function(e){ cb(e); throw e; });
}

// ── QY-11: Kur’an Yolculuğu teslim/yanıt dosyalarını salt-okunur çek ────────
// Yalnız GET; hiçbir dosyaya yazmaz. Guard 1/2 burada uygulanmaz — okumak
// (yazmanın aksine) veri kaybı riski taşımaz, localhost'ta bile güvenlidir.
// Cache-busting `&t=Date.now()` aynı desen (bkz. putLatestGuarded). Bozuk/eksik
// dosya asla throw etmez: QuranTransportV1.parse* zaten tolerant; dosya hiç
// yoksa (404/boş) hata değil, "henüz yok" sayılıp boş sözleşme döndürülür.
function ghGetTransportFile(c, path){
  var api='https://api.github.com/repos/'+encodeURIComponent(c.owner)+'/'+encodeURIComponent(c.repo)+'/contents/'+path;
  var H=ghHeaders(c);
  return fetch(api+'?ref='+encodeURIComponent(c.branch)+'&t='+Date.now(),{headers:H})
    .then(function(r){ if(r.status===200) return r.json(); return null; })
    .then(function(g){ return (g&&typeof g.content==='string')?b64decodeUtf8(g.content):null; });
}
// cb(err, {delivery, responses, deliveryErrors, responseErrors}). Senkron
// yapılandırılmamışsa veya QuranTransportV1 yüklü değilse sessizce boş
// sözleşmeyle döner (err yok) — bu bir hata değil, "kontrol edilecek bir şey
// yok" durumudur. Arka planda çağrılmaz; yalnız app.js QY-11 açık istekle
// (ekran açılışı/kullanıcı yenilemesi) tetikler — burada polling YOKTUR.
function pullQuranUpdates(cb){
  cb = typeof cb==='function' ? cb : function(){};
  var T = window.QuranTransportV1;
  if(!T){ cb(null,{delivery:null,responses:null}); return Promise.resolve(); }
  var c=cfg();
  if(!c){ cb(null,{delivery:T.emptyDelivery(),responses:T.emptyResponses()}); return Promise.resolve(); }
  return Promise.all([
    ghGetTransportFile(c,T.PATHS.delivery),
    ghGetTransportFile(c,T.PATHS.responses)
  ]).then(function(raw){
    var d = raw[0]===null ? {value:T.emptyDelivery(),errors:[]} : T.parseDelivery(raw[0]);
    var r = raw[1]===null ? {value:T.emptyResponses(),errors:[]} : T.parseResponses(raw[1]);
    cb(null,{delivery:d.value,responses:r.value,deliveryErrors:d.errors,responseErrors:r.errors});
  }).catch(function(e){
    cb(e,{delivery:T.emptyDelivery(),responses:T.emptyResponses()});
  });
}

// ÆON soru tetiği: yalnızca Şeyma ÆON'a soru gönderince yazılır. Küçük ve ayrı bir
// dosya olduğu için veri reposundaki mail workflow'u SADECE burada tetiklenir
// (hareket/mod gibi sık latest.json push'larında boşuna çalışıp Actions dakikası yakmaz).
function pushPing(item){
  var c=cfg(); if(!c) return Promise.resolve();
  if(devOrigin() && !syncForced()) return Promise.resolve(); // GUARD 1 — yerelden ping yazma
  var payload=JSON.stringify({type:'aeon-question',item:item,ts:new Date().toISOString()},null,2);
  return ghPut(c,'data/aeon-outbox.json',payload).catch(function(){});
}
// Profil değerlendirmesi tetiği: yalnızca 174/174 tamamlanınca (bir kez) yazılır. Ayrı ve
// küçük bir dosya olduğu için veri reposundaki mail workflow'u SADECE burada tetiklenir —
// aeon-outbox.json ile aynı desen (bkz. yukarıdaki yorum): latest.json'un sık push'larını
// izlemez, boşuna Actions dakikası yakmaz.
function pushProfileCompletionPing(){
  var c=cfg(); if(!c) return Promise.resolve();
  if(devOrigin() && !syncForced()) return Promise.resolve(); // GUARD 1 — yerelden ping yazma
  var payload=JSON.stringify({type:'profile-completed',ts:new Date().toISOString()},null,2);
  return ghPut(c,'data/profile-outbox.json',payload).catch(function(){});
}

window.SeySync={
  schedule:function(data){ lastPayload=data; if(!cfg()){ setStatus('idle'); return; } if(devOrigin() && !syncForced()){ setStatus('idle'); return; } localReceipt(data,{status:'queued',sourceUpdatedAt:normalizeSyncReceipt(data&&data.syncReceipt).sourceUpdatedAt||safeReceiptIso(data&&data.savedAt)||new Date().toISOString(),lastErrorCode:null}); clearTimeout(timer); setStatus('saving'); timer=setTimeout(function(){ doPush(lastPayload); }, DEBOUNCE); },
  pushNow:function(){ clearTimeout(timer); if(lastPayload) return doPush(lastPayload); try{ var raw=localStorage.getItem(KEY); if(raw) return doPush(JSON.parse(raw)); }catch(e){} return Promise.resolve(null); },
  pushPing:pushPing,
  pushProfileCompletionPing:pushProfileCompletionPing,
  // QY-08 — Kur’an Yolculuğu istek outbox yazıcısı. latest.json zincirinden
  // bağımsız; ayrıntı için yukarıdaki "QY-08" bloğunun yorumlarına bakın.
  pushQuranRequest:pushQuranRequest,
  // QY-11 — Kur’an Yolculuğu teslim/yanıt salt-okunur çekici. Ayrıntı için
  // yukarıdaki "QY-11" bloğunun yorumlarına bakın.
  pullQuranUpdates:pullQuranUpdates,
  statusText:statusText,
  normalizeSyncReceipt:normalizeSyncReceipt,
  syncErrorCode:errorCode,
  // Faz 10 — saf conflict resolution fonksiyonu (headless testlerden çağrılır).
  mergeProfileAssessment:mergeProfileAssessment,
  // Conflict-safe sync — genel veri birleştirme (headless testlerden çağrılır).
  mergeData:mergeData,
  mergeEventLog:mergeEventLog,
  normalizeEvent:normalizeSyncEvent,
  parseEventFile:parseEventFile,
  mergeEventFile:mergeEventFile,
  putEventLogDayGuarded:putEventLogDayGuarded,
  pushEventLog:pushEventLog,
  mergeDay:mergeDay,
  mergeById:mergeById,
  mergeSettings:mergeSettings,
  mergeZikr:mergeZikr,
  // QY-16 — Kur’an Yolculuğu çoklu cihaz birleştirmesi (headless testlerden çağrılır).
  mergeQuranJourney:mergeQuranJourney,
  mergeQuranRequest:mergeQuranRequest,
  // Faz 10 — offline reconnect: bağlantı geldiğinde bekleyen push'u tetikler.
  // Gerçek network çağrısı yapmaz; yalnızca schedule/pushNow'u çağırır.
  retryIfPending:function(){ if(lastPayload && cfg() && !devOrigin()){ localReceipt(lastPayload,{status:'retrying',lastErrorCode:null}); clearTimeout(timer); timer=setTimeout(function(){ doPush(lastPayload); }, 500); } }
};
// Faz 10 — offline reconnect: bağlantı geri geldiğinde bekleyen senkronu tetikle.
// Tarayıcı online/offline event'leri (mocklanabilir). push yine de Guard 1/2'den geçer.
try{
  if(typeof window!=='undefined' && window.addEventListener){
    window.addEventListener('online', function(){ try{ if(window.SeySync && window.SeySync.retryIfPending) window.SeySync.retryIfPending(); }catch(e){} });
  }
}catch(e){}
})();
