(function(){
  'use strict';

  // MON-22 · Kur'an Yolculuğu domain registry
  // ---------------------------------------------------------------------------
  // Şema, durum makinesi ve uzak teslim/yanıt uygulaması burada yaşar. Root
  // data rebind'i app.js'te kalır; registry yalnızca canlı resolver üzerinden
  // okur. Outbox yazma ve delivery/response GET işlemleri quranTransportV1.js
  // ile sync.js'in sınırındadır; bu modül onları yeniden tanımlamaz.
  var QURAN_SCHEMA_VERSION=1;
  var QURAN_CATALOG_VERSION='quran-revelation-tr-v1';
  var QURAN_DEFAULT_SURAH_ID='alak';
  var QURAN_SURAH_ID_RE=/^[a-z]+(-[a-z]+)*$/;
  var QURAN_REQUEST_ID_RE=/^qr_[A-Za-z0-9_-]{8,64}$/;
  var QURAN_VIDEO_ID_RE=/^[A-Za-z0-9_-]{11}$/;
  var QURAN_STATUSES=['idle','submitting','queued','notified','awaiting_reply','validating_reply','ready','watching','watched','question_opened','request_error','notification_error','invalid_reply','video_unavailable'];
  var QURAN_REQUEST_STAMPS=['requestedAt','notifiedAt','readyAt','startedWatchingAt','watchedAt','questionOpenedAt','updatedAt','deliverySentAt','responseReceivedAt','responseValidatedAt'];
  var QURAN_HISTORY_MAX=20;
  var QURAN_NOTE_MAX=100;
  var QURAN_NOTE_KINDS=['watch','listen','reflection'];
  var QURAN_WHATSAPP_NUMBER='905066020098';
  var QURAN_ID_ALPHABET='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  var QURAN_RANK={idle:0,request_error:0,submitting:1,queued:2,notification_error:2,notified:3,awaiting_reply:4,validating_reply:5,invalid_reply:5,ready:6,video_unavailable:6,watching:7,watched:8,question_opened:9};
  var QURAN_RETRYABLE=['idle','request_error','notification_error','invalid_reply','video_unavailable'];
  var QURAN_TRANSITIONS={
    request_submit:{from:QURAN_RETRYABLE,to:'submitting'},
    // QY-21: outbox/delivery gerçeği, yerel ağ sonucundan daha güçlüdür.
    outbox_written:{from:['submitting','request_error'],to:'queued'},
    outbox_failed:{from:['submitting'],to:'request_error'},
    delivery_receipt:{from:['queued','request_error','notification_error'],to:'notified'},
    delivery_failed:{from:['queued'],to:'notification_error'},
    await_reply:{from:['notified'],to:'awaiting_reply'},
    response_received:{from:['awaiting_reply'],to:'validating_reply'},
    response_valid:{from:['validating_reply','video_unavailable'],to:'ready'},
    response_invalid:{from:['validating_reply'],to:'invalid_reply'},
    watch_start:{from:['ready'],to:'watching'},
    watch_complete:{from:['ready','watching'],to:'watched'},
    video_gone:{from:['ready','watching'],to:'video_unavailable'},
    question_open:{from:['watched'],to:'question_opened'}
  };

  var quranDeps=null;
  function registerQuran(deps){
    if(quranDeps||!deps||typeof deps!=='object'||Array.isArray(deps)) return false;
    if(typeof deps.data!=='function') return false;
    quranDeps=deps;
    return true;
  }
  function stateData(){
    var f=quranDeps&&quranDeps.data;
    if(f){ try{ return f(); }catch(e){} }
    var st=window.SeymaState;
    return st?st.data:null;
  }

  function quranNullableStr(v){ return (typeof v==='string'&&v)?v:null; }
  function quranNormalizeRequestId(v){
    var id=String(v==null?'':v).trim();
    return QURAN_REQUEST_ID_RE.test(id)?id:null;
  }
  function quranNormalizeSurahId(v){
    var id=String(v==null?'':v).trim().toLocaleLowerCase('tr-TR');
    return QURAN_SURAH_ID_RE.test(id)?id:null;
  }
  function quranSafeSurahId(id){
    var sid=quranNormalizeSurahId(id);
    if(!sid) return '';
    var cat=(typeof window!=='undefined'&&window.QuranRevelationOrderV1)||null;
    return cat&&typeof cat.byId==='function'&&cat.byId(sid)?sid:'';
  }

  function emptyQuranJourney(){
    return {schemaVersion:QURAN_SCHEMA_VERSION,catalogVersion:QURAN_CATALOG_VERSION,startedAt:null,activeSurahId:QURAN_DEFAULT_SURAH_ID,requests:{}};
  }
  function normQuranNote(n){
    if(!n||typeof n!=='object'||Array.isArray(n)) return null;
    var id=String(n.id||'').trim(); if(!id) return null;
    var kind=QURAN_NOTE_KINDS.indexOf(n.kind)>=0?n.kind:'watch';
    var sec=null;
    if(n.timestampSec!==null&&n.timestampSec!==undefined&&n.timestampSec!==''){
      var num=Number(n.timestampSec); if(isFinite(num)&&num>=0) sec=Math.floor(num);
    }
    var text=String(n.text||'').trim().slice(0,2000); if(!text) return null;
    var createdAt=quranNullableStr(n.createdAt)||quranNullableStr(n.updatedAt);
    var updatedAt=quranNullableStr(n.updatedAt)||createdAt;
    var videoId=QURAN_VIDEO_ID_RE.test(String(n.videoId||''))?String(n.videoId):null;
    return {id:id.slice(0,80),kind:kind,videoId:videoId,timestampSec:sec,tag:String(n.tag||'').trim().slice(0,40),text:text,createdAt:createdAt,updatedAt:updatedAt};
  }
  function quranSortNotes(list){
    return (Array.isArray(list)?list:[]).slice().sort(function(a,b){
      return String((b&&b.updatedAt)||(b&&b.createdAt)||'').localeCompare(String((a&&a.updatedAt)||(a&&a.createdAt)||''));
    });
  }
  // Status bozuk/eksikse yalnız mevcut zaman damgalarından türet; ilerlemeyi
  // geriye alma ve kanıtsız başarı üretme.
  function quranStatusFromStamps(r){
    if(quranNullableStr(r.questionOpenedAt)) return 'question_opened';
    if(quranNullableStr(r.watchedAt)) return 'watched';
    var hasVideo=QURAN_VIDEO_ID_RE.test(String(r.videoId||''));
    if(quranNullableStr(r.startedWatchingAt)) return hasVideo?'watching':'video_unavailable';
    if(hasVideo) return 'ready';
    if(quranNullableStr(r.readyAt)) return 'video_unavailable';
    if(quranNullableStr(r.notifiedAt)) return 'notified';
    if(quranNullableStr(r.requestedAt)) return 'request_error';
    return 'idle';
  }
  function normQuranRequest(r){
    if(!r||typeof r!=='object'||Array.isArray(r)) return null;
    r.requestId=quranNullableStr(r.requestId);
    r.responseId=quranNullableStr(r.responseId);
    r.videoId=QURAN_VIDEO_ID_RE.test(String(r.videoId||''))?String(r.videoId):null;
    QURAN_REQUEST_STAMPS.forEach(function(k){ r[k]=quranNullableStr(r[k]); });
    r.providerMessageId=quranNullableStr(r.providerMessageId);
    r.responseSource=['gmail_reply','panel_manual'].indexOf(r.responseSource)>=0?r.responseSource:null;
    r.responseStatus=['ready','revoked','invalid'].indexOf(r.responseStatus)>=0?r.responseStatus:null;
    r.deliveryProvenance=['delivery_receipt','response_inferred'].indexOf(r.deliveryProvenance)>=0?r.deliveryProvenance:null;
    if(QURAN_STATUSES.indexOf(r.status)<0) r.status=quranStatusFromStamps(r);
    if(!Array.isArray(r.videoHistory)) r.videoHistory=[];
    r.videoHistory=r.videoHistory.filter(function(h){ return h&&typeof h==='object'&&!Array.isArray(h)&&QURAN_VIDEO_ID_RE.test(String(h.videoId||'')); });
    if(r.videoHistory.length>QURAN_HISTORY_MAX) r.videoHistory=r.videoHistory.slice(-QURAN_HISTORY_MAX);
    if(!Array.isArray(r.notes)) r.notes=[];
    r.notes=quranSortNotes(r.notes.map(normQuranNote).filter(Boolean)).slice(0,QURAN_NOTE_MAX);
    r.lastNoteAt=quranNullableStr(r.lastNoteAt)||(r.notes[0]&&quranNullableStr(r.notes[0].updatedAt))||null;
    return r;
  }
  function ensureQuranJourney(d){
    if(!d||typeof d!=='object') return null;
    if(!d.quranJourney||typeof d.quranJourney!=='object'||Array.isArray(d.quranJourney)) d.quranJourney=emptyQuranJourney();
    var q=d.quranJourney;
    q.schemaVersion=QURAN_SCHEMA_VERSION;
    if(typeof q.catalogVersion!=='string'||!q.catalogVersion) q.catalogVersion=QURAN_CATALOG_VERSION;
    q.startedAt=quranNullableStr(q.startedAt);
    var active=quranNormalizeSurahId(q.activeSurahId);
    q.activeSurahId=active||QURAN_DEFAULT_SURAH_ID;
    var cat=(typeof window!=='undefined'&&window.QuranRevelationOrderV1)||null;
    if(cat&&typeof cat.byId==='function'&&!cat.byId(q.activeSurahId)) q.activeSurahId=cat.firstSurahId||QURAN_DEFAULT_SURAH_ID;
    if(!q.requests||typeof q.requests!=='object'||Array.isArray(q.requests)) q.requests={};
    Object.keys(q.requests).forEach(function(id){
      var rec=QURAN_SURAH_ID_RE.test(id)?normQuranRequest(q.requests[id]):null;
      if(rec) q.requests[id]=rec; else delete q.requests[id];
    });
    return q;
  }

  function quranStatusRank(s){ return (typeof s==='string'&&typeof QURAN_RANK[s]==='number')?QURAN_RANK[s]:-1; }
  function quranNewRequest(){
    return {requestId:null,status:'idle',requestedAt:null,notifiedAt:null,deliverySentAt:null,providerMessageId:null,responseId:null,responseSource:null,responseReceivedAt:null,responseValidatedAt:null,responseStatus:null,videoId:null,readyAt:null,startedWatchingAt:null,watchedAt:null,questionOpenedAt:null,updatedAt:null,videoHistory:[],notes:[],lastNoteAt:null};
  }
  function quranCanRequest(r){
    if(!r||typeof r!=='object') return true;
    return QURAN_RETRYABLE.indexOf(r.status)>=0;
  }
  function quranCloneRequest(r){
    var out={},k;
    for(k in r) if(Object.prototype.hasOwnProperty.call(r,k)) out[k]=r[k];
    out.videoHistory=Array.isArray(r.videoHistory)?r.videoHistory.slice():[];
    out.notes=Array.isArray(r.notes)?r.notes.map(function(n){ return n&&typeof n==='object'?Object.assign({},n):n; }):[];
    return out;
  }
  function quranResult(okFlag,changed,reason,req){ return {ok:okFlag,changed:changed,reason:reason,request:req}; }
  function quranArchiveVideo(n,at,reason){
    if(!n.videoId) return;
    n.videoHistory.push({videoId:n.videoId,responseId:n.responseId,readyAt:n.readyAt,replacedAt:at,reason:reason});
    if(n.videoHistory.length>QURAN_HISTORY_MAX) n.videoHistory=n.videoHistory.slice(-QURAN_HISTORY_MAX);
    n.videoId=null; n.responseId=null; n.readyAt=null;
  }
  function quranApplyEvent(cur,ev,to,at){
    var n=quranCloneRequest(cur);
    switch(ev.type){
      case 'request_submit':
        quranArchiveVideo(n,at,'yeniden istendi');
        if(typeof ev.requestId==='string'&&ev.requestId) n.requestId=ev.requestId;
        n.requestedAt=at; n.notifiedAt=null; n.deliverySentAt=null; n.providerMessageId=null;
        n.deliveryProvenance=null; n.responseSource=null; n.responseReceivedAt=null;
        n.responseValidatedAt=null; n.responseStatus=null; n.startedWatchingAt=null;
        break;
      case 'delivery_receipt':
        n.notifiedAt=at;
        if(typeof ev.sentAt==='string'&&ev.sentAt) n.deliverySentAt=ev.sentAt;
        if(typeof ev.providerMessageId==='string'&&ev.providerMessageId) n.providerMessageId=ev.providerMessageId;
        n.deliveryProvenance=ev.inferred?'response_inferred':'delivery_receipt';
        break;
      case 'response_valid':
        quranArchiveVideo(n,at,'yeni anlatım geldi');
        n.responseId=(typeof ev.responseId==='string'&&ev.responseId)?ev.responseId:null;
        n.responseSource=(typeof ev.source==='string'&&ev.source)?ev.source:null;
        n.responseReceivedAt=(typeof ev.receivedAt==='string'&&ev.receivedAt)?ev.receivedAt:null;
        n.responseValidatedAt=(typeof ev.validatedAt==='string'&&ev.validatedAt)?ev.validatedAt:at;
        n.responseStatus='ready'; n.videoId=ev.videoId; n.readyAt=at;
        break;
      case 'watch_start': n.startedWatchingAt=at; break;
      case 'watch_complete': n.watchedAt=at; break;
      case 'question_open': n.questionOpenedAt=at; break;
      case 'response_invalid':
        n.responseSource=(typeof ev.source==='string'&&ev.source)?ev.source:n.responseSource||null;
        n.responseReceivedAt=(typeof ev.receivedAt==='string'&&ev.receivedAt)?ev.receivedAt:n.responseReceivedAt||null;
        n.responseValidatedAt=(typeof ev.validatedAt==='string'&&ev.validatedAt)?ev.validatedAt:n.responseValidatedAt||null;
        n.responseStatus=ev.responseStatus==='revoked'?'revoked':'invalid';
        break;
      case 'video_gone':
        n.responseSource=(typeof ev.source==='string'&&ev.source)?ev.source:n.responseSource||null;
        n.responseReceivedAt=(typeof ev.receivedAt==='string'&&ev.receivedAt)?ev.receivedAt:n.responseReceivedAt||null;
        n.responseValidatedAt=(typeof ev.validatedAt==='string'&&ev.validatedAt)?ev.validatedAt:n.responseValidatedAt||null;
        if(ev.responseStatus==='revoked') n.responseStatus='revoked';
        break;
    }
    n.status=to; n.updatedAt=at;
    return n;
  }
  function quranReduce(request,ev){
    var cur=(request&&typeof request==='object'&&!Array.isArray(request))?request:quranNewRequest();
    if(!ev||typeof ev!=='object'||Array.isArray(ev)) return quranResult(false,false,'invalid_event',cur);
    var rule=QURAN_TRANSITIONS[ev.type];
    if(!rule) return quranResult(false,false,'unknown_event',cur);
    var at=(typeof ev.at==='string'&&ev.at)?ev.at:'';
    if(!at) return quranResult(false,false,'missing_timestamp',cur);
    var status=(typeof cur.status==='string'&&typeof QURAN_RANK[cur.status]==='number')?cur.status:'idle';
    var rank=quranStatusRank(status);
    if(ev.type==='response_valid'&&!QURAN_VIDEO_ID_RE.test(String(ev.videoId||''))) return quranResult(false,false,'invalid_video_id',cur);
    if(ev.type==='request_submit'&&typeof ev.requestId==='string'&&ev.requestId&&ev.requestId===cur.requestId) return quranResult(true,false,'duplicate_request',cur);
    if(ev.type==='response_valid'&&typeof ev.responseId==='string'&&ev.responseId&&ev.responseId===cur.responseId) return quranResult(true,false,'duplicate_response',cur);
    if(ev.type==='outbox_written'&&rank>=QURAN_RANK.queued) return quranResult(true,false,'already_queued',cur);
    if(ev.type==='delivery_receipt'&&rank>=QURAN_RANK.notified) return quranResult(true,false,'already_notified',cur);
    if(ev.type==='await_reply'&&rank>=QURAN_RANK.awaiting_reply) return quranResult(true,false,'already_awaiting',cur);
    if(ev.type==='response_received'&&rank>=QURAN_RANK.validating_reply) return quranResult(true,false,'already_validating',cur);
    if(ev.type==='watch_start'&&rank>=QURAN_RANK.watching) return quranResult(true,false,'already_watching',cur);
    if(ev.type==='watch_complete'&&rank>=QURAN_RANK.watched) return quranResult(true,false,'already_watched',cur);
    if(ev.type==='question_open'&&status==='question_opened') return quranResult(true,false,'already_opened',cur);
    if(ev.type==='video_gone'&&rank>=QURAN_RANK.watched) return quranResult(true,false,'watched_is_final',cur);
    if(ev.type==='response_valid'&&rank>=QURAN_RANK.watched) return quranResult(true,true,'video_superseded',quranApplyEvent(cur,ev,status,at));
    if(rule.from.indexOf(status)<0) return quranResult(false,false,ev.type==='request_submit'?'request_pending':'invalid_transition',cur);
    return quranResult(true,true,'ok',quranApplyEvent(cur,ev,rule.to,at));
  }

  function quranRandomToken(len){
    var bytes=null,out='',i,n;
    try{
      if(typeof crypto!=='undefined'&&crypto&&typeof crypto.getRandomValues==='function'&&typeof Uint8Array!=='undefined'){
        bytes=new Uint8Array(len); crypto.getRandomValues(bytes);
      }
    }catch(e){ bytes=null; }
    for(i=0;i<len;i++){ n=bytes?bytes[i]:Math.floor(Math.random()*256); out+=QURAN_ID_ALPHABET.charAt(n%QURAN_ID_ALPHABET.length); }
    return out;
  }
  function quranNewRequestId(){ return 'qr_'+quranRandomToken(24); }
  // Vitrin âyetinin başlangıcı yalnız UI durumu içindir; kalıcı quranJourney
  // state'ine yazılmaz. Üretim çağrısı app.js'in ui başlatma kabuğunda kalır.
  function quranRandomVerseStart(){
    var mod=(typeof window!=='undefined')&&window.QuranStrikingVersesV1;
    var n=(mod&&mod.totalCount)||100;
    return Math.floor(Math.random()*n);
  }
  function quranOutboxWriter(){
    var s=(typeof window!=='undefined')?window.SeySync:null;
    return (s&&typeof s.pushQuranRequest==='function')?s:null;
  }
  function quranOutboxErrorLabel(err){
    var msg=String((err&&err.message)||err||'');
    var http=msg.match(/(?:^|\s)(401|403|404|409|422)(?:\s|$)/);
    if(http) return 'GitHub '+http[1];
    if(msg.indexOf('senkron yapılandırılmamış')>=0) return 'Bağlantı ayarı';
    if(msg.indexOf('geçersiz payload')>=0||msg.indexOf('invalid_entry')>=0) return 'İstek doğrulama';
    if(msg.indexOf('yerel ortam')>=0) return 'Yerel ortam koruması';
    if(msg.indexOf('timeout')>=0||msg.indexOf('zaman aşımı')>=0) return 'Zaman aşımı';
    return 'Ağ hatası';
  }

  // Uzak dosyalar transport katmanında parse edilmiş olarak gelir. Bu fonksiyon
  // yalnız canonical local data'yı reducer üzerinden günceller; save() ve
  // render() çağrısı app.js handler kabuğunun sorumluluğundadır.
  function quranResponseForSurah(rs,sid,req){
    var best=null,bestStamp='';
    Object.keys(rs||{}).forEach(function(rid){
      var r=rs[rid];
      if(!r||r.surahId!==sid) return;
      var stamp=quranNullableStr(r.validatedAt)||quranNullableStr(r.receivedAt)||'';
      if(!stamp) return;
      if(req&&quranNullableStr(req.requestedAt)&&stamp<=req.requestedAt) return;
      if(!best||stamp>bestStamp){ best=r; bestStamp=stamp; }
    });
    return best;
  }
  function quranApplyRemoteUpdates(delivery,responses){
    var q=ensureQuranJourney(stateData());
    if(!q) return {changed:false,responseChanged:false};
    var changed=false,responseChanged=false,at=new Date().toISOString();
    var dl=(delivery&&delivery.requests)||{}, rs=(responses&&responses.responses)||{};
    Object.keys(q.requests).forEach(function(sid){
      var req=q.requests[sid];
      if(!req||!req.requestId) return;
      function apply(ev){
        var r=quranReduce(req,ev);
        if(r.changed){
          req=r.request; q.requests[sid]=req; changed=true;
          if(ev.type==='response_valid'||ev.type==='response_invalid'||(ev.type==='video_gone'&&ev.responseStatus==='revoked')) responseChanged=true;
        }
      }
      var receipt=dl[req.requestId];
      if(receipt&&receipt.status==='sent'){
        var deliveryAt=receipt.sentAt||at;
        apply({type:'delivery_receipt',at:deliveryAt,sentAt:receipt.sentAt||null,providerMessageId:receipt.providerMessageId||null});
        apply({type:'await_reply',at:deliveryAt});
      }
      var resp=rs[req.requestId]||quranResponseForSurah(rs,sid,req);
      if(resp&&resp.surahId===sid){
        var responseAt=resp.receivedAt||resp.validatedAt||at;
        var validatedAt=resp.validatedAt||responseAt;
        if(!receipt||receipt.status!=='sent'){
          apply({type:'delivery_receipt',at:responseAt,inferred:true});
          apply({type:'await_reply',at:responseAt});
        }
        apply({type:'response_received',at:responseAt});
        if(resp.status==='ready'){
          apply({type:'response_valid',responseId:resp.responseId,videoId:resp.videoId,source:resp.source,receivedAt:resp.receivedAt,validatedAt:validatedAt,at:validatedAt});
        } else if(resp.status==='revoked'){
          apply({type:'video_gone',source:resp.source,receivedAt:resp.receivedAt,validatedAt:validatedAt,responseStatus:'revoked',at:validatedAt});
        }
      }
    });
    return {changed:changed,responseChanged:responseChanged};
  }

  window.SeymaQuran={
    registerQuran:registerQuran,
    QURAN_SCHEMA_VERSION:QURAN_SCHEMA_VERSION,
    QURAN_CATALOG_VERSION:QURAN_CATALOG_VERSION,
    QURAN_DEFAULT_SURAH_ID:QURAN_DEFAULT_SURAH_ID,
    QURAN_SURAH_ID_RE:QURAN_SURAH_ID_RE,
    QURAN_REQUEST_ID_RE:QURAN_REQUEST_ID_RE,
    QURAN_VIDEO_ID_RE:QURAN_VIDEO_ID_RE,
    QURAN_STATUSES:QURAN_STATUSES,
    QURAN_REQUEST_STAMPS:QURAN_REQUEST_STAMPS,
    QURAN_HISTORY_MAX:QURAN_HISTORY_MAX,
    QURAN_NOTE_MAX:QURAN_NOTE_MAX,
    QURAN_NOTE_KINDS:QURAN_NOTE_KINDS,
    QURAN_WHATSAPP_NUMBER:QURAN_WHATSAPP_NUMBER,
    QURAN_RANK:QURAN_RANK,
    QURAN_RETRYABLE:QURAN_RETRYABLE,
    QURAN_TRANSITIONS:QURAN_TRANSITIONS,
    quranNullableStr:quranNullableStr,
    quranNormalizeRequestId:quranNormalizeRequestId,
    quranNormalizeSurahId:quranNormalizeSurahId,
    quranSafeSurahId:quranSafeSurahId,
    emptyQuranJourney:emptyQuranJourney,
    normQuranNote:normQuranNote,
    quranSortNotes:quranSortNotes,
    quranStatusFromStamps:quranStatusFromStamps,
    normQuranRequest:normQuranRequest,
    ensureQuranJourney:ensureQuranJourney,
    quranStatusRank:quranStatusRank,
    quranNewRequest:quranNewRequest,
    quranCanRequest:quranCanRequest,
    quranReduce:quranReduce,
    quranRandomToken:quranRandomToken,
    quranNewRequestId:quranNewRequestId,
    quranRandomVerseStart:quranRandomVerseStart,
    quranOutboxWriter:quranOutboxWriter,
    quranOutboxErrorLabel:quranOutboxErrorLabel,
    quranResponseForSurah:quranResponseForSurah,
    quranApplyRemoteUpdates:quranApplyRemoteUpdates
  };
})();

// MON2-06 · quran yüzey bölümü — app.js'ten taşınan 52 gövde.
// MON-50 appSurface deseni (with(SCOPE)); bu IIFE bilinçli olarak sloppy-mode'dur
// (with yalnız sloppy modda geçerlidir) ve dosyanın strict bölümüne dokunmaz (S5:
// yükleme anında DOM/ağ/timer/storage erişimi yok). Bag üyeleri getter fn'dir; mut
// listesindeki app.js pinleri için set_<ad> yazıcısı aynı bag'de verilir.
(function(){
  var quran_surfaceDeps=null;
  var QURAN_SURFACE_DEPENDENCIES=["App","QURAN_BUCKETS","QURAN_CONFIRM_TIMEOUT_MS","QURAN_FILTERS","QURAN_REFRESH_TIMEOUT_MS","QURAN_ROW_STATES","QURAN_TOTAL_FALLBACK","_quranBodyLocked","_quranBodyPrevOverflow","_quranYtRestartSurahId","data","defer","doc","el","esc","lastOverlayView","quranAttachPlayer","quranDetailActionsHTML","quranDetailBodyHTML","quranDetailViewHTML","quranHeadLeadHTML","quranLibraryResultsHTML","quranLibraryViewHTML","quranVideoNotesInnerHTML","render","save","sync","toast","ui","zikrNormalizeSearchText"];
  var QURAN_MUTABLE_DEPENDENCIES=["_quranBodyLocked","_quranBodyPrevOverflow","_quranYtRestartSurahId","lastOverlayView"];
  var SCOPE=Object.create(null);
  function registerQuranSurface(deps){
    if(quran_surfaceDeps||!deps||typeof deps!=='object'||Array.isArray(deps)) return false;
    for(var i=0;i<QURAN_SURFACE_DEPENDENCIES.length;i++){ if(typeof deps[QURAN_SURFACE_DEPENDENCIES[i]]!=='function') return false; }
    for(var j=0;j<QURAN_MUTABLE_DEPENDENCIES.length;j++){ if(typeof deps['set_'+QURAN_MUTABLE_DEPENDENCIES[j]]!=='function') return false; }
    quran_surfaceDeps=deps; installQuranSurfaceScope(SCOPE); return true;
  }
  function isQuranSurfaceReady(){ return !!quran_surfaceDeps; }
  function installQuranSurfaceScope(s){
    var seen={},k,d,n;
    var ns=window.SeymaQuran||{};
    for(k in ns) if(Object.prototype.hasOwnProperty.call(ns,k)) seen[k]=1;
    for(d=0;d<QURAN_SURFACE_DEPENDENCIES.length;d++){ n=QURAN_SURFACE_DEPENDENCIES[d]; if(n.indexOf('set_')!==0) seen[n]=1; }
    Object.keys(seen).forEach(function(name){
      var mut=QURAN_MUTABLE_DEPENDENCIES.indexOf(name)>=0;
      Object.defineProperty(s,name,{
        get:function(){
          if(quran_surfaceDeps&&Object.prototype.hasOwnProperty.call(quran_surfaceDeps,name)) return quran_surfaceDeps[name]();
          var live=window.SeymaQuran; return live?live[name]:undefined;
        },
        set:mut?function(v){ quran_surfaceDeps['set_'+name](v); }:undefined,
        configurable:true,enumerable:true
      });
    });
  }
  with(SCOPE){
function quranCatalog(){ return (typeof window!=='undefined'&&window.QuranRevelationOrderV1)||null; }

function quranSurahList(){ var c=quranCatalog(); return (c&&Array.isArray(c.surahs))?c.surahs:[]; }

function quranSurah(id){ var c=quranCatalog(); return (c&&typeof c.byId==='function')?c.byId(id):null; }

function quranTotal(){ var n=quranSurahList().length; return n||QURAN_TOTAL_FALLBACK; }

function quranSurahName(id){ var s=quranSurah(id); return s?s.nameTr:String(id||''); }

function quranPlaceLabel(x){ return (x&&x.revelationPlace==='Medine')?'Medenî':'Mekkî'; }

function quranPlaceDisputed(id){ var c=quranCatalog(); return !!(c&&typeof c.isPlaceDisputed==='function'&&c.isPlaceDisputed(id)); }

function quranRequestOf(q,id){
  var r=(q&&q.requests)?q.requests[id]:null;
  return (r&&typeof r==='object'&&!Array.isArray(r))?r:quranNewRequest();
}

function quranBucket(status){ return QURAN_BUCKETS[status]||'unrequested'; }

function quranActiveFilter(){
  var f=String(ui.quranFilter||'all');
  for(var i=0;i<QURAN_FILTERS.length;i++) if(QURAN_FILTERS[i][0]===f) return f;
  return 'all';
}

function quranFilterLabel(f){
  for(var i=0;i<QURAN_FILTERS.length;i++) if(QURAN_FILTERS[i][0]===f) return QURAN_FILTERS[i][1];
  return 'Tümü';
}

function quranRowState(status){ return QURAN_ROW_STATES[status]||QURAN_ROW_STATES.idle; }

function quranStatusNote(status,name){
  if(status==='submitting') return 'İsteğin iletiliyor…';
  if(status==='queued') return 'İsteğin kaydedildi.';
  if(status==='notified') return 'Raşit’e haber verildi.';
  if(status==='awaiting_reply') return 'Raşit’in cevabı bekleniyor.';
  if(status==='validating_reply') return 'Gelen cevap doğrulanıyor.';
  if(status==='ready') return name+' anlatımı hazır.';
  if(status==='watching') return 'Anlatımı izlemeye başladın.';
  if(status==='watched') return 'İzledin; sorunu Raşit’e iletebilirsin.';
  if(status==='question_opened') return 'WhatsApp açıldı; sorun henüz gönderilmiş sayılmaz.';
  if(status==='request_error') return 'İstek şu an iletilemedi. Kaydın duruyor; yeniden deneyebilirsin.';
  if(status==='notification_error') return 'Bildirim gönderilemedi. Kaydın duruyor; yeniden deneyebilirsin.';
  if(status==='invalid_reply') return 'Gelen bağlantı doğrulanamadı. Güvenli bir bağlantı bekleniyor.';
  if(status==='video_unavailable') return 'Bu video artık erişilebilir değil. Raşit’ten yeni bağlantı istenecek.';
  return 'Bu sûre için henüz istek göndermedin.';
}

function quranSearchText(x){
  return zikrNormalizeSearchText([x.nameTr,x.nameAr,String(x.mushafOrder),x.themeTr].join(' '));
}

function quranSearchMatches(x,needle){ return !needle||quranSearchText(x).indexOf(needle)>=0; }

function quranQueryNeedle(){ return zikrNormalizeSearchText(String(ui.quranQuery||'').trim()); }

function quranFilterCounts(){
  var q=ensureQuranJourney(data), needle=quranQueryNeedle();
  var c={all:0,unrequested:0,waiting:0,ready:0,watched:0};
  quranSurahList().forEach(function(x){
    if(!quranSearchMatches(x,needle)) return;
    c.all++; c[quranBucket(quranRequestOf(q,x.id).status)]++;
  });
  return c;
}

function quranFilteredSurahs(){
  var q=ensureQuranJourney(data), filter=quranActiveFilter(), needle=quranQueryNeedle();
  return quranSurahList().filter(function(x){
    if(!quranSearchMatches(x,needle)) return false;
    return filter==='all'||quranBucket(quranRequestOf(q,x.id).status)===filter;
  });
}

function quranJourneyStats(){
  var q=ensureQuranJourney(data), total=quranTotal();
  var s={total:total,unrequested:0,waiting:0,ready:0,watched:0,requested:0};
  quranSurahList().forEach(function(x){
    var b=quranBucket(quranRequestOf(q,x.id).status);
    s[b]++; if(b!=='unrequested') s.requested++;
  });
  s.pct=total?Math.round(s.watched/total*100):0;
  return s;
}

function quranActiveVerse(){
  var mod=(typeof window!=='undefined')&&window.QuranStrikingVersesV1;
  if(!mod||!Array.isArray(mod.verses)||!mod.verses.length) return null;
  var n=mod.verses.length;
  var idx=((Number(ui.quranVerseIdx)||0)%n+n)%n;
  return mod.verses[idx];
}

function quranAdvanceVerseIndex(){ ui.quranVerseIdx=(Number(ui.quranVerseIdx)||0)+1; }

function quranPreviewToneOf(status){
  var b=quranBucket(status);
  return b==='watched'?'done':(b==='ready'?'ready':(b==='waiting'?'wait':'idle'));
}

function quranJourneyCardCopy(status,canReq,req,order,total){
  if(status==='question_opened') return {kicker:'SÛRE · TEFEKKÜR TAMAMLANDI',line:'Bu durak tamam 🦩',ctaClass:'',ctaLabel:'Kütüphaneyi aç',ctaAction:'App.openQuranJourney()',statusLabel:order+'/'+total+' durak'};
  if(status==='watched') return {kicker:'SÛRE · İZLENDİ',line:'Raşit’e sormaya hazır',ctaClass:'is-gold',ctaLabel:'Soru aç',ctaAction:'App.quranJourneyQuestion()',statusLabel:'soru bekliyor'};
  if(status==='watching') return {kicker:'SÛRE · İZLENİYOR',line:'Kaldığı yerden devam et',ctaClass:'is-gold',ctaLabel:'Devam et',ctaAction:'App.quranJourneyWatch()',statusLabel:'izleniyor'};
  if(status==='ready') return {kicker:'SÛRE · ANLATIM HAZIR',line:'Bu sûre için anlatım var',ctaClass:'is-gold',ctaLabel:'İzlemeye başla',ctaAction:'App.quranJourneyWatch()',statusLabel:'hazır'};
  if(status==='submitting') return {kicker:'SÛRE · İLETİLİYOR',line:'İsteğin gönderiliyor…',ctaClass:'',ctaLabel:'İletiliyor…',ctaAction:'',statusLabel:'iletiliyor'};
  if(status==='queued') return {kicker:'SÛRE · İSTEK KAYDEDİLDİ',line:'Raşit’e iletilmeyi bekliyor',ctaClass:'is-outline',ctaLabel:'Durumu aç',ctaAction:'App.openQuranJourney()',statusLabel:'kaydedildi'};
  if(status==='notified'||status==='awaiting_reply'||status==='validating_reply') return {kicker:'SÛRE · CEVAP BEKLENİYOR',line:'Raşit’in cevabı bekleniyor',ctaClass:'is-outline',ctaLabel:'Durumu aç',ctaAction:'App.openQuranJourney()',statusLabel:'cevap bekleniyor'};
  if(status==='video_unavailable'||status==='invalid_reply') return {kicker:'SÛRE · YENİ BAĞLANTI',line:'Güvenli bir bağlantı bekleniyor',ctaClass:'',ctaLabel:'Yeniden iste',ctaAction:'App.quranJourneyRequest()',statusLabel:'bağlantı yenilenecek'};
  if(canReq) return {kicker:'SÛRE · YENİ İSTEK',line:'Raşit’ten anlatım iste',ctaClass:'',ctaLabel:'İste',ctaAction:'App.quranJourneyRequest()',statusLabel:'istenebilir'};
  return {kicker:'SÛRE · İŞLENİYOR',line:'Birazdan tekrar dene',ctaClass:'is-outline',ctaLabel:'Durumu aç',ctaAction:'App.openQuranJourney()',statusLabel:'işleniyor'};
}

function quranViewBodyHTML(){
  return (ui.quranJourneyView==='detail')?quranDetailViewHTML(ui.quranDetailId):quranLibraryViewHTML();
}

function quranVideoThumbUrl(videoId){ return 'https://i.ytimg.com/vi/'+encodeURIComponent(videoId)+'/hqdefault.jpg'; }

function quranEmbedOrigin(){
  try{
    if(typeof location!=='undefined'){
      if(location.origin) return location.origin;
      if(location.protocol&&location.hostname) return location.protocol+'//'+location.hostname+(location.port?(':'+location.port):'');
    }
  }catch(e){}
  return '';
}

function quranNoteKindMeta(kind){
  if(kind==='listen') return {label:'Dinlerken',icon:'headphones'};
  if(kind==='reflection') return {label:'Yansıma',icon:'sparkles'};
  return {label:'İzlerken',icon:'play'};
}

function quranNoteTimeLabel(sec){
  if(sec===null||sec===undefined||sec==='') return '';
  var n=Number(sec); if(!isFinite(n)||n<0) return '';
  n=Math.floor(n); return Math.floor(n/60)+':'+String(n%60).padStart(2,'0');
}

function quranNoteDraftFor(sid){
  if(!ui.quranNoteDraft||ui.quranNoteDraft.surahId!==sid){
    ui.quranNoteDraft={surahId:sid,kind:'watch',timestamp:'',tag:'',text:''};
  }
  return ui.quranNoteDraft;
}

function quranDetailAction(id,req){
  var st=req.status||'idle', call="App.quranJourneySubmit('"+id+"')";
  if(st==='submitting') return {label:'İletiliyor…',disabled:true,icon:'clock',hint:'İstek iletilirken ikinci kayıt oluşturulmaz.'};
  if(st==='queued') return {label:'İstek kaydedildi',disabled:true,icon:'circle-check',hint:'Raşit’e iletildiğinde bu metin değişecek.'};
  if(st==='notified'||st==='awaiting_reply'||st==='validating_reply') return {label:'Raşit’in cevabı bekleniyor',disabled:true,icon:'clock',hint:'Cevap geldiğinde anlatım burada açılır.'};
  if(st==='ready'||st==='watching') return {label:'İzlemeye başla',action:"App.quranJourneyWatch('"+id+"')",icon:'play'};
  if(st==='watched'||st==='question_opened') return {label:'Raşit’e sor',action:"App.quranJourneyQuestion('"+id+"')",icon:'whatsapp'};
  if(st==='video_unavailable'||st==='invalid_reply') return {label:'Yeni bağlantı iste',action:call,icon:'rotate-ccw'};
  if(quranCanRequest(req)) return {label:'Raşit’ten iste',action:call,icon:'send'};
  return {label:'Durum yenileniyor',disabled:true,icon:'clock'};
}

function quranQuestionAction(id,req){
  return {
    label:'Raşit’e sor',
    action:"App.quranJourneyQuestion('"+id+"')",
    icon:'whatsapp',
    disabled:false,
    hint:''
  };
}

function quranPaintHeadLead(){
  try{ var el=doc.getElementById('quran-head-lead'); if(!el) return false; el.innerHTML=quranHeadLeadHTML(); return true; }catch(e){ return false; }
}

function quranPaintView(view,top){
  try{
    var body=doc.getElementById('quran-scroll'); if(!body) return false;
    body.innerHTML=quranViewBodyHTML();
    body.scrollTop=(typeof top==='number')?top:0;
    quranPaintHeadLead();
    // Bir sonraki tam render bu görünümü "yeni sekme" sanıp scroll'u sıfırlamasın.
    lastOverlayView=view;
    return true;
  }catch(e){ return false; }
}

function quranPaintLibraryResults(){
  try{ var el=doc.getElementById('quran-library-results'); if(!el) return false; el.innerHTML=quranLibraryResultsHTML(); return true; }catch(e){ return false; }
}

function quranPaintDetail(){
  try{
    var el=doc.getElementById('quran-detail-region'), x=quranSurah(ui.quranDetailId);
    if(!el||!x) return false;
    el.innerHTML=quranDetailBodyHTML(x);
    return true;
  }catch(e){ return false; }
}

function quranPaintWatchedState(sid){
  try{
    if(!ui.quranJourneyOpen||ui.quranJourneyView!=='detail'||ui.quranDetailId!==sid) return false;
    var x=quranSurah(sid), q=ensureQuranJourney(data), req=quranRequestOf(q,sid);
    var statusEl=doc.getElementById('quran-detail-status');
    var actionEl=doc.getElementById('quran-detail-action-region');
    if(!x||!statusEl||!actionEl) return false;
    var state=quranRowState(req.status||'idle');
    statusEl.className='quran-v2-status is-'+state.tone;
    statusEl.innerHTML='<i class="dot" aria-hidden="true"></i><span><strong>'+esc(state.label)+'</strong><em>'+esc(quranStatusNote(req.status,x.nameTr))+'</em></span>';
    var hasVideoCard=(req.status==='ready'||req.status==='watching'||req.status==='watched'||req.status==='question_opened')&&QURAN_VIDEO_ID_RE.test(String(req.videoId||''));
    actionEl.innerHTML=quranDetailActionsHTML(sid,req,hasVideoCard&&(req.status==='ready'||req.status==='watching'));
    // “Raşit’e sor” artık watching durumunda da çalışır; bu sırada görünür
    // “İzledim” yedeğini kaldırma. Yedek yalnız gerçekten watched/question_opened
    // olduğunda tüketilir.
    var fallback=doc.getElementById('quran-watched-fallback');
    if((req.status==='watched'||req.status==='question_opened')&&fallback&&fallback.remove) fallback.remove();
    return true;
  }catch(e){ return false; }
}

function quranPaintNotes(sid){
  try{
    if(!ui.quranJourneyOpen||ui.quranJourneyView!=='detail'||ui.quranDetailId!==sid) return false;
    var q=ensureQuranJourney(data), x=quranSurah(sid), req=quranRequestOf(q,sid), el=doc.getElementById('quran-video-notes');
    if(!x||!el) return false;
    el.innerHTML=quranVideoNotesInnerHTML(x,req);
    return true;
  }catch(e){ return false; }
}

function quranPaintRefreshButton(){
  try{
    var b=doc.getElementById('quran-refresh-button'); if(!b) return false;
    b.disabled=!!ui.quranRefreshing;
    if(b.setAttribute) b.setAttribute('aria-busy',ui.quranRefreshing?'true':'false');
    if(b.classList) b.classList.toggle('is-spinning',!!ui.quranRefreshing);
    var statusEl=doc.getElementById('quran-remote-status');
    if(statusEl){
      var status=String(ui.quranRemoteStatus||'idle'), tone='idle', label='Uzak kayıt hazır';
      if(status==='checking'){ tone='checking'; label='Kontrol ediliyor…'; }
      else if(status==='updated'){ tone='updated'; label='Yeni cevap alındı'; }
      else if(status==='updated_delivery'){ tone='updated'; label='Yeni teslim kaydı'; }
      else if(status==='updated_warning'){ tone='warning'; label='Cevap alındı · kaynak uyarısı'; }
      else if(status==='error'){ tone='error'; label='Kontrol başarısız'; }
      else if(status==='unchanged'){ label='Güncel'; }
      statusEl.className='quran-v2-remote-status is-'+tone;
      statusEl.textContent=label;
      statusEl.title=String(ui.quranRemoteError||label);
    }
    return true;
  }catch(e){ return false; }
}

function quranRepaintAfterChange(id){
  if(!ui.quranJourneyOpen){ render(); return; }
  if(ui.quranJourneyView==='detail'&&ui.quranDetailId===id&&quranPaintDetail()) return;
  if(ui.quranJourneyView==='library'&&quranPaintLibraryResults()) return;
  render();
}

function quranRecordSubmitOutcome(sid,okFlag,err){
  var q=ensureQuranJourney(data), req=quranRequestOf(q,sid), at=new Date().toISOString();
  var res=quranReduce(req,{type:okFlag?'outbox_written':'outbox_failed',at:at});
  if(res.changed) q.requests[sid]=res.request;
  if(ui.quranSubmittingId===sid) ui.quranSubmittingId='';
  save();
  quranRepaintAfterChange(sid);
  toast(okFlag?'İsteğin kaydedildi.':'İstek şu an iletilemedi ('+quranOutboxErrorLabel(err)+'). Kaydın duruyor; yeniden deneyebilirsin.');
}

function quranSettleSubmit(sid,okFlag,err){
  if(okFlag){ quranRecordSubmitOutcome(sid,true,null); return; }
  var q=ensureQuranJourney(data), req=quranRequestOf(q,sid);
  var rid=(req&&typeof req.requestId==='string')?req.requestId:'';
  var s=(typeof window!=='undefined')?sync:null;
  if(!rid||!s||typeof s.confirmQuranRequest!=='function'){ quranRecordSubmitOutcome(sid,false,err); return; }
  var settled=false;
  function done(confirmed){ if(settled) return; settled=true; quranRecordSubmitOutcome(sid,confirmed,err); }
  // Doğrulama da asılı kalabilir; o zaman ilk hükme dönülür (güvenli taraf:
  // "iletilemedi" + tekrar deneme açık). Doğrulama sürerken quranSubmittingId
  // hâlâ dolu olduğu için çift dokunma engeli de bozulmaz.
  try{ defer(function(){ done(false); },QURAN_CONFIRM_TIMEOUT_MS); }catch(e){}
  try{
    s.confirmQuranRequest(rid,function(cerr,r){ done(!cerr&&!!(r&&r.found===true)); });
  }catch(e){ done(false); }
}

function App_quranJourneyRequest(){ App.quranJourneySubmit(ensureQuranJourney(data).activeSurahId); };

function App_quranJourneyWatch(id){
  // Hub kartı (quranJourneyCardCopy) bu eylemi id'siz çağırır (ready/watching
  // durumunda "İzlemeye başla"/"Devam et"); id yoksa aktif yolculuğa düş —
  // aksi halde düğme sessizce hiçbir şey yapmazdı (gerçek regresyon, düzeltildi).
  var q=ensureQuranJourney(data);
  var sid=quranSafeSurahId(id||q.activeSurahId); if(!sid) return;
  var req=quranRequestOf(q,sid);
  if(!QURAN_VIDEO_ID_RE.test(String(req.videoId||''))) return;
  // İzlenmiş bir anlatım yeniden açılıyorsa YouTube'un oturumdan hatırladığı
  // konumu değil kesin olarak 0. saniyeyi kullan. İlk izleme normal başlar.
  _quranYtRestartSurahId=(req.status==='watched'||req.status==='question_opened')?sid:'';
  ui.quranPlayerLoadedId=sid;
  var res=quranReduce(req,{type:'watch_start',at:new Date().toISOString()});
  if(res.changed){ q.requests[sid]=res.request; save(); }
  if(!quranPaintDetail()) render();
  // QY-13: iframe artık DOM'da — gerçek ENDED algısı için oynatıcıyı bağla.
  quranAttachPlayer(sid);
};

function App_quranMarkWatched(id){
  var sid=quranSafeSurahId(id); if(!sid) return;
  var q=ensureQuranJourney(data), req=quranRequestOf(q,sid);
  var res=quranReduce(req,{type:'watch_complete',at:new Date().toISOString()});
  if(!res.changed) return;
  q.requests[sid]=res.request; save();
  // Çalışan iframe'i yeniden kurmak videoyu başa sarar. Oynatıcı bu sûre için
  // hâlâ DOM'daysa yalnız durum/CTA alanlarını güncelle; iframe referansı ve
  // oynatma zamanı aynen korunsun. DOM yoksa güvenli tam boyamaya düş.
  if(!(ui.quranPlayerLoadedId===sid&&quranPaintWatchedState(sid))){ if(!quranPaintDetail()) render(); }
  var x=quranSurah(sid);
  toast('Mâşallah · '+(x?x.nameTr:'anlatım')+' izlendi olarak işaretlendi.');
};

function quranAskMessage(x){
  var name=x?x.nameTr:'bu sûre', order=x?x.revelationOrder:'';
  return 'Selam Raşit, Kur’an Yolculuğu’nda '+name+' Sûresi\n('+order+'. durak) hakkında sana şunu sormak istiyorum:';
}

function App_quranJourneyQuestion(id){
  var q=ensureQuranJourney(data);
  var sid=quranSafeSurahId(id||q.activeSurahId); if(!sid) return;
  var req=quranRequestOf(q,sid);
  var x=quranSurah(sid);
  var url='https://wa.me/'+QURAN_WHATSAPP_NUMBER+'?text='+encodeURIComponent(quranAskMessage(x));
  var res=quranReduce(req,{type:'question_open',at:new Date().toISOString()});
  if(res.changed){ q.requests[sid]=res.request; save(); }
  try{ if(typeof window!=='undefined'&&typeof window.open==='function') window.open(url,'_blank','noopener,noreferrer'); }catch(e){}
  // Soru eylemi video oynarken de modal içinde görünür kalabilir. Tam
  // quranPaintDetail() iframe'i yeniden kurup oynatma konumunu sıfırlardı;
  // yalnız durum/eylem bölgelerini boyayarak çalışan oynatıcıyı koru.
  if(!quranPaintWatchedState(sid)) quranRepaintAfterChange(sid);
  toast('WhatsApp açıldı.');
};

function quranHasRemoteRequest(){
  var q=ensureQuranJourney(data), reqs=q&&q.requests?q.requests:{};
  return Object.keys(reqs).some(function(sid){
    var req=reqs[sid];
    return req&&req.requestId&&req.status!=='question_opened';
  });
}

function quranRemoteErrorText(result,err){
  if(err) return 'Ağ veya yetki hatası';
  var errors=[];
  if(result&&Array.isArray(result.deliveryErrors)) errors=errors.concat(result.deliveryErrors);
  if(result&&Array.isArray(result.responseErrors)) errors=errors.concat(result.responseErrors);
  return errors.length?'Uzak kayıt doğrulanamadı ('+errors.length+' uyarı)':'';
}

function App_refreshQuranUpdates(silent,force){
  if(ui.quranRefreshing) return;
  if(!force&&!quranHasRemoteRequest()){
    ui.quranRemoteStatus='unchanged'; ui.quranRemoteError='Bekleyen Kur’an isteği yok'; ui.quranRemoteCheckedAt=new Date().toISOString();
    quranPaintRefreshButton();
    if(!silent) toast('Kontrol edilecek bekleyen Kur’an isteği yok.');
    return;
  }
  var s=(typeof window!=='undefined')?sync:null;
  if(!s||typeof s.pullQuranUpdates!=='function'){
    ui.quranRemoteStatus='error'; ui.quranRemoteError='Senkron yapılandırılmamış'; ui.quranRemoteCheckedAt=new Date().toISOString(); quranPaintRefreshButton();
    if(!silent) toast('Senkron yapılandırılmamış; güncelleme kontrol edilemedi.');
    return;
  }
  ui.quranRefreshing=true;
  ui.quranRemoteStatus='checking'; ui.quranRemoteError='';
  quranPaintRefreshButton();
  var settled=false;
  function settle(fn){ if(settled) return; settled=true; ui.quranRefreshing=false; ui.quranRemoteCheckedAt=new Date().toISOString(); quranPaintRefreshButton(); fn(); }
  try{ defer(function(){ settle(function(){ ui.quranRemoteStatus='error'; ui.quranRemoteError='Uzak kayıt zaman aşımına uğradı'; quranPaintRefreshButton(); if(!silent) toast('Güncelleme kontrol edilemedi; bağlantını kontrol edip tekrar deneyebilirsin.'); }); },QURAN_REFRESH_TIMEOUT_MS); }catch(e){}
  try{
    s.pullQuranUpdates(function(err,result){
      settle(function(){
        if(err||!result){ ui.quranRemoteStatus='error'; ui.quranRemoteError=quranRemoteErrorText(result,err)||'Uzak kayıt okunamadı'; if(!silent) toast('Güncelleme kontrol edilemedi; bağlantını kontrol edip tekrar deneyebilirsin.'); quranPaintRefreshButton(); return; }
        var remoteResult=quranApplyRemoteUpdates(result.delivery,result.responses), changed=!!(remoteResult&&remoteResult.changed);
        if(changed){ save(); quranRepaintAfterChange(ui.quranJourneyView==='detail'?ui.quranDetailId:''); if(!silent) toast(remoteResult.responseChanged?'Kur’an cevabı geldi.':'Kur’an teslim kaydı güncellendi.'); }
        var warning=quranRemoteErrorText(result,null);
        ui.quranRemoteStatus=warning?(changed?'updated_warning':'error'):(changed?(remoteResult.responseChanged?'updated':'updated_delivery'):'unchanged');
        ui.quranRemoteError=warning||'';
        quranPaintRefreshButton();
        if(!changed&&!silent&&!warning) toast('Yeni bir güncelleme yok.');
        else if(warning&&!silent) toast(changed?'Yanıt alındı; kaynakta doğrulama uyarısı var.':'Güncelleme doğrulanamadı; tekrar deneyebilirsin.');
      });
    });
  }catch(e){ settle(function(){ ui.quranRemoteStatus='error'; ui.quranRemoteError='Uzak kayıt okunamadı'; quranPaintRefreshButton(); }); }
};

function quranLockBodyScroll(){
  if(_quranBodyLocked||typeof doc==='undefined'||!doc.body) return;
  _quranBodyPrevOverflow=doc.body.style.overflow||'';
  doc.body.style.overflow='hidden';
  _quranBodyLocked=true;
}

function quranUnlockBodyScroll(){
  if(!_quranBodyLocked||typeof doc==='undefined'||!doc.body) return;
  doc.body.style.overflow=_quranBodyPrevOverflow;
  _quranBodyLocked=false;
}

function App_quranUiState(){
  return {
    open:!!ui.quranJourneyOpen,view:ui.quranJourneyView,detailId:ui.quranDetailId,
    query:ui.quranQuery,filter:ui.quranFilter,filtersOpen:!!ui.quranFiltersOpen,
    listScroll:ui.quranListScroll,submittingId:ui.quranSubmittingId
  };
};
  }
  var NS=window.SeymaQuran;
  if(!NS) throw new Error('MON2-06: SeymaQuran yüzey bölümü registry bulunamadı');
  NS.quranCatalog=quranCatalog;
  NS.quranSurahList=quranSurahList;
  NS.quranSurah=quranSurah;
  NS.quranTotal=quranTotal;
  NS.quranSurahName=quranSurahName;
  NS.quranPlaceLabel=quranPlaceLabel;
  NS.quranPlaceDisputed=quranPlaceDisputed;
  NS.quranRequestOf=quranRequestOf;
  NS.quranBucket=quranBucket;
  NS.quranActiveFilter=quranActiveFilter;
  NS.quranFilterLabel=quranFilterLabel;
  NS.quranRowState=quranRowState;
  NS.quranStatusNote=quranStatusNote;
  NS.quranSearchText=quranSearchText;
  NS.quranSearchMatches=quranSearchMatches;
  NS.quranQueryNeedle=quranQueryNeedle;
  NS.quranFilterCounts=quranFilterCounts;
  NS.quranFilteredSurahs=quranFilteredSurahs;
  NS.quranJourneyStats=quranJourneyStats;
  NS.quranActiveVerse=quranActiveVerse;
  NS.quranAdvanceVerseIndex=quranAdvanceVerseIndex;
  NS.quranPreviewToneOf=quranPreviewToneOf;
  NS.quranJourneyCardCopy=quranJourneyCardCopy;
  NS.quranViewBodyHTML=quranViewBodyHTML;
  NS.quranVideoThumbUrl=quranVideoThumbUrl;
  NS.quranEmbedOrigin=quranEmbedOrigin;
  NS.quranNoteKindMeta=quranNoteKindMeta;
  NS.quranNoteTimeLabel=quranNoteTimeLabel;
  NS.quranNoteDraftFor=quranNoteDraftFor;
  NS.quranDetailAction=quranDetailAction;
  NS.quranQuestionAction=quranQuestionAction;
  NS.quranPaintHeadLead=quranPaintHeadLead;
  NS.quranPaintView=quranPaintView;
  NS.quranPaintLibraryResults=quranPaintLibraryResults;
  NS.quranPaintDetail=quranPaintDetail;
  NS.quranPaintWatchedState=quranPaintWatchedState;
  NS.quranPaintNotes=quranPaintNotes;
  NS.quranPaintRefreshButton=quranPaintRefreshButton;
  NS.quranRepaintAfterChange=quranRepaintAfterChange;
  NS.quranRecordSubmitOutcome=quranRecordSubmitOutcome;
  NS.quranSettleSubmit=quranSettleSubmit;
  NS.quranJourneyRequest=App_quranJourneyRequest;
  NS.quranJourneyWatch=App_quranJourneyWatch;
  NS.quranMarkWatched=App_quranMarkWatched;
  NS.quranAskMessage=quranAskMessage;
  NS.quranJourneyQuestion=App_quranJourneyQuestion;
  NS.quranHasRemoteRequest=quranHasRemoteRequest;
  NS.quranRemoteErrorText=quranRemoteErrorText;
  NS.refreshQuranUpdates=App_refreshQuranUpdates;
  NS.quranLockBodyScroll=quranLockBodyScroll;
  NS.quranUnlockBodyScroll=quranUnlockBodyScroll;
  NS.quranUiState=App_quranUiState;
  NS.registerQuranSurface=registerQuranSurface;
  NS.isQuranSurfaceReady=isQuranSurfaceReady;
})();
