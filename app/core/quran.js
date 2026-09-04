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
