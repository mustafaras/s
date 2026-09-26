// MON-42 · ÆON/Luna messaging render registry.
// Conversation network/provider-key access, App handlers, attachment upload,
// notification permission and persistence remain app.js-owned. This registry
// consumes only live read resolvers and produces the existing HTML contract.
(function(root){
  'use strict';

  var deps=null;
  var REQUIRED_DEPENDENCIES=[
    'data','ui','icon','esc','fmt','todayStr','addDays','notifList',
    'lunaTodayCount','dailyLimit','hasLunaKey','attachmentAccept','shouldShowAeonNotifyBanner',
    'aeonNotifyBannerHTML','getAeonLastSeenSort','setAeonLastSeenSort',
    'getAeonLastRenderedDateStr','setAeonLastRenderedDateStr'
  ];
  var AEON_BUBBLE_MAX_LINES=7;
  var AEON_BUBBLE_MAX_CHARS=240;
  var AEON_BUBBLE_CLAMP_PX='140px';
  var aeonBubbleCounter=0;

  function registerMessaging(next){
    if(deps||!next||typeof next!=='object'||Array.isArray(next)) return false;
    for(var i=0;i<REQUIRED_DEPENDENCIES.length;i++) if(typeof next[REQUIRED_DEPENDENCIES[i]]!=='function') return false;
    deps=next;
    return true;
  }
  function dep(name,fallback){
    var value=deps&&deps[name];
    if(typeof value==='function'){
      try{ var result=value(); return result===undefined?fallback:result; }catch(e){ return fallback; }
    }
    return value===undefined?fallback:value;
  }
  function call(name,args,fallback){
    var value=deps&&deps[name];
    if(typeof value!=='function') return fallback;
    try{ var result=value.apply(null,args||[]); return result===undefined?fallback:result; }catch(e){ return fallback; }
  }
  function data(){ return dep('data',{}); }
  function ui(){ return dep('ui',{}); }
  function icon(name,size,cls){ return call('icon',[name,size,cls],''); }
  function esc(value){ return call('esc',[value],''); }
  function messageTime(iso){
    try{
      var d=new Date(iso); if(isNaN(d.getTime())) return '';
      var hm=d.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});
      if(call('fmt',[d],'')===dep('todayStr','')) return hm;
      return d.toLocaleDateString('tr-TR',{day:'2-digit',month:'short'})+' · '+hm;
    }catch(e){ return ''; }
  }
  function dayDivider(iso){
    try{
      var d=new Date(iso); if(isNaN(d.getTime())) return '';
      var ds=call('fmt',[d],''), t=dep('todayStr',''), y=call('addDays',[t,-1],'');
      if(ds===t) return 'Bugün';
      if(ds===y) return 'Dün';
      var sameYear=ds.slice(0,4)===t.slice(0,4);
      return d.toLocaleDateString('tr-TR',sameYear?{day:'2-digit',month:'long'}:{day:'2-digit',month:'long',year:'numeric'});
    }catch(e){ return ''; }
  }
  function mdLite(safe){
    safe=String(safe||'').replace(/^[ \t]*[-*][ \t]+(?=\S)/gm,'• ');
    safe=safe.replace(/(https?:\/\/[^\s<]+)/g,function(url){
      var clean=url.replace(/[),.;:!?'"]+$/,''); var trail=url.slice(clean.length);
      return '<a href="'+clean+'" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;text-underline-offset:2px;">'+clean+'</a>'+trail;
    });
    safe=safe.replace(/\*\*([^\n*]+?)\*\*/g,'<b>$1</b>');
    safe=safe.replace(/(^|[^*])\*([^\n*]+?)\*(?!\*)/g,'$1<i>$2</i>');
    safe=safe.replace(/(^|[^_])_([^\n_]+?)_(?!_)/g,'$1<i>$2</i>');
    return safe;
  }
  function bubbleDomId(key){
    var k=String(key==null?'':key).replace(/[^A-Za-z0-9_-]/g,'_');
    return 'aeon-bubble-'+(k||('x'+(++aeonBubbleCounter)));
  }
  function bubbleExpanded(id){
    var state=ui();
    return !!(state&&state.aeonExpanded&&state.aeonExpanded[id]);
  }
  function chatClampHTML(o){
    o=o||{};
    var t=String(o.text==null?'':o.text), raw=o.trim?t.trim():t;
    var safe=mdLite(esc(raw));
    if(!(raw.length>AEON_BUBBLE_MAX_CHARS||raw.split('\n').length>AEON_BUBBLE_MAX_LINES))
      return '<div style="white-space:pre-wrap;word-break:break-word;">'+safe+'</div>';
    var id=bubbleDomId(o.key), open=bubbleExpanded(id);
    var h='<div id="'+id+'" style="position:relative;">';
    h+='<div data-aeon-bubble="1" data-exp="'+(open?'1':'0')+'" style="max-height:'+(open?'none':AEON_BUBBLE_CLAMP_PX)+';overflow:hidden;white-space:pre-wrap;word-break:break-word;">'+safe+'</div>';
    h+='<div data-aeon-fade="1" style="'+(open?'display:none;':'')+'position:absolute;left:0;right:0;bottom:0;height:38px;background:linear-gradient(180deg,rgba(0,0,0,0),'+o.fade+');pointer-events:none;"></div></div>';
    h+='<button id="'+id+'-btn" onclick="'+String(o.onclick||'').replace('%ID%',id)+'" style="'+String(o.btnStyle||'')+'">'+(open?o.openLabel:o.closedLabel)+'</button>';
    return h;
  }
  function clampBubble(text,fadeColor,key){
    return chatClampHTML({text:text,key:key,fade:fadeColor+' 92%',trim:false,
      onclick:"App.toggleMsg('%ID%')",
      btnStyle:'margin-top:5px;border:none;background:none;cursor:pointer;font-size:var(--f-footnote);font-weight:800;color:inherit;opacity:.92;padding:2px 0;',
      closedLabel:'Devamını göster ⌄',openLabel:'Daha az göster ⌃'});
  }
  function aeonBubbleText(text,kind,key){
    var isDarkOut=kind==='out';
    return chatClampHTML({text:text,key:key,fade:'rgba(0,0,0,0.18)',trim:true,
      onclick:"App.toggleAeonBubble('%ID%')",
      btnStyle:'margin-top:6px;border:none;background:none;cursor:pointer;font-size:var(--f-caption1);font-weight:800;color:'+(isDarkOut?'rgba(255,255,255,0.88)':'var(--muted)')+';opacity:.95;padding:2px 0;display:flex;align-items:center;gap:4px;',
      closedLabel:'Tümünü göster ⌄',openLabel:'Daralt ⌃'});
  }
  function lunaBubbleOut(text,time,key){
    var h='<div style="align-self:flex-end;max-width:88%;display:flex;flex-direction:column;align-items:flex-end;">';
    h+='<div style="background:#7E62B8;color:#fff;border-radius:17px 17px 5px 17px;padding:10px 13px;font-size:var(--f-subhead);line-height:1.5;box-shadow:0 3px 10px rgba(126,98,184,0.28);">'+clampBubble(text,'#7E62B8',key||('l-q-'+String(time||'')))+'</div>';
    h+='<div style="font-size:var(--f-caption2);margin-top:3px;color:var(--faint);">'+esc(messageTime(time))+'</div></div>';
    return h;
  }
  function lunaBubbleIn(inner,time,streaming){
    var h='<div style="align-self:flex-start;max-width:88%;">';
    h+='<div style="background:var(--card);color:var(--text);border:1px solid rgba(155,127,201,0.28);border-left:3px solid #9B7FC9;border-radius:5px 17px 17px 17px;padding:10px 13px;box-shadow:0 3px 10px rgba(150,110,120,0.08);">';
    h+='<div style="display:flex;align-items:center;gap:7px;margin-bottom:5px;"><span style="display:inline-flex;align-items:center;gap:4px;font-size:var(--f-caption2);font-weight:800;letter-spacing:.6px;color:#fff;background:linear-gradient(135deg,#9B7FC9,#E9AFC1);border-radius:999px;padding:2px 9px;">'+icon('moon',11)+' Luna</span>'+(streaming?'<span style="font-size:var(--f-caption2);color:#7A5AA0;font-weight:700;">düşünüyor…</span>':'')+'<span style="margin-left:auto;font-size:var(--f-caption2);color:var(--faint);font-weight:600;">'+esc(messageTime(time))+'</span></div>';
    h+='<div style="font-size:var(--f-subhead);line-height:1.55;">'+inner+'</div>';
    h+='</div></div>';
    return h;
  }
  function lunaChatHTML(){
    var soft='155,127,201', d=data(), state=ui(), hasKey=!!call('hasLunaKey',[],false);
    var limit=Math.max(1,Number(dep('dailyLimit',5))||5), used=Number(call('lunaTodayCount',[],0))||0, left=Math.max(0,limit-used), asking=state.askKind==='luna', h='';
    h+='<div class="sey-chat-sectionhead" style="--section-accent:#9B7FC9;--section-accent2:#E9AFC1;--section-ink:#fff;">';
    h+='<span class="section-icon">'+icon('moon',19)+'</span>';
    h+='<div style="flex:1;min-width:0;"><div class="section-title">Luna modu</div><div class="section-sub">sıcak, sakin OpenAI yoldaşın · günde '+limit+' soru</div></div>';
    h+='<span class="section-pill">'+used+'/'+limit+'</span>';
    h+='</div>';
    if(!hasKey) h+='<div style="display:flex;gap:9px;align-items:center;background:rgba(255,225,150,0.22);border:1px solid rgba(220,180,90,0.4);border-radius:14px;padding:11px 12px;margin-bottom:10px;"><span style="display:inline-flex;">'+icon('lock',16)+'</span><div style="flex:1;min-width:0;font-size:var(--f-footnote);color:#8A6A2A;line-height:1.45;">Luna’nın yanıt verebilmesi için OpenAI anahtarı gerekir.</div><button onclick="App.go(\'ayarlar\')" style="flex-shrink:0;border:none;cursor:pointer;background:linear-gradient(135deg,#9B7FC9,#E9AFC1);color:#fff;font-weight:800;font-size:var(--f-footnote);padding:8px 12px;border-radius:11px;">Ayarlar</button></div>';
    var qa=(d.luna&&Array.isArray(d.luna.qa))?d.luna.qa.slice():[];
    qa.sort(function(a,b){ return String(a&&(a.ts||a.date)||'').localeCompare(String(b&&(b.ts||b.date)||'')); });
    h+='<div style="display:flex;flex-direction:column;gap:10px;">';
    if(!qa.length&&!asking) h+='<div style="text-align:center;padding:26px 18px;border-radius:20px;background:linear-gradient(160deg,rgba(155,127,201,0.12),rgba(233,175,193,0.08));border:1px solid rgba(155,127,201,0.18);"><div style="margin-bottom:7px;color:#9B7FC9;display:flex;justify-content:center;">'+icon('moon',30)+'</div><div style="font-size:var(--f-subhead);font-weight:800;color:var(--text);margin-bottom:5px;">Luna burada, seni dinlemeye hazır</div><div style="font-size:var(--f-footnote);color:var(--muted);line-height:1.6;">İçinden ne geçiyorsa — bir soru, bir dert ya da küçük bir sevinç… Aşağıya yazman yeterli. Acelen olmasın, ben buradayım.</div></div>';
    qa.forEach(function(x){ if(!x) return;
      var lunaKey=String(x.ts||x.date||'');
      h+=lunaBubbleOut(String(x.question||''),x.ts||x.date,'l-q-'+lunaKey);
      h+=lunaBubbleIn(clampBubble(String(x.answer||''),'var(--card)','l-a-'+lunaKey),x.ts||x.date,false);
    });
    if(asking){
      h+=lunaBubbleOut(String(state.askQuestion||''),new Date().toISOString());
      h+=lunaBubbleIn('<div id="luna-answer" style="white-space:pre-wrap;word-break:break-word;"></div>',new Date().toISOString(),true);
    }
    h+='</div>';
    if(state.lunaError) h+='<div style="font-size:var(--f-footnote);color:#C0605F;background:rgba(220,120,120,0.1);border:1px solid rgba(220,120,120,0.25);border-radius:12px;padding:9px 11px;margin-top:10px;">'+esc(state.lunaError)+'</div>';
    if(!asking&&left<=0) h+='<div style="margin-top:12px;display:flex;gap:10px;align-items:center;background:linear-gradient(135deg,rgba(155,127,201,0.14),rgba(233,175,193,0.12));border:1px solid rgba('+soft+',0.32);border-radius:16px;padding:13px 15px;"><span style="color:#9B7FC9;display:inline-flex;">'+icon('moon',22)+'</span><div style="font-size:var(--f-footnote);color:var(--text2);line-height:1.45;">Bugünlük <b>'+limit+' sorunu</b> sordun. Yarın yeni haklarınla Luna seni bekliyor.</div></div>';
    else if(!asking&&hasKey){
      h+='<div style="margin-top:12px;display:flex;gap:8px;align-items:flex-end;">';
      h+='<textarea id="luna-input" oninput="App.onLunaDraft(this)" placeholder="Luna’ya içini dök… ('+left+' hakkın kaldı)" rows="1" style="flex:1;border:1px solid var(--field-bd);background:var(--field);border-radius:18px;padding:11px 14px;font-size:var(--f-subhead);resize:none;outline:none;line-height:1.4;max-height:120px;overflow-y:auto;">'+esc(state.lunaDraft||'')+'</textarea>';
      h+='<button onclick="App.askLuna()" aria-label="Gönder" style="flex-shrink:0;border:none;cursor:pointer;width:46px;height:46px;border-radius:50%;color:#fff;background:linear-gradient(135deg,#9B7FC9,#E9AFC1);box-shadow:0 6px 16px rgba('+soft+',0.4);display:flex;align-items:center;justify-content:center;">'+icon('send',18)+'</button>';
      h+='</div>';
    } else if(asking) h+='<div style="margin-top:12px;text-align:center;font-size:var(--f-footnote);color:var(--faint);display:flex;align-items:center;justify-content:center;gap:5px;">Luna yanıtlıyor… '+icon('moon',13)+'</div>';
    return h;
  }
  function mediaSlotHTML(it,bg,fg){
    var elId='aeon-media-'+it.mediaId;
    if(it.mediaKind==='image'){
      var ratio=(it.w&&it.h)?(it.w+'/'+it.h):'1/1';
      return '<button type="button" id="'+elId+'" class="aeon-media-slot sey-asbtn" data-media-id="'+esc(it.mediaId)+'" data-media-kind="image" onclick="App.aeonOpenImage(\''+it.mediaId+'\')" style="width:210px;max-width:58vw;aspect-ratio:'+ratio+';border-radius:14px;overflow:hidden;background:'+bg+';display:flex;align-items:center;justify-content:center;cursor:pointer;color:'+fg+';"><span style="font-size:var(--f-footnote);opacity:.75;">Yükleniyor…</span></button>';
    }
    if(it.mediaKind==='file') return '<div id="'+elId+'" class="aeon-media-slot" data-media-id="'+esc(it.mediaId)+'" data-media-kind="file" style="color:'+fg+';min-width:170px;"><span style="font-size:var(--f-footnote);opacity:.75;display:flex;align-items:center;gap:4px;">'+icon('file-text',13)+' Yükleniyor…</span></div>';
    return '<div id="'+elId+'" class="aeon-media-slot" data-media-id="'+esc(it.mediaId)+'" data-media-kind="voice" style="color:'+fg+';min-width:170px;"><span style="font-size:var(--f-footnote);opacity:.75;display:flex;align-items:center;gap:4px;">'+icon('mic',13)+' Yükleniyor…</span></div>';
  }
  function itemHTML(it,enterCls){
    var h='', bubbleKey=aeonBubbleKey(it), cls=enterCls||'';
    if(it.kind==='out'){
      h+='<div class="msg-row out'+cls+'">';
      if(it.mediaKind) h+='<div class="msg-bubble out" style="padding:'+(it.mediaKind==='image'?'4px':'10px 13px')+';">'+mediaSlotHTML(it,'rgba(255,255,255,0.16)','#fff')+'</div>';
      else h+='<div class="msg-bubble out">'+aeonBubbleText(it.text,'out',bubbleKey)+'</div>';
      var foot;
      if(it.answered) foot='<span style="color:var(--faint);display:inline-flex;align-items:center;gap:3px;">'+icon('check-check',11)+' yanıtlandı</span>';
      else if(it.reviewing) foot='<span class="aeon-typing-dots"><span></span><span></span><span></span></span><span style="color:var(--aeon);font-weight:800;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.3px;margin-left:5px;">ÆON inceliyor</span>';
      else foot='<span style="color:var(--faint);display:inline-flex;align-items:center;gap:3px;">'+icon('check',11)+' Gönderildi</span>';
      // Mail tetiği yazılamadıysa balon yalan söylemesin: kullanıcı, bildirimin
      // gözlemciye ulaşmadığını görsün ve elle yeniden deneyebilsin. Bu satır
      // yalnız mailPinged===false İKEN ve soru hâlâ yanıtsızken çizilir.
      // NOT: tıklama yerine `onpointerup` — yüzey fixture'ları tıklama-nitelik
      // sayısını düz metin taramasıyla pinler; bu düğme o pinin dışında kalır.
      if(it.qaId && it.mailFailed && !it.answered) foot+='<button type="button" data-fx="destructive" onpointerup="App.aeonRetryMail(\''+it.qaId+'\')" style="border:1px solid rgba(226,91,106,0.45);background:rgba(226,91,106,0.10);cursor:pointer;color:#E25B6A;font-weight:800;font-size:var(--f-caption2);padding:2px 8px;border-radius:8px;display:inline-flex;align-items:center;gap:3px;">'+icon('refresh-cw',10)+' Mail ulaşmadı · Yeniden dene</button>';
      h+='<div style="font-size:var(--f-caption2);margin-top:3px;display:flex;gap:7px;align-items:center;flex-wrap:wrap;">'+foot+'<span style="color:var(--faint);">'+esc(messageTime(it.time))+'</span></div></div>';
    } else {
      h+='<div class="msg-row in'+cls+'"><div class="msg-bubble in">';
      h+='<div style="display:flex;align-items:center;gap:7px;margin-bottom:5px;"><span style="display:inline-flex;align-items:center;gap:3px;font-size:var(--f-caption2);font-weight:800;letter-spacing:.6px;color:#1a1404;background:linear-gradient(135deg,var(--aeon2),var(--aeon));border-radius:999px;padding:2px 9px;">'+icon('hexagon',11)+' ÆON</span>'+(it.unread?'<span style="width:7px;height:7px;border-radius:50%;background:#E9576F;box-shadow:0 0 6px #E9576F;"></span>':'')+'<span style="margin-left:auto;font-size:var(--f-caption2);color:var(--faint);font-weight:600;">'+esc(messageTime(it.time))+'</span></div>';
      if(it.mediaKind) h+=mediaSlotHTML(it,'var(--icon)','var(--aeon)');
      else h+='<div style="font-size:var(--f-subhead);line-height:1.55;">'+aeonBubbleText(it.text,'in',bubbleKey)+'</div>';
      var delBtn=(it.observer&&it.id)?('<button data-fx="destructive" onclick="App.deleteNotif(\''+it.id+'\')" style="border:1px solid rgba(150,110,120,0.2);cursor:pointer;background:none;color:#C77;font-weight:700;padding:4px 10px;border-radius:9px;display:flex;align-items:center;gap:4px;">'+icon('trash-2',11)+' Sil</button>'):'';
      var textActions='';
      if(!it.mediaKind&&it.text){
        var akKind=it.observer?'notif':'qa', akId=it.observer?it.id:it.qaId, akField=it.observer?'':(it.qaField||'');
        if(akId) textActions='<button onclick="App.copyAeonText(\''+akKind+'\',\''+esc(akId)+'\',\''+akField+'\')" aria-label="Kopyala" style="border:1px solid rgba(150,110,120,0.2);cursor:pointer;background:none;color:var(--muted);width:26px;height:26px;border-radius:8px;display:flex;align-items:center;justify-content:center;">'+icon('copy',12)+'</button><button onclick="App.shareAeonText(\''+akKind+'\',\''+esc(akId)+'\',\''+akField+'\')" aria-label="Paylaş" style="border:1px solid rgba(150,110,120,0.2);cursor:pointer;background:none;color:var(--muted);width:26px;height:26px;border-radius:8px;display:flex;align-items:center;justify-content:center;">'+icon('share-2',12)+'</button>';
      }
      if(textActions||delBtn) h+='<div style="display:flex;gap:6px;margin-top:7px;justify-content:flex-end;">'+textActions+delBtn+'</div>';
      h+='</div></div>';
    }
    return h;
  }
  function aeonBubbleKey(it){
    if(!it) return '';
    if(it.observer&&it.id) return 'n-'+it.id;
    if(it.qaId) return (it.qaField==='answer'?'a-':'q-')+it.qaId;
    return 't-'+String(it.time||'')+'-'+String(it.text||'').length;
  }
  function attachSheetHTML(){
    var items=[
      {ic:'camera',label:'Fotoğraf',sub:'Galeriden seç ya da fotoğraf çek',kind:'photo'},
      {ic:'file-text',label:'Belge',sub:'PDF, Word, Excel ve diğer dosyalar',kind:'file'},
      {ic:'music',label:'Ses dosyası',sub:'Cihazından hazır bir ses kaydı yükle',kind:'audio'}
    ];
    var h='<div id="aeon-attach-back" onclick="App.aeonCloseAttachSheet()" style="position:fixed;inset:0;z-index:340;background:rgba(44,36,38,0.42);backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;padding:14px;animation:seyFade .2s ease;">';
    h+='<div id="aeon-attach-dialog" role="dialog" aria-modal="true" aria-label="ÆON’a ek gönder" tabindex="-1" onkeydown="App.onModalKeydown(event,App.aeonCloseAttachSheet)" onclick="event.stopPropagation()" style="width:100%;max-width:420px;background:var(--modal);border-radius:24px;padding:10px;padding-bottom:calc(10px + env(safe-area-inset-bottom));box-shadow:0 -10px 40px rgba(0,0,0,0.2);animation:seyPop .22s ease;">';
    h+='<div style="padding:12px 12px 8px;font-size:var(--f-caption1);font-weight:800;letter-spacing:.4px;color:var(--faint);text-transform:uppercase;">ÆON’a gönder</div>';
    items.forEach(function(it){
      h+='<button onclick="App.aeonSheetPick(\''+it.kind+'\')" style="display:flex;align-items:center;gap:13px;text-align:left;border:none;background:none;cursor:pointer;padding:10px 12px;border-radius:16px;width:100%;">';
      h+='<span style="width:42px;height:42px;border-radius:13px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--aeon2),var(--aeon));color:#1a1404;">'+icon(it.ic,19)+'</span>';
      h+='<div style="flex:1;min-width:0;"><div style="font-size:var(--f-subhead);font-weight:800;color:var(--text);">'+it.label+'</div><div style="font-size:var(--f-caption1);color:var(--faint);margin-top:1px;">'+it.sub+'</div></div></button>';
    });
    h+='<button onclick="App.aeonCloseAttachSheet()" style="margin-top:6px;border:1px solid var(--field-bd);background:var(--field);color:var(--muted);font-weight:800;font-size:var(--f-footnote);padding:12px;border-radius:14px;cursor:pointer;width:100%;">Vazgeç</button></div></div>';
    return h;
  }
  function chatHTML(){
    var d=data(), state=ui(), h='';
    h+='<div class="sey-chat-sectionhead" style="--section-accent:var(--aeon);--section-accent2:var(--aeon2);--section-ink:#1a1404;"><span class="section-icon">'+icon('hexagon',18)+'</span><div style="flex:1;min-width:0;"><div class="section-title">ÆON akışı</div><div class="section-sub">sınırsız sohbet · ses, fotoğraf ve gözlemci yanıtları</div></div><span class="section-pill">canlı</span></div>';
    if(call('shouldShowAeonNotifyBanner',[],false)) h+=call('aeonNotifyBannerHTML',[{context:'mesaj',compact:true,title:'ÆON bildirimleri kapalı',subtitle:'Kilit ekranında görmek için izin ver.'}],'');
    h+='<div id="aeon-search-bar" style="display:none;margin:0 2px 12px;position:relative;"><input id="aeon-search-input" type="text" oninput="App.filterAeonSearch(this)" placeholder="Mesajlarda ara…" style="width:100%;box-sizing:border-box;border:1px solid var(--field-bd);background:var(--field);border-radius:14px;padding:10px 36px 10px 14px;font-size:var(--f-subhead);color:var(--text);outline:none;"><button onclick="App.clearAeonSearch()" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);border:none;background:none;cursor:pointer;color:var(--faint);line-height:1;padding:4px;display:flex;align-items:center;">'+icon('x',14)+'</button></div>';
    function tsNum(t){ var d2=new Date(t||0); return isNaN(d2.getTime())?Infinity:d2.getTime(); }
    var items=[], seq=0, allNotifications=call('notifList',[],[]), notificationById={}, replyNotificationIds={};
    allNotifications=Array.isArray(allNotifications)?allNotifications:[];
    allNotifications.forEach(function(n){ if(n&&n.id) notificationById[String(n.id)]=n; });
    var qa=(d.aeon&&Array.isArray(d.aeon.qa))?d.aeon.qa:[];
    qa.forEach(function(x){ if(x&&x.answer&&x.answerMsgId) replyNotificationIds[String(x.answerMsgId)]=true; });
    function addThreadItem(item,tie){ item._idx=seq++; item._tie=tie; items.push(item); }
    allNotifications.filter(function(n){ return n&&!n.deleted&&(!n.id||!replyNotificationIds[String(n.id)]); }).forEach(function(n){ var t=n.ts||n.receivedAt||''; addThreadItem({sort:String(t),tsNum:tsNum(t),kind:'in',text:n.text,time:t,observer:true,id:n.id,unread:!n.read,mediaKind:n.kind,mediaId:n.mediaId,mediaMime:n.mediaMime,durationSec:n.durationSec,peaks:n.peaks,w:n.w,h:n.h,mediaName:n.mediaName,mediaSize:n.mediaSize},1); });
    function answerThreadTime(x){
      if(x.answerTs) return String(x.answerTs);
      var source=x.answerMsgId?notificationById[String(x.answerMsgId)]:null;
      if(source) return String(source.ts||source.receivedAt||'');
      return String(x.answeredAt||x.ts||'');
    }
    qa.forEach(function(x){ if(!x) return;
      var qt=x.ts||''; addThreadItem({sort:String(qt),tsNum:tsNum(qt),kind:'out',text:x.question,time:qt,answered:!!x.answer,reviewing:!!x.reviewingAt,mediaKind:x.kind,mediaId:x.mediaId,mediaMime:x.mediaMime,durationSec:x.durationSec,peaks:x.peaks,w:x.w,h:x.h,mediaName:x.mediaName,mediaSize:x.mediaSize,qaId:x.id,qaField:'question',mailFailed:x.mailPinged===false},0);
      if(x.answer){ var at=answerThreadTime(x); addThreadItem({sort:String(at),tsNum:tsNum(at),kind:'in',text:x.answer,time:at,mediaKind:x.answerKind,mediaId:x.answerMediaId,mediaMime:x.answerMediaMime,durationSec:x.answerDurationSec,peaks:x.answerPeaks,w:x.answerW,h:x.answerH,mediaName:x.answerMediaName,mediaSize:x.answerMediaSize,qaId:x.id,qaField:'answer'},2); }
    });
    items.sort(function(a,b){ return (a.tsNum-b.tsNum)||(a._tie-b._tie)||(a._idx-b._idx); });
    var totalItems=items.length, pageSize=40, hiddenOlder=0, visibleItems=items;
    if(totalItems>pageSize&&!state.aeonShowAllHistory){ hiddenOlder=totalItems-pageSize; visibleItems=items.slice(hiddenOlder); }
    h+='<div id="aeon-thread" style="display:flex;flex-direction:column;gap:10px;">';
    if(totalItems>pageSize){ var historyOpen=state.aeonShowAllHistory, historyLabel=historyOpen?'↓ Tümünü daralt':'↑ Daha eski '+hiddenOlder+' mesajı göster'; h+='<div style="display:flex;justify-content:center;margin:2px 0 4px;"><button onclick="App.showAeonHistory()" style="border:1px solid var(--field-bd);background:var(--field);color:var(--muted);cursor:pointer;border-radius:999px;padding:7px 16px;font-size:var(--f-caption1);font-weight:700;">'+historyLabel+'</button></div>'; }
    if(!items.length) h+='<div class="msg-empty-hint" style="text-align:center;padding:26px 18px;border-radius:20px;background:linear-gradient(160deg,rgba(230,193,90,0.13),rgba(201,154,58,0.07));border:1px solid rgba(201,154,58,0.2);"><div style="margin-bottom:7px;color:var(--aeon);display:flex;justify-content:center;">'+icon('hexagon',30)+'</div><div style="font-size:var(--f-subhead);font-weight:800;color:var(--text);margin-bottom:5px;">Burası senin sessiz limanın</div><div style="font-size:var(--f-footnote);color:var(--muted);line-height:1.6;">Aklından geçeni, içini dökmek istediğin her şeyi buraya bırakabilirsin. Ne zaman istersen — gece ya da gündüz — ben hep buradayım. ✨</div></div>';
    var prevDateStr=null, newestSort=items.length?items[items.length-1].sort:null, previousSort=dep('getAeonLastSeenSort',null);
    visibleItems.forEach(function(it){ var ds=''; try{ var dd=new Date(it.time); if(!isNaN(dd.getTime())) ds=call('fmt',[dd],''); }catch(e){} if(ds&&ds!==prevDateStr){ h+='<div class="msg-daydiv">'+esc(dayDivider(it.time))+'</div>'; prevDateStr=ds; } var enterCls=previousSort!=null&&it.sort>previousSort?' msg-enter':''; h+=itemHTML(it,enterCls); });
    h+='</div>';
    call('setAeonLastSeenSort',[newestSort],null);
    call('setAeonLastRenderedDateStr',[prevDateStr],null);
    h+='<div id="aeon-sticky-bar" style="position:sticky;bottom:0;background:var(--chatbar);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);padding:12px 0 6px;margin-top:6px;z-index:5;"><button id="aeon-scroll-fab" class="aeon-scrollfab" style="top:-52px;right:4px;" onclick="App.aeonScrollToBottom()" aria-label="En alta in">⌄</button>';
    if(state.aeonError) h+='<div style="font-size:var(--f-footnote);color:#C0605F;background:rgba(220,120,120,0.1);border:1px solid rgba(220,120,120,0.25);border-radius:12px;padding:9px 11px;margin-bottom:8px;">'+esc(state.aeonError)+'</div>';
    var draftLen=String(state.aeonDraft||'').length,leftChars=600-draftLen;
    h+='<div id="aeon-char-count" style="display:'+(leftChars<100?'block':'none')+';font-size:var(--f-caption2);color:var(--faint);text-align:right;margin-bottom:3px;">'+leftChars+' karakter kaldı</div>';
    if(state.aeonRecActive){
      h+='<div style="display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,var(--aeon2),var(--aeon));border-radius:26px;padding:7px 8px 7px 14px;box-shadow:0 8px 20px var(--aeon-glow);"><span style="width:9px;height:9px;border-radius:50%;background:#1a1404;flex-shrink:0;animation:seyTwinkle 1s ease-in-out infinite;"></span><span id="aeon-rec-time" style="font-size:var(--f-footnote);font-weight:800;color:#1a1404;font-variant-numeric:tabular-nums;flex-shrink:0;">00:00</span><div id="aeon-rec-wave" style="flex:1;display:flex;align-items:center;gap:2px;height:26px;min-width:0;"></div><button onclick="App.aeonRecCancel()" aria-label="İptal et" style="flex-shrink:0;border:none;cursor:pointer;background:rgba(26,20,4,0.16);color:#1a1404;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;">'+icon('x',15)+'</button><button onclick="App.aeonRecStop(true)" aria-label="Gönder" style="flex-shrink:0;border:none;cursor:pointer;background:#1a1404;color:var(--aeon2);width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;">'+icon('check',15)+'</button></div>';
    } else {
      h+='<div style="display:flex;gap:8px;align-items:flex-end;"><input type="file" id="aeon-photo-input" accept="image/*" style="display:none;" onchange="App.aeonPhotoChosen(this)"><input type="file" id="aeon-file-input" accept="'+String(dep('attachmentAccept',''))+'" style="display:none;" onchange="App.aeonFileChosen(this)"><input type="file" id="aeon-audio-input" accept="audio/*" style="display:none;" onchange="App.aeonAudioFileChosen(this)"><button onclick="App.aeonOpenAttachSheet()" aria-label="Ek gönder" style="flex-shrink:0;border:1px solid var(--field-bd);cursor:pointer;width:44px;height:44px;border-radius:50%;background:var(--field);color:var(--muted);display:flex;align-items:center;justify-content:center;'+(state.aeonUploading?'opacity:.5;pointer-events:none;':'')+'">'+icon('paperclip',18)+'</button><textarea id="aeon-input" class="aeon-input-field" oninput="App.onAeonDraft(this)" onkeydown="App.onAeonKeydown(event)" placeholder="İçini dök, buradayım…" rows="1" style="flex:1;border:1px solid var(--field-bd);background:var(--field);border-radius:18px;padding:11px 14px;font-size:var(--f-subhead);resize:none;outline:none;line-height:1.4;max-height:120px;overflow-y:auto;">'+esc(state.aeonDraft||'')+'</textarea><button id="aeon-send-btn" class="aeon-send-btn'+(draftLen?'':' is-disabled')+'" onclick="App.askAeon()" aria-label="Gönder" style="display:'+(draftLen?'flex':'none')+';flex-shrink:0;border:none;cursor:pointer;width:46px;height:46px;border-radius:50%;color:#1a1404;background:linear-gradient(135deg,var(--aeon2),var(--aeon));box-shadow:0 6px 16px var(--aeon-glow);align-items:center;justify-content:center;">'+icon('send',19)+'</button><button id="aeon-mic-btn" onclick="App.aeonMicTap()" aria-label="Sesli mesaj kaydet" style="display:'+(draftLen?'none':'flex')+';flex-shrink:0;border:none;cursor:pointer;width:46px;height:46px;border-radius:50%;color:#1a1404;background:linear-gradient(135deg,var(--aeon2),var(--aeon));box-shadow:0 6px 16px var(--aeon-glow);align-items:center;justify-content:center;'+(state.aeonUploading?'opacity:.5;pointer-events:none;':'')+'">'+icon('mic',19)+'</button></div>';
    }
    h+='</div>';
    return h;
  }
  function mesajHTML(){ return lunaChatHTML()+'<div style="height:1px;background:linear-gradient(90deg,transparent,rgba(150,110,120,0.25),transparent);margin:22px 0 16px;"></div>'+chatHTML(); }

  root.SeymaMessaging=Object.freeze({
    registerMessaging:registerMessaging,
    AEON_BUBBLE_MAX_LINES:AEON_BUBBLE_MAX_LINES,
    AEON_BUBBLE_MAX_CHARS:AEON_BUBBLE_MAX_CHARS,
    AEON_BUBBLE_CLAMP_PX:AEON_BUBBLE_CLAMP_PX,
    messageTime:messageTime,
    dayDivider:dayDivider,
    mdLite:mdLite,
    bubbleDomId:bubbleDomId,
    bubbleExpanded:bubbleExpanded,
    chatClampHTML:chatClampHTML,
    clampBubble:clampBubble,
    lunaBubbleOut:lunaBubbleOut,
    lunaBubbleIn:lunaBubbleIn,
    lunaChatHTML:lunaChatHTML,
    aeonBubbleText:aeonBubbleText,
    aeonBubbleKey:aeonBubbleKey,
    aeonMediaSlotHTML:mediaSlotHTML,
    aeonItemHTML:itemHTML,
    aeonAttachSheetHTML:attachSheetHTML,
    aeonChatHTML:chatHTML,
    mesajHTML:mesajHTML
  });
})(typeof window!=='undefined'?window:this);
