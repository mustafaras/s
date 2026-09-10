// MON-33 · library domain registry: read-only hub/archive helpers and HTML.
// App-owned entry writes, archive sync/backfill, DOM focus and save handlers remain in app.js.
(function(){
  'use strict';

  var libraryDeps=null;
  var LIBRARY_DEPENDENCIES=['data','ui','getDay','todayStr','addDays','dayIndexFor','shortDate','fmt','icon','esc','segTabs','progBar','starRow','miniBars','statTile','ensureLibrary','ensureWatchlist','ensureMusic','ensureSoulArchive','findBook','findTitle','findTrack','findSoulItem','soulActivityById','soulCatalog','bookGenres','titleGenres','listenKinds','fmtDur','saygiSafeUrl','wxHm','ucfirst'];
  var LIBRARY_MEMBERS=['readingStats','bookPct','titlePct','libStats','readTotals','hasRead','readStreak','weekReading','todayReadPages','allQuotes','watchStats','watchDayStats','watchTotals','hasWatch','watchStreak','weekWatch','todayWatchMin','allReplicas','listenDayStats','listenTotals','hasListen','weekListen','listenStreak','musicStats','allLyrics','overlayShell','soulOverlayShell','bookStatusChip','readingOverlayHTML','readingTodayView','bookCard','readingLibraryView','readingStatsView','readingQuotesView','compactModalShell','bookEditModal','quoteAddModal','titleStatusChip','watchOverlayHTML','watchTodayView','titleCard','watchArchiveView','watchStatsView','watchQuotesView','titleEditModal','replicaAddModal','listenKindMeta','listeningOverlayHTML','listeningTodayView','trackCard','listeningFavsView','listeningStatsView','listeningLyricsView','trackEditModal','lyricAddModal','learningEntryCard','learningTodayView','learningOverlayHTML','soulActivityTodayView','soulActivityEntryCard','soulPracticePickerHTML','soulActivityOverlayHTML','soulArchiveSessions','soulArchiveOverlayHTML'];
  function registerLibrary(deps){
    if(libraryDeps||!deps||typeof deps!=='object'||Array.isArray(deps)) return false;
    for(var i=0;i<LIBRARY_DEPENDENCIES.length;i++) if(typeof deps[LIBRARY_DEPENDENCIES[i]]!=='function') return false;
    libraryDeps=deps;
    return true;
  }
  function dep(name){ return libraryDeps&&typeof libraryDeps[name]==='function'?libraryDeps[name]:null; }
  function call(name,args){ var f=dep(name); if(f) return f.apply(null,args||[]); throw new Error('SeymaLibrary: çözümlenemeyen bağımlılık '+name); }
  function liveData(){ return call('data',[]); }
  function liveUi(){ return call('ui',[]); }
  function getDay(){ return call('getDay',arguments); }
  function todayStr(){ return call('todayStr',arguments); }
  function addDays(){ return call('addDays',arguments); }
  function dayIndexFor(){ return call('dayIndexFor',arguments); }
  function shortDate(){ return call('shortDate',arguments); }
  function fmt(){ return call('fmt',arguments); }
  function icon(){ return call('icon',arguments); }
  function esc(){ return call('esc',arguments); }
  function segTabs(){ return call('segTabs',arguments); }
  function progBar(){ return call('progBar',arguments); }
  function starRow(){ return call('starRow',arguments); }
  function miniBars(){ return call('miniBars',arguments); }
  function statTile(){ return call('statTile',arguments); }
  function ensureLibrary(){ return call('ensureLibrary',arguments); }
  function ensureWatchlist(){ return call('ensureWatchlist',arguments); }
  function ensureMusic(){ return call('ensureMusic',arguments); }
  function ensureSoulArchive(){ return call('ensureSoulArchive',arguments); }
  function findBook(){ return call('findBook',arguments); }
  function findTitle(){ return call('findTitle',arguments); }
  function findTrack(){ return call('findTrack',arguments); }
  function findSoulItem(){ return call('findSoulItem',arguments); }
  function soulActivityById(){ return call('soulActivityById',arguments); }
  function soulCatalog(){ return call('soulCatalog',arguments); }
  function bookGenres(){ return call('bookGenres',arguments); }
  function titleGenres(){ return call('titleGenres',arguments); }
  function listenKinds(){ return call('listenKinds',arguments); }
  function fmtDur(){ return call('fmtDur',arguments); }
  function saygiSafeUrl(){ return call('saygiSafeUrl',arguments); }
  function wxHm(){ return call('wxHm',arguments); }
  function ucfirst(){ return call('ucfirst',arguments); }
  function fmtDuration(min){
    if(min==null||isNaN(min)||min<=0) return '';
    if(min<60) return min+' dk';
    var h=Math.floor(min/60),r=min%60;
    return r===0?h+' saat':h+' saat '+r+' dk';
  }

function readingStats(rec){ var en=(rec&&rec.reading&&Array.isArray(rec.reading.entries))?rec.reading.entries:[]; var pages=0,minutes=0; en.forEach(function(e){ if(!e) return; var p=Number(e.pages); if(!isNaN(p)&&p>0) pages+=p; var m=Number(e.minutes); if(!isNaN(m)&&m>0) minutes+=m; }); return {count:en.length,pages:pages,minutes:minutes,entries:en}; }
function bookPct(b){ if(!b||!b.totalPages||b.totalPages<=0) return b&&b.status==='finished'?100:0; return Math.max(0,Math.min(100,Math.round((b.currentPage/b.totalPages)*100))); }
function titlePct(t){ if(!t) return 0; if(!t.totalEp||t.totalEp<=0) return t.status==='finished'?100:0; return Math.max(0,Math.min(100,Math.round((t.watchedEp/t.totalEp)*100))); }
function libStats(){ var L=ensureLibrary(); var yr=new Date().getFullYear(),reading=0,finished=0,dropped=0,finYear=0; L.books.forEach(function(b){ if(b.status==='finished'){ finished++; if(b.finishedAt&&new Date(b.finishedAt).getFullYear()===yr) finYear++; } else if(b.status==='dropped') dropped++; else reading++; }); return {reading:reading,finished:finished,dropped:dropped,finYear:finYear,total:L.books.length}; }
function readTotals(){ var pages=0,minutes=0,days=0; var d=liveData()&&liveData().days?liveData().days:{}; for(var date in d){ var st=readingStats(d[date]); if(st.count>0){ days++; pages+=st.pages; minutes+=st.minutes; } } return {pages:pages,minutes:minutes,days:days}; }
function hasRead(date){ var d=liveData()&&liveData().days?liveData().days:{}; var r=d[date]; return !!(r&&r.reading&&Array.isArray(r.reading.entries)&&r.reading.entries.length>0); }
function readStreak(){ var c=todayStr(); if(!hasRead(c)) c=addDays(c,-1); var n=0,guard=0; while(hasRead(c)&&guard++<4000){ n++; c=addDays(c,-1); } return n; }
function weekReading(){ var out=[],t=todayStr(),d=liveData()&&liveData().days?liveData().days:{}; for(var i=6;i>=0;i--){ var date=addDays(t,-i); out.push({date:date,pages:readingStats(d[date]).pages,label:shortDate(date)}); } return out; }
function todayReadPages(){ var d=liveData()&&liveData().days?liveData().days:{}; return readingStats(d[todayStr()]).pages; }
function allQuotes(){ var L=ensureLibrary(),out=[]; L.books.forEach(function(b){ (b.quotes||[]).forEach(function(q){ out.push({bookId:b.id,title:b.title,emoji:b.emoji,q:q}); }); }); out.sort(function(a,b){ return String(b.q.ts||'').localeCompare(String(a.q.ts||'')); }); return out; }
function watchStats(){ var W=ensureWatchlist(); var yr=new Date().getFullYear(),watching=0,finished=0,dropped=0,finYear=0; W.items.forEach(function(t){ if(t.status==='finished'){ finished++; if(t.finishedAt&&new Date(t.finishedAt).getFullYear()===yr) finYear++; } else if(t.status==='dropped') dropped++; else watching++; }); return {watching:watching,finished:finished,dropped:dropped,finYear:finYear,total:W.items.length}; }
function watchDayStats(rec){ var en=(rec&&rec.watching&&Array.isArray(rec.watching.entries))?rec.watching.entries:[]; var minutes=0,eps=0; en.forEach(function(e){ if(!e) return; var m=Number(e.minutes); if(!isNaN(m)&&m>0) minutes+=m; var ep=Number(e.episodes); if(!isNaN(ep)&&ep>0) eps+=ep; }); return {count:en.length,minutes:minutes,eps:eps,entries:en}; }
function watchTotals(){ var minutes=0,eps=0,days=0; var d=liveData()&&liveData().days?liveData().days:{}; for(var date in d){ var st=watchDayStats(d[date]); if(st.count>0){ days++; minutes+=st.minutes; eps+=st.eps; } } return {minutes:minutes,eps:eps,days:days}; }
function hasWatch(date){ var d=liveData()&&liveData().days?liveData().days:{}; var r=d[date]; return !!(r&&r.watching&&Array.isArray(r.watching.entries)&&r.watching.entries.length>0); }
function watchStreak(){ var c=todayStr(); if(!hasWatch(c)) c=addDays(c,-1); var n=0,guard=0; while(hasWatch(c)&&guard++<4000){ n++; c=addDays(c,-1); } return n; }
function weekWatch(){ var out=[],t=todayStr(),d=liveData()&&liveData().days?liveData().days:{}; for(var i=6;i>=0;i--){ var date=addDays(t,-i); out.push({date:date,minutes:watchDayStats(d[date]).minutes,label:shortDate(date)}); } return out; }
function todayWatchMin(){ var d=liveData()&&liveData().days?liveData().days:{}; return watchDayStats(d[todayStr()]).minutes; }
function allReplicas(){ var W=ensureWatchlist(),out=[]; W.items.forEach(function(t){ (t.quotes||[]).forEach(function(q){ out.push({itemId:t.id,title:t.title,emoji:t.emoji,q:q}); }); }); out.sort(function(a,b){ return String(b.q.ts||'').localeCompare(String(a.q.ts||'')); }); return out; }
function listenDayStats(rec){ var en=(rec&&rec.listening&&Array.isArray(rec.listening.entries))?rec.listening.entries:[]; var minutes=0; en.forEach(function(e){ if(!e) return; var m=Number(e.minutes); if(!isNaN(m)&&m>0) minutes+=m; }); return {count:en.length,minutes:minutes,entries:en}; }
function listenTotals(){ var minutes=0,items=0,days=0; var d=liveData()&&liveData().days?liveData().days:{}; for(var date in d){ var st=listenDayStats(d[date]); if(st.count>0){ days++; minutes+=st.minutes; items+=st.count; } } return {minutes:minutes,items:items,days:days}; }
function hasListen(date){ var d=liveData()&&liveData().days?liveData().days:{}; var r=d[date]; return !!(r&&r.listening&&Array.isArray(r.listening.entries)&&r.listening.entries.length>0); }
function weekListen(){ var out=[],t=todayStr(),d=liveData()&&liveData().days?liveData().days:{}; for(var i=6;i>=0;i--){ var date=addDays(t,-i); out.push({date:date,minutes:listenDayStats(d[date]).minutes,label:shortDate(date)}); } return out; }
function listenStreak(){ var c=todayStr(); if(!hasListen(c)) c=addDays(c,-1); var n=0,guard=0; while(hasListen(c)&&guard++<4000){ n++; c=addDays(c,-1); } return n; }
function musicStats(){ var M=ensureMusic(); var byKind={sarki:0,album:0,podcast:0}; M.items.forEach(function(x){ if(byKind[x.kind]!=null) byKind[x.kind]++; }); return {total:M.items.length,sarki:byKind.sarki,album:byKind.album,podcast:byKind.podcast}; }
function allLyrics(){ var M=ensureMusic(),out=[]; M.items.forEach(function(x){ (x.quotes||[]).forEach(function(q){ out.push({itemId:x.id,title:x.title,emoji:x.emoji,artist:x.artist,q:q}); }); }); out.sort(function(a,b){ return String(b.q.ts||'').localeCompare(String(a.q.ts||'')); }); return out; }
function overlayShell(closeFn, sticky, body, maxw, fixedH, label){
  // fixedH: sekmeli hub'larda kart yüksekliğini sabitler → sekme değişince modal
  // boyu zıplamaz (gövde kaydırılır, kabuk sabit kalır).
  var sizeCss=fixedH?'height:88vh;max-height:88vh;':'max-height:88vh;';
  var h='<div id="sey-ov-back" onclick="'+closeFn+'" style="position:fixed;inset:0;z-index:340;background:rgba(44,36,38,0.42);backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;padding:14px;animation:seyFade .2s ease;">';
  h+='<div id="sey-ov-card" role="dialog" aria-modal="true" aria-label="'+esc(label||'Şeyma penceresi')+'" tabindex="-1" onkeydown="App.onModalKeydown(event,'+closeFn.replace('()','')+')" onclick="event.stopPropagation()" style="width:100%;max-width:'+(maxw||460)+'px;'+sizeCss+'background:var(--modal);border-radius:26px;padding:20px;box-shadow:0 -10px 40px rgba(0,0,0,0.22);animation:seyPop .25s ease;display:flex;flex-direction:column;gap:13px;overflow:hidden;">';
  h+='<div style="flex-shrink:0;display:flex;flex-direction:column;gap:13px;">'+(sticky||'')+'</div>';
  h+='<div id="sey-ov-body" class="scroll" style="flex:1;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:14px;margin:0 -4px;padding:4px 4px 2px;">'+(body||'')+'</div>';
  h+='</div></div>';
  return h;
}
function soulOverlayShell(closeFn, sticky, body, maxw, fixedH, label){
  // Zihin-Beden (soul) modalları için animasyonsuz, anlık açılış shell.
  // Picker → aktivite geçişlerinde ve tab değişimlerinde flash/flicker oluşmasın.
  var sizeCss=fixedH?'height:88vh;max-height:88vh;':'max-height:88vh;';
  var h='<div id="sey-ov-back" class="sey-soul-ov-back" onclick="'+closeFn+'" style="position:fixed;inset:0;z-index:340;background:rgba(44,36,38,0.42);display:flex;align-items:flex-end;justify-content:center;padding:14px;">';
  h+='<div id="sey-ov-card" class="sey-soul-ov-card" role="dialog" aria-modal="true" aria-label="'+esc(label||'Zihin ve beden penceresi')+'" tabindex="-1" onkeydown="App.onModalKeydown(event,'+closeFn.replace('()','')+')" onclick="event.stopPropagation()" style="width:100%;max-width:'+(maxw||460)+'px;'+sizeCss+'background:var(--modal);border-radius:26px;padding:20px;box-shadow:0 -10px 40px rgba(0,0,0,0.22);display:flex;flex-direction:column;gap:13px;overflow:hidden;">';
  h+='<div style="flex-shrink:0;display:flex;flex-direction:column;gap:13px;">'+(sticky||'')+'</div>';
  h+='<div id="sey-ov-body" class="scroll" style="flex:1;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:14px;margin:0 -4px;padding:4px 4px 2px;">'+(body||'')+'</div>';
  h+='</div></div>';
  return h;
}
function bookStatusChip(st){ var m={reading:['Okunuyor','var(--read)','var(--read-bg)'],finished:['Bitti','var(--ok)','var(--ok-bg)'],dropped:['Bırakıldı','var(--drop)','var(--drop-bg)']}; var c=m[st]||m.reading; return '<span style="font-size:var(--f-caption2);font-weight:800;padding:2px 9px;border-radius:999px;color:'+c[1]+';background:'+c[2]+';">'+c[0]+'</span>'; }
function readingOverlayHTML(){
  var view=liveUi().readingView||'today';
  var head='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;"><div><div style="font-size:var(--f-title3);font-weight:800;display:flex;align-items:center;gap:8px;">Ne okudum? '+icon('book-open',19)+'</div><div style="font-size:var(--f-footnote);color:var(--faint);margin-top:3px;">Bugünkü okuman, kitaplığın ve alıntıların tek yerde.</div></div><button data-fx="close" onclick="App.closeReading()" style="border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:34px;height:34px;border-radius:50%;color:var(--muted);flex-shrink:0;display:flex;align-items:center;justify-content:center;">'+icon('x',16)+'</button></div>';
  var tabs=segTabs([['today','Bugün'],['library',icon('book',13)+' Kitaplık'],['stats',icon('chart-column',13)+' İstatistik'],['quotes',icon('quote',13)+' Alıntılar']],view,'App.setReadingView');
  var body='';
  if(view==='today') body=readingTodayView();
  else if(view==='library') body=readingLibraryView();
  else if(view==='stats') body=readingStatsView();
  else if(view==='quotes') body=readingQuotesView();
  var h=overlayShell('App.closeReading()', head+tabs, body, null, true,'Okuma günlüğü');
  if(liveUi().bookEdit) h+=bookEditModal();
  if(liveUi().quoteDraft) h+=quoteAddModal();
  return h;
}
function readingTodayView(){
  var dr=liveUi().readingDraft||{title:'',author:'',pages:'',minutes:'',note:''};
  var day=getDay(liveData(),todayStr(),dayIndexFor(todayStr()));
  var rEntries=(day&&day.reading&&Array.isArray(day.reading.entries))?day.reading.entries:[];
  var totPages=rEntries.reduce(function(a,e){ var p=Number(e&&e.pages); return a+((!isNaN(p)&&p>0)?p:0); },0);
  var L=ensureLibrary();
  var goalPg=(L.goal&&L.goal.dailyPages)||0;
  var h='';
  // daily goal ring
  if(goalPg>0){ var gp=Math.min(100,Math.round(totPages/goalPg*100)); h+='<div style="display:flex;align-items:center;gap:13px;background:linear-gradient(135deg,rgba(110,85,191,0.10),rgba(233,175,193,0.12));border:1px solid var(--card-bd);border-radius:18px;padding:13px 15px;">'; h+='<div style="position:relative;width:52px;height:52px;flex-shrink:0;"><svg width="52" height="52" viewBox="0 0 52 52"><circle cx="26" cy="26" r="22" fill="none" stroke="rgba(150,110,120,0.16)" stroke-width="6"></circle><circle cx="26" cy="26" r="22" fill="none" stroke="#6E55BF" stroke-width="6" stroke-linecap="round" stroke-dasharray="'+(2*Math.PI*22)+'" stroke-dashoffset="'+(2*Math.PI*22*(1-gp/100))+'" transform="rotate(-90 26 26)"></circle></svg><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:var(--f-caption1);font-weight:800;">'+gp+'%</div></div>'; h+='<div style="flex:1;min-width:0;"><div style="font-size:var(--f-footnote);font-weight:800;color:var(--text);">Günlük hedef · '+totPages+'/'+goalPg+' sayfa</div><div style="font-size:var(--f-caption1);color:var(--muted);line-height:1.35;">'+(totPages>=goalPg?'Bugünün hedefi tamam, harikasın.':'Hedefe '+(goalPg-totPages)+' sayfa kaldı.')+'</div></div></div>'; }
  // quick pick from active books
  var active=L.books.filter(function(b){ return b.status==='reading'; });
  if(active.length){ h+='<div><div style="font-size:var(--f-caption1);font-weight:800;color:var(--muted);margin-bottom:6px;letter-spacing:.3px;">OKUDUĞUM KİTAP</div><div style="display:flex;gap:7px;flex-wrap:wrap;">'; active.forEach(function(b){ var on=liveUi().logBookId===b.id; h+='<button onclick="App.pickLogBook(\''+esc(b.id)+'\')" style="border:1px solid '+(on?'var(--read)':'var(--card-bd)')+';cursor:pointer;padding:7px 11px;border-radius:12px;font-size:var(--f-footnote);font-weight:700;color:'+(on?'#fff':'var(--text2)')+';background:'+(on?'linear-gradient(135deg,#6E55BF,#9B7FC9)':'var(--card)')+';display:flex;align-items:center;gap:5px;">'+icon('book-open',12)+' '+esc(b.title.length>18?b.title.slice(0,17)+'…':b.title)+'</button>'; }); h+='</div></div>'; }
  // form
  h+='<div style="display:flex;flex-direction:column;gap:10px;background:var(--card);border:1px solid var(--card-bd);border-radius:18px;padding:14px;">';
  h+='<div><div style="font-size:var(--f-caption1);font-weight:700;color:var(--muted);margin-bottom:5px;">Kitap adı</div><input id="reading-title" type="text" value="'+esc(dr.title||'')+'" oninput="App.onReadingField(\'title\',this)" placeholder="örn. Sefiller" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:var(--f-subhead);outline:none;"></div>';
  h+='<div><div style="font-size:var(--f-caption1);font-weight:700;color:var(--muted);margin-bottom:5px;">Yazar <span style="color:var(--faint);font-weight:500;">(isteğe bağlı)</span></div><input type="text" value="'+esc(dr.author||'')+'" oninput="App.onReadingField(\'author\',this)" placeholder="örn. Victor Hugo" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:var(--f-subhead);outline:none;"></div>';
  h+='<div style="display:flex;gap:10px;"><div style="flex:1;"><div style="font-size:var(--f-caption1);font-weight:700;color:var(--muted);margin-bottom:5px;">Sayfa</div><input type="number" inputmode="numeric" min="0" value="'+(dr.pages!=null&&dr.pages!==''?esc(dr.pages):'')+'" oninput="App.onReadingField(\'pages\',this)" placeholder="32" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:var(--f-subhead);outline:none;text-align:center;"></div>';
  h+='<div style="flex:1;"><div style="font-size:var(--f-caption1);font-weight:700;color:var(--muted);margin-bottom:5px;">Süre (dk)</div><input type="number" inputmode="numeric" min="0" value="'+(dr.minutes!=null&&dr.minutes!==''?esc(dr.minutes):'')+'" oninput="App.onReadingField(\'minutes\',this)" placeholder="20" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:var(--f-subhead);outline:none;text-align:center;"></div></div>';
  h+='<div><div style="font-size:var(--f-caption1);font-weight:700;color:var(--muted);margin-bottom:5px;">Not <span style="color:var(--faint);font-weight:500;">(isteğe bağlı)</span></div><textarea rows="2" oninput="App.onReadingField(\'note\',this)" placeholder="Aklında kalan bir cümle, duygu…" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:10px 12px;font-size:var(--f-footnote);outline:none;resize:none;line-height:1.45;">'+esc(dr.note||'')+'</textarea></div>';
  h+='<button onclick="App.addReading()" style="border:none;cursor:pointer;width:100%;padding:14px;border-radius:14px;font-size:var(--f-subhead);font-weight:800;color:#fff;background:linear-gradient(135deg,#6E55BF,#9B7FC9 55%,#E9AFC1);box-shadow:0 10px 24px rgba(110,85,191,0.4);display:flex;align-items:center;justify-content:center;gap:7px;">Okumayı kaydet '+icon('book-open',16)+'</button>';
  h+='</div>';
  if(rEntries.length>0){
    h+='<div style="display:flex;flex-direction:column;gap:8px;">';
    h+='<div style="display:flex;align-items:center;justify-content:space-between;"><div style="font-size:var(--f-footnote);font-weight:800;color:var(--muted);letter-spacing:.3px;">BUGÜN ('+rEntries.length+')</div><div style="font-size:var(--f-caption1);color:var(--faint);">toplam '+totPages+' sayfa</div></div>';
    rEntries.slice().reverse().forEach(function(e,i){
      var meta=[], linked=e.bookId?findBook(e.bookId):null, isSaygi=e&&e.source==='saygi', sourceUrl=isSaygi?saygiSafeUrl(e.sourceUrl):'';
      if(e.pages) meta.push(e.pages+' sayfa'); if(e.minutes) meta.push(e.minutes+' dk');
      var chip=isSaygi?'<span style="font-size:var(--f-caption2);color:#77602D;background:rgba(197,163,90,.16);border:1px solid rgba(138,109,54,.26);font-weight:850;letter-spacing:.35px;border-radius:999px;padding:2px 7px;margin-left:5px;">SAYGI</span>':(linked?' <span style="font-size:var(--f-caption2);color:var(--read);font-weight:700;">· kitaplıkta</span>':'');
      h+='<div class="sey-stagger" style="--i:'+Math.min(i,8)+';display:flex;align-items:flex-start;gap:10px;background:'+(isSaygi?'linear-gradient(135deg,rgba(197,163,90,.10),var(--card))':'var(--card)')+';border:1px solid '+(isSaygi?'rgba(138,109,54,.25)':'var(--card-bd)')+';border-radius:14px;padding:11px 12px;">';
      h+='<span style="line-height:1.2;display:inline-flex;color:'+(isSaygi?'#826936':'var(--read)')+';">'+icon(isSaygi?'trophy':'book-open',18)+'</span><div style="flex:1;min-width:0;">';
      h+='<div style="font-size:var(--f-footnote);font-weight:700;color:var(--text);">'+esc(e.title||'(başlıksız)')+chip+'</div>'+(e.author?'<div style="font-size:var(--f-caption1);color:var(--faint);">'+esc(e.author)+'</div>':'')+(meta.length?'<div style="font-size:var(--f-caption1);color:var(--muted);margin-top:2px;">'+meta.join(' · ')+'</div>':'')+(e.note?'<div style="font-size:var(--f-caption1);color:var(--text2);margin-top:4px;line-height:1.4;">'+esc(e.note)+'</div>':'');
      if(sourceUrl) h+='<a href="'+esc(sourceUrl)+'" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:4px;margin-top:6px;color:#826936;font-size:var(--f-caption2);font-weight:800;text-decoration:none;">'+icon('external-link',12)+' '+esc(e.sourceLabel||'Wikipedia kaynağı')+'</a>';
      h+='</div><button data-fx="destructive" onclick="App.removeReading(\''+esc(e.id)+'\')" aria-label="Sil" style="flex-shrink:0;border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:28px;height:28px;border-radius:8px;color:var(--faint);display:flex;align-items:center;justify-content:center;">'+icon('trash-2',13)+'</button></div>';
    });
    h+='</div>';
  } else {
    h+='<div style="text-align:center;font-size:var(--f-footnote);color:var(--faint);line-height:1.5;padding:4px 8px;">Henüz bugün için okuma eklemedin. Birkaç sayfa bile sayılır.</div>';
  }
  return h;
}
function bookCard(b,i){
  var pct=bookPct(b); var meta=[]; if(b.author) meta.push(esc(b.author)); if(b.genre) meta.push(esc(b.genre));
  var h='<div class="sey-stagger" style="--i:'+Math.min(i,8)+';background:var(--card);border:1px solid var(--card-bd);border-radius:16px;padding:13px;display:flex;flex-direction:column;gap:9px;">';
  h+='<div style="display:flex;align-items:flex-start;gap:11px;"><div style="width:44px;height:44px;border-radius:12px;background:var(--icon);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--read);">'+icon('book-open',22)+'</div>';
  h+='<div style="flex:1;min-width:0;"><div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;"><span style="font-size:var(--f-subhead);font-weight:800;color:var(--text);">'+esc(b.title)+'</span>'+bookStatusChip(b.status)+'</div>'+(meta.length?'<div style="font-size:var(--f-caption1);color:var(--faint);margin-top:1px;">'+meta.join(' · ')+'</div>':'')+'</div>';
  h+='<button onclick="App.openBookEdit(\''+esc(b.id)+'\')" aria-label="Düzenle" style="flex-shrink:0;border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:30px;height:30px;border-radius:9px;color:var(--muted);display:flex;align-items:center;justify-content:center;">'+icon('pen-line',13)+'</button></div>';
  // progress
  if(b.status!=='finished'){
    h+='<div style="display:flex;align-items:center;gap:9px;">';
    h+='<button onclick="App.advanceBook(\''+esc(b.id)+'\',-10)" style="border:1px solid var(--field-bd);cursor:pointer;width:30px;height:30px;border-radius:9px;font-size:var(--f-subhead);font-weight:800;color:var(--muted);background:var(--card);flex-shrink:0;">−</button>';
    h+='<div style="flex:1;min-width:0;">'+progBar(pct)+'<div style="font-size:var(--f-caption2);color:var(--muted);margin-top:4px;display:flex;justify-content:space-between;"><span>'+b.currentPage+(b.totalPages?' / '+b.totalPages+' sf':' sf')+'</span><span>%'+pct+'</span></div></div>';
    h+='<button onclick="App.advanceBook(\''+esc(b.id)+'\',10)" style="border:1px solid var(--field-bd);cursor:pointer;width:30px;height:30px;border-radius:9px;font-size:var(--f-subhead);font-weight:800;color:var(--read);background:var(--card);flex-shrink:0;">+</button>';
    h+='</div>';
    h+='<div style="display:flex;gap:7px;"><button onclick="App.finishBook(\''+esc(b.id)+'\')" style="flex:1;border:none;cursor:pointer;padding:9px;border-radius:11px;font-size:var(--f-footnote);font-weight:800;color:#fff;background:linear-gradient(135deg,#7DBE77,#5BA85B);display:flex;align-items:center;justify-content:center;gap:5px;">'+icon('check',13)+' Bitirdim</button>';
    if(b.status==='reading') h+='<button onclick="App.setBookStatus(\''+esc(b.id)+'\',\'dropped\')" style="border:1px solid var(--field-bd);cursor:pointer;padding:9px 12px;border-radius:11px;font-size:var(--f-footnote);font-weight:700;color:var(--muted);background:var(--card);">Ara ver</button>';
    else h+='<button onclick="App.setBookStatus(\''+esc(b.id)+'\',\'reading\')" style="border:1px solid var(--field-bd);cursor:pointer;padding:9px 12px;border-radius:11px;font-size:var(--f-footnote);font-weight:700;color:var(--read);background:var(--card);">Devam et</button>';
    h+='</div>';
  } else {
    h+='<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">'+starRow(b.rating,'App.rateBook',b.id,17)+'<button onclick="App.reopenBook(\''+esc(b.id)+'\')" style="border:1px solid var(--field-bd);cursor:pointer;padding:7px 12px;border-radius:11px;font-size:var(--f-caption1);font-weight:700;color:var(--read);background:var(--card);">Yeniden oku</button></div>';
    if(b.finishedAt) h+='<div style="font-size:var(--f-caption2);color:var(--faint);display:flex;align-items:center;gap:4px;">'+icon('trophy',12)+' '+esc(shortDate(fmt(new Date(b.finishedAt))))+' tarihinde bitti</div>';
  }
  return h+'</div>';
}
function readingLibraryView(){
  var L=ensureLibrary();
  var h='<button onclick="App.openBookEdit(\'\')" style="border:1px dashed var(--read);cursor:pointer;width:100%;padding:12px;border-radius:14px;font-size:var(--f-footnote);font-weight:800;color:var(--read);background:rgba(155,127,201,0.08);">＋ Kitap ekle</button>';
  var order={reading:0,finished:1,dropped:2};
  var books=L.books.slice().sort(function(a,b){ return (order[a.status]-order[b.status])||String(b.createdAt||'').localeCompare(String(a.createdAt||'')); });
  if(!books.length){ h+='<div style="text-align:center;font-size:var(--f-footnote);color:var(--faint);line-height:1.6;padding:22px 10px;">Kitaplığın henüz boş<br>Okumaya başladığın kitabı ekle, ilerlemen burada birer birer biriksin.</div>'; return h; }
  var reading=books.filter(function(b){return b.status==='reading';}),finished=books.filter(function(b){return b.status==='finished';}),dropped=books.filter(function(b){return b.status==='dropped';});
  function sec(title,arr){ if(!arr.length) return ''; var s='<div style="font-size:var(--f-caption1);font-weight:800;color:var(--muted);letter-spacing:.3px;margin:4px 2px 0;">'+title+' ('+arr.length+')</div>'; arr.forEach(function(b,i){ s+=bookCard(b,i); }); return s; }
  h+='<div style="display:flex;flex-direction:column;gap:10px;">'+sec('OKUYORUM',reading)+sec('BİTİRDİKLERİM',finished)+sec('ARA VERDİKLERİM',dropped)+'</div>';
  return h;
}
function readingStatsView(){
  var L=ensureLibrary(); var s=libStats(); var t=readTotals(); var streak=readStreak(); var week=weekReading();
  var goalY=(L.goal&&L.goal.yearlyBooks)||0; var goalPg=(L.goal&&L.goal.dailyPages)||0;
  var h='<div style="display:flex;gap:9px;">'+statTile('Bitirilen',s.finished,'kitap')+statTile('Okunuyor',s.reading)+statTile('Seri',streak,'gün')+'</div>';
  h+='<div style="display:flex;gap:9px;">'+statTile('Toplam sayfa',t.pages)+statTile('Toplam süre',fmtDur(t.minutes))+statTile('Okuma günü',t.days)+'</div>';
  h+='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:16px;padding:14px;"><div style="font-size:var(--f-footnote);font-weight:800;color:var(--muted);margin-bottom:10px;">Son 7 gün · sayfa</div>'+miniBars(week,'pages','sayfa')+'</div>';
  // yearly goal
  h+='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:10px;"><div style="font-size:var(--f-footnote);font-weight:800;color:var(--muted);display:flex;align-items:center;gap:5px;">'+icon('target',13)+' Hedefler</div>';
  h+='<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:var(--f-footnote);color:var(--text2);flex:1;">Günlük sayfa hedefi</span><input type="number" inputmode="numeric" min="0" value="'+(goalPg||'')+'" oninput="App.setReadGoal(\'dailyPages\',this)" placeholder="20" style="width:74px;border:1px solid var(--field-bd);background:var(--field);border-radius:11px;padding:8px;font-size:var(--f-subhead);text-align:center;outline:none;"></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:var(--f-footnote);color:var(--text2);flex:1;">Bu yıl kitap hedefi</span><input type="number" inputmode="numeric" min="0" value="'+(goalY||'')+'" oninput="App.setReadGoal(\'yearlyBooks\',this)" placeholder="24" style="width:74px;border:1px solid var(--field-bd);background:var(--field);border-radius:11px;padding:8px;font-size:var(--f-subhead);text-align:center;outline:none;"></div>';
  if(goalY>0){ var yp=Math.min(100,Math.round(s.finYear/goalY*100)); h+='<div>'+progBar(yp,'linear-gradient(90deg,#7DBE77,#E9AFC1)')+'<div style="font-size:var(--f-caption1);color:var(--muted);margin-top:5px;">'+new Date().getFullYear()+': '+s.finYear+'/'+goalY+' kitap · %'+yp+'</div></div>'; }
  h+='</div>';
  return h;
}
function readingQuotesView(){
  var qs=allQuotes(); var L=ensureLibrary();
  var h='<button onclick="App.openQuoteAdd(\'\')" '+(L.books.length?'':'disabled ')+'style="border:1px dashed var(--read);cursor:'+(L.books.length?'pointer':'not-allowed')+';width:100%;padding:12px;border-radius:14px;font-size:var(--f-footnote);font-weight:800;color:var(--read);background:rgba(155,127,201,0.08);opacity:'+(L.books.length?'1':'0.5')+';">＋ Alıntı ekle</button>';
  if(!L.books.length){ h+='<div style="text-align:center;font-size:var(--f-footnote);color:var(--faint);line-height:1.6;padding:16px 10px;">Alıntı eklemek için önce kitaplığına bir kitap ekle</div>'; return h; }
  if(!qs.length){ h+='<div style="text-align:center;font-size:var(--f-footnote);color:var(--faint);line-height:1.6;padding:22px 10px;">Henüz alıntı yok<br>Seni durduran o cümleyi buraya bırak.</div>'; return h; }
  h+='<div style="display:flex;flex-direction:column;gap:10px;">';
  qs.forEach(function(o){ var q=o.q; h+='<div style="background:linear-gradient(135deg,rgba(110,85,191,0.07),rgba(233,175,193,0.09));border:1px solid var(--card-bd);border-radius:16px;padding:14px;position:relative;">'; h+='<div style="position:absolute;top:2px;right:12px;font-size:44px;color:var(--faint);opacity:0.25;line-height:1;">”</div>'; h+='<div style="font-size:var(--f-subhead);line-height:1.5;color:var(--text);font-style:italic;position:relative;">'+esc(q.text)+'</div>'; h+='<div style="display:flex;align-items:center;gap:8px;margin-top:9px;"><span style="font-size:var(--f-caption1);color:var(--muted);flex:1;display:flex;align-items:center;gap:4px;">'+icon('book-open',12)+' '+esc(o.title)+(q.page?' · s.'+q.page:'')+'</span>'; h+='<button onclick="App.copyQuoteById(\''+esc(o.bookId)+'\',\''+esc(q.id)+'\')" style="border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:28px;height:28px;border-radius:8px;color:var(--muted);display:flex;align-items:center;justify-content:center;">'+icon('copy',12)+'</button>'; h+='<button data-fx="destructive" onclick="App.removeQuote(\''+esc(o.bookId)+'\',\''+esc(q.id)+'\')" style="border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:28px;height:28px;border-radius:8px;color:var(--faint);display:flex;align-items:center;justify-content:center;">'+icon('trash-2',12)+'</button></div></div>'; });
  h+='</div>';
  return h;
}
function compactModalShell(closeFn,label,inner){
  var closeRef=String(closeFn||'').replace('()','');
  return '<div onclick="'+closeFn+'" style="position:fixed;inset:0;z-index:360;background:rgba(44,36,38,0.5);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:18px;animation:seyFade .2s ease;"><div id="sey-compact-modal" role="dialog" aria-modal="true" aria-label="'+esc(label||'Şeyma penceresi')+'" tabindex="-1" onkeydown="App.onModalKeydown(event,'+closeRef+')" onclick="event.stopPropagation()" style="width:100%;max-width:400px;background:var(--modal);border-radius:22px;padding:20px;display:flex;flex-direction:column;gap:11px;max-height:86vh;overflow-y:auto;animation:seyPop .22s ease;">'+(inner||'')+'</div></div>';
}
function bookEditModal(){
  var b=liveUi().bookEdit; var isNew=!b.id;
  var inner='<div style="display:flex;justify-content:space-between;align-items:center;"><div style="font-size:var(--f-body);font-weight:800;display:flex;align-items:center;gap:7px;">'+(isNew?(icon('book',16)+' Kitap ekle'):'Kitabı düzenle')+'</div><button onclick="App.closeBookEdit()" style="border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:32px;height:32px;border-radius:50%;color:var(--muted);display:flex;align-items:center;justify-content:center;">'+icon('x',15)+'</button></div>';
  inner+='<input type="text" value="'+esc(b.title||'')+'" oninput="App.onBookEditField(\'title\',this)" placeholder="Kitap adı" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:var(--f-subhead);outline:none;">';
  inner+='<input type="text" value="'+esc(b.author||'')+'" oninput="App.onBookEditField(\'author\',this)" placeholder="Yazar" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:var(--f-subhead);outline:none;">';
  inner+='<div style="display:flex;gap:6px;flex-wrap:wrap;">'; bookGenres().forEach(function(g){ var on=b.genre===g; inner+='<button onclick="App.pickBookGenre(\''+g+'\')" style="border:1px solid '+(on?'var(--read)':'var(--card-bd)')+';cursor:pointer;padding:6px 10px;border-radius:999px;font-size:var(--f-caption1);font-weight:700;color:'+(on?'#fff':'var(--muted)')+';background:'+(on?'linear-gradient(135deg,#6E55BF,#9B7FC9)':'var(--card)')+';">'+g+'</button>'; }); inner+='</div>';
  inner+='<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:var(--f-footnote);color:var(--text2);flex:1;">Toplam sayfa <span style="color:var(--faint);">(opsiyonel)</span></span><input type="number" inputmode="numeric" min="0" value="'+(b.totalPages!=null&&b.totalPages!==''?esc(b.totalPages):'')+'" oninput="App.onBookEditField(\'totalPages\',this)" placeholder="—" style="width:90px;border:1px solid var(--field-bd);background:var(--field);border-radius:11px;padding:9px;font-size:var(--f-subhead);text-align:center;outline:none;"></div>';
  inner+='<button onclick="App.saveBook()" style="border:none;cursor:pointer;width:100%;padding:13px;border-radius:13px;font-size:var(--f-subhead);font-weight:800;color:#fff;background:linear-gradient(135deg,#6E55BF,#9B7FC9 55%,#E9AFC1);">Kaydet</button>';
  if(!isNew) inner+='<button data-fx="destructive" onclick="App.deleteBook(\''+esc(b.id)+'\')" style="border:none;cursor:pointer;width:100%;padding:11px;border-radius:13px;font-size:var(--f-footnote);font-weight:700;color:#C0605F;background:rgba(220,120,120,0.1);">Kitabı sil</button>';
  return compactModalShell('App.closeBookEdit()','Kitap düzenleme',inner);
}
function quoteAddModal(){
  var q=liveUi().quoteDraft; var L=ensureLibrary(); var books=L.books;
  var inner='<div style="display:flex;justify-content:space-between;align-items:center;"><div style="font-size:var(--f-body);font-weight:800;display:flex;align-items:center;gap:7px;">'+icon('quote',16)+' Alıntı ekle</div><button onclick="App.closeQuoteAdd()" style="border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:32px;height:32px;border-radius:50%;color:var(--muted);display:flex;align-items:center;justify-content:center;">'+icon('x',15)+'</button></div>';
  inner+='<div style="font-size:var(--f-caption1);font-weight:700;color:var(--muted);">Kitap</div><div style="display:flex;gap:6px;flex-wrap:wrap;">'; books.forEach(function(b){ var on=q.bookId===b.id; inner+='<button onclick="App.pickQuoteBook(\''+esc(b.id)+'\')" style="border:1px solid '+(on?'var(--read)':'var(--card-bd)')+';cursor:pointer;padding:7px 10px;border-radius:11px;font-size:var(--f-caption1);font-weight:700;color:'+(on?'#fff':'var(--muted)')+';background:'+(on?'linear-gradient(135deg,#6E55BF,#9B7FC9)':'var(--card)')+';display:flex;align-items:center;gap:4px;">'+icon('book-open',12)+' '+esc(b.title.length>16?b.title.slice(0,15)+'…':b.title)+'</button>'; }); inner+='</div>';
  inner+='<textarea rows="3" oninput="App.onQuoteField(\'text\',this)" placeholder="Seni durduran o cümle…" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:var(--f-subhead);outline:none;resize:none;line-height:1.5;">'+esc(q.text||'')+'</textarea>';
  inner+='<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:var(--f-footnote);color:var(--text2);flex:1;">Sayfa <span style="color:var(--faint);">(opsiyonel)</span></span><input type="number" inputmode="numeric" min="0" value="'+(q.page!=null&&q.page!==''?esc(q.page):'')+'" oninput="App.onQuoteField(\'page\',this)" placeholder="—" style="width:90px;border:1px solid var(--field-bd);background:var(--field);border-radius:11px;padding:9px;font-size:var(--f-subhead);text-align:center;outline:none;"></div>';
  inner+='<button onclick="App.saveQuote()" style="border:none;cursor:pointer;width:100%;padding:13px;border-radius:13px;font-size:var(--f-subhead);font-weight:800;color:#fff;background:linear-gradient(135deg,#6E55BF,#9B7FC9 55%,#E9AFC1);">Kaydet</button>';
  return compactModalShell('App.closeQuoteAdd()','Alıntı ekleme',inner);
}

// ================= NE İZLEDİM HUB (overlay) =================
function titleStatusChip(st){ var m={watching:['İzleniyor','var(--watch)','var(--watch-bg)'],finished:['Bitti','var(--ok)','var(--ok-bg)'],dropped:['Bırakıldı','var(--pause)','var(--pause-bg)']}; var c=m[st]||m.watching; return '<span style="font-size:var(--f-caption2);font-weight:800;padding:2px 9px;border-radius:999px;color:'+c[1]+';background:'+c[2]+';">'+c[0]+'</span>'; }
function watchOverlayHTML(){
  var view=liveUi().watchView||'today';
  var head='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;"><div><div style="font-size:var(--f-title3);font-weight:800;display:flex;align-items:center;gap:8px;">Ne izledim? '+icon('clapperboard',19)+'</div><div style="font-size:var(--f-footnote);color:var(--faint);margin-top:3px;">Bugün izlediklerin, arşivin ve unutulmaz replikler.</div></div><button data-fx="close" onclick="App.closeWatching()" style="border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:34px;height:34px;border-radius:50%;color:var(--muted);flex-shrink:0;display:flex;align-items:center;justify-content:center;">'+icon('x',16)+'</button></div>';
  var tabs=segTabs([['today','Bugün'],['archive',icon('archive',13)+' Arşiv'],['stats',icon('chart-column',13)+' İstatistik'],['quotes',icon('quote',13)+' Replikler']],view,'App.setWatchView','watch');
  var body='';
  if(view==='today') body=watchTodayView();
  else if(view==='archive') body=watchArchiveView();
  else if(view==='stats') body=watchStatsView();
  else if(view==='quotes') body=watchQuotesView();
  var h=overlayShell('App.closeWatching()', head+tabs, body, null, true,'İzleme günlüğü');
  if(liveUi().titleEdit) h+=titleEditModal();
  if(liveUi().replicaDraft) h+=replicaAddModal();
  return h;
}
function watchTodayView(){
  var d=liveUi().watchDraft||{title:'',kind:'film',episodes:'',minutes:'',note:''};
  var kind=(d.kind==='dizi')?'dizi':'film';
  var day=getDay(liveData(),todayStr(),dayIndexFor(todayStr()));
  var wEntries=(day&&day.watching&&Array.isArray(day.watching.entries))?day.watching.entries:[];
  var totMin=wEntries.reduce(function(a,e){ var m=Number(e&&e.minutes); return a+((!isNaN(m)&&m>0)?m:0); },0);
  var W=ensureWatchlist();
  var goalMin=(W.goal&&W.goal.dailyMinutes)||0;
  var h='';
  if(goalMin>0){ var gp=Math.min(100,Math.round(totMin/goalMin*100)); h+='<div style="display:flex;align-items:center;gap:13px;background:linear-gradient(135deg,rgba(200,140,70,0.10),rgba(233,175,193,0.12));border:1px solid var(--card-bd);border-radius:18px;padding:13px 15px;">'; h+='<div style="position:relative;width:52px;height:52px;flex-shrink:0;"><svg width="52" height="52" viewBox="0 0 52 52"><circle cx="26" cy="26" r="22" fill="none" stroke="rgba(150,110,120,0.16)" stroke-width="6"></circle><circle cx="26" cy="26" r="22" fill="none" stroke="#C88F4C" stroke-width="6" stroke-linecap="round" stroke-dasharray="'+(2*Math.PI*22)+'" stroke-dashoffset="'+(2*Math.PI*22*(1-gp/100))+'" transform="rotate(-90 26 26)"></circle></svg><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:var(--f-caption1);font-weight:800;">'+gp+'%</div></div>'; h+='<div style="flex:1;min-width:0;"><div style="font-size:var(--f-footnote);font-weight:800;color:var(--text);">Günlük hedef · '+totMin+'/'+goalMin+' dk</div><div style="font-size:var(--f-caption1);color:var(--muted);line-height:1.35;">'+(totMin>=goalMin?'Bugünün keyfi tamam':'Keyfe '+(goalMin-totMin)+' dk kaldı.')+'</div></div></div>'; }
  var active=W.items.filter(function(t){ return t.status==='watching'; });
  if(active.length){ h+='<div><div style="font-size:var(--f-caption1);font-weight:800;color:var(--muted);margin-bottom:6px;letter-spacing:.3px;">İZLEDİĞİM YAPIM</div><div style="display:flex;gap:7px;flex-wrap:wrap;">'; active.forEach(function(t){ var on=liveUi().logItemId===t.id; h+='<button onclick="App.pickLogTitle(\''+esc(t.id)+'\')" style="border:1px solid '+(on?'var(--watch)':'var(--card-bd)')+';cursor:pointer;padding:7px 11px;border-radius:12px;font-size:var(--f-footnote);font-weight:700;color:'+(on?'#fff':'var(--text2)')+';background:'+(on?'linear-gradient(135deg,#C88F4C,#E0B080)':'var(--card)')+';display:flex;align-items:center;gap:5px;">'+icon('clapperboard',12)+' '+esc(t.title.length>18?t.title.slice(0,17)+'…':t.title)+'</button>'; }); h+='</div></div>'; }
  h+='<div style="display:flex;flex-direction:column;gap:10px;background:var(--card);border:1px solid var(--card-bd);border-radius:18px;padding:14px;">';
  h+='<div style="display:flex;gap:6px;">';
  h+='<button onclick="App.setWatchDraftKind(\'film\')" style="flex:1;border:1px solid '+(kind==='film'?'var(--watch)':'var(--field-bd)')+';cursor:pointer;padding:9px;border-radius:12px;font-size:var(--f-footnote);font-weight:800;color:'+(kind==='film'?'#fff':'var(--muted)')+';background:'+(kind==='film'?'linear-gradient(135deg,#C88F4C,#E0B080)':'var(--field)')+';display:flex;align-items:center;justify-content:center;gap:4px;">'+icon('clapperboard',13)+' Film</button>';
  h+='<button onclick="App.setWatchDraftKind(\'dizi\')" style="flex:1;border:1px solid '+(kind==='dizi'?'var(--watch)':'var(--field-bd)')+';cursor:pointer;padding:9px;border-radius:12px;font-size:var(--f-footnote);font-weight:800;color:'+(kind==='dizi'?'#fff':'var(--muted)')+';background:'+(kind==='dizi'?'linear-gradient(135deg,#C88F4C,#E0B080)':'var(--field)')+';display:flex;align-items:center;justify-content:center;gap:4px;">'+icon('clapperboard',13)+' Dizi</button>';
  h+='</div>';
  h+='<div><div style="font-size:var(--f-caption1);font-weight:700;color:var(--muted);margin-bottom:5px;">'+(kind==='dizi'?'Dizi adı':'Film adı')+'</div><input id="watch-title" type="text" value="'+esc(d.title||'')+'" oninput="App.onWatchField(\'title\',this)" placeholder="'+(kind==='dizi'?'örn. The Bear':'örn. Interstellar')+'" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:var(--f-subhead);outline:none;"></div>';
  h+='<div style="display:flex;gap:10px;">';
  if(kind==='dizi') h+='<div style="flex:1;"><div style="font-size:var(--f-caption1);font-weight:700;color:var(--muted);margin-bottom:5px;">Bölüm</div><input type="number" inputmode="numeric" min="0" value="'+(d.episodes!=null&&d.episodes!==''?esc(d.episodes):'')+'" oninput="App.onWatchField(\'episodes\',this)" placeholder="2" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:var(--f-subhead);outline:none;text-align:center;"></div>';
  h+='<div style="flex:1;"><div style="font-size:var(--f-caption1);font-weight:700;color:var(--muted);margin-bottom:5px;">Süre (dk)</div><input type="number" inputmode="numeric" min="0" value="'+(d.minutes!=null&&d.minutes!==''?esc(d.minutes):'')+'" oninput="App.onWatchField(\'minutes\',this)" placeholder="'+(kind==='dizi'?'45':'120')+'" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:var(--f-subhead);outline:none;text-align:center;"></div>';
  h+='</div>';
  h+='<div><div style="font-size:var(--f-caption1);font-weight:700;color:var(--muted);margin-bottom:5px;">Not <span style="color:var(--faint);font-weight:500;">(isteğe bağlı)</span></div><textarea rows="2" oninput="App.onWatchField(\'note\',this)" placeholder="Aklında kalan sahne, duygu…" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:10px 12px;font-size:var(--f-footnote);outline:none;resize:none;line-height:1.45;">'+esc(d.note||'')+'</textarea></div>';
  h+='<button onclick="App.addWatching()" style="border:none;cursor:pointer;width:100%;padding:14px;border-radius:14px;font-size:var(--f-subhead);font-weight:800;color:#fff;background:linear-gradient(135deg,#C88F4C,#E0B080 55%,#E9AFC1);box-shadow:0 10px 24px rgba(200,143,76,0.38);display:flex;align-items:center;justify-content:center;gap:7px;">İzlemeyi kaydet '+icon('clapperboard',16)+'</button>';
  h+='</div>';
  if(wEntries.length>0){
    h+='<div style="display:flex;flex-direction:column;gap:8px;">';
    h+='<div style="display:flex;align-items:center;justify-content:space-between;"><div style="font-size:var(--f-footnote);font-weight:800;color:var(--muted);letter-spacing:.3px;">BUGÜN ('+wEntries.length+')</div><div style="font-size:var(--f-caption1);color:var(--faint);">toplam '+fmtDur(totMin)+'</div></div>';
    wEntries.slice().reverse().forEach(function(e,i){ var meta=[]; if(e.kind==='dizi'&&e.episodes) meta.push(e.episodes+' bölüm'); if(e.minutes) meta.push(e.minutes+' dk'); var linked=e.itemId?findTitle(e.itemId):null; h+='<div class="sey-stagger" style="--i:'+Math.min(i,8)+';display:flex;align-items:flex-start;gap:10px;background:var(--card);border:1px solid var(--card-bd);border-radius:14px;padding:11px 12px;"><span style="line-height:1.2;display:inline-flex;color:var(--watch-ink);">'+icon('clapperboard',18)+'</span><div style="flex:1;min-width:0;"><div style="font-size:var(--f-footnote);font-weight:700;color:var(--text);">'+esc(e.title||'(başlıksız)')+(linked?' <span style="font-size:var(--f-caption2);color:var(--watch-ink);font-weight:700;">· arşivde</span>':'')+'</div>'+(meta.length?'<div style="font-size:var(--f-caption1);color:var(--muted);margin-top:2px;">'+meta.join(' · ')+'</div>':'')+(e.note?'<div style="font-size:var(--f-caption1);color:var(--text2);margin-top:4px;line-height:1.4;">'+esc(e.note)+'</div>':'')+'</div><button data-fx="destructive" onclick="App.removeWatching(\''+esc(e.id)+'\')" aria-label="Sil" style="flex-shrink:0;border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:28px;height:28px;border-radius:8px;color:var(--faint);display:flex;align-items:center;justify-content:center;">'+icon('trash-2',13)+'</button></div>'; });
    h+='</div>';
  } else {
    h+='<div style="text-align:center;font-size:var(--f-footnote);color:var(--faint);line-height:1.5;padding:4px 8px;">Henüz bugün için izleme eklemedin. Bir bölüm bile keyiftir.</div>';
  }
  return h;
}
function titleCard(t,i){
  var pct=titlePct(t); var meta=[]; meta.push(t.kind==='dizi'?'Dizi':'Film'); if(t.genre) meta.push(esc(t.genre));
  var h='<div class="sey-stagger" style="--i:'+Math.min(i,8)+';background:var(--card);border:1px solid var(--card-bd);border-radius:16px;padding:13px;display:flex;flex-direction:column;gap:9px;">';
  h+='<div style="display:flex;align-items:flex-start;gap:11px;"><div style="width:44px;height:44px;border-radius:12px;background:var(--icon);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--watch-ink);">'+icon('clapperboard',22)+'</div>';
  h+='<div style="flex:1;min-width:0;"><div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;"><span style="font-size:var(--f-subhead);font-weight:800;color:var(--text);">'+esc(t.title)+'</span>'+titleStatusChip(t.status)+'</div><div style="font-size:var(--f-caption1);color:var(--faint);margin-top:1px;">'+meta.join(' · ')+'</div></div>';
  h+='<button onclick="App.openTitleEdit(\''+esc(t.id)+'\')" aria-label="Düzenle" style="flex-shrink:0;border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:30px;height:30px;border-radius:9px;color:var(--muted);display:flex;align-items:center;justify-content:center;">'+icon('pen-line',13)+'</button></div>';
  if(t.status!=='finished'){
    if(t.kind==='dizi'){
      h+='<div style="display:flex;align-items:center;gap:9px;">';
      h+='<button onclick="App.advanceTitle(\''+esc(t.id)+'\',-1)" style="border:1px solid var(--field-bd);cursor:pointer;width:30px;height:30px;border-radius:9px;font-size:var(--f-subhead);font-weight:800;color:var(--muted);background:var(--card);flex-shrink:0;">−</button>';
      h+='<div style="flex:1;min-width:0;">'+progBar(pct,'linear-gradient(90deg,#C88F4C,#E9AFC1)')+'<div style="font-size:var(--f-caption2);color:var(--muted);margin-top:4px;display:flex;justify-content:space-between;"><span>'+t.watchedEp+(t.totalEp?' / '+t.totalEp+' bölüm':' bölüm')+'</span><span>%'+pct+'</span></div></div>';
      h+='<button onclick="App.advanceTitle(\''+esc(t.id)+'\',1)" style="border:1px solid var(--field-bd);cursor:pointer;width:30px;height:30px;border-radius:9px;font-size:var(--f-subhead);font-weight:800;color:var(--watch-ink);background:var(--card);flex-shrink:0;">+</button>';
      h+='</div>';
    }
    h+='<div style="display:flex;gap:7px;"><button onclick="App.finishTitle(\''+esc(t.id)+'\')" style="flex:1;border:none;cursor:pointer;padding:9px;border-radius:11px;font-size:var(--f-footnote);font-weight:800;color:#fff;background:linear-gradient(135deg,#7DBE77,#5BA85B);display:flex;align-items:center;justify-content:center;gap:5px;">'+icon('check',13)+' Bitirdim</button>';
    if(t.status==='watching') h+='<button onclick="App.setTitleStatus(\''+esc(t.id)+'\',\'dropped\')" style="border:1px solid var(--field-bd);cursor:pointer;padding:9px 12px;border-radius:11px;font-size:var(--f-footnote);font-weight:700;color:var(--muted);background:var(--card);">Yarıda bıraktım</button>';
    else h+='<button onclick="App.setTitleStatus(\''+esc(t.id)+'\',\'watching\')" style="border:1px solid var(--field-bd);cursor:pointer;padding:9px 12px;border-radius:11px;font-size:var(--f-footnote);font-weight:700;color:var(--watch-ink);background:var(--card);">Devam et</button>';
    h+='</div>';
  } else {
    h+='<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">'+starRow(t.rating,'App.rateTitle',t.id,17)+'<button onclick="App.reopenTitle(\''+esc(t.id)+'\')" style="border:1px solid var(--field-bd);cursor:pointer;padding:7px 12px;border-radius:11px;font-size:var(--f-caption1);font-weight:700;color:var(--watch-ink);background:var(--card);">Yeniden izle</button></div>';
    if(t.finishedAt) h+='<div style="font-size:var(--f-caption2);color:var(--faint);display:flex;align-items:center;gap:4px;">'+icon('trophy',12)+' '+esc(shortDate(fmt(new Date(t.finishedAt))))+' tarihinde bitti</div>';
  }
  return h+'</div>';
}
function watchArchiveView(){
  var W=ensureWatchlist();
  var h='<button onclick="App.openTitleEdit(\'\')" style="border:1px dashed var(--watch);cursor:pointer;width:100%;padding:12px;border-radius:14px;font-size:var(--f-footnote);font-weight:800;color:var(--watch-ink);background:rgba(224,176,128,0.10);">＋ Film / dizi ekle</button>';
  var order={watching:0,finished:1,dropped:2};
  var items=W.items.slice().sort(function(a,b){ return (order[a.status]-order[b.status])||String(b.createdAt||'').localeCompare(String(a.createdAt||'')); });
  if(!items.length){ h+='<div style="text-align:center;font-size:var(--f-footnote);color:var(--faint);line-height:1.6;padding:22px 10px;">Arşivin henüz boş<br>İzlemeye başladığın yapımı ekle, ilerlemen burada birik.</div>'; return h; }
  var watching=items.filter(function(t){return t.status==='watching';}),finished=items.filter(function(t){return t.status==='finished';}),dropped=items.filter(function(t){return t.status==='dropped';});
  function sec(title,arr){ if(!arr.length) return ''; var s='<div style="font-size:var(--f-caption1);font-weight:800;color:var(--muted);letter-spacing:.3px;margin:4px 2px 0;">'+title+' ('+arr.length+')</div>'; arr.forEach(function(t,i){ s+=titleCard(t,i); }); return s; }
  h+='<div style="display:flex;flex-direction:column;gap:10px;">'+sec('İZLİYORUM',watching)+sec('BİTİRDİKLERİM',finished)+sec('YARIDA BIRAKTIKLARIM',dropped)+'</div>';
  return h;
}
function watchStatsView(){
  var W=ensureWatchlist(); var s=watchStats(); var t=watchTotals(); var streak=watchStreak(); var week=weekWatch();
  var goalY=(W.goal&&W.goal.yearlyTitles)||0; var goalMin=(W.goal&&W.goal.dailyMinutes)||0;
  var h='<div style="display:flex;gap:9px;">'+statTile('Bitirilen',s.finished,'yapım')+statTile('İzleniyor',s.watching)+statTile('Seri',streak,'gün')+'</div>';
  h+='<div style="display:flex;gap:9px;">'+statTile('Toplam süre',fmtDur(t.minutes))+statTile('Toplam bölüm',t.eps)+statTile('İzleme günü',t.days)+'</div>';
  h+='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:16px;padding:14px;"><div style="font-size:var(--f-footnote);font-weight:800;color:var(--muted);margin-bottom:10px;">Son 7 gün · dakika</div>'+miniBars(week,'minutes','dk','linear-gradient(180deg,#E0B080,#C88F4C)')+'</div>';
  h+='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:10px;"><div style="font-size:var(--f-footnote);font-weight:800;color:var(--muted);display:flex;align-items:center;gap:5px;">'+icon('target',13)+' Hedefler</div>';
  h+='<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:var(--f-footnote);color:var(--text2);flex:1;">Günlük dakika hedefi</span><input type="number" inputmode="numeric" min="0" value="'+(goalMin||'')+'" oninput="App.setWatchGoal(\'dailyMinutes\',this)" placeholder="40" style="width:74px;border:1px solid var(--field-bd);background:var(--field);border-radius:11px;padding:8px;font-size:var(--f-subhead);text-align:center;outline:none;"></div>';
  h+='<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:var(--f-footnote);color:var(--text2);flex:1;">Bu yıl yapım hedefi</span><input type="number" inputmode="numeric" min="0" value="'+(goalY||'')+'" oninput="App.setWatchGoal(\'yearlyTitles\',this)" placeholder="30" style="width:74px;border:1px solid var(--field-bd);background:var(--field);border-radius:11px;padding:8px;font-size:var(--f-subhead);text-align:center;outline:none;"></div>';
  if(goalY>0){ var yp=Math.min(100,Math.round(s.finYear/goalY*100)); h+='<div>'+progBar(yp,'linear-gradient(90deg,#C88F4C,#E9AFC1)')+'<div style="font-size:var(--f-caption1);color:var(--muted);margin-top:5px;">'+new Date().getFullYear()+': '+s.finYear+'/'+goalY+' yapım · %'+yp+'</div></div>'; }
  h+='</div>';
  return h;
}
function watchQuotesView(){
  var qs=allReplicas(); var W=ensureWatchlist();
  var h='<button onclick="App.openReplicaAdd(\'\')" '+(W.items.length?'':'disabled ')+'style="border:1px dashed var(--watch);cursor:'+(W.items.length?'pointer':'not-allowed')+';width:100%;padding:12px;border-radius:14px;font-size:var(--f-footnote);font-weight:800;color:var(--watch-ink);background:rgba(224,176,128,0.10);opacity:'+(W.items.length?'1':'0.5')+';">＋ Replik ekle</button>';
  if(!W.items.length){ h+='<div style="text-align:center;font-size:var(--f-footnote);color:var(--faint);line-height:1.6;padding:16px 10px;">Replik eklemek için önce arşivine bir yapım ekle</div>'; return h; }
  if(!qs.length){ h+='<div style="text-align:center;font-size:var(--f-footnote);color:var(--faint);line-height:1.6;padding:22px 10px;">Henüz replik yok<br>O unutamadığın repliği buraya bırak.</div>'; return h; }
  h+='<div style="display:flex;flex-direction:column;gap:10px;">';
  qs.forEach(function(o){ var q=o.q; h+='<div style="background:linear-gradient(135deg,rgba(200,143,76,0.08),rgba(233,175,193,0.09));border:1px solid var(--card-bd);border-radius:16px;padding:14px;position:relative;">'; h+='<div style="position:absolute;top:2px;right:12px;font-size:44px;color:var(--faint);opacity:0.25;line-height:1;">”</div>'; h+='<div style="font-size:var(--f-subhead);line-height:1.5;color:var(--text);font-style:italic;position:relative;">'+esc(q.text)+'</div>'; h+='<div style="display:flex;align-items:center;gap:8px;margin-top:9px;"><span style="font-size:var(--f-caption1);color:var(--muted);flex:1;display:flex;align-items:center;gap:4px;">'+icon('clapperboard',12)+' '+esc(o.title)+'</span>'; h+='<button onclick="App.copyReplicaById(\''+esc(o.itemId)+'\',\''+esc(q.id)+'\')" style="border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:28px;height:28px;border-radius:8px;color:var(--muted);display:flex;align-items:center;justify-content:center;">'+icon('copy',12)+'</button>'; h+='<button data-fx="destructive" onclick="App.removeReplica(\''+esc(o.itemId)+'\',\''+esc(q.id)+'\')" style="border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:28px;height:28px;border-radius:8px;color:var(--faint);display:flex;align-items:center;justify-content:center;">'+icon('trash-2',12)+'</button></div></div>'; });
  h+='</div>';
  return h;
}
function titleEditModal(){
  var t=liveUi().titleEdit; var isNew=!t.id; var kind=(t.kind==='dizi')?'dizi':'film';
  var inner='<div style="display:flex;justify-content:space-between;align-items:center;"><div style="font-size:var(--f-body);font-weight:800;display:flex;align-items:center;gap:7px;">'+(isNew?(icon('clapperboard',16)+' Yapım ekle'):'Yapımı düzenle')+'</div><button onclick="App.closeTitleEdit()" style="border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:32px;height:32px;border-radius:50%;color:var(--muted);display:flex;align-items:center;justify-content:center;">'+icon('x',15)+'</button></div>';
  inner+='<div style="display:flex;gap:6px;"><button onclick="App.setTitleEditKind(\'film\')" style="flex:1;border:1px solid '+(kind==='film'?'var(--watch)':'var(--field-bd)')+';cursor:pointer;padding:9px;border-radius:12px;font-size:var(--f-footnote);font-weight:800;color:'+(kind==='film'?'#fff':'var(--muted)')+';background:'+(kind==='film'?'linear-gradient(135deg,#C88F4C,#E0B080)':'var(--field)')+';display:flex;align-items:center;justify-content:center;gap:4px;">'+icon('clapperboard',13)+' Film</button><button onclick="App.setTitleEditKind(\'dizi\')" style="flex:1;border:1px solid '+(kind==='dizi'?'var(--watch)':'var(--field-bd)')+';cursor:pointer;padding:9px;border-radius:12px;font-size:var(--f-footnote);font-weight:800;color:'+(kind==='dizi'?'#fff':'var(--muted)')+';background:'+(kind==='dizi'?'linear-gradient(135deg,#C88F4C,#E0B080)':'var(--field)')+';display:flex;align-items:center;justify-content:center;gap:4px;">'+icon('clapperboard',13)+' Dizi</button></div>';
  inner+='<input type="text" value="'+esc(t.title||'')+'" oninput="App.onTitleEditField(\'title\',this)" placeholder="Yapım adı" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:var(--f-subhead);outline:none;">';
  inner+='<div style="display:flex;gap:6px;flex-wrap:wrap;">'; titleGenres().forEach(function(g){ var on=t.genre===g; inner+='<button onclick="App.pickTitleGenre(\''+g+'\')" style="border:1px solid '+(on?'var(--watch)':'var(--card-bd)')+';cursor:pointer;padding:6px 10px;border-radius:999px;font-size:var(--f-caption1);font-weight:700;color:'+(on?'#fff':'var(--muted)')+';background:'+(on?'linear-gradient(135deg,#C88F4C,#E0B080)':'var(--card)')+';">'+g+'</button>'; }); inner+='</div>';
  if(kind==='dizi') inner+='<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:var(--f-footnote);color:var(--text2);flex:1;">Toplam bölüm <span style="color:var(--faint);">(opsiyonel)</span></span><input type="number" inputmode="numeric" min="0" value="'+(t.totalEp!=null&&t.totalEp!==''?esc(t.totalEp):'')+'" oninput="App.onTitleEditField(\'totalEp\',this)" placeholder="—" style="width:90px;border:1px solid var(--field-bd);background:var(--field);border-radius:11px;padding:9px;font-size:var(--f-subhead);text-align:center;outline:none;"></div>';
  inner+='<button onclick="App.saveTitle()" style="border:none;cursor:pointer;width:100%;padding:13px;border-radius:13px;font-size:var(--f-subhead);font-weight:800;color:#fff;background:linear-gradient(135deg,#C88F4C,#E0B080 55%,#E9AFC1);">Kaydet</button>';
  if(!isNew) inner+='<button data-fx="destructive" onclick="App.deleteTitle(\''+esc(t.id)+'\')" style="border:none;cursor:pointer;width:100%;padding:11px;border-radius:13px;font-size:var(--f-footnote);font-weight:700;color:#C0605F;background:rgba(220,120,120,0.1);">Yapımı sil</button>';
  return compactModalShell('App.closeTitleEdit()','İzleme kaydı düzenleme',inner);
}
function replicaAddModal(){
  var q=liveUi().replicaDraft; var W=ensureWatchlist(); var items=W.items;
  var inner='<div style="display:flex;justify-content:space-between;align-items:center;"><div style="font-size:var(--f-body);font-weight:800;display:flex;align-items:center;gap:7px;">'+icon('quote',16)+' Replik ekle</div><button onclick="App.closeReplicaAdd()" style="border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:32px;height:32px;border-radius:50%;color:var(--muted);display:flex;align-items:center;justify-content:center;">'+icon('x',15)+'</button></div>';
  inner+='<div style="font-size:var(--f-caption1);font-weight:700;color:var(--muted);">Yapım</div><div style="display:flex;gap:6px;flex-wrap:wrap;">'; items.forEach(function(t){ var on=q.itemId===t.id; inner+='<button onclick="App.pickReplicaTitle(\''+esc(t.id)+'\')" style="border:1px solid '+(on?'var(--watch)':'var(--card-bd)')+';cursor:pointer;padding:7px 10px;border-radius:11px;font-size:var(--f-caption1);font-weight:700;color:'+(on?'#fff':'var(--muted)')+';background:'+(on?'linear-gradient(135deg,#C88F4C,#E0B080)':'var(--card)')+';display:flex;align-items:center;gap:4px;">'+icon('clapperboard',12)+' '+esc(t.title.length>16?t.title.slice(0,15)+'…':t.title)+'</button>'; }); inner+='</div>';
  inner+='<textarea rows="3" oninput="App.onReplicaField(\'text\',this)" placeholder="O unutamadığın replik…" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:var(--f-subhead);outline:none;resize:none;line-height:1.5;">'+esc(q.text||'')+'</textarea>';
  inner+='<button onclick="App.saveReplica()" style="border:none;cursor:pointer;width:100%;padding:13px;border-radius:13px;font-size:var(--f-subhead);font-weight:800;color:#fff;background:linear-gradient(135deg,#C88F4C,#E0B080 55%,#E9AFC1);">Kaydet</button>';
  return compactModalShell('App.closeReplicaAdd()','İzleme kaydı ekleme',inner);
}

// ================= NE DİNLEDİM HUB (overlay) =================
var MUSIC_GENRES=['Pop','Rock','Türkçe','Rap','Elektronik','Caz','Klasik','Akustik','Podcast','Film müziği'];
function listenKindMeta(k){ return (k==='podcast')?{label:'Podcast',icon:'mic'}:(k==='album')?{label:'Albüm',icon:'disc'}:{label:'Şarkı',icon:'music'}; }
function listeningOverlayHTML(){
  var view=liveUi().listeningView||'today';
  var head='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;"><div><div style="font-size:var(--f-title3);font-weight:800;display:flex;align-items:center;gap:8px;">Ne dinledim? '+icon('headphones',19)+'</div><div style="font-size:var(--f-footnote);color:var(--faint);margin-top:3px;">Bugün dinlediklerin, favorilerin ve akılda kalan sözler.</div></div><button data-fx="close" onclick="App.closeListening()" style="border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:34px;height:34px;border-radius:50%;color:var(--muted);flex-shrink:0;display:flex;align-items:center;justify-content:center;">'+icon('x',16)+'</button></div>';
  var tabs=segTabs([['today','Bugün'],['favs',icon('star',13)+' Favoriler'],['stats',icon('chart-column',13)+' İstatistik'],['lyrics',icon('quote',13)+' Sözler']],view,'App.setListeningView','listen');
  var body='';
  if(view==='today') body=listeningTodayView();
  else if(view==='favs') body=listeningFavsView();
  else if(view==='stats') body=listeningStatsView();
  else if(view==='lyrics') body=listeningLyricsView();
  var h=overlayShell('App.closeListening()', head+tabs, body, null, true,'Dinleme günlüğü');
  if(liveUi().trackEdit) h+=trackEditModal();
  if(liveUi().lyricDraft) h+=lyricAddModal();
  return h;
}
function listeningTodayView(){
  var d=liveUi().listeningDraft||{title:'',artist:'',kind:'sarki',minutes:'',note:''};
  var kind=(['sarki','album','podcast'].indexOf(d.kind)>=0)?d.kind:'sarki';
  var day=getDay(liveData(),todayStr(),dayIndexFor(todayStr()));
  var lEntries=(day&&day.listening&&Array.isArray(day.listening.entries))?day.listening.entries:[];
  var totMin=lEntries.reduce(function(a,e){ var m=Number(e&&e.minutes); return a+((!isNaN(m)&&m>0)?m:0); },0);
  var M=ensureMusic();
  var goalMin=(M.goal&&M.goal.dailyMinutes)||0;
  var h='';
  if(goalMin>0){ var gp=Math.min(100,Math.round(totMin/goalMin*100)); h+='<div style="display:flex;align-items:center;gap:13px;background:linear-gradient(135deg,rgba(14,154,167,0.10),rgba(233,175,193,0.12));border:1px solid var(--card-bd);border-radius:18px;padding:13px 15px;">'; h+='<div style="position:relative;width:52px;height:52px;flex-shrink:0;"><svg width="52" height="52" viewBox="0 0 52 52"><circle cx="26" cy="26" r="22" fill="none" stroke="rgba(150,110,120,0.16)" stroke-width="6"></circle><circle cx="26" cy="26" r="22" fill="none" stroke="#0E9AA7" stroke-width="6" stroke-linecap="round" stroke-dasharray="'+(2*Math.PI*22)+'" stroke-dashoffset="'+(2*Math.PI*22*(1-gp/100))+'" transform="rotate(-90 26 26)"></circle></svg><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:var(--f-caption1);font-weight:800;">'+gp+'%</div></div>'; h+='<div style="flex:1;min-width:0;"><div style="font-size:var(--f-footnote);font-weight:800;color:var(--text);">Günlük hedef · '+totMin+'/'+goalMin+' dk</div><div style="font-size:var(--f-caption1);color:var(--muted);line-height:1.35;">'+(totMin>=goalMin?'Bugünün müziği tamam':'Hedefe '+(goalMin-totMin)+' dk kaldı.')+'</div></div></div>'; }
  var favs=M.items;
  if(favs.length){ h+='<div><div style="font-size:var(--f-caption1);font-weight:800;color:var(--muted);margin-bottom:6px;letter-spacing:.3px;">FAVORİLERİMDEN</div><div style="display:flex;gap:7px;flex-wrap:wrap;">'; favs.slice(0,8).forEach(function(x){ var on=liveUi().logTrackId===x.id; h+='<button onclick="App.pickLogTrack(\''+esc(x.id)+'\')" style="border:1px solid '+(on?'var(--listen)':'var(--card-bd)')+';cursor:pointer;padding:7px 11px;border-radius:12px;font-size:var(--f-footnote);font-weight:700;color:'+(on?'#fff':'var(--text2)')+';background:'+(on?'linear-gradient(135deg,#0E9AA7,#2BC4C4)':'var(--card)')+';display:flex;align-items:center;gap:5px;">'+icon('music',12)+' '+esc(x.title.length>18?x.title.slice(0,17)+'…':x.title)+'</button>'; }); h+='</div></div>'; }
  h+='<div style="display:flex;flex-direction:column;gap:10px;background:var(--card);border:1px solid var(--card-bd);border-radius:18px;padding:14px;">';
  h+='<div style="display:flex;gap:6px;">';
  listenKinds().forEach(function(kk){ var on=kind===kk[0]; h+='<button onclick="App.setListenDraftKind(\''+kk[0]+'\')" style="flex:1;border:1px solid '+(on?'var(--listen)':'var(--field-bd)')+';cursor:pointer;padding:9px 4px;border-radius:12px;font-size:var(--f-footnote);font-weight:800;color:'+(on?'#fff':'var(--muted)')+';background:'+(on?'linear-gradient(135deg,#0E9AA7,#2BC4C4)':'var(--field)')+';">'+kk[1]+'</button>'; });
  h+='</div>';
  var titleLabel=kind==='podcast'?'Bölüm / podcast adı':(kind==='album'?'Albüm adı':'Şarkı adı');
  var titlePh=kind==='podcast'?'örn. Söz Müzik #42':(kind==='album'?'örn. Random Access Memories':'örn. Bir Derdim Var');
  h+='<div><div style="font-size:var(--f-caption1);font-weight:700;color:var(--muted);margin-bottom:5px;">'+titleLabel+'</div><input id="listening-title" type="text" value="'+esc(d.title||'')+'" oninput="App.onListeningField(\'title\',this)" placeholder="'+titlePh+'" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:var(--f-subhead);outline:none;"></div>';
  h+='<div style="display:flex;gap:10px;"><div style="flex:1;min-width:0;"><div style="font-size:var(--f-caption1);font-weight:700;color:var(--muted);margin-bottom:5px;">'+(kind==='podcast'?'Yayıncı':'Sanatçı')+' <span style="color:var(--faint);font-weight:500;">(ops.)</span></div><input type="text" value="'+esc(d.artist||'')+'" oninput="App.onListeningField(\'artist\',this)" placeholder="'+(kind==='podcast'?'örn. Podbee':'örn. MFÖ')+'" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:var(--f-subhead);outline:none;"></div>';
  h+='<div style="width:104px;flex-shrink:0;"><div style="font-size:var(--f-caption1);font-weight:700;color:var(--muted);margin-bottom:5px;">Süre (dk)</div><input type="number" inputmode="numeric" min="0" value="'+(d.minutes!=null&&d.minutes!==''?esc(d.minutes):'')+'" oninput="App.onListeningField(\'minutes\',this)" placeholder="'+(kind==='podcast'?'45':'20')+'" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px;font-size:var(--f-subhead);outline:none;text-align:center;"></div></div>';
  h+='<div><div style="font-size:var(--f-caption1);font-weight:700;color:var(--muted);margin-bottom:5px;">Not <span style="color:var(--faint);font-weight:500;">(isteğe bağlı)</span></div><textarea rows="2" oninput="App.onListeningField(\'note\',this)" placeholder="Ruh hâline nasıl dokundu…" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:10px 12px;font-size:var(--f-footnote);outline:none;resize:none;line-height:1.45;">'+esc(d.note||'')+'</textarea></div>';
  h+='<button onclick="App.addListening()" style="border:none;cursor:pointer;width:100%;padding:14px;border-radius:14px;font-size:var(--f-subhead);font-weight:800;color:#fff;background:linear-gradient(135deg,#0E9AA7,#2BC4C4 55%,#E9AFC1);box-shadow:0 10px 24px rgba(14,154,167,0.34);display:flex;align-items:center;justify-content:center;gap:7px;">Dinlemeyi kaydet '+icon('headphones',16)+'</button>';
  h+='</div>';
  if(lEntries.length>0){
    h+='<div style="display:flex;flex-direction:column;gap:8px;">';
    h+='<div style="display:flex;align-items:center;justify-content:space-between;"><div style="font-size:var(--f-footnote);font-weight:800;color:var(--muted);letter-spacing:.3px;">BUGÜN ('+lEntries.length+')</div><div style="font-size:var(--f-caption1);color:var(--faint);">toplam '+fmtDur(totMin)+'</div></div>';
    lEntries.slice().reverse().forEach(function(e,i){ var meta=[]; var km=listenKindMeta(e.kind); meta.push(km.label); if(e.minutes) meta.push(e.minutes+' dk'); var linked=e.itemId?findTrack(e.itemId):null; h+='<div class="sey-stagger" style="--i:'+Math.min(i,8)+';display:flex;align-items:flex-start;gap:10px;background:var(--card);border:1px solid var(--card-bd);border-radius:14px;padding:11px 12px;"><span style="line-height:1.2;display:inline-flex;color:var(--listen-ink);">'+icon(km.icon,18)+'</span><div style="flex:1;min-width:0;"><div style="font-size:var(--f-footnote);font-weight:700;color:var(--text);">'+esc(e.title||'(başlıksız)')+(linked?' <span style="font-size:var(--f-caption2);color:var(--listen-ink);font-weight:700;">· favori</span>':'')+'</div>'+(e.artist?'<div style="font-size:var(--f-caption1);color:var(--faint);">'+esc(e.artist)+'</div>':'')+'<div style="font-size:var(--f-caption1);color:var(--muted);margin-top:2px;">'+meta.join(' · ')+'</div>'+(e.note?'<div style="font-size:var(--f-caption1);color:var(--text2);margin-top:4px;line-height:1.4;">'+esc(e.note)+'</div>':'')+'</div><button data-fx="destructive" onclick="App.removeListening(\''+esc(e.id)+'\')" aria-label="Sil" style="flex-shrink:0;border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:28px;height:28px;border-radius:8px;color:var(--faint);display:flex;align-items:center;justify-content:center;">'+icon('trash-2',13)+'</button></div>'; });
    h+='</div>';
  } else {
    h+='<div style="text-align:center;font-size:var(--f-footnote);color:var(--faint);line-height:1.5;padding:4px 8px;">Henüz bugün için dinleme eklemedin. Bir şarkı bile sayılır.</div>';
  }
  return h;
}
function trackCard(x,i){
  var km=listenKindMeta(x.kind); var meta=[km.label]; if(x.artist) meta.push(esc(x.artist)); if(x.genre) meta.push(esc(x.genre));
  var h='<div class="sey-stagger" style="--i:'+Math.min(i,8)+';background:var(--card);border:1px solid var(--card-bd);border-radius:16px;padding:13px;display:flex;flex-direction:column;gap:9px;">';
  h+='<div style="display:flex;align-items:flex-start;gap:11px;"><div style="width:44px;height:44px;border-radius:12px;background:var(--icon);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--listen-ink);">'+icon(km.icon,22)+'</div>';
  h+='<div style="flex:1;min-width:0;"><div style="font-size:var(--f-subhead);font-weight:800;color:var(--text);">'+esc(x.title)+'</div><div style="font-size:var(--f-caption1);color:var(--faint);margin-top:1px;">'+meta.join(' · ')+'</div></div>';
  h+='<button onclick="App.openTrackEdit(\''+esc(x.id)+'\')" aria-label="Düzenle" style="flex-shrink:0;border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:30px;height:30px;border-radius:9px;color:var(--muted);display:flex;align-items:center;justify-content:center;">'+icon('pen-line',13)+'</button></div>';
  h+=starRow(x.rating,'App.rateTrack',x.id,17);
  return h+'</div>';
}
function listeningFavsView(){
  var M=ensureMusic();
  var h='<button onclick="App.openTrackEdit(\'\')" style="border:1px dashed var(--listen);cursor:pointer;width:100%;padding:12px;border-radius:14px;font-size:var(--f-footnote);font-weight:800;color:var(--listen-ink);background:rgba(14,154,167,0.08);">＋ Favori ekle</button>';
  var items=M.items.slice().sort(function(a,b){ return String(b.createdAt||'').localeCompare(String(a.createdAt||'')); });
  if(!items.length){ h+='<div style="text-align:center;font-size:var(--f-footnote);color:var(--faint);line-height:1.6;padding:22px 10px;">Favori listen henüz boş<br>Sevdiğin şarkı, albüm ya da podcast’i ekle; burada birer birer birikssin.</div>'; return h; }
  function sec(title,arr){ if(!arr.length) return ''; var s='<div style="font-size:var(--f-caption1);font-weight:800;color:var(--muted);letter-spacing:.3px;margin:4px 2px 0;">'+title+' ('+arr.length+')</div>'; arr.forEach(function(x,i){ s+=trackCard(x,i); }); return s; }
  var sarki=items.filter(function(x){return x.kind==='sarki';}),album=items.filter(function(x){return x.kind==='album';}),pod=items.filter(function(x){return x.kind==='podcast';});
  h+='<div style="display:flex;flex-direction:column;gap:10px;">'+sec('ŞARKILAR',sarki)+sec('ALBÜMLER',album)+sec('PODCASTLER',pod)+'</div>';
  return h;
}
function listeningStatsView(){
  var M=ensureMusic(); var s=musicStats(); var t=listenTotals(); var streak=listenStreak(); var week=weekListen();
  var goalMin=(M.goal&&M.goal.dailyMinutes)||0;
  var h='<div style="display:flex;gap:9px;">'+statTile('Favori',s.total,'parça')+statTile('Dinleme günü',t.days)+statTile('Seri',streak,'gün')+'</div>';
  h+='<div style="display:flex;gap:9px;">'+statTile('Toplam süre',fmtDur(t.minutes))+statTile('Kayıt',t.items)+statTile('Podcast',s.podcast)+'</div>';
  h+='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:16px;padding:14px;"><div style="font-size:var(--f-footnote);font-weight:800;color:var(--muted);margin-bottom:10px;">Son 7 gün · dakika</div>'+miniBars(week,'minutes','dk','linear-gradient(180deg,#2BC4C4,#0E9AA7)')+'</div>';
  h+='<div style="background:var(--card);border:1px solid var(--card-bd);border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:10px;"><div style="font-size:var(--f-footnote);font-weight:800;color:var(--muted);display:flex;align-items:center;gap:5px;">'+icon('target',13)+' Hedef</div>';
  h+='<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:var(--f-footnote);color:var(--text2);flex:1;">Günlük dinleme hedefi (dk)</span><input type="number" inputmode="numeric" min="0" value="'+(goalMin||'')+'" oninput="App.setListenGoal(\'dailyMinutes\',this)" placeholder="30" style="width:74px;border:1px solid var(--field-bd);background:var(--field);border-radius:11px;padding:8px;font-size:var(--f-subhead);text-align:center;outline:none;"></div>';
  h+='</div>';
  return h;
}
function listeningLyricsView(){
  var qs=allLyrics(); var M=ensureMusic();
  var h='<button onclick="App.openLyricAdd(\'\')" '+(M.items.length?'':'disabled ')+'style="border:1px dashed var(--listen);cursor:'+(M.items.length?'pointer':'not-allowed')+';width:100%;padding:12px;border-radius:14px;font-size:var(--f-footnote);font-weight:800;color:var(--listen-ink);background:rgba(14,154,167,0.08);opacity:'+(M.items.length?'1':'0.5')+';">＋ Söz ekle</button>';
  if(!M.items.length){ h+='<div style="text-align:center;font-size:var(--f-footnote);color:var(--faint);line-height:1.6;padding:16px 10px;">Söz eklemek için önce favorilerine bir parça ekle</div>'; return h; }
  if(!qs.length){ h+='<div style="text-align:center;font-size:var(--f-footnote);color:var(--faint);line-height:1.6;padding:22px 10px;">Henüz söz yok<br>İçine işleyen o dizeyi buraya bırak.</div>'; return h; }
  h+='<div style="display:flex;flex-direction:column;gap:10px;">';
  qs.forEach(function(o){ var q=o.q; h+='<div style="background:linear-gradient(135deg,rgba(14,154,167,0.08),rgba(233,175,193,0.09));border:1px solid var(--card-bd);border-radius:16px;padding:14px;position:relative;">'; h+='<div style="position:absolute;top:2px;right:12px;font-size:44px;color:var(--faint);opacity:0.25;line-height:1;">”</div>'; h+='<div style="font-size:var(--f-subhead);line-height:1.5;color:var(--text);font-style:italic;position:relative;">'+esc(q.text)+'</div>'; h+='<div style="display:flex;align-items:center;gap:8px;margin-top:9px;"><span style="font-size:var(--f-caption1);color:var(--muted);flex:1;display:flex;align-items:center;gap:4px;">'+icon('music',12)+' '+esc(o.title)+(o.artist?' · '+esc(o.artist):'')+'</span>'; h+='<button onclick="App.copyLyricById(\''+esc(o.itemId)+'\',\''+esc(q.id)+'\')" style="border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:28px;height:28px;border-radius:8px;color:var(--muted);display:flex;align-items:center;justify-content:center;">'+icon('copy',12)+'</button>'; h+='<button data-fx="destructive" onclick="App.removeLyric(\''+esc(o.itemId)+'\',\''+esc(q.id)+'\')" style="border:none;background:rgba(150,110,120,0.12);cursor:pointer;width:28px;height:28px;border-radius:8px;color:var(--faint);display:flex;align-items:center;justify-content:center;">'+icon('trash-2',12)+'</button></div></div>'; });
  h+='</div>';
  return h;
}
function trackEditModal(){
  var x=liveUi().trackEdit; var isNew=!x.id; var kind=(['sarki','album','podcast'].indexOf(x.kind)>=0)?x.kind:'sarki';
  var inner='<div style="display:flex;justify-content:space-between;align-items:center;"><div style="font-size:var(--f-body);font-weight:800;display:flex;align-items:center;gap:7px;">'+(isNew?(icon('music',16)+' Favori ekle'):'Favoriyi düzenle')+'</div><button onclick="App.closeTrackEdit()" style="border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:32px;height:32px;border-radius:50%;color:var(--muted);display:flex;align-items:center;justify-content:center;">'+icon('x',15)+'</button></div>';
  inner+='<div style="display:flex;gap:6px;">'; listenKinds().forEach(function(kk){ var on=kind===kk[0]; inner+='<button onclick="App.setTrackEditKind(\''+kk[0]+'\')" style="flex:1;border:1px solid '+(on?'var(--listen)':'var(--field-bd)')+';cursor:pointer;padding:9px 4px;border-radius:12px;font-size:var(--f-footnote);font-weight:800;color:'+(on?'#fff':'var(--muted)')+';background:'+(on?'linear-gradient(135deg,#0E9AA7,#2BC4C4)':'var(--field)')+';">'+kk[1]+'</button>'; }); inner+='</div>';
  inner+='<input type="text" value="'+esc(x.title||'')+'" oninput="App.onTrackEditField(\'title\',this)" placeholder="Ad (şarkı / albüm / podcast)" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:var(--f-subhead);outline:none;">';
  inner+='<input type="text" value="'+esc(x.artist||'')+'" oninput="App.onTrackEditField(\'artist\',this)" placeholder="Sanatçı / yayıncı" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:var(--f-subhead);outline:none;">';
  inner+='<div style="display:flex;gap:6px;flex-wrap:wrap;">'; MUSIC_GENRES.forEach(function(g){ var on=x.genre===g; inner+='<button onclick="App.pickTrackGenre(\''+esc(g)+'\')" style="border:1px solid '+(on?'var(--listen)':'var(--card-bd)')+';cursor:pointer;padding:6px 10px;border-radius:999px;font-size:var(--f-caption1);font-weight:700;color:'+(on?'#fff':'var(--muted)')+';background:'+(on?'linear-gradient(135deg,#0E9AA7,#2BC4C4)':'var(--card)')+';">'+esc(g)+'</button>'; }); inner+='</div>';
  inner+='<button onclick="App.saveTrack()" style="border:none;cursor:pointer;width:100%;padding:13px;border-radius:13px;font-size:var(--f-subhead);font-weight:800;color:#fff;background:linear-gradient(135deg,#0E9AA7,#2BC4C4);">Kaydet</button>';
  if(!isNew) inner+='<button data-fx="destructive" onclick="App.deleteTrack(\''+esc(x.id)+'\')" style="border:1px solid var(--field-bd);cursor:pointer;width:100%;padding:11px;border-radius:13px;font-size:var(--f-footnote);font-weight:700;color:var(--drop-ink);background:var(--card);">Sil</button>';
  return compactModalShell('App.closeTrackEdit()','Favori düzenleme',inner);
}
function lyricAddModal(){
  var M=ensureMusic(); var dr=liveUi().lyricDraft||{itemId:'',text:''};
  var inner='<div style="display:flex;justify-content:space-between;align-items:center;"><div style="font-size:var(--f-body);font-weight:800;display:flex;align-items:center;gap:7px;">'+icon('quote',16)+' Söz ekle</div><button onclick="App.closeLyricAdd()" style="border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:32px;height:32px;border-radius:50%;color:var(--muted);display:flex;align-items:center;justify-content:center;">'+icon('x',15)+'</button></div>';
  inner+='<div style="font-size:var(--f-caption1);font-weight:700;color:var(--muted);">Parça</div><div style="display:flex;gap:6px;flex-wrap:wrap;">'; M.items.forEach(function(x){ var on=dr.itemId===x.id; inner+='<button onclick="App.pickLyricTrack(\''+esc(x.id)+'\')" style="border:1px solid '+(on?'var(--listen)':'var(--card-bd)')+';cursor:pointer;padding:7px 10px;border-radius:11px;font-size:var(--f-caption1);font-weight:700;color:'+(on?'#fff':'var(--muted)')+';background:'+(on?'linear-gradient(135deg,#0E9AA7,#2BC4C4)':'var(--card)')+';display:flex;align-items:center;gap:4px;">'+icon('music',12)+' '+esc(x.title.length>16?x.title.slice(0,15)+'…':x.title)+'</button>'; }); inner+='</div>';
  inner+='<textarea rows="4" oninput="App.onLyricField(\'text\',this)" placeholder="İçine işleyen o dize…" style="width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:var(--f-subhead);outline:none;resize:none;line-height:1.5;">'+esc(dr.text||'')+'</textarea>';
  inner+='<button onclick="App.saveLyric()" style="border:none;cursor:pointer;width:100%;padding:13px;border-radius:13px;font-size:var(--f-subhead);font-weight:800;color:#fff;background:linear-gradient(135deg,#0E9AA7,#2BC4C4 55%,#E9AFC1);display:flex;align-items:center;justify-content:center;gap:6px;">Kaydet '+icon('quote',15)+'</button>';
  return compactModalShell('App.closeLyricAdd()','Söz ekleme',inner);
}

function learningEntryCard(e,i){
  var when=e&&e.ts?wxHm(e.ts):'';
  var h='<div class="surface sey-stagger" style="--i:'+Math.min(i,8)+';border-radius:16px;padding:13px;display:flex;gap:11px;align-items:flex-start;border:1px solid color-mix(in srgb,var(--learn) 20%, var(--card-bd));">';
  h+='<span style="width:32px;height:32px;border-radius:10px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:var(--learn);background:var(--learn-bg);">'+icon('lightbulb',16)+'</span>';
  h+='<div style="flex:1;min-width:0;">';
  h+='<div style="font-size:var(--f-subhead);font-weight:700;color:var(--text);line-height:1.35;">'+esc(e.topic||'')+'</div>';
  if(e.source&&String(e.source).trim()) h+='<div style="font-size:var(--f-caption1);color:var(--learn);font-weight:600;margin-top:3px;display:flex;align-items:center;gap:4px;">'+icon('bookmark',11)+' '+esc(e.source)+'</div>';
  if(e.note&&String(e.note).trim()) h+='<div style="font-size:var(--f-footnote);color:var(--text2);line-height:1.45;margin-top:5px;">'+esc(e.note)+'</div>';
  if(when) h+='<div style="font-size:var(--f-caption2);color:var(--faint);margin-top:5px;">'+esc(when)+'</div>';
  h+='</div>';
  h+='<button data-fx="destructive" onclick="App.removeLearning(\''+esc(e.id)+'\')" aria-label="Sil" style="flex-shrink:0;border:none;cursor:pointer;width:28px;height:28px;border-radius:9px;background:rgba(220,120,120,0.1);color:#C0605F;font-size:var(--f-subhead);">\u00d7</button>';
  h+='</div>';
  return h;
}
function learningTodayView(){
  var d=liveUi().learningDraft||{topic:'',source:'',note:''};
  var day=getDay(liveData(),todayStr(),dayIndexFor(todayStr()));
  var entries=(day.learning&&Array.isArray(day.learning.entries))?day.learning.entries:[];
  var fld='width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:var(--f-subhead);outline:none;color:var(--text);box-sizing:border-box;';
  var h='';
  h+='<div class="surface" style="border-radius:20px;padding:15px;display:flex;flex-direction:column;gap:10px;border:1px solid color-mix(in srgb,var(--learn) 26%, var(--card-bd));box-shadow:0 10px 26px rgba(108,74,58,0.06);">';
  h+='<div style="font-size:var(--f-subhead);font-weight:800;color:var(--text);display:flex;align-items:center;gap:7px;"><span style="color:var(--learn);display:inline-flex;">'+icon('sparkles',16)+'</span>Bugün ne öğrendim?</div>';
  h+='<input id="learning-topic" value="'+esc(d.topic||'')+'" oninput="App.onLearningField(\'topic\',this)" placeholder="örn. Nefes tekniği kalbi yavaşlatıyor" maxlength="140" style="'+fld+'">';
  h+='<input value="'+esc(d.source||'')+'" oninput="App.onLearningField(\'source\',this)" placeholder="Kaynak: kitap, video, sohbet…" maxlength="120" style="'+fld+'">';
  h+='<textarea oninput="App.onLearningField(\'note\',this)" placeholder="Kısa bir not (isteğe bağlı)" rows="2" style="'+fld+'resize:none;line-height:1.5;">'+esc(d.note||'')+'</textarea>';
  h+='<button onclick="App.addLearning()" style="border:none;cursor:pointer;width:100%;padding:13px;border-radius:13px;font-size:var(--f-subhead);font-weight:800;color:#fff;background:linear-gradient(135deg,var(--learn),#C9B8FF);display:flex;align-items:center;justify-content:center;gap:6px;">Ekle '+icon('plus',15)+'</button>';
  h+='</div>';
  if(entries.length){
    h+='<div style="font-size:var(--f-footnote);font-weight:800;color:var(--muted);margin-top:2px;">Bugün · '+entries.length+' kayıt</div>';
    entries.slice().reverse().forEach(function(e,i){ h+=learningEntryCard(e,i); });
  } else {
    h+='<div style="text-align:center;color:var(--faint);font-size:var(--f-footnote);padding:20px 16px;line-height:1.5;"><span style="display:inline-flex;">'+icon('graduation-cap',26)+'</span><div style="margin-top:8px;">Henüz kayıt yok — bugün öğrendiğin ilk şeyi ekle.</div></div>';
  }
  return h;
}
function learningOverlayHTML(){
  var head='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;"><div><div style="font-size:var(--f-title3);font-weight:800;display:flex;align-items:center;gap:8px;">Ne öğrendim? '+icon('graduation-cap',19)+'</div><div style="font-size:var(--f-footnote);color:var(--faint);margin-top:3px;">Bugün öğrendiğin küçük ya da büyük her şey, tek yerde.</div></div><button data-fx="close" onclick="App.closeLearning()" style="border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:34px;height:34px;border-radius:50%;color:var(--muted);flex-shrink:0;display:flex;align-items:center;justify-content:center;">'+icon('x',16)+'</button></div>';
  return overlayShell('App.closeLearning()', head, learningTodayView(),null,false,'Öğrenme günlüğü');
}

function soulActivityTodayView(){
  var d=liveUi().soulActivityDraft||{type:'pilates',duration:'',note:''};
  var type=String(d.type||'pilates');
  var act=soulActivityById(type);
  var day=getDay(liveData(),todayStr(),dayIndexFor(todayStr()));
  var entries=(day&&Array.isArray(day.soulActivities))?day.soulActivities:[];
  var fld='width:100%;border:1px solid var(--field-bd);background:var(--field);border-radius:12px;padding:11px 12px;font-size:var(--f-subhead);outline:none;color:var(--text);box-sizing:border-box;';
  var h='';
  h+='<div class="surface" style="border-radius:20px;padding:15px;display:flex;flex-direction:column;gap:12px;border:1px solid color-mix(in srgb,var(--soul) 26%, var(--card-bd));box-shadow:0 10px 26px color-mix(in srgb,var(--soul-glow) 18%, transparent);">';
  h+='<div style="font-size:var(--f-subhead);font-weight:800;color:var(--text);display:flex;align-items:center;gap:7px;"><span style="color:var(--soul);display:inline-flex;">'+icon('sparkles',16)+'</span>Bugün neyle beslendim?</div>';
  h+='<div style="display:flex;gap:8px;">';
  soulCatalog().forEach(function(a){
    var on=a.id===type;
    h+='<button onclick="App.setSoulType(\''+a.id+'\')" style="flex:1;cursor:pointer;border-radius:14px;padding:11px 6px;display:flex;flex-direction:column;align-items:center;gap:5px;border:1px solid '+(on?'var(--soul)':'var(--field-bd)')+';background:'+(on?'color-mix(in srgb,var(--soul-bg) 60%, transparent)':'var(--field)')+';box-shadow:'+(on?'0 6px 16px color-mix(in srgb,var(--soul-glow) 45%, transparent)':'none')+';">';
    h+='<span style="width:32px;height:32px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;color:#fff;background:'+(on?'linear-gradient(135deg,var(--soul),var(--soul2))':'linear-gradient(135deg,var(--muted),var(--faint))')+';">'+icon(a.icon,16)+'</span>';
    h+='<span style="font-size:var(--f-caption2);font-weight:800;color:'+(on?'var(--soul)':'var(--muted)')+';">'+a.label+'</span>';
    h+='</button>';
  });
  h+='</div>';
  if(act){
    h+='<div style="border-radius:12px;padding:10px 12px;background:var(--soul-bg);border:1px solid color-mix(in srgb,var(--soul) 20%, var(--card-bd));">';
    h+='<div style="font-size:var(--f-caption1);font-weight:800;color:var(--soul);margin-bottom:3px;">'+icon('microscope',13)+' '+act.sci+'</div>';
    h+='<div style="font-size:var(--f-caption1);line-height:1.45;color:var(--text2);">'+act.blurb+'</div>';
    h+='</div>';
  }
  h+='<div style="display:flex;gap:10px;">';
  h+='<input id="soul-duration" type="number" inputmode="numeric" min="0" value="'+esc(d.duration||'')+'" oninput="App.onSoulField(\'duration\',this)" placeholder="Süre (dk)" maxlength="4" style="'+fld+'flex:1;">';
  h+='</div>';
  h+='<textarea oninput="App.onSoulField(\'note\',this)" placeholder="Kısa not: nerede, nasıl hissettin, ne fark ettin?" rows="2" maxlength="200" style="'+fld+'resize:none;line-height:1.5;">'+esc(d.note||'')+'</textarea>';
  h+='<button onclick="App.saveSoulActivity()" style="border:none;cursor:pointer;width:100%;padding:13px;border-radius:13px;font-size:var(--f-subhead);font-weight:800;color:#fff;background:linear-gradient(135deg,var(--soul),var(--soul2));display:flex;align-items:center;justify-content:center;gap:6px;">Kaydet '+icon('plus',15)+'</button>';
  h+='</div>';
  if(entries.length){
    h+='<div style="font-size:var(--f-footnote);font-weight:800;color:var(--muted);margin-top:2px;">Bugün · '+entries.length+' pratik</div>';
    entries.slice().reverse().forEach(function(a,i){ h+=soulActivityEntryCard(a,i); });
  } else {
    h+='<div style="text-align:center;color:var(--faint);font-size:var(--f-footnote);padding:20px 16px;line-height:1.5;"><span style="display:inline-flex;">'+icon('heart-handshake',26)+'</span><div style="margin-top:8px;">Bugün beden, nefes ve doğayla buluşan bir pratik ekle.</div></div>';
  }
  return h;
}
function soulActivityEntryCard(a,i){
  var act=soulActivityById(a.type);
  var dur=(a.duration!=null&&!isNaN(a.duration)&&a.duration>0)?fmtDuration(a.duration):'';
  var h='<div class="sey-stagger" style="--i:'+Math.min(i,8)+';display:flex;gap:10px;align-items:flex-start;border-radius:16px;padding:12px;background:var(--soul-bg);border:1px solid color-mix(in srgb,var(--soul) 22%, var(--card-bd));">';
  h+='<span style="width:34px;height:34px;border-radius:10px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;color:#fff;background:linear-gradient(135deg,var(--soul),var(--soul2));">'+icon(act?act.icon:'sparkles',17)+'</span>';
  h+='<div style="flex:1;min-width:0;">';
  h+='<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:var(--f-footnote);font-weight:800;color:var(--text);">'+(act?act.label:ucfirst(a.type))+'</span>'+(dur?'<span style="font-size:var(--f-caption2);font-weight:700;color:var(--soul);">'+dur+'</span>':'')+'</div>';
  if(a.note) h+='<div style="font-size:var(--f-caption1);line-height:1.45;color:var(--text2);margin-top:3px;">'+esc(a.note)+'</div>';
  h+='</div>';
  h+='<button data-fx="destructive" onclick="App.removeSoulActivity(\''+a.id+'\')" style="flex-shrink:0;border:none;background:transparent;cursor:pointer;color:var(--faint);display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;">'+icon('trash-2',15)+'</button>';
  h+='</div>';
  return h;
}
function soulPracticePickerHTML(){
  var head='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;"><div><div style="font-size:var(--f-title3);font-weight:800;display:flex;align-items:center;gap:8px;">Bugün hangi pratik? '+icon('heart-handshake',19)+'</div><div style="font-size:var(--f-footnote);color:var(--faint);margin-top:3px;">Pilates, ney veya binicilik — beden ve zihni birlikte besleyen ritim.</div></div><button data-fx="close" onclick="App.closeSoulPracticePicker()" style="border:none;background:rgba(150,110,120,0.15);cursor:pointer;width:34px;height:34px;border-radius:50%;color:var(--muted);flex-shrink:0;display:flex;align-items:center;justify-content:center;">'+icon('x',16)+'</button></div>';
  var body='';
  body+='<div style="display:flex;flex-direction:column;gap:10px;">';
  soulCatalog().forEach(function(a){
    body+='<button onclick="App.pickSoulPractice(\''+a.id+'\')" style="cursor:pointer;border-radius:18px;padding:14px;display:flex;align-items:center;gap:13px;border:1px solid var(--card-bd);background:var(--card);box-shadow:0 4px 12px rgba(108,74,58,0.06);text-align:left;">';
    body+='<span style="width:46px;height:46px;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;color:#fff;background:linear-gradient(135deg,var(--soul),var(--soul2));box-shadow:0 6px 14px color-mix(in srgb,var(--soul-glow) 60%, transparent);">'+icon(a.icon,22)+'</span>';
    body+='<div style="flex:1;min-width:0;"><div style="font-size:var(--f-callout);font-weight:800;color:var(--text);">'+a.label+'</div><div style="font-size:var(--f-caption1);color:var(--faint);margin-top:1px;line-height:1.35;">'+a.blurb+'</div></div>';
    body+='<span style="color:var(--soul);display:inline-flex;">'+icon('chevron-right',18)+'</span>';
    body+='</button>';
  });
  body+='</div>';
  return soulOverlayShell('App.closeSoulPracticePicker()', head, body,null,false,'Zihin ve beden pratiği seçimi');
}

function soulActivityOverlayHTML(){
  var head='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;"><div><div style="font-size:var(--f-title3);font-weight:800;display:flex;align-items:center;gap:8px;">Kurs & Pratik '+icon('heart-handshake',19)+'</div><div style="font-size:var(--f-footnote);color:var(--faint);margin-top:3px;">Pilates, ney, binicilik — beden ve zihni birlikte besleyen ritimler.</div></div><button data-fx="close" onclick="App.closeSoulActivity()" style="border:none;background:color-mix(in srgb,var(--soul) 16%, transparent);cursor:pointer;width:34px;height:34px;border-radius:50%;color:var(--muted);flex-shrink:0;display:flex;align-items:center;justify-content:center;">'+icon('x',16)+'</button></div>';
  return soulOverlayShell('App.closeSoulActivity()', head, soulActivityTodayView(),null,false,'Zihin ve beden pratiği');
}
function soulArchiveSessions(type){
  var list=[];
  if(!liveData().days||typeof liveData().days!=='object') return list;
  Object.keys(liveData().days).forEach(function(date){
    var rec=liveData().days[date]; if(!rec||!Array.isArray(rec.soulActivities)) return;
    rec.soulActivities.forEach(function(a){ if(a&&a.type===type) list.push({id:a.id,date:date,duration:a.duration,note:a.note,savedAt:a.savedAt}); });
  });
  list.sort(function(a,b){ var ta=a.savedAt||a.date||'', tb=b.savedAt||b.date||''; return (ta>tb?-1:(ta<tb?1:0)); });
  return list;
}
function soulArchiveOverlayHTML(){
  var filter=liveUi().soulArchiveFilter||null;
  var head='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;"><div><div style="font-size:var(--f-title3);font-weight:800;display:flex;align-items:center;gap:8px;">Zihin-Beden Arşivi '+icon('archive',19)+'</div><div style="font-size:var(--f-footnote);color:var(--faint);margin-top:3px;">Pilates, ney, binicilik ve ileride eklenecek her pratik burada birikir.</div></div><button onclick="App.closeSoulArchive()" style="border:none;background:color-mix(in srgb,var(--soul) 16%, transparent);cursor:pointer;width:34px;height:34px;border-radius:50%;color:var(--muted);flex-shrink:0;display:flex;align-items:center;justify-content:center;">'+icon('x',16)+'</button></div>';
  var body='';
  if(filter){
    var act=soulActivityById(filter);
    var sessions=soulArchiveSessions(filter);
    body+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">';
    body+='<button onclick="App.setSoulArchiveFilter(null)" style="border:none;background:var(--field);cursor:pointer;padding:7px 10px;border-radius:10px;color:var(--muted);font-size:var(--f-caption1);font-weight:700;display:inline-flex;align-items:center;gap:5px;">'+icon('arrow-left',14)+' Tümü</button>';
    body+='<span style="font-size:var(--f-subhead);font-weight:800;color:var(--text);display:inline-flex;align-items:center;gap:7px;"><span style="width:26px;height:26px;border-radius:7px;display:inline-flex;align-items:center;justify-content:center;color:#fff;background:linear-gradient(135deg,var(--soul),var(--soul2));">'+icon(act?act.icon:'sparkles',14)+'</span>'+(act?act.label:ucfirst(filter))+'</span>';
    body+='</div>';
    if(sessions.length){
      body+='<div style="font-size:var(--f-caption1);color:var(--faint);margin-bottom:8px;">'+sessions.length+' seans · toplam '+fmtDuration(sessions.reduce(function(t,s){ return t+Math.max(0,Number(s.duration)||0); },0))+'</div>';
      body+='<div style="display:flex;flex-direction:column;gap:8px;">';
      sessions.forEach(function(s){
        var dur=fmtDuration(s.duration);
        body+='<div style="display:flex;gap:10px;align-items:flex-start;border-radius:14px;padding:11px;background:var(--soul-bg);border:1px solid color-mix(in srgb,var(--soul) 18%, var(--card-bd));">';
        body+='<div style="flex:1;min-width:0;">';
        body+='<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;"><span style="font-size:var(--f-footnote);font-weight:800;color:var(--text);">'+esc(shortDate(s.date))+'</span>'+(dur?'<span style="font-size:var(--f-caption2);font-weight:700;color:var(--soul);">'+dur+'</span>':'')+'</div>';
        if(s.note) body+='<div style="font-size:var(--f-caption1);line-height:1.45;color:var(--text2);margin-top:3px;">'+esc(String(s.note))+'</div>';
        body+='</div>';
        body+='<button data-fx="destructive" onclick="App.removeSoulArchiveSession(\''+s.id+'\')" style="flex-shrink:0;border:none;background:transparent;cursor:pointer;color:var(--faint);display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;">'+icon('trash-2',14)+'</button>';
        body+='</div>';
      });
      body+='</div>';
    } else {
      body+='<div style="text-align:center;color:var(--faint);font-size:var(--f-footnote);padding:24px 16px;line-height:1.5;"><span style="display:inline-flex;">'+icon('wind',26)+'</span><div style="margin-top:8px;">Bu türde henüz kayıt yok. Bugün bir pratik ekle.</div></div>';
    }
  } else {
    var A=ensureSoulArchive();
    body+='<div style="display:flex;flex-direction:column;gap:10px;">';
    soulCatalog().forEach(function(a){
      var item=findSoulItem(a.id);
      var sessions=item?soulArchiveSessions(a.id):[];
      var totalMins=item?item.totalMinutes:0;
      var totalSessions=item?item.totalSessions:0;
      var last=item?item.lastAt:null;
      body+='<button onclick="App.setSoulArchiveFilter(\''+a.id+'\')" style="cursor:pointer;border-radius:18px;padding:14px;display:flex;align-items:center;gap:13px;border:1px solid var(--card-bd);background:var(--card);box-shadow:0 4px 12px rgba(108,74,58,0.06);text-align:left;width:100%;">';
      body+='<span style="width:48px;height:48px;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;color:#fff;background:linear-gradient(135deg,var(--soul),var(--soul2));box-shadow:0 6px 14px color-mix(in srgb,var(--soul-glow) 60%, transparent);flex-shrink:0;">'+icon(a.icon,22)+'</span>';
      body+='<div style="flex:1;min-width:0;">';
      body+='<div style="display:flex;align-items:baseline;justify-content:space-between;gap:8px;"><span style="font-size:var(--f-callout);font-weight:800;color:var(--text);">'+a.label+'</span>'+(totalSessions>0?'<span style="font-size:var(--f-caption2);font-weight:700;color:var(--soul);">'+totalSessions+' seans · '+fmtDuration(totalMins)+'</span>':'')+'</div>';
      body+='<div style="font-size:var(--f-caption1);color:var(--faint);margin-top:2px;line-height:1.35;">'+(last?'Son: '+shortDate(last.split('T')[0])+' · ':'')+a.sci+'</div>';
      body+='</div>';
      body+='<span style="color:var(--soul);display:inline-flex;flex-shrink:0;">'+icon('chevron-right',18)+'</span>';
      body+='</button>';
    });
    body+='</div>';
    body+='<div style="margin-top:12px;border-radius:12px;padding:11px 12px;background:var(--soul-bg);border:1px solid color-mix(in srgb,var(--soul) 18%, var(--card-bd));">';
    body+='<div style="font-size:var(--f-caption1);color:var(--text2);line-height:1.45;">'+icon('sparkles',13)+' Arşiv, her kaydettiğin pratiği otomatik toplar. Pilates, ney ve binicilik dışında yoga, keman, seramik gibi türler eklendiğinde bu ekran kendiliğinden büyür.</div>';
    body+='</div>';
  }
  return soulOverlayShell('App.closeSoulArchive()', head, body,null,false,'Zihin ve beden arşivi');
}

  var api={registerLibrary:registerLibrary,LIBRARY_DEPENDENCIES:LIBRARY_DEPENDENCIES,LIBRARY_MEMBERS:LIBRARY_MEMBERS,
    readingStats:readingStats,bookPct:bookPct,titlePct:titlePct,libStats:libStats,readTotals:readTotals,hasRead:hasRead,readStreak:readStreak,weekReading:weekReading,todayReadPages:todayReadPages,allQuotes:allQuotes,
    watchStats:watchStats,watchDayStats:watchDayStats,watchTotals:watchTotals,hasWatch:hasWatch,watchStreak:watchStreak,weekWatch:weekWatch,todayWatchMin:todayWatchMin,allReplicas:allReplicas,
    listenDayStats:listenDayStats,listenTotals:listenTotals,hasListen:hasListen,weekListen:weekListen,listenStreak:listenStreak,musicStats:musicStats,allLyrics:allLyrics,
    overlayShell:overlayShell,soulOverlayShell:soulOverlayShell,bookStatusChip:bookStatusChip,readingOverlayHTML:readingOverlayHTML,readingTodayView:readingTodayView,bookCard:bookCard,readingLibraryView:readingLibraryView,readingStatsView:readingStatsView,readingQuotesView:readingQuotesView,compactModalShell:compactModalShell,bookEditModal:bookEditModal,quoteAddModal:quoteAddModal,
    titleStatusChip:titleStatusChip,watchOverlayHTML:watchOverlayHTML,watchTodayView:watchTodayView,titleCard:titleCard,watchArchiveView:watchArchiveView,watchStatsView:watchStatsView,watchQuotesView:watchQuotesView,titleEditModal:titleEditModal,replicaAddModal:replicaAddModal,
    listenKindMeta:listenKindMeta,listeningOverlayHTML:listeningOverlayHTML,listeningTodayView:listeningTodayView,trackCard:trackCard,listeningFavsView:listeningFavsView,listeningStatsView:listeningStatsView,listeningLyricsView:listeningLyricsView,trackEditModal:trackEditModal,lyricAddModal:lyricAddModal,
    learningEntryCard:learningEntryCard,learningTodayView:learningTodayView,learningOverlayHTML:learningOverlayHTML,soulActivityTodayView:soulActivityTodayView,soulActivityEntryCard:soulActivityEntryCard,soulPracticePickerHTML:soulPracticePickerHTML,soulActivityOverlayHTML:soulActivityOverlayHTML,soulArchiveSessions:soulArchiveSessions,soulArchiveOverlayHTML:soulArchiveOverlayHTML};
  window.SeymaLibrary=api;
}());
