// sync.js — Şeyma repo senkron katmanı (yalnızca doğrudan GitHub)
// settings.ghToken + ghRepo (+ ghBranch) tanımlıysa, veriyi tarayıcıdan
// doğrudan GitHub Contents API ile repoya yazar. Token YALNIZCA bu cihazın
// localStorage'ında durur; repoya/sayfaya yazılmaz. Tanımlı değilse devre dışı.
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
  if(state.status==='ok') return 'Bağlantı aktif ✓ Son kayıt '+timeStr(state.last);
  if(state.status==='error') return 'Hata: '+(state.error||'bilinmiyor');
  return 'Bağlantı hazır';
}
function paint(){ var el=document.getElementById('sey-sync-status'); if(el) el.textContent=statusText(); }
function setStatus(s,err){ state.status=s; if(s==='ok'){ state.last=new Date().toISOString(); state.error=null; if(window.SeyOnSynced){ try{ window.SeyOnSynced(); }catch(e){} } } if(s==='error') state.error=err||'bilinmiyor'; paint(); }

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
      if(r.ok) return;
      return r.text().then(function(t){
        if((r.status===409||r.status===422) && attempt<3) return ghPut(c,path,contentStr,attempt+1);
        throw new Error(r.status+' '+t.slice(0,160));
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
      var localDays=dayCount(localData);
      if(remoteDays>0 && localDays<remoteDays && !syncForced()){
        try{ console.error('[SeySync] ANTI-CLOBBER: yerel '+localDays+' gün < uzak '+remoteDays+' gün. Veri kaybını önlemek için push İPTAL edildi. Bilinçli üzerine yazmak için: localStorage.setItem("seyma-sync-force","1")'); }catch(e){}
        setStatus('error','Güvenlik: '+localDays+'<'+remoteDays+' gün, push iptal');
        throw new Error('anti-clobber: local '+localDays+' < remote '+remoteDays+' days');
      }
      // Faz 10 — profileAssessment çakışma çözümü: uzakta profileAssessment varsa,
      // yerel ile itemId bazında birleştir. merge yalnızca veri kazandırır, kaybettirmez.
      // Token/localhost/anti-clobber korumaları değiştirilmez; merge anti-clobber
      // geçtikten sonra uygulanır. Saf fonksiyon (mergeProfileAssessment) testlerden
      // doğrudan da çağrılabilir.
      if(remoteObj && remoteObj.profileAssessment && localData && localData.profileAssessment){
        mergeProfileAssessment(localData.profileAssessment, remoteObj.profileAssessment);
        latestStr=JSON.stringify(localData,null,2);
        if(typeof window.SeySync.onProfileMerge==='function'){
          try{ window.SeySync.onProfileMerge(localData.profileAssessment); }catch(e){}
        }
      }
      var body={message:'sync: data/latest.json', content:b64(latestStr), branch:c.branch}; if(sha) body.sha=sha;
      var H2={}; for(var k in H) H2[k]=H[k]; H2['Content-Type']='application/json';
      return fetch(base,{method:'PUT',headers:H2,body:JSON.stringify(body)}).then(function(r){
        if(r.ok) return;
        return r.text().then(function(t){ throw new Error(r.status+' '+t.slice(0,160)); });
      });
    });
}
function pushWithCfg(c, data){
  var today=(data&&data.lastOpenedDate)|| new Date().toISOString().slice(0,10);
  var latest=JSON.stringify(data,null,2);
  var snap=JSON.stringify({app:'seyma',date:today,savedAt:new Date().toISOString(),data:data},null,2);
  return putLatestGuarded(c,latest,data).then(function(){ return ghPut(c,'data/gunluk/'+today+'.json',snap); });
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
// repoya yazmadan önce hassas alanları (token) çıkar — public repoya sızmasın
function sanitize(data){
  var c; try{ c=JSON.parse(JSON.stringify(data)); }catch(e){ c=data; }
  if(c&&c.settings){ delete c.settings.ghToken; delete c.settings.syncUrl; delete c.settings.openaiKey; }
  if(c&&c.weather&&Array.isArray(c.weather.spots)){ c.weather.spots.forEach(function(sp){ if(sp&&typeof sp==="object") delete sp.emoji; }); }
  if(c&&c.library&&Array.isArray(c.library.books)){ c.library.books.forEach(function(b){ if(b&&typeof b==="object") delete b.emoji; }); }
  if(c&&c.watchlist&&Array.isArray(c.watchlist.items)){ c.watchlist.items.forEach(function(t){ if(t&&typeof t==="object") delete t.emoji; }); }
  if(c&&c.music&&Array.isArray(c.music.items)){ c.music.items.forEach(function(m){ if(m&&typeof m==="object") delete m.emoji; }); }
  return c;
}
function doPush(data){
  var c=cfg(); if(!c){ setStatus('idle'); return; }
  // GUARD 1 — yerel/geliştirme ortamından (localhost/file:) push etme. Bayat bir
  // localStorage durumu gerçek veriyi ezebilir (bkz. CLAUDE.md → Veri Güvenliği).
  if(devOrigin() && !syncForced()){
    setStatus('idle');
    try{ console.warn('[SeySync] Yerel ortam (localhost/file:) algılandı — push ENGELLENDİ (veri güvenliği). Bilinçli test için: localStorage.setItem("seyma-sync-force","1") veya ?forceSync=1'); }catch(e){}
    return;
  }
  setStatus('saving');
  var safe=sanitize(data);
  pushWithCfg(c,safe)
    .then(function(){ setStatus('ok'); })
    .catch(function(e){
      if(c.branch!=='main' && isMissingRefError(e)){
        var c2={token:c.token, owner:c.owner, repo:c.repo, branch:'main'};
        return pushWithCfg(c2,safe).then(function(){ persistBranch('main'); setStatus('ok'); });
      }
      throw e;
    })
    .catch(function(e){ setStatus('error', String((e&&e.message)||e)); });
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

window.SeySync={
  schedule:function(data){ lastPayload=data; if(!cfg()){ setStatus('idle'); return; } if(devOrigin() && !syncForced()){ setStatus('idle'); return; } clearTimeout(timer); setStatus('saving'); timer=setTimeout(function(){ doPush(lastPayload); }, DEBOUNCE); },
  pushNow:function(){ clearTimeout(timer); if(lastPayload){ doPush(lastPayload); return; } try{ var raw=localStorage.getItem(KEY); if(raw) doPush(JSON.parse(raw)); }catch(e){} },
  pushPing:pushPing,
  statusText:statusText,
  // Faz 10 — saf conflict resolution fonksiyonu (headless testlerden çağrılır).
  mergeProfileAssessment:mergeProfileAssessment,
  // Faz 10 — offline reconnect: bağlantı geldiğinde bekleyen push'u tetikler.
  // Gerçek network çağrısı yapmaz; yalnızca schedule/pushNow'u çağırır.
  retryIfPending:function(){ if(lastPayload && cfg() && !devOrigin()){ clearTimeout(timer); timer=setTimeout(function(){ doPush(lastPayload); }, 500); } }
};
// Faz 10 — offline reconnect: bağlantı geri geldiğinde bekleyen senkronu tetikle.
// Tarayıcı online/offline event'leri (mocklanabilir). push yine de Guard 1/2'den geçer.
try{
  if(typeof window!=='undefined' && window.addEventListener){
    window.addEventListener('online', function(){ try{ if(window.SeySync && window.SeySync.retryIfPending) window.SeySync.retryIfPending(); }catch(e){} });
  }
}catch(e){}
})();
