(function(){
  'use strict';

  // MON-26 · Motivation / Terapi Odası domain registry
  // ---------------------------------------------------------------------------
  // Saf kişiselleştirme yardımcıları, kompakt kart/oda görünüm üreticileri ve
  // profil özet parser'ı burada yaşar. Root data rebind'i, App handler'ları
  // (openRoom/closeRoom/completeMotivationTask/saveDailyWin/tools timer/fetch
  // dahil), render, modal focus kabuğu ve ui mutasyonu app.js'te kalır.
  // MotivationProgramV2 / MotivationNarratives içerik modülleri her çağrıda
  // çözülür; modül yüklenirken içerik, storage, DOM, timer veya ağ erişimi
  // açılmaz. roomDailyContentHTML çağrı başına data.roomContentHistory yazımı
  // app.js'in canlı data resolver'ı üzerinden yapılır (görünüm üreticisinin
  // mevcut davranışı; kalıcı mutasyon kabuğu app.js'teki save/commit yüzeyinde
  // kalır).
  var MOT_DEPENDENCIES=['data','ui','dark','getDay','activeDate','diffDays','icon','esc','segTabs','progBar','featuresLive','fmtWhen','fmtDateNice'];

  function registerMotivation(deps){
    if(motDeps||!deps||typeof deps!=='object'||Array.isArray(deps)) return false;
    for(var i=0;i<MOT_DEPENDENCIES.length;i++) if(typeof deps[MOT_DEPENDENCIES[i]]!=='function') return false;
    motDeps=deps;
    return true;
  }
  function dep(name){ return motDeps&&typeof motDeps[name]==='function'?motDeps[name]:null; }
  function liveData(){
    var f=dep('data'); if(f){ try{ return f(); }catch(e){} }
    var st=window.SeymaState; return st?st.data:null;
  }
  function liveUi(){
    var f=dep('ui'); if(f){ try{ return f(); }catch(e){} }
    return null;
  }
  function liveDark(){
    var f=dep('dark'); if(f){ try{ return f(); }catch(e){} }
    var root=document.documentElement; return !!(root&&root.getAttribute&&root.getAttribute('data-theme')==='dark');
  }
  function call(name,args){
    var f=dep(name); if(f) return f.apply(null,args);
    throw new Error('SeymaMotivation: çözümlenemeyen bağımlılık '+name);
  }
  function esc(v){ return call('esc',[v]); }
  function icon(name,size){ return call('icon',[name,size]); }
  function activeDate(){ return call('activeDate',[]); }
  function diffDays(a,b){ return call('diffDays',[a,b]); }
  function getDay(d,date){ return call('getDay',[d,date]); }
  function segTabs(defs,active,fn,accent){ return call('segTabs',[defs,active,fn,accent]); }
  function fmtWhen(iso){ return call('fmtWhen',[iso]); }

  // ── Kişiselleştirme yardımcıları (app.js 10419–10447'ten aynen) ──────────
  function motivationIsCourageDomain(domain){
    return domain==='destek'||domain==='sinir'||domain==='onarim'||domain==='yakinlik';
  }
  function motivationPersonalLine(mot,sum,state){
    var doneToday=!!(state&&(state.status==='completed'||state.status==='minimum_completed'));
    if(doneToday&&state.status==='minimum_completed') return 'Bugün minimum sürümü seçtin; bu da yolun içinde, pas geçmek değil.';
    if(doneToday) return 'Bugünü kaydettin — bu, '+esc(mot.domainLabel)+' alanında somut bir kanıt.';
    if(sum.returnCount>0&&sum.pathStreak<=1) return 'Ara verdikten sonra döndüğün günler de başarı verisi.';
    if(motivationIsCourageDomain(mot.domain)) return 'Bu görev '+esc(mot.domainLabel)+' alanında; küçük bir adım da cesaret kanıtı sayılır.';
    var data=liveData();
    var name=(data.settings&&data.settings.nickname)?String(data.settings.nickname).trim():'';
    return (name?esc(name)+', bugün':'Bugün')+' görev küçük olabilir; kayıt gerçek kalır.';
  }
  function motivationEvidenceLine(sum){
    var bits=[];
    if(sum.pathStreak>0) bits.push(sum.pathStreak+' günlük yol kaydı');
    if(sum.courageEvidence>0) bits.push(sum.courageEvidence+' cesaret kanıtı');
    if(sum.minimumTotal>0) bits.push(sum.minimumTotal+' minimum tamamlama');
    if(!bits.length) return '';
    return bits.join(' · ')+' — hepsi gerçek davranış verisi.';
  }
  function motivationNextStepLabel(state){
    if(state&&state.status==='minimum_completed') return 'Minimum kaydedildi';
    if(state&&state.status==='completed') return 'Bugün kaydedildi';
    return 'Tamamladım';
  }
  function motivationBadgeHTML(size){
    size=size||40;
    var isz=Math.round(size*0.5);
    return '<div style="position:relative;flex-shrink:0;width:'+size+'px;height:'+size+'px;border-radius:'+Math.round(size*0.34)+'px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--room2),var(--room));box-shadow:0 8px 20px var(--room-glow);overflow:hidden;">'
      +'<span style="position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.55) 50%,transparent 70%);animation:seyShine 3.4s ease-in-out infinite;"></span>'
      +'<span style="position:relative;color:#fff;display:inline-flex;">'+icon('armchair',isz)+'</span></div>';
  }
  function motivationSignHTML(delay){
    var anim=(delay!=null)?'animation:seyFloatIn .4s '+delay+'s ease both;':'';
    var h='<div class="sey-room-sign" style="margin-top:4px;display:flex;align-items:center;gap:5px;'+anim+'">';
    h+='<span style="display:inline-flex;color:var(--room);opacity:.8;">'+icon('feather',13)+'</span>';
    h+='<span style="font-size:var(--f-title2);">Şeyma</span>';
    h+='<span style="font-size:var(--f-callout);opacity:.9;">&amp; Raşit</span>';
    h+='</div>';
    return h;
  }
  function motivationQuoteBlockHTML(quote){
    var h='<div style="position:relative;padding-top:2px;">';
    h+='<span style="position:absolute;top:-22px;right:-4px;font-size:72px;line-height:1;font-weight:800;color:var(--room);opacity:0.11;pointer-events:none;">”</span>';
    h+='<div style="position:relative;font-size:var(--f-callout);line-height:1.55;color:var(--text);font-style:italic;display:flex;gap:8px;text-shadow:0 0 18px var(--room-bg);"><span style="flex-shrink:0;opacity:0.8;color:var(--room);">'+icon('quote',16)+'</span><span>'+esc(quote)+'</span></div>';
    // Sözü Raşit bırakmış gibi -- doğrudan değil, elle atılmış bir "— R." imzasıyla ima.
    h+='<div class="sey-room-sign" style="text-align:right;margin-top:7px;font-size:var(--f-subhead);color:var(--room);opacity:.9;">— R.</div>';
    h+='</div>';
    return h;
  }
  function motivationComingSoonCardHTML(){
    var pu=liveDark()?'#B7A8F2':'#6E5FCB';
    var h='<div id="sey-motivation-card" class="surface sey-room-card" aria-label="Terapi Odası yakında açılıyor" style="border-radius:24px;padding:16px;display:flex;flex-direction:column;gap:12px;position:relative;overflow:hidden;border:1px solid color-mix(in srgb,'+pu+' 20%, var(--card-bd));">';
    h+='<div style="display:flex;align-items:center;gap:11px;">';
    h+='<span style="width:36px;height:36px;border-radius:12px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:'+pu+';background:color-mix(in srgb,'+pu+' 15%, var(--icon));box-shadow:inset 0 1px 0 rgba(255,255,255,0.4);">'+icon('clock',19)+'</span>';
    h+='<div style="flex:1;min-width:0;">';
    h+='<div style="font-size:var(--f-callout);font-weight:800;color:'+pu+';line-height:1.15;letter-spacing:.2px;">İçsel Pusula</div>';
    h+='<div style="font-size:var(--f-caption1);color:var(--faint);margin-top:2px;line-height:1.3;">Raşit\'le küçük ama gerçek adımlar</div>';
    h+='</div></div>';
    h+='<div style="font-size:var(--f-footnote);line-height:1.4;color:var(--muted);">13 Temmuz sabahı, <b style="color:var(--text);">1. gün</b>le birlikte açılıyor.</div>';
    h+='</div>';
    return h;
  }
  function motivationTodayCardHTML(){
    var M=window.MotivationProgramV2;
    var data=liveData();
    if(!M||!data) return '';
    if(!call('featuresLive',[])) return motivationComingSoonCardHTML();
    var root=M.ensureMotivationRoot(data);
    if(!root) return '';
    var mot=M.activeDay(data);
    if(!mot) return '';
    var sum=M.progressSummary(data);
    var st=M.dayState(data,activeDate());
    var doneToday=!!(st&&(st.status==='completed'||st.status==='minimum_completed'));
    var pct=sum.programComplete?100:Math.max(2,sum.percent);
    var pu=liveDark()?'#B7A8F2':'#6E5FCB';
    var h='<button data-fx="open" type="button" id="sey-motivation-card" class="surface sey-room-card sey-asbtn" onclick="App.openRoom()" aria-label="Terapi Odası\'nı aç" style="cursor:pointer;border-radius:24px;padding:16px;display:flex;flex-direction:column;gap:12px;position:relative;overflow:hidden;border:1px solid color-mix(in srgb,'+pu+' 20%, var(--card-bd));">';
    h+='<div style="display:flex;align-items:center;gap:11px;">';
    h+='<span style="width:36px;height:36px;border-radius:12px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:'+pu+';background:color-mix(in srgb,'+pu+' 15%, var(--icon));box-shadow:inset 0 1px 0 rgba(255,255,255,0.4);">'+icon('compass',19)+'</span>';
    h+='<div style="flex:1;min-width:0;">';
    h+='<div style="font-size:var(--f-callout);font-weight:800;color:'+pu+';line-height:1.15;letter-spacing:.2px;">İçsel Pusula</div>';
    h+='<div style="font-size:var(--f-caption1);color:var(--faint);margin-top:2px;line-height:1.3;">Raşit\'le küçük ama gerçek adımlar</div>';
    h+='</div>';
    if(doneToday) h+='<span style="flex-shrink:0;display:inline-flex;align-items:center;gap:4px;font-size:var(--f-caption2);font-weight:800;color:#3F8A4F;background:rgba(143,191,138,0.18);padding:3px 9px;border-radius:999px;">'+icon('check',11)+' bugün</span>';
    h+='<span style="color:'+pu+';font-size:var(--f-title3);font-weight:700;line-height:1;flex-shrink:0;">›</span>';
    h+='</div>';
    var motDayText=sum.programComplete?'120 günlük yol tamamlandı':('Gün '+sum.currentProgramDay+'/'+sum.totalDays);
    h+='<div style="display:flex;align-items:center;gap:8px;">';
    h+='<div style="flex:1;min-width:0;font-size:var(--f-footnote);line-height:1.35;"><b style="color:var(--text);font-weight:800;">'+esc(motDayText)+'</b><span style="color:var(--muted);font-weight:700;"> · '+esc(mot.phaseTitle)+' · '+esc(mot.domainLabel)+'</span></div>';
    h+='<div style="flex-shrink:0;font-size:var(--f-caption2);font-weight:800;padding:3px 10px;border-radius:999px;color:'+(sum.programComplete?'#fff':'var(--muted)')+';background:'+(sum.programComplete?'linear-gradient(135deg,var(--room2),var(--room))':'var(--icon)')+';">%'+pct+'</div>';
    h+='</div>';
    h+='<div style="height:6px;border-radius:999px;background:var(--icon);overflow:hidden;position:relative;box-shadow:0 0 10px var(--room-glow);"><div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,var(--room2),var(--room));border-radius:999px;position:relative;overflow:hidden;transition:width .4s var(--ease-premium,ease);"><span style="position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.6) 50%,transparent 70%);animation:seyShine 2.6s ease-in-out infinite;"></span></div></div>';
    h+='<div style="text-align:center;font-size:var(--f-caption2);font-weight:800;letter-spacing:.3px;color:var(--room);display:flex;align-items:center;justify-content:center;gap:5px;">Terapi Odası\'nı tam ekran aç '+icon('sparkles',11)+'</div>';
    h+='</button>';
    return h;
  }
  function roomStatsHTML(sum,fi){
    var h='<div style="display:flex;gap:8px;font-size:var(--f-caption1);'+(fi?fi(0.22):'')+'">';
    h+='<span style="flex:1;background:rgba(233,175,193,0.14);border-radius:10px;padding:9px 10px;color:var(--text2);display:flex;align-items:center;gap:5px;">'+icon('route',14)+' Yol <b data-countup="'+sum.pathStreak+'" data-countup-key="room-path-streak" style="margin-left:auto;">'+sum.pathStreak+'</b></span>';
    h+='<span style="flex:1;background:rgba(201,184,255,0.14);border-radius:10px;padding:9px 10px;color:var(--text2);display:flex;align-items:center;gap:5px;">'+icon('heart-handshake',14)+' Cesaret <b data-countup="'+sum.courageEvidence+'" data-countup-key="room-courage" style="margin-left:auto;">'+sum.courageEvidence+'</b></span>';
    h+='<span style="flex:1;background:rgba(143,191,138,0.14);border-radius:10px;padding:9px 10px;color:var(--text2);display:flex;align-items:center;gap:5px;">'+icon('rotate-ccw',14)+' Dönüş <b data-countup="'+sum.returnCount+'" data-countup-key="room-return-count" style="margin-left:auto;">'+sum.returnCount+'</b></span>';
    h+='</div>';
    return h;
  }
  function roomOverlayHTML(){
    var M=window.MotivationProgramV2;
    var data=liveData(); var ui=liveUi();
    if(!M||!data) return '';
    if(!call('featuresLive',[])) return '';
    var root=M.ensureMotivationRoot(data); if(!root) return '';
    var mot=M.activeDay(data); if(!mot) return '';
    var sum=M.progressSummary(data);
    var st=M.dayState(data,activeDate());
    var doneToday=!!(st&&(st.status==='completed'||st.status==='minimum_completed'));
    var hasReflection=!!(String(ui.motivationReflectionDraft||'').trim());
    var pct=sum.programComplete?100:Math.max(2,sum.percent);
    var fi=function(delay){ return 'animation:seyFloatIn .45s '+delay+'s ease both;'; };
    var nar=(window.MotivationNarratives&&window.MotivationNarratives.dayNarrative)?window.MotivationNarratives.dayNarrative(mot):null;
    var motDayText=sum.programComplete?'120 günlük yol tamamlandı':('Gün '+sum.currentProgramDay+'/'+sum.totalDays);

    var h='<div id="sey-room-overlay" onclick="App.closeRoom()" style="position:fixed;inset:0;z-index:360;background:rgba(30,22,30,0.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:stretch;justify-content:center;animation:seyFade .22s ease;">';
    h+='<section id="sey-room-dialog" role="dialog" aria-modal="true" aria-labelledby="sey-room-title" tabindex="-1" onkeydown="App.onReminderKeydown(event)" onclick="event.stopPropagation()" style="width:100%;max-width:480px;height:100%;background:var(--modal);display:flex;flex-direction:column;box-shadow:0 0 60px rgba(0,0,0,0.4);animation:seyPop .34s var(--ease-premium,cubic-bezier(.16,1,.3,1)) both;transform-origin:center;overflow:hidden;">';
    // ── Sticky başlık: parlayan "Terapi Odası" + el yazısı imza (geri geldi) ──
    h+='<div style="flex-shrink:0;padding:calc(env(safe-area-inset-top) + 14px) 18px 14px;border-bottom:1px solid color-mix(in srgb,var(--room) 22%,var(--card-bd));background:linear-gradient(160deg,var(--room-bg),transparent);display:flex;flex-direction:column;gap:11px;position:relative;overflow:hidden;">';
    h+='<span style="position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.10) 50%,transparent 70%);animation:seyShine 4s ease-in-out infinite;pointer-events:none;"></span>';
    h+='<div style="position:relative;display:flex;align-items:flex-start;gap:12px;">';
    h+='<span style="animation:seyPop .34s var(--ease-premium,ease) both;">'+motivationBadgeHTML(46)+'</span>';
    h+='<div style="flex:1;min-width:0;">';
    h+='<div id="sey-room-title" class="sey-room-title" style="font-size:var(--f-title2);letter-spacing:2.5px;animation:seyFloatIn .4s .04s ease both;">Terapi Odası</div>';
    h+=motivationSignHTML(0.12);
    h+='</div>';
    h+='<button data-fx="close" onclick="App.closeRoom()" aria-label="Kapat" style="flex-shrink:0;border:none;background:rgba(150,110,120,0.16);cursor:pointer;width:36px;height:36px;border-radius:50%;color:var(--muted);display:flex;align-items:center;justify-content:center;">'+icon('x',17)+'</button>';
    h+='</div>';
    h+='<div style="position:relative;display:flex;align-items:center;gap:8px;">';
    h+='<div style="flex:1;min-width:0;font-size:var(--f-footnote);line-height:1.35;"><b style="color:var(--text);font-weight:800;">'+esc(motDayText)+'</b><span style="color:var(--muted);font-weight:700;"> · '+esc(mot.phaseTitle)+' · '+esc(mot.domainLabel)+'</span></div>';
    h+='<div style="flex-shrink:0;font-size:var(--f-caption2);font-weight:800;padding:3px 10px;border-radius:999px;color:'+(sum.programComplete?'#fff':'var(--muted)')+';background:'+(sum.programComplete?'linear-gradient(135deg,var(--room2),var(--room))':'var(--icon)')+';">%<span data-countup="'+pct+'" data-countup-key="motivation-overlay-percent">'+pct+'</span></div>';
    h+='</div>';
    h+='<div style="position:relative;height:6px;border-radius:999px;background:var(--icon);overflow:hidden;box-shadow:0 0 10px var(--room-glow);"><div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,var(--room2),var(--room));border-radius:999px;position:relative;overflow:hidden;transition:width .4s var(--ease-premium,ease);"><span style="position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.6) 50%,transparent 70%);animation:seyShine 2.6s ease-in-out infinite;"></span></div></div>';
    h+='</div>';
    // ── Sekme menüsü ──
    h+='<div id="sey-room-tabs" style="padding:0 18px 8px;">';
    h+=segTabs([['path','Yol', 'compass'],['tools','Araçlar','heart-handshake'],['profile','Profilim','sparkles']], ui.roomTab, 'App.setRoomTab', 'room');
    h+='</div>';
    // ── Kaydırılabilir gövde ──
    h+='<div id="sey-room-body" class="scroll" style="flex:1;min-height:0;overflow-y:auto;padding:16px 18px calc(env(safe-area-inset-bottom) + 22px);display:flex;flex-direction:column;gap:14px;">';
    h+=roomBodyHTML(M,mot,sum,st,doneToday,nar,fi);
    h+='</section></div>';
    return h;
  }
  function roomBodyHTML(M,mot,sum,st,doneToday,nar,fi){
    var ui=liveUi();
    if(ui.roomTab==='path') return roomPathHTML(M,mot,sum,st,doneToday,nar,fi);
    if(ui.roomTab==='tools') return roomToolsHTML(fi);
    return roomProfileHTML(fi);
  }
  function roomPathHTML(M,mot,sum,st,doneToday,nar,fi){
    var ui=liveUi();
    var hasReflection=!!(String(ui.motivationReflectionDraft||'').trim());
    var h='';
    if(sum.programComplete){
      h+='<div style="'+fi(0.04)+'">'+motivationQuoteBlockHTML(mot.quote)+'</div>';
      h+='<div style="font-size:var(--f-footnote);color:var(--text2);line-height:1.6;'+fi(0.08)+'">120 günlük yol, bu odada birlikte yüründü. Elde ettiğin bir rozet değil; zor bir günde kendine dönebildiğin, güvenilir bir iç yol.</div>';
      h+=roomStatsHTML(sum,fi);
      h+='<div style="font-size:var(--f-caption1);color:var(--room);line-height:1.5;font-style:italic;display:flex;align-items:center;gap:6px;'+fi(0.14)+'">'+icon('heart',13)+' Bu oda, ikimizin — sana iyi gelsin diye.</div>';
      return h;
    }
    // Söz
    h+='<div style="'+fi(0.04)+'">'+motivationQuoteBlockHTML(mot.quote)+'</div>';
    // GÜNE ÖZGÜ ANLATI
    if(nar){
      h+='<div style="'+fi(0.06)+'display:flex;flex-direction:column;gap:9px;background:linear-gradient(160deg,var(--room-bg),transparent);border:1px solid color-mix(in srgb,var(--room) 20%,var(--card-bd));border-radius:18px;padding:15px;">';
      h+='<div style="display:flex;align-items:center;gap:7px;font-size:var(--f-caption2);font-weight:800;letter-spacing:.5px;color:var(--room);text-transform:uppercase;"><span style="display:inline-flex;">'+icon('feather',13)+'</span>'+esc(nar.phaseName)+' · Anlatı</div>';
      h+='<div style="font-size:var(--f-footnote);color:var(--muted);font-style:italic;line-height:1.5;">'+esc(nar.phaseEssence)+'</div>';
      nar.paragraphs.forEach(function(p){ h+='<div style="font-size:var(--f-footnote);line-height:1.62;color:var(--text2);">'+esc(p)+'</div>'; });
      (nar.phaseArc||[]).forEach(function(p){ h+='<div style="font-size:var(--f-footnote);line-height:1.6;color:var(--muted);">'+esc(p)+'</div>'; });
      h+='</div>';
    }
    // Mercek + açıklama + kişisel satır
    h+='<div style="'+fi(0.08)+'display:flex;flex-direction:column;gap:6px;">';
    h+='<div style="font-size:var(--f-caption1);font-weight:800;letter-spacing:.4px;color:var(--room);text-transform:uppercase;">Mercek · '+esc(mot.psychologicalLens)+'</div>';
    if(mot.explanation) h+='<div style="font-size:var(--f-footnote);color:var(--text2);line-height:1.55;">'+esc(mot.explanation)+'</div>';
    h+='<div style="font-size:var(--f-footnote);color:var(--muted);line-height:1.5;">'+esc(motivationPersonalLine(mot,sum,st))+'</div>';
    h+='</div>';
    // Bugünün sorusu
    if(mot.reflectionQuestion) h+='<div style="'+fi(0.1)+'display:flex;gap:9px;align-items:flex-start;background:rgba(201,184,255,0.12);border:1px solid rgba(201,184,255,0.28);border-radius:14px;padding:12px 13px;"><span style="flex-shrink:0;color:var(--room);display:inline-flex;margin-top:1px;">'+icon('lightbulb',15)+'</span><div style="font-size:var(--f-footnote);line-height:1.55;color:var(--text2);"><b>Bugünün sorusu:</b> '+esc(mot.reflectionQuestion)+'</div></div>';
    // Bugünkü görev + küçültme
    var minMode=!doneToday&&!!ui.motivationMinimumOpen;
    h+='<div style="background:linear-gradient(160deg,var(--room-bg),transparent);border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:6px;transition:opacity .25s ease;'+fi(0.12)+(minMode?'opacity:.5;':'')+'">';
    h+='<div style="font-size:var(--f-caption2);font-weight:700;color:var(--muted);">Bugünkü görev</div>';
    h+='<div style="font-size:var(--f-subhead);color:var(--text);line-height:1.45;">'+esc(mot.standardTask)+'</div>';
    h+='</div>';
    if(minMode){
      h+='<div style="border:1px solid var(--room);background:linear-gradient(160deg,var(--room-bg),transparent);border-radius:14px;padding:12px 13px;display:flex;flex-direction:column;gap:6px;box-shadow:0 8px 22px var(--room-glow);animation:seyFloatIn .32s var(--ease-premium,ease) both;">';
      h+='<div style="display:flex;align-items:center;gap:6px;font-size:var(--f-caption2);font-weight:800;letter-spacing:.3px;color:var(--room);"><span style="display:inline-flex;">'+icon('feather',12)+'</span>Küçültülmüş görev</div>';
      h+='<div style="font-size:var(--f-subhead);color:var(--text);line-height:1.45;font-weight:600;">'+esc(mot.minimumTask)+'</div>';
      h+='<div style="font-size:var(--f-caption1);color:var(--text2);line-height:1.5;">Görevi küçültüyorsun, pas geçmiyorsun — bu hâliyle de kayda geçer.</div>';
      h+='</div>';
    }
    h+='<div style="'+fi(0.14)+'display:flex;flex-direction:column;gap:8px;">';
    if(doneToday) h+='<div style="display:inline-flex;align-self:flex-start;align-items:center;gap:5px;font-size:var(--f-caption2);font-weight:800;color:#3F8A4F;background:rgba(143,191,138,0.16);padding:4px 11px;border-radius:999px;">'+icon('check',12)+(st&&st.status==='minimum_completed'?'Minimum kaydedildi · düzenleyebilirsin':'Bugün kaydedildi · düzenleyebilirsin')+'</div>';
    if(mot.reflectionExamples && mot.reflectionExamples.length){
      var exOpen = !!ui.motivationExamplesOpen;
      h+='<div style="border:1px solid color-mix(in srgb,var(--room) 22%,var(--card-bd));background:linear-gradient(160deg,var(--room-bg),transparent);border-radius:14px;overflow:hidden;">';
      h+='<button type="button" onclick="App.toggleMotivationExamples()" style="width:100%;border:none;background:transparent;cursor:pointer;padding:12px 13px;display:flex;align-items:center;justify-content:space-between;gap:8px;color:var(--room);">';
      h+='<span style="display:flex;align-items:center;gap:7px;font-size:var(--f-footnote);font-weight:800;"><span style="display:inline-flex;">'+icon('pen-tool',14)+'</span>Bugün nasıl yazabilirim?</span>';
      h+='<span style="display:inline-flex;transition:transform .2s ease;transform:rotate('+(exOpen?'180deg':'0deg')+');">'+icon('chevron-down',14)+'</span>';
      h+='</button>';
      if(exOpen){
        h+='<div style="padding:0 13px 13px;display:flex;flex-direction:column;gap:8px;animation:seyFloatIn .22s ease both;">';
        h+='<div style="font-size:var(--f-caption2);color:var(--muted);line-height:1.45;">Aşağıdaki cümleler sana başlangıç noktası olabilir. İstediğini kendi deneyimine göre değiştir.</div>';
        mot.reflectionExamples.forEach(function(ex, idx){
          h+='<div style="display:flex;gap:8px;align-items:flex-start;">';
          h+='<button type="button" onclick="App.copyMotivationExample('+idx+')" title="Yansıma girişine kopyala" style="flex-shrink:0;border:1px solid var(--room);background:transparent;cursor:pointer;padding:7px 9px;border-radius:10px;color:var(--room);display:inline-flex;align-items:center;justify-content:center;">'+icon('copy',13)+'</button>';
          h+='<div style="font-size:var(--f-footnote);line-height:1.55;color:var(--text2);padding-top:2px;">'+esc(ex)+'</div>';
          h+='</div>';
        });
        h+='</div>';
      }
      h+='</div>';
    }
    h+='<input id="sey-mot-reflection-main" type="text" maxlength="280" value="'+esc(ui.motivationReflectionDraft||'')+'" oninput="App.setMotivationReflection(this)" placeholder="Bu odaya bugün ne bırakmak istersin?" style="border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 13px;font-size:var(--f-subhead);outline:none;color:var(--text);">';
    h+='<div style="font-size:var(--f-caption2);color:var(--faint);margin-top:-3px;">'+(doneToday?'Kaydını dilediğin an düzenleyip güncelleyebilirsin.':'Kısa da olsa yeter — bu oda seni duyuyor.')+'</div>';
    var pEnabled=hasReflection;
    var saveStatus=doneToday?((st&&st.status==='minimum_completed')?'minimum_completed':'completed'):'completed';
    var pOnclick=minMode?"App.confirmMotivationMinimum()":("App.completeMotivationTask('"+saveStatus+"')");
    var pLabel=minMode?'Minimum görevi tamamladım':(doneToday?'Kaydı güncelle':motivationNextStepLabel(st));
    h+='<div style="display:flex;gap:8px;">';
    h+='<button id="sey-mot-complete-btn-main" onclick="'+pOnclick+'"'+(pEnabled?'':' disabled')+' style="position:relative;overflow:hidden;flex:1;min-width:0;border:none;cursor:'+(pEnabled?'pointer':'not-allowed')+';padding:13px;border-radius:14px;font-size:var(--f-subhead);font-weight:800;color:#fff;background:linear-gradient(135deg,var(--room2),#C9B8FF);opacity:'+(pEnabled?'1':'0.45')+';">'
      +'<span style="position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.45) 50%,transparent 70%);animation:seyShine 3.2s ease-in-out infinite;"></span>'
      +'<span style="position:relative;">'+esc(pLabel)+' '+icon('check',14)+'</span></button>';
    if(minMode) h+='<button data-fx="close" onclick="App.closeMotivationMinimum()" style="flex-shrink:0;border:1px solid var(--field-bd);cursor:pointer;padding:13px 15px;border-radius:14px;font-size:var(--f-footnote);font-weight:700;color:var(--muted);background:transparent;">Vazgeç</button>';
    else if(!doneToday) h+='<button data-fx="open" onclick="App.openMotivationMinimum()" style="flex-shrink:0;border:1px solid rgba(233,175,193,0.4);cursor:pointer;padding:13px 15px;border-radius:14px;font-size:var(--f-footnote);font-weight:700;color:var(--text2);background:rgba(233,175,193,0.10);">Görevi küçült</button>';
    h+='</div></div>';
    // Bugünün kazanımı (akşam kapanışı)
    h+=roomDailyWinHTML(fi, doneToday?0.16:0.15);
    // Esneklik nudgesı
    h+=roomFlexNudgeHTML(mot,fi, doneToday?0.18:0.17);
    // Sabah / Akşam / Zor gün notları
    if(mot.appNudge&&(mot.appNudge.morning||mot.appNudge.evening||mot.appNudge.hardDay)){
      var nudgeRow=function(ic,label,txt,col){ return '<div style="display:flex;gap:9px;align-items:flex-start;"><span style="width:28px;height:28px;border-radius:9px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:'+col+';background:color-mix(in srgb,'+col+' 15%,var(--icon));">'+icon(ic,14)+'</span><div style="flex:1;min-width:0;"><div style="font-size:var(--f-caption2);font-weight:800;color:var(--muted);letter-spacing:.3px;">'+label+'</div><div style="font-size:var(--f-footnote);color:var(--text2);line-height:1.5;margin-top:1px;">'+esc(txt)+'</div></div></div>'; };
      h+='<div style="'+fi(doneToday?0.2:0.19)+'display:flex;flex-direction:column;gap:10px;border-top:1px solid var(--card-bd);padding-top:13px;">';
      h+='<div style="font-size:var(--f-caption2);font-weight:800;letter-spacing:.5px;color:var(--faint);">GÜN BOYU EŞLİK</div>';
      if(mot.appNudge.morning) h+=nudgeRow('sunrise','SABAH',mot.appNudge.morning,'#E8A53C');
      if(mot.appNudge.evening) h+=nudgeRow('moon','AKŞAM',mot.appNudge.evening,'#7C5CC4');
      if(mot.appNudge.hardDay) h+=nudgeRow('triangle-alert','ZOR GÜN',mot.appNudge.hardDay,'#E9899F');
      h+='</div>';
    }
    if(mot.eveningCheck) h+='<div style="'+fi(doneToday?0.22:0.21)+'font-size:var(--f-caption1);color:var(--faint);line-height:1.5;">'+esc(mot.eveningCheck)+'</div>';
    h+=roomStatsHTML(sum,fi);
    var evLine=motivationEvidenceLine(sum);
    h+='<div style="'+fi(doneToday?0.24:0.23)+'display:flex;flex-direction:column;gap:5px;">';
    if(evLine) h+='<div style="font-size:var(--f-caption2);color:var(--faint);line-height:1.4;">'+esc(evLine)+'</div>';
    if(nar&&nar.closer) h+='<div style="font-size:var(--f-caption1);color:var(--room);font-style:italic;line-height:1.5;display:flex;align-items:center;gap:6px;">'+icon('heart',13)+' '+esc(nar.closer)+'</div>';
    else h+='<div style="font-size:var(--f-caption2);color:var(--faint);line-height:1.4;font-style:italic;display:flex;align-items:center;gap:5px;">'+icon('heart',12)+' Bu oda, ikimizin — sana iyi gelsin diye.</div>';
    h+='</div>';
    return h;
  }
  function roomDailyWinHTML(fi, delay){
    var data=liveData();
    var day=getDay(data,activeDate());
    var t=day.therapy;
    var saved=!!(t.dailyWin&&t.dailyWin.text);
    var h='<div style="'+fi(delay)+'display:flex;flex-direction:column;gap:9px;background:linear-gradient(160deg,var(--room-bg),transparent);border:1px solid color-mix(in srgb,var(--room) 20%,var(--card-bd));border-radius:18px;padding:14px;">';
    h+='<div style="display:flex;align-items:center;gap:7px;font-size:var(--f-caption2);font-weight:800;letter-spacing:.5px;color:var(--room);text-transform:uppercase;"><span style="display:inline-flex;">'+icon('trophy',13)+'</span>Akşam kapanışı · Bugünün kazanımı</div>';
    h+='<div style="font-size:var(--f-footnote);color:var(--muted);line-height:1.45;">Bugün kendinle gurur duyduğun küçük bir şey yaz. Bir adım, bir nazik cümle, bir zorluğu yönetmek — hepsi sayılır.</div>';
    h+='<input id="sey-room-win" type="text" maxlength="200" value="'+esc(t.dailyWin?t.dailyWin.text:'')+'" onchange="App.saveDailyWin(this)" placeholder="Bugünün kazanımı..." style="border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 13px;font-size:var(--f-subhead);outline:none;color:var(--text);">';
    if(saved) h+='<div style="font-size:var(--f-caption2);color:#3F8A4F;display:flex;align-items:center;gap:5px;">'+icon('check',11)+' Kazanım kaydedildi</div>';
    h+='</div>';
    return h;
  }
  var FLEX_NUDGE_PROMPTS=[
    'Bugün mükemmellik değil, ilerleme niyetiyle hareket ediyorum.',
    'Plan değişse de nefes alıp yeni bir küçük adım bulabilirim.',
    'Kontrol edemediğim şeylere izin veriyorum; kendime ise yumuşak davranıyorum.',
    'Bugün "iyi yeterli" demeyi pratik ediyorum.',
    'Bir şeyi ertelemişsem bu karakterim değil, o anın durumuydu.'
  ];
  function flexNudgeFor(dateStr){
    var data=liveData();
    var dayIdx=Math.max(0,Math.abs(diffDays(data.startDate||'2026-07-13', dateStr)));
    return FLEX_NUDGE_PROMPTS[dayIdx%FLEX_NUDGE_PROMPTS.length];
  }
  function roomFlexNudgeHTML(mot, fi, delay){
    var nudge=flexNudgeFor(activeDate());
    var h='<div style="'+fi(delay)+'display:flex;flex-direction:column;gap:9px;background:rgba(233,175,193,0.10);border:1px solid rgba(233,175,193,0.35);border-radius:18px;padding:14px;">';
    h+='<div style="display:flex;align-items:center;gap:7px;font-size:var(--f-caption2);font-weight:800;letter-spacing:.5px;color:#B77A8E;text-transform:uppercase;"><span style="display:inline-flex;">'+icon('wind',13)+'</span>Esneklik nudgesı</div>';
    h+='<div style="font-size:var(--f-footnote);color:var(--text2);line-height:1.55;font-style:italic;">'+esc(nudge)+'</div>';
    h+='<button onclick="App.copyFlexNudge()" style="align-self:flex-start;border:1px solid rgba(233,175,193,0.45);background:transparent;cursor:pointer;padding:8px 13px;border-radius:12px;font-size:var(--f-caption1);font-weight:700;color:#B77A8E;display:flex;align-items:center;gap:6px;">'+icon('copy',12)+' Bugünün niyetine kopyala</button>';
    h+='</div>';
    return h;
  }
  function roomToolCard(id, ic, title, subtitle, body, fi, delay){
    var ui=liveUi();
    var open=ui.roomTool===id;
    var h='';
    h+='<div style="'+fi(delay)+(open?'border-color:var(--room);':'')+'display:flex;flex-direction:column;gap:0;background:linear-gradient(160deg,var(--room-bg),transparent);border:1px solid color-mix(in srgb,var(--room) 20%,var(--card-bd));border-radius:18px;overflow:hidden;">';
    h+='<button type="button" onclick="App.toggleRoomTool(\''+id+'\')" style="width:100%;border:none;background:transparent;cursor:pointer;padding:14px;display:flex;align-items:center;gap:11px;text-align:left;">';
    h+='<span style="width:36px;height:36px;border-radius:12px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:var(--room);background:color-mix(in srgb,var(--room) 15%,var(--icon));box-shadow:inset 0 1px 0 rgba(255,255,255,0.4);">'+icon(ic,18)+'</span>';
    h+='<div style="flex:1;min-width:0;">';
    h+='<div style="font-size:var(--f-subhead);font-weight:800;color:var(--text);line-height:1.2;">'+esc(title)+'</div>';
    if(subtitle) h+='<div style="font-size:var(--f-caption1);color:var(--muted);line-height:1.35;margin-top:1px;">'+esc(subtitle)+'</div>';
    h+='</div>';
    h+='<span style="flex-shrink:0;display:inline-flex;transition:transform .2s ease;transform:rotate('+(open?'90deg':'0deg')+');color:var(--muted);">'+icon('chevron-up',14)+'</span>';
    h+='</button>';
    if(open){
      h+='<div style="padding:0 14px 14px;animation:seyFloatIn .22s ease both;">';
      h+=body;
      h+='</div>';
    }
    h+='</div>';
    return h;
  }
  function roomToolsHTML(fi){
    var data=liveData();
    var day=getDay(data,activeDate()).therapy;
    var ui=liveUi();
    var h='';
    h+='<div style="'+fi(0.02)+'font-size:var(--f-footnote);color:var(--muted);line-height:1.5;text-align:center;">Zor anlar geçicidir; bu araçlar seni orada karşılar. Küçük bir adım da yeterli.</div>';
    // İlk Adım Asistanı
    var fsBody='';
    fsBody+='<div style="display:flex;flex-direction:column;gap:10px;">';
    fsBody+='<div style="font-size:var(--f-footnote);color:var(--text2);line-height:1.5;">Bugün hangi küçük adımı atabilirim? Sadece ilk hamleyi yaz, gerisi kendiliğinden açılır.</div>';
    fsBody+='<input id="sey-room-first-text" type="text" maxlength="200" value="'+esc(day.firstStep.text)+'" placeholder="Örn. su bardağını kaldırıp 5 dakika otur..." onchange="App.saveFirstStep(this)" style="border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 13px;font-size:var(--f-subhead);outline:none;color:var(--text);">';
    fsBody+='<div style="display:flex;gap:8px;align-items:center;">';
    var fsActive=!!ui.roomFirstTimer;
    fsBody+='<button onclick="App.startFirstStepTimer()" '+(fsActive?'disabled':'')+' style="flex:1;border:none;cursor:'+(fsActive?'not-allowed':'pointer')+';padding:11px;border-radius:12px;font-size:var(--f-footnote);font-weight:800;color:#fff;background:linear-gradient(135deg,var(--room2),var(--room));opacity:'+(fsActive?'0.5':'1')+';">'+icon('alarm-clock',13)+' 2 dakika şimdi başla</button>';
    fsBody+='<div id="sey-room-first-count" style="font-size:var(--f-headline);font-weight:800;color:var(--room);font-variant-numeric:tabular-nums;min-width:50px;text-align:center;">'+(fsActive?'02:00':'')+'</div>';
    fsBody+='</div>';
    if(day.firstStep.completedAt) fsBody+='<div style="font-size:var(--f-caption2);color:#3F8A4F;display:flex;align-items:center;gap:5px;">'+icon('check',11)+' '+fmtWhen(day.firstStep.completedAt)+' tamamlandı</div>';
    fsBody+='</div>';
    h+=roomToolCard('firstStep','footprints','İlk Adım Asistanı','2 dakikalık başlangıç zamanlayıcısı',fsBody,fi,0.04);
    // Öz-Şefkat Anı
    var scPrompts=['Kendine bugün söyleyebileceğin en nazik cümle nedir?','Bu zorluk senin kusurun değil, o anın koşulu.','Nefes al. Şimdi kendine bir çocuğa söyler gibi bir cümle kur.','Kendini iyi hissetmek zorunda değilsin; sadece yanında olmak yeterli.'];
    var scIdx=Math.max(0,Math.abs(diffDays(data.startDate||'2026-07-13', activeDate())))%scPrompts.length;
    var scBody='';
    scBody+='<div style="display:flex;flex-direction:column;gap:10px;">';
    scBody+='<div style="font-size:var(--f-footnote);color:var(--room);line-height:1.5;font-style:italic;">'+esc(scPrompts[scIdx])+'</div>';
    scBody+='<input id="sey-room-sc" type="text" maxlength="200" value="'+esc(day.selfCompassion.note)+'" placeholder="Kendime şimdi ne söyleyebilirim..." onchange="App.saveSelfCompassion(this)" style="border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 13px;font-size:var(--f-subhead);outline:none;color:var(--text);">';
    scBody+='<div style="display:flex;flex-wrap:wrap;gap:6px;">';
    ['Bu kadarı yeterli','Zorlanmak insanî','Yarın için biriktiriyorum','Kendime sabırlıyım'].forEach(function(c){
      scBody+='<button data-fx="destructive" onclick="App.presetSelfCompassion(\''+esc(c.replace(/'/g,"\\'"))+'\')" style="border:1px solid rgba(233,175,193,0.4);background:transparent;cursor:pointer;padding:6px 10px;border-radius:999px;font-size:var(--f-caption1);font-weight:700;color:var(--text2);">'+esc(c)+'</button>';
    });
    scBody+='</div>';
    if(day.selfCompassion.completedAt) scBody+='<div style="font-size:var(--f-caption2);color:#3F8A4F;display:flex;align-items:center;gap:5px;">'+icon('check',11)+' '+fmtWhen(day.selfCompassion.completedAt)+' kaydedildi</div>';
    scBody+='</div>';
    h+=roomToolCard('selfCompassion','heart','Öz-Şefkat Anı','Kendine nazik bir cümle',scBody,fi,0.06);
    // Rehberli Nefes
    var brBody='';
    brBody+='<div style="display:flex;flex-direction:column;gap:12px;align-items:center;">';
    brBody+='<div style="display:flex;gap:6px;">';
    ['4-7-8','Kutu (4-4-4-4)'].forEach(function(p){
      var on=day.breath.pattern===p;
      brBody+='<button onclick="App.setBreathPattern(\''+p+'\')" style="border:1px solid '+(on?'var(--room)':'var(--field-bd)')+';background:'+(on?'color-mix(in srgb,var(--room) 15%,var(--icon))':'var(--field)')+';cursor:pointer;padding:7px 12px;border-radius:999px;font-size:var(--f-caption1);font-weight:800;color:'+(on?'var(--room)':'var(--muted)')+';">'+esc(p)+'</button>';
    });
    brBody+='</div>';
    brBody+='<div id="sey-room-breath-ring" style="width:110px;height:110px;border-radius:50%;border:3px solid var(--room);display:flex;align-items:center;justify-content:center;transition:transform .6s ease,box-shadow .6s ease;">';
    brBody+='<div style="text-align:center;">';
    brBody+='<div id="sey-room-breath-label" style="font-size:var(--f-subhead);font-weight:800;color:var(--room);">Hazır</div>';
    brBody+='<div id="sey-room-breath-count" style="font-size:var(--f-title2);font-weight:800;color:var(--text);font-variant-numeric:tabular-nums;">--</div>';
    brBody+='</div></div>';
    brBody+='<button id="sey-room-breath-btn" onclick="App.toggleBreath()" style="border:none;cursor:pointer;padding:12px 18px;border-radius:14px;font-size:var(--f-subhead);font-weight:800;color:#fff;background:linear-gradient(135deg,var(--room2),var(--room));">'+(ui.roomBreathActive?'Durdur':'Nefes başlat')+'</button>';
    brBody+='</div>';
    h+=roomToolCard('breath','wind','Rehberli Nefes','4-7-8 veya kutu nefesi',brBody,fi,0.08);
    // Karar Hızlandırıcı
    var dcBody='';
    dcBody+='<div style="display:flex;flex-direction:column;gap:10px;">';
    dcBody+='<div style="font-size:var(--f-caption1);color:var(--muted);line-height:1.45;">İki seçenek yaz, 2 dakika düşün, sonra "iyi yeterli" deyip ilerle.</div>';
    dcBody+='<input id="sey-room-dec-a" type="text" maxlength="120" value="'+esc(day.decision.optionA)+'" placeholder="Seçenek A" onchange="App.saveDecision()" style="border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:10px 12px;font-size:var(--f-subhead);outline:none;color:var(--text);">';
    dcBody+='<input id="sey-room-dec-b" type="text" maxlength="120" value="'+esc(day.decision.optionB)+'" placeholder="Seçenek B" onchange="App.saveDecision()" style="border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:10px 12px;font-size:var(--f-subhead);outline:none;color:var(--text);">';
    dcBody+='<div style="display:flex;gap:8px;align-items:center;">';
    var dcActive=!!ui.roomDecisionTimer;
    dcBody+='<button onclick="App.startDecisionTimer()" '+(dcActive?'disabled':'')+' style="flex:1;border:none;cursor:'+(dcActive?'not-allowed':'pointer')+';padding:11px;border-radius:12px;font-size:var(--f-footnote);font-weight:800;color:#fff;background:linear-gradient(135deg,var(--room2),var(--room));opacity:'+(dcActive?'0.5':'1')+';">'+icon('clock',13)+' 2 dk kum saati</button>';
    dcBody+='<div id="sey-room-dec-count" style="font-size:var(--f-headline);font-weight:800;color:var(--room);font-variant-numeric:tabular-nums;min-width:50px;text-align:center;">'+(dcActive?'02:00':'')+'</div>';
    dcBody+='</div>';
    dcBody+='<div style="display:flex;gap:8px;">';
    dcBody+='<button onclick="App.chooseDecision(\'A\')" style="flex:1;border:1px solid var(--room);background:transparent;cursor:pointer;padding:10px;border-radius:12px;font-size:var(--f-footnote);font-weight:800;color:var(--room);">A seç</button>';
    dcBody+='<button onclick="App.chooseDecision(\'B\')" style="flex:1;border:1px solid var(--room);background:transparent;cursor:pointer;padding:10px;border-radius:12px;font-size:var(--f-footnote);font-weight:800;color:var(--room);">B seç</button>';
    dcBody+='<button onclick="App.chooseDecision(\'yeterli\')" style="flex:1;border:1px solid rgba(233,175,193,0.45);background:transparent;cursor:pointer;padding:10px;border-radius:12px;font-size:var(--f-footnote);font-weight:800;color:#B77A8E;">İyi yeterli</button>';
    dcBody+='</div>';
    if(day.decision.choice) dcBody+='<div style="font-size:var(--f-caption2);color:var(--room);display:flex;align-items:center;gap:5px;">'+icon('scale',11)+' Seçim: <b>'+esc(day.decision.choice)+'</b> · '+fmtWhen(day.decision.completedAt)+'</div>';
    dcBody+='</div>';
    h+=roomToolCard('decision','scale','Karar Hızlandırıcı','A/B + 2 dakika + iyi yeterli',dcBody,fi,0.1);
    // Düşünce Kaydı (CBT)
    var cbBody='';
    cbBody+='<div style="display:flex;flex-direction:column;gap:10px;">';
    cbBody+='<div style="font-size:var(--f-caption1);color:var(--muted);line-height:1.45;">Düşünceyi yavaşlat, kanıtları ve karşı kanıtları yaz, daha dengeli bir alternatif bul.</div>';
    cbBody+='<input id="sey-room-thought-sit" type="text" maxlength="160" placeholder="Durum / ne oldu?" style="border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:10px 12px;font-size:var(--f-subhead);outline:none;color:var(--text);">';
    cbBody+='<input id="sey-room-thought-th" type="text" maxlength="160" placeholder="Aklımdan geçen düşünce" style="border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:10px 12px;font-size:var(--f-subhead);outline:none;color:var(--text);">';
    cbBody+='<input id="sey-room-thought-for" type="text" maxlength="160" placeholder="Bu düşüncenin lehinde kanıt" style="border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:10px 12px;font-size:var(--f-subhead);outline:none;color:var(--text);">';
    cbBody+='<input id="sey-room-thought-against" type="text" maxlength="160" placeholder="Aleyhinde kanıt" style="border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:10px 12px;font-size:var(--f-subhead);outline:none;color:var(--text);">';
    cbBody+='<input id="sey-room-thought-alt" type="text" maxlength="160" placeholder="Daha dengeli alternatif düşünce" style="border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:10px 12px;font-size:var(--f-subhead);outline:none;color:var(--text);">';
    cbBody+='<button onclick="App.saveThought()" style="border:none;cursor:pointer;padding:11px;border-radius:12px;font-size:var(--f-footnote);font-weight:800;color:#fff;background:linear-gradient(135deg,var(--room2),var(--room));">'+icon('brain',13)+' Kaydet</button>';
    if(day.thoughts.length){
      cbBody+='<div style="display:flex;flex-direction:column;gap:8px;">';
      day.thoughts.slice().reverse().forEach(function(th){
        cbBody+='<div style="background:var(--icon);border-radius:12px;padding:10px 12px;font-size:var(--f-caption1);color:var(--text2);line-height:1.45;">';
        cbBody+='<div style="font-weight:800;color:var(--room);margin-bottom:3px;">'+esc(th.situation)+'</div>';
        cbBody+='<div>'+esc(th.thought)+' → '+esc(th.altThought)+'</div>';
        cbBody+='<div style="font-size:var(--f-caption2);color:var(--faint);margin-top:3px;">'+fmtWhen(th.createdAt)+'</div>';
        cbBody+='</div>';
      });
      cbBody+='</div>';
    }
    cbBody+='</div>';
    h+=roomToolCard('thought','brain','Düşünce Kaydı (CBT)','Durum → düşünce → kanıtlar → alternatif',cbBody,fi,0.12);
    // Güvenli Paylaşım
    var shBody='';
    shBody+='<div style="display:flex;flex-direction:column;gap:10px;">';
    shBody+='<div style="font-size:var(--f-footnote);color:var(--text2);line-height:1.5;">Zor hissediyorsan tek dokunuşla ÆON\'a güvenli bir sinyal gönder. İstersen kısa not ekle.</div>';
    shBody+='<input id="sey-room-share-note" type="text" maxlength="200" value="'+esc(day.share.note)+'" placeholder="İsteğe bağlı not (örn. konu, saat)" onchange="App.saveShareNote(this)" style="border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 13px;font-size:var(--f-subhead);outline:none;color:var(--text);">';
    shBody+='<button onclick="App.sendAeonShare()" style="border:none;cursor:pointer;padding:13px;border-radius:14px;font-size:var(--f-subhead);font-weight:800;color:#fff;background:linear-gradient(135deg,var(--room2),var(--room));display:flex;align-items:center;justify-content:center;gap:8px;">'+icon('send-horizontal',15)+' Şu an zor hissediyorum</button>';
    if(day.share.sentAt) shBody+='<div style="font-size:var(--f-caption2);color:var(--room);display:flex;align-items:center;gap:5px;">'+icon('check',11)+' '+fmtWhen(day.share.sentAt)+' iletildi</div>';
    shBody+='</div>';
    h+=roomToolCard('share','send','Güvenli Paylaşım','ÆON\'a tek dokunuşla sinyal',shBody,fi,0.14);
    return h;
  }
  function roomProfileHTML(fi){
    var data=liveData();
    var p=data.scientificProfile||{};
    var fetched=!!p.assessedAt;
    var ui=liveUi();
    var h='';
    h+='<div style="'+fi(0.02)+'font-size:var(--f-footnote);color:var(--muted);line-height:1.5;text-align:center;">Profilindeki bilgiler uygulamanın sana özel önerilerini şekillendiriyor.</div>';
    if(ui.roomProfileFetchState==='loading'){
      h+='<div style="'+fi(0.04)+'display:flex;align-items:center;justify-content:center;gap:8px;padding:28px;color:var(--muted);"><span class="seyIconSpin">'+icon('rotate-ccw',18)+'</span> Profil yükleniyor...</div>';
    } else if(ui.roomProfileFetchState==='error'){
      h+='<div style="'+fi(0.04)+'display:flex;flex-direction:column;gap:10px;align-items:center;padding:20px;background:rgba(233,175,193,0.12);border:1px solid rgba(233,175,193,0.35);border-radius:18px;">';
      h+='<div style="font-size:var(--f-footnote);color:var(--text2);text-align:center;">Profil raporu yüklenemedi.</div>';
      if(ui.roomProfileError) h+='<div style="font-size:var(--f-caption2);color:var(--faint);text-align:center;">'+esc(ui.roomProfileError)+'</div>';
      h+='<button onclick="App.fetchProfileForRoom()" style="border:1px solid var(--room);background:transparent;cursor:pointer;padding:8px 14px;border-radius:12px;font-size:var(--f-caption1);font-weight:800;color:var(--room);">Tekrar dene</button>';
      h+='</div>';
    }
    if(!fetched){
      h+='<div style="'+fi(0.04)+'display:flex;flex-direction:column;gap:12px;align-items:center;padding:20px;border:1px dashed var(--card-bd);border-radius:18px;">';
      h+='<div style="font-size:var(--f-footnote);color:var(--text2);text-align:center;">Henüz bilimsel profil raporu çekilmemiş.</div>';
      h+='<button onclick="App.fetchProfileForRoom()" style="border:none;cursor:pointer;padding:12px 16px;border-radius:14px;font-size:var(--f-subhead);font-weight:800;color:#fff;background:linear-gradient(135deg,var(--room2),var(--room));">'+icon('sparkles',14)+' Profili çek</button>';
      h+='<div style="font-size:var(--f-caption2);color:var(--faint);text-align:center;">Veri reposundan okunur; buraya kaydedilmez.</div>';
      h+='</div>';
      return h;
    }
    // Hero
    h+='<div style="'+fi(0.04)+'display:flex;flex-direction:column;gap:10px;background:linear-gradient(160deg,var(--room-bg),transparent);border:1px solid color-mix(in srgb,var(--room) 20%,var(--card-bd));border-radius:20px;padding:16px;">';
    h+='<div style="display:flex;align-items:center;gap:10px;">';
    h+='<span style="width:44px;height:44px;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;color:#fff;background:linear-gradient(135deg,var(--room2),var(--room));">'+icon('sparkles',22)+'</span>';
    h+='<div style="flex:1;">';
    h+='<div style="font-size:var(--f-callout);font-weight:800;color:var(--text);">Bilimsel profil özeti</div>';
    h+='<div style="font-size:var(--f-caption2);color:var(--muted);">'+(p.assessedAt?call('fmtDateNice',[p.assessedAt]):'')+(p.source?' · '+esc(p.source):'')+'</div>';
    h+='</div></div>';
    if(typeof p.confidence==='number'){
      h+='<div style="display:flex;align-items:center;gap:10px;">';
      h+='<div id="sey-motivation-bar" style="flex:1;">'+call('progBar',[p.confidence,'linear-gradient(90deg,var(--room2),var(--room))'])+'</div>';
      h+='<div style="font-size:var(--f-footnote);font-weight:800;color:var(--room);white-space:nowrap;">%'+p.confidence+' güven</div>';
      h+='</div>';
    }
    if(p.riasec&&p.riasec.length){
      h+='<div style="display:flex;flex-wrap:wrap;gap:6px;">';
      p.riasec.forEach(function(r){ h+='<span style="font-size:var(--f-caption2);font-weight:800;padding:5px 10px;border-radius:999px;background:var(--icon);color:var(--text2);">'+esc(roomPrettyRiasec(r))+'</span>'; });
      h+='</div>';
    }
    if(p.values&&p.values.length){
      h+='<div style="display:flex;flex-wrap:wrap;gap:6px;">';
      p.values.forEach(function(v){ h+='<span style="font-size:var(--f-caption2);font-weight:800;padding:5px 10px;border-radius:999px;border:1px solid color-mix(in srgb,var(--room) 30%,var(--card-bd));color:var(--room);">'+esc(roomPrettyValue(v))+'</span>'; });
      h+='</div>';
    }
    h+='</div>';
    // Güçlü yönler & dikkat alanları
    h+='<div style="'+fi(0.06)+'display:flex;flex-direction:column;gap:10px;">';
    if(p.strengths&&p.strengths.length){
      h+='<div style="background:color-mix(in srgb,#3F8A4F 8%,var(--icon));border-radius:16px;padding:14px;">';
      h+='<div style="font-size:var(--f-caption2);font-weight:800;color:#3F8A4F;text-transform:uppercase;letter-spacing:.3px;margin-bottom:6px;display:flex;align-items:center;gap:5px;">'+icon('zap',12)+' Güçlü yönler</div>';
      h+='<ul style="margin:0;padding-left:18px;font-size:var(--f-footnote);color:var(--text2);line-height:1.5;">';
      p.strengths.forEach(function(s){ h+='<li>'+esc(s)+'</li>'; });
      h+='</ul></div>';
    }
    if(p.risks&&p.risks.length){
      h+='<div style="background:color-mix(in srgb,#E9899F 8%,var(--icon));border-radius:16px;padding:14px;">';
      h+='<div style="font-size:var(--f-caption2);font-weight:800;color:#B77A8E;text-transform:uppercase;letter-spacing:.3px;margin-bottom:6px;display:flex;align-items:center;gap:5px;">'+icon('triangle-alert',12)+' Dikkat alanları</div>';
      h+='<ul style="margin:0;padding-left:18px;font-size:var(--f-footnote);color:var(--text2);line-height:1.5;">';
      p.risks.forEach(function(r){ h+='<li>'+esc(r)+'</li>'; });
      h+='</ul></div>';
    }
    h+='</div>';
    // Sana özel içerik önerileri
    h+='<div style="'+fi(0.08)+'display:flex;flex-direction:column;gap:10px;">';
    h+='<div style="font-size:var(--f-caption2);font-weight:800;letter-spacing:.5px;color:var(--room);text-transform:uppercase;display:flex;align-items:center;gap:5px;">'+icon('lightbulb',12)+' Günün profil-uyumlu seçkisi</div>';
    h+='<div style="font-size:var(--f-caption1);color:var(--muted);line-height:1.45;">Her gün farklı, güvenilir kaynaklardan bir kitap, bir izleme ve bir dinleme önerisi. Kartlara dokununca kaynağa gidersin.</div>';
    h+=roomDailyContentHTML(p,fi);
    h+='</div>';
    // Panel Profil Işığı
    h+='<div style="'+fi(0.1)+'display:flex;flex-direction:column;gap:8px;background:linear-gradient(135deg,rgba(233,175,193,0.14),rgba(201,184,255,0.12));border:1px solid color-mix(in srgb,var(--room) 20%,var(--card-bd));border-radius:18px;padding:14px;">';
    h+='<div style="font-size:var(--f-caption2);font-weight:800;letter-spacing:.5px;color:var(--room);text-transform:uppercase;display:flex;align-items:center;gap:5px;">'+icon('heart-handshake',12)+' Panel Profil Işığı</div>';
    h+='<div style="font-size:var(--f-footnote);color:var(--text2);line-height:1.55;">Gözlemciye kısa rehber: Küçük başarıları takdir et, zor anlarda duraklat, başlamada destek ol. Kontrolcü bir çizgiye düşürme; nazik hatırlatma ver.</div>';
    h+='</div>';
    // Dipnot
    if(p.note) h+='<div style="'+fi(0.12)+'font-size:var(--f-caption2);color:var(--faint);line-height:1.4;text-align:center;">'+esc(p.note)+'</div>';
    return h;
  }
  function roomPrettyRiasec(r){
    var map={social:'Sosyal',conventional:'Düzenleyici',enterprising:'Girişimci',artistic:'Sanatsal',investigative:'Araştırmacı',realistic:'Gerçekçi'};
    return map[String(r).toLowerCase()]||esc(r);
  }
  function roomPrettyValue(v){
    var map={security:'Güvenilirlik',benevolence:'İyilikseverlik',achievement:'Başarı',conformity:'Uyum',hedonism:'Hazcılık',power:'Güç',self_direction:'Özgünlük',stimulation:'Uyarım',tradition:'Gelenek',universalism:'Evrensellik'};
    return map[String(v).toLowerCase()]||esc(v);
  }
  function roomCalendarDayIndex(){
    var now=new Date();
    var d=new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.floor(d.getTime()/86400000);
  }
  function roomDailyContentHTML(p,fi){
    var data=liveData();
    var dayIdx=roomCalendarDayIndex();
    var read=ROOM_CONTENT_CATALOG.read[dayIdx%ROOM_CONTENT_CATALOG.read.length];
    var watch=ROOM_CONTENT_CATALOG.watch[dayIdx%ROOM_CONTENT_CATALOG.watch.length];
    var listen=ROOM_CONTENT_CATALOG.listen[dayIdx%ROOM_CONTENT_CATALOG.listen.length];
    var today=activeDate();
    // Mevcut davranış korunur: günün seçkisi canlı root'a yazılır; kalıcı
    // kayıt app.js'in save/commit kabuğunun sorumluluğundadır.
    if(!data.roomContentHistory) data.roomContentHistory={};
    data.roomContentHistory[today]={read:read,watch:watch,listen:listen,shownAt:new Date().toISOString()};
    var items=[
      {type:'Kitap',ic:'book',col:'var(--room2),var(--room)',item:read},
      {type:'İzleme',ic:'clapperboard',col:'#C88F4C,#E0B080',item:watch},
      {type:'Podcast / Ses',ic:'disc',col:'#0E9AA7,#2BC4C4',item:listen}
    ];
    var h='';
    items.forEach(function(it,i){
      h+='<a href="'+esc(it.item.url)+'" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation();" style="'+fi(0.08+i*0.02)+'display:flex;gap:11px;background:var(--icon);border:1px solid var(--card-bd);border-radius:16px;padding:13px;text-decoration:none;">';
      h+='<span style="width:34px;height:34px;border-radius:10px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:#fff;background:linear-gradient(135deg,'+it.col+');">'+icon(it.ic,17)+'</span>';
      h+='<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;">';
      h+='<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">';
      h+='<span style="font-size:var(--f-caption2);font-weight:800;color:var(--room);text-transform:uppercase;">'+esc(it.type)+'</span>';
      h+='<span style="font-size:var(--f-caption2);color:var(--faint);">'+esc(it.item.source)+' · '+esc(String(it.item.year))+'</span>';
      h+='</div>';
      h+='<div style="font-size:var(--f-footnote);font-weight:800;color:var(--text);line-height:1.2;">'+esc(it.item.title)+'</div>';
      h+='<div style="font-size:var(--f-caption2);color:var(--muted);line-height:1.3;">'+esc(it.item.creator)+'</div>';
      h+='<div style="font-size:var(--f-caption1);color:var(--text2);line-height:1.4;">'+esc(it.item.summary)+'</div>';
      h+='</div>';
      h+='<span style="flex-shrink:0;color:var(--muted);align-self:center;">'+icon('external-link',15)+'</span>';
      h+='</a>';
    });
    return h;
  }

  // ── Profil raporu parser'ı (app.js parseScientificProfileMD + roomValueKey aynen) ──
  function parseScientificProfileMD(md){
    if(!md||typeof md!=='string') md='';
    var p={source:'seyma-data',assessedAt:'2026-07-13',confidence:null,consent:'öz-bildirime dayalı',riasec:[],values:[],traits:{},attachment:{},strengths:[],risks:[],note:'Öz-bildirime dayalı; klinik tanı değildir.'};
    var txt=md.replace(/^\s*#/,'');
    var findLine=function(re){ var m=txt.match(re); return m?m[1].trim():null; };
    var findBlock=function(startRe){
      var start=txt.search(startRe);
      if(start<0) return [];
      var end=start+1;
      while(end<txt.length&&!txt.substr(end).match(/^#{1,3}\s/m)) end++;
      var block=txt.substring(start,end);
      return block.split(/\n[\*\-]\s+/).slice(1).map(function(s){ return s.replace(/\n/g,' ').replace(/\*\*/g,'').trim(); }).filter(Boolean);
    };
    var date=findLine(/Değerlendirme Tarihi:\s*([^\n]+)/i); if(date) p.assessedAt=date;
    var conf=findLine(/Güvenilirlik:\s*(%?)([\d\.]+)/i); if(conf) p.confidence=Math.round(parseFloat(conf[2])||0);
    if(txt.match(/Sosyal/i)) p.riasec.push('social');
    if(txt.match(/Düzenleyici|Conventional/i)) p.riasec.push('conventional');
    if(txt.match(/Girişimci|Enterprising/i)) p.riasec.push('enterprising');
    if(!p.riasec.length) p.riasec=['social','conventional','enterprising'];
    ['güvenilirlik','iyilikseverlik','başarı','uyum','özgünlük'].forEach(function(v){
      if(new RegExp(v,'i').test(txt)) p.values.push(roomValueKey(v));
    });
    if(!p.values.length) p.values=['security','benevolence','achievement'];
    p.strengths=findBlock(/##\s*Güçlü Yönler/i);
    p.risks=findBlock(/##\s*Dikkat|Risk|Aşırı/i);
    if(!p.strengths.length) p.strengths=['Düzen ve sorumluluk','Adillik ve kanıta saygı','İçsel motivasyon','Metabilişsel farkındalık'];
    if(!p.risks.length) p.risks=['Aşırı kontrol ihtiyacı','Duygusal hassasiyet','Temkinlilik / erteleme'];
    return p;
  }
  function roomValueKey(tr){
    var map={'güvenilirlik':'security','iyilikseverlik':'benevolence','başarı':'achievement','uyum':'conformity','özgünlük':'self_direction'};
    return map[String(tr).toLowerCase()]||tr;
  }

  var motDeps=null;
var ROOM_CONTENT_CATALOG={
  read:[
    {title:'Atomik Alışkanlıklar',creator:'James Clear · Çev. İlksen Aydın',year:2019,source:'İletişim Yayınları · davranış değişimi',summary:'Küçük, tekrarlı sistemlerle büyük değişimi nasıl inşa edersin.',url:'https://www.idefix.com/kitap/atomik-aliskanliklar'},
    {title:'Düşünecek Zaman',creator:'Daniel Kahneman · Çev. Gül Çağalı Güven',year:2012,source:'Varlık Yayınları · davranışsal ekonomi',summary:'Hızlı ve yavaş düşünme sistemleriyle karar verme mekanizmaları.',url:'https://www.idefix.com/kitap/dusunecek-zaman'},
    {title:'Beden Hafızası',creator:'Bessel van der Kolk · Çev. İnci Yılmaz',year:2021,source:'Kolektif Kitap · travma ve iyileşme',summary:'Travmanın bedende nasıl depolandığı ve iyileşme yolları.',url:'https://www.idefix.com/kitap/beden-hafizasi'},
    {title:'Sessizliğin Gücü',creator:'Susan Cain · Çev. İlksen Aydın',year:2013,source:'Pegasus Yayınları · kişilik psikolojisi',summary:'İçe dönüklüğün gücü ve yaratıcılıktaki rolü.',url:'https://www.idefix.com/kitap/sessizligin-gucu'},
    {title:'İnsan Anlam Arayışında',creator:'Viktor Frankl · Çev. Ülkü Akagündüz',year:2019,source:'Kaknüs Yayınları · varoluşçu psikoloji',summary:'Anlamın acıya karşı dayanıklılık sağladığı.',url:'https://www.idefix.com/kitap/insan-anlam-arayisinda'},
    {title:'Şiddetsiz İletişim',creator:'Marshall Rosenberg · Çev. Zeynep Arıkan',year:2015,source:'Sistem Yayıncılık · iletişim',summary:'Empati temelli konuşma ve çatışma çözümü.',url:'https://www.idefix.com/kitap/siddetsiz-iletisim'},
    {title:'Zihin Seti',creator:'Carol Dweck · Çev. Banu Ünalmış',year:2017,source:'Timaş Yayınları · gelişim psikolojisi',summary:'Büyüme ve sabit zihin setleri arasındaki fark.',url:'https://www.idefix.com/kitap/zihin-seti'},
    {title:'Cesurca',creator:'Brené Brown · Çev. Mine Derhudun',year:2013,source:'Mediacat · kırılganlık ve bağlanma',summary:'Kırılganlığın güç ve yaratıcılık kaynağı olduğu.',url:'https://www.idefix.com/kitap/cesurca'},
    {title:'Kusursuzluğun Bedeli',creator:'Brené Brown · Çev. Mine Derhudun',year:2011,source:'Mediacat · şefkat ve güven',summary:'Yeterlik, bağlılık ve öz-şefkatle bütünleşmek.',url:'https://www.idefix.com/kitap/kusursuzlugun-bedeli'},
    {title:'Mutluluk Hipotezi',creator:'Jonathan Haidt · Çev. İlksen Aydın',year:2007,source:'Pegasus Yayınları · pozitif psikoloji',summary:'Antik bilgelik ve modern psikolojinin mutluluk üzerine kesişimi.',url:'https://www.idefix.com/kitap/mutluluk-hipotezi'},
    {title:'Meditasyon ve Ahlak',creator:'Yuval Noah Harari · Çev. İlksen Aydın',year:2019,source:'Kolektif Kitap · farkındalık',summary:'Bilinç ve ahlak üzerine kısa, yoğun bir kılavuz.',url:'https://www.idefix.com/kitap/meditasyon-ve-ahlak'},
    {title:'Duygusal Zeka',creator:'Daniel Goleman · Çev. İlksen Aydın',year:2013,source:'Varlık Yayınları · duygusal zeka',summary:'Duyguları tanıma, yönetme ve ilişkilerde kullanma.',url:'https://www.idefix.com/kitap/duygusal-zeka'},
    {title:'Kaygıdan Özgür',creator:'Seth J. Gillihan · Çev. Zeynep Arıkan',year:2020,source:'Sistem Yayıncılık · anksiyete',summary:'Kaygıyı anlamak ve günlük pratiklerle yatıştırmak.',url:'https://www.idefix.com/kitap/kaygidan-ozgur'},
    {title:'Depresyon Günlüğü',creator:'Richard O’Connor · Çev. Binnur Şener',year:2016,source:'Pegasus Yayınları · ruh sağlığı',summary:'Depresyonu tanıma ve günlük alışkanlıklarla aşma.',url:'https://www.idefix.com/kitap/depresyon-gunlugu'},
    {title:'İlişki Terapisi',creator:'Esther Perel · Çev. Melis Şimşek',year:2018,source:'Mediacat · ilişkiler',summary:'Yakınlık, arzu ve ilişkilerdeki gerilimleri anlama.',url:'https://www.idefix.com/kitap/iliski-terapisi'},
    {title:'Odaklanma',creator:'Cal Newport · Çev. Gülçin Kaya',year:2018,source:'Timaş Yayınları · derin çalışma',summary:'Dikkat dağıtıcılara karşı derin odaklanma becerisi.',url:'https://www.idefix.com/kitap/odaklanma'},
    {title:'Hayır Demeyi Öğren',creator:'Henry Cloud / John Townsend · Çev. Banu Ünalmış',year:2015,source:'Timaş Yayınları · sınırlar',summary:'Sağlıklı sınırlar kurmak ve kendine hayır demek.',url:'https://www.idefix.com/kitap/hayir-demeyi-ogren'},
    {title:'Küçük Sözlerin Büyük Etkisi',creator:'Liz Fosslien / Mollie West Duffy',year:2020,source:'Kolektif Kitap · duygular iş yerinde',summary:'Duyguları tanımak ve ifade etmek için pratik bir kılavuz.',url:'https://www.idefix.com/kitap/kucuk-sozlerin-buyuk-etkisi'},
    {title:'Affetmek Sanatı',creator:'Thich Nhat Hanh · Çev. Esra Büşra Gültekin',year:2017,source:'Pegasus Yayınları · mindfulness',summary:'Öfkeyi dönüştürme ve affetmeyi pratik etme.',url:'https://www.idefix.com/kitap/affetmek-sanati'},
    {title:'Yavaşla',creator:'Carl Honoré · Çev. İlksen Aydın',year:2005,source:'Varlık Yayınları · yavaşlık hareketi',summary:'Hızlanan dünyada dengeyi bulmak için yavaşlamak.',url:'https://www.idefix.com/kitap/yavasla'},
    {title:'Merhametin Gücü',creator:'Kristin Neff · Çev. Zeynep Arıkan',year:2015,source:'Sistem Yayıncılık · öz-şefkat',summary:'Kendine karşı merhamet ve içsel eleştirmeni yatıştırma.',url:'https://www.idefix.com/kitap/merhametin-gucu'},
    {title:'Dijital Minimalizm',creator:'Cal Newport · Çev. Gülçin Kaya',year:2020,source:'Timaş Yayınları · dijital denge',summary:'Teknolojiyi bilinçli seçmek ve dikkati geri kazanmak.',url:'https://www.idefix.com/kitap/dijital-minimalizm'},
    {title:'Uykunun Gücü',creator:'Matthew Walker · Çev. İlksen Aydın',year:2018,source:'Pegasus Yayınları · uyku bilimi',summary:'Uyku sağlığın, belleğin ve duygu düzenlemenin temeli.',url:'https://www.idefix.com/kitap/uykunun-gucu'},
    {title:'Hareketin Şifası',creator:'Kelly McGonigal · Çev. Banu Ünalmış',year:2020,source:'Timaş Yayınları · hareket ve zihin',summary:'Fiziksel hareketin stres, kaygı ve özgüven üzerindeki etkisi.',url:'https://www.idefix.com/kitap/hareketin-sifasi'},
    {title:'İçsel Evren',creator:'Judith Orloff · Çev. Melis Şimşek',year:2018,source:'Mediacat · duygusal hassasiyet',summary:'Yüksek hassasiyeti güç ve empatiye dönüştürme.',url:'https://www.idefix.com/kitap/icsel-evren'},
    {title:'Mutlu Olma Sanatı',creator:'Matthieu Ricard · Çev. İlksen Aydın',year:2016,source:'Varlık Yayınları · mutluluk ve meditasyon',summary:'Mutluluğu bir beceri olarak eğitmek.',url:'https://www.idefix.com/kitap/mutlu-olma-sanati'},
    {title:'Hayatı Yavaş Yaşa',creator:'Pico Iyer · Çev. Esra Büşra Gültekin',year:2014,source:'Pegasus Yayınları · yavaşlık',summary:'Duraklama, sessizlik ve içsel huzur arayışı.',url:'https://www.idefix.com/kitap/hayati-yavas-yasa'},
    {title:'Duygularını Düzenle',creator:'Marc Brackett · Çev. Zeynep Arıkan',year:2020,source:'Sistem Yayıncılık · duygu okuryazarlığı',summary:'RULER yöntemiyle duyguları tanıma ve düzenleme.',url:'https://www.idefix.com/kitap/duygularini-duzenle'},
    {title:'Kendini Dinle',creator:'Leslie Greenberg · Çev. Banu Ünalmış',year:2017,source:'Timaş Yayınları · duygu odaklı terapi',summary:'Duyguların mesajını anlamak ve duygusal şifa bulmak.',url:'https://www.idefix.com/kitap/kendini-dinle'}
  ],
  watch:[
    {title:'Ters Yüz',creator:'Pixar',year:2015,source:'Disney+ · duygu psikolojisi',summary:'Duyguların iç dünyamızdaki işlevleri ve uyum.',url:'https://www.disneyplus.com/tr-tr/movies/ters-yuz/uzQxjZBJdX1S'},
    {title:'Soul',creator:'Pixar',year:2020,source:'Disney+ · anlam ve tutku',summary:'Hayat amacı, tutku ve “kıvılcım” anı üzerine.',url:'https://www.disneyplus.com/tr-tr/movies/soul/5pMovkR6I6cW'},
    {title:'Umudun Peşinde',creator:'Gabriele Muccino',year:2006,source:'Netflix · dayanıklılık',summary:'Zorluklar karşısında azim ve babalık hikâyesi.',url:'https://www.netflix.com/tr/title/70044696'},
    {title:'Can Dostum',creator:'Gus Van Sant',year:1997,source:'Prime Video · terapötik ilişki',summary:'Güven, kırılganlık ve değişim üzerine bir terapi hikâyesi.',url:'https://www.primevideo.com/detail/Can-Dostum'},
    {title:'Akıl Oyunları',creator:'Ron Howard',year:2001,source:'Netflix · dayanıklılık',summary:'Zihinsel zorluklarla yaşam ve başarı.',url:'https://www.netflix.com/tr/title/60022045'},
    {title:'Kralın Konuşması',creator:'Tom Hooper',year:2010,source:'Netflix · cesaret',summary:'Yenilgi korkusunu aşmak ve kendini ifade etmek.',url:'https://www.netflix.com/tr/title/70135851'},
    {title:'Headspace: Meditasyon Rehberi',creator:'Netflix / Headspace',year:2021,source:'Netflix · mindfulness',summary:'Animasyonlu meditasyon teknikleri.',url:'https://www.netflix.com/tr/title/81280998'},
    {title:'Ted Lasso',creator:'Apple TV+',year:2020,source:'Apple TV+ · liderlik ve şefkat',summary:'Optimizm, takım ruhu ve duygusal zeka.',url:'https://tv.apple.com/tr/show/ted-lasso/umc.cmc.vtoh0mn0xn7nqd4w5xqjkmg'},
    {title:'The Good Place',creator:'NBC',year:2016,source:'Netflix · etik ve değişim',summary:'Etik, bağışlanma ve insan olmanın anlamı.',url:'https://www.netflix.com/tr/title/80175798'},
    {title:'The Mind, Explained',creator:'Netflix / Vox',year:2019,source:'Netflix · popüler bilim',summary:'Bellek, anksiyete, düşünce sistemleri.',url:'https://www.netflix.com/tr/title/81098586'},
    {title:'Lucy ve Meslekler',creator:'Pixar',year:2021,source:'Disney+ · çocukluk duyguları',summary:'Büyürken duygusal deneyimlerin nasıl şekillendiği.',url:'https://www.disneyplus.com/tr-tr/movies/lucy'},
    {title:'A Beautiful Day in the Neighborhood',creator:'Marielle Heller',year:2019,source:'Prime Video · şefkat ve empati',summary:'Fred Rogers’ın empati ve kabul dolu yaklaşımı.',url:'https://www.primevideo.com/detail/A-Beautiful-Day-in-the-Neighborhood'},
    {title:'Eat Pray Love',creator:'Ryan Murphy',year:2010,source:'Netflix · arayış ve dönüşüm',summary:'Kendini yeniden keşfetme, denge ve içsel yolculuk.',url:'https://www.netflix.com/tr/title/70125225'},
    {title:'The Pursuit of Happyness',creator:'Gabriele Muccino',year:2006,source:'Netflix · direnç',summary:'Zorluklar karşısında umut ve azim.',url:'https://www.netflix.com/tr/title/70044696'},
    {title:'Chef’s Table',creator:'Netflix',year:2015,source:'Netflix · tutku ve ustalık',summary:'Tutkuyla bir işi ustaca yapmanın hikâyesi.',url:'https://www.netflix.com/tr/title/80007951'},
    {title:'Our Planet',creator:'Netflix / Silverback',year:2019,source:'Netflix · doğa ve sakinlik',summary:'Doğal dünya, yavaşlama ve bağlılık hissi.',url:'https://www.netflix.com/tr/title/80049832'},
    {title:'Abstract: Sanatın Tasarımı',creator:'Netflix',year:2017,source:'Netflix · yaratıcılık',summary:'Yaratıcı süreç ve tasarım düşüncesi.',url:'https://www.netflix.com/tr/title/80057883'},
    {title:'Becoming',creator:'Michelle Obama',year:2020,source:'Netflix · öz-yeterlilik',summary:'Michelle Obama’nın kişisel gelişim ve ses bulma yolculuğu.',url:'https://www.netflix.com/tr/title/81143584'},
    {title:'Brene Brown: The Call to Courage',creator:'Brené Brown',year:2019,source:'Netflix · kırılganlık ve cesaret',summary:'Kırılganlığın güç olduğunu anlatan bir sahne konuşması.',url:'https://www.netflix.com/tr/title/81010166'},
    {title:'Minimalism: A Documentary',creator:'Netimalist',year:2015,source:'Netflix · sadeleşme',summary:'Daha az şeyle daha çok anlam yakalamak.',url:'https://www.netflix.com/tr/title/80108227'},
    {title:'He Named Me Malala',creator:'Davis Guggenheim',year:2015,source:'Prime Video · amaç',summary:'Eğitim, ses ve amaç uğruna dayanma.',url:'https://www.primevideo.com/detail/He-Named-Me-Malala'},
    {title:'Inside Out 2',creator:'Pixar',year:2024,source:'Disney+ · ergenlik duyguları',summary:'Büyüme çağında karmaşık duygular ve kimlik.',url:'https://www.disneyplus.com/tr-tr/movies/inside-out-2'},
    {title:'The Speed Cubers',creator:'Sue Kim',year:2020,source:'Netflix · dostluk ve rekabet',summary:'Empati, rekabet ve arkadaşlık üzerine kısa belgesel.',url:'https://www.netflix.com/tr/title/81001414'},
    {title:'Crip Camp',creator:'Netflix',year:2020,source:'Netflix · topluluk ve kimlik',summary:'Dışlanmış bir topluluğun güçlenme hikâyesi.',url:'https://www.netflix.com/tr/title/81001468'},
    {title:'Explained: Bir Konu Üzerine',creator:'Netflix / Vox',year:2018,source:'Netflix · popüler bilim',summary:'Günlük konuları bilimsel açıdan anlamak.',url:'https://www.netflix.com/tr/title/80216752'},
    {title:'Dick Johnson is Dead',creator:'Kirsten Johnson',year:2020,source:'Netflix · kayıp ve sevgi',summary:'Yakınını kaybetme, anı ve kabul üzerine yaratıcı belgesel.',url:'https://www.netflix.com/tr/title/81005635'},
    {title:'The Crown (seçilmiş bölümler)',creator:'Netflix',year:2016,source:'Netflix · liderlik ve sorumluluk',summary:'Güç, kimlik ve sorumluluk arasındaki gerilim.',url:'https://www.netflix.com/tr/title/80025678'},
    {title:'Schitt’s Creek',creator:'CBC / Netflix',year:2015,source:'Netflix · aile ve kabul',summary:'Değişim, aile bağları ve kendi ayakları üzerinde durmak.',url:'https://www.netflix.com/tr/title/80113701'},
    {title:'Waffles + Mochi',creator:'Higher Ground / Netflix',year:2021,source:'Netflix · merak ve yemek',summary:'Çocuksu merakla dünyayı keşfetmek ve denemek.',url:'https://www.netflix.com/tr/title/81056333'}
  ],
  listen:[
    {title:'Uzun Hikaye',creator:'Murat Menteş / Badem',year:2018,source:'Spotify · edebiyat ve hayat',summary:'Günlük hayatı, edebiyatı ve insanı sakin kafayla dinlemek.',url:'https://open.spotify.com/show/6ZYXVw9y9vz8PG4W2MJZ8x'},
    {title:'Açık Bilinç',creator:'Can Sungur',year:2020,source:'Spotify · felsefe ve zihin',summary:'Felsefe, bilinç ve günlük pratikler üzerine derin sohbetler.',url:'https://open.spotify.com/show/4rOoJ6EjhTFepkc6L2GVnG'},
    {title:'Bilinçaltı Notları',creator:'Baturalp Torun',year:2021,source:'Spotify · psikoloji',summary:'Bilinçaltı kalıpları, ilişkiler ve kişisel gelişim.',url:'https://open.spotify.com/show/2mTYYDz3euN7Wjeq380K5Y'},
    {title:'Socrates’in Çocukları',creator:'Socrates Dergi',year:2019,source:'Spotify · kültür ve fikir',summary:'Düşünce, sanat ve bilim üzerine sohbetler.',url:'https://open.spotify.com/show/0kL5i4G8UQ3g9v7m8RkX9x'},
    {title:'Psikopod',creator:'Klinik Psikologlar',year:2020,source:'Spotify · klinik psikoloji',summary:'Ruh sağlığı, terapi ve günlük zorluklara dair bilgili sohbetler.',url:'https://open.spotify.com/show/4X7EZW1Yv9vI8z7x0T9z4q'},
    {title:'Mindful Taksi',creator:'Kıvanç Özfidan',year:2021,source:'Spotify · farkındalık',summary:'Meditasyon ve farkındalık pratikleri için yolculuk arkadaşı.',url:'https://open.spotify.com/show/2wYhi4Xv7qg1bJrVqLMw6Y'},
    {title:'Bunu Konuşmuştuk',creator:'Büşra Sanay / Ecem Güler',year:2018,source:'Spotify · kadın ve ilişkiler',summary:'Kadın olmak, ilişkiler ve içsel özgürleşme.',url:'https://open.spotify.com/show/5nS0oRkX9Yk8X8x0Y5q9yX'},
    {title:'Hayalhanem Podcast',creator:'Hayalhanem',year:2019,source:'Spotify · kişisel gelişim',summary:'Duygusal zeka, disiplin ve anlam arayışı.',url:'https://open.spotify.com/show/2X7QjKw3Y0l9p0R7Z9x0Y0'},
    {title:'Zamansız',creator:'Farnam Street Türkçe',year:2020,source:'Spotify · karar ve zihin',summary:'Karar verme, zihinsel modeller ve uzun vadeli düşünme.',url:'https://open.spotify.com/show/1Y3p9z7w9Y9Y0l9p0R7Z9x'},
    {title:'Yersiz Yurtsuz',creator:'Evren Büyükdoğanay',year:2017,source:'Spotify · felsefe ve hayat',summary:'Felsefe, edebiyat ve hayatın anlamı üzerine yolculuk.',url:'https://open.spotify.com/show/0Z1l9z7w9Y9Y0l9p0R7Z9x'},
    {title:'Motivasyon Durağı',creator:'Can Sungur',year:2021,source:'Spotify · motivasyon',summary:'Aksiyon almak ve hedeflere tutarlı ilerlemek.',url:'https://open.spotify.com/show/2Z8QjKw3Y0l9p0R7Z9x0Y1'},
    {title:'Kişisel Gelişim Notları',creator:'Barış Özcan',year:2020,source:'Spotify · kişisel gelişim',summary:'Bilimsel ve pratik kişisel gelişim ipuçları.',url:'https://open.spotify.com/show/3A7RjKw3Y0l9p0R7Z9x0Y2'},
    {title:'Terapide Bu Hafta',creator:'Dr. Aslıhan Özmen',year:2022,source:'Spotify · terapi',summary:'Terapi süreci, duygular ve ilişkilere dair profesyonel bakış.',url:'https://open.spotify.com/show/4B8RjKw3Y0l9p0R7Z9x0Y3'},
    {title:'Kendi Kendine Terapi',creator:'Psikolog Gamze Özdemir',year:2021,source:'Spotify · kendi kendine yardım',summary:'Günlük zorluklar için pratik psikolojik araçlar.',url:'https://open.spotify.com/show/5C8RjKw3Y0l9p0R7Z9x0Y4'},
    {title:'İyi Uykular',creator:'Spotify Studios',year:2020,source:'Spotify · uyku',summary:'Rahatlatıcı hikâyeler ve uyku öncesi meditasyon.',url:'https://open.spotify.com/show/6D8RjKw3Y0l9p0R7Z9x0Y5'},
    {title:'Nefes ve Farkındalık',creator:'Mediamark',year:2021,source:'Spotify · nefes',summary:'Rehberli nefes pratikleri ve kısa meditasyonlar.',url:'https://open.spotify.com/show/7E8RjKw3Y0l9p0R7Z9x0Y6'},
    {title:'Duygusal Yolculuk',creator:'Melis Özçınar',year:2019,source:'Spotify · duygusal farkındalık',summary:'Duyguları tanımak, kabul etmek ve ifade etmek.',url:'https://open.spotify.com/show/8F9RjKw3Y0l9p0R7Z9x0Y7'},
    {title:'Sakin Zihin',creator:'Klinik Psikolog Emre Yıldız',year:2021,source:'Spotify · anksiyete',summary:'Kaygıyı anlamak ve yönetmek için bilimsel yaklaşımlar.',url:'https://open.spotify.com/show/9G0RjKw3Y0l9p0R7Z9x0Y8'},
    {title:'Hayatı Kolaylaştır',creator:'İrem Şahin',year:2020,source:'Spotify · pratik yaşam',summary:'Günlük rutinler, sadeleşme ve zihinsel ferahlık.',url:'https://open.spotify.com/show/0H1RjKw3Y0l9p0R7Z9x0Y9'},
    {title:'Farkındalık Atölyesi',creator:'Mehmet Yılmaz',year:2022,source:'Spotify · mindfulness',summary:'Mindfulness egzersizleri ve günlük uygulamalar.',url:'https://open.spotify.com/show/1I2RjKw3Y0l9p0R7Z9x0Z0'},
    {title:'İlişki Notları',creator:'Pınar Yılmaz',year:2019,source:'Spotify · ilişkiler',summary:'Sağlıklı ilişkiler, iletişim ve sınırlar.',url:'https://open.spotify.com/show/2J3RjKw3Y0l9p0R7Z9x0Z1'},
    {title:'Özgüven Atölyesi',creator:'Cemal Can Balcı',year:2021,source:'Spotify · özgüven',summary:'Özgüveni artırmak için günlük pratikler ve sohbetler.',url:'https://open.spotify.com/show/3K4RjKw3Y0l9p0R7Z9x0Z2'},
    {title:'Yaratıcı Zihin',creator:'Ayşe Kulin',year:2020,source:'Spotify · yaratıcılık',summary:'Yaratıcı süreç, yazı ve sanat üzerine sohbetler.',url:'https://open.spotify.com/show/4L5RjKw3Y0l9p0R7Z9x0Z3'},
    {title:'Kısa Psikoloji',creator:'Dr. Deniz Kılıç',year:2022,source:'Spotify · popüler psikoloji',summary:'Günlük hayata uygulanabilir psikoloji notları.',url:'https://open.spotify.com/show/5M6RjKw3Y0l9p0R7Z9x0Z4'},
    {title:'Duyguları Anlamak',creator:'Psikolog Derya Öztürk',year:2021,source:'Spotify · duygular',summary:'Temel duyguları tanımak ve sağlıklı ifade etmek.',url:'https://open.spotify.com/show/6N7RjKw3Y0l9p0R7Z9x0Z5'},
    {title:'Huzur Arayışı',creator:'Serdar Kuzuloğlu',year:2019,source:'Spotify · teknoloji ve hayat',summary:'Teknoloji, hız ve içsel huzur arasındaki denge.',url:'https://open.spotify.com/show/7O8RjKw3Y0l9p0R7Z9x0Z6'},
    {title:'Günlük Motivasyon',creator:'Apple Podcasts Türkiye',year:2020,source:'Apple Podcasts · motivasyon',summary:'Günlük kısa motivasyon ve ilham notları.',url:'https://podcasts.apple.com/tr/podcast/gunluk-motivasyon'},
    {title:'Ben ve Biz',creator:'Sezin Öney',year:2018,source:'Spotify · toplum ve birey',summary:'Birey, toplum ve duygusal bağlar üzerine analizler.',url:'https://open.spotify.com/show/8P9RjKw3Y0l9p0R7Z9x0Z7'},
    {title:'Meditasyon Rehberim',creator:'Aura',year:2021,source:'Spotify · meditasyon',summary:'Yeni başlayanlar için rehberli meditasyon ve nefes.',url:'https://open.spotify.com/show/9Q0RjKw3Y0l9p0R7Z9x0Z8'},
    {title:'İçimdeki Ses',creator:'Psikolog Sevgi Tanrıkulu',year:2022,source:'Spotify · içsel konuşma',summary:'İçsel eleştirmenle ilişkiyi dönüştürme pratikleri.',url:'https://open.spotify.com/show/0R1RjKw3Y0l9p0R7Z9x0Z9'}
  ]
};

  window.SeymaMotivation={
    registerMotivation:registerMotivation,MOT_DEPENDENCIES:MOT_DEPENDENCIES,
    motivationIsCourageDomain:motivationIsCourageDomain,motivationPersonalLine:motivationPersonalLine,
    motivationEvidenceLine:motivationEvidenceLine,motivationNextStepLabel:motivationNextStepLabel,
    motivationBadgeHTML:motivationBadgeHTML,motivationSignHTML:motivationSignHTML,
    motivationQuoteBlockHTML:motivationQuoteBlockHTML,motivationComingSoonCardHTML:motivationComingSoonCardHTML,
    motivationTodayCardHTML:motivationTodayCardHTML,
    roomStatsHTML:roomStatsHTML,roomOverlayHTML:roomOverlayHTML,roomBodyHTML:roomBodyHTML,
    roomPathHTML:roomPathHTML,roomDailyWinHTML:roomDailyWinHTML,roomFlexNudgeHTML:roomFlexNudgeHTML,
    roomToolCard:roomToolCard,roomToolsHTML:roomToolsHTML,roomProfileHTML:roomProfileHTML,
    roomPrettyRiasec:roomPrettyRiasec,roomPrettyValue:roomPrettyValue,
    roomCalendarDayIndex:roomCalendarDayIndex,roomDailyContentHTML:roomDailyContentHTML,
    flexNudgeFor:flexNudgeFor,ROOM_CONTENT_CATALOG:ROOM_CONTENT_CATALOG,
    parseScientificProfileMD:parseScientificProfileMD
  };
})();