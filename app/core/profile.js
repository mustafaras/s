// MON-36 · profile domain registry.
// Frozen assessment content is read-only; App mutation, panel projection, sync merge
// and data/schema ownership remain in app.js.
(function(){
  'use strict';

  var profileDeps=null;
  var PROFILE_DEPENDENCIES=['data','ui','save','icon','esc'];
  var PROFILE_MEMBERS=['emptyProfileAssessment','profileAssessmentItems','profileAssessmentComputeCurrentIndex','ensureProfileAssessment','profileConsentChecks','profileConsentMandatoryOk','profileConsentRow','renderProfileConsent','profileAssessmentModuleForOrder','profileItemDisplayIndex','renderProfileItem','profileAssessmentPendingBreak','renderProfileBreak','renderProfileAssessmentSOS','renderProfileAssessmentGate','renderProfileCompletion','scoreProfileItem','scoreProfileFacet','scoreProfileConstruct','scoreRiasec','scoreValues','scoreAttachment','scoreProfileAssessment','profileAssessmentQualityCategory','scoreProfileAssessmentQuality','profileBand','profileBandLabel','profileConstructSentence','profileAssessmentContradictionNotes','buildProfileReport'];

  function registerProfile(deps){
    if(profileDeps||!deps||typeof deps!=='object'||Array.isArray(deps)) return false;
    for(var i=0;i<PROFILE_DEPENDENCIES.length;i++) if(typeof deps[PROFILE_DEPENDENCIES[i]]!=='function') return false;
    profileDeps=deps;
    return true;
  }
  function dep(name){ return profileDeps&&typeof profileDeps[name]==='function'?profileDeps[name]:null; }
  function call(name,args){ var f=dep(name); if(f) return f.apply(null,args||[]); throw new Error('SeymaProfile: çözümlenemeyen bağımlılık '+name); }
  function liveData(){ return call('data',[]); }
  function liveUi(){ return call('ui',[]); }
  function save(){ return call('save',arguments); }
  function icon(){ return call('icon',arguments); }
  function esc(){ return call('esc',arguments); }

// ---------- Profil Değerlendirmesi: veri modeli ve migration (Faz 03) ----------
// Tek seferlik, 174 maddelik bilimsel profil değerlendirmesi (bkz. profileAssessmentV1.js).
// liveData().psych'ten (iki haftada bir tekrarlanan öz-bildirim taraması) TAMAMEN AYRI bir alan
// ve isim uzayı — liveData().psych'e burada hiçbir şekilde dokunulmaz. Bu fazda yalnızca veri
// modeli/migration var; henüz UI, gate veya render entegrasyonu yok.
function emptyProfileAssessment(){
  return {
    schemaVersion:2,
    instrumentVersion:(window.ProfileAssessmentV1&&window.ProfileAssessmentV1.version)||'1.0.0',
    deliveryMode:'single_session',
    status:'not_started',
    startedAt:null,
    completedAt:null,
    currentItemIndex:0,
    consent:{
      version:null,
      informationShownAt:null,
      acceptedAt:null,
      profileProcessingAccepted:false,
      sensitiveDataAccepted:false,
      panelSummarySharingAccepted:false
    },
    responses:{},
    moduleProgress:{},
    scores:{},
    quality:{},
    report:{},
    panelSummary:{}
  };
}
// Soru bankasının tek oturumluk global madde listesi (yüklenmediyse boş dizi — çağıranlar
// bunu bilerek kontrol eder, hiçbir yerde varlığı varsayılmaz).
function profileAssessmentItems(){
  try{ return (window.ProfileAssessmentV1&&window.ProfileAssessmentV1.sessions&&window.ProfileAssessmentV1.sessions[0]&&window.ProfileAssessmentV1.sessions[0].items)||[]; }catch(e){ return []; }
}
// Global sırada (1..174) ilk cevaplanmamış maddenin 0-index konumunu döndürür;
// tüm maddeler cevaplanmışsa madde sayısını (tamamlanmış konum) döndürür.
function profileAssessmentComputeCurrentIndex(responses){
  var items=profileAssessmentItems();
  if(!items.length) return 0;
  responses=(responses&&typeof responses==='object')?responses:{};
  for(var i=0;i<items.length;i++){
    var r=responses[items[i].id];
    if(!r||typeof r!=='object'||typeof r.value!=='number') return i;
  }
  return items.length;
}
// d.profileAssessment'ı ensure eder: yoksa taze oluşturur, varsa eksik nested alanları
// tek tek backfill eder (var olan değerleri EZMEZ). Eski (tek-oturum öncesi, "üç günlük
// beta") bir kayıt bulursa schemaVersion/deliveryMode'u yükseltir; schedule/currentDay/
// nextSessionId/sessions gibi artık kullanılmayan alanları SİLMEZ (bilinmeyen eski veri
// alanı silinmez kuralı), yalnızca bundan sonra hiçbir mantıkta okumaz — tek doğru kaynak
// itemId anahtarlı `responses` olur. Saf ve headless test edilebilir: yalnızca kendisine
// verilen `d` üzerinde çalışır, global `liveData()`'ya dokunmaz.
function ensureProfileAssessment(d){
  if(!d||typeof d!=='object') return null;
  if(!d.profileAssessment||typeof d.profileAssessment!=='object'){
    d.profileAssessment=emptyProfileAssessment();
    return d.profileAssessment;
  }
  var pa=d.profileAssessment;
  if(typeof pa.schemaVersion!=='number'||pa.schemaVersion<2){
    pa.schemaVersion=2;
    pa.deliveryMode='single_session';
  }
  if(typeof pa.instrumentVersion!=='string') pa.instrumentVersion=(window.ProfileAssessmentV1&&window.ProfileAssessmentV1.version)||'1.0.0';
  if(pa.deliveryMode!=='single_session') pa.deliveryMode='single_session';
  if(typeof pa.status!=='string') pa.status='not_started';
  if(typeof pa.startedAt!=='string'&&pa.startedAt!==null) pa.startedAt=null;
  if(typeof pa.completedAt!=='string'&&pa.completedAt!==null) pa.completedAt=null;
  if(!pa.responses||typeof pa.responses!=='object') pa.responses={};
  if(!pa.moduleProgress||typeof pa.moduleProgress!=='object') pa.moduleProgress={};
  if(!pa.scores||typeof pa.scores!=='object') pa.scores={};
  if(!pa.quality||typeof pa.quality!=='object') pa.quality={};
  if(!pa.report||typeof pa.report!=='object') pa.report={};
  if(!pa.panelSummary||typeof pa.panelSummary!=='object') pa.panelSummary={};
  if(!pa.consent||typeof pa.consent!=='object') pa.consent={};
  if(typeof pa.consent.version!=='string'&&pa.consent.version!==null) pa.consent.version=null;
  if(typeof pa.consent.informationShownAt!=='string'&&pa.consent.informationShownAt!==null) pa.consent.informationShownAt=null;
  if(typeof pa.consent.acceptedAt!=='string'&&pa.consent.acceptedAt!==null) pa.consent.acceptedAt=null;
  if(typeof pa.consent.profileProcessingAccepted!=='boolean') pa.consent.profileProcessingAccepted=false;
  if(typeof pa.consent.sensitiveDataAccepted!=='boolean') pa.consent.sensitiveDataAccepted=false;
  if(typeof pa.consent.panelSummarySharingAccepted!=='boolean') pa.consent.panelSummarySharingAccepted=false;
  var items=profileAssessmentItems();
  if(typeof pa.currentItemIndex!=='number'||isNaN(pa.currentItemIndex)||pa.currentItemIndex<0) pa.currentItemIndex=0;
  if(items.length){
    // Cevaplar tek doğru kaynak: soru bankası yüklüyse konum/duruma her zaman ondan
    // yeniden hesaplanır (eski schedule/currentDay/nextSessionId hiç okunmaz).
    var computedIndex=profileAssessmentComputeCurrentIndex(pa.responses);
    pa.currentItemIndex=computedIndex;
    if(computedIndex>=items.length){ if(pa.status!=='completed') pa.status='completed'; }
    else if(pa.status==='completed'){ pa.status='active'; } // tutarsızlık (ör. banka değişti) — veri kaybı yaratmadan düzelt
  }
  return pa;
}

// ---------- Profil Değerlendirmesi: bilgilendirme + açık rıza (Faz 04) ----------
// Faz 05'ten itibaren render()'daki ana uygulama kilidinin İLK adımı budur (rıza
// verilmemişse önce bu ekran gösterilir). `liveData().psych`'in kendi (artık pasif) rıza/
// SOS akışından tamamen ayrı: isim uzayı hiç kesişmiyor (liveUi().profileConsent*,
// App.profile*), liveData().psych'e dokunulmuyor.
var PROFILE_CONSENT_VERSION='1.0.0';
var PROFILE_CONSENT_ITEMS=[
  {ic:'target',t:'Toplam 174 kısa madde, her ekranda yalnızca bir tanesi gösterilir.'},
  {ic:'clock',t:'Tahmini süre 22–35 dakika.'},
  {ic:'lock',t:'Tamamlanmadan ana uygulamaya geçilemez.'},
  {ic:'save',t:'Uygulamayı kapatırsan ilerlemen korunur; kaldığın yerden devam edersin.'},
  {ic:'stethoscope',t:'Sonuçlar klinik bir tanı değildir, öz-bildirime dayalı bir profildir.'},
  {ic:'heart-handshake',t:'İlişki ve iyi oluşla ilgili bazı maddeler hassastır.'},
  {ic:'cloud',t:'Verilerin, mevcut yedekleme akışınla (sync.js) seyma-data reposuna senkronize edilir.'}
];
function profileConsentChecks(){
  if(!liveUi().profileConsent||typeof liveUi().profileConsent!=='object') liveUi().profileConsent={read:false,processing:false,sensitive:false,notDiagnosis:false};
  return liveUi().profileConsent;
}
function profileConsentMandatoryOk(c){ return !!(c&&c.read&&c.processing&&c.sensitive&&c.notDiagnosis); }
function profileConsentRow(key,label,checked){
  return '<button onclick="App.profileConsentToggle(\''+key+'\')" style="display:flex;align-items:flex-start;gap:11px;width:100%;text-align:left;border:none;text-align:left;padding:12px 13px;border-radius:15px;cursor:pointer;transition:all .18s;'+(checked?'background:color-mix(in srgb,#C9B8FF 12%, var(--card));border:1px solid #C9B8FF;':'background:var(--card);border:1px solid var(--card-bd);')+'">'
    +'<span style="width:22px;height:22px;border-radius:7px;flex-shrink:0;display:flex;align-items:center;justify-content:center;margin-top:1px;color:#fff;background:'+(checked?'linear-gradient(135deg,#E9899F,#C9B8FF)':'transparent')+';border:'+(checked?'none':'2px solid var(--field-bd)')+';">'+(checked?icon('check',13):'')+'</span>'
    +'<span style="flex:1;font-size:var(--f-footnote);line-height:1.45;color:var(--text);font-weight:600;">'+label+'</span></button>';
}
function renderProfileConsent(){
  ensureProfileAssessment(liveData());
  var pa=liveData().profileAssessment;
  if(!pa.consent.informationShownAt){ pa.consent.informationShownAt=new Date().toISOString(); save(); }
  var c=profileConsentChecks();
  var mandatoryOk=profileConsentMandatoryOk(c);
  var h='<div style="position:relative;flex:1;min-height:0;display:flex;flex-direction:column;background:var(--bg);">';
  h+='<div data-scroll class="scroll" style="flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:calc(env(safe-area-inset-top) + 22px) 20px calc(env(safe-area-inset-bottom) + 20px);display:flex;flex-direction:column;gap:16px;">';
  h+='<div style="display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;">';
  h+='<div style="display:flex;align-items:center;gap:9px;">';
  h+='<div style="width:64px;height:64px;border-radius:22px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#F4DCA0,#E9AEC6 52%,#CBB8FF);box-shadow:0 14px 30px rgba(233,137,159,0.3);">'+icon('brain',30)+'</div>';
  h+='<div style="width:64px;height:64px;border-radius:22px;display:flex;align-items:center;justify-content:center;background:linear-gradient(145deg,#FFFFFF,#E9E9EF);border:1px solid rgba(0,0,0,0.06);box-shadow:0 14px 30px rgba(0,0,0,0.16),inset 0 1px 0 #fff;"><span style="font-family:-apple-system,system-ui,\'Segoe UI\',sans-serif;font-size:var(--f-footnote);font-weight:850;letter-spacing:1.2px;color:#101017;">ÆON</span></div>';
  h+='</div>';
  h+='<h1 style="margin:0;font-size:var(--f-title2);font-weight:800;color:var(--text);">Bilimsel Profil Değerlendirmesi</h1>';
  h+='<p style="margin:0;font-size:var(--f-subhead);line-height:1.55;color:var(--muted);max-width:360px;">Başlamadan önce ne olduğunu ve verilerinin ne olacağını kısaca anlatalım.</p>';
  h+='</div>';
  h+='<div class="surface" style="border-radius:20px;padding:6px 4px;display:flex;flex-direction:column;">';
  PROFILE_CONSENT_ITEMS.forEach(function(it,i){
    h+='<div style="display:flex;align-items:flex-start;gap:11px;padding:11px 12px;'+(i<PROFILE_CONSENT_ITEMS.length-1?'border-bottom:1px solid var(--card-bd);':'')+'"><span style="flex-shrink:0;color:var(--muted);margin-top:1px;">'+icon(it.ic,17)+'</span><span style="font-size:var(--f-subhead);line-height:1.5;color:var(--text2);">'+it.t+'</span></div>';
  });
  h+='</div>';
  h+='<div style="display:flex;flex-direction:column;gap:9px;">';
  h+=profileConsentRow('read','Bilgilendirmeyi okudum.',c.read);
  h+=profileConsentRow('processing','Profil verilerimin işlenmesini kabul ediyorum.',c.processing);
  h+=profileConsentRow('sensitive','Hassas verilerin (ör. ilişki/iyi oluş) belirtilen amaçlarla işlenmesini kabul ediyorum.',c.sensitive);
  h+=profileConsentRow('notDiagnosis','Sonuçların klinik bir tanı olmadığını anladım.',c.notDiagnosis);
  h+='</div>';
  h+='<button onclick="App.profileAcceptConsent()" '+(mandatoryOk?'':'disabled')+' style="border:none;width:100%;padding:16px;border-radius:18px;font-size:var(--f-callout);font-weight:800;color:#fff;background:linear-gradient(135deg,#E9899F,#C9B8FF);box-shadow:0 14px 30px rgba(233,137,159,0.35);display:flex;align-items:center;justify-content:center;gap:8px;'+(mandatoryOk?'cursor:pointer;opacity:1;':'cursor:not-allowed;opacity:.5;')+'">Kabul et ve başla '+icon('check',16)+'</button>';
  h+='<div style="display:flex;justify-content:center;gap:18px;padding-top:2px;flex-wrap:wrap;">';
  h+='<button onclick="App.profileConsentTogglePrivacyNote()" style="border:none;background:transparent;cursor:pointer;font-size:var(--f-footnote);font-weight:600;color:var(--faint);text-decoration:underline;">Gizlilik</button>';
  h+='<button onclick="App.profileAssessmentSOS()" style="border:none;background:transparent;cursor:pointer;font-size:var(--f-footnote);font-weight:600;color:var(--faint);text-decoration:underline;">Zor hissediyorum</button>';
  h+='</div>';
  if(liveUi().profileConsentPrivacyNote) h+='<div class="surface" style="border-radius:16px;padding:13px 15px;">'+icon('lock',13)+'<p style="margin:8px 0 0;font-size:var(--f-footnote);line-height:1.6;color:var(--text2);">Kilit ekranı seni korur; parola düz metin olarak kaydedilmez. Cevapların önce bu cihazda saklanır; yalnızca sen bağladıysan kendi seyma-data reponda yedeklenir. Panelde gösterim yalnızca yukarıdaki isteğe bağlı izni açarsan olur.</p></div>';
  h+='</div></div>';
  return h;
}

// ---------- Profil Değerlendirmesi: tek soru arayüzü ve yanıt akışı (Faz 05) ----------
function profileAssessmentModuleForOrder(order){
  var PA=window.ProfileAssessmentV1;
  var mb=(PA&&PA.sessions&&PA.sessions[0]&&PA.sessions[0].moduleBoundaries)||[];
  for(var i=0;i<mb.length;i++){ if(order>=mb[i].startOrder&&order<=mb[i].endOrder) return mb[i]; }
  return null;
}
// Şu an EKRANDA gösterilmesi gereken global index'i belirler: normalde `currentItemIndex`,
// ama bir yanıt az önce kaydedilip 150–220ms'lik görsel geri bildirim penceresindeyse
// (bkz. App.profileAnswer) o maddede sabit kalır — aksi halde seçim anında bir sonraki
// maddeye "atlar" ve seçili işaret hiç görünmez.
function profileItemDisplayIndex(){
  var items=profileAssessmentItems();
  if(liveUi().profileAssessmentAnswerLocked&&liveUi().profileAssessmentLockedItemId){
    for(var i=0;i<items.length;i++){ if(items[i].id===liveUi().profileAssessmentLockedItemId) return i; }
  }
  if(liveUi().profileAssessmentReviewIndex!=null) return liveUi().profileAssessmentReviewIndex;
  return (liveData()&&liveData().profileAssessment&&liveData().profileAssessment.currentItemIndex)||0;
}
function renderProfileItem(index){
  var items=profileAssessmentItems();
  var total=items.length;
  if(!total){
    return '<div style="flex:1;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;color:var(--muted);font-size:var(--f-subhead);">Soru bankası yüklenemedi. Lütfen uygulamayı yeniden başlat.</div>';
  }
  if(index==null||index<0) index=0;
  if(index>=total) index=total-1;
  var item=items[index];
  var pa=liveData().profileAssessment;
  var PA=window.ProfileAssessmentV1;
  var scale=(PA&&PA.scales&&PA.scales[item.scaleId])||{prompt:'',options:[]};
  var mod=profileAssessmentModuleForOrder(item.order);
  var existing=pa.responses[item.id];
  var locked=!!liveUi().profileAssessmentAnswerLocked;
  var selectedValue=locked?(existing&&existing.value):(existing&&existing.value);
  var isReview=(liveUi().profileAssessmentReviewIndex!=null&&liveUi().profileAssessmentReviewIndex===index);
  // İlk kez gösterilen madde için gösterim anını kaydet (responseMs hesaplaması için).
  if(!liveUi().profileItemShownAt) liveUi().profileItemShownAt={};
  if(!liveUi().profileItemShownAt[item.id]) liveUi().profileItemShownAt[item.id]=new Date().toISOString();
  var pct=Math.max(0,Math.min(100,Math.round((index/total)*100)));
  var h='<div id="pa-gate" class="pa-gate" tabindex="0" onkeydown="App.profileItemKeydown(event)" role="group" aria-label="Profil değerlendirmesi" style="position:relative;flex:1;min-height:0;display:flex;flex-direction:column;background:var(--bg);outline:none;">';
  h+='<div data-scroll class="scroll" style="flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:calc(env(safe-area-inset-top) + 18px) 20px calc(env(safe-area-inset-bottom) + 20px);display:flex;flex-direction:column;gap:16px;">';
  // üst: ilerleme + yüzde + modül başlığı + geri
  h+='<div style="display:flex;flex-direction:column;gap:8px;">';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">';
  h+=(index>0)?'<button onclick="App.profilePrevious()" aria-label="Önceki maddeye dön" style="border:none;background:transparent;cursor:pointer;display:flex;align-items:center;gap:4px;padding:6px 4px;min-height:48px;color:var(--muted);font-size:var(--f-footnote);font-weight:700;">‹ Geri</button>':'<span></span>';
  h+='<span style="font-size:var(--f-footnote);font-weight:800;color:var(--faint);">'+(index+1)+' / '+total+' · %'+pct+'</span>';
  h+='</div>';
  h+='<div style="height:6px;border-radius:999px;background:var(--card-bd);overflow:hidden;"><div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,#E9899F,#C9B8FF);border-radius:999px;"></div></div>';
  if(mod) h+='<div style="font-size:var(--f-caption1);font-weight:700;color:var(--faint);text-transform:uppercase;letter-spacing:.4px;">'+mod.title+'</div>';
  h+='</div>';
  // orta: madde metni
  h+='<div style="flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;gap:18px;padding:8px 0;">';
  h+='<p style="margin:0;font-size:var(--f-title3);line-height:1.45;font-weight:700;color:var(--text);text-align:center;">'+item.text+'</p>';
  if(scale.prompt) h+='<p style="margin:0;font-size:var(--f-footnote);color:var(--faint);text-align:center;">'+scale.prompt+'</p>';
  // seçenekler
  h+='<div role="radiogroup" aria-label="Yanıt seçenekleri" style="display:flex;flex-direction:column;gap:8px;">';
  (scale.options||[]).forEach(function(opt){
    var sel=selectedValue===opt.value;
    h+='<button role="radio" aria-checked="'+(sel?'true':'false')+'" onclick="App.profileAnswer(\''+item.id+'\','+opt.value+')" '+(locked?'disabled':'')+' style="display:flex;align-items:center;gap:11px;width:100%;min-height:48px;text-align:left;padding:12px 14px;border-radius:15px;transition:all .18s;'+(locked?'cursor:default;':'cursor:pointer;')+(sel?'background:color-mix(in srgb,#C9B8FF 14%, var(--card));border:1px solid #C9B8FF;':'background:var(--card);border:1px solid var(--card-bd);')+'">'
      +'<span style="width:24px;height:24px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;background:'+(sel?'linear-gradient(135deg,#E9899F,#C9B8FF)':'transparent')+';border:'+(sel?'none':'2px solid var(--field-bd)')+';">'+(sel?icon('check',13):'')+'</span>'
      +'<span style="flex:1;font-size:var(--f-subhead);line-height:1.4;color:var(--text);font-weight:600;">'+opt.label+'</span>'
      +'<span aria-hidden="true" style="font-size:var(--f-caption2);color:var(--faint);">'+opt.value+'</span></button>';
  });
  h+='</div>';
  h+='</div>';
  // alt: otomatik kayıt göstergesi + erişim linkleri
  h+='<div class="sey-tiny-hit" style="min-height:16px;text-align:center;font-size:var(--f-caption1);font-weight:700;color:var(--ok,#6bbf7a);">'+(locked?'Kaydedildi ✓':'')+'</div>';
  if(isReview) h+='<div style="text-align:center;font-size:var(--f-caption1);color:var(--faint);">Önceki cevabını gözden geçiriyorsun — yeni bir seçim yaparsan güncellenir.</div>';
  h+='<div style="display:flex;justify-content:center;gap:18px;flex-wrap:wrap;">';
  h+='<button onclick="App.profileAssessmentSOS()" style="border:none;background:transparent;cursor:pointer;font-size:var(--f-footnote);font-weight:600;color:var(--faint);text-decoration:underline;">Zor hissediyorum</button>';
  h+='</div>';
  h+='</div></div>';
  return h;
}

// ---------- Profil Değerlendirmesi: mola noktaları ve uygulama kilidi (Faz 06) ----------
// Mola noktaları PA.pausePolicy.softBreakAfterOrders (20/40/60/84/102/120/138/158) ile
// birebir aynı — Faz 02'de yapısal olarak doğrulandı. Mola zorunlu süre içermez, ana
// uygulamaya geçiş vermez, skor/geri bildirim göstermez; yalnızca "Devam et" sunar.
function profileAssessmentPendingBreak(pa){
  var PA=window.ProfileAssessmentV1;
  var pp=(PA&&PA.pausePolicy)||{};
  var breaks=Array.isArray(pp.softBreakAfterOrders)?pp.softBreakAfterOrders:[];
  if(breaks.indexOf(pa.currentItemIndex)<0) return null; // bir modül sınırında değiliz
  var mod=profileAssessmentModuleForOrder(pa.currentItemIndex); // az önce biten modül
  if(!mod) return null;
  var mp=pa.moduleProgress&&pa.moduleProgress[mod.moduleId];
  if(mp&&mp.breakAcknowledged) return null; // bu mola zaten görüldü/geçildi — tekrar gösterme
  return mod;
}
function renderProfileBreak(mod){
  var pa=liveData().profileAssessment;
  var PA=window.ProfileAssessmentV1;
  var total=profileAssessmentItems().length||174;
  var pct=Math.max(0,Math.min(100,Math.round((pa.currentItemIndex/total)*100)));
  var mb=(PA&&PA.sessions&&PA.sessions[0]&&PA.sessions[0].moduleBoundaries)||[];
  var idx=-1; for(var i=0;i<mb.length;i++){ if(mb[i].moduleId===mod.moduleId){ idx=i; break; } }
  var nextMod=(idx>=0)?mb[idx+1]:null;
  var est=(PA&&PA.estimatedMinutes)||{min:22,max:35};
  var frac=Math.max(0,1-(pa.currentItemIndex/total));
  var remMin=Math.max(1,Math.round(est.min*frac)), remMax=Math.max(remMin,Math.round(est.max*frac));
  var h='<div id="pa-gate" class="pa-gate" tabindex="0" role="group" aria-label="Kısa mola" style="position:relative;flex:1;min-height:0;display:flex;flex-direction:column;background:var(--bg);outline:none;">';
  h+='<div data-scroll class="scroll" style="flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:calc(env(safe-area-inset-top) + 22px) 20px calc(env(safe-area-inset-bottom) + 20px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;text-align:center;">';
  h+='<div style="width:64px;height:64px;border-radius:22px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#F4DCA0,#E9AEC6 52%,#CBB8FF);box-shadow:0 14px 30px rgba(233,137,159,0.3);">'+icon('sparkles',30)+'</div>';
  h+='<h1 style="margin:0;font-size:var(--f-title2);font-weight:800;color:var(--text);">Kısa bir mola</h1>';
  h+='<p style="margin:0;font-size:var(--f-subhead);line-height:1.55;color:var(--muted);max-width:320px;">"'+mod.title+'" bölümünü bitirdin. İstersen birkaç saniye nefes al, hazır olduğunda devam et.</p>';
  h+='<div class="surface" style="border-radius:20px;padding:16px 18px;width:100%;max-width:340px;display:flex;flex-direction:column;gap:10px;">';
  h+='<div style="display:flex;justify-content:space-between;font-size:var(--f-footnote);color:var(--text2);"><span>Tamamlanan</span><span style="font-weight:800;color:var(--text);">'+pa.currentItemIndex+' / '+total+' · %'+pct+'</span></div>';
  h+='<div style="height:6px;border-radius:999px;background:var(--card-bd);overflow:hidden;"><div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,#E9899F,#C9B8FF);border-radius:999px;"></div></div>';
  if(nextMod) h+='<div style="display:flex;justify-content:space-between;font-size:var(--f-footnote);color:var(--text2);"><span>Sıradaki bölüm</span><span style="font-weight:800;color:var(--text);">'+nextMod.title+'</span></div>';
  h+='<div style="display:flex;justify-content:space-between;font-size:var(--f-footnote);color:var(--text2);"><span>Yaklaşık kalan süre</span><span style="font-weight:800;color:var(--text);">~'+remMin+'–'+remMax+' dk</span></div>';
  h+='</div>';
  h+='<button onclick="App.profileBreakContinue()" style="border:none;width:100%;max-width:340px;padding:16px;border-radius:18px;font-size:var(--f-callout);font-weight:800;color:#fff;background:linear-gradient(135deg,#E9899F,#C9B8FF);box-shadow:0 14px 30px rgba(233,137,159,0.35);cursor:pointer;">Devam et '+icon('check',16)+'</button>';
  h+='<div style="display:flex;justify-content:center;gap:18px;flex-wrap:wrap;">';
  h+='<button onclick="App.profileAssessmentSOS()" style="border:none;background:transparent;cursor:pointer;font-size:var(--f-footnote);font-weight:600;color:var(--faint);text-decoration:underline;">Zor hissediyorum</button>';
  h+='</div>';
  h+='</div></div>';
  return h;
}
// Acil yardım — liveData().psych'in kendi (SOS akışından) TAMAMEN AYRI, bağımsız bir SOS mekanizması.
// Aynı gerçek dünya bilgisini (Raşit'in telefonu, 112) kullanır ama kendi state/isim uzayında.
function renderProfileAssessmentSOS(){
  var sent=!!liveUi().profileAssessmentSosSent;
  var h='<div id="pa-gate" class="pa-gate" tabindex="0" role="group" aria-label="Acil yardım" style="position:relative;flex:1;min-height:0;display:flex;flex-direction:column;background:var(--bg);outline:none;">';
  h+='<div data-scroll class="scroll" style="flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:calc(env(safe-area-inset-top) + 18px) 20px calc(env(safe-area-inset-bottom) + 20px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;text-align:center;">';
  h+='<button onclick="App.profileAssessmentSOSClose()" style="align-self:flex-start;border:1px solid var(--card-bd);cursor:pointer;background:var(--card);border-radius:14px;padding:9px 15px;font-size:var(--f-subhead);font-weight:700;color:var(--muted);">‹ Değerlendirmeye dön</button>';
  h+='<div style="width:78px;height:78px;border-radius:24px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#FFD9E1,#C9B8FF);box-shadow:0 12px 30px rgba(233,175,193,0.45);">'+(sent?icon('heart',34):icon('heart-handshake',34))+'</div>';
  if(!sent){
    h+='<h2 style="margin:0;font-size:var(--f-title2);font-weight:800;color:var(--text);">Yalnız değilsin</h2>';
    h+='<p style="margin:0;font-size:var(--f-subhead);line-height:1.6;color:var(--text2);max-width:340px;">Şu an zorlanıyorsan bunu tek başına taşımak zorunda değilsin. Aşağıdaki butona dokunursan Raşit\'e <b>doğrudan</b> haber gider.</p>';
    h+='<button onclick="App.profileAssessmentReachCreator()" style="border:none;cursor:pointer;width:100%;max-width:340px;padding:16px 18px;border-radius:20px;color:#fff;background:linear-gradient(135deg,#E9899F,#C9B8FF);box-shadow:0 12px 28px rgba(233,175,193,0.5);">Zor hissediyorum Raşit</button>';
    h+='<a href="tel:05066020098" style="text-decoration:none;border:1px solid rgba(233,175,193,0.6);cursor:pointer;width:100%;max-width:340px;padding:15px 18px;border-radius:20px;color:#B5566A;background:var(--card);display:flex;align-items:center;justify-content:center;gap:8px;font-size:var(--f-subhead);font-weight:800;">'+icon('phone',16)+' Raşit\'i ara</a>';
    h+='<div class="surface" style="border-radius:20px;padding:14px 16px;max-width:340px;"><p style="margin:0;font-size:var(--f-footnote);line-height:1.6;color:var(--text2);">Ani ve yoğun bir tehlike hissediyorsan lütfen <b>112</b>\'yi ara.</p></div>';
  } else {
    h+='<h2 style="margin:0;font-size:var(--f-title2);font-weight:800;color:var(--text);">Mesajın gönderildi</h2>';
    h+='<p style="margin:0;font-size:var(--f-subhead);line-height:1.6;color:var(--text2);max-width:340px;">Raşit en kısa sürede yanında olacak. Hazır olduğunda değerlendirmeye devam edebilirsin.</p>';
  }
  h+='</div></div>';
  return h;
}
// Ana kilit dispatcher'ı: hangi ekranın (SOS/rıza/mola/soru/tamamlandı) gösterileceğine tek yerden karar verir.
function renderProfileAssessmentGate(){
  if(liveUi().profileAssessmentSOS) return renderProfileAssessmentSOS();
  var pa=liveData().profileAssessment;
  if(!pa.consent.acceptedAt) return renderProfileConsent();
  if(liveUi().profileAssessmentCompletionShown) return renderProfileCompletion();
  if(!liveUi().profileAssessmentReviewIndex&&!liveUi().profileAssessmentAnswerLocked){
    var brk=profileAssessmentPendingBreak(pa);
    if(brk) return renderProfileBreak(brk);
  }
  return renderProfileItem(profileItemDisplayIndex());
}
// 174/174 sonrası teşekkür/tamamlanma ekranı. Puanlama/rapor üretildi ama
// kullanıcıya yalnızca sade, sıcak bir "tamamlandı" mesajı gösterilir;
// rapor özeti, ölçüm güveni veya diğer sonuçlar bu ekranda paylaşılmaz.
function renderProfileCompletion(){
  var pa=liveData().profileAssessment||{};
  var total=profileAssessmentItems().length||174;
  var PA=window.ProfileAssessmentV1;
  var moduleCount=((PA&&PA.sessions&&PA.sessions[0]&&PA.sessions[0].moduleBoundaries)||[]).length||9;
  var dateStr=pa.completedAt?new Date(pa.completedAt).toLocaleDateString('tr-TR',{day:'2-digit',month:'long',year:'numeric'}):'';
  var h='<div id="pa-gate" class="pa-gate" style="position:relative;flex:1;min-height:0;display:flex;flex-direction:column;background:var(--bg);outline:none;">';
  h+='<div data-scroll class="scroll" style="flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:calc(env(safe-area-inset-top) + 22px) 20px calc(env(safe-area-inset-bottom) + 20px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;text-align:center;">';
  h+='<div class="pa-card" style="width:100%;max-width:340px;text-align:center;">';
  h+='<div style="width:88px;height:88px;border-radius:50%;background:linear-gradient(135deg,#C9B8FF,#E9899F);display:inline-flex;align-items:center;justify-content:center;color:#fff;margin-bottom:16px;box-shadow:0 14px 32px rgba(201,184,255,0.35);">'+icon('check',44)+'</div>';
  h+='<div style="font-size:var(--f-title1);font-weight:800;color:var(--text);line-height:1.25;margin-bottom:10px;">Teşekkürler Günışığım</div>';
  h+='<div style="font-size:var(--f-subhead);line-height:1.6;color:var(--text2);margin-bottom:22px;">174 soruyu kendinle bu kadar içtenlikle yanıtladın. Seni biraz daha yakından tanımak çok kıymetliydi.</div>';
  h+='<div class="surface" style="border-radius:20px;padding:16px 18px;width:100%;display:flex;flex-direction:column;gap:10px;text-align:left;margin-bottom:22px;">';
  h+='<div style="display:flex;justify-content:space-between;font-size:var(--f-footnote);color:var(--text2);"><span>Tamamlanan</span><span style="font-weight:800;color:var(--text);">'+total+' / '+total+' · %100</span></div>';
  h+='<div style="height:6px;border-radius:999px;background:var(--card-bd);overflow:hidden;"><div style="height:100%;width:100%;background:linear-gradient(90deg,#E9899F,#C9B8FF);border-radius:999px;"></div></div>';
  h+='<div style="display:flex;justify-content:space-between;font-size:var(--f-footnote);color:var(--text2);"><span>Modüller</span><span style="font-weight:800;color:var(--text);">'+moduleCount+' / '+moduleCount+' tamamlandı</span></div>';
  if(dateStr) h+='<div style="display:flex;justify-content:space-between;font-size:var(--f-footnote);color:var(--text2);"><span>Tamamlanma tarihi</span><span style="font-weight:800;color:var(--text);">'+esc(dateStr)+'</span></div>';
  h+='</div>';
  h+='<button class="btn primary" onclick="App.dismissProfileCompletion()" style="width:100%;padding:14px 18px;font-size:var(--f-callout);font-weight:800;border-radius:14px;background:linear-gradient(135deg,#C9B8FF,#E9899F);border:none;color:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;">'+icon('arrow-right',18)+' Ana uygulamaya dön</button>';
  h+='</div>';
  h+='</div></div>';
  return h;
}

// ---------- Profil Değerlendirmesi: puanlama motoru (Faz 07) ----------
// Tamamen saf/deterministik fonksiyonlar — yalnızca kendilerine verilen responses'a ve
// profileAssessmentV1.js'in dondurulmuş `scoring.constructs` haritasına bakar; hiçbir global
// mutasyon yapmaz. Normatif DEĞİLDİR: yüzdelik/T puanı/normal-anormal etiketi ÜRETİLMEZ.
// Kalite kontrol maddeleri (construct:"response_quality") scoring.constructs'ta hiçbir
// yerde referans edilmediği için zaten otomatik dışlanır.
function scoreProfileItem(item,rawValue){
  if(!item||typeof rawValue!=='number'||isNaN(rawValue)) return null;
  return item.reverse?(8-rawValue):rawValue; // PA.scoring.reverseFormula: "8 - rawValue"
}
// itemIds: bir facet'e (ör. scoring.constructs.conscientiousness.organization) ait itemId listesi.
// NOT: facetId'ler tek başına belirsizdir (ör. "trust" hem agreeableness hem relationship_skills
// altında var) — bu yüzden bu fonksiyon çıplak facetId değil, çağıranın scoring.constructs
// haritasından aldığı somut itemId listesini alır.
function scoreProfileFacet(itemIds,responses){
  var items=profileAssessmentItems();
  var byId={}; items.forEach(function(it){ byId[it.id]=it; });
  var valid=[];
  (itemIds||[]).forEach(function(id){
    var r=responses&&responses[id], it=byId[id];
    if(!it||!r||typeof r.value!=='number') return;
    var s=scoreProfileItem(it,r.value);
    if(s!=null) valid.push(s);
  });
  var total=(itemIds||[]).length;
  var completion=total?valid.length/total:0;
  var sufficient=completion>=0.8&&valid.length>0; // minimumFacetCompletion
  var mean=sufficient?(valid.reduce(function(a,b){return a+b;},0)/valid.length):null;
  return {mean:mean,completion:completion,n:valid.length,total:total,sufficient:sufficient};
}
function scoreProfileConstruct(constructId,responses){
  var PA=window.ProfileAssessmentV1;
  var facetMap=(PA&&PA.scoring&&PA.scoring.constructs&&PA.scoring.constructs[constructId])||{};
  var facetIds=Object.keys(facetMap);
  var facets={}, validMeans=[];
  facetIds.forEach(function(f){
    var fs=scoreProfileFacet(facetMap[f],responses);
    facets[f]=fs;
    if(fs.sufficient) validMeans.push(fs.mean);
  });
  var completion=facetIds.length?validMeans.length/facetIds.length:0;
  var sufficient=completion>=0.8&&validMeans.length>0; // minimumConstructCompletion
  var mean=sufficient?(validMeans.reduce(function(a,b){return a+b;},0)/validMeans.length):null; // eşit ağırlıklı, faktör yükü YOK
  return {facets:facets,mean:mean,completion:completion,sufficient:sufficient};
}
// RIASEC: 6 alan ayrı tutulur; ilk üç + birinci/ikinci farkı + basit farklılaşma metriği
// (en yüksek-en düşük). Eşit skor durumunda Object.keys sırası (R,I,A,S,E,C dondurulmuş
// tanım sırası) + dizinin sabit (stable) sort'u korunduğu için sonuç deterministiktir.
function scoreRiasec(responses){
  var PA=window.ProfileAssessmentV1;
  var facetMap=(PA&&PA.scoring&&PA.scoring.constructs&&PA.scoring.constructs.riasec)||{};
  var scores={};
  var order=Object.keys(facetMap);
  order.forEach(function(f){ scores[f]=scoreProfileFacet(facetMap[f],responses); });
  var ranked=order.filter(function(f){ return scores[f].sufficient; })
    .map(function(f){ return {code:f,mean:scores[f].mean}; })
    .sort(function(a,b){ return b.mean-a.mean; }); // Array#sort ES2019+ stable — eşitlikte tanım sırası korunur
  var topThree=ranked.slice(0,3).map(function(e){ return e.code; });
  var first=ranked[0]||null, second=ranked[1]||null, last=ranked[ranked.length-1]||null;
  return {
    scores:scores,
    topThree:topThree,
    topSecondDiff:(first&&second)?Math.round((first.mean-second.mean)*1000)/1000:null,
    differentiation:(first&&last)?Math.round((first.mean-last.mean)*1000)/1000:null
  };
}
// Değerler: ham ortalamaların yanında kişi-merkezli skor (centered = valueMean - allValuesMean) —
// kişinin TÜM değerleri yüksek/düşük işaretleme eğilimini azaltır. Ahlaki sıralama YOK.
function scoreValues(responses){
  var PA=window.ProfileAssessmentV1;
  var facetMap=(PA&&PA.scoring&&PA.scoring.constructs&&PA.scoring.constructs.values)||{};
  var raw={};
  Object.keys(facetMap).forEach(function(f){ raw[f]=scoreProfileFacet(facetMap[f],responses); });
  var sufficientMeans=Object.keys(raw).filter(function(f){ return raw[f].sufficient; }).map(function(f){ return raw[f].mean; });
  var allValuesMean=sufficientMeans.length?(sufficientMeans.reduce(function(a,b){return a+b;},0)/sufficientMeans.length):null;
  var centered={};
  Object.keys(raw).forEach(function(f){
    centered[f]=(raw[f].sufficient&&allValuesMean!=null)?Math.round((raw[f].mean-allValuesMean)*1000)/1000:null;
  });
  return {raw:raw,allValuesMean:allValuesMean,centered:centered};
}
// Bağlanma: kaygı ve kaçınma AYRI, sürekli iki skor. "Güvenli/kaçıngan" gibi kategori
// ÜRETİLMEZ (kategori zorunlu değil kuralı gereği bilerek eklenmedi).
function scoreAttachment(responses){
  var PA=window.ProfileAssessmentV1;
  var facetMap=(PA&&PA.scoring&&PA.scoring.constructs&&PA.scoring.constructs.attachment)||{};
  return {
    anxiety:scoreProfileFacet(facetMap.anxiety||[],responses),
    avoidance:scoreProfileFacet(facetMap.avoidance||[],responses)
  };
}
// Tüm profili puanlar. wellbeing_context KALICI karakter skorlarına KATILMAZ — ayrı bir
// bağlam notu olarak döner (bkz. scoring/SCORING_ENGINE.md § Güncel bağlam).
function scoreProfileAssessment(responses){
  var PA=window.ProfileAssessmentV1;
  var allConstructIds=Object.keys((PA&&PA.scoring&&PA.scoring.constructs)||{});
  var special={riasec:1,values:1,attachment:1,wellbeing_context:1};
  var constructs={};
  allConstructIds.forEach(function(c){
    if(special[c]) return;
    constructs[c]=scoreProfileConstruct(c,responses);
  });
  return {
    constructs:constructs,
    riasec:scoreRiasec(responses),
    values:scoreValues(responses),
    attachment:scoreAttachment(responses),
    wellbeingContext:scoreProfileConstruct('wellbeing_context',responses)
  };
}

// ---------- Profil Değerlendirmesi: yanıt kalitesi ve güven motoru (Faz 08) ----------
// Ağırlıklar TEK yerde sabit ve test edilebilir (scoring/QUALITY_ENGINE.md ile birebir):
// tamamlanma %30, dikkat kontrolleri %20, süre uygunluğu %20, tutarlılık %20, varyans/
// revizyon %10. Hiçbir tek gösterge tek başına sonucu geçersiz kılmaz — yalnızca ağırlıklı
// bileşik skor ve (varsa) birleşik/istisnai kurallar (bkz. aşağı) skoru etkiler.
var PROFILE_QUALITY_WEIGHTS={completion:30,attention:20,timing:20,consistency:20,varianceRevision:10};
function profileAssessmentQualityCategory(score){
  if(score>=85) return 'high';
  if(score>=70) return 'adequate';
  if(score>=50) return 'limited';
  return 'low';
}
function scoreProfileAssessmentQuality(responses){
  responses=(responses&&typeof responses==='object')?responses:{};
  var items=profileAssessmentItems();
  var total=items.length||174;
  var byId={}; items.forEach(function(it){ byId[it.id]=it; });
  var answered=items.filter(function(it){ var r=responses[it.id]; return r&&typeof r.value==='number'; });

  // 1) Tamamlama
  var completionRate=total?answered.length/total:0;

  // 2) Dikkat kontrolleri (qualityControl:true VE expectedResponse sayısal olan maddeler)
  var attentionItems=items.filter(function(it){ return it.qualityControl&&it.expectedResponse!=null; });
  var attentionPassed=attentionItems.filter(function(it){ var r=responses[it.id]; return r&&r.value===it.expectedResponse; });
  var attentionChecks=attentionPassed.length;
  var attentionTotal=attentionItems.length;
  // Dürüst çaba maddesi (qualityControl:true, expectedResponse:null — "doğru" cevap yok, öz-bildirim)
  var honestItem=items.filter(function(it){ return it.qualityControl&&it.expectedResponse==null; })[0]||null;
  var honestResp=honestItem&&responses[honestItem.id];

  // 3) 700ms altı yanıt oranı (yalnızca cevaplanmış maddeler üzerinden)
  var fastCount=answered.filter(function(it){ var r=responses[it.id]; return typeof r.responseMs==='number'&&r.responseMs<700; }).length;
  var fastResponseRate=answered.length?fastCount/answered.length:0;

  // 4) 12+ aynı RAW cevap serisi (global madde sırasında, straightlining — scoredValue değil,
  // gerçek tıklama düzenini yansıtsın diye ham value kullanılır)
  var longestSameAnswerRun=0,curRun=0,prevVal=null;
  items.forEach(function(it){
    var r=responses[it.id];
    if(!r||typeof r.value!=='number'){ curRun=0; prevVal=null; return; }
    curRun=(prevVal!==null&&r.value===prevVal)?curRun+1:1;
    if(curRun>longestSameAnswerRun) longestSameAnswerRun=curRun;
    prevVal=r.value;
  });

  // 5) Tutarlılık: 2+ maddeli her facet'te (ters puanlama uygulanmış) scored value'ların
  // standart sapması — küçük sapma yüksek tutarlılık demektir (özellikle ters/karşıt madde
  // çiftlerinin aynı yönde hizalanıp hizalanmadığını yansıtır).
  var PA=window.ProfileAssessmentV1;
  var facetMapAll=(PA&&PA.scoring&&PA.scoring.constructs)||{};
  var facetConsistencies=[];
  Object.keys(facetMapAll).forEach(function(c){
    Object.keys(facetMapAll[c]).forEach(function(f){
      var ids=facetMapAll[c][f];
      if(!ids||ids.length<2) return;
      var vals=[];
      ids.forEach(function(id){
        var it=byId[id], r=responses[id];
        if(it&&r&&typeof r.value==='number'){ var s=scoreProfileItem(it,r.value); if(s!=null) vals.push(s); }
      });
      if(vals.length<2) return;
      var mean=vals.reduce(function(a,b){return a+b;},0)/vals.length;
      var variance=vals.reduce(function(a,b){return a+(b-mean)*(b-mean);},0)/vals.length;
      var sd=Math.sqrt(variance);
      facetConsistencies.push(Math.max(0,1-Math.min(1,sd/3))); // sd 0..3 aralığına kırpılıp tersine çevrilir
    });
  });
  var consistency=facetConsistencies.length?(facetConsistencies.reduce(function(a,b){return a+b;},0)/facetConsistencies.length):null;

  // 6) Revizyon oranı
  var revisedCount=answered.filter(function(it){ var r=responses[it.id]; return (r.revisionCount||0)>0; }).length;
  var revisionRate=answered.length?revisedCount/answered.length:0;

  // ── ağırlıklı bileşik skor ──
  var W=PROFILE_QUALITY_WEIGHTS;
  var completionScore=completionRate*100;
  var attentionScore=attentionTotal?(attentionChecks/attentionTotal)*100:100;
  var timingScore=Math.max(0,Math.min(100,100-Math.max(0,(fastResponseRate-0.25))*200)); // %25'e kadar ceza yok
  var consistencyScore=(consistency==null)?100:consistency*100; // yeterli çok-maddeli facet yoksa nötr
  var varianceRevisionScore=100;
  var warnings=[];
  if(longestSameAnswerRun>=12){
    varianceRevisionScore-=40;
    warnings.push('Uzun bir seri boyunca aynı seçenek işaretlenmiş ('+longestSameAnswerRun+' madde) — tek başına geçersiz saymıyoruz, yorumlarken dikkate al.');
  }
  if(revisionRate>0.5){
    varianceRevisionScore-=20;
    warnings.push('Maddelerin yarısından fazlası yeniden cevaplanmış — dikkatli bir gözden geçirme de olabilir.');
  }
  varianceRevisionScore=Math.max(0,varianceRevisionScore);

  var score=(completionScore*W.completion+attentionScore*W.attention+timingScore*W.timing+consistencyScore*W.consistency+varianceRevisionScore*W.varianceRevision)/100;

  // ── istisnai/birleşik kurallar (tek bayrak asla otomatik iptal etmez) ──
  if(attentionTotal>0&&attentionChecks<attentionTotal){
    warnings.push((attentionTotal-attentionChecks)+' dikkat kontrolü kaçırılmış — tek başına geçersiz saymıyoruz.');
  }
  if(attentionTotal>0&&attentionChecks===0&&fastResponseRate>0.25){
    score-=15; // İKİ dikkat hatası + yüksek hız BİRLİKTE → güven düşürülür (kural gereği)
    warnings.push('İki dikkat kontrolü de kaçmış ve hızlı yanıt oranı yüksek — güven ayrıca düşürüldü.');
  }
  if(honestItem&&honestResp&&typeof honestResp.value==='number'&&honestResp.value<=2){
    score-=5;
    warnings.push('Son maddede kendi yanıtlama tarzını daha düşük değerlendirmiş — sonuçları yorumlarken göz önünde bulundur.');
  }
  if(completionRate<1){
    warnings.push('Değerlendirme tam tamamlanmadan hesaplanmış ('+answered.length+'/'+total+').');
  }

  score=Math.max(0,Math.min(100,Math.round(score)));
  return {
    score:score,
    category:profileAssessmentQualityCategory(score),
    completionRate:Math.round(completionRate*1000)/1000,
    fastResponseRate:Math.round(fastResponseRate*1000)/1000,
    attentionChecks:attentionChecks,
    longestSameAnswerRun:longestSameAnswerRun,
    consistency:(consistency==null)?null:Math.round(consistency*1000)/1000,
    revisionRate:Math.round(revisionRate*1000)/1000,
    warnings:warnings
  };
}

// ---------- Profil Değerlendirmesi: deterministik rapor üretimi (Faz 09) ----------
// LLM YOK — tamamen şablon + kural tabanlı, girdiye göre metin dilimleri seçilir (aynı
// scores/quality → aynı rapor). Ham hassas yanıtlar hiçbir yere (dış servis dahil)
// gönderilmez; yalnızca zaten hesaplanmış özet skorlar okunur. Dil kuralları (scoring/
// REPORTING_RULES.md ile birebir): "kesinlikle böylesiniz" YOK, "sağlıksız/bozukluk/tanı"
// (tanı YALNIZCA "bu değerlendirme tanı değildir" reddiyesinde geçer) YOK, ahlaki üstünlük/
// işe alınabilirlik hükmü YOK.
function profileBand(mean){
  if(mean==null||typeof mean!=='number') return null;
  if(mean>=5.5) return 'high';
  if(mean<=2.5) return 'low';
  return 'moderate';
}
function profileBandLabel(band){
  return band==='high'?'belirgin biçimde yüksek':(band==='low'?'ortalamanın altında':'dengeli/orta');
}
function profileConstructSentence(label,mean){
  if(mean==null) return 'Bu alanda yeterli veri toplanamadı (madde tamamlama eşiğinin altında kaldı); yorum yapılmıyor.';
  var band=profileBand(mean);
  return 'Yanıtların, '+label+' boyutunda '+profileBandLabel(band)+' bir eğilim düşündürüyor (ort. '+mean.toFixed(1)+'/7).';
}
// Her construct için: label (rapor dilinde ad), ve HIGH/LOW bantlarında üretilecek isteğe
// bağlı güçlü-yön / aşırı-kullanım-riski / gelişim-önerisi cümleleri. Bir alan yalnızca
// kendisi için tanımlı olan alanlara katkı verir (ör. negative_emotionality yüksekken
// "güçlü yön" ÜRETMEZ, yalnızca risk+gelişim önerisi üretir — yüksek hassasiyet bir zayıflık
// olarak damgalanmadan, dikkat gerektiren bir eğilim olarak çerçevelenir).
var PROFILE_CONSTRUCT_NARRATIVE={
  conscientiousness:{label:'öz-yönetim ve düzen',
    strengthHigh:'İşleri düzenli, sorumlu ve takip edilebilir biçimde yürütme eğilimi güçlü bir yön olarak öne çıkıyor.',
    overuseHigh:'Bu eğilim aşırılaştığında esneklik kaybı veya aşırı kontrol ihtiyacı riski doğabilir.',
    growthLow:'Küçük, somut planlama alışkanlıkları (gün başında birkaç öncelik belirlemek gibi) bu alanda destekleyici olabilir.'},
  negative_emotionality:{label:'duygusal hassasiyet',
    overuseHigh:'Duygusal iniş çıkışlar bazı bağlamlarda yoğun hissedilebilir; bu bir zayıflık değil, dikkat ve destekleyici baş etme stratejileri gerektirebilecek bir eğilimdir.',
    growthHigh:'Zorlayıcı anlarda kısa bir duraklama/nefes pratiği veya güvenilir biriyle paylaşım, bu eğilimi yönetmede destekleyici olabilir.'},
  extraversion:{label:'sosyal enerji ve girişkenlik',
    strengthHigh:'Sosyal ortamlarda rahat hissetme ve girişkenlik gösterme eğilimi güçlü bir yön olarak öne çıkıyor.',
    overuseHigh:'Bu eğilim aşırılaştığında yalnız kalma/dinlenme ihtiyacının ihmal edilmesi riski doğabilir.',
    growthLow:'Küçük, tanıdık sosyal ortamlarda adım adım daha fazla görünür olmak bu alanda destekleyici olabilir.'},
  agreeableness:{label:'uyum, güven ve şefkat',
    strengthHigh:'Başkalarının bakış açısını anlama ve şefkatli yaklaşma eğilimi güçlü bir yön olarak öne çıkıyor.',
    overuseHigh:'Bu eğilim aşırılaştığında kendi ihtiyaçlarını geri plana atma veya sınır koymakta zorlanma riski doğabilir.',
    growthLow:'Karşılıklı güveni küçük adımlarla test etmek bu alanda destekleyici olabilir.'},
  social_communication:{label:'iletişim ve çatışma yönetimi tarzı',
    strengthHigh:'Dinleme, geri bildirime açıklık ve ilişki onarma becerisi güçlü bir yön olarak öne çıkıyor.',
    overuseHigh:null,
    growthLow:'Duygu ve ihtiyaçları daha doğrudan ifade etme pratiği bu alanda destekleyici olabilir.'},
  open_mindedness:{label:'açık fikirlilik ve merak',
    strengthHigh:'Yeni fikirlere, deneyimlere ve estetik ayrıntılara açıklık güçlü bir yön olarak öne çıkıyor.',
    overuseHigh:'Bu eğilim aşırılaştığında dağınıklık veya bir konuyu sonuçlandıramama riski doğabilir.',
    growthLow:'Küçük, tanıdık olmayan deneyimlerle başlamak bu alanda destekleyici olabilir.'},
  honesty_humility:{label:'dürüstlük ve alçakgönüllülük',
    strengthHigh:'Adil davranma ve gösterişten kaçınma eğilimi güçlü bir yön olarak öne çıkıyor.',
    overuseHigh:null,
    growthLow:'Kendi katkılarını daha açık biçimde ifade etmek bu alanda destekleyici olabilir.'},
  epistemic_character:{label:'epistemik tutum (bilgiye ve hataya yaklaşım)',
    strengthHigh:'Kanıtı dikkate alma ve hatayı kabul edebilme eğilimi güçlü bir yön olarak öne çıkıyor.',
    overuseHigh:'Bu eğilim aşırılaştığında aşırı temkinlilik veya karar erteleme riski doğabilir.',
    growthLow:'Emin olunmayan noktalarda bunu açıkça belirtme alışkanlığı bu alanda destekleyici olabilir.'},
  motivation:{label:'motivasyon kaynakları',
    strengthHigh:'İçsel/özerk motivasyon kaynaklarına dayanma eğilimi güçlü bir yön olarak öne çıkıyor.',
    overuseHigh:null,
    growthLow:'Yapılan işi kişisel anlamla ilişkilendirecek küçük hatırlatıcılar bu alanda destekleyici olabilir.'},
  cognitive_style:{label:'bilişsel stil',
    strengthHigh:'Karmaşık konuları analiz etme ve kanıt arama eğilimi güçlü bir yön olarak öne çıkıyor.',
    overuseHigh:'Bu eğilim aşırılaştığında aşırı analiz/karar erteleme riski doğabilir.',
    growthLow:'Küçük kararlarda bilinçli olarak sezgiye biraz daha yer açmak bu alanda destekleyici olabilir.'},
  decision_style:{label:'karar verme tarzı',
    strengthHigh:'Kararları sistematik ve gerekçeli biçimde verme eğilimi güçlü bir yön olarak öne çıkıyor.',
    overuseHigh:'Bu eğilim aşırılaştığında karar sonrası aşırı sorgulama (ruminasyon) riski doğabilir.',
    growthLow:'Küçük kararlar için kendine kısa bir süre sınırı koymak bu alanda destekleyici olabilir.'},
  metacognition:{label:'öz-farkındalık (meta-biliş)',
    strengthHigh:'Kendi düşünme sürecini gözlemleme ve gerektiğinde güncelleme eğilimi güçlü bir yön olarak öne çıkıyor.',
    overuseHigh:null,
    growthLow:'Gün sonunda kısa bir "bugün ne öğrendim" değerlendirmesi bu alanda destekleyici olabilir.'},
  work_style:{label:'çalışma tarzı',
    strengthHigh:'Odaklanma, tamamlama ve önceliklendirme eğilimi güçlü bir yön olarak öne çıkıyor.',
    overuseHigh:'Bu eğilim aşırılaştığında dinlenme sınırlarının ihmal edilmesi riski doğabilir.',
    growthLow:'İşi küçük, tamamlanabilir adımlara bölmek bu alanda destekleyici olabilir.'},
  relationship_skills:{label:'ilişki becerileri',
    strengthHigh:'Yakınlığı tolere etme ve ilişkide onarım yapabilme eğilimi güçlü bir yön olarak öne çıkıyor.',
    overuseHigh:null,
    growthLow:'İhtiyaçları küçük adımlarla, doğrudan ifade etme pratiği bu alanda destekleyici olabilir.'},
  emotion_regulation:{label:'duygu düzenleme',
    strengthHigh:'Duyguları fark etme ve yeniden çerçeveleme (reappraisal) eğilimi güçlü bir yön olarak öne çıkıyor.',
    overuseHigh:null,
    growthLow:'Zorlayıcı bir duyguyu isimlendirmekle başlamak bu alanda destekleyici olabilir.'},
  self_compassion:{label:'öz-şefkat',
    strengthHigh:'Zorlandığı anlarda kendine nazik yaklaşabilme eğilimi güçlü bir yön olarak öne çıkıyor.',
    overuseHigh:null,
    growthLow:'Zor bir anda kendine, bir arkadaşına söyleyeceğin cümleyi söylemeyi denemek bu alanda destekleyici olabilir.'}
};
function profileAssessmentContradictionNotes(scores){
  var notes=[];
  function facetMean(constructId,facetId){
    var c=scores.constructs[constructId];
    if(!c||!c.facets||!c.facets[facetId]||!c.facets[facetId].sufficient) return null;
    return c.facets[facetId].mean;
  }
  var sociability=facetMean('extraversion','sociability');
  var avoidance=scores.attachment&&scores.attachment.avoidance&&scores.attachment.avoidance.sufficient?scores.attachment.avoidance.mean:null;
  if(sociability!=null&&sociability>=5.5&&avoidance!=null&&avoidance>=5.5){
    notes.push('Sosyal ortamlarda rahat görünme eğilimi ile yakın ilişkilerde temkinli/mesafeli kalma eğiliminin bir arada olması bir çelişki değildir — kişi sosyal olabilir ve aynı zamanda duygusal yakınlığı daha ihtiyatlı açabilir.');
  }
  var achievement=(scores.values&&scores.values.raw&&scores.values.raw.achievement&&scores.values.raw.achievement.sufficient)?scores.values.raw.achievement.mean:null;
  var procrastination=facetMean('work_style','procrastination');
  if(achievement!=null&&achievement>=5.5&&procrastination!=null&&procrastination>=5.5){
    notes.push('Başarıya yüksek değer verme ile işe başlamayı erteleme eğiliminin bir arada olması bir çelişki değildir — yüksek standartlar bazen başlangıcı zorlaştırabilir.');
  }
  var compassion=facetMean('agreeableness','compassion');
  var boundarySetting=facetMean('relationship_skills','boundary_setting');
  if(compassion!=null&&compassion>=5.5&&boundarySetting!=null&&boundarySetting>=5.5){
    notes.push('Güçlü empati ile güçlü sınır ihtiyacının bir arada olması bir çelişki değildir — başkalarını önemsemek, kendi sınırlarını korumakla birlikte var olabilir.');
  }
  return notes;
}
function buildProfileReport(scores,quality){
  scores=scores||{};
  quality=quality||{constructs:{}};
  var C=scores.constructs||{};
  function bandOf(constructId){ return C[constructId]&&C[constructId].sufficient?C[constructId].mean:null; }
  function sentenceFor(constructId){
    var meta=PROFILE_CONSTRUCT_NARRATIVE[constructId]||{label:constructId};
    return profileConstructSentence(meta.label,bandOf(constructId));
  }

  // 1) Ölçüm güveni
  var qCat=quality&&quality.category;
  var confidenceBody='Bu raporun güven düzeyi "'+(qCat||'bilinmiyor')+'" olarak değerlendirildi (0-100 üzerinden '+(quality&&quality.score!=null?quality.score:'—')+'). '+
    'Bu değerlendirme klinik bir tanı değildir; öz-bildirime dayalı bir profildir.';
  if(qCat==='low'){ confidenceBody+=' Güven düzeyi düşük çıktığı için bu rapor bir ön değerlendirme olarak okunmalı; sonuçlar dikkatli yorumlanmalı ve istenirse değerlendirme daha sakin bir zamanda yeniden yapılabilir.'; }
  if(quality&&Array.isArray(quality.warnings)&&quality.warnings.length){ confidenceBody+=' Notlar: '+quality.warnings.join(' '); }

  // 2) Kısa karakter özeti (en fazla birkaç yapıyı birleştiren, kanıt taşıyan kısa sentez)
  var summaryParts=[];
  ['conscientiousness','extraversion','agreeableness','open_mindedness'].forEach(function(c){
    var m=bandOf(c); if(m!=null) summaryParts.push(profileConstructSentence(PROFILE_CONSTRUCT_NARRATIVE[c].label,m));
  });
  var contradictions=profileAssessmentContradictionNotes(scores);
  var summaryBody=(summaryParts.slice(0,2).join(' ')||'Genel bir özet için yeterli veri yok.')+(contradictions.length?(' '+contradictions.join(' ')):'');

  // 3) Big Five alanları
  var bigFive=['conscientiousness','negative_emotionality','extraversion','agreeableness','open_mindedness'].map(sentenceFor).join(' ');

  // 4) Karakter bütünlüğü ve epistemik yaklaşım
  var integrity=['honesty_humility','epistemic_character'].map(sentenceFor).join(' ');

  // 5) RIASEC ilk üç alan
  var RIASEC_LABELS={realistic:'Gerçekçi (uygulamalı/teknik)',investigative:'Araştırmacı',artistic:'Sanatsal',social:'Sosyal',enterprising:'Girişimci',conventional:'Düzenleyici (yapılandırılmış)'};
  var riasec=scores.riasec||{};
  var riasecBody;
  if(riasec.topThree&&riasec.topThree.length){
    riasecBody='İlgi profilinde öne çıkan ilk üç alan: '+riasec.topThree.map(function(c){return RIASEC_LABELS[c]||c;}).join(', ')+'. ';
    if(riasec.differentiation!=null){
      riasecBody+='Alanlar arası farklılaşma '+riasec.differentiation.toFixed(1)+' puan; '+(riasec.differentiation<1?'ilgiler oldukça dengeli dağılmış.':'bazı alanlar diğerlerinden belirgin biçimde öne çıkıyor.');
    }
  } else {
    riasecBody='İlgi alanları için yeterli veri toplanamadı.';
  }

  // 6) Değer öncelikleri (kişi-merkezli centered skorlara göre, ahlaki sıralama YOK)
  var VALUE_LABELS={self_direction:'özerklik',stimulation:'uyarılma/çeşitlilik',achievement:'başarı',power_influence:'güç/etki',security:'güvenlik',tradition_conformity:'gelenek/uyum',benevolence:'iyilikseverlik',universalism:'evrensellik'};
  var values=scores.values||{centered:{}};
  var centeredEntries=Object.keys(values.centered||{}).filter(function(k){return values.centered[k]!=null;}).sort(function(a,b){return values.centered[b]-values.centered[a];});
  var topValues=centeredEntries.slice(0,3).map(function(k){return VALUE_LABELS[k]||k;});
  var valuesBody=topValues.length?('Diğer değerlerine göre öne çıkan öncelikleri: '+topValues.join(', ')+'. Bu bir "daha iyi insan" sıralaması değildir; yalnızca kişinin kendi içindeki göreli önceliği yansıtır.'):'Değer öncelikleri için yeterli veri toplanamadı.';

  // 7) Motivasyon kaynakları
  var motivation=sentenceFor('motivation');

  // 8) Bilişsel stil ve karar verme
  var cognitiveDecision=['cognitive_style','decision_style'].map(sentenceFor).join(' ');

  // 9) Çalışma tarzı
  var workStyle=sentenceFor('work_style');

  // 10) Bağlanma kaygısı ve kaçınması (+ ilişki becerileri notu)
  var att=scores.attachment||{};
  var anxietyMean=att.anxiety&&att.anxiety.sufficient?att.anxiety.mean:null;
  var avoidanceMean=att.avoidance&&att.avoidance.sufficient?att.avoidance.mean:null;
  var attachmentBody='Bağlanma kaygısı: '+profileConstructSentence('bağlanma kaygısı',anxietyMean)+' Bağlanma kaçınması: '+profileConstructSentence('yakınlıktan kaçınma',avoidanceMean)+
    ' Burada bir "güvenli/kaygılı/kaçıngan" kategorisi zorunlu tutulmuyor; iki eksen ayrı ayrı değerlendiriliyor.'+
    ' '+sentenceFor('relationship_skills');

  // 11) Duygu düzenleme ve öz-şefkat (+ ayrı, karışmayan güncel bağlam notu)
  var emotionBody=[sentenceFor('emotion_regulation'),sentenceFor('self_compassion'),sentenceFor('metacognition')].join(' ');
  var wb=scores.wellbeingContext;
  if(wb&&wb.sufficient){
    emotionBody+=' Güncel bağlam: son dönemki yük/toparlanma düzeyi yanıtları da alındı (ort. '+wb.mean.toFixed(1)+'/7); bu, KALICI bir kişilik özelliği değil, şu anki dönemle ilgili bir bağlam notudur ve yukarıdaki kalıcı eğilim tanımlarına karıştırılmamıştır.';
  }

  // 12-14) Güçlü yönler / aşırı kullanım riskleri / gelişim önerileri
  var strengths=[],overuseRisks=[],growth=[];
  Object.keys(PROFILE_CONSTRUCT_NARRATIVE).forEach(function(c){
    var meta=PROFILE_CONSTRUCT_NARRATIVE[c], band=profileBand(bandOf(c));
    if(band==='high'){
      if(meta.strengthHigh) strengths.push(meta.strengthHigh);
      if(meta.overuseHigh) overuseRisks.push(meta.overuseHigh);
      if(meta.growthHigh) growth.push(meta.growthHigh);
    } else if(band==='low'&&meta.growthLow){
      growth.push(meta.growthLow);
    }
  });
  var strengthsBody=strengths.length?strengths.join(' '):'Belirgin biçimde öne çıkan tek bir güçlü yön paterni bu veri setiyle ayırt edilemedi; bu bir eksiklik değildir.';
  var overuseBody=overuseRisks.length?overuseRisks.join(' '):'Belirgin bir aşırı kullanım riski paterni öne çıkmıyor.';
  var growthBody=growth.length?growth.join(' '):'Şu an için öne çıkan somut bir gelişim alanı işaretlenmedi.';

  // 15) Sınırlamalar (sabit, deterministik)
  var limitationsBody='Bu rapor; doğrulanmış klinik norm veya yüzdelik içermez, öz-bildirime dayalıdır, tek bir zaman noktasını yansıtır ve psikometrik doğrulama sürecinden geçmemiş özgün maddeler kullanır. Bu değerlendirme tanı değildir; bir uzmanın klinik değerlendirmesinin yerini tutmaz.';

  return {
    version:'1.0.0',
    generatedAt:new Date().toISOString(),
    preliminary:qCat==='low',
    sections:{
      measurementConfidence:{title:'Ölçüm güveni',body:confidenceBody},
      characterSummary:{title:'Kısa karakter özeti',body:summaryBody},
      bigFive:{title:'Big Five alanları',body:bigFive},
      characterIntegrity:{title:'Karakter bütünlüğü ve epistemik yaklaşım',body:integrity},
      riasec:{title:'RIASEC ilk üç alan',body:riasecBody},
      values:{title:'Değer öncelikleri',body:valuesBody},
      motivation:{title:'Motivasyon kaynakları',body:motivation},
      cognitiveDecision:{title:'Bilişsel stil ve karar verme',body:cognitiveDecision},
      workStyle:{title:'Çalışma tarzı',body:workStyle},
      attachment:{title:'Bağlanma kaygısı ve kaçınması',body:attachmentBody},
      emotionRegulation:{title:'Duygu düzenleme ve öz-şefkat',body:emotionBody},
      strengths:{title:'Güçlü yönler',body:strengthsBody},
      overuseRisks:{title:'Aşırı kullanım riskleri',body:overuseBody},
      growthSuggestions:{title:'Gelişim önerileri',body:growthBody},
      limitations:{title:'Sınırlamalar',body:limitationsBody}
    }
  };
}

  window.SeymaProfile={
    registerProfile:registerProfile,
    PROFILE_DEPENDENCIES:PROFILE_DEPENDENCIES,
    PROFILE_MEMBERS:PROFILE_MEMBERS,
    PROFILE_CONSENT_VERSION:PROFILE_CONSENT_VERSION,
    PROFILE_CONSENT_ITEMS:PROFILE_CONSENT_ITEMS,
    PROFILE_QUALITY_WEIGHTS:PROFILE_QUALITY_WEIGHTS,
    PROFILE_CONSTRUCT_NARRATIVE:PROFILE_CONSTRUCT_NARRATIVE,
    emptyProfileAssessment:emptyProfileAssessment,
    profileAssessmentItems:profileAssessmentItems,
    profileAssessmentComputeCurrentIndex:profileAssessmentComputeCurrentIndex,
    ensureProfileAssessment:ensureProfileAssessment,
    profileConsentChecks:profileConsentChecks,
    profileConsentMandatoryOk:profileConsentMandatoryOk,
    profileConsentRow:profileConsentRow,
    renderProfileConsent:renderProfileConsent,
    profileAssessmentModuleForOrder:profileAssessmentModuleForOrder,
    profileItemDisplayIndex:profileItemDisplayIndex,
    renderProfileItem:renderProfileItem,
    profileAssessmentPendingBreak:profileAssessmentPendingBreak,
    renderProfileBreak:renderProfileBreak,
    renderProfileAssessmentSOS:renderProfileAssessmentSOS,
    renderProfileAssessmentGate:renderProfileAssessmentGate,
    renderProfileCompletion:renderProfileCompletion,
    scoreProfileItem:scoreProfileItem,
    scoreProfileFacet:scoreProfileFacet,
    scoreProfileConstruct:scoreProfileConstruct,
    scoreRiasec:scoreRiasec,
    scoreValues:scoreValues,
    scoreAttachment:scoreAttachment,
    scoreProfileAssessment:scoreProfileAssessment,
    profileAssessmentQualityCategory:profileAssessmentQualityCategory,
    scoreProfileAssessmentQuality:scoreProfileAssessmentQuality,
    profileBand:profileBand,
    profileBandLabel:profileBandLabel,
    profileConstructSentence:profileConstructSentence,
    profileAssessmentContradictionNotes:profileAssessmentContradictionNotes,
    buildProfileReport:buildProfileReport
  };
}());
