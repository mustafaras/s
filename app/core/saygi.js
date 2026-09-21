(function(){
  'use strict';

  // MON-23 · Saygı / Öncü / İman domain registry
  // ---------------------------------------------------------------------------
  // İçerik, görünüm ve saf kıble hesapları burada yaşar. Root data rebind'i,
  // App handlerları, modal focus kabuğu dışındaki DOM boyaması ve prayer
  // permission/GPS akışı app.js'te kalır. SaygiPeople ve HijriCalendarV1 her
  // çağrıda çözülür; modül yüklenirken içerik, storage, DOM, timer veya ağ
  // erişimi açılmaz.
  var SAYGI_EPOCH='2026-07-13', SAYGI_CACHE_PREFIX='seyma-saygi-v1:';
  var saygiDeps=null, saygiMemoryCache={}, saygiReadObserver=null;
  var SAYGI_DEPENDENCIES=['data','ui','getDay','todayStr','addDays','diffDays','dayIndexFor','dateLabelTR','icon','esc','featuresLive','render','quranJourneyHubCardHTML','zikrVisible','zikrPreviewCardHTML'];
  // IIP-10 (REQ-019): Türkçe arama normalizasyonu YALNIZ bu indekste uygulanır.
  // SaygiPeople içeriği, `data` şeması, geçiş (migration) ve sync sözleşmesi
  // değişmez; sorgu yalnız `ui` oturumluk durumunda tutulur, kalıcı depoya
  // yazılmaz. Kayıtlı bağımlılık sözleşmesi de büyümez — sorgu mevcut `ui`
  // kanalından okunur ve arama indeksi yalnız görünüm çağrı anında üretilir.
  var SAYGI_QUERY_MAX=80;
  var SAYGI_TURKISH_FOLD={'İ':'i','I':'i','ı':'i','i':'i','Ş':'s','ş':'s','Ğ':'g','ğ':'g','Ç':'c','ç':'c','Ö':'o','ö':'o','Ü':'u','ü':'u','Â':'a','â':'a','Î':'i','î':'i','Û':'u','û':'u'};

  function registerSaygi(deps){
    if(saygiDeps||!deps||typeof deps!=='object'||Array.isArray(deps)) return false;
    for(var i=0;i<SAYGI_DEPENDENCIES.length;i++) if(typeof deps[SAYGI_DEPENDENCIES[i]]!=='function') return false;
    saygiDeps=deps;
    return true;
  }
  function dep(name){ return saygiDeps&&typeof saygiDeps[name]==='function'?saygiDeps[name]:null; }
  function stateData(){
    var f=dep('data'); if(f){ try{ return f(); }catch(e){} }
    var st=window.SeymaState; return st?st.data:null;
  }
  function stateUi(){ var f=dep('ui'); if(f){ try{ return f(); }catch(e){} } return null; }
  function dateCall(name,args,fallback){
    var f=dep(name); if(f){ try{ return f.apply(null,args); }catch(e){} }
    var du=window.SeymaDateUtils; if(du&&typeof du[name]==='function') return du[name].apply(du,args);
    return fallback.apply(null,args);
  }
  function todayStr(){ return dateCall('todayStr',[],function(){ var d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }); }
  function addDays(s,n){ return dateCall('addDays',[s,n],function(){ var p=String(s).split('-').map(Number),d=new Date(p[0],p[1]-1,p[2]); d.setDate(d.getDate()+n); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }); }
  function diffDays(a,b){ return dateCall('diffDays',[a,b],function(){ var aa=new Date(String(a)+'T12:00:00'),bb=new Date(String(b)+'T12:00:00'); return Math.round((bb-aa)/86400000); }); }
  function dayIndexFor(date){ return dateCall('dayIndexFor',[date],function(){ return 1; }); }
  function dateLabelTR(date){ return dateCall('dateLabelTR',[date],function(){ return String(date||''); }); }
  function iconHtml(){ var f=dep('icon'); return f?f.apply(null,arguments):''; }
  function escHtml(){ var f=dep('esc'); return f?f.apply(null,arguments):String(arguments[0]==null?'':arguments[0]); }
  function featureLive(){ var f=dep('featuresLive'); return f?!!f():true; }
  function renderCall(){ var f=dep('render'); return f?f.apply(null,arguments):undefined; }
  function quranHub(){ var f=dep('quranJourneyHubCardHTML'); return f?f.apply(null,arguments):''; }
  function zikrVisible(){ var f=dep('zikrVisible'); return f?!!f():true; }
  function zikrPreview(){ var f=dep('zikrPreviewCardHTML'); return f?f.apply(null,arguments):''; }
  function getDayCall(d,date,idx){ var f=dep('getDay'); return f?f(d,date,idx):null; }
  function prayerCall(name,args){
    var p=window.SeymaPrayer, f=dep('prayer:'+name);
    if(f) return f.apply(null,args||[]);
    return p&&typeof p[name]==='function'?p[name].apply(p,args||[]):null;
  }
  function prayerValue(name,fallback){ var p=window.SeymaPrayer; return p&&p[name]!=null?p[name]:fallback; }
  function storageObj(){ var f=dep('storage'); if(f){ try{return f();}catch(e){} } try{return typeof localStorage==='undefined'?null:localStorage;}catch(e){return null;} }
  function fetchFn(){ var f=dep('fetch'); if(f){ try{return f();}catch(e){} } return typeof fetch==='function'?fetch:null; }

  function emptySaygiRoot(){ return {collection:{},streak:0,lastReadDate:''}; }
  function ensureSaygiRoot(){
    var d=stateData(); if(!d) return emptySaygiRoot();
    if(!d.saygi||typeof d.saygi!=='object') d.saygi=emptySaygiRoot();
    if(!d.saygi.collection||typeof d.saygi.collection!=='object') d.saygi.collection={};
    if(typeof d.saygi.streak!=='number'||isNaN(d.saygi.streak)) d.saygi.streak=0;
    if(typeof d.saygi.lastReadDate!=='string') d.saygi.lastReadDate='';
    return d.saygi;
  }
  function emptySaygi(){ return {personId:null,readAt:null,readingEntryId:null}; }
  function ensureSaygiDay(day){
    if(!day||typeof day!=='object') return emptySaygi();
    if(!day.saygi||typeof day.saygi!=='object') day.saygi=emptySaygi();
    if(typeof day.saygi.personId!=='string'&&day.saygi.personId!==null) day.saygi.personId=null;
    if(typeof day.saygi.readAt!=='string'&&day.saygi.readAt!==null) day.saygi.readAt=null;
    if(typeof day.saygi.readingEntryId!=='string'&&day.saygi.readingEntryId!==null) day.saygi.readingEntryId=null;
    return day.saygi;
  }
  function saygiMarkRead(person){
    if(!person) return;
    var root=ensureSaygiRoot(), date=todayStr(), d=stateData(), previousReadDate=root.lastReadDate;
    if(!root.collection[person.id]) root.collection[person.id]={name:person.name||person.id,field:person.field||'',readAt:new Date().toISOString(),favorite:false};
    else root.collection[person.id].readAt=new Date().toISOString();
    var yester=addDays(date,-1), yesterdayRead=false, yDay=d&&d.days&&d.days[yester];
    if(yDay&&yDay.saygi&&yDay.saygi.readAt){ var y=String(yDay.saygi.readAt).slice(0,10); yesterdayRead=(y===yester); }
    root.streak=previousReadDate===date?Math.max(1,root.streak):(yesterdayRead||previousReadDate===yester?root.streak+1:1);
    root.lastReadDate=date;
  }
  function saygiCollection(){ return ensureSaygiRoot().collection; }
  function saygiReadCount(){ return Object.keys(saygiCollection()).length; }
  function saygiStreak(){ return ensureSaygiRoot().streak; }
  function saygiPeople(){ return (window.SaygiPeople&&Array.isArray(window.SaygiPeople))?window.SaygiPeople:[]; }
  function saygiPositiveMod(n,m){ return ((n%m)+m)%m; }
  function saygiPersonForDate(date){ var people=saygiPeople(); if(!people.length) return null; return people[saygiPositiveMod(diffDays(SAYGI_EPOCH,date||todayStr()),people.length)]; }
  function saygiCurrentPerson(){ return saygiPersonForDate(todayStr()); }
  function saygiPersonById(id){ var people=saygiPeople(); for(var i=0;i<people.length;i++) if(people[i].id===id) return people[i]; return null; }
  function saygiModalPerson(){ var u=stateUi()||{}; return (u.saygiPersonOpen&&u.saygiBrowseId?saygiPersonById(u.saygiBrowseId):null)||saygiCurrentPerson(); }
  function saygiDayKey(person,date){ return String(date||todayStr())+'|'+String(person&&person.id||''); }
  function saygiCacheKey(lang,canonical,revision){ return SAYGI_CACHE_PREFIX+String(lang||'tr')+':'+encodeURIComponent(String(canonical||''))+':'+String(revision||'current'); }
  function saygiReadCache(key){
    if(saygiMemoryCache[key]) return saygiMemoryCache[key];
    try{ var s=storageObj(),raw=s&&s.getItem?s.getItem(key):null,val=raw?JSON.parse(raw):null; if(val&&Array.isArray(val.blocks)){ saygiMemoryCache[key]=val; return val; } }catch(e){}
    return null;
  }
  function saygiWriteCache(key,val){ try{ saygiMemoryCache[key]=val; var s=storageObj(); if(s&&s.setItem) s.setItem(key,JSON.stringify(val)); }catch(e){} }
  function saygiSafeUrl(url,hosts){
    try{
      var URLCtor=window.URL||URL,u=new URLCtor(String(url||'')); if(u.protocol!=='https:') return '';
      if(hosts&&hosts.length){ var ok=false; for(var i=0;i<hosts.length;i++) if(u.hostname===hosts[i]||u.hostname.slice(-(hosts[i].length+1))==='.'+hosts[i]){ok=true;break;} if(!ok)return ''; }
      return u.href;
    }catch(e){ return ''; }
  }
  function saygiFetchJSON(url,timeout){
    var fetcher=fetchFn(); if(typeof fetcher!=='function') return Promise.reject(new Error('Tarayıcı ağ isteğini desteklemiyor'));
    var ctrl=(typeof window.AbortController==='function')?new window.AbortController():null,timer=null;
    if(ctrl&&typeof window.setTimeout==='function') timer=window.setTimeout(function(){try{ctrl.abort();}catch(e){}},timeout||18000);
    var opts={headers:{'Accept':'application/json'},credentials:'omit'}; if(ctrl) opts.signal=ctrl.signal;
    function clear(){ if(timer&&typeof window.clearTimeout==='function') window.clearTimeout(timer); }
    return fetcher(url,opts).then(function(res){clear();if(!res.ok){var e=new Error('Wikipedia yanıtı '+res.status);e.status=res.status;return Promise.reject(e);}return res.json();},function(err){clear();return Promise.reject(err);});
  }
  function saygiSummaryUrl(lang,title){ return 'https://'+lang+'.wikipedia.org/api/rest_v1/page/summary/'+encodeURIComponent(String(title||'').replace(/ /g,'_')); }
  function saygiHtmlUrl(lang,title){ return 'https://'+lang+'.wikipedia.org/w/rest.php/v1/page/'+encodeURIComponent(String(title||'').replace(/ /g,'_'))+'/with_html'; }
  function saygiFetchSummary(lang,title){ return saygiFetchJSON(saygiSummaryUrl(lang,title)).then(function(j){if(!j||j.type==='disambiguation'||j.type==='no-extract'||!j.title)return Promise.reject(new Error('Uygun Wikipedia maddesi bulunamadı'));j._saygiLang=lang;j._saygiRequestedTitle=title;return j;}); }
  function saygiLoadSummary(person){ return saygiFetchSummary('tr',person.trTitle||person.name).catch(function(){return saygiFetchSummary('en',person.enTitle||person.name);}); }
  function saygiPlainText(value){ return String(value==null?'':value).replace(/\[[^\]]{1,80}\]/g,' ').replace(/\s+/g,' ').trim(); }
  function saygiStopHeading(text){ return /^(kaynakça|kaynaklar|notlar|dipnotlar|dış bağlantılar|ayrıca bakınız|bibliyografya|referanslar|further reading|references|external links|notes)$/i.test(saygiPlainText(text)); }
  function saygiBioBlocks(html){
    var Parser=window.DOMParser; if(!html||typeof Parser!=='function') return [];
    var doc,root; try{doc=new Parser().parseFromString(String(html),'text/html');root=doc.querySelector('.mw-parser-output')||doc.body;}catch(e){return [];} if(!root)return [];
    var remove=root.querySelectorAll('script,style,table,figure,figcaption,aside,nav,sup,.reference,.reflist,.mw-editsection,.infobox,.navbox,.vertical-navbox,.metadata,.noprint,.hatnote,.thumb,.toc,.mw-empty-elt'); for(var r=0;r<remove.length;r++)remove[r].remove();
    var nodes=root.querySelectorAll('h2,h3,p,ul,ol'),out=[],chars=0,headings=0;
    for(var i=0;i<nodes.length;i++){
      var node=nodes[i],tag=String(node.tagName||'').toLowerCase(),text='';
      if(tag==='ul'||tag==='ol'){var lis;try{lis=node.querySelectorAll(':scope > li');}catch(e){lis=node.children||[];}if(!lis.length)lis=node.querySelectorAll('li');var items=[];for(var li=0;li<lis.length&&items.length<5;li++){var item=saygiPlainText(lis[li].textContent);if(item.length>16)items.push(item);}text=items.join(' · ');}else text=saygiPlainText(node.textContent);
      if(!text)continue; if(tag==='h2'||tag==='h3'){if(saygiStopHeading(text))break;if(text.length<3||headings>=5)continue;headings++;out.push({type:'h',text:text});continue;}
      if(text.length<(tag==='p'?70:38))continue; if(chars+text.length>8200)text=text.slice(0,Math.max(0,8200-chars)).replace(/\s+\S*$/,'')+'…'; if(text.length<24)break; out.push({type:tag==='p'?'p':'list',text:text}); chars+=text.length; if(out.length>=15||chars>=8200)break;
    }
    return out;
  }
  function saygiExternalLinks(lang,title){
    var Params=window.URLSearchParams||URLSearchParams,p=new Params({action:'query',format:'json',formatversion:'2',origin:'*',prop:'extlinks',ellimit:'8',titles:String(title||'')});
    return saygiFetchJSON('https://'+lang+'.wikipedia.org/w/api.php?'+p.toString(),14000).then(function(j){var pages=j&&j.query&&j.query.pages,page=Array.isArray(pages)?pages[0]:null,list=page&&Array.isArray(page.extlinks)?page.extlinks:[],seen={},out=[];for(var i=0;i<list.length&&out.length<3;i++){var raw=list[i]&&(list[i]['*']||list[i].url||list[i]),safe=saygiSafeUrl(raw);if(!safe||seen[safe])continue;try{var URLCtor=window.URL||URL,host=new URLCtor(safe).hostname.replace(/^www\./,'');if(/(?:wikipedia|wikimedia)\.org$/i.test(host))continue;seen[safe]=true;out.push({url:safe,host:host});}catch(e){}}return out;}).catch(function(){return [];});
  }
  function saygiArticleFrom(person,summary,full,links){
    var lang=summary._saygiLang||'tr',canonical=(summary.titles&&summary.titles.canonical)||summary.title||summary._saygiRequestedTitle||person.name,blocks=saygiBioBlocks(full&&full.html); if(!blocks.length&&summary.extract)blocks=[{type:'p',text:saygiPlainText(summary.extract)}];
    var thumbnail=saygiSafeUrl(summary.thumbnail&&summary.thumbnail.source,['upload.wikimedia.org']),source=saygiSafeUrl(summary.content_urls&&summary.content_urls.desktop&&summary.content_urls.desktop.page,[lang+'.wikipedia.org'])||('https://'+lang+'.wikipedia.org/wiki/'+encodeURIComponent(canonical)),license=(full&&full.license)||{},licenseUrl=saygiSafeUrl(license.url)||'https://creativecommons.org/licenses/by-sa/4.0/deed.tr';
    return {personId:person.id,dailyKey:saygiDayKey(person),lang:lang,title:String(summary.title||person.name),canonical:String(canonical),description:saygiPlainText(summary.description||person.field||''),lead:saygiPlainText(summary.extract||''),blocks:blocks,thumbnail:thumbnail,sourceUrl:source,licenseTitle:String(license.title||'Creative Commons Attribution-Share Alike 4.0'),licenseUrl:licenseUrl,revision:(full&&full.latest&&full.latest.id)||summary.revision||null,links:links||[],fetchedAt:new Date().toISOString()};
  }
  function saygiArticleReadableFor(person,article,date){ if(!person||!article||typeof article!=='object'||article.personId!==person.id||article.dailyKey!==saygiDayKey(person,date||todayStr()))return false;if(!Array.isArray(article.blocks)||!article.blocks.length)return false;return article.blocks.some(function(block){return block&&typeof block.text==='string'&&block.text.trim().length>=24;}); }
  function saygiRequestIsCurrent(person,dailyKey,requestId){ var u=stateUi()||{};if(requestId!==u.saygiRequestId||dailyKey!==saygiDayKey(person))return false;return !u.saygiPersonOpen||String(u.saygiBrowseId||'')===String(person.id); }
  function saygiLoadArticle(person,force){
    if(!person)return; var u=stateUi(); if(!u)return; var dailyKey=saygiDayKey(person),requestId=(u.saygiRequestId||0)+1; u.saygiRequestId=requestId;u.saygiLoading=true;u.saygiError=null;u.saygiReadReady=false;if(force||!u.saygiArticle||u.saygiArticle.personId!==person.id)u.saygiArticle=null;
    saygiLoadSummary(person).then(function(summary){var canonical=(summary.titles&&summary.titles.canonical)||summary.title||person.name,lang=summary._saygiLang||'tr',cacheKey=saygiCacheKey(lang,canonical,summary.revision||'current'),cached=!force?saygiReadCache(cacheKey):null;if(cached&&saygiArticleReadableFor(person,cached))return cached;return saygiFetchJSON(saygiHtmlUrl(lang,canonical),20000).catch(function(){return null;}).then(function(full){return saygiExternalLinks(lang,canonical).then(function(links){var article=saygiArticleFrom(person,summary,full,links);if(!saygiArticleReadableFor(person,article))throw new Error('Wikipedia maddesi okunabilir içerik taşımıyor');saygiWriteCache(cacheKey,article);return article;});});}).then(function(article){if(!saygiRequestIsCurrent(person,dailyKey,requestId))return;u.saygiArticle=article;u.saygiLoading=false;u.saygiError=null;if(u.tab==='saygi')renderCall();}).catch(function(){if(!saygiRequestIsCurrent(person,dailyKey,requestId))return;u.saygiLoading=false;u.saygiError='Biyografi şu an yüklenemedi. Bağlantını kontrol edip yeniden deneyebilirsin.';if(u.tab==='saygi')renderCall();});
  }
  function saygiEnsureArticle(person){ var u=stateUi();if(!u)return;var key=saygiDayKey(person);if(u.saygiKey!==key){u.saygiKey=key;u.saygiArticle=null;u.saygiLoading=false;u.saygiError=null;u.saygiReadReady=false;}if(!u.saygiArticle&&!u.saygiLoading)saygiLoadArticle(person,false); }
  function saygiReadMinutes(article){ var text=(article&&article.blocks||[]).map(function(b){return b.text;}).join(' ');return Math.max(4,Math.min(18,Math.round(text.length/850)||4)); }
  function saygiReadingEntry(day,person){ var entries=day&&day.reading&&Array.isArray(day.reading.entries)?day.reading.entries:[];for(var i=0;i<entries.length;i++){var e=entries[i];if(e&&e.source==='saygi'&&e.personId===person.id&&e.saygiDate===todayStr())return e;}return null; }
  function saygiHasRead(person){ var d=stateData(),day=d&&d.days&&d.days[todayStr()];if(!day||!person)return false;var entry=saygiReadingEntry(day,person);if(!entry)return false;var st=ensureSaygiDay(day);if(st.readingEntryId!==entry.id){st.personId=person.id;st.readingEntryId=entry.id;st.readAt=entry.ts||st.readAt||new Date().toISOString();}return true; }
  function saygiDomainTone(host){ var colors=['#735F37','#4B6670','#76536A','#526753','#6B5B86','#8B6047'],n=0,s=String(host||'');for(var i=0;i<s.length;i++)n=(n*31+s.charCodeAt(i))>>>0;return colors[n%colors.length]; }

  // ── IIP-10 · Öncü arama ve filtre (REQ-019 / REQ-020) ──
  // Arama ve filtre YALNIZ okuma yolundadır: indeks görünüm çağrı anında üretilir,
  // hiçbir yazma yolundan (save/migrate/sync) tetiklenmez ve kalıcı veri taşımaz.
  function saygiFold(str){
    var s=String(str==null?'':str), out='';
    for(var i=0;i<s.length;i++){ var ch=s.charAt(i); out+=SAYGI_TURKISH_FOLD[ch]!=null?SAYGI_TURKISH_FOLD[ch]:ch; }
    return out.toLowerCase();
  }
  // Türkçe i/İ/ı/I ayrımı sayfa klavyesinde yazılamaz: "ibn" da "İbn"i bulmalı.
  function saygiNormalize(text){ return saygiFold(text).replace(/\s+/g,' ').replace(/^ +| +$/g,''); }
  // "Matematik · Bilgisayar bilimi" tek alan gibi değil, iki bağımsız etiket gibi
  // aranır; aksi hâlde "matematik bilgisayar" birleşik sorgusu eşleşmez.
  function saygiFieldTokens(field){
    return saygiNormalize(field).split(' · ').filter(function(part){ return !!part; }).map(function(part,idx){ return {token:part,index:idx}; });
  }
  // İki harften kısa sorgu tüm listeyi döndürüp gürültü yapar; yine de "hepsi"
  // görünümü korunur — sessizce sıfır sonuç gösterilmez.
  function saygiQueryTooShort(q){ return saygiNormalize(q).length<2; }

  // İndeks kişi başına bir kez üretilir ve kimliğe bağlanır; arama sırasında
  // yeniden normalizasyon yapılmaz (yüz kişide her tuşta tekrar maliyeti yok).
  var saygiIndexCache=[], saygiIndexStamp='';
  function saygiIndex(){
    var people=saygiPeople(), stamp=String(people.length)+':'+String((people[0]&&people[0].id)||'')+':'+String((people[people.length-1]&&people[people.length-1].id)||'');
    if(saygiIndexStamp===stamp&&saygiIndexCache.length===people.length) return saygiIndexCache;
    saygiIndexCache=people.map(function(person){
      return {person:person,name:saygiNormalize(person.name),field:saygiNormalize(person.field),kind:saygiNormalize(person.kind),era:saygiNormalize(person.era),tokens:saygiFieldTokens(person.field).map(function(part){return part.token;})};
    });
    saygiIndexStamp=stamp;
    return saygiIndexCache;
  }
  // Sorgu mevcut `ui` kanalından okunur (saygiPersonOpen/saygiBrowseId gibi):
  // yeni bir bag üyesi eklenmez, böylece kayıtlı bağımlılık sözleşmesi büyümez.
  function saygiUiQuery(){ var u=stateUi(); return (u&&u.saygiQuery!=null)?String(u.saygiQuery):''; }
  function saygiQuery(){ return saygiNormalize(saygiUiQuery()).slice(0,SAYGI_QUERY_MAX); }
  // "all" dışındaki her değer bilinmeyen girdiyi sessizce "Tümü"ye indirir.
  function saygiFilter(raw){
    var f=String(raw==null?'':raw), u=stateUi()||{}, source=f||String(u.saygiKindFilter||'all');
    if(source!=='Bilim'&&source!=='Sanat') return 'all';
    return source;
  }
  function saygiReadFilter(raw){
    var f=String(raw==null?'':raw), u=stateUi()||{}, source=f||String(u.saygiReadFilter||'all');
    if(source!=='read'&&source!=='unread') return 'all';
    return source;
  }
  function saygiFilterSummary(){ var parts=[]; if(saygiFilter()!=='all')parts.push(saygiFilter()); if(saygiReadFilter()==='read')parts.push('Okunanlar'); if(saygiReadFilter()==='unread')parts.push('Okunmayanlar'); return parts.join(' · '); }
  // Çok kelimeli sorgu ("matematik bilgisayar") alan etiketinin TAMAMINI tek
  // parça gibi aramaz; her kelime kendi başına herhangi bir alanda bulunmalıdır.
  function saygiRowMatches(row,terms){
    for(var i=0;i<terms.length;i++){
      var term=terms[i], hit=row.name.indexOf(term)>-1||row.field.indexOf(term)>-1||row.kind.indexOf(term)>-1||row.era.indexOf(term)>-1;
      if(!hit){ for(var t=0;t<row.tokens.length;t++) if(row.tokens[t].indexOf(term)>-1){ hit=true; break; } }
      if(!hit) return false;
    }
    return true;
  }
  function saygiLens(){
    var raw=saygiNormalize(saygiUiQuery()).slice(0,SAYGI_QUERY_MAX), q=raw,
        tooShort=(q.length>0&&saygiQueryTooShort(q)), kind=saygiFilter(), read=saygiReadFilter(), coll=saygiCollection(), index=saygiIndex(), active=0,
        terms=(!tooShort&&q)?q.split(' '):null;
    if(kind!=='all')active++; if(read!=='all')active++;
    var rows=index.filter(function(row){
      if(kind!=='all'&&row.kind!==saygiNormalize(kind)) return false;
      if(read==='read'&&!coll[row.person.id]) return false;
      if(read==='unread'&&coll[row.person.id]) return false;
      if(terms) return saygiRowMatches(row,terms);
      return true;
    }).map(function(row){ return row.person; });
    return {query:raw,kind:kind,read:read,tooShort:tooShort,activeCount:active,hasLens:!!q||active>0,total:index.length,readCount:saygiReadCount(),results:rows};
  }
  function saygiPersonRowHTML(person,done,todayId){
    var isToday=person&&person.id===todayId;
    var media=person&&person.name?'<span class="sg-p-search-monogram" aria-hidden="true">'+escHtml(person.name.charAt(0))+'</span>':'';
    return '<li class="sg-p-search-row"><button id="saygi-person-'+escHtml(person&&person.id||'')+'" class="sg-p-search-person'+(isToday?' todayd':'')+(done?' read':'')+'" onclick="App.openSaygiCollectionPerson(\''+escHtml(person.id)+'\')" aria-label="'+escHtml(person.name+(done?' · okundu':' · okunmadı')+' · biyografiyi aç')+'">'+media+'<span class="sg-p-search-copy"><span class="sg-p-search-name">'+escHtml(person.name)+'</span><span class="sg-p-search-field">'+escHtml(person.field)+'</span><span class="sg-p-search-desc">'+escHtml(person.kind)+' · '+escHtml(person.era)+'</span></span>'+'<span class="sg-p-search-state">'+(done?'<span class="read">'+iconHtml('circle-check',14)+' Okundu</span>':'<span class="unread">Okunmadı</span>')+'</span>'+'</button></li>';
  }
  function saygiPersonListHTML(lens,todayId){
    var coll=saygiCollection(), rows=lens.results.map(function(person){ return saygiPersonRowHTML(person,!!coll[person.id],todayId); }).join('');
    return '<ul id="saygi-person-list" class="sg-p-search-list" aria-label="Öncü sonuçları">'+(rows||'')+'</ul>';
  }
  function saygiResultCountText(lens){
    var shown=lens.results.length;
    if(!lens.total) return 'Koleksiyon hazırlanıyor';
    if(lens.tooShort) return shown+' öncü · aramak için iki harf yeter';
    if(!lens.hasLens) return shown+' öncü · hepsi listede';
    if(!shown) return 'Aramaya uyan öncü yok';
    return shown+' sonuç / '+lens.total+' öncü';
  }
  function saygiResultCountHTML(lens){
    return '<p id="saygi-result-count" class="sg-p-search-count" role="status" data-tone="'+(lens.results.length?'ok':'empty')+'">'+escHtml(saygiResultCountText(lens))+'</p>';
  }
  function saygiSearchControlsHTML(lens){
    var q=lens.query;
    return '<div class="sg-p-search-head">'+
      '<div class="sg-p-search-field"><label class="sg-p-search-label" for="saygi-search-input">'+iconHtml('search',14)+' Öncü ara</label><span class="sg-p-search-input-wrap"><input id="saygi-search-input" class="sg-p-search-input" type="search" inputmode="search" autocomplete="off" enterkeyhint="search" placeholder="İsim ya da alan yaz" aria-describedby="saygi-search-help" value="'+escHtml(saygiUiQuery())+'" oninput="App.saygiLens(\'query\',this.value)" onkeydown="App.saygiLens(\'key\',event)"><button id="saygi-search-clear" class="sg-p-search-clear" type="button" aria-label="Aramayı temizle" '+(q?'':'hidden')+' onclick="App.saygiLens(\'clear\')">'+iconHtml('x',14)+'</button></span></div>'+
      '<p id="saygi-search-help" class="sg-p-search-help">İsim, alan ya da çağa göre ara. “İ/I” ayrımı gözetilmez.</p>'+
      '<div class="sg-p-search-chips" role="group" aria-label="Öncü filtreleri">'+
        '<span class="sg-p-search-chips-label">Alan</span>'+
        '<button type="button" id="saygi-chip-kind-all" class="sg-p-chip'+(lens.kind==='all'?' on':'')+'" aria-pressed="'+(lens.kind==='all'?'true':'false')+'" onclick="App.saygiLens(\'kind\',\'all\')">Tümü</button>'+
        '<button type="button" id="saygi-chip-kind-Bilim" class="sg-p-chip'+(lens.kind==='Bilim'?' on':'')+'" aria-pressed="'+(lens.kind==='Bilim'?'true':'false')+'" onclick="App.saygiLens(\'kind\',\'Bilim\')">'+iconHtml('microscope',12)+' Bilim</button>'+
        '<button type="button" id="saygi-chip-kind-Sanat" class="sg-p-chip'+(lens.kind==='Sanat'?' on':'')+'" aria-pressed="'+(lens.kind==='Sanat'?'true':'false')+'" onclick="App.saygiLens(\'kind\',\'Sanat\')">'+iconHtml('feather',12)+' Sanat</button>'+
        '<span class="sg-p-search-chips-label">Okuma</span>'+
        '<button type="button" id="saygi-chip-read-all" class="sg-p-chip'+(lens.read==='all'?' on':'')+'" aria-pressed="'+(lens.read==='all'?'true':'false')+'" onclick="App.saygiLens(\'read\',\'all\')">Tümü</button>'+
        '<button type="button" id="saygi-chip-read-read" class="sg-p-chip'+(lens.read==='read'?' on':'')+'" aria-pressed="'+(lens.read==='read'?'true':'false')+'" onclick="App.saygiLens(\'read\',\'read\')">'+iconHtml('circle-check',12)+' Okunanlar</button>'+
        '<button type="button" id="saygi-chip-read-unread" class="sg-p-chip'+(lens.read==='unread'?' on':'')+'" aria-pressed="'+(lens.read==='unread'?'true':'false')+'" onclick="App.saygiLens(\'read\',\'unread\')">Okunmayanlar</button>'+
      '</div>'+
      '<div class="sg-p-search-summary">'+saygiResultCountHTML(lens)+'<button type="button" id="saygi-search-reset" class="sg-p-search-reset" '+(lens.hasLens?'':'hidden')+' onclick="App.saygiLens(\'reset\')">'+iconHtml('x',13)+' Tüm filtreleri temizle</button></div>'+
    '</div>';
  }
  function saygiSearchEmptyHTML(lens){
    if(!lens.total) return '<div class="sg-p-search-empty" role="status"><span>'+iconHtml('trophy',22)+'</span><div><strong>Koleksiyon henüz hazırlanıyor</strong><small>100 öncü listesi yüklendiğinde arama burada çalışacak.</small></div></div>';
    if(lens.tooShort&&!lens.query) return '<div class="sg-p-search-empty is-hint" role="status"><span>'+iconHtml('search',20)+'</span><div><strong>Aramaya başla</strong><small>İki harf yeter: “ibn”, “fizik”, “ressam” gibi.</small></div></div>';
    var summary=saygiFilterSummary(), why=(lens.query?'“'+escHtml(lens.query)+'”':'')+(lens.query&&summary?' ve ':'')+(summary?escHtml(summary):'');
    return '<div id="saygi-search-empty" class="sg-p-search-empty" role="status"><span>'+iconHtml('search',20)+'</span><div><strong id="saygi-search-empty-title">Sonuç yok</strong><small>'+(why||'Seçili filtre')+' için öncü bulunamadı. Aramayı genişletmeyi dene.</small></div><button type="button" class="sg-p-search-reset" onclick="App.saygiLens(\'reset\')">'+iconHtml('x',13)+' Tüm filtreleri temizle</button></div>';
  }
  function saygiFilteredResultsHTML(lens,todayId){
    if(!lens.total||!lens.results.length) return saygiSearchEmptyHTML(lens);
    return saygiPersonListHTML(lens,todayId)+saygiPersonListFooterHTML(lens);
  }
  // Alt satır: “Okundu” işaretleri yalnız gerçekten okunmuş kişilerde; aksi hâlde
  // sonuç listesi kendi kendini yanlış beyan eder.
  function saygiPersonListFooterHTML(lens){
    return '<p class="sg-p-search-foot">'+escHtml(lens.results.length)+' öncü gösteriliyor · '+escHtml(String(lens.readCount))+'/'+escHtml(String(lens.total))+' okundu'+(lens.hasLens?' · filtre açık':'')+'</p>';
  }

  // ── IIP-11 · Okuyucu etkileşimleri (REQ-021 / REQ-022) ──
  // Yazı büyütme, bölüm atlama ve okuma konumu YALNIZ `ui` oturumluk kanalında
  // yaşar: hiçbiri `data`'ya, kalıcı depoya, sync'e veya geçişe (migration)
  // yazılmaz. Bu, metin ölçeğinin "oturumluk" olması kuralını kodda sabitler.
  var SAYGI_SCALE_STEPS=[100,112,125,140,160];
  function saygiScaleIndex(){ var u=stateUi()||{}, n=Number(u.saygiScaleIndex); return (isFinite(n)&&n>=0&&n<SAYGI_SCALE_STEPS.length)?Math.floor(n):0; }
  function saygiScalePercent(){ return SAYGI_SCALE_STEPS[saygiScaleIndex()]; }
  function saygiScaleLabel(){ return saygiScalePercent()+'%'; }
  function saygiScaleIsDefault(){ return saygiScaleIndex()===0; }
  function saygiAnchorId(person,index){ return 'saygi-blok-'+String(person&&person.id||'kisi')+'-'+String(index); }
  // Görünür bir paragraf/başlık ankrajı hesaplanır; Aa değişiminden sonra bu
  // ankraj korunur (spec: "Aa değişiminde ilk görünür paragraf anchor olarak korunur").
  function saygiBlockAnchors(article){
    var blocks=(article&&article.blocks)||[];
    return blocks.filter(function(b){ return b&&typeof b.text==='string'&&b.text; });
  }
  function saygiSections(article,person){
    var anchors=saygiBlockAnchors(article), out=[], seen=0;
    for(var i=0;i<anchors.length;i++){
      if(anchors[i].type!=='h') continue;
      seen++;
      out.push({index:i,anchorId:saygiAnchorId(person,i),label:String(anchors[i].text||''),number:seen});
    }
    return out;
  }
  function saygiHasSections(article,person){ return saygiSections(article,person).length>0; }
  function saygiFirstHeadingAnchor(article,person){
    var s=saygiSections(article,person); return s.length?s[0].anchorId:'';
  }
  // Okuma konumu: paragraf/sayfa değil, ANKRAJ + göreli oran saklanır. Böylece
  // Aa değişiminde yükseklik değişse de okuyucu aynı yerde kalır.
  function saygiPosition(){ var u=stateUi()||{}, p=u.saygiPosition; return (p&&typeof p==='object')?p:null; }
  function saygiHasPosition(){ var p=saygiPosition(); return !!(p&&p.anchorId); }
  function saygiRememberPosition(anchorId,ratio){
    var u=stateUi(); if(!u) return;
    // Oran [-1, 1] aralığındadır: negatif değer ankrajın görünümün ÜSTÜNDE
    // kaldığını, pozitif ALTINDA kaldığını söyler. [0,1]'e kırpmak negatif
    // yarıyı yok eder ve Aa sonrası geri dönüşü bozardı.
    u.saygiPosition={anchorId:String(anchorId||''),ratio:Math.max(-1,Math.min(1,Number(ratio)||0))};
  }
  function saygiClearPosition(){ var u=stateUi(); if(u) u.saygiPosition=null; }
  // "Başa dön" Aa ile birleşmez; açık ve ayrı bir eylemdir.
  function saygiIsRtl(article){ return !!(article&&article.rtl===true); }
  function saygiReadingDirection(article){ return saygiIsRtl(article)?'rtl':'ltr'; }
  function saygiDirectionLabel(article){ return saygiIsRtl(article)?'Sağdan sola yazı yönü':'Soldan sağa yazı yönü'; }

  // ── IIP-11 · kapsayıcı tamamlama alternatifi (REQ-022 / B) ──
  // Kaydırma kapısı (A) hiç değişmez. B, yanında EŞDEĞER ve bağımsız bir yol
  // açar: bölüm sonuna klavyeyle git + açık tamamladım beyanı. Bu yol hiçbir
  // zaman otomatik "okudum" kaydı oluşturmaz; kayıt yine açık eylemle atılır.
  function saygiA11yAlternativeOn(){ var u=stateUi()||{}; return u.saygiA11yAlt!==false; }
  function saygiA11yAltHTML(suffix,ready){
    if(!saygiA11yAlternativeOn()) return '';
    return '<div class="saygi-a11y-alt"'+(ready?' data-ready="1"':'')+'>'+
      '<p class="saygi-a11y-alt-note">Metni kaydırmakta zorlanıyorsan bu yol eşdeğerdir; kayıt yine yalnız senin açık eyleminle atılır.</p>'+
      '<button type="button" id="saygi-a11y-end'+suffix+'" class="saygi-a11y-end" onclick="App.saygiReader(\'a11y-end\')">'+iconHtml('chevron-down',14)+' Bölüm sonuna git</button>'+
      '<p id="saygi-a11y-status'+suffix+'" class="saygi-a11y-status" role="status" aria-live="polite">'+
        (ready?'Bölüm sonundasın. Kaydı istediğin zaman "Okudum" ile atabilirsin.':'Bölüm sonuna gitmek kaydı kendiliğinden oluşturmaz.')+
      '</p></div>';
  }

  function faithWeekKPIs(date){
    date=date||todayStr();var d=stateData()||{},days=d.days||{},prays=0,cong=0,made=0,late=0,nafile=0,sourceRecords=0,historicalSunriseRecords=0,uncertainty='';
    for(var i=0;i<7;i++){var key=addDays(date,-i),rec=days[key];if(!rec||!rec.prayer)continue;var view=prayerCall('prayerHistoryPresentation',[rec.prayer]);if(!view)continue;prays+=view.trackedPerformed||0;sourceRecords+=view.sourceRecordCount||0;if(view.historicalSunrise)historicalSunriseRecords++;uncertainty=view.uncertainty||uncertainty;view.records.forEach(function(r){if(r.kind!=='tracked_prayer'||!r.hasRecord)return;var e=rec.prayer[r.key]||{};if(e.performed){if(e.inCongregation)cong++;if(e.late)late++;if(e.madeUp)made++;}nafile+=Math.max(0,Number(e.nafile)||0);});}
    var z=zikrCall('zikrWeek',[date])||{total:0,days:0};return {prays:prays,maxPrays:null,rate:null,denominatorReliable:false,sourceRecords:sourceRecords,historicalSunriseRecords:historicalSunriseRecords,uncertainty:uncertainty,cong:cong,madeUp:made,late:late,nafile:nafile,zikrTotal:z.total,zikrDays:z.days};
  }
  function faithDayHeat(date){ var d=stateData()||{},rec=d.days&&d.days[date],view=prayerCall('prayerHistoryPresentation',[rec&&rec.prayer])||{trackedPerformed:0,sourceRecordCount:0,historicalSunrise:null},performed=view.trackedPerformed||0,sourceRecords=view.sourceRecordCount||0;var z=d.zikr&&d.zikr.sessions&&d.zikr.sessions[date],sets=z&&Number(z.completedSets)||0,total=z&&Number(z.totalCount)||0,level=sourceRecords===0?0:(sourceRecords<=2?1:(sourceRecords<=4?2:3));if(sets>0||total>0)level=Math.min(4,Math.max(1,level+1));return {performed:performed,sourceRecords:sourceRecords,historicalSunrise:!!view.historicalSunrise,denominatorReliable:false,zikr:total,sets:sets,level:level}; }
  function zikrCall(name,args){ var z=window.SeymaZikr,f=dep('zikr:'+name);if(f)return f.apply(null,args||[]);return z&&typeof z[name]==='function'?z[name].apply(z,args||[]):null; }
  function qiblaBearing(lat,lon){var kl=21.4225*Math.PI/180,kn=39.8262*Math.PI/180,la=lat*Math.PI/180,lo=lon*Math.PI/180,y=Math.sin(kn-lo)*Math.cos(kl),x=Math.cos(la)*Math.sin(kl)-Math.sin(la)*Math.cos(kl)*Math.cos(kn-lo),br=Math.atan2(y,x)*180/Math.PI;return Math.round(((br+360)%360)*10)/10;}
  function qiblaDistanceKm(lat,lon){var r=6371.0088,la=lat*Math.PI/180,lo=lon*Math.PI/180,kl=21.4225*Math.PI/180,kn=39.8262*Math.PI/180,dlat=kl-la,dlon=kn-lo,a=Math.sin(dlat/2)*Math.sin(dlat/2)+Math.cos(la)*Math.cos(kl)*Math.sin(dlon/2)*Math.sin(dlon/2);return Math.round(r*2*Math.atan2(Math.sqrt(a),Math.sqrt(Math.max(0,1-a))));}
  function qiblaDirectionLabel(bearing){var labels=['kuzey','kuzey-kuzeydoğu','kuzeydoğu','doğu-kuzeydoğu','doğu','doğu-güneydoğu','güneydoğu','güney-güneydoğu','güney','güney-güneybatı','güneybatı','batı-güneybatı','batı','batı-kuzeybatı','kuzeybatı','kuzey-kuzeybatı'];return labels[Math.round((((Number(bearing)||0)%360)+360)%360/22.5)%16];}
  function qiblaMetrics(location,heading){var valid=location&&isFinite(+location.lat)&&isFinite(+location.lon),loc=valid?location:{lat:39.9334,lon:32.8597,cityName:'Ankara',source:'fallback'},bearing=qiblaBearing(+loc.lat,+loc.lon),distance=qiblaDistanceKm(+loc.lat,+loc.lon),hasHeading=heading!==null&&heading!==''&&isFinite(Number(heading)),hd=hasHeading?(((Number(heading)%360)+360)%360):0,relative=((bearing-hd)%360+360)%360,error=hasHeading?Math.abs(((bearing-hd+540)%360)-180):null;return {bearing:bearing,distanceKm:distance,direction:qiblaDirectionLabel(bearing),relative:relative,alignmentError:error,hasHeading:hasHeading,location:loc,isFallback:!valid};}
  function qiblaLocationPrecision(m){var loc=m.location||{},acc=Number(loc.accuracy);if(m.isFallback)return 'Geçici Ankara merkezi';if(loc.source==='gps'&&isFinite(acc)&&acc>0)return 'GPS ±'+Math.round(acc)+' m';if(loc.source==='gps')return 'GPS konumu';return 'Şehir merkezi hesabı';}
  function qiblaAlignmentCopy(m){if(!m.hasHeading)return {state:'idle',title:'Canlı yön bekleniyor',detail:'Sensör izni verince telefonun üst kenarını Kâbe doğrultusuna hizala.'};var e=Math.round(m.alignmentError*10)/10,signed=((m.relative+540)%360)-180,turn=signed>=0?'sağa':'sola';if(e<=3)return {state:'aligned',title:'Kıbleye hizalandın',detail:'Sensör farkı '+e.toLocaleString('tr-TR')+'°'};if(e<=12)return {state:'near',title:'Çok yakınsın',detail:e.toLocaleString('tr-TR')+'° '+turn+' çevir'};return {state:'seeking',title:'Telefonu '+turn+' çevir',detail:e.toLocaleString('tr-TR')+'° yön farkı'};}
  function qiblaScreenAngle(){var angle=0;try{if(window.screen&&window.screen.orientation&&isFinite(Number(window.screen.orientation.angle)))angle=Number(window.screen.orientation.angle);else if(isFinite(Number(window.orientation)))angle=Number(window.orientation);}catch(e){}return ((angle%360)+360)%360;}

  function saygiSourceFallback(person){return 'https://tr.wikipedia.org/wiki/'+encodeURIComponent(String(person&&person.trTitle||person&&person.name||'').replace(/ /g,'_'));}
  function saygiSourceCardHTML(article,link,isWiki){var href=isWiki?saygiSafeUrl(article.sourceUrl):saygiSafeUrl(link&&link.url),host=isWiki?(article.lang==='tr'?'tr.wikipedia.org':'en.wikipedia.org'):String(link&&link.host||''),tone=isWiki?'#7A5E2D':saygiDomainTone(host),label=isWiki?(article.lang==='tr'?'Wikipedia · Türkçe kaynak':'Wikipedia · English source'):host;if(!href)return '';var thumb=isWiki&&article.thumbnail?'<img src="'+escHtml(article.thumbnail)+'" alt="" loading="lazy" referrerpolicy="no-referrer">':'<span class="saygi-link-monogram">'+escHtml((host||'K').charAt(0).toUpperCase())+'</span>';return '<a class="saygi-source-card'+(isWiki?' is-wikipedia':'')+'" href="'+escHtml(href)+'" target="_blank" rel="noopener noreferrer" style="--saygi-link-tone:'+tone+';"><span class="saygi-link-thumb">'+thumb+'</span><span class="saygi-link-copy"><span class="saygi-link-label">'+escHtml(label)+'</span><span class="saygi-link-sub">'+(isWiki?'Maddesini ve kaynaklarını aç':'Kaynakta geçen dış bağlantı')+'</span></span><span class="saygi-link-arrow">'+iconHtml('external-link',14)+'</span></a>';}
  function saygiReadActionHTML(done,suffix,disabled,main,sub){suffix=suffix||'';var u=stateUi()||{},ready=!!u.saygiReadReady;if(main==null){disabled=!done&&!ready;main=done?'Okudum':(ready?'Okudum':'Okudum kilitli');sub=done?'Ne okudum kaydını aç':(ready?'Bugünün kaydına ekle':'Yazının sonuna inince açılır');}return '<div class="saygi-finish-card"><div class="saygi-finish-orbit">'+iconHtml(done?'circle-check':'book-open',22)+'</div><div class="saygi-finish-copy"><div>Bugünün düşüncesi burada tamamlandı.</div><small>Bu biyografiyi okuduysan kaydını bugüne ekleyelim.</small></div></div><button id="saygi-read-button'+suffix+'" class="saygi-read-button'+(done?' is-done':(ready?' is-ready':' is-locked'))+'" '+(disabled?'disabled':'')+' onclick="'+(done?'App.openSaygiReading()':'App.markSaygiRead()')+'"><span class="saygi-read-button-icon">'+iconHtml(done?'circle-check':'book-open',19)+'</span><span><strong data-saygi-read-copy>'+main+'</strong><small data-saygi-read-sub>'+sub+'</small></span></button>';}
  function saygiReadButtonHTML(person,done,suffix){suffix=suffix||'';var u=stateUi()||{},ready=!!u.saygiReadReady,disabled=!done&&!ready,main=done?'Okudum':(ready?'Okudum':'Okudum kilitli'),sub=done?'Ne okudum kaydını aç':(ready?'Bugünün kaydına ekle':'Yazının sonuna inince açılır');return '<div id="saygi-read-sentinel'+suffix+'" class="saygi-read-sentinel" aria-hidden="true"></div>'+saygiReadActionHTML(done,suffix,disabled,main,sub);}
  function saygiLoadingHTML(){return '<div class="saygi-loading" role="status"><div class="saygi-loading-mark">'+iconHtml('trophy',26)+'</div><div><strong>Bugünün biyografisi hazırlanıyor</strong><span>Wikipedia’dan metin, görsel ve kaynaklar güvenli biçimde alınıyor.</span></div><div class="saygi-loading-lines"><i></i><i></i><i></i></div></div>';}
  function saygiComingSoonHTML(){var h='<section class="saygi-page"><div class="saygi-intro"><div><div class="saygi-kicker">'+iconHtml('trophy',13)+' SAYGI · GÜNÜN İSMİ</div><h1>Bir hayat, bir iz.</h1><p>Bilimin ve sanatın yönünü değiştiren 100 kişiden her gün biri. Hızlıca geçmek için değil, biraz durup anlamak için.</p></div></div><div class="saygi-loading"><span class="saygi-loading-mark">'+iconHtml('clock',20)+'</span><div><strong>Yakında açılıyor</strong><span>Saygı, 13 Temmuz sabahı ilk isimle başlıyor. O güne kadar burada bekliyor olacak.</span></div></div></section>';return h;}
  function faithSummaryBadges(p,compact){var s=prayerCall('prayerDaySummary',[p])||{},badges=[];badges.push('<span class="sg-faith-badge '+(s.performed>=5?'ok':'')+'">'+s.performed+'/'+(compact?6:s.total)+' vakit</span>');if(s.congregation)badges.push('<span class="sg-faith-badge">'+s.congregation+' cemaat</span>');if(s.madeUp)badges.push('<span class="sg-faith-badge warn">'+s.madeUp+' kaza</span>');return badges.join('');}
  function faithPrayerMethodLabel(method){var labels={diyanet:'Diyanet yöntemi',mwl:'Muslim World League',isna:'ISNA',karachi:'Karachi',makkah:'Umm al-Qura',egypt:'Egyptian General Authority',tehran:'Tehran',ghana:'Ghana',kosovo:'Kosovo'},key=String(method||'diyanet').toLowerCase();return labels[key]||'Diyanet yöntemi';}
  function faithPrayerLocationMeta(loc){if(!loc||!loc.cityName)return {label:'Konum seçilmedi',detail:'Şehir seçince hesap başlar'};if(String(loc.source||'').toLowerCase()==='gps'){var acc=Number(loc.accuracy);return {label:'GPS konumu',detail:isFinite(acc)&&acc>0?'±'+Math.round(acc)+' m hassasiyet':'Hassasiyet bilinmiyor'};}return {label:'Şehir merkezi',detail:String(loc.cityName)+' koordinatı'};}
  // ── IIP-13 · Tazelik ve kapsam (REQ-025 / REQ-026) ───────────────────────
  // Cache geçerliliği yalnız yaşa göre DEĞİL; gün + şehir/konum + yöntem
  // eşleşmesine göre değerlendirilir ve uyuşmazlık AÇIKÇA "eski" olarak
  // gösterilir. Gece yarısı geçen, şehri/yöntemi değişmiş veya timeout'a
  // düşmüş kayıt geçerli bugünün saati gibi sunulmaz; sahte güncel saat
  // üretilmez (TC-025 olumsuz).
  function faithPrayerFetchMeta(p){
    p=p||{};
    if(p.fetchError) return {state:'error',label:'Güncelleme hatası',detail:String(p.fetchError)+' · eski saatler gösterilmiyor'};
    if(!p.fetchedAt) return {state:'idle',label:'Saatler bekleniyor',detail:'Vakit satırları henüz yüklenmedi'};
    var today=String(todayStr()||''), stamp=String(p.fetchedAt).slice(0,16).replace('T',' ');
    // NOT: yaş REAL saatle ölçülmez. Uygulamanın kendi gün modeli esastır;
    // gerçek saate bağlanmak render'ı gizli bir cihaz-saati bağımlılığına
    // sokardı. Gün/metot/konum eşleşmesi zaten deterministiktir ve eski kaydı
    // yakalar; yaşa dayalı bayatlama `prayerCacheFreshness(nowMs)` ile açıkça
    // ölçülür (deterministik, test edilebilir).
    if(String(p.fetchedAt).slice(0,10)!==today) return {state:'stale',label:'Başka güne ait',detail:'Kayıt '+stamp+' · bugün '+today+' · güncel saat olarak sunulmaz',stale:true};
    var curMethod=String(prayerCall('prayerMethod',[])||''), storedMethod=String(p.fetchedMethod||'');
    if(storedMethod&&curMethod&&storedMethod!==curMethod){
      var ml=prayerCall('prayerMethodLabel',[storedMethod]), ml2=prayerCall('prayerMethodLabel',[curMethod]);
      return {state:'stale',label:'Yöntem uyuşmuyor',detail:'Kayıt '+(ml||storedMethod)+' · seçili '+(ml2||curMethod)+' · eski kayıt',stale:true};
    }
    var curHash=String(prayerCall('prayerLocationHash',[])||''), storedHash=String(p.fetchedFor||'');
    if(storedHash&&curHash&&storedHash!==curHash) return {state:'stale',label:'Konum uyuşmuyor',detail:'Kayıt başka şehir/konuma ait · eski kayıt',stale:true};
    return {state:'ready',label:'Bugüne ait',detail:'Son kayıt '+stamp,stale:false};
  }
  // Kapsam hücresi: kapsam verisi yoksa hücre hiç basılmaz (uydurma yok).
  // Yurtdışı konumda "Türkiye dışı" açıkça yazılır ve yerel saat iddiası
  // kurulmaz; Europe/Istanbul sessizce yerelleştirilmez (TC-026 olumsuz).
  function faithCoverageMeta(loc){
    var c=prayerCall('prayerCoverage',[loc||prayerCall('prayerLocation',[])]); if(!c) return null;
    if(c.inTurkey) return {state:'ready',label:c.label,detail:c.detail};
    if(c.state==='none') return {state:'idle',label:c.label,detail:c.detail};
    return {state:'stale',label:c.label,detail:c.detail};
  }
  function faithCornerCardHTML(){var date=todayStr(),d=stateData()||{},day=getDayCall(d,date,dayIndexFor(date))||{},p=prayerCall('ensurePrayerDay',[day])||{},loc=prayerCall('prayerLocation',[])||{},s=prayerCall('prayerDaySummary',[p])||{},streak=prayerCall('prayerStreak',[])||0,times=prayerCall('prayerTimesFromDay',[p])||{},order=prayerValue('PRAYER_ORDER',[]),curIdx=prayerCall('currentPrayerIndex',[times])||0,nextIdx=(curIdx+1<order.length?curIdx+1:order.length-1),locName=loc&&loc.cityName?escHtml(loc.cityName):(loc?'Konum ayarlandı':'Konum seçilmedi'),nx=prayerCall('nextPrayerInfo',[times])||{},pct=Math.round((s.performed/6)*100),allDone=s.performed>=6,nextKey=nx.key||order[nextIdx]||order[0],nextEntry=p[nextKey]||prayerCall('emptyPrayerEntry',[])||{};var h='<button id="faith-preview-card" class="hub-v2-preview faith-v2-preview'+(allDone?' is-complete':'')+'" onclick="App.openFaithCorner()" aria-label="İman Köşesini aç"><div class="hub-v2-preview-top"><span class="hub-v2-preview-icon">'+iconHtml('mosque',20)+'</span><div class="hub-v2-preview-copy"><strong>İman Köşesi</strong><small>'+locName+' · '+dateLabelTR(date)+'</small></div><span class="hub-v2-preview-status '+(allDone?'complete':'active')+'">'+(allDone?'tamamlandı':s.performed+'/6 vakit')+'</span></div><div class="hub-v2-preview-focus"><div><span class="eyebrow">SIRADAKİ VAKİT</span><strong>'+escHtml(nx.name||prayerValue('PRAYER_NAMES',{})[nextKey]||'Vakit')+'</strong><p>'+(nx.label?escHtml(nx.label):'Vakit bilgisi hazırlanıyor')+'</p></div><span class="faith-time">'+escHtml(nextEntry.time||'--:--')+'</span></div><div class="hub-v2-preview-metric"><div><span>Kılınan</span><strong>'+s.performed+' / 6</strong><small>bugün</small></div><div><span>Cemaat</span><strong>'+s.congregation+'</strong><small>vakit</small></div><div><span>Devamlılık</span><strong>'+streak+'</strong><small>gün seri</small></div></div><div class="hub-v2-preview-bar" aria-label="'+s.performed+' / 6 vakit tamamlandı"><i style="width:'+pct+'%"></i></div><div class="hub-v2-preview-foot"><span>'+(s.madeUp?iconHtml('rotate-ccw',12)+s.madeUp+' kaza':'Bugünün ibadet ritmi')+'</span><b>Vakitleri aç '+iconHtml('chevron-right',13)+'</b></div></button>';return h;}
  function saygiPreviewCardHTML(person,done,article){if(!person)return '';var thumb=article&&article.thumbnail?'<img src="'+escHtml(article.thumbnail)+'" alt="" loading="lazy" referrerpolicy="no-referrer">':'<span class="sg-person-preview-thumb-fallback">'+escHtml((person.name||'?').charAt(0).toUpperCase())+'</span>',readCount=saygiReadCount(),pct=Math.min(100,Math.round((readCount/100)*100));var h='<button id="saygi-preview-card" class="hub-v2-preview person-v2-preview'+(done?' is-complete':'')+'" onclick="App.openSaygiPreview()" aria-label="Günün öncüsü: '+escHtml(person.name)+'"><div class="hub-v2-preview-top"><span class="hub-v2-preview-icon">'+iconHtml('trophy',20)+'</span><div class="hub-v2-preview-copy"><strong>Günün Öncüsü</strong><small>100 hayat · 100 iz</small></div><span class="hub-v2-preview-status '+(done?'complete':'active')+'">'+(done?'okundu':'bugün keşfet')+'</span></div><div class="hub-v2-preview-focus"><div><span class="eyebrow">'+escHtml(person.kind)+' · '+escHtml(person.era)+'</span><strong>'+escHtml(person.name)+'</strong><p>'+(article&&article.description?escHtml(article.description):escHtml(person.field))+'</p></div><span class="person-thumb">'+thumb+'</span></div><div class="hub-v2-preview-metric"><div><span>Alan</span><strong>'+escHtml(person.kind)+'</strong><small>'+escHtml(person.field)+'</small></div><div><span>Okuma</span><strong>'+(article?saygiReadMinutes(article):2)+' dk</strong><small>'+(article&&article.lang==='tr'?'Türkçe':'Wikipedia')+'</small></div><div><span>Koleksiyon</span><strong>'+readCount+' / 100</strong><small>'+saygiStreak()+' gün seri</small></div></div><div class="hub-v2-preview-bar" aria-label="100 öncüden '+readCount+' okundu"><i style="width:'+pct+'%"></i></div><div class="hub-v2-preview-foot"><span>'+iconHtml(person.kind==='Bilim'?'microscope':'feather',12)+escHtml(person.field)+'</span><b>'+(done?'Yeniden oku':'Biyografiyi aç')+' '+iconHtml('chevron-right',13)+'</b></div></button>';return h;}
  function saygiMissionCardHTML(){return '<div class="sg-mission-card"><div class="sg-mission-kicker">'+iconHtml('trophy',12)+' İLHAM · GÜNÜN İSMİ</div><h2 class="sg-mission-title">Bir hayat, bir iz.</h2><p class="sg-mission-desc">Bilimin ve sanatın yönünü değiştiren 100 kişiden her gün biri. Hızlıca geçmek için değil, biraz durup anlamak için.</p></div>';}
  function faithCornerInlineHTML(){return faithCornerCardHTML();}
  function prayerRowHTML(type,entry,isCurrent,isNext){var names=prayerValue('PRAYER_NAMES',{}),name=names[type]||type,performed=!!entry.performed,cong=!!entry.inCongregation,late=!!entry.late,madeUp=!!entry.madeUp,nafile=Math.max(0,Number(entry.nafile)||0),hasTime=!!entry.time,marker=isCurrent?'Şu anki vakit':(isNext?'Sıradaki vakit':''),detail=[];if(cong)detail.push('Cemaat');if(late)detail.push('Geç');if(madeUp)detail.push('Kaza');if(nafile)detail.push(nafile+' nafile');var cls='sg-faith-row'+(isCurrent?' current':'')+(hasTime?' has-time':' is-empty'),h='<section class="'+cls+'" aria-label="'+escHtml(name)+' vakti"><div class="sg-faith-row-head"><div class="sg-faith-row-name"><strong>'+escHtml(name)+'</strong>'+(marker?'<small>'+marker+'</small>':'')+'</div><div class="sg-faith-row-time"><span>Saat</span><strong>'+(hasTime?escHtml(entry.time):'—')+'</strong><small>'+(hasTime?'Vakit hazır':'Saat bekleniyor')+'</small></div></div><div class="sg-faith-row-detail"><div><span>Kayıt</span><strong class="'+(performed?'is-recorded':'is-unrecorded')+'">'+(performed?'Kılındı':'Kayıt yok')+'</strong></div><div><span>Ayrıntı</span><strong>'+(detail.length?escHtml(detail.join(' · ')):'Ayrıntı yok')+'</strong></div></div><div class="sg-faith-row-controls" aria-label="'+escHtml(name)+' kayıt seçenekleri"><button class="sg-faith-chip '+(performed?'on':'')+'" aria-pressed="'+(performed?'true':'false')+'" onclick="App.togglePrayer(\''+type+'\',\'performed\')">'+(performed?iconHtml('check',12):'')+' Kılındı</button><button class="sg-faith-chip '+(cong?'on':'')+'" aria-pressed="'+(cong?'true':'false')+'" onclick="App.togglePrayer(\''+type+'\',\'inCongregation\')">'+(cong?iconHtml('users',12):'')+' Cemaat</button><button class="sg-faith-chip '+(late?'warn':'')+'" aria-pressed="'+(late?'true':'false')+'" onclick="App.togglePrayer(\''+type+'\',\'late\')">'+(late?iconHtml('clock',12):'')+' Geç</button><button class="sg-faith-chip '+(madeUp?'warn':'')+'" aria-pressed="'+(madeUp?'true':'false')+'" onclick="App.togglePrayer(\''+type+'\',\'madeUp\')">'+(madeUp?iconHtml('refresh-ccw',12):'')+' Kaza</button><span class="sg-faith-nafile"><button aria-label="'+escHtml(name)+' nafile azalt" onclick="App.changeNafile(\''+type+'\',-1)">−</button><b>'+nafile+'</b><button aria-label="'+escHtml(name)+' nafile artır" onclick="App.changeNafile(\''+type+'\',1)">+</button><small>Nafile</small></span></div><label class="sg-faith-note-wrap"><span>Not</span><textarea class="sg-faith-note" rows="1" placeholder="'+escHtml(name)+' notu…" aria-label="'+escHtml(name)+' notu" oninput="App.setPrayerNote(\''+type+'\',this)">'+(entry.note?escHtml(entry.note):'')+'</textarea></label></section>';return h;}
  function hijriTodayStr(){var c=window.HijriCalendarV1,ps=prayerCall('prayerSettings',[])||{};if(c&&c.todayStr)return c.todayStr(todayStr(),ps.hijriOffset||0);var d=new Date(),mo=['Muharrem','Safer','Rebiülevvel','Rebiülâhir','Cemaziyelevvel','Cemaziyelâhir','Receb','Şaban','Ramazan','Şevval','Zilkade','Zilhicce'];return mo[d.getMonth()]?mo[d.getMonth()]+' '+d.getDate():'';}
  function kandilBadgeFor(date){var c=window.HijriCalendarV1;return c&&c.holyDay?c.holyDay(date)||'':'';}
  function spiritBarHTML(){var date=todayStr(),d=stateData()||{},day=getDayCall(d,date,dayIndexFor(date))||{},p=prayerCall('ensurePrayerDay',[day])||{},times=prayerCall('prayerTimesFromDay',[p])||{},nx=prayerCall('nextPrayerInfo',[times])||{},h='<div class="sg-spirit-bar sg-glass"><span class="nnext">'+iconHtml('mosque',13)+' '+escHtml(nx.name)+(nx.label?' · <strong>'+escHtml(nx.label)+'</strong>':'')+'</span><span class="dot">·</span><span class="hijri">🌙 '+escHtml(hijriTodayStr())+'</span>';var kand=kandilBadgeFor(date);if(kand)h+='<span class="kandil">'+iconHtml('sparkles',11)+' '+escHtml(kand)+'</span>';return h+'</div>';}
function faithCornerOverlayHTML(){
  var date=todayStr(), d=stateData()||{}, day=getDayCall(d,date,dayIndexFor(date));
  var p=prayerCall('ensurePrayerDay',[day])||{}, loc=prayerCall('prayerLocation',[])||{}, times=prayerCall('prayerTimesFromDay',[p])||{};
  var curIdx=prayerCall('currentPrayerIndex',[times])||0, nextIdx=(curIdx+1<prayerValue('PRAYER_ORDER',[]).length?curIdx+1:prayerValue('PRAYER_ORDER',[]).length-1);
  var s=prayerCall('prayerDaySummary',[p])||{}, streak=prayerCall('prayerStreak',[])||0,method=faithPrayerMethodLabel(p.fetchedMethod||prayerCall('prayerMethod',[])),locMeta=faithPrayerLocationMeta(loc),fetchMeta=faithPrayerFetchMeta(p),coverMeta=faithCoverageMeta(loc);
  var head='<header class="sg-faith-ov-head"><div><div class="sg-faith-ov-title">İman Köşesi '+iconHtml('mosque',19)+'</div><div class="sg-faith-ov-sub">Bugünün vakitleri, kayıt ayrıntıları ve yöntem bilgisi.</div></div><button class="sg-faith-ov-close" onclick="App.closeFaithCorner()" aria-label="İman köşesini kapat">'+iconHtml('x',16)+'</button></header>';
  var body='';
  // Faz 36 — Sonraki vakit geri sayım
  var nx=prayerCall('nextPrayerInfo',[times])||{};
  if(nx.key){ var remPct=nx.remMin!=null?Math.max(0,Math.min(100,100-Math.round(nx.remMin/(1440/100)))):0;
    body+='<div class="sg-faith-next"><div class="nm">'+iconHtml('clock',14)+' Sonraki: '+escHtml(nx.name)+'</div><div class="cd">'+escHtml(nx.label)+'</div></div>';
    body+='<div class="sg-faith-next-bar"><i style="width:'+remPct+'%;"></i></div>';
  }
  // Konum / şehir seçimi
  body+='<div class="sg-faith-city">'+iconHtml('map-pin',14)+'<select aria-label="Vakit şehri" onchange="App.setPrayerCity(this.value)">'+(prayerCall('prayerCityOptionsHTML',[loc&&loc.cityName])||'')+'</select><button onclick="App.fetchPrayerLocationGPS()" aria-label="GPS ile konumu yenile">'+iconHtml('compass',14)+'</button></div>';
  // Günlük özet — hicri + mübarek rozet (Faz 37)
  var hijri=hijriTodayStr(), kand=kandilBadgeFor(date), hoff=Number((prayerCall('prayerSettings',[])||{}).hijriOffset)||0;
  body+='<div class="sg-hijri-row"><span>🌙 '+escHtml(hijri)+(hoff?' · '+(hoff>0?'+':'')+hoff+' gün':'')+'</span>'+(kand?'<span class="kandil">'+iconHtml('sparkles',10)+' '+escHtml(kand)+'</span>':'')+'<span class="sg-hijri-adjust"><button onclick="App.adjustHijriOffset(-1)" '+(hoff<=-2?'disabled':'')+' aria-label="Hicri tarihi bir gün geri al">−</button><button onclick="App.adjustHijriOffset(1)" '+(hoff>=2?'disabled':'')+' aria-label="Hicri tarihi bir gün ileri al">+</button></span></div>';
  body+='<section class="sg-tool-meta sg-faith-source" aria-label="Vakit yöntemi ve veri durumu"><div class="sg-tool-meta-head"><span>'+iconHtml('database',15)+'</span><div><strong>Vakit hesabı</strong><small>Kaynak, konum hassasiyeti ve kayıt durumu ayrı tutulur.</small></div></div><div class="sg-tool-meta-grid"><div><span>Yöntem</span><strong>'+escHtml(method)+'</strong><small>Aladhan zamanları</small></div><div><span>Konum hassasiyeti</span><strong>'+escHtml(locMeta.label)+'</strong><small>'+escHtml(locMeta.detail)+'</small></div><div><span>Veri durumu</span><strong class="is-'+fetchMeta.state+'">'+escHtml(fetchMeta.label)+'</strong><small>'+escHtml(fetchMeta.detail)+'</small></div>'+(coverMeta?'<div><span>Kapsam</span><strong class="is-'+coverMeta.state+'">'+escHtml(coverMeta.label)+'</strong><small>'+escHtml(coverMeta.detail)+'</small></div>':'')+'</div></section>';
  body+='<div class="sg-faith-summary"><strong>'+s.performed+'/6 vakit</strong><span>· '+s.congregation+' cemaat · '+s.madeUp+' kaza · '+s.late+' geç · '+s.nafile+' nafile</span>'+(streak?'<span class="sg-faith-summary-streak">'+streak+' gün seri</span>':'')+'</div>';
  // Vakit satırları
  body+='<div style="display:flex;flex-direction:column;gap:6px;">';
  prayerValue('PRAYER_ORDER',[]).forEach(function(k,i){ body+=prayerRowHTML(k, p[k]||(prayerCall('emptyPrayerEntry',[])||{}), i===curIdx, i===nextIdx); });
  body+='</div>';
  return '<div id="sey-ov-back" class="sey-faith-ov-back sg-faith-ov-back" onclick="App.closeFaithCorner()"><div id="sey-ov-card" class="sey-faith-ov-card sg-faith-ov-card" role="dialog" aria-modal="true" aria-label="İman köşesi" tabindex="-1" onkeydown="App.onModalKeydown(event,App.closeFaithCorner)" onclick="event.stopPropagation()">'+head+'<div id="sey-ov-body" class="scroll sg-faith-ov-body">'+body+'</div></div></div>';
}
  // ── IIP-10 · koleksiyon: isimli liste birincil, numara gridi ikincil ──
  function saygiCollectionGridHTML(person,coll,read,total){
    var todayId=person&&person.id, cells='';
    saygiPeople().forEach(function(x,idx){
      var r=coll[x.id], hcl=r?' read':''; if(x.id===todayId)hcl+=' todayd';
      cells+='<button class="d'+hcl+'" onclick="App.openSaygiCollectionPerson(\''+escHtml(x.id)+'\')" title="'+escHtml((idx+1)+'. '+x.name+(r?' · okundu':' · keşfedilmeyi bekliyor'))+'" aria-label="'+escHtml((idx+1)+'. '+x.name+(r?' okundu':' okunmadı')+' · biyografiyi aç')+'"><span>'+(r?'✓':(idx+1))+'</span></button>';
    });
    return '<div class="sg-collect-grid" role="group" aria-label="100 öncü sayı düzeni · ikincil görünüm">'+cells+'</div>'+
      '<div class="sg-collect-meta"><span>'+read+'/'+total+' okundu</span><span class="sg-collect-meta-state">'+(read>=total?'Tamamlandı 🌟':'Devam')+'</span></div>'+
      (read?'':'<div class="sg-collect-empty">Her kutu bir öncüyü temsil ediyor. Bugünün biyografisini “Okudum” diye kaydedince kutusu altın renkle dolacak.</div>');
  }
  function saygiCollectionCardHTML(person){var coll=saygiCollection(),read=saygiReadCount(),streak=saygiStreak(),people=saygiPeople(),total=people.length,bilim=0,sanat=0;people.forEach(function(x){if(coll[x.id]){if(x.kind==='Sanat')sanat++;else bilim++;}});var nudge='';if(read>=6){var totalRead=bilim+sanat;if(totalRead>0&&bilim/totalRead>0.72)nudge='Ağırlık bilimde ('+bilim+') — biraz sanat da keşfet 🎨';else if(totalRead>0&&sanat/totalRead>0.72)nudge='Ağırlık sanatta ('+sanat+') — biraz bilim de keşfet 🔬';}var lens=saygiLens(), gridOpen=!!(stateUi()||{}).saygiGridOpen;
  var h='<div class="sg-collect">'+
    '<div class="sg-collect-head"><div class="sg-collect-title">'+iconHtml('trophy',15)+' 100 Öncü Koleksiyonu</div><div class="streak">'+(streak?streak+' gün seri':'&nbsp;')+'</div></div>'+
    saygiSearchControlsHTML(lens)+
    '<div id="saygi-search-region" class="sg-p-search-region">'+saygiFilteredResultsHTML(lens,person&&person.id)+'</div>'+
    '<details id="saygi-grid-details" class="sg-collect-grid-wrap"'+(gridOpen?' open':'')+' ontoggle="App.saygiLens(\'grid\',this.open)"><summary class="sg-collect-grid-summary"><span>'+iconHtml('trophy',13)+' Sayı düzeni · 100 kutu</span><small>İkincil özet görünümü</small></summary>'+saygiCollectionGridHTML(person,coll,read,total)+'</details>'+
    (nudge?'<div class="sg-nudge">'+escHtml(nudge)+'</div>':'')+
  '</div>';
  return h;
}
  // ── IIP-12 · Günlük odak + Devam et ──────────────────────────────────────
  // Seçim YALNIZ mevcut, kabul edilmiş kayıt/kataloglardan türetilir; yeni
  // içerik, yeni kayıt, streak veya `data` alanı ÜRETMEZ. Determinizm gün +
  // katalog kimliğinden gelir; aynı gün tekrar render seçimi değiştirmez
  // (REQ-023/TC-023). Tematik seçki içeriği plana göre yazılmamıştır
  // (04-ICERIK-STRATEJISI: "bu planla içerik yazılmış/onaylanmış değildir"),
  // bu yüzden öneri yalnız kabul edilmiş kataloglardan (öncü + âyet) gelir;
  // tema içeriği uydurulmaz.
  var SAYGI_DAILY_SOURCES=[
    {id:'oncu',label:'Günün öncüsü',minutes:'5–10 dk',cta:'Biyografiyi aç',action:"App.openSaygiPreview()"},
    {id:'ayet',label:'Âyet vitrini',minutes:'2–3 dk',cta:'Yolculuğu aç',action:"App.openQuranJourney()"}
  ];
  // Kur'an: YALNIZ kullanıcının gerçekten bıraktığı yer. "Bekleme" durumları
  // (submitting/queued/notified/awaiting_reply/validating_reply) Devam DEĞİLDİR —
  // kullanıcının yapacağı bir şey yoktur ve aynı sekmedeki yolculuk kartı bunları
  // zaten gösterir. idle/request_error/notification_error/invalid_reply/
  // video_unavailable bozuk/başarısız kayıttır; Devam düğmesi üretilmez
  // (TC-024 olumsuz kontrol).
  var SAYGI_QURAN_RESUME_STATUSES={ready:1,watching:1,watched:1};
  var SAYGI_QURAN_STATUS_LABELS={ready:'Anlatım hazır · yeni',watching:'İzleniyor · kaldığın yer',watched:'İzlendi · soru bekliyor'};
  function quranRead(name,args){ var q=window.SeymaQuran,f=dep('quran:'+name); if(f)return f.apply(null,args||[]); return q&&typeof q[name]==='function'?q[name].apply(q,args||[]):null; }
  function saygiDaySeed(date){
    var people=saygiPeople(), stamp=String(people.length)+':'+String((people[0]&&people[0].id)||'')+':'+String((people[people.length-1]&&people[people.length-1].id)||'');
    var n=0,s=String(date||'')+'|'+stamp;
    for(var i=0;i<s.length;i++) n=(n*31+s.charCodeAt(i))>>>0;
    return n;
  }
  function saygiDailyFocus(date){
    if(!saygiPeople().length) return {state:'empty',source:null,reason:'Bugünün seçkisi için kabul edilmiş içerik bulunamadı.'};
    return {state:'ready',source:SAYGI_DAILY_SOURCES[saygiDaySeed(date||todayStr())%SAYGI_DAILY_SOURCES.length],reason:'Bugünün seçkisi · gün + katalog kimliğinden deterministik'};
  }
  function saygiDailyFocusHTML(date){
    var f=saygiDailyFocus(date||todayStr());
    if(f.state!=='ready') return '<div class="sg-collect-empty" role="status">'+iconHtml('sparkles',13)+' '+escHtml(f.reason)+'</div>';
    // Tek baskın eylem: kartın tamamı bir düğmedir. Görsel dil mevcut
    // `saygi-source-card` sınıfından gelir; yalnız buton font eşitlemesi inline
    // eklenir (bu sınıf normalde <a> için yazılmıştır).
    return '<button class="saygi-source-card" style="font:inherit;text-align:left;cursor:pointer" aria-label="Günün odağı: '+escHtml(f.source.label+' · '+f.source.cta)+'" onclick="'+f.source.action+'">'+
      '<span class="saygi-link-thumb">'+iconHtml('sparkles',19)+'</span>'+
      '<span class="saygi-link-copy"><span class="saygi-link-label">GÜNÜN ODAĞI · '+escHtml(f.source.label)+'</span><span class="saygi-link-sub">'+escHtml(f.source.minutes+' · '+f.reason+' · '+f.source.cta)+'</span></span>'+
      '<span class="saygi-link-arrow">'+iconHtml('chevron-right',14)+'</span></button>';
  }
  // Devam satırı: en çok iki satır (Zikir → Kur'an sabit sırası). Yalnız
  // gerçek durum yazılır; sahte ilerleme yüzdesi yok (tasarım sözleşmesi).
  function saygiContinueRows(){
    var rows=[];
    if(zikrVisible()){
      try{
        var p=zikrCall('zikrActivePreset',[]), jp=p?zikrCall('zikrJourneyProgress',[p]):null, j=jp&&jp.journey, h=jp&&jp.hatim;
        if(p&&j&&h&&h.status!=='archived'&&h.target>0){
          var n=Math.max(0,Number(h.count)||0), done=h.status==='completed'||n>=h.target;
          rows.push({icon:'sparkles',label:String(p.name||'Zikir'),status:done?'Hatim tamamlandı':(Math.round(n/h.target*100)+'% · hatim ilerliyor'),action:"App.openZikr()"});
        }
      }catch(e){}
    }
    try{
      var d=stateData(), jr=d&&d.quranJourney;
      if(jr&&typeof jr==='object'&&!Array.isArray(jr)){
        var sid=String(jr.activeSurahId||'').toLocaleLowerCase('tr-TR'), cat=window.QuranRevelationOrderV1;
        var req=jr.requests&&jr.requests[sid], status=req&&typeof req.status==='string'?req.status:'idle';
        if(cat&&typeof cat.byId==='function'&&cat.byId(sid)&&SAYGI_QURAN_RESUME_STATUSES[status]){
          var sname=quranRead('quranSurahName',[sid]);
          // Durum → doğru eylem: izlenmiş durağın devamı soru sormaktır;
          // açmak yanlış yüzey olurdu.
          var naction=status==='watched'?"App.quranJourneyQuestion()":(status==='ready'?"App.quranJourneyWatch()":"App.openQuranJourney()");
          rows.push({icon:'book-open',label:sname||'Kur’an Yolculuğu',status:SAYGI_QURAN_STATUS_LABELS[status]||'Devam ediyor',action:naction});
        }
      }
    }catch(e){}
    return rows;
  }
  function saygiContinueHTML(){
    var rows=saygiContinueRows();
    if(!rows.length) return ''; // Yoksa görünmez; sahte ilerleme yok (TC-024)
    var h='<div style="display:flex;flex-direction:column;gap:12px;" role="group" aria-label="Kaldığın yer · devam et">';
    rows.forEach(function(r){
      h+='<button class="saygi-source-card" style="font:inherit;text-align:left;cursor:pointer" aria-label="Devam et: '+escHtml(r.label+' · '+r.status)+'" onclick="'+r.action+'">'+
        '<span class="saygi-link-thumb">'+iconHtml(r.icon,19)+'</span>'+
        '<span class="saygi-link-copy"><span class="saygi-link-label">'+escHtml(r.label)+'</span><span class="saygi-link-sub">'+escHtml(r.status)+'</span></span>'+
        '<span class="saygi-link-arrow">'+iconHtml('chevron-right',14)+'</span></button>';
    });
    return h+'</div>';
  }
  function faithAnnualHeatmapHTML(){var u=stateUi()||{},dta=stateData()||{},now=todayStr(),nowY=new Date().getFullYear(),startY=+(dta.startDate?String(dta.startDate).slice(0,4):nowY),year=+(u.faithHeatYear||nowY);year=Math.max(startY,Math.min(nowY,year));u.faithHeatYear=year;var first=year+'-01-01',last=year+'-12-31',firstDow=(new Date(year,0,1).getDay()+6)%7,cells='',totals={days:0,sourceRecords:0,sunrise:0,zikr:0};for(var blank=0;blank<firstDow;blank++)cells+='<span class="c blank" aria-hidden="true"></span>';for(var d=first;d<=last;d=addDays(d,1)){var f=faithDayHeat(d),future=d>now,tip=dateLabelTR(d)+' · '+f.sourceRecords+' kaynak kayıt'+(f.historicalSunrise?' · Güneş tarihsel kayıt':'')+(f.zikr?' · '+f.zikr+' zikir':'');if(f.sourceRecords||f.zikr){totals.days++;totals.sourceRecords+=f.sourceRecords;totals.sunrise+=f.historicalSunrise?1:0;totals.zikr+=f.zikr;}cells+='<button class="c'+(future?' future':'')+'" data-l="'+f.level+'" '+(future?'disabled':'onclick="App.openFaithHeatDay(\''+d+'\')"')+' title="'+escHtml(tip)+'" aria-label="'+escHtml(tip)+'"></button>';}var prev=year>startY,next=year<nowY,h='<section class="sg-faith-year"><div class="sg-faith-year-head"><div><strong>'+year+' · Yıllık İbadet Isısı</strong><small>'+totals.days+' kayıtlı gün · '+totals.sourceRecords+' kaynak kayıt'+(totals.sunrise?' · '+totals.sunrise+' Güneş tarihsel':'')+' · '+totals.zikr+' zikir</small></div><div><button '+(prev?'onclick="App.faithHeatYear(-1)"':'disabled')+' aria-label="Önceki yıl">‹</button><button '+(next?'onclick="App.faithHeatYear(1)"':'disabled')+' aria-label="Sonraki yıl">›</button></div></div><div class="sg-faith-year-scroll"><div class="sg-faith-months"><span>Oca</span><span>Şub</span><span>Mar</span><span>Nis</span><span>May</span><span>Haz</span><span>Tem</span><span>Ağu</span><span>Eyl</span><span>Eki</span><span>Kas</span><span>Ara</span></div><div class="sg-faith-heat" role="grid" aria-label="'+year+' yıllık kaynak kayıt ısı haritası">'+cells+'</div></div><div class="sg-faith-legend"><span>Sakin</span><i data-l="0"></i><i data-l="1"></i><i data-l="2"></i><i data-l="3"></i><i data-l="4"></i><span>Yoğun</span></div><p>Renk yalnız kaynak kayıt yoğunluğunu gösterir; ibadet toplamı veya başarı oranı değildir. Güneş anahtarındaki eski kayıt ayrı tarihsel kayıttır.</p></section>';return h;}
  function faithRaporCardHTML(){var k=faithWeekKPIs(todayStr()),streak=zikrCall('zikrStreak',[])||0,h='<div class="sg-faith-hero sg-gradient-border sg-glow"><div style="display:flex;align-items:center;justify-content:space-between;gap:10px;"><div><div style="font-size:var(--f-subhead);font-weight:800;color:var(--faith);display:flex;align-items:center;gap:7px;">'+iconHtml('bar-chart',16)+' Bu Haftanın İbadet Ritmi</div><div style="font-size:var(--f-caption1);color:var(--faint);margin-top:2px;">Kaynak kayıt · cemaat · zikir · seri</div></div><div style="text-align:right;flex-shrink:0;"><div style="font-size:var(--f-title1);font-weight:800;color:var(--faith);">'+k.sourceRecords+'</div><div style="font-size:var(--f-caption2);color:var(--faint);">kaynak kayıt</div></div></div><div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;"><div class="sg-faith-kpi"><div style="font-size:var(--f-title3);font-weight:800;color:var(--faith);">'+k.prays+'</div><div style="font-size:var(--f-caption2);color:var(--faint);">ayrıştırılan beş vakit kaydı</div></div><div class="sg-faith-kpi"><div style="font-size:var(--f-title3);font-weight:800;color:var(--faith2);">'+k.cong+'</div><div style="font-size:var(--f-caption2);color:var(--faint);">cemaat</div></div><div class="sg-faith-kpi"><div style="font-size:var(--f-title3);font-weight:800;color:var(--zikr);">'+k.zikrTotal+'</div><div style="font-size:var(--f-caption2);color:var(--faint);">zikir</div></div><div class="sg-faith-kpi"><div style="font-size:var(--f-title3);font-weight:800;color:var(--kandil);">'+(streak||0)+'</div><div style="font-size:var(--f-caption2);color:var(--faint);">seri</div></div></div><p>'+escHtml(k.uncertainty||'Tarihsel kayıtlarda güvenilir payda yok; toplam ve yüzde gösterilmez.')+(k.historicalSunriseRecords?' '+k.historicalSunriseRecords+' Güneş kaydı ayrı tarihsel kayıt olarak tutulur.':'')+'</p><div style="display:flex;align-items:flex-end;gap:5px;height:64px;margin-top:4px;">';var vals=[];for(var i=6;i>=0;i--){vals.push(faithDayHeat(addDays(todayStr(),-i)).sourceRecords||0);}var max=Math.max.apply(Math,[1].concat(vals));vals.forEach(function(v,i2){var hp=max>0?Math.round(v/max*52)+6:6,wd=['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'][new Date(Date.parse(addDays(todayStr(),-6+i2))).getDay()];h+=(v>0?'<span style="font-size:var(--f-caption2);font-weight:700;color:var(--faint);">'+v+'</span>':'')+'<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;"><div style="width:100%;max-width:24px;height:'+hp+'px;border-radius:6px;background:'+(v>0?'linear-gradient(180deg,var(--faith2),var(--faith))':'var(--icon)')+';transition:height .3s;"></div><span style="font-size:var(--f-caption2);color:'+(i2===6?'var(--faith)':'var(--faint)')+';font-weight:'+(i2===6?'800':'600')+';">'+wd+'</span></div>';});return h+'</div>'+faithAnnualHeatmapHTML()+'</div>';}
  function qiblaHubCardHTML(){var m=qiblaMetrics(prayerCall('prayerLocation',[]),null),loc=m.location||{},h='<button id="qibla-card" class="sg-qibla-card" onclick="App.openQibla()" aria-label="Kıble pusulasını aç"><span class="sg-qibla-card-dial" aria-hidden="true"><i class="north">K</i><i class="arrow" style="transform:rotate('+m.bearing+'deg)">'+iconHtml('navigation',18)+'</i></span><span class="sg-qibla-card-copy"><small>KIBLE · GERÇEK KUZEY</small><strong>'+m.bearing.toLocaleString('tr-TR')+'° · '+escHtml(m.direction)+'</strong><em>'+escHtml(loc.cityName||'Konum')+' · Kâbe '+m.distanceKm.toLocaleString('tr-TR')+' km</em></span><span class="sg-qibla-card-method"><b>'+iconHtml('route',12)+' Büyük daire</b><em>'+escHtml(qiblaLocationPrecision(m))+'</em></span><span class="sg-qibla-card-action">'+(m.isFallback?'Konumu doğrula':'Pusulayı aç')+' '+iconHtml('chevron-right',15)+'</span></button>';return h;}
function qiblaOverlayHTML(){
  var u=stateUi()||{}, m=qiblaMetrics(prayerCall('prayerLocation',[])||{},u.qiblaHeading), loc=m.location||{}, align=qiblaAlignmentCopy(m);
  var sensor=u.qiblaListening?(u.qiblaSensorSource==='magnetic'?'Manyetik pusula · yerel sapma olabilir':'Mutlak cihaz yönü'):('Sensör kapalı');
  if(u.qiblaAccuracy!=null) sensor+=' · ±'+Math.round(u.qiblaAccuracy)+'°';
  var h='<div id="qibla-overlay" class="qibla-v2-back" onclick="App.closeQibla()">';
  h+='<section id="qibla-dialog" class="qibla-v2-sheet" role="dialog" aria-modal="true" aria-labelledby="qibla-v2-title" tabindex="-1" onkeydown="App.onModalKeydown(event,App.closeQibla)" onclick="event.stopPropagation()">';
  h+='<header class="qibla-v2-head"><div><span>'+iconHtml('compass',14)+' BİLİMSEL YÖN HESABI</span><h2 id="qibla-v2-title">Kıble pusulası</h2><p>Konumdan Kâbe’ye başlangıç büyük-daire azimutu</p></div><button onclick="App.closeQibla()" aria-label="Kıble pusulasını kapat">'+iconHtml('x',18)+'</button></header>';
  h+='<div class="qibla-v2-scroll">';
  h+='<div class="qibla-v2-target"><div><span>HESAPLANAN YÖN · HEDEF DOĞRULTU</span><strong>'+m.bearing.toLocaleString('tr-TR')+'°</strong><small>gerçek kuzeyden saat yönünde · '+escHtml(m.direction)+'</small></div><div><span>KÂBE MESAFESİ</span><strong>'+m.distanceKm.toLocaleString('tr-TR')+' km</strong><small>'+escHtml(loc.cityName||'Konum')+' merkezli</small></div></div>';
  h+='<div class="qibla-v2-stage">';
  h+='<div class="qibla-v2-dial" aria-label="Kıble yönü '+m.bearing+' derece"><span class="cardinal n">K</span><span class="cardinal e">D</span><span class="cardinal s">G</span><span class="cardinal w">B</span><span class="qibla-v2-ticks"></span>';
  h+='<span id="qibla-live-needle" class="qibla-v2-needle'+(m.hasHeading?'':' is-idle')+'" role="img" aria-label="Kıble doğrultusu; canlı hizalama durumu aşağıdaki kartta" style="transform:rotate('+m.relative+'deg)"><i class="tip">'+iconHtml('navigation',25)+'</i><i class="shaft"></i><b>KÂBE</b></span>';
  h+='<span class="qibla-v2-center"><i></i></span></div>';
  h+='<div id="qibla-live-status" class="qibla-v2-alignment '+align.state+'"><span class="signal">'+iconHtml(align.state==='aligned'?'circle-check':'navigation',16)+'</span><div><strong>'+escHtml(align.title)+'</strong><small>'+escHtml(align.detail)+'</small></div></div>';
  h+='</div>';
  h+='<div class="qibla-v2-readings"><div><span>CİHAZ YÖNÜ</span><strong id="qibla-live-heading">'+(m.hasHeading?(((Number(u.qiblaHeading)%360+360)%360).toFixed(1).replace('.',',')+'°'):'—')+'</strong><small id="qibla-live-sensor">'+escHtml(sensor)+'</small></div><div><span>KONUM HASSASİYETİ</span><strong>'+escHtml(qiblaLocationPrecision(m))+'</strong><small>'+(m.isFallback?'GPS ile doğrula':(+loc.lat).toFixed(4)+', '+(+loc.lon).toFixed(4))+'</small></div></div>';
  if(u.qiblaSensorError) h+='<div id="qibla-live-error" class="qibla-v2-error" role="alert">'+iconHtml('triangle-alert',15)+'<span>'+escHtml(u.qiblaSensorError)+'</span></div>'; else h+='<div id="qibla-live-error" class="qibla-v2-error" role="alert" hidden></div>';
  h+='<div class="qibla-v2-actions"><button class="location" onclick="App.fetchPrayerLocationGPS()">'+iconHtml('map-pin',16)+'<span><b>GPS’i yenile</b><small>Yüksek hassasiyetli konum</small></span></button><button id="qibla-sensor-button" class="sensor '+(u.qiblaListening?'on':'')+'" onclick="App.enableQiblaCompass()">'+iconHtml('compass',16)+'<span><b>'+(u.qiblaListening?'Pusula açık':'Canlı pusulayı aç')+'</b><small>'+(u.qiblaListening?'Telefonu düz tut':'Sensör izni gerekir')+'</small></span></button></div>';
  h+='<aside class="sg-tool-meta qibla-v2-method"><div class="sg-tool-meta-head"><span>'+iconHtml('info',14)+'</span><div><strong>Hesap ve sensör sınırları</strong><small>Hedef doğrultu ile cihaz okuması aynı şey değildir.</small></div></div><p>Kâbe koordinatı 21,4225° K · 39,8262° D alınır. Hedef, coğrafi kuzeye göre büyük-daire başlangıç azimutudur. Telefon pusulası metal, mıknatıs, elektronik cihazlar ve manyetik sapmadan etkilenebilir; telefonu sekiz çizerek kalibre et ve kılıftaki mıknatıslardan uzaklaştır.</p></aside>';
  h+='</div></section></div>';
  return h;
}
  function saygiPreviewHubHTML(person,article,done){var u=stateUi()||{},tab=u.faithTab||'oz',body='';if(!zikrVisible()&&tab==='zikir'){tab='oz';u.faithTab='oz';}if(tab==='oncu')body=saygiPreviewCardHTML(person,done,article)+saygiCollectionCardHTML(person);else if(tab==='iman')body=faithCornerCardHTML()+'<section class="iip-09-route-rail" aria-label="İbadet araçları">'+qiblaHubCardHTML()+'</section>';else if(tab==='zikir'&&zikrVisible())body=zikrPreview();else if(tab==='rapor')body=faithRaporCardHTML();else body=saygiDailyFocusHTML()+'<section class="iip-09-route-rail" aria-label="Bugün girişleri">'+quranHub()+'</section><section class="iip-09-today-continue" aria-label="Bugün · Kaldığın yer">'+(zikrVisible()?zikrPreview():'')+'</section>'+saygiContinueHTML();return '<div class="saygi-preview-hub iip-09-section iip-09-section-'+tab+'" data-faith-tab="'+escHtml(tab)+'">'+body+'</div>';}
  function faithNavHTML(){var tabs=zikrVisible()?[['oz','Bugün','Öz'],['oncu','İlham','Öncü'],['iman','İbadet','İman'],['zikir','Zikir','Zikir'],['rapor','Ritim','Rapor']]:[['oz','Bugün','Öz'],['oncu','İlham','Öncü'],['iman','İbadet','İman'],['rapor','Ritim','Rapor']],u=stateUi()||{},tab=u.faithTab||'oz',icons={oz:'sun',oncu:'trophy',iman:'mosque',zikir:'sparkles',rapor:'chart-column'},h='<nav class="faith-v2-nav" aria-label="İlham ve İbadet bölümleri">';tabs.forEach(function(x){var on=x[0]===tab;h+='<button class="'+(on?'on':'')+'" data-legacy-label="'+x[2]+'" onclick="App.setFaithTab(\''+x[0]+'\')" aria-current="'+(on?'page':'false')+'" aria-pressed="'+(on?'true':'false')+'"><span>'+iconHtml(icons[x[0]]||'circle',16)+'</span><b>'+x[1]+'</b></button>';});return h+'</nav>';}
  function saygiHTML(){if(!featureLive())return saygiComingSoonHTML();var person=saygiCurrentPerson();if(!person)return '<div class="saygi-empty">'+iconHtml('triangle-alert',24)+' Saygı seçkisi yüklenemedi.</div>';var u=stateUi()||{};if(!u.saygiPersonOpen)saygiEnsureArticle(person);var article=(!u.saygiPersonOpen&&u.saygiArticle&&u.saygiArticle.personId===person.id)?u.saygiArticle:null,done=saygiHasRead(person);return '<section class="saygi-page">'+faithNavHTML()+spiritBarHTML()+saygiPreviewHubHTML(person,article,done)+'</section>';}
  function saygiHeroMediaHTML(article){var title=String(article&&article.title||'Günün öncüsü'),thumb=saygiSafeUrl(article&&article.thumbnail,['upload.wikimedia.org']);if(!thumb)return '<div class="saygi-hero-media is-empty" role="img" aria-label="'+escHtml(title)+' portresi yok"><span class="saygi-hero-media-fallback is-visible" aria-hidden="true">'+iconHtml('image',30)+'<strong>Portre yok</strong><small>Metinli okuma devam ediyor</small></span></div>';return '<div class="saygi-hero-media"><img src="'+escHtml(thumb)+'" alt="'+escHtml(title)+' portresi" loading="eager" referrerpolicy="no-referrer" onerror="this.hidden=true;this.parentElement.classList.add(\'is-broken\');"><span class="saygi-hero-media-caption">Görsel · Wikipedia</span><span class="saygi-hero-media-fallback" aria-hidden="true">'+iconHtml('image',30)+'<strong>Portre yüklenemedi</strong><small>Metinli okuma devam ediyor</small></span></div>';}
  function saygiArticleBodyHTML(person,article,done,wrapCls,includeReadAction){var heroLead=article.lead,first=article.blocks&&article.blocks[0];if(first&&heroLead&&first.text.slice(0,90)===heroLead.slice(0,90))heroLead='';var dir=saygiReadingDirection(article),scale=saygiScalePercent(),suffix=article.suffix||'';
    var h='<article class="'+(wrapCls||'saygi-article')+'" dir="'+dir+'" lang="'+(article.lang||'tr')+'" data-saygi-scale="'+scale+'" style="--saygi-scale:'+(scale/100).toFixed(2)+';">'+
      '<header class="saygi-hero">'+saygiHeroMediaHTML(article)+'<div class="saygi-hero-copy"><div class="saygi-tags"><span>'+escHtml(person.kind)+'</span><span>'+escHtml(person.era)+'</span>'+(article.rtl?'<span class="saygi-dir-tag">'+escHtml(saygiDirectionLabel(article))+'</span>':'')+'</div><h2>'+escHtml(article.title)+'</h2><div class="saygi-discipline">'+iconHtml(person.kind==='Bilim'?'microscope':'feather',15)+' '+escHtml(person.field)+'</div>'+(article.description?'<p class="saygi-description">'+escHtml(article.description)+'</p>':'')+(heroLead?'<p class="saygi-lead">'+escHtml(heroLead)+'</p>':'')+'<div class="saygi-meta"><span>'+iconHtml('clock',13)+' yaklaşık '+saygiReadMinutes(article)+' dk</span><span>'+iconHtml('book-open',13)+' '+(article.lang==='tr'?'Türkçe Wikipedia':'English Wikipedia')+'</span></div></div></header>'+
      saygiSectionSkipHTML(article,person,suffix)+
      '<div class="saygi-biography">';
    article.blocks.forEach(function(block,i){if(!block||!block.text)return;var id=saygiAnchorId(person,i);
      if(block.type==='h')h+='<h3 id="'+escHtml(id)+'" tabindex="-1">'+escHtml(block.text)+'</h3>';
      else if(block.type==='list')h+='<div id="'+escHtml(id)+'" class="saygi-list-block">'+iconHtml('sparkles',14)+'<span>'+escHtml(block.text)+'</span></div>';
      else h+='<p id="'+escHtml(id)+'">'+escHtml(block.text)+'</p>';});
    h+='</div><section class="saygi-sources"><div class="saygi-section-title"><span>'+iconHtml('link-2',16)+'</span><div><strong>Kaynakta daha derine in</strong><small>Wikipedia maddesi ve maddede yer alan seçili dış bağlantılar</small></div></div><div class="saygi-source-grid">'+saygiSourceCardHTML(article,null,true);(article.links||[]).forEach(function(link){h+=saygiSourceCardHTML(article,link,false);});return h+'</div></section><footer class="saygi-attribution"><span class="saygi-attribution-icon" aria-hidden="true">'+iconHtml('file-text',13)+'</span><span class="saygi-attribution-copy"><strong>Kaynak ve lisans</strong><span>Metin <a href="'+escHtml(article.sourceUrl)+'" target="_blank" rel="noopener noreferrer">Wikipedia katkıda bulunanlarından</a> alınır; '+escHtml(article.licenseTitle)+' lisansı ile paylaşılır.</span></span><a href="'+escHtml(article.licenseUrl)+'" target="_blank" rel="noopener noreferrer" aria-label="Lisans ayrıntısı">'+iconHtml('external-link',13)+'</a></footer>'+
      saygiA11yAltHTML(suffix,done)+
      (includeReadAction!==false?saygiReadButtonHTML(person,done,suffix):'')+'</article>';}

  // ── IIP-11 · bölüm atlama (varsa) ──
  // Bölüm yoksa (tek bloklu kısa metin) hiç çizilmez: boş bir araç çubuğu göstermek
  // kullanıcıyı yanıltırdı.
  function saygiSectionSkipHTML(article,person,suffix){
    var sections=saygiSections(article,person);
    if(!sections.length) return '';
    var opts='';
    for(var i=0;i<sections.length;i++) opts+='<option value="'+escHtml(sections[i].anchorId)+'">'+sections[i].number+'. '+escHtml(sections[i].label)+'</option>';
    return '<div class="saygi-skip">'+
      '<label class="saygi-skip-label" for="saygi-skip-select'+suffix+'">'+iconHtml('route',14)+' Bölüme atla</label>'+
      '<select id="saygi-skip-select'+suffix+'" class="saygi-skip-select" onchange="App.saygiReader(\'goto\',this.value)">'+
        '<option value="">Bölüm seç…</option>'+opts+
      '</select></div>';
  }
  // ── IIP-11 · Aa aracı ve başa dön (ayrı eylemler) ──
  // Aa ile "başa dön" birleştirilmez: biri metin ölçeği, diğeri konumdur.
  function saygiScaleToolHTML(){
    var pct=saygiScalePercent(), isDefault=saygiScaleIsDefault();
    return '<div class="saygi-aa" role="group" aria-label="Yazı boyutu">'+
      '<button type="button" id="saygi-scale-down" class="saygi-aa-btn" onclick="App.saygiReader(\'scale\',\'down\')" aria-label="Yazıyı küçült"'+(pct<=100?' disabled':'')+'>A−</button>'+
      '<span id="saygi-scale-value" class="saygi-aa-value" aria-live="polite">'+pct+'%</span>'+
      '<button type="button" id="saygi-scale-up" class="saygi-aa-btn" onclick="App.saygiReader(\'scale\',\'up\')" aria-label="Yazıyı büyüt"'+(pct>=160?' disabled':'')+'>A+</button>'+
      (isDefault?'':'<button type="button" id="saygi-scale-reset" class="saygi-aa-reset" onclick="App.saygiReader(\'reset\')" aria-label="Varsayılan yazı boyutuna dön">↺</button>')+
    '</div>';
  }
  function saygiTopButtonHTML(){
    return '<button type="button" id="saygi-top-btn" class="saygi-top-btn" onclick="App.saygiReader(\'top\')" aria-label="Başa dön">'+iconHtml('chevron-up',15)+'</button>';
  }
  function saygiScaleTool(){ return saygiScaleToolHTML(); }

  function saygiPersonModalHTML(){var u=stateUi()||{},person=saygiModalPerson();if(!person)return '';var article=(u.saygiArticle&&u.saygiArticle.personId===person.id)?u.saygiArticle:null,done=saygiHasRead(person),people=saygiPeople(),personIndex=people.findIndex(function(x){return x.id===person.id;}),head='<div class="sg-person-ov-head"><div><div class="sg-person-ov-title"><span>'+iconHtml('trophy',16)+'</span>'+escHtml(person.name)+'</div><small class="sg-person-ov-count">'+(personIndex+1)+' / '+people.length+' · Öncü koleksiyonu</small></div><div class="sg-person-ov-nav">'+saygiScaleToolHTML()+saygiTopButtonHTML()+'<button onclick="App.browseSaygiPerson(-1)" aria-label="Önceki öncü">‹</button><button onclick="App.browseSaygiPerson(1)" aria-label="Sonraki öncü">›</button><button onclick="App.closeSaygiPerson()" aria-label="Kapat">'+iconHtml('x',16)+'</button></div></div>',body='';if(u.saygiLoading||!article){body+='<div style="padding:18px 4px;">';if(u.saygiLoading)body+=saygiLoadingHTML();else body+='<div class="saygi-error"><span>'+iconHtml('cloud-rain',22)+'</span><div><strong>Bugünün kaynağına ulaşamadık.</strong><p>'+escHtml(u.saygiError||'Birazdan yeniden deneyebilirsin.')+'</p><div class="saygi-error-actions"><button onclick="App.refreshSaygi()">'+iconHtml('rotate-ccw',14)+' Yeniden dene</button><a href="'+escHtml(saygiSourceFallback(person))+'" target="_blank" rel="noopener noreferrer">Wikipedia’da aç '+iconHtml('external-link',13)+'</a></div></div></div>';body+='</div>';}else{article=Object.create(article);article.suffix='-modal';body+='<div id="saygi-reader-region">'+saygiArticleBodyHTML(person,article,done,'saygi-article-modal',false)+'</div>';body+='<div id="saygi-read-sentinel-modal" class="saygi-read-sentinel" aria-hidden="true"></div>';}return '<div id="sey-ov-back" class="sg-person-ov-back" onclick="App.closeSaygiPerson()" style="position:fixed;inset:0;z-index:340;background:rgba(44,36,38,0.45);display:flex;align-items:flex-end;justify-content:center;padding:14px;"><div id="sey-ov-card" class="sg-person-ov-card" role="dialog" aria-modal="true" aria-label="Günün öncüsü" tabindex="-1" onkeydown="App.onModalKeydown(event,App.closeSaygiPerson)" onclick="event.stopPropagation()" style="position:relative;width:100%;max-width:520px;height:92vh;max-height:900px;background:var(--modal);border-radius:28px;padding:0;box-shadow:0 -12px 50px rgba(0,0,0,0.22);display:flex;flex-direction:column;overflow:hidden;"><div style="flex-shrink:0;padding:14px 18px 12px;border-bottom:1px solid var(--card-bd);">'+head+'</div><div id="sey-ov-body" class="sg-person-ov-body scroll" style="flex:1;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:14px;">'+body+'</div></div></div>';}
  function saygiFloatingReadHTML(){var person=saygiModalPerson();if(!person)return '';var u=stateUi()||{},article=u.saygiArticle&&u.saygiArticle.personId===person.id?u.saygiArticle:null,done=saygiHasRead(person),ready=!!u.saygiReadReady,disabled=!done&&(!article||!ready),sub=done?'Ne okudum kaydını aç':(!article?(u.saygiLoading?'Biyografi hazırlanıyor':'Biyografi yüklenince açılır'):(ready?'Bugünün kaydına ekle':'Yazının sonuna inince açılır'));return '<!-- z-index:2147483640!important -->'+'<button id="saygi-read-button-modal" class="sg-person-read-fab'+(done?' is-done':(ready?' is-ready':' is-locked'))+'" '+(disabled?'disabled':'')+' aria-describedby="saygi-read-sub-modal" onclick="'+(done?'App.openSaygiReading()':'App.markSaygiRead()')+'"><span class="saygi-read-button-icon">'+iconHtml(done?'circle-check':'book-open',20)+'</span><span><strong data-saygi-read-copy>Okudum</strong><small id="saygi-read-sub-modal" data-saygi-read-sub>'+escHtml(sub)+'</small></span></button>';}
  function saygiUnlockReadButton(btn){var u=stateUi()||{};if(!btn||btn.disabled===false&&u.saygiReadReady)return;u.saygiReadReady=true;btn.disabled=false;btn.classList.remove('is-locked');btn.classList.add('is-ready');var copy=btn.querySelector('[data-saygi-read-copy]'),sub=btn.querySelector('[data-saygi-read-sub]');if(copy)copy.textContent='Okudum';if(sub)sub.textContent='Bugünün kaydına ekle';var ic=btn.querySelector('.saygi-read-button-icon');if(ic)ic.innerHTML=iconHtml('circle-check',19);}
  function saygiDisconnectReadObserver(){if(saygiReadObserver){try{saygiReadObserver.disconnect();}catch(e){}saygiReadObserver=null;}}
  function wireSaygiReadGate(sc,suffix){if(!sc)return;suffix=suffix||'';var person=suffix==='-modal'?saygiModalPerson():saygiCurrentPerson(),btn=document.getElementById('saygi-read-button'+suffix),sentinel=document.getElementById('saygi-read-sentinel'+suffix);if(!person||!btn||!sentinel||saygiHasRead(person))return;function unlock(){saygiUnlockReadButton(btn);saygiDisconnectReadObserver();}if(sc.scrollHeight<=sc.clientHeight+32){unlock();return;}if(window.IntersectionObserver){saygiReadObserver=new window.IntersectionObserver(function(entries){for(var i=0;i<entries.length;i++)if(entries[i].isIntersecting){unlock();break;}},{root:sc,threshold:.72});saygiReadObserver.observe(sentinel);}else{var onScroll=function(){if(sc.scrollTop+sc.clientHeight>=sc.scrollHeight-28){sc.removeEventListener('scroll',onScroll);unlock();}};sc.addEventListener('scroll',onScroll,{passive:true});onScroll();}}

  window.SeymaSaygi={
    registerSaygi:registerSaygi,SAYGI_EPOCH:SAYGI_EPOCH,SAYGI_CACHE_PREFIX:SAYGI_CACHE_PREFIX,
    emptySaygiRoot:emptySaygiRoot,ensureSaygiRoot:ensureSaygiRoot,emptySaygi:emptySaygi,ensureSaygiDay:ensureSaygiDay,saygiMarkRead:saygiMarkRead,
    saygiCollection:saygiCollection,saygiReadCount:saygiReadCount,saygiStreak:saygiStreak,saygiPeople:saygiPeople,saygiPositiveMod:saygiPositiveMod,
    saygiPersonForDate:saygiPersonForDate,saygiCurrentPerson:saygiCurrentPerson,saygiPersonById:saygiPersonById,saygiModalPerson:saygiModalPerson,saygiDayKey:saygiDayKey,
    saygiCacheKey:saygiCacheKey,saygiReadCache:saygiReadCache,saygiWriteCache:saygiWriteCache,saygiSafeUrl:saygiSafeUrl,saygiFetchJSON:saygiFetchJSON,
    saygiSummaryUrl:saygiSummaryUrl,saygiHtmlUrl:saygiHtmlUrl,saygiFetchSummary:saygiFetchSummary,saygiLoadSummary:saygiLoadSummary,saygiPlainText:saygiPlainText,
    saygiStopHeading:saygiStopHeading,saygiBioBlocks:saygiBioBlocks,saygiExternalLinks:saygiExternalLinks,saygiArticleFrom:saygiArticleFrom,
    saygiArticleReadableFor:saygiArticleReadableFor,saygiRequestIsCurrent:saygiRequestIsCurrent,saygiLoadArticle:saygiLoadArticle,saygiEnsureArticle:saygiEnsureArticle,
    saygiReadMinutes:saygiReadMinutes,saygiReadingEntry:saygiReadingEntry,saygiHasRead:saygiHasRead,saygiDomainTone:saygiDomainTone,
    saygiFold:saygiFold,saygiNormalize:saygiNormalize,saygiQueryTooShort:saygiQueryTooShort,saygiFieldTokens:saygiFieldTokens,saygiIndex:saygiIndex,
    saygiQuery:saygiQuery,saygiFilter:saygiFilter,saygiReadFilter:saygiReadFilter,saygiFilterSummary:saygiFilterSummary,saygiLens:saygiLens,
    saygiPersonRowHTML:saygiPersonRowHTML,saygiPersonListHTML:saygiPersonListHTML,saygiPersonListFooterHTML:saygiPersonListFooterHTML,
    saygiResultCountHTML:saygiResultCountHTML,saygiResultCountText:saygiResultCountText,saygiSearchControlsHTML:saygiSearchControlsHTML,saygiSearchEmptyHTML:saygiSearchEmptyHTML,saygiFilteredResultsHTML:saygiFilteredResultsHTML,
    saygiCollectionGridHTML:saygiCollectionGridHTML,
    saygiScaleSteps:SAYGI_SCALE_STEPS,saygiScaleIndex:saygiScaleIndex,saygiScalePercent:saygiScalePercent,saygiScaleLabel:saygiScaleLabel,saygiScaleIsDefault:saygiScaleIsDefault,
    saygiAnchorId:saygiAnchorId,saygiBlockAnchors:saygiBlockAnchors,saygiSections:saygiSections,saygiHasSections:saygiHasSections,saygiFirstHeadingAnchor:saygiFirstHeadingAnchor,
    saygiSectionSkipHTML:saygiSectionSkipHTML,saygiPosition:saygiPosition,saygiHasPosition:saygiHasPosition,saygiRememberPosition:saygiRememberPosition,saygiClearPosition:saygiClearPosition,
    saygiIsRtl:saygiIsRtl,saygiReadingDirection:saygiReadingDirection,saygiDirectionLabel:saygiDirectionLabel,saygiA11yAlternativeOn:saygiA11yAlternativeOn,saygiA11yAltHTML:saygiA11yAltHTML,
    saygiScaleToolHTML:saygiScaleToolHTML,saygiTopButtonHTML:saygiTopButtonHTML,
    faithWeekKPIs:faithWeekKPIs,faithDayHeat:faithDayHeat,qiblaBearing:qiblaBearing,qiblaDistanceKm:qiblaDistanceKm,qiblaDirectionLabel:qiblaDirectionLabel,
    qiblaMetrics:qiblaMetrics,qiblaLocationPrecision:qiblaLocationPrecision,qiblaAlignmentCopy:qiblaAlignmentCopy,qiblaScreenAngle:qiblaScreenAngle,qiblaOverlayHTML:qiblaOverlayHTML,
    saygiDailyFocus:saygiDailyFocus,saygiDailyFocusHTML:saygiDailyFocusHTML,saygiContinueRows:saygiContinueRows,saygiContinueHTML:saygiContinueHTML,
    saygiSourceFallback:saygiSourceFallback,saygiSourceCardHTML:saygiSourceCardHTML,saygiReadButtonHTML:saygiReadButtonHTML,saygiReadActionHTML:saygiReadActionHTML,
    saygiLoadingHTML:saygiLoadingHTML,saygiComingSoonHTML:saygiComingSoonHTML,faithSummaryBadges:faithSummaryBadges,faithCornerCardHTML:faithCornerCardHTML,
    saygiPreviewCardHTML:saygiPreviewCardHTML,saygiMissionCardHTML:saygiMissionCardHTML,faithCornerInlineHTML:faithCornerInlineHTML,prayerRowHTML:prayerRowHTML,
    hijriTodayStr:hijriTodayStr,kandilBadgeFor:kandilBadgeFor,spiritBarHTML:spiritBarHTML,faithCornerOverlayHTML:faithCornerOverlayHTML,
    saygiCollectionCardHTML:saygiCollectionCardHTML,faithAnnualHeatmapHTML:faithAnnualHeatmapHTML,faithRaporCardHTML:faithRaporCardHTML,qiblaHubCardHTML:qiblaHubCardHTML,
    saygiPreviewHubHTML:saygiPreviewHubHTML,faithNavHTML:faithNavHTML,saygiHTML:saygiHTML,saygiArticleBodyHTML:saygiArticleBodyHTML,saygiPersonModalHTML:saygiPersonModalHTML,
    saygiFloatingReadHTML:saygiFloatingReadHTML,saygiUnlockReadButton:saygiUnlockReadButton,wireSaygiReadGate:wireSaygiReadGate,saygiDisconnectReadObserver:saygiDisconnectReadObserver
  };
})();
